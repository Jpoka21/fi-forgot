/**
 * Signal contributor registry.
 *
 * Ordered list of contributors aggregated by extractSignals().
 * Registration order may matter for future signal precedence.
 */

import type { SignalContributor } from "./types";
import { contributeProfileCompletenessSignals } from "./profileCompletenessContributor";

export const signalContributors: SignalContributor[] = [
  contributeProfileCompletenessSignals,
];
