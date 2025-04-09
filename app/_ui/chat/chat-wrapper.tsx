"use client";

import Conversation from "./conversation";
import OptionsBar from "./options-bar";
import MoreOptions from "./more-options";
import TextInputArea from "./text-input-area";
import React, { useState, useEffect, Fragment } from "react";
import { useModelState } from "./hooks/useModelState";
import { useThinkingState } from "./hooks/useThinkingState";
import { useFormSubmission } from "./hooks/useFormSubmission";
import { Popover, Transition } from "@headlessui/react";
import {
  LocalChat,
  ChatResponse,
  ChatUserSession,
  ChatWrapperProps,
  UserUsageLimits,
} from "../../_lib/model";
import UtilityIconRow from "./utility-icon-row";
import { getHistory } from "../../_lib/server_actions/history.actions";
import { ConversationHistory, User } from "@prisma/client"; // Import User type if needed, or adjust based on actual user prop type
import { MaterialSymbol } from "react-material-symbols";
import "react-material-symbols/outlined";
import { getUserID } from "@/app/_lib/auth";
import { usePersonaState } from "./hooks/usePersonaState";
import { useOutputFormatState } from "./hooks/useOutputFormatState";
import { useMCPToolState } from "./hooks/useMCPToolState";
// Import the server action instead of the repository
import { getUserUsageLimitsAction } from "@/app/_lib/server_actions/user.actions";

