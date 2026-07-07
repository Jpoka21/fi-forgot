import {
  fiTimelineFilterOptions,
  type FiTimelineFilterOption,
} from "@/app/timeline/timelineDomain";
import { getFiTimelineFilterChipClassName } from "@/app/components/timeline/timelineVariants";

const filterLabels: Record<FiTimelineFilterOption, string> = {
  all: "All",
  influences_cards: "Used in cards",
  profile: "Profile",
  briefings: "Briefings",
  cards: "Cards",
  archived: "Archived",
};

export interface FiTimelineFiltersProps {
  filter: FiTimelineFilterOption;
  onFilterChange: (filter: FiTimelineFilterOption) => void;
}

export function FiTimelineFilters({ filter, onFilterChange }: FiTimelineFiltersProps) {
  return (
    <div className="fi-timeline__filters" role="group" aria-label="Filter timeline memories">
      {fiTimelineFilterOptions.map((option) => (
        <button
          key={option}
          type="button"
          className={getFiTimelineFilterChipClassName({ active: filter === option })}
          aria-pressed={filter === option}
          onClick={() => onFilterChange(option)}
        >
          {filterLabels[option]}
        </button>
      ))}
    </div>
  );
}
