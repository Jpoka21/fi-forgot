import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { WaiverSourceAttribution } from "./types.js";

const WAIVER_REQUIREMENTS = [
  "FI-DSN-STD-012-R31",
  "FI-DSN-STD-012-R32",
  "FI-DSN-STD-012-R33",
] as const;

/** Constitutionally authorized authority class — R31. */
export type WaiverAuthorityClass =
  | "domain_1_governance_authority"
  | "compliance_boundary_waiver_authority";

/**
 * Governed Waiver — R31.
 * Brain Runtime SHALL NOT grant or substitute for a Waiver.
 */
export interface WaiverRecord {
  readonly waiverId: string;
  readonly waiverAuthority: WaiverAuthorityClass;
  readonly scope: string;
  readonly affectedTarget: string;
  readonly constitutionalBasis: string;
  readonly applicabilityPosture: string;
  readonly downstreamEligibilityEffect: string;
  readonly grantedAt: string;
  readonly grantedBy: string;
  readonly sourceAttribution: WaiverSourceAttribution;
}

/**
 * Documented Exception — distinct from Waiver — R32.
 */
export interface ExceptionRecord {
  readonly exceptionId: string;
  readonly description: string;
  readonly constitutionalBasis: string;
  readonly recordedAt: string;
  readonly recordedBy: string;
}

export function grantWaiver(input: {
  waiverAuthority: WaiverAuthorityClass;
  scope: string;
  affectedTarget: string;
  constitutionalBasis: string;
  applicabilityPosture: string;
  downstreamEligibilityEffect: string;
  grantedBy: string;
  grantedAt?: string;
  /** Must be false for Brain-derived sources — R31, R42 */
  isBrainDerived?: boolean;
  sourceAttribution?: WaiverSourceAttribution;
}): WaiverRecord {
  if (input.isBrainDerived || input.sourceAttribution === "brain_derived") {
    throw new OrchestraConstitutionalError(
      "Brain Runtime SHALL NOT grant or substitute for a Waiver",
      "invalid_waiver",
      ["FI-DSN-STD-012-R31", "FI-DSN-STD-012-R42"],
    );
  }

  const scope = input.scope.trim();
  const constitutionalBasis = input.constitutionalBasis.trim();

  if (!scope || !constitutionalBasis) {
    throw new OrchestraConstitutionalError(
      "Waiver requires express recorded scope and constitutional authority basis",
      "invalid_waiver",
      ["FI-DSN-STD-012-R31"],
    );
  }

  return Object.freeze({
    waiverId: `waiver-${randomUUID()}`,
    waiverAuthority: input.waiverAuthority,
    scope,
    affectedTarget: input.affectedTarget,
    constitutionalBasis,
    applicabilityPosture: input.applicabilityPosture,
    downstreamEligibilityEffect: input.downstreamEligibilityEffect,
    grantedAt: input.grantedAt ?? new Date().toISOString(),
    grantedBy: input.grantedBy,
    sourceAttribution: "governance_authority",
  });
}

export function recordException(input: {
  description: string;
  constitutionalBasis: string;
  recordedBy: string;
  recordedAt?: string;
}): ExceptionRecord {
  const description = input.description.trim();
  const constitutionalBasis = input.constitutionalBasis.trim();

  if (!description || !constitutionalBasis) {
    throw new OrchestraConstitutionalError(
      "Exception requires documented description and constitutional basis",
      "invalid_waiver",
      ["FI-DSN-STD-012-R32"],
    );
  }

  return Object.freeze({
    exceptionId: `exception-${randomUUID()}`,
    description,
    constitutionalBasis,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    recordedBy: input.recordedBy,
  });
}

/** R32 — an Exception does not automatically constitute a Waiver. */
export function exceptionIsNotWaiver(
  exception: ExceptionRecord,
): { isWaiver: false; exception: ExceptionRecord } {
  return { isWaiver: false, exception };
}

export const WAIVER_TRACEABILITY = createGovernanceTraceability([
  ...WAIVER_REQUIREMENTS,
]);
