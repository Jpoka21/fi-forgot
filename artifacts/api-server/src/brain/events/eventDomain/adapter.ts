/**
 * Thin Brain adapter over `@workspace/events`.
 *
 * This is the ONLY Brain module allowed to import `@workspace/events`.
 * All other Brain modules must consume Event Domain facts through this adapter.
 *
 * Owns: translation of domain identity/availability into Brain-safe views.
 * Does not own: rule registration, sourceRuleId, priority, confidence, timing
 * resolution, Action Planner, URLs, fatigue, or presentation/integration metadata.
 */

import {
  EVENT_IDS,
  canonicalLabel,
  getBriefingQuestionSetMeta,
  getEvent,
  getEventAvailability,
  getEventBriefingRef,
  getEventScheduling,
  isEventId,
  type EventCategory,
  type EventId,
  type EventKind,
} from "@workspace/events";

import { isRomanticRelationshipType } from "../../decision/relationshipTypeMatchers.js";

/** Canonical event identity — alias of Event Domain EventId. Not sourceRuleId. */
export type BrainCanonicalEventId = EventId;

/**
 * Brain-safe timing metadata (static only).
 * Occurrence resolution remains Brain-owned; Event Domain stub is unused.
 */
export type BrainAdapterTiming =
  | { readonly kind: "recipient_date"; readonly field: "birthday" | "anniversary" }
  | { readonly kind: "fixed_calendar"; readonly monthDay: string };

/**
 * Brain-safe event view — only facts Brain may consume from the Event Domain.
 * Excludes presentation, integrations, AI, Handwrytten, admin, emoji, URLs,
 * sourceRuleId, priority, and confidence.
 */
export interface BrainEventView {
  readonly eventId: BrainCanonicalEventId;
  readonly displayLabel: string;
  readonly category: EventCategory;
  readonly kind: EventKind;
  readonly surfaces: {
    readonly personal: boolean;
    readonly business: boolean;
  };
  /** True when Event Domain declares romantic role eligibility. */
  readonly requiresRomanticRelationship: boolean;
}

/**
 * Static availability metadata from the Event Domain availability registry.
 *
 * Declarative capability facts only — not runtime window/eligibility decisions.
 * Does not include includeTypes taxonomy strings (adapters interpret roles).
 */
export interface BrainEventAvailabilityMetadata {
  readonly eventId: BrainCanonicalEventId;
  readonly surfaces: {
    readonly personal: boolean;
    readonly business: boolean;
  };
  /**
   * Role hints declared by Event Domain (e.g. "romantic").
   * Empty when no relationshipFilter.roles are declared.
   */
  readonly declaredRoles: readonly string[];
  /** True when declaredRoles includes "romantic". */
  readonly requiresRomanticRelationship: boolean;
}

export type BrainEventSurface = "personal" | "business";

export interface BrainEventTimingMetadata {
  readonly eventId: BrainCanonicalEventId;
  readonly timing: BrainAdapterTiming;
}

/**
 * Static preparation metadata Brain may read from the Event Domain.
 * Does not include windows, occurrence dates, lead-time algorithms, or policy.
 */
export interface BrainEventPreparationMetadata {
  readonly eventId: BrainCanonicalEventId;
  /**
   * Briefing persistence / lookup label.
   * Sourced from Event Domain briefing question-set title (not identity alone).
   */
  readonly briefingEventLabel: string;
  readonly timing: BrainAdapterTiming;
  readonly category: EventCategory;
  readonly kind: EventKind;
}

/**
 * Opaque briefing question-set reference.
 * Distinct concept from EventId and sourceRuleId even when string values coincide.
 */
export type BrainBriefingQuestionSetId = string;

/**
 * Brain-safe briefing references — Event Domain owns refs/metadata only.
 * Does not include question text, selection, or EVENT_QUESTIONS content.
 */
export interface BrainEventBriefingMetadata {
  readonly eventId: BrainCanonicalEventId;
  readonly questionSetId: BrainBriefingQuestionSetId;
  readonly questionSetVersion: number;
  readonly questionSetTitle: string;
}

export function listSupportedBrainEventIds(): readonly BrainCanonicalEventId[] {
  return EVENT_IDS;
}

