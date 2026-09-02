import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { InteractiveCodexGateway } from "../interactive-codex-gateway.js";
import { createAssignment } from "../assignment-hash.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { FileEngineeringStore } from "../engineering-store/store.js";
import { buildVerificationDecisionRecord } from "../engineering-store/verification-decision-record.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import type { ExecutionEvidence, VerificationDecisionRecord } from "../engineering-store/types.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

const CANDIDATE_PATH = "lib/orchestra-execution/gateway-fixture.txt";
const UNRELATED_PATH = "notes/unrelated.txt";
const PROTECTED_PATH = "playbook/writing-quality/README.md";

function git(repo: string, args: string[]): string {
  return execFileSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    windowsHide: true,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: "2026-08-17T00:00:00Z",
      GIT_COMMITTER_DATE: "2026-08-17T00:00:00Z",
    },
  }).trimEnd();
}

function write(repository: string, path: string, bytes: string): void {
  const destination = join(repository, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, bytes, "utf8");
}

function lines(value: string): string[] {
  return value ? value.split(/\r?\n/).filter(Boolean) : [];
}

function stagedPaths(repository: string): string[] {
  return lines(git(repository, ["diff", "--cached", "--name-only", "--"])).sort();
}

export type GitHarnessInspection = {
  localTip: string;
  remoteTip: string;
  branch: string;
  upstream: string;
  stagedPaths: string[];
  commitParent: string | null;
  commitSubject: string;
  changedPaths: string[];
  candidateBytes: string;
  protectedBytes: string;
  porcelainStatus: string;
  treeIdentity: string;
  ahead: number;
  behind: number;
};

export type TestInterruptionDescriptor = {
  point: "before_commit" | "after_commit_before_push" | "ambiguous_post_push";
  sequence: number;
  message: string;
};

export const TEST_INTERRUPTION_DESCRIPTORS: readonly TestInterruptionDescriptor[] = Object.freeze([
  Object.freeze({ point: "before_commit", sequence: 1, message: "test interruption before commit" }),
  Object.freeze({ point: "after_commit_before_push", sequence: 2, message: "test interruption after commit before push" }),
  Object.freeze({ point: "ambiguous_post_push", sequence: 3, message: "test interruption with ambiguous post-push result" }),
]);

export type DisposableGitHarness = {
  rawRepository: string;
  repository: string;
  remote: string;
  baselineTip: string;
  candidatePath: string;
  unrelatedPath: string;
  protectedPath: string;
  addDirt(): void;
  stageContamination(): void;
  advanceLocalHead(subject?: string): string;
  changeBranch(branch?: string): void;
  reassignUpstream(branch?: string): string;
  advanceRemoteIndependently(subject?: string): string;
  inspect(): GitHarnessInspection;
  dispose(): void;
};

export type CandidateContentDrift = {
  acceptedCandidateBytes: string;
  changedCandidateBytes: string;
};

/** Captures the accepted candidate content, then changes only its working-tree bytes. */
export function introduceCandidateContentDrift(
  fixture: DisposableGitHarness,
  changedCandidateBytes = "candidate content drift\n",
): CandidateContentDrift {
  const acceptedCandidateBytes = readFileSync(join(fixture.repository, fixture.candidatePath), "utf8");
  write(fixture.repository, fixture.candidatePath, changedCandidateBytes);
  return { acceptedCandidateBytes, changedCandidateBytes };
}

/** A real, isolated work repository plus bare origin used only by this test module. */
export function createDisposableGitHarness(parentDirectory = tmpdir()): DisposableGitHarness {
  const root = mkdtempSync(join(parentDirectory, ".orchestra-gateway-fixture-"));
  const rawRepository = join(root, "work");
  const remote = join(root, "origin.git");
  mkdirSync(rawRepository, { recursive: true });
  mkdirSync(remote, { recursive: true });
  write(rawRepository, CANDIDATE_PATH, "tracked gateway scope\n");
  write(rawRepository, PROTECTED_PATH, "protected baseline\n");
  git(rawRepository, ["init", "-b", "frontend-rebuild"]);
  const repository = resolve(git(rawRepository, ["rev-parse", "--show-toplevel"]));
  git(repository, ["config", "user.email", "orchestra-gateway@example.invalid"]);
  git(repository, ["config", "user.name", "Orchestra Gateway Fixture"]);
  git(repository, ["add", CANDIDATE_PATH, PROTECTED_PATH]);
  git(repository, ["commit", "-m", "fixture: initialize gateway scope"]);
  git(remote, ["init", "--bare"]);
  git(repository, ["remote", "add", "origin", remote]);
  git(repository, ["push", "--set-upstream", "origin", "frontend-rebuild"]);
  const baselineTip = git(repository, ["rev-parse", "HEAD"]);

  const fixture: DisposableGitHarness = {
    rawRepository,
    repository,
    remote: resolve(remote),
    baselineTip,
    candidatePath: CANDIDATE_PATH,
    unrelatedPath: UNRELATED_PATH,
    protectedPath: PROTECTED_PATH,
    addDirt() {
      write(repository, CANDIDATE_PATH, "candidate work\n");
      write(repository, UNRELATED_PATH, "unrelated work\n");
      write(repository, PROTECTED_PATH, "protected work\n");
    },
    stageContamination() {
      git(repository, ["add", UNRELATED_PATH]);
    },
    advanceLocalHead(subject = "fixture: local advancement") {
      write(repository, CANDIDATE_PATH, `${subject}\n`);
      git(repository, ["add", CANDIDATE_PATH]);
      git(repository, ["commit", "-m", subject]);
      return git(repository, ["rev-parse", "HEAD"]);
    },
    changeBranch(branch = "candidate") {
      git(repository, ["switch", "-c", branch]);
    },
    reassignUpstream(branch = "candidate-upstream") {
      git(repository, ["branch", branch, baselineTip]);
      git(repository, ["push", "origin", `${branch}:${branch}`]);
      git(repository, ["branch", "--set-upstream-to", `origin/${branch}`]);
      return `origin/${branch}`;
    },
    advanceRemoteIndependently(subject = "fixture: independent remote advancement") {
      const peer = join(root, "peer");
      git(root, ["clone", remote, peer]);
      git(peer, ["config", "user.email", "orchestra-peer@example.invalid"]);
      git(peer, ["config", "user.name", "Orchestra Remote Fixture"]);
      git(peer, ["switch", "frontend-rebuild"]);
      write(peer, "remote-only.txt", `${subject}\n`);
      git(peer, ["add", "remote-only.txt"]);
      git(peer, ["commit", "-m", subject]);
      git(peer, ["push", "origin", "frontend-rebuild"]);
      git(repository, ["fetch", "origin"]);
      return git(repository, ["rev-parse", "origin/frontend-rebuild"]);
    },
    inspect() {
      const branch = git(repository, ["branch", "--show-current"]);
      const upstream = git(repository, ["rev-parse", "--abbrev-ref", "@{upstream}"]);
      const [, commitParent = null] = git(repository, [
        "rev-list", "--parents", "-n", "1", "HEAD",
      ]).split(/\s+/);
      const [ahead = 0, behind = 0] = git(repository, [
        "rev-list", "--left-right", "--count", "HEAD...@{upstream}",
      ]).split(/\s+/).map(Number);
      return {
        localTip: git(repository, ["rev-parse", "HEAD"]),
        remoteTip: git(repository, ["rev-parse", "@{upstream}"]),
        branch,
        upstream,
        stagedPaths: stagedPaths(fixture.repository),
        commitParent,
        commitSubject: git(repository, ["show", "-s", "--format=%s", "HEAD"]),
        changedPaths: lines(git(repository, ["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"])).sort(),
        candidateBytes: readFileSync(join(repository, CANDIDATE_PATH), "utf8"),
        protectedBytes: readFileSync(join(repository, PROTECTED_PATH), "utf8"),
        porcelainStatus: git(repository, ["status", "--porcelain=v1", "--untracked-files=all"]),
        treeIdentity: git(repository, ["rev-parse", "HEAD^{tree}"]),
        ahead,
        behind,
      };
    },
    dispose() {
      rmSync(root, { recursive: true, force: true });
    },
  };
  return fixture;
}

