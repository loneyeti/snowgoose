import { NextRequest } from "next/server";
import {
  initializeAIVendors,
  chatRepository,
} from "@/app/_lib/db/repositories/chat.repository";
import {
  ChatResponse,
  LocalChat,
  ModelConfig,
  ContentBlock,
} from "@/app/_lib/model";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import { userRepository } from "@/app/_lib/db/repositories/user.repository";
import { getModel } from "@/app/_lib/server_actions/model.actions";
import { getPersona } from "@/app/_lib/server_actions/persona.actions";
import { getOutputFormat } from "@/app/_lib/server_actions/output-format.actions";
import { AIVendorFactory, AIRequestOptions, Message } from "snowgander";
import prisma from "@/app/_lib/db/prisma";
import { updateUserUsage } from "@/app/_lib/server_actions/user.actions";
import { Logger } from "next-axiom";
import { uploadBase64Image } from "@/app/_lib/storage";

function iteratorToStream(iterator: AsyncGenerator<ContentBlock>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        const chunk = JSON.stringify(value) + "\n\n";
        controller.enqueue(new TextEncoder().encode(chunk));
      }
    },
  });
}

export async function POST(req: NextRequest) {
  const log = new Logger({ source: "chat-stream-api" });
  console.log("Using streaming API route for chat.");

  try {
    const user = await getCurrentAPIUser();
    if (!user) {
      return new Response("Unauthorized: User not found.", { status: 401 });
    }
    log.with({ userId: user.id });

    try {
      await userRepository.checkUsageLimit(user.id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Usage limit exceeded")
      ) {
        log.warn("User has exceeded their usage limit.", { userId: user.id });
        return new Response(
          JSON.stringify({
            type: "error",
            publicMessage: "Usage limit exceeded.",
          }),
          { status: 429 }
        );
      }
      throw error;
    }

    const chat: LocalChat = await req.json();
    let finalVisionUrl = chat.visionUrl ?? null;

    // If new image data is present, upload it and get a public URL
    if (chat.imageData) {
      const mimeType = chat.imageData.substring(5, chat.imageData.indexOf(";"));
      const base64Data = chat.imageData.substring(
        chat.imageData.indexOf(",") + 1
      );
      finalVisionUrl = await uploadBase64Image(base64Data, mimeType);
    }

    const model = await getModel(chat.modelId);
    if (!model || !model.apiVendorId) {
      throw new Error("Model or Model Vendor not found");
    }

    const apiVendor = await prisma.aPIVendor.findUnique({
      where: { id: model.apiVendorId },
    });
    if (!apiVendor) {
      throw new Error(`API Vendor not found for ID: ${model.apiVendorId}`);
    }

    const modelConfig: ModelConfig = {
      apiName: model.apiName,
      isVision: model.isVision,
      isImageGeneration: model.isImageGeneration,
      isWebSearch: model.isWebSearch ?? undefined,
      isThinking: model.isThinking,
      inputTokenCost: model.inputTokenCost ?? undefined,
      outputTokenCost: model.outputTokenCost ?? undefined,
    };

    initializeAIVendors();
    const adapter = AIVendorFactory.getAdapter(apiVendor.name, modelConfig);

    // The client now sends the complete history, including the latest user prompt.
    const messages: Message[] = chat.responseHistory.map((chatResponse) => ({
      role: chatResponse.role,
      content: chatResponse.content,
    }));

    // FIX: Do not push user prompt again here. It's already in chat.responseHistory.

    const options: AIRequestOptions = {
      model: model.apiName,
      messages: messages,
      systemPrompt: chat.systemPrompt ?? undefined,
      maxTokens: chat.maxTokens ?? undefined,
      visionUrl: finalVisionUrl ?? undefined, // Use the potentially new public URL
      tools: undefined,
    };

    if (!adapter.streamResponse) {
      throw new Error("This adapter does not support streaming.");
    }
    const stream = adapter.streamResponse(options);

    await updateUserUsage(user.id, 0.0001);

    const readableStream = iteratorToStream(stream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    log.error("Error in chat stream API", { error: String(error) });
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(
      JSON.stringify({ type: "error", publicMessage: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
