import { isAbsolute, join, resolve } from "node:path";
import {
  FileControlJournal,
  GITHUB_CONTROL_REPOSITORY,
  GitHubContentsControlTransport,
  GitHubControlWatcher,
  type GitHubControlResult,
} from "./github-control-watcher.js";

export const GITHUB_CONTROL_DEFAULT_POLL_INTERVAL_MS = 30_000;
export const GITHUB_CONTROL_JOURNAL_NAME = "github-control-watcher.ndjson";

export interface GitHubControlServiceConfig {
  repository: string;
  storeRoot: string;
  token: string;
  pollIntervalMs: number;
}

function required(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name.toLowerCase()}_required`);
  return value;
}

export function loadGitHubControlServiceConfig(environment: NodeJS.ProcessEnv = process.env): GitHubControlServiceConfig {
  const repository = required(environment, "ORCHESTRA_REPOSITORY_PATH");
  const storeRoot = required(environment, "ORCHESTRA_ENGINEERING_STORE");
  if (!isAbsolute(repository)) throw new Error("orchestra_repository_path_must_be_absolute");
  if (!isAbsolute(storeRoot)) throw new Error("orchestra_engineering_store_must_be_absolute");
  const intervalText = environment.GITHUB_CONTROL_POLL_INTERVAL_MS?.trim();
  const pollIntervalMs = intervalText === undefined || intervalText === "" ? GITHUB_CONTROL_DEFAULT_POLL_INTERVAL_MS : Number(intervalText);
  if (!Number.isSafeInteger(pollIntervalMs) || pollIntervalMs < 1_000) throw new Error("github_control_poll_interval_invalid");
  return { repository: resolve(repository), storeRoot: resolve(storeRoot), token: required(environment, "GITHUB_TOKEN"), pollIntervalMs };
}

export function createProductionGitHubControlWatcher(config: GitHubControlServiceConfig): GitHubControlWatcher {
  return new GitHubControlWatcher({
    repository: config.repository,
    storeRoot: config.storeRoot,
    transport: new GitHubContentsControlTransport(config.token, GITHUB_CONTROL_REPOSITORY),
    journal: new FileControlJournal(join(config.storeRoot, GITHUB_CONTROL_JOURNAL_NAME)),
  });
}

function waitForNextPoll(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolveWait) => {
    const timer = setTimeout(finish, milliseconds);
    function finish(): void { clearTimeout(timer); signal?.removeEventListener("abort", finish); resolveWait(); }
    signal?.addEventListener("abort", finish, { once: true });
  });
}

/** Poll until stopped. Errors reject so the process fails closed and a supervisor may restart it. */
export async function runGitHubControlService(input: {
  watcher: Pick<GitHubControlWatcher, "pollOnce">;
  pollIntervalMs: number;
  signal?: AbortSignal;
  onPoll?: (results: GitHubControlResult[]) => void;
}): Promise<void> {
  if (!Number.isSafeInteger(input.pollIntervalMs) || input.pollIntervalMs < 1_000) throw new Error("github_control_poll_interval_invalid");
  while (!input.signal?.aborted) {
    const results = await input.watcher.pollOnce();
    input.onPoll?.(results);
    await waitForNextPoll(input.pollIntervalMs, input.signal);
  }
}
