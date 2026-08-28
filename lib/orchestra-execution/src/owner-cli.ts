import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import {
  ACTIVE_EXECUTION_PROVIDER_ID,
  FALLBACK_EXECUTION_PROVIDER_ID,
  authorizePostDecisionExecution,
  executeAuthorizedPostDecisionAction,
  resolveConfiguredExecutionProvider,
} from "./index.js";
import { dispatchInitialGovernedExecutorAssignment } from "./governed-executor-capability.js";
import { loadInitialDispatchAuthorities, validateInitialDispatchAuthority } from "./engineering-store/initial-dispatch-authority.js";
import { FileEngineeringStore } from "./engineering-store/store.js";
import { defaultEngineeringStoreRoot, submitOwnerRequest, validateProjectBinding } from "./owner-submit.js";
import type {
  AssignmentCurrentState,
  PostDecisionActionRecord,
} from "./engineering-store/types.js";

export const OWNER_CLI_EXIT = { ok: 0, refused: 2, usage: 64 } as const;
export const PROTECTED_WRITING_QUALITY_PATHS = [
  "playbook/writing-quality/PILOT_FINDINGS_9A2.md",
  "playbook/writing-quality/README.md",
  "playbook/writing-quality/pilot-9A.2/BLOCKER.md",
] as const;

export interface OwnerCliIo {
  out(value: string): void;
  err(value: string): void;
}

export interface OwnerCliResult {
  exitCode: number;
  payload?: unknown;
}

export const OWNER_CLI_HELP = `Usage: orchestra <command> [options]

Commands:
  status
  submit "OWNER REQUEST"
  dispatch ASSIGNMENT_ID --confirm ASSIGNMENT_ID [--provider codex|cursor]
  authorize ACTION_ID --confirm ACTION_ID
  continue ACTION_ID --authorization AUTHORIZATION_ID [--provider codex|cursor]
  resume
  help

Global options:
  --repository PATH  Repository root (defaults to the current directory)
  --store PATH       Existing external engineering store
  --json             Emit JSON for command results
  -h, --help         Show this help

Owner prose is planning input, not execution authorization. The CLI does not commit or push.`;

interface ParsedArgs {
  command: string | null;
  positionals: string[];
  help: boolean;
  json: boolean;
  storeRoot: string | null;
  repositoryPath: string;
  confirmation: string | null;
  authorizationId: string | null;
  providerId: string | null;
}

interface GitSnapshot {
  repositoryPath: string;
  branch: string | null;
  head: string | null;
  upstream: string | null;
  ahead: number | null;
  behind: number | null;
  changedPaths: string[];
  stagedPaths: string[];
}

