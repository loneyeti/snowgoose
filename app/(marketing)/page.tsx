"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  PaintBrushIcon,
  CodeBracketSquareIcon, // For Open Source
  SparklesIcon, // For Personas (alternative)
  CheckBadgeIcon, // For Pricing Value
  UserGroupIcon, // For Target Audience
  BookOpenIcon, // For Demo/Learn More
  ArrowPathIcon, // Re-using for Personas
} from "@heroicons/react/24/outline";
import { FaGithub } from "react-icons/fa"; // Using react-icons for GitHub logo
import PurchaseButton from "@/app/_ui/marketing/PurchaseButton"; // Import the purchase button

// Pricing plan data (similar to pricing/page.tsx)
// IMPORTANT: Replace placeholders with actual Stripe Price IDs if needed.
const plans = [
  {
    name: "Basic",
    price: "$5",
    frequency: "/ month",
    description: "Explore the power of frontier AI affordably.",
    features: [
      "Access to leading models (GPT-4o, Claude 3.7, Deepseek, Gemini & more)",
      "Generous starting API usage included*",
      "Standard Persona library",
      "All Output Formats (Markdown, JSON, HTML, CSV)",
    ],
    cta: "Get Started Basic",
    priceId: "price_1RDaeGCDpyWvUPu8lOlP4xMZ", // Replace if necessary
    highlight: false,
  },
  {
    name: "Premium",
    price: "$20",
    frequency: "/ month",
    description: "5x the usage for 4x the price",
    features: [
      "Everything in Basic, plus:",
      "5x More API usage allowance*",
      "Create Custom Personas",
      "Priority access to new features & models",
    ],
    cta: "Choose Premium",
    priceId: "price_1RDeNkCDpyWvUPu8FPHKaPMF", // Replace if necessary - MAKE SURE THIS IS THE CORRECT PRO PRICE ID
    highlight: true, // Example: Highlight the Pro plan
  },
];

