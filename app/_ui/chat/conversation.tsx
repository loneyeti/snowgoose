import { ChatResponse, ContentBlock } from "../../_lib/model";
import { SpinnerSize, Spinner } from "../spinner";
import MarkdownComponent from "../markdown-parser";
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
  if (chats.length === 0 && imageURL === "" && !showSpinner) {
    return (
      <div className="grid w-full h-full place-items-center">
        <h1 className="text-3xl text-slate-500 font-thin">
          Welcome to Snowgoose
        </h1>
      </div>
    );
  } else if (imageURL !== "") {
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
      <div className="grid w-full h-full">
        <div className="prose lg:w-[65ch] mx-auto">
          {chats && chats.length > 0 ? (
            chats.map((chat: ChatResponse, index) => (
              <div
                key={index}
                className={
                  chat.role === "user"
                    ? "px-6 py-1 text-sm text-slate-600 italic bg-slate-100 rounded-lg"
                    : "p-2"
                }
              >
                {isContentBlockArray(chat.content) ? (
                  // Render blocks individually with markdown
                  chat.content.map((block, blockIndex) => {
                    switch (block.type) {
                      case "thinking":
                        return (
                          <div
                            key={blockIndex}
                            className="relative mt-4 mb-4 p-4 bg-slate-50 rounded-md border border-slate-200"
                          >
                            <span className="absolute -top-3 left-2 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                              Thinking
                            </span>
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
                          // Add overflow-x-auto for potential wide code blocks within markdown
                          <div key={blockIndex} className="overflow-x-auto">
                            <MarkdownComponent markdown={block.text} />
                          </div>
                        );
                      default:
                        return null; // Should not happen with validated types
                    }
                  })
                ) : (
                  // Add overflow-x-auto for potential wide code blocks within markdown
                  <div className="overflow-x-auto">
                    <MarkdownComponent markdown={chat.content} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>&nbsp;</p>
          )}
        </div>
        {showSpinner === true && <Spinner spinnerSize={SpinnerSize.md} />}
      </div>
    );
  }
}
