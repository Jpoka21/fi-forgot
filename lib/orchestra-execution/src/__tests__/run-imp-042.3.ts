import { runGovernedExecutorTrustBoundaryTests } from "./governed-executor-trust-boundary.test.js";
import { runPostDecisionExecutionTests } from "./post-decision-execution.test.js";
import { failed, reportAndExit } from "./harness.js";

async function main(): Promise<void> {
  await runGovernedExecutorTrustBoundaryTests();
  await runPostDecisionExecutionTests();
  if (failed > 0) reportAndExit();
  reportAndExit();
}

await main();
