export const aiDefaults = {
  title: "Concierge intelligence",
  description:
    "Thoughtful recommendations, drafting progress, and confidence cues from your relationship concierge.",
  refreshLabel: "Refresh",
  errorLabel: "We could not load concierge intelligence right now.",
  generationHeadline: "Your Relationship Concierge is writing...",
  generationSupport: "Using what you have shared to shape something personal.",
  retryTitle: "We couldn't finish writing your card.",
  retryDescription: "Your relationship information is safe. Let's try again.",
  retryLabel: "Generate again",
  emptyTitle: "Your concierge is ready.",
  emptyDescription:
    "As you add relationships and moments, personalized recommendations and drafting guidance will appear here.",
  confidenceTitle: "Draft confidence",
} as const;

export const aiDraftingHeadlines = [
  "Understanding your relationship...",
  "Reviewing important memories...",
  "Choosing the right tone...",
  "Preparing your handwritten draft...",
  "Generating the final message...",
] as const;

export type FiAiConfidenceLevel = "high" | "medium" | "low";

export interface FiAiRecommendation {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  confidence: FiAiConfidenceLevel;
  recipientName?: string;
  daysUntil?: number;
  sourceType: string;
}

export type FiAiSuggestion = FiAiRecommendation;

export const aiConfidenceLabels: Record<FiAiConfidenceLevel, string> = {
  high: "Strong match",
  medium: "Good starting point",
  low: "Needs more context",
};

export const aiConfidenceCopy: Record<FiAiConfidenceLevel, string> = {
  high: "We're confident this will feel personal and authentic.",
  medium: "A few more details could make this even more personal.",
  low: "Add more about this relationship to strengthen the draft.",
};

export function resolveAiConfidenceMessage(level: FiAiConfidenceLevel): string {
  return aiConfidenceCopy[level];
}

export function resolveDraftingHeadline(stepIndex: number): string {
  const index = Math.min(Math.max(stepIndex, 0), aiDraftingHeadlines.length - 1);
  return aiDraftingHeadlines[index];
}
