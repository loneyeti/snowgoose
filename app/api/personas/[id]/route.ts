import { NextRequest, NextResponse } from "next/server";
import { personaRepository } from "@/app/_lib/db/repositories/persona.repository";
import { UpdatePersonaFormSchema } from "@/app/_lib/form-schemas";
import {
  withErrorHandler,
  withProtectedRoute,
  AuthenticatedRequest,
  RouteHandlerContext,
} from "../../middleware";

// GET /api/personas/[id] - Get a single persona
export const GET = withErrorHandler(
  async (request: NextRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const persona = await personaRepository.findById(id);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json(persona);
  }
);

// PUT /api/personas/[id] - Update a persona
export const PUT = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    const json = await request.json();
    const validatedData = UpdatePersonaFormSchema.parse({ id, ...json });

    const persona = await personaRepository.update(id, {
      name: validatedData.name,
      prompt: validatedData.prompt,
    });

    return NextResponse.json(persona);
  }
);

// DELETE /api/personas/[id] - Delete a persona
export const DELETE = withProtectedRoute(
  async (request: AuthenticatedRequest, context: RouteHandlerContext) => {
    const id = parseInt(context.params.id as string, 10);
    await personaRepository.delete(id);

    return NextResponse.json({ message: "Success" });
  }
);
