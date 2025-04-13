import { NextResponse } from "next/server";
import { createClient } from "@/app/_utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";
  // Use the reliable NEXT_PUBLIC_BASE_URL for all redirects
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Add a check to ensure baseUrl is configured
  if (!baseUrl) {
    console.error(
      "FATAL: NEXT_PUBLIC_BASE_URL environment variable is not set."
    );
    // Return a generic server error response or redirect to an error page
    // Avoid redirecting without a valid base URL
    return new Response(
      "Internal Server Error: Application configuration missing.",
      { status: 500 }
    );
  }

  if (!code) {
    console.error("No code received in callback");
    // Use baseUrl for the error redirect
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    // Use baseUrl for the error redirect
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Construct the final success redirect URL using the reliable baseUrl
  const redirectUrl = new URL(next, baseUrl);

  return NextResponse.redirect(redirectUrl);
}
