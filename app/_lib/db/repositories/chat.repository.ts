import { BaseRepository } from "./base.repository";
import { prisma } from "../prisma";
import { Chat, ChatResponse } from "../../model";
import { AIVendorFactory } from "../../ai/factory";

// Initialize AI vendors
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

    if (!model) {
      throw new Error(`Model not found with ID: ${chat.modelId}`);
    }

    // Get the appropriate AI vendor adapter
    const adapter = await AIVendorFactory.getAdapter(model);

    // For DALL-E image generation
    if (model.apiName === "dall-e-3") {
      const imageUrl = await adapter.generateImage(chat);
      return imageUrl;
    }

    // For MCP tools with Anthropic
    if (mcpToolData && model.apiVendorId === 2) {
      // 2 is Anthropic's vendor ID
      return await adapter.sendMCPChat(chat, mcpToolData);
    }

    // Standard chat completion
    return await adapter.sendChat(chat);
  }
}

export const chatRepository = new ChatRepository();
