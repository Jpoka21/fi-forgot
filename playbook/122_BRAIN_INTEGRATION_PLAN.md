# 122 BRAIN INTEGRATION PLAN

## Document Status

Status: Living integration plan

Phase: Product Integration — Sprint 4 complete

Implementation: Integration Sprints 1–4 shipped (feature-flagged where noted)

Depends on:

- 114 Decision Rule Framework
- 115 Relationship Intelligence Implementation Tracker
- 116 Rule Engine Architecture
- 117 Opportunity Rules
- 118 Life Event Follow Up Architecture
- 119 Follow Up Question Engine
- 120 Question Memory Engine
- 121 Brain Execution Pipeline
- 123 Brain Attention Planner

---

# Integration Sprint 1 — Complete

Integration Sprint 1 is **complete**. All deliverables are implemented behind feature flags where noted. Legacy paths remain available for rollback.

## Completed Deliverables

### 1. Product Brain API

- Public per-recipient contract: `ProductBrainDecision` (v1)
- Route: `GET /api/v2/recipients/:id/brain`
- Pipeline: `executeBrain` → `buildProductBrainDecision`
- No public `confidence`; display copy keyed by `sourceRuleId`
- Ownership pre-check via `recipientsTable`

### 2. Brain Playground

- Permanent dev tool at `/brain-playground`
- Single data source: `GET /api/v2/recipients/:id/brain`
- Recipient selector + optional `?recipientId=` URL sync
- No legacy next-question compare path

### 3. Recipient Profile Migration

- Feature flag: `VITE_BRAIN_PROFILE_QUESTIONS=true`
- Sequential resolution: Brain first; profile-gap `next-question` fallback only when Brain has no `selectedFollowUpQuestion`
- `ProfileQuestionViewModel` — UI renders source-agnostic view model (no Brain→NextQuestion chain)
- Rollback: `VITE_BRAIN_PROFILE_QUESTIONS=false` restores legacy concierge question experience

### 4. Dashboard Brain Migration

See **Dashboard Brain Migration (Sprint 1)** below.

---

# Integration Sprint 2 — Complete

Notifications Brain migration shipped behind `VITE_BRAIN_NOTIFICATIONS`.

| Item | Detail |
|------|--------|
| Route | `GET /api/v2/notifications` |
| Contract | `NotificationsResponse` (v1) |
| Execution | Server-side Brain → product builder → DTO |
| Rollback | `VITE_BRAIN_NOTIFICATIONS=false` restores legacy notification seeds |

---

# Integration Sprint 3 — Complete

Concierge workspace Brain migration shipped behind `VITE_BRAIN_CONCIERGE`.

| Item | Detail |
|------|--------|
| Route | `GET /api/v2/concierge` |
| Contract | `ConciergeWorkspaceResponse` (v1) |
| Surfaces | Workspace recommendations + insights |
| Not migrated | Conversation tab (legacy `aiConciergeEngine`) |
| Rollback | `VITE_BRAIN_CONCIERGE=false` restores legacy workspace path |

---

# Integration Sprint 4 — Complete

Brain Attention Planner — cross-recipient ranking layer.

| Step | Deliverable | Status |
|------|-------------|--------|
| 4b | Extract `collectProductBrainDecisions`, `shouldIncludeOpportunity` | Done |
| 4c | Internal `GlobalOpportunity` pool | Done |
| 4d | `planAttentionOrder()` parity ranking | Done |
| 4e | Dashboard, Notifications, Concierge wired to planner | Done |
| 4f | Documentation + architecture guard tests | Done |

See **123_BRAIN_ATTENTION_PLANNER.md** for full architecture.

### Production ranking path (all three products)

```text
collectProductBrainDecisions
  → planAttentionOrder()
  → ranked GlobalOpportunity[]   (internal)
  → product cap (slice)
  → product DTO mapper
  → route
```

Legacy `rankRelationshipOpportunities` remains for tests and parity comparison only — not used by product builders.

---

## Dashboard Brain Migration (Sprint 1)

The Dashboard does **not** consume `ProductBrainDecision[]` directly from the client. It uses a dedicated dashboard-shaped API that runs the Brain server-side and returns ranked opportunities.

### Dedicated Dashboard Brain API

| Item | Detail |
|------|--------|
| Route | `GET /api/v2/dashboard/brain-opportunities` |
| Contract | `DashboardBrainOpportunities` (v1) |
| Execution | `executeBrain` per owned recipient → `buildProductBrainDecision` → **planAttentionOrder** → cap |
| DTO fields | `version`, `generatedAt`, `opportunities[]`, `spotlight` |
| Opportunity fields | `recipientId`, `recipientName`, `sourceRuleId`, `outcome`, `priority`, `title`, `explanation`, `profileHref`, `actionLabel`, `rank` |
| `actionLabel` | Server-provided (static map by `sourceRuleId`) — not inferred by frontend |

