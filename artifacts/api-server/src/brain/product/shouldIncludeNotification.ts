/**
 * Inclusion rules for relationship Brain notifications.
 */

import { shouldIncludeOpportunity } from "../attention/shouldIncludeOpportunity";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export function shouldIncludeNotification(decision: ProductBrainDecision): boolean {
  return shouldIncludeOpportunity(decision);
}
