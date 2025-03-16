#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Create a simple MCP server
const server = new Server(
  {
    name: "time-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-current-time",
        description: "Get the current time",
        inputSchema: {
          type: "object",
          properties: {
            format: {
              type: "string",
              enum: ["iso", "locale", "unix"],
              description:
                "Time format (iso, locale, or unix). Defaults to iso.",
            },
          },
        },
      },
      {
        name: "get-time-in-timezone",
        description: "Get the current time in a specific timezone",
        inputSchema: {
          type: "object",
          properties: {
            timezone: {
              type: "string",
              description:
                "Timezone name (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')",
            },
            format: {
              type: "string",
              enum: ["iso", "locale"],
              description: "Time format (iso or locale). Defaults to locale.",
            },
          },
          required: ["timezone"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  if (name === "get-current-time") {
    const format = args.format || "iso";
    const now = new Date();
    let timeString: string;

    switch (format) {
      case "iso":
        timeString = now.toISOString();
        break;
      case "locale":
        timeString = now.toLocaleString();
        break;
      case "unix":
        timeString = now.getTime().toString();
        break;
      default:
        timeString = now.toISOString();
    }

    return {
      content: [
        {
          type: "text",
          text: timeString,
        },
      ],
    };
  } else if (name === "get-time-in-timezone") {
    const { timezone, format = "locale" } = args;

    if (!timezone) {
      throw new McpError(ErrorCode.InvalidParams, "Timezone is required");
    }

    try {
      const now = new Date();
      let timeString: string;

      const options: Intl.DateTimeFormatOptions = {
        timeZone: String(timezone) as Intl.DateTimeFormatOptions["timeZone"],
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      };

      if (format === "iso") {
        // For ISO format in specific timezone, we use the Intl formatter
        // but format it to look similar to ISO
        const formatter = new Intl.DateTimeFormat("en-US", {
          ...options,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
          timeZoneName: "short",
        });
        timeString = formatter.format(now);
      } else {
        // For locale format
        timeString = new Intl.DateTimeFormat(undefined, options).format(now);
      }

      return {
        content: [
          {
            type: "text",
            text: timeString,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Invalid timezone "${String(
              timezone
            )}". Please provide a valid IANA timezone identifier.`,
          },
        ],
        isError: true,
      };
    }
  } else {
    throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
  }
});

// Start the server with stdio transport
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Time MCP Server running on stdio");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
