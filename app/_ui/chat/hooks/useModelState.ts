import { useState, useEffect } from "react";
import { Model } from "@prisma/client";
import { APIVendor } from "@/app/_lib/model";

interface ModelState {
  selectedModel: string;
  selectedModelVendor: string;
  showFileUpload: boolean;
  showMCPTools: boolean;
  showTokenSliders: boolean;
  showWebSearchToggle: boolean;
  showImageGenerationToggle: boolean;
  showOpenAIReasoningOptions: boolean;
}

interface UseModelStateProps {
  models: Model[];
  apiVendors: APIVendor[];
  initialModelId?: number;
  systemDefaultModelId?: number | null;
}

export function useModelState({
  models,
  apiVendors,
  initialModelId,
  systemDefaultModelId,
}: UseModelStateProps): ModelState & {
  updateSelectedModel: (modelId: string) => void;
} {
  // Resolution order: history's model, then the admin-configured system
  // default (if it still exists), then the first model in the list.
  const systemDefaultModel =
    systemDefaultModelId != null &&
    models.some((model) => model.id === systemDefaultModelId)
      ? systemDefaultModelId
      : undefined;

  const [selectedModel, setSelectedModel] = useState<string>(
    initialModelId?.toString() ??
      systemDefaultModel?.toString() ??
      (models.length > 0 ? models[0].id.toString() : "")
  );

  // Fix: Sync internal state when initialModelId changes (e.g. loading history)
  useEffect(() => {
    if (initialModelId !== undefined) {
      setSelectedModel(initialModelId.toString());
    }
  }, [initialModelId]);

  const [selectedModelVendor, setSelectedModelVendor] = useState<string>("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showMCPTools, setShowMCPTools] = useState(false);
  const [showTokenSliders, setShowTokenSliders] = useState(false);
  const [showWebSearchToggle, setShowWebSearchToggle] = useState(false);
  const [showImageGenerationToggle, setShowImageGenerationToggle] =
    useState(false);
  const [showOpenAIReasoningOptions, setShowOpenAIReasoningOptions] =
    useState(false);

  useEffect(() => {
    if (selectedModel !== "") {
      const model = models.find((model) => model.id === Number(selectedModel));
      if (model) {
        const vendor = apiVendors.find((v) => v.id === model.apiVendorId);
        setSelectedModelVendor(vendor?.name || "");
        setShowMCPTools(vendor?.name === "anthropic");
        setShowFileUpload(!!model.isVision);
        setShowTokenSliders(!!model.isThinking);
        setShowWebSearchToggle(model.isWebSearch ?? false);
        setShowImageGenerationToggle(model.isImageGeneration);
        setShowOpenAIReasoningOptions(
          vendor?.name === "openai" && !!model.isThinking
        );
      }
    }
  }, [selectedModel, models, apiVendors]);

  const updateSelectedModel = (modelId: string) => {
    setSelectedModel(modelId);
  };

  return {
    selectedModel,
    selectedModelVendor,
    showFileUpload,
    showMCPTools,
    showTokenSliders,
    showWebSearchToggle,
    showImageGenerationToggle,
    showOpenAIReasoningOptions,
    updateSelectedModel,
  };
}
