import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { ApiRequestConfig } from "@/app/api/shared/types";
import type { ConciergeWorkspaceResponse } from "@/app/concierge-brain/conciergeWorkspaceTypes";

export function fetchConciergeWorkspace(
  config: Pick<ApiRequestConfig, "userId" | "throwOnError" | "retries"> = {},
) {
  return apiFetch<ConciergeWorkspaceResponse>(API_ENDPOINTS.concierge.workspace, config);
}
