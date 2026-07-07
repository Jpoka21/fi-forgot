export function getFiRelationshipPreferencesClassName(className?: string): string {
  return ["fi-relationship-prefs", className].filter(Boolean).join(" ");
}

export function getFiRelationshipPreferencesSectionClassName(className?: string): string {
  return ["fi-relationship-prefs__section", className].filter(Boolean).join(" ");
}
