"use server";

import {
  ChatResponse,
  Chat,
  LocalChat,
  OpenAIImageGenerationOptions,
  ContentBlock,
  ImageBlock,
} from "../model"; // Added OpenAIImageGenerationOptions, ContentBlock, ImageBlock
import { chatRepository } from "../db/repositories/chat.repository";
import { getModel } from "./model.actions";
import { getRenderTypeName } from "./render-type.actions";
import { getMcpTool } from "./mcp-tool.actions";
import { getApiVendor } from "./api_vendor.actions";
import { getPersona } from "./persona.actions";
import { supabaseUploadFile } from "../storage";
import { generateUniqueFilename } from "../utils";
import { FormSchema as BaseFormSchema } from "../form-schemas"; // Rename original schema
import { z } from "zod"; // Import Zod
import { getOutputFormat } from "./output-format.actions";
import { getCurrentAPIUser } from "../auth"; // Import correct auth helper
import { userRepository } from "../db/repositories/user.repository"; // Import user repository
import { Logger } from "next-axiom"; // Import Axiom Logger
import { use } from "react";

export async function createChat(
  formData: FormData,
  responseHistory: ChatResponse[]
) {
  let log = new Logger({ source: "chat-action" }).with({ userId: "" }); // Use let instead of const
  log.info("createChat action started");

  // Extend the base schema to include image options
  const FormSchema = BaseFormSchema.extend({
    imageSize: z
      .enum(["auto", "1024x1024", "1024x1536", "1536x1024"])
      .optional(),
    imageQuality: z.enum(["auto", "low", "medium", "high"]).optional(),
    imageBackground: z.enum(["auto", "opaque", "transparent"]).optional(),
    // START OF CHANGE: Modify Zod schema to correctly parse the string "true"
    useWebSearch: z.preprocess((val) => val === "true", z.boolean()).optional(),
    // END OF CHANGE
  });

  const {
    model,
    personaId,
    outputFormatId,
    prompt,
    maxTokens,
    budgetTokens,
    mcpTool, // Keep parsing the mcpTool ID from the form
    // Add new image options
    imageSize,
    imageQuality,
    imageBackground,
    useWebSearch,
  } = FormSchema.parse({
    model: formData.get("model"),
    personaId: formData.get("persona"),
    outputFormatId: formData.get("outputFormat"),
    prompt: formData.get("prompt"),
    maxTokens: formData.get("maxTokens") || null,
    budgetTokens: formData.get("budgetTokens") || null,
    mcpTool: formData.get("mcpTool") || 0,
    // Parse new image options from form data
    imageSize: formData.get("imageSize") || undefined, // Use undefined if null/empty
    imageQuality: formData.get("imageQuality") || undefined,
    imageBackground: formData.get("imageBackground") || undefined,
    // Parse the web search toggle
    useWebSearch: formData.get("useWebSearch"),
    // Parse the vision URL from previous response
    visionUrlFromPrevious:
      (formData.get("visionUrlFromPrevious") as string | null) || null,
  });
  log.info("Parsed form data", {
    model,
    personaId,
    outputFormatId,
    mcpTool,
    imageSize,
    imageQuality,
    imageBackground,
    useWebSearch, // Log the parsed boolean
    visionUrlFromPrevious: formData.get("visionUrlFromPrevious"), // Log the received value
  });

  let user = undefined;

  // --- Usage Limit Check ---
  try {
    // Get the full user object from our DB using the helper
    user = await getCurrentAPIUser();
    if (!user) {
      // getCurrentAPIUser returns null if not authenticated or user doesn't exist in DB yet
      log.error("Authentication required or user not found in DB.");
      throw new Error("Authentication required or user not found.");
    }
    // Add user ID to logger context
    log = log.with({ userId: user.id });

    // Check usage limit before proceeding using the user's DB ID
    await userRepository.checkUsageLimit(user.id);
    log.info("Usage limit check passed.");
  } catch (error) {
    // Re-throw the specific error message if it's the usage limit one
    if (
      error instanceof Error &&
      error.message.startsWith("Usage limit exceeded")
    ) {
      log.warn("Usage limit exceeded for user.");
      throw error; // Let the calling code handle this specific error
    }
    // Otherwise, log and throw a generic error
    log.error("Failed to verify user usage limits", { error: String(error) });
    throw new Error("Failed to verify user usage limits.");
  }
  // --- End Usage Limit Check ---

  // START OF RESTRUCTURED LOGIC

  let visionUrl: string | null = null;
  const previousVisionUrl = formData.get("visionUrlFromPrevious") as
    | string
    | null;
  const uploadedFile = formData.get("image") as File | null;

  if (previousVisionUrl && previousVisionUrl.trim() !== "") {
    log.info("Using vision URL from previous response", {
      url: previousVisionUrl,
    });
    visionUrl = previousVisionUrl;
  } else if (uploadedFile && uploadedFile.name !== "undefined") {
    log.info("Attempting new file upload.");
    try {
      const uploadURL = await supabaseUploadFile(
        generateUniqueFilename(uploadedFile.name),
        uploadedFile
      );
      if (uploadURL) {
        log.info("New file uploaded successfully", { uploadURL });
        visionUrl = uploadURL;
      }
    } catch (error) {
      log.error("Problem uploading new file", {
        fileName: uploadedFile.name,
        error: String(error),
      });
    }
  }

  // Now, construct the user's message content with both text and image if available
  const userMessageContent: ContentBlock[] = [{ type: "text", text: prompt }];
  if (visionUrl) {
    const imageBlock: ImageBlock = { type: "image", url: visionUrl };
    userMessageContent.push(imageBlock);
  }

  // Create the final user response object and add it to history
  const userChatResponse: ChatResponse = {
    role: "user",
    content: userMessageContent,
  };
  responseHistory.push(userChatResponse);

  // END OF RESTRUCTURED LOGIC

  // Get Render Type (eg: markdown, html, etc)
  let renderTypeName = "";
  if (outputFormatId) {
    try {
      renderTypeName = await getRenderTypeName(outputFormatId);
    } catch (error) {
      log.error("Error fetching output format render type name", {
        outputFormatId,
        error: String(error),
      });
      // Allow chat to proceed without render type if needed
      renderTypeName = "markdown"; // Default or fallback render type
    }
  }

  let modelObj = await getModel(Number(model));
  if (!modelObj) {
    throw new Error(`Model with ID ${model} not found`);
  }

  // --- Paid Model Check ---
  if (modelObj.paidOnly) {
    log.info("Selected model is paid-only. Checking user access.");
    // User object should be guaranteed to exist here due to earlier checks
    const hasActiveSubscription =
      user &&
      user.stripeSubscriptionId &&
      user.stripeSubscriptionStatus === "active";
    const hasUnlimited = user && user.hasUnlimitedCredits === true;

    if (!hasActiveSubscription && !hasUnlimited) {
      log.warn(
        "User attempted to use a paid-only model without required access (no active subscription or unlimited credits).",
        { userId: user?.id }
      );
      // Throw a specific error message
      throw new Error(
        "This model requires an active paid subscription or special access. Please upgrade your plan or contact support."
      );
    } else if (hasUnlimited) {
      log.info(
        "User has unlimited credits. Access granted for paid-only model.",
        { userId: user.id }
      );
    } else {
      log.info(
        "User has an active subscription. Access granted for paid-only model.",
        { userId: user.id }
      );
    }
  }
  // --- End Paid Model Check ---

  // Get persona prompt if personaId exists
  let systemPrompt;
  if (personaId) {
    try {
      const persona = await getPersona(personaId);
      systemPrompt = persona?.prompt;
    } catch (error) {
      log.error("Error fetching persona", { personaId, error: String(error) });
      // Allow chat to proceed without persona prompt
      // personaPrompt remains undefined, which is handled later
    }
  }
  let outputFormatPrompt;
  if (outputFormatId) {
    try {
      const outputFormat = await getOutputFormat(outputFormatId);
      outputFormatPrompt = outputFormat?.prompt;
    } catch (error) {
      log.error("Error fetching Output Format", {
        outputFormatId,
        error: String(error),
      });
      // Allow chat to proceed without output format prompt
      // outputFormatPrompt remains undefined
    }
    // Combine prompts safely, handling undefined cases
    systemPrompt = [systemPrompt, outputFormatPrompt].filter(Boolean).join(" ");
  }

  const chat: LocalChat = {
    responseHistory: responseHistory,
    personaId,
    outputFormatId,
    renderTypeName,
    imageURL: null,
    model: modelObj.apiName,
    modelId: modelObj.id,
    prompt,
    visionUrl: visionUrl, // Pass the determined visionUrl
    maxTokens,
    budgetTokens,
    systemPrompt: systemPrompt,
    mcpToolId: mcpTool, // Add the mcpToolId directly to the chat object
    useWebSearch: useWebSearch, // Add web search flag
    // Initialize options conditionally based on file upload
    openaiImageGenerationOptions: undefined, // Initialize as undefined
    openaiImageEditOptions: undefined, // Initialize as undefined
  };

  // --- Vision URL Logic ---
  if (previousVisionUrl && previousVisionUrl.trim() !== "") {
    // Priority 1: Use previous URL
    log.info("Using vision URL from previous response", {
      url: previousVisionUrl,
    });
    chat.visionUrl = previousVisionUrl;
    // Apply EDIT options if provided
    if (imageSize || imageQuality) {
      chat.openaiImageEditOptions = {
        size: imageSize,
        quality: imageQuality,
        moderation: "low",
        user: `${user.id}`,
      };
      log.info(
        "Populated OpenAI Image Edit options (size, quality) for previous image URL",
        { options: chat.openaiImageEditOptions }
      );
    } else {
      chat.openaiImageEditOptions = {
        size: "auto",
        quality: "auto",
        moderation: "low",
      };
    }
  } else if (uploadedFile && uploadedFile.name !== "undefined") {
    // Priority 2: Handle new file upload
    log.info("No previous vision URL, attempting new file upload.");
    try {
      const uploadURL = await supabaseUploadFile(
        generateUniqueFilename(uploadedFile.name),
        uploadedFile
      );
      if (uploadURL) {
        log.info("New file uploaded successfully", { uploadURL });
        chat.visionUrl = uploadURL;
        // Apply EDIT options if provided
        if (imageSize || imageQuality) {
          chat.openaiImageEditOptions = {
            size: imageSize,
            quality: imageQuality,
            moderation: "low",
            user: `${user.id}`,
          };
          log.info(
            "Populated OpenAI Image Edit options (size, quality) for new upload",
            { options: chat.openaiImageEditOptions }
          );
        } else {
          chat.openaiImageEditOptions = {
            size: "auto",
            quality: "auto",
            moderation: "low",
            user: `${user.id}`,
          };
        }
      }
    } catch (error) {
      log.error("Problem uploading new file", {
        fileName: uploadedFile.name,
        error: String(error),
      });
      // Allow chat to proceed without the image if upload fails
      // chat.visionUrl remains null
    }
  } else {
    // Priority 3: No previous URL and no new file upload
    log.info("No previous vision URL and no new file uploaded.");
    // If the selected model is for image generation, ensure generation options are set.
    if (modelObj.isImageGeneration) {
      // Ensure the options object is created for generation models, using form values or sensible defaults.
      chat.openaiImageGenerationOptions = {
        n: 1, // We always generate one image
        size: imageSize || "1024x1024", // Default size if not provided
        quality: imageQuality || "auto", // Default quality to 'auto' if not provided
        // 'background' is not a standard OpenAI param, removed.
        // Let snowgander handle 'auto' values if passed from the form.
        user: `${user.id}`, // Pass user ID
      };
      log.info(
        "Populated OpenAI Image Generation options (using defaults if needed)",
        {
          options: chat.openaiImageGenerationOptions,
        }
      );
    } else {
      log.info("Model is not image generation, skipping generation options.");
    }
  }
  // --- End Vision URL Logic ---

  // Send chat request
  try {
    // The repository now handles fetching the tool based on chat.mcpToolId
    log.info("Sending chat to repository", {
      model: chat.model,
      modelId: chat.modelId,
      personaId: chat.personaId,
      outputFormatId: chat.outputFormatId,
      mcpToolId: chat.mcpToolId,
      hasVisionUrl: !!chat.visionUrl,
    });
    const result = await chatRepository.sendChat(chat);
    log.info("Received response from repository");

    // Handle DALL-E response or standard chat response
    if (chat.model !== "dall-e-3") {
      responseHistory.push(result as ChatResponse);
      chat.responseHistory = responseHistory;
      // Clear image data after sending while keeping the URL in response history
      if (chat.visionUrl) {
        chat.imageURL = null;
      }
      log.info("Handled standard chat response"); // Moved log here
    } else {
      chat.imageURL = result as string;
      log.info("Handled DALL-E response");
    }
    // Removed the incorrect extra 'else' block
  } catch (error) {
    log.error("Failed to send Chat via repository", { error: String(error) });
    // Note: The specific "Usage limit exceeded" error is now caught *before* this block.
    // This block catches errors from chatRepository.sendChat itself.
    throw new Error("Failed to process chat request. Please try again.");
  }
  log.info("createChat action finished successfully.");
  return chat;
}
