/**
 * Frozen FI-MFG-* Compliance Boundary authority for Design-Time Feasibility (G4).
 * Catalog derived from Volume 01 Structurally Complete freeze (eight Version 1.0 Frozen
 * standards). Does not restate manufacturing requirement bodies.
 *
 * FI-DSN-STD-014-R21 — consume applicable frozen FI-MFG-* Compliance Boundaries only.
 *
 * ORCH-IMP-008.2: Canonical catalog is the sole constitutional trust boundary for
 * frozen-binding eligibility. Injectable ManufacturingAuthoritySource adapters may
 * resolve recognized authorities; they cannot mint or expand eligibility.
 */

import { OrchestraConstitutionalError } from "./errors.js";

/** Binding posture of a manufacturing standard for Domain 3 consumption. */
export type ManufacturingAuthorityBindingPosture =
  | "frozen_binding"
  | "drafted_pending_freeze"
  | "deferred_nonbinding";

export type ManufacturingStandardKind =
  | "manufacturing_principle"
  | "manufacturing_constraint"
  | "operational_policy";

/**
 * Read-only reference to a manufacturing Compliance Boundary — not a copy of Volume 01 law.
 */
export interface ManufacturingComplianceBoundaryReference {
  readonly sourceStandardId: string;
  readonly title: string;
  readonly kind: ManufacturingStandardKind;
  readonly bindingPosture: ManufacturingAuthorityBindingPosture;
  readonly governingVolume: "01";
}

/**
 * Canonical eight Volume 01 standards frozen and binding (Version 1.0).
 * Sole runtime authority identity set for Design-Time Feasibility eligibility.
 * Source: playbook/design/volume-01-manufacturing/01-handwrytten-production-standard.md
 */
export const FROZEN_BINDING_FI_MFG_STANDARDS: readonly ManufacturingComplianceBoundaryReference[] =
  Object.freeze([
    Object.freeze({
      sourceStandardId: "FI-MFG-PRN-001",
      title: "Real Pen Production Method Principle",
      kind: "manufacturing_principle",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-CON-001",
      title: "Envelope Fulfillment Handling Boundary",
      kind: "manufacturing_constraint",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-CON-002",
      title: "Add-On Fulfillment Boundary",
      kind: "manufacturing_constraint",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-CON-003",
      title: "Vendor Capability Validation Constraint",
      kind: "manufacturing_constraint",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-CON-004",
      title: "Bulk Workflow Compatibility Boundary",
      kind: "manufacturing_constraint",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-POL-001",
      title: "Custom Signature Governance Policy",
      kind: "operational_policy",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-POL-002",
      title: "Order Modification and Cancellation Policy",
      kind: "operational_policy",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
    Object.freeze({
      sourceStandardId: "FI-MFG-POL-004",
      title: "Vendor Liability and Resend Handling Policy",
      kind: "operational_policy",
      bindingPosture: "frozen_binding",
      governingVolume: "01",
    }),
  ]);

const CANONICAL_BY_ID = new Map(
  FROZEN_BINDING_FI_MFG_STANDARDS.map((item) => [item.sourceStandardId, item] as const),
);

/**
 * Known non-binding manufacturing identifiers — rejected as DTF Compliance Boundary inputs.
 * FI-MFG-POL-003: Drafted, Pending Freeze (timing blocked).
 */
export const NONBINDING_MANUFACTURING_AUTHORITY_IDS = Object.freeze([
  "FI-MFG-POL-003",
] as const);

/**
 * Constitutional eligibility: identifier is in the canonical frozen binding set.
 * Injectable providers cannot expand this set.
 */
export function isCanonicalFrozenBindingFiMfgStandardId(
  sourceStandardId: unknown,
): boolean {
  return (
    typeof sourceStandardId === "string" && CANONICAL_BY_ID.has(sourceStandardId.trim())
  );
}

/**
 * Resolve canonical frozen binding reference. Returns null for non-canonical IDs.
 */
export function resolveCanonicalFrozenBindingBoundary(
  sourceStandardId: string,
): ManufacturingComplianceBoundaryReference | null {
  return CANONICAL_BY_ID.get(sourceStandardId.trim()) ?? null;
}

/**
 * Injectable adapter — may resolve or surface recognized canonical authorities.
 * Must not be treated as a source of constitutional eligibility.
 * createFrozenManufacturingAuthoritySource always filters through the canonical set.
 */
export interface ManufacturingAuthoritySource {
  listFrozenBindingBoundaries(): readonly ManufacturingComplianceBoundaryReference[];
  resolveFrozenBindingBoundary(
    sourceStandardId: string,
  ): ManufacturingComplianceBoundaryReference | null;
  isFrozenBindingSourceStandardId(sourceStandardId: string): boolean;
}

/**
 * Default adapter exposing only the canonical frozen binding catalog.
 */
export function createFrozenManufacturingAuthoritySource(): ManufacturingAuthoritySource {
  return {
    listFrozenBindingBoundaries() {
      return FROZEN_BINDING_FI_MFG_STANDARDS;
    },
    resolveFrozenBindingBoundary(sourceStandardId) {
      return resolveCanonicalFrozenBindingBoundary(sourceStandardId);
    },
    isFrozenBindingSourceStandardId(sourceStandardId) {
      return isCanonicalFrozenBindingFiMfgStandardId(sourceStandardId);
    },
  };
}

/**
 * Assert constitutional frozen-binding eligibility using the canonical catalog only.
 * The optional `source` argument is retained for call-site compatibility but cannot
 * mint or expand eligibility — forged provider claims are ignored.
 */
export function assertFrozenBindingManufacturingAuthority(
  _source: ManufacturingAuthoritySource | null | undefined,
  sourceStandardId: string,
): ManufacturingComplianceBoundaryReference {
  const trimmed = sourceStandardId.trim();
  if ((NONBINDING_MANUFACTURING_AUTHORITY_IDS as readonly string[]).includes(trimmed)) {
    throw new OrchestraConstitutionalError(
      "Draft, pending-freeze, or HOLD manufacturing authority is not consumable as frozen FI-MFG Compliance Boundary",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R21"],
    );
  }
  const canonical = resolveCanonicalFrozenBindingBoundary(trimmed);
  if (!canonical || canonical.bindingPosture !== "frozen_binding") {
    throw new OrchestraConstitutionalError(
      "Unknown or unfrozen manufacturing authority cannot be consumed for Design-Time Feasibility",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R21"],
    );
  }
  return canonical;
}

/** R23 — Manufacturing Validation is not Design-Time Feasibility. */
export const MANUFACTURING_VALIDATION_DEFERRED =
  "FI-DSN-STD-014-MANUFACTURING-VALIDATION-DEFERRED" as const;

/** R23 — Fulfillment Execution is not Design-Time Feasibility. */
export const FULFILLMENT_EXECUTION_DEFERRED =
  "FI-DSN-STD-014-FULFILLMENT-EXECUTION-DEFERRED" as const;
