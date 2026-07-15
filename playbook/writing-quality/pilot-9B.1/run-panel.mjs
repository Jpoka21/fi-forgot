/**
 * Disposable Sprint 9B.1 targeted evaluation panel runner.
 * Does not modify production prompts or the frozen Sprint 9A corpus.
 *
 * Usage:
 *   Start api-server (with Sprint 9B.1 local closing changes loaded) and
 *   AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY set in that process.
 *   $env:PILOT_BASE_URL = "http://127.0.0.1:PORT"   # optional
 *   node playbook/writing-quality/pilot-9B.1/run-panel.mjs
 *
 * Semantics (stricter than 9A.2 retry allowance for this verification):
 *   - Panel only: G08, G16, G19, G13, G07, G04, G17
 *   - Exactly one HTTP request per scenario (no retries)
 *   - Exactly one first-returned card per successful scenario
 *   - No Rewrite / New Version / cherry-pick / regeneration after success
 *   - Writes only under pilot-9B.1/ — never touches pilot-9A.2/
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

function yyyymmdd(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
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
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* keep raw */
  }
  if (!res.ok) {
    const err = (json && (json.error || json.message)) || text.slice(0, 500) || `HTTP ${res.status}`;
    throw new Error(String(err));
  }
  if (!json?.cards || !Array.isArray(json.cards) || json.cards.length < 1) {
    throw new Error("Response missing card");
  }
  const cards = json.cards.slice(0, 1).map((c) => ({ tone: c.tone, text: c.text }));
  return { cards, raw: json, httpStatus: res.status };
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
      continue;
    }
    s.cards.forEach((c, i) => {
      lines.push(`### ${i + 1}. ${c.tone}`, ``, c.text, ``);
    });
  }
  return lines.join("\n");
}

async function main() {
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
        cards: [],
        raw: null,
        attempts: 1,
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
    writingContractNote: "Requires api-server built/running from working tree with Sprint 9B.1 closing discipline.",
    scenarios: results,
  };

  fs.writeFileSync(path.join(outDir, "CORPUS.json"), JSON.stringify(corpus, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "CORPUS.md"), toMd(corpus));
  if (okCount < results.length) {
    const failed = results.filter((r) => !r.ok).map((r) => `${r.id}: ${r.error}`);
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
