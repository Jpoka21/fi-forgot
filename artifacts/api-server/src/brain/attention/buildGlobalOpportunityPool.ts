/**
 * Builds the global opportunity pool from collected ProductBrainDecision values.
 * No filtering, ranking, suppression, or DTO mapping.
 */

import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";
import { buildOpportunityKey } from "./buildOpportunityKey";
import type { GlobalOpportunity } from "./globalOpportunityTypes";

export interface GlobalOpportunityRecipientDisplay {
  recipientId: string;
  recipientName: string;
}

export interface BuildGlobalOpportunityPoolInput {
  decisions: ProductBrainDecision[];
  recipients: GlobalOpportunityRecipientDisplay[];
}

export { buildOpportunityKey } from "./buildOpportunityKey";

export function buildGlobalOpportunityPool(
  input: BuildGlobalOpportunityPoolInput,
): GlobalOpportunity[] {
  const { decisions, recipients } = input;

  return decisions.map((decision, index) => {
    const display = recipients[index];
    const recipientId = decision.recipientId;
    const recipientName = display?.recipientName ?? recipientId;

    return {
      opportunityKey: buildOpportunityKey(recipientId, decision.sourceRuleId),
      recipientId,
      recipientName,
      decision,
      attentionScore: null,
      globalRank: null,
      suppressionReason: null,
      metadata: {},
    };
  });
}
