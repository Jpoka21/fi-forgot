# 112 — Brain Signal Taxonomy

---

## Purpose

This document defines the canonical signal taxonomy for the F.I. Forgot Relationship Intelligence Engine Brain.

Its purpose is to establish a shared vocabulary, naming convention, and maturity model for Brain signals before additional contributors are implemented. It describes what signals are, how they are classified, how they may eventually influence decisions and card writing, and which signals are planned for future contributors.

Unlike the Relationship Intelligence Framework (110), this document does not define product philosophy.

Unlike the Architectural Audit (111), this document does not evaluate the current codebase.

Unlike the Implementation Tracker, this document does not record commit progress.

Its responsibility is signal architecture.

Implementation of new contributors must reference this document together with 110 and 111.

---

## Current Brain Status

As of Phase 1 Commit 9, the Brain pipeline is:

```text
loadRelationshipContext()
        ↓
extractSignals()
        ↓
decide()
        ↓
BrainResponse
```

### Implemented components

| Component | Location | Status |
|-----------|----------|--------|
| Context loader | `brain/context/loadRelationshipContext.ts` | Active — wraps `assembleRecipientContext()` |
| Signal aggregator | `brain/signals/extractSignals.ts` | Active — aggregates contributor outputs |
| Signal contributors | `brain/signals/contributors/` | Active — modular, registry-based |
| Decision engine | `brain/decision/decide.ts` | Scaffold — always returns `wait` |
| Orchestrator | `brain/orchestrator.ts` | Active — connects all layers |
| Public entry | `brain/index.ts` | Active — exports `runBrain()` and types |
| Debug consumer | `brain/debug/brainDebugRoute.ts` | Dev-only — `GET /api/debug/brain/:recipientId` |

### Current BrainSignal type

The Brain intentionally uses a simple signal contract:

```typescript
interface BrainSignal {
  source: string;
  label: string;
  value: unknown;
}
```

This shape is sufficient for Phase 1. Contributors emit signals. The aggregator collects them. The decision engine will consume them in a later phase. No signal type hierarchy exists yet in code.

### Current decision behavior (frozen)

| Field | Value |
|-------|-------|
| `decision.outcome` | `"wait"` |
| `confidence` | `0` |
| `reasons` | `["read_only_scaffold", "no_behavior_change"]` |
| `debugNotes` | `["Phase 1 read-only scaffold — decision engine not yet active"]` |

Signals are produced but not consumed by `decide()`.

---

## Why Signal Taxonomy Matters

Without a canonical taxonomy, signal contributors will diverge in naming, granularity, and interpretation. Different engineers will emit overlapping signals under different sources. The decision engine will receive inconsistent inputs. Card generation will assemble context independently of the Brain.

A shared taxonomy prevents:

• Duplicate signals describing the same fact

• Derived interpretations masquerading as raw facts

• Threshold logic leaking into contributors before the decision engine is ready

• Card writing logic diverging from Brain understanding

• Frontend orchestration re-deriving facts the Brain already knows

The taxonomy establishes rules before scale, not after cleanup.

---

## Signal Maturity Levels

Every signal belongs to one maturity level. Contributors must declare which level they emit. Phase 1 contributors emit **Level 1 only**.

### Level 1 — Raw Fact

A direct passthrough of data already present in `RelationshipContext` or `RelationshipContextLoadResult`.

• No computation beyond null-coalescing

• No thresholds

• No recommendations

• No interpretation

**Example:** `event_timing.birthday` → `"03-15"`

### Level 2 — Derived Signal

A computed value derived from loaded context without external reads. Still read-only. No decision authority.

• May compute counts, recency, or next-occurrence timing

• Must document the derivation rule in the contributor

• Must not produce recommendations or action labels

**Example:** `event_timing.days_until_birthday` → `42`

### Level 3 — Decision Signal

A signal intended to influence `decide()`. Produced only when the decision engine is authorized to consume signals.

• May encode priority, urgency, or suppression

• Must pass through safety boundaries before influencing outcomes

• Must not directly communicate with the user

**Example:** `opportunity.suggested_action` → `"ask_fresh_update"` (future, not authorized)

### Level 4 — Writing Signal

A signal intended to influence card generation prompts. Produced only when card generation is authorized to consume Brain output.

• May encode tone guardrails, topic inclusion, or topic avoidance

