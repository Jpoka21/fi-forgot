import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";

export const billingService = {
  getStripePlans() {
    return apiFetch(API_ENDPOINTS.billing.stripePlans);
  },

  createCheckoutSession(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.billing.stripeCheckout, {
      method: "POST",
      json: payload,
    });
  },
};
