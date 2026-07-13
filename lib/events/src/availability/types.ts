/**
 * Availability types — which events apply in which contexts.
 *
 * Declarative, adapter-friendly contracts only.
 * This domain does not inspect RelationshipContext or Brain normalization.
 */

import type { EventId } from "../core/types.js";

export type EventSurface = "personal" | "business";

/**
 * Role hints for adapters.
 * Not an authoritative relationship taxonomy.
 */
export type RelationshipRoleFilter =
  | "romantic"
  | "mother_figure"
  | "father_figure"
  | "any";

export interface RelationshipFilter {
  /**
   * Optional exact-match allowlist of relationship type STRINGS.
   * Metadata requirements for adapters — NOT a relationship taxonomy authority.
   * Adapters supply the type; this domain does not infer it.
   */
  readonly includeTypes?: readonly string[];
  /** Optional exact-match denylist. */
  readonly excludeTypes?: readonly string[];
  /**
   * Role-based eligibility hints for adapters to interpret.
   * This helper does not resolve roles against RelationshipContext.
   */
  readonly roles?: readonly RelationshipRoleFilter[];
}

export interface EventAvailability {
  readonly eventId: EventId;
  readonly surfaces: {
    readonly personal: boolean;
    readonly business: boolean;
  };
  readonly relationshipFilter?: RelationshipFilter;
}

/**
 * Adapter-supplied filter context.
 * Consumers pass relationship type if they already know it —
 * this domain never looks it up.
 */
export interface RelationshipFilterContext {
  readonly relationshipType?: string | null;
  readonly surface?: EventSurface;
}
