# F* I Forgot — Recipient Intelligence Architecture

**Document type:** Long-term system design  
**Focus:** Relationship memory platform, AI personalization, recipient intelligence  
**Scope:** Database schema, question engine, AI layer, Brownie Points, migration path  
**Not covered:** Security, authentication, deployment, production hardening

---

## Table of Contents

1. [The Core Thesis](#1-the-core-thesis)
2. [Current System Weaknesses](#2-current-system-weaknesses)
3. [Ideal Long-Term Database Schema](#3-ideal-long-term-database-schema)
4. [Memory Architecture](#4-memory-architecture)
5. [Question Engine Architecture](#5-question-engine-architecture)
6. [Brownie Points Evolution](#6-brownie-points-evolution)
7. [AI Personalization Architecture](#7-ai-personalization-architecture)
8. [Data Model for Future Features](#8-data-model-for-future-features)
9. [Migration Path](#9-migration-path)
10. [Fix Now Before More Data Accumulates](#10-fix-now-before-more-data-accumulates)
11. [Recommended Implementation Order](#11-recommended-implementation-order)

---

## 1. The Core Thesis

FIForgot's competitive moat is not the card. It is the memory.

Anyone can send a card. The reason a user stays for years is because FIForgot knows their mom better than they can articulate — it knows she likes gardening, hates being called sentimental, had a hard year after the knee surgery, and that her favorite memory with her daughter was the Napa trip in 2021. That knowledge compounds. It cannot be replicated by a competitor without years of user input.

The entire architecture must be designed around one principle: **every interaction should make the system smarter about each recipient.** Every question answered, every card approved, every edit made, every card rejected — all of it should feed back into a deepening model of that person.

The database is not a storage layer. It is an intelligence layer.

---

## 2. Current System Weaknesses

Before designing the ideal system, here is an honest assessment of what the current architecture gets wrong.

### Critical

**1. localStorage as primary data store.** Recipient data lives primarily in the browser. This means memory is browser-scoped, device-scoped, and ephemeral. A user who clears their cache loses years of data. A user who switches phones starts over. Multi-device sync does not exist. This is the single most dangerous structural decision in the current codebase.

**2. The `personal_recipients.data` JSON blob.** All recipient information is serialized into a single JSONB column. This makes it impossible to query across recipients (`find all recipients with upcoming birthdays in June`), impossible to index specific fields, and impossible to evolve the schema without writing application-side migrations for every existing record. The blob is a dead end.

**3. No card history.** There is no persistent record of what was sent, when, for what occasion, which message variant was chosen, whether the user edited it, or whether the card was well-received. This means every card is generated with no awareness of previous cards. The system cannot avoid repeating itself, cannot improve over time, and cannot use past performance to influence future output.

**4. Briefing answers are ephemeral.** Briefing Q&A is stored in localStorage per-event. After the card is sent, those answers are discarded. The system never learns from them. The specific details a user shared — "she just got promoted," "they adopted a dog named Biscuit" — are thrown away.

**5. Brownie Points is disconnected from behavior.** The score is calculated entirely from profile completeness at render time. It does not track whether cards were actually sent, whether the user engaged with briefings, or whether the relationship is genuinely improving.

### Important

**6. No recipient identity.** If two users both have a "Mom" who was born in 1955 and lives in Ohio, the system has no way to know they might be the same person (for future shared/family account features). There is no stable identity layer beneath the per-user record.

**7. No temporal model.** The system has no sense of a relationship over time. There is no timeline, no history of events, no memory of what the user knew about this person a year ago versus now.

**8. Question engine does not exist.** The briefing system is event-triggered and manual. There is no continuous, intelligent, low-friction system for learning about recipients over time.

**9. Duplicate recipients.** Nothing prevents a user from adding "Mom" and "Mother" as two separate recipients. No deduplication logic exists.

---

## 3. Ideal Long-Term Database Schema

### Design Principles

- Every recipient has a normalized, queryable profile — no JSON blobs for structured data
- Memory is a separate, evolving layer that sits on top of the profile
- Card history is a first-class object with full audit trail
- Questions and answers are their own entity, not embedded in events
- All timestamps are in UTC, stored as `timestamptz`
- UUIDs everywhere — no serial integers for records that will be referenced externally

---

### Table 1: `users`

**Purpose:** Core user identity. One row per registered user.

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  plan            TEXT NOT NULL DEFAULT 'basic',   -- basic | standard | premium
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  onboarding_complete     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
```

---

### Table 2: `recipients`

**Purpose:** Stable identity for each person a user is tracking. Separates what is known (the profile) from who they are (this record).

The key insight: a recipient is a *relationship*, not a person. "Mom" as tracked by User A and "Mom" as tracked by User B are separate recipients — same person in the real world, but different relationships with different histories, tones, and memories.

```sql
CREATE TABLE recipients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Identity
  first_name          TEXT NOT NULL,
  last_name           TEXT,
  nickname            TEXT,                        -- "Bubs", "Mama", etc.
  relationship_type   TEXT NOT NULL,               -- spouse | partner | parent | child | sibling | friend | coworker | client | other
  relationship_label  TEXT,                        -- user's own label: "my college roommate", "my boss"

  -- Deduplication signals
  birthday            DATE,
  email               TEXT,
  phone               TEXT,

  -- Mailing
  address_line1       TEXT,
  address_line2       TEXT,
  city                TEXT,
  state               TEXT,
  postal_code         TEXT,
  country             TEXT DEFAULT 'US',
  address_verified_at TIMESTAMPTZ,

  -- Status
  active              BOOLEAN NOT NULL DEFAULT true,
  archived_at         TIMESTAMPTZ,                 -- soft delete

  -- Meta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recipients_user_id ON recipients(user_id);
CREATE INDEX idx_recipients_user_relationship ON recipients(user_id, relationship_type);
CREATE INDEX idx_recipients_birthday ON recipients(birthday);          -- for scheduler
CREATE UNIQUE INDEX idx_recipients_dedup ON recipients(user_id, first_name, birthday)
  WHERE birthday IS NOT NULL AND archived_at IS NULL;                  -- soft dedup
```

**On deduplication:** The unique index on `(user_id, first_name, birthday)` catches the most common case — a user accidentally adding the same person twice with the same name and birthday. If birthday is unknown, no constraint fires. The application layer should warn ("You already have a Mom with this birthday — is this the same person?") but not hard-block. Friction should be minimal.

**On recipient identity across users:** Do not attempt to merge recipients across users at this stage. The complexity is high and the benefit is low until there is a family/shared account feature. Store an optional `real_world_person_id` column (nullable UUID) as a future hook for linking records across users if that feature ships.

---

### Table 3: `recipient_profile`

**Purpose:** The stable, editable facts about a recipient — the things a user knows and has explicitly entered. Separate from memory (which is AI-inferred or accumulated over time).

```sql
CREATE TABLE recipient_profile (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL UNIQUE REFERENCES recipients(id) ON DELETE CASCADE,

  -- Relationship context
  years_known           INTEGER,
  met_context           TEXT,                -- "college roommate", "grew up together"
  relationship_dynamic  TEXT,               -- "she's the planner, I'm the chaos"

  -- Personality
  personality_traits    TEXT[],             -- ["sarcastic", "sensitive", "competitive"]
  communication_style   TEXT,               -- "direct", "playful", "formal"
  sense_of_humor        TEXT,               -- "dry wit", "dad jokes", "self-deprecating"
  love_language         TEXT,               -- "words of affirmation", "acts of service", etc.

  -- Interests
  hobbies               TEXT[],
  interests             TEXT[],
  dislikes              TEXT[],

  -- Card preferences
  preferred_tone        TEXT,               -- "heartfelt", "funny", "roast", "sincere"
  emotional_openness    TEXT,               -- "just funny" | "meaningful but not mushy" | "full heart"
  things_to_never_say   TEXT[],
  things_to_always_include TEXT[],

  -- Life context
  occupation            TEXT,
  life_stage            TEXT,               -- "new parent", "empty nester", "recently retired"
  current_city          TEXT,

  -- Sender's voice
  sender_nickname       TEXT,               -- what they call themselves with this person ("Auntie K")
  sign_off              TEXT,               -- "Love always", "Your favorite sibling"

  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Table 4: `recipient_events`

**Purpose:** All dates and recurring events associated with a recipient. The scheduling engine reads this table.

```sql
CREATE TABLE recipient_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  event_type      TEXT NOT NULL,     -- birthday | anniversary | holiday | custom | life_milestone
  label           TEXT,              -- "Wedding Anniversary", "Gotcha Day", "Work Anniversary"
  date            DATE NOT NULL,
  recurs_annually BOOLEAN NOT NULL DEFAULT true,
  active          BOOLEAN NOT NULL DEFAULT true,

  -- For anniversaries — who else is involved
  co_participant  TEXT,              -- "spouse's name", for anniversary cards

  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recipient_events_recipient ON recipient_events(recipient_id);
CREATE INDEX idx_recipient_events_date ON recipient_events(date);
CREATE INDEX idx_recipient_events_upcoming ON recipient_events(date, active)
  WHERE active = true;               -- scheduler index
```

---

### Table 5: `recipient_memory`

**Purpose:** The AI-facing intelligence layer. This is what the AI reads when generating a card. It is separate from the profile because it accumulates differently — through briefings, card feedback, and AI synthesis — not just direct user input.

```sql
CREATE TABLE recipient_memory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL UNIQUE REFERENCES recipients(id) ON DELETE CASCADE,

  -- Permanent facts (never expire, rarely change)
  permanent_facts JSONB NOT NULL DEFAULT '{}',
  -- e.g. { "hometown": "Cleveland", "college": "Ohio State", "met_year": 1998 }

  -- Relationship DNA (slow-changing, AI-synthesized)
  relationship_dna JSONB NOT NULL DEFAULT '{}',
  -- e.g. { "dynamic": "she mothers everyone", "sender_role": "the funny one",
  --        "recurring_themes": ["food", "travel", "chaos"] }

  -- Living memory (updated after each interaction)
  current_chapter JSONB NOT NULL DEFAULT '{}',
  -- e.g. { "recent_events": ["new job", "moved to Austin"], "current_mood": "transitional year" }

  -- Things the AI must never do for this recipient
  hard_stops      TEXT[] NOT NULL DEFAULT '{}',
  -- e.g. ["never mention the divorce", "avoid references to weight", "don't use the word blessed"]

  -- Things the AI should always do
  always_dos      TEXT[] NOT NULL DEFAULT '{}',
  -- e.g. ["always reference the Napa trip", "always end with a callback to their shared history"]

  -- Card DNA (patterns from approved and edited cards)
  card_dna        JSONB NOT NULL DEFAULT '{}',
  -- e.g. { "avg_length": 4, "avg_humor_level": 7, "preferred_structure": "hook-story-close",
  --        "words_that_landed": ["chaos", "legend", "decade"], "words_that_flopped": [] }

  -- Completeness
  memory_score    INTEGER NOT NULL DEFAULT 0,    -- 0-100, computed
  last_synthesized_at TIMESTAMPTZ,               -- when AI last ran a synthesis pass

  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Table 6: `knowledge_items`

**Purpose:** Every discrete piece of knowledge the system has about a recipient, tagged by source, category, and freshness. This is the atomic unit of the knowledge graph.

```sql
CREATE TABLE knowledge_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  category        TEXT NOT NULL,
  -- categories: interest | hobby | memory | joke | milestone | preference |
  --             personality | gift_preference | avoid | relationship_fact | life_event

  content         TEXT NOT NULL,        -- the actual knowledge: "loves true crime podcasts"
  source          TEXT NOT NULL,        -- briefing | profile | card_feedback | ai_inferred | user_note
  source_id       UUID,                 -- FK to the briefing answer, card, etc. that generated this
  confidence      NUMERIC(3,2),         -- 0.00 to 1.00

  -- Freshness
  observed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),   -- when we learned this
  valid_until     TIMESTAMPTZ,          -- null = permanent; set for time-bounded facts
  refresh_after   TIMESTAMPTZ,          -- null = never; set to trigger a check-in question

  -- Flags
  is_permanent    BOOLEAN NOT NULL DEFAULT false,       -- facts that never expire
  is_sensitive    BOOLEAN NOT NULL DEFAULT false,       -- handle with care
  verified        BOOLEAN NOT NULL DEFAULT false,       -- user confirmed vs AI inferred

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_recipient ON knowledge_items(recipient_id);
CREATE INDEX idx_knowledge_category ON knowledge_items(recipient_id, category);
CREATE INDEX idx_knowledge_freshness ON knowledge_items(recipient_id, refresh_after)
  WHERE refresh_after IS NOT NULL;
CREATE INDEX idx_knowledge_stale ON knowledge_items(recipient_id, valid_until)
  WHERE valid_until IS NOT NULL;
```

**What immutable vs. editable means here:**

- `is_permanent = true` records (birthdate, hometown, how they met) are never overwritten — only superseded by a new record with a later `observed_at`. This preserves history.
- All other records can be flagged stale via `valid_until` or refreshed via `refresh_after`.
- The AI reads the most recent, non-stale record per category.

---

### Table 7: `questions`

**Purpose:** The master library of questions the system can ask. Questions are authored once and reused across all users and recipients.

```sql
CREATE TABLE questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,       -- machine identifier: "recipient.hobby.primary"
  text            TEXT NOT NULL,              -- "What does {first_name} do in their free time?"
  follow_up_text  TEXT,                       -- "Tell me more — what specifically draws them to it?"
  category        TEXT NOT NULL,              -- maps to knowledge_items.category
  subcategory     TEXT,

  -- Targeting
  relationship_types TEXT[],                  -- null = all; ["spouse", "partner"] = partner only
  life_stages     TEXT[],                     -- null = all; ["new parent"] = new parents only
  requires_known  TEXT[],                     -- slugs that must be answered before this unlocks
  unlocks         TEXT[],                     -- slugs this answer unlocks

  -- Scoring
  value_weight    NUMERIC(3,2) NOT NULL DEFAULT 1.0,  -- how valuable is this answer (for prioritization)
  ai_utility      NUMERIC(3,2) NOT NULL DEFAULT 1.0,  -- how much does this help card generation

  -- Metadata
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_relationship ON questions USING GIN(relationship_types);
```

---

### Table 8: `question_answers`

**Purpose:** Every question ever asked and every answer ever given, for every recipient. This is the raw input layer for the knowledge graph.

```sql
CREATE TABLE question_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id),
  user_id         UUID NOT NULL REFERENCES users(id),

  answer_text     TEXT NOT NULL,
  answer_tokens   TEXT[],               -- parsed keywords from the answer for indexing

  -- Context at time of asking
  trigger_type    TEXT NOT NULL,        -- event_briefing | scheduled_checkin | onboarding | user_initiated
  trigger_event   TEXT,                 -- "birthday_2025", "christmas_2025"
  upcoming_event_date DATE,            -- the event this briefing was for

  -- Quality signals
  answer_length   INTEGER,              -- chars; very short answers = low confidence
  was_skipped     BOOLEAN NOT NULL DEFAULT false,
  skipped_reason  TEXT,                 -- "don't know", "prefer not to say", "not applicable"

  -- Lifecycle
  superseded_by   UUID REFERENCES question_answers(id),  -- if this answer was replaced
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qa_recipient ON question_answers(recipient_id);
CREATE INDEX idx_qa_question ON question_answers(question_id);
CREATE INDEX idx_qa_recipient_question ON question_answers(recipient_id, question_id);
CREATE INDEX idx_qa_trigger ON question_answers(recipient_id, trigger_type, created_at);
```

---

### Table 9: `cards`

**Purpose:** Every card ever generated — including drafts, rejections, edits, and sends. The full audit trail is the intelligence layer for card DNA.

```sql
CREATE TABLE cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),

  -- Event context
  event_id        UUID REFERENCES recipient_events(id),
  event_type      TEXT NOT NULL,
  event_date      DATE,
  occasion_year   INTEGER,             -- which year of this event (for "5th birthday", "10th anniversary")

  -- Generation
  generation_version TEXT NOT NULL DEFAULT 'v2',   -- v1 | v2
  archetype       TEXT,                -- Roast | Love | Appreciation | Nostalgia | etc.
  prompt_snapshot JSONB,               -- full prompt context at generation time (for debugging/learning)

  -- Message
  message_original TEXT NOT NULL,      -- exactly what the AI first generated
  message_final   TEXT NOT NULL,       -- what was actually sent (may have been edited)
  was_edited      BOOLEAN NOT NULL DEFAULT false,
  edit_instructions TEXT[],            -- what the user asked for when editing

  -- Card design
  handwrytten_card_id TEXT,
  card_name       TEXT,
  font_id         TEXT,

  -- Status
  status          TEXT NOT NULL DEFAULT 'draft',
  -- draft | pending_approval | approved | rejected | sent | delivered | cancelled

  -- Approval
  approved_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Delivery
  mailed_at       TIMESTAMPTZ,
  handwrytten_order_id TEXT,
  estimated_delivery DATE,

  -- Feedback
  user_rating     INTEGER,             -- 1-5 stars if we add explicit feedback
  feedback_notes  TEXT,                -- optional free text
  would_use_again BOOLEAN,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_recipient ON cards(recipient_id);
CREATE INDEX idx_cards_user ON cards(user_id);
CREATE INDEX idx_cards_status ON cards(recipient_id, status);
CREATE INDEX idx_cards_event_type ON cards(recipient_id, event_type);
CREATE INDEX idx_cards_sent ON cards(mailed_at) WHERE mailed_at IS NOT NULL;
```

---

### Table 10: `life_events`

**Purpose:** Significant moments in a recipient's life. Different from recurring calendar events — these are one-time milestones. They feed into future card context, relationship coaching, and proactive suggestions.

```sql
CREATE TABLE life_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  event_type      TEXT NOT NULL,
  -- job_change | promotion | loss | health | move | marriage | divorce | new_baby |
  -- graduation | retirement | new_home | pet | breakup | achievement | struggle | other

  title           TEXT NOT NULL,       -- "Got promoted to VP", "Lost her dad", "Had twins"
  detail          TEXT,                -- longer description
  occurred_on     DATE,                -- approximate is fine
  occurred_on_approx BOOLEAN DEFAULT false,  -- if the date is approximate

  -- Emotional weight
  sentiment       TEXT,                -- positive | negative | neutral | mixed
  significance    INTEGER,             -- 1-5 (1 = minor, 5 = life-defining)

  -- Source
  source          TEXT NOT NULL,       -- briefing | user_note | ai_inferred
  source_id       UUID,

  -- Flags
  follow_up_needed BOOLEAN DEFAULT false,   -- system should ask about this in future
  follow_up_after  DATE,                    -- when to follow up
  followed_up_at   TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_life_events_recipient ON life_events(recipient_id);
CREATE INDEX idx_life_events_type ON life_events(recipient_id, event_type);
CREATE INDEX idx_life_events_follow_up ON life_events(follow_up_after)
  WHERE follow_up_needed = true AND followed_up_at IS NULL;
```

---

### Table 11: `relationship_snapshots`

**Purpose:** Point-in-time captures of the relationship state and Brownie Points score. Enables trend analysis, year-over-year comparison, and longitudinal health tracking.

```sql
CREATE TABLE relationship_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),

  snapshot_date   DATE NOT NULL,
  brownie_points  INTEGER NOT NULL,        -- 0-100 score at this moment
  memory_score    INTEGER NOT NULL,        -- profile completeness 0-100
  cards_sent_ytd  INTEGER NOT NULL DEFAULT 0,
  events_covered  INTEGER NOT NULL DEFAULT 0,
  events_missed   INTEGER NOT NULL DEFAULT 0,

  -- Dimensional scores (for sparkline breakdowns)
  score_events    INTEGER,
  score_memory    INTEGER,
  score_preferences INTEGER,
  score_actions   INTEGER,
  score_engagement INTEGER,

  -- AI synthesis note
  health_summary  TEXT,    -- one sentence: "Strong year — 3 cards sent, profile nearly complete"

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_recipient ON relationship_snapshots(recipient_id, snapshot_date);
CREATE UNIQUE INDEX idx_snapshots_daily ON relationship_snapshots(recipient_id, snapshot_date);
```

---

### Table 12: `question_schedule`

**Purpose:** The question engine's work queue — which questions are planned for which recipients, when, and why.

```sql
CREATE TABLE question_schedule (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  question_id     UUID NOT NULL REFERENCES questions(id),

  priority        INTEGER NOT NULL DEFAULT 50,   -- 1 (urgent) to 100 (low priority)
  reason          TEXT,                           -- "upcoming birthday in 14 days"
  trigger_type    TEXT NOT NULL,                  -- event_briefing | checkin | gap_fill | staleness
  scheduled_for   DATE NOT NULL,
  expires_at      DATE,                           -- if not asked by this date, deprioritize

  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | asked | answered | skipped | expired
  asked_at        TIMESTAMPTZ,
  answer_id       UUID REFERENCES question_answers(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qschedule_user ON question_schedule(user_id, scheduled_for, status);
CREATE INDEX idx_qschedule_recipient ON question_schedule(recipient_id, status);
```

---

### Table 13: `gift_suggestions`

**Purpose:** AI-generated gift ideas for a recipient, with feedback tracking.

```sql
CREATE TABLE gift_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),

  occasion        TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  price_range     TEXT,              -- "$25-$50"
  category        TEXT,             -- experience | physical | consumable | digital | donation
  source_url      TEXT,

  -- Generation context
  based_on        TEXT[],            -- knowledge_item IDs or slugs that drove this suggestion
  confidence      NUMERIC(3,2),

  -- Feedback
  status          TEXT NOT NULL DEFAULT 'suggested',  -- suggested | saved | purchased | rejected
  rejected_reason TEXT,
  purchased_at    TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gifts_recipient ON gift_suggestions(recipient_id);
CREATE INDEX idx_gifts_status ON gift_suggestions(recipient_id, status);
```

---

### Table 14: `relationship_insights`

**Purpose:** AI-generated observations about the relationship — patterns, recommendations, coaching notes.

```sql
CREATE TABLE relationship_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),

  insight_type    TEXT NOT NULL,
  -- pattern | recommendation | coaching | gap | milestone | warning | celebration

  title           TEXT NOT NULL,    -- "You haven't mentioned a shared memory this year"
  body            TEXT NOT NULL,    -- full insight text
  action_prompt   TEXT,             -- "Add a memory from this past year"

  -- Lifecycle
  is_read         BOOLEAN NOT NULL DEFAULT false,
  is_dismissed    BOOLEAN NOT NULL DEFAULT false,
  is_acted_on     BOOLEAN NOT NULL DEFAULT false,
  expires_at      TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_insights_recipient ON relationship_insights(recipient_id, is_dismissed);
CREATE INDEX idx_insights_user_unread ON relationship_insights(user_id, is_read)
  WHERE is_read = false AND is_dismissed = false;
```

---

## 4. Memory Architecture

### Three Tiers of Memory

Memory should be organized into three distinct tiers, each with different write frequency, decay rates, and AI access patterns.

---

**Tier 1: Permanent Facts**

These are things that are true forever and never need to be asked again. They have no decay.

Examples:
- Birthday, hometown, how the relationship started, college attended, year they met, their children's names (once known)

Source: Explicitly entered by user or captured in first briefing.

Storage: `knowledge_items` with `is_permanent = true`. Also mirrored into `recipient_memory.permanent_facts` JSONB for fast AI access.

---

**Tier 2: Slow-Changing Context**

These facts are true for months or years but eventually become stale. They should be refreshed periodically.

Examples:
- Current job, current city, current relationship status, life stage ("new parent"), active hobbies, health context

Decay policy:
- `refresh_after` = 18 months from `observed_at` by default
- High-volatility categories (job, relationship status) = 12 months
- Low-volatility categories (hometown, personality) = 3 years or never

Storage: `knowledge_items` with `refresh_after` set. The question engine automatically schedules a refresh question when this date approaches.

---

**Tier 3: Living Memory**

Recent events, current emotional context, things that happened this year. These are highly time-sensitive and should inform the next card but fade from primary context after 12–18 months.

Examples:
- "Just got promoted," "had a hard summer," "got a new puppy named Biscuit," "started therapy," "ran her first marathon"

Source: Briefing answers, life events table, user notes.

Decay policy:
- `valid_until` = 18 months from `observed_at`
- After expiry, record is not deleted — it is archived and moved to historical context
- The AI can still access archived memory via `relationship_timeline` queries, but it no longer injects them as current context

Storage: `knowledge_items` with `valid_until` set. Also summarized into `recipient_memory.current_chapter` JSONB.

---

### Memory Synthesis

Once a week (or after any significant update), an AI synthesis pass runs on each recipient with recent changes. This pass:

1. Reads all active `knowledge_items` for the recipient
2. Reads the last 5 `cards` for the recipient
3. Reads any new `life_events`
4. Generates an updated `recipient_memory` summary (all 5 JSONB fields)
5. Updates `memory_score` and `last_synthesized_at`

The synthesis output is what the card generator reads — not raw knowledge items. This keeps the prompt clean and prevents token bloat.

---

### What Information Lives Where

| Information | Primary Table | Notes |
|---|---|---|
| Birthday, address | `recipients` | Profile-level, directly queryable |
| Relationship type, nickname | `recipients` | Identity layer |
| Personality traits, tone preference | `recipient_profile` | Editable, structured |
| Hobbies, interests, dislikes | `recipient_profile` + `knowledge_items` | Profile is the curated version; items are the raw feed |
| Inside jokes, favorite memories | `knowledge_items` (category: joke / memory) | Allows freshness decay, sourcing |
| Briefing answers | `question_answers` | Full audit trail per event |
| Life milestones | `life_events` | Timestamped, sentiment-tagged |
| Card history | `cards` | Full draft → sent → feedback trail |
| AI-synthesized context | `recipient_memory` | Fast-access for prompt construction |
| Brownie Points history | `relationship_snapshots` | Daily snapshot, queryable for trends |

---

## 5. Question Engine Architecture

### Core Problem

The system needs to continuously learn about recipients without annoying users. The question engine must be proactive but patient, smart enough to know when to ask and when to wait, and deeply aware of what it already knows.

---

### Question Prioritization Algorithm

Every pending question in `question_schedule` has a `priority` score (1 = urgent, 100 = lowest). The engine computes this score dynamically at scheduling time using:

```
priority = base_value
         - event_urgency_bonus     (up to -30 if an event is < 14 days away)
         - gap_penalty             (up to -20 if this category has zero answers)
         - staleness_bonus         (up to -15 if existing answer is stale)
         + saturation_penalty      (+20 if this category already has 5+ good answers)
         + recent_skip_penalty     (+30 if user skipped this question in the last 30 days)
```

Lower score = higher priority.

The engine surfaces the highest-priority question for each upcoming event during the briefing flow, and surfaces general gap-fill questions during low-stakes moments (dashboard idle state, settings page, etc.).

---

### When to Ask Questions

**Event-triggered (highest priority):**
When a card is due in the next 14–30 days, the engine activates a briefing window. It presents 2–3 questions specifically about what's happening in that recipient's life right now, what the user wants to reference, and any recent updates. These questions appear as the "personalize this card" flow.

**Gap-triggered:**
When a recipient's memory score is below a threshold (e.g., < 50), the system identifies the highest-value unanswered category and schedules a low-friction question. This surfaces as a gentle prompt on the dashboard or recipient profile: "We don't know much about [Name]'s hobbies yet — add something?"

**Staleness-triggered:**
When a `knowledge_item.refresh_after` date passes, the engine schedules a check-in: "Last year you mentioned [Name] was [thing]. Is that still true?" This is the most important mechanism for keeping memory fresh over years.

**User-initiated:**
The recipient profile page should always have an "Add something new about [Name]" entry point. This feeds directly into `knowledge_items` with `source = user_note`.

---

### Questions by Relationship Type

Different relationship types have different information gaps that matter.

**Spouse / Partner:**
- Shared memories and milestones are the most valuable category
- "What's something you both did this year you want to remember?"
- "What has she been stressed about lately?"
- "What have you called each other since the beginning?"
- Card DNA questions: does she like sentimental or funny? How does she react to vulnerability in writing?

**Parent:**
- Health context is high-value and often unasked
- "How is your mom doing health-wise?"
- "What's something she sacrificed for you this year?"
- "What does she worry about?"
- For aging parents: "Is there anything she can't do now that she used to?"

**Child:**
- Life stage changes rapidly — refresh more frequently (every 6–12 months)
- "What's their biggest thing this year — school, sports, friends?"
- "What do they call you?"
- "What are they really into right now?"

**Sibling:**
- Shared history questions are gold
- "What's the most chaotic thing you two did growing up?"
- "What do you argue about?"
- "What do you admire about them that you never say out loud?"

**Friend:**
- Current-life context is the highest value for this relationship
- "What are they going through right now?"
- "What do you two always talk about?"
- "Is there anything they're stressed about?"

**Coworker:**
- Professional context matters; personal questions should be optional and low-pressure
- "What does [Name] do well that goes unnoticed?"
- "What occasion are you marking?" (most coworker cards are milestone/achievement based)

**Client:**
- Business context is primary
- "What was their biggest win this year?"
- "What do you know about them personally?" (kids, hobbies, etc. are bonus)
- "What business milestone are you acknowledging?"

---

### Avoiding Repetition

Every question asked is recorded in `question_answers`. Before scheduling any question, the engine checks:

1. Has this question been asked for this recipient in the last 90 days? If yes, skip unless staleness applies.
2. Has the user answered this question for this recipient before? If yes, serve the refresh version ("You mentioned X — anything new?") rather than the original form.
3. Has the user skipped this question twice for this recipient? Flag it as low-priority — they probably don't know the answer.

---

### Staleness Detection

Every `knowledge_item` has a `refresh_after` date. Default values by category:

| Category | Refresh After | Rationale |
|---|---|---|
| Hobbies / Interests | 18 months | People's interests change |
| Current Job | 12 months | Career changes are common |
| Life Stage | 12 months | New baby, retirement, etc. |
| Health Context | 12 months | Conditions can improve or worsen |
| Relationship Dynamic | 24 months | Slow-changing |
| Personality Traits | 36 months | Rarely change |
| Permanent Facts | Never | Birthday, hometown, etc. |
| Living Memory | 18 months | Recent events become historical |

When `refresh_after` passes, the item is not deleted. It is flagged as stale in queries, and the question engine schedules a refresh question.

---

### Memory Completeness Scoring

Each recipient's `memory_score` (stored in `recipient_memory`) is computed across 6 dimensions:

| Dimension | Weight | Signals |
|---|---|---|
| Identity Depth | 15% | nickname, relationship label, years known, how they met |
| Event Coverage | 20% | active events with upcoming dates |
| Personality | 20% | traits, humor style, love language, communication style |
| Living Knowledge | 25% | non-stale knowledge items across ≥3 categories |
| Card History | 10% | at least 1 sent card; bonus for 3+ |
| AI Utility | 10% | hard_stops, always_dos, tone preference, emotional openness |

Score of 0–100. The question engine uses this to identify which recipients need the most attention. The dashboard surfaces this as "Help us get to know [Name] better" when score < 40.

**When is enough, enough?** A recipient at 80+ is considered "well-known." The system stops gap-filling questions and only asks event-triggered briefings and staleness refreshes. A score of 90+ means the AI has enough to produce excellent, personalized cards reliably — the system should celebrate this on the dashboard.

---

## 6. Brownie Points Evolution

### Current Problem

The current score measures profile completeness at render time. A user could fill out a recipient's profile once and never engage again, and the score would stay high. This does not reflect actual relationship health.

---

### Redesigned Score: 5 Dimensions

Brownie Points should measure the health of the *relationship management* over time, not just the depth of the profile.

| Dimension | Weight | What It Measures |
|---|---|---|
| **Memory Quality** | 25% | How deep and fresh is the AI's knowledge of this recipient? |
| **Event Coverage** | 20% | Are important dates covered? Are cards going out? |
| **Engagement** | 20% | Is the user actively learning about this recipient over time? |
| **Card Performance** | 20% | Are cards being sent, approved, and not rejected? |
| **Completeness** | 15% | Are the basics filled in (address, tone preference, etc.)? |

---

### What Increases the Score

- A card is approved and sent on time (+8)
- A briefing is completed before an event (+5)
- A new knowledge item is added (first in a category) (+4)
- A staleness refresh is completed (+3)
- A life event is logged (+3)
- A new important date is added (+2)
- A previously missed event now has a card scheduled (+6)
- Memory score improves (scales with improvement)

---

### What Decreases the Score

- An event passes with no card sent (−10, scaled by relationship tier)
- A card is rejected (−5)
- A knowledge item goes stale without refresh (−2 per item, up to −10 total)
- No user interaction with this recipient's profile in 180+ days (slow decay: −1/month)
- A briefing window opened but no questions answered (−3)
- Address is missing (−5 flat, blocks action readiness)

---

### Memory Quality Effect

Memory quality (the `memory_score` from `recipient_memory`) directly maps to Brownie Points Memory Quality dimension:

| Memory Score | BP Contribution |
|---|---|
| 0–20 | 0 points |
| 21–40 | 5 points |
| 41–60 | 12 points |
| 61–80 | 18 points |
| 81–100 | 25 points |

Stale knowledge items apply a freshness multiplier (same decay schedule as current system).

---

### Relationship Tier Weighting

Brownie Points remains a weighted average across all recipients, using the same tier system (Core / Important / Occasional), but tier weights now also affect how much a missed event hurts.

Missing a Core recipient's birthday: −10 points globally  
Missing an Occasional recipient's custom event: −2 points globally

---

### Long-Term Health Measurement

`relationship_snapshots` enables true longitudinal tracking:
- "Your overall relationship health has improved 12 points in the last 6 months"
- "You've sent 8 cards this year — your best year yet"
- "Your memory of [Name] has gone from 32 to 78 — she's your most known recipient"

The dashboard should surface these year-over-year comparisons, not just today's score.

---

### Brownie Points Tiers (Retained from Current System)

- 91–98: Legend Status
- 76–90: Thoughtful Human
- 51–75: Building Momentum
- 26–50: Staying Out of Trouble
- 0–25: Just Surviving

Score is still displayed capped at 98. The goal of "100" is never reachable — relationships always have room to grow.

---

## 7. AI Personalization Architecture

### What the AI Reads

When generating a card, the AI receives a structured context payload assembled from the intelligence layer. The payload should contain:

```json
{
  "recipient": {
    "name": "Sarah",
    "nickname": "Sare Bear",
    "relationship": "best friend since college",
    "years_known": 14
  },
  "occasion": {
    "type": "birthday",
    "year": 2026,
    "milestone": false
  },
  "permanent_facts": {
    "hometown": "Cleveland",
    "college": "Ohio State",
    "job": "middle school art teacher"
  },
  "current_chapter": {
    "recent_events": ["started dating someone new", "ran her first half marathon"],
    "current_mood": "rebuilding and ambitious year"
  },
  "personality": {
    "traits": ["sarcastic", "generous", "secretly soft"],
    "humor": "dry wit",
    "emotional_openness": "meaningful but not mushy"
  },
  "relationship_dna": {
    "dynamic": "she's the planner, I'm the chaos",
    "recurring_themes": ["road trips", "bad decisions that became good stories"],
    "sender_role": "the one who always makes her laugh when she needs it"
  },
  "card_dna": {
    "avg_length_words": 72,
    "preferred_structure": "callback-to-memory + present moment + forward look",
    "words_that_landed": ["decade", "chaos", "legend"],
    "last_3_cards": ["birthday_2025", "christmas_2024", "birthday_2024"]
  },
  "hard_stops": ["do not mention her ex by name", "avoid anything about weight"],
  "always_dos": ["reference a road trip", "acknowledge that she shows up for everyone"],
  "sender": {
    "name": "Kelsey",
    "sign_off": "Love always"
  },
  "archetype": "Nostalgia"
}
```

This payload is assembled server-side from the intelligence layer and passed to the generation prompt. The prompt itself does not need to ask the AI to remember or figure out the context — it is given.

---

### Avoiding Repetition Over Years

The `cards` table stores `message_original` and the `prompt_snapshot.archetype` for every card. Before generating a new card:

1. Fetch the last 4–6 cards for this recipient + event type combination
2. Extract archetypes used, key phrases used, structural patterns used
3. Inject into the prompt: "Previous cards for this person used the Nostalgia archetype and referenced the 2019 Napa trip. Do not repeat. Choose a different entry point."

This prevents the system from producing the same card year after year, which is the most common complaint about automated card services.

---

### Learning from Edits

When a user edits a card and the `was_edited = true` field is set:
1. The `edit_instructions` are stored in the `cards` table
2. These are extracted and fed into `card_dna` during the next memory synthesis pass
3. Pattern: user consistently asks to "make it shorter" → update `card_dna.avg_length_words` downward
4. Pattern: user consistently adds humor → shift `archetype` preference

---

### Learning from Rejections

When a card is rejected:
1. `cards.status = 'rejected'` and optionally `rejection_reason` is captured
2. If the rejection reason contains signal ("too formal," "sounds nothing like me"), extract it into a new `knowledge_item` with `category = avoid` and `source = card_feedback`
3. This feeds into `hard_stops` in the next synthesis pass

---

### Permanent vs. Temporary Facts in Prompts

The AI payload should always clearly label which facts are permanent, which are current, and which are historical:

- `permanent_facts` → inject freely, always trust
- `current_chapter` → inject as "this year's context"; the AI should reference these prominently
- Historical memory → inject sparingly as callbacks: "note that in 2023 she [X]" — useful for anniversary milestone cards

The AI should be explicitly instructed: "Current chapter facts are from the last 12–18 months. Reference them as recent. Permanent facts are long-standing truths. Do not mix them."

---

### Relationship Timeline for Anniversary / Milestone Cards

The `cards` table, combined with `life_events` and `recipient_events`, forms a relationship timeline. For milestone occasions (10th anniversary, 40th birthday, etc.), the AI can be given a compressed timeline:

```
2015: First card sent (birthday). Topic: inside joke about road trip.
2017: Life event - she got married.
2019: Birthday card referenced Napa trip. User rating: 5 stars.
2021: Life event - had first kid.
2024: Birthday card. User edited to add a reference to her promotion.
2026: 40th birthday (current occasion).
```

This enables genuinely long-memory, milestone-quality cards that reference the arc of the relationship — something no competitor can produce without years of accumulated data.

---

## 8. Data Model for Future Features

### Gift Recommendations

**Required data:** `knowledge_items` (hobbies, interests, life stage), `recipient_events` (upcoming occasion), `gift_suggestions` table, `cards.user_rating` (proxy for satisfaction)

**How it works:** When a card approaches, the system optionally surfaces a gift suggestion alongside it. The AI reads the recipient's interests, current life chapter, price range preference (user-set), and past rejected gifts, and generates 3–5 ideas ranked by confidence.

---

### Relationship Coaching

**Required data:** `relationship_snapshots` (trend), `life_events` (recent stress events), `cards` (gap analysis — events with no card), `relationship_insights` table

**How it works:** The system generates a weekly or monthly "relationship check-in" insight for each high-tier recipient. "You haven't connected with [Name] since her mom passed. A card now would mean a lot." This requires the `life_events` table to be populated with negative-sentiment events that have `follow_up_needed = true`.

---

### Event Detection

**Required data:** `question_answers` (briefing text), `life_events`, AI NLP pass on briefing text

**How it works:** When a user types a free-text briefing answer — "she just lost her job and has been really stressed" — the system runs a lightweight NLP extraction pass and automatically creates a `life_events` record. No extra user effort. The event feeds future coaching and future card context automatically.

---

### Life Milestone Tracking

**Required data:** `life_events` + `recipient_events` with `event_type = life_milestone`

**How it works:** One year after logging "she had a baby," the system schedules a first birthday card for the baby and a "how are you doing as a new mom?" check-in prompt. This is autonomous milestone awareness — the system proactively schedules follow-on actions from life events.

---

### Conversation Starters

**Required data:** `knowledge_items` (interests, life stage, current chapter), `life_events`, `cards` (last topic)

**How it works:** Before a phone call or visit, the user can tap "conversation starter" on a recipient profile. The AI reads the current knowledge state and suggests 3 conversation openers: "Ask her how the marathon training is going," "Mention you saw a great true crime podcast she'd like," "Check in about her mom's health." This requires zero new infrastructure — it is a new prompt over existing data.

---

### Proactive Reminders

**Required data:** `recipient_events` (scheduler), `life_events` (follow_up_after), `relationship_snapshots` (engagement gaps)

**How it works:** The system sends a proactive prompt (email or in-app) when:
- An event is 30/14/7 days away with no card scheduled
- A `life_events.follow_up_after` date arrives
- A recipient's `relationship_snapshots` engagement drops for 90+ days
- A staleness refresh is overdue for a high-tier recipient

---

## 9. Migration Path

### Phase 1: Stabilize the Foundation (Do First)

**Goal:** Stop data loss without breaking anything for existing users.

1. **Move localStorage writes to server-side first.** Continue reading from localStorage for the UI, but write to the server on every save. This is a dual-write phase — the server becomes the source of truth without breaking existing clients.

2. **Normalize the `personal_recipients.data` blob.** Add a background migration job that reads each blob row and inserts the structured fields into the new `recipients` + `recipient_profile` tables. Keep the old blob column as a fallback for 60 days, then drop it.

3. **Create the `cards` table and backfill.** Any `CardOrder` objects in localStorage that have been sent should be inserted into the `cards` table. This gives you a history baseline to build on.

4. **Migrate briefing answers to `question_answers`.** All existing briefing data in localStorage should be extracted and written into `question_answers` with `trigger_type = event_briefing` and `source = legacy_migration`.

---

### Phase 2: Build the Question Engine

1. Author the initial question library (50–100 questions across all categories and relationship types)
2. Build the `question_schedule` population logic (event-triggered + gap-triggered)
3. Replace the current briefing flow with the new question engine
4. Start populating `knowledge_items` from question answers

---

### Phase 3: AI Intelligence Layer

1. Build the memory synthesis job (weekly pass, updates `recipient_memory`)
2. Refactor card generation to use the structured context payload instead of raw profile fields
3. Add card performance feedback tracking to `cards`
4. Build card DNA extraction from edit history

---

### Phase 4: Brownie Points Redesign

1. Implement the 5-dimension scoring model
2. Start writing daily `relationship_snapshots`
3. Build trend display into the dashboard
4. Expose dimension breakdowns to users ("why is my score low?")

---

### Phase 5: Future Features

5a. Gift recommendations (requires solid `knowledge_items` population)  
5b. Life event detection from briefing NLP  
5c. Relationship coaching insights  
5d. Conversation starters  
5e. Proactive scheduling from life milestones  

---

## 10. Fix Now Before More Data Accumulates

These are the things that become significantly harder to fix as user data grows. Do them before scale.

**1. Stop relying on localStorage as primary storage.**  
Every day you wait, more users are at risk of permanent data loss. This is the single most important fix. Build server-first writes with localStorage as a cache, not a source of truth.

**2. Start writing to a `cards` table.**  
Every card that goes out without a history record is lost intelligence. You will never be able to reconstruct it. Start now, even with a minimal schema. Backfill is impossible — only forward fill is available.

**3. Assign stable UUIDs to recipients and preserve them.**  
Currently, if a user's localStorage is cleared, their recipients get new UUIDs on re-sync. This breaks any future cross-table join and destroys knowledge history. Recipients need stable, server-generated IDs from the moment of creation.

**4. Store briefing answers, don't discard them.**  
The most valuable moment of user input happens during briefing. Every answer discarded after the card is sent is a permanent knowledge loss. Wire briefing answers to the server before the question engine is built.

**5. Add a `sent_at` timestamp to every card order.**  
You currently have no way to know which cards were actually mailed versus approved-but-not-sent. This makes it impossible to calculate "cards sent per year" — a core Brownie Points metric.

**6. Deduplicate recipients now, while user counts are small.**  
Adding a name+birthday uniqueness check (with a soft warning, not a hard block) now costs almost nothing. At 10,000 users, cleaning up duplicate recipients is a nightmare.

---

## 11. Recommended Implementation Order

| Priority | What | Why |
|---|---|---|
| **1** | Server-first writes for all recipient data | Stops data loss immediately |
| **2** | `cards` table + start logging every card | Enables card DNA, avoids repetition, enables history features |
| **3** | Normalize recipients out of JSON blob | Unlocks every future query, scheduler, and intelligence feature |
| **4** | Store briefing answers in `question_answers` | Preserves the most valuable user input |
| **5** | `knowledge_items` table + populate from profile + briefings | Foundation of the intelligence layer |
| **6** | Question engine + question library | Enables continuous learning |
| **7** | Memory synthesis job | Makes AI smarter over time |
| **8** | Card context payload refactor | Improves card quality immediately |
| **9** | Card DNA (edit learning, repetition avoidance) | Long-term card quality |
| **10** | 5-dimension Brownie Points + snapshots | Meaningful health tracking |
| **11** | Life events table + detection | Enables coaching, follow-up, milestone tracking |
| **12** | Gift suggestions | Revenue and engagement |
| **13** | Relationship insights + coaching | Retention and differentiation |

---

*The core asset of FIForgot is not the card. It is the accumulated knowledge of every relationship, deepened over years, that makes every future card better than the last. The architecture above is designed to protect that asset, grow it continuously, and eventually make it the most comprehensive relationship memory system a consumer has ever trusted with the people they love.*
