"use server";

import {
  UserRepository,
  userRepository,
} from "@/app/_lib/db/repositories/user.repository";
import { revalidatePath } from "next/cache";
import { CreateUserFormSchema, UpdateUserFormSchema } from "../form-schemas";
import { User } from "@prisma/client";
import { UserPost, UserSession, UserUsageLimits } from "../model"; // Added UserUsageLimits
import { createClient } from "@/app/_utils/supabase/server";
import { FormState } from "../form-schemas";
import { userSettingsRepository } from "@/app/_lib/db/repositories/user-settings.repository";
import { Logger } from "next-axiom";

// User Functions
export async function getUsers() {
  return userRepository.findAll();
}

export async function getUser(id: number) {
  return userRepository.findById(id);
}

export async function createUser(formData: FormData) {
  const log = new Logger();
  const user: UserPost = CreateUserFormSchema.parse({
    username: formData.get("username"),
    //password: formData.get("password"),
    email: formData.get("email"),
    isAdmin: formData.get("isAdmin") === "true",
  });

  try {
    await userRepository.create({
      username: user.username,
      //password: user.password,
      email: user.email,
      isAdmin: user.isAdmin,
      periodUsage: 0.0,
      totalUsage: 0.0,
      authId: "",
    });
  } catch (error) {
    log.error("Failed to create User:", { error: error }); // Log detailed error
    throw new Error("Unable to create User."); // Throw generic error
  }
  revalidatePath("/chat/settings/users");
}

export async function updateUser(formData: FormData) {
  // Remove explicit : User type annotation and rename variable
  const parsedData = UpdateUserFormSchema.parse({
    id: formData.get("id"),
    username: formData.get("username"),
    //password: formData.get("password"),
    email: formData.get("email"),
    isAdmin: formData.get("isAdmin") === "true",
  });

  try {
    // Use parsedData instead of user
    await userRepository.update(parsedData.id, {
      username: parsedData.username,
      //password: parsedData.password,
      email: parsedData.email ?? undefined,
      isAdmin: parsedData.isAdmin ?? undefined,
    });
  } catch (error) {
    console.error("Failed to update User:", error); // Log detailed error
    throw new Error("Unable to update User."); // Throw generic error
  }
  revalidatePath("/chat/settings/profile");
}

export async function updateUserPassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Ensure return type matches FormState
  const supabase = await createClient();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  // Get existing session to verify current password
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Log server-side, return generic client message
    console.error("Authentication error in updateUserPassword:", authError);
    return { error: "Authentication required to change password." };
  }

  // Reauthenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    // Log server-side, return generic client message
    console.error("Sign-in error during password update:", signInError);
    return { error: "Current password verification failed." };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    // Log server-side, return generic client message
    console.error("Supabase password update error:", updateError);
    return { error: "Failed to update password. Please try again." };
  }

  revalidatePath("/chat/settings/profile");
  return { success: true, message: "Password updated successfully." }; // Add success message
}

export async function ensureUserExists(
  userSession: UserSession
): Promise<User | null> {
  const log = new Logger();
  // First check if user already exists
  let user = await userRepository.findByEmail(userSession.email);

  // If user doesn't exist, create one
  if (!user) {
    // username and email are the same.
    const username = userSession.email;

    try {
      // For Supabase users, we don't store the real password in our DB
      // We're using Supabase for auth, so just create a placeholder
      user = await userRepository.create({
        username: username,
        //password: "SUPABASE_AUTH_USER", // placeholder password since Supabase handles auth
        email: userSession.email,
        isAdmin: false, // default to non-admin,
        periodUsage: 0.0,
        totalUsage: 0.0,
        authId: userSession.userId,
      });

      // Also create a UserSettings record for the new user
      if (user) {
        try {
          await userSettingsRepository.create({
            userId: user.id,
            appearanceMode: "system", // Default to light mode
          });
        } catch (settingsError) {
          log.error("Failed to create user settings:", {
            error: settingsError,
          });
          // We don't throw here to avoid blocking user creation if settings creation fails
        }
      }
    } catch (creationError) {
      log.error("Failed to create user during ensureUserExists:", {
        error: creationError,
      });
      // Don't throw, return null as user creation failed
      return null;
    }
  } else if (!user.authId || user.authId === "") {
    try {
      await userRepository.update(user.id, {
        authId: userSession.userId,
      });
    } catch (error) {
      log.error("Unable to link database user to Supabase user", {
        error: error,
      });
    }
  }

  return user;
}

