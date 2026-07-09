/**
 * Shared deterministic ranking for relationship Brain opportunities.
 *
 * Used by Dashboard Brain, Notifications Brain, and Concierge Brain.
 * Uses rule registry priority order, then action plan priority, then recipient id.
 */

import type { ActionPriority } from "../action/actionPlanTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

/** Rule priorities aligned with brain/decision/rules/*Rule.ts candidates. */
export const RULE_PRIORITY_BY_ID: Record<string, number> = {
  birthday: 50,
  anniversary: 45,
  valentines_day: 42,
  inactivity: 41,
  fresh_update: 40,
  life_event_follow_up: 38,
  card_gap: 35,
  memory_accumulation: 34,
  accomplishment_follow_up: 33,
  wait: 0,
};

const ACTION_PRIORITY_RANK: Record<ActionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export interface RankableRelationshipOpportunity {
  decision: ProductBrainDecision;
  recipientId: string;
  recipientName: string;
}

function rulePriority(sourceRuleId: string): number {
  return RULE_PRIORITY_BY_ID[sourceRuleId] ?? -1;
}

export function compareRankableRelationshipOpportunities(
  left: RankableRelationshipOpportunity,
  right: RankableRelationshipOpportunity,
): number {
  const ruleDelta =
    rulePriority(right.decision.sourceRuleId) - rulePriority(left.decision.sourceRuleId);
  if (ruleDelta !== 0) return ruleDelta;

  const actionDelta =
    ACTION_PRIORITY_RANK[left.decision.actionPlan.priority]
    - ACTION_PRIORITY_RANK[right.decision.actionPlan.priority];
  if (actionDelta !== 0) return actionDelta;

  return left.recipientId.localeCompare(right.recipientId);
}

export function rankRelationshipOpportunities(
  items: RankableRelationshipOpportunity[],
): RankableRelationshipOpportunity[] {
  return [...items].sort(compareRankableRelationshipOpportunities);
}
