# Phase 1: Recipient Intelligence — Server Sync
**Date:** June 5, 2026  
**Checkpoint:** `5d399a6`

---

## What changed

### 1. New database tables

Two new tables were created and pushed to PostgreSQL.

#### `personal_cards`
Stores every card event (generated, approved, mailed, rejected) as a permanent server-side record.

| Column | Type | Description |
|---|---|---|
| `id` | text (PK) | Card ID from localStorage |
| `user_id` | text | User who owns the card |
| `recipient_id` | text | Recipient the card is for |
| `event_type` | text | Holiday or event name |
| `status` | text | Card status at time of write |
| `approved_at` | timestamp | When the user approved it |
| `mailed_at` | timestamp | When it was mailed |
| `data` | jsonb | Full `CardOrder` object (backward-compat) |
| `created_at` | timestamp | Row creation time |
| `updated_at` | timestamp | Last upsert time |

#### `question_answers`
Stores every briefing Q&A pair as an individual persistent row.

| Column | Type | Description |
|---|---|---|
| `id` | text (PK) | `${briefingId}_${questionKey}` — idempotent |
| `user_id` | text | User who answered |
| `recipient_id` | text | Recipient the answer is about |
| `event_type` | text | Event context (Birthday, etc.) |
| `event_year` | int | Year of the event |
| `question_key` | text | Machine key for the question |
| `question_text` | text | Human-readable question |
| `answer_text` | text | What the user said |
| `was_skipped` | boolean | Whether the user skipped it |
| `trigger_type` | text | `event_briefing` or similar |
| `created_at` | timestamp | Row creation time |

---

### 2. New API endpoints

All routes require an `x-user-id` header (reuses existing `syncHeaders()` helper on the client).

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/personal/cards` | Returns all cards for the current user |
| `POST` | `/api/personal/cards` | Upserts a single card by `id` |
| `GET` | `/api/personal/briefings` | Returns all Q&A rows for the current user |
| `POST` | `/api/personal/briefings` | Saves all answers in a briefing (bulk upsert) |

**Source file:** `artifacts/api-server/src/routes/personal-history.ts`

---

### 3. Frontend changes (zero UI impact)

#### `artifacts/fi-forgot/src/lib/data.ts`
Three existing functions now fire a silent background sync to the server after writing to localStorage:

- `saveCard()` — syncs after every new card is created
- `updateCard()` — syncs after every card status change
- `saveBriefing()` — syncs all Q&A answers for an event

Two new exported functions handle server-to-local hydration on login:

- `hydrateCardsFromServer(userId)` — fetches the user's card history from the server and merges into localStorage (server wins on conflicts)
- `hydrateBriefingsFromServer(userId)` — fetches Q&A rows and stores them locally under `briefing_<recipientId>_<event>_<year>`

#### `artifacts/fi-forgot/src/lib/auth-context.tsx`
Three hydration calls now fire on login (after the user's `userId` is confirmed):

```ts
hydrateRecipientsFromServer(d.userId).catch(() => {});  // existing
hydrateCardsFromServer(d.userId).catch(() => {});        // new
hydrateBriefingsFromServer(d.userId).catch(() => {});    // new
```

---

## What did NOT change

- `DATA_VERSION` is still `"5"` — no localStorage wipe risk
- `personal_recipients` blob table — untouched
- All existing pages, routes, and UI components — unchanged
- Marketing site — unchanged
- Existing recipient sync — unchanged

---

## How existing users are affected

On next login, the three hydration functions fire automatically:

1. If the server has data the client doesn't, it is written to localStorage.
2. If the client has cards/briefings the server doesn't, they remain in localStorage (they will sync up on the next save/update action).
3. No data is deleted from either side.

---

## Files changed

| File | Change |
|---|---|
| `lib/db/src/schema/personal-cards.ts` | **New** — Drizzle schema for `personal_cards` |
| `lib/db/src/schema/question-answers.ts` | **New** — Drizzle schema for `question_answers` |
| `lib/db/src/schema/index.ts` | Added exports for both new tables |
| `artifacts/api-server/src/routes/personal-history.ts` | **New** — GET/POST routes for cards and briefings |
| `artifacts/api-server/src/routes/index.ts` | Mounted `personalHistoryRouter` |
| `artifacts/fi-forgot/src/lib/data.ts` | Added server sync in save functions + two hydration exports |
| `artifacts/fi-forgot/src/lib/auth-context.tsx` | Wired card and briefing hydration on login |
