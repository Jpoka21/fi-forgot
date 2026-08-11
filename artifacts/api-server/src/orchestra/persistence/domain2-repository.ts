/**
 * Governed Domain 2 repository — aggregate consistency over Domain 2 constitutional objects.
 */

import type { Domain1Repository } from "./domain1-repository.js";
import { createInMemoryDomain2Storage } from "./domain2-in-memory-storage.js";
import {
  rehydrateExplorationPosture,
  rehydrateRealizationCommitment,
  rehydrateReviewEntryReadiness,
  rehydrateRva,
} from "./domain2-rehydration.js";
import type { StoredExplorationEntry } from "./rehydration.js";
import type { Domain2StoragePort } from "./domain2-storage-port.js";
import {
  validatePersistedExplorationPosture,
  validatePersistedRealizationCommitment,
  validatePersistedReviewEntryReadiness,
  validatePersistedRva,
} from "./domain2-validation.js";
import type { Domain1EntryEvidence } from "../domain2-types.js";
import { evaluateDomain2Readiness } from "../domain2-boundary.js";
import { assertEntryEvidenceMatchesActiveDetermination } from "../domain2-readiness.js";
import type {
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizationPath,
  RealizationTraceabilityPackage,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  ReviewEntryReadiness,
} from "../domain2-types.js";
import {
  achieveExplorationExitReady,
  beginExplorationPosture,
  beginExplorationWaived,
} from "../exploration-posture.js";
import { OrchestraConstitutionalError } from "../errors.js";
import type { ProductionProgram } from "../production-program.js";
import { recordRealizationCommitment } from "../realization-commitment.js";
import { establishRealizedVisualArtifact } from "../realized-visual-artifact.js";
import { determineReviewEntryReadiness } from "../review-entry-readiness.js";
import {
  createSuccessorRva,
  invalidateRva,
  promoteRvaToExists,
} from "../rva-lifecycle.js";
import {
  assembleRealizationTraceabilityPackage,
} from "../traceability-package.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";

export interface Domain2Repository {
  beginExplorationPosture(input: {
    programId: ProductionProgramId;
    obligationId: ProductionObligationId;
    governingBasis: string;
    operatedBy: string;
  }): Promise<ExplorationPostureRecord>;

  beginExplorationWaived(input: {
    programId: ProductionProgramId;
    obligationId: ProductionObligationId;
    waiverId: string;
    governingBasis: string;
    operatedBy: string;
  }): Promise<ExplorationPostureRecord>;

  achieveExplorationExitReady(input: {
    recordId: ExplorationPostureRecordId;
    exitBasis: string;
    achievedBy: string;
  }): Promise<ExplorationPostureRecord>;

  recordRealizationCommitment(input: {
    programId: ProductionProgramId;
    obligationId: ProductionObligationId;
    explorationPostureRecordId: ExplorationPostureRecordId;
    governingBasis: string;
    committedBy: string;
  }): Promise<RealizationCommitment>;

  establishRealizedVisualArtifact(input: {
    programId: ProductionProgramId;
    obligationId: ProductionObligationId;
    realizationCommitmentId: RealizationCommitmentId;
    realizationPath: RealizationPath;
    establishedBy: string;
  }): Promise<RealizedVisualArtifact>;

  promoteRvaToExists(input: {
    rvaId: RealizedVisualArtifactId;
    basis: string;
    promotedBy: string;
  }): Promise<RealizedVisualArtifact>;

  createSuccessorRva(input: {
    priorRvaId: RealizedVisualArtifactId;
    realizationPath: RealizationPath;
    iterationBasis: string;
    createdBy: string;
  }): Promise<{ priorSuperseded: RealizedVisualArtifact; successor: RealizedVisualArtifact }>;

  invalidateRva(input: {
    rvaId: RealizedVisualArtifactId;
    reason: string;
    invalidatedBy: string;
  }): Promise<RealizedVisualArtifact>;

  assembleTraceabilityPackage(input: {
    rvaId: RealizedVisualArtifactId;
  }): Promise<RealizationTraceabilityPackage>;

  determineReviewEntryReadiness(input: {
    rvaId: RealizedVisualArtifactId;
    determinedBy: string;
  }): Promise<ReviewEntryReadiness>;

  loadExplorationPosture(
    recordId: ExplorationPostureRecordId,
  ): Promise<ExplorationPostureRecord | null>;

  loadRealizationCommitment(
    commitmentId: RealizationCommitmentId,
  ): Promise<RealizationCommitment | null>;

  loadRva(rvaId: RealizedVisualArtifactId): Promise<RealizedVisualArtifact | null>;

  loadReviewEntryReadinessByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ReviewEntryReadiness | null>;
}

export function createDomain2Repository(
  domain1: Domain1Repository,
): Domain2Repository {
  return createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
}

