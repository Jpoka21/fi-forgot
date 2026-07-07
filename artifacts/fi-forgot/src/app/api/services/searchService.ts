import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";

/**
 * Discovery and lookup helpers over existing endpoints.
 * Global search indexing lives in `@/app/search/searchEngine`.
 * No dedicated global search API exists yet.
 */
export const searchService = {
  checkRecipient(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.recipients.check, {
      method: "POST",
      json: payload,
    });
  },

  searchAdminCardLibrary(query: string) {
    return apiFetch(`${API_ENDPOINTS.admin.cardLibrary}?${query}`);
  },

  getAdminCardLibraryCategories() {
    return apiFetch(API_ENDPOINTS.admin.cardLibraryCategories);
  },
};
