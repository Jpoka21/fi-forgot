# Framework V1 — Targeted Panel Findings (Sprint 9B.2 Attempt 3)

**Corpus ID:** `pilot-9B.2-v3-panel-20260721`  
**Production implementation:** `38e1d74fd3a2825703b78d9638877bf8743fd395`  
**Harness commit:** `8edb1df9ea1410f13c97cef0d744553a9167df1c`  
**Branch:** `frontend-rebuild`  
**Status:** **COMPLETE — 7/7 scored · Framework V1 methodology unchanged · Determination FAIL**  
**Scored:** 2026-07-21  
**Reviewer:** Cursor evaluator (single-pass)  
**Baseline for comparison:** Accepted Sprint 9B.1 V2 (`pilot-9B.1-v2/`)  
**Rules honored:** No regeneration. No Rewrite / New Version. No production or prompt edits during scoring. No card alteration. No Framework V1 scorecard mutation. Frozen `pilot-9B.1-v2/` and `pilot-9B.2-v1/` evidence untouched.

**Historical evidence note:** Sprint 9B.2 Attempt 2 raw `CORPUS.json` was lost during an earlier blocked Attempt 3 run. Attempt 2 scored `PANEL_*_9B2_V2` artifacts remain preserved and authoritative for Attempt 2.

---

## 0. Corpus verification (pre-score)

| Check | Result |
|-------|--------|
| `CORPUS.json` status | `complete` |
| `evaluationEligible` | `true` |
| `notForScoring` | `false` |
| `provenance.productionImplementationCommit` | `38e1d74fd3a2825703b78d9638877bf8743fd395` |
| `provenance.harnessCommit` | `8edb1df9ea1410f13c97cef0d744553a9167df1c` |
| Scenario count | **7** |
| Scenario IDs (order) | **G11, G13, G02, G04, G07, G17, G16** (exact) |
| Attempts per scenario | **1** each |
| Cards per scenario | **1** first-returned card each |
| Guest / `authenticated_body` vs golden | **Match** (5 guest / 2 auth) |
| Frozen 9B.1 V2 corpus (`pilot-9B.1-v2/`) | **Unchanged** |

**Pre-score verdict: ELIGIBLE — scoring proceeded.**

---

## 1. Panel summary

Sprint 9B.2 attempt 3’s deterministic post-process **cleared the G11 primary target**. The redundant final-body gratitude sentence was stripped; the three-part gratitude stack is gone; G11 **Would Send flipped to Yes** (+0.50 soft mean vs accepted V2).

However, the frozen targeted panel gate still **FAILS** on two marginal hold-band scenarios that also failed attempt 2:

- **G13** soft mean **4.84** vs V2 **4.95** (−0.11; gate allows −0.10 max)
- **G07** soft mean **4.63** vs V2 **4.79** (−0.16; gate allows −0.15 max)

Protectors otherwise held: **G04** flat at 4.89; **G17** flat at 4.89; **G16** Would Send Yes at 4.58 (+0.05); **G02** gate-off control unchanged at 3.28.

No Hard Fails. **P-AI-CLAIMS = 0** across the panel. Panel soft mean **4.45** vs V2 panel **4.41** (+0.04). Would Send **7/7 (100%)** vs V2 **6/7 (86%)**.

**Determination: FAIL.** Do **not** run the full frozen G01–G20 evaluation. **Permanently close Sprint 9B.2.** Keep Sprint 9B.1 V2 as the accepted production writing baseline.

---

## 2. Aggregate metrics

| Metric | Panel (9B.2 attempt 3) | Accepted 9B.1 V2 (same 7 IDs) |
|--------|------------------------|-------------------------------|
| Panel soft mean | **4.45** | **4.41** |
| Would Send | **7/7 (100%)** | **6/7 (86%)** |
| Hard Fails | **0** | **0** |
| P-AI-CLAIMS | **0** | **0** |

Would-not-send: **none** (G11 flipped from No to Yes).

---

## 3. Per-scenario scores

| ID | Soft mean | Would Send | HF | Tags | Δ vs 9B.1 V2 |
|----|-----------|------------|-----|------|--------------|
| G11 | **4.06** | **Yes** | No | Q-DEED-EARLY, Q-REGISTER-TIGHT | **+0.50** |
| G13 | **4.84** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **−0.11** |
| G02 | **3.28** | Yes | No | Q-DEED-EARLY, Q-HONEST-SPARSE, P-UNIFORM-SENTENCES | **0** |
| G04 | **4.89** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **0** |
| G07 | **4.63** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE | **−0.16** |
| G17 | **4.89** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-SPOKEN-RHYTHM, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **0** |
| G16 | **4.58** | Yes | No | Q-DEED-EARLY, Q-SUPPORT-AS-COLOR, Q-EARNED-CLOSE, Q-REGISTER-TIGHT | **+0.05** |

---

## 4. G11 deep dive (primary target — CLEARED)

