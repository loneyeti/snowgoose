import { createClient } from "@/app/_utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/chat", "layout");

  // Construct the redirect URL using the reliable base URL
  const redirectUrl = new URL("/login", process.env.NEXT_PUBLIC_BASE_URL);

  return NextResponse.redirect(redirectUrl, {
    status: 302,
  });
}
