# 121 BRAIN EXECUTION PIPELINE

## Document Status

Status: Architecture proposal

Phase: Core Brain Architecture

Implementation: Reflects current architecture with future execution stages identified

Depends on:

- 114 Decision Rule Framework
- 115 Relationship Intelligence Implementation Tracker
- 116 Rule Engine Architecture
- 117 Opportunity Rules
- 118 Life Event Follow Up Architecture
- 119 Follow Up Question Engine
- 120 Question Memory Engine

---

# 1. Purpose

This document defines the complete execution pipeline of the Brain.

It answers one question:

> What happens from the moment Brain execution begins until a BrainResponse is produced?

This document serves as the architectural contract for every Brain subsystem.

Every future Brain component must define where it executes within this pipeline and which responsibilities it owns.

---

# 2. Design Principles

The execution pipeline follows five principles.

## Single Responsibility

Every stage owns exactly one responsibility.

No stage performs work that belongs to another.

---

## Deterministic Execution

Given identical inputs, the Brain produces identical outputs.

No randomness.

No AI based decision making.

No hidden state.

---

## Sequential Intelligence

Each stage consumes the output of earlier stages.

No stage reaches backward into previous layers.

---

## Immutable Facts

Earlier stages create facts.

Later stages interpret those facts.

Facts are never rewritten downstream.

---

## Layer Isolation

Each layer communicates only through well defined contracts.

No layer reaches into another layer's internal implementation.

---

# 3. High Level Pipeline

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
Winning DecideResult
        ↓
Action Planner
        ↓
Follow Up Question Engine
        ↓
Question Memory Engine
        ↓
BrainResponse

```

Every stage exists for a different reason.

---

# 4. RelationshipContext

Purpose

Provide every structured fact available about a relationship.

Inputs

- Database
- Existing relationship services
- Timeline
- Profile
- Memories
- Writing history
- Fresh updates
- Card history

Outputs

```text
RelationshipContext

```

Responsibilities

- Load structured information
- No interpretation
- No prioritization
- No opportunity detection

---

# 5. Signal Extraction

Purpose

Convert RelationshipContext into reusable factual observations.

Inputs

```text
RelationshipContext

```

Outputs

```text
BrainSignal[]

```

Examples

- card counts
- timeline counts
- memory inventory
- writing history
- freshness
- inactivity
- relationship activity

Responsibilities

- Produce reusable facts
- Never create opportunities
- Never generate language

---

# 6. Relationship State Normalization

Purpose

Summarize BrainSignals into high level relationship dimensions.

Inputs

```text
BrainSignal[]

```

Outputs

```text
NormalizedRelationshipState

```

Current dimensions

- Identity
- Freshness
- History
- Writing
- Engagement
- Momentum

Responsibilities

Describe relationship health.

Never detect opportunities.

---

# 7. Life Event Intelligence

Purpose

Recognize structured life events.

Inputs

```text
RelationshipContext

```

Outputs

```text
LifeEventClassification[]

```

Responsibilities

- Structured classification
- Deterministic
- No AI
- No opportunities
- No signals

---

# 8. DecisionContext Construction

Purpose

Assemble every fact required by Decision Rules.

Inputs

- RelationshipContext
- NormalizedRelationshipState
- LifeEventClassification[]

Outputs

```text
DecisionContext

```

Responsibilities

- Flatten facts
- Organize rule inputs
- No decision making

---

# 9. Rule Engine

Purpose

Evaluate every Opportunity Rule.

Inputs

```text
DecisionContext

```

Outputs

```text
RuleEvaluationSummary

```

Responsibilities

- Execute rules
- Rank matches
- Select winner
- Never generate language

Current implemented rules

- Birthday
- Anniversary
- Valentine's Day
- Inactivity
- Fresh Update
- Life Event Follow Up
- Card Gap
- Memory Accumulation
- Accomplishment Follow Up
- Wait

---

# 10. DecideResult

Purpose

Represent the single winning opportunity.

Outputs

```text
DecideResult

```

Contains

- sourceRuleId
- outcome
- confidence
- reasons
- debugNotes

No language.

No UI.

---

# 11. Action Planner

Purpose

Convert the winning decision into a Brain action.

Inputs

```text
DecideResult

