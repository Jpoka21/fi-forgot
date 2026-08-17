import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
const POLICY_PATH = join(HOOK_DIR, "orchestra-policy.json");
const LOG_PATH = join(HOOK_DIR, "invocations.ndjson");
const FAIL_PATH = join(HOOK_DIR, "parse-fail-preview.txt");

const WRITE_TOOLS = new Set([
  "write",
  "strreplace",
  "delete",
  "editnotebook",
  "applypatch",
  "searchreplace",
  "edit",
]);
const READ_TOOLS = new Set(["read", "grep", "glob", "semsearch", "readdir", "ls"]);
const READONLY_SHELL =
  /\b(get-content|gc\b|type\b|cat\b|get-item|gi\b|test-path|get-filehash|git\s+show|git\s+diff|git\s+log|git\s+status|git\s+rev-parse|git\s+hash-object)\b/i;
const SHELL_WRITE =
  /[>]{1,2}|set-content|add-content|out-file|new-item|set-item|rename-item|move-item|copy-item|remove-item|\bni\b|\bsc\b|\bac\b|\bmv\b|\bcm\b|\brm\b|\bdel\b|\bpython\b|\bnode\b|\becho\b/i;
const STRUCTURED_PATH_KEYS = ["path", "file_path", "filePath", "target_file", "target", "filename", "uri"];

function loadPolicy() {
  try {
    const parsed = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
    return {
      assignmentId: String(parsed.assignmentId ?? ""),
      protectedPaths: Array.isArray(parsed.protectedPaths) ? parsed.protectedPaths.map(String) : [],
      repositoryPath: typeof parsed.repositoryPath === "string" ? parsed.repositoryPath : undefined,
      requireNoPush: parsed.requireNoPush !== false,
      denyDestructiveGit: parsed.denyDestructiveGit !== false,
      denyHookTamper: parsed.denyHookTamper !== false,
    };
  } catch {
    return {
      assignmentId: "",
      protectedPaths: [],
      repositoryPath: undefined,
      requireNoPush: true,
      denyDestructiveGit: true,
      denyHookTamper: true,
      missing: true,
    };
  }
}

function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      out.push(key);
      collectStrings(item, out);
    }
  }
  return out;
}