export function createDomain2RepositoryWithStorage(
  domain1: Domain1Repository,
  storage: Domain2StoragePort,
): Domain2Repository {
  async function loadActiveProgram(programId: ProductionProgramId): Promise<ProductionProgram> {
    const program = await domain1.loadProgram(programId);
    if (!program) {
      throw new OrchestraConstitutionalError(
        "Production Program not found for Domain 2 operation",
        "invalid_program_structure",
        ["FI-DSN-STD-013-R07", "FI-DSN-STD-012-R11"],
      );
    }
    return program;
  }

  async function assertDomain1Readiness(program: ProductionProgram): Promise<StoredExplorationEntry> {
    const isConstitutionallyCurrent = await domain1.isConstitutionallyCurrent(program);
    if (!isConstitutionallyCurrent) {
      throw new OrchestraConstitutionalError(
        "Domain 2 activity requires constitutionally current Production Program",
        "domain2_not_ready",
        ["FI-DSN-STD-013-R07", "FI-DSN-STD-012-R41"],
      );
    }

    const storedEntry = await domain1.loadExplorationDetermination(program.id);
    if (!storedEntry || storedEntry.status !== "active") {
      throw new OrchestraConstitutionalError(
        "Domain 2 activity requires active Exploration-Entry Determination",
        "domain2_not_ready",
        ["FI-DSN-STD-013-R07", "FI-DSN-STD-012-R40"],
      );
    }

    const readiness = evaluateDomain2Readiness({
      program,
      explorationEntry: storedEntry.determination,
      explorationEntryStatus: storedEntry.status,
      isConstitutionallyCurrent: true,
    });

    if (!readiness?.isReadyForDomain2Integration) {
      throw new OrchestraConstitutionalError(
        "Domain 2 activity requires valid Domain 1 readiness",
        "domain2_not_ready",
        ["FI-DSN-STD-013-R07", "FI-DSN-STD-013-R11"],
      );
    }

    return storedEntry;
  }

  async function assertLiveDomain1Context(
    program: ProductionProgram,
    entryEvidence?: Domain1EntryEvidence,
  ): Promise<StoredExplorationEntry> {
    const storedEntry = await assertDomain1Readiness(program);
    if (entryEvidence) {
      assertEntryEvidenceMatchesActiveDetermination(entryEvidence, storedEntry, program);
    }
    return storedEntry;
  }

  async function persistExplorationPostureInternal(
    record: ExplorationPostureRecord,
  ): Promise<ExplorationPostureRecord> {
    validatePersistedExplorationPosture(record);
    await storage.putExplorationPosture(record);
    const loaded = await storage.getExplorationPosture(record.recordId);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Exploration Posture record",
        "invalid_domain2_persistence_state",
        ["FI-DSN-STD-013-R12"],
      );
    }
    return rehydrateExplorationPosture(loaded);
  }

  async function persistRealizationCommitmentInternal(
    commitment: RealizationCommitment,
  ): Promise<RealizationCommitment> {
    validatePersistedRealizationCommitment(commitment);
    await storage.putRealizationCommitment(commitment);
    const loaded = await storage.getRealizationCommitment(commitment.commitmentId);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Realization Commitment",
        "invalid_domain2_persistence_state",
        ["FI-DSN-STD-013-R17"],
      );
    }
    return rehydrateRealizationCommitment(loaded);
  }

  async function persistNewRvaInternal(rva: RealizedVisualArtifact): Promise<RealizedVisualArtifact> {
    validatePersistedRva(rva);
    const existing = await storage.getRva(rva.id);
    if (existing) {
      throw new OrchestraConstitutionalError(
        "Realized Visual Artifact identity already exists",
        "identity_violation",
        ["FI-DSN-STD-013-R26"],
      );
    }
    await storage.putRva(rva);
    const loaded = await storage.getRva(rva.id);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Realized Visual Artifact",
        "invalid_domain2_persistence_state",
        ["FI-DSN-STD-013-R22"],
      );
    }
    return rehydrateRva(loaded);
  }

  async function updateRvaInternal(rva: RealizedVisualArtifact): Promise<RealizedVisualArtifact> {
    validatePersistedRva(rva);
    await storage.putRva(rva, { allowUpdate: true });
    const loaded = await storage.getRva(rva.id);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to update Realized Visual Artifact",
        "invalid_domain2_persistence_state",
        ["FI-DSN-STD-013-R22"],
      );
    }
    return rehydrateRva(loaded);
  }

  async function persistReviewEntryReadinessInternal(
    readiness: ReviewEntryReadiness,
  ): Promise<ReviewEntryReadiness> {
    validatePersistedReviewEntryReadiness(readiness);
    const existing = await storage.getReviewEntryReadinessByRva(readiness.rvaId);
    if (existing) {
      throw new OrchestraConstitutionalError(
        "Review-Entry Readiness already exists for this RVA",
        "invalid_review_entry_readiness",
        ["FI-DSN-STD-013-R49"],
      );
    }
    await storage.putReviewEntryReadiness(readiness);
    const loaded = await storage.getReviewEntryReadiness(readiness.readinessId);
    if (!loaded) {
      throw new OrchestraConstitutionalError(
        "Failed to persist Review-Entry Readiness",
        "invalid_domain2_persistence_state",
        ["FI-DSN-STD-013-R49"],
      );
    }
    return rehydrateReviewEntryReadiness(loaded);
  }

  return {
    async beginExplorationPosture(input) {
      const program = await loadActiveProgram(input.programId);
      const storedEntry = await assertDomain1Readiness(program);
      const isConstitutionallyCurrent = await domain1.isConstitutionallyCurrent(program);
      const record = beginExplorationPosture({
        program,
        obligationId: input.obligationId,
        explorationEntry: storedEntry.determination,
        explorationEntryStatus: storedEntry.status,
        isConstitutionallyCurrent,
        governingBasis: input.governingBasis,
        operatedBy: input.operatedBy,
      });
      return persistExplorationPostureInternal(record);
    },

    async beginExplorationWaived(input) {
      const program = await loadActiveProgram(input.programId);
      const storedEntry = await assertDomain1Readiness(program);
      const waiver = await domain1.loadWaiver(input.waiverId);
      if (!waiver) {
        throw new OrchestraConstitutionalError(
          "Exploration Waived requires persisted Domain 1 waiver evidence",
          "invalid_waiver",
          ["FI-DSN-STD-013-R14", "FI-DSN-STD-012-R31"],
        );
      }
      const isConstitutionallyCurrent = await domain1.isConstitutionallyCurrent(program);
      const record = beginExplorationWaived({
        program,
        obligationId: input.obligationId,
        explorationEntry: storedEntry.determination,
        explorationEntryStatus: storedEntry.status,
        isConstitutionallyCurrent,
        explorationWaiver: waiver,
        governingBasis: input.governingBasis,
        operatedBy: input.operatedBy,
      });
      return persistExplorationPostureInternal(record);
    },

    async achieveExplorationExitReady(input) {
      const existing = await storage.getExplorationPosture(input.recordId);
      if (!existing) {
        throw new OrchestraConstitutionalError(
          "Exploration Posture record not found",
          "invalid_exploration_posture",
          ["FI-DSN-STD-013-R15"],
        );
      }
      const record = rehydrateExplorationPosture(existing);
      const program = await loadActiveProgram(record.programId);
      await assertLiveDomain1Context(program, record.domain1EntryEvidence);

      const updated = achieveExplorationExitReady({
        record,
        program,
        exitBasis: input.exitBasis,
        achievedBy: input.achievedBy,
      });

      return persistExplorationPostureInternal(updated);
    },

    async recordRealizationCommitment(input) {
      const program = await loadActiveProgram(input.programId);
      const postureRaw = await storage.getExplorationPosture(input.explorationPostureRecordId);
      if (!postureRaw) {
        throw new OrchestraConstitutionalError(
          "Exploration Posture record not found for Realization Commitment",
          "invalid_realization_commitment",
          ["FI-DSN-STD-013-R18"],
        );
      }
      const explorationPostureRecord = rehydrateExplorationPosture(postureRaw);
      await assertLiveDomain1Context(program, explorationPostureRecord.domain1EntryEvidence);

      const commitment = recordRealizationCommitment({
        program,
        obligationId: input.obligationId,
        explorationPostureRecord,
        governingBasis: input.governingBasis,
        committedBy: input.committedBy,
      });

      return persistRealizationCommitmentInternal(commitment);
    },

    async establishRealizedVisualArtifact(input) {
      const program = await loadActiveProgram(input.programId);
      const commitmentRaw = await storage.getRealizationCommitment(input.realizationCommitmentId);
      if (!commitmentRaw) {
        throw new OrchestraConstitutionalError(
          "Realization Commitment not found for RVA establishment",
          "invalid_rva",
          ["FI-DSN-STD-013-R22"],
        );
      }
      const realizationCommitment = rehydrateRealizationCommitment(commitmentRaw);
      await assertLiveDomain1Context(program, realizationCommitment.domain1EntryEvidence);

      const rva = establishRealizedVisualArtifact({
        program,
        obligationId: input.obligationId,
        realizationCommitment,
        realizationPath: input.realizationPath,
        establishedBy: input.establishedBy,
      });

      return persistNewRvaInternal(rva);
    },

    async promoteRvaToExists(input) {
      const existing = await storage.getRva(input.rvaId);
      if (!existing) {
        throw new OrchestraConstitutionalError(
          "RVA not found for Exists promotion",
          "invalid_rva",
          ["FI-DSN-STD-013-R22"],
        );
      }
      const rva = rehydrateRva(existing);
      const program = await loadActiveProgram(rva.programId);
      await assertLiveDomain1Context(program, rva.domain1EntryEvidence);

      const promoted = promoteRvaToExists({
        rva,
        program,
        basis: input.basis,
        promotedBy: input.promotedBy,
      });

      return updateRvaInternal(promoted);
    },

    async createSuccessorRva(input) {
      const existing = await storage.getRva(input.priorRvaId);
      if (!existing) {
        throw new OrchestraConstitutionalError(
          "Prior RVA not found for successor creation",
          "invalid_rva",
          ["FI-DSN-STD-013-R31"],
        );
      }
      const priorRva = rehydrateRva(existing);
      const program = await loadActiveProgram(priorRva.programId);
      await assertLiveDomain1Context(program, priorRva.domain1EntryEvidence);

      const result = createSuccessorRva({
        priorRva,
        program,
        realizationPath: input.realizationPath,
        iterationBasis: input.iterationBasis,
        createdBy: input.createdBy,
      });

      const priorSuperseded = await updateRvaInternal(result.priorSuperseded);
      const successor = await persistNewRvaInternal(result.successor);
      return { priorSuperseded, successor };
    },

    async invalidateRva(input) {
      const existing = await storage.getRva(input.rvaId);
      if (!existing) {
        throw new OrchestraConstitutionalError(
          "RVA not found for invalidation",
          "invalid_rva",
          ["FI-DSN-STD-013-R45"],
        );
      }
      const rva = rehydrateRva(existing);
      const program = await loadActiveProgram(rva.programId);
      await assertLiveDomain1Context(program, rva.domain1EntryEvidence);

      const invalidated = invalidateRva({
        rva,
        program,
        reason: input.reason,
        invalidatedBy: input.invalidatedBy,
      });

      return updateRvaInternal(invalidated);
    },

    async assembleTraceabilityPackage(input) {
      const rvaRaw = await storage.getRva(input.rvaId);
      if (!rvaRaw) {
        throw new OrchestraConstitutionalError(
          "RVA not found for traceability package assembly",
          "invalid_rva",
          ["FI-DSN-STD-013-R41"],
        );
      }
      const rva = rehydrateRva(rvaRaw);
      const commitmentRaw = await storage.getRealizationCommitment(rva.realizationCommitmentId);
      if (!commitmentRaw) {
        throw new OrchestraConstitutionalError(
          "Realization Commitment not found for traceability package",
          "invalid_realization_commitment",
          ["FI-DSN-STD-013-R41"],
        );
      }
      const commitment = rehydrateRealizationCommitment(commitmentRaw);
      const explorationRaw = await storage.getExplorationPosture(commitment.explorationPostureRecordId);
      if (!explorationRaw) {
        throw new OrchestraConstitutionalError(
          "Exploration Posture not found for traceability package",
          "invalid_exploration_posture",
          ["FI-DSN-STD-013-R41"],
        );
      }
      const explorationPosture = rehydrateExplorationPosture(explorationRaw);
      return assembleRealizationTraceabilityPackage({
        rva,
        commitment,
        explorationPosture,
      });
    },

    async determineReviewEntryReadiness(input) {
      const rvaRaw = await storage.getRva(input.rvaId);
      if (!rvaRaw) {
        throw new OrchestraConstitutionalError(
          "RVA not found for Review-Entry Readiness",
          "invalid_review_entry_readiness",
          ["FI-DSN-STD-013-R49"],
        );
      }
      const rva = rehydrateRva(rvaRaw);
      const program = await loadActiveProgram(rva.programId);
      await assertLiveDomain1Context(program, rva.domain1EntryEvidence);

      const traceabilityPackage = await this.assembleTraceabilityPackage({ rvaId: input.rvaId });
      const readiness = determineReviewEntryReadiness({
        rva,
        traceabilityPackage,
        determinedBy: input.determinedBy,
      });

      return persistReviewEntryReadinessInternal(readiness);
    },

    async loadExplorationPosture(recordId) {
      const raw = await storage.getExplorationPosture(recordId);
      return raw ? rehydrateExplorationPosture(raw) : null;
    },

    async loadRealizationCommitment(commitmentId) {
      const raw = await storage.getRealizationCommitment(commitmentId);
      return raw ? rehydrateRealizationCommitment(raw) : null;
    },

    async loadRva(rvaId) {
      const raw = await storage.getRva(rvaId);
      return raw ? rehydrateRva(raw) : null;
    },

    async loadReviewEntryReadinessByRva(rvaId) {
      const raw = await storage.getReviewEntryReadinessByRva(rvaId);
      return raw ? rehydrateReviewEntryReadiness(raw) : null;
    },
  };
}
