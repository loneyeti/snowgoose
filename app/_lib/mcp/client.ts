import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPTool } from "../model";

export interface MCPClientConfig {
  name: string;
  version: string;
  capabilities?: {
    prompts?: boolean;
    resources?: boolean;
    tools?: boolean;
  };
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private connected: boolean = false;
  private mcpTool: MCPTool;

  constructor(
    mcpTool: MCPTool,
    config: MCPClientConfig = { name: "snowgoose-mcp-client", version: "1.0.0" }
  ) {
    this.mcpTool = mcpTool;

    // Construct the full path to the MCP server
    const projectRoot = process.cwd();
    const fullPath = `${projectRoot}/mcp_servers/${mcpTool.path}`;

    // Log the full path for verification
    console.log(`Full MCP server path: ${fullPath}`);

    // Parse the path to extract command and args
    const serverConfig = this.parseServerConfig(fullPath);

    // Create transport
    this.transport = new StdioClientTransport({
      command: serverConfig.command,
      args: serverConfig.args,
      env: serverConfig.env,
    });

    // Create client
    this.client = new Client(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          prompts: config.capabilities?.prompts ?? {},
          resources: config.capabilities?.resources ?? {},
          tools: config.capabilities?.tools ?? {},
        },
      }
    );
  }

  private parseServerConfig(path: string): MCPServerConfig {
    // Simple parsing for now - split by spaces
    // Format expected: command arg1 arg2 arg3
    const parts = path.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    console.log(`MCP Path: ${command}`);
    return {
      command,
      args,
    };
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect(this.transport);
      this.connected = true;
      console.log(`Connected to MCP server: ${this.mcpTool.name}`);
    } catch (error) {
      console.error(
        `Failed to connect to MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.client.close();
        this.connected = false;
        console.log(`Disconnected from MCP server: ${this.mcpTool.name}`);
      } catch (error) {
        console.error(
          `Failed to disconnect from MCP server: ${this.mcpTool.name}`,
          error
        );
        throw error;
      }
    }
  }

  async listTools(): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.listTools();
      return result.tools;
    } catch (error) {
      console.error(
        `Failed to list tools from MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }

  async callTool(name: string, args: Record<string, any>): Promise<any> {
    console.log("Running client callTool");
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args,
      });
      console.log(`Ran clint callTool. Result: ${result}`);
      return result;
    } catch (error) {
      console.error(
        `Failed to call tool ${name} from MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }

  async listResources(): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.listResources();
      return result.resources;
    } catch (error) {
      console.error(
        `Failed to list resources from MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }

  async readResource(uri: string): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.readResource({ uri });
      return result;
    } catch (error) {
      console.error(
        `Failed to read resource ${uri} from MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }

  async listPrompts(): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.listPrompts();
      return result.prompts;
    } catch (error) {
      console.error(
        `Failed to list prompts from MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }

  async getPrompt(name: string, args: Record<string, any>): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.getPrompt({
        name,
        arguments: args,
      });
      return result;
    } catch (error) {
      console.error(
        `Failed to get prompt ${name} from MCP server: ${this.mcpTool.name}`,
        error
      );
      throw error;
    }
  }
}