• Must not replace the existing card generation pipeline

• Must be consumed through a stable Brain interface, not ad hoc prompt assembly

**Example:** `writing.avoid_topics` → `["recent job loss"]` (future, not authorized)

---

## Signal Categories

Each signal `source` field maps to exactly one category. A category may contain many labels.

| Category | `source` prefix | Description |
|----------|-----------------|-------------|
| Relationship Profile | `profile_completeness` | Profile field coverage and completeness |
| Calendar and Events | `event_timing` | Stored dates and event scheduling facts |
| Memory Freshness | `memory_freshness` | Recency of life updates and shared memories |
| Card History | `card_history` | Past card activity and communication patterns |
| Follow Up and Questions | `follow_up` | Scheduled and answered follow-up conversations |
| Delivery and Automation | `delivery` | Delivery preferences and preview lead times |
| Relationship Health | `relationship_health` | Composite health indicators |
| Engagement | `engagement` | User interaction with relationship features |
| Opportunity | `opportunity` | Detected moments for thoughtful action |
| Risk | `risk` | Trust boundaries and sensitive topic guardrails |
| Business Relationships | `business_relationship` | Business-specific relationship context |

---

## Signal Naming Convention

### Structure

```text
{source}.{label}
```

• `source` — snake_case category identifier. Matches the contributor domain.

• `label` — snake_case fact name within the category. Must be stable across commits.

• `value` — the payload. Type depends on the label. Document expected types per label.

### Rules

1. Sources are nouns, not verbs. Use `event_timing`, not `compute_events`.

2. Labels are fact names, not instructions. Use `missing_fields`, not `should_ask_profile_questions`.

3. Never embed recommendations in labels. Use `days_since_last_update`, not `needs_fresh_update`.

4. Never embed thresholds in label names. Use `score`, not `low_score` or `critical_score`.

5. One fact per signal. Do not bundle unrelated values into a single signal unless they are an inseparable struct already present in context.

6. Emit `null` rather than omitting a signal when the underlying data is absent.

7. Contributor function names use the pattern `contribute{Domain}Signals`.

8. Contributor file names use the pattern `{domain}Contributor.ts`.

---

## Raw Facts vs Derived Signals

### Raw Facts (Level 1)

Raw facts mirror fields already assembled by `loadRelationshipContext()`. The contributor reads context and passthroughs values.

| Property | Rule |
|----------|------|
| Data origin | `RelationshipContext` or `RelationshipContextLoadResult` |
| Computation | None beyond `?? null` |
| Database reads | None — context is pre-loaded |
| Decision influence | None in Phase 1 |
| Card writing influence | None in Phase 1 |

### Derived Signals (Level 2)

Derived signals compute new values from loaded context. They do not read additional data.

| Property | Rule |
|----------|------|
| Data origin | Computed from one or more context fields |
| Computation | Permitted — counts, date math, sorting |
| Database reads | None |
| Decision influence | None until explicitly authorized |
| Card writing influence | None until explicitly authorized |

### Decision Signals (Level 3)

Decision signals exist to inform `decide()`. They are not implemented in Phase 1.

| Property | Rule |
|----------|------|
| Producer | Decision engine or authorized preprocessor |
| Consumer | `decide()` only |
| User visibility | Indirect — through a single Brain outcome |
| Authority | Brain orchestrator — not contributors independently |

### Writing Signals (Level 4)

Writing signals exist to inform card generation. They are not implemented in Phase 1.

| Property | Rule |
|----------|------|
| Producer | Brain orchestrator or authorized writing contributor |
| Consumer | Card generation prompt assembly |
| User visibility | Through generated card content |
| Authority | Must pass through trust and risk boundaries |

---

## Decision Influence Rules

Phase 1 decision behavior is frozen. These rules govern future phases.

1. Only `decide()` may produce a `BrainDecisionOutcome`.

2. Contributors emit signals. They do not emit decisions.

3. Signals must not be passed to `decide()` until an explicitly approved commit authorizes it.

4. When authorized, `decide()` receives `availableSignals` as input alongside `RelationshipContextLoadResult`.

5. Exactly one outcome per decision cycle: `wait`, `do_nothing`, `ask_question`, `prepare_card`, `recommend_action`, or `show_dashboard_insight`.

6. Multiple signals may support one outcome. No signal may independently produce a user-facing action.

