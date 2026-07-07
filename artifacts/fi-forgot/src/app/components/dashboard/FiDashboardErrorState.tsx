import { FiButton } from "@/app/components/button/FiButton";
import { dashboardDefaults } from "@/app/dashboard/dashboardDomain";
import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";

export interface FiDashboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiDashboardErrorState({
  message = dashboardDefaults.errorLabel,
  onRetry,
}: FiDashboardErrorStateProps) {
  return (
    <div className="fi-dashboard__summary-card" role="alert">
      <h2 className="fi-dashboard__section-title">{message}</h2>
      {onRetry ? (
        <FiButton
          variant="secondary"
          size="sm"
          onClick={() => {
            trackDashboardEvent("dashboard_retry_clicked");
            onRetry();
          }}
        >
          {dashboardDefaults.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
