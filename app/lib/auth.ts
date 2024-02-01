"use server";

import { auth, currentUser } from "@clerk/nextjs";
import { UserSession, APIUser } from "./model";

const accessToken = process.env.GPTFLASK_API;
const apiURL = process.env.GPTFLASK_URL;

export async function getUserSession() {
  const user = await currentUser();
  const { userId, sessionId, getToken } = auth();
  const emailAddresses = user?.emailAddresses ?? [];
  const email = emailAddresses.length > 0 ? emailAddresses[0].emailAddress : "";
  const userSession: UserSession = {
    userId: userId ?? "",
    sessionId: sessionId ?? "",
    email: email,
  };
  return userSession;
}

export async function getCurrentAPIUser() {
  const userSession = await getUserSession();
  try {
    const response = await fetch(`${apiURL}/api/current_user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userSession),
    });
    const apiUser: APIUser = await response.json();
    return apiUser;
  } catch (error) {
    console.log(error);
  }
}
