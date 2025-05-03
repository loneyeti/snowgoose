import { MCPTool } from "@prisma/client";
import { OutputFormat, OpenAIImageGenerationOptions } from "../../_lib/model"; // Added OpenAIImageGenerationOptions
import React, { Fragment, useState, useEffect } from "react";
import { MaterialSymbol } from "react-material-symbols";
import { Popover, Transition } from "@headlessui/react";

// Define types for the new image options based on OpenAIImageGenerationOptions
type ImageSize = NonNullable<OpenAIImageGenerationOptions["size"]>;
type ImageQuality = NonNullable<OpenAIImageGenerationOptions["quality"]>;
type ImageBackground = NonNullable<OpenAIImageGenerationOptions["background"]>;

// Define available options
const imageSizes: ImageSize[] = ["auto", "1024x1024", "1024x1536", "1536x1024"];
const imageQualities: ImageQuality[] = ["auto", "low", "medium", "high"];
const imageBackgrounds: ImageBackground[] = ["auto", "opaque", "transparent"];

interface ThinkingPreset {
  name: string;
  maxTokens: number;
  budgetTokens: number | null;
}

interface MoreOptionsProps {
  outputFormats: OutputFormat[];
  mcpTools: MCPTool[];
  currentOutputFormat?: number;
  currentMCPTool?: number;
  disableSelection: boolean;
  showFileUpload: boolean;
  showMCPTools: boolean;
  showTokenSliders: boolean;
  selectedPreset: string;
  thinkingPresets: ThinkingPreset[];
  onPresetChange: (preset: ThinkingPreset) => void;
  maxTokens: number | null;
  budgetTokens: number | null;
  hideOutputFormats: boolean;
  onOutputFormatChange?: (event: React.ChangeEvent) => void;
  onMCPToolChange?: (event: React.ChangeEvent) => void;
  // Add new props for image options
  showImageOptions: boolean;
  currentSize?: ImageSize;
  currentQuality?: ImageQuality;
  currentBackground?: ImageBackground;
  onSizeChange?: (value: ImageSize) => void;
  onQualityChange?: (value: ImageQuality) => void;
  onBackgroundChange?: (value: ImageBackground) => void;
}

