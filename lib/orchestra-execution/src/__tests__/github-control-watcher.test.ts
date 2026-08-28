import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileControlJournal, GitHubContentsControlTransport, GitHubControlWatcher, hashGitHubControlRequest, type GitHubControlResult, type GitHubControlTransport } from "../github-control-watcher.js";
import { expect, expectTrue, section } from "./harness.js";

class MemoryTransport implements GitHubControlTransport {
  published: GitHubControlResult[] = [];
  constructor(public requests: Array<{ path: string; request: unknown }>) {}
  async listRequests() { return this.requests }
  async publishResult(result: GitHubControlResult) { this.published.push(result) }
}

export async function runGitHubControlWatcherTests(): Promise<void> {
  section("GitHub control watcher security boundary");
  expectTrue("hash is insensitive to requestHash", hashGitHubControlRequest({ a: 1, requestHash: "hostile" }) === hashGitHubControlRequest({ a: 1 }));
  let rejected = false;
  try { new GitHubContentsControlTransport("token", "attacker/repository"); } catch { rejected = true; }
  expectTrue("transport repository is pinned", rejected);

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
}
