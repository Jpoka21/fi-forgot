/**
 * Authoritative event identity registry.
 *
 * Single source of identity facts. Other registries key by EventId only —
 * they must not redefine labels, aliases, or identity.
 */

import {
  EVENT_IDS,
  assertCompleteEventRecord,
  type CompleteEventRecord,
  type EventId,
} from "./eventIds.js";
import type { EventIdentity } from "./types.js";

/** @deprecated Prefer EVENT_IDS — kept as alias for 7B.1 call sites inside this package. */
export const INITIAL_EVENT_IDS = EVENT_IDS;

function freezeIdentity(identity: EventIdentity): EventIdentity {
  return Object.freeze({
    ...identity,
    aliases: Object.freeze([...identity.aliases]),
  });
}

const BIRTHDAY = freezeIdentity({
  eventId: "birthday",
  displayLabel: "Birthday",
  aliases: ["bday"],
  category: "calendar",
  kind: "recurring_scheduled",
  active: true,
});

const ANNIVERSARY = freezeIdentity({
  eventId: "anniversary",
  displayLabel: "Anniversary",
  aliases: [],
  category: "calendar",
  kind: "recurring_scheduled",
  active: true,
});

const VALENTINES_DAY = freezeIdentity({
  eventId: "valentines_day",
  displayLabel: "Valentine's Day",
  aliases: ["Valentines Day", "valentines day", "valentine's day", "Valentine Day"],
  category: "calendar",
  kind: "recurring_scheduled",
  active: true,
});

/**
 * Canonical identity registry — complete for every EventId.
 * Frozen. Consumers must not mutate.
 */
export const EVENT_IDENTITY_REGISTRY: CompleteEventRecord<EventIdentity> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: BIRTHDAY,
        anniversary: ANNIVERSARY,
        valentines_day: VALENTINES_DAY,
      },
      "EVENT_IDENTITY_REGISTRY",
    ),
  );

export function listRegisteredEventIds(): readonly EventId[] {
  return EVENT_IDS;
}
