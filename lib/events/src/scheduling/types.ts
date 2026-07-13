/**
 * Scheduling types — when events occur.
 *
 * Timing resolution remains STUBBED in Phase 7B.2.
 * Do not treat stub results as production occurrence data.
 */

import type { EventId } from "../core/types.js";

/**
 * Known recipient profile date field keys used by recipient_date timing.
 * These are field-name metadata for adapters — not EventId values.
 */
export type RecipientDateField = "birthday" | "anniversary";

export type TimingDefinition =
  | { readonly kind: "recipient_date"; readonly field: RecipientDateField }
  | { readonly kind: "fixed_calendar"; readonly monthDay: string }
  | {
      readonly kind: "nth_weekday";
      readonly month: number;
      readonly weekday: number;
      readonly n: number;
    }
  | { readonly kind: "computed"; readonly algorithm: "easter" | (string & {}) }
  | { readonly kind: "custom_date"; readonly source: "recipient.customDates" }
  | { readonly kind: "none" };

/**
 * Declarative role hints for adapters.
 * Not an authoritative relationship taxonomy.
 */
export type RelationshipRole = "romantic" | "mother_figure" | "father_figure";

/**
 * Declarative scheduling applicability metadata.
 * Adapters interpret these requirements — this domain does not inspect
 * RelationshipContext or Brain normalization.
 */
export interface SchedulingConstraints {
  /**
   * Optional exact-match relationship type strings for adapters.
   * Metadata requirements only — not a relationship taxonomy authority.
   */
  readonly relationshipTypes?: readonly string[];
  readonly relationshipRoles?: readonly RelationshipRole[];
  /** Transitional recipient flag name (e.g. needsMothersDay) during migration. */
  readonly requiresProfileField?: string;
}

export interface EventScheduling {
  readonly eventId: EventId;
  readonly timing: TimingDefinition;
  readonly constraints?: SchedulingConstraints;
}

/**
 * Context for occurrence resolution.
 * Provided by adapters when timing is migrated — ignored by the 7B.2 stub.
 */
export interface OccurrenceResolutionContext {
  readonly referenceDate: Date;
  readonly recipientDates?: Partial<
    Record<RecipientDateField, string | null | undefined>
  >;
  readonly customDates?: ReadonlyArray<{ label: string; date: string }>;
  readonly relationshipType?: string | null;
}

/**
 * Occurrence resolution result.
 *
 * In Phase 7B.2 the stub ALWAYS returns:
 * - stubbed: true
 * - applicable: false
 * - occurrenceDateStr / cycleYear / daysUntil: null
 *
 * It never invents dates, defaults to the current year, or infers recipient dates.
 */
export interface OccurrenceResolutionResult {
  readonly eventId: EventId;
  readonly occurrenceDateStr: string | null;
  readonly cycleYear: number | null;
  readonly daysUntil: number | null;
  readonly applicable: boolean;
  /** True while timing migration has not landed. */
  readonly stubbed: boolean;
  readonly reason: string;
}

/**
 * Pluggable timing strategy contract.
 * Implementations are stubs in 7B.2.
 */
export interface TimingResolver {
  readonly kind: TimingDefinition["kind"];
  resolve(
    scheduling: EventScheduling,
    context: OccurrenceResolutionContext,
  ): OccurrenceResolutionResult;
}

/** Stable stub reason — production code must not consume stub results. */
export const SCHEDULING_NOT_MIGRATED_REASON =
  "SCHEDULING_NOT_MIGRATED: resolveOccurrence is a Phase 7B.2 stub. Use existing Brain/frontend timing resolvers until timing migration.";
