import { existsSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { OrchestraAssignment } from "../assignment.js";
import type { HookPolicy } from "./policy-decision.js";

const HOOKS_DIR = dirname(fileURLToPath(import.meta.url));
const GUARD_SOURCE = join(HOOKS_DIR, "orchestra-guard.mjs");

export interface ProjectedHookPolicy {
  hooksJsonPath: string;
  guardPath: string;
  policyPath: string;
  invocationsPath: string;
  policy: HookPolicy;
}

export function isForgotIdentifierRepository(repositoryPath: string): boolean {
  return (
    existsSync(join(repositoryPath, "artifacts", "api-server", "src", "orchestra")) &&
    existsSync(join(repositoryPath, "playbook", "design"))
  );
}

export function buildHookPolicy(assignment: OrchestraAssignment): HookPolicy {
  return {
    assignmentId: assignment.assignmentId,
    protectedPaths: [...assignment.protectedPaths],
    repositoryPath: assignment.repositoryPath,
    requireNoPush: assignment.requireNoPush || !assignment.pushAuthorization,
    denyDestructiveGit: assignment.prohibitedCommandClasses.includes("destructive_git"),
    denyHookTamper: assignment.prohibitedCommandClasses.includes("hook_tamper"),
  };
}

/**
 * Project Orchestra protected-path policy into Cursor project hooks.
 * The generated files are provider-specific and not Orchestra authoritative state.
 * Refuses to install hooks into the real F.I. Forgot repository.
 */
export function projectCursorHookPolicy(
  targetRepositoryPath: string,
  assignment: OrchestraAssignment,
): ProjectedHookPolicy {
  if (isForgotIdentifierRepository(targetRepositoryPath)) {
    throw new Error(
      "Refusing to project Cursor hooks into the F.I. Forgot repository. Use a disposable execution fixture.",
    );
  }
  const cursorDir = join(targetRepositoryPath, ".cursor");
  const hooksDir = join(cursorDir, "hooks");
  mkdirSync(hooksDir, { recursive: true });
  const policy = buildHookPolicy({ ...assignment, repositoryPath: targetRepositoryPath });
  const policyPath = join(hooksDir, "orchestra-policy.json");
  const guardPath = join(hooksDir, "orchestra-guard.mjs");
  const invocationsPath = join(hooksDir, "invocations.ndjson");
  const hooksJsonPath = join(cursorDir, "hooks.json");
  writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`, "utf8");
  copyFileSync(GUARD_SOURCE, guardPath);
  writeFileSync(invocationsPath, "", "utf8");
  writeFileSync(
    hooksJsonPath,
    `${JSON.stringify(
      {
        version: 1,
        hooks: {
          preToolUse: [{ command: "node .cursor/hooks/orchestra-guard.mjs", failClosed: true }],
          beforeShellExecution: [
            { command: "node .cursor/hooks/orchestra-guard.mjs", failClosed: true },
          ],
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return { hooksJsonPath, guardPath, policyPath, invocationsPath, policy };
}
