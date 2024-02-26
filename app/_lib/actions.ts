"use server";

import { ChatResponse, Chat } from "./model";
import { z } from "zod";
import { fetchRenderTypeName, sendChat } from "./api";
import { gcsUploadFile } from "./gcs";
import { generateUniqueFilename } from "./utils";

const FormSchema = z.object({
  model: z.string(),
  persona: z.coerce.number(),
  outputFormat: z.coerce.number(),
  prompt: z.string(),
});

export async function createChat(
  formData: FormData,
  responseHistory: ChatResponse[]
) {
  const { model, persona, outputFormat, prompt } = FormSchema.parse({
    model: formData.get("model"),
    persona: formData.get("persona"),
    outputFormat: formData.get("outputFormat"),
    prompt: formData.get("prompt"),
  });
  const userChatResponse: ChatResponse = {
    role: "user",
    content: prompt,
  };

  responseHistory.push(userChatResponse);

  // Get Render Type (eg: markdown, html, etc)
  let renderTypeName = "";
  if (outputFormat) {
    try {
      renderTypeName = await fetchRenderTypeName(outputFormat);
    } catch (error) {
      console.error("Error fetching output format render type name", error);
      throw error;
    }
  }

  const chat: Chat = {
    responseHistory: responseHistory,
    persona,
    outputFormat,
    renderTypeName,
    imageData: null,
    model,
    prompt,
    imageURL: null,
  };

  // If there is a file, we upload to Google Cloud storage and get the URL
  const file = formData.get("image") as File | null;
  if (file) {
    try {
      const uploadURL = await gcsUploadFile(
        generateUniqueFilename(file.name),
        file
      );
      chat.imageData = uploadURL ?? "";
    } catch (error) {
      console.error("Problem uploading file", error);
      throw error;
    }
  }

  // Send to OpenAI. If Dall-E, then display an image, otherwise update the conversation
  try {
    const result = await sendChat(chat);
    if (chat.model !== "dall-e-3") {
      responseHistory.push(result as ChatResponse);
      chat.responseHistory = responseHistory;
    } else {
      chat.imageURL = result as string;
    }
  } catch (error) {
    console.error("Failed to sent Chat", error);
    throw error;
  }
  return chat;
}
