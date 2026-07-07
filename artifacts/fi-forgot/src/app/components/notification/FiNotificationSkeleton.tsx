import { motionUtilityClasses } from "@/app/design";
import { notificationUiDefaults } from "@/app/components/notification/notificationDomain";

export interface FiNotificationSkeletonProps {
  itemCount?: number;
}

export function FiNotificationSkeleton({ itemCount = 4 }: FiNotificationSkeletonProps) {
  return (
    <div
      className="fi-notification-skeleton"
      role="status"
      aria-live="polite"
      aria-label={notificationUiDefaults.loadingLabel}
    >
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index} className={`fi-notification-skeleton__row ${motionUtilityClasses.skeleton}`}>
          <div className={`fi-skeleton fi-skeleton--line fi-skeleton--width-md ${motionUtilityClasses.skeleton}`} aria-hidden />
          <div className={`fi-skeleton fi-skeleton--line fi-skeleton--width-full ${motionUtilityClasses.skeleton}`} aria-hidden />
          <div className={`fi-skeleton fi-skeleton--button ${motionUtilityClasses.skeleton}`} aria-hidden />
        </div>
      ))}
    </div>
  );
}
