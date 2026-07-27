import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { StudioArtworkSlot } from "@/app/studio/artworkSlotsDomain";
import type { ApiResult } from "@/app/api/shared/types";

export interface StudioArtworkSlotsListResponse {
  artworkSlots: StudioArtworkSlot[];
}

export interface StudioArtworkSlotResponse {
  artworkSlot: StudioArtworkSlot;
}

export type CreateArtworkSlotPayload = {
  name: string;
  brief?: string;
  quantity?: number;
};

export const studioArtworkSlotService = {
  list(collectionId: string): Promise<ApiResult<StudioArtworkSlotsListResponse>> {
    return apiFetch<StudioArtworkSlotsListResponse>(
      API_ENDPOINTS.studio.artworkSlots(collectionId),
    );
  },

  getById(collectionId: string, slotId: string): Promise<ApiResult<StudioArtworkSlotResponse>> {
    return apiFetch<StudioArtworkSlotResponse>(
      API_ENDPOINTS.studio.artworkSlotById(collectionId, slotId),
    );
  },

  create(
    collectionId: string,
    payload: CreateArtworkSlotPayload,
  ): Promise<ApiResult<StudioArtworkSlotResponse>> {
    return apiFetch<StudioArtworkSlotResponse>(
      API_ENDPOINTS.studio.artworkSlots(collectionId),
      {
        method: "POST",
        json: payload,
      },
    );
  },
};
