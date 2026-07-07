# 92_AI_AND_AUTOMATION_BUILD_[SPEC.md](http://SPEC.md)

## Purpose

This document defines the complete AI and automation system for F.I. Forgot.

F.I. Forgot is a premium Relationship Concierge that happens to write incredible greeting cards.

The AI and automation system is responsible for helping users become more thoughtful in the relationships that matter most.

The system must preserve all existing backend functionality, business logic, database schema, AI pipelines, authentication behavior, Stripe integration, Handwrytten integration, API contracts, and existing product capabilities.

This specification defines how the redesigned frontend should expose, explain, visualize, and support the existing AI and automation intelligence without requiring engineering interpretation during implementation.

The AI system must never feel like a generic chatbot.

The AI system must never feel like a writing tool.

The AI system must never feel like a reminder engine.

The AI system must feel like a quiet, premium, emotionally intelligent concierge working in the background to help the user show up better for the people they care about.

## Product Philosophy

F.I. Forgot is not a greeting card app.

F.I. Forgot is not a reminder app.

F.I. Forgot is not an AI writing tool.

F.I. Forgot is a premium Relationship Concierge.

Greeting cards are the first visible expression of that concierge.

The deeper product is relationship intelligence.

The system should remember what matters.

The system should notice what is missing.

The system should ask at the right time.

The system should write with warmth, restraint, specificity, and emotional accuracy.

The system should protect the user from sounding generic.

The system should protect the recipient from receiving something that feels artificial.

The system should make thoughtfulness easier without making it feel automated.

Every AI decision must answer one question.

What would a world class Relationship Concierge do here?

## AI Philosophy

The AI system exists to support human thoughtfulness, not replace it.

The AI should act as a behind the scenes relationship assistant.

The user should remain the person showing care.

The AI should help the user remember, reflect, prepare, and communicate better.

The system should never claim emotional certainty it does not have.

The system should never invent memories.

The system should never overstate intimacy.

The system should never create emotional pressure.

The system should never make the user feel judged.

The system should never make the recipient feel processed.

The system should create the feeling that the user had a thoughtful assistant helping them prepare.

The best AI output should feel like something the user could have written on their best day.

## Guiding Principles

### 1. Specificity Over Sentiment

Generic warmth is not enough.

Every AI generated card, briefing, suggestion, question, insight, and recommendation should prioritize specific relationship context over broad emotional language.

Bad output:

```

```

```
You mean so much to me and I hope your day is amazing.
```

Better output:

```

```

```
I still think about that weekend we spent laughing over absolutely nothing, and it reminds me how lucky I am to have you in my life.
```

The system should always prefer remembered details, shared moments, personality traits, current life context, and meaningful patterns.

### 2. Accuracy Over Creativity

The AI must never invent personal facts.

The AI must never invent shared history.

The AI must never invent recipient preferences.

The AI must never invent family details.

The AI must never invent events.

The AI must never invent emotions the user has not implied.

When context is missing, the AI should write gracefully around the missing context instead of filling the gap with false specificity.

### 3. Warmth Without Cheesiness

The brand voice is warm, personal, premium, emotionally intelligent, and human.

The AI should avoid exaggerated sentimentality.

The AI should avoid overly poetic language.

The AI should avoid greeting card clichés.

The AI should avoid therapy language unless the user relationship context clearly supports it.

The AI should avoid corporate stiffness unless the relationship is explicitly professional.

### 4. Concierge, Not Chatbot

The AI should feel proactive, prepared, and calm.

The user should not feel like they are operating a prompt box.

The frontend should not expose raw prompt mechanics.

The frontend should show polished concierge outputs, thoughtful suggestions, clear status, and simple user controls.

### 5. Quiet Intelligence

The AI should not over explain itself.

The system may show why a suggestion was made only when helpful.

Example:

```

```

```
Suggested because her birthday is in 12 days and you recently added a memory about your trip to Montauk.
```

The system should avoid technical phrases such as model output, token budget, prompt chain, embeddings, vector retrieval, or generation pipeline in the user facing product.

Technical terms may appear only in admin dashboards.

### 6. User Control

Automation must never remove user agency.

The user must be able to review drafts.

The user must be able to edit drafts.

The user must be able to approve or reject drafts.

The user must be able to turn Autopilot on or off.

The user must be able to manage recipients.

The user must be able to delete memories.

The user must be able to answer or skip questions.

The user must be able to regenerate card drafts.

The user must be able to select a different tone when appropriate.

### 7. Preserve Trust

Trust is the most important AI quality.

The system must clearly separate known information from inferred information.

The system must never present assumptions as facts.

The system must never send anything without the correct approval behavior defined elsewhere in the playbook.

The system must provide graceful fallback behavior when context is weak.

### 8. Premium Restraint

The AI should not flood the user with suggestions.

The AI should not constantly ask questions.

The AI should not over automate.

The AI should not create noisy dashboards.

The system should surface the smallest useful amount of intelligence at the right moment.

### 9. Relationship First

Every AI feature must serve the relationship.

Not productivity.

Not novelty.

Not engagement for its own sake.

Not AI visibility.

The system should help the user become more thoughtful in real life.

## Overall AI Architecture

The F.I. Forgot AI system is composed of multiple coordinated intelligence engines.

Each engine has a clear responsibility.

No single engine should own the entire user experience.

The system should operate as a layered architecture.

```

```

```
User Inputs
Recipient Data
Relationship Memories
Occasions
Calendar Events
Autopilot Settings
Fresh Updates
Profile Gap Answers
Historical Cards
User Preferences
        ↓
Context Assembly Layer
        ↓
Relationship Intelligence Engine
Memory Engine
Occasion Intelligence Engine
Event Briefing Engine
Profile Gap Question Engine
Fresh Update Engine
Follow Up Question Engine
Relationship Health Engine
        ↓
Prompt Orchestration Layer
        ↓
Model Routing Layer
        ↓
Card Generation Pipeline
Draft Evaluation Pipeline
Safety Validation Pipeline
Personalization Scoring Pipeline
        ↓
User Facing Outputs
Card Drafts
Suggested Questions
Briefings
Insights
Autopilot Recommendations
Admin Monitoring
        ↓
Human Review
User Approval
Autopilot Execution
Handwrytten Fulfillment
Analytics
Audit Logs
```

## AI System Layers

### Layer 1: Data Input Layer

The Data Input Layer gathers all information available to the AI system.

This layer includes:

```

```

```
User profile
Recipient profile
Relationship type
Important dates
Occasions
Card history
Memory timeline
Answered profile gap questions
Answered fresh update questions
Follow up question answers
Autopilot settings
Delivery preferences
Tone preferences
Things to avoid
Always include instructions
Recipient interests
Recipient personality notes
Recent updates
Past approved drafts
Past rejected drafts
Past edited drafts
Relationship health data
Calendar derived context
Subscription status
Admin controls
Feature flags
```

The Data Input Layer must never modify user data by itself.

It only gathers and normalizes information for downstream engines.

### Layer 2: Context Assembly Layer

The Context Assembly Layer converts available data into structured AI ready context.

It must produce predictable, auditable context packets.

Each context packet must include:

```

```

```
user_context
recipient_context
relationship_context
occasion_context
memory_context
recent_update_context
tone_context
avoid_context
historical_card_context
personalization_context
safety_context
metadata_context
```

The frontend does not display the raw context packet to normal users.

The admin dashboard may expose context summaries for debugging and review.

### Layer 3: Intelligence Engine Layer

The Intelligence Engine Layer interprets relationship context.

It includes:

```

```

```
Relationship Intelligence Engine
Memory Engine
Profile Gap Question Engine
Fresh Update Engine
Follow Up Question Engine
Relationship Health Engine
Event Briefing Engine
Occasion Intelligence Engine
```

These engines decide what matters, what is missing, what should be asked, what should be remembered, what should be used, and what should be avoided.

### Layer 4: Prompt Orchestration Layer

The Prompt Orchestration Layer builds the actual instructions sent to AI models.

It must enforce:

```

```

```
System level brand rules
Product philosophy
Safety requirements
Relationship specific context
Occasion specific instructions
Tone rules
Memory usage rules
Hallucination prevention rules
Output formatting rules
Quality requirements
Validation requirements
```

Prompt orchestration must be versioned.

Prompt changes must be testable.

Prompt versions must be logged.

### Layer 5: Model Routing Layer

The Model Routing Layer chooses the appropriate AI model for each task.

Routing must account for:

```

```

```
Task complexity
Required writing quality
Required reasoning quality
Latency needs
Cost sensitivity
Safety sensitivity
User facing impact
Admin only impact
Retry behavior
Fallback availability
```

High stakes user facing writing should use the highest appropriate quality model.

Simple classification, scoring, extraction, or routing tasks may use lighter models when quality remains acceptable.

### Layer 6: Generation Layer

The Generation Layer creates user facing or system facing AI outputs.

Generated outputs include:

```

```

```
Card drafts
Card alternatives
Event briefings
Profile gap questions
Fresh update questions
Follow up questions
Relationship insights
Autopilot recommendations
Personalization summaries
Admin review notes
Quality evaluation explanations
```

All generated outputs must pass validation before becoming visible or actionable.

### Layer 7: Evaluation Layer

The Evaluation Layer reviews generated outputs.

It must evaluate:

```

```

```
Accuracy
Specificity
Tone
Warmth
Personalization
Occasion fit
Relationship fit
Safety
Hallucination risk
Cliché risk
Repetition
Length
Readability
Emotional appropriateness
Policy compliance
```

Outputs that fail validation must be regenerated, downgraded to a safer fallback, sent to review, or withheld depending on severity.

### Layer 8: Automation Layer

The Automation Layer schedules and executes background intelligence.

It supports:

```

```

```
Upcoming occasion detection
Draft preparation
Question scheduling
Memory refresh prompts
Follow up prompts
Autopilot card preparation
Autopilot approval flows
Autopilot send readiness checks
Queue processing
Retry logic
Failure recovery
Notification triggers
Admin escalations
```

Automation must remain explainable and controllable.

### Layer 9: Fulfillment Layer

The Fulfillment Layer connects approved cards to Handwrytten fulfillment.

The AI system must never bypass existing fulfillment rules.

The AI system must never alter API contracts.

The AI system must respect all existing delivery, payment, card selection, approval, and subscription logic.

### Layer 10: Monitoring Layer

The Monitoring Layer gives admins visibility into AI performance.

It includes:

```

```

```
AI job status
Prompt version usage
Model usage
Token usage
Estimated cost
Latency
Failure rate
Retry rate
Draft acceptance rate
Draft edit rate
Regeneration rate
Question answer rate
Personalization score trends
Safety flags
Hallucination flags
Autopilot success rate
Human review queue
```

## End to End AI System Architecture

### Standard Card Creation Flow

The standard card creation flow begins when a user manually creates a card.

```

```

```
User selects recipient
User selects occasion
User optionally provides instructions
System loads recipient profile
System loads relationship memories
System loads relevant previous cards
System loads occasion rules
System assembles AI context
System generates draft
System evaluates draft
System scores personalization
System checks safety
System displays draft to user
User edits, regenerates, approves, or cancels
Approved card enters existing fulfillment flow
System logs outcome
System updates analytics
```

### Autopilot Card Flow

The Autopilot card flow begins before an important date.

```

```

```
Automation detects upcoming occasion
System checks Autopilot status
System checks subscription eligibility
System checks recipient eligibility
System checks delivery preference
System checks minimum lead time
System assembles relationship context
System checks whether context is strong enough
System generates event briefing
System generates draft
System evaluates draft
System scores personalization
System checks safety
System creates user review item
System notifies user if required
User approves, edits, regenerates, or skips
Approved card enters existing fulfillment flow
System logs outcome
System updates recipient history
System updates automation analytics
```

### Profile Gap Question Flow

The profile gap question flow identifies missing relationship information.

```

```

```
System reviews recipient profile
System reviews answered questions
System reviews memory timeline
System reviews upcoming occasions
System identifies missing high value context
System ranks possible questions
System selects one or more questions
System displays question at appropriate moment
User answers, skips, or dismisses
System saves answer using existing data model
System updates relationship intelligence
System updates future personalization quality
```

