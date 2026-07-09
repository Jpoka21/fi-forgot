/**
 * Builds ranked Concierge workspace payload for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import { planAttentionOrder } from "../attention/planAttentionOrder";
import type { BrainExecutionResult } from "../orchestrator";
import { buildConciergeInsight } from "./buildConciergeInsight";
import { buildConciergeRecommendation } from "./buildConciergeRecommendation";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
  CONCIERGE_WORKSPACE_VERSION,
  type ConciergeWorkspaceResponse,
} from "./conciergeTypes";

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

export async function buildConciergeWorkspace(
  options: BuildConciergeWorkspaceOptions,
): Promise<ConciergeWorkspaceResponse> {
  const { userId, recipients, runBrain, generatedAt = new Date().toISOString() } = options;

  const decisions = await collectProductBrainDecisions({
    userId,
    recipients,
    runBrain,
  });

  const ranked = planAttentionOrder({ decisions, recipients });
  const recommendationItems = ranked.slice(0, CONCIERGE_RECOMMENDATIONS_MAX);
  const insightItems = ranked.slice(0, CONCIERGE_INSIGHTS_MAX);

  const recommendations = recommendationItems.map((item) =>
    buildConciergeRecommendation(item.decision, {
      recipientId: item.recipientId,
      recipientName: item.recipientName,
    }),
  );
  const insights = insightItems.map((item) =>
    buildConciergeInsight(item.decision, {
      recipientId: item.recipientId,
      recipientName: item.recipientName,
    }),
  );

  return {
    version: CONCIERGE_WORKSPACE_VERSION,
    generatedAt,
    recommendations,
    insights,
  };
}