### Exact generated text

```
Sam — thank you for covering my client calls last Thursday so I could make the school pickup.
It let me get there on time while knowing those clients weren’t left waiting. Thanks again — Taylor
```

### Would Send

**Yes** (flipped from No in accepted V2 and both prior 9B.2 attempts).

### Final body sentence before sign-off

**Sentence:** `It let me get there on time while knowing those clients weren’t left waiting.`  
**Sign-off:** `Thanks again — Taylor` (same line)

| Synonym check | Present? |
|---------------|----------|
| thank | No |
| thanks | No |
| appreciate | No |
| grateful | No |

**Gate result:** final body sentence **contains no gratitude synonym** → **PASS**.

### Body gratitude stack

**Gone.** Structure = opening deed-thank + practical-effect middle + sign-off thanks. No redundant final-body gratitude restatement. **P-UNIFORM-SENTENCES cleared.**

### vs attempt 2 (prompt-only)

| Field | Attempt 2 | Attempt 3 |
|-------|-----------|-----------|
| Intervention | Hard body/sign-off brief | Deterministic post-process strip |
| Final pre-sign-off line | `I'm genuinely grateful you took those calls.` | `It let me get there on time while knowing those clients weren't left waiting.` |
| Gratitude synonym in final body | **Yes (grateful)** | **No** |
| Stack | Yes | **No** |
| Would Send | No | **Yes** |
| Soft mean | 3.83 | **4.06** |

Post-process achieved what two prompt attempts could not.

---

## 5. G13 review (protector — marginal hold fail)

**Card:** Reading-confidence primary; hide-behind-hair → volunteer-to-read proof retained; warm family sign-off.

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Warmth (d15) | 5 | Warm parent voice throughout |
| Support use (d13) | 5 | Hair/volunteer detail proves the primary claim |
| Specificity (d14) | 5 | Concrete before/after contrast |
| Send readiness (d20) | 5 | Would send as-is |

**Would Send: Yes.** Qualitatively still warm, specific, and support-rich. Soft mean **4.84** vs V2 **4.95** (−0.11) — **marginally outside** the −0.10 panel hold gate by 0.01. Same numeric outcome as attempt 2 panel.

---

## 6. Hold-band review (G02, G04, G07, G17, G16)

| ID | Role | V2 | Panel | Δ | Send | Hold gate | Pass? |
|----|------|----|-------|---|------|-----------|-------|
| G02 | Gate-off control | 3.28 | 3.28 | 0 | Yes | n/a | ✓ |
| G04 | Protect HOLD | 4.89 | 4.89 | 0 | Yes | −0.10 | ✓ |
| G07 | Protect HOLD | 4.79 | 4.63 | −0.16 | Yes | −0.15 | ✗ (by 0.01) |
| G17 | Protect HOLD | 4.89 | 4.89 | 0 | Yes | −0.15 | ✓ |
| G16 | Send-flip hold | 4.53 | 4.58 | +0.05 | Yes | Would Send Yes | ✓ |

G07 remains send-ready; earned close is thinner than V2’s sleep-past-sunrise line. G17 recovered to V2 peak (attempt 2 had dipped to 4.79).

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
| G11 Would Send = Yes | ✓ |
| G11 final body no gratitude synonym | ✓ |
| G11 body gratitude stack gone | ✓ |
| G13 warm, specific, support-rich, Would Send | ✓ |
| G04 within −0.10 of accepted V2 | ✓ (0) |
| G13 within −0.10 of accepted V2 | ✗ (−0.11) |
| G07 within −0.15 hold band | ✗ (−0.16) |
| G17 within −0.15 hold band | ✓ (0) |
| G16 Would Send Yes | ✓ |
| Hard Fails = 0 | ✓ |
| P-AI-CLAIMS = 0 | ✓ |

**Gate failures: 2** (G13 hold, G07 hold).

---

## 9. Determination and recommendations

| Question | Answer |
|----------|--------|
| Targeted panel result | **FAIL** |
| Run full 20-scenario G01–G20 evaluation? | **No** |
| Permanently close Sprint 9B.2? | **Yes** |
| Recommend Attempt 4? | **No** |
| Accepted production baseline | **Sprint 9B.1 V2** (`2aab24385168438b12500e33d23443d662d75a63`) |

G11 target cleared via post-process, but the frozen panel gate requires **all** criteria including hold bands. Two scenarios marginally outside hold bands (same as attempt 2) block panel PASS.

---

## 10. Artifacts

| File | Purpose |
|------|---------|
| `PANEL_SCORES_9B2_V3.csv` | Per-scenario Framework V1 scores |
| `PANEL_AGGREGATES_9B2_V3.json` | Verification, aggregates, gate booleans |
| `PANEL_FINDINGS_9B2_V3.md` | This report |
| `PANEL_COMPARISON_9B2_V3.md` | Panel vs 9B.1 V2 and attempt 2 |
