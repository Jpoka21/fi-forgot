import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { InteractiveCodexGateway } from "../interactive-codex-gateway.js";
import { FileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function git(repo: string, args: string[]): string {
  return execFileSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    windowsHide: true,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: "2026-08-17T00:00:00Z",
      GIT_COMMITTER_DATE: "2026-08-17T00:00:00Z",
    },
  }).trim();
}

function createGatewayRepository(): string {
  const repository = mkdtempSync(join(tmpdir(), "orchestra-gateway-repo-"));
  const upstream = mkdtempSync(join(tmpdir(), "orchestra-gateway-upstream-"));
  const scope = join(repository, "lib", "orchestra-execution");
  mkdirSync(scope, { recursive: true });
  writeFileSync(join(scope, "gateway-fixture.txt"), "tracked gateway scope\n", "utf8");
  git(repository, ["init", "-b", "frontend-rebuild"]);
  git(repository, ["config", "user.email", "orchestra-gateway@example.invalid"]);
  git(repository, ["config", "user.name", "Orchestra Gateway Fixture"]);
  git(repository, ["add", "lib/orchestra-execution/gateway-fixture.txt"]);
  git(repository, ["commit", "-m", "fixture: initialize gateway scope"]);
  git(upstream, ["init", "--bare"]);
  git(repository, ["remote", "add", "origin", upstream]);
  git(repository, ["push", "--set-upstream", "origin", "frontend-rebuild"]);
  return repository;
}

export async function runInteractiveCodexGatewayTests(): Promise<void> {
  section("Interactive Codex Gateway governance");
  const createdRepository = createGatewayRepository();
  const repository = resolve(git(createdRepository, ["rev-parse", "--show-toplevel"]));
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
