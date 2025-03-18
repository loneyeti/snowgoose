"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_utils/supabase/server";
import { ensureUserExists } from "../_lib/server_actions/user.actions";

// Return type for actions to work with client-side error handling
type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  // Validate inputs
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Return the error message for client-side handling
    return { error: error.message };
  }

  // Ensure user exists in our database after successful Supabase auth
  try {
    await ensureUserExists(email);
  } catch (user_error) {
    console.error("Failed to sync user with database:", user_error);
    return { error: "Failed to sync user." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  // Validate inputs
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Basic password validation
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // For signup, let's show a success message
  return {
    success: true,
    error: "Please check your email to confirm your account",
  };
}

export async function requestPasswordReset(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/confirm`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
