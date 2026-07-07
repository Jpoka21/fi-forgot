import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { CardOrder } from "@/lib/data";

export {
  deleteCard,
  getCards,
  hydrateCardsFromServer,
  saveCard,
  updateCard,
} from "@/lib/data";

export const cardService = {
  listPersonalCards(userId: string) {
    return apiFetch<{ cards?: CardOrder[] }>(API_ENDPOINTS.personal.cards, {
      userId,
    });
  },

  savePersonalCard(card: CardOrder) {
    return apiFetch(API_ENDPOINTS.personal.cards, {
      method: "POST",
      json: card,
    });
  },

  updatePersonalCard(id: string, card: CardOrder) {
    return apiFetch(API_ENDPOINTS.personal.cardById(id), {
      method: "PUT",
      json: card,
    });
  },

  deletePersonalCard(id: string) {
    return apiFetch(API_ENDPOINTS.personal.cardById(id), {
      method: "DELETE",
    });
  },

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

  editCard(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.cards.edit, {
      method: "POST",
      json: payload,
    });
  },

  previewCard(payload: Record<string, unknown>) {
    return apiFetch(API_ENDPOINTS.cards.preview, {
      method: "POST",
      json: payload,
    });
  },

  getPreviewByToken(token: string) {
    return apiFetch(API_ENDPOINTS.cards.previewByToken(token));
  },

  pickPersonalCard(query: string) {
    return apiFetch(`${API_ENDPOINTS.cards.pickPersonal}?${query}`);
  },

  getHandwryttenFonts() {
    return apiFetch<{ fonts?: unknown[] }>(API_ENDPOINTS.handwrytten.fonts);
  },
};
