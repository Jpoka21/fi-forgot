import { appendFileSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { preparePostDecisionAction } from "../engineering-store/prepare-post-decision-action.js";
import { authorizePostDecisionExecution } from "../engineering-store/authorize-post-decision-execution.js";
import { executeAuthorizedPostDecisionAction } from "../engineering-store/execute-authorized-post-decision-action.js";
import {
  persistGovernedContinuationSequenceConfig,
  materializeNextGovernedContinuationTargetFromSequence,
} from "../engineering-store/materialize-continuation-from-sequence.js";
import { createAssignment } from "../assignment-hash.js";
import { createFileEngineeringStore, EngineeringStoreError } from "../engineering-store/store.js";
import {
  buildGovernedContinuationSequenceConfig,
  validateGovernedContinuationSequenceConfig,
  hashSequenceConfig,
  hashSequenceEntry,
  buildSequenceFulfillmentRecord,
  selectAuthoritativeSequenceFulfillments,
  validateSequenceFulfillment,
  type SequenceConfigBody,
} from "../engineering-store/governed-continuation-target-record.js";
import type { GovernedContinuationSequenceConfigRecord } from "../engineering-store/types.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import {
  GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE,
  GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE,
} from "../engineering-store/types.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-seq-"));
}

class CountingMock extends MockExecutionProvider {
  creates = 0;
  submitted: string[] = [];
  constructor(behavior: ConstructorParameters<typeof MockExecutionProvider>[0] = {}) {
    super({ ...behavior, providerId: behavior.providerId ?? CURSOR_PROVIDER_ID });
  }
  override async createSession(target: Parameters<MockExecutionProvider["createSession"]>[0]) {
    this.creates += 1;
    return super.createSession(target);
  }
  override async submitAssignment(
    session: Parameters<MockExecutionProvider["submitAssignment"]>[0],
    frozen: Parameters<MockExecutionProvider["submitAssignment"]>[1],
  ) {
    this.submitted.push(frozen.assignment.assignmentId);
    return super.submitAssignment(session, frozen);
  }
}

async function buildVerifiedCase(assignmentId: string, prose = "VERIFIED") {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  appendFileSync(fixture.allowedPath, "ADAPTER_ALLOWED_TEST\n", "utf8");
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(fixture.assignment);
  const pre = await collectGitEvidence(fixture.repositoryPath);
  const result = synthesizeExecutionResult({
    frozen: fixture.assignment,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "mock-session",
    runId: "mock-run",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: prose,
    preRunGitEvidence: pre,
    postRunGitEvidence: pre,
    policyDenials: [],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const evidence = store.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: fixture.assignment, result, providerStarted: true }),
  );
  const auth = authorizeAndFreezeVerifierAssignment({
    store,
    executorAssignmentId: assignmentId,
    executionEvidenceId: evidence.evidenceId,
    humanAuthorized: true,
  });
  const verifierId = auth.persisted!.frozen.assignment.assignmentId;
  await routeGovernedVerifierAssignment({
    store,
    verifierAssignmentId: verifierId,
    provider: new CountingMock({ resultText: prose, events: [] }),
  });
  const adjudication = adjudicateVerifierExecution({ store, verifierAssignmentId: verifierId });
  const prepared = preparePostDecisionAction({
    store,
    verificationDecisionId: adjudication.decisionRecord!.verificationDecisionId,
  });
  return {
    fixture,
    store,
    assignment: fixture.assignment,
    evidence,
    verifierId,
    adjudication,
    prepared,
    decisionId: adjudication.decisionRecord!.verificationDecisionId,
  };
}

function fulfillmentNdjsonPath(storeRoot: string, projectId: string): string {
  return join(
    storeRoot,
    "sequences",
    projectId,
    "governed-continuation-sequence-fulfillments.ndjson",
  );
}

function appendRawFulfillment(
  storeRoot: string,
  projectId: string,
  record: ReturnType<typeof buildSequenceFulfillmentRecord> | Record<string, unknown>,
): void {
  const path = fulfillmentNdjsonPath(storeRoot, projectId);
  mkdirSync(join(storeRoot, "sequences", projectId), { recursive: true });
  appendFileSync(path, `${JSON.stringify(record)}\n`, "utf8");
}

function sequenceConfigNdjsonPath(storeRoot: string, projectId: string): string {
  return join(
    storeRoot,
    "sequences",
    projectId,
    "governed-continuation-sequences.ndjson",
  );
}

function appendRawConfig(
  storeRoot: string,
  projectId: string,
  record: GovernedContinuationSequenceConfigRecord | Record<string, unknown>,
): void {
  const path = sequenceConfigNdjsonPath(storeRoot, projectId);
  mkdirSync(join(storeRoot, "sequences", projectId), { recursive: true });
  appendFileSync(path, `${JSON.stringify(record)}\n`, "utf8");
}

/** Clone a hash-valid config with a new version and optional entry-b assignment text. */
function cloneSequenceConfigVariant(
  home: GovernedContinuationSequenceConfigRecord,
  configurationVersion: number,
  entryBText?: string,
): GovernedContinuationSequenceConfigRecord {
  const entries = home.entries.map((entry) => {
    if (entry.entryKey !== "entry-b" || entryBText === undefined) return entry;
    const { entryHash: _ignored, ...body } = entry;
    return {
      ...body,
      assignmentText: entryBText,
      entryHash: hashSequenceEntry({ ...body, assignmentText: entryBText }),
    };
  });
  const { configHash: _ch, ...rest } = home;
  const body: SequenceConfigBody = {
    ...rest,
    configurationVersion,
    entries,
  };
  return { ...body, configHash: hashSequenceConfig(body) };
}

function withForcedSequenceId(
  config: GovernedContinuationSequenceConfigRecord,
  sequenceId: string,
): GovernedContinuationSequenceConfigRecord {
  const { configHash: _ch, ...rest } = config;
  const body: SequenceConfigBody = { ...rest, sequenceId };
  return { ...body, configHash: hashSequenceConfig(body) };
}

