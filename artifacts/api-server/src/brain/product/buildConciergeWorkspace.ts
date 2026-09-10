/**
 * Builds ranked Concierge workspace payload for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import type { BrainExecutionResult } from "../orchestrator";
import { projectConciergeInsight } from "./buildConciergeInsight";
import { projectConciergeRecommendation } from "./buildConciergeRecommendation";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
  CONCIERGE_WORKSPACE_VERSION,
  type ConciergeWorkspaceResponse,
} from "./conciergeTypes";
import { orchestrateProductBrainFatigue } from "./orchestrateProductBrainFatigue";
import type { FatigueOpportunity } from "../fatigue/fatigueTypes";
import { buildRelationshipOpportunity } from "./buildRelationshipOpportunity";
import { shouldIncludeConciergeOpportunity } from "./shouldIncludeConciergeOpportunity";

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

  const executions = new Map<string, BrainExecutionResult>();
  const decisions = await collectProductBrainDecisions({
    userId,
    recipients,
    runBrain: async (recipientId, ownerId) => {
      const execution = await runBrain(recipientId, ownerId);
      executions.set(recipientId, execution);
      return execution;
    },
  });

  return orchestrateProductBrainFatigue({
    userId,
    generatedAt,
    decisions,
    recipients,
    buildFromVisible: (visibleFatigueOpportunities, buildGeneratedAt) => {
      const recommendationItems = visibleFatigueOpportunities.slice(0, CONCIERGE_RECOMMENDATIONS_MAX);
      const insightItems = visibleFatigueOpportunities.slice(0, CONCIERGE_INSIGHTS_MAX);
      const primaryOpportunityItems = visibleFatigueOpportunities.slice(
        0,
        Math.max(CONCIERGE_RECOMMENDATIONS_MAX, CONCIERGE_INSIGHTS_MAX),
      );

      const visibleOpportunities = primaryOpportunityItems.map((item) => {
        const execution = executions.get(item.opportunity.recipientId);
        if (!execution) throw new Error("Missing Brain execution for Concierge opportunity");
        return buildRelationshipOpportunity(item.opportunity.decision, execution, {
          recipientId: item.opportunity.recipientId,
          recipientName: item.opportunity.recipientName,
        });
      });

      const restrainedOpportunities = decisions
        .filter((decision) => !shouldIncludeConciergeOpportunity(decision))
        .map((decision) => {
          const execution = executions.get(decision.recipientId);
          const recipient = recipients.find((item) => item.recipientId === decision.recipientId);
          if (!execution || !recipient) throw new Error("Missing Brain input for restrained Concierge Opportunity");
          return buildRelationshipOpportunity(decision, execution, recipient);
        });
      const opportunities = [...visibleOpportunities, ...restrainedOpportunities];

      // Compatibility projection: preserve the pre-Opportunity DTO membership and shape.
      // Primary frontend behavior consumes `opportunities`, including restraint.
      const recommendations = visibleOpportunities
        .slice(0, CONCIERGE_RECOMMENDATIONS_MAX)
        .map(projectConciergeRecommendation);
      const visibleById = new Map(visibleOpportunities.map((item) => [item.id, item]));
      const insights = insightItems.map((item) => {
        const opportunity = visibleById.get(item.opportunity.opportunityKey);
        if (!opportunity) throw new Error("Missing primary Opportunity for Concierge insight projection");
        return projectConciergeInsight(opportunity);
      });

      return {
        product: {
          version: CONCIERGE_WORKSPACE_VERSION,
          generatedAt: buildGeneratedAt,
          opportunities,
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
