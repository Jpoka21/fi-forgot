/**
 * Internal decision pipeline entry — full rule engine evaluation with provenance.
 */

import type { DecisionContext } from "./decisionContextTypes";
import type { RuleEngineResult } from "./ruleEngineTypes";
import { runRuleEngine } from "./rules/runRuleEngine";

/**
 * Runs the complete decision pipeline for a DecisionContext.
 * Returns both the public DecideResult and the winning rule id.
 */
export function decideInternal(context: DecisionContext): RuleEngineResult {
  return runRuleEngine(context);
}
