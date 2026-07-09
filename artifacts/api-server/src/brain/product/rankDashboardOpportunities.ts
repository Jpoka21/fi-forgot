/**
 * Deterministic ranking for dashboard Brain opportunities.
 *
 * Delegates to shared rankRelationshipOpportunities.
 */

import type { DashboardBrainOpportunity } from "./dashboardBrainOpportunitiesTypes";
import {
  compareRankableRelationshipOpportunities,
  rankRelationshipOpportunities,
  RULE_PRIORITY_BY_ID,
  type RankableRelationshipOpportunity,
} from "./rankRelationshipOpportunities";

export { RULE_PRIORITY_BY_ID };

export type RankableDashboardOpportunity = RankableRelationshipOpportunity;

export const compareRankableDashboardOpportunities = compareRankableRelationshipOpportunities;

export function rankDashboardOpportunities(
  items: RankableDashboardOpportunity[],
): RankableDashboardOpportunity[] {
  return rankRelationshipOpportunities(items);
}

export function assignOpportunityRanks(
  opportunities: DashboardBrainOpportunity[],
): DashboardBrainOpportunity[] {
  return opportunities.map((opportunity, index) => ({
    ...opportunity,
    rank: index + 1,
  }));
}
