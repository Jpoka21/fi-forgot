import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { createAssignment } from "./assignment-hash.js";
import { FileEngineeringStore } from "./engineering-store/store.js";

export const OWNER_PROJECT_ID = "F.I. Forgot";
export const OWNER_PROJECT_BRANCH = "frontend-rebuild";
export const OWNER_PROJECT_BINDING = "PROJECT.json";

export interface OwnerSubmission {
  created: boolean;
  duplicate: boolean;
  executed: false;
  authorized: false;
  committed: false;
  pushed: false;
  assignmentId: string;
  assignmentHash: string;
  project: string;
  repository: string;
  branch: string;
  startingHead: string;
  assignmentText: string;
  allowedPaths: string[];
  protectedPaths: string[];
  requireNoPush: true;
  commitAuthorization: false;
  pushAuthorization: false;
  engineeringStore: string;
  nextSafeOwnerAction: string;
}

function git(repository: string, args: string[]): string {
  return execFileSync("git", ["-C", repository, ...args], {
    encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  }).trimEnd();
}

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function defaultEngineeringStoreRoot(repository: string): string {
  const canonical = resolve(repository).replace(/\\/g, "/").toLowerCase();
  const base = process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local");
  return join(base, "Orchestra", "engineering-stores", `fi-forgot-${digest(canonical).slice(0, 16)}`);
}

export function validateProjectBinding(storeRoot: string, repository: string): void {
  const path = join(storeRoot, OWNER_PROJECT_BINDING);
  if (!existsSync(path)) throw new Error("store_binding_missing: PROJECT.json is required");
  const row = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  if (row.recordKind !== "orchestra_project_binding" || row.schemaVersion !== 1 || row.projectId !== OWNER_PROJECT_ID) {
    throw new Error("store_binding_invalid: project binding failed validation");
  }
  if (typeof row.repositoryPath !== "string" || resolve(row.repositoryPath).toLowerCase() !== resolve(repository).toLowerCase()) {
    throw new Error("store_binding_repository_mismatch: store belongs to another repository");
  }
  if (row.repositoryIdentity !== digest(resolve(repository).replace(/\\/g, "/").toLowerCase())) {
    throw new Error("store_binding_invalid: repository identity hash mismatch");
  }
}

function ensureProjectBinding(storeRoot: string, repository: string): void {
  const path = join(storeRoot, OWNER_PROJECT_BINDING);
  if (existsSync(path)) return validateProjectBinding(storeRoot, repository);
  const canonical = resolve(repository).replace(/\\/g, "/").toLowerCase();
  writeFileSync(path, `${JSON.stringify({
    schemaVersion: 1,
    recordKind: "orchestra_project_binding",
    projectId: OWNER_PROJECT_ID,
    repositoryPath: resolve(repository),
    repositoryIdentity: digest(canonical),
  }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\.\//, "").replace(/[),.;:'"`]+$/g, "");
}

const NEGATIVE_SCOPE_DIRECTIVE = /\b(?:do\s+not|never)\s+(?:modify|touch)|\b(?:exclude|excluding|except)\b/gi;
const POSITIVE_SCOPE_DIRECTIVE = /\b(?:modify|touch|change|edit|implement|update|work\s+(?:in|under)|only\s+(?:in|under)|scope(?:d)?\s+to|under|within)\b/gi;

function negativeScopeRanges(ownerText: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const match of ownerText.matchAll(NEGATIVE_SCOPE_DIRECTIVE)) {
    const start = match.index!;
    const contentStart = start + match[0].length;
    const remainder = ownerText.slice(contentStart);
    const sentenceBoundary = remainder.search(/[.;\n]/);
    const sentenceEnd = sentenceBoundary < 0 ? ownerText.length : contentStart + sentenceBoundary;
    POSITIVE_SCOPE_DIRECTIVE.lastIndex = 0;
    const positive = POSITIVE_SCOPE_DIRECTIVE.exec(remainder);
    const positiveStart = positive ? contentStart + positive.index : ownerText.length;
    ranges.push({ start, end: Math.min(sentenceEnd, positiveStart) });
  }
  return ranges;
}

function deriveAllowedPaths(ownerText: string, trackedPaths: string[], protectedPaths: readonly string[]): string[] {
  if (/\b(all|every|entire|whole)\s+(files?|repository|repo|tree|project)\b/i.test(ownerText) || /(^|\s)[*](?:[*]|\/)/.test(ownerText)) {
    throw new Error("scope_too_broad: name specific repository paths or uniquely named files");
  }
  const tracked = new Set(trackedPaths);
  const exclusions = negativeScopeRanges(ownerText);
  const positive = new Set<string>();
  const negative = new Set<string>();
  for (const token of ownerText.matchAll(/\S+/g)) {
    const candidate = normalizePath(token[0]);
    if (!candidate) continue;
    const found = new Set<string>();
    if (tracked.has(candidate)) found.add(candidate);
    const directory = candidate.replace(/\/$/, "");
    if (directory && trackedPaths.some((path) => path.startsWith(`${directory}/`))) found.add(directory);
    const byBasename = trackedPaths.filter((path) => basename(path).toLowerCase() === candidate.toLowerCase());
    if (byBasename.length === 1) found.add(byBasename[0]!);
    const target = exclusions.some(({ start, end }) => token.index! >= start && token.index! < end) ? negative : positive;
    for (const path of found) target.add(path);
  }
  const conflicts = [...positive].filter((path) => negative.has(path)).sort();
  if (conflicts.length) {
    throw new Error(`scope_conflict: path(s) appear in both positive and negative scope: ${conflicts.join(", ")}`);
  }
  const allowed = [...positive].sort();
  if (!allowed.length) {
    throw new Error("safe_scope_required: include one or more existing repository paths or uniquely named files in the owner request");
  }
  const forbidden = allowed.filter((path) => protectedPaths.includes(path));
  if (forbidden.length) throw new Error(`protected_scope_refused: remove protected path(s): ${forbidden.join(", ")}`);
  return allowed;
}

