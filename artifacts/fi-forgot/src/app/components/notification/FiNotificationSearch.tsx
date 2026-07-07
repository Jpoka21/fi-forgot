import { FiSearchInput } from "@/app/components/input/FiAutocomplete";
import { notificationDefaults } from "@/app/notification/notificationDomain";

export interface FiNotificationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FiNotificationSearch({ value, onChange }: FiNotificationSearchProps) {
  return (
    <div className="fi-notification-search">
      <FiSearchInput
        value={value}
        placeholder={notificationDefaults.searchPlaceholder}
        aria-label={notificationDefaults.searchAriaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
