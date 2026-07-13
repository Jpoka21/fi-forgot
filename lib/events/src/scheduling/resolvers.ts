/**
 * Timing resolvers — STUBBED in Phase 7B.2.
 *
 * Contract (intended, not yet implemented):
 * - recipient_date: next occurrence from recipient profile date field
 * - fixed_calendar: next occurrence of monthDay relative to referenceDate
 * - nth_weekday / computed / custom_date: specialized occurrence algorithms
 * - none: unscheduled events never produce an occurrence
 *
 * Stub behavior (current):
 * - Always returns stubbed: true, applicable: false
 * - Never calculates dates, never defaults to current year, never infers data
 * - Must not be consumed by production code
 */

import type {
  EventScheduling,
  OccurrenceResolutionContext,
  OccurrenceResolutionResult,
  TimingResolver,
} from "./types.js";
import { SCHEDULING_NOT_MIGRATED_REASON } from "./types.js";

function stubResult(scheduling: EventScheduling): OccurrenceResolutionResult {
  return Object.freeze({
    eventId: scheduling.eventId,
    occurrenceDateStr: null,
    cycleYear: null,
    daysUntil: null,
    applicable: false,
    stubbed: true,
    reason: SCHEDULING_NOT_MIGRATED_REASON,
  });
}

export const recipientDateResolver: TimingResolver = {
  kind: "recipient_date",
  resolve(scheduling, _context) {
    return stubResult(scheduling);
  },
};

export const fixedCalendarResolver: TimingResolver = {
  kind: "fixed_calendar",
  resolve(scheduling, _context) {
    return stubResult(scheduling);
  },
};

export const nthWeekdayResolver: TimingResolver = {
  kind: "nth_weekday",
  resolve(scheduling, _context) {
    return stubResult(scheduling);
  },
};

export const computedResolver: TimingResolver = {
  kind: "computed",
  resolve(scheduling, _context) {
    return stubResult(scheduling);
  },
};

export const customDateResolver: TimingResolver = {
  kind: "custom_date",
  resolve(scheduling, _context) {
    return stubResult(scheduling);
  },
};

export const noneResolver: TimingResolver = {
  kind: "none",
  resolve(scheduling, _context) {
    return Object.freeze({
      eventId: scheduling.eventId,
      occurrenceDateStr: null,
      cycleYear: null,
      daysUntil: null,
      applicable: false,
      stubbed: true,
      reason: "Event timing kind is none — no scheduled occurrence.",
    });
  },
};

const RESOLVERS: Record<TimingResolver["kind"], TimingResolver> = {
  recipient_date: recipientDateResolver,
  fixed_calendar: fixedCalendarResolver,
  nth_weekday: nthWeekdayResolver,
  computed: computedResolver,
  custom_date: customDateResolver,
  none: noneResolver,
};

/**
 * Resolve next occurrence for an event.
 * Phase 7B.2 stub — always non-applicable, never invents dates.
 */
export function resolveOccurrence(
  scheduling: EventScheduling,
  context: OccurrenceResolutionContext,
): OccurrenceResolutionResult {
  void context; // intentionally unused while stubbed
  const resolver = RESOLVERS[scheduling.timing.kind];
  return resolver.resolve(scheduling, context);
}

/**
 * Parameterized window check — does not own previewDays.
 * previewDays remains a per-recipient delivery setting outside this domain.
 */
export function isWithinWindow(
  daysUntil: number | null | undefined,
  preparationWindowDays: number | null | undefined,
): boolean {
  if (daysUntil == null || preparationWindowDays == null) {
    return false;
  }
  return daysUntil <= preparationWindowDays;
}
