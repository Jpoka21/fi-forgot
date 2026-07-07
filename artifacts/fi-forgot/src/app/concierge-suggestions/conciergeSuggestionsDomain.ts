export const conciergeSuggestionsDefaults = {
  title: "Concierge suggestions",
  description: "Thoughtful next steps based on your relationships, cards, and upcoming moments.",
  refreshLabel: "Refresh",
  errorLabel: "We could not load suggestions right now.",
  emptyTitle: "Your concierge is ready.",
  emptyDescription:
    "As you add relationships and moments, personalized guidance and thoughtful suggestions will appear here.",
  addPersonLabel: "Add someone important",
} as const;

export type FiConciergeSuggestionType =
  | "approve_card"
  | "answer_briefing"
  | "improve_profile"
  | "add_person";

export type FiConciergeSuggestionUrgency = "high" | "medium" | "low";

export interface FiConciergeSuggestion {
  id: string;
  type: FiConciergeSuggestionType;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  recipientName?: string;
  daysUntil?: number;
  urgency: FiConciergeSuggestionUrgency;
}

export const conciergeSuggestionActionLabels: Record<FiConciergeSuggestionType, string> = {
  approve_card: "Review cards",
  answer_briefing: "Personalize card",
  improve_profile: "Open profile",
  add_person: "Add person",
};

export const conciergeUrgencyOrder: Record<FiConciergeSuggestionUrgency, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function resolveConciergeActionLabel(suggestion: Pick<FiConciergeSuggestion, "type" | "actionLabel">): string {
  return suggestion.actionLabel || conciergeSuggestionActionLabels[suggestion.type];
}
