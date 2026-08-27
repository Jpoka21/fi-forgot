import { failed, reportAndExit } from "./harness.js";
import { runOwnerSubmitTests } from "./owner-submit.test.js";

await runOwnerSubmitTests();
if (failed > 0) reportAndExit();
reportAndExit();
