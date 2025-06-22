"use server";

import { revalidatePath } from "next/cache";
import { userSettingsRepository } from "../db/repositories/user-settings.repository";
import { UpdateUserSettingsSchema } from "../form-schemas";
import { redirect } from "next/navigation";
import { Logger } from "next-axiom";

export async function getUserSettingsByUserId(userId: number) {
  return userSettingsRepository.findByUserId(userId);
}

export async function updateUserSettings(formData: FormData) {
  const log = new Logger({ source: "user-settings-actions" });
  const settings = UpdateUserSettingsSchema.parse({
    id: formData.get("id"),
    appearanceMode: formData.get("appearanceMode"),
    summaryModelPreferenceId: formData.get("summaryModelPreferenceId")
      ? parseInt(formData.get("summaryModelPreferenceId") as string, 10)
      : undefined,
  });
  try {
    // Note: The original code didn't await the update. Added await.
    await userSettingsRepository.update(settings.id, {
      appearanceMode: settings.appearanceMode || "light",
      summaryModelPreferenceId: settings.summaryModelPreferenceId,
    });
  } catch (error) {
    log.error(`Failed to update user preferences: ${error}`); // Log detailed error
    throw new Error("Unable to update user preferences."); // Throw generic error
  }
  revalidatePath("/chat/settings/user-preferences");
  redirect("/chat/settings/profile"); // Redirects on success
}
