import { NextRequest, NextResponse } from "next/server";
import { initializeAIVendors } from "@/app/_lib/db/repositories/chat.repository";
import { LocalChat, ModelConfig, ImageBlock } from "@/app/_lib/model";
import { getCurrentAPIUser } from "@/app/_lib/auth";
import { userRepository } from "@/app/_lib/db/repositories/user.repository";
import { getModel } from "@/app/_lib/server_actions/model.actions";
import { AIVendorFactory, AIRequestOptions, Message } from "snowgander";
import prisma from "@/app/_lib/db/prisma";
import { deductUserCredits } from "@/app/_lib/server_actions/user.actions";
import { Logger } from "next-axiom";
import { uploadBase64Image } from "@/app/_lib/storage";

export async function POST(req: NextRequest) {
  const log = new Logger({ source: "chat-stream-api-unified" });
  console.log("Using unified streaming API route for all chat.");

  try {
    const user = await getCurrentAPIUser();
    if (!user) {
      return new Response("Unauthorized: User not found.", { status: 401 });
    }
    log.with({ userId: user.id });

    // Simple check - just verify user has positive credit balance
    const userWithCredits = await userRepository.findById(user.id);
    if (!userWithCredits || (userWithCredits.creditBalance ?? 0) <= 0) {
      log.warn("User has insufficient credits", { userId: user.id });
      return new Response(
        JSON.stringify({
          type: "error",
          publicMessage: "Insufficient credits for this request.",
        }),
        { status: 402 }
      );
    }

    const chat: LocalChat = await req.json();

    // If there is new image data, upload it and replace the base64 with a URL.
    // This is for *new* vision requests, not edits.
    if (chat.imageData) {
      const mimeType = chat.imageData.substring(5, chat.imageData.indexOf(";"));
      const base64Data = chat.imageData.substring(
        chat.imageData.indexOf(",") + 1
      );
      const finalVisionUrl = await uploadBase64Image(base64Data, mimeType);

      // Find the last user message and update the image block with the new URL
      const lastMessage = chat.responseHistory[chat.responseHistory.length - 1];
      if (lastMessage && Array.isArray(lastMessage.content)) {
        const imageBlockIndex = lastMessage.content.findIndex(
          (block): block is ImageBlock => block.type === "image"
        );
        if (imageBlockIndex !== -1) {
          const imageBlock = lastMessage.content[imageBlockIndex] as ImageBlock;
          log.info(
            `Replacing blob URL ${imageBlock.url} with public URL ${finalVisionUrl}`
          );
          lastMessage.content[imageBlockIndex] = {
            ...imageBlock,
            url: finalVisionUrl,
          };
        }
      }
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
      webSearchCost: model.webSearchCost ?? undefined,
    };

    initializeAIVendors();
    const adapter = AIVendorFactory.getAdapter(apiVendor.name, modelConfig);

    const messages: Message[] = chat.responseHistory.map((chatResponse) => ({
      role: chatResponse.role,
      content: chatResponse.content,
    }));

    const tools: AIRequestOptions["tools"] = [];
    if (chat.useImageGeneration && model.isImageGeneration) {
      log.info("Image generation enabled, adding tool to request.");
      tools.push({ type: "image_generation", partial_images: 1 });
    }
    if (chat.useWebSearch) {
      log.info("Web search enabled, adding tool to request.");
      tools.push({ type: "web_search_preview" });
    }

    const options: AIRequestOptions = {
      model: model.apiName,
      messages: messages,
      systemPrompt: chat.systemPrompt ?? undefined,
      maxTokens: chat.maxTokens ?? undefined,
      thinkingMode: (chat.budgetTokens ?? 0) > 0 && model.isThinking,
      budgetTokens: chat.budgetTokens ?? undefined,
      tools: tools.length > 0 ? tools : undefined,
      previousResponseId: chat.previousResponseId,
      useImageGeneration: chat.useImageGeneration, // <-- ADD THIS LINE
    };

    // --- UNIFIED STREAMING PATH FOR ALL RESPONSES ---
    log.info("Handling all requests via the streaming path.", {
      model: model.apiName,
    });
    if (!adapter.streamResponse) {
      throw new Error("This adapter does not support streaming.");
    }

    console.log(
      `Starting stream with these options: ${JSON.stringify(options)}`
    );

    // --- START: NEW, CORRECTED CODE ---
    const stream = adapter.streamResponse(options);

    const finalImagesToUpload = new Map<
      string,
      { base64Data: string; mimeType: string }
    >();

    // We create a new stream that we control, allowing us to process snowgander's output
    // before sending it to the client.
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Iterate through the stream from snowgander
          for await (const chunk of stream) {
            // CHECK 1: If it's the final metadata block, this is where we get the cost.
            if (chunk.type === "meta" && chunk.usage) {
              log.info("Received meta block with usage data. Updating user.", {
                userId: user.id,
                totalCost: chunk.usage.totalCost,
              });
              console.log(`Meta block: ${JSON.stringify(chunk)}`);
              // Securely update the user's usage on the server.
              let totalCost = chunk.usage.totalCost;
              if (chunk.usage.didGenerateImage) {
                console.log("Generated image so adding on usage");
                totalCost = totalCost + 0.25;
              }
              console.log(`Final total cost: ${totalCost}`);
              const creditCost =
                totalCost /
                parseFloat(process.env.BASE_CREDIT_TO_DOLLAR_RATIO!);
              if (creditCost > 0.0) {
                await deductUserCredits(user.id, creditCost);
              }
            }

            // CHECK 2: If it's a fuzzy image chunk, track it for final upload.
            if (chunk.type === "image_data" && chunk.id) {
              finalImagesToUpload.set(chunk.id, {
                base64Data: chunk.base64Data,
                mimeType: chunk.mimeType,
              });
            }

            // Regardless of the chunk type, forward it to the client.
            const chunkString = JSON.stringify(chunk) + "\n\n";
            controller.enqueue(new TextEncoder().encode(chunkString));
          }

          // The AI stream has finished. Now, upload the final version of each image.
          log.info("Main AI stream finished. Uploading final images.", {
            count: finalImagesToUpload.size,
          });
          for (const [id, { base64Data, mimeType }] of Array.from(
            finalImagesToUpload.entries()
          )) {
            try {
              const imageUrl = await uploadBase64Image(base64Data, mimeType);
              const finalImageBlock: ImageBlock = {
                type: "image",
                url: imageUrl,
                generationId: id,
              };
              const chunkString = JSON.stringify(finalImageBlock) + "\n\n";
              controller.enqueue(new TextEncoder().encode(chunkString));
              log.info(
                "Successfully uploaded and enqueued final image block.",
                { generationId: id }
              );
            } catch (e) {
              log.error("Failed to upload final streamed image data", {
                error: String(e),
                generationId: id,
              });
              const errorBlock = {
                type: "error",
                publicMessage: "Failed to save final generated image.",
              };
              const chunkString = JSON.stringify(errorBlock) + "\n\n";
              controller.enqueue(new TextEncoder().encode(chunkString));
            }
          }
          const completeSignal = { type: "stream-complete" };
          const completeChunkString = JSON.stringify(completeSignal) + "\n\n";
          controller.enqueue(new TextEncoder().encode(completeChunkString));
        } catch (error) {
          log.error("Error while processing stream on server", {
            error: String(error),
          });
          // Send an error to the client if something goes wrong on the server
          const errorBlock = {
            type: "error",
            publicMessage:
              "An internal server error occurred during streaming.",
          };
          const chunkString = JSON.stringify(errorBlock) + "\n\n";
          controller.enqueue(new TextEncoder().encode(chunkString));
        } finally {
          // All done, close the stream to the client.
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
    // --- END: NEW, CORRECTED CODE ---
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
