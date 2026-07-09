# 119 FOLLOW UP QUESTION ENGINE

## Document Status

| Attribute | Value |
|-----------|-------|
| Status | Implemented (Phases A–C) |
| Phase | Relationship Intelligence, Question Intelligence |
| Implementation | Phases A–C complete |
| Depends on | 114, 115, 116, 117, 118 |
| BrainResponse changed | No |
| Frontend / database / public APIs changed | No |

---

## Implementation Status

**Phases A through C are complete.** Phases D and E (BrainResponse integration and persistent question history) are not started.

| Phase | Status | Description |
|-------|--------|-------------|
| Phase A — Static Question Catalog | ✅ Complete | Typed catalog + `selectFollowUpQuestion()` |
| Phase B — Action Plan Integration | ✅ Complete | `selectQuestionForActionPlan()` on `BrainExecutionResult` |
| Phase C — Brain Inspector Visibility | ✅ Complete | `inspector.selectedFollowUpQuestion` (dev only) |
| Phase D — BrainResponse Integration | ⬜ Not started | Add selected question to production response surface |
| Phase E — Persistent Question History | ⬜ Not started | Rotation, cooldowns, asked/answered tracking |

### Module location

```text
artifacts/api-server/src/brain/questions/
├── questionTypes.ts
├── questionCatalog.ts
├── selectFollowUpQuestion.ts
├── ruleIdQuestionCategoryMapping.ts
├── selectedFollowUpQuestionTypes.ts
├── selectQuestionForActionPlan.ts
└── index.ts
```

### Unchanged surfaces

| Surface | Status |
|---------|--------|
| BrainResponse shape | Unchanged |
| Frontend | Unchanged |
| Database schema | Unchanged |
| Public APIs | Unchanged |
| Rule Engine behavior | Unchanged |
| Action Planner behavior | Unchanged |

### Not yet implemented

- Persistence or question history
- Rotation beyond first question per category
- Personalization or relationship-depth-aware selection
- AI-assisted selection

---

## 1. Purpose

The Follow Up Question Engine determines **what question should be asked next** when the Brain decides that an ask question opportunity exists.

The Rule Engine decides **whether** a follow up opportunity exists.

The Follow Up Question Engine decides **which question** best fits that opportunity.

It does not decide rule priority.

It does not create opportunities.

It does not generate card copy.

It does not modify relationship state.

It does not call AI.

---

## 2. Why This Exists

The Brain can now detect opportunities such as:

- Fresh Update
- Life Event Follow Up
- Accomplishment Follow Up
- Inactivity
- Card Gap
- Memory Accumulation

Many of these result in the same action type:

```text
ask_question

```

But the architecture now defines which question should be asked through the Follow Up Question Engine — without pushing wording into rules or the Action Planner.

Without a dedicated question engine, each rule would eventually need to know its own question text. That would create duplication, make rotation harder, and mix rule logic with conversation logic.

This document introduces a reusable layer:

```text
Opportunity detected
        ↓
Action Planner
        ↓
Follow Up Question Engine
        ↓
Selected question
        ↓
BrainResponse

```

---

## 3. Core Principle

Rules answer:

```text
Should we ask?

```

The Follow Up Question Engine answers:

```text
What should we ask?

```

The Writing Engine later answers:

```text
How should we write it?

```

These responsibilities must remain separate.

---

## 4. Placement In The Brain

Current pipeline (with question selection — internal only):

```text
RelationshipContext
        ↓
Signal Extraction
        ↓
NormalizedRelationshipState
        ↓
Life Event Intelligence
        ↓
DecisionContext
        ↓
Rule Engine
        ↓
Action Planner
        ↓
Follow Up Question Engine   ← selectQuestionForActionPlan()
        ↓
BrainExecutionResult.selectedFollowUpQuestion (internal)
        ↓
BrainResponse               ← shape unchanged; no selected question yet
```

Development pipeline additionally exposes selection in the Brain Inspector:

```text
executeBrain()
        ↓
BrainExecutionResult
        ├── toBrainResponse()     → production contract (unchanged)
        └── buildBrainInspector() → inspector.selectedFollowUpQuestion (dev only)
```

The Follow Up Question Engine runs **after** a winning rule has produced an action plan.

It consumes structured facts.

It does not read raw database rows.

---

## 5. Inputs

The Follow Up Question Engine may consume:

- `DecisionContext`
- Winning `DecideResult`
- `ActionPlan`
- Rule id
- Rule reasons
- Relationship state
- Existing structured relationship metadata
- Existing question history, when available

It may not consume:

- Raw database queries
- Free text parsing
- AI classification
- Frontend state
- BrainResponse text after generation

---

## 6. Output

The engine returns a structured `SelectedFollowUpQuestion` (or `null`).

Implemented shape (`selectedFollowUpQuestionTypes.ts`):

