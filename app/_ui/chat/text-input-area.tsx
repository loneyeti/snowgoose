"use client";

import { useRef, useState, useEffect } from "react";
import { MaterialSymbol } from "react-material-symbols";

interface TextInputAreaProps {
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
  onReset: () => void;
  showFileUpload: boolean;
}

export default function TextInputArea({
  onSubmit,
  isSubmitting,
  onReset,
  showFileUpload,
}: TextInputAreaProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptVal, setPromptVal] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Trigger file input click when image button is clicked
  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

    if (!promptVal.trim() && !selectedFile) {
      return; // Don't submit if prompt is empty and no file selected
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

    // Add the selected file to the form data if present
    if (selectedFile) {
      formData.set("image", selectedFile);
    }

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
          {/* Hidden file input that gets triggered by the image button */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            name="image"
            onChange={handleFileSelect}
          />

          {/* Image upload button - only shown if model supports vision */}
          {showFileUpload && (
            <button
              className="pl-3"
              disabled={isSubmitting}
              type="button"
              onClick={handleImageButtonClick}
            >
              <MaterialSymbol
                className={`align-middle ${selectedFile ? "text-blue-500" : "text-slate-400 hover:text-slate-500"}`}
                icon="image"
                size={32}
              />
            </button>
          )}

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
            disabled={isSubmitting || (!promptVal.trim() && !selectedFile)}
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

        {/* Display selected file name if a file is selected */}
        {selectedFile && (
          <div className="text-xs text-slate-500 mt-1 ml-3 flex items-center">
            <MaterialSymbol icon="attach_file" size={14} className="mr-1" />
            {selectedFile.name}
            <button
              type="button"
              className="ml-2 text-slate-400 hover:text-slate-600"
              onClick={() => setSelectedFile(null)}
            >
              <MaterialSymbol icon="close" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
