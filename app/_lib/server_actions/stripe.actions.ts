"use server";
"use server";
import Stripe from "stripe";
import { createCheckoutSessionFormSchema } from "../form-schemas";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserSession, getCurrentAPIUser } from "@/app/_lib/auth"; // Import helper functions

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  interval: any;
  price_id: string;
}

export async function getSubscriptionPlans() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("There was an issue getting subscriptions");
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const prices = await stripe.prices.list({
      expand: ["data.product"],
      active: true,
      type: "recurring",
    });

    const plans: Plan[] = prices.data
      .map((price) => {
        // Assert that price.product is a Stripe.Product
        // We add a check to ensure it's not a DeletedProduct either
        const product = price.product as Stripe.Product; // <-- Type Assertion

        // Basic check to ensure it's not a string or deleted product in runtime,
        // though the assertion tells TS to assume it's Product.
        if (
          typeof product !== "object" ||
          product === null ||
          product.deleted
        ) {
          console.warn(
            `Price ${price.id} has an unexpected or deleted product. Skipping.`
          );
          return null; // Skip this price or handle appropriately
        }
        return {
          id: price.id,
          name: product.name,
          description: product.description,
          price: price.unit_amount,
          interval: price.recurring?.interval,
          price_id: price.id,
        };
      })
      .filter((plan) => plan !== null);

    return plans;
  } catch (error) {
    throw new Error("There was an issue getting subscriptions");
  }
}

export async function createCheckoutSessionAction(formData: FormData) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("There was an issue getting subscriptions");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const {
    priceId, // Keep parsing the mcpTool ID from the form
  } = createCheckoutSessionFormSchema.parse({
    priceId: formData.get("priceId"),
  });

  const origin = headers().get("origin");

  // --- Get Authenticated User Auth ID using helper ---
  const userSession = await getUserSession();
  if (!userSession || !userSession.userId) {
    // userId from getUserSession is the Supabase authId
    console.error("Authentication Error: Could not retrieve user session.");
    throw new Error("User must be logged in to subscribe.");
  }
  const userAuthId = userSession.userId;
  // --- End Get Authenticated User ---

  let sessionUrl: string | null = null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass the user's Supabase auth ID to link the session to the user
      client_reference_id: userAuthId,
      // Construct full URLs using the origin
      success_url: `${origin}/chat/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });

    // Check if session URL exists before redirecting
    if (!session.url) {
      console.error("Stripe session URL is missing.");
      throw new Error("Could not create checkout session. Please try again.");
    }

    sessionUrl = session.url; // Assign URL inside try block
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error); // Log the full error server-side
    // Throw a generic error to the client if Stripe API fails
    throw new Error("There was a problem creating the checkout session.");
  }

  // Redirect *after* the try...catch block
  if (sessionUrl) {
    redirect(sessionUrl);
  } else {
    // This case should ideally not be reached if the check inside try works,
    // but it's a safeguard.
    console.error("Session URL was null after try-catch block.");
    throw new Error("Failed to get checkout session URL.");
  }
}

/**
 * Creates a Stripe Billing Portal session for the currently authenticated user.
 * Redirects the user to the Stripe portal to manage their subscription.
 * @returns Promise<{ url?: string; error?: string }> - Object containing the portal URL or an error message.
 */
export async function createCustomerPortalSessionAction(): Promise<{
  url?: string;
  error?: string;
}> {
  "use server";

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is not configured.");
    return { error: "Server configuration error. Please contact support." };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = headers().get("origin");

  if (!origin) {
    console.error("Could not determine request origin.");
    return { error: "Could not determine return URL. Please try again." };
  }
  const returnUrl = `${origin}/settings/profile`; // URL to return to after portal session

  try {
    // Get the full user object, including stripeCustomerId
    const currentUser = await getCurrentAPIUser();

    if (!currentUser) {
      // This should ideally not happen if the page calling this is protected
      return { error: "User not authenticated." };
    }

    if (!currentUser.stripeCustomerId) {
      // User is logged in but hasn't completed a Stripe checkout/doesn't have a customer ID yet.
      console.log(`User ${currentUser.id} does not have a Stripe customer ID.`);
      return { error: "No active subscription found to manage." };
    }

    // Create a Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: currentUser.stripeCustomerId,
      return_url: returnUrl,
    });

    if (!portalSession.url) {
      console.error("Stripe portal session URL is missing after creation.");
      return {
        error:
          "Could not create customer portal session. Please try again later.",
      };
    }

    // Return the URL for redirection on the client-side
    return { url: portalSession.url };
  } catch (error) {
    console.error("Stripe Customer Portal Session Error:", error);
    // Log the specific Stripe error if available
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe Error Code:", error.code);
      console.error("Stripe Error Message:", error.message);
    }
    // Return a generic error message to the user
    return {
      error:
        "An error occurred while accessing subscription management. Please try again later.",
    };
  }
}
