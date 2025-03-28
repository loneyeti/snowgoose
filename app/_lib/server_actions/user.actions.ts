"use server";

import { userRepository } from "@/app/_lib/db/repositories/user.repository";
import { revalidatePath } from "next/cache";
import { CreateUserFormSchema, UpdateUserFormSchema } from "../form-schemas";
import { User } from "@prisma/client";
import { UserPost } from "../model";
import { createClient } from "@/app/_utils/supabase/server";
import { FormState } from "../form-schemas";

// User Functions
export async function getUsers() {
  console.log("Getting users");
  return userRepository.findAll();
}

export async function getUser(id: number) {
  return userRepository.findById(id);
}

export async function createUser(formData: FormData) {
  const user: UserPost = CreateUserFormSchema.parse({
    username: formData.get("username"),
    password: formData.get("password"),
    email: formData.get("email"),
    isAdmin: formData.get("isAdmin") === "true",
  });

  try {
    await userRepository.create({
      username: user.username,
      password: user.password,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    throw new Error("Unable to create User.");
  }
  revalidatePath("/settings/users");
}

export async function updateUser(formData: FormData) {
  // Remove explicit : User type annotation and rename variable
  const parsedData = UpdateUserFormSchema.parse({
    id: formData.get("id"),
    username: formData.get("username"),
    password: formData.get("password"),
    email: formData.get("email"),
    isAdmin: formData.get("isAdmin") === "true",
  });

  try {
    // Use parsedData instead of user
    await userRepository.update(parsedData.id, {
      username: parsedData.username,
      password: parsedData.password,
      email: parsedData.email ?? undefined,
      isAdmin: parsedData.isAdmin ?? undefined,
    });
  } catch (error) {
    throw new Error(`Unable to update User. Error: ${error}`);
  }
  revalidatePath("/settings/profile");
}

export async function updateUserPassword(
  prevState: FormState,
  formData: FormData
) {
  const supabase = await createClient();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  // Get existing session to verify current password
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required" };
  }

  // Reauthenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/settings/profile");
  return { success: true };
}

import { userSettingsRepository } from "@/app/_lib/db/repositories/user-settings.repository";

export async function ensureUserExists(email: string): Promise<User | null> {
  // First check if user already exists
  let user = await userRepository.findByEmail(email);

  // If user doesn't exist, create one
  if (!user) {
    console.log("User doesn't exist. Creating.");
    // username and email are the same.
    const username = email;

    // For Supabase users, we don't store the real password in our DB
    // We're using Supabase for auth, so just create a placeholder
    user = await userRepository.create({
      username,
      password: "SUPABASE_AUTH_USER", // placeholder password since Supabase handles auth
      email,
      isAdmin: false, // default to non-admin
    });

    // Also create a UserSettings record for the new user
    if (user) {
      try {
        await userSettingsRepository.create({
          userId: user.id,
          appearanceMode: "light", // Default to light mode
        });
        console.log("Created user settings for new user");
      } catch (error) {
        console.error("Failed to create user settings:", error);
        // We don't throw here to avoid blocking user creation if settings creation fails
      }
    }
  } else {
    console.log("User Does exist. Returning User");
  }

  return user;
}

export async function updateUserUsage(userId: number, usage: number) {
  try {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Ensure usage is a non-negative number
    if (typeof usage !== "number" || usage < 0) {
      throw new Error(`Invalid usage amount provided: ${usage}`);
    }

    console.log(`Before usage update: periodUsage: ${user.periodUsage}`);

    // Calculate new usage values, ensuring current values are treated as numbers (defaulting to 0 if null/undefined)
    const currentPeriodUsage = Number(user.periodUsage) || 0;
    const currentTotalUsage = Number(user.totalUsage) || 0;

    const newPeriodUsage = currentPeriodUsage + usage;
    const newTotalUsage = currentTotalUsage + usage;

    await userRepository.update(userId, {
      periodUsage: newPeriodUsage,
      totalUsage: newTotalUsage,
    });

    console.log(
      `Updated usage for user ${userId}. Added: ${usage}, New Period: ${newPeriodUsage}, New Total: ${newTotalUsage}`
    );
    // No revalidatePath needed here as usage updates don't typically affect cached UI paths directly.
    // If specific UI needs invalidation, add revalidatePath('/path/to/invalidate') here.
  } catch (error) {
    console.error(`Failed to update usage for user ${userId}:`, error);
    // Re-throw the error or handle it as needed for server action responses
    // For now, just logging and throwing a generic error.
    throw new Error(
      `Unable to update user usage. Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
