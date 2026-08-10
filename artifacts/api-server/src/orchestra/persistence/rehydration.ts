/**
 * Safe rehydration — validate, reconstruct, and freeze persisted state.
 */

import type { ExplorationEntryDetermination } from "../exploration-entry.js";
import type { DeclaredProductionIntent } from "../production-intent.js";
import type { ProductionProgram } from "../production-program.js";
import type { ExplorationDeterminationStatus, ProgramSplitRecord } from "../types.js";
import type { ExceptionRecord, WaiverRecord } from "../waiver.js";
import {
  validateExplorationDeterminationStatus,
  validatePersistedException,
  validatePersistedExplorationDetermination,
  validatePersistedIntent,
  validatePersistedProgram,
  validatePersistedProgramSplit,
  validatePersistedWaiver,
} from "./validation.js";

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item);
    }
    return Object.freeze(value);
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    deepFreeze(record[key]);
  }
  return Object.freeze(value);
}

export function rehydrateIntent(raw: unknown): DeclaredProductionIntent {
  validatePersistedIntent(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateProgram(raw: unknown): ProductionProgram {
  validatePersistedProgram(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateWaiver(raw: unknown): WaiverRecord {
  validatePersistedWaiver(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateException(raw: unknown): ExceptionRecord {
  validatePersistedException(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateExplorationDetermination(
  raw: unknown,
): ExplorationEntryDetermination {
  validatePersistedExplorationDetermination(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateProgramSplit(raw: unknown): ProgramSplitRecord {
  validatePersistedProgramSplit(raw);
  return deepFreeze(structuredClone(raw));
}

export interface StoredExplorationEntry {
  readonly determination: ExplorationEntryDetermination;
  readonly status: ExplorationDeterminationStatus;
  readonly supersededAt: string | null;
  readonly supersededReason: string | null;
}

export function rehydrateStoredExplorationEntry(raw: unknown): StoredExplorationEntry {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid stored exploration entry");
  }
  const record = raw as Record<string, unknown>;
  validateExplorationDeterminationStatus(record.status);
  const determination = rehydrateExplorationDetermination(record.determination);
  return deepFreeze({
    determination,
    status: record.status,
    supersededAt: typeof record.supersededAt === "string" ? record.supersededAt : null,
    supersededReason:
      typeof record.supersededReason === "string" ? record.supersededReason : null,
  });
}
