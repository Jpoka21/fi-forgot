import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiDashboardShellClassName(className = ""): string {
  return [
    "fi-dashboard",
    spacingUtilityClasses.stackLg,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiDashboardSectionClassName(className = ""): string {
  return ["fi-dashboard__section", className].filter(Boolean).join(" ");
}

export function getFiDashboardHeroClassName(className = ""): string {
  return ["fi-dashboard__hero", className].filter(Boolean).join(" ");
}

export function getFiDashboardQuickActionClassName(className = ""): string {
  return ["fi-dashboard__quick-action", motionUtilityClasses.card, className]
    .filter(Boolean)
    .join(" ");
}
