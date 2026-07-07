import { calendarFilterLabels, calendarFilterOptions, type FiCalendarFilter } from "@/app/calendar/calendarDomain";
import { getFiCalendarFilterChipClassName } from "@/app/components/calendar/calendarVariants";

export interface FiCalendarFiltersProps {
  filter: FiCalendarFilter;
  onFilterChange: (filter: FiCalendarFilter) => void;
}

export function FiCalendarFilters({ filter, onFilterChange }: FiCalendarFiltersProps) {
  return (
    <div className="fi-calendar__filters" role="group" aria-label="Filter calendar events">
      {calendarFilterOptions.map((option) => (
        <button
          key={option}
          type="button"
          className={getFiCalendarFilterChipClassName({ active: filter === option })}
          aria-pressed={filter === option}
          onClick={() => onFilterChange(option)}
        >
          {calendarFilterLabels[option]}
        </button>
      ))}
    </div>
  );
}
