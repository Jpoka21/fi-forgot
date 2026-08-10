/**
 * Low-level storage port for Domain 1 constitutional aggregates.
 * Avoids generic patch/update/delete operations.
 */

import type { ExplorationEntryDetermination } from "../exploration-entry.js";
import type { DeclaredProductionIntent } from "../production-intent.js";
import type { ProductionProgram } from "../production-program.js";
import type {
  ProductionIntentId,
  ProductionProgramId,
  ProgramSplitRecord,
} from "../types.js";
import type { ExceptionRecord, WaiverRecord } from "../waiver.js";
import type { StoredExplorationEntry } from "./rehydration.js";

export interface Domain1StoragePort {
  putIntent(intent: DeclaredProductionIntent): Promise<void>;
  getIntent(intentId: ProductionIntentId): Promise<DeclaredProductionIntent | null>;

  putProgram(program: ProductionProgram): Promise<void>;
  getProgram(programId: ProductionProgramId): Promise<ProductionProgram | null>;
  listProgramsByIntent(intentId: ProductionIntentId): Promise<readonly ProductionProgram[]>;

  putWaiver(waiver: WaiverRecord): Promise<void>;
  getWaiver(waiverId: string): Promise<WaiverRecord | null>;

  putException(exception: ExceptionRecord): Promise<void>;
  getException(exceptionId: string): Promise<ExceptionRecord | null>;

  putExplorationEntry(
    programId: ProductionProgramId,
    entry: StoredExplorationEntry,
  ): Promise<void>;
  getExplorationEntry(programId: ProductionProgramId): Promise<StoredExplorationEntry | null>;

  putProgramSplit(split: ProgramSplitRecord): Promise<void>;
  getProgramSplit(splitId: string): Promise<ProgramSplitRecord | null>;
  listSplitsByIntent(intentId: ProductionIntentId): Promise<readonly ProgramSplitRecord[]>;
}

export type { StoredExplorationEntry };

/** Raw persisted exploration shape for storage adapters. */
export interface RawExplorationStorage {
  readonly determination: ExplorationEntryDetermination;
  readonly status: StoredExplorationEntry["status"];
  readonly supersededAt: string | null;
  readonly supersededReason: string | null;
}
