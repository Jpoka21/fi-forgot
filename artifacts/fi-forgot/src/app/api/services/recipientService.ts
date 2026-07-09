import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { ProductBrainDecision } from "@/app/product-brain/productBrainDecisionTypes";
import type { Recipient } from "@/lib/data";

export {
  deleteRecipient,
  getRecipient,
  getRecipients,
  getArchivedRecipients,
  hydrateRecipientsFromServer,
  restoreRecipient,
  saveRecipient,
  setServerSyncUserId,
  getServerUserId,
} from "@/lib/data";

export interface RecipientsListResponse {
  recipients: Recipient[];
}

export const recipientService = {
  list(userId: string) {
    return apiFetch<RecipientsListResponse>(API_ENDPOINTS.recipients.list, {
      userId,
    });
  },

  getById(id: string) {
    return apiFetch<Recipient>(API_ENDPOINTS.recipients.byId(id));
  },

  update(id: string, recipient: Recipient) {
    return apiFetch(API_ENDPOINTS.recipients.byId(id), {
      method: "PUT",
      json: recipient,
    });
  },

  archive(id: string) {
    return apiFetch(API_ENDPOINTS.recipients.byId(id), {
      method: "DELETE",
    });
  },

  restoreOnServer(id: string) {
    return apiFetch(API_ENDPOINTS.recipients.restore(id), {
      method: "POST",
    });
  },

  checkExists(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.recipients.check, {
      method: "POST",
      json: payload,
    });
  },

  create(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.recipients.create, {
      method: "POST",
      json: payload,
    });
  },

  getFreshUpdates(recipientId: string) {
    return apiFetch(API_ENDPOINTS.recipients.freshUpdates(recipientId));
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

  getHealth() {
    return apiFetch(API_ENDPOINTS.recipients.health);
  },

  getBrainDecision(recipientId: string) {
    return apiFetch<ProductBrainDecision>(API_ENDPOINTS.recipients.brain(recipientId));
  },
};
