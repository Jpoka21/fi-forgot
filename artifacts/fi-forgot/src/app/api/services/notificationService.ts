import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";

export interface BrownieBalanceResponse {
  balance: number;
  lifetime: number;
}

/**
 * Notification-related API surface available today.
 * In-app notification inbox indexing lives in `@/app/notification/notificationEngine`.
 * A dedicated notification center API will be added in a later milestone.
 */
export const notificationService = {
  getBrowniePointsBalance() {
    return apiFetch<BrownieBalanceResponse>(API_ENDPOINTS.notifications.brownieBalance);
  },

  awardBrowniePoints(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.notifications.brownieAward, {
      method: "POST",
      json: payload,
    });
  },

  getBusinessSettings(businessId: string) {
    return apiFetch(API_ENDPOINTS.business.settingsQuery(businessId));
  },
};