export default function MarketingPage() {
  // Removed isLoggedIn state logic, assuming layout handles user status display

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
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
            Premium AI Models.
            <br className="hidden sm:inline" /> One Simple Interface.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl max-w-3xl mx-auto">
            Snowgoose simplifies your AI experience with unified access to
            industry-leading models like GPT-4o, Claude 3.7, and Gemini Pro—all
            through one intuitive platform. Enjoy transparent, predictable
            pricing starting at just $5/month, without juggling multiple APIs or
            facing unexpected bills.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link
              href="/login?action=demo" // Specific action for demo signup intent
              className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-purple-600 hover:to-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out transform hover:scale-105"
            >
              Try Free Demo
              <ArrowRightIcon className="inline-block h-5 w-5 ml-2" />
            </Link>
            <a
              href="#pricing" // Smooth scroll to pricing section
              className="rounded-md border border-indigo-400 px-6 py-3 text-lg font-semibold text-indigo-300 hover:bg-indigo-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out"
            >
              View Pricing
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

      {/* Features Section */}
      <section className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Everything You Need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simplify Your AI Workflow
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Snowgoose offers a suite of powerful features designed to make
              interacting with cutting-edge AI models intuitive and efficient.
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
                  Unified Frontier AI Access
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Access OpenAI&apos;s GPT-4o, Anthropic&apos;s Claude 3.7,
                    Google&apos;s Gemini, and more through one seamless
                    interface. No more API juggling.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Ideal for Developers, Writers, Researchers.
                  </p>
                </dd>
              </div>

              {/* Feature 2: Persona System */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <ArrowPathIcon // Re-using icon, consider SparklesIcon
                    className="h-6 w-6 flex-none text-green-400"
                    aria-hidden="true"
                  />
                  Intelligent Persona System
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Guide the AI with predefined roles (Coder, Editor, etc.) or
                    create custom personas for perfectly tailored, consistent
                    responses.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Stop repeating complex instructions.
                  </p>
                </dd>
              </div>

              {/* Feature 3: Output Formats */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-blue-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CubeTransparentIcon
                    className="h-6 w-6 flex-none text-blue-400"
                    aria-hidden="true"
                  />
                  Flexible Output Formats
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Get AI output formatted exactly how you need it: Markdown
                    (default), JSON, HTML, or CSV. Seamless integration for any
                    workflow.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Save time on reformatting data.
                  </p>
                </dd>
              </div>

              {/* Feature 4: Clean UI/UX */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-pink-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <PaintBrushIcon
                    className="h-6 w-6 flex-none text-pink-400"
                    aria-hidden="true"
                  />
                  Clean & Simple Interface
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Powerful technology shouldn&apos;t be complicated. Enjoy a
                    brilliant, clean UI and typography focused on ease of use.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Focus on your work, not the tool.
                  </p>
                </dd>
              </div>

              {/* Feature 5: Open Source */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-yellow-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CodeBracketSquareIcon
                    className="h-6 w-6 flex-none text-yellow-400"
                    aria-hidden="true"
                  />
                  Open Source & Transparent
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Snowgoose is proudly open source. Inspect the code,
                    contribute, or self-host. We believe in transparency and
                    community.
                  </p>
                  <p className="mt-4">
                    <a
                      href="https://github.com/troyharris/snowgoose"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold leading-6 text-yellow-400 hover:text-yellow-300"
                    >
                      View on GitHub <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>

              {/* Feature 6: Predictable Pricing */}
              <div className="flex flex-col p-6 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg hover:border-teal-500 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CheckBadgeIcon
                    className="h-6 w-6 flex-none text-teal-400"
                    aria-hidden="true"
                  />
                  Predictable Pricing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Escape volatile token-based billing. Our simple, fixed
                    monthly plans start at just $5, letting you budget with
                    confidence.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Leverage powerful AI without cost surprises.
                  </p>
                </dd>
              </div>
            </dl>
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
            Snowgoose is open source because we believe in transparency and the
            power of community collaboration. Explore the code, suggest
            features, or contribute directly.
          </p>
          <div className="mt-8">
            <a
              href="https://github.com/troyharris/snowgoose"
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

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Predictable AI Power. Unbeatable Value.
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
            Stop guessing your AI costs, and stop paying multiple monthly bills.
            Snowgoose offers simple, fixed monthly pricing, including generous
            API usage to get you started.
          </p>

          {/* Pricing Grid */}
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                  plan.highlight
                    ? "ring-2 ring-indigo-500 bg-gray-900" // Highlighted plan style
                    : "ring-gray-700 bg-gray-800/60" // Standard plan style
                }`}
              >
                <h3
                  id={plan.name}
                  className={`text-lg font-semibold leading-8 ${
                    plan.highlight ? "text-indigo-400" : "text-white"
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
                {/* Use PurchaseButton component */}
                <div className="mt-10">
                  <PurchaseButton
                    priceId={plan.priceId}
                    ctaText={plan.cta}
                    highlight={plan.highlight}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-gray-400 text-sm">
            <p>
              * API usage allowance details are based on underlying model costs
              (e.g., tokens). We aim for transparency and provide generous
              starting amounts. Don't worry, we will never charge more than your
              monthly payment, and will give clear feedback on how many credits
              you have remaining.
            </p>
          </div>

          {/* Why Snowgoose Pricing Makes Sense */}
          <div className="mt-16 pt-12 border-t border-gray-700">
            <h3 className="text-2xl font-semibold text-center mb-6 text-white">
              Why Snowgoose Pricing Makes Sense
            </h3>
            <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
              Unlike paid access to ChatGPT or Anthropic which requires separate
              subscriptions to OpenAI ($20/month) and Anthropic ($20/month),
              Snowgoose gives you access to all elite AI models through a single
              $5 subscription. No need to maintain multiple accounts or pay
              separate platform fees. Your $5 also converts directly into API
              credits, giving you the flexibility to use any model while
              maintaining a straightforward, predictable billing experience.
              Experience the full spectrum of cutting-edge AI without the
              complexity and added costs of managing multiple provider
              relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/60 px-6 pt-16 shadow-2xl rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            {/* Background Shapes */}
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
                Ready to simplify your AI workflow?
                <br />
                Try Snowgoose today.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Experience the power of unified AI access, intelligent personas,
                and predictable pricing. Sign up for a free demo – no credit
                card required to explore.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <Link
                  href="/login?action=demo" // Link to login/signup for demo
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Try Free Demo
                </Link>
                <a
                  href="#pricing" // Smooth scroll link
                  className="text-sm font-semibold leading-6 text-white hover:text-gray-200"
                >
                  View Plans <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            {/* Optional: Add an image/graphic here */}
            {/* <div className="relative mt-16 h-80 lg:mt-8">
              <Image
                className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                src="/path/to/your/screenshot.png" // Replace with an actual image if desired
                alt="App screenshot"
                width={1824}
                height={1080}
              />
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
}