export default function ChatWrapper({
  userPersonas,
  globalPersonas,
  models,
  outputFormats,
  mcpTools,
  apiVendors,
  user,
  // Destructure new usage limit props
  periodUsage,
  usageLimit,
  isOverLimit: initialIsOverLimit = false, // Rename prop for clarity, default false
}: ChatWrapperProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const toggleMoreOptions = () => setShowMoreOptions(!showMoreOptions);
  const [response, setResponse] = useState<ChatResponse[]>([]);
  // Local state to manage the over-limit status immediately
  const [localIsOverLimit, setLocalIsOverLimit] = useState(initialIsOverLimit);
  const [currentChat, setCurrentChat] = useState<LocalChat | undefined>();
  const [isHistoryShowing, setIsHistoryShowing] = useState(false);
  const [showConversationSpinner, setShowConversationSpinner] =
    useState<boolean>(false);
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [renderTypeName, setRenderTypeName] = useState("");
  const [hidePersonas] = useState(false);
  const [hideOutputFormats] = useState(false);
  const personas = [...(userPersonas || []), ...(globalPersonas || [])];
  const [userUsageLimits, setUserUsageLimits] = useState<UserUsageLimits>({
    userPeriodUsage: 0.0,
    planUsageLimit: 0.0,
  });

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

  // Define fetchUsageLimits function (moved earlier for updateMessage)
  const fetchUsageLimits = async () => {
    if (!user?.id) return; // Guard clause

    try {
      const fetchedUsageLimits = await getUserUsageLimitsAction(user.id);
      if (fetchedUsageLimits) {
        console.log(
          `Fetched Limits via Action - Plan: ${fetchedUsageLimits.planUsageLimit}, Usage: ${fetchedUsageLimits.userPeriodUsage}`
        );
        setUserUsageLimits(fetchedUsageLimits);
      } else {
        console.error(
          "Failed to fetch usage limits via server action (returned null)."
        );
        setUserUsageLimits({ userPeriodUsage: 0.0, planUsageLimit: 0.0 });
      }
    } catch (error) {
      console.error("Error calling getUserUsageLimitsAction:", error);
      setUserUsageLimits({ userPeriodUsage: 0.0, planUsageLimit: 0.0 });
    }
  };

  // Define updateMessage before useFormSubmission
  const updateMessage = (chat: LocalChat | undefined) => {
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
    // Fetch updated usage limits after processing the message
    fetchUsageLimits();
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
    // Define the callback function
    onUsageLimitError: () => {
      setLocalIsOverLimit(true); // Set local state immediately on error
    },
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
        console.error("Error fetching history", error);
      }
    };
    fetchData();
  }, [isHistoryShowing]);

  // useEffect to fetch usage limits using the server action
  useEffect(() => {
    if (!user?.id) {
      // Don't fetch if user ID isn't available
      return;
    }

    const fetchUsage = async () => {
      try {
        // Call the server action
        const fetchedUsageLimits = await getUserUsageLimitsAction(user.id);

        if (fetchedUsageLimits) {
          console.log(
            `Fetched Limits via Action - Plan: ${fetchedUsageLimits.planUsageLimit}, Usage: ${fetchedUsageLimits.userPeriodUsage}`
          );
          setUserUsageLimits(fetchedUsageLimits);
        } else {
          // Handle the case where the action returns null (e.g., error on server)
          console.error(
            "Failed to fetch usage limits via server action (returned null)."
          );
          // Optionally set state to reflect error or default values
          setUserUsageLimits({ userPeriodUsage: 0.0, planUsageLimit: 0.0 });
        }
      } catch (error) {
        // Catch errors specifically from the action call itself (network issues, etc.)
        // Server-side errors within the action are handled there and return null here.
        console.error("Error calling getUserUsageLimitsAction:", error);
        setUserUsageLimits({ userPeriodUsage: 0.0, planUsageLimit: 0.0 }); // Reset or set error state
      }
    };

    fetchUsage();
    // Depend only on user.id to refetch when the user changes
  }, [user?.id]); // Keep existing dependency

  // useEffect to fetch usage limits on initial load or user change
  // Note: fetchUsageLimits is now defined earlier
  useEffect(() => {
    fetchUsageLimits();
    // Depend only on user.id to refetch when the user changes
  }, [user?.id]);

  const disableSelection = response.length > 0;

  const modelChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    updateSelectedModel(target.value);
  };

  const personaChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    updateSelectedPersona(target.value);
  };

  const outputFormatChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    updateSelectedOutputFormat(target.value);
  };

  const mcpToolChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    updateSelectedMCPTool(target.value);
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
        {/* Enhanced top bar */}
        <div className="flex-none sm:flex items-center bg-gradient-to-r from-white to-slate-100 border-b shadow-sm">
          {/* Logo section with improved styling */}
          <div className="pl-5 pr-2 py-3 flex items-center">
            <img
              src="/snowgoose-logo.png"
              alt="Snowgoose Logo"
              className="h-10 w-auto transition-all hover:opacity-90"
            />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex-none sm:flex items-center sm:justify-between">
              {/* Options Bar */}
              <div className="flex flex-row items-center">
                <OptionsBar
                  models={models}
                  personas={[
                    ...(userPersonas || []),
                    ...(globalPersonas || []),
                  ]}
                  userPersonas={userPersonas || []}
                  globalPersonas={globalPersonas || []}
                  outputFormats={outputFormats}
                  currentModel={currentChat?.modelId}
                  currentPersona={currentChat?.personaId}
                  currentOutputFormat={currentChat?.outputFormatId}
                  disableSelection={disableSelection}
                  onModelChange={modelChange}
                  onPersonaChange={personaChange}
                  onOutputFormatChange={outputFormatChange}
                  showMoreOptions={showMoreOptions}
                  toggleMoreOptions={toggleMoreOptions}
                  hideOutputFormats={hideOutputFormats}
                />

                {/* More Options Popover */}
                <Popover className="relative ml-3">
                  {({ open }) => (
                    <>
                      <Popover.Button className="py-1 px-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 focus:outline-none transition-colors">
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
                        <Popover.Panel className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="p-4">
                            <MoreOptions
                              outputFormats={outputFormats}
                              mcpTools={mcpTools}
                              currentOutputFormat={currentChat?.outputFormatId}
                              currentMCPTool={currentChat?.mcpToolId}
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
              {/* Credits Display & Utility icons */}
              <div className="flex items-center">
                {/* Subtle Credits Display */}
                {userUsageLimits != null && (
                  <div className="flex items-center mr-2 group relative">
                    <div className="flex items-center px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
                      <MaterialSymbol
                        icon="electric_bolt"
                        size={14}
                        className="text-slate-400 mr-1"
                      />
                      <span className="text-xs font-medium text-slate-400">
                        {Math.max(
                          0,
                          Math.round(
                            (userUsageLimits.planUsageLimit -
                              userUsageLimits.userPeriodUsage) *
                              100
                          )
                        )}
                      </span>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-auto hidden group-hover:block">
                      <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        Available credits
                      </div>
                    </div>
                  </div>
                )}
                <UtilityIconRow
                  resetChat={resetChat}
                  toggleHistory={toggleHistory}
                  chat={currentChat}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conversation area - fills space and scrolls internally */}
        <div className="flex-grow flex overflow-hidden">
          <div className="max-w-3xl w-full mx-auto overflow-y-auto p-4 rounded-2xl bg-white m-3 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] border flex-1">
            <Conversation
              chats={response}
              showSpinner={showConversationSpinner}
              imageURL={imageURL}
              renderTypeName={renderTypeName}
            />
          </div>
        </div>

        {/* Text input area - at bottom */}
        <div className="max-w-3xl mx-auto w-full pb-2 px-2">
          {/* Usage Limit Warning - Use local state */}
          {localIsOverLimit && usageLimit && usageLimit > 0 && (
            <div className="mb-2 p-2 text-center text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              You have reached your usage limit ({periodUsage?.toFixed(2) ?? 0}{" "}
              / {usageLimit.toFixed(2)}) for the current billing period. Please
              upgrade your plan or wait for the next cycle to continue.
            </div>
          )}
          <TextInputArea
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            disabled={localIsOverLimit} // Pass local disabled state
            onReset={handleReset}
            showFileUpload={showFileUpload}
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
