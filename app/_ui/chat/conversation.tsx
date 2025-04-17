import { ChatResponse, ContentBlock } from "../../_lib/model";
import { SpinnerSize, Spinner } from "../spinner";
import MarkdownComponent from "../markdown-parser";
import CopyButton from "../copy-button"; // Import the CopyButton
import { isContentBlockArray } from "../../_lib/utils";

interface ConversationProps {
  chats: ChatResponse[];
  showSpinner: boolean;
  imageURL: string;
  renderTypeName: string;
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
        <div className="prose dark:prose-invert w-full lg:w-[65ch] mx-auto">
          {chats && chats.length > 0 ? (
            chats.map((chat: ChatResponse, index) => (
              // Dark mode: Adjust user message background/text
              <div
                key={index}
                className={
                  chat.role === "user"
                    ? "px-6 py-1 text-sm text-slate-600 dark:text-slate-300 italic bg-slate-100 dark:bg-slate-700 rounded-lg"
                    : "p-2" // Assistant messages styled by prose-invert
                }
              >
                {isContentBlockArray(chat.content) ? (
                  // Render blocks individually with markdown
                  chat.content.map((block, blockIndex) => {
                    switch (block.type) {
                      case "thinking":
                        return (
                          // Dark mode: Adjust thinking block styles
                          <div
                            key={blockIndex}
                            className="relative mt-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600"
                          >
                            {/* Dark mode: Adjust thinking label styles */}
                            <span className="absolute -top-3 left-2 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-500">
                              Thinking
                            </span>
                            {/* Markdown inside should be handled by prose-invert */}
                            <MarkdownComponent markdown={block.thinking} />
                          </div>
                        );
                      case "redacted_thinking":
                        return null; // Don't render redacted thinking
                      case "image":
                        return (
                          <div key={blockIndex} className="w-full my-4">
                            {/* eslint-disable @next/next/no-img-element */}
                            {/* Make image responsive */}
                            <img
                              src={block.url}
                              className="w-full h-auto max-w-full rounded-md"
                              alt="AI Generated image"
                            />
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
        {showSpinner === true && (
          <div className="flex justify-center items-center w-full py-4">
            <Spinner spinnerSize={SpinnerSize.md} />
          </div>
        )}
      </div>
    );
  }
}
