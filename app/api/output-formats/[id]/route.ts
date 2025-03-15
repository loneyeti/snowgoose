import { NextRequest, NextResponse } from "next/server";
import { outputFormatRepository } from "@/app/_lib/db/repositories/output-format.repository";
import { UpdateOutputFormatFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../../middleware";

// GET /api/output-formats/[id] - Get a single output format
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const outputFormat = await outputFormatRepository.findById(id);

    if (!outputFormat) {
      return NextResponse.json(
        { error: "Output format not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(outputFormat);
  }
);

// PUT /api/output-formats/[id] - Update an output format
export const PUT = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const json = await request.json();
    const validatedData = UpdateOutputFormatFormSchema.parse({ id, ...json });

    const outputFormat = await outputFormatRepository.update(id, {
      name: validatedData.name,
      prompt: validatedData.prompt,
      renderTypeId: validatedData.render_type_id,
    });

    return NextResponse.json(outputFormat);
  }
);

// DELETE /api/output-formats/[id] - Delete an output format
export const DELETE = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    await outputFormatRepository.delete(id);

    return NextResponse.json({ message: "Success" });
  }
);
