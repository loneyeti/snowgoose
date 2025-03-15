"use server";

import { ChatResponse, Chat } from "./model";
import { z } from "zod";
import { chatRepository } from "./db/repositories/chat.repository";
import { getModel } from "./server_actions/model.actions";
import { getRenderTypeName } from "./server_actions/render-type.actions";
import { getMCPTool } from "./server_actions/mcp-tool.actions";
import { getApiVendor } from "./server_actions/api_vendor.actions";
import { getPersona } from "./server_actions/persona.actions";
import { gcsUploadFile } from "./gcs";
import { generateUniqueFilename } from "./utils";

const FormSchema = z.object({
  model: z.string(),
  personaId: z.coerce.number(),
  outputFormatId: z.coerce.number(),
  prompt: z.string(),
  maxTokens: z.coerce.number().nullable(),
  budgetTokens: z.coerce.number().nullable(),
  mcpTool: z.coerce.number(),
});

export async function createChat(
  formData: FormData,
  responseHistory: ChatResponse[]
) {
  const {
    model,
    personaId,
    outputFormatId,
    prompt,
    maxTokens,
    budgetTokens,
    mcpTool,
  } = FormSchema.parse({
    model: formData.get("model"),
    personaId: formData.get("persona"),
    outputFormatId: formData.get("outputFormat"),
    prompt: formData.get("prompt"),
    maxTokens: formData.get("maxTokens") || null,
    budgetTokens: formData.get("budgetTokens") || null,
    mcpTool: formData.get("mcpTool") || 0,
  });
  const userChatResponse: ChatResponse = {
    role: "user",
    content: prompt,
  };
  console.log("mcp form data:");
  console.log(formData.get("mcpTool"));
  responseHistory.push(userChatResponse);

  // Get Render Type (eg: markdown, html, etc)
  let renderTypeName = "";
  if (outputFormatId) {
    try {
      renderTypeName = await getRenderTypeName(outputFormatId);
    } catch (error) {
      console.error("Error fetching output format render type name", error);
      throw error;
    }
  }

  let modelObj = await getModel(Number(model));
  if (!modelObj) {
    throw new Error(`Model with ID ${model} not found`);
  }

  // Get persona prompt if personaId exists
  let personaPrompt;
  if (personaId) {
    try {
      const persona = await getPersona(personaId);
      personaPrompt = persona?.prompt;
    } catch (error) {
      console.error("Error fetching persona:", error);
    }
  }

  const chat: Chat = {
    responseHistory: responseHistory,
    personaId,
    outputFormatId,
    renderTypeName,
    imageData: null,
    model: modelObj.apiName,
    modelId: modelObj.id,
    prompt,
    imageURL: null,
    maxTokens,
    budgetTokens,
    personaPrompt,
  };

  // If there is a file, we upload to Google Cloud storage and get the URL
  const file = formData.get("image") as File | null;
  if (file && file.name !== "undefined") {
    try {
      console.log("FILE IS:");
      console.log(file);
      const uploadURL = await gcsUploadFile(
        generateUniqueFilename(file.name),
        file
      );
      if (uploadURL) {
        chat.imageData = uploadURL;
      }
    } catch (error) {
      console.error("Problem uploading file", error);
      throw error;
    }
  }

  // Send chat request with MCP tool if selected
  try {
    let mcpToolData;
    let apiVendor = await getApiVendor(modelObj?.apiVendorId ?? 0);
    console.log(mcpTool);
    if (mcpTool > 0 && apiVendor?.name === "anthropic") {
      console.log("MCP Tool data set");
      mcpToolData = await getMCPTool(mcpTool);
      console.log(mcpToolData);
      if (!mcpToolData) {
        throw new Error(`MCP Tool not found`);
      }
    }
    const result = await chatRepository.sendChat(chat, mcpToolData);

    if (chat.model !== "dall-e-3") {
      responseHistory.push(result as ChatResponse);
      chat.responseHistory = responseHistory;
      // Clear image data after sending while keeping the URL in response history
      if (chat.imageData) {
        chat.imageData = null;
      }
    } else {
      chat.imageURL = result as string;
    }
  } catch (error) {
    console.error("Failed to send Chat", error);
    throw error;
  }
  return chat;
}
