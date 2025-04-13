import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
// Removed: import { buffer } from "node:stream/consumers";
import { userRepository } from "@/app/_lib/db/repositories/user.repository"; // Import the user repository

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Initialize Stripe SDK inside the handler
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil", // Corrected API version
    typescript: true,
  });

  console.log("Stripe webhook started");
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not set.");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  const signature = headers().get("stripe-signature");
  if (!signature) {
    console.error("Missing stripe-signature header");
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
    // console.error("Raw body received:", rawBody);
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log(`Received Stripe event: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);

      // Metadata or client_reference_id should contain our internal user ID
      const clientReferenceId = session.client_reference_id; // Recommended way
      const userId = session.metadata?.userId; // Alternative way

      const userAuthId = clientReferenceId || userId;

      console.log(`Stripe returned local user id: ${userAuthId}`);

      if (!userAuthId) {
        console.error(
          "Webhook Error: Missing user identifier (client_reference_id or metadata.userId) in checkout session:",
          session.id
        );
        // Don't return error to Stripe, as it might retry unnecessarily. Log it and investigate.
        return NextResponse.json({ received: true });
      }

      // Retrieve the subscription details
      if (!session.subscription) {
        console.error(
          "Webhook Error: Checkout session completed event is missing subscription ID:",
          session.id
        );
        console.log(`Subscription: ${session.subscription}`);
        return NextResponse.json({ received: true }); // Acknowledge receipt
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        console.log(
          "Retrieved subscription:",
          subscription.id,
          "for userAuthId:",
          userAuthId
        );

        // --- Database Update Logic ---
        // Use the repository method to update user subscription details
        console.log("Updating user record");
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
            // Reset usage counters if applicable based on your logic
            periodUsage: 0, // Example if resetting usage
          }
        );
        console.log(
          "Successfully updated user subscription details in DB via repository for userAuthId:",
          userAuthId
        );
      } catch (error: any) {
        // The repository's handleError will re-throw, so we catch it here.
        console.error(
          `Webhook Error: Failed to retrieve subscription or update user DB for session ${session.id}:`,
          error
        );
        // Don't return 500 to Stripe unless it's a temporary issue you want retried.
        // If it's a permanent issue (e.g., user not found), log and return 200.
        return NextResponse.json(
          { error: "Failed to process subscription update." },
          { status: 500 }
        ); // Or 200 depending on error
      }
      break;

    case "customer.subscription.updated": {
      // Fired on plan changes, status changes, renewals, etc.
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscription.id);
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      try {
        const updatedUser = await userRepository.updateSubscriptionByCustomerId(
          customerId,
          {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            // Access period dates from the first subscription item for consistency
            stripeCurrentPeriodBegin: new Date(
              subscription.items.data[0].current_period_start * 1000
            ),
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            // Optionally reset usage counters here based on status or plan change
          }
        );

        if (updatedUser) {
          console.log(
            "Successfully updated user subscription details in DB via repository for customerId:",
            customerId
          );
        } else {
          console.warn(
            `Webhook: User with customerId ${customerId} not found during subscription update.`
          );
        }
      } catch (error: any) {
        console.error(
          `Webhook Error: Failed to update user DB for subscription ${subscription.id} (customer ${customerId}):`,
          error
        );
        // Return 500 only if it's a temporary issue you want retried
        return NextResponse.json(
          { error: "Failed to process subscription update." },
          { status: 500 }
        );
      }
      break;
    }

    case "customer.subscription.deleted": {
      // Fired when a subscription is canceled (immediately or at period end)
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription deleted:", subscription.id);
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      try {
        const updatedUser =
          await userRepository.clearSubscriptionByCustomerId(customerId);
        if (updatedUser) {
          console.log(
            "Successfully cleared user subscription details in DB via repository for customerId:",
            customerId
          );
        } else {
          console.warn(
            `Webhook: User with customerId ${customerId} not found during subscription deletion.`
          );
        }
      } catch (error: any) {
        console.error(
          `Webhook Error: Failed to clear user subscription in DB for subscription ${subscription.id} (customer ${customerId}):`,
          error
        );
        // Return 500 only if it's a temporary issue you want retried
        return NextResponse.json(
          { error: "Failed to process subscription deletion." },
          { status: 500 }
        );
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // Use type assertion to bypass potential type mismatch for logging
      const subscriptionId = (invoice as any).subscription;
      console.log(
        `Invoice payment failed for invoice ${invoice.id}, customer ${invoice.customer}, subscription ${subscriptionId ?? "N/A"}`
      );
      // Optional: Notify user, update internal status, restrict access, etc.
      // For now, just logging.
      // You might want to check the subscription status via 'customer.subscription.updated'
      // which often follows a failed payment (status becomes 'past_due' or 'unpaid').
      break;
    }

    // Optional: Handle successful payments if needed for specific actions beyond renewal updates
    // case 'invoice.payment_succeeded': {
    //   const invoice = event.data.object as Stripe.Invoice;
    //   console.log(`Invoice payment succeeded for invoice ${invoice.id}, customer ${invoice.customer}`);
    //   // Often handled by 'customer.subscription.updated' for renewals,
    //   // but useful if you need to trigger actions specifically on payment success.
    //   break;
    // }

    default:
      console.log(`Webhook: Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
