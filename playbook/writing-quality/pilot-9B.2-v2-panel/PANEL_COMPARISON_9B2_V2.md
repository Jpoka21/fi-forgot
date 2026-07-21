# Targeted Panel Comparison — Sprint 9B.2 Attempt 2 vs Baselines

**Panel corpus:** `pilot-9B.2-v2-panel-20260720`  
**Production under test:** `b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4`  
**Accepted V2 baseline:** `pilot-9B.1-v2/` (`2aab24385168438b12500e33d23443d662d75a63`)  
**Failed attempt 1 reference:** `pilot-9B.2-v1/` (`0d47a18163c52a5c9f8773c86ccc3414c24b2e47`)  
**Scorecard:** Writing Evaluation Framework V1 (unchanged)  
**Scoring date:** 2026-07-20  

---

## 1. Headline panel metrics

| Metric | Accepted 9B.1 V2 (7 IDs) | 9B.2 Attempt 2 Panel | Δ |
|--------|----------------------------|----------------------|---|
| Panel soft mean | **4.41** | **4.40** | **−0.01** |
| Would Send | **6/7 (86%)** | **6/7 (86%)** | 0 |
| Hard Fails | **0** | **0** | 0 |
| P-AI-CLAIMS | **0** | **0** | 0 |

Would-not-send unchanged: **G11 only**.

---

## 2. Per-scenario comparison vs accepted 9B.1 V2

| ID | Flow | V2 mean | Panel mean | Δ | Send V2 | Send Panel | Gate role | Panel gate |
|----|------|---------|------------|---|---------|------------|-----------|------------|
| G11 | guest | 3.56 | 3.83 | **+0.27** | No | **No** | Primary target | ✗ |
| G13 | guest | 4.95 | 4.84 | **−0.11** | Yes | Yes | Protect HOLD | ✗ (−0.10 band) |
| G02 | guest | 3.28 | 3.28 | 0 | Yes | Yes | Gate-off control | ✓ |
| G04 | guest | 4.89 | 4.89 | 0 | Yes | Yes | Protect HOLD | ✓ |
| G07 | guest | 4.79 | 4.63 | **−0.16** | Yes | Yes | Protect HOLD | ✗ (−0.15 band) |
| G17 | auth_body | 4.89 | 4.79 | **−0.10** | Yes | Yes | Protect HOLD | ✓ |
| G16 | auth_body | 4.53 | 4.53 | 0 | Yes | Yes | Send-flip hold | ✓ |

---

## 3. Dimension highlights (largest panel deltas vs V2)

### G11 (+0.27) — target NOT cleared

| Dimension | V2 | Panel | Δ | Note |
|-----------|----|-------|---|------|
| d04 Naturalness | 3 | 4 | +1 | Middle body more concrete |
| d05 Authenticity | 3 | 4 | +1 | Pickup/scramble detail reads real |
| d06 Rhythm | 3 | 4 | +1 | Better progression until final line |
| d02 Closing | 3 | 3 | 0 | Gratitude stack still blocks send |
| d20 Send readiness | 3 | 3 | 0 | Would Send No |

### G13 (−0.11) — qualitatively strong, numerically marginal

| Dimension | V2 | Panel | Δ | Note |
|-----------|----|-------|---|------|
| d18 Read aloud | 5 | 5 | 0 | |
| d19 Anti-AI | 5 | 4 | −1 | Slightly shorter; still no P-AI-CLAIMS |
| d17 Memorability | 5 | 4 | −1 | Confidence line slightly less peak |

### G07 (−0.16) — send-ready, thinner close

| Dimension | V2 | Panel | Δ | Note |
|-----------|----|-------|---|------|
| d02 Closing | 5 | 4 | −1 | Sleep-past-sunrise earned close absent |
| d17 Memorability | 5 | 4 | −1 | Mile-18 held; close less vivid |

### Flat holds (G02, G04, G16, G17 within band)

No material dimension movement on G02 (control), G04 (anniversary peak), G16 (mom thank-you send-flip), or G17 (anniversary auth_body).

---

## 4. G11 direct comparison — attempt 2 vs failed attempt 1

| Field | Attempt 1 (`pilot-9B.2-v1`) | Attempt 2 (panel) |
|-------|----------------------------|-------------------|
| Production commit | `0d47a181` | `b9bc2ac5` |
| Soft mean | 3.83 | 3.83 |
| Would Send | No | No |
| P-UNIFORM-SENTENCES | Yes | Yes |
| HF | 0 | 0 |
| P-AI-CLAIMS | 0 | 0 |

### Generated text side-by-side

**Attempt 1:**
```
Sam—thank you for covering my client calls last Thursday so I could make the school pickup.
That coverage took real pressure off a tight afternoon on my end.
If you ever need coverage, I'm glad to return the favor.
I really appreciate it. Thanks again — Taylor
```

**Attempt 2:**
```
Sam—thank you for covering my client calls last Thursday so I could make the school pickup.
Knowing the calls were handled let me take care of that pickup without scrambling, and everything stayed on track.
If you ever need coverage, I'm glad to return the favor.
I'm genuinely grateful you took those calls. Thanks again — Taylor
```

### Boundary analysis

| Check | Attempt 1 | Attempt 2 |
|-------|-----------|-----------|
| Final body sentence before sign-off | `I really appreciate it.` | `I'm genuinely grateful you took those calls.` |
| Contains thank/thanks/appreciate/grateful | **appreciate** | **grateful** |
| Sign-off on same line | Yes | Yes |
| Body gratitude stack | Yes | Yes |
| Brief intended effect | Ban appreciate before Thanks-again | Ban any gratitude synonym before gratitude sign-off |

**Conclusion:** Attempt 2 swapped synonyms without eliminating the stack. The hard body/sign-off boundary brief was **ignored at generation time** for the final pre-sign-off sentence.

---

## 5. Protector trajectory (9B.1 V2 → attempt 1 full → attempt 2 panel)

| ID | 9B.1 V2 | Attempt 1 full | Attempt 2 panel | Trend |
|----|---------|----------------|-----------------|-------|
| G04 | 4.89 | 4.89 | 4.89 | Flat ✓ |
| G13 | 4.95 | 4.95 | 4.84 | Slight dip (−0.11 vs V2) |
| G07 | 4.79 | 4.63 | 4.63 | Dip at attempt 1; stable attempt 2 |
| G17 | 4.89 | 4.79 | 4.79 | Dip at attempt 1; stable attempt 2 |
| G16 | 4.53 | 4.53 | 4.53 | Flat ✓ |

Protectors did not materially regress further between attempt 1 and attempt 2 on the overlapping scenarios. G11 was the only scenario whose prompt logic changed between attempts; protector drift is within single-generation variance.

---

## 6. Targeted panel PASS gate summary

| Criterion | Pass? |
|-----------|-------|
| G11 Would Send = Yes | ✗ |
| G11 final body no gratitude synonym | ✗ |
| G11 body gratitude stack gone | ✗ |
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

1. **Do not** run the full frozen G01–G20 evaluation on attempt 2 production.
2. **Abandon** Sprint 9B.2 attempt 2; revert to accepted 9B.1 V2 production.
3. **Do not** recommend another prompt-only attempt — two attempts failed the same G11 gate with synonym substitution.
4. Any future G11 work requires a different intervention class (not another soft/hard brief iteration on the same surface).
