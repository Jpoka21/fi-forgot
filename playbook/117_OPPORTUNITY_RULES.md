# 117_OPPORTUNITY_RULES.md

# F.I. Forgot

# Brain Opportunity Rules

---

## 1. Purpose of This Document

This document is the **canonical reference for Brain Opportunity Rule behavior**.

It records what each implemented rule does, when it fires, what facts it reads, and what decision it produces. It is the product-facing companion to the architectural rule framework.

**This document defines behavior. It does not define engine architecture.**

Use this document when you need to answer:

- Why did the Brain recommend this opportunity?
- Which rule should own a new recommendation?
- What priority should a new rule use?
- What facts must exist in `DecisionContext` before a rule can fire?

**Relationship to other documents**

| Document | Role |
|----------|------|
| `114_DECISION_RULE_FRAMEWORK.md` | How every rule must be built |
| `116_RULE_ENGINE_ARCHITECTURE.md` | How rules are evaluated and resolved |
| `115_RELATIONSHIP_INTELLIGENCE_IMPLEMENTATION_TRACKER.md` | What has been committed |
| `117_OPPORTUNITY_RULES.md` | What each opportunity rule actually does |

Rules operate only on `DecisionContext`. They never read `RelationshipContext`, the database, or AI output directly.

---

## 2. Rule Ordering Principles

Opportunity rules compete through **explicit priority**. Higher priority wins when multiple rules match.

### Resolution order

1. **Priority** — highest number wins
2. **Confidence** — tie-break when priorities are equal
3. **`ruleId`** — lexicographic tie-break when priority and confidence are equal

### Design principles

| Principle | Meaning |
|-----------|---------|
| Calendar events beat maintenance | Time-bound preparation windows outrank ongoing relationship upkeep |
| Recovery beats enrichment | Inactivity and stale information outrank optional opportunities |
| Channel gaps beat profile depth | Card-channel quiet and memory gaps are distinct responsibilities |
| Timely moments beat generic wait | Recent accomplishments deserve follow-up before the fallback rule |
| Wait always matches | `wait` is the deterministic fallback at priority `0` |
| One winner | The engine returns exactly one `DecideResult` |
| Facts only | Rules interpret `DecisionContext`; they do not fetch or mutate data |
| No overlap guards unless necessary | Do not duplicate another rule's match logic in guards when priority alone resolves the conflict correctly |

### Current registry order (highest priority first)

```
birthday (50)
anniversary (45)
valentines_day (42)
inactivity (41)
fresh_update (40)
card_gap (35)
memory_accumulation (34)
accomplishment_follow_up (33)
wait (0)
```

### Shared thresholds

| Constant | Value | Used by |
|----------|------:|---------|
| `RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS` | 180 | `inactivity`, `card_gap`, `memory_accumulation`, `accomplishment_follow_up` |
| `CARD_GAP_THRESHOLD_DAYS` | 120 | `card_gap`, `memory_accumulation` (overlap guard) |
| `ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS` | 30 | `accomplishment_follow_up` |

---

## Rule Lifecycle

Every Opportunity Rule follows the same lifecycle.

```
Signals
    ↓
DecisionContext
    ↓
Decision Rule
    ↓
Rule Engine
    ↓
Winning DecideResult
    ↓
Action Planner
    ↓
BrainResponse
```

Rules never:

- Query the database
- Read raw RelationshipContext
- Generate language
- Ask questions directly
- Modify state

Each rule's only responsibility is determining whether a factual opportunity exists.

---

## 3. Current Implemented Rules

---

### 50 — Birthday

**`ruleId`:** `birthday`

#### Purpose

Recommend birthday preparation while the recipient's birthday is inside the configured preview window.

#### Trigger

`birthdayDaysAway` is not null and `birthdayDaysAway <= preparationWindowDays`.

#### Priority

`50` | Confidence `60`

#### Inputs

| Fact | Role |
|------|------|
| `birthdayDaysAway` | Days until next birthday |
| `preparationWindowDays` | Preview window from delivery settings |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `birthday_preparation_window` |
| Action category | `birthday` |

#### Why It Exists

Birthdays are the highest-confidence calendar opportunity. The Brain should surface preparation early enough for a handwritten card to arrive on time.

#### Example

Birthday is 7 days away. Preview window is 14 days. Rule matches and wins over all lower-priority rules.

#### Future Considerations

