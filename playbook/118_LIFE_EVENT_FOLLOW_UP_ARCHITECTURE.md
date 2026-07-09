# 118_LIFE_EVENT_FOLLOW_UP_[ARCHITECTURE.md](http://ARCHITECTURE.md)

# F.I. Forgot

# Life Event Follow Up Architecture

---

# Purpose

This document defines the architecture for recognizing and acting on meaningful life events that deserve thoughtful follow up.

Unlike calendar based opportunities, Life Event Follow Up opportunities originate from real events that occur during the relationship.

Examples include:

* Starting a new job

* Moving into a new home

* Having surgery

* Having a baby

* Starting college

* Opening a business

* Retirement

* Marriage

* Engagement

The purpose of this architecture is not to interpret emotions.

Its purpose is to recognize that certain factual events naturally create future opportunities to reconnect.

The Brain should surface those opportunities at appropriate times without requiring the user to remember them.

---

# Relationship to Existing Architecture

This architecture extends the existing Relationship Intelligence Engine.

It does not introduce a parallel decision system.

The existing pipeline remains unchanged.

```text

RelationshipContext

        ↓

Signal Extraction

        ↓

Normalized Signals

        ↓

DecisionContext

        ↓

Rule Engine

        ↓

Winning Decision

        ↓

Action Planner

        ↓

BrainResponse

```

Life Event Follow Up integrates into this pipeline through additional reusable facts exposed by `DecisionContext`.

No production APIs change.

No BrainResponse changes.

No frontend changes.

No database schema changes.

---

# Design Philosophy

Life Event Follow Up exists because relationships naturally evolve over time.

People often mention significant events during conversation.

Weeks later, thoughtful friends ask how those events turned out.

The Brain should help recreate this natural behavior.

The Brain is not attempting to understand emotions.

It is recognizing that certain factual events have predictable conversational lifecycles.

Every decision remains deterministic.

Every decision remains explainable.

Every decision remains fully traceable through the Rule Engine.

---

# Core Principle

Life Event Follow Up is not a special case rule.

It is the first implementation of a reusable conversational opportunity pattern.

The Brain should reason from facts rather than subjective interpretations.

The rule does not decide whether an event is emotionally important.

Instead, it recognizes that certain classes of events naturally invite a future conversation.

This distinction keeps the architecture objective, deterministic, and easy to extend.

---

# Scope

This architecture is responsible for identifying opportunities created by previously recorded life events.

It is not responsible for:

* Writing card content

* Selecting questions

* Understanding emotions

* Performing AI classification during rule evaluation

* Reading raw database records

* Modifying relationship data

Those responsibilities remain owned by their existing Brain components.

Life Event Follow Up only determines whether a follow up opportunity exists.

---

# Architectural Goals

The architecture must satisfy the following goals:

* Remain fully deterministic

* Operate only on DecisionContext facts

* Produce explainable decisions

* Support future expansion without redesign

* Avoid duplicate parsing logic

* Avoid rule specific database queries

* Reuse existing Brain infrastructure whenever possible

---

# Non Goals

This architecture does not attempt to:

* Measure relationship quality

* Predict emotional outcomes

* Infer personality

* Evaluate message sentiment

* Decide what should be written

Those capabilities belong to other Brain components or future systems.

---

# Summary

Life Event Follow Up extends the existing Relationship Intelligence Engine by introducing a structured way to recognize meaningful life events and recommend timely follow ups.

Rather than creating isolated rules for every possible situation, this architecture establishes a reusable framework that can support many future conversational opportunities while preserving the Brain's core design principles of determinism, explainability, and modularity.



---

# Life Event Lifecycle

Every Life Event follows the same lifecycle inside the Brain.

```text

Life Event Captured

        ↓

Event Classification

        ↓

DecisionContext Facts

        ↓

Life Event Follow Up Rule

        ↓

Rule Engine

        ↓

Winning Opportunity

        ↓

Action Planner

        ↓

BrainResponse

```

Each stage has exactly one responsibility.

## Stage 1: Life Event Captured

A life event enters the system through an existing source of relationship information.

Examples include:

* Fresh Updates

* Timeline Events

* Future structured event sources

No follow up logic occurs at this stage.

The system simply records that an event occurred.

---

## Stage 2: Event Classification

Captured events are classified into a deterministic Life Event category.

Examples:

* New Job

* Move

* Surgery

* New Baby

* Marriage

* Engagement

* Retirement

* Business Launch

Classification produces structured metadata.

It does not decide whether a follow up should occur.

---

