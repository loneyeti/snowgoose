import React from "react";
import PurchaseButton from "@/app/_ui/marketing/PurchaseButton"; // Import the new button

export default function PricingPage() {
  // Placeholder data - replace with actual data fetched from Stripe/DB later
  // IMPORTANT: Replace 'price_basic_placeholder' and 'price_prof_placeholder'
  // with actual Stripe Price IDs from your Stripe dashboard.
  const plans = [
    {
      name: "Basic",
      price: "$5",
      frequency: "/ month",
      description: "Explore the power of frontier AI affordably.",
      features: [
        "Access to leading models (GPT-4o, Claude 3.5, Gemini)",
        "Includes [$X value] of API usage*", // TODO: Replace with actual value
        "Standard Persona library",
        "All Output Formats",
      ],
      cta: "Get Started Basic",
      priceId: "price_basic_placeholder", // Placeholder Stripe Price ID
    },
    {
      name: "Professional",
      price: "$29", // Example price
      frequency: "/ month",
      description: "For professionals and creators needing more power.",
      features: [
        "Everything in Basic, plus:",
        "Higher API usage allowance [$Y value]*", // TODO: Replace with actual value
        "Create Custom Personas",
        "Priority access to new features",
      ],
      cta: "Choose Professional",
      priceId: "price_prof_placeholder", // Placeholder Stripe Price ID
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
        {" "}
        {/* Lighter text */}
        Stop guessing your AI costs. Snowgoose offers simple, fixed monthly
        pricing.
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
          {" "}
          {/* Lighter text */}
          Directly using models like GPT-4o or Claude 3.5 involves complex
          token-based billing that can fluctuate wildly. A few large requests
          could significantly impact your monthly bill. Snowgoose provides a
          predictable cost structure, letting you leverage powerful AI without
          budget surprises. Our $5 Basic plan offers incredible value for
          accessing multiple frontier models.
        </p>
        {/* Add more detailed comparison if possible */}
      </section>
    </div>
  );
}
