"use client";

import Conversation from "./conversation";
import OptionsBar from "./options-bar";
import MoreOptions from "./more-options";
import TextInputArea from "./text-input-area";
import React, { useState, useEffect, Fragment, useRef } from "react";
import { useModelState } from "./hooks/useModelState";
import { useThinkingState } from "./hooks/useThinkingState";
import { Popover, Transition } from "@headlessui/react";
import {
  LocalChat,
  ChatResponse,
  ChatUserSession,
  ChatWrapperProps,
} from "@/app/_lib/model";
import UtilityIconRow from "./utility-icon-row";
import { getHistory } from "../../_lib/server_actions/history.actions";
import { ConversationHistory, User } from "@prisma/client"; // Import User type if needed, or adjust based on actual user prop type
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import Link from "next/link";
import BuyCreditsButton from "../buy-credits/BuyCreditsButton";
import CreditsDisplay from "../buy-credits/CreditsDisplay";
import { getUserID } from "@/app/_lib/auth";
import { getUserCreditBalanceAction } from "@/app/_lib/server_actions/user.actions";
import { usePersonaState } from "./hooks/usePersonaState";
import { useOutputFormatState } from "./hooks/useOutputFormatState";
import { useMCPToolState } from "./hooks/useMCPToolState";
import { useLogger } from "next-axiom";
import { toast } from "sonner";
import { ImageBlock, ContentBlock } from "@/app/_lib/model";

function deduplicateImageBlocks(content: ContentBlock[]): ContentBlock[] {
  const imageMap = new Map<string, ContentBlock>();
  const result: ContentBlock[] = [];

  // First pass: collect all image-related blocks by ID
  for (const block of content) {
    if (block.type === "image" && block.generationId) {
      imageMap.set(block.generationId, block);
    } else if (block.type === "image_data" && block.id) {
      // Only keep if we don't already have a final image for this ID
      if (!imageMap.has(block.id)) {
        imageMap.set(block.id, block);
      }
    }
  }

  // Second pass: build result, skipping duplicates
  const seenIds = new Set<string>();
  for (const block of content) {
    if (block.type === "image" && block.generationId) {
      if (!seenIds.has(block.generationId)) {
        result.push(block);
        seenIds.add(block.generationId);
      }
    } else if (block.type === "image_data" && block.id) {
      if (!seenIds.has(block.id)) {
        result.push(block);
        seenIds.add(block.id);
      }
    } else {
      // Non-image blocks pass through
      result.push(block);
    }
  }

  return result;
}

