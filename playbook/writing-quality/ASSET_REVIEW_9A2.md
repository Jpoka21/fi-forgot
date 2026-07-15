# Sprint 9A.2 — Evaluation asset review (pre-generation)

**Date:** 2026-07-14  
**Scope:** Review + evaluation-only corrections. No production code. No prompts. No generation. No 9B. No commit/push.

---

## 1. Files added or modified during Sprint 9A.2

### Created in 9A.2 (generation attempt + follow-up)
| File | Role |
|------|------|
| `playbook/writing-quality/pilot-9A.2/run-pilot.mjs` | Disposable HTTP runner |
| `playbook/writing-quality/pilot-9A.2/CORPUS.json` | Blocked corpus shell |
| `playbook/writing-quality/pilot-9A.2/CORPUS.md` | Blocked human log |
| `playbook/writing-quality/pilot-9A.2/BLOCKER.md` | Blocker note |
| `playbook/writing-quality/PILOT_FINDINGS_9A2.md` | Blocked findings |
| `playbook/writing-quality/SCORES_TEMPLATE.csv` | Aggregation headers |
| `playbook/writing-quality/ASSET_REVIEW_9A2.md` | This review |

### Modified in 9A.2 (docs / scenario data — not production)
| File | When |
|------|------|
| `playbook/writing-quality/README.md` | Blocked status + runner pointer |
| `playbook/writing-quality/REVIEW_WORKFLOW.md` | §0 API/runner preconditions |
| `playbook/writing-quality/GOLDEN_SCENARIO_SET_V1.md` | Auth honesty, G14/G10, flow labels |
| `playbook/writing-quality/GOLDEN_SCENARIO_SET_V1.json` | Auth fidelity, G14 Sister, G10 Grandparent, avoidList cleanup |
| `playbook/writing-quality/pilot-9A.2/run-pilot.mjs` | Raw capture + metadata + retry semantics clarified |

9A.1 originals (`EVALUATION_SCORECARD.md`, `PATTERN_LEDGER.md`) were not methodology-rewritten in this pass.

---

## 2. Documentation edits already applied (not merely recommended)

| Edit | Why needed | Changes methodology? | Retain / revise / revert |
|------|------------|----------------------|--------------------------|
| Workflow §0 API key + `PILOT_BASE_URL` + runner | Blocked run lacked entry criteria | No — operational | **Retain** |
| README 9A.2 blocked status | Honest pilot status | No | **Retain** until real corpus |
| Golden MD auth honesty (`authenticated_body`) | Prevent false “full auth” claims | Clarifies scope; strengthens honesty | **Retain** |
| Golden JSON `flow: authenticated_body` + `authFidelity` | Align metadata with what runner actually exercises | Labels only; same API body path | **Retain** |
| G14 → `Sister` in JSON + MD | Intended sibling humor; product has Sister; MD previously disagreed with JSON Friend | Aligns fixture to intent | **Retain** |
| G10 → `Grandparent` | Product enum is Grandparent, not Grandmother | Valid generation input | **Retain** |
| Removed invalid avoid tokens | Tokens not in product `AVOID_OPTIONS` | Removes noisy inputs | **Retain** |
| SCORES_TEMPLATE.csv | Needed for 20-row aggregation | Instrumentation only | **Retain** |
| Runner: preserve `raw` + scenario meta | Audit asked for raw + aggregation fields | Capture only | **Retain** |
| PILOT_FINDINGS blocked narrative | Honest incomplete run | No | **Retain**; replace tables after corpus |

None of these edits change the approved rubric dimensions, HF gates, pattern IDs, or 9B gate thresholds.

---

## 3. Authenticated scenarios — resolved

### How the runner represents them
`run-pilot.mjs` POSTs **`scenario.request` only** to `/api/v2/generate-card` for every scenario, including G15–G20.

It does **not**:
- send `x-user-id`
- send `recipientId`
- attach auth cookies/session

### Does `relAnswers` exercise “current authenticated generation”?

| Layer | Guest G01–G14 | G15–G20 as run today | Full production auth (typical) |
|-------|---------------|----------------------|--------------------------------|
| Same route | Yes | Yes | Yes |
| Body `relAnswers` in prompt profile | Empty | **Populated** | Populated from wizard |
| `assembleRecipientContext` / `contextSupplement` | No | **No** | Yes when `recipientId` + `x-user-id` |
| Primary + details + signOff | Yes | Yes | Yes |

**Conclusion:** Body `relAnswers` accurately exercises the **prompt body-profile** path shared with authenticated `/try` packing. It does **not** faithfully exercise the **recipient-context supplement** branch.

### Smallest evaluation-only correction (applied)
- Rename flow to `authenticated_body` + `authFidelity: "relAnswers_only"`.
- Document that guest vs auth_body comparisons = **body richness**, not full auth memory pipeline.
- Do **not** invent production hooks. Optional later v1.1 full-auth fixtures would need real recipients (still evaluation-side).

---

## 4. G14 — resolved

| Item | Value |
|------|--------|
| Previous JSON relationship | `Friend` |
| Intended relationship | Sibling humor → product **`Sister`** |
| Previous MD index | “Sibling→Sister as Friend*” (disagreed with JSON) |
| **Correction applied** | JSON + MD: `relationship: "Sister"`, title “Sister birthday — Funny…”, axes Sister |

