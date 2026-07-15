# Sprint 9 — Writing Quality Roadmap

**Status:** 9A.1 assets (this folder)  
**Branch context:** `frontend-rebuild` (docs only; Sprint 8 generation frozen)  
**Rule:** No prompt, architecture, or production-code changes until measured patterns justify them.

---

## 9A.1 — Evaluation assets (current)

**Goal:** Create reusable, frozen evaluation instruments.

| Asset | File |
|-------|------|
| Golden Scenario Set v1 | `GOLDEN_SCENARIO_SET_V1.json` + `GOLDEN_SCENARIO_SET_V1.md` |
| Evaluation Scorecard | `EVALUATION_SCORECARD.md` |
| Pattern Ledger | `PATTERN_LEDGER.md` |
| Review Workflow | `REVIEW_WORKFLOW.md` |
| This roadmap | `README.md` |

**Exit criteria:** Assets ready for pilot; no generation behavior changed.

---

## 9A.2 — Pilot review

**Goal:** Score **20 golden scenarios × 1 first-returned card = 20 cards**.

1. Generate using frozen post–Sprint 8E prompts and the golden set payloads via `pilot-9A.2/run-pilot.mjs`.
2. Run one calibration round (shared sample of ~3–6 cards).
3. Score each successful first-returned card (`SCORES_TEMPLATE.csv`).
4. Tag patterns; fill frequency on the ledger.
5. Produce / update **`PILOT_FINDINGS_9A2.md`** (top patterns, HF rates, soft dims).

**Status (2026-07-14):** First attempt **blocked** (no API key / local generate-card server). Asset review + corrections: `ASSET_REVIEW_9A2.md`. Re-run generation before freeze or 9B.

**Exit criteria:** Data-driven priority list for writing work — still no prompt edits until 9B kickoff.

---

## 9B — Prompt improvements from measured patterns only

**Goal:** Change writing prompts **only** for patterns that clear the workflow’s “deserve prompt work” bar.

- Treat golden scenarios G01–G20 as the regression panel.
- Re-score the same fixtures after each change family.
- Do not expand scope into performance, Brain, Event Domain, or frontend flow.

---

## 9C+ — Future refinement

| Phase | Focus |
|-------|--------|
| **9C** | Register packs (Humor, Simple, Professional, Sympathy) if pilot shows uneven tone fidelity |
| **9D** | Differentiation of user-requested New Version / Rewrite outputs if they remain near-duplicates |
| **9E** | Optional ops handoff (repeatable live QA checklist); optional later expansion of internal scorer — not required for 9A |

---

## Guardrails (all of Sprint 9)

- Subject fidelity from Sprint 8D remains non-negotiable (HF-SUBJECT).
- Evaluation first; anecdotes do not unlock prompt work.
- Sprint 8E production baseline: one card per generate; refine actions must stay factually grounded.
- Birthday date collection is a separate product follow-up (`BIRTHDAY_DATE_FOLLOWUP.md`) — not part of 9A.2 generation.
- No production behavior changes in 9A.1 asset creation; 8E corrected production before the 9A.2 pilot.
