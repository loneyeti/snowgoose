"use server";

import { modelRepository } from "@/app/_lib/db/repositories/model.repository";
import { ModelPost } from "@/app/_lib/model";
import { Model } from "@prisma/client";
import {
  UpdateModelFormSchema,
  CreateModelFormSchema,
} from "@/app/_lib/form-schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Model Functions
export async function getModels() {
  // You can add any business logic or caching here
  return modelRepository.findAll();
}

export async function getModel(id: number) {
  console.log(`Looking for model id: ${id}`);
  return modelRepository.findById(id);
}

export async function createModel(formData: FormData) {
  const model: ModelPost = CreateModelFormSchema.parse({
    apiName: formData.get("api_name"), // Already mapping correctly
    name: formData.get("name"),
    isVision: formData.get("is_vision") === "on" ? true : false,
    isImageGeneration:
      formData.get("is_image_generation") === "on" ? true : false,
    isThinking: formData.get("is_thinking") === "on" ? true : false,
    apiVendorId: formData.get("api_vendor_id"),
  });

  console.log("About to update model.");
  try {
    await modelRepository.create({
      apiName: model.apiName,
      name: model.name,
      isVision: model.isVision,
      isImageGeneration: model.isImageGeneration,
      apiVendorId: model.apiVendorId ?? undefined,
      isThinking: model.isThinking,
    });
  } catch (error) {
    throw new Error("Unable to create Model.");
  }
  revalidatePath("/models");
  revalidatePath("/");

  redirect("/settings/models");
}

export async function updateModel(formData: FormData) {
  const model: Model = UpdateModelFormSchema.parse({
    id: formData.get("id"),
    apiName: formData.get("api_name"), // Already mapping correctly
    name: formData.get("name"),
    isVision: formData.get("is_vision") === "on" ? true : false,
    isImageGeneration:
      formData.get("is_image_generation") === "on" ? true : false,
    isThinking: formData.get("is_thinking") === "on" ? true : false,
    apiVendorId: formData.get("api_vendor_id"),
  });

  console.log("About to update model.");
  try {
    await modelRepository.update(model.id, {
      apiName: model.apiName,
      name: model.name,
      isVision: model.isVision,
      isImageGeneration: model.isImageGeneration,
      apiVendorId: model.apiVendorId ?? undefined,
      isThinking: model.isThinking,
    });
  } catch (error) {
    throw new Error("Unable to update Model.");
  }
  revalidatePath("/models");
  revalidatePath("/");

  redirect("/settings/models");
}

export async function deleteModel(id: number) {
  await modelRepository.delete(id);
  revalidatePath("/models");
  revalidatePath("/");
}
