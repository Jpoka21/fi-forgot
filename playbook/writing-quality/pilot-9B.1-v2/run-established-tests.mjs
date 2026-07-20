/**
 * Established Sprint 9B.1 / Framework V2 production-adjacent test command.
 * Runs the full expected writing-contract suite + harness self-checks.
 *
 * Usage:
 *   node playbook/writing-quality/pilot-9B.1-v2/run-established-tests.mjs
 *
 * Expected: 290 unit assertions + harness self-checks, all exit 0.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

const UNIT_TESTS = [
  "v2-generate-card-prompt-priority",
  "v2-generate-card-one-card",
  "v2-generate-card-primary-context",
  "v2-sprint-8g-support-retention",
  "v2-refine-card-grounding",
  "v2-generate-card-parse-diagnostics",
  "v2-generate-card-token-budget",
];

function run(label, command, args) {
  console.log(`\n======== ${label} ========`);
  const r = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  const m = String(r.stdout || "").match(/(\d+) passed, (\d+) failed/);
  return {
    label,
    exit: r.status ?? 1,
    passed: m ? Number(m[1]) : null,
    failed: m ? Number(m[2]) : null,
  };
}

const results = [];
for (const name of UNIT_TESTS) {
  results.push(
    run(
      name,
      "npx",
      ["-y", "tsx@4.19.4", `artifacts/api-server/src/__tests__/${name}.test.ts`],
    ),
  );
}

results.push(
  run("pilot-9B.1-panel-self-check", "node", [
    "playbook/writing-quality/pilot-9B.1/run-panel.mjs",
    "--self-check",
  ]),
);
results.push(
  run("pilot-9B.1-v2-self-check", "node", [
    "playbook/writing-quality/pilot-9B.1-v2/run-pilot.mjs",
    "--self-check",
  ]),
);

console.log("\n======== SUMMARY ========");
let unitPassed = 0;
let unitFailed = 0;
let hardFail = false;
for (const r of results) {
  const isUnit = UNIT_TESTS.includes(r.label);
  const passPart = r.passed != null ? `${r.passed} passed, ${r.failed} failed` : "(see log)";
  console.log(`${r.exit === 0 ? "OK" : "FAIL"} ${r.label}: ${passPart} (exit ${r.exit})`);
  if (isUnit && r.passed != null) {
    unitPassed += r.passed;
    unitFailed += r.failed || 0;
  }
  if (r.exit !== 0) hardFail = true;
}

console.log(`\nUnit assertion total: ${unitPassed} passed, ${unitFailed} failed`);
console.log(`Expected unit total: 290 passed, 0 failed`);
if (unitPassed !== 290 || unitFailed !== 0) {
  console.log("WARNING: unit total differs from established 290.");
  hardFail = true;
}

process.exit(hardFail ? 1 : 0);
