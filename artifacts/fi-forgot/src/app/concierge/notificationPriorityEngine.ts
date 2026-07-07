import type { ConciergeInterruptDecision, ConciergeInterruptPriority } from "@/app/concierge/conciergeDomain";

export type NotificationSurface =
  | "push"
  | "in_app_banner"
  | "dashboard_attention"
  | "concierge_suggestion"
  | "question_card";

export interface NotificationCandidate {
  id: string;
  category: "occasion" | "card_approval" | "briefing" | "profile_gap" | "follow_up" | "curiosity" | "surprise";
  title: string;
  daysUntil?: number;
  relationshipConfidence?: number;
  expectedValue: ConciergeInterruptPriority;
}

const SURFACE_MIN_PRIORITY: Record<NotificationSurface, ConciergeInterruptPriority> = {
  push: "high",
  in_app_banner: "high",
  dashboard_attention: "medium",
  concierge_suggestion: "medium",
  question_card: "medium",
};

const PRIORITY_RANK: Record<ConciergeInterruptPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function categoryPriority(category: NotificationCandidate["category"]): ConciergeInterruptPriority {
  switch (category) {
    case "occasion":
    case "card_approval":
      return "high";
    case "briefing":
    case "follow_up":
    case "profile_gap":
      return "medium";
    case "surprise":
      return "low";
    case "curiosity":
    default:
      return "low";
  }
}

export function scoreNotificationCandidate(candidate: NotificationCandidate): ConciergeInterruptPriority {
  const base = categoryPriority(candidate.category);
  if (candidate.daysUntil !== undefined && candidate.daysUntil <= 7) {
    return "high";
  }
  if (candidate.expectedValue === "high") return "high";
  if (base === "high") return "high";
  if (candidate.expectedValue === "medium" || base === "medium") return "medium";
  return "low";
}

export function shouldSurfaceNotification(
  candidate: NotificationCandidate,
  surface: NotificationSurface,
): ConciergeInterruptDecision {
  const priority = scoreNotificationCandidate(candidate);
  const minPriority = SURFACE_MIN_PRIORITY[surface];

  if (PRIORITY_RANK[priority] < PRIORITY_RANK[minPriority]) {
    return {
      shouldInterrupt: false,
      priority,
      reason: "This can wait — nothing urgent needs your attention right now.",
    };
  }

  if (priority === "low") {
    return {
      shouldInterrupt: false,
      priority,
      reason: conciergeSilenceReason(),
    };
  }

  return {
    shouldInterrupt: true,
    priority,
    reason: candidate.title,
    valueProposition: "This could meaningfully improve an upcoming card or relationship moment.",
  };
}

export function filterCandidatesForSurface(
  candidates: NotificationCandidate[],
  surface: NotificationSurface,
): NotificationCandidate[] {
  return candidates
    .filter((candidate) => shouldSurfaceNotification(candidate, surface).shouldInterrupt)
    .sort(
      (a, b) =>
        PRIORITY_RANK[scoreNotificationCandidate(b)] - PRIORITY_RANK[scoreNotificationCandidate(a)],
    );
}

function conciergeSilenceReason(): string {
  return "Low-priority improvements stay quiet until they can genuinely help.";
}

/** Map legacy suggestion urgency to interrupt priority */
export function mapUrgencyToInterruptPriority(
  urgency: "high" | "medium" | "low",
): ConciergeInterruptPriority {
  return urgency;
}
