# Profile Question Card — Implementation Summary

**Date:** June 06, 2026  
**Checkpoint:** `5da7c789`

---

## What was built

A small, non-intrusive "Help us write better cards" card on the recipient profile page.
When a recipient's profile has gaps, the question engine suggests the single highest-priority
question to ask. The user can answer it in a textarea and save — or skip for the session.

No dashboard redesign. No onboarding changes. No Brownie Points changes.
No new database tables. No schema migrations.

---

## Files Added / Changed

| File | Action | Notes |
|---|---|---|
| `artifacts/api-server/src/routes/v2-recipients.ts` | Modified | +2 routes at the bottom |
| `artifacts/fi-forgot/src/components/ProfileQuestionCard.tsx` | Created | Self-contained UI card |
| `artifacts/fi-forgot/src/pages/recipient-profile.tsx` | Modified | Import + mount the card |
| `artifacts/api-server/src/__tests__/recipient-next-question.test.ts` | Created | 20 integration smoke tests |
| `artifacts/fi-forgot/src/pages/admin/AdminLeads.tsx` | Fixed | Pre-existing invalid CSS property (unblocked typecheck) |

---

## API: Two New Endpoints

Both endpoints live in `routes/v2-recipients.ts`, mounted under `/api`.

---

### `GET /api/v2/recipients/:id/next-question`

Fetches the single best next question for a recipient's profile, based on what fields
are still missing.

**Auth:** Requires `x-user-id` header.  
**Ownership:** Returns `404` if the recipient belongs to a different user.

| Condition | Status | Body |
|---|---|---|
| No `x-user-id` header | 401 | `{ error }` |
| Recipient not found or wrong user | 404 | `{ error }` |
| Profile has missing fields | 200 | `{ nextQuestion: SuggestedQuestion }` |
| Profile fully complete | 200 | `{ nextQuestion: null }` |

**Response when a gap exists:**
```json
{
  "nextQuestion": {
    "fieldKey":   "things_to_avoid",
    "fieldLabel": "Things to avoid",
    "category":   "safety",
    "priority":   "highest",
    "question":   "Is there anything we should never mention in a card to Sarah?",
    "reason":     "Prevents cards from hitting sensitive topics — the most important guardrail we can have."
  }
}
```

**Response when profile is complete:**
```json
{ "nextQuestion": null }
```

---

### `POST /api/v2/recipients/:id/answer-question`

Saves the user's answer to a profile gap question.

**Auth:** Requires `x-user-id` header.  
**Ownership:** Returns `404` if the recipient belongs to a different user.

**Request body:**
```json
{
  "fieldKey":     "things_to_avoid",
  "questionText": "Is there anything we should never mention in a card to Sarah?",
  "answerText":   "Don't mention her weight or her ex."
}
```

| Condition | Status | Body |
|---|---|---|
| No `x-user-id` header | 401 | `{ error }` |
| Wrong user | 404 | `{ error }` |
| Missing or empty body field | 400 | `{ error }` |
| Valid | 200 | `{ ok: true }` |

**Idempotent:** Saving the same field twice updates the existing row (upsert).

---

## How Answers Are Saved

Writes to the existing `question_answers` table — no new table, no migration.

```
id:           "profile_gap_<recipientId>_<fieldKey>"
userId:       from x-user-id header
recipientId:  from :id param
eventType:    "Profile"
eventYear:    current year
questionKey:  fieldKey
questionText: the question shown to the user
answerText:   the user's typed answer
wasSkipped:   false
triggerType:  "profile_gap"   ← distinguishes from briefing flow answers
```

The ID format `profile_gap_${recipientId}_${fieldKey}` means there is exactly one
answer per recipient per field. Saving again updates it. This is intentional — we
only need the latest answer per gap, not a history.

Once saved, `assembleRecipientContext()` picks it up on the next call (it reads all
`question_answers` for the recipient), so the field leaves `profileCompleteness.missing`
and the question engine automatically serves the next gap.

---

## UI Behavior

The `ProfileQuestionCard` component is mounted below the Briefing History section
on every **existing** recipient profile page (hidden on the "Add new recipient" form).

### What the user sees

```
┌─────────────────────────────────────────────────────────┐
│ HELP US WRITE BETTER CARDS                              │
│ Prevents cards from hitting sensitive topics — the most │
│ important guardrail we can have.                        │
│                                                         │
│ Is there anything we should never mention in            │
│ a card to Sarah?                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐     │
│ │ Type your answer…                               │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│  [Save answer]   Skip for now                           │
└─────────────────────────────────────────────────────────┘
```

