/**
 * Builds ranked Concierge workspace payload for all owned recipients.
 */

import { buildConciergeInsight } from "./buildConciergeInsight";
import { buildConciergeRecommendation } from "./buildConciergeRecommendation";
import { buildProductBrainDecision } from "./buildProductBrainDecision";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
  CONCIERGE_WORKSPACE_VERSION,
  type ConciergeWorkspaceResponse,
} from "./conciergeTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import {
  rankRelationshipOpportunities,
  type RankableRelationshipOpportunity,
} from "./rankRelationshipOpportunities";
import { shouldIncludeConciergeOpportunity } from "./shouldIncludeConciergeOpportunity";
import type { BrainExecutionResult } from "../orchestrator";

export interface ConciergeRecipientInput {
  recipientId: string;
  recipientName: string;
}

export type RunBrainForRecipient = (
  recipientId: string,
  userId: string,
) => Promise<BrainExecutionResult>;

export interface BuildConciergeWorkspaceOptions {
  userId: string;
  recipients: ConciergeRecipientInput[];
  runBrain: RunBrainForRecipient;
  generatedAt?: string;
}

function toRankable(
  decision: ProductBrainDecision,
  recipient: ConciergeRecipientInput,
): RankableRelationshipOpportunity {
  return {
    decision,
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
  };
}

export async function buildConciergeWorkspace(
  options: BuildConciergeWorkspaceOptions,
): Promise<ConciergeWorkspaceResponse> {
  const { userId, recipients, runBrain, generatedAt = new Date().toISOString() } = options;

  const rankable: RankableRelationshipOpportunity[] = [];

  for (const recipient of recipients) {
    const execution = await runBrain(recipient.recipientId, userId);
    const decision = buildProductBrainDecision(recipient.recipientId, execution);
    if (!shouldIncludeConciergeOpportunity(decision)) continue;
    rankable.push(toRankable(decision, recipient));
  }

  const ranked = rankRelationshipOpportunities(rankable);
  const recommendationItems = ranked.slice(0, CONCIERGE_RECOMMENDATIONS_MAX);
  const insightItems = ranked.slice(0, CONCIERGE_INSIGHTS_MAX);

  const recommendations = recommendationItems.map((item) =>
    buildConciergeRecommendation(item.decision, item),
  );
  const insights = insightItems.map((item) => buildConciergeInsight(item.decision, item));

  return {
    version: CONCIERGE_WORKSPACE_VERSION,
    generatedAt,
    recommendations,
    insights,
  };
}
