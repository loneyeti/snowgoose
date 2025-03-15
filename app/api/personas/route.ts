import { NextRequest, NextResponse } from "next/server";
import { personaRepository } from "@/app/_lib/db/repositories/persona.repository";
import { CreatePersonaFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../middleware";

// GET /api/personas - List all personas
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const personas = await personaRepository.findAll();
    return NextResponse.json(personas);
  }
);

// POST /api/personas - Create a new persona
export const POST = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const json = await request.json();
    const validatedData = CreatePersonaFormSchema.parse(json);

    const persona = await personaRepository.create({
      name: validatedData.name,
      prompt: validatedData.prompt,
    });

    return NextResponse.json(persona, { status: 201 });
  }
);
