import { DEFAULT_PROHIBITED_COMMAND_CLASSES, type OrchestraAssignment } from "./assignment.js";

function requiredProhibitedPresent(classes: string[]): boolean {
  return DEFAULT_PROHIBITED_COMMAND_CLASSES.every((item) => classes.includes(item));
}

/**
 * Policy boundary for read-only verifier execution. Governed authorization is
 * enforced separately by dispatchGovernedVerifierAssignment.
 */
export function isReadOnlyVerifierAssignment(assignment: OrchestraAssignment): boolean {
  if (assignment.role !== "verifier") return false;
  if (assignment.allowedPaths.length > 0) return false;
  if (!requiredProhibitedPresent(assignment.prohibitedCommandClasses)) return false;
  if (assignment.commitAuthorization !== false) return false;
  if (assignment.pushAuthorization !== false) return false;
  if (assignment.requireNoPush !== true) return false;
  return true;
}
