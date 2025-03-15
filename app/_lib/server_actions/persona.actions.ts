"use server";

import { personaRepository } from "@/app/_lib/db/repositories/persona.repository";
import { PersonaPost } from "@/app/_lib/model";
import {
  UpdatePersonaFormSchema,
  CreatePersonaFormSchema,
} from "../form-schemas";
import { Persona } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Persona Functions
export async function getPersonas() {
  console.log("Getting personas");
  return personaRepository.findAll();
}

export async function getPersona(id: number) {
  return personaRepository.findById(id);
}

export async function createPersona(formData: FormData) {
  const persona: PersonaPost = CreatePersonaFormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    ownerId: formData.get("ownerId"),
  });
  try {
    await personaRepository.create({
      name: persona.name,
      prompt: persona.prompt,
    });
  } catch (error) {
    throw new Error("Unable to create Persona.");
  }
  revalidatePath("/settings/personas");
  revalidatePath("/");

  redirect("/settings/personas");
}

export async function updatePersona(formData: FormData) {
  const persona: Persona = UpdatePersonaFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    ownerId: formData.get("ownerId"),
  });

  console.log("About to update persona.");
  try {
    await personaRepository.update(persona.id, {
      name: persona.name,
      prompt: persona.prompt,
    });
  } catch (error) {
    throw new Error(`Unable to update Persona. Error: ${error}`);
  }
  revalidatePath("/settings/personas");
  revalidatePath("/");

  redirect("/settings/personas");
}

export async function deletePersona(id: number) {
  await personaRepository.delete(id);
  revalidatePath("/personas");
  revalidatePath("/");
}
