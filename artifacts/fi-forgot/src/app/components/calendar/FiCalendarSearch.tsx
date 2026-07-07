import { FiSearchInput } from "@/app/components/input/FiAutocomplete";
import { calendarDefaults } from "@/app/calendar/calendarDomain";

export interface FiCalendarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FiCalendarSearch({ value, onChange }: FiCalendarSearchProps) {
  return (
    <div className="fi-calendar__search">
      <FiSearchInput
        value={value}
        placeholder={calendarDefaults.searchPlaceholder}
        aria-label={calendarDefaults.searchAriaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
