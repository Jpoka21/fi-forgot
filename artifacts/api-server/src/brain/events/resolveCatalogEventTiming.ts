/**
 * Resolves timing inputs for a catalog event from RelationshipContext.
 *
 * Occurrence calculation remains Brain-owned (Event Domain scheduling stub unused).
 * Static timing descriptors and romantic eligibility come from the Event Domain adapter.
 */

import {
  computeAnniversaryDaysAway,
  computeBirthdayDaysAway,
  computeValentinesDaysAway,
  resolveEventCycleYear,
} from "../decision/eventTimingUtils";
import type { RelationshipContext } from "../types";
import type { BrainEventId } from "./brainEventCatalogTypes";
import {
  getBrainEventTimingMetadata,
  isEventAvailableForRelationship,
  isSupportedBrainEventId,
} from "./eventDomain/index.js";

export interface ResolvedEventTiming {
  applicable: boolean;
  daysUntilEvent: number | null;
  cycleYear: number | null;
}

export function resolveCatalogEventTiming(
  eventId: BrainEventId,
  relationshipContext: RelationshipContext,
  referenceDate: Date,
): ResolvedEventTiming {
  if (!isSupportedBrainEventId(eventId)) {
    return { applicable: false, daysUntilEvent: null, cycleYear: null };
  }

  const generatedAt = relationshipContext.generatedAt;
  const relationshipType = relationshipContext.relationship?.type ?? null;

  // Declarative Event Domain availability, translated by Brain adapter.
  if (!isEventAvailableForRelationship(eventId, relationshipType)) {
    return { applicable: false, daysUntilEvent: null, cycleYear: null };
  }

  const { timing } = getBrainEventTimingMetadata(eventId);

  if (timing.kind === "recipient_date") {
    const dateStr =
      timing.field === "birthday"
        ? relationshipContext.relationship?.birthday
        : relationshipContext.relationship?.anniversary;

    if (!dateStr) {
      return { applicable: false, daysUntilEvent: null, cycleYear: null };
    }

    const daysUntilEvent =
      timing.field === "birthday"
        ? computeBirthdayDaysAway(dateStr, generatedAt)
        : computeAnniversaryDaysAway(dateStr, generatedAt);

    return {
      applicable: true,
      daysUntilEvent,
      cycleYear: resolveEventCycleYear(dateStr, referenceDate),
    };
  }

  // Fixed-calendar: monthDay from Event Domain via adapter; days-away remains Brain-owned.
  return {
    applicable: true,
    daysUntilEvent: computeValentinesDaysAway(generatedAt),
    cycleYear: resolveEventCycleYear(timing.monthDay, referenceDate),
  };
}
