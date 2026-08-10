/**
 * FI-DSN-STD-012 R12 — Governed Program Split.
 *
 * Constitutional model (from frozen authority):
 * 1. One intent MAY yield multiple programs only when scope separation is necessary.
 * 2. Split requires explicit governed recording with auditable evidence.
 * 3. Resulting programs are peer siblings traced to the same intent — not successors.
 * 4. Source program survives the split as one current branch.
 * 5. Multiple programs may be simultaneously current when a valid split exists.
 * 6. Obligations attach to each resulting program independently at split time.
 * 7. Compliance boundaries are copied to new programs as independent bindings.
 * 8. Exploration determinations do NOT transfer — each program requires its own.
 * 9. Amendment, supersession, and invalidation operate per program independently.
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  addObligationToProgram,
  bindComplianceBoundariesToProgram,
  createProductionProgramId,
  draftProductionProgram,
  governProductionProgram,
  type ProductionProgram,
} from "./production-program.js";
import type { DeclaredProductionIntent } from "./production-intent.js";
import type { ProductionProgramId, ProgramSplitRecord } from "./types.js";
import { assertProgramIsActiveAuthority } from "./transitions.js";

const SPLIT_REQUIREMENTS = [
  "FI-DSN-STD-012-R11",
  "FI-DSN-STD-012-R12",
  "FI-DSN-STD-012-R13",
] as const;

export interface ProgramSplitBranchDefinition {
  readonly constitutionalPurpose: string;
  readonly obligationDescriptions: readonly string[];
}

export interface GovernedProgramSplitInput {
  readonly intent: DeclaredProductionIntent;
  readonly sourceProgram: ProductionProgram;
  readonly branches: readonly ProgramSplitBranchDefinition[];
  readonly scopeSeparationReason: string;
  readonly splitAuthority: string;
  readonly splitBy: string;
  readonly splitAt?: string;
}

export interface GovernedProgramSplitResult {
  readonly splitRecord: ProgramSplitRecord;
  readonly sourceProgram: ProductionProgram;
  readonly resultingPrograms: readonly ProductionProgram[];
}

export function executeGovernedProgramSplit(
  input: GovernedProgramSplitInput,
): GovernedProgramSplitResult {
  const { sourceProgram, intent } = input;

  if (sourceProgram.intentId !== intent.id) {
    throw new OrchestraConstitutionalError(
      "Program Split source program must belong to the declared intent",
      "invalid_program_split",
      ["FI-DSN-STD-012-R11", "FI-DSN-STD-012-R12"],
    );
  }

  assertProgramIsActiveAuthority(sourceProgram.posture);

  if (
    sourceProgram.posture !== "program_governed" &&
    sourceProgram.posture !== "program_conditionally_governed" &&
    sourceProgram.posture !== "program_amended"
  ) {
    throw new OrchestraConstitutionalError(
      "Program Split requires a governed source Production Program",
      "invalid_program_split",
      ["FI-DSN-STD-012-R12", "FI-DSN-STD-012-R13"],
    );
  }

  const scopeSeparationReason = input.scopeSeparationReason.trim();
  const splitAuthority = input.splitAuthority.trim();

  if (!scopeSeparationReason) {
    throw new OrchestraConstitutionalError(
      "Program Split requires recorded scope separation rationale",
      "invalid_program_split",
      ["FI-DSN-STD-012-R12", "FI-DSN-STD-012-R37"],
    );
  }

  if (!splitAuthority) {
    throw new OrchestraConstitutionalError(
      "Program Split requires recorded constitutional authority",
      "invalid_program_split",
      ["FI-DSN-STD-012-R12", "FI-DSN-STD-012-R37"],
    );
  }

  if (input.branches.length === 0) {
    throw new OrchestraConstitutionalError(
      "Program Split requires at least one resulting program branch",
      "invalid_program_split",
      ["FI-DSN-STD-012-R12"],
    );
  }

  for (const branch of input.branches) {
    const purpose = branch.constitutionalPurpose.trim();
    if (!purpose) {
      throw new OrchestraConstitutionalError(
        "Each split branch requires a bounded constitutional purpose",
        "invalid_program_split",
        ["FI-DSN-STD-012-R13"],
      );
    }
    if (branch.obligationDescriptions.length === 0) {
      throw new OrchestraConstitutionalError(
        "Each split branch requires at least one Production Obligation",
        "invalid_program_split",
        ["FI-DSN-STD-012-R16"],
      );
    }
  }

  const splitAt = input.splitAt ?? new Date().toISOString();
  const resultingPrograms: ProductionProgram[] = [];
  const resultingProgramIds: ProductionProgramId[] = [];

  for (const branch of input.branches) {
    let program = draftProductionProgram({
      intent,
      constitutionalPurpose: branch.constitutionalPurpose,
      createdBy: input.splitBy,
      createdAt: splitAt,
    });

    for (const description of branch.obligationDescriptions) {
      program = addObligationToProgram(program, {
        description,
        createdBy: input.splitBy,
      });
    }

    program = bindComplianceBoundariesToProgram(
      program,
      [...sourceProgram.complianceBoundaries],
      [...sourceProgram.unresolvedConstraints],
    );

    program = governProductionProgram(program);
    resultingPrograms.push(program);
    resultingProgramIds.push(program.id);
  }

  const splitRecord: ProgramSplitRecord = Object.freeze({
    splitId: `split-${randomUUID()}`,
    intentId: intent.id,
    sourceProgramId: sourceProgram.id,
    resultingProgramIds: Object.freeze([...resultingProgramIds]),
    scopeSeparationReason,
    splitAuthority,
    splitAt,
    splitBy: input.splitBy,
    audit: Object.freeze({
      createdAt: splitAt,
      createdBy: input.splitBy,
      traceability: createGovernanceTraceability([...SPLIT_REQUIREMENTS]),
    }),
  });

  return Object.freeze({
    splitRecord,
    sourceProgram,
    resultingPrograms: Object.freeze([...resultingPrograms]),
  });
}

export function createSuccessorProgramId(): ProductionProgramId {
  return createProductionProgramId();
}
