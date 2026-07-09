import { useCallback, useEffect, useRef, useState } from "react";

import { recipientService } from "@/app/api/services/recipientService";
import type { ProductBrainDecision } from "@/app/product-brain/productBrainDecisionTypes";
import {
  resolveProfileQuestion,
  type NextQuestionApiResponse,
} from "@/app/relationship-profile/resolveProfileQuestion";
import type { ProfileQuestionViewModel } from "@/app/relationship-profile/profileQuestionViewModel";
import { getApiHeaders, getRecipient } from "@/lib/data";

export type ProfileQuestionStatus = "idle" | "loading" | "success" | "error";

export function useProfileQuestion(recipientId: string, enabled: boolean, authReady: boolean) {
  const [profileQuestion, setProfileQuestion] = useState<ProfileQuestionViewModel | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [status, setStatus] = useState<ProfileQuestionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const generationRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled || !recipientId || !authReady) {
      setProfileQuestion(null);
      setStatus("idle");
      setErrorMessage(null);
      return;
    }

    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setStatus("loading");
    setErrorMessage(null);

    const recipient = getRecipient(recipientId);

    try {
      const resolution = await resolveProfileQuestion(
        async () => {
          const result = await recipientService.getBrainDecision(recipientId);
          if (!result.ok || !result.data) return null;
          return result.data as ProductBrainDecision;
        },
        async () => {
          const result = await recipientService.getNextQuestion(recipientId);
          if (!result.ok || !result.data) return null;
          return result.data as NextQuestionApiResponse;
        },
        recipient,
      );

      if (generation !== generationRef.current) return;

      setProfileQuestion(resolution.profileQuestion);
      setProfileComplete(resolution.profileComplete ?? false);
      setProfileScore(resolution.profileScore ?? 0);
      setStatus("success");
    } catch {
      if (generation !== generationRef.current) return;
      setProfileQuestion(null);
      setStatus("error");
      setErrorMessage("Failed to load profile question.");
    }
  }, [authReady, enabled, recipientId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    generationRef.current += 1;
    setProfileQuestion(null);
  }, [recipientId]);

  return {
    profileQuestion,
    profileComplete,
    profileScore,
    status,
    errorMessage,
    refresh,
  };
}