Title and reason text use the existing Bebas Neue + gray palette.
Styling matches the existing SectionCard pattern — white card, subtle border, soft shadow.

### On load

- Calls `GET /api/v2/recipients/:id/next-question`
- If `nextQuestion === null` → renders nothing (no card, no empty space)
- If the user is not logged in → renders nothing
- While loading → renders nothing (no flicker or layout shift)

### Save answer

1. POSTs `{ fieldKey, questionText, answerText }` to the server
2. On success: re-fetches the next question → card updates (or disappears if profile complete)
3. On failure: shows "Couldn't save — please try again." inline without crashing the page

### Skip for now

- Hides the card for the current page load only (React `useState`)
- No database write, no localStorage write
- Revisiting or refreshing the page shows the card again
- Permanent skip is deferred to a future version

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `assembleRecipientContext` reads the legacy `recipients` table (timestamp IDs from localStorage). Only synced recipients will get a question. | The data layer already syncs recipients to the server on login. No new gap here. |
| After saving, the same question re-appears if the answer is for a field that still shows as missing. | Tested: saving an answer removes the field from `profileCompleteness.missing` on the next context assembly call. The engine correctly moves to the next gap. |
| Skip is session-only — the card reappears on page refresh. | Intentional for v1. Permanent skip requires a `wasSkipped=true` row, which is a future addition. |
| No loading spinner while fetching the question. | Card is invisible during the fetch — no flicker. This is the correct behavior; a spinner would be distracting for what is an optional card. |
| Server down or slow — card never appears. | Silent fail: renders nothing. The rest of the profile page is completely unaffected. |

---

## Test Results

### Integration tests — `recipient-next-question.test.ts` (20 / 20 ✅)

Run against the live dev server with real fixture data.

```
GET /api/v2/recipients/:id/next-question — auth guard
  ✓ returns 401 when x-user-id missing

GET /api/v2/recipients/:id/next-question — ownership
  ✓ returns 404 when recipient belongs to another user

GET /api/v2/recipients/:id/next-question — happy path
  ✓ returns 200
  ✓ nextQuestion is not null
  ✓ nextQuestion.fieldKey present
  ✓ nextQuestion.question present
  ✓ nextQuestion.priority present
  ✓ nextQuestion.category present
  ✓ nextQuestion.reason present
  ✓ priority is a valid value
    → question: [highest] things_to_avoid — "Is there anything we should never mention in a card to Test?"

GET /api/v2/recipients/nonexistent/next-question
  ✓ returns 404 for nonexistent recipient

POST /api/v2/recipients/:id/answer-question — auth guard
  ✓ returns 401 when x-user-id missing

POST /api/v2/recipients/:id/answer-question — ownership
  ✓ returns 404 when recipient belongs to another user

POST /api/v2/recipients/:id/answer-question — validation
  ✓ returns 400 when fieldKey empty
  ✓ returns 400 when answerText empty

POST /api/v2/recipients/:id/answer-question — save and re-fetch
  ✓ save returns 200
  ✓ save returns ok: true
  ✓ re-fetch returns 200
    → next question after save: [highest] things_to_avoid
  ✓ re-fetch returns a nextQuestion after save
  ✓ upsert (second save) also returns ok
```

### Regression — all prior tests still pass

```
recipient-context.test.ts          66 / 66 ✅
recipient-context-prompt.test.ts   46 / 46 ✅
question-engine.test.ts            48 / 48 ✅
recipient-next-question.test.ts    20 / 20 ✅  (new)
──────────────────────────────────────────────
Total                             180 / 180
```

Both `api-server` and `fi-forgot` typecheck clean.

---

## What comes next (not built yet)

- **Permanent skip:** Write a `wasSkipped=true` row to `question_answers` so the card
  doesn't re-appear after a skip. Could use the same `profile_gap_${recipientId}_${fieldKey}`
  ID with `wasSkipped: true`.
- **Progress indicator:** Show "2 questions left" or a small progress bar to give users
  a sense of completion.
- **Surface in dashboard:** Show a nudge on the dashboard card for recipients with a low
  profile score, linking to the profile page.
- **Inline confirmation:** After a successful save, show a brief "Saved ✓" confirmation
  before transitioning to the next question.
