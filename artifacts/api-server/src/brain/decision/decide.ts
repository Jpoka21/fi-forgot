/**
 * Decision Engine — public entry point.
 *
 * Accepts DecisionContext as the decision-facing input contract.
 * Returns DecideResult only — use decideInternal() for rule provenance.
 */

import type { BrainDecision } from "../types";
import type { DecisionContext } from "./decisionContextTypes";
import { decideInternal } from "./decideInternal";

export interface DecideResult {
  decision: BrainDecision;
  confidence: number;
  reasons: string[];
  debugNotes: string[];
}

/**
 * Returns the decision for any DecisionContext via the Rule Engine.
 */
export function decide(decisionContext: DecisionContext): DecideResult {
  return decideInternal(decisionContext).decideResult;
}
