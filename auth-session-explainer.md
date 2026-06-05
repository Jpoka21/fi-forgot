# How User Sessions Work in Development
**Date:** June 5, 2026  
**App:** F.I. Forgot  
**Source files:** `artifacts/fi-forgot/src/lib/auth-context.tsx`, `artifacts/fi-forgot/src/lib/data.ts`, `artifacts/api-server/src/routes/personal-recipients.ts`

---

## The Login Flow, Step by Step

```
User enters email + name
        ↓
auth-context.tsx: login() or signup()
        ↓
connectSession(email) called
        ↓
POST /api/auth/session  { email, name }
        ↓
Server: look up email in users table
  ├── Found → return existing UUID
  └── Not found → INSERT new row, return new UUID
        ↓
Client receives { userId: "<uuid>" }
        ↓
setServerSyncUserId(uuid)  → stored in memory only (_serverUserId variable)
        ↓
hydrateRecipientsFromServer(uuid)   ─┐
hydrateCardsFromServer(uuid)         ├── Postgres → localStorage sync
hydrateBriefingsFromServer(uuid)    ─┘
```

---

## Q1 — How is `userId` created?

Created server-side in `POST /api/auth/session`. The email address is the permanent identity key.

- Existing email → returns the existing UUID from the `users` table.
- New email → calls `randomUUID()`, inserts a new row, returns the new UUID.

The UUID never changes for a given email address.

---

## Q2 — How is `userId` stored?

| Location | What is stored | Persistence |
|---|---|---|
| Postgres `users` table | `email → UUID` mapping | Permanent |
| `data.ts` module variable `_serverUserId` | UUID only | In-memory; lost on hard reload |
| `localStorage: fi_forgot_user` | `{ name, email }` only — **not the UUID** | Survives page refresh |

The UUID is **never written to localStorage**. On every page load it is re-fetched by calling `connectSession` with the stored email.

---

## Q3 — When does `connectSession()` run?

Exactly three times, all in `auth-context.tsx`:

1. **On page load** — if `fi_forgot_user` exists in localStorage, `connectSession` fires inside the startup `useEffect`.
2. **On `login()`** — after the user submits the login form.
3. **On `signup()`** — after the user submits the signup form.

`businessSignup()` calls `registerEmailOnServer()` instead — it does not call `connectSession`.

---

## Q4 — How to verify which user you are currently logged in as

**Email (localStorage):**
```js
// Browser DevTools console
JSON.parse(localStorage.getItem("fi_forgot_user"))
// → { name: "Alice", email: "alice@example.com" }
```

**UUID (Network tab):**  
Open DevTools → Network → click any `/api/recipients` or `/api/personal/cards` request → Request Headers → `x-user-id`

**Database:**
```sql
SELECT id, email FROM users ORDER BY created_at DESC LIMIT 10;
```

---

## Q5 — Is there a developer bypass / auto-login?

**No.** There is no `DEV_USER`, no hardcoded session, no auto-login environment variable. The only path to being logged in is:
- A valid `fi_forgot_user` entry already in localStorage from a previous session, **or**
- Completing the login or signup form in the current tab.

---

## Q6 — Incognito window behavior

**Not logged in.** Incognito has its own isolated localStorage. There is no server-side session cookie. The app shows as a logged-out visitor until the login form is completed.

---

## Q7 — What happens if localStorage is cleared?

| Thing | What happens |
|---|---|
| **UI** | Next page load shows as logged out — landing/login screen |
| **UUID** | Never re-fetched; `_serverUserId` stays `null`; all API calls return 401 |
| **Postgres data** | **Completely unaffected** — all rows survive |
| **Recovery** | Log back in with the same email → server returns the same UUID → hydration re-syncs everything back to localStorage |

localStorage is a cache of Postgres, not the source of truth.

---

## Q8 — Testing with two separate users

| Method | How |
|---|---|
| **Two browsers** | Chrome = User A, Firefox or Edge = User B (each has separate localStorage) |
| **Incognito** | Regular window = User A, incognito = User B |
| **Two emails** | Log in as `alice@test.com`, log out, log in as `bob@test.com` — each email maps to a distinct UUID |
| **Direct API** | `curl -H "x-user-id: <uuid>"` with two different UUIDs from the `users` table — no UI needed |

---

## Q9 — How to see the `userId` in API requests

**DevTools → Network tab → any `/api/…` request → Request Headers → `x-user-id`**

Every fetch to the API adds this header via `data.ts`:

```ts
return _serverUserId
  ? { "Content-Type": "application/json", "x-user-id": _serverUserId }
  : { "Content-Type": "application/json" };
```

If `_serverUserId` is `null` (e.g. `connectSession` hasn't completed yet), the header is absent and the server returns `401 { error: "x-user-id required" }`.

---

## Q10 — One shared user or separate accounts?

**Separate accounts per email address.** Every email that signs up or logs in gets its own UUID in the `users` table. Every row in `personal_recipients`, `recipients`, `recipient_profile`, and `personal_cards` is scoped to that UUID via a `user_id` column. Two people with different emails cannot see each other's data.

The only time data is shared is when the **same email** is used from two devices — both resolve to the same UUID and see the same Postgres data, which is the intended behavior for a returning user.

---

## localStorage Keys Reference

| Key | Contents | Cleared on logout? |
|---|---|---|
| `fi_forgot_user` | `{ name, email }` | ✅ Yes |
| `fi_forgot_onboarding` | Onboarding form data | ✅ Yes |
| `fi_forgot_recipients` | Recipient blob array (cache) | ✅ Yes (via `clearAllUserData`) |
| `fi_forgot_cards` | Card history (cache) | ✅ Yes |
| `fi_forgot_briefings` | Briefing Q&A (cache) | ✅ Yes |
| `fi_forgot_workspaces` | Workspace array | ✅ Yes |
| `fi_forgot_active_workspace` | Active workspace ID | ✅ Yes |
| `fi_forgot_biz_id_anchor` | Business UUID anchor | ❌ Not cleared on logout |
| `fi_forgot_storage_version` | Schema version (`"2"`) | ❌ Not cleared on logout |

---

## Summary

There is no real authentication system yet. The email address is trusted on the client and passed to the server to resolve a UUID. There are no passwords, no JWT tokens, no cookies, and no server-side sessions. The UUID is the auth identity for all API calls and is sent as a plain request header (`x-user-id`) on every request. Anyone who knows a valid UUID can impersonate that user — this is appropriate for the current development stage and will need to be hardened before production.
