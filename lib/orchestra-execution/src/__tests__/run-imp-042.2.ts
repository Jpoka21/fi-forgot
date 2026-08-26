import { imp0422Report, runImp0422CodexPromotion } from "./orch-imp-042.2-codex-promotion.test.js";
import { failed, reportAndExit } from "./harness.js";

async function main(): Promise<void> {
  await runImp0422CodexPromotion();
  console.log("\nIMP 042.2 promotion report:", JSON.stringify(imp0422Report, null, 2));
  if (failed > 0) reportAndExit();
  reportAndExit();
}

await main();
