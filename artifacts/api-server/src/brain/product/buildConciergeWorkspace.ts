/**
 * Builds ranked Concierge workspace payload for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import { shouldIncludeOpportunity } from "../attention/shouldIncludeOpportunity";
import type { BrainExecutionResult } from "../orchestrator";
import { buildConciergeInsight } from "./buildConciergeInsight";
import { buildConciergeRecommendation } from "./buildConciergeRecommendation";
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

  const decisions = await collectProductBrainDecisions({
    userId,
    recipients,
    runBrain,
  });

  const rankable: RankableRelationshipOpportunity[] = [];

  for (let index = 0; index < recipients.length; index++) {
    const recipient = recipients[index]!;
    const decision = decisions[index]!;
    if (!shouldIncludeOpportunity(decision)) continue;
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
