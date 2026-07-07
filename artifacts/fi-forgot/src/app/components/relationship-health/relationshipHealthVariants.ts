import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiRelationshipHealthContainerClassName(className = ""): string {
  return [
    "fi-relationship-health",
    spacingUtilityClasses.stackMd,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiRelationshipHealthHeroClassName(className = ""): string {
  return ["fi-relationship-health__hero", className].filter(Boolean).join(" ");
}

export function getFiRelationshipHealthTrendBarClassName(options: {
  active?: boolean;
  className?: string;
}): string {
  const { active = false, className = "" } = options;

  return [
    "fi-relationship-health__trend-bar",
    active ? "fi-relationship-health__trend-bar--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiRelationshipHealthSuggestionClassName(className = ""): string {
  return ["fi-relationship-health__suggestion", className].filter(Boolean).join(" ");
}
