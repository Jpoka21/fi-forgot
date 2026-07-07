import { FiAiConciergeEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";

export interface FiConciergeSuggestionsEmptyStateProps {
  onAddPerson?: () => void;
}

export function FiConciergeSuggestionsEmptyState({
  onAddPerson,
}: FiConciergeSuggestionsEmptyStateProps) {
  return (
    <FiAiConciergeEmptyState
      contained={false}
      onPrimaryAction={onAddPerson}
      primaryHref={onAddPerson ? undefined : "/recipients/new"}
    />
  );
}
