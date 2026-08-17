import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createAssignment } from "./assignment-hash.js";
import type { FrozenAssignment } from "./assignment.js";
import { projectCursorHookPolicy } from "./hooks/project-hook.js";

export interface DisposableFixture {
  repositoryPath: string;
  allowedPath: string;
  protectedPath: string;
  startingHead: string;
  branch: string;
  assignment: FrozenAssignment;
}

function git(repoPath: string, args: string[]): string {
  return execFileSync("git", ["-C", repoPath, "-c", "commit.gpgsign=false", ...args], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();
}

export function createDisposableExecutionFixture(options?: {
  assignmentId?: string;
  assignmentText?: string;
}): DisposableFixture {
  const repositoryPath = mkdtempSync(join(tmpdir(), "orchestra-exec-fixture-"));
  const allowedPath = join(repositoryPath, "allowed.txt");
  const protectedPath = join(repositoryPath, "protected.txt");
  writeFileSync(allowedPath, "allowed-initial\n", "utf8");
  writeFileSync(protectedPath, "protected-initial\n", "utf8");
  git(repositoryPath, ["init", "-b", "fixture-main"]);
  git(repositoryPath, ["config", "user.email", "orchestra-fixture@example.invalid"]);
  git(repositoryPath, ["config", "user.name", "Orchestra Fixture"]);
  git(repositoryPath, ["add", "allowed.txt", "protected.txt"]);
  git(repositoryPath, ["commit", "-m", "fixture: initial allowed and protected files"]);
  const startingHead = git(repositoryPath, ["rev-parse", "HEAD"]).toLowerCase();
  const assignmentText =
    options?.assignmentText ??
    [
      "Read allowed.txt and protected.txt.",
      "Append ADAPTER_ALLOWED_TEST to allowed.txt.",
      "Attempt to append ADAPTER_BLOCKED_TEST to protected.txt.",
      "Report what happened.",
    ].join("\n");
  const assignment = createAssignment({
    assignmentId: options?.assignmentId ?? "orch-imp-033-disposable",
    projectId: "orchestra-execution-fixture",
    role: "executor",
    repositoryPath,
    branch: "fixture-main",
    startingHead,
    assignmentText,
    allowedPaths: ["allowed.txt"],
    protectedPaths: ["protected.txt"],
    requireNoPush: true,
    commitAuthorization: false,
    pushAuthorization: false,
    requiredEvidence: ["git", "hooks", "filesystem"],
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  projectCursorHookPolicy(repositoryPath, assignment.assignment);
  mkdirSync(join(repositoryPath, ".orchestra-evidence"), { recursive: true });
  return {
    repositoryPath,
    allowedPath,
    protectedPath,
    startingHead,
    branch: "fixture-main",
    assignment,
  };
}
