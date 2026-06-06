# Question Engine v1 — Implementation Summary

**Date:** June 06, 2026  
**Checkpoint:** `7eec5dd`

---

## What was built

A lightweight server-side service that reads a recipient's profile completeness
and returns the single best next question to ask the user about that recipient.
No answers are saved by this service — it only suggests. No database schema was
changed. No existing flows were modified.

---

## Files Added / Changed

| File | Action | Lines |
|---|---|---|
| `artifacts/api-server/src/services/question-engine.ts` | Created | ~170 |
| `artifacts/api-server/src/__tests__/question-engine.test.ts` | Created | ~250 |
| `artifacts/api-server/src/routes/debug.ts` | Modified | +45 |
| `.agents/memory/recipient-intelligence.md` | Created | documentation |

---

## How the engine works

1. `assembleRecipientContext(recipientId, userId)` returns a `RecipientContext`
   object whose `profileCompleteness.missing` field contains a list of label
   strings (e.g. `"Things to avoid"`, `"Interests"`) that have no data yet.

2. `getNextQuestion(context)` filters the in-code question bank against the
   `missing` set, sorts candidates by priority, and returns a single
   `SuggestedQuestion` — or `null` if nothing is missing.

3. `getAllPendingQuestions(context)` returns the full sorted queue for display
   purposes (e.g. "3 questions remaining").

4. `{name}` placeholders in question and reason templates are replaced with
   `context.identity?.firstName ?? "them"` before the result is returned.

---

## Question Bank

13 entries covering every completeness field. Within the same priority tier,
earlier entries in the array win.

```
Priority   Field                  Question (template)
─────────────────────────────────────────────────────────────────────────────
highest    Things to avoid        "Is there anything we should never mention
                                   in a card to {name}?"

high       Interests              "What is {name} really into these days?"
high       Favorite memories      "What's a favorite memory you share with {name}?"
high       Inside jokes           "Is there an inside joke or a phrase that only
                                   you and {name} would understand?"

medium     Personality notes      "How would you describe {name} in your own words?"
medium     Personality traits     "How would you describe {name}'s personality —
                                   a few words or phrases?"
medium     Preferred tone         "What tone feels right for cards to {name} —
                                   funny, heartfelt, romantic, or something else?"
medium     Emotional openness     "How emotionally open do you want cards to {name}
                                   to feel — light and fun, or deep and heartfelt?"
medium     Things to always inc.  "Is there anything you always want included
                                   in a card to {name}?"

low        Birthday               "When is {name}'s birthday?"
low        Anniversary            "Is there a recurring date we should know about
                                   for {name}?"
low        Delivery preference    "How would you like cards to {name} handled —
                                   mailed directly to them, or sent to you first?"
low        Briefing answers       "Tell us one specific thing about {name} right now —
                                   a memory, a detail, anything personal."
```

**Priority rationale:**

- `highest` — "Things to avoid" is the most important safety guardrail. It
  prevents cards from touching sensitive topics and must always be asked first.
- `high` — Interests, memories, and inside jokes are the raw material that makes
  cards feel personal. Without them, every card is generic.
- `medium` — Personality, tone, and always-include inform voice and style. Still
  important, but the engine can produce a reasonable card without them.
- `low` — Birthday, anniversary, delivery preference, and briefing answers are
  normally set at recipient-creation time. They surface only when everything
  above is already filled.

---

## Public API surface

```typescript
// services/question-engine.ts

export type QuestionPriority = "highest" | "high" | "medium" | "low";

export type QuestionCategory =
  | "safety"       // things_to_avoid
  | "personality"  // who they are
  | "memories"     // shared history
  | "tone"         // emotional calibration
  | "delivery"     // logistics
  | "setup";       // dates and one-time info

export interface SuggestedQuestion {
  fieldKey:   string;          // e.g. "things_to_avoid"
  fieldLabel: string;          // e.g. "Things to avoid"
  category:   QuestionCategory;
  priority:   QuestionPriority;
  question:   string;          // {name} already substituted
  reason:     string;          // why this question improves card quality
}

// Returns the single best next question, or null if nothing is missing.
export function getNextQuestion(context: RecipientContext): SuggestedQuestion | null;

// Returns all pending questions sorted by priority.
export function getAllPendingQuestions(context: RecipientContext): SuggestedQuestion[];
```

