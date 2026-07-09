/**
 * Internal attention pool types.
 *
 * GlobalOpportunity is never exposed through public API responses.
 */

import type { ProductBrainDecision } from "../product/productBrainDecisionTypes";

/** Reserved for future planner/fatigue metadata. Empty in Step 4c. */
export type GlobalOpportunityMetadata = Record<string, never>;

/**
 * Internal wrapper around a ProductBrainDecision within the global opportunity pool.
 * Planner and fatigue layers populate score/rank/suppression in later steps.
 */
export interface GlobalOpportunity {
  opportunityKey: string;
  recipientId: string;
  recipientName: string;
  decision: ProductBrainDecision;
  attentionScore: number | null;
  globalRank: number | null;
  suppressionReason: null;
  metadata: GlobalOpportunityMetadata;
}