7. Suppression signals (from Risk category) may veto an outcome but may not create one.

8. Decision signals must not duplicate production route logic from `v2-recipients`, `v2-recipient-health`, or frontend Concierge engines. The Brain becomes the authority; it does not mirror competing logic indefinitely.

---

## Card Writing Influence Rules

Phase 1 does not authorize card writing changes. These rules govern future phases.

1. Card generation continues to use `assembleRecipientContext()` and `buildContextSupplement()` until explicitly migrated.

2. Writing signals must not be consumed by card generation until an explicitly approved commit authorizes it.

3. When authorized, card generation receives writing signals from the Brain — not independent context assembly.

4. Writing signals inform prompts. They do not generate card text directly.

5. `things_to_avoid` and trust boundaries are Risk-category inputs, not Writing-category overrides.

6. Writing signals must be consistent with decision outcomes. The Brain must not recommend silence in decision and urgency in writing.

---

## Confidence Model

Phase 1 confidence is always `0`. The confidence model is declared here for future use.

### Principles

• Confidence reflects decision certainty, not relationship strength.

• Confidence is produced by `decide()`, not by contributors.

• Contributors supply facts. The decision engine weighs them.

• Low confidence should prefer `wait` or `do_nothing` over action.

### Future scale (not implemented)

| Range | Meaning |
|-------|---------|
| 0 | Scaffold / no decision authority |
| 1–30 | Insufficient signal coverage — prefer silence |
| 31–60 | Partial understanding — cautious action only |
| 61–85 | Adequate understanding — standard action |
| 86–100 | High certainty — rare, requires broad signal agreement |

### Confidence inputs (future)

• Signal count and category coverage

• Agreement between independent signal categories

• Presence of risk suppression signals

• Profile completeness and memory freshness

• Absence of conflicting signals

No confidence computation is authorized in Phase 1.

---

## Safety Boundaries

Every signal and every future decision must respect these boundaries.

### Trust and privacy

• `things_to_avoid` and sensitive topic data are Risk-category inputs.

• Signals must not expose raw answers in debug output beyond what the context already contains.

• Business relationship data must not leak into personal relationship signals without category separation.

### No competing intelligence

• Contributors must not call external services, AI models, or production routes.

• Contributors must not read the database beyond what `loadRelationshipContext()` already loaded.

• Contributors must not emit user-facing recommendation strings.

### No threshold leakage

• Thresholds belong in the decision engine, not in contributors.

• Contributors may emit raw counts and dates. The decision engine applies thresholds.

• Exception: values already thresholded in context assembly (e.g. `freshUpdates[].ageCategory`) may be passed through as raw facts since they are pre-computed upstream.

### Production isolation

• The Brain debug route is dev-only.

• `runBrain()` is not called by production routes in Phase 1.

• Signal emission does not change any production API contract.

---

## Initial Implemented Signals

Phase 1 Commit 8–9. All Level 1 raw facts.

### profile_completeness (Relationship Profile)

| Label | Value type | Origin |
|-------|------------|--------|
| `score` | `number` | `relationshipContext.profileCompleteness.score` |
| `filled_fields` | `string[]` | `relationshipContext.profileCompleteness.filled` |
| `missing_fields` | `string[]` | `relationshipContext.profileCompleteness.missing` |

Contributor: `profileCompletenessContributor.ts`

### event_timing (Calendar and Events)

| Label | Value type | Origin |
|-------|------------|--------|
| `birthday` | `string \| null` | `relationshipContext.relationship?.birthday` |
| `anniversary` | `string \| null` | `relationshipContext.relationship?.anniversary` |
| `most_recent_card_event_type` | `string \| null` | `relationshipContext.cardHistory.mostRecentCard?.eventType` |
| `most_recent_card_event_date` | `string \| null` | `relationshipContext.cardHistory.mostRecentCard?.eventDate` |

Contributor: `eventTimingContributor.ts`

**Total implemented signals: 7**

---

## Future Signal Catalog

The following signals are planned. None are authorized for implementation by this document alone. Each requires an explicitly approved commit.

### Relationship Profile (`profile_completeness`)

| Label | Level | Description |
|-------|-------|-------------|
| `filled_count` | 2 | `filled_fields.length` |
| `missing_count` | 2 | `missing_fields.length` |
| `has_things_to_avoid` | 1 | Whether avoidance preferences are recorded |

