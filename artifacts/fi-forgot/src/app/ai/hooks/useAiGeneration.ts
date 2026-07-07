import { useCallback, useEffect, useRef, useState } from "react";

import { trackAiEvent } from "@/app/ai/aiAnalytics";
import { aiDefaults } from "@/app/ai/aiDomain";
import {
  aiGenerationSteps,
  type FiAiGenerationStepId,
} from "@/app/components/progress/progressDomain";

const DEFAULT_STEP_INTERVAL_MS = 2400;

export interface UseAiGenerationOptions {
  stepIntervalMs?: number;
}

export function useAiGeneration(options: UseAiGenerationOptions = {}) {
  const { stepIntervalMs = DEFAULT_STEP_INTERVAL_MS } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startStepCycle = useCallback(() => {
    clearTimer();
    setStepIndex(0);
    timerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        return next >= aiGenerationSteps.length ? aiGenerationSteps.length - 1 : next;
      });
    }, stepIntervalMs);
  }, [clearTimer, stepIntervalMs]);

  const stopStepCycle = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const run = useCallback(
    async (generate: () => Promise<void>) => {
      setIsGenerating(true);
      setError(null);
      startStepCycle();
      trackAiEvent("ai_generation_started");

      try {
        await generate();
        trackAiEvent("ai_generation_completed");
      } catch (generationError) {
        setError(aiDefaults.errorLabel);
        trackAiEvent("ai_generation_failed");
        if (import.meta.env.DEV) {
          console.error(generationError);
        }
      } finally {
        stopStepCycle();
        setIsGenerating(false);
      }
    },
    [startStepCycle, stopStepCycle],
  );

  const retry = useCallback(
    (generate: () => Promise<void>) => {
      trackAiEvent("ai_generation_retried");
      void run(generate);
    },
    [run],
  );

  const stepId = aiGenerationSteps[stepIndex]?.id as FiAiGenerationStepId | undefined;

  return {
    isGenerating,
    stepIndex,
    stepId,
    error,
    run,
    retry,
    clearError: () => setError(null),
  };
}

export type AiGenerationController = ReturnType<typeof useAiGeneration>;
