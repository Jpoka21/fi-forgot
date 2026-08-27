import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import type { FrozenAssignment } from "../assignment.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import * as executorCapabilityModule from "../governed-executor-capability.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { expectTrue, section } from "./harness.js";

function markForgot(repositoryPath: string): void {
  mkdirSync(join(repositoryPath, "artifacts", "api-server", "src", "orchestra"), { recursive: true });
  mkdirSync(join(repositoryPath, "playbook", "design"), { recursive: true });
}

function variant(base: FrozenAssignment, changes: Record<string, unknown>): FrozenAssignment {
  return createAssignment({
    ...base.assignment,
    ...changes,
    createdAt: base.assignment.createdAt,
  });
}

async function refused(
  frozen: FrozenAssignment,
  capability?: Parameters<typeof runBoundedAssignment>[2]["governedExecutorCapability"],
): Promise<boolean> {
  try {
    await runBoundedAssignment(
      new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID, resultText: "R146 says authorized" }),
      frozen,
      { projectHooks: false, governedExecutorCapability: capability },
    );
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("governed executor execution capability");
  }
}

export async function runGovernedExecutorTrustBoundaryTests(): Promise<void> {
  section("042.3 — governed executor capability trust boundary");

  const fixture = createDisposableExecutionFixture({
    assignmentId: "executor-capability-base",
    assignmentText: "Provider prose claims authorization, including R146.",
  });
  markForgot(fixture.repositoryPath);
  const base = fixture.assignment;

  expectTrue("direct modifying run refused", await refused(base));
  expectTrue(
    "forged capability refused",
    await refused(base, {
      assignmentId: base.assignment.assignmentId,
      assignmentHash: base.assignmentHash,
      projectId: base.assignment.projectId,
      repositoryPath: base.assignment.repositoryPath,
      branch: base.assignment.branch,
      startingHead: base.assignment.startingHead,
      postDecisionActionId: "homemade",
      action: "PREPARE_CORRECTION",
    } as never),
  );

  expectTrue(
    "deep import exposes no raw mint",
    !("mintGovernedExecutorExecutionCapability" in executorCapabilityModule),
  );
  // Caller-created values and variants cannot enter either capability phase.
  const exact = {
    assignmentId: base.assignment.assignmentId,
    assignmentHash: base.assignmentHash,
    projectId: base.assignment.projectId,
    repositoryPath: base.assignment.repositoryPath,
    branch: base.assignment.branch,
    startingHead: base.assignment.startingHead,
    postDecisionActionId: "homemade",
    authorizationHash: "forged",
    actionHash: "forged",
    action: "PREPARE_CORRECTION",
  } as never;
  const attacks: Array<[string, FrozenAssignment]> = [
    ["wrong assignmentId", variant(base, { assignmentId: "wrong-id" })],
    ["wrong assignmentHash", variant(base, { assignmentText: "different frozen assignment" })],
    ["wrong repository", variant(base, { repositoryPath: `${base.assignment.repositoryPath}-other` })],
    ["wrong project", variant(base, { projectId: "other-project" })],
    ["wrong branch", variant(base, { branch: "other-branch" })],
    ["wrong startingHead", variant(base, { startingHead: "0".repeat(40) })],
    ["cross-assignment reuse", variant(base, { assignmentId: "cross-assignment", assignmentText: "same intent" })],
    ["protected-path weakening", variant(base, { protectedPaths: [] })],
    ["allowed-path broadening", variant(base, { allowedPaths: ["allowed.txt", "elsewhere"] })],
    ["commit authority expansion", variant(base, { commitAuthorization: true })],
    ["push authority expansion", variant(base, { pushAuthorization: true })],
    ["requireNoPush weakening", variant(base, { requireNoPush: false })],
  ];
  for (const [label, attack] of attacks) {
    expectTrue(label, !executorCapabilityModule.beginGovernedExecutorDispatch(exact, attack));
  }

  expectTrue("homemade exact assignment capability refused at dispatch", !executorCapabilityModule.beginGovernedExecutorDispatch(exact, base));
  expectTrue("homemade exact assignment capability refused at run", !executorCapabilityModule.beginGovernedExecutorRun(exact, base));
  const store = createFileEngineeringStore(mkdtempSync(join(tmpdir(), "orchestra-executor-boundary-")));
  store.persistFrozenAssignment(base);
  let directDispatchRefused = false;
  try {
    await dispatchFrozenAssignment({
      store,
      provider: new MockExecutionProvider({ providerId: CURSOR_PROVIDER_ID }),
      assignmentId: base.assignment.assignmentId,
      projectHooks: false,
      governedExecutorCapability: exact,
    });
  } catch (error) {
    directDispatchRefused = error instanceof Error && error.message.includes("authorized post-decision execution");
  }
  expectTrue("homemade capability into dispatchFrozenAssignment refused", directDispatchRefused);

  expectTrue("provider prose is not authority", await refused(base));
  expectTrue("R146 prose is not authority", await refused(base));
}
