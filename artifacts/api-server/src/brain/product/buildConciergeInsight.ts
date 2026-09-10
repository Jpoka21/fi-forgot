/**
 * Maps ProductBrainDecision + recipient display data to ConciergeInsight.
 */

import { resolveProductBrainActionHref } from "./buildBrainEventActionHref";
import { buildConciergeRecommendationId } from "./buildConciergeRecommendation";
import type { ConciergeInsight } from "./conciergeTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import type { ConciergeRecipientDisplay } from "./buildConciergeRecommendation";
import type { RelationshipOpportunity } from "./relationshipOpportunityTypes";

export function buildConciergeInsightId(recipientId: string, sourceRuleId: string): string {
  return `${buildConciergeRecommendationId(recipientId, sourceRuleId)}:insight`;
}

export function projectConciergeInsight(opportunity: RelationshipOpportunity): ConciergeInsight {
  return {
    id: `${opportunity.id}:insight`,
    recipientId: opportunity.recipient.id,
    recipientName: opportunity.recipient.name,
    title: opportunity.title,
    body: opportunity.explanation,
    ...(opportunity.recommendation ? { href: opportunity.recommendation.href } : {}),
  };
}

export function buildConciergeInsight(
  decision: ProductBrainDecision,
  recipient: ConciergeRecipientDisplay,
): ConciergeInsight {
  return {
    id: buildConciergeInsightId(recipient.recipientId, decision.sourceRuleId),
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
    title: decision.display.title,
    body: decision.display.explanation,
    href: resolveProductBrainActionHref(decision, recipient.recipientId),
  };
}
