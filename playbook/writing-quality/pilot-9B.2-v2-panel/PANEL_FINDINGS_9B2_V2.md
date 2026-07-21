# Framework V1 — Targeted Panel Findings (Sprint 9B.2 Attempt 2)

**Corpus ID:** `pilot-9B.2-v2-panel-20260720`  
**Production implementation:** `b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4`  
**Harness commit:** `c71eddca015f99f213e9fbff393c3756b2c5e6a7`  
**Branch:** `frontend-rebuild`  
**Status:** **COMPLETE — 7/7 scored · Framework V1 methodology unchanged · Determination FAIL**  
**Scored:** 2026-07-20  
**Reviewer:** Cursor evaluator (single-pass)  
**Baseline for comparison:** Accepted Sprint 9B.1 V2 (`pilot-9B.1-v2/`)  
**Rules honored:** No regeneration. No Rewrite / New Version. No production or prompt edits during scoring. No card alteration. No Framework V1 scorecard mutation. Frozen `pilot-9B.1-v2/` and `pilot-9B.2-v1/` evidence untouched.

---

## 0. Corpus verification (pre-score)

| Check | Result |
|-------|--------|
| `CORPUS.json` status | `complete` |
| `evaluationEligible` | `true` |
| `notForScoring` | `false` |
| `provenance.productionImplementationCommit` | `b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4` |
| Scenario count | **7** |
| Scenario IDs (order) | **G11, G13, G02, G04, G07, G17, G16** (exact) |
| Attempts per scenario | **1** each |
| Cards per scenario | **1** first-returned card each |
| Guest / `authenticated_body` vs golden | **Match** (5 guest / 2 auth) |
| Frozen 9B.1 V2 corpus (`pilot-9B.1-v2/`) | **Unchanged** (last commit `cc81c648`) |
| Frozen 9B.2 attempt 1 FAIL evidence (`pilot-9B.2-v1/`) | **Unchanged** (last commit `828d01e1`) |

---

## 1. Panel summary

Sprint 9B.2 attempt 2’s body/sign-off boundary brief **did not clear the G11 target**. The model swapped `I really appreciate it` (attempt 1) for `I'm genuinely grateful you took those calls` (attempt 2) on the same line as `Thanks again — Taylor`, preserving the gratitude stack and `P-UNIFORM-SENTENCES`. Middle-body quality improved slightly (+0.27 soft mean vs accepted V2), but **Would Send remains No**.

Protectors mostly held: **G04** and **G16** flat; **G02** gate-off control unchanged; **G17** within hold band. **G13** remains warm, specific, support-rich, and Would Send Yes, but soft mean dipped **−0.11** (marginally outside the −0.10 panel gate). **G07** dipped **−0.16** (marginally outside the −0.15 planned hold band).

No Hard Fails. **P-AI-CLAIMS = 0** across the panel.

**Determination: FAIL.** Do **not** run the full frozen G01–G20 evaluation. **Abandon Sprint 9B.2 attempt 2.** Do **not** recommend another prompt attempt.

---

## 2. Aggregate metrics

| Metric | Panel (9B.2 attempt 2) | Accepted 9B.1 V2 (same 7 IDs) |
|--------|--------------------------|-------------------------------|
| Panel soft mean | **4.40** | **4.41** |
| Would Send | **6/7 = 86%** | **6/7 = 86%** |
| Hard Fails | **0** | **0** |
| P-AI-CLAIMS | **0** | **0** |

Would-not-send: **G11** only (unchanged from V2).

---

## 3. Per-scenario scores

| ID | Soft mean | Would Send | HF | Tags | Δ vs 9B.1 V2 |
|----|-----------|------------|-----|------|--------------|
| G11 | **3.83** | **No** | No | Q-DEED-EARLY, Q-REGISTER-TIGHT, **P-UNIFORM-SENTENCES** | **+0.27** |
| G13 | **4.84** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **−0.11** |
| G02 | **3.28** | Yes | No | Q-DEED-EARLY, Q-HONEST-SPARSE, P-UNIFORM-SENTENCES | **0** |
| G04 | **4.89** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **0** |
| G07 | **4.63** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE | **−0.16** |
| G17 | **4.79** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **−0.10** |
| G16 | **4.53** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **0** |

---

## 4. G11 deep dive (primary target)

### Exact generated text

```
Sam—thank you for covering my client calls last Thursday so I could make the school pickup.
Knowing the calls were handled let me take care of that pickup without scrambling, and everything stayed on track.
If you ever need coverage, I'm glad to return the favor.
I'm genuinely grateful you took those calls. Thanks again — Taylor
```

### Would Send

**No** (unchanged from accepted V2 and attempt 1).

### P-UNIFORM-SENTENCES

**Present.** Opening thank-you deed, final-body gratitude synonym, and gratitude-bearing sign-off still form a uniform thank-stack rhythm.