### Fresh Update Flow

The fresh update flow asks for recent relationship context.

```

```

```
System checks recipient activity
System checks time since last update
System checks upcoming occasions
System selects timely update prompt
System displays lightweight question
User answers, skips, or dismisses
System saves answer as recent context
System makes answer available for future drafts
System schedules future refresh timing
```

### Follow Up Question Flow

The follow up question flow revisits important relationship topics over time.

```

```

```
System identifies prior answer worth refreshing
System checks category timing
System checks last asked date
System checks user fatigue limits
System generates follow up question
System displays question at appropriate moment
User answers, skips, or dismisses
System stores new answer
System preserves prior answer history
System updates relationship timeline
```

### Relationship Health Flow

The relationship health flow estimates how complete and useful the relationship profile is.

```

```

```
System reviews relationship data completeness
System reviews memory freshness
System reviews occasion coverage
System reviews tone preferences
System reviews things to avoid
System reviews interaction frequency
System reviews card history
System calculates relationship health score
System identifies practical improvement opportunities
System displays score only where specified by playbook
System never shames the user
System suggests helpful next action
```

### Event Briefing Flow

The event briefing flow prepares the user before a meaningful occasion.

```

```

```
System detects upcoming event
System collects recipient and relationship context
System identifies relevant memories
System identifies missing context
System summarizes what matters
System suggests what to mention
System suggests what to avoid
System may ask one timely question
System prepares draft inputs
System displays briefing in user facing language
```

### Admin AI Review Flow

The admin AI review flow allows internal review of AI behavior.

```

```

```
Admin opens AI monitoring dashboard
System displays recent AI jobs
Admin filters by status, model, prompt version, feature, recipient, or user
Admin reviews context summary
Admin reviews generated output
Admin reviews validation scores
Admin reviews safety flags
Admin reviews retry history
Admin may mark reviewed
Admin may escalate issue
Admin may disable feature flag
Admin may inspect audit log
```

## Core AI Objects

### AI Job

An AI job is any discrete AI powered task.

Examples:

```

```

```
Generate card draft
Evaluate card draft
Generate event briefing
Generate profile gap question
Generate fresh update question
Generate follow up question
Score personalization
Classify memory
Summarize relationship context
Detect missing profile data
Validate safety
Route model
```

Each AI job must include:

```

```

```
job_id
job_type
user_id
recipient_id
related_card_id
related_event_id
prompt_version
model
status
started_at
completed_at
latency_ms
input_context_hash
output_hash
token_input_count
token_output_count
estimated_cost
retry_count
error_code
error_message
safety_status
quality_status
created_at
updated_at
```

### AI Context Packet

An AI context packet is the structured context sent into prompt orchestration.

It must include:

```

```

```
context_packet_id
user_id
recipient_id
occasion_type
relationship_type
context_sections
memory_ids_used
profile_answer_ids_used
fresh_update_ids_used
follow_up_answer_ids_used
prior_card_ids_used
excluded_memory_ids
things_to_avoid
confidence_summary
created_at
```

### AI Output

An AI output is the generated result.

It must include:

```

```

```
output_id
job_id
output_type
raw_output
normalized_output
display_output
quality_score
personalization_score
safety_score
hallucination_risk
tone_score
status
created_at
```

### AI Evaluation

An AI evaluation is the structured review of an AI output.

It must include:

```

```

```
evaluation_id
output_id
evaluation_type
score
passed
failure_reasons
recommended_action
created_at
```

## System Status Terms

The frontend and admin tools must use consistent AI status language.

### User Facing Statuses

Use these statuses for normal users:

```

```

```
Preparing
Ready for review
Needs your input
Approved
Scheduled
Sent
Skipped
Unable to prepare
```

Do not show:

```

```

```
Queued
Token limit exceeded
Prompt failed
Model timeout
Validation failed
Embedding lookup failed
```

### Admin Facing Statuses

Use these statuses for admin views:

```

```

```
queued
running
completed
failed
retrying
blocked
cancelled
requires_review
safety_blocked
validation_failed
fallback_used
```

## User Facing AI Language Rules

The frontend must not expose raw AI system terminology to users.

Use:

```

```

```
We are preparing this card.
We found a few details that may help.
This could be more personal with one quick answer.
Your draft is ready.
This card is ready for review.
We need your approval before sending.
```

Do not use:

```

```

```
The model is generating.
Prompt orchestration is running.
Context assembly failed.
Personalization score is low.
The AI hallucination checker failed.
Token budget exceeded.
```

## Admin Facing AI Language Rules

Admin screens may use technical language.

Admin screens should expose:

```

```

```
Prompt version
Model
Latency
Token usage
Cost
Validation result
Safety result
Retry count
Context sources
Failure reason
Feature flag state
Queue status
```

Admin screens must still avoid exposing sensitive user content unnecessarily.

Where possible, admin screens should show summaries first and raw content only behind explicit expansion controls.



## Relationship Intelligence Engine

### Purpose

The Relationship Intelligence Engine is the central decision making engine of the entire AI platform.

Every other AI engine either contributes information to it or consumes information produced by it.

Its responsibility is to understand the relationship between the user and each recipient well enough to make every interaction feel personal, timely, emotionally appropriate, and increasingly thoughtful over time.

It is not responsible for writing cards.

It is responsible for understanding relationships.

The output of this engine becomes the foundation for:

* Card generation

* Event briefings

* Follow up questions

* Profile gap questions

* Fresh update questions

* Relationship Health calculations

* Personalization scoring

* Memory prioritization

* Occasion preparation

* Concierge recommendations

* Future automation decisions

---

# Responsibilities

The Relationship Intelligence Engine continuously answers questions such as:

Who is this person?

How important are they?

How well do we know them?

What memories matter most?

What has changed recently?

What topics should be avoided?

What tone feels natural?

What has already been written?

What information is becoming stale?

What information is missing?

What should we learn next?

What should the AI mention?

What should never be mentioned?

How confident is the system?

---

# Relationship Intelligence Lifecycle

Whenever any AI task begins, the Relationship Intelligence Engine runs first.

The lifecycle is:

```text

Load recipient

↓

Load relationship profile

↓

Load memories

↓

Load events

↓

Load historical cards

↓

Load question history

↓

Load follow up history

↓

Load fresh updates

↓

Load Autopilot preferences

↓

Evaluate confidence

↓

Evaluate completeness

↓

Determine priorities

↓

Produce Relationship Intelligence Object



# Profile Gap Question Engine

## Purpose

The Profile Gap Question Engine identifies missing relationship information that would meaningfully improve future personalization.

It ensures the AI gradually learns about each recipient without overwhelming the user.

The engine exists to maximize relationship understanding while minimizing user effort.

The objective is not to collect as much information as possible.

The objective is to collect the highest value information at the right time.

---

# Philosophy

The system should feel naturally curious.

It should never feel like a survey.

It should never feel like onboarding all over again.

It should never feel repetitive.

The best question is one that:

* Feels relevant today

* Is easy to answer

* Unlocks better personalization

* Helps future cards

* Strengthens relationship understanding

Users should feel like the concierge simply wants to know one more helpful thing.

---

# Question Selection Goals

Every selected question should satisfy at least one of the following objectives.

Improve writing quality.

Improve emotional accuracy.

Improve personalization.

Reduce hallucination risk.

Increase Relationship Health.

Increase AI confidence.

Improve future occasion preparation.

Improve memory richness.

Improve Autopilot readiness.

---

# Gap Detection Process

Whenever the engine evaluates a recipient it performs:

```text

Load relationship profile

↓

Review completed profile questions

↓

Review unanswered profile questions

↓

Review memories

↓

Review fresh updates

↓

Review previous cards

↓

Review confidence score

↓

Review upcoming occasions

↓

Review relationship stage

↓

Calculate highest value missing information

↓

Select best question

```

---

# Information Priority

Not all missing information has equal value.

Questions are ranked using weighted importance.

Highest Priority

Things to avoid

Favorite memories

Always include

Preferred tone

Personality traits

Relationship milestones

Communication preferences

Medium Priority

Interests

Favorite activities

Favorite traditions

Important people

Travel memories

Career details

Pet information

Lifestyle preferences

Lower Priority

Favorite foods

Favorite colors

Entertainment preferences

Small hobbies

General interests already inferred elsewhere

---

# Question Inventory

The engine works from an approved library of profile questions.

Examples include:

Tell me about one memory together you'll never forget.

Is there anything they would hate seeing in a card?

How would you describe their personality?

What makes them laugh?

What do they care about most?

How emotionally expressive are they?

What traditions matter to them?

How would you describe your relationship today?

What accomplishments are they proud of?

What topics should always be included?

What tone feels most natural?

What should never be mentioned?

The library may expand over time through feature flags.

---

# Dynamic Question Selection

Questions are never simply asked in order.

Selection considers:

Upcoming occasions

Recent answers

Relationship stage

User fatigue

Previous skips

Confidence score

Relationship Health

Recent memory activity

Autopilot usage

Subscription level

The result is a personalized question queue.

---

# Question Fatigue Prevention

The engine should aggressively avoid fatigue.

Rules include:

Never ask multiple profile questions during the same session unless explicitly requested.

Avoid asking similar questions within sixty days.

Avoid asking questions after recent skips.

Pause after multiple unanswered prompts.

Reduce frequency for inactive recipients.

Increase spacing for low engagement users.

Favor quality over quantity.

---

# Smart Timing

Questions appear during natural pauses.

Examples include:

After approving a card

After creating a recipient

While reviewing a timeline

When viewing Relationship Health

After adding a memory

Several weeks before an important occasion

While browsing recipient details

Questions should never interrupt card editing.

Questions should never appear during payment.

Questions should never block completion of another task.

---

# Question Expiration

Each generated question has a lifecycle.

States include:

Available

Viewed

Answered

Skipped

Dismissed

Expired

Archived

Expired questions may later return if they remain valuable.

---

# Question Confidence

The engine assigns a confidence value to every question recommendation.

High Confidence

Question clearly fills a critical gap.

Medium Confidence

Helpful but optional.

Low Confidence

Only shown when better questions do not exist.

Very Low Confidence

Do not display.

---

# Adaptive Questioning

The engine adapts based on previous answers.

Example:

If the user already described personality in detail, future questions shift toward memories instead.

If communication preferences are well understood, questions focus on recent life updates.

The objective is continuous learning without redundancy.

---

# Relationship Stage Behavior

New Relationship

Ask foundational questions.

Growing Relationship

Focus on shared memories.

Established Relationship

Focus on deeper emotional context.

Deep Relationship

Focus on recent changes.

Legacy Relationship

Focus on preserving history and traditions.

---

# Fresh Update Engine

## Purpose

The Fresh Update Engine keeps relationship information current.

Unlike Profile Gap Questions, which gather foundational knowledge, Fresh Updates collect recent life events.

The engine helps cards feel timely.

---

# Philosophy

Relationships evolve.

The AI should evolve with them.

Knowing someone's favorite hobby is useful.

Knowing they just became a grandparent is transformative.

Fresh Updates ensure every card reflects today's relationship rather than last year's.

---

# Fresh Update Categories

Examples include:

Recent accomplishment

Recent vacation

Family news

Health update

Career change

New hobby

Major purchase

Loss

Celebration

Graduation

Promotion

Move

Pet update

New relationship

Retirement

Holiday plans

Personal goal

Unexpected challenge

Recent funny moment

General life update

---

# Update Selection Process

```text

Review relationship

↓

Review previous updates

↓

Check freshness

↓

Check upcoming events

↓

Evaluate missing recent context

↓

Generate best update prompt

```

---

# Freshness Rules

Fresh Updates become less valuable over time.

Suggested freshness windows:

Thirty days

Ninety days

Six months

One year

Historical

Older updates remain searchable but gradually receive lower retrieval priority.

---

# Timing Rules

Fresh Updates appear:

Thirty to sixty days before birthdays

Before holidays

After long periods of inactivity

After significant timeline gaps

Following major life events

When Relationship Health drops

When Autopilot lacks recent context

The engine should avoid clustering multiple prompts together.

---

# Update Prompt Examples

How have things been going lately?

Anything exciting happen recently?

Have they picked up any new hobbies?

Any big family news?

Did anything happen recently you'd love to mention in their next card?

Has work changed for them lately?

Anything new you'd want future cards to remember?

---

# Lightweight Design

Fresh Updates should always feel easier than Profile Questions.

Most should require one sentence or less.

The interface should encourage fast completion.

---

# Update Storage

Each update stores:

```text

