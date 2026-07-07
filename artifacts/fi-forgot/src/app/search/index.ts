export {
  defaultSearchSuggestions,
  fiSearchEntityTypes,
  fiSearchFilterOptions,
  fiSearchSortOptions,
  popularSearches,
  searchDefaults,
  searchFilterEntityMap,
  searchGroupLabels,
  staticSearchIndex,
} from "@/app/search/searchDomain";
export type {
  FiRecentSearchEntry,
  FiSearchEntityType,
  FiSearchFilterOption,
  FiSearchResult,
  FiSearchSortOption,
  FiSearchSuggestion,
} from "@/app/search/searchDomain";

export { runGlobalSearch, buildSearchIndex } from "@/app/search/searchEngine";
export type { RunGlobalSearchOptions } from "@/app/search/searchEngine";

export { splitSearchHighlight, normalizeSearchQuery } from "@/app/search/searchHighlight";
export type { FiSearchHighlightSegment } from "@/app/search/searchHighlight";

export {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "@/app/search/searchStorage";

export {
  subscribeToSearchAnalytics,
  trackSearchEvent,
} from "@/app/search/searchAnalytics";
export type {
  FiSearchAnalyticsEvent,
  FiSearchAnalyticsPayload,
} from "@/app/search/searchAnalytics";

export { SearchProvider, useSearchContext } from "@/app/search/SearchProvider";
export { GlobalSearchHost } from "@/app/search/GlobalSearchHost";

export { useDebouncedValue } from "@/app/search/hooks/useDebouncedValue";
export { useGlobalSearch } from "@/app/search/hooks/useGlobalSearch";
export type { GlobalSearchController, UseGlobalSearchOptions } from "@/app/search/hooks/useGlobalSearch";
export { useRecentSearches } from "@/app/search/hooks/useRecentSearches";
export { buildDynamicSearchIndex } from "@/app/search/searchIndexBuilders";

export {
  searchPageDefaults,
  searchPageHref,
  SEARCH_API_INTEGRATION_POINTS,
} from "@/app/search/searchPageDomain";

export { useSearchPage } from "@/app/search/hooks/useSearchPage";
export type { SearchPageController } from "@/app/search/hooks/useSearchPage";

export {
  getSearchShortcutHint,
  useSearchKeyboardShortcut,
} from "@/app/search/hooks/useSearchKeyboardShortcut";
