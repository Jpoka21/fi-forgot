# Recipient Context → Card Generation
### F* I Forgot — Session Summary
**Date:** June 5, 2026
**Checkpoint:** 9d42471

---

## What Was Built

Recipient intelligence is now wired into AI card generation. When a user generates a card through the v2 flow, the server assembles the full normalized recipient profile and injects it into the OpenAI prompt as structured supplemental context — enriching every card with memories, briefing answers, tone preferences, and prior card history without changing the UI or removing any existing behavior.

---

## Files Changed

| File | Change |
|---|---|
| `artifacts/api-server/src/services/recipient-context-prompt.ts` | **New** — pure functions that convert assembled context into prompt blocks |
| `artifacts/api-server/src/__tests__/recipient-context-prompt.test.ts` | **New** — 46 unit tests across all 6 scenarios |
| `artifacts/api-server/src/routes/v2-generate-card.ts` | **Modified** — context assembly wired in, `buildUserPrompt` receives supplement |

The v1 `/generate-card` route was intentionally left untouched — it has no `recipientId` or `x-user-id` in its call path, so server-side enrichment is not possible without UI changes.

---

## Architecture

### Two new pure functions

**`buildContextSupplement(context)`**
Converts an assembled `RecipientContext` into a labeled text block for injection into the user prompt. Returns `null` if context is null or carries no useful data — in which case the prompt is unchanged.

**`extractContextAvoids(context)`**
Extracts `tone.thingsToAvoid` from context and splits it into a string array for merging into the system-level `avoidList`. These become hard instructions in the system prompt, not advisory text.

### Injection into the generation prompt

Two separate injection points, each serving a different purpose:

**System prompt — hard avoidance**

`thingsToAvoid` from the recipient profile is split and appended to the existing body `avoidList`:

```
// Existing body avoidList:
AVOID ABSOLUTELY: no rhymes

// After merging context thingsToAvoid:
AVOID ABSOLUTELY: no rhymes, Anything too cheesy, generic Hallmark phrases
```

**User prompt — labeled supplement block**

The supplement appears after the existing `relAnswers`/`details` block, clearly labeled so the AI knows it is from the saved profile and not the current session:

```
What we know about Test:
--- Relationship profile (use as raw material) ---
  [existing relAnswers from the current session]

--- Recipient profile intelligence (from saved profile — use to enrich the card) ---
[Character] traits: tough | notes: Personality: Tough love — no fluff | Loves: Food & cooking
[Interests] food
[Shared memories] That time when he beat up the guy that beat me up
[Inside references / jokes] My head is bigger than his
[Briefing answers — Father's Day 2026]
  Q: What was a recent memorable dad moment?
  A: When he beat up the guy that beat me up
  Q: What does he bring to the family?
  A: He works hard for his family
  Q: What happened this year that you want to reference?
  A: He got a new phone
  Q: What tone do you want?
  A: Mix
[Card history] 1 card(s) previously generated for this recipient, most recent: Father's Day (Approved).
  Avoid repeating the same opening structure, angle, or emotional beat used in prior cards.
[Always include] <value if present>
```

Sections only appear when data exists. Null or empty fields produce no output. If the entire supplement has no useful data, `buildContextSupplement` returns `null` and nothing is injected — the prompt is byte-for-byte identical to the pre-context version.

### Context assembly in the route handler

```
POST /api/v2/generate-card
  ↓
Extract userId from x-user-id header
  ↓
If recipientId + userId both present:
  assembleRecipientContext(recipientId, userId)   ← 4 parallel DB queries
  ↓ (failure → warn log, recipientContext = null)
extractContextAvoids(recipientContext)            ← merge into avoidList
buildContextSupplement(recipientContext)          ← build prompt block
  ↓
buildSystemPrompt(... mergedAvoidList)
buildUserPrompt(... contextSupplement)
  ↓
OpenAI gpt-4o call
```

