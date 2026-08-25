import { imp042Report, runImp042CodexQualification } from "./orch-imp-042-codex-qualification.test.js";
import { failed, reportAndExit } from "./harness.js";

async function main(): Promise<void> {
  await runImp042CodexQualification();
  console.log("\nIMP 042 qualification report:", JSON.stringify(imp042Report, null, 2));
  if (failed > 0) reportAndExit();
  reportAndExit();
}

await main();
