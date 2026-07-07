import { FiRecipientEmptyState as FiRecipientEmptyStatePreset } from "@/app/components/empty-state/FiEmptyStatePresets";

export interface FiRecipientPanelEmptyStateProps {
  onAddPerson?: () => void;
}

export function FiRecipientPanelEmptyState({ onAddPerson }: FiRecipientPanelEmptyStateProps) {
  return (
    <FiRecipientEmptyStatePreset
      contained={false}
      onPrimaryAction={onAddPerson}
      primaryHref={onAddPerson ? undefined : "/recipients/new"}
    />
  );
}
