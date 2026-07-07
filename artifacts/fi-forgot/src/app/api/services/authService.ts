import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";

export interface AuthSessionResponse {
  userId?: string;
}

export interface BusinessSettingsPayload {
  businessId: string;
  email?: string;
  bizType?: string;
  [key: string]: unknown;
}

export const authService = {
  connectSession(email: string, name?: string) {
    return apiFetch<AuthSessionResponse>(API_ENDPOINTS.auth.session, {
      method: "POST",
      json: { email: email.toLowerCase().trim(), name },
    });
  },

  registerBusinessEmail(payload: BusinessSettingsPayload) {
    return apiFetch(API_ENDPOINTS.business.settings, {
      method: "POST",
      json: {
        businessId: payload.businessId,
        email: payload.email?.toLowerCase().trim(),
        bizType: payload.bizType || undefined,
      },
    });
  },

  getBusinessSettingsByEmail(email: string) {
    return apiFetch(
      `${API_ENDPOINTS.business.settingsByEmail}?email=${encodeURIComponent(email.toLowerCase().trim())}`,
    );
  },

  getBusinessSettings(businessId: string) {
    return apiFetch(API_ENDPOINTS.business.settingsQuery(businessId));
  },

  saveBusinessSettings(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.business.settings, {
      method: "POST",
      json: payload,
    });
  },
};