update_id

recipient_id

created_date

effective_date

category

summary

full_text

importance

freshness

confidence

source

last_used

times_used

```

---

# Fresh Update Decay

As updates age they gradually lose retrieval priority.

Recent updates receive preference.

Older updates remain available for historical context.

The engine never permanently deletes updates without explicit user action.

---

# Follow Up Question Engine

## Purpose

The Follow Up Question Engine deepens previously collected information.

Rather than asking unrelated questions, it revisits existing knowledge at appropriate times.

This creates the feeling that the concierge remembers previous conversations.

---

# Philosophy

A thoughtful concierge follows up.

It does not repeatedly ask strangers' questions.

Example:

Initial answer:

"They started a new bakery."

Future follow up:

How is the bakery going?

Instead of:

What do they do for work?

The engine values continuity.

---

# Follow Up Eligibility

Follow ups may be created when:

An answer is aging.

A major milestone approaches.

A previous answer suggested future developments.

A recent card referenced the topic.

The user frequently discusses the recipient.

Relationship Health recommends refreshing context.

---

# Follow Up Categories

Career

Children

Marriage

Health

Travel

Retirement

Education

Pets

Sports

Creative projects

Business

Home

Volunteer work

Goals

Traditions

Family

Hobbies

Achievements

Challenges

Losses

Celebrations

---

# Follow Up Timing

Suggested timing varies.

Career updates

Every six to twelve months.

Health challenges

Only when appropriate.

New babies

Several months later.

Business launches

Three to six months later.

Retirement

Annually.

Travel plans

Near relevant holidays.

The engine always prioritizes appropriateness over rigid schedules.

---

# Intelligent Continuity

The engine links follow ups directly to previous answers.

Example chain:

Question

How was retirement?

↓

Answer

They retired last summer.

↓

Follow up

How has retirement been treating them?

↓

Later follow up

Have they picked up any new hobbies since retiring?

This creates an evolving relationship narrative.

---

# Follow Up Suppression

The engine suppresses follow ups when:

The user skipped multiple previous prompts.

The topic became irrelevant.

The recipient was archived.

The relationship is inactive.

A newer answer already replaced the older one.

Another engine selected a higher priority question.

---

# Follow Up Lifecycle

States include:

Eligible

Scheduled

Displayed

Answered

Skipped

Deferred

Expired

Archived

Only one active follow up should exist for the same underlying topic at a time.

---

# Relationship Context Updates

Whenever a follow up is answered:

Relationship Intelligence refreshes.

Confidence recalculates.

Relationship Health updates.

Timeline grows.

Memory retrieval improves.

Future personalization improves.

Autopilot context improves.

The answer becomes immediately available to downstream AI pipelines.



# Relationship Health Engine

## Purpose

The Relationship Health Engine evaluates the completeness, freshness, and usefulness of the information available for each relationship.

It does not measure the quality of the user's actual relationship.

It measures how well F.I. Forgot understands that relationship.

The purpose is to help the AI know when it has enough context to create exceptional cards and when additional information would meaningfully improve personalization.

Relationship Health is an internal intelligence metric that is selectively surfaced to users as encouragement, never as judgment.

---

# Philosophy

Relationship Health should motivate.

It should never shame.

The system should celebrate progress rather than highlight deficiencies.

A user should feel that they are gradually building a richer relationship history, not completing a checklist.

Health should improve naturally through normal product use.

Creating cards.

Adding memories.

Answering questions.

Updating recipient information.

Logging meaningful moments.

These actions should all strengthen Relationship Health.

---

# Core Principles

Relationship Health is:

Dynamic

Relationship specific

Always improving

Evidence based

Transparent

Actionable

Relationship Health is not:

A popularity score

A measure of love

A measure of communication frequency

A social ranking

A gamification mechanic

A replacement for human relationships

---

# Health Calculation Inputs

Relationship Health is calculated using multiple weighted categories.

Example categories include:

Recipient profile completeness

Profile Gap Question completion

Fresh Update recency

Memory richness

Memory freshness

Timeline density

Important date coverage

Communication preferences

Personality understanding

Writing preferences

Topics to avoid

Always include instructions

Card history

Autopilot readiness

Historical continuity

AI confidence

Question diversity

Follow Up completion

Relationship stage

No single category dominates the score.

---

# Suggested Weight Distribution

Example weighting:

```text

Recipient Profile                 10%

Important Dates                   10%

Profile Questions                 15%

Fresh Updates                     10%

Memory Quality                    20%

Memory Freshness                  10%

Writing Preferences               10%

Follow Up Coverage                 5%

Timeline Richness                 10%

Historical Card Context           10%

```

Engineering may adjust weighting through configuration without changing user facing behavior.

---

# Health Score Scale

0 to 20

Very Limited Context

Cards remain generic.

21 to 40

Basic Understanding

Some personalization available.

41 to 60

Developing Relationship

Useful memories exist.

61 to 80

Strong Relationship Profile

Highly personalized writing.

81 to 100

Concierge Ready

Rich context across multiple years.

Excellent personalization potential.

---

# Health Components

## Profile Completeness

Measures:

Basic information

Relationship type

Important dates

Tone preferences

Personality notes

Things to avoid

Always include

Communication preferences

---

## Memory Quality

Evaluates:

Meaningful experiences

Emotional depth

Specificity

Variety

Importance

Relationship relevance

Unique stories

Shared experiences

---

## Memory Freshness

Evaluates:

Recent updates

Current life information

Recent memories

Current interests

Recent accomplishments

Recent challenges

Recent celebrations

---

## Timeline Richness

Evaluates:

Number of timeline entries

Distribution over time

Coverage across years

Major milestones

Life events

Traditions

Repeated annual moments

---

## Writing Readiness

Evaluates:

Preferred tone

Topics to avoid

Things to include

Emotional openness

Communication style

Recipient preferences

---

## Historical Context

Evaluates:

Previous cards

Editing history

Approved drafts

Rejected drafts

Repeated themes

Writing evolution

---

# Health Improvement Suggestions

The engine produces recommended actions.

Examples:

Add one shared memory.

Answer one profile question.

Update what has changed recently.

Add their favorite tradition.

Tell us about a funny story.

Update their hobbies.

Confirm communication preferences.

Refresh recent life events.

Only the highest value recommendation should appear at one time.

---

# Positive Reinforcement

Health improvements should celebrate progress.

Examples:

Your relationship profile keeps getting stronger.

Future cards just became more personal.

Nice. We now understand this relationship much better.

That memory will help future cards feel even more thoughtful.

Avoid numerical obsession.

The emphasis is progress.

---

# Health Refresh Triggers

Relationship Health recalculates whenever:

A memory is added.

A memory is edited.

A memory is deleted.

A Profile Gap Question is answered.

A Fresh Update is answered.

A Follow Up is answered.

A card is approved.

A recipient is updated.

Relationship settings change.

Historical data imports complete.

---

# Stale Health Detection

The engine identifies relationships becoming stale.

Indicators include:

No recent updates.

Old memories only.

No recent cards.

Large timeline gaps.

Aging profile information.

Missing recent milestones.

Rather than lowering Health aggressively, the engine gradually recommends refreshing information.

---

# Relationship Health Object

Example structure:

```text

relationship_health_id

recipient_id

overall_score

profile_score

memory_score

freshness_score

timeline_score

writing_score

history_score

confidence_score

recommended_action

recommended_question

last_calculated

version

```

---

# Event Briefing Engine

## Purpose

The Event Briefing Engine prepares the AI before any meaningful occasion.

It gathers relationship context and converts it into a concise briefing used by downstream AI systems.

The briefing is optimized for writing.

It is not optimized for user reading.

User friendly summaries may be derived later.

---

# Philosophy

Before writing a thoughtful card, a thoughtful person mentally reviews:

Who is this?

What has happened recently?

What matters most?

What should I mention?

What should I avoid?

The Event Briefing Engine performs this preparation automatically.

---

# Event Briefing Lifecycle

```text

Occasion detected

↓

Relationship loaded

↓

Memories collected

↓

Recent updates collected

↓

Historical cards reviewed

↓

Question history reviewed

↓

Relationship Health reviewed

↓

Occasion Intelligence consulted

↓

Briefing assembled

↓

Writing pipeline begins

```

---

# Briefing Sections

Every briefing contains standardized sections.

Recipient Summary

Relationship Summary

Occasion Context

Recent Updates

Important Memories

Personality Notes

Preferred Tone

Topics To Avoid

Always Include

Historical Writing Notes

Suggested Themes

Confidence Summary

Missing Information

Writing Constraints

---

# Recipient Summary

Concise description of the recipient.

Example:

```text

Brother.

Recently promoted.

Loves fishing.

Dry sense of humor.

Values family traditions.

```

---

# Relationship Summary

Example:

```text

Very close relationship.

Frequent cards.

Many vacation memories.

Strong history of playful writing.

User often edits cards to make them slightly shorter.

```

---

# Occasion Context

Includes:

Occasion type

Occasion importance

Relationship relevance

Previous celebration history

Past themes used

Seasonality

Special considerations

---

# Recent Updates

Limited to the highest value updates.

Example:

Started a new business.

Finished a marathon.

Bought their first home.

Expecting a baby.

Recovered from surgery.

Only relevant updates are included.

---

# Important Memories

The engine retrieves:

Emotionally significant memories.

Recently referenced memories.

Occasion relevant memories.

Pinned memories.

User favorites.

The briefing should include summaries rather than raw text whenever possible.

---

# Suggested Themes

The engine proposes themes.

Examples:

Gratitude

Pride

Celebration

Encouragement

Reflection

Humor

Adventure

Family

Growth

Tradition

The Card Generation Pipeline may use one or more themes.

---

# Writing Constraints

Constraints include:

Avoid divorce references.

Avoid mentioning age.

Mention grandchildren.

Keep humorous.

Do not mention health.

Avoid politics.

Do not reference previous card wording.

Keep under preferred length.

These constraints become hard prompt requirements.

---

# Missing Information

If important context is unavailable:

The engine records the gap.

Example:

No recent life updates.

No communication preference.

No favorite memory available.

The writing pipeline may compensate conservatively.

---

# Briefing Confidence

Every briefing receives a confidence score.

Very High

High

Moderate

Low

Very Low

Low confidence briefings reduce personalization depth automatically.

---

# Occasion Intelligence Engine

## Purpose

The Occasion Intelligence Engine understands what makes each occasion unique.

It provides the emotional framework for writing.

A birthday should not feel like an anniversary.

A sympathy card should not resemble a graduation card.

Each occasion carries its own emotional expectations.

---

# Supported Occasions

Birthday

Anniversary

Wedding

Graduation

New Baby

Sympathy

Get Well

Thinking of You

Congratulations

Promotion

Retirement

Christmas

Hanukkah

Thanksgiving

Mother's Day

Father's Day

Valentine's Day

Just Because

Friendship

Apology

Encouragement

Custom occasions

Additional occasions may be introduced through feature flags.

---

# Occasion Profiles

Every occasion defines:

Purpose

Expected tone

Appropriate themes

Common mistakes

Writing constraints

Typical memories

Recommended length

Recommended warmth

Humor tolerance

Formality level

Emotional intensity

---

# Birthday Example

Purpose

Celebrate the individual.

Recommended themes

Growth

Friendship

Gratitude

Shared memories

Future wishes

Avoid

Generic birthday clichés.

Overly formal language.

Excessive sentiment for casual relationships.

---

# Sympathy Example

Purpose

Offer comfort.

Recommended themes

Presence

Support

Memory

Compassion

Quiet encouragement

Avoid

False optimism.

Minimizing loss.

Humor unless clearly appropriate.

Making the message about the sender.

---

# Occasion Rules

Each occasion includes structured rules.

Example:

```text

occasion

allowed_themes

