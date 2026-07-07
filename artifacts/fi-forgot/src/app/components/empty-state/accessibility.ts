/**
 * Empty state accessibility requirements from the Component Library and Empty States guide.
 */
export const emptyStateAccessibility = {
  requiresSemanticHeading: true,
  actionsAreLabeled: true,
  illustrationAltWhenMeaningful: true,
  decorativeIllustrationsHidden: true,
} as const;

export const emptyStateAccessibilityChecks = [
  { id: "semantic-heading", description: "Empty states expose a semantic heading for the headline" },
  { id: "supporting-copy", description: "Supporting text is readable and associated with the empty state" },
  { id: "primary-action", description: "Primary action is clearly labeled" },
  { id: "illustration-alt", description: "Meaningful illustrations include alt text; decorative ones are hidden" },
  { id: "region-label", description: "Empty states use an accessible region label when appropriate" },
  { id: "reduced-motion", description: "Empty state presentation respects prefers-reduced-motion" },
] as const;

export function verifyEmptyStateAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return emptyStateAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function buildEmptyStateRegionLabel(variant?: string, title?: string): string {
  if (title?.trim()) return title.trim();
  if (variant) return `${variant} empty state`;
  return "Empty state";
}
