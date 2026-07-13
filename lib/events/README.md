# @workspace/events

Unified Event Domain — shared platform source of truth for event knowledge.

**Authoritative architecture:** `playbook/126_UNIFIED_EVENT_DOMAIN.md`

## Status

Sprint 7 complete (Phases 7B.1–7C.6).

Brain consumes this package through a **thin adapter only**:

```text
@workspace/events
        ↓
artifacts/api-server/src/brain/events/eventDomain/
        ↓
Brain event consumers
```

**Frontend and other packages must not import this package yet** (except future
explicit projection migrations).

Brain, frontend, admin, Handwrytten, and AI continue to use their existing
local definitions for non-migrated concerns (timing resolution, questions,
presentation, integrations).

## Approved initial event set

Exactly three events:

- `birthday`
- `anniversary`
- `valentines_day`

Do not add Mother's Day or any other event in this package until an explicit
expansion phase.

## Ownership

| Owns | Does not own |
|------|----------------|
| Event identity (`EventId`, display labels, aliases) | Brain rule registration / priority / confidence |
| Scheduling metadata + occurrence **contracts** | Brain decision policy / Action Planner mappings |
| Availability requirements (declarative) | Product URLs / frontend navigation / DTOs |
| Briefing **references** only (question-set id, version, title) | Question catalogs / `EVENT_QUESTIONS` / selection / execution |
| Integration **metadata** (refs only; not consumed by Brain yet) | Integration execution / SDK clients / secrets |
| Presentation metadata (UI only; not consumed by Brain yet) | Fatigue / card preparation authorization |
| Consumer projections | AI prompt execution / Handwrytten API calls |

This package **never** imports from `brain/`.
Brain consumes this domain via a Brain-owned thin adapter
(`artifacts/api-server/src/brain/events/eventDomain/`).
Other packages must not import this package until an explicit migration phase.

## Identity separation

| Concept | Owner | Notes |
|---------|-------|-------|
| `EventId` | Event Domain | Closed union from `EVENT_IDS` |
| `EventOccurrenceRef` | Event Domain (shape only) | Distinct from `EventId` |
| `BriefingQuestionSetId` | Event Domain | Branded; not interchangeable with `EventId` |
| Brain `sourceRuleId` | Brain | **Not defined in this package** |
| External integration IDs | Integration systems | Metadata references only; Brain adapter does not expose them in Phase 7C.5 |

Display labels are not permanent identity. `EventId` is.

Briefing records in this package are **references**, not executable question
catalogs. Actual question content remains in consumer systems such as
`EVENT_QUESTIONS`.

## Registry authority

`EVENT_IDS` / `EVENT_IDENTITY_REGISTRY` are the single identity source.

Other registries (scheduling, availability, briefing, integrations, presentation)
are keyed by `EventId` and compile-time complete via `CompleteEventRecord<T>`.
They must not redefine identity facts (labels, aliases).

## Consumer projection rule

Consumers must use **projections**, not raw internal definitions:

- `CatalogProjection`
- `FrontendOccasionProjection`
- `CalendarProjection`
- `BriefingProjection`
- `AdminProjection`
- `HandwryttenProjection`
- `AiProjection`
- `CardLibraryProjection`

There is **no Brain projection** in this package — Brain owns its adapter.

Projections return frozen plain objects with only the fields each consumer needs.

## Scheduling stub status

`resolveOccurrence` is a **safe stub**:

- Always `stubbed: true`, `applicable: false`
- Always null dates / cycle year / daysUntil
- Never invents dates, never defaults to current year, never infers recipient data
- Must not be consumed by production code until timing migration

## Availability adapter boundary

Valentine's Day may declare romantic eligibility as **declarative metadata**
(`roles: ["romantic"]` + optional example type strings).

This domain does **not**:

- inspect `RelationshipContext`
- infer relationship type
- import Brain normalization
- create a competing relationship intelligence engine

## Tests

```bash
npx tsc -p lib/events/tsconfig.json --noEmit
corepack pnpm dlx tsx lib/events/src/__tests__/events-domain.test.ts
corepack pnpm dlx tsx lib/events/src/__tests__/events-architecture.test.ts
```
