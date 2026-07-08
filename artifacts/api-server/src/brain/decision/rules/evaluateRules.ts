/**
 * Evaluates every registered rule and collects matching candidates.
 */

import type { DecisionContext } from "../decisionContextTypes";
import type { DecisionRule, RuleCandidate } from "./types";

export function evaluateRules(
  context: DecisionContext,
  registry: DecisionRule[],
): RuleCandidate[] {
  const candidates: RuleCandidate[] = [];

  for (const rule of registry) {
    const candidate = rule.evaluate(context);
    if (candidate !== null) {
      candidates.push(candidate);
    }
  }

  return candidates;
}
