/**
 * Signal contributor registry.
 *
 * Ordered list of contributors aggregated by extractSignals().
 * Registration order may matter for future signal precedence.
 */

import type { SignalContributor } from "./types";
import { contributeBriefingEngagementSignals } from "./briefingEngagementContributor";
import { contributeEventTimingSignals } from "./eventTimingContributor";
import { contributeFollowUpRecencySignals } from "./followUpRecencyContributor";
import { contributeFreshUpdateRecencySignals } from "./freshUpdateRecencyContributor";
import { contributeProfileCompletenessSignals } from "./profileCompletenessContributor";

export const signalContributors: SignalContributor[] = [
  contributeProfileCompletenessSignals,
  contributeEventTimingSignals,
  contributeFreshUpdateRecencySignals,
  contributeFollowUpRecencySignals,
  contributeBriefingEngagementSignals,
];
