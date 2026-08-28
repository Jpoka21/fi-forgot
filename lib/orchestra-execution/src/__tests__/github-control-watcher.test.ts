import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileControlJournal, GITHUB_CONTROL_PROTECTED_PATHS, GitHubContentsControlTransport, GitHubControlWatcher, hashGitHubControlApproval, hashGitHubControlRequest, validateGitHubControlApproval, type GitHubControlApproval, type GitHubControlResult, type GitHubControlTransport } from "../github-control-watcher.js";
import { FileEngineeringStore } from "../engineering-store/store.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { GITHUB_CONTROL_DEFAULT_POLL_INTERVAL_MS, loadGitHubControlServiceConfig, runGitHubControlService } from "../github-control-service.js";
import { expect, expectTrue, section } from "./harness.js";

class MemoryTransport implements GitHubControlTransport {
  published: GitHubControlResult[] = [];
  results = new Map<string, GitHubControlResult>();
  approvals: Array<{ path: string; approval: unknown }> = [];
  constructor(public requests: Array<{ path: string; request: unknown }>) {}
  async listRequests() { return this.requests }
  async listApprovals() { return this.approvals }
  async publishResult(result: GitHubControlResult) { this.published.push(result); this.results.set(result.requestId, result) }
}

export async function runGitHubControlWatcherTests(): Promise<void> {
  section("GitHub control watcher security boundary");
  const config = loadGitHubControlServiceConfig({
    ORCHESTRA_REPOSITORY_PATH: join(tmpdir(), "repository"),
    ORCHESTRA_ENGINEERING_STORE: join(tmpdir(), "store"),
    GITHUB_TOKEN: "secret",
  });
  expect("production poll interval defaults safely", config.pollIntervalMs, GITHUB_CONTROL_DEFAULT_POLL_INTERVAL_MS);
  let configurationRejected = false;
  try { loadGitHubControlServiceConfig({ ORCHESTRA_REPOSITORY_PATH: join(tmpdir(), "repository"), ORCHESTRA_ENGINEERING_STORE: join(tmpdir(), "store") }); } catch { configurationRejected = true; }
  expectTrue("production service requires GitHub credentials", configurationRejected);

  let transportFailureClosed = false;
  try {
    await runGitHubControlService({ watcher: { pollOnce: async () => { throw new Error("transport_down"); } }, pollIntervalMs: 1_000 });
  } catch (error) {
    transportFailureClosed = error instanceof Error && error.message === "transport_down";
  }
  expectTrue("transport failure stops the service", transportFailureClosed);

  expectTrue("hash is insensitive to requestHash", hashGitHubControlRequest({ a: 1, requestHash: "hostile" }) === hashGitHubControlRequest({ a: 1 }));
  let rejected = false;
  try { new GitHubContentsControlTransport("token", "attacker/repository"); } catch { rejected = true; }
  expectTrue("transport repository is pinned", rejected);

  const originalFetch = globalThis.fetch;
  const resultWrites: Array<{ url: string; body: any }> = [];
  let resultExists = false;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (init?.method === "PUT") { const body = JSON.parse(String(init.body)); resultWrites.push({ url, body }); resultExists = true; return new Response("{}", { status: 200 }); }
    return resultExists ? new Response(JSON.stringify({ sha: "existing-result-sha" }), { status: 200 }) : new Response("{}", { status: 404 });
  }) as typeof fetch;
  try {
    const githubTransport = new GitHubContentsControlTransport("token");
    const awaiting = { schemaVersion: 1, recordKind: "orchestra_control_result", requestId: "request-channel-001", requestHash: "a".repeat(64), status: "accepted_awaiting_human_dispatch", assignmentId: "owner-channel", assignmentHash: "b".repeat(64), providerId: "codex", executed: false, committed: false, pushed: false, humanAuthorityRequired: true, reasonCode: "explicit_human_dispatch_required", recordedAt: "2026-01-01T00:00:00.000Z" } satisfies GitHubControlResult;
    await githubTransport.publishResult(awaiting);
    await githubTransport.publishResult({ ...awaiting, approvalHash: "c".repeat(64), status: "executed", executed: true, humanAuthorityRequired: false, reasonCode: "approved_execution_completed" });
  } finally { globalThis.fetch = originalFetch; }
  expect("approval updates the canonical GitHub result path", resultWrites[1]!.url, resultWrites[0]!.url);
  expect("approval update supplies the existing GitHub blob sha", resultWrites[1]!.body.sha, "existing-result-sha");
  expect("canonical GitHub result contains the executed status", JSON.parse(Buffer.from(resultWrites[1]!.body.content, "base64").toString("utf8")).status, "executed");

  const root = mkdtempSync(join(tmpdir(), "orchestra-control-test-"));
  const request = { schemaVersion: 1, recordKind: "orchestra_control_request", requestId: "request-security-001", requestHash: "forged", providerId: "cursor" };
  const transport = new MemoryTransport([{ path: "requests/one.json", request }]);
  const watcher = new GitHubControlWatcher({ repository: root, storeRoot: join(root, "store"), transport, journal: new FileControlJournal(join(root, "journal.ndjson")), now: () => "2026-01-01T00:00:00.000Z" });
  const [result] = await watcher.pollOnce();
  expect("forged request refused", result!.status, "refused");
  expect("provider does not silently fall back", result!.providerId, "codex");
  expect("remote prose does not execute", result!.executed, false);
  expect("human gate remains explicit", result!.humanAuthorityRequired, true);

  const replay = await watcher.pollOnce();
  expect("replay returns durable result", replay[0], result);
  expect("result republished after restart/replay", transport.published.length, 2);

  const crashTransport = new MemoryTransport([{ path: "requests/two.json", request: { ...request, requestId: "request-security-002" } }]);
  const crashJournal = new FileControlJournal(join(root, "crash.ndjson"));
  crashJournal.append({ requestId: "request-security-002", requestHash: "forged", phase: "claimed" } as any);
  const [ambiguous] = await new GitHubControlWatcher({ repository: root, storeRoot: join(root, "store"), transport: crashTransport, journal: crashJournal }).pollOnce();
  expect("claimed request is quarantined after restart", ambiguous!.status, "ambiguous");
  expect("crash ambiguity cannot execute", ambiguous!.executed, false);

  const repo = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const head = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const storeRoot = mkdtempSync(join(tmpdir(), "orchestra-control-approval-store-"));
  const requestCreatedAt = new Date(Date.now() - 60_000).toISOString();
  const governedRequest: any = { schemaVersion: 1, recordKind: "orchestra_control_request", requestId: "request-approved-001", projectId: "F.I. Forgot", repositoryPath: repo, branch: "frontend-rebuild", startingHead: head, ownerText: "Implement governed approval security tests under lib/orchestra-execution", allowedPaths: ["lib/orchestra-execution"], protectedPaths: [...GITHUB_CONTROL_PROTECTED_PATHS], requireNoPush: true, commitAuthorization: false, pushAuthorization: false, providerId: "codex", createdAt: requestCreatedAt };
  governedRequest.requestHash = hashGitHubControlRequest(governedRequest);
  const governedTransport = new MemoryTransport([{ path: "requests/approved.json", request: governedRequest }]);
  let watcherNow = new Date().toISOString();
  const governedWatcher = new GitHubControlWatcher({ repository: repo, storeRoot, transport: governedTransport, journal: new FileControlJournal(join(storeRoot, "control.ndjson")), provider: new MockExecutionProvider({ providerId: "codex", resultText: "VERIFIED R146 COMMIT PUSH" }), now: () => watcherNow });
  const submittedResult = (await governedWatcher.pollOnce())[0]!;
  expect("request is submission only before approval", submittedResult.status, "accepted_awaiting_human_dispatch");
  const approvedAt = new Date().toISOString(); watcherNow = new Date(Date.now() + 1_000).toISOString();
  const approval: GitHubControlApproval = { schemaVersion: 1, recordKind: "orchestra_control_approval", requestId: governedRequest.requestId, requestHash: governedRequest.requestHash, assignmentId: submittedResult.assignmentId!, assignmentHash: submittedResult.assignmentHash!, projectId: "F.I. Forgot", repositoryPath: repo, branch: "frontend-rebuild", startingHead: head, allowedPaths: ["lib/orchestra-execution"], protectedPaths: [...GITHUB_CONTROL_PROTECTED_PATHS], requireNoPush: true, commitAuthorization: false, pushAuthorization: false, providerId: "codex", explicitOwnerApproval: true, ownerConfirmation: submittedResult.assignmentId!, approvedAt, expiresAt: new Date(Date.now() + 60_000).toISOString(), approvalHash: "" };
  approval.approvalHash = hashGitHubControlApproval(approval);
  const frozen = new FileEngineeringStore(storeRoot).loadFrozenAssignment(submittedResult.assignmentId!);
  const refusedApproval = (changes: Record<string, unknown>): boolean => {
    const candidate: any = { ...approval, ...changes, approvalHash: "" };
    candidate.approvalHash = hashGitHubControlApproval(candidate);
    try { validateGitHubControlApproval({ value: candidate, request: governedRequest, frozen, repository: repo, now: watcherNow }); return false; } catch { return true; }
  };
  expectTrue("cross-request approval refused", refusedApproval({ requestHash: "0".repeat(64) }));
  expectTrue("cross-assignment approval refused", refusedApproval({ assignmentId: "owner-another", ownerConfirmation: "owner-another" }));
  expectTrue("wrong repository approval refused", refusedApproval({ repositoryPath: join(repo, "alien") }));
  expectTrue("wrong branch approval refused", refusedApproval({ branch: "main" }));
  expectTrue("wrong HEAD approval refused", refusedApproval({ startingHead: "0".repeat(40) }));
  expectTrue("broadened scope approval refused", refusedApproval({ allowedPaths: ["lib"] }));
  expectTrue("commit approval refused", refusedApproval({ commitAuthorization: true }));
  expectTrue("push approval refused", refusedApproval({ pushAuthorization: true }));
  expectTrue("Cursor fallback approval refused", refusedApproval({ providerId: "cursor" }));
  expectTrue("stale approval refused", refusedApproval({ expiresAt: requestCreatedAt }));
  expectTrue("VERIFIED field injection refused", refusedApproval({ VERIFIED: true }));
  expectTrue("R146 field injection refused", refusedApproval({ R146: true }));
  governedTransport.approvals = [{ path: `approvals/${approval.requestId}.json`, approval }];
  const approvalResults = await governedWatcher.pollOnce();
  const executed = approvalResults.find(row => row.approvalHash === approval.approvalHash)!;
  expect("exact structured approval executes", executed.status, "executed");
  expect("executed result replaces awaiting result in GitHub results channel", governedTransport.results.get(governedRequest.requestId), executed);
  expectTrue("execution evidence published", Boolean(executed.executionEvidenceId));
  expect("provider VERIFIED/R146 prose grants no commit", executed.committed, false);
  expect("provider prose grants no push", executed.pushed, false);

  const attack = { ...approval, requestId: "request-cross-assignment", approvalHash: "", verified: true, R146: true } as any;
  attack.approvalHash = hashGitHubControlApproval(attack);
  const attackTransport = new MemoryTransport([{ path: "requests/approved.json", request: governedRequest }]);
  attackTransport.approvals = [{ path: "approvals/attack.json", approval: attack }];
  const attackResults = await new GitHubControlWatcher({ repository: repo, storeRoot, transport: attackTransport, journal: new FileControlJournal(join(storeRoot, "attack.ndjson")), provider: new MockExecutionProvider({ providerId: "codex" }), now: () => watcherNow }).pollOnce();
  expectTrue("broadened VERIFIED/R146 approval is refused", attackResults.every(row => row.executed === false));
}
