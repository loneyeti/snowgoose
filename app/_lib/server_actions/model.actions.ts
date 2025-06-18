"use server";

import { modelRepository } from "@/app/_lib/db/repositories/model.repository";
import { ModelPost } from "@/app/_lib/model";
import { Model } from "@/app/_lib/model";
import {
  UpdateModelFormSchema,
  CreateModelFormSchema,
} from "@/app/_lib/form-schemas";
import { ModelConfig } from "@/app/_lib/model";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getApiVendor } from "./api_vendor.actions";

// Model Functions
export async function getModels() {
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
    isWebSearch: model.isWebSearch ?? undefined,
    isThinking: model.isThinking,
    inputTokenCost: model.inputTokenCost ?? undefined,
    outputTokenCost: model.outputTokenCost ?? undefined,
    imageOutputTokenCost: model.imageOutputTokenCost ?? undefined,
    webSearchCost: model.webSearchCost ?? undefined,
  };
  const name = await getModelAPIName(model);
  if (!name) {
    throw new Error("Model has no vendor");
  }
  return { name, modelConfig };
}

export async function createModel(formData: FormData) {
  const formValues = CreateModelFormSchema.parse({
    apiName: formData.get("api_name"),
    name: formData.get("name"),
    isVision: formData.get("is_vision") === "on" ? true : false,
    isImageGeneration:
      formData.get("is_image_generation") === "on" ? true : false,
    isWebSearch: formData.get("is_web_search") === "on" ? true : false,
    isThinking: formData.get("is_thinking") === "on" ? true : false,
    apiVendorId: formData.get("api_vendor_id"),
    inputTokenCost: formData.get("input_token_cost")
      ? parseFloat(formData.get("input_token_cost") as string)
      : null,
    outputTokenCost: formData.get("output_token_cost")
      ? parseFloat(formData.get("output_token_cost") as string)
      : null,
    imageOutputTokenCost: formData.get("image_output_token_cost")
      ? parseFloat(formData.get("image_output_token_cost") as string)
      : null,
    webSearchCost: formData.get("web_search_cost")
      ? parseFloat(formData.get("web_search_cost") as string)
      : null,
    paidOnly: formData.get("paid_only") === "on" ? true : false,
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
      imageOutputTokenCost:
        formValues.imageOutputTokenCost !== null
          ? formValues.imageOutputTokenCost
          : undefined,
      webSearchCost:
        formValues.webSearchCost !== null
          ? formValues.webSearchCost
          : undefined,
    };

    await modelRepository.create({
      apiName: model.apiName,
      name: model.name,
      isVision: model.isVision,
      isImageGeneration: model.isImageGeneration,
      isWebSearch: formValues.isWebSearch,
      apiVendorId: model.apiVendorId ?? undefined,
      isThinking: model.isThinking,
      inputTokenCost: model.inputTokenCost,
      outputTokenCost: model.outputTokenCost,
      imageOutputTokenCost: model.imageOutputTokenCost,
      webSearchCost: model.webSearchCost,
      paidOnly: formValues.paidOnly,
    });
  } catch (error) {
    console.error("Failed to create Model:", error);
    throw new Error("Unable to create Model.");
  }
  revalidatePath("/chat/settings/models");
  revalidatePath("/chat");
  redirect("/chat/settings/models");
}

export async function updateModel(formData: FormData) {
  const formValues = UpdateModelFormSchema.parse({
    id: formData.get("id"),
    apiName: formData.get("api_name"),
    name: formData.get("name"),
    isVision: formData.get("is_vision") === "on" ? true : false,
    isImageGeneration:
      formData.get("is_image_generation") === "on" ? true : false,
    isWebSearch: formData.get("is_web_search") === "on" ? true : false,
    isThinking: formData.get("is_thinking") === "on" ? true : false,
    apiVendorId: formData.get("api_vendor_id"),
    inputTokenCost: formData.get("input_token_cost")
      ? parseFloat(formData.get("input_token_cost") as string)
      : null,
    outputTokenCost: formData.get("output_token_cost")
      ? parseFloat(formData.get("output_token_cost") as string)
      : null,
    imageOutputTokenCost: formData.get("image_output_token_cost")
      ? parseFloat(formData.get("image_output_token_cost") as string)
      : null,
    webSearchCost: formData.get("web_search_cost")
      ? parseFloat(formData.get("web_search_cost") as string)
      : null,
    paidOnly: formData.get("paid_only") === "on" ? true : false,
  });

  try {
    await modelRepository.update(formValues.id, {
      apiName: formValues.apiName,
      name: formValues.name,
      isVision: formValues.isVision,
      isImageGeneration: formValues.isImageGeneration,
      isWebSearch: formValues.isWebSearch,
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
      imageOutputTokenCost:
        formValues.imageOutputTokenCost !== null
          ? formValues.imageOutputTokenCost
          : undefined,
      webSearchCost:
        formValues.webSearchCost !== null
          ? formValues.webSearchCost
          : undefined,
      paidOnly: formValues.paidOnly,
    });
  } catch (error) {
    console.error("Failed to update Model:", error);
    throw new Error("Unable to update Model.");
  }
  revalidatePath("/chat/settings/models");
  revalidatePath("/chat");
  redirect("/chat/settings/models");
}

export async function deleteModel(id: number) {
  try {
    await modelRepository.delete(id);
  } catch (error) {
    console.error("Failed to delete Model:", error);
    throw new Error("Unable to delete Model.");
  }
  revalidatePath("/chat/settings/models");
  revalidatePath("/chat");
}
