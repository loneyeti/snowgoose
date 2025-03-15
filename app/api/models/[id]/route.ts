import { NextRequest, NextResponse } from "next/server";
import { modelRepository } from "@/app/_lib/db/repositories/model.repository";
import { UpdateModelFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../../middleware";

// GET /api/models/[id] - Get a single model
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const model = await modelRepository.findById(id);

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json(model);
  }
);

// PUT /api/models/[id] - Update a model
export const PUT = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const json = await request.json();
    const validatedData = UpdateModelFormSchema.parse({ id, ...json });

    const model = await modelRepository.update(id, {
      apiName: validatedData.api_name,
      name: validatedData.name,
      isVision: validatedData.is_vision,
      isImageGeneration: validatedData.is_image_generation,
      isThinking: validatedData.is_thinking || false,
      apiVendorId: validatedData.api_vendor_id,
    });

    return NextResponse.json(model);
  }
);

// DELETE /api/models/[id] - Delete a model
export const DELETE = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    await modelRepository.delete(id);

    return NextResponse.json({ message: "Success" });
  }
);
