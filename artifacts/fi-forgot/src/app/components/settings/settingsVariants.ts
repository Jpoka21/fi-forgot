export function getFiSettingsShellClassName(className?: string): string {
  return ["fi-settings-shell", className].filter(Boolean).join(" ");
}
