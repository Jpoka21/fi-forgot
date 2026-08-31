import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import type { FrozenAssignment } from "../assignment.js";
import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { dispatchGovernedVerifierAssignment } from "../engineering-store/dispatch-verifier.js";
import { authorizeAndFreezeVerifierAssignment } from "../engineering-store/prepare-verifier.js";
import { routeGovernedVerifierAssignment } from "../engineering-store/route-verifier.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { createGovernedVerifierExecutionCapability } from "../governed-verifier-capability.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { CursorExecutionProvider } from "../providers/cursor/cursor-provider.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-verifier-trust-"));
}

function git(repoPath: string, args: string[]): string {
  return execFileSync("git", ["-C", repoPath, "-c", "commit.gpgsign=false", ...args], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();
}

function markForgotIdentifierRepository(repositoryPath: string): void {
  mkdirSync(join(repositoryPath, "artifacts", "api-server", "src", "orchestra"), { recursive: true });
  mkdirSync(join(repositoryPath, "playbook", "design"), { recursive: true });
}

function readOnlyVerifierShape(frozen: FrozenAssignment, assignmentId: string, repositoryPath: string) {
  return createAssignment({
    ...frozen.assignment,
    assignmentId,
    role: "verifier",
    repositoryPath,
    allowedPaths: [],
    prohibitedCommandClasses: [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
    commitAuthorization: false,
    pushAuthorization: false,
    requireNoPush: true,
    createdAt: frozen.assignment.createdAt,
  });
}

async function persistExecuted(assignmentId: string) {
  const fixture = createDisposableExecutionFixture({ assignmentId });
  const store = createFileEngineeringStore(tempStore());
  store.persistFrozenAssignment(fixture.assignment);
  const dispatched = await dispatchFrozenAssignment({
    store,
    provider: new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
    assignmentId,
  });
  return { fixture, store, dispatched };
}

export async function runVerifierTrustBoundaryTests(): Promise<void> {
  section("verifier trust boundary — lower layer bypass attacks");

  const forgotFixture = createDisposableExecutionFixture({ assignmentId: "trust-forgot-exec" });
  markForgotIdentifierRepository(forgotFixture.repositoryPath);
  const homemadeVerifier = readOnlyVerifierShape(
    forgotFixture.assignment,
    "homemade-read-only-verifier",
    forgotFixture.repositoryPath,
  );

  let directRunRefused = false;
  try {
    await runBoundedAssignment(new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }), homemadeVerifier, {
      projectHooks: false,
    });
  } catch (error) {
    directRunRefused =
      error instanceof Error &&
      error.message.includes("without governed verifier execution capability");
  }
  expectTrue("homemade read-only verifier direct runBoundedAssignment refused", directRunRefused);

  const exec = await persistExecuted("trust-forgot-exec");
  markForgotIdentifierRepository(exec.fixture.repositoryPath);
  exec.store.persistFrozenAssignment(
    readOnlyVerifierShape(
      exec.fixture.assignment,
      "trust-homemade-verifier",
      exec.fixture.repositoryPath,
    ),
    {
      relationship: {
        verifiesAssignmentId: "trust-forgot-exec",
        verifiesExecutionEvidenceId: exec.dispatched.evidence.evidenceId,
      },
    },
  );

  let dispatchVerifierRefused = false;
  try {
    await dispatchFrozenAssignment({
      store: exec.store,
      provider: new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
      assignmentId: "trust-homemade-verifier",
    });
  } catch {
    dispatchVerifierRefused = true;
  }
  expectTrue("homemade verifier direct dispatchFrozenAssignment refused", dispatchVerifierRefused);

  let forgedFlagRefused = false;
  try {
    await dispatchFrozenAssignment({
      store: exec.store,
      provider: new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
      assignmentId: "trust-homemade-verifier",
      governedVerifierCapability: {
        assignmentId: "trust-homemade-verifier",
        assignmentHash: "0".repeat(64),
      } as never,
    });
  } catch {
    forgedFlagRefused = true;
  }
  expectTrue("forged capability object refused", forgedFlagRefused);

  let cursorSessionRefused = false;
  try {
    await new CursorExecutionProvider().createSession({
      repositoryPath: exec.fixture.repositoryPath,
      branch: exec.fixture.branch,
      startingHead: exec.fixture.startingHead,
      governedVerifierExecution: {
        assignmentId: "trust-homemade-verifier",
        assignmentHash: "1".repeat(64),
      } as never,
    });
  } catch (error) {
    cursorSessionRefused =
      error instanceof Error &&
      (error.message.includes("F.I. Forgot repository") ||
        error.message.includes("governed verifier execution capability"));
  }
  expectTrue("direct Cursor createSession bypass refused", cursorSessionRefused);

  section("verifier trust boundary — governed success path preserved");

  const happy = await persistExecuted("trust-governed-ok");
  markForgotIdentifierRepository(happy.fixture.repositoryPath);
  const authorized = authorizeAndFreezeVerifierAssignment({
    store: happy.store,
    executorAssignmentId: "trust-governed-ok",
    executionEvidenceId: happy.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const verifierId = authorized.persisted?.frozen.assignment.assignmentId ?? "";
  const mock = new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID, resultText: "VERIFIED PASS" });
  const routed = await routeGovernedVerifierAssignment({
    store: happy.store,
    verifierAssignmentId: verifierId,
    provider: mock,
  });
  expectTrue("governed route still succeeds", routed.dispatched);
  expectFalse("governed route not refused", routed.refused);
  expect("assignment id correlation", routed.evidence?.assignmentId, verifierId);
  expect("assignment hash correlation", routed.evidence?.assignmentHash, authorized.verifierAssignmentHash);
  expect("authorization preserved", routed.authorization?.assignmentId, verifierId);
  expect("provider prose nonauthoritative", routed.evidence?.sources.providerText, "untrusted_prose");
  expectFalse(
    "provider prose does not create semantic decision",
    JSON.stringify(routed.evidence).includes('"verificationDecision"'),
  );

  const duplicate = await routeGovernedVerifierAssignment({
    store: happy.store,
    verifierAssignmentId: verifierId,
    provider: mock,
  });
  expectTrue("duplicate routing idempotent", duplicate.duplicateEvidenceReused);

  const restarted = createFileEngineeringStore(happy.store.storeRoot);
  expectTrue(
    "restart reconstruction unchanged",
    Boolean(restarted.findValidVerifierAuthorizationReceipt(verifierId, authorized.verifierAssignmentHash ?? "")),
  );
  expect(
    "restart evidence hash unchanged",
    restarted.loadLatestExecutionEvidence(verifierId)?.evidenceHash,
    routed.evidence?.evidenceHash,
  );

  section("verifier trust boundary — policy and disguise attacks");

  const policyBase = await persistExecuted("trust-policy-base");
  const writeCapable = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "trust-write-capable-verifier",
    role: "verifier",
    allowedPaths: ["allowed.txt"],
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(writeCapable, {
    relationship: {
      verifiesAssignmentId: "trust-policy-base",
      verifiesExecutionEvidenceId: policyBase.dispatched.evidence.evidenceId,
    },
  });
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "trust-write-capable-verifier",
    assignmentHash: writeCapable.assignmentHash,
    executorAssignmentId: "trust-policy-base",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "write capable verifier refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
        verifierAssignmentId: "trust-write-capable-verifier",
      })
    ).reason,
    "write_capable_verifier_refused",
  );

  const executorDisguise = createAssignment({
    ...policyBase.fixture.assignment.assignment,
    assignmentId: "trust-executor-disguise",
    role: "verifier",
    allowedPaths: [],
    createdAt: policyBase.fixture.assignment.assignment.createdAt,
  });
  policyBase.store.persistFrozenAssignment(executorDisguise);
  policyBase.store.persistVerifierAuthorizationReceipt({
    assignmentId: "trust-executor-disguise",
    assignmentHash: executorDisguise.assignmentHash,
    executorAssignmentId: "trust-policy-base",
    executionEvidenceId: policyBase.dispatched.evidence.evidenceId,
  });
  expect(
    "executor disguise missing relationship refused",
    (
      await dispatchGovernedVerifierAssignment({
        store: policyBase.store,
        provider: new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
        verifierAssignmentId: "trust-executor-disguise",
      })
    ).reason,
    "verifies_assignment_id_required",
  );

  const branchCaseExec = await persistExecuted("trust-branch-case");
  const branchAuth = authorizeAndFreezeVerifierAssignment({
    store: branchCaseExec.store,
    executorAssignmentId: "trust-branch-case",
    executionEvidenceId: branchCaseExec.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const branchVerifierId = branchAuth.persisted?.frozen.assignment.assignmentId ?? "";
  git(branchCaseExec.fixture.repositoryPath, ["checkout", "-b", "other-branch"]);
  let branchCreates = 0;
  const countingMock = new (class extends MockExecutionProvider {
    override async createSession(target: Parameters<MockExecutionProvider["createSession"]>[0]) {
      branchCreates += 1;
      return super.createSession(target);
    }
  })({ providerId: CURSOR_PROVIDER_ID });
  const branchRefused = await dispatchGovernedVerifierAssignment({
    store: branchCaseExec.store,
    provider: countingMock,
    verifierAssignmentId: branchVerifierId,
  });
  expect("baseline branch mismatch refused", branchRefused.reason, "current_branch_mismatch");
  expect("baseline branch mismatch provider count zero", branchCreates, 0);

  const failCase = await persistExecuted("trust-provider-fail");
  const failAuth = authorizeAndFreezeVerifierAssignment({
    store: failCase.store,
    executorAssignmentId: "trust-provider-fail",
    executionEvidenceId: failCase.dispatched.evidence.evidenceId,
    humanAuthorized: true,
  });
  const failVerifierId = failAuth.persisted?.frozen.assignment.assignmentId ?? "";
  const failed = await dispatchGovernedVerifierAssignment({
    store: failCase.store,
    provider: new MockExecutionProvider({ failOnCreate: true, providerId: CURSOR_PROVIDER_ID }),
    verifierAssignmentId: failVerifierId,
  });
  expectTrue("provider failure evidence persisted", Boolean(failed.evidence));
  expect("provider failure technical verdict", failed.result?.executionVerdict, "provider_failed");

  expectFalse(
    "no correction assignment generated",
    happy.store.listAssignmentIds().some((id) => {
      const rel = happy.store.loadAssignmentRecord(id).relationship.correctionOfAssignmentId;
      return Boolean(rel);
    }),
  );
  expectFalse("no next requirement in evidence", JSON.stringify(routed.evidence).includes('"nextRequirement"'));

  const validCapability = createGovernedVerifierExecutionCapability(verifierId, authorized.verifierAssignmentHash ?? "");
  expectTrue(
    "valid capability matches assignment",
    validCapability.assignmentId === verifierId &&
      validCapability.assignmentHash === authorized.verifierAssignmentHash,
  );

  section("verifier trust boundary — dirty candidate mutation accounting");

  const unchangedDirty = createDisposableExecutionFixture({ assignmentId: "trust-verifier-dirty-unchanged" });
  markForgotIdentifierRepository(unchangedDirty.repositoryPath);
  appendFileSync(unchangedDirty.allowedPath, "preexisting candidate change\n");
  const unchangedVerifier = readOnlyVerifierShape(
    unchangedDirty.assignment,
    "trust-verifier-dirty-unchanged-check",
    unchangedDirty.repositoryPath,
  );
  const unchangedResult = await runBoundedAssignment(
    new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
    unchangedVerifier,
    {
      projectHooks: false,
      governedVerifierCapability: createGovernedVerifierExecutionCapability(
        unchangedVerifier.assignment.assignmentId,
        unchangedVerifier.assignmentHash,
      ),
    },
  );
  expectFalse(
    "unchanged preexisting dirty candidate path not attributed to verifier",
    unchangedResult.unexpectedChanges.includes("allowed.txt"),
  );

  const mutatedDirty = createDisposableExecutionFixture({ assignmentId: "trust-verifier-dirty-mutated" });
  markForgotIdentifierRepository(mutatedDirty.repositoryPath);
  appendFileSync(mutatedDirty.allowedPath, "preexisting candidate change\n");
  const mutatedVerifier = readOnlyVerifierShape(
    mutatedDirty.assignment,
    "trust-verifier-dirty-mutated-check",
    mutatedDirty.repositoryPath,
  );
  const mutatedResult = await runBoundedAssignment(
    new MockExecutionProvider({
      providerId: CURSOR_PROVIDER_ID,
      onSubmit: () => appendFileSync(mutatedDirty.allowedPath, "verifier mutation\n"),
    }),
    mutatedVerifier,
    {
      projectHooks: false,
      governedVerifierCapability: createGovernedVerifierExecutionCapability(
        mutatedVerifier.assignment.assignmentId,
        mutatedVerifier.assignmentHash,
      ),
    },
  );
  expectTrue(
    "verifier mutation of preexisting dirty candidate path fails closed",
    mutatedResult.unexpectedChanges.includes("allowed.txt"),
  );
}
