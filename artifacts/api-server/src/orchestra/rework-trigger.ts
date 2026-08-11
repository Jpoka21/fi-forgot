/**
 * External rework trigger consumption — FI-DSN-STD-013-R32 boundary.
 * Records STD-014-originated triggers without issuing review authority.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import { createDomain2GovernedCreationMarker } from "./domain2-entry.js";
import type {
  ExternalReworkTriggerId,
  ExternalReworkTriggerRecord,
  RealizedVisualArtifact,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { isForwardActiveRvaPosture } from "./rva-lifecycle.js";

const REWORK_TRIGGER_REQUIREMENTS = ["FI-DSN-STD-013-R32"] as const;

export function createExternalReworkTriggerId(): ExternalReworkTriggerId {
  return `rework-trigger-${randomUUID()}` as ExternalReworkTriggerId;
}

/**
 * Consume an external rework trigger from the STD-014 boundary — R32.
 * Does NOT authorize rework or issue Review Determinations.
 */
export function consumeExternalReworkTrigger(input: {
  rva: RealizedVisualArtifact;
  externalReviewReference: string;
  triggerBasis: string;
  consumedBy: string;
  consumedAt?: string;
}): ExternalReworkTriggerRecord {
  if (!isForwardActiveRvaPosture(input.rva.posture)) {
    throw new OrchestraConstitutionalError(
      "External rework trigger consumption requires forward-active RVA",
      "invalid_rework_trigger",
      ["FI-DSN-STD-013-R32"],
    );
  }

  const externalReviewReference = input.externalReviewReference.trim();
  const triggerBasis = input.triggerBasis.trim();

  if (!externalReviewReference || !triggerBasis) {
    throw new OrchestraConstitutionalError(
      "External rework trigger requires review reference and governing basis",
      "invalid_rework_trigger",
      ["FI-DSN-STD-013-R32"],
    );
  }

  const now = input.consumedAt ?? new Date().toISOString();

  return Object.freeze({
    triggerId: createExternalReworkTriggerId(),
    rvaId: input.rva.id,
    programId: input.rva.programId,
    obligationId: input.rva.obligationId,
    externalReviewReference,
    triggerBasis,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.consumedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...REWORK_TRIGGER_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

export const EXTERNAL_REWORK_TRIGGER_TRACEABILITY = createDomain2GovernanceTraceability([
  ...REWORK_TRIGGER_REQUIREMENTS,
]);
