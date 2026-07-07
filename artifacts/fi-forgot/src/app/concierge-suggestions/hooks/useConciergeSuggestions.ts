import { useCallback, useEffect, useState } from "react";

import { trackConciergeSuggestionsEvent } from "@/app/concierge-suggestions/conciergeSuggestionsAnalytics";
import { conciergeSuggestionsDefaults } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import { useAuth } from "@/lib/auth-context";

export interface UseConciergeSuggestionsOptions {
  enabled?: boolean;
}

export function useConciergeSuggestions(options: UseConciergeSuggestionsOptions = {}) {
  const { enabled = true } = options;
  const { user } = useAuth();

  const [suggestions, setSuggestions] = useState<FiConciergeSuggestion[]>([]);
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
        const nextSuggestions = loadConciergeSuggestions(user?.email);
        setSuggestions(nextSuggestions);
        setError(null);
        trackConciergeSuggestionsEvent(
          optionsArg.silent ? "concierge_suggestions_refreshed" : "concierge_suggestions_loaded",
          { count: nextSuggestions.length },
        );
      } catch (refreshError) {
        setError(conciergeSuggestionsDefaults.errorLabel);
        trackConciergeSuggestionsEvent("concierge_suggestions_error");
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

  const showEmpty = !isLoading && !error && suggestions.length === 0;

  return {
    suggestions,
    isLoading,
    isRefreshing,
    error,
    showEmpty,
    refresh,
  };
}

export type ConciergeSuggestionsController = ReturnType<typeof useConciergeSuggestions>;
