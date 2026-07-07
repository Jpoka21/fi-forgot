import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiAiContainerClassName(className = ""): string {
  return [
    "fi-ai",
    spacingUtilityClasses.stackMd,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiAiRecommendationCardClassName(options: {
  index?: number;
  className?: string;
}): string {
  const { index = 0, className = "" } = options;

  return [
    "fi-ai__item",
    `fi-ai__item--delay-${Math.min(index, 5)}`,
    motionUtilityClasses.card,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiAiDraftingClassName(className = ""): string {
  return ["fi-ai__drafting", className].filter(Boolean).join(" ");
}

export function getFiAiConfidenceClassName(level: string, className = ""): string {
  return ["fi-ai__confidence", `fi-ai__confidence--${level}`, className].filter(Boolean).join(" ");
}
