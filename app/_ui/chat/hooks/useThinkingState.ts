import { useState, useEffect } from "react";

export interface ThinkingPreset {
  name: string;
  maxTokens: number;
  budgetTokens: number | null;
}

interface ThinkingState {
  selectedPreset: string;
  maxTokens: number | null;
  budgetTokens: number | null;
}

const DEFAULT_THINKING_PRESETS: ThinkingPreset[] = [
  { name: "Thinking Off", maxTokens: 8192, budgetTokens: null },
  { name: "Quick Thinking", maxTokens: 8192, budgetTokens: 4096 },
  { name: "Long Thinking", maxTokens: 16384, budgetTokens: 8192 },
];

interface UseThinkingStateProps {
  showTokenSliders: boolean;
  initialPreset?: string;
  initialMaxTokens?: number | null;
  initialBudgetTokens?: number | null;
}

export function useThinkingState({
  showTokenSliders,
  initialPreset = "Thinking Off",
  initialMaxTokens = null,
  initialBudgetTokens = null,
}: UseThinkingStateProps): ThinkingState & {
  updatePreset: (preset: ThinkingPreset) => void;
  thinkingPresets: ThinkingPreset[];
} {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [maxTokens, setMaxTokens] = useState<number | null>(initialMaxTokens);
  const [budgetTokens, setBudgetTokens] = useState<number | null>(
    initialBudgetTokens
  );

  useEffect(() => {
    if (!showTokenSliders) {
      // Reset to default values when thinking mode is disabled
      const defaultPreset = DEFAULT_THINKING_PRESETS[0];
      setSelectedPreset(defaultPreset.name);
      setMaxTokens(null);
      setBudgetTokens(null);
    }
  }, [showTokenSliders]);

  const updatePreset = (preset: ThinkingPreset) => {
    setSelectedPreset(preset.name);
    setMaxTokens(preset.maxTokens);
    setBudgetTokens(preset.budgetTokens);
  };

  return {
    selectedPreset,
    maxTokens,
    budgetTokens,
    updatePreset,
    thinkingPresets: DEFAULT_THINKING_PRESETS,
  };
}
