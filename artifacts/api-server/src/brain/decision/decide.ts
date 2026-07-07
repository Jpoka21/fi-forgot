/**
 * Decision Engine — read-only scaffold.
 *
 * Accepts relationship context from loadRelationshipContext() and returns a
 * fixed placeholder decision. No scoring, no AI, no side effects.
 * Phase 1 always waits — the Brain is not yet authorized to act.
 */

import type {
  BrainDecision,
  RelationshipContextLoadResult,
} from "../types";

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
 * Returns the Phase 1 placeholder decision for any relationship context.
 * Context is accepted to establish the contract; it is not evaluated yet.
 */
export function decide(_context: RelationshipContextLoadResult): DecideResult {
  return SCAFFOLD_DECISION;
}
