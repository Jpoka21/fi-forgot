# Framework V2 — Pilot Findings (Sprint 9B.1)

**Corpus ID:** `pilot-9B.1-v2-20260720`  
**Production implementation:** `2aab24385168438b12500e33d23443d662d75a63`  
**Harness commit:** `6bcf6e71d45b31afd16fb2db680688a7a34ad656`  
**Branch:** `frontend-rebuild`  
**Status:** **COMPLETE — 20/20 scored · Framework V1 methodology unchanged · Determination PASS**  
**Scored:** 2026-07-20  
**Reviewer:** Cursor evaluator (single-pass)  
**Writing contract:** Sprint 9B.1 closing discipline + GPT-5 generate token budget 8000  
**Rules honored:** No regeneration. No Rewrite / New Version. No production or prompt edits during scoring. No card alteration. No Framework V1 scorecard mutation. No Sprint 9B.2 work.

---

## 0. Corpus verification (pre-score)

| Check | Result |
|-------|--------|
| `CORPUS.json` status | `complete` |
| `evaluationEligible` | `true` |
| `provenance.productionImplementationCommit` | `2aab24385168438b12500e33d23443d662d75a63` |
| Scenario count | **20** |
| Scenario IDs | **G01–G20** (exact) |
| Attempts per scenario | **1** each |
| Cards per scenario | **1** first-returned card each |
| Guest / `authenticated_body` vs golden | **Match** (14 guest / 6 auth) |
| Frozen V1 corpus (`pilot-9A.2/`) | **Unchanged** (not overwritten) |
| Frozen V1 baseline scores | **Unchanged** (`SCORES_TEMPLATE.csv` / 9A.2 aggregates) |

---

## 1. Pilot summary

Sprint 9B.1’s closing-discipline change did what it was scoped to do: **abstract “I see it” / gratitude-essay closings dropped** on the target set, while **protected high performers held flat**.

- **G16** flipped **Would Send No → Yes** (+0.69 soft mean) with concrete coverage close and no `P-AI-CLAIMS` / `P-GRATITUDE-ESSAY`.
- **G08** cleared `P-AI-CLAIMS` with a concrete reset close (+0.37).
- **G19** cleared the soft `P-AI-CLAIMS` tag; diploma close is concrete (+0.06).
- **Protect panel G13 / G07 / G04 / G17:** soft means **unchanged** (4.95 / 4.79 / 4.89 / 4.89).
- **G11** remains **Would Send No** (thank-stack rhythm) — expected residual for **9B.2**, not a 9B.1 closing failure.
- **G10** is the only material soft regression (−0.39): still invent-free and send-yes, but thinner/flatter than V1.

No Hard Fails. Aggregate up is real, and it is **not** purchased by protected-scenario regression.

**Determination: PASS.** Sprint 9B.1 may officially close. Sprint 9B.2 may begin for professional thank-you rhythm (`P-UNIFORM-SENTENCES` on G11). **Do not** run further closing-prompt tuning from this evidence alone.

---

## 2. Aggregate metrics

| Metric | V2 | V1 frozen baseline |
|--------|----|--------------------|
| Soft mean (excl. N/A) | **4.43** | 4.38 |
| Soft median | **4.59** | 4.49 |
| Send-yes rate | **19/20 = 95%** | 18/20 = 90% |
| HF any | **0/20 = 0%** | 0/20 |
| Guest mean (n=14) | **4.36** | 4.35 |
| Authenticated_body mean (n=6) | **4.61** | 4.48 |

Would-not-send: **G11** only (was G11 + G16).

### Dimension averages (1–5; N/A excluded)

