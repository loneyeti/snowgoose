import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { userRepository } from "@/app/_lib/db/repositories/user.repository";
import { SubscriptionPlanRepository } from "@/app/_lib/db/repositories/subscription-plan.repository";
import { creditRepository } from "@/app/_lib/db/repositories/credit.repository";
import { Logger } from "next-axiom";

const subscriptionPlanRepository = new SubscriptionPlanRepository();

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
      const userAuthId = session.client_reference_id;

      if (!userAuthId) {
        log.error(
          "Webhook Error: Missing client_reference_id in checkout session",
          { sessionId: session.id }
        );
        return NextResponse.json({ received: true });
      }

      const logWithUser = log.with({ userAuthId, sessionId: session.id });

      // --- HANDLE SUBSCRIPTION CREATION ---
      if (session.mode === "subscription") {
        logWithUser.info("Processing 'subscription' mode checkout session.");
        if (!session.subscription) {
          logWithUser.error(
            "Session in subscription mode has no subscription ID."
          );
          return NextResponse.json({ received: true });
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;

        if (!priceId) {
          logWithUser.error("Subscription is missing a price ID.");
          return NextResponse.json({ received: true });
        }

        // Update user's Stripe details in the DB
        await userRepository.updateSubscriptionByAuthId(userAuthId, {
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodBegin: new Date(
            subscription.items.data[0].current_period_start * 1000
          ),
          stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
          stripeSubscriptionStartDate: new Date(subscription.start_date * 1000),
          stripeSubscriptionStatus: subscription.status,
        });

        // Grant initial credits for the new subscription
        const plan =
          await subscriptionPlanRepository.findByStripePriceId(priceId);
        if (plan && plan.creditsGranted > 0) {
          const user = await userRepository.findByAuthId(userAuthId);
          if (user) {
            await creditRepository.addCredits(
              user.id,
              plan.creditsGranted,
              `subscription-start-${plan.name}`,
              365
            );
            logWithUser.info(
              `Granted ${plan.creditsGranted} initial credits for ${plan.name}.`
            );
          }
        } else {
          logWithUser.warn(
            `No plan or zero credits found for priceId: ${priceId}`
          );
        }
      }
      // --- HANDLE ONE-TIME PURCHASE ---
      else if (session.mode === "payment") {
        logWithUser.info("Processing 'payment' mode checkout session.");
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          { expand: ["line_items.data.price.product"] }
        );

        const price = sessionWithLineItems.line_items?.data[0]?.price;
        const product = price?.product as Stripe.Product;

        if (!product?.metadata?.credits) {
          logWithUser.error(
            "One-time purchase product is missing 'credits' metadata.",
            { productId: product?.id }
          );
          return NextResponse.json({ received: true });
        }

        const creditsToGrant = parseInt(product.metadata.credits, 10);
        if (isNaN(creditsToGrant) || creditsToGrant <= 0) {
          logWithUser.error("Invalid 'credits' metadata value.", {
            metadataValue: product.metadata.credits,
          });
          return NextResponse.json({ received: true });
        }

        // Find user by authId to get the internal DB id
        const user = await userRepository.findByAuthId(userAuthId);
        if (!user) {
          logWithUser.error(
            "User not found for one-time purchase credit grant."
          );
          return NextResponse.json({ received: true });
        }

        await creditRepository.addCredits(
          user.id,
          creditsToGrant,
          `one-time-purchase-${product.name}`,
          365
        );
        logWithUser.info(
          `Granted ${creditsToGrant} one-time credits for ${product.name}.`
        );
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const logWithSub = log.with({ subscriptionId: subscription.id });

      // --- HANDLE RENEWALS ---
      // Check if the billing cycle has just started (i.e., it's a renewal payment)
      const previousAttributes = event.data.previous_attributes;
      let isRenewal = false;
      if (
        previousAttributes &&
        "current_period_start" in previousAttributes &&
        "current_period_start" in subscription &&
        previousAttributes.current_period_start !==
          subscription.current_period_start
      ) {
        isRenewal = true;
      }
      if (isRenewal) {
        logWithSub.info("Subscription renewal detected.");
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        const priceId = subscription.items.data[0]?.price.id;

        // Find user by customer ID - need to use existing method
        const user = await userRepository.findByStripeCustomerId(customerId);
        const plan = priceId
          ? await subscriptionPlanRepository.findByStripePriceId(priceId)
          : null;

        if (user && plan && plan.creditsGranted > 0) {
          await creditRepository.addCredits(
            user.id,
            plan.creditsGranted,
            `subscription-renewal-${plan.name}`,
            365
          );
          logWithSub.info(
            `Granted ${plan.creditsGranted} renewal credits for user ${user.id}.`
          );
        } else {
          logWithSub.warn(
            "Could not grant renewal credits. User or Plan not found, or credits is zero.",
            { userId: user?.id, planId: plan?.id }
          );
        }
      }

      // --- UPDATE SUBSCRIPTION STATUS (Always run this on update) ---
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      try {
        // This repository method now ONLY updates Stripe fields, it does not reset usage.
        await userRepository.updateSubscriptionByCustomerId(customerId, {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodBegin: new Date(
            subscription.items.data[0].current_period_start * 1000
          ),
          stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
          stripeSubscriptionStatus: subscription.status,
          stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        logWithSub.info(
          `Successfully updated user subscription status fields for customerId: ${customerId}.`
        );
      } catch (error: any) {
        logWithSub.error(
          "Database operation failed during customer.subscription.updated",
          { error: error.message || error }
        );
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
      break;
    }

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
