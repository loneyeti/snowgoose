"use server";

import { mcpToolRepository } from "../db/repositories/mcp-tool.repository";

export async function getMcpTools() {
  // You can add any business logic or caching here
  return mcpToolRepository.findAll();
}

export async function getMCPTool(id: number) {
  return mcpToolRepository.findById(id);
}
