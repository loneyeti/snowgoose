// This remains a Server Component to export metadata
import React from "react";
import type { Metadata } from "next";
import MarketingClientPage from "./_components/marketing-client-page"; // Import the new client component

export const metadata: Metadata = {
  title: "Snowgoose | Unified AI Platform for ChatGPT, Claude & More",
  description:
    "Access OpenAI GPT 5, o3, Anthropic Claude 4, Google Gemini 2.5 Pro, Deepseek, and more AI models through one subscription. Try the free demo.",
  alternates: {
    canonical: "https://snowgoose.app",
  },
  openGraph: {
    title:
      "Snowgoose | All AI Models, One Subscription (GPT 5, Claude 4, Gemini)",
    description:
      "Stop juggling multiple AI subscriptions and get access to all leading AI models.",
    url: "https://snowgoose.app",
    siteName: "Snowgoose",
    images: [
      {
        url: "https://snowgoose.app/og.png", // Create a compelling OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Snowgoose | All AI Models, One Subscription (GPT 5, Claude 4, Gemini)",
    description:
      "Stop juggling AI subscriptions. Access GPT 5, Claude 4, Gemini, and more with one account.",
    creator: "@snowgooseai",
    images: ["https://snowgoose.app/og.png"],
  },
};

// This Server Component now just renders the Client Component
export default function MarketingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Snowgoose",
    description:
      "Access top AI models like GPT 5, Claude 4, and Gemini through a single, unified platform with credits that roll over for a full year.",
    url: "https://snowgoose.app/",
    browserRequirements:
      "Requires a modern web browser with JavaScript enabled.",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "10.00",
      offerCount: "4",
      offers: [
        {
          "@type": "Offer",
          name: "Snowgoose Basic",
          price: "10.00",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            price: 10.0,
            priceCurrency: "USD",
            valueAddedTaxIncluded: false,
            unitText: "month",
          },
        },
        {
          "@type": "Offer",
          name: "Snowgoose Premium",
          price: "20.00",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            price: 20.0,
            priceCurrency: "USD",
            valueAddedTaxIncluded: false,
            unitText: "month",
          },
        },
        // It's good practice to include all offers if possible
        {
          "@type": "Offer",
          name: "Small Credit Pack",
          price: "10.00",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Large Credit Pack",
          price: "30.00",
          priceCurrency: "USD",
        },
      ],
    },
    // Optional but recommended properties from CreativeWork
    publisher: {
      "@type": "Organization",
      name: "Lone Yeti Developments", // Your company name
    },
    mainEntity: {
      "@type": "WebPage",
      "@id": "https://snowgoose.app/#faq",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingClientPage />
    </>
  );
}
