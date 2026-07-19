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
import { ConversationHistory, User } from "@prisma/client";
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
  for (const block of content) {
    if (block.type === "image" && block.generationId) {
      imageMap.set(block.generationId, block);
    } else if (block.type === "image_data" && block.id) {
      if (!imageMap.has(block.id)) {
        imageMap.set(block.id, block);
      }
    }
  }
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
  systemDefaultModelId,
}: ChatWrapperProps) {
  const log = useLogger().with({ userId: user.id });
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const toggleMoreOptions = () => setShowMoreOptions(!showMoreOptions);
  const [responseHistory, setResponseHistory] = useState<ChatResponse[]>([]);
  const [streamingResponse, setStreamingResponse] =
    useState<ChatResponse | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useImageGeneration, setUseImageGeneration] = useState(false);
  const toggleWebSearch = () => setUseWebSearch((prev) => !prev);
  const toggleImageGeneration = () => setUseImageGeneration((prev) => !prev);
  // OpenAI reasoning-model-only options (gpt-5+ verbosity, gpt-5.6 pro mode)
  const [verbosity, setVerbosity] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [reasoningMode, setReasoningMode] = useState<"standard" | "pro">(
    "standard"
  );
  const toggleReasoningMode = () =>
    setReasoningMode((prev) => (prev === "pro" ? "standard" : "pro"));
  const [currentCreditBalance, setCurrentCreditBalance] =
    useState(creditBalance);
  const [currentChat, setCurrentChat] = useState<LocalChat | undefined>();
  const [isHistoryShowing, setIsHistoryShowing] = useState(false);
  const [showConversationSpinner, setShowConversationSpinner] =
    useState<boolean>(false);
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [renderTypeName, setRenderTypeName] = useState("");
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

  const {
    selectedModel,
    selectedModelVendor,
    showFileUpload,
    showMCPTools,
    showTokenSliders,
    showWebSearchToggle,
    showImageGenerationToggle,
    showOpenAIReasoningOptions,
    updateSelectedModel,
  } = useModelState({
    models,
    apiVendors,
    initialModelId: currentChat?.modelId,
    systemDefaultModelId,
  });

  const shouldShowImageOptions =
    showImageGenerationToggle && useImageGeneration;

  // Reset verbosity/pro-mode to defaults if the selected model changed to
  // one that isn't an OpenAI reasoning model (options would otherwise be
  // silently stale on the next request).
  useEffect(() => {
    if (!showOpenAIReasoningOptions) {
      setVerbosity("medium");
      setReasoningMode("standard");
    }
  }, [showOpenAIReasoningOptions]);

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
    effort,
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
          const imageBlock = lastMessage.content.find(
            (block): block is ImageBlock => block.type === "image"
          );
          if (imageBlock) {
            lastImageUrl = imageBlock.url;
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
    setLastImageGenerationId(lastImageId);
  };

  const updateShowSpinner = (showSpinner: boolean) => {
    setShowConversationSpinner(showSpinner);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setShowConversationSpinner(true);
    setStreamingResponse(null);
    setIsStreamComplete(false);

    const prompt = formData.get("prompt") as string;
    const imageFile = formData.get("image") as File | null;
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
      visionUrlForDisplay = lastAssistantImage.url;
    }

    const userMessageContent: ContentBlock[] = [{ type: "text", text: prompt }];

    if (visionUrlForDisplay && !imageToEditId) {
      userMessageContent.push({ type: "image", url: visionUrlForDisplay });
    }

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
    setLastAssistantImage({ url: null, generationId: null });
    const updatedHistory = [...responseHistory, userMessage];
    setResponseHistory(updatedHistory);
    const chatPayload: LocalChat = {
      responseHistory: updatedHistory,
      modelId: parseInt(selectedModel),
      personaId: parseInt(selectedPersona),
      outputFormatId: selectedOutputFormat || 0,
      renderTypeName: renderTypeName,
      mcpToolId: selectedMCPTool,
      prompt: prompt,
      maxTokens: maxTokens,
      budgetTokens: budgetTokens,
      effort: effort,
      systemPrompt:
        (personas.find((p) => p.id === parseInt(selectedPersona))?.prompt ||
          "") +
        " " +
        (outputFormats.find((o) => o.id === selectedOutputFormat)?.prompt ||
          ""),
      visionUrl: null,
      imageData: base64ImageData,
      useImageGeneration,
      useWebSearch,
      verbosity: showOpenAIReasoningOptions ? verbosity : undefined,
      reasoningMode: showOpenAIReasoningOptions ? reasoningMode : undefined,
      previousResponseId: previousResponseId,
      model: models.find((m) => m.id === parseInt(selectedModel))?.name || "",
      imageURL: imageURL,
    };

    setCurrentChat(chatPayload);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload),
      });

      setShowConversationSpinner(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.publicMessage || `Error: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const finalContent: ContentBlock[] = await response.json();
        const finalResponse: ChatResponse = {
          role: "assistant",
          content: finalContent,
        };
        setResponseHistory((prev) => [...prev, finalResponse]);
      } else {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to get response reader");
        const decoder = new TextDecoder();

        setStreamingResponse({ role: "assistant", content: [] });
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          if (parts.length > 0) {
            setStreamingResponse((prevResponse) => {
              if (!prevResponse) return { role: "assistant", content: [] };

              const newContent: ContentBlock[] = JSON.parse(
                JSON.stringify(prevResponse.content)
              );

              for (const part of parts) {
                if (part.trim() === "") continue;
                try {
                  const parsedChunk = JSON.parse(part);

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
                      console.log(
                        "Received MetaBlock with responseId:",
                        parsedChunk.responseId
                      );
                      setPreviousResponseId(parsedChunk.responseId);
                      continue;
                    case "text":
                      if (lastBlock && lastBlock.type === "text") {
                        lastBlock.text += parsedChunk.text;
                      } else {
                        newContent.push(parsedChunk);
                      }
                      break;
                    case "thinking":
                      if (lastBlock && lastBlock.type === "thinking") {
                        lastBlock.thinking += parsedChunk.thinking;
                        if (parsedChunk.signature) {
                          if (!lastBlock.signature) lastBlock.signature = "";
                          lastBlock.signature += parsedChunk.signature;
                        }
                      } else {
                        newContent.push(parsedChunk);
                      }
                      break;
                    case "image_data": {
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
                        const lastImageDataIndex = newContent
                          .map((b) => b.type)
                          .lastIndexOf("image_data");
                        if (lastImageDataIndex !== -1) {
                          newContent[lastImageDataIndex] = parsedChunk;
                        } else {
                          newContent.push(parsedChunk);
                        }
                      }
                      break;
                    }
                    case "image": {
                      console.log("Received FINAL image block:", {
                        generationId: parsedChunk.generationId,
                        url: parsedChunk.url,
                      });
                      const generationId = parsedChunk.generationId;
                      if (generationId) {
                        const indexToReplace = newContent.findIndex(
                          (b) =>
                            b.type === "image_data" && b.id === generationId
                        );
                        if (indexToReplace !== -1) {
                          newContent[indexToReplace] = parsedChunk;
                        } else {
                          newContent.push(parsedChunk);
                        }
                      } else {
                        newContent.push(parsedChunk);
                      }
                      break;
                    }
                    default:
                      newContent.push(parsedChunk);
                      break;
                  }
                } catch (e) {
                  log.warn(`Could not parse stream chunk: ${part}, ${e}`);
                }
              }
              return prevResponse
                ? { ...prevResponse, content: newContent }
                : { role: "assistant", content: newContent };
            });
          }
        }
      }
    } catch (error) {
      setShowConversationSpinner(false);
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
      setShowConversationSpinner(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSubmitting && streamingResponse && isStreamComplete) {
      const cleanedStreamingResponse: ChatResponse = {
        ...streamingResponse,
        content: deduplicateImageBlocks(streamingResponse.content),
      };
      const finalHistory = [...responseHistory, cleanedStreamingResponse];
      setResponseHistory(finalHistory);
      setCurrentChat((prev) => ({
        ...(prev as LocalChat),
        responseHistory: finalHistory,
      }));
      setStreamingResponse(null);
      setIsStreamComplete(false);
      refreshCreditBalance();
    }
  }, [isSubmitting, isStreamComplete, streamingResponse, responseHistory]);

  const handleReset = () => {
    setResponseHistory([]);
    setCurrentChat(undefined);
    setLastAssistantImage({ url: null, generationId: null });
    setPreviousResponseId(undefined);
    setUseWebSearch(false);
    setUseImageGeneration(false);
    setVerbosity("medium");
    setReasoningMode("standard");
  };

  function populateHistory(history: ConversationHistory) {
    log.info("Populating chat from history", { historyId: history.id });
    const chat: ChatUserSession = JSON.parse(history.conversation);
    updateMessage(chat);
    setCurrentChat(chat);
    setUseWebSearch(chat.useWebSearch ?? false);
    setUseImageGeneration(chat.useImageGeneration ?? false);
    setVerbosity(chat.verbosity ?? "medium");
    setReasoningMode(chat.reasoningMode ?? "standard");
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
  }, [user?.id]);

  const disableModelSelection = isSubmitting;
  // Fix: Disable persona if submitting OR if conversation has started (history > 0)
  const disablePersonaSelection = isSubmitting || responseHistory.length > 0;
  const disableOtherSelection = isSubmitting;

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
      <form className="flex flex-col h-full">
        <input
          type="hidden"
          name="model"
          value={
            selectedModel ||
            systemDefaultModelId?.toString() ||
            (models.length > 0 ? models[0].id.toString() : "")
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
          <div className="flex items-center">
            <img
              src="/snowgoose-logo-spring-2025-black-transparent.png"
              alt="Snowgoose Logo"
              className="w-12 object-fit transition-all hover:opacity-90 dark:hidden"
            />
            <img
              src="/snowgoose-logo-spring-2025-white-transparent.png"
              alt="Snowgoose Logo"
              className="w-12 object-fit transition-all hover:opacity-90 hidden dark:block"
            />
          </div>
          <span className="hidden lg:block lg:pl-1">Snowgoose</span>
          <span className="lg:hidden">{getModelName()}</span>
          <div className="lg:hidden">
            <Popover className="relative">
              {({ open, close }) => (
                <>
                  <Popover.Button className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors">
                    <MaterialSymbol icon="tune" size={24} />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none max-h-[80dvh] flex flex-col">
                      <div className="p-3 space-y-3 overflow-y-auto flex-grow">
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1">
                            Chat Options
                          </h3>
                          <OptionsBar
                            isMobileLayout={true}
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
                            }
                            currentPersona={
                              parseInt(selectedPersona || "") || undefined
                            }
                            currentOutputFormat={selectedOutputFormat}
                            disableSelection={disableModelSelection}
                            disableModelSelection={disableModelSelection}
                            disablePersonaSelection={disablePersonaSelection}
                            onModelChange={modelChange}
                            onPersonaChange={personaChange}
                            onOutputFormatChange={outputFormatChange}
                            showMoreOptions={false}
                            toggleMoreOptions={() => {}}
                            hideOutputFormats={hideOutputFormats}
                            user={user}
                          />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                            Advanced Options
                          </h3>
                          <MoreOptions
                            outputFormats={outputFormats}
                            mcpTools={mcpTools}
                            currentOutputFormat={selectedOutputFormat}
                            currentMCPTool={selectedMCPTool}
                            disableSelection={disableOtherSelection}
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
                            showImageOptions={shouldShowImageOptions}
                            showWebSearch={showWebSearchToggle}
                            useWebSearch={useWebSearch}
                            onWebSearchChange={toggleWebSearch}
                            showImageGeneration={showImageGenerationToggle}
                            useImageGeneration={useImageGeneration}
                            onImageGenerationChange={toggleImageGeneration}
                            showOpenAIReasoningOptions={
                              showOpenAIReasoningOptions
                            }
                            verbosity={verbosity}
                            onVerbosityChange={setVerbosity}
                            reasoningMode={reasoningMode}
                            onReasoningModeChange={toggleReasoningMode}
                          />
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                            Actions & Info
                          </h3>
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
          <div className="hidden lg:flex items-center justify-between w-full ml-4">
            <div className="flex items-center gap-x-2">
              <OptionsBar
                models={models}
                personas={[...(userPersonas || []), ...(globalPersonas || [])]}
                userPersonas={userPersonas || []}
                globalPersonas={globalPersonas || []}
                outputFormats={outputFormats}
                currentModel={parseInt(selectedModel || "") || undefined}
                currentPersona={parseInt(selectedPersona || "") || undefined}
                currentOutputFormat={selectedOutputFormat}
                disableSelection={disableModelSelection}
                disableModelSelection={disableModelSelection}
                disablePersonaSelection={disablePersonaSelection}
                onModelChange={modelChange}
                onPersonaChange={personaChange}
                onOutputFormatChange={outputFormatChange}
                showMoreOptions={showMoreOptions}
                toggleMoreOptions={toggleMoreOptions}
                hideOutputFormats={hideOutputFormats}
                user={user}
              />
              {/* More Options Popover */}
              <Popover className="relative ml-1">
                {({ open }) => (
                  <>
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
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                        <div className="p-4">
                          <MoreOptions
                            outputFormats={outputFormats}
                            mcpTools={mcpTools}
                            currentOutputFormat={selectedOutputFormat}
                            currentMCPTool={selectedMCPTool}
                            disableSelection={disableOtherSelection}
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
                            showImageOptions={shouldShowImageOptions}
                            showWebSearch={showWebSearchToggle}
                            useWebSearch={useWebSearch}
                            onWebSearchChange={toggleWebSearch}
                            showImageGeneration={showImageGenerationToggle}
                            useImageGeneration={useImageGeneration}
                            onImageGenerationChange={toggleImageGeneration}
                            showOpenAIReasoningOptions={
                              showOpenAIReasoningOptions
                            }
                            verbosity={verbosity}
                            onVerbosityChange={setVerbosity}
                            reasoningMode={reasoningMode}
                            onReasoningModeChange={toggleReasoningMode}
                          />
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
            <div className="flex items-center gap-x-3">
              <CreditsDisplay creditBalance={currentCreditBalance} />
              <UtilityIconRow
                resetChat={handleReset}
                toggleHistory={toggleHistory}
                chat={currentChat}
                user={user}
              />
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex flex-col flex-grow overflow-hidden min-h-0">
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
          <div className="flex-shrink-0 max-w-3xl mx-auto w-full pb-2 px-2 lg:px-0">
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
              disabled={isInputDisabled}
              onReset={handleReset}
              showFileUpload={showFileUpload}
            />
          </div>
        </div>{" "}
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
          <div className="flex-grow overflow-y-auto -mr-2 pr-2">
            {" "}
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
                    e.preventDefault();
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
