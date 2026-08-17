import {
  collectStrings,
  extractStructuredPaths,
  pathMentionsProtected,
  structuredPathMissing,
} from "./path-normalize.js";

export const WRITE_TOOLS = new Set([
  "write",
  "strreplace",
  "delete",
  "editnotebook",
  "applypatch",
  "searchreplace",
  "edit",
]);

export const READ_TOOLS = new Set(["read", "grep", "glob", "semsearch", "readdir", "ls"]);

const READONLY_SHELL =
  /\b(get-content|gc\b|type\b|cat\b|get-item|gi\b|test-path|get-filehash|git\s+show|git\s+diff|git\s+log|git\s+status|git\s+rev-parse|git\s+hash-object)\b/i;

const SHELL_WRITE =
  /[>]{1,2}|set-content|add-content|out-file|new-item|set-item|rename-item|move-item|copy-item|remove-item|\bni\b|\bsc\b|\bac\b|\bmv\b|\bcm\b|\brm\b|\bdel\b|\bpython\b|\bnode\b|\becho\b/i;

export interface HookPolicy {
  assignmentId: string;
  protectedPaths: string[];
  repositoryPath?: string;
  requireNoPush: boolean;
  denyDestructiveGit: boolean;
  denyHookTamper: boolean;
}

export interface PolicyDecision {
  permission: "allow" | "deny";
  reason: string;
  agent_message?: string;
  user_message?: string;
}

export interface HookDecisionRecord {
  timestamp: string;
  assignmentId: string;
  providerSessionId: string | null;
  runId: string | null;
  toolUseId: string | null;
  hookEvent: string;
  toolName: string;
  targetPath: string | null;
  permission: "allow" | "deny";
  reason: string;
}

export function detectProhibitedCommand(
  command: string,
  policy: HookPolicy,
): PolicyDecision | null {
  const text = command;
  if (policy.requireNoPush && /\bgit(\.exe)?\s+push\b/i.test(text)) {
    return {
      permission: "deny",
      reason: "git_push_denied",
      agent_message: "Orchestra policy denied git push.",
    };
  }
  if (policy.denyDestructiveGit) {
    if (
      /\bgit(\.exe)?\s+push\b/i.test(text) &&
      /(--force|-f)\b/i.test(text)
    ) {
      return {
        permission: "deny",
        reason: "force_push_denied",
        agent_message: "Orchestra policy denied force push.",
      };
    }
    if (
      /\bgit(\.exe)?\s+reset\s+--hard\b/i.test(text) ||
      /\bgit(\.exe)?\s+clean\b/i.test(text) ||
      /\bgit(\.exe)?\s+rebase\b/i.test(text) ||
      /\bgit(\.exe)?\s+filter-branch\b/i.test(text) ||
      /\bgit(\.exe)?\s+update-ref\b/i.test(text)
    ) {
      return {
        permission: "deny",
        reason: "destructive_git_denied",
        agent_message: "Orchestra policy denied a destructive Git command.",
      };
    }
  }
  if (
    policy.denyHookTamper &&
    /(\.cursor[\\/]+hooks|hooks\.json|orchestra-guard\.mjs|orchestra-policy\.json)/i.test(text) &&
    SHELL_WRITE.test(text)
  ) {
    return {
      permission: "deny",
      reason: "hook_tamper_denied",
      agent_message: "Orchestra policy denied modification of projected Cursor hooks.",
    };
  }
  return null;
}

