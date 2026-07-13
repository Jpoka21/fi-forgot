/**
 * Scheduling registry — keyed by canonical EventId.
 * Completeness enforced at compile time via CompleteEventRecord.
 */

import {
  assertCompleteEventRecord,
  type CompleteEventRecord,
  type EventId,
} from "../core/eventIds.js";
import type { EventScheduling } from "./types.js";

function freezeScheduling(entry: EventScheduling): EventScheduling {
  return Object.freeze({
    ...entry,
    timing: Object.freeze({ ...entry.timing }),
    constraints: entry.constraints
      ? Object.freeze({
          ...entry.constraints,
          relationshipTypes: entry.constraints.relationshipTypes
            ? Object.freeze([...entry.constraints.relationshipTypes])
            : undefined,
          relationshipRoles: entry.constraints.relationshipRoles
            ? Object.freeze([...entry.constraints.relationshipRoles])
            : undefined,
        })
      : undefined,
  });
}

const BIRTHDAY_SCHEDULING = freezeScheduling({
  eventId: "birthday",
  timing: { kind: "recipient_date", field: "birthday" },
});

const ANNIVERSARY_SCHEDULING = freezeScheduling({
  eventId: "anniversary",
  timing: { kind: "recipient_date", field: "anniversary" },
});

/**
 * Valentine's Day timing is fixed-calendar.
 * Romantic eligibility is declared as adapter metadata (roles), not inferred here.
 */
const VALENTINES_DAY_SCHEDULING = freezeScheduling({
  eventId: "valentines_day",
  timing: { kind: "fixed_calendar", monthDay: "02-14" },
  constraints: {
    relationshipRoles: ["romantic"],
    /**
     * Example type strings for adapters that perform exact-match checks.
     * Not an authoritative relationship taxonomy.
     */
    relationshipTypes: ["Wife", "Girlfriend", "Husband", "Boyfriend"],
  },
});

export const EVENT_SCHEDULING_REGISTRY: CompleteEventRecord<EventScheduling> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: BIRTHDAY_SCHEDULING,
        anniversary: ANNIVERSARY_SCHEDULING,
        valentines_day: VALENTINES_DAY_SCHEDULING,
      },
      "EVENT_SCHEDULING_REGISTRY",
    ),
  );

export function getEventScheduling(eventId: EventId): EventScheduling | null {
  return EVENT_SCHEDULING_REGISTRY[eventId] ?? null;
}

export function listEventScheduling(): readonly EventScheduling[] {
  return Object.values(EVENT_SCHEDULING_REGISTRY);
}