/** Focused proof that inspection handles both a root commit and its first real child. */
export function runDisposableGitHarnessRootInspectionTests(): void {
  section("Disposable Git harness root inspection");
  const fixture = createDisposableGitHarness();
  try {
    const root = fixture.inspect();
    expect("root commit has no parent", root.commitParent, null);
    expect("root HEAD inspected", root.localTip, fixture.baselineTip);
    expect("root remote tip inspected", root.remoteTip, fixture.baselineTip);
    expect("root branch inspected", root.branch, "frontend-rebuild");
    expect("root upstream inspected", root.upstream, "origin/frontend-rebuild");
    expect("root working tree is clean", root.porcelainStatus, "");
    expect("root staged state is empty", root.stagedPaths, []);

    const priorHead = root.localTip;
    const childHead = fixture.advanceLocalHead("fixture: child of root");
    const child = fixture.inspect();
    expect("child HEAD inspected", child.localTip, childHead);
    expect("child commit parent is exact prior HEAD", child.commitParent, priorHead);
  } finally {
    fixture.dispose();
  }
}

function proveGitHarness(): void {
  const dirt = createDisposableGitHarness();
  try {
    expect("baseline branch", git(dirt.repository, ["branch", "--show-current"]), "frontend-rebuild");
    expect("baseline upstream", git(dirt.repository, ["rev-parse", "--abbrev-ref", "@{upstream}"]), "origin/frontend-rebuild");
    expect("baseline pushed", git(dirt.repository, ["rev-parse", "HEAD"]), git(dirt.repository, ["rev-parse", "@{upstream}"]));
    dirt.addDirt();
    dirt.stageContamination();
    expect("exact staged contamination", stagedPaths(dirt.repository), [UNRELATED_PATH]);
    expect("candidate dirt bytes", readFileSync(join(dirt.repository, CANDIDATE_PATH), "utf8"), "candidate work\n");
    expect("protected dirt bytes", readFileSync(join(dirt.repository, PROTECTED_PATH), "utf8"), "protected work\n");
    expect("exact dirt porcelain", git(dirt.repository, ["status", "--porcelain=v1", "--untracked-files=all"]), [
      ` M ${CANDIDATE_PATH}`,
      `A  ${UNRELATED_PATH}`,
      ` M ${PROTECTED_PATH}`,
    ].join("\n"));
  } finally {
    dirt.dispose();
  }

  const branch = createDisposableGitHarness();
  try {
    branch.changeBranch();
    expect("branch change inspectable", git(branch.repository, ["branch", "--show-current"]), "candidate");
    expect("upstream reassigned", branch.reassignUpstream(), "origin/candidate-upstream");
    expect("reassigned upstream inspectable", git(branch.repository, ["rev-parse", "--abbrev-ref", "@{upstream}"]), "origin/candidate-upstream");
  } finally {
    branch.dispose();
  }

  const divergence = createDisposableGitHarness();
  try {
    const localTip = divergence.advanceLocalHead();
    const remoteTip = divergence.advanceRemoteIndependently();
    const inspected = divergence.inspect();
    expect("local tip inspected", inspected.localTip, localTip);
    expect("remote tip inspected", inspected.remoteTip, remoteTip);
    expect("divergence branch inspected", inspected.branch, "frontend-rebuild");
    expect("divergence upstream inspected", inspected.upstream, "origin/frontend-rebuild");
    expect("no staged residue after local commit", inspected.stagedPaths, []);
    expect("commit parent inspected", inspected.commitParent, divergence.baselineTip);
    expect("commit subject inspected", inspected.commitSubject, "fixture: local advancement");
    expect("exact committed paths inspected", inspected.changedPaths, [CANDIDATE_PATH]);
    expect("candidate bytes inspected", inspected.candidateBytes, "fixture: local advancement\n");
    expect("protected bytes inspected", inspected.protectedBytes, "protected baseline\n");
    expect("porcelain status inspected", inspected.porcelainStatus, "");
    expect("tree identity inspected", inspected.treeIdentity, git(divergence.repository, ["show", "-s", "--format=%T", "HEAD"]));
    expect("deterministic local ahead count", inspected.ahead, 1);
    expect("deterministic remote behind count", inspected.behind, 1);
  } finally {
    divergence.dispose();
  }

  expect("deterministic interruption points", TEST_INTERRUPTION_DESCRIPTORS.map((row) => row.point), [
    "before_commit", "after_commit_before_push", "ambiguous_post_push",
  ]);
  expect("deterministic interruption sequence", TEST_INTERRUPTION_DESCRIPTORS.map((row) => row.sequence), [1, 2, 3]);
}

