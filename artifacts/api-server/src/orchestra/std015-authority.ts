/**
 * STD-015 compliance-boundary metadata — traceability to frozen FI-DSN-STD-015.
 * HOF-G1 Upstream Entry — FI-DSN-STD-015-R01–R07.
 */

/** Primary normative authority for Governed Handoff (STD-015) runtime. */
export const STD015_GOVERNING_STANDARD = "FI-DSN-STD-015" as const;

/** Volume 06 classification per frozen architecture. */
export const STD015_DOMAIN_CLASSIFICATION = "CLS-CPR" as const;

/**
 * Architectural domain assignment — Domain 3 owns Review→Handoff;
 * STD-015 is the Handoff terminus within Domain 3 Layer B CP-04.
 */
export const STD015_ARCHITECTURAL_DOMAIN = "Domain 3" as const;

/** Frozen standard version referenced by this runtime foundation. */
export const STD015_GOVERNING_STANDARD_VERSION = "1.0" as const;

export type Std015RequirementId = `FI-DSN-STD-015-R${number}`;

/** Traceability metadata linking STD-015 runtime behavior to frozen authority. */
export interface Std015GovernanceTraceability {
  readonly governingStandardId: typeof STD015_GOVERNING_STANDARD;
  readonly governingStandardVersion: typeof STD015_GOVERNING_STANDARD_VERSION;
  readonly domainClassification: typeof STD015_DOMAIN_CLASSIFICATION;
  readonly architecturalDomain: typeof STD015_ARCHITECTURAL_DOMAIN;
  readonly requirementIds: readonly Std015RequirementId[];
}

export function createStd015GovernanceTraceability(
  requirementIds: readonly Std015RequirementId[],
): Std015GovernanceTraceability {
  return Object.freeze({
    governingStandardId: STD015_GOVERNING_STANDARD,
    governingStandardVersion: STD015_GOVERNING_STANDARD_VERSION,
    domainClassification: STD015_DOMAIN_CLASSIFICATION,
    architecturalDomain: STD015_ARCHITECTURAL_DOMAIN,
    requirementIds: Object.freeze([...requirementIds]),
  });
}
