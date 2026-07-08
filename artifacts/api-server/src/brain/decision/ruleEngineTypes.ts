/**
 * Internal rule engine result — decision output plus winning rule attribution.
 *
 * Not part of the public decision API or BrainResponse.
 */

import type { DecideResult } from "./decide";
import type { RuleEvaluationSummary } from "./rules/ruleEvaluationTypes";

export interface ResolvedDecision {
  decideResult: DecideResult;
  sourceRuleId: string;
}

export interface RuleEngineResult extends ResolvedDecision {
  /** Development-only evaluation trace. Not part of BrainResponse. */
  ruleEvaluation: RuleEvaluationSummary;
}
