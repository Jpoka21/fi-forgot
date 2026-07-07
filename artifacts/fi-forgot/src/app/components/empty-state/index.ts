export {
  FiEmptyState,
  FiEmptyStateActions,
  FiEmptyStateContent,
  FiEmptyStateDescription,
  FiEmptyStateIcon,
  FiEmptyStateIllustration,
  FiEmptyStateLayout,
  FiEmptyStateTitle,
} from "@/app/components/empty-state/FiEmptyState";
export type {
  FiEmptyStateIllustrationProps,
  FiEmptyStateLayoutProps,
  FiEmptyStateProps,
} from "@/app/components/empty-state/FiEmptyState";

export {
  FiAdminEmptyState,
  FiAiConciergeEmptyState,
  FiBillingEmptyState,
  FiCalendarEmptyState,
  FiDashboardEmptyState,
  FiNotificationEmptyState,
  FiRecipientEmptyState,
  FiSearchEmptyState,
  FiTimelineEmptyState,
} from "@/app/components/empty-state/FiEmptyStatePresets";
export type { FiEmptyStatePresetProps } from "@/app/components/empty-state/FiEmptyStatePresets";

export {
  emptyStateDefaults,
  fiEmptyStateVariants,
} from "@/app/components/empty-state/emptyStateDomain";
export type {
  FiEmptyStateCopy,
  FiEmptyStateVariant,
} from "@/app/components/empty-state/emptyStateDomain";

export {
  fiEmptyStateVariantClasses,
  getFiEmptyStateClassName,
  getFiEmptyStateIllustrationClassName,
} from "@/app/components/empty-state/emptyStateVariants";

export {
  buildEmptyStateRegionLabel,
  emptyStateAccessibility,
  emptyStateAccessibilityChecks,
  verifyEmptyStateAccessibility,
} from "@/app/components/empty-state/accessibility";
