/**
 * Builds ranked DashboardBrainOpportunities for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import { shouldIncludeOpportunity } from "../attention/shouldIncludeOpportunity";
import type { BrainExecutionResult } from "../orchestrator";
import { buildDashboardBrainOpportunity } from "./buildDashboardBrainOpportunity";
import {
  DASHBOARD_BRAIN_OPPORTUNITIES_MAX,
  DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
  type DashboardBrainOpportunities,
} from "./dashboardBrainOpportunitiesTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import {
  rankDashboardOpportunities,
  type RankableDashboardOpportunity,
} from "./rankDashboardOpportunities";

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

function toRankable(
  decision: ProductBrainDecision,
  recipient: DashboardRecipientInput,
): RankableDashboardOpportunity {
  return {
    decision,
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
  };
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

  const rankable: RankableDashboardOpportunity[] = [];

  for (let index = 0; index < recipients.length; index++) {
    const recipient = recipients[index]!;
    const decision = decisions[index]!;
    if (!shouldIncludeOpportunity(decision)) continue;
    rankable.push(toRankable(decision, recipient));
  }

  const ranked = rankDashboardOpportunities(rankable);
  const capped = ranked.slice(0, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
  const opportunities = capped.map((item, index) =>
    buildDashboardBrainOpportunity(item.decision, item, index + 1),
  );

  return {
    version: DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
    generatedAt,
    opportunities,
    spotlight: opportunities[0] ?? null,
  };
}
