import OpenAI from "openai";
import {
  AIVendorAdapter,
  AIRequestOptions,
  AIResponse,
  VendorConfig,
  Message,
} from "../types";
import { Chat, ChatResponse } from "../../model";
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
    console.log("OpenAIAdapter constructor - Model:", {
      id: model.id,
      name: model.name,
      isVision: model.isVision,
      apiName: model.apiName,
    });
    this.isVisionCapable = model.isVision;
    this.isImageGenerationCapable = model.isImageGeneration;
    this.isThinkingCapable = model.isThinking;

    if (model.inputTokenCost && model.outputTokenCost) {
      this.inputTokenCost = model.inputTokenCost;
      this.outputTokenCost = model.outputTokenCost;
    }

    console.log(
      "OpenAIAdapter initialized with isVisionCapable:",
      this.isVisionCapable
    );
  }

  async generateResponse(options: AIRequestOptions): Promise<AIResponse> {
    const user = await getCurrentAPIUser();
    if (!user) {
      throw new Error("User not found.");
    }
    const { model, messages, maxTokens, temperature = 1 } = options;
    console.log("generateResponse called with:", {
      model,
      isVisionCapable: this.isVisionCapable,
      hasImageData: !!options.imageData,
    });
    // Only use vision handling when both valid image data is present and model is vision capable
    /*
    if (this.isVisionCapable && options.imageData && options.imageData !== "") {
      console.log(
        `Vision requested with image. Image data: ${options.imageData}`
      );
      return this.handleVisionRequest(options);
    }
      */

    // Otherwise use regular chat completion
    console.log("Using regular chat completion");
    const response = await this.client.chat.completions.create({
      model,
      messages: messages as any[],
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    if (response.usage) {
      const inputTokens = response.usage.prompt_tokens;
      const outputTokens = response.usage.completion_tokens;
      console.log(
        `OpenAI usage. Input tokens: ${inputTokens}. OutputTokens: ${outputTokens}`
      );
      if (this.inputTokenCost && this.outputTokenCost) {
        const inputCost = inputTokens * (this.inputTokenCost / 1000000);
        const outputCost = outputTokens * (this.outputTokenCost / 1000000);
        const totalCost = inputCost + outputCost;
        updateUserUsage(user.id, totalCost);
      }
    }

    return {
      role: response.choices[0].message.role,
      content: content,
    };
  }

  /*private async handleVisionRequest(
    options: AIRequestOptions
  ): Promise<AIResponse> {
    const {
      prompt,
      imageData,
      systemPrompt,
      messages: existingMessages,
    } = options;
    console.log("Handling vision request");

    // Use existing messages if available, otherwise start with empty array
    const messages: Message[] = existingMessages ? [...existingMessages] : [];

    // Add current message with image
    messages.push({
      role: "user",
      content: [
        { type: "text", text: (prompt || "Analyze this image") as string },
        {
          type: "image_url",
          image_url: {
            url: imageData,
            detail: "low",
          },
        },
      ] as any, // Use any here since OpenAI's types differ from our ContentBlock
    });
    console.log("MESSAGES:");
    console.log(messages);
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: messages as any[],
      max_tokens: options.maxTokens || 1024,
    });

    console.log(JSON.stringify(response));

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return {
      role: response.choices[0].message.role,
      content: content,
    };
  }
    */

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

    console.log(JSON.stringify(chat));

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