## Stage 3: DecisionContext

Classification results become reusable factual fields exposed through `DecisionContext`.

The Rule Engine consumes these facts just like every other rule.

The Decision Rule never parses raw timeline data.

It never reads free text.

It never performs classification.

---

## Stage 4: Rule Evaluation

The Life Event Follow Up Rule evaluates only factual inputs from `DecisionContext`.

If the follow up window has been reached and no higher priority rule wins, the rule produces an opportunity.

The Rule Engine remains responsible for conflict resolution.

---

## Stage 5: Action Planning

If the Life Event Follow Up Rule wins, the Action Planner determines the appropriate follow up action.

The rule itself does not choose wording or user interface behavior.

---

## Design Principle

Every stage owns one responsibility.

This separation keeps the Brain modular, testable, deterministic, and easy to extend as new life event categories are introduced.



---

# Event Classification Architecture

The Life Event Follow Up Rule should never interpret raw relationship information.

Instead, event classification is performed before rule evaluation, producing reusable factual data for the Brain.

This follows the same architectural philosophy used throughout the Relationship Intelligence Engine.

```text

Relationship Information

        ↓

Life Event Classification

        ↓

Structured Event Metadata

        ↓

DecisionContext

        ↓

Life Event Follow Up Rule

```

The rule consumes only structured facts.

It never performs its own classification.

It never analyzes free text.

It never reads raw timeline events.

---

## Why Classification Exists

Classification separates data interpretation from decision making.

This provides several benefits:

* Rules remain simple.

* Classification logic is reusable.

* New event types do not require rewriting the Rule Engine.

* Future rules can consume the same structured facts.

* Unit testing remains straightforward.

The Brain becomes easier to extend without increasing rule complexity.

---

## Event Categories

The initial implementation should recognize a small, objective set of life event categories.

Examples include:

| Category | Examples |

|-----------|----------|

| Career | Started a new job, promotion, career change |

| Home | Moved, bought a house, relocated |

| Family | New baby, adoption, engagement, marriage |

| Health | Surgery, recovery, major treatment |

| Education | Started college, graduated, certification |

| Business | Started a company, opened a location |

| Retirement | Retirement from work |

These categories describe factual events.

They do not assign emotional meaning.

---

## Classification Output

Classification should produce structured metadata rather than natural language.

Conceptually, the Brain should receive information similar to:

```text

Event Category

Event Type

Event Date

Suggested Follow Up Window

Event Status

```

The exact implementation may evolve, but every value should be deterministic and reusable.

---

## Separation of Responsibilities

Classification is responsible for determining what happened.

The Decision Rule is responsible for determining whether it is time to follow up.

The Action Planner is responsible for determining what action should occur.

Keeping these responsibilities separate prevents duplicated logic and allows each component to evolve independently.



---

# DecisionContext Extensions

The Rule Engine should never depend on raw relationship data.

Instead, Life Event information should be exposed through reusable facts added to `DecisionContext`.

This continues the Brain's existing architectural pattern of separating data preparation from decision making.

The exact implementation may evolve, but the following conceptual facts illustrate the intended design.

| Fact | Purpose |

|------|---------|

| `latestLifeEventType` | Identifies the most recent classified life event |

| `latestLifeEventCategory` | Broad category such as Career, Family, Health, Home, or Business |

| `latestLifeEventDaysAgo` | Number of days since the event occurred |

| `latestLifeEventFollowUpWindow` | Recommended follow up timing for this event type |

| `latestLifeEventEligible` | Indicates whether the event is currently eligible for follow up |

These values should be deterministic.

They should not contain generated text.

They should not contain emotional interpretations.

They should not require the Rule Engine to inspect timeline events or free form user input.

---

## Why DecisionContext Owns These Facts

DecisionContext already serves as the Brain's factual representation of relationship state.

Adding Life Event facts here provides several benefits.

* Every rule continues to read from one source.

* Event parsing happens once.

* Rules remain simple and deterministic.

* Future opportunity rules can reuse the same facts.

* Unit testing remains focused on factual inputs rather than parsing logic.

This approach preserves the separation between data preparation and decision evaluation.

---

## Design Principle

DecisionContext should expose reusable facts rather than rule specific values.

For example, a future Retirement Follow Up rule, Health Recovery rule, or Business Check In rule should all be able to consume the same Life Event facts without introducing additional parsing or duplicate metadata.

The Brain becomes more capable by expanding reusable context, not by increasing rule complexity.

---

# Life Event Follow Up Rule

The Life Event Follow Up Rule is responsible for answering one question.

