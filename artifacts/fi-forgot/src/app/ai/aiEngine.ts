import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import { resolveConciergeActionLabel } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import type { FiAiConfidenceLevel, FiAiRecommendation } from "@/app/ai/aiDomain";

function urgencyToConfidence(
  urgency: FiConciergeSuggestion["urgency"],
  type: FiConciergeSuggestion["type"],
): FiAiConfidenceLevel {
  if (type === "approve_card") return "high";
  if (type === "answer_briefing") return urgency === "high" ? "low" : "medium";
  if (type === "improve_profile") return urgency === "high" ? "medium" : "low";
  return "medium";
}

export function mapConciergeSuggestionToRecommendation(
  suggestion: FiConciergeSuggestion,
): FiAiRecommendation {
  return {
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    href: suggestion.href,
    actionLabel: resolveConciergeActionLabel(suggestion),
    confidence: urgencyToConfidence(suggestion.urgency, suggestion.type),
    recipientName: suggestion.recipientName,
    daysUntil: suggestion.daysUntil,
    sourceType: suggestion.type,
  };
}

export function loadAiRecommendations(userEmail?: string): FiAiRecommendation[] {
  return loadConciergeSuggestions(userEmail).map(mapConciergeSuggestionToRecommendation);
}
