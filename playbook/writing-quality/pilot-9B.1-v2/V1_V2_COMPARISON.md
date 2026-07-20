# Framework V1 → V2 Comparison (Sprint 9B.1)

**V1 corpus:** `pilot-9A.2-20260715` (frozen baseline)  
**V2 corpus:** `pilot-9B.1-v2-20260720`  
**Production under test (V2):** `2aab24385168438b12500e33d23443d662d75a63`  
**Scorecard:** Writing Evaluation Framework V1 (unchanged)  
**Scoring date:** 2026-07-20  

---

## 1. Headline metrics

| Metric | V1 (frozen) | V2 | Δ |
|--------|-------------|----|---|
| Overall average | **4.38** | **4.43** | **+0.05** |
| Median | **4.49** | **4.59** | **+0.10** |
| Hard Fails | **0** | **0** | 0 |
| Would Send | **18/20 (90%)** | **19/20 (95%)** | **+1** |
| Guest mean | **4.35** | **4.36** | **+0.01** |
| authenticated_body mean | **4.48** | **4.61** | **+0.13** |

Would-not-send change: **G16 No → Yes**; **G11 remains No**.

---

## 2. Per-scenario soft-mean deltas

| ID | Flow | V1 | V2 | Δ | Send V1→V2 | Notes |
|----|------|----|----|---|------------|-------|
| G01 | guest | 4.37 | 4.42 | **+0.05** | Yes→Yes | Stronger concrete close |
| G02 | guest | 3.28 | 3.28 | 0 | Yes→Yes | Flat Simple unchanged |
| G03 | guest | 4.16 | 4.16 | 0 | Yes→Yes | Meta humor holds |
| G04 | guest | 4.89 | 4.89 | 0 | Yes→Yes | **Protect HOLD** |
| G05 | guest | 4.67 | 4.72 | **+0.05** | Yes→Yes | Concrete Christmas close |
| G06 | guest | 4.78 | 4.78 | 0 | Yes→Yes | Sympathy holds |
| G07 | guest | 4.79 | 4.79 | 0 | Yes→Yes | **Protect HOLD** |
| G08 | guest | 4.47 | 4.84 | **+0.37** | Yes→Yes | **Target:** P-AI-CLAIMS cleared |
| G09 | guest | 4.17 | 4.22 | **+0.05** | Yes→Yes | Cleaner pancake close |
| G10 | guest | 3.67 | 3.28 | **−0.39** | Yes→Yes | **Largest regression** (thin sparse) |
| G11 | guest | 3.50 | 3.56 | **+0.06** | No→No | Still thank-stack; **9B.2** |
| G12 | guest | 4.50 | 4.50 | 0 | Yes→Yes | Boss register holds |
| G13 | guest | 4.95 | 4.95 | 0 | Yes→Yes | **Protect HOLD** |
| G14 | guest | 4.65 | 4.65 | 0 | Yes→Yes | Humor holds |
| G15 | auth | 4.21 | 4.26 | **+0.05** | Yes→Yes | Teach-fix + sink; birthday still late |
| G16 | auth | 3.84 | 4.53 | **+0.69** | **No→Yes** | **Largest improvement** |
| G17 | auth | 4.89 | 4.89 | 0 | Yes→Yes | **Protect HOLD** (tighter) |
| G18 | auth | 4.22 | 4.22 | 0 | Yes→Yes | Get-well holds |
| G19 | auth | 4.89 | 4.95 | **+0.06** | Yes→Yes | **Target:** soft P-AI-CLAIMS cleared |
| G20 | auth | 4.79 | 4.79 | 0 | Yes→Yes | Apology holds |

### Strongest improvements
1. **G16 +0.69** (send flipped; essay / I-see close gone)  
2. **G08 +0.37** (concrete reset; no I-see claim)  
3. **G19 +0.06** (concrete diploma close)  
4. Tie cluster **+0.05**: G01, G05, G09, G15  

### Largest regressions
1. **G10 −0.39** only material soft regression (honest but thinner)  
2. No other negative deltas.

---

## 3. Pattern changes

| Pattern | V1 | V2 | Change |
|---------|----|----|--------|
| P-AI-CLAIMS | 3 (G08, G16, G19) | **0** | Cleared — **9B.1 primary win** |
| P-GRATITUDE-ESSAY | 1 (G16) | **0** | Cleared |
| P-LENGTH-BLOAT | 4 (G08, G11, G16, G17) | **0** | Cleared / shortened |
| P-UNIFORM-SENTENCES | 2 (G02, G11) | 2 (G02, G11) | Unchanged — **9B.2** |
| Q-EARNED-CLOSE | 10 | **14** | +4 |
| Q-REGISTER-TIGHT | 12 | **14** | +2 |
| Q-DEED-EARLY | 17 | 17 | Stable |
| Q-SUPPORT-AS-COLOR | 11 | 11 | Stable |

---

## 4. Closing-quality changes

| Focus | V1 | V2 |
|-------|----|----|
| Closing dim mean | 4.20 | **4.40** |
| Anti-AI dim mean | 4.00 | **4.30** |
| Target closings (G08/G16/G19) | Abstract claim / essay residue | Concrete deed/occasion ends |
| Protected closings | Strong | Remained strong / earned |

---

## 5. Protected-strength review

| ID | Role | V1 | V2 | Result |
|----|------|----|----|--------|
| G13 | Protect | 4.95 | 4.95 | HOLD |
| G07 | Protect | 4.79 | 4.79 | HOLD |
| G04 | Protect | 4.89 | 4.89 | HOLD |
| G17 | Protect | 4.89 | 4.89 | HOLD |

Protected strengths did **not** regress materially. Aggregate improvement is therefore admissible under the skeptical gate.

---

## 6. Reliability review

| Item | V1 | V2 |
|------|----|----|
| Scenarios scored | 20/20 | 20/20 |
| Attempts | 1 each | 1 each |
| First card only | Yes | Yes |
| HF | 0 | 0 |
| Generation semantics | Frozen Sprint 8 | Sprint 9B.1 production SHA |

V2 generation completed live on Replit; local corpus verified evaluation-eligible before scoring. No rescoring via regeneration.

---

## 7. Determination

| Question | Answer |
|----------|--------|
| PASS / MIXED / FAIL | **PASS** |
| Sprint 9B.1 officially close? | **Yes** |
| Sprint 9B.2 begin? | **Yes** — professional thank-you rhythm (G11 / `P-UNIFORM-SENTENCES`) |
| More closing prompt tuning? | **No** — not justified by this evidence |

**Skeptical note:** Higher aggregate alone would not pass if protectors had dropped. They did not. G10’s thinning is logged but does not overturn the closing-discipline win or reopen 9B.1 scope.