export async function runInteractiveCodexGatewayTests(): Promise<void> {
  baselineRuns++;
  section("Interactive Codex Gateway governance");
  proveGitHarness();
  const fixture = createDisposableGitHarness();
  try {
    const repository = fixture.repository;
    const storeRoot = mkdtempSync(join(tmpdir(), "orchestra-gateway-"));
    let providersCreated = 0;
    const gateway = new InteractiveCodexGateway({ repository, storeRoot, providerFactory: () => {
      providersCreated++;
      return new MockExecutionProvider({ providerId: "codex" });
    } });

    const planned = await gateway.converse("Implement gateway test behavior in lib/orchestra-execution");
    expect("conversation freezes request", planned.phase, "authority_required");
    const submission = planned.data as any;
    expectFalse("conversation alone does not execute", submission.executed);
    expectFalse("conversation cannot authorize commit", submission.commitAuthorization);
    expectFalse("conversation cannot authorize push", submission.pushAuthorization);
    expect("provider not created while planning", providersCreated, 0);
    const store = new FileEngineeringStore(storeRoot);
    expect("frozen request has no execution evidence", store.loadExecutionEvidence(submission.assignmentId), []);
    expectTrue("protected paths retained", store.loadFrozenAssignment(submission.assignmentId).assignment.protectedPaths.length > 0);

    const noVerifiedCandidate = await gateway.converse("Accept and publish");
    expect("exact publication phrase fails closed without VERIFIED evidence", noVerifiedCandidate.phase, "refused");
    expectTrue("missing candidate refusal is specific", noVerifiedCandidate.message.includes("no_eligible_verified_candidate"));
    expect("publication refusal does not resolve a provider", providersCreated, 0);
    expect("publication refusal creates no acceptance", store.loadGovernedCandidateAcceptances(), []);
    expect("publication refusal creates no receipt", store.loadGovernedCandidatePublications(), []);

    const reconstructedStore = new FileEngineeringStore(storeRoot);
    const reconstructedGateway = new InteractiveCodexGateway({ repository, storeRoot,
      providerFactory: () => new MockExecutionProvider({ providerId: "codex" }) });
    expect("fresh store reconstructs persisted assignment",
      reconstructedStore.loadFrozenAssignment(submission.assignmentId).assignmentHash, submission.assignmentHash);
    expect("fresh gateway retains persisted store root", reconstructedGateway.storeRoot, storeRoot);
    expect("fresh gateway retains repository", reconstructedGateway.repository, repository);
    expect("fresh gateway reconstructs persisted state", (await reconstructedGateway.converse(
      `/dispatch ${submission.assignmentId} wrong`,
    )).phase, "refused");
    expect("reconstruction does not create evidence", reconstructedStore.loadExecutionEvidence(submission.assignmentId), []);

    const wrong = await gateway.converse(`/dispatch ${submission.assignmentId} wrong`);
    expect("wrong confirmation fails closed", wrong.phase, "refused");
    expect("wrong confirmation never resolves provider", providersCreated, 0);
    expect("wrong confirmation persists no evidence", store.loadExecutionEvidence(submission.assignmentId), []);

    const cursorGateway = new InteractiveCodexGateway({ repository, storeRoot,
      providerFactory: () => new MockExecutionProvider({ providerId: "cursor" }) });
    const fallback = await cursorGateway.converse(`/dispatch ${submission.assignmentId} ${submission.assignmentId}`);
    expect("Cursor fallback refused", fallback.phase, "refused");
    expectTrue("fallback refusal is explicit", fallback.message.includes("no Cursor fallback"));
    expect("fallback refusal persists no execution evidence", store.loadExecutionEvidence(submission.assignmentId), []);
  } finally {
    fixture.dispose();
  }
}

export type InteractiveCodexGatewayTestSelection =
  | "baseline"
  | "publication-contract"
  | "publication-batch-1"
  | "publication-batch-2"
  | "publication-batch-3-verification-fixture";
export type InteractiveCodexGatewayTestRunner = () => Promise<void>;

let baselineRuns = 0;
let publicationContractRuns = 0;

/** Selects independently invokable test runners without coupling publication smoke to the baseline. */
export function selectInteractiveCodexGatewayTestRunner(
  selection: InteractiveCodexGatewayTestSelection,
): InteractiveCodexGatewayTestRunner {
  if (selection === "baseline") return runInteractiveCodexGatewayTests;
  if (selection === "publication-contract") return runInteractiveCodexGatewayPublicationContractTests;
  if (selection === "publication-batch-1") return runInteractiveCodexGatewayPublicationBatch1Tests;
  if (selection === "publication-batch-2") return runInteractiveCodexGatewayPublicationBatch2Tests;
  return runInteractiveCodexGatewayPublicationBatch3VerificationFixtureTests;
}