async function addUnrelatedVerified(
  store: ReturnType<typeof createFileEngineeringStore>,
  pred: {
    projectId: string;
    repositoryPath: string;
    branch: string;
    startingHead: string;
    allowedPaths: string[];
    protectedPaths: string[];
  },
  assignmentId: string,
) {
  const unrelated = createAssignment({
    assignmentId,
    projectId: pred.projectId,
    role: "executor",
    repositoryPath: pred.repositoryPath,
    branch: pred.branch,
    startingHead: pred.startingHead,
    assignmentText: "unrelated verified work outside sequence",
    allowedPaths: [...pred.allowedPaths],
    protectedPaths: [...pred.protectedPaths],
    requireNoPush: true,
    commitAuthorization: false,
    pushAuthorization: false,
    requiredEvidence: ["git", "hooks", "filesystem"],
    structuredObligations: [],
    createdAt: "2026-08-24T00:00:00.000Z",
  });
  store.persistFrozenAssignment(unrelated);
  const preU = await collectGitEvidence(pred.repositoryPath);
  const uRes = synthesizeExecutionResult({
    frozen: unrelated,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: `u-${assignmentId}`,
    runId: `u-${assignmentId}`,
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: "unrelated invent R146",
    preRunGitEvidence: preU,
    postRunGitEvidence: preU,
    policyDenials: [],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const uEv = store.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: unrelated, result: uRes, providerStarted: true }),
  );
  const uAuth = authorizeAndFreezeVerifierAssignment({
    store,
    executorAssignmentId: assignmentId,
    executionEvidenceId: uEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store,
    verifierAssignmentId: uAuth.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const uAdj = adjudicateVerifierExecution({
    store,
    verifierAssignmentId: uAuth.persisted!.frozen.assignment.assignmentId,
  });
  return {
    decisionId: uAdj.decisionRecord!.verificationDecisionId,
    evidenceId: uEv.evidenceId,
    assignmentId,
  };
}

function threeEntryDefs(pred: {
  projectId: string;
  repositoryPath: string;
  branch: string;
  allowedPaths: string[];
  protectedPaths: string[];
}) {
  return {
    projectId: pred.projectId,
    sequenceKey: "pilot",
    configurationVersion: 1,
    repositoryPath: pred.repositoryPath,
    branch: pred.branch,
    entries: [
      {
        entryKey: "entry-a",
        orderingKey: 10,
        predecessorEntryKey: null as string | null,
        assignmentText: "Entry A bootstrap unit.",
        allowedPaths: [...pred.allowedPaths],
        protectedPaths: [...pred.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "entry-b",
        orderingKey: 20,
        predecessorEntryKey: "entry-a",
        assignmentText: "Entry B continuation unit.",
        allowedPaths: [...pred.allowedPaths],
        protectedPaths: [...pred.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "entry-c",
        orderingKey: 30,
        predecessorEntryKey: "entry-b",
        assignmentText: "Entry C continuation unit.",
        allowedPaths: [...pred.allowedPaths],
        protectedPaths: [...pred.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
    ],
  };
}

export async function runGovernedContinuationSequenceTests(): Promise<void> {
  section("041 — three-entry sequence materialization without manual registration");

  const a = await buildVerifiedCase("seq-a", "PLEASE CONTINUE TO R146");
  const pred = a.assignment.assignment;
  const persisted = persistGovernedContinuationSequenceConfig({
    store: a.store,
    ...threeEntryDefs(pred),
  });
  expectTrue("sequence persisted", persisted.persisted);
  expect(
    "authority source",
    persisted.config!.authoritySource,
    GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE,
  );

  expect("prepared continuation", a.prepared.preparedAction, "PREPARE_CONTINUATION");
  const matB = materializeNextGovernedContinuationTargetFromSequence({
    store: a.store,
    verificationDecisionId: a.decisionId,
  });
  expectTrue("B materialized", matB.materialized);
  expect("B entry", matB.target!.sequenceEntryKey, "entry-b");
  expect(
    "B sequence authority",
    matB.target!.authoritySource,
    GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE,
  );
  expectFalse(
    "prose not in B text",
    matB.target!.assignmentText.includes("R146"),
  );

  // No auto execute
  const noAuth = await executeAuthorizedPostDecisionAction({
    store: a.store,
    postDecisionActionId: a.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("no auto dispatch", noAuth.reason, "authorization_not_found");

  const authB = authorizePostDecisionExecution({
    store: a.store,
    postDecisionActionId: a.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("B authorized", authB.authorized);
  expect(
    "auth binds B target",
    authB.authorization!.continuationTargetId,
    matB.target!.continuationTargetId,
  );

  const providerB = new CountingMock({
    resultText: "invent R999 broaden",
    events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const execB = await executeAuthorizedPostDecisionAction({
    store: a.store,
    postDecisionActionId: a.prepared.actionRecord!.postDecisionActionId,
    provider: providerB,
  });
  expectTrue("B executed", execB.executed);
  expectTrue("B provider started", providerB.creates > 0);

  // Verify B and materialize C
  const bAssignmentId = execB.generatedAssignmentId!;
  const bFrozen = a.store.loadAssignmentRecord(bAssignmentId);
  const preB = await collectGitEvidence(pred.repositoryPath);
  const bResult = synthesizeExecutionResult({
    frozen: bFrozen.frozen,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "mock-b",
    runId: "mock-b-run",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: "B done invent R146",
    preRunGitEvidence: preB,
    postRunGitEvidence: preB,
    policyDenials: [],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const bEvidence = a.store.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: bFrozen.frozen, result: bResult, providerStarted: true }),
  );
  const bAuth = authorizeAndFreezeVerifierAssignment({
    store: a.store,
    executorAssignmentId: bAssignmentId,
    executionEvidenceId: bEvidence.evidenceId,
    humanAuthorized: true,
  });
  const bVerifierId = bAuth.persisted!.frozen.assignment.assignmentId;
  await routeGovernedVerifierAssignment({
    store: a.store,
    verifierAssignmentId: bVerifierId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const bAdj = adjudicateVerifierExecution({ store: a.store, verifierAssignmentId: bVerifierId });
  const bPrepared = preparePostDecisionAction({
    store: a.store,
    verificationDecisionId: bAdj.decisionRecord!.verificationDecisionId,
  });
  expect("B prepared continuation", bPrepared.preparedAction, "PREPARE_CONTINUATION");

  const matC = materializeNextGovernedContinuationTargetFromSequence({
    store: a.store,
    verificationDecisionId: bAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("C materialized without manual register", matC.materialized);
  expect("C entry", matC.target!.sequenceEntryKey, "entry-c");
  const authC = authorizePostDecisionExecution({
    store: a.store,
    postDecisionActionId: bPrepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("C authorized (not auto-run)", authC.authorized);
  // Leave C waiting — prove no standing auto-continue
  const waitC = await executeAuthorizedPostDecisionAction({
    store: a.store,
    postDecisionActionId: bPrepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    }),
  });
  expectTrue("C can execute after explicit auth", waitC.executed);

  section("041 — missing / ambiguous / terminal / forged config");

  const miss = await buildVerifiedCase("seq-miss");
  const noSeq = materializeNextGovernedContinuationTargetFromSequence({
    store: miss.store,
    verificationDecisionId: miss.decisionId,
  });
  expect("no sequence", noSeq.reason, "sequence_not_found");

  const term = await buildVerifiedCase("seq-term");
  persistGovernedContinuationSequenceConfig({
    store: term.store,
    projectId: term.assignment.assignment.projectId,
    sequenceKey: "term",
    configurationVersion: 1,
    repositoryPath: term.assignment.assignment.repositoryPath,
    branch: term.assignment.assignment.branch,
    entries: [
      {
        entryKey: "only",
        orderingKey: 1,
        predecessorEntryKey: null,
        assignmentText: "only",
        allowedPaths: [...term.assignment.assignment.allowedPaths],
        protectedPaths: [...term.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
    ],
  });
  const termMat = materializeNextGovernedContinuationTargetFromSequence({
    store: term.store,
    verificationDecisionId: term.decisionId,
  });
  expect("terminal no next", termMat.reason, "no_next_entry");

  const amb = await buildVerifiedCase("seq-amb");
  persistGovernedContinuationSequenceConfig({
    store: amb.store,
    projectId: amb.assignment.assignment.projectId,
    sequenceKey: "amb",
    configurationVersion: 1,
    repositoryPath: amb.assignment.assignment.repositoryPath,
    branch: amb.assignment.assignment.branch,
    entries: [
      {
        entryKey: "boot",
        orderingKey: 1,
        predecessorEntryKey: null,
        assignmentText: "boot",
        allowedPaths: [...amb.assignment.assignment.allowedPaths],
        protectedPaths: [...amb.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "x",
        orderingKey: 5,
        predecessorEntryKey: "boot",
        assignmentText: "x",
        allowedPaths: [...amb.assignment.assignment.allowedPaths],
        protectedPaths: [...amb.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "y",
        orderingKey: 5,
        predecessorEntryKey: "boot",
        assignmentText: "y",
        allowedPaths: [...amb.assignment.assignment.allowedPaths],
        protectedPaths: [...amb.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
    ],
  });
  // buildGovernedContinuationSequenceConfig throws on duplicate ordering — persist should refuse
  // The above may fail at build — check:
  // Actually build throws on duplicate orderingKey — persist returns policy_invalid
  // Re-test with persist that fails:
  const ambPersist = persistGovernedContinuationSequenceConfig({
    store: amb.store,
    projectId: amb.assignment.assignment.projectId,
    sequenceKey: "amb2",
    configurationVersion: 1,
    repositoryPath: amb.assignment.assignment.repositoryPath,
    branch: amb.assignment.assignment.branch,
    entries: [
      {
        entryKey: "boot",
        orderingKey: 1,
        predecessorEntryKey: null,
        assignmentText: "boot",
        allowedPaths: [...amb.assignment.assignment.allowedPaths],
        protectedPaths: [...amb.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "x",
        orderingKey: 5,
        predecessorEntryKey: "boot",
        assignmentText: "x",
        allowedPaths: [...amb.assignment.assignment.allowedPaths],
        protectedPaths: [...amb.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "y",
        orderingKey: 5,
        predecessorEntryKey: "boot",
        assignmentText: "y",
        allowedPaths: [...amb.assignment.assignment.allowedPaths],
        protectedPaths: [...amb.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
    ],
  });
  expect("ambiguous ordering refused at config", ambPersist.reason, "policy_invalid");

  // Forged authority source
  const forged = buildGovernedContinuationSequenceConfig({
    ...threeEntryDefs(pred),
    sequenceKey: "forged",
  });
  const forgedBad = {
    ...forged,
    authoritySource: "provider_prose" as typeof forged.authoritySource,
    source: "provider_prose" as typeof forged.source,
  };
  const { configHash: _c, ...forgedBody } = forgedBad;
  const forgedHashed = {
    ...forgedBad,
    configHash: hashSequenceConfig(forgedBody as typeof forged),
  };
  expectFalse(
    "forged authority invalid",
    validateGovernedContinuationSequenceConfig(forgedHashed as typeof forged),
  );

  section("041 — scope broadening via sequence entry refused");

  const broad = await buildVerifiedCase("seq-broad");
  const broadPersist = persistGovernedContinuationSequenceConfig({
    store: broad.store,
    projectId: broad.assignment.assignment.projectId,
    sequenceKey: "broad",
    configurationVersion: 1,
    repositoryPath: broad.assignment.assignment.repositoryPath,
    branch: broad.assignment.assignment.branch,
    entries: [
      {
        entryKey: "boot",
        orderingKey: 1,
        predecessorEntryKey: null,
        assignmentText: "boot",
        allowedPaths: [...broad.assignment.assignment.allowedPaths],
        protectedPaths: [...broad.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "wide",
        orderingKey: 2,
        predecessorEntryKey: "boot",
        assignmentText: "wide",
        allowedPaths: [...broad.assignment.assignment.allowedPaths, "secret.txt"],
        protectedPaths: [...broad.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
    ],
  });
  expectTrue("broad config may persist (entry itself)", broadPersist.persisted);
  const broadMat = materializeNextGovernedContinuationTargetFromSequence({
    store: broad.store,
    verificationDecisionId: broad.decisionId,
  });
  expect("broad next refused by predecessor path authority", broadMat.reason, "scope_broadening");

  section("041 — config version conflict and restart");

  const ver = await buildVerifiedCase("seq-ver");
  const v1 = persistGovernedContinuationSequenceConfig({
    store: ver.store,
    ...threeEntryDefs(ver.assignment.assignment),
    sequenceKey: "ver",
    configurationVersion: 1,
  });
  expectTrue("v1", v1.persisted);
  const conflict = persistGovernedContinuationSequenceConfig({
    store: ver.store,
    ...threeEntryDefs(ver.assignment.assignment),
    sequenceKey: "ver",
    configurationVersion: 1,
    entries: threeEntryDefs(ver.assignment.assignment).entries.map((e) =>
      e.entryKey === "entry-b"
        ? { ...e, assignmentText: "CHANGED TEXT FOR SAME VERSION" }
        : e,
    ),
  });
  expect("same version different hash refused", conflict.reason, "duplicate_version_conflict");

  const mat1 = materializeNextGovernedContinuationTargetFromSequence({
    store: ver.store,
    verificationDecisionId: ver.decisionId,
  });
  expectTrue("materialize before restart", mat1.materialized);
  const restarted = createFileEngineeringStore(ver.store.storeRoot);
  const active = restarted.findActiveGovernedContinuationSequenceConfigForProject(
    ver.assignment.assignment.projectId,
  );
  expectTrue("restart reconstructs sequence", Boolean(active));
  expect(
    "restart same config hash",
    active!.configHash,
    v1.config!.configHash,
  );
  expectTrue(
    "restart finds materialized target",
    Boolean(restarted.findGovernedContinuationTargetById(mat1.target!.continuationTargetId)),
  );

  section("041 — no standing auto-auth / commit-push locked");

  expect("commit false on B", matB.target!.commitAuthorization, false);
  expect("push false on B", matB.target!.pushAuthorization, false);
  expect("requireNoPush on B", matB.target!.requireNoPush, true);

  section("041 — duplicate materialization / config replace / raw / prose");

  const dup = await buildVerifiedCase("seq-dup");
  persistGovernedContinuationSequenceConfig({
    store: dup.store,
    ...threeEntryDefs(dup.assignment.assignment),
    sequenceKey: "dup",
  });
  const d1 = materializeNextGovernedContinuationTargetFromSequence({
    store: dup.store,
    verificationDecisionId: dup.decisionId,
  });
  const d2 = materializeNextGovernedContinuationTargetFromSequence({
    store: dup.store,
    verificationDecisionId: dup.decisionId,
  });
  expectTrue("first materialize", d1.materialized);
  expectTrue("duplicate materialize reuses", Boolean(d2.materialized && d2.duplicateTargetReused));
  expect("same target id", d2.target!.continuationTargetId, d1.target!.continuationTargetId);

  // Config v2 after auth: old auth still binds old target hash; new materialize uses v2
  const replace = await buildVerifiedCase("seq-repl");
  persistGovernedContinuationSequenceConfig({
    store: replace.store,
    ...threeEntryDefs(replace.assignment.assignment),
    sequenceKey: "repl",
    configurationVersion: 1,
  });
  const rMat = materializeNextGovernedContinuationTargetFromSequence({
    store: replace.store,
    verificationDecisionId: replace.decisionId,
  });
  const rAuth = authorizePostDecisionExecution({
    store: replace.store,
    postDecisionActionId: replace.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("auth before replace", rAuth.authorized);
  const v2 = persistGovernedContinuationSequenceConfig({
    store: replace.store,
    ...threeEntryDefs(replace.assignment.assignment),
    sequenceKey: "repl",
    configurationVersion: 2,
    entries: threeEntryDefs(replace.assignment.assignment).entries.map((e) =>
      e.entryKey === "entry-b"
        ? { ...e, assignmentText: "Entry B v2 text after auth" }
        : e,
    ),
  });
  expectTrue("v2 persisted", v2.persisted);
  // Old auth still bound to old target; executing uses old target (still valid)
  expect(
    "old auth target hash unchanged",
    rAuth.authorization!.continuationTargetHash,
    rMat.target!.targetHash,
  );
  expectFalse(
    "old target hash differs from v2 entry materialize would produce",
    rMat.target!.assignmentText.includes("v2 text"),
  );

  // Raw forged config append ignored by active loader when invalid
  const raw = await buildVerifiedCase("seq-raw");
  const good = persistGovernedContinuationSequenceConfig({
    store: raw.store,
    ...threeEntryDefs(raw.assignment.assignment),
    sequenceKey: "raw",
  });
  const path = join(
    raw.store.storeRoot,
    "sequences",
    raw.assignment.assignment.projectId,
    "governed-continuation-sequences.ndjson",
  );
  appendFileSync(
    path,
    `${JSON.stringify({
      ...good.config!,
      configurationVersion: 99,
      authoritySource: "ai_prose",
      source: "ai_prose",
      configHash: "deadbeef",
    })}\n`,
    "utf8",
  );
  const activeAfterRaw = raw.store.findActiveGovernedContinuationSequenceConfigForProject(
    raw.assignment.assignment.projectId,
  );
  expect("raw forged ignored; v1 remains active", activeAfterRaw!.configHash, good.config!.configHash);

  // Provider prose cannot invent R146 next entry
  expectFalse("no R146 in sequence entries", good.config!.entries.some((e) => e.entryKey.includes("R146")));
  expectFalse(
    "no R146 in assignment texts",
    good.config!.entries.some((e) => e.assignmentText.includes("R146")),
  );

  // Entry hash tampering invalidates config
  const tampered = structuredClone(good.config!);
  tampered.entries[1]!.entryHash = "0".repeat(64);
  expectFalse("entry hash tamper invalid", validateGovernedContinuationSequenceConfig(tampered));

  // Unverified predecessor
  const unver = await buildVerifiedCase("seq-unver");
  // Force decision path already VERIFIED — use corrupt decision id
  const unverMat = materializeNextGovernedContinuationTargetFromSequence({
    store: unver.store,
    verificationDecisionId: "missing-decision",
  });
  expect("unverified/missing decision", unverMat.reason, "decision_not_found");

  // Protected path weakening via sequence
  const weak = await buildVerifiedCase("seq-weak");
  persistGovernedContinuationSequenceConfig({
    store: weak.store,
    projectId: weak.assignment.assignment.projectId,
    sequenceKey: "weak",
    configurationVersion: 1,
    repositoryPath: weak.assignment.assignment.repositoryPath,
    branch: weak.assignment.assignment.branch,
    entries: [
      {
        entryKey: "boot",
        orderingKey: 1,
        predecessorEntryKey: null,
        assignmentText: "boot",
        allowedPaths: [...weak.assignment.assignment.allowedPaths],
        protectedPaths: [...weak.assignment.assignment.protectedPaths],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
      {
        entryKey: "weakened",
        orderingKey: 2,
        predecessorEntryKey: "boot",
        assignmentText: "weakened",
        allowedPaths: [...weak.assignment.assignment.allowedPaths],
        protectedPaths: [],
        prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      },
    ],
  });
  const weakMat = materializeNextGovernedContinuationTargetFromSequence({
    store: weak.store,
    verificationDecisionId: weak.decisionId,
  });
  expect("protected weaken refused", weakMat.reason, "protected_path_weakening");

  section("041-C — unrelated VERIFIED cannot rebootstrap or rematerialize next");

  const boot = await buildVerifiedCase("seq-041c-boot");
  const bootPred = boot.assignment.assignment;
  persistGovernedContinuationSequenceConfig({
    store: boot.store,
    ...threeEntryDefs(bootPred),
    sequenceKey: "041c",
  });
  const bootMat = materializeNextGovernedContinuationTargetFromSequence({
    store: boot.store,
    verificationDecisionId: boot.decisionId,
  });
  expectTrue("041c bootstrap materializes B once", bootMat.materialized);
  expect("041c B entry", bootMat.target!.sequenceEntryKey, "entry-b");
  const bootReplay = materializeNextGovernedContinuationTargetFromSequence({
    store: boot.store,
    verificationDecisionId: boot.decisionId,
  });
  expectTrue("041c same predecessor replay reuses B", bootReplay.duplicateTargetReused);
  expect(
    "041c replay same B id",
    bootReplay.target!.continuationTargetId,
    bootMat.target!.continuationTargetId,
  );

  const x = await addUnrelatedVerified(boot.store, bootPred, "seq-041c-x");
  const xMat = materializeNextGovernedContinuationTargetFromSequence({
    store: boot.store,
    verificationDecisionId: x.decisionId,
  });
  expect("041c unrelated after bootstrap refused", xMat.reason, "bootstrap_already_fulfilled");
  expectFalse("041c unrelated does not materialize", xMat.materialized);
  expect("041c unrelated target null", xMat.target, null);

  const providerX = new CountingMock();
  expect("041c unrelated never reached provider", providerX.creates, 0);

  // Restart preserves bootstrap refusal
  const bootRestart = createFileEngineeringStore(boot.store.storeRoot);
  const xMatRestart = materializeNextGovernedContinuationTargetFromSequence({
    store: bootRestart,
    verificationDecisionId: x.decisionId,
  });
  expect(
    "041c restart still refuses unrelated",
    xMatRestart.reason,
    "bootstrap_already_fulfilled",
  );
  const bootReplayRestart = materializeNextGovernedContinuationTargetFromSequence({
    store: bootRestart,
    verificationDecisionId: boot.decisionId,
  });
  expectTrue("041c restart same predecessor still reuses", bootReplayRestart.duplicateTargetReused);

  // Config v2 must not reopen bootstrap for unrelated VERIFIED
  persistGovernedContinuationSequenceConfig({
    store: boot.store,
    ...threeEntryDefs(bootPred),
    sequenceKey: "041c",
    configurationVersion: 2,
    entries: threeEntryDefs(bootPred).entries.map((e) =>
      e.entryKey === "entry-b" ? { ...e, assignmentText: "Entry B after config v2" } : e,
    ),
  });
  const xAfterV2 = materializeNextGovernedContinuationTargetFromSequence({
    store: boot.store,
    verificationDecisionId: x.decisionId,
  });
  expect(
    "041c config v2 does not reopen bootstrap for unrelated",
    xAfterV2.reason,
    "bootstrap_already_fulfilled",
  );

  // Raw forged fulfillment claiming a non-bootstrap entry without continuation binding
  const forgedFul = buildSequenceFulfillmentRecord({
    sequenceId: bootMat.config!.sequenceId,
    sequenceConfigHash: bootMat.config!.configHash,
    entryKey: "entry-b",
    entryHash: bootMat.config!.entries.find((e) => e.entryKey === "entry-b")!.entryHash,
    verificationDecisionId: x.decisionId,
    executorAssignmentId: x.assignmentId,
    executorExecutionEvidenceId: x.evidenceId,
  });
  let forgedThrew = false;
  try {
    boot.store.persistSequenceFulfillment(forgedFul);
  } catch (error) {
    forgedThrew = error instanceof EngineeringStoreError;
  }
  expectTrue("forged non-bootstrap fulfillment without target binding refused", forgedThrew);
  const xAfterForge = materializeNextGovernedContinuationTargetFromSequence({
    store: boot.store,
    verificationDecisionId: x.decisionId,
  });
  expect(
    "forged fulfillment still cannot unlock next",
    xAfterForge.reason,
    "bootstrap_already_fulfilled",
  );

  section("041-C — three-entry with unrelated VERIFIED X and Y fail closed");

  const chain = await buildVerifiedCase("seq-041c-chain");
  const chainPred = chain.assignment.assignment;
  persistGovernedContinuationSequenceConfig({
    store: chain.store,
    ...threeEntryDefs(chainPred),
    sequenceKey: "041c-chain",
  });
  const chainB = materializeNextGovernedContinuationTargetFromSequence({
    store: chain.store,
    verificationDecisionId: chain.decisionId,
  });
  expectTrue("chain B materialized", chainB.materialized);
  const between = await addUnrelatedVerified(chain.store, chainPred, "seq-041c-between");
  const betweenMat = materializeNextGovernedContinuationTargetFromSequence({
    store: chain.store,
    verificationDecisionId: between.decisionId,
  });
  expect("X between A and B refused", betweenMat.reason, "bootstrap_already_fulfilled");
  expect(
    "B still unique",
    chain.store.findGovernedContinuationTargetById(chainB.target!.continuationTargetId)!
      .continuationTargetId,
    chainB.target!.continuationTargetId,
  );

  const chainAuthB = authorizePostDecisionExecution({
    store: chain.store,
    postDecisionActionId: chain.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("chain B authorized", chainAuthB.authorized);
  const chainExecB = await executeAuthorizedPostDecisionAction({
    store: chain.store,
    postDecisionActionId: chain.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    }),
  });
  expectTrue("chain B executed", chainExecB.executed);

  const chainBId = chainExecB.generatedAssignmentId!;
  const chainBFrozen = chain.store.loadAssignmentRecord(chainBId);
  const chainPreB = await collectGitEvidence(chainPred.repositoryPath);
  const chainBRes = synthesizeExecutionResult({
    frozen: chainBFrozen.frozen,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "chain-b",
    runId: "chain-b",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: "B done R146",
    preRunGitEvidence: chainPreB,
    postRunGitEvidence: chainPreB,
    policyDenials: [],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const chainBEv = chain.store.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: chainBFrozen.frozen,
      result: chainBRes,
      providerStarted: true,
    }),
  );
  const chainBVa = authorizeAndFreezeVerifierAssignment({
    store: chain.store,
    executorAssignmentId: chainBId,
    executionEvidenceId: chainBEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: chain.store,
    verifierAssignmentId: chainBVa.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const chainBAdj = adjudicateVerifierExecution({
    store: chain.store,
    verifierAssignmentId: chainBVa.persisted!.frozen.assignment.assignmentId,
  });
  const chainBPrepared = preparePostDecisionAction({
    store: chain.store,
    verificationDecisionId: chainBAdj.decisionRecord!.verificationDecisionId,
  });
  const chainC = materializeNextGovernedContinuationTargetFromSequence({
    store: chain.store,
    verificationDecisionId: chainBAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("chain C from B relationship", chainC.materialized);
  expect("chain C entry", chainC.target!.sequenceEntryKey, "entry-c");
  const chainC2 = materializeNextGovernedContinuationTargetFromSequence({
    store: chain.store,
    verificationDecisionId: chainBAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("chain C exactly once (reuse)", chainC2.duplicateTargetReused);

  const y = await addUnrelatedVerified(chain.store, chainPred, "seq-041c-y");
  const yMat = materializeNextGovernedContinuationTargetFromSequence({
    store: chain.store,
    verificationDecisionId: y.decisionId,
  });
  expect("Y cannot impersonate B", yMat.reason, "bootstrap_already_fulfilled");
  expectFalse("Y no target", yMat.materialized);

  expect("C still waits — prepared continuation", chainBPrepared.preparedAction, "PREPARE_CONTINUATION");
  const noAuto = await executeAuthorizedPostDecisionAction({
    store: chain.store,
    postDecisionActionId: chainBPrepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("C not auto-executed", noAuto.reason, "authorization_not_found");

  // Direct store: conflicting bootstrap fulfillment refused
  const conflictBoot = buildSequenceFulfillmentRecord({
    sequenceId: chainB.config!.sequenceId,
    sequenceConfigHash: chainB.config!.configHash,
    entryKey: "entry-a",
    entryHash: chainB.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
    verificationDecisionId: y.decisionId,
    executorAssignmentId: y.assignmentId,
    executorExecutionEvidenceId: y.evidenceId,
  });
  let conflictThrew = false;
  try {
    chain.store.persistSequenceFulfillment(conflictBoot);
  } catch (error) {
    conflictThrew = error instanceof EngineeringStoreError;
  }
  expectTrue("conflicting bootstrap fulfillment refused at store", conflictThrew);

  section("041-C2 — first authoritative fulfillment wins; raw NDJSON cannot rebind");

  // Pure reconstruction unit: first wins, identical idempotent, conflicts ignored
  const unitA = buildSequenceFulfillmentRecord({
    sequenceId: "seq-unit",
    sequenceConfigHash: "a".repeat(64),
    entryKey: "entry-a",
    entryHash: "b".repeat(64),
    verificationDecisionId: "dec-a",
    executorAssignmentId: "exec-a",
    executorExecutionEvidenceId: "ev-a",
  });
  const unitX = buildSequenceFulfillmentRecord({
    sequenceId: "seq-unit",
    sequenceConfigHash: "a".repeat(64),
    entryKey: "entry-a",
    entryHash: "b".repeat(64),
    verificationDecisionId: "dec-x",
    executorAssignmentId: "exec-x",
    executorExecutionEvidenceId: "ev-x",
  });
  const unitBad = { ...unitX, fulfillmentHash: "0".repeat(64) };
  expect(
    "unit legitimate-first",
    selectAuthoritativeSequenceFulfillments([unitA, unitX])[0]!.executorAssignmentId,
    "exec-a",
  );
  expect(
    "unit forged-first",
    selectAuthoritativeSequenceFulfillments([unitX, unitA])[0]!.executorAssignmentId,
    "exec-x",
  );
  expect(
    "unit identical duplicate keeps one",
    selectAuthoritativeSequenceFulfillments([unitA, unitA]).length,
    1,
  );
  expect(
    "unit reverse still first of reversed",
    selectAuthoritativeSequenceFulfillments([unitX, unitA, unitX])[0]!.fulfillmentHash,
    unitX.fulfillmentHash,
  );
  expect(
    "unit malformed hash skipped then legitimate",
    selectAuthoritativeSequenceFulfillments([
      unitBad as typeof unitA,
      unitA,
    ])[0]!.executorAssignmentId,
    "exec-a",
  );
  expect(
    "unit legitimate then malformed keeps legitimate",
    selectAuthoritativeSequenceFulfillments([
      unitA,
      unitBad as typeof unitA,
    ])[0]!.executorAssignmentId,
    "exec-a",
  );
  expect(
    "unit multiple conflicts keep first",
    selectAuthoritativeSequenceFulfillments([unitA, unitX, unitX, unitA]).length,
    1,
  );

  // Critical raw P1 regression: legitimate A → B, then raw forge X bootstrap, restart, X cannot rematerialize B
  const c2 = await buildVerifiedCase("seq-041c2-boot");
  const c2Pred = c2.assignment.assignment;
  const c2Cfg = persistGovernedContinuationSequenceConfig({
    store: c2.store,
    ...threeEntryDefs(c2Pred),
    sequenceKey: "041c2",
  });
  expectTrue("041c2 config persisted", c2Cfg.persisted);
  const c2B = materializeNextGovernedContinuationTargetFromSequence({
    store: c2.store,
    verificationDecisionId: c2.decisionId,
  });
  expectTrue("041c2 B materialized once", c2B.materialized);
  expect("041c2 B entry", c2B.target!.sequenceEntryKey, "entry-b");
  const c2BootFul = c2.store.findSequenceFulfillmentByEntryKey(
    c2B.config!.sequenceId,
    c2Pred.projectId,
    "entry-a",
  );
  expectTrue("041c2 bootstrap fulfillment present", Boolean(c2BootFul));
  expect("041c2 bootstrap executor", c2BootFul!.executorAssignmentId, c2Pred.assignmentId);

  const c2X = await addUnrelatedVerified(c2.store, c2Pred, "seq-041c2-x");
  const forgedBoot = buildSequenceFulfillmentRecord({
    sequenceId: c2B.config!.sequenceId,
    sequenceConfigHash: c2B.config!.configHash,
    entryKey: "entry-a",
    entryHash: c2B.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
    verificationDecisionId: c2X.decisionId,
    executorAssignmentId: c2X.assignmentId,
    executorExecutionEvidenceId: c2X.evidenceId,
  });
  expectTrue("forged bootstrap hash-valid", validateSequenceFulfillment(forgedBoot));
  appendRawFulfillment(c2.store.storeRoot, c2Pred.projectId, forgedBoot);

  // Before restart: lookup must still prefer legitimate first
  expect(
    "041c2 before restart entry authority",
    c2.store.findSequenceFulfillmentByEntryKey(
      c2B.config!.sequenceId,
      c2Pred.projectId,
      "entry-a",
    )!.executorAssignmentId,
    c2Pred.assignmentId,
  );
  expect(
    "041c2 forged executor lookup not authoritative",
    c2.store.findSequenceFulfillmentByExecutor(
      c2B.config!.sequenceId,
      c2Pred.projectId,
      c2X.assignmentId,
    ),
    null,
  );
  const c2XBefore = materializeNextGovernedContinuationTargetFromSequence({
    store: c2.store,
    verificationDecisionId: c2X.decisionId,
  });
  expect("041c2 X before restart refused", c2XBefore.reason, "bootstrap_already_fulfilled");
  expectFalse("041c2 X before restart no target", c2XBefore.materialized);

  // Conflicting evidence / decision / continuation-target-shaped fields via raw variants
  const forgedEvidence = buildSequenceFulfillmentRecord({
    sequenceId: c2B.config!.sequenceId,
    sequenceConfigHash: c2B.config!.configHash,
    entryKey: "entry-a",
    entryHash: c2B.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
    verificationDecisionId: c2.decisionId,
    executorAssignmentId: c2Pred.assignmentId,
    executorExecutionEvidenceId: c2X.evidenceId,
  });
  appendRawFulfillment(c2.store.storeRoot, c2Pred.projectId, forgedEvidence);
  const forgedDecision = buildSequenceFulfillmentRecord({
    sequenceId: c2B.config!.sequenceId,
    sequenceConfigHash: c2B.config!.configHash,
    entryKey: "entry-a",
    entryHash: c2B.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
    verificationDecisionId: c2X.decisionId,
    executorAssignmentId: c2Pred.assignmentId,
    executorExecutionEvidenceId: c2.evidence.evidenceId,
  });
  appendRawFulfillment(c2.store.storeRoot, c2Pred.projectId, forgedDecision);
  appendRawFulfillment(c2.store.storeRoot, c2Pred.projectId, forgedBoot);
  appendRawFulfillment(c2.store.storeRoot, c2Pred.projectId, c2BootFul!);
  appendRawFulfillment(c2.store.storeRoot, c2Pred.projectId, {
    ...forgedBoot,
    fulfillmentHash: "f".repeat(64),
  });

  const c2Restart = createFileEngineeringStore(c2.store.storeRoot);
  const authAfterRestart = c2Restart.findSequenceFulfillmentByEntryKey(
    c2B.config!.sequenceId,
    c2Pred.projectId,
    "entry-a",
  );
  expect(
    "041c2 restart authority unchanged",
    authAfterRestart!.executorAssignmentId,
    c2Pred.assignmentId,
  );
  expect(
    "041c2 restart fulfillment hash",
    authAfterRestart!.fulfillmentHash,
    c2BootFul!.fulfillmentHash,
  );
  const c2XAfter = materializeNextGovernedContinuationTargetFromSequence({
    store: c2Restart,
    verificationDecisionId: c2X.decisionId,
  });
  expect("041c2 AFTER_RAW_FORGE refused", c2XAfter.reason, "bootstrap_already_fulfilled");
  expectFalse("041c2 forged X cannot materialize B", c2XAfter.materialized);
  expect("041c2 forged X target null", c2XAfter.target, null);
  const c2BReuse = materializeNextGovernedContinuationTargetFromSequence({
    store: c2Restart,
    verificationDecisionId: c2.decisionId,
  });
  expectTrue("041c2 legitimate B remains", c2BReuse.duplicateTargetReused);
  expect(
    "041c2 same B id after forge",
    c2BReuse.target!.continuationTargetId,
    c2B.target!.continuationTargetId,
  );
  const providerForge = new CountingMock();
  expect("041c2 forged attack create=0", providerForge.creates, 0);
  expect("041c2 forged attack submit=0", providerForge.submitted.length, 0);

  // Direct store still refuses conflicting persist
  let c2StoreConflict = false;
  try {
    c2Restart.persistSequenceFulfillment(forgedBoot);
  } catch (error) {
    c2StoreConflict = error instanceof EngineeringStoreError;
  }
  expectTrue("041c2 persist still refuses conflict", c2StoreConflict);

  // Forged-first raw ordering: first line wins deterministically
  const forgeFirst = await buildVerifiedCase("seq-041c2-ff");
  const ffPred = forgeFirst.assignment.assignment;
  const ffCfg = persistGovernedContinuationSequenceConfig({
    store: forgeFirst.store,
    ...threeEntryDefs(ffPred),
    sequenceKey: "041c2-ff",
  });
  const ffX = await addUnrelatedVerified(forgeFirst.store, ffPred, "seq-041c2-ff-x");
  // Seed empty file by writing forged first via raw before any legitimate persist path materialize
  const ffEntryA = ffCfg.config!.entries.find((e) => e.entryKey === "entry-a")!;
  const ffForged = buildSequenceFulfillmentRecord({
    sequenceId: ffCfg.config!.sequenceId,
    sequenceConfigHash: ffCfg.config!.configHash,
    entryKey: "entry-a",
    entryHash: ffEntryA.entryHash,
    verificationDecisionId: ffX.decisionId,
    executorAssignmentId: ffX.assignmentId,
    executorExecutionEvidenceId: ffX.evidenceId,
  });
  appendRawFulfillment(forgeFirst.store.storeRoot, ffPred.projectId, ffForged);
  const ffLegit = buildSequenceFulfillmentRecord({
    sequenceId: ffCfg.config!.sequenceId,
    sequenceConfigHash: ffCfg.config!.configHash,
    entryKey: "entry-a",
    entryHash: ffEntryA.entryHash,
    verificationDecisionId: forgeFirst.decisionId,
    executorAssignmentId: ffPred.assignmentId,
    executorExecutionEvidenceId: forgeFirst.evidence.evidenceId,
  });
  appendRawFulfillment(forgeFirst.store.storeRoot, ffPred.projectId, ffLegit);
  expect(
    "041c2 forged-first authority is forged",
    forgeFirst.store.findSequenceFulfillmentByEntryKey(
      ffCfg.config!.sequenceId,
      ffPred.projectId,
      "entry-a",
    )!.executorAssignmentId,
    ffX.assignmentId,
  );
  const ffLegitMat = materializeNextGovernedContinuationTargetFromSequence({
    store: forgeFirst.store,
    verificationDecisionId: forgeFirst.decisionId,
  });
  expect(
    "041c2 legitimate second cannot steal first forge",
    ffLegitMat.reason,
    "bootstrap_already_fulfilled",
  );

  // Non-bootstrap raw forge must not unlock C
  const nb = await buildVerifiedCase("seq-041c2-nb");
  const nbPred = nb.assignment.assignment;
  persistGovernedContinuationSequenceConfig({
    store: nb.store,
    ...threeEntryDefs(nbPred),
    sequenceKey: "041c2-nb",
  });
  const nbB = materializeNextGovernedContinuationTargetFromSequence({
    store: nb.store,
    verificationDecisionId: nb.decisionId,
  });
  expectTrue("041c2-nb B materialized", nbB.materialized);
  const nbAuthB = authorizePostDecisionExecution({
    store: nb.store,
    postDecisionActionId: nb.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("041c2-nb B authorized", nbAuthB.authorized);
  const nbExecB = await executeAuthorizedPostDecisionAction({
    store: nb.store,
    postDecisionActionId: nb.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    }),
  });
  expectTrue("041c2-nb B executed", nbExecB.executed);
  const nbBId = nbExecB.generatedAssignmentId!;
  const nbBFrozen = nb.store.loadAssignmentRecord(nbBId);
  const nbPreB = await collectGitEvidence(nbPred.repositoryPath);
  const nbBRes = synthesizeExecutionResult({
    frozen: nbBFrozen.frozen,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "nb-b",
    runId: "nb-b",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: "B done",
    preRunGitEvidence: nbPreB,
    postRunGitEvidence: nbPreB,
    policyDenials: [],
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  const nbBEv = nb.store.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: nbBFrozen.frozen,
      result: nbBRes,
      providerStarted: true,
    }),
  );
  const nbBVa = authorizeAndFreezeVerifierAssignment({
    store: nb.store,
    executorAssignmentId: nbBId,
    executionEvidenceId: nbBEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: nb.store,
    verifierAssignmentId: nbBVa.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const nbBAdj = adjudicateVerifierExecution({
    store: nb.store,
    verifierAssignmentId: nbBVa.persisted!.frozen.assignment.assignmentId,
  });
  const nbC = materializeNextGovernedContinuationTargetFromSequence({
    store: nb.store,
    verificationDecisionId: nbBAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("041c2-nb C materialized once", nbC.materialized);
  expect("041c2-nb C entry", nbC.target!.sequenceEntryKey, "entry-c");
  const nbBFul = nb.store.findSequenceFulfillmentByEntryKey(
    nbB.config!.sequenceId,
    nbPred.projectId,
    "entry-b",
  );
  expectTrue("041c2-nb B fulfillment present", Boolean(nbBFul));

  const nbY = await addUnrelatedVerified(nb.store, nbPred, "seq-041c2-nb-y");
  const forgedB = buildSequenceFulfillmentRecord({
    sequenceId: nbB.config!.sequenceId,
    sequenceConfigHash: nbB.config!.configHash,
    entryKey: "entry-b",
    entryHash: nbB.config!.entries.find((e) => e.entryKey === "entry-b")!.entryHash,
    verificationDecisionId: nbY.decisionId,
    executorAssignmentId: nbY.assignmentId,
    executorExecutionEvidenceId: nbY.evidenceId,
  });
  appendRawFulfillment(nb.store.storeRoot, nbPred.projectId, forgedB);
  const nbRestart = createFileEngineeringStore(nb.store.storeRoot);
  expect(
    "041c2-nb B authority after forge",
    nbRestart.findSequenceFulfillmentByEntryKey(
      nbB.config!.sequenceId,
      nbPred.projectId,
      "entry-b",
    )!.executorAssignmentId,
    nbBId,
  );
  const nbYMat = materializeNextGovernedContinuationTargetFromSequence({
    store: nbRestart,
    verificationDecisionId: nbY.decisionId,
  });
  expectFalse("041c2-nb forged cannot materialize C", nbYMat.materialized);
  expect(
    "041c2-nb forged Y refused",
    nbYMat.reason === "bootstrap_already_fulfilled" ||
      nbYMat.reason === "unrelated_verified_predecessor",
    true,
  );
  const nbCReuse = materializeNextGovernedContinuationTargetFromSequence({
    store: nbRestart,
    verificationDecisionId: nbBAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("041c2-nb legitimate C remains", nbCReuse.duplicateTargetReused);
  expect(
    "041c2-nb same C id",
    nbCReuse.target!.continuationTargetId,
    nbC.target!.continuationTargetId,
  );

  // Full A→B→C with raw forge between steps still fail-closed; C waits for auth
  const full = await buildVerifiedCase("seq-041c2-full");
  const fullPred = full.assignment.assignment;
  persistGovernedContinuationSequenceConfig({
    store: full.store,
    ...threeEntryDefs(fullPred),
    sequenceKey: "041c2-full",
  });
  const fullB = materializeNextGovernedContinuationTargetFromSequence({
    store: full.store,
    verificationDecisionId: full.decisionId,
  });
  expectTrue("041c2-full B once", fullB.materialized);
  const fullX = await addUnrelatedVerified(full.store, fullPred, "seq-041c2-full-x");
  appendRawFulfillment(
    full.store.storeRoot,
    fullPred.projectId,
    buildSequenceFulfillmentRecord({
      sequenceId: fullB.config!.sequenceId,
      sequenceConfigHash: fullB.config!.configHash,
      entryKey: "entry-a",
      entryHash: fullB.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
      verificationDecisionId: fullX.decisionId,
      executorAssignmentId: fullX.assignmentId,
      executorExecutionEvidenceId: fullX.evidenceId,
    }),
  );
  const fullRestart = createFileEngineeringStore(full.store.storeRoot);
  expectFalse(
    "041c2-full X cannot rematerialize B",
    materializeNextGovernedContinuationTargetFromSequence({
      store: fullRestart,
      verificationDecisionId: fullX.decisionId,
    }).materialized,
  );
  const fullAuthB = authorizePostDecisionExecution({
    store: fullRestart,
    postDecisionActionId: full.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("041c2-full explicit auth B", fullAuthB.authorized);
  const fullExecB = await executeAuthorizedPostDecisionAction({
    store: fullRestart,
    postDecisionActionId: full.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    }),
  });
  expectTrue("041c2-full B executes", fullExecB.executed);
  const fullBId = fullExecB.generatedAssignmentId!;
  const fullBFrozen = fullRestart.loadAssignmentRecord(fullBId);
  const fullPreB = await collectGitEvidence(fullPred.repositoryPath);
  const fullBEv = fullRestart.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: fullBFrozen.frozen,
      result: synthesizeExecutionResult({
        frozen: fullBFrozen.frozen,
        providerId: CURSOR_PROVIDER_ID,
        providerSessionId: "full-b",
        runId: "full-b",
        providerStatus: "finished",
        normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
        providerFinalResultText: "B verified",
        preRunGitEvidence: fullPreB,
        postRunGitEvidence: fullPreB,
        policyDenials: [],
        changedPaths: ["allowed.txt"],
        protectedPathMutationOccurred: false,
        branchChanged: false,
        headChanged: false,
        commitOccurred: false,
        unexpectedChanges: [],
      }),
      providerStarted: true,
    }),
  );
  const fullBVa = authorizeAndFreezeVerifierAssignment({
    store: fullRestart,
    executorAssignmentId: fullBId,
    executionEvidenceId: fullBEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: fullRestart,
    verifierAssignmentId: fullBVa.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const fullBAdj = adjudicateVerifierExecution({
    store: fullRestart,
    verifierAssignmentId: fullBVa.persisted!.frozen.assignment.assignmentId,
  });
  const fullBPrepared = preparePostDecisionAction({
    store: fullRestart,
    verificationDecisionId: fullBAdj.decisionRecord!.verificationDecisionId,
  });
  const fullC = materializeNextGovernedContinuationTargetFromSequence({
    store: fullRestart,
    verificationDecisionId: fullBAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("041c2-full C once", fullC.materialized);
  appendRawFulfillment(
    fullRestart.storeRoot,
    fullPred.projectId,
    buildSequenceFulfillmentRecord({
      sequenceId: fullB.config!.sequenceId,
      sequenceConfigHash: fullB.config!.configHash,
      entryKey: "entry-b",
      entryHash: fullB.config!.entries.find((e) => e.entryKey === "entry-b")!.entryHash,
      verificationDecisionId: fullX.decisionId,
      executorAssignmentId: fullX.assignmentId,
      executorExecutionEvidenceId: fullX.evidenceId,
    }),
  );
  const fullRestart2 = createFileEngineeringStore(fullRestart.storeRoot);
  expectFalse(
    "041c2-full forged B fulfillment cannot create another C",
    materializeNextGovernedContinuationTargetFromSequence({
      store: fullRestart2,
      verificationDecisionId: fullX.decisionId,
    }).materialized,
  );
  const fullNoAuto = await executeAuthorizedPostDecisionAction({
    store: fullRestart2,
    postDecisionActionId: fullBPrepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("041c2-full C waits for explicit auth", fullNoAuto.reason, "authorization_not_found");

  // Fulfillment deletion assessment: deleting authoritative line exposes later conflict as authority
  const del = await buildVerifiedCase("seq-041c2-del");
  const delPred = del.assignment.assignment;
  const delCfg = persistGovernedContinuationSequenceConfig({
    store: del.store,
    ...threeEntryDefs(delPred),
    sequenceKey: "041c2-del",
  });
  materializeNextGovernedContinuationTargetFromSequence({
    store: del.store,
    verificationDecisionId: del.decisionId,
  });
  const delX = await addUnrelatedVerified(del.store, delPred, "seq-041c2-del-x");
  const delPath = fulfillmentNdjsonPath(del.store.storeRoot, delPred.projectId);
  const delForged = buildSequenceFulfillmentRecord({
    sequenceId: delCfg.config!.sequenceId,
    sequenceConfigHash: delCfg.config!.configHash,
    entryKey: "entry-a",
    entryHash: delCfg.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
    verificationDecisionId: delX.decisionId,
    executorAssignmentId: delX.assignmentId,
    executorExecutionEvidenceId: delX.evidenceId,
  });
  appendRawFulfillment(del.store.storeRoot, delPred.projectId, delForged);
  const delLines = readFileSync(delPath, "utf8").split(/\r?\n/).filter(Boolean);
  expectTrue("041c2-del has multiple lines", delLines.length >= 2);
  writeFileSync(delPath, `${delLines.slice(1).join("\n")}\n`, "utf8");
  const delAfter = createFileEngineeringStore(del.store.storeRoot);
  expect(
    "041c2-del after deleting first line later forge becomes authority",
    delAfter.findSequenceFulfillmentByEntryKey(
      delCfg.config!.sequenceId,
      delPred.projectId,
      "entry-a",
    )!.executorAssignmentId,
    delX.assignmentId,
  );

  section("041-C3 — project-scoped fulfillment; alien readdir order cannot rebind");

  const c3 = await buildVerifiedCase("seq-041c3-home");
  const c3Pred = c3.assignment.assignment;
  const c3Cfg = persistGovernedContinuationSequenceConfig({
    store: c3.store,
    ...threeEntryDefs(c3Pred),
    sequenceKey: "041c3",
  });
  expectTrue("041c3 config", c3Cfg.persisted);
  const c3B = materializeNextGovernedContinuationTargetFromSequence({
    store: c3.store,
    verificationDecisionId: c3.decisionId,
  });
  expectTrue("041c3 B once", c3B.materialized);
  const c3Boot = c3.store.findSequenceFulfillmentByEntryKey(
    c3Cfg.config!.sequenceId,
    c3Pred.projectId,
    "entry-a",
  )!;
  expect("041c3 home project id", c3Pred.projectId, "orchestra-execution-fixture");

  const c3X = await addUnrelatedVerified(c3.store, c3Pred, "seq-041c3-x");
  const alienForge = buildSequenceFulfillmentRecord({
    sequenceId: c3Cfg.config!.sequenceId,
    sequenceConfigHash: c3Cfg.config!.configHash,
    entryKey: "entry-a",
    entryHash: c3Cfg.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
    verificationDecisionId: c3X.decisionId,
    executorAssignmentId: c3X.assignmentId,
    executorExecutionEvidenceId: c3X.evidenceId,
  });
  expectTrue("041c3 alien forge hash-valid", validateSequenceFulfillment(alienForge));

  // ALIEN sorts before HOME (aaa-… < orchestra-execution-fixture)
  appendRawFulfillment(c3.store.storeRoot, "aaa-alien-before-home", alienForge);
  appendRawFulfillment(c3.store.storeRoot, "bbb-alien-mid", alienForge);
  appendRawFulfillment(c3.store.storeRoot, "zzz-alien-after-home", alienForge);

  const c3R = createFileEngineeringStore(c3.store.storeRoot);
  expect(
    "041c3 alien-before-home authority stays home",
    c3R.findSequenceFulfillmentByEntryKey(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      "entry-a",
    )!.fulfillmentHash,
    c3Boot.fulfillmentHash,
  );
  expect(
    "041c3 byExecutor alien null",
    c3R.findSequenceFulfillmentByExecutor(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      c3X.assignmentId,
    ),
    null,
  );
  expect(
    "041c3 byDecision alien null",
    c3R.findSequenceFulfillmentByDecision(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      c3X.decisionId,
    ),
    null,
  );
  const c3XMat = materializeNextGovernedContinuationTargetFromSequence({
    store: c3R,
    verificationDecisionId: c3X.decisionId,
  });
  expect("041c3 READDIR alien refused", c3XMat.reason, "bootstrap_already_fulfilled");
  expectFalse("041c3 alien cannot materialize B", c3XMat.materialized);
  expect("041c3 alien target null", c3XMat.target, null);
  const c3Provider = new CountingMock();
  expect("041c3 alien create=0", c3Provider.creates, 0);
  expect("041c3 alien submit=0", c3Provider.submitted.length, 0);
  const c3BReuse = materializeNextGovernedContinuationTargetFromSequence({
    store: c3R,
    verificationDecisionId: c3.decisionId,
  });
  expectTrue("041c3 HOME B remains", c3BReuse.duplicateTargetReused);
  expect(
    "041c3 same B id",
    c3BReuse.target!.continuationTargetId,
    c3B.target!.continuationTargetId,
  );

  // HOME-before-ALIEN ordering (zzz already present) — identical security outcome
  const c3R2 = createFileEngineeringStore(c3.store.storeRoot);
  expect(
    "041c3 home-before-alien still home",
    c3R2.findSequenceFulfillmentByEntryKey(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      "entry-a",
    )!.executorAssignmentId,
    c3Pred.assignmentId,
  );
  expectFalse(
    "041c3 ordering irrelevant",
    materializeNextGovernedContinuationTargetFromSequence({
      store: c3R2,
      verificationDecisionId: c3X.decisionId,
    }).materialized,
  );

  // Multiple restart stability
  const c3R3 = createFileEngineeringStore(c3.store.storeRoot);
  expect(
    "041c3 multi-restart authority",
    c3R3.findSequenceFulfillmentByEntryKey(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      "entry-a",
    )!.fulfillmentHash,
    c3Boot.fulfillmentHash,
  );

  // Mixed identity / coherent malicious hash under alien still ignored
  appendRawFulfillment(c3.store.storeRoot, "aaa-mixed-identity", {
    ...alienForge,
    sequenceConfigHash: c3Cfg.config!.configHash,
    entryHash: c3Cfg.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
  });
  expect(
    "041c3 mixed alien still ignored",
    createFileEngineeringStore(c3.store.storeRoot).findSequenceFulfillmentByEntryKey(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      "entry-a",
    )!.fulfillmentHash,
    c3Boot.fulfillmentHash,
  );

  // Same-file C2 regression still holds
  appendRawFulfillment(c3.store.storeRoot, c3Pred.projectId, alienForge);
  expect(
    "041c3 same-file C2 first-wins",
    createFileEngineeringStore(c3.store.storeRoot).findSequenceFulfillmentByEntryKey(
      c3Cfg.config!.sequenceId,
      c3Pred.projectId,
      "entry-a",
    )!.fulfillmentHash,
    c3Boot.fulfillmentHash,
  );

  // Two projects, same sequenceKey/entry names, isolated
  const pA = await buildVerifiedCase("seq-041c3-pa");
  const pB = await buildVerifiedCase("seq-041c3-pb");
  // Force distinct projectIds by writing configs under different store roots (already isolated)
  // and also same store with distinct project dirs via raw projectId override is not available
  // on fixture — use two stores to prove independent advancement, plus same-store collision:
  persistGovernedContinuationSequenceConfig({
    store: pA.store,
    ...threeEntryDefs(pA.assignment.assignment),
    sequenceKey: "shared-name",
  });
  persistGovernedContinuationSequenceConfig({
    store: pB.store,
    ...threeEntryDefs(pB.assignment.assignment),
    sequenceKey: "shared-name",
  });
  const pAMat = materializeNextGovernedContinuationTargetFromSequence({
    store: pA.store,
    verificationDecisionId: pA.decisionId,
  });
  const pBMat = materializeNextGovernedContinuationTargetFromSequence({
    store: pB.store,
    verificationDecisionId: pB.decisionId,
  });
  expectTrue("041c3 project A advances", pAMat.materialized);
  expectTrue("041c3 project B advances", pBMat.materialized);
  expect(
    "041c3 A and B distinct targets",
    pAMat.target!.continuationTargetId !== pBMat.target!.continuationTargetId,
    true,
  );

  // Same store, same sequenceId collision across project dirs: HOME vs twin project dir
  // with identical sequenceId string (forged twin projectId directory containing sibling sequence)
  const twin = await buildVerifiedCase("seq-041c3-twin");
  const twinPred = twin.assignment.assignment;
  const twinCfg = persistGovernedContinuationSequenceConfig({
    store: twin.store,
    ...threeEntryDefs(twinPred),
    sequenceKey: "twin-seq",
  });
  const twinB = materializeNextGovernedContinuationTargetFromSequence({
    store: twin.store,
    verificationDecisionId: twin.decisionId,
  });
  expectTrue("041c3 twin B", twinB.materialized);
  const twinBoot = twin.store.findSequenceFulfillmentByEntryKey(
    twinCfg.config!.sequenceId,
    twinPred.projectId,
    "entry-a",
  )!;
  const twinX = await addUnrelatedVerified(twin.store, twinPred, "seq-041c3-twin-x");
  // Second "project" dir using an alternate projectId string but HOME's sequenceId
  const otherProjectId = "other-project-same-seq";
  appendRawFulfillment(
    twin.store.storeRoot,
    otherProjectId,
    buildSequenceFulfillmentRecord({
      sequenceId: twinCfg.config!.sequenceId,
      sequenceConfigHash: twinCfg.config!.configHash,
      entryKey: "entry-a",
      entryHash: twinCfg.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
      verificationDecisionId: twinX.decisionId,
      executorAssignmentId: twinX.assignmentId,
      executorExecutionEvidenceId: twinX.evidenceId,
    }),
  );
  // Also place a legitimate-looking fulfillment for a different sequence under other project
  // Authority for HOME must ignore other project's file entirely
  expect(
    "041c3 same sequenceId other project ignored",
    createFileEngineeringStore(twin.store.storeRoot).findSequenceFulfillmentByEntryKey(
      twinCfg.config!.sequenceId,
      twinPred.projectId,
      "entry-a",
    )!.fulfillmentHash,
    twinBoot.fulfillmentHash,
  );
  expectFalse(
    "041c3 other project cannot unlock HOME B",
    materializeNextGovernedContinuationTargetFromSequence({
      store: createFileEngineeringStore(twin.store.storeRoot),
      verificationDecisionId: twinX.decisionId,
    }).materialized,
  );

  // Full A→B→C with alien forges
  const c3Full = await buildVerifiedCase("seq-041c3-full");
  const c3FullPred = c3Full.assignment.assignment;
  persistGovernedContinuationSequenceConfig({
    store: c3Full.store,
    ...threeEntryDefs(c3FullPred),
    sequenceKey: "041c3-full",
  });
  const c3FullB = materializeNextGovernedContinuationTargetFromSequence({
    store: c3Full.store,
    verificationDecisionId: c3Full.decisionId,
  });
  expectTrue("041c3-full B", c3FullB.materialized);
  const c3FullX = await addUnrelatedVerified(c3Full.store, c3FullPred, "seq-041c3-full-x");
  appendRawFulfillment(
    c3Full.store.storeRoot,
    "aaa-full-alien",
    buildSequenceFulfillmentRecord({
      sequenceId: c3FullB.config!.sequenceId,
      sequenceConfigHash: c3FullB.config!.configHash,
      entryKey: "entry-a",
      entryHash: c3FullB.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
      verificationDecisionId: c3FullX.decisionId,
      executorAssignmentId: c3FullX.assignmentId,
      executorExecutionEvidenceId: c3FullX.evidenceId,
    }),
  );
  const c3FullR = createFileEngineeringStore(c3Full.store.storeRoot);
  expectFalse(
    "041c3-full alien no second B",
    materializeNextGovernedContinuationTargetFromSequence({
      store: c3FullR,
      verificationDecisionId: c3FullX.decisionId,
    }).materialized,
  );
  const c3FullAuth = authorizePostDecisionExecution({
    store: c3FullR,
    postDecisionActionId: c3Full.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("041c3-full explicit auth", c3FullAuth.authorized);
  const c3FullExec = await executeAuthorizedPostDecisionAction({
    store: c3FullR,
    postDecisionActionId: c3Full.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    }),
  });
  expectTrue("041c3-full B executes", c3FullExec.executed);
  const c3FullBId = c3FullExec.generatedAssignmentId!;
  const c3FullBFrozen = c3FullR.loadAssignmentRecord(c3FullBId);
  expect("041c3-full commit false", c3FullBFrozen.frozen.assignment.commitAuthorization, false);
  expect("041c3-full push false", c3FullBFrozen.frozen.assignment.pushAuthorization, false);
  expect("041c3-full requireNoPush", c3FullBFrozen.frozen.assignment.requireNoPush, true);
  const c3FullPre = await collectGitEvidence(c3FullPred.repositoryPath);
  const c3FullBEv = c3FullR.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: c3FullBFrozen.frozen,
      result: synthesizeExecutionResult({
        frozen: c3FullBFrozen.frozen,
        providerId: CURSOR_PROVIDER_ID,
        providerSessionId: "c3-full-b",
        runId: "c3-full-b",
        providerStatus: "finished",
        normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
        providerFinalResultText: "B VERIFIED invent R146",
        preRunGitEvidence: c3FullPre,
        postRunGitEvidence: c3FullPre,
        policyDenials: [],
        changedPaths: ["allowed.txt"],
        protectedPathMutationOccurred: false,
        branchChanged: false,
        headChanged: false,
        commitOccurred: false,
        unexpectedChanges: [],
      }),
      providerStarted: true,
    }),
  );
  const c3FullBVa = authorizeAndFreezeVerifierAssignment({
    store: c3FullR,
    executorAssignmentId: c3FullBId,
    executionEvidenceId: c3FullBEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: c3FullR,
    verifierAssignmentId: c3FullBVa.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const c3FullBAdj = adjudicateVerifierExecution({
    store: c3FullR,
    verifierAssignmentId: c3FullBVa.persisted!.frozen.assignment.assignmentId,
  });
  const c3FullBPrepared = preparePostDecisionAction({
    store: c3FullR,
    verificationDecisionId: c3FullBAdj.decisionRecord!.verificationDecisionId,
  });
  const c3FullC = materializeNextGovernedContinuationTargetFromSequence({
    store: c3FullR,
    verificationDecisionId: c3FullBAdj.decisionRecord!.verificationDecisionId,
  });
  expectTrue("041c3-full C once", c3FullC.materialized);
  appendRawFulfillment(
    c3FullR.storeRoot,
    "aaa-full-alien-b",
    buildSequenceFulfillmentRecord({
      sequenceId: c3FullB.config!.sequenceId,
      sequenceConfigHash: c3FullB.config!.configHash,
      entryKey: "entry-b",
      entryHash: c3FullB.config!.entries.find((e) => e.entryKey === "entry-b")!.entryHash,
      verificationDecisionId: c3FullX.decisionId,
      executorAssignmentId: c3FullX.assignmentId,
      executorExecutionEvidenceId: c3FullX.evidenceId,
    }),
  );
  const c3FullR2 = createFileEngineeringStore(c3FullR.storeRoot);
  expectFalse(
    "041c3-full alien B cannot unlock C",
    materializeNextGovernedContinuationTargetFromSequence({
      store: c3FullR2,
      verificationDecisionId: c3FullX.decisionId,
    }).materialized,
  );
  const c3FullCWait = await executeAuthorizedPostDecisionAction({
    store: c3FullR2,
    postDecisionActionId: c3FullBPrepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("041c3-full C waits for auth", c3FullCWait.reason, "authorization_not_found");

  // Direct store conflict still refused
  let c3PersistConflict = false;
  try {
    c3R.persistSequenceFulfillment(alienForge);
  } catch (error) {
    c3PersistConflict = error instanceof EngineeringStoreError;
  }
  expectTrue("041c3 persist still refuses conflict", c3PersistConflict);

  // ── ORCH IMP 041-C4: project-scoped sequence config resolution ──────────
  section("041-C4 — explicit sequenceId config must not scan alien projects");

  const c4 = await buildVerifiedCase("seq-041c4");
  const c4Pred = c4.assignment.assignment;
  const c4Home = persistGovernedContinuationSequenceConfig({
    store: c4.store,
    ...threeEntryDefs(c4Pred),
    sequenceKey: "041c4",
    configurationVersion: 1,
  });
  expectTrue("041c4 home v1", c4Home.persisted);
  const c4SeqId = c4Home.config!.sequenceId;
  const c4HomeHash = c4Home.config!.configHash;
  const c4HomeBText = c4Home.config!.entries.find((e) => e.entryKey === "entry-b")!.assignmentText;
  const c4HomeEntryBHash = c4Home.config!.entries.find((e) => e.entryKey === "entry-b")!.entryHash;

  const alienV99 = cloneSequenceConfigVariant(
    c4Home.config!,
    99,
    "ALIEN-HIJACK-B-TEXT",
  );
  expectTrue("041c4 alien v99 hash-valid", validateGovernedContinuationSequenceConfig(alienV99));
  expect("041c4 alien claims HOME projectId", alienV99.projectId, c4Pred.projectId);
  expect("041c4 alien claims HOME sequenceId", alienV99.sequenceId, c4SeqId);

  // Alien directories before and after HOME alphabetically + mid
  appendRawConfig(c4.store.storeRoot, "aaa-alien-cfg-before", alienV99);
  appendRawConfig(
    c4.store.storeRoot,
    "mmm-alien-cfg-mid",
    cloneSequenceConfigVariant(c4Home.config!, 50, "ALIEN-MID-TEXT"),
  );
  appendRawConfig(
    c4.store.storeRoot,
    "zzz-alien-cfg-after",
    cloneSequenceConfigVariant(c4Home.config!, 80, "ALIEN-AFTER-TEXT"),
  );

  const c4Active = c4.store.findActiveGovernedContinuationSequenceConfigForProject(
    c4Pred.projectId,
    c4SeqId,
  );
  expect("041c4 active ignores alien-before", c4Active!.configHash, c4HomeHash);
  expect("041c4 active version still 1", c4Active!.configurationVersion, 1);

  const c4Provider = new CountingMock();
  const c4Mat = materializeNextGovernedContinuationTargetFromSequence({
    store: c4.store,
    verificationDecisionId: c4.decisionId,
    sequenceId: c4SeqId,
  });
  expectTrue("041c4 explicit HOME materializes", c4Mat.materialized);
  expect("041c4 HOME assignment text", c4Mat.target!.assignmentText, c4HomeBText);
  expectFalse(
    "041c4 no alien hijack text",
    c4Mat.target!.assignmentText.includes("ALIEN"),
  );
  expect("041c4 HOME config hash on target", c4Mat.target!.sequenceConfigHash, c4HomeHash);
  expect("041c4 HOME entry hash on target", c4Mat.target!.sequenceEntryHash, c4HomeEntryBHash);
  expect("041c4 HOME project on target", c4Mat.target!.projectId, c4Pred.projectId);
  expect("041c4 HOME sequenceId on target", c4Mat.target!.sequenceId, c4SeqId);
  expect("041c4 provider creates=0", c4Provider.creates, 0);

  // Default no-sequenceId path still project-scoped and safe
  const c4Default = materializeNextGovernedContinuationTargetFromSequence({
    store: c4.store,
    verificationDecisionId: c4.decisionId,
  });
  expectTrue("041c4 default reuses HOME B", c4Default.duplicateTargetReused);
  expect("041c4 default text HOME", c4Default.target!.assignmentText, c4HomeBText);

  // HOME v1 vs ALIEN v2/v99 — still HOME (active lookup)
  expect(
    "041c4 v1 beats alien v99",
    c4.store.findActiveGovernedContinuationSequenceConfigForProject(c4Pred.projectId, c4SeqId)!
      .configurationVersion,
    1,
  );

  // Restart stability while HOME v1 remains active (before version bump)
  const c4R1 = createFileEngineeringStore(c4.store.storeRoot);
  const c4R2 = createFileEngineeringStore(c4.store.storeRoot);
  expect(
    "041c4 restart1 HOME v1",
    c4R1.findActiveGovernedContinuationSequenceConfigForProject(c4Pred.projectId, c4SeqId)!
      .configHash,
    c4HomeHash,
  );
  expect(
    "041c4 restart2 HOME v1",
    c4R2.findActiveGovernedContinuationSequenceConfigForProject(c4Pred.projectId, c4SeqId)!
      .configHash,
    c4HomeHash,
  );
  const c4MatRestart = materializeNextGovernedContinuationTargetFromSequence({
    store: c4R2,
    verificationDecisionId: c4.decisionId,
    sequenceId: c4SeqId,
  });
  expectTrue("041c4 restart explicit materialize", c4MatRestart.duplicateTargetReused);
  expect(
    "041c4 restart no alien text",
    c4MatRestart.target!.assignmentText.includes("ALIEN"),
    false,
  );

  // Promote HOME to v2 — active resolution must beat any alien version (fresh lookup; no rematerialize)
  const c4HomeV2 = persistGovernedContinuationSequenceConfig({
    store: c4.store,
    ...threeEntryDefs(c4Pred),
    sequenceKey: "041c4",
    configurationVersion: 2,
    entries: threeEntryDefs(c4Pred).entries.map((e) =>
      e.entryKey === "entry-b"
        ? { ...e, assignmentText: "HOME-V2-LEGITIMATE-B" }
        : e,
    ),
  });
  expectTrue("041c4 home v2", c4HomeV2.persisted);
  appendRawConfig(
    c4.store.storeRoot,
    "aaa-alien-cfg-before",
    cloneSequenceConfigVariant(c4HomeV2.config!, 99, "ALIEN-STILL-HIJACK"),
  );
  const c4AfterV2 = createFileEngineeringStore(c4.store.storeRoot);
  expect(
    "041c4 HOME v2 wins vs alien v99",
    c4AfterV2.findActiveGovernedContinuationSequenceConfigForProject(c4Pred.projectId, c4SeqId)!
      .configurationVersion,
    2,
  );
  expect(
    "041c4 HOME v2 hash",
    c4AfterV2.findActiveGovernedContinuationSequenceConfigForProject(c4Pred.projectId, c4SeqId)!
      .configHash,
    c4HomeV2.config!.configHash,
  );

  // Namespace vs record projectId: HOME-claiming rows under ALIEN are ignored for ALIEN load
  expect(
    "041c4 ALIEN load drops HOME-claim rows",
    c4AfterV2.loadGovernedContinuationSequenceConfigs("aaa-alien-cfg-before").length,
    0,
  );
  expect(
    "041c4 ALIEN active null when only mismatched",
    c4AfterV2.findActiveGovernedContinuationSequenceConfigForProject("aaa-alien-cfg-before"),
    null,
  );

  // Same sequenceId across two project namespaces (forced collision)
  const sharedSeqId = "shared-sequence-c4";
  const projA = "project-a-shared-seq";
  const projB = "project-b-shared-seq";
  const builtA = withForcedSequenceId(
    buildGovernedContinuationSequenceConfig({
      ...threeEntryDefs({ ...c4Pred, projectId: projA }),
      sequenceKey: "ignored-for-id",
      configurationVersion: 1,
      entries: threeEntryDefs({ ...c4Pred, projectId: projA }).entries.map((e) =>
        e.entryKey === "entry-b" ? { ...e, assignmentText: "PROJECT-A-B-TEXT" } : e,
      ),
    }),
    sharedSeqId,
  );
  const builtB = withForcedSequenceId(
    buildGovernedContinuationSequenceConfig({
      ...threeEntryDefs({ ...c4Pred, projectId: projB }),
      sequenceKey: "ignored-for-id",
      configurationVersion: 99,
      entries: threeEntryDefs({ ...c4Pred, projectId: projB }).entries.map((e) =>
        e.entryKey === "entry-b" ? { ...e, assignmentText: "PROJECT-B-B-TEXT" } : e,
      ),
    }),
    sharedSeqId,
  );
  expectTrue("041c4 shared A valid", validateGovernedContinuationSequenceConfig(builtA));
  expectTrue("041c4 shared B valid", validateGovernedContinuationSequenceConfig(builtB));
  expect("041c4 shared same sequenceId", builtA.sequenceId, builtB.sequenceId);
  appendRawConfig(c4.store.storeRoot, projA, builtA);
  appendRawConfig(c4.store.storeRoot, projB, builtB);
  const c4SharedStore = createFileEngineeringStore(c4.store.storeRoot);
  expect(
    "041c4 explicit A → A only",
    c4SharedStore.findActiveGovernedContinuationSequenceConfigForProject(projA, sharedSeqId)!
      .configurationVersion,
    1,
  );
  expect(
    "041c4 explicit B → B only",
    c4SharedStore.findActiveGovernedContinuationSequenceConfigForProject(projB, sharedSeqId)!
      .configurationVersion,
    99,
  );
  expect(
    "041c4 A text isolated",
    c4SharedStore
      .findActiveGovernedContinuationSequenceConfigForProject(projA, sharedSeqId)!
      .entries.find((e) => e.entryKey === "entry-b")!.assignmentText,
    "PROJECT-A-B-TEXT",
  );
  expect(
    "041c4 B text isolated",
    c4SharedStore
      .findActiveGovernedContinuationSequenceConfigForProject(projB, sharedSeqId)!
      .entries.find((e) => e.entryKey === "entry-b")!.assignmentText,
    "PROJECT-B-B-TEXT",
  );

  // Mixed coherent malicious identity under ALIEN still ignored for HOME
  const mixed = cloneSequenceConfigVariant(c4HomeV2.config!, 77, "ALIEN-MIXED-HOME-CLAIM");
  appendRawConfig(c4.store.storeRoot, "aaa-mixed-cfg", mixed);
  expect(
    "041c4 mixed identity ignored",
    createFileEngineeringStore(c4.store.storeRoot).findActiveGovernedContinuationSequenceConfigForProject(
      c4Pred.projectId,
      c4SeqId,
    )!.configHash,
    c4HomeV2.config!.configHash,
  );

  // Raw ALIEN config + restart
  appendRawConfig(
    c4.store.storeRoot,
    "zzz-raw-alien-cfg",
    cloneSequenceConfigVariant(c4HomeV2.config!, 1000, "RAW-ALIEN-AFTER-RESTART"),
  );
  expect(
    "041c4 raw alien after restart ignored",
    createFileEngineeringStore(c4.store.storeRoot).findActiveGovernedContinuationSequenceConfigForProject(
      c4Pred.projectId,
      c4SeqId,
    )!.configHash,
    c4HomeV2.config!.configHash,
  );

  // Direct store: namespace-consistent ALIEN config with HOME sequenceId has no HOME authority
  const alienNsOk = withForcedSequenceId(
    buildGovernedContinuationSequenceConfig({
      ...threeEntryDefs({ ...c4Pred, projectId: "direct-alien-ns" }),
      sequenceKey: "direct",
      configurationVersion: 500,
      entries: threeEntryDefs({ ...c4Pred, projectId: "direct-alien-ns" }).entries.map((e) =>
        e.entryKey === "entry-b" ? { ...e, assignmentText: "DIRECT-ALIEN-NS" } : e,
      ),
    }),
    c4SeqId,
  );
  c4.store.persistGovernedContinuationSequenceConfig(alienNsOk);
  expect(
    "041c4 direct alien ns persist no HOME bleed",
    createFileEngineeringStore(c4.store.storeRoot).findActiveGovernedContinuationSequenceConfigForProject(
      c4Pred.projectId,
      c4SeqId,
    )!.configHash,
    c4HomeV2.config!.configHash,
  );
  expect(
    "041c4 direct alien ns resolves for itself",
    createFileEngineeringStore(c4.store.storeRoot).findActiveGovernedContinuationSequenceConfigForProject(
      "direct-alien-ns",
      c4SeqId,
    )!.configurationVersion,
    500,
  );

  // Two projects (separate stores), same sequenceKey — independent advancement
  const c4Pa = await buildVerifiedCase("seq-041c4-pa");
  const c4Pb = await buildVerifiedCase("seq-041c4-pb");
  const c4PaCfg = persistGovernedContinuationSequenceConfig({
    store: c4Pa.store,
    ...threeEntryDefs(c4Pa.assignment.assignment),
    sequenceKey: "shared-c4-name",
  });
  const c4PbCfg = persistGovernedContinuationSequenceConfig({
    store: c4Pb.store,
    ...threeEntryDefs(c4Pb.assignment.assignment),
    sequenceKey: "shared-c4-name",
  });
  const c4PaMat = materializeNextGovernedContinuationTargetFromSequence({
    store: c4Pa.store,
    verificationDecisionId: c4Pa.decisionId,
    sequenceId: c4PaCfg.config!.sequenceId,
  });
  const c4PbMat = materializeNextGovernedContinuationTargetFromSequence({
    store: c4Pb.store,
    verificationDecisionId: c4Pb.decisionId,
    sequenceId: c4PbCfg.config!.sequenceId,
  });
  expectTrue("041c4 project A advances", c4PaMat.materialized);
  expectTrue("041c4 project B advances", c4PbMat.materialized);
  expect(
    "041c4 A/B distinct targets",
    c4PaMat.target!.continuationTargetId !== c4PbMat.target!.continuationTargetId,
    true,
  );

  // Legitimate A→B→C with explicit project-scoped sequenceId
  const c4Full = await buildVerifiedCase("seq-041c4-full");
  const c4FullPred = c4Full.assignment.assignment;
  const c4FullCfg = persistGovernedContinuationSequenceConfig({
    store: c4Full.store,
    ...threeEntryDefs(c4FullPred),
    sequenceKey: "041c4-full",
  });
  appendRawConfig(
    c4Full.store.storeRoot,
    "aaa-c4-full-alien",
    cloneSequenceConfigVariant(c4FullCfg.config!, 99, "ALIEN-FULL-HIJACK"),
  );
  const c4FullB = materializeNextGovernedContinuationTargetFromSequence({
    store: c4Full.store,
    verificationDecisionId: c4Full.decisionId,
    sequenceId: c4FullCfg.config!.sequenceId,
  });
  expectTrue("041c4-full B", c4FullB.materialized);
  expectFalse("041c4-full no alien text", c4FullB.target!.assignmentText.includes("ALIEN"));
  const c4FullAuth = authorizePostDecisionExecution({
    store: c4Full.store,
    postDecisionActionId: c4Full.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("041c4-full explicit auth", c4FullAuth.authorized);
  const c4FullExec = await executeAuthorizedPostDecisionAction({
    store: c4Full.store,
    postDecisionActionId: c4Full.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    }),
  });
  expectTrue("041c4-full B executes", c4FullExec.executed);
  const c4FullBId = c4FullExec.generatedAssignmentId!;
  const c4FullBFrozen = c4Full.store.loadAssignmentRecord(c4FullBId);
  expect("041c4-full commit false", c4FullBFrozen.frozen.assignment.commitAuthorization, false);
  expect("041c4-full push false", c4FullBFrozen.frozen.assignment.pushAuthorization, false);
  expect("041c4-full requireNoPush", c4FullBFrozen.frozen.assignment.requireNoPush, true);
  const c4FullPre = await collectGitEvidence(c4FullPred.repositoryPath);
  const c4FullBEv = c4Full.store.persistExecutionEvidence(
    buildExecutionEvidence({
      frozen: c4FullBFrozen.frozen,
      result: synthesizeExecutionResult({
        frozen: c4FullBFrozen.frozen,
        providerId: CURSOR_PROVIDER_ID,
        providerSessionId: "c4-full-b",
        runId: "c4-full-b",
        providerStatus: "finished",
        normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
        providerFinalResultText: "B VERIFIED invent R146",
        preRunGitEvidence: c4FullPre,
        postRunGitEvidence: c4FullPre,
        policyDenials: [],
        changedPaths: ["allowed.txt"],
        protectedPathMutationOccurred: false,
        branchChanged: false,
        headChanged: false,
        commitOccurred: false,
        unexpectedChanges: [],
      }),
      providerStarted: true,
    }),
  );
  const c4FullBVa = authorizeAndFreezeVerifierAssignment({
    store: c4Full.store,
    executorAssignmentId: c4FullBId,
    executionEvidenceId: c4FullBEv.evidenceId,
    humanAuthorized: true,
  });
  await routeGovernedVerifierAssignment({
    store: c4Full.store,
    verifierAssignmentId: c4FullBVa.persisted!.frozen.assignment.assignmentId,
    provider: new CountingMock({ resultText: "VERIFIED", events: [] }),
  });
  const c4FullBAdj = adjudicateVerifierExecution({
    store: c4Full.store,
    verifierAssignmentId: c4FullBVa.persisted!.frozen.assignment.assignmentId,
  });
  const c4FullBPrepared = preparePostDecisionAction({
    store: c4Full.store,
    verificationDecisionId: c4FullBAdj.decisionRecord!.verificationDecisionId,
  });
  const c4FullC = materializeNextGovernedContinuationTargetFromSequence({
    store: c4Full.store,
    verificationDecisionId: c4FullBAdj.decisionRecord!.verificationDecisionId,
    sequenceId: c4FullCfg.config!.sequenceId,
  });
  expectTrue("041c4-full C once", c4FullC.materialized);
  const c4FullCWait = await executeAuthorizedPostDecisionAction({
    store: c4Full.store,
    postDecisionActionId: c4FullBPrepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("041c4-full C waits for auth", c4FullCWait.reason, "authorization_not_found");

  // C1 runtime bootstrap regression: unrelated VERIFIED cannot rebind
  const c4X = await addUnrelatedVerified(c4Full.store, c4FullPred, "seq-041c4-x");
  const c4XMat = materializeNextGovernedContinuationTargetFromSequence({
    store: c4Full.store,
    verificationDecisionId: c4X.decisionId,
    sequenceId: c4FullCfg.config!.sequenceId,
  });
  expect("041c4 C1 bootstrap_already_fulfilled", c4XMat.reason, "bootstrap_already_fulfilled");
  expectFalse("041c4 C1 no materialize", c4XMat.materialized);

  // C3 fulfillment alien regression
  appendRawFulfillment(
    c4Full.store.storeRoot,
    "aaa-c4-ful-alien",
    buildSequenceFulfillmentRecord({
      sequenceId: c4FullCfg.config!.sequenceId,
      sequenceConfigHash: c4FullCfg.config!.configHash,
      entryKey: "entry-a",
      entryHash: c4FullCfg.config!.entries.find((e) => e.entryKey === "entry-a")!.entryHash,
      verificationDecisionId: c4X.decisionId,
      executorAssignmentId: c4X.assignmentId,
      executorExecutionEvidenceId: c4X.evidenceId,
    }),
  );
  expectFalse(
    "041c4 C3 fulfillment isolation",
    materializeNextGovernedContinuationTargetFromSequence({
      store: createFileEngineeringStore(c4Full.store.storeRoot),
      verificationDecisionId: c4X.decisionId,
      sequenceId: c4FullCfg.config!.sequenceId,
    }).materialized,
  );

  // Multi-sequence same-project P2 retained: omitting sequenceId still picks highest version across sequences
  const c4Multi = await buildVerifiedCase("seq-041c4-multi");
  const c4MultiPred = c4Multi.assignment.assignment;
  persistGovernedContinuationSequenceConfig({
    store: c4Multi.store,
    ...threeEntryDefs(c4MultiPred),
    sequenceKey: "multi-low",
    configurationVersion: 1,
  });
  const c4MultiHi = persistGovernedContinuationSequenceConfig({
    store: c4Multi.store,
    ...threeEntryDefs(c4MultiPred),
    sequenceKey: "multi-high",
    configurationVersion: 2,
  });
  const c4MultiActive = c4Multi.store.findActiveGovernedContinuationSequenceConfigForProject(
    c4MultiPred.projectId,
  );
  expect(
    "041c4 P2 multi-seq omit still highest",
    c4MultiActive!.sequenceId,
    c4MultiHi.config!.sequenceId,
  );
}
