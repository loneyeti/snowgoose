import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AIVendorAdapter,
  AIRequestOptions,
  AIResponse,
  VendorConfig,
} from "../types";
import { Chat, ChatResponse } from "../../model";
import { Model } from "@prisma/client";

export class GoogleAIAdapter implements AIVendorAdapter {
  private client: GoogleGenerativeAI;
  public isVisionCapable: boolean;
  public isImageGenerationCapable: boolean;
  public isThinkingCapable: boolean;

  constructor(config: VendorConfig, model: Model) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.isVisionCapable = model.isVision;
    this.isImageGenerationCapable = model.isImageGeneration;
    this.isThinkingCapable = model.isThinking;
  }

  async generateResponse(options: AIRequestOptions): Promise<AIResponse> {
    const {
      model,
      messages,
      maxTokens,
      systemPrompt,
      thinkingMode,
      imageData,
    } = options;

    // Initialize the model
    const genAI = this.client.getGenerativeModel({ model });

    // Convert messages to Google AI format and handle images
    const formattedMessages = messages.map((msg) => {
      if (typeof msg.content === "string") {
        return {
          role: msg.role,
          parts: [{ text: msg.content }],
        };
      } else {
        // Handle content blocks
        const parts = msg.content.map((block) => {
          switch (block.type) {
            case "text":
              return { text: block.text };
            case "thinking":
              return { text: `<thinking>${block.thinking}</thinking>` };
            case "redacted_thinking":
              return {
                text: `<redacted_thinking>${block.data}</redacted_thinking>`,
              };
            default:
              return { text: "" };
          }
        });
        return {
          role: msg.role,
          parts,
        };
      }
    });

    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.unshift({
        role: "system",
        parts: [{ text: systemPrompt }],
      });
    }

    // If thinking mode is enabled, add a special prompt
    if (thinkingMode) {
      formattedMessages.push({
        role: "system",
        parts: [
          {
            text: "Please think through this step-by-step within <thinking></thinking> tags before providing your response.",
          },
        ],
      });
    }

    const chat = genAI.startChat({
      history: formattedMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    const result = await chat.sendMessage(
      messages[messages.length - 1].content as string
    );
    const response = await result.response;

    return {
      role: "assistant",
      content: response.text(),
    };
  }

  async generateImage(chat: Chat): Promise<string> {
    throw new Error("Image generation not supported by Google AI");
  }

  async sendChat(chat: Chat): Promise<ChatResponse> {
    const response = await this.generateResponse({
      model: chat.model,
      messages: chat.responseHistory,
      maxTokens: chat.maxTokens || undefined,
      systemPrompt: chat.personaId ? `You are ${chat.personaId}` : undefined,
      imageData: chat.imageData || undefined,
      thinkingMode: true,
    });

    return {
      role: response.role,
      content: response.content,
    };
  }

  async sendMCPChat(chat: Chat, mcpToolData: any): Promise<ChatResponse> {
    throw new Error("MCP tools not supported by Google AI");
  }
}
