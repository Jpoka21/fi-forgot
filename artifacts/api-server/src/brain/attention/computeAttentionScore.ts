/**
 * Deterministic attention score aligned with rankRelationshipOpportunities ordering.
 *
 * Parity mode: uses RULE_PRIORITY_BY_ID and action plan priority only.
 * recipientId tie-breaking is applied during sort, not in the score.
 */

import type { ActionPriority } from "../action/actionPlanTypes";
import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";
import { RULE_PRIORITY_BY_ID } from "../product/rankRelationshipOpportunities";

const ACTION_PRIORITY_RANK: Record<ActionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function rulePriority(sourceRuleId: string): number {
  return RULE_PRIORITY_BY_ID[sourceRuleId] ?? -1;
}

/**
 * Higher score = more attention-worthy. Matches rule + action ordering from
 * compareRankableRelationshipOpportunities; recipientId breaks ties at sort time.
 */
export function computeAttentionScore(decision: ProductBrainDecision): number {
  const ruleComponent = rulePriority(decision.sourceRuleId) * 1_000;
  const actionComponent = (2 - ACTION_PRIORITY_RANK[decision.actionPlan.priority]) * 100;
  return ruleComponent + actionComponent;
}
