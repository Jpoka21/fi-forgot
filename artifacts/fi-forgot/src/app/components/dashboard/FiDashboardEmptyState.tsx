import { FiDashboardEmptyState as FiDashboardEmptyStatePreset } from "@/app/components/empty-state/FiEmptyStatePresets";
import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";

export interface FiDashboardEmptyStateProps {
  onAddPerson?: () => void;
}

export function FiDashboardPanelEmptyState({ onAddPerson }: FiDashboardEmptyStateProps) {
  return (
    <FiDashboardEmptyStatePreset
      contained={false}
      onPrimaryAction={() => {
        trackDashboardEvent("dashboard_empty_cta_clicked", { actionId: "add-person" });
        onAddPerson?.();
      }}
      primaryHref={onAddPerson ? undefined : "/recipients/new"}
    />
  );
}
