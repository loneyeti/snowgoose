// File: app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { Logger } from "next-axiom";
import prisma from "@/app/_lib/db/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const log = new Logger({ source: "stripe-webhook" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
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

  let event: Stripe.Event;
  let rawBody: string;

  try {
    rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    log.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  log.info(`Received Stripe event: ${event.type}`, { eventId: event.id });

  // --- START OF NEW TRANSACTIONAL LOGIC ---
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Check if the event has already been processed
      const existingEvent = await tx.processedStripeEvent.findUnique({
        where: { id: event.id },
      });

      if (existingEvent) {
        log.warn(`Webhook event ${event.id} already processed. Skipping.`);
        return; // Exit the transaction successfully
      }

      // 2. Main processing logic using the 'tx' transactional client
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userAuthId = session.client_reference_id;

          if (!userAuthId) {
            log.error(
              "Webhook Error: Missing client_reference_id in checkout session",
              { sessionId: session.id }
            );
            return; // Exit transaction
          }

          const logWithUser = log.with({
            userAuthId,
            sessionId: session.id,
            eventId: event.id,
          });

          if (session.mode === "subscription") {
            logWithUser.info(
              "Processing 'subscription' mode checkout session."
            );
            if (!session.subscription) {
              logWithUser.error(
                "Session in subscription mode has no subscription ID."
              );
              return;
            }

            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            const priceId = subscription.items.data[0]?.price.id;

            if (!priceId) {
              logWithUser.error("Subscription is missing a price ID.");
              return;
            }

            // REFACTOR: Use 'tx' instead of userRepository
            await tx.user.update({
              where: { authId: userAuthId },
              data: {
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
                stripeSubscriptionStartDate: new Date(
                  subscription.start_date * 1000
                ),
                stripeSubscriptionStatus: subscription.status,
              },
            });

            // REFACTOR: Use 'tx' to find plan and user, and add credits
            const plan = await tx.subscriptionPlan.findUnique({
              where: { stripePriceId: priceId },
            });
            if (plan && plan.creditsGranted > 0) {
              const user = await tx.user.findUnique({
                where: { authId: userAuthId },
              });
              if (user) {
                await tx.user.update({
                  where: { id: user.id },
                  data: { creditBalance: { increment: plan.creditsGranted } },
                });
                await tx.creditTransaction.create({
                  data: {
                    userId: user.id,
                    creditsAmount: plan.creditsGranted,
                    source: `subscription-start-${plan.name}`,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  },
                });
                logWithUser.info(
                  `Granted ${plan.creditsGranted} initial credits for ${plan.name}.`
                );
              }
            } else {
              logWithUser.warn(
                `No plan or zero credits found for priceId: ${priceId}`
              );
            }
          } else if (session.mode === "payment") {
            logWithUser.info("Processing 'payment' mode checkout session.");

            // REFACTOR: Use 'tx' to find user
            let user = await tx.user.findUnique({
              where: { authId: userAuthId },
            });

            if (!user) {
              logWithUser.error(
                "User not found for one-time purchase credit grant. Aborting."
              );
              return;
            }

            if (!user.stripeCustomerId && session.customer) {
              const stripeCustomerId =
                typeof session.customer === "string"
                  ? session.customer
                  : session.customer.id;
              // REFACTOR: Use 'tx' to update customer ID
              await tx.user.update({
                where: { authId: userAuthId },
                data: { stripeCustomerId },
              });
              logWithUser.info(
                `Saved new Stripe Customer ID (${stripeCustomerId}) to user record.`
              );
            }

            const sessionWithLineItems =
              await stripe.checkout.sessions.retrieve(session.id, {
                expand: ["line_items.data.price.product"],
              });

            const product = sessionWithLineItems.line_items?.data[0]?.price
              ?.product as Stripe.Product;
            if (!product?.metadata?.credits) {
              logWithUser.error(
                "One-time purchase product is missing 'credits' metadata.",
                { productId: product?.id }
              );
              return;
            }

            const creditsToGrant = parseFloat(product.metadata.credits);
            if (isNaN(creditsToGrant) || creditsToGrant <= 0) {
              logWithUser.error("Invalid 'credits' metadata value.", {
                metadataValue: product.metadata.credits,
              });
              return;
            }

            // REFACTOR: Use 'tx' to add credits
            await tx.user.update({
              where: { id: user.id },
              data: { creditBalance: { increment: creditsToGrant } },
            });
            await tx.creditTransaction.create({
              data: {
                userId: user.id,
                creditsAmount: creditsToGrant,
                source: `one-time-purchase-${product.name}`,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            });
            logWithUser.info(
              `Granted ${creditsToGrant} one-time credits for ${product.name}.`
            );
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const logWithSub = log.with({
            subscriptionId: subscription.id,
            eventId: event.id,
          });
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          // REFACTOR: Find user with tx
          const user = await tx.user.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (!user) {
            logWithSub.warn(
              `User with customerId ${customerId} not found. Cannot process update.`
            );
            return;
          }

          const isRenewal =
            event.data.previous_attributes &&
            typeof event.data.previous_attributes === "object" &&
            "current_period_start" in event.data.previous_attributes &&
            "current_period_start" in subscription &&
            event.data.previous_attributes.current_period_start !==
              subscription.current_period_start;

          if (isRenewal) {
            logWithSub.info("Subscription renewal detected.");
            const priceId = subscription.items.data[0]?.price.id;
            // REFACTOR: Find plan with tx
            const plan = priceId
              ? await tx.subscriptionPlan.findUnique({
                  where: { stripePriceId: priceId },
                })
              : null;

            if (plan && plan.creditsGranted > 0) {
              // REFACTOR: Add credits with tx
              await tx.user.update({
                where: { id: user.id },
                data: { creditBalance: { increment: plan.creditsGranted } },
              });
              await tx.creditTransaction.create({
                data: {
                  userId: user.id,
                  creditsAmount: plan.creditsGranted,
                  source: `subscription-renewal-${plan.name}`,
                  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
              });
              logWithSub.info(
                `Granted ${plan.creditsGranted} renewal credits.`
              );
            }
          }

          // REFACTOR: Always update subscription status using tx
          await tx.user.update({
            where: { id: user.id },
            data: {
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
            },
          });
          logWithSub.info(
            `Successfully updated subscription status fields for user.`
          );
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const logWithSub = log.with({
            subscriptionId: subscription.id,
            eventId: event.id,
          });
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          // REFACTOR: Use 'tx' to find and clear subscription
          const user = await tx.user.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (user) {
            await tx.user.update({
              where: { id: user.id },
              data: {
                stripeSubscriptionId: null,
                stripePriceId: null,
                stripeCurrentPeriodBegin: null,
                stripeCurrentPeriodEnd: null,
                stripeSubscriptionStatus: null,
                stripeCancelAtPeriodEnd: null,
              },
            });
            logWithSub.info(
              "Successfully cleared user subscription details in DB."
            );
          } else {
            logWithSub.warn(
              `User with customerId ${customerId} not found during deletion.`
            );
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          log.warn(`Invoice payment failed`, {
            invoiceId: invoice.id,
            customerId: invoice.customer,
            subscriptionId: (invoice as any).subscription ?? "N/A",
            eventId: event.id,
          });
          break;
        }

        default:
          log.info(`Unhandled event type received: ${event.type}`, {
            eventId: event.id,
          });
      }

      // 3. Mark the event as processed
      await tx.processedStripeEvent.create({
        data: { id: event.id },
      });
    });

    // If transaction is successful, return 200 OK to Stripe
    log.info(`Successfully processed event ${event.id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    log.error(`Error in webhook transaction for event ${event.id}`, { error });
    // If the transaction fails, return a 500 to let Stripe retry
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
  // --- END OF NEW TRANSACTIONAL LOGIC ---
}