### Frontend Architecture

| Layer | Responsibility |
|-------|----------------|
| `fetchDashboardBrainOpportunities` | API client |
| `mapDashboardOpportunityViewModel` | DTO → `DashboardOpportunityViewModel` (no Brain internals in UI) |
| `buildDashboardSnapshotForDisplay` | Legacy snapshot first, then Brain fetch + merge when flag on |
| Merge helpers | `mergeBrainSuggestedActionsIntoSnapshot`, `mergeBrainSpotlightIntoSnapshot`, `mergeBrainHeroIntoSnapshot` |

### Feature Flag

```text
VITE_BRAIN_DASHBOARD=true   → Brain-powered relationship surfaces
VITE_BRAIN_DASHBOARD=false  → Full legacy dashboard behavior (rollback)
```

### Brain-Powered Surfaces (flag on)

When `VITE_BRAIN_DASHBOARD=true` and opportunities exist:

| Surface | Source |
|---------|--------|
| **Suggested Actions** | `snapshot.suggestedActions` from server-ranked opportunities |
| **Relationship Spotlight** | Top opportunity (`opportunities[0]`) |
| **Hero concierge summary** | Top opportunity `explanation` |

Rules:

- **No frontend ranking** — order is preserved from server response; display cap is `slice(0, 3)` only
- **No frontend `actionLabel` inference** — server `actionLabel` used verbatim
- **No Brain internals exposed** — Dashboard consumes `DashboardOpportunityViewModel` / snapshot DTOs only
- **Empty opportunities** — safe empty states; no fallback to legacy relationship-health or concierge suggestions when flag is on

### Operational Sections (remain legacy)

These sections are **unchanged** by Dashboard Brain migration:

- Upcoming cards
- Pending approvals
- Attention items
- Recent activity
- Brownie points
- Relationship health widget

### Rollback

Set `VITE_BRAIN_DASHBOARD=false`. Dashboard reverts to legacy:

- Concierge suggestions engine for Suggested Actions
- Relationship-health / occasion spotlight
- Legacy concierge summary in Hero

---

## Next Integration Targets

Recommended order after Sprint 4:

1. **Fatigue Engine** — exposure history, cooldowns, cross-surface dismiss sync (between planner and product mappers)
2. **Concierge Conversation** — migrate keyword/conversation path to Brain-fed opportunities
3. **Relationship Health** — migrate health scoring and gaps to Brain-derived signals
4. **Legacy engine retirement** — remove duplicate client decision paths after migrations are stable
5. **Single batch execution** — optional shared `executeBrain` pass per request (performance)

---

# 1. Purpose

The Brain architecture is now mature enough to become the primary decision making system for F.I. Forgot.

This document defines how the Brain is integrated throughout the product without changing its architecture.

The objective is simple:

```text
One Brain

One Decision Engine

One Source of Truth

```

The application should ask the Brain what to do.

The application should not make relationship decisions independently.

---

# 2. Current State

Today the Brain contains:

- RelationshipContext
- Signal Extraction
- 70 Brain Signals
- Normalized Relationship State
- Life Event Intelligence
- DecisionContext
- Rule Engine
- Action Planner
- Follow Up Question Engine
- Brain Inspector

These components are production ready.

However, much of the application still relies on legacy decision paths or does not yet expose Brain intelligence to users or administrators.

---

# 3. Integration Goals

The Brain should become the system responsible for:

- Determining who needs attention
- Determining why they need attention
- Selecting the next recommended action
- Selecting follow up questions
- Driving relationship maintenance

The frontend becomes a presentation layer.

Business logic belongs inside the Brain.

---

# 4. Integration Principles

## One Source of Truth

Relationship decisions originate only from the Brain.

---

## Progressive Migration

Replace legacy behavior incrementally.

Avoid large rewrites.

---

## No Behavioral Regression

Every migration should preserve existing functionality unless intentionally improved.

---

## Observable Intelligence

Every Brain decision should be explainable through Brain Inspector.

---

## Deterministic Execution

Existing deterministic behavior must remain unchanged.

---

# 5. Current Execution Model

```text
RelationshipContext
        ↓
Signal Extraction
        ↓
Relationship Normalization
        ↓
Life Event Intelligence
        ↓
DecisionContext
        ↓
Rule Engine
        ↓
Action Planner
        ↓
Follow Up Question Engine
        ↓
Question Memory Engine
        ↓
BrainResponse

```

Integration work should consume this pipeline rather than bypass it.

Cross-recipient attention ordering uses **Brain Attention Planner** (`planAttentionOrder`) — see **123_BRAIN_ATTENTION_PLANNER.md**.

---

# 6. Integration Areas

The application can be divided into five major integration areas.

## Dashboard

