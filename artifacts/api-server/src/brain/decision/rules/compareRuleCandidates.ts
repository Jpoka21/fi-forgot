/**
 * Shared candidate ordering for resolution and evaluation annotation.
 */

import type { RuleCandidate } from "./types";
import type { RuleLossReason } from "./ruleEvaluationTypes";

/** Positive when `a` outranks `b` by priority, confidence, then ruleId. */
export function compareRuleCandidates(a: RuleCandidate, b: RuleCandidate): number {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  if (a.confidence !== b.confidence) {
    return a.confidence - b.confidence;
  }
  return b.ruleId.localeCompare(a.ruleId);
}

export function ruleLossReason(
  loser: RuleCandidate,
  winner: RuleCandidate,
): RuleLossReason {
  if (loser.priority !== winner.priority) {
    return "lower_priority";
  }
  if (loser.confidence !== winner.confidence) {
    return "lower_confidence";
  }
  return "tie_break";
}
