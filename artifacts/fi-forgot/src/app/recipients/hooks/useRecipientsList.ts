import { useCallback, useEffect, useMemo, useState } from "react";

import { trackRecipientsListEvent } from "@/app/recipients/recipientsListAnalytics";
import {
  recipientsListDefaults,
  recipientsPageSize,
  type FiRecipientFilterId,
  type FiRecipientSortId,
} from "@/app/recipients/recipientsListDomain";
import {
  buildComingUpSoon,
  buildHealthById,
  filterRecipients,
  groupRecipients,
  paginateRecipients,
  sortRecipients,
} from "@/app/recipients/recipientsListEngine";
import {
  getArchivedRecipients,
  getRecipients,
  restoreRecipient,
  type Recipient,
} from "@/lib/data";
import { computeOverallHealth } from "@/lib/relationship-health";

export function useRecipientsList() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [archived, setArchived] = useState<Recipient[]>([]);
  const [search, setSearch] = useState("");
  const [filterId, setFilterId] = useState<FiRecipientFilterId>("all");
  const [sortId, setSortId] = useState<FiRecipientSortId>("name");
  const [visibleCount, setVisibleCount] = useState(recipientsPageSize);
  const [showArchived, setShowArchived] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    try {
      setRecipients(getRecipients());
      setArchived(getArchivedRecipients());
      setError(null);
    } catch {
      setError(recipientsListDefaults.errorLabel);
      trackRecipientsListEvent("recipients_list_error");
    }
  }, []);

  useEffect(() => {
    reload();
    trackRecipientsListEvent("recipients_list_opened");
  }, [reload]);

  const healthById = useMemo(() => {
    if (recipients.length === 0) return new Map();
    const health = computeOverallHealth(recipients);
    return buildHealthById(health.recipientHealths);
  }, [recipients]);

  const filtered = useMemo(
    () => sortRecipients(
      filterRecipients(recipients, search, filterId, healthById),
      sortId,
      healthById,
    ),
    [filterId, healthById, recipients, search, sortId],
  );

  const pagination = useMemo(
    () => paginateRecipients(filtered, visibleCount),
    [filtered, visibleCount],
  );

  const groups = useMemo(
    () => groupRecipients(pagination.visible),
    [pagination.visible],
  );

  const comingUpSoon = useMemo(
    () => buildComingUpSoon(filtered),
    [filtered],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setVisibleCount(recipientsPageSize);
    if (value.trim()) {
      trackRecipientsListEvent("recipients_list_searched", { query: value.trim() });
    }
  }, []);

  const handleFilterChange = useCallback((nextFilter: FiRecipientFilterId) => {
    setFilterId(nextFilter);
    setVisibleCount(recipientsPageSize);
    trackRecipientsListEvent("recipients_list_filtered", { filterId: nextFilter });
  }, []);

  const handleSortChange = useCallback((nextSort: FiRecipientSortId) => {
    setSortId(nextSort);
    trackRecipientsListEvent("recipients_list_sorted", { sortId: nextSort });
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + recipientsPageSize);
    trackRecipientsListEvent("recipients_list_load_more");
  }, []);

  const handleRestore = useCallback((recipientId: string) => {
    setRestoringId(recipientId);
    restoreRecipient(recipientId);
    reload();
    setRestoringId(null);
    trackRecipientsListEvent("recipients_list_restored", { recipientId });
  }, [reload]);

  return {
    recipients,
    archived,
    search,
    filterId,
    sortId,
    groups,
    comingUpSoon,
    filteredCount: filtered.length,
    hasMore: pagination.hasMore,
    showArchived,
    restoringId,
    error,
    isEmpty: recipients.length === 0,
    hasNoResults: recipients.length > 0 && filtered.length === 0,
    healthById,
    setSearch: handleSearchChange,
    setFilterId: handleFilterChange,
    setSortId: handleSortChange,
    setShowArchived,
    loadMore,
    restoreArchived: handleRestore,
    retry: reload,
  };
}

export type RecipientsListController = ReturnType<typeof useRecipientsList>;
