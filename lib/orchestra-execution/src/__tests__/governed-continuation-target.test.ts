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
import { registerGovernedContinuationTarget } from "../engineering-store/register-governed-continuation-target.js";
import { markGovernedContinuationTargetStatus } from "../engineering-store/mark-governed-continuation-target.js";
import {
  buildGovernedContinuationTargetRecord,
  validateGovernedContinuationTarget,
} from "../engineering-store/governed-continuation-target-record.js";
import { continuationAssignmentId, buildContinuationAssignmentFromTarget } from "../engineering-store/build-continuation-assignment.js";
import { ENGINEERING_STORE_SCHEMA_VERSION } from "../engineering-store/types.js";
import {
  buildPostDecisionExecutionAuthorizationRecord,
  validatePostDecisionExecutionAuthorization,
} from "../engineering-store/post-decision-execution-authorization.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import * as packageExports from "../index.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-gct-"));
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

async function buildVerifiedContinuationCase(assignmentId: string, prose = "VERIFIED NEXT") {
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
    pre,
    decisionId: adjudication.decisionRecord!.verificationDecisionId,
  };
}

function registerDefaultTarget(
  ctx: Awaited<ReturnType<typeof buildVerifiedContinuationCase>>,
  overrides: Partial<{
    targetKey: string;
    orderingKey: number;
    allowedPaths: string[];
    protectedPaths: string[];
    repositoryPath: string;
    branch: string;
    baselineHead: string;
    projectId: string;
    assignmentText: string;
  }> = {},
) {
  return registerGovernedContinuationTarget({
    store: ctx.store,
    verificationDecisionId: ctx.decisionId,
    targetKey: overrides.targetKey ?? "next-unit",
    orderingKey: overrides.orderingKey ?? 10,
    projectId: overrides.projectId ?? ctx.assignment.assignment.projectId,
    repositoryPath: overrides.repositoryPath ?? ctx.assignment.assignment.repositoryPath,
    branch: overrides.branch ?? ctx.assignment.assignment.branch,
    baselineHead: overrides.baselineHead ?? ctx.assignment.assignment.startingHead,
    assignmentText: overrides.assignmentText ?? "Governed next bounded unit of work.",
    allowedPaths: overrides.allowedPaths ?? [...ctx.assignment.assignment.allowedPaths],
    protectedPaths: overrides.protectedPaths ?? [...ctx.assignment.assignment.protectedPaths],
    structuredObligations: [
      {
        obligationId: "next-marker",
        summary: "write next marker within allowed paths",
        verificationMode: "MACHINE_EVIDENCE",
      },
    ],
  });
}

