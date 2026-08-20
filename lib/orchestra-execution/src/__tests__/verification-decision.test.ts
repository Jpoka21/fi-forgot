import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { captureVerifierSemanticProposalsFromEvidence } from "../engineering-store/capture-verifier-findings.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { resolveVerifierSemanticFindings } from "../engineering-store/resolve-verifier-findings.js";
import { structuredFindingEvent } from "../structured-finding-event.js";
import { defaultSemanticEvidenceReferences } from "../engineering-store/evidence-reference-resolution.js";
import { evaluateExecutorImplementation } from "../engineering-store/verification-decision-logic.js";
import { validateVerifierSemanticFinding } from "../engineering-store/semantic-finding-record.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import * as packageExports from "../index.js";
import type { NormalizedExecutionEvent } from "../events.js";
import {
  allSemanticObligationsSatisfiedEvents,
  structuredFindingEventsForRequirements,
} from "./structured-finding-helpers.js";
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
    verifierSlot?: "primary" | "corroborator";
    outcome?: "requirement_satisfied" | "requirement_failed" | "requirement_not_evaluated" | "evidence_insufficient";
    withValidEvidenceRefs?: boolean;
    emptyEvidenceRefs?: boolean;
  } = {},
) {
  const authorized = authorizeAndFreezeVerifierAssignment({
    store,
    executorAssignmentId,
    executionEvidenceId: executorEvidenceId,
    humanAuthorized: true,
    verifierSlot: options.verifierSlot ?? "primary",
  });
  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const requirements = authorized.persisted?.frozen.assignment.verificationRequirements ?? [];
  const executor = store.loadFrozenAssignment(executorAssignmentId);
  let events = options.events;
  if (!events) {
    const refs = options.emptyEvidenceRefs
      ? []
      : options.withValidEvidenceRefs === false
        ? ["not-a-valid-ref"]
        : defaultSemanticEvidenceReferences(executor, executorEvidenceId);
    events = structuredFindingEventsForRequirements(
      requirements,
      options.outcome ?? "requirement_satisfied",
      "independent_inspection",
      refs,
    );
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
  return { authorized, verifierId, routed, provider, requirements, executor };
}

async function prepareCorroboratedPair(
  executorAssignmentId: string,
  store: ReturnType<typeof createFileEngineeringStore>,
  executorEvidenceId: string,
  options: {
    outcome?: "requirement_satisfied" | "requirement_failed";
    resultTextA?: string;
    resultTextB?: string;
  } = {},
) {
  const primary = await prepareRoutedVerifier(executorAssignmentId, store, executorEvidenceId, {
    verifierSlot: "primary",
    outcome: options.outcome ?? "requirement_satisfied",
    withValidEvidenceRefs: true,
    resultText: options.resultTextA ?? "primary verifier",
  });
  const corroborator = await prepareRoutedVerifier(executorAssignmentId, store, executorEvidenceId, {
    verifierSlot: "corroborator",
    outcome: options.outcome ?? "requirement_satisfied",
    withValidEvidenceRefs: true,
    resultText: options.resultTextB ?? "corroborator verifier",
  });
  return { primary, corroborator };
}

export async function runVerificationDecisionTests(): Promise<void> {
  section("037-D — provider assertion alone cannot VERIFIED");

  const attack = await persistExecutorWithSyntheticResult("vdec-p1-provider-assert", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-p1-provider-assert" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const attackAuth = authorizeAndFreezeVerifierAssignment({
    store: attack.store,
    executorAssignmentId: "vdec-p1-provider-assert",
    executionEvidenceId: attack.evidence.evidenceId,
    humanAuthorized: true,
  });
  const attackReqs = attackAuth.persisted?.frozen.assignment.verificationRequirements ?? [];
  const attackEvents = [
    ...allSemanticObligationsSatisfiedEvents(attackReqs, attack.assignment, attack.evidence.evidenceId),
    ...attackReqs
      .filter((row) => row.requirementClass === "MACHINE_RESOLVABLE")
      .map((row) =>
        structuredFindingEvent({
          requirementId: row.requirementId,
          outcome: "requirement_satisfied",
          reasonCode: "provider_assert",
          evidenceReferences: [],
        }),
      ),
  ];
  const attackProvider = new CountingMock({
    resultText: "I did not actually inspect anything",
    events: attackEvents,
  });
  const attackRouted = await routeGovernedVerifierAssignment({
    store: attack.store,
    verifierAssignmentId: attackAuth.persisted!.frozen.assignment.assignmentId,
    provider: attackProvider,
  });
  expectTrue("provider assert routed", attackRouted.dispatched);
  const singleProvider = adjudicateVerifierExecution({
    store: attack.store,
    verifierAssignmentId: attackAuth.persisted!.frozen.assignment.assignmentId,
  });
  expect("provider asserted satisfied alone not VERIFIED", singleProvider.decision, "INDETERMINATE");

  const emptyRefsCase = await persistExecutorWithSyntheticResult("vdec-empty-refs", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-empty-refs" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const emptyPrimary = await prepareRoutedVerifier("vdec-empty-refs", emptyRefsCase.store, emptyRefsCase.evidence.evidenceId, {
    emptyEvidenceRefs: true,
    outcome: "requirement_satisfied",
  });
  const emptyCorroborator = await prepareRoutedVerifier(
    "vdec-empty-refs",
    emptyRefsCase.store,
    emptyRefsCase.evidence.evidenceId,
    { verifierSlot: "corroborator", emptyEvidenceRefs: true, outcome: "requirement_satisfied" },
  );
  expectTrue("empty-ref corroborator routed", emptyCorroborator.routed.dispatched);
  expect(
    "empty evidence refs INDETERMINATE",
    adjudicateVerifierExecution({ store: emptyRefsCase.store, verifierAssignmentId: emptyPrimary.verifierId }).decision,
    "INDETERMINATE",
  );

  section("037-D — two independent corroborated satisfied → VERIFIED");

  const clean = await persistExecutorWithSyntheticResult("vdec-verified-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-verified-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const pair = await prepareCorroboratedPair("vdec-verified-exec", clean.store, clean.evidence.evidenceId, {
    resultTextA: "VERIFIED PASS APPROVED",
    resultTextB: "also PASS",
  });
  const createsBefore = pair.primary.provider.creates + pair.corroborator.provider.creates;
  const first = adjudicateVerifierExecution({ store: clean.store, verifierAssignmentId: pair.primary.verifierId });
  expectTrue("adjudicated", first.adjudicated);
  expect("decision VERIFIED with corroboration", first.decision, "VERIFIED");
  expect(
    "provider creates unchanged during adjudication",
    pair.primary.provider.creates + pair.corroborator.provider.creates,
    createsBefore,
  );

  section("037-D — idempotency and restart");

  const second = adjudicateVerifierExecution({ store: clean.store, verifierAssignmentId: pair.primary.verifierId });
  expectTrue("duplicate reuse", second.duplicateDecisionReused);
  const restarted = createFileEngineeringStore(clean.store.storeRoot);
  expectTrue(
    "restart reconstruction",
    Boolean(
      restarted.findVerificationDecisionForEvidence(
        pair.primary.verifierId,
        first.verifierExecutionEvidenceId ?? "",
      ),
    ),
  );
  expectTrue(
    "restart authoritative findings",
    restarted.loadAuthoritativeSemanticFindings("vdec-verified-exec", clean.evidence.evidenceId).length > 0,
  );

  section("037-D — false VERIFIED regression matrix");

  const proseDefect = await persistExecutorWithSyntheticResult("vdec-fp-prose", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-fp-prose" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const prosePrepared = await prepareRoutedVerifier("vdec-fp-prose", proseDefect.store, proseDefect.evidence.evidenceId, {
    resultText: "CORRECTION REQUIRED: feature AUTH_GATE not implemented.",
    events: [],
  });
  expect(
    "prose defect without proposals",
    adjudicateVerifierExecution({ store: proseDefect.store, verifierAssignmentId: prosePrepared.verifierId }).decision,
    "INDETERMINATE",
  );

  const omitted = await persistExecutorWithSyntheticResult("vdec-fp-omitted", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-fp-omitted" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const omittedPrepared = await prepareRoutedVerifier("vdec-fp-omitted", omitted.store, omitted.evidence.evidenceId, {
    resultText: "all good",
    events: [],
  });
  expect(
    "omitted obligations without proposals",
    adjudicateVerifierExecution({ store: omitted.store, verifierAssignmentId: omittedPrepared.verifierId }).decision,
    "INDETERMINATE",
  );

  section("037-D — machine evidence overrides provider proposal");

  const protectedMutation = await persistExecutorWithSyntheticResult("vdec-protected-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-protected-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["protected.txt"],
    protectedPathMutationOccurred: true,
    unexpectedChanges: ["protected.txt"],
  });
  const protectedPair = await prepareCorroboratedPair(
    "vdec-protected-exec",
    protectedMutation.store,
    protectedMutation.evidence.evidenceId,
  );
  expect(
    "protected mutation CORRECTION_REQUIRED",
    adjudicateVerifierExecution({
      store: protectedMutation.store,
      verifierAssignmentId: protectedPair.primary.verifierId,
    }).decision,
    "CORRECTION_REQUIRED",
  );

  section("037-D — independently corroborated failure");

  const failed = await persistExecutorWithSyntheticResult("vdec-failed-finding-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-failed-finding-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const failedPair = await prepareCorroboratedPair(
    "vdec-failed-finding-exec",
    failed.store,
    failed.evidence.evidenceId,
    { outcome: "requirement_failed" },
  );
  expect(
    "corroborated failed CORRECTION_REQUIRED",
    adjudicateVerifierExecution({ store: failed.store, verifierAssignmentId: failedPair.primary.verifierId }).decision,
    "CORRECTION_REQUIRED",
  );

  section("037-D — disagreement and same-execution");

  const disagree = await persistExecutorWithSyntheticResult("vdec-disagree-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-disagree-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["allowed.txt"],
  });
  const disagreePrimary = await prepareRoutedVerifier(
    "vdec-disagree-exec",
    disagree.store,
    disagree.evidence.evidenceId,
    { outcome: "requirement_satisfied", withValidEvidenceRefs: true },
  );
  const disagreeCorroborator = await prepareRoutedVerifier(
    "vdec-disagree-exec",
    disagree.store,
    disagree.evidence.evidenceId,
    { verifierSlot: "corroborator", outcome: "requirement_failed", withValidEvidenceRefs: true },
  );
  expectTrue("disagree corroborator routed", disagreeCorroborator.routed.dispatched);
  expect(
    "proposal disagreement INDETERMINATE",
    adjudicateVerifierExecution({ store: disagree.store, verifierAssignmentId: disagreePrimary.verifierId }).decision,
    "INDETERMINATE",
  );

  section("037-D — unknown commit/push and required tests");

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
  expect(
    "unknown push evidence INDETERMINATE",
    evaluateExecutorImplementation(unknownGitFixture.assignment, unknownGitEvidence).decision,
    "INDETERMINATE",
  );

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
  // Executor missing tests evidence → may refuse prepare; if prepare works, resolution must be insufficient.
  const testsAuth = authorizeAndFreezeVerifierAssignment({
    store: testsRequired.store,
    executorAssignmentId: "vdec-tests-required-exec",
    executionEvidenceId: testsRequired.evidence.evidenceId,
    humanAuthorized: true,
  });
  if (testsAuth.ready && testsAuth.persisted) {
    const hasRequiredTests = (testsAuth.persisted.frozen.assignment.verificationRequirements ?? []).some(
      (row) => row.requirementKind === "required_tests",
    );
    expectTrue("required_tests in requirement set", hasRequiredTests);
    const resolution = resolveVerifierSemanticFindings({
      store: testsRequired.store,
      executorAssignmentId: "vdec-tests-required-exec",
      executorExecutionEvidenceId: testsRequired.evidence.evidenceId,
    });
    const testFinding = resolution.findings.find((row) => row.requirementId === "req:required_tests");
    expect("required_tests evidence insufficient", testFinding?.outcome, "evidence_insufficient");
  } else {
    expectTrue("tests-required executor not silently trusted", testsAuth.refused || !testsAuth.ready);
  }

  section("037-D — public bypass audit");

  expectFalse("no markVerified export", "markVerified" in packageExports);
  expectFalse("no buildVerificationDecisionRecord export", "buildVerificationDecisionRecord" in packageExports);
  expectFalse("no deriveVerificationDecision export", "deriveVerificationDecision" in packageExports);
  expectTrue("resolveVerifierSemanticFindings exported", "resolveVerifierSemanticFindings" in packageExports);
  expectTrue(
    "captureVerifierSemanticProposalsFromEvidence exported",
    "captureVerifierSemanticProposalsFromEvidence" in packageExports,
  );

  let persistFindingBlocked = false;
  try {
    clean.store.persistVerifierSemanticFinding({} as never);
  } catch {
    persistFindingBlocked = true;
  }
  expectTrue("persistVerifierSemanticFinding closed", persistFindingBlocked);

  section("037-D — proposal capture idempotency");

  const captureAgain = captureVerifierSemanticProposalsFromEvidence({
    store: clean.store,
    verifierAssignmentId: pair.primary.verifierId,
  });
  expectTrue("capture duplicate reuse", captureAgain.duplicateProposalsReused);

  section("037-D — finding hash integrity");

  const findings = clean.store.loadAuthoritativeSemanticFindings("vdec-verified-exec", clean.evidence.evidenceId);
  expectTrue("authoritative findings present", findings.length > 0);
  const tampered = { ...findings[0]!, outcome: "requirement_failed" as const };
  expectFalse("tampered authoritative finding rejected", validateVerifierSemanticFinding(tampered));

  const findingsPath = join(clean.store.storeRoot, "assignments", "vdec-verified-exec", "authoritative-findings.ndjson");
  const lines = readFileSync(findingsPath, "utf8").trim().split(/\r?\n/);
  expectTrue("append-only findings file", lines.length >= 1);
  writeFileSync(findingsPath, `${lines.join("\n")}\n`, "utf8");
}