```typescript
SelectedFollowUpQuestion {
  questionId: string
  questionText: string
  category: FollowUpQuestionCategory
  sourceRuleId: string
  reason: string
  sensitivity: "low" | "medium" | "high"
  rotationKey: string
}
```

**Where it appears today:**

| Surface | Field | Visibility |
|---------|-------|------------|
| `BrainExecutionResult` | `selectedFollowUpQuestion` | Internal / dev execution only |
| `BrainInspector` | `selectedFollowUpQuestion` | Dev debug route only |
| `BrainResponse` | — | Not exposed (Phase D) |

This is not a Brain Signal.

This is a conversation selection object.

---

## 7. Question Catalog

**Status: ✅ Implemented** — static deterministic catalog in `questionCatalog.ts`.

### Supported categories

```text
life_event_follow_up
fresh_update_follow_up
accomplishment_follow_up
inactivity_reconnect
memory_collection
card_gap_context
```

### Catalog size (v1)

| Category | Questions |
|----------|----------:|
| `life_event_follow_up` | 4 |
| `fresh_update_follow_up` | 4 |
| `accomplishment_follow_up` | 4 |
| `inactivity_reconnect` | 4 |
| `memory_collection` | 3 |
| `card_gap_context` | 3 |
| **Total** | **22** |

Each `FollowUpQuestion` entry includes: `id`, `category`, `text`, `sensitivity`, `rotationOrder`. No AI fields, embeddings, or templates.

```text
How has everything been going with that family update lately?

How did everything turn out?

Is there anything new I should remember about what happened?

How are things going now that some time has passed?

```

Example accomplishment questions:

```text
How did that accomplishment turn out?

Did anything new happen after that?

Is there anything about that moment you would want reflected in a future card?

```

Example inactivity questions:

```text
Anything new going on with this person lately?

Has anything changed with them recently?

Is there something recent I should know before writing for them again?

```

---

## 8. Selection Rules

Question selection is deterministic.

### Implemented v1 flow

```text
ActionPlan.sourceRuleId
        ↓
ruleIdQuestionCategoryMapping
        ↓
selectFollowUpQuestion({ category })
        ↓
first question by rotationOrder
        ↓
SelectedFollowUpQuestion | null
```

### Rule id → question category mapping

| `sourceRuleId` | Question category |
|----------------|-------------------|
| `life_event_follow_up` | `life_event_follow_up` |
| `fresh_update` | `fresh_update_follow_up` |
| `accomplishment_follow_up` | `accomplishment_follow_up` |
| `inactivity` | `inactivity_reconnect` |
| `memory_accumulation` | `memory_collection` |
| `card_gap` | `card_gap_context` |

Calendar preparation rules (`birthday`, `anniversary`, `valentines_day`) and `wait` are unmapped.

### Entry points

| Function | Role |
|----------|------|
| `selectFollowUpQuestion({ category })` | Returns first catalog question for category |
| `selectQuestionForActionPlan({ decisionContext, decideResult, actionPlan })` | Maps action plan → selected question; returns `null` when `actionPlan.type !== "ask_question"`, rule unmapped, or category missing |

### Future selection inputs (not implemented)

Selection may eventually consider:

- Winning rule id
- Opportunity category
- Relationship depth
- Freshness
- Sensitivity
- Prior asked questions
- Recent answers
- Event type
- Event category
- Time since event
- Whether this is a reconnect or a deeper follow up

v1 does **not** yet use these inputs. It returns the first question per category only.

---

## 9. Rotation And Repetition

**Not implemented in v1.** The catalog defines `rotationOrder` for future use; selection always picks `rotationOrder: 1`.

Future question history should track:

```text
questionId
relationshipId
recipientId
askedAt
answeredAt
sourceRuleId
rotationKey

```

Until persistent history exists, v1 may use available relationship context only.

The engine should be designed so persistent history can be added later without changing rule behavior.

---

## 10. Sensitivity

Some follow ups require more care.

Low sensitivity:

- New hobby
- Recent accomplishment
- General family news
- Card gap

Medium sensitivity:

- Current challenge
- Inactivity
- Major life transition

High sensitivity:

- Surgery
- Death
- Illness
- Job loss
- Divorce
- Crisis

v1 should avoid high sensitivity categories unless structured capture explicitly supports them.

The engine must not infer sensitive events from free text.

---

## 11. Relationship Depth Awareness

Question tone should depend on relationship state.

Examples:

Established, rich relationship:

```text
How has everything been going since then?

```

Thin or new relationship:

```text
Anything new I should know about this person?

```

Stale relationship:

```text
Has anything changed with them recently?

```

This should use existing `NormalizedRelationshipState` and `DecisionContext`.

---

## 12. Rule Ownership Boundary

Decision Rules should not own question wording.

A rule may provide:

```text
sourceRuleId
reason
opportunity category
debug notes

```

The Follow Up Question Engine owns:

```text
question catalog
question selection
rotation
sensitivity
question id
question text

```

