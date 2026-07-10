/**
 * Server-side Brain opportunity resolution for persisted personal cards.
 */

import { buildOpportunityKey } from "../../attention/buildOpportunityKey";
import { assertValidBrainOutcomeOpportunityIdentity } from "../outcomeTypes";
import type { PersistedPersonalCard, ResolvedCardOutcomeContext } from "./cardOutcomeTypes";

export function resolveCardOutcomeContext(
  card: PersistedPersonalCard,
): ResolvedCardOutcomeContext | null {
  if (!card.brainSourceRuleId) {
    return null;
  }

  const opportunityKey = buildOpportunityKey(card.recipientId, card.brainSourceRuleId);
  assertValidBrainOutcomeOpportunityIdentity({
    opportunityKey,
    recipientId: card.recipientId,
  });

  return {
    userId: card.userId,
    recipientId: card.recipientId,
    opportunityKey,
    metadata: {
      cardId: card.id,
      cardStatus: card.status,
    },
  };
}
