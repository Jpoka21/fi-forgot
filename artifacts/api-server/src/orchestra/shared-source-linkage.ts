/**
 * Shared-Source Linkage — FI-DSN-STD-013-R47, R48.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { createDomain2GovernanceTraceability } from "./domain2-authority.js";
import { createDomain2GovernedCreationMarker } from "./domain2-entry.js";
import type {
  RealizedVisualArtifact,
  SharedSourceLinkageId,
  SharedSourceLinkageRecord,
} from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { isForwardActiveRvaPosture } from "./rva-lifecycle.js";

const LINKAGE_REQUIREMENTS = [
  "FI-DSN-STD-013-R47",
  "FI-DSN-STD-013-R48",
] as const;

export function createSharedSourceLinkageId(): SharedSourceLinkageId {
  return `shared-source-linkage-${randomUUID()}` as SharedSourceLinkageId;
}

/**
 * Establish explicit Shared-Source Linkage between source and consumer RVAs.
 * Preserves independent RVA identity and lifecycle — R47.
 */
export function establishSharedSourceLinkage(input: {
  sourceRva: RealizedVisualArtifact;
  consumerRva: RealizedVisualArtifact;
  linkageBasis: string;
  establishedBy: string;
  establishedAt?: string;
}): SharedSourceLinkageRecord {
  if (input.sourceRva.id === input.consumerRva.id) {
    throw new OrchestraConstitutionalError(
      "Shared-Source Linkage requires distinct source and consumer RVA identities",
      "invalid_shared_source_linkage",
      ["FI-DSN-STD-013-R47"],
    );
  }

  if (!isForwardActiveRvaPosture(input.sourceRva.posture)) {
    throw new OrchestraConstitutionalError(
      "Shared-Source Linkage source RVA must be forward-active",
      "invalid_shared_source_linkage",
      ["FI-DSN-STD-013-R47"],
    );
  }

  if (!isForwardActiveRvaPosture(input.consumerRva.posture)) {
    throw new OrchestraConstitutionalError(
      "Shared-Source Linkage consumer RVA must be forward-active",
      "invalid_shared_source_linkage",
      ["FI-DSN-STD-013-R47"],
    );
  }

  if (input.sourceRva.obligationId === input.consumerRva.obligationId) {
    throw new OrchestraConstitutionalError(
      "Shared-Source Linkage requires distinct Production Obligation scopes",
      "invalid_shared_source_linkage",
      ["FI-DSN-STD-013-R47"],
    );
  }

  if (input.sourceRva.programId !== input.consumerRva.programId) {
    throw new OrchestraConstitutionalError(
      "Shared-Source Linkage requires source and consumer RVAs within the same Production Program",
      "invalid_shared_source_linkage",
      ["FI-DSN-STD-013-R47"],
    );
  }

  const linkageBasis = input.linkageBasis.trim();
  if (!linkageBasis) {
    throw new OrchestraConstitutionalError(
      "Shared-Source Linkage requires explicit governing basis",
      "invalid_shared_source_linkage",
      ["FI-DSN-STD-013-R40"],
    );
  }

  const now = input.establishedAt ?? new Date().toISOString();

  return Object.freeze({
    linkageId: createSharedSourceLinkageId(),
    sourceRvaId: input.sourceRva.id,
    sourceProgramId: input.sourceRva.programId,
    sourceObligationId: input.sourceRva.obligationId,
    consumerRvaId: input.consumerRva.id,
    consumerProgramId: input.consumerRva.programId,
    consumerObligationId: input.consumerRva.obligationId,
    linkageBasis,
    audit: Object.freeze({
      createdAt: now,
      createdBy: input.establishedBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: createDomain2GovernanceTraceability([...LINKAGE_REQUIREMENTS]),
    governedCreationMarker: createDomain2GovernedCreationMarker(),
  });
}

export const SHARED_SOURCE_LINKAGE_TRACEABILITY = createDomain2GovernanceTraceability([
  ...LINKAGE_REQUIREMENTS,
]);
