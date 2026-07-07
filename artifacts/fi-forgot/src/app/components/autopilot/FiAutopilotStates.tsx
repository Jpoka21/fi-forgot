import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiRecipientLoadingSkeleton } from "@/app/components/recipient/FiRecipientSkeleton";
import { autopilotDefaults } from "@/app/autopilot/autopilotDomain";

export function FiAutopilotLoadingState() {
  return <FiRecipientLoadingSkeleton />;
}

export interface FiAutopilotErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiAutopilotErrorState({
  message = autopilotDefaults.errorLabel,
  onRetry,
}: FiAutopilotErrorStateProps) {
  return (
    <div className="fi-autopilot__error" role="alert">
      <p className="fi-autopilot__section-copy">{message}</p>
      {onRetry ? (
        <FiButton variant="primary" size="sm" onClick={onRetry}>
          {autopilotDefaults.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}

export function FiAutopilotOfflineState() {
  return (
    <div className="fi-autopilot__offline" role="alert">
      <p className="fi-autopilot__section-copy">{autopilotDefaults.offlineLabel}</p>
    </div>
  );
}

export function FiAutopilotEmptyState() {
  return (
    <div className="fi-autopilot__empty">
      <h2 className="fi-autopilot__section-title">{autopilotDefaults.emptyTitle}</h2>
      <p className="fi-autopilot__section-copy">{autopilotDefaults.emptyDescription}</p>
      <FiButton asChild variant="primary">
        <Link href="/recipients/new">{autopilotDefaults.addPersonLabel}</Link>
      </FiButton>
    </div>
  );
}
