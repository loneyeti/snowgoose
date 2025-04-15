import React from "react";
import PurchaseButton from "@/app/_ui/marketing/PurchaseButton"; // Import the new button
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snowgoose Pricing | Affordable AI Access from $5/Month",
  description:
    "Simple, predictable pricing for unified access to frontier AI models like GPT-4.1 and Claude 3.7. Plans start at just $5/month. Compare Basic and Premium.",
};

export default function PricingPage() {
  // Placeholder data - replace with actual data fetched from Stripe/DB later
  // IMPORTANT: Replace 'price_basic_placeholder' and 'price_prof_placeholder'
  // with actual Stripe Price IDs from your Stripe dashboard.
  const plans = [
    {
      name: "Basic",
      price: "$5",
      frequency: "/ month",
      description: "Explore the power of frontier AI models affordably.",
      features: [
        "Access leading models (OpenAI GPT-4.1, Anthropic Claude 3.5, Google Gemini & more)",
        "Includes generous API usage credits* ([$5 value])", // Clarified value
        "Standard AI Persona library",
        "All Output Formats (Markdown, JSON, HTML, CSV)", // Explicit formats
      ],
      cta: "Get Started Basic",
      priceId: "price_1RDaeGCDpyWvUPu8lOlP4xMZ", // Placeholder Stripe Price ID
    },
    {
      name: "Premium",
      price: "$20", // Example price
      frequency: "/ month",
      description:
        "Maximize your AI power with significantly more usage and exclusive features.",
      features: [
        "Everything in Basic, plus:",
        "5x More API usage credits* ([$25 value])", // Clarified value
        "Create & manage Custom AI Personas", // Added custom personas
        "Priority access to new features & models", // Added models
      ],
      cta: "Choose Premium",
      priceId: "price_1RDeNkCDpyWvUPu8FPHKaPMF", // Placeholder Stripe Price ID
    },
    // Add Enterprise plan if needed
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-6 text-white">
        {" "}
        {/* Ensure white heading */}
        Predictable AI Power. Unbeatable Value.
      </h1>
      <p className="text-xl text-gray-300 text-center mb-12">
        Stop guessing your AI costs with complex token billing. Snowgoose offers
        simple, fixed monthly pricing for unified access to frontier AI models,
        starting at just $5.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="border border-gray-700 bg-gray-800/50 rounded-lg p-8 flex flex-col shadow-lg"
          >
            {" "}
            {/* Adjusted card style */}
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {plan.name}
            </h2>{" "}
            {/* Ensure white heading */}
            <p className="text-gray-400 mb-4">{plan.description}</p>{" "}
            {/* Lighter text */}
            <p className="text-4xl font-bold mb-1 text-white">
              {" "}
              {/* Ensure white price */}
              {plan.price}
              <span className="text-lg font-normal text-gray-400">
                {" "}
                {/* Lighter text */}
                {plan.frequency}
              </span>
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-8 mt-4 space-y-2 flex-grow">
              {" "}
              {/* Lighter text */}
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {/* Replace Link with PurchaseButton */}
            <PurchaseButton priceId={plan.priceId} ctaText={plan.cta} />
          </div>
        ))}
      </div>

      <div className="text-center mt-12 text-gray-400">
        {" "}
        {/* Lighter text */}
        <p>
          * API usage allowance details will be based on underlying model costs.
          We aim for transparency.
        </p>
        {/* Add FAQ section later */}
      </div>

      {/* Comparison Section Placeholder */}
      <section className="mt-16 pt-12 border-t border-gray-700">
        {" "}
        {/* Adjusted border color */}
        <h3 className="text-2xl font-semibold text-center mb-6 text-white">
          {" "}
          {/* Ensure white heading */}
          Why Snowgoose Pricing Makes Sense
        </h3>
        <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
          Accessing top models like GPT-4.1 and Claude 3.7 directly often
          requires separate $20/month subscriptions to each provider (OpenAI,
          Anthropic, etc.) plus managing complex, unpredictable token-based
          billing. Snowgoose eliminates this hassle. Get unified access to
          multiple frontier AI models through a single, affordable subscription
          starting at just $5. Your plan includes generous API usage credits,
          offering a straightforward, predictable billing experience without
          budget surprises or the need to manage multiple accounts.
        </p>
        {/* Add more detailed comparison if possible */}
      </section>
    </div>
  );
}
