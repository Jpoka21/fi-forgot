/**
 * Brain event catalog — canonical server-side calendar occasion definitions.
 */

import type {
  BrainEventDefinition,
  BrainEventId,
} from "./brainEventCatalogTypes";

export const BRAIN_EVENT_IDS = [
  "birthday",
  "anniversary",
  "valentines_day",
] as const satisfies readonly BrainEventId[];

const BIRTHDAY_EVENT: BrainEventDefinition = {
  eventId: "birthday",
  briefingEventLabel: "Birthday",
  timing: { kind: "recipient_date", field: "birthday" },
};

const ANNIVERSARY_EVENT: BrainEventDefinition = {
  eventId: "anniversary",
  briefingEventLabel: "Anniversary",
  timing: { kind: "recipient_date", field: "anniversary" },
};

const VALENTINES_DAY_EVENT: BrainEventDefinition = {
  eventId: "valentines_day",
  briefingEventLabel: "Valentine's Day",
  timing: { kind: "fixed_calendar", monthDay: "02-14" },
  constraints: {
    relationshipTypes: ["Wife", "Girlfriend", "Husband", "Boyfriend"],
  },
};

export const BRAIN_EVENT_CATALOG: Readonly<Record<BrainEventId, BrainEventDefinition>> = {
  birthday: BIRTHDAY_EVENT,
  anniversary: ANNIVERSARY_EVENT,
  valentines_day: VALENTINES_DAY_EVENT,
};

export function isBrainEventId(value: string): value is BrainEventId {
  return value in BRAIN_EVENT_CATALOG;
}

export function getBrainEventDefinition(eventId: BrainEventId): BrainEventDefinition {
  return BRAIN_EVENT_CATALOG[eventId];
}

export function listBrainEventDefinitions(): readonly BrainEventDefinition[] {
  return BRAIN_EVENT_IDS.map((eventId) => BRAIN_EVENT_CATALOG[eventId]);
}
