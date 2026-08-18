import { DEFAULT_PROHIBITED_COMMAND_CLASSES, type OrchestraAssignment } from "../../assignment.js";

export const CODEX_PERMISSION_REFUSALS = [
  "write_scope_not_empty",
  "commit_authorized",
  "push_authorized",
  "no_push_not_required",
  "required_prohibition_missing",
  "unsupported_prohibition",
] as const;

export type CodexPermissionRefusal = (typeof CODEX_PERMISSION_REFUSALS)[number];

export class CodexPermissionProjectionError extends Error {
  constructor(
    readonly code: CodexPermissionRefusal,
    message: string,
  ) {
    super(message);
    this.name = "CodexPermissionProjectionError";
  }
}

export interface CodexReadOnlyPolicy {
  threadSandbox: "read-only";
  turnSandbox: "readOnly";
  approvalPolicy: "never";
}

export function projectCodexReadOnlyPolicy(assignment: OrchestraAssignment): CodexReadOnlyPolicy {
  if (assignment.allowedPaths.length > 0) {
    throw new CodexPermissionProjectionError("write_scope_not_empty", "Codex read-only dispatch requires empty allowedPaths");
  }
  if (assignment.commitAuthorization) {
    throw new CodexPermissionProjectionError("commit_authorized", "Codex read-only dispatch refuses commit authorization");
  }
  if (assignment.pushAuthorization) {
    throw new CodexPermissionProjectionError("push_authorized", "Codex read-only dispatch refuses push authorization");
  }
  if (!assignment.requireNoPush) {
    throw new CodexPermissionProjectionError("no_push_not_required", "Codex read-only dispatch requires requireNoPush=true");
  }
  for (const required of DEFAULT_PROHIBITED_COMMAND_CLASSES) {
    if (!assignment.prohibitedCommandClasses.includes(required)) {
      throw new CodexPermissionProjectionError(
        "required_prohibition_missing",
        `Codex read-only dispatch requires prohibition ${required}`,
      );
    }
  }
  const unsupported = assignment.prohibitedCommandClasses.filter(
    (value) => !(DEFAULT_PROHIBITED_COMMAND_CLASSES as readonly string[]).includes(value),
  );
  if (unsupported.length > 0) {
    throw new CodexPermissionProjectionError(
      "unsupported_prohibition",
      `Codex read-only dispatch cannot exactly project prohibition ${unsupported[0]}`,
    );
  }
  return { threadSandbox: "read-only", turnSandbox: "readOnly", approvalPolicy: "never" };
}
