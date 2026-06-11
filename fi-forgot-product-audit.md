# F.I. Forgot — Product & UX Architecture Audit
**Date:** June 11, 2026  
**Prepared for:** Independent Product Review  
**Scope:** Full codebase audit of the `fi-forgot` consumer web application and supporting API server

---

## Table of Contents
1. [Site Map](#1-site-map)
2. [User Flows](#2-user-flows)
3. [Question Engine](#3-question-engine)
4. [Dashboard Structure](#4-dashboard-structure)
5. [Database Entities](#5-database-entities)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Feature Inventory](#7-feature-inventory)
8. [Conversion Funnel](#8-conversion-funnel)
9. [Known UX Risks](#9-known-ux-risks)

---

## 1. Site Map

### 1.1 Public Routes (No Authentication Required)

| Route | Page | Primary Purpose |
|---|---|---|
| `/` | Landing Page | Product overview and conversion. "Relationship Damage Control" headline. Sections: How It Works, Pricing, CTA. |
| `/login` | Auth Page (Sign In mode) | Email + password sign-in. |
| `/signup` | Auth Page (Sign Up mode) | New account registration. |
| `/try` | Card Flow V2 Demo | "See how it works" interactive walkthrough. Aliased at `/v2`. |
| `/subscribe` | Subscribe Page | Pricing plans (Bare Minimum, Domestic Peacekeeper, Legend Status). |
| `/checkout/success` | Checkout Success | Post-Stripe-payment confirmation. |
| `/demo/:id` | Demo Preview | Public shareable preview for card demos. |
| `/preview/:token` | Card Preview | Public card preview link distributed via email. |
| `/business` | Business Landing | Marketing page for the B2B/enterprise tier. |
| `/business-demo` | Business Demo | Interactive walkthrough for business prospects. |
| `/business/signup` | Business Sign Up | Account creation for business users. |
| `/business/login` | Business Login | Sign-in for business users. |
| `/business/dashboard` | Business Dashboard | Workspace management for business accounts (internal auth check). |
| `/business/approve/:t` | Business Approve | Token-based card approval link for business tier. |

### 1.2 Protected Routes (Authentication + Onboarding Required)

| Route | Page | Primary Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Main hub: relationship health, upcoming moments, quick actions, health score. |
| `/recipients` | Recipients List | Legacy list/management view for "Important People." |
| `/recipients/:id` | Recipient Profile | Deep view for a single recipient: timeline, health score, profile answers, actions. |
| `/people` | People Page | Newer alternative view for recipient management. |
| `/moments` | Moments Page | Calendar-forward view of upcoming events and holidays. |
| `/quick-card` | Quick Card | Streamlined card-send flow (partially implemented; see Feature Inventory). |
| `/briefings/:rId/:event` | Briefing Page | Guided question flow to gather event-specific context before card generation. |
| `/cards/generate` | Card Generator | AI card text generation, tone selection, and editing interface. |
| `/cards/review` | Cards Review | Queue for reviewing and approving pending card drafts before sending. |
| `/brownie-points` | Brownie Points | Gamified relationship health tracking and points history. |
| `/settings/reminders` | Reminder Settings | Notification cadence, autopilot mode toggle, lead-time configuration. |
| `/admin` | Admin Panel | Internal dashboard (email-restricted). Sub-tabs: Customer Management, Print Queue, AI Card Library. |

### 1.3 Navigation Paths

```
/  ──── Sign Up ────► /signup ──► /onboarding ──► /dashboard
/  ──── Sign In ────► /login  ──► /dashboard
/  ──── Try It ─────► /try
/  ──── Business ───► /business ──► /business/signup ──► /business/dashboard

/dashboard ─────────► /recipients/:id   (via person card)
/dashboard ─────────► /cards/review     (via approval badge or "review" CTA)
/dashboard ─────────► /cards/generate   (via "generate" CTA on upcoming moment)
/dashboard ─────────► /briefings/:r/:e  (via "add details" CTA on upcoming moment)
/dashboard ─────────► /brownie-points   (via cookie counter)
/people ────────────► /recipients/:id
/moments ───────────► /cards/generate   (via moment CTA)
/cards/generate ────► /cards/review
/settings/reminders ► /dashboard        (after save)
```

---

## 2. User Flows

### 2.1 New User Journey — Homepage to First Card Sent

```
Step 1: Landing Page (/)
   → Reads headline, scrolls through "How It Works"
   → Clicks "Try It Free" or "Get Started"

Step 2: Sign Up (/signup)
   → Enters email + password
   → Account created, redirected to /onboarding

Step 3: Onboarding (/onboarding) — Multi-step wizard
   Sub-step A: Add first recipient
     - Enter name and relationship type
     - Select occasions (Birthday, Anniversary, Holidays, etc.)
     - Enter birthday / anniversary date if applicable
     - Enter personality traits (max 2 tags)
     - Enter interests
     - Tone preference (Sweet / Funny / Romantic / Simple / etc.)
     - Optional: pet name, years together, things to avoid
     - Optional: mailing address
   Sub-step B: Sender identity
     - Sender's name / preferred signature
   → Redirected to /dashboard on completion

Step 4: Dashboard (/dashboard)
   → Sees "Upcoming Moments" section with their first event
   → Sees health score gaps (missing address, memory, etc.)
   → Sees "Recommended Next Step" card suggesting an action

Step 5: Briefing or Card Generation
   → Clicks "Generate" on an upcoming moment ─► /cards/generate
   OR clicks "Add Details" ─► /briefings/:rId/:event (question flow)
   → After briefing, redirected to /cards/generate

Step 6: Card Generator (/cards/generate)
   → AI generates card message using recipient profile context
   → User selects tone (Sweet, Funny, Romantic, Simple, Religious, etc.)
   → Can click "Make warmer / funnier / shorter / more emotional / Rewrite"
   → User approves the message

Step 7: Review Queue (/cards/review)
   → Card enters "Pending Approval" state
   → User sees card preview (image + message)
   → Clicks "Approve & Send"
   → Card submitted to Handwrytten for physical printing and mailing

Step 8: Confirmation
   → Card status updates to "mailed"
   → Timeline entry created
   → Brownie Points awarded (+25 pts for card sent, bonus if ≥7 days early)
```

### 2.2 Returning User Journey

```
Step 1: Sign In (/login) ─► /dashboard

Step 2: Dashboard scan
   → Checks "Upcoming Moments" — sees any events needing attention
   → Checks approval badge in nav (red pill if cards pending)
   → Reviews "Relationship Insights" alerts

Step 3: If cards pending review
   → Navigates to /cards/review
   → Approves or requests edits

Step 4: If upcoming moment flagged
   → Answers briefing question OR generates card directly

Step 5: If fresh update due
   → Navigated to recipient profile or briefing page
   → Answers rotating fresh update question about recipient's life
   → Brownie Points awarded

Step 6: Optional — Profile maintenance
   → Opens /recipients/:id
   → Updates memories, interests, or mailing address
   → Health score updates in real time
```

### 2.3 Recipient Creation Flow

```
Entry points:
   - Onboarding wizard (first recipient)
   - /people or /recipients page ("Add Person" button)

Collected fields (in order):
  1. First name + Last name
  2. Relationship type (Wife, Mom, Dad, Sister, Friend, Client, etc.)
  3. Occasions to track (Birthday, Anniversary, Mother's Day, etc.)
  4. Birthday date (if Birthday selected)
  5. Anniversary date (if Anniversary selected)
  6. Personality traits (multi-select, max 2)
  7. Interests (free text)
  8. Preferred tone
  9. Pet name / nickname (optional)
  10. Years together (optional, partner-type relationships only)
  11. Things to avoid in cards (optional — prevents AI hallucinations)
  12. Mailing address (optional at creation, required before first send)

Plan gate: If the user has reached their plan's recipient cap,
   creation is blocked and an upgrade prompt is shown.
```

### 2.4 Card Generation Flow (Detailed)

```
Trigger: User clicks "Generate Card" for a recipient/event

1. Context Assembly
   → API pulls recipient profile (traits, interests, tone, memories,
     inside jokes, hard avoids, past card history)
   → Selects card design from AI Card Library (or falls back to Handwrytten catalog)
   → GPT-4o "card picker" evaluates candidate designs for fit

2. Message Generation (/api/v2/generate-card)
   → Prompt enforces: ≥2 specific memory references, no banned phrases
   → Multiple tone variants generated simultaneously
   → "Guardrail" layer checks output quality score

3. User Editing Interface (/cards/generate)
   → User sees generated message + card image mock
   → Tone selector (changes tone and regenerates)
   → Refinement buttons: Make warmer / Make funnier / Make shorter /
     More emotional / Rewrite
   → Character count / length indicator

4. Approval
   → "Approve" creates pending_approval record
   → Card enters /cards/review queue

5. Send (Handwrytten)
   → createHandwryttenOrder called with cardId, fontId, message,
     recipient address, sender address
   → Physical card printed and mailed
   → trackingUrl stored; status polled (queued → printing → mailed → delivered)
```

### 2.5 Card Approval and Sending Flow

```
State machine: draft → approved → mailed → delivered

Review UI (/cards/review):
   → Shows card image + full message text
   → User can edit message before approving
   → Approve button → triggers Handwrytten order creation
   → Decline / regenerate option available

Automated reminders (if card not reviewed):
   → SendGrid email sent at 24-hour intervals
   → "Final warning" email if mailing date is ≤48 hours away
   → System can auto-approve to ensure on-time delivery if no action taken

Post-send:
   → Timeline entry logged for recipient
   → Brownie Points awarded
   → Card status reflects in dashboard "Upcoming Moments" chip
```

---

## 3. Question Engine

### 3.1 Engine Modes and Priority Order

The question engine operates in three prioritized modes. Mode 1 is active until completion; then modes 2 and 3 alternate.

| Priority | Mode | Trigger | Description |
|---|---|---|---|
| 1 (highest) | `profile_gap` | Profile < 100% complete | Fills permanent profile fields |
| 2 | `follow_up` | 60–120 days after a Fresh Update | AI-generated follow-up on a previous answer |
| 3 | `fresh_update` | Profile complete, no pending follow-up | Rotating life-update prompts |

### 3.2 Profile Question Bank (13 Fields)

These questions fill the permanent `recipient_profile` record. Ordered by priority — highest priority served first.

| # | Field Key | Display Label | Category | Priority |
|---|---|---|---|---|
| 1 | `things_to_avoid` | Things to avoid | Safety | Highest |
| 2 | `interests` | Interests | Personality | High |
| 3 | `favorite_memories` | Favorite memories | Memories | High |
| 4 | `inside_jokes` | Inside jokes | Memories | High |
| 5 | `personality_notes` | Personality notes | Personality | Medium |
| 6 | `personality_traits` | Personality traits | Personality | Medium |
| 7 | `preferred_tone` | Preferred tone | Tone | Medium |
| 8 | `emotional_openness` | Emotional openness | Tone | Medium |
| 9 | `always_include` | Always include | Tone | Medium |
| 10 | `birthday` | Birthday | Setup | Low |
| 11 | `anniversary` | Anniversary | Setup | Low |
| 12 | `delivery_preference` | Delivery preference | Delivery | Low |
| 13 | `briefing_answers` | Briefing answers | Personality | Low |

**Ordering rule within same priority level:** Earlier position in the `QUESTION_BANK` array wins.

**Completion scoring:** `score = (filled_fields / 13) × 100`. A field is "filled" if the profile column has data OR if a `question_answer` record exists for that field key (prevents sticky repeats before background sync completes).

### 3.3 Fresh Update Question Bank

Active after all 13 profile fields are filled. Questions rotate using a "Least Recently Answered" algorithm: never-answered questions come first (in bank order), then previously-answered questions ordered oldest-first.

| Key | Prompt Theme | Category |
|---|---|---|
| `recent_memory` | What's a recent memory with them? | update |
| `current_excitement` | What are they currently excited about? | update |
| `current_challenge` | What challenges are they facing? | update |
| `recent_accomplishment` | Any recent accomplishments? | update |
| `family_news` | Any family news? | update |
| `new_hobby` | Have they picked up any new hobbies? | update |
| `anything_to_remember` | Anything else to remember? | update |

### 3.4 Follow-Up Question Logic

When a `fresh_update` answer is saved:
1. GPT-4o-mini classifies the answer into a category
2. A personalized follow-up question is generated and stored in `follow_up_questions`
3. A `triggerDate` is set based on category:

| Category | Follow-Up Delay |
|---|---|
| `NEW_HOBBY` | 60 days |
| `CHALLENGE` | 60 days |
| `ACCOMPLISHMENT` | 90 days |
| `CAREER` | 90 days |
| `GENERAL` | 90 days |
| `FAMILY` | 120 days |
| `HOME_LIFE` | 120 days |

The follow-up UI shows the **original answer as context** ("Previously you said…") alongside the new question.

### 3.5 Answer Storage Rules

| Mode | Storage Behavior |
|---|---|
| `profile_gap` | **Upsert** — one canonical answer per field per recipient |
| `fresh_update` | **Append** — each answer is a new timestamped record |
| `follow_up` | **Append** — each answer is a new timestamped record |

### 3.6 Freshness Buckets

Fresh update answers are tagged with an age bucket used in card generation context:

| Bucket | Age Range |
|---|---|
| `recent` | < 90 days |
| `mid` | 90–180 days |
| `older` | > 180 days |

---

## 4. Dashboard Structure

### 4.1 Component Order (Top to Bottom)

| # | Component | Visibility Rule |
|---|---|---|
| 1 | **Autopilot Settings Strip** (collapsible) | Always shown. Expandable to configure automation mode, handwriting style, default signature, default tone. |
| 2 | **Empty State** | Only shown if user has zero recipients. CTA: "Add the People Who Matter Most." Replaces sections 3–10 below. |
| 3 | **Page Greeting** | Always shown when recipients exist. Headline: "Your Important People." |
| 4 | **"WE GOT YOUR BACK" Status Strip** | Always shown. Summarizes: moments needing attention, cards ready for review. |
| 5 | **Upcoming Moments** | Shown if ≥1 event exists in the next 90 days. Defaults to showing 3 items (mobile) or 2 (desktop). "Show more" expands full list. Status chips: Draft Ready, Needs Attention Soon. CTAs per item: Review Card / Add Details / Generate. |
| 6 | **Your People Grid** | Always shown. 2-column grid (1-column mobile), first 4 recipients. Shows emoji, name, next event countdown or total occasions. |
| 7 | **Quick Card (Placeholder)** | Always shown, but displays "Coming Soon." |
| 8 | **Relationship Insights** | Shown if any alert conditions are true. Dynamic tags: "Moments at Risk," "People needing updates," "Upcoming events needing attention." |
| 9 | **Relationship Health Section** | Always shown. Full health score breakdown by category. |
| 10 | **Bottom Row — 2 columns** | Always shown. Left: Recommended Next Step card. Right: Plan usage + Brownie Points summary. |

### 4.2 Relationship Health Score Calculation

Total score: 0–100 points, weighted sum of five categories.

| Category | Max Points | Fields Included |
|---|---|---|
| **Event Coverage** | 25 | Birthday (10 pts), Anniversary (8 pts), ≥2 Holidays covered (7 pts) |
| **Memory Bank** | 20 | Memories/favorite moments (8 pts), Inside jokes (7 pts), Personality notes (5 pts) |
| **Preferences** | 20 | Personality traits (6 pts), Interests (7 pts), Preferred tone (4 pts), Emotional openness (3 pts) |
| **Comm Style** | 15 | Sender name/signature (5 pts), Pet name (5 pts), Years together (5 pts — partner relationships only) |
| **Action Readiness** | 20 | Mailing address (10 pts), Preview days set (5 pts), Delivery preference (5 pts) |

**Freshness decay (Memory Bank only):**

| Age | Score Multiplier |
|---|---|
| 0–180 days | 100% |
| 180–365 days | 90% |
| 1–2 years | 80% |
| > 2 years | 70% |

**Overall (multi-recipient) score:** Weighted average. Core relationships (Partner, Mom, Dad) weight ×3; Important relationships weight ×2; Occasional relationships weight ×1.

### 4.3 Brownie Points Calculation

| Action | Points Awarded |
|---|---|
| Profile complete (all 13 fields) | +100 |
| Card approved / sent | +25 |
| Card sent ≥7 days early (bonus) | Additional bonus |
| First fresh update for a recipient | +25 |
| Subsequent fresh updates | +10 |
| New recipient added | +15 |
| Follow-up question answered | +15 |
| Birthday or anniversary added | +10 |
| Card generated | +5 |

**Anti-spam limits:** Max 3 fresh updates credited per recipient per day. Max 5 card generations credited per day.

**Milestone messages** triggered at: 100, 500, 1,000, 2,500, 5,000, and 10,000 total lifetime points.

---

## 5. Database Entities

### 5.1 Core User Table

**`fi_users`**

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `email` | text, unique | |
| `name` | text | |
| `stripe_customer_id` | text | |
| `stripe_subscription_id` | text | |
| `plan` | text | Default: `'basic'` |
| `brownie_points_balance` | integer | Current spendable balance |
| `lifetime_brownie_points` | integer | All-time total (used for milestones) |
| `created_at` | timestamp | |

### 5.2 Personal (B2C) Tables

**`recipients`** — Core contact record

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `user_id` | FK → `fi_users` | NOT NULL |
| `first_name`, `last_name`, `nickname` | text | |
| `relationship_type` | text | Wife, Mom, Friend, Client, etc. |
| `birthday`, `anniversary` | date | |
| `address_line1`, `city`, `state`, `postal_code` | text | |
| `active` | boolean | Default: true. Soft-delete via `archived_at` |

**`recipient_profile`** — Intelligence layer for AI card generation

| Column | Type | Notes |
|---|---|---|
| `recipient_id` | unique FK → `recipients` | |
| `personality_traits` | jsonb array | |
| `interests` | jsonb array | |
| `hobbies` | text | |
| `inside_jokes` | text | |
| `preferred_tone` | text | |
| `emotional_openness` | integer | |
| `preview_days` | integer | Lead-time before mailing |
| `sender_nickname` | text | |

**`recipients_v2`** — Newer recipient system (in active use alongside `recipients`)

**`recipient_memory`** — "Relationship DNA" model

| Column | Type | Notes |
|---|---|---|
| `recipient_id` | unique FK | |
| `permanent_facts` | jsonb | Static facts (never change) |
| `relationship_dna` | jsonb | Dynamic relationship context |
| `card_fuel` | jsonb | Specific material for AI card use |
| `card_preferences` | jsonb | Tone and style preferences |
| `profile_completeness` | integer | 0–100 |

**`question_answers`** — Source of truth for timeline and profile answers

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `user_id` | FK | |
| `recipient_id` | FK | |
| `question_key` | text | Maps to profile field or fresh update key |
| `answer_text` | text | |
| `trigger_type` | enum | `profile_gap`, `fresh_update`, `event_briefing` |
| `event_type` | text | Birthday, Anniversary, etc. |
| `event_year` | integer | |

**`follow_up_questions`** — Scheduled AI-generated follow-up prompts

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `user_id`, `recipient_id` | FKs | |
| `source_answer_id` | FK → `question_answers` | The answer that triggered this follow-up |
| `category` | text | NEW_HOBBY, FAMILY, CAREER, etc. |
| `trigger_date` | date | When to surface this question |
| `status` | enum | `pending`, `answered`, `expired` |

**`personal_cards`** — Card history

| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `user_id`, `recipient_id` | FKs | |
| `event_type` | text | |
| `status` | enum | `draft`, `approved`, `mailed` |
| `message_original` | text | AI-generated version |
| `message_final` | text | User-edited version (if edited) |
| `was_edited` | boolean | |
| `handwrytten_card_id` | text | External Handwrytten reference |

### 5.3 Business (B2B) Tables

**`business_clients`** — B2B equivalent of `recipients`  
**`business_settings`** — Workspace-level config (tone, font, automation mode)  
**`business_card_queue`** — Automation engine; status: `pending → approved → mailed`

### 5.4 AI & System Tables

**`ai_card_library`** — Global catalog of card designs with performance tracking (`times_shown`, `times_selected`)  
**`card_previews`** — Temporary storage for AI-generated card mockups  
**`card_classifications`** — Style/category metadata for card designs  
**`brownie_point_transactions`** — Ledger of all point awards

---

## 6. Navigation Architecture

### 6.1 AppNav (Primary Personal Dashboard Navigation)

Used on all authenticated personal-account pages. Sticky top bar, two-row layout.

**Top Row (Brand & Account)**
- Brand logo ("F*I FORGOT") — links to `/`
- Approval badge (red pill, `{n} to review →`) — visible when cards pending; links to `/cards/review`
- Brownie Points counter (`🍪 {balance}`) — links to `/brownie-points`
- AccountMenu dropdown (avatar button → Name, Email, Account Settings placeholder, Admin Panel link, Sign Out)

**Bottom Row (Navigation Tabs)**

| Tab | Icon | Route |
|---|---|---|
| Home | 🏠 | `/dashboard` |
| Your People | 👥 | `/people` |
| Upcoming Moments | 📅 | `/moments` |
| Quick Card | ⚡ | `/quick-card` |
| Brownie Points | 🏆 | `/brownie-points` |

**Mobile behavior:** Tabs are horizontally scrollable on small screens with reduced padding.

### 6.2 AppLayout + Sidebar (Admin / Legacy Views)

Used on admin and configuration pages (`/admin`, `/recipients/:id`, `/cards/generate`).

**Sidebar items:**
- Dashboard (`/dashboard`)
- Recipients (`/recipients`)
- Reminders (`/settings/reminders`)
- Admin (`/admin`) — appears for all users but content is email-restricted

**Sidebar features:**
- Workspace switcher: Personal ↔ Business toggle
- Autopilot status indicator with "Crisis level" light

**Mobile:** Slide-out drawer, hamburger trigger in top bar.

### 6.3 Public Header / Footer (Landing Pages)

**Header:** Brand logo + "Sign In" + "Try It Free" CTAs  
**Footer:** Dark background; tagline "Relationship Damage Control"; utility links (How It Works, Pricing, Sign In)  
**Floating CTA:** "Try It Free" button appears on public pages after scroll; programmatically hidden on auth and dashboard routes

### 6.4 Navigation Inconsistencies

- `/recipients` (Sidebar nav) and `/people` (AppNav tab) are two separate pages serving overlapping purposes — both manage the recipient list.
- `/recipients/:id` uses the Sidebar layout while `/dashboard` uses AppNav — the nav context changes when deep-linking into a recipient profile.
- Admin access is visible in the AccountMenu dropdown for all users, but the `/admin` page enforces an email-domain check internally rather than at the route guard level.

---

## 7. Feature Inventory

### 7.1 Active Features

| Feature | Description |
|---|---|
| AI Card Generation | GPT-4o generates personalized message with tone variants and memory references |
| Card Tone Selection | Sweet, Funny, Romantic, Simple, Religious, From the Kids, Apology Style |
| AI Refinement Actions | Make warmer, Make funnier, Make shorter, More emotional, Rewrite |
| Handwrytten Integration | Physical card printing and mailing via Handwrytten API |
| Relationship Health Score | 0–100 per-recipient score across 5 weighted categories |
| Brownie Points | Gamified engagement scoring with milestones and ledger |
| Question Engine | 3-mode system (profile gap → follow-up → fresh update) |
| Follow-Up Questions | AI-scheduled contextual follow-ups 60–120 days after fresh updates |
| Relationship Timeline | Chronological history of memories, cards, and follow-ups per recipient |
| Upcoming Moments | Event-forward calendar view (next 90 days) with urgency chips |
| Autopilot Mode | Automatic card generation and sending without manual review |
| Approve Mode | Drafts held for manual review before printing |
| Reminder Settings | Configurable lead-time (14, 21, or 30 days) and notification cadence |
| Subscription Billing | Stripe-based tiered plans with recipient caps and card usage caps |
| Admin Panel | Internal ops dashboard: customer management, print queue, AI card library |
| Briefing Page | Event-specific question flow for contextualizing card generation |
| Card Review Queue | Pending-approval queue with preview, edit, and approve/decline |
| Approval Reminders | SendGrid-powered email reminders with 24-hour cadence and final warning |
| Order Tracking | Handwrytten status polling (queued → printing → mailed → delivered) |
| Business Dashboard | Separate B2B workspace with client management and bulk automation |
| Demo / Try Flow | Public "see how it works" demo without sign-up |

### 7.2 Features Behind Conditional Checks (Not Formal Flags)

| Feature | Condition |
|---|---|
| Mother's Day / Father's Day events | Conditionally shown based on recipient relationship type |
| "Years Together" field and health weight | Only enabled for partner-type relationships |
| Partner-specific health scoring | Triggered by relationship type in health calculator |
| Mock AI mode | Activates if `OPENAI_API_KEY` not set — returns canned responses |
| Dev billing bypass | Plan activates immediately without payment in non-production environments |
| Admin panel access | Requires email containing specific domain fragment — checked inside the page, not the route guard |
| Legend-only card styles | "Premium" Handwrytten card designs gated by `Legend Status` plan |

### 7.3 Partially Implemented (Stubbed / Incomplete)

| Feature | Status |
|---|---|
| **Quick Card** (`/quick-card`) | Route and nav tab exist; page renders "Coming Soon." No card generation logic wired. |
| **Archived Recipient Restore** | API supports archiving (`archived_at` soft-delete). No UI exists to restore an archived recipient. Noted in code: *"No UI yet — foundation for future restore capability."* |
| **Print Audit Verification** | Admin print audit can flag bleed/aspect-ratio deviations but cannot programmatically verify them — manual review required. |
| **Handwrytten Font Previews** | Font IDs mapped in DB and code, but `previewUrl` is optional and often absent — users cannot see a font preview before selecting. |
| **Account Settings** | AccountMenu item triggers a placeholder `alert()` — no settings page exists. |

### 7.4 Planned Features (Found in Code Comments)

| Feature | Signal |
|---|---|
| **"Stop using this memory for future cards"** | Timeline component contains a flagging mechanism to exclude specific historical data from AI context without deleting it. |
| **Milestone vs. standard year detection** | Comments in question engine suggest planned logic to identify significant anniversaries (10th, 25th) and adjust card complexity accordingly. |
| **Business multi-user sign-in recovery** | Auth context comment: email-to-businessId recovery for multi-user business accounts "still being finalized." |
| **Archived recipient "haunting"** | API stub for optionally including archived recipient context in new card prompts. |

---

## 8. Conversion Funnel

### 8.1 Full Funnel: Visitor → Paying Customer

```
Stage 1: Awareness
   → Lands on / (Landing Page)
   → Reads headline: "Relationship Damage Control. We keep your important
     people feeling remembered — automatically."
   → Scrolls: How It Works, Pricing section, sample card preview

Stage 2: Consideration / Demo
   → Clicks "See how it works" → /try (Card Flow V2 Demo)
   → Interactive walkthrough showing card generation without sign-up

Stage 3: Sign Up
   → Clicks "Try It Free" or "Get Started" → /signup
   → Email + password only — no credit card at sign-up

Stage 4: Onboarding
   → /onboarding — adds first recipient and profile data
   → No paywall at this stage — full onboarding accessible

Stage 5: Dashboard Access
   → Lands on /dashboard post-onboarding
   → Can view relationship health, upcoming moments, recommended actions

Stage 6: First Paywall Hit
   → Attempting to add a 2nd recipient on Bare Minimum plan → upgrade prompt
   → Attempting to use Premium card styles on lower plans → upgrade prompt
   → Plan displayed: Bare Minimum ($6/mo), Domestic Peacekeeper ($15/mo),
     Legend Status ($29/mo)

Stage 7: Subscribe (/subscribe)
   → Plan selection UI
   → Stripe Checkout for payment

Stage 8: Checkout Success (/checkout/success)
   → Plan activated, recipient cap lifted
   → Redirected to dashboard with upgraded capabilities
```

### 8.2 Pricing Plans

| Plan | Price | Recipients | Cards/Year | Notable Gate |
|---|---|---|---|---|
| Bare Minimum | $6/mo | 1 | 6 | Single recipient only |
| Domestic Peacekeeper | $15/mo | 5 | 18 | Standard card styles |
| Legend Status | $29/mo | Unlimited | 40 | Premium card styles, full access |

### 8.3 Upgrade Trigger Points

- Adding a recipient beyond plan cap
- Accessing premium Handwrytten card styles (Legend only)
- (No in-dashboard persistent upsell; upgrade prompts are reactive, not proactive)

---

## 9. Known UX Risks

### 9.1 Confusion Points

| Risk | Location | Description |
|---|---|---|
| **Duplicate people management** | `/recipients` vs `/people` | Two separate pages exist for managing the recipient list. They overlap in purpose but use different layouts (Sidebar vs AppNav). A user could navigate to either and not realize they're the same data. |
| **Nav context switch** | AppNav → Sidebar | Clicking into a recipient profile (`/recipients/:id`) silently switches from the AppNav to the Sidebar layout, disorienting users who don't track URLs. |
| **Admin link visible to all users** | AccountMenu | "Admin Panel" appears in the dropdown for all authenticated users, but clicking it either shows restricted content or fails silently for non-admin users. Non-admin users will hit a dead end. |
| **Two "health" concepts** | Dashboard | "Relationship Health Score" (0–100, per-recipient) and "Brownie Points" (gamified, user-wide) both appear on the dashboard. They measure different things but look similar, likely causing confusion about which number represents what. |
| **Autopilot vs Approve mode** | Reminder Settings | The difference between "Autopilot" (sends without asking) and "Approve" (waits for review) is critical but not surfaced prominently. Users on Autopilot may not realize cards are being sent without their review. |

### 9.2 Dead Ends

| Risk | Location | Description |
|---|---|---|
| **Quick Card tab** | `/quick-card` | A navigation tab in AppNav leads to a "Coming Soon" placeholder. New users who click it hit a dead end with no alternative action offered. |
| **Account Settings** | AccountMenu | The "Account Settings" menu item calls `alert("Coming soon")`. No settings page exists — no way to update email, password, or notification preferences outside of Reminder Settings. |
| **Archived recipient restore** | No route | Recipients can be archived but cannot be restored via any UI. If archived accidentally, the data is lost from the user's perspective. |

### 9.3 Excessive Clicks / Friction

| Risk | Location | Description |
|---|---|---|
| **Briefing before generation** | `/briefings` → `/cards/generate` | Users who want to quickly send a card must navigate through a briefing question flow before reaching generation — no way to skip directly to "just generate it." |
| **Profile completion gates card quality** | Dashboard → Profile | Health score warnings surface gaps (no address, no birthday) but the fix requires navigating to `/recipients/:id`, scrolling to the right section, and saving. No contextual inline editing from the dashboard. |
| **Approval flow** | `/cards/review` | Approval requires a separate route visit. For users on Autopilot, this flow is bypassed — but Approve-mode users must make an extra navigation step every time. |

### 9.4 Potential Abandonment Points

| Risk | Stage | Description |
|---|---|---|
| **Onboarding length** | Onboarding | The wizard collects 12+ fields for the first recipient before the user sees any value. Users may abandon before completing — and an incomplete onboarding prevents access to the dashboard. |
| **Address required for first send** | Card generation | Users can complete onboarding without a mailing address, generate a card, approve it, then get blocked at send time because no address exists. The error occurs late in the flow. |
| **No free card on sign-up** | Post-signup | No free trial card is offered on sign-up — users must subscribe before sending their first real card. The demo (`/try`) provides a preview but not a live send. This removes a key conversion hook. |
| **Health score anxiety** | Dashboard | Displaying a low health score (e.g., "42/100") immediately after onboarding — before the user has had a chance to add memories — may feel punishing rather than motivating for new users. |
| **Tone over-choice** | Card generator | 7 tone options + 5 refinement buttons = 12 possible actions before approving a card. Users with low confidence in the AI output may iterate endlessly rather than approving. |

### 9.5 Duplicate Functionality

| Overlap | Components |
|---|---|
| Recipient list | `/recipients` page (Sidebar layout) + `/people` page (AppNav layout) |
| Upcoming events | Dashboard "Upcoming Moments" section + `/moments` page — same data, two views |
| Health scoring | Dashboard health section + `/brownie-points` page + health chip on each recipient card — three places showing overlapping but different health metrics |
| Card generation CTA | Dashboard "Upcoming Moments" CTA + Admin panel + `/quick-card` (stub) — multiple entry points into the same flow with inconsistent UX |

---

*End of audit. This document was generated by automated codebase analysis on June 11, 2026. It reflects the current state of the codebase and should be validated against live behavior before executive presentation.*
