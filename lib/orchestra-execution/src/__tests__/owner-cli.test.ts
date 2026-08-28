import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createFileEngineeringStore } from "../engineering-store/store.js";
import { PROTECTED_WRITING_QUALITY_PATHS, runOwnerCli } from "../owner-cli.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

interface Capture {
  stdout: string[];
  stderr: string[];
}

async function invoke(repo: string, args: string[]): Promise<{ result: Awaited<ReturnType<typeof runOwnerCli>>; capture: Capture }> {
  const capture: Capture = { stdout: [], stderr: [] };
  const result = await runOwnerCli(args, {
    out: (value) => capture.stdout.push(value),
    err: (value) => capture.stderr.push(value),
  }, repo);
  return { result, capture };
}

function git(repo: string, args: string[]): string {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", windowsHide: true }).trim();
}

function gitChangedPaths(repo: string): string[] {
  const porcelain = execFileSync(
    "git",
    ["-C", repo, "status", "--porcelain=v1", "--untracked-files=all"],
    { encoding: "utf8", windowsHide: true },
  ).trimEnd();
  return porcelain ? porcelain.split(/\r?\n/).map((row) => row.slice(3).replace(/^.* -> /, "")) : [];
}

function treeFingerprint(root: string): string {
  const hash = createHash("sha256");
  const visit = (path: string): void => {
    for (const name of readdirSync(path).sort()) {
      const child = join(path, name);
      const stat = statSync(child);
      hash.update(name);
      if (stat.isDirectory()) visit(child);
      else hash.update(readFileSync(child));
    }
  };
  visit(root);
  return hash.digest("hex");
}

