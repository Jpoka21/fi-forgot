import { FiCalendarEmptyState as FiCalendarEmptyStatePreset } from "@/app/components/empty-state/FiEmptyStatePresets";

export interface FiCalendarPanelEmptyStateProps {
  onAddDate?: () => void;
}

export function FiCalendarPanelEmptyState({ onAddDate }: FiCalendarPanelEmptyStateProps) {
  return (
    <FiCalendarEmptyStatePreset
      contained={false}
      onPrimaryAction={onAddDate}
      primaryHref={onAddDate ? undefined : "/recipients/new"}
    />
  );
}
