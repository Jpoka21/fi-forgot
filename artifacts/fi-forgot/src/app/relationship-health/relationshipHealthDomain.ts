import type { FiRelationshipHealthLevel } from "@/app/components/badge/badgeDomain";

export const relationshipHealthDefaults = {
  title: "Relationship Health",
  description: "How prepared your concierge is to help you care thoughtfully.",
  errorLabel: "We could not load relationship health right now.",
  refreshLabel: "Refresh",
  trendTitle: "Recent confidence",
  suggestionsTitle: "Thoughtful next steps",
  emptyTitle: "Relationship health will appear here.",
  emptyDescription: "Add your first important person to start building confidence.",
  addPersonLabel: "Add a person",
} as const;

export interface FiRecipientHealthScore {
  recipientId: string;
  name: string;
  relationshipType: string;
  score: number;
  status: FiRelationshipHealthLevel;
  profilePct: number;
  lastUpdateDaysAgo: number | null;
  nextEventLabel: string | null;
  nextEventDaysAway: number | null;
  pendingFollowUps: number;
  recommendedAction: string;
  actionType: "profile" | "follow_up" | "fresh_update" | "card" | "review";
}

export interface FiRecipientHealthApiResponse {
  scores: FiRecipientHealthScore[];
}

export function normalizeRecipientHealthScore(value: unknown): FiRecipientHealthScore | null {
  if (!value || typeof value !== "object") return null;
  const score = value as Partial<FiRecipientHealthScore>;
  if (typeof score.recipientId !== "string" || typeof score.name !== "string") return null;
  if (typeof score.score !== "number") return null;

  return {
    recipientId: score.recipientId,
    name: score.name,
    relationshipType: typeof score.relationshipType === "string" ? score.relationshipType : "Other",
    score: score.score,
    status: score.status ?? "Healthy",
    profilePct: typeof score.profilePct === "number" ? score.profilePct : 0,
    lastUpdateDaysAgo:
      typeof score.lastUpdateDaysAgo === "number" ? score.lastUpdateDaysAgo : null,
    nextEventLabel: typeof score.nextEventLabel === "string" ? score.nextEventLabel : null,
    nextEventDaysAway:
      typeof score.nextEventDaysAway === "number" ? score.nextEventDaysAway : null,
    pendingFollowUps: typeof score.pendingFollowUps === "number" ? score.pendingFollowUps : 0,
    recommendedAction:
      typeof score.recommendedAction === "string" ? score.recommendedAction : "Open profile",
    actionType: score.actionType ?? "profile",
  };
}
