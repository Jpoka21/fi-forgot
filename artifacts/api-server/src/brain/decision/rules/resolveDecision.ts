/**
 * Resolves competing rule candidates into a RuleEngineResult.
 */

import type { RuleEngineResult } from "../ruleEngineTypes";
import type { RuleCandidate } from "./types";

/** Positive when `a` outranks `b` by priority, confidence, then ruleId. */
function compareCandidates(a: RuleCandidate, b: RuleCandidate): number {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  if (a.confidence !== b.confidence) {
    return a.confidence - b.confidence;
  }
  return b.ruleId.localeCompare(a.ruleId);
}

export function resolveDecision(candidates: RuleCandidate[]): RuleEngineResult {
  if (candidates.length === 0) {
    throw new Error(
      "Rule Engine resolution failed: no rule candidates were produced",
    );
  }

  const winner = candidates.reduce((best, current) =>
    compareCandidates(current, best) > 0 ? current : best,
  );

  return {
    decideResult: {
      decision: winner.decision,
      confidence: winner.confidence,
      reasons: winner.reasons,
      debugNotes: winner.debugNotes,
    },
    sourceRuleId: winner.ruleId,
  };
}
