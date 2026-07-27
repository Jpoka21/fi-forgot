import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { StudioCollection } from "@/app/studio/collectionsDomain";
import type { ApiResult } from "@/app/api/shared/types";

export interface StudioCollectionsListResponse {
  collections: StudioCollection[];
}

export interface StudioCollectionResponse {
  collection: StudioCollection;
}

export type CreateCollectionPayload = {
  name: string;
  occasion: string;
  relationship: string;
  style?: string;
  description?: string;
  status?: string;
};

export const studioCollectionService = {
  list(): Promise<ApiResult<StudioCollectionsListResponse>> {
    return apiFetch<StudioCollectionsListResponse>(API_ENDPOINTS.studio.collections);
  },

  getById(id: string): Promise<ApiResult<StudioCollectionResponse>> {
    return apiFetch<StudioCollectionResponse>(API_ENDPOINTS.studio.collectionById(id));
  },

  create(payload: CreateCollectionPayload): Promise<ApiResult<StudioCollectionResponse>> {
    return apiFetch<StudioCollectionResponse>(API_ENDPOINTS.studio.collections, {
      method: "POST",
      json: payload,
    });
  },
};
