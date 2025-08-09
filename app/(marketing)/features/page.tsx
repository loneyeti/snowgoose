import React from "react";

import {
  ArrowPathIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  PaintBrushIcon,
  EyeIcon, // For Vision
  PhotoIcon, // For Image Generation
  WrenchScrewdriverIcon, // For Future Features
  GlobeAltIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline"; // Example icons
import Link from "next/link"; // For CTAs
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snowgoose | Features that Simplify and Empower Your AI Workflow",
  description:
    "Explore Snowgoose features: Unified access to GPT 5 & Claude 3.7, intelligent personas, flexible outputs (JSON, Markdown), vision support, image generation, and simple UI.",
};

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-16 text-white">
        Your AI Toolkit, Redefined.
      </h1>
      {/* Wrap sections for better structure and styling */}
      <div className="space-y-16">
        {/* Section 1: Unified Access */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <CpuChipIcon className="h-8 w-8 mr-3 text-indigo-400" />
            <h2 className="text-3xl font-semibold text-white">
              Unified Access to Frontier AI Models
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Why limit yourself? Snowgoose integrates top-tier AI models from
            industry leaders like OpenAI, Anthropic, and Google into a single,
            clean interface. Forget juggling multiple accounts and
            subscriptions. With one pool of flexible credits, you have the
            freedom to choose the perfect model for any task—from coding with
            GPT 5 or Gemini 2.5 Pro to advanced reasoning with Claude Opus 4 or
            o3 Pro. The power is yours.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Developers:</strong> Streamline your development workflow
              with diverse AI capabilities integrated into one platform. Reduce
              integration overhead and experiment easily.
            </li>
            <li>
              <strong>Writers:</strong> Enhance your content creation process.
              Find the perfect AI assistant for brainstorming, drafting, and
              editing – all in one place.
            </li>
            <li>
              <strong>Researchers:</strong> Accelerate your research.
              Effortlessly compare outputs and leverage the strengths of
              different frontier AI models for data analysis and literature
              review.
            </li>
          </ul>
        </section>

        {/* Section 2: Persona System */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <ArrowPathIcon className="h-8 w-8 mr-3 text-green-400" />
            <h2 className="text-3xl font-semibold text-white">
              {" "}
              Intelligent Persona System
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Stop wasting time with generic prompts. Our unique Persona system
            instantly configures the AI to act as a specific expert. Need to
            debug some code? Activate the Coder persona. Polishing an article?
            Switch to Editor. You can use our pre-built library of personas or
            create your own custom ones to ensure you get consistently tailored,
            high-quality results that match your exact needs.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Benefit:</strong> Achieve highly relevant, consistent, and
              useful outputs aligned precisely with your specific tasks or
              desired AI personality.
            </li>
            <li>
              <strong>Pain Point Addressed:</strong> Eliminates the need to
              repeatedly craft complex system prompts, saving time and ensuring
              reliable results. Premium users unlock custom persona creation.
            </li>
          </ul>
        </section>

        {/* Section 3: Web Search */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <GlobeAltIcon className="h-8 w-8 mr-3 text-orange-400" />
            <h2 className="text-3xl font-semibold text-white">Web Search</h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Give your AI a direct line to the internet. With our Web Search tool
            for supported OpenAI models, you can ask about current events,
            research the latest data, or find up-to-the-minute information to
            ground your responses in facts. Just toggle Web Search and let the
            AI pull in real-time data to deliver more accurate and relevant
            answers.*
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Benefit:</strong> Ground your prompt with up to date
              information like news, weather, or articles.
            </li>
            <li>
              <small>*Available on supported OpenAI models</small>
            </li>
          </ul>
        </section>

        {/* Section 3: Output Formats */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <CubeTransparentIcon className="h-8 w-8 mr-3 text-blue-400" />
            <h2 className="text-3xl font-semibold text-white">
              Flexible Output Formats
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Need your AI output structured for a specific use case? Choose your
            preferred format: Markdown (default), JSON, HTML, or CSV. Seamlessly
            integrate AI-generated content into any project or developer
            workflow.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Developers:</strong> Get structured JSON output instantly
              for easy API integration or data processing.
            </li>
            <li>
              <strong>Writers/Content Creators:</strong> Utilize Markdown or
              HTML formats ready for direct use in CMS platforms or web pages.
            </li>
            <li>
              <strong>Benefit:</strong> Save significant time on reformatting
              and data manipulation, streamlining your workflow.
            </li>
          </ul>
        </section>

        {/* Section 4: UI/UX */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <PaintBrushIcon className="h-8 w-8 mr-3 text-pink-400" />
            <h2 className="text-3xl font-semibold text-white">
              {" "}
              Clean & Simple Interface
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            We believe powerful technology shouldn&apos;t be complicated.
            Snowgoose features a brilliant, clean user interface (UI) and crisp
            typography, meticulously designed for ease of use and a delightful
            user experience (UX).
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Pain Point Addressed:</strong> Overcomes the cluttered or
              confusing interfaces found in many other complex AI tools.
            </li>
            <li>
              <strong>Benefit:</strong> Allows you to focus entirely on your
              work and creativity, not on struggling to figure out the software.
            </li>
          </ul>
        </section>

        {/* Section 5: Vision Support */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <EyeIcon className="h-8 w-8 mr-3 text-purple-400" />
            <h2 className="text-3xl font-semibold text-white">
              Vision Support (Image Upload)
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Unlock multimodal capabilities. Upload images directly into your
            chat to leverage vision-enabled models for analysis, description,
            and interaction.*
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Benefit:</strong> Go beyond text—analyze visual data, get
              image descriptions, and interact with AI in new ways.
            </li>
            <li>
              <small>*Dependent on underlying model capabilities.</small>
            </li>
          </ul>
        </section>

        {/* Section 6: Image Generation */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <PhotoIcon className="h-8 w-8 mr-3 text-orange-400" />
            <h2 className="text-3xl font-semibold text-white">
              Inline AI Image Generation
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Bring your ideas to life visually. Generate stunning images directly
            within Snowgoose using integrated text-to-image models like GPT and
            Google Gemini. Integrate AI image generation right into your
            conversation.*
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Benefit:</strong> Create unique visuals for presentations,
              content, or creative projects without leaving the platform or your
              conversation.
            </li>
            <li>
              <small>*Dependent on underlying model capabilities.</small>
            </li>
          </ul>
        </section>

        {/* Section 6: Thinking */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-8 w-8 mr-3 text-green-400" />
            <h2 className="text-3xl font-semibold text-white">
              Thinking and Reasoning
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            Let your models think and reason before answering. When supported,
            we show you what the model is thinking about when answering. Also,
            some models support variable thinking length. Toggle between no
            thinking, short thinking, or long thinking.*
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            <li>
              <strong>Benefit:</strong> Take advantage of the power of reasoning
              models to solve complex issues.
            </li>
            <li>
              <small>*Dependent on underlying model capabilities.</small>
            </li>
          </ul>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16 pt-12 border-t border-gray-700">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Ready to Simplify Your AI Experience?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore how Snowgoose can streamline your workflow with unified
            access, intelligent personas, and predictable pricing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link
              href="/login?action=demo"
              className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-purple-600 hover:to-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out transform hover:scale-105"
            >
              Try Free Demo
            </Link>
            <Link
              href="/pricing" // Link to the pricing page
              className="rounded-md border border-indigo-400 px-6 py-3 text-lg font-semibold text-indigo-300 hover:bg-indigo-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-150 ease-in-out"
            >
              View Pricing Plans
            </Link>
          </div>
        </section>
      </div>{" "}
      {/* End of space-y-16 wrapper */}
    </div>
  );
}
