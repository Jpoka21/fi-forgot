/**
 * Label normalization — deterministic, alias-based, exact-key matching only.
 *
 * - No fuzzy matching
 * - No substring guessing
 * - Display labels are not permanent identity (EventId is)
 * - Alias collisions across events fail at module load
 */

import { EVENT_IDS, type EventId } from "../core/eventIds.js";
import { EVENT_IDENTITY_REGISTRY } from "../core/registry.js";

function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+/g, " ");
}

function registerKey(
  map: Map<string, EventId>,
  rawKey: string,
  eventId: EventId,
  source: string,
): void {
  const key = normalizeKey(rawKey);
  if (!key) {
    return;
  }
  const existing = map.get(key);
  if (existing != null && existing !== eventId) {
    throw new Error(
      `Alias collision: normalized key "${key}" from ${source} maps to both "${existing}" and "${eventId}"`,
    );
  }
  map.set(key, eventId);
}

/** Build lookup maps once from the identity registry. Fails on collisions. */
function buildLookupMaps(): ReadonlyMap<string, EventId> {
  const map = new Map<string, EventId>();

  for (const eventId of EVENT_IDS) {
    const identity = EVENT_IDENTITY_REGISTRY[eventId];

    // Canonical eventId always resolves to itself
    registerKey(map, eventId, eventId, `eventId:${eventId}`);
    // Canonical display label
    registerKey(map, identity.displayLabel, eventId, `displayLabel:${eventId}`);

    for (const alias of identity.aliases) {
      registerKey(map, alias, eventId, `alias:${eventId}:${alias}`);
    }
  }

  return map;
}

const LOOKUP: ReadonlyMap<string, EventId> = buildLookupMaps();

/**
 * Resolve any label / alias / eventId string to a registered EventId.
 * Returns null when unrecognized. Never guesses.
 */
export function resolveEventId(input: string): EventId | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Exact EventId hit (case-sensitive closed set)
  if ((EVENT_IDS as readonly string[]).includes(trimmed)) {
    return trimmed as EventId;
  }

  return LOOKUP.get(normalizeKey(trimmed)) ?? null;
}

/** Canonical display label for a registered eventId. */
export function canonicalLabel(eventId: EventId): string | null {
  return EVENT_IDENTITY_REGISTRY[eventId]?.displayLabel ?? null;
}

/** All known aliases for an eventId (excluding the canonical label and eventId). */
export function listAliases(eventId: EventId): readonly string[] {
  return EVENT_IDENTITY_REGISTRY[eventId]?.aliases ?? [];
}

/**
 * True when input resolves to the given eventId via id, label, or alias.
 */
export function matchesEvent(input: string, eventId: EventId): boolean {
  return resolveEventId(input) === eventId;
}

/**
 * Expose collision-checked lookup size for architecture tests.
 * Not a public consumer API concern.
 */
export function __normalizationLookupSizeForTests(): number {
  return LOOKUP.size;
}
