/**
 * Rule Engine entry — evaluates registered rules and resolves one decision.
 */

import type { DecideResult } from "../decide";
import type { DecisionContext } from "../decisionContextTypes";
import { evaluateRules } from "./evaluateRules";
import { resolveDecision } from "./resolveDecision";
import { ruleRegistry } from "./ruleRegistry";

export function runRuleEngine(context: DecisionContext): DecideResult {
  const candidates = evaluateRules(context, ruleRegistry);
  return resolveDecision(candidates);
}
