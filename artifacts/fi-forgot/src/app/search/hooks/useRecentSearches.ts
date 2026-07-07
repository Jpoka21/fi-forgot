import { useCallback, useSyncExternalStore } from "react";

import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "@/app/search/searchStorage";
import type { FiRecentSearchEntry } from "@/app/search/searchDomain";

let recentSnapshot = getRecentSearches();
const listeners = new Set<() => void>();

function emitRecentChange(): void {
  recentSnapshot = getRecentSearches();
  listeners.forEach((listener) => listener());
}

function subscribeRecent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRecentSnapshot(): FiRecentSearchEntry[] {
  return recentSnapshot;
}

export function useRecentSearches() {
  const recentSearches = useSyncExternalStore(subscribeRecent, getRecentSnapshot, getRecentSnapshot);

  const recordSearch = useCallback((query: string) => {
    addRecentSearch(query);
    emitRecentChange();
  }, []);

  const removeSearch = useCallback((query: string) => {
    removeRecentSearch(query);
    emitRecentChange();
  }, []);

  const clearAll = useCallback(() => {
    clearRecentSearches();
    emitRecentChange();
  }, []);

  return {
    recentSearches,
    recordSearch,
    removeSearch,
    clearAll,
  };
}
