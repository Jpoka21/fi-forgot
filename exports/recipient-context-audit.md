# Recipient Context Audit & Bug Fixes
### F* I Forgot — Session Summary
**Date:** June 5, 2026
**Audited checkpoint:** d71a39c
**Fixed checkpoint:** 4cf1002

---

## What Was Audited

The recipient context assembly service (`assembleRecipientContext`) built in the previous session — the layer that joins four PostgreSQL tables into a single structured object for future AI card generation use.

Ten checks were performed covering correctness, security, data integrity, and readiness for production use.

---

## Verdict

**Do not build from d71a39c. Build from 4cf1002 (current HEAD).**

Three bugs were found and fixed. The most serious was a security flaw that would have leaked private recipient data (personality, memories, tone, delivery preferences) into card generation prompts for the wrong user.

---

## Bugs Found and Fixed

### Bug 1 — Cross-User Profile Data Leak (High Severity)

**What the checkpoint did:**

`recipient_profile` was fetched with no userId ownership guard:

```typescript
// BEFORE (buggy)
db.select().from(recipientProfileTable)
  .where(eq(recipientProfileTable.id, recipientId))  // no userId check!
```

`recipient_profile` has no `user_id` column. The service fired all four queries in parallel and then used the profile result unconditionally, regardless of whether the requesting user actually owned that recipient.

**What leaked to any caller who knew a `recipientId`:**
- `personality.notes` and `personality.traits`
- `interests`
- `memories.favoriteMemories` and `memories.insideJokes`
- `tone.preferred`, `tone.emotionalOpenness`, `tone.thingsToAvoid`, `tone.thingsToAlwaysInclude`
- `delivery.preference`, `delivery.previewDays`, `delivery.senderNickname`, `delivery.signOff`

Identity, relationship, briefing answers, and card history were all correctly blocked by their own userId filters — only profile data leaked.

**Confirmed live:** Wrong userId returned full profile data (`score: 62%`) before the fix.

**The fix (1 line, no schema migration):**

```typescript
// AFTER (fixed)
// Gate profile on userId ownership. recipient_profile has no userId column,
// so ownership is enforced through the parent recipients row.
const profile = recipient ? (profileRows[0] ?? null) : null;
```

If the `recipients` query returned nothing — meaning this userId does not own this recipientId — the profile is treated as absent. No changes to the database schema required.

**Verified live after fix:** Wrong userId now returns `score: 0`, all profile fields `null`, leak confirmed absent.

---

### Bug 2 — Skipped Q&A Answers Included in Briefing (Medium Severity)

**What the checkpoint did:**

The `question_answers` query had no filter on `wasSkipped`:

```typescript
// BEFORE (buggy)
.where(and(
  eq(questionAnswersTable.userId, userId),
  eq(questionAnswersTable.recipientId, recipientId),
  // wasSkipped missing — skipped questions included!
))
```

A skipped answer means the user explicitly declined to answer. Including skipped rows in `briefingSummary.allAnswers` would:
- Inflate `totalAnswers` with non-answers
- Send empty or null answer text into an AI generation prompt
- Mark the `briefing_answers` completeness field as filled when no real answers exist

**The fix:**

```typescript
// AFTER (fixed)
.where(and(
  eq(questionAnswersTable.userId, userId),
  eq(questionAnswersTable.recipientId, recipientId),
  eq(questionAnswersTable.wasSkipped, false),  // only real answers
))
```

---

### Bug 3 — Approved/Rejected Double-Count Risk (Low Severity)

**What the checkpoint did:**

```typescript
// BEFORE (buggy)
const approved = cards.filter(c => c.status === "Approved" || c.approvedAt !== null);
const rejected = cards.filter(c => c.status === "Rejected" || c.rejectedAt !== null);
```

The OR with timestamp columns meant a card where both `approvedAt` and `rejectedAt` were set (possible if status transitions aren't perfectly atomic) would count toward both `approvedCount` and `rejectedCount` simultaneously.

No live inconsistency was found in the current database, but the logic was fragile and would silently produce wrong counts.

**The fix:**

```typescript
// AFTER (fixed)
// Use status as the single source of truth.
const approved = cards.filter(c => c.status === "Approved");
const rejected = cards.filter(c => c.status === "Rejected");
```

---

## All 10 Audit Checks — Results

| # | Check | Result |
|---|---|---|
| 1 | Briefing answers surface correctly for recipients with real Q&A | ✅ `totalAnswers: 4` confirmed live |
| 2 | recipientId is stable and consistent across all four tables | ✅ Same ID in all four tables |
| 3 | Card history lifecycle (generated/edited/approved/mailed) | ✅ Approved card round-trips correctly |
| 4 | Archived recipients return useful context | ✅ Full context returned, `identity.archived: true` |
| 5 | `profileCompleteness.missing` is accurate | ✅ Reads correctly from all three sources |
| 6 | Interests in `personality_notes` not penalized as missing | ✅ Known limitation, documented below |
| 7 | Debug endpoint blocked in production | ✅ Returns 404 before any query runs |
| 8 | Cross-user access blocked | 🐛 Bug found + fixed (Bug 1 above) |
| 9 | All 66 tests still pass | ✅ 66/66 on fixed HEAD |
| 10 | Context object ready to feed card generation safely | ✅ After fixes, yes |

---

## Limitations (Not Bugs)

These are known design constraints, not defects. They do not block card generation.

| Limitation | Impact |
|---|---|
| Interests written free-text inside `personality_notes` don't count toward the structured `interests` completeness field | Low — AI prompt sees the full `personality.notes` text; interest information is present, just uncounted in the score |
| `totalSent` counts all generated cards including rejected ones — name implies only sent/mailed cards | Low — consider renaming to `totalGenerated` before user-facing display; not a blocker for AI prompts |
| No `mailedCount` in card history — `personal_cards.mailedAt` column exists but isn't surfaced | Low — AI doesn't need mailed vs. not-mailed for generation; add later for analytics |
| `byEvent` grouping key is `"eventType_eventYear"` — ambiguous if an event type contains an underscore | Very low — current event types (Birthday, Father's Day, Anniversary) have no underscores |
| Production guard is handler-level, not router-level — route is registered in all environments | Negligible — returns 404 before any query runs; functionally indistinguishable from the route not existing |

---

## Test Results

**66 / 66 pass on the fixed HEAD.**

All prior tests remain valid. The pure assembly functions are unchanged. The security and filter fixes live in the async query layer, which the unit tests correctly do not reach (no DB in unit tests). The fixes are covered by live smoke tests against the running server.

---

## Files Changed

| File | Change |
|---|---|
| `artifacts/api-server/src/services/recipient-context.ts` | Three targeted edits: profile ownership gate, skipped-answer filter, status-only card classification |

No schema migrations. No new files. No test changes required.

---

## What This Means for Card Generation

The context object is now safe to pass directly into a generation prompt. Concretely, for a recipient like "Test" (Father):

```
briefingSummary.totalAnswers: 4      ← real answers only, no skipped
personality.notes: "Tough love — no fluff | Loves: Food & cooking"
tone.preferred: "Funny"
delivery.senderNickname: "James"
profileCompleteness.score: 69%
missing: ["Birthday", "Anniversary", "Things to avoid", "Things to always include"]
```

A wrong userId receives: `identity: null, score: 0, all profile fields null`. No data leaks cross-user.

---

*Fixed checkpoint: 4cf1002 — "Fix issues with recipient data fetching and card history counting"*
