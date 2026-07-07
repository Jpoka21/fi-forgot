import { useCallback, useEffect, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

import { FiSearchEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import { FiSearchSkeleton } from "@/app/components/loading/FiLoadingPresets";
import { FiSearchErrorState } from "@/app/components/search/FiSearchErrorState";
import { FiSearchFilters } from "@/app/components/search/FiSearchFilters";
import { FiSearchResults } from "@/app/components/search/FiSearchResults";
import { FiSearchSuggestions } from "@/app/components/search/FiSearchSuggestions";
import { useSearchPage } from "@/app/search/hooks/useSearchPage";
import { getSearchShortcutHint } from "@/app/search/hooks/useSearchKeyboardShortcut";
import type { SearchPageController } from "@/app/search/hooks/useSearchPage";
import {
  fiSearchEntityTypes,
  searchDefaults,
  searchGroupLabels,
  type FiSearchResult,
} from "@/app/search/searchDomain";

function SearchCategoriesPanel({ defaults }: { defaults: SearchPageController["defaults"] }) {
  return (
    <section className="fi-search-page__panel" aria-labelledby="search-categories-title">
      <h2 id="search-categories-title" className="fi-search-page__section-title">
        {defaults.categoriesTitle}
      </h2>
      <p className="fi-search-page__subtitle">{defaults.categoriesDescription}</p>
      <ul className="fi-search-page__categories" aria-label="Search categories">
        {fiSearchEntityTypes.map((type) => (
          <li key={type} className="fi-search-page__category-chip">
            {searchGroupLabels[type]}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FiSearchPage() {
  const [, setLocation] = useLocation();
  const search = useSearchPage();

  const handleNavigate = useCallback(
    (result: FiSearchResult) => {
      search.handleResultSelect(result);
      if (result.href) {
        setLocation(result.href);
      }
    },
    [search, setLocation],
  );

  const flatResults = search.results;
  const selectedIndex = Math.max(
    0,
    flatResults.findIndex((result) => result.id === search.selectedId),
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
          handleNavigate(selected);
        }
      }
    },
    [flatResults, handleNavigate, moveSelection, selectedIndex],
  );

  useEffect(() => {
    document.getElementById("search-main")?.focus();
  }, []);

  const statusMessage = search.isSearching
    ? "Searching"
    : search.showEmpty
      ? searchDefaults.emptyLabel
      : search.showResults
        ? `${flatResults.length} results`
        : "Search suggestions";

  return (
    <div id="search-main" className="fi-search-page" tabIndex={-1} onKeyDown={handleKeyDown}>
      <header className="fi-search-page__header">
        <h1 className="fi-search-page__title">{search.defaults.title}</h1>
        <p className="fi-search-page__subtitle">{search.defaults.subtitle}</p>
      </header>

      <section className="fi-search-page__shortcut-card" aria-labelledby="search-shortcuts-title">
        <h2 id="search-shortcuts-title" className="fi-search-page__section-title">
          {search.defaults.keyboardTitle}
        </h2>
        <p className="fi-search-page__subtitle">{search.defaults.keyboardDescription}</p>
        <p className="fi-search-page__shortcut-kbd">
          <kbd>{getSearchShortcutHint()}</kbd>
        </p>
      </section>

      <div className="fi-search-page__panel">
        <label className="fi-search-page__input-wrap" htmlFor="fi-search-page-input">
          <Search aria-hidden />
          <input
            id="fi-search-page-input"
            className="fi-search-page__input"
            value={search.query}
            placeholder={searchDefaults.placeholder}
            aria-label={search.defaults.inputLabel}
            onChange={(event) => search.setQuery(event.target.value)}
          />
        </label>

        <FiSearchFilters
          filter={search.filter}
          sort={search.sort}
          onFilterChange={search.setFilter}
          onSortChange={search.setSort}
        />

        <p className="fi-search-page__status" aria-live="polite">
          {statusMessage}
        </p>

        {search.error ? <FiSearchErrorState onRetry={search.retry} /> : null}
        {search.isSearching ? <FiSearchSkeleton itemCount={4} /> : null}

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
          <FiSearchEmptyState contained={false} onPrimaryAction={() => search.setQuery("")} />
        ) : null}

        {search.showResults && !search.error ? (
          <FiSearchResults
            results={flatResults}
            query={search.debouncedQuery}
            selectedId={search.selectedId}
            onSelect={handleNavigate}
          />
        ) : null}
      </div>

      <SearchCategoriesPanel defaults={search.defaults} />
    </div>
  );
}
