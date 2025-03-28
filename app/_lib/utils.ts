import { nanoid } from "nanoid";
import { ZodError } from "zod";
import { ChatResponse, TextBlock, ThinkingBlock, ContentBlock } from "./model";
import { FormState } from "./form-schemas";

export function generateUniqueFilename(filename: string) {
  // Extract the file extension from the input filename
  const extension = filename.split(".").pop();

  return `${nanoid()}.${extension}`;
}

// Anthropic thinking block utilities

export function isContentBlockArray(
  content: string | ContentBlock[]
): content is ContentBlock[] {
  return Array.isArray(content);
}

export function contentBlockToString(block: ContentBlock): string {
  switch (block.type) {
    case "thinking":
      return block.thinking;
    case "redacted_thinking":
      return ""; // Skip redacted thinking blocks
    case "text":
      return block.text;
    case "image":
      return block.url;
  }
}

/**
 * Gets the visible text from a ChatResponse
 * Filters out thinking blocks and returns only text content
 */
export function getVisibleText(response: ChatResponse): string {
  if (typeof response.content === "string") {
    return response.content;
  }

  // If content is an array of blocks, find text blocks and concat their content
  return response.content
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Gets the thinking blocks from a response if they exist
 */
export function getThinkingBlocks(response: ChatResponse): ThinkingBlock[] {
  if (typeof response.content === "string") {
    return [];
  }

  return response.content.filter(
    (block): block is ThinkingBlock => block.type === "thinking"
  );
}

/**
 * Checks if a response has thinking blocks
 */
export function hasThinking(response: ChatResponse): boolean {
  if (typeof response.content === "string") {
    return false;
  }

  return response.content.some(
    (block) => block.type === "thinking" || block.type === "redacted_thinking"
  );
}

/**
 * Centralized error handler for Server Actions.
 * Logs the full error server-side and returns a user-friendly FormState object.
 * Handles ZodErrors specifically to return field errors.
 * @param error The error object caught in the Server Action.
 * @param genericMessage Optional custom generic error message.
 * @returns A FormState object suitable for returning from a Server Action.
 */
export function handleServerError(
  error: unknown,
  genericMessage = "An unexpected error occurred. Please try again."
): FormState {
  // Log the full error server-side for debugging
  console.error("Server Action Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      success: false,
      fieldErrors: error.flatten().fieldErrors,
      error: "Validation failed. Please check the highlighted fields.", // Optional: provide a general validation error message
    };
  }

  // Handle generic errors
  return {
    success: false,
    error: genericMessage,
  };
}
