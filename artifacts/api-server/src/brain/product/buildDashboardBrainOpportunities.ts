/**
 * Builds ranked DashboardBrainOpportunities for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import { planAttentionOrder } from "../attention/planAttentionOrder";
import type { BrainExecutionResult } from "../orchestrator";
import { buildDashboardBrainOpportunity } from "./buildDashboardBrainOpportunity";
import {
  DASHBOARD_BRAIN_OPPORTUNITIES_MAX,
  DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
  type DashboardBrainOpportunities,
} from "./dashboardBrainOpportunitiesTypes";

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

  const ranked = planAttentionOrder({ decisions, recipients });
  const capped = ranked.slice(0, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  const opportunities = capped.map((item, index) =>
    buildDashboardBrainOpportunity(
      item.decision,
      { recipientId: item.recipientId, recipientName: item.recipientName },
      item.globalRank ?? index + 1,
    ),
  );

  return {
    version: DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
    generatedAt,
    opportunities,
    spotlight: opportunities[0] ?? null,
  };
}
