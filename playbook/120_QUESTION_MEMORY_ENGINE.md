# 120 QUESTION MEMORY ENGINE

## Document Status

Status: Architecture proposal

Phase: Relationship Intelligence, Conversation Intelligence

Implementation: Not started

Depends on:

- 114 Decision Rule Framework
- 115 Relationship Intelligence Implementation Tracker
- 116 Rule Engine Architecture
- 117 Opportunity Rules
- 118 Life Event Follow Up Architecture
- 119 Follow Up Question Engine

---

# 1. Purpose

The Question Memory Engine remembers every follow up question the Brain has asked and determines how future questions should evolve over time.

The Follow Up Question Engine decides:

```text
What is the best question to ask today?

```

The Question Memory Engine answers:

```text
Have we already asked this?

Did they answer?

Should we ask something different?

Should we wait?

Should we move deeper?

Should we stop asking?

```

It does not detect opportunities.

It does not rank rules.

It does not generate language.

It does not modify relationship state.

It does not use AI.

---

# 2. Why This Exists

Without memory:

```text
Month 1

How has everything been going?

Month 2

How has everything been going?

Month 3

How has everything been going?

```

With memory:

```text
Month 1

How has everything been going?

↓

Answered

↓

Month 2

Did everything work out?

↓

Answered

↓

Month 4

What's happened since then?

↓

Answered

↓

Brain retires this conversation.

```

The Brain should remember conversations just as it remembers birthdays and relationship facts.

---

# 3. Responsibility

The Rule Engine decides whether a question should be asked.

The Follow Up Question Engine decides which question best fits.

The Question Memory Engine decides whether that question should still be asked.

---

# 4. Placement

Current pipeline

```text
RelationshipContext
        ↓
Signal Extraction
        ↓
Normalized Relationship State
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

Future pipeline

```text
RelationshipContext
        ↓
Signal Extraction
        ↓
Normalized Relationship State
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

The Question Memory Engine never replaces the Question Engine.

It refines its output.

---

# 5. Inputs

The engine may consume:

- DecisionContext
- DecideResult
- ActionPlan
- SelectedFollowUpQuestion
- Previous question history
- Previous follow up answers
- Existing relationship metadata

It may not consume:

- AI
- Free text parsing
- Raw database queries
- Frontend state
- Generated BrainResponse language

---

# 6. Output

Conceptually

```text
QuestionMemoryDecision {

    selectedQuestion

    status

    reason

    nextStage

}

```

Where

```text
status

ASK

SKIP

WAIT

RETIRE

ESCALATE

```

The engine does not rewrite questions.

It only determines whether the selected question remains appropriate.

---

# 7. Question Lifecycle

Every follow up question moves through a lifecycle.

```text
Never Asked

↓

Asked

↓

Answered

↓

Cooldown

↓

Eligible Again

↓

Retired

```

Not every question reaches every stage.

Some may be dismissed permanently.

Some may escalate into deeper questions.

---

# 8. Conversation Progress

The engine manages progression.

Example

```text
Question 1

↓

Question 2

↓

Question 3

↓

Collect New Memory

↓

Conversation Complete

```

Rather than repeating Question 1 forever.

---

# 9. Cooldowns

Each question may define a cooldown period.

Example

```text
30 days

60 days

90 days

```

During cooldown

```text
ASK

↓

No

↓

WAIT

```

The engine should prevent immediate repetition.

---

# 10. Escalation

Questions may naturally deepen.

Example

```text
How has everything been going?

↓

Did everything work out?

↓

What changed after that?

↓

Anything new since then?

```

Escalation remains deterministic.

---

# 11. Retirement

Questions eventually become exhausted.

Example

```text
Three follow ups answered

↓

Retire conversation

↓

Allow new opportunity later

```

Retirement avoids endless loops.

---

# 12. Question History

Conceptually each relationship records

```text
questionId

relationshipId

askedAt

answeredAt

status

sourceRuleId

rotationKey

conversationStage

```

Implementation details are intentionally deferred.

The architecture should support persistence later.

---

# 13. Conversation State

Future conversation states

```text
Not Started

In Progress

Waiting

Completed

Dormant

Restarted

```

These are conversation states.

Not relationship states.

---

# 14. Restarting Conversations

After enough time

```text
Completed

↓

New Life Event

↓

Restart Conversation

```

The Brain should not permanently block future questions.

---

# 15. Rule Independence

Rules never inspect question history.

Rules only determine opportunity.

Conversation memory determines whether the selected question should actually be used.

---

# 16. Question Engine Independence

The Follow Up Question Engine remains responsible for

```text
Question catalog

Question selection

Category mapping

Sensitivity

```

Question Memory owns

```text
History

Cooldowns

Retirement

Escalation

Conversation progress

```

---

# 17. Decision Matrix

Example

```text
Selected Question

↓

Already asked?

↓

No

↓

ASK

-------------------

Selected Question

↓

Asked yesterday

↓

WAIT

-------------------

Selected Question

↓

Asked

↓

Answered

↓

Move to next question

-------------------

Selected Question

↓

Conversation complete

↓

RETIRE

```

---

# 18. Deterministic First Version

Version 1 should remain intentionally simple.

No AI.

No embeddings.

No semantic scoring.

No emotional inference.

Only deterministic rules based on structured history.

---

# 19. Testing Strategy

Tests should verify

- First question is allowed
- Duplicate question blocked
- Cooldown enforced
- Cooldown expiration
- Conversation advances
- Retirement
- Restart after new opportunity
- Rule Engine unchanged
- Question Engine unchanged
- BrainResponse unchanged

---

# 20. Future Expansion

Future versions may support

- Conversation branches
- Multiple simultaneous conversations
- Relationship specific pacing
- User preferred cadence
- AI generated follow up suggestions
- Dynamic cooldowns
- Business conversations
- Shared household conversations
- Imported conversation history

---

# 21. Non Goals

The Question Memory Engine does not

- Detect opportunities
- Select questions
- Generate cards
- Generate AI prompts
- Modify relationship state
- Modify Rule Engine
- Replace Action Planner
- Replace Follow Up Question Engine

---

# 22. Recommended Implementation Phases

## Phase 1

Question history model

No integration.

---

## Phase 2

Cooldown evaluation

---

## Phase 3

Conversation progression

---

## Phase 4

Retirement and restart

---

## Phase 5

Persistent storage

---

## Phase 6

Brain Inspector visibility

---

## Phase 7

BrainResponse integration

---

# 23. Architectural Summary

The Question Memory Engine completes the second major layer of Conversation Intelligence.

Responsibility becomes:

```text
RelationshipContext

↓

Signal Extraction

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

The Brain first recognizes opportunities.

Then selects the best question.

Then remembers whether that question should still be asked.

This prevents repetitive conversations, enables structured follow ups over time, and lays the foundation for long term relationship continuity without relying on AI.