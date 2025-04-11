import React from "react";

import {
  ArrowPathIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline"; // Example icons

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-16 text-white">
        {" "}
        {/* Ensure heading is white */}
        Features Designed for Simplicity & Power
      </h1>
      {/* Wrap sections for better structure and styling */}
      <div className="space-y-16">
        {/* Section 1: Unified Access */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <CpuChipIcon className="h-8 w-8 mr-3 text-indigo-400" />
            <h2 className="text-3xl font-semibold text-white">
              {" "}
              {/* Ensure heading is white */}
              Unified Access to Frontier AI
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            {" "}
            {/* Lighter text */}
            Tired of juggling multiple AI subscriptions and APIs? Snowgoose
            brings the power of leading models like OpenAI&apos;s GPT-4o,
            Anthropic&apos;s Claude 3.7, Google&apos;s Gemini, and DeepSeek into
            one seamless interface. Access the latest capabilities without the
            complexity.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            {" "}
            {/* Lighter text */}
            <li>
              <strong>Developers:</strong> Simplify your workflow with diverse
              AI capabilities integrated into one platform. Reduce integration
              overhead.
            </li>
            <li>
              <strong>Writers:</strong> Find the perfect AI assistant for any
              writing stage – brainstorming, drafting, editing – all in one
              place.
            </li>
            <li>
              <strong>Researchers:</strong> Effortlessly compare outputs and
              leverage the strengths of different models for analysis.
            </li>
          </ul>
        </section>

        {/* Section 2: Persona System */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <ArrowPathIcon className="h-8 w-8 mr-3 text-green-400" />
            <h2 className="text-3xl font-semibold text-white">
              {" "}
              {/* Ensure heading is white */}
              Intelligent Persona System
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            {" "}
            {/* Lighter text */}
            Go beyond generic prompts. Snowgoose&apos;s Persona system allows
            you to guide the AI with predefined roles (like Coder, Editor, Tax
            Advisor) or create your own custom personas for perfectly tailored
            responses.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            {" "}
            {/* Lighter text */}
            <li>
              <strong>Gain:</strong> Get more relevant, consistent, and useful
              outputs aligned with your specific tasks.
            </li>
            <li>
              <strong>Pain Point Addressed:</strong> Crafting complex system
              prompts repeatedly.
            </li>
          </ul>
        </section>

        {/* Section 3: Output Formats */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <CubeTransparentIcon className="h-8 w-8 mr-3 text-blue-400" />
            <h2 className="text-3xl font-semibold text-white">
              Flexible Output Formats
            </h2>{" "}
            {/* Ensure heading is white */}
          </div>
          <p className="text-lg text-gray-300 mb-4">
            {" "}
            {/* Lighter text */}
            Need your AI output in a specific format? Choose from Markdown
            (default), JSON, HTML, or CSV to seamlessly integrate AI-generated
            content into your projects and workflows.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            {" "}
            {/* Lighter text */}
            <li>
              <strong>Developers:</strong> Directly get JSON for easy API
              integration.
            </li>
            <li>
              <strong>Writers/Content Creators:</strong> Use Markdown or HTML
              for web content.
            </li>
            <li>
              <strong>Gain:</strong> Save time on reformatting and data
              manipulation.
            </li>
          </ul>
        </section>

        {/* Section 4: UI/UX */}
        <section className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-lg">
          <div className="flex items-center mb-4">
            <PaintBrushIcon className="h-8 w-8 mr-3 text-pink-400" />
            <h2 className="text-3xl font-semibold text-white">
              {" "}
              {/* Ensure heading is white */}
              Clean & Simple Interface
            </h2>
          </div>
          <p className="text-lg text-gray-300 mb-4">
            {" "}
            {/* Lighter text */}
            We believe powerful technology shouldn&apos;t be complicated.
            Snowgoose features a brilliant, clean user interface and typography,
            focusing on ease of use and a delightful user experience.
          </p>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-1">
            {" "}
            {/* Lighter text */}
            <li>
              <strong>Pain Point Addressed:</strong> Cluttered or confusing
              interfaces in other tools.
            </li>
            <li>
              <strong>Gain:</strong> Focus on your work, not on figuring out the
              tool.
            </li>
          </ul>
        </section>

        {/* Add sections for Vision/Image Gen and Future Features later */}

        {/* TODO: Add CTAs section */}
      </div>{" "}
      {/* End of space-y-16 wrapper */}
    </div>
  );
}
