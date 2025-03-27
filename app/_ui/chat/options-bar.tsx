import { Model, Persona } from "@prisma/client";
import { OutputFormat } from "../../_lib/model";
import SelectBox from "@/app/_ui/select-box";
import { MaterialSymbol } from "react-material-symbols";
import React, { Fragment, useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";

interface OptionsBarProps {
  models: Model[];
  personas: Persona[];
  userPersonas?: Persona[];
  globalPersonas?: Persona[];
  outputFormats: OutputFormat[];
  currentModel?: number;
  currentPersona?: number;
  currentOutputFormat?: number;
  disableSelection: boolean;
  onModelChange: (event: React.ChangeEvent) => void;
  onPersonaChange: (event: React.ChangeEvent) => void;
  onOutputFormatChange: (event: React.ChangeEvent) => void;
  showMoreOptions: boolean;
  toggleMoreOptions: () => void;
  hideOutputFormats?: boolean;
  children?: React.ReactNode;
}

export default function OptionsBar({
  models,
  personas,
  userPersonas = [],
  globalPersonas = [],
  outputFormats,
  currentModel,
  currentPersona,
  currentOutputFormat,
  disableSelection,
  onModelChange,
  onPersonaChange,
  onOutputFormatChange,
  showMoreOptions,
  toggleMoreOptions,
  hideOutputFormats = true,
  children,
}: OptionsBarProps) {
  // Ensure we have proper persona arrays to work with
  const allUserPersonas = userPersonas.length > 0 ? userPersonas : [];
  const allGlobalPersonas = globalPersonas.length > 0 ? globalPersonas : [];

  // Log the persona counts for debugging
  console.log(
    `User Personas: ${allUserPersonas.length}, Global Personas: ${allGlobalPersonas.length}, Combined Personas: ${personas.length}`
  );

  // State to track selected options (defaulting to first items if available)
  const [selectedModel, setSelectedModel] = useState<number | undefined>(
    currentModel !== undefined
      ? currentModel
      : models.length > 0
        ? models[0].id
        : undefined
  );

  // Ensure the form is updated with the initial model value
  useEffect(() => {
    if (selectedModel !== undefined && !currentModel) {
      // Trigger model change event with initial value
      const event = {
        target: {
          name: "model",
          value: selectedModel,
        },
      } as unknown as React.ChangeEvent;
      onModelChange(event);
    }
  }, []);
  const [selectedPersona, setSelectedPersona] = useState<number | undefined>(
    currentPersona ||
      (allUserPersonas.length > 0
        ? allUserPersonas[0].id
        : allGlobalPersonas.length > 0
          ? allGlobalPersonas[0].id
          : undefined)
  );

  const [selectedOutputFormat, setSelectedOutputFormat] = useState<
    number | undefined
  >(
    currentOutputFormat ||
      (outputFormats.length > 0 ? outputFormats[0].id : undefined)
  );

  // Update local state when props change
  useEffect(() => {
    if (currentModel !== undefined) {
      setSelectedModel(currentModel);
    }
  }, [currentModel]);

  useEffect(() => {
    if (currentPersona !== undefined) {
      setSelectedPersona(currentPersona);
      const event = {
        target: {
          name: "persona",
          value: currentPersona,
        },
      } as unknown as React.ChangeEvent;
      onPersonaChange(event);
    }
  }, [currentPersona]);

  useEffect(() => {
    if (currentOutputFormat !== undefined) {
      setSelectedOutputFormat(currentOutputFormat);
      const event = {
        target: {
          name: "outputFormat",
          value: currentOutputFormat,
        },
      } as unknown as React.ChangeEvent;
      onOutputFormatChange(event);
    }
  }, [currentOutputFormat]);
  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        {/* Model Selection - Enhanced */}
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={`relative flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-slate-200 shadow-sm hover:border-slate-300 transition-colors ${open ? "border-blue-300 ring-1 ring-blue-200" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={disableSelection}
              >
                <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-slate-500 bg-white group-hover:text-slate-700 transition-colors z-10">
                  Model
                </div>
                <MaterialSymbol
                  icon="tune"
                  size={18}
                  className="text-slate-600"
                />
                <span className="text-sm font-medium whitespace-nowrap text-slate-700">
                  {models.find((m) => m.id === selectedModel)?.name ||
                    (models.length > 0 ? models[0].name : "Default")}
                </span>
                <MaterialSymbol
                  icon={open ? "expand_less" : "expand_more"}
                  size={18}
                  className="text-slate-500 ml-1"
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
                <Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b mb-1">
                      Select Model
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {models.map((model: Model) => (
                        <div
                          key={model.id}
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 ${model.id === currentModel ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                          onClick={() => {
                            setSelectedModel(model.id);
                            const event = {
                              target: {
                                name: "model",
                                value: model.id,
                              },
                            } as unknown as React.ChangeEvent;
                            onModelChange(event);
                          }}
                        >
                          <span className="text-sm">{model.name}</span>
                          {model.id === selectedModel && (
                            <MaterialSymbol
                              icon="check"
                              size={18}
                              className="ml-auto text-blue-600"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>

        {/* Persona Selection - Enhanced */}
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={`relative flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-slate-200 shadow-sm hover:border-slate-300 transition-colors ${open ? "border-blue-300 ring-1 ring-blue-200" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={disableSelection}
              >
                <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-slate-500 bg-white group-hover:text-slate-700 transition-colors z-10">
                  Persona
                </div>
                <MaterialSymbol
                  icon="person"
                  size={18}
                  className="text-slate-600"
                />
                <span className="text-sm font-medium whitespace-nowrap text-slate-700">
                  {[...allUserPersonas, ...allGlobalPersonas].find(
                    (p) => p.id === selectedPersona
                  )?.name ||
                    (allUserPersonas.length > 0
                      ? allUserPersonas[0].name
                      : allGlobalPersonas.length > 0
                        ? allGlobalPersonas[0].name
                        : "Default")}
                </span>
                <MaterialSymbol
                  icon={open ? "expand_less" : "expand_more"}
                  size={18}
                  className="text-slate-500 ml-1"
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
                <Popover.Panel className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b mb-1">
                      Select Persona
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {/* User Personas Section */}
                      {allUserPersonas.length > 0 && (
                        <>
                          <div className="px-3 py-1 text-xs font-medium text-slate-400 mt-1">
                            Your Personas
                          </div>
                          {allUserPersonas.map((persona: Persona) => (
                            <div
                              key={persona.id}
                              className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 ${persona.id === selectedPersona ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                              onClick={() => {
                                setSelectedPersona(persona.id);
                                const event = {
                                  target: {
                                    name: "persona",
                                    value: persona.id,
                                  },
                                } as unknown as React.ChangeEvent;
                                onPersonaChange(event);
                              }}
                            >
                              <span className="text-sm">{persona.name}</span>
                              {persona.id === selectedPersona && (
                                <MaterialSymbol
                                  icon="check"
                                  size={18}
                                  className="ml-auto text-blue-600"
                                />
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {/* Global Personas Section */}
                      {allGlobalPersonas.length > 0 && (
                        <>
                          <div className="px-3 py-1 text-xs font-medium text-slate-400 mt-2">
                            Global Personas
                          </div>
                          {allGlobalPersonas.map((persona: Persona) => (
                            <div
                              key={persona.id}
                              className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 ${persona.id === selectedPersona ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                              onClick={() => {
                                setSelectedPersona(persona.id);
                                const event = {
                                  target: {
                                    name: "persona",
                                    value: persona.id,
                                  },
                                } as unknown as React.ChangeEvent;
                                onPersonaChange(event);
                              }}
                            >
                              <span className="text-sm">{persona.name}</span>
                              {persona.id === selectedPersona && (
                                <MaterialSymbol
                                  icon="check"
                                  size={18}
                                  className="ml-auto text-blue-600"
                                />
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {/* Fallback: Use personas array if we don't have any userPersonas or globalPersonas */}
                      {allUserPersonas.length === 0 &&
                        allGlobalPersonas.length === 0 &&
                        personas.length > 0 && (
                          <>
                            <div className="px-3 py-1 text-xs font-medium text-slate-400 mt-1">
                              Available Personas
                            </div>
                            {personas.map((persona: Persona) => (
                              <div
                                key={persona.id}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 ${persona.id === selectedPersona ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                                onClick={() => {
                                  setSelectedPersona(persona.id);
                                  const event = {
                                    target: {
                                      name: "persona",
                                      value: persona.id,
                                    },
                                  } as unknown as React.ChangeEvent;
                                  onPersonaChange(event);
                                }}
                              >
                                <span className="text-sm">{persona.name}</span>
                                {persona.id === selectedPersona && (
                                  <MaterialSymbol
                                    icon="check"
                                    size={18}
                                    className="ml-auto text-blue-600"
                                  />
                                )}
                              </div>
                            ))}
                          </>
                        )}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  );
}
