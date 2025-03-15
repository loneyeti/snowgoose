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
  UserSettings,
  MCPTool,
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
  UpdateUserSettingsSchema,
  CreateMCPToolFormSchema,
  UpdateMCPToolFormSchema,
} from "./form-schemas";

const accessToken = process.env.GPTFLASK_API;
const apiURL = process.env.GPTFLASK_URL;

// Helper function to get the base URL for API requests
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }
  // Server should use the absolute URL
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT || 3000}`;
}

export async function fetchPersonas() {
  try {
    const result = await fetch(`${getBaseUrl()}/api/personas`, {
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
    const result = await fetch(`${getBaseUrl()}/api/personas/${id}`, {
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
    const result = await fetch(`${getBaseUrl()}/api/personas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(persona),
    });
    if (!result.ok) {
      throw new Error("Failed to create persona");
    }
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
    const result = await fetch(`${getBaseUrl()}/api/personas/${persona.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(persona),
    });
    if (!result.ok) {
      throw new Error("Failed to update persona");
    }
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
    throw new Error("Unable to update Persona.");
  }
  revalidatePath("/settings/personas");
  revalidateTag("personas");
  redirect("/settings/personas");
}

export async function deletePersona(id: string) {
  try {
    const result = await fetch(`${getBaseUrl()}/api/personas/${id}`, {
      method: "DELETE",
    });
    if (!result.ok) {
      throw new Error("Failed to delete persona");
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
    const result = await fetch(`${getBaseUrl()}/api/models`, {
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
    const result = await fetch(
      `${getBaseUrl()}/api/models/api_name/${api_name}`
    );
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
    // Fetch model data
    const result = await fetch(`${getBaseUrl()}/api/models/${id}`);
    const modelData = await result.json();

    // Fetch API vendors to get the vendor name
    const apiVendorsResult = await fetch(`${getBaseUrl()}/api/api-vendors`);
    const apiVendors = await apiVendorsResult.json();

    // Find the matching vendor and add its name to the model data
    const vendor = apiVendors.find(
      (v: any) => v.id === modelData.api_vendor_id
    );
    return {
      ...modelData,
      api_vendor_name: vendor ? vendor.name : null,
    };
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchAPIVendors() {
  noStore();

  try {
    const result = await fetch(`${getBaseUrl()}/api/api-vendors`);
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
    is_thinking: formData.get("is_thinking") === "on" ? true : false,
    api_vendor_id: formData.get("api_vendor_id"),
  });

  try {
    const response = await fetch(`${getBaseUrl()}/api/models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    });

    if (!response.ok) {
      throw new Error("Failed to add new model");
    }
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
    throw new Error("Unable to create model");
  }
  revalidatePath("/settings/models");
  revalidateTag("models");
  redirect("/settings/models");
}
/*
export async function updateModel(formData: FormData) {
  const model: Model = UpdateModelFormSchema.parse({
    id: formData.get("id"),
    api_name: formData.get("api_name"),
    name: formData.get("name"),
    is_vision: formData.get("is_vision") === "on" ? true : false,
    is_image_generation:
      formData.get("is_image_generation") === "on" ? true : false,
    is_thinking: formData.get("is_thinking") === "on" ? true : false,
    api_vendor_id: formData.get("api_vendor_id"),
  });

  try {
    const result = await fetch(`${getBaseUrl()}/api/models/${model.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(model),
    });
    if (!result.ok) {
      throw new Error("Failed to update model");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to update model");
  }
  revalidatePath("/settings/models");
  revalidateTag("models");
  redirect("/settings/models");
}
*/
export async function deleteModel(id: string) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/models/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete model");
    }
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
    throw new Error("Error deleting model");
  }
  revalidatePath("/settings/models");
  revalidateTag("models");
  redirect("/settings/models");
}

