import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { evaluateExecutorImplementation } from "../engineering-store/verification-decision-logic.js";
import { validateVerifierSemanticFinding } from "../engineering-store/semantic-finding-record.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { captureVerifierSemanticFindingsFromEvidence } from "../engineering-store/capture-verifier-findings.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { structuredFindingEvent } from "../structured-finding-event.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import * as packageExports from "../index.js";
import type { NormalizedExecutionEvent } from "../events.js";
import { allRequirementsSatisfiedEvents, structuredFindingEventsForRequirements } from "./structured-finding-helpers.js";
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
  options?: { requiredEvidence?: string[]; structuredObligations?: { obligationId: string; summary: string }[] },
) {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  let assignment = fixture.assignment;
  if (options?.requiredEvidence || options?.structuredObligations) {
    assignment = createAssignment({
      ...assignment.assignment,
      requiredEvidence: options.requiredEvidence ?? assignment.assignment.requiredEvidence,
      structuredObligations: options.structuredObligations ?? assignment.assignment.structuredObligations,
      createdAt: assignment.assignment.createdAt,
    });
  }
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(assignment);
  const pre = await collectGitEvidence(fixture.repositoryPath);
  const post = "postRunGitEvidence" in overrides ? (overrides.postRunGitEvidence ?? null) : pre;
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
  options: {
    resultText?: string;
    events?: NormalizedExecutionEvent[];
    outcome?: "requirement_satisfied" | "requirement_failed" | "requirement_not_evaluated" | "evidence_insufficient";
    overrideRequirementId?: string;
  } = {},
) {
  const authorized = authorizeAndFreezeVerifierAssignment({
    store,
    executorAssignmentId,
    executionEvidenceId: executorEvidenceId,
    humanAuthorized: true,
  });
  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const requirements = authorized.persisted?.frozen.assignment.verificationRequirements ?? [];
  let events = options.events;
  if (!events) {
    events = structuredFindingEventsForRequirements(requirements, options.outcome ?? "requirement_satisfied");
    const overrideId =
      options.overrideRequirementId ??
      (options.outcome && options.outcome !== "requirement_satisfied"
        ? requirements[0]?.requirementId
        : undefined);
    if (overrideId && options.outcome) {
      events = events.map((event) => {
        const reqId = event.rawSummary?.requirementId;
        if (reqId === overrideId) {
          return structuredFindingEvent({
            requirementId: String(reqId),
            outcome: options.outcome!,
            reasonCode: "test_override",
          });
        }
        return event;
      });
    }
  }
  const provider = new CountingMock({
    resultText: options.resultText ?? "mock finished",
    events,
  });
  const routed = await routeGovernedVerifierAssignment({
    store,
    verifierAssignmentId: verifierId,
    provider,
  });
  return { authorized, verifierId, routed, provider, requirements };
}

