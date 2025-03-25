"use client";

import Conversation from "./conversation";
import OptionsBar from "./chat/options-bar";
import MoreOptions from "./chat/more-options";
import TextInputArea from "./chat/text-input-area";
import { useRouter } from "next/navigation";
import { createChat } from "../_lib/server_actions/chat-actions";
import React, { useState, useEffect, Fragment } from "react";
import { useModelState } from "./chat/hooks/useModelState";
import { useThinkingState } from "./chat/hooks/useThinkingState";
import { useFormSubmission } from "./chat/hooks/useFormSubmission";
import { Popover, Transition } from "@headlessui/react";
import {
  Chat,
  ChatResponse,
  ChatUserSession,
  ChatWrapperProps,
} from "../_lib/model";
import Sidebar from "./sidebar";
import Detail from "./detail";
import UtilityIconRow from "./utility-icon-row";
import { getHistory } from "../_lib/server_actions/history.actions";
import { ConversationHistory } from "@prisma/client";
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { getUserID } from "@/app/_lib/auth";

export default function ChatWrapper({
  userPersonas,
  globalPersonas,
  models,
  outputFormats,
  mcpTools,
  apiVendors,
  user,
}: ChatWrapperProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const toggleMoreOptions = () => setShowMoreOptions(!showMoreOptions);
  const [response, setResponse] = useState<ChatResponse[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | undefined>();
  const [isHistoryShowing, setIsHistoryShowing] = useState(false);
  const [showConversationSpinner, setShowConversationSpinner] =
    useState<boolean>(false);
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [renderTypeName, setRenderTypeName] = useState("");
  const [hidePersonas] = useState(false);
  const [hideOutputFormats] = useState(false);

  // Custom hooks
  const {
    selectedModel,
    selectedModelVendor,
    showFileUpload,
    showMCPTools,
    showTokenSliders,
    updateSelectedModel,
  } = useModelState({
    models,
    apiVendors,
    initialModelId: currentChat?.modelId,
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

  const updateMessage = (chat: Chat | undefined) => {
    if (chat) {
      if (!chat.imageURL) {
        setResponse(chat.responseHistory);
      } else {
        setImageURL(chat.imageURL);
      }
      setCurrentChat(chat);
      setRenderTypeName(`${chat.renderTypeName}`);
    } else {
      setResponse([]);
    }
  };

  const resetChat = () => {
    setResponse([]);
  };

  const updateShowSpinner = (showSpinner: boolean) => {
    setShowConversationSpinner(showSpinner);
  };

  const {
    isSubmitting,
    handleSubmit: submitForm,
    handleReset,
  } = useFormSubmission({
    responseHistory: response,
    updateMessage,
    updateShowSpinner,
  });

  // Custom form submission handler to avoid double submissions
  const handleFormSubmit = async (formData: FormData) => {
    // Prevent double submission by handling it only here
    await submitForm(formData);
  };

  function populateHistory(history: ConversationHistory) {
    const chat: ChatUserSession = JSON.parse(history.conversation);
    updateMessage(chat);
    setCurrentChat(chat);
    toggleHistory();
  }

  function toggleHistory() {
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
        console.log("Error fetching history");
      }
    };
    fetchData();
  }, [isHistoryShowing]);

  const disableSelection = response.length > 0;

  const modelChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    updateSelectedModel(target.value);
  };

  const outputFormatChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    // Handle output format changes
    // In a real implementation, this might update state or trigger other actions
    // Example: updateOutputFormat(target.value);
  };

  const mcpToolChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    // Handle MCP tool changes
    // In a real implementation, this might update state or trigger other actions
    // Example: updateMCPTool(target.value);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
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
          value={currentChat?.personaId || ""}
        />
        <input
          type="hidden"
          name="outputFormat"
          value={currentChat?.outputFormatId || ""}
        />
        {maxTokens !== null && (
          <input type="hidden" name="maxTokens" value={maxTokens} />
        )}
        {budgetTokens !== null && (
          <input type="hidden" name="budgetTokens" value={budgetTokens} />
        )}
        <input
          type="hidden"
          name="mcpTool"
          value={mcpTools?.length > 0 ? mcpTools[0].id : 0}
        />
        {/* Enhanced top bar */}
        <div className="flex items-center bg-gradient-to-r from-white to-slate-100 border-b shadow-sm">
          {/* Logo section with improved styling */}
          <div className="pl-5 pr-2 py-3 flex items-center">
            <img
              src="/snowgoose-logo.png"
              alt="Snowgoose Logo"
              className="h-10 w-auto transition-all hover:opacity-90"
            />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center justify-between">
              {/* Options Bar */}
              <OptionsBar
                models={models}
                personas={[...(userPersonas || []), ...(globalPersonas || [])]}
                userPersonas={userPersonas || []}
                globalPersonas={globalPersonas || []}
                currentModel={currentChat?.modelId}
                currentPersona={currentChat?.personaId}
                disableSelection={disableSelection}
                onModelChange={modelChange}
                showMoreOptions={showMoreOptions}
                toggleMoreOptions={toggleMoreOptions}
              />

              {/* More Options Popover */}
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors">
                      <MaterialSymbol icon="tune" size={22} />
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
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="p-4">
                          <MoreOptions
                            outputFormats={outputFormats}
                            mcpTools={mcpTools}
                            currentOutputFormat={currentChat?.outputFormatId}
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
                          />
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
          </div>
        </div>

        {/* Conversation area - fills space and scrolls internally */}
        <div className="flex-grow flex overflow-hidden">
          <div className="max-w-4xl w-full mx-auto overflow-y-auto p-4 rounded-2xl bg-white m-3 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] border flex-1">
            <Conversation
              chats={response}
              showSpinner={showConversationSpinner}
              imageURL={imageURL}
              renderTypeName={renderTypeName}
            />
          </div>
        </div>

        {/* Text input area - at bottom */}

        <div className="max-w-4xl mx-auto w-full pb-2">
          <TextInputArea
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onReset={handleReset}
          />
        </div>
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
        <div className="absolute right-0 top-0 bottom-0 w-1/2 border-l-2 bg-slate-100 p-6 overflow-y-auto z-20">
          <div className="p-2 border-b-2">
            <button onClick={toggleHistory}>
              <MaterialSymbol
                icon="arrow_right_alt"
                size={24}
                className="text-slate-500"
              />
            </button>
            <h1 className="text-xl">History</h1>
          </div>
          {history.map((h: ConversationHistory) => {
            return (
              <div
                key={h.id}
                className="w-full p-3 text-sm bg-slate-50 mt-3 rounded-md"
              >
                <button
                  className="text-left"
                  onClick={(e) => {
                    e.preventDefault;
                    populateHistory(h);
                  }}
                >
                  {h.title}
                </button>
              </div>
            );
          })}
        </div>
      </Transition>
    </div>
  );
}
