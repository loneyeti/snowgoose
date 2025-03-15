import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export type AuthenticatedRequest = NextRequest & {
  auth: {
    userId: string | null;
  };
};

export type RouteHandlerContext = {
  params: { [key: string]: string | string[] };
};

export async function withAuth(
  handler: (
    req: AuthenticatedRequest,
    context: RouteHandlerContext
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: RouteHandlerContext) => {
    try {
      const { userId } = auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = { userId };

      return await handler(authenticatedRequest, context);
    } catch (error) {
      console.error("Authentication error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

export function withErrorHandler(
  handler: (
    req: NextRequest,
    context: RouteHandlerContext
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: RouteHandlerContext) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("Request failed:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function withProtectedRoute(
  handler: (
    req: AuthenticatedRequest,
    context: RouteHandlerContext
  ) => Promise<NextResponse>
) {
  return withErrorHandler(
    async (request: NextRequest, context: RouteHandlerContext) => {
      const { userId } = auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = { userId };

      return await handler(authenticatedRequest, context);
    }
  );
}
