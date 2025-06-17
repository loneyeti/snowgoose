import { BaseRepository } from "./base.repository";
import { prisma } from "../prisma";
// Import necessary types from the model and snowgander
import {
  Chat,
  ChatResponse,
  Model,
  MCPTool,
  LocalChat,
  ImageBlock,
} from "../../model"; // Removed Message, ToolResultBlock, Added ImageBlock
import {
  AIVendorFactory,
  ModelConfig,
  Message, // Added Message import from snowgander
  ToolResultBlock, // Added ToolResultBlock import from snowgander
  MCPAvailableTool,
  ToolUseBlock,
  ContentBlock,
  ImageDataBlock,
  AIVendorAdapter,
  OpenAIImageGenerationOptions, // Added ImageDataBlock import from snowgander
  AIRequestOptions,
} from "snowgander"; // Added MCPAvailableTool, ToolUseBlock, ContentBlock
import { getApiVendor } from "../../server_actions/api_vendor.actions";
import { mcpManager } from "../../mcp/manager"; // Import MCP Manager
import { mcpToolRepository } from "./mcp-tool.repository"; // Import MCP Tool Repository
import { uploadBase64Image } from "../../storage"; // Import the new helper function
import { getCurrentAPIUser } from "../../auth";
import { SubscriptionPlanRepository } from "./subscription-plan.repository"; // Import SubscriptionPlan Repository class
import { updateUserUsage } from "../../server_actions/user.actions";
import { Logger } from "next-axiom"; // Re-add Logger import

