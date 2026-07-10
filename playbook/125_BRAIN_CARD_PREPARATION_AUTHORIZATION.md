# 125 BRAIN CARD PREPARATION AUTHORIZATION

## Document Status

Status: Official architecture reference

Phase: Integration Sprint 6 complete (6f.2A correction, 6f.3A–6f.3J)

Depends on:

- 121 Brain Execution Pipeline
- 122 Brain Integration Plan
- 123 Brain Attention Planner
- 124 Brain Fatigue Engine
- `artifacts/api-server/src/brain/events/`
- `artifacts/api-server/src/brain/product/buildBrainEventActionHref.ts`

---

# 1. Problem Statement

Earlier product surfaces inferred calendar card eligibility on the frontend using rule-id allowlists and `sourceRuleId`-to-event mappings. That duplicated Brain policy, broke when rule and event identity diverged, and could attach card provenance without authoritative Brain authorization.

**Card preparation is a Brain decision**, not a frontend inference.

---

# 2. Core Identity Model

| Concept | Role | Example |
|---------|------|---------|
| `sourceRuleId` | Rule attribution, opportunity keys, fatigue, provenance | `birthday` |
| `targetEventId` | Stable catalog event identity for preparation facts | `birthday` |
| `eventId` (routing) | Same as `targetEventId` from registry — **not** assumed equal to `sourceRuleId` | `valentines_day` vs category `holiday` |

`sourceRuleId` answers **which rule matched**. It does **not** authorize card preparation by itself.

`eventId` answers **which catalog event** the action concerns. Values may coincide today (`birthday` / `birthday`); the contract allows future rules to share one `targetEventId`.

---

# 3. EventPreparationContext

Built once in `buildDecisionContext()` via `buildEventPreparationContext()`.

```text
DecisionContext.eventPreparation.byEventId[eventId] → EventPreparationFacts
```

Each fact bundle includes:

- `withinPreparationWindow`
- `briefingComplete`
- `cardCycleStatus` (normalized: `none`, `in_progress`, `ready_for_approval`, `approved`, `mailed`, `terminal`)
- `cycleYear`, `briefingEventLabel`

