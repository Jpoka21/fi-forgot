# Sprint 9A.2 — Pilot Findings

**Corpus ID attempted:** `pilot-9A.2-20260714`  
**Status:** **BLOCKED — generation did not complete**  
**Date:** 2026-07-14  
**Rule honored:** No invented card texts. No production/prompt changes. No commits.

---

## 1. Pilot findings (execution outcome)

### What ran
| Step | Result |
|------|--------|
| Load Golden Scenario Set v1 (20 scenarios) | OK |
| Resolve `OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_API_KEY` | **Absent** in process and local `.env` files checked by runner |
| Reach `POST /api/v2/generate-card` on localhost `:3000` / `:5000` / `:8080` | **No responding server** |
| Generate G01–G20 × 1 card | **0 / 20 succeeded** |
| Score 20 cards | **Not possible** (no texts) |
| Aggregate dimension averages / HF / patterns from corpus | **Not possible** |

### Artifacts produced by the attempt
| Path | Purpose |
|------|---------|
| `playbook/writing-quality/pilot-9A.2/run-pilot.mjs` | Disposable sequential runner (first response only; one retry) |
| `playbook/writing-quality/pilot-9A.2/CORPUS.json` | Empty/blocked corpus shell |
| `playbook/writing-quality/pilot-9A.2/CORPUS.md` | Human-readable blocked log |
| `playbook/writing-quality/pilot-9A.2/BLOCKER.md` | Unblock instructions |

### How to unblock (then re-run 9A.2 for real)

1. Provide API access the server expects (`AI_INTEGRATIONS_OPENAI_API_KEY` or `OPENAI_API_KEY`; optional `AI_INTEGRATIONS_OPENAI_BASE_URL`).
2. Start `api-server` with a known `PORT`.
3. Set `PILOT_BASE_URL=http://127.0.0.1:<PORT>` if not on 3000/5000/8080.
4. Run: `node playbook/writing-quality/pilot-9A.2/run-pilot.mjs`
5. Only then perform scoring + aggregation into this findings file (replace blocked section).

**Do not** regenerate individual scenarios to “improve” samples. First successful capture only.

---

## 2. Top recurring writing patterns

**From this pilot corpus:** none measurable (0 texts).

**Out-of-corpus prior signal (not a substitute for 9A.2):**  
Live Sprint 8 guest Mom / Thank You / health insurance runs exhibited:
- `P-SUPPORT-HIJACK`
- `P-OPEN-THIS-ONE` / `P-SUBJECT-PRONOUN`
- `P-NAMELESS-DEED`
- `P-GRATITUDE-ESSAY` / `P-AI-CLAIMS` / `P-CLOSING-BAR`

These remain **hypotheses for frequency measurement** once generation runs. They must not start Sprint 9B by themselves.

---

## 3. Strengths (framework validation — process, not prose)

Even without model output, 9A.1 assets + runner proved useful:

| Strength | Evidence |
|----------|----------|
| Golden set is executable | JSON loads; runner maps each `request` 1:1 to API body |
| Coverage intent is clear | Guest/auth, sparse/rich, occasion & relationship spread documented |
| Anti-cherry-pick rules are enforceable | Runner is sequential, one retry, no re-gen loop |
| Scorecard dimensions are reviewable offline | Rubric/HF/tags can be applied as soon as CORPUS exists |
| Pattern ledger is ready for counts | IDs exist; frequency cells wait for scoring |
| Gate to 9B is already defined | Workflow threshold prevents anecdote-driven prompt edits |

---

## 4. Weaknesses (framework + environment)

| Weakness | Impact |
|----------|--------|
| Local Cursor environment has no OpenAI key / running API | Pilot scoring cannot start here |
| Auth scenarios are “auth-shaped” (`relAnswers`) without real `recipientId` + `x-user-id` | Pilot will under-test authenticated memory/supplement path vs production auth |
| G14 labeled “sibling humor” but uses `Friend` | Relationship label vs product enum mismatch may confuse trends |
| `avoidList` values like `"Too Funny"` / `"Too Fancy"` may not match product avoid options | Noise in inputs; unclear effect |
| No spreadsheet/CSV score sheet committed | Aggregation will be slow if done only in markdown |
| Humor dim N/A vs score mean | Need explicit rule: exclude N/A from averages (scorecard says this; aggregation sheet should enforce) |
| Version differentiation requires intra-scenario comparison | Reviewers need all 3 texts side by side (CORPUS.md helps once filled) |

---

## 5. Recommended improvements to evaluation assets only

Documentation / asset refinements (still **no** prompt or production code):

1. **Freeze blocker → Preconditions pack**  
   Add to `REVIEW_WORKFLOW.md` §0: required env vars (`AI_INTEGRATIONS_OPENAI_API_KEY` or `OPENAI_API_KEY`), `PILOT_BASE_URL`, and `node playbook/writing-quality/pilot-9A.2/run-pilot.mjs`.

2. **Add `SCORES_TEMPLATE.csv`**  
   Columns: `corpus_id, reviewer, scenario_id, flow, occasion, relationship, version, hf_any, hf_codes, soft_mean, d01..d20, send_yes, tags, notes`  
   Enforces aggregation and N/A handling.

3. **Clarify auth pilot honesty**  
   In `GOLDEN_SCENARIO_SET_V1.md`: mark G15–G20 as **“auth-shaped body context (relAnswers), not full recipient-context supplement”** unless a later v1.1 wires real recipients.

4. **Fix G14 labeling**  
   Either retitle to Friend humor (truthful) or add a note that sibling register is intentional-but-emulated via Friend.

5. **Align avoidList tokens**  
   Restrict fixture `avoidList` entries to values present in product `AVOID_OPTIONS` (or omit optional avoids from golden v1).

6. **Pilot findings template**  
   Keep this file as the shell; after a successful run, fill sections: dimension averages, HF counts, pattern frequency table, best/worst scenarios, guest vs auth, version differentiation.

7. **Do not remove scenarios yet**  
   20 is the right pilot width; removals only after a completed scored batch shows redundancy.

**Do not** begin Sprint 9B. **Do not** propose prompt changes from this blocked run.

---

## 6. Freeze recommendation (Version 1)

| Asset | Freeze as V1 now? | Why |
|-------|-------------------|-----|
| Golden Scenario Set | **Not yet** | Needs auth-path honesty note + small label/avoidList cleanup after unblock; then freeze post first full scored corpus |
| Evaluation Scorecard | **Provisional freeze OK** | Structure validated; only CSV companion missing |
| Pattern Ledger | **Provisional freeze OK** | IDs sufficient; frequencies empty until scoring |
| Review Workflow | **Not yet** | Add generation preconditions from this blocker |
| Overall “docs V1 freeze” | **No** | Framework not validated end-to-end without a completed 20-card scored pilot |

**Decision:** Evaluation documentation is **not ready to freeze as Version 1** until one successful generation + scoring cycle completes.

---

## 7. Deferred tables (fill after unblock)

### Average score by dimension
_Pending corpus._

### Hard Fail counts
_Pending corpus._

### Pattern frequency
_Pending corpus._

### Best / weakest scenarios
_Pending corpus._

### Relationship / occasion / guest vs auth / version differentiation
_Pending corpus._

---

## 8. Next action (still 9A.2 — not 9B)

1. Unblock API (key + running server).  
2. Re-run `run-pilot.mjs` → real `CORPUS.json` / `CORPUS.md`.  
3. Calibrate + score all successful first-returned cards (≤20).  
4. Replace deferred sections above with aggregates.  
5. Then decide V1 freeze + whether any **doc-only** golden-set edits are needed before 9B.
