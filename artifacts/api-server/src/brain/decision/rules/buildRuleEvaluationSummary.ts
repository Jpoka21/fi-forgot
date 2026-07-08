/**
 * Assembles the development-only rule evaluation summary after resolution.
 */

import { annotateRuleEvaluationSummary } from "./annotateRuleEvaluationSummary";
import type { RuleEvaluationEntry, RuleEvaluationSummary } from "./ruleEvaluationTypes";
import type { RuleCandidate } from "./types";

export function buildRuleEvaluationSummary(
  entries: RuleEvaluationEntry[],
  winnerCandidate: RuleCandidate,
): RuleEvaluationSummary {
  return {
    entries: annotateRuleEvaluationSummary(entries, winnerCandidate),
  };
}
