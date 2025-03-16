import Anthropic from "@anthropic-ai/sdk";
import {
  AIVendorAdapter,
  AIRequestOptions,
  AIResponse,
  VendorConfig,
} from "../types";
import { Chat, ChatResponse, ContentBlock } from "../../model";
import { Model } from "@prisma/client";

export class AnthropicAdapter implements AIVendorAdapter {
  private client: Anthropic;
  public isVisionCapable: boolean;
  public isImageGenerationCapable: boolean;
  public isThinkingCapable: boolean;

  constructor(config: VendorConfig, model: Model) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });

    this.isVisionCapable = model.isVision;
    this.isImageGenerationCapable = model.isImageGeneration;
    this.isThinkingCapable = model.isThinking;
  }

  async generateResponse(options: AIRequestOptions): Promise<AIResponse> {
    const {
      model,
      messages,
      maxTokens,
      budgetTokens,
      systemPrompt,
      thinkingMode,
    } = options;

    // Convert messages to Anthropic format
    // Convert messages to Anthropic format with inferred types
    const formattedMessages = messages.map((msg) => ({
      role:
        msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

    console.log(
      `Thinking Mode Status: ${thinkingMode} ${this.isThinkingCapable}`
    );

    const response = await this.client.messages.create({
      model,
      messages: formattedMessages,
      system: systemPrompt,
      max_tokens: maxTokens || 1024, // Default to 1024 if maxTokens is undefined
      ...(thinkingMode &&
        this.isThinkingCapable && {
          thinking: {
            type: "enabled",
            budget_tokens: budgetTokens || Math.floor((maxTokens || 1024) / 2), // Use provided budget or half of max tokens
          },
        }),
    });

    // Convert Anthropic response blocks to our ContentBlock format
    const contentBlocks: ContentBlock[] = [];

    for (const block of response.content) {
      if (block.type === "thinking") {
        contentBlocks.push({
          type: "thinking",
          thinking: block.thinking,
          signature: "anthropic",
        });
      } else if (block.type === "text") {
        contentBlocks.push({
          type: "text",
          text: block.text,
        });
      }
      // Skip tool_use and any unknown block types
    }

    return {
      role: "assistant",
      content: contentBlocks,
    };
  }

  async generateImage(chat: Chat): Promise<string> {
    throw new Error("Image generation not supported by Anthropic");
  }

  async sendChat(chat: Chat): Promise<ChatResponse> {
    console.log("CHAT:");
    console.log(JSON.stringify(chat));
    const response = await this.generateResponse({
      model: chat.model,
      messages: chat.responseHistory,
      maxTokens: chat.maxTokens || undefined,
      budgetTokens: chat.budgetTokens || undefined,
      systemPrompt: chat.personaPrompt || undefined,
      thinkingMode: true,
    });
    console.log("RESPONSE:");
    console.log(JSON.stringify(response));

    return {
      role: response.role,
      content: response.content,
    };
  }

  async sendMCPChat(chat: Chat, mcpToolData: any): Promise<ChatResponse> {
    // Import the MCP manager
    const { mcpManager } = await import("../../mcp");

    try {
      // Get available tools from the MCP server
      const availableTools = await mcpManager.getAvailableTools(mcpToolData);

      // Format tools for Anthropic API
      const formattedTools = availableTools.map((tool) => ({
        name: tool.name,
        description: tool.description || `Tool: ${tool.name}`,
        input_schema: tool.inputSchema,
      }));

      // Create a system prompt that includes information about available tools
      const mcpSystemPrompt = chat.personaPrompt
        ? `${chat.personaPrompt}\n\nYou have access to the MCP server: ${mcpToolData.name}.`
        : `You have access to the MCP server: ${mcpToolData.name}.`;

      // Convert messages to Anthropic format
      const formattedMessages = chat.responseHistory.map((msg) => ({
        role:
          msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      }));

      // Generate initial response with tools
      const response = await this.client.messages.create({
        model: chat.model,
        messages: formattedMessages,
        system: mcpSystemPrompt,
        max_tokens: chat.maxTokens || 1024,
        tools: formattedTools,
        ...(this.isThinkingCapable && {
          thinking: {
            type: "enabled",
            budget_tokens:
              chat.budgetTokens || Math.floor((chat.maxTokens || 1024) / 2),
          },
        }),
      });

      const finalContent = [];

      // Process the response content
      for (const content of response.content) {
        if (content.type === "text") {
          finalContent.push({
            type: "text" as const,
            text: content.text,
          });
        } else if (content.type === "tool_use") {
          // Handle tool use
          const toolName = content.name;
          // Ensure toolArgs is properly typed as Record<string, any>
          const toolArgs = content.input as Record<string, any>;

          // Log the tool call
          console.log(`Executing tool: ${toolName} with args:`, toolArgs);

          // Add tool call to the content
          finalContent.push({
            type: "text" as const,
            text: `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`,
          });

          try {
            // Execute the tool
            const toolResult = await mcpManager.callTool(
              mcpToolData,
              toolName,
              toolArgs
            );

            // Add a new message with the tool result
            formattedMessages.push({
              role: "user" as const,
              content: JSON.stringify(toolResult.content),
            });

            // Get a follow-up response from Claude with the tool result
            const followUpResponse = await this.client.messages.create({
              model: chat.model,
              messages: formattedMessages,
              system: mcpSystemPrompt,
              max_tokens: chat.maxTokens || 1024,
              ...(this.isThinkingCapable && {
                thinking: {
                  type: "enabled",
                  budget_tokens:
                    chat.budgetTokens ||
                    Math.floor((chat.maxTokens || 1024) / 2),
                },
              }),
            });

            // Add the follow-up response to the content
            if (followUpResponse.content[0]?.type === "text") {
              finalContent.push({
                type: "text" as const,
                text: followUpResponse.content[0].text,
              });
            }
          } catch (error) {
            console.error(`Error executing tool ${toolName}:`, error);
            finalContent.push({
              type: "text" as const,
              text: `Error executing tool ${toolName}: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
          }
        } else if (content.type === "thinking") {
          finalContent.push({
            type: "thinking" as const,
            thinking: content.thinking,
            signature: "anthropic",
          });
        }
      }

      return {
        role: "assistant",
        content: finalContent,
      };
    } catch (error: unknown) {
      console.error("Error in sendMCPChat:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        role: "assistant",
        content: [
          {
            type: "text",
            text: `I encountered an error while trying to use the MCP tool: ${errorMessage}`,
          },
        ],
      };
    }
  }
}
