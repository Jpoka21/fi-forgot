import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { FiBrowniePointsAccountResponse } from "@/app/brownie-points/browniePointsDomain";

export const browniePointsService = {
  getAccount() {
    return apiFetch<FiBrowniePointsAccountResponse>(API_ENDPOINTS.notifications.brownieBalance);
  },

  award(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.notifications.brownieAward, {
      method: "POST",
      json: payload,
    });
  },
};