**Sprint 1 status: Complete** (feature-flagged via `VITE_BRAIN_DASHBOARD`)

Current responsibility (flag on)

Show Brain-ranked relationship opportunities via `GET /api/v2/dashboard/brain-opportunities`.

Brain powers: Suggested Actions, Relationship Spotlight, Hero concierge summary.

Operational sections (upcoming cards, pending approvals, attention items, recent activity, brownie points, relationship health widget) remain legacy.

---

## Recipient Profile

**Sprint 1 status: Complete** (feature-flagged via `VITE_BRAIN_PROFILE_QUESTIONS`)

Current responsibility (flag on)

Brain-first profile questions via `GET /api/v2/recipients/:id/brain`; profile-gap `next-question` fallback only when Brain has no follow-up question.

`ProfileQuestionViewModel` presentation layer; no Brain→NextQuestion adapter chain.

---

## Notifications

**Sprint 2 status: Complete** (feature-flagged via `VITE_BRAIN_NOTIFICATIONS`)

Brain-powered relationship notifications via `GET /api/v2/notifications`. Global ranking via `planAttentionOrder()` (Sprint 4e).

---

## Concierge Workspace

**Sprint 3 status: Complete** (feature-flagged via `VITE_BRAIN_CONCIERGE`)

Brain-powered workspace recommendations and insights via `GET /api/v2/concierge`. Global ranking via `planAttentionOrder()` (Sprint 4e).

Conversation tab remains legacy until a future sprint.

---

## Card Workflow

Current responsibility

Generate and review cards.

Future responsibility

Use Brain recommendations throughout the workflow.

---

## Administration

Current responsibility

Configuration and troubleshooting.

Future responsibility

Full Brain visibility.

---

## Automation

Current responsibility

Scheduled reminders.

Future responsibility

Brain driven relationship maintenance.

---

# 7. Integration Stage 1

## Dashboard

**Status: Complete (Sprint 1)**

Implemented via dedicated Dashboard Brain API — not client-side N+1 `ProductBrainDecision` calls.

See **Dashboard Brain Migration (Sprint 1)** at the top of this document for API route, DTO, ranking, feature flag, and rollback details.

Display (flag on)

- Server-ranked opportunities
- Suggested Actions from `snapshot.suggestedActions`
- Spotlight from top opportunity
- Hero concierge summary from top opportunity explanation
- Server-provided `actionLabel` and `profileHref`

The dashboard answers (flag on)

```text
Who needs attention right now?

```

via Brain opportunities — without frontend re-ranking or label inference.

---

# 8. Integration Stage 2

## Recipient Profile

**Status: Complete (Sprint 1)** — profile questions path only

The recipient profile Brain question experience is migrated. Full profile Brain intelligence UI (opportunity panels, inspector surfacing, etc.) remains future work.

Implemented (flag on)

```text
ProfileQuestionViewModel

Brain-first question resolution

Profile-gap next-question fallback (sequential)

FiProfileQuestionExperience
```

Rollback: `VITE_BRAIN_PROFILE_QUESTIONS=false`

Future profile enhancements may add

```text
Current Opportunity (dashboard-style)

Winning Rule (dev/inspector)

Relationship Timeline (Brain-enriched)

```

---

# 9. Integration Stage 3

## Card Workflow

When a card is created

```text
Recipient

↓

Brain

↓

Recommended Action

↓

Card Workflow

```

Brain determines

- Why the card exists
- Supporting relationship context
- Follow up opportunities
- Missing information

The writing engine consumes Brain output.

---

# 10. Integration Stage 4

## Brain Inspector

Brain Inspector becomes a first class development tool.

Suggested sections

```text
RelationshipContext

Brain Signals

Relationship State

Life Event Intelligence

DecisionContext

Rule Evaluation

Winning Rule

Action Plan

Selected Question

Question Memory

BrainResponse

```

Every execution should be observable.

---

# 11. Integration Stage 5

## Administrative Dashboard

Administrative users should be able to inspect:

- Rule frequency
- Rule winners
- Confidence distribution
- Opportunity distribution
- Relationship health distribution
- Question selection
- Life Event classifications

This information supports tuning without modifying production behavior.

---

# 12. Legacy Migration

Every existing decision path should eventually be classified as one of the following.

```text
Already Brain Driven

Needs Migration

Deprecated

Remove

```

Duplicate business logic should be eliminated over time.

---

# 13. Migration Order

Recommended order

### Phase 1 — Dashboard opportunities

**Complete (Sprint 1)** — `VITE_BRAIN_DASHBOARD`

---

### Phase 2 — Recipient profile

**Complete (Sprint 1)** — profile questions via `VITE_BRAIN_PROFILE_QUESTIONS`

---

### Phase 3 — Card workflow

Not started

---

### Phase 4

Brain Inspector expansion

---

### Phase 5

Administrative reporting

