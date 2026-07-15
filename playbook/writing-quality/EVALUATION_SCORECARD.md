# Evaluation Scorecard — Writing Quality Pilot

**Use one scorecard row per successful scenario's first-returned card.**  
**Scale:** 1 = broken · 2 = weak · 3 = acceptable · 4 = strong · 5 = send / keep.  
**Hard Fails:** binary. Any HF = do not treat as “shippable good,” even if soft scores are high.

---

## Header (fill first)

| Field | Value |
|-------|--------|
| Reviewer | |
| Date | |
| Scenario ID (G01–G20) | |
| Version | Draft (first-returned card) |
| Model / env note | (frozen Sprint 8 prompts) |
| Blind? | Y / N |

---

## A. Hard Fail checklist

Mark **Fail** if true. Leave notes if borderline.

| Code | Criterion | Pass / Fail |
|------|-----------|-------------|
| HF-SUBJECT | Primary context present but concrete subject missing, only a vague stand-in, or supporting hijacks subject | |
| HF-FABRICATE | Invents facts, history, or traits not in inputs | |
| HF-LABEL | Leaks internal labels (“Primary reason”, checklist language, etc.) | |
| HF-BANNED | Uses known banned cliché / greeting-card stock phrase | |
| HF-SIGNOFF | Missing or altered required sign-off | |
| HF-REL | Wrong intimacy or register for relationship | |
| HF-OCCASION | Wrong occasion job (e.g. birthday energy on sympathy) | |

**Any Fail?** Yes / No  
If Yes → still score soft dims for diagnostics, but mark **Overall: Hard Fail**.

---

## B. Soft rubric (1–5)

| # | Dimension | Score | Brief note (optional) |
|---|-----------|-------|------------------------|
| 1 | Opening quality | | |
| 2 | Closing quality | | |
| 3 | Emotional progression | | |
| 4 | Naturalness | | |
| 5 | Authenticity | | |
| 6 | Sentence rhythm | | |
| 7 | Voice consistency | | |
| 8 | Occasion fit | | |
| 9 | Relationship fit | | |
| 10 | Tone fidelity | | |
| 11 | Emotional level fidelity | | |
| 12 | Primary subject clarity | | |
| 13 | Supporting-detail use | | |
| 14 | Specificity | | |
| 15 | Warmth | | |
| 16 | Humor (N/A if not requested) | | |
| 17 | Memorability | | |
| 18 | Read-aloud quality | | |
| 19 | Anti-AI texture | | |
| 20 | Overall send-readiness (holistic)* | | |

\*Dim 20 is a holistic send-readiness judgment for the single first-returned draft (no sibling-version comparison). Use N/A only if the card could not be generated.

**Mean soft score (exclude N/A):** ______

---

## C. Product gate

| Question | Answer |
|----------|--------|
| **Would I actually send this?** | Yes / No |
| If No, one-line why | |

---

## D. Pattern tags

Copy IDs from `PATTERN_LEDGER.md` (negative and/or positive). Comma-separated:

```
Tags:
```

---

## E. Free-form reviewer notes

What felt human / artificial? Quotable line? Strongest weakness?

```
Notes:
```

---

## F. Recommended spreadsheet columns (for aggregation)

`reviewer, date, scenario_id, version, hf_any, hf_codes, soft_mean, send_yes, tags, notes_short, opening_quote, closing_quote`

---

## Calibration anchors (shared meaning of 1–5)

| Score | Meaning |
|-------|---------|
| 1 | Clearly wrong; would not show users |
| 2 | Usable only after rewrite |
| 3 | Acceptable first draft; not distinctive |
| 4 | I would send with light edit |
| 5 | I would send as-is and feel proud |

**Do not change prompts from a single low score.** Escalate only via the Review Workflow pattern threshold.
