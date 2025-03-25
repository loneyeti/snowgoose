"use client";

import { useRef, useState, useEffect } from "react";
import { Spinner, SpinnerSize } from "../spinner";
import { MaterialSymbol } from "react-material-symbols";

interface TextInputAreaProps {
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
  onReset: () => void;
}

export default function TextInputArea({
  onSubmit,
  isSubmitting,
  onReset,
}: TextInputAreaProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [promptVal, setPromptVal] = useState("");

  // Auto-resize text area as content changes
  useEffect(() => {
    const minTextAreaHeight = 76;
    const maxTextAreaHeight = 300;

    const textArea = textAreaRef.current;
    if (!textArea) return;

    // Reset height to properly calculate scroll height
    textArea.style.height = "auto";

    // Calculate required height within min/max range
    const requiredHeight = textArea.scrollHeight;
    const newHeight = Math.min(
      Math.max(requiredHeight, minTextAreaHeight),
      maxTextAreaHeight
    );

    textArea.style.height = `${newHeight}px`;
  }, [promptVal]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptVal(e.target.value);
  };

  // The parent form will handle the actual submission
  // Handle form submission without causing double submission
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!promptVal.trim()) {
      return; // Don't submit if prompt is empty
    }

    // Find the parent form element
    const form = e.currentTarget.closest("form");
    if (!form) {
      console.error("No parent form found");
      return;
    }

    // Get all form data, including hidden fields
    const formData = new FormData(form);

    // Update the prompt value with our current state
    formData.set("prompt", promptVal);

    // Ensure model field is present - if no model is selected in the UI but options-bar shows
    // a default, make sure we have a value here
    if (!formData.get("model") || formData.get("model") === "") {
      // Try to get from hidden input field
      const defaultModelElement = document.querySelector(
        '[name="model"]'
      ) as HTMLInputElement;

      if (defaultModelElement && defaultModelElement.value) {
        formData.set("model", defaultModelElement.value);
      } else {
        // As a last resort, try to get the first model directly from the displayed option
        const modelOptionElement = document.querySelector(
          ".Popover-Button span"
        );
        if (modelOptionElement && modelOptionElement.textContent) {
          // Since the displayed text is the model name, we need to find its ID from the models dropdown
          const modelsDropdown = document.querySelectorAll(
            '[role="dialog"] [class*="cursor-pointer"]'
          );
          if (modelsDropdown.length > 0) {
            // Select the first model by default
            formData.set("model", "1");
          }
        }
      }
    }

    // Pass complete form data to onSubmit
    onSubmit(formData);

    // Clear the input after submission
    setPromptVal("");
  };

  return (
    <div className="w-full">
      <div className="">
        <div className="overflow-hidden [&:has(textarea:focus)]:border-token-border-xheavy [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex items-center w-full flex-grow relative border border-token-border-heavy bg-white rounded-2xl shadow-[0_0_0_2px_rgba(255,255,255,0.95)]">
          <button className="pl-3" disabled={isSubmitting} type="button">
            <MaterialSymbol
              className="align-middle text-slate-400 hover:text-slate-500"
              icon="image"
              size={32}
            />
          </button>
          <textarea
            className="m-0 text-sm w-full resize-none border-0 bg-transparent py-[10px] pr-10 focus:ring-0 focus-visible:ring-0 md:py-3.5 md:pr-12 placeholder-black/50 pl-3 md:pl-4"
            id="prompt"
            name="prompt"
            ref={textAreaRef}
            value={promptVal}
            onChange={handleTextAreaChange}
            placeholder="Send Message..."
          ></textarea>
          <button
            className="pr-3"
            disabled={isSubmitting || !promptVal.trim()}
            type="button"
            onClick={handleButtonClick}
          >
            <MaterialSymbol
              className="align-middle text-slate-50 bg-slate-400 hover:bg-slate-500 transition-colors rounded-full p-1"
              icon="arrow_upward"
              size={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