> Is there an eligible Life Event that has reached its follow up window?

It owns no other responsibility.

The rule does not classify events.

The rule does not interpret emotions.

The rule does not determine message wording.

The rule simply evaluates factual inputs exposed through `DecisionContext`.

---

## Rule Inputs

Conceptually, the rule evaluates facts similar to:

* Latest Life Event Type

* Latest Life Event Category

* Days Since Event

* Follow Up Window

* Event Eligibility

These facts are prepared before rule evaluation.

The rule itself performs no additional data preparation.

---

## Match Conditions

A Life Event Follow Up opportunity exists only when all required conditions are satisfied.

Conceptually:

* A classified Life Event exists.

* The event is eligible for follow up.

* The recommended follow up window has been reached.

* The event has not already been acknowledged by another completed follow up.

* No higher priority Opportunity Rule wins.

If any required condition is missing, the rule does not match.

---

## Priority

Life Event Follow Up belongs between freshness management and long term relationship maintenance.

Proposed priority:

```

Birthday                  50

Anniversary               45

Valentine's Day           42

Inactivity                41

Fresh Update              40

Life Event Follow Up      38

Card Gap                  35

Memory Accumulation       34

Accomplishment Follow Up  33

Wait                       0

```

This ordering reflects the relative importance of opportunities while preserving deterministic conflict resolution.

---

## Rule Output

When the rule matches, it produces a standard `DecideResult`.

The output follows the same contract as every other Opportunity Rule.

The rule does not produce user facing language.

It produces a factual recommendation that a Life Event Follow Up opportunity exists.

The Action Planner remains responsible for determining the next action.

---

## Design Principles

The Life Event Follow Up Rule should remain intentionally small.

Its responsibilities are limited to:

* Reading factual inputs.

* Evaluating deterministic conditions.

* Producing a decision.

All interpretation, classification, and user experience behavior remain outside the rule.

This keeps the Rule Engine predictable, explainable, and easy to test.



---

# Follow Up Windows

Not every Life Event should be revisited after the same amount of time.

Some events naturally invite a quick check in.

Others benefit from allowing more time before reconnecting.

For this reason, follow up timing should be treated as event metadata rather than Rule Engine logic.

The Rule Engine consumes the recommended follow up window.

It does not determine the window itself.

---

## Design Philosophy

The timing of a follow up should reflect typical human relationship behavior.

The Brain is not attempting to predict emotions.

Instead, it models common conversational patterns.

Examples include:

* Asking how a new job is going after several weeks.

* Checking on someone's recovery after surgery.

* Asking how the move went after they have settled in.

* Congratulating new parents after they have had time to adjust.

This keeps recommendations feeling natural without introducing subjective reasoning.

---

## Example Follow Up Windows

The exact values are configurable and may evolve with production feedback.

| Event Type | Example Window |

|------------|---------------:|

| Surgery | 14 days |

| New Baby | 21 days |

| New Job | 30 days |

| Business Launch | 30 days |

| Move | 30 days |

| College Start | 30 days |

| Marriage | 30 days |

| Retirement | 45 days |

These values are examples only.

Production thresholds should be owned by Brain configuration rather than embedded inside decision rules.

---

## Configuration Ownership

Follow up windows should be centralized in Brain configuration.

This provides several advantages.

* Easy adjustment after beta feedback.

* Consistent behavior across all rules.

* Simpler testing.

* No duplicated timing values.

* Future event types can be added without changing rule logic.

Decision Rules should consume configured values rather than defining them.

---

## Future Flexibility

The architecture intentionally separates event timing from event classification.

This allows future enhancements such as:

* Different windows for different relationship types.

* User configurable reminder timing.

* Adaptive timing based on relationship history.

* Seasonal adjustments.

These capabilities can be introduced without changing the Rule Engine contract.

The Rule Engine continues to evaluate deterministic facts regardless of how those facts are produced.



---

# Implementation Strategy

The Life Event Follow Up architecture should be implemented incrementally using the existing Brain infrastructure.

No existing Brain components should be redesigned.

Instead, each implementation step should extend the current architecture in a narrowly scoped and reusable manner.

---

## Phase 1: Life Event Classification

Introduce a deterministic classification component responsible for recognizing supported Life Event categories from existing relationship information.

Responsibilities:

* Identify supported Life Events.

* Assign an Event Category.

* Determine the appropriate follow up window.

* Produce reusable structured metadata.

This component should not evaluate whether a follow up opportunity exists.

Its only responsibility is preparing factual event data.

---

