import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { BadgeCheck, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  buildNotificationBadgeLabel,
} from "@/app/components/badge/accessibility";
import {
  calendarBadgeLabels,
  formatBrowniePoints,
  formatNotificationCount,
  priorityBadgeLabels,
  relationshipHealthLabels,
  resolveRelationshipHealthLevel,
  subscriptionBadgeLabels,
  type FiCalendarBadgeStatus,
  type FiPriorityLevel,
  type FiRelationshipHealthLevel,
  type FiSubscriptionStatus,
} from "@/app/components/badge/badgeDomain";
import {
  fiCalendarStatusClasses,
  fiPriorityLevelClasses,
  fiRelationshipHealthLevelClasses,
  fiSubscriptionStatusClasses,
  getFiBadgeClassName,
  type FiBadgeSize,
  type FiBadgeStatusTone,
} from "@/app/components/badge/badgeVariants";

export interface FiBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: FiBadgeSize;
  tone?: FiBadgeStatusTone;
  domainClass?: string;
  icon?: ReactNode;
  dot?: boolean;
  count?: boolean;
}

export const FiBadge = forwardRef<HTMLSpanElement, FiBadgeProps>(
  (
    {
      size = "sm",
      tone,
      domainClass,
      icon,
      dot = false,
      count = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          getFiBadgeClassName({
            size,
            tone,
            domainClass,
            dot,
            count,
            className,
          }),
        )}
        {...props}
      >
        {icon ? (
          <span className="fi-badge__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        {children}
      </span>
    );
  },
);

FiBadge.displayName = "FiBadge";

export interface FiStatusBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  tone?: FiBadgeStatusTone;
}

export const FiStatusBadge = forwardRef<HTMLSpanElement, FiStatusBadgeProps>(
  ({ tone = "neutral", ...props }, ref) => (
    <FiBadge ref={ref} tone={tone} {...props} />
  ),
);
FiStatusBadge.displayName = "FiStatusBadge";

export interface FiNotificationBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass"> {
  value?: number;
  labelContext?: string;
  showZero?: boolean;
}

export const FiNotificationBadge = forwardRef<HTMLSpanElement, FiNotificationBadgeProps>(
  (
    {
      value = 0,
      labelContext,
      showZero = false,
      dot = false,
      size = "sm",
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const resolvedLabel =
      ariaLabel ?? buildNotificationBadgeLabel(value, labelContext);

    if (dot) {
      return (
        <FiBadge
          ref={ref}
          dot
          size={size}
          className={className}
          aria-label={resolvedLabel}
          {...props}
        />
      );
    }

    if (value <= 0 && !showZero) return null;

    return (
      <FiBadge
        ref={ref}
        count
        size={size}
        className={className}
        aria-label={resolvedLabel}
        {...props}
      >
        {formatNotificationCount(value)}
      </FiBadge>
    );
  },
);
FiNotificationBadge.displayName = "FiNotificationBadge";

export interface FiBrowniePointsBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  points?: number;
}

export const FiBrowniePointsBadge = forwardRef<HTMLSpanElement, FiBrowniePointsBadgeProps>(
  ({ points, children, ...props }, ref) => (
    <FiBadge ref={ref} domainClass="fi-badge--brownie" {...props}>
      {children ?? (points != null ? formatBrowniePoints(points) : null)}
    </FiBadge>
  ),
);
FiBrowniePointsBadge.displayName = "FiBrowniePointsBadge";

export interface FiRelationshipHealthBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  level?: FiRelationshipHealthLevel;
  score?: number;
}

export const FiRelationshipHealthBadge = forwardRef<HTMLSpanElement, FiRelationshipHealthBadgeProps>(
  ({ level, score, children, ...props }, ref) => {
    const resolvedLevel = level ?? (score != null ? resolveRelationshipHealthLevel(score) : "Healthy");

    return (
      <FiBadge
        ref={ref}
        domainClass={fiRelationshipHealthLevelClasses[resolvedLevel]}
        {...props}
      >
        {children ?? relationshipHealthLabels[resolvedLevel]}
      </FiBadge>
    );
  },
);
FiRelationshipHealthBadge.displayName = "FiRelationshipHealthBadge";

export interface FiCalendarBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  status: FiCalendarBadgeStatus;
}

export const FiCalendarBadge = forwardRef<HTMLSpanElement, FiCalendarBadgeProps>(
  ({ status, children, ...props }, ref) => (
    <FiBadge ref={ref} domainClass={fiCalendarStatusClasses[status]} {...props}>
      {children ?? calendarBadgeLabels[status]}
    </FiBadge>
  ),
);
FiCalendarBadge.displayName = "FiCalendarBadge";

export interface FiPriorityBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  level: FiPriorityLevel;
}

export const FiPriorityBadge = forwardRef<HTMLSpanElement, FiPriorityBadgeProps>(
  ({ level, children, ...props }, ref) => (
    <FiBadge ref={ref} domainClass={fiPriorityLevelClasses[level]} {...props}>
      {children ?? priorityBadgeLabels[level]}
    </FiBadge>
  ),
);
FiPriorityBadge.displayName = "FiPriorityBadge";

export interface FiSubscriptionBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  status: FiSubscriptionStatus;
}

export const FiSubscriptionBadge = forwardRef<HTMLSpanElement, FiSubscriptionBadgeProps>(
  ({ status, children, ...props }, ref) => (
    <FiBadge ref={ref} domainClass={fiSubscriptionStatusClasses[status]} {...props}>
      {children ?? subscriptionBadgeLabels[status]}
    </FiBadge>
  ),
);
FiSubscriptionBadge.displayName = "FiSubscriptionBadge";

export interface FiAiBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  showIcon?: boolean;
}

export const FiAiBadge = forwardRef<HTMLSpanElement, FiAiBadgeProps>(
  ({ showIcon = true, children = "AI", ...props }, ref) => (
    <FiBadge
      ref={ref}
      domainClass="fi-badge--ai"
      icon={showIcon ? <Sparkles /> : undefined}
      {...props}
    >
      {children}
    </FiBadge>
  ),
);
FiAiBadge.displayName = "FiAiBadge";

export interface FiVerificationBadgeProps extends Omit<FiBadgeProps, "tone" | "domainClass" | "dot" | "count"> {
  verified?: boolean;
  showIcon?: boolean;
}

export const FiVerificationBadge = forwardRef<HTMLSpanElement, FiVerificationBadgeProps>(
  ({ verified = true, showIcon = true, children = "Verified", ...props }, ref) => {
    if (!verified) return null;

    return (
      <FiBadge
        ref={ref}
        domainClass="fi-badge--verification"
        icon={showIcon ? <BadgeCheck /> : undefined}
        {...props}
      >
        {children}
      </FiBadge>
    );
  },
);
FiVerificationBadge.displayName = "FiVerificationBadge";
