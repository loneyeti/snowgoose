"use client";

import { Persona, OutputFormat, FormProps, MCPTool } from "../_lib/model";
import { Model } from "@prisma/client";
import SelectBox from "./select-box";
import { createChat } from "../_lib/server_actions/chat-actions";
import React, { useState, useEffect, ChangeEvent } from "react";
import { SpinnerSize } from "./spinner";
import TextInputArea from "./chat/text-input-area";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import OptionsBar from "./chat/options-bar";
import MoreOptions from "./chat/more-options";

interface ThinkingPreset {
  name: string;
  maxTokens: number;
  budgetTokens: number | null;
}

const THINKING_PRESETS: ThinkingPreset[] = [
  { name: "Thinking Off", maxTokens: 8192, budgetTokens: null },
  { name: "Quick Thinking", maxTokens: 8192, budgetTokens: 4096 },
  { name: "Long Thinking", maxTokens: 16384, budgetTokens: 8192 },
];

export default function ChatForm({
  updateMessage,
  updateShowSpinner,
  responseHistory,
  resetChat,
  currentChat,
  personas,
  models,
  outputFormats,
  mcpTools,
  apiVendors,
}: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<FormData | null>(null);
  const router = useRouter();
  const disableSelection = responseHistory.length > 0;
  //const [defaultModel, setDefaultModel] = useState("gpt-4");
  // Initialize with the first model if available
  const [selectedModel, setSelectedModel] = useState<string>(
    models.length > 0 ? String(models[0].id) : ""
  );
  const [selectedModelVendor, setSelectedModelVendor] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [hidePersonas, setHidePersonas] = useState(false);
  const [hideOutputFormats, setHideOutputFormats] = useState(false);
  const [showTokenSliders, setShowTokenSliders] = useState(false);
  const [showMCPTools, setShowMCPTools] = useState(false);
  //const [mcpTools, setMCPTools] = useState<MCPTool[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("Thinking Off");
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [budgetTokens, setBudgetTokens] = useState<number | null>(null);
  const handleReset = () => {
    resetChat();
    router.refresh();
  };

  const handleSubmit = (formData: FormData) => {
    setData(formData);
    setIsSubmitting(true);
  };

  const modelChange = (event: ChangeEvent) => {
    const selectedValue = (event.target as HTMLSelectElement).value;
    setSelectedModel(selectedValue);
  };

  // When the selected model changes, determine which form elements to show.
  useEffect(() => {
    if (selectedModel !== "") {
      // Find the selected model from the models array
      const model = models.find((model) => model.id === Number(selectedModel));

      if (model) {
        // Find the vendor from the existing apiVendors array
        const vendor = apiVendors.find((v) => v.id === model.apiVendorId);

        setSelectedModelVendor(vendor?.name || "");
        setShowMCPTools(vendor?.name === "anthropic");
        setShowFileUpload(!!model.isVision);
        // setHideOutputFormats(!!model.isImageGeneration);
        // setHidePersonas(!!model.isImageGeneration);
        setShowTokenSliders(!!model.isThinking);

        if (model.isThinking) {
          // Set default preset values
          const defaultPreset = THINKING_PRESETS[0]; // Thinking Off
          setSelectedPreset(defaultPreset.name);
          setMaxTokens(defaultPreset.maxTokens);
          setBudgetTokens(defaultPreset.budgetTokens);
        } else {
          setMaxTokens(null);
          setBudgetTokens(null);
        }
      }
    }
  }, [selectedModel, models, apiVendors]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSubmitting || !data) return;
      try {
        updateShowSpinner(true);

        const chat = await createChat(data, responseHistory);
        updateMessage(chat);

        // Set up form for followup
        updateShowSpinner(false);
        setIsSubmitting(false);
      } catch (error) {
        updateShowSpinner(false);
        setIsSubmitting(false);
        alert("Error retrieving data");
        throw error;
      }
    };
    if (isSubmitting === true) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting]);

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const toggleMoreOptions = () => setShowMoreOptions(!showMoreOptions);

  // Set initial model from props if a default hasn't been selected yet
  useEffect(() => {
    if (selectedModel === "" && models.length > 0) {
      setSelectedModel(String(models[0].id));
    }
  }, [models, selectedModel]);

  return (
    <form action={handleSubmit}>
      {/* Hidden input for the selected model */}
      <input type="hidden" name="model" value={selectedModel} />
      <OptionsBar
        models={models}
        personas={personas}
        currentModel={currentChat?.modelId}
        currentPersona={currentChat?.personaId}
        disableSelection={disableSelection}
        onModelChange={modelChange}
        showMoreOptions={showMoreOptions}
        toggleMoreOptions={toggleMoreOptions}
      >
        <MoreOptions
          outputFormats={outputFormats}
          mcpTools={mcpTools}
          currentOutputFormat={currentChat?.outputFormatId}
          disableSelection={disableSelection}
          showFileUpload={showFileUpload}
          showMCPTools={showMCPTools}
          showTokenSliders={showTokenSliders}
          selectedPreset={selectedPreset}
          thinkingPresets={THINKING_PRESETS}
          onPresetChange={(preset: ThinkingPreset) => {
            setSelectedPreset(preset.name);
            setMaxTokens(preset.maxTokens);
            setBudgetTokens(preset.budgetTokens);
          }}
          maxTokens={maxTokens}
          budgetTokens={budgetTokens}
          hideOutputFormats={hideOutputFormats}
        />
      </OptionsBar>

      <TextInputArea
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onReset={handleReset}
        showFileUpload={showFileUpload}
      />
    </form>
  );
}
