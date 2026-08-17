import { createHash } from "node:crypto";
import {
  canonicalizeAssignment,
  deepFreeze,
  normalizeAssignment,
  type AssignmentInput,
  type FrozenAssignment,
  type OrchestraAssignment,
} from "./assignment.js";

export function hashCanonicalJson(canonicalJson: string): string {
  return createHash("sha256").update(canonicalJson, "utf8").digest("hex");
}

export function hashAssignment(assignment: OrchestraAssignment): string {
  return hashCanonicalJson(canonicalizeAssignment(assignment));
}

/**
 * Create an immutable Orchestra assignment with a deterministic identity hash.
 * The provider may copy fields for transport, but it cannot change this hash.
 */
export function createAssignment(input: AssignmentInput): FrozenAssignment {
  const assignment = deepFreeze(normalizeAssignment(input));
  const canonicalJson = canonicalizeAssignment(assignment);
  const assignmentHash = hashCanonicalJson(canonicalJson);
  return deepFreeze({
    assignment,
    assignmentHash,
    canonicalJson,
  });
}

export function assertAssignmentUnchanged(
  frozen: FrozenAssignment,
  candidate: OrchestraAssignment,
): void {
  const candidateHash = hashAssignment(candidate);
  if (candidateHash !== frozen.assignmentHash) {
    throw new Error(
      `assignment mutation detected: expected hash ${frozen.assignmentHash}, received ${candidateHash}`,
    );
  }
}
