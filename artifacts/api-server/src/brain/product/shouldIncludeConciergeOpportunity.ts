/**
 * Inclusion rules for Concierge workspace relationship opportunities.
 */

import { shouldIncludeOpportunity } from "../attention/shouldIncludeOpportunity";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export function shouldIncludeConciergeOpportunity(decision: ProductBrainDecision): boolean {
  return shouldIncludeOpportunity(decision);
}
