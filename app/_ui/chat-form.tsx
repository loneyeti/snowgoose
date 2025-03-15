"use client";

import { getPersonas } from "../_lib/server_actions/persona.actions";
import { getModel, getModels } from "../_lib/server_actions/model.actions";
import { getOutputFormats } from "../_lib/server_actions/output-format.actions";
import { getMcpTools } from "../_lib/server_actions/mcp-tool.actions";
import { getApiVendors } from "../_lib/server_actions/api_vendor.actions";
import {
  Persona,
  OutputFormat,
  FormProps,
  MCPTool,
  APIVendor,
} from "../_lib/model";
import { Model } from "@prisma/client";
import SelectBox from "./select-box";
import { createChat } from "../_lib/actions";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { Spinner, SpinnerSize } from "./spinner";
import { useRouter } from "next/navigation";
import clsx from "clsx";

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
}: FormProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [promptVal, setPromptVal] = useState("");
  const [data, setData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([]);
  //const [responseHistory, setResponseHistory] = useState<ChatResponse[]>([]);
  const router = useRouter();
  const disableSelection = responseHistory.length > 0;
  //const [defaultModel, setDefaultModel] = useState("gpt-4");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelVendor, setSelectedModelVendor] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [hidePersonas, setHidePersonas] = useState(false);
  const [hideOutputFormats, setHideOutputFormats] = useState(false);
  const [showTokenSliders, setShowTokenSliders] = useState(false);
  const [showMCPTools, setShowMCPTools] = useState(false);
  const [mcpTools, setMCPTools] = useState<MCPTool[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("Thinking Off");
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [budgetTokens, setBudgetTokens] = useState<number | null>(null);
  const handleReset = (e: React.MouseEvent) => {
    resetPage();
  };

  const resetPage = () => {
    resetChat();
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
    //setResponseHistory([]);
    router.refresh();
  };

  const modelChange = (event: ChangeEvent) => {
    const selectedValue = (event.target as HTMLSelectElement).value;
    setSelectedModel(selectedValue);
  };

  // Populate select boxes on initial load and set selected model.
  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching data");
      try {
        const [
          personasData,
          modelsData,
          outputFormatsData,
          mcpToolsData,
          apiVendorsData,
        ] = await Promise.all([
          getPersonas(),
          getModels(),
          getOutputFormats(),
          getMcpTools(),
          getApiVendors(),
        ]);
        console.log("Setting data");
        personasData && setPersonas(personasData);
        modelsData && setModels(modelsData);
        outputFormatsData && setOutputFormats(outputFormatsData);
        mcpToolsData && setMCPTools(mcpToolsData);

        if (modelsData.length > 0) {
          setSelectedModel(modelsData[0].id.toString());
          const selectedModelData = modelsData[0];
          const vendor = apiVendorsData.find(
            (v: APIVendor) => v.id === selectedModelData.apiVendorId
          );
          setSelectedModelVendor(vendor?.name || "");
          setShowMCPTools(vendor?.name === "anthropic");
        }
      } catch (error) {
        console.error("Error fetching initialization data:", error);
      }
    };

    fetchData();
  }, []);

  // When the selected model changes, determine which form elements to show.
  useEffect(() => {
    if (selectedModel !== "") {
      const fetchNewModel = async () => {
        if (!selectedModel) return;

        try {
          // const model = await fetchModel(selectedModel);
          const model = await getModel(Number(selectedModel));
          if (model) {
            const apiVendors = await getApiVendors();
            const vendor = apiVendors.find(
              (v: APIVendor) => v.id === model?.apiVendorId
            );

            setSelectedModelVendor(vendor?.name || "");
            setShowMCPTools(vendor?.name === "anthropic");
            setShowFileUpload(!!model.isVision);
            setHideOutputFormats(!!model.isImageGeneration);
            setHidePersonas(!!model.isImageGeneration);
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
        } catch (error) {
          console.error(
            `Error fetching model by API Name: ${selectedModel}`,
            error
          );
        }
      };
      fetchNewModel();
    }
  }, [selectedModel]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSubmitting || !data) return;
      try {
        updateShowSpinner(true);

        const chat = await createChat(data, responseHistory);
        updateMessage(chat);

        // Set up form for followup
        updateShowSpinner(false);
        if (textAreaRef.current) {
          textAreaRef.current.value = "";
        }
        setPromptVal("");
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

  //Adjust the height of the prompt box as needed
  useEffect(() => {
    //Min/Max height of the Text box
    const minTextAreaHeight = 76;
    const maxTextAreaHeight = 300;

    const textArea = textAreaRef.current;
    if (!textArea) return;

    // Reset height to its initial or auto state to properly calculate scroll height.
    textArea.style.height = "auto";

    // Calculate the required height, and ensure it's within the defined min and max range.
    const requiredHeight = textArea.scrollHeight;
    const newHeight = Math.min(
      Math.max(requiredHeight, minTextAreaHeight),
      maxTextAreaHeight
    );

    // Apply the newHeight to the text area's height style.
    textArea.style.height = `${newHeight}px`;
  }, [promptVal]);

  const handleSubmit = (formData: FormData) => {
    setData(formData);
    setIsSubmitting(true);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptVal(e.target.value);
  };

  return (
    <form action={handleSubmit}>
      <div className="m-3">
        <label className="text-gray-700 text-xs" htmlFor="model">
          Model
        </label>
        <SelectBox
          name="model"
          disableSelection={disableSelection}
          defaultValue={currentChat?.modelId ?? 0}
          hide={false}
          onChangeFunction={modelChange}
        >
          {models.map((model: Model) => {
            return (
              <option value={model.id} key={model.id}>
                {model.name}
              </option>
            );
          })}
        </SelectBox>
      </div>
      <div className="m-3">
        <label
          className={clsx(`text-gray-700 text-xs`, {
            hidden: hidePersonas === true,
          })}
          htmlFor="persona"
        >
          Persona
        </label>
        <SelectBox
          name="persona"
          disableSelection={disableSelection}
          defaultValue={currentChat?.personaId ?? 0}
          hide={hidePersonas}
        >
          {personas.map((persona: Persona) => {
            return (
              <option value={persona.id} key={persona.id}>
                {persona.name}
              </option>
            );
          })}
        </SelectBox>
      </div>
      <div className="m-3">
        <label
          className={clsx(`text-gray-700 text-xs`, {
            hidden: hidePersonas === true,
          })}
          htmlFor="outputFormat"
        >
          Output Format
        </label>
        <SelectBox
          name="outputFormat"
          disableSelection={disableSelection}
          defaultValue={currentChat?.outputFormatId ?? 0}
          hide={hideOutputFormats}
        >
          {outputFormats.map((outputFormat: OutputFormat) => {
            return (
              <option value={outputFormat.id} key={outputFormat.id}>
                {outputFormat.name}
              </option>
            );
          })}
        </SelectBox>
      </div>
      {showMCPTools && (
        <div className="m-3">
          <label className="text-gray-700 text-xs" htmlFor="mcpTool">
            MCP Tool
          </label>
          <SelectBox
            name="mcpTool"
            disableSelection={disableSelection}
            defaultValue={0}
            hide={false}
          >
            <option value={0}>No Tool</option>
            {mcpTools.map((tool: MCPTool) => (
              <option value={tool.id} key={tool.id}>
                {tool.name}
              </option>
            ))}
          </SelectBox>
        </div>
      )}
      {showFileUpload && (
        <div className="m-3">
          <label className="text-gray-700 text-xs" htmlFor="image">
            Image
          </label>
          <input
            className="w-full text-sm text-slate-500  border border-slate-300 cursor-pointer rounded-md bg-slate-50 file:text-xs file:border-0 file:bg-slate-300 file:rounded-md file:h-full file:pt-1"
            name="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.type.startsWith("image/")) {
                // Valid image file selected
              } else if (file) {
                // Invalid file type selected
                e.target.value = "";
                alert("Please select a valid image file");
              }
            }}
          />
        </div>
      )}
      {showTokenSliders && (
        <>
          <div className="m-3">
            <div className="flex justify-between">
              <label className="text-gray-700 text-xs" htmlFor="thinkingPreset">
                Thinking Level
              </label>
              <span className="text-gray-700 text-xs">{selectedPreset}</span>
            </div>
            <input
              type="range"
              name="thinkingPreset"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
              min="0"
              max={THINKING_PRESETS.length - 1}
              value={THINKING_PRESETS.findIndex(
                (p) => p.name === selectedPreset
              )}
              onChange={(e) => {
                const preset = THINKING_PRESETS[parseInt(e.target.value)];
                setSelectedPreset(preset.name);
                setMaxTokens(preset.maxTokens);
                setBudgetTokens(preset.budgetTokens);
              }}
            />
          </div>
          <input type="hidden" name="maxTokens" value={maxTokens || ""} />
          <input type="hidden" name="budgetTokens" value={budgetTokens || ""} />
        </>
      )}
      <div className="m-3">
        <label className="text-gray-700 text-xs" htmlFor="prompt">
          Enter your prompt:
        </label>
        <div className="overflow-hidden [&:has(textarea:focus)]:border-token-border-xheavy [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full flex-grow relative border border-token-border-heavy bg-white rounded-2xl shadow-[0_0_0_2px_rgba(255,255,255,0.95)]">
          <textarea
            className="m-0 text-sm w-full resize-none border-0 bg-transparent py-[10px] pr-10 focus:ring-0 focus-visible:ring-0 md:py-3.5 md:pr-12 placeholder-black/50 pl-3 md:pl-4"
            id="prompt"
            name="prompt"
            ref={textAreaRef}
            onChange={handleTextAreaChange}
          ></textarea>
        </div>
      </div>
      <div className="m-3 flex">
        <button
          className="rounded-md text-sm bg-slate-300 p-2 hover:bg-slate-400 mr-3"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <div className="flex flex-row items-center">
              <div className="pr-2">
                <Spinner spinnerSize={SpinnerSize.sm} />
              </div>
              <div>Processing</div>
            </div>
          ) : (
            "Submit"
          )}
        </button>
        <button
          className="rounded-md text-sm bg-slate-200 p-2 hover:bg-slate-300"
          type="reset"
          onClick={handleReset}
        >
          {"Reset"}
        </button>
      </div>
    </form>
  );
}