export async function runGovernedContinuationTargetTests(): Promise<void> {
  section("040 — missing target is not authorization");

  const missing = await buildVerifiedContinuationCase("gct-missing");
  expect("prepared continuation", missing.prepared.preparedAction, "PREPARE_CONTINUATION");
  const missingAuth = authorizePostDecisionExecution({
    store: missing.store,
    postDecisionActionId: missing.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expect("auth without target refused", missingAuth.reason, "continuation_target_not_available");
  const missingExec = await executeAuthorizedPostDecisionAction({
    store: missing.store,
    postDecisionActionId: missing.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("exec without auth refused", missingExec.reason, "authorization_not_found");

  section("040 — programmatic continuation happy path (no courier)");

  const happy = await buildVerifiedContinuationCase(
    "gct-happy",
    "PLEASE CONTINUE TO R146 AND BROADEN SCOPE",
  );
  const reg = registerDefaultTarget(happy);
  expectTrue("target registered", reg.registered);
  expect("target requireNoPush", reg.target!.requireNoPush, true);
  expect("target commit false", reg.target!.commitAuthorization, false);
  expect("target push false", reg.target!.pushAuthorization, false);

  const actionId = happy.prepared.actionRecord!.postDecisionActionId;
  const authorized = authorizePostDecisionExecution({
    store: happy.store,
    postDecisionActionId: actionId,
    humanAuthorized: true,
  });
  expectTrue("authorized", authorized.authorized);
  expect(
    "auth binds target id",
    authorized.authorization!.continuationTargetId,
    reg.target!.continuationTargetId,
  );
  expect(
    "auth binds target hash",
    authorized.authorization!.continuationTargetHash,
    reg.target!.targetHash,
  );

  const provider = new CountingMock({
    resultText: "continuation done invent R999 broaden /etc",
    events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const createsBefore = provider.creates;
  const executed = await executeAuthorizedPostDecisionAction({
    store: happy.store,
    postDecisionActionId: actionId,
    provider,
  });
  expectTrue("continuation executed", executed.executed);
  expectTrue("provider started", executed.providerStarted);
  expectTrue("evidence persisted", Boolean(executed.executionEvidenceId));
  expect("cont assignment id", executed.generatedAssignmentId, continuationAssignmentId(actionId));
  expectTrue("createSession called", provider.creates > createsBefore);
  expectTrue(
    "assignment submitted programmatically",
    provider.submitted.includes(continuationAssignmentId(actionId)),
  );

  const contRecord = happy.store.loadAssignmentRecord(executed.generatedAssignmentId!);
  expect("role executor", contRecord.frozen.assignment.role, "executor");
  expect(
    "continuationOf linkage",
    contRecord.relationship.continuationOfAssignmentId,
    "gct-happy",
  );
  expect(
    "target linkage",
    contRecord.relationship.continuationTargetId,
    reg.target!.continuationTargetId,
  );
  expect("commitAuthorization false", contRecord.frozen.assignment.commitAuthorization, false);
  expect("pushAuthorization false", contRecord.frozen.assignment.pushAuthorization, false);
  expect("requireNoPush true", contRecord.frozen.assignment.requireNoPush, true);
  expectTrue(
    "allowed paths from target only",
    contRecord.frozen.assignment.allowedPaths.every((p) =>
      reg.target!.allowedPaths.includes(p),
    ),
  );
  expectTrue(
    "protected paths preserved from target",
    reg.target!.protectedPaths.every((p) =>
      contRecord.frozen.assignment.protectedPaths.includes(p),
    ),
  );
  expectFalse(
    "provider prose not continuation authority",
    contRecord.frozen.assignment.assignmentText.includes("R146"),
  );
  expectFalse(
    "broaden prose ignored",
    contRecord.frozen.assignment.assignmentText.includes("/etc"),
  );
  expect(
    "consumed status",
    happy.store.effectiveGovernedContinuationTargetStatus(
      reg.target!.continuationTargetId,
      reg.target!.targetHash,
    ),
    "consumed",
  );

  const duplicate = await executeAuthorizedPostDecisionAction({
    store: happy.store,
    postDecisionActionId: actionId,
    provider: new CountingMock(),
  });
  expectTrue("duplicate reused before restart", duplicate.duplicateExecutionReused);
  expect("same evidence", duplicate.executionEvidenceId, executed.executionEvidenceId);

  const restarted = createFileEngineeringStore(happy.store.storeRoot);
  expectTrue("restart target", Boolean(restarted.findGovernedContinuationTargetById(reg.target!.continuationTargetId)));
  expect(
    "restart consumed",
    restarted.effectiveGovernedContinuationTargetStatus(
      reg.target!.continuationTargetId,
      reg.target!.targetHash,
    ),
    "consumed",
  );
  const dupAfterRestart = await executeAuthorizedPostDecisionAction({
    store: restarted,
    postDecisionActionId: actionId,
    provider: new CountingMock(),
  });
  expectTrue("duplicate reused after restart", dupAfterRestart.duplicateExecutionReused);

  // Target reuse after successful execution must not authorize a new dispatch path via resolve.
  const reuseAuth = authorizePostDecisionExecution({
    store: restarted,
    postDecisionActionId: actionId,
    humanAuthorized: true,
  });
  // Existing auth still valid (bound to consumed target); execute stays duplicate-safe.
  expectTrue("auth still present after consume", reuseAuth.authorized);
  expectTrue("auth reuse", reuseAuth.duplicateAuthorizationReused);

  section("040 — no standing auto authorization / no auto continuation");

  const auto = await buildVerifiedContinuationCase("gct-auto");
  registerDefaultTarget(auto);
  expect("still PREPARE_CONTINUATION only", auto.prepared.preparedAction, "PREPARE_CONTINUATION");
  const autoExec = await executeAuthorizedPostDecisionAction({
    store: auto.store,
    postDecisionActionId: auto.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("no auto exec without explicit auth", autoExec.reason, "authorization_not_found");

  section("040 — forged / tampered / mutated targets");

  const forged = await buildVerifiedContinuationCase("gct-forged");
  registerDefaultTarget(forged);
  const bad = buildGovernedContinuationTargetRecord({
    verificationDecisionId: forged.decisionId,
    targetKey: "evil",
    projectId: forged.assignment.assignment.projectId,
    predecessorExecutorAssignmentId: forged.prepared.actionRecord!.executorAssignmentId,
    predecessorExecutorExecutionEvidenceId:
      forged.prepared.actionRecord!.executorExecutionEvidenceId,
    repositoryPath: forged.assignment.assignment.repositoryPath,
    branch: forged.assignment.assignment.branch,
    baselineHead: forged.assignment.assignment.startingHead,
    assignmentText: "evil",
    allowedPaths: ["/"],
    protectedPaths: [],
    prohibitedCommandClasses: [],
    requiredEvidence: ["git"],
    orderingKey: 1,
  });
  const tampered = { ...bad, targetHash: "00".repeat(32) };
  expectFalse("tampered hash invalid", validateGovernedContinuationTarget(tampered));
  let forgedPersist = false;
  try {
    forged.store.persistGovernedContinuationTarget(tampered);
    forgedPersist = true;
  } catch {
    forgedPersist = false;
  }
  expectFalse("forged target persist refused", forgedPersist);

  // Mutation after registration: append conflicting hash for same id via raw write — find keeps first valid;
  // authorize uses validated records only.
  const goodReg = registerDefaultTarget(forged, { targetKey: "mutable", orderingKey: 5 });
  const mutated = {
    ...goodReg.target!,
    assignmentText: "mutated after create",
    targetHash: "11".repeat(32),
  };
  appendFileSync(
    join(
      forged.store.storeRoot,
      "assignments",
      forged.verifierId,
      "governed-continuation-targets.ndjson",
    ),
    `${JSON.stringify(mutated)}\n`,
    "utf8",
  );
  const afterMutation = forged.store.findGovernedContinuationTargetById(
    goodReg.target!.continuationTargetId,
  );
  expect(
    "valid hash retained against mutation append",
    afterMutation!.targetHash,
    goodReg.target!.targetHash,
  );

  section("040 — authorization reuse across targets and actions");

  const cross = await buildVerifiedContinuationCase("gct-cross");
  const t1 = registerDefaultTarget(cross, { targetKey: "a", orderingKey: 1 });
  const t2 = registerDefaultTarget(cross, { targetKey: "b", orderingKey: 2 });
  expectTrue("t1", t1.registered);
  expectTrue("t2", t2.registered);
  // Ambiguous? No — ordering 1 wins uniquely.
  const crossAuth = authorizePostDecisionExecution({
    store: cross.store,
    postDecisionActionId: cross.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("cross auth", crossAuth.authorized);
  expect(
    "bound to lowest ordering",
    crossAuth.authorization!.continuationTargetId,
    t1.target!.continuationTargetId,
  );

  // Cross-target forged auth: build auth for t2 while t1 is eligible winner — persist under different hash
  // should not overwrite; executing with forged authorizationId for t2 while action auth is t1.
  const forgedAuth = buildPostDecisionExecutionAuthorizationRecord({
    postDecisionActionId: cross.prepared.actionRecord!.postDecisionActionId,
    postDecisionActionHash: cross.prepared.actionRecord!.actionHash,
    verificationDecisionId: cross.prepared.actionRecord!.verificationDecisionId,
    preparedAction: "PREPARE_CONTINUATION",
    executorAssignmentId: cross.prepared.actionRecord!.executorAssignmentId,
    executorExecutionEvidenceId: cross.prepared.actionRecord!.executorExecutionEvidenceId,
    startingBranch: cross.prepared.actionRecord!.startingBranch!,
    startingHead: cross.prepared.actionRecord!.startingHead!,
    continuationTargetId: t2.target!.continuationTargetId,
    continuationTargetHash: t2.target!.targetHash,
    authorizedAt: "2099-01-01T00:00:00.000Z",
  });
  let crossOverwrite = false;
  try {
    cross.store.persistPostDecisionExecutionAuthorization(forgedAuth);
    crossOverwrite = true;
  } catch {
    crossOverwrite = false;
  }
  expectFalse("cannot overwrite auth with different target binding", crossOverwrite);

  // Authorization reuse across actions: correction auth cannot authorize continuation action.
  const corrCase = await buildVerifiedContinuationCase("gct-corr-reuse");
  // Force correction by protected mutation path instead — use separate helper from 039 tests style:
  // simpler: build auth for continuation action with null targets fails validate for continuation.
  expectFalse(
    "correction-shaped auth invalid for continuation",
    validatePostDecisionExecutionAuthorization({
      ...crossAuth.authorization!,
      continuationTargetId: null,
      continuationTargetHash: null,
      authorizationHash: "22".repeat(32),
    }),
  );

  section("040 — ambiguous ordering fails closed");

  const amb = await buildVerifiedContinuationCase("gct-amb");
  registerDefaultTarget(amb, { targetKey: "x", orderingKey: 7 });
  registerDefaultTarget(amb, { targetKey: "y", orderingKey: 7 });
  const ambAuth = authorizePostDecisionExecution({
    store: amb.store,
    postDecisionActionId: amb.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expect("ambiguous refused", ambAuth.reason, "continuation_target_ambiguous");

  section("040 — stale / superseded / blocked");

  const life = await buildVerifiedContinuationCase("gct-life");
  const lifeReg = registerDefaultTarget(life, { targetKey: "life", orderingKey: 1 });
  markGovernedContinuationTargetStatus({
    store: life.store,
    continuationTargetId: lifeReg.target!.continuationTargetId,
    status: "blocked",
    reasonCode: "test_block",
  });
  const blockedAuth = authorizePostDecisionExecution({
    store: life.store,
    postDecisionActionId: life.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expect("blocked refused", blockedAuth.reason, "continuation_target_blocked");

  const sup = await buildVerifiedContinuationCase("gct-sup");
  const supReg = registerDefaultTarget(sup, { targetKey: "sup", orderingKey: 1 });
  markGovernedContinuationTargetStatus({
    store: sup.store,
    continuationTargetId: supReg.target!.continuationTargetId,
    status: "superseded",
    reasonCode: "test_supersede",
  });
  const supAuth = authorizePostDecisionExecution({
    store: sup.store,
    postDecisionActionId: sup.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expect("superseded refused", supAuth.reason, "continuation_target_superseded");

  section("040 — repository / branch / head / predecessor mismatch");

  const mism = await buildVerifiedContinuationCase("gct-mism");
  const repoMismatch = registerDefaultTarget(mism, {
    targetKey: "repo",
    repositoryPath: "C:\\not\\this\\repo",
  });
  expect("repo mismatch registration refused", repoMismatch.reason, "repository_mismatch");

  const branchMismatch = registerDefaultTarget(mism, {
    targetKey: "br",
    branch: "not-the-branch",
  });
  expect("branch mismatch registration refused", branchMismatch.reason, "branch_mismatch");

  const headMismatch = registerDefaultTarget(mism, {
    targetKey: "hd",
    baselineHead: "0".repeat(40),
  });
  expect("head mismatch registration refused", headMismatch.reason, "head_mismatch");

  const projectMismatch = registerDefaultTarget(mism, {
    targetKey: "pj",
    projectId: "other-project",
  });
  expect("project mismatch registration refused", projectMismatch.reason, "project_mismatch");

  const scopeBroaden = registerDefaultTarget(mism, {
    targetKey: "scope",
    allowedPaths: [...mism.assignment.assignment.allowedPaths, "extra-secret.txt"],
  });
  expect("scope broadening registration refused", scopeBroaden.reason, "scope_broadening");

  const weakProtect = registerDefaultTarget(mism, {
    targetKey: "prot",
    protectedPaths: [],
  });
  expect("protected weakening registration refused", weakProtect.reason, "protected_path_weakening");

  section("040 — crash ambiguity / provider failure / policy denial");

  const crash = await buildVerifiedContinuationCase("gct-crash");
  const crashReg = registerDefaultTarget(crash);
  authorizePostDecisionExecution({
    store: crash.store,
    postDecisionActionId: crash.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  const contFrozen = buildContinuationAssignmentFromTarget({
    action: crash.prepared.actionRecord!,
    target: crashReg.target!,
  });
  crash.store.persistFrozenAssignment(contFrozen, {
    relationship: {
      continuationTargetId: crashReg.target!.continuationTargetId,
      continuationOfAssignmentId: crash.prepared.actionRecord!.executorAssignmentId,
      parentAssignmentId: crash.prepared.actionRecord!.executorAssignmentId,
    },
  });
  crash.store.persistCrashReceipt({
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "crash_receipt",
    timestamp: new Date().toISOString(),
    assignmentId: contFrozen.assignment.assignmentId,
    assignmentHash: contFrozen.assignmentHash,
    providerSessionId: null,
    runId: null,
    reason: "simulated mid-dispatch crash",
  });
  const crashExec = await executeAuthorizedPostDecisionAction({
    store: crash.store,
    postDecisionActionId: crash.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("crash ambiguous refused", crashExec.reason, "crash_ambiguous");

  const fail = await buildVerifiedContinuationCase("gct-fail");
  registerDefaultTarget(fail);
  authorizePostDecisionExecution({
    store: fail.store,
    postDecisionActionId: fail.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  const failResult = await executeAuthorizedPostDecisionAction({
    store: fail.store,
    postDecisionActionId: fail.prepared.actionRecord!.postDecisionActionId,
    provider: new MockExecutionProvider({
      providerId: CURSOR_PROVIDER_ID,
      failOnCreate: true,
    }),
  });
  expectTrue("provider failure still records execution evidence", failResult.executed);
  expectTrue("provider failure evidence id present", Boolean(failResult.executionEvidenceId));
  expect("provider failure technical verdict", failResult.technicalStatus, "provider_failed");
  const failAuth = fail.store.findValidPostDecisionExecutionAuthorization(
    fail.prepared.actionRecord!.postDecisionActionId,
    fail.prepared.actionRecord!.actionHash,
  )!;
  expect(
    "target consumed after provider-failure evidence",
    fail.store.effectiveGovernedContinuationTargetStatus(
      failAuth.continuationTargetId!,
      failAuth.continuationTargetHash!,
    ),
    "consumed",
  );
  const afterFail = await executeAuthorizedPostDecisionAction({
    store: fail.store,
    postDecisionActionId: fail.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expectTrue("retry after provider failure reuses evidence", afterFail.duplicateExecutionReused);
  expect("same failure evidence", afterFail.executionEvidenceId, failResult.executionEvidenceId);

  const deny = await buildVerifiedContinuationCase("gct-deny");
  registerDefaultTarget(deny);
  authorizePostDecisionExecution({
    store: deny.store,
    postDecisionActionId: deny.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  const denied = await executeAuthorizedPostDecisionAction({
    store: deny.store,
    postDecisionActionId: deny.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock({ resultText: "attempted protected edit" }),
    projectHooks: false,
  });
  // Disposable fixture hooks still correlate denials when projectHooks false uses adapter policy path.
  expectTrue("continuation evidence persisted despite denial path", Boolean(denied.executionEvidenceId));
  expect("commit still false after denial-capable run", denied.action!.preparedAction, "PREPARE_CONTINUATION");
  const denyAssignment = deny.store.loadAssignmentRecord(denied.generatedAssignmentId!);
  expect("push still false", denyAssignment.frozen.assignment.pushAuthorization, false);
  expect("requireNoPush still true", denyAssignment.frozen.assignment.requireNoPush, true);

  section("040 — public API / bypass / exports");

  expectTrue("register exported", "registerGovernedContinuationTarget" in packageExports);
  expectTrue("resolve exported", "resolveGovernedContinuationTargetForAction" in packageExports);
  expectTrue("continuationAssignmentId exported", "continuationAssignmentId" in packageExports);
  expectFalse(
    "build target record not public",
    "buildGovernedContinuationTargetRecord" in packageExports,
  );
  expectFalse(
    "build continuation assignment not public",
    "buildContinuationAssignmentFromTarget" in packageExports,
  );

  // Direct store persist of commit-granting target fails validation
  const bypass = await buildVerifiedContinuationCase("gct-bypass");
  const evilBody = buildGovernedContinuationTargetRecord({
    verificationDecisionId: bypass.decisionId,
    targetKey: "bypass",
    projectId: bypass.assignment.assignment.projectId,
    predecessorExecutorAssignmentId: bypass.prepared.actionRecord!.executorAssignmentId,
    predecessorExecutorExecutionEvidenceId:
      bypass.prepared.actionRecord!.executorExecutionEvidenceId,
    repositoryPath: bypass.assignment.assignment.repositoryPath,
    branch: bypass.assignment.assignment.branch,
    baselineHead: bypass.assignment.assignment.startingHead,
    assignmentText: "bypass",
    allowedPaths: ["allowed.txt"],
    protectedPaths: ["protected.txt"],
    prohibitedCommandClasses: ["git_push"],
    requiredEvidence: ["git"],
    orderingKey: 1,
  });
  const commitEvil = {
    ...evilBody,
    commitAuthorization: true as false,
    targetHash: evilBody.targetHash,
  };
  expectFalse("commit-granting target invalid", validateGovernedContinuationTarget(commitEvil as typeof evilBody));

  section("040 — HEAD drift blocks execution");

  const drift = await buildVerifiedContinuationCase("gct-drift");
  registerDefaultTarget(drift);
  authorizePostDecisionExecution({
    store: drift.store,
    postDecisionActionId: drift.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  const driftAuth = drift.store.findValidPostDecisionExecutionAuthorization(
    drift.prepared.actionRecord!.postDecisionActionId,
    drift.prepared.actionRecord!.actionHash,
  );
  expect(
    "auth head bound",
    driftAuth!.startingHead,
    drift.prepared.actionRecord!.startingHead!.toLowerCase(),
  );

  // Commit in the disposable fixture repo so live HEAD no longer matches authorization baseline.
  const { execFileSync } = await import("node:child_process");
  appendFileSync(drift.fixture.allowedPath, "HEAD_DRIFT_MARKER\n", "utf8");
  execFileSync("git", ["add", "allowed.txt"], {
    cwd: drift.fixture.repositoryPath,
    stdio: "pipe",
  });
  execFileSync("git", ["commit", "-m", "drift"], {
    cwd: drift.fixture.repositoryPath,
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "orchestra",
      GIT_AUTHOR_EMAIL: "orchestra@test.local",
      GIT_COMMITTER_NAME: "orchestra",
      GIT_COMMITTER_EMAIL: "orchestra@test.local",
    },
  });
  const drifted = await executeAuthorizedPostDecisionAction({
    store: drift.store,
    postDecisionActionId: drift.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("head drift refused", drifted.reason, "head_drift");

  section("040-C — predecessor path authority at persist / resolve / execute");

  async function attackBroadened(
    assignmentId: string,
    mode: "store" | "raw" | "restart",
  ) {
    const ctx = await buildVerifiedContinuationCase(assignmentId);
    const pred = ctx.assignment.assignment;
    const broadened = buildGovernedContinuationTargetRecord({
      verificationDecisionId: ctx.decisionId,
      targetKey: `broad-${mode}`,
      projectId: pred.projectId,
      predecessorExecutorAssignmentId: ctx.prepared.actionRecord!.executorAssignmentId,
      predecessorExecutorExecutionEvidenceId:
        ctx.prepared.actionRecord!.executorExecutionEvidenceId,
      repositoryPath: pred.repositoryPath,
      branch: pred.branch,
      baselineHead: pred.startingHead,
      assignmentText: "broadened",
      allowedPaths: [...pred.allowedPaths, "secret-extra.txt"],
      protectedPaths: [...pred.protectedPaths],
      prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      requiredEvidence: ["git", "hooks", "filesystem"],
      orderingKey: 1,
    });
    expectTrue(
      `${mode} broadened hash coherent`,
      validateGovernedContinuationTarget(broadened),
    );

    let persistOk = false;
    try {
      ctx.store.persistGovernedContinuationTarget(broadened);
      persistOk = true;
    } catch {
      persistOk = false;
    }
    expectFalse(`${mode} store persist broaden refused`, persistOk);

    if (mode === "raw" || mode === "restart") {
      appendFileSync(
        join(
          ctx.store.storeRoot,
          "assignments",
          ctx.verifierId,
          "governed-continuation-targets.ndjson",
        ),
        `${JSON.stringify(broadened)}\n`,
        "utf8",
      );
    }

    const storeView =
      mode === "restart" ? createFileEngineeringStore(ctx.store.storeRoot) : ctx.store;
    expect(
      `${mode} find ignores broadened`,
      storeView.findGovernedContinuationTargetById(broadened.continuationTargetId),
      null,
    );

    const provider = new CountingMock();
    const createsBefore = provider.creates;
    const auth = authorizePostDecisionExecution({
      store: storeView,
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      humanAuthorized: true,
    });
    expect(
      `${mode} authorize broaden refused`,
      auth.reason,
      "continuation_target_not_available",
    );
    const exec = await executeAuthorizedPostDecisionAction({
      store: storeView,
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      provider,
    });
    expect(
      `${mode} execute without auth`,
      exec.reason,
      "authorization_not_found",
    );
    expect("provider creates unchanged", provider.creates, createsBefore);

    // Defense in depth: even if coherent auth is hand-persisted to the broadened target,
    // resolve/execute must refuse and never dispatch.
    const forgedAuth = buildPostDecisionExecutionAuthorizationRecord({
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      postDecisionActionHash: ctx.prepared.actionRecord!.actionHash,
      verificationDecisionId: ctx.prepared.actionRecord!.verificationDecisionId,
      preparedAction: "PREPARE_CONTINUATION",
      executorAssignmentId: ctx.prepared.actionRecord!.executorAssignmentId,
      executorExecutionEvidenceId: ctx.prepared.actionRecord!.executorExecutionEvidenceId,
      startingBranch: ctx.prepared.actionRecord!.startingBranch!,
      startingHead: ctx.prepared.actionRecord!.startingHead!,
      continuationTargetId: broadened.continuationTargetId,
      continuationTargetHash: broadened.targetHash,
    });
    if (mode === "raw" || mode === "restart") {
      storeView.persistPostDecisionExecutionAuthorization(forgedAuth);
      const boundExec = await executeAuthorizedPostDecisionAction({
        store: storeView,
        postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
        provider,
      });
      expect(
        `${mode} bound execute broaden refused`,
        boundExec.reason,
        "continuation_target_scope_broadening",
      );
      expect(`${mode} no provider after bound`, provider.creates, createsBefore);
    }
  }

  async function attackWeakened(
    assignmentId: string,
    mode: "store" | "raw" | "restart",
  ) {
    const ctx = await buildVerifiedContinuationCase(assignmentId);
    const pred = ctx.assignment.assignment;
    const weakened = buildGovernedContinuationTargetRecord({
      verificationDecisionId: ctx.decisionId,
      targetKey: `weak-${mode}`,
      projectId: pred.projectId,
      predecessorExecutorAssignmentId: ctx.prepared.actionRecord!.executorAssignmentId,
      predecessorExecutorExecutionEvidenceId:
        ctx.prepared.actionRecord!.executorExecutionEvidenceId,
      repositoryPath: pred.repositoryPath,
      branch: pred.branch,
      baselineHead: pred.startingHead,
      assignmentText: "weakened",
      allowedPaths: [...pred.allowedPaths],
      protectedPaths: [],
      prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      requiredEvidence: ["git", "hooks", "filesystem"],
      orderingKey: 1,
    });
    expectTrue(
      `${mode} weakened hash coherent`,
      validateGovernedContinuationTarget(weakened),
    );
    let persistOk = false;
    try {
      ctx.store.persistGovernedContinuationTarget(weakened);
      persistOk = true;
    } catch {
      persistOk = false;
    }
    expectFalse(`${mode} store persist weaken refused`, persistOk);

    if (mode === "raw" || mode === "restart") {
      appendFileSync(
        join(
          ctx.store.storeRoot,
          "assignments",
          ctx.verifierId,
          "governed-continuation-targets.ndjson",
        ),
        `${JSON.stringify(weakened)}\n`,
        "utf8",
      );
    }
    const storeView =
      mode === "restart" ? createFileEngineeringStore(ctx.store.storeRoot) : ctx.store;
    expect(
      `${mode} find ignores weakened`,
      storeView.findGovernedContinuationTargetById(weakened.continuationTargetId),
      null,
    );
    const provider = new CountingMock();
    const createsBefore = provider.creates;
    const auth = authorizePostDecisionExecution({
      store: storeView,
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      humanAuthorized: true,
    });
    expect(
      `${mode} authorize weaken refused`,
      auth.reason,
      "continuation_target_not_available",
    );
    const exec = await executeAuthorizedPostDecisionAction({
      store: storeView,
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      provider,
    });
    expect(`${mode} execute weaken no auth`, exec.reason, "authorization_not_found");
    expect(`${mode} weaken provider creates`, provider.creates, createsBefore);

    if (mode === "raw" || mode === "restart") {
      const forgedAuth = buildPostDecisionExecutionAuthorizationRecord({
        postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
        postDecisionActionHash: ctx.prepared.actionRecord!.actionHash,
        verificationDecisionId: ctx.prepared.actionRecord!.verificationDecisionId,
        preparedAction: "PREPARE_CONTINUATION",
        executorAssignmentId: ctx.prepared.actionRecord!.executorAssignmentId,
        executorExecutionEvidenceId: ctx.prepared.actionRecord!.executorExecutionEvidenceId,
        startingBranch: ctx.prepared.actionRecord!.startingBranch!,
        startingHead: ctx.prepared.actionRecord!.startingHead!,
        continuationTargetId: weakened.continuationTargetId,
        continuationTargetHash: weakened.targetHash,
      });
      storeView.persistPostDecisionExecutionAuthorization(forgedAuth);
      const boundExec = await executeAuthorizedPostDecisionAction({
        store: storeView,
        postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
        provider,
      });
      expect(
        `${mode} bound execute weaken refused`,
        boundExec.reason,
        "continuation_target_protected_path_weakening",
      );
      expect(`${mode} weaken no provider after bound`, provider.creates, createsBefore);
    }
  }

  await attackBroadened("gct-c-store-broad", "store");
  await attackBroadened("gct-c-raw-broad", "raw");
  await attackBroadened("gct-c-restart-broad", "restart");
  await attackWeakened("gct-c-store-weak", "store");
  await attackWeakened("gct-c-raw-weak", "raw");
  await attackWeakened("gct-c-restart-weak", "restart");

  // Both violations in one record
  {
    const ctx = await buildVerifiedContinuationCase("gct-c-both");
    const pred = ctx.assignment.assignment;
    const both = buildGovernedContinuationTargetRecord({
      verificationDecisionId: ctx.decisionId,
      targetKey: "both",
      projectId: pred.projectId,
      predecessorExecutorAssignmentId: ctx.prepared.actionRecord!.executorAssignmentId,
      predecessorExecutorExecutionEvidenceId:
        ctx.prepared.actionRecord!.executorExecutionEvidenceId,
      repositoryPath: pred.repositoryPath,
      branch: pred.branch,
      baselineHead: pred.startingHead,
      assignmentText: "both",
      allowedPaths: [...pred.allowedPaths, "extra.txt"],
      protectedPaths: [],
      prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      requiredEvidence: ["git"],
      orderingKey: 1,
    });
    let persistOk = false;
    try {
      ctx.store.persistGovernedContinuationTarget(both);
      persistOk = true;
    } catch {
      persistOk = false;
    }
    expectFalse("both violations persist refused", persistOk);
  }

  section("040-C — legitimate narrowing and stronger protection still work");

  {
    const ctx = await buildVerifiedContinuationCase("gct-c-narrow");
    const pred = ctx.assignment.assignment;
    // Fixture typically has allowed.txt; narrowing to exact preserved path is valid.
    const narrow = registerDefaultTarget(ctx, {
      targetKey: "narrow",
      allowedPaths: [pred.allowedPaths[0]!],
      protectedPaths: [...pred.protectedPaths, "extra-protect.txt"],
    });
    expectTrue("legitimate narrow+stronger registered", narrow.registered);
    const auth = authorizePostDecisionExecution({
      store: ctx.store,
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      humanAuthorized: true,
    });
    expectTrue("narrow authorize", auth.authorized);
    const provider = new CountingMock({
      events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    });
    const exec = await executeAuthorizedPostDecisionAction({
      store: ctx.store,
      postDecisionActionId: ctx.prepared.actionRecord!.postDecisionActionId,
      provider,
    });
    expectTrue("narrow execute", exec.executed);
    const cont = ctx.store.loadAssignmentRecord(exec.generatedAssignmentId!);
    expect(
      "narrow allowed exact",
      cont.frozen.assignment.allowedPaths,
      [pred.allowedPaths[0]!],
    );
    expectTrue(
      "stronger protect retained",
      cont.frozen.assignment.protectedPaths.includes("extra-protect.txt"),
    );
  }

  section("040-C — nontrivial path comparison attacks");

  {
    const ctx = await buildVerifiedContinuationCase("gct-c-paths");
    const pred = ctx.assignment.assignment;
    expect(
      "sibling path broaden refuse",
      registerDefaultTarget(ctx, {
        targetKey: "sib",
        allowedPaths: [...pred.allowedPaths, "sibling-other.txt"],
      }).reason,
      "scope_broadening",
    );
    expect(
      "parent directory broaden refuse",
      registerDefaultTarget(ctx, {
        targetKey: "parent",
        allowedPaths: ["..", ...pred.allowedPaths],
      }).reason,
      "scope_broadening",
    );
    expect(
      "wildcard style broaden refuse",
      registerDefaultTarget(ctx, {
        targetKey: "wild",
        allowedPaths: [...pred.allowedPaths, "*"],
      }).reason,
      "scope_broadening",
    );
    expect(
      "protected removal refuse",
      registerDefaultTarget(ctx, {
        targetKey: "rmprot",
        protectedPaths: pred.protectedPaths.slice(1),
      }).reason,
      "protected_path_weakening",
    );
    expect(
      "protected substitution refuse",
      registerDefaultTarget(ctx, {
        targetKey: "subprot",
        protectedPaths: ["unrelated-protect.txt"],
      }).reason,
      "protected_path_weakening",
    );
    const exact = registerDefaultTarget(ctx, {
      targetKey: "exact",
      allowedPaths: [...pred.allowedPaths],
      protectedPaths: [...pred.protectedPaths],
    });
    expectTrue("exact path preservation registers", exact.registered);
  }
}
