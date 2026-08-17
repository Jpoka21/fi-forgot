import { runAssignmentTests } from "./assignment.test.js";
import { runProviderContractTests } from "./provider-contract.test.js";
import { runEventNormalizationTests } from "./events.test.js";
import { runGitEvidenceTests } from "./git-evidence.test.js";
import { runPathNormalizationTests } from "./path-normalize.test.js";
import { runHookDecisionTests, runHookParserTests } from "./hook-policy.test.js";
import { runResultTests } from "./result.test.js";
import { runAdapterNegativeTests, runFixtureIntegrationTests } from "./fixture-integration.test.js";
import { liveCursorReport, runLiveCursorIntegrationTest } from "./live-cursor.integration.test.js";
import { failed, reportAndExit } from "./harness.js";

async function main(): Promise<void> {
  runAssignmentTests();
  await runProviderContractTests();
  runEventNormalizationTests();
  await runGitEvidenceTests();
  runPathNormalizationTests();
  runHookDecisionTests();
  runHookParserTests();
  runResultTests();
  await runFixtureIntegrationTests();
  await runAdapterNegativeTests();
  await runLiveCursorIntegrationTest();
  console.log("\nLive Cursor report:", JSON.stringify(liveCursorReport, null, 2));
  if (failed > 0) reportAndExit();
  reportAndExit();
}

await main();
