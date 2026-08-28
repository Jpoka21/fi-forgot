import { createProductionGitHubControlWatcher, loadGitHubControlServiceConfig, runGitHubControlService } from "./github-control-service.js";

const shutdown = new AbortController();
process.once("SIGINT", () => shutdown.abort());
process.once("SIGTERM", () => shutdown.abort());

try {
  const config = loadGitHubControlServiceConfig();
  const watcher = createProductionGitHubControlWatcher(config);
  process.stdout.write(`GitHub control watcher started for Jpoka21/fi-forgot-control (poll ${config.pollIntervalMs}ms).\n`);
  await runGitHubControlService({
    watcher,
    pollIntervalMs: config.pollIntervalMs,
    signal: shutdown.signal,
    onPoll: (results) => { if (results.length) process.stdout.write(`GitHub control watcher processed ${results.length} request(s).\n`); },
  });
} catch (error) {
  process.stderr.write(`GitHub control watcher stopped: ${error instanceof Error ? error.message : "unknown_error"}\n`);
  process.exitCode = 1;
}
