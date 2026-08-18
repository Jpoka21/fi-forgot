import { runCodexAppServerTransportTests } from "./codex-app-server-transport.test.js";
import { reportAndExit } from "./harness.js";

await runCodexAppServerTransportTests();
reportAndExit();
