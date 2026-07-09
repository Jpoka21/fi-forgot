import type { ConciergeRelationshipInsight } from "@/app/ai-concierge/aiConciergeDomain";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";
import type { ApiResult } from "@/app/api/shared/types";
import { fetchConciergeWorkspace } from "@/app/concierge-brain/fetchConciergeWorkspace";
import {
  adaptConciergeWorkspaceViewModel,
  mapConciergeWorkspaceViewModel,
} from "@/app/concierge-brain/mapConciergeViewModel";
import type { ConciergeWorkspaceResponse } from "@/app/concierge-brain/conciergeWorkspaceTypes";

export type FetchConciergeWorkspace = () => Promise<ApiResult<ConciergeWorkspaceResponse>>;

export interface ConciergeWorkspaceDisplayModel {
  recommendations: FiAiRecommendation[];
  insights: ConciergeRelationshipInsight[];
}

export interface BuildConciergeWorkspaceForDisplayDeps {
  fetchConciergeWorkspace?: FetchConciergeWorkspace;
}

export async function buildConciergeWorkspaceForDisplay(
  deps: BuildConciergeWorkspaceForDisplayDeps = {},
): Promise<ConciergeWorkspaceDisplayModel> {
  const fetchWorkspace = deps.fetchConciergeWorkspace ?? fetchConciergeWorkspace;

  try {
    const result = await fetchWorkspace();
    if (!result.ok || !result.data) {
      if (import.meta.env?.DEV) {
        console.error("Failed to load Concierge workspace", result.error);
      }
      return { recommendations: [], insights: [] };
    }

    const viewModel = mapConciergeWorkspaceViewModel(result.data);
    return adaptConciergeWorkspaceViewModel(viewModel);
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.error(error);
    }
    return { recommendations: [], insights: [] };
  }
}
