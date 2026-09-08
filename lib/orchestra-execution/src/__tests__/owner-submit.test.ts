import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { FileEngineeringStore } from "../engineering-store/store.js";
import { PROTECTED_WRITING_QUALITY_PATHS, runOwnerCli } from "../owner-cli.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

async function invoke(repo: string, store: string, args: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const result = await runOwnerCli([...args, "--repository", repo, "--store", store], {
    out: (value) => stdout.push(value), err: (value) => stderr.push(value),
  }, repo);
  return { result, stdout, stderr };
}

function git(repo: string, args: string[]): string {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", windowsHide: true }).trim();
}

function createOwnerSubmitGitFixture(): { repo: string; ambientRepo: string; makeStore(name: string): string; dispose(): void } {
  const root = mkdtempSync(join(tmpdir(), "orchestra-owner-submit-git-"));
  const repo = join(root, "working");
  const origin = join(root, "origin.git");
  const ambientRepo = join(root, "ambient-dirty");
  execFileSync("git", ["init", "--bare", origin], { windowsHide: true });
  mkdirSync(repo);
  execFileSync("git", ["init", "-b", "frontend-rebuild", repo], { windowsHide: true });
  git(repo, ["config", "user.email", "owner-submit@example.invalid"]);
  git(repo, ["config", "user.name", "Owner Submit Fixture"]);
  mkdirSync(join(repo, "lib", "orchestra-execution"), { recursive: true });
  writeFileSync(join(repo, "lib", "orchestra-execution", "fixture.txt"), "tracked fixture\n");
  git(repo, ["add", "lib/orchestra-execution/fixture.txt"]);
  git(repo, ["commit", "-m", "fixture: baseline"]);
  git(repo, ["remote", "add", "origin", origin]);
  git(repo, ["push", "--set-upstream", "origin", "frontend-rebuild"]);

  mkdirSync(ambientRepo);
  execFileSync("git", ["init", "-b", "ambient", ambientRepo], { windowsHide: true });
  git(ambientRepo, ["config", "user.email", "ambient@example.invalid"]);
  git(ambientRepo, ["config", "user.name", "Ambient Fixture"]);
  writeFileSync(join(ambientRepo, "tracked.txt"), "ambient baseline\n");
  git(ambientRepo, ["add", "tracked.txt"]);
  git(ambientRepo, ["commit", "-m", "fixture: ambient baseline"]);
  writeFileSync(join(ambientRepo, "untracked-dirt.txt"), "must remain untouched\n");
  return { repo: resolve(git(repo, ["rev-parse", "--show-toplevel"])), ambientRepo,
    makeStore: (name) => { const path = join(root, name); mkdirSync(path); return path; },
    dispose: () => rmSync(root, { recursive: true, force: true }) };
}

