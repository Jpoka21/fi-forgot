/**
 * Evaluates every registered rule and collects matching candidates.
 *
 * Passes an engine-private RuleEvaluationTrace during the single evaluation pass.
 * The trace is not part of the public DecisionRule contract.
 */

import type { DecisionContext } from "../decisionContextTypes";
import {
  createRuleEvaluationTrace,
  type RuleEvaluateWithTrace,
  type RuleNoMatchExplanation,
} from "./internal/ruleEvaluationTrace";
import type { EvaluateRulesResult, RuleEvaluationEntry } from "./ruleEvaluationTypes";
import type { DecisionRule, RuleCandidate } from "./types";

function buildPreResolutionEntry(
  ruleId: string,
  registryIndex: number,
  candidate: RuleCandidate | null,
  noMatch?: RuleNoMatchExplanation,
): RuleEvaluationEntry {
  if (candidate !== null) {
    return {
      ruleId,
      registryIndex,
      matched: true,
      candidate,
      priority: candidate.priority,
      confidence: candidate.confidence,
      outcome: candidate.decision.outcome,
      reasons: candidate.reasons,
      debugNotes: candidate.debugNotes,
      resolutionStatus: "not_matched",
      lostToRuleId: null,
      lostBecause: null,
    };
  }

  return {
    ruleId,
    registryIndex,
    matched: false,
    candidate: null,
    priority: null,
    confidence: null,
    outcome: null,
    reasons: noMatch?.reasons ?? [],
    debugNotes: noMatch?.debugNotes ?? [],
    resolutionStatus: "not_matched",
    lostToRuleId: null,
    lostBecause: null,
  };
}

export function evaluateRules(
  context: DecisionContext,
  registry: DecisionRule[],
): EvaluateRulesResult {
  const candidates: RuleCandidate[] = [];
  const entries: RuleEvaluationEntry[] = [];

  for (const [registryIndex, rule] of registry.entries()) {
    let noMatch: RuleNoMatchExplanation | undefined;
    const trace = createRuleEvaluationTrace((explanation) => {
      noMatch = explanation;
    });

    const candidate = (rule.evaluate as RuleEvaluateWithTrace)(context, trace);
    entries.push(buildPreResolutionEntry(rule.id, registryIndex, candidate, noMatch));

    if (candidate !== null) {
      candidates.push(candidate);
    }
  }

  return { candidates, entries };
}
