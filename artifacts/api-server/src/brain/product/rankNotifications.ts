/**
 * Deterministic ranking for relationship Brain notifications.
 *
 * Delegates to shared rankRelationshipOpportunities.
 */

import {
  compareRankableRelationshipOpportunities,
  rankRelationshipOpportunities,
  type RankableRelationshipOpportunity,
} from "./rankRelationshipOpportunities";

export type RankableNotification = RankableRelationshipOpportunity;

export const compareRankableNotifications = compareRankableRelationshipOpportunities;

export function rankNotifications(items: RankableNotification[]): RankableNotification[] {
  return rankRelationshipOpportunities(items);
}