---

## Fallback Behavior

Five independently safe fallback layers:

| Condition | What happens |
|---|---|
| No `recipientId` in body | `recipientContext = null`; supplement = null; body fields only |
| No `x-user-id` header | Same as above — both are required |
| Wrong `userId` | Context assembles but returns zero profile data, zero answers (security gate); supplement = null; body fields only |
| Context assembly throws | `catch` logs WARN; `recipientContext` stays null; generation proceeds from body fields |
| Supplement is empty (no useful profile data) | `buildContextSupplement` returns null; user prompt unchanged |

The existing `relAnswers`, `details`, `avoidMentioning`, `senderName`, `signOff`, and `avoidList` body fields are the unconditional baseline. Context is always additive.

---

## Logging

Context metadata is logged. Private content is never logged.

```json
// With context (correct recipientId + userId):
{
  "recipientId": "1780699542420",
  "contextVersion": 1,
  "contextUsed": true,
  "briefingAnswers": 4,
  "hasCardHistory": true,
  "archived": false,
  "profileScore": 69
}

// Without context (missing recipientId or x-user-id):
{
  "recipientId": null,
  "hasUserId": false,
  "contextUsed": false
}

// Wrong userId (security gate working):
{
  "briefingAnswers": 0,
  "hasCardHistory": false,
  "profileScore": 0
}
```

No message content, card text, answer text, memories, or personal information in any log line.

---

## Test Results

**46 / 46 new tests pass. 66 / 66 original tests still pass.**

All tests use pure functions — no database, no mocking, no framework.

| Scenario | Tests |
|---|---|
| Full context — all sections present, avoids absent from supplement | 10 |
| Null context → null supplement and empty avoids | 2 |
| Wrong userId (empty context) → null supplement | 2 |
| Briefing answers — single event, multi-event grouped | 9 |
| Card history — present, absent | 6 |
| Things to avoid — comma-split, semicolon-split, empty, null, merging | 11 |
| Edge: archived flag, alwaysInclude, avoidList merge math | 6 |

---

## Live Smoke Test Results

Three calls made against the running server:

**Smoke 1 — Correct recipientId + userId**
- 3 cards generated ✅
- Context assembled: `briefingAnswers: 4`, `hasCardHistory: true`, `profileScore: 69`
- Father's Day briefing answers ("When he beat up the guy that beat me up") were available in the prompt

**Smoke 2 — No recipientId, no x-user-id header**
- 3 cards generated ✅
- Logged: `contextUsed: false` — clean fallback path

**Smoke 3 — Wrong userId**
- 3 cards generated ✅
- Security gate confirmed: `briefingAnswers: 0`, `profileScore: 0` — profile correctly suppressed

---

## Risks

| Risk | Severity | Notes |
|---|---|---|
| Context assembly adds ~10-50ms to generation latency | Low | Runs before the ~6s OpenAI call. Sub-1% overhead |
| Context adds tokens to the prompt | Low | Bounded by profile size; skipped Q&As already excluded at DB level |
| `thingsToAvoid` splitting on commas could mangle phrases with embedded commas | Very low | Real-world values are typically short phrases; fix later by enforcing semicolons in the UI |
| Supplement may repeat data already in `relAnswers` | Very low | AI treats repeated signals as reinforcement; two labeled blocks are clearly distinct |

---

## What This Unlocks

Every card generated through the v2 flow now automatically receives:
- Personality notes and traits from the recipient profile
- Structured interests (not just free-text)
- Favorite shared memories and inside jokes
- All non-skipped briefing Q&A answers for that event
- Prior card history (to avoid repetitive openings and angles)
- Hard-avoid instructions from the saved profile
- An "always include" instruction if the user set one

Recipients with richer profiles now produce materially better cards without any additional effort from the user at generation time.

---

*Checkpoint: 9d42471 — "Add recipient context to card generation for personalized messages"*
