import React from "react";
import Link from "next/link";

// Define the interface for searchParams props provided by Next.js
interface SuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// This is a Server Component
export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams?.session_id;

  // Basic check for session ID
  if (!sessionId || typeof sessionId !== "string") {
    return (
      <div>
        <h1>Checkout Failed</h1>
        <p>
          There was a problem confirming your subscription status. Session ID
          was missing or invalid.
        </p>
        <Link href="/subscriptions">Return to Subscriptions</Link>
      </div>
    );
  }

  // --- Optional: Retrieve session details from Stripe ---
  // You could add code here to:
  // 1. Initialize Stripe with the secret key
  // 2. Call stripe.checkout.sessions.retrieve(sessionId)
  // 3. Verify the session status (e.g., payment_status === 'paid')
  // 4. Display more specific information or update user status in your DB
  // Remember to handle potential errors from the Stripe API call.
  // ---

  return (
    <div>
      <h1>Subscription Successful!</h1>
      <p>
        Thank you for subscribing! Your payment was successful and your
        subscription is now active.
      </p>
      <p>Session ID: {sessionId}</p> {/* Displaying for confirmation */}
      <Link href="/chat">Go to Snowgoose</Link>
      <br />
      <Link href="/subscriptions">Manage Subscriptions</Link>
    </div>
  );
}
