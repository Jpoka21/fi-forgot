import type { OrchestraAssignment } from "../assignment.js";
import type { GovernedContinuationTargetRecord } from "./types.js";

export const PREDECESSOR_PATH_AUTHORITY_REFUSALS = [
  "predecessor_not_found",
  "predecessor_role_invalid",
  "project_mismatch",
  "repository_mismatch",
  "branch_mismatch",
  "scope_broadening",
  "protected_path_weakening",
] as const;

export type PredecessorPathAuthorityRefusal =
  (typeof PREDECESSOR_PATH_AUTHORITY_REFUSALS)[number];

export function normalizeAuthorityPath(path: string): string {
  return path.replace(/\\/g, "/");
}

/** True when every candidate path is present in the allowed set (exact path membership). */
export function isSubsetPaths(candidate: string[], allowed: string[]): boolean {
  const set = new Set(allowed.map(normalizeAuthorityPath));
  return candidate.every((p) => set.has(normalizeAuthorityPath(p)));
}

/** True when candidate includes every required path (exact path membership). */
export function includesAllPaths(candidate: string[], required: string[]): boolean {
  const set = new Set(candidate.map(normalizeAuthorityPath));
  return required.every((p) => set.has(normalizeAuthorityPath(p)));
}

/**
 * Recompute predecessor path authority from authoritative predecessor assignment state.
 * Hash coherence alone is never sufficient.
 */
export function evaluatePredecessorPathAuthority(input: {
  target: GovernedContinuationTargetRecord;
  predecessor: OrchestraAssignment | null | undefined;
}): {
  valid: boolean;
  reason: PredecessorPathAuthorityRefusal | null;
} {
  const { target, predecessor } = input;
  if (!predecessor) {
    return { valid: false, reason: "predecessor_not_found" };
  }
  if (predecessor.role !== "executor") {
    return { valid: false, reason: "predecessor_role_invalid" };
  }
  if (target.projectId !== predecessor.projectId) {
    return { valid: false, reason: "project_mismatch" };
  }
  if (target.repositoryPath !== predecessor.repositoryPath) {
    return { valid: false, reason: "repository_mismatch" };
  }
  if (target.branch !== predecessor.branch) {
    return { valid: false, reason: "branch_mismatch" };
  }
  if (!isSubsetPaths(target.allowedPaths, predecessor.allowedPaths)) {
    return { valid: false, reason: "scope_broadening" };
  }
  if (!includesAllPaths(target.protectedPaths, predecessor.protectedPaths)) {
    return { valid: false, reason: "protected_path_weakening" };
  }
  return { valid: true, reason: null };
}
