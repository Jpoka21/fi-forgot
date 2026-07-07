import { useCallback, useEffect, useMemo, useState } from "react";

import { trackRelationshipHealthEvent } from "@/app/relationship-health/relationshipHealthAnalytics";
import {
  buildImprovementSuggestions,
  fetchRecipientHealthScores,
  loadClientOverallHealth,
  loadClientRecipientHealth,
  loadScoreTrend,
  resolveTrendDirection,
} from "@/app/relationship-health/relationshipHealthEngine";
import { relationshipHealthDefaults } from "@/app/relationship-health/relationshipHealthDomain";
import type { FiRecipientHealthScore } from "@/app/relationship-health/relationshipHealthDomain";
import type { OverallHealth, RecipientHealth } from "@/lib/relationship-health";

export interface UseRelationshipHealthOptions {
  enabled?: boolean;
}

export function useRelationshipHealth(options: UseRelationshipHealthOptions = {}) {
  const { enabled = true } = options;

  const [overall, setOverall] = useState<OverallHealth | null>(null);
  const [apiScores, setApiScores] = useState<FiRecipientHealthScore[]>([]);
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
        const clientOverall = loadClientOverallHealth();
        setOverall(clientOverall);

        try {
          const scores = await fetchRecipientHealthScores();
          setApiScores(scores);
        } catch {
          setApiScores([]);
        }

        setError(null);
        trackRelationshipHealthEvent(
          optionsArg.silent ? "relationship_health_refreshed" : "relationship_health_loaded",
          { score: clientOverall.score },
        );
      } catch (refreshError) {
        setError(relationshipHealthDefaults.errorLabel);
        trackRelationshipHealthEvent("relationship_health_error");
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trend = useMemo(() => loadScoreTrend(), [overall]);
  const trendDirection = useMemo(() => resolveTrendDirection(trend), [trend]);
  const suggestions = useMemo(
    () => (overall ? buildImprovementSuggestions(overall) : []),
    [overall],
  );

  const showEmpty = !isLoading && !error && (overall?.recipientHealths.length ?? 0) === 0;

  return {
    overall,
    apiScores,
    trend,
    trendDirection,
    suggestions,
    isLoading,
    isRefreshing,
    error,
    showEmpty,
    refresh,
  };
}

export type RelationshipHealthController = ReturnType<typeof useRelationshipHealth>;

export interface UseRecipientRelationshipHealthOptions {
  recipientId: string;
  enabled?: boolean;
}

export function useRecipientRelationshipHealth({
  recipientId,
  enabled = true,
}: UseRecipientRelationshipHealthOptions) {
  const account = useRelationshipHealth({ enabled });

  const recipientHealth = useMemo(
    () => loadClientRecipientHealth(recipientId),
    [recipientId, account.isLoading, account.isRefreshing],
  );

  const apiScore = useMemo(
    () => account.apiScores.find((score) => score.recipientId === recipientId) ?? null,
    [account.apiScores, recipientId],
  );

  const showEmpty =
    enabled && !account.isLoading && !account.error && recipientHealth == null;

  return {
    ...account,
    recipientHealth,
    apiScore,
    showEmpty,
  };
}

export type RecipientRelationshipHealthController = ReturnType<typeof useRecipientRelationshipHealth>;

export type { OverallHealth, RecipientHealth };
