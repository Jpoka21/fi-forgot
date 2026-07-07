import { FiAiConciergeEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import { aiDefaults } from "@/app/ai/aiDomain";

export interface FiAiPanelEmptyStateProps {
  onAddPerson?: () => void;
}

export function FiAiPanelEmptyState({ onAddPerson }: FiAiPanelEmptyStateProps) {
  return (
    <FiAiConciergeEmptyState
      contained={false}
      title={aiDefaults.emptyTitle}
      description={aiDefaults.emptyDescription}
      onPrimaryAction={onAddPerson}
      primaryHref={onAddPerson ? undefined : "/recipients/new"}
    />
  );
}