disallowed_themes

preferred_length

preferred_warmth

recommended_memory_types

humor_level

emotion_level

urgency

fallback_style

```

These rules become mandatory inputs during prompt orchestration.

---

# Occasion Modifiers

Occasions may be modified by additional context.

Examples:

Milestone birthday.

First Mother's Day.

Retirement after forty years.

Wedding anniversary after loss.

Graduation during difficult circumstances.

Birthday after recent illness.

Modifiers enrich writing without changing the core occasion.

---

# Seasonal Awareness

Occasion Intelligence understands seasonality.

Examples:

Christmas traditions.

Summer birthdays.

Holiday travel.

Graduation season.

Back to school.

The system may incorporate seasonal context when appropriate.

Never force seasonal references when irrelevant.

---

# Occasion Readiness

Before writing begins, the engine evaluates whether enough context exists.

Checks include:

Relevant memories available.

Recent updates available.

Tone preferences known.

Writing constraints available.

Important dates confirmed.

Confidence acceptable.

If readiness is insufficient, downstream engines reduce personalization rather than fabricate details.



# Card Generation Pipeline

## Purpose

The Card Generation Pipeline transforms structured relationship intelligence into a thoughtful, emotionally appropriate greeting card draft.

It is the primary user facing AI workflow.

Every stage exists to maximize personalization while minimizing hallucination, repetition, and generic writing.

The pipeline must produce drafts that feel as though they were written by someone who genuinely knows the recipient.

The pipeline should never reveal its internal reasoning to the user.

---

# Pipeline Overview

```text

User Request

↓

Relationship Intelligence

↓

Memory Retrieval

↓

Occasion Intelligence

↓

Event Briefing

↓

Context Assembly

↓

Prompt Orchestration

↓

Model Routing

↓

Draft Generation

↓

Draft Evaluation

↓

Personalization Scoring

↓

Safety Validation

↓

Tone Validation

↓

Writing Validation

↓

Final Draft

↓

User Review

```

Each stage is independent and observable by administrators.

Failures at one stage should not automatically terminate the entire pipeline.

---

# Pipeline Goals

The pipeline should consistently produce drafts that are:

Emotionally appropriate

Relationship specific

Occasion appropriate

Factually accurate

Free of hallucinations

Free of repetitive wording

Free of greeting card clichés

Consistent with recipient preferences

Consistent with user editing history

Natural sounding

Warm

Authentic

---

# Draft Creation Stages

## Stage 1

Request Validation

The system validates:

Recipient exists.

Occasion exists.

Subscription is active.

Required data is present.

Delivery rules are satisfied.

No conflicting automation exists.

If validation fails, the user receives a friendly explanation rather than a technical error.

---

## Stage 2

Relationship Intelligence Retrieval

Load:

Relationship profile

Relationship stage

Relationship Health

Confidence

Recent activity

Relationship summary

Recommended memories

Writing preferences

Communication style

---

## Stage 3

Memory Retrieval

Retrieve the highest value memories.

Selection prioritizes:

Occasion relevance

Importance

Freshness

Emotional significance

Historical success

Pinned memories

Recently updated memories

Recently approved edits

Maximum retrieval count should remain configurable.

---

## Stage 4

Occasion Intelligence

Load occasion profile.

Determine:

Tone

Length

Emotional intensity

Humor tolerance

Suggested themes

Required constraints

---

## Stage 5

Event Briefing

Generate the complete briefing package.

This briefing becomes the foundation for prompt orchestration.

---

## Stage 6

Context Assembly

Merge:

Relationship data

Memory summaries

Occasion rules

Recent updates

Historical writing notes

Writing preferences

Topics to avoid

Always include instructions

Autopilot preferences

User custom instructions

Only relevant context should be included.

---

## Stage 7

Prompt Construction

The Prompt Orchestration Layer builds the final prompt package.

The system should never expose prompt text in the consumer interface.

---

## Stage 8

Model Selection

Route to the appropriate AI model.

Selection depends upon:

Writing quality requirements

Latency goals

Fallback availability

Feature flags

Prompt version

---

## Stage 9

Draft Generation

The AI produces:

Primary draft

Optional internal metadata

No chain of thought is stored or displayed.

---

## Stage 10

Evaluation

Draft Evaluation Engine reviews output.

Checks include:

Personalization

Accuracy

Warmth

Readability

Repetition

Safety

Occasion fit

Relationship fit

Hallucination risk

Grammar

---

## Stage 11

Final Formatting

Normalize:

Spacing

Paragraphs

Quotation marks

Emoji rules

Greeting format

Closing format

Length

---

## Stage 12

Presentation

Display polished draft.

Available actions:

Approve

Edit

Regenerate

Save

Cancel

Preview handwriting

Select card

Schedule

---

# Draft Objectives

Every draft should satisfy five objectives.

## Authenticity

Should sound human.

Never robotic.

Never promotional.

Never AI generated.

---

## Personalization

Should mention meaningful details.

Should avoid empty compliments.

Specificity is preferred over sentiment.

---

## Emotional Accuracy

The emotional tone should match:

Occasion

Relationship

Recipient personality

Recent events

---

## Readability

Writing should be:

Natural

Concise

Easy to read aloud

Appropriately paced

---

## Confidence

The AI should only make statements supported by available context.

---

# Greeting Construction

Opening greetings should vary.

Avoid repeated phrases.

Examples include:

Happy Birthday.

Thinking of you today.

Congratulations on such an incredible milestone.

Wishing you a wonderful anniversary.

Just wanted you to know I was thinking about you.

Variation should occur naturally.

---

# Closing Construction

Closings should also vary.

Examples:

Love,

With appreciation,

Thinking of you,

Proud of you,

Always grateful,

Best wishes,

See you soon,

Take care,

Selection depends on relationship.

---

# Length Targets

Cards are grouped into approximate length profiles.

Short

50 to 90 words.

Standard

90 to 150 words.

Extended

150 to 250 words.

Custom lengths remain configurable.

---

# Memory Usage Rules

The AI should generally reference:

One major memory

One recent update

One future looking statement

Not every card requires all three.

Quality outweighs quantity.

---

# Memory Repetition Rules

Avoid repeating:

The same vacation.

The same inside joke.

The same accomplishment.

The same opening.

The same closing.

Historical card usage influences future retrieval.

---

# User Editing Learning

When users consistently edit drafts:

Patterns are recorded.

Examples:

Always shorter.

Less emotional.

More humorous.

Avoid exclamation points.

More formal.

These patterns influence future drafts without rewriting historical cards.

---

# Regeneration

Regeneration creates a new draft.

It should not simply reword sentences.

Instead it should explore:

Different structure.

Different memories.

Different emotional angle.

Different pacing.

Different opening.

Different closing.

Different emphasis.

---

# Prompt Orchestration

## Purpose

Prompt Orchestration transforms structured relationship data into consistent AI instructions.

It ensures every generation follows product philosophy regardless of model.

Prompt construction must remain deterministic.

---

# Prompt Hierarchy

The hierarchy defines instruction precedence.

Highest Priority

System Safety Rules

Brand Philosophy

Legal Requirements

Writing Constraints

Topics To Avoid

Always Include

Relationship Context

Occasion Rules

User Instructions

Stylistic Variation

Lowest Priority

Creative flexibility.

Higher levels always override lower levels.

---

# Prompt Components

Every writing prompt is assembled from reusable modules.

Core modules include:

Brand identity

Relationship context

Occasion guidance

Memory summaries

Fresh updates

Historical writing patterns

Tone guidance

Writing constraints

Output format

Safety instructions

Quality requirements

Prompt modules remain independently versioned.

---

# Prompt Assembly

Prompt construction follows:

```text

Load modules

↓

Apply hierarchy

↓

Remove duplicate instructions

↓

Resolve conflicts

↓

Trim unnecessary context

↓

Validate completeness

↓

Generate final prompt

```

---

# Context Budget

Prompt size should remain efficient.

Priority order:

Critical instructions

Recipient summary

Relationship summary

Important memories

Recent updates

Occasion rules

Historical writing preferences

Older context is trimmed first.

---

# Conflict Resolution

Conflicts may occur.

Example:

User instruction:

Keep it funny.

Writing constraint:

Recipient dislikes humor.

Writing constraint wins.

---

# Prompt Metadata

Every generated prompt records:

```text

prompt_id

prompt_version

assembly_version

module_versions

model

timestamp

context_hash

estimated_tokens

feature_flags

generation_type

```

Prompt text itself may be retained according to privacy policies and administrative settings.

---

# Prompt Versioning

Every prompt template receives a semantic version.

Example:

Version 1.0.0

Initial production.

Version 1.1.0

Improved birthday guidance.

Version 1.2.0

Improved sympathy tone.

Version 2.0.0

Major architectural update.

Prompt versions must never be silently overwritten.

---

# Version Rollout

Rollouts support:

Internal testing.

Percentage rollout.

Subscription tier rollout.

Feature flag rollout.

Staff only rollout.

Emergency rollback.

---

# Prompt Testing

New prompt versions require evaluation before production.

Testing compares:

Writing quality.

Personalization.

Acceptance rate.

Edit frequency.

Regeneration frequency.

Safety.

Latency.

Cost.

Hallucination rate.

Regression detection should occur automatically where possible.

---

# Regression Library

Maintain a permanent library of representative scenarios.

Examples:

New friend birthday.

Spouse anniversary.

Coworker promotion.

Sympathy after loss.

Father's Day.

Mother's Day.

Graduation.

Christmas.

Thinking of You.

Each new prompt version should be evaluated against the same scenarios.

---

# Golden Outputs

A subset of scenarios should include approved reference drafts.

Prompt updates should compare new output against these high quality benchmarks.

Large deviations require review.

---

# AI Model Routing

## Purpose

Different AI tasks require different capabilities.

The routing layer determines which model should perform each task while balancing quality, speed, and cost.

Routing decisions are abstracted from the frontend.

Users should never manually choose a model.

---

# Routing Inputs

Task type.

Complexity.

Latency target.

Estimated token usage.

Confidence requirement.

Fallback availability.

Feature flags.

Subscription tier if applicable.

---

# Example Task Categories

Relationship summarization.

Memory classification.

Question generation.

Card generation.

Safety review.

Personalization scoring.

Quality evaluation.

Analytics.

Administrative summaries.

Not every task requires the highest capability model.

---

# Routing Rules

High impact user facing writing receives highest priority.

Background summarization prioritizes efficiency.

Classification tasks prioritize speed.

Safety validation prioritizes reliability.

The routing engine remains configurable without frontend changes.

---

# Routing Metadata

Each decision stores:

```text

routing_id

task_type

selected_model

fallback_model

selection_reason

expected_latency

expected_cost

routing_version

timestamp

```

This information supports monitoring and future optimization.



# Context Assembly Engine

## Purpose

The Context Assembly Engine is responsible for building the complete information package used by the AI before any generation task begins.

It acts as the bridge between stored relationship data and prompt orchestration.

Rather than passing entire database records to the AI, the engine carefully selects only the information that is relevant to the current task.

The objective is to maximize personalization while minimizing unnecessary context, latency, cost, and conflicting information.

---

# Philosophy

More information does not necessarily create better writing.

The AI should receive:

The right information.

At the right time.

In the right order.

Only the information that improves the final result should be included.

---

# Context Assembly Lifecycle

```text

Receive AI Request

↓

Determine Generation Type

↓

Identify Required Context Sources

↓

Retrieve Context

↓

Prioritize Context

↓

Remove Redundancy

↓

Apply Writing Constraints

↓

Calculate Context Confidence

↓

Assemble Context Packet

↓

Validate Completeness

↓

Pass To Prompt Orchestration

