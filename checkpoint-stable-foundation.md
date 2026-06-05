# Stable Foundation Checkpoint
**Date:** June 5, 2026  
**Checkpoint:** `a00c505`  
**Status:** Manually validated. Safe baseline to begin question engine and recipient intelligence phases.

---

## 1. Current Checkpoint ID

`a00c5054d35537ce3b19e9bf80f701bc01b50f46`

---

## 2. What Has Been Implemented

### Authentication
- `POST /api/auth/session` — resolves email → UUID, creates user row on first sign-in
- `connectSession()` fires on page load (if previously logged in), on `login()`, and on `signup()`
- UUID stored in-memory only (`_serverUserId`); re-resolved from server on every page load

### Recipient storage
- `PUT /api/recipients/:id` — writes to three places in order:
  1. `personal_recipients` (primary blob, drives UI)
  2. `recipients` (normalized identity row)
  3. `recipient_profile` (normalized profile row)
- `GET /api/recipients` — returns all blob rows for a userId, used for server hydration
- `DELETE /api/recipients/:id`:
  - Hard-deletes from `personal_recipients` (drives UI removal)
  - Soft-archives `recipients` row: `active=false`, `archived_at=now()`, `updated_at=now()`, scoped by `id AND user_id`
  - Leaves `recipient_profile` completely intact

### Card history
- `POST /api/personal/cards` — upserts card records by userId
- `GET /api/personal/cards` — returns all card records for a userId

### Briefing Q&A
- `POST /api/personal/briefings` — upserts question/answer pairs by userId + recipient
- `GET /api/personal/briefings` — returns all Q&A for a userId

### Server hydration on login
All three hydration functions fire after `connectSession()` resolves a userId:
- `hydrateRecipientsFromServer(userId)` — Postgres → localStorage for recipients
- `hydrateCardsFromServer(userId)` — Postgres → localStorage for cards
- `hydrateBriefingsFromServer(userId)` — Postgres → localStorage for briefings

Server wins on all three: server data replaces local data when a userId is resolved.

### Observability
- `normalizedSyncErrors` counter — incremented on any failed normalized write (PUT or DELETE)
- Exposed on `GET /api/healthz` as `{ status: "ok", normalizedSyncErrors: N }`

### Navigation
- Recipients link added to landing page mobile hamburger menu (logged-in state)
- Recipients link added to dashboard account menu (tap name → Recipients)

---

## 3. What Has Been Manually Validated

- Creating a recipient writes to all four places (localStorage, personal_recipients, recipients, recipient_profile)
- Updating a recipient updates all four places
- Deleting a recipient removes it from the UI (personal_recipients deleted), soft-archives the normalized row (active=false, archived_at set), and leaves recipient_profile and personal_cards intact
- Hydration on login restores recipients, cards, and briefings from Postgres when localStorage is empty
- Duplicate warning fires only when both records have matching birthdays; no false positives for name-only matches
- DELETE is scoped by userId — a different user cannot delete or archive another user's recipients
- normalizedSyncErrors is visible on /api/healthz
- Recipients link appears in both mobile nav locations
- TypeScript: clean across all packages

---

## 4. What Data Now Persists Server-Side

| Data | Table | Notes |
|---|---|---|
| User identity | `users` | email → UUID, permanent |
| Recipients (full blob) | `personal_recipients` | Primary source of truth for recipient data |
| Card history | `personal_cards` | All card records per user |
| Briefing Q&A | `question_answers` | All question/answer pairs per user + recipient |
| Normalized recipient identity | `recipients` | id, name, relationship, birthday, anniversary, active, archived_at |
| Normalized recipient profile | `recipient_profile` | tone, personality, interests, memories, inside jokes, delivery prefs |

---

## 5. What Still Depends on localStorage

| Data | localStorage Key | Server-backed? |
|---|---|---|
| User identity (name, email) | `fi_forgot_user` | Email only — used to re-resolve UUID on load |
| Recipients (UI read source) | `fi_forgot_recipients` | ✅ Hydrated from server on login |
| Cards (UI read source) | `fi_forgot_cards` | ✅ Hydrated from server on login |
| Briefings (UI read source) | `fi_forgot_briefings` | ✅ Hydrated from server on login |
| Onboarding form data | `fi_forgot_onboarding` | ❌ Not server-backed |
| Workspace list | `fi_forgot_workspaces` | ❌ Not server-backed |
| Active workspace ID | `fi_forgot_active_workspace` | ❌ Not server-backed |
| Personal settings | `fi_forgot_settings` | ❌ Not server-backed |
| Business ID anchor | `fi_forgot_biz_id_anchor` | ❌ Not server-backed |

