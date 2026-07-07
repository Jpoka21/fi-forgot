import type {
  ConciergeLearningStage,
  RelationshipConfidenceSnapshot,
} from "@/app/concierge/conciergeDomain";

export interface ConfidenceInput {
  profileScore: number;
  healthScore: number | null;
  freshUpdateCount: number;
  newestUpdateDaysAgo: number | null;
  cardsApprovedCount: number;
  profileComplete: boolean;
}

function resolveStage(score: number): ConciergeLearningStage {
  if (score >= 90) return "mature";
  if (score >= 75) return "confident";
  if (score >= 50) return "developing";
  return "foundational";
}

function resolveQuestionFrequency(
  stage: ConciergeLearningStage,
  newestUpdateDaysAgo: number | null,
): RelationshipConfidenceSnapshot["questionFrequency"] {
  if (stage === "mature") return "minimal";
  if (stage === "confident") return "reduced";
  if (newestUpdateDaysAgo !== null && newestUpdateDaysAgo <= 21) return "reduced";
  return "normal";
}

function resolveCardConfidence(score: number): RelationshipConfidenceSnapshot["cardConfidence"] {
  if (score >= 80) return "high";
  if (score >= 55) return "good";
  return "building";
}

/**
 * Relationship Confidence Score — drives question frequency and card confidence.
 * Frontend-only synthesis from existing health + profile signals.
 * TODO(backend): persist confidence trajectory server-side for cross-device consistency.
 */
export function computeRelationshipConfidence(input: ConfidenceInput): RelationshipConfidenceSnapshot {
  const healthComponent = input.healthScore ?? input.profileScore;
  const freshnessBonus =
    input.newestUpdateDaysAgo !== null && input.newestUpdateDaysAgo <= 30 ? 8 : 0;
  const memoryBonus = Math.min(input.freshUpdateCount * 3, 12);
  const historyBonus = Math.min(input.cardsApprovedCount * 4, 16);
  const completenessBonus = input.profileComplete ? 6 : 0;

  const raw = Math.round(
    healthComponent * 0.55
    + freshnessBonus
    + memoryBonus
    + historyBonus
    + completenessBonus,
  );
  const score = Math.min(100, Math.max(0, raw));
  const stage = resolveStage(score);

  return {
    score,
    label: `${score}%`,
    stage,
    questionFrequency: resolveQuestionFrequency(stage, input.newestUpdateDaysAgo),
    cardConfidence: resolveCardConfidence(score),
  };
}

export function shouldDeferQuestionForConfidence(
  confidence: RelationshipConfidenceSnapshot,
  expectedValue: "high" | "medium" | "low",
): boolean {
  if (expectedValue === "high") return false;
  if (confidence.stage === "mature" && expectedValue === "low") return true;
  if (confidence.stage === "confident" && expectedValue === "low") return true;
  if (confidence.questionFrequency === "minimal") return true;
  return false;
}
