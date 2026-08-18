import { isAbsolute } from "node:path";
import { DEFAULT_PROHIBITED_COMMAND_CLASSES, type OrchestraAssignment } from "../../assignment.js";
import { normalizePathKey } from "../../hooks/path-normalize.js";

export const CODEX_EXECUTION_MODES = ["read-only", "governed-workspace-write"] as const;
export type CodexExecutionMode = (typeof CODEX_EXECUTION_MODES)[number];
export const CODEX_PERMISSION_REFUSALS = ["write_scope_not_empty", "write_scope_empty", "invalid_write_scope", "protected_path_overlap", "commit_authorized", "push_authorized", "no_push_not_required", "required_prohibition_missing", "unsupported_prohibition"] as const;
export type CodexPermissionRefusal = (typeof CODEX_PERMISSION_REFUSALS)[number];

export class CodexPermissionProjectionError extends Error {
  constructor(readonly code: CodexPermissionRefusal, message: string) {
    super(message);
    this.name = "CodexPermissionProjectionError";
  }
}

export interface CodexReadOnlyPolicy {
  mode: "read-only";
  threadSandbox: "read-only";
  turnSandboxPolicy: { type: "readOnly"; access: { type: "fullAccess" } };
  approvalPolicy: "never";
}
export interface CodexWorkspaceWritePolicy {
  mode: "governed-workspace-write";
  threadSandbox: "read-only";
  turnSandboxPolicy: { type: "workspaceWrite"; writableRoots: []; networkAccess: false };
  approvalPolicy: "never";
  allowedPaths: string[];
  scopeEnforcement: "orchestra_git_evidence";
}
export type CodexProjectedPolicy = CodexReadOnlyPolicy | CodexWorkspaceWritePolicy;

function validateCommonPolicy(assignment: OrchestraAssignment, label: string): void {
  if (assignment.commitAuthorization) throw new CodexPermissionProjectionError("commit_authorized", `${label} refuses commit authorization`);
  if (assignment.pushAuthorization) throw new CodexPermissionProjectionError("push_authorized", `${label} refuses push authorization`);
  if (!assignment.requireNoPush) throw new CodexPermissionProjectionError("no_push_not_required", `${label} requires requireNoPush=true`);
  for (const required of DEFAULT_PROHIBITED_COMMAND_CLASSES) {
    if (!assignment.prohibitedCommandClasses.includes(required)) throw new CodexPermissionProjectionError("required_prohibition_missing", `${label} requires prohibition ${required}`);
  }
  const unsupported = assignment.prohibitedCommandClasses.find((value) => !(DEFAULT_PROHIBITED_COMMAND_CLASSES as readonly string[]).includes(value));
  if (unsupported) throw new CodexPermissionProjectionError("unsupported_prohibition", `${label} cannot exactly project prohibition ${unsupported}`);
}

function isContainedPath(parent: string, child: string): boolean {
  return child === parent || child.startsWith(`${parent}/`);
}
function normalizedRelativePath(path: string): string {
  const key = normalizePathKey(path).replace(/^\.\//, "");
  if (!key || isAbsolute(path) || key === ".." || key.startsWith("../") || key.includes("/../")) {
    throw new CodexPermissionProjectionError("invalid_write_scope", `Codex write scope must be repository-relative: ${path}`);
  }
  return key;
}

export function projectCodexReadOnlyPolicy(assignment: OrchestraAssignment): CodexReadOnlyPolicy {
  if (assignment.allowedPaths.length > 0) throw new CodexPermissionProjectionError("write_scope_not_empty", "Codex read-only dispatch requires empty allowedPaths");
  validateCommonPolicy(assignment, "Codex read-only dispatch");
  return { mode: "read-only", threadSandbox: "read-only", turnSandboxPolicy: { type: "readOnly", access: { type: "fullAccess" } }, approvalPolicy: "never" };
}

export function projectCodexWorkspaceWritePolicy(assignment: OrchestraAssignment): CodexWorkspaceWritePolicy {
  if (assignment.allowedPaths.length === 0) throw new CodexPermissionProjectionError("write_scope_empty", "Codex workspace-write dispatch requires non-empty allowedPaths");
  validateCommonPolicy(assignment, "Codex workspace-write dispatch");
  const allowedPaths = assignment.allowedPaths.map(normalizedRelativePath).sort();
  const protectedPaths = assignment.protectedPaths.map(normalizedRelativePath);
  for (const allowed of allowedPaths) for (const protectedPath of protectedPaths) {
    if (isContainedPath(allowed, protectedPath) || isContainedPath(protectedPath, allowed)) {
      throw new CodexPermissionProjectionError("protected_path_overlap", `Codex workspace-write scope overlaps protected path: ${allowed} <> ${protectedPath}`);
    }
  }
  return { mode: "governed-workspace-write", threadSandbox: "read-only", turnSandboxPolicy: { type: "workspaceWrite", writableRoots: [], networkAccess: false }, approvalPolicy: "never", allowedPaths, scopeEnforcement: "orchestra_git_evidence" };
}

export function projectCodexPolicy(assignment: OrchestraAssignment, mode: CodexExecutionMode): CodexProjectedPolicy {
  return mode === "read-only" ? projectCodexReadOnlyPolicy(assignment) : projectCodexWorkspaceWritePolicy(assignment);
}
