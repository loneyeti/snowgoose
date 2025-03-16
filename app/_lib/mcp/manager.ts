import { MCPClient } from "./client";
import { MCPTool } from "../model";

export interface MCPToolInfo {
  id: string;
  name: string;
  description?: string;
  inputSchema: any;
}

export class MCPManager {
  private clients: Map<number, MCPClient> = new Map();
  private activeTools: Map<number, MCPToolInfo[]> = new Map();

  async getClient(mcpTool: MCPTool): Promise<MCPClient> {
    if (!this.clients.has(mcpTool.id)) {
      const client = new MCPClient(mcpTool);
      this.clients.set(mcpTool.id, client);

      // Connect and cache available tools
      await client.connect();
      const tools = await client.listTools();
      this.activeTools.set(mcpTool.id, tools);
    }

    return this.clients.get(mcpTool.id)!;
  }

  async getAvailableTools(mcpTool: MCPTool): Promise<MCPToolInfo[]> {
    if (!this.activeTools.has(mcpTool.id)) {
      const client = await this.getClient(mcpTool);
      const tools = await client.listTools();
      this.activeTools.set(mcpTool.id, tools);
    }

    return this.activeTools.get(mcpTool.id) || [];
  }

  async callTool(
    mcpTool: MCPTool,
    toolName: string,
    args: Record<string, any>
  ): Promise<any> {
    console.log("Running Manager callTool");
    const client = await this.getClient(mcpTool);
    return client.callTool(toolName, args);
  }

  async getResources(mcpTool: MCPTool): Promise<any[]> {
    const client = await this.getClient(mcpTool);
    return client.listResources();
  }

  async readResource(mcpTool: MCPTool, uri: string): Promise<any> {
    const client = await this.getClient(mcpTool);
    return client.readResource(uri);
  }

  async getPrompts(mcpTool: MCPTool): Promise<any[]> {
    const client = await this.getClient(mcpTool);
    return client.listPrompts();
  }

  async executePrompt(
    mcpTool: MCPTool,
    promptName: string,
    args: Record<string, any>
  ): Promise<any> {
    const client = await this.getClient(mcpTool);
    return client.getPrompt(promptName, args);
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.values()).map((client) =>
      client
        .disconnect()
        .catch((error) => console.error("Error disconnecting client:", error))
    );

    await Promise.all(disconnectPromises);
    this.clients.clear();
    this.activeTools.clear();
  }

  async disconnectClient(mcpToolId: number): Promise<void> {
    if (this.clients.has(mcpToolId)) {
      const client = this.clients.get(mcpToolId)!;
      await client.disconnect();
      this.clients.delete(mcpToolId);
      this.activeTools.delete(mcpToolId);
    }
  }
}

// Create a singleton instance
export const mcpManager = new MCPManager();
