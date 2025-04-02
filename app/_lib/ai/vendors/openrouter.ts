import OpenAI from "openai";
import {
  AIVendorAdapter,
  AIRequestOptions,
  AIResponse,
  VendorConfig,
  Message,
} from "../types";
import { Chat, ChatResponse, ContentBlock } from "../../model";
import { Model } from "@prisma/client";
import { getCurrentAPIUser } from "../../auth";
import { updateUserUsage } from "../../server_actions/user.actions";

export class OpenRouterAdapter implements AIVendorAdapter {
  private client: OpenAI;
  public isVisionCapable: boolean;
  public isImageGenerationCapable: boolean;
  public isThinkingCapable: boolean;
  public inputTokenCost?: number | undefined;
  public outputTokenCost?: number | undefined;

  constructor(config: VendorConfig, model: Model) {
    const siteURL = process.env.NEXT_PUBLIC_BASE_URL;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": `${siteURL}`,
        "X-Title": "SnowGoose AI Assistant", // Application name
      },
    });

    this.isVisionCapable = model.isVision;
    this.isImageGenerationCapable = model.isImageGeneration;
    this.isThinkingCapable = model.isThinking;
    if (model.inputTokenCost && model.outputTokenCost) {
      this.inputTokenCost = model.inputTokenCost;
      this.outputTokenCost = model.outputTokenCost;
    }
  }

  async generateResponse(options: AIRequestOptions): Promise<AIResponse> {
    const user = await getCurrentAPIUser();
    if (!user) {
      throw new Error("User not found.");
    }
    const { model, messages, maxTokens, temperature = 1 } = options;

    const response = await this.client.chat.completions.create({
      model,
      messages: messages as any[],
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenRouter");
    }

    if (response.usage) {
      const inputTokens = response.usage.prompt_tokens;
      const outputTokens = response.usage.completion_tokens;

      if (this.inputTokenCost && this.outputTokenCost) {
        const inputCost = inputTokens * (this.inputTokenCost / 1000000);
        const outputCost = outputTokens * (this.outputTokenCost / 1000000);
        const totalCost = inputCost + outputCost;
        updateUserUsage(user.id, totalCost);
      }
    }

    const responseBlock: ContentBlock[] = [
      {
        type: "text",
        text: content,
      },
    ];

    return {
      role: response.choices[0].message.role,
      content: responseBlock,
    };
  }

  async generateImage(chat: Chat): Promise<string> {
    throw new Error("Image generation not supported by OpenRouter");
  }

  async sendChat(chat: Chat): Promise<ChatResponse> {
    const previousMessages = chat.responseHistory.slice(0, -1);
    const messages = chat.personaPrompt
      ? [{ role: "system", content: chat.personaPrompt }, ...previousMessages]
      : previousMessages;

    const currentMessage =
      chat.responseHistory[chat.responseHistory.length - 1];
    messages.push(currentMessage);

    const response = await this.generateResponse({
      model: chat.model,
      messages: messages,
      maxTokens: chat.maxTokens || undefined,
      systemPrompt:
        messages[0]?.role === "system"
          ? (messages[0].content as string)
          : undefined,
    });

    return {
      role: response.role,
      content: response.content,
    };
  }

  async sendMCPChat(chat: Chat, mcpToolData: any): Promise<ChatResponse> {
    throw new Error("MCP tools not supported by OpenRouter");
  }
}
