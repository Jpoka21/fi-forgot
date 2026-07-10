# 124 BRAIN FATIGUE ENGINE

## Document Status

Status: Official architecture reference

Phase: Integration Sprint 5 complete (5a–5g)

Depends on:

- 121 Brain Execution Pipeline
- 122 Brain Integration Plan
- 123 Brain Attention Planner
- `artifacts/api-server/src/brain/fatigue/`

---

# 1. Purpose

The **Brain Fatigue Engine** answers one product-agnostic question:

```text
Should the user see this opportunity right now,
or should it be temporarily suppressed?
```

It operates on **already-ranked** `GlobalOpportunity[]` from the Brain Attention Planner. It does not re-run rules, re-score attention, change `globalRank`, or map product DTOs.

The planner remains the **single source of truth for attention ordering**. Fatigue only filters opportunities using exposure history.

---

# 2. Architecture diagram

```mermaid
flowchart TB
  subgraph perRecipient ["Per-Recipient Brain"]
    PBD[ProductBrainDecision[]]
  end

  subgraph attention ["Brain Attention Planner"]
    PLAN[planAttentionOrder]
    RANKED[ranked GlobalOpportunity[]]
    PLAN --> RANKED
  end

  subgraph fatigue ["Brain Fatigue Engine"]
    LOAD[loadExposureSnapshot]
    CTX[FatigueContext]
    APPLY[applyFatigue]
    VIS[getVisibleFatigueOpportunities]
    RANKED --> APPLY
    LOAD --> CTX --> APPLY --> VIS
  end

  subgraph orchestration ["Product Fatigue Orchestration"]
    ORCH[orchestrateProductBrainFatigue]
    REC[recordSurfacedOpportunities]
    VIS --> ORCH
    ORCH --> REC
  end

  subgraph products ["Product builders"]
    CAP[slice product cap]
    MAP[map to DTO]
    ORCH --> CAP --> MAP
  end

  PBD --> PLAN
  MAP --> ROUTES[Routes → Frontend]
```

---

# 3. Fatigue pipeline

## Production path (Dashboard, Notifications, Concierge)

```text
collectProductBrainDecisions
  → orchestrateProductBrainFatigue
      → runAttentionFatiguePipeline
          → planAttentionOrder()
          → buildFatigueContext() / loadExposureSnapshot()
          → applyFatigue()
          → getVisibleFatigueOpportunities()
      → buildFromVisible (product builder callback)
          → slice(product cap)
          → map to DTO
      → recordSurfacedOpportunities(delivered only)
  → product DTO response
```

## Module layout

```text
artifacts/api-server/src/brain/fatigue/
├── applyFatigue.ts
├── buildFatigueContext.ts
├── evaluateFatigueOpportunity.ts
├── fatigueEnforcementConfig.ts
├── fatiguePolicyConstants.ts
├── fatigueSuppressionReasons.ts
├── fatigueTypes.ts
├── getVisibleFatigueOpportunities.ts
├── runAttentionFatiguePipeline.ts
├── exposure/
│   ├── exposureTypes.ts
│   ├── loadExposureSnapshot.ts
│   ├── materializeExposureSnapshot.ts
│   ├── recordExposureEvent.ts
│   ├── recordSurfacedOpportunities.ts
│   ├── exposureRepository.ts
│   └── pgExposureRepository.ts
├── rules/
│   └── recentlySurfacedRule.ts
└── utils/
    ├── isWithinCooldown.ts
    └── parseExposureTimestamp.ts

artifacts/api-server/src/brain/product/
└── orchestrateProductBrainFatigue.ts
```

---

# 4. Exposure model

## Event types

| `eventType` | Meaning | Production writer (Sprint 5) |
|-------------|---------|------------------------------|
| `surfaced` | Opportunity delivered in a product DTO | Yes — centralized orchestration |
| `dismissed` | User dismissed the opportunity | No — deferred |
| `completed` | User completed suggested action | No — deferred |

## Exposure key

```text
opportunityKey = recipientId:sourceRuleId
```

Shared across Dashboard, Notifications, and Concierge. Aligns with Brain notification ids.

## ExposureRecord (derived)

| Field | Purpose |
|-------|---------|
| `lastSurfacedAt` | Cooldown for `recently_surfaced` |
| `lastDismissedAt` | Future `recently_dismissed` |
| `lastCompletedAt` | Future `recently_completed` |
| `surfacedCount` | Future `repeatedly_surfaced` |
| `dismissedCount` | Future dismiss rules |

## ExposureSnapshot

Read-optimized snapshot passed into `FatigueContext`:

