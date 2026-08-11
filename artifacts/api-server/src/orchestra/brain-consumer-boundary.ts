/**
 * Brain consumer boundary for Domain 2 — FI-DSN-STD-013-R51, FI-DSN-GOV-004.
 * Brain may inform inputs; Brain must never exercise constitutional authority.
 */

import { OrchestraConstitutionalError } from "./errors.js";

/** Non-authoritative Brain proposal kinds permitted within Domain 2 scope. */
export type BrainDomain2ProposalKind =
  | "exploration_input"
  | "realization_input"
  | "rva_candidate_metadata";

/**
 * Typed Brain proposal — always non-authoritative per R51.
 */
export interface BrainDomain2Proposal {
  readonly proposalId: string;
  readonly kind: BrainDomain2ProposalKind;
  readonly sourceAttribution: "brain_derived";
  readonly proposedBy: string;
  readonly proposedAt: string;
  readonly contentSummary: string;
  readonly claimsConstitutionalAuthority: false;
}

const FORBIDDEN_BRAIN_ACTIONS = [
  "create_exploration_entry_authorization",
  "grant_waiver",
  "grant_exploration_posture_waiver",
  "record_realization_commitment",
  "establish_rva",
  "promote_rva_exists",
  "supersede_rva",
  "invalidate_rva",
  "determine_review_entry_readiness",
  "grant_gpra",
  "grant_approval",
  "grant_handoff",
  "waive_compliance_boundary",
] as const;

export type ForbiddenBrainDomain2Action = (typeof FORBIDDEN_BRAIN_ACTIONS)[number];

/**
 * Validate a Brain proposal is structurally non-authoritative — R51.
 */
export function validateBrainDomain2Proposal(proposal: BrainDomain2Proposal): void {
  if (proposal.sourceAttribution !== "brain_derived") {
    throw new OrchestraConstitutionalError(
      "Brain Domain 2 proposals must be brain_derived attribution",
      "invalid_brain_domain2_proposal",
      ["FI-DSN-STD-013-R51"],
    );
  }

  if (proposal.claimsConstitutionalAuthority !== false) {
    throw new OrchestraConstitutionalError(
      "Brain proposals must not claim constitutional authority",
      "invalid_brain_domain2_proposal",
      ["FI-DSN-STD-013-R51"],
    );
  }

  const summary = proposal.contentSummary.trim();
  if (!summary) {
    throw new OrchestraConstitutionalError(
      "Brain Domain 2 proposal requires content summary",
      "invalid_brain_domain2_proposal",
      ["FI-DSN-STD-013-R51"],
    );
  }
}

/**
 * Reject any Brain attempt to exercise forbidden constitutional Domain 2 authority — R51.
 */
export function rejectBrainConstitutionalMutationAttempt(
  action: ForbiddenBrainDomain2Action,
): never {
  throw new OrchestraConstitutionalError(
    `Brain Runtime SHALL NOT exercise constitutional Domain 2 authority: ${action}`,
    "invalid_brain_domain2_proposal",
    ["FI-DSN-STD-013-R51"],
  );
}

export function isForbiddenBrainDomain2Action(
  action: string,
): action is ForbiddenBrainDomain2Action {
  return (FORBIDDEN_BRAIN_ACTIONS as readonly string[]).includes(action);
}