| # | Dimension | V2 | V1 |
|---|-----------|----|----|
| 1 | Opening | 4.55 | 4.40 |
| 2 | Closing | **4.40** | 4.20 |
| 3 | Emotional progression | 3.90 | 3.95 |
| 4 | Naturalness | 4.40 | 4.35 |
| 5 | Authenticity | 4.55 | 4.50 |
| 6 | Sentence rhythm | 3.85 | 3.75 |
| 7 | Voice consistency | 4.70 | 4.65 |
| 8 | Occasion fit | 4.85 | 4.85 |
| 9 | Relationship fit | 4.85 | 4.85 |
| 10 | Tone fidelity | 4.60 | 4.60 |
| 11 | Emotional level fidelity | 4.35 | 4.35 |
| 12 | Primary subject clarity | 4.85 | 4.85 |
| 13 | Supporting-detail use* | 5.00 | 5.00 |
| 14 | Specificity | 4.45 | 4.55 |
| 15 | Warmth | 4.05 | 4.05 |
| 16 | Humor† | 5.00 | 5.00 |
| 17 | Memorability | 4.05 | 4.05 |
| 18 | Read-aloud | 4.40 | 4.35 |
| 19 | Anti-AI texture | **4.30** | 4.00 |
| 20 | Overall send-readiness | **4.50** | 4.35 |

\*Only scored when support was supplied.  
†Only scored when tone = Funny (G03, G14).

Largest dim moves: **closing +0.20**, **anti-AI +0.30**, **send-readiness +0.15** — consistent with the closing-discipline intent.

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

Sign-offs matched golden strings. Primary subjects retained. No invent / support-hijack Hard Fails observed.

---

## 4. Strongest / weakest scenarios

### Strongest (soft mean)
| ID | Mean | Notes |
|----|------|-------|
| G13 Teacher thank-you | 4.95 | Protect HOLD |
| G19 Daughter graduation | 4.95 | Target clear; concrete diploma close |
| G04 Wife anniversary | 4.89 | Protect HOLD |
| G17 Husband anniversary | 4.89 | Protect HOLD; tighter than V1 |
| G08 Husband apology | 4.84 | Target clear; reset close |

### Weakest (soft mean)
| ID | Mean | Send | Notes |
|----|------|------|-------|
| G10 Grandparent thinking of you | 3.28 | Yes | Soft regression vs V1 3.67 |
| G02 Mom Simple thank-you | 3.28 | Yes | Flat Simple (unchanged) |
| G11 Coworker thank-you | 3.56 | **No** | Thank-stack rhythm (9B.2) |
| G03 Friend Funny birthday | 4.16 | Yes | Meta humor OK |
| G18 Coworker get well | 4.22 | Yes | Sparse professional care OK |

---

## 5. Pattern frequencies (V2)

### Positive (protect)
| ID | Count | Rate | V1 |
|----|-------|------|----|
| Q-DEED-EARLY | 17 | 85% | 17 |
| Q-EARNED-CLOSE | **14** | **70%** | 10 |
| Q-REGISTER-TIGHT | **14** | **70%** | 12 |
| Q-SUPPORT-AS-COLOR | 11 | 55% | 11 |
| Q-HONEST-SPARSE | 8 | 40% | 8 |
| Q-SPOKEN-RHYTHM | 8 | 40% | 8 |
| Q-HUMOR-LANDS | 2 | 100% of Funny | 2 |

### Negative
| ID | Count | Rate | V1 |
|----|-------|------|----|
| P-UNIFORM-SENTENCES | 2 | 10% | 2 |
| P-AI-CLAIMS | **0** | **0%** | 3 |
| P-GRATITUDE-ESSAY | **0** | **0%** | 1 |
| P-LENGTH-BLOAT | **0** | **0%** | 4 |

**Absent this pilot (same class as V1):** `P-SUPPORT-HIJACK`, `P-OPEN-THIS-ONE`, `P-NAMELESS-DEED`, `P-LOWCTX-INVENT`, `P-SYMPATHY-CHEER`, `P-PROF-LEAK`, `P-SIGN-OFF-DRIFT`.

---

## 6. Closing-quality changes

| ID | V1 close issue | V2 close | Verdict |
|----|----------------|----------|---------|
| G08 | “I see it…” claim | Concrete Saturday reset | Cleared |
| G16 | Essay + “I see it / won’t forget” | Coverage set / breathe easier | Cleared; send flipped |
| G19 | Mild “I see…” cadence + thesis next-step | Hold diploma / take a breath | Cleared soft tag |
| G01/G05/G07/G13/G17 | Already strong | Remained concrete / earned | Protected |

