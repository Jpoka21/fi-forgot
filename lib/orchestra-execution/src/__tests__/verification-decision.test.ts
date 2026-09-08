import { createHash } from "node:crypto";
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { sortKeys } from "../assignment.js";
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
import { resolveMachineRequirement } from "../engineering-store/machine-requirement-resolver.js";
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
    stdout?: string;
    stderr?: string;
    stdoutSha256?: string;
    stderrSha256?: string;
};

const COMMAND_MATRIX_TIME = "2026-01-01T00:00:00.000Z";
const COMMAND_MATRIX_COMMAND = "npm test";

function commandProvenanceEvent(
  phase: "started" | "completed",
  values: Omit<FutureCommandProvenance, "phase">,
): NormalizedExecutionEvent {
  return {
    type: "tool_invocation",
    timestamp: COMMAND_MATRIX_TIME,
    toolName: "shell_command",
    correlation: {
      providerId: "codex",
      sessionId: "mock-session",
      runId: "mock-run",
      toolUseId: values.commandId,
      providerEventType: phase === "started" ? "item/started" : "item/completed",
    },
    commandExecution: {
      commandId: values.commandId,
      phase,
      command: values.command,
      invocation: [values.command],
      workingDirectory: values.repositoryPath,
      status: values.status,
      exitCode: values.exitCode,
      stdout: values.stdout,
      stderr: values.stderr,
      stdoutSha256: values.stdoutSha256,
      stderrSha256: values.stderrSha256,
      verifierAssignmentId: `vrf-${values.executorAssignmentId}-${values.executorExecutionEvidenceId}`,
      executorAssignmentId: values.executorAssignmentId,
      executorExecutionEvidenceId: values.executorExecutionEvidenceId,
      repositoryPath: values.repositoryPath,
      startingHead: values.head,
      candidatePaths: values.candidatePaths,
      candidateContentSha256: values.candidateContentSha256,
      requiredCheckIds: values.requiredCheckIds,
    },
  };
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

type SemanticMatrixCase = {
  name: string;
  events?: (rows: FutureCommandProvenance[]) => NormalizedExecutionEvent[];
  beforeRoute?: (context: SemanticMatrixContext) => void;
  afterRoute?: (context: SemanticMatrixContext) => void;
  adjudicatedVerifier?: (context: SemanticMatrixContext) => string;
  expectedAdjudicationReason?: string | null;
  expectedOutcome?: "requirement_satisfied" | "requirement_failed" | "evidence_insufficient";
  expectedReason?: string;
  assertReloadEquality?: boolean;
};

type SemanticMatrixContext = Awaited<ReturnType<typeof persistExecutorWithSyntheticResult>> & {
  verifierId: string;
};

function persistVerifierRelationship(
  context: SemanticMatrixContext,
  relationship: { verifiesAssignmentId: string; verifiesExecutionEvidenceId: string },
): void {
  const path = join(context.store.storeRoot, "assignments", context.verifierId, "assignment.json");
  const record = JSON.parse(readFileSync(path, "utf8")) as { relationship: typeof relationship };
  record.relationship = relationship;
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

function persistVerifierAssignmentContext(
  context: SemanticMatrixContext,
  patch: { repositoryPath?: string; startingHead?: string },
): void {
  const existingEvidence = context.store.loadLatestExecutionEvidence(context.verifierId);
  const path = join(context.store.storeRoot, "assignments", context.verifierId, "assignment.json");
  const record = JSON.parse(readFileSync(path, "utf8")) as {
    frozen: ReturnType<typeof createAssignment>;
    relationship: { verifiesAssignmentId?: string; verifiesExecutionEvidenceId?: string };
  };
  record.frozen = createAssignment({
    ...record.frozen.assignment,
    ...patch,
    createdAt: record.frozen.assignment.createdAt,
  });
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  context.store.persistVerifierAuthorizationReceipt({
    assignmentId: context.verifierId,
    assignmentHash: record.frozen.assignmentHash,
    executorAssignmentId: record.relationship.verifiesAssignmentId ?? "",
    executionEvidenceId: record.relationship.verifiesExecutionEvidenceId ?? "",
  });
  if (existingEvidence) {
    const replacement = buildExecutionEvidence({
      frozen: record.frozen,
      result: { ...existingEvidence.result, assignmentHash: record.frozen.assignmentHash },
      providerStarted: true,
    });
    const { evidenceHash: _discardedHash, ...replacementBody } = {
      ...replacement,
      evidenceId: "ev-zzzz-authoritative-context",
    };
    context.store.persistExecutionEvidence({
      ...replacementBody,
      evidenceHash: createHash("sha256").update(JSON.stringify(sortKeys(replacementBody))).digest("hex"),
    });
  }
}

function provenanceEvents(
  rows: FutureCommandProvenance[],
): NormalizedExecutionEvent[] {
  return rows.map(({ phase, ...values }) => commandProvenanceEvent(phase, values));
}

const semanticMatrixCases: SemanticMatrixCase[] = [
  { name: "01 no semantic evidence", events: () => [], expectedOutcome: "evidence_insufficient", expectedReason: "trusted_test_evidence_unavailable" },
  { name: "02 complete passing linked verifier command provenance", expectedOutcome: "requirement_satisfied", expectedReason: "trusted_test_command_evidence_satisfied" },
  { name: "03 one required command absent", events: (rows) => { rows[1]!.requiredCheckIds = []; return provenanceEvents(rows); }, expectedOutcome: "evidence_insufficient", expectedReason: "required_test_command_missing" },
  { name: "04 required command nonzero", events: (rows) => { rows[1]!.exitCode = 1; return provenanceEvents(rows); }, expectedOutcome: "requirement_failed", expectedReason: "test_command_exit_nonzero" },
  { name: "05 missing correlated start", events: (rows) => provenanceEvents(rows.slice(1)), expectedOutcome: "evidence_insufficient", expectedReason: "test_command_start_missing" },
  { name: "06 missing correlated completion", events: (rows) => provenanceEvents(rows.slice(0, 1)), expectedOutcome: "evidence_insufficient", expectedReason: "test_command_completion_missing" },
  { name: "07 wrong authoritative verifier assignment", adjudicatedVerifier: (context) => `${context.verifierId}-wrong`, expectedAdjudicationReason: "verifier_not_found" },
  { name: "08 wrong authoritative verifier-to-executor assignment relationship", beforeRoute: (context) => persistVerifierRelationship(context, { verifiesAssignmentId: "unrelated-executor", verifiesExecutionEvidenceId: context.evidence.evidenceId }), expectedAdjudicationReason: "relationship_mismatch" },
  { name: "09 wrong authoritative verifier-to-executor evidence relationship", beforeRoute: (context) => persistVerifierRelationship(context, { verifiesAssignmentId: context.assignment.assignment.assignmentId, verifiesExecutionEvidenceId: "ev-unrelated" }), expectedAdjudicationReason: "relationship_mismatch" },
  { name: "10 authoritative repository identity mismatch", afterRoute: (context) => persistVerifierAssignmentContext(context, { repositoryPath: `${context.assignment.assignment.repositoryPath}-other` }), expectedOutcome: "requirement_failed", expectedReason: "repository_identity_mismatch" },
  { name: "11 authoritative starting HEAD mismatch", afterRoute: (context) => persistVerifierAssignmentContext(context, { startingHead: "0000000000000000000000000000000000000000" }), expectedOutcome: "requirement_failed", expectedReason: "git_baseline_mismatch" },
  { name: "12 real candidate drift after executor evidence and before verifier execution", beforeRoute: (context) => appendFileSync(context.fixture.allowedPath, "DRIFT_BEFORE_VERIFIER\n", "utf8"), expectedOutcome: "requirement_failed", expectedReason: "candidate_drift_before_verifier_execution" },
  { name: "13 real candidate drift after verifier execution and before adjudication", afterRoute: (context) => appendFileSync(context.fixture.allowedPath, "DRIFT_BEFORE_ADJUDICATION\n", "utf8"), expectedOutcome: "requirement_failed", expectedReason: "candidate_drift_before_adjudication" },
  { name: "14 successful verifier attempt preserves executor evidence exactly", expectedOutcome: "requirement_satisfied", expectedReason: "trusted_test_command_evidence_satisfied", assertReloadEquality: true },
];

async function runSemanticMatrixCase(index: number, matrixCase: SemanticMatrixCase): Promise<void> {
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
  const common: Omit<FutureCommandProvenance, "phase"> = {
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
  const raw: FutureCommandProvenance[] = [
    { ...common, phase: "started" },
    {
      ...common,
      phase: "completed",
      status: "completed" as const,
      exitCode: 0,
      stdout: output,
      stderr: "",
      stdoutSha256: createHash("sha256").update(output).digest("hex"),
      stderrSha256: createHash("sha256").update("").digest("hex"),
    },
  ];
  const trustedSnapshot = structuredClone(executor.evidence);
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: executor.store,
    executorAssignmentId: assignmentId,
    executionEvidenceId: executor.evidence.evidenceId,
    humanAuthorized: true,
  });
  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const requirements = authorized.persisted?.frozen.assignment.verificationRequirements ?? [];
  const context: SemanticMatrixContext = { ...executor, verifierId };
  matrixCase.beforeRoute?.(context);
  const executionHash = createHash("sha256").update(readFileSync(executor.fixture.allowedPath)).digest("hex");
  for (const row of raw) row.candidateContentSha256 = { "allowed.txt": executionHash };
  const events = matrixCase.events ? matrixCase.events(raw) : provenanceEvents(raw);
  await routeGovernedVerifierAssignment({ store: executor.store, verifierAssignmentId: verifierId, provider: new CountingMock({ events }) });
  matrixCase.afterRoute?.(context);
  const adjudicatedVerifier = matrixCase.adjudicatedVerifier?.(context) ?? verifierId;
  const result = adjudicateVerifierExecution({ store: executor.store, verifierAssignmentId: adjudicatedVerifier });
  expect(`${matrixCase.name}: specific adjudication category`, result.reason, matrixCase.expectedAdjudicationReason ?? null);
  const resolution = resolveVerifierSemanticFindings({ store: executor.store, executorAssignmentId: assignmentId, executorExecutionEvidenceId: executor.evidence.evidenceId });
  const requiredTests = requirements.find((row) => row.requirementKind === "required_tests");
  if (requiredTests) {
    resolveMachineRequirement({ requirement: requiredTests, executorRecord: executor.store.loadAssignmentRecord(assignmentId), executorEvidence: executor.evidence });
  }
  if (matrixCase.expectedOutcome) {
    expectTrue(`${matrixCase.name}: production adjudicator ran`, result.adjudicated);
    const finding = result.authoritativeFindings.find((row) => row.requirementId === "req:required_tests") ?? resolution.findings.find((row) => row.requirementId === "req:required_tests");
    expect(`${matrixCase.name}: intended authoritative category`, finding?.outcome, matrixCase.expectedOutcome);
    expect(`${matrixCase.name}: intended production reason`, finding?.reasonCode, matrixCase.expectedReason);
  }
  if (matrixCase.assertReloadEquality) {
    const restarted = createFileEngineeringStore(executor.store.storeRoot);
    expect(`${matrixCase.name}: executor evidence exact deep equality`, restarted.loadExecutionEvidenceById(assignmentId, executor.evidence.evidenceId), trustedSnapshot);
  }
}

async function runFiveCommandRequirementTest(): Promise<void> {
  section("037-E — five frozen verifier commands all correlate and pass");
  const commands = ["check one", "check two", "check three", "check four", "check five"];
  const assignmentId = "vdec-five-command";
  const executor = await persistExecutorWithSyntheticResult(
    assignmentId,
    {
      frozen: createDisposableExecutionFixture({ assignmentId }).assignment,
      providerStatus: "finished",
      changedPaths: ["allowed.txt"],
      normalizedEvents: [{ type: "run_finished", timestamp: COMMAND_MATRIX_TIME }],
    },
    {
      requiredEvidence: ["events", ...commands.map((command) => `test:${command}`)],
      writeAllowedAdapterMarker: true,
    },
  );
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: executor.store,
    executorAssignmentId: assignmentId,
    executionEvidenceId: executor.evidence.evidenceId,
    humanAuthorized: true,
  });
  const verifier = authorized.persisted!;
  const frozenChecks = (verifier.frozen.assignment.verificationRequirements ?? [])
    .flatMap((row) => row.commandRequirement ? [row.commandRequirement] : []);
  expect("five command requirements frozen", frozenChecks.length, 5);
  expect("stable ordered check ids", frozenChecks.map((row) => row.checkId), ["test-1", "test-2", "test-3", "test-4", "test-5"]);
  expect("exact commands frozen", frozenChecks.map((row) => row.command), commands);
  const events: NormalizedExecutionEvent[] = [];
  for (const check of frozenChecks) {
    for (const phase of ["started", "completed"] as const) {
      events.push(commandProvenanceEvent(phase, {
        commandId: `required-check:${check.checkId}`,
        command: check.command,
        repositoryPath: check.repositoryPath,
        head: check.startingHead,
        executorAssignmentId: check.executorAssignmentId,
        executorExecutionEvidenceId: check.executorExecutionEvidenceId,
        candidatePaths: check.candidatePaths,
        candidateContentSha256: Object.fromEntries(Object.entries(check.candidateContentSha256).filter((entry): entry is [string, string] => entry[1] !== null)),
        requiredCheckIds: [check.checkId],
        ...(phase === "completed" ? { status: "completed" as const, exitCode: 0 } : {}),
      }));
    }
  }
  await routeGovernedVerifierAssignment({
    store: executor.store,
    verifierAssignmentId: verifier.frozen.assignment.assignmentId,
    provider: new CountingMock({ events }),
  });
  const adjudicated = adjudicateVerifierExecution({
    store: executor.store,
    verifierAssignmentId: verifier.frozen.assignment.assignmentId,
  });
  const commandFindings = adjudicated.authoritativeFindings.filter((row) => row.requirementId.startsWith("req:required_tests:"));
  expect("all five command findings published", commandFindings.length, 5);
  expectTrue("all five commands required and passed", commandFindings.every((row) => row.outcome === "requirement_satisfied"));
  expect("all five passing commands permit VERIFIED", adjudicated.decision, "VERIFIED");
}

