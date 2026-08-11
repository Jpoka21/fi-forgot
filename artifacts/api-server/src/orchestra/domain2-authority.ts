/**
 * Domain 2 compliance-boundary metadata — traceability to frozen FI-DSN-STD-013.
 * FI-DSN-STD-013-R01, R40
 */

/** Primary normative authority for Domain 2 constitutional runtime. */
export const DOMAIN2_GOVERNING_STANDARD = "FI-DSN-STD-013" as const;

/** Volume 06 classification per frozen architecture. */
export const DOMAIN2_DOMAIN_CLASSIFICATION = "CLS-CPR" as const;

/** Architectural domain assignment. */
export const DOMAIN2_ARCHITECTURAL_DOMAIN = "Domain 2" as const;

/** Frozen standard version referenced by this runtime foundation. */
export const DOMAIN2_GOVERNING_STANDARD_VERSION = "1.0" as const;

export type Std013RequirementId = `FI-DSN-STD-013-R${number}`;

/** Traceability metadata linking Domain 2 runtime behavior to frozen authority. */
export interface Domain2GovernanceTraceability {
  readonly governingStandardId: typeof DOMAIN2_GOVERNING_STANDARD;
  readonly governingStandardVersion: typeof DOMAIN2_GOVERNING_STANDARD_VERSION;
  readonly domainClassification: typeof DOMAIN2_DOMAIN_CLASSIFICATION;
  readonly architecturalDomain: typeof DOMAIN2_ARCHITECTURAL_DOMAIN;
  readonly requirementIds: readonly Std013RequirementId[];
}

export function createDomain2GovernanceTraceability(
  requirementIds: readonly Std013RequirementId[],
): Domain2GovernanceTraceability {
  return Object.freeze({
    governingStandardId: DOMAIN2_GOVERNING_STANDARD,
    governingStandardVersion: DOMAIN2_GOVERNING_STANDARD_VERSION,
    domainClassification: DOMAIN2_DOMAIN_CLASSIFICATION,
    architecturalDomain: DOMAIN2_ARCHITECTURAL_DOMAIN,
    requirementIds: Object.freeze([...requirementIds]),
  });
}
