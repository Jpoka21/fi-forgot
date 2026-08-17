import { collectGitEvidence, parseStatusPorcelain } from "../git-evidence.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { expect, expectTrue, section } from "./harness.js";

export async function runGitEvidenceTests(): Promise<void> {
  section("Git evidence collector");
  const parsed = parseStatusPorcelain(" M allowed.txt\n?? surprise.txt\nM  staged.txt\n");
  expect("unstaged path", parsed.unstagedChangedPaths, ["allowed.txt"]);
  expect("untracked path", parsed.untrackedPaths, ["surprise.txt"]);
  expect("staged path", parsed.stagedPaths, ["staged.txt"]);

  const fixture = createDisposableExecutionFixture({ assignmentId: "git-evidence" });
  const evidence = await collectGitEvidence(fixture.repositoryPath);
  expect("toplevel captured", evidence.toplevel?.toLowerCase().includes("orchestra-exec-fixture"), true);
  expect("branch captured", evidence.branch, "fixture-main");
  expect("head captured", evidence.head, fixture.startingHead);
  expectTrue("subject captured", (evidence.subject ?? "").includes("fixture:"));
  expect("no staged changes at start", evidence.stagedPaths, []);
}
