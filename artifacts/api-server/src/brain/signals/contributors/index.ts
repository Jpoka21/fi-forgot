/**
 * Signal contributor registry.
 *
 * Ordered list of contributors aggregated by extractSignals().
 * Registration order may matter for future signal precedence.
 */

import type { SignalContributor } from "./types";
import { contributeBriefingEngagementSignals } from "./briefingEngagementContributor";
import { contributeCardHistorySignals } from "./cardHistoryContributor";
import { contributeDeliveryPreferencesSignals } from "./deliveryPreferencesContributor";
import { contributeEventTimingSignals } from "./eventTimingContributor";
import { contributeFollowUpRecencySignals } from "./followUpRecencyContributor";
import { contributeFreshUpdateRecencySignals } from "./freshUpdateRecencyContributor";
import { contributeProfileCompletenessSignals } from "./profileCompletenessContributor";
import { contributeRelationshipMomentumSignals } from "./relationshipMomentumContributor";
import { contributeToneAndGuardrailsSignals } from "./toneAndGuardrailsContributor";

export const signalContributors: SignalContributor[] = [
  contributeProfileCompletenessSignals,
  contributeEventTimingSignals,
  contributeFreshUpdateRecencySignals,
  contributeCardHistorySignals,
  contributeFollowUpRecencySignals,
  contributeBriefingEngagementSignals,
  contributeDeliveryPreferencesSignals,
  contributeToneAndGuardrailsSignals,
  contributeRelationshipMomentumSignals,
];