export function initializeAIVendors() {
  // Initialize AI vendors using the imported factory
  if (process.env.OPENAI_API_KEY) {
    AIVendorFactory.setVendorConfig("openai", {
      apiKey: process.env.OPENAI_API_KEY,
      organizationId: process.env.OPENAI_ORG_ID,
    });
  }

  if (process.env.OPENAI_API_KEY) {
    AIVendorFactory.setVendorConfig("openai-image", {
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
}

initializeAIVendors();

// Instantiate repositories needed within ChatRepository
const subscriptionPlanRepo = new SubscriptionPlanRepository();

export class ChatRepository extends BaseRepository {
  // Helper function to process content blocks and upload images
  private async processResponseContent(
    content: ContentBlock[]
  ): Promise<ContentBlock[]> {
    const processedContent: ContentBlock[] = [];
    // Note: Using a new logger instance here, might want to pass the main one if userId is needed
    const log = new Logger({ source: "chat-repository-processContent" });
    log.info("Processing response content for image data blocks.");
    for (const block of content) {
      if (block.type === "image_data") {
        // Type guard for ImageDataBlock
        const imageDataBlock = block as ImageDataBlock;
        try {
          log.info("Uploading image data from response block", {
            mimeType: imageDataBlock.mimeType,
          });
          const imageUrl = await uploadBase64Image(
            imageDataBlock.base64Data,
            imageDataBlock.mimeType
          );
          const imageBlock: ImageBlock = { type: "image", url: imageUrl };
          processedContent.push(imageBlock);
          log.info("Image uploaded successfully from response block", {
            imageUrl,
          });
        } catch (error) {
          log.error("Failed to upload image from ImageDataBlock", {
            error: String(error),
          });
          // Optionally push an error message block or skip the block
          // For now, skipping the block if upload fails
        }
      } else {
        processedContent.push(block);
      }
    }
    return processedContent;
  }

  // Update return type to include vendor name
  private async getVendorFactory(
    chat: LocalChat
  ): Promise<{ adapter: AIVendorAdapter; vendorName: string }> {
    // Get the model from the database or throw error
    const model = await prisma.model.findUnique({
      where: { id: chat.modelId },
    });

    if (!model || !model.apiVendorId) {
      throw new Error("Model or Model Vendor not found");
    }

    // Get the model's vendor from the database or throw error
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
      inputTokenCost: model.inputTokenCost ?? undefined,
      outputTokenCost: model.outputTokenCost ?? undefined,
      imageOutputTokenCost: model.imageOutputTokenCost ?? undefined,
      webSearchCost: model.webSearchCost ?? undefined,
    };

    console.log(`Model Config: ${JSON.stringify(modelConfig)}`);

    // Get the appropriate AI vendor adapter using vendor name and model config
    const adapter = AIVendorFactory.getAdapter(apiVendor.name, modelConfig);
    // Return both adapter and vendor name
    return { adapter, vendorName: apiVendor.name };
  }

  private async sendChatAndUpdateCost(
    chat: LocalChat,
    adapter: AIVendorAdapter,
    vendorName: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    let response: ChatResponse;
    const user = await getCurrentAPIUser();
    const log = new Logger({ source: "chat-repository" }).with({
      userId: user?.id ? String(user.id) : "unknown",
    });

    // Get model details from database to ensure we have all properties
    const model = await prisma.model.findUnique({
      where: { id: chat.modelId },
    });
    if (!model) {
      throw new Error("Model not found");
    }

    // Prepare tools for the request
    const tools: AIRequestOptions["tools"] = [];
    if (model.isImageGeneration && vendorName === "openai") {
      // For models like GPT-4o that can generate images via tool use
      tools.push({ type: "image_generation" });
    }
    if (chat.useWebSearch) {
      log.info("Web search enabled, adding tool to request.", {
        model: model.apiName,
      });
      tools.push({ type: "web_search_preview" });
    }

    // Prepare messages from history
    const messages: Message[] = chat.responseHistory.map((chatResponse) => ({
      role: chatResponse.role,
      content: chatResponse.content,
    }));

    // Build a complete AIRequestOptions object from the LocalChat object
    const options: AIRequestOptions = {
      model: model.apiName,
      messages: messages,
      modelId: chat.modelId,
      systemPrompt: chat.systemPrompt ?? undefined,
      maxTokens: chat.maxTokens ?? undefined,
      budgetTokens: chat.budgetTokens ?? undefined,
      thinkingMode:
        model.isThinking && chat.budgetTokens && chat.budgetTokens > 1023
          ? true
          : false,
      tools: tools.length > 0 ? tools : undefined,
      visionUrl: chat.visionUrl ?? undefined,
      prompt: chat.prompt,
      // Pass through specific options for OpenAI image APIs
      openaiImageGenerationOptions: chat.openaiImageGenerationOptions,
      openaiImageEditOptions: chat.openaiImageEditOptions,
    };

    log.info(`Sending unified request to snowgander.`, {
      options: JSON.stringify({
        ...options,
        // Avoid logging potentially large message history
        messages: `[${options.messages.length} messages]`,
      }),
    });

    console.log(`Options for request: ${JSON.stringify(options)}`);

    // Make the single, unified call to generate a response
    response = await adapter.generateResponse(options);

    console.log(`Response: ${JSON.stringify(response)}`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // --- Cost Calculation and User Usage Update ---
    let cost = 0;
    // Check if the usage object and the totalCost field exist in the response from snowgander.
    if (response.usage && typeof response.usage.totalCost === "number") {
      // Log the usage object from snowgander for debugging purposes.
      console.log(
        "Received usage object from snowgander:",
        JSON.stringify(response.usage, null, 2)
      );

      // Directly use the totalCost provided by snowgander.
      cost = response.usage.totalCost;
    } else {
      // Log a warning if usage information is missing.
      console.warn(
        "Usage information or totalCost not found in the response from snowgander. Defaulting to 0.",
        {
          usageObject: response.usage,
        }
      );
    }

    // OpenAI does not yet report the usage of image generation into its usage API object
    // so we must hard-code it here. Hopefully that changes soon.
    if (response.usage?.didGenerateImage) {
      cost = cost + 0.25;
    }

    console.log(`Prompt cost: ${cost}`);

    if (cost > 0 && user) {
      await updateUserUsage(user.id, cost);
    }

    log.info(
      `Chat sent to ${vendorName}. Duration: ${duration}ms, Cost: $${cost.toFixed(6)}`
    );
    return response;
  }

  async sendChat(chat: LocalChat): Promise<ChatResponse | string> {
    let log = new Logger({ source: "chat-repository" }).with({ userId: "" }); // Use let for potential reassignment with userId
    log.info("sendChat repository method started.");

    // --- Usage Limit Check ---
    const user = await getCurrentAPIUser();
    if (!user) {
      log.error("Unauthorized: User not found for usage check.");
      throw new Error("Unauthorized: User not found for usage check.");
    }
    // Add user ID to logger context
    log = log.with({ userId: user.id });
    log.info("Starting usage limit check.");

    // Check if user has a subscription plan linked
    if (user.stripePriceId) {
      try {
        // Use the instantiated repository
        const plan = await subscriptionPlanRepo.findByStripePriceId(
          user.stripePriceId
        );

        // Check if a plan exists and has a usage limit defined (limit > 0)
        if (plan && plan.usageLimit && plan.usageLimit > 0) {
          // Compare usage (ensure periodUsage is not null, default to 0 if it is)
          const currentUsage = user.periodUsage ?? 0;
          if (currentUsage >= plan.usageLimit) {
            log.warn(
              `User ${user.email} exceeded usage limit. Usage: ${currentUsage}, Limit: ${plan.usageLimit}`
            );
            // Throw a specific, unique error string
            throw new Error("USAGE_LIMIT_EXCEEDED");
          } else {
            log.info("User is within usage limits or plan has no limit.");
          }
        } else {
          log.info("User plan not found or has no usage limit defined.");
        }
      } catch (error) {
        log.error("Error checking usage limit", { error: String(error) });
        // Decide how to handle errors during the check (e.g., allow request, throw error)
        // For safety, let's throw an error to prevent potential over-usage if check fails
        throw new Error(
          "Failed to verify usage limit. Please try again later."
        );
      }
    }
    // --- End Usage Limit Check ---

    // Get the model details to properly access vendor name
    const model = await prisma.model.findUnique({
      where: { id: chat.modelId },
      include: { apiVendor: true },
    });
    if (!model || !model.apiVendor) {
      throw new Error("Model or Vendor not found");
    }
    const vendorName = model.apiVendor.name.toLowerCase();

    // Get the adapter and vendor name
    const { adapter } = await this.getVendorFactory(chat);

    // --- Initial Call to AI ---
    let response = await this.sendChatAndUpdateCost(chat, adapter, vendorName);

    // --- Handle Multi-Turn for MCP Tool Use ---
    const toolUseBlock = response.content.find(
      (block): block is ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlock && chat.mcpToolId) {
      log.info("Tool use detected, calling MCP tool.", {
        toolName: toolUseBlock.name,
      });

      const mcpTool = await mcpToolRepository.findById(chat.mcpToolId);
      if (!mcpTool) {
        throw new Error("MCP Tool not found for tool use block.");
      }

      // Parse the tool input JSON string to object
      const toolInput = JSON.parse(toolUseBlock.input);
      const toolResult = await mcpManager.callTool(
        mcpTool,
        toolUseBlock.name,
        toolInput
      );

      if (!toolUseBlock.id) {
        throw new Error(
          "Received a ToolUseBlock from the AI without a tool use ID."
        );
      }
      const toolUseIdString = toolUseBlock.id;

      const toolResultBlock: ToolResultBlock = {
        type: "tool_result",
        toolUseId: toolUseIdString,
        content: [{ type: "text", text: JSON.stringify(toolResult) }],
      };

      // Create updated chat history for the final call
      const updatedHistory = [
        ...chat.responseHistory,
        { role: "assistant", content: response.content },
        { role: "user", content: [toolResultBlock] },
      ];

      const finalChat: LocalChat = {
        ...chat,
        responseHistory: updatedHistory,
      };

      log.info("Sending tool results back to the model.");
      response = await this.sendChatAndUpdateCost(
        finalChat,
        adapter,
        vendorName
      );
    }

    // --- Process final response content (e.g., upload generated images) ---
    response.content = await this.processResponseContent(response.content);

    return response;
  }
}

export const chatRepository = new ChatRepository();
