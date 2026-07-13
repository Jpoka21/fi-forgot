# 126_UNIFIED_EVENT_DOMAIN.md

# Unified Event Domain

> **Status:** Sprint 7 complete (Phases 7B.1–7C.6 + final verification)  
> **Package:** `@workspace/events` (`lib/events`)  
> **Brain adapter:** `artifacts/api-server/src/brain/events/eventDomain/`  
> **Related:** `122_BRAIN_INTEGRATION_PLAN.md`, `115_RELATIONSHIP_INTELLIGENCE_IMPLEMENTATION_TRACKER.md`, `125_BRAIN_CARD_PREPARATION_AUTHORIZATION.md`

---

## 1. Purpose

The Unified Event Domain is the shared, Brain-independent source of truth for
**static event knowledge** across F.I. Forgot.

It owns declarative facts about registered calendar occasions. It does **not**
own Brain decision policy, product routing, frontend rendering, or provider
execution.

---

## 2. Problem solved

Before Sprint 7, event identity and related static facts were duplicated across
Brain catalogs, frontend occasion lists, Handwrytten/AI/email helpers, and other
systems. Sprint 7 establishes a closed shared package and a thin Brain adapter so
Brain consumes Event Domain facts in one direction only:

```text
@workspace/events
        ↓
brain/events/eventDomain/adapter.ts
        ↓
Brain event consumers
```

---

## 3. Package location

| Item | Path |
|------|------|
| Package | `lib/events` |
| Name | `@workspace/events` |
| Public entry | `lib/events/src/index.ts` |
| README | `lib/events/README.md` |

Initial registered events (exact set):

- `birthday`
- `anniversary`
- `valentines_day`

---

## 4. Ownership boundaries

### Event Domain owns

| Module | Owns |
|--------|------|
| Identity | `EventId`, display labels, aliases, category, kind |
| Scheduling | Static timing descriptors + stubbed occurrence contract |
| Availability | Surfaces, declarative role hints |
| Briefing | Question-set references (id, version, title) — not question content |
| Integrations | Handwrytten / AI / classifier / library / email **metadata only** |
| Presentation | Emoji, admin badges, calendar/timeline visibility, onboarding weights |
| Projections | Consumer-shaped read models (not Brain adapters) |

### Brain owns

- Rule registration, conditions, priorities, confidence
- Decision policy and Action Planner mappings
- Routing experience selection
- Event preparation **execution** (`EventPreparationContext` construction)
- Occurrence calculation and preparation windows
- Runtime relationship eligibility interpretation
- Card preparation authorization
- Fatigue, attention, outcomes, provenance policy

### Others own

| Owner | Responsibility |
|-------|----------------|
| Product builders | Final URLs, product display copy |
| DTO builders | DTO construction |
| Frontend | Rendering, layout, passive link consumption |
| Integration services | Provider SDKs and execution |
| `EVENT_QUESTIONS` / question systems | Question content and selection |

---

## 5. Package modules

```text
lib/events/src/
  core/           identity + EventId
  scheduling/     timing metadata + stubbed resolveOccurrence
  normalization/  alias → EventId resolution
  availability/   surfaces + relationshipFilter hints
  briefing/       EventBriefingRef + question-set meta
  integrations/   provider metadata registries
  presentation/   UI metadata
  projections/    frozen consumer projections
```

---

## 6. Identity registry

- Closed `EventId` union from `EVENT_IDS`
- `EVENT_IDENTITY_REGISTRY` is the single identity authority
- Display labels are not permanent identity
- `EventId` is not interchangeable with `sourceRuleId`, `BriefingQuestionSetId`, or external integration IDs

---

## 7. Scheduling metadata and inactive resolver

- Registries declare static timing (`recipient_date` / `fixed_calendar`)
- `resolveOccurrence()` is **stubbed** (`stubbed: true`, null dates)
- Production Brain must not call Event Domain occurrence APIs
- Brain continues to compute days-away and cycle years via Brain utilities

---

## 8. Availability metadata