async function runFiveCommandAdversarialContracts(): Promise<void> {
  section("037-E — five-command verifier adversarial contracts");
  const commands = ["check one", "check two", "check three", "check four", "check five"];
  type EventMutator = (events: NormalizedExecutionEvent[]) => NormalizedExecutionEvent[];
  const runCase = async (
    suffix: string,
    mutate: EventMutator,
    expectedCheckId: string,
    expectedReason?: string,
  ): Promise<void> => {
    const assignmentId = `vdec-five-command-${suffix}`;
    const executor = await persistExecutorWithSyntheticResult(
      assignmentId,
      {
        frozen: createDisposableExecutionFixture({ assignmentId }).assignment,
        providerStatus: "finished",
        changedPaths: ["allowed.txt"],
        normalizedEvents: [{ type: "run_finished", timestamp: COMMAND_MATRIX_TIME }],
      },
      { requiredEvidence: ["events", ...commands.map((command) => `test:${command}`)], writeAllowedAdapterMarker: true },
    );
    const trustedExecutorEvidence = structuredClone(executor.evidence);
    const authorized = authorizeAndFreezeVerifierAssignment({
      store: executor.store,
      executorAssignmentId: assignmentId,
      executionEvidenceId: executor.evidence.evidenceId,
      humanAuthorized: true,
    });
    const verifier = authorized.persisted!;
    const checks = (verifier.frozen.assignment.verificationRequirements ?? [])
      .flatMap((row) => row.commandRequirement ? [row.commandRequirement] : []);
    const events = checks.flatMap((check) => ([
      commandProvenanceEvent("started", {
        commandId: `required-check:${check.checkId}`,
        command: check.command,
        repositoryPath: check.repositoryPath,
        head: check.startingHead,
        executorAssignmentId: check.executorAssignmentId,
        executorExecutionEvidenceId: check.executorExecutionEvidenceId,
        candidatePaths: check.candidatePaths,
        candidateContentSha256: Object.fromEntries(Object.entries(check.candidateContentSha256).filter((entry): entry is [string, string] => entry[1] !== null)),
        requiredCheckIds: [check.checkId],
      }),
      commandProvenanceEvent("completed", {
        commandId: `required-check:${check.checkId}`,
        command: check.command,
        repositoryPath: check.repositoryPath,
        head: check.startingHead,
        executorAssignmentId: check.executorAssignmentId,
        executorExecutionEvidenceId: check.executorExecutionEvidenceId,
        candidatePaths: check.candidatePaths,
        candidateContentSha256: Object.fromEntries(Object.entries(check.candidateContentSha256).filter((entry): entry is [string, string] => entry[1] !== null)),
        requiredCheckIds: [check.checkId],
        status: "completed" as const,
        exitCode: 0,
      }),
    ]));
    await routeGovernedVerifierAssignment({
      store: executor.store,
      verifierAssignmentId: verifier.frozen.assignment.assignmentId,
      provider: new CountingMock({ events: mutate(events) }),
    });
    const result = adjudicateVerifierExecution({
      store: executor.store,
      verifierAssignmentId: verifier.frozen.assignment.assignmentId,
    });
    expectFalse(`${suffix}: malformed five-check evidence is not VERIFIED`, result.decision === "VERIFIED");
    const finding = result.authoritativeFindings.find((row) => row.requirementId === `req:required_tests:${expectedCheckId}`);
    expectTrue(`${suffix}: finding remains tied to ${expectedCheckId}`, Boolean(finding));
    expectFalse(`${suffix}: ${expectedCheckId} is not satisfied`, finding?.outcome === "requirement_satisfied");
    if (expectedReason) expect(`${suffix}: specific reason`, finding?.reasonCode, expectedReason);
    expect(`${suffix}: executor evidence remains immutable`, executor.store.loadExecutionEvidenceById(assignmentId, executor.evidence.evidenceId), trustedExecutorEvidence);
  };

  await runCase("missing-one", (events) => events.slice(0, 8), "test-5", "required_test_command_missing");
  await runCase("one-nonzero", (events) => events.map((event) =>
    event.commandExecution?.requiredCheckIds?.[0] === "test-3" && event.commandExecution.phase === "completed"
      ? { ...event, commandExecution: { ...event.commandExecution, exitCode: 1 } }
      : event), "test-3", "test_command_exit_nonzero");
  await runCase("swapped-ids", (events) => events.map((event) => {
    const id = event.commandExecution?.requiredCheckIds?.[0];
    if (id !== "test-1" && id !== "test-2") return event;
    return { ...event, commandExecution: { ...event.commandExecution!, requiredCheckIds: [id === "test-1" ? "test-2" : "test-1"] } };
  }), "test-1", "test_command_binding_mismatch");
  await runCase("one-execution-two-ids", (events) => events.slice(2).map((event, index) => index < 2
    ? { ...event, commandExecution: { ...event.commandExecution!, requiredCheckIds: ["test-1", "test-2"] } }
    : event), "test-1", "test_command_check_id_mismatch");
  await runCase("unexpected-sixth", (events) => {
    const retained = events.slice(0, 8);
    const template = events[8]!.commandExecution!;
    return [...retained,
      { ...events[8]!, commandExecution: { ...template, commandId: "required-check:unexpected", command: "check six", invocation: ["check six"], requiredCheckIds: [] } },
      { ...events[9]!, commandExecution: { ...events[9]!.commandExecution!, commandId: "required-check:unexpected", command: "check six", invocation: ["check six"], requiredCheckIds: [] } },
    ];
  }, "test-5", "test_command_check_id_mismatch");
}

/** Separately invokable forward contract for semantic command evidence. */
export async function runVerifierSemanticCommandEvidenceMatrixTests(): Promise<void> {
  section("037-E — fourteen-case verifier semantic command-evidence matrix");
  const failures: string[] = [];
  for (const [index, matrixCase] of semanticMatrixCases.entries()) {
    try { await runSemanticMatrixCase(index, matrixCase); }
    catch (error) { failures.push(`${matrixCase.name}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  if (failures.length > 0) throw new Error(`semantic evidence matrix failures:\n${failures.join("\n")}`);
}

export async function runVerificationDecisionTests(): Promise<void> {
  await runFiveCommandRequirementTest();
  await runFiveCommandAdversarialContracts();
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