```

---

# Context Sources

The engine may retrieve information from:

Recipient Profile

Relationship Profile

Relationship Intelligence

Memory Engine

Timeline

Fresh Updates

Follow Up Answers

Historical Cards

Occasion Intelligence

Event Briefing

Autopilot Preferences

User Writing Preferences

Topics To Avoid

Always Include Instructions

Relationship Health

Calendar Events

System Configuration

Feature Flags

Administrative Overrides

Only the minimum necessary context should be included.

---

# Context Prioritization

When context exceeds the desired size, information is prioritized.

Priority Order

Critical safety rules

Writing constraints

Topics to avoid

Always include instructions

Occasion rules

Recipient summary

Relationship summary

Recent life updates

High importance memories

Pinned memories

Relevant historical writing

Supporting memories

Older historical context

Low value metadata

---

# Context Windows

Different AI tasks require different context windows.

Examples:

Card Generation

Largest context window.

Profile Question Selection

Smaller context focused on missing information.

Fresh Update Selection

Focused on recent activity only.

Relationship Health

Profile completeness and historical metrics.

Memory Classification

Single memory plus recipient context.

Each task has independently configurable context limits.

---

# Context Compression

When excessive information exists, compression techniques may be applied.

Examples:

Summarize multiple related memories.

Merge similar updates.

Collapse repeated events.

Remove duplicate instructions.

Summarize historical cards.

Condense timeline segments.

Compression should never remove unique emotional context.

---

# Context Validation

Before prompt construction begins, validation checks include:

Recipient exists.

Occasion exists.

Relationship profile available.

Required dates available.

Safety constraints loaded.

Writing constraints loaded.

Context confidence above minimum threshold.

If validation fails, fallback behavior is triggered.

---

# Context Versioning

Every assembled packet receives:

```text

context_packet_id

assembly_version

creation_timestamp

generation_type

context_sources

compression_level

estimated_tokens

confidence_score

feature_flags

```

This allows complete auditing of every AI request.

---

# Memory Retrieval Engine

## Purpose

The Memory Retrieval Engine identifies the memories most likely to improve a specific AI task.

Rather than retrieving every stored memory, it performs intelligent ranking and selection.

The quality of retrieval has a greater impact on personalization than simply increasing context size.

---

# Retrieval Objectives

Retrieve memories that are:

Relevant

Specific

Meaningful

Emotionally appropriate

Current when necessary

Historically significant

Not repetitive

Previously successful

---

# Retrieval Factors

Each candidate memory is scored using multiple signals.

Importance

Freshness

Occasion relevance

Relationship relevance

Semantic similarity

Timeline proximity

Historical usage

Pinned status

User emphasis

AI confidence

Every signal contributes to a composite retrieval score.

---

# Occasion Aware Retrieval

Memory selection changes depending on occasion.

Birthday

Funny stories

Shared adventures

Recent accomplishments

Anniversary

Relationship milestones

Shared traditions

Meaningful trips

Graduation

Growth

Achievements

Future aspirations

Sympathy

Supportive memories

Positive legacy

Acts of kindness

The retrieval engine should adapt automatically.

---

# Diversity Rules

Avoid retrieving memories that all describe the same event.

Example:

Trip to Italy.

Rome vacation.

Italian honeymoon.

These should generally count as one primary topic unless multiple perspectives add value.

The goal is variety.

---

# Recency Balancing

Recent memories are valuable.

Older memories often carry greater emotional significance.

The retrieval engine balances both.

Example:

One childhood story.

One recent accomplishment.

One future looking thought.

This combination often produces the strongest personalization.

---

# Historical Usage Penalty

Frequently reused memories gradually receive a retrieval penalty.

This encourages writing variety.

Pinned memories remain exempt.

---

# Confidence Thresholds

Low confidence memories are handled conservatively.

Very High

May be referenced directly.

High

Preferred for personalization.

Moderate

Used when relevant.

Low

Only referenced if necessary.

Very Low

Excluded from generation.

---

# Retrieval Metadata

Each retrieval operation stores:

```text

retrieval_id

generation_id

selected_memory_ids

rejected_memory_ids

ranking_scores

retrieval_version

timestamp

```

---

# Personalization Engine

## Purpose

The Personalization Engine determines how deeply the generated output should personalize its writing.

It balances available relationship knowledge with confidence.

More personalization is not always better.

Accurate personalization is always better.

---

# Personalization Philosophy

Personalization should feel earned.

The AI should never pretend to know more than it actually knows.

When little context exists, elegant simplicity is preferable to fabricated detail.

---

# Personalization Dimensions

The engine evaluates:

Relationship depth

Memory richness

Recent updates

Tone preferences

Shared experiences

Personality understanding

Communication style

Historical editing patterns

Relationship stage

Confidence

These dimensions collectively determine personalization intensity.

---

# Personalization Levels

Level 1

Minimal personalization.

Basic relationship information only.

Level 2

General relationship context.

Limited shared experiences.

Level 3

Multiple meaningful references.

Specific memories.

Recognizable relationship voice.

Level 4

Rich personalization.

Recent updates.

Historical continuity.

Relationship traditions.

Level 5

Exceptional personalization.

Feels handwritten specifically for that recipient.

---

# Personalization Signals

Examples include:

Specific memory references.

Mentioning traditions.

Matching recipient humor.

Respecting communication preferences.

Avoiding disliked topics.

Reflecting recent life events.

Matching historical writing style.

Using naturally recurring themes.

---

# Personalization Constraints

The engine must never:

Invent details.

Invent conversations.

Invent shared experiences.

Invent emotions.

Invent family members.

Invent hobbies.

Invent accomplishments.

If context is weak, personalization should decrease gracefully.

---

# Personalization Expansion

When confidence is high, the engine may connect multiple pieces of context.

Example:

Fishing tradition.

Recent retirement.

Grandchildren.

Together these create a cohesive narrative.

The AI should never create unsupported links between unrelated facts.

---

# User Preference Learning

The engine learns from user behavior.

Examples:

Consistently removing humor.

Adding more emotional language.

Making cards shorter.

Using specific nicknames.

Avoiding formal closings.

These observations influence future personalization.

---

# Personalization Metadata

Every generation records:

```text

personalization_id

personalization_score

relationship_depth

memory_strength

confidence_level

editing_adjustments

retrieval_quality

timestamp

```

---

# Confidence Scoring Engine

## Purpose

The Confidence Scoring Engine estimates how trustworthy the assembled context is before writing begins.

Confidence measures certainty.

It does not measure writing quality.

---

# Confidence Sources

Confidence is influenced by:

Verified profile information.

Answered questions.

Recent updates.

Memory consistency.

Historical card history.

User edits.

Timeline continuity.

Contradictions.

Data age.

Administrative overrides.

---

# Confidence Categories

Very High

High

Moderate

Low

Very Low

Confidence is calculated before prompt construction.

---

# Confidence Adjustments

Increase confidence when:

Recent answers exist.

Multiple sources agree.

User repeatedly confirms information.

Pinned memories exist.

Historical cards reinforce the same facts.

Decrease confidence when:

Information is several years old.

Contradictory memories exist.

Only inferred information exists.

Recent deletions occurred.

Multiple profile fields remain incomplete.

---

# Confidence Influence

Confidence affects:

Memory retrieval.

Prompt construction.

Writing boldness.

Question generation.

Autopilot readiness.

Relationship Health.

Personalization level.

Low confidence always results in more conservative writing.

---

# Confidence Object

```text

confidence_id

overall_confidence

profile_confidence

memory_confidence

timeline_confidence

freshness_confidence

writing_confidence

calculation_version

timestamp

```

---

# Personalization Scoring Engine

## Purpose

After a draft is generated, the Personalization Scoring Engine evaluates how effectively the writing reflects the actual relationship.

Unlike Confidence, which measures certainty before writing, Personalization measures the quality of the finished draft.

---

# Scoring Dimensions

The engine evaluates:

Specificity

Memory usage

Recent relevance

Relationship voice

Tone consistency

Emotional authenticity

Writing uniqueness

Historical variation

Occasion alignment

Constraint compliance

---

# Example Scoring Rubric

Specificity

0 to 20

Relationship Voice

0 to 20

Memory Integration

0 to 20

Occasion Alignment

0 to 15

Tone

0 to 15

Originality

0 to 10

Constraint Compliance

0 to 10

Maximum Score

100

---

# Low Personalization Detection

Indicators include:

Generic compliments.

No specific memories.

No relationship context.

Repeated phrases.

Template language.

Universal statements.

Cards receiving low personalization scores should be regenerated automatically when appropriate.

---

# High Personalization Indicators

References meaningful shared experiences.

Feels recipient specific.

Uses current context.

Reflects relationship history.

Maintains natural flow.

Avoids forced specificity.

Balances emotion with authenticity.

---

# Score Storage

Each evaluation records:

```text

personalization_score_id

draft_id

overall_score

dimension_scores

evaluation_version

regeneration_recommended

timestamp

```

These scores support future analytics, experimentation, and continuous improvement.



# Draft Quality Evaluation Engine

## Purpose

The Draft Quality Evaluation Engine performs an objective review of every generated draft before it is presented to the user.

Generation and evaluation are intentionally separated.

A model capable of producing high quality writing can still occasionally produce weak output.

The evaluation layer exists to detect those weaknesses before the user sees them.

---

# Philosophy

Generating a draft is only the beginning.

Every draft must earn the right to be shown.

The evaluation engine should function like an experienced editor reviewing every message before it leaves the concierge's desk.

---

# Evaluation Pipeline

```text

Draft Generated

↓

Grammar Review

↓

Relationship Review

↓

Occasion Review

↓

Personalization Review

↓

Tone Review

↓

Safety Review

↓

Hallucination Review

↓

Quality Score

↓

Pass

or

Regenerate

or

Human Review

```

---

# Evaluation Categories

Every draft is evaluated across multiple dimensions.

Grammar

Readability

Relationship Fit

Occasion Fit

Tone

Personalization

Warmth

Specificity

Originality

Accuracy

Constraint Compliance

Safety

---

# Grammar Evaluation

Review for:

Grammar

Spelling

Punctuation

Sentence flow

Awkward wording

Repeated words

Unnatural phrasing

Run on sentences

Fragmented sentences

Grammar issues should be corrected automatically whenever possible.

---

# Readability Evaluation

Measure:

Sentence length

Paragraph balance

Reading flow

Natural cadence

Transitions

Greeting clarity

Closing clarity

The objective is conversational writing.

---

# Relationship Evaluation

Confirm the draft reflects:

Relationship type

Relationship stage

Personality

Shared history

Communication style

Relationship boundaries

Example:

A business client should not receive language appropriate for a spouse.

---

# Occasion Evaluation

Confirm:

Correct emotional tone.

Appropriate celebration level.

Appropriate sympathy level.

Appropriate humor.

Appropriate length.

No conflicting themes.

---

# Originality Evaluation

The engine compares against:

Recent cards.

Cards for the same recipient.

Cards for similar occasions.

Prompt regression library.

Repeated openings.

Repeated closings.

Repeated jokes.

Repeated metaphors.

Repeated sentence structures.

The goal is natural variation.

---

# Draft Quality Score

Suggested dimensions:

Grammar                10%

Readability            10%

Relationship Fit       20%

Occasion Fit           20%

Personalization        20%

Originality            10%

Safety                 10%

Total

100

---

# Quality Thresholds

95 to 100

Excellent

Display immediately.

90 to 94

Very Good

Display.

80 to 89

Acceptable

Display.

70 to 79

Weak

Attempt regeneration.

Below 70

Reject.

Generate again.

---

# Automatic Regeneration Rules

Automatically regenerate when:

Grammar fails.

Relationship mismatch.

Occasion mismatch.

Generic writing detected.

Safety violation.

Low personalization.

Hallucination risk.

Constraint violation.

Maximum regeneration attempts remain configurable.

---

# Evaluation Metadata

Every review stores:

```text

evaluation_id

draft_id

grammar_score

relationship_score

occasion_score

tone_score

personalization_score

safety_score

overall_score

recommended_action

evaluation_version

timestamp

