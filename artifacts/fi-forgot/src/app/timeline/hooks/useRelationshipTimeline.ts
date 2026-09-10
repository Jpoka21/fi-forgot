import { useCallback, useEffect, useMemo, useState } from "react";

import { timelineService } from "@/app/api/services/timelineService";
import { useDebouncedValue } from "@/app/search/hooks/useDebouncedValue";
import { trackTimelineEvent } from "@/app/timeline/timelineAnalytics";
import { applyTimelineMutationOutcome, runTimelineMutation } from "@/app/timeline/relationshipTimelineMutation";
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
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, timelineDefaults.debounceMs);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!enabled || !recipientId) return false;

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
        setMutationError(null);
        trackTimelineEvent(options.silent ? "timeline_refreshed" : "timeline_loaded", {
          recipientId,
        });
        return true;
      } catch (refreshError) {
        if (options.silent) {
          setMutationError("The current timeline could not be refreshed. Your existing view may be stale; try again.");
        } else {
          setError(timelineDefaults.errorLabel);
        }
        trackTimelineEvent("timeline_error", { recipientId });
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
        return false;
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
      const evidenceId=items.find((item)=>item.id===itemId)?.evidenceId;
      if(!evidenceId){setMutationError("This timeline item has no mutable source record.");return;}
      const outcome=await runTimelineMutation(()=>timelineService.archiveAnswer(recipientId,evidenceId),()=>timelineService.getTimeline(recipientId),(value)=>value.items.some((item)=>item.evidenceId===evidenceId&&item.isArchived));
      applyTimelineMutationOutcome("archive",outcome,{setItems,setMutationError,onConfirmed:()=>{
        setConfirmArchiveId(null);
        trackTimelineEvent("timeline_item_archived", { recipientId, itemId });
      }});
    },
    [items, recipientId, refresh],
  );

  const handleEditSave = useCallback(
    async (itemId: string, answerText: string) => {
      const evidenceId=items.find((item)=>item.id===itemId)?.evidenceId;
      if(!evidenceId){setMutationError("This timeline item has no mutable source record.");return;}
      const outcome=await runTimelineMutation(()=>timelineService.editAnswer(recipientId,evidenceId,answerText),()=>timelineService.getTimeline(recipientId),(value)=>value.items.some((item)=>item.evidenceId===evidenceId&&item.summary===answerText.trim()));
      applyTimelineMutationOutcome("edit",outcome,{setItems,setMutationError,onConfirmed:()=>{
        setEditingId(null);
        trackTimelineEvent("timeline_item_edited", { recipientId, itemId });
      }});
    },
    [items, recipientId, refresh],
  );

  const handleRestore = useCallback(async (itemId: string) => {
    const evidenceId=items.find((item)=>item.id===itemId)?.evidenceId;
    if(!evidenceId){setMutationError("This timeline item has no mutable source record.");return;}
    const outcome=await runTimelineMutation(()=>timelineService.restoreAnswer(recipientId,evidenceId),()=>timelineService.getTimeline(recipientId),(value)=>value.items.some((item)=>item.evidenceId===evidenceId&&!item.isArchived));
    applyTimelineMutationOutcome("restore",outcome,{setItems,setMutationError,onConfirmed:()=>{
      trackTimelineEvent("timeline_item_restored", { recipientId, itemId });
    }});
  }, [items, recipientId, refresh]);

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
    mutationError,
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
    restoreItem: handleRestore,
  };
}

export type RelationshipTimelineController = ReturnType<typeof useRelationshipTimeline>;
