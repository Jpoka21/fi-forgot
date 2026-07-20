/**
 * Disposable Sprint 9B.1 targeted evaluation panel runner.
 * Does not modify production prompts or the frozen Sprint 9A corpus.
 *
 * Usage:
 *   Start api-server (sprint-9b1-evaluation build) with OpenAI key loaded.
 *   $env:PILOT_BASE_URL = "http://127.0.0.1:PORT"   # optional
 *   node playbook/writing-quality/pilot-9B.1/run-panel.mjs
 *   node playbook/writing-quality/pilot-9B.1/run-panel.mjs --self-check
 *
 * Semantics:
 *   - Panel only: G08, G16, G19, G13, G07, G04, G17
 *   - Exactly one HTTP request per scenario (no retries)
 *   - Exactly one first-returned card per successful scenario
 *   - No Rewrite / New Version / cherry-pick / regeneration after success
 *   - Writes only under pilot-9B.1/ — never touches pilot-9A.2/
 *
 * Response contract (must match Sprint 9A.2 known-good / route tests):
 *   HTTP 200 JSON: { cards: [{ tone, text, ... }], ... }
 *   Extract cards[0].tone + cards[0].text only.
 *
 * Evaluation integrity:
 *   pilot-9B.1-panel-20260720 @ 2026-07-20T15:24:48.762Z is INVALID — not a scored corpus.
 *   Route returned HTTP 500 { error: "Failed to parse card response" }; prior runner discarded
 *   bodies (raw: null), so originals cannot be recovered. Replacement panel must use a NEW
 *   corpusId and generatedAt (fresh seven-scenario run; one request each; zero retries).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const goldenPath = path.join(root, "playbook", "writing-quality", "GOLDEN_SCENARIO_SET_V1.json");
const outDir = __dirname;
const ENDPOINT = "/api/v2/generate-card";

const PANEL_IDS = ["G08", "G16", "G19", "G13", "G07", "G04", "G17"];
const TARGET_IDS = new Set(["G08", "G16", "G19"]);
const PROTECT_IDS = new Set(["G13", "G07", "G04", "G17"]);

/** Known-good one-card body shape from frozen Sprint 9A.2 CORPUS.json (G01 raw). */
const KNOWN_GOOD_GENERATE_CARD_BODY = {
  cards: [
    {
      tone: "Draft",
      text: "Mom, Thank you for helping me find new health insurance. You took on whoever you had to until the right coverage was in place. Knowing I’m covered is a real relief, and I won’t forget that you made it happen. Love, James",
      _qualityScore: {
        total: 50,
        specificity: 0,
        memoryUsage: 0,
        openingQuality: 20,
        closingQuality: 15,
        aiPhraseDetection: 15,
      },
    },
  ],
  browniePoints: null,
  keptInMind: [],
  keptInMindSources: [],
};

