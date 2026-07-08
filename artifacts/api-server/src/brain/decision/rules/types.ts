/**
 * Rule Engine types — internal contracts for deterministic rule evaluation.
 */

import type { BrainDecision } from "../../types";
import type { DecisionContext } from "../decisionContextTypes";

export interface RuleCandidate {
  ruleId: string;
  priority: number;
  confidence: number;
  decision: BrainDecision;
  reasons: string[];
  debugNotes: string[];
}

export interface DecisionRule {
  readonly id: string;
  evaluate(context: DecisionContext): RuleCandidate | null;
}
