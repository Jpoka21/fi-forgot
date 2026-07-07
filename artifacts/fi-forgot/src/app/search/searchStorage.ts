import type { FiRecentSearchEntry } from "@/app/search/searchDomain";
import { searchDefaults } from "@/app/search/searchDomain";

const RECENT_SEARCHES_KEY = "fi-forgot-recent-searches";

function readRecentSearches(): FiRecentSearchEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FiRecentSearchEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(entries: FiRecentSearchEntry[]): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(entries.slice(0, searchDefaults.maxRecentSearches)),
  );
}

export function getRecentSearches(): FiRecentSearchEntry[] {
  return readRecentSearches()
    .sort((a, b) => b.searchedAt - a.searchedAt)
    .slice(0, searchDefaults.maxDisplayedRecentSearches);
}

export function addRecentSearch(query: string): FiRecentSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();

  const next = [
    { query: trimmed, searchedAt: Date.now() },
    ...readRecentSearches().filter((entry) => entry.query.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, searchDefaults.maxRecentSearches);

  writeRecentSearches(next);
  return getRecentSearches();
}

export function removeRecentSearch(query: string): FiRecentSearchEntry[] {
  const next = readRecentSearches().filter(
    (entry) => entry.query.toLowerCase() !== query.trim().toLowerCase(),
  );
  writeRecentSearches(next);
  return getRecentSearches();
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_SEARCHES_KEY);
}