```text
{ loadedAt, byOpportunityKey: Record<opportunityKey, ExposureRecord> }
```

Materialized from append-only events via `materializeExposureSnapshot()`.

---

# 5. Persistence model

## Table

```text
brain_opportunity_exposure_events
```

Append-only. Schema: `lib/db/src/schema/brain-opportunity-exposure-events.ts`

| Column | Purpose |
|--------|---------|
| `user_id` | Per-user isolation |
| `opportunity_key` | `recipientId:sourceRuleId` |
| `recipient_id` | Denormalized index |
| `source_rule_id` | Denormalized index |
| `event_type` | `surfaced` \| `dismissed` \| `completed` |
| `occurred_at` | Event timestamp |

## Write path

```text
orchestrateProductBrainFatigue
  → recordSurfacedOpportunities
      → dedupe by opportunityKey
      → recordExposureEvent (per delivered item)
      → pgExposureRepository.insertExposureEvent
```

Only **delivered** opportunities (survived fatigue, survived cap, in DTO) are recorded.

## Read path

```text
buildFatigueContext
  → loadExposureSnapshot
      → listExposureEventsForUser
      → materializeExposureSnapshot
```

---

# 6. Rule evaluation flow

```text
ranked GlobalOpportunity[]
  → applyFatigue(ranked, FatigueContext)
      → for each opportunity in order (map, never sort):
          → evaluateFatigueOpportunity()
              → evaluateRecentlySurfacedRule()
          → if enforcement off: visible + optional shadow log
          → if enforcement on: use rule result
  → FatigueOpportunity[] (same length, same order)
  → getVisibleFatigueOpportunities()
  → visible FatigueOpportunity[]
```

Rules evaluate opportunities **independently**. First matching rule wins (one rule in Sprint 5).

---

# 7. Current active rule

## `recently_surfaced`

Suppress when `lastSurfacedAt` exists and:

```text
evaluatedAt - lastSurfacedAt < 24 hours
```

Visible when:

```text
evaluatedAt - lastSurfacedAt >= 24 hours
```

| Output field | Value when suppressed |
|--------------|----------------------|
| `fatigueDecision` | `suppressed` |
| `suppressionReason` | `recently_surfaced` |
| `deferUntil` | `null` |

Cooldown constant: `RECENTLY_SURFACED_COOLDOWN_MS = 86_400_000` (24 hours).

---

# 8. Feature flags

Read at evaluation time from `fatigueEnforcementConfig.ts`:

| Environment variable | Default | Effect |
|---------------------|---------|--------|
| `BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED` | `true` | Log `wouldSuppress` when rule would fire but enforcement is off |
| `BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED` | `false` | When `false`, all opportunities return `visible` regardless of exposure |

**Current production posture:**

- Shadow: **enabled**
- Enforcement: **disabled**

Product DTO output is unchanged until enforcement is explicitly enabled.

---

# 9. Rollout strategy

## Phase A — Shipped (Sprint 5f)

- Rule implemented
- Shadow logging enabled by default
- Enforcement disabled by default
- Exposure `surfaced` events recording active

## Phase B — Validation (operational)

Before enabling enforcement:

1. Confirm `brain_opportunity_exposure_events` table provisioned
2. Confirm surfaced writes succeeding
3. Audit `opportunity_key` correctness
4. Review shadow `wouldSuppress` log rates
5. Minimum observation window (recommended 7 days post-5e deploy)

## Phase C — Enforcement

```text
BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED=true
```

Applies globally to Dashboard, Notifications, and Concierge via shared orchestration. Rollback: set flag to `false`.

---

# 10. Future rules

| Rule | Status | Prerequisite |
|------|--------|--------------|
| `recently_dismissed` | Planned | Server dismiss API + client sync |
| `recently_completed` | Planned | Completed event producers |
| `repeatedly_surfaced` | Planned | Count threshold policy |
| Per-surface tracking | Not planned | Would require `FatigueSurface` — rejected |

Add rules as individual modules under `brain/fatigue/rules/` and register in `evaluateFatigueOpportunity.ts`.

---

# 11. Cross-product behavior

Exposure records are **product-agnostic**. Surfacing an opportunity on Dashboard writes a `surfaced` event for the shared `opportunityKey`. A subsequent Notifications or Concierge request within the cooldown window may suppress that key when enforcement is enabled.

This is intentional cross-surface deduplication, not a bug. Per-surface fatigue was explicitly rejected to avoid `requestingSurface` / `FatigueSurface`.

