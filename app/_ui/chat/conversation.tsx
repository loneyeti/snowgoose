import { useState } from "react"; // Import useState
import { ChatResponse, ContentBlock } from "../../_lib/model";
import { SpinnerSize, Spinner } from "../spinner";
import MarkdownComponent from "../markdown-parser";
import CopyButton from "../copy-button"; // Import the CopyButton
import { isContentBlockArray } from "../../_lib/utils";
import { ErrorBlock } from "snowgander/dist/types";

interface ConversationProps {
  chats: ChatResponse[];
  showSpinner: boolean;
  imageURL: string;
  renderTypeName: string;
}

// New component for the thinking block with expansion logic
function ThinkingBlock({ thinking }: { thinking: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Simple check if content might overflow 2 lines (heuristic)
  // A more robust check might involve measuring rendered height, but this is simpler.
  const needsExpansion =
    thinking.split("\n").length > 2 || thinking.length > 150; // Adjust length threshold as needed

  return (
    // Dark mode: Adjust thinking block styles
    <div className="relative mt-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
      {/* Dark mode: Adjust thinking label styles */}
      <span className="absolute -top-3 left-2 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-500">
        Thinking
      </span>
      {/* Markdown inside should be handled by prose-invert */}
      {/* Apply line-clamp conditionally */}
      <div className={!isExpanded && needsExpansion ? "line-clamp-2" : ""}>
        <MarkdownComponent markdown={thinking} />
      </div>
      {/* Expansion Button - Only show if expansion is needed */}
      {needsExpansion && (
        <button
          type="button" // Add type="button" to prevent form submission/refresh
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function Conversation({
  chats,
  showSpinner,
  imageURL,
  renderTypeName,
}: ConversationProps) {
  // Removed the initial welcome message block.
  // Now, if chats are empty and it's not an image response, it will proceed to the main return block,
  // which will render nothing if chats array is empty.
  if (imageURL !== "") {
    return (
      <div className="w-full">
        {/* eslint-disable @next/next/no-img-element */}
        {/* Make image responsive */}
        <img
          src={imageURL}
          className="w-full h-auto max-w-full rounded-md"
          alt="Dall-e-3 image"
        />
      </div>
    );
  } else {
    return (
      <div className="w-full">
        {" "}
        {/* Removed grid and h-full */}
        {/* Ensure the prose container respects parent width */}
        {/* Dark mode: Apply prose-invert for markdown content */}
        <div className="prose dark:prose-invert w-full mx-auto">
          {chats && chats.length > 0 ? (
            chats.map((chat: ChatResponse, index) => (
              // Dark mode: Adjust user message background/text
              <div
                key={index}
                className={
                  chat.role === "user"
                    ? "px-6 py-1 my-2 text-sm text-slate-600 dark:text-slate-300 italic bg-slate-100 dark:bg-slate-700 rounded-lg"
                    : "p-2" // Assistant messages styled by prose-invert
                }
              >
                {isContentBlockArray(chat.content) ? (
                  // Render blocks individually with markdown
                  chat.content.map((block, blockIndex) => {
                    switch (block.type) {
                      case "thinking":
                        // Use the new ThinkingBlock component
                        return (
                          <ThinkingBlock
                            key={blockIndex}
                            thinking={block.thinking}
                          />
                        );
                      case "redacted_thinking":
                        return null; // Don't render redacted thinking
                      case "image":
                        return (
                          // Wrap in relative container for button positioning
                          <div
                            key={blockIndex}
                            className="relative group w-full my-4"
                          >
                            {/* eslint-disable @next/next/no-img-element */}
                            {/* Make image responsive */}
                            <img
                              src={block.url}
                              className="w-full h-auto max-w-full rounded-md"
                              alt="AI Generated image"
                            />
                            {/* Download Button - Changed to button with onClick handler */}
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault(); // Prevent any default button behavior
                                try {
                                  const response = await fetch(block.url);
                                  if (!response.ok) {
                                    throw new Error(
                                      `HTTP error! status: ${response.status}`
                                    );
                                  }
                                  const blob = await response.blob();
                                  const objectUrl = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = objectUrl;
                                  // Extract filename, removing query parameters
                                  let filename = "downloaded-image"; // Default
                                  try {
                                    const urlPath = new URL(block.url).pathname;
                                    const lastSegment = urlPath.substring(
                                      urlPath.lastIndexOf("/") + 1
                                    );
                                    if (lastSegment) {
                                      filename = lastSegment;
                                    }
                                  } catch (e) {
                                    // Fallback for invalid URLs or environments without URL constructor
                                    const basicFilename = block.url.substring(
                                      block.url.lastIndexOf("/") + 1
                                    );
                                    const queryIndex =
                                      basicFilename.indexOf("?");
                                    if (queryIndex !== -1) {
                                      filename = basicFilename.substring(
                                        0,
                                        queryIndex
                                      );
                                    } else if (basicFilename) {
                                      filename = basicFilename;
                                    }
                                  }
                                  link.download = filename;
                                  document.body.appendChild(link); // Required for Firefox
                                  link.click();
                                  document.body.removeChild(link); // Clean up
                                  URL.revokeObjectURL(objectUrl); // Free memory
                                } catch (error) {
                                  console.error("Download failed:", error);
                                  // Optionally, show an error message to the user
                                  alert(
                                    "Failed to download image. Please try again or right-click the image to save."
                                  );
                                }
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-slate-700 bg-opacity-60 text-white rounded-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-slate-200 dark:bg-opacity-60 dark:text-slate-900 dark:hover:bg-opacity-80 dark:focus:ring-offset-slate-800"
                              aria-label="Download image" // Accessibility
                            >
                              {/* Simple SVG Download Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      case "text":
                        return (
                          // Wrap in relative container for button positioning
                          <div key={blockIndex} className="relative group">
                            {/* Add overflow-x-auto for potential wide code blocks */}
                            <div className="overflow-x-auto">
                              <MarkdownComponent markdown={block.text} />
                            </div>
                            {/* Position button top-right, initially hidden, show on hover/focus */}
                            <CopyButton
                              textToCopy={block.text}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
                            />
                          </div>
                        );
                      case "error":
                        return (
                          <div key={blockIndex} className="relative group">
                            <div className="overflow-x-auto">
                              <MarkdownComponent
                                markdown={block.publicMessage}
                              />
                            </div>
                          </div>
                        );
                      default:
                        return null; // Should not happen with validated types
                    }
                  })
                ) : (
                  // Wrap in relative container for button positioning (for simple string content)
                  <div className="relative group">
                    {/* Add overflow-x-auto for potential wide code blocks */}
                    <div className="overflow-x-auto">
                      <MarkdownComponent markdown={chat.content} />
                    </div>
                    {/* Position button top-right, initially hidden, show on hover/focus */}
                    <CopyButton
                      textToCopy={chat.content}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>&nbsp;</p>
          )}
        </div>
        {showSpinner && (
          <div className="p-2">
            <div className="flex justify-start items-center">
              <Spinner spinnerSize={SpinnerSize.md} />
            </div>
          </div>
        )}
      </div>
    );
  }
}
