import { createHash } from "node:crypto";
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { captureVerifierSemanticProposalsFromEvidence } from "../engineering-store/capture-verifier-findings.js";
import {
  authorizeAndFreezeVerifierAssignment,
  verifierAssignmentId,
} from "../engineering-store/prepare-verifier.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { resolveVerifierSemanticFindings } from "../engineering-store/resolve-verifier-findings.js";
import { validateVerifierSemanticFinding } from "../engineering-store/semantic-finding-record.js";
import { evaluateExecutorImplementation } from "../engineering-store/verification-decision-logic.js";
import { allSemanticObligationsSatisfiedEvents } from "./structured-finding-helpers.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import * as packageExports from "../index.js";
import type { NormalizedExecutionEvent } from "../events.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

type FutureCommandProvenance = {
  commandEvidence: {
    commandId: string;
    phase: "started" | "completed";
    command: string;
    repositoryPath: string;
    head: string;
    executorAssignmentId: string;
    executorExecutionEvidenceId: string;
    candidatePaths: string[];
    candidateContentSha256: Record<string, string>;
    requiredCheckIds: string[];
    status?: "completed" | "failed";
    exitCode?: number;
    output?: string;
    outputSha256?: string;
  };
};

const COMMAND_MATRIX_TIME = "2026-01-01T00:00:00.000Z";
const COMMAND_MATRIX_COMMAND = "npm test -- verification-decision";

function commandProvenanceEvent(
  phase: "started" | "completed",
  values: Omit<FutureCommandProvenance["commandEvidence"], "phase">,
): NormalizedExecutionEvent {
  // These are deliberately raw, test-local future provenance fields. Provider
  // payload is evidence input; only the production resolver may give it meaning.
  return {
    type: "tool_invocation",
    timestamp: COMMAND_MATRIX_TIME,
    toolName: "shell_command",
    rawSummary: { commandEvidence: { ...values, phase } },
  } as NormalizedExecutionEvent & { rawSummary: FutureCommandProvenance };
}

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
  options?: {
    requiredEvidence?: string[];
    structuredObligations?: NonNullable<
      ReturnType<typeof createAssignment>["assignment"]["structuredObligations"]
    >;
    writeAllowedAdapterMarker?: boolean;
  },
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
  if (options?.writeAllowedAdapterMarker) {
    appendFileSync(fixture.allowedPath, "ADAPTER_ALLOWED_TEST\n", "utf8");
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
    normalizedEvents:
      overrides.normalizedEvents ?? [{ type: "run_finished", timestamp: new Date().toISOString() }],
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
  const provider = new CountingMock({
    resultText: options.resultText ?? "mock finished",
    events: options.events ?? [],
  });
  const routed = await routeGovernedVerifierAssignment({
    store,
    verifierAssignmentId: verifierId,
    provider,
  });
  return { authorized, verifierId, routed, provider, requirements };
}

type CommandMatrixMutation = (events: FutureCommandProvenance["commandEvidence"][]) => void;