function git(repositoryPath: string, args: string[]): string {
  return execFileSync("git", ["-C", repositoryPath, ...args], {
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
}

function inspectGit(repositoryPath: string): GitSnapshot {
  const root = resolve(git(repositoryPath, ["rev-parse", "--show-toplevel"]));
  if (root.toLowerCase() !== resolve(repositoryPath).toLowerCase()) {
    throw new Error(`wrong_repository: launcher root ${resolve(repositoryPath)} is not Git root ${root}`);
  }
  const branch = git(root, ["branch", "--show-current"]) || null;
  const head = git(root, ["rev-parse", "HEAD"]) || null;
  const porcelain = git(root, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const rows = porcelain ? porcelain.split(/\r?\n/) : [];
  const changedPaths = rows.map((row) => row.slice(3).replace(/^.* -> /, ""));
  const stagedPaths = rows.filter((row) => row[0] !== " " && row[0] !== "?").map((row) => row.slice(3).replace(/^.* -> /, ""));
  let upstream: string | null = null;
  let ahead: number | null = null;
  let behind: number | null = null;
  try {
    upstream = git(root, ["rev-parse", "--abbrev-ref", "@{upstream}"]) || null;
    const counts = git(root, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"])
      .split(/\s+/)
      .map(Number);
    ahead = counts[0] ?? null;
    behind = counts[1] ?? null;
  } catch {
    // No upstream is useful status, not authority to mutate Git configuration.
  }
  return { repositoryPath: root, branch, head, upstream, ahead, behind, changedPaths, stagedPaths };
}

function parseArgs(argv: string[], cwd: string): ParsedArgs {
  const valueOptions = new Set(["--store", "--repository", "--confirm", "--authorization", "--provider"]);
  const options = new Map<string, string>();
  const positionals: string[] = [];
  let help = false;
  let json = false;
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;
    if (token === "--help" || token === "-h") {
      if (help) throw new Error(`duplicate option ${token}`);
      help = true;
    } else if (token === "--json") {
      if (json) throw new Error("duplicate option --json");
      json = true;
    } else if (valueOptions.has(token)) {
      if (options.has(token)) throw new Error(`duplicate option ${token}`);
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${token} requires a value`);
      options.set(token, value);
    } else if (token.startsWith("--")) {
      throw new Error(`unknown option ${token}`);
    } else {
      positionals.push(token);
    }
  }
  const repositoryPath = resolve(options.get("--repository") ?? cwd);
  const rawStore = options.get("--store") ?? process.env.ORCHESTRA_ENGINEERING_STORE ?? defaultEngineeringStoreRoot(repositoryPath);
  return {
    command: positionals.shift() ?? null,
    positionals,
    help,
    json,
    storeRoot: rawStore ? resolve(repositoryPath, rawStore) : null,
    repositoryPath,
    confirmation: options.get("--confirm") ?? null,
    authorizationId: options.get("--authorization") ?? null,
    providerId: options.get("--provider") ?? null,
  };
}

function assertExternalStore(repositoryPath: string, storeRoot: string): void {
  const rel = relative(repositoryPath, storeRoot);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
    throw new Error("store_inside_repository: engineering store must remain outside the repository");
  }
  const manifest = join(storeRoot, "STORE.json");
  if (!existsSync(manifest) || !statSync(manifest).isFile()) {
    throw new Error(`store_not_found: no existing Orchestra engineering store at ${storeRoot}`);
  }
  const parsed = JSON.parse(readFileSync(manifest, "utf8")) as Record<string, unknown>;
  if (parsed.recordKind !== "engineering_store" || parsed.schemaVersion !== 1) {
    throw new Error("store_invalid: STORE.json is not a supported Orchestra engineering store");
  }
  if (!existsSync(join(storeRoot, "assignments")) || !existsSync(join(storeRoot, "executions"))) {
    throw new Error("store_invalid: required engineering store directories are missing");
  }
  if (existsSync(join(storeRoot, "PROJECT.json"))) validateProjectBinding(storeRoot, repositoryPath);
}

function openExistingStore(args: ParsedArgs): FileEngineeringStore {
  if (!args.storeRoot) throw new Error("store_required: pass --store PATH or set ORCHESTRA_ENGINEERING_STORE");
  assertExternalStore(args.repositoryPath, args.storeRoot);
  return new FileEngineeringStore(args.storeRoot);
}

function collectStoreStatus(store: FileEngineeringStore): {
  project: string | null;
  latestExecutionState: AssignmentCurrentState | null;
  latestVerificationState: string | null;
  pendingAction: PostDecisionActionRecord | null;
  pendingAuthorization: PostDecisionActionRecord | null;
  pendingContinuation: PostDecisionActionRecord | null;
  pendingSubmission: AssignmentCurrentState | null;
  pendingInitialAuthorization: AssignmentCurrentState | null;
} {
  const states = store.listAssignmentIds().map((id) => store.getCurrentState(id));
  const latestExecutionState = states
    .filter((state) => state.latestEvidence)
    .sort((a, b) => (b.latestEvidence?.recordedAt ?? "").localeCompare(a.latestEvidence?.recordedAt ?? ""))[0] ?? null;
  const allActions = store.listAssignmentIds().flatMap((id) => store.loadPostDecisionActions(id));
  const pending = allActions
    .filter((action) => action.preparedAction !== "REQUIRE_HUMAN_DECISION")
    .sort((a, b) => b.preparedAt.localeCompare(a.preparedAt));
  const pendingAction = pending.find((action) => {
    const auth = store.findValidPostDecisionExecutionAuthorization(action.postDecisionActionId, action.actionHash);
    return !auth;
  }) ?? pending[0] ?? null;
  const pendingAuthorization = pending.find((action) => !store.findValidPostDecisionExecutionAuthorization(action.postDecisionActionId, action.actionHash)) ?? null;
  const pendingContinuation = pending.find((action) => action.preparedAction === "PREPARE_CONTINUATION") ?? null;
  const latestState = latestExecutionState ?? states[0] ?? null;
  const pendingSubmission = states
    .filter((state) => state.status === "frozen" && !state.latestEvidence &&
      !loadInitialDispatchAuthorities(store.storeRoot, state.assignmentId).some(validateInitialDispatchAuthority))
    .sort((a, b) => b.frozen.assignment.createdAt.localeCompare(a.frozen.assignment.createdAt))[0] ?? null;
  const pendingInitialAuthorization = states.find((state) =>
    state.status === "frozen" && !state.latestEvidence &&
    loadInitialDispatchAuthorities(store.storeRoot, state.assignmentId).some(validateInitialDispatchAuthority)
  ) ?? null;
  return {
    project: latestState?.frozen.assignment.projectId ?? null,
    latestExecutionState,
    latestVerificationState: latestState?.verificationPosture ?? null,
    pendingAction,
    pendingAuthorization,
    pendingContinuation,
    pendingSubmission,
    pendingInitialAuthorization,
  };
}

function buildStatus(args: ParsedArgs): unknown {
  const gitState = inspectGit(args.repositoryPath);
  const protectedDirty = PROTECTED_WRITING_QUALITY_PATHS.filter((path) => gitState.changedPaths.includes(path));
  let storeStatus: ReturnType<typeof collectStoreStatus> | null = null;
  let storePosture: "not_configured" | "available" | "unavailable" = "not_configured";
  let storeMessage: string | null = null;
  if (args.storeRoot) {
    try {
      assertExternalStore(args.repositoryPath, args.storeRoot);
      storeStatus = collectStoreStatus(new FileEngineeringStore(args.storeRoot));
      storePosture = "available";
    } catch (error) {
      storePosture = "unavailable";
      storeMessage = error instanceof Error ? error.message : String(error);
    }
  }
  return {
    project: storeStatus?.project ?? "F.I. Forgot",
    repository: gitState.repositoryPath,
    branch: gitState.branch,
    head: gitState.head,
    upstream: gitState.upstream,
    ahead: gitState.ahead,
    behind: gitState.behind,
    workingTree: {
      posture: gitState.changedPaths.length === 0 ? "clean" : "dirty",
      changedPaths: gitState.changedPaths,
      stagedPaths: gitState.stagedPaths,
    },
    protectedDirt: {
      posture: protectedDirty.length === PROTECTED_WRITING_QUALITY_PATHS.length ? "protected_trio_present" : protectedDirty.length ? "partial" : "absent",
      paths: protectedDirty,
    },
    activeExecutionProvider: ACTIVE_EXECUTION_PROVIDER_ID,
    fallbackProvider: FALLBACK_EXECUTION_PROVIDER_ID,
    engineeringStore: { posture: storePosture, path: args.storeRoot, message: storeMessage },
    pendingGovernedAction: storeStatus?.pendingAction?.postDecisionActionId ?? null,
    pendingHumanAuthorization: storeStatus?.pendingAuthorization?.postDecisionActionId ?? null,
    pendingContinuation: storeStatus?.pendingContinuation?.postDecisionActionId ?? null,
    pendingGovernedSubmission: storeStatus?.pendingSubmission?.assignmentId ?? null,
    pendingInitialDispatchAuthorization: storeStatus?.pendingInitialAuthorization?.assignmentId ?? null,
    nextInitialDispatchAction: storeStatus?.pendingSubmission
      ? `orchestra dispatch ${storeStatus.pendingSubmission.assignmentId} --confirm ${storeStatus.pendingSubmission.assignmentId}`
      : null,
    latestExecutionState: storeStatus?.latestExecutionState ? {
      assignmentId: storeStatus.latestExecutionState.assignmentId,
      status: storeStatus.latestExecutionState.status,
      evidenceId: storeStatus.latestExecutionState.latestEvidence?.evidenceId ?? null,
    } : null,
    latestVerificationState: storeStatus?.latestVerificationState ?? null,
  };
}

function printStatus(payload: any, io: OwnerCliIo): void {
  io.out([
    `Project: ${payload.project}`,
    `Repository: ${payload.repository}`,
    `Branch: ${payload.branch ?? "unknown"}`,
    `HEAD: ${payload.head ?? "unknown"}`,
    `Ahead / behind: ${payload.ahead ?? "unknown"} / ${payload.behind ?? "unknown"}`,
    `Working tree: ${payload.workingTree.posture} (${payload.workingTree.changedPaths.length} path(s))`,
    `Protected dirt: ${payload.protectedDirt.posture}`,
    `Active provider: ${payload.activeExecutionProvider}`,
    `Fallback provider: ${payload.fallbackProvider}`,
    `Engineering store: ${payload.engineeringStore.posture}`,
    `Pending governed action: ${payload.pendingGovernedAction ?? "none"}`,
    `Pending human authorization: ${payload.pendingHumanAuthorization ?? "none"}`,
    `Pending continuation: ${payload.pendingContinuation ?? "none"}`,
    `Pending governed submission: ${payload.pendingGovernedSubmission ?? "none"}`,
    `Initial dispatch authorization: ${payload.pendingInitialDispatchAuthorization ?? "none"}`,
    `Next initial action: ${payload.nextInitialDispatchAction ?? "none"}`,
    `Latest execution state: ${payload.latestExecutionState?.status ?? "none"}`,
    `Latest verification state: ${payload.latestVerificationState ?? "none"}`,
  ].join("\n"));
}

function output(payload: unknown, json: boolean, io: OwnerCliIo): void {
  io.out(json ? JSON.stringify(payload) : JSON.stringify(payload, null, 2));
}

export async function runOwnerCli(argv: string[], io: OwnerCliIo, cwd = process.cwd()): Promise<OwnerCliResult> {
  let args: ParsedArgs;
  try {
    args = parseArgs(argv, cwd);
  } catch (error) {
    io.err(`Usage error: ${error instanceof Error ? error.message : String(error)}`);
    return { exitCode: OWNER_CLI_EXIT.usage };
  }
  try {
    if (args.help || args.command === "help") {
      if ((!args.help && args.positionals.length) || args.confirmation || args.authorizationId || args.providerId || args.json) {
        throw new Error("help accepts only --repository and --store");
      }
      io.out(OWNER_CLI_HELP);
      return { exitCode: OWNER_CLI_EXIT.ok };
    }
    if (!args.command) throw new Error("command_required: use help, status, submit, dispatch, authorize, continue, or resume");
    if (args.command === "status") {
      if (args.positionals.length || args.confirmation || args.authorizationId || args.providerId) throw new Error("status accepts only --json, --store, and --repository");
      const payload = buildStatus(args);
      args.json ? output(payload, true, io) : printStatus(payload, io);
      return { exitCode: 0, payload };
    }
    if (args.command === "submit") {
      if (args.confirmation || args.authorizationId || args.providerId) {
        throw new Error("submit accepts only owner text, --json, --store, and --repository");
      }
      if (args.positionals.length !== 1) throw new Error("submit requires exactly one quoted OWNER REQUEST");
      const storeRoot = args.storeRoot ?? defaultEngineeringStoreRoot(args.repositoryPath);
      const payload = submitOwnerRequest({ repository: args.repositoryPath, storeRoot, ownerText: args.positionals[0]!, protectedPaths: PROTECTED_WRITING_QUALITY_PATHS });
      if (args.json) output(payload, true, io);
      else io.out([`Frozen assignment ${payload.duplicate ? "already exists" : "created"}: ${payload.assignmentId}`, `Project: ${payload.project}`, `Scope: ${payload.allowedPaths.join(", ")}`, `Authorized: no`, `Executed: no`, `Commit / push: no / no`, `Next: ${payload.nextSafeOwnerAction}`].join("\n"));
      return { exitCode: 0, payload };
    }
    if (args.command === "authorize") {
      if (args.positionals.length !== 1 || args.authorizationId || args.providerId) throw new Error("authorize requires exactly: authorize ACTION_ID --confirm ACTION_ID");
      const actionId = args.positionals[0]!;
      if (args.confirmation !== actionId) throw new Error("explicit_confirmation_required: --confirm must exactly equal ACTION_ID");
      const store = openExistingStore(args);
      const result = authorizePostDecisionExecution({ store, postDecisionActionId: actionId, humanAuthorized: true });
      output(result, args.json, io);
      return { exitCode: result.authorized ? 0 : OWNER_CLI_EXIT.refused, payload: result };
    }
    if (args.command === "dispatch") {
      if (args.positionals.length !== 1 || args.authorizationId) {
        throw new Error("dispatch requires exactly: dispatch ASSIGNMENT_ID --confirm ASSIGNMENT_ID [--provider codex|cursor]");
      }
      const assignmentId = args.positionals[0]!;
      if (args.confirmation !== assignmentId) {
        throw new Error("explicit_confirmation_required: --confirm must exactly equal ASSIGNMENT_ID");
      }
      if (args.providerId && ![ACTIVE_EXECUTION_PROVIDER_ID, FALLBACK_EXECUTION_PROVIDER_ID].includes(args.providerId as any)) {
        throw new Error("provider must be codex or cursor");
      }
      const store = openExistingStore(args);
      const provider = resolveConfiguredExecutionProvider({ providerId: args.providerId ?? undefined });
      const dispatched = await dispatchInitialGovernedExecutorAssignment({
        store, provider, assignmentId, ownerConfirmation: args.confirmation, projectHooks: true,
      });
      const payload = {
        executed: true,
        assignmentId,
        assignmentHash: dispatched.assignmentRecord.frozen.assignmentHash,
        providerId: provider.providerId,
        evidenceId: dispatched.evidence.evidenceId,
        verification: "pending",
        committed: false,
        pushed: false,
        nextSafeOwnerAction: "Inspect execution evidence and use the governed verifier path; execution is not semantic verification.",
      };
      output(payload, args.json, io);
      return { exitCode: 0, payload };
    }
    if (args.command === "continue") {
      if (args.positionals.length !== 1 || args.confirmation) throw new Error("continue requires exactly: continue ACTION_ID --authorization AUTHORIZATION_ID [--provider codex|cursor]");
      if (!args.authorizationId) throw new Error("authorization_required: pass the exact --authorization AUTHORIZATION_ID");
      if (args.providerId && ![ACTIVE_EXECUTION_PROVIDER_ID, FALLBACK_EXECUTION_PROVIDER_ID].includes(args.providerId as any)) throw new Error("provider must be codex or cursor");
      const store = openExistingStore(args);
      const result = await executeAuthorizedPostDecisionAction({
        store,
        postDecisionActionId: args.positionals[0]!,
        authorizationId: args.authorizationId,
        providerId: args.providerId ?? undefined,
      });
      output(result, args.json, io);
      return { exitCode: result.executed ? 0 : OWNER_CLI_EXIT.refused, payload: result };
    }
    if (args.command === "resume") {
      if (args.positionals.length || args.confirmation || args.authorizationId || args.providerId) throw new Error("resume accepts only --json, --store, and --repository");
      const store = openExistingStore(args);
      const status = buildStatus(args) as any;
      const actionId = status.pendingHumanAuthorization ?? status.pendingGovernedAction;
      let nextSafeOwnerAction = "No governed action is pending.";
      if (status.pendingHumanAuthorization) nextSafeOwnerAction = `Explicit authorization required: orchestra authorize ${actionId} --confirm ${actionId}`;
      else if (actionId) nextSafeOwnerAction = `An authorized governed action is pending. Inspect it, then run orchestra continue ${actionId} with its exact authorization id.`;
      const payload = { resumed: false, executed: false, authorizationManufactured: false, nextSafeOwnerAction, status, storeAssignments: store.listAssignmentIds().length };
      output(payload, args.json, io);
      return { exitCode: 0, payload };
    }
    throw new Error(`unknown_command: ${args.command}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.err(`Refused: ${message}`);
    return { exitCode: message.startsWith("unknown_command") || message.includes("requires exactly") || message.includes("accepts only") || message.startsWith("command_required") ? OWNER_CLI_EXIT.usage : OWNER_CLI_EXIT.refused };
  }
}