export function decideHookPolicy(
  payload: Record<string, unknown>,
  policy: HookPolicy,
): PolicyDecision {
  const eventName = String(payload.hook_event_name ?? payload.event ?? "");
  const toolName = String(payload.tool_name ?? payload.tool ?? "").toLowerCase();
  const toolInput =
    payload.tool_input && typeof payload.tool_input === "object"
      ? (payload.tool_input as Record<string, unknown>)
      : {};
  const command = String(payload.command ?? toolInput.command ?? "");
  const strings = collectStrings({ ...payload, tool_input: toolInput, command });
  const targetsProtected = strings.some((value) =>
    pathMentionsProtected(value, policy.protectedPaths, policy.repositoryPath),
  );
  const structuredPaths = extractStructuredPaths(toolInput);
  const structuredProtected = structuredPaths.some((value) =>
    pathMentionsProtected(value, policy.protectedPaths, policy.repositoryPath),
  );
  const isShell = eventName === "beforeShellExecution" || toolName === "shell";
  const isWriteTool = WRITE_TOOLS.has(toolName);
  const isReadTool = READ_TOOLS.has(toolName) || eventName === "beforeReadFile";

  if (isReadTool) {
    return { permission: "allow", reason: "read_operation_allowed" };
  }

  const prohibited = detectProhibitedCommand(command, policy);
  if (prohibited) return prohibited;

  if (isWriteTool) {
    const hookTarget = structuredPaths.some((value) =>
      /(\.cursor[\\/]+hooks|hooks\.json|orchestra-guard\.mjs|orchestra-policy\.json)/i.test(value),
    );
    if (policy.denyHookTamper && hookTarget) {
      return {
        permission: "deny",
        reason: "hook_tamper_denied",
        agent_message: "Orchestra policy denied modification of projected Cursor hooks.",
      };
    }
    if (structuredPathMissing(toolInput) && !targetsProtected) {
      return {
        permission: "deny",
        reason: "fail_closed_unparseable_write_path",
        agent_message: "Orchestra hook denied an unparseable write because it might target a protected path.",
      };
    }
    if (targetsProtected || structuredProtected) {
      return {
        permission: "deny",
        reason: "protected_path_write_denied",
        agent_message: "Orchestra hook denied modification of a protected path.",
      };
    }
    return { permission: "allow", reason: "write_not_protected" };
  }

  if (isShell) {
    if (!targetsProtected) {
      return { permission: "allow", reason: "shell_does_not_name_protected" };
    }
    if (READONLY_SHELL.test(command) && !SHELL_WRITE.test(command)) {
      return { permission: "allow", reason: "shell_read_of_protected_allowed" };
    }
    return {
      permission: "deny",
      reason: "protected_path_shell_denied",
      agent_message: "Orchestra hook denied a shell command that would modify a protected path.",
    };
  }

  if (targetsProtected && !isReadTool) {
    return {
      permission: "deny",
      reason: "fail_closed_ambiguous_protected_operation",
      agent_message: "Orchestra hook denied an ambiguous operation naming a protected path.",
    };
  }

  return { permission: "allow", reason: "not_protected_operation" };
}

export function toHookDecisionRecord(
  payload: Record<string, unknown>,
  decision: PolicyDecision,
  policy: HookPolicy,
  extras?: { runId?: string | null },
): HookDecisionRecord {
  const toolInput =
    payload.tool_input && typeof payload.tool_input === "object"
      ? (payload.tool_input as Record<string, unknown>)
      : {};
  const structured = extractStructuredPaths(toolInput);
  return {
    timestamp: new Date().toISOString(),
    assignmentId: policy.assignmentId,
    providerSessionId:
      typeof payload.session_id === "string"
        ? payload.session_id
        : typeof payload.conversation_id === "string"
          ? payload.conversation_id
          : null,
    runId: extras?.runId ?? (typeof payload.generation_id === "string" ? payload.generation_id : null),
    toolUseId: typeof payload.tool_use_id === "string" ? payload.tool_use_id : null,
    hookEvent: String(payload.hook_event_name ?? payload.event ?? ""),
    toolName: String(payload.tool_name ?? payload.tool ?? ""),
    targetPath: structured[0] ?? (typeof payload.file_path === "string" ? payload.file_path : null),
    permission: decision.permission,
    reason: decision.reason,
  };
}
