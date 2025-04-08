"use server";

import { revalidatePath } from "next/cache";
import { mcpToolRepository } from "../db/repositories/mcp-tool.repository";
import {
  CreateMCPToolFormSchema,
  UpdateMCPToolFormSchema,
} from "../form-schemas";
import { MCPToolPost } from "../model";
import { MCPTool } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getMcpTools() {
  return mcpToolRepository.findAll();
}

export async function getMcpTool(id: number) {
  return mcpToolRepository.findById(id);
}
// Removed stray CreateMCPToolFormSchema reference

export async function createMcpTool(formData: FormData) {
  const mcpTool: MCPToolPost = CreateMCPToolFormSchema.parse({
    name: formData.get("name"),
    path: formData.get("path"),
  });

  try {
    await mcpToolRepository.create({
      name: mcpTool.name,
      path: mcpTool.path,
    });
  } catch (error) {
    console.error("Failed to create MCP Tool:", error); // Log detailed error
    throw new Error("Unable to create MCP Tool."); // Throw generic error
  }
  revalidatePath("/chat/settings/mcp-tools");
  revalidatePath("/chat");

  redirect("/chat/settings/mcp-tools");
}

export async function updateMcpTool(formData: FormData) {
  const mcpTool: MCPTool = UpdateMCPToolFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    path: formData.get("path"),
  });

  try {
    await mcpToolRepository.update(mcpTool.id, {
      name: mcpTool.name,
      path: mcpTool.path,
    });
  } catch (error) {
    console.error("Failed to update MCP Tool:", error); // Log detailed error
    throw new Error("Unable to update MCP Tool."); // Throw generic error
  }
  revalidatePath("/chat/settings/mcp-tools");
  revalidatePath("/chat");

  redirect("/chat/settings/mcp-tools");
}

export async function deleteMcpTool(id: number) {
  try {
    await mcpToolRepository.delete(id);
  } catch (error) {
    console.error("Failed to delete MCP Tool:", error); // Log detailed error
    throw new Error("Unable to delete MCP Tool."); // Throw generic error
  }
  revalidatePath("/chat/settings/mcp-tools");
  // Consider if redirect is needed after delete failure
}
