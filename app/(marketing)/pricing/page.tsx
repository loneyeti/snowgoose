import React from "react";
import PurchaseButton from "@/app/_ui/marketing/PurchaseButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snowgoose Pricing | AI Access with Credits That Never Expire",
  description:
    "Flexible pricing for unified AI access. Monthly plans from $10 with rollover credits or one-time credit packages. Access GPT 5, Claude, Gemini and more.",
};

export default function PricingPage() {
  // Monthly subscription plans
  const monthlyPlans = [
    {
      name: "Basic",
      price: "$10",
      frequency: "/ month",
      credits: "800 credits",
      description: "Perfect for exploring AI capabilities and regular use.",
      features: [
        "800 monthly credits that roll over",
        "Credits valid for 1 year",
        "~2,000 GPT 5 prompts per month",
        "Access to all AI models",
        "Web search & image generation",
        "All output formats",
        "Standard AI personas",
      ],
      cta: "Start Basic Plan",
      priceId: "price_1RDaeGCDpyWvUPu8lOlP4xMZ", // Replace with actual Stripe ID
      popular: false,
      mode: "subscription",
    },
    {
      name: "Premium",
      price: "$20",
      frequency: "/ month",
      credits: "1,900 credits",
      description: "Ideal for power users and professionals who need more.",
      features: [
        "1,900 monthly credits that roll over",
        "Credits valid for 1 year",
        "~4,750 GPT 5 prompts per month",
        "Everything in Basic, plus:",
        "2.4x more credits for the same per-credit cost",
        "Priority support",
        "Early access to new features",
      ],
      cta: "Get Premium Plan",
      priceId: "price_1RDeNkCDpyWvUPu8FPHKaPMF", // Replace with actual Stripe ID
      popular: true,
      mode: "subscription",
    },
  ] as const;

  // One-time credit packages
  const creditPackages = [
    {
      name: "Small Credit Package",
      price: "$10",
      credits: "600 credits",
      description: "Top up when you need extra credits.",
      features: [
        "600 credits valid for 1 year",
        "~1,500 GPT 5 prompts",
        "Perfect for project bursts",
        "No monthly commitment",
      ],
      cta: "Buy Credits",
      priceId: "price_1RdLsGCDpyWvUPu81rlZqCLW", // Replace with actual Stripe ID
      mode: "payment",
    },
    {
      name: "Large Credit Package",
      price: "$30",
      credits: "2,000 credits",
      description: "Best value for occasional heavy users.",
      features: [
        "2,000 credits valid for 1 year",
        "~5,000 GPT 5 prompts",
        "Great for teams or projects",
        "No monthly commitment",
      ],
      cta: "Buy Credits",
      priceId: "price_1RdLulCDpyWvUPu8wpgHB1E7", // Replace with actual Stripe ID
      mode: "payment",
    },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Credits That Roll Over. No More Waste.
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Unlike other AI services, your unused Snowgoose credits roll over
          month-to-month and stay valid for a full year. Pay for what you need,
          use it when you want.
        </p>
      </div>

      {/* Monthly Plans Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-white">
          Monthly Plans
        </h2>
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
          Best value for regular users. Fresh credits every month, all unused
          credits roll over automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {monthlyPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border ${
                plan.popular
                  ? "border-blue-500 shadow-blue-500/20"
                  : "border-gray-700"
              } bg-gray-800/50 rounded-lg p-8 flex flex-col shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-semibold mb-2 text-white">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {plan.credits}
              </p>
              <p className="text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                <p className="text-4xl font-bold text-white">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-400">
                    {plan.frequency}
                  </span>
                </p>
              </div>

              <ul className="text-gray-300 mb-8 space-y-2 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <PurchaseButton
                priceId={plan.priceId}
                ctaText={plan.cta}
                mode={plan.mode}
              />
            </div>
          ))}
        </div>
      </div>

      {/* One-Time Packages Section */}
      <div className="mb-16 pt-12 border-t border-gray-700">
        <h2 className="text-2xl font-semibold text-center mb-8 text-white">
          One-Time Credit Packages
        </h2>
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
          Need flexibility? Buy credits when you need them. No subscriptions, no
          commitments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.name}
              className="border border-gray-700 bg-gray-800/50 rounded-lg p-6 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-2 text-white">
                {pkg.name}
              </h3>
              <p className="text-2xl font-bold text-blue-400 mb-2">
                {pkg.credits}
              </p>
              <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

              <p className="text-3xl font-bold mb-4 text-white">
                {pkg.price}
                <span className="text-base font-normal text-gray-400 ml-2">
                  one-time
                </span>
              </p>

              <ul className="text-gray-300 text-sm mb-6 space-y-1 flex-grow">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <PurchaseButton
                priceId={pkg.priceId}
                ctaText={pkg.cta}
                mode={pkg.mode}
              />
            </div>
          ))}
        </div>
      </div>

      {/* What's New Section */}
      <section className="mb-16 pt-12 border-t border-gray-700">
        <h3 className="text-2xl font-semibold text-center mb-8 text-white">
          Powerful New Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              🔄 Real-Time Streaming
            </h4>
            <p className="text-gray-400">
              No more waiting. See responses as they&apos;re generated across
              all models.
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              🌐 Web Search
            </h4>
            <p className="text-gray-400">
              Ground AI responses in real-time web data. Just 4 credits per
              search.
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">
              🎨 In-line Images
            </h4>
            <p className="text-gray-400">
              Generate images directly in your conversations. 25 credits per
              image.
            </p>
          </div>
        </div>
      </section>

      {/* Credit Usage Examples */}
      <section className="mb-16 pt-12 border-t border-gray-700">
        <h3 className="text-2xl font-semibold text-center mb-8 text-white">
          How Far Do Credits Go?
        </h3>
        <div className="max-w-3xl mx-auto bg-gray-800/30 rounded-lg p-8">
          <p className="text-gray-300 mb-6">
            Credits are simple: different models and features use different
            amounts. Here&apos;s what you can expect:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="font-semibold text-white mb-2">With 800 credits:</p>
              <ul className="space-y-1 text-sm">
                <li>• ~2,000 GPT 5 prompts</li>
                <li>• ~200 Claude Opus thinking prompts</li>
                <li>• ~30 AI-generated images</li>
                <li>• Mix and match as needed</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">
                With 1,900 credits:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• ~4,750 GPT 5 prompts</li>
                <li>• ~475 Claude Opus thinking prompts</li>
                <li>• ~75 AI-generated images</li>
                <li>• Perfect for power users</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Snowgoose Section */}
      <section className="text-center">
        <h3 className="text-2xl font-semibold mb-6 text-white">
          Why Choose Snowgoose?
        </h3>
        <div className="max-w-3xl mx-auto space-y-4 text-gray-300">
          <p>
            <span className="font-semibold text-white">No More Juggling:</span>{" "}
            Instead of managing multiple $20+ subscriptions to OpenAI,
            Anthropic, and others, get everything in one place.
          </p>
          <p>
            <span className="font-semibold text-white">
              Credits That Respect You:
            </span>{" "}
            Your unused credits roll over and stay valid for a full year. No
            more losing what you paid for at month&apos;s end.
          </p>
          <p>
            <span className="font-semibold text-white">
              Transparent & Fair:
            </span>{" "}
            Know exactly what you&apos;re paying for. No hidden fees, no
            surprise bills, just straightforward credit-based pricing.
          </p>
        </div>

        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-2xl mx-auto">
          <p className="text-blue-400 font-semibold mb-2">
            Still exploring? No problem.
          </p>
          <p className="text-gray-300">
            Every new account gets 40 free credits for 14 days to test drive all
            our features. See the difference unified AI access makes.
          </p>
        </div>
      </section>
    </div>
  );
}
