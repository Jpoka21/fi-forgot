import { appendFileSync, existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDisposableExecutionFixture } from "../fixture.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function isolatedMock(onSubmit: NonNullable<ConstructorParameters<typeof MockExecutionProvider>[0]["onSubmit"]>) {
  return new MockExecutionProvider({ providerId: "codex", executionMode: "governed-workspace-write", onSubmit });
}

export async function runIsolatedWorkspaceTests(): Promise<void> {
  section("governed Codex isolated workspace");

  const authorized = createDisposableExecutionFixture({ assignmentId: "isolated-authorized" });
  const protectedBefore = readFileSync(authorized.protectedPath, "utf8");
  let providerCwd = "";
  const authorizedResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      providerCwd = session.repositoryPath;
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "ISOLATED_AUTHORIZED\n");
    }),
    authorized.assignment,
    { projectHooks: false },
  );
  expectFalse("provider cwd is not governed repository", providerCwd === authorized.repositoryPath);
  expect("isolated starts exact HEAD", authorizedResult.isolationEvidence?.startingHead, authorized.startingHead);
  expectTrue("authorized candidate applied", readFileSync(authorized.allowedPath, "utf8").includes("ISOLATED_AUTHORIZED"));
  expect("authorized application succeeded", authorizedResult.isolationEvidence?.applicationSucceeded, true);
  expect("authorized application remains unstaged", authorizedResult.postRunGitEvidence?.stagedPaths, []);
  expect("authorized verdict", authorizedResult.executionVerdict, "completed_within_policy");
  expect("protected dirty state preserved", readFileSync(authorized.protectedPath, "utf8"), protectedBefore);
  expect("isolated cleanup succeeds", authorizedResult.isolationEvidence?.cleanupStatus, "completed");

  const unauthorized = createDisposableExecutionFixture({ assignmentId: "isolated-unauthorized" });
  const allowedBefore = readFileSync(unauthorized.allowedPath, "utf8");
  const unauthorizedResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "MIXED_ALLOWED\n");
      writeFileSync(join(session.repositoryPath, "unauthorized.txt"), "MIXED_UNAUTHORIZED\n");
    }),
    unauthorized.assignment,
    { projectHooks: false },
  );
  expectTrue("mixed candidate records allowed", unauthorizedResult.isolationEvidence?.authorizedCandidatePaths.includes("allowed.txt") === true);
  expectTrue("mixed candidate records unauthorized", unauthorizedResult.isolationEvidence?.unauthorizedCandidatePaths.includes("unauthorized.txt") === true);
  expectFalse("mixed candidate application not attempted", unauthorizedResult.isolationEvidence?.applicationAttempted === true);
  expect("atomic refusal preserves governed allowed", readFileSync(unauthorized.allowedPath, "utf8"), allowedBefore);
  expectFalse("unauthorized file never enters governed repository", existsSync(join(unauthorized.repositoryPath, "unauthorized.txt")));
  expect("mixed verdict", unauthorizedResult.executionVerdict, "repository_state_violation");

  const protectedFixture = createDisposableExecutionFixture({ assignmentId: "isolated-protected" });
  const protectedBytes = readFileSync(protectedFixture.protectedPath);
  const protectedResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "WITH_PROTECTED\n");
      appendFileSync(join(session.repositoryPath, "protected.txt"), "ISOLATED_PROTECTED_ATTACK\n");
    }),
    protectedFixture.assignment,
    { projectHooks: false },
  );
  expectTrue("protected candidate evidenced", protectedResult.isolationEvidence?.protectedCandidatePaths.includes("protected.txt") === true);
  expectFalse("protected candidate application not attempted", protectedResult.isolationEvidence?.applicationAttempted === true);
  expect("governed protected byte exact", readFileSync(protectedFixture.protectedPath), protectedBytes);
  expectFalse("mixed authorized withheld", readFileSync(protectedFixture.allowedPath, "utf8").includes("WITH_PROTECTED"));
  expect("protected verdict", protectedResult.executionVerdict, "repository_state_violation");

  const drift = createDisposableExecutionFixture({ assignmentId: "isolated-drift" });
  const driftBefore = readFileSync(drift.allowedPath, "utf8");
  const driftResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "CANDIDATE\n");
      appendFileSync(drift.allowedPath, "EXTERNAL_DRIFT\n");
    }),
    drift.assignment,
    { projectHooks: false },
  );
  expectTrue("governed drift refuses application", driftResult.unexpectedChanges.includes("governed_repository_changed_before_application"));
  expectFalse("candidate not added over drift", readFileSync(drift.allowedPath, "utf8").includes("CANDIDATE"));
  expectTrue("external drift remains evidence", readFileSync(drift.allowedPath, "utf8").startsWith(driftBefore));

  const branchDrift = createDisposableExecutionFixture({ assignmentId: "isolated-branch-drift" });
  const branchResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "BRANCH_CANDIDATE\n");
      execFileSync("git", ["-C", branchDrift.repositoryPath, "checkout", "-b", "unexpected-branch"], { windowsHide: true });
    }),
    branchDrift.assignment,
    { projectHooks: false },
  );
  expectTrue("branch drift before application refused", branchResult.unexpectedChanges.includes("governed_repository_changed_before_application"));
  expectFalse("branch drift withholds candidate", readFileSync(branchDrift.allowedPath, "utf8").includes("BRANCH_CANDIDATE"));

  const headDrift = createDisposableExecutionFixture({ assignmentId: "isolated-head-drift" });
  const headResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "HEAD_CANDIDATE\n");
      appendFileSync(headDrift.allowedPath, "EXTERNAL_COMMIT\n");
      execFileSync("git", ["-C", headDrift.repositoryPath, "add", "allowed.txt"], { windowsHide: true });
      execFileSync("git", ["-C", headDrift.repositoryPath, "-c", "commit.gpgsign=false", "commit", "-m", "external drift"], { windowsHide: true });
    }),
    headDrift.assignment,
    { projectHooks: false },
  );
  expectTrue("HEAD drift before application refused", headResult.unexpectedChanges.includes("governed_repository_changed_before_application"));
  expectFalse("HEAD drift withholds candidate", readFileSync(headDrift.allowedPath, "utf8").includes("HEAD_CANDIDATE"));

  const protectedDelete = createDisposableExecutionFixture({ assignmentId: "isolated-protected-delete" });
  const protectedDeleteBytes = readFileSync(protectedDelete.protectedPath);
  const deleteResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      rmSync(join(session.repositoryPath, "protected.txt"));
    }),
    protectedDelete.assignment,
    { projectHooks: false },
  );
  expectTrue("protected deletion candidate detected", deleteResult.isolationEvidence?.protectedCandidatePaths.includes("protected.txt") === true);
  expect("protected deletion withheld byte exact", readFileSync(protectedDelete.protectedPath), protectedDeleteBytes);

  const renameInto = createDisposableExecutionFixture({ assignmentId: "isolated-rename-into-protected" });
  const renameIntoProtected = readFileSync(renameInto.protectedPath);
  const renameIntoResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      rmSync(join(session.repositoryPath, "protected.txt"));
      renameSync(join(session.repositoryPath, "allowed.txt"), join(session.repositoryPath, "protected.txt"));
    }),
    renameInto.assignment,
    { projectHooks: false },
  );
  expectTrue("rename into protected detected", renameIntoResult.isolationEvidence?.protectedCandidatePaths.includes("protected.txt") === true);
  expect("rename into protected withheld", readFileSync(renameInto.protectedPath), renameIntoProtected);

  const renameOut = createDisposableExecutionFixture({ assignmentId: "isolated-rename-out-protected" });
  const renameOutProtected = readFileSync(renameOut.protectedPath);
  const renameOutResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      rmSync(join(session.repositoryPath, "allowed.txt"));
      renameSync(join(session.repositoryPath, "protected.txt"), join(session.repositoryPath, "allowed.txt"));
    }),
    renameOut.assignment,
    { projectHooks: false },
  );
  expectTrue("rename out of protected detected", renameOutResult.isolationEvidence?.protectedCandidatePaths.includes("protected.txt") === true);
  expect("rename out of protected withheld", readFileSync(renameOut.protectedPath), renameOutProtected);

  const applicationFailure = createDisposableExecutionFixture({ assignmentId: "isolated-application-failure" });
  appendFileSync(applicationFailure.allowedPath, "PREEXISTING_ALLOWED_DIRTY\n");
  const dirtyBefore = readFileSync(applicationFailure.allowedPath, "utf8");
  const failureResult = await runBoundedAssignment(
    isolatedMock((_assignment, session) => {
      writeFileSync(join(session.repositoryPath, "allowed.txt"), "candidate replacement\n");
    }),
    applicationFailure.assignment,
    { projectHooks: false },
  );
  expectTrue("application failure recorded", failureResult.unexpectedChanges.includes("candidate_application_failed"));
  expect("application failure preserves governed dirty file", readFileSync(applicationFailure.allowedPath, "utf8"), dirtyBefore);

  const persisted = createDisposableExecutionFixture({ assignmentId: "isolated-persist-cleanup" });
  const store = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "isolated-store-")));
  store.persistFrozenAssignment(persisted.assignment);
  const dispatched = await dispatchFrozenAssignment({
    store,
    assignmentId: persisted.assignment.assignment.assignmentId,
    provider: isolatedMock((_assignment, session) => {
      appendFileSync(join(session.repositoryPath, "allowed.txt"), "PERSISTED_AUTHORIZED\n");
    }),
    projectHooks: false,
  });
  expect("persisted isolation evidence records cleanup boundary", dispatched.evidence.result.isolationEvidence?.cleanupStatus, "pending");
  expectFalse("workspace cleaned only after evidence persisted", existsSync(dispatched.result.isolationEvidence!.workspacePath));
  expectTrue("persisted authorized application visible", readFileSync(persisted.allowedPath, "utf8").includes("PERSISTED_AUTHORIZED"));
}
