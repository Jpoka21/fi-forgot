import { Clock, Sparkles, TrendingUp, X } from "lucide-react";

import { trackSearchEvent } from "@/app/search/searchAnalytics";
import type {
  FiRecentSearchEntry,
  FiSearchSuggestion,
} from "@/app/search/searchDomain";
import { FiSearchResultItem } from "@/app/components/search/FiSearchResultItem";
import { searchUiDefaults } from "@/app/components/search/searchDomain";

export interface FiSearchSuggestionsProps {
  suggestions: FiSearchSuggestion[];
  recentSearches: FiRecentSearchEntry[];
  popularQueries: ReadonlyArray<{ query: string; label: string }>;
  onSuggestionSelect: (query: string) => void;
  onRecentSelect: (query: string) => void;
  onRecentRemove: (query: string) => void;
  onClearRecent: () => void;
}

export function FiSearchSuggestions({
  suggestions,
  recentSearches,
  popularQueries,
  onSuggestionSelect,
  onRecentSelect,
  onRecentRemove,
  onClearRecent,
}: FiSearchSuggestionsProps) {
  return (
    <div className="fi-global-search__suggestions">
      <section className="fi-global-search__suggestions" aria-label={searchUiDefaults.suggestionsLabel}>
        <h3 className="fi-global-search__section-title">{searchUiDefaults.suggestionsLabel}</h3>
        {suggestions.map((suggestion) => (
          <FiSearchResultItem
            key={suggestion.id}
            id={suggestion.id}
            label={suggestion.label}
            description={suggestion.description}
            icon={<Sparkles aria-hidden />}
            onSelect={() => {
              trackSearchEvent("search_suggestion_selected", { query: suggestion.query, source: suggestion.id });
              onSuggestionSelect(suggestion.query);
            }}
          />
        ))}
      </section>

      {recentSearches.length > 0 ? (
        <section className="fi-global-search__recent" aria-label={searchUiDefaults.recentLabel}>
          <div className="fi-global-search__section-header">
            <h3 className="fi-global-search__section-title">{searchUiDefaults.recentLabel}</h3>
            <button type="button" className="fi-global-search__link-button" onClick={onClearRecent}>
              {searchUiDefaults.clearRecentLabel}
            </button>
          </div>
          {recentSearches.map((entry) => (
            <FiSearchResultItem
              key={entry.query}
              id={`recent-${entry.query}`}
              label={entry.query}
              description="Recent search"
              icon={<Clock aria-hidden />}
              action={
                <button
                  type="button"
                  aria-label={`Remove ${entry.query} from recent searches`}
                  onClick={(event) => {
                    event.stopPropagation();
                    trackSearchEvent("search_recent_removed", { query: entry.query });
                    onRecentRemove(entry.query);
                  }}
                >
                  <X aria-hidden />
                </button>
              }
              onSelect={() => {
                trackSearchEvent("search_recent_selected", { query: entry.query });
                onRecentSelect(entry.query);
              }}
            />
          ))}
        </section>
      ) : null}

      <section className="fi-global-search__popular" aria-label={searchUiDefaults.popularLabel}>
        <h3 className="fi-global-search__section-title">{searchUiDefaults.popularLabel}</h3>
        {popularQueries.map((entry) => (
          <FiSearchResultItem
            key={entry.query}
            id={`popular-${entry.query}`}
            label={entry.label}
            description={entry.query}
            icon={<TrendingUp aria-hidden />}
            onSelect={() => onSuggestionSelect(entry.query)}
          />
        ))}
      </section>
    </div>
  );
}
