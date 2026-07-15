# Review Workflow — Writing Quality (Sprint 9A+)

**Framework:** Writing Evaluation Framework V1, frozen  
**Purpose:** Make writing review repeatable and gate prompt work behind measured patterns.  
**Applies to:** Golden Scenario Set v1 and later golden set versions.  
**Does not authorize:** Production code, architecture, packing, Brain, Event Domain, or performance changes.

**One-card baseline scope:** Score each successful first-returned card only. Multi-draft comparison tags (`P-TRIPLE-ECHO`, `Q-VERSION-ANGLES`) are outside one-card baseline scope — use them only when evaluating Rewrite / New Version / multi-draft sets.  
**`authenticated_body`:** Means relAnswers body-path only (request body), not full recipient-memory assembly.

---

## 0. Preconditions

- [ ] Sprint 8 generation behavior frozen for the batch.  
- [ ] Assets present: golden JSON, scorecard, pattern ledger.  
- [ ] Reviewers agree to scoring anchors in `EVALUATION_SCORECARD.md`.  
- [ ] No prompt edits planned during scoring itself.  
- [ ] **API access:** `AI_INTEGRATIONS_OPENAI_API_KEY` or `OPENAI_API_KEY` available to the api-server process (optional `AI_INTEGRATIONS_OPENAI_BASE_URL`).  
- [ ] **Server up:** api-server listening; set `PILOT_BASE_URL=http://127.0.0.1:<PORT>` if not on 3000/5000/8080.  
- [ ] **Runner:** `node playbook/writing-quality/pilot-9A.2/run-pilot.mjs` (sequential; one retry; first success only — no cherry-pick regenerations).  
- [ ] **Scoring sheet:** copy rows into `SCORES_TEMPLATE.csv` (or equivalent). Exclude `N/A` humor cells from soft means.

---

## 1. Generation

1. Load `GOLDEN_SCENARIO_SET_V1.json`.  
2. For each scenario, call `POST /api/v2/generate-card` with `request` as body (auth fixtures may use body-only `relAnswers` for pilot).  
3. Persist raw response: `scenario_id`, timestamp, env, the single first-returned text, any `_qualityScore` if present.  
4. Do not cherry-pick regenerations. If a call fails, log and retry once; note retries. Failed requests are recorded separately from successful cards.  
5. Freeze the corpus ID (e.g. `pilot-9A.2-YYYYMMDD`).

**Output:** 20 scenarios × 1 card = **20 texts** for the pilot (fewer if some requests fail).

---

## 2. Reviewer calibration

1. Pick **3–6 scenarios** spanning guest/auth and funny/sympathy/professional.  
2. Each reviewer scores independently with the scorecard.  
3. Meet for 20–30 minutes:  
   - Align Hard Fail thresholds.  
   - Align what “3” vs “4” means.  
   - Confirm pattern IDs for any disputed tags.  
4. Only then score the remaining corpus.

If reviewers diverge by >1.0 soft mean on >30% of calibration cards, stop and recalibrate before full pilot.

---

## 3. Scoring

For each successful first-returned card (up to 20):

1. Complete Hard Fail checklist.  
2. Score soft dims 1–20 (N/A humor when not requested; N/A dim 13 when no supporting detail was supplied; dim 20 = send readiness).  
3. Answer **Would I actually send this?**  
4. Apply pattern tags (negative and positive). Omit multi-draft tags on one-card baseline runs.  
5. Capture short notes + optional opening/closing quotes.

**Pilot expectation:** Score **every successful first-returned card** (20 when all succeed). Do not regenerate. Do not score manual Rewrite / New Version paths in the baseline corpus.

---

## 4. Aggregation

Compute at batch level:

| Metric | Definition |
|--------|------------|
| HF rate | Cards with any Hard Fail / total scored |
| HF-SUBJECT rate | Subject fails / cards with primary |
| Send-yes rate | Would-send Yes / total |
| Soft mean | Average soft score (non-N/A) |
| Dim leaders / laggards | Lowest mean dimensions |
| Pattern frequency | Tag counts from ledger |

Produce a one-page **Pilot Findings Brief**:

1. Top 5 negative patterns (frequency × severity).  
2. Top 3 positive patterns to protect.  
3. Worst packs (occasion × relationship).  
4. HF list with scenario IDs.  
5. Explicit: **no prompt change yet** — candidates only.

---

## 5. When a pattern deserves prompt work (gate to 9B)

A pattern may enter Sprint 9B backlog only if **all** of the following hold:

1. **Frequency:** Appears on **≥15%** of scored cards **or** ≥4 distinct scenarios.  
2. **Severity:** Rated **S1 or S2** (S3 waits unless tied to send-no spikes).  
3. **Evidence:** At least **3 concrete quotes** stored with scenario IDs.  
4. **Not already fixed:** Blank “Fixed in sprint” (or prior fix failed retest).  
5. **Hypothesis:** One clear likely cause that is addressable by **writing-prompt** change (not architecture).  
6. **Owner:** Named follow-up (9B.x).

**Do not** open 9B for:

- Single embarrassing live card with no pattern match  
- Preference disputes without score agreement  
- Performance, infra, or Brain ideas  
- “Make it sound nicer” without ledger IDs

---

## 6. After 9B changes (preview)

1. Re-generate **at least** the golden scenarios that exhibited the target pattern (prefer full G01–G20).  
2. Re-score blind when possible.  
3. Update ledger frequency + “Fixed in sprint”.  
4. Confirm HF-SUBJECT and send-yes did not regress.

---

## 7. Roles

| Role | Responsibility |
|------|----------------|
| Generator | Runs frozen payloads; stores corpus |
| Reviewer(s) | Scorecards + tags |
| Aggregator | Metrics + findings brief |
| Decision | Approves 9B backlog from gate above |

---

## 8. Artifacts produced by a completed pilot

- Corpus archive (texts + metadata)  
- Filled score rows (sheet or CSV)  
- Updated `PATTERN_LEDGER.md` frequencies  
- `PILOT_FINDINGS_9A2.md` (create when 9A.2 runs)