export async function runVerificationDecisionTests(): Promise<void> {
  section("verification decision — VERIFIED with complete structured findings");

  const clean = await persistExecutorWithSyntheticResult("vdec-verified-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-verified-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const prepared = await prepareRoutedVerifier(
    "vdec-verified-exec",
    clean.store,
    clean.evidence.evidenceId,
    { resultText: "VERIFIED PASS APPROVED" },
  );
  expectTrue("verifier routed", prepared.routed.dispatched);
  const createsBefore = prepared.provider.creates;
  const first = adjudicateVerifierExecution({ store: clean.store, verifierAssignmentId: prepared.verifierId });
  expectTrue("adjudicated", first.adjudicated);
  expect("decision VERIFIED", first.decision, "VERIFIED");
  expect("provider creates unchanged during adjudication", prepared.provider.creates, createsBefore);

  section("verification decision — idempotency and restart");

  const second = adjudicateVerifierExecution({ store: clean.store, verifierAssignmentId: prepared.verifierId });
  expectTrue("duplicate reuse", second.duplicateDecisionReused);
  const restarted = createFileEngineeringStore(clean.store.storeRoot);
  expectTrue(
    "restart reconstruction",
    Boolean(
      restarted.findVerificationDecisionForEvidence(
        prepared.verifierId,
        first.verifierExecutionEvidenceId ?? "",
      ),
    ),
  );

  section("verification decision — false VERIFIED regression from 037.1");

  const proseDefect = await persistExecutorWithSyntheticResult("vdec-fp-prose", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-fp-prose" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const prosePrepared = await prepareRoutedVerifier(
    "vdec-fp-prose",
    proseDefect.store,
    proseDefect.evidence.evidenceId,
    {
      resultText: "CORRECTION REQUIRED: feature AUTH_GATE not implemented. VERIFIED claim rejected.",
      events: [],
    },
  );
  expect(
    "prose substantive defect without structured findings",
    adjudicateVerifierExecution({ store: proseDefect.store, verifierAssignmentId: prosePrepared.verifierId })
      .decision,
    "INDETERMINATE",
  );

  const omitted = await persistExecutorWithSyntheticResult("vdec-fp-omitted", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-fp-omitted" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const omittedPrepared = await prepareRoutedVerifier(
    "vdec-fp-omitted",
    omitted.store,
    omitted.evidence.evidenceId,
    { resultText: "all good", events: [] },
  );
  expect(
    "omitted obligation without structured findings",
    adjudicateVerifierExecution({ store: omitted.store, verifierAssignmentId: omittedPrepared.verifierId }).decision,
    "INDETERMINATE",
  );

  const proseFailClean = await persistExecutorWithSyntheticResult("vdec-fp-fail-prose", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-fp-fail-prose" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const failProsePrepared = await prepareRoutedVerifier(
    "vdec-fp-fail-prose",
    proseFailClean.store,
    proseFailClean.evidence.evidenceId,
    { resultText: "FAIL CORRECTION REQUIRED", events: [] },
  );
  expect(
    "prose FAIL with clean machine and no structured findings",
    adjudicateVerifierExecution({ store: proseFailClean.store, verifierAssignmentId: failProsePrepared.verifierId })
      .decision,
    "INDETERMINATE",
  );

  section("verification decision — CORRECTION_REQUIRED paths");

  const protectedMutation = await persistExecutorWithSyntheticResult("vdec-protected-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-protected-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["protected.txt"],
    protectedPathMutationOccurred: true,
    unexpectedChanges: ["protected.txt"],
  });
  const protectedCase = await prepareRoutedVerifier(
    "vdec-protected-exec",
    protectedMutation.store,
    protectedMutation.evidence.evidenceId,
  );
  expect(
    "protected mutation CORRECTION_REQUIRED",
    adjudicateVerifierExecution({ store: protectedMutation.store, verifierAssignmentId: protectedCase.verifierId })
      .decision,
    "CORRECTION_REQUIRED",
  );

  const failedFinding = await persistExecutorWithSyntheticResult("vdec-failed-finding-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-failed-finding-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const failedCase = await prepareRoutedVerifier(
    "vdec-failed-finding-exec",
    failedFinding.store,
    failedFinding.evidence.evidenceId,
    { outcome: "requirement_failed" },
  );
  expect(
    "structured failed finding CORRECTION_REQUIRED",
    adjudicateVerifierExecution({ store: failedFinding.store, verifierAssignmentId: failedCase.verifierId }).decision,
    "CORRECTION_REQUIRED",
  );

  section("verification decision — INDETERMINATE semantic gaps");

  const notEvaluated = await persistExecutorWithSyntheticResult("vdec-not-eval-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-not-eval-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const notEvalCase = await prepareRoutedVerifier(
    "vdec-not-eval-exec",
    notEvaluated.store,
    notEvaluated.evidence.evidenceId,
    {
      outcome: "requirement_not_evaluated",
    },
  );
  expect(
    "not evaluated finding INDETERMINATE",
    adjudicateVerifierExecution({ store: notEvaluated.store, verifierAssignmentId: notEvalCase.verifierId }).decision,
    "INDETERMINATE",
  );

  section("verification decision — refusals and integrity");

  expect(
    "verifier not found",
    adjudicateVerifierExecution({ store: createFileEngineeringStore(tempStore()), verifierAssignmentId: "missing" })
      .reason,
    "verifier_not_found",
  );

  const routedHappy = await persistExecutorWithSyntheticResult("vdec-corrupt-evidence-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-corrupt-evidence-exec" }).assignment,
    providerStatus: "finished",
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

  section("verification decision — public bypass audit");

  expectFalse("no markVerified export", "markVerified" in packageExports);
  expectFalse("no buildVerificationDecisionRecord export", "buildVerificationDecisionRecord" in packageExports);
  expectFalse("no deriveVerificationDecision export", "deriveVerificationDecision" in packageExports);
  expectTrue(
    "captureVerifierSemanticFindingsFromEvidence exported",
    "captureVerifierSemanticFindingsFromEvidence" in packageExports,
  );

  section("verification decision — capture idempotency");

  const captureAgain = captureVerifierSemanticFindingsFromEvidence({
    store: clean.store,
    verifierAssignmentId: prepared.verifierId,
  });
  expectTrue("capture duplicate reuse", captureAgain.duplicateFindingsReused);

  section("verification decision — structured finding integrity");

  const partial = await persistExecutorWithSyntheticResult("vdec-partial-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-partial-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const partialAuth = authorizeAndFreezeVerifierAssignment({
    store: partial.store,
    executorAssignmentId: "vdec-partial-exec",
    executionEvidenceId: partial.evidence.evidenceId,
    humanAuthorized: true,
  });
  const partialReqs = partialAuth.persisted?.frozen.assignment.verificationRequirements ?? [];
  const partialProvider = new CountingMock({
    events: structuredFindingEventsForRequirements(partialReqs.slice(0, 1)),
  });
  await routeGovernedVerifierAssignment({
    store: partial.store,
    verifierAssignmentId: partialAuth.persisted!.frozen.assignment.assignmentId,
    provider: partialProvider,
  });
  expect(
    "partial structured coverage INDETERMINATE",
    adjudicateVerifierExecution({
      store: partial.store,
      verifierAssignmentId: partialAuth.persisted!.frozen.assignment.assignmentId,
    }).decision,
    "INDETERMINATE",
  );

  const unknownReq = await persistExecutorWithSyntheticResult("vdec-unknown-req-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-unknown-req-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const unknownPrepared = await prepareRoutedVerifier(
    "vdec-unknown-req-exec",
    unknownReq.store,
    unknownReq.evidence.evidenceId,
    {
      events: [
        structuredFindingEvent({
          requirementId: "req:unknown_requirement",
          outcome: "requirement_satisfied",
          reasonCode: "forged",
        }),
      ],
    },
  );
  const unknownCapture = captureVerifierSemanticFindingsFromEvidence({
    store: unknownReq.store,
    verifierAssignmentId: unknownPrepared.verifierId,
  });
  expectTrue("unknown requirement capture refused", unknownCapture.refused);
  expect(
    "unknown requirement adjudication INDETERMINATE",
    adjudicateVerifierExecution({ store: unknownReq.store, verifierAssignmentId: unknownPrepared.verifierId })
      .decision,
    "INDETERMINATE",
  );

  const duplicate = await persistExecutorWithSyntheticResult("vdec-dup-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-dup-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const dupPrepared = await prepareRoutedVerifier(
    "vdec-dup-exec",
    duplicate.store,
    duplicate.evidence.evidenceId,
  );
  const dupReqId = dupPrepared.requirements[0]?.requirementId ?? "";
  const dupEvents = [
    structuredFindingEvent({ requirementId: dupReqId, outcome: "requirement_satisfied", reasonCode: "a" }),
    structuredFindingEvent({ requirementId: dupReqId, outcome: "requirement_failed", reasonCode: "b" }),
    ...structuredFindingEventsForRequirements(dupPrepared.requirements.slice(1)),
  ];
  const dupEvidencePath = join(
    duplicate.store.storeRoot,
    "executions",
    dupPrepared.verifierId,
    `${dupPrepared.routed.evidence?.evidenceId}.json`,
  );
  const dupRaw = JSON.parse(readFileSync(dupEvidencePath, "utf8"));
  dupRaw.result.normalizedEvents = dupEvents;
  writeFileSync(dupEvidencePath, `${JSON.stringify(dupRaw, null, 2)}\n`, "utf8");
  const dupCapture = captureVerifierSemanticFindingsFromEvidence({
    store: duplicate.store,
    verifierAssignmentId: dupPrepared.verifierId,
  });
  expectTrue("duplicate conflicting capture refused", dupCapture.refused);

  const insufficient = await persistExecutorWithSyntheticResult("vdec-insufficient-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-insufficient-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const insufficientCase = await prepareRoutedVerifier(
    "vdec-insufficient-exec",
    insufficient.store,
    insufficient.evidence.evidenceId,
    { outcome: "evidence_insufficient" },
  );
  expect(
    "insufficient evidence finding INDETERMINATE",
    adjudicateVerifierExecution({
      store: insufficient.store,
      verifierAssignmentId: insufficientCase.verifierId,
    }).decision,
    "INDETERMINATE",
  );

  section("verification decision — unknown commit and push evidence");

  const unknownGitFixture = createDisposableExecutionFixture({ assignmentId: "vdec-unknown-git-logic" });
  const unknownGitResult = synthesizeExecutionResult({
    frozen: unknownGitFixture.assignment,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "mock",
    runId: "mock",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: null,
    preRunGitEvidence: await collectGitEvidence(unknownGitFixture.repositoryPath),
    postRunGitEvidence: null,
    changedPaths: ["allowed.txt"],
    policyDenials: [],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const unknownGitEvidence = buildExecutionEvidence({
    frozen: unknownGitFixture.assignment,
    result: unknownGitResult,
    providerStarted: true,
  });
  const unknownPushEval = evaluateExecutorImplementation(unknownGitFixture.assignment, unknownGitEvidence);
  expect("unknown push evidence INDETERMINATE", unknownPushEval.decision, "INDETERMINATE");
  expectTrue(
    "unknown push reason",
    unknownPushEval.reasonCodes.includes("unknown_push_evidence"),
  );
  const unknownCommitEval = evaluateExecutorImplementation(
    createAssignment({
      ...unknownGitFixture.assignment.assignment,
      requireNoPush: false,
      createdAt: unknownGitFixture.assignment.assignment.createdAt,
    }),
    unknownGitEvidence,
  );
  expect("unknown commit evidence INDETERMINATE", unknownCommitEval.decision, "INDETERMINATE");
  expectTrue(
    "unknown commit reason",
    unknownCommitEval.reasonCodes.includes("unknown_commit_evidence"),
  );

  section("verification decision — required test evidence not trusted from events");

  const testsRequired = await persistExecutorWithSyntheticResult(
    "vdec-tests-required-exec",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-tests-required-exec" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
      normalizedEvents: [
        { type: "run_finished", timestamp: new Date().toISOString(), rawSummary: { testOutcome: "pass" } },
      ],
    },
    { requiredEvidence: ["git", "hooks", "filesystem", "tests"] },
  );
  const testsPrepared = await prepareRoutedVerifier(
    "vdec-tests-required-exec",
    testsRequired.store,
    testsRequired.evidence.evidenceId,
    { resultText: "VERIFIED PASS", events: [] },
  );
  expect(
    "caller-controlled testOutcome without structured findings INDETERMINATE",
    adjudicateVerifierExecution({
      store: testsRequired.store,
      verifierAssignmentId: testsPrepared.verifierId,
    }).decision,
    "INDETERMINATE",
  );

  section("verification decision — finding persistence and tamper");

  const tamperBase = await persistExecutorWithSyntheticResult("vdec-tamper-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-tamper-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const tamperPrepared = await prepareRoutedVerifier(
    "vdec-tamper-exec",
    tamperBase.store,
    tamperBase.evidence.evidenceId,
  );
  captureVerifierSemanticFindingsFromEvidence({
    store: tamperBase.store,
    verifierAssignmentId: tamperPrepared.verifierId,
  });
  const findingsPath = join(
    tamperBase.store.storeRoot,
    "assignments",
    tamperPrepared.verifierId,
    "semantic-findings.ndjson",
  );
  const findingLines = readFileSync(findingsPath, "utf8").trim().split(/\r?\n/);
  expectTrue("findings persisted", findingLines.length > 1);
  writeFileSync(findingsPath, `${findingLines.slice(0, -1).join("\n")}\n`, "utf8");
  expect(
    "missing persisted finding -> INDETERMINATE",
    adjudicateVerifierExecution({ store: tamperBase.store, verifierAssignmentId: tamperPrepared.verifierId })
      .decision,
    "INDETERMINATE",
  );

  expectFalse("no persistVerificationDecision export", "persistVerificationDecision" in packageExports);

  section("verification decision — finding hash integrity");

  const hashFixture = await persistExecutorWithSyntheticResult("vdec-hash-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-hash-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const hashPrepared = await prepareRoutedVerifier(
    "vdec-hash-exec",
    hashFixture.store,
    hashFixture.evidence.evidenceId,
  );
  captureVerifierSemanticFindingsFromEvidence({
    store: hashFixture.store,
    verifierAssignmentId: hashPrepared.verifierId,
  });
  const loaded = hashFixture.store.loadVerifierSemanticFindings(
    hashPrepared.verifierId,
    hashPrepared.routed.evidence?.evidenceId,
  );
  expectTrue("loaded finding present", loaded.length > 0);
  const tampered = { ...loaded[0]!, outcome: "requirement_failed" as const };
  expectFalse("tampered finding hash rejected", validateVerifierSemanticFinding(tampered));
}
