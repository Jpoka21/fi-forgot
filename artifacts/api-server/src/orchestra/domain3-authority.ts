/**
 * Domain 3 compliance-boundary metadata — traceability to frozen FI-DSN-STD-014.
 * FI-DSN-STD-014-R01, R08–R13
 */

/** Primary normative authority for Domain 3 constitutional runtime. */
export const DOMAIN3_GOVERNING_STANDARD = "FI-DSN-STD-014" as const;

/** Volume 06 classification per frozen architecture. */
export const DOMAIN3_DOMAIN_CLASSIFICATION = "CLS-CPR" as const;

/** Architectural domain assignment. */
export const DOMAIN3_ARCHITECTURAL_DOMAIN = "Domain 3" as const;

/** Frozen standard version referenced by this runtime foundation. */
export const DOMAIN3_GOVERNING_STANDARD_VERSION = "1.0" as const;

export type Std014RequirementId = `FI-DSN-STD-014-R${number}`;

/** Traceability metadata linking Domain 3 runtime behavior to frozen authority. */
export interface Domain3GovernanceTraceability {
  readonly governingStandardId: typeof DOMAIN3_GOVERNING_STANDARD;
  readonly governingStandardVersion: typeof DOMAIN3_GOVERNING_STANDARD_VERSION;
  readonly domainClassification: typeof DOMAIN3_DOMAIN_CLASSIFICATION;
  readonly architecturalDomain: typeof DOMAIN3_ARCHITECTURAL_DOMAIN;
  readonly requirementIds: readonly Std014RequirementId[];
}

export function createDomain3GovernanceTraceability(
  requirementIds: readonly Std014RequirementId[],
): Domain3GovernanceTraceability {
  return Object.freeze({
    governingStandardId: DOMAIN3_GOVERNING_STANDARD,
    governingStandardVersion: DOMAIN3_GOVERNING_STANDARD_VERSION,
    domainClassification: DOMAIN3_DOMAIN_CLASSIFICATION,
    architecturalDomain: DOMAIN3_ARCHITECTURAL_DOMAIN,
    requirementIds: Object.freeze([...requirementIds]),
  });
}
