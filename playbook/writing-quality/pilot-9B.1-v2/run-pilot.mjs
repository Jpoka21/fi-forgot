/**
 * Writing Evaluation Framework V2 — full 20-scenario corpus runner.
 * Evaluation-only. Does not modify production prompts or frozen Sprint 9A.2 artifacts.
 *
 * Usage:
 *   Start api-server implementing production commit PRODUCTION_IMPLEMENTATION_COMMIT.
 *   $env:PILOT_BASE_URL = "http://127.0.0.1:PORT"   # optional
 *   node playbook/writing-quality/pilot-9B.1-v2/run-pilot.mjs --self-check
 *   node playbook/writing-quality/pilot-9B.1-v2/run-pilot.mjs
 *
 * Semantics (Framework V2 / Sprint 9B.1 verification):
 *   - All 20 frozen GOLDEN_SCENARIO_SET_V1 scenarios in array order (read-only; never copied)
 *   - Exactly one HTTP request per scenario (zero retries)
 *   - Exactly one first-returned card per successful scenario
 *   - No Rewrite / New Version / cherry-pick / regeneration
 *   - Guest and authenticated_body both POST scenario.request only (no x-user-id / recipientId)
 *   - Writes only under pilot-9B.1-v2/ — never touches pilot-9A.2/
 *   - status "complete" only when all 20 scenarios have attempts===1 and one nonempty card
 *
 * Provenance:
 *   productionImplementationCommit is pinned to the Sprint 9B.1 production tip.
 *   Later harness-only commits may advance branch HEAD; corpus metadata still names
 *   the production implementation under evaluation (not the harness commit).
 *
 * Reuses parse helpers from pilot-9B.1/run-panel.mjs (no duplicated JSON extraction).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractFirstCardFromGenerateResponse,
  parseGenerateCardHttpResult,
  parsePanelCliArgs,
} from "../pilot-9B.1/run-panel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const goldenPath = path.join(root, "playbook", "writing-quality", "GOLDEN_SCENARIO_SET_V1.json");
const frozenV1CorpusPath = path.join(root, "playbook", "writing-quality", "pilot-9A.2", "CORPUS.json");
const outDir = __dirname;
const ENDPOINT = "/api/v2/generate-card";
const CORPUS_PREFIX = "pilot-9B.1-v2";

/**
 * Production writing implementation under evaluation for Framework V2.
 * Harness-only commits after this SHA must not change this pin.
 */
export const PRODUCTION_IMPLEMENTATION_COMMIT =
  "2aab24385168438b12500e33d23443d662d75a63";

const EXPECTED_IDS = Array.from({ length: 20 }, (_, i) => `G${String(i + 1).padStart(2, "0")}`);

