import { createAssignment } from "../assignment-hash.js";
import type {
  AppServerNotification,
  CodexAppServerTransport,
} from "../providers/codex/app-server-transport.js";
import { CodexExecutionProvider } from "../providers/codex/codex-provider.js";
import { normalizeCodexEvent } from "../providers/codex/normalize-events.js";
import {
  CodexPermissionProjectionError,
  projectCodexReadOnlyPolicy,
} from "../providers/codex/permission-projection.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

class FakeAppServerTransport implements CodexAppServerTransport {
  readonly requests: Array<{ method: string; params: Record<string, unknown> }> = [];
  private readonly listeners = new Set<(notification: AppServerNotification) => void>();
  closed = false;
  threadId = "codex-thread-1";
  turnId = "codex-turn-1";

  async request<T>(method: string, params: unknown): Promise<T> {
    this.requests.push({ method, params: params as Record<string, unknown> });
    if (method === "thread/start" || method === "thread/resume") {
      return { thread: { id: this.threadId } } as T;
    }
    if (method === "turn/start") return { turn: { id: this.turnId } } as T;
    return {} as T;
  }

  onNotification(listener: (notification: AppServerNotification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(method: string, params: unknown): void {
    for (const listener of this.listeners) listener({ method, params });
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

function readOnlyAssignment(overrides: Record<string, unknown> = {}) {
  return createAssignment({
    assignmentId: "codex-read-only",
    projectId: "p",
    role: "verifier",
    repositoryPath: "C:/fixture",
    branch: "main",
    startingHead: "a".repeat(40),
    assignmentText: "Inspect deterministic facts only.",
    allowedPaths: [],
    protectedPaths: ["protected.txt"],
    requireNoPush: true,
    commitAuthorization: false,
    pushAuthorization: false,
    createdAt: "2026-08-18T00:00:00.000Z",
    ...overrides,
  });
}

function expectRefusal(label: string, overrides: Record<string, unknown>, code: string): void {
  try {
    projectCodexReadOnlyPolicy(readOnlyAssignment(overrides).assignment);
    expect(label, "accepted", code);
  } catch (error) {
    expectTrue(`${label} is typed`, error instanceof CodexPermissionProjectionError);
    expect(label, (error as CodexPermissionProjectionError).code, code);
  }
}

export async function runCodexProviderTests(): Promise<void> {
  section("Codex read-only provider");
  expect(
    "read-only thread sandbox",
    projectCodexReadOnlyPolicy(readOnlyAssignment().assignment).threadSandbox,
    "read-only",
  );
  expect(
    "read-only turn sandbox",
    projectCodexReadOnlyPolicy(readOnlyAssignment().assignment).turnSandbox,
    "readOnly",
  );
  expect(
    "read-only policy approvals",
    projectCodexReadOnlyPolicy(readOnlyAssignment().assignment).approvalPolicy,
    "never",
  );
  expectRefusal("write scope refused", { allowedPaths: ["allowed.txt"] }, "write_scope_not_empty");
  expectRefusal("commit refused", { commitAuthorization: true }, "commit_authorized");
  expectRefusal("push refused", { pushAuthorization: true }, "push_authorized");
  expectRefusal("no-push false refused", { requireNoPush: false }, "no_push_not_required");
  expectRefusal(
    "missing hook prohibition refused",
    { prohibitedCommandClasses: ["git_push", "force_push", "destructive_git"] },
    "required_prohibition_missing",
  );
  expectRefusal(
    "unsupported policy refused",
    { prohibitedCommandClasses: ["git_push", "force_push", "destructive_git", "hook_tamper", "network"] },
    "unsupported_prohibition",
  );

  const refusalTransport = new FakeAppServerTransport();
  const refusalProvider = new CodexExecutionProvider({ transport: refusalTransport });
  const refusalSession = await refusalProvider.createSession({
    repositoryPath: "C:/fixture",
    branch: "main",
    startingHead: "a".repeat(40),
  });
  try {
    await refusalProvider.submitAssignment(refusalSession, readOnlyAssignment({ allowedPaths: ["x"] }));
  } catch (error) {
    expectTrue("provider returns typed refusal", error instanceof CodexPermissionProjectionError);
  }
  expectFalse(
    "turn does not start after permission refusal",
    refusalTransport.requests.some((request) => request.method === "turn/start"),
  );
  await refusalProvider.closeSession(refusalSession);

  const transport = new FakeAppServerTransport();
  const provider = new CodexExecutionProvider({ transport });
  const frozen = readOnlyAssignment();
  const session = await provider.createSession({
    repositoryPath: frozen.assignment.repositoryPath,
    branch: frozen.assignment.branch,
    startingHead: frozen.assignment.startingHead,
  });
  expect("Codex provider id", session.providerId, "codex");
  expect("thread identity captured", provider.getSessionIdentity(session).correlation?.threadId, transport.threadId);
  const run = await provider.submitAssignment(session, frozen);
  expect("turn identity is run correlator", run.runId, transport.turnId);
  expect("assignment hash correlated", run.assignmentHash, frozen.assignmentHash);
  const turnStart = transport.requests.find((request) => request.method === "turn/start")!;
  const input = turnStart.params.input as Array<{ text: string }>;
  expectTrue("exact assignment id delivered", input[0]!.text.includes(`assignmentId: ${frozen.assignment.assignmentId}`));
  expectTrue("exact assignment hash delivered", input[0]!.text.includes(`assignmentHash: ${frozen.assignmentHash}`));
  expect("turn sandbox is readOnly", (turnStart.params.sandboxPolicy as { type: string }).type, "readOnly");
  expect("turn approval is never", turnStart.params.approvalPolicy, "never");

  transport.emit("turn/started", { threadId: session.sessionId, turn: { id: run.runId } });
  transport.emit("item/agentMessage/delta", { threadId: session.sessionId, turnId: run.runId, delta: "progress" });
  transport.emit("item/completed", {
    threadId: session.sessionId,
    turnId: run.runId,
    item: { id: "message-1", type: "agentMessage", text: "untrusted provider prose: PASS" },
  });
  transport.emit("thread/tokenUsage/updated", {
    threadId: session.sessionId,
    turnId: run.runId,
    tokenUsage: { total: { inputTokens: 3, outputTokens: 4 } },
  });
  transport.emit("turn/completed", {
    threadId: session.sessionId,
    turn: { id: run.runId, status: "completed", durationMs: 12, error: null },
  });
  const events = [];
  for await (const event of provider.streamEvents(run)) events.push(event);
  expectTrue("normalized turn start", events.some((event) => event.type === "run_started"));
  expectTrue("normalized completion", events.some((event) => event.type === "run_finished"));
  expectTrue("agent message normalized as progress", events.some((event) => event.type === "assistant_progress"));
  expectTrue("structured usage preserved", events.some((event) => event.usage?.inputTokens === 3));
  const terminal = await provider.awaitResult(run);
  expect("technical completion only", terminal.status, "finished");
  expect("provider prose preserved but not interpreted", terminal.resultText, "untrusted provider prose: PASS");
  await provider.requestCancellation(run);
  expectTrue("cancellation maps to turn interrupt", transport.requests.some((request) => request.method === "turn/interrupt"));
  await provider.closeSession(session);
  expectTrue("provider transport closed", transport.closed);

  const resumeTransport = new FakeAppServerTransport();
  resumeTransport.threadId = session.sessionId;
  const resumedProvider = new CodexExecutionProvider({ transport: resumeTransport });
  const resumed = await resumedProvider.resumeSession(session.sessionId);
  expect("fresh provider resumes stored thread", resumed.sessionId, session.sessionId);
  expectTrue("resume used official method", resumeTransport.requests.some((request) => request.method === "thread/resume"));
  await resumedProvider.closeSession(resumed);

  const failedTransport = new FakeAppServerTransport();
  const failedProvider = new CodexExecutionProvider({ transport: failedTransport });
  const failedSession = await failedProvider.createSession({
    repositoryPath: "C:/fixture",
    branch: "main",
    startingHead: "a".repeat(40),
  });
  const failedRun = await failedProvider.submitAssignment(failedSession, frozen);
  failedTransport.emit("turn/completed", {
    threadId: failedSession.sessionId,
    turn: { id: failedRun.runId, status: "failed", error: { message: "provider technical failure" } },
  });
  const failedResult = await failedProvider.awaitResult(failedRun);
  expect("provider failure normalized", failedResult.status, "error");
  expect("provider error detail preserved", failedResult.errorMessage, "provider technical failure");
  expectFalse("provider error is not semantic verification FAIL", failedResult.errorMessage === "FAIL");
  await failedProvider.closeSession(failedSession);

  expect(
    "raw Codex unknown event remains provider telemetry",
    normalizeCodexEvent({ method: "codex/custom", params: { threadId: "t", turnId: "r" } }).message,
    "unmapped_codex_event:codex/custom",
  );
}
