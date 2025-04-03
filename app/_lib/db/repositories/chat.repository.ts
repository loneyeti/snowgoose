import { BaseRepository } from "./base.repository";
import { prisma } from "../prisma";
// Chat and ChatResponse are now re-exported from ../../model, which imports them from the package
import { Chat, ChatResponse, Model } from "../../model"; // Added Model import
// Import factory and necessary types from the new package
import { AIVendorFactory, ModelConfig } from "snowgander";
import { getApiVendor } from "../../server_actions/api_vendor.actions";

// Initialize AI vendors using the imported factory
if (process.env.OPENAI_API_KEY) {
  AIVendorFactory.setVendorConfig("openai", {
    apiKey: process.env.OPENAI_API_KEY,
    organizationId: process.env.OPENAI_ORG_ID,
  });
}

if (process.env.ANTHROPIC_API_KEY) {
  AIVendorFactory.setVendorConfig("anthropic", {
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

if (process.env.GOOGLE_API_KEY) {
  AIVendorFactory.setVendorConfig("google", {
    apiKey: process.env.GOOGLE_API_KEY,
  });
}

if (process.env.OPENROUTER_API_KEY) {
  AIVendorFactory.setVendorConfig("openrouter", {
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

export class ChatRepository extends BaseRepository {
  async sendChat(
    chat: Chat,
    mcpToolData?: any
  ): Promise<ChatResponse | string> {
    // Get the model from the database
    const model = await prisma.model.findUnique({
      where: { id: chat.modelId },
    });

    if (!model || !model.apiVendorId) {
      throw new Error("Model or Model Vendor not found");
    }

    const apiVendor = await getApiVendor(model.apiVendorId);
    // Add null check for apiVendor before proceeding
    if (!apiVendor) {
      throw new Error(`API Vendor not found for ID: ${model.apiVendorId}`);
    }

    // Create ModelConfig object from the Prisma model
    const modelConfig: ModelConfig = {
      apiName: model.apiName,
      isVision: model.isVision,
      isImageGeneration: model.isImageGeneration,
      isThinking: model.isThinking,
      inputTokenCost: model.inputTokenCost ?? undefined, // Handle potential null
      outputTokenCost: model.outputTokenCost ?? undefined, // Handle potential null
    };

    // Get the appropriate AI vendor adapter using vendor name and model config
    // No longer async
    const adapter = AIVendorFactory.getAdapter(apiVendor.name, modelConfig);

    // For DALL-E image generation
    if (model.apiName === "dall-e-3") {
      const imageUrl = await adapter.generateImage(chat);
      return imageUrl;
    }

    // For MCP tools with Anthropic
    if (mcpToolData && apiVendor?.name === "anthropic") {
      // 2 is Anthropic's vendor ID
      return await adapter.sendMCPChat(chat, mcpToolData);
    }

    // Standard chat completion
    return await adapter.sendChat(chat);
  }
}

export const chatRepository = new ChatRepository();
