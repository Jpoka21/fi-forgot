import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import {
  authorizeAndFreezeVerifierAssignment,
  findVerifierAssignments,
  prepareVerifierAssignment,
} from "../engineering-store/prepare-verifier.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-verifier-prep-"));
}

class CountingMock extends MockExecutionProvider {
  creates = 0;
  override async createSession(target: Parameters<MockExecutionProvider["createSession"]>[0]) {
    this.creates += 1;
    return super.createSession(target);
  }
}

async function persistExecuted(
  assignmentId: string,
  provider: MockExecutionProvider = new MockExecutionProvider({ resultText: "mock finished" }),
) {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(fixture.assignment);
  const dispatched = await dispatchFrozenAssignment({ store, provider, assignmentId });
  return { fixture, store, dispatched, provider };
}

export async function runVerifierPreparationTests(): Promise<void> {
  section("verifier preparation — happy path, auth, restart");
  const counting = new CountingMock({ resultText: "mock finished" });
  const happy = await persistExecuted("vrf-prep-ok", counting);
  const createsAfterDispatch = counting.creates;
  const evidenceId = happy.dispatched.evidence.evidenceId;

  const unauth = authorizeAndFreezeVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-prep-ok",
    executionEvidenceId: evidenceId,
    humanAuthorized: false,
  });
  expect("human authorization required", unauth.reason, "human_authorization_required");
  expectFalse("unauthorized verifier is not persisted", Boolean(unauth.persisted));
  expectTrue("unauthorized still returns candidate", Boolean(unauth.candidate));

  const prepared = prepareVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-prep-ok",
    executionEvidenceId: evidenceId,
  });
  expectTrue("valid executor plus evidence is ready", prepared.ready);
  expect("verifier role on candidate", prepared.candidate?.assignment.role, "verifier");
  expectFalse("prepare does not persist", Boolean(prepared.persisted));
  expect("commit false", prepared.candidate?.assignment.commitAuthorization, false);
  expect("push false", prepared.candidate?.assignment.pushAuthorization, false);
  expect("requireNoPush true", prepared.candidate?.assignment.requireNoPush, true);
  expect("empty write scope", prepared.candidate?.assignment.allowedPaths, []);
  expectTrue(
    "protected paths retained",
    (prepared.candidate?.assignment.protectedPaths ?? []).includes("protected.txt"),
  );
  expectTrue(
    "required evidence includes executor execution evidence",
    (prepared.candidate?.assignment.requiredEvidence ?? []).includes("executor_execution_evidence"),
  );
  expectTrue(
    "assignment text names executor hash",
    (prepared.candidate?.assignment.assignmentText ?? "").includes(happy.fixture.assignment.assignmentHash),
  );
  expectTrue(
    "assignment text labels provider prose untrusted",
    (prepared.candidate?.assignment.assignmentText ?? "").includes("UNTRUSTED provider prose"),
  );
  expect("technical verdict is input warning", prepared.warnings.some((row) => row.includes("not a verification")), true);

  const firstHash = prepared.candidate?.assignmentHash;
  const preparedAgain = prepareVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-prep-ok",
    executionEvidenceId: evidenceId,
  });
  expect("verifier assignment hash deterministic", preparedAgain.candidate?.assignmentHash, firstHash);

  const authorized = authorizeAndFreezeVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-prep-ok",
    executionEvidenceId: evidenceId,
    humanAuthorized: true,
  });
  expectTrue("authorized freeze ready", authorized.ready);
  expect("verifier role persisted", authorized.persisted?.frozen.assignment.role, "verifier");
  expect(
    "verifiesAssignmentId persisted",
    authorized.persisted?.relationship.verifiesAssignmentId,
    "vrf-prep-ok",
  );
  expect(
    "verifiesExecutionEvidenceId persisted",
    authorized.persisted?.relationship.verifiesExecutionEvidenceId,
    evidenceId,
  );

  const duplicate = authorizeAndFreezeVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "vrf-prep-ok",
    executionEvidenceId: evidenceId,
    humanAuthorized: true,
  });
  expect("duplicate preparation is idempotent", duplicate.persisted?.frozen.assignmentHash, authorized.verifierAssignmentHash);
  expect("duplicate keeps one verifier", findVerifierAssignments(happy.store, "vrf-prep-ok").length, 1);

  expect("no provider create during prepare/authorize", counting.creates, createsAfterDispatch);
  expect("executor still pending", happy.store.getVerificationPosture("vrf-prep-ok"), "pending");

  const restarted = createFileEngineeringStore(happy.store.storeRoot);
  const reExecutor = restarted.loadFrozenAssignment("vrf-prep-ok");
  const reEvidence = restarted.loadExecutionEvidenceById("vrf-prep-ok", evidenceId);
  const reVerifier = restarted.findVerifierAssignments("vrf-prep-ok", evidenceId)[0];
  expect("restart executor hash", reExecutor.assignmentHash, happy.fixture.assignment.assignmentHash);
  expect("restart evidence hash", reEvidence.evidenceHash, happy.dispatched.evidence.evidenceHash);
  expect("restart verifier role", reVerifier?.frozen.assignment.role, "verifier");
  expect("restart verifiesAssignmentId", reVerifier?.relationship.verifiesAssignmentId, "vrf-prep-ok");
  expect("restart verifiesExecutionEvidenceId", reVerifier?.relationship.verifiesExecutionEvidenceId, evidenceId);
  expect("restart verifier hash", reVerifier?.frozen.assignmentHash, authorized.verifierAssignmentHash);
  expect("restart executor pending", restarted.getVerificationPosture("vrf-prep-ok"), "pending");
  expect("restart commit false", reVerifier?.frozen.assignment.commitAuthorization, false);
  expect("restart push false", reVerifier?.frozen.assignment.pushAuthorization, false);

  section("verifier preparation — refusals");
  expect(
    "unknown executor refused",
    prepareVerifierAssignment({
      store: happy.store,
      executorAssignmentId: "missing-executor",
      executionEvidenceId: evidenceId,
    }).reason,
    "executor_not_found",
  );
  expect(
    "unknown evidence refused",
    prepareVerifierAssignment({
      store: happy.store,
      executorAssignmentId: "vrf-prep-ok",
      executionEvidenceId: "ev-does-not-exist",
    }).reason,
    "execution_evidence_not_found",
  );
  expect(
    "missing evidence id refused",
    prepareVerifierAssignment({
      store: happy.store,
      executorAssignmentId: "vrf-prep-ok",
      executionEvidenceId: "",
    }).reason,
    "execution_evidence_id_required",
  );

  const neverDispatched = createDisposableExecutionFixture({ assignmentId: "vrf-never" });
  const neverStore = createFileEngineeringStore(tempStore());
  neverStore.persistFrozenAssignment(neverDispatched.assignment);
  expect(
    "frozen without evidence refused",
    prepareVerifierAssignment({
      store: neverStore,
      executorAssignmentId: "vrf-never",
      executionEvidenceId: "ev-none",
    }).reason,
    "execution_evidence_not_found",
  );

  const verifierAsExecutor = createFileEngineeringStore(tempStore());
  verifierAsExecutor.persistFrozenAssignment(
    createAssignment({
      ...neverDispatched.assignment.assignment,
      assignmentId: "vrf-role",
      role: "verifier",
      createdAt: neverDispatched.assignment.assignment.createdAt,
    }),
  );
  expect(
    "executor role required",
    prepareVerifierAssignment({
      store: verifierAsExecutor,
      executorAssignmentId: "vrf-role",
      executionEvidenceId: evidenceId,
    }).reason,
    "executor_role_required",
  );

  const fail = await persistExecuted(
    "vrf-fail",
    new MockExecutionProvider({ failOnCreate: true }),
  );
  expect(
    "provider failure not reviewable",
    prepareVerifierAssignment({
      store: fail.store,
      executorAssignmentId: "vrf-fail",
      executionEvidenceId: fail.dispatched.evidence.evidenceId,
    }).reason,
    "executor_provider_failed_not_reviewable",
  );

  const mismatchRoot = tempStore();
  const mismatchStore = createFileEngineeringStore(mismatchRoot);
  const mismatchFixture = createDisposableExecutionFixture({ assignmentId: "vrf-mismatch" });
  const wrongHead = createAssignment({
    ...mismatchFixture.assignment.assignment,
    startingHead: "0".repeat(40),
    createdAt: mismatchFixture.assignment.assignment.createdAt,
  });
  mismatchStore.persistFrozenAssignment(wrongHead);
  const mismatch = await dispatchFrozenAssignment({
    store: mismatchStore,
    provider: new MockExecutionProvider(),
    assignmentId: "vrf-mismatch",
  });
  expect(
    "baseline mismatch not reviewable",
    prepareVerifierAssignment({
      store: mismatchStore,
      executorAssignmentId: "vrf-mismatch",
      executionEvidenceId: mismatch.evidence.evidenceId,
    }).reason,
    "executor_baseline_mismatch_not_reviewable",
  );

  const incompleteFixture = createDisposableExecutionFixture({ assignmentId: "vrf-incomplete" });
  const incompleteStore = createFileEngineeringStore(tempStore());
  incompleteStore.persistFrozenAssignment(incompleteFixture.assignment);
  const incompleteResult = synthesizeExecutionResult({
    frozen: incompleteFixture.assignment,
    providerId: "mock",
    providerSessionId: null,
    runId: null,
    providerStatus: "not_started",
    normalizedEvents: [],
    providerFinalResultText: null,
    preRunGitEvidence: null,
    postRunGitEvidence: null,
    policyDenials: [],
    changedPaths: [],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: ["evidence_incomplete"],
    evidenceIncomplete: true,
  });
  const incompleteEvidence = incompleteStore.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: incompleteFixture.assignment,
      result: incompleteResult,
      providerStarted: false,
    }),
  );
  expect(
    "evidence incomplete not reviewable",
    prepareVerifierAssignment({
      store: incompleteStore,
      executorAssignmentId: "vrf-incomplete",
      executionEvidenceId: incompleteEvidence.evidenceId,
    }).reason,
    "executor_evidence_incomplete_not_reviewable",
  );

  const violationFixture = createDisposableExecutionFixture({ assignmentId: "vrf-violation" });
  const violationStore = createFileEngineeringStore(tempStore());
  violationStore.persistFrozenAssignment(violationFixture.assignment);
  const pre = violationFixture.assignment.assignment.startingHead;
  const violationResult = synthesizeExecutionResult({
    frozen: violationFixture.assignment,
    providerId: "mock",
    providerSessionId: "sess-v",
    runId: "run-v",
    providerStatus: "finished",
    normalizedEvents: [],
    providerFinalResultText: "I changed extra files",
    preRunGitEvidence: {
      capturedAt: "2026-08-17T00:00:00.000Z",
      toplevel: violationFixture.repositoryPath,
      branch: "fixture-main",
      head: pre,
      subject: "fixture",
      ahead: 0,
      behind: 0,
      statusShort: "",
      stagedPaths: [],
      unstagedChangedPaths: [],
      untrackedPaths: [],
      commitIdentity: null,
    },
    postRunGitEvidence: {
      capturedAt: "2026-08-17T00:00:01.000Z",
      toplevel: violationFixture.repositoryPath,
      branch: "fixture-main",
      head: pre,
      subject: "fixture",
      ahead: 0,
      behind: 0,
      statusShort: "?? extra.txt",
      stagedPaths: [],
      unstagedChangedPaths: [],
      untrackedPaths: ["extra.txt"],
      commitIdentity: null,
    },
    policyDenials: [],
    changedPaths: ["extra.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: ["extra.txt"],
  });
  const violationEvidence = violationStore.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: violationFixture.assignment,
      result: violationResult,
      providerStarted: true,
    }),
  );
  const violationPrep = prepareVerifierAssignment({
    store: violationStore,
    executorAssignmentId: "vrf-violation",
    executionEvidenceId: violationEvidence.evidenceId,
  });
  expectTrue("repository violation still prepares verifier", violationPrep.ready);
  expectTrue(
    "violation is prominent in warnings",
    violationPrep.warnings.some((row) => row.includes("repository_state_violation") && row.includes("extra.txt")),
  );
  expectTrue(
    "violation is in assignment text",
    (violationPrep.candidate?.assignment.assignmentText ?? "").includes("extra.txt"),
  );

  section("verifier preparation — policy denial and multiple evidence");
  const denialFixture = createDisposableExecutionFixture({ assignmentId: "vrf-denial" });
  const denialStore = createFileEngineeringStore(tempStore());
  denialStore.persistFrozenAssignment(denialFixture.assignment);
  spawnSync(process.execPath, [join(denialFixture.repositoryPath, ".cursor", "hooks", "orchestra-guard.mjs")], {
    input: JSON.stringify({
      hook_event_name: "preToolUse",
      tool_name: "edit",
      tool_use_id: "tool-blocked",
      session_id: "sess-denial",
      tool_input: { path: "protected.txt" },
    }),
    encoding: "utf8",
    windowsHide: true,
  });
  const denial = await dispatchFrozenAssignment({
    store: denialStore,
    provider: new MockExecutionProvider({ resultText: "attempted protected edit" }),
    assignmentId: "vrf-denial",
    projectHooks: false,
  });
  const denialPrep = prepareVerifierAssignment({
    store: denialStore,
    executorAssignmentId: "vrf-denial",
    executionEvidenceId: denial.evidence.evidenceId,
  });
  expectTrue("policy denial case prepares", denialPrep.ready);
  expectTrue(
    "policy denial included in verifier text",
    (denialPrep.candidate?.assignment.assignmentText ?? "").includes("protected.txt"),
  );

  const secondEvidence = denialStore.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: denialFixture.assignment,
      result: denial.result,
      providerStarted: true,
    }),
  );
  expectTrue("second evidence id differs", secondEvidence.evidenceId !== denial.evidence.evidenceId);
  const firstPrep = prepareVerifierAssignment({
    store: denialStore,
    executorAssignmentId: "vrf-denial",
    executionEvidenceId: denial.evidence.evidenceId,
  });
  const secondPrep = prepareVerifierAssignment({
    store: denialStore,
    executorAssignmentId: "vrf-denial",
    executionEvidenceId: secondEvidence.evidenceId,
  });
  expectTrue("explicit evidence id selects first record", firstPrep.ready);
  expectTrue("explicit evidence id selects second record", secondPrep.ready);
  expectFalse(
    "different evidence ids produce different verifier identities",
    firstPrep.candidate?.assignment.assignmentId === secondPrep.candidate?.assignment.assignmentId,
  );
}
