import { useState, useEffect } from "react";
import { Model } from "@prisma/client";
import { APIVendor } from "@/app/_lib/model";

interface ModelState {
  selectedModel: string;
  selectedModelVendor: string;
  showFileUpload: boolean;
  showMCPTools: boolean;
  showTokenSliders: boolean;
}

interface UseModelStateProps {
  models: Model[];
  apiVendors: APIVendor[];
  initialModelId?: number;
}

export function useModelState({
  models,
  apiVendors,
  initialModelId,
}: UseModelStateProps): ModelState & {
  updateSelectedModel: (modelId: string) => void;
} {
  const [selectedModel, setSelectedModel] = useState<string>(
    initialModelId?.toString() ??
      (models.length > 0 ? models[0].id.toString() : "")
  );
  const [selectedModelVendor, setSelectedModelVendor] = useState<string>("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showMCPTools, setShowMCPTools] = useState(false);
  const [showTokenSliders, setShowTokenSliders] = useState(false);

  useEffect(() => {
    if (selectedModel !== "") {
      const model = models.find((model) => model.id === Number(selectedModel));

      if (model) {
        const vendor = apiVendors.find((v) => v.id === model.apiVendorId);

        setSelectedModelVendor(vendor?.name || "");
        setShowMCPTools(vendor?.name === "anthropic");
        setShowFileUpload(!!model.isVision);
        setShowTokenSliders(!!model.isThinking);
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
    updateSelectedModel,
  };
}
