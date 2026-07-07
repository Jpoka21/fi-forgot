import { FiSearchInput } from "@/app/components/input/FiAutocomplete";
import { FiSelect } from "@/app/components/input/FiSelect";
import {
  recipientFilterOptions,
  recipientSortOptions,
  recipientsListDefaults,
  type FiRecipientFilterId,
  type FiRecipientSortId,
} from "@/app/recipients/recipientsListDomain";

export interface FiRecipientsToolbarProps {
  search: string;
  filterId: FiRecipientFilterId;
  sortId: FiRecipientSortId;
  showSearch: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterId: FiRecipientFilterId) => void;
  onSortChange: (sortId: FiRecipientSortId) => void;
}

export function FiRecipientsToolbar({
  search,
  filterId,
  sortId,
  showSearch,
  onSearchChange,
  onFilterChange,
  onSortChange,
}: FiRecipientsToolbarProps) {
  if (!showSearch) return null;

  return (
    <div className="fi-recipients__toolbar">
      <FiSearchInput
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={recipientsListDefaults.searchPlaceholder}
        aria-label="Search your people"
      />

      <div className="fi-recipients__controls">
        <div className="fi-recipients__filter-group" role="group" aria-label="Filter people">
          {recipientFilterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`fi-recipients__chip${filterId === option.id ? " fi-recipients__chip--active" : ""}`}
              aria-pressed={filterId === option.id}
              onClick={() => onFilterChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <FiSelect
          value={sortId}
          onChange={(event) => onSortChange(event.target.value as FiRecipientSortId)}
          aria-label="Sort people"
        >
          {recipientSortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </FiSelect>
      </div>
    </div>
  );
}
