/**
 * Event identity helpers.
 */

import { isEventId } from "./eventIds.js";
import { EVENT_IDENTITY_REGISTRY, listRegisteredEventIds } from "./registry.js";
import type { EventId, EventIdentity } from "./types.js";

export { isEventId } from "./eventIds.js";

export function getEvent(eventId: EventId): EventIdentity | null {
  if (!isEventId(eventId)) {
    return null;
  }
  return EVENT_IDENTITY_REGISTRY[eventId];
}

export function requireEvent(eventId: EventId): EventIdentity {
  const identity = getEvent(eventId);
  if (!identity) {
    throw new Error(`Unknown eventId: ${eventId}`);
  }
  return identity;
}

export function listEvents(options?: { activeOnly?: boolean }): readonly EventIdentity[] {
  const all = listRegisteredEventIds().map((id) => EVENT_IDENTITY_REGISTRY[id]);

  if (options?.activeOnly) {
    return all.filter((entry) => entry.active);
  }
  return all;
}

export function listActiveEventIds(): readonly EventId[] {
  return listEvents({ activeOnly: true }).map((entry) => entry.eventId);
}
