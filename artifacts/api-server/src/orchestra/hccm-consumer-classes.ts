/**
 * HCCM consumer class catalog — consumed by HOF-G2 R28 for authorization scope.
 *
 * Catalog identity from PD-STD-015-002 / Section 20.5.4.7.
 * HOF-G2 consumes bound-context identity for authorization acts only.
 * Full HOF-G3 binding acts (R33–R39) remain deferred.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { HandoffConsumerCategoryKey } from "./domain3-types.js";
import type { HccmConsumerClassId } from "./domain3-types.js";

export interface HccmConsumerClassCatalogEntry {
  readonly consumerClassId: HccmConsumerClassId;
  readonly constitutionalConsumerClass: string;
  /** HCBM keys (G11 encoding) that may be consumed for this CC. */
  readonly hcbmBoundaryKeys: readonly HandoffConsumerCategoryKey[];
  readonly postureClassAffinity:
    | "library_intake_posture"
    | "production_catalog_posture"
    | "none";
}

/**
 * Closed CC-01..CC-06 catalog (Section 20.5.4.7). Consumed by R28 — not HOF-G3 binding acts.
 */
export const HCCM_CONSUMER_CLASS_CATALOG: readonly HccmConsumerClassCatalogEntry[] =
  Object.freeze([
    Object.freeze({
      consumerClassId: "CC-01" as const,
      constitutionalConsumerClass: "permanent_collection_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["catalog", "archival"] as const),
      postureClassAffinity: "library_intake_posture" as const,
    }),
    Object.freeze({
      consumerClassId: "CC-02" as const,
      constitutionalConsumerClass: "production_artwork_catalog_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["production", "catalog"] as const),
      postureClassAffinity: "production_catalog_posture" as const,
    }),
    Object.freeze({
      consumerClassId: "CC-03" as const,
      constitutionalConsumerClass: "manufacturing_feasibility_consumption_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["manufacturing"] as const),
      postureClassAffinity: "none" as const,
    }),
    Object.freeze({
      consumerClassId: "CC-04" as const,
      constitutionalConsumerClass: "fulfillment_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["fulfillment"] as const),
      postureClassAffinity: "none" as const,
    }),
    Object.freeze({
      consumerClassId: "CC-05" as const,
      constitutionalConsumerClass: "publication_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["publication"] as const),
      postureClassAffinity: "none" as const,
    }),
    Object.freeze({
      consumerClassId: "CC-06" as const,
      constitutionalConsumerClass: "distribution_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["distribution"] as const),
      postureClassAffinity: "none" as const,
    }),
  ]);

const BY_ID = new Map(
  HCCM_CONSUMER_CLASS_CATALOG.map((entry) => [entry.consumerClassId, entry]),
);

export function isHccmConsumerClassId(value: unknown): value is HccmConsumerClassId {
  return typeof value === "string" && BY_ID.has(value as HccmConsumerClassId);
}

export function resolveHccmConsumerClass(
  consumerClassId: HccmConsumerClassId,
): HccmConsumerClassCatalogEntry {
  const resolved = BY_ID.get(consumerClassId);
  if (!resolved) {
    throw new OrchestraConstitutionalError(
      "HCCM consumer class is not in the closed CC-01–CC-06 catalog (R28)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }
  return resolved;
}

export function assertHccmConsumerClassId(
  consumerClassId: unknown,
): asserts consumerClassId is HccmConsumerClassId {
  if (!isHccmConsumerClassId(consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization requires a closed HCCM consumer class CC-01 through CC-06 (R28); invented consumer classes are prohibited",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }
}

/**
 * R28 — derive consumed HCBM key set for a CC from entry keys.
 * Keys must belong to the entry export and to the selected CC mapping.
 */
export function resolveConsumedHcbmBoundaryKeysForAuthorization(input: {
  consumerClassId: HccmConsumerClassId;
  entryConsumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
}): readonly HandoffConsumerCategoryKey[] {
  const catalogEntry = resolveHccmConsumerClass(input.consumerClassId);
  const entrySet = new Set(input.entryConsumerCategoryKeys);
  const consumed = catalogEntry.hcbmBoundaryKeys.filter((key) => entrySet.has(key));
  if (consumed.length === 0) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization bound consumer context requires nonempty HCBM keys from entry that map to the selected HCCM consumer class (R28)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28", "FI-DSN-STD-015-R31"],
    );
  }
  return Object.freeze([...consumed]);
}
