import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import type { FrozenAssignment } from "../assignment.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import {
  ACTIVE_EXECUTION_PROVIDER_ID,
  resolveActiveExecutionProvider,
  routeGovernedVerifierAssignment,
} from "../engineering-store/route-verifier.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { CursorExecutionProvider } from "../providers/cursor/cursor-provider.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-verifier-routing-"));
}

function git(repoPath: string, args: string[]): string {
  return execFileSync("git", ["-C", repoPath, "-c", "commit.gpgsign=false", ...args], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();
}

function markForgotIdentifierRepository(repositoryPath: string): void {
  mkdirSync(join(repositoryPath, "artifacts", "api-server", "src", "orchestra"), { recursive: true });
  mkdirSync(join(repositoryPath, "playbook", "design"), { recursive: true });
}

class RecordingMock extends MockExecutionProvider {
  creates = 0;
  submitted: FrozenAssignment | null = null;
  submittedPrompt: string | null = null;

  constructor(behavior: ConstructorParameters<typeof MockExecutionProvider>[0] = {}) {
    super({ ...behavior, providerId: behavior.providerId ?? CURSOR_PROVIDER_ID });
  }

  override async createSession(target: Parameters<MockExecutionProvider["createSession"]>[0]) {
    this.creates += 1;
    return super.createSession(target);
  }

  override async submitAssignment(
    session: Parameters<MockExecutionProvider["submitAssignment"]>[0],
    assignment: FrozenAssignment,
  ) {
    this.submitted = assignment;
    const { renderAssignmentPrompt } = await import("../provider-contract.js");
    this.submittedPrompt = renderAssignmentPrompt(assignment.assignment, assignment.assignmentHash);
    return super.submitAssignment(session, assignment);
  }
}

async function persistExecuted(assignmentId: string, provider: MockExecutionProvider = new RecordingMock()) {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(fixture.assignment);
  const dispatched = await dispatchFrozenAssignment({ store, provider, assignmentId });
  return { fixture, store, dispatched };
}

async function authorizeVerifier(assignmentId: string) {
  const executed = await persistExecuted(assignmentId);
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: executed.store,
    executorAssignmentId: assignmentId,
    executionEvidenceId: executed.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  return { ...executed, authorized };
}

export async function runVerifierRoutingTests(): Promise<void> {
  section("verifier routing — active provider and programmatic delivery");
  const mock = new RecordingMock({ resultText: "VERIFIED PASS APPROVED" });
  const happy = await persistExecuted("vrf-route-ok", mock);
  const createsAfterExecutor = mock.creates;
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-route-ok",
    executionEvidenceId: happy.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const routed = await routeGovernedVerifierAssignment({
    store: happy.store,
    verifierAssignmentId: verifierId,
    provider: mock,
  });
  expect("active provider id constant", ACTIVE_EXECUTION_PROVIDER_ID, CURSOR_PROVIDER_ID);
  expectTrue("resolved active provider is cursor", resolveActiveExecutionProvider().providerId === CURSOR_PROVIDER_ID);
  expectTrue("governed verifier routed", routed.dispatched);
  expectFalse("routing not refused", routed.refused);
  expectTrue("routed through active provider id", routed.routedThroughActiveProvider);
  expect("routing provider id", routed.routingProviderId, CURSOR_PROVIDER_ID);
  expect("exact frozen verifier hash delivered", mock.submitted?.assignmentHash, authorized.verifierAssignmentHash);
  expect("exact frozen verifier id delivered", mock.submitted?.assignment.assignmentId, verifierId);
  expect("verifier role delivered", mock.submitted?.assignment.role, "verifier");
  expectTrue("assignment delivered through provider API", Boolean(mock.submittedPrompt?.includes(verifierId)));
  expectTrue("no manual courier: prompt contains assignment hash", Boolean(mock.submittedPrompt?.includes(authorized.verifierAssignmentHash ?? "")));
  expect("authorization preserved", routed.authorization?.assignmentId, verifierId);
  expect("executor relationship preserved", routed.executorAssignmentId, "vrf-route-ok");
  expect(
    "executor evidence relationship preserved",
    routed.executorExecutionEvidenceId,
    happy.dispatched.evidence.evidenceId,
  );
  expectTrue("verifier evidence persisted", Boolean(routed.evidence));
  expect("evidence assignment id", routed.evidence?.assignmentId, verifierId);
  expect("evidence assignment hash", routed.evidence?.assignmentHash, authorized.verifierAssignmentHash);
  expectTrue("normalized events captured", (routed.result?.normalizedEvents.length ?? 0) > 0);
  expectTrue("independent git evidence captured", Boolean(routed.result?.preRunGitEvidence?.head));
  expect("provider prose nonauthoritative", routed.evidence?.sources.providerText, "untrusted_prose");
  expectFalse("no semantic verification decision field", JSON.stringify(routed.evidence).includes('"verificationDecision"'));
  expectFalse("no automatic commit", Boolean(routed.result?.commitOccurred));
  expectFalse("no automatic push", Boolean(routed.result?.pushIndependentlyEvidenced));
  expect("provider session started once for verifier", mock.creates, createsAfterExecutor + 1);

  const duplicate = await routeGovernedVerifierAssignment({
    store: happy.store,
    verifierAssignmentId: verifierId,
    provider: mock,
  });
  expectTrue("duplicate routing reuses evidence", duplicate.duplicateEvidenceReused);
  expect("duplicate does not rerun provider", mock.creates, createsAfterExecutor + 1);

  const restarted = createFileEngineeringStore(happy.store.storeRoot);
  const reEvidence = restarted.loadLatestExecutionEvidence(verifierId);
  const reReceipt = restarted.findValidVerifierAuthorizationReceipt(
    verifierId,
    authorized.verifierAssignmentHash ?? "",
  );
  expectTrue("restart reconstruction: authorization receipt", Boolean(reReceipt));
  expect("restart reconstruction: evidence hash", reEvidence?.evidenceHash, routed.evidence?.evidenceHash);
  expect("restart reconstruction: provider correlator", reEvidence?.result.providerSessionId, routed.result?.providerSessionId);

  section("verifier routing — F.I. Forgot read-only vs modifying refusal");
  const forgotFixture = createDisposableExecutionFixture({ assignmentId: "vrf-route-forgot-exec" });
  markForgotIdentifierRepository(forgotFixture.repositoryPath);
  let modifyingForgotRefused = false;
  try {
    await runBoundedAssignment(new RecordingMock(), forgotFixture.assignment, { projectHooks: false });
  } catch (error) {
    modifyingForgotRefused =
      error instanceof Error &&
      error.message.includes("Refusing to run a modifying assignment against the F.I. Forgot repository");
  }
  expectTrue("modifying F.I. Forgot executor still refused", modifyingForgotRefused);

  let cursorForgotSessionRefused = false;
  try {
    await new CursorExecutionProvider().createSession({
      repositoryPath: forgotFixture.repositoryPath,
      branch: forgotFixture.branch,
      startingHead: forgotFixture.startingHead,
    });
  } catch (error) {
    cursorForgotSessionRefused =
      error instanceof Error &&
      error.message.includes("Refusing to dispatch a Cursor execution session against the F.I. Forgot repository");
  }
  expectTrue("cursor session refused without governed read-only verifier flag", cursorForgotSessionRefused);

  const forgotExec = await persistExecuted("vrf-route-forgot-exec", new RecordingMock());
  markForgotIdentifierRepository(forgotExec.fixture.repositoryPath);
  rmSync(join(forgotExec.fixture.repositoryPath, ".cursor"), { recursive: true, force: true });
  const forgotAuth = authorizeAndFreezeVerifierAssignment({
    store: forgotExec.store,
    executorAssignmentId: "vrf-route-forgot-exec",
    executionEvidenceId: forgotExec.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const forgotVerifierId = forgotAuth.persisted?.frozen.assignment.assignmentId ?? "";
  const forgotMock = new RecordingMock({ resultText: "read-only inspection complete" });
  const forgotRouted = await routeGovernedVerifierAssignment({
    store: forgotExec.store,
    verifierAssignmentId: forgotVerifierId,
    provider: forgotMock,
  });
  expectTrue("governed read-only verifier routed on F.I. Forgot marker repo", forgotRouted.dispatched);
  expectFalse("F.I. Forgot verifier routing not refused", forgotRouted.refused);
  expect("read-only verifier delivered", forgotMock.submitted?.assignment.allowedPaths, []);
  expectFalse(
    "F.I. Forgot verifier did not install new hooks.json",
    existsSync(join(forgotExec.fixture.repositoryPath, ".cursor", "hooks.json")),
  );

  section("verifier routing — provider-neutral hook projection");
  const codexMock = new MockExecutionProvider({ providerId: "codex", resultText: "codex read-only" });
  const codexExec = await persistExecuted("vrf-route-codex", codexMock);
  const codexAuth = authorizeAndFreezeVerifierAssignment({
    store: codexExec.store,
    executorAssignmentId: "vrf-route-codex",
    executionEvidenceId: codexExec.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const codexVerifierId = codexAuth.persisted?.frozen.assignment.assignmentId ?? "";
  const hooksBefore = existsSync(join(codexExec.fixture.repositoryPath, ".cursor", "hooks.json"));
  await routeGovernedVerifierAssignment({
    store: codexExec.store,
    verifierAssignmentId: codexVerifierId,
    provider: codexMock,
  });
  expectTrue("codex routing regression: fixture still has hooks from setup", hooksBefore);
  expectTrue(
    "codex routing regression: hooks.json unchanged count",
    existsSync(join(codexExec.fixture.repositoryPath, ".cursor", "hooks.json")) === hooksBefore,
  );

  section("verifier routing — eligibility refusals and preflight");
  expect(
    "non-verifier refused through routing",
    (
      await routeGovernedVerifierAssignment({
        store: happy.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "vrf-route-ok",
      })
    ).reason,
    "verifier_role_required",
  );

  const policyBase = await persistExecuted("vrf-route-policy");
  const writeCapable = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "route-write-capable-verifier",
    role: "verifier",
    allowedPaths: ["allowed.txt"],
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(writeCapable, {
    relationship: {
      verifiesAssignmentId: "vrf-route-policy",
      verifiesExecutionEvidenceId: policyBase.dispatched.evidence.evidenceId,
    },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "route-write-capable-verifier",
    assignmentHash: writeCapable.assignmentHash,
    executorAssignmentId: "vrf-route-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "write capable verifier refused",
    (
      await routeGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "route-write-capable-verifier",
      })
    ).reason,
    "write_capable_verifier_refused",
  );

  const branchCase = await authorizeVerifier("vrf-route-branch");
  const branchVerifierId = branchCase.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  git(branchCase.fixture.repositoryPath, ["checkout", "-b", "other-branch"]);
  const branchMock = new RecordingMock();
  const branchRefused = await routeGovernedVerifierAssignment({
    store: branchCase.store,
    provider: branchMock,
    verifierAssignmentId: branchVerifierId,
  });
  expect("baseline branch mismatch refused", branchRefused.reason, "current_branch_mismatch");
  expect("preflight branch mismatch provider count zero", branchMock.creates, 0);
  git(branchCase.fixture.repositoryPath, ["checkout", "fixture-main"]);

  const headCase = await authorizeVerifier("vrf-route-head");
  const headVerifierId = headCase.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  writeFileSync(join(headCase.fixture.repositoryPath, "allowed.txt"), "allowed-changed\n");
  git(headCase.fixture.repositoryPath, ["add", "allowed.txt"]);
  git(headCase.fixture.repositoryPath, ["commit", "-m", "head drift"]);
  const headMock = new RecordingMock();
  const headRefused = await routeGovernedVerifierAssignment({
    store: headCase.store,
    provider: headMock,
    verifierAssignmentId: headVerifierId,
  });
  expect("baseline HEAD mismatch refused", headRefused.reason, "current_head_mismatch");
  expect("preflight HEAD mismatch provider count zero", headMock.creates, 0);

  section("verifier routing — provider failure and unauthorized");
  const failCase = await authorizeVerifier("vrf-route-fail");
  const failVerifierId = failCase.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const failed = await routeGovernedVerifierAssignment({
    store: failCase.store,
    provider: new MockExecutionProvider({ failOnCreate: true, providerId: CURSOR_PROVIDER_ID }),
    verifierAssignmentId: failVerifierId,
  });
  expectTrue("provider failure persisted evidence", Boolean(failed.evidence));
  expect("provider failure technical verdict", failed.result?.executionVerdict, "provider_failed");
  expectFalse("provider failure is not semantic FAIL", failed.result?.executionVerdict === ("FAIL" as never));

  const homemade = await persistExecuted("vrf-route-homemade");
  const homemadeVerifier = createAssignment({
    ...homemade.fixture.assignment.assignment,
    assignmentId: "route-homemade-verifier",
    role: "verifier",
    allowedPaths: [],
    createdAt: homemade.fixture.assignment.assignment.createdAt,
  });
  homemade.store.persistFrozenAssignment(homemadeVerifier, {
    relationship: {
      verifiesAssignmentId: "vrf-route-homemade",
      verifiesExecutionEvidenceId: homemade.dispatched.evidence.evidenceId,
    },
  });
  const unauthorized = await routeGovernedVerifierAssignment({
    store: homemade.store,
    provider: new RecordingMock(),
    verifierAssignmentId: "route-homemade-verifier",
  });
  expect("unauthorized verifier refused", unauthorized.reason, "governed_authorization_required");
  expectFalse("unauthorized did not start provider", unauthorized.providerStarted);

  section("verifier routing — no correction or continuation");
  expectFalse(
    "no correction assignment generated",
    happy.store.listAssignmentIds().some((id) => {
      const rel = happy.store.loadAssignmentRecord(id).relationship.correctionOfAssignmentId;
      return Boolean(rel);
    }),
  );
  expect("only executor and verifier exist after routing", happy.store.listAssignmentIds().length, 2);
  expectFalse("no next requirement id in evidence", JSON.stringify(routed.evidence).includes('"nextRequirement"'));

  const secretScan = JSON.stringify(routed.evidence);
  expectFalse("no Cursor API key in evidence", secretScan.includes("CURSOR_API_KEY"));
  expectTrue("programmatic delivery: provider session correlator captured", Boolean(routed.result?.providerSessionId));
  expectFalse("manual result copy dependency inside layer", secretScan.includes("pastedVerifierText"));
}