/** Test-architecture smoke proof only; intentionally contains no publication behavior. */
export async function runInteractiveCodexGatewayPublicationContractTests(): Promise<void> {
  publicationContractRuns++;
  section("Interactive Codex Gateway publication-contract selection smoke");
  expect(
    "baseline selection remains independently invokable",
    selectInteractiveCodexGatewayTestRunner("baseline"),
    runInteractiveCodexGatewayTests,
  );
  expect(
    "publication selection is independently invokable",
    selectInteractiveCodexGatewayTestRunner("publication-contract"),
    runInteractiveCodexGatewayPublicationContractTests,
  );

  const fixture = createDisposableGitHarness();
  try {
    write(fixture.repository, fixture.unrelatedPath, "accepted unrelated staged bytes\n");
    git(fixture.repository, ["add", fixture.unrelatedPath]);
    const before = {
      localTip: git(fixture.repository, ["rev-parse", "HEAD"]),
      remoteTip: git(fixture.repository, ["rev-parse", "@{upstream}"]),
      branch: git(fixture.repository, ["branch", "--show-current"]),
      upstream: git(fixture.repository, ["rev-parse", "--abbrev-ref", "@{upstream}"]),
      stagedPaths: stagedPaths(fixture.repository),
      candidateBytes: readFileSync(join(fixture.repository, fixture.candidatePath), "utf8"),
      protectedBytes: readFileSync(join(fixture.repository, fixture.protectedPath), "utf8"),
    };
    const drift = introduceCandidateContentDrift(fixture);
    const after = {
      localTip: git(fixture.repository, ["rev-parse", "HEAD"]),
      remoteTip: git(fixture.repository, ["rev-parse", "@{upstream}"]),
      branch: git(fixture.repository, ["branch", "--show-current"]),
      upstream: git(fixture.repository, ["rev-parse", "--abbrev-ref", "@{upstream}"]),
      stagedPaths: stagedPaths(fixture.repository),
      candidateBytes: readFileSync(join(fixture.repository, fixture.candidatePath), "utf8"),
      protectedBytes: readFileSync(join(fixture.repository, fixture.protectedPath), "utf8"),
    };

    expect("accepted candidate bytes captured", drift.acceptedCandidateBytes, before.candidateBytes);
    expect("candidate bytes changed", after.candidateBytes, drift.changedCandidateBytes);
    expectFalse("candidate bytes differ from accepted bytes", after.candidateBytes === drift.acceptedCandidateBytes);
    expect("content drift leaves HEAD unchanged", after.localTip, before.localTip);
    expect("content drift leaves branch unchanged", after.branch, before.branch);
    expect("content drift leaves upstream unchanged", after.upstream, before.upstream);
    expect("content drift leaves remote tip unchanged", after.remoteTip, before.remoteTip);
    expect("content drift leaves protected bytes unchanged", after.protectedBytes, before.protectedBytes);
    expect("content drift leaves staged paths unchanged", after.stagedPaths, before.stagedPaths);
    expect("unrelated staged state remains isolated", after.stagedPaths, [UNRELATED_PATH]);
  } finally {
    fixture.dispose();
  }
}

type PublicationBaseline = {
  head: string;
  remote: string;
  branch: string;
  upstream: string;
  protectedBytes: string;
  stagedPaths: string[];
};

function publicationBaseline(fixture: DisposableGitHarness): PublicationBaseline {
  return {
    head: git(fixture.repository, ["rev-parse", "HEAD"]),
    remote: git(fixture.repository, ["rev-parse", "@{upstream}"]),
    branch: git(fixture.repository, ["branch", "--show-current"]),
    upstream: git(fixture.repository, ["rev-parse", "--abbrev-ref", "@{upstream}"]),
    protectedBytes: readFileSync(join(fixture.repository, fixture.protectedPath), "utf8"),
    stagedPaths: stagedPaths(fixture.repository),
  };
}

