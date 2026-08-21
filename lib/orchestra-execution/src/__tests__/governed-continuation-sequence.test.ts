import { appendFileSync, mkdtempSync } from "node:fs";
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
import {
  buildGovernedContinuationSequenceConfig,
  validateGovernedContinuationSequenceConfig,
  hashSequenceConfig,
} from "../engineering-store/governed-continuation-target-record.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
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
}
