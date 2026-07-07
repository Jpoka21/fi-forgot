import { motionUtilityClasses, radiusUtilityClasses } from "@/app/design";

import type { FiProgressSize, FiProgressTone } from "@/app/components/progress/progressDomain";

export const fiProgressSizeClasses: Record<FiProgressSize, string> = {
  sm: "fi-progress--sm",
  md: "fi-progress--md",
  lg: "fi-progress--lg",
};

export const fiProgressToneClasses: Record<FiProgressTone, string> = {
  primary: "fi-progress--primary",
  success: "fi-progress--success",
  neutral: "fi-progress--neutral",
  brownie: "fi-progress--brownie",
  health: "fi-progress--health",
  ai: "fi-progress--ai",
  upload: "fi-progress--upload",
};

export const fiRelationshipHealthRingClasses: Record<
  "Excellent" | "Healthy" | "NeedsAttention" | "Priority",
  string
> = {
  Excellent: "fi-progress-ring--health-excellent",
  Healthy: "fi-progress-ring--health-healthy",
  NeedsAttention: "fi-progress-ring--health-growing",
  Priority: "fi-progress-ring--health-starting",
};

const linearBase = [
  "fi-progress",
  radiusUtilityClasses.pill,
  motionUtilityClasses.reducedSafe,
].join(" ");

export function getFiLinearProgressClassName(options: {
  size?: FiProgressSize;
  tone?: FiProgressTone;
  indeterminate?: boolean;
  className?: string;
}): string {
  const {
    size = "md",
    tone = "primary",
    indeterminate = false,
    className = "",
  } = options;

  return [
    linearBase,
    fiProgressSizeClasses[size],
    fiProgressToneClasses[tone],
    indeterminate ? "fi-progress--indeterminate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const fiProgressRingToneClasses: Record<FiProgressTone, string> = {
  primary: "fi-progress-ring--primary",
  success: "fi-progress-ring--success",
  neutral: "fi-progress-ring--neutral",
  brownie: "fi-progress-ring--brownie",
  health: "fi-progress-ring--health",
  ai: "fi-progress-ring--ai",
  upload: "fi-progress-ring--upload",
};

export function getFiCircularProgressClassName(options: {
  size?: FiProgressSize;
  tone?: FiProgressTone;
  className?: string;
}): string {
  const { size = "md", tone = "primary", className = "" } = options;

  return [
    "fi-progress-ring",
    `fi-progress-ring--${size}`,
    fiProgressRingToneClasses[tone],
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiStepProgressClassName(options: {
  variant?: "segments" | "dots";
  className?: string;
}): string {
  const { variant = "segments", className = "" } = options;

  return ["fi-step-progress", `fi-step-progress--${variant}`, className]
    .filter(Boolean)
    .join(" ");
}
