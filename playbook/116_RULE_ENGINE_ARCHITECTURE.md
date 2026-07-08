# 116_RULE_ENGINE_[ARCHITECTURE.md](http://ARCHITECTURE.md)

# F.I. Forgot

# Rule Engine Architecture

---

## Purpose

This document defines the internal architecture of the deterministic Rule Engine inside the Relationship Intelligence Engine.

The Rule Engine is the first behavioral layer of the Brain.

It converts a `DecisionContext` into a `DecideResult`.

This document does not define individual business rules.

It defines the system that evaluates rules safely, predictably, and explainably.

---

## Relationship to Existing Documents

This document builds on:

* `110_RELATIONSHIP_INTELLIGENCE_FRAMEWORK.md`

* `112_BRAIN_SIGNAL_TAXONOMY.md`

* `113_DECISION_ENGINE_ARCHITECTURE.md`

* `114_DECISION_RULE_FRAMEWORK.md`

* `115_RELATIONSHIP_INTELLIGENCE_IMPLEMENTATION_TRACKER.md`

Those documents define the Brain pipeline and the decision philosophy.

This document defines the concrete Rule Engine skeleton that future rules will plug into.

---

## Core Principle

The Rule Engine must remain deterministic.

Given the same `DecisionContext`, it must always return the same `DecideResult`.

No randomness.

No AI.

No database access.

No network access.

No side effects.

---

## Current State

Today, the Decision Engine is wired but frozen.

`decide()` receives a `DecisionContext`, but returns the scaffold decision:

```text

outcome = "wait"

confidence = 0

## Rule Engine Responsibilities

The Rule Engine is responsible for:

* Loading the registered deterministic rules.

* Evaluating each rule against `DecisionContext`.

* Collecting matching rule candidates.

* Resolving priority conflicts.

* Resolving confidence ties.

* Returning exactly one `DecideResult`.

The Rule Engine is not responsible for:

* Loading relationship data.

* Extracting signals.

* Normalizing signals.

* Building `DecisionContext`.

* Writing cards.

* Asking questions.

* Sending notifications.

* Executing actions.

* Calling AI.

---

## Rule Engine Input

The Rule Engine receives only:

```text

DecisionContext

---

# Rule Engine Pipeline

The Rule Engine executes a deterministic evaluation pipeline.

Every Brain execution follows the exact same sequence.

```

DecisionContext

        │

        ▼

Rule Registry

        │

        ▼

Evaluate Rules

        │

        ▼

Candidate Collection

        │

        ▼

Priority Resolution

        │

        ▼

Confidence Resolution

        │

        ▼

Final Decision

        │

        ▼

DecideResult

```

Each stage has a single responsibility.

No stage may perform the responsibility of another stage.

---

# Rule Registry

The Rule Registry is the entry point of the Rule Engine.

Its only responsibility is defining which rules participate in evaluation.

The registry contains only rule references.

Example conceptual registry:

```

WaitRule

BirthdayRule

AnniversaryRule

HolidayRule

MissingProfileRule

FreshUpdateRule

FollowUpRule

```

The registry performs no evaluation.

It contains no business logic.

Its purpose is maintaining a predictable execution order.

---

# Rule Evaluation

The Rule Engine evaluates every registered rule.

Each rule receives the exact same DecisionContext.

Rules execute independently.

Rules must never:

modify DecisionContext

modify another rule

read another rule's result

change evaluation order

Each rule returns either:

RuleCandidate

or

null

No other return values are permitted.

---

# Candidate Collection

Every matching rule produces a RuleCandidate.

Non matching rules return null.

The Rule Engine collects every RuleCandidate before making a decision.

Example:

```

BirthdayRule

↓

Candidate

----------------

Priority: 100

Confidence: 98

Decision:

Generate Birthday Card

```

```

FreshUpdateRule

↓

Candidate

----------------

Priority: 40

Confidence: 72

Decision:

Request Fresh Update

```

