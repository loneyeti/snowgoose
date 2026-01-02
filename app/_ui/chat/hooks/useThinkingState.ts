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

  // Fix: Sync internal state when initial values change
  useEffect(() => {
    if (initialMaxTokens !== null) {
      setMaxTokens(initialMaxTokens);
    }
    if (initialBudgetTokens !== null) {
      setBudgetTokens(initialBudgetTokens);
    }

    if (initialMaxTokens !== null) {
      const matched = DEFAULT_THINKING_PRESETS.find(
        (p) =>
          p.maxTokens === initialMaxTokens &&
          p.budgetTokens === initialBudgetTokens
      );
      if (matched) {
        setSelectedPreset(matched.name);
      } else {
        setSelectedPreset("Custom");
      }
    } else if (initialPreset) {
      setSelectedPreset(initialPreset);
    }
  }, [initialMaxTokens, initialBudgetTokens, initialPreset]);

  // Reset to defaults if sliders are hidden (model changed to non-thinking)
  useEffect(() => {
    if (!showTokenSliders) {
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