export default function ChatWrapper({
  userPersonas,
  globalPersonas,
  models,
  outputFormats,
  mcpTools,
  apiVendors,
  user,
  creditBalance,
}: ChatWrapperProps) {
  const log = useLogger().with({ userId: user.id });
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const toggleMoreOptions = () => setShowMoreOptions(!showMoreOptions);

  // This state now holds the complete history of finalized messages.
  const [responseHistory, setResponseHistory] = useState<ChatResponse[]>([]);
  // This state will hold the message currently being streamed from the AI.
  const [streamingResponse, setStreamingResponse] =
    useState<ChatResponse | null>(null);

  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useImageGeneration, setUseImageGeneration] = useState(false);
  const toggleWebSearch = () => setUseWebSearch((prev) => !prev);
  const toggleImageGeneration = () => setUseImageGeneration((prev) => !prev);
  // Local state to manage the over-limit status immediately
  const [currentCreditBalance, setCurrentCreditBalance] =
    useState(creditBalance);
  const [currentChat, setCurrentChat] = useState<LocalChat | undefined>();
  const [isHistoryShowing, setIsHistoryShowing] = useState(false);
  const [showConversationSpinner, setShowConversationSpinner] =
    useState<boolean>(false);
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [renderTypeName, setRenderTypeName] = useState("");
  // const [hidePersonas] = useState(false);
  const [hideOutputFormats] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState<
    string | undefined
  >();
  interface LastImageInfo {
    url: string | null;
    generationId: string | null;
  }

  const [lastAssistantImage, setLastAssistantImage] = useState<LastImageInfo>({
    url: null,
    generationId: null,
  });
  const personas = [...(userPersonas || []), ...(globalPersonas || [])];

  // Custom hooks
  const {
    selectedModel,
    selectedModelVendor,
    showFileUpload,
    showMCPTools,
    showTokenSliders,
    showWebSearchToggle,
    showImageGenerationToggle,
    updateSelectedModel,
  } = useModelState({
    models,
    apiVendors,
    initialModelId: currentChat?.modelId,
  });

  // Determine if image options should be shown based on the selected model's vendor
  const shouldShowImageOptions =
    showImageGenerationToggle && useImageGeneration;

  function getModelName(): string {
    const model = models.find((model) => model.id === parseInt(selectedModel));
    return model?.name || "";
  }

  const { selectedPersona, updateSelectedPersona } = usePersonaState({
    personas,
    initialPersonaId: currentChat?.personaId,
  });

  const { selectedOutputFormat, updateSelectedOutputFormat } =
    useOutputFormatState({
      outputFormats,
      initialOutputFormatId: currentChat?.outputFormatId,
    });

  const { selectedMCPTool, updateSelectedMCPTool } = useMCPToolState({
    mcpTools,
    initialMCPToolId: currentChat?.mcpToolId,
  });

  const {
    selectedPreset,
    maxTokens,
    budgetTokens,
    updatePreset,
    thinkingPresets,
  } = useThinkingState({
    showTokenSliders,
    initialPreset: "Thinking Off",
    initialMaxTokens: currentChat?.maxTokens ?? null,
    initialBudgetTokens: currentChat?.budgetTokens ?? null,
  });

  const refreshCreditBalance = async () => {
    if (!user?.id) return;
    try {
      const newBalance = await getUserCreditBalanceAction(user.id);
      if (newBalance !== null) {
        setCurrentCreditBalance(newBalance);
      } else {
        log.error("Failed to refresh credit balance (action returned null).");
      }
    } catch (error) {
      log.error("Error calling getUserCreditBalanceAction", {
        error: String(error),
      });
    }
  };

  // Define updateMessage before useFormSubmission
  const [lastImageGenerationId, setLastImageGenerationId] = useState<
    string | null
  >(null);

  const updateMessage = (chat: LocalChat | undefined) => {
    let lastImageUrl: string | null = null;
    let lastImageId: string | null = null;

    if (chat) {
      if (!chat.imageURL) {
        setResponseHistory(chat.responseHistory);
        const lastMessage =
          chat.responseHistory[chat.responseHistory.length - 1];
        if (
          lastMessage &&
          lastMessage.role !== "user" &&
          Array.isArray(lastMessage.content)
        ) {
          // Find the ImageBlock in the last assistant message
          const imageBlock = lastMessage.content.find(
            (block): block is ImageBlock => block.type === "image"
          );

          if (imageBlock) {
            lastImageUrl = imageBlock.url;
            // The generationId should be on the ImageBlock
            if (imageBlock.generationId) {
              lastImageId = imageBlock.generationId;
              log.info("Found ImageBlock with generationId in last response", {
                id: lastImageId,
              });
            }
          }
        }
      } else {
        setImageURL(chat.imageURL);
        lastImageUrl = null;
        lastImageId = null;
      }
      setCurrentChat(chat);
      setRenderTypeName(`${chat.renderTypeName}`);
    } else {
      setResponseHistory([]);
      lastImageUrl = null;
      lastImageId = null;
    }

    setLastAssistantImage({ url: lastImageUrl, generationId: lastImageId });
    // This state is now redundant since we use lastAssistantImage, but we'll leave it for the hidden input
    setLastImageGenerationId(lastImageId);
  };

  const updateShowSpinner = (showSpinner: boolean) => {
    setShowConversationSpinner(showSpinner);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFormSubmit = async (formData: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowConversationSpinner(true); // <-- ADD THIS LINE
    setStreamingResponse(null);
    setIsStreamComplete(false);

    const prompt = formData.get("prompt") as string;
    const imageFile = formData.get("image") as File | null;

    // Get the generation ID from our state
    const imageToEditId = lastAssistantImage.generationId;

    let visionUrlForDisplay: string | null = null;
    let base64ImageData: string | undefined = undefined;

    if (imageFile && imageFile.size > 0) {
      visionUrlForDisplay = URL.createObjectURL(imageFile);
      try {
        base64ImageData = await fileToBase64(imageFile);
      } catch (error) {
        toast.error("Failed to read image file.");
        setIsSubmitting(false);
        return;
      }
    } else if (imageToEditId) {
      // If we are editing, use the previous image's URL for display
      visionUrlForDisplay = lastAssistantImage.url;
    }

    const userMessageContent: ContentBlock[] = [{ type: "text", text: prompt }];

    // If there's a new image upload, it's a vision request.
    if (visionUrlForDisplay && !imageToEditId) {
      userMessageContent.push({ type: "image", url: visionUrlForDisplay });
    }

    // If we have an ID for an image to edit, add the 'image_generation_call' block.
    // This is for multi-turn editing.
    if (imageToEditId) {
      userMessageContent.push({
        type: "image_generation_call",
        id: imageToEditId,
      });
    }

    const userMessage: ChatResponse = {
      role: "user",
      content: userMessageContent,
    };

    // Important: When we start a new submission, we clear the previous image ID
    // so it's not accidentally used again for a different request.
    setLastAssistantImage({ url: null, generationId: null });

    const updatedHistory = [...responseHistory, userMessage];
    setResponseHistory(updatedHistory);

    const chatPayload: LocalChat = {
      responseHistory: updatedHistory,
      modelId: parseInt(selectedModel),
      personaId: parseInt(selectedPersona),
      outputFormatId: selectedOutputFormat || 0,
      renderTypeName: renderTypeName,
      prompt: prompt,
      maxTokens: maxTokens,
      budgetTokens: budgetTokens,
      systemPrompt:
        (personas.find((p) => p.id === parseInt(selectedPersona))?.prompt ||
          "") +
        " " +
        (outputFormats.find((o) => o.id === selectedOutputFormat)?.prompt ||
          ""),
      visionUrl: null, // This is for new uploads, handled by imageData
      imageData: base64ImageData,
      useImageGeneration,
      useWebSearch,
      previousResponseId: previousResponseId,
      model: models.find((m) => m.id === parseInt(selectedModel))?.name || "",
      imageURL: imageURL,
    };

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload),
      });

      // Turn off the spinner as soon as we get a response, even before reading the body.
      // The streaming response component will appear, which is a better UX.
      setShowConversationSpinner(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.publicMessage || `Error: ${response.statusText}`
        );
      }

      // Check if the response is a stream or a single JSON object
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        // --- HANDLE NON-STREAMED JSON RESPONSE (FOR IMAGES) ---
        const finalContent: ContentBlock[] = await response.json();
        const finalResponse: ChatResponse = {
          role: "assistant",
          content: finalContent,
        };
        // Add the complete response to history at once
        setResponseHistory((prev) => [...prev, finalResponse]);
      } else {
        // --- HANDLE STREAMED RESPONSE (FOR TEXT) ---
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to get response reader");

        const decoder = new TextDecoder();

        // Initialize the streaming response directly in state
        setStreamingResponse({ role: "assistant", content: [] });

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          if (parts.length > 0) {
            // Use the functional update form of setState for reliability
            setStreamingResponse((prevResponse) => {
              if (!prevResponse) return { role: "assistant", content: [] };

              // Create a deep copy to ensure immutability
              const newContent: ContentBlock[] = JSON.parse(
                JSON.stringify(prevResponse.content)
              );

              for (const part of parts) {
                if (part.trim() === "") continue;
                try {
                  const parsedChunk = JSON.parse(part);

                  // Handle the stream-complete signal
                  if (parsedChunk.type === "stream-complete") {
                    setIsStreamComplete(true);
                    continue;
                  }
                  const lastBlock =
                    newContent.length > 0
                      ? newContent[newContent.length - 1]
                      : null;

                  switch (parsedChunk.type) {
                    case "meta":
                      // Handle the new MetaBlock type
                      console.log(
                        "Received MetaBlock with responseId:",
                        parsedChunk.responseId
                      );
                      setPreviousResponseId(parsedChunk.responseId);
                      continue; // Use continue to skip to the next part of the loop

                    case "text":
                      if (lastBlock && lastBlock.type === "text") {
                        // Append text to the last block if it's also a text block
                        lastBlock.text += parsedChunk.text;
                      } else {
                        // Otherwise, push a new text block
                        newContent.push(parsedChunk);
                      }
                      break;

                    // --- THINKING AGGREGATION ---
                    case "thinking":
                      // Check if the last block in the content array is also a thinking block.
                      if (lastBlock && lastBlock.type === "thinking") {
                        // If so, append the new thinking text to it.
                        lastBlock.thinking += parsedChunk.thinking;
                      } else {
                        // Otherwise, this is the first thinking chunk, so push it as a new block.
                        newContent.push(parsedChunk);
                      }
                      break;

                    case "image_data": {
                      // This is a blurry preview chunk.
                      console.log("Received PARTIAL image_data block:", {
                        id: parsedChunk.id,
                        hasData: !!parsedChunk.base64Data,
                        dataLength: parsedChunk.base64Data?.length,
                      });
                      const id = parsedChunk.id;
                      if (id) {
                        const indexToReplace = newContent.findIndex(
                          (b) => b.type === "image_data" && b.id === id
                        );
                        if (indexToReplace !== -1) {
                          newContent[indexToReplace] = parsedChunk;
                        } else {
                          newContent.push(parsedChunk);
                        }
                      } else {
                        // Fallback for null ID: Replace the LAST ImageDataBlock.
                        // This assumes only one image is being generated at a time.
                        const lastImageDataIndex = newContent
                          .map((b) => b.type)
                          .lastIndexOf("image_data");
                        if (lastImageDataIndex !== -1) {
                          // If we find a previous fuzzy image, replace it.
                          newContent[lastImageDataIndex] = parsedChunk;
                        } else {
                          // If this is the very first fuzzy image, add it.
                          newContent.push(parsedChunk);
                        }
                      }
                      break;
                    }

                    case "image": {
                      // This is the FINAL, high-resolution image chunk.
                      console.log("Received FINAL image block:", {
                        generationId: parsedChunk.generationId,
                        url: parsedChunk.url,
                      });
                      const generationId = parsedChunk.generationId;
                      if (generationId) {
                        // Find the blurry `image_data` preview that has the matching ID.
                        const indexToReplace = newContent.findIndex(
                          (b) =>
                            b.type === "image_data" && b.id === generationId
                        );

                        if (indexToReplace !== -1) {
                          // We found the preview! Replace it in the array with the final image.
                          newContent[indexToReplace] = parsedChunk;
                        } else {
                          // Fallback: If no preview was found (which is unlikely),
                          // add the final image to ensure it's not lost.
                          newContent.push(parsedChunk);
                        }
                      } else {
                        // Fallback for a final image that somehow has no generationId.
                        newContent.push(parsedChunk);
                      }
                      break;
                    }

                    default:
                      // For all other non-streaming block types (e.g., 'error', 'tool_use'),
                      // simply add them to the content array.
                      newContent.push(parsedChunk);
                      break;
                  }
                  // --- END: New stream processing logic ---
                } catch (e) {
                  log.warn(`Could not parse stream chunk: ${part}, ${e}`);
                }
              }
              // Return a new state object with the updated content
              return prevResponse
                ? { ...prevResponse, content: newContent }
                : { role: "assistant", content: newContent };
            });
          }
        }
      }
    } catch (error) {
      setShowConversationSpinner(false); // <-- ADD THIS LINE
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
      const errorResponse: ChatResponse = {
        role: "assistant",
        content: [
          {
            type: "error",
            publicMessage: errorMessage,
            privateMessage: errorMessage,
          },
        ],
      };
      setResponseHistory((prev) => [...prev, errorResponse]);
    } finally {
      setShowConversationSpinner(false); // <-- ADD THIS LINE
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // When submission finishes, finalize the state.
    if (!isSubmitting && streamingResponse && isStreamComplete) {
      // Clean up the streaming response to remove duplicate images
      const cleanedStreamingResponse: ChatResponse = {
        ...streamingResponse,
        content: deduplicateImageBlocks(streamingResponse.content),
      };
      // Combine the history with the fully streamed response
      const finalHistory = [...responseHistory, cleanedStreamingResponse];
      setResponseHistory(finalHistory);

      // Update the currentChat state for context in the next turn
      setCurrentChat((prev) => ({
        ...(prev as LocalChat),
        responseHistory: finalHistory,
      }));

      // Clear the temporary streaming display object
      setStreamingResponse(null);
      setIsStreamComplete(false);
      refreshCreditBalance();
    }
  }, [isSubmitting, isStreamComplete, streamingResponse, responseHistory]);

  // New handleReset function
  const handleReset = () => {
    setResponseHistory([]);
    setCurrentChat(undefined);
    setLastAssistantImage({ url: null, generationId: null });
    setPreviousResponseId(undefined);
    setUseWebSearch(false);
    setUseImageGeneration(false);
    // You may want to reset other state here as well
  };

  function populateHistory(history: ConversationHistory) {
    log.info("Populating chat from history", { historyId: history.id });
    const chat: ChatUserSession = JSON.parse(history.conversation);
    updateMessage(chat);
    setCurrentChat(chat);
    toggleHistory();
  }

  function toggleHistory() {
    log.info("Toggling history panel");
    setIsHistoryShowing((isHistoryShowing) => !isHistoryShowing);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserID();
        const historyData = await getHistory(userId ?? 0);
        if (historyData) {
          setHistory(historyData);
        }
      } catch (error) {
        log.error("Error fetching history", { error: String(error) });
      }
    };
    fetchData();
  }, [isHistoryShowing]);

  useEffect(() => {
    refreshCreditBalance();
    // Depend only on user.id to refetch when the user changes
  }, [user?.id]);

  const disableSelection = responseHistory.length > 0;

  const modelChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    log.info("Model changed", { newModelId: target.value });
    updateSelectedModel(target.value);
  };

  const personaChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    log.info("Persona changed", { newPersonaId: target.value });
    updateSelectedPersona(target.value);
  };

  const outputFormatChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    log.info("Output format changed", { newOutputFormatId: target.value });
    updateSelectedOutputFormat(target.value);
  };

  const mcpToolChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    log.info("MCP tool changed", { newMCPToolId: target.value });
    updateSelectedMCPTool(target.value);
  };

  const isInputDisabled =
    currentCreditBalance <= 0 && !user.hasUnlimitedCredits;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {" "}
      {/* Use dynamic viewport height */}
      <form className="flex flex-col h-full">
        {/* Hidden input fields for required data */}
        <input
          type="hidden"
          name="model"
          value={
            selectedModel || (models.length > 0 ? models[0].id.toString() : "")
          }
        />
        <input
          type="hidden"
          name="persona"
          value={
            selectedPersona ||
            (personas.length > 0 ? personas[0].id.toString() : "")
          }
        />
        <input
          type="hidden"
          name="outputFormat"
          value={
            selectedOutputFormat ||
            (outputFormats.length > 0 ? outputFormats[0].id.toString() : "")
          }
        />
        {maxTokens !== null && (
          <input type="hidden" name="maxTokens" value={maxTokens} />
        )}
        {budgetTokens !== null && (
          <input type="hidden" name="budgetTokens" value={budgetTokens} />
        )}
        <input type="hidden" name="mcpTool" value={selectedMCPTool || "0"} />
        <input type="hidden" name="useWebSearch" value={String(useWebSearch)} />
        <input
          type="hidden"
          name="useImageGeneration"
          value={String(useImageGeneration)}
        />
        <div className="flex-none flex items-center justify-between bg-gradient-to-r from-white to-slate-100 border-b border-slate-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 shadow-sm px-3 py-1.5 lg:px-6 lg:py-2">
          {/* Logo section - Consistent padding */}
          <div className="flex items-center">
            {/* Dark mode: Swap logo */}
            <img
              src="/snowgoose-logo-spring-2025-black-transparent.png"
              alt="Snowgoose Logo"
              className="w-12 object-fit transition-all hover:opacity-90 dark:hidden" // Hide black logo in dark mode
            />
            <img
              src="/snowgoose-logo-spring-2025-white-transparent.png"
              alt="Snowgoose Logo"
              className="w-12 object-fit transition-all hover:opacity-90 hidden dark:block" // Show white logo in dark mode
            />
          </div>
          <span className="hidden lg:block lg:pl-1">Snowgoose</span>
          <span className="lg:hidden">{getModelName()}</span>
          {/* --- Mobile Only Controls Trigger --- */}
          <div className="lg:hidden">
            {" "}
            {/* Visible only on mobile */}
            <Popover className="relative">
              {(
                { open, close } // Destructure the 'close' function from Popover render prop
              ) => (
                <>
                  <Popover.Button className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors">
                    <MaterialSymbol icon="tune" size={24} />
                  </Popover.Button>
                  {/* --- Mobile Popover Panel --- */}
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    {/* Removed max-w-sm, Increased z-index significantly */}
                    <Popover.Panel className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none max-h-[80dvh] flex flex-col">
                      {/* Container for both OptionsBar and MoreOptions */}
                      <div className="p-3 space-y-3 overflow-y-auto flex-grow">
                        {/* Render OptionsBar inside mobile popover */}
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1">
                            Chat Options
                          </h3>
                          {/* Pass isMobileLayout={true} and ensure all props are correct */}
                          <OptionsBar
                            isMobileLayout={true} // Add this prop
                            models={models}
                            personas={[
                              ...(userPersonas || []),
                              ...(globalPersonas || []),
                            ]}
                            userPersonas={userPersonas || []}
                            globalPersonas={globalPersonas || []}
                            outputFormats={outputFormats}
                            currentModel={
                              parseInt(selectedModel || "") || undefined
                            } // Convert string to number
                            currentPersona={
                              parseInt(selectedPersona || "") || undefined
                            } // Convert string to number
                            currentOutputFormat={selectedOutputFormat} // Pass string state variable
                            disableSelection={disableSelection}
                            onModelChange={modelChange}
                            onPersonaChange={personaChange}
                            onOutputFormatChange={outputFormatChange}
                            showMoreOptions={false} // Explicitly false
                            toggleMoreOptions={() => {}} // No-op function
                            hideOutputFormats={hideOutputFormats}
                            user={user} // Pass user object
                          />
                        </div>
                        {/* Render MoreOptions inside mobile popover */}
                        {/* Ensure visibility props (show...) are passed correctly */}
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                            Advanced Options
                          </h3>
                          <MoreOptions
                            outputFormats={outputFormats}
                            mcpTools={mcpTools}
                            // Pass the state variable from the hook directly
                            currentOutputFormat={selectedOutputFormat}
                            // Pass the state variable from the hook directly
                            currentMCPTool={selectedMCPTool}
                            disableSelection={disableSelection}
                            showFileUpload={showFileUpload} // Pass hook result
                            showMCPTools={showMCPTools} // Pass hook result
                            showTokenSliders={showTokenSliders} // Pass hook result
                            selectedPreset={selectedPreset}
                            thinkingPresets={thinkingPresets}
                            onPresetChange={updatePreset}
                            maxTokens={maxTokens}
                            budgetTokens={budgetTokens}
                            hideOutputFormats={hideOutputFormats}
                            onOutputFormatChange={outputFormatChange}
                            onMCPToolChange={mcpToolChange}
                            showImageOptions={shouldShowImageOptions} // Pass the conditional flag here
                            showWebSearch={showWebSearchToggle}
                            useWebSearch={useWebSearch}
                            onWebSearchChange={toggleWebSearch}
                            showImageGeneration={showImageGenerationToggle}
                            useImageGeneration={useImageGeneration}
                            onImageGenerationChange={toggleImageGeneration}
                          />
                        </div>
                        {/* Section for Utility Icons */}
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                            Actions & Info
                          </h3>
                          {/* Render UtilityIconRow inside mobile popover */}
                          {/* Pass the 'close' function from Popover */}
                          <UtilityIconRow
                            resetChat={handleReset}
                            toggleHistory={toggleHistory}
                            user={user}
                            chat={currentChat}
                            closePopover={close}
                          />
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
          {/* --- Desktop Only Controls --- */}
          {/* Use justify-between and w-full to space out left/right groups */}
          <div className="hidden lg:flex items-center justify-between w-full ml-4">
            {" "}
            {/* Added ml-4 for spacing from logo */}
            {/* Left side: Options + More Options */}
            <div className="flex items-center gap-x-2">
              <OptionsBar /* Original OptionsBar for desktop */
                models={models}
                personas={[...(userPersonas || []), ...(globalPersonas || [])]}
                userPersonas={userPersonas || []}
                globalPersonas={globalPersonas || []}
                outputFormats={outputFormats}
                currentModel={parseInt(selectedModel || "") || undefined} // Use hook state
                currentPersona={parseInt(selectedPersona || "") || undefined} // Use hook state
                currentOutputFormat={selectedOutputFormat} // Use hook state
                disableSelection={disableSelection}
                onModelChange={modelChange}
                onPersonaChange={personaChange}
                onOutputFormatChange={outputFormatChange}
                showMoreOptions={showMoreOptions}
                toggleMoreOptions={toggleMoreOptions}
                hideOutputFormats={hideOutputFormats}
                user={user} // Pass user object
              />
              {/* More Options Popover */}
              <Popover className="relative ml-1">
                {({ open }) => (
                  <>
                    {/* Dark mode: Adjust button colors */}
                    <Popover.Button className="py-0.5 px-2.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors">
                      <MaterialSymbol
                        className="mt-1.5"
                        icon="tune"
                        size={22}
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      {/* Dark mode: Adjust panel colors */}
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                        <div className="p-4">
                          <MoreOptions
                            outputFormats={outputFormats}
                            mcpTools={mcpTools}
                            // Pass the state variable from the hook directly
                            currentOutputFormat={selectedOutputFormat}
                            // Pass the state variable from the hook directly
                            currentMCPTool={selectedMCPTool}
                            disableSelection={disableSelection}
                            showFileUpload={showFileUpload}
                            showMCPTools={showMCPTools}
                            showTokenSliders={showTokenSliders}
                            selectedPreset={selectedPreset}
                            thinkingPresets={thinkingPresets}
                            onPresetChange={updatePreset}
                            maxTokens={maxTokens}
                            budgetTokens={budgetTokens}
                            hideOutputFormats={hideOutputFormats}
                            onOutputFormatChange={outputFormatChange}
                            onMCPToolChange={mcpToolChange}
                            showImageOptions={shouldShowImageOptions} // Pass the conditional flag here too
                            showWebSearch={showWebSearchToggle}
                            useWebSearch={useWebSearch}
                            onWebSearchChange={toggleWebSearch}
                            showImageGeneration={showImageGenerationToggle}
                            useImageGeneration={useImageGeneration}
                            onImageGenerationChange={toggleImageGeneration}
                          />
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
            {/* Right side: Credits + Utility Icons */}
            {/* No ml-auto needed here, parent justify-between handles it */}
            <div className="flex items-center gap-x-3">
              {/* Subtle Credits Display */}

              <CreditsDisplay creditBalance={currentCreditBalance} />

              <UtilityIconRow
                resetChat={handleReset}
                toggleHistory={toggleHistory}
                chat={currentChat}
                user={user}
              />
            </div>{" "}
            {/* End of Credits + Utility Icons container */}
          </div>{" "}
          {/* End of Desktop Only Controls wrapper */}
        </div>{" "}
        {/* End of Top Bar Flex Container */}
        {/* Conversation area & Text Input Container */}
        {/* Use flex-grow and min-h-0 to manage height correctly */}
        <div className="flex flex-col flex-grow overflow-hidden min-h-0">
          {/* Welcome Message - Centered using flex-1 only when shown */}
          {responseHistory.length === 0 && !showConversationSpinner && (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-4 transition-opacity duration-300 ease-out">
              <h1 className="text-3xl text-slate-600 dark:text-slate-300 font-thin">
                Welcome to{" "}
                <span className="font-extrabold text-slate-500 dark:text-slate-400">
                  Snowgoose
                </span>
              </h1>
            </div>
          )}

          {/* Conversation Area - Always takes available space (flex-1) when active and scrolls */}
          {/* Conditionally apply flex-1 based on whether welcome message is shown */}
          <div
            className={`max-w-3xl w-full mx-auto overflow-y-auto p-2 lg:p-4 ${responseHistory.length > 0 || showConversationSpinner ? "flex-1" : ""}`}
          >
            <Conversation
              chats={
                streamingResponse
                  ? [...responseHistory, streamingResponse]
                  : responseHistory
              }
              showSpinner={showConversationSpinner}
              imageURL={imageURL}
              renderTypeName={renderTypeName}
            />
          </div>

          {/* Text input area container - Always at the bottom, never shrinks */}
          <div className="flex-shrink-0 max-w-3xl mx-auto w-full pb-2 px-2 lg:px-0">
            {/* New Subtle Free Tier Notice */}
            {user &&
              user.stripeCustomerId === null &&
              user.hasUnlimitedCredits !== true && (
                <div
                  className="mb-2 text-center text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg py-2 px-4"
                  role="status"
                >
                  <span>You&apos;re on the Free Plan. </span>
                  <Link
                    href="/pricing"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline focus:underline focus:outline-none"
                  >
                    Upgrade
                  </Link>
                  <span> for more features.</span>
                </div>
              )}

            {/* Usage Limit Warning - Use the new logic */}
            {isInputDisabled && (
              <div className="mb-2 p-3 text-center text-sm text-red-700 bg-red-100 border border-red-300 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <span>
                  You have run out of credits. Please purchase more to continue.
                </span>
                <BuyCreditsButton variant="danger" size="sm">
                  Buy Credits
                </BuyCreditsButton>
              </div>
            )}
            <TextInputArea
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              disabled={isInputDisabled} // Pass local disabled state
              onReset={handleReset}
              showFileUpload={showFileUpload}
            />
          </div>
        </div>{" "}
        {/* Closes the main content flex container */}
      </form>
      <Transition
        as={Fragment}
        show={isHistoryShowing}
        enter="transform transition ease-in-out duration-500"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        {/* --- History Panel --- */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-96 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 overflow-y-auto z-30 shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-3 flex-shrink-0">
            <h1 className="text-lg font-medium text-slate-700 dark:text-slate-200">
              History
            </h1>
            <button
              onClick={toggleHistory}
              className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close history panel"
            >
              <MaterialSymbol icon="close" size={20} />
            </button>
          </div>
          {/* History List Area: Takes remaining space and scrolls */}
          <div className="flex-grow overflow-y-auto -mr-2 pr-2">
            {" "}
            {/* Negative margin + padding trick for scrollbar */}
            {history.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
                No history yet.
              </p>
            )}
            {history.map((h: ConversationHistory) => (
              <div
                key={h.id}
                className="mt-1 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <button
                  className="w-full text-left text-sm text-slate-700 dark:text-slate-300 p-2 truncate rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  onClick={(e) => {
                    e.preventDefault(); // Corrected: Added parentheses to call the function
                    populateHistory(h);
                  }}
                >
                  {h.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Transition>
    </div>
  );
}