Concierge deduplicates overlapping recommendations and insights by `opportunityKey` before surfaced recording.

---

# 12. Failure policy

| Failure | Behavior |
|---------|----------|
| `loadExposureSnapshot` fails | Empty snapshot → all visible |
| Invalid / future timestamps | Fail open → visible |
| `applyFatigue` throws | Pipeline catch → pass-through all visible |
| `recordSurfacedOpportunities` fails | Log warning → response unaffected |
| Shadow logging fails | Ignored → response unaffected |

Fatigue must **never** prevent product responses.

---

# 13. Deployment checklist

Before enabling `BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED=true`:

- [ ] Exposure table provisioned in production
- [ ] Surfaced events writing successfully (`event_type = surfaced`)
- [ ] User isolation verified (`user_id` filter on reads/writes)
- [ ] `opportunity_key` matches `recipient_id:source_rule_id`
- [ ] Duplicate surfaced rate acceptable
- [ ] `occurred_at` timestamps sane (UTC)
- [ ] `loadExposureSnapshot failed` log volume low
- [ ] Snapshot load latency acceptable on product routes
- [ ] Shadow logs show reasonable would-suppress rate
- [ ] Golden parity tests pass with enforcement off in CI

---

# 14. Architecture boundaries

## Fatigue owns

- `FatigueContext`, `FatigueOpportunity`, `FatigueDecision`
- Exposure snapshot loading and surfaced event recording (via orchestration)
- Rule evaluation and visible filtering
- Feature flag interpretation

## Fatigue must never

- Change Brain decisions or `ProductBrainDecision`
- Recalculate `attentionScore` or `globalRank`
- Sort planner output
- Perform product caps
- Import product builder modules or DTO mappers
- Import frontend code
- Add `requestingSurface`, `FatigueSurface`, or `fatigueScore`
- Mutate `GlobalOpportunity` during evaluation
- Modify exposure history during evaluation

## Product builders own

- `collectProductBrainDecisions`
- Product caps (`slice`)
- DTO mapping
- Identifying `deliveredFatigueOpportunities` for orchestration

## Product builders must never

- Call `planAttentionOrder`, `applyFatigue`, `loadExposureSnapshot`, or `recordSurfacedOpportunities` directly
- Re-rank opportunities

## Planner must never

- Import fatigue modules
- Apply exposure or cooldown logic

---

# 15. Design decisions

| Decision | Rationale |
|----------|-----------|
| Fatigue after planner | Needs global rank order before filtering |
| Caps after fatigue | Cap the visible list, not the full ranked pool |
| Centralized orchestration | Single exposure recording path; builders stay thin |
| Shared `opportunityKey` | Cross-product dedup without per-surface dimension |
| Shadow before enforcement | Validate rule behavior without product behavior change |
| Append-only events + materialized snapshot | Audit trail + fast reads |
| Fail-open everywhere | Fatigue side effects must not block product responses |
| One rule in 5f | Smallest safe increment with live `surfaced` producer |
| `recently_surfaced` over `recently_dismissed` first | Dismissed events have no production writer yet |

---

# 16. Deferred work

- `recently_dismissed` rule + server dismiss endpoint + client migration
- `completed` event producers (card sent, question answered)
- `repeatedly_surfaced` count threshold rule
- Adaptive cooldowns and session caps
- Exposure retention / analytics jobs
- PostgreSQL `CHECK` constraint on `event_type` (optional)
- Per-surface exposure tracking

---

# Guard tests

| Suite | Purpose |
|-------|---------|
| `brain-fatigue-architecture.test.ts` | Fatigue module boundaries |
| `brain-attention-architecture.test.ts` | Orchestration + planner boundaries |
| `brain-fatigue-rules.test.ts` | Rule semantics and rollout flags |
| `brain-fatigue-noop.test.ts` | Pass-through parity when enforcement off |
| `brain-fatigue-product-integration.test.ts` | Product wiring guards |
| `brain-fatigue-exposure-persistence.test.ts` | Exposure persistence |

---

# Related documents

- **122** — Brain Integration Plan (Sprint 5 status)
- **123** — Brain Attention Planner
- **115** — Implementation Tracker

---

# Definition of done (Sprint 5)

- [x] 5a — Architecture plan
- [x] 5b — Internal types + pass-through `applyFatigue()`
- [x] 5c — Exposure model
- [x] 5d — Persistence (append-only events + repository)
- [x] 5e — Product integration via `orchestrateProductBrainFatigue`
- [x] 5f — `recently_surfaced` rule (shadow on, enforcement off)
- [x] 5g — This document + architecture guards
