/**
 * Deterministic ranking for relationship Brain notifications.
 *
 * Uses rule registry priority order, then action plan priority, then recipient id.
 */

import type { ActionPriority } from "../action/actionPlanTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import { RULE_PRIORITY_BY_ID } from "./rankDashboardOpportunities";

const ACTION_PRIORITY_RANK: Record<ActionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export interface RankableNotification {
  decision: ProductBrainDecision;
  recipientId: string;
  recipientName: string;
}

function rulePriority(sourceRuleId: string): number {
  return RULE_PRIORITY_BY_ID[sourceRuleId] ?? -1;
}

export function compareRankableNotifications(
  left: RankableNotification,
  right: RankableNotification,
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

export function rankNotifications(items: RankableNotification[]): RankableNotification[] {
  return [...items].sort(compareRankableNotifications);
}
