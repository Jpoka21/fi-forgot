/**
 * Signal extraction — read-only scaffold.
 *
 * Executes each registered contributor exactly once, captures per-contributor
 * outputs, then flattens into availableSignals. No scoring, no AI, no recommendations.
 */

import { signalContributors } from "./contributors";
import type { ContributorSignalGroup, SignalExtractionResult } from "./extractionTypes";
import type { RelationshipContextLoadResult } from "../types";

function formatContributorTitle(fnName: string): string {
  const stripped = fnName.replace(/^contribute/, "").replace(/Signals$/, "");
  return stripped.replace(/([A-Z])/g, " $1").trim();
}

/**
 * Returns extracted signals and per-contributor groups for a loaded relationship context.
 * Each contributor executes exactly once.
 */
export function extractSignals(
  context: RelationshipContextLoadResult,
): SignalExtractionResult {
  const contributorGroups: ContributorSignalGroup[] = signalContributors.map(
    (contributor, registryIndex) => {
      const signals = contributor(context);

      return {
        key: contributor.name,
        title: formatContributorTitle(contributor.name),
        registryIndex,
        sources: [...new Set(signals.map((signal) => signal.source))],
        signalCount: signals.length,
        signals,
      };
    },
  );

  return {
    availableSignals: contributorGroups.flatMap((group) => group.signals),
    contributorGroups,
  };
}
