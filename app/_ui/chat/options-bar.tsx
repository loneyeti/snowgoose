import { Persona } from "@prisma/client";
import { OutputFormat, ModelWithVendorName } from "../../_lib/model"; // Import ModelWithVendorName
import { MaterialSymbol } from "react-material-symbols";
import React, { Fragment, useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import AddPersonaModal from "@/app/_ui/settings/user-personas/add-persona-modal"; // Import the modal

interface OptionsBarProps {
  models: ModelWithVendorName[]; // Use ModelWithVendorName
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
  // State for the Add Persona Modal
  const [isAddPersonaModalOpen, setIsAddPersonaModalOpen] = useState(false);
  const openAddPersonaModal = () => setIsAddPersonaModalOpen(true);
  const closeAddPersonaModal = () => setIsAddPersonaModalOpen(false);

  // Ensure we have proper persona arrays to work with
  const allUserPersonas = userPersonas.length > 0 ? userPersonas : [];
  const allGlobalPersonas = globalPersonas.length > 0 ? globalPersonas : [];

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
  }, [currentModel, onModelChange, selectedModel]);
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
      /*
      const event = {
        target: {
          name: "persona",
          value: currentPersona,
        },
      } as unknown as React.ChangeEvent;
      console.log("CHanging persona");
      onPersonaChange(event);*/
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
  }, [currentOutputFormat, onOutputFormatChange]);

  // Group models by vendor using apiVendorName
  const groupedModels: { [vendor: string]: ModelWithVendorName[] } = {};
  models.forEach((model) => {
    // Access vendor name directly from the prepared property
    const vendorName = model.apiVendorName || "Unknown Vendor";
    if (!groupedModels[vendorName]) {
      groupedModels[vendorName] = [];
    }
    groupedModels[vendorName].push(model);
  });

  // Sort vendors alphabetically
  const sortedVendors = Object.keys(groupedModels).sort((a, b) =>
    a.localeCompare(b)
  );

  // Sort models within each vendor group alphabetically
  sortedVendors.forEach((vendor) => {
    groupedModels[vendor].sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div className="py-3" data-testid="onboarding-options-bar">
      <div className="flex items-center gap-3">
        {/* Model Selection - Enhanced */}
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={`relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={disableSelection}
              >
                <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors z-10">
                  Model
                </div>
                <MaterialSymbol
                  icon="tune"
                  size={18}
                  className="text-slate-600 dark:text-slate-300"
                />
                <span className="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-100">
                  {models.find((m) => m.id === selectedModel)?.name ||
                    (models.length > 0 ? models[0].name : "Default")}
                </span>
                <MaterialSymbol
                  icon={open ? "expand_less" : "expand_more"}
                  size={18}
                  className="text-slate-500 dark:text-slate-400 ml-1"
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
                {/* Dark mode: Adjust Panel styles */}
                <Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                  <div className="p-2">
                    {/* Dark mode: Adjust header styles */}
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                      Select Model
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {/* Render grouped and sorted models */}
                      {sortedVendors.map((vendor) => (
                        <Fragment key={vendor}>
                          {/* Dark mode: Adjust vendor group header */}
                          <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                            {vendor}
                          </div>
                          {groupedModels[vendor].map(
                            (model: ModelWithVendorName) => (
                              // Dark mode: Adjust item styles (hover, selected, text)
                              <div
                                key={model.id}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${model.id === selectedModel ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
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
                                  // Dark mode: Adjust checkmark color
                                  <MaterialSymbol
                                    icon="check"
                                    size={18}
                                    className="ml-auto text-blue-600 dark:text-blue-400"
                                  />
                                )}
                              </div>
                            )
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>

        {/* Persona Selection Group (Popover + Add Button) */}
        <div className="flex items-center gap-1">
          {/* Persona Selection - Enhanced */}
          <Popover className="relative">
            {({ open }) => (
              <>
                {/* Dark mode: Adjust Popover button styles */}
                <Popover.Button
                  className={`relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={disableSelection}
                >
                  {/* Dark mode: Adjust label styles */}
                  <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors z-10">
                    Persona
                  </div>
                  {/* Dark mode: Adjust icon colors */}
                  <MaterialSymbol
                    icon="person"
                    size={18}
                    className="text-slate-600 dark:text-slate-300"
                  />
                  {/* Dark mode: Adjust text color & add truncation */}
                  <span className="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">
                    {" "}
                    {/* Added truncate and max-width for mobile */}
                    {[...allUserPersonas, ...allGlobalPersonas].find(
                      (p) => p.id === selectedPersona
                    )?.name ||
                      (allUserPersonas.length > 0
                        ? allUserPersonas[0].name
                        : allGlobalPersonas.length > 0
                          ? allGlobalPersonas[0].name
                          : "Default")}
                  </span>
                  {/* Dark mode: Adjust icon colors */}
                  <MaterialSymbol
                    icon={open ? "expand_less" : "expand_more"}
                    size={18}
                    className="text-slate-500 dark:text-slate-400 ml-1"
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
                  {/* Dark mode: Adjust Panel styles */}
                  <Popover.Panel className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                    <div className="p-2">
                      {/* Dark mode: Adjust header styles */}
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                        Select Persona
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {/* User Personas Section */}
                        {allUserPersonas.length > 0 && (
                          <>
                            {/* Dark mode: Adjust group header */}
                            <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                              Your Personas
                            </div>
                            {allUserPersonas.map((persona: Persona) => (
                              // Dark mode: Adjust item styles (hover, selected, text)
                              <div
                                key={persona.id}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${persona.id === selectedPersona ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
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
                                  // Dark mode: Adjust checkmark color
                                  <MaterialSymbol
                                    icon="check"
                                    size={18}
                                    className="ml-auto text-blue-600 dark:text-blue-400"
                                  />
                                )}
                              </div>
                            ))}
                          </>
                        )}

                        {/* Global Personas Section */}
                        {allGlobalPersonas.length > 0 && (
                          <>
                            {/* Dark mode: Adjust group header */}
                            <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">
                              Global Personas
                            </div>
                            {allGlobalPersonas.map((persona: Persona) => (
                              // Dark mode: Adjust item styles (hover, selected, text)
                              <div
                                key={persona.id}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${persona.id === selectedPersona ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
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
                                  // Dark mode: Adjust checkmark color
                                  <MaterialSymbol
                                    icon="check"
                                    size={18}
                                    className="ml-auto text-blue-600 dark:text-blue-400"
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
                              {/* Dark mode: Adjust group header */}
                              <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                Available Personas
                              </div>
                              {personas.map((persona: Persona) => (
                                // Dark mode: Adjust item styles (hover, selected, text)
                                <div
                                  key={persona.id}
                                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${persona.id === selectedPersona ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
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
                                  <span className="text-sm">
                                    {persona.name}
                                  </span>
                                  {persona.id === selectedPersona && (
                                    // Dark mode: Adjust checkmark color
                                    <MaterialSymbol
                                      icon="check"
                                      size={18}
                                      className="ml-auto text-blue-600 dark:text-blue-400"
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

          {/* Add Persona Icon Button */}
          <button
            type="button"
            onClick={openAddPersonaModal}
            title="Add Persona"
            className={`pt-2.5 px-3 pb-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors`}
            disabled={disableSelection}
            aria-label="Add Persona"
          >
            <MaterialSymbol icon="add" size={20} />
          </button>
        </div>
      </div>
      {/* Render the Add Persona Modal */}
      <AddPersonaModal
        isOpen={isAddPersonaModalOpen}
        onClose={closeAddPersonaModal}
      />
    </div>
  );
}
