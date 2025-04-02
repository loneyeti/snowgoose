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
import { json } from "stream/consumers";
import { getCurrentAPIUser } from "../../auth";
import { updateUserUsage } from "../../server_actions/user.actions";

export class OpenAIAdapter implements AIVendorAdapter {
  private client: OpenAI;
  public isVisionCapable: boolean;
  public isImageGenerationCapable: boolean;
  public isThinkingCapable: boolean;
  public inputTokenCost?: number | undefined;
  public outputTokenCost?: number | undefined;

  constructor(config: VendorConfig, model: Model) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
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

    const response = await this.client.responses.create({
      model: model,
      instructions: options.systemPrompt,
      input: messages as any[],
    });

    /*
    const response = await this.client.chat.completions.create({
      model,
      messages: messages as any[],
      max_tokens: maxTokens,
      temperature,
    });
    */

    const content = response.output_text;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    if (response.usage) {
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

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
      role: "assistant",
      content: responseBlock,
    };
  }

  async generateImage(chat: Chat): Promise<string> {
    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt: chat.prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data?.[0]?.url) {
      throw new Error("No image URL received from OpenAI");
    }

    return response.data[0].url;
  }

  async sendChat(chat: Chat): Promise<ChatResponse> {
    // Filter out the last user message since we'll add it with image if needed
    const previousMessages = chat.responseHistory.slice(0, -1);

    // Add system prompt if it exists
    const messages = chat.personaPrompt
      ? [{ role: "system", content: chat.personaPrompt }, ...previousMessages]
      : previousMessages;

    // Add current message, potentially with image
    const currentMessage =
      chat.responseHistory[chat.responseHistory.length - 1];
    if (chat.imageData) {
      // For vision messages, use OpenAI's format directly with type assertion
      messages.push({
        role: "user",
        content: [
          { type: "text", text: currentMessage.content as string },
          {
            type: "image_url",
            image_url: {
              url: chat.imageData,
              detail: "low",
            },
          },
        ] as any, // Use any to bypass type checking for OpenAI's vision format
      });
    } else {
      messages.push(currentMessage);
    }

    // Clear image data after constructing the message to prevent reuse
    chat.imageData = null;

    const response = await this.generateResponse({
      model: chat.model,
      messages: messages,
      maxTokens: chat.maxTokens || undefined,
      systemPrompt:
        messages[0]?.role === "system"
          ? (messages[0].content as string)
          : undefined,
      imageData: chat.imageData ?? undefined,
    });

    //console.log(JSON.stringify(response));

    return {
      role: response.role,
      content: response.content,
    };
  }

  async sendMCPChat(chat: Chat, mcpToolData: any): Promise<ChatResponse> {
    throw new Error("MCP tools not supported by OpenAI");
  }
}
