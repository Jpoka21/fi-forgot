/**
 * Governed Domain 1 repository — aggregate consistency over CRUD convenience.
 *
 * Enforces constitutional invariants at the persistence boundary:
 * - current-program semantics (R11, R12, R41)
 * - waiver existence linkage (R31)
 * - exploration determination ownership (R26, R30)
 * - material amendment consequences (R34, R35)
 * - safe rehydration on load
 */

import type { ExplorationEntryDetermination } from "../exploration-entry.js";
import { OrchestraConstitutionalError } from "../errors.js";
import type { DeclaredProductionIntent } from "../production-intent.js";
import type { ProductionProgram } from "../production-program.js";
import { recordProgramAmendment } from "../production-program.js";
import type {
  ProductionIntentId,
  ProductionProgramId,
  ProgramAmendmentMateriality,
  ProgramSplitRecord,
} from "../types.js";
import type { ExceptionRecord, WaiverRecord } from "../waiver.js";
import {
  executeGovernedProgramSplit,
  type GovernedProgramSplitInput,
  type GovernedProgramSplitResult,
} from "../program-split.js";
import { rehydrateIntent, rehydrateProgram, type StoredExplorationEntry } from "./rehydration.js";
import { createInMemoryDomain1Storage } from "./in-memory-storage.js";
import type { Domain1StoragePort } from "./storage-port.js";
import { validatePersistedProgram } from "./validation.js";

export interface Domain1Repository {
  persistIntent(intent: DeclaredProductionIntent): Promise<DeclaredProductionIntent>;
  loadIntent(intentId: ProductionIntentId): Promise<DeclaredProductionIntent | null>;

  persistProgram(program: ProductionProgram): Promise<ProductionProgram>;
  loadProgram(programId: ProductionProgramId): Promise<ProductionProgram | null>;
  listProgramsByIntent(intentId: ProductionIntentId): Promise<readonly ProductionProgram[]>;

  persistWaiver(waiver: WaiverRecord): Promise<WaiverRecord>;
  loadWaiver(waiverId: string): Promise<WaiverRecord | null>;

  persistException(exception: ExceptionRecord): Promise<ExceptionRecord>;

  persistExplorationDetermination(
    determination: ExplorationEntryDetermination,
  ): Promise<StoredExplorationEntry>;
  loadExplorationDetermination(
    programId: ProductionProgramId,
  ): Promise<StoredExplorationEntry | null>;
  loadActiveExplorationDetermination(
    programId: ProductionProgramId,
  ): Promise<ExplorationEntryDetermination | null>;

  executeProgramSplit(input: GovernedProgramSplitInput): Promise<GovernedProgramSplitResult>;
  listProgramSplits(intentId: ProductionIntentId): Promise<readonly ProgramSplitRecord[]>;

  getCurrentPrograms(intentId: ProductionIntentId): Promise<readonly ProductionProgram[]>;
  isConstitutionallyCurrent(program: ProductionProgram): Promise<boolean>;

  recordAmendmentWithConsequences(
    program: ProductionProgram,
    input: {
      materiality: ProgramAmendmentMateriality;
      reason: string;
      amendedBy: string;
      amendedAt?: string;
      nonmaterialEligibilityPreserved?: boolean;
    },
  ): Promise<ProductionProgram>;
}