```

---

# Hallucination Prevention Engine

## Purpose

The Hallucination Prevention Engine minimizes unsupported claims within generated writing.

Relationship trust depends on factual accuracy.

The AI must never fabricate personal details.

---

# Philosophy

When uncertain:

Say less.

Never invent.

Authenticity is more valuable than impressive writing.

---

# Hallucination Categories

Invented memories.

Invented family members.

Invented conversations.

Invented achievements.

Invented vacations.

Invented hobbies.

Invented medical events.

Invented emotional states.

Invented traditions.

Invented future plans.

---

# Prevention Strategy

The engine evaluates every factual statement.

Questions include:

Does evidence exist?

Was this confirmed?

Was this inferred?

Was this user supplied?

Does another source contradict it?

Unsupported statements should be rewritten or removed.

---

# Confidence Labels

Internally each statement may be classified as:

Verified.

Supported.

Likely.

Weakly Supported.

Unsupported.

Only verified and supported information should normally appear in finished drafts.

---

# Safe Alternatives

Instead of:

"I know you're excited about your promotion."

Use:

"I hope this year continues bringing exciting opportunities."

Instead of:

"I'll never forget our hiking trip."

Use:

"I always appreciate the memories we've shared together."

Conservative writing is preferred over fabricated specificity.

---

# Contradiction Detection

Review for conflicts.

Example:

Recipient marked as:

Dislikes humor.

Draft:

"I hope this silly card makes you laugh."

Conflict detected.

Correction required.

---

# Evidence Sources

Evidence may originate from:

Recipient profile.

Timeline.

Memory Engine.

Fresh Updates.

Follow Up answers.

Approved cards.

Pinned memories.

Manual profile entries.

User edits.

Administrative verification.

Only approved sources contribute evidence.

---

# Risk Levels

Minimal

Low

Moderate

High

Critical

High and Critical drafts require regeneration or escalation.

---

# Hallucination Metadata

```text

hallucination_review_id

draft_id

risk_level

unsupported_claims

supported_claims

evidence_sources

review_version

timestamp

```

---

# Tone Consistency Engine

## Purpose

The Tone Consistency Engine ensures the emotional voice remains appropriate throughout the entire draft.

Tone should remain stable.

Abrupt emotional shifts reduce authenticity.

---

# Tone Dimensions

Warmth

Humor

Formality

Energy

Emotional depth

Encouragement

Celebration

Reflection

Compassion

Optimism

Every occasion defines acceptable ranges.

---

# Tone Profiles

Examples:

Birthday

Warm

Optimistic

Celebratory

Playful when appropriate.

Sympathy

Gentle

Supportive

Respectful

Quiet.

Business Congratulations

Professional

Positive

Confident

Reserved.

---

# Tone Drift Detection

Examples:

Starts formal.

Ends casual.

Starts humorous.

Ends extremely emotional.

Changes from encouraging to apologetic.

Tone drift should trigger revision.

---

# Emotional Escalation

The engine prevents exaggerated emotional language.

Avoid:

Excessive exclamation points.

Forced sentiment.

Artificial enthusiasm.

Melodramatic wording.

Emotion should feel sincere.

---

# Historical Tone Matching

Previous approved cards influence tone.

If the user consistently edits toward shorter, more reserved writing, future drafts should gradually reflect those preferences.

---

# Tone Metadata

```text

tone_review_id

draft_id

tone_profile

consistency_score

detected_shifts

recommended_changes

timestamp

```

---

# Writing Quality Validation Engine

## Purpose

This engine validates the craftsmanship of the writing itself.

Unlike personalization or safety, this layer evaluates writing quality independent of relationship content.

---

# Validation Areas

Sentence variation.

Paragraph rhythm.

Word repetition.

Passive voice.

Greeting quality.

Closing quality.

Natural transitions.

Pacing.

Clarity.

Conciseness.

---

# Repetition Detection

Detect:

Repeated adjectives.

Repeated verbs.

Repeated openings.

Repeated closings.

Repeated sentence patterns.

Repeated emotional phrases.

Example:

"So grateful..."

"So grateful..."

"So grateful..."

Variation should be introduced.

---

# Natural Language Evaluation

Writing should resemble natural human communication.

Avoid:

Template feeling.

Predictable sentence structure.

Mechanical transitions.

Artificial emphasis.

Forced metaphors.

---

# Read Aloud Test

Internally evaluate:

Would this sound natural if spoken aloud?

Cards should read smoothly.

Awkward constructions should be revised automatically.

---

# Greeting Validation

Ensure greeting:

Matches relationship.

Matches occasion.

Feels natural.

Avoids excessive repetition across historical cards.

---

# Closing Validation

Closing should:

Fit relationship.

Match emotional tone.

Avoid clichés.

Respect user preferences.

---

# Length Validation

Confirm draft remains within target range.

Exception handling may allow longer drafts for highly emotional occasions when appropriate.

---

# Style Validation

Avoid:

Corporate jargon.

Marketing language.

Generic greeting card phrases.

Overly poetic language.

Artificial intelligence terminology.

The finished card should feel handwritten.

---

# Writing Metadata

```text

writing_review_id

draft_id

clarity_score

flow_score

variation_score

readability_score

length_score

overall_score

timestamp

```

---

# Safety Validation Engine

## Purpose

The Safety Validation Engine reviews every draft for policy compliance and user protection before presentation.

Safety should operate quietly.

Users should rarely notice this layer.

---

# Safety Objectives

Protect users.

Protect recipients.

Protect platform integrity.

Prevent harmful outputs.

Maintain trust.

---

# Safety Categories

Abusive language.

Harassment.

Threats.

Discrimination.

Self harm encouragement.

Medical misinformation.

Legal misinformation.

Financial scams.

Privacy violations.

Explicit sexual content.

Personal data exposure.

Manipulation.

---

# Relationship Safety

Even otherwise safe writing may be inappropriate for a specific relationship.

Example:

Romantic wording directed toward a coworker.

Parental language directed toward a client.

The engine validates relationship appropriateness.

---

# Privacy Protection

The AI should avoid exposing:

Private addresses.

Phone numbers.

Financial details.

Sensitive account information.

Private identifiers.

Unless explicitly provided for the current writing task.

---

# Safety Outcomes

Pass.

Minor Revision.

Automatic Rewrite.

Regeneration.

Human Review.

Blocked.

Only administrators should see detailed safety reasoning.

---

# Safety Metadata

Every review records:

```text

safety_review_id

draft_id

policy_version

review_result

severity

recommended_action

timestamp

```

---

# Composite Quality Decision

After all validation engines complete, a final decision engine determines the next action.

Decision inputs include:

Draft Quality Score.

Personalization Score.

Hallucination Risk.

Tone Score.

Writing Score.

Safety Result.

Confidence Level.

The resulting actions are:

Display immediately.

Regenerate automatically.

Display with lower confidence.

Escalate for human review.

Block generation.

This composite decision represents the final quality gate before any draft reaches the user.



# Autopilot Orchestration Engine

## Purpose

The Autopilot Orchestration Engine coordinates every automated workflow throughout F.I. Forgot.

It does not generate content itself.

Instead, it determines:

When AI should run.

Which engines should execute.

What order they should execute in.

Whether user approval is required.

When fulfillment should begin.

Its responsibility is orchestration, not intelligence.

---

# Philosophy

Autopilot should feel like an exceptional executive assistant.

Prepared.

Quiet.

Reliable.

Never intrusive.

Never surprising.

The user should always feel in control.

Automation should remove work, not remove ownership.

---

# Primary Responsibilities

Monitor upcoming occasions.

Schedule AI jobs.

Coordinate AI engines.

Prepare drafts.

Trigger briefings.

Request missing information.

Queue fulfillment.

Handle retries.

Recover from failures.

Log every automation event.

---

# Orchestration Flow

```text

Monitor Calendar

↓

Upcoming Occasion Detected

↓

Validate Recipient

↓

Validate Subscription

↓

Validate Autopilot Rules

↓

Determine Workflow

↓

Launch AI Jobs

↓

Evaluate Draft

↓

Notify User

↓

Receive Approval

↓

Fulfillment

↓

Archive Results

↓

Update Analytics

```

---

# Workflow Types

The orchestration engine supports multiple workflows.

Card Preparation

Question Scheduling

Relationship Refresh

Health Refresh

Background Analysis

Historical Reprocessing

Prompt Testing

Model Evaluation

Administrative Batch Jobs

Future workflow types should be configurable.

---

# Trigger Types

Workflows may begin from:

Scheduled events.

User actions.

Recipient updates.

Timeline entries.

Memory additions.

Profile edits.

Question answers.

Calendar imports.

Administrative actions.

API requests.

---

# Trigger Priorities

Critical

Payment verification.

Subscription validation.

Delivery deadlines.

High

Upcoming occasions.

Draft preparation.

Relationship refresh.

Medium

Health recalculation.

Question generation.

Memory analysis.

Low

Analytics.

Historical scoring.

Reporting.

Background optimization.

Lower priority work should automatically yield to urgent user facing tasks.

---

# Lead Time Rules

Different occasions require different preparation windows.

Birthday

Draft preparation begins according to configured lead time.

Anniversary

Earlier preparation due to emotional importance.

Christmas

Longer preparation because of seasonal volume.

Sympathy

Immediate.

Just Because

User initiated.

Lead times remain configurable.

---

# Dependency Graph

Every workflow defines explicit dependencies.

Example:

```text

Relationship Intelligence

↓

Memory Retrieval

↓

Event Briefing

↓

Prompt Construction

↓

Generation

↓

Evaluation

↓

Safety

↓

Notification

```

Downstream jobs cannot begin until required upstream jobs complete successfully.

---

# Parallel Execution

Independent work should execute simultaneously.

Examples:

Relationship Health recalculation.

Analytics updates.

Memory indexing.

Prompt logging.

These should not delay user facing draft generation.

---

# Workflow Cancellation

Running workflows may be cancelled when:

Recipient deleted.

Occasion removed.

Subscription cancelled.

User manually cancels.

Administrative override.

System maintenance.

Cancelled workflows should exit gracefully.

---

# Background AI Jobs

## Purpose

Many AI activities occur without direct user interaction.

Background jobs improve personalization while keeping the interface responsive.

---

# Background Job Categories

Relationship Health refresh.

Memory indexing.

Embedding generation.

Prompt testing.

Analytics aggregation.

Historical rescoring.

Draft prewarming.

Question ranking.

Fresh Update scheduling.

Follow Up scheduling.

Quality monitoring.

Model benchmarking.

---

# Scheduling Principles

Background work should:

Avoid peak traffic.

Prioritize user responsiveness.

Pause during maintenance.

Resume automatically.

Recover after interruption.

Support horizontal scaling.

---

# Background Processing Windows

Immediate

Seconds.

Near Real Time

Minutes.

Scheduled

Hours.

Maintenance

Overnight.

Administrative

Manual execution.

---

# Queue Management

## Purpose

Queue Management coordinates execution order for all AI work.

The queue ensures fairness, scalability, and predictable performance.

---

# Queue Types

User Facing Queue

Highest priority.

Background Queue

General maintenance.

Evaluation Queue

Quality validation.

Analytics Queue

Reporting.

Administrative Queue

Bulk operations.

Testing Queue

Prompt experiments.

Independent queues prevent low priority work from delaying customer actions.

---

# Queue States

Queued

Waiting

Running

Retrying

Paused

Completed

Cancelled

Failed

Archived

States should be visible within administrative dashboards.

---

# Queue Prioritization

Priority factors include:

User interaction.

Delivery deadlines.

Occasion urgency.

Subscription tier if applicable.

Retry age.

Administrative override.

Queue starvation must be prevented.

---

# Queue Limits

Maximum concurrent jobs remain configurable.

Separate limits exist for:

Generation.

Evaluation.

Analytics.

Administrative processing.

Background refresh.

---

# Queue Metadata

Each queue item records:

```text

queue_id

job_id

queue_name

priority

status

worker

created_at

started_at

completed_at

retry_count

estimated_duration

