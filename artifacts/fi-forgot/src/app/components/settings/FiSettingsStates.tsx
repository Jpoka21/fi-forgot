import type { ReactNode } from "react";

import { FiButton } from "@/app/components/button/FiButton";
import { FiCardLoadingSkeleton } from "@/app/components/loading/FiLoadingPresets";
import { FiSkeleton, FiSkeletonText } from "@/app/components/loading/FiSkeleton";
import { settingsVerificationDefaults } from "@/app/settings/settingsVerificationDomain";

export function FiSettingsPageLoading() {
  return (
    <div className="fi-settings-shell__loading" aria-busy="true" aria-live="polite">
      <span className="fi-settings-shell__visually-hidden">
        {settingsVerificationDefaults.loadingLabel}
      </span>
      <div className="fi-settings-shell__loading-header" aria-hidden>
        <FiSkeleton width="md" shape="line" />
        <FiSkeleton width="lg" shape="line" />
      </div>
      <div className="fi-settings-shell__loading-cards" aria-hidden>
        <FiCardLoadingSkeleton />
        <FiCardLoadingSkeleton />
        <FiCardLoadingSkeleton />
      </div>
    </div>
  );
}

export interface FiSettingsErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiSettingsErrorState({
  message = settingsVerificationDefaults.errorDescription,
  onRetry,
}: FiSettingsErrorStateProps) {
  return (
    <div className="fi-settings-shell__error" role="alert">
      <h2 className="fi-settings-shell__error-title">{settingsVerificationDefaults.errorTitle}</h2>
      <p className="fi-settings-shell__error-copy">{message}</p>
      {onRetry ? (
        <FiButton variant="primary" size="sm" onClick={onRetry}>
          {settingsVerificationDefaults.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}

export interface FiSettingsEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function FiSettingsEmptyState({
  title = settingsVerificationDefaults.emptyTitle,
  description = settingsVerificationDefaults.emptyDescription,
  action,
}: FiSettingsEmptyStateProps) {
  return (
    <div className="fi-settings-shell__empty">
      <h2 className="fi-settings-shell__empty-title">{title}</h2>
      <p className="fi-settings-shell__empty-copy">{description}</p>
      {action}
    </div>
  );
}

export function FiSettingsNavLoading() {
  return (
    <div className="fi-settings-shell__nav-loading" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <FiSkeleton key={index} shape="button" width="sm" />
      ))}
    </div>
  );
}

export function FiSettingsInlineLoading() {
  return (
    <div className="fi-settings-shell__inline-loading" aria-busy="true" aria-live="polite">
      <FiSkeletonText lines={2} />
    </div>
  );
}