export async function updateUserUsage(userId: number, usage: number) {
  let log = new Logger({ source: "user.actions" }).with({
    userId: `${userId}`,
  });
  try {
    const user = await userRepository.findById(userId);

    if (!user) {
      log.error("User not found");
      throw new Error(`User with ID ${userId} not found.`);
    }

    // More strict usage validation
    if (typeof usage !== "number" || isNaN(usage) || usage < 0) {
      log.warn(`Invalid usage amount provided: ${usage}`);
      //throw new Error(`Invalid usage amount provided: ${usage}`);
      // Could be not enough usage to report so proceed with 0.00001
      usage = 0.00001;
    }

    // Better conversion with explicit NaN handling
    const currentPeriodUsage = isNaN(Number(user.periodUsage))
      ? 0
      : Number(user.periodUsage);
    const currentTotalUsage = isNaN(Number(user.totalUsage))
      ? 0
      : Number(user.totalUsage);

    // For extremely small values, ensure we maintain numeric integrity
    // by using toFixed for consistent decimal precision (e.g., 5 decimal places)
    const newPeriodUsage = parseFloat((currentPeriodUsage + usage).toFixed(5));
    const newTotalUsage = parseFloat((currentTotalUsage + usage).toFixed(5));

    // Only check if they're valid numbers, not necessarily positive
    // as some systems might track negative adjustments
    if (!isNaN(newPeriodUsage) && !isNaN(newTotalUsage)) {
      await userRepository.update(userId, {
        periodUsage: newPeriodUsage,
        totalUsage: newTotalUsage,
      });
      log.info(
        `Updated user total usage from ${currentTotalUsage} to ${newTotalUsage}`
      );
    } else {
      log.warn(
        `Calculation resulted in invalid numbers. Skipping update. Old Total: ${currentTotalUsage}, ` +
          `Tried to add: ${usage}, New Period: ${newPeriodUsage}, New Total: ${newTotalUsage}`
      );
    }
  } catch (error) {
    log.error(`Failed to update usage for user ${userId}:`, { error });
    throw new Error("Unable to update user usage statistics.");
  }
}

/**
 * Server action to get user usage limits.
 * @param userId The ID of the user.
 * @returns UserUsageLimits object or null if an error occurs.
 */
export async function getUserUsageLimitsAction(
  userId: number
): Promise<UserUsageLimits | null> {
  const log = new Logger();
  try {
    // Directly call the repository method on the server
    const limits = await userRepository.getUserPlanAndUsage(userId);
    if (!limits.user || !limits.plan) {
      throw new Error("No usage limits found");
    }
    const userUsageLimits: UserUsageLimits = {
      planUsageLimit: limits.plan.usageLimit,
      userPeriodUsage: limits.user.periodUsage || 0,
    };
    return userUsageLimits;
  } catch (error) {
    log.error(`Failed to get usage limits for user ${userId}:`, {
      error: error,
    });
    // Return null or throw a more specific error if needed upstream
    return null;
  }
}

export async function completeOnboardingAction(userId: number) {
  const log = new Logger();
  try {
    await userRepository.update(userId, { onboardingCompleted: true });
    return { success: true };
  } catch (error) {
    log.error("Failed to update onboarding status:", { error: error });
    // Return or throw a user-friendly error if needed
    return { success: false, error: "Failed to save onboarding status." };
  }
}
