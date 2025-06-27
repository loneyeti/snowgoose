import React from "react";
import Link from "next/link";
import { Button } from "@/app/_ui/button";

// Define the interface for searchParams props provided by Next.js
interface PurchaseSuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// This is a Server Component for one-time purchase success
export default async function PurchaseSuccessPage({
  searchParams,
}: PurchaseSuccessPageProps) {
  const sessionId = searchParams?.session_id;

  // Basic check for session ID
  if (!sessionId || typeof sessionId !== "string") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6 text-red-500">
          Purchase Confirmation Failed
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          There was a problem confirming your purchase status. The session ID
          was missing or invalid.
        </p>
        <Link href="/pricing" className="text-blue-400 hover:underline">
          Return to Pricing
        </Link>
      </div>
    );
  }

  // NOTE: You can optionally retrieve session details from Stripe here
  // to verify the payment status ('paid') and show more specific info.
  // For now, we assume a successful redirect means a successful payment.

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl border border-gray-700 bg-gray-800/50 rounded-lg p-8 flex flex-col shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-6 text-white">
          Purchase Successful!
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Thank you for your purchase! Your credits have been added to your
          account and are ready to use.
        </p>
        <p className="text-lg text-gray-400 mb-10">
          You can now use your new credits to access all AI models, generate
          images, and perform web searches.
        </p>

        {/* Buttons for next actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/chat" legacyBehavior passHref>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Go to Snowgoose Chat
            </Button>
          </Link>
          <Link href="/chat/settings/profile" legacyBehavior passHref>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              View Account Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
