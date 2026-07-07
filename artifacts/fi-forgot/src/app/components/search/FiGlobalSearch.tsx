import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { FiSearchEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import { FiSearchSkeleton } from "@/app/components/loading/FiLoadingPresets";
import { FiSearchErrorState } from "@/app/components/search/FiSearchErrorState";
import { FiSearchFilters } from "@/app/components/search/FiSearchFilters";
import { FiSearchResults } from "@/app/components/search/FiSearchResults";
import { FiSearchSuggestions } from "@/app/components/search/FiSearchSuggestions";
import { buildSearchDialogLabel } from "@/app/components/search/accessibility";
import { searchUiDefaults } from "@/app/components/search/searchDomain";
import { getFiGlobalSearchClassName } from "@/app/components/search/searchVariants";
import { getSearchShortcutHint } from "@/app/search/hooks/useSearchKeyboardShortcut";
import type { GlobalSearchController } from "@/app/search/hooks/useGlobalSearch";
import { searchDefaults, type FiSearchResult } from "@/app/search/searchDomain";

export interface FiGlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: GlobalSearchController;
  onNavigate: (result: FiSearchResult) => void;
  commandPaletteEnabled?: boolean;
}

function useIsMobileSearch(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function FiGlobalSearch({
  open,
  onOpenChange,
  search,
  onNavigate,
  commandPaletteEnabled = false,
}: FiGlobalSearchProps) {
  const dialogId = useId();
  const titleId = useId();
  const isMobile = useIsMobileSearch();

  const flatResults = search.results;
  const selectedIndex = Math.max(
    0,
    flatResults.findIndex((result) => result.id === search.selectedId),
  );

  const dialogLabel = useMemo(
    () => buildSearchDialogLabel(commandPaletteEnabled ? "command" : "search"),
    [commandPaletteEnabled],
  );

  const moveSelection = useCallback(
    (direction: 1 | -1) => {
      if (flatResults.length === 0) return;
      const nextIndex = (selectedIndex + direction + flatResults.length) % flatResults.length;
      search.setSelectedId(flatResults[nextIndex]?.id);
    },
    [flatResults, search, selectedIndex],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (flatResults.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1);
      }

      if (event.key === "Enter") {
        const selected = flatResults[selectedIndex];
        if (selected) {
          event.preventDefault();
          onNavigate(selected);
        }
      }
    },
    [flatResults, moveSelection, onNavigate, onOpenChange, selectedIndex],
  );

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  const statusMessage = search.isSearching
    ? "Searching"
    : search.showEmpty
      ? searchDefaults.emptyLabel
      : search.showResults
        ? `${flatResults.length} results`
        : "Search suggestions";

  return (
    <div
      className="fi-global-search-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(getFiGlobalSearchClassName({ mobile: isMobile }))}
        onKeyDown={handleKeyDown}
      >
        <span id={titleId} className="sr-only">
          {dialogLabel}
        </span>

        <div className="fi-command-palette__input-wrap">
          <Search aria-hidden />
          <input
            className="fi-command-palette__input"
            value={search.query}
            placeholder={searchDefaults.placeholder}
            aria-label={searchDefaults.placeholder}
            autoFocus
            onChange={(event) => search.setQuery(event.target.value)}
          />
        </div>

        <FiSearchFilters
          filter={search.filter}
          sort={search.sort}
          onFilterChange={search.setFilter}
          onSortChange={search.setSort}
        />

        <div className="fi-global-search__panel">
          <p className="fi-global-search__status" aria-live="polite">
            {statusMessage}
          </p>

          {search.error ? <FiSearchErrorState onRetry={search.retry} /> : null}

          {search.isSearching ? <FiSearchSkeleton itemCount={3} /> : null}

          {search.showDiscovery && !search.error ? (
            <FiSearchSuggestions
              suggestions={search.suggestions}
              recentSearches={search.recentSearches}
              popularQueries={search.popularSearches}
              onSuggestionSelect={search.setQuery}
              onRecentSelect={search.setQuery}
              onRecentRemove={search.removeRecentSearch}
              onClearRecent={search.clearRecentSearches}
            />
          ) : null}

          {search.showEmpty && !search.error ? (
            <FiSearchEmptyState
              contained={false}
              onPrimaryAction={() => search.setQuery("")}
            />
          ) : null}

          {search.showResults && !search.error ? (
            <FiSearchResults
              results={flatResults}
              query={search.debouncedQuery}
              selectedId={search.selectedId}
              onSelect={onNavigate}
            />
          ) : null}
        </div>

        <div className="fi-global-search__footer-links">
          <a href={searchDefaults.viewAllHref} className="fi-global-search__link-button">
            {searchUiDefaults.viewAllLabel}
          </a>
        </div>
        <p className="fi-global-search__footer">
          {isMobile
            ? searchUiDefaults.mobileFooterHint
            : `${searchUiDefaults.desktopFooterHint} · ${getSearchShortcutHint()}`}
          {commandPaletteEnabled ? ` · ${searchUiDefaults.commandModeLabel}` : ""}
        </p>
      </div>
    </div>
  );
}
