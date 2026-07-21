# Targeted Panel Comparison — Sprint 9B.2 Attempt 3 vs Baselines

**Panel corpus:** `pilot-9B.2-v3-panel-20260721`  
**Production under test:** `38e1d74fd3a2825703b78d9638877bf8743fd395`  
**Accepted V2 baseline:** `pilot-9B.1-v2/` (`2aab24385168438b12500e33d23443d662d75a63`)  
**Attempt 2 scored reference:** `pilot-9B.2-v2-panel/PANEL_*_9B2_V2` (raw CORPUS.json unavailable — historical incident)  
**Scorecard:** Writing Evaluation Framework V1 (unchanged)  
**Scoring date:** 2026-07-21  

---

## 1. Headline panel metrics

| Metric | Accepted 9B.1 V2 (7 IDs) | 9B.2 Attempt 3 Panel | Δ |
|--------|----------------------------|----------------------|---|
| Panel soft mean | **4.41** | **4.45** | **+0.04** |
| Would Send | **6/7 (86%)** | **7/7 (100%)** | **+1** |
| Hard Fails | **0** | **0** | 0 |
| P-AI-CLAIMS | **0** | **0** | 0 |

Would-not-send: **none** (G11 flipped from No to Yes).

---

## 2. Per-scenario comparison vs accepted 9B.1 V2

| ID | Flow | V2 mean | Panel mean | Δ | Send V2 | Send Panel | Gate role | Panel gate |
|----|------|---------|------------|---|---------|------------|-----------|------------|
| G11 | guest | 3.56 | 4.06 | **+0.50** | No | **Yes** | Primary target | ✓ |
| G13 | guest | 4.95 | 4.84 | **−0.11** | Yes | Yes | Protect HOLD | ✗ (−0.10 band) |
| G02 | guest | 3.28 | 3.28 | 0 | Yes | Yes | Gate-off control | ✓ |
| G04 | guest | 4.89 | 4.89 | 0 | Yes | Yes | Protect HOLD | ✓ |
| G07 | guest | 4.79 | 4.63 | **−0.16** | Yes | Yes | Protect HOLD | ✗ (−0.15 band) |
| G17 | auth_body | 4.89 | 4.89 | 0 | Yes | Yes | Protect HOLD | ✓ |
| G16 | auth_body | 4.53 | 4.58 | **+0.05** | Yes | Yes | Send-flip hold | ✓ |

---

## 3. Dimension highlights (largest panel deltas vs V2)

### G11 (+0.50) — primary target CLEARED

| Dimension | V2 | Panel | Δ | Note |
|-----------|----|-------|---|------|
| d02 Closing | 3 | 4 | +1 | Stack removed; clean sign-off landing |
| d04 Naturalness | 3 | 4 | +1 | Practical effect reads real |
| d20 Send readiness | 3 | 4 | +1 | Would Send flipped Yes |
| d15 Warmth | 3 | 3 | 0 | Brief but appropriate for coworker |

### G13 (−0.11) — qualitatively strong, numerically marginal

| Dimension | V2 | Panel | Δ | Note |
|-----------|----|-------|---|------|
| d19 Anti-AI | 5 | 4 | −1 | Slightly shorter; still no P-AI-CLAIMS |
| d17 Memorability | 5 | 5 | 0 | Hair/volunteer proof retained |

### G07 (−0.16) — send-ready, thinner close

| Dimension | V2 | Panel | Δ | Note |
|-----------|----|-------|---|------|
| d02 Closing | 5 | 4 | −1 | Sleep-past-sunrise earned close absent |
| d17 Memorability | 5 | 4 | −1 | Mile-18 held; close less vivid |

### G16 (+0.05) — send hold improved

Profile color (“stubborn-in-the-best-way”) woven into hold detail; concrete steadier close.

---

## 4. G11 direct comparison — attempt 3 vs attempt 2 vs V2

