import { NextResponse } from "next/server";
import { createClient } from "@/app/_utils/supabase/server";
import { Logger } from "next-axiom";

// This route handles callbacks for OAuth AND now also acts as the landing page
// after a user clicks a magic link.
export async function GET(request: Request) {
  const log = new Logger({ source: "callback-api" });
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code"); // For OAuth
  const next = searchParams.get("next") ?? "/chat"; // Final destination

  // Use the canonical NEXT_PUBLIC_BASE_URL for all final redirects
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Add a check to ensure baseUrl is configured
  if (!baseUrl) {
    log.error("FATAL: NEXT_PUBLIC_BASE_URL environment variable is not set.");
    // Return a generic server error response or redirect to an error page
    // Avoid redirecting without a valid base URL
    return new Response(
      "Internal Server Error: Application configuration missing.",
      { status: 500 }
    );
  }

  const supabase = await createClient();

  // If 'code' is present, handle OAuth code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      log.error("OAuth callback error:", error);
      // Construct error redirect URL using the reliable baseUrl
      const errorRedirectUrl = new URL("/login", baseUrl);
      errorRedirectUrl.searchParams.set("error", "oauth_callback_failed");
      errorRedirectUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(errorRedirectUrl);
    }
    // OAuth successful, redirect to final destination using the reliable baseUrl
    const redirectUrl = new URL(next, baseUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // If no 'code', assume it's a magic link callback.
  // Supabase should have already set the session cookie during the redirect TO this page.
  // We just need to verify the session exists and redirect.
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    log.error(
      `Magic link callback error: User session not found after redirect: ${getUserError}`
    );
    // Construct error redirect URL using the reliable baseUrl
    const errorRedirectUrl = new URL("/login", baseUrl);
    errorRedirectUrl.searchParams.set("error", "magic_link_failed");
    errorRedirectUrl.searchParams.set(
      "message",
      "Could not verify session after login link."
    );
    return NextResponse.redirect(errorRedirectUrl);
  }

  // Magic link successful, user session confirmed, redirect to final destination
  const redirectUrl = new URL(next, baseUrl);
  return NextResponse.redirect(redirectUrl);
}