```

---

# Retry Behavior

## Philosophy

Temporary failures should recover automatically.

Permanent failures should surface cleanly.

Retries should never create duplicate user actions.

---

# Retry Eligible Failures

Temporary AI timeout.

Network interruption.

Rate limiting.

Transient API errors.

Worker restart.

Infrastructure interruption.

---

# Non Retry Failures

Invalid recipient.

Missing subscription.

Deleted relationship.

Invalid prompt configuration.

Policy block.

Administrative cancellation.

These failures require user or administrator action.

---

# Retry Strategy

Attempt One

Immediate.

Attempt Two

Short delay.

Attempt Three

Longer delay.

Maximum retry count remains configurable.

Exponential backoff is recommended.

---

# Idempotency

Retries must never create:

Duplicate drafts.

Duplicate cards.

Duplicate notifications.

Duplicate charges.

Duplicate fulfillment requests.

Idempotency keys should be used throughout orchestration.

---

# Retry Logging

Each retry stores:

Attempt number.

Timestamp.

Error category.

Worker.

Recovery outcome.

Final resolution.

---

# Error Recovery Engine

## Purpose

The Error Recovery Engine restores normal operation after failures while minimizing user disruption.

---

# Recovery Philosophy

Users should rarely experience technical failures.

Most recoverable issues should resolve automatically.

When user communication is necessary, messaging should remain calm and helpful.

---

# Error Categories

Infrastructure.

AI provider.

Database.

Queue.

Authentication.

Network.

Fulfillment.

Payment.

Configuration.

Validation.

Each category defines its own recovery strategy.

---

# Automatic Recovery

Possible recovery actions include:

Retry.

Fallback model.

Fallback prompt.

Restart worker.

Rebuild context.

Requeue job.

Delay execution.

Switch provider when available.

---

# Graceful Degradation

When ideal functionality is unavailable:

Use smaller context.

Delay personalization.

Reduce background work.

Preserve core user experience.

Example:

Relationship Health temporarily unavailable.

Card generation should continue.

---

# User Messaging

Users should see messages such as:

We're preparing your draft.

This is taking a little longer than expected.

We're still working on it.

Please try again shortly.

Avoid exposing:

Stack traces.

API names.

Timeout values.

Internal identifiers.

---

# Administrative Recovery

Administrators may:

Retry manually.

Cancel jobs.

Move queues.

Restart workers.

View logs.

Inspect prompt versions.

Inspect routing.

Escalate issues.

---

# Recovery Metrics

Track:

Recovery rate.

Mean recovery time.

Retry success.

Permanent failures.

User visible failures.

Fallback usage.

Repeated failures.

---

# Recovery Metadata

```text

recovery_id

job_id

failure_type

recovery_action

success

duration

worker

timestamp

```

---

# AI Monitoring Dashboard

## Purpose

The AI Monitoring Dashboard provides operational visibility into the health of the entire AI platform.

It is intended for administrators and internal operations only.

No customer facing interface exposes these details.

---

# Dashboard Sections

Platform Overview.

Generation Activity.

Queue Health.

Prompt Versions.

Model Usage.

Latency.

Token Consumption.

Costs.

Failures.

Safety.

Quality.

Autopilot.

Feature Flags.

---

# Platform Overview

Display:

Current platform status.

Jobs today.

Jobs this hour.

Success rate.

Average latency.

Current queue depth.

Current active workers.

Alerts.

---

# Generation Activity

Metrics include:

Drafts generated.

Briefings generated.

Questions generated.

Relationship summaries.

Evaluations.

Regenerations.

Human reviews.

Blocked outputs.

Charts should support multiple time ranges.

---

# Queue Health

Display:

Current queue sizes.

Oldest queued job.

Running jobs.

Retry backlog.

Failed jobs.

Worker utilization.

Queue trends.

---

# Prompt Version Dashboard

Show:

Current production version.

Historical versions.

Rollout percentages.

Performance comparison.

Acceptance rate.

Regression alerts.

Ability to filter by version.

---

# Model Dashboard

Display:

Model usage.

Average latency.

Success rate.

Failure rate.

Average token usage.

Estimated cost.

Fallback frequency.

Historical trends.

---

# Alerting

Examples:

Queue backlog exceeds threshold.

Generation latency exceeds threshold.

Failure rate increases.

Cost spike detected.

Prompt regression detected.

Model unavailable.

Safety blocks increase.

Administrators should receive actionable alerts rather than raw logs.



# AI Analytics

## Purpose

The AI Analytics platform measures how effectively the AI improves user outcomes, personalization, and overall product quality.

Analytics should drive continuous improvement.

The objective is not simply measuring AI activity.

The objective is measuring whether the AI helps users become more thoughtful in their relationships.

---

# Analytics Principles

Measure outcomes.

Not volume.

Measure quality.

Not complexity.

Measure trust.

Not automation.

Every metric should answer one question:

Did this improve the user's experience?

---

# Analytics Categories

Generation Analytics

Relationship Analytics

Personalization Analytics

Autopilot Analytics

Question Analytics

Memory Analytics

Prompt Analytics

Model Analytics

Operational Analytics

Business Analytics

---

# Generation Analytics

Track:

Cards generated.

Cards approved.

Cards edited.

Cards regenerated.

Cards discarded.

Average generation time.

Average review time.

Approval rate.

Edit rate.

Regeneration rate.

---

# Personalization Analytics

Track:

Average personalization score.

Score distribution.

Highest scoring drafts.

Lowest scoring drafts.

Personalization improvement over time.

Relationship stage correlation.

Health correlation.

Memory utilization rate.

---

# Relationship Analytics

Track:

Average Relationship Health.

Health improvements.

Average confidence.

Timeline growth.

Memories added.

Fresh Updates answered.

Profile questions completed.

Follow Ups completed.

Relationship maturity progression.

---

# Question Analytics

Measure:

Questions displayed.

Questions answered.

Questions skipped.

Question completion rate.

Question fatigue.

Average response time.

Highest performing questions.

Lowest performing questions.

Category completion rates.

---

# Memory Analytics

Track:

Memories created.

Memories edited.

Memories deleted.

Average importance.

Memory usage frequency.

Pinned memories.

Unused memories.

Average memory freshness.

---

# Prompt Analytics

Track:

Prompt versions.

Acceptance rates.

Regeneration rates.

Average personalization.

Average quality.

Average latency.

Safety events.

Regression events.

---

# Model Analytics

Measure:

Generation count.

Latency.

Failure rate.

Fallback usage.

Average cost.

Average token usage.

Quality correlation.

Model comparison.

---

# User Behavior Analytics

Track:

Average edits per draft.

Editing patterns.

Approval delay.

Autopilot participation.

Card scheduling behavior.

Question engagement.

Relationship growth.

Feature adoption.

---

# Cohort Analytics

Support comparison across:

Subscription tiers.

Relationship stages.

Recipient types.

Occasion categories.

Geographic regions where permitted.

Feature flag groups.

Prompt versions.

Model versions.

---

# Trend Analysis

Historical trends include:

Personalization improvement.

Relationship Health growth.

Draft approval improvements.

Average latency.

Average generation quality.

Average cost.

Question engagement.

Feature adoption.

---

# Dashboard Filters

Support filtering by:

Date.

Occasion.

Relationship type.

Recipient.

Subscription tier.

Model.

Prompt version.

Feature flag.

Region where applicable.

---

# Export Support

Administrators may export:

Aggregate metrics.

Performance reports.

Operational summaries.

No export should expose unnecessary user content.

Personally identifiable information should remain protected.

---

# Cost Monitoring

## Purpose

AI costs should remain predictable, measurable, and continuously optimized.

The Cost Monitoring system provides visibility without reducing user experience.

Quality remains the primary objective.

---

# Cost Categories

Generation.

Evaluation.

Relationship analysis.

Question generation.

Memory processing.

Embeddings.

Background jobs.

Administrative jobs.

Prompt testing.

Model experimentation.

---

# Cost Metrics

Track:

Estimated cost per draft.

Average daily cost.

Average monthly cost.

Cost by feature.

Cost by model.

Cost by subscription tier.

Cost by occasion.

Cost per recipient.

Cost per active user.

---

# Cost Trends

Visualize:

Daily spend.

Weekly spend.

Monthly spend.

Rolling averages.

Projected monthly spend.

Historical comparisons.

---

# Cost Allocation

Allocate spending across:

Generation.

Evaluation.

Monitoring.

Testing.

Background automation.

Embeddings.

Analytics.

Administration.

---

# Cost Alerts

Notify administrators when:

Daily budget exceeded.

Monthly projection exceeds target.

Unexpected model cost increase.

Prompt regression increases token usage.

Fallback model usage spikes.

---

# Cost Optimization Opportunities

Dashboard should identify:

Unused context.

Excessive prompt size.

Repeated generations.

High regeneration frequency.

High retry costs.

Large context packets.

Unnecessary background work.

Recommendations should never reduce writing quality automatically.

---

# Token Usage Monitoring

## Purpose

Track token consumption across every AI workflow.

Token visibility enables optimization while maintaining personalization.

---

# Token Metrics

Input tokens.

Output tokens.

Average tokens.

Maximum tokens.

Minimum tokens.

Token growth.

Token savings.

Compression efficiency.

---

# Token Breakdown

Measure tokens consumed by:

Relationship context.

Memories.

Occasion rules.

Historical cards.

System instructions.

Prompt modules.

Generated output.

Evaluation.

---

# Token Efficiency

Calculate:

Tokens per approved draft.

Tokens per recipient.

Tokens per relationship.

Tokens per memory used.

Tokens per personalization point.

---

# Token Alerts

Generate alerts when:

Prompt size grows unexpectedly.

Context exceeds thresholds.

Output length becomes excessive.

Compression fails.

Token efficiency declines.

---

# Historical Token Trends

Charts include:

Daily usage.

Weekly usage.

Monthly usage.

Model comparison.

Prompt comparison.

Feature comparison.

---

# Latency Monitoring

## Purpose

Users should perceive the AI as responsive and dependable.

Latency Monitoring measures every stage of the AI pipeline.

---

# Latency Stages

Context retrieval.

Relationship analysis.

Memory retrieval.

Prompt construction.

Model execution.

Evaluation.

Formatting.

Presentation.

Total request time.

---

# Latency Targets

Targets remain configurable.

Representative goals:

Relationship retrieval under target.

Prompt construction under target.

Generation under target.

Evaluation under target.

Overall experience should consistently feel responsive.

---

# Percentile Tracking

Track:

Average.

Median.

Ninetieth percentile.

Ninety fifth percentile.

Ninety ninth percentile.

Outliers should be investigated.

---

# Latency Breakdown

For every request store:

Queue delay.

Execution time.

Evaluation time.

Formatting time.

Total duration.

---

# Latency Alerts

Alert when:

Average latency increases.

Queue delays rise.

Specific models slow down.

Evaluation backlog develops.

Infrastructure bottlenecks appear.

---

# Feature Flag Framework

## Purpose

Feature Flags allow controlled rollout of AI functionality without requiring new deployments.

Every major AI capability should be independently configurable.

---

# Feature Flag Categories

Prompt versions.

Models.

Evaluation engines.

Relationship scoring.

Question engines.

Autopilot workflows.

Analytics.

Experimental features.

Administrative tools.

---

# Flag Types

Global.

Internal only.

Beta.

Percentage rollout.

Subscription based.

Region based.

Administrative override.

Emergency disable.

---

# Rollout Strategy

New features should progress through:

Internal testing.

Employee rollout.

Small percentage rollout.

Expanded rollout.

General availability.

Rollback remains available at every stage.

---

# Flag Metadata

Each feature flag stores:

```text

flag_id

name

description

state

rollout_percentage

target_groups

owner

created_at

updated_at

expiration_date

```

---

# Human Review Workflows

## Purpose

Although AI should operate autonomously in most situations, certain scenarios benefit from human oversight.

Human review protects quality, trust, and platform integrity.

---

# Review Triggers

Low quality score.

High hallucination risk.

Safety concern.

Repeated regeneration failure.

Prompt experiment.

Administrative audit.

Regression detection.

Customer reported issue.

Policy review.

---

# Review Queue

Each review item includes:

Draft.

Context summary.

Evaluation scores.

Prompt version.

Model.

Safety findings.

Relationship summary.

Administrative notes.

Reviewer actions.

---

# Reviewer Actions

Approve.

Reject.

Request regeneration.

Escalate.

Annotate.

Flag regression.

Mark resolved.

Every action becomes part of the audit history.

---

# Reviewer Dashboard

Display:

Pending reviews.

Average review time.

Reviewer workload.

Quality trends.

Common failure reasons.

Prompt regressions.

Safety trends.

---

# Audit Logging

## Purpose

Every meaningful AI action should be recorded in an immutable audit history.

Audit logs support:

Debugging.

Compliance.

Quality assurance.

Operational transparency.

Incident investigation.

---

# Logged Events

Generation requested.

Context assembled.

Prompt generated.

Model selected.

Draft created.

Evaluation completed.

Safety reviewed.

Autopilot triggered.

Notification sent.

User approved.

User edited.

User rejected.

Fulfillment initiated.

Retry executed.

Failure detected.

Administrative action.

Feature flag changed.

Prompt version updated.

---

# Audit Record

Every entry stores:

```text

