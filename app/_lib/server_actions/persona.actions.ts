"use server";

import { personaRepository } from "@/app/_lib/db/repositories/persona.repository";
import { PersonaPost } from "@/app/_lib/model";
import {
  UpdatePersonaFormSchema,
  CreatePersonaFormSchema,
} from "../form-schemas";
import { Persona, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAPIUser, isCurrentUserAdmin } from "../auth";

// Persona Functions
/**
 * @deprecated Use getGlobalPersonas or getUserPersonas instead
 */
export async function getPersonas() {
  console.log("Getting all personas");
  return personaRepository.findAll();
}

export async function getGlobalPersonas() {
  console.log("Getting global personas");
  return await personaRepository.findAllGlobal();
}

export async function getUserPersonas(user: User) {
  console.log("Getting user personas");
  return await personaRepository.findByUser(user);
}

export async function getPersona(id: number) {
  return personaRepository.findById(id);
}

export async function createPersona(
  formData: FormData,
  type: "user" | "global"
) {
  const user = await getCurrentAPIUser();
  const isAdmin = await isCurrentUserAdmin();
  let ownerId: number | null = null;

  if (type === "user") {
    console.log("Still Creating User Persona");
    if (!user) {
      redirect("/error");
    }
    ownerId = user.id;
    console.log(`OwnerID = ${ownerId}`);
  } else {
    if (!isAdmin) {
      redirect("/error");
    }
    ownerId = null;
  }

  console.log(`Create Persona. OwnerID: ${ownerId}`);

  const persona: PersonaPost = CreatePersonaFormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    ownerId: ownerId,
  });

  try {
    await personaRepository.create({
      name: persona.name,
      prompt: persona.prompt,
      ownerId: persona.ownerId,
    });
  } catch (error) {
    throw new Error("Unable to create Persona.");
  }
  revalidatePath(`/settings/${type}-personas`);
  revalidatePath("/");

  redirect(`/settings/${type}-personas`);
}

export async function createUserPersona(formData: FormData) {
  console.log("Creating User Persona");
  await createPersona(formData, "user");
}

export async function createGlobalPersona(formData: FormData) {
  await createPersona(formData, "global");
}

export async function updatePersona(formData: FormData) {
  const persona: Persona = UpdatePersonaFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    ownerId: formData.get("ownerId"),
  });

  console.log(`About to update persona. ownerId: ${persona.ownerId}`);
  try {
    await personaRepository.update(persona.id, {
      name: persona.name,
      prompt: persona.prompt,
      ownerId: persona.ownerId || null || undefined,
    });
  } catch (error) {
    throw new Error(`Unable to update Persona. Error: ${error}`);
  }
  let appendPath: "user" | "global" = "user";
  if (!persona.ownerId) {
    appendPath = "global";
  }
  revalidatePath(`/settings/${appendPath}-personas`);
  revalidatePath("/");

  redirect(`/settings/${appendPath}-personas`);
}

export async function deletePersona(id: number) {
  await personaRepository.delete(id);
  revalidatePath("/personas");
  revalidatePath("/");
}
