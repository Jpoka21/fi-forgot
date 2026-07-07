import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { FiNotificationBadge } from "@/app/components/badge/FiBadge";
import { buildNotificationDrawerLabel } from "@/app/components/notification/accessibility";

export interface FiNotificationCenterTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount?: number;
}

export const FiNotificationCenterTrigger = forwardRef<
  HTMLButtonElement,
  FiNotificationCenterTriggerProps
>(({ unreadCount = 0, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn("fi-notification-center-trigger", className)}
    aria-label={buildNotificationDrawerLabel(unreadCount)}
    {...props}
  >
    <Bell aria-hidden />
    <FiNotificationBadge value={unreadCount} showZero={false} />
  </button>
));

FiNotificationCenterTrigger.displayName = "FiNotificationCenterTrigger";
