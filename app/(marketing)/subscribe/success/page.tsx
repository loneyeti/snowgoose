import React from "react";
import Link from "next/link";
import { Button } from "@/app/_ui/button"; // Import the Button component using named import

// Define the interface for searchParams props provided by Next.js
interface SuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// This is a Server Component
export default async function SubscribeSuccessPage({
  searchParams,
}: SuccessPageProps) {
  // Renamed component
  const sessionId = searchParams?.session_id;

  // Basic check for session ID - Apply similar styling for consistency
  if (!sessionId || typeof sessionId !== "string") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6 text-red-500">
          Checkout Failed
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          There was a problem confirming your subscription status. Session ID
          was missing or invalid.
        </p>
        <Link href="/chat/subscribe" className="text-blue-400 hover:underline">
          Return to Subscriptions
        </Link>
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

  // Apply styling similar to the pricing page container and text
  // Added min-h-screen and justify-center for better vertical alignment
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl border border-gray-700 bg-gray-800/50 rounded-lg p-8 flex flex-col shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-6 text-white">
          Subscription Successful!
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Thank you for subscribing! Your payment was successful and your
          subscription is now active. You can now access all the features of
          your chosen plan.
        </p>
        {/* Optional: Briefly mention a key benefit or next step */}
        <p className="text-lg text-gray-400 mb-10">
          Start exploring advanced AI models, create custom personas, or manage
          your settings.
        </p>

        {/* Use the Button component for the primary action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/chat" legacyBehavior passHref>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Go to Snowgoose Chat
            </Button>
          </Link>
          {/* Secondary action to manage subscription */}
          <Link href="/chat/settings/profile" legacyBehavior passHref>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Manage Subscription
            </Button>
          </Link>
        </div>
        {/* Removed Session ID display as it's not typically needed for users */}
        {/* <p className="text-sm text-gray-500 mt-6">Session ID: {sessionId}</p> */}
      </div>
    </div>
  );
}
