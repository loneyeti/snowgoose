// This remains a Server Component to export metadata
import React from "react";
import type { Metadata } from "next";
import MarketingClientPage from "./_components/marketing-client-page"; // Import the new client component

export const metadata: Metadata = {
  title:
    "Snowgoose: Unified Access to Premium AI Models (GPT-4.1, Claude 3.7+)",
  description:
    "Simplify your AI workflow with Snowgoose. Access GPT-4.1, Claude 3.7, Gemini & more via one interface with simple, predictable pricing starting at $5/month. Try the free demo!",
  // Add other relevant meta tags if needed, e.g., keywords (though less impactful now), open graph tags
};

// This Server Component now just renders the Client Component
export default function MarketingPage() {
  return <MarketingClientPage />;
}
