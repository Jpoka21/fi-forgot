/**
 * Sprint 9B.2 attempt 2 — targeted seven-scenario panel runner.
 * Evaluation-only. Does not modify production prompts or frozen evaluation artifacts.
 *
 * Usage:
 *   Start api-server implementing production commit PRODUCTION_IMPLEMENTATION_COMMIT.
 *   $env:PILOT_BASE_URL = "http://127.0.0.1:PORT"   # optional
 *   node playbook/writing-quality/pilot-9B.2-v2-panel/run-pilot.mjs --self-check
 *   node playbook/writing-quality/pilot-9B.2-v2-panel/run-pilot.mjs
 *
 * Panel IDs (exact order): G11, G13, G02, G04, G07, G17, G16
 *
 * Semantics:
 *   - Frozen GOLDEN_SCENARIO_SET_V1 requests only (read-only; never copied into this dir)
 *   - Exactly one HTTP request per scenario (zero retries)
 *   - Exactly one first-returned card per successful scenario
 *   - No Rewrite / New Version / cherry-pick / regeneration
 *   - Guest and authenticated_body both POST scenario.request only
 *   - Writes only under pilot-9B.2-v2-panel/
 *   - status "complete" only when all 7 panel scenarios have attempts===1 and one nonempty card
 *
 * Do NOT use this harness for the full G01–G20 corpus.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractFirstCardFromGenerateResponse,
  parseGenerateCardHttpResult,
} from "../pilot-9B.1/run-panel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const goldenPath = path.join(root, "playbook", "writing-quality", "GOLDEN_SCENARIO_SET_V1.json");
const frozenV1CorpusPath = path.join(root, "playbook", "writing-quality", "pilot-9A.2", "CORPUS.json");
const frozen9B1V2Dir = path.join(root, "playbook", "writing-quality", "pilot-9B.1-v2");
const frozen9B1V2CorpusPath = path.join(frozen9B1V2Dir, "CORPUS.json");
const frozen9B2V1Dir = path.join(root, "playbook", "writing-quality", "pilot-9B.2-v1");
const frozen9B2V1CorpusPath = path.join(frozen9B2V1Dir, "CORPUS.json");
const outDir = __dirname;
const ENDPOINT = "/api/v2/generate-card";
const CORPUS_PREFIX = "pilot-9B.2-v2-panel";

/** Exact seven-scenario panel membership and order. */
export const PANEL_IDS = ["G11", "G13", "G02", "G04", "G07", "G17", "G16"];

/**
 * Production writing implementation under evaluation (Sprint 9B.2 attempt 2).
 * Harness-only commits after this SHA must not change this pin.
 */
export const PRODUCTION_IMPLEMENTATION_COMMIT =
  "b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4";

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
      "Sprint 9B.2 attempt 2 (professional Thank You body/sign-off boundary). Harness commits after this SHA are evaluation assets only.",
    harnessCommit: git(["rev-parse", "HEAD"]),
    harnessCommitNote:
      "Git HEAD when this panel corpus was generated. May be newer than productionImplementationCommit when only harness assets changed.",
    goldenScenarioSetPath: "playbook/writing-quality/GOLDEN_SCENARIO_SET_V1.json",
    goldenScenarioSetNote: "Read-only frozen V1 payloads; panel scenarios selected by ID only.",
    panelIds: [...PANEL_IDS],
    panelNote: "Targeted seven-scenario panel — not the full G01–G20 corpus.",
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
 * Panel corpus is evaluation-complete only when every panel scenario has exactly
 * one attempt and exactly one nonempty first-returned card.
 */