export async function runOwnerCliTests(): Promise<void> {
  section("ORCH IMP 043B owner CLI");
  const repo = resolve(git(process.cwd(), ["rev-parse", "--show-toplevel"]));
  const beforeGit = git(repo, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const protectedBefore = PROTECTED_WRITING_QUALITY_PATHS.map((path) =>
    createHash("sha256").update(readFileSync(join(repo, path))).digest("hex"),
  );

  for (const helpArgs of [["--help"], ["-h"], ["help"], ["status", "--help"]]) {
    const help = await invoke(repo, helpArgs);
    expect(`${helpArgs[0]} succeeds`, help.result.exitCode, 0);
    expectTrue(`${helpArgs[0]} shows command usage`, help.capture.stdout[0]?.includes("Usage: orchestra <command> [options]") === true);
    expectTrue(`${helpArgs[0]} states the authorization boundary`, help.capture.stdout[0]?.includes("planning input, not execution authorization") === true);
    expect(`${helpArgs[0]} writes no errors`, help.capture.stderr, []);
  }
  expect("help does not mutate repository", git(repo, ["status", "--porcelain=v1", "--untracked-files=all"]), beforeGit);

  const status = await invoke(repo, ["status", "--json", "--repository", repo]);
  expect("status succeeds", status.result.exitCode, 0);
  const parsed = JSON.parse(status.capture.stdout[0]!) as any;
  expect("status JSON active provider is Codex", parsed.activeExecutionProvider, "codex");
  expect("status JSON fallback provider is Cursor", parsed.fallbackProvider, "cursor");
  expect("status JSON exposes GitHub control watcher availability", parsed.githubControlWatcher.available, true);
  expect("status JSON identifies the pinned GitHub control repository", parsed.githubControlWatcher.repository, "Jpoka21/fi-forgot-control");
  expect("status JSON identifies the GitHub control provider", parsed.githubControlWatcher.defaultProvider, "codex");
  expect("status JSON provides the watcher start command", parsed.githubControlWatcher.startCommand, "pnpm --filter @workspace/orchestra-execution start:github-control");
  expect("status JSON repository identity", resolve(parsed.repository), repo);
  expect("status JSON branch", parsed.branch, git(repo, ["branch", "--show-current"]));
  expect("status JSON HEAD", parsed.head, git(repo, ["rev-parse", "HEAD"]));
  expect("status JSON preserves every changed path", parsed.workingTree.changedPaths, gitChangedPaths(repo));
  expect("status does not mutate repository", git(repo, ["status", "--porcelain=v1", "--untracked-files=all"]), beforeGit);
  const humanStatus = await invoke(repo, ["status", "--repository", repo]);
  expectTrue("human status shows GitHub control watcher capability", humanStatus.capture.stdout[0]?.includes("GitHub control watcher: available (Jpoka21/fi-forgot-control, provider codex)") === true);
  expect("protected trio remains byte-identical", PROTECTED_WRITING_QUALITY_PATHS.map((path) =>
    createHash("sha256").update(readFileSync(join(repo, path))).digest("hex"),
  ), protectedBefore);

  const storeRoot = mkdtempSync(join(tmpdir(), "orchestra-owner-cli-store-"));
  createFileEngineeringStore(storeRoot);
  const storeBefore = treeFingerprint(storeRoot);
  const storedStatus = await invoke(repo, ["status", "--json", "--repository", repo, "--store", storeRoot]);
  expect("status with existing store succeeds", storedStatus.result.exitCode, 0);
  expect("status does not mutate engineering store", treeFingerprint(storeRoot), storeBefore);
  const restarted = await invoke(repo, ["status", "--json", "--repository", repo, "--store", storeRoot]);
  expect("restart produces deterministic status", restarted.capture.stdout[0], storedStatus.capture.stdout[0]);

  const rootJson = execFileSync("cmd.exe", ["/d", "/c", "orchestra.cmd", "status", "--json"], {
    cwd: repo,
    encoding: "utf8",
    windowsHide: true,
  }).trim();
  expect("root launcher works", JSON.parse(rootJson).activeExecutionProvider, "codex");

  const unknown = await invoke(repo, ["launch-the-fleet", "--repository", repo]);
  expectTrue("unknown command fails closed", unknown.result.exitCode !== 0);
  const malformed = await invoke(repo, ["authorize", "only-id", "--repository", repo]);
  expectTrue("malformed authorize fails closed", malformed.result.exitCode !== 0);
  const submit = await invoke(repo, ["submit", "implement", "everything", "--repository", repo]);
  expectTrue("unquoted or broad arbitrary prose cannot create execution authority", submit.result.exitCode !== 0);
  expect("submit does not mutate store", treeFingerprint(storeRoot), storeBefore);
  const malformedSubmit = await invoke(repo, ["submit", "prose", "--authorization", "not-authority", "--repository", repo]);
  expect("submit rejects unrelated authority arguments", malformedSubmit.result.exitCode, 64);

  const blanket = await invoke(repo, ["authorize", "action-id", "--confirm", "yes", "--repository", repo, "--store", storeRoot]);
  expectTrue("blanket authorization refused", blanket.result.exitCode !== 0);
  const exactMissing = await invoke(repo, ["authorize", "action-id", "--confirm", "action-id", "--repository", repo, "--store", storeRoot]);
  expect("exact action is required from governed store", (exactMissing.result.payload as any).reason, "action_not_found");
  const continuation = await invoke(repo, ["continue", "action-id", "--repository", repo, "--store", storeRoot]);
  expectTrue("continue requires exact authorization", continuation.result.exitCode !== 0);
  const inventedAuthorization = await invoke(repo, [
    "continue", "action-id", "--authorization", "invented-id", "--repository", repo, "--store", storeRoot,
  ]);
  expect("continue cannot invent governed action authority", (inventedAuthorization.result.payload as any).reason, "action_not_found");
  const invalidProvider = await invoke(repo, [
    "continue", "action-id", "--authorization", "invented-id", "--provider", "automatic", "--repository", repo, "--store", storeRoot,
  ]);
  expectTrue("continue permits only explicit Codex or Cursor selection", invalidProvider.result.exitCode !== 0);

  const resumeBefore = treeFingerprint(storeRoot);
  const resume = await invoke(repo, ["resume", "--json", "--repository", repo, "--store", storeRoot]);
  expect("resume does not manufacture authorization", (resume.result.payload as any).authorizationManufactured, false);
  expect("resume does not execute", (resume.result.payload as any).executed, false);
  expect("resume inspection does not mutate store", treeFingerprint(storeRoot), resumeBefore);
  expect("no automatic commit", git(repo, ["rev-parse", "HEAD"]), parsed.head);
  expectFalse("no automatic push changes ahead count", Number(git(repo, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]).split(/\s+/)[0]) !== parsed.ahead);
}
