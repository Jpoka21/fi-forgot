import { runCodexProviderTests } from "./codex-provider.test.js";
import { reportAndExit } from "./harness.js";

await runCodexProviderTests();
reportAndExit();
