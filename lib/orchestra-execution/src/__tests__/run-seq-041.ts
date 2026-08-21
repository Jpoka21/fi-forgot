import { runGovernedContinuationSequenceTests } from "./governed-continuation-sequence.test.js";
import { failed, reportAndExit } from "./harness.js";

async function main(): Promise<void> {
  await runGovernedContinuationSequenceTests();
  if (failed > 0) reportAndExit();
  reportAndExit();
}

await main();
