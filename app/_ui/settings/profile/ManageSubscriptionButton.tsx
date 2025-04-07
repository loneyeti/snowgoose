"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_ui/button"; // Corrected import path

// Define the expected shape of the server action function
type CreatePortalSessionAction = () => Promise<{
  url?: string;
  error?: string;
}>;

interface ManageSubscriptionButtonProps {
  createPortalSessionAction: CreatePortalSessionAction;
}

export default function ManageSubscriptionButton({
  createPortalSessionAction,
}: ManageSubscriptionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await createPortalSessionAction();

      if (result.error) {
        toast.error(result.error); // Display error message using toast
      } else if (result.url) {
        // Redirect the user to the Stripe Customer Portal
        window.location.href = result.url;
      } else {
        // Fallback error if neither url nor error is returned
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant="secondary" // Example variant, adjust as needed
    >
      {isPending ? "Processing..." : "Manage Subscription"}
    </Button>
  );
}