const commandMatrixCases: Array<{
  name: string;
  expectedOutcome: "requirement_satisfied" | "requirement_failed" | "evidence_insufficient";
  expectedReason: string;
  mutate?: CommandMatrixMutation;
}> = [
  {
    name: "01 complete matching successful command provenance",
    expectedOutcome: "requirement_satisfied",
    expectedReason: "trusted_test_command_evidence_satisfied",
  },
  {
    name: "02 command start is required",
    expectedOutcome: "evidence_insufficient",
    expectedReason: "test_command_start_missing",
    mutate: (events) => events.splice(0, 1),
  },
  {
    name: "03 command completion is required",
    expectedOutcome: "evidence_insufficient",
    expectedReason: "test_command_completion_missing",
    mutate: (events) => events.splice(1, 1),
  },
  {
    name: "04 terminal command status is required",
    expectedOutcome: "evidence_insufficient",
    expectedReason: "test_command_status_missing",
    mutate: (events) => { delete events[1]!.status; },
  },
  {
    name: "05 successful command status is required",
    expectedOutcome: "requirement_failed",
    expectedReason: "test_command_status_failed",
    mutate: (events) => { events[1]!.status = "failed"; },
  },
  {
    name: "06 zero exit code is required",
    expectedOutcome: "requirement_failed",
    expectedReason: "test_command_exit_nonzero",
    mutate: (events) => { events[1]!.exitCode = 1; },
  },
  {
    name: "07 captured output is required",
    expectedOutcome: "evidence_insufficient",
    expectedReason: "test_command_output_missing",
    mutate: (events) => { delete events[1]!.output; delete events[1]!.outputSha256; },
  },
  {
    name: "08 start and completion command identity must match",
    expectedOutcome: "evidence_insufficient",
    expectedReason: "test_command_identity_mismatch",
    mutate: (events) => { events[1]!.commandId = "different-command"; },
  },
  {
    name: "09 repository must match frozen executor",
    expectedOutcome: "requirement_failed",
    expectedReason: "test_command_repository_mismatch",
    mutate: (events) => { events[1]!.repositoryPath += "-other"; },
  },
  {
    name: "10 HEAD must match the candidate baseline",
    expectedOutcome: "requirement_failed",
    expectedReason: "test_command_head_mismatch",
    mutate: (events) => { events[1]!.head = "0000000000000000000000000000000000000000"; },
  },
  {
    name: "11 executor assignment and evidence relationship must match",
    expectedOutcome: "requirement_failed",
    expectedReason: "test_command_relationship_mismatch",
    mutate: (events) => { events[1]!.executorExecutionEvidenceId = "ev-unrelated"; },
  },
  {
    name: "12 candidate paths and digests must match",
    expectedOutcome: "requirement_failed",
    expectedReason: "test_command_candidate_mismatch",
    mutate: (events) => { events[1]!.candidateContentSha256["allowed.txt"] = "wrong-digest"; },
  },
  {
    name: "13 every frozen required check must be evidenced",
    expectedOutcome: "evidence_insufficient",
    expectedReason: "required_test_command_missing",
    mutate: (events) => { events[1]!.requiredCheckIds = []; },
  },
];

