/**
 * Inclusion rules for dashboard Brain opportunities.
 */

import { shouldIncludeOpportunity } from "../attention/shouldIncludeOpportunity";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export function shouldIncludeDashboardOpportunity(decision: ProductBrainDecision): boolean {
  return shouldIncludeOpportunity(decision);
}
