import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { OpportunityFeedbackEvent } from "./conciergeWorkspaceTypes";

export function fetchOpportunityFeedback() {
  return apiFetch<{ history: OpportunityFeedbackEvent[]; active: OpportunityFeedbackEvent[] }>(API_ENDPOINTS.concierge.opportunityFeedback, { throwOnError: true });
}
