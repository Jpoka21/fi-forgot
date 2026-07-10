/**
 * Evaluate fatigue rules for a single ranked opportunity.
 */

import type { GlobalOpportunity } from "../attention/globalOpportunityTypes";
import type { FatigueContext, FatigueSuppressionReason } from "./fatigueTypes";
import { evaluateRecentlySurfacedRule } from "./rules/recentlySurfacedRule";

export type EvaluatedFatigueOpportunity = {
  fatigueDecision: "visible" | "suppressed";
  suppressionReason: FatigueSuppressionReason | null;
};

export function evaluateFatigueOpportunity(
  opportunity: GlobalOpportunity,
  context: FatigueContext,
): EvaluatedFatigueOpportunity {
  return evaluateRecentlySurfacedRule(opportunity, context);
}