The Rule Engine does not stop after the first matching rule.

All rules are evaluated.

---

# Priority Resolution

Once all candidates have been collected, the Rule Engine selects the highest priority candidate.

Priority determines which recommendation should take precedence.

Example:

Birthday

Priority 100

Fresh Update

Priority 40

Result:

Birthday wins.

Priority is explicit.

Priority must never depend upon registration order.

---

# Confidence Resolution

Confidence is used only when competing candidates have equal priority.

Confidence represents certainty.

Confidence does not represent importance.

Example:

Birthday Rule

Priority 80

Confidence 92

Anniversary Rule

Priority 80

Confidence 76

Birthday wins because confidence is higher.

Confidence calculation must remain deterministic.

No randomness is permitted.

---

# Tie Resolution

If both priority and confidence are identical, the Rule Engine uses a deterministic tie breaker.

Tie breakers must always produce identical results for identical inputs.

Acceptable tie breakers include:

Rule identifier ordering

Explicit secondary priority

Static registration ordering

Random selection is never permitted.

---

# Wait Rule

The Wait Rule is a normal rule.

It is not special cased.

It exists within the Rule Registry like every other rule.

Characteristics:

Lowest priority.

Always matches.

Returns:

Outcome:

Wait

Because the Wait Rule always matches, the Rule Engine always produces at least one candidate.

This guarantees that every Brain execution returns a valid DecideResult.

---

# Rule Lifecycle

Every new rule follows the same lifecycle.

```

Idea

↓

Architecture Review

↓

Implementation

↓

Unit Tests

↓

Registry Registration

↓

Integration Tests

↓

Production

```

Rules may never bypass this process.

This ensures that every addition to the Brain remains deterministic, testable, and explainable.

# Testing Requirements

Every component of the Rule Engine must be independently testable.

The Rule Engine should never require database access or external services during unit testing.

Testing should occur at multiple levels.

## Rule Tests

Every individual rule must verify:

- Matching conditions
- Non matching conditions
- Returned decision
- Returned priority
- Returned confidence
- Returned reasons
- Returned debug notes

Rules should be tested in complete isolation.

---

## Rule Engine Tests

The Rule Engine must verify:

- Empty candidate collection
- Single matching rule
- Multiple matching rules
- Priority resolution
- Confidence resolution
- Tie resolution
- Wait Rule fallback

The Rule Engine should never depend on specific business rules for correctness.

---

## Integration Tests

Integration tests should verify the complete execution pipeline.

```
RelationshipContext

↓

Signal Extraction

↓

Normalization

↓

DecisionContext

↓

Rule Engine

↓

DecideResult

↓

BrainResponse

```

Integration tests should confirm that every layer communicates using stable contracts.

---

# Performance Requirements

The Rule Engine must remain lightweight.

Expected execution characteristics:

- Single execution pass
- No repeated normalization
- No repeated DecisionContext construction
- No additional database reads
- No network calls
- Constant memory growth relative to rule count

Performance should scale linearly as additional rules are introduced.

---

# Debugging Requirements

Every decision produced by the Rule Engine must be explainable.

Developers should always be able to determine:

- Which rules were evaluated.
- Which rules matched.
- Which candidates were produced.
- Why the winning rule was selected.
- Why competing rules were rejected.

The Development Brain Inspector should expose sufficient information to reproduce every decision without requiring production logging.

---

# Extensibility

Future rules should require minimal integration work.

Adding a new rule should consist of:

1. Implement the rule.
2. Add unit tests.
3. Register the rule.
4. Update the implementation tracker.

No existing rule should require modification simply because a new rule is added.

The Rule Engine should grow through composition rather than modification.

---

# Production Safety

The Rule Engine must preserve the production safety principles established throughout the Relationship Intelligence Engine.

Rules must never:

- Modify database records.
- Send notifications.
- Trigger card generation.
- Execute Action Planner behavior.
- Call AI models.
- Perform network requests.
- Introduce nondeterministic behavior.

