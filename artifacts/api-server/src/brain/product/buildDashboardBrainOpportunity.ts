/**
 * Maps ProductBrainDecision + recipient display data to DashboardBrainOpportunity.
 */

import { resolveProductBrainActionHref } from "./buildBrainEventActionHref";
import { resolveDashboardBrainActionLabel } from "./dashboardBrainActionLabels";
import type { DashboardBrainOpportunity } from "./dashboardBrainOpportunitiesTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export interface DashboardRecipientDisplay {
  recipientId: string;
  recipientName: string;
}

export function buildDashboardBrainOpportunity(
  decision: ProductBrainDecision,
  recipient: DashboardRecipientDisplay,
  rank: number,
): DashboardBrainOpportunity {
  return {
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
    sourceRuleId: decision.sourceRuleId,
    outcome: decision.decision.outcome,
    priority: decision.actionPlan.priority,
    title: decision.display.title,
    explanation: decision.display.explanation,
    profileHref: resolveProductBrainActionHref(decision, recipient.recipientId),
    actionLabel: resolveDashboardBrainActionLabel(decision.sourceRuleId, {
      routingExperience: decision.actionPlan.routing?.experience,
    }),
    rank,
  };
}
