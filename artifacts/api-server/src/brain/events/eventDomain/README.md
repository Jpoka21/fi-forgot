# Brain Event Domain Adapter

Thin adapter between `@workspace/events` and Brain.

**Authoritative architecture:** `playbook/126_UNIFIED_EVENT_DOMAIN.md`

## Dependency direction

```text
@workspace/events
        ↓
brain/events/eventDomain/adapter.ts   ← only allowed @workspace/events import
        ↓
existing Brain event consumers
```

Brain is a **consumer** of the Event Domain. The Event Domain must never import Brain.

## Adapter responsibility

- Expose Brain-safe event identity views (`eventId`, display label, category, kind)
- Expose static timing **metadata** (not occurrence resolution)
- Expose static **preparation metadata** (label + timing descriptors + classification)
- Expose static **availability metadata** (surfaces + declared role hints)
- Translate romantic availability roles using Brain relationship matchers
- Fail closed on unknown event identifiers (no fuzzy matching)

## Brain ownership (not migrated)

- Rule registration and `sourceRuleId`
- Rule priority and confidence
- Decision policy / Action Planner / routing / URLs
- Card preparation authorization
- Attention, fatigue, provenance, outcomes
- Occurrence date calculation, preparation windows, and `EventPreparationContext` construction

## Preparation metadata (Phase 7C.2)

`getBrainEventPreparationMetadata` supplies static facts for preparation consumers:

- canonical `eventId`
- `briefingEventLabel` (from briefing question-set title — Phase 7C.3)
- static timing descriptors
- category / kind

It does **not** supply windows, lead times, occurrence dates, or decision policy.

## Briefing references (Phase 7C.3)

Event Domain owns briefing **references and metadata only**.

`getBrainEventBriefingMetadata` exposes:

- `eventId`
- `questionSetId` (distinct concept from `EventId` / `sourceRuleId`)
- `questionSetVersion`
- `questionSetTitle`

It does **not** expose question text, ordering, selection, or `EVENT_QUESTIONS`.

Brain and existing briefing systems continue to own:

- question content (`EVENT_QUESTIONS` and related catalogs)
- question selection / Follow Up Question Engine
- briefing answer storage and completion evaluation
- briefing execution and routing policy

`BriefingQuestionSetId` values may currently coincide with `EventId` strings for the
three v1 events; they remain separate identities and must not be derived from each
other by string manipulation.

## Availability metadata (Phase 7C.4)

Event Domain owns static availability **facts** (surfaces, declared role hints).

`getBrainEventAvailabilityMetadata` exposes:

- `eventId`
- `surfaces.personal` / `surfaces.business`
- `declaredRoles`
- `requiresRomanticRelationship`

It does **not**:

- decide whether a Brain rule should fire
- calculate occurrence windows or “due today”
- authorize card preparation
- use Event Domain `includeTypes` as a relationship taxonomy

`isEventAvailableForRelationship` remains a Brain-owned interpreter of those
static facts (romantic role → `isRomanticRelationshipType`). Timing / window /
rule evaluation stay in Brain.

## Integration metadata (Phase 7C.5)

Event Domain owns static integration **references** (Handwrytten categories, AI
archetypes, card classifier keywords, card library categories, email match
keywords).

**Inspection result:** Brain event modules and immediate Brain event consumers do
**not** currently duplicate or consume those integration registries.

Therefore Phase 7C.5 does **not** add a Brain integration metadata adapter API
and does **not** invent an artificial consumer.

Ownership remains:

| Concern | Owner |
|---------|--------|
| Static integration identifiers | `@workspace/events` (unused by Brain today) |
| Provider execution / SDKs | Existing integration services |
| Product URLs | Product builders |
| Rule / preparation / routing policy | Brain |

The adapter must continue to **exclude** integration, presentation, Handwrytten,
AI, email, and Card Library metadata from Brain-safe views.

## Presentation metadata (Phase 7C.6)

Event Domain owns static presentation **facts** (emoji, admin badge classes,
calendar/timeline visibility, filter groups, onboarding weights).

**Inspection result:** Brain event modules and immediate Brain event consumers do
**not** currently duplicate or consume the presentation registry.

Labels already used by Brain remain on their existing owners:

| Label kind | Owner / API |
|------------|-------------|
| Identity display label | Identity / `getBrainEventView` |
| Briefing question-set title | Briefing / `getBrainEventBriefingMetadata` |
| Preparation briefing label | Preparation / `getBrainEventPreparationMetadata` |
| Product display copy | Product builders (`productBrainDisplayCopy`) |

These strings may currently match, but ownership and semantics stay separate.

Therefore Phase 7C.6 does **not** add a Brain presentation metadata adapter API
and does **not** invent an artificial consumer.

Frontend continues to own rendering. DTO builders continue to own DTO construction.

## Identity separation

```text
eventId !== sourceRuleId
```

`sourceRuleId` is Brain attribution. Canonical `eventId` comes from `@workspace/events`.
Values may coincide for v1 calendar rules; they remain separate concepts.

## Availability translation

Valentine's Day declares `roles: ["romantic"]` in the Event Domain.

This adapter maps that role through Brain's existing `isRomanticRelationshipType`
helper so eligibility parity is preserved.

Event Domain `includeTypes` example strings are **not** used as an authoritative
relationship taxonomy.

## Prohibited direct imports

Production Brain modules outside this folder must **not** import `@workspace/events`.
Import Event Domain facts only through `brain/events/eventDomain`.

## Scheduling remains unmigrated

`resolveOccurrence` from `@workspace/events` is a stub and must **not** be called
by production Brain code. Timing metadata may be read; occurrence calculation
stays in existing Brain utilities.
