# Normalized Personal Recipient Storage
**Date:** June 5, 2026  
**Checkpoint:** `9a2b1a0`

---

## What This Step Does

Adds two normalized PostgreSQL tables alongside the existing `personal_recipients` blob table. Every time a personal recipient is saved, data now flows into three places:

1. `localStorage` — unchanged, still the UI's source of truth
2. `personal_recipients` — existing blob table, unchanged, still the hydration source
3. `recipients` — new normalized identity/contact table
4. `recipient_profile` — new normalized personality/preferences table

No UI changes. No hydration changes. No localStorage changes. The new tables are write-only sinks in this phase.

---

## New Files

### `lib/db/src/schema/recipients-normalized.ts`

Defines both new Drizzle table schemas.

---

## Modified Files

### `lib/db/src/schema/index.ts`
Added export for `recipients-normalized.ts`.

### `artifacts/api-server/src/routes/personal-recipients.ts`
- `PUT /recipients/:id` — writes to `recipients` and `recipient_profile` after the existing `personal_recipients` write
- `DELETE /recipients/:id` — also cleans up `recipients` and `recipient_profile`

---

## Database Schema

### `recipients` — normalized identity and contact

| Column | Type | Source field | Notes |
|---|---|---|---|
| `id` | text PK | `Recipient.id` | Same stable ID as localStorage |
| `user_id` | text notNull | header `x-user-id` | |
| `first_name` | text notNull | `Recipient.name` | First word of full name |
| `last_name` | text | `Recipient.name` | Remainder of name; null if single word |
| `nickname` | text | `Recipient.petName` | |
| `relationship_type` | text notNull | `Recipient.relationship` | |
| `relationship_label` | text | `Recipient.relationship` | Same value, column reserved for future label overrides |
| `birthday` | text | `Recipient.birthday` | ISO `YYYY-MM-DD` |
| `anniversary` | text | `anniversaryDate` or `marriageDate` | First non-null wins |
| `email` | text | — | Null in Phase 1, column ready |
| `phone` | text | — | Null in Phase 1, column ready |
| `address_line1` | text | `mailingAddress.line1` | |
| `address_line2` | text | `mailingAddress.line2` | |
| `city` | text | `mailingAddress.city` | |
| `state` | text | `mailingAddress.state` | |
| `postal_code` | text | `mailingAddress.zip` | |
| `country` | text | — | Hardcoded `"US"` for now |
| `active` | boolean notNull | `Recipient.active` | Defaults `true` when undefined |
| `archived_at` | timestamp | — | Set to `now` when `active = false`; cleared when re-activated |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

### `recipient_profile` — normalized personality and preferences

PK = `recipient_id` (same as `recipients.id`). One row per recipient.

| Column | Type | Source field |
|---|---|---|
| `id` | text PK | `Recipient.id` |
| `recipient_id` | text unique notNull | `Recipient.id` |
| `personality_notes` | text | `Recipient.personalityNotes` |
| `personality_traits` | jsonb `string[]` | `Recipient.personality` |
| `interests` | jsonb `string[]` | `Recipient.interests` |
| `hobbies` | text | Null in Phase 1, column ready |
| `dislikes` | text | Null in Phase 1, column ready |
| `favorite_memories` | text | `Recipient.favoriteMemories` |
| `inside_jokes` | text | `Recipient.insideJokes` |
| `preferred_tone` | text | `Recipient.tonePreference` |
| `emotional_openness` | integer | `Recipient.emotionalLevel` |
| `things_to_avoid` | text | `Recipient.thingsToAvoid` |
| `things_to_always_include` | text | Null in Phase 1, column ready |
| `sender_nickname` | text | `Recipient.senderName` |
| `sign_off` | text | Null in Phase 1, column ready |
| `delivery_preference` | text | `Recipient.deliveryPreference` |
| `preview_days` | integer | `Recipient.previewDays` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

## API Changes

### `PUT /recipients/:id`

**Write order (all three happen on every save):**

1. Upsert `personal_recipients` blob — primary write, unchanged. If this fails, the whole request fails (existing behavior).
2. Upsert `recipients` — normalized identity fields. Wrapped in try/catch.
3. Upsert `recipient_profile` — normalized profile fields. Wrapped in try/catch.

Steps 2 and 3 are in a shared try/catch. If either fails, the error is logged (`logger.error`) and the response is still `{ ok: true }`. The primary sync path cannot be broken by the normalized writes.

**Duplicate warning (new recipients only):**

Before inserting into `recipients`, checks whether another recipient exists for the same `user_id` with:
- Same `first_name` (case-insensitive, using SQL `ILIKE`)
- AND same `birthday` — or no birthday on either record

If a potential duplicate is found, the response includes `warning: "possible_duplicate"` alongside `{ ok: true }`. The save always completes. The frontend currently ignores the response body (fire-and-forget), so there is zero UI impact today. The warning is ready for the client to consume in a future phase.

### `DELETE /recipients/:id`

After the existing `personal_recipients` delete, also deletes from `recipient_profile` then `recipients`. Wrapped in try/catch — failures are logged but do not fail the request.

---

## Compatibility Plan

| Layer | Status |
|---|---|
| `localStorage` | Unchanged — still the UI's read source |
| `personal_recipients` blob | Unchanged — still written first, still the source for `hydrateRecipientsFromServer` |
| `GET /recipients` | Unchanged — still reads from `personal_recipients` |
| Card generation | Unchanged — reads from localStorage |
| Existing UI | Unchanged |
| `DATA_VERSION` | Unchanged — no localStorage wipe risk |

---

## Data Loss Risks — None

- The normalized write is strictly additive — it runs after the primary write, in a try/catch that can never surface to the caller.
- Existing recipients in `personal_recipients` are not touched, moved, or migrated.
- IDs are preserved exactly — the same UUID used in localStorage and `personal_recipients` is used as the PK in both new tables.

---

## Known Limitations (Phase 1)

- **`email`, `phone`, `hobbies`, `dislikes`, `sign_off`, `things_to_always_include`** — columns exist in the schema, always null until the UI collects these fields.
- **`archived_at` read path** — the column is set when `active: false`, but no API reads it yet. Archiving behavior is unchanged from the existing `active` boolean.
- **Hydration** — `hydrateRecipientsFromServer` still reads from `personal_recipients`. The normalized tables are not yet in the read path.

---

## Smoke Test Results

All 10 checks passed in live environment:

| Check | Result |
|---|---|
| Create: blob + normalized + profile all written | ✅ |
| Name split (`Sarah Mitchell` → `Sarah` / `Mitchell`), nickname, anniversary correct | ✅ |
| Profile fields (tone, emotionalLevel, previewDays, senderName, traits, interests) correct | ✅ |
| Update: both normalized tables reflect new values | ✅ |
| Duplicate warning fires on same first name + same birthday | ✅ |
| No false warning when birthday differs | ✅ |
| No duplicate warning on second save of same recipient (update path) | ✅ |
| Cross-user isolation: zero rows visible to other user | ✅ |
| DELETE removes rows from all three tables | ✅ |
| TypeScript: api-server compiles clean | ✅ |
