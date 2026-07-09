import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { ApiRequestConfig } from "@/app/api/shared/types";
import type { DashboardBrainOpportunities } from "@/app/dashboard-brain/dashboardBrainOpportunitiesTypes";

export function fetchDashboardBrainOpportunities(
  config: Pick<ApiRequestConfig, "userId" | "throwOnError" | "retries"> = {},
) {
  return apiFetch<DashboardBrainOpportunities>(API_ENDPOINTS.dashboard.brainOpportunities, config);
}
