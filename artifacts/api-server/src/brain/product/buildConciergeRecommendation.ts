/**
 * Maps ProductBrainDecision + recipient display data to ConciergeRecommendation.
 */

import { resolveDashboardBrainActionLabel } from "./dashboardBrainActionLabels";
import {
  CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  type ConciergeRecommendation,
} from "./conciergeTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export interface ConciergeRecipientDisplay {
  recipientId: string;
  recipientName: string;
}

export function buildConciergeRecommendationId(
  recipientId: string,
  sourceRuleId: string,
): string {
  return `${recipientId}:${sourceRuleId}`;
}

export function buildConciergeRecommendation(
  decision: ProductBrainDecision,
  recipient: ConciergeRecipientDisplay,
): ConciergeRecommendation {
  return {
    id: buildConciergeRecommendationId(recipient.recipientId, decision.sourceRuleId),
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
    title: decision.display.title,
    body: decision.display.explanation,
    href: `/relationship/${recipient.recipientId}`,
    actionLabel: resolveDashboardBrainActionLabel(decision.sourceRuleId),
    priority: decision.actionPlan.priority,
    kind: CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  };
}
