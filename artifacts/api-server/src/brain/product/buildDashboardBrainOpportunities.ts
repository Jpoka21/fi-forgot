/**
 * Builds ranked DashboardBrainOpportunities for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import type { BrainExecutionResult } from "../orchestrator";
import { buildDashboardBrainOpportunity } from "./buildDashboardBrainOpportunity";
import {
  DASHBOARD_BRAIN_OPPORTUNITIES_MAX,
  DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
  type DashboardBrainOpportunities,
} from "./dashboardBrainOpportunitiesTypes";
import { orchestrateProductBrainFatigue } from "./orchestrateProductBrainFatigue";

export interface DashboardRecipientInput {
  recipientId: string;
  recipientName: string;
}

export type RunBrainForRecipient = (
  recipientId: string,
  userId: string,
) => Promise<BrainExecutionResult>;

export interface BuildDashboardBrainOpportunitiesOptions {
  userId: string;
  recipients: DashboardRecipientInput[];
  runBrain: RunBrainForRecipient;
  generatedAt?: string;
}

export async function buildDashboardBrainOpportunities(
  options: BuildDashboardBrainOpportunitiesOptions,
): Promise<DashboardBrainOpportunities> {
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
      const capped = visibleFatigueOpportunities.slice(0, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
      const opportunities = capped.map((item, index) =>
        buildDashboardBrainOpportunity(
          item.opportunity.decision,
          {
            recipientId: item.opportunity.recipientId,
            recipientName: item.opportunity.recipientName,
          },
          item.opportunity.globalRank ?? index + 1,
        ),
      );

      return {
        product: {
          version: DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
          generatedAt: buildGeneratedAt,
          opportunities,
          spotlight: opportunities[0] ?? null,
        },
        deliveredFatigueOpportunities: capped,
      };
    },
  });
}