---

### Phase 6

Legacy removal

---

# 14. Success Criteria

The Brain is considered fully integrated when

- All relationship decisions originate from the Brain.
- ~~Dashboard displays Brain opportunities.~~ **Done (Sprint 1, flag-gated)**
- ~~Recipient profiles display Brain state.~~ **Partial (Sprint 1 profile questions; full profile Brain UI pending)**
- Card workflow consumes Brain recommendations.
- Brain Inspector explains every decision.
- Legacy decision logic has been removed.

Sprint 1 verification: 238 targeted unit tests pass (server + frontend); rollback paths confirmed for both dashboard and profile flags.

---

# 15. Regression Strategy

Every migration should verify

- Existing APIs remain stable.
- Existing Rule Engine behavior is unchanged.
- Existing BrainResponse contract is unchanged unless explicitly approved.
- Existing frontend behavior continues to function.

Integration should expose Brain intelligence rather than redesign it.

---

# 16. Development Guidelines

When integrating the Brain

Prefer

```text
Frontend

↓

Brain

↓

Display

```

Avoid

```text
Frontend

↓

Business Logic

↓

Brain

```

Business rules belong in the Brain.

Presentation belongs in the frontend.

---

# 17. Brain Inspector As Ground Truth

During development

Every UI recommendation should be traceable to Brain Inspector.

If the UI and Brain Inspector disagree

Brain Inspector is considered authoritative until proven otherwise.

---

# 18. Monitoring

Future metrics may include

- Rule frequency
- Rule conflicts
- Opportunity conversion
- Question usage
- Question completion
- Relationship health trends
- Opportunity aging
- Card generation outcomes

Metrics should improve tuning, not change deterministic execution.

---

# 19. Risks

Potential risks include

- Duplicate business logic
- Partial migrations
- Frontend bypassing the Brain
- UI depending on internal implementation details
- Drift between Brain Inspector and production behavior

Every integration should reduce these risks.

---

# 20. Out of Scope

This document does not define

- New Brain rules
- Question Memory implementation
- Writing Intelligence
- AI prompting
- Frontend redesign
- Database schema changes

Those are covered by separate architecture documents.

---

# 21. Recommended Integration Sprint

## Sprint 1 — Complete

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Product Brain API (`GET /api/v2/recipients/:id/brain`) | Done |
| 2 | Brain Playground (`/brain-playground`) | Done |
| 3 | Recipient profile questions (`VITE_BRAIN_PROFILE_QUESTIONS`) | Done |
| 4 | Dashboard Brain migration (`VITE_BRAIN_DASHBOARD`) | Done |

## Sprint 2 — Complete

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Notifications Brain API (`GET /api/v2/notifications`) | Done |
| 2 | `VITE_BRAIN_NOTIFICATIONS` rollback flag | Done |

## Sprint 3 — Complete

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Concierge workspace API (`GET /api/v2/concierge`) | Done |
| 2 | `VITE_BRAIN_CONCIERGE` rollback flag | Done |

## Sprint 4 — Complete

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Extract phase — collector + shared inclusion (4b) | Done |
| 2 | GlobalOpportunity pool (4c) | Done |
| 3 | Brain Attention Planner — `planAttentionOrder()` (4d) | Done |
| 4 | Product builders wired to planner (4e) | Done |
| 5 | Documentation + architecture guards (4f) | Done |

Each milestone is independently testable. Product surfaces remain rollback-capable via feature flags.

## Sprint 5+ (planned)

See **Next Integration Targets**:

1. Fatigue Engine
2. Concierge Conversation migration
3. Relationship Health
4. Legacy engine retirement
5. Single batch Brain execution (performance)

Remaining original milestones

6. Card workflow integration
7. Brain Inspector improvements
8. Administrative reporting
9. Legacy cleanup (rank utilities, client engines)

---

# 22. Definition of Complete

Brain integration is complete when

- The Brain is the single decision engine.
- Every recommendation originates from the Brain.
- The frontend performs presentation rather than decision making.
- Administrators can inspect every Brain decision.
- Users benefit from Brain intelligence without knowing the internal architecture.

---

# 23. Architectural Summary

The Brain is no longer an isolated intelligence engine.

It becomes the operational core of F.I. Forgot.

The product architecture becomes:

```text
User

↓

Frontend (ViewModels)

↓

Product APIs (Dashboard / Notifications / Concierge DTOs)

↓

Product builders (cap + map)

↓

Brain Attention Planner (planAttentionOrder — global rank)

↓

Per-recipient Brain (executeBrain → ProductBrainDecision)

↓

Recommendation

↓

Experience

```

The frontend presents.

The Brain thinks.

This document serves as the migration blueprint for making the Brain the central source of truth throughout the F.I. Forgot platform while preserving the deterministic, explainable architecture established in Documents 114 through 121.