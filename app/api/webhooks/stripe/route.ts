import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { userRepository } from "@/app/_lib/db/repositories/user.repository"; // Import the user repository
import { Logger } from "next-axiom"; // Import Axiom Logger

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const log = new Logger({ source: "stripe-webhook" }); // Instantiate Axiom Logger

  // Initialize Stripe SDK inside the handler
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil", // Corrected API version
    typescript: true,
  });

  log.info("Stripe webhook processing started");
  if (!webhookSecret) {
    log.error("Stripe webhook secret is not set.");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  const signature = headers().get("stripe-signature");
  if (!signature) {
    log.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // Read the raw body using req.text() for signature verification
  // Removed: const rawBody = await buffer(req.body! as any);

  let event: Stripe.Event;
  let rawBody: string; // Define rawBody to store the text

  try {
    rawBody = await req.text(); // Get the raw body as text
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    // Log the raw body on error for debugging (optional, consider security implications)
    // log.error("Raw body received:", rawBody);
    log.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  log.info(`Received Stripe event: ${event.type}`, { eventType: event.type });

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      log.info("Processing checkout.session.completed", {
        sessionId: session.id,
      });

      // Metadata or client_reference_id should contain our internal user ID
      const clientReferenceId = session.client_reference_id; // Recommended way
      const userId = session.metadata?.userId; // Alternative way

      const userAuthId = clientReferenceId || userId;

      log.info("Extracted userAuthId from session", {
        userAuthId,
        sessionId: session.id,
      });

      if (!userAuthId) {
        log.error(
          "Webhook Error: Missing user identifier (client_reference_id or metadata.userId) in checkout session",
          { sessionId: session.id }
        );
        // Permanent error: Cannot link session to user. Acknowledge receipt (200).
        return NextResponse.json({ received: true });
      }

      // Retrieve the subscription details
      if (!session.subscription) {
        log.error(
          "Webhook Error: Checkout session completed event is missing subscription ID",
          { sessionId: session.id, subscriptionId: session.subscription }
        );
        // Permanent error: Cannot retrieve subscription. Acknowledge receipt (200).
        return NextResponse.json({ received: true }); // Acknowledge receipt
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        log.info("Retrieved subscription details from Stripe", {
          subscriptionId: subscription.id,
          userAuthId: userAuthId,
          sessionId: session.id,
        });

        // --- Database Update Logic ---
        log.info("Attempting to update user record in DB", { userAuthId });
        const updatedUser = await userRepository.updateSubscriptionByAuthId(
          userAuthId,
          {
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id, // Assumes one subscription item
            // Access period dates from the first subscription item (Stripe API 2025-03-31.basil change)
            stripeCurrentPeriodBegin: new Date(
              subscription.items.data[0].current_period_start * 1000
            ),
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            stripeSubscriptionStartDate: new Date(
              subscription.start_date * 1000 // start_date is still on the Subscription object
            ),
            stripeSubscriptionStatus: subscription.status, // Pass the status
            // Reset usage counters if applicable based on your logic
            periodUsage: 0, // Example if resetting usage - Handled by repo now
          }
        );

        // Check if user was found and updated
        if (updatedUser) {
          log.info(
            "Successfully updated user subscription details in DB via repository",
            { userAuthId: userAuthId, subscriptionId: subscription.id }
          );
        } else {
          // This case should ideally be caught by the repo throwing an error if user not found by authId
          log.error(
            "Webhook Error: User not found by authId during checkout.session.completed update",
            { userAuthId: userAuthId, sessionId: session.id }
          );
          // Permanent error: User doesn't exist. Acknowledge receipt (200).
          return NextResponse.json({ received: true });
        }
      } catch (error: any) {
        // Log the error from DB operation (potentially transient)
        log.error(
          `Webhook Error: Database operation failed during checkout.session.completed for session ${session.id}`,
          {
            error: error.message || error,
            userAuthId: userAuthId,
            sessionId: session.id,
          }
        );
        // Return 500 to indicate a potential transient issue for retry.
        return NextResponse.json(
          {
            error:
              "Failed to process subscription update due to database error.",
          },
          { status: 500 }
        );
      }
      break;
    } // End checkout.session.completed

    case "customer.subscription.updated": {
      // Fired on plan changes, status changes, renewals, etc.
      const subscription = event.data.object as Stripe.Subscription;
      log.info("Processing customer.subscription.updated", {
        subscriptionId: subscription.id,
      });
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      try {
        const updatedUser = await userRepository.updateSubscriptionByCustomerId(
          customerId,
          {
            // Pass necessary fields to the repository method
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            // Access period dates from the first subscription item for consistency
            stripeCurrentPeriodBegin: new Date(
              subscription.items.data[0].current_period_start * 1000
            ),
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            stripeSubscriptionStatus: subscription.status, // Pass the status
            stripeCancelAtPeriodEnd: subscription.cancel_at_period_end, // Pass the cancel flag
            // Optionally reset usage counters here based on status or plan change
          }
        );

        // Check if user was found and updated (repo returns null if not found)
        if (updatedUser) {
          log.info(
            "Successfully updated user subscription details in DB via repository",
            { customerId: customerId, subscriptionId: subscription.id }
          );
        } else {
          // User not found by customerId - this is a permanent issue for this event.
          log.warn(
            `Webhook: User with customerId ${customerId} not found during customer.subscription.updated.`,
            { customerId: customerId, subscriptionId: subscription.id }
          );
          // Acknowledge receipt (200) as retrying won't help.
          return NextResponse.json({ received: true });
        }
      } catch (error: any) {
        // Log the error from DB operation (potentially transient)
        log.error(
          `Webhook Error: Database operation failed during customer.subscription.updated for subscription ${subscription.id}`,
          {
            error: error.message || error,
            customerId: customerId,
            subscriptionId: subscription.id,
          }
        );
        // Return 500 to indicate a potential transient issue for retry.
        return NextResponse.json(
          {
            error:
              "Failed to process subscription update due to database error.",
          },
          { status: 500 }
        );
      }
      break;
    } // End customer.subscription.updated

    case "customer.subscription.deleted": {
      // Fired when a subscription is canceled (immediately or at period end)
      const subscription = event.data.object as Stripe.Subscription;
      log.info("Processing customer.subscription.deleted", {
        subscriptionId: subscription.id,
      });
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      try {
        const updatedUser =
          await userRepository.clearSubscriptionByCustomerId(customerId);

        // Check if user was found and updated (repo returns null if not found)
        if (updatedUser) {
          log.info(
            "Successfully cleared user subscription details in DB via repository",
            { customerId: customerId, subscriptionId: subscription.id }
          );
        } else {
          // User not found by customerId - this is a permanent issue for this event.
          log.warn(
            `Webhook: User with customerId ${customerId} not found during customer.subscription.deleted.`,
            { customerId: customerId, subscriptionId: subscription.id }
          );
          // Acknowledge receipt (200) as retrying won't help.
          return NextResponse.json({ received: true });
        }
      } catch (error: any) {
        // Log the error from DB operation (potentially transient)
        log.error(
          `Webhook Error: Database operation failed during customer.subscription.deleted for subscription ${subscription.id}`,
          {
            error: error.message || error,
            customerId: customerId,
            subscriptionId: subscription.id,
          }
        );
        // Return 500 to indicate a potential transient issue for retry.
        return NextResponse.json(
          {
            error:
              "Failed to process subscription deletion due to database error.",
          },
          { status: 500 }
        );
      }
      break;
    } // End customer.subscription.deleted

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // Use type assertion to bypass potential type mismatch for logging
      const subscriptionId = (invoice as any).subscription;
      log.warn(`Invoice payment failed`, {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        subscriptionId: subscriptionId ?? "N/A",
      });
      // Optional: Notify user, update internal status, restrict access, etc.
      // For now, just logging.
      // You might want to check the subscription status via 'customer.subscription.updated'
      // which often follows a failed payment (status becomes 'past_due' or 'unpaid').
      break;
    }

    // Optional: Handle successful payments if needed for specific actions beyond renewal updates
    // case 'invoice.payment_succeeded': { // Example if needed
    //   const invoice = event.data.object as Stripe.Invoice;
    //   log.info(`Invoice payment succeeded`, { invoiceId: invoice.id, customerId: invoice.customer });
    //   // Often handled by 'customer.subscription.updated' for renewals,
    //   // but useful if you need to trigger actions specifically on payment success.
    //   break;
    // }

    default:
      log.info(`Webhook: Received unhandled event type`, {
        eventType: event.type,
      });
  }

  // Return a 200 response to acknowledge receipt of the event if processing reached this point
  log.info("Stripe webhook processing finished successfully", {
    eventType: event.type,
  });
  return NextResponse.json({ received: true });
}
