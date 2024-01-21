"use client";

import { fetchPersonas, fetchModels, fetchOutputFormats } from "../lib/api";
import {
  Persona,
  Model,
  OutputFormat,
  FormProps,
  ChatResponse,
} from "../lib/model";
import { createChat } from "../lib/actions";
import React, { useState, useEffect, useRef, EventHandler } from "react";
import { Spinner, SpinnerSize } from "./spinner";

export default function ChatForm({ updateMessage }: FormProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [promptVal, setPromptVal] = useState("");
  const [data, setData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([]);
  const [responseHistory, setResponseHistory] = useState<ChatResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personasData = await fetchPersonas();
        setPersonas(personasData);
        const modelsData = await fetchModels();
        setModels(modelsData);
        const outputFormatsData = await fetchOutputFormats();
        setOutputFormats(outputFormatsData);
      } catch (error) {
        console.error("Error fetching initialization data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Using effect");
    const fetchData = async () => {
      if (data) {
        try {
          console.log("message received. Updating.");
          const res = await createChat(data, responseHistory);
          console.log(res);
          console.log(responseHistory);
          setResponseHistory(res);
          console.log(responseHistory);
          updateMessage(res);
          console.log("Done updating");
          setIsSubmitting(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsSubmitting(false);
          alert("Error retrieving data");
          throw error;
        }
      }
    };
    if (isSubmitting === true) {
      console.log("submitting form data");
      fetchData();
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (textAreaRef.current) {
      let height = textAreaRef.current.scrollHeight;
      let heightText = "300px";
      if (height < 300) {
        heightText = height + "px";
      }
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = heightText;
    }
  }, [promptVal]);

  //const personas = await fetchPersonas()
  //const models = await fetchModels()
  //const outputFormats = await fetchOutputFormats()

  const handleSubmit = (formData: FormData) => {
    setData(formData);
    setIsSubmitting(true);
    //const result = await createChat(formData);
    //updateMessage(result)
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
        <select
          className="block w-full mt-0 px-3 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black rounded-md"
          id="model"
          name="model"
        >
          {models.map((model: Model) => {
            return (
              <option value={model.name} key={model.name}>
                {model.title}
              </option>
            );
          })}
        </select>
      </div>
      <div className="m-3">
        <label className="text-gray-700 text-xs" htmlFor="persona">
          Persona
        </label>
        <select
          className="block w-full mt-0 px-3 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black rounded-md"
          id="persona"
          name="persona"
        >
          {personas.map((persona: Persona) => {
            return (
              <option value={persona.id} key={persona.id}>
                {persona.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="m-3">
        <label className="text-gray-700 text-xs" htmlFor="outputFormat">
          Output Format
        </label>
        <select
          className="block w-full mt-0 px-3 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black rounded-md"
          id="outputFormat"
          name="outputFormat"
        >
          {outputFormats.map((outputFormat: OutputFormat) => {
            return (
              <option value={outputFormat.id} key={outputFormat.id}>
                {outputFormat.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="m-3">
        <label className="text-gray-700 text-xs" htmlFor="prompt">
          Enter your prompt:
        </label>
        <div className="overflow-hidden [&:has(textarea:focus)]:border-token-border-xheavy [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full dark:border-token-border-heavy flex-grow relative border border-token-border-heavy dark:text-white rounded-2xl bg-white dark:bg-gray-800 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:shadow-[0_0_0_2px_rgba(52,53,65,0.95)]">
          <textarea
            className="m-0 w-full resize-none border-0 bg-transparent py-[10px] pr-10 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:py-3.5 md:pr-12 placeholder-black/50 dark:placeholder-white/50 pl-3 md:pl-4"
            id="prompt"
            name="prompt"
            ref={textAreaRef}
            onChange={handleTextAreaChange}
          ></textarea>
        </div>
      </div>
      <div className="m-3">
        <button
          className="rounded-md bg-slate-200 p-2 hover:bg-slate-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Spinner spinnerSize={SpinnerSize.sm} /> Processing
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </form>
  );
}
