import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import type { FiDashboardSuggestedAction } from "@/app/dashboard/dashboardDomain";

export type DashboardSuggestedActionsSource = "brain" | "legacy";

export interface DashboardSuggestedActionsRenderModel {
  source: DashboardSuggestedActionsSource;
  brainActions: FiDashboardSuggestedAction[];
  legacyActions: FiConciergeSuggestion[];
}

export interface ResolveDashboardSuggestedActionsOptions {
  brainEnabled: boolean;
  snapshotSuggestedActions?: FiDashboardSuggestedAction[];
  userEmail?: string;
  loadLegacySuggestions?: (userEmail?: string) => FiConciergeSuggestion[];
}

/**
 * Selects suggested-actions data for dashboard rendering.
 *
 * When Brain is enabled, legacy concierge suggestions are not loaded.
 */
export function resolveDashboardSuggestedActions(
  options: ResolveDashboardSuggestedActionsOptions,
): DashboardSuggestedActionsRenderModel {
  const {
    brainEnabled,
    snapshotSuggestedActions,
    userEmail,
    loadLegacySuggestions = (email) => loadConciergeSuggestions(email).slice(0, 3),
  } = options;

  if (brainEnabled) {
    return {
      source: "brain",
      brainActions: snapshotSuggestedActions ?? [],
      legacyActions: [],
    };
  }

  return {
    source: "legacy",
    brainActions: [],
    legacyActions: loadLegacySuggestions(userEmail),
  };
}

/** Display cap matching legacy suggested-actions section — preserves server order. */
export const DASHBOARD_SUGGESTED_ACTIONS_DISPLAY_LIMIT = 3;

export function limitDashboardSuggestedActions<T>(actions: T[]): T[] {
  return actions.slice(0, DASHBOARD_SUGGESTED_ACTIONS_DISPLAY_LIMIT);
}
