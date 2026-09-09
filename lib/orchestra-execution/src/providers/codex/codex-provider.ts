import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FrozenAssignment } from "../../assignment.js";
import type { FrozenVerifierCommandRequirement } from "../../verification-requirements.js";
import { assertAssignmentUnchanged } from "../../assignment-hash.js";
import type { NormalizedExecutionEvent } from "../../events.js";
import {
  CODEX_PROVIDER_ID,
  renderAssignmentPrompt,
  type CreateSessionTarget,
  type ExecutionProvider,
  type ProviderRun,
  type ProviderSession,
  type ProviderSessionIdentity,
  type ProviderTerminalReport,
} from "../../provider-contract.js";
import {
  StdioCodexAppServerTransport,
  redactCodexText,
  type AppServerNotification,
  type CodexAppServerTransport,
} from "./app-server-transport.js";
import {
  asRecord,
  codexNotificationTurnId,
  normalizeCodexEvent,
} from "./normalize-events.js";
import { projectCodexPolicy, type CodexExecutionMode } from "./permission-projection.js";

interface InternalSession {
  session: ProviderSession;
  target: CreateSessionTarget;
}

interface InternalRun {
  run: ProviderRun;
  events: NormalizedExecutionEvent[];
  waiters: Array<() => void>;
  terminal: ProviderTerminalReport | null;
  finalResponse: string | null;
  startedAt: number;
  commandRequirements: FrozenVerifierCommandRequirement[];
  commandRequirementById: Map<string, CommandRequirementBinding>;
  usedCommandRequirementIds: Set<string>;
  completedCommandIds: Set<string>;
}

interface CommandRequirementBinding {
  requirement: FrozenVerifierCommandRequirement;
  commandKey: string;
  workingDirectory: string;
}

interface ThreadResponse {
  thread: { id: string };
}

interface TurnResponse {
  turn: { id: string };
}

export interface CodexProviderOptions {
  transport?: CodexAppServerTransport;
  transportFactory?: () => CodexAppServerTransport;
  model?: string;
  /**
   * When omitted, mode is derived per assignment:
   * non-empty allowedPaths → governed-workspace-write; otherwise read-only.
   */
  mode?: CodexExecutionMode;
}

function finalAgentText(notification: AppServerNotification): string | null {
  if (notification.method !== "item/completed") return null;
  const params = asRecord(notification.params);
  const item = asRecord(params?.item);
  return item?.type === "agentMessage" && typeof item.text === "string" ? redactCodexText(item.text) : null;
}

function terminalReport(
  notification: AppServerNotification,
  run: InternalRun,
): ProviderTerminalReport | null {
  if (notification.method !== "turn/completed") return null;
  const params = asRecord(notification.params);
  const turn = asRecord(params?.turn);
  const status = typeof turn?.status === "string" ? turn.status : "failed";
  const error = asRecord(turn?.error);
  return {
    runId: run.run.runId,
    sessionId: run.run.sessionId,
    status: status === "interrupted" ? "cancelled" : status === "completed" ? "finished" : "error",
    resultText: run.finalResponse,
    errorMessage:
      typeof error?.message === "string"
        ? redactCodexText(error.message)
        : status === "failed"
          ? "Codex turn failed"
          : null,
    durationMs:
      typeof turn?.durationMs === "number" ? turn.durationMs : Math.max(0, Date.now() - run.startedAt),
  };
}

function commandKey(command: unknown): string | null {
  if (typeof command === "string") return `string:${command}`;
  if (Array.isArray(command) && command.every((part) => typeof part === "string")) {
    return `argv:${JSON.stringify(command)}`;
  }
  return null;
}

function windowsPowerShellExecutable(value: string): boolean {
  const normalized = value.replace(/\\/g, "/");
  const basename = normalized.slice(normalized.lastIndexOf("/") + 1).toLowerCase();
  if (basename !== "pwsh.exe" && basename !== "powershell.exe") return false;
  return (!/[\\/]/.test(value)) || /^[A-Za-z]:[\\/]/.test(value);
}

