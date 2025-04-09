// src/app/subscriptions/page.tsx (or wherever your component lives)

// No longer need loadStripe here
// import { loadStripe } from "@stripe/stripe-js";

// Import the Server Actions
import {
  getSubscriptionPlans,
  createCheckoutSessionAction,
  Plan,
} from "@/app/_lib/server_actions/stripe.actions"; // Adjusted import path

// This is now a Server Component (no "use client")
export default async function SubscribePage() {
  // Renamed component
  // No longer need the public key check here unless used elsewhere
  // if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  //   throw new Error("There was a problem loading products");
  // }
  // No longer need stripePromise
  // const stripePromise = loadStripe(
  //   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  // );

  let plans: Plan[] = [];
  let errorLoadingPlans = null;

  try {
    plans = await getSubscriptionPlans();
  } catch (error) {
    console.error("Failed to load plans in component:", error);
    errorLoadingPlans =
      error instanceof Error
        ? error.message
        : "An unknown error occurred loading plans.";
  }

  // Removed the client-side handleSubscribe function

  return (
    <div>
      <h1>Choose a Subscription Plan</h1>

      {errorLoadingPlans && (
        <p style={{ color: "red" }}>Error: {errorLoadingPlans}</p>
      )}

      {plans.length === 0 && !errorLoadingPlans && (
        <p>No subscription plans available at the moment.</p>
      )}

      {plans.map((plan) => (
        <div
          key={plan.id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>
            {/* Fixed price calculation - ensure price is not null/undefined */}
            Price: ${plan.price ? (plan.price / 100).toFixed(2) : "N/A"} /{" "}
            {plan.interval} {/* Corrected price display */}
          </p>
          {/* Use a form to trigger the Server Action */}
          <form action={createCheckoutSessionAction}>
            {/* Hidden input to pass the priceId */}
            <input type="hidden" name="priceId" value={plan.price_id} />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      ))}
    </div>
  );
}
