import { loadAiRecommendations } from "@/app/ai/aiEngine";
import type { ConciergeRelationshipInsight } from "@/app/ai-concierge/aiConciergeDomain";
import { buildRelationshipInsights } from "@/app/ai-concierge/aiConciergeEngine";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";
import type { ApiResult } from "@/app/api/shared/types";
import { isBrainConciergeEnabled } from "@/app/concierge-brain/conciergeBrainConfig";
import { fetchConciergeWorkspace } from "@/app/concierge-brain/fetchConciergeWorkspace";
import {
  adaptConciergeWorkspaceViewModel,
  mapConciergeWorkspaceViewModel,
} from "@/app/concierge-brain/mapConciergeViewModel";
import type { ConciergeWorkspaceResponse } from "@/app/concierge-brain/conciergeWorkspaceTypes";
import type { RelationshipOpportunityViewModel } from "@/app/concierge-brain/conciergeViewModel";

export type FetchConciergeWorkspace = () => Promise<ApiResult<ConciergeWorkspaceResponse>>;

export interface ConciergeWorkspaceDisplayModel {
  opportunities: RelationshipOpportunityViewModel[];
  recommendations: FiAiRecommendation[];
  insights: ConciergeRelationshipInsight[];
}

export type LoadLegacyConciergeWorkspace = (
  userEmail?: string,
) => ConciergeWorkspaceDisplayModel;

export interface BuildConciergeWorkspaceForDisplayOptions {
  userEmail?: string;
}

export interface BuildConciergeWorkspaceForDisplayDeps {
  brainEnabled?: boolean;
  fetchConciergeWorkspace?: FetchConciergeWorkspace;
  loadLegacyWorkspace?: LoadLegacyConciergeWorkspace;
}

export function loadLegacyConciergeWorkspace(
  userEmail?: string,
): ConciergeWorkspaceDisplayModel {
  return {
    opportunities: [],
    recommendations: loadAiRecommendations(userEmail),
    insights: buildRelationshipInsights(),
  };
}

export async function buildConciergeWorkspaceForDisplay(
  options: BuildConciergeWorkspaceForDisplayOptions = {},
  deps: BuildConciergeWorkspaceForDisplayDeps = {},
): Promise<ConciergeWorkspaceDisplayModel> {
  const brainEnabled = deps.brainEnabled ?? isBrainConciergeEnabled();

  if (!brainEnabled) {
    const loadLegacy = deps.loadLegacyWorkspace ?? loadLegacyConciergeWorkspace;
    try {
      return loadLegacy(options.userEmail);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.error(error);
      }
      return { opportunities: [], recommendations: [], insights: [] };
    }
  }

  const fetchWorkspace = deps.fetchConciergeWorkspace ?? fetchConciergeWorkspace;

  try {
    const result = await fetchWorkspace();
    if (!result.ok || !result.data) {
      if (import.meta.env?.DEV) {
        console.error("Failed to load Concierge workspace", result.error);
      }
      return { opportunities: [], recommendations: [], insights: [] };
    }

    const viewModel = mapConciergeWorkspaceViewModel(result.data);
    return adaptConciergeWorkspaceViewModel(viewModel);
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.error(error);
    }
    return { opportunities: [], recommendations: [], insights: [] };
  }
}
