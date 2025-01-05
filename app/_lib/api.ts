"use server";

import { unstable_noStore as noStore } from "next/cache";
import {
  Chat,
  ChatResponse,
  OutputFormat,
  OutputFormatPost,
  Persona,
  PersonaPost,
  RenderType,
  Model,
  ModelPost,
} from "./model";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getUserSession } from "./auth";
import {
  CreatePersonaFormSchema,
  CreateOutputFormatFormSchema,
  UpdateOutputFormatFormSchema,
  UpdatePersonaFormSchema,
  CreateModelFormSchema,
  UpdateModelFormSchema,
} from "./form-schemas";

const accessToken = process.env.GPTFLASK_API;
const apiURL = process.env.GPTFLASK_URL;

export async function fetchPersonas() {
  try {
    const result = await fetch(`${apiURL}/api/personas`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["personas"] },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchPersona(id: string) {
  try {
    const result = await fetch(`${apiURL}/api/personas/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["personas"] },
    });
    const data = await result.json();
    return data as Persona;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function createPersona(formData: FormData) {
  noStore();

  const persona: PersonaPost = CreatePersonaFormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
  });

  try {
    const result = await fetch(`${apiURL}/api/personas`, {
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
  revalidateTag("personas");
  redirect("/settings/personas");
}

export async function updatePersona(formData: FormData) {
  const persona: Persona = UpdatePersonaFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    prompt: formData.get("prompt"),
  });

  try {
    const result = await fetch(`${apiURL}/api/personas/${persona.id}`, {
      method: "PUT",
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
  revalidateTag("personas");
  redirect("/settings/personas");
}

export async function deletePersona(id: string) {
  console.log("Delete invoice");
  try {
    const result = await fetch(`${apiURL}/api/personas/${id}`, {
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
  try {
    const result = await fetch(`${apiURL}/api/models`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["models"] },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchModelByAPIName(api_name: string) {
  noStore();

  try {
    const result = await fetch(`${apiURL}/api/models/api_name/${api_name}`, {
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

export async function fetchModel(id: string) {
  noStore();

  try {
    const result = await fetch(`${apiURL}/api/models/${id}`, {
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

export async function fetchAPIVendors() {
  noStore();

  try {
    const result = await fetch(`${apiURL}/api/api-vendors`, {
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

export async function createModel(formData: FormData) {
  noStore();

  const model: ModelPost = CreateModelFormSchema.parse({
    api_name: formData.get("api_name"),
    name: formData.get("name"),
    is_vision: formData.get("is_vision") === "on" ? true : false,
    is_image_generation:
      formData.get("is_image_generation") === "on" ? true : false,
    api_vendor_id: formData.get("api_vendor_id"),
  });

  try {
    const response = await fetch(`${apiURL}/api/models`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    });

    if (!response.ok) {
      throw new Error("Failed to add new model");
    }

    //const data = await response.json();
    //return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
  revalidatePath("/settings/models");
  revalidateTag("models");
  redirect("/settings/models");
}

export async function updateModel(formData: FormData) {
  const model: Model = UpdateModelFormSchema.parse({
    id: formData.get("id"),
    api_name: formData.get("api_name"),
    name: formData.get("name"),
    is_vision: formData.get("is_vision") === "on" ? true : false,
    is_image_generation:
      formData.get("is_image_generation") === "on" ? true : false,
    api_vendor_id: formData.get("api_vendor_id"),
  });

  try {
    const result = await fetch(`${apiURL}/api/models/${model.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    });
    //const data = await result.json()
    //return data
  } catch (error) {
    console.log(error);
    throw new Error("Unable to update model.");
  }
  revalidatePath("/settings/models");
  revalidateTag("models");
  redirect("/settings/models");
}

export async function deleteModel(id: string) {
  try {
    const response = await fetch(`${apiURL}/api/models/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete model");
    }

    //return { success: true };
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error as Error);
    return { success: false, error: (error as Error).message };
  }
  revalidatePath("/settings/models");
  revalidateTag("models");
  redirect("/settings/models");
}

export async function fetchOutputFormats() {
  try {
    const result = await fetch(`${apiURL}/api/output-formats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["outputFormats"] },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchOutputFormat(id: string) {
  noStore();
  try {
    const result = await fetch(`${apiURL}/api/output-formats/${id}`, {
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

export async function fetchRenderTypes() {
  try {
    const render_types = await fetch(`${apiURL}/api/render-types`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const render_types_json = await render_types.json();
    return render_types_json;
  } catch (error) {
    console.log("Can't fetch render types");
  }
}

export async function fetchRenderTypeName(outputFormatId: string) {
  try {
    const output_format = await fetchOutputFormat(outputFormatId);
    return output_format.render_type_name;
  } catch (error) {
    console.log("Can't fetch output format render type");
  }
}

export async function createOutputFormat(formData: FormData) {
  noStore();

  const output_format: OutputFormatPost = CreateOutputFormatFormSchema.parse({
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    render_type_id: formData.get("render_type_id"),
  });

  try {
    const result = await fetch(`${apiURL}/api/output-formats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(output_format),
    });
  } catch (error) {
    console.log(error);
    throw new Error("Unable to create Output Format.");
  }
  revalidatePath("/settings/output-formats");
  revalidateTag("outputFormats");
  redirect("/settings/output-formats");
}

export async function updateOutputFormat(formData: FormData) {
  const outputFormat: OutputFormat = UpdateOutputFormatFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    prompt: formData.get("prompt"),
    render_type_id: formData.get("render_type_id"),
  });

  try {
    const result = await fetch(
      `${apiURL}/api/output-formats/${outputFormat.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(outputFormat),
      }
    );
    //const data = await result.json()
    //return data
  } catch (error) {
    console.log(error);
    throw new Error("Unable to update Output Format.");
  }
  revalidatePath("/settings/output-formats");
  revalidateTag("outputFormats");
  redirect("/settings/output-formats");
}

export async function deleteOutputFormat(id: string) {
  try {
    const result = await fetch(`${apiURL}/api/output-formats/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
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

  // Set endpoint URL based on model
  const endpointURL = chat.model === "dall-e-3" ? "/api/dalle" : "/api/chat";

  try {
    const result = await fetch(`${apiURL}${endpointURL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chat),
    });
    if (!result.ok) {
      throw new Error("There was an issue generating a response");
    }
    const data = await result.json();
    return chat.model !== "dall-e-3"
      ? (data as ChatResponse)
      : (data.data[0].url as string);
  } catch (error) {
    console.error("Error submitting request", error);
    throw error;
  }
}

export async function saveChat(chat: Chat) {
  noStore();
  const userSession = await getUserSession();
  const body = JSON.stringify({ ...chat, ...userSession });
  try {
    const result = await fetch(`${apiURL}/api/save_chat`, {
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
  console.log(body);

  try {
    const result = await fetch(`${apiURL}/api/history`, {
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

export async function deleteHistory(id: string) {
  const userSession = await getUserSession();
  const body = JSON.stringify(userSession);

  try {
    const result = await fetch(`${apiURL}/api/history/delete/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (result.ok) {
      console.log("History Deleted");
    } else {
      console.log(result.status);
    }
  } catch (error) {
    console.log("Error deleting history");
    console.log(error);
    throw new Error("Error deleting history");
  }

  revalidateTag("history");
}
