import { failed, reportAndExit } from "./harness.js";
import { runInitialDispatchTests } from "./initial-dispatch.test.js";

await runInitialDispatchTests();
if (failed > 0) reportAndExit();
reportAndExit();
