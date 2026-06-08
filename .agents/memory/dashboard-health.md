---
name: Dashboard Health Redesign
description: Client-side scoring engine conventions + V1 Relationship Health Dashboard (backend API + frontend section).
---

## Phase 1 — Client-side scoring engine (existing)
- `artifacts/fi-forgot/src/lib/relationship-health.ts` — pure scoring engine (no API calls)
- `artifacts/fi-forgot/src/pages/dashboard.tsx` — two-column layout; left col = Upcoming Moments + Relationship Health; right col = stats/wins
- `artifacts/fi-forgot/src/lib/data.ts` — `profileUpdatedAt?: string` added to Recipient

### Key conventions
**Score floor:** min 15 for any recipient with a name set (never show 0). Implemented in `computeRecipientHealth`.
**Tier system:** `RELATIONSHIP_TIER_MAP` — core (3x weight), important (2x), occasional (1x). Weighted average for overall score.
**Freshness decay:** Applied only to MEMORY_BANK category. `SCORING_CONFIG` object controls all weights.

---

## Phase 2 — Recipient Health Dashboard V1 (new)

### What was built
Replaced the "Your Relationships" simple list in the left column with a full `RelationshipHealthSection` component backed by a new API endpoint.

### Health Score Model (0–100) — server-computed
| Dimension | Max | Rule |
|---|---|---|
| Profile completeness | 30 | `profileCompleteness / 100 * 30` (from `recipientMemoryTable`) |
| Fresh update recency | 30 | ≤30d=30, 31–90d=20, 91–180d=10, >180d/never=0 |
| Follow-up status | 20 | no pending=20, pending=10, overdue=0 |
| Event readiness | 10 | >60d away or no event=10; ≤60d+recent update=10; ≤60d+no update=0 |
| Card activity | 10 | card sent within 1 year=10 |

**Overdue follow-up** = `followUpQuestionsTable` record `status=pending` and `triggerDate` > 30 days ago.

### Status Buckets
- 90–100 → Excellent (dark green `#166534`)
- 70–89  → Healthy (sage `#5B8C6B`)
- 50–69  → Needs Attention (amber `#D97706`)
- <50    → Priority (red `#E23B2E`)

### Key Files
- Backend route: `artifacts/api-server/src/routes/v2-recipient-health.ts` → `GET /api/v2/recipient-health`
- Frontend component: `artifacts/fi-forgot/src/components/RelationshipHealthSection.tsx`
- Registered **before** `v2RecipientsRouter` in `routes/index.ts` to avoid `:id` param collision

### Recommended Action Priority
1. profilePct < 50 → "Complete profile"
2. overdue follow-up → "Answer follow-up question"
3. event ≤30 days → "Prepare {event} card"
4. lastUpdateDaysAgo > 90 or null → "Add a fresh update"
5. pending follow-up → "Answer follow-up question"
6. event ≤60 days → "Prepare {event} card"
7. else → "Review recent activity"

### Action Routing (frontend)
- `profile`, `follow_up`, `fresh_update` → `/recipients/{id}?from=dashboard`
- `card` → `/v2?recipientId={id}`
- `review` → `/recipients/{id}/timeline`

### Data Sources (bulk-fetched once per request, Maps for O(1) lookup)
- `recipientMemoryTable.profileCompleteness`
- `questionAnswersTable` (triggerType=fresh_update, wasSkipped=false)
- `followUpQuestionsTable` (status=pending)
- `personalCardsTable` (status != draft)
- `recipientsTable` (birthday, anniversary for event readiness)

### Frontend section structure
1. Section header "Relationship Health 💚"
2. Attention Panel — chips for stale count, follow-up count, events within 30 days
3. Grouped cards — Priority → NeedsAttention → Healthy → Excellent (sorted score asc within each group)
4. Each card — avatar, score, badge, relationship, next event, update age, pending follow-ups, recommended action pill, "Take Action" button
5. Insights bar — most current / richest profile / oldest update tiles
6. All-healthy empty state — 🍪 "Everything looks good"

**Why server-computed (not client-side like Phase 1):** The data lives across 5 DB tables; doing it server-side avoids shipping all that data to the browser and keeps the scoring authoritative for future features (notifications, emails).
