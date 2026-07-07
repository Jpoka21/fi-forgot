import type { FreshUpdate } from "@/app/relationship-profile/relationshipProfileDomain";
import type {
  ConciergeLearningStage,
  PositiveSurpriseMoment,
} from "@/app/concierge/conciergeDomain";
import type { RelationshipConfidenceSnapshot } from "@/app/concierge/conciergeDomain";

export interface LearningTrajectory {
  stage: ConciergeLearningStage;
  headline: string;
  detail: string;
  effortTrend: "decreasing" | "stable" | "building";
}

const MEMORY_ANNIVERSARY_WINDOWS = [365, 730, 1095];

/**
 * Relationship learning trajectory — communicates that relationships get easier.
 */
export function describeLearningTrajectory(
  confidence: RelationshipConfidenceSnapshot,
): LearningTrajectory {
  switch (confidence.stage) {
    case "mature":
      return {
        stage: "mature",
        headline: "I already know enough.",
        detail: "Questions are rare now. I prepare cards quietly and only check in when something new would help.",
        effortTrend: "decreasing",
      };
    case "confident":
      return {
        stage: "confident",
        headline: "I only need one quick update.",
        detail: "Most of what matters is already here. Occasional questions keep cards fresh without feeling like homework.",
        effortTrend: "decreasing",
      };
    case "developing":
      return {
        stage: "developing",
        headline: "I'm learning what makes them them.",
        detail: "A few thoughtful answers now mean far fewer questions later.",
        effortTrend: "stable",
      };
    default:
      return {
        stage: "foundational",
        headline: "Let's start with what matters most.",
        detail: "One question at a time — never a survey. Each answer makes future cards more personal.",
        effortTrend: "building",
      };
  }
}

/**
 * Positive surprises — rare, no action required. Uses existing memories only.
 */
export function detectPositiveSurprise(
  recipientId: string,
  recipientName: string,
  freshUpdates: FreshUpdate[],
): PositiveSurpriseMoment | null {
  const memorable = freshUpdates.filter((u) => u.answerText.trim().length >= 30);
  if (memorable.length === 0) return null;

  for (const window of MEMORY_ANNIVERSARY_WINDOWS) {
    const match = memorable.find(
      (u) => u.daysAgo >= window - 7 && u.daysAgo <= window + 7,
    );
    if (match) {
      const years = Math.round(window / 365);
      const excerpt = match.answerText.trim().slice(0, 100);
      return {
        id: `${recipientId}-surprise-${window}`,
        message:
          years === 1
            ? `About a year ago, you shared something about ${recipientName.split(" ")[0]}.`
            : `${years} years ago today, you remembered something special about ${recipientName.split(" ")[0]}.`,
        memoryExcerpt: excerpt,
        daysSinceMemory: match.daysAgo,
        actionRequired: false,
      };
    }
  }

  return null;
}
