/**
 * Inclusion rules for Concierge workspace relationship opportunities.
 */

import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import type { BrainDecisionOutcome } from "../types";

const INCLUDED_OUTCOMES = new Set<BrainDecisionOutcome>([
  "ask_question",
  "recommend_action",
  "show_dashboard_insight",
]);

export function shouldIncludeConciergeOpportunity(decision: ProductBrainDecision): boolean {
  if (decision.sourceRuleId === "wait") return false;

  const outcome = decision.decision.outcome;
  if (outcome === "wait" || outcome === "do_nothing") return false;
  if (outcome === "prepare_card") return false;

  return INCLUDED_OUTCOMES.has(outcome);
}
