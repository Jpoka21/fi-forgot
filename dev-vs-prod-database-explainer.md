# Development vs Production Database Setup
**Date:** June 5, 2026  
**App:** F.I. Forgot  
**Confirmed by:** live database queries run during this session

---

## One-Line Answer

Development and production use **completely separate databases**. Data never crosses between them automatically.

---

## Confirmed Database Identities

| Environment | Database name | Engine | Who manages it |
|---|---|---|---|
| Development | `heliumdb` | PostgreSQL 16 | Replit-managed |
| Production | `neondb` | PostgreSQL | Neon (provisioned at first publish) |

These are two different servers with two different connection strings. Neither can see the other's data.

---

## Q1 & Q2 — Same or separate databases?

**Separate.** Confirmed by querying `current_database()` in both environments:

- Development returns `heliumdb`
- Production returns `neondb`

---

## Q3 — What DATABASE_URL does development use?

`DATABASE_URL` is a Replit-managed secret. In development it resolves to a connection string pointing at `heliumdb` — the Replit-hosted Postgres instance provisioned when the project's database was first created. Replit injects the value at runtime. The raw connection string is never visible or manually set.

The individual components (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`) are also injected as secrets alongside `DATABASE_URL`.

---

## Q4 — What DATABASE_URL does production use?

When the app was first published, Replit provisioned a separate Neon PostgreSQL database and wired a different `DATABASE_URL` into the production deployment. The production server connects to `neondb`. The development server never sees or uses that connection string.

---

## Q5 — If I create a recipient in development, will it appear in production?

**No.** A recipient created in development is written to `heliumdb`. Production reads from `neondb`. The row never crosses between them automatically.

The only mechanism that moves data from dev to production is the **"Overwrite data"** option in the Replit Publish UI — a manual, deliberate choice at publish time. It is off by default.

---

## Q6 — If I modify the schema in development, does it affect production immediately?

**No.** The flow is:

```
1. Edit schema in lib/db/src/schema/
2. Run: pnpm --filter @workspace/db run push
        → applies to heliumdb (development only)
3. Verify feature works in development
4. Click Publish in Replit UI
        → Replit diffs dev schema vs prod schema
        → shows rename confirmations if needed
        → applies SQL diff to neondb (production)
```

Schema changes reach production **only through a publish**. Running `db push` in development never touches production. There is no other path.

---

## Q7 — Are deployments sharing data or isolated?

**Isolated.** A user account, recipient, or card created in development does not exist in production, and vice versa. Each environment has its own database with its own rows.

---

## The Full Picture

```
Development (Replit editor / preview pane)
  └── heliumdb  ← all dev reads/writes
        └── schema changes via: pnpm --filter @workspace/db run push

                        ↕  PUBLISH ONLY (manual, one-way)

Production (.replit.app or custom domain)
  └── neondb    ← all production reads/writes
        └── schema changes via: Replit Publish UI diff + apply
```

---

## Practical Implications

| Scenario | Result |
|---|---|
| Test user created during development | Lives in `heliumdb` only — never appears in production |
| Real user signs up on published site | Lives in `neondb` only — never appears in development |
| Schema column added in dev, app re-published | Replit diffs and adds column to `neondb` at publish time |
| Schema column added in dev, app NOT re-published | Production is missing the column — deployed app may error |
| `pnpm --filter @workspace/db run push` run in dev shell | Applies to `heliumdb` only — production untouched |
| Direct SQL run via `executeSql({ environment: "production" })` | Read-only — SELECT queries only, no writes or DDL |

---

## Environment Variable Scoping

| Variable | Type | Scoped? |
|---|---|---|
| `DATABASE_URL` | Runtime-managed secret | Replit injects different values per environment |
| `PGHOST / PGPORT / PGUSER / PGPASSWORD` | Runtime-managed secrets | Same — different per environment |
| `OPENAI_API_KEY`, `RESEND_API_KEY`, etc. | Secrets | Global — same value in dev and prod |
| `RESEND_FROM_EMAIL` | Shared env var | Same value in dev and prod |

Secrets are global by default in Replit, but `DATABASE_URL` and the `PG*` variables are special: Replit's managed database infrastructure automatically injects environment-appropriate values even though they appear as a single secret entry.