async function requestPublication(
  gateway: InteractiveCodexGateway,
  _fixture: DisposableGitHarness,
): Promise<Awaited<ReturnType<InteractiveCodexGateway["converse"]>>> {
  try {
    return await gateway.converse("Accept and publish");
  } catch (error) {
    return {
      ok: false,
      phase: "refused",
      message: `publication_infrastructure_exception: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function expectPublicationSuccess(label: string, response: Awaited<ReturnType<InteractiveCodexGateway["converse"]>>): void {
  expectTrue(`${label} reports success`, response.ok);
  expect(`${label} completes publication`, response.phase, "executed");
}

function persistEligibleVerifiedCandidate(fixture: DisposableGitHarness, storeRoot: string, suffix: string): void {
  const store = new FileEngineeringStore(storeRoot);
  const createdAt = "2026-09-02T12:00:00.000Z";
  const executor = createAssignment({ assignmentId: `publication-${suffix}-executor`, projectId: `publication-${suffix}`,
    role: "executor", repositoryPath: fixture.repository, branch: "frontend-rebuild", startingHead: fixture.baselineTip,
    assignmentText: "Publish the bounded candidate.", allowedPaths: [fixture.candidatePath],
    protectedPaths: [fixture.protectedPath], requireNoPush: true, commitAuthorization: false, pushAuthorization: false,
    requiredEvidence: [], createdAt });
  store.persistFrozenAssignment(executor);
  const resultFor = (frozen: typeof executor, changedPaths: string[], run: string) => synthesizeExecutionResult({
    frozen, providerId: "publication-fixture", providerSessionId: `${run}-session`, runId: run,
    providerStatus: "finished", normalizedEvents: [{ type: "run_finished" as const, timestamp: createdAt }],
    providerFinalResultText: "complete", preRunGitEvidence: null, postRunGitEvidence: null, policyDenials: [],
    changedPaths, protectedPathMutationOccurred: false, branchChanged: false, headChanged: false,
    commitOccurred: false, unexpectedChanges: [],
  });
  const executorEvidence = store.persistExecutionEvidence(buildExecutionEvidence({ frozen: executor,
    result: resultFor(executor, [fixture.candidatePath], `${suffix}-executor-run`), providerStarted: true, recordedAt: createdAt }));
  const verifier = createAssignment({ ...executor.assignment, assignmentId: `publication-${suffix}-verifier`, role: "verifier",
    assignmentText: "Verify the exact candidate.", allowedPaths: [], requiredEvidence: ["executor_execution_evidence"] });
  store.persistFrozenAssignment(verifier, { relationship: { verifiesAssignmentId: executor.assignment.assignmentId,
    verifiesExecutionEvidenceId: executorEvidence.evidenceId } });
  const verifierEvidence = store.persistExecutionEvidence(buildExecutionEvidence({ frozen: verifier,
    result: resultFor(verifier, [], `${suffix}-verifier-run`), providerStarted: true, recordedAt: createdAt }));
  store.persistVerificationDecision(buildVerificationDecisionRecord({ verifierAssignmentId: verifier.assignment.assignmentId,
    verifierAssignmentHash: verifier.assignmentHash, verifierExecutionEvidenceId: verifierEvidence.evidenceId,
    verifiedExecutorAssignmentId: executor.assignment.assignmentId, verifiedExecutorExecutionEvidenceId: executorEvidence.evidenceId,
    decision: "VERIFIED", decisionReasonCodes: ["fixture_verified"], decidedAt: createdAt }));
}

function publicationGateway(fixture: DisposableGitHarness, suffix: string, publicationInterlock?: () => void): InteractiveCodexGateway {
  const storeRoot = join(dirname(fixture.rawRepository), `store-${suffix}`);
  persistEligibleVerifiedCandidate(fixture, storeRoot, suffix);
  return new InteractiveCodexGateway({
    repository: fixture.repository,
    storeRoot,
    providerFactory: () => new MockExecutionProvider({ providerId: "codex" }),
    publicationInterlock,
  });
}

async function runPublicationScenario(label: string, scenario: () => Promise<void>, failures: string[]): Promise<void> {
  try {
    await scenario();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** Five independently isolated real-Git publication contracts. */
export async function runInteractiveCodexGatewayPublicationBatch1Tests(): Promise<void> {
  section("Interactive Codex Gateway publication-batch-1 contracts");
  const baselineRunsBeforeSelection = baselineRuns;
  const publicationContractRunsBeforeSelection = publicationContractRuns;
  expect(
    "publication Batch 1 selection routes independently",
    selectInteractiveCodexGatewayTestRunner("publication-batch-1"),
    runInteractiveCodexGatewayPublicationBatch1Tests,
  );
  expect(
    "publication Batch 1 selection does not execute baseline automatically",
    baselineRuns,
    baselineRunsBeforeSelection,
  );
  expect(
    "publication Batch 1 selection does not execute architecture automatically",
    publicationContractRuns,
    publicationContractRunsBeforeSelection,
  );
  const failures: string[] = [];

  await runPublicationScenario("exact candidate-only commit", async () => {
    const fixture = createDisposableGitHarness();
    try {
      fixture.addDirt();
      const acceptedHead = git(fixture.repository, ["rev-parse", "HEAD"]);
      const response = await requestPublication(publicationGateway(fixture, "commit"), fixture);
      expectFalse("candidate-only publication is not wrong_repository", response.message.includes("wrong_repository"));
      const published = response.ok && response.phase === "executed";
      expectPublicationSuccess("candidate-only publication", response);
      if (published) {
        const inspection = fixture.inspect();
        expectFalse("candidate-only publication creates a real commit", inspection.localTip === acceptedHead);
        expect("publication commit has accepted HEAD parent", inspection.commitParent, acceptedHead);
        expect("publication commit has exact accepted subject", inspection.commitSubject, "orchestra: publish publication-commit-executor");
        expect("publication commit contains exact candidate paths", inspection.changedPaths, [fixture.candidatePath]);
        expectFalse("publication commit excludes unrelated path", inspection.changedPaths.includes(fixture.unrelatedPath));
        expectFalse("publication commit excludes protected path", inspection.changedPaths.includes(fixture.protectedPath));
        const repeated = await requestPublication(publicationGateway(fixture, "commit"), fixture);
        expectPublicationSuccess("repeated exact phrase", repeated);
        expect("repeated phrase creates no second commit", fixture.inspect().localTip, inspection.localTip);
      }
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("accepted non-system-temporary repository", async () => {
    const fixture = createDisposableGitHarness(process.cwd());
    try {
      write(fixture.repository, fixture.candidatePath, "candidate non-temporary fixture work\n");
      expect("non-temporary fixture is rooted in the test workspace", dirname(dirname(fixture.rawRepository)), resolve(process.cwd()));
      const response = await requestPublication(publicationGateway(fixture, "non-temporary"), fixture);
      expectPublicationSuccess("exactly bound non-temporary fixture publication", response);
      expect("non-temporary fixture pushes its created commit", fixture.inspect().remoteTip, fixture.inspect().localTip);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("exact normal non-force push", async () => {
    const fixture = createDisposableGitHarness();
    const tracePath = join(dirname(fixture.rawRepository), "git-trace2.json");
    const priorTrace = process.env.GIT_TRACE2_EVENT;
    try {
      write(fixture.repository, fixture.candidatePath, "candidate push work\n");
      process.env.GIT_TRACE2_EVENT = tracePath;
      const response = await requestPublication(publicationGateway(fixture, "push"), fixture);
      expectFalse("normal push publication is not wrong_repository", response.message.includes("wrong_repository"));
      const published = response.ok && response.phase === "executed";
      expectPublicationSuccess("normal push publication", response);
      if (published) {
        const localHead = git(fixture.repository, ["rev-parse", "HEAD"]);
        expect("remote contains exact created commit", git(fixture.remote, ["rev-parse", "refs/heads/frontend-rebuild"]), localHead);
        expectTrue("successful publication emits Git trace", existsSync(tracePath));
        const events = lines(readFileSync(tracePath, "utf8")).map((row) => JSON.parse(row) as { event?: string; argv?: string[] });
        const pushes = events.filter((event) => event.event === "start" && event.argv?.includes("push"));
        expect("one actual push start observed", pushes.length, 1);
        const argv = pushes[0]!.argv!;
        expectTrue("push targets intended branch/refspec", argv.includes("frontend-rebuild:frontend-rebuild"));
        expectFalse("push is not forced", argv.some((arg) => arg === "--force" || arg === "-f" || arg.startsWith("--force-")));
        expectFalse("push has no wildcard refspec", argv.some((arg) => arg.includes("*")));
      }
    } finally {
      if (priorTrace === undefined) delete process.env.GIT_TRACE2_EVENT;
      else process.env.GIT_TRACE2_EVENT = priorTrace;
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("protected dirty preservation", async () => {
    const fixture = createDisposableGitHarness();
    try {
      write(fixture.repository, fixture.candidatePath, "candidate protected-preservation work\n");
      write(fixture.repository, fixture.protectedPath, "protected dirty bytes\n");
      const protectedBytes = readFileSync(join(fixture.repository, fixture.protectedPath), "utf8");
      const response = await requestPublication(publicationGateway(fixture, "protected"), fixture);
      const published = response.ok && response.phase === "executed";
      try {
        expectFalse("protected preservation publication is not wrong_repository", response.message.includes("wrong_repository"));
        expectPublicationSuccess("protected preservation publication", response);
      } finally {
        expect("protected bytes always remain unchanged", readFileSync(join(fixture.repository, fixture.protectedPath), "utf8"), protectedBytes);
        expectTrue("protected path always remains dirty and unstaged", lines(git(fixture.repository, ["diff", "--name-only", "--", fixture.protectedPath])).includes(fixture.protectedPath));
        expectFalse("protected path always remains unstaged", stagedPaths(fixture.repository).includes(fixture.protectedPath));
      }
      if (published) expectFalse("real publication commit excludes protected path", fixture.inspect().changedPaths.includes(fixture.protectedPath));
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("candidate-content drift refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      write(fixture.repository, fixture.candidatePath, "accepted candidate bytes\n");
      const accepted = publicationBaseline(fixture);
      const arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "drift", () =>
        introduceCandidateContentDrift(fixture, "candidate bytes changed after acceptance\n")), fixture);
      const after = publicationBaseline(fixture);
      expect("drift refusal preserves HEAD", after.head, arranged.head);
      expect("drift refusal preserves remote", after.remote, arranged.remote);
      expect("drift refusal preserves branch", after.branch, arranged.branch);
      expect("drift refusal preserves upstream", after.upstream, arranged.upstream);
      expect("drift refusal preserves protected bytes", after.protectedBytes, arranged.protectedBytes);
      expect("drift refusal preserves empty staged state", after.stagedPaths, arranged.stagedPaths);
      expect("accepted and arranged HEAD are identical", arranged.head, accepted.head);
      expect("no publication commit exists", after.head, fixture.baselineTip);
      expectFalse("drift refusal is not wrong_repository", response.message.includes("wrong_repository"));
      expect("candidate-content drift is refused", response.phase, "refused");
      expectTrue("drift refusal is specific", /candidate[_ -]?content[_ -]?drift|content[_ -]?drift/i.test(response.message));
    } finally {
      fixture.dispose();
    }
  }, failures);

  if (failures.length) throw new Error(`publication-batch-1 semantic failures:\n${failures.join("\n")}`);
}

function expectSemanticPublicationRefusal(
  label: string,
  response: Awaited<ReturnType<InteractiveCodexGateway["converse"]>>,
  semanticReason: RegExp,
): void {
  expectFalse(`${label} is not wrong_repository`, response.message.includes("wrong_repository"));
  expectFalse(`${label} is not an infrastructure exception`, response.message.includes("publication_infrastructure_exception"));
  expect(`${label} is refused`, response.phase, "refused");
  expectTrue(`${label} reports its semantic reason`, semanticReason.test(response.message));
}

/** Seven independently isolated real-Git publication preflight refusal contracts. */
export async function runInteractiveCodexGatewayPublicationBatch2Tests(): Promise<void> {
  section("Interactive Codex Gateway publication-batch-2 refusal contracts");
  const baselineRunsBeforeSelection = baselineRuns;
  const publicationContractRunsBeforeSelection = publicationContractRuns;
  expect(
    "publication Batch 2 selection routes independently",
    selectInteractiveCodexGatewayTestRunner("publication-batch-2"),
    runInteractiveCodexGatewayPublicationBatch2Tests,
  );
  expect("publication Batch 2 selection does not execute baseline automatically", baselineRuns, baselineRunsBeforeSelection);
  expect(
    "publication Batch 2 selection does not execute architecture automatically",
    publicationContractRuns,
    publicationContractRunsBeforeSelection,
  );
  const failures: string[] = [];

  await runPublicationScenario("protected-path drift refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      let arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "batch2-protected-drift", () =>
        { write(fixture.repository, fixture.protectedPath, "protected bytes changed after acceptance\n"); arranged = publicationBaseline(fixture); }), fixture);
      const after = publicationBaseline(fixture);
      expect("protected-path drift creates no commit", after.head, arranged.head);
      expect("protected-path drift pushes no ref", after.remote, arranged.remote);
      expect("protected-path drift preserves protected bytes", after.protectedBytes, arranged.protectedBytes);
      expectSemanticPublicationRefusal("protected-path drift", response, /protected[_ -]?path[_ -]?drift/i);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("staged contamination refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      let arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "batch2-staged", () => {
        write(fixture.repository, fixture.unrelatedPath, "staged contamination\n");
        git(fixture.repository, ["add", fixture.unrelatedPath]);
        arranged = publicationBaseline(fixture);
      }), fixture);
      const after = publicationBaseline(fixture);
      expect("staged contamination creates no commit", after.head, arranged.head);
      expect("staged contamination pushes no ref", after.remote, arranged.remote);
      expect("staged contamination preserves the exact index", after.stagedPaths, arranged.stagedPaths);
      expectSemanticPublicationRefusal("staged contamination", response, /staged[_ -]?contamination/i);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("branch drift refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      let arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "batch2-branch", () => {
        fixture.changeBranch("publication-branch-drift");
        git(fixture.repository, ["branch", "--set-upstream-to", "origin/frontend-rebuild"]);
        arranged = publicationBaseline(fixture);
      }), fixture);
      const after = publicationBaseline(fixture);
      expect("branch drift creates no commit", after.head, arranged.head);
      expect("branch drift pushes no ref", after.remote, arranged.remote);
      expect("branch drift does not switch branches", after.branch, arranged.branch);
      expectSemanticPublicationRefusal("branch drift", response, /branch[_ -]?drift/i);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("HEAD drift refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      let arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "batch2-head", () =>
        { fixture.advanceLocalHead("fixture: HEAD changed after acceptance"); arranged = publicationBaseline(fixture); }), fixture);
      const after = publicationBaseline(fixture);
      expect("HEAD drift creates no additional commit", after.head, arranged.head);
      expect("HEAD drift pushes no ref", after.remote, arranged.remote);
      expect("HEAD drift preserves upstream", after.upstream, arranged.upstream);
      expectSemanticPublicationRefusal("HEAD drift", response, /head[_ -]?drift/i);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("upstream mismatch refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      let arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "batch2-upstream", () =>
        { fixture.reassignUpstream("publication-wrong-upstream"); arranged = publicationBaseline(fixture); }), fixture);
      const after = publicationBaseline(fixture);
      expect("upstream mismatch creates no commit", after.head, arranged.head);
      expect("upstream mismatch pushes no ref", after.remote, arranged.remote);
      expect("upstream mismatch does not rewrite tracking", after.upstream, arranged.upstream);
      expectSemanticPublicationRefusal("upstream mismatch", response, /upstream[_ -]?mismatch/i);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("pre-commit remote divergence refusal", async () => {
    const fixture = createDisposableGitHarness();
    try {
      let arranged = publicationBaseline(fixture);
      const response = await requestPublication(publicationGateway(fixture, "batch2-remote-divergence", () =>
        { fixture.advanceRemoteIndependently("fixture: remote changed before publication commit"); arranged = publicationBaseline(fixture); }), fixture);
      const after = publicationBaseline(fixture);
      expect("remote divergence creates no local commit", after.head, arranged.head);
      expect("remote divergence pushes no replacement ref", after.remote, arranged.remote);
      expect("remote divergence preserves branch", after.branch, arranged.branch);
      expectSemanticPublicationRefusal("pre-commit remote divergence", response, /pre[_ -]?commit[_ -]?remote[_ -]?divergence/i);
    } finally {
      fixture.dispose();
    }
  }, failures);

  await runPublicationScenario("accepted repository substitution refusal", async () => {
    const acceptedFixture = createDisposableGitHarness();
    const substitutedFixture = createDisposableGitHarness();
    try {
      write(acceptedFixture.repository, acceptedFixture.candidatePath, "accepted repository A work\n");
      const acceptedBefore = publicationBaseline(acceptedFixture);
      const substitutedBefore = publicationBaseline(substitutedFixture);
      let gateway!: InteractiveCodexGateway;
      gateway = publicationGateway(acceptedFixture, "batch2-repository-substitution", () => {
        (gateway as unknown as { repository: string }).repository = substitutedFixture.repository;
      });
      const response = await requestPublication(gateway, acceptedFixture);
      const acceptedAfter = publicationBaseline(acceptedFixture);
      const substitutedAfter = publicationBaseline(substitutedFixture);
      expect("repository substitution creates no commit in accepted repository A", acceptedAfter.head, acceptedBefore.head);
      expect("repository substitution pushes no ref from accepted repository A", acceptedAfter.remote, acceptedBefore.remote);
      expect("repository substitution creates no commit in substituted repository B", substitutedAfter.head, substitutedBefore.head);
      expect("repository substitution pushes no ref from substituted repository B", substitutedAfter.remote, substitutedBefore.remote);
      expectSemanticPublicationRefusal("accepted repository substitution", response, /repository[_ -]?drift/i);
    } finally {
      acceptedFixture.dispose();
      substitutedFixture.dispose();
    }
  }, failures);

  if (failures.length) throw new Error(`publication-batch-2 semantic failures:\n${failures.join("\n")}`);
}

export type VerifierExecutionEvidenceLocator = Pick<ExecutionEvidence, "assignmentId" | "evidenceId">;
export type VerificationDecisionLocator = Pick<
  VerificationDecisionRecord,
  "verifierAssignmentId" | "verificationDecisionId"
>;

export function locateVerifierExecutionEvidence(evidence: ExecutionEvidence): VerifierExecutionEvidenceLocator {
  return { assignmentId: evidence.assignmentId, evidenceId: evidence.evidenceId };
}

export function locateVerificationDecision(decision: VerificationDecisionRecord): VerificationDecisionLocator {
  return {
    verifierAssignmentId: decision.verifierAssignmentId,
    verificationDecisionId: decision.verificationDecisionId,
  };
}

/** One persistence-only publication fixture spanning executor evidence through verification decision. */
export async function runInteractiveCodexGatewayPublicationBatch3VerificationFixtureTests(): Promise<void> {
  section("Interactive Codex Gateway publication-batch-3 verification fixture");
  expect(
    "publication Batch 3 verification fixture selection routes independently",
    selectInteractiveCodexGatewayTestRunner("publication-batch-3-verification-fixture"),
    runInteractiveCodexGatewayPublicationBatch3VerificationFixtureTests,
  );

  const repositoryRoot = mkdtempSync(join(tmpdir(), "orchestra-publication-batch-3-repository-"));
  const storeRoot = mkdtempSync(join(tmpdir(), "orchestra-publication-batch-3-store-"));
  let failure: unknown;
  try {
    const store = new FileEngineeringStore(storeRoot);
    const createdAt = "2026-09-02T12:00:00.000Z";
    const providerId = "publication-batch-3-mock-provider";
    const executor = createAssignment({
      assignmentId: "publication-batch-3-executor",
      projectId: "publication-batch-3-fixture",
      role: "executor",
      repositoryPath: repositoryRoot,
      branch: "frontend-rebuild",
      startingHead: "1111111111111111111111111111111111111111",
      assignmentText: "Persist the bounded publication verification fixture.",
      allowedPaths: [CANDIDATE_PATH],
      protectedPaths: [PROTECTED_PATH],
      requireNoPush: true,
      commitAuthorization: false,
      pushAuthorization: false,
      requiredEvidence: [],
      createdAt,
    });
    store.persistFrozenAssignment(executor);
    const executorResult = synthesizeExecutionResult({
      frozen: executor,
      providerId,
      providerSessionId: "publication-batch-3-executor-session",
      runId: "publication-batch-3-executor-run",
      providerStatus: "finished",
      normalizedEvents: [{ type: "run_finished", timestamp: createdAt }],
      providerFinalResultText: "mock executor completed",
      preRunGitEvidence: null,
      postRunGitEvidence: null,
      policyDenials: [],
      changedPaths: [CANDIDATE_PATH],
      protectedPathMutationOccurred: false,
      branchChanged: false,
      headChanged: false,
      commitOccurred: false,
      unexpectedChanges: [],
    });
    const executorEvidence = store.persistExecutionEvidence(buildExecutionEvidence({
      frozen: executor,
      result: executorResult,
      providerStarted: true,
      recordedAt: "2026-09-02T12:01:00.000Z",
    }));

    const verifier = createAssignment({
      ...executor.assignment,
      assignmentId: "publication-batch-3-verifier",
      role: "verifier",
      assignmentText: "Verify the exact persisted executor assignment and execution evidence.",
      allowedPaths: [],
      requiredEvidence: ["executor_execution_evidence"],
      createdAt: "2026-09-02T12:02:00.000Z",
    });
    store.persistFrozenAssignment(verifier, {
      relationship: {
        verifiesAssignmentId: executor.assignment.assignmentId,
        verifiesExecutionEvidenceId: executorEvidence.evidenceId,
      },
    });
    const verifierResult = synthesizeExecutionResult({
      frozen: verifier,
      providerId,
      providerSessionId: "publication-batch-3-verifier-session",
      runId: "publication-batch-3-verifier-run",
      providerStatus: "finished",
      normalizedEvents: [{ type: "run_finished", timestamp: "2026-09-02T12:03:00.000Z" }],
      providerFinalResultText: "mock verifier completed",
      preRunGitEvidence: null,
      postRunGitEvidence: null,
      policyDenials: [],
      changedPaths: [],
      protectedPathMutationOccurred: false,
      branchChanged: false,
      headChanged: false,
      commitOccurred: false,
      unexpectedChanges: [],
    });
    const verifierEvidence = store.persistExecutionEvidence(buildExecutionEvidence({
      frozen: verifier,
      result: verifierResult,
      providerStarted: true,
      recordedAt: "2026-09-02T12:03:00.000Z",
    }));
    const decision = store.persistVerificationDecision(buildVerificationDecisionRecord({
      verifierAssignmentId: verifier.assignment.assignmentId,
      verifierAssignmentHash: verifier.assignmentHash,
      verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      verifiedExecutorAssignmentId: executor.assignment.assignmentId,
      verifiedExecutorExecutionEvidenceId: executorEvidence.evidenceId,
      decision: "VERIFIED",
      decisionReasonCodes: ["publication_batch_3_fixture_complete"],
      decidedAt: "2026-09-02T12:04:00.000Z",
    }));

    const verifierExecutionEvidenceLocator = locateVerifierExecutionEvidence(verifierEvidence);
    const verificationDecisionLocator = locateVerificationDecision(decision);
    const reloaded = new FileEngineeringStore(storeRoot);
    expect("executor assignment reloads exactly", reloaded.loadFrozenAssignment(executor.assignment.assignmentId), executor);
    expect("executor evidence reloads exactly", reloaded.loadExecutionEvidenceById(executor.assignment.assignmentId, executorEvidence.evidenceId), executorEvidence);
    expect("verifier assignment reloads exactly", reloaded.loadFrozenAssignment(verifier.assignment.assignmentId), verifier);
    expect(
      "verifier relationship retains exact executor linkage",
      reloaded.loadAssignmentRecord(verifier.assignment.assignmentId).relationship,
      {
        verifiesAssignmentId: executor.assignment.assignmentId,
        verifiesExecutionEvidenceId: executorEvidence.evidenceId,
      },
    );
    expect(
      "typed verifier execution evidence locator reloads exactly",
      reloaded.loadExecutionEvidenceById(
        verifierExecutionEvidenceLocator.assignmentId,
        verifierExecutionEvidenceLocator.evidenceId,
      ),
      verifierEvidence,
    );
    expect(
      "typed verification decision locator reloads exactly",
      reloaded.findVerificationDecisionById(verificationDecisionLocator.verificationDecisionId),
      decision,
    );
    expect("decision locator retains exact verifier assignment", verificationDecisionLocator.verifierAssignmentId, verifier.assignment.assignmentId);
    expect("decision links exact verifier evidence", decision.verifierExecutionEvidenceId, verifierEvidence.evidenceId);
    expect("decision links exact executor assignment", decision.verifiedExecutorAssignmentId, executor.assignment.assignmentId);
    expect("decision links exact executor evidence", decision.verifiedExecutorExecutionEvidenceId, executorEvidence.evidenceId);
    expect("missing unrelated execution evidence remains absent", reloaded.loadExecutionEvidence("publication-batch-3-unrelated"), []);
    expect("missing unrelated verification decision remains absent", reloaded.findVerificationDecisionById("vdec-publication-batch-3-unrelated"), null);
  } catch (error) {
    failure = error;
  } finally {
    rmSync(storeRoot, { recursive: true, force: true });
    rmSync(repositoryRoot, { recursive: true, force: true });
  }
  expectFalse("publication Batch 3 store root cleanup succeeds", existsSync(storeRoot));
  expectFalse("publication Batch 3 repository root cleanup succeeds", existsSync(repositoryRoot));
  if (failure) throw failure;
}