### Final body sentence before sign-off

**Sentence:** `I'm genuinely grateful you took those calls.`  
**Sign-off:** `Thanks again — Taylor` (same line as final body sentence)

| Synonym check | Present? |
|---------------|----------|
| thank | No |
| thanks | No |
| appreciate | No |
| **grateful** | **Yes** |

**Gate result:** final body sentence **contains a gratitude synonym** → **FAIL**.

### Body gratitude stack

**Not gone.** Stack = opening thank-you + final-body `grateful` + sign-off `Thanks again`.

### vs attempt 1 (failed full corpus)

| Field | Attempt 1 | Attempt 2 |
|-------|-----------|-----------|
| Soft mean | 3.83 | 3.83 |
| Would Send | No | No |
| P-UNIFORM-SENTENCES | Yes | Yes |
| Final pre-sign-off line | `I really appreciate it.` | `I'm genuinely grateful you took those calls.` |
| Middle body | `That coverage took real pressure off...` | `Knowing the calls were handled...` (slightly more concrete) |

Attempt 2 improved middle specificity but **did not fix the boundary violation** — the model substituted one banned synonym for another.

---

## 5. G13 review (protector)

**Card:** Reading-confidence primary; hide-behind-hair → volunteer-to-read proof retained; warm family sign-off.

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Warmth (d15) | 5 | Warm parent voice throughout |
| Support use (d13) | 5 | Hair/volunteer detail proves the primary claim |
| Specificity (d14) | 5 | Concrete before/after contrast |
| Send readiness (d20) | 5 | Would send as-is |

**Would Send: Yes.** Qualitatively still warm, specific, and support-rich. Soft mean **4.84** vs V2 **4.95** (−0.11) — **marginally outside** the −0.10 panel hold gate by 0.01.

---

## 6. Hold-band review (G02, G04, G07, G17, G16)

| ID | Role | V2 | Panel | Δ | Send | Hold gate | Pass? |
|----|------|----|-------|---|------|-----------|-------|
| G02 | Gate-off control | 3.28 | 3.28 | 0 | Yes | n/a | ✓ |
| G04 | Protect HOLD | 4.89 | 4.89 | 0 | Yes | −0.10 | ✓ |
| G07 | Protect HOLD | 4.79 | 4.63 | −0.16 | Yes | −0.15 | ✗ (by 0.01) |
| G17 | Protect HOLD | 4.89 | 4.79 | −0.10 | Yes | −0.15 | ✓ |
| G16 | Send-flip hold | 4.53 | 4.53 | 0 | Yes | Would Send Yes | ✓ |

G07 and G17 remain send-ready; G07’s earned close is thinner than V2’s sleep-past-sunrise line but not a functional regression.

---

## 7. Hard Fail and P-AI-CLAIMS

| Check | Result |
|-------|--------|
| Hard Fails (any scenario) | **0** |
| P-AI-CLAIMS (any scenario) | **0** |

---

## 8. Targeted panel PASS gate

| Gate criterion | Result |
|----------------|--------|
| G11 Would Send = Yes | ✗ **No** |
| G11 final body sentence before sign-off has no gratitude synonym | ✗ **grateful present** |
| G11 body gratitude stack gone | ✗ **stack remains** |
| G13 warm, specific, support-rich, Would Send | ✓ |
| G04 within −0.10 of accepted V2 | ✓ (0) |
| G13 within −0.10 of accepted V2 | ✗ (−0.11) |
| G07 within planned hold band (−0.15) | ✗ (−0.16) |
| G17 within planned hold band (−0.15) | ✓ (−0.10) |
| G16 Would Send Yes | ✓ |
| Hard Fails = 0 | ✓ |
| P-AI-CLAIMS = 0 | ✓ |

**Gate failures: 5** (G11 send, G11 gratitude synonym, G11 stack, G13 hold, G07 hold).

---

## 9. Determination and recommendations

| Question | Answer |
|----------|--------|
| Targeted panel result | **FAIL** |
| Run full 20-scenario G01–G20 evaluation? | **No** |
| Abandon Sprint 9B.2 attempt 2? | **Yes** |
| Recommend another prompt attempt? | **No** |

Revert production to accepted 9B.1 V2 baseline (`2aab24385168438b12500e33d23443d662d75a63`) before any further sprint work.

---

## 10. Artifacts

| File | Purpose |
|------|---------|
| `PANEL_SCORES_9B2_V2.csv` | Per-scenario Framework V1 scores |
| `PANEL_AGGREGATES_9B2_V2.json` | Verification, aggregates, gate booleans |
| `PANEL_FINDINGS_9B2_V2.md` | This report |
| `PANEL_COMPARISON_9B2_V2.md` | Panel vs 9B.1 V2 and G11 vs attempt 1 |
