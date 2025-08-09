"use client"; // This component needs client-side interactivity

import React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  CodeBracketSquareIcon,
  SparklesIcon,
  CheckBadgeIcon,
  GlobeAltIcon, // For Web Search
  BoltIcon, // For Streaming
  QuestionMarkCircleIcon, // For FAQ
} from "@heroicons/react/24/outline";
import { FaGithub } from "react-icons/fa";
import PurchaseButton from "@/app/_ui/marketing/PurchaseButton";

// Updated pricing plan data with new structure
const plans = [
  {
    name: "Basic",
    price: "$10",
    frequency: "/ month",
    description: "Perfect for exploring AI capabilities",
    features: [
      "800 credits per month (credits roll over for 1 year!)",
      "~2000 GPT-4o prompts or 200 Claude Opus prompts",
      "Access to all frontier models",
      "Streaming responses",
      "Web search & image generation",
      "All output formats",
    ],
    // SEO Suggestion #9: Optimize CTA
    cta: "Access All AI Models Now",
    priceId: "price_1RDaeGCDpyWvUPu8lOlP4xMZ", // Update with actual ID
    highlight: false,
    mode: "subscription",
  },
  {
    name: "Premium",
    price: "$20",
    frequency: "/ month",
    description: "2.4x more credits for just 2x the price",
    features: [
      "1900 credits per month (credits roll over for 1 year!)",
      "~4750 GPT-4o prompts or 475 Claude Opus prompts",
      "Everything in Basic",
      "Priority support",
      "Early access to new features",
      "Best value per credit",
    ],
    // SEO Suggestion #9: Optimize CTA
    cta: "Go Premium",
    priceId: "price_1RDeNkCDpyWvUPu8FPHKaPMF", // Update with actual ID
    highlight: true,
    mode: "subscription",
  },
] as const;

// One-time purchase options
const creditPacks = [
  {
    name: "Small Credit Pack",
    price: "$10",
    credits: "600 credits",
    description: "Great for trying out or topping up",
    features: [
      "600 credits (valid for 1 year)",
      "~1500 GPT-4o prompts",
      "No monthly commitment",
      "Use across all models",
    ],
    cta: "Buy Credits",
    priceId: "price_1RdLsGCDpyWvUPu81rlZqCLW", // Add actual ID
    mode: "payment",
  },
  {
    name: "Large Credit Pack",
    price: "$30",
    credits: "2000 credits",
    description: "Best one-time value",
    features: [
      "2000 credits (valid for 1 year)",
      "~5000 GPT-4o prompts",
      "Save vs. smaller packs",
      "Perfect for projects",
    ],
    cta: "Buy Credits",
    priceId: "price_1RdLulCDpyWvUPu8wpgHB1E7", // Add actual ID
    mode: "payment",
  },
] as const;

