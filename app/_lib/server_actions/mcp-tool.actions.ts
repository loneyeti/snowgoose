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
CreateMCPToolFormSchema;

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
    throw new Error("Unable to create MCP Tool.");
  }
  revalidatePath("/settings/mcp-tools");
  revalidatePath("/");

  redirect("/settings/mcp-tools");
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
    throw new Error("Unable to update MCP Tool.");
  }
  revalidatePath("/settings/mcp-tools");
  revalidatePath("/");

  redirect("/settings/mcp-tools");
}

export async function deleteMcpTool(id: number) {
  await mcpToolRepository.delete(id);
  revalidatePath("/settings/mcp-tools");
}
