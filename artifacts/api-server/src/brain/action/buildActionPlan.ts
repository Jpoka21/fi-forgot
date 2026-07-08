/**
 * Action Planner entry — categorizes a DecideResult without side effects.
 */

import type { ActionPlan, ActionPlanningInput } from "./actionPlanTypes";
import { confidenceToPriority, mapDecisionToPlan } from "./mapDecisionToPlan";

/**
 * Builds a structured ActionPlan from a decision and explicit rule attribution.
 * Pure, deterministic, read-only.
 */
export function buildActionPlan(input: ActionPlanningInput): ActionPlan {
  const { decideResult, sourceRuleId } = input;
  const { type, category } = mapDecisionToPlan(
    sourceRuleId,
    decideResult.decision.outcome,
  );

  return {
    type,
    category,
    priority: confidenceToPriority(decideResult.confidence),
    sourceRuleId,
    primaryReason: decideResult.reasons[0] ?? "",
    reasons: decideResult.reasons,
    confidence: decideResult.confidence,
    debugNotes: decideResult.debugNotes,
  };
}