audit_id

event_type

actor

resource_type

resource_id

timestamp

metadata

result

correlation_id

```

---

# Correlation IDs

Every end to end workflow receives a shared correlation identifier.

This allows administrators to reconstruct an entire AI lifecycle across multiple systems.

Example:

Generation Request

↓

Relationship Intelligence

↓

Memory Retrieval

↓

Prompt Assembly

↓

Generation

↓

Evaluation

↓

Safety

↓

Approval

↓

Fulfillment

All linked through one correlation identifier.

---

# Audit Retention

Retention periods should remain configurable.

Audit logs should support:

Search.

Filtering.

Time based retention.

Secure archival.

Administrative export.

User privacy requirements must always take precedence over operational convenience.

# API Mapping

## Purpose

The frontend AI architecture must integrate seamlessly with the existing backend.

This redesign preserves all existing APIs, business logic, authentication, database schema, AI pipelines, Stripe integration, Handwrytten integration, and automation infrastructure.

No frontend implementation should require changes to established API contracts unless a future backend version explicitly introduces them.

The frontend should consume AI services through clearly defined application services rather than embedding business logic inside UI components.

---

# Architecture Principles

The frontend is responsible for:

Displaying AI state.

Displaying AI results.

Collecting user input.

Presenting progress.

Handling optimistic UI where appropriate.

The backend is responsible for:

Relationship intelligence.

Memory retrieval.

Prompt orchestration.

Model routing.

Generation.

Evaluation.

Validation.

Automation.

Scheduling.

Queue execution.

Analytics.

---

# Frontend Service Layer

The frontend should organize AI interactions through dedicated service modules.

Recommended services include:

```text

AIService

RelationshipService

MemoryService

QuestionService

AutopilotService

AnalyticsService

MonitoringService

AdminAIService

PromptService

HealthService

```

UI components should never communicate directly with low level API endpoints.

---

# Standard Request Lifecycle

```text

User Action

↓

Frontend Validation

↓

API Request

↓

Loading State

↓

Backend Processing

↓

Response

↓

Frontend State Update

↓

Animation

↓

Success Confirmation

```

Every request should support graceful cancellation.

---

# Standard Response Structure

Every AI response should provide sufficient metadata for UI rendering.

Representative structure:

```text

success

status

message

data

warnings

errors

timestamp

request_id

correlation_id

```

The frontend should never depend upon undocumented response properties.

---

# Loading States

Every AI request should expose progress.

Examples:

Preparing your draft...

Reviewing your relationship...

Finding meaningful memories...

Putting everything together...

Almost ready...

Messages should feel reassuring rather than technical.

---

# Failure States

Failures should be categorized into:

Temporary

Recoverable

User Action Required

Administrative

Unknown

Each category maps to predefined UI behavior.

---

# Timeout Handling

If processing exceeds expected duration:

Continue processing in the background.

Allow navigation.

Notify user when complete.

Avoid forcing the user to remain on one screen.

---

# Request Cancellation

Users may cancel:

Draft generation.

Question generation.

Relationship analysis.

Background refresh requests.

Cancellation should never corrupt relationship data.

---

# Optimistic UI

Optimistic updates may be used for:

Memory creation.

Question answers.

Relationship edits.

Timeline entries.

Optimistic updates should not be used for AI generated content.

Generated content must wait for server confirmation.

---

# Offline Behavior

If connectivity is lost:

Preserve pending user input.

Queue supported operations.

Retry automatically when appropriate.

Inform users without creating anxiety.

---

# Performance Requirements

## Purpose

The AI experience should feel premium.

Performance is measured by perceived responsiveness as well as technical metrics.

---

# Performance Goals

The application should:

Respond immediately to user interaction.

Display meaningful progress quickly.

Avoid blocking navigation.

Prioritize user initiated work.

Minimize unnecessary rendering.

Reduce repeated API requests.

Cache stable information where appropriate.

---

# Frontend Performance

The interface should:

Lazy load administrative screens.

Virtualize long relationship timelines.

Paginate audit logs.

Memoize expensive computations.

Avoid unnecessary component re renders.

Preload likely next screens.

---

# AI Performance

Relationship analysis should reuse cached context whenever valid.

Memory retrieval should avoid duplicate requests.

Prompt metadata should not be repeatedly downloaded.

Analytics should load asynchronously.

Administrative dashboards should use pagination.

---

# Background Performance

Heavy administrative calculations should never impact customer interactions.

Background analytics should execute independently.

Historical rescoring should remain isolated from production generation.

---

# Caching Strategy

Appropriate candidates include:

Recipient summaries.

Relationship Health.

Recent timeline entries.

Occasion metadata.

Feature flag configuration.

Question libraries.

Do not cache:

Draft generation responses.

Safety reviews.

Approval states.

Payment state.

---

# Cache Invalidation

Cache refresh should occur when:

Recipient updated.

Memory added.

Memory edited.

Question answered.

Relationship Health recalculated.

Autopilot settings changed.

Feature flags updated.

---

# Scalability

The frontend should support:

Thousands of recipients.

Large memory collections.

Many years of timeline history.

Large administrative datasets.

High concurrent AI activity.

No visible degradation should occur during ordinary growth.

---

# Security Considerations

## Purpose

Relationship information is deeply personal.

The AI system must treat every piece of relationship data with the highest level of care.

Security considerations extend beyond authentication.

They include privacy, data handling, administrative access, auditability, and AI specific risks.

---

# Security Principles

Least privilege.

Explicit authorization.

Data minimization.

Encryption in transit.

Encryption at rest.

Comprehensive auditing.

Privacy by default.

Defense in depth.

---

# Access Control

Only authorized users may access:

Their own recipients.

Their own memories.

Their own generated drafts.

Their own Relationship Health.

Administrative interfaces require elevated permissions.

---

# Administrative Access

Administrative users should receive only the permissions necessary for their role.

Possible roles include:

Support.

Operations.

Engineering.

AI Quality.

System Administrator.

Every administrative action must be audited.

---

# Sensitive Information

Sensitive information includes:

Personal memories.

Family information.

Health references.

Relationship notes.

Writing preferences.

Recipient profile details.

Timeline history.

Sensitive information should never appear in logs unnecessarily.

---

# Prompt Privacy

Prompt construction should avoid including unrelated personal information.

Only context required for the requested generation should be assembled.

Context minimization reduces both privacy exposure and token usage.

---

# Data Retention

Retention policies should remain configurable.

Different categories may use different retention periods.

Examples include:

Audit records.

Prompt metadata.

Evaluation metadata.

Analytics.

Background processing logs.

Retention policies should respect applicable legal requirements.

---

# Rate Limiting

AI endpoints should support protection against abuse.

Representative limits may apply to:

Generation.

Regeneration.

Question requests.

Administrative exports.

Monitoring APIs.

Rate limiting should produce clear user messaging.

---

# Secrets Management

No API keys.

Model credentials.

Private service tokens.

Administrative secrets.

Or internal endpoints should ever be exposed to frontend code.

---

# AI Specific Security

Prevent:

Prompt injection.

Unauthorized prompt modification.

Context poisoning.

Cross user context leakage.

Administrative impersonation.

Unauthorized model routing.

Prompt versions should be immutable after release.

---

# Privacy Controls

Users should always retain control over:

Recipient deletion.

Memory deletion.

Timeline edits.

Question answers.

Autopilot participation.

Data export where supported.

Account deletion.

---

# Compliance Logging

Security relevant events include:

Administrative login.

Permission changes.

Feature flag changes.

Prompt version rollout.

Manual regeneration.

Administrative review.

Configuration changes.

Every event should be timestamped and audited.

---

# Acceptance Criteria

## AI Architecture

The AI architecture is considered complete when:

Relationship Intelligence consistently assembles accurate relationship context.

Memory retrieval selects meaningful memories.

Occasion Intelligence adapts appropriately to every supported occasion.

Prompt orchestration consistently follows defined hierarchy.

Model routing functions transparently.

Draft evaluation executes automatically.

Safety validation completes before presentation.

Autopilot orchestration coordinates workflows without user confusion.

Administrative monitoring provides complete operational visibility.

---

## Relationship Intelligence

Acceptance criteria include:

Relationship summaries remain accurate.

Confidence scores update automatically.

Relationship Health recalculates after meaningful changes.

Question recommendations adapt over time.

Personalization increases naturally as information grows.

---

## Memory Engine

Acceptance criteria include:

Meaningful memories receive higher retrieval priority.

Duplicate memories do not dominate generation.

Pinned memories behave correctly.

Memory freshness influences retrieval.

Usage history improves future selection.

---

## Question Engines

Acceptance criteria include:

Profile Gap Questions avoid repetition.

Fresh Updates remain timely.

Follow Up Questions demonstrate continuity.

Question fatigue protections function correctly.

Relationship stage influences question selection.

---

## Card Generation

Acceptance criteria include:

Cards feel recipient specific.

Cards avoid hallucinations.

Cards match the selected occasion.

Tone remains consistent.

Editing history improves future drafts.

Automatic regeneration improves weak drafts.

---

## Evaluation Engines

Acceptance criteria include:

Quality scoring functions consistently.

Hallucination detection prevents unsupported claims.

Writing validation catches repetitive output.

Safety validation blocks inappropriate content.

Composite quality decisions produce predictable outcomes.

---

## Autopilot

Acceptance criteria include:

Upcoming occasions trigger correctly.

Draft preparation occurs automatically.

Approval workflow behaves correctly.

Retries avoid duplicate fulfillment.

Failure recovery completes without user intervention whenever possible.

---

## Monitoring

Acceptance criteria include:

Administrators can inspect every AI workflow.

Prompt versions remain traceable.

Model usage is measurable.

Costs remain visible.

Latency remains measurable.

Failures remain searchable.

Audit history is complete.

---

## Analytics

Acceptance criteria include:

Key metrics update automatically.

Historical reporting remains accurate.

Filtering performs correctly.

Exports respect privacy controls.

Operational trends remain visible.

---

## Performance

Acceptance criteria include:

User initiated requests remain responsive.

Background jobs do not degrade foreground performance.

Caching behaves predictably.

Large datasets remain usable.

Administrative dashboards remain performant.

---

## Security

Acceptance criteria include:

Unauthorized access is prevented.

Administrative actions are audited.

Sensitive information remains protected.

Prompt privacy rules are enforced.

Cross user data isolation is maintained.

---

# Definition of Done

The AI and Automation system is considered complete when all of the following conditions are satisfied.

Every AI workflow defined within this specification has been implemented.

Every frontend experience reflects the Relationship Concierge philosophy established throughout the playbook.

All AI engines interact through clearly defined interfaces with no duplicated business logic.

The frontend introduces no breaking changes to the existing backend architecture, API contracts, database schema, authentication, Stripe integration, Handwrytten integration, AI pipelines, or automation services.

Relationship Intelligence, Memory, Question, Health, Occasion, Briefing, Personalization, Evaluation, Safety, and Autopilot systems function as a coordinated platform rather than isolated features.

Prompt orchestration is versioned, testable, observable, and fully auditable.

Administrative dashboards provide complete operational visibility into generation, evaluation, automation, monitoring, analytics, costs, latency, feature flags, and audit history.

All loading, empty, success, failure, retry, recovery, and offline states conform to the design system and interaction standards established elsewhere in the playbook.

Every user facing AI interaction is warm, understandable, trustworthy, and free from technical terminology.

All AI generated content passes personalization, quality, hallucination, tone, writing, and safety validation before presentation.

The complete AI platform scales predictably while maintaining premium performance, security, reliability, observability, and user trust.

No additional UX, frontend, engineering, architectural, or implementation decisions are required before development begins.





