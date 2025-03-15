"use server";

import { revalidatePath } from "next/cache";
import { outputFormatRepository } from "../db/repositories/output-format.repository";
import {
  CreateOutputFormatFormSchema,
  UpdateOutputFormatFormSchema,
} from "../form-schemas";
import { OutputFormatPost } from "../model";
import { redirect } from "next/navigation";
import { OutputFormat } from "@prisma/client";

export async function getOutputFormats() {
  // You can add any business logic or caching here
  return outputFormatRepository.findAll();
}

export async function getOutputFormat(id: number) {
  return outputFormatRepository.findById(id);
}

export async function createOutputFormat(formData: FormData) {
  const outputFormat: OutputFormatPost = CreateOutputFormatFormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    renderTypeId: formData.get("render_type_id"),
  });
  try {
    await outputFormatRepository.create({
      name: outputFormat.name,
      prompt: outputFormat.prompt,
      renderTypeId: outputFormat.renderTypeId,
    });
  } catch (error) {
    throw new Error("Unable to create Persona.");
  }
  revalidatePath("/settings/output-formats");
  revalidatePath("/");

  redirect("/settings/output-formats");
}

export async function updateOutputFormat(formData: FormData) {
  const outputFormat: OutputFormat = UpdateOutputFormatFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    renderTypeId: formData.get("render_type_id"),
    ownerId: formData.get("ownerId"),
  });
  try {
    await outputFormatRepository.create({
      name: outputFormat.name,
      prompt: outputFormat.prompt,
      renderTypeId: outputFormat.renderTypeId ?? undefined,
      ownerId: outputFormat.ownerId ?? undefined,
    });
  } catch (error) {
    throw new Error("Unable to create Persona.");
  }
  revalidatePath("/settings/output-formats");
  revalidatePath("/");

  redirect("/settings/output-formats");
}

export async function deleteOutputFormat(id: number) {
  await outputFormatRepository.delete(id);
  revalidatePath("/settings/output-formats");
  revalidatePath("/");
}
