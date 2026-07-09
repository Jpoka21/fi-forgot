/**
 * Brain Attention Planner entry point — product-agnostic ranked opportunities.
 */

import {
  buildGlobalOpportunityPool,
  type GlobalOpportunityRecipientDisplay,
} from "./buildGlobalOpportunityPool";
import type { GlobalOpportunity } from "./globalOpportunityTypes";
import { rankGlobalOpportunities } from "./rankGlobalOpportunities";
import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";

export interface PlanAttentionOrderFromDecisionsInput {
  decisions: ProductBrainDecision[];
  recipients: GlobalOpportunityRecipientDisplay[];
}

export interface PlanAttentionOrderFromPoolInput {
  pool: GlobalOpportunity[];
}

export type PlanAttentionOrderInput =
  | PlanAttentionOrderFromDecisionsInput
  | PlanAttentionOrderFromPoolInput;

function isPoolInput(
  input: PlanAttentionOrderInput,
): input is PlanAttentionOrderFromPoolInput {
  return "pool" in input;
}

export function planAttentionOrder(input: PlanAttentionOrderInput): GlobalOpportunity[] {
  const pool = isPoolInput(input)
    ? input.pool
    : buildGlobalOpportunityPool({
        decisions: input.decisions,
        recipients: input.recipients,
      });

  return rankGlobalOpportunities(pool);
}
