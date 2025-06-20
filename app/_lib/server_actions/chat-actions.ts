"use server";

import {
  ChatResponse,
  Chat,
  LocalChat,
  OpenAIImageGenerationOptions,
  ContentBlock,
  ImageBlock,
} from "../model";
import { chatRepository } from "../db/repositories/chat.repository";
import { getModel } from "./model.actions";
import { getRenderTypeName } from "./render-type.actions";
import { getMcpTool } from "./mcp-tool.actions";
import { getApiVendor } from "./api_vendor.actions";
import { getPersona } from "./persona.actions";
import { supabaseUploadFile } from "../storage";
import { generateUniqueFilename } from "../utils";
import { FormSchema as BaseFormSchema } from "../form-schemas";
import { z } from "zod";
import { getOutputFormat } from "./output-format.actions";
import { getCurrentAPIUser } from "../auth";
import { userRepository } from "../db/repositories/user.repository";
import { Logger } from "next-axiom";
import { use } from "react";

export async function createChat(
  formData: FormData,
  responseHistory: ChatResponse[]
) {
  let log = new Logger({ source: "chat-action" }).with({ userId: "" });
  log.info("createChat action started");

  const FormSchema = BaseFormSchema.extend({
    imageSize: z
      .enum(["auto", "1024x1024", "1024x1536", "1536x1024"])
      .optional(),
    imageQuality: z.enum(["auto", "low", "medium", "high"]).optional(),
    imageBackground: z.enum(["auto", "opaque", "transparent"]).optional(),
    useWebSearch: z.preprocess((val) => val === "true", z.boolean()).optional(),
    useImageGeneration: z
      .preprocess((val) => val === "true", z.boolean())
      .optional(),
    lastImageGenerationId: z.string().optional(),
  });

  const {
    model,
    personaId,
    outputFormatId,
    prompt,
    maxTokens,
    budgetTokens,
    mcpTool,
    imageSize,
    imageQuality,
    imageBackground,
    useWebSearch,
    useImageGeneration,
    lastImageGenerationId,
  } = FormSchema.parse({
    model: formData.get("model"),
    personaId: formData.get("persona"),
    outputFormatId: formData.get("outputFormat"),
    prompt: formData.get("prompt"),
    maxTokens: formData.get("maxTokens") || null,
    budgetTokens: formData.get("budgetTokens") || null,
    mcpTool: formData.get("mcpTool") || 0,
    imageSize: formData.get("imageSize") || undefined,
    imageQuality: formData.get("imageQuality") || undefined,
    imageBackground: formData.get("imageBackground") || undefined,
    useWebSearch: formData.get("useWebSearch"),
    useImageGeneration: formData.get("useImageGeneration"),
    visionUrlFromPrevious:
      (formData.get("visionUrlFromPrevious") as string | null) || null,
    lastImageGenerationId: formData.get("lastImageGenerationId") || undefined,
  });

  log.info("Parsed form data", {
    model,
    personaId,
    outputFormatId,
    mcpTool,
    imageSize,
    imageQuality,
    imageBackground,
    useWebSearch,
    visionUrlFromPrevious: formData.get("visionUrlFromPrevious"),
  });

  let user = undefined;

  try {
    user = await getCurrentAPIUser();
    if (!user) {
      log.error("Authentication required or user not found in DB.");
      throw new Error("Authentication required or user not found.");
    }
    log = log.with({ userId: user.id });
    await userRepository.checkUsageLimit(user.id);
    log.info("Usage limit check passed.");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Usage limit exceeded")
    ) {
      log.warn("Usage limit exceeded for user.");
      throw error;
    }
    log.error("Failed to verify user usage limits", { error: String(error) });
    throw new Error("Failed to verify user usage limits.");
  }

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

  const userMessageContent: ContentBlock[] = [{ type: "text", text: prompt }];

  // PRIORITY 1: Check for an image generation ID for editing
  if (lastImageGenerationId && lastImageGenerationId.trim() !== "") {
    log.info("This is an image edit request. Including reference ID.", {
      id: lastImageGenerationId,
    });
    userMessageContent.push({
      type: "image_generation_call",
      id: lastImageGenerationId,
    });
  }
  // PRIORITY 2: If not editing, check for a NEWLY uploaded image for vision
  else if (visionUrl) {
    log.info("This is a new vision request. Including image URL.", {
      url: visionUrl,
    });
    const imageBlock: ImageBlock = { type: "image", url: visionUrl };
    userMessageContent.push(imageBlock);
  }

  const userChatResponse: ChatResponse = {
    role: "user",
    content: userMessageContent,
  };
  responseHistory.push(userChatResponse);

  let renderTypeName = "";
  if (outputFormatId) {
    try {
      renderTypeName = await getRenderTypeName(outputFormatId);
    } catch (error) {
      log.error("Error fetching output format render type name", {
        outputFormatId,
        error: String(error),
      });
      renderTypeName = "markdown";
    }
  }

  let modelObj = await getModel(Number(model));
  if (!modelObj) {
    throw new Error(`Model with ID ${model} not found`);
  }

  if (modelObj.paidOnly) {
    log.info("Selected model is paid-only. Checking user access.");
    const hasActiveSubscription =
      user &&
      user.stripeSubscriptionId &&
      user.stripeSubscriptionStatus === "active";
    const hasUnlimited = user && user.hasUnlimitedCredits === true;

    if (!hasActiveSubscription && !hasUnlimited) {
      log.warn(
        "User attempted to use a paid-only model without required access.",
        { userId: user?.id }
      );
      throw new Error(
        "This model requires an active paid subscription or special access."
      );
    } else if (hasUnlimited) {
      log.info("User has unlimited credits. Access granted.", {
        userId: user.id,
      });
    } else {
      log.info("User has an active subscription. Access granted.", {
        userId: user.id,
      });
    }
  }

  let systemPrompt;
  if (personaId) {
    try {
      const persona = await getPersona(personaId);
      systemPrompt = persona?.prompt;
    } catch (error) {
      log.error("Error fetching persona", { personaId, error: String(error) });
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
    }
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
    visionUrl: visionUrl,
    maxTokens,
    budgetTokens,
    systemPrompt: systemPrompt,
    mcpToolId: mcpTool,
    useWebSearch: useWebSearch,
    useImageGeneration: useImageGeneration,
    openaiImageGenerationOptions: undefined,
    openaiImageEditOptions: undefined,
  };

  if (previousVisionUrl && previousVisionUrl.trim() !== "") {
    chat.visionUrl = previousVisionUrl;
    chat.openaiImageEditOptions = {
      size: imageSize || "auto",
      quality: imageQuality || "auto",
      moderation: "low",
      user: `${user.id}`,
    };
  } else if (uploadedFile && uploadedFile.name !== "undefined") {
    try {
      const uploadURL = await supabaseUploadFile(
        generateUniqueFilename(uploadedFile.name),
        uploadedFile
      );
      if (uploadURL) {
        chat.visionUrl = uploadURL;
        chat.openaiImageEditOptions = {
          size: imageSize || "auto",
          quality: imageQuality || "auto",
          moderation: "low",
          user: `${user.id}`,
        };
      }
    } catch (error) {
      log.error("Problem uploading new file", {
        fileName: uploadedFile.name,
        error: String(error),
      });
    }
  } else if (modelObj.isImageGeneration && useImageGeneration) {
    chat.openaiImageGenerationOptions = {
      n: 1,
      size: imageSize || "1024x1024",
      quality: imageQuality || "auto",
      user: `${user.id}`,
    };
  }

  try {
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

    if (chat.model !== "dall-e-3") {
      responseHistory.push(result as ChatResponse);
      chat.responseHistory = responseHistory;
      if (chat.visionUrl) {
        chat.imageURL = null;
      }
      log.info("Handled standard chat response");
    } else {
      chat.imageURL = result as string;
      log.info("Handled DALL-E response");
    }
  } catch (error) {
    log.error("Failed to send Chat via repository", { error: String(error) });
    console.log(`Error: ${error}`);
    throw new Error("Failed to process chat request. Please try again.");
  }
  log.info("createChat action finished successfully.");
  return chat;
}
