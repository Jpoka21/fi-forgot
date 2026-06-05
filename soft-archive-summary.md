# Soft-Archive for Normalized Recipients
**Date:** June 5, 2026  
**Checkpoint:** `60f839d`  
**Scope:** `DELETE /recipients/:id` handler only — no UI, no localStorage, no card history changes.

---

## What Changed

**1 file modified:** `artifacts/api-server/src/routes/personal-recipients.ts`  
**1 function changed:** the `DELETE /recipients/:id` route handler

### Before

```
DELETE /recipients/:id
  → hard delete from personal_recipients  (scoped by id + userId)
  → hard delete from recipient_profile    (scoped by id only)
  → hard delete from recipients           (scoped by id + userId)
```

### After

```
DELETE /recipients/:id
  → hard delete from personal_recipients  (scoped by id + userId)  ← unchanged
  → UPDATE recipients SET                                           ← changed
      active = false,
      archived_at = now(),
      updated_at = now()
    WHERE id = $id AND user_id = $userId
  → recipient_profile: no operation                                 ← changed (was hard delete)
```

---

## Why

`personal_cards.recipient_id` is a plain text field — no foreign key constraint — so cards already survive a hard delete. However, once the intelligence layer begins joining `recipients` + `personal_cards` to pull profile context for AI card generation (personality, tone, memories, inside jokes), a hard-deleted `recipients` row means that join returns nothing and the card history becomes context-free permanently.

The `active` and `archived_at` columns already existed on the `recipients` table. This is a single `.update()` call replacing the previous `.delete()` call — no schema migration required.

---

## Behavior After the Change

| Layer | Before delete | After DELETE call |
|---|---|---|
| `personal_recipients` | Row exists | **Deleted** — drives current UI, recipient disappears |
| `recipients` | `active=true`, `archived_at=null` | `active=false`, `archived_at=<timestamp>` — **row kept** |
| `recipient_profile` | Row exists | **Unchanged** — row fully intact |
| `personal_cards` | Rows with `recipient_id` | **Unchanged** — rows fully intact |
| localStorage | Has recipient | Cleared on sync as before |

---

## Verification Results — All Confirmed Live

| Check | Expected | Result |
|---|---|---|
| `personal_recipients` removed after DELETE | count = 0 | ✅ 0 |
| `recipients` row still exists | count = 1 | ✅ 1 |
| `recipients.active` = false | f | ✅ f |
| `recipients.archived_at` is set | not null | ✅ not null |
| `recipient_profile` intact with original data | tone = Romantic | ✅ Romantic |
| `personal_cards` intact with `recipient_id` reference | sa-card-1 → sa-1 | ✅ intact |
| Other user's DELETE is a no-op on normalized row | active stays true | ✅ true |
| TypeScript check | clean | ✅ clean |

---

## What Was Not Changed

- No UI changes
- No localStorage changes
- No card history changes
- No schema migrations
- No other routes modified
- `normalizedSyncErrors` counter still covers failures in the soft-archive path
