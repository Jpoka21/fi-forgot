export function getFiOnboardingClassName(className?: string): string {
  return ["fi-onboarding", className].filter(Boolean).join(" ");
}

export function getFiOnboardingShellClassName(className?: string): string {
  return ["fi-onboarding-shell", className].filter(Boolean).join(" ");
}