export default function MarketingClientPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        {/* Background Gradient */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          {/* SEO Suggestion #2: Header Structure Optimization */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            All Leading AI Models.
            <br />
            One Subscription.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl max-w-3xl mx-auto">
            Access AI Chat LLMs like GPT 5, o3 Pro, Claude Opus 4, Gemini 2.5
            Pro, and more from OpenAI, Anthropic, Google, and DeepSeek. Stop
            juggling accounts and enjoy a unified AI chatbot interface.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link
              href="/login?action=demo"
              className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-purple-600 hover:to-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out transform hover:scale-105"
            >
              Try AI Models Free Demo
              <ArrowRightIcon className="inline-block h-5 w-5 ml-2" />
            </Link>
            <a
              href="#pricing"
              className="rounded-md border border-indigo-400 px-6 py-3 text-lg font-semibold text-indigo-300 hover:bg-indigo-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out"
            >
              Compare AI Platform Pricing
            </a>
          </div>
        </div>

        {/* Background Gradient Bottom */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </section>

      {/* New Feature Announcement Banner */}
      <section className="bg-gradient-to-r from-indigo-900 to-purple-900 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-center gap-x-6 text-white">
            <BoltIcon className="h-5 w-5" />
            <p className="text-sm leading-6">
              <strong className="font-semibold">New:</strong>{" "}
              <a
                className="underline"
                href="/blog/snowgoose-major-update-image-generation-web-search-streaming"
              >
                Streaming responses, web search, and in-line image generation
              </a>{" "}
              now available!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* SEO Suggestion #4: Keyword-rich section header */}
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="text-base font-semibold leading-7 text-indigo-400">
              Your Consolidated AI Platform
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A Simpler Way to Use the World&apos;s Best AI Models
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Snowgoose provides unified access to the best chatbots and LLMs:
              OpenAI ChatGPT, Anthropic Claude, Google Gemini, DeepSeek, and
              Qwen models through a single subscription.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Feature 1: Unified Access */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-indigo-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CpuChipIcon
                    className="h-6 w-6 flex-none text-indigo-400"
                    aria-hidden="true"
                  />
                  Multiple AI Models, One Subscription
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Get LLM and ai chat access to GPT 5, o3 Pro, Claude 4,
                    Gemini 2.5 Pro, and more through one seamless interface. As
                    an AI API alternative, Snowgoose simplifies your workflow
                    instantly.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Your ChatGPT alternative. No more juggling multiple
                    subscriptions.
                  </p>
                </dd>
              </div>

              {/* Feature 4: Persona System -- SEO Suggestion #5 */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-pink-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <SparklesIcon
                    className="h-6 w-6 flex-none text-pink-400"
                    aria-hidden="true"
                  />
                  AI Prompt Templates and Smart Personas
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Pre-built AI chatbot personas for coding, writing, tax
                    advice, and custom workflows. Streamline your AI
                    interactions with consistent context and specialized
                    prompts.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Save time with consistent context.
                  </p>
                </dd>
              </div>

              {/* Feature 2: Streaming Responses */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <BoltIcon
                    className="h-6 w-6 flex-none text-green-400"
                    aria-hidden="true"
                  />
                  Image Generation & Vision
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Go beyond text. Generate images directly in your chat with
                    OpenAI and Gemini inline image generation. Also, upload your
                    own images for analysis with any supporting model.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Unlock true multimodal AI workflows
                  </p>
                </dd>
              </div>

              {/* Feature 3: Web Search & Images */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-blue-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <GlobeAltIcon
                    className="h-6 w-6 flex-none text-blue-400"
                    aria-hidden="true"
                  />
                  Web Search
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Ground your responses in the latest information. Empower
                    your AI chats with real-time access to the web for
                    up-to-the-minute research and data.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Available on supported OpenAI models
                  </p>
                </dd>
              </div>

              {/* Feature 5: Flexible Outputs */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-yellow-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CubeTransparentIcon
                    className="h-6 w-6 flex-none text-yellow-400"
                    aria-hidden="true"
                  />
                  Any Output Format
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Get AI responses in Markdown, JSON, HTML, or CSV. Perfect
                    integration for developers and writers.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    No reformatting needed.
                  </p>
                </dd>
              </div>

              {/* Feature 6: Open Source */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-teal-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CodeBracketSquareIcon
                    className="h-6 w-6 flex-none text-teal-400"
                    aria-hidden="true"
                  />
                  Open Source
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    True chat AI that is open sources is rare. Fully transparent
                    and community-driven. Inspect the code, contribute, or
                    self-host if you prefer.
                  </p>
                  <p className="mt-4">
                    <a
                      href="https://github.com/loneyeti/snowgoose"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold leading-6 text-teal-400 hover:text-teal-300"
                    >
                      View on GitHub <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Credits That Last
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
            Unlike other services, your unused credits roll over and remain
            valid for a full year. Choose a monthly plan for the best value, or
            buy credits as you need them.
          </p>

          {/* Monthly Plans */}
          <div className="mt-16">
            <h3 className="text-center text-2xl font-semibold text-white mb-8">
              Monthly Plans{" "}
              <span className="text-base font-normal text-gray-400">
                (Best Value)
              </span>
            </h3>
            <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                    plan.highlight
                      ? "ring-2 ring-indigo-500 bg-gray-900"
                      : "ring-gray-700 bg-gray-800/60"
                  }`}
                >
                  {plan.highlight && (
                    <p className="text-base font-semibold text-indigo-400">
                      Most popular
                    </p>
                  )}
                  <h3
                    id={plan.name}
                    className={`text-lg font-semibold leading-8 ${
                      plan.highlight ? "text-white" : "text-white"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    {plan.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-400">
                      {plan.frequency}
                    </span>
                  </p>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10"
                  >
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckBadgeIcon
                          className={`h-6 w-5 flex-none ${
                            plan.highlight ? "text-indigo-400" : "text-white/70"
                          }`}
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <PurchaseButton
                      priceId={plan.priceId}
                      ctaText={plan.cta}
                      highlight={plan.highlight}
                      mode={plan.mode}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* One-Time Credit Packs */}
          <div className="mt-24">
            <h3 className="text-center text-2xl font-semibold text-white mb-8">
              One-Time Credit Packs{" "}
              <span className="text-base font-normal text-gray-400">
                (No Commitment)
              </span>
            </h3>
            <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              {creditPacks.map((pack) => (
                <div
                  key={pack.name}
                  className="rounded-3xl p-8 ring-1 ring-gray-700 bg-gray-800/60 xl:p-10"
                >
                  <h3 className="text-lg font-semibold leading-8 text-white">
                    {pack.name}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-gray-300">
                    {pack.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-white">
                      {pack.price}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-400">
                      one-time
                    </span>
                  </p>
                  <p className="text-base font-medium text-indigo-400 mt-2">
                    {pack.credits}
                  </p>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10"
                  >
                    {pack.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckBadgeIcon
                          className="h-6 w-5 flex-none text-white/70"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <PurchaseButton
                      priceId={pack.priceId}
                      ctaText={pack.cta}
                      highlight={false}
                      mode={pack.mode}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Notes */}
          <div className="text-center mt-12 text-gray-400 text-sm space-y-2">
            <p>
              All credits are valid for one year from purchase date. Monthly
              plan credits stack with any unused balance.
            </p>
            <p>
              Credit usage varies by model. Example number of prompts based on
              an average of prompts for that model and is only an estimate.
              Actual credit usage depends on the number of input and output
              tokens, images uploaded, images generated, and web searches
              performed.
            </p>
          </div>

          {/* SEO Suggestion #4: Keyword-rich section */}
          <div className="mt-16 pt-12 border-t border-gray-700">
            <h3 className="text-2xl font-semibold text-center mb-6 text-white">
              Why Snowgoose is the Best Alternative to Multiple AI Subscriptions
            </h3>
            <div className="grid max-w-4xl mx-auto gap-8 lg:grid-cols-2">
              <div className="text-center p-6 rounded-lg bg-gray-900/50">
                <h4 className="text-lg font-semibold text-indigo-400 mb-3">
                  vs. Individual Subscriptions
                </h4>
                <p className="text-gray-300">
                  Instead of managing separate subscriptions to OpenAI
                  ($20/month), Anthropic ($20/month), and Google AI, access all
                  models starting at just $10/month with credits that roll over.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-gray-900/50">
                <h4 className="text-lg font-semibold text-indigo-400 mb-3">
                  vs. Direct API Usage
                </h4>
                <p className="text-gray-300">
                  No expensive monthly accounts from multiple vendors, no
                  surprise bills, no API key management. Just a simple,
                  consolidated AI platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-400">
              Can’t find the answer you’re looking for? Reach out to our
              customer support team.
            </p>
          </div>
          <div
            itemScope
            itemType="https://schema.org/FAQPage"
            className="mt-16 space-y-8"
          >
            <div
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="rounded-lg bg-gray-800/60 p-6"
            >
              <h3
                itemProp="name"
                className="text-base font-semibold leading-7 text-white"
              >
                What AI models does Snowgoose support?
              </h3>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="mt-3 text-base leading-7 text-gray-300"
              >
                <p itemProp="text">
                  Snowgoose provides access to large language models (LLMs) like
                  OpenAI GPT-4 and o3, Anthropic Claude Opus, Google Gemini,
                  DeepSeek, and Qwen models through one unified platform.
                </p>
              </div>
            </div>
            <div
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="rounded-lg bg-gray-800/60 p-6"
            >
              <h3
                itemProp="name"
                className="text-base font-semibold leading-7 text-white"
              >
                Is Snowgoose cheaper than individual AI subscriptions?
              </h3>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="mt-3 text-base leading-7 text-gray-300"
              >
                <p itemProp="text">
                  Yes, instead of paying $20/month or more each to OpenAI,
                  Anthropic, and Google, you can access all models starting at
                  just $10/month. Unused credits roll over. Check out our{" "}
                  <a href="/blog/snowgoose-credits-now-rollover">
                    blog post about it.
                  </a>
                </p>
              </div>
            </div>
            <div
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="rounded-lg bg-gray-800/60 p-6"
            >
              <h3
                itemProp="name"
                className="text-base font-semibold leading-7 text-white"
              >
                How long do Snowgoose credits last?
              </h3>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="mt-3 text-base leading-7 text-gray-300"
              >
                <p itemProp="text">
                  All credits remain valid for one full year from the date of
                  purchase, unlike many other platforms where credits expire
                  monthly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Callout Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <FaGithub className="mx-auto h-12 w-auto text-gray-400" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built in the Open
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            Snowgoose is proud to be an open-source project. We believe in
            transparency and community collaboration. For developers, this means
            you can see exactly how Snowgoose works and even contribute to its
            future. For everyone, it’s a commitment to building a trustworthy
            and innovative platform.
          </p>
          <div className="mt-8">
            <a
              href="https://github.com/loneyeti/snowgoose"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-x-2 rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              <FaGithub className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              View Repository
            </a>
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/60 px-6 pt-16 shadow-2xl rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
              aria-hidden="true"
            >
              <circle
                cx={512}
                cy={512}
                r={512}
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>

            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start using AI the smart way.
                <br />
                Unify your LLMs today.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Join others who&apos;ve simplified their AI workflow with
                Snowgoose. Try our free demo to experience the difference, or
                jump right in with an affordable subscription.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <Link
                  href="/login?action=demo"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Try Free Demo
                </Link>
                <a
                  href="#pricing"
                  className="text-sm font-semibold leading-6 text-white hover:text-gray-200"
                >
                  View Plans <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center w-full py-8">
          <a href="https://fazier.com/launches/snowgoose.app" target="_blank">
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=neutral"
              width="250"
              alt="Snowgoose featured on Fazier launch platform"
            />
          </a>
        </div>
      </section>
    </>
  );
}
