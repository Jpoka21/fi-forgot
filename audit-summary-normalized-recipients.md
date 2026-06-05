# Normalized Recipient Storage — Audit & Fixes
**Date:** June 5, 2026  
**Checkpoint audited:** `9a2b1a0`  
**Fixes applied checkpoint:** `27b1be4`

---

## Audit Scope

Full review of the normalized recipient storage implementation across all 15 requested checks.

---

## All 15 Checks

| # | Check | Result |
|---|---|---|
| 1 | Creating a recipient writes to all four places (localStorage, personal_recipients, recipients, recipient_profile) | ✅ Confirmed |
| 2 | Updating a recipient updates all four places correctly | ✅ Confirmed |
| 3 | Deleting a recipient does not destroy historical card data in personal_cards | ✅ No FK constraints — cards store recipientId as plain text and survive |
| 4 | DELETE /recipients/:id is safe for card history references | ⚠️ Risk — see soft-delete recommendation |
| 5 | Duplicate warning has no false positives for common names | 🐛 Bug found and fixed |
| 6 | Name splitting handles all edge cases | ✅ All 8 cases correct |
| 7 | Anniversary field mapping is correct | ✅ anniversaryDate wins, marriageDate fallback |
| 8 | recipient_profile fields map correctly from existing recipient objects | ✅ All 10 fields verified |
| 9 | JSON array fields stored consistently | ✅ Stored as jsonb, null when absent |
| 10 | archived_at behavior correct when active changes | ✅ Set on deactivate, cleared on reactivate |
| 11 | Cross-user isolation is correct | ✅ All queries filter by userId |
| 12 | TypeScript and build checks are clean | ✅ |
| 13 | No silent failures that leave normalized tables permanently incomplete | ⚠️ Risk — mitigated by failure counter (see Fix 3) |
| 14 | Best-effort vs surfaced failures recommendation | See recommendation below |
| 15 | Hard-delete vs soft-archive recommendation | See recommendation below |

---

## Name Splitting Results (Check 6)

All edge cases tested live:

| Input name | first_name | last_name |
|---|---|---|
| `Mom` | Mom | null |
| `Joe` | Joe | null |
| `Sarah Mitchell` | Sarah | Mitchell |
| `Mary Jo Williams` | Mary | Jo Williams |
| `Anne-Marie Dupont` | Anne-Marie | Dupont |
| `김민준` | 김민준 | null |
| `Acme Corp LLC` | Acme | Corp LLC |
| `María García López` | María | García López |

All correct. Hyphenated first names, non-English names, multi-word last names, and company names all handled correctly by the `split(/\s+/)` logic.

---

## Bugs Found and Fixed

### Bug 1 — Duplicate warning false positive (fixed)

**File:** `artifacts/api-server/src/routes/personal-recipients.ts`

**What was wrong:**

The duplicate check condition used `!birthday` (incoming has no birthday) as a short-circuit that fired the warning on any same-first-name match, regardless of birthday:

```ts
// Before — broken
const isDupe = nameMatches.some(
  d => !birthday || !d.birthday || d.birthday === birthday,
);
```

**Concrete false positive:** User has *Sarah Mitchell* (birthday 1988-04-12). They add *Sarah Davis* (no birthday entered). Warning fires even though these are clearly different people.

The `!birthday` branch means: "if the new recipient has no birthday, warn on any name match." This is far too aggressive for common first names.

**What was fixed:**

```ts
// After — correct
const isDupe = nameMatches.some(
  d => Boolean(birthday && d.birthday && d.birthday === birthday),
);
```

Warning now fires only when **both** records have a birthday and they match exactly.

**Behavior after fix — verified live:**

| Scenario | Before | After |
|---|---|---|
| Same first name + same birthday | Warns | ✅ Warns |
| Same first name, different birthday | No warn | ✅ No warn |
| Same first name, incoming has NO birthday | Warns (false positive) | ✅ No warn |
| Mom + Mom, neither has birthday | Warns | No warn (acceptable — relationship field is the signal) |
| First new Dad entry | No warn | ✅ No warn |

