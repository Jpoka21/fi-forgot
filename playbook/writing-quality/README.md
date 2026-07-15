# Sprint 9 — Writing Quality Roadmap

**Framework status:** Writing Evaluation Framework V1, frozen  
**Sprint 9A status:** **Complete**  
**Branch context:** `frontend-rebuild` (docs / evaluation only; Sprint 8 generation frozen)  
**Rule:** No prompt, architecture, or production-code changes until measured patterns justify them (Sprint 9B planning only until kickoff).

---

## Writing Evaluation Framework V1 (frozen)

| Asset | File |
|-------|------|
| Golden Scenario Set v1 | `GOLDEN_SCENARIO_SET_V1.json` + `GOLDEN_SCENARIO_SET_V1.md` |
| Evaluation Scorecard | `EVALUATION_SCORECARD.md` |
| Pattern Ledger | `PATTERN_LEDGER.md` |
| Review Workflow | `REVIEW_WORKFLOW.md` |
| Pilot scores | `SCORES_TEMPLATE.csv` |
| Pilot findings | `PILOT_FINDINGS_9A2.md` |
| Pilot corpus | `pilot-9A.2/CORPUS.json` + `CORPUS.md` |
| This roadmap | `README.md` |

**V1 clarifications (scoring unchanged):**
- Dimension 13 is **N/A** when no supporting detail was supplied.
- Dimension 20 means **send readiness** for the one-card baseline (not version differentiation).
- Multi-draft comparison tags (`P-TRIPLE-ECHO`, `Q-VERSION-ANGLES`) are outside one-card baseline scope.
- `authenticated_body` means relAnswers body-path only, not full recipient memory.

---

## 9A.1 — Evaluation assets

**Goal:** Create reusable, frozen evaluation instruments.  
**Exit criteria:** Assets ready for pilot; no generation behavior changed. **Met.**

---

## 9A.2 — Pilot review

**Goal:** Score **20 golden scenarios × 1 first-returned card = 20 cards**.

**Status:** **Complete.** Corpus at `b213acf`; scoring frozen with Framework V1.

| Metric | Value |
|--------|--------|
| Scored | 20 / 20 |
| Soft mean | 4.38 |
| Soft median | 4.49 |
| Hard Fails | 0 |
| Would Send | 18 / 20 (90%) |
| Guest mean | 4.35 |
| Authenticated_body mean | 4.48 |

See `PILOT_FINDINGS_9A2.md`.

**Exit criteria:** Data-driven priority list for writing work — still no prompt edits until 9B kickoff. **Met.**

---

## 9B — Prompt improvements from measured patterns only (not started)

**Goal:** Change writing prompts **only** for patterns that clear the workflow’s “deserve prompt work” bar.

- Treat golden scenarios G01–G20 as the regression panel.
- Re-score the same fixtures after each change family.
- Do not expand scope into performance, Brain, Event Domain, or frontend flow.

**Planning candidates (do not implement until 9B kickoff):** professional thank-you rhythm / template (`P-UNIFORM-SENTENCES`, length); rich heartfelt essay / AI-claim closings (`P-GRATITUDE-ESSAY`, `P-AI-CLAIMS`). Protect `Q-DEED-EARLY`, `Q-SUPPORT-AS-COLOR`, `Q-REGISTER-TIGHT`.

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
- No production behavior changes in Sprint 9A.
