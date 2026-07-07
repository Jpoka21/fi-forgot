import { useCallback, useEffect, useMemo, useState } from "react";

import { timelineService } from "@/app/api/services/timelineService";
import { useDebouncedValue } from "@/app/search/hooks/useDebouncedValue";
import { trackTimelineEvent } from "@/app/timeline/timelineAnalytics";
import {
  filterTimelineItems,
  groupTimelineByMonth,
  paginateTimelineItems,
  searchTimelineItems,
} from "@/app/timeline/timelineEngine";
import {
  normalizeTimelineItem,
  timelineDefaults,
  type FiTimelineFilterOption,
  type FiTimelineItem,
} from "@/app/timeline/timelineDomain";

export interface UseRelationshipTimelineOptions {
  recipientId: string;
  enabled?: boolean;
}

export function useRelationshipTimeline({
  recipientId,
  enabled = true,
}: UseRelationshipTimelineOptions) {
  const [items, setItems] = useState<FiTimelineItem[]>([]);
  const [filter, setFilter] = useState<FiTimelineFilterOption>("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState<number>(timelineDefaults.pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, timelineDefaults.debounceMs);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!enabled || !recipientId) return;

      if (options.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await timelineService.getTimeline(recipientId);
        const normalized = (response.items ?? [])
          .map((item) => normalizeTimelineItem(item))
          .filter((item): item is FiTimelineItem => item !== null);

        setItems(normalized);
        setError(null);
        trackTimelineEvent(options.silent ? "timeline_refreshed" : "timeline_loaded", {
          recipientId,
        });
      } catch (refreshError) {
        setError(timelineDefaults.errorLabel);
        trackTimelineEvent("timeline_error", { recipientId });
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

  useEffect(() => {
    if (!enabled) return;

    const handleSaved = () => {
      void refresh({ silent: true });
    };

    window.addEventListener("recipient-answer-saved", handleSaved);
    return () => window.removeEventListener("recipient-answer-saved", handleSaved);
  }, [enabled, refresh]);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    trackTimelineEvent("timeline_search", { recipientId, query: debouncedQuery });
  }, [debouncedQuery, recipientId]);

  const filteredItems = useMemo(() => {
    const filtered = filterTimelineItems(items, filter);
    return searchTimelineItems(filtered, debouncedQuery);
  }, [debouncedQuery, filter, items]);

  const { visibleItems, hasMore } = useMemo(
    () => paginateTimelineItems(filteredItems, visibleCount),
    [filteredItems, visibleCount],
  );

  const groupedItems = useMemo(
    () => groupTimelineByMonth(visibleItems),
    [visibleItems],
  );

  const handleFilterChange = useCallback(
    (nextFilter: FiTimelineFilterOption) => {
      setFilter(nextFilter);
      setVisibleCount(timelineDefaults.pageSize);
      trackTimelineEvent("timeline_filter_changed", { recipientId, filter: nextFilter });
    },
    [recipientId],
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((current) => current + timelineDefaults.pageSize);
    trackTimelineEvent("timeline_load_more", {
      recipientId,
      visibleCount: visibleCount + timelineDefaults.pageSize,
    });
  }, [recipientId, visibleCount]);

  const handleArchive = useCallback(
    async (itemId: string) => {
      setItems((current) =>
        current.map((item) => (item.id === itemId ? { ...item, isArchived: true } : item)),
      );
      setConfirmArchiveId(null);

      try {
        await timelineService.archiveAnswer(recipientId, itemId);
        trackTimelineEvent("timeline_item_archived", { recipientId, itemId });
      } catch (archiveError) {
        if (import.meta.env.DEV) {
          console.error(archiveError);
        }
        await refresh({ silent: true });
      }
    },
    [recipientId, refresh],
  );

  const handleEditSave = useCallback(
    async (itemId: string, answerText: string) => {
      setItems((current) =>
        current.map((item) => (item.id === itemId ? { ...item, summary: answerText } : item)),
      );
      setEditingId(null);

      try {
        await timelineService.editAnswer(recipientId, itemId, answerText);
        trackTimelineEvent("timeline_item_edited", { recipientId, itemId });
      } catch (editError) {
        if (import.meta.env.DEV) {
          console.error(editError);
        }
        await refresh({ silent: true });
      }
    },
    [recipientId, refresh],
  );

  const showEmpty = !isLoading && !error && filteredItems.length === 0;
  const showResults = !isLoading && !error && filteredItems.length > 0;

  return {
    items,
    filteredItems,
    visibleItems,
    groupedItems,
    filter,
    query,
    debouncedQuery,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    editingId,
    confirmArchiveId,
    showEmpty,
    showResults,
    setQuery,
    setFilter: handleFilterChange,
    setEditingId,
    setConfirmArchiveId,
    refresh,
    loadMore: handleLoadMore,
    archiveItem: handleArchive,
    saveEdit: handleEditSave,
  };
}

export type RelationshipTimelineController = ReturnType<typeof useRelationshipTimeline>;