export default function MoreOptions({
  outputFormats,
  mcpTools,
  currentOutputFormat,
  currentMCPTool,
  disableSelection,
  showFileUpload,
  showMCPTools,
  showTokenSliders,
  selectedPreset,
  thinkingPresets,
  onPresetChange,
  maxTokens,
  budgetTokens,
  hideOutputFormats,
  onOutputFormatChange,
  onMCPToolChange,
  // Destructure new props
  showImageOptions,
  currentSize = "auto", // Default to 'auto'
  currentQuality = "auto", // Default to 'auto'
  currentBackground = "auto", // Default to 'auto'
  onSizeChange,
  onQualityChange,
  onBackgroundChange,
}: MoreOptionsProps) {
  // --- Existing State ---
  // Removed internal selectedOutputFormat state - rely on currentOutputFormat prop
  const [selectedMCPTool, setSelectedMCPTool] = useState<number | undefined>(
    currentMCPTool ?? 0
  );

  // --- New State for Image Options ---
  const [selectedSize, setSelectedSize] = useState<ImageSize>(currentSize);
  const [selectedQuality, setSelectedQuality] =
    useState<ImageQuality>(currentQuality);
  const [selectedBackground, setSelectedBackground] =
    useState<ImageBackground>(currentBackground);

  // --- Existing Effects ---
  // Removed useEffect for selectedOutputFormat

  useEffect(() => {
    // Keep only one useEffect for currentMCPTool
    if (currentMCPTool !== undefined) {
      setSelectedMCPTool(currentMCPTool);
    }
  }, [currentMCPTool]);

  // --- New Effects for Image Options ---
  useEffect(() => {
    setSelectedSize(currentSize);
  }, [currentSize]);

  useEffect(() => {
    setSelectedQuality(currentQuality);
  }, [currentQuality]);

  useEffect(() => {
    setSelectedBackground(currentBackground);
  }, [currentBackground]);

  // --- Helper Function for Popover Items ---
  const renderPopoverItem = <T extends string>(
    value: T,
    selectedValue: T,
    label: string,
    onChange: (newValue: T) => void,
    close: () => void
  ) => (
    <button
      key={value}
      type="button"
      className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${value === selectedValue ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
      onClick={() => {
        onChange(value);
        close();
      }}
    >
      <span className="text-sm">{label}</span>
      {value === selectedValue && (
        <MaterialSymbol
          icon="check"
          size={18}
          className="ml-auto text-blue-600 dark:text-blue-400"
        />
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Dark mode: Adjust title text and border */}
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
        Advanced Options
      </h3>

      {/* --- Output Format Selection (Existing) --- */}
      {!hideOutputFormats && (
        <div className="space-y-2">
          {/* Dark mode: Adjust label text and icon */}
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <MaterialSymbol icon="format_align_left" size={18} />
            <label className="text-sm font-medium">Output Format</label>
          </div>

          <Popover className="relative w-full">
            {({ open, close }) => (
              <>
                {/* Dark mode: Adjust Popover button */}
                <Popover.Button
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={disableSelection}
                >
                  {/* Dark mode: Adjust button text */}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
                    {/* Display based on currentOutputFormat prop */}
                    {outputFormats.find((f) => f.id === currentOutputFormat)
                      ?.name ||
                      (outputFormats.length > 0
                        ? outputFormats[0].name
                        : "Default")}
                  </span>
                  {/* Dark mode: Adjust icon */}
                  <MaterialSymbol
                    icon={open ? "expand_less" : "expand_more"}
                    size={18}
                    className="text-slate-500 dark:text-slate-400"
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
                  <Popover.Panel className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                    <div className="p-2">
                      {/* Dark mode: Adjust header styles */}
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                        Select Output Format
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {outputFormats.map((format: OutputFormat) => (
                          // Dark mode: Adjust item button styles
                          <button
                            key={format.id}
                            type="button"
                            className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${format.id === currentOutputFormat ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
                            onClick={() => {
                              // Remove local state update
                              // setSelectedOutputFormat(format.id);

                              // Notify parent component directly
                              if (onOutputFormatChange) {
                                const event = {
                                  target: {
                                    name: "outputFormat",
                                    value: format.id,
                                  },
                                } as unknown as React.ChangeEvent;
                                onOutputFormatChange(event);
                                close(); // Close the popover after selection
                              }
                            }}
                          >
                            <span className="text-sm">{format.name}</span>
                            {/* Check against currentOutputFormat prop */}
                            {format.id === currentOutputFormat && (
                              // Dark mode: Adjust checkmark color
                              <MaterialSymbol
                                icon="check"
                                size={18}
                                className="ml-auto text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      )}

      {/* --- MCP Tools (Existing - Corrected Structure) --- */}
      {showMCPTools && (
        <div className="space-y-2">
          {/* Dark mode: Adjust label text and icon */}
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <MaterialSymbol icon="build" size={18} />
            <label className="text-sm font-medium">MCP Tool</label>
          </div>

          <Popover className="relative w-full">
            {({ open, close }) => (
              <>
                {/* Dark mode: Adjust Popover button */}
                <Popover.Button
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={disableSelection}
                >
                  {/* Dark mode: Adjust button text */}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
                    {selectedMCPTool === 0 || selectedMCPTool === undefined
                      ? "No Tool"
                      : mcpTools.find((t) => t.id === selectedMCPTool)?.name ||
                        "No Tool"}
                  </span>
                  {/* Dark mode: Adjust icon */}
                  <MaterialSymbol
                    icon={open ? "expand_less" : "expand_more"}
                    size={18}
                    className="text-slate-500 dark:text-slate-400"
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
                  <Popover.Panel className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                    <div className="p-2">
                      {/* Dark mode: Adjust header styles */}
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                        Select MCP Tool
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {/* Dark mode: Adjust "No Tool" button styles */}
                        <button
                          type="button"
                          className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${selectedMCPTool === 0 || selectedMCPTool === undefined ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
                          onClick={() => {
                            // Update local state
                            setSelectedMCPTool(0);

                            // Update local state
                            setSelectedMCPTool(0);

                            // Notify parent component
                            if (onMCPToolChange) {
                              const event = {
                                target: {
                                  name: "mcpTool",
                                  value: 0,
                                },
                              } as unknown as React.ChangeEvent;
                              onMCPToolChange(event);
                            }
                            close(); // Close the popover after selection
                          }}
                        >
                          <span className="text-sm">No Tool</span>
                          {(selectedMCPTool === 0 ||
                            selectedMCPTool === undefined) && (
                            // Dark mode: Adjust checkmark color
                            <MaterialSymbol
                              icon="check"
                              size={18}
                              className="ml-auto text-blue-600 dark:text-blue-400"
                            />
                          )}
                        </button>
                        {mcpTools.map((tool: MCPTool) => (
                          // Dark mode: Adjust tool item button styles
                          <button
                            key={tool.id}
                            type="button"
                            className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${tool.id === selectedMCPTool ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "text-slate-700 dark:text-slate-200"}`}
                            onClick={() => {
                              // Update local state
                              setSelectedMCPTool(tool.id);

                              // Update local state
                              setSelectedMCPTool(tool.id);

                              // Notify parent component
                              if (onMCPToolChange) {
                                const event = {
                                  target: {
                                    name: "mcpTool",
                                    value: tool.id,
                                  },
                                } as unknown as React.ChangeEvent;
                                onMCPToolChange(event);
                              }
                              close(); // Close the popover after selection
                            }}
                          >
                            <span className="text-sm">{tool.name}</span>
                            {tool.id === selectedMCPTool && (
                              // Dark mode: Adjust checkmark color
                              <MaterialSymbol
                                icon="check"
                                size={18}
                                className="ml-auto text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      )}

      {/* --- New Image Generation Options (Keep as is) --- */}
      {showImageOptions && (
        <>
          {/* Image Size Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MaterialSymbol icon="aspect_ratio" size={18} />
              <label className="text-sm font-medium">Image Size</label>
            </div>
            <Popover className="relative w-full">
              {({ open, close }) => (
                <>
                  <Popover.Button
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={disableSelection}
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
                      {selectedSize}
                    </span>
                    <MaterialSymbol
                      icon={open ? "expand_less" : "expand_more"}
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
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
                    <Popover.Panel className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                          Select Image Size
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {imageSizes.map((size) =>
                            renderPopoverItem(
                              size,
                              selectedSize,
                              size,
                              (newValue) => {
                                setSelectedSize(newValue);
                                if (onSizeChange) onSizeChange(newValue);
                              },
                              close
                            )
                          )}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            {/* Hidden input to pass value to form */}
            <input type="hidden" name="imageSize" value={selectedSize} />
          </div>

          {/* Image Quality Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MaterialSymbol icon="high_quality" size={18} />
              <label className="text-sm font-medium">Image Quality</label>
            </div>
            <Popover className="relative w-full">
              {({ open, close }) => (
                <>
                  <Popover.Button
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={disableSelection}
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
                      {selectedQuality}
                    </span>
                    <MaterialSymbol
                      icon={open ? "expand_less" : "expand_more"}
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
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
                    <Popover.Panel className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                          Select Image Quality
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {imageQualities.map((quality) =>
                            renderPopoverItem(
                              quality,
                              selectedQuality,
                              quality,
                              (newValue) => {
                                setSelectedQuality(newValue);
                                if (onQualityChange) onQualityChange(newValue);
                              },
                              close
                            )
                          )}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            {/* Hidden input to pass value to form */}
            <input type="hidden" name="imageQuality" value={selectedQuality} />
          </div>

          {/* Image Background Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MaterialSymbol icon="texture" size={18} />
              <label className="text-sm font-medium">Image Background</label>
            </div>
            <Popover className="relative w-full">
              {({ open, close }) => (
                <>
                  <Popover.Button
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors ${open ? "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-600" : ""} ${disableSelection ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={disableSelection}
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
                      {selectedBackground}
                    </span>
                    <MaterialSymbol
                      icon={open ? "expand_less" : "expand_more"}
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
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
                    <Popover.Panel className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                          Select Image Background
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {imageBackgrounds.map((background) =>
                            renderPopoverItem(
                              background,
                              selectedBackground,
                              background,
                              (newValue) => {
                                setSelectedBackground(newValue);
                                if (onBackgroundChange)
                                  onBackgroundChange(newValue);
                              },
                              close
                            )
                          )}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            {/* Hidden input to pass value to form */}
            <input
              type="hidden"
              name="imageBackground"
              value={selectedBackground}
            />
          </div>
        </>
      )}

      {/* --- Token Sliders (Existing) --- */}
      {showTokenSliders &&
        !showImageOptions && ( // Hide sliders if image options are shown
          <div className="space-y-3">
            {/* Dark mode: Adjust label text and icon */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MaterialSymbol icon="psychology" size={18} />
              <div className="flex justify-between items-center w-full">
                <label className="text-sm font-medium" htmlFor="thinkingPreset">
                  Thinking Level
                </label>
                {/* Dark mode: Adjust badge colors */}
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-600 rounded-full text-slate-600 dark:text-slate-200">
                  {selectedPreset}
                </span>
              </div>
            </div>
            {/* Dark mode: Adjust range slider track and thumb */}
            <input
              type="range"
              name="thinkingPreset"
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400"
              min="0"
              max={thinkingPresets.length - 1}
              value={thinkingPresets.findIndex(
                (p) => p.name === selectedPreset
              )}
              onChange={(e) => {
                const preset = thinkingPresets[parseInt(e.target.value)];
                onPresetChange(preset);
              }}
            />
            <input type="hidden" name="maxTokens" value={maxTokens || ""} />
            <input
              type="hidden"
              name="budgetTokens"
              value={budgetTokens || ""}
            />
          </div>
        )}
    </div>
  );
}