| Field | V2 (9B.1) | Attempt 2 | Attempt 3 |
|-------|-----------|-----------|-----------|
| Intervention | Baseline | Prompt brief | Post-process strip |
| Soft mean | 3.56 | 3.83 | **4.06** |
| Would Send | No | No | **Yes** |
| P-UNIFORM-SENTENCES | Yes | Yes | **No** |
| HF | 0 | 0 | 0 |
| P-AI-CLAIMS | 0 | 0 | 0 |

### Generated text side-by-side

**V2 (9B.1):**
```
Sam — Thank you for covering my client calls last Thursday so I could make the school pickup. I know stepping into client conversations takes extra focus, and you handled the calls so nothing stalled.
I really appreciate you making that school pickup possible. Thanks again — Taylor
```

**Attempt 2 (prompt-only):**
```
Sam—thank you for covering my client calls last Thursday so I could make the school pickup.
Knowing the calls were handled let me take care of that pickup without scrambling, and everything stayed on track.
If you ever need coverage, I'm glad to return the favor.
I'm genuinely grateful you took those calls. Thanks again — Taylor
```

**Attempt 3 (post-process):**
```
Sam — thank you for covering my client calls last Thursday so I could make the school pickup.
It let me get there on time while knowing those clients weren't left waiting. Thanks again — Taylor
```

### Boundary analysis

| Check | V2 | Attempt 2 | Attempt 3 |
|-------|----|-----------|-----------|
| Final body sentence before sign-off | `I really appreciate you making that school pickup possible.` | `I'm genuinely grateful you took those calls.` | `It let me get there on time while knowing those clients weren't left waiting.` |
| Contains thank/thanks/appreciate/grateful | **appreciate** | **grateful** | **none** |
| Body gratitude stack | Yes | Yes | **No** |
| Would Send | No | No | **Yes** |

**Conclusion:** Attempt 3 post-process achieved the G11 boundary fix that prompt-only attempts 1 and 2 could not.

---

## 5. Protector trajectory (9B.1 V2 → attempt 2 panel → attempt 3 panel)

| ID | 9B.1 V2 | Attempt 2 panel | Attempt 3 panel | Trend |
|----|---------|-----------------|-----------------|-------|
| G04 | 4.89 | 4.89 | 4.89 | Flat ✓ |
| G13 | 4.95 | 4.84 | 4.84 | Stable dip (−0.11) |
| G07 | 4.79 | 4.63 | 4.63 | Stable dip (−0.16) |
| G17 | 4.89 | 4.79 | 4.89 | Recovered to V2 |
| G16 | 4.53 | 4.53 | 4.58 | Slight improvement |
| G11 | 3.56 (No) | 3.83 (No) | **4.06 (Yes)** | **Target cleared** |

Post-process did not regress protectors; G17 recovered. G13/G07 hold-band failures are generation-variance stable across attempts 2 and 3.

---

## 6. Targeted panel PASS gate summary

| Criterion | Pass? |
|-----------|-------|
| G11 Would Send = Yes | ✓ |
| G11 final body no gratitude synonym | ✓ |
| G11 body gratitude stack gone | ✓ |
| G13 warm + Would Send | ✓ |
| G04 within −0.10 | ✓ |
| G13 within −0.10 | ✗ |
| G07 hold band (−0.15) | ✗ |
| G17 hold band (−0.15) | ✓ |
| G16 Would Send Yes | ✓ |
| HF = 0 | ✓ |
| P-AI-CLAIMS = 0 | ✓ |

**Overall: FAIL**

---

## 7. Recommendations

1. **Do not** run the full frozen G01–G20 evaluation on attempt 3 production.
2. **Permanently close** Sprint 9B.2; revert to accepted 9B.1 V2 production baseline.
3. **Do not** recommend Attempt 4 — three attempts (two prompt, one post-process) still fail the frozen panel gate due to marginal hold-band variance on G13/G07.
4. G11 post-process is validated as effective for the gratitude-stack boundary but insufficient alone to earn full corpus evaluation under the frozen gate.
