export { fetchDashboardBrainOpportunities } from "@/app/dashboard-brain/fetchDashboardBrainOpportunities";
export { buildDashboardSnapshotForDisplay } from "@/app/dashboard-brain/buildDashboardSnapshotForDisplay";
export type {
  BuildDashboardSnapshotForDisplayDeps,
  FetchDashboardBrainOpportunities,
} from "@/app/dashboard-brain/buildDashboardSnapshotForDisplay";
export { isBrainDashboardEnabled } from "@/app/dashboard-brain/dashboardBrainConfig";
export { mergeBrainIntoSnapshot } from "@/app/dashboard-brain/mergeBrainIntoSnapshot";
export {
  mergeBrainHeroIntoSnapshot,
  mergeBrainSpotlightIntoSnapshot,
  mergeBrainSuggestedActionsIntoSnapshot,
} from "@/app/dashboard-brain/mergeBrainIntoSnapshot";
export type { MergeBrainIntoSnapshotOptions } from "@/app/dashboard-brain/mergeBrainIntoSnapshot";
export {
  DASHBOARD_SUGGESTED_ACTIONS_DISPLAY_LIMIT,
  limitDashboardSuggestedActions,
  resolveDashboardSuggestedActions,
} from "@/app/dashboard-brain/resolveDashboardSuggestedActions";
export type {
  DashboardSuggestedActionsRenderModel,
  DashboardSuggestedActionsSource,
  ResolveDashboardSuggestedActionsOptions,
} from "@/app/dashboard-brain/resolveDashboardSuggestedActions";
export {
  DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
  type DashboardBrainOpportunities,
  type DashboardBrainOpportunity,
} from "@/app/dashboard-brain/dashboardBrainOpportunitiesTypes";
export type { DashboardOpportunityViewModel } from "@/app/dashboard-brain/dashboardOpportunityViewModel";
export {
  dashboardOpportunityViewModelId,
  mapDashboardOpportunityViewModel,
} from "@/app/dashboard-brain/mapDashboardOpportunityViewModel";
