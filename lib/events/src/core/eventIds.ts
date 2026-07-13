/**
 * Canonical event identity source for @workspace/events.
 *
 * This is the single authoritative list of EventIds.
 * Phase 7B.2: exactly three events. Do not expand here without a migration phase.
 */

export const EVENT_IDS = [
  "birthday",
  "anniversary",
  "valentines_day",
] as const;

/**
 * Closed compile-time union of registered event identities.
 * Derived from EVENT_IDS — not an open string.
 */
export type EventId = (typeof EVENT_IDS)[number];

/** Record that must contain every EventId exactly once. */
export type CompleteEventRecord<T> = { readonly [K in EventId]: T };

export function isEventId(value: string): value is EventId {
  return (EVENT_IDS as readonly string[]).includes(value);
}

/**
 * Compile-time + runtime completeness helper.
 * Throws if any EventId key is missing.
 */
export function assertCompleteEventRecord<T>(
  record: CompleteEventRecord<T>,
  label: string,
): CompleteEventRecord<T> {
  for (const id of EVENT_IDS) {
    if (!(id in record) || record[id] === undefined) {
      throw new Error(`${label} is missing required eventId: ${id}`);
    }
  }
  return record;
}
