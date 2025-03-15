import { NextRequest, NextResponse } from "next/server";
import { historyRepository } from "@/app/_lib/db/repositories/history.repository";
import {
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../middleware";

// POST /api/history - Get all history for current user
export const POST = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const json = await request.json();
    const userId = json.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const history = await historyRepository.findAll(userId);
    return NextResponse.json(history);
  }
);

// POST /api/history/save - Save chat as history
export const PUT = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const json = await request.json();
    const { userId, title, conversation } = json;

    if (!userId || !conversation) {
      return NextResponse.json(
        { error: "User ID and conversation are required" },
        { status: 400 }
      );
    }

    const history = await historyRepository.create({
      userId,
      title,
      conversation,
    });

    return NextResponse.json(history, { status: 201 });
  }
);
