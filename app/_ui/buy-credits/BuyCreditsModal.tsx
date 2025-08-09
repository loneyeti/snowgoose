"use client";

import React from "react";
import Modal from "../modal";
import PurchaseButton from "../marketing/PurchaseButton";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const creditPacks = [
  {
    name: "Small Credit Pack",
    price: "$10",
    credits: "600 credits",
    description: "Great for topping up your balance.",
    features: [
      "600 credits valid for 1 year",
      "~1,500 GPT 5 prompts",
      "No monthly commitment",
    ],
    cta: "Buy Credits",
    priceId: "price_1RdLsGCDpyWvUPu81rlZqCLW",
    mode: "payment",
    highlight: false,
  },
  {
    name: "Large Credit Pack",
    price: "$30",
    credits: "2,000 credits",
    description: "Best value for a one-time purchase.",
    features: [
      "2,000 credits valid for 1 year",
      "~5,000 GPT 5 prompts",
      "Save vs. smaller packs",
    ],
    cta: "Buy Credits",
    priceId: "price_1RdLulCDpyWvUPu8wpgHB1E7",
    mode: "payment",
    highlight: true,
  },
] as const;

export default function BuyCreditsModal({
  isOpen,
  onClose,
}: BuyCreditsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buy More Credits">
      <div className="space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your unused credits roll over and are valid for a full year. Top up
          your balance anytime.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {creditPacks.map((pack) => (
            <div
              key={pack.name}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 rounded-lg p-6 flex flex-col shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">
                {pack.name}
              </h3>
              <p className="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                {pack.credits}
              </p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                {pack.price}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                  one-time
                </span>
              </p>
              <ul
                role="list"
                className="mt-6 mb-8 space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-grow"
              >
                {pack.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckBadgeIcon
                      className="h-5 w-5 flex-none text-blue-500 mr-2 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <PurchaseButton
                priceId={pack.priceId}
                ctaText={pack.cta}
                mode={pack.mode}
                highlight={pack.highlight}
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <a
            href="/pricing"
            onClick={onClose}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all plans and subscriptions
          </a>
        </div>
      </div>
    </Modal>
  );
}
