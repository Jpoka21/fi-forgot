# Bug Fix: Profile Question Loop

**Date:** June 8, 2026
**Project:** F.I. Forgot — relationship autopilot greeting card service

---

## What Was Broken

After answering a profile-gap question on a recipient's profile page (e.g. "Is there anything we should never mention in a card to Test?"), the exact same question reappeared immediately after saving. The answer was successfully stored in the database, but the app had no way to see it.

---

## Root Cause

The system checks "profile completeness" to decide which question to ask next. That check read exclusively from the `recipient_profile` table:

```
buildProfileCompleteness()
  └─ c.tone.thingsToAvoid  →  reads recipient_profile.thingsToAvoid  →  null
  └─ field stays in missing[]  →  same question returns
```

But the `answer-question` endpoint wrote answers to a different table — `question_answers` — and never touched `recipient_profile`. So the profile column stayed `null` forever, the field stayed "missing", and the same question looped endlessly.

The save was working. The data was there. The completeness check just wasn't looking at it.

---

## The Fix

**One change, one file:** `artifacts/api-server/src/services/recipient-context.ts`

`buildProfileCompleteness()` already received the full briefing summary (all saved answers) as an input — it just wasn't using it for completeness. Profile-gap answers have a stable discriminator: `eventType === "Profile"`. The fix builds a lookup set from those answers and ORs it into every field check:

```typescript
// Build a set of fields the user has already answered via the question engine
const profileGapAnswered = new Set(
  input.briefing.allAnswers
    .filter(a => a.eventType === "Profile")
    .map(a => a.questionKey),
);

// A field is filled if the profile column has data OR a gap answer exists for it
if (field.check(input) || profileGapAnswered.has(field.key)) {
  filled.push(field.label);
}
```

Now, the instant an answer is saved (e.g. `questionKey: "things_to_avoid"`), the next call to `assembleRecipientContext()` sees that field as filled, drops it from `missing[]`, and returns the next highest-priority question instead.

---

## What Did Not Change

- The `question_answers` table — no schema changes.
- The `recipient_profile` table — no schema changes.
- The `answer-question` endpoint — still writes exactly as before.
- The question engine priority ordering — unchanged.
- All existing data — unaffected.

---

## Tests Added (4 new regression cases)

| Test | Verifies |
|---|---|
| `profile_gap answer satisfies completeness (bug regression)` | The exact bug scenario: profile column is null, but a gap answer exists — field must be filled |
| `multiple profile_gap answers each fill their field` | Answering 3 fields at once correctly marks all 3 as filled |
| `non-Profile eventType does NOT satisfy completeness` | Normal event-briefing answers (e.g. for a Birthday event) don't accidentally fill unrelated profile fields |
| *(updated count assertions)* | Confirmed that a gap answer also satisfies the "Briefing answers" field (since `totalAnswers > 0`) — correct and expected behavior |

**Final test count: 145 passed, 0 failed** (77 context tests + 48 question-engine tests + 20 integration smoke tests)

---

## Files Changed

| File | Change |
|---|---|
| `artifacts/api-server/src/services/recipient-context.ts` | Added `profileGapAnswered` Set to `buildProfileCompleteness()`; 10 lines added |
| `artifacts/api-server/src/__tests__/recipient-context.test.ts` | 4 new test sections added as regression coverage |