```

Outputs

```text
ActionPlan

```

Examples

```text
ask_question

generate_card

wait

```

Responsibilities

Determine action type.

Never choose wording.

---

# 12. Follow Up Question Engine

Purpose

Choose the best follow up question.

Inputs

- DecisionContext
- DecideResult
- ActionPlan

Outputs

```text
SelectedFollowUpQuestion

```

Responsibilities

- Category mapping
- Question catalog
- Deterministic selection

No conversation history.

No AI.

---

# 13. Question Memory Engine

Purpose

Determine whether the selected question should still be asked.

Inputs

- SelectedFollowUpQuestion
- Question history
- Previous answers

Outputs

```text
QuestionMemoryDecision

```

Responsibilities

- Cooldowns
- Conversation progression
- Retirement
- Restart
- Escalation

Question Memory never selects questions.

---

# 14. BrainResponse

Purpose

Return the Brain's public result.

Inputs

- DecideResult
- ActionPlan

Future

- Question Memory decision
- Selected question

Current public behavior remains unchanged.

Responsibilities

Public contract only.

---

# 15. Information Flow

Every stage consumes only upstream outputs.

```text
RelationshipContext

↓

BrainSignals

↓

NormalizedRelationshipState

↓

LifeEventClassification

↓

DecisionContext

↓

RuleEngine

↓

DecideResult

↓

ActionPlan

↓

SelectedQuestion

↓

QuestionMemoryDecision

↓

BrainResponse

```

No stage bypasses another.

---

# 16. Layer Responsibilities


| Layer                      | Owns                    |
| -------------------------- | ----------------------- |
| RelationshipContext        | Structured facts        |
| Signal Extraction          | Observations            |
| Relationship Normalization | Relationship dimensions |
| Life Event Intelligence    | Event recognition       |
| DecisionContext            | Rule inputs             |
| Rule Engine                | Opportunity selection   |
| Action Planner             | Action selection        |
| Follow Up Question Engine  | Question selection      |
| Question Memory Engine     | Conversation continuity |
| BrainResponse              | Public response         |


---

# 17. Explicit Boundaries

RelationshipContext never decides.

Signals never classify.

Normalization never creates opportunities.

Life Event Intelligence never creates opportunities.

DecisionContext never interprets.

Rules never generate language.

Action Planner never writes questions.

Question Engine never remembers conversations.

Question Memory never selects questions.

BrainResponse never contains business logic.

---

# 18. Development Only Components

These components exist only for inspection and debugging.

- Brain Inspector
- Rule Evaluation Summary
- Execution diagnostics
- Selected Follow Up Question
- Future Question Memory diagnostics

They must never affect production decisions.

---

# 19. Extension Rules

Every new Brain subsystem must answer:

1. Where does it execute?
2. What inputs does it consume?
3. What outputs does it produce?
4. Which layer owns it?
5. Which layers must not know it exists?
6. Does it change the public BrainResponse?
7. Can it be tested independently?
8. Is it deterministic?

If these questions cannot be answered clearly, the subsystem does not belong in the pipeline.

---

# 20. Current Implementation Status

## Implemented

- RelationshipContext
- Signal Extraction
- 70 Brain Signals
- Relationship Normalization
- Life Event Intelligence
- DecisionContext
- Rule Engine
- Rule Evaluation Summary
- Action Planner
- Follow Up Question Engine
- Brain Inspector

## In Progress

- Question Memory Engine

## Planned

- Conversation Progress Engine
- Writing Intelligence V2

---

# 21. Future Pipeline

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
Conversation Progress Engine
        ↓
Writing Intelligence V2
        ↓
BrainResponse

```

Each new stage enriches the Brain without changing the responsibilities of earlier stages.

---

# 22. Architectural Summary

The Brain is a layered deterministic intelligence system.

Each layer performs one responsibility and passes structured information to the next.

The execution model follows a simple progression:

```text
Facts

↓

Understanding

↓

Decision

↓

Action

↓

Conversation

↓

Response

```

This document serves as the master execution blueprint for the Brain. Every future subsystem should integrate into this pipeline without violating the separation of responsibilities, deterministic execution model, or public Brain contract established by the existing architecture.