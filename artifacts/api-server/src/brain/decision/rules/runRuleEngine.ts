/**
 * Rule Engine entry — evaluates registered rules and resolves one decision.
 */

import type { RuleEngineResult } from "../ruleEngineTypes";
import type { DecisionContext } from "../decisionContextTypes";
import { buildRuleEvaluationSummary } from "./buildRuleEvaluationSummary";
import { evaluateRules } from "./evaluateRules";
import { resolveDecision } from "./resolveDecision";
import { ruleRegistry } from "./ruleRegistry";

export function runRuleEngine(context: DecisionContext): RuleEngineResult {
  const { candidates, entries } = evaluateRules(context, ruleRegistry);
  const { decideResult, sourceRuleId } = resolveDecision(candidates);
  const winnerCandidate = candidates.find((candidate) => candidate.ruleId === sourceRuleId)!;
  const ruleEvaluation = buildRuleEvaluationSummary(entries, winnerCandidate);

  return { decideResult, sourceRuleId, ruleEvaluation };
}