function yyyymmdd(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Safely serialize a response body for diagnostics.
 * Truncates; never logs headers, env, or secrets.
 */
function safeSerializeBody(value, maxChars = 4000) {
  try {
    const s =
      typeof value === "string"
        ? value
        : value === undefined
          ? "(undefined)"
          : JSON.stringify(value);
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}…[truncated ${s.length - maxChars} chars]`;
  } catch {
    return "(unserializable)";
  }
}

/**
 * Known-good extraction — same contract as pilot-9A.2/run-pilot.mjs postOnce.
 * Expects already-parsed JSON object from a successful generate-card response.
 */
export function extractFirstCardFromGenerateResponse(json) {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return {
      ok: false,
      reason: "body_not_object",
      cards: [],
    };
  }
  if (!Array.isArray(json.cards)) {
    return {
      ok: false,
      reason: "missing_cards_array",
      cards: [],
      topLevelKeys: Object.keys(json),
    };
  }
  if (json.cards.length < 1) {
    return {
      ok: false,
      reason: "empty_cards_array",
      cards: [],
    };
  }
  const first = json.cards[0];
  if (!first || typeof first !== "object") {
    return {
      ok: false,
      reason: "first_card_not_object",
      cards: [],
    };
  }
  if (typeof first.text !== "string" || !first.text.trim()) {
    return {
      ok: false,
      reason: "first_card_missing_nonempty_text",
      cards: [],
      firstCardKeys: Object.keys(first),
    };
  }
  return {
    ok: true,
    reason: null,
    cards: [
      {
        tone: typeof first.tone === "string" ? first.tone : "Draft",
        text: first.text,
      },
    ],
  };
}

/**
 * Parse one HTTP generate-card attempt into cards or a structured failure.
 * Distinguishes route/HTTP failures from harness extraction failures.
 */
export function parseGenerateCardHttpResult({ httpStatus, contentType, bodyText }) {
  const diagnostic = {
    httpStatus: httpStatus ?? null,
    contentType: contentType ?? null,
    rawBody: safeSerializeBody(bodyText ?? ""),
  };

  let json = null;
  let jsonParseError = null;
  try {
    json = JSON.parse(bodyText);
  } catch (e) {
    jsonParseError = String(e?.message || e);
  }

  if (httpStatus < 200 || httpStatus >= 300) {
    const routeError =
      (json && typeof json === "object" && (json.error || json.message)) || null;
    return {
      ok: false,
      failureKind: "http_or_route_error",
      parserReason: routeError
        ? `route_error: ${routeError}`
        : jsonParseError
          ? `non_ok_status_unparseable_body: HTTP ${httpStatus}`
          : `non_ok_status: HTTP ${httpStatus}`,
      cards: [],
      raw: json,
      diagnostic: {
        ...diagnostic,
        routeError: routeError ? String(routeError) : null,
        jsonParseError,
        topLevelKeys: json && typeof json === "object" ? Object.keys(json) : null,
      },
    };
  }

  if (jsonParseError) {
    return {
      ok: false,
      failureKind: "harness_json_parse",
      parserReason: `harness_json_parse: ${jsonParseError}`,
      cards: [],
      raw: null,
      diagnostic: {
        ...diagnostic,
        routeError: null,
        jsonParseError,
        topLevelKeys: null,
      },
    };
  }

  const extracted = extractFirstCardFromGenerateResponse(json);
  if (!extracted.ok) {
    return {
      ok: false,
      failureKind: "harness_shape",
      parserReason: `harness_shape: ${extracted.reason}`,
      cards: [],
      raw: json,
      diagnostic: {
        ...diagnostic,
        routeError: null,
        jsonParseError: null,
        topLevelKeys: extracted.topLevelKeys || (json ? Object.keys(json) : null),
        firstCardKeys: extracted.firstCardKeys || null,
      },
    };
  }

  return {
    ok: true,
    failureKind: null,
    parserReason: null,
    cards: extracted.cards,
    raw: json,
    diagnostic: {
      ...diagnostic,
      routeError: null,
      jsonParseError: null,
      topLevelKeys: Object.keys(json),
    },
  };
}

function runSelfCheck() {
  const cases = [];

  // 1. Known-good 9A.2 shape
  {
    const r = extractFirstCardFromGenerateResponse(KNOWN_GOOD_GENERATE_CARD_BODY);
    cases.push({
      name: "known_good_9A_raw_shape",
      pass: r.ok === true && r.cards[0]?.text?.includes("health insurance"),
      detail: r,
    });
  }

  // 2. HTTP 200 + known-good body via full parser
  {
    const r = parseGenerateCardHttpResult({
      httpStatus: 200,
      contentType: "application/json",
      bodyText: JSON.stringify(KNOWN_GOOD_GENERATE_CARD_BODY),
    });
    cases.push({
      name: "http_200_known_good",
      pass: r.ok === true && r.cards.length === 1,
      detail: { ok: r.ok, parserReason: r.parserReason },
    });
  }

  // 3. Route 500 "Failed to parse card response" must be classified as route error, not harness shape
  {
    const r = parseGenerateCardHttpResult({
      httpStatus: 500,
      contentType: "application/json",
      bodyText: JSON.stringify({ error: "Failed to parse card response" }),
    });
    cases.push({
      name: "route_500_parse_error_classified",
      pass:
        r.ok === false &&
        r.failureKind === "http_or_route_error" &&
        String(r.parserReason).includes("Failed to parse card response") &&
        r.diagnostic?.routeError === "Failed to parse card response",
      detail: { ok: r.ok, failureKind: r.failureKind, parserReason: r.parserReason },
    });
  }

  // 4. Empty cards on 200 → harness_shape
  {
    const r = parseGenerateCardHttpResult({
      httpStatus: 200,
      contentType: "application/json",
      bodyText: JSON.stringify({ cards: [] }),
    });
    cases.push({
      name: "http_200_empty_cards",
      pass: r.ok === false && r.failureKind === "harness_shape",
      detail: { ok: r.ok, failureKind: r.failureKind, parserReason: r.parserReason },
    });
  }

  // 5. Alternate envelope must not silently succeed
  {
    const r = extractFirstCardFromGenerateResponse({
      data: { card: { message: "hi" } },
    });
    cases.push({
      name: "rejects_alternate_envelope",
      pass: r.ok === false && r.reason === "missing_cards_array",
      detail: r,
    });
  }

  const failed = cases.filter((c) => !c.pass);
  for (const c of cases) {
    console.log(`${c.pass ? "PASS" : "FAIL"} ${c.name}`);
  }
  if (failed.length) {
    console.error("Self-check failures:", failed);
    process.exitCode = 1;
    return false;
  }
  console.log(`Self-check: ${cases.length} passed, 0 failed`);
  return true;
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

/** Exactly one attempt — no retry. Preserves diagnostics on failure. */
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

function toMd(corpus) {
  const lines = [
    `# Sprint 9B.1 Evaluation Panel`,
    ``,
    `- corpusId: ${corpus.corpusId}`,
    `- generatedAt: ${corpus.generatedAt}`,
    `- baseUrl: ${corpus.baseUrl || "(none)"}`,
    `- status: ${corpus.status}`,
    `- succeeded: ${corpus.scenarios.filter((s) => s.ok).length} / ${corpus.scenarios.length}`,
    `- failed: ${corpus.scenarios.filter((s) => !s.ok).map((s) => s.id).join(", ") || "(none)"}`,
    `- semantics: one request per scenario, no retries, one first-returned card`,
    `- frozen 9A corpus preserved (not overwritten)`,
    ``,
  ];
  for (const s of corpus.scenarios) {
    lines.push(
      `## ${s.id}${s.title ? ` — ${s.title}` : ""}`,
      ``,
      `- role: ${s.panelRole}`,
      `- flow: ${s.flow}`,
      `- occasion: ${s.occasion}`,
      `- relationship: ${s.relationship}`,
      `- authFidelity: ${s.authFidelity || "n/a"}`,
      `- attempts: ${s.attempts}`,
      ``,
    );
    if (!s.ok) {
      lines.push(`**ERROR:** ${s.error}`, ``);
      if (s.failureKind) lines.push(`- failureKind: ${s.failureKind}`);
      if (s.diagnostic) {
        lines.push(`- httpStatus: ${s.diagnostic.httpStatus}`);
        lines.push(`- contentType: ${s.diagnostic.contentType || "(none)"}`);
        if (s.diagnostic.routeError) lines.push(`- routeError: ${s.diagnostic.routeError}`);
        lines.push(`- rawBody (safe):`, ``, "```", s.diagnostic.rawBody || "(empty)", "```", ``);
      }
      continue;
    }
    s.cards.forEach((c, i) => {
      lines.push(`### ${i + 1}. ${c.tone}`, ``, c.text, ``);
    });
  }
  return lines.join("\n");
}