- Surfaces: `personal` / `business`
- Declarative `roles` (e.g. `romantic`) for adapters to interpret
- `includeTypes` are example strings for adapters — not a taxonomy engine
- Brain interprets romantic eligibility via `isRomanticRelationshipType`

---

## 9. Briefing references

- `EventBriefingRef`: `eventId`, `questionSetId`, `version`
- Question-set meta: title + version
- **No** question text, ordering, or `EVENT_QUESTIONS` content in this package

---

## 10. Integration metadata

Declarative registries for Handwrytten, AI generation, card classifier, card
library, and email delivery.

Metadata only — no SDKs, secrets, payloads, or provider calls.

**Brain consumer status (Sprint 7):** not consumed; not exposed via Brain adapter.

---

## 11. Presentation metadata

Emoji, admin badge classes, calendar/timeline visibility, filter groups,
onboarding weights.

UI metadata only — never Brain decision input.

**Brain consumer status (Sprint 7):** not consumed; not exposed via Brain adapter.

---

## 12. Brain adapter purpose

Location: `artifacts/api-server/src/brain/events/eventDomain/`

The adapter is the **only** production module allowed to import `@workspace/events`.

It translates Event Domain facts into Brain-safe shapes and must not:

- Execute integrations or import provider SDKs
- Render UI or import frontend modules
- Build DTOs, routes, or final URLs
- Resolve occurrences or read “now” for eligibility
- Authorize cards or decide whether rules fire
- Expose integration or presentation metadata without an approved consumer

---

## 13. Adapter APIs (Sprint 7)

| API | Purpose |
|-----|---------|
| `listSupportedBrainEventIds` / `isSupportedBrainEventId` | Supported set |
| `toCanonicalEventId` / `requireCanonicalEventId` | Exact id mapping (fail closed) |
| `getBrainEventView` / `listBrainEventViews` | Identity + composed availability flags |
| `getBrainEventTimingMetadata` | Static timing descriptors only |
| `getBrainEventPreparationMetadata` | Prep-facing label + timing + classification |
| `getBrainEventBriefingMetadata` | Question-set ref + title + version |
| `getBrainEventAvailabilityMetadata` | Surfaces + declared roles |
| `isBrainEventAvailableOnSurface` | Static surface flag |
| `isEventAvailableForRelationship` | Brain-owned romantic interpretation |
| `getCanonicalEventDisplayLabel` | Identity display label |

No integration or presentation metadata APIs were added (no Brain consumer).

---

## 14. Compatibility facades

| Facade | Role |
|--------|------|
| `BRAIN_EVENT_IDS` / `BRAIN_EVENT_CATALOG` / `getBrainEventDefinition` | Compatibility for existing Brain consumers; sourced from adapter metadata, not an independent identity catalog |
| `CALENDAR_EVENT_RULE_TARGETS` | Brain `sourceRuleId` ↔ `targetEventId` mapping (Brain policy) |

These are **not** new universal sources of truth.

---

## 15. Production import boundary

```text
Allowed production import of @workspace/events:
  artifacts/api-server/src/brain/events/eventDomain/adapter.ts

Allowed test / package-internal imports:
  lib/events internals + explicitly allowlisted architecture/adapter tests

Forbidden:
  frontend, product builders, DTO builders, Brain rules, other services
```

Api-server depends on `@workspace/events` via `workspace:*`. Frontend must not.

---

## 16. Consumer migration status

| Phase | Migration |
|-------|-----------|
| 7C.1 | Thin adapter + identity wiring |
| 7C.2 | Preparation static metadata |
| 7C.3 | Briefing references (labels via question-set title) |
| 7C.4 | Availability metadata API |
| 7C.5 | Integration inspection — **no forced migration** |
| 7C.6 | Presentation inspection — **no forced migration** |

Migrated Brain consumers include catalog facade, preparation builder, timing /
occurrence-date helpers, and Action Planner routing label enrichment.

---

## 17. Metadata intentionally not exposed to Brain

- Handwrytten / AI / classifier / library / email registries
- Presentation emoji, badges, calendar filter groups, onboarding weights
- Full Event Domain projection objects for frontend/admin/Handwrytten/AI

