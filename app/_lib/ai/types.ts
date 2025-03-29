import { Model } from "@prisma/client";
import { Chat, ChatResponse, ContentBlock, MCPTool } from "../model";

export interface Message {
  role: string;
  content: string | ContentBlock[];
}

export interface AIResponse {
  role: string;
  content: string | ContentBlock[];
}

export interface AIRequestOptions {
  model: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  imageData?: string;
  modelId?: number;
  thinkingMode?: boolean;
  budgetTokens?: number;
  prompt?: string;
}

export interface AIVendorAdapter {
  generateResponse(options: AIRequestOptions): Promise<AIResponse>;
  generateImage(chat: Chat): Promise<string>;
  sendChat(chat: Chat): Promise<ChatResponse>;
  sendMCPChat(chat: Chat, mcpToolData: MCPTool): Promise<ChatResponse>;
  isVisionCapable?: boolean;
  isImageGenerationCapable?: boolean;
  isThinkingCapable?: boolean;
  inputTokenCost?: number;
  outputTokenCost?: number;
}

export interface VendorConfig {
  apiKey: string;
  organizationId?: string;
  baseURL?: string;
}
