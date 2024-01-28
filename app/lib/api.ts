"use server";

import { unstable_noStore as noStore } from "next/cache";
import { Chat, ChatResponse, PersonaPost } from "./model";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { METHODS } from "http";
import { getUserSession } from "./auth";

const accessToken = process.env.GPTFLASK_API;

export async function fetchGreeting() {
  noStore();

  try {
    const result = await fetch(`http://localhost:5001/api/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ greeting: "hi" }),
    });
    console.log("ALL GOOD!");
    const data = await result.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchPersonas() {
  noStore();
  //await new Promise((resolve) => setTimeout(resolve, 3000));
  try {
    const result = await fetch(`http://localhost:5001/api/personas`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

const FormSchema = z.object({
  name: z.string(),
  prompt: z.string(),
});

export async function createPersona(formData: FormData) {
  noStore();

  const persona: PersonaPost = FormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
  });

  try {
    const result = await fetch(`http://localhost:5001/api/personas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(persona),
    });
    //const data = await result.json()
    //return data
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
    throw new Error("Unable to create Persona.");
  }
  revalidatePath("/settings/personas");
  redirect("/settings/personas");
}

export async function deletePersona(id: string) {
  console.log("Delete invoice");
  try {
    const result = await fetch(`http://localhost:5001/api/personas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (result.ok) {
      console.log("Persona Deleted");
    } else {
      console.log(result.status);
    }
  } catch (error) {
    console.log("Error deleting persona");
    console.log(error);
    throw new Error("Error deleting persona");
  }

  revalidatePath("/settings/personas");
}

export async function fetchModels() {
  noStore();

  try {
    const result = await fetch(`http://localhost:5001/api/models`);
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchOutputFormats() {
  noStore();

  try {
    const result = await fetch(`http://localhost:5001/api/output-formats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function createOutputFormat(formData: FormData) {
  noStore();

  const persona: PersonaPost = FormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
  });

  try {
    const result = await fetch(`http://localhost:5001/api/output-formats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(persona),
    });
    //const data = await result.json()
    //return data
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
    throw new Error("Unable to create Output Format.");
  }
  revalidatePath("/settings/output-formats");
  redirect("/settings/output-formats");
}

export async function deleteOutputFormat(id: string) {
  try {
    const result = await fetch(
      `http://localhost:5001/api/output-formats/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (result.ok) {
      console.log("Output Format Deleted");
    } else {
      console.log(result.status);
    }
  } catch (error) {
    console.log("Error deleting output format");
    console.log(error);
    throw new Error("Error deleting output format");
  }

  revalidatePath("/settings/output-formats");
}

export async function sendChat(chat: Chat) {
  noStore();
  console.log("Sending chat");
  try {
    const result = await fetch(`http://localhost:5001/api/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chat),
    });
    if (!result.ok) {
      throw new Error("Unauthorized request: Please login again.");
    }
    const data = await result.json();
    console.log(data.choices[0].message);
    return data.choices[0].message as ChatResponse;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
    throw error;
  }
}

export async function saveChat(chat: Chat) {
  noStore();
  const userSession = await getUserSession();
  const body = JSON.stringify({ ...chat, ...userSession });
  //console.log(userSession);
  //console.log(`The combined objects are ${body}`);
  try {
    const result = await fetch(`http://localhost:5001/api/save_chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (!result.ok) {
      throw new Error("Error saving conversation");
    }
    revalidateTag("history");
    const data = await result.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchHistory() {
  const userSession = await getUserSession();
  const body = JSON.stringify(userSession);

  try {
    const result = await fetch(`http://localhost:5001/api/history`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body,
      next: { tags: ["history"] },
    });
    if (!result.ok) {
      throw new Error("Error fetching conversation");
    }
    const data = await result.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
