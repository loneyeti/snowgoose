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
  AIVendorAdapter, // Added ImageDataBlock import from snowgander
} from "snowgander"; // Added MCPAvailableTool, ToolUseBlock, ContentBlock
import { getApiVendor } from "../../server_actions/api_vendor.actions";
import { mcpManager } from "../../mcp/manager"; // Import MCP Manager
import { mcpToolRepository } from "./mcp-tool.repository"; // Import MCP Tool Repository
import { uploadBase64Image } from "../../storage"; // Import the new helper function
import { getCurrentAPIUser } from "../../auth";
import { SubscriptionPlanRepository } from "./subscription-plan.repository"; // Import SubscriptionPlan Repository class
import { updateUserUsage } from "../../server_actions/user.actions";
import { Logger } from "next-axiom";

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

// Instantiate repositories needed within ChatRepository
const subscriptionPlanRepo = new SubscriptionPlanRepository();

export class ChatRepository extends BaseRepository {
  // Helper function to process content blocks and upload images
  private async processResponseContent(
    content: ContentBlock[]
  ): Promise<ContentBlock[]> {
    const processedContent: ContentBlock[] = [];
    const log = new Logger();
    for (const block of content) {
      if (block.type === "image_data") {
        // Type guard for ImageDataBlock
        const imageDataBlock = block as ImageDataBlock;
        try {
          console.log(
            `Uploading image data (mime: ${imageDataBlock.mimeType})...`
          );
          const imageUrl = await uploadBase64Image(
            imageDataBlock.base64Data,
            imageDataBlock.mimeType
          );
          const imageBlock: ImageBlock = { type: "image", url: imageUrl };
          processedContent.push(imageBlock);
          console.log(`Image uploaded successfully: ${imageUrl}`);
        } catch (error) {
          log.error(`Failed to upload image from ImageDataBlock: ${error}`);
          // Optionally push an error message block or skip the block
          // For now, skipping the block if upload fails
        }
      } else {
        processedContent.push(block);
      }
    }
    return processedContent;
  }

  private async getVendorFactory(chat: LocalChat): Promise<AIVendorAdapter> {
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
      isThinking: model.isThinking, // Use isThinking
      inputTokenCost: model.inputTokenCost ?? undefined,
      outputTokenCost: model.outputTokenCost ?? undefined,
    };