---

## 18. Runtime behavior still owned by Brain

Occurrence math, preparation windows, rule evaluation, Action Planner, routing,
URLs, fatigue, attention, outcomes, card authorization, romantic matcher
application.

---

## 19. Identity separation

```text
eventId          ≠ sourceRuleId
questionSetId    ≠ eventId          (distinct concepts; values may coincide)
integration IDs  ≠ eventId
presentation keys ≠ eventId
```

Do not derive one identifier from another via string manipulation.

---

## 20. Label separation

Keep ownership distinct even when strings currently match:

| Label | Owner |
|-------|-------|
| Identity `displayLabel` | Event Domain identity |
| Briefing `questionSetTitle` | Event Domain briefing meta |
| Preparation `briefingEventLabel` | Brain prep (from briefing title) |
| Product titles (e.g. “Birthday preparation”) | Product builders |
| Route / URL path segments | Product builders from routing |

---

## 21. Testing strategy

- Domain unit + architecture tests under `lib/events/src/__tests__/`
- Adapter + Brain boundary tests under `artifacts/api-server/src/__tests__/`
- Sprint 6 regression suites for rules, preparation, routing, provenance,
  fatigue, attention, outcomes, product builders

---

## 22. Architecture guards

Primary guards:

- `lib/events/src/__tests__/events-architecture.test.ts`
- `artifacts/api-server/src/__tests__/brain-event-domain-architecture.test.ts`
- `event-*-metadata.test.ts` suites (preparation, briefing, availability,
  integration no-migration, presentation no-migration)
- `event-domain-adapter.test.ts`

---

## 23. Contributor rules

1. Do not add events to `@workspace/events` without an explicit expansion phase.
2. Do not import `@workspace/events` outside the Brain adapter in production.
3. Do not call `resolveOccurrence` from production Brain code.
4. Do not move Brain policy (`sourceRuleId`, priority, confidence) into the domain.
5. Do not migrate `EVENT_QUESTIONS` into the domain.
6. Do not expose integration/presentation metadata to Brain without an approved consumer.
7. Prefer adapter composition over broadening `BRAIN_EVENT_CATALOG`.

---

## 24. Deferred work

- Activate Event Domain scheduling resolution (replace stub) when approved
- Migrate frontend occasion catalogs to Event Domain projections
- Migrate Handwrytten / AI / email / admin consumers via their projections
- Expand beyond the three initial events
- Concierge conversation / relationship health / legacy retirement (product sprints)

---

## 25. Explicit prohibited dependencies

`@workspace/events` must not import:

- `brain/`
- Frontend packages
- Provider SDKs (`handwrytten`, OpenAI, Anthropic, SendGrid, etc.)
- Question catalogs / `EVENT_QUESTIONS`
- Database repositories for event authority

The Brain adapter must not import:

- Provider SDKs
- Frontend / React
- Product builders / DTO builders
- `resolveOccurrence` / occurrence calculators from the domain
- Environment-driven provider execution

---

## 26. Final production pipeline (unchanged)

```text
RelationshipContext
→ Signal Extraction
→ NormalizedRelationshipState
→ DecisionContext
→ EventPreparationContext
→ Rule Engine
→ ProductBrainDecision
→ Action Planner
→ Routing Enrichment
→ Brain Attention Planner
→ Fatigue Engine
→ Product Builders
→ DTOs
→ Passive Frontend
→ Card Provenance
→ Outcome Engine
```

Sprint 7 changes **static event facts** behind the adapter. It does not redesign
this pipeline.

---

## Sprint 7 phase checklist

| Phase | Result |
|-------|--------|
| 7B.1 Foundation | Done |
| 7B.2 Hardening | Done |
| 7C.1 Thin adapter | Done |
| 7C.2 Preparation metadata | Done |
| 7C.3 Briefing metadata | Done |
| 7C.4 Availability metadata | Done |
| 7C.5 Integration inspection | Done — no forced Brain migration |
| 7C.6 Presentation inspection | Done — no forced Brain migration |
| Final verification + docs | Done |