Ineligible events (missing date, non-romantic Valentine's) are **omitted** from `byEventId`.

---

# 4. Ownership Boundaries

| Concern | Owner | Rules must not |
|---------|-------|----------------|
| Briefing completion | `services/event-briefing/` | Inspect raw briefing storage |
| Card cycle status | `services/event-cards/` | Inspect card rows or DB status strings |
| Event timing / eligibility | Event catalog + preparation builder | Duplicate relationship constraints already handled by projection |

---

# 5. Calendar Rule Transition

Rules read `context.eventPreparation.byEventId[targetEventId]` only.

```text
IF no facts                         → no match
ELSE IF !withinPreparationWindow    → no match
ELSE IF !briefingComplete           → ask_question
ELSE IF cardCycleStatus === "none"  → prepare_card
ELSE                                → no match (blocking card status)
```

**One outcome per evaluation.** No simultaneous question and card opportunity from one rule.

**`in_progress` policy:** `prepare_card` is blocked (no safe resume for all draft states). Only `none` permits preparation.

---

# 6. Action Planner Routing

Pure mapping: `mapDecisionToPlan(sourceRuleId, outcome)` → category + type.

Enrichment: `enrichActionPlanRouting(plan, outcome)` → optional `ActionPlan.routing`.

| Outcome | Experience | Provenance in routing |
|---------|------------|------------------------|
| Calendar `ask_question` | `event_briefing` | No |
| Calendar `prepare_card` | `card_preparation_briefing` | No (URLs add provenance later) |
| Catalog follow-up `ask_question` | `catalog_follow_up_question` | No |

Action Planner **must not** construct URLs or query parameters.

---

# 7. Server-Owned URL Construction

Product layer: `buildBrainEventActionHref()` / `resolveProductBrainActionHref()`.

| Experience | URL | `brainSourceRuleId` query |
|------------|-----|---------------------------|
| `event_briefing` | `/briefings/{recipientId}/{encodedLabel}` | **Never** |
| `card_preparation_briefing` | Same path | **Yes** (encoded `sourceRuleId`) |

Missing `eventId` or `briefingEventLabel` → `null` → fallback `/relationship/{recipientId}`.

Product builders **must not** infer event identity from `sourceRuleId`.

---

# 8. Provenance

Only `card_preparation_briefing` product URLs carry `brainSourceRuleId`.

```text
prepare_card opportunity
  → server href with brainSourceRuleId
  → briefing page (consume-once from query)
  → first personal card POST (top-level brainSourceRuleId)
  → write-once DB column brain_source_rule_id
  → card outcome producer
```

- Manual card creation: no provenance
- Event briefing collection (`event_briefing`): no provenance
- Frontend: read, consume once, strip query param before navigation continues
- Backend: validate rule id, reject `wait`, write-once on insert

---

# 9. Attention Activation

`prepare_card` is an included Brain outcome in `shouldIncludeOpportunity()` alongside `ask_question`, `recommend_action`, and `show_dashboard_insight`.

Pipeline:

```text
collectProductBrainDecisions
  → buildGlobalOpportunityPool
  → planAttentionOrder (inclusion + rank)
  → orchestrateProductBrainFatigue
  → product builders (cap + authoritative URL)
  → passive frontend links
```

Ranking logic unchanged. Product caps unchanged.

---

# 10. Shared Fatigue Key

```text
opportunityKey = recipientId:sourceRuleId
```

Outcome and event stage **do not** enter the key.

Calendar `ask_question` and `prepare_card` share the same key. The existing `recently_surfaced` cooldown applies across the transition: a recently surfaced briefing-collection opportunity can suppress a later `prepare_card` for the same rule until cooldown expires.

No stage-specific fatigue exceptions.

---

# 11. Product Surfaces

| Surface | Link field | Calendar `ask_question` | Calendar `prepare_card` |
|---------|------------|----------------------------|-------------------------|
| Dashboard | `profileHref` | Briefing URL, no provenance | Briefing URL + provenance |
| Notifications | `href` | Same | Same |
| Concierge | `href` | Same | Same |

Action labels:

- `event_briefing`: **Add … details**
- `card_preparation_briefing`: **Prepare for …**

No new public DTO fields. Routing lives on internal `ProductBrainActionPlan` only.

---

# 12. Frontend Passive Boundary

Frontend may:

- Render server-provided `href` / `profileHref` unchanged
- Read and consume `brainSourceRuleId` from briefing query
- Pass provenance on the **first** card create POST only

Frontend must **not**:

- Maintain calendar rule allowlists for card eligibility
- Map `sourceRuleId` → event label for routing
- Implement Brain decision policy or relationship intelligence

---

# 13. End-to-End Pipeline

```text
RelationshipContext
  → DecisionContext.eventPreparation
  → Calendar Event Rule (ask_question | prepare_card | no match)
  → Action Planner (type + routing experience)
  → Brain Attention Planner
  → Fatigue Engine (filter only)
  → Product Builder authoritative URL
  → Passive frontend
  → First card POST with write-once provenance
  → Card outcome producer
```

Invariant: `decision.outcome === actionPlan.type` for `prepare_card`.

---

# 14. Deferred Items

Not in scope for Sprint 6 card preparation activation:

- Resume support for all `in_progress` card states
- Briefing skip / dismissal semantics
- Stage-sensitive fatigue policy
- Automatic briefing bypass when server briefing already complete
- Additional event catalog entries beyond birthday, anniversary, Valentine's Day
- Multiple rules targeting one catalog event
- Token service, link tables, BrainExecutionId transport

---

# 15. Module Map

| Module | Path |
|--------|------|
| Event catalog | `brain/events/brainEventCatalog.ts` |
| Rule → event registry | `brain/events/ruleEventTargeting.ts` |
| Preparation builder | `brain/events/buildEventPreparationContext.ts` |
| Calendar rule evaluator | `brain/decision/rules/calendarEventRuleEvaluation.ts` |
| Action routing enrichment | `brain/action/enrichActionPlanRouting.ts` |
| URL builder | `brain/product/buildBrainEventActionHref.ts` |
| Attention inclusion | `brain/attention/shouldIncludeOpportunity.ts` |
| Opportunity key | `brain/attention/buildOpportunityKey.ts` |
| Provenance validation | `brain/cards/validateBrainSourceRuleId.ts` |
| Frontend transport | `fi-forgot/src/app/brain-cards/brainCardProvenance.ts` |

---

# 16. Guard Tests

- `artifacts/api-server/src/__tests__/brain-card-preparation-architecture.test.ts`
- `artifacts/api-server/src/__tests__/brain-attention-architecture.test.ts`
- `artifacts/api-server/src/__tests__/prepare-card-activation.test.ts`
- `artifacts/fi-forgot/src/__tests__/brain-card-provenance-transport.test.ts`

---

# 17. Related Playbooks

- 123 Brain Attention Planner — global ordering
- 124 Brain Fatigue Engine — exposure and cooldown
- 122 Brain Integration Plan — sprint tracker
