/**
 * Dashboard Brain Opportunities — dashboard-specific public contract (v1).
 */

import type { ActionPriority } from "../action/actionPlanTypes";
import type { BrainDecisionOutcome } from "../types";

export const DASHBOARD_BRAIN_OPPORTUNITIES_VERSION = 1 as const;

/** Maximum ranked opportunities returned in one dashboard payload. */
export const DASHBOARD_BRAIN_OPPORTUNITIES_MAX = 10 as const;

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