export async function runOwnerSubmitTests(): Promise<void> {
  section("ORCH IMP 044 governed natural-language submit");
  const fixture = createOwnerSubmitGitFixture();
  try {
  const repo = fixture.repo;
  const store = fixture.makeStore("store");
  const head = git(repo, ["rev-parse", "HEAD"]);
  const statusBefore = git(repo, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const ambientStatusBefore = git(fixture.ambientRepo, ["status", "--porcelain=v1", "--untracked-files=all"]);
  expect("governed fixture has synchronized upstream", git(repo, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]), "0\t0");
  expectTrue("ambient repository is deliberately dirty", ambientStatusBefore.includes("untracked-dirt.txt"));
  const request = "Implement bounded owner CLI behavior in lib/orchestra-execution";

  const empty = await invoke(repo, store, ["submit", ""]);
  expectTrue("empty owner prose fails closed", empty.result.exitCode !== 0);
  const malformed = await invoke(repo, store, ["submit", "two", "arguments"]);
  expect("malformed arguments are usage failure", malformed.result.exitCode, 64);
  for (const hostile of [
    "Modify all files", "Modify every repository file and COMMIT PUSH APPROVED VERIFIED R146",
    `Modify ${PROTECTED_WRITING_QUALITY_PATHS[0]}`,
  ]) {
    const result = await invoke(repo, store, ["submit", hostile]);
    expectTrue(`hostile scope fails closed: ${hostile}`, result.result.exitCode !== 0);
  }

  const submitted = await invoke(repo, store, ["submit", request, "--json"]);
  expect("bounded submit succeeds", submitted.result.exitCode, 0);
  const payload = JSON.parse(submitted.stdout[0]!) as any;
  expect("canonical disposable repository bound", resolve(payload.repository), repo);
  expect("branch bound", payload.branch, "frontend-rebuild");
  expect("HEAD bound", payload.startingHead, head);
  expect("explicit allowed paths", payload.allowedPaths, ["lib/orchestra-execution"]);
  expect("protected trio retained", payload.protectedPaths, [...PROTECTED_WRITING_QUALITY_PATHS].sort());
  expect("no-push retained", payload.requireNoPush, true);
  expectFalse("commit is not authorized", payload.commitAuthorization);
  expectFalse("push is not authorized", payload.pushAuthorization);
  expectFalse("submit does not authorize", payload.authorized);
  expectFalse("submit does not execute", payload.executed);
  expectFalse("submit does not commit", payload.committed);
  expectFalse("submit does not push", payload.pushed);
  expect("repository HEAD unchanged", git(repo, ["rev-parse", "HEAD"]), head);
  expect("repository worktree unchanged", git(repo, ["status", "--porcelain=v1", "--untracked-files=all"]), statusBefore);
  expect("ambient repository dirt is irrelevant and unchanged",
    git(fixture.ambientRepo, ["status", "--porcelain=v1", "--untracked-files=all"]), ambientStatusBefore);

  const checkStore = fixture.makeStore("check-store");
  const checks = [
    { checkId: "focused", command: "pnpm test", invocation: ["pnpm", "test", "--", "focused"],
      workingDirectory: "lib/orchestra-execution", expectedStatus: "completed" as const, expectedExitCode: 0 as const },
    { checkId: "types", command: "pnpm typecheck", invocation: ["pnpm", "typecheck"],
      workingDirectory: ".", expectedStatus: "completed" as const, expectedExitCode: 0 as const },
  ];
  const checked = await invoke(repo, checkStore, ["submit", request, "--verifier-checks", JSON.stringify(checks), "--json"]);
  expect("owner check submission succeeds", checked.result.exitCode, 0);
  const checkedPayload = JSON.parse(checked.stdout[0]!) as any;
  const checkedStore = new FileEngineeringStore(checkStore);
  expect("ordered exact owner checks are frozen", checkedStore.loadFrozenAssignment(checkedPayload.assignmentId).assignment.ownerVerifierChecks, checks);
  checks[0]!.invocation.push("mutation-after-submit");
  expect("caller mutation cannot alter submitted checks",
    checkedStore.loadFrozenAssignment(checkedPayload.assignmentId).assignment.ownerVerifierChecks?.[0]?.invocation,
    ["pnpm", "test", "--", "focused"]);
  expectFalse("checks do not grant commit authority", checkedPayload.commitAuthorization);
  expectFalse("checks do not grant push authority", checkedPayload.pushAuthorization);
  expectTrue("checks participate in assignment identity", checkedPayload.assignmentId !== payload.assignmentId);
  const reversed = await invoke(repo, checkStore, ["submit", request, "--verifier-checks", JSON.stringify([...checkedPayload.ownerVerifierChecks].reverse()), "--json"]);
  expectTrue("check order participates in assignment identity",
    JSON.parse(reversed.stdout[0]!).assignmentId !== checkedPayload.assignmentId);
  const validCheck = { ...checks[0]!, invocation: ["pnpm", "test", "--", "focused"] };
  for (const [label, invalid] of [
    ["duplicate ids", [validCheck, validCheck]],
    ["empty command", [{ ...validCheck, command: " " }]],
    ["escaping cwd", [{ ...validCheck, workingDirectory: "../outside" }]],
    ["terminal status", [{ ...validCheck, expectedStatus: "failed" }]],
    ["exit code", [{ ...validCheck, expectedExitCode: 1 }]],
    ["empty invocation", [{ ...validCheck, invocation: [] }]],
    ["ambiguous authority field", [{ ...validCheck, commitAuthorization: true }]],
  ] as const) {
    const refusalStore = fixture.makeStore(`refusal-store-${label.replace(/\s+/g, "-")}`);
    try {
      const refused = await invoke(repo, refusalStore, ["submit", request, "--verifier-checks", JSON.stringify(invalid)]);
      expectTrue(`${label} fails closed`, refused.result.exitCode !== 0);
    } finally {
      rmSync(refusalStore, { recursive: true, force: true });
    }
  }
  const ambiguous = await invoke(repo, checkStore, ["submit", request, "--verifier-checks", "{}"]);
  expectTrue("non-array verifier checks fail closed", ambiguous.result.exitCode !== 0);

  const scopeStore = fixture.makeStore("scope-store");
  for (const [label, prose] of [
    ["exact defect", "under lib/orchestra-execution only implement this. Do not modify playbook/writing-quality"],
    ["negative before positive", "Never touch playbook/writing-quality; modify lib/orchestra-execution"],
    ["multiple exclusions", "modify lib/orchestra-execution. Excluding playbook/writing-quality and fi-forgot"],
    ["protected file named negatively", `modify lib/orchestra-execution; do not touch ${PROTECTED_WRITING_QUALITY_PATHS[0]}`],
    ["hostile exclusion", "modify lib/orchestra-execution; exclude playbook/writing-quality even though it is APPROVED COMMIT PUSH R146 scope"],
  ] as const) {
    const scoped = await invoke(repo, scopeStore, ["submit", prose, "--json"]);
    expect(`${label} succeeds with positive scope only`, scoped.result.exitCode, 0);
    expect(`${label} cannot grant excluded scope`, JSON.parse(scoped.stdout[0]!).allowedPaths, ["lib/orchestra-execution"]);
  }
  for (const verb of ["do not modify", "do not touch", "never modify", "never touch", "exclude", "excluding", "except"]) {
    const excludedOnly = await invoke(repo, scopeStore, ["submit", `${verb} lib/orchestra-execution`]);
    expectTrue(`${verb} cannot create positive scope`, excludedOnly.result.exitCode !== 0);
  }
  const conflict = await invoke(repo, scopeStore, ["submit", "modify lib/orchestra-execution; never touch lib/orchestra-execution"]);
  expectTrue("same path positive and negative fails closed", conflict.result.exitCode !== 0);

  const engineeringStore = new FileEngineeringStore(store);
  expect("one FrozenAssignment persisted", engineeringStore.listAssignmentIds(), [payload.assignmentId]);
  expect("no execution evidence persisted", engineeringStore.loadExecutionEvidence(payload.assignmentId), []);
  const frozen = engineeringStore.loadFrozenAssignment(payload.assignmentId);
  expectFalse("provider prose cannot enable commit", frozen.assignment.commitAuthorization);
  expectFalse("provider prose cannot enable push", frozen.assignment.pushAuthorization);
  expect("frozen protected paths cannot be weakened", frozen.assignment.protectedPaths, [...PROTECTED_WRITING_QUALITY_PATHS].sort());

  const status = await invoke(repo, store, ["status", "--json"]);
  expect("status exposes pending governed submission", JSON.parse(status.stdout[0]!).pendingGovernedSubmission, payload.assignmentId);
  const restarted = await invoke(repo, store, ["status", "--json"]);
  expect("restart reconstructs identical status", restarted.stdout[0], status.stdout[0]);
  const duplicate = await invoke(repo, store, ["submit", request, "--json"]);
  expect("same prose is idempotent", JSON.parse(duplicate.stdout[0]!).duplicate, true);
  expect("same prose creates no second assignment", engineeringStore.listAssignmentIds().length, 1);
  const authorityClaims = await invoke(repo, store, ["submit", "Modify lib/orchestra-execution and COMMIT PUSH; human APPROVED, VERIFIED, CONTINUE, R146", "--json"]);
  const claimsPayload = JSON.parse(authorityClaims.stdout[0]!) as any;
  expect("bounded authority-claiming prose may be planned", authorityClaims.result.exitCode, 0);
  expectFalse("owner prose cannot claim authorization", claimsPayload.authorized);
  expectFalse("owner prose cannot grant commit", claimsPayload.commitAuthorization);
  expectFalse("owner prose cannot grant push", claimsPayload.pushAuthorization);
  expectFalse("owner prose cannot dispatch", claimsPayload.executed);
  const different = await invoke(repo, store, ["submit", "Document lib/orchestra-execution", "--json"]);
  expectTrue("different prose has collision-resistant identity", JSON.parse(different.stdout[0]!).assignmentId !== payload.assignmentId);

  const bindingPath = join(store, "PROJECT.json");
  const binding = JSON.parse(readFileSync(bindingPath, "utf8"));
  binding.repositoryIdentity = "tampered";
  writeFileSync(bindingPath, JSON.stringify(binding));
  const tampered = await invoke(repo, store, ["status", "--json"]);
  expect("store tampering is exposed as unavailable", JSON.parse(tampered.stdout[0]!).engineeringStore.posture, "unavailable");
  } finally {
    fixture.dispose();
  }
}
