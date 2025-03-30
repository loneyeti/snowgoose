"use server";

import { createClient } from "@/app/_utils/supabase/server";
import { UserSession } from "./model";
import { userRepository } from "./db/repositories/user.repository";
import { ensureUserExists } from "./server_actions/user.actions";

export async function getUserSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userSession: UserSession = {
    userId: user?.id ?? "",
    //sessionId: user?.id ?? "", // Using user ID as session ID since Supabase doesn't have a separate session ID
    email: user?.email ?? "",
  };
  return userSession;
}

export async function getUserID() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return 0;

  const userDbId = await userRepository.findByAuthId(user.id);
  return userDbId?.id ?? 0;
}

export async function getCurrentAPIUser() {
  const user = await getUserSession();
  if (!user || !user.email) return null;
  const dbUser = await ensureUserExists(user);

  return dbUser;
}

export async function isCurrentUserAdmin() {
  const user = await getCurrentAPIUser();
  if (!user) return false;
  return user.isAdmin;
}
