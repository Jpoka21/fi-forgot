# Sprint 9B.2 — Pilot Findings

**Corpus ID:** `pilot-9B.2-v1-20260720`  
**Production implementation:** `0d47a18163c52a5c9f8773c86ccc3414c24b2e47`  
**Harness commit:** `f4493899a8016df98b7a8277c3972a18528f9124`  
**Branch:** `frontend-rebuild`  
**Status:** **COMPLETE — 20/20 scored · Framework V1 methodology unchanged · Determination FAIL**  
**Scored:** 2026-07-20  
**Reviewer:** Cursor evaluator (single-pass)  
**Writing contract:** Sprint 9B.2 temporary professional Thank You anti-gratitude-stack tip  
**Baseline for comparison:** accepted Sprint 9B.1 Framework V2 (`pilot-9B.1-v2/`, mean 4.43)  
**Rules honored:** No regeneration. No Rewrite / New Version. No production or prompt edits during scoring. No card alteration. No Framework V1 scorecard mutation. Frozen `pilot-9B.1-v2/` untouched.

---

## 0. Corpus verification (pre-score)

| Check | Result |
|-------|--------|
| `CORPUS.json` status | `complete` |
| `evaluationEligible` | `true` |
| `notForScoring` | `false` |
| `provenance.productionImplementationCommit` | `0d47a18163c52a5c9f8773c86ccc3414c24b2e47` |
| Scenario count | **20** |
| Scenario IDs | **G01–G20** (exact) |
| Attempts per scenario | **1** each |
| Cards per scenario | **1** first-returned card each |
| Guest / `authenticated_body` vs golden | **Match** (14 guest / 6 auth) |
| Frozen Sprint 9B.1 V2 results (`pilot-9B.1-v2/`) | **Unchanged** |

---

## 1. Pilot summary

Sprint 9B.2’s scoped target was **G11** (professional coworker Thank You): flip **Would Send No → Yes** and clear **`P-UNIFORM-SENTENCES`** (thank / appreciate / Thanks-again stack), without harming protected strength or reintroducing `P-AI-CLAIMS`.

**What moved**
- G11 soft mean improved **3.56 → 3.83 (+0.27)** with a better middle (practical pressure-off + reciprocal coverage offer).
- G11 **still Would Send No**.
- G11 **still tagged `P-UNIFORM-SENTENCES`** — closing remains `I really appreciate it` immediately before required sign-off `Thanks again — Taylor`, after an opening `thank you`.

**What held**
- Hard Fails **0**.
- Would Send overall **19/20 (95%)** — same as V2; only G11 remains No.
- G16 remains **Would Send Yes**.
- `P-AI-CLAIMS` remains **0**.
- G04 protect **HOLD** (4.89).
- G13 protect **soft HOLD** (4.95 → 4.89, −0.06); warmth 5, support-use 5, send-readiness 5.

**What slipped**
- G07 protect soft dip **4.79 → 4.63 (−0.16)** — marathon + mile-18 retained, but lost sleep-past-sunrise earned close color.
- G17 protect soft dip **4.89 → 4.74 (−0.15)** — errands + stove retained; fries joke dropped.
- G14 soft dip **4.65 → 4.50 (−0.15)** — sideways-caller line repeats.

Aggregate is slightly **down** vs V2 (4.42 vs 4.43). A higher aggregate was never the gate; the gate required a G11 send flip. That did not happen.

**Determination: FAIL.** Do **not** accept Sprint 9B.2. Do **not** make the temporary implementation permanent. Narrow further tuning of professional Thank You anti-stack (body appreciation before a thanks sign-off) is justified; do not broaden into unprotected closing / primary work from this evidence alone.

---

## 2. Aggregate metrics

| Metric | 9B.2 | 9B.1 V2 baseline |
|--------|------|------------------|
| Soft mean (excl. N/A) | **4.42** | 4.43 |
| Soft median | **4.51** | 4.59 |
| Send-yes rate | **19/20 = 95%** | 19/20 = 95% |
| HF any | **0/20 = 0%** | 0/20 |
| Guest mean (n=14) | **4.35** | 4.36 |
| Authenticated_body mean (n=6) | **4.57** | 4.61 |

Would-not-send: **G11** only (unchanged).

