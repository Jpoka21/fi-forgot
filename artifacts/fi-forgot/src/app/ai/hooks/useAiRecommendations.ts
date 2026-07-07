import { useCallback, useEffect, useState } from "react";

import { trackAiEvent } from "@/app/ai/aiAnalytics";
import { aiDefaults, type FiAiRecommendation } from "@/app/ai/aiDomain";
import { loadAiRecommendations } from "@/app/ai/aiEngine";
import { useAuth } from "@/lib/auth-context";

export interface UseAiRecommendationsOptions {
  enabled?: boolean;
}

export function useAiRecommendations(options: UseAiRecommendationsOptions = {}) {
  const { enabled = true } = options;
  const { user } = useAuth();

  const [recommendations, setRecommendations] = useState<FiAiRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (optionsArg: { silent?: boolean } = {}) => {
      if (!enabled) return;

      if (optionsArg.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const nextRecommendations = loadAiRecommendations(user?.email);
        setRecommendations(nextRecommendations);
        setError(null);
        trackAiEvent(
          optionsArg.silent ? "ai_recommendations_refreshed" : "ai_recommendations_loaded",
          { count: nextRecommendations.length },
        );
      } catch (refreshError) {
        setError(aiDefaults.errorLabel);
        trackAiEvent("ai_recommendations_error");
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled, user?.email],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showEmpty = !isLoading && !error && recommendations.length === 0;

  return {
    recommendations,
    isLoading,
    isRefreshing,
    error,
    showEmpty,
    refresh,
  };
}

export type AiRecommendationsController = ReturnType<typeof useAiRecommendations>;
