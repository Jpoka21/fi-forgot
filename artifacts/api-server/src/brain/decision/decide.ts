/**
 * Decision Engine — deterministic Rule Engine entry point.
 *
 * Accepts DecisionContext as the decision-facing input contract.
 * Phase 1 still returns the frozen wait scaffold via WaitRule only.
 * The Brain is not yet authorized to act beyond waiting.
 */

import type { BrainDecision } from "../types";
import type { DecisionContext } from "./decisionContextTypes";
import { runRuleEngine } from "./rules/runRuleEngine";

export interface DecideResult {
  decision: BrainDecision;
  confidence: number;
  reasons: string[];
  debugNotes: string[];
}

/**
 * Returns the Phase 1 decision for any DecisionContext via the Rule Engine.
 */
export function decide(decisionContext: DecisionContext): DecideResult {
  return runRuleEngine(decisionContext);
}
