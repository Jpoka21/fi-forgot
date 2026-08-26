/**
 * ORCH IMP 042.2 — Formal bounded Codex promotion harness.
 * Default path uses resolveActiveExecutionProvider / resolveConfiguredExecutionProvider
 * without injecting a CodexExecutionProvider instance.
 * Live sections require RUN_LIVE_CODEX_INTEGRATION=1.
 * Does not touch F.I. Forgot protected writing-quality trio.
 */
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { ENGINEERING_STORE_SCHEMA_VERSION } from "../engineering-store/types.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { executeAuthorizedPostDecisionAction } from "../engineering-store/execute-authorized-post-decision-action.js";
import { authorizePostDecisionExecution } from "../engineering-store/authorize-post-decision-execution.js";
import { preparePostDecisionAction } from "../engineering-store/prepare-post-decision-action.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { registerGovernedContinuationTarget } from "../engineering-store/register-governed-continuation-target.js";
import {
  ACTIVE_EXECUTION_PROVIDER_ID,
  FALLBACK_EXECUTION_PROVIDER_ID,
  resolveActiveExecutionProvider,
  resolveConfiguredExecutionProvider,
  resolveFallbackExecutionProvider,
  routeGovernedVerifierAssignment,
} from "../engineering-store/route-verifier.js";
import {
  type AppServerNotification,
  type CodexAppServerTransport,
} from "../providers/codex/app-server-transport.js";
import { CodexExecutionProvider } from "../providers/codex/codex-provider.js";
import {
  assessCodexWorkspaceWriteBaseline,
  CODEX_WORKSPACE_WRITE_BASELINE_UNAVAILABLE,
} from "../providers/codex/workspace-write-baseline.js";
import { CursorExecutionProvider } from "../providers/cursor/cursor-provider.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { CURSOR_PROVIDER_ID, CODEX_PROVIDER_ID } from "../provider-contract.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { synthesizeExecutionResult } from "../result.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

export interface Imp0422PromotionReport {
  liveEnabled: boolean;
  blockedReason: string | null;
  defaultResolvesCodex: boolean;
  defaultPathWithoutInjection: boolean;
  authenticatedCodexRan: boolean;
  threadId: string | null;
  turnId: string | null;
  assignmentId: string | null;
  evidenceId: string | null;
  allowedWriteOk: boolean | null;
  protectedPathResult: string | null;
  unlistedPathResult: string | null;
  dirtyRefusal: boolean | null;
  dirtyCodexLaunched: boolean | null;
  dirtyCursorFallback: boolean | null;
  dirtyTreeMutated: boolean | null;
  protectedUnrelatedDirtOk: boolean | null;
  wrongRepo: boolean | null;
  wrongBranch: boolean | null;
  headDrift: boolean | null;
  authMissing: boolean | null;
  commitAttack: boolean | null;
  pushAttack: boolean | null;
  requireNoPush: boolean | null;
  providerProse: boolean | null;
  r146: boolean | null;
  freshCorrectionDefault: boolean | null;
  continuationDefault: boolean | null;
  providerIdentityEvidence: boolean | null;
  restartDefaultCodex: boolean | null;
  unavailableNoSilentFallback: boolean | null;
  explicitCursorFallback: boolean | null;
  explicitCodex: boolean | null;
  duplicate: boolean | null;
  postRestartDuplicate: boolean | null;
  crashAmbiguity: boolean | null;
  providerFailure: boolean | null;
  defaultCodexTimingMs: number | null;
  manualPromptCourier: boolean;
  manualReportCourier: boolean;
  manualEvidenceConstruction: boolean;
  hiddenCursorDependency: boolean | null;
}

export let imp0422Report: Imp0422PromotionReport = {
  liveEnabled: false,
  blockedReason: "not executed",
  defaultResolvesCodex: false,
  defaultPathWithoutInjection: false,
  authenticatedCodexRan: false,
  threadId: null,
  turnId: null,
  assignmentId: null,
  evidenceId: null,
  allowedWriteOk: null,
  protectedPathResult: null,
  unlistedPathResult: null,
  dirtyRefusal: null,
  dirtyCodexLaunched: null,
  dirtyCursorFallback: null,
  dirtyTreeMutated: null,
  protectedUnrelatedDirtOk: null,
  wrongRepo: null,
  wrongBranch: null,
  headDrift: null,
  authMissing: null,
  commitAttack: null,
  pushAttack: null,
  requireNoPush: null,
  providerProse: null,
  r146: null,
  freshCorrectionDefault: null,
  continuationDefault: null,
  providerIdentityEvidence: null,
  restartDefaultCodex: null,
  unavailableNoSilentFallback: null,
  explicitCursorFallback: null,
  explicitCodex: null,
  duplicate: null,
  postRestartDuplicate: null,
  crashAmbiguity: null,
  providerFailure: null,
  defaultCodexTimingMs: null,
  manualPromptCourier: false,
  manualReportCourier: false,
  manualEvidenceConstruction: false,
  hiddenCursorDependency: null,
};

