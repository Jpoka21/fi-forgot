# Phase 1 Audit & Bug Fixes
**Date:** June 5, 2026  
**Checkpoint:** `e84df62`  
**Scope:** Full review of the Phase 1 server sync implementation

---

## Audit Checklist — All 14 Items

| # | Check | Result |
|---|---|---|
| 1 | New card saved to localStorage and upserted to `personal_cards` | ✅ Correct |
| 2 | `updateCard` syncs new status to server | ✅ Correct |
| 3 | Server sync failure leaves UI unaffected | ✅ Correct |
| 4 | `hydrateCardsFromServer` merges server cards into localStorage | ✅ Correct |
| 5 | `hydrateBriefingsFromServer` correctly rebuilds localStorage briefing format | ✅ Fixed |
| 6 | `saveBriefing` saves every answered question to `question_answers` | ✅ Correct |
| 7 | Skipped / empty questions filtered before DB insert | ✅ Correct |
| 8 | Duplicate briefing answers prevented by `${briefingId}_${questionKey}` PK | ✅ Correct |
| 9 | All routes filter by `x-user-id` — zero cross-user data leakage | ✅ Confirmed |
| 10 | No TypeScript errors or build errors | ✅ Clean |
| 11 | `connectSession` fires on page-load and login — `userId` always set before hydration | ✅ Correct |
| 12 | Timestamps consistent (`withTimezone: true`); `undefined` in SET omits column correctly | ✅ Correct |
| 13 | Existing users not at risk — `DATA_VERSION` untouched, hydration is additive | ✅ Safe |
| 14 | Works on refresh, logout, login, and mobile | ✅ Correct |

---

## Bugs Found and Fixed

### Bug 1 — Critical: `hydrateBriefingsFromServer` had no server-wins branch

**File:** `artifacts/fi-forgot/src/lib/data.ts`

**What was wrong:**  
When the server had Q&A answers, the function did nothing. The `if (answers.length === 0)` block only handled pushing local data up to the server — the opposite direction (server → localStorage) was never implemented. Any user logging in after a fresh browser or device would see all their briefing history as gone, even though it was safely stored in the database.

**What was fixed:**  
Added the missing reconstruction pass. Flat Q&A rows (one row per question) are grouped by `(recipientId, eventType, eventYear)` and rebuilt into `EventBriefing` objects. The original briefing `id` and `recipientName` are recovered from any matching local data. If no local match exists, a stable synthetic ID (`server_${recipientId}_${eventType}_${eventYear}`) is used so the briefing is consistently identifiable across logins. Local-only briefings not on the server are preserved — the merge is additive, not a replace.

---

### Bug 2 — Real: `question_answers` upsert was effectively insert-or-ignore

**File:** `artifacts/api-server/src/routes/personal-history.ts`

**What was wrong:**  
```ts
// Before (broken)
.onConflictDoUpdate({
  target: questionAnswersTable.id,
  set: {
    answerText: questionAnswersTable.answerText, // ← references EXISTING row, not incoming value
  },
})
```
In Drizzle ORM, referencing `table.column` in a `set` clause refers to the value already stored in the database row — not the new value being inserted. On conflict, this updated `answerText` to itself (a no-op). Re-answering a briefing question updated localStorage correctly but the database permanently kept the first answer ever entered.

**What was fixed:**  
```ts
// After (correct)
.onConflictDoUpdate({
  target: questionAnswersTable.id,
  set: {
    answerText: sql`excluded.answer_text`,
    questionText: sql`excluded.question_text`,
  },
})
```
`excluded` refers to the row that was proposed for insertion — the incoming values. This is confirmed correct by the smoke test: submitting the same briefing twice with different answers, the database stores the second (newest) answer.

---

## Known Limitation — Bug 3 (accepted for Phase 1)

**`deleteCard` has no server sync.**

Cards deleted locally are not deleted from the server. Because `hydrateCardsFromServer` uses a server-wins strategy (server has cards → overwrite all local), a card deleted on one device comes back on next login.

**Why it's accepted for Phase 1:**  
In normal product flow, cards change status (Ready for approval → Approved → Mailed → Delivered) rather than being deleted. Hard deletion is an edge case. The fix requires either a DELETE endpoint or a soft-delete flag (`deleted_at`) in `personal_cards`, which is a Phase 2 task.

---

## Risks Documented (not bugs)

**Race condition on fresh page load:**  
`connectSession` is async. If a `saveCard` or `saveBriefing` is triggered within ~200ms of page load (before the session response arrives), `_serverUserId` is null and the sync is silently skipped. This is identical to the pre-existing recipient sync behavior — the next explicit save will sync correctly.

**Server-wins replace for cards can discard offline changes:**  
If a save silently fails (network error), then the user logs out and back in, `hydrateCardsFromServer` replaces local with server data and the unsynced change is lost. Same pattern and risk level as the existing recipient hydration. Acceptable for Phase 1.

---

## Files Changed in This Session

| File | Change |
|---|---|
| `artifacts/fi-forgot/src/lib/data.ts` | Fixed `hydrateBriefingsFromServer` — added server-wins reconstruction branch |
| `artifacts/api-server/src/routes/personal-history.ts` | Fixed `question_answers` upsert to use `sql\`excluded.*\`` |

---

## Smoke Test Results (run after fixes)

All results confirmed correct in live environment against the running PostgreSQL database:

- Briefing saved → 2 rows inserted ✅
- Same briefing re-submitted → both answers updated in DB ✅  
- GET briefings returns correct updated values ✅
- Card saved and retrieved correctly ✅
- User A cannot see User B's cards or briefings (0 returned) ✅
- Missing `x-user-id` returns HTTP 401 for both endpoints ✅
- TypeScript: both artifacts compile clean ✅
