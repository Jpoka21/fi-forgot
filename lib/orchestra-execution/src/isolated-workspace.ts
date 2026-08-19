import { execFileSync, spawnSync } from "node:child_process";
import { lstatSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { OrchestraAssignment } from "./assignment.js";
import type { GitEvidence } from "./git-evidence.js";
import { normalizePathKey } from "./hooks/path-normalize.js";

export interface CandidateChangeSet {
  paths: string[];
  statuses: string[];
  authorizedPaths: string[];
  unauthorizedPaths: string[];
  protectedPaths: string[];
  patch: Buffer;
}

export interface IsolatedExecutionWorkspace {
  path: string;
  startingHead: string;
}

function git(repo: string, args: string[], input?: Buffer): Buffer {
  const result = spawnSync("git", ["-C", repo, "-c", "commit.gpgsign=false", ...args], {
    input,
    windowsHide: true,
    maxBuffer: 100 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`isolated Git operation failed: ${String(result.stderr || result.error || "unknown error")}`);
  }
  return result.stdout;
}

export function createIsolatedExecutionWorkspace(
  governedRepository: string,
  startingHead: string,
): IsolatedExecutionWorkspace {
  const path = mkdtempSync(join(tmpdir(), "orchestra-codex-isolated-"));
  try {
    execFileSync("git", ["clone", "--no-hardlinks", "--no-checkout", "--quiet", governedRepository, path], {
      windowsHide: true,
    });
    git(path, ["checkout", "--detach", "--quiet", startingHead]);
    git(path, ["remote", "remove", "origin"]);
    const actual = git(path, ["rev-parse", "HEAD"]).toString("utf8").trim().toLowerCase();
    if (actual !== startingHead.toLowerCase()) throw new Error("isolated workspace HEAD mismatch");
    const unsupportedEntries = git(path, ["ls-files", "-s"])
      .toString("utf8")
      .split(/\r?\n/)
      .filter((line) => line.startsWith("120000 ") || line.startsWith("160000 "));
    if (unsupportedEntries.length > 0) {
      throw new Error("isolated workspace refuses tracked symlinks and submodules");
    }
    return { path, startingHead: actual };
  } catch (error) {
    rmSync(path, { recursive: true, force: true });
    throw error;
  }
}

function normalized(path: string): string {
  return normalizePathKey(path).replace(/^\.\//, "");
}

function contained(scope: string, candidate: string): boolean {
  return candidate === scope || candidate.startsWith(`${scope}/`);
}

function parseNameStatusZ(buffer: Buffer): Array<{ status: string; path: string }> {
  const tokens = buffer.toString("utf8").split("\0").filter(Boolean);
  const rows: Array<{ status: string; path: string }> = [];
  for (let index = 0; index < tokens.length;) {
    const token = tokens[index++]!;
    const tab = token.indexOf("\t");
    if (tab >= 0) rows.push({ status: token.slice(0, tab), path: token.slice(tab + 1) });
    else {
      const path = tokens[index++];
      if (!path) throw new Error("malformed isolated candidate name-status evidence");
      rows.push({ status: token, path });
    }
  }
  return rows;
}

function isUnsupportedCandidate(workspace: string, path: string, status: string): boolean {
  if (status.startsWith("D")) return false;
  try {
    const stat = lstatSync(join(workspace, path));
    return stat.isSymbolicLink() || !stat.isFile();
  } catch {
    return true;
  }
}

export function extractCandidateChanges(
  workspace: IsolatedExecutionWorkspace,
  assignment: OrchestraAssignment,
): CandidateChangeSet {
  git(workspace.path, ["add", "-A"]);
  const rows = parseNameStatusZ(
    git(workspace.path, ["diff", "--cached", "--name-status", "-z", "--no-renames", workspace.startingHead, "--"]),
  );
  const allowed = assignment.allowedPaths.map(normalized);
  const protectedScopes = assignment.protectedPaths.map(normalized);
  const paths = [...new Set(rows.map((row) => normalized(row.path)))].sort();
  const protectedPaths = paths.filter((path) => protectedScopes.some((scope) => contained(scope, path)));
  const unsupported = rows.filter((row) => isUnsupportedCandidate(workspace.path, row.path, row.status)).map((row) => normalized(row.path));
  const unauthorizedPaths = paths.filter(
    (path) =>
      protectedPaths.includes(path) ||
      unsupported.includes(path) ||
      !allowed.some((scope) => contained(scope, path)),
  );
  const authorizedPaths = paths.filter((path) => !unauthorizedPaths.includes(path));
  const patch = git(workspace.path, ["diff", "--cached", "--binary", "--full-index", "--no-renames", workspace.startingHead, "--"]);
  return {
    paths,
    statuses: rows.map((row) => `${row.status}:${normalized(row.path)}`),
    authorizedPaths,
    unauthorizedPaths,
    protectedPaths,
    patch,
  };
}

export function governedStateUnchanged(expected: GitEvidence, current: GitEvidence): boolean {
  return (
    expected.branch === current.branch &&
    expected.head === current.head &&
    expected.statusShort === current.statusShort
  );
}

export function applyCandidatePatch(governedRepository: string, candidate: CandidateChangeSet): void {
  if (candidate.unauthorizedPaths.length > 0 || candidate.protectedPaths.length > 0) {
    throw new Error("refusing atomic candidate application with unauthorized or protected paths");
  }
  if (candidate.patch.length === 0) return;
  const validated = [...new Set(candidate.authorizedPaths.map(normalized))].sort();
  const declared = [...new Set(candidate.paths.map(normalized))].sort();
  if (validated.length !== declared.length || validated.some((path, index) => path !== declared[index])) {
    throw new Error("candidate authorized paths do not exactly match declared candidate paths");
  }
  const numstat = git(
    governedRepository,
    ["apply", "--numstat", "-z", "-"],
    candidate.patch,
  ).toString("utf8");
  const patchPaths = numstat
    .split("\0")
    .filter(Boolean)
    .map((row) => {
      const first = row.indexOf("\t");
      const second = first < 0 ? -1 : row.indexOf("\t", first + 1);
      if (second < 0) throw new Error("malformed candidate patch path evidence");
      return normalized(row.slice(second + 1));
    })
    .sort();
  if (patchPaths.length !== validated.length || patchPaths.some((path, index) => path !== validated[index])) {
    throw new Error("candidate patch paths do not exactly match validated authorized paths");
  }
  git(governedRepository, ["apply", "--binary", "--whitespace=nowarn", "-"], candidate.patch);
}

export function cleanupIsolatedExecutionWorkspace(workspace: IsolatedExecutionWorkspace): boolean {
  try {
    rmSync(workspace.path, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export function cleanupIsolatedWorkspacePath(path: string): boolean {
  return cleanupIsolatedExecutionWorkspace({ path, startingHead: "" });
}
