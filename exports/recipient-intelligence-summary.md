# Recipient Intelligence Architecture
### F* I Forgot — Session Summary
**Date:** June 5, 2026

---

## What Was Built

A server-side **context assembly layer** that joins normalized PostgreSQL tables into a single structured object per recipient — designed to feed directly into AI card generation prompts.

---

## Files Created or Changed

| File | What Changed |
|---|---|
| `artifacts/api-server/src/services/recipient-context.ts` | New — context assembly service |
| `artifacts/api-server/src/routes/debug.ts` | New — dev-only inspection endpoint |
| `artifacts/api-server/src/__tests__/recipient-context.test.ts` | New — 66 unit tests |
| `artifacts/api-server/src/routes/index.ts` | Modified — registered debug router |

---

## How It Works

`assembleRecipientContext(recipientId, userId)` fires four database queries in parallel, then passes the results through pure assembly functions — one per concern:

```
Promise.all([
  recipients WHERE id=? AND user_id=?
  recipient_profile WHERE id=?
  question_answers WHERE user_id=? AND recipient_id=?
  personal_cards WHERE user_id=? AND recipient_id=?
])
  → buildIdentity()          Full name, active/archived status
  → buildRelationship()      Type (Wife/Mom/Friend), birthday, anniversary
  → buildPersonality()       Freeform notes, personality traits array
  → buildMemories()          Favorite memories, inside jokes
  → buildTone()              Preferred tone, emotional openness (1-10), avoids/includes
  → buildDelivery()          Mail vs. email, preview days, sign-off, sender nickname
  → buildCardHistorySummary() Cards sent, approved/rejected/edited counts, event types
  → buildBriefingSummary()   Q&A answers grouped by event type + year
  → buildProfileCompleteness() Score (0-100) + filled/missing field lists
```

Every build function is **pure** — rows in, typed struct out, no side effects or database calls. That is what makes them trivially testable and safe to unit-test without mocking.

---

## Live Output Example (real recipient: Stacy)

```json
{
  "contextVersion": 1,
  "generatedAt": "2026-06-05T23:04:31.728Z",
  "recipientId": "r_1780079620945",
  "identity": {
    "fullName": "Stacy",
    "active": true,
    "archived": false
  },
  "relationship": {
    "type": "Wife",
    "birthday": "2026-06-24"
  },
  "personality": {
    "notes": "Interests: loves anything Greek. Loves her children"
  },
  "memories": {
    "favoriteMemories": "All of our Fire Island Adventures before we got married. Our honeymoon to Greece"
  },
  "tone": {
    "preferred": "Sweet",
    "emotionalOpenness": 5
  },
  "delivery": {
    "preference": "Mail it to me",
    "senderNickname": "Love James"
  },
  "cardHistory": { "totalSent": 0 },
  "briefingSummary": { "totalAnswers": 0 },
  "profileCompleteness": {
    "score": 46,
    "filled": [
      "Birthday",
      "Personality notes",
      "Favorite memories",
      "Preferred tone",
      "Emotional openness",
      "Delivery preference"
    ],
    "missing": [
      "Anniversary",
      "Personality traits",
      "Interests",
      "Inside jokes",
      "Things to avoid",
      "Things to always include",
      "Briefing answers"
    ]
  }
}
```

---

## Debug Endpoint

```
GET /api/debug/recipient-context/:recipientId
Header: x-user-id: <userId>
```

- Returns the full assembled context as JSON
- **Dev-only** — returns 404 in production (`NODE_ENV !== "development"`)
- Returns 401 if `x-user-id` header is missing
- Degrades gracefully if a recipient doesn't exist (returns nulls, score=0)

---

## Test Results

**66 / 66 passed.** All tests run with `pnpm dlx tsx` — no test framework dependency.

| Suite | Tests |
|---|---|
| `CONTEXT_VERSION` constant | 1 |
| `buildIdentity` | 11 |
| `buildRelationship` | 6 |
| `buildPersonality` | 5 |
| `buildMemories` | 5 |
| `buildTone` | 4 |
| `buildDelivery` | 4 |
| `buildCardHistorySummary` | 18 |
| `buildBriefingSummary` | 8 |
| `buildProfileCompleteness` | 11 |

---

## Failure Modes & Mitigations

| Risk | Mitigation |
|---|---|
| `recipients` row doesn't exist | `identity` and `relationship` return `null`; all other sections degrade to empty/null |
| `recipient_profile` row missing | All profile fields return `null`; completeness score reflects the gaps |
| Empty strings stored as "filled" | Completeness check uses `!!value` — empty string counts as missing |
| Debug endpoint in production | Handler checks `NODE_ENV !== "development"` and returns 404 before any query runs |
| Context shape changes over time | `CONTEXT_VERSION = 1` constant — bump it when shape changes so callers can detect stale caches |

---

## Constants

```
CONTEXT_VERSION = 1   (bump when context shape changes)
DATA_VERSION    = "5" (do NOT change — controls blob table format)
```

---

## What This Unlocks

The `profileCompleteness.missing` array is already structured to feed the question engine — it lists exactly which fields are empty per recipient. When card generation is wired up, calling `assembleRecipientContext()` will automatically include Stacy's Fire Island memories, "Love James" sign-off, and Sweet tone in the AI prompt. No additional joins or queries needed at generation time.

---

*Checkpoint committed: d71a39c — "Add a service to assemble recipient intelligence for future use"*
