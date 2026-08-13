/**
 * HCCM consumer class catalog — FI-DSN-STD-015 HOF-G3 (R33) / PD-STD-015-002 §20.5.4.7.
 *
 * Closed CC-01..CC-06 catalog with HCBM mappings and posture-class affinities.
 * Consumed by HOF-G2 R28 (authorization scope) and owned operatively by HOF-G3 R33–R39 (binding).
 * HOF-G4 posture declaration mechanics remain deferred.
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
  /** Constitutional downstream consideration domain — not admission/execution (R33). */
  readonly downstreamConsiderationDomain: string;
}

/**
 * Closed CC-01..CC-06 catalog (Section 20.5.4.7 / R33).
 * No consumer class beyond this catalog without a separately governed planning amendment.
 */
export const HCCM_CONSUMER_CLASS_CATALOG: readonly HccmConsumerClassCatalogEntry[] =
  Object.freeze([
    Object.freeze({
      consumerClassId: "CC-01" as const,
      constitutionalConsumerClass: "permanent_collection_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["catalog", "archival"] as const),
      postureClassAffinity: "library_intake_posture" as const,
      downstreamConsiderationDomain:
        "volume_05_permanent_collection_membership_consideration_not_admission",
    }),
    Object.freeze({
      consumerClassId: "CC-02" as const,
      constitutionalConsumerClass: "production_artwork_catalog_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["production", "catalog"] as const),
      postureClassAffinity: "production_catalog_posture" as const,
      downstreamConsiderationDomain:
        "engineering_production_artwork_catalog_consideration_not_implementation",
    }),
    Object.freeze({
      consumerClassId: "CC-03" as const,
      constitutionalConsumerClass: "manufacturing_feasibility_consumption_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["manufacturing"] as const),
      postureClassAffinity: "none" as const,
      downstreamConsiderationDomain:
        "design_time_manufacturing_feasibility_consumption_not_manufacture_or_production_execution",
    }),
    Object.freeze({
      consumerClassId: "CC-04" as const,
      constitutionalConsumerClass: "fulfillment_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["fulfillment"] as const),
      postureClassAffinity: "none" as const,
      downstreamConsiderationDomain:
        "post_production_fulfillment_domain_consideration_not_fulfillment_execution",
    }),
    Object.freeze({
      consumerClassId: "CC-05" as const,
      constitutionalConsumerClass: "publication_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["publication"] as const),
      postureClassAffinity: "none" as const,
      downstreamConsiderationDomain:
        "publication_or_release_domain_consideration_not_publication_execution",
    }),
    Object.freeze({
      consumerClassId: "CC-06" as const,
      constitutionalConsumerClass: "distribution_intake_consumer_class",
      hcbmBoundaryKeys: Object.freeze(["distribution"] as const),
      postureClassAffinity: "none" as const,
      downstreamConsiderationDomain:
        "distribution_channel_domain_consideration_not_distribution_execution",
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
      "HCCM consumer class is not in the closed CC-01–CC-06 catalog (R33)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R28"],
    );
  }
  return resolved;
}

export function assertHccmConsumerClassId(
  consumerClassId: unknown,
  options?: {
    readonly errorCode?: "invalid_handoff_authorization" | "invalid_handoff_consumer_binding";
  },
): asserts consumerClassId is HccmConsumerClassId {
  if (!isHccmConsumerClassId(consumerClassId)) {
    const code = options?.errorCode ?? "invalid_handoff_authorization";
    throw new OrchestraConstitutionalError(
      "Closed HCCM catalog requires consumer class CC-01 through CC-06 (R33/R39); invented consumer classes are prohibited",
      code,
      code === "invalid_handoff_consumer_binding"
        ? ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R39"]
        : ["FI-DSN-STD-015-R28", "FI-DSN-STD-015-R33"],
    );
  }
}

/**
 * R28 — derive consumed HCBM key set for authorization scope (same mapping as R34).
 */
export function resolveConsumedHcbmBoundaryKeysForAuthorization(input: {
  consumerClassId: HccmConsumerClassId;
  entryConsumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
}): readonly HandoffConsumerCategoryKey[] {
  try {
    return resolveConsumedHcbmBoundaryKeysForBinding(input);
  } catch (error) {
    if (
      error instanceof OrchestraConstitutionalError &&
      error.code === "invalid_handoff_consumer_binding"
    ) {
      throw new OrchestraConstitutionalError(
        "Handoff authorization bound consumer context requires nonempty HCBM keys from entry that map to the selected HCCM consumer class (R28)",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R28", "FI-DSN-STD-015-R31"],
      );
    }
    throw error;
  }
}

/**
 * R34 — record consumed HCBM boundary key set mapped to selected CC from entry export.
 */
export function resolveConsumedHcbmBoundaryKeysForBinding(input: {
  consumerClassId: HccmConsumerClassId;
  entryConsumerCategoryKeys: readonly HandoffConsumerCategoryKey[];
}): readonly HandoffConsumerCategoryKey[] {
  const catalogEntry = resolveHccmConsumerClass(input.consumerClassId);
  const entrySet = new Set(input.entryConsumerCategoryKeys);
  const consumed = catalogEntry.hcbmBoundaryKeys.filter((key) => entrySet.has(key));
  if (consumed.length === 0) {
    throw new OrchestraConstitutionalError(
      "HCCM binding requires nonempty HCBM keys from entry that map to the selected consumer class (R34); HCBM keys alone do not determine CC-01 versus CC-02 (R37)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R34", "FI-DSN-STD-015-R37", "FI-DSN-STD-015-R39"],
    );
  }
  return Object.freeze([...consumed]);
}