### Dimension averages (1–5; N/A excluded)

| # | Dimension | 9B.2 | V2 |
|---|-----------|------|----|
| 1 | Opening | 4.55 | 4.55 |
| 2 | Closing | 4.35 | 4.40 |
| 3 | Emotional progression | 3.90 | 3.90 |
| 4 | Naturalness | 4.45 | 4.40 |
| 5 | Authenticity | 4.60 | 4.55 |
| 6 | Sentence rhythm | 3.90 | 3.85 |
| 7 | Voice consistency | 4.75 | 4.70 |
| 8 | Occasion fit | 4.85 | 4.85 |
| 9 | Relationship fit | 4.85 | 4.85 |
| 10 | Tone fidelity | 4.60 | 4.60 |
| 11 | Emotional level fidelity | 4.35 | 4.35 |
| 12 | Primary subject clarity | 4.85 | 4.85 |
| 13 | Supporting-detail use* | 4.91 | 5.00 |
| 14 | Specificity | 4.40 | 4.45 |
| 15 | Warmth | 4.05 | 4.05 |
| 16 | Humor† | 5.00 | 5.00 |
| 17 | Memorability | 3.90 | 4.05 |
| 18 | Read-aloud | 4.40 | 4.40 |
| 19 | Anti-AI texture | 4.15 | 4.30 |
| 20 | Overall send-readiness | 4.45 | 4.50 |

\*Only scored when support was supplied.  
†Only scored when tone = Funny (G03, G14).

Largest soft dim moves vs V2: **anti-AI −0.15**, **memorability −0.15**, **support-use −0.09**, **closing −0.05**.

---

## 3. Hard Fail counts

| Code | Count | IDs |
|------|-------|-----|
| HF-SUBJECT | 0 | — |
| HF-FABRICATE | 0 | — |
| HF-LABEL | 0 | — |
| HF-BANNED | 0 | — |
| HF-SIGNOFF | 0 | — |
| HF-REL | 0 | — |
| HF-OCCASION | 0 | — |
| **Any HF** | **0 / 20** | — |

Sign-offs matched golden strings (including G11 required `Thanks again — Taylor`). Primary subjects retained. No invent / support-hijack Hard Fails.

---

## 4. G11 deep review (primary 9B.2 target)

**Card (first-returned):**
> Sam—thank you for covering my client calls last Thursday so I could make the school pickup.  
> That coverage took real pressure off a tight afternoon on my end.  
> If you ever need coverage, I’m glad to return the favor.  
> I really appreciate it. Thanks again — Taylor

| Field | 9B.2 | V2 |
|-------|------|----|
| Soft mean | **3.83** | 3.56 |
| Would Send | **No** | No |
| `P-UNIFORM-SENTENCES` | **Present** | Present |

**Dimensions (9B.2):** opening 4 · closing 3 · emotion 3 · naturalness 4 · authenticity 4 · rhythm 4 · voice 4 · occasion 5 · relationship 5 · tone 4 · emotional level 4 · primary clarity 5 · support N/A · specificity 4 · warmth 3 · humor N/A · memorability 3 · read-aloud 4 · anti-AI 3 · send-readiness 3

**Tags:** `Q-DEED-EARLY`, `Q-REGISTER-TIGHT`, **`P-UNIFORM-SENTENCES`**

**Read:** Middle is better than V2 (effect + reciprocity). Closing still stacks appreciation synonym against a thanks-bearing sign-off. That is the failure mode 9B.2 was meant to remove. **G11 did not lose `P-UNIFORM-SENTENCES`. Would Send remains No.**

---

## 5. Protected scenario review

| ID | Role | V2 | 9B.2 | Δ | Send | Result |
|----|------|----|------|---|------|--------|
| G13 Teacher thank-you | Protect | 4.95 | 4.89 | −0.06 | Yes | **Soft HOLD** — warmth 5, support-use 5, send-readiness 5; hair→volunteer proof retained |
| G07 Son marathon | Protect | 4.79 | 4.63 | −0.16 | Yes | **Soft dip** — deed + mile-18 held; lost sleep-past-sunrise close |
| G04 Wife anniversary | Protect | 4.89 | 4.89 | 0 | Yes | **HOLD** |
| G17 Husband anniversary | Protect | 4.89 | 4.74 | −0.15 | Yes | **Soft dip** — errands + stove held; fries color dropped |
| G16 Auth Mom thank-you | Prior flip | 4.53 | 4.53 | 0 | **Yes** | **HOLD send Yes**; no `P-AI-CLAIMS` / `P-GRATITUDE-ESSAY` |

