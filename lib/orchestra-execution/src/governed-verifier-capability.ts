const CAPABILITY_BRAND = Symbol("GovernedVerifierExecutionCapability");

/**
 * Ephemeral, process-local execution capability established only after
 * dispatchGovernedVerifierAssignment proves governed authorization and eligibility.
 * Not serializable authority. Not derivable from assignment shape alone.
 */
export interface GovernedVerifierExecutionCapability {
  readonly [CAPABILITY_BRAND]: true;
  readonly assignmentId: string;
  readonly assignmentHash: string;
}

export function createGovernedVerifierExecutionCapability(
  assignmentId: string,
  assignmentHash: string,
): GovernedVerifierExecutionCapability {
  return Object.freeze({
    [CAPABILITY_BRAND]: true as const,
    assignmentId,
    assignmentHash,
  });
}

export function isGovernedVerifierExecutionCapability(
  value: unknown,
  assignmentId: string,
  assignmentHash: string,
): value is GovernedVerifierExecutionCapability {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as GovernedVerifierExecutionCapability;
  if (candidate[CAPABILITY_BRAND] !== true) {
    return false;
  }
  return candidate.assignmentId === assignmentId && candidate.assignmentHash === assignmentHash;
}