export function isSupportedBrainEventId(
  value: string,
): value is BrainCanonicalEventId {
  return isEventId(value);
}

/**
 * Maps a known Brain event identifier to canonical EventId.
 * Fails closed — no fuzzy matching, no defaults.
 */
export function toCanonicalEventId(value: string): BrainCanonicalEventId | null {
  if (!value || typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  // Exact EventId only — do not resolve display labels here (Brain uses ids).
  return isEventId(trimmed) ? trimmed : null;
}

export function requireCanonicalEventId(value: string): BrainCanonicalEventId {
  const eventId = toCanonicalEventId(value);
  if (eventId == null) {
    throw new Error(`Unsupported Brain event identifier: ${value}`);
  }
  return eventId;
}

function buildBrainEventView(eventId: BrainCanonicalEventId): BrainEventView {
  const identity = getEvent(eventId);
  if (!identity) {
    throw new Error(`Event Domain missing required metadata for: ${eventId}`);
  }

  const availability = getBrainEventAvailabilityMetadata(eventId);

  return Object.freeze({
    eventId: identity.eventId,
    displayLabel: identity.displayLabel,
    category: identity.category,
    kind: identity.kind,
    surfaces: availability.surfaces,
    requiresRomanticRelationship: availability.requiresRomanticRelationship,
  });
}

export function getBrainEventView(
  eventId: BrainCanonicalEventId,
): BrainEventView {
  if (!isSupportedBrainEventId(eventId)) {
    throw new Error(`Unsupported Brain event identifier: ${eventId}`);
  }
  return buildBrainEventView(eventId);
}

export function listBrainEventViews(): readonly BrainEventView[] {
  return listSupportedBrainEventIds().map((id) => getBrainEventView(id));
}

/**
 * Static availability facts from Event Domain availability registry.
 * Does NOT evaluate relationship types, dates, windows, or rule eligibility.
 * Does NOT call resolveOccurrence.
 */
export function getBrainEventAvailabilityMetadata(
  eventId: BrainCanonicalEventId,
): BrainEventAvailabilityMetadata {
  if (!isSupportedBrainEventId(eventId)) {
    throw new Error(`Unsupported Brain event identifier: ${eventId}`);
  }

  const availability = getEventAvailability(eventId);
  if (!availability) {
    throw new Error(`Event Domain missing availability metadata for: ${eventId}`);
  }

  const declaredRoles = Object.freeze([
    ...(availability.relationshipFilter?.roles ?? []),
  ]) as readonly string[];

  return Object.freeze({
    eventId: availability.eventId,
    surfaces: Object.freeze({ ...availability.surfaces }),
    declaredRoles,
    requiresRomanticRelationship: declaredRoles.includes("romantic"),
  });
}

export function listBrainEventAvailabilityMetadata(): readonly BrainEventAvailabilityMetadata[] {
  return listSupportedBrainEventIds().map((id) =>
    getBrainEventAvailabilityMetadata(id),
  );
}

/** Static surface flag from availability metadata — not a runtime window check. */
export function isBrainEventAvailableOnSurface(
  eventId: BrainCanonicalEventId,
  surface: BrainEventSurface,
): boolean {
  if (!isSupportedBrainEventId(eventId)) {
    return false;
  }
  return getBrainEventAvailabilityMetadata(eventId).surfaces[surface];
}

/**
 * Static timing metadata from Event Domain scheduling registry.
 * Does NOT call resolveOccurrence (stub remains unused).
 */
export function getBrainEventTimingMetadata(
  eventId: BrainCanonicalEventId,
): BrainEventTimingMetadata {
  if (!isSupportedBrainEventId(eventId)) {
    throw new Error(`Unsupported Brain event identifier: ${eventId}`);
  }
  const scheduling = getEventScheduling(eventId);
  if (!scheduling) {
    throw new Error(`Event Domain missing scheduling metadata for: ${eventId}`);
  }

  const timing = scheduling.timing;
  let mapped: BrainAdapterTiming;

  if (timing.kind === "recipient_date") {
    if (timing.field !== "birthday" && timing.field !== "anniversary") {
      throw new Error(`Unsupported recipient_date field: ${timing.field}`);
    }
    mapped = { kind: "recipient_date", field: timing.field };
  } else if (timing.kind === "fixed_calendar") {
    mapped = { kind: "fixed_calendar", monthDay: timing.monthDay };
  } else {
    throw new Error(`Unsupported timing kind for Brain adapter: ${timing.kind}`);
  }

  return Object.freeze({
    eventId,
    timing: Object.freeze(mapped),
  });
}

/**
 * Brain-owned interpretation of static romantic availability metadata.
 *
 * - Reads declarative `requiresRomanticRelationship` from availability metadata
 * - Applies Brain `isRomanticRelationshipType` (preserves existing romantic set)
 * - Does not treat Event Domain includeTypes as an authoritative taxonomy
 * - Does not inspect RelationshipContext, clocks, or call scheduling resolvers
 * - Does not decide whether a Brain rule should fire (rules remain Brain-owned)
 */
export function isEventAvailableForRelationship(
  eventId: BrainCanonicalEventId,
  relationshipType: string | null | undefined,
): boolean {
  if (!isSupportedBrainEventId(eventId)) {
    return false;
  }

  const availability = getBrainEventAvailabilityMetadata(eventId);

  if (availability.requiresRomanticRelationship) {
    return isRomanticRelationshipType(relationshipType);
  }

  // Unhandled role requirements — fail closed until Brain adds translators.
  if (availability.declaredRoles.length > 0) {
    return false;
  }

  return true;
}

/** Canonical display label from Event Domain (not a Brain-owned string). */
export function getCanonicalEventDisplayLabel(
  eventId: BrainCanonicalEventId,
): string {
  const label = canonicalLabel(eventId);
  if (!label) {
    throw new Error(`Event Domain missing display label for: ${eventId}`);
  }
  return label;
}

/**
 * Static briefing references for Brain consumers.
 * Reads Event Domain briefing refs + question-set meta only — no question content.
 * Does NOT call resolveOccurrence.
 */
export function getBrainEventBriefingMetadata(
  eventId: BrainCanonicalEventId,
): BrainEventBriefingMetadata {
  if (!isSupportedBrainEventId(eventId)) {
    throw new Error(`Unsupported Brain event identifier: ${eventId}`);
  }

  const ref = getEventBriefingRef(eventId);
  if (!ref) {
    throw new Error(`Event Domain missing briefing reference for: ${eventId}`);
  }

  const meta = getBriefingQuestionSetMeta(ref.questionSetId);
  if (!meta) {
    throw new Error(
      `Event Domain missing briefing question-set meta for: ${ref.questionSetId}`,
    );
  }

  return Object.freeze({
    eventId: ref.eventId,
    // Distinct fields from distinct Event Domain records — do not derive one from the other.
    questionSetId: meta.questionSetId,
    questionSetVersion: ref.version,
    questionSetTitle: meta.title,
  });
}

export function listBrainEventBriefingMetadata(): readonly BrainEventBriefingMetadata[] {
  return listSupportedBrainEventIds().map((id) => getBrainEventBriefingMetadata(id));
}

/**
 * Static facts used by Brain event preparation (labels + timing descriptors).
 * Briefing labels come from briefing question-set titles.
 * Does NOT call resolveOccurrence or compute preparation windows.
 */
export function getBrainEventPreparationMetadata(
  eventId: BrainCanonicalEventId,
): BrainEventPreparationMetadata {
  if (!isSupportedBrainEventId(eventId)) {
    throw new Error(`Unsupported Brain event identifier: ${eventId}`);
  }
  const view = getBrainEventView(eventId);
  const timingMeta = getBrainEventTimingMetadata(eventId);
  const briefing = getBrainEventBriefingMetadata(eventId);
  return Object.freeze({
    eventId: view.eventId,
    briefingEventLabel: briefing.questionSetTitle,
    timing: timingMeta.timing,
    category: view.category,
    kind: view.kind,
  });
}

export function listBrainEventPreparationMetadata(): readonly BrainEventPreparationMetadata[] {
  return listSupportedBrainEventIds().map((id) =>
    getBrainEventPreparationMetadata(id),
  );
}
