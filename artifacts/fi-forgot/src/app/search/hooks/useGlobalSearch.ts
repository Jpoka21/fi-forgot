import { useCallback, useEffect, useMemo, useState } from "react";

import { trackSearchEvent } from "@/app/search/searchAnalytics";
import { runGlobalSearch } from "@/app/search/searchEngine";
import {
  defaultSearchSuggestions,
  popularSearches,
  searchDefaults,
  type FiSearchFilterOption,
  type FiSearchResult,
  type FiSearchSortOption,
} from "@/app/search/searchDomain";
import { useDebouncedValue } from "@/app/search/hooks/useDebouncedValue";
import { useRecentSearches } from "@/app/search/hooks/useRecentSearches";

export interface UseGlobalSearchOptions {
  enabled?: boolean;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { enabled = true } = options;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FiSearchFilterOption>("all");
  const [sort, setSort] = useState<FiSearchSortOption>("relevance");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebouncedValue(query, searchDefaults.debounceMs);
  const { recentSearches, recordSearch, removeSearch, clearAll } = useRecentSearches();

  const results = useMemo(() => {
    if (!enabled) return [] as FiSearchResult[];

    try {
      return runGlobalSearch(debouncedQuery, { filter, sort });
    } catch (searchError) {
      if (import.meta.env.DEV) {
        console.error(searchError);
      }
      return [] as FiSearchResult[];
    }
  }, [debouncedQuery, enabled, filter, sort]);

  useEffect(() => {
    if (!enabled) return;
    setIsSearching(query.trim().length > 0 && query !== debouncedQuery);
  }, [debouncedQuery, enabled, query]);

  useEffect(() => {
    if (!enabled) return;

    if (query !== debouncedQuery) return;

    if (debouncedQuery.trim()) {
      trackSearchEvent("search_query", { query: debouncedQuery, filter, sort });
    }

    setError(null);
    setSelectedId(results[0]?.id);
  }, [debouncedQuery, enabled, filter, query, results, sort]);

  const handleQueryChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setError(null);
  }, []);

  const handleFilterChange = useCallback((nextFilter: FiSearchFilterOption) => {
    setFilter(nextFilter);
    trackSearchEvent("search_filter_changed", { filter: nextFilter });
  }, []);

  const handleSortChange = useCallback((nextSort: FiSearchSortOption) => {
    setSort(nextSort);
    trackSearchEvent("search_sort_changed", { sort: nextSort });
  }, []);

  const handleResultSelect = useCallback(
    (result: FiSearchResult) => {
      if (debouncedQuery.trim()) {
        recordSearch(debouncedQuery);
      }

      trackSearchEvent("search_result_selected", {
        query: debouncedQuery,
        resultId: result.id,
        entityType: result.entityType,
      });
    },
    [debouncedQuery, recordSearch],
  );

  const retry = useCallback(() => {
    setError(null);
    try {
      runGlobalSearch(debouncedQuery, { filter, sort });
    } catch (retryError) {
      setError(searchDefaults.errorLabel);
      trackSearchEvent("search_error", { query: debouncedQuery });
      if (import.meta.env.DEV) {
        console.error(retryError);
      }
    }
  }, [debouncedQuery, filter, sort]);

  const showDiscovery = debouncedQuery.trim().length === 0;
  const showEmpty = !showDiscovery && !isSearching && results.length === 0 && !error;
  const showResults = !showDiscovery && !isSearching && results.length > 0 && !error;

  return {
    query,
    debouncedQuery,
    filter,
    sort,
    results,
    selectedId,
    setSelectedId,
    isSearching,
    error,
    showDiscovery,
    showEmpty,
    showResults,
    suggestions: defaultSearchSuggestions,
    popularSearches,
    recentSearches,
    setQuery: handleQueryChange,
    setFilter: handleFilterChange,
    setSort: handleSortChange,
    handleResultSelect,
    recordSearch,
    removeRecentSearch: removeSearch,
    clearRecentSearches: clearAll,
    retry,
    setError,
  };
}

export type GlobalSearchController = ReturnType<typeof useGlobalSearch>;
