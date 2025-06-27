"use client";

import React, { useState } from "react";
import BuyCreditsModal from "./BuyCreditsModal";
import { MaterialSymbol } from "react-material-symbols";

interface CreditsDisplayProps {
  creditBalance: number;
}

export default function CreditsDisplay({ creditBalance }: CreditsDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center group relative p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Buy more credits"
      >
        <div className="flex items-center px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-700 dark:border-slate-600 shadow-sm">
          <MaterialSymbol
            icon="electric_bolt"
            size={14}
            className="text-yellow-500 dark:text-yellow-400 mr-1"
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
            {Math.round(creditBalance)}
          </span>
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-auto hidden group-hover:block z-20">
          <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Buy More Credits
          </div>
        </div>
      </button>
      <BuyCreditsModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
