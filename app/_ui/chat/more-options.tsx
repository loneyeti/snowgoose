import { MCPTool } from "@prisma/client";
import { OutputFormat } from "../../_lib/model";
import SelectBox from "@/app/_ui/select-box";
import React from "react";
import { MaterialSymbol } from "react-material-symbols";

interface ThinkingPreset {
  name: string;
  maxTokens: number;
  budgetTokens: number | null;
}

interface MoreOptionsProps {
  outputFormats: OutputFormat[];
  mcpTools: MCPTool[];
  currentOutputFormat?: number;
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
}

export default function MoreOptions({
  outputFormats,
  mcpTools,
  currentOutputFormat,
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
}: MoreOptionsProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-slate-800 border-b pb-2 mb-3">
        Advanced Options
      </h3>

      {/* Output Format Selection - Enhanced */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-700">
          <MaterialSymbol icon="format_align_left" size={18} />
          <label className="text-sm font-medium" htmlFor="outputFormat">
            Output Format
          </label>
        </div>
        <div className="relative">
          <div className="px-3 py-2 bg-white rounded-md border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <SelectBox
              name="outputFormat"
              disableSelection={disableSelection}
              defaultValue={currentOutputFormat ?? 0}
              onChangeFunction={onOutputFormatChange}
              hide={false}
            >
              {outputFormats.map((format: OutputFormat) => (
                <option value={format.id} key={format.id}>
                  {format.name}
                </option>
              ))}
            </SelectBox>
          </div>
        </div>
      </div>

      {/* MCP Tools - Enhanced */}
      {showMCPTools && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <MaterialSymbol icon="build" size={18} />
            <label className="text-sm font-medium" htmlFor="mcpTool">
              MCP Tool
            </label>
          </div>
          <div className="relative">
            <div className="px-3 py-2 bg-white rounded-md border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
              <SelectBox
                name="mcpTool"
                disableSelection={disableSelection}
                defaultValue={0}
                onChangeFunction={onMCPToolChange}
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
          </div>
        </div>
      )}

      {/* File Upload section removed - Now handled in TextInputArea */}

      {/* Token Sliders - Enhanced */}
      {showTokenSliders && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <MaterialSymbol icon="psychology" size={18} />
            <div className="flex justify-between items-center w-full">
              <label className="text-sm font-medium" htmlFor="thinkingPreset">
                Thinking Level
              </label>
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                {selectedPreset}
              </span>
            </div>
          </div>
          <input
            type="range"
            name="thinkingPreset"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            min="0"
            max={thinkingPresets.length - 1}
            value={thinkingPresets.findIndex((p) => p.name === selectedPreset)}
            onChange={(e) => {
              const preset = thinkingPresets[parseInt(e.target.value)];
              onPresetChange(preset);
            }}
          />
          <input type="hidden" name="maxTokens" value={maxTokens || ""} />
          <input type="hidden" name="budgetTokens" value={budgetTokens || ""} />
        </div>
      )}
    </div>
  );
}