export function createDomain1Repository(
  storage: Domain1StoragePort = createInMemoryDomain1Storage(),
): Domain1Repository {
  async function assertWaiverLinkage(program: ProductionProgram): Promise<void> {
    for (const obligation of program.obligations) {
      if (obligation.enforcementPosture !== "waived") continue;
      const waiverId = obligation.waiverRecordId;
      if (!waiverId) {
        throw new OrchestraConstitutionalError(
          "Waived obligation requires linked Waiver evidence",
          "invalid_waiver",
          ["FI-DSN-STD-012-R18", "FI-DSN-STD-012-R31"],
        );
      }
      const waiver = await storage.getWaiver(waiverId);
      if (!waiver) {
        throw new OrchestraConstitutionalError(
          "Waived obligation references nonexistent Waiver record",
          "invalid_waiver",
          ["FI-DSN-STD-012-R31", "FI-DSN-STD-012-R32"],
        );
      }
      if (waiver.sourceAttribution === "brain_derived") {
        throw new OrchestraConstitutionalError(
          "Brain-derived waiver cannot authorize waived obligations",
          "invalid_waiver",
          ["FI-DSN-STD-012-R31", "FI-DSN-STD-012-R42"],
        );
      }
    }
  }

  async function assertCurrentProgramInvariant(
    program: ProductionProgram,
    excludeProgramId?: ProductionProgramId,
  ): Promise<void> {
    if (program.currentStatus !== "current") return;

    const siblings = await storage.listProgramsByIntent(program.intentId);
    const currentPrograms = siblings.filter(
      (p) => p.currentStatus === "current" && p.id !== excludeProgramId,
    );

    if (currentPrograms.length === 0) return;

    const splits = await storage.listSplitsByIntent(program.intentId);
    if (splits.length > 0) {
      const splitProgramIds = new Set<string>();
      for (const split of splits) {
        splitProgramIds.add(split.sourceProgramId);
        for (const id of split.resultingProgramIds) {
          splitProgramIds.add(id);
        }
      }
      const allCurrent = [program, ...currentPrograms];
      const allCovered = allCurrent.every((p) => splitProgramIds.has(p.id));
      if (!allCovered) {
        throw new OrchestraConstitutionalError(
          "Multiple current programs require valid governed split authority",
          "invalid_current_program",
          ["FI-DSN-STD-012-R11", "FI-DSN-STD-012-R12"],
        );
      }
      return;
    }

    if (currentPrograms.length >= 1) {
      throw new OrchestraConstitutionalError(
        "Only one current program per intent without governed split",
        "invalid_current_program",
        ["FI-DSN-STD-012-R11", "FI-DSN-STD-012-R12"],
      );
    }
  }

  return {
    async persistIntent(intent) {
      const frozen = rehydrateIntent(intent);
      await storage.putIntent(frozen);
      return frozen;
    },

    async loadIntent(intentId) {
      return storage.getIntent(intentId);
    },

    async persistProgram(program) {
      validatePersistedProgram(program);
      await assertWaiverLinkage(program);
      await assertCurrentProgramInvariant(program, program.id);
      const frozen = rehydrateProgram(program);
      await storage.putProgram(frozen);
      return frozen;
    },

    async loadProgram(programId) {
      return storage.getProgram(programId);
    },

    async listProgramsByIntent(intentId) {
      return storage.listProgramsByIntent(intentId);
    },

    async persistWaiver(waiver) {
      await storage.putWaiver(waiver);
      return waiver;
    },

    async loadWaiver(waiverId) {
      return storage.getWaiver(waiverId);
    },

    async persistException(exception) {
      await storage.putException(exception);
      return exception;
    },

    async persistExplorationDetermination(determination) {
      const program = await storage.getProgram(determination.programId);
      if (!program) {
        throw new OrchestraConstitutionalError(
          "Exploration-Entry Determination requires an existing Production Program",
          "invalid_exploration_entry",
          ["FI-DSN-STD-012-R26"],
        );
      }
      if (determination.programId !== program.id) {
        throw new OrchestraConstitutionalError(
          "Exploration-Entry Determination program relationship invalid",
          "invalid_exploration_entry",
          ["FI-DSN-STD-012-R26"],
        );
      }

      const entry: StoredExplorationEntry = Object.freeze({
        determination,
        status: "active",
        supersededAt: null,
        supersededReason: null,
      });
      await storage.putExplorationEntry(determination.programId, entry);
      return entry;
    },

    async loadExplorationDetermination(programId) {
      return storage.getExplorationEntry(programId);
    },

    async loadActiveExplorationDetermination(programId) {
      const entry = await storage.getExplorationEntry(programId);
      if (!entry || entry.status !== "active") return null;
      return entry.determination;
    },

    async executeProgramSplit(input) {
      const existingSource = await storage.getProgram(input.sourceProgram.id);
      if (!existingSource) {
        throw new OrchestraConstitutionalError(
          "Program Split source program must exist in persistence",
          "invalid_program_split",
          ["FI-DSN-STD-012-R12"],
        );
      }

      const result = executeGovernedProgramSplit(input);

      await storage.putProgramSplit(result.splitRecord);
      await storage.putProgram(rehydrateProgram(result.sourceProgram));
      for (const program of result.resultingPrograms) {
        await assertWaiverLinkage(program);
        await storage.putProgram(rehydrateProgram(program));
      }

      return result;
    },

    async listProgramSplits(intentId) {
      return storage.listSplitsByIntent(intentId);
    },

    async getCurrentPrograms(intentId) {
      const programs = await storage.listProgramsByIntent(intentId);
      return Object.freeze(programs.filter((p) => p.currentStatus === "current"));
    },

    async isConstitutionallyCurrent(program) {
      if (program.currentStatus !== "current") return false;
      const currentPrograms = await this.getCurrentPrograms(program.intentId);
      return currentPrograms.some((p) => p.id === program.id);
    },

    async recordAmendmentWithConsequences(program, input) {
      const amended = recordProgramAmendment(program, {
        materiality: input.materiality,
        reason: input.reason,
        amendedBy: input.amendedBy,
        amendedAt: input.amendedAt,
      });

      if (input.materiality === "material") {
        const existing = await storage.getExplorationEntry(program.id);
        if (existing && existing.status === "active") {
          const superseded: StoredExplorationEntry = Object.freeze({
            determination: existing.determination,
            status: "superseded",
            supersededAt: input.amendedAt ?? new Date().toISOString(),
            supersededReason: `Material Program Amendment: ${input.reason}`,
          });
          await storage.putExplorationEntry(program.id, superseded);
        }
      } else if (!input.nonmaterialEligibilityPreserved) {
        throw new OrchestraConstitutionalError(
          "Nonmaterial Program Amendment requires governed determination that eligibility is preserved",
          "invalid_amendment",
          ["FI-DSN-STD-012-R35"],
        );
      }

      return this.persistProgram(amended);
    },
  };
}
