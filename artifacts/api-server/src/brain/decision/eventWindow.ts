/**
 * Event window evaluation — shared preparation-window check for event-driven rules.
 *
 * Pure boolean logic only. Does not create RuleCandidates or know about specific events.
 */

/**
 * Returns true when eventDaysAway is known and falls within preparationWindowDays.
 * Null inputs always return false (safe no-match).
 */
export function isEventWithinPreparationWindow(
  eventDaysAway: number | null,
  preparationWindowDays: number | null,
): boolean {
  return (
    eventDaysAway != null &&
    preparationWindowDays != null &&
    eventDaysAway <= preparationWindowDays
  );
}
