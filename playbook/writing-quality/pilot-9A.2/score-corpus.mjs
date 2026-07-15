import fs from "fs";

/** d20 = overall send-readiness per EVALUATION_SCORECARD (not version-diff). null = N/A */
const rows = [
  { id: "G01", flow: "guest", occ: "Thank You", rel: "Mom", d: [4, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 5, 5, 5, 4, null, 4, 4, 4, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-EARNED-CLOSE,Q-REGISTER-TIGHT", notes: "Insurance named early; fight support as brief color; muted heartfelt close." },
  { id: "G02", flow: "guest", occ: "Thank You", rel: "Mom", d: [3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, null, 3, 3, null, 2, 3, 3, 3], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-HONEST-SPARSE,P-UNIFORM-SENTENCES", notes: "Subject clear under Simple; repeats insurance; process line generic not fabricated memory." },
  { id: "G03", flow: "guest", occ: "Birthday", rel: "Friend", d: [4, 4, 3, 4, 4, 4, 5, 5, 4, 5, 5, 4, null, 3, 4, 5, 4, 4, 4, 4], hf: "", send: "Yes", tags: "Q-HUMOR-LANDS,Q-HONEST-SPARSE,Q-SPOKEN-RHYTHM", notes: "Meta-status humor fits Just Funny; no invented shared history." },
  { id: "G04", flow: "guest", occ: "Anniversary", rel: "Wife", d: [5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, null, 5, 5, 4, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-SPOKEN-RHYTHM,Q-EARNED-CLOSE,Q-REGISTER-TIGHT", notes: "Ordinary Tuesdays dominant; toast callback subordinate; deep without cheese." },
  { id: "G05", flow: "guest", occ: "Holiday", rel: "Dad", d: [5, 4, 4, 5, 5, 4, 5, 5, 5, 5, 4, 5, null, 5, 4, null, 4, 5, 5, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-EARNED-CLOSE,Q-REGISTER-TIGHT,Q-HONEST-SPARSE", notes: "Storm drive named immediately; Christmas table anchored; warm not mushy." },
  { id: "G06", flow: "guest", occ: "Sympathy", rel: "Friend", d: [5, 5, 4, 5, 5, 4, 5, 5, 5, 5, 5, 5, null, 4, 5, null, 4, 5, 5, 5], hf: "", send: "Yes", tags: "Q-REGISTER-TIGHT,Q-EARNED-CLOSE,Q-HONEST-SPARSE", notes: "Loss acknowledged; practical offers without cheerleading or invented past." },
  { id: "G07", flow: "guest", occ: "Congratulations", rel: "Son", d: [5, 5, 4, 5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 5, 4, null, 5, 5, 5, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-SPOKEN-RHYTHM,Q-EARNED-CLOSE", notes: "Marathon + mile-18 text; pride without lecture." },
  { id: "G08", flow: "guest", occ: "Apology", rel: "Husband", d: [4, 4, 5, 4, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, null, 4, 4, 3, 4], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,P-AI-CLAIMS,P-LENGTH-BLOAT", notes: "Owns snap + Saturday intent; slight I-see-it claim and length." },
  { id: "G09", flow: "guest", occ: "Just Because", rel: "Daughter", d: [4, 4, 4, 4, 4, 3, 4, 5, 5, 4, 4, 5, null, 5, 4, null, 4, 4, 4, 4], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-REGISTER-TIGHT", notes: "Pancake mornings center; quiet Sunday close; mild thank framing for missing." },
  { id: "G10", flow: "guest", occ: "Thinking Of You", rel: "Grandparent", d: [3, 4, 3, 4, 4, 3, 4, 4, 4, 4, 4, 4, null, 3, 4, null, 3, 4, 4, 3], hf: "", send: "Yes", tags: "Q-HONEST-SPARSE,Q-REGISTER-TIGHT", notes: "Honest sparse; a bit flat/repetitive but invent-free." },
  { id: "G11", flow: "guest", occ: "Thank You", rel: "Coworker", d: [4, 3, 3, 3, 3, 2, 3, 5, 5, 4, 4, 5, null, 5, 3, null, 3, 3, 2, 3], hf: "", send: "No", tags: "Q-DEED-EARLY,Q-REGISTER-TIGHT,P-UNIFORM-SENTENCES,P-LENGTH-BLOAT", notes: "Deed clear and professional; nearly triple-thank template cadence." },
  { id: "G12", flow: "guest", occ: "Congratulations", rel: "Boss", d: [5, 4, 3, 5, 5, 4, 5, 5, 5, 5, 4, 5, null, 4, 3, null, 4, 5, 5, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-REGISTER-TIGHT,Q-EARNED-CLOSE,Q-HONEST-SPARSE", notes: "VP + run-a-room; tight professional distance." },
  { id: "G13", flow: "guest", occ: "Thank You", rel: "Teacher", d: [5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, null, 5, 5, 5, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-SPOKEN-RHYTHM,Q-EARNED-CLOSE,Q-REGISTER-TIGHT", notes: "Reading confidence primary; hair-to-volunteer support as proof." },
  { id: "G14", flow: "guest", occ: "Birthday", rel: "Sister", d: [5, 4, 4, 5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 5, 3, 5, 5, 5, 4, 5], hf: "", send: "Yes", tags: "Q-HUMOR-LANDS,Q-SUPPORT-AS-COLOR,Q-DEED-EARLY,Q-SPOKEN-RHYTHM", notes: "Sideways caller + tacos/zero advice; roast-boundary respected." },
  { id: "G15", flow: "authenticated_body", occ: "Birthday", rel: "Dad", d: [3, 4, 4, 4, 5, 4, 5, 4, 5, 4, 4, 4, 5, 5, 4, null, 4, 4, 4, 4], hf: "", send: "Yes", tags: "Q-SUPPORT-AS-COLOR,Q-DEED-EARLY,Q-REGISTER-TIGHT", notes: "Teach-fix + sink color; birthday delayed one line; coffee/hardware profile used lightly." },
  { id: "G16", flow: "authenticated_body", occ: "Thank You", rel: "Mom", d: [4, 3, 4, 3, 4, 3, 4, 5, 5, 4, 4, 5, 5, 5, 4, null, 3, 3, 2, 3], hf: "", send: "No", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,P-GRATITUDE-ESSAY,P-AI-CLAIMS,P-LENGTH-BLOAT", notes: "Insurance + hold retained; essay close softens send." },
  { id: "G17", flow: "authenticated_body", occ: "Anniversary", rel: "Husband", d: [5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, null, 5, 5, 4, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-SPOKEN-RHYTHM,Q-EARNED-CLOSE,Q-REGISTER-TIGHT,P-LENGTH-BLOAT", notes: "Errands primary; stove + fries color; deep without cheese; long." },
  { id: "G18", flow: "authenticated_body", occ: "Get Well", rel: "Coworker", d: [5, 4, 3, 4, 4, 4, 5, 5, 5, 4, 4, 5, null, 4, 4, null, 4, 4, 4, 4], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-REGISTER-TIGHT,Q-HONEST-SPARSE", notes: "Surgery recovery + coffee from primary; deadline reliability as light close." },
  { id: "G19", flow: "authenticated_body", occ: "Graduation", rel: "Daughter", d: [5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, null, 5, 5, 4, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-SPOKEN-RHYTHM,Q-EARNED-CLOSE,P-AI-CLAIMS", notes: "Diploma + senior project + quieter-classmate weave; mild I-see cadence." },
  { id: "G20", flow: "authenticated_body", occ: "Apology", rel: "Friend", d: [5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 4, null, 4, 5, 5, 5], hf: "", send: "Yes", tags: "Q-DEED-EARLY,Q-SUPPORT-AS-COLOR,Q-EARNED-CLOSE,Q-SPOKEN-RHYTHM,Q-HONEST-SPARSE", notes: "Owns cancel; corner-table detail once; clean make-good offer." },
];

function softMean(d) {
  const v = d.filter((x) => x != null);
  return v.reduce((a, b) => a + b, 0) / v.length;
}

const corpus = JSON.parse(fs.readFileSync("playbook/writing-quality/pilot-9A.2/CORPUS.json", "utf8"));
const richness = Object.fromEntries(corpus.scenarios.map((s) => [s.id, s.contextRichness]));
const corpusId = corpus.corpusId;
const reviewer = "Cursor evaluator (single-pass)";
const date = "2026-07-15";

const header =
  "corpus_id,reviewer,date,scenario_id,flow,occasion,relationship,context_richness,version,hf_any,hf_codes,d01_opening,d02_closing,d03_emotion_prog,d04_naturalness,d05_authenticity,d06_rhythm,d07_voice,d08_occasion,d09_relationship,d10_tone,d11_emotional_level,d12_primary_clarity,d13_support_use,d14_specificity,d15_warmth,d16_humor,d17_memorability,d18_read_aloud,d19_anti_ai,d20_send_readiness,soft_mean,send_yes,tags,notes_short";

function csvEscape(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

const lines = [header];
for (const r of rows) {
  const mean = softMean(r.d);
  const cells = [
    corpusId,
    csvEscape(reviewer),
    date,
    r.id,
    r.flow,
    csvEscape(r.occ),
    r.rel,
    richness[r.id] || "",
    "Draft",
    r.hf ? "Yes" : "No",
    r.hf || "",
    ...r.d.map((x) => (x == null ? "N/A" : x)),
    mean.toFixed(2),
    r.send,
    csvEscape(r.tags),
    csvEscape(r.notes),
  ];
  lines.push(cells.join(","));
}
fs.writeFileSync("playbook/writing-quality/SCORES_TEMPLATE.csv", lines.join("\n") + "\n");

const means = rows.map((r) => softMean(r.d)).sort((a, b) => a - b);
const avg = means.reduce((a, b) => a + b, 0) / means.length;
const med = (means[9] + means[10]) / 2;
const dimAvgs = [];
for (let i = 0; i < 20; i++) {
  const vals = rows.map((r) => r.d[i]).filter((x) => x != null);
  dimAvgs.push(vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null);
}
const sendYes = rows.filter((r) => r.send === "Yes").length;
const tagCount = {};
for (const r of rows) for (const t of r.tags.split(",")) tagCount[t] = (tagCount[t] || 0) + 1;

function mean(a) {
  return a.reduce((x, y) => x + y, 0) / a.length;
}
const byFlow = { guest: [], authenticated_body: [] };
const byOcc = {};
const byRel = {};
for (const r of rows) {
  const m = softMean(r.d);
  byFlow[r.flow].push(m);
  (byOcc[r.occ] ||= []).push(m);
  (byRel[r.rel] ||= []).push(m);
}
const ranked = [...rows].sort((a, b) => softMean(b.d) - softMean(a.d));

const agg = {
  verify: {
    status: corpus.status,
    n: corpus.scenarios.length,
    ok: rows.length,
    attemptsUnique: [...new Set(corpus.scenarios.map((s) => s.attempts))],
  },
  overall: { mean: avg, median: med, send_rate: sendYes / 20, hf_any: 0 },
  dimAvgs: dimAvgs.map((x) => (x == null ? null : +x.toFixed(2))),
  byFlow: { guest: mean(byFlow.guest), authenticated_body: mean(byFlow.authenticated_body) },
  byOcc: Object.fromEntries(Object.entries(byOcc).map(([k, v]) => [k, +mean(v).toFixed(2)])),
  byRel: Object.fromEntries(Object.entries(byRel).map(([k, v]) => [k, +mean(v).toFixed(2)])),
  strongest: ranked.slice(0, 5).map((r) => ({ id: r.id, mean: +softMean(r.d).toFixed(2) })),
  weakest: ranked.slice(-5).reverse().map((r) => ({ id: r.id, mean: +softMean(r.d).toFixed(2), send: r.send })),
  tags: Object.entries(tagCount).sort((a, b) => b[1] - a[1]),
};

fs.writeFileSync(
  "playbook/writing-quality/pilot-9A.2/SCORING_AGGREGATES.json",
  JSON.stringify(agg, null, 2) + "\n",
);
console.log(JSON.stringify(agg, null, 2));
