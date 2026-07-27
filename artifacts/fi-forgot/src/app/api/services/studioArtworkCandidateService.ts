import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { StudioArtworkCandidate } from "@/app/studio/artworkCandidatesDomain";
import type { ApiResult } from "@/app/api/shared/types";

export interface StudioArtworkCandidatesListResponse {
  artworkCandidates: StudioArtworkCandidate[];
}

export interface StudioArtworkCandidateResponse {
  artworkCandidate: StudioArtworkCandidate;
}

export type CreateArtworkCandidatePayload = {
  name: string;
  brief?: string;
};

export const studioArtworkCandidateService = {
  list(
    collectionId: string,
    slotId: string,
  ): Promise<ApiResult<StudioArtworkCandidatesListResponse>> {
    return apiFetch<StudioArtworkCandidatesListResponse>(
      API_ENDPOINTS.studio.artworkCandidates(collectionId, slotId),
    );
  },

  getById(
    collectionId: string,
    slotId: string,
    candidateId: string,
  ): Promise<ApiResult<StudioArtworkCandidateResponse>> {
    return apiFetch<StudioArtworkCandidateResponse>(
      API_ENDPOINTS.studio.artworkCandidateById(collectionId, slotId, candidateId),
    );
  },

  create(
    collectionId: string,
    slotId: string,
    payload: CreateArtworkCandidatePayload,
  ): Promise<ApiResult<StudioArtworkCandidateResponse>> {
    return apiFetch<StudioArtworkCandidateResponse>(
      API_ENDPOINTS.studio.artworkCandidates(collectionId, slotId),
      {
        method: "POST",
        json: payload,
      },
    );
  },
};
