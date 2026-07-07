import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";

export const aiConciergeService = {
  generateCard(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.cards.generate, {
      method: "POST",
      json: payload,
    });
  },

  generateCardV2(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.cards.generateV2, {
      method: "POST",
      json: payload,
    });
  },

  refineCardV2(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.cards.refineV2, {
      method: "POST",
      json: payload,
    });
  },

  getNextQuestion(recipientId: string) {
    return apiFetch(API_ENDPOINTS.recipients.nextQuestion(recipientId));
  },

  answerQuestion(recipientId: string, payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.recipients.answerQuestion(recipientId), {
      method: "POST",
      json: payload,
    });
  },

  generateSampleCardMessage(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.concierge.sampleCardMessage, {
      method: "POST",
      json: payload,
    });
  },

  generateBusinessCardMessage(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.business.cardMessage, {
      method: "POST",
      json: payload,
    });
  },

  getDemoPreview(id: string) {
    return apiFetch(API_ENDPOINTS.concierge.demoPreview(id));
  },

  refineDemoPreviewMessage(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.concierge.demoPreviewRefine, {
      method: "POST",
      json: payload,
    });
  },
};
