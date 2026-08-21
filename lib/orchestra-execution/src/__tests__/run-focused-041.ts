import { runGovernedContinuationTargetTests } from "./governed-continuation-target.test.js";
import { runGovernedContinuationSequenceTests } from "./governed-continuation-sequence.test.js";
import { runPostDecisionExecutionTests } from "./post-decision-execution.test.js";
import { failed, reportAndExit } from "./harness.js";

async function main(): Promise<void> {
  await runPostDecisionExecutionTests();
  await runGovernedContinuationTargetTests();
  await runGovernedContinuationSequenceTests();
  if (failed > 0) reportAndExit();
  reportAndExit();
}

await main();
