import {
  elevationUtilityClasses,
  motionUtilityClasses,
  radiusUtilityClasses,
  spacingUtilityClasses,
} from "@/app/design";

export const fiCardVariants = [
  "standard",
  "elevated",
  "recipient",
  "timeline",
  "notification",
  "billing",
  "dashboard",
  "analytics",
  "aiRecommendation",
  "empty",
] as const;

export type FiCardVariant = (typeof fiCardVariants)[number];

const baseClass = [
  "fi-card",
  radiusUtilityClasses.card,
  motionUtilityClasses.card,
].join(" ");

export const fiCardVariantClasses: Record<FiCardVariant, string> = {
  standard: baseClass,
  elevated: `${baseClass} fi-card--elevated ${elevationUtilityClasses.elevCard}`,
  recipient: `${baseClass} fi-card--recipient`,
  timeline: `${baseClass} fi-card--timeline`,
  notification: `${baseClass} fi-card--notification`,
  billing: `${baseClass} fi-card--billing`,
  dashboard: `${baseClass} fi-card--dashboard`,
  analytics: `${baseClass} fi-card--analytics`,
  aiRecommendation: `${baseClass} fi-card--ai`,
  empty: `${baseClass} fi-card--empty ${spacingUtilityClasses.stackEmpty}`,
};

export function getFiCardClassName(options: {
  variant?: FiCardVariant;
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
  className?: string;
}): string {
  const {
    variant = "standard",
    interactive = false,
    selected = false,
    loading = false,
    className = "",
  } = options;

  return [
    fiCardVariantClasses[variant],
    interactive ? `fi-card--interactive ${motionUtilityClasses.hover}` : "",
    selected ? "fi-card--selected" : "",
    loading ? "fi-card--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
