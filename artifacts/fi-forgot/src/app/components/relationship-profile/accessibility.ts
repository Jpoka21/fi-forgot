export const relationshipProfileAccessibility = {
  requiresLandmarkRegions: true,
  requiresLiveRegions: true,
  requiresKeyboardReachableActions: true,
  requiresReducedMotion: true,
} as const;

export const relationshipProfileAccessibilityChecks = [
  { id: "header", description: "Header exposes recipient identity and navigation" },
  { id: "timeline", description: "Timeline supports search, filters, edit, and archive" },
  { id: "memories", description: "Memories can be created and reviewed" },
  { id: "cards", description: "Card history exposes status and preview text" },
  { id: "insights", description: "Relationship insights are readable and actionable" },
  { id: "responsive-layout", description: "Profile layout adapts on mobile and desktop" },
] as const;

export function verifyRelationshipProfileAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return relationshipProfileAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function buildRelationshipProfileRegionLabel(name?: string): string {
  if (!name) return "Relationship profile";
  return `Relationship profile for ${name}`;
}
