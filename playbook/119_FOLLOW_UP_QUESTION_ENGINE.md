# 119 FOLLOW UP QUESTION ENGINE

## Document Status

Status: Architecture proposal  
Phase: Relationship Intelligence, Question Intelligence  
Implementation: Not started  
Depends on: 114, 115, 116, 117, 118

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

But the current architecture does not yet define which question should be asked.

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

Current pipeline:

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
BrainResponse

```

Future pipeline with question selection:

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
Follow Up Question Engine
        ↓
BrainResponse

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

The engine returns a structured selected question.

Conceptual shape:

```text
SelectedFollowUpQuestion {
  questionId: string
  questionText: string
  category: string
  sourceRuleId: string
  reason: string
  sensitivity: "low" | "medium" | "high"
  rotationKey: string
}

```

This is not a Decision Rule result.

This is not a Brain Signal.

This is a conversation selection object.

---

## 7. Question Catalog

Questions should live in a deterministic catalog.

Example categories:

```text
life_event_follow_up
fresh_update_follow_up
accomplishment_follow_up
inactivity_reconnect
memory_collection
card_gap_context

```

Example life event questions:

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

Question selection should be deterministic.

Selection should consider:

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

The first version can be simple:

```text
sourceRuleId
        ↓
question category
        ↓
candidate questions
        ↓
exclude recently asked
        ↓
choose first deterministic match

```

---

## 9. Rotation And Repetition

The engine must avoid repeatedly asking the same question.

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

BrainResponse may eventually include the selected question.

However, BrainResponse shape should not change until the engine is implemented and reviewed.

Possible future addition:

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

v1 should support question selection for:

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

The first implementation should be intentionally simple.

No AI.

No embeddings.

No semantic scoring.

No personalization model.

No free text parsing.

The engine should be pure and testable.

Initial conceptual function:

```text
selectFollowUpQuestion({
  decisionContext,
  decideResult,
  actionPlan
}): SelectedFollowUpQuestion | null

```

Returns `null` when the action is not an ask question action.

---

## 17. Testing Strategy

Tests should verify:

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

### Phase 1: Static Question Catalog

Create typed question catalog and selection function.

No integration.

### Phase 2: Action Plan Integration

Run question selection after Action Planner for ask question actions.

Keep BrainResponse unchanged unless explicitly approved.

### Phase 3: Brain Inspector Visibility

Expose selected question in development inspection.

### Phase 4: BrainResponse Integration

Add selected question to the internal response surface.

Frontend changes remain separate.

### Phase 5: Persistent Question History

Track asked and answered questions to prevent repetition.

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