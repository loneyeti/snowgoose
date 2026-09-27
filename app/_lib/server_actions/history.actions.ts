"use server";

import { revalidatePath } from "next/cache";
import { historyRepository } from "../db/repositories/history.repository";
import { userSettingsRepository } from "../db/repositories/user-settings.repository";
import { modelRepository } from "../db/repositories/model.repository";
import { AIVendorFactory, ModelConfig } from "snowgander";
import { Chat, TextBlock, Model } from "../model";
import { getUserID } from "../auth";
import { getModelAdaptorOptions } from "./model.actions";
import { initializeAIVendors } from "../db/repositories/chat.repository";
import { Logger } from "next-axiom";
import { getVisibleText } from "../utils";

// Helper function to generate chat title
async function _generateChatTitle(userId: number, chat: Chat): Promise<string> {
  const log = new Logger({ source: "history.actions" }).with({
    userId: userId,
  });
  initializeAIVendors();
  try {
    // Get user's preferred summary model
    const userSettings = await userSettingsRepository.findByUserId(userId);
    let summaryModel: Model | null = null;

    if (userSettings?.summaryModelPreferenceId) {
      summaryModel = await modelRepository.findById(
        userSettings.summaryModelPreferenceId,
      );
      log.debug(
        `Using preferred summary model: ${summaryModel?.name} for user ${userId}`,
      );
    }

    // If no preferred model or fetch failed, use a default one
    if (!summaryModel) {
      log.debug(
        `No preferred summary model found or fetch failed for user ${userId}, using default.`,
      );
      summaryModel = await modelRepository.findByApiName("gpt-4o"); // Consider making default configurable
      if (!summaryModel) {
        log.error("Default summary model 'gpt-4o' not found."); // Replaced logger.error
        // Fallback title if no model is available at all
        return "Untitled Chat"; // Return default title immediately
      }
    }

    // Get the appropriate AI vendor adapter
    const { name, modelConfig } = await getModelAdaptorOptions(summaryModel);
    const adapter = AIVendorFactory.getAdapter(name, modelConfig);

    // Create a system prompt for title generation
    const systemPrompt =
      "Create a brief, descriptive one-sentence title for this conversation. Focus on the main topic or question. Do not include quotes or formatting.";
    // Research results contain large raw vendor payloads needed for follow-up
    // turns. Keep those in saved history, but send only visible text for titles.
    const titleContext = chat.responseHistory
      .map((response) => {
        const text = getVisibleText(response).trim();
        return text ? `${response.role}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n")
      .slice(0, 12000);

    // Generate a title using the AI vendor
    const titleResponse = await adapter.generateResponse({
      model: summaryModel.apiName,
      messages: [
        {
          role: "system",
          content: [{ type: "text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a short, one-sentence title for this conversation:\n${titleContext || chat.prompt}`,
            },
          ],
        },
      ],
      // Add parameters to encourage brevity if supported by the model/adapter
      // max_tokens: 20, // Example
    });

    // Extract title from response content
    let title = "Untitled Chat"; // Default title
    if (Array.isArray(titleResponse.content)) {
      const textBlock = titleResponse.content.find(
        (block): block is TextBlock => block.type === "text",
      );
      if (textBlock) {
        title = textBlock.text.trim();
      }
    }

    // Basic cleanup - remove potential quotes sometimes added by models
    title = title.replace(/^["']|["']$/g, "");

    //log.info(`Generated title "${title}" for chat.`);
    return title;
  } catch (error) {
    log.error(`Error generating chat title: ${error}`); // Replaced logger.error
    // Return a default title in case of error during generation
    return "Untitled Chat"; // Return default title immediately
  }
}

export async function getHistory(userId: number) {
  return historyRepository.findAll(userId);
}

export async function deleteHistory(id: number) {
  await historyRepository.delete(id);
  revalidatePath("/chat/settings/history");
}

export async function saveChat(chat: Chat): Promise<string> {
  const userId = await getUserID();
  const log = new Logger({ source: "history.actions" }).with({
    userId: userId,
  });

  // Generate title using the helper function
  const title = await _generateChatTitle(userId, chat);

  try {
    // Save the conversation with the generated title
    const savedChat = await historyRepository.create({
      userId,
      title,
      conversation: JSON.stringify(chat), // Ensure chat is stringified
    });

    //console.info(`Saved chat with ID: ${savedChat.id} and title: "${title}"`); // Replaced logger.info

    // Revalidate the history path to update UI lists
    revalidatePath("/chat/settings/history");
    revalidatePath("/chat"); // Also revalidate the main page if history is shown there

    return title; // Return the generated/saved title
  } catch (error) {
    log.error(`Error saving chat to history: ${error}`);
    // Throw a user-friendly error or handle as appropriate
    // Following systemPatterns.md: Log details server-side (done above) and throw generic error.
    throw new Error("Failed to save chat history."); // User-friendly error
  }
}
