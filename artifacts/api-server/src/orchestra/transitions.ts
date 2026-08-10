import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionIntentPosture, ProductionProgramPosture } from "./types.js";

/**
 * Permissible Production Intent posture transitions — STD-012 §16.1.
 */
const INTENT_TRANSITIONS: Readonly<Record<ProductionIntentPosture, readonly ProductionIntentPosture[]>> = {
  intent_undeclared: ["intent_declared"],
  intent_declared: [],
};

/**
 * Permissible Production Program posture transitions — STD-012 §16.4.
 */
const PROGRAM_TRANSITIONS: Readonly<Record<ProductionProgramPosture, readonly ProductionProgramPosture[]>> = {
  program_drafted: ["program_governed", "program_conditionally_governed", "program_invalidated"],
  program_governed: [
    "program_amended",
    "program_superseded",
    "program_invalidated",
    "program_conditionally_governed",
  ],
  program_conditionally_governed: [
    "program_amended",
    "program_superseded",
    "program_invalidated",
    "program_governed",
  ],
  program_amended: [
    "program_governed",
    "program_conditionally_governed",
    "program_superseded",
    "program_invalidated",
  ],
  program_superseded: [],
  program_invalidated: [],
};

export function assertIntentPostureTransition(
  from: ProductionIntentPosture,
  to: ProductionIntentPosture,
): void {
  const allowed = INTENT_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new OrchestraConstitutionalError(
      `Invalid intent posture transition: ${from} → ${to}`,
      "invalid_program_transition",
      ["FI-DSN-STD-012-R07"],
    );
  }
}

export function assertProgramPostureTransition(
  from: ProductionProgramPosture,
  to: ProductionProgramPosture,
): void {
  const allowed = PROGRAM_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new OrchestraConstitutionalError(
      `Invalid program posture transition: ${from} → ${to}`,
      "invalid_program_transition",
      ["FI-DSN-STD-012-R34", "FI-DSN-STD-012-R36"],
    );
  }
}

export function isTerminalProgramPosture(posture: ProductionProgramPosture): boolean {
  return posture === "program_superseded" || posture === "program_invalidated";
}

export function isActiveProgramPosture(posture: ProductionProgramPosture): boolean {
  return !isTerminalProgramPosture(posture);
}

/** R41 — superseded and invalidated programs are not active constitutional authorities. */
export function assertProgramIsActiveAuthority(posture: ProductionProgramPosture): void {
  if (isTerminalProgramPosture(posture)) {
    throw new OrchestraConstitutionalError(
      "Program Superseded and Program Invalidated programs are not active constitutional authorities",
      "program_not_active",
      ["FI-DSN-STD-012-R36", "FI-DSN-STD-012-R41"],
    );
  }
}

export { INTENT_TRANSITIONS, PROGRAM_TRANSITIONS };
