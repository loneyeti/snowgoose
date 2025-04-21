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
import { Logger } from "next-axiom"; // Re-add Logger import

export function initializeAIVendors() {
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
    let log = new Logger({ source: "chat-repository" }).with({
      userId: `${user?.id}`,
    }); // Use let for potential reassignment with userId
    log.info("sendChatAndUpdateCost repository method started.");
    if (!user) {
      log.error("No user found");
      throw new Error("Unauthorized");
    }
    const response = await adapter.sendChat(chat);
    if (response.usage) {
      log.info(
        `Response cost ${response.usage.totalCost}. Adding to user usage.`
      );
      await updateUserUsage(user.id, response.usage.totalCost);
    } else {
      log.warn("Response generated no usage.");
    }
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

    log.info("Getting AI vendor adapter", { modelId: chat.modelId });
    const adapter = await this.getVendorFactory(chat);
    log.info("AI vendor adapter obtained successfully.");

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
    log.info("Starting MCP tool handling", { mcpToolId: chat.mcpToolId });

    if (chat.mcpToolId && chat.mcpToolId !== 0) {
      log.info("Chat included MCP tool, attempting to find record.");
      // Use the correct findById method
      selectedMCPToolRecord = await mcpToolRepository.findById(chat.mcpToolId);
      if (selectedMCPToolRecord) {
        log.info("Found MCP tool record in DB", {
          toolName: selectedMCPToolRecord.name,
        });
        try {
          // Get detailed tool definitions from the manager
          log.info("Fetching tool definitions from MCP Manager.");
          const availableToolsInfo = await mcpManager.getAvailableTools(
            selectedMCPToolRecord
          );
          log.info("Received tool definitions from MCP Manager", {
            count: availableToolsInfo.length,
          });
          // Find the specific tool definition
          const formattedTools = availableToolsInfo.map((tool) => ({
            name: tool.name,
            description: tool.description || `Tool: ${tool.name}`,
            input_schema: tool.inputSchema,
          }));
          if (formattedTools && formattedTools.length > 0) {
            chat.mcpAvailableTools = formattedTools;
            log.info("Formatted and added available tools to chat object.");
          } else {
            log.warn(
              `Tool definitions formatted incorrectly or not found via mcpManager for tool: ${selectedMCPToolRecord.name}`
            );
          }
        } catch (error) {
          log.error(
            `Error fetching tool definitions for ${selectedMCPToolRecord.name}`,
            { error: String(error) }
          );
          // Proceed without the tool if definition fetch fails
        }
      } else {
        log.warn(`MCPTool record not found for ID: ${chat.mcpToolId}`);
      }
    } else {
      log.info("No MCP tool ID provided or it was 0.");
    }
    // --- End MCP Tool Handling ---

    // Initial chat completion call
    log.info("Sending initial chat request to adapter.");
    // Removed console.log for chat object before sending
    const initialResponse: ChatResponse = await this.sendChatAndUpdateCost(
      chat,
      adapter
    );
    log.info("Initial response received from adapter.");
    // Removed console.log for initial response object

    // Process initial response content for ImageDataBlocks
    initialResponse.content = await this.processResponseContent(
      initialResponse.content
    );

    // Check for ToolUseBlock in the initial response
    // Add explicit type ContentBlock for 'block' parameter
    log.info("Checking initial response for tool_use block.");
    const toolUseBlock = initialResponse.content.find(
      (block: ContentBlock): block is ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlock && selectedMCPToolRecord) {
      log.info("Tool use block found in initial response", {
        toolName: toolUseBlock.name,
        toolUseId: toolUseBlock.id, // Log the ID received from AI
      });
      // Removed console.log for tool use requested

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
      log.info("Extracted and validated toolUseId", { toolUseIdString });
      // Removed console.log

      // --- End Extract ---

      try {
        log.info("Parsing tool arguments from tool_use input.");
        const toolArgs = JSON.parse(toolUseBlock.input);
        log.info("Parsed tool arguments successfully.", { toolArgs });
        // Removed console.log

        // Execute the tool using MCPManager
        log.info("Executing tool via MCP Manager", {
          toolName: toolUseBlock.name,
        });
        const toolExecutionResult = await mcpManager.callTool(
          selectedMCPToolRecord,
          toolUseBlock.name,
          toolArgs
        );
        log.info("Received tool execution result from MCP Manager.");
        // Removed console.log

        // Construct ToolResultBlock
        log.info("Constructing ToolResultBlock.");
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
        log.info(
          "Updated chat history with initial response and tool result message."
        );

        // Clear tool information before the final call to prevent re-sending tools
        // This was the first fix and should remain.
        chat.mcpAvailableTools = [];
        chat.mcpToolId = 0; // Or null, depending on expected type, 0 seems safer based on initialization
        log.info("Cleared MCP tool information before final adapter call.");

        // Removed console.log for chat object before final sending

        // Call sendChat again with the updated history but without tools enabled
        log.info("Sending final chat request to adapter after tool use.");
        const finalResponse = await this.sendChatAndUpdateCost(chat, adapter);
        log.info("Received final response from adapter after tool use.");
        // Removed console.log for final response object

        // Process final response content for ImageDataBlocks
        finalResponse.content = await this.processResponseContent(
          finalResponse.content
        );

        return finalResponse;
      } catch (error) {
        log.error("Error processing tool use", { error: String(error) });
        // Optionally, return an error message or the initial response
        // For now, return the initial response (already processed for images)
        log.warn(
          "Returning initial response due to error during tool processing."
        );
        return initialResponse;
      }
    } else {
      log.info(
        "No tool use block found or no MCP tool selected, returning initial response."
      );
      // If no tool use or no selected tool record, return the initial response (already processed for images)
      return initialResponse;
    }
  }
}

export const chatRepository = new ChatRepository();
