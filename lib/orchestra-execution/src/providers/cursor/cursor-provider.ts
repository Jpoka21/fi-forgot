import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Agent, Cursor, JsonlLocalAgentStore } from "@cursor/sdk";
import type { FrozenAssignment } from "../../assignment.js";
import { assertAssignmentUnchanged } from "../../assignment-hash.js";
import type { NormalizedExecutionEvent } from "../../events.js";
import { isForgotIdentifierRepository } from "../../hooks/project-hook.js";
import { isGovernedVerifierExecutionCapability } from "../../governed-verifier-capability.js";
import {
  CURSOR_PROVIDER_ID,
  renderAssignmentPrompt,
  type CreateSessionTarget,
  type ExecutionProvider,
  type ProviderRun,
  type ProviderSession,
  type ProviderSessionIdentity,
  type ProviderTerminalReport,
} from "../../provider-contract.js";
import { normalizeCursorEvent } from "./normalize-events.js";

export interface CursorProviderOptions {
  storeDirectory?: string;
  modelId?: string;
}

interface InternalSession {
  session: ProviderSession;
  agent: Awaited<ReturnType<typeof Agent.create>>;
  storeDirectory: string;
  target: CreateSessionTarget;
}

interface InternalRun {
  run: ProviderRun;
  handle: Awaited<ReturnType<Awaited<ReturnType<typeof Agent.create>>["send"]>>;
  events: NormalizedExecutionEvent[];
  streamed: boolean;
}

function defaultStoreDirectory(): string {
  return join(tmpdir(), "orchestra-cursor-agent-store");
}

export async function isCursorSdkAuthenticated(): Promise<boolean> {
  try {
    const status = await Cursor.auth.status();
    return status.status === "logged-in";
  } catch {
    return false;
  }
}

/**
 * Official Cursor SDK execution provider.
 * Provider session/run ids are correlation evidence only.
 */
export class CursorExecutionProvider implements ExecutionProvider {
  readonly providerId = CURSOR_PROVIDER_ID;
  private readonly storeDirectory: string;
  private readonly modelId: string;
  private readonly sessions = new Map<string, InternalSession>();
  private readonly runs = new Map<string, InternalRun>();

  constructor(options: CursorProviderOptions = {}) {
    this.storeDirectory = options.storeDirectory ?? defaultStoreDirectory();
    this.modelId = options.modelId ?? "composer-2.5";
    mkdirSync(this.storeDirectory, { recursive: true });
  }

  async createSession(target: CreateSessionTarget): Promise<ProviderSession> {
    if (isForgotIdentifierRepository(target.repositoryPath)) {
      if (!target.governedVerifierExecution) {
        throw new Error(
          "Refusing to dispatch a Cursor execution session against the F.I. Forgot repository in this slice.",
        );
      }
      if (
        !isGovernedVerifierExecutionCapability(
          target.governedVerifierExecution,
          target.governedVerifierExecution.assignmentId,
          target.governedVerifierExecution.assignmentHash,
        )
      ) {
        throw new Error(
          "Refusing to dispatch a Cursor execution session against the F.I. Forgot repository without governed verifier execution capability.",
        );
      }
    }
    const store = new JsonlLocalAgentStore(this.storeDirectory);
    const agent = await Agent.create({
      model: { id: this.modelId },
      local: {
        cwd: target.repositoryPath,
        store,
        settingSources: ["project"],
      },
    });
    const session: ProviderSession = {
      providerId: this.providerId,
      sessionId: agent.agentId,
      repositoryPath: target.repositoryPath,
    };
    this.sessions.set(session.sessionId, { session, agent, storeDirectory: this.storeDirectory, target });
    return session;
  }

  async resumeSession(providerSessionId: string): Promise<ProviderSession> {
    const existing = this.sessions.get(providerSessionId);
    if (existing) return existing.session;
    const store = new JsonlLocalAgentStore(this.storeDirectory);
    const agent = await Agent.resume(providerSessionId, {
      model: { id: this.modelId },
      local: {
        store,
        settingSources: ["project"],
      },
    });
    const session: ProviderSession = {
      providerId: this.providerId,
      sessionId: agent.agentId,
      repositoryPath: "",
    };
    this.sessions.set(session.sessionId, {
      session,
      agent,
      storeDirectory: this.storeDirectory,
      target: { repositoryPath: "", branch: "", startingHead: "" },
    });
    return session;
  }

  async submitAssignment(session: ProviderSession, assignment: FrozenAssignment): Promise<ProviderRun> {
    assertAssignmentUnchanged(assignment, assignment.assignment);
    const internal = this.requireSession(session.sessionId);
    const prompt = renderAssignmentPrompt(assignment.assignment, assignment.assignmentHash);
    const handle = await internal.agent.send(prompt);
    const run: ProviderRun = {
      providerId: this.providerId,
      sessionId: session.sessionId,
      runId: handle.id,
      assignmentHash: assignment.assignmentHash,
    };
    this.runs.set(run.runId, { run, handle, events: [], streamed: false });
    return run;
  }

  async *streamEvents(run: ProviderRun): AsyncIterable<NormalizedExecutionEvent> {
    const internal = this.requireRun(run.runId);
    if (internal.streamed) {
      yield* internal.events;
      return;
    }
    internal.streamed = true;
    if (!internal.handle.supports("stream")) {
      return;
    }
    for await (const event of internal.handle.stream()) {
      const normalized = normalizeCursorEvent(event);
      internal.events.push(normalized);
      yield normalized;
    }
  }

  async awaitResult(run: ProviderRun): Promise<ProviderTerminalReport> {
    const internal = this.requireRun(run.runId);
    if (!internal.streamed && internal.handle.supports("stream")) {
      for await (const _event of this.streamEvents(run)) {
        // Drain stream so wait() observes a completed local run.
      }
    }
    const result = await internal.handle.wait();
    const status =
      result.status === "error" || result.status === "cancelled" ? result.status : "finished";
    return {
      runId: result.id,
      sessionId: run.sessionId,
      status,
      resultText: result.result ?? null,
      errorMessage: result.error?.message ?? null,
      durationMs: result.durationMs ?? null,
    };
  }

  async requestCancellation(run: ProviderRun): Promise<void> {
    const internal = this.requireRun(run.runId);
    if (internal.handle.supports("cancel")) {
      await internal.handle.cancel();
    }
  }

  getSessionIdentity(session: ProviderSession): ProviderSessionIdentity {
    const internal = this.sessions.get(session.sessionId);
    return {
      providerId: this.providerId,
      sessionId: session.sessionId,
      repositoryPath: session.repositoryPath,
      correlation: {
        agentId: session.sessionId,
        storeDirectory: internal?.storeDirectory,
      },
    };
  }

  async closeSession(session: ProviderSession): Promise<void> {
    const internal = this.sessions.get(session.sessionId);
    if (!internal) return;
    internal.agent.close();
    this.sessions.delete(session.sessionId);
  }

  private requireSession(sessionId: string): InternalSession {
    const internal = this.sessions.get(sessionId);
    if (!internal) {
      throw new Error(`unknown Cursor provider session: ${sessionId}`);
    }
    return internal;
  }

  private requireRun(runId: string): InternalRun {
    const internal = this.runs.get(runId);
    if (!internal) {
      throw new Error(`unknown Cursor provider run: ${runId}`);
    }
    return internal;
  }
}
