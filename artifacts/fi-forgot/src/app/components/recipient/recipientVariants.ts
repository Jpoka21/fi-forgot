import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiRecipientContainerClassName(className = ""): string {
  return [
    "fi-recipient",
    spacingUtilityClasses.stackMd,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiRecipientSectionClassName(className = ""): string {
  return ["fi-recipient__section", className].filter(Boolean).join(" ");
}

export function getFiRecipientQuickActionClassName(className = ""): string {
  return ["fi-recipient__quick-action", motionUtilityClasses.card, className]
    .filter(Boolean)
    .join(" ");
}

export function getFiRecipientStatusClassName(options: {
  tone?: "positive" | "neutral" | "attention";
  className?: string;
}): string {
  const { tone = "neutral", className = "" } = options;

  return [
    "fi-recipient__status",
    `fi-recipient__status--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
