"use server";

import { userRepository } from "@/app/_lib/db/repositories/user.repository";
import { revalidatePath } from "next/cache";
import { CreateUserFormSchema, UpdateUserFormSchema } from "../form-schemas";
import { User } from "@prisma/client";
import { UserPost, UserSession } from "../model";
import { userSettingsRepository } from "@/app/_lib/db/repositories/user-settings.repository";
import { Logger } from "next-axiom";
import { Prisma } from "@prisma/client"; // Import Prisma for error type checking
import { creditRepository } from "@/app/_lib/db/repositories/credit.repository";

// User Functions
export async function getUsers() {
  return userRepository.findAll();
}

export async function getUser(id: number) {
  return userRepository.findById(id);
}

export async function createUser(formData: FormData) {
  const log = new Logger({ source: "user.actions" });
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
  const log = new Logger({ source: "user.actions" });
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
    log.error(`Failed to update User: ${error}`); // Log detailed error
    throw new Error("Unable to update User."); // Throw generic error
  }
  revalidatePath("/chat/settings/profile");
}

export async function ensureUserExists(
  userSession: UserSession
): Promise<User | null> {
  const log = new Logger({ source: "user.actions" });
  // First check if user already exists
  let user = await userRepository.findByEmail(userSession.email);

  // If user doesn't exist, attempt to create one
  if (!user) {
    // username and email are the same.
    const username = userSession.email;

    try {
      // Attempt to create the user
      user = await userRepository.create({
        username: username,
        email: userSession.email,
        isAdmin: false, // default to non-admin
        periodUsage: 0.0,
        totalUsage: 0.0,
        authId: userSession.userId,
      });

      await creditRepository.addCredits(user.id, 40, "free-trial", 14);

      // Also create a UserSettings record for the new user
      // This should only happen if the user creation above was successful
      try {
        await userSettingsRepository.create({
          userId: user.id,
          appearanceMode: "system", // Default to system theme
        });
      } catch (settingsError) {
        log.error("Failed to create user settings for newly created user:", {
          userId: user.id,
          error: settingsError,
        });
        // Log but don't block the process if settings creation fails
      }
    } catch (creationError) {
      // Check if the error is the unique constraint violation (P2002)
      if (
        creationError instanceof Prisma.PrismaClientKnownRequestError &&
        creationError.code === "P2002"
      ) {
        // This likely means another request created the user just before this one (race condition)
        log.warn(
          "User creation failed due to P2002 (Unique Constraint), likely race condition. Re-fetching user.",
          { email: userSession.email }
        );
        // Re-fetch the user, as it should exist now
        user = await userRepository.findByEmail(userSession.email);
        if (!user) {
          // If re-fetch fails, something else is wrong
          log.error(
            "Failed to re-fetch user after P2002 error during creation.",
            { email: userSession.email }
          );
          return null;
        }
      } else {
        // Log any other unexpected error during creation
        log.error("Unexpected error creating user during ensureUserExists:", {
          error: creationError,
        });
        // Don't throw, return null as user creation failed
        return null;
      }
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

export async function deductUserCredits(userId: number, creditCost: number) {
  const log = new Logger({ source: "user.actions" }).with({
    userId: `${userId}`,
  });
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      log.error("User not found");
      throw new Error(`User with ID ${userId} not found.`);
    }

    if (typeof creditCost !== "number" || isNaN(creditCost) || creditCost < 0) {
      log.warn(`Invalid credit cost provided: ${creditCost}`);
      // Don't deduct if cost is invalid.
      return;
    }

    // Call the repository method to deduct credits.
    // The repository should handle the actual DB transaction.
    // This assumes you've implemented `deductCredits` in the repo as per the PRD.
    await creditRepository.deductCredits(userId, creditCost, "chat-deduction");

    log.info(`Deducted ${creditCost} credits from user ${userId}.`);
    console.log(`Deducted ${creditCost} credits from user ${userId}.`);
  } catch (error) {
    log.error(`Failed to deduct credits for user ${userId}:`, { error });
    throw new Error("Unable to update user credit balance.");
  }
}

export async function getUserCreditBalanceAction(
  userId: number
): Promise<number | null> {
  const log = new Logger({ source: "user.actions" });
  try {
    // This action now only needs to fetch the user and return the balance.
    const user = await userRepository.findById(userId);
    if (!user) {
      log.error(`User not found for credit balance check: ${userId}`);
      return null;
    }
    // Return the balance, defaulting to 0 if it's null/undefined.
    console.log(`Returning Credit Balance: ${user.creditBalance}`);
    return user.creditBalance ?? 0.0;
  } catch (error) {
    log.error(`Failed to get credit balance for user ${userId}:`, { error });
    return null;
  }
}

export async function completeOnboardingAction(userId: number) {
  const log = new Logger({ source: "user.repository" });
  try {
    await userRepository.update(userId, { onboardingCompleted: true });
    return { success: true };
  } catch (error) {
    log.error("Failed to update onboarding status:", { error: error });
    // Return or throw a user-friendly error if needed
    return { success: false, error: "Failed to save onboarding status." };
  }
}
