# Golden Scenario Set v1 — Index

**Purpose:** Fixed, complete generation payloads for writing-quality review.  
**Machine source of truth:** `GOLDEN_SCENARIO_SET_V1.json`  
**Count:** 20 scenarios → **20 first-returned cards** (one generation request per scenario; no three-version batches).

## Coverage map

| ID | Flow | Occasion | Relationship | Context | Tone focus |
|----|------|----------|--------------|---------|------------|
| G01 | Guest | Thank You | Mom | Primary + vivid support | Heartfelt |
| G02 | Guest | Thank You | Mom | Primary only | Simple |
| G03 | Guest | Birthday | Friend | Sparse primary (thin) | Funny |
| G04 | Guest | Anniversary | Wife | Primary + support | Romantic |
| G05 | Guest | Holiday | Dad | Primary (named holiday) | Warm |
| G06 | Guest | Sympathy | Friend | Primary only | Heartfelt |
| G07 | Guest | Congratulations | Son | Primary + support | Encouraging |
| G08 | Guest | Apology | Husband | Primary + support | Bold And Honest |
| G09 | Guest | Just Because | Daughter | Primary only | Nostalgic |
| G10 | Guest | Thinking Of You | Grandparent | Sparse primary | Simple |
| G11 | Guest | Thank You | Coworker | Primary only | Respectful |
| G12 | Guest | Congratulations | Boss | Primary only | Professional-warm |
| G13 | Guest | Thank You | Teacher | Primary + light support | Warm |
| G14 | Guest | Birthday | Sister | Primary + support | Funny |
| G15 | authenticated_body | Birthday | Dad | Rich `relAnswers` | Heartfelt |
| G16 | authenticated_body | Thank You | Mom | Rich profile + primary | Meaningful |
| G17 | authenticated_body | Anniversary | Husband | Rich + Romantic | Romantic |
| G18 | authenticated_body | Get Well | Coworker | Sparse `relAnswers` | Warm |
| G19 | authenticated_body | Graduation | Daughter | Rich + Encouraging | Encouraging |
| G20 | authenticated_body | Apology | Friend | Rich + Simple | Simple |

## Auth fidelity (important)

**G15–G20 are `authenticated_body`, not full production auth.**

| What the runner sends | Effect on `/api/v2/generate-card` |
|-----------------------|-----------------------------------|
| Body `relAnswers` populated | Relationship profile lines in user prompt (same as wizard packing) |
| No `recipientId` | No `assembleRecipientContext` |
| No `x-user-id` header | No contextSupplement / fresh updates / briefing |

Use guest vs `authenticated_body` trends to compare **body context richness**, not the full authenticated recipient-memory pipeline. A later golden v1.1 may add optional full-auth fixtures with real recipients — out of scope for this pilot.

## Why these twenty

- Guest vs richer body-context packs.
- Primary+support bait (G01) vs primary-only (G02) — known Sprint 8 failure mode.
- Thin primary / sparse packs (G03, G10, G18) — invention / honesty pressure.
- Occasion and relationship spread including Sister (G14) and Grandparent (G10).
- Product `avoidList` tokens only (see JSON notes).

## How to use

1. `node playbook/writing-quality/pilot-9A.2/run-pilot.mjs` with api-server running (`REVIEW_WORKFLOW.md` §0).
2. One POST per scenario; preserve the single first-returned card (raw response included).
3. Score with `EVALUATION_SCORECARD.md` / `SCORES_TEMPLATE.csv`; tag with `PATTERN_LEDGER.md`.

## Freeze note

Scenario payloads are evaluation fixtures. Changing them mid-pilot invalidates frequency comparisons — bump to v1.1 if inputs must change after a scored corpus exists.
