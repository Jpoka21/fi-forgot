import type { GovernanceTraceability } from "./authority.js";

/** Stable identifier for a Declared Production Intent. */
export type ProductionIntentId = string & { readonly __brand: "ProductionIntentId" };

/** Stable identifier for a Production Program. */
export type ProductionProgramId = string & { readonly __brand: "ProductionProgramId" };

/** Stable identifier for a Production Obligation. */
export type ProductionObligationId = string & { readonly __brand: "ProductionObligationId" };

/** Attribution for a governed Domain 1 decision. FI-DSN-STD-012-R37 */
export interface ConstitutionalAttribution {
  readonly actorId: string;
  readonly recordedAt: string;
  readonly basis: string;
}

/** Audit metadata preserved on constitutional objects. FI-DSN-STD-012-R37–R39 */
export interface ConstitutionalAuditMetadata {
  readonly createdAt: string;
  readonly createdBy: string;
  readonly traceability: GovernanceTraceability;
}

/**
 * Production Intent constitutional postures — STD-012 §16.1.
 * Labels describe constitutional postures only.
 */
export type ProductionIntentPosture = "intent_undeclared" | "intent_declared";

/**
 * Production Program constitutional postures — STD-012 §16.2.
 */
export type ProductionProgramPosture =
  | "program_drafted"
  | "program_governed"
  | "program_conditionally_governed"
  | "program_amended"
  | "program_superseded"
  | "program_invalidated";

/**
 * Exploration-entry determination postures — STD-012 §16.3.
 */
export type ExplorationEntryPosture =
  | "exploration_entry_authorized"
  | "exploration_entry_withheld"
  | "conditionally_authorized";

/** Whether a program is the Current Program for forward governance. R41 */
export type CurrentProgramStatus = "current" | "superseded" | "invalidated";

/** Materiality classification for Program Amendment. R34, R35 */
export type ProgramAmendmentMateriality = "material" | "nonmaterial";

/** Obligation enforcement posture. R18 */
export type ObligationEnforcementPosture =
  | "unconditional"
  | "conditional"
  | "waived"
  | "unresolved_constraint";