---

## Debug Endpoint

Available in development only (`NODE_ENV === "development"`).

```
GET /api/debug/recipient-next-question/:recipientId
Header: x-user-id: <user-uuid>

Response:
{
  "recipientId": "...",
  "firstName": "Sarah" | null,
  "profileCompleteness": {
    "score": 69,
    "filled": ["Personality traits", "Preferred tone", ...],
    "missing": ["Birthday", "Things to avoid", ...]
  },
  "nextQuestion": {
    "fieldKey":   "things_to_avoid",
    "fieldLabel": "Things to avoid",
    "category":   "safety",
    "priority":   "highest",
    "question":   "Is there anything we should never mention in a card to Sarah?",
    "reason":     "Prevents cards from hitting sensitive topics — the most important guardrail we can have."
  },
  "pendingQueue": [ ...all missing questions sorted by priority... ]
}
```

Returns `401` if `x-user-id` header is missing.  
Returns `404` outside development.

---

## Live smoke test results

**"Test" / Dad** — profile score 69%  
Missing: Birthday, Anniversary, Things to avoid, Things to always include

```
nextQuestion: things_to_avoid (highest)
"Is there anything we should never mention in a card to Test?"

pendingQueue (4 items):
  [highest] things_to_avoid    → Is there anything we should never mention in a card to Test?
  [medium]  always_include     → Is there anything you always want included in a card to Test?
  [low]     birthday           → When is Test's birthday?
  [low]     anniversary        → Is there a recurring date we should know about for Test?
```

**Stacy / Wife** — profile score 46%  
Missing: 7 fields including Things to avoid, Interests, Inside jokes

```
nextQuestion: things_to_avoid (highest)
"Is there anything we should never mention in a card to Stacy?"
pendingQueue: 7 items
```

---

## Tests — 48 / 48 passed

| Test group | Count |
|---|---|
| `getNextQuestion` — profile complete → null | 1 |
| Unknown labels skipped gracefully | 1 |
| Highest priority wins over all others | 9 |
| High beats medium (two scenarios) | 4 |
| Medium returned when no high present | 2 |
| Bank order determines winner within same priority tier | 3 |
| Low priority surfaces when nothing higher is missing | 2 |
| `{name}` substitution in question and reason | 4 |
| `identity: null` → falls back to `"them"` | 2 |
| Single missing field — full SuggestedQuestion shape | 4 |
| All 13 fields missing → `things_to_avoid` wins | 2 |
| `getAllPendingQuestions` — complete, sorted, unknown, all 13, shape | 14 |

**Regression:** all 160 tests across the three test files continue to pass.

```
recipient-context.test.ts         66 / 66 ✅
recipient-context-prompt.test.ts  46 / 46 ✅
question-engine.test.ts           48 / 48 ✅ (new)
────────────────────────────────────────────
Total                            160 / 160
```

---

## Design decisions

- **In-code question bank** — the bank lives in `question-engine.ts`, not the
  database. This keeps v1 simple and fast. A future v2 could move it to a table
  if the product needs per-user or per-recipient custom questions.

- **Labels as keys, not fieldKeys** — `profileCompleteness.missing` contains
  human-readable label strings (source of truth: `COMPLETENESS_FIELDS` in
  `recipient-context.ts`). The question bank maps by those exact labels. This
  means the bank is slightly fragile to label renames, but avoids an extra
  lookup layer.

- **Pure functions only** — the engine has no side effects, no DB calls, no
  network calls. Calling it is always safe and cheap.

- **No answer saving** — the engine only suggests. The existing briefing flow
  handles actual answer collection.

- **`things_to_avoid` reason has no `{name}` placeholder** — it is a general
  safety statement. All other high/medium entries do reference `{name}` in their
  reason text.

---

## What comes next (not built yet)

- Wire `getNextQuestion` into a real API endpoint (`GET /api/v2/recipients/:id/next-question`)
  for the frontend to consume.
- Surface the question card in the UI (likely on the Recipient detail page or
  dashboard).
- Decide whether to store answers via the existing `question_answers` table or
  a new dedicated mechanism.
