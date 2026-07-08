/**
 * Decision Engine — read-only scaffold.
 *
 * Accepts DecisionContext as the decision-facing input contract.
 * Phase 1 still returns a fixed placeholder — DecisionContext fields are not read.
 * The Brain is not yet authorized to act.
 */

import type { BrainDecision } from "../types";
import type { DecisionContext } from "./decisionContextTypes";

export interface DecideResult {
  decision: BrainDecision;
  confidence: number;
  reasons: string[];
  debugNotes: string[];
}

const SCAFFOLD_DECISION: DecideResult = {
  decision: { outcome: "wait" },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

/**
 * Returns the Phase 1 placeholder decision for any DecisionContext.
 * Context establishes the contract; it is not evaluated yet.
 */
export function decide(_decisionContext: DecisionContext): DecideResult {
  return SCAFFOLD_DECISION;
}