- Leap-year and timezone edge cases remain factual inputs to `buildDecisionContext()`
- May later coordinate with card-send scheduling, not question wording

---

### 45 — Anniversary

**`ruleId`:** `anniversary`

#### Purpose

Recommend anniversary preparation while the relationship anniversary is inside the preview window.

#### Trigger

`anniversaryDaysAway` is not null and `anniversaryDaysAway <= preparationWindowDays`.

#### Priority

`45` | Confidence `60`

#### Inputs

| Fact | Role |
|------|------|
| `anniversaryDaysAway` | Days until next anniversary |
| `preparationWindowDays` | Preview window from delivery settings |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `anniversary_preparation_window` |
| Action category | `anniversary` |

#### Why It Exists

Anniversaries are time-sensitive and relationship-defining. They should be prepared before lower-priority maintenance opportunities.

#### Example

Anniversary is 10 days away inside a 14-day window. Rule matches even if information freshness is stale — calendar preparation wins.

#### Future Considerations

- Distinct from romantic Valentine's preparation
- Loses to birthday when both are in window (priority 50 > 45)

---

### 42 — Valentine's Day

**`ruleId`:** `valentines_day`

#### Purpose

Recommend Valentine's Day preparation for romantic relationships when the holiday is inside the preview window.

#### Trigger

All of the following:

- `relationshipType` is romantic
- `valentinesDaysAway` is not null
- `valentinesDaysAway <= preparationWindowDays`

#### Priority

`42` | Confidence `60`

#### Inputs

| Fact | Role |
|------|------|
| `relationshipType` | Romantic relationship check |
| `valentinesDaysAway` | Days until next Valentine's Day |
| `preparationWindowDays` | Preview window from delivery settings |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `valentines_preparation_window` |
| Action category | `holiday` |

#### Why It Exists

Valentine's Day is a distinct romantic calendar event. It should not be inferred from anniversary or birthday facts alone.

#### Example

`relationshipType` is `Wife`, Valentine's Day is 13 days away, preview window is 14. Rule matches.

#### Future Considerations

- Non-romantic relationships never match
- Other holidays may become separate rules rather than expanding this one

---

### 41 — Inactivity

**`ruleId`:** `inactivity`

#### Purpose

Recommend follow-up when the relationship timeline has gone quiet long enough to need re-engagement.

#### Trigger

`lastRelationshipActivityDaysAgo` is not null and `lastRelationshipActivityDaysAgo > 180`.

#### Priority

`41` | Confidence `48`

#### Inputs

| Fact | Role |
|------|------|
| `lastRelationshipActivityDaysAgo` | Days since most recent timeline event |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `relationship_inactive` |
| Action category | `follow_up` |

#### Why It Exists

Neglected relationships need recovery, not optional enrichment. This rule owns the "we have gone quiet" signal.

#### Example

Most recent timeline activity was 365 days ago. Rule matches and beats `fresh_update`, `card_gap`, and all opportunity rules below priority 41.

#### Future Considerations

- Distinct from stale conversational freshness (`fresh_update`)
- Does not inspect *what* the last activity was — only how long ago it occurred

---

### 40 — Fresh Update

**`ruleId`:** `fresh_update`

#### Purpose

Recommend a fresh update when conversational information has gone stale.

#### Trigger

`freshness === "stale"`.

#### Priority

`40` | Confidence `52`

#### Inputs

| Fact | Role |
|------|------|
| `freshness` | Normalized information freshness dimension |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `information_stale`, `fresh_update_due` |
| Action category | `fresh_update` |

#### Why It Exists

Card writing quality depends on current knowledge. When information is stale, refreshing context is more important than optional opportunities.

#### Example

No recent fresh updates or follow-ups; normalized freshness is `stale`. Rule matches and beats `card_gap` and all lower rules.

#### Future Considerations

- Does not distinguish which profile field is missing
- Question selection remains outside the rule (Action Planner / question engine)

---

### 35 — Card Gap

**`ruleId`:** `card_gap`

#### Purpose

Recommend a card opportunity when the card channel has gone quiet but the relationship is still active.

#### Trigger

All of the following:

- No calendar preparation window is active
- `lastCardActivityDaysAgo` is not null and `> 120`
- `lastRelationshipActivityDaysAgo` is not null and `<= 180`
- `freshness` is not `stale`
- `identity` is `developing` or `established`

#### Priority

