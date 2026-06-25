---
name: localStorage-first recovery & briefing sync bug
description: How F.I. Forgot stores real user data and a latent bug in the briefing sync endpoint
---

## F.I. Forgot is localStorage-first
**Rule:** Real recipient/card/briefing data lives in the browser's localStorage under `fi_forgot_*` keys, NOT primarily in Postgres. The DB only reliably holds the `fi_users` row until the app syncs. A fresh GitHub import has empty tables even though the user "has data."
**Why:** On login the app calls `/api/auth/session` (email→userId), then hydrate*FromServer runs a "server wins" policy: if server has rows it overwrites localStorage; if server is empty it uploads localStorage to the server. So recovery = get the user's localStorage export and replay it through the sync endpoints (or DB), keyed to the userId returned by `/auth/session`.
**How to apply:** To restore, POST `/api/auth/session` {email,name} → userId; PUT each recipient to `/api/recipients/:id`; POST each card to `/api/personal/cards`; POST each briefing to `/api/personal/briefings`, all with `x-user-id` header. Storage/data version keys must be `fi_forgot_storage_version="2"`, `fi_forgot_data_version="5"` or the app wipes localStorage on load.

## Briefing sync endpoint & duplicate question keys (FIXED)
**Rule:** `POST /api/personal/briefings` once built each question_answers row id as `${briefing.id}_${questionKey}` and inserted the whole answers array in ONE batch with onConflictDoUpdate. A briefing with multiple answers sharing a questionKey (common — e.g. several "dad_moment" answers) produced duplicate primary keys → Postgres "ON CONFLICT DO UPDATE cannot affect row a second time" → 500, whole briefing dropped silently.
**Why:** Discovered during recovery: 4 of 10 briefings failed; the 6 that succeeded had unique keys.
**Fix (now in personal-history.ts):** dedupe exact (questionKey+trimmed answer) repeats, then assign unique stable ids — first occurrence keeps `${briefing.id}_${questionKey}` (backward compatible with already-synced rows), subsequent distinct answers get a `_${n}` suffix. Idempotent: client `saveBriefing` re-POSTs whole briefing on edit; `hydrateBriefingsFromServer` groups server rows by recipientId/event/year (not id), so mixed id formats reconstruct fine.
**Known limitation (not fixed, pre-existing):** endpoint is upsert-only — removing an answer later leaves stale suffixed rows. Fix would require deleting `(userId,recipientId,eventType,eventYear)` rows in a txn before upsert.
