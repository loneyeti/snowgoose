"use server";

import { revalidatePath } from "next/cache";
import { userSettingsRepository } from "../db/repositories/user-settings.repository";
import { UpdateUserSettingsSchema } from "../form-schemas";
import { redirect } from "next/navigation";

export async function getUserSettingsByUserId(userId: number) {
  console.log("Getting personas");
  return userSettingsRepository.findByUserId(userId);
}

export async function updateUserSettings(formData: FormData) {
  console.log("About to update user settings");
  const settings = UpdateUserSettingsSchema.parse({
    id: formData.get("id"),
    appearanceMode: formData.get("appearanceMode"),
    summaryModelPreferenceId: formData.get("summaryModelPreferenceId")
      ? parseInt(formData.get("summaryModelPreferenceId") as string, 10)
      : undefined,
  });
  console.log(settings);
  try {
    userSettingsRepository.update(settings.id, {
      appearanceMode: settings.appearanceMode || "light",
      summaryModelPreferenceId: settings.summaryModelPreferenceId,
    });
  } catch (error) {
    throw new Error("Unable to update user preferences.");
  }
  revalidatePath("/settings/user-preferences");
  redirect("/settings/profile");
}
