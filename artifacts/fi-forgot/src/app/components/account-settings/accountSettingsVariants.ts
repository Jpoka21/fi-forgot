export function getFiAccountSettingsClassName(className?: string): string {
  return ["fi-account-settings", className].filter(Boolean).join(" ");
}

export function getFiAccountSettingsSectionClassName(className?: string): string {
  return ["fi-account-settings__section", className].filter(Boolean).join(" ");
}