`35` | Confidence `45`

#### Inputs

| Fact | Role |
|------|------|
| `birthdayDaysAway`, `anniversaryDaysAway`, `valentinesDaysAway`, `preparationWindowDays`, `relationshipType` | Calendar guard |
| `lastCardActivityDaysAgo` | Card channel recency |
| `lastRelationshipActivityDaysAgo` | Relationship still active |
| `freshness` | Not stale |
| `identity` | Mature enough for card recommendation |
| `writing` | Used only for no-match tracing when no card history exists |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `card_channel_quiet` |
| Action category | `card_opportunity` |

#### Why It Exists

An active relationship with no recent card activity is a concrete send opportunity — distinct from stale information or thin memory inventory.

#### Example

Last card was 150 days ago. Last timeline activity was 30 days ago. Identity is `established`. Freshness is `current`. Rule matches.

#### Future Considerations

- Requires prior card history; brand-new relationships with no cards do not match
- Beats `memory_accumulation` and `accomplishment_follow_up` on priority alone

---

### 34 — Memory Accumulation

**`ruleId`:** `memory_accumulation`

#### Purpose

Recommend gathering richer memories when inventory is thin enough that another meaningful memory would improve future card writing.

#### Trigger

All of the following:

- No calendar preparation window is active
- `freshness` is `current` or `aging`
- `lastRelationshipActivityDaysAgo` is not null and `<= 180`
- Card gap conditions are **not** met (inline overlap guard — card channel quiet defers to `card_gap`)
- `identity` is `developing` or `established`
- `momentum` is not `new`
- `history` is `light` or `moderate`

#### Priority

`34` | Confidence `44`

#### Inputs

| Fact | Role |
|------|------|
| `identity` | Relationship maturity |
| `history` | Timeline depth proxy for memory inventory |
| `writing` | Debug context only |
| `freshness` | Information still current enough for enrichment |
| `momentum` | Relationship no longer brand new |
| `lastRelationshipActivityDaysAgo` | Active relationship guard |
| `lastCardActivityDaysAgo` | Card gap overlap guard |
| Calendar facts | Preparation window guard |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `memory_inventory_thin` |
| Action category | `profile_information` |

#### Why It Exists

Some relationships are active and current but still lack enough depth for highly personal card writing. This rule encourages memory collection without overlapping card-gap or stale-information responsibilities.

#### Example

Identity is `developing`, history is `moderate`, freshness is `current`, last card was 30 days ago, last activity was 45 days ago. Rule matches.

#### Future Considerations

- Uses normalized `history` as inventory proxy — not raw answer text
- Beats `accomplishment_follow_up` on priority when both could match

---

### 33 — Accomplishment Follow Up

**`ruleId`:** `accomplishment_follow_up`

#### Purpose

Recommend follow-up when a recent accomplishment fresh update was captured and the moment is still timely.

#### Trigger

All of the following:

- No calendar preparation window is active
- `freshness` is `current` or `aging`
- `lastRelationshipActivityDaysAgo` is not null and `<= 180`
- `mostRecentFreshUpdateQuestionKey === "recent_accomplishment"`
- `mostRecentFreshUpdateDaysAgo` is not null and `<= 30`

#### Priority

`33` | Confidence `43`

#### Inputs

