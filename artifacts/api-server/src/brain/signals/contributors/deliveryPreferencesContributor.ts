/**
 * Delivery preferences signal contributor.
 *
 * Emits read-only delivery facts from relationshipContext.delivery.
 * Passthrough only — no defaults, no thresholds, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeDeliveryPreferencesSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { delivery } = context.relationshipContext;

  return [
    {
      source: "delivery",
      label: "preview_days",
      value: delivery.previewDays,
    },
    {
      source: "delivery",
      label: "delivery_preference",
      value: delivery.preference,
    },
  ];
}
