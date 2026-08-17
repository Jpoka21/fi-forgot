import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CursorExecutionProvider, isCursorSdkAuthenticated } from "../providers/cursor/cursor-provider.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence } from "../git-evidence.js";
import { filesystemMarkerPresent } from "../run-assignment.js";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { dispatchFrozenAssignment } from "../engineering-store/dispatch.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

export interface LiveCursorTestReport {
  ran: boolean;
  blockedReason: string | null;
  assignmentId: string | null;
  assignmentHash: string | null;
  sessionId: string | null;
  runId: string | null;
  allowedChanged: boolean | null;
  protectedChanged: boolean | null;
  denialCount: number | null;
  headUnchanged: boolean | null;
  commitOccurred: boolean | null;
  verdict: string | null;
  verificationPosture: string | null;
  reconstructed: boolean | null;
  providerText: string | null;
}

export let liveCursorReport: LiveCursorTestReport = {
  ran: false,
  blockedReason: "not executed",
  assignmentId: null,
  assignmentHash: null,
  sessionId: null,
  runId: null,
  allowedChanged: null,
  protectedChanged: null,
  denialCount: null,
  headUnchanged: null,
  commitOccurred: null,
  verdict: null,
  verificationPosture: null,
  reconstructed: null,
  providerText: null,
};

export async function runLiveCursorIntegrationTest(): Promise<void> {
  section("authorized live Cursor disposable integration with engineering store");
  const authenticated = await isCursorSdkAuthenticated();
  if (!authenticated) {
    liveCursorReport = {
      ...liveCursorReport,
      ran: false,
      blockedReason: "Cursor SDK authentication is unavailable in this environment",
    };
    console.log("  ↷ live Cursor test skipped: authentication unavailable");
    return;
  }

  const fixture = createDisposableExecutionFixture({ assignmentId: "orch-imp-034-live" });
  const storeRoot = mkdtempSync(join(tmpdir(), "orchestra-eng-live-"));
  const store = createFileEngineeringStore(storeRoot);
  store.persistFrozenAssignment(fixture.assignment);
  const reloaded = store.loadFrozenAssignment("orch-imp-034-live");
  expect("live freeze hash", reloaded.assignmentHash, fixture.assignment.assignmentHash);
  expect("live status frozen", store.getAssignmentStatus("orch-imp-034-live"), "frozen");
  const baseline = await collectGitEvidence(fixture.repositoryPath);
  expect("live starting HEAD matches assignment", baseline.head, fixture.assignment.assignment.startingHead);
  expect("live branch matches assignment", baseline.branch, fixture.assignment.assignment.branch);

  const provider = new CursorExecutionProvider({
    storeDirectory: `${fixture.repositoryPath}-agent-store`,
  });
  await dispatchFrozenAssignment({
    store,
    provider,
    assignmentId: "orch-imp-034-live",
  });

  const allowedChanged = filesystemMarkerPresent(
    fixture.repositoryPath,
    "allowed.txt",
    "ADAPTER_ALLOWED_TEST",
  );
  const protectedChanged = filesystemMarkerPresent(
    fixture.repositoryPath,
    "protected.txt",
    "ADAPTER_BLOCKED_TEST",
  );
  const protectedOriginal = readFileSync(fixture.protectedPath, "utf8").includes("protected-initial");

  const restarted = createFileEngineeringStore(storeRoot);
  const state = restarted.getCurrentState("orch-imp-034-live");
  const evidence = state.latestEvidence;
  const postGit = await collectGitEvidence(fixture.repositoryPath);

  liveCursorReport = {
    ran: true,
    blockedReason: null,
    assignmentId: state.assignmentId,
    assignmentHash: state.assignmentHash,
    sessionId: evidence?.result.providerSessionId ?? null,
    runId: evidence?.result.runId ?? null,
    allowedChanged,
    protectedChanged,
    denialCount: evidence?.result.policyDenials.length ?? null,
    headUnchanged: evidence ? !evidence.result.headChanged : null,
    commitOccurred: evidence?.result.commitOccurred ?? null,
    verdict: evidence?.result.executionVerdict ?? null,
    verificationPosture: state.verificationPosture,
    reconstructed: true,
    providerText: evidence?.result.providerFinalResultText ?? null,
  };

  expectTrue("live assignment hash present", Boolean(state.assignmentHash));
  expectTrue("live session created", Boolean(evidence?.result.providerSessionId));
  expectTrue("live run created", Boolean(evidence?.result.runId));
  expectTrue("allowed.txt changed by adapter", allowedChanged);
  expectTrue("protected.txt original retained", protectedOriginal);
  expectFalse("protected.txt does not contain blocked marker", protectedChanged);
  expectTrue("hook denial persisted", (evidence?.result.policyDenials.length ?? 0) > 0);
  expectTrue("HEAD unchanged", !evidence?.result.headChanged);
  expect("independent post HEAD matches starting", postGit.head, fixture.assignment.assignment.startingHead);
  expect("independent post branch matches starting", postGit.branch, fixture.assignment.assignment.branch);
  expectFalse("no commit", Boolean(evidence?.result.commitOccurred));
  expectFalse("no push independently evidenced", Boolean(evidence?.result.pushIndependentlyEvidenced));
  expect("verification still pending", state.verificationPosture, "pending");
  expect("restarted hash matches freeze", state.assignmentHash, fixture.assignment.assignmentHash);
  expectTrue(
    "technical verdict is policy denial or within policy with denials recorded",
    evidence?.result.executionVerdict === "completed_with_policy_denial" ||
      (evidence?.result.executionVerdict === "completed_within_policy" &&
        (evidence?.result.policyDenials.length ?? 0) > 0),
  );
}
