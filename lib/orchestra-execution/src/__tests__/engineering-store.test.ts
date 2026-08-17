import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { buildExecutionEvidence } from "../engineering-store/evidence.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function tempStore(): string {
  return mkdtempSync(join(tmpdir(), "orchestra-eng-store-"));
}

export async function runEngineeringStoreTests(): Promise<void> {
  section("engineering store — freeze, hash, append-only");
  const root = tempStore();
  const fixture = createDisposableExecutionFixture({ assignmentId: "store-a1" });
  const store = createFileEngineeringStore(root);
  store.persistFrozenAssignment(fixture.assignment);
  const loaded = store.loadFrozenAssignment("store-a1");
  expect("reload hash matches", loaded.assignmentHash, fixture.assignment.assignmentHash);
  expect("status frozen before dispatch", store.getAssignmentStatus("store-a1"), "frozen");
  expect("verification pending before dispatch", store.getVerificationPosture("store-a1"), "pending");

  store.persistFrozenAssignment(fixture.assignment);
  expect("idempotent persist keeps one assignment", store.getAssignmentStatus("store-a1"), "frozen");

  const conflicting = createAssignment({
    ...fixture.assignment.assignment,
    assignmentText: "mutated text",
    createdAt: fixture.assignment.assignment.createdAt,
  });
  let duplicateRejected = false;
  try {
    store.persistFrozenAssignment(conflicting);
  } catch {
    duplicateRejected = true;
  }
  expectTrue("duplicate identity with different hash rejected", duplicateRejected);
  expect(
    "frozen assignment file unchanged after conflict",
    store.loadFrozenAssignment("store-a1").assignmentHash,
    fixture.assignment.assignmentHash,
  );

  const assignmentFile = join(root, "assignments", "store-a1", "assignment.json");
  const original = readFileSync(assignmentFile, "utf8");
  writeFileSync(assignmentFile, original.replace(fixture.assignment.assignmentHash, "0".repeat(64)));
  let tamperRejected = false;
  try {
    store.loadFrozenAssignment("store-a1");
  } catch {
    tamperRejected = true;
  }
  writeFileSync(assignmentFile, original);
  expectTrue("tampered assignment hash refused on load", tamperRejected);

  const freezeOnlyRoot = tempStore();
  const freezeOnlyStore = createFileEngineeringStore(freezeOnlyRoot);
  freezeOnlyStore.persistFrozenAssignment(fixture.assignment);
  const afterCrash = createFileEngineeringStore(freezeOnlyRoot);
  expect("freeze-only restart status", afterCrash.getAssignmentStatus("store-a1"), "frozen");
  expect("freeze-only restart has no evidence", afterCrash.loadLatestExecutionEvidence("store-a1"), null);
  expect("freeze-only restart hash", afterCrash.loadFrozenAssignment("store-a1").assignmentHash, fixture.assignment.assignmentHash);

  let forgotStoreRejected = false;
  try {
    createFileEngineeringStore(join(dirname(fileURLToPath(import.meta.url)), "../../../.."));
  } catch {
    forgotStoreRejected = true;
  }
  expectTrue("F.I. Forgot cannot host the engineering store", forgotStoreRejected);

  section("engineering store — freeze-before-dispatch and reconstruction");
  const dispatched = await dispatchFrozenAssignment({
    store,
    provider: new MockExecutionProvider({ resultText: "mock finished" }),
    assignmentId: "store-a1",
  });
  expect("provider status recorded", dispatched.result.providerStatus, "finished");
  expect("verification pending after execution", dispatched.evidence.verificationPosture, "pending");
  expect("current status verification_pending", store.getAssignmentStatus("store-a1"), "verification_pending");
  expectFalse("no automatic commit", dispatched.result.commitOccurred);
  expect("provider text classified untrusted", dispatched.evidence.sources.providerText, "untrusted_prose");
  expect("git classified machine", dispatched.evidence.sources.git, "machine");

  let redispatchRejected = false;
  try {
    await dispatchFrozenAssignment({
      store,
      provider: new MockExecutionProvider(),
      assignmentId: "store-a1",
    });
  } catch {
    redispatchRejected = true;
  }
  expectTrue("already-executed assignment cannot be dispatched again", redispatchRejected);

  let forgedRejected = false;
  try {
    const forged = {
      ...buildExecutionEvidence({
        frozen: fixture.assignment,
        result: dispatched.result,
        providerStarted: true,
      }),
      evidenceHash: "0".repeat(64),
    };
    store.persistExecutionEvidence(forged);
  } catch {
    forgedRejected = true;
  }
  expectTrue("fabricated evidence hash is refused", forgedRejected);

  const restarted = createFileEngineeringStore(root);
  const rebuilt = restarted.getCurrentState("store-a1");
  expect("restart assignment hash", rebuilt.assignmentHash, fixture.assignment.assignmentHash);
  expect("restart verification pending", rebuilt.verificationPosture, "pending");
  expectTrue("restart evidence present", rebuilt.latestEvidence !== null);
  expect("restart evidence hash", rebuilt.latestEvidence?.evidenceHash, dispatched.evidence.evidenceHash);
  expect("audit trail nonempty", restarted.listAuditTrail().length > 0, true);

  section("engineering store — unfrozen dispatch and provider failure");
  const fixture2 = createDisposableExecutionFixture({ assignmentId: "store-unpersisted" });
  let unfrozenRejected = false;
  try {
    await dispatchFrozenAssignment({
      store: createFileEngineeringStore(tempStore()),
      provider: new MockExecutionProvider(),
      assignmentId: fixture2.assignment.assignmentId,
    });
  } catch {
    unfrozenRejected = true;
  }
  expectTrue("dispatch without persisted freeze is rejected", unfrozenRejected);

  const failRoot = tempStore();
  const failStore = createFileEngineeringStore(failRoot);
  const failFixture = createDisposableExecutionFixture({ assignmentId: "store-fail" });
  failStore.persistFrozenAssignment(failFixture.assignment);
  const failed = await dispatchFrozenAssignment({
    store: failStore,
    provider: new MockExecutionProvider({ failOnCreate: true }),
    assignmentId: "store-fail",
  });
  expect("provider failure persisted", failed.result.executionVerdict, "provider_failed");
  expect("failure still verification pending", failed.evidence.verificationPosture, "pending");
  expectTrue("failure evidence kept", createFileEngineeringStore(failRoot).loadLatestExecutionEvidence("store-fail") !== null);

  section("engineering store — baseline mismatch and crash receipt");
  const mismatchRoot = tempStore();
  const mismatchStore = createFileEngineeringStore(mismatchRoot);
  const mismatchFixture = createDisposableExecutionFixture({ assignmentId: "store-mismatch" });
  const wrongHead = createAssignment({
    ...mismatchFixture.assignment.assignment,
    startingHead: "0".repeat(40),
    createdAt: mismatchFixture.assignment.assignment.createdAt,
  });
  mismatchStore.persistFrozenAssignment(wrongHead);
  const mismatch = await dispatchFrozenAssignment({
    store: mismatchStore,
    provider: new MockExecutionProvider(),
    assignmentId: "store-mismatch",
  });
  expect("baseline mismatch did not start provider", mismatch.result.providerStatus, "not_started");
  expect(
    "baseline mismatch status",
    mismatchStore.getAssignmentStatus("store-mismatch"),
    "verification_pending",
  );
  expectTrue(
    "mismatch recorded in evidence",
    mismatch.result.unexpectedChanges.includes("starting_head_mismatch"),
  );

  const crashRoot = tempStore();
  const crashStore = createFileEngineeringStore(crashRoot);
  const crashFixture = createDisposableExecutionFixture({ assignmentId: "store-crash" });
  crashStore.persistFrozenAssignment(crashFixture.assignment);
  mkdirSync(join(crashRoot, "executions"), { recursive: true });
  writeFileSync(join(crashRoot, "executions", "store-crash"), "not-a-directory");
  let persistFailed = false;
  try {
    await dispatchFrozenAssignment({
      store: crashStore,
      provider: new MockExecutionProvider(),
      assignmentId: "store-crash",
    });
  } catch {
    persistFailed = true;
  }
  expectTrue("evidence persist failure is raised", persistFailed);
  const receipts = createFileEngineeringStore(crashRoot).getCurrentState("store-crash").crashReceipts;
  expectTrue("crash receipt records that a provider run may have occurred", receipts.length > 0);
  expectTrue(
    "frozen assignment survived persist failure",
    existsSync(join(crashRoot, "assignments", "store-crash", "assignment.json")),
  );
  let crashRedispatchRejected = false;
  try {
    await dispatchFrozenAssignment({
      store: createFileEngineeringStore(crashRoot),
      provider: new MockExecutionProvider(),
      assignmentId: "store-crash",
    });
  } catch {
    crashRedispatchRejected = true;
  }
  expectTrue("crash receipt blocks replay dispatch", crashRedispatchRejected);

  const verifierRoot = tempStore();
  const verifierStore = createFileEngineeringStore(verifierRoot);
  const verifier = createAssignment({
    ...fixture.assignment.assignment,
    assignmentId: "store-verifier",
    role: "verifier",
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  verifierStore.persistFrozenAssignment(verifier, {
    relationship: { verifiesAssignmentId: "store-a1" },
  });
  expect(
    "verifier relationship persisted",
    verifierStore.loadAssignmentRecord("store-verifier").relationship.verifiesAssignmentId,
    "store-a1",
  );

  section("engineering store — policy denial persistence");
  const denialRoot = tempStore();
  const denialStore = createFileEngineeringStore(denialRoot);
  const denialFixture = createDisposableExecutionFixture({ assignmentId: "store-denial" });
  denialStore.persistFrozenAssignment(denialFixture.assignment);
  const guard = join(denialFixture.repositoryPath, ".cursor", "hooks", "orchestra-guard.mjs");
  spawnSync(
    process.execPath,
    [guard],
    {
      input: JSON.stringify({
        hook_event_name: "preToolUse",
        tool_name: "edit",
        tool_use_id: "tool-blocked",
        session_id: "sess-denial",
        tool_input: { path: "protected.txt" },
      }),
      encoding: "utf8",
      windowsHide: true,
    },
  );
  const denied = await dispatchFrozenAssignment({
    store: denialStore,
    provider: new MockExecutionProvider({ resultText: "attempted protected edit" }),
    assignmentId: "store-denial",
    projectHooks: false,
  });
  expectTrue("policy denial captured in evidence", denied.result.policyDenials.length > 0);
  expect(
    "policy denial reconstructable after restart",
    createFileEngineeringStore(denialRoot).loadLatestExecutionEvidence("store-denial")?.result.policyDenials.length ?? 0,
    denied.result.policyDenials.length,
  );
  expect("denial verification pending", denied.evidence.verificationPosture, "pending");
}