Closing dim mean **4.20 → 4.40**. `Q-EARNED-CLOSE` **10 → 14**.

---

## 7. Protected-strength review

| ID | V1 mean | V2 mean | Δ | Tags of interest | Verdict |
|----|---------|---------|---|------------------|---------|
| G13 | 4.95 | 4.95 | 0 | Deed + support + register | **HOLD** |
| G07 | 4.79 | 4.79 | 0 | Mile-18 color + earned close | **HOLD** |
| G04 | 4.89 | 4.89 | 0 | Ordinary Tuesdays + toast | **HOLD** |
| G17 | 4.89 | 4.89 | 0 | Errands + stove/fries; shorter | **HOLD** (length bloat gone) |

No material protected regression. Primary subject and support retention held on support-supplied protectors.

---

## 8. Reliability review

| Check | Result |
|-------|--------|
| Generation success | 20 / 20 |
| Retries | 0 (attempts = 1) |
| First card only | Yes |
| Empty / parse-fail cards | None in corpus |
| Guest vs auth request fidelity | Matches golden |
| Scoring regeneration | None |

Reliability of the evaluated production SHA is **acceptable** for closing this framework run.

---

## 9. Common strengths

1. Primary deed named early and concretely.  
2. Support retained as subordinate color when supplied.  
3. Closings more often deed/occasion-tied instead of abstract insight claims.  
4. Relationship register still right on boss / coworker / teacher / sympathy.  
5. Sign-offs exact; no invent Hard Fails.

---

## 10. Common weaknesses

1. **Professional thank-you rhythm** (G11) still stacks thank / appreciate / thanks again — **9B.2**.  
2. **Sparse Thinking-of-you** can go too thin (G10 regression).  
3. **Simple** Mom thank-you remains flat (G02) — acceptable for Simple, not a new close bug.  
4. Dim lagging: rhythm **3.85**, progression **3.90**, memorability / warmth **4.05**.

---

## 11. Determination

### PASS / MIXED / FAIL → **PASS**

Rationale (skeptical gate):

- 9B.1 target patterns (`P-AI-CLAIMS`, secondary essay/length on heartfelt thank-you) **cleared** on G08 / G16 / G19.  
- **G16 Would Send flipped** without inventing or losing subject/support.  
- **Protected panel flat** — aggregate gain is not bought by G13/G07/G04/G17 regression.  
- G10 soft regression is real but **not** a protected-scenario failure and does not reintroduce HF / invent.  
- G11 still No-send is **out of 9B.1 closing scope** (rhythm / uniform sentences → 9B.2).

**Not sufficient alone would have been:** mean +0.05 with G16 still No and/or protectors down. That did **not** happen.

### Can Sprint 9B.1 officially close?
**Yes.**

### Should Sprint 9B.2 begin?
**Yes — for professional thank-you rhythm (`P-UNIFORM-SENTENCES` / G11), not for more closing-prompt tuning.**

Do **not** recommend additional closing-discipline prompt edits from this V2 evidence.

---

## 12. Artifacts

| Path | Role |
|------|------|
| `playbook/writing-quality/pilot-9B.1-v2/SCORES_V2.csv` | 20 scored rows (V1 scorecard) |
| `playbook/writing-quality/pilot-9B.1-v2/SCORING_AGGREGATES.json` | Machine aggregates + deltas |
| `playbook/writing-quality/pilot-9B.1-v2/PILOT_FINDINGS_V2.md` | This file |
| `playbook/writing-quality/pilot-9B.1-v2/V1_V2_COMPARISON.md` | Side-by-side comparison |
| `playbook/writing-quality/pilot-9B.1-v2/score-corpus.mjs` | Disposable scorer (eval-only) |

Frozen V1 assets under `pilot-9A.2/` and `SCORES_TEMPLATE.csv` were **not** modified.