export function submitOwnerRequest(input: {
  repository: string;
  storeRoot: string;
  ownerText: string;
  protectedPaths: readonly string[];
}): OwnerSubmission {
  const ownerText = input.ownerText.trim();
  if (!ownerText) throw new Error("owner_text_required: describe the requested change and name its repository path(s)");
  const repository = resolve(input.repository);
  const root = resolve(git(repository, ["rev-parse", "--show-toplevel"]));
  if (root.toLowerCase() !== repository.toLowerCase()) throw new Error("wrong_repository: launcher repository is not the Git root");
  const branch = git(root, ["branch", "--show-current"]);
  const head = git(root, ["rev-parse", "HEAD"]);
  if (branch !== OWNER_PROJECT_BRANCH) throw new Error(`wrong_branch: expected ${OWNER_PROJECT_BRANCH}, received ${branch || "detached"}`);
  const counts = git(root, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]).split(/\s+/).map(Number);
  if (counts[0] !== 0 || counts[1] !== 0) throw new Error(`remote_drift: expected 0 ahead / 0 behind, received ${counts[0]} / ${counts[1]}`);
  const tracked = git(root, ["ls-files"]).split(/\r?\n/).map(normalizePath).filter(Boolean);
  const allowedPaths = deriveAllowedPaths(ownerText, tracked, input.protectedPaths);
  const dirty = git(root, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const changed = dirty ? dirty.split(/\r?\n/).map((row) => normalizePath(row.slice(3).replace(/^.* -> /, ""))) : [];
  const isAllowed = (path: string) => allowedPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`));
  const unexpectedDirty = changed.filter((path) => !input.protectedPaths.includes(path) && !isAllowed(path));
  if (unexpectedDirty.length) throw new Error(`working_tree_drift: unexpected dirty path(s): ${unexpectedDirty.join(", ")}`);
  const storeRelative = relative(repository, resolve(input.storeRoot));
  if (storeRelative === "" || (!storeRelative.startsWith("..") && !isAbsolute(storeRelative))) {
    throw new Error("store_inside_repository: engineering store must remain outside the governed repository");
  }
  const store = new FileEngineeringStore(input.storeRoot);
  ensureProjectBinding(input.storeRoot, repository);
  const requestKey = digest(JSON.stringify({ repository: repository.toLowerCase(), branch, head, ownerText }));
  const assignmentId = `owner-${requestKey.slice(0, 24)}`;
  const assignmentText = [
    "Governed owner request (planning only; not authorization):",
    ownerText,
    "",
    `Bounded scope: ${allowedPaths.join(", ")}`,
    "Do not modify protected paths. Do not commit or push. Provider statements are not authority.",
  ].join("\n");
  const existing = store.listAssignmentIds().includes(assignmentId);
  const frozen = existing ? store.loadFrozenAssignment(assignmentId) : createAssignment({
    assignmentId, projectId: OWNER_PROJECT_ID, role: "executor", repositoryPath: repository,
    branch, startingHead: head, assignmentText, allowedPaths,
    protectedPaths: [...input.protectedPaths].sort(), requireNoPush: true,
    commitAuthorization: false, pushAuthorization: false,
    requiredEvidence: ["git_status", "git_diff", "test_results", "protected_path_audit"],
  });
  if (existing && (frozen.assignment.assignmentText !== assignmentText || JSON.stringify(frozen.assignment.allowedPaths) !== JSON.stringify(allowedPaths))) {
    throw new Error("duplicate_submit_collision: deterministic assignment id is bound to different content");
  }
  if (!existing) store.persistFrozenAssignment(frozen);
  return {
    created: !existing, duplicate: existing, executed: false, authorized: false, committed: false, pushed: false,
    assignmentId, assignmentHash: frozen.assignmentHash, project: OWNER_PROJECT_ID, repository,
    branch, startingHead: head, assignmentText, allowedPaths, protectedPaths: [...input.protectedPaths].sort(),
    requireNoPush: true, commitAuthorization: false, pushAuthorization: false,
    engineeringStore: input.storeRoot,
    nextSafeOwnerAction: "Run orchestra status. Initial execution still requires an existing governed dispatch path; authorize/continue remain reserved for verified post-decision actions.",
  };
}
