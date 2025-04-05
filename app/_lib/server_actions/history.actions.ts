"use server";

import { revalidatePath } from "next/cache";
import { historyRepository } from "../db/repositories/history.repository";
import { userSettingsRepository } from "../db/repositories/user-settings.repository";
import { modelRepository } from "../db/repositories/model.repository";
import { AIVendorFactory, ModelConfig } from "snowgander";
import { Chat, TextBlock, Model } from "../model";
import { getUserID } from "../auth";
import { getModelAdaptorOptions } from "./model.actions";

// Helper function to generate chat title
async function _generateChatTitle(userId: number, chat: Chat): Promise<string> {
  try {
    // Get user's preferred summary model
    const userSettings = await userSettingsRepository.findByUserId(userId);
    let summaryModel: Model | null = null;

    if (userSettings?.summaryModelPreferenceId) {
      summaryModel = await modelRepository.findById(
        userSettings.summaryModelPreferenceId
      );
      console.debug(
        `Using preferred summary model: ${summaryModel?.name} for user ${userId}`
      );
    }

    // If no preferred model or fetch failed, use a default one
    if (!summaryModel) {
      console.debug(
        `No preferred summary model found or fetch failed for user ${userId}, using default.`
      );
      summaryModel = await modelRepository.findByApiName("gpt-4o"); // Consider making default configurable
      if (!summaryModel) {
        console.error("Default summary model 'gpt-4o' not found."); // Replaced logger.error
        // Fallback title if no model is available at all
        return "Untitled Chat"; // Return default title immediately
      }
    }

    // Get the appropriate AI vendor adapter
    const { name, modelConfig } = await getModelAdaptorOptions(summaryModel);
    const adapter = await AIVendorFactory.getAdapter(name, modelConfig);

    // Create a system prompt for title generation
    const systemPrompt =
      "You are an expert at taking in OpenAI API JSON chat requests and coming up with a brief, concise, descriptive one-sentence title for the chat history. Focus on the main topic or question. Do not include quotes or formatting.";

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
          content: `Generate a short, one-sentence title for this chat history: ${JSON.stringify(chat)}`,
        },
      ],
      // Add parameters to encourage brevity if supported by the model/adapter
      // max_tokens: 20, // Example
    });

    // Extract title from response content
    let title = "Untitled Chat"; // Default title
    if (typeof titleResponse.content === "string") {
      title = titleResponse.content.trim();
    } else if (Array.isArray(titleResponse.content)) {
      const textBlock = titleResponse.content.find(
        (block): block is TextBlock => block.type === "text"
      );
      if (textBlock) {
        title = textBlock.text.trim();
      }
    }

    // Basic cleanup - remove potential quotes sometimes added by models
    title = title.replace(/^["']|["']$/g, "");

    console.info(`Generated title "${title}" for chat.`); // Replaced logger.info
    return title;
  } catch (error) {
    console.error("Error generating chat title:", error); // Replaced logger.error
    // Return a default title in case of error during generation
    return "Untitled Chat"; // Return default title immediately
  }
}

export async function getHistory(userId: number) {
  return historyRepository.findAll(userId);
}

export async function deleteHistory(id: number) {
  await historyRepository.delete(id);
  revalidatePath("/settings/history");
}

export async function saveChat(chat: Chat): Promise<string> {
  const userId = await getUserID();

  // Generate title using the helper function
  const title = await _generateChatTitle(userId, chat);

  try {
    // Save the conversation with the generated title
    const savedChat = await historyRepository.create({
      userId,
      title,
      conversation: JSON.stringify(chat), // Ensure chat is stringified
    });

    console.info(`Saved chat with ID: ${savedChat.id} and title: "${title}"`); // Replaced logger.info

    // Revalidate the history path to update UI lists
    revalidatePath("/settings/history");
    revalidatePath("/"); // Also revalidate the main page if history is shown there

    return title; // Return the generated/saved title
  } catch (error) {
    console.error("Error saving chat to history:", error);
    // Throw a user-friendly error or handle as appropriate
    // Following systemPatterns.md: Log details server-side (done above) and throw generic error.
    throw new Error("Failed to save chat history."); // User-friendly error
  }
}
