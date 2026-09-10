/**
 * Maps ProductBrainDecision + recipient display data to ConciergeRecommendation.
 */

import { resolveProductBrainActionHref } from "./buildBrainEventActionHref";
import { resolveDashboardBrainActionLabel } from "./dashboardBrainActionLabels";
import {
  CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  type ConciergeRecommendation,
} from "./conciergeTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import type { RelationshipOpportunity } from "./relationshipOpportunityTypes";

export interface ConciergeRecipientDisplay {
  recipientId: string;
  recipientName: string;
}

export function projectConciergeRecommendation(
  opportunity: RelationshipOpportunity,
): ConciergeRecommendation {
  if (!opportunity.recommendation) {
    throw new Error("Cannot project a recommendation from a restrained Opportunity");
  }
  return {
    id: opportunity.id,
    recipientId: opportunity.recipient.id,
    recipientName: opportunity.recipient.name,
    title: opportunity.title,
    body: opportunity.explanation,
    href: opportunity.recommendation.href,
    actionLabel: opportunity.recommendation.label,
    priority: opportunity.recommendation.priority,
    kind: CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  };
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
    href: resolveProductBrainActionHref(decision, recipient.recipientId),
    actionLabel: resolveDashboardBrainActionLabel(decision.sourceRuleId, {
      routingExperience: decision.actionPlan.routing?.experience,
    }),
    priority: decision.actionPlan.priority,
    kind: CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  };
}
