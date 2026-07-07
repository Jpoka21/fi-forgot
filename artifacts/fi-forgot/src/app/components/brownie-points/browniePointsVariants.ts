import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiBrowniePointsContainerClassName(className = ""): string {
  return [
    "fi-brownie-points",
    spacingUtilityClasses.stackMd,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiBrowniePointsHeroClassName(className = ""): string {
  return ["fi-brownie-points__hero", className].filter(Boolean).join(" ");
}

export function getFiBrowniePointsHistoryItemClassName(className = ""): string {
  return ["fi-brownie-points__history-item", className].filter(Boolean).join(" ");
}