| Fact | Role |
|------|------|
| `mostRecentFreshUpdateQuestionKey` | Confirms the latest fresh update is an accomplishment |
| `mostRecentFreshUpdateDaysAgo` | Timeliness of the accomplishment signal |
| `freshness` | Not stale |
| `lastRelationshipActivityDaysAgo` | Active relationship guard |
| Calendar facts | Preparation window guard |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` |
| Reasons | `accomplishment_follow_up_due` |
| Action category | `follow_up` |

#### Why It Exists

A recently shared accomplishment is a short-lived conversational moment. Thoughtful follow-up belongs in the opportunity layer — not in stale-information refresh, inactivity recovery, or memory enrichment.

#### Example

User saved a `recent_accomplishment` fresh update 15 days ago. Freshness is `current`. Last card was sent 2 days ago (timeline head), but accomplishment recency is read from `mostRecentFreshUpdateDaysAgo`, so the rule still matches.

#### Future Considerations

- Owns accomplishment follow-up only — conversational milestone follow-up is a separate future rule
- Does not duplicate `memory_accumulation` or `card_gap` overlap guards; priority resolves those conflicts
- Other fresh-update keys (`current_excitement`, `current_challenge`, etc.) are out of scope

---

### 0 — Wait

**`ruleId`:** `wait`

#### Purpose

Deterministic fallback when no higher-priority opportunity applies.

#### Trigger

Always matches.

#### Priority

`0` | Confidence `0`

#### Inputs

None required. Accepts any `DecisionContext`.

#### Output

| Field | Value |
|-------|-------|
| Outcome | `wait` |
| Reasons | `read_only_scaffold`, `no_behavior_change` |
| Action category | `none` |

#### Why It Exists

The Brain must always resolve to a decision. Waiting is a valid, explicit outcome — the engine should not invent work.

#### Example

Freshness is `unknown`, no calendar events are in window, timeline is empty. Only `wait` matches among actionable rules; `wait` wins at priority 0 when nothing else matches.

#### Future Considerations

- Scaffold messaging may evolve as production activation proceeds
- Will remain the terminal fallback even as more opportunity rules are added

---

## 4. Deferred Rules

The following opportunity rules are **planned but not implemented**. They must follow the same `DecisionRule` contract when added.

### Relationship Health Recovery

**Intended responsibility:** Surface recovery opportunities when composite relationship health signals indicate decline — without duplicating inactivity or stale-freshness ownership.

**Why deferred:** Requires stable health signal normalization and clear boundaries with `inactivity` (41) and `fresh_update` (40).

**Likely priority band:** Between maintenance and enrichment (approximately 36–39).

---

### Momentum Recovery

**Intended responsibility:** Recommend re-engagement when relationship momentum has dropped but the timeline has not yet crossed inactivity thresholds.

**Why deferred:** Requires careful separation from `inactivity` (timeline dormancy) and `fresh_update` (information staleness). Momentum is a normalized dimension; the rule must remain fact-driven.

**Likely priority band:** Between `fresh_update` (40) and opportunity enrichment rules (mid-30s).

---

## Future Opportunity Rule Candidates

The following ideas are intentionally not prioritized yet.
They require additional production data before implementation.

Potential future rules include:

- Milestone Follow Up
- Current Challenge Follow Up
- Current Excitement Follow Up
- Relationship Reconnection
- Holiday Preparation Expansion
- Major Life Event Recognition
- Long Term Friendship Appreciation
- Family Check In
- Parent Support
- Empty Nest Transition
- Retirement Follow Up
- Bereavement Anniversary
- New Parent Support

Listing a candidate here does not approve implementation.
Each candidate must receive its own architecture review before entering the Rule Registry.

---

## 5. Rule Template for Future Rules

Use this template when proposing or documenting a new opportunity rule.

```markdown
### {priority} — {Rule Name}

**`ruleId`:** `{snake_case_id}`

#### Purpose

One sentence: what single question does this rule answer?

#### Trigger

Bullet list of factual match conditions on `DecisionContext`.

#### Priority

`{number}` | Confidence `{number}`

#### Inputs

| Fact | Role |
|------|------|
| `{fact}` | `{why the rule reads it}` |

#### Output

| Field | Value |
|-------|-------|
| Outcome | `ask_question` or `wait` |
| Reasons | `{reason_code}` |
| Action category | `{category}` |

#### Why It Exists

Product rationale — what user problem this rule solves.

#### Example

Concrete scenario with fact values that cause a match.

#### Future Considerations

Known overlaps, deferred facts, thresholds to tune, or rules it must not own.
```

### Checklist before adding a rule

- [ ] Answers exactly one responsibility question
- [ ] Reads only `DecisionContext` facts
- [ ] Priority is explicit and documented here
- [ ] Confidence is deterministic
- [ ] Every no-match path records trace reasons (when trace is provided)
- [ ] Action Planner mapping added
- [ ] Unit tests cover match, guards, and priority interactions
- [ ] New `DecisionContext` facts are justified as reusable factual events, not rule-specific classifications
- [ ] Overlap guards are omitted unless priority alone cannot resolve a correctness issue

---

## Document Status

| Attribute | Value |
|-----------|-------|
| Status | Active reference |
| Last updated | 2026-07-09 |
| Implemented rules | 9 |
| Registry location | `artifacts/api-server/src/brain/decision/rules/ruleRegistry.ts` |

This document should be updated whenever a rule is added, narrowed, re-prioritized, or removed.
