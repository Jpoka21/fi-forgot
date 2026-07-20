# Sprint 9B.1 V2 → Sprint 9B.2 Comparison

**V2 baseline corpus:** `pilot-9B.1-v2-20260720` (accepted PASS)  
**9B.2 corpus:** `pilot-9B.2-v1-20260720`  
**Production under test (9B.2):** `0d47a18163c52a5c9f8773c86ccc3414c24b2e47`  
**Harness:** `f4493899a8016df98b7a8277c3972a18528f9124`  
**Scorecard:** Writing Evaluation Framework V1 (unchanged)  
**Scoring date:** 2026-07-20  

---

## 1. Headline metrics

| Metric | V2 (accepted) | 9B.2 | Δ |
|--------|---------------|------|---|
| Overall average | **4.43** | **4.42** | **−0.01** |
| Median | **4.59** | **4.51** | **−0.08** |
| Hard Fails | **0** | **0** | 0 |
| Would Send | **19/20 (95%)** | **19/20 (95%)** | 0 |
| Guest mean | **4.36** | **4.35** | **−0.01** |
| authenticated_body mean | **4.61** | **4.57** | **−0.04** |

Would-not-send: **G11 remains No** (target not cleared).

---

## 2. Per-scenario soft-mean deltas (every scenario)

| ID | Flow | V2 | 9B.2 | Δ | Send V2→9B.2 | Notes |
|----|------|----|------|---|--------------|-------|
| G01 | guest | 4.42 | 4.42 | 0 | Yes→Yes | Insurance + fight color holds |
| G02 | guest | 3.28 | 3.28 | 0 | Yes→Yes | Flat Simple; still `P-UNIFORM-SENTENCES` |
| G03 | guest | 4.16 | 4.16 | 0 | Yes→Yes | Funny holds |
| G04 | guest | 4.89 | 4.89 | 0 | Yes→Yes | **Protect HOLD** |
| G05 | guest | 4.72 | 4.72 | 0 | Yes→Yes | Storm / Christmas holds |
| G06 | guest | 4.78 | 4.78 | 0 | Yes→Yes | Sympathy holds |
| G07 | guest | 4.79 | 4.63 | **−0.16** | Yes→Yes | **Protect soft dip** (thinner close) |
| G08 | guest | 4.84 | 4.84 | 0 | Yes→Yes | Clean apology holds |
| G09 | guest | 4.22 | 4.22 | 0 | Yes→Yes | Pancakes hold |
| G10 | guest | 3.28 | 3.28 | 0 | Yes→Yes | Thin sparse (pre-existing) |
| G11 | guest | 3.56 | 3.83 | **+0.27** | **No→No** | Soft up; stack remains; **target miss** |
| G12 | guest | 4.50 | 4.50 | 0 | Yes→Yes | Boss register holds |
| G13 | guest | 4.95 | 4.89 | **−0.06** | Yes→Yes | **Protect soft HOLD** |
| G14 | guest | 4.65 | 4.50 | **−0.15** | Yes→Yes | Sideways-caller repeat |
| G15 | auth | 4.26 | 4.26 | 0 | Yes→Yes | Teach-fix + sink holds |
| G16 | auth | 4.53 | 4.53 | 0 | **Yes→Yes** | Prior flip **HOLD** |
| G17 | auth | 4.89 | 4.74 | **−0.15** | Yes→Yes | **Protect soft dip** (fries lost) |
| G18 | auth | 4.22 | 4.22 | 0 | Yes→Yes | Get-well holds |
| G19 | auth | 4.95 | 4.89 | **−0.06** | Yes→Yes | Diploma close holds; no `P-AI-CLAIMS` |
| G20 | auth | 4.79 | 4.79 | 0 | Yes→Yes | Apology holds |

### Strongest improvements
1. **G11 +0.27** soft only — **not** a send flip  

### Largest regressions
1. **G07 −0.16** (protected)  
2. **G14 −0.15** / **G17 −0.15** (G17 protected)  
3. **G13 / G19 −0.06** (noise-level soft)

---

## 3. Pattern changes

| Pattern | V2 | 9B.2 | Change |
|---------|----|------|--------|
| P-UNIFORM-SENTENCES | 2 (G02, G11) | 2 (G02, G11) | **Unchanged — primary miss** |
| P-AI-CLAIMS | 0 | **0** | Held |
| P-GRATITUDE-ESSAY | 0 | 0 | Held |
| Q-DEED-EARLY | 17 | 17 | Stable |
| Q-EARNED-CLOSE | 14 | 14 | Stable |
| Q-REGISTER-TIGHT | 14 | 14 | Stable |
| Q-SUPPORT-AS-COLOR | 11 | 11 | Stable |

---

## 4. G11 target detail

| Check | V2 | 9B.2 |
|-------|----|------|
| Soft mean | 3.56 | **3.83** |
| Would Send | No | **No** |
| `P-UNIFORM-SENTENCES` | Yes | **Yes** |
| Closing stack | thank / appreciate / Thanks again | thank / appreciate / Thanks again |

Middle improved; required acceptance criteria **not met**.

---

## 5. Protected-strength review

| ID | Role | V2 | 9B.2 | Result |
|----|------|----|------|--------|
| G13 | Protect | 4.95 | 4.89 | Soft HOLD (warmth/support/send-ready intact) |
| G07 | Protect | 4.79 | 4.63 | Soft dip |
| G04 | Protect | 4.89 | 4.89 | HOLD |
| G17 | Protect | 4.89 | 4.74 | Soft dip |
| G16 | Prior win | 4.53 | 4.53 | Send Yes HOLD |

Protected panel is **not** a clean soft-mean HOLD across G13/G07/G04/G17.

---

## 6. Acceptance verdict

| Gate | Pass? |
|------|-------|
| G11 Would Send Yes | **No** |
| G11 loses `P-UNIFORM-SENTENCES` | **No** |
| HF = 0 | **Yes** |
| Protect hold (G13/G07/G04/G17) | **No** |
| G16 Would Send Yes | **Yes** |
| `P-AI-CLAIMS` = 0 | **Yes** |
| No material new regression | **No** |

**Determination: FAIL**  
**Accept 9B.2:** No  
**Make temp tip permanent:** No  
**Further narrow tuning justified:** Yes (G11 body stack vs thanks sign-off; re-check G07/G17)

A higher aggregate alone would not have been enough; aggregate is also slightly down.
