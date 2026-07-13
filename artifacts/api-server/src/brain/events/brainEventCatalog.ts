/**
 * Brain event catalog — Brain-facing definitions assembled from the Event Domain adapter.
 *
 * Canonical identity, labels, and static timing metadata come from `@workspace/events`
 * via `eventDomain` preparation metadata. This module is a compatibility facade for
 * existing Brain consumers — not an independent identity authority.
 *
 * Rule registration, sourceRuleId, priority, and confidence remain Brain-owned.
 */

import type {
  BrainEventDefinition,
  BrainEventId,
  BrainEventTimingDefinition,
} from "./brainEventCatalogTypes";
import {
  getBrainEventPreparationMetadata,
  isSupportedBrainEventId,
  listSupportedBrainEventIds,
  type BrainAdapterTiming,
} from "./eventDomain/index.js";

/**
 * Compatibility export — values must match Event Domain EVENT_IDS.
 * Sourced from the adapter (not an independent catalog).
 */
export const BRAIN_EVENT_IDS: readonly BrainEventId[] = listSupportedBrainEventIds();

function mapTiming(timing: BrainAdapterTiming): BrainEventTimingDefinition {
  if (timing.kind === "recipient_date") {
    return { kind: "recipient_date", field: timing.field };
  }
  return { kind: "fixed_calendar", monthDay: timing.monthDay };
}

function buildDefinition(eventId: BrainEventId): BrainEventDefinition {
  const prep = getBrainEventPreparationMetadata(eventId);

  return Object.freeze({
    eventId: prep.eventId,
    briefingEventLabel: prep.briefingEventLabel,
    timing: mapTiming(prep.timing),
  });
}

/**
 * Compatibility catalog map — built from Event Domain via adapter preparation metadata.
 */
export const BRAIN_EVENT_CATALOG: Readonly<Record<BrainEventId, BrainEventDefinition>> =
  Object.freeze(
    Object.fromEntries(
      BRAIN_EVENT_IDS.map((eventId) => [eventId, buildDefinition(eventId)]),
    ) as Record<BrainEventId, BrainEventDefinition>,
  );

export function isBrainEventId(value: string): value is BrainEventId {
  return isSupportedBrainEventId(value);
}

export function getBrainEventDefinition(eventId: BrainEventId): BrainEventDefinition {
  if (!isBrainEventId(eventId)) {
    throw new Error(`Unknown Brain eventId: ${eventId}`);
  }
  return BRAIN_EVENT_CATALOG[eventId];
}

export function listBrainEventDefinitions(): readonly BrainEventDefinition[] {
  return BRAIN_EVENT_IDS.map((eventId) => BRAIN_EVENT_CATALOG[eventId]);
}
