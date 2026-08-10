/**
 * In-memory Domain 1 storage adapter.
 * Models constitutional persistence semantics — not production durability.
 */

import type { DeclaredProductionIntent } from "../production-intent.js";
import type { ProductionProgram } from "../production-program.js";
import type {
  ProductionIntentId,
  ProductionProgramId,
  ProgramSplitRecord,
} from "../types.js";
import type { ExceptionRecord, WaiverRecord } from "../waiver.js";
import {
  rehydrateException,
  rehydrateIntent,
  rehydrateProgram,
  rehydrateProgramSplit,
  rehydrateStoredExplorationEntry,
  rehydrateWaiver,
  type StoredExplorationEntry,
} from "./rehydration.js";
import type { Domain1StoragePort } from "./storage-port.js";

export function createInMemoryDomain1Storage(): Domain1StoragePort {
  const intents = new Map<string, DeclaredProductionIntent>();
  const programs = new Map<string, ProductionProgram>();
  const programsByIntent = new Map<string, Set<string>>();
  const waivers = new Map<string, WaiverRecord>();
  const exceptions = new Map<string, ExceptionRecord>();
  const explorationEntries = new Map<string, StoredExplorationEntry>();
  const splits = new Map<string, ProgramSplitRecord>();
  const splitsByIntent = new Map<string, Set<string>>();

  function trackProgram(program: ProductionProgram): void {
    const intentPrograms = programsByIntent.get(program.intentId) ?? new Set();
    intentPrograms.add(program.id);
    programsByIntent.set(program.intentId, intentPrograms);
  }

  function trackSplit(split: ProgramSplitRecord): void {
    const intentSplits = splitsByIntent.get(split.intentId) ?? new Set();
    intentSplits.add(split.splitId);
    splitsByIntent.set(split.intentId, intentSplits);
  }

  return {
    async putIntent(intent) {
      const frozen = rehydrateIntent(intent);
      intents.set(intent.id, frozen);
    },

    async getIntent(intentId) {
      const raw = intents.get(intentId);
      return raw ? rehydrateIntent(raw) : null;
    },

    async putProgram(program) {
      const frozen = rehydrateProgram(program);
      programs.set(program.id, frozen);
      trackProgram(frozen);
    },

    async getProgram(programId) {
      const raw = programs.get(programId);
      return raw ? rehydrateProgram(raw) : null;
    },

    async listProgramsByIntent(intentId) {
      const ids = programsByIntent.get(intentId) ?? new Set();
      const result: ProductionProgram[] = [];
      for (const id of ids) {
        const program = programs.get(id);
        if (program) {
          result.push(rehydrateProgram(program));
        }
      }
      return Object.freeze(result);
    },

    async putWaiver(waiver) {
      const frozen = rehydrateWaiver(waiver);
      waivers.set(waiver.waiverId, frozen);
    },

    async getWaiver(waiverId) {
      const raw = waivers.get(waiverId);
      return raw ? rehydrateWaiver(raw) : null;
    },

    async putException(exception) {
      const frozen = rehydrateException(exception);
      exceptions.set(exception.exceptionId, frozen);
    },

    async getException(exceptionId) {
      const raw = exceptions.get(exceptionId);
      return raw ? rehydrateException(raw) : null;
    },

    async putExplorationEntry(programId, entry) {
      const frozen = rehydrateStoredExplorationEntry(entry);
      explorationEntries.set(programId, frozen);
    },

    async getExplorationEntry(programId) {
      const raw = explorationEntries.get(programId);
      return raw ? rehydrateStoredExplorationEntry(raw) : null;
    },

    async putProgramSplit(split) {
      const frozen = rehydrateProgramSplit(split);
      splits.set(split.splitId, frozen);
      trackSplit(frozen);
    },

    async getProgramSplit(splitId) {
      const raw = splits.get(splitId);
      return raw ? rehydrateProgramSplit(raw) : null;
    },

    async listSplitsByIntent(intentId) {
      const ids = splitsByIntent.get(intentId) ?? new Set();
      const result: ProgramSplitRecord[] = [];
      for (const id of ids) {
        const split = splits.get(id);
        if (split) {
          result.push(rehydrateProgramSplit(split));
        }
      }
      return Object.freeze(result);
    },
  };
}
