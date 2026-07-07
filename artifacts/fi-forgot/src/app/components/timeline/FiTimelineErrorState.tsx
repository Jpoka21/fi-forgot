import { FiButton } from "@/app/components/button/FiButton";
import { timelineDefaults } from "@/app/timeline/timelineDomain";
import { timelineUiDefaults } from "@/app/components/timeline/timelineDomain";

export interface FiTimelineErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function FiTimelineErrorState({
  title = timelineDefaults.errorLabel,
  description = "Try again in a moment.",
  onRetry,
}: FiTimelineErrorStateProps) {
  return (
    <div className="fi-timeline-error-state" role="alert">
      <h3 className="fi-timeline-error-state__title">{title}</h3>
      <p className="fi-timeline-error-state__description">{description}</p>
      {onRetry ? (
        <FiButton variant="secondary" onClick={onRetry}>
          {timelineUiDefaults.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}

export function FiTimelineSearchEmptyState() {
  return (
    <div className="fi-timeline-error-state" role="status">
      <h3 className="fi-timeline-error-state__title">{timelineUiDefaults.searchEmptyTitle}</h3>
      <p className="fi-timeline-error-state__description">
        {timelineUiDefaults.searchEmptyDescription}
      </p>
    </div>
  );
}
