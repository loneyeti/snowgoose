// This remains a Server Component to export metadata
import React from "react";
import type { Metadata } from "next";
import MarketingClientPage from "./_components/marketing-client-page"; // Import the new client component

export const metadata: Metadata = {
  // SEO Suggestion #1: Optimized Title and Meta Description
  title:
    "Snowgoose - Access All AI Models (GPT-4.1, Claude, Gemini) in One Platform",
  description:
    "Access OpenAI GPT-4, Anthropic Claude, Google Gemini, and more AI models through one simple subscription. Credits roll over for 1 year. Try the free demo.",
  // Add other relevant meta tags if needed, e.g., keywords (though less impactful now), open graph tags
};

// This Server Component now just renders the Client Component
export default function MarketingPage() {
  return <MarketingClientPage />;
}
