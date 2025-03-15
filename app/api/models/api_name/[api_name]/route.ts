import { NextRequest, NextResponse } from "next/server";
import { modelRepository } from "@/app/_lib/db/repositories/model.repository";
import { withErrorHandler, RouteHandlerContext } from "@/app/api/middleware";

// GET /api/models/api_name/[api_name] - Get a model by API name
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const model = await modelRepository.findByApiName(
      context.params.api_name as string
    );

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json(model);
  }
);
