import { useCallback, useEffect, useState } from "react";

import { trackRecipientEvent } from "@/app/recipient/recipientAnalytics";
import { recipientDefaults, type FiRecipientProfileSnapshot } from "@/app/recipient/recipientDomain";
import { loadRecipientProfile } from "@/app/recipient/recipientEngine";
import { timelineService } from "@/app/api/services/timelineService";
import { normalizeTimelineItem } from "@/app/timeline/timelineDomain";
import type { FiTimelineItem } from "@/app/timeline/timelineDomain";

export interface UseRecipientProfileOptions {
  recipientId: string;
  enabled?: boolean;
}

export function useRecipientProfile({ recipientId, enabled = true }: UseRecipientProfileOptions) {
  const [profile, setProfile] = useState<FiRecipientProfileSnapshot | null>(null);
  const [timelinePreview, setTimelinePreview] = useState<FiTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (optionsArg: { silent?: boolean } = {}) => {
      if (!enabled || !recipientId) return;

      if (optionsArg.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const snapshot = loadRecipientProfile(recipientId);
        if (!snapshot) {
          setProfile(null);
          setTimelinePreview([]);
          setError(recipientDefaults.notFoundLabel);
          return;
        }

        setProfile(snapshot);
        setError(null);

        try {
          const response = await timelineService.getTimeline(recipientId);
          const preview = (response.items ?? [])
            .map((item) => normalizeTimelineItem(item))
            .filter((item): item is FiTimelineItem => item !== null)
            .slice(0, 3);
          setTimelinePreview(preview);
        } catch {
          setTimelinePreview([]);
        }

        trackRecipientEvent(
          optionsArg.silent ? "recipient_refreshed" : "recipient_loaded",
          { recipientId },
        );
      } catch (refreshError) {
        setError(recipientDefaults.errorLabel);
        trackRecipientEvent("recipient_error", { recipientId });
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled, recipientId],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showEmpty = !isLoading && !error && profile == null;

  return {
    profile,
    timelinePreview,
    isLoading,
    isRefreshing,
    error,
    showEmpty,
    refresh,
  };
}

export type RecipientProfileController = ReturnType<typeof useRecipientProfile>;
