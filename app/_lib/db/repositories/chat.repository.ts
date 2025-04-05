import { BaseRepository } from "./base.repository";
import { prisma } from "../prisma";
// Import necessary types from the model and snowgander
import { Chat, ChatResponse, Model, MCPTool, LocalChat } from "../../model"; // Removed Message, ToolResultBlock
import {
  AIVendorFactory,
  ModelConfig,
  Message, // Added Message import from snowgander
  ToolResultBlock, // Added ToolResultBlock import from snowgander
  MCPAvailableTool,
  ToolUseBlock,
  ContentBlock,
} from "snowgander"; // Added MCPAvailableTool, ToolUseBlock, ContentBlock
import { getApiVendor } from "../../server_actions/api_vendor.actions";
import { mcpManager } from "../../mcp/manager"; // Import MCP Manager
import { mcpToolRepository } from "./mcp-tool.repository"; // Import MCP Tool Repository

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
  async sendChat(chat: LocalChat): Promise<ChatResponse | string> {
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
      isThinking: model.isThinking, // Use isThinking
      inputTokenCost: model.inputTokenCost ?? undefined,
      outputTokenCost: model.outputTokenCost ?? undefined,
    };

    // Get the appropriate AI vendor adapter using vendor name and model config
    const adapter = AIVendorFactory.getAdapter(apiVendor.name, modelConfig);

    // For DALL-E image generation (Keep this logic)
    // Use isImageGeneration based on type definition
    if (modelConfig.isImageGeneration && model.apiName === "dall-e-3") {
      // Assuming generateImage takes just the prompt string based on snowgander README
      const imageUrl = await adapter.generateImage(chat);
      return imageUrl;
    }

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
          /*const toolInfo = availableToolsInfo.find(
            (t) => t.name === selectedMCPToolRecord!.name
          );
          //console.log(`FOUND TOOL INFO: ${toolInfo}`);
          */
          if (formattedTools) {
            /*
            // Format for snowgander, ensuring input_schema is a string
            const formattedTool: MCPAvailableTool = {
              name: toolInfo.name,
              description: toolInfo.description || "",
              input_schema: JSON.stringify(toolInfo.inputSchema || {}), // Stringify the schema
            };
            */
            chat.mcpAvailableTools = formattedTools;
          } else {
            console.warn(
              `Tool definition not found via mcpManager for tool: ${selectedMCPToolRecord.name}`
            );
          }
        } catch (error) {
          console.error(
            `Error fetching tool definitions for ${selectedMCPToolRecord.name}:`,
            error
          );
          // Proceed without the tool if definition fetch fails
        }
      } else {
        console.warn(`MCPTool record not found for ID: ${chat.mcpToolId}`);
      }
    }
    // --- End MCP Tool Handling ---

    // Initial chat completion call
    console.log(
      `Chat before initial sending: ${JSON.stringify(chat, null, 2)}`
    );
    const initialResponse: ChatResponse = await adapter.sendChat(chat);
    console.log(
      `Initial response received: ${JSON.stringify(initialResponse, null, 2)}`
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
        console.error(
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
        const finalResponse = await adapter.sendChat(chat);
        console.log(
          `Final response received after tool use: ${JSON.stringify(
            finalResponse,
            null,
            2
          )}`
        );
        return finalResponse;
      } catch (error) {
        console.error("Error processing tool use:", error);
        // Optionally, return an error message or the initial response
        // For now, return the initial response which might contain an error message from the LLM
        return initialResponse;
      }
    } else {
      // If no tool use or no selected tool record, return the initial response
      return initialResponse;
    }
  }
}

export const chatRepository = new ChatRepository();
