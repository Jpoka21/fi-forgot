import { runLiveCursorIntegrationTest } from "./live-cursor.integration.test.js";
import { reportAndExit } from "./harness.js";

await runLiveCursorIntegrationTest();
reportAndExit();