async function main() {
  if (process.argv.includes("--self-check")) {
    runSelfCheck();
    return;
  }

  // Always run parser self-check before live generation.
  if (!runSelfCheck()) return;

  const keyPresent = Boolean(
    process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  );
  console.log("Key present in this runner process:", keyPresent);
  console.log("(api-server process must also have the key and load the 9B.1 closing prompt)");

  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  const date = yyyymmdd();
  const selected = PANEL_IDS.map((id) => {
    const s = golden.scenarios.find((x) => x.id === id);
    if (!s) throw new Error(`Missing golden scenario ${id}`);
    return s;
  });

  const base = await probeBase();
  if (!base) {
    const blocker =
      "BLOCKER: No reachable server for POST /api/v2/generate-card on PILOT_BASE_URL or ports 3000/5000/8080. Cannot generate Sprint 9B.1 panel.";
    console.error(blocker);
    process.exitCode = 2;
    const corpus = {
      corpusId: `pilot-9B.1-panel-${date}`,
      generatedAt: new Date().toISOString(),
      status: "blocked",
      blocker,
      panelIds: PANEL_IDS,
      targetIds: [...TARGET_IDS],
      protectIds: [...PROTECT_IDS],
      semantics: {
        oneRequestPerScenario: true,
        retries: 0,
        firstReturnedCardOnly: true,
        noRewrite: true,
        noNewVersion: true,
        noCherryPick: true,
      },
      scenarios: selected.map((s) => ({
        id: s.id,
        title: s.title,
        panelRole: TARGET_IDS.has(s.id) ? "target" : "protect",
        flow: s.flow,
        authFidelity: s.authFidelity || null,
        occasion: s.axes?.occasion || s.request?.occasion,
        relationship: s.axes?.relationship || s.request?.relationship,
        ok: false,
        error: blocker,
        failureKind: "no_server",
        diagnostic: null,
        cards: [],
        raw: null,
        attempts: 0,
      })),
    };
    fs.writeFileSync(path.join(outDir, "CORPUS.json"), JSON.stringify(corpus, null, 2) + "\n");
    fs.writeFileSync(path.join(outDir, "CORPUS.md"), toMd(corpus));
    fs.writeFileSync(path.join(outDir, "BLOCKER.md"), blocker + "\n");
    return;
  }

  console.log("Using base:", base);
  const results = [];

  for (const s of selected) {
    console.log("Generating", s.id, "...");
    try {
      const out = await postOnce(base, s.request);
      results.push({
        id: s.id,
        title: s.title,
        panelRole: TARGET_IDS.has(s.id) ? "target" : "protect",
        flow: s.flow,
        authFidelity: s.authFidelity || null,
        occasion: s.axes?.occasion || s.request?.occasion,
        relationship: s.axes?.relationship || s.request?.relationship,
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
        id: s.id,
        title: s.title,
        panelRole: TARGET_IDS.has(s.id) ? "target" : "protect",
        flow: s.flow,
        authFidelity: s.authFidelity || null,
        occasion: s.axes?.occasion || s.request?.occasion,
        relationship: s.axes?.relationship || s.request?.relationship,
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
  const corpus = {
    corpusId: `pilot-9B.1-panel-${date}`,
    generatedAt: new Date().toISOString(),
    status: okCount === results.length ? "complete" : "partial",
    baseUrl: base,
    panelIds: PANEL_IDS,
    targetIds: [...TARGET_IDS],
    protectIds: [...PROTECT_IDS],
    semantics: {
      oneRequestPerScenario: true,
      retries: 0,
      firstReturnedCardOnly: true,
      noRewrite: true,
      noNewVersion: true,
      noCherryPick: true,
    },
    writingContractNote: "Requires api-server built/running from sprint-9b1-evaluation with Sprint 9B.1 closing discipline.",
    responseContractNote:
      "Expects HTTP 200 { cards:[{ tone, text }] } (Sprint 8E / 9A.2). Route 500 { error: 'Failed to parse card response' } is a route/model failure, not a harness shape mismatch.",
    scenarios: results,
  };

  fs.writeFileSync(path.join(outDir, "CORPUS.json"), JSON.stringify(corpus, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "CORPUS.md"), toMd(corpus));
  if (okCount < results.length) {
    const failed = results.filter((r) => !r.ok).map((r) => {
      const kind = r.failureKind || "?";
      return `${r.id}: [${kind}] ${r.error}`;
    });
    fs.writeFileSync(
      path.join(outDir, "BLOCKER.md"),
      `PARTIAL: ${okCount}/${results.length} succeeded.\n\n${failed.join("\n")}\n`,
    );
    process.exitCode = 3;
  } else if (fs.existsSync(path.join(outDir, "BLOCKER.md"))) {
    fs.unlinkSync(path.join(outDir, "BLOCKER.md"));
  }

  console.log(`Done: ${okCount}/${results.length}. Wrote CORPUS.json / CORPUS.md under pilot-9B.1/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