export function validateCorpusCompletion(corpus) {
  const reasons = [];
  if (!corpus || typeof corpus !== "object") {
    return { ok: false, reasons: ["corpus_missing"] };
  }
  const scenarios = corpus.scenarios;
  if (!Array.isArray(scenarios) || scenarios.length !== PANEL_IDS.length) {
    reasons.push(`expected_${PANEL_IDS.length}_scenarios_got_${scenarios?.length ?? 0}`);
  }
  const ids = (scenarios || []).map((s) => s.id);
  if (ids.join(",") !== PANEL_IDS.join(",")) {
    reasons.push("scenario_ids_not_panel_G11_G13_G02_G04_G07_G17_G16_in_order");
  }
  if ((corpus.panelIds || []).join(",") !== PANEL_IDS.join(",")) {
    reasons.push("panelIds_mismatch");
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
    `# Sprint 9B.2 Attempt 2 — Targeted Panel Corpus`,
    ``,
    corpus.notForScoring
      ? `> **NOT FOR SCORING** — status \`${corpus.status}\`. Do not treat as a completed panel evaluation.`
      : `> Evaluation-eligible complete panel corpus.`,
    ``,
    `- corpusId: ${corpus.corpusId}`,
    `- generatedAt: ${corpus.generatedAt}`,
    `- status: ${corpus.status}`,
    `- evaluationEligible: ${corpus.evaluationEligible === true}`,
    `- notForScoring: ${corpus.notForScoring === true}`,
    `- baseUrl: ${corpus.baseUrl || "(none)"}`,
    `- panelIds: ${(corpus.panelIds || []).join(", ")}`,
    `- productionImplementationCommit: ${corpus.provenance?.productionImplementationCommit || "(missing)"}`,
    `- harnessCommit: ${corpus.provenance?.harnessCommit || "(missing)"}`,
    `- branch: ${corpus.provenance?.branch || "(missing)"}`,
    `- writingContract: ${corpus.writingContractNote || ""}`,
    `- succeeded: ${corpus.scenarios.filter((s) => s.ok).length} / ${corpus.scenarios.length}`,
    `- failed: ${corpus.scenarios.filter((s) => !s.ok).map((s) => s.id).join(", ") || "(none)"}`,
    `- semantics: one request per scenario, zero retries, first-returned card only`,
    `- **Not** the full G01–G20 corpus`,
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

function loadPanelScenarios() {
  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  const byId = Object.fromEntries(golden.scenarios.map((s) => [s.id, s]));
  return PANEL_IDS.map((id) => {
    const s = byId[id];
    if (!s) throw new Error(`Missing golden scenario ${id}`);
    return s;
  });
}

function runSelfCheck() {
  let passed = 0;
  let failed = 0;
  const expect = (name, ok) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if (ok) passed++;
    else failed++;
  };

  expect("out dir is pilot-9B.2-v2-panel", path.basename(__dirname) === "pilot-9B.2-v2-panel");
  expect(
    "does not write into pilot-9A.2",
    path.resolve(outDir) !== path.resolve(path.dirname(frozenV1CorpusPath)),
  );
  expect(
    "does not write into pilot-9B.1-v2",
    path.resolve(outDir) !== path.resolve(frozen9B1V2Dir),
  );
  expect(
    "does not write into pilot-9B.2-v1",
    path.resolve(outDir) !== path.resolve(frozen9B2V1Dir),
  );
  expect(
    "production pin is b9bc2ac…",
    PRODUCTION_IMPLEMENTATION_COMMIT === "b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4",
  );
  expect(
    "panel ids exact seven",
    PANEL_IDS.join(",") === "G11,G13,G02,G04,G07,G17,G16",
  );
  expect("panel count is 7", PANEL_IDS.length === 7);

  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  const goldenIds = new Set(golden.scenarios.map((s) => s.id));
  expect(
    "all panel ids exist in golden",
    PANEL_IDS.every((id) => goldenIds.has(id)),
  );
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

  const frozen9b1 = JSON.parse(fs.readFileSync(frozen9B1V2CorpusPath, "utf8"));
  expect(
    "frozen Sprint 9B.1-v2 corpus still complete (untouched)",
    frozen9b1.status === "complete" &&
      frozen9b1.evaluationEligible === true &&
      frozen9b1.scenarios?.length === 20 &&
      frozen9b1.provenance?.productionImplementationCommit ===
        "2aab24385168438b12500e33d23443d662d75a63",
  );

  const frozen9b2 = JSON.parse(fs.readFileSync(frozen9B2V1CorpusPath, "utf8"));
  expect(
    "frozen Sprint 9B.2-v1 FAIL corpus still complete (untouched)",
    frozen9b2.status === "complete" &&
      frozen9b2.evaluationEligible === true &&
      frozen9b2.scenarios?.length === 20 &&
      frozen9b2.provenance?.productionImplementationCommit ===
        "0d47a18163c52a5c9f8773c86ccc3414c24b2e47",
  );

  const knownGood = {
    cards: [{ tone: "Draft", text: "Sam—thank you for covering my client calls." }],
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
    panelIds: [...PANEL_IDS],
    provenance: collectProvenance(),
    scenarios: PANEL_IDS.map((id) => ({
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
    panelIds: [...PANEL_IDS],
    provenance: { productionImplementationCommit: PRODUCTION_IMPLEMENTATION_COMMIT },
    scenarios: PANEL_IDS.map((id) => ({
      id,
      ok: true,
      attempts: 1,
      cards: [{ tone: "Draft", text: `card for ${id}` }],
    })),
  });
  expect("valid 7x1 panel evaluationEligible", fakeComplete.evaluationEligible === true);
  expect("valid 7x1 panel status complete", fakeComplete.status === "complete");

  const wrongOrder = finalizeCorpusStatus({
    status: "complete",
    panelIds: [...PANEL_IDS],
    provenance: { productionImplementationCommit: PRODUCTION_IMPLEMENTATION_COMMIT },
    scenarios: ["G02", "G11", "G13", "G04", "G07", "G17", "G16"].map((id) => ({
      id,
      ok: true,
      attempts: 1,
      cards: [{ tone: "Draft", text: `card for ${id}` }],
    })),
  });
  expect("wrong id order fails completion gate", wrongOrder.completionValidation.ok === false);

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
  console.log("Panel IDs:", PANEL_IDS.join(", "));

  const panelScenarios = loadPanelScenarios();
  const date = yyyymmdd();

  const base = await probeBase();
  if (!base) {
    const blocker =
      "BLOCKER: No reachable server for POST /api/v2/generate-card on PILOT_BASE_URL or ports 3000/5000/8080. Cannot generate Sprint 9B.2 attempt 2 panel.";
    console.error(blocker);
    process.exitCode = 2;
    const corpus = finalizeCorpusStatus({
      corpusId: `${CORPUS_PREFIX}-${date}`,
      title: "Sprint 9B.2 Attempt 2 Targeted Panel",
      generatedAt: new Date().toISOString(),
      status: "blocked",
      blocker,
      panelIds: [...PANEL_IDS],
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
        "Evaluates production writing at b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4 (Sprint 9B.2 attempt 2 body/sign-off boundary). Targeted seven-scenario panel only.",
      scenarios: panelScenarios.map((s) => ({
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
        "Do not run the full G01–G20 corpus from this harness.",
        "",
      ].join("\n"),
    );
    return;
  }

  console.log("Using base:", base);
  const results = [];

  for (const s of panelScenarios) {
    console.log("Generating", s.id, `(${s.flow})...`);
    try {
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
    title: "Sprint 9B.2 Attempt 2 Targeted Panel",
    generatedAt: new Date().toISOString(),
    status: okCount === results.length ? "complete" : "partial",
    baseUrl: base,
    panelIds: [...PANEL_IDS],
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
      "Evaluates production writing at b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4 (Sprint 9B.2 attempt 2 body/sign-off boundary). Targeted seven-scenario panel only — not full G01–G20.",
    responseContractNote:
      "Expects HTTP 200 { cards:[{ tone, text }] }. Zero retries. Failed scenarios recorded; not regenerated. status complete only if seven-scenario panel completion gate passes.",
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
        "Do not run the full G01–G20 corpus from this harness.",
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

export { runSelfCheck, postOnce, toMd, finalizeCorpusStatus, collectProvenance, loadPanelScenarios };
