"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/client";
import { createCheckoutSessionAction } from "@/app/_lib/server_actions/stripe.actions";
import { User } from "@supabase/supabase-js";

interface PurchaseButtonProps {
  priceId: string; // Stripe Price ID
  ctaText: string;
  highlight?: boolean; // Optional prop to change styling
}

export default function PurchaseButton({
  priceId,
  ctaText,
  highlight = false, // Default to false if not provided
}: PurchaseButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition(); // For server action loading state

  const handlePurchase = async () => {
    setIsLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // Not logged in, redirect to login, passing the intended priceId
      // The login page would need logic to handle this redirect after login
      console.log("User not logged in, redirecting to login.");
      router.push(`/login?priceId=${priceId}&redirect_to=/chat/subscribe`); // Redirect to login, planning to go to subscribe page after
      // No need to setIsLoading(false) here as we are navigating away
      return;
    }

    // User is logged in, proceed to create checkout session
    startTransition(async () => {
      try {
        // Create FormData and append priceId
        const formData = new FormData();
        formData.append("priceId", priceId);

        // Call the server action with FormData
        // A successful call will trigger a server-side redirect
        await createCheckoutSessionAction(formData);

        // If the action throws an error, it will be caught below.
        // If it succeeds, the browser will be redirected by the server,
        // so we don't need to handle success explicitly here.
        // We might not even reach the end of the try block if redirect happens.
        console.log("Checkout session creation initiated (redirect expected).");
      } catch (error) {
        // Catch errors thrown by the server action
        console.error("Error during checkout session creation:", error);
        // Display a user-friendly message
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again."
        );
        setIsLoading(false);
      }
    });
  };

  const isProcessing = isLoading || isPending;

  return (
    <button
      onClick={handlePurchase}
      disabled={isProcessing}
      className={`block w-full text-center font-semibold py-3 rounded-md shadow-sm transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        isProcessing
          ? "opacity-50 cursor-not-allowed"
          : highlight
            ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600" // Highlighted style
            : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white" // Standard style
      }`}
    >
      {isProcessing ? "Processing..." : ctaText}
    </button>
  );
}