JSON and Markdown now agree.

---

## 5. Avoid-token audit

Product `AVOID_OPTIONS`:  
`Too Cheesy, Too Sweet, Too Formal, Too Generic, Too Romantic, Too Emotional, Too Mean, Too Long, Too Clean, Too Inappropriate, Too Professional, Too Childish`

| Scenario | Token | Classification (before) | Action |
|----------|-------|-------------------------|--------|
| G02 | Too Sweet, Too Emotional | Valid generation input | Keep |
| G03 | Too Sweet, Too Emotional | Valid | Keep |
| G04 | Too Cheesy, Too Formal | Valid | Keep |
| G05 | Too Sweet | Valid | Keep |
| G06 | Too Cheesy | Valid | Keep |
| G06 | **Too Funny** | **Invalid** (not in AVOID_OPTIONS) | **Removed** |
| G07 | Too Formal, Too Childish | Valid | Keep |
| G08 | Too Generic, Too Formal | Valid | Keep |
| G09 | Too Long | Valid | Keep |
| G10 | **Too Fancy** | **Invalid** | **Removed** |
| G10 | Too Long | Valid | Keep |
| G11 | Too Emotional, Too Romantic | Valid | Keep |
| G11 | **Too Casual** | **Invalid** | **Removed** |
| G12 | **Too Casual** | **Invalid** | **Removed** |
| G12 | Too Emotional, Too Mean | Valid | Keep |
| G13 | **Too Casual** | **Invalid** | **Removed** |
| G13 | Too Romantic | Valid | Keep |
| G14 | Too Mean, Too Sweet | Valid | Keep |
| G15–G19 | listed product tokens | Valid | Keep |
| G20 | Too Long | Valid | Keep |
| G20 | **Too Dramatic** | **Invalid** | **Removed** |

These are **generation inputs** (HARD AVOIDS in system prompt), not pattern-ledger tags and not evaluator-only notes. Invalid tokens were scenario-data defects, now fixed.

`reviewFocus` strings on scenarios remain **evaluator guidance only** (not sent to API).

---

## 6. Scoring unit — confirmed (updated Sprint 8E)

API returns **`cards[]` with exactly one draft** per successful POST (array retained for compatibility).

Pilot must (and runner is built to):
- make **exactly one successful generation request** per scenario (retry only on failure)
- preserve **exactly one** first-returned card
- score **20 texts** when all succeed (20 × 1)
- never regenerate after a valid capture
- never cherry-pick a preferred rewrite
- retain scenario ID, flow, relationship, occasion for aggregation (now stored on each corpus row)
- record failed requests separately; mark recovered retries clearly when `attempts > 1`

---

## 7. `run-pilot.mjs` audit (after correction)

| Requirement | Status |
|-------------|--------|
| Sequential execution | Yes — `for (const s of golden.scenarios)` |
| Deterministic ordering | Yes — JSON array order G01…G20 |
| No retry replacing first valid response | Yes — retry only in `catch` after failure |
| Clear failed request capture | Yes — `ok:false`, `error`, `attempts`, `firstAttemptError` |
| Preserve raw response | Yes — `raw` full JSON on success |
| No hidden scoring/filtering | Yes — maps tone/text only; no ranking |
| No production data mutation | Yes — writes only under `pilot-9A.2/` |
| Correct endpoint / payload | `POST /api/v2/generate-card` with `s.request` |
| Guest + auth_body handling | Same POST body path; metadata records fidelity |

**Note:** Retry after transport/400-with-retry can still cause a **second model call** if the first attempt errored after the server started generation — acceptable for infra failures; does not replace a stored success.

Probe uses `POST {}` expecting **400 before OpenAI** (validated by route requiring firstName/relationship/occasion).

---

## 8. Exact execution plan to finish 9A.2 (when API available)

1. **Env:** Start api-server with `AI_INTEGRATIONS_OPENAI_API_KEY` or `OPENAI_API_KEY` (and base URL if required).  
2. **Point runner:** `$env:PILOT_BASE_URL="http://127.0.0.1:<PORT>"`.  
3. **Generate once:** `node playbook/writing-quality/pilot-9A.2/run-pilot.mjs`  
4. **Verify corpus:** 20 ok rows; each has exactly 1 card; spot-check G01 text + raw.  
5. **Calibrate:** 3–6 scenarios with two reviewers if available.  
6. **Score all successful cards (≤20)** into `SCORES_TEMPLATE.csv` using scorecard + pattern ledger.  
7. **Aggregate** into `PILOT_FINDINGS_9A2.md` (replace deferred tables).  
8. **Update** `PATTERN_LEDGER.md` frequencies.  
9. **Decide V1 freeze** of docs from findings — still **no prompt work / no 9B**.

---

## Readiness / blocker / 9B

| Item | Status |
|------|--------|
| Evaluation assets ready for pilot run | **Yes** (after this review’s corrections) |
| Remaining blocker | **API access:** key + running api-server exposing `/api/v2/generate-card` |
| Generation run this turn | **Not executed** (per instruction) |
| Sprint 9B | **Not started** |

### Evaluation-only files changed in this review pass
- `GOLDEN_SCENARIO_SET_V1.json`
- `GOLDEN_SCENARIO_SET_V1.md`
- `pilot-9A.2/run-pilot.mjs`
- `ASSET_REVIEW_9A2.md` (new)
