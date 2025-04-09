"use server";

import { modelRepository } from "@/app/_lib/db/repositories/model.repository";
import { ModelPost } from "@/app/_lib/model";
import { Model } from "@/app/_lib/model";
import {
  UpdateModelFormSchema,
  CreateModelFormSchema,
} from "@/app/_lib/form-schemas";
import { ModelConfig } from "snowgander";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getApiVendor } from "./api_vendor.actions";

// Model Functions
export async function getModels() {
  // You can add any business logic or caching here
  return modelRepository.findAll();
}

export async function getModel(id: number) {
  return modelRepository.findById(id);
}

export async function getModelAPIName(model: Model) {
  if (!model.apiVendorId) {
    throw new Error("Model has no vendor");
  }
  const apiVendor = await getApiVendor(model.apiVendorId);
  return apiVendor?.name;
}

export async function getModelAdaptorOptions(model: Model) {
  const modelConfig: ModelConfig = {
    apiName: model.apiName,
    isVision: model.isVision,
    isImageGeneration: model.isImageGeneration,
    isThinking: model.isThinking,
    inputTokenCost: model.inputTokenCost ?? undefined,
    outputTokenCost: model.outputTokenCost ?? undefined,
  };
  const name = await getModelAPIName(model);
  if (!name) {
    throw new Error("Model has no vendor");
  }
  return { name, modelConfig };
}

export async function createModel(formData: FormData) {
  const formValues = CreateModelFormSchema.parse({
    apiName: formData.get("api_name"), // Already mapping correctly
    name: formData.get("name"),
    isVision: formData.get("is_vision") === "on" ? true : false,
    isImageGeneration:
      formData.get("is_image_generation") === "on" ? true : false,
    isThinking: formData.get("is_thinking") === "on" ? true : false,
    apiVendorId: formData.get("api_vendor_id"),
    inputTokenCost: formData.get("input_token_cost")
      ? parseFloat(formData.get("input_token_cost") as string)
      : null,
    outputTokenCost: formData.get("output_token_cost")
      ? parseFloat(formData.get("output_token_cost") as string)
      : null,
  });

  try {
    const model: ModelPost = {
      apiName: formValues.apiName,
      name: formValues.name,
      isVision: formValues.isVision,
      isImageGeneration: formValues.isImageGeneration,
      apiVendorId: formValues.apiVendorId,
      isThinking: formValues.isThinking,
      inputTokenCost:
        formValues.inputTokenCost !== null
          ? formValues.inputTokenCost
          : undefined,
      outputTokenCost:
        formValues.outputTokenCost !== null
          ? formValues.outputTokenCost
          : undefined,
    };

    await modelRepository.create({
      apiName: model.apiName,
      name: model.name,
      isVision: model.isVision,
      isImageGeneration: model.isImageGeneration,
      apiVendorId: model.apiVendorId ?? undefined,
      isThinking: model.isThinking,
      inputTokenCost: model.inputTokenCost,
      outputTokenCost: model.outputTokenCost,
    });
  } catch (error) {
    console.error("Failed to create Model:", error); // Log detailed error
    throw new Error("Unable to create Model."); // Throw generic error
  }
  revalidatePath("/chat/settings/models"); // Corrected path
  revalidatePath("/chat");

  redirect("/chat/settings/models");
}

export async function updateModel(formData: FormData) {
  const formValues = UpdateModelFormSchema.parse({
    id: formData.get("id"),
    apiName: formData.get("api_name"), // Already mapping correctly
    name: formData.get("name"),
    isVision: formData.get("is_vision") === "on" ? true : false,
    isImageGeneration:
      formData.get("is_image_generation") === "on" ? true : false,
    isThinking: formData.get("is_thinking") === "on" ? true : false,
    apiVendorId: formData.get("api_vendor_id"),
    inputTokenCost: formData.get("input_token_cost")
      ? parseFloat(formData.get("input_token_cost") as string)
      : null,
    outputTokenCost: formData.get("output_token_cost")
      ? parseFloat(formData.get("output_token_cost") as string)
      : null,
  });

  try {
    await modelRepository.update(formValues.id, {
      apiName: formValues.apiName,
      name: formValues.name,
      isVision: formValues.isVision,
      isImageGeneration: formValues.isImageGeneration,
      apiVendorId: formValues.apiVendorId ?? undefined,
      isThinking: formValues.isThinking,
      inputTokenCost:
        formValues.inputTokenCost !== null
          ? formValues.inputTokenCost
          : undefined,
      outputTokenCost:
        formValues.outputTokenCost !== null
          ? formValues.outputTokenCost
          : undefined,
    });
  } catch (error) {
    console.error("Failed to update Model:", error); // Log detailed error
    throw new Error("Unable to update Model."); // Throw generic error
  }
  revalidatePath("/chat/settings/models"); // Corrected path
  revalidatePath("/chat");

  redirect("/chat/settings/models");
}

export async function deleteModel(id: number) {
  try {
    await modelRepository.delete(id);
  } catch (error) {
    console.error("Failed to delete Model:", error); // Log detailed error
    throw new Error("Unable to delete Model."); // Throw generic error
  }
  revalidatePath("/chat/settings/models"); // Corrected path
  revalidatePath("/chat");
  // Consider if redirect is needed after delete failure
}
