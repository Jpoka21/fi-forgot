/**
 * Shared inclusion rules for relationship Brain opportunities.
 * Product-agnostic — used before surface-specific mapping.
 */

import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";
import type { BrainDecisionOutcome } from "../types";

const INCLUDED_OUTCOMES = new Set<BrainDecisionOutcome>([
  "ask_question",
  "recommend_action",
  "show_dashboard_insight",
]);

export function shouldIncludeOpportunity(decision: ProductBrainDecision): boolean {
  if (decision.sourceRuleId === "wait") return false;

  const outcome = decision.decision.outcome;
  if (outcome === "wait" || outcome === "do_nothing") return false;
  if (outcome === "prepare_card") return false;

  return INCLUDED_OUTCOMES.has(outcome);
}
