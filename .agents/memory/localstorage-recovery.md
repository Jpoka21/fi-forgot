---
name: localStorage-first recovery & briefing sync bug
description: How F.I. Forgot stores real user data and a latent bug in the briefing sync endpoint
---

## F.I. Forgot is localStorage-first
**Rule:** Real recipient/card/briefing data lives in the browser's localStorage under `fi_forgot_*` keys, NOT primarily in Postgres. The DB only reliably holds the `fi_users` row until the app syncs. A fresh GitHub import has empty tables even though the user "has data."
**Why:** On login the app calls `/api/auth/session` (email→userId), then hydrate*FromServer runs a "server wins" policy: if server has rows it overwrites localStorage; if server is empty it uploads localStorage to the server. So recovery = get the user's localStorage export and replay it through the sync endpoints (or DB), keyed to the userId returned by `/auth/session`.
**How to apply:** To restore, POST `/api/auth/session` {email,name} → userId; PUT each recipient to `/api/recipients/:id`; POST each card to `/api/personal/cards`; POST each briefing to `/api/personal/briefings`, all with `x-user-id` header. Storage/data version keys must be `fi_forgot_storage_version="2"`, `fi_forgot_data_version="5"` or the app wipes localStorage on load.

## Briefing sync endpoint fails on duplicate question keys
**Rule:** `POST /api/personal/briefings` builds each question_answers row id as `${briefing.id}_${questionKey}` and inserts the whole answers array in ONE insert with onConflictDoUpdate. If a briefing has multiple answers sharing a questionKey (common — e.g. several "dad_moment" answers), the batch contains duplicate primary keys and Postgres errors "ON CONFLICT DO UPDATE cannot affect row a second time" → 500, whole briefing lost.
**Why:** Discovered during recovery: 4 of 10 briefings failed this way; the 6 that succeeded had unique keys.
**How to apply:** When importing such briefings, insert directly into `question_answers` giving each answer a unique id (append an index) and dedupe exact questionKey+answer repeats. If asked to fix the app, the endpoint should de-collide ids per-answer before the batch insert.