function normalizePathKey(value) {
  let text = String(value).trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  return text.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathMentionsProtected(candidate, protectedPaths, repositoryPath) {
  const candidateKey = normalizePathKey(candidate);
  if (!candidateKey) return false;
  for (const protectedPath of protectedPaths) {
    const protectedKey = normalizePathKey(protectedPath);
    if (!protectedKey) continue;
    const base = protectedKey.split("/").pop() ?? protectedKey;
    if (candidateKey === protectedKey) return true;
    if (candidateKey.endsWith(`/${protectedKey}`)) return true;
    if (candidateKey.endsWith(`/${base}`)) return true;
    const quoted = new RegExp(`(^|[\\s"'=])${escapeRegExp(base)}(\\b|["'])`, "i");
    if (quoted.test(candidate)) return true;
    if (repositoryPath) {
      const absolute = normalizePathKey(`${String(repositoryPath).replace(/\\/g, "/")}/${protectedKey}`);
      if (candidateKey === absolute || candidateKey.endsWith(absolute)) return true;
    }
  }
  return false;
}

function extractStructuredPaths(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return [];
  const paths = [];
  for (const key of STRUCTURED_PATH_KEYS) {
    const value = toolInput[key];
    if (typeof value === "string" && value.trim()) paths.push(value);
  }
  return paths;
}

function detectProhibitedCommand(command, policy) {
  const text = String(command ?? "");
  if (policy.requireNoPush && /\bgit(\.exe)?\s+push\b/i.test(text)) {
    return { permission: "deny", reason: "git_push_denied", agent_message: "Orchestra policy denied git push." };
  }
  if (policy.denyDestructiveGit) {
    if (/\bgit(\.exe)?\s+push\b/i.test(text) && /(--force|-f)\b/i.test(text)) {
      return { permission: "deny", reason: "force_push_denied", agent_message: "Orchestra policy denied force push." };
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

function decide(payload, policy) {
  if (policy.missing) {
    return {
      permission: "deny",
      reason: "fail_closed_missing_policy",
      agent_message: "Orchestra hook denied the action because policy.json was missing.",
    };
  }
  const eventName = String(payload.hook_event_name || payload.event || "");
  const toolName = String(payload.tool_name || payload.tool || "").toLowerCase();
  const toolInput = payload.tool_input && typeof payload.tool_input === "object" ? payload.tool_input : {};
  const command = String(payload.command || toolInput.command || "");
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

  if (isReadTool) return { permission: "allow", reason: "read_operation_allowed" };

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
    if (structuredPaths.length === 0 && !targetsProtected) {
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
    if (!targetsProtected) return { permission: "allow", reason: "shell_does_not_name_protected" };
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

function decodeStdin(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le");
  }
  if (buffer.length >= 4 && buffer[1] === 0 && buffer[3] === 0) {
    return buffer.toString("utf16le");
  }
  let text = buffer.toString("utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text;
}

function parsePayload(text) {
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("unparseable");
  }
}

function redact(text) {
  return String(text).replace(/api[_-]?key[=:][^\s"]+/gi, "[redacted]");
}

const buffer = await new Promise((resolve, reject) => {
  const chunks = [];
  process.stdin.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  process.stdin.on("end", () => resolve(Buffer.concat(chunks)));
  process.stdin.on("error", reject);
});

const raw = decodeStdin(buffer);
const policy = loadPolicy();
mkdirSync(HOOK_DIR, { recursive: true });

let payload = {};
try {
  payload = parsePayload(raw);
} catch {
  const deny = {
    permission: "deny",
    user_message: "Orchestra hook received invalid JSON and failed closed.",
    agent_message: "Orchestra hook received invalid JSON and denied the action.",
  };
  appendFileSync(
    FAIL_PATH,
    JSON.stringify({
      ts: new Date().toISOString(),
      assignmentId: policy.assignmentId ?? null,
      rawLength: buffer.length,
      hexHead: buffer.subarray(0, 64).toString("hex"),
      preview: redact(raw.slice(0, 300)),
    }) + "\n",
  );
  appendFileSync(
    LOG_PATH,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      assignmentId: policy.assignmentId ?? "",
      providerSessionId: null,
      runId: null,
      toolUseId: null,
      hookEvent: "",
      toolName: "",
      targetPath: null,
      permission: "deny",
      reason: "fail_closed_invalid_json",
    }) + "\n",
  );
  process.stdout.write(JSON.stringify(deny));
  process.exit(0);
}

const decision = decide(payload, policy);
const toolInput = payload.tool_input && typeof payload.tool_input === "object" ? payload.tool_input : {};
const structured = extractStructuredPaths(toolInput);
const record = {
  timestamp: new Date().toISOString(),
  assignmentId: policy.assignmentId ?? "",
  providerSessionId: payload.session_id ?? payload.conversation_id ?? null,
  runId: payload.generation_id ?? null,
  toolUseId: payload.tool_use_id ?? null,
  hookEvent: payload.hook_event_name ?? payload.event ?? "",
  toolName: payload.tool_name ?? payload.tool ?? "",
  targetPath: structured[0] ?? payload.file_path ?? null,
  permission: decision.permission,
  reason: decision.reason,
  command: payload.command ?? toolInput.command ?? null,
};
appendFileSync(LOG_PATH, JSON.stringify(record) + "\n");

const output = { permission: decision.permission };
if (decision.user_message) output.user_message = decision.user_message;
if (decision.agent_message) output.agent_message = decision.agent_message;
process.stdout.write(JSON.stringify(output));
process.exit(0);
