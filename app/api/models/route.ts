import { NextRequest, NextResponse } from "next/server";
import { modelRepository } from "@/app/_lib/db/repositories/model.repository";
import { CreateModelFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../middleware";

// GET /api/models - List all models
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const models = await modelRepository.findAll();
    return NextResponse.json(models);
  }
);

// POST /api/models - Create a new model
export const POST = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const json = await request.json();
    const validatedData = CreateModelFormSchema.parse(json);

    const model = await modelRepository.create({
      apiName: validatedData.api_name,
      name: validatedData.name,
      isVision: validatedData.is_vision,
      isImageGeneration: validatedData.is_image_generation,
      isThinking: validatedData.is_thinking || false,
      apiVendorId: validatedData.api_vendor_id,
    });

    return NextResponse.json(model, { status: 201 });
  }
);
