/**
 * Resolves competing rule candidates into a RuleEngineResult.
 */

import { compareRuleCandidates } from "./compareRuleCandidates";
import type { ResolvedDecision } from "../ruleEngineTypes";
import type { RuleCandidate } from "./types";

export function resolveDecision(candidates: RuleCandidate[]): ResolvedDecision {
  if (candidates.length === 0) {
    throw new Error(
      "Rule Engine resolution failed: no rule candidates were produced",
    );
  }

  const winner = candidates.reduce((best, current) =>
    compareRuleCandidates(current, best) > 0 ? current : best,
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
