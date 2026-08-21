import { appendFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { adjudicateVerifierExecution } from "../engineering-store/adjudicate-verifier.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { preparePostDecisionAction } from "../engineering-store/prepare-post-decision-action.js";
import { authorizePostDecisionExecution } from "../engineering-store/authorize-post-decision-execution.js";
import { executeAuthorizedPostDecisionAction } from "../engineering-store/execute-authorized-post-decision-action.js";
import {
  buildPostDecisionExecutionAuthorizationRecord,
  validatePostDecisionExecutionAuthorization,
} from "../engineering-store/post-decision-execution-authorization.js";
import { correctionAssignmentId } from "../engineering-store/build-correction-assignment.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { synthesizeExecutionResult } from "../result.js";
import * as packageExports from "../index.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-pda-exec-"));
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

async function buildDecisionCase(
  assignmentId: string,
  opts: {
    writeMarker?: boolean;
    human?: boolean;
    protectedMutation?: boolean;
    prose?: string;
  } = {},
) {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  let assignment = fixture.assignment;
  if (opts.human) {
    assignment = createAssignment({
      ...assignment.assignment,
      structuredObligations: [
        {
          obligationId: "subjective-ux",
          summary: "feel polished",
          verificationMode: "HUMAN_JUDGMENT_REQUIRED",
        },
      ],
      createdAt: assignment.assignment.createdAt,
    });
  }
  if (opts.writeMarker) appendFileSync(fixture.allowedPath, "ADAPTER_ALLOWED_TEST\n", "utf8");
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(assignment);
  const pre = await collectGitEvidence(fixture.repositoryPath);
  const result = synthesizeExecutionResult({
    frozen: assignment,
    providerId: CURSOR_PROVIDER_ID,
    providerSessionId: "mock-session",
    runId: "mock-run",
    providerStatus: "finished",
    normalizedEvents: [{ type: "run_finished", timestamp: new Date().toISOString() }],
    providerFinalResultText: opts.prose ?? null,
    preRunGitEvidence: pre,
    postRunGitEvidence: pre,
    policyDenials: [],
    changedPaths: opts.protectedMutation ? ["protected.txt"] : ["allowed.txt"],
    protectedPathMutationOccurred: opts.protectedMutation ?? false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: opts.protectedMutation ? ["protected.txt"] : [],
  });
  const evidence = store.persistExecutionEvidence(
    buildExecutionEvidence({ frozen: assignment, result, providerStarted: true }),
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
    provider: new CountingMock({ resultText: opts.prose ?? "mock", events: [] }),
  });
  const adjudication = adjudicateVerifierExecution({ store, verifierAssignmentId: verifierId });
  const prepared = preparePostDecisionAction({
    store,
    verificationDecisionId: adjudication.decisionRecord!.verificationDecisionId,
  });
  return { fixture, store, assignment, evidence, verifierId, adjudication, prepared, pre };
}

