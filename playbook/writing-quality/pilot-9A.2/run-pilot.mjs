/**
 * Disposable Sprint 9A.2 pilot runner (evaluation-only).
 * Calls frozen POST /api/v2/generate-card — does not modify production prompts or data.
 *
 * Usage:
 *   Start api-server with AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY.
 *   $env:PILOT_BASE_URL = "http://127.0.0.1:PORT"
 *   node playbook/writing-quality/pilot-9A.2/run-pilot.mjs
 *
 * Behavior (Sprint 8E product contract):
 *   - Deterministic order: golden.scenarios array order (G01…G20)
 *   - Exactly one successful capture per scenario (no regeneration / cherry-pick)
 *   - Exactly one first-returned card per successful scenario (20 cards total)
 *   - Retry only if the HTTP attempt throws or returns non-OK / missing card
 *   - Never replaces a first valid 1-card response
 *   - Preserves the single draft + raw JSON
 *   - Guest and authenticated_body scenarios both POST scenario.request only
 *     (no x-user-id / recipientId — see authFidelity on golden set)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const goldenPath = path.join(root, "playbook", "writing-quality", "GOLDEN_SCENARIO_SET_V1.json");
const outDir = __dirname;
const ENDPOINT = "/api/v2/generate-card";

function yyyymmdd(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function probeBase() {
  if (process.env.PILOT_BASE_URL) return process.env.PILOT_BASE_URL.replace(/\/$/, "");
  const ports = [3000, 5000, 8080];
  for (const p of ports) {
    const base = `http://127.0.0.1:${p}`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      // Probe with incomplete body — route should 400 before OpenAI if live.
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
      /* try next */
    }
  }
  return null;
}

/**
 * Single HTTP attempt. Returns { cards, raw } or throws.
 * Does not score, filter, or reorder cards.
 */
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
    /* keep raw text */
  }
  if (!res.ok) {
    const err = (json && (json.error || json.message)) || text.slice(0, 500) || `HTTP ${res.status}`;
    throw new Error(String(err));
  }
  if (!json?.cards || !Array.isArray(json.cards) || json.cards.length < 1) {
    throw new Error("Response missing card");
  }
  // Product contract: score the first returned card only (exactly one expected).
  const cards = json.cards.slice(0, 1).map((c) => ({
    tone: c.tone,
    text: c.text,
  }));
  return { cards, raw: json, httpStatus: res.status };
}

/**
 * At most one retry, and only after a failed attempt.
 * First valid 1-card response wins and is never overwritten.
 */
async function generateFirstValid(base, body) {
  try {
    const first = await postOnce(base, body);
    return { ok: true, ...first, error: null, attempts: 1 };
  } catch (e1) {
    try {
      const second = await postOnce(base, body);
      return { ok: true, ...second, error: null, attempts: 2, firstAttemptError: String(e1?.message || e1) };
    } catch (e2) {
      return {
        ok: false,
        cards: [],
        raw: null,
        error: String(e2?.message || e2),
        attempts: 2,
        firstAttemptError: String(e1?.message || e1),
      };
    }
  }
}

function toMd(corpus) {
  const lines = [
    `# Pilot 9A.2 Corpus`,
    ``,
    `- corpusId: ${corpus.corpusId}`,
    `- generatedAt: ${corpus.generatedAt}`,
    `- baseUrl: ${corpus.baseUrl || "(none)"}`,
    `- succeeded: ${corpus.scenarios.filter((s) => s.ok).length} / ${corpus.scenarios.length}`,
    `- failed: ${corpus.scenarios.filter((s) => !s.ok).map((s) => s.id).join(", ") || "(none)"}`,
    ``,
    `Each successful scenario preserves exactly one first-returned card.`,
    `No regeneration after a valid capture. No cherry-picking.`,
    ``,
  ];
  for (const s of corpus.scenarios) {
    lines.push(
      `## ${s.id}${s.title ? ` — ${s.title}` : ""}`,
      ``,
      `- flow: ${s.flow}`,
      `- occasion: ${s.occasion}`,
      `- relationship: ${s.relationship}`,
      `- authFidelity: ${s.authFidelity || "n/a"}`,
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
  console.log("OPENAI/AI_INTEGRATIONS key present in this process:", keyPresent);
  console.log("(api-server process must also have the key)");

  const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
  const date = yyyymmdd();

  const base = await probeBase();
  if (!base) {
    const blocker =
      "BLOCKER: No reachable server for POST /api/v2/generate-card on PILOT_BASE_URL or ports 3000/5000/8080.";
    console.error(blocker);
    process.exitCode = 2;
    const corpus = {
      corpusId: `pilot-9A.2-${date}`,
      generatedAt: new Date().toISOString(),
      status: "blocked",
      blocker,
      scenarios: golden.scenarios.map((s) => ({
        id: s.id,
        title: s.title,
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
    fs.writeFileSync(path.join(outDir, "CORPUS.md"), `# Pilot 9A.2 Corpus\n\n**BLOCKED**\n\n${blocker}\n`);
    fs.writeFileSync(path.join(outDir, "BLOCKER.md"), blocker + "\n");
    return;
  }

  console.log("Using base:", base);
  const results = [];

  for (const s of golden.scenarios) {
    console.log(`[${s.id}] generating (1 request; retry only on failure)...`);
    const r = await generateFirstValid(base, s.request);
    console.log(`[${s.id}] ${r.ok ? "ok" : "FAIL"} attempts=${r.attempts} ${r.error || ""}`);
    results.push({
      id: s.id,
      title: s.title,
      flow: s.flow,
      authFidelity: s.authFidelity || null,
      contextRichness: s.contextRichness || null,
      occasion: s.axes?.occasion || s.request.occasion,
      relationship: s.axes?.relationship || s.request.relationship,
      request: s.request,
      ok: r.ok,
      error: r.error,
      attempts: r.attempts,
      firstAttemptError: r.firstAttemptError || null,
      cards: r.cards,
      raw: r.raw,
    });
  }

  const corpus = {
    corpusId: `pilot-9A.2-${date}`,
    generatedAt: new Date().toISOString(),
    status: "complete",
    baseUrl: base,
    endpoint: ENDPOINT,
    notes: [
      "One successful generation per scenario; exactly one first-returned card preserved.",
      "20 scenarios → up to 20 scored texts (failed requests recorded separately).",
      "authenticated_body scenarios use request body only (no recipient context assembly).",
      "No scoring or filtering in the runner.",
    ],
    scenarios: results,
  };
  fs.writeFileSync(path.join(outDir, "CORPUS.json"), JSON.stringify(corpus, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "CORPUS.md"), toMd(corpus));
  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).map((r) => r.id);
  console.log(`Done. succeeded=${ok} failed=${fail.join(",") || "none"}`);
  console.log(`Wrote ${path.join(outDir, "CORPUS.json")}`);
  console.log(`Wrote ${path.join(outDir, "CORPUS.md")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
