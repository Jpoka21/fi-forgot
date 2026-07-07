export { FiLinearProgress, FiBrowniePointsProgress, FiUploadProgress } from "@/app/components/progress/FiLinearProgress";
export type {
  FiBrowniePointsProgressProps,
  FiLinearProgressProps,
  FiUploadProgressProps,
} from "@/app/components/progress/FiLinearProgress";

export {
  FiCircularProgress,
  FiRelationshipHealthRing,
} from "@/app/components/progress/FiCircularProgress";
export type {
  FiCircularProgressProps,
  FiRelationshipHealthRingProps,
} from "@/app/components/progress/FiCircularProgress";

export {
  FiAiGenerationProgress,
  FiStepProgress,
} from "@/app/components/progress/FiStepProgress";
export type {
  FiAiGenerationProgressProps,
  FiStepProgressProps,
  FiStepProgressStep,
} from "@/app/components/progress/FiStepProgress";

export { FiCompletionProgress } from "@/app/components/progress/FiCompletionProgress";
export type { FiCompletionProgressProps } from "@/app/components/progress/FiCompletionProgress";

export {
  aiGenerationSteps,
  clampProgressValue,
  fiCompletionVariants,
  fiProgressSizes,
  fiProgressTones,
  fiStepProgressVariants,
  formatProgressPercent,
  getAiGenerationProgressValue,
  relationshipHealthRingLabels,
  resolveAiGenerationStepIndex,
  resolveHealthRingLevel,
} from "@/app/components/progress/progressDomain";
export type {
  FiAiGenerationStepId,
  FiCompletionVariant,
  FiProgressSize,
  FiProgressTone,
  FiStepProgressVariant,
} from "@/app/components/progress/progressDomain";

export {
  fiProgressRingToneClasses,
  fiProgressSizeClasses,
  fiProgressToneClasses,
  fiRelationshipHealthRingClasses,
  getFiCircularProgressClassName,
  getFiLinearProgressClassName,
  getFiStepProgressClassName,
} from "@/app/components/progress/progressVariants";

export {
  buildProgressAriaLabel,
  buildStepProgressAriaLabel,
  progressAccessibility,
  progressAccessibilityChecks,
  verifyProgressAccessibility,
} from "@/app/components/progress/accessibility";

/** Alias for checklist "Linear progress" naming. */
export { FiLinearProgress as FiProgress } from "@/app/components/progress/FiLinearProgress";
