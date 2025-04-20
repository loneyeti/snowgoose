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
import { useLogger } from "next-axiom";

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
  const log = useLogger().with({ userId: user.id });
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

  // Define fetchUsageLimits function (moved earlier for updateMessage)
  const fetchUsageLimits = async () => {
    if (!user?.id) return; // Guard clause

    try {
      const fetchedUsageLimits = await getUserUsageLimitsAction(user.id);
      if (fetchedUsageLimits) {
        setUserUsageLimits(fetchedUsageLimits);
      } else {
        log.error(
          "Failed to fetch usage limits via server action (returned null)."
        );
        setUserUsageLimits({ userPeriodUsage: 0.0, planUsageLimit: 0.0 });
      }
    } catch (error) {
      log.error("Error calling getUserUsageLimitsAction", {
        error: String(error),
      }); // Use structured logging
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
    log.info("Chat reset");
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
    // Define the callback function and add logging
    onUsageLimitError: () => {
      log.warn("Usage limit reached for user.");
      setLocalIsOverLimit(true); // Set local state immediately on error
    },
  });

  // Custom form submission handler to avoid double submissions
  const handleFormSubmit = async (formData: FormData) => {
    log.info("Chat form submitted", {
      model: formData.get("model"),
      persona: formData.get("persona"),
      outputFormat: formData.get("outputFormat"),
      mcpTool: formData.get("mcpTool"),
      maxTokens: formData.get("maxTokens"),
      budgetTokens: formData.get("budgetTokens"),
    });
    // Prevent double submission by handling it only here
    await submitForm(formData);
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
          setUserUsageLimits(fetchedUsageLimits);
        } else {
          // Handle the case where the action returns null (e.g., error on server)
          log.error(
            "Failed to fetch usage limits via server action (returned null)."
          );
          // Optionally set state to reflect error or default values
          setUserUsageLimits({ userPeriodUsage: 0.0, planUsageLimit: 0.0 });
        }
      } catch (error) {
        // Catch errors specifically from the action call itself (network issues, etc.)
        // Server-side errors within the action are handled there and return null here.
        log.error("Error calling getUserUsageLimitsAction", {
          error: String(error),
        });
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
        {/* Enhanced top bar - Minimal mobile header */}
        {/* Dark mode: Adjust background, border */}
        {/* Single row, justify-between. Increased padding on sm+ */}
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
              {({ open }) => (
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
                    <Popover.Panel className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                      {/* Container for both OptionsBar and MoreOptions */}
                      <div className="p-3 space-y-3">
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
                            currentOutputFormat={selectedOutputFormat} // Pass string state variable
                            currentMCPTool={selectedMCPTool} // Pass string state variable
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
                          />
                        </div>
                        {/* Section for Utility Icons */}
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
                            Actions & Info
                          </h3>
                          {/* Render UtilityIconRow inside mobile popover */}
                          {/* Ensure props are passed correctly */}
                          <UtilityIconRow
                            resetChat={resetChat} // Pass resetChat function
                            toggleHistory={toggleHistory} // Pass toggleHistory function
                            user={user} // Pass user object
                            chat={currentChat} // Pass currentChat state
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
              />
              {/* More Options Popover */}
              <Popover className="relative ml-1">
                {({ open }) => (
                  <>
                    {/* Dark mode: Adjust button colors */}
                    <Popover.Button className="py-1 px-2.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors">
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
                          {/* MoreOptions component likely needs internal dark mode styles */}
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
            {/* Right side: Credits + Utility Icons */}
            {/* No ml-auto needed here, parent justify-between handles it */}
            <div className="flex items-center gap-x-3">
              {/* Subtle Credits Display */}
              {userUsageLimits != null && (
                <div className="flex items-center group relative">
                  {/* Dark mode: Adjust credits display colors */}
                  <div className="flex items-center px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-700 dark:border-slate-600 shadow-sm">
                    <MaterialSymbol
                      icon="electric_bolt"
                      size={14}
                      className="text-slate-400 dark:text-slate-500 mr-1"
                    />
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-300">
                      {user.hasUnlimitedCredits
                        ? "unlimited"
                        : Math.max(
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
                  {/* Dark mode: Adjust tooltip colors */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-auto hidden group-hover:block">
                    <div className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs rounded py-1 px-2 whitespace-nowrap">
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
            </div>{" "}
            {/* End of Credits + Utility Icons container */}
          </div>{" "}
          {/* End of Desktop Only Controls wrapper */}
        </div>{" "}
        {/* End of Top Bar Flex Container */}
        {/* Free Tier Upgrade Banner */}
        {user &&
          user.stripePriceId === null &&
          user.hasUnlimitedCredits !== true && (
            // Dark mode: Adjust banner colors
            <div
              className="bg-blue-100 border-t border-b border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100 px-4 py-3 shadow-sm"
              role="alert"
            >
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                <div className="flex items-center">
                  <MaterialSymbol icon="campaign" size={24} className="mr-2" />{" "}
                  {/* Icon color might need dark:text-blue-300 */}
                  <p className="font-medium">
                    You&apos;re currently on the Free Demo Plan.{" "}
                    {/* Escaped apostrophe */}
                  </p>
                  <p className="text-sm ml-2 hidden lg:block">
                    Unlock more usage by subscribing!
                  </p>
                </div>
                {/* Dark mode: Adjust button colors */}
                <a
                  href="/pricing"
                  className="inline-block bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-md text-sm transition-colors duration-150"
                >
                  Subscribe Now
                </a>
              </div>
              <p className="text-sm mt-1 text-center lg:hidden">
                Unlock unlimited features by subscribing!
              </p>{" "}
              {/* Mobile text */}
            </div>
          )}
        {/* Conversation area & Text Input Container */}
        {/* Use flex-grow and min-h-0 to manage height correctly */}
        <div className="flex flex-col flex-grow overflow-hidden min-h-0">
          {/* Welcome Message - Centered using flex-1 only when shown */}
          {response.length === 0 && !showConversationSpinner && (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-4 transition-opacity duration-300 ease-out">
              {/* Dark mode: Adjust welcome text color */}
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
            className={`max-w-3xl w-full mx-auto overflow-y-auto p-2 lg:p-4 ${response.length > 0 || showConversationSpinner ? "flex-1" : ""}`}
          >
            <Conversation
              chats={response}
              showSpinner={showConversationSpinner}
              imageURL={imageURL}
              renderTypeName={renderTypeName}
            />
          </div>

          {/* Text input area container - Always at the bottom, never shrinks */}
          <div className="flex-shrink-0 max-w-3xl mx-auto w-full pb-2 px-2 lg:px-0">
            {/* Usage Limit Warning - Use local state */}
            {localIsOverLimit && usageLimit && usageLimit > 0 && (
              // Dark mode: Adjust warning colors
              <div className="mb-2 p-2 text-center text-sm text-red-700 bg-red-100 border border-red-300 dark:bg-red-900 dark:border-red-700 dark:text-red-200 rounded-md">
                You have reached your usage limit (
                {periodUsage?.toFixed(2) ?? 0} / {usageLimit.toFixed(2)}) for
                the current billing period. Please upgrade your plan or wait for
                the next cycle to continue.
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
        {/* Dark mode: Adjust history panel colors */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 border-l-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-6 overflow-y-auto z-20">
          <div className="p-2 border-b-2 border-slate-200 dark:border-slate-700">
            <button onClick={toggleHistory}>
              <MaterialSymbol
                icon="arrow_right_alt"
                size={24}
                className="text-slate-500 dark:text-slate-400" // Adjust icon color
              />
            </button>
            {/* Dark mode: Adjust history title color */}
            <h1 className="text-xl text-slate-900 dark:text-slate-100">
              History
            </h1>
          </div>
          {history.map((h: ConversationHistory) => {
            return (
              // Dark mode: Adjust history item colors
              <div
                key={h.id}
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-700 mt-3 rounded-md"
              >
                {/* Dark mode: Adjust history button text color */}
                <button
                  className="text-left text-slate-800 dark:text-slate-200"
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
