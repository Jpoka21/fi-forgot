/**
 * Availability registry — keyed by canonical EventId.
 */

import {
  EVENT_IDS,
  assertCompleteEventRecord,
  type CompleteEventRecord,
  type EventId,
} from "../core/eventIds.js";
import type {
  EventAvailability,
  EventSurface,
  RelationshipFilterContext,
} from "./types.js";

function freezeAvailability(entry: EventAvailability): EventAvailability {
  return Object.freeze({
    ...entry,
    surfaces: Object.freeze({ ...entry.surfaces }),
    relationshipFilter: entry.relationshipFilter
      ? Object.freeze({
          ...entry.relationshipFilter,
          includeTypes: entry.relationshipFilter.includeTypes
            ? Object.freeze([...entry.relationshipFilter.includeTypes])
            : undefined,
          excludeTypes: entry.relationshipFilter.excludeTypes
            ? Object.freeze([...entry.relationshipFilter.excludeTypes])
            : undefined,
          roles: entry.relationshipFilter.roles
            ? Object.freeze([...entry.relationshipFilter.roles])
            : undefined,
        })
      : undefined,
  });
}

const BIRTHDAY_AVAILABILITY = freezeAvailability({
  eventId: "birthday",
  surfaces: { personal: true, business: true },
});

const ANNIVERSARY_AVAILABILITY = freezeAvailability({
  eventId: "anniversary",
  surfaces: { personal: true, business: false },
});

/**
 * Valentine's Day requires romantic eligibility (declarative).
 * includeTypes are adapter metadata examples — not a taxonomy engine.
 */
const VALENTINES_DAY_AVAILABILITY = freezeAvailability({
  eventId: "valentines_day",
  surfaces: { personal: true, business: false },
  relationshipFilter: {
    roles: ["romantic"],
    includeTypes: ["Wife", "Girlfriend", "Husband", "Boyfriend"],
  },
});

export const EVENT_AVAILABILITY_REGISTRY: CompleteEventRecord<EventAvailability> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: BIRTHDAY_AVAILABILITY,
        anniversary: ANNIVERSARY_AVAILABILITY,
        valentines_day: VALENTINES_DAY_AVAILABILITY,
      },
      "EVENT_AVAILABILITY_REGISTRY",
    ),
  );

export function getEventAvailability(eventId: EventId): EventAvailability | null {
  return EVENT_AVAILABILITY_REGISTRY[eventId] ?? null;
}

export function isAvailableOnSurface(
  eventId: EventId,
  surface: EventSurface,
): boolean {
  const availability = getEventAvailability(eventId);
  if (!availability) {
    return false;
  }
  return availability.surfaces[surface];
}

/**
 * Declarative exact-match helper for adapters that already know a relationship type.
 *
 * - Does not inspect RelationshipContext
 * - Does not resolve roles (roles are metadata for adapters)
 * - Returns false when includeTypes is set and no type is provided
 */
export function matchesRelationshipFilter(
  eventId: EventId,
  context: RelationshipFilterContext,
): boolean {
  const availability = getEventAvailability(eventId);
  if (!availability) {
    return false;
  }

  if (context.surface && !availability.surfaces[context.surface]) {
    return false;
  }

  const filter = availability.relationshipFilter;
  if (!filter) {
    return true;
  }

  const relationshipType = context.relationshipType?.trim();
  if (!relationshipType) {
    return filter.includeTypes == null || filter.includeTypes.length === 0;
  }

  if (filter.excludeTypes?.includes(relationshipType)) {
    return false;
  }

  if (filter.includeTypes && filter.includeTypes.length > 0) {
    return filter.includeTypes.includes(relationshipType);
  }

  return true;
}

export function listAvailableEventIds(
  context: RelationshipFilterContext = {},
): readonly EventId[] {
  return EVENT_IDS.filter((eventId) => matchesRelationshipFilter(eventId, context));
}
