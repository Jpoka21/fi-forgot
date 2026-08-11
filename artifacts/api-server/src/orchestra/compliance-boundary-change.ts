/**
 * Compliance Boundary change governance — FI-DSN-STD-013-R29, R46.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import { createDomain2GovernedCreationMarker } from "./domain2-entry.js";
import type {
  ComplianceBoundaryChangeConsequence,
  ComplianceBoundaryChangeEvent,
  ComplianceBoundaryChangeEventId,
  RealizedVisualArtifact,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { isTerminalRvaPosture } from "./rva-lifecycle.js";

const CB_CHANGE_REQUIREMENTS = [
  "FI-DSN-STD-013-R29",
  "FI-DSN-STD-013-R46",
] as const;

export function createComplianceBoundaryChangeEventId(): ComplianceBoundaryChangeEventId {
  return `cb-change-${randomUUID()}` as ComplianceBoundaryChangeEventId;
}

const AUTHORIZED_CONSEQUENCES_FOR_MATERIAL: readonly ComplianceBoundaryChangeConsequence[] = [
  "successor_required",
  "invalidation_required",
  "rework_required",
  "reconsideration",
];

/**
 * Record a governed Compliance Boundary change event and consequence — R29, R46.
 */
export function recordComplianceBoundaryChangeEvent(input: {
  rva: RealizedVisualArtifact;
  complianceBoundarySourceStandardId: string;
  materiality: "material" | "nonmaterial";
  consequence: ComplianceBoundaryChangeConsequence;
  changeBasis: string;
  recordedBy: string;
  recordedAt?: string;
}): ComplianceBoundaryChangeEvent {
  if (isTerminalRvaPosture(input.rva.posture)) {
    throw new OrchestraConstitutionalError(
      "Terminal RVA cannot receive Compliance Boundary change events",
      "invalid_compliance_boundary_change",
      ["FI-DSN-STD-013-R46"],
    );
  }

  const sourceId = input.complianceBoundarySourceStandardId.trim();
  if (!sourceId) {
    throw new OrchestraConstitutionalError(
      "Compliance Boundary change requires source standard reference",
      "invalid_compliance_boundary_change",
      ["FI-DSN-STD-013-R29"],
    );
  }

  const changeBasis = input.changeBasis.trim();
  if (!changeBasis) {
    throw new OrchestraConstitutionalError(
      "Compliance Boundary change requires explicit governing basis",
      "invalid_compliance_boundary_change",
      ["FI-DSN-STD-013-R40"],
    );
  }

  if (input.materiality === "nonmaterial" && input.consequence !== "reconsideration") {
    throw new OrchestraConstitutionalError(
      "Nonmaterial Compliance Boundary changes require reconsideration consequence only",
      "invalid_compliance_boundary_change",
      ["FI-DSN-STD-013-R29"],
    );
  }

  if (
    input.materiality === "material" &&
    !AUTHORIZED_CONSEQUENCES_FOR_MATERIAL.includes(input.consequence)
  ) {
    throw new OrchestraConstitutionalError(
      "Material Compliance Boundary change requires a governed R46 consequence",
      "invalid_compliance_boundary_change",
      ["FI-DSN-STD-013-R46"],
    );
  }

  const now = input.recordedAt ?? new Date().toISOString();

  return Object.freeze({
    eventId: createComplianceBoundaryChangeEventId(),
    rvaId: input.rva.id,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    complianceBoundarySourceStandardId: sourceId,
    materiality: input.materiality,
    consequence: input.consequence,
    changeBasis,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.recordedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...CB_CHANGE_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

/**
 * Consequences that block Exists promotion and Review-Entry Readiness until
 * the affected RVA is constitutionally acted upon — R29, R46.
 *
 * - rework_required / successor_required: forward progression blocked on this RVA
 * - invalidation_required: blocked until invalidation is applied (then terminal)
 * - reconsideration: documentary only; does not block progression
 */
export const BLOCKING_COMPLIANCE_BOUNDARY_CONSEQUENCES: readonly ComplianceBoundaryChangeConsequence[] =
  Object.freeze(["rework_required", "successor_required", "invalidation_required"]);

export function isBlockingComplianceBoundaryConsequence(
  consequence: ComplianceBoundaryChangeConsequence,
): boolean {
  return (BLOCKING_COMPLIANCE_BOUNDARY_CONSEQUENCES as readonly string[]).includes(consequence);
}

/**
 * Fail closed when unresolved blocking CB consequences remain on a forward-active RVA.
 * Events are scoped to the RVA identity — successors do not inherit predecessor blocks.
 */
export function assertNoBlockingComplianceBoundaryConsequences(
  events: readonly ComplianceBoundaryChangeEvent[],
): void {
  const blocking = events.filter((event) =>
    isBlockingComplianceBoundaryConsequence(event.consequence),
  );

  if (blocking.length === 0) {
    return;
  }

  const kinds = [...new Set(blocking.map((e) => e.consequence))].join(", ");
  throw new OrchestraConstitutionalError(
    `Unresolved Compliance Boundary consequence blocks Domain 2 progression: ${kinds}`,
    "invalid_compliance_boundary_change",
    ["FI-DSN-STD-013-R29", "FI-DSN-STD-013-R46"],
  );
}

export const COMPLIANCE_BOUNDARY_CHANGE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...CB_CHANGE_REQUIREMENTS,
]);
