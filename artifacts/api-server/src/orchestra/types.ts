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

/** Terminal lifecycle transition provenance — separate from creation audit. R37, R38 */
export interface ProgramTerminalTransition {
  readonly kind: "superseded" | "invalidated";
  readonly transitionedAt: string;
  readonly transitionedBy: string;
  readonly reason?: string;
  readonly successorProgramId?: ProductionProgramId;
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

/** Separate resolution provenance — distinct from creation audit. R37, R38 */
export interface ObligationResolutionRecord {
  readonly resolution: string;
  readonly resolvedAt: string;
  readonly resolvedBy: string;
}

/** Waiver source attribution — prevents Brain authority spoofing. R31, R42 */
export type WaiverSourceAttribution = "governance_authority" | "brain_derived";

/** Opaque marker set only by grantWaiver — prevents forged waiver persistence. R31 */
export type GovernanceWaiverGrantMarker = string & {
  readonly __brand: "GovernanceWaiverGrantMarker";
};

/** Status of a persisted exploration determination. R30, R34 */
export type ExplorationDeterminationStatus = "active" | "superseded";

/**
 * Governed Program Split record — auditable evidence per R12.
 * Records scope separation when one intent yields multiple programs.
 */
export interface ProgramSplitRecord {
  readonly splitId: string;
  readonly intentId: ProductionIntentId;
  readonly sourceProgramId: ProductionProgramId;
  readonly resultingProgramIds: readonly ProductionProgramId[];
  readonly scopeSeparationReason: string;
  readonly splitAuthority: string;
  readonly splitAt: string;
  readonly splitBy: string;
  readonly audit: ConstitutionalAuditMetadata;
}
