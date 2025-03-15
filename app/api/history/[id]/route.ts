import { NextRequest, NextResponse } from "next/server";
import { historyRepository } from "@/app/_lib/db/repositories/history.repository";
import {
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "@/app/api/middleware";

// DELETE /api/history/[id] - Delete a history item
export const DELETE = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const json = await request.json();
    const userId = json.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First check if the history item exists and belongs to the user
    const history = await historyRepository.findById(id);
    if (!history) {
      return NextResponse.json(
        { error: "History item not found" },
        { status: 404 }
      );
    }

    if (history.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this history item" },
        { status: 403 }
      );
    }

    await historyRepository.delete(id);
    return NextResponse.json({ message: "Success" });
  }
);