G13 warmth / support / send-readiness: all **5**. Not a warmth collapse. Aggregate protect panel is **not** a clean four-way soft-mean HOLD (G07/G17 soft dips).

---

## 6. Strongest / weakest scenarios

### Strongest (soft mean)
| ID | Mean | Notes |
|----|------|-------|
| G04 Wife anniversary | 4.89 | Protect HOLD |
| G13 Teacher thank-you | 4.89 | Soft HOLD |
| G19 Daughter graduation | 4.89 | Concrete diploma close |
| G08 Husband apology | 4.84 | Clean reset; no I-see |
| G20 Friend apology | 4.79 | Owns cancel |

### Weakest (soft mean)
| ID | Mean | Send | Notes |
|----|------|------|-------|
| G02 Mom Simple thank-you | 3.28 | Yes | Flat Simple + `P-UNIFORM-SENTENCES` |
| G10 Grandparent thinking of you | 3.28 | Yes | Thin sparse (pre-existing) |
| G11 Coworker thank-you | 3.83 | **No** | Target incomplete |
| G03 Friend Funny birthday | 4.16 | Yes | Meta humor OK |
| G09 / G18 | 4.22 | Yes | Hold |

---

## 7. Pattern frequencies (9B.2)

### Positive
| ID | Count | Rate | V2 |
|----|-------|------|----|
| Q-DEED-EARLY | 17 | 85% | 17 |
| Q-EARNED-CLOSE | 14 | 70% | 14 |
| Q-REGISTER-TIGHT | 14 | 70% | 14 |
| Q-SUPPORT-AS-COLOR | 11 | 55% | 11 |
| Q-HONEST-SPARSE | 8 | 40% | 8 |
| Q-SPOKEN-RHYTHM | 8 | 40% | 8 |
| Q-HUMOR-LANDS | 2 | 100% of Funny | 2 |

### Negative
| ID | Count | Rate | V2 |
|----|-------|------|----|
| P-UNIFORM-SENTENCES | **2** (G02, G11) | 10% | 2 |
| P-AI-CLAIMS | **0** | **0%** | 0 |
| P-GRATITUDE-ESSAY | 0 | 0% | 0 |

---

## 8. Acceptance gate

| Criterion | Required | Result |
|-----------|----------|--------|
| G11 Would Send Yes | Yes | **FAIL** (still No) |
| G11 loses `P-UNIFORM-SENTENCES` | Yes | **FAIL** (still tagged) |
| Hard Fails remain 0 | Yes | **PASS** |
| G13 / G07 / G04 / G17 hold | Yes | **FAIL** (G07/G17 soft dips) |
| G16 remains Would Send Yes | Yes | **PASS** |
| `P-AI-CLAIMS` remains 0 | Yes | **PASS** |
| No material new regression | Yes | **FAIL** (G07 −0.16, G17 −0.15, G14 −0.15) |

**Overall determination: FAIL**

---

## 9. Recommendations

| Question | Answer |
|----------|--------|
| Accept Sprint 9B.2? | **No** |
| Make temporary implementation permanent? | **No** |
| Further prompt tuning justified? | **Yes — narrow.** Target body-level gratitude synonym before a thanks-bearing professional sign-off (G11). Re-protect G07/G17 color. Do not reopen closed 9B.1 closing work from this corpus alone. |
| Begin further tuning in this scoring pass? | **No** (stopped after scoring) |

---

## 10. Artifacts

| File | Path |
|------|------|
| Scores | `playbook/writing-quality/pilot-9B.2-v1/SCORES_9B2.csv` |
| Aggregates | `playbook/writing-quality/pilot-9B.2-v1/SCORING_AGGREGATES_9B2.json` |
| Comparison | `playbook/writing-quality/pilot-9B.2-v1/V2_9B2_COMPARISON.md` |
| Findings | this file |