## Phase 2: DecisionContext Integration

Expose Life Event metadata through `DecisionContext`.

This follows the existing Brain pattern of preparing reusable facts before Rule Engine evaluation.

The Rule Engine should receive only structured facts.

It should never inspect raw relationship data or free form text.

---

## Phase 3: Life Event Follow Up Rule

Implement a new Opportunity Rule that evaluates only the Life Event facts exposed through `DecisionContext`.

Responsibilities:

* Determine whether an eligible Life Event exists.

* Verify that the follow up window has been reached.

* Respect Rule Engine priority ordering.

* Produce a standard `DecideResult`.

The rule should remain intentionally small and deterministic.

---

## Phase 4: Action Planning

If the Life Event Follow Up Rule wins, the Action Planner determines the next user action.

The Action Planner remains responsible for:

* Selecting the appropriate follow up workflow.

* Choosing the question strategy.

* Producing the standard BrainResponse.

The Rule itself does not determine user experience behavior.

---

## Phase 5: Validation

Every implementation should include deterministic unit tests covering:

* Matching conditions.

* Non matching conditions.

* Priority interactions.

* Follow up window boundaries.

* Decision trace output.

* Action Planner integration.

No implementation should bypass the existing Rule Engine architecture.

---

## Architectural Consistency

This implementation strategy intentionally mirrors every Opportunity Rule already present in the Brain.

Each phase introduces one responsibility.

No phase duplicates existing logic.

No phase changes public APIs.

No phase changes BrainResponse.

No phase changes frontend behavior.

The result is an implementation that extends the Relationship Intelligence Engine while preserving its existing architecture.



---

# Future Expansion

Life Event Follow Up establishes a reusable architectural pattern rather than solving a single feature.

Once this pattern exists, additional conversational opportunities can be introduced by extending Life Event classification rather than redesigning the Rule Engine.

Potential future capabilities include:

* Current Challenge Follow Up

* Current Excitement Follow Up

* Major Life Event Recognition

* Retirement Check In

* Parent Support

* Family Milestone Follow Up

* Recovery Check In

* Long Term Friendship Appreciation

* Empty Nest Transition

* Business Growth Follow Up

Each future capability should follow the same architecture.

```

Relationship Information

        ↓

Classification

        ↓

DecisionContext Facts

        ↓

Decision Rule

        ↓

Rule Engine

        ↓

Action Planner

        ↓

BrainResponse

```

This consistency ensures that the Brain grows by expanding reusable intelligence rather than accumulating isolated rules.

---

# Relationship to Other Brain Documents

This document complements the existing Brain architecture documentation.

| Document | Responsibility |

|----------|----------------|

| 114_DECISION_RULE_[FRAMEWORK.md](http://FRAMEWORK.md) | Defines how deterministic rules are written |

| 116_RULE_ENGINE_[ARCHITECTURE.md](http://ARCHITECTURE.md) | Defines how rules are evaluated and resolved |

| 117_OPPORTUNITY_[RULES.md](http://RULES.md) | Documents every implemented and planned Opportunity Rule |

| 118_LIFE_EVENT_FOLLOW_UP_[ARCHITECTURE.md](http://ARCHITECTURE.md) | Defines the reusable architecture for Life Event based conversational opportunities |

Together these documents define the complete architecture of the Brain's Opportunity Engine.

---

# Architecture Summary

Life Event Follow Up extends the Relationship Intelligence Engine without changing its core architecture.

The implementation preserves the Brain's guiding principles:

* Deterministic decisions

* Single responsibility components

* Reusable DecisionContext facts

* Centralized Rule Engine evaluation

* Explainable outcomes

* Modular Action Planning

* No duplicate parsing

* No direct database access from rules

* No AI driven decision making during rule evaluation

Rather than introducing a special case feature, this architecture establishes a scalable framework for future conversational intelligence.

As new Life Event categories and Opportunity Rules are added, they should integrate through this architecture instead of creating parallel decision paths.

The result is a Brain that becomes more capable over time while remaining understandable, testable, maintainable, and predictable.

---

# Document Status

| Attribute | Value |

|-----------|-------|

| Status | Architecture Approved |

| Last Updated | 2026-07-09 |

| Related Epic | Opportunity Engine |

| Next Implementation | Life Event Classification Contributor |

| Public APIs Changed | No |

| BrainResponse Changed | No |

| Frontend Changed | No |

| Database Schema Changed | No |

This document serves as the architectural blueprint for implementing Life Event based conversational opportunities within the F.I. Forgot Brain.





