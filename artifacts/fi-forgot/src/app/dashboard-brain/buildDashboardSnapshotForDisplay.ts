import {
  buildDashboardSnapshot,
  type BuildDashboardSnapshotOptions,
} from "@/app/dashboard/dashboardEngine";
import type { FiDashboardSnapshot } from "@/app/dashboard/dashboardDomain";
import { isBrainDashboardEnabled } from "@/app/dashboard-brain/dashboardBrainConfig";
import type { DashboardBrainOpportunities } from "@/app/dashboard-brain/dashboardBrainOpportunitiesTypes";
import { fetchDashboardBrainOpportunities } from "@/app/dashboard-brain/fetchDashboardBrainOpportunities";
import {
  mergeBrainHeroIntoSnapshot,
  mergeBrainSpotlightIntoSnapshot,
  mergeBrainSuggestedActionsIntoSnapshot,
} from "@/app/dashboard-brain/mergeBrainIntoSnapshot";
import { mapDashboardOpportunityViewModel } from "@/app/dashboard-brain/mapDashboardOpportunityViewModel";
import type { DashboardOpportunityViewModel } from "@/app/dashboard-brain/dashboardOpportunityViewModel";
import type { ApiResult } from "@/app/api/shared/types";

export type FetchDashboardBrainOpportunities = () => Promise<
  ApiResult<DashboardBrainOpportunities>
>;

export interface BuildDashboardSnapshotForDisplayDeps {
  brainEnabled?: boolean;
  fetchOpportunities?: FetchDashboardBrainOpportunities;
  buildLegacySnapshot?: (options: BuildDashboardSnapshotOptions) => FiDashboardSnapshot;
}

export async function buildDashboardSnapshotForDisplay(
  options: BuildDashboardSnapshotOptions = {},
  deps: BuildDashboardSnapshotForDisplayDeps = {},
): Promise<FiDashboardSnapshot> {
  const buildLegacy = deps.buildLegacySnapshot ?? buildDashboardSnapshot;
  const legacySnapshot = buildLegacy(options);
  const brainEnabled = deps.brainEnabled ?? isBrainDashboardEnabled();

  if (!brainEnabled) {
    return legacySnapshot;
  }

  let opportunities: DashboardOpportunityViewModel[] = [];

  try {
    const fetchOpportunities = deps.fetchOpportunities ?? fetchDashboardBrainOpportunities;
    const result = await fetchOpportunities();
    if (result.ok && result.data) {
      opportunities = result.data.opportunities.map(mapDashboardOpportunityViewModel);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
  }

  const withSuggestedActions = mergeBrainSuggestedActionsIntoSnapshot({
    snapshot: legacySnapshot,
    opportunities,
    brainEnabled: true,
  });

  const withSpotlight = mergeBrainSpotlightIntoSnapshot({
    snapshot: withSuggestedActions,
    opportunities,
    brainEnabled: true,
  });

  return mergeBrainHeroIntoSnapshot({
    snapshot: withSpotlight,
    opportunities,
    brainEnabled: true,
  });
}