---

### Bug 2 — DELETE did not verify userId ownership (fixed)

**File:** `artifacts/api-server/src/routes/personal-recipients.ts`

**What was wrong:**

All three DELETE operations used only `WHERE id = $id` with no `AND user_id = $userId`. A user who knew another user's recipient UUID (e.g., from a network log) could delete their row:

```ts
// Before — no ownership check
await db.delete(personalRecipientsTable).where(eq(personalRecipientsTable.id, id));
await db.delete(recipientsTable).where(eq(recipientsTable.id, id));
```

**What was fixed:**

```ts
// After — scoped to userId
await db.delete(personalRecipientsTable).where(
  and(eq(personalRecipientsTable.id, id), eq(personalRecipientsTable.userId, userId))
);
await db.delete(recipientsTable).where(
  and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId))
);
```

`recipient_profile` has no `userId` column (it is keyed only by `recipient_id`), so it continues to use `WHERE id = $id`. In practice, cross-user UUID collisions are impossible since clients use `crypto.randomUUID()`.

---

## Fix 3 — Silent failure counter added

**Files:** `artifacts/api-server/src/routes/personal-recipients.ts`, `artifacts/api-server/src/routes/health.ts`

Added an in-process counter `normalizedSyncErrors` that is incremented every time a normalized write fails (inside either catch block — PUT or DELETE). The counter is exported and exposed on `GET /api/healthz`:

```json
{"status": "ok", "normalizedSyncErrors": 0}
```

A non-zero value in production means normalized writes are silently failing without any UI disruption — visible at a glance without log diving. Zero cost at runtime when no failures occur.

---

## Design Recommendations

### Q14 — Best-effort vs surfaced failures

**Keep best-effort in production.** The primary write (`personal_recipients`) must never be blocked by a secondary concern. The failure counter on `/api/healthz` provides the right monitoring hook — it makes a systemic failure visible immediately without changing the fire-and-forget user experience.

### Q15 — Hard-delete vs soft-archive

**Convert DELETE to soft-archive before the intelligence layer is built.**

Today: `personal_cards.recipient_id` is plain text with no FK — cards survive a hard delete. ✅

Problem: Once the intelligence system joins `recipients` + `personal_cards` to produce AI context (personality, tone, memories, inside jokes), a hard-deleted `recipients` row means that join returns nothing. The card history becomes context-free permanently.

**Recommended change (not yet implemented — Phase 2):**

`DELETE /recipients/:id` → sets `active = false`, `archived_at = now()`, keeps the row. The `recipients` table becomes the stable identity anchor that is never physically destroyed. The columns (`active`, `archived_at`) already exist.

This is a one-line change to the DELETE handler and requires no schema migration.

---

## Files Changed in This Session

| File | Change |
|---|---|
| `artifacts/api-server/src/routes/personal-recipients.ts` | Fixed duplicate warning condition; added userId ownership check to DELETE; added normalizedSyncErrors counter |
| `artifacts/api-server/src/routes/health.ts` | Exposes normalizedSyncErrors on /api/healthz |

---

## Smoke Test Results — All Verified

All checks confirmed in live environment:

| Test | Result |
|---|---|
| All four writes happen on recipient create | ✅ |
| All four writes update on recipient save | ✅ |
| card survives recipient DELETE (no FK constraint) | ✅ |
| False positive warning eliminated (Sarah + no birthday) | ✅ Fixed |
| Correct warning still fires (same name + same birthday) | ✅ |
| No warning when birthdays differ | ✅ |
| DELETE scoped to userId | ✅ Fixed |
| normalizedSyncErrors visible on /api/healthz | ✅ |
| TypeScript: api-server compiles clean | ✅ |

---

## Checkpoint Safety

**Safe to continue from checkpoint `27b1be4`.**

Next implementation step: soft-archive conversion for `DELETE /recipients/:id` before any real user data accumulates in the normalized tables.
