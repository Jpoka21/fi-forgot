import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type {
  ConstitutionalAuditMetadata,
  ObligationEnforcementPosture,
  ObligationResolutionRecord,
  ProductionObligationId,
  ProductionProgramId,
} from "./types.js";

const OBLIGATION_REQUIREMENTS = [
  "FI-DSN-STD-012-R16",
  "FI-DSN-STD-012-R17",
  "FI-DSN-STD-012-R18",
  "FI-DSN-STD-012-R19",
] as const;

/**
 * Production Obligation — bounded realization duty within exactly one program.
 * FI-DSN-STD-012-R16 through R20.
 */
export interface ProductionObligation {
  readonly id: ProductionObligationId;
  readonly programId: ProductionProgramId;
  readonly description: string;
  readonly enforcementPosture: ObligationEnforcementPosture;
  readonly conditions: readonly string[];
  readonly complianceBoundaryRefs: readonly string[];
  /** Required when enforcementPosture is waived — R18, R31 */
  readonly waiverRecordId: string | null;
  readonly audit: ConstitutionalAuditMetadata;
  /** Resolution provenance — separate from creation audit. R37, R38 */
  readonly resolution: ObligationResolutionRecord | null;
}

export function createProductionObligationId(): ProductionObligationId {
  return `obligation-${randomUUID()}` as ProductionObligationId;
}

export function createProductionObligation(input: {
  programId: ProductionProgramId;
  description: string;
  enforcementPosture?: ObligationEnforcementPosture;
  conditions?: readonly string[];
  complianceBoundaryRefs?: readonly string[];
  waiverRecordId?: string | null;
  createdBy: string;
  createdAt?: string;
}): ProductionObligation {
  const description = input.description.trim();
  if (!description) {
    throw new OrchestraConstitutionalError(
      "Production Obligation requires a bounded description",
      "invalid_obligation",
      ["FI-DSN-STD-012-R16", "FI-DSN-STD-012-R17"],
    );
  }

  const enforcementPosture = input.enforcementPosture ?? "unconditional";
  const conditions = Object.freeze([...(input.conditions ?? [])]);
  const waiverRecordId = input.waiverRecordId ?? null;

  if (enforcementPosture === "conditional" && conditions.length === 0) {
    throw new OrchestraConstitutionalError(
      "Conditional Obligation requires explicitly recorded conditions",
      "invalid_obligation",
      ["FI-DSN-STD-012-R18", "FI-DSN-STD-012-R33"],
    );
  }

  if (enforcementPosture === "waived") {
    const linkedWaiverId = waiverRecordId?.trim();
    if (!linkedWaiverId || !linkedWaiverId.startsWith("waiver-")) {
      throw new OrchestraConstitutionalError(
        "Waived obligation requires linked Waiver evidence",
        "invalid_obligation",
        ["FI-DSN-STD-012-R18", "FI-DSN-STD-012-R31", "FI-DSN-STD-012-R32"],
      );
    }
  } else if (waiverRecordId) {
    throw new OrchestraConstitutionalError(
      "Waiver evidence may only be linked to waived obligations",
      "invalid_obligation",
      ["FI-DSN-STD-012-R31", "FI-DSN-STD-012-R32"],
    );
  }

  const now = input.createdAt ?? new Date().toISOString();

  return Object.freeze({
    id: createProductionObligationId(),
    programId: input.programId,
    description,
    enforcementPosture,
    conditions,
    complianceBoundaryRefs: Object.freeze([...(input.complianceBoundaryRefs ?? [])]),
    waiverRecordId: enforcementPosture === "waived" ? waiverRecordId!.trim() : null,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.createdBy,
      traceability: createGovernanceTraceability([...OBLIGATION_REQUIREMENTS]),
    }),
    resolution: null,
  });
}

/** R18 — obligations cannot be silently removed or treated as satisfied. */
export function resolveObligationConstraint(
  obligation: ProductionObligation,
  input: {
    resolution: string;
    resolvedBy: string;
    resolvedAt?: string;
  },
): ProductionObligation {
  if (obligation.enforcementPosture !== "unresolved_constraint") {
    throw new OrchestraConstitutionalError(
      "Only obligations with unresolved_constraint posture may be resolved",
      "invalid_obligation",
      ["FI-DSN-STD-012-R18", "FI-DSN-STD-012-R33"],
    );
  }

  const resolution = input.resolution.trim();
  if (!resolution) {
    throw new OrchestraConstitutionalError(
      "Obligation resolution requires an explicit governed record",
      "invalid_obligation",
      ["FI-DSN-STD-012-R18"],
    );
  }

  const resolvedAt = input.resolvedAt ?? new Date().toISOString();
  const resolutionRecord: ObligationResolutionRecord = Object.freeze({
    resolution,
    resolvedAt,
    resolvedBy: input.resolvedBy,
  });

  return Object.freeze({
    ...obligation,
    enforcementPosture: "unconditional",
    conditions: Object.freeze([...obligation.conditions, `resolved:${resolution}`]),
    waiverRecordId: obligation.waiverRecordId,
    resolution: resolutionRecord,
  });
}

export const PRODUCTION_OBLIGATION_TRACEABILITY = createGovernanceTraceability([
  ...OBLIGATION_REQUIREMENTS,
]);
