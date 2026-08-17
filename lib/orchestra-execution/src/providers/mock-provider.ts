import type { FrozenAssignment } from "../assignment.js";
import type { NormalizedExecutionEvent } from "../events.js";
import type {
  CreateSessionTarget,
  ExecutionProvider,
  ProviderRun,
  ProviderSession,
  ProviderSessionIdentity,
  ProviderTerminalReport,
} from "../provider-contract.js";

export interface MockProviderBehavior {
  failOnCreate?: boolean;
  failOnSubmit?: boolean;
  terminalStatus?: ProviderTerminalReport["status"];
  resultText?: string;
  events?: NormalizedExecutionEvent[];
}

/**
 * In-process provider used by deterministic tests. Does not import @cursor/sdk.
 */
export class MockExecutionProvider implements ExecutionProvider {
  readonly providerId = "mock";
  private readonly behavior: MockProviderBehavior;
  private closed = false;

  constructor(behavior: MockProviderBehavior = {}) {
    this.behavior = behavior;
  }

  async createSession(target: CreateSessionTarget): Promise<ProviderSession> {
    if (this.behavior.failOnCreate) {
      throw new Error("mock provider failed to create session");
    }
    return {
      providerId: this.providerId,
      sessionId: "mock-session",
      repositoryPath: target.repositoryPath,
    };
  }

  async resumeSession(providerSessionId: string): Promise<ProviderSession> {
    return {
      providerId: this.providerId,
      sessionId: providerSessionId,
      repositoryPath: "",
    };
  }

  async submitAssignment(session: ProviderSession, assignment: FrozenAssignment): Promise<ProviderRun> {
    if (this.behavior.failOnSubmit) {
      throw new Error("mock provider failed to submit assignment");
    }
    return {
      providerId: this.providerId,
      sessionId: session.sessionId,
      runId: "mock-run",
      assignmentHash: assignment.assignmentHash,
    };
  }

  async *streamEvents(_run: ProviderRun): AsyncIterable<NormalizedExecutionEvent> {
    const events = this.behavior.events ?? [];
    for (const event of events) yield event;
  }

  async awaitResult(run: ProviderRun): Promise<ProviderTerminalReport> {
    return {
      runId: run.runId,
      sessionId: run.sessionId,
      status: this.behavior.terminalStatus ?? "finished",
      resultText: this.behavior.resultText ?? "mock provider finished",
      errorMessage: this.behavior.terminalStatus === "error" ? "mock error" : null,
      durationMs: 1,
    };
  }

  async requestCancellation(_run: ProviderRun): Promise<void> {}

  getSessionIdentity(session: ProviderSession): ProviderSessionIdentity {
    return {
      providerId: this.providerId,
      sessionId: session.sessionId,
      repositoryPath: session.repositoryPath,
      correlation: { agentId: session.sessionId },
    };
  }

  async closeSession(_session: ProviderSession): Promise<void> {
    this.closed = true;
  }

  wasClosed(): boolean {
    return this.closed;
  }
}
