/**
 * Low-level storage port for Domain 2 constitutional aggregates.
 * Storage-independent — no database coupling.
 */

import type {
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
} from "../domain2-types.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";

export interface Domain2StoragePort {
  putExplorationPosture(record: ExplorationPostureRecord): Promise<void>;
  getExplorationPosture(
    recordId: ExplorationPostureRecordId,
  ): Promise<ExplorationPostureRecord | null>;
  getExplorationPostureByScope(
    programId: ProductionProgramId,
    obligationId: ProductionObligationId,
  ): Promise<ExplorationPostureRecord | null>;

  putRealizationCommitment(commitment: RealizationCommitment): Promise<void>;
  getRealizationCommitment(
    commitmentId: RealizationCommitmentId,
  ): Promise<RealizationCommitment | null>;

  putRva(rva: RealizedVisualArtifact): Promise<void>;
  getRva(rvaId: RealizedVisualArtifactId): Promise<RealizedVisualArtifact | null>;
}
