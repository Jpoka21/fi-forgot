# Sprint 9A.2 — Pilot Findings

**Corpus ID:** `pilot-9A.2-20260715`  
**HEAD:** `b213acfccc05e6cbb29775210c67aa4a379b446c`  
**Status:** **COMPLETE — 20/20 scored · Framework V1 frozen · Sprint 9A complete**  
**Scored:** 2026-07-15  
**Reviewer:** Cursor evaluator (single-pass)  
**Writing contract:** Sprint 8A–8G frozen  
**Rules honored:** No regeneration. No Rewrite / New Version. No production or prompt edits. No Sprint 9B implementation.

---

## 0. Corpus verification

| Check | Result |
|-------|--------|
| HEAD = `b213acf…` | Yes |
| `CORPUS.json` status | `complete` |
| Scenarios | 20 |
| Successful with exactly 1 nonempty card | **20 / 20** |
| Attempts per scenario | **1** (no retries) |
| Failures | **0** |

---

## 1. Pilot summary

Frozen Sprint 8 one-card generation performed well on the Golden Set. Subject retention and support-as-color were strong where support was supplied. Main soft weaknesses were **rhythm / template cadence** (esp. professional thank-you) and occasional **gratitude-essay / “I see it” closings** on richer heartfelt thank-yous. Humor sparse-context and romantic/anniversary cards were among the best.

No Hard Fails. Send-yes **18 / 20 (90%)**. Overall soft mean **4.38** (median **4.49**).

---

## 2. Aggregate metrics

| Metric | Value |
|--------|--------|
| Soft mean (excl. N/A) | **4.38** |
| Soft median | **4.49** |
| Send-yes rate | **18/20 = 90%** |
| HF any | **0/20 = 0%** |
| Guest mean (n=14) | **4.35** |
| Authenticated_body mean (n=6) | **4.48** |

### Dimension averages (1–5; N/A excluded)

| # | Dimension | Mean |
|---|-----------|------|
| 1 | Opening | 4.40 |
| 2 | Closing | 4.20 |
| 3 | Emotional progression | 3.95 |
| 4 | Naturalness | 4.35 |
| 5 | Authenticity | 4.50 |
| 6 | Sentence rhythm | **3.75** (laggard) |
| 7 | Voice consistency | 4.65 |
| 8 | Occasion fit | **4.85** |
| 9 | Relationship fit | **4.85** |
| 10 | Tone fidelity | 4.60 |
| 11 | Emotional level fidelity | 4.35 |
| 12 | Primary subject clarity | **4.85** |
| 13 | Supporting-detail use* | **5.00** |
| 14 | Specificity | 4.55 |
| 15 | Warmth | 4.05 |
| 16 | Humor† | 5.00 |
| 17 | Memorability | 4.05 |
| 18 | Read-aloud | 4.35 |
| 19 | Anti-AI texture | **4.00** |
| 20 | Overall send-readiness‡ | 4.35 |

\*Only scored when support was supplied (otherwise N/A).  
†Only scored when tone = Funny (G03, G14).  
‡Scorecard holistic send-readiness (CSV column `d20_send_readiness`; not version differentiation — single-card corpus).

### By occasion (soft mean)

| Occasion | Mean | n |
|----------|------|---|
| Anniversary | 4.89 | 2 |
| Graduation | 4.89 | 1 |
| Sympathy | 4.78 | 1 |
| Congrats | 4.64 | 2 |
| Apology | 4.63 | 2 |
| Holiday | 4.67 | 1 |
| Birthday | 4.34 | 3 |
| Get Well | 4.22 | 1 |
| Just Because | 4.17 | 1 |
| Thank You | **3.99** | 5 |
| Thinking Of You | **3.67** | 1 |

### By relationship (soft mean)

| Relationship | Mean | n |
|--------------|------|---|
| Teacher | 4.95 | 1 |
| Wife | 4.89 | 1 |
| Son | 4.79 | 1 |
| Husband | 4.68 | 2 |
| Sister | 4.65 | 1 |
| Friend | 4.58 | 3 |
| Daughter | 4.53 | 2 |
| Boss | 4.50 | 1 |
| Dad | 4.44 | 2 |
| Coworker | **3.86** | 2 |
| Mom | **3.83** | 3 |
| Grandparent | **3.67** | 1 |

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

---

## 4. Strongest / weakest scenarios

### Strongest (soft mean)
| ID | Mean | Notes |
|----|------|-------|
| G13 Teacher thank-you | 4.95 | Reading primary + hair→volunteer support |
| G04 Wife anniversary | 4.89 | Ordinary Tuesdays + toast |
| G17 Husband anniversary | 4.89 | Errands + stove/fries; deep, long |
| G19 Daughter graduation | 4.89 | Diploma + project + community |
| G07 Son marathon | 4.79 | Mile-18 text as color |

### Weakest (soft mean)
| ID | Mean | Send | Notes |
|----|------|------|-------|
| G02 Mom Simple thank-you | 3.28 | Yes | Clear subject; repetitive/flat Simple |
| G11 Coworker thank-you | 3.50 | **No** | Deed clear; triple-thank template |
| G10 Grandparent thinking of you | 3.67 | Yes | Honest sparse; flat |
| G16 Auth Mom insurance thank-you | 3.84 | **No** | Subject+hold OK; essay / I-see close |
| G03 Friend Funny birthday | 4.16 | Yes | Meta humor works; lowest among still-strong cards |

Would-not-send: **G11**, **G16**.

---

## 5. Pattern frequencies (pilot)

