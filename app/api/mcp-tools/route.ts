import { NextRequest, NextResponse } from "next/server";
import { mcpToolRepository } from "@/app/_lib/db/repositories/mcp-tool.repository";
import { CreateMCPToolFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../middleware";

// GET /api/mcp-tools - List all MCP tools
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const mcpTools = await mcpToolRepository.findAll();
    return NextResponse.json(mcpTools);
  }
);

// POST /api/mcp-tools - Create a new MCP tool
export const POST = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const json = await request.json();
    const validatedData = CreateMCPToolFormSchema.parse(json);

    const mcpTool = await mcpToolRepository.create({
      name: validatedData.name,
      path: validatedData.path,
    });

    return NextResponse.json(mcpTool, { status: 201 });
  }
);