This prevents duplicated question logic across rules.

---

## 13. Action Planner Boundary

The Action Planner maps a winning decision into an action type.

Example:

```text
life_event_follow_up
        ↓
ask_question, follow_up

```

The Follow Up Question Engine refines that action.

Example:

```text
ask_question, follow_up
        ↓
How has everything been going with that family update lately?

```

The Action Planner should not contain question text.

---

## 14. BrainResponse Boundary

**BrainResponse shape remains unchanged.** The selected question is not part of the production contract.

`selectedFollowUpQuestion` is available only on:

- `BrainExecutionResult` (internal orchestrator output)
- `BrainInspector` (dev debug route: `GET /api/debug/brain/:recipientId`)

Possible future addition (Phase D):

```text
recommendedQuestion

```

or

```text
questionPrompt

```

That should be handled in a later implementation step.

---

## 15. Initial Supported Rules

**Implemented** — question selection for:

```text
fresh_update
life_event_follow_up
accomplishment_follow_up
inactivity
card_gap
memory_accumulation

```

Birthday, Anniversary, and Valentine rules may not need follow up questions in v1 because they are event preparation rules.

---

## 16. Deterministic First Version

**Status: ✅ Implemented (Phases A–C)**

No AI, embeddings, semantic scoring, personalization model, or free text parsing.

Implemented functions:

```typescript
selectFollowUpQuestion({ category }): FollowUpQuestion | null

selectQuestionForActionPlan({
  decisionContext,
  decideResult,
  actionPlan,
}): SelectedFollowUpQuestion | null
```

Returns `null` when the action is not `ask_question`, the source rule is unmapped, or the category has no catalog entries.

---

## 17. Testing Strategy

**Implemented tests** (`follow-up-question-catalog.test.ts`, `select-question-for-action-plan.test.ts`, `build-brain-inspector.test.ts`):

- Each category returns a question
- Unknown category returns null
- Each mapped `ask_question` rule selects correct category
- Non `ask_question` action returns null
- Unknown source rule returns null
- Deterministic repeatability
- Catalog integrity and unique ids
- `selectedFollowUpQuestion` in Brain Inspector (present and null cases)
- BrainResponse isolation unchanged

**Future tests** (when Phase E ships):

- No question for non ask question actions
- Correct question category by source rule id
- Life event follow up selects life event question
- Accomplishment follow up selects accomplishment question
- Inactivity selects reconnect question
- Card gap selects context gathering question
- Deterministic ordering
- Excludes recently asked question when history exists
- Does not read answer text
- Does not call AI
- Does not change Rule Engine output
- Does not change Action Planner output

---

## 18. Future Expansion

Future versions may support:

- Persistent question history
- Question cooldowns
- Relationship specific question memory
- User preferred tone
- More sensitive event categories
- Business relationship questions
- Holiday preparation questions
- Question templates with safe variables
- Admin editable question catalog
- AI assisted question drafting after deterministic selection

AI can be considered later only after deterministic selection exists.

---

## 19. Non Goals

This engine does not:

- Detect opportunities
- Rank rules
- Generate cards
- Classify life events
- Modify relationship state
- Ask questions directly
- Send messages
- Change frontend flow
- Change database schema in v1
- Replace the Rule Engine
- Replace the Action Planner

---

## 20. Recommended Implementation Phases

### Phase A: Static Question Catalog

**Status: ✅ Complete**

Typed question catalog (`FOLLOW_UP_QUESTION_CATALOG`) and `selectFollowUpQuestion()`. No pipeline integration.

### Phase B: Action Plan Integration

**Status: ✅ Complete**

`selectQuestionForActionPlan()` runs after Action Planner in `executeBrain()`. Result attached to `BrainExecutionResult.selectedFollowUpQuestion`. BrainResponse unchanged.

### Phase C: Brain Inspector Visibility

**Status: ✅ Complete**

`buildBrainInspector()` pass-through exposes `selectedFollowUpQuestion` on the dev inspector payload.

### Phase D: BrainResponse Integration

**Status: ⬜ Not started**

Add selected question to the production response surface when explicitly approved.

Frontend changes remain separate.

### Phase E: Persistent Question History

**Status: ⬜ Not started**

Track asked and answered questions to prevent repetition. Enable rotation beyond first question per category.

---

## 21. Architectural Summary

The Follow Up Question Engine is the next layer after opportunity detection.

It gives the Brain a reusable way to choose the right question without pushing wording into rules or action planning.

The clean responsibility split becomes:

```text
Signal Extraction: what facts exist
Life Event Intelligence: what structured events exist
DecisionContext: what facts rules may read
Rule Engine: whether an opportunity exists
Action Planner: what action type should happen
Follow Up Question Engine: what question should be asked
BrainResponse: what is returned

```

This keeps the Brain deterministic, explainable, reusable, and ready for richer relationship learning over time.