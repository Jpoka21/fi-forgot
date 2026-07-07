import { motionUtilityClasses, spacingUtilityClasses } from "@/app/design";

export function getFiRelationshipProfileShellClassName(className = ""): string {
  return [
    "fi-relationship-profile",
    spacingUtilityClasses.stackLg,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiRelationshipProfileSectionClassName(className = ""): string {
  return ["fi-relationship-profile__section", className].filter(Boolean).join(" ");
}

export function getFiRelationshipProfileCardClassName(className = ""): string {
  return ["fi-relationship-profile__card", className].filter(Boolean).join(" ");
}
