export {
  FiLoadingRegion,
  FiSkeleton,
  FiSkeletonRow,
  FiSkeletonText,
} from "@/app/components/loading/FiSkeleton";
export type {
  FiLoadingRegionProps,
  FiSkeletonProps,
  FiSkeletonRowProps,
  FiSkeletonTextProps,
} from "@/app/components/loading/FiSkeleton";

export {
  FiAiGenerationSkeleton,
  FiBillingSkeleton,
  FiCalendarSkeleton,
  FiCardLoadingSkeleton,
  FiDashboardSkeleton,
  FiListSkeleton,
  FiPageSkeleton,
  FiRecipientSkeleton,
  FiSearchSkeleton,
  FiTimelineSkeleton,
} from "@/app/components/loading/FiLoadingPresets";
export type {
  FiAiGenerationSkeletonProps,
  FiLoadingSkeletonPresetProps,
} from "@/app/components/loading/FiLoadingPresets";

export {
  aiGenerationLoadingMessages,
  fiLoadingSkeletonVariants,
  loadingSkeletonDefaults,
} from "@/app/components/loading/loadingDomain";
export type {
  FiLoadingSkeletonCopy,
  FiLoadingSkeletonVariant,
} from "@/app/components/loading/loadingDomain";

export {
  fiLoadingSkeletonVariantClasses,
  fiSkeletonShapeClasses,
  fiSkeletonWidthClasses,
  getFiLoadingRegionClassName,
  getFiSkeletonClassName,
} from "@/app/components/loading/loadingVariants";
export type {
  FiSkeletonShape,
  FiSkeletonWidth,
} from "@/app/components/loading/loadingVariants";

export {
  buildLoadingRegionLabel,
  loadingAccessibility,
  loadingAccessibilityChecks,
  verifyLoadingAccessibility,
} from "@/app/components/loading/accessibility";
