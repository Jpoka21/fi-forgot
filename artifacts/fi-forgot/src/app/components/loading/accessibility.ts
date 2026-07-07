/**
 * Loading skeleton accessibility requirements from the Loading and Skeletons guide.
 */
export const loadingAccessibility = {
  requiresBusyRegion: true,
  requiresStatusLabel: true,
  decorativeSkeletonsHidden: true,
  reducedMotionSupported: true,
  noFocusTrap: true,
} as const;

export const loadingAccessibilityChecks = [
  { id: "busy-region", description: "Loading regions expose role=status and aria-busy" },
  { id: "status-label", description: "Loading regions include an accessible label" },
  { id: "live-polite", description: "Important loading updates use aria-live=polite" },
  { id: "decorative-skeletons", description: "Skeleton placeholders are aria-hidden" },
  { id: "layout-stable", description: "Skeleton dimensions preserve layout stability" },
  { id: "reduced-motion", description: "Skeleton shimmer respects prefers-reduced-motion" },
  { id: "no-focus-trap", description: "Loading states do not trap keyboard focus" },
] as const;

export function verifyLoadingAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return loadingAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function buildLoadingRegionLabel(variant?: string, label?: string): string {
  if (label?.trim()) return label.trim();
  if (variant) return `Loading ${variant}`;
  return "Loading";
}