### Calendar and Events (`event_timing`)

| Label | Level | Description |
|-------|-------|-------------|
| `days_until_birthday` | 2 | Days until next birthday occurrence |
| `days_until_anniversary` | 2 | Days until next anniversary occurrence |
| `next_event_label` | 2 | Label of the nearest upcoming event |
| `next_event_days_away` | 2 | Days until nearest upcoming event |

### Memory Freshness (`memory_freshness`)

| Label | Level | Description |
|-------|-------|-------------|
| `fresh_update_count` | 1 | `freshUpdates.length` |
| `most_recent_update_days_ago` | 1 | `freshUpdates[0]?.daysAgo ?? null` |
| `most_recent_update_age_category` | 1 | `freshUpdates[0]?.ageCategory ?? null` |
| `follow_up_answer_count` | 1 | `followUpAnswers.length` |
| `most_recent_follow_up_days_ago` | 1 | `followUpAnswers[0]?.daysAgo ?? null` |

### Card History (`card_history`)

| Label | Level | Description |
|-------|-------|-------------|
| `total_sent` | 1 | `cardHistory.totalSent` |
| `approved_count` | 1 | `cardHistory.approvedCount` |
| `rejected_count` | 1 | `cardHistory.rejectedCount` |
| `edited_count` | 1 | `cardHistory.editedCount` |
| `event_types` | 1 | `cardHistory.eventTypes` |
| `days_since_most_recent_card` | 2 | Computed from `mostRecentCard.eventDate` |

### Follow Up and Questions (`follow_up`)

| Label | Level | Description |
|-------|-------|-------------|
| `pending_follow_up_count` | 2 | Requires follow-up scheduling data in context |
| `has_overdue_follow_up` | 2 | Pending follow-up past due window |
| `profile_gap_question_available` | 2 | Whether question engine would suggest a profile gap question |

Note: Follow-up scheduling state for pending (unanswered) follow-ups is not yet in `RelationshipContext`. A context extension or read within `loadRelationshipContext()` may be required before these signals can be Level 1.

### Delivery and Automation (`delivery`)

| Label | Level | Description |
|-------|-------|-------------|
| `preview_days` | 1 | `delivery.previewDays` |
| `delivery_preference` | 1 | `delivery.preference` |
| `sender_nickname` | 1 | `delivery.senderNickname` |
| `sign_off` | 1 | `delivery.signOff` |

### Relationship Health (`relationship_health`)

| Label | Level | Description |
|-------|-------|-------------|
| `health_score` | 2 | Composite score — migrate from `v2-recipient-health` logic |
| `health_status` | 2 | Excellent / Healthy / NeedsAttention / Priority |
| `profile_score_component` | 2 | Profile dimension score |
| `fresh_update_score_component` | 2 | Fresh update dimension score |

Note: Health scoring is currently inline in `v2-recipient-health.ts`. Migration into a contributor requires careful deduplication, not copy-paste of recommendation strings.

### Engagement (`engagement`)

| Label | Level | Description |
|-------|-------|-------------|
| `briefing_answer_count` | 1 | `briefingSummary.totalAnswers` |
| `last_interaction_days_ago` | 2 | Most recent activity across questions, updates, and cards |
| `profile_questions_answered` | 2 | Count of profile-gap answers in briefing history |

### Opportunity (`opportunity`)

| Label | Level | Description |
|-------|-------|-------------|
| `spontaneous_gesture_candidate` | 3 | Detected non-calendar opportunity |
| `life_event_detected` | 3 | Fresh update suggests a life event worth acknowledging |
| `gesture_timing_window` | 3 | Optimal window for a thoughtful gesture |

Note: Opportunity signals are Level 3. They must not be implemented until the decision engine is authorized to consume signals.

### Risk (`risk`)

| Label | Level | Description |
|-------|-------|-------------|
| `things_to_avoid` | 1 | `tone.thingsToAvoid` |
| `things_to_always_include` | 1 | `tone.thingsToAlwaysInclude` |
| `emotional_openness` | 1 | `tone.emotionalOpenness` |
| `sensitive_topic_detected` | 3 | Derived from fresh updates or follow-up content |

### Business Relationships (`business_relationship`)

