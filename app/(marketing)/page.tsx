"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline"; // Using Heroicons for a modern look

export default function MarketingPage() {
  // The outer div, header, and footer are removed as they are provided by the layout.tsx
  return (
    <>
      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {" "}
          {/* Increased max-width slightly */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
            All Frontier AI Models. One Simple Subscription.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
            Stop juggling complex APIs and unpredictable bills. Snowgoose
            provides unified access to leading AI like GPT-4o, Claude 3.5, and
            Gemini with predictable pricing starting at just $5/month. Enhance
            your workflow with powerful Personas and flexible Output Formats.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {" "}
            {/* Added flex-wrap and gap-y */}
            <Link
              href="/features" // Link to Features page
              className="rounded-md border border-indigo-400 px-6 py-3 text-lg font-semibold text-indigo-300 hover:bg-indigo-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out"
            >
              Explore Features
            </Link>
            <Link
              href="/pricing" // Link to Pricing page
              className="rounded-md border border-pink-400 px-6 py-3 text-lg font-semibold text-pink-300 hover:bg-pink-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 transition duration-150 ease-in-out"
            >
              See Pricing
            </Link>
            <Link
              href="/login?plan=basic" // Link to login/signup, potentially pre-selecting basic
              className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-purple-600 hover:to-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out transform hover:scale-105"
            >
              Get Started for $5
              <ArrowRightIcon className="inline-block h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
