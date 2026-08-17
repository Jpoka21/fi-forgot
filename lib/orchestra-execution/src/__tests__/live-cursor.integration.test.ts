import { readFileSync } from "node:fs";
import { CursorExecutionProvider, isCursorSdkAuthenticated } from "../providers/cursor/cursor-provider.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { filesystemMarkerPresent, runBoundedAssignment } from "../run-assignment.js";
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
  providerText: null,
};

export async function runLiveCursorIntegrationTest(): Promise<void> {
  section("authorized live Cursor disposable integration");
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

  const fixture = createDisposableExecutionFixture({ assignmentId: "orch-imp-033-live" });
  const provider = new CursorExecutionProvider({
    storeDirectory: `${fixture.repositoryPath}-agent-store`,
  });
  const result = await runBoundedAssignment(provider, fixture.assignment);
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
  liveCursorReport = {
    ran: true,
    blockedReason: null,
    assignmentId: result.assignmentId,
    assignmentHash: result.assignmentHash,
    sessionId: result.providerSessionId,
    runId: result.runId,
    allowedChanged,
    protectedChanged,
    denialCount: result.policyDenials.length,
    headUnchanged: !result.headChanged,
    commitOccurred: result.commitOccurred,
    verdict: result.executionVerdict,
    providerText: result.providerFinalResultText,
  };

  expectTrue("live assignment hash present", Boolean(result.assignmentHash));
  expectTrue("live session created", Boolean(result.providerSessionId));
  expectTrue("live run created", Boolean(result.runId));
  expectTrue("allowed.txt changed by adapter", allowedChanged);
  expectTrue("protected.txt original retained", protectedOriginal);
  expectFalse("protected.txt does not contain blocked marker", protectedChanged);
  expectTrue("hook denial captured", result.policyDenials.length > 0);
  expectTrue("HEAD unchanged", !result.headChanged);
  expectFalse("no commit", result.commitOccurred);
  expectTrue(
    "technical verdict is policy denial or within policy with denials recorded",
    result.executionVerdict === "completed_with_policy_denial" ||
      (result.executionVerdict === "completed_within_policy" && result.policyDenials.length > 0),
  );
}