| Label | Level | Description |
|-------|-------|-------------|
| `relationship_type` | 1 | `relationship.type` |
| `is_professional` | 2 | Derived from relationship type classification |
| `client_anniversary` | 1 | Business client anniversary date |

Note: Business relationship signals apply only to business recipients. Personal and business signals must not mix within a single contributor.

---

## Contributor Implementation Order

The following sequence is recommended. Each step requires an explicitly approved commit. This document does not authorize any of them.

### Phase 1 continuation (read-only contributors, Level 1)

| Order | Contributor | Category | Signals |
|-------|-------------|----------|---------|
| 10 | `freshUpdateRecencyContributor` | Memory Freshness | `fresh_update_count`, `most_recent_update_days_ago`, `most_recent_update_age_category` |
| 11 | `cardHistoryContributor` | Card History | `total_sent`, `approved_count`, `rejected_count`, `edited_count`, `event_types` |
| 12 | `followUpContributor` | Follow Up and Questions | `follow_up_answer_count`, `most_recent_follow_up_days_ago` |
| 13 | `deliveryPreferencesContributor` | Delivery and Automation | `preview_days`, `delivery_preference` |

### Phase 1 completion (read-only audit)

| Order | Work | Description |
|-------|------|-------------|
| 14 | Signal quality audit | Verify all Level 1 signals match context passthrough; no thresholds; no decision influence |
| 15 | `relationshipHealthContributor` | Level 2 — requires deduplication strategy with `v2-recipient-health` |

### Phase 2 entry (decision engine begins consuming signals)

| Order | Work | Description |
|-------|------|-------------|
| 16 | Decision engine accepts signals | `decide()` signature changes to receive `availableSignals`; still returns `wait` |
| 17 | First debug-only decision experiments | Dev route or debug flag tests non-`wait` outcomes without production exposure |

### Phase 2 continuation (not authorized by this document)

| Order | Work | Description |
|-------|------|-------------|
| 18 | Level 2 derived signals | `days_until_birthday`, `days_until_anniversary`, `next_event_days_away` |
| 19 | Level 3 opportunity signals | Requires decision authority |
| 20 | Level 4 writing signals | Requires card generation migration |
| 21 | Production route migration | `v2-recipients`, Concierge, dashboard consume Brain |

---

## What This Document Does Not Authorize

This document is taxonomy and architecture only. It does not permit implementation changes.

### Explicitly not authorized

• Production behavior changes of any kind

• AI decisions or AI signal generation

• Card generation changes

• Frontend changes

• Database schema changes

• Debug route changes

• Passing signals into `decide()`

• Non-`wait` decision outcomes in any environment accessible to users

• Threshold logic in contributors

• Recommendation strings in signal values or labels

• New database reads from contributors

• New production API endpoints

• Removal or modification of existing production routes

• Confidence computation

• Level 3 or Level 4 signals

### Decision freeze

Decisions remain frozen until a later explicitly approved commit.

Current required behavior:

```text
decision.outcome = "wait"
confidence = 0
reasons = ["read_only_scaffold", "no_behavior_change"]
debugNotes = ["Phase 1 read-only scaffold — decision engine not yet active"]
```

No commit should alter this output unless it is explicitly approved as a decision engine activation commit.

---

## Relationship to Other Playbook Documents

| Document | Role |
|----------|------|
| 110 — Relationship Intelligence Framework | Destination — what F.I. Forgot should become |
| 111 — Architectural Audit | Current state — what exists and migration strategy |
| 112 — Brain Signal Taxonomy (this document) | Signal vocabulary — how Brain contributors communicate |
| Implementation Tracker | Progress — what has been committed |

Implementation should reference 110, 111, and 112 together before adding contributors or activating the decision engine.

---

## Definition of Success

This document succeeds when:

• Every new contributor maps to a defined category and maturity level.

• Signal naming is consistent across contributors.

• Raw facts, derived signals, decision signals, and writing signals are not conflated.

• Engineers can add a contributor without inventing naming conventions.

• The decision engine can be activated in a future commit with a clear signal vocabulary already in place.

• Production behavior remains unchanged until explicitly authorized.

---

## Document Status

| Property | Value |
|----------|-------|
| Created | Phase 1, post-Commit 9 |
| Implemented signals documented | 7 |
| Authorized implementations | None — taxonomy only |
| Decision authority | Frozen |

This document serves as the signal architecture baseline for all future Brain contributor implementation.
