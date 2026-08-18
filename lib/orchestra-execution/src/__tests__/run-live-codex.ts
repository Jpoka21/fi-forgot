import { liveCodexReport, runLiveCodexIntegrationTest } from "./live-codex.integration.test.js";
import { reportAndExit } from "./harness.js";

await runLiveCodexIntegrationTest();
console.log("\nLive Codex report:", JSON.stringify(liveCodexReport, null, 2));
reportAndExit();
