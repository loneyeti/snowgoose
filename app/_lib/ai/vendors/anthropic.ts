import Anthropic from "@anthropic-ai/sdk";
import {
  AIVendorAdapter,
  AIRequestOptions,
  AIResponse,
  VendorConfig,
} from "../types";
import { Chat, ChatResponse } from "../../model";
import { Model } from "@prisma/client";

export class AnthropicAdapter implements AIVendorAdapter {
  private client: Anthropic;
  public isVisionCapable: boolean;
  public isImageGenerationCapable: boolean;
  public isThinkingCapable: boolean;

  constructor(config: VendorConfig, model: Model) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });

    this.isVisionCapable = model.isVision;
    this.isImageGenerationCapable = model.isImageGeneration;
    this.isThinkingCapable = model.isThinking;
  }

  async generateResponse(options: AIRequestOptions): Promise<AIResponse> {
    const {
      model,
      messages,
      maxTokens,
      budgetTokens,
      systemPrompt,
      thinkingMode,
    } = options;

    // Convert messages to Anthropic format
    // Convert messages to Anthropic format with inferred types
    const formattedMessages = messages.map((msg) => ({
      role:
        msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

    console.log(
      `Thinking Mode Status: ${thinkingMode} ${this.isThinkingCapable}`
    );

    const response = await this.client.messages.create({
      model,
      messages: formattedMessages,
      system: systemPrompt,
      max_tokens: maxTokens || 1024, // Default to 1024 if maxTokens is undefined
      ...(thinkingMode &&
        this.isThinkingCapable && {
          thinking: {
            type: "enabled",
            budget_tokens: budgetTokens || Math.floor((maxTokens || 1024) / 2), // Use provided budget or half of max tokens
          },
        }),
    });

    // Convert Anthropic response blocks to our ContentBlock format
    const contentBlocks = response.content
      .map((block) => {
        if (block.type === "thinking") {
          return {
            type: "thinking" as const,
            thinking: block.thinking,
            signature: "anthropic",
          };
        } else if (block.type === "text") {
          return {
            type: "text" as const,
            text: block.text,
          };
        }
        // Skip any unknown block types
        return null;
      })
      .filter((block): block is NonNullable<typeof block> => block !== null);

    return {
      role: "assistant",
      content: contentBlocks,
    };
  }

  async generateImage(chat: Chat): Promise<string> {
    throw new Error("Image generation not supported by Anthropic");
  }

  async sendChat(chat: Chat): Promise<ChatResponse> {
    console.log("CHAT:");
    console.log(JSON.stringify(chat));
    const response = await this.generateResponse({
      model: chat.model,
      messages: chat.responseHistory,
      maxTokens: chat.maxTokens || undefined,
      budgetTokens: chat.budgetTokens || undefined,
      systemPrompt: chat.personaPrompt || undefined,
      thinkingMode: true,
    });
    console.log("RESPONSE:");
    console.log(JSON.stringify(response));

    return {
      role: response.role,
      content: response.content,
    };
  }

  async sendMCPChat(chat: Chat, mcpToolData: any): Promise<ChatResponse> {
    // Add MCP tool context to the system prompt
    const mcpSystemPrompt = chat.personaId
      ? `You are ${chat.personaId}. You have access to the MCP tool: ${mcpToolData.name}`
      : `You have access to the MCP tool: ${mcpToolData.name}`;

    const response = await this.generateResponse({
      model: chat.model,
      messages: chat.responseHistory,
      maxTokens: chat.maxTokens || undefined,
      budgetTokens: chat.budgetTokens || undefined,
      systemPrompt: mcpSystemPrompt,
      thinkingMode: true,
    });

    return {
      role: response.role,
      content: response.content,
    };
  }
}
