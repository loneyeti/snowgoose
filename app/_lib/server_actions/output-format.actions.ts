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
    console.error("Failed to create Output Format:", error); // Log detailed error
    throw new Error("Unable to create Output Format."); // Throw generic error
  }
  revalidatePath("/settings/output-formats");
  revalidatePath("/");

  redirect("/settings/output-formats");
}

export async function updateOutputFormat(formData: FormData) {
  // Note: The original code used .create here, which seems incorrect for an update.
  // Assuming it should be .update. If this causes issues, it might need further review.
  const outputFormat: OutputFormat = UpdateOutputFormatFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    renderTypeId: formData.get("render_type_id"),
    ownerId: formData.get("ownerId"), // Assuming ownerId might be relevant for updates, keeping it.
  });
  try {
    // Corrected to use .update instead of .create
    await outputFormatRepository.update(outputFormat.id, {
      name: outputFormat.name,
      prompt: outputFormat.prompt,
      renderTypeId: outputFormat.renderTypeId ?? undefined,
      // ownerId: outputFormat.ownerId ?? undefined, // Assuming ownerId is not updatable or handled differently
    });
  } catch (error) {
    console.error("Failed to update Output Format:", error); // Log detailed error
    throw new Error("Unable to update Output Format."); // Throw generic error
  }
  revalidatePath("/settings/output-formats");
  revalidatePath("/");

  redirect("/settings/output-formats");
}

export async function deleteOutputFormat(id: number) {
  // Add try...catch for consistency if needed, though delete might have different requirements
  try {
    await outputFormatRepository.delete(id);
  } catch (error) {
    console.error("Failed to delete Output Format:", error); // Log detailed error
    throw new Error("Unable to delete Output Format."); // Throw generic error
  }
  revalidatePath("/settings/output-formats");
  revalidatePath("/");
  // Consider if redirect is needed after delete failure
}
