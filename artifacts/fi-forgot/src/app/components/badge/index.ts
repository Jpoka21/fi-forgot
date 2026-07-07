export {
  FiAiBadge,
  FiBadge,
  FiBrowniePointsBadge,
  FiCalendarBadge,
  FiNotificationBadge,
  FiPriorityBadge,
  FiRelationshipHealthBadge,
  FiStatusBadge,
  FiSubscriptionBadge,
  FiVerificationBadge,
} from "@/app/components/badge/FiBadge";
export type {
  FiAiBadgeProps,
  FiBadgeProps,
  FiBrowniePointsBadgeProps,
  FiCalendarBadgeProps,
  FiNotificationBadgeProps,
  FiPriorityBadgeProps,
  FiRelationshipHealthBadgeProps,
  FiStatusBadgeProps,
  FiSubscriptionBadgeProps,
  FiVerificationBadgeProps,
} from "@/app/components/badge/FiBadge";

export {
  calendarBadgeLabels,
  fiCalendarBadgeStatuses,
  fiPriorityLevels,
  fiRelationshipHealthLevels,
  fiSubscriptionStatuses,
  formatBrowniePoints,
  formatNotificationCount,
  priorityBadgeLabels,
  relationshipHealthLabels,
  resolveRelationshipHealthLevel,
  subscriptionBadgeLabels,
} from "@/app/components/badge/badgeDomain";
export type {
  FiCalendarBadgeStatus,
  FiPriorityLevel,
  FiRelationshipHealthLevel,
  FiSubscriptionStatus,
} from "@/app/components/badge/badgeDomain";

export {
  fiBadgeSizeClasses,
  fiBadgeSizes,
  fiBadgeStatusToneClasses,
  fiBadgeStatusTones,
  fiCalendarStatusClasses,
  fiPriorityLevelClasses,
  fiRelationshipHealthLevelClasses,
  fiSubscriptionStatusClasses,
  getFiBadgeClassName,
} from "@/app/components/badge/badgeVariants";
export type { FiBadgeSize, FiBadgeStatusTone } from "@/app/components/badge/badgeVariants";

export {
  badgeAccessibility,
  badgeAccessibilityChecks,
  buildNotificationBadgeLabel,
  isBadgeTextConcise,
  verifyBadgeAccessibility,
} from "@/app/components/badge/accessibility";
