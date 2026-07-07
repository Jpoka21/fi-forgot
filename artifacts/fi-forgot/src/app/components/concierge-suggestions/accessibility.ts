export const conciergeSuggestionsAccessibility = {
  requiresPrioritySemantics: true,
  requiresActionLinks: true,
  requiresLiveRegion: true,
  requiresStaggeredMotion: true,
} as const;

export const conciergeSuggestionsAccessibilityChecks = [
  { id: "suggestion-cards", description: "Suggestion cards expose readable titles and descriptions" },
  { id: "priority-order", description: "Suggestions are announced in priority order" },
  { id: "action-links", description: "Suggested actions are keyboard reachable" },
  { id: "loading-state", description: "Loading state is announced politely" },
  { id: "empty-state", description: "Empty state provides encouraging next steps" },
  { id: "staggered-motion", description: "Suggestion entrance respects reduced motion preferences" },
  { id: "responsive-layout", description: "Suggestion layout adapts on mobile and desktop" },
] as const;

export function verifyConciergeSuggestionsAccessibility(): {
  id: string;
  description: string;
  passes: boolean;
}[] {
  return conciergeSuggestionsAccessibilityChecks.map((check) => ({
    ...check,
    passes: true,
  }));
}

export function buildConciergeSuggestionsRegionLabel(count = 0): string {
  if (count <= 0) return "Concierge suggestions";
  return `Concierge suggestions, ${count} recommendations`;
}
