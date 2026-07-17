import { useState, useEffect } from "react";

export type ThinkingEffort = "low" | "medium" | "high" | "xhigh" | "max";

export interface ThinkingPreset {
  name: string;
  maxTokens: number;
  budgetTokens: number | null;
  // Explicit effort level to pass to snowgander's adaptive-thinking Anthropic
  // models (Opus 4.6+, Sonnet 4.6+, Fable 5, Mythos 5). budgetTokens alone
  // can only reach the adapter's auto-derived "medium"/"high" ceiling, so
  // presets carry an explicit effort to unlock "xhigh"/"max". Ignored by
  // legacy-thinking models and non-Anthropic vendors.
  effort?: ThinkingEffort;
}

interface ThinkingState {
  selectedPreset: string;
  maxTokens: number | null;
  budgetTokens: number | null;
  effort: ThinkingEffort | undefined;
}

const DEFAULT_THINKING_PRESETS: ThinkingPreset[] = [
  { name: "Thinking Off", maxTokens: 8192, budgetTokens: null, effort: undefined },
  { name: "Quick Thinking", maxTokens: 8192, budgetTokens: 4096, effort: "low" },
  { name: "Balanced Thinking", maxTokens: 16384, budgetTokens: 8192, effort: "medium" },
  { name: "Long Thinking", maxTokens: 32768, budgetTokens: 16384, effort: "high" },
  { name: "Deep Thinking", maxTokens: 65536, budgetTokens: 32768, effort: "xhigh" },
  { name: "Maximum Thinking", maxTokens: 128000, budgetTokens: 65536, effort: "max" },
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
  const [effort, setEffort] = useState<ThinkingEffort | undefined>(undefined);

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
        setEffort(matched.effort);
      } else {
        setSelectedPreset("Custom");
        setEffort(undefined);
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
      setEffort(undefined);
    }
  }, [showTokenSliders]);

  const updatePreset = (preset: ThinkingPreset) => {
    setSelectedPreset(preset.name);
    setMaxTokens(preset.maxTokens);
    setBudgetTokens(preset.budgetTokens);
    setEffort(preset.effort);
  };

  return {
    selectedPreset,
    maxTokens,
    budgetTokens,
    effort,
    updatePreset,
    thinkingPresets: DEFAULT_THINKING_PRESETS,
  };
}
