import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { InteractiveCodexGateway } from "../interactive-codex-gateway.js";
import { FileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
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
  commitParent: string;
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
export function createDisposableGitHarness(): DisposableGitHarness {
  const root = mkdtempSync(join(tmpdir(), "orchestra-gateway-fixture-"));
  const repository = join(root, "work");
  const remote = join(root, "origin.git");
  mkdirSync(repository, { recursive: true });
  mkdirSync(remote, { recursive: true });
  write(repository, CANDIDATE_PATH, "tracked gateway scope\n");
  write(repository, PROTECTED_PATH, "protected baseline\n");
  git(repository, ["init", "-b", "frontend-rebuild"]);
  git(repository, ["config", "user.email", "orchestra-gateway@example.invalid"]);
  git(repository, ["config", "user.name", "Orchestra Gateway Fixture"]);
  git(repository, ["add", CANDIDATE_PATH, PROTECTED_PATH]);
  git(repository, ["commit", "-m", "fixture: initialize gateway scope"]);
  git(remote, ["init", "--bare"]);
  git(repository, ["remote", "add", "origin", remote]);
  git(repository, ["push", "--set-upstream", "origin", "frontend-rebuild"]);
  const baselineTip = git(repository, ["rev-parse", "HEAD"]);

  const fixture: DisposableGitHarness = {
    repository: resolve(repository),
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
      const [ahead = 0, behind = 0] = git(repository, [
        "rev-list", "--left-right", "--count", "HEAD...@{upstream}",
      ]).split(/\s+/).map(Number);
      return {
        localTip: git(repository, ["rev-parse", "HEAD"]),
        remoteTip: git(repository, ["rev-parse", "@{upstream}"]),
        branch,
        upstream,
        stagedPaths: stagedPaths(fixture.repository),
        commitParent: git(repository, ["rev-parse", "HEAD^"]),
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
  section("Interactive Codex Gateway governance");
  proveGitHarness();
  const fixture = createDisposableGitHarness();
  try {
    const repository = resolve(git(fixture.repository, ["rev-parse", "--show-toplevel"]));
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

export type InteractiveCodexGatewayTestSelection = "baseline" | "publication-contract";
export type InteractiveCodexGatewayTestRunner = () => Promise<void>;

/** Selects independently invokable test runners without coupling publication smoke to the baseline. */
export function selectInteractiveCodexGatewayTestRunner(
  selection: InteractiveCodexGatewayTestSelection,
): InteractiveCodexGatewayTestRunner {
  return selection === "baseline"
    ? runInteractiveCodexGatewayTests
    : runInteractiveCodexGatewayPublicationContractTests;
}

/** Test-architecture smoke proof only; intentionally contains no publication behavior. */
export async function runInteractiveCodexGatewayPublicationContractTests(): Promise<void> {
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