/** Parse only the deliberately small App Server Windows PowerShell envelope grammar. */
function splitQuotedEnvelope(value: string): string[] | null {
  const tokens: string[] = [];
  let index = 0;
  while (index < value.length) {
    while (value[index] === " " || value[index] === "\t") index++;
    if (index === value.length) break;
    let token = "";
    const quote = value[index] === "'" || value[index] === '"' ? value[index++] : null;
    let closed = quote === null;
    while (index < value.length) {
      const char = value[index]!;
      if (quote) {
        if (char === quote) { index++; closed = true; break; }
        token += char;
        index++;
      } else {
        if (char === " " || char === "\t") break;
        if (char === "'" || char === '"') return null;
        token += char;
        index++;
      }
    }
    if (!closed) return null;
    if (!token || (index < value.length && value[index] !== " " && value[index] !== "\t")) return null;
    tokens.push(token);
  }
  return tokens;
}

function extractedCommand(command: unknown): { command?: string; invocation?: string[] } | null {
  if (typeof command === "string") {
    const envelope = splitQuotedEnvelope(command);
    if (envelope?.length === 3 && windowsPowerShellExecutable(envelope[0]!) &&
        envelope[1]!.toLowerCase() === "-command") return { command: envelope[2] };
    const hasCommandSwitch = /(?:^|[ \t])-command(?:[ \t]|$)/i.test(command);
    const looksLikePowerShell = /(?:^|[\\/'"])(?:pwsh|powershell)\.exe(?:['"])?[ \t]/i.test(command);
    if (hasCommandSwitch && (looksLikePowerShell || envelope === null ||
        (envelope[0] && windowsPowerShellExecutable(envelope[0])))) return null;
    return { command };
  }
  if (!Array.isArray(command) || !command.every((part) => typeof part === "string")) return null;
  if (command.length === 3 && windowsPowerShellExecutable(command[0]!) &&
      command[1]!.toLowerCase() === "-command") return { command: command[2] };
  if (windowsPowerShellExecutable(command[0] ?? "") &&
      command.some((part) => part.toLowerCase() === "-command")) return null;
  return { invocation: command };
}

function matchingRequirement(
  run: InternalRun,
  command: unknown,
  workingDirectory: unknown,
): FrozenVerifierCommandRequirement | undefined {
  if (typeof workingDirectory !== "string") return undefined;
  const extracted = extractedCommand(command);
  if (!extracted) return undefined;
  const matches = run.commandRequirements.filter((requirement) =>
    !run.usedCommandRequirementIds.has(requirement.checkId) &&
    requirement.workingDirectory === workingDirectory &&
    (extracted.command !== undefined
      ? requirement.command === extracted.command
      : JSON.stringify(requirement.invocation) === JSON.stringify(extracted.invocation)));
  return matches.length === 1 ? matches[0] : undefined;
}

/** Official Codex App Server provider with explicit or assignment-derived execution mode. */
export class CodexExecutionProvider implements ExecutionProvider {
  readonly providerId = CODEX_PROVIDER_ID;
  private transport: CodexAppServerTransport | null;
  private readonly transportFactory: () => CodexAppServerTransport;
  private readonly model?: string;
  private readonly configuredMode: CodexExecutionMode | undefined;
  private readonly sessions = new Map<string, InternalSession>();
  private readonly runs = new Map<string, InternalRun>();
  private readonly pendingNotifications = new Map<string, AppServerNotification[]>();
  private unsubscribe: (() => void) | null = null;

  constructor(options: CodexProviderOptions = {}) {
    this.transport = options.transport ?? null;
    this.transportFactory = options.transportFactory ?? (() => new StdioCodexAppServerTransport());
    this.model = options.model;
    this.configuredMode = options.mode;
    if (this.transport) this.subscribe(this.transport);
  }

  /** Effective mode for an assignment. Explicit constructor mode wins over auto. */
  executionModeFor(assignment: { allowedPaths: string[] }): CodexExecutionMode {
    if (this.configuredMode) return this.configuredMode;
    return assignment.allowedPaths.length > 0 ? "governed-workspace-write" : "read-only";
  }

  /** Configured mode, or read-only when auto (before an assignment is known). */
  get executionMode(): CodexExecutionMode {
    return this.configuredMode ?? "read-only";
  }

  private client(): CodexAppServerTransport {
    if (!this.transport) {
      this.transport = this.transportFactory();
      this.subscribe(this.transport);
    }
    return this.transport;
  }

  private subscribe(transport: CodexAppServerTransport): void {
    this.unsubscribe = transport.onNotification((notification) => this.handleNotification(notification));
  }

  async createSession(target: CreateSessionTarget): Promise<ProviderSession> {
    const response = await this.client().request<ThreadResponse>("thread/start", {
      cwd: target.repositoryPath,
      model: this.model,
      approvalPolicy: "never",
      sandbox: "read-only",
      serviceName: "orchestra-execution",
    });
    const session = { providerId: this.providerId, sessionId: response.thread.id, repositoryPath: target.repositoryPath };
    this.sessions.set(session.sessionId, { session, target });
    return session;
  }

  async resumeSession(providerSessionId: string): Promise<ProviderSession> {
    const response = await this.client().request<ThreadResponse>("thread/resume", {
      threadId: providerSessionId,
      approvalPolicy: "never",
      sandbox: "read-only",
    });
    const session = { providerId: this.providerId, sessionId: response.thread.id, repositoryPath: "" };
    this.sessions.set(session.sessionId, {
      session,
      target: { repositoryPath: "", branch: "", startingHead: "" },
    });
    return session;
  }

  async submitAssignment(session: ProviderSession, frozen: FrozenAssignment): Promise<ProviderRun> {
    assertAssignmentUnchanged(frozen, frozen.assignment);
    const internal = this.sessions.get(session.sessionId);
    if (!internal) throw new Error(`unknown Codex provider session: ${session.sessionId}`);
    const policy = projectCodexPolicy(frozen.assignment, this.executionModeFor(frozen.assignment));
    const response = await this.client().request<TurnResponse>("turn/start", {
      threadId: session.sessionId,
      input: [{ type: "text", text: renderAssignmentPrompt(frozen.assignment, frozen.assignmentHash) }],
      cwd: internal.target.repositoryPath,
      approvalPolicy: policy.approvalPolicy,
      sandboxPolicy: policy.turnSandboxPolicy,
      model: this.model,
    });
    const run = {
      providerId: this.providerId,
      sessionId: session.sessionId,
      runId: response.turn.id,
      assignmentHash: frozen.assignmentHash,
    };
    this.runs.set(run.runId, {
      run,
      events: [],
      waiters: [],
      terminal: null,
      finalResponse: null,
      startedAt: Date.now(),
      commandRequirements: (frozen.assignment.verificationRequirements ?? [])
        .flatMap((row) => row.commandRequirement ? [row.commandRequirement] : []),
      commandRequirementById: new Map(),
      usedCommandRequirementIds: new Set(),
      completedCommandIds: new Set(),
    });
    for (const notification of this.pendingNotifications.get(run.runId) ?? []) {
      this.recordNotification(this.requireRun(run.runId), notification);
    }
    this.pendingNotifications.delete(run.runId);
    return run;
  }

  async *streamEvents(run: ProviderRun): AsyncIterable<NormalizedExecutionEvent> {
    const internal = this.requireRun(run.runId);
    let index = 0;
    while (true) {
      while (index < internal.events.length) yield internal.events[index++]!;
      if (internal.terminal) return;
      await new Promise<void>((resolve) => internal.waiters.push(resolve));
    }
  }

  async awaitResult(run: ProviderRun): Promise<ProviderTerminalReport> {
    const internal = this.requireRun(run.runId);
    while (!internal.terminal) {
      await new Promise<void>((resolve) => internal.waiters.push(resolve));
    }
    return internal.terminal;
  }

  async requestCancellation(run: ProviderRun): Promise<void> {
    this.requireRun(run.runId);
    await this.client().request("turn/interrupt", { threadId: run.sessionId, turnId: run.runId });
  }

  getSessionIdentity(session: ProviderSession): ProviderSessionIdentity {
    return {
      providerId: this.providerId,
      sessionId: session.sessionId,
      repositoryPath: session.repositoryPath,
      correlation: { threadId: session.sessionId },
    };
  }

  async closeSession(session: ProviderSession): Promise<void> {
    // Threads are provider state persisted by Codex for explicit resume; closing does not archive them.
    this.sessions.delete(session.sessionId);
    if (this.sessions.size === 0) await this.close();
  }

  async close(): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.transport) await this.transport.close();
    this.transport = null;
  }

  private requireRun(runId: string): InternalRun {
    const run = this.runs.get(runId);
    if (!run) throw new Error(`unknown Codex provider run: ${runId}`);
    return run;
  }

  private handleNotification(notification: AppServerNotification): void {
    const turnId = codexNotificationTurnId(notification);
    if (!turnId) return;
    const internal = this.runs.get(turnId);
    if (!internal) {
      const pending = this.pendingNotifications.get(turnId) ?? [];
      pending.push(notification);
      this.pendingNotifications.set(turnId, pending);
      return;
    }
    this.recordNotification(internal, notification);
  }

  private recordNotification(internal: InternalRun, notification: AppServerNotification): void {
    const text = finalAgentText(notification);
    if (text !== null) internal.finalResponse = text;
    const params = asRecord(notification.params);
    const item = asRecord(params?.item);
    const commandId = item?.type === "commandExecution" && typeof item.id === "string" ? item.id : undefined;
    let requirement: FrozenVerifierCommandRequirement | undefined;
    if (commandId && notification.method === "item/started") {
      if (internal.commandRequirementById.has(commandId) || internal.completedCommandIds.has(commandId)) {
        internal.commandRequirementById.delete(commandId);
      } else {
        requirement = matchingRequirement(internal, item.command, item.cwd ?? item.workingDirectory);
        const key = commandKey(item.command);
        const cwd = item.cwd ?? item.workingDirectory;
        if (requirement && key && typeof cwd === "string") {
          internal.commandRequirementById.set(commandId, { requirement, commandKey: key, workingDirectory: cwd });
          internal.usedCommandRequirementIds.add(requirement.checkId);
        }
      }
    } else if (commandId && notification.method === "item/completed") {
      const binding = internal.commandRequirementById.get(commandId);
      const cwd = item.cwd ?? item.workingDirectory;
      if (binding && !internal.completedCommandIds.has(commandId) && commandKey(item.command) === binding.commandKey &&
          cwd === binding.workingDirectory) {
        requirement = binding.requirement;
      } else if (!binding) {
        const key = commandKey(item.command);
        for (const [boundId, candidate] of internal.commandRequirementById) {
          if (candidate.commandKey === key && candidate.workingDirectory === cwd) {
            internal.commandRequirementById.delete(boundId);
          }
        }
      }
      internal.commandRequirementById.delete(commandId);
      internal.completedCommandIds.add(commandId);
    }
    const commandContext: Partial<NonNullable<NormalizedExecutionEvent["commandExecution"]>> | undefined = requirement ? {
      verifierAssignmentId: requirement.verifierAssignmentId,
      executorAssignmentId: requirement.executorAssignmentId,
      executorExecutionEvidenceId: requirement.executorExecutionEvidenceId,
      repositoryPath: requirement.repositoryPath,
      startingHead: requirement.startingHead,
      candidatePaths: requirement.candidatePaths,
      candidateContentSha256: requirement.candidateContentSha256,
      requiredCheckIds: [requirement.checkId],
    } : commandId ? { requiredCheckIds: [] } : undefined;
    if (commandContext?.repositoryPath && commandContext.candidatePaths) {
      commandContext.candidateContentSha256 = Object.fromEntries(commandContext.candidatePaths.map((path) => {
        try {
          return [path, createHash("sha256").update(readFileSync(join(commandContext.repositoryPath!, path))).digest("hex")];
        } catch {
          return [path, null];
        }
      }));
    }
    const normalized = normalizeCodexEvent(notification, {
        threadId: internal.run.sessionId,
        turnId: internal.run.runId,
        commandContext,
      });
    if (requirement && normalized.commandExecution) {
      normalized.commandExecution.command = requirement.command;
      normalized.commandExecution.invocation = [...requirement.invocation];
      normalized.commandExecution.workingDirectory = requirement.workingDirectory;
    }
    internal.events.push(normalized);
    const terminal = terminalReport(notification, internal);
    if (terminal) internal.terminal = terminal;
    const waiters = internal.waiters.splice(0);
    for (const waiter of waiters) waiter();
  }
}
