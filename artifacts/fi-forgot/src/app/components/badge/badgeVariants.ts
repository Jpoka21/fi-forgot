import { radiusUtilityClasses, typographyUtilityClasses } from "@/app/design";

import type {
  FiCalendarBadgeStatus,
  FiPriorityLevel,
  FiRelationshipHealthLevel,
  FiSubscriptionStatus,
} from "@/app/components/badge/badgeDomain";

export const fiBadgeSizes = ["sm", "md", "lg"] as const;

export type FiBadgeSize = (typeof fiBadgeSizes)[number];

export const fiBadgeStatusTones = [
  "success",
  "warning",
  "info",
  "error",
  "neutral",
  "primary",
] as const;

export type FiBadgeStatusTone = (typeof fiBadgeStatusTones)[number];

export const fiBadgeSizeClasses: Record<FiBadgeSize, string> = {
  sm: "fi-badge--sm",
  md: "fi-badge--md",
  lg: "fi-badge--lg",
};

export const fiBadgeStatusToneClasses: Record<FiBadgeStatusTone, string> = {
  success: "fi-badge--success",
  warning: "fi-badge--warning",
  info: "fi-badge--info",
  error: "fi-badge--error",
  neutral: "fi-badge--neutral",
  primary: "fi-badge--primary",
};

export const fiRelationshipHealthLevelClasses: Record<FiRelationshipHealthLevel, string> = {
  Excellent: "fi-badge--health-excellent",
  Healthy: "fi-badge--health-healthy",
  NeedsAttention: "fi-badge--health-needs-attention",
  Priority: "fi-badge--health-priority",
};

export const fiCalendarStatusClasses: Record<FiCalendarBadgeStatus, string> = {
  upcoming: "fi-badge--calendar-upcoming",
  sent: "fi-badge--calendar-sent",
  draft: "fi-badge--calendar-draft",
  missed: "fi-badge--calendar-missed",
  autopilot: "fi-badge--calendar-autopilot",
};

export const fiPriorityLevelClasses: Record<FiPriorityLevel, string> = {
  high: "fi-badge--priority-high",
  medium: "fi-badge--priority-medium",
  low: "fi-badge--priority-low",
};

export const fiSubscriptionStatusClasses: Record<FiSubscriptionStatus, string> = {
  active: "fi-badge--subscription-active",
  trial: "fi-badge--subscription-trial",
  paused: "fi-badge--subscription-paused",
  canceled: "fi-badge--subscription-canceled",
};

export function getFiBadgeClassName(options: {
  size?: FiBadgeSize;
  tone?: FiBadgeStatusTone;
  domainClass?: string;
  dot?: boolean;
  count?: boolean;
  className?: string;
}): string {
  const {
    size = "sm",
    tone,
    domainClass = "",
    dot = false,
    count = false,
    className = "",
  } = options;

  return [
    "fi-badge",
    typographyUtilityClasses.caption,
    radiusUtilityClasses.pill,
    fiBadgeSizeClasses[size],
    tone ? fiBadgeStatusToneClasses[tone] : "",
    domainClass,
    dot ? "fi-badge--dot" : "",
    count ? "fi-badge--count" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
