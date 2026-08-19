import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import * as packageExports from "../index.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-verification-decision-"));
}

class CountingMock extends MockExecutionProvider {
  creates = 0;
  constructor(behavior: ConstructorParameters<typeof MockExecutionProvider>[0] = {}) {
    super({ ...behavior, providerId: behavior.providerId ?? CURSOR_PROVIDER_ID });
  }
  override async createSession(target: Parameters<MockExecutionProvider["createSession"]>[0]) {
    this.creates += 1;
    return super.createSession(target);
  }
}

async function persistExecutorWithSyntheticResult(
  assignmentId: string,
  overrides: Parameters<typeof synthesizeExecutionResult>[0],
  options?: { requiredEvidence?: string[] },
) {
  const fixture = createDisposableExecutionFixture({
    assignmentId,
    assignmentText: overrides.frozen?.assignment.assignmentText ?? undefined,
  });
  let assignment = fixture.assignment;
  if (options?.requiredEvidence) {
    assignment = createAssignment({
      ...assignment.assignment,
      requiredEvidence: options.requiredEvidence,
      createdAt: assignment.assignment.createdAt,
    });
  }
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(assignment);
  const pre = await collectGitEvidence(fixture.repositoryPath);
  const post = overrides.postRunGitEvidence ?? pre;
  const result = synthesizeExecutionResult({
    frozen: assignment,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "mock-session",
    runId: "mock-run",
    providerStatus: overrides.providerStatus ?? "finished",
    normalizedEvents: overrides.normalizedEvents ?? [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: overrides.providerFinalResultText ?? null,
    preRunGitEvidence: overrides.preRunGitEvidence ?? pre,
    postRunGitEvidence: post,
    policyDenials: overrides.policyDenials ?? [],
    changedPaths: overrides.changedPaths ?? [],
    protectedPathMutationOccurred: overrides.protectedPathMutationOccurred ?? false,
    branchChanged: overrides.branchChanged ?? false,
    headChanged: overrides.headChanged ?? false,
    commitOccurred: overrides.commitOccurred ?? false,
    unexpectedChanges: overrides.unexpectedChanges ?? [],
    providerFailed: overrides.providerFailed,
    evidenceIncomplete: overrides.evidenceIncomplete,
  });
  const evidence = store.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: assignment, result, providerStarted: true }),
  );
  return { fixture, store, assignment, evidence, result };
}

async function prepareRoutedVerifier(
  executorAssignmentId: string,
  store: ReturnType<typeof createFileEngineeringStore>,
  executorEvidenceId: string,
  provider: CountingMock = new CountingMock({ resultText: "VERIFIED PASS FAIL CORRECTION REQUIRED" }),
) {
  const authorized = authorizeAndFreezeVerifierAssignment({
    store,
    executorAssignmentId,
    executionEvidenceId: executorEvidenceId,
    humanAuthorized: true,
  });
  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const routed = await routeGovernedVerifierAssignment({
    store,
    verifierAssignmentId: verifierId,
    provider,
  });
  return { authorized, verifierId, routed, provider };
}

