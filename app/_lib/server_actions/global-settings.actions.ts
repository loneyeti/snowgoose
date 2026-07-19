"use server";

import { globalSettingsRepository } from "@/app/_lib/db/repositories/global-settings.repository";
import { UpdateGlobalSettingsSchema } from "../form-schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../auth";

// Global Settings Functions

export async function getGlobalSettings() {
  return await globalSettingsRepository.get();
}

/**
 * Returns the system default model id, or null if no default has been
 * configured. Used by the chat page to seed a new chat's model selection.
 */
export async function getSystemDefaultModelId(): Promise<number | null> {
  const settings = await globalSettingsRepository.get();
  return settings?.defaultModelId ?? null;
}

export async function updateGlobalSettings(formData: FormData) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/error");
  }

  const rawDefaultModelId = formData.get("defaultModelId");
  const defaultModelId =
    rawDefaultModelId && rawDefaultModelId !== ""
      ? Number(rawDefaultModelId)
      : null;

  const parsed = UpdateGlobalSettingsSchema.parse({ defaultModelId });

  try {
    await globalSettingsRepository.upsert({
      defaultModelId: parsed.defaultModelId,
    });
  } catch (error) {
    console.error("Failed to update Global Settings:", error); // Log detailed error
    throw new Error("Unable to update Global Settings."); // Throw generic error
  }

  revalidatePath("/chat/settings/admin/default-model");
  revalidatePath("/chat");
}