### Positive (protect)
| ID | Count | Rate |
|----|-------|------|
| Q-DEED-EARLY | 17 | 85% |
| Q-REGISTER-TIGHT | 12 | 60% |
| Q-SUPPORT-AS-COLOR | 11 | 55% |
| Q-EARNED-CLOSE | 10 | 50% |
| Q-HONEST-SPARSE | 8 | 40% |
| Q-SPOKEN-RHYTHM | 8 | 40% |
| Q-HUMOR-LANDS | 2 | 10% (of Funny: 2/2) |

### Negative (measure for later 9B priority)
| ID | Count | Rate | Severity band |
|----|-------|------|---------------|
| P-LENGTH-BLOAT | 4 | 20% | S2–S3 |
| P-AI-CLAIMS | 3 | 15% | S2 |
| P-UNIFORM-SENTENCES | 2 | 10% | S2 |
| P-GRATITUDE-ESSAY | 1 | 5% | S2 |

**Not observable this pilot (single first card):** `P-TRIPLE-ECHO`, `Q-VERSION-ANGLES`.

**Absent this pilot:** `P-SUPPORT-HIJACK`, `P-OPEN-THIS-ONE`, `P-NAMELESS-DEED`, `P-LOWCTX-INVENT`, `P-SYMPATHY-CHEER`, `P-PROF-LEAK`, `P-SIGN-OFF-DRIFT` (no HF-class hits).

---

## 6. Common strengths

1. Primary deed named early and concretely (insurance, marathon, VP, reading, etc.).  
2. Supplied support retained as subordinate color when present (8G contract behaving).  
3. Relationship register usually right (boss/coworker/teacher/sympathy).  
4. Sign-offs preserved exactly.  
5. Sparse/funny cards generally refuse invented shared history.

---

## 7. Common weaknesses

1. **Rhythm / template thank-you** stacking the same deed (G11, mild G02).  
2. **Heartfelt thank-you essay closings** + “I see it” cadence (G16, mild G08/G19).  
3. **Length** on rich romantic/auth gratitude when profile details accumulate (G17, G16).  
4. Sparse Thinking-of-you / Simple packs can feel flat without inventing (acceptable tradeoff).  
5. Dim lagging: rhythm (3.75), anti-AI (4.00), progression (3.95), memorability (4.05).

---

## 8. Evaluator ambiguity / calibration notes

1. **Dim 20 vs CSV:** Scorecard defines dim 20 as holistic **send-readiness**; older CSV name implied version-diff. Scoring used send-readiness (`d20_send_readiness`). Document clearly for V1 freeze.  
2. **Dim 13 with no support:** Scored **N/A** (not punished for omitting invent). Confirm in scorecard.  
3. **Warmth on Just Funny:** Low mush is correct fidelity; scored high on emotional-level fidelity rather than forcing high warmth.  
4. **Single-reviewer pass:** No dual calibration round; absolute 1–5 anchors used from scorecard table. Recommend optional second reviewer on G02/G11/G16 calibration set later.  
5. **Auth fidelity:** G15–G20 are `authenticated_body` (relAnswers only), not full recipient-context supplement — trends are body-path only.

---

## 9. Framework freeze (complete)

| Asset | Status |
|-------|--------|
| Golden Scenario Set | **V1 frozen** |
| Evaluation Scorecard | **V1 frozen** (dim13 N/A + dim20 send-readiness documented) |
| Pattern Ledger | **V1 frozen** (pilot frequencies filled) |
| Review Workflow | **V1 frozen** |
| Overall Writing Evaluation Framework | **Writing Evaluation Framework V1, frozen** |

**Sprint 9A is complete.** Scoring results above are unchanged by freeze documentation.

---

## 10. Documentation clarifications included in freeze (no score changes)

1. Dimension 13 is **N/A** when no supporting detail was supplied.  
2. Dimension 20 means **send readiness** for the one-card baseline (not version differentiation).  
3. Multi-draft comparison tags (`P-TRIPLE-ECHO`, `Q-VERSION-ANGLES`) are outside one-card baseline scope.  
4. `authenticated_body` means relAnswers body-path only, not full recipient memory.  

Optional later: second-reviewer calibration subset (G02, G11, G13, G16) before large 9B retests.

**Do not recommend production prompt improvements in this findings file beyond identifying measured patterns.**

---

## 11. May Sprint 9B begin?

**Planning may begin** after this freeze commit. **Do not implement Sprint 9B prompt changes in the 9A freeze commit.**

Rationale for later 9B kickoff:

- 20/20 scored baseline exists  
- Pattern frequencies × severity are measurable  
- Gate was “no anecdote-only prompt edits”; that gate is now satisfied  

Highest-severity recurring soft targets for later 9B (not executed here): **P-UNIFORM-SENTENCES / length on professional thank-you**, **P-AI-CLAIMS / P-GRATITUDE-ESSAY on rich heartfelt thank-you**. Protect **Q-DEED-EARLY**, **Q-SUPPORT-AS-COLOR**, **Q-REGISTER-TIGHT**.

---

## 12. Artifacts produced by scoring

| Path | Role |
|------|------|
| `playbook/writing-quality/SCORES_TEMPLATE.csv` | 20 scored rows |
| `playbook/writing-quality/PILOT_FINDINGS_9A2.md` | This file |
| `playbook/writing-quality/PATTERN_LEDGER.md` | Frequencies updated |
| `playbook/writing-quality/pilot-9A.2/SCORING_AGGREGATES.json` | Machine aggregates |
| `playbook/writing-quality/pilot-9A.2/score-corpus.mjs` | Disposable scoring helper (eval-only) |
