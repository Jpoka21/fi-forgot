import {
  fiSearchFilterOptions,
  fiSearchSortOptions,
  type FiSearchFilterOption,
  type FiSearchSortOption,
} from "@/app/search/searchDomain";
import { getFiSearchFilterChipClassName } from "@/app/components/search/searchVariants";
import { searchUiDefaults } from "@/app/components/search/searchDomain";

const filterLabels: Record<FiSearchFilterOption, string> = {
  all: "All",
  people: "People",
  timeline: "Timeline",
  cards: "Cards",
  occasions: "Occasions",
  notifications: "Notifications",
  concierge: "Concierge",
  settings: "Settings",
  actions: "Actions",
};

const sortLabels: Record<FiSearchSortOption, string> = {
  relevance: "Most relevant",
  recent: "Most recent",
  alphabetical: "A–Z",
};

export interface FiSearchFiltersProps {
  filter: FiSearchFilterOption;
  sort: FiSearchSortOption;
  onFilterChange: (filter: FiSearchFilterOption) => void;
  onSortChange: (sort: FiSearchSortOption) => void;
}

export function FiSearchFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: FiSearchFiltersProps) {
  return (
    <div className="fi-global-search__toolbar">
      <div className="fi-global-search__filters" role="group" aria-label={searchUiDefaults.filtersLabel}>
        <span className="fi-global-search__filters-label">{searchUiDefaults.filtersLabel}</span>
        {fiSearchFilterOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={getFiSearchFilterChipClassName({ active: filter === option })}
            aria-pressed={filter === option}
            onClick={() => onFilterChange(option)}
          >
            {filterLabels[option]}
          </button>
        ))}
      </div>

      <div className="fi-global-search__sort">
        <label className="fi-global-search__sort-label" htmlFor="fi-search-sort">
          {searchUiDefaults.sortLabel}
        </label>
        <select
          id="fi-search-sort"
          className="fi-search-filter-chip"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as FiSearchSortOption)}
        >
          {fiSearchSortOptions.map((option) => (
            <option key={option} value={option}>
              {sortLabels[option]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