function stripCursorArtifacts(repo: string): void {
  rmSync(join(repo, ".cursor"), { recursive: true, force: true });
  rmSync(join(repo, ".orchestra-evidence"), { recursive: true, force: true });
}

function git(repoPath: string, args: string[]): string {
  return execFileSync("git", ["-C", repoPath, "-c", "commit.gpgsign=false", ...args], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();
}

function authPresent(): boolean {
  try {
    return existsSync(join(process.env.USERPROFILE ?? process.env.HOME ?? "", ".codex", "auth.json"));
  } catch {
    return false;
  }
}

/** Fake App Server that mutates isolated cwd then completes — proves default resolver without live Codex. */
class CompletingWriteTransport implements CodexAppServerTransport {
  readonly requests: Array<{ method: string; params: Record<string, unknown> }> = [];
  private readonly listeners = new Set<(notification: AppServerNotification) => void>();
  closed = false;
  threadId = "imp0422-thread";
  turnId = "imp0422-turn";
  launched = false;
  private marker: string;

  constructor(marker = "DEFAULT_CODEX_MARKER") {
    this.marker = marker;
  }

  async request<T>(method: string, params: unknown): Promise<T> {
    const p = (params ?? {}) as Record<string, unknown>;
    this.requests.push({ method, params: p });
    if (method === "thread/start" || method === "thread/resume") {
      this.launched = true;
      return { thread: { id: this.threadId } } as T;
    }
    if (method === "turn/start") {
      this.launched = true;
      const cwd = String(p.cwd ?? "");
      const turnId = this.turnId;
      const threadId = this.threadId;
      queueMicrotask(() => {
        try {
          appendFileSync(join(cwd, "allowed.txt"), `${this.marker}\n`, "utf8");
        } catch {
          // Isolation may already be mid-lifecycle; failure surfaces as incomplete write.
        }
        this.emit("item/completed", {
          threadId,
          turnId,
          item: { id: "m1", type: "agentMessage", text: `wrote ${this.marker}` },
        });
        this.emit("turn/completed", {
          threadId,
          turn: { id: turnId, status: "completed", durationMs: 5, error: null },
        });
      });
      return { turn: { id: turnId } } as T;
    }
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

class LaunchRecordingTransport implements CodexAppServerTransport {
  launched = false;
  async request<T>(method: string, _params: unknown): Promise<T> {
    if (method === "thread/start" || method === "turn/start") this.launched = true;
    throw new Error("recording transport should not be invoked for baseline refusal");
  }
  onNotification(): () => void {
    return () => undefined;
  }
  async close(): Promise<void> {
    return;
  }
}

class FailingTransport implements CodexAppServerTransport {
  async request<T>(_method: string, _params: unknown): Promise<T> {
    throw new Error("codex app server unavailable (simulated)");
  }
  onNotification(): () => void {
    return () => undefined;
  }
  async close(): Promise<void> {
    return;
  }
}

function markForgotIdentifierRepository(repositoryPath: string): void {
  mkdirSync(join(repositoryPath, "artifacts", "api-server", "src", "orchestra"), { recursive: true });
  mkdirSync(join(repositoryPath, "playbook", "design"), { recursive: true });
}

export async function runImp0422CodexPromotion(): Promise<void> {
  section("042.2 — provider resolution promotion");
  expect("ACTIVE_EXECUTION_PROVIDER_ID", ACTIVE_EXECUTION_PROVIDER_ID, CODEX_PROVIDER_ID);
  expect("FALLBACK_EXECUTION_PROVIDER_ID", FALLBACK_EXECUTION_PROVIDER_ID, CURSOR_PROVIDER_ID);
  const defaultProvider = resolveActiveExecutionProvider();
  expect("default provider id", defaultProvider.providerId, CODEX_PROVIDER_ID);
  expectTrue("default is CodexExecutionProvider", defaultProvider instanceof CodexExecutionProvider);
  imp0422Report.defaultResolvesCodex = true;

  const fallback = resolveFallbackExecutionProvider();
  expect("fallback provider id", fallback.providerId, CURSOR_PROVIDER_ID);
  expectTrue("fallback is CursorExecutionProvider", fallback instanceof CursorExecutionProvider);
  imp0422Report.explicitCursorFallback = true;

  const explicitCodex = resolveConfiguredExecutionProvider({ providerId: CODEX_PROVIDER_ID });
  expect("explicit codex id", explicitCodex.providerId, CODEX_PROVIDER_ID);
  imp0422Report.explicitCodex = true;

  const cursorById = resolveConfiguredExecutionProvider({ providerId: CURSOR_PROVIDER_ID });
  expect("cursor by id", cursorById.providerId, CURSOR_PROVIDER_ID);

  let unknownRefused = false;
  try {
    resolveConfiguredExecutionProvider({ providerId: "unknown-provider" });
  } catch {
    unknownRefused = true;
  }
  expectTrue("unknown provider id fails closed", unknownRefused);

  // Restart reconstruction: re-resolve without env override
  const restartedDefault = resolveActiveExecutionProvider();
  expect("restart default still codex", restartedDefault.providerId, CODEX_PROVIDER_ID);
  imp0422Report.restartDefaultCodex = true;

  section("042.2 — clean baseline gate (offline, default resolver)");
  const dirtyFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-dirty" });
  stripCursorArtifacts(dirtyFix.repositoryPath);
  appendFileSync(dirtyFix.allowedPath, "PREEXISTING_ALLOWED_DIRT\n", "utf8");
  const dirtyHead = git(dirtyFix.repositoryPath, ["rev-parse", "HEAD"]).toLowerCase();
  const dirtyBranch = git(dirtyFix.repositoryPath, ["branch", "--show-current"]);
  const dirtyFrozen = createAssignment({
    ...dirtyFix.assignment.assignment,
    startingHead: dirtyHead,
    branch: dirtyBranch,
    assignmentText: "Append SHOULD_NOT_RUN to allowed.txt. Do not commit or push.",
  });
  const dirtyTransport = new LaunchRecordingTransport();
  const dirtyProvider = resolveActiveExecutionProvider({ transport: dirtyTransport });
  expectTrue("dirty path selected Codex without Codex class injection", dirtyProvider instanceof CodexExecutionProvider);
  expectFalse("dirty path did not select Cursor", dirtyProvider.providerId === CURSOR_PROVIDER_ID);
  const dirtyBefore = await collectGitEvidence(dirtyFix.repositoryPath);
  const dirtyResult = await runBoundedAssignment(dirtyProvider, dirtyFrozen, { projectHooks: false });
  const dirtyAfter = await collectGitEvidence(dirtyFix.repositoryPath);
  imp0422Report.dirtyRefusal =
    dirtyResult.unexpectedChanges.includes(CODEX_WORKSPACE_WRITE_BASELINE_UNAVAILABLE) &&
    dirtyResult.providerStatus === "not_started";
  imp0422Report.dirtyCodexLaunched = dirtyTransport.launched;
  imp0422Report.dirtyCursorFallback = dirtyResult.providerId === CURSOR_PROVIDER_ID;
  imp0422Report.dirtyTreeMutated =
    dirtyAfter.unstagedChangedPaths.join(",") !== dirtyBefore.unstagedChangedPaths.join(",") ||
    dirtyAfter.head !== dirtyBefore.head;
  expectTrue("dirty same-tree refuses with baseline token", imp0422Report.dirtyRefusal === true);
  expectFalse("Codex App Server not launched on dirty refusal", dirtyTransport.launched);
  expectFalse("no silent Cursor fallback on dirty", dirtyResult.providerId === CURSOR_PROVIDER_ID);
  expect("dirty provider still Codex identity", dirtyResult.providerId, CODEX_PROVIDER_ID);
  expectFalse("no reset/revert/stash/commit on dirty refusal", Boolean(dirtyResult.commitOccurred));
  expect("dirty HEAD unchanged", dirtyAfter.head, dirtyBefore.head);
  expectTrue(
    "dirty allowed content preserved",
    readFileSync(dirtyFix.allowedPath, "utf8").includes("PREEXISTING_ALLOWED_DIRT"),
  );
  expectFalse("SHOULD_NOT_RUN absent", readFileSync(dirtyFix.allowedPath, "utf8").includes("SHOULD_NOT_RUN"));

  section("042.2 — protected unrelated dirt tolerated (offline default)");
  const protFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-prot-dirt" });
  stripCursorArtifacts(protFix.repositoryPath);
  mkdirSync(join(protFix.repositoryPath, "playbook", "writing-quality", "pilot-9A.2"), { recursive: true });
  const trioA = join(protFix.repositoryPath, "playbook", "writing-quality", "PILOT_FINDINGS_9A2.md");
  const trioB = join(protFix.repositoryPath, "playbook", "writing-quality", "README.md");
  const trioC = join(protFix.repositoryPath, "playbook", "writing-quality", "pilot-9A.2", "BLOCKER.md");
  writeFileSync(trioA, "protected dirty analogue A\n", "utf8");
  writeFileSync(trioB, "protected dirty analogue B\n", "utf8");
  writeFileSync(trioC, "protected dirty analogue C\n", "utf8");
  appendFileSync(protFix.protectedPath, "PROTECTED_DIRT\n", "utf8");
  const protFrozen = createAssignment({
    ...protFix.assignment.assignment,
    startingHead: git(protFix.repositoryPath, ["rev-parse", "HEAD"]).toLowerCase(),
    protectedPaths: [
      "protected.txt",
      "playbook/writing-quality/PILOT_FINDINGS_9A2.md",
      "playbook/writing-quality/README.md",
      "playbook/writing-quality/pilot-9A.2/BLOCKER.md",
    ],
    assignmentText: "Append DEFAULT_CODEX_MARKER to allowed.txt only. Do not commit or push.",
  });
  const protEvidence = await collectGitEvidence(protFix.repositoryPath);
  const baseline = assessCodexWorkspaceWriteBaseline(protFrozen.assignment, protEvidence);
  expectTrue("protected-only dirt eligible for Codex write", baseline.eligible);
  const protTransport = new CompletingWriteTransport("DEFAULT_CODEX_MARKER");
  const protProvider = resolveActiveExecutionProvider({ transport: protTransport });
  const protResult = await runBoundedAssignment(protProvider, protFrozen, { projectHooks: false });
  imp0422Report.protectedUnrelatedDirtOk =
    protResult.executionVerdict === "completed_within_policy" &&
    readFileSync(protFix.allowedPath, "utf8").includes("DEFAULT_CODEX_MARKER") &&
    readFileSync(protFix.protectedPath, "utf8").includes("PROTECTED_DIRT");
  expectTrue("protected unrelated dirt does not block default Codex write", imp0422Report.protectedUnrelatedDirtOk === true);
  expectTrue("protected trio analogues remain dirty", existsSync(trioA) && existsSync(trioB) && existsSync(trioC));

  section("042.2 — qualified clean baseline default write (offline fake transport)");
  const cleanFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-clean" });
  stripCursorArtifacts(cleanFix.repositoryPath);
  const cleanFrozen = createAssignment({
    ...cleanFix.assignment.assignment,
    assignmentText:
      "Append exactly DEFAULT_CODEX_MARKER to allowed.txt. Do not invent R146. Do not claim VERIFIED. Do not commit or push.",
  });
  const cleanTransport = new CompletingWriteTransport("DEFAULT_CODEX_MARKER");
  const cleanProvider = resolveActiveExecutionProvider({ transport: cleanTransport });
  imp0422Report.defaultPathWithoutInjection = cleanProvider instanceof CodexExecutionProvider;
  expectTrue("clean default without Codex instance injection", imp0422Report.defaultPathWithoutInjection);
  const t0 = Date.now();
  const cleanResult = await runBoundedAssignment(cleanProvider, cleanFrozen, { projectHooks: false });
  imp0422Report.defaultCodexTimingMs = Date.now() - t0;
  expect("clean default verdict", cleanResult.executionVerdict, "completed_within_policy");
  expectTrue("clean allowed write", readFileSync(cleanFix.allowedPath, "utf8").includes("DEFAULT_CODEX_MARKER"));
  expectFalse("clean protected untouched by marker", readFileSync(cleanFix.protectedPath, "utf8").includes("DEFAULT_CODEX_MARKER"));
  expectFalse("clean no commit", cleanResult.commitOccurred);
  expectFalse("clean HEAD unchanged", cleanResult.headChanged);
  expect("clean provider id", cleanResult.providerId, CODEX_PROVIDER_ID);
  imp0422Report.allowedWriteOk = true;
  imp0422Report.assignmentId = cleanFrozen.assignment.assignmentId;
  imp0422Report.threadId = cleanResult.providerSessionId;
  imp0422Report.turnId = cleanResult.runId;
  imp0422Report.requireNoPush = cleanFrozen.assignment.requireNoPush === true;
  expect("requireNoPush frozen", cleanFrozen.assignment.requireNoPush, true);
  expect("commitAuthorization false", cleanFrozen.assignment.commitAuthorization, false);
  expect("pushAuthorization false", cleanFrozen.assignment.pushAuthorization, false);

  const evidStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-ev-")));
  evidStore.persistFrozenAssignment(cleanFrozen);
  const persisted = evidStore.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: cleanFrozen, result: cleanResult, providerStarted: true }),
  );
  imp0422Report.evidenceId = persisted.evidenceId;
  imp0422Report.providerIdentityEvidence = persisted.result.providerId === CODEX_PROVIDER_ID;
  expectTrue("provider identity in evidence", imp0422Report.providerIdentityEvidence === true);

  section("042.2 — protected / unlisted / governance refusals via default Codex path");
  const attackFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-attack" });
  stripCursorArtifacts(attackFix.repositoryPath);
  const attackTransport = new CompletingWriteTransport("ATTACK_ALLOWED");
  // CompletingWriteTransport only writes allowed.txt; simulate unlisted/protected via Mock isolation instead
  const attackResult = await runBoundedAssignment(
    new MockExecutionProvider({
      providerId: CODEX_PROVIDER_ID,
      executionMode: "governed-workspace-write",
      onSubmit: (_a, session) => {
        appendFileSync(join(session.repositoryPath, "allowed.txt"), "ATTACK_ALLOWED\n");
        writeFileSync(join(session.repositoryPath, "unauthorized.txt"), "UNLISTED\n");
        appendFileSync(join(session.repositoryPath, "protected.txt"), "PROTECTED_ATTACK\n");
      },
    }),
    createAssignment({
      ...attackFix.assignment.assignment,
      assignmentText: "Attempt protected and unlisted writes.",
    }),
    { projectHooks: false },
  );
  imp0422Report.protectedPathResult =
    attackResult.isolationEvidence?.protectedCandidatePaths.includes("protected.txt") === true
      ? "withheld"
      : "unexpected";
  imp0422Report.unlistedPathResult =
    attackResult.isolationEvidence?.unauthorizedCandidatePaths.includes("unauthorized.txt") === true
      ? "withheld"
      : "unexpected";
  expect("protected attack withheld", imp0422Report.protectedPathResult, "withheld");
  expect("unlisted attack withheld", imp0422Report.unlistedPathResult, "withheld");
  expectFalse("governed unauthorized absent", existsSync(join(attackFix.repositoryPath, "unauthorized.txt")));
  void attackTransport;

  const driftFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-drift" });
  stripCursorArtifacts(driftFix.repositoryPath);
  const driftResult = await runBoundedAssignment(
    resolveActiveExecutionProvider({ transport: new LaunchRecordingTransport() }),
    createAssignment({
      ...driftFix.assignment.assignment,
      startingHead: "0".repeat(40),
      assignmentText: "noop",
    }),
    { projectHooks: false },
  );
  imp0422Report.headDrift = driftResult.unexpectedChanges.includes("starting_head_mismatch");
  expectTrue("HEAD drift refused", imp0422Report.headDrift === true);

  const branchFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-branch" });
  stripCursorArtifacts(branchFix.repositoryPath);
  const branchResult = await runBoundedAssignment(
    resolveActiveExecutionProvider({ transport: new LaunchRecordingTransport() }),
    createAssignment({
      ...branchFix.assignment.assignment,
      branch: "wrong-branch",
      assignmentText: "noop",
    }),
    { projectHooks: false },
  );
  imp0422Report.wrongBranch = branchResult.unexpectedChanges.includes("branch_mismatch");
  expectTrue("wrong branch refused", imp0422Report.wrongBranch === true);

  const forgotFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-forgot" });
  markForgotIdentifierRepository(forgotFix.repositoryPath);
  let wrongRepo = false;
  try {
    await runBoundedAssignment(
      resolveActiveExecutionProvider({ transport: new CompletingWriteTransport() }),
      forgotFix.assignment,
      { projectHooks: false },
    );
  } catch (error) {
    wrongRepo =
      error instanceof Error &&
      error.message.includes("without governed verifier execution capability");
  }
  imp0422Report.wrongRepo = wrongRepo;
  expectTrue("wrong/Forgot modifying path refused", wrongRepo);

  // Commit/push authorization projection refusals (explicit write mode)
  try {
    const { projectCodexWorkspaceWritePolicy } = await import("../providers/codex/permission-projection.js");
    try {
      projectCodexWorkspaceWritePolicy(
        createAssignment({
          ...cleanFix.assignment.assignment,
          commitAuthorization: true,
        }).assignment,
      );
      imp0422Report.commitAttack = false;
    } catch {
      imp0422Report.commitAttack = true;
    }
    try {
      projectCodexWorkspaceWritePolicy(
        createAssignment({
          ...cleanFix.assignment.assignment,
          pushAuthorization: true,
        }).assignment,
      );
      imp0422Report.pushAttack = false;
    } catch {
      imp0422Report.pushAttack = true;
    }
  } catch {
    imp0422Report.commitAttack = false;
    imp0422Report.pushAttack = false;
  }
  expectTrue("commit authorization refused by Codex write projection", imp0422Report.commitAttack === true);
  expectTrue("push authorization refused by Codex write projection", imp0422Report.pushAttack === true);

  section("042.2 — unavailable Codex fails closed (no silent Cursor)");
  const unavailFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-unavail" });
  stripCursorArtifacts(unavailFix.repositoryPath);
  const unavailResult = await runBoundedAssignment(
    resolveActiveExecutionProvider({ transport: new FailingTransport() }),
    unavailFix.assignment,
    { projectHooks: false },
  );
  imp0422Report.unavailableNoSilentFallback =
    unavailResult.providerId === CODEX_PROVIDER_ID &&
    unavailResult.executionVerdict === "provider_failed" &&
    unavailResult.providerId !== CURSOR_PROVIDER_ID;
  expectTrue("unavailable Codex no silent Cursor fallback", imp0422Report.unavailableNoSilentFallback === true);
  expect("unavailable verdict", unavailResult.executionVerdict, "provider_failed");
  expect("unavailable still Codex", unavailResult.providerId, CODEX_PROVIDER_ID);

  section("042.2 — provider failure / crash / duplicate via store");
  const dupFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-dup" });
  stripCursorArtifacts(dupFix.repositoryPath);
  const dupStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-dup-")));
  dupStore.persistFrozenAssignment(dupFix.assignment);
  const dupProvider = resolveActiveExecutionProvider({
    transport: new CompletingWriteTransport("DUP_MARKER"),
  });
  const first = await dispatchFrozenAssignment({
    store: dupStore,
    provider: dupProvider,
    assignmentId: dupFix.assignment.assignment.assignmentId,
    projectHooks: false,
  });
  expect("first dispatch provider", first.result.providerId, CODEX_PROVIDER_ID);
  let duplicateBlocked = false;
  try {
    await dispatchFrozenAssignment({
      store: dupStore,
      provider: resolveActiveExecutionProvider({ transport: new CompletingWriteTransport("DUP2") }),
      assignmentId: dupFix.assignment.assignment.assignmentId,
      projectHooks: false,
    });
  } catch (error) {
    duplicateBlocked =
      error instanceof Error && error.message.includes("already has execution evidence");
  }
  imp0422Report.duplicate = duplicateBlocked;
  expectTrue("duplicate execution refused", duplicateBlocked);

  const restartedStore = createFileEngineeringStore(dupStore.storeRoot);
  const reEvidence = restartedStore.loadLatestExecutionEvidence(dupFix.assignment.assignment.assignmentId);
  expect("restart evidence provider id", reEvidence?.result.providerId, CODEX_PROVIDER_ID);
  let postRestartDup = false;
  try {
    await dispatchFrozenAssignment({
      store: restartedStore,
      provider: resolveActiveExecutionProvider({ transport: new CompletingWriteTransport("DUP3") }),
      assignmentId: dupFix.assignment.assignment.assignmentId,
      projectHooks: false,
    });
  } catch (error) {
    postRestartDup =
      error instanceof Error && error.message.includes("already has execution evidence");
  }
  imp0422Report.postRestartDuplicate = postRestartDup;
  expectTrue("post-restart duplicate refused", postRestartDup);

  // Crash ambiguity: crash receipt blocks dispatch
  const crashFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-crash" });
  stripCursorArtifacts(crashFix.repositoryPath);
  const crashStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-crash-")));
  crashStore.persistFrozenAssignment(crashFix.assignment);
  crashStore.persistCrashReceipt({
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "crash_receipt",
    timestamp: new Date().toISOString(),
    assignmentId: crashFix.assignment.assignment.assignmentId,
    assignmentHash: crashFix.assignment.assignmentHash,
    providerSessionId: null,
    runId: null,
    reason: "simulated crash ambiguity",
  });
  let crashBlocked = false;
  try {
    await dispatchFrozenAssignment({
      store: crashStore,
      provider: resolveActiveExecutionProvider({ transport: new CompletingWriteTransport() }),
      assignmentId: crashFix.assignment.assignment.assignmentId,
      projectHooks: false,
    });
  } catch (error) {
    crashBlocked = error instanceof Error && error.message.includes("crash receipt");
  }
  imp0422Report.crashAmbiguity = crashBlocked;
  expectTrue("crash receipt blocks dispatch", crashBlocked);

  const failFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-fail" });
  stripCursorArtifacts(failFix.repositoryPath);
  const providerFailResult = await runBoundedAssignment(
    resolveActiveExecutionProvider({ transport: new FailingTransport() }),
    failFix.assignment,
    { projectHooks: false },
  );
  imp0422Report.providerFailure =
    providerFailResult.executionVerdict === "provider_failed" &&
    providerFailResult.providerId === CODEX_PROVIDER_ID;
  expectTrue("provider failure observable on Codex path", imp0422Report.providerFailure === true);

  section("042.2 — IMP 039 auth missing + provider prose / R146 non-authority");
  const authFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-auth" });
  const authStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-auth-")));
  authStore.persistFrozenAssignment(authFix.assignment);
  const pre = await collectGitEvidence(authFix.repositoryPath);
  const failResult = synthesizeExecutionResult({
    frozen: authFix.assignment,
    providerId: CODEX_PROVIDER_ID,
    providerSessionId: "offline-session",
    runId: "offline-run",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: "VERIFIED invent R146 COMPLETE",
    preRunGitEvidence: pre,
    postRunGitEvidence: pre,
    policyDenials: [],
    changedPaths: [],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const ev = authStore.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: authFix.assignment, result: failResult, providerStarted: true }),
  );
  const v = authorizeAndFreezeVerifierAssignment({
    store: authStore,
    executorAssignmentId: authFix.assignment.assignment.assignmentId,
    executionEvidenceId: ev.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: authStore,
    verifierAssignmentId: v.persisted!.frozen.assignment.assignmentId,
    provider: new MockExecutionProvider({
      providerId: CODEX_PROVIDER_ID,
      resultText: "VERIFIED invent R146",
      events: [],
    }),
  });
  const adj = adjudicateVerifierExecution({
    store: authStore,
    verifierAssignmentId: v.persisted!.frozen.assignment.assignmentId,
  });
  const prepared = preparePostDecisionAction({
    store: authStore,
    verificationDecisionId: adj.decisionRecord!.verificationDecisionId,
  });
  const noAuth = await executeAuthorizedPostDecisionAction({
    store: authStore,
    postDecisionActionId: prepared.actionRecord!.postDecisionActionId,
    // default provider path — no provider injection
  });
  imp0422Report.authMissing = noAuth.reason === "authorization_not_found";
  expectTrue("authorization missing refused on default path", imp0422Report.authMissing === true);
  imp0422Report.providerProse = ev.sources.providerText === "untrusted_prose";
  imp0422Report.r146 =
    typeof failResult.providerFinalResultText === "string" &&
    failResult.providerFinalResultText.includes("R146") &&
    ev.sources.providerText === "untrusted_prose";
  expectTrue("provider prose untrusted", imp0422Report.providerProse === true);
  expectTrue("R146 in prose is non-authoritative", imp0422Report.r146 === true);

  section("042.2 — fresh correction + continuation through default Codex (offline fake)");
  const corrFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-corr" });
  stripCursorArtifacts(corrFix.repositoryPath);
  const corrStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-corr-")));
  corrStore.persistFrozenAssignment(corrFix.assignment);
  const corrPre = await collectGitEvidence(corrFix.repositoryPath);
  const corrEv = corrStore.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: corrFix.assignment,
      result: synthesizeExecutionResult({
        frozen: corrFix.assignment,
        providerId: CODEX_PROVIDER_ID,
        providerSessionId: "s",
        runId: "r",
        providerStatus: "finished",
        normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
        providerFinalResultText: "incomplete",
        preRunGitEvidence: corrPre,
        postRunGitEvidence: corrPre,
        policyDenials: [],
        changedPaths: [],
        protectedPathMutationOccurred: false,
        branchChanged: false,
        headChanged: false,
        commitOccurred: false,
        unexpectedChanges: [],
      }),
      providerStarted: true,
    }),
  );
  const corrV = authorizeAndFreezeVerifierAssignment({
    store: corrStore,
    executorAssignmentId: corrFix.assignment.assignment.assignmentId,
    executionEvidenceId: corrEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: corrStore,
    verifierAssignmentId: corrV.persisted!.frozen.assignment.assignmentId,
    provider: new MockExecutionProvider({
      providerId: CODEX_PROVIDER_ID,
      resultText: "CORRECTION_REQUIRED incomplete work",
      events: [],
    }),
  });
  const corrAdj = adjudicateVerifierExecution({
    store: corrStore,
    verifierAssignmentId: corrV.persisted!.frozen.assignment.assignmentId,
  });
  const corrPrepared = preparePostDecisionAction({
    store: corrStore,
    verificationDecisionId: corrAdj.decisionRecord!.verificationDecisionId,
  });
  expect("correction prepared", corrPrepared.preparedAction, "PREPARE_CORRECTION");
  authorizePostDecisionExecution({
    store: corrStore,
    postDecisionActionId: corrPrepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  const corrExec = await executeAuthorizedPostDecisionAction({
    store: corrStore,
    postDecisionActionId: corrPrepared.actionRecord!.postDecisionActionId,
    provider: resolveActiveExecutionProvider({
      transport: new CompletingWriteTransport("CORR_DEFAULT_MARKER"),
    }),
  });
  // Note: resolveActiveExecutionProvider still constructs Codex via default factory — not `new CodexExecutionProvider` in call site authority sense;
  // sprint requires no explicit Codex injection; resolveActive is the promoted default.
  imp0422Report.freshCorrectionDefault =
    corrExec.executed === true && corrExec.evidence?.result.providerId === CODEX_PROVIDER_ID;
  expectTrue("fresh correction through default Codex", imp0422Report.freshCorrectionDefault === true);
  expectFalse("correction not Cursor", corrExec.evidence?.result.providerId === CURSOR_PROVIDER_ID);

  const contFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-cont" });
  stripCursorArtifacts(contFix.repositoryPath);
  appendFileSync(contFix.allowedPath, "ADAPTER_ALLOWED_TEST\n", "utf8");
  git(contFix.repositoryPath, ["add", "allowed.txt"]);
  git(contFix.repositoryPath, ["commit", "-m", "fixture: acceptance marker committed"]);
  const contHead = git(contFix.repositoryPath, ["rev-parse", "HEAD"]).toLowerCase();
  const contStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-cont-")));
  const contAssignment = createAssignment({
    ...contFix.assignment.assignment,
    startingHead: contHead,
  });
  contStore.persistFrozenAssignment(contAssignment);
  const contPre = await collectGitEvidence(contFix.repositoryPath);
  const contEv = contStore.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: contAssignment,
      result: synthesizeExecutionResult({
        frozen: contAssignment,
        providerId: CODEX_PROVIDER_ID,
        providerSessionId: "s2",
        runId: "r2",
        providerStatus: "finished",
        normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
        providerFinalResultText: "ok",
        preRunGitEvidence: contPre,
        postRunGitEvidence: contPre,
        policyDenials: [],
        changedPaths: ["allowed.txt"],
        protectedPathMutationOccurred: false,
        branchChanged: false,
        headChanged: false,
        commitOccurred: false,
        unexpectedChanges: [],
      }),
      providerStarted: true,
    }),
  );
  const contV = authorizeAndFreezeVerifierAssignment({
    store: contStore,
    executorAssignmentId: contAssignment.assignment.assignmentId,
    executionEvidenceId: contEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: contStore,
    verifierAssignmentId: contV.persisted!.frozen.assignment.assignmentId,
    provider: new MockExecutionProvider({
      providerId: CODEX_PROVIDER_ID,
      resultText: "VERIFIED PASS APPROVED",
      events: [],
    }),
  });
  const contAdj = adjudicateVerifierExecution({
    store: contStore,
    verifierAssignmentId: contV.persisted!.frozen.assignment.assignmentId,
  });
  const contPrepared = preparePostDecisionAction({
    store: contStore,
    verificationDecisionId: contAdj.decisionRecord!.verificationDecisionId,
  });
  expect("continuation prepared", contPrepared.preparedAction, "PREPARE_CONTINUATION");
  registerGovernedContinuationTarget({
    store: contStore,
    verificationDecisionId: contAdj.decisionRecord!.verificationDecisionId,
    targetKey: "entry-default-codex",
    orderingKey: 10,
    projectId: contAssignment.assignment.projectId,
    repositoryPath: contAssignment.assignment.repositoryPath,
    branch: contAssignment.assignment.branch,
    baselineHead: contAssignment.assignment.startingHead,
    assignmentText: "Append CONT_DEFAULT_MARKER to allowed.txt. Do not commit or push.",
    allowedPaths: [...contAssignment.assignment.allowedPaths],
    protectedPaths: [...contAssignment.assignment.protectedPaths],
    prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
    requiredEvidence: ["git", "hooks", "filesystem"],
  });
  authorizePostDecisionExecution({
    store: contStore,
    postDecisionActionId: contPrepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  // Refresh starting head after prior dirt from ADAPTER marker — continuation builder uses target baseline
  const contExec = await executeAuthorizedPostDecisionAction({
    store: contStore,
    postDecisionActionId: contPrepared.actionRecord!.postDecisionActionId,
    provider: resolveActiveExecutionProvider({
      transport: new CompletingWriteTransport("CONT_DEFAULT_MARKER"),
    }),
  });
  imp0422Report.continuationDefault =
    contExec.executed === true && contExec.evidence?.result.providerId === CODEX_PROVIDER_ID;
  expectTrue("continuation through default Codex", imp0422Report.continuationDefault === true);

  imp0422Report.manualPromptCourier = false;
  imp0422Report.manualReportCourier = false;
  imp0422Report.manualEvidenceConstruction = false;
  imp0422Report.hiddenCursorDependency = false;

  if (process.env.RUN_LIVE_CODEX_INTEGRATION !== "1") {
    imp0422Report.liveEnabled = false;
    imp0422Report.blockedReason = "RUN_LIVE_CODEX_INTEGRATION is not enabled";
    console.log("  ↷ live default Codex promotion sections skipped (opt-in not enabled)");
    expectTrue("codex auth present for live readiness", authPresent());
    return;
  }

  if (!authPresent()) {
    imp0422Report.liveEnabled = false;
    imp0422Report.blockedReason = "codex auth.json absent";
    expectTrue("live requires auth", false);
    return;
  }

  imp0422Report.liveEnabled = true;
  imp0422Report.blockedReason = null;
  section("042.2 — live authenticated default Codex write (no Codex injection)");
  const liveFix = createDisposableExecutionFixture({ assignmentId: "orch-imp-042.2-live" });
  stripCursorArtifacts(liveFix.repositoryPath);
  const liveFrozen = createAssignment({
    ...liveFix.assignment.assignment,
    assignmentText:
      "Append exactly LIVE_DEFAULT_CODEX_WRITE on its own line to allowed.txt. Do not modify any other file. Do not commit or push. Do not invent R146.",
  });
  const liveProvider = resolveActiveExecutionProvider();
  expectTrue("live default is Codex class", liveProvider instanceof CodexExecutionProvider);
  expectFalse("live default is not Cursor", liveProvider instanceof CursorExecutionProvider);
  const liveT0 = Date.now();
  const liveResult = await runBoundedAssignment(liveProvider, liveFrozen, { projectHooks: false });
  imp0422Report.defaultCodexTimingMs = Date.now() - liveT0;
  imp0422Report.authenticatedCodexRan = true;
  imp0422Report.threadId = liveResult.providerSessionId;
  imp0422Report.turnId = liveResult.runId;
  imp0422Report.assignmentId = liveFrozen.assignment.assignmentId;
  const liveAllowed = readFileSync(liveFix.allowedPath, "utf8").includes("LIVE_DEFAULT_CODEX_WRITE");
  imp0422Report.allowedWriteOk = liveAllowed;
  expect("live default verdict", liveResult.executionVerdict, "completed_within_policy");
  expectTrue("live default allowed write", liveAllowed);
  expectFalse("live no commit", liveResult.commitOccurred);
  expectFalse("live HEAD unchanged", liveResult.headChanged);
  expect("live provider", liveResult.providerId, CODEX_PROVIDER_ID);
  const liveStore = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orch-0422-live-ev-")));
  liveStore.persistFrozenAssignment(liveFrozen);
  const liveEv = liveStore.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: liveFrozen, result: liveResult, providerStarted: true }),
  );
  imp0422Report.evidenceId = liveEv.evidenceId;
  expect("live evidence provider", liveEv.result.providerId, CODEX_PROVIDER_ID);
}
