"use client";

import {
  fetchPersonas,
  fetchModels,
  fetchOutputFormats,
  fetchModel,
  fetchModelByAPIName,
} from "../_lib/api";
import {
  Persona,
  Model,
  OutputFormat,
  FormProps,
  ChatResponse,
  Chat,
} from "../_lib/model";
import SelectBox from "./select-box";
import { createChat } from "../_lib/actions";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { Spinner, SpinnerSize } from "./spinner";
import { useRouter } from "next/navigation";
import clsx from "clsx";

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
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [hidePersonas, setHidePersonas] = useState(false);
  const [hideOutputFormats, setHideOutputFormats] = useState(false);
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
      try {
        const [personasData, modelsData, outputFormatsData] = await Promise.all(
          [fetchPersonas(), fetchModels(), fetchOutputFormats()]
        );

        personasData && setPersonas(personasData);
        modelsData && setModels(modelsData);
        outputFormatsData && setOutputFormats(outputFormatsData);

        if (modelsData.length > 0) {
          setSelectedModel(modelsData[0].id);
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
          const model = await fetchModel(selectedModel);
          setShowFileUpload(!!model.is_vision);
          setHideOutputFormats(
            !!(model.is_vision || model.is_image_generation)
          );
          setHidePersonas(!!(model.is_vision || model.is_image_generation));
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
      {showFileUpload && (
        <div className="m-3">
          <label className="text-gray-700 text-xs" htmlFor="image">
            Image
          </label>
          <input
            className="w-full text-sm text-slate-500  border border-slate-300 cursor-pointer rounded-md bg-slate-50 file:text-xs file:border-0 file:bg-slate-300 file:rounded-md file:h-full file:pt-1"
            name="image"
            type="file"
          />
        </div>
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
