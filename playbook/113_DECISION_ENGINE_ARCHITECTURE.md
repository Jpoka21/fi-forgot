# 113_DECISION_ENGINE_[ARCHITECTURE.md](http://ARCHITECTURE.md)

# Decision Engine Architecture

## Purpose

This document defines the architecture of the F.I. Forgot Decision Engine.

The Decision Engine is responsible for determining the single most valuable action the platform should take for a relationship at any point in time.

The Decision Engine does not collect information.

It does not compute signals.

It does not normalize state.

Its sole responsibility is deciding what should happen next using information that has already been prepared.

This document defines the architectural contract for decision making.

It intentionally avoids implementation details and individual business rules.

---



# Relationship to the Brain

The Brain operates as a sequence of independent layers.

```

RelationshipContext

        ↓

Signal Contributors

        ↓

Brain Signals

        ↓

Signal Normalization

        ↓

Decision Context

        ↓

Decision Engine

        ↓

Action Planner

        ↓

Execution

```

Each layer has exactly one responsibility.

Information flows only in the forward direction.

No downstream layer may modify upstream state.

---



# Architectural Principles

The Decision Engine follows the same architectural principles as the remainder of the Brain.

## Deterministic

The same inputs must always produce the same decision.

No randomness is permitted.

---



## Explainable

Every decision must be explainable.

The system must always be able to answer:

- Why this decision was selected
- Which signals influenced the decision
- Which normalized dimensions were considered
- Why competing actions were not selected

---



## Stateless

The Decision Engine stores no information.

All required information is supplied through its inputs.

---



## Read Only

The Decision Engine never modifies RelationshipContext.

It never updates the database.

It never executes user actions.

---



## Independent

The Decision Engine must not depend on frontend state.

It must not depend on UI behavior.

It must remain usable from any future API, background worker, scheduled task, or administrative tool.

---



# Inputs

The Decision Engine consumes a DecisionContext.

The DecisionContext is derived from normalized relationship state together with any additional information required for decision making.

The Decision Engine does not inspect raw Brain signals directly.

Signal interpretation belongs to the normalization layer.

---



# Decision Context

DecisionContext represents the Brain's understanding of the current relationship.

It is intentionally higher level than individual Brain signals.

Examples include:

- Relationship maturity
- Information freshness
- Writing readiness
- Engagement level
- Relationship momentum
- Upcoming event awareness
- Unanswered questions
- Outstanding follow ups
- Overall confidence

DecisionContext should describe the relationship rather than the individual evidence used to construct it.

---



# Decision Responsibilities

The Decision Engine determines what should happen next.

Possible decisions may include:

- Wait
- Ask profile question
- Ask fresh update
- Ask follow up
- Prepare briefing
- Generate card
- Schedule reminder
- No action required

These decisions represent intentions rather than execution steps.

---



# Decision Priorities

Only one primary decision should be produced during each evaluation.

When multiple actions appear valid, the Decision Engine should select the highest value action according to defined business priorities.

Priority ordering is independent of implementation.

---



# Confidence

Every decision should include a confidence score.

Confidence represents the certainty that the selected action is the correct next step.

Confidence should be derived from the quality and completeness of available relationship information rather than from randomness or language model estimation.

---



# Decision Explanation

Every decision should generate an explanation suitable for debugging.

The explanation should identify:

- Selected action
- Confidence
- Normalized relationship state
- Supporting evidence
- Rejected alternatives
- Reasoning summary

This explanation exists for development and diagnostics.

It is not part of the production API contract.

---



# Action Planning

The Decision Engine determines what should happen.

The Action Planner determines how it happens.

For example:

```

Decision

Generate Card

```

may expand into:

- Determine occasion
- Retrieve memories
- Retrieve writing history
- Apply voice preferences
- Avoid repetition
- Generate briefing
- Select artwork
- Generate draft
- Evaluate quality

The Decision Engine should never perform these operations directly.

---



# Separation of Responsibilities

RelationshipContext

Responsible for loading metadata.

Signal Contributors

Responsible for extracting facts.

Signal Normalization

Responsible for converting facts into relationship state.

Decision Engine

Responsible for selecting the best next action.

Action Planner

Responsible for expanding decisions into executable workflows.

Execution Layer

Responsible for interacting with external systems.

Each layer has one responsibility.

No layer should assume the responsibilities of another.

---



# Production Safety

During implementation, the Decision Engine may continue returning a placeholder action while internal reasoning is developed and validated.

Decision logic should be fully testable before any production behavior changes occur.

Development diagnostics may expose additional reasoning information without affecting production APIs.

---



# Future AI Integration

The Decision Engine is intentionally deterministic.

Future versions may incorporate language model assistance for recommendation refinement.

Any future AI involvement must remain bounded by deterministic guardrails and must never replace the architectural separation between:

- Evidence collection
- State normalization
- Decision making
- Execution

AI should improve decision quality, not replace the decision architecture.

---



# Summary

The Decision Engine represents the reasoning layer of the F.I. Forgot Brain.

Its purpose is to transform normalized relationship understanding into a single, explainable, deterministic next action.

By separating decision making from signal extraction and execution, the Brain remains modular, testable, explainable, and capable of evolving without introducing unintended behavior into production.