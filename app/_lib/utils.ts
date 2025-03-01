import { nanoid } from "nanoid";
import { ChatResponse, TextBlock, ThinkingBlock, ContentBlock } from "./model";

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
