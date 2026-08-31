import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { InteractiveCodexGateway } from "../interactive-codex-gateway.js";
import { FileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function git(repo: string, args: string[]): string {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", windowsHide: true }).trim();
}

export async function runInteractiveCodexGatewayTests(): Promise<void> {
  section("Interactive Codex Gateway governance");
  const repository = resolve(git(process.cwd(), ["rev-parse", "--show-toplevel"]));
  const storeRoot = mkdtempSync(join(tmpdir(), "orchestra-gateway-"));
  let providersCreated = 0;
  const gateway = new InteractiveCodexGateway({ repository, storeRoot, providerFactory: () => {
    providersCreated++;
    return new MockExecutionProvider({ providerId: "codex" });
  } });

  const planned = await gateway.converse("Implement gateway test behavior in lib/orchestra-execution");
  expect("conversation freezes request", planned.phase, "authority_required");
  const submission = planned.data as any;
  expectFalse("conversation alone does not execute", submission.executed);
  expectFalse("conversation cannot authorize commit", submission.commitAuthorization);
  expectFalse("conversation cannot authorize push", submission.pushAuthorization);
  expect("provider not created while planning", providersCreated, 0);
  const store = new FileEngineeringStore(storeRoot);
  expect("frozen request has no execution evidence", store.loadExecutionEvidence(submission.assignmentId), []);
  expectTrue("protected paths retained", store.loadFrozenAssignment(submission.assignmentId).assignment.protectedPaths.length > 0);

  const wrong = await gateway.converse(`/dispatch ${submission.assignmentId} wrong`);
  expect("wrong confirmation fails closed", wrong.phase, "refused");
  expect("wrong confirmation never resolves provider", providersCreated, 0);
  expect("wrong confirmation persists no evidence", store.loadExecutionEvidence(submission.assignmentId), []);

  const cursorGateway = new InteractiveCodexGateway({ repository, storeRoot,
    providerFactory: () => new MockExecutionProvider({ providerId: "cursor" }) });
  const fallback = await cursorGateway.converse(`/dispatch ${submission.assignmentId} ${submission.assignmentId}`);
  expect("Cursor fallback refused", fallback.phase, "refused");
  expectTrue("fallback refusal is explicit", fallback.message.includes("no Cursor fallback"));
  expect("fallback refusal persists no execution evidence", store.loadExecutionEvidence(submission.assignmentId), []);
}
