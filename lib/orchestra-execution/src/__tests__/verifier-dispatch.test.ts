import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import type { FrozenAssignment } from "../assignment.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { buildVerifierAuthorizationReceipt } from "../engineering-store/authorization-receipt.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { dispatchGovernedVerifierAssignment } from "../engineering-store/dispatch-verifier.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-verifier-dispatch-"));
}

function git(repoPath: string, args: string[]): string {
  return execFileSync("git", ["-C", repoPath, "-c", "commit.gpgsign=false", ...args], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();
}

class RecordingMock extends MockExecutionProvider {
  creates = 0;
  submitted: FrozenAssignment | null = null;

  override async createSession(target: Parameters<MockExecutionProvider["createSession"]>[0]) {
    this.creates += 1;
    return super.createSession(target);
  }

  override async submitAssignment(
    session: Parameters<MockExecutionProvider["submitAssignment"]>[0],
    assignment: FrozenAssignment,
  ) {
    this.submitted = assignment;
    return super.submitAssignment(session, assignment);
  }
}

async function persistExecuted(assignmentId: string, provider: MockExecutionProvider = new MockExecutionProvider()) {
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

export async function runVerifierDispatchTests(): Promise<void> {
  section("verifier dispatch — governed happy path");
  const mock = new RecordingMock({ resultText: "I conclude VERIFIED PASS APPROVED CLOSED" });
  const happy = await persistExecuted("vrf-disp-ok", mock);
  const createsAfterExecutor = mock.creates;
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-disp-ok",
    executionEvidenceId: happy.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  expectTrue("authorization receipt written by governed path", Boolean(authorized.authorization));
  expect(
    "receipt bound to verifier id",
    authorized.authorization?.assignmentId,
    authorized.persisted?.frozen.assignment.assignmentId,
  );
  expect(
    "receipt bound to verifier hash",
    authorized.authorization?.assignmentHash,
    authorized.persisted?.frozen.assignmentHash,
  );
  expectFalse(
    "persistFrozenAssignment alone did not write a receipt for the executor",
    existsSync(join(happy.store.storeRoot, "assignments", "vrf-disp-ok", "governed-authorization.ndjson")),
  );

  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const dispatched = await dispatchGovernedVerifierAssignment({
    store: happy.store,
    provider: mock,
    verifierAssignmentId: verifierId,
  });
  expectTrue("governed verifier dispatched", dispatched.dispatched);
  expectFalse("eligibility not refused", dispatched.refused);
  expect("provider received exact verifier hash", mock.submitted?.assignmentHash, authorized.verifierAssignmentHash);
  expect("provider received verifier role", mock.submitted?.assignment.role, "verifier");
  expect("empty write scope executed", mock.submitted?.assignment.allowedPaths, []);
  expect("commit false on submitted assignment", mock.submitted?.assignment.commitAuthorization, false);
  expect("push false on submitted assignment", mock.submitted?.assignment.pushAuthorization, false);
  expect("requireNoPush true on submitted assignment", mock.submitted?.assignment.requireNoPush, true);
  expectTrue("verifier evidence persisted", Boolean(dispatched.evidence));
  expect("evidence assignment id is verifier", dispatched.evidence?.assignmentId, verifierId);
  expect("evidence assignment hash matches verifier", dispatched.evidence?.assignmentHash, authorized.verifierAssignmentHash);
  expect("executor relationship preserved", dispatched.executorAssignmentId, "vrf-disp-ok");
  expect(
    "selected executor evidence preserved",
    dispatched.executorExecutionEvidenceId,
    happy.dispatched.evidence.evidenceId,
  );
  expect("provider text remains untrusted", dispatched.evidence?.sources.providerText, "untrusted_prose");
  expectTrue("normalized events captured", (dispatched.result?.normalizedEvents.length ?? 0) > 0);
  expectTrue("independent pre-run git captured", Boolean(dispatched.result?.preRunGitEvidence?.head));
  expectTrue("independent post-run git captured", Boolean(dispatched.result?.postRunGitEvidence?.head));
  expect("verification posture pending", dispatched.evidence?.verificationPosture, "pending");
  expect("executor still pending", happy.store.getVerificationPosture("vrf-disp-ok"), "pending");
  expect("verifier still pending", happy.store.getVerificationPosture(verifierId), "pending");
  expectFalse("no automatic commit", Boolean(dispatched.result?.commitOccurred));
  expectFalse("no automatic push", Boolean(dispatched.result?.pushIndependentlyEvidenced));
  expect("provider create called once for verifier", mock.creates, createsAfterExecutor + 1);
  expectTrue(
    "untrusted prose may contain PASS words without becoming a decision",
    (dispatched.result?.providerFinalResultText ?? "").includes("PASS"),
  );
  expectFalse(
    "no correction assignment generated",
    happy.store.listAssignmentIds().some((id) => {
      const rel = happy.store.loadAssignmentRecord(id).relationship.correctionOfAssignmentId;
      return Boolean(rel);
    }),
  );
  expect("only executor and verifier exist", happy.store.listAssignmentIds().length, 2);

  const duplicate = await dispatchGovernedVerifierAssignment({
    store: happy.store,
    provider: mock,
    verifierAssignmentId: verifierId,
  });
  expectTrue("duplicate dispatch reuses evidence", duplicate.duplicateEvidenceReused);
  expect("duplicate evidence id unchanged", duplicate.evidence?.evidenceId, dispatched.evidence?.evidenceId);
  expect("duplicate does not create another session", mock.creates, createsAfterExecutor + 1);

  const restarted = createFileEngineeringStore(happy.store.storeRoot);
  const reVerifier = restarted.loadAssignmentRecord(verifierId);
  const reReceipt = restarted.findValidVerifierAuthorizationReceipt(verifierId, reVerifier.frozen.assignmentHash);
  const reEvidence = restarted.loadLatestExecutionEvidence(verifierId);
  expect("restart verifier role", reVerifier.frozen.assignment.role, "verifier");
  expect("restart verifiesAssignmentId", reVerifier.relationship.verifiesAssignmentId, "vrf-disp-ok");
  expect(
    "restart verifiesExecutionEvidenceId",
    reVerifier.relationship.verifiesExecutionEvidenceId,
    happy.dispatched.evidence.evidenceId,
  );
  expectTrue("restart authorization receipt present", Boolean(reReceipt));
  expect("restart receipt hash", reReceipt?.assignmentHash, reVerifier.frozen.assignmentHash);
  expect("restart evidence hash", reEvidence?.evidenceHash, dispatched.evidence?.evidenceHash);
  expect("restart technical verdict preserved", reEvidence?.result.executionVerdict, dispatched.result?.executionVerdict);
  expect("restart provider correlator", reEvidence?.result.providerSessionId, dispatched.result?.providerSessionId);
  expect("restart executor pending", restarted.getVerificationPosture("vrf-disp-ok"), "pending");

  section("verifier dispatch — eligibility refusals");
  expect(
    "unknown verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: happy.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "missing-verifier",
      })
    ).reason,
    "verifier_not_found",
  );
  expect(
    "non-verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: happy.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "vrf-disp-ok",
      })
    ).reason,
    "verifier_role_required",
  );

  const unknownExec = await persistExecuted("vrf-disp-unknown-exec");
  const unknownAuth = authorizeAndFreezeVerifierAssignment({
    store: unknownExec.store,
    executorAssignmentId: "vrf-disp-unknown-exec",
    executionEvidenceId: unknownExec.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const unknownVerifierId = unknownAuth.persisted?.frozen.assignment.assignmentId ?? "";
  const unknownRecordPath = join(
    unknownExec.store.storeRoot,
    "assignments",
    unknownVerifierId,
    "assignment.json",
  );
  const unknownOriginal = readFileSync(unknownRecordPath, "utf8");
  writeFileSync(unknownRecordPath, unknownOriginal.replace(unknownAuth.verifierAssignmentHash ?? "", "0".repeat(64)));
  expect(
    "tampered verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: unknownExec.store,
        provider: new RecordingMock(),
        verifierAssignmentId: unknownVerifierId,
      })
    ).reason,
    "verifier_corrupt",
  );
  writeFileSync(unknownRecordPath, unknownOriginal);

  const homemadeExec = await persistExecuted("vrf-disp-homemade");
  const homemade = createAssignment({
    ...homemadeExec.fixture.assignment.assignment,
    assignmentId: "homemade-verifier",
    role: "verifier",
    allowedPaths: ["allowed.txt"],
    commitAuthorization: true,
    pushAuthorization: true,
    requireNoPush: false,
    createdAt: homemadeExec.fixture.assignment.assignment.createdAt,
  });
  homemadeExec.store.persistFrozenAssignment(homemade, {
    relationship: {
      verifiesAssignmentId: "vrf-disp-homemade",
      verifiesExecutionEvidenceId: homemadeExec.dispatched.evidence.evidenceId,
    },
  });
  const homemadeDispatch = await dispatchGovernedVerifierAssignment({
    store: homemadeExec.store,
    provider: new RecordingMock(),
    verifierAssignmentId: "homemade-verifier",
  });
  expect("homemade verifier without receipt refused", homemadeDispatch.reason, "governed_authorization_required");
  expectFalse("homemade attack did not start a provider", homemadeDispatch.providerStarted);
  expect("homemade left no verifier evidence", homemadeExec.store.loadLatestExecutionEvidence("homemade-verifier"), null);
  let lowLevelVerifierDispatchBlocked = false;
  try {
    await dispatchFrozenAssignment({
      store: homemadeExec.store,
      provider: new RecordingMock(),
      assignmentId: "homemade-verifier",
    });
  } catch {
    lowLevelVerifierDispatchBlocked = true;
  }
  expectTrue("low-level dispatchFrozenAssignment cannot dispatch a verifier", lowLevelVerifierDispatchBlocked);

  const missingAuth = await persistExecuted("vrf-disp-missing-auth");
  const preparedMissing = authorizeAndFreezeVerifierAssignment({
    store: missingAuth.store,
    executorAssignmentId: "vrf-disp-missing-auth",
    executionEvidenceId: missingAuth.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const missingAuthId = preparedMissing.persisted?.frozen.assignment.assignmentId ?? "";
  writeFileSync(join(missingAuth.store.storeRoot, "assignments", missingAuthId, "governed-authorization.ndjson"), "");
  expect(
    "missing authorization provenance refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: missingAuth.store,
        provider: new RecordingMock(),
        verifierAssignmentId: missingAuthId,
      })
    ).reason,
    "governed_authorization_required",
  );

  const hashMismatch = await authorizeVerifier("vrf-disp-hash-mismatch");
  const hashMismatchId = hashMismatch.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const forgedHashReceipt = buildVerifierAuthorizationReceipt({
    assignmentId: hashMismatchId,
    assignmentHash: "1".repeat(64),
    executorAssignmentId: "vrf-disp-hash-mismatch",
    executionEvidenceId: hashMismatch.dispatched.evidence.evidenceId,
  });
  writeFileSync(
    join(hashMismatch.store.storeRoot, "assignments", hashMismatchId, "governed-authorization.ndjson"),
    `${JSON.stringify(forgedHashReceipt)}\n`,
  );
  expect(
    "authorization provenance hash mismatch refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: hashMismatch.store,
        provider: new RecordingMock(),
        verifierAssignmentId: hashMismatchId,
      })
    ).reason,
    "authorization_assignment_hash_mismatch",
  );

  const idMismatch = await authorizeVerifier("vrf-disp-id-mismatch");
  const idMismatchId = idMismatch.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const forgedIdReceipt = buildVerifierAuthorizationReceipt({
    assignmentId: "other-verifier-id",
    assignmentHash: idMismatch.authorized.persisted?.frozen.assignmentHash ?? "",
    executorAssignmentId: "vrf-disp-id-mismatch",
    executionEvidenceId: idMismatch.dispatched.evidence.evidenceId,
  });
  writeFileSync(
    join(idMismatch.store.storeRoot, "assignments", idMismatchId, "governed-authorization.ndjson"),
    `${JSON.stringify(forgedIdReceipt)}\n`,
  );
  expect(
    "authorization provenance id mismatch refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: idMismatch.store,
        provider: new RecordingMock(),
        verifierAssignmentId: idMismatchId,
      })
    ).reason,
    "authorization_assignment_id_mismatch",
  );

  section("verifier dispatch — policy and relationship refusals");
  const policyBase = await persistExecuted("vrf-disp-policy");
  const writeCapable = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "write-capable-verifier",
    role: "verifier",
    allowedPaths: ["allowed.txt"],
    commitAuthorization: false,
    pushAuthorization: false,
    requireNoPush: true,
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(writeCapable, {
    relationship: {
      verifiesAssignmentId: "vrf-disp-policy",
      verifiesExecutionEvidenceId: policyBase.dispatched.evidence.evidenceId,
    },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "write-capable-verifier",
    assignmentHash: writeCapable.assignmentHash,
    executorAssignmentId: "vrf-disp-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "write capable verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "write-capable-verifier",
      })
    ).reason,
    "write_capable_verifier_refused",
  );

  const commitCapable = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "commit-capable-verifier",
    role: "verifier",
    allowedPaths: [],
    commitAuthorization: true,
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(commitCapable, {
    relationship: {
      verifiesAssignmentId: "vrf-disp-policy",
      verifiesExecutionEvidenceId: policyBase.dispatched.evidence.evidenceId,
    },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "commit-capable-verifier",
    assignmentHash: commitCapable.assignmentHash,
    executorAssignmentId: "vrf-disp-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "commit capable verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "commit-capable-verifier",
      })
    ).reason,
    "commit_authorization_forbidden",
  );

  const pushCapable = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "push-capable-verifier",
    role: "verifier",
    allowedPaths: [],
    pushAuthorization: true,
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(pushCapable, {
    relationship: {
      verifiesAssignmentId: "vrf-disp-policy",
      verifiesExecutionEvidenceId: policyBase.dispatched.evidence.evidenceId,
    },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "push-capable-verifier",
    assignmentHash: pushCapable.assignmentHash,
    executorAssignmentId: "vrf-disp-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "push capable verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "push-capable-verifier",
      })
    ).reason,
    "push_authorization_forbidden",
  );

  const pushRequiredFalse = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "push-required-false-verifier",
    role: "verifier",
    allowedPaths: [],
    requireNoPush: false,
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(pushRequiredFalse, {
    relationship: {
      verifiesAssignmentId: "vrf-disp-policy",
      verifiesExecutionEvidenceId: policyBase.dispatched.evidence.evidenceId,
    },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "push-required-false-verifier",
    assignmentHash: pushRequiredFalse.assignmentHash,
    executorAssignmentId: "vrf-disp-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "require no push false refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "push-required-false-verifier",
      })
    ).reason,
    "require_no_push_required",
  );

  const missingRel = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "missing-rel-verifier",
    role: "verifier",
    allowedPaths: [],
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(missingRel);
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "missing-rel-verifier",
    assignmentHash: missingRel.assignmentHash,
    executorAssignmentId: "vrf-disp-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "missing executor relationship refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "missing-rel-verifier",
      })
    ).reason,
    "verifies_assignment_id_required",
  );

  const missingEvidenceRel = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "missing-ev-rel-verifier",
    role: "verifier",
    allowedPaths: [],
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(missingEvidenceRel, {
    relationship: { verifiesAssignmentId: "vrf-disp-policy" },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "missing-ev-rel-verifier",
    assignmentHash: missingEvidenceRel.assignmentHash,
    executorAssignmentId: "vrf-disp-policy",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "missing evidence relationship refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new RecordingMock(),
        verifierAssignmentId: "missing-ev-rel-verifier",
      })
    ).reason,
    "verifies_execution_evidence_id_required",
  );

  const otherExec = await persistExecuted("vrf-disp-other-exec");
  const cross = await authorizeVerifier("vrf-disp-cross");
  const crossId = cross.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const crossPath = join(cross.store.storeRoot, "assignments", crossId, "assignment.json");
  const crossRecord = JSON.parse(readFileSync(crossPath, "utf8")) as {
    relationship: { verifiesAssignmentId: string; verifiesExecutionEvidenceId: string };
  };
  crossRecord.relationship.verifiesExecutionEvidenceId = otherExec.dispatched.evidence.evidenceId;
  writeFileSync(crossPath, `${JSON.stringify(crossRecord, null, 2)}\n`);
  expect(
    "cross executor evidence refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: cross.store,
        provider: new RecordingMock(),
        verifierAssignmentId: crossId,
      })
    ).reason,
    "executor_evidence_not_found",
  );

  const tamperedEv = await authorizeVerifier("vrf-disp-tamper-ev");
  const tamperedEvId = tamperedEv.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const evidencePath = join(
    tamperedEv.store.storeRoot,
    "executions",
    "vrf-disp-tamper-ev",
    `${tamperedEv.dispatched.evidence.evidenceId}.json`,
  );
  const evidenceOriginal = readFileSync(evidencePath, "utf8");
  writeFileSync(
    evidencePath,
    evidenceOriginal.replace(tamperedEv.dispatched.evidence.evidenceHash, "2".repeat(64)),
  );
  expect(
    "tampered executor evidence refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: tamperedEv.store,
        provider: new RecordingMock(),
        verifierAssignmentId: tamperedEvId,
      })
    ).reason,
    "executor_evidence_corrupt",
  );
  writeFileSync(evidencePath, evidenceOriginal);

  section("verifier dispatch — current baseline mismatch before provider");
  const branchCase = await authorizeVerifier("vrf-disp-branch");
  const branchVerifierId = branchCase.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  git(branchCase.fixture.repositoryPath, ["checkout", "-b", "other-branch"]);
  const branchMock = new RecordingMock();
  const branchRefused = await dispatchGovernedVerifierAssignment({
    store: branchCase.store,
    provider: branchMock,
    verifierAssignmentId: branchVerifierId,
  });
  expect("current branch mismatch refused", branchRefused.reason, "current_branch_mismatch");
  expect("branch mismatch did not create a session", branchMock.creates, 0);
  git(branchCase.fixture.repositoryPath, ["checkout", "fixture-main"]);

  const headCase = await authorizeVerifier("vrf-disp-head");
  const headVerifierId = headCase.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  writeFileSync(join(headCase.fixture.repositoryPath, "allowed.txt"), "allowed-changed-for-head\n");
  git(headCase.fixture.repositoryPath, ["add", "allowed.txt"]);
  git(headCase.fixture.repositoryPath, ["commit", "-m", "change head after freeze"]);
  const headMock = new RecordingMock();
  const headRefused = await dispatchGovernedVerifierAssignment({
    store: headCase.store,
    provider: headMock,
    verifierAssignmentId: headVerifierId,
  });
  expect("current HEAD mismatch refused", headRefused.reason, "current_head_mismatch");
  expect("HEAD mismatch did not create a session", headMock.creates, 0);

  section("verifier dispatch — provider failure, denial, secrets");
  const failCase = await authorizeVerifier("vrf-disp-provider-fail");
  const failVerifierId = failCase.authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const failed = await dispatchGovernedVerifierAssignment({
    store: failCase.store,
    provider: new MockExecutionProvider({ failOnCreate: true }),
    verifierAssignmentId: failVerifierId,
  });
  expectTrue("provider failure still persisted evidence", Boolean(failed.evidence));
  expect("provider failure technical verdict", failed.result?.executionVerdict, "provider_failed");
  expect("provider failure remains pending", failed.evidence?.verificationPosture, "pending");
  expectFalse(
    "provider failure is not a semantic FAIL decision",
    JSON.stringify(failed.evidence).includes('"verificationDecision"'),
  );

  const denialFixture = createDisposableExecutionFixture({ assignmentId: "vrf-disp-denial" });
  const denialStore = createFileEngineeringStore(tempStore());
  denialStore.persistFrozenAssignment(denialFixture.assignment);
  spawnSync(process.execPath, [join(denialFixture.repositoryPath, ".cursor", "hooks", "orchestra-guard.mjs")], {
    input: JSON.stringify({
      hook_event_name: "preToolUse",
      tool_name: "edit",
      tool_use_id: "tool-blocked-verifier",
      session_id: "sess-verifier-denial",
      tool_input: { path: "protected.txt" },
    }),
    encoding: "utf8",
    windowsHide: true,
  });
  const denialExec = await dispatchFrozenAssignment({
    store: denialStore,
    provider: new MockExecutionProvider({ resultText: "attempted protected edit" }),
    assignmentId: "vrf-disp-denial",
    projectHooks: false,
  });
  const denialAuth = authorizeAndFreezeVerifierAssignment({
    store: denialStore,
    executorAssignmentId: "vrf-disp-denial",
    executionEvidenceId: denialExec.evidence.evidenceId,
    humanAuthorized: true,
  });
  spawnSync(process.execPath, [join(denialFixture.repositoryPath, ".cursor", "hooks", "orchestra-guard.mjs")], {
    input: JSON.stringify({
      hook_event_name: "preToolUse",
      tool_name: "edit",
      tool_use_id: "tool-blocked-verifier-run",
      session_id: "mock-session",
      tool_input: { path: "protected.txt" },
    }),
    encoding: "utf8",
    windowsHide: true,
  });
  const denialDispatch = await dispatchGovernedVerifierAssignment({
    store: denialStore,
    provider: new MockExecutionProvider({ resultText: "inspected protected path" }),
    verifierAssignmentId: denialAuth.persisted?.frozen.assignment.assignmentId ?? "",
    projectHooks: false,
  });
  expectTrue("policy denial evidence preserved", (denialDispatch.result?.policyDenials.length ?? 0) > 0);
  expect("denial verification pending", denialDispatch.evidence?.verificationPosture, "pending");

  const secretScan = JSON.stringify(dispatched.evidence);
  expectFalse("no Cursor API key in evidence", secretScan.includes("CURSOR_API_KEY"));
  expectFalse("no auth URL secret in evidence", secretScan.includes("https://api2.cursor.sh"));
}
