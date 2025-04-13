"use server";

import { createClient } from "@/app/_utils/supabase/server";
// Removed unused imports: revalidatePath, redirect, ensureUserExists, getUserSession

// Return type for actions to work with client-side error handling
type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient(); // Add await back

  // Validate inputs
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  // Read the redirect path from the form data to potentially use in emailRedirectTo
  const redirectTo = formData.get("redirect_to") as string;
  const finalRedirectPath =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/chat"; // Default to /chat if not specified or invalid

  // Construct the callback URL, passing the final destination as 'next'
  const callbackUrl = new URL(
    "/auth/callback",
    process.env.NEXT_PUBLIC_BASE_URL
  );
  callbackUrl.searchParams.set("next", finalRedirectPath);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // shouldCreateUser: true, // Default is true, creates user if they don't exist
      // Redirect the user to our /auth/callback route after they click the magic link
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    // Return the error message for client-side handling
    console.error("Supabase signInWithOtp Error:", error);
    return { error: `Failed to send magic link: ${error.message}` };
  }

  // No redirection here. The client-side will show a message.
  // User creation/sync and final redirection happen after clicking the link via the /auth/callback route.
  return { success: true }; // Indicate the link was sent (or attempted)
}

// signup function removed
// requestPasswordReset function removed
