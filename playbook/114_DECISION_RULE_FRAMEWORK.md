# 114_DECISION_RULE_[FRAMEWORK.md](http://FRAMEWORK.md)

# F.I. Forgot

# Decision Rule Framework

---

## Purpose

This document defines how the Relationship Intelligence Engine makes decisions.

It does **not** define individual rules.

Instead, it defines the architecture every future rule must follow.

The objective is to ensure that the Brain remains:

• deterministic

• explainable

• testable

• predictable

• extensible

for the lifetime of the product.

---

# Relationship to Other Documents

This document builds upon:

110_RELATIONSHIP_INTELLIGENCE_[FRAMEWORK.md](http://FRAMEWORK.md)

111_RELATIONSHIP_INTELLIGENCE_ARCHITECTURAL_[AUDIT.md](http://AUDIT.md)

112_BRAIN_SIGNAL_[TAXONOMY.md](http://TAXONOMY.md)

113_DECISION_ENGINE_[ARCHITECTURE.md](http://ARCHITECTURE.md)

Those documents define:

RelationshipContext

Brain Signals

Normalized Relationship State

DecisionContext

This document begins where those documents end.

It defines how the Brain converts a DecisionContext into a Decision.

---

# Philosophy

The Brain should never behave unpredictably.

Users should never wonder why a recommendation appeared.

Every recommendation must be explainable.

Every recommendation must be reproducible.

Given the same DecisionContext,

the Brain must always produce the same Decision.

No randomness is permitted.

---

# Responsibilities

The Decision Engine is responsible for exactly one thing:

Determine what should happen next.

It is not responsible for:

writing cards

creating prompts

asking questions

sending notifications

executing actions

Those responsibilities belong to later layers.

---

# Decision Inputs

The Decision Engine receives only:

DecisionContext

Nothing else.

It does not access:

RelationshipContext

database queries

contributors

AI

external APIs

frontend state

Everything required to make a decision must already exist inside DecisionContext.

---

# Decision Outputs

Every evaluation returns one Decision.

A Decision contains:

Decision

Confidence

Reasons

Debug Notes

No side effects occur during evaluation.

---

# Decision Categories

Every future rule belongs to exactly one category.

## Card Opportunity

The Brain believes a card should be generated.

Examples

Birthday

Anniversary

Holiday

Just Because

Major Life Event

---

## Information Opportunity

The Brain believes additional information should be collected.

Examples

Missing profile information

Missing interests

Missing personality

Missing memories

---

## Relationship Maintenance

The relationship should be strengthened.

Examples

Fresh update

Follow up

Recent accomplishment

Life change

---

## Waiting

No action should currently occur.

Waiting is a valid decision.

The Brain should not create work simply because it exists.

---

# Rules

A Rule contains:

Identifier

Purpose

Required Conditions

Priority

Decision Category

Confidence Contribution

Explanation

Each rule must be completely deterministic.

---

# Rule Evaluation

Rules are evaluated in priority order.

Each rule examines only DecisionContext.

Rules never modify DecisionContext.

Rules never modify other rules.

Rules are pure functions.

---

# Pure Function Requirement

Every rule must satisfy:

Same input

Same output

Every time.

Rules may never depend on:

current time outside approved inputs

random numbers

AI responses

network calls

database reads

global state

---

# Rule Priorities

Rules have explicit priorities.

Higher priority rules evaluate first.

Example

Critical Event

↓

Upcoming Event

↓

Information Collection

↓

Relationship Maintenance

↓

Wait

Priority must always be explicit.

Never implicit.

---

# Multiple Matching Rules

Multiple rules may match.

Matching does not guarantee selection.

Rules produce candidates.

The Decision Engine selects the highest priority candidate.

Future versions may combine compatible rules.

Until then,

one Decision is returned.

---

# Confidence

Confidence represents certainty,

not importance.

Examples

High confidence:

Birthday tomorrow.

Low confidence:

Maybe ask about hobbies.

Confidence is derived from:

Relationship completeness

Freshness

Writing readiness

Historical evidence

Signal quality

Confidence is deterministic.

No AI scoring.

---

# Explanations

Every Decision must explain itself.

Reasons exist for developers.

Eventually,

simplified explanations may be shown to users.

Example

Decision:

Request Fresh Update

Reasons

Fresh update is stale

Profile complete

No active event

Relationship is active

Explanations should always reference observable facts.

Never hidden logic.

---

# Conflict Resolution

If two rules conflict,

priority resolves the conflict.

If priorities are equal,

the rule with higher confidence wins.

If confidence is equal,

the explicitly defined tie breaker is used.

Tie breakers must never rely on randomness.

---

# Waiting

Waiting is an intentional outcome.

The Brain should never invent work.

If no meaningful recommendation exists,

the correct decision is:

Wait.

---

# Rule Independence

Rules must never know about one another.

Rules cannot:

enable another rule

disable another rule

modify another rule

Rules remain individually testable.

---

# Testability

Every rule requires unit tests.

Tests should verify:

matching conditions

non matching conditions

confidence

priority

decision

reasons

Rules should be testable in isolation.

---

# AI Boundary

AI is not part of the Decision Engine.

AI begins only after a Decision has been made.

Examples

Card writing

Follow up wording

Question wording

Memory summarization

Relationship summaries

Decision making itself remains deterministic.

---

# Future Expansion

Future releases may introduce:

compound rules

weighted scoring

behavior learning

personalization

AI assisted recommendations

Those systems must consume DecisionContext.

They must not bypass the Decision Engine.

---

# Architectural Principles

The Decision Engine must remain:

Predictable

Deterministic

Observable

Explainable

Pure

Composable

Testable

Debuggable

Safe

---

# Success Criteria

The Decision Rule Framework is complete when:

Every decision is deterministic.

Every rule is independently testable.

Every recommendation is explainable.

DecisionContext is the only required input.

No database access occurs.

No AI participates.

No side effects occur.

Every future rule follows this framework.

---

End of Document