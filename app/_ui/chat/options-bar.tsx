import { Persona } from "@prisma/client";
import { OutputFormat, ModelWithVendorName } from "../../_lib/model";
import { MaterialSymbol } from "react-material-symbols";
import React, { Fragment, useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import AddPersonaModal from "@/app/_ui/settings/user-personas/add-persona-modal";
import { User } from "@prisma/client";

interface OptionsBarProps {
  user: User;
  models: ModelWithVendorName[];
  personas: Persona[];
  userPersonas?: Persona[];
  globalPersonas?: Persona[];
  outputFormats: OutputFormat[];
  currentModel?: number;
  currentPersona?: number;
  currentOutputFormat?: number;
  disableSelection?: boolean;
  disableModelSelection?: boolean;
  disablePersonaSelection?: boolean;
  onModelChange: (event: React.ChangeEvent) => void;
  onPersonaChange: (event: React.ChangeEvent) => void;
  onOutputFormatChange: (event: React.ChangeEvent) => void;
  showMoreOptions: boolean;
  toggleMoreOptions: () => void;
  hideOutputFormats?: boolean;
  children?: React.ReactNode;
  isMobileLayout?: boolean;
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
  disableModelSelection,
  disablePersonaSelection,
  onModelChange,
  onPersonaChange,
  onOutputFormatChange,
  showMoreOptions,
  toggleMoreOptions,
  hideOutputFormats = true,
  children,
  isMobileLayout = false,
  user,
}: OptionsBarProps) {
  const [isAddPersonaModalOpen, setIsAddPersonaModalOpen] = useState(false);
  const openAddPersonaModal = () => setIsAddPersonaModalOpen(true);
  const closeAddPersonaModal = () => setIsAddPersonaModalOpen(false);

  const allUserPersonas = userPersonas.length > 0 ? userPersonas : [];
  const allGlobalPersonas = globalPersonas.length > 0 ? globalPersonas : [];

  const [selectedModel, setSelectedModel] = useState<number | undefined>(
    currentModel !== undefined
      ? currentModel
      : models.length > 0
        ? models[0].id
        : undefined
  );

  const [selectedPersona, setSelectedPersona] = useState<number | undefined>(
    currentPersona ||
      (allGlobalPersonas.length > 0 ? allGlobalPersonas[0].id : undefined)
  );

  useEffect(() => {
    if (currentModel !== undefined) {
      setSelectedModel(currentModel);
    }
  }, [currentModel]);

  useEffect(() => {
    if (currentPersona !== undefined) {
      setSelectedPersona(currentPersona);
    }
  }, [currentPersona]);

  // Determine specific disabled states
  const isModelDisabled =
    disableModelSelection !== undefined
      ? disableModelSelection
      : (disableSelection ?? false);

  const isPersonaDisabled =
    disablePersonaSelection !== undefined
      ? disablePersonaSelection
      : (disableSelection ?? false);

  const groupedModels: { [vendor: string]: ModelWithVendorName[] } = {};
  models.forEach((model) => {
    const vendorName = model.apiVendorName || "Unknown Vendor";
    if (!groupedModels[vendorName]) {
      groupedModels[vendorName] = [];
    }
    groupedModels[vendorName].push(model);
  });

  const sortedVendors = Object.keys(groupedModels).sort((a, b) =>
    a.localeCompare(b)
  );
  sortedVendors.forEach((vendor) => {
    groupedModels[vendor].sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div data-testid="onboarding-options-bar">
      <div
        className={`flex items-center ${isMobileLayout ? "flex-col gap-3 items-stretch" : "gap-3"}`}
      >
        {/* Model Selection */}
        <Popover className={`relative ${isMobileLayout ? "w-full" : ""}`}>
          {({ open }) => (
            <>
              <Popover.Button
                className={`relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${isModelDisabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={isModelDisabled}
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
                <Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                      Select Model
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {sortedVendors.map((vendor) => (
                        <Fragment key={vendor}>
                          <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                            {vendor}
                          </div>
                          {groupedModels[vendor].map(
                            (model: ModelWithVendorName) => {
                              const hasPaidAccess =
                                user?.hasUnlimitedCredits === true ||
                                (user?.stripeSubscriptionId &&
                                  user?.stripeSubscriptionStatus === "active");
                              const requiresPaid = model.paidOnly === true;
                              const isDisabled = requiresPaid && !hasPaidAccess;
                              return (
                                <div
                                  key={model.id}
                                  className={`flex items-center justify-between px-3 py-2 rounded-md ${
                                    isDisabled
                                      ? "opacity-50 cursor-not-allowed" // Disabled styles
                                      : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" // Enabled styles
                                  } ${
                                    model.id === selectedModel && !isDisabled // Only apply selected style if not disabled
                                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                                      : isDisabled
                                        ? "text-slate-400 dark:text-slate-500" // Disabled text color
                                        : "text-slate-700 dark:text-slate-200" // Enabled text color
                                  }`}
                                  onClick={
                                    isDisabled
                                      ? undefined
                                      : () => {
                                          setSelectedModel(model.id);
                                          const event = {
                                            target: {
                                              name: "model",
                                              value: model.id.toString(),
                                            },
                                          } as unknown as React.ChangeEvent;
                                          onModelChange(event);
                                        }
                                  }
                                >
                                  <span className="text-sm">{model.name}</span>
                                  <div className="flex items-center ml-auto">
                                    {model.id === selectedModel &&
                                      !isDisabled && (
                                        <MaterialSymbol
                                          icon="check"
                                          size={18}
                                          className="text-blue-600 dark:text-blue-400"
                                        />
                                      )}
                                    {requiresPaid && isDisabled && (
                                      <span
                                        className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-400`}
                                      >
                                        Paid
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
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

        <div
          className={`flex items-center gap-1 ${isMobileLayout ? "w-full" : ""}`}
        >
          {/* Persona Selection */}
          <Popover className={`relative ${isMobileLayout ? "w-full" : ""}`}>
            {({ open }) => (
              <>
                <Popover.Button
                  disabled={isPersonaDisabled}
                  className={`relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${isPersonaDisabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"} ${isMobileLayout ? "w-full justify-between" : ""}`}
                >
                  <div className="absolute -top-2 left-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors z-10">
                    Persona
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MaterialSymbol
                      icon="person"
                      size={18}
                      className="text-slate-600 dark:text-slate-300 flex-shrink-0"
                    />
                    <span className="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-100 truncate">
                      {[...allUserPersonas, ...allGlobalPersonas].find(
                        (p) => p.id === selectedPersona
                      )?.name ||
                        (allUserPersonas.length > 0
                          ? allUserPersonas[0].name
                          : allGlobalPersonas.length > 0
                            ? allGlobalPersonas[0].name
                            : "Default")}
                    </span>
                  </div>
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
                  <Popover.Panel className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                        Select Persona
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {allGlobalPersonas.length > 0 && (
                          <>
                            <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">
                              Global Personas
                            </div>
                            {allGlobalPersonas.map((persona: Persona) => (
                              <div
                                key={persona.id}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${persona.id === selectedPersona ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
                                onClick={() => {
                                  setSelectedPersona(persona.id);
                                  const event = {
                                    target: {
                                      name: "persona",
                                      value: persona.id.toString(),
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
                                    className="ml-auto text-blue-600 dark:text-blue-400"
                                  />
                                )}
                              </div>
                            ))}
                          </>
                        )}
                        {allUserPersonas.length > 0 && (
                          <>
                            <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                              Your Personas
                            </div>
                            {allUserPersonas.map((persona: Persona) => (
                              <div
                                key={persona.id}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${persona.id === selectedPersona ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
                                onClick={() => {
                                  setSelectedPersona(persona.id);
                                  const event = {
                                    target: {
                                      name: "persona",
                                      value: persona.id.toString(),
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
                                    className="ml-auto text-blue-600 dark:text-blue-400"
                                  />
                                )}
                              </div>
                            ))}
                          </>
                        )}
                        {allUserPersonas.length === 0 &&
                          allGlobalPersonas.length === 0 &&
                          personas.length > 0 && (
                            <>
                              <div className="px-3 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                Available Personas
                              </div>
                              {personas.map((persona: Persona) => (
                                <div
                                  key={persona.id}
                                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${persona.id === selectedPersona ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
                                  onClick={() => {
                                    setSelectedPersona(persona.id);
                                    const event = {
                                      target: {
                                        name: "persona",
                                        value: persona.id.toString(),
                                      },
                                    } as unknown as React.ChangeEvent;
                                    onPersonaChange(event);
                                  }}
                                >
                                  <span className="text-sm">
                                    {persona.name}
                                  </span>
                                  {persona.id === selectedPersona && (
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
          {/* Add Persona Button */}
          <button
            type="button"
            onClick={openAddPersonaModal}
            title="Add Persona"
            className={`pt-2.5 px-3 pb-0.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors`}
            disabled={isPersonaDisabled}
            aria-label="Add Persona"
          >
            <MaterialSymbol icon="person_add" size={20} />
          </button>
        </div>
      </div>
      <AddPersonaModal
        isOpen={isAddPersonaModalOpen}
        onClose={closeAddPersonaModal}
      />
    </div>
  );
}
