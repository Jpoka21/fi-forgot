import {
  fiNotificationFilterOptions,
  type FiNotificationFilterOption,
} from "@/app/notification/notificationDomain";
import { getFiNotificationFilterChipClassName } from "@/app/components/notification/notificationVariants";

const filterLabels: Record<FiNotificationFilterOption, string> = {
  all: "All",
  unread: "Unread",
  cards: "Cards",
  relationships: "Relationships",
  reminders: "Reminders",
  system: "System",
};

export interface FiNotificationFiltersProps {
  filter: FiNotificationFilterOption;
  onFilterChange: (filter: FiNotificationFilterOption) => void;
}

export function FiNotificationFilters({ filter, onFilterChange }: FiNotificationFiltersProps) {
  return (
    <div className="fi-notification-filters" role="group" aria-label="Filter notifications">
      {fiNotificationFilterOptions.map((option) => (
        <button
          key={option}
          type="button"
          className={getFiNotificationFilterChipClassName({ active: filter === option })}
          aria-pressed={filter === option}
          onClick={() => onFilterChange(option)}
        >
          {filterLabels[option]}
        </button>
      ))}
    </div>
  );
}
