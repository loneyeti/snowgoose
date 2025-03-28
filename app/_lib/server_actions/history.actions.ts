"use server";

import { revalidatePath } from "next/cache";
import { historyRepository } from "../db/repositories/history.repository";
import { userSettingsRepository } from "../db/repositories/user-settings.repository";
import { modelRepository } from "../db/repositories/model.repository";
import { AIVendorFactory } from "../ai/factory";
import { Chat, TextBlock } from "../model";
import { getUserID } from "../auth";

export async function getHistory(userId: number) {
  return historyRepository.findAll(userId);
}

export async function deleteHistory(id: number) {
  await historyRepository.delete(id);
  revalidatePath("/settings/history");
}

export async function saveChat(chat: Chat) {
  const userId = await getUserID();
  // Get user's preferred summary model
  const userSettings = await userSettingsRepository.findByUserId(userId);
  let summaryModel = null;

  if (userSettings?.summaryModelPreferenceId) {
    summaryModel = await modelRepository.findById(
      userSettings.summaryModelPreferenceId
    );
  }

  // If no preferred model, use a default one
  if (!summaryModel) {
    summaryModel = await modelRepository.findByApiName("gpt-4o");
    if (!summaryModel) {
      throw new Error("No summary model available");
    }
  }
  console.log(`Summary model is: ${summaryModel.apiName}`);
  // Get the appropriate AI vendor adapter
  const adapter = await AIVendorFactory.getAdapter(summaryModel);

  // Create a system prompt for title generation
  const systemPrompt =
    "You are an expert at taking in OpenAI API JSON chat requests and coming up with a brief one sentence title for the chat history.";

  // Generate a title using the AI vendor
  const titleResponse = await adapter.generateResponse({
    model: summaryModel.apiName,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Give me a short, one sentence title for this chat history: ${JSON.stringify(chat)}`,
      },
    ],
  });

  // Extract title from response content
  let title = "Untitled Chat";
  if (typeof titleResponse.content === "string") {
    title = titleResponse.content;
  } else if (Array.isArray(titleResponse.content)) {
    // Find the first text block
    const textBlock = titleResponse.content.find(
      (block): block is TextBlock => block.type === "text"
    );
    if (textBlock) {
      title = textBlock.text;
    }
  }

  // Save the conversation
  const savedChat = await historyRepository.create({
    userId,
    title,
    conversation: JSON.stringify(chat),
  });

  revalidatePath("/settings/history");

  return title;
}
