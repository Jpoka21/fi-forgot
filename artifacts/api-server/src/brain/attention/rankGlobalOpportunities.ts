/**
 * Ranks included GlobalOpportunity items for the Brain Attention Planner.
 * Product-agnostic; no caps or DTO mapping.
 */

import type { GlobalOpportunity } from "./globalOpportunityTypes";
import { computeAttentionScore } from "./computeAttentionScore";
import { shouldIncludeOpportunity } from "./shouldIncludeOpportunity";

export function compareGlobalOpportunities(
  left: GlobalOpportunity,
  right: GlobalOpportunity,
): number {
  const scoreDelta = (right.attentionScore ?? 0) - (left.attentionScore ?? 0);
  if (scoreDelta !== 0) return scoreDelta;

  return left.recipientId.localeCompare(right.recipientId);
}

export function rankGlobalOpportunities(pool: GlobalOpportunity[]): GlobalOpportunity[] {
  const included = pool
    .filter((item) => shouldIncludeOpportunity(item.decision))
    .map((item) => ({
      ...item,
      attentionScore: computeAttentionScore(item.decision),
      globalRank: null,
      suppressionReason: null,
      metadata: { ...item.metadata },
    }));

  included.sort(compareGlobalOpportunities);

  return included.map((item, index) => ({
    ...item,
    globalRank: index + 1,
  }));
}
