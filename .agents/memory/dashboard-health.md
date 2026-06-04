---
name: Dashboard Health Redesign
description: Phase 2 complete — scoring engine + full dashboard rewrite conventions
---

## What was built
- `artifacts/fi-forgot/src/lib/relationship-health.ts` — pure scoring engine (no API calls)
- `artifacts/fi-forgot/src/pages/dashboard.tsx` — full rewrite, single-scroll, no tabs
- `artifacts/fi-forgot/src/lib/data.ts` — `profileUpdatedAt?: string` added to Recipient

## Architecture decisions worth preserving

**Score floor:** min 15 for any recipient with a name set (never show 0). Implemented in `computeRecipientHealth`.

**Tier system:** `RELATIONSHIP_TIER_MAP` in relationship-health.ts — core (3x weight), important (2x), occasional (1x). Weighted average for overall score.

**Freshness decay:** Applied only to MEMORY_BANK category, not permanent facts (birthday, anniversary, dates). Controlled by `FRESHNESS_DECAY` array in relationship-health.ts.

**Weights are configurable constants:** `SCORING_CONFIG` object — change numbers there without touching logic.

**Dashboard section order (single scroll, no tabs):**
1. Relationship Health Hero (score ring + category bars)
2. Recommended Next Step (computed from scoring + pending approvals + briefings)
3. Review & Approve (only when `awaitingApproval.length > 0 || pendingApprovals.length > 0`; id="review" anchor)
4. Upcoming Moments — next 90 days
5. Approved & Queued strip (only when items exist)
6. Your Relationships (sorted: core first, lowest score first within tier)
7. Top Improvement Opportunity (from `health.topInsight`)
8. Recent Progress (score history sparkline, localStorage)
9. Relationship Coverage (gap suggestions)
10. Plan Usage

**All card review functions preserved:** `generateEarly`, `approvePersonalCard`, `rejectPersonalCard`, `quickEditPersonalCard`, `regenCardDesign`, `shareCardPreview`, `updateApprovalTiming`.

**All modals preserved:** font picker, upgrade modal, approved card viewer, lightbox.

**Score history:** stored in localStorage key `fi_forgot_score_history` via `recordScoreSnapshot` / `getScoreHistory`. Recorded once per day.

**Why:**
User confirmed go-ahead on this architecture. Scoring is intentionally client-side (no server calls) to keep it fast and offline-capable. Tab navigation removed to create a "health dashboard" mental model instead of a task list.