    // Get the appropriate AI vendor adapter using vendor name and model config
    return AIVendorFactory.getAdapter(apiVendor.name, modelConfig);
  }

  private async sendChatAndUpdateCost(
    chat: LocalChat,
    adapter: AIVendorAdapter
  ): Promise<ChatResponse> {
    const user = await getCurrentAPIUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const response = await adapter.sendChat(chat);
    if (response.usage) {
      await updateUserUsage(user.id, response.usage.totalCost);
    }
    return response;
  }

  async sendChat(chat: LocalChat): Promise<ChatResponse | string> {
    // --- Usage Limit Check ---
    const user = await getCurrentAPIUser();
    const log = new Logger();
    if (!user) {
      throw new Error("Unauthorized: User not found for usage check.");
    }

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
          }
        }
      } catch (error) {
        log.error(`Error checking usage limit: ${error}`);
        // Decide how to handle errors during the check (e.g., allow request, throw error)
        // For safety, let's throw an error to prevent potential over-usage if check fails
        throw new Error(
          "Failed to verify usage limit. Please try again later."
        );
      }
    }
    // --- End Usage Limit Check ---

    const adapter = await this.getVendorFactory(chat);

    /*
    // For DALL-E image generation. Will be depreciated soon.
    if (modelConfig.isImageGeneration && model.apiName === "dall-e-3") {
      // Assuming generateImage takes just the prompt string based on snowgander README
      const imageUrl = await adapter.generateImage(chat);
      return imageUrl;
    }
      */

    // --- MCP Tool Handling ---
    let selectedMCPToolRecord: MCPTool | null = null;
    chat.mcpAvailableTools = []; // Initialize as empty

    if (chat.mcpToolId && chat.mcpToolId !== 0) {
      console.log("CHAT INCLUDED MCP TOOL");
      // Use the correct findById method
      selectedMCPToolRecord = await mcpToolRepository.findById(chat.mcpToolId);
      if (selectedMCPToolRecord) {
        console.log("FOUND MCP TOOL IN DB");
        try {
          // Get detailed tool definitions from the manager
          const availableToolsInfo = await mcpManager.getAvailableTools(
            selectedMCPToolRecord
          );
          // Find the specific tool definition
          console.log(`FOUND MCP TOOL RECORD: ${availableToolsInfo}`);
          const formattedTools = availableToolsInfo.map((tool) => ({
            name: tool.name,
            description: tool.description || `Tool: ${tool.name}`,
            input_schema: tool.inputSchema,
          }));
          if (formattedTools) {
            chat.mcpAvailableTools = formattedTools;
          } else {
            log.warn(
              `Tool definition not found via mcpManager for tool: ${selectedMCPToolRecord.name}`
            );
          }
        } catch (error) {
          log.error(
            `Error fetching tool definitions for ${selectedMCPToolRecord.name}: ${error}`
          );
          // Proceed without the tool if definition fetch fails
        }
      } else {
        log.warn(`MCPTool record not found for ID: ${chat.mcpToolId}`);
      }
    }
    // --- End MCP Tool Handling ---

    // Initial chat completion call
    console.log(
      `Chat before initial sending: ${JSON.stringify(chat, null, 2)}`
    );
    const initialResponse: ChatResponse = await this.sendChatAndUpdateCost(
      chat,
      adapter
    );
    console.log(
      // Fix: Added console.log(
      `Initial response received: ${JSON.stringify(initialResponse, null, 2)}`
    ); // Fix: Moved closing parenthesis

    // Process initial response content for ImageDataBlocks
    initialResponse.content = await this.processResponseContent(
      initialResponse.content
    );

    // Check for ToolUseBlock in the initial response
    // Add explicit type ContentBlock for 'block' parameter
    const toolUseBlock = initialResponse.content.find(
      (block: ContentBlock): block is ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlock && selectedMCPToolRecord) {
      console.log(`Tool use requested: ${toolUseBlock.name}`);

      // --- Extract and validate the toolUseId ---
      // Check if the ID exists and is a non-empty string, as required by vendors like Anthropic
      if (
        !toolUseBlock.id ||
        typeof toolUseBlock.id !== "string" ||
        toolUseBlock.id.trim() === ""
      ) {
        log.error(
          "ToolUseBlock received from AI is missing the required 'id' field for tool processing flow."
        );
        // Throw an error because the subsequent ToolResultBlock requires a valid string ID.
        throw new Error(
          "Tool use requested by AI is missing the required 'id'. Cannot proceed."
        );
      }
      const toolUseIdString = toolUseBlock.id; // ID is present and is a string
      console.log(`Extracted and validated toolUseId: ${toolUseIdString}`);
      // --- End Extract ---

      try {
        const toolArgs = JSON.parse(toolUseBlock.input);
        console.log(`Parsed tool args: ${JSON.stringify(toolArgs)}`);

        // Execute the tool using MCPManager
        const toolExecutionResult = await mcpManager.callTool(
          selectedMCPToolRecord,
          toolUseBlock.name,
          toolArgs
        );
        console.log(
          `Tool execution result: ${JSON.stringify(toolExecutionResult)}`
        );

        // Construct ToolResultBlock
        // Construct ToolResultBlock using the validated string ID
        const toolResultBlock: ToolResultBlock = {
          type: "tool_result",
          toolUseId: toolUseIdString, // Use the validated string ID here
          content: toolExecutionResult.content as ContentBlock[], // Assuming result structure matches
          // isError is not part of the standard ToolResultBlock type
        };

        // Update chat history according to standard multi-turn tool use flow:
        // 1. Add the assistant's message that requested the tool use
        chat.responseHistory.push(initialResponse);
        // 2. Add a user message containing the tool result
        const toolResultMessage: Message = {
          role: "user", // Per Anthropic's flow for tool results
          content: [toolResultBlock],
          // Usage might not be applicable here or should be zeroed
        };
        chat.responseHistory.push(toolResultMessage);

        // Clear tool information before the final call to prevent re-sending tools
        // This was the first fix and should remain.
        chat.mcpAvailableTools = [];
        chat.mcpToolId = 0; // Or null, depending on expected type, 0 seems safer based on initialization

        console.log(
          `Chat before final sending (with tool result): ${JSON.stringify(
            chat, // Log the original chat object with updated history and cleared tools
            null,
            2
          )}`
        );
        // Call sendChat again with the updated history but without tools enabled
        const finalResponse = await this.sendChatAndUpdateCost(chat, adapter);
        console.log(
          `Final response received after tool use: ${JSON.stringify(
            finalResponse,
            null,
            2
          )}`
        );

        // Process final response content for ImageDataBlocks
        finalResponse.content = await this.processResponseContent(
          finalResponse.content
        );

        return finalResponse;
      } catch (error) {
        log.error(`Error processing tool use: ${error}`);
        // Optionally, return an error message or the initial response
        // For now, return the initial response (already processed for images)
        return initialResponse;
      }
    } else {
      // If no tool use or no selected tool record, return the initial response (already processed for images)
      return initialResponse;
    }
  }
}

export const chatRepository = new ChatRepository();