The Rule Engine exists solely to determine the most appropriate decision.

Execution of that decision belongs to later stages of the Brain.

---

# Future Evolution

The initial Rule Engine is intentionally deterministic.

Future versions may introduce:

- Compound rule evaluation
- Weighted scoring
- User preference tuning
- Relationship specific thresholds
- Adaptive confidence models
- AI assisted decision recommendations

These enhancements must extend the Rule Engine.

They must never bypass it.

Deterministic evaluation remains the foundation of every future capability.

# Example Execution

The following example illustrates a complete Rule Engine evaluation.

### Input

```text
DecisionContext

Identity: Established

Freshness: Current

History: Rich

Writing: High

Engagement: Moderate

Momentum: Active

```

### Registered Rules

```text
WaitRule

BirthdayRule

AnniversaryRule

FreshUpdateRule

MissingProfileRule

```

### Evaluation

```text
WaitRule

↓

Candidate

Priority: 0

Confidence: 100

Outcome: Wait

```

```text
BirthdayRule

↓

Candidate

Priority: 100

Confidence: 98

Outcome: Generate Birthday Card

```

```text
AnniversaryRule

↓

No Match

```

```text
FreshUpdateRule

↓

Candidate

Priority: 40

Confidence: 76

Outcome: Request Fresh Update

```

```text
MissingProfileRule

↓

No Match

```

### Candidate Collection

```text
Birthday Candidate

Priority: 100

Confidence: 98

```

```text
Fresh Update Candidate

Priority: 40

Confidence: 76

```

```text
Wait Candidate

Priority: 0

Confidence: 100

```

### Resolution

Highest Priority:

Birthday Candidate

Highest Confidence among equal priorities:

Not required.

### Final Decision

```text
Outcome:

Generate Birthday Card

Confidence:

98

Reasons:

Birthday approaching

Relationship profile complete

Writing readiness high

Debug Notes:

BirthdayRule selected

FreshUpdateRule superseded by higher priority

WaitRule retained as fallback only

```

---

# Execution Guarantees

Every execution of the Rule Engine must satisfy the following guarantees.

- One DecisionContext enters the Rule Engine.
- Every registered rule is evaluated exactly once.
- Every evaluation is deterministic.
- Every candidate is collected before resolution.
- Exactly one DecideResult is returned.
- No side effects occur.
- No production data is modified.
- No AI participates in decision selection.

These guarantees form the long term contract of the Rule Engine.

---

# Success Criteria

The Rule Engine architecture will be considered complete when:

☐ Every rule follows the common Rule Contract.

☐ Every rule is independently testable.

☐ Rule registration is centralized.

☐ Candidate collection is deterministic.

☐ Priority resolution is deterministic.

☐ Confidence resolution is deterministic.

☐ Tie breaking is deterministic.

☐ WaitRule guarantees a valid fallback decision.

☐ Every decision is explainable.

☐ Development tooling can reproduce every decision.

☐ Production behavior remains stable during implementation.

---

# Architectural Principles

The Rule Engine must always remain:

- Deterministic
- Explainable
- Observable
- Predictable
- Pure
- Modular
- Extensible
- Testable
- Maintainable
- Production Safe

When introducing future capabilities, preserving these principles takes priority over adding new features.

No enhancement should weaken the architectural boundaries established by the Relationship Intelligence Engine.

---

# Relationship to Future Phases

Once the Rule Engine architecture has been implemented, future development shifts from infrastructure to capability.

Subsequent work will primarily consist of:

- Implementing deterministic rules.
- Expanding the Rule Registry.
- Refining confidence models.
- Building the Action Planner.
- Integrating AI after deterministic decisions have been made.
- Activating production behavior through controlled rollout.

The Rule Engine should require minimal architectural changes after its initial implementation.

Future work should primarily involve adding new rules rather than redesigning the engine itself.

---

# End of Document

---

