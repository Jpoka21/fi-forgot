/**
 * Governed Domain 2 repository — aggregate consistency over Domain 2 constitutional objects.
 *
 * Consumes Domain 1 repository for readiness verification.
 * Enforces constitutional invariants at the persistence boundary.
 */

import type { Domain1Repository } from "./domain1-repository.js";
import { createInMemoryDomain2Storage } from "./domain2-in-memory-storage.js";
import {
  rehydrateExplorationPosture,
  rehydrateRealizationCommitment,
  rehydrateRva,
} from "./domain2-rehydration.js";
import type { Domain2StoragePort } from "./domain2-storage-port.js";
import {
  validatePersistedExplorationPosture,
  validatePersistedRealizationCommitment,
  validatePersistedRva,
} from "./domain2-validation.js";
import { evaluateDomain2Readiness } from "../domain2-boundary.js";
import type {
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizationPath,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
} from "../domain2-types.js";
import {
  achieveExplorationExitReady,
  beginExplorationPosture,
} from "../exploration-posture.js";
import { OrchestraConstitutionalError } from "../errors.js";
import type { ProductionProgram } from "../production-program.js";
import { recordRealizationCommitment } from "../realization-commitment.js";
import { establishRealizedVisualArtifact } from "../realized-visual-artifact.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";

export interface Domain2Repository {
  beginExplorationPosture(input: {
    programId: ProductionProgramId;
    obligationId: ProductionObligationId;
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

  loadExplorationPosture(
    recordId: ExplorationPostureRecordId,
  ): Promise<ExplorationPostureRecord | null>;

  loadRealizationCommitment(
    commitmentId: RealizationCommitmentId,
  ): Promise<RealizationCommitment | null>;

  loadRva(rvaId: RealizedVisualArtifactId): Promise<RealizedVisualArtifact | null>;
}

export function createDomain2Repository(
  domain1: Domain1Repository,
): Domain2Repository {
  return createDomain2RepositoryWithStorage(domain1, createInMemoryDomain2Storage());
}

/** Internal factory for tests requiring custom storage — not part of the primary public barrel. */
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

  async function assertDomain1Readiness(
    program: ProductionProgram,
  ): Promise<{ isConstitutionallyCurrent: boolean }> {
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

    return { isConstitutionallyCurrent: true };
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

  async function persistRvaInternal(rva: RealizedVisualArtifact): Promise<RealizedVisualArtifact> {
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

  return {
    async beginExplorationPosture(input) {
      const program = await loadActiveProgram(input.programId);
      await assertDomain1Readiness(program);

      const storedEntry = await domain1.loadExplorationDetermination(program.id);
      if (!storedEntry) {
        throw new OrchestraConstitutionalError(
          "Exploration-Entry Determination required for Domain 2 operation",
          "domain2_not_ready",
          ["FI-DSN-STD-013-R11", "FI-DSN-STD-012-R40"],
        );
      }

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
      await assertDomain1Readiness(program);

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
      await assertDomain1Readiness(program);

      const postureRaw = await storage.getExplorationPosture(input.explorationPostureRecordId);
      if (!postureRaw) {
        throw new OrchestraConstitutionalError(
          "Exploration Posture record not found for Realization Commitment",
          "invalid_realization_commitment",
          ["FI-DSN-STD-013-R18"],
        );
      }
      const explorationPostureRecord = rehydrateExplorationPosture(postureRaw);

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
      await assertDomain1Readiness(program);

      const commitmentRaw = await storage.getRealizationCommitment(input.realizationCommitmentId);
      if (!commitmentRaw) {
        throw new OrchestraConstitutionalError(
          "Realization Commitment not found for RVA establishment",
          "invalid_rva",
          ["FI-DSN-STD-013-R22"],
        );
      }
      const realizationCommitment = rehydrateRealizationCommitment(commitmentRaw);

      const rva = establishRealizedVisualArtifact({
        program,
        obligationId: input.obligationId,
        realizationCommitment,
        realizationPath: input.realizationPath,
        establishedBy: input.establishedBy,
      });

      return persistRvaInternal(rva);
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
  };
}
