/**
 * Orchestra compliance-boundary metadata — traceability to frozen governance.
 * FI-DSN-STD-012-R01, R37
 */

/** Primary normative authority for Domain 1 constitutional runtime. */
export const ORCHESTRA_GOVERNING_STANDARD = "FI-DSN-STD-012" as const;

/** Volume 06 classification per frozen architecture. */
export const ORCHESTRA_DOMAIN_CLASSIFICATION = "CLS-CPR" as const;

/** Architectural domain assignment. */
export const ORCHESTRA_ARCHITECTURAL_DOMAIN = "Domain 1" as const;

/** Frozen standard version referenced by this runtime foundation. */
export const ORCHESTRA_GOVERNING_STANDARD_VERSION = "1.0" as const;

export type Std012RequirementId = `FI-DSN-STD-012-R${number}`;

/** Traceability metadata linking runtime behavior to frozen authority. */
export interface GovernanceTraceability {
  readonly governingStandardId: typeof ORCHESTRA_GOVERNING_STANDARD;
  readonly governingStandardVersion: typeof ORCHESTRA_GOVERNING_STANDARD_VERSION;
  readonly domainClassification: typeof ORCHESTRA_DOMAIN_CLASSIFICATION;
  readonly architecturalDomain: typeof ORCHESTRA_ARCHITECTURAL_DOMAIN;
  readonly requirementIds: readonly Std012RequirementId[];
}

export function createGovernanceTraceability(
  requirementIds: readonly Std012RequirementId[],
): GovernanceTraceability {
  return Object.freeze({
    governingStandardId: ORCHESTRA_GOVERNING_STANDARD,
    governingStandardVersion: ORCHESTRA_GOVERNING_STANDARD_VERSION,
    domainClassification: ORCHESTRA_DOMAIN_CLASSIFICATION,
    architecturalDomain: ORCHESTRA_ARCHITECTURAL_DOMAIN,
    requirementIds: Object.freeze([...requirementIds]),
  });
}
