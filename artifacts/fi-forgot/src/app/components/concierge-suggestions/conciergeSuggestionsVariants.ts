import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiConciergeSuggestionsContainerClassName(className = ""): string {
  return [
    "fi-concierge-suggestions",
    spacingUtilityClasses.stackMd,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiConciergeSuggestionCardClassName(options: {
  index?: number;
  className?: string;
}): string {
  const { index = 0, className = "" } = options;

  return [
    "fi-concierge-suggestions__item",
    `fi-concierge-suggestions__item--delay-${Math.min(index, 5)}`,
    motionUtilityClasses.card,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
