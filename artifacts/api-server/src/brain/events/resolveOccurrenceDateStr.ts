/**
 * Resolves the catalog occurrence date string used for cycle derivation.
 *
 * Static timing descriptors come from the Event Domain adapter.
 * Occurrence selection from RelationshipContext remains Brain-owned.
 */

import type { RelationshipContext } from "../types";
import type { BrainEventId } from "./brainEventCatalogTypes";
import {
  getBrainEventTimingMetadata,
  isSupportedBrainEventId,
} from "./eventDomain/index.js";

export function resolveOccurrenceDateStr(
  eventId: BrainEventId,
  relationshipContext: RelationshipContext,
): string | null {
  if (!isSupportedBrainEventId(eventId)) {
    return null;
  }

  const { timing } = getBrainEventTimingMetadata(eventId);

  if (timing.kind === "recipient_date") {
    return timing.field === "birthday"
      ? relationshipContext.relationship?.birthday ?? null
      : relationshipContext.relationship?.anniversary ?? null;
  }

  return timing.monthDay;
}
