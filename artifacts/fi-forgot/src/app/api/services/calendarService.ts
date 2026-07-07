import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { EventBriefing } from "@/lib/data";

export {
  deleteBriefing,
  getBriefing,
  getBriefings,
  getBriefingsForRecipient,
  hydrateBriefingsFromServer,
  saveBriefing,
} from "@/lib/data";

export interface BriefingsListResponse {
  briefings?: EventBriefing[];
}

export const calendarService = {
  listBriefings(userId: string) {
    return apiFetch<BriefingsListResponse>(API_ENDPOINTS.personal.briefings, {
      userId,
    });
  },

  saveBriefingOnServer(briefing: EventBriefing) {
    return apiFetch(API_ENDPOINTS.personal.briefings, {
      method: "POST",
      json: briefing,
    });
  },

  getRecipientHealth() {
    return apiFetch(API_ENDPOINTS.recipients.health);
  },
};
