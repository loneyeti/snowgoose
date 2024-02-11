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

  let renderTypeName = "";
  if (outputFormat) {
    try {
      renderTypeName = await fetchRenderTypeName(outputFormat);
    } catch (error) {
      console.log("Error fetching output format render type name");
    }
  }

  const chat: Chat = {
    responseHistory: responseHistory,
    model: model,
    persona: persona,
    outputFormat: outputFormat,
    renderTypeName: renderTypeName,
    prompt: prompt,
    imageData: null,
    imageURL: null,
  };
  /*
  const imageBase64 = formData.get("imageBase64") as string | null;
  if (imageBase64) {
    chat.imageData = imageBase64;
  }
  */

  const file = formData.get("image") as File | null;
  if (file) {
    try {
      const uploadURL = await gcsUploadFile(
        generateUniqueFilename(file.name),
        file
      );
      chat.imageData = uploadURL ?? "";
    } catch (error) {
      console.log("Problem uploading file");
    }
  }

  try {
    const result = await sendChat(chat);
    if (chat.model !== "dall-e-3") {
      responseHistory.push(result as ChatResponse);
      chat.responseHistory = responseHistory;
    } else {
      chat.imageURL = result as string;
    }
  } catch (error) {
    console.error("Failed to sent Chat");
    throw error;
  }
  return chat;
}
