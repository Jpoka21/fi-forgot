import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

import type { FiLoadingSkeletonVariant } from "@/app/components/loading/loadingDomain";

export const fiLoadingSkeletonVariantClasses: Record<FiLoadingSkeletonVariant, string> = {
  page: "fi-loading-skeleton--page",
  card: "fi-loading-skeleton--card",
  list: "fi-loading-skeleton--list",
  calendar: "fi-loading-skeleton--calendar",
  timeline: "fi-loading-skeleton--timeline",
  search: "fi-loading-skeleton--search",
  recipient: "fi-loading-skeleton--recipient",
  billing: "fi-loading-skeleton--billing",
  aiGeneration: "fi-loading-skeleton--ai-generation",
  dashboard: "fi-loading-skeleton--dashboard",
};

export const fiSkeletonShapeClasses = {
  line: "fi-skeleton--line",
  circle: "fi-skeleton--circle",
  rect: "fi-skeleton--rect",
  button: "fi-skeleton--button",
  avatar: "fi-skeleton--avatar",
  block: "fi-skeleton--block",
} as const;

export const fiSkeletonWidthClasses = {
  xs: "fi-skeleton--width-xs",
  sm: "fi-skeleton--width-sm",
  md: "fi-skeleton--width-md",
  lg: "fi-skeleton--width-lg",
  full: "fi-skeleton--width-full",
} as const;

export type FiSkeletonShape = keyof typeof fiSkeletonShapeClasses;
export type FiSkeletonWidth = keyof typeof fiSkeletonWidthClasses;

export function getFiLoadingRegionClassName(options: {
  variant?: FiLoadingSkeletonVariant;
  className?: string;
}): string {
  const { variant, className = "" } = options;

  return [
    "fi-loading-region",
    spacingUtilityClasses.stackSm,
    variant ? fiLoadingSkeletonVariantClasses[variant] : "",
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiSkeletonClassName(options: {
  shape?: FiSkeletonShape;
  width?: FiSkeletonWidth;
  animate?: boolean;
  className?: string;
}): string {
  const {
    shape = "line",
    width = "full",
    animate = true,
    className = "",
  } = options;

  return [
    "fi-skeleton",
    fiSkeletonShapeClasses[shape],
    fiSkeletonWidthClasses[width],
    animate ? motionUtilityClasses.skeleton : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
