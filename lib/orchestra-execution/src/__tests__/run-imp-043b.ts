import { failed, reportAndExit } from "./harness.js";
import { runOwnerCliTests } from "./owner-cli.test.js";

await runOwnerCliTests();
if (failed > 0) reportAndExit();
reportAndExit();
