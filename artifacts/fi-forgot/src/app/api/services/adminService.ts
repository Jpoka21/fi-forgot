import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";

export const adminService = {
  resetAllData() {
    return apiFetch(API_ENDPOINTS.admin.resetAllData, { method: "POST" });
  },

  getLeads() {
    return apiFetch(API_ENDPOINTS.admin.leads);
  },

  getPrintAudit() {
    return apiFetch(API_ENDPOINTS.admin.printAudit);
  },

  generateMessage(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.generateMessage, {
      method: "POST",
      json: payload,
    });
  },

  suggestCard(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.suggestCard, {
      method: "POST",
      json: payload,
    });
  },

  requestCustomerApproval(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.requestCustomerApproval, {
      method: "POST",
      json: payload,
    });
  },

  getHandwryttenCards() {
    return apiFetch(API_ENDPOINTS.admin.handwryttenCards);
  },

  listHandwryttenOrders(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.handwryttenOrders, {
      method: "POST",
      json: payload,
    });
  },

  getHandwryttenOrderStatus(orderId: string) {
    return apiFetch(API_ENDPOINTS.admin.handwryttenOrderStatus(orderId));
  },

  cancelHandwryttenOrder(orderId: string) {
    return apiFetch(API_ENDPOINTS.admin.handwryttenOrderCancel(orderId), {
      method: "POST",
    });
  },

  listCardLibrary(query: string) {
    return apiFetch(`${API_ENDPOINTS.admin.cardLibrary}?${query}`);
  },

  getCardLibraryCategories() {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryCategories);
  },

  updateCardLibraryItem(id: string, payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryById(id), {
      method: "PUT",
      json: payload,
    });
  },

  deleteCardLibraryItem(id: string) {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryById(id), {
      method: "DELETE",
    });
  },

  suggestCardLibraryMetadata(id: string) {
    return apiFetch(API_ENDPOINTS.admin.cardLibrarySuggest(id));
  },

  regenerateCardLibraryItem(id: string) {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryRegenerate(id), {
      method: "POST",
    });
  },

  generateCardLibraryItem(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryGenerate, {
      method: "POST",
      json: payload,
    });
  },

  getCardLibraryMetadataAudit(query: string) {
    return apiFetch(`${API_ENDPOINTS.admin.cardLibraryMetadataAudit}?${query}`);
  },

  trackCardLibraryItem(id: string, payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryTrack(id), {
      method: "POST",
      json: payload,
    });
  },
};
