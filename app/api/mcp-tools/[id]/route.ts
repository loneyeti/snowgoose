import { NextRequest, NextResponse } from "next/server";
import { mcpToolRepository } from "@/app/_lib/db/repositories/mcp-tool.repository";
import { UpdateMCPToolFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../../middleware";

// GET /api/mcp-tools/[id] - Get a single MCP tool
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const mcpTool = await mcpToolRepository.findById(id);

    if (!mcpTool) {
      return NextResponse.json(
        { error: "MCP tool not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mcpTool);
  }
);

// PUT /api/mcp-tools/[id] - Update an MCP tool
export const PUT = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const json = await request.json();
    const validatedData = UpdateMCPToolFormSchema.parse({ id, ...json });

    const mcpTool = await mcpToolRepository.update(id, {
      name: validatedData.name,
      path: validatedData.path,
    });

    return NextResponse.json(mcpTool);
  }
);

// DELETE /api/mcp-tools/[id] - Delete an MCP tool
export const DELETE = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    await mcpToolRepository.delete(id);

    return NextResponse.json({ message: "Success" });
  }
);
