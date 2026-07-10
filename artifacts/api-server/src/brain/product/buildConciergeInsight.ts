/**
 * Maps ProductBrainDecision + recipient display data to ConciergeInsight.
 */

import { resolveProductBrainActionHref } from "./buildBrainEventActionHref";
import { buildConciergeRecommendationId } from "./buildConciergeRecommendation";
import type { ConciergeInsight } from "./conciergeTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import type { ConciergeRecipientDisplay } from "./buildConciergeRecommendation";

export function buildConciergeInsightId(recipientId: string, sourceRuleId: string): string {
  return `${buildConciergeRecommendationId(recipientId, sourceRuleId)}:insight`;
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
