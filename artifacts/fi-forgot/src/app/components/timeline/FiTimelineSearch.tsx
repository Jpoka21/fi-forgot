import { FiSearchInput } from "@/app/components/input/FiAutocomplete";
import { timelineDefaults } from "@/app/timeline/timelineDomain";

export interface FiTimelineSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FiTimelineSearch({ value, onChange }: FiTimelineSearchProps) {
  return (
    <div className="fi-timeline__search">
      <FiSearchInput
        value={value}
        placeholder={timelineDefaults.searchPlaceholder}
        aria-label={timelineDefaults.searchAriaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