export async function runPostDecisionExecutionTests(): Promise<void> {
  section("039 — authorization integrity and refusals");

  const corr = await buildDecisionCase("pdaex-corr", {
    writeMarker: false,
    prose: "VERIFIED CONTINUE CREATE CORRECTION",
  });
  expect("prepared PREPARE_CORRECTION", corr.prepared.preparedAction, "PREPARE_CORRECTION");
  const actionId = corr.prepared.actionRecord!.postDecisionActionId;

  const noAuth = authorizePostDecisionExecution({
    store: corr.store,
    postDecisionActionId: actionId,
    humanAuthorized: false,
  });
  expect("no authorization refused", noAuth.reason, "human_authorization_required");

  const authorized = authorizePostDecisionExecution({
    store: corr.store,
    postDecisionActionId: actionId,
    humanAuthorized: true,
  });
  expectTrue("authorized", authorized.authorized);
  expectTrue("auth humanAuthorized", authorized.authorization!.humanAuthorized);
  expect("auth preparedAction", authorized.authorization!.preparedAction, "PREPARE_CORRECTION");
  expect("auth action hash bound", authorized.authorization!.postDecisionActionHash, corr.prepared.actionRecord!.actionHash);

  const reusedAuth = authorizePostDecisionExecution({
    store: corr.store,
    postDecisionActionId: actionId,
    humanAuthorized: true,
  });
  expectTrue("auth idempotent", reusedAuth.duplicateAuthorizationReused);

  // Forged authorization: bad hash
  const forgedBody = {
    ...authorized.authorization!,
    authorizationHash: "00".repeat(32),
  };
  expectFalse("forged auth invalid", validatePostDecisionExecutionAuthorization(forgedBody));
  let forgedPersist = false;
  try {
    corr.store.persistPostDecisionExecutionAuthorization(forgedBody);
    forgedPersist = true;
  } catch {
    forgedPersist = false;
  }
  expectFalse("forged auth persist refused", forgedPersist);

  section("039 — REQUIRE_HUMAN_DECISION never executes");

  const human = await buildDecisionCase("pdaex-human", { writeMarker: true, human: true });
  expect("prepared REQUIRE_HUMAN_DECISION", human.prepared.preparedAction, "REQUIRE_HUMAN_DECISION");
  const humanAuth = authorizePostDecisionExecution({
    store: human.store,
    postDecisionActionId: human.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expect("human auth refused", humanAuth.reason, "human_decision_not_executable");
  const humanExec = await executeAuthorizedPostDecisionAction({
    store: human.store,
    postDecisionActionId: human.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("human exec refused", humanExec.reason, "human_decision_required");

  section("039 — continuation target absent");

  const cont = await buildDecisionCase("pdaex-cont", { writeMarker: true });
  expect(
    "cont decision VERIFIED",
    cont.adjudication.decisionRecord!.decision,
    "VERIFIED",
  );
  expect("prepared PREPARE_CONTINUATION", cont.prepared.preparedAction, "PREPARE_CONTINUATION");
  const contAuthAbsent = authorizePostDecisionExecution({
    store: cont.store,
    postDecisionActionId: cont.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expect("continuation auth refused without target", contAuthAbsent.reason, "continuation_target_not_available");
  const contExec = await executeAuthorizedPostDecisionAction({
    store: cont.store,
    postDecisionActionId: cont.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("continuation exec refused without auth", contExec.reason, "authorization_not_found");

  section("039 — programmatic correction execution (no courier)");

  const provider = new CountingMock({
    resultText: "correction applied",
    events: [{ type: "run_finished", timestamp: new Date().toISOString() }],
  });
  const createsBefore = provider.creates;
  const executed = await executeAuthorizedPostDecisionAction({
    store: corr.store,
    postDecisionActionId: actionId,
    provider,
  });
  expectTrue("correction executed", executed.executed);
  expectTrue("provider started", executed.providerStarted);
  expectTrue("evidence persisted", Boolean(executed.executionEvidenceId));
  expectTrue("assignment generated", Boolean(executed.generatedAssignmentId));
  expect(
    "correction assignment id",
    executed.generatedAssignmentId,
    correctionAssignmentId(actionId),
  );
  expectTrue("provider createSession called", provider.creates > createsBefore);
  expectTrue(
    "assignment submitted programmatically",
    provider.submitted.includes(correctionAssignmentId(actionId)),
  );

  const corrRecord = corr.store.loadAssignmentRecord(executed.generatedAssignmentId!);
  expect("role executor", corrRecord.frozen.assignment.role, "executor");
  expect(
    "correctionOf linkage",
    corrRecord.relationship.correctionOfAssignmentId,
    "pdaex-corr",
  );
  expect("commitAuthorization false", corrRecord.frozen.assignment.commitAuthorization, false);
  expect("pushAuthorization false", corrRecord.frozen.assignment.pushAuthorization, false);
  expect("requireNoPush true", corrRecord.frozen.assignment.requireNoPush, true);
  expectTrue(
    "allowed scope preserved",
    corrRecord.frozen.assignment.allowedPaths.every((p) =>
      corr.assignment.assignment.allowedPaths.includes(p),
    ),
  );
  expectTrue(
    "protected paths preserved",
    corr.assignment.assignment.protectedPaths.every((p) =>
      corrRecord.frozen.assignment.protectedPaths.includes(p),
    ),
  );
  expectTrue(
    "deterministic failure content",
    corrRecord.frozen.assignment.assignmentText.includes("Failed requirement IDs:"),
  );
  expectFalse(
    "no provider prose authority in correction text",
    corrRecord.frozen.assignment.assignmentText.includes("VERIFIED CONTINUE CREATE CORRECTION"),
  );

  const duplicate = await executeAuthorizedPostDecisionAction({
    store: corr.store,
    postDecisionActionId: actionId,
    provider: new CountingMock(),
  });
  expectTrue("duplicate reused", duplicate.duplicateExecutionReused);
  expect("same evidence", duplicate.executionEvidenceId, executed.executionEvidenceId);

  const restarted = createFileEngineeringStore(corr.store.storeRoot);
  expectTrue(
    "restart action",
    Boolean(restarted.findPostDecisionActionById(actionId)),
  );
  expectTrue(
    "restart authorization",
    Boolean(
      restarted.findValidPostDecisionExecutionAuthorization(
        actionId,
        corr.prepared.actionRecord!.actionHash,
      ),
    ),
  );
  expectTrue(
    "restart correction evidence",
    Boolean(restarted.loadLatestExecutionEvidence(correctionAssignmentId(actionId))),
  );

  section("039 — no authorization execute refused / mismatch / baseline / exports");

  const corr2 = await buildDecisionCase("pdaex-noauth", { writeMarker: false });
  const execNoAuth = await executeAuthorizedPostDecisionAction({
    store: corr2.store,
    postDecisionActionId: corr2.prepared.actionRecord!.postDecisionActionId,
    provider: new CountingMock(),
  });
  expect("execute without auth refused", execNoAuth.reason, "authorization_not_found");

  // Authorization/action mismatch: authorize corr, try execute cont action id won't work;
  // forge auth for wrong preparedAction via hand-build against correct action hash but wrong preparedAction fails validate.
  let mismatchPersisted = false;
  try {
    const mismatchAuth = buildPostDecisionExecutionAuthorizationRecord({
      postDecisionActionId: corr2.prepared.actionRecord!.postDecisionActionId,
      postDecisionActionHash: corr2.prepared.actionRecord!.actionHash,
      verificationDecisionId: corr2.prepared.actionRecord!.verificationDecisionId,
      preparedAction: "PREPARE_CONTINUATION",
      executorAssignmentId: corr2.prepared.actionRecord!.executorAssignmentId,
      executorExecutionEvidenceId: corr2.prepared.actionRecord!.executorExecutionEvidenceId,
      startingBranch: corr2.prepared.actionRecord!.startingBranch!,
      startingHead: corr2.prepared.actionRecord!.startingHead!,
      continuationTargetId: "gct-forged-target",
      continuationTargetHash: "ab".repeat(32),
    });
    // Builder allows constructed record; store must refuse mismatch with action.
    corr2.store.persistPostDecisionExecutionAuthorization(mismatchAuth);
    mismatchPersisted = true;
  } catch {
    mismatchPersisted = false;
  }
  expectFalse("auth preparedAction mismatch refused", mismatchPersisted);

  // Branch drift: authorize then we can't easily change git branch; HEAD drift similarly.
  // Authorize with valid baseline then attempt execute after mutating startingHead on a forged auth is covered by hash bind.
  const headDriftCase = await buildDecisionCase("pdaex-drift", { writeMarker: false });
  const driftAuth = authorizePostDecisionExecution({
    store: headDriftCase.store,
    postDecisionActionId: headDriftCase.prepared.actionRecord!.postDecisionActionId,
    humanAuthorized: true,
  });
  expectTrue("drift case authorized", driftAuth.authorized);
  // Persist a conflicting auth with different startingHead (different hash) — should refuse overwrite if same id
  const drifted = buildPostDecisionExecutionAuthorizationRecord({
    postDecisionActionId: headDriftCase.prepared.actionRecord!.postDecisionActionId,
    postDecisionActionHash: headDriftCase.prepared.actionRecord!.actionHash,
    verificationDecisionId: headDriftCase.prepared.actionRecord!.verificationDecisionId,
    preparedAction: "PREPARE_CORRECTION",
    executorAssignmentId: headDriftCase.prepared.actionRecord!.executorAssignmentId,
    executorExecutionEvidenceId: headDriftCase.prepared.actionRecord!.executorExecutionEvidenceId,
    startingBranch: headDriftCase.prepared.actionRecord!.startingBranch!,
    startingHead: "0".repeat(40),
    authorizedAt: "2099-01-01T00:00:00.000Z",
  });
  let driftOverwrite = false;
  try {
    headDriftCase.store.persistPostDecisionExecutionAuthorization(drifted);
    driftOverwrite = true;
  } catch {
    driftOverwrite = false;
  }
  expectFalse("conflicting auth overwrite refused", driftOverwrite);

  expectFalse("no autoAuthorize export", "autoAuthorizePostDecision" in packageExports);
  expectFalse("no build auth export", "buildPostDecisionExecutionAuthorizationRecord" in packageExports);
  expectTrue("authorize exported", "authorizePostDecisionExecution" in packageExports);
  expectTrue("execute exported", "executeAuthorizedPostDecisionAction" in packageExports);
  expectFalse("no standing continue export", "continueUntilBlocked" in packageExports);
}
