/**
 * Disposable Sprint 9B.1A four-scenario verification runner.
 * Reuses pilot-9B.1 postOnce / parse logic via CLI flags. Writes only here.
 *
 * Usage (Replit, after api-server is running with 9B.1A closing guidance):
 *   $env:PILOT_BASE_URL = "http://127.0.0.1:PORT"   # optional
 *   node playbook/writing-quality/pilot-9B.1A/run-panel.mjs
 *   node playbook/writing-quality/pilot-9B.1A/run-panel.mjs --self-check
 *
 * Panel: G16, G19 (targets) + G04, G17 (protect)
 * Semantics: one request each, first card only, zero retries, no Rewrite/New Version.
 * Does not overwrite playbook/writing-quality/pilot-9B.1/ corpus outputs.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePanelCliArgs } from "../pilot-9B.1/run-panel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const parentRunner = path.join(__dirname, "../pilot-9B.1/run-panel.mjs");
const goldenPath = path.join(root, "playbook", "writing-quality", "GOLDEN_SCENARIO_SET_V1.json");
const priorNineB1Corpus = path.join(__dirname, "../pilot-9B.1/CORPUS.json");

const PANEL_IDS = ["G16", "G19", "G04", "G17"];
const TARGET_IDS = ["G16", "G19"];
const PROTECT_IDS = ["G04", "G17"];

function runSelfCheck() {
  let passed = 0;
  let failed = 0;
  const expect = (name, ok) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if (ok) passed++;
    else failed++;
  };

  expect("out dir is pilot-9B.1A", path.basename(__dirname) === "pilot-9B.1A");
  expect("panel ids fixed length 4", PANEL_IDS.length === 4);
  expect("targets G16 G19", TARGET_IDS.join(",") === "G16,G19");
  expect("protect G04 G17", PROTECT_IDS.join(",") === "G04,G17");

  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  for (const id of PANEL_IDS) {
    const s = golden.scenarios.find((x) => x.id === id);
    expect(`golden has ${id}`, Boolean(s?.request));
  }

  const cli = parsePanelCliArgs([
    `--ids=${PANEL_IDS.join(",")}`,
    `--out-dir=${__dirname}`,
    "--corpus-prefix=pilot-9B.1A-panel",
  ]);
  expect("cli panelIds match", cli.panelIds.join(",") === PANEL_IDS.join(","));
  expect("cli outDir is this folder", path.resolve(cli.outDir) === path.resolve(__dirname));
  expect("cli corpus prefix 9B.1A", cli.corpusPrefix === "pilot-9B.1A-panel");
  expect(
    "cli outDir is not pilot-9B.1",
    path.resolve(cli.outDir) !== path.resolve(path.dirname(priorNineB1Corpus)),
  );

  const parentCheck = spawnSync(process.execPath, [parentRunner, "--self-check"], {
    encoding: "utf8",
    cwd: root,
  });
  expect("parent parse self-check exit 0", parentCheck.status === 0);
  expect(
    "parent self-check reports passes",
    String(parentCheck.stdout || "").includes("Self-check:") &&
      String(parentCheck.stdout || "").includes("0 failed"),
  );

  console.log(`Self-check: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
  return failed === 0;
}

function main() {
  if (process.argv.includes("--self-check")) {
    runSelfCheck();
    return;
  }

  if (!runSelfCheck()) return;

  const args = [
    parentRunner,
    `--ids=${PANEL_IDS.join(",")}`,
    `--out-dir=${__dirname}`,
    "--corpus-prefix=pilot-9B.1A-panel",
    "--title=Sprint 9B.1A Targeted Verification Panel",
    "--writing-note=Requires api-server built/running from sprint-9b1-evaluation with Sprint 9B.1A closing movement guidance (final two sentences).",
  ];

  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

main();
