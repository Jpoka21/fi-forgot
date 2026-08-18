import type { FrozenAssignment } from "../../assignment.js";
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
  type AppServerNotification,
  type CodexAppServerTransport,
} from "./app-server-transport.js";
import {
  asRecord,
  codexNotificationTurnId,
  normalizeCodexEvent,
} from "./normalize-events.js";
import { projectCodexReadOnlyPolicy } from "./permission-projection.js";

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
}

function finalAgentText(notification: AppServerNotification): string | null {
  if (notification.method !== "item/completed") return null;
  const params = asRecord(notification.params);
  const item = asRecord(params?.item);
  return item?.type === "agentMessage" && typeof item.text === "string" ? item.text : null;
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
    errorMessage: typeof error?.message === "string" ? error.message : status === "failed" ? "Codex turn failed" : null,
    durationMs:
      typeof turn?.durationMs === "number" ? turn.durationMs : Math.max(0, Date.now() - run.startedAt),
  };
}

/** Official Codex App Server provider restricted to Orchestra read-only assignments. */
export class CodexExecutionProvider implements ExecutionProvider {
  readonly providerId = CODEX_PROVIDER_ID;
  private transport: CodexAppServerTransport | null;
  private readonly transportFactory: () => CodexAppServerTransport;
  private readonly model?: string;
  private readonly sessions = new Map<string, InternalSession>();
  private readonly runs = new Map<string, InternalRun>();
  private readonly pendingNotifications = new Map<string, AppServerNotification[]>();
  private unsubscribe: (() => void) | null = null;

  constructor(options: CodexProviderOptions = {}) {
    this.transport = options.transport ?? null;
    this.transportFactory = options.transportFactory ?? (() => new StdioCodexAppServerTransport());
    this.model = options.model;
    if (this.transport) this.subscribe(this.transport);
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
    const policy = projectCodexReadOnlyPolicy(frozen.assignment);
    const response = await this.client().request<TurnResponse>("turn/start", {
      threadId: session.sessionId,
      input: [{ type: "text", text: renderAssignmentPrompt(frozen.assignment, frozen.assignmentHash) }],
      cwd: frozen.assignment.repositoryPath,
      approvalPolicy: policy.approvalPolicy,
      sandboxPolicy: { type: policy.turnSandbox, access: { type: "fullAccess" } },
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
    internal.events.push(
      normalizeCodexEvent(notification, { threadId: internal.run.sessionId, turnId: internal.run.runId }),
    );
    const terminal = terminalReport(notification, internal);
    if (terminal) internal.terminal = terminal;
    const waiters = internal.waiters.splice(0);
    for (const waiter of waiters) waiter();
  }
}
