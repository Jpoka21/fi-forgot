/**
 * Builds ranked Concierge workspace payload for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import type { BrainExecutionResult } from "../orchestrator";
import { buildConciergeInsight } from "./buildConciergeInsight";
import { buildConciergeRecommendation } from "./buildConciergeRecommendation";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
  CONCIERGE_WORKSPACE_VERSION,
  type ConciergeWorkspaceResponse,
} from "./conciergeTypes";
import { orchestrateProductBrainFatigue } from "./orchestrateProductBrainFatigue";
import type { FatigueOpportunity } from "../fatigue/fatigueTypes";

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

function dedupeDeliveredConciergeOpportunities(
  recommendationItems: FatigueOpportunity[],
  insightItems: FatigueOpportunity[],
): FatigueOpportunity[] {
  const seen = new Set<string>();
  const delivered: FatigueOpportunity[] = [];

  for (const item of [...recommendationItems, ...insightItems]) {
    const key = item.opportunity.opportunityKey;
    if (seen.has(key)) continue;
    seen.add(key);
    delivered.push(item);
  }

  return delivered;
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

  return orchestrateProductBrainFatigue({
    userId,
    generatedAt,
    decisions,
    recipients,
    buildFromVisible: (visibleFatigueOpportunities, buildGeneratedAt) => {
      const recommendationItems = visibleFatigueOpportunities.slice(0, CONCIERGE_RECOMMENDATIONS_MAX);
      const insightItems = visibleFatigueOpportunities.slice(0, CONCIERGE_INSIGHTS_MAX);

      const recommendations = recommendationItems.map((item) =>
        buildConciergeRecommendation(item.opportunity.decision, {
          recipientId: item.opportunity.recipientId,
          recipientName: item.opportunity.recipientName,
        }),
      );
      const insights = insightItems.map((item) =>
        buildConciergeInsight(item.opportunity.decision, {
          recipientId: item.opportunity.recipientId,
          recipientName: item.opportunity.recipientName,
        }),
      );

      return {
        product: {
          version: CONCIERGE_WORKSPACE_VERSION,
          generatedAt: buildGeneratedAt,
          recommendations,
          insights,
        },
        deliveredFatigueOpportunities: dedupeDeliveredConciergeOpportunities(
          recommendationItems,
          insightItems,
        ),
      };
    },
  });
}
