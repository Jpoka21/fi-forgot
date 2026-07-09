/**
 * Dashboard Brain Opportunities — frontend mirror of GET /api/v2/dashboard/brain-opportunities (v1).
 */

import type {
  ActionPriority,
  BrainDecisionOutcome,
} from "@/app/product-brain/productBrainDecisionTypes";

export const DASHBOARD_BRAIN_OPPORTUNITIES_VERSION = 1 as const;

export interface DashboardBrainOpportunity {
  recipientId: string;
  recipientName: string;
  sourceRuleId: string;
  outcome: BrainDecisionOutcome;
  priority: ActionPriority;
  title: string;
  explanation: string;
  profileHref: string;
  actionLabel: string;
  rank: number;
}

export interface DashboardBrainOpportunities {
  version: typeof DASHBOARD_BRAIN_OPPORTUNITIES_VERSION;
  generatedAt: string;
  opportunities: DashboardBrainOpportunity[];
  spotlight: DashboardBrainOpportunity | null;
}
