export function getFiAdminClassName(className?: string): string {
  return ["fi-admin", className].filter(Boolean).join(" ");
}