async function runCommandMatrixCase(
  index: number,
  matrixCase: (typeof commandMatrixCases)[number],
): Promise<void> {
  const assignmentId = `vdec-command-matrix-${String(index + 1).padStart(2, "0")}`;
  const executor = await persistExecutorWithSyntheticResult(
    assignmentId,
    {
      frozen: createDisposableExecutionFixture({ assignmentId }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
      normalizedEvents: [{ type: "run_finished", timestamp: COMMAND_MATRIX_TIME }],
    },
    { requiredEvidence: ["events", "tests"], writeAllowedAdapterMarker: true },
  );
  const output = "1 test passed\n";
  const common: Omit<FutureCommandProvenance["commandEvidence"], "phase"> = {
    commandId: "required-check:test",
    command: COMMAND_MATRIX_COMMAND,
    repositoryPath: executor.assignment.assignment.repositoryPath,
    head: executor.assignment.assignment.startingHead,
    executorAssignmentId: assignmentId,
    executorExecutionEvidenceId: executor.evidence.evidenceId,
    candidatePaths: ["allowed.txt"],
    candidateContentSha256: {
      "allowed.txt": createHash("sha256").update(readFileSync(executor.fixture.allowedPath)).digest("hex"),
    },
    requiredCheckIds: ["test"],
  };
  const raw: FutureCommandProvenance["commandEvidence"][] = [
    { ...common, phase: "started" },
    {
      ...common,
      phase: "completed",
      status: "completed" as const,
      exitCode: 0,
      output,
      outputSha256: createHash("sha256").update(output).digest("hex"),
    },
  ];
  matrixCase.mutate?.(raw);
  const events = raw.map((row) => {
    const { phase, ...values } = row;
    return commandProvenanceEvent(phase, values);
  });
  const verifier = await prepareRoutedVerifier(assignmentId, executor.store, executor.evidence.evidenceId, {
    events,
  });
  const result = adjudicateVerifierExecution({ store: executor.store, verifierAssignmentId: verifier.verifierId });
  expectTrue(`${matrixCase.name}: production adjudicator ran`, result.adjudicated);
  expect(`${matrixCase.name}: no unrelated adjudication refusal`, result.reason, null);
  const finding = result.authoritativeFindings.find((row) => row.requirementId === "req:required_tests");
  expect(`${matrixCase.name}: intended authoritative category`, finding?.outcome, matrixCase.expectedOutcome);
  expect(`${matrixCase.name}: intended production reason`, finding?.reasonCode, matrixCase.expectedReason);
}

/** Separately invokable forward contract for semantic command evidence. */
export async function runVerifierSemanticCommandEvidenceMatrixTests(): Promise<void> {
  section("037-E — fourteen-case verifier semantic command-evidence matrix");
  for (const [index, matrixCase] of commandMatrixCases.entries()) {
    await runCommandMatrixCase(index, matrixCase);
  }

  const assignmentId = "vdec-command-matrix-14";
  const executor = await persistExecutorWithSyntheticResult(
    assignmentId,
    {
      frozen: createDisposableExecutionFixture({ assignmentId }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
    },
    { writeAllowedAdapterMarker: true },
  );
  const trustedSnapshot = structuredClone(executor.evidence);
  const output = "1 test passed\n";
  const provenance = {
    commandId: "required-check:test",
    command: COMMAND_MATRIX_COMMAND,
    repositoryPath: executor.assignment.assignment.repositoryPath,
    head: executor.assignment.assignment.startingHead,
    executorAssignmentId: assignmentId,
    executorExecutionEvidenceId: executor.evidence.evidenceId,
    candidatePaths: ["allowed.txt"],
    candidateContentSha256: {
      "allowed.txt": createHash("sha256").update(readFileSync(executor.fixture.allowedPath)).digest("hex"),
    },
    requiredCheckIds: ["test"],
  };
  const verifier = await prepareRoutedVerifier(assignmentId, executor.store, executor.evidence.evidenceId, {
    events: [
      commandProvenanceEvent("started", provenance),
      commandProvenanceEvent("completed", {
        ...provenance,
        status: "completed",
        exitCode: 0,
        output,
        outputSha256: createHash("sha256").update(output).digest("hex"),
      }),
    ],
  });
  const result = adjudicateVerifierExecution({ store: executor.store, verifierAssignmentId: verifier.verifierId });
  expectTrue("14 successful semantic adjudication ran through production", result.adjudicated);
  const restarted = createFileEngineeringStore(executor.store.storeRoot);
  expect(
    "14 trusted executor evidence reloads with exact deep equality and no mutation",
    restarted.loadExecutionEvidenceById(assignmentId, executor.evidence.evidenceId),
    trustedSnapshot,
  );
}

export async function runVerificationDecisionTests(): Promise<void> {
  await runVerifierSemanticCommandEvidenceMatrixTests();
  section("037-E — two lying verifiers remain INDETERMINATE or objective fail");

  const lie = await persistExecutorWithSyntheticResult(
    "vdec-two-lie",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-two-lie" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
    },
    { writeAllowedAdapterMarker: false },
  );
  const lieAuth = authorizeAndFreezeVerifierAssignment({
    store: lie.store,
    executorAssignmentId: "vdec-two-lie",
    executionEvidenceId: lie.evidence.evidenceId,
    humanAuthorized: true,
    verifierSlot: "primary",
  });
  const lieReqs = lieAuth.persisted!.frozen.assignment.verificationRequirements ?? [];
  const lieEvents = allSemanticObligationsSatisfiedEvents(lieReqs, lie.assignment, lie.evidence.evidenceId);
  await routeGovernedVerifierAssignment({
    store: lie.store,
    verifierAssignmentId: lieAuth.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "LIE primary", events: lieEvents }),
  });
  const lieCorrob = authorizeAndFreezeVerifierAssignment({
    store: lie.store,
    executorAssignmentId: "vdec-two-lie",
    executionEvidenceId: lie.evidence.evidenceId,
    humanAuthorized: true,
    verifierSlot: "corroborator",
  });
  await routeGovernedVerifierAssignment({
    store: lie.store,
    verifierAssignmentId: lieCorrob.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "LIE corroborator", events: lieEvents }),
  });
  const lieDecision = adjudicateVerifierExecution({
    store: lie.store,
    verifierAssignmentId: lieAuth.persisted!.frozen.assignment.assignmentId,
  });
  expectFalse("two lying verifiers not VERIFIED", lieDecision.decision === "VERIFIED");
  expectTrue(
    "two lying verifiers CORRECTION_REQUIRED or INDETERMINATE",
    lieDecision.decision === "CORRECTION_REQUIRED" || lieDecision.decision === "INDETERMINATE",
  );

  section("037-E — homemade corroborator rejected");

  const home = await persistExecutorWithSyntheticResult(
    "vdec-homemade",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-homemade" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
    },
    { writeAllowedAdapterMarker: true },
  );
  const homePrimary = await prepareRoutedVerifier("vdec-homemade", home.store, home.evidence.evidenceId, {
    events: [],
  });
  const homeId = verifierAssignmentId("vdec-homemade", home.evidence.evidenceId, "corroborator");
  const homemade = createAssignment({
    ...homePrimary.authorized.persisted!.frozen.assignment,
    assignmentId: homeId,
    createdAt: homePrimary.authorized.persisted!.frozen.assignment.createdAt,
  });
  home.store.persistFrozenAssignment(homemade, {
    relationship: {
      verifiesAssignmentId: "vdec-homemade",
      verifiesExecutionEvidenceId: home.evidence.evidenceId,
    },
  });
  const homePre = await collectGitEvidence(home.fixture.repositoryPath);
  const homeResult = synthesizeExecutionResult({
    frozen: homemade,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "mock-session",
    runId: "mock-run-home",
    providerStatus: "finished",
    normalizedEvents: allSemanticObligationsSatisfiedEvents(
      homemade.assignment.verificationRequirements ?? [],
      home.assignment,
      home.evidence.evidenceId,
    ),
    providerFinalResultText: "homemade",
    preRunGitEvidence: homePre,
    postRunGitEvidence: homePre,
    policyDenials: [],
    changedPaths: [],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  home.store.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: homemade, result: homeResult, providerStarted: true }),
  );
  captureVerifierSemanticProposalsFromEvidence({ store: home.store, verifierAssignmentId: homeId });
  expect(
    "homemade corroborator has no receipt",
    home.store.findValidVerifierAuthorizationReceipt(homeId, homemade.assignmentHash),
    null,
  );
  const homeDec = adjudicateVerifierExecution({
    store: home.store,
    verifierAssignmentId: homePrimary.verifierId,
  });
  expect("homemade does not block objective VERIFIED", homeDec.decision, "VERIFIED");
  const homeResolution = resolveVerifierSemanticFindings({
    store: home.store,
    executorAssignmentId: "vdec-homemade",
    executorExecutionEvidenceId: home.evidence.evidenceId,
  });
  expectTrue(
    "homemade proposals not loaded as authorized advisory set",
    !homeResolution.proposals.some((row) => row.verifierAssignmentId === homeId),
  );

  section("037-E — objective acceptance VERIFIED");

  const clean = await persistExecutorWithSyntheticResult(
    "vdec-verified-exec",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-verified-exec" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
      providerFinalResultText: "VERIFIED PASS",
    },
    { writeAllowedAdapterMarker: true },
  );
  const prepared = await prepareRoutedVerifier(
    "vdec-verified-exec",
    clean.store,
    clean.evidence.evidenceId,
    { resultText: "provider opinion ignored" },
  );
  const createsBefore = prepared.provider.creates;
  const first = adjudicateVerifierExecution({
    store: clean.store,
    verifierAssignmentId: prepared.verifierId,
  });
  expectTrue("adjudicated", first.adjudicated);
  expect("decision VERIFIED from acceptance checks", first.decision, "VERIFIED");
  expect("provider creates unchanged", prepared.provider.creates, createsBefore);

  section("037-E — idempotency and restart");

  const second = adjudicateVerifierExecution({
    store: clean.store,
    verifierAssignmentId: prepared.verifierId,
  });
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

  section("037-E — acceptance fail and machine override");

  const failedAccept = await persistExecutorWithSyntheticResult(
    "vdec-accept-fail",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-accept-fail" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
    },
    { writeAllowedAdapterMarker: false },
  );
  const failPrepared = await prepareRoutedVerifier(
    "vdec-accept-fail",
    failedAccept.store,
    failedAccept.evidence.evidenceId,
  );
  expect(
    "acceptance fail CORRECTION_REQUIRED",
    adjudicateVerifierExecution({
      store: failedAccept.store,
      verifierAssignmentId: failPrepared.verifierId,
    }).decision,
    "CORRECTION_REQUIRED",
  );

  const protectedMutation = await persistExecutorWithSyntheticResult("vdec-protected-exec", {
    frozen: createDisposableExecutionFixture({ assignmentId: "vdec-protected-exec" }).assignment,
    providerStatus: "finished",
    changedPaths: ["protected.txt"],
    protectedPathMutationOccurred: true,
    unexpectedChanges: ["protected.txt"],
  });
  writeFileSync(protectedMutation.fixture.protectedPath, "protected-initial\nADAPTER_BLOCKED_TEST\n", "utf8");
  const protectedCase = await prepareRoutedVerifier(
    "vdec-protected-exec",
    protectedMutation.store,
    protectedMutation.evidence.evidenceId,
  );
  expect(
    "protected mutation CORRECTION_REQUIRED",
    adjudicateVerifierExecution({
      store: protectedMutation.store,
      verifierAssignmentId: protectedCase.verifierId,
    }).decision,
    "CORRECTION_REQUIRED",
  );

  section("037-E — HUMAN_JUDGMENT_REQUIRED safe sink");

  const human = await persistExecutorWithSyntheticResult(
    "vdec-human-judgment",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-human-judgment" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
    },
    {
      writeAllowedAdapterMarker: true,
      structuredObligations: [
        {
          obligationId: "subjective-ux",
          summary: "UI must feel polished",
          verificationMode: "HUMAN_JUDGMENT_REQUIRED",
        },
      ],
    },
  );
  const humanAuth = authorizeAndFreezeVerifierAssignment({
    store: human.store,
    executorAssignmentId: "vdec-human-judgment",
    executionEvidenceId: human.evidence.evidenceId,
    humanAuthorized: true,
  });
  const humanReqs = humanAuth.persisted!.frozen.assignment.verificationRequirements ?? [];
  await routeGovernedVerifierAssignment({
    store: human.store,
    verifierAssignmentId: humanAuth.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({
      events: allSemanticObligationsSatisfiedEvents(humanReqs, human.assignment, human.evidence.evidenceId),
    }),
  });
  expect(
    "human judgment remains INDETERMINATE",
    adjudicateVerifierExecution({
      store: human.store,
      verifierAssignmentId: humanAuth.persisted!.frozen.assignment.assignmentId,
    }).decision,
    "INDETERMINATE",
  );

  section("037-E — provider prose and public bypass");

  const prose = await persistExecutorWithSyntheticResult(
    "vdec-prose",
    {
      frozen: createDisposableExecutionFixture({ assignmentId: "vdec-prose" }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
      providerFinalResultText: "FAIL CORRECTION REQUIRED VERIFIED",
    },
    { writeAllowedAdapterMarker: true },
  );
  const prosePrepared = await prepareRoutedVerifier("vdec-prose", prose.store, prose.evidence.evidenceId, {
    resultText: "FAIL CORRECTION REQUIRED",
    events: [],
  });
  expect(
    "prose ignored; objective VERIFIED",
    adjudicateVerifierExecution({ store: prose.store, verifierAssignmentId: prosePrepared.verifierId })
      .decision,
    "VERIFIED",
  );

  expectFalse("no markVerified export", "markVerified" in packageExports);
  expectFalse("no buildVerificationDecisionRecord export", "buildVerificationDecisionRecord" in packageExports);
  expectTrue("resolveVerifierSemanticFindings exported", "resolveVerifierSemanticFindings" in packageExports);
  expectTrue("evaluateFrozenAcceptanceCheck exported", "evaluateFrozenAcceptanceCheck" in packageExports);

  let persistFindingBlocked = false;
  try {
    clean.store.persistVerifierSemanticFinding({} as never);
  } catch {
    persistFindingBlocked = true;
  }
  expectTrue("persistVerifierSemanticFinding closed", persistFindingBlocked);

  section("037-E — unknown git and required tests");

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

  const findings = clean.store.loadAuthoritativeSemanticFindings(
    "vdec-verified-exec",
    clean.evidence.evidenceId,
  );
  expectTrue("authoritative findings present", findings.length > 0);
  expectFalse(
    "tampered finding rejected",
    validateVerifierSemanticFinding({ ...findings[0]!, outcome: "requirement_failed" }),
  );
  const findingsPath = join(
    clean.store.storeRoot,
    "assignments",
    "vdec-verified-exec",
    "authoritative-findings.ndjson",
  );
  expectTrue("append-only findings file", readFileSync(findingsPath, "utf8").trim().length > 0);

  const captureAgain = captureVerifierSemanticProposalsFromEvidence({
    store: clean.store,
    verifierAssignmentId: prepared.verifierId,
  });
  expectTrue("proposal capture idempotent", captureAgain.duplicateProposalsReused || captureAgain.captured);
}
