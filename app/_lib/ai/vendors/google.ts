import {
  Content,
  GenerateContentRequest,
  GenerationConfig,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import {
  AIVendorAdapter,
  AIRequestOptions,
  AIResponse,
  VendorConfig,
} from "../types";
import { Chat, ChatResponse, ImageBlock } from "../../model";
import { Model } from "@prisma/client";
import { supabaseUploadFile } from "../../storage";
import { getCurrentAPIUser } from "../../auth";
import { updateUserUsage } from "../../server_actions/user.actions";

export class GoogleAIAdapter implements AIVendorAdapter {
  private client: GoogleGenerativeAI;
  public isVisionCapable: boolean;
  public isImageGenerationCapable: boolean;
  public isThinkingCapable: boolean;
  public inputTokenCost?: number | undefined;
  public outputTokenCost?: number | undefined;

  constructor(config: VendorConfig, model: Model) {
    this.client = new GoogleGenerativeAI(config.apiKey);
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
    const {
      model,
      messages,
      maxTokens,
      systemPrompt,
      thinkingMode,
      imageData,
    } = options;

    // Prepare system instruction
    /*
    let finalSystemInstruction = systemPrompt;
    if (thinkingMode) {
      const thinkingInstruction =
        "Please think through this step-by-step within <thinking></thinking> tags before providing your response.";
      finalSystemInstruction = systemPrompt
        ? `${systemPrompt}\n\n${thinkingInstruction}`
        : thinkingInstruction;
    }
        */
    const responseModalities = ["Text"];

    if (this.isImageGenerationCapable) {
      responseModalities.push("Image");
    }
    const generationConfig: GenerationConfig = {};
    (generationConfig as any).responseModalities = responseModalities;

    // Initialize the model with system instruction
    const genAI = this.client.getGenerativeModel({
      model,
      //systemInstruction: systemPrompt,
      generationConfig: generationConfig,
    });

    // Convert messages to Google AI format and handle images (excluding system messages)
    const formattedMessages = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => {
        const role = msg.role == "assistant" ? "model" : msg.role;
        if (typeof msg.content === "string") {
          return {
            role: role,
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
              case "image":
                return { text: "" };
              default:
                return { text: "" };
            }
          });
          return {
            role: role,
            parts,
          };
        }
      });
    /*
    const chat = genAI.startChat({
      history: formattedMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    const result = await chat.sendMessage(
      messages[messages.length - 1].content as string
    );
    const response = result.response;
*/
    /*
    const generateContentRequest: GenerateContentRequest = {
      contents: [
        {
          role: "user",
          parts: [{ text: "Generate an image of a dog." }],
        },
      ],
    };
    */

    const contents: GenerateContentRequest = {
      contents: formattedMessages,
    };
    const result = await genAI.generateContent(contents);
    const response = result.response;

    if (response.usageMetadata) {
      const inputTokens = response.usageMetadata.promptTokenCount;
      const outputTokens = response.usageMetadata.candidatesTokenCount;

      if (this.inputTokenCost && this.outputTokenCost) {
        const inputCost = inputTokens * (this.inputTokenCost / 1000000);
        const outputCost = outputTokens * (this.outputTokenCost / 1000000);
        const totalCost = inputCost + outputCost;
        updateUserUsage(user.id, totalCost);
      }
    }

    if (!response?.candidates?.[0]?.content?.parts) {
      throw new Error("Invalid response structure from Gemini API");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        return {
          role: "assistant",
          content: part.text,
        };
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        const filename = `gemini-${Date.now()}.png`;
        // Create a File-like object that supabaseUploadFile can handle
        const file = {
          name: filename,
          type: "image/png",
          arrayBuffer: async () => buffer,
          size: buffer.length,
        };
        const url = await supabaseUploadFile(filename, file as any);
        if (!url) {
          throw new Error("Failed to upload image to Supabase storage");
        }
        const imageBlock: ImageBlock = {
          type: "image",
          url: url,
        };
        return {
          role: "assistant",
          content: [imageBlock],
        };
      }
    }

    return {
      role: "assistant",
      content: response.text(),
    };
  }

  async generateImage(chat: Chat): Promise<string> {
    const { prompt } = chat;
    if (!prompt) {
      throw new Error("Prompt is required for image generation");
    }

    try {
      const model = this.client.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          // @ts-ignore - responseModalities is not in official types yet
          responseModalities: ["Text", "Image"],
        },
      });

      const response = await model.generateContent(prompt);

      if (!response?.response?.candidates?.[0]?.content?.parts) {
        throw new Error("Invalid response structure from Gemini API");
      }

      for (const part of response.response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const filename = `gemini-${Date.now()}.png`;
          // Create a File-like object that supabaseUploadFile can handle
          const file = {
            name: filename,
            type: "image/png",
            arrayBuffer: async () => buffer,
            size: buffer.length,
          };
          const url = await supabaseUploadFile(filename, file as any);
          if (!url) {
            throw new Error("Failed to upload image to Supabase storage");
          }
          return url;
        }
      }

      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Google Gemini image generation failed:", error);
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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
