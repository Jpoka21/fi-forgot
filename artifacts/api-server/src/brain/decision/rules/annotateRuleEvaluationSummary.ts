/**
 * Annotates pre-resolution evaluation entries with winner/loser outcomes.
 */

import { ruleLossReason } from "./compareRuleCandidates";
import type { RuleEvaluationEntry } from "./ruleEvaluationTypes";
import type { RuleCandidate } from "./types";

export function annotateRuleEvaluationSummary(
  entries: RuleEvaluationEntry[],
  winnerCandidate: RuleCandidate,
): RuleEvaluationEntry[] {
  return entries.map((entry) => {
    if (!entry.matched || entry.candidate === null) {
      return {
        ...entry,
        resolutionStatus: "not_matched",
        lostToRuleId: null,
        lostBecause: null,
      };
    }

    if (entry.ruleId === winnerCandidate.ruleId) {
      return {
        ...entry,
        resolutionStatus: "winner",
        lostToRuleId: null,
        lostBecause: null,
      };
    }

    return {
      ...entry,
      resolutionStatus: "matched_lost",
      lostToRuleId: winnerCandidate.ruleId,
      lostBecause: ruleLossReason(entry.candidate, winnerCandidate),
    };
  });
}
