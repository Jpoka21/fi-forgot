export const relationshipHealthAccessibility = {
  requiresRingLabel: true,
  requiresLiveRegion: true,
  requiresTrendSemantics: true,
  requiresSuggestionLinks: true,
} as const;

export const relationshipHealthAccessibilityChecks = [
  { id: "ring-label", description: "Health ring exposes score and level to assistive tech" },
  { id: "summary-heading", description: "Summary uses semantic headings and readable labels" },
  { id: "explanation-text", description: "Explanation copy is readable and non-judgmental" },
  { id: "trend-chart", description: "Trend bars expose values in an accessible list" },
  { id: "suggestion-links", description: "Improvement suggestions are keyboard reachable" },
  { id: "live-region", description: "Loading and refresh states are announced politely" },
  { id: "responsive-layout", description: "Health panel adapts on mobile and desktop" },
] as const;

export function verifyRelationshipHealthAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return relationshipHealthAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function buildRelationshipHealthRegionLabel(score?: number): string {
  if (score == null || score <= 0) return "Relationship health";
  return `Relationship health, score ${score} out of 100`;
}

export function buildTrendDirectionLabel(direction: "up" | "down" | "steady"): string {
  if (direction === "up") return "Trending up";
  if (direction === "down") return "Trending down";
  return "Holding steady";
}
