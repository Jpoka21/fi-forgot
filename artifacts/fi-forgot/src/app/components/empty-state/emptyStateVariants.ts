import { motionUtilityClasses, spacingUtilityClasses, typographyUtilityClasses } from "@/app/design";

import type { FiEmptyStateVariant } from "@/app/components/empty-state/emptyStateDomain";

export const fiEmptyStateVariantClasses: Record<FiEmptyStateVariant, string> = {
  dashboard: "fi-empty-state--dashboard",
  timeline: "fi-empty-state--timeline",
  calendar: "fi-empty-state--calendar",
  search: "fi-empty-state--search",
  notification: "fi-empty-state--notification",
  recipient: "fi-empty-state--recipient",
  billing: "fi-empty-state--billing",
  aiConcierge: "fi-empty-state--ai-concierge",
  admin: "fi-empty-state--admin",
};

export function getFiEmptyStateClassName(options: {
  variant?: FiEmptyStateVariant;
  contained?: boolean;
  className?: string;
}): string {
  const { variant, contained = false, className = "" } = options;

  return [
    "fi-empty-state",
    typographyUtilityClasses.bodySm,
    spacingUtilityClasses.stackEmpty,
    variant ? fiEmptyStateVariantClasses[variant] : "",
    contained ? "fi-empty-state--contained" : "",
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiEmptyStateIllustrationClassName(className = ""): string {
  return ["fi-empty-state__illustration", className].filter(Boolean).join(" ");
}
