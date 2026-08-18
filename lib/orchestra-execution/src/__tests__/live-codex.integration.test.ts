import { rmSync } from "node:fs";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence, diffGitEvidence } from "../git-evidence.js";
import { CodexExecutionProvider } from "../providers/codex/codex-provider.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

export interface LiveCodexTestReport {
  ran: boolean;
  blockedReason: string | null;
  threadId: string | null;
  turnId: string | null;
  headUnchanged: boolean | null;
  workingTreeUnchanged: boolean | null;
  cancellationStatus: string | null;
}

export let liveCodexReport: LiveCodexTestReport = {
  ran: false,
  blockedReason: "not executed",
  threadId: null,
  turnId: null,
  headUnchanged: null,
  workingTreeUnchanged: null,
  cancellationStatus: null,
};

function readOnlyFixtureAssignment(assignmentId: string) {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  rmSync(join(fixture.repositoryPath, ".cursor"), { recursive: true, force: true });
  return {
    fixture,
    frozen: createAssignment({
      ...fixture.assignment.assignment,
      allowedPaths: [],
      assignmentText: "Inspect the current branch and HEAD using read-only commands. Report them without modifying files.",
    }),
  };
}

export async function runLiveCodexIntegrationTest(): Promise<void> {
  section("authorized live Codex read-only disposable integration");
  if (process.env.RUN_LIVE_CODEX_INTEGRATION !== "1") {
    liveCodexReport = { ...liveCodexReport, blockedReason: "RUN_LIVE_CODEX_INTEGRATION is not enabled" };
    console.log("  ↷ live Codex test skipped: explicit opt-in not enabled");
    return;
  }

  const { fixture, frozen } = readOnlyFixtureAssignment("orch-imp-036c-live");
  const pre = await collectGitEvidence(fixture.repositoryPath);
  const provider = new CodexExecutionProvider();
  try {
    const session = await provider.createSession({
      repositoryPath: fixture.repositoryPath,
      branch: frozen.assignment.branch,
      startingHead: frozen.assignment.startingHead,
    });
    const run = await provider.submitAssignment(session, frozen);
    const events = [];
    for await (const event of provider.streamEvents(run)) events.push(event);
    const terminal = await provider.awaitResult(run);
    const post = await collectGitEvidence(fixture.repositoryPath);
    const delta = diffGitEvidence(pre, post);
    liveCodexReport = {
      ran: true,
      blockedReason: null,
      threadId: session.sessionId,
      turnId: run.runId,
      headUnchanged: !delta.headChanged,
      workingTreeUnchanged: delta.changedPaths.length === 0,
      cancellationStatus: null,
    };
    expect("live Codex technical status", terminal.status, "finished");
    expectTrue("live Codex thread correlator", session.sessionId.length > 0);
    expectTrue("live Codex turn correlator", run.runId.length > 0);
    expectTrue("live Codex normalized start", events.some((event) => event.type === "run_started"));
    expectTrue("live Codex normalized completion", events.some((event) => event.type === "run_finished"));
    expectFalse("live Codex no commit", delta.commitOccurred);
    expectFalse("live Codex no HEAD change", delta.headChanged);
    expect("live Codex no file change", delta.changedPaths, []);
    await provider.closeSession(session);
  } catch (error) {
    await provider.close();
    throw error;
  }

  const cancellationFixture = readOnlyFixtureAssignment("orch-imp-036c-cancel");
  const cancellationProvider = new CodexExecutionProvider();
  try {
    const session = await cancellationProvider.createSession({
      repositoryPath: cancellationFixture.fixture.repositoryPath,
      branch: cancellationFixture.frozen.assignment.branch,
      startingHead: cancellationFixture.frozen.assignment.startingHead,
    });
    const waiting = createAssignment({
      ...cancellationFixture.frozen.assignment,
      assignmentText: "Run a read-only command that waits for 120 seconds, then report done.",
    });
    const run = await cancellationProvider.submitAssignment(session, waiting);
    const stream = cancellationProvider.streamEvents(run)[Symbol.asyncIterator]();
    let started = false;
    while (!started) {
      const next = await stream.next();
      if (next.done) throw new Error("Codex cancellation turn ended before run_started");
      started = next.value.type === "run_started";
    }
    await cancellationProvider.requestCancellation(run);
    while (!(await stream.next()).done) {
      // Drain through turn/completed so the terminal result is available.
    }
    const terminal = await cancellationProvider.awaitResult(run);
    liveCodexReport.cancellationStatus = terminal.status;
    expect("live Codex interruption normalized", terminal.status, "cancelled");
    await cancellationProvider.closeSession(session);
  } catch (error) {
    await cancellationProvider.close();
    throw error;
  }
}