The UI reads everything from localStorage. The server is a write target and a hydration source on login — not a real-time read source for any feature yet.

---

## 6. What Normalized Tables Currently Exist

| Table | Key columns |
|---|---|
| `users` | `id` (UUID), `email`, `name` |
| `personal_recipients` | `id`, `user_id`, `data` (jsonb blob), `created_at`, `updated_at` |
| `personal_cards` | `id`, `user_id`, `recipient_id`, `event_type`, `status`, `data` (jsonb), `created_at`, `updated_at` |
| `question_answers` | `id`, `user_id`, `recipient_id`, `question_key`, `answer`, `created_at`, `updated_at` |
| `recipients` | `id`, `user_id`, `first_name`, `last_name`, `relationship`, `birthday`, `anniversary_date`, `active`, `archived_at`, `created_at`, `updated_at` |
| `recipient_profile` | `id` (= recipient_id), `preferred_tone`, `emotional_level`, `personality_notes`, `favorite_memories`, `inside_jokes`, `things_to_avoid`, `delivery_preference`, `preview_days`, `created_at`, `updated_at` |

No FK constraints between any tables. `personal_cards.recipient_id` is plain text.

---

## 7. Which Tables Are Write-Only vs Actively Used

| Table | Status | Used for |
|---|---|---|
| `users` | **Actively used** | Auth: email → UUID resolution on every login |
| `personal_recipients` | **Actively used** | Primary blob store; read back by hydration on login |
| `personal_cards` | **Actively used** | Card history; read back by hydration on login |
| `question_answers` | **Actively used** | Briefing Q&A; read back by hydration on login |
| `recipients` | **Write-only sink** | Written on every PUT; soft-archived on DELETE; never read by any feature |
| `recipient_profile` | **Write-only sink** | Written on every PUT; never deleted; never read by any feature |

---

## 8. What Data Is Now Protected from Browser Cache Loss

If a user clears localStorage or switches devices, the following are fully recoverable by logging in with the same email:

- ✅ All recipients (restored via `hydrateRecipientsFromServer`)
- ✅ All card history (restored via `hydrateCardsFromServer`)
- ✅ All briefing Q&A answers (restored via `hydrateBriefingsFromServer`)
- ✅ User identity (UUID always re-resolved from `users` table by email)

The following are **not** recoverable from server:

- ❌ Personal settings (handwriting style, signature, tone, automation mode)
- ❌ Workspace configuration (personal/business workspace setup)
- ❌ Onboarding data (retained separately in `fi_forgot_onboarding`)

---

## 9. What Still Needs to Be Migrated Before localStorage Is No Longer Required

For true cross-device and cache-loss resilience, three things remain:

| Data | Required action |
|---|---|
| **Personal settings** | New `personal_settings` table; persist automation mode, card font, signature, default tone server-side; hydrate on login |
| **Workspace configuration** | New `workspaces` table; persist personal/business workspace IDs, names, types, businessId server-side; hydrate on login |
| **Onboarding completion flag** | Store onboarding state in `users` table (e.g. `onboarding_completed_at`); remove dependency on `fi_forgot_onboarding` key |

Until those three are migrated, localStorage remains a required dependency for the full user experience even if it is no longer the primary data store for recipients, cards, and briefings.

---

## 10. Recommended Next Implementation Step

**Begin the recipient intelligence layer: make the normalized tables readable.**

The `recipients` and `recipient_profile` tables have been accumulating structured data since Phase 1 shipped. They are currently write-only. The next phase activates them as a read source for AI card generation context.

Recommended sequence:

1. **Question engine** — define the question set keyed to `question_key` (already stored in `question_answers`), build the UI to surface unanswered questions per recipient, store answers via the existing POST /api/personal/briefings endpoint
2. **Context assembly** — build a server-side function that joins `recipients` + `recipient_profile` + `question_answers` for a given recipientId to produce a structured context object for the card generation prompt
3. **Card generation integration** — pass that context object into the AI prompt instead of reading from localStorage recipient fields directly
4. **Profile completeness scoring** — score each recipient by how many profile fields and question_answers are filled; surface gaps on the dashboard ("Tell us more about Sarah to improve her cards")

The soft-archive behavior means deleted recipients' profiles remain available for historical card context joins — that was the prerequisite for this phase, and it is now in place.