export async function runVerificationDecisionTests(): Promise<void> {
  section("verification decision — VERIFIED happy path");

  const clean = await persistExecutorWithSyntheticResult("vdec-verified-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-verified-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    policyDenials: [],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const { verifierId, routed, provider } = await prepareRoutedVerifier(
    "vdec-verified-exec",
    clean.store,
    clean.evidence.evidenceId,
    new CountingMock({ resultText: "VERIFIED PASS APPROVED repository clean tests passed" }),
  );
  expectTrue("verifier routed", routed.dispatched);
  const createsBefore = provider.creates;
  const first = adjudicateVerifierExecution({ store: clean.store, verifierAssignmentId: verifierId });
  expectTrue("adjudicated", first.adjudicated);
  expectFalse("not refused", first.refused);
  expect("decision VERIFIED", first.decision, "VERIFIED");
  expectTrue("decision record persisted", Boolean(first.decisionRecord));
  expect("provider prose not in decision record", first.decisionRecord?.decisionAuthority, "orchestra_machine_adjudication");
  expectFalse("decision not in evidence json", JSON.stringify(routed.evidence).includes('"verificationDecision"'));
  expect("provider creates unchanged during adjudication", provider.creates, createsBefore);

  section("verification decision — idempotency and determinism");

  const second = adjudicateVerifierExecution({ store: clean.store, verifierAssignmentId: verifierId });
  expectTrue("duplicate reuse", second.duplicateDecisionReused);
  expect("same decision hash", second.decisionRecord?.decisionHash, first.decisionRecord?.decisionHash);
  expect("same decision", second.decision, first.decision);

  const restarted = createFileEngineeringStore(clean.store.storeRoot);
  const reloaded = restarted.findVerificationDecisionForEvidence(
    verifierId,
    first.verifierExecutionEvidenceId ?? "",
  );
  expectTrue("restart reconstruction", Boolean(reloaded));
  expect("restart decision", reloaded?.decision, "VERIFIED");
  expect("restart posture", restarted.getVerificationPosture(verifierId), "verified");

  section("verification decision — CORRECTION_REQUIRED paths");

  const protectedMutation = await persistExecutorWithSyntheticResult("vdec-protected-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-protected-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    changedPaths: ["protected.txt"],
    protectedPathMutationOccurred: true,
    unexpectedChanges: ["protected.txt"],
  });
  const protectedCase = await prepareRoutedVerifier(
    "vdec-protected-exec",
    protectedMutation.store,
    protectedMutation.evidence.evidenceId,
  );
  const protectedDecision = adjudicateVerifierExecution({
    store: protectedMutation.store,
    verifierAssignmentId: protectedCase.verifierId,
  });
  expect("protected mutation CORRECTION_REQUIRED", protectedDecision.decision, "CORRECTION_REQUIRED");
  expectTrue(
    "protected mutation reason",
    protectedDecision.decisionRecord?.decisionReasonCodes.includes("executor_protected_mutation") ?? false,
  );

  const commitViolation = await persistExecutorWithSyntheticResult("vdec-commit-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-commit-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    commitOccurred: true,
  });
  const commitCase = await prepareRoutedVerifier(
    "vdec-commit-exec",
    commitViolation.store,
    commitViolation.evidence.evidenceId,
  );
  expect(
    "commit violation CORRECTION_REQUIRED",
    adjudicateVerifierExecution({ store: commitViolation.store, verifierAssignmentId: commitCase.verifierId })
      .decision,
    "CORRECTION_REQUIRED",
  );

  const unexpected = await persistExecutorWithSyntheticResult("vdec-unexpected-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-unexpected-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    changedPaths: ["outside.txt"],
    unexpectedChanges: ["outside.txt"],
  });
  const unexpectedCase = await prepareRoutedVerifier(
    "vdec-unexpected-exec",
    unexpected.store,
    unexpected.evidence.evidenceId,
  );
  expect(
    "unexpected mutation CORRECTION_REQUIRED",
    adjudicateVerifierExecution({ store: unexpected.store, verifierAssignmentId: unexpectedCase.verifierId })
      .decision,
    "CORRECTION_REQUIRED",
  );

  section("verification decision — INDETERMINATE paths");

  const exec = await persistExecutorWithSyntheticResult("vdec-indet-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-indet-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: exec.store,
    executorAssignmentId: "vdec-indet-exec",
    executionEvidenceId: exec.evidence.evidenceId,
    humanAuthorized: true,
  });
  const indetVerifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const failedRoute = await routeGovernedVerifierAssignment({
    store: exec.store,
    verifierAssignmentId: indetVerifierId,
    provider: new CountingMock({ failOnCreate: true }),
  });
  expectTrue("verifier provider failure persisted evidence", Boolean(failedRoute.evidence));
  const indet = adjudicateVerifierExecution({ store: exec.store, verifierAssignmentId: indetVerifierId });
  expect("provider failure INDETERMINATE", indet.decision, "INDETERMINATE");
  expectTrue(
    "provider failure reason",
    indet.decisionRecord?.decisionReasonCodes.includes("verifier_provider_failed") ?? false,
  );

  section("verification decision — policy denial semantics");

  const policyDenial = await persistExecutorWithSyntheticResult("vdec-policy-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-policy-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    policyDenials: [
      {
        hookEvent: "preToolUse",
        toolName: "Write",
        targetPath: "protected.txt",
        permission: "deny",
        reason: "protected_path_write",
      },
    ],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
  });
  const policyCase = await prepareRoutedVerifier(
    "vdec-policy-exec",
    policyDenial.store,
    policyDenial.evidence.evidenceId,
  );
  expect(
    "policy denial alone can VERIFIED",
    adjudicateVerifierExecution({ store: policyDenial.store, verifierAssignmentId: policyCase.verifierId })
      .decision,
    "VERIFIED",
  );

  section("verification decision — required test pass and fail");

  const testPass = await persistExecutorWithSyntheticResult(
    "vdec-test-pass-exec",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-test-pass-exec" }).assignment,
      providerStatus: "finished",
      normalizedEvents: [
        {
          type: "run_finished",
          timestamp: new Date().toISOString(),
          rawSummary: { testOutcome: "pass" },
        },
      ],
      changedPaths: ["allowed.txt"],
    },
    { requiredEvidence: ["git", "filesystem", "tests"] },
  );
  const passCase = await prepareRoutedVerifier(
    "vdec-test-pass-exec",
    testPass.store,
    testPass.evidence.evidenceId,
    new CountingMock({
      events: [
        {
          type: "run_finished",
          timestamp: new Date().toISOString(),
          rawSummary: { testOutcome: "pass" },
        },
      ],
    }),
  );
  expect(
    "required test pass VERIFIED",
    adjudicateVerifierExecution({ store: testPass.store, verifierAssignmentId: passCase.verifierId }).decision,
    "VERIFIED",
  );

  const testFail = await persistExecutorWithSyntheticResult(
    "vdec-test-fail-exec",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-test-fail-exec" }).assignment,
      providerStatus: "finished",
      normalizedEvents: [
        {
          type: "run_finished",
          timestamp: new Date().toISOString(),
          rawSummary: { testOutcome: "fail" },
        },
      ],
      changedPaths: ["allowed.txt"],
    },
    { requiredEvidence: ["git", "filesystem", "tests"] },
  );
  const failCase = await prepareRoutedVerifier(
    "vdec-test-fail-exec",
    testFail.store,
    testFail.evidence.evidenceId,
    new CountingMock({
      events: [
        {
          type: "run_finished",
          timestamp: new Date().toISOString(),
          rawSummary: { testOutcome: "pass" },
        },
      ],
    }),
  );
  expect(
    "required test fail CORRECTION_REQUIRED",
    adjudicateVerifierExecution({ store: testFail.store, verifierAssignmentId: failCase.verifierId }).decision,
    "CORRECTION_REQUIRED",
  );

  section("verification decision — refusals");

  expect(
    "verifier not found",
    adjudicateVerifierExecution({ store: createFileEngineeringStore(tempStore()), verifierAssignmentId: "missing" })
      .reason,
    "verifier_not_found",
  );

  const corruptRole = createDisposableExecutionFixture({ assignmentId: "vdec-corrupt-role" });
  const corruptStore = createFileEngineeringStore(tempStore());
  corruptStore.persistFrozenAssignment(
    createAssignment({ ...corruptRole.assignment.assignment, role: "executor", createdAt: corruptRole.assignment.assignment.createdAt }),
  );
  expect(
    "verifier role required",
    adjudicateVerifierExecution({
      store: corruptStore,
      verifierAssignmentId: "vdec-corrupt-role",
    }).reason,
    "verifier_role_required",
  );

  const noAuth = await persistExecutorWithSyntheticResult("vdec-no-auth-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-no-auth-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const preparedOnly = authorizeAndFreezeVerifierAssignment({
    store: noAuth.store,
    executorAssignmentId: "vdec-no-auth-exec",
    executionEvidenceId: noAuth.evidence.evidenceId,
    humanAuthorized: false,
  });
  expectTrue("prepare without auth refused", preparedOnly.refused);
  const candidate = preparedOnly.candidate;
  if (candidate) {
    noAuth.store.persistFrozenAssignment(candidate, {
      relationship: {
        verifiesAssignmentId: "vdec-no-auth-exec",
        verifiesExecutionEvidenceId: noAuth.evidence.evidenceId,
      },
    });
    expect(
      "missing authorization receipt",
      adjudicateVerifierExecution({
        store: noAuth.store,
        verifierAssignmentId: candidate.assignment.assignmentId,
      }).reason,
      "governed_authorization_required",
    );
  }

  const missingEvidence = await persistExecutorWithSyntheticResult("vdec-missing-verifier-evidence-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-missing-verifier-evidence-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const missingAuth = authorizeAndFreezeVerifierAssignment({
    store: missingEvidence.store,
    executorAssignmentId: "vdec-missing-verifier-evidence-exec",
    executionEvidenceId: missingEvidence.evidence.evidenceId,
    humanAuthorized: true,
  });
  expect(
    "missing verifier evidence",
    adjudicateVerifierExecution({
      store: missingEvidence.store,
      verifierAssignmentId: missingAuth.persisted?.frozen.assignment.assignmentId ?? "",
    }).reason,
    "verifier_execution_evidence_not_found",
  );

  section("verification decision — corrupt evidence and relationship");

  const routedHappy = await persistExecutorWithSyntheticResult("vdec-corrupt-evidence-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-corrupt-evidence-exec" }).assignment,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const routedCase = await prepareRoutedVerifier(
    "vdec-corrupt-evidence-exec",
    routedHappy.store,
    routedHappy.evidence.evidenceId,
  );
  const evidencePath = join(
    routedHappy.store.storeRoot,
    "executions",
    routedCase.verifierId,
    `${routedCase.routed.evidence?.evidenceId}.json`,
  );
  const raw = JSON.parse(readFileSync(evidencePath, "utf8"));
  raw.evidenceHash = "0".repeat(64);
  writeFileSync(evidencePath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
  expect(
    "corrupt verifier evidence",
    adjudicateVerifierExecution({ store: routedHappy.store, verifierAssignmentId: routedCase.verifierId }).reason,
    "verifier_evidence_corrupt",
  );

  section("verification decision — no bypass setters or automatic continuation");

  expectFalse("no markVerified export", "markVerified" in packageExports);
  expectFalse("no markFailed export", "markFailed" in packageExports);
  expectFalse("no approveVerification export", "approveVerification" in packageExports);
  expectFalse("no closeAssignment export", "closeAssignment" in packageExports);
  expectFalse("no correction assignment generated", routedHappy.store.listAssignmentIds().some((id) => {
    const rel = routedHappy.store.loadAssignmentRecord(id).relationship.correctionOfAssignmentId;
    return Boolean(rel);
  }));
  expectFalse(
    "no next requirement in decision record",
    JSON.stringify(first.decisionRecord).includes('"nextRequirement"'),
  );

  section("verification decision — provider prose attacks ignored");

  expectFalse(
    "prose PASS did not force decision text",
    first.decisionRecord?.decisionReasonCodes.some((code) => code.includes("PASS")) ?? false,
  );
  expect("prose attack decision still VERIFIED", first.decision, "VERIFIED");
}
