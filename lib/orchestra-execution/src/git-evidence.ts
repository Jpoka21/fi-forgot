import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitCommitIdentity {
  hash: string;
  subject: string;
  authorName: string | null;
  authorEmail: string | null;
}

export interface GitEvidence {
  capturedAt: string;
  toplevel: string | null;
  branch: string | null;
  head: string | null;
  subject: string | null;
  ahead: number | null;
  behind: number | null;
  statusShort: string;
  stagedPaths: string[];
  unstagedChangedPaths: string[];
  untrackedPaths: string[];
  /** Content/index state for paths dirty at capture time, keyed by repository-relative path. */
  dirtyPathStateDigests?: Record<string, string>;
  commitIdentity: GitCommitIdentity | null;
}

async function git(repoPath: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const result = await execFileAsync("git", ["-C", repoPath, ...args], {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { stdout: result.stdout, stderr: result.stderr, code: 0 };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      code: typeof err.code === "number" ? err.code : 1,
    };
  }
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
}

function parsePorcelainPath(rest: string): string {
  const trimmed = rest.trim();
  if (trimmed.includes(" -> ")) {
    return trimmed.split(" -> ").pop() ?? trimmed;
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  return trimmed;
}

export function parseStatusPorcelain(statusShort: string): {
  stagedPaths: string[];
  unstagedChangedPaths: string[];
  untrackedPaths: string[];
} {
  const staged = new Set<string>();
  const unstaged = new Set<string>();
  const untracked = new Set<string>();
  for (const line of splitLines(statusShort)) {
    if (line.length < 3) continue;
    const x = line[0];
    const y = line[1];
    const path = parsePorcelainPath(line.slice(3));
    if (x === "?" && y === "?") {
      untracked.add(path);
      continue;
    }
    if (x !== " " && x !== "?") staged.add(path);
    if (y !== " " && y !== "?") unstaged.add(path);
  }
  return {
    stagedPaths: [...staged],
    unstagedChangedPaths: [...unstaged],
    untrackedPaths: [...untracked],
  };
}

export async function collectGitEvidence(repositoryPath: string): Promise<GitEvidence> {
  const capturedAt = new Date().toISOString();
  const toplevel = await git(repositoryPath, ["rev-parse", "--show-toplevel"]);
  const branch = await git(repositoryPath, ["branch", "--show-current"]);
  const head = await git(repositoryPath, ["rev-parse", "HEAD"]);
  const subject = await git(repositoryPath, ["log", "-1", "--format=%s"]);
  const status = await git(repositoryPath, ["status", "--porcelain"]);
  const identity = await git(repositoryPath, ["log", "-1", "--format=%H%n%s%n%an%n%ae"]);
  const aheadBehind = await git(repositoryPath, ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]);

  let ahead: number | null = null;
  let behind: number | null = null;
  if (aheadBehind.code === 0) {
    const parts = aheadBehind.stdout.trim().split(/\s+/);
    if (parts.length >= 2) {
      behind = Number.parseInt(parts[0] ?? "", 10);
      ahead = Number.parseInt(parts[1] ?? "", 10);
      if (Number.isNaN(ahead)) ahead = null;
      if (Number.isNaN(behind)) behind = null;
    }
  }

  const parsed = parseStatusPorcelain(status.stdout);
  const dirtyPaths = [
    ...new Set([...parsed.stagedPaths, ...parsed.unstagedChangedPaths, ...parsed.untrackedPaths]),
  ];
  const dirtyPathStateDigests: Record<string, string> = {};
  await Promise.all(
    dirtyPaths.map(async (path) => {
      const staged = await git(repositoryPath, ["diff", "--cached", "--binary", "HEAD", "--", path]);
      const unstaged = await git(repositoryPath, ["diff", "--binary", "--", path]);
      const untracked = parsed.untrackedPaths.includes(path)
        ? await git(repositoryPath, ["hash-object", "--no-filters", "--", path])
        : { stdout: "", stderr: "", code: 0 };
      dirtyPathStateDigests[path] = createHash("sha256")
        .update(
          `${staged.code}\0${staged.stdout}\0${unstaged.code}\0${unstaged.stdout}\0${untracked.code}\0${untracked.stdout}`,
        )
        .digest("hex");
    }),
  );
  const identityLines = splitLines(identity.stdout);
  const commitIdentity: GitCommitIdentity | null =
    identity.code === 0 && identityLines[0]
      ? {
          hash: identityLines[0],
          subject: identityLines[1] ?? "",
          authorName: identityLines[2] ?? null,
          authorEmail: identityLines[3] ?? null,
        }
      : null;

  return {
    capturedAt,
    toplevel: toplevel.code === 0 ? toplevel.stdout.trim() : null,
    branch: branch.code === 0 ? branch.stdout.trim() || null : null,
    head: head.code === 0 ? head.stdout.trim().toLowerCase() : null,
    subject: subject.code === 0 ? subject.stdout.trim() : null,
    ahead,
    behind,
    statusShort: status.stdout,
    stagedPaths: parsed.stagedPaths,
    unstagedChangedPaths: parsed.unstagedChangedPaths,
    untrackedPaths: parsed.untrackedPaths,
    dirtyPathStateDigests,
    commitIdentity,
  };
}

export interface GitEvidenceDelta {
  branchChanged: boolean;
  headChanged: boolean;
  commitOccurred: boolean;
  stagedAfter: string[];
  unstagedAfter: string[];
  untrackedAfter: string[];
  changedPaths: string[];
  /** Paths whose actual index/worktree state differs between the two captures. */
  mutatedPaths: string[];
  unexpectedUntrackedPaths: string[];
}

export function diffGitEvidence(pre: GitEvidence, post: GitEvidence): GitEvidenceDelta {
  const changed = new Set<string>([
    ...post.unstagedChangedPaths,
    ...post.stagedPaths,
    ...post.untrackedPaths,
  ]);
  const observed = new Set<string>([
    ...Object.keys(pre.dirtyPathStateDigests ?? {}),
    ...Object.keys(post.dirtyPathStateDigests ?? {}),
  ]);
  const mutatedPaths = [...observed].filter(
    (path) => pre.dirtyPathStateDigests?.[path] !== post.dirtyPathStateDigests?.[path],
  );
  return {
    branchChanged: pre.branch !== post.branch,
    headChanged: pre.head !== post.head,
    commitOccurred: Boolean(pre.head && post.head && pre.head !== post.head),
    stagedAfter: post.stagedPaths,
    unstagedAfter: post.unstagedChangedPaths,
    untrackedAfter: post.untrackedPaths,
    changedPaths: [...changed],
    mutatedPaths,
    unexpectedUntrackedPaths: post.untrackedPaths.filter((path) => !pre.untrackedPaths.includes(path)),
  };
}
