import type { OrchestraAssignment } from "../../assignment.js";
import type { GitEvidence } from "../../git-evidence.js";
import { normalizePathKey } from "../../hooks/path-normalize.js";

/** Executable refusal token for unqualified Codex workspace-write baseline. */
export const CODEX_WORKSPACE_WRITE_BASELINE_UNAVAILABLE =
  "codex_workspace_write_baseline_unavailable" as const;

function withinAllowedScope(path: string, allowedPaths: string[]): boolean {
  const candidate = normalizePathKey(path).replace(/^\.\//, "");
  return allowedPaths.some((allowedPath) => {
    const allowed = normalizePathKey(allowedPath).replace(/^\.\//, "");
    return candidate === allowed || candidate.startsWith(`${allowed}/`);
  });
}

function withinProtectedScope(path: string, protectedPaths: string[]): boolean {
  const candidate = normalizePathKey(path).replace(/^\.\//, "");
  return protectedPaths.some((protectedPath) => {
    const scope = normalizePathKey(protectedPath).replace(/^\.\//, "");
    return candidate === scope || candidate.startsWith(`${scope}/`);
  });
}

/**
 * Candidate-relevant dirty paths that would make a HEAD-based isolated Codex
 * candidate apply unsafe or fail (the independently verified same-tree P2).
 *
 * Protected-path-only dirt is tolerated so F.I. Forgot's intentional protected
 * trio does not permanently block Codex promotion.
 */
export function findCodexWorkspaceWriteBaselineViolations(
  assignment: OrchestraAssignment,
  evidence: GitEvidence,
): string[] {
  const dirty = new Set<string>([
    ...evidence.stagedPaths,
    ...evidence.unstagedChangedPaths,
    ...evidence.untrackedPaths,
  ]);
  const violations: string[] = [];
  for (const path of dirty) {
    if (withinAllowedScope(path, assignment.allowedPaths)) {
      violations.push(normalizePathKey(path).replace(/^\.\//, ""));
      continue;
    }
    // Dirt outside allowed and outside protected scopes is also candidate-hostile
    // for apply safety only when it is not purely protected unrelated dirt.
    if (!withinProtectedScope(path, assignment.protectedPaths)) {
      // Unrelated untracked/modified files outside assignment scope do not block
      // HEAD-based patches to allowed paths; tolerate them.
      continue;
    }
  }
  return [...new Set(violations)].sort();
}

export function assessCodexWorkspaceWriteBaseline(
  assignment: OrchestraAssignment,
  evidence: GitEvidence,
): { eligible: boolean; violations: string[] } {
  const violations = findCodexWorkspaceWriteBaselineViolations(assignment, evidence);
  return { eligible: violations.length === 0, violations };
}
