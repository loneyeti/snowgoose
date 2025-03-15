import { NextRequest, NextResponse } from "next/server";
import { outputFormatRepository } from "@/app/_lib/db/repositories/output-format.repository";
import { CreateOutputFormatFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../middleware";

// GET /api/output-formats - List all output formats
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const outputFormats = await outputFormatRepository.findAll();
    return NextResponse.json(outputFormats);
  }
);

// POST /api/output-formats - Create a new output format
export const POST = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const json = await request.json();
    const validatedData = CreateOutputFormatFormSchema.parse(json);

    const outputFormat = await outputFormatRepository.create({
      name: validatedData.name,
      prompt: validatedData.prompt,
      renderTypeId: validatedData.render_type_id,
    });

    return NextResponse.json(outputFormat, { status: 201 });
  }
);