function yyyymmdd(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function git(args) {
  const r = spawnSync("git", args, { encoding: "utf8", cwd: root });
  if (r.status !== 0) return null;
  return String(r.stdout || "").trim() || null;
}

function collectProvenance() {
  return {
    branch: git(["branch", "--show-current"]),
    productionImplementationCommit: PRODUCTION_IMPLEMENTATION_COMMIT,
    productionImplementationNote:
      "Sprint 9B.1 finalized writing contract (closing discipline + GPT-5 generate 8000 + slim diagnostics). Harness-only commits after this SHA evaluate this implementation; they are not a new production writing tip.",
    harnessCommit: git(["rev-parse", "HEAD"]),
    harnessCommitNote:
      "Git HEAD when this corpus was generated. May be newer than productionImplementationCommit when only evaluation assets changed.",
    goldenScenarioSetPath: "playbook/writing-quality/GOLDEN_SCENARIO_SET_V1.json",
    goldenScenarioSetNote: "Read-only frozen V1 payloads; not duplicated in this directory.",
  };
}

async function probeBase() {
  if (process.env.PILOT_BASE_URL) return process.env.PILOT_BASE_URL.replace(/\/$/, "");
  for (const p of [3000, 5000, 8080]) {
    const base = `http://127.0.0.1:${p}`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(`${base}${ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal: ctrl.signal,
      }).catch(() => null);
      clearTimeout(t);
      if (res && (res.status === 400 || res.status === 401 || res.status === 200 || res.status === 500)) {
        return base;
      }
    } catch {
      /* next */
    }
  }
  return null;
}

/** Exactly one attempt — no retry. */
async function postOnce(base, body) {
  const res = await fetch(`${base}${ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const contentType = res.headers.get("content-type");
  const parsed = parseGenerateCardHttpResult({
    httpStatus: res.status,
    contentType,
    bodyText: text,
  });
  if (!parsed.ok) {
    const err = new Error(parsed.parserReason || "generate-card parse failed");
    err.failureKind = parsed.failureKind;
    err.diagnostic = parsed.diagnostic;
    err.raw = parsed.raw;
    err.httpStatus = res.status;
    throw err;
  }
  return {
    cards: parsed.cards,
    raw: parsed.raw,
    httpStatus: res.status,
    diagnostic: parsed.diagnostic,
  };
}

/**
 * A corpus is evaluation-complete only when every golden scenario has exactly
 * one attempt and exactly one nonempty first-returned card.
 */
export function validateCorpusCompletion(corpus) {
  const reasons = [];
  if (!corpus || typeof corpus !== "object") {
    return { ok: false, reasons: ["corpus_missing"] };
  }
  const scenarios = corpus.scenarios;
  if (!Array.isArray(scenarios) || scenarios.length !== 20) {
    reasons.push(`expected_20_scenarios_got_${scenarios?.length ?? 0}`);
  }
  const ids = (scenarios || []).map((s) => s.id);
  if (ids.join(",") !== EXPECTED_IDS.join(",")) {
    reasons.push("scenario_ids_not_G01_through_G20_in_order");
  }
  for (const s of scenarios || []) {
    if (s.attempts !== 1) reasons.push(`${s.id}:attempts_must_be_1_got_${s.attempts}`);
    if (s.ok !== true) reasons.push(`${s.id}:not_ok`);
    if (!Array.isArray(s.cards) || s.cards.length !== 1) {
      reasons.push(`${s.id}:expected_exactly_one_card`);
    } else if (typeof s.cards[0]?.text !== "string" || !s.cards[0].text.trim()) {
      reasons.push(`${s.id}:card_text_empty`);
    }
  }
  if (corpus.provenance?.productionImplementationCommit !== PRODUCTION_IMPLEMENTATION_COMMIT) {
    reasons.push("productionImplementationCommit_mismatch");
  }
  return { ok: reasons.length === 0, reasons };
}

function finalizeCorpusStatus(corpus) {
  const validation = validateCorpusCompletion(corpus);
  if (validation.ok) {
    corpus.status = "complete";
    corpus.evaluationEligible = true;
    corpus.notForScoring = false;
    corpus.completionValidation = { ok: true, reasons: [] };
  } else if (corpus.status === "blocked") {
    corpus.evaluationEligible = false;
    corpus.notForScoring = true;
    corpus.completionValidation = validation;
  } else {
    corpus.status = "partial";
    corpus.evaluationEligible = false;
    corpus.notForScoring = true;
    corpus.completionValidation = validation;
  }
  return corpus;
}

function toMd(corpus) {
  const lines = [
    `# Writing Evaluation Framework V2 Corpus`,
    ``,
    corpus.notForScoring
      ? `> **NOT FOR SCORING** — status \`${corpus.status}\`. Do not treat as a completed Framework V2 evaluation.`
      : `> Evaluation-eligible complete corpus.`,
    ``,
    `- corpusId: ${corpus.corpusId}`,
    `- generatedAt: ${corpus.generatedAt}`,
    `- status: ${corpus.status}`,
    `- evaluationEligible: ${corpus.evaluationEligible === true}`,
    `- notForScoring: ${corpus.notForScoring === true}`,
    `- baseUrl: ${corpus.baseUrl || "(none)"}`,
    `- productionImplementationCommit: ${corpus.provenance?.productionImplementationCommit || "(missing)"}`,
    `- harnessCommit: ${corpus.provenance?.harnessCommit || "(missing)"}`,
    `- branch: ${corpus.provenance?.branch || "(missing)"}`,
    `- writingContract: ${corpus.writingContractNote || ""}`,
    `- succeeded: ${corpus.scenarios.filter((s) => s.ok).length} / ${corpus.scenarios.length}`,
    `- failed: ${corpus.scenarios.filter((s) => !s.ok).map((s) => s.id).join(", ") || "(none)"}`,
    `- semantics: one request per scenario, zero retries, first-returned card only`,
    `- frozen V1 corpus at pilot-9A.2/ not overwritten`,
    ``,
  ];
  if (corpus.blocker) {
    lines.push(`**BLOCKER:** ${corpus.blocker}`, ``);
  }
  if (corpus.completionValidation && !corpus.completionValidation.ok) {
    lines.push(
      `**Completion gate failed:**`,
      ...corpus.completionValidation.reasons.map((r) => `- ${r}`),
      ``,
    );
  }
  for (const s of corpus.scenarios) {
    lines.push(
      `## ${s.id}${s.title ? ` — ${s.title}` : ""}`,
      ``,
      `- flow / requestMode: ${s.requestMode || s.flow}`,
      `- occasion: ${s.occasion}`,
      `- relationship: ${s.relationship}`,
      `- authFidelity: ${s.authFidelity || "n/a"}`,
      `- contextRichness: ${s.contextRichness || "n/a"}`,
      `- attempts: ${s.attempts}`,
      ``,
    );
    if (!s.ok) {
      lines.push(`**ERROR:** ${s.error}`, ``);
      if (s.failureKind) lines.push(`- failureKind: ${s.failureKind}`);
      if (s.diagnostic) {
        lines.push(`- httpStatus: ${s.diagnostic.httpStatus}`);
        if (s.diagnostic.routeError) lines.push(`- routeError: ${s.diagnostic.routeError}`);
      }
      continue;
    }
    s.cards.forEach((c, i) => {
      lines.push(`### ${i + 1}. ${c.tone}`, ``, c.text, ``);
    });
  }
  return lines.join("\n");
}

function scenarioBase(s) {
  return {
    id: s.id,
    title: s.title,
    flow: s.flow,
    requestMode: s.flow,
    authFidelity: s.authFidelity || null,
    contextRichness: s.contextRichness || null,
    occasion: s.axes?.occasion || s.request?.occasion,
    relationship: s.axes?.relationship || s.request?.relationship,
  };
}

function runSelfCheck() {
  let passed = 0;
  let failed = 0;
  const expect = (name, ok) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if (ok) passed++;
    else failed++;
  };

  expect("out dir is pilot-9B.1-v2", path.basename(__dirname) === "pilot-9B.1-v2");
  expect("does not write into pilot-9A.2", path.resolve(outDir) !== path.resolve(path.dirname(frozenV1CorpusPath)));
  expect(
    "production pin is 2aab243…",
    PRODUCTION_IMPLEMENTATION_COMMIT === "2aab24385168438b12500e33d23443d662d75a63",
  );

  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  expect("golden has 20 scenarios", golden.scenarios?.length === 20);
  expect("golden ids G01..G20", golden.scenarios.map((s) => s.id).join(",") === EXPECTED_IDS.join(","));
  expect(
    "harness loads golden from frozen path only",
    goldenPath.replace(/\\/g, "/").endsWith("playbook/writing-quality/GOLDEN_SCENARIO_SET_V1.json"),
  );
  const harnessSrc = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  const embeddedKey = ["first", "Name"].join("") + '":';
  expect(
    "harness does not embed scenario request bodies",
    !harnessSrc.includes(`"${embeddedKey}`) &&
      !harnessSrc.includes(`'${embeddedKey}`) &&
      !/scenarios\s*:\s*\[\s*\{/.test(harnessSrc),
  );

  const frozen = JSON.parse(fs.readFileSync(frozenV1CorpusPath, "utf8"));
  expect("frozen V1 corpus complete", frozen.status === "complete" && frozen.scenarios?.length === 20);
  expect("frozen V1 all ok", frozen.scenarios.every((s) => s.ok === true));

  const defaults = parsePanelCliArgs([]);
  expect("parent default remains 7-panel", defaults.panelIds.length === 7);

  const knownGood = {
    cards: [{ tone: "Draft", text: "Mom, Thank you for helping me find new health insurance." }],
  };
  const extracted = extractFirstCardFromGenerateResponse(knownGood);
  expect("reuses extractFirstCardFromGenerateResponse", extracted.ok === true);

  const parsed500 = parseGenerateCardHttpResult({
    httpStatus: 500,
    contentType: "application/json",
    bodyText: JSON.stringify({ error: "Failed to parse card response" }),
  });
  expect(
    "reuses parseGenerateCardHttpResult route error",
    parsed500.ok === false && parsed500.failureKind === "http_or_route_error",
  );

  const blockedSample = finalizeCorpusStatus({
    status: "blocked",
    provenance: collectProvenance(),
    scenarios: EXPECTED_IDS.map((id) => ({
      id,
      ok: false,
      attempts: 0,
      cards: [],
    })),
  });
  expect("blocked corpus not evaluationEligible", blockedSample.evaluationEligible === false);
  expect("blocked corpus notForScoring", blockedSample.notForScoring === true);
  expect("blocked corpus status stays blocked", blockedSample.status === "blocked");
  expect("blocked fails completion gate", blockedSample.completionValidation.ok === false);

  const fakeComplete = finalizeCorpusStatus({
    status: "complete",
    provenance: { productionImplementationCommit: PRODUCTION_IMPLEMENTATION_COMMIT },
    scenarios: EXPECTED_IDS.map((id) => ({
      id,
      ok: true,
      attempts: 1,
      cards: [{ tone: "Draft", text: `card for ${id}` }],
    })),
  });
  expect("valid 20x1 corpus evaluationEligible", fakeComplete.evaluationEligible === true);
  expect("valid 20x1 corpus status complete", fakeComplete.status === "complete");

  const parentCheck = spawnSync(
    process.execPath,
    [path.join(__dirname, "../pilot-9B.1/run-panel.mjs"), "--self-check"],
    { encoding: "utf8", cwd: root },
  );
  expect("parent panel self-check exit 0", parentCheck.status === 0);

  console.log(`Self-check: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
  return failed === 0;
}

async function main() {
  if (process.argv.includes("--self-check")) {
    runSelfCheck();
    return;
  }

  if (!runSelfCheck()) return;

  fs.mkdirSync(outDir, { recursive: true });

  const provenance = collectProvenance();
  const keyPresent = Boolean(
    process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  );
  console.log("Key present in this runner process:", keyPresent);
  console.log("Production implementation under evaluation:", provenance.productionImplementationCommit);
  console.log("Harness HEAD:", provenance.harnessCommit);
  console.log("Branch:", provenance.branch);

  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  const date = yyyymmdd();
  const panelIds = golden.scenarios.map((s) => s.id);

  const base = await probeBase();
  if (!base) {
    const blocker =
      "BLOCKER: No reachable server for POST /api/v2/generate-card on PILOT_BASE_URL or ports 3000/5000/8080. Cannot generate Framework V2 corpus.";
    console.error(blocker);
    process.exitCode = 2;
    const corpus = finalizeCorpusStatus({
      corpusId: `${CORPUS_PREFIX}-${date}`,
      title: "Writing Evaluation Framework V2",
      generatedAt: new Date().toISOString(),
      status: "blocked",
      blocker,
      panelIds,
      provenance,
      semantics: {
        oneRequestPerScenario: true,
        retries: 0,
        firstReturnedCardOnly: true,
        noRewrite: true,
        noNewVersion: true,
        noCherryPick: true,
        postsRequestBodyOnly: true,
        noUserIdHeader: true,
        noRecipientIdInjection: true,
      },
      writingContractNote:
        "Evaluates production writing at 2aab24385168438b12500e33d23443d662d75a63 (Sprint 9B.1 closing + GPT-5 generate 8000). Harness commits after that SHA are evaluation assets only.",
      scenarios: golden.scenarios.map((s) => ({
        ...scenarioBase(s),
        ok: false,
        error: blocker,
        failureKind: "no_server",
        diagnostic: null,
        cards: [],
        raw: null,
        attempts: 0,
      })),
    });
    fs.writeFileSync(path.join(outDir, "CORPUS.json"), JSON.stringify(corpus, null, 2) + "\n");
    fs.writeFileSync(path.join(outDir, "CORPUS.md"), toMd(corpus));
    fs.writeFileSync(
      path.join(outDir, "BLOCKER.md"),
      [
        "NOT FOR SCORING",
        "status: blocked",
        "evaluationEligible: false",
        "",
        blocker,
        "",
        `productionImplementationCommit: ${PRODUCTION_IMPLEMENTATION_COMMIT}`,
        `harnessCommit: ${provenance.harnessCommit || "(unknown)"}`,
        "",
      ].join("\n"),
    );
    return;
  }

  console.log("Using base:", base);
  const results = [];

  for (const s of golden.scenarios) {
    console.log("Generating", s.id, `(${s.flow})...`);
    try {
      // Exact frozen request body only — preserves guest vs authenticated_body fidelity.
      const out = await postOnce(base, s.request);
      results.push({
        ...scenarioBase(s),
        ok: true,
        error: null,
        failureKind: null,
        diagnostic: out.diagnostic,
        cards: out.cards,
        raw: out.raw,
        attempts: 1,
        httpStatus: out.httpStatus,
      });
    } catch (e) {
      results.push({
        ...scenarioBase(s),
        ok: false,
        error: String(e?.message || e),
        failureKind: e?.failureKind || "unknown",
        diagnostic: e?.diagnostic || null,
        cards: [],
        raw: e?.raw ?? null,
        attempts: 1,
        httpStatus: e?.httpStatus ?? null,
      });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const corpus = finalizeCorpusStatus({
    corpusId: `${CORPUS_PREFIX}-${date}`,
    title: "Writing Evaluation Framework V2",
    generatedAt: new Date().toISOString(),
    status: okCount === results.length ? "complete" : "partial",
    baseUrl: base,
    panelIds,
    provenance,
    semantics: {
      oneRequestPerScenario: true,
      retries: 0,
      firstReturnedCardOnly: true,
      noRewrite: true,
      noNewVersion: true,
      noCherryPick: true,
      postsRequestBodyOnly: true,
      noUserIdHeader: true,
      noRecipientIdInjection: true,
    },
    writingContractNote:
      "Evaluates production writing at 2aab24385168438b12500e33d23443d662d75a63 (Sprint 9B.1 closing + GPT-5 generate 8000). Harness commits after that SHA are evaluation assets only.",
    responseContractNote:
      "Expects HTTP 200 { cards:[{ tone, text }] }. Zero retries. Failed scenarios recorded; not regenerated. status complete only if completion gate passes.",
    scenarios: results,
  });

  fs.writeFileSync(path.join(outDir, "CORPUS.json"), JSON.stringify(corpus, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "CORPUS.md"), toMd(corpus));

  if (!corpus.evaluationEligible) {
    const failed = results
      .filter((r) => !r.ok)
      .map((r) => `${r.id}: [${r.failureKind || "?"}] ${r.error}`);
    fs.writeFileSync(
      path.join(outDir, "BLOCKER.md"),
      [
        "NOT FOR SCORING",
        `status: ${corpus.status}`,
        "evaluationEligible: false",
        "",
        `PARTIAL: ${okCount}/${results.length} succeeded.`,
        "",
        ...failed,
        "",
        "Completion gate:",
        ...(corpus.completionValidation?.reasons || []).map((r) => `- ${r}`),
        "",
        `productionImplementationCommit: ${PRODUCTION_IMPLEMENTATION_COMMIT}`,
        `harnessCommit: ${provenance.harnessCommit || "(unknown)"}`,
        "",
      ].join("\n"),
    );
    process.exitCode = 3;
  } else if (fs.existsSync(path.join(outDir, "BLOCKER.md"))) {
    fs.unlinkSync(path.join(outDir, "BLOCKER.md"));
  }

  console.log(
    `Done: ${okCount}/${results.length}. status=${corpus.status} evaluationEligible=${corpus.evaluationEligible}. Wrote under ${outDir}`,
  );
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { runSelfCheck, postOnce, toMd, finalizeCorpusStatus, collectProvenance };