export async function fetchOutputFormats() {
  try {
    const result = await fetch(`${getBaseUrl()}/api/output-formats`, {
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
    const result = await fetch(`${getBaseUrl()}/api/output-formats/${id}`);
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchRenderTypes() {
  try {
    const render_types = await fetch(`${getBaseUrl()}/api/render-types`);
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
    const result = await fetch(`${getBaseUrl()}/api/output-formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(output_format),
    });
    if (!result.ok) {
      throw new Error("Failed to create output format");
    }
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
      `${getBaseUrl()}/api/output-formats/${outputFormat.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(outputFormat),
      }
    );
    if (!result.ok) {
      throw new Error("Failed to update output format");
    }
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
    const result = await fetch(`${getBaseUrl()}/api/output-formats/${id}`, {
      method: "DELETE",
    });
    if (!result.ok) {
      throw new Error("Failed to delete output format");
    }
  } catch (error) {
    console.log("Error deleting output format");
    console.log(error);
    throw new Error("Error deleting output format");
  }

  revalidatePath("/settings/output-formats");
}

export async function sendChat(chat: Chat, mcpToolData?: MCPTool) {
  noStore();

  // Set endpoint URL based on model and MCP tool
  let endpointURL = "/api/chat";
  if (chat.model === "dall-e-3") {
    endpointURL = "/api/dalle";
  } else if (mcpToolData) {
    endpointURL = "/api/mcp_chat";
    console.log("MCP Tool Called.");
  }

  try {
    const body = mcpToolData
      ? {
          ...chat,
          mcp_server_path: mcpToolData.path,
          mcp_env_vars: mcpToolData.env_vars || {},
        }
      : chat;

    const result = await fetch(endpointURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    const result = await fetch("/api/history/save", {
      method: "POST",
      headers: {
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
    const result = await fetch("/api/history", {
      method: "POST",
      headers: {
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
    const result = await fetch(`/api/history/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    if (!result.ok) {
      throw new Error("Failed to delete history");
    }
  } catch (error) {
    console.log("Error deleting history");
    console.log(error);
    throw new Error("Error deleting history");
  }

  revalidateTag("history");
}

// Fetch user settings
export async function fetchUserSettings() {
  noStore();
  const userSession = await getUserSession();
  const body = JSON.stringify(userSession);

  try {
    const response = await fetch("/api/user-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
      next: { tags: ["userSettings"] },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user settings");
    }

    const data = await response.json();
    return data as UserSettings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw error;
  }
}

// Update user settings
export async function updateUserSettings(formData: FormData) {
  noStore();

  const settings = UpdateUserSettingsSchema.parse({
    id: formData.get("id"),
    appearance_mode: formData.get("appearance_mode"),
    summary_model_preference_id: formData.get("summary_model_preference_id")
      ? parseInt(formData.get("summary_model_preference_id") as string, 10)
      : undefined,
  });

  try {
    const response = await fetch(`/api/user-settings/${settings.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to update user settings");
    }

    const data = await response.json();
    revalidatePath("/settings");
    revalidateTag("userSettings");
    return data;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
}

export async function fetchMCPTools() {
  try {
    const result = await fetch("/api/mcp-tools", {
      next: { tags: ["mcpTools"] },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function fetchMCPTool(id: string) {
  noStore();
  try {
    const result = await fetch(`/api/mcp-tools/${id}`);
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("ERROR!!!");
    console.log(error);
  }
}

export async function createMCPTool(formData: FormData) {
  noStore();

  const mcpTool = CreateMCPToolFormSchema.parse({
    name: formData.get("name"),
    path: formData.get("path"),
  });

  try {
    const result = await fetch("/api/mcp-tools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mcpTool),
    });
    if (!result.ok) {
      throw new Error("Failed to create MCP Tool");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to create MCP Tool.");
  }
  revalidatePath("/settings/mcp-tools");
  revalidateTag("mcpTools");
  redirect("/settings/mcp-tools");
}

export async function updateMCPTool(formData: FormData) {
  const mcpTool = UpdateMCPToolFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    path: formData.get("path"),
  });

  try {
    const result = await fetch(`/api/mcp-tools/${mcpTool.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mcpTool),
    });
    if (!result.ok) {
      throw new Error("Failed to update MCP Tool");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to update MCP Tool.");
  }
  revalidatePath("/settings/mcp-tools");
  revalidateTag("mcpTools");
  redirect("/settings/mcp-tools");
}

export async function deleteMCPTool(id: string) {
  try {
    const result = await fetch(`/api/mcp-tools/${id}`, {
      method: "DELETE",
    });
    if (!result.ok) {
      throw new Error("Failed to delete MCP Tool");
    }
  } catch (error) {
    console.log("Error deleting MCP Tool");
    console.log(error);
    throw new Error("Error deleting MCP Tool");
  }

  revalidatePath("/settings/mcp-tools");
  revalidateTag("mcpTools");
}
