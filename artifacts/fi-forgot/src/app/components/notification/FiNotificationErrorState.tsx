import { FiButton } from "@/app/components/button/FiButton";
import { notificationDefaults } from "@/app/notification/notificationDomain";
import { notificationUiDefaults } from "@/app/components/notification/notificationDomain";

export interface FiNotificationErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function FiNotificationErrorState({
  title = notificationDefaults.errorLabel,
  description = "Try again in a moment.",
  onRetry,
}: FiNotificationErrorStateProps) {
  return (
    <div className="fi-notification-error-state" role="alert">
      <h3 className="fi-notification-error-state__title">{title}</h3>
      <p className="fi-notification-error-state__description">{description}</p>
      {onRetry ? (
        <FiButton variant="secondary" onClick={onRetry}>
          Try again
        </FiButton>
      ) : null}
    </div>
  );
}

export function FiNotificationSearchEmptyState() {
  return (
    <div className="fi-notification-error-state" role="status">
      <h3 className="fi-notification-error-state__title">
        {notificationUiDefaults.searchEmptyTitle}
      </h3>
      <p className="fi-notification-error-state__description">
        {notificationUiDefaults.searchEmptyDescription}
      </p>
    </div>
  );
}
