# F* I Forgot — Technical Architecture Report

**Generated:** June 4, 2026  
**Purpose:** Architecture review for senior engineers and technical product architects  
**Status:** Active development / pre-scale

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [User Flow Documentation](#2-user-flow-documentation)
3. [Database Documentation](#3-database-documentation)
4. [AI System Documentation](#4-ai-system-documentation)
5. [Business Logic](#5-business-logic)
6. [API Documentation](#6-api-documentation)
7. [Security Review](#7-security-review)
8. [Current Problems & Technical Debt](#8-current-problems--technical-debt)
9. [Future Expansion Considerations](#9-future-expansion-considerations)
10. [File Structure](#10-file-structure)

---

## 1. High-Level Architecture

### Overview

F* I Forgot is a relationship-autopilot greeting card service. It monitors important dates for a user's personal contacts and automatically generates, personalizes, and physically mails handwritten cards on their behalf through the Handwrytten API. There is also a B2B product that allows businesses (e.g., real estate agents, financial advisors) to send handwritten cards to clients on autopilot.

The system is a pnpm monorepo hosted on Replit, structured into three deployable artifacts and several shared libraries.

---

### Frontend

- **Framework:** React 18 + Vite
- **Language:** TypeScript 5.9
- **Routing:** Wouter (lightweight React router)
- **State:** React Context for auth/session, `useState`/`useMemo` for local page state, TanStack Query for server-side async state
- **Styling:** Inline styles throughout (no CSS framework at the component level); Tailwind is available but minimally used
- **Data persistence:** Primarily `localStorage` on the client, with API sync when a `userId` is present
- **Build output:** Static bundle served by Vite dev server in development; esbuild for production

The frontend serves two distinct product surfaces:
1. **Personal dashboard** (`/dashboard`) — individuals tracking personal relationships
2. **Business dashboard** (`/business/dashboard`) — professionals tracking client relationships

---

### Backend

- **Framework:** Express 5 (Node.js 24)
- **Language:** TypeScript 5.9, compiled via esbuild to a CJS bundle
- **API Contract:** OpenAPI 3.0 spec in `lib/api-spec/openapi.yaml`, from which Zod validation schemas and React Query hooks are auto-generated via Orval
- **Logging:** Pino (structured JSON logs via `req.log` in route handlers)
- **Port:** 5000 (behind the Replit reverse proxy at `/api`)
- **Route organization:** Modular files per domain (`admin.ts`, `stripe.ts`, `personal-recipients.ts`, `business-approval.ts`, `v2-generate-card.ts`, etc.)

---

### Database

- **Type:** PostgreSQL (Replit managed)
- **ORM:** Drizzle ORM with `drizzle-zod` for schema-derived validators
- **Connection:** Via `DATABASE_URL` environment variable
- **Migrations:** `pnpm --filter @workspace/db run push` (Drizzle kit push, development-only pattern — no migration files)

---

### Third-Party Integrations

| Service | Purpose | SDK/Method |
|---|---|---|
| **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `gpt-image-1`) | Card message generation, card image generation, card classification, design brief generation | Official OpenAI SDK via Replit AI Integrations proxy |
| **Handwrytten** | Physical card printing and mailing | Official `handwrytten` npm package |
| **Stripe** | Subscription billing, plan management, customer portal | Official `stripe` npm package + `stripe-replit-sync` for webhook handling |
| **Resend** | Transactional email (approval notifications, demo emails) | `resend` npm package (note: service file is named `sendgrid.ts` — a naming artifact) |

---

### Hosting Environment

Replit — single-tenant container running NixOS. The Replit reverse proxy routes traffic to individual artifact services by path prefix:

- `/` → `fi-forgot` Vite frontend (React app)
- `/api` → `api-server` Express backend (port 5000)
- `/mockup` → `mockup-sandbox` (dev tool, not customer-facing)

Production deployment is via Replit Deployments (published as a `.replit.app` domain).

---

## 2. User Flow Documentation

### Visitor Journey (Landing → Signup)

1. Visitor arrives at `/` — the marketing landing page
2. Landing page presents headline ("Stop Winging It. Start Looking Good."), social proof, and a pricing section with three plan tiers
3. CTA buttons link to `/signup` or `/try` (a free interactive demo)
4. `/try` (`CardFlowV2Page`) allows a visitor to generate a sample card message without creating an account — this doubles as a lead capture form that writes to the `demo_leads` table

---

### Onboarding Flow

1. After signup, the user is redirected to `/onboarding`
2. The `OnboardingPage` is a multi-step wizard:
   - Step 1: Enter name and basic info for the first recipient
   - Step 2: Choose the relationship type
   - Step 3: Set important dates (birthday, anniversary, etc.)
   - Step 4: Add personality/interest details
3. Completion sets an `onboardingComplete` flag in `localStorage` and the user's session
4. User is redirected to `/dashboard`

If `onboardingComplete` is false, the `ProtectedRoute` wrapper in `App.tsx` redirects all authenticated routes back to `/onboarding`.

---

### Recipient Creation Flow

1. User navigates to `/recipients/new` from the dashboard or relationships page
2. A creation form collects:
   - Name, relationship type, mailing address
   - Birthday, anniversary, and any custom dates
   - Tone preference, personality notes, interests, inside jokes
   - Selected events to watch (e.g., Birthday, Christmas, Mother's Day)
3. On save, the recipient is written to `localStorage` (`fi_forgot_recipients`) and synced to the `personal_recipients` table via `POST /api/v2/recipients` (keyed by `userId`)
4. The recipient immediately appears in the dashboard's upcoming events section if an occasion is within 90 days

---

### Card Generation Flow

1. **Trigger:** Either automatically (autopilot mode) or when a user clicks "Generate" on an upcoming event card on the dashboard
2. The system calls `POST /api/generate-card` (V1) or `POST /api/v2/generate-card` (V2 with memory persistence)
3. The API route constructs a prompt using:
   - Recipient profile data (name, relationship, personality, memories, tone)
   - Event briefing answers (if the user has completed a briefing for this event)
   - Historical card context (previous events for this recipient)
4. GPT-4o returns 3 message variants: "Best Match", "More Casual", "More Heartfelt"
5. The selected variant is stored as a `CardOrder` object with status `"Ready for approval"` in `localStorage` and surfaced to the user for review

---

### Briefing Flow

1. For upcoming events, the user can complete a "briefing" at `/briefings/:recipientId/:event`
2. The `BriefingPage` presents event-specific questions (e.g., "What's something that happened this year you want to reference?")
3. Answers are stored in `localStorage` under `fi_forgot_briefings`
4. These answers are injected into the card generation prompt, producing a significantly more personalized message
5. Completing a briefing flips the event card's status on the dashboard to "Personalized and on track"

---

### Approval Flow

1. Cards with status `"Ready for approval"` appear in the dashboard header CTA and at `/cards/review`
2. The `CardsReviewPage` shows the card message text, recipient info, and mailing date
3. User can: **Approve** (sets status to "Approved"), **Edit** (opens a refinement prompt via `POST /api/edit-card`), or **Reject**
4. Approved cards are queued for physical mailing via Handwrytten
5. Admin users see a parallel approval queue at `/admin` with additional fulfillment controls

---

### Payment Flow

1. User clicks "Upgrade" on the dashboard or visits `/subscribe`
2. The `SubscribePage` fetches plan details from `GET /api/stripe/plans`
3. On plan selection, calls `POST /api/stripe/checkout` which:
   - Creates or retrieves a Stripe Customer record (linked to the user's email)
   - Creates a Stripe Checkout Session for the selected subscription
   - Returns the Checkout Session URL
4. User is redirected to Stripe-hosted checkout
5. On success, Stripe sends a webhook to `/stripe/webhook` which updates the user's `plan` and `stripeSubscriptionId` in the `fi_users` table
6. User lands at `/checkout/success`

**Development bypass:** In dev mode, `upgradePlan()` in `AuthContext` directly updates `localStorage` without hitting Stripe, allowing UI testing without a real payment flow.

---

### Subscription Management Flow

1. User accesses `/api/stripe/portal` which generates a Stripe Billing Portal URL
2. User can cancel, upgrade, or downgrade directly in Stripe's hosted portal
3. Plan changes propagate back via webhook and update the database

---

### Reminder Flow

1. The business scheduler (`artifacts/api-server/src/services/business-scheduler.ts`) runs on a schedule to identify upcoming client events
2. For personal users, reminders are currently driven by the frontend (the dashboard shows days-away urgency indicators)
3. Email notifications are sent via Resend when cards are queued for approval
4. The `ReminderSettingsPage` at `/settings/reminders` allows users to configure notification timing and channel preferences (stored in `business_settings.notifyTiming` and `notifyChannel`)

---

## 3. Database Documentation

All tables use PostgreSQL via Drizzle ORM. There are no explicit migration files — schema changes are applied with `drizzle-kit push` directly to the database.

---

### `fi_users`
Primary user table for all personal accounts.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | Client-generated UUID |
| `email` | `text` | NOT NULL, UNIQUE | Used as login identifier |
| `name` | `text` | — | Display name |
| `stripeCustomerId` | `text` | — | Linked Stripe customer |
| `stripeSubscriptionId` | `text` | — | Active subscription ID |
| `plan` | `text` | default `"basic"` | `"basic"` \| `"standard"` \| `"premium"` |
| `createdAt` | `timestamp` | default now | — |

No foreign keys to other tables. No indexes beyond the PK and unique email constraint.

---

### `personal_recipients`
Stores all recipient data for personal users as a JSON blob.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | Client-generated UUID |
| `userId` | `text` | NOT NULL | FK → `fi_users.id` (logical, not enforced) |
| `data` | `jsonb` | NOT NULL | Full `Recipient` object serialized to JSON |
| `createdAt` | `timestamp` | NOT NULL, default now | — |
| `updatedAt` | `timestamp` | NOT NULL, default now | — |

The `data` blob contains: name, relationship, birthday, anniversary, mailing address, selected events, personality notes, interests, inside jokes, memories, tone preference, delivery preference, and all briefing answers. No column-level indexing on JSON fields.

---

### `recipients_v2`
A newer, normalized recipient table intended to replace the `personal_recipients` blob approach.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | — |
| `userId` | `text` | NOT NULL | FK → `fi_users.id` (logical) |
| `firstName` | `text` | NOT NULL | — |
| `relationshipType` | `text` | NOT NULL | — |
| `birthday` | `text` | — | ISO date string |
| `createdAt` | `timestamp` | NOT NULL, default now | — |
| `updatedAt` | `timestamp` | NOT NULL, default now | — |

This table is partially implemented. Most production code still uses `personal_recipients`.

---

### `recipient_memory`
Long-term AI memory for each recipient (used by the V2 generation pipeline).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | — |
| `recipientId` | `text` | NOT NULL, UNIQUE | FK → `recipients_v2.id` |
| `permanentFacts` | `jsonb` | default `{}` | Facts that never change (birthdate, hometown) |
| `relationshipDna` | `jsonb` | default `{}` | Personality, relationship dynamics |
| `cardFuel` | `jsonb` | default `{}` | Recent events, "never mention" list, inside jokes |
| `cardPreferences` | `jsonb` | default `{}` | Tone, emotional openness, preferred archetype |
| `profileCompleteness` | `integer` | default `0` | Calculated completeness score (0–100) |
| `updatedAt` | `timestamp` | NOT NULL, default now | — |

---

### `pending_approvals`
Cards awaiting customer approval (personal side).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | — |
| `queueItemId` | `text` | NOT NULL | Reference to admin queue |
| `customerEmail` | `text` | NOT NULL | — |
| `customerName` | `text` | NOT NULL | — |
| `recipientName` | `text` | NOT NULL | — |
| `eventType` | `text` | NOT NULL | e.g., `"Birthday"` |
| `scheduledMailDate` | `text` | NOT NULL | ISO date string |
| `messageText` | `text` | NOT NULL | The generated card message |
| `createdAt` | `timestamp` | NOT NULL, default now | — |
| `lastReminderSentAt` | `timestamp` | NOT NULL, default now | For reminder cadence tracking |
| `resolvedAt` | `timestamp` | — | Null until approved/rejected |

---

### `business_clients`
Client records for business-tier users.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default random | — |
| `businessId` | `text` | NOT NULL | FK → `fi_users.id` (logical) |
| `fullName` | `text` | NOT NULL | — |
| `company`, `address`, `email`, `phone` | `text` | — | Contact info |
| `birthday`, `homePurchaseAnniversary`, `clientSince` | `text` | — | Key dates |
| `customEvents` | `text` | — | JSON string of additional dates |
| `tone`, `interests`, `notes`, `tags`, `relationship` | `text` | — | Profile details |
| `kidsNames`, `pets` | `text` | — | Personalization data |
| `autoBirthday`, `autoHoliday` | `boolean` | default `true` | Automation flags |
| `autoAnniversary` | `boolean` | default `false` | — |
| `requireApproval`, `automationsOn` | `boolean` | default `true` | — |
| `lastCardSent` | `text` | — | Date of last mailing |
| `createdAt`, `updatedAt` | `timestamp` | NOT NULL, default now | — |

---

### `business_settings`
Configuration for each business account.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default random | — |
| `businessId` | `text` | NOT NULL, UNIQUE | One record per business |
| `email`, `bizType`, `tone`, `cardSignature`, `cardFont` | `text` | — | Identity and card style |
| `notifyTiming`, `notifyChannel`, `notifyEmail`, `notifyPhone` | `text` | — | Notification preferences |
| `automationMode` | `text` | — | `"autopilot"` or `"approve"` |
| `createdAt`, `updatedAt` | `timestamp` | NOT NULL, default now | — |

---

### `business_card_queue`
Cards queued for business approval and mailing.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default random | — |
| `businessId` | `text` | NOT NULL | — |
| `clientId` | `text` | NOT NULL | FK → `business_clients.id` (logical) |
| `approvalToken` | `text` | NOT NULL, UNIQUE | UUID used in public approval URL |
| `status` | `text` | NOT NULL, default `"pending"` | `"pending"` \| `"approved"` \| `"rejected"` \| `"sent"` |
| `eventType`, `occasionDate`, `mailDate` | `text` | NOT NULL | Scheduling info |
| `cardMessage` | `text` | NOT NULL | Generated message text |
| `clientName`, `clientAddress`, `clientCompany` | `text` | — | Mailing info |
| `cardFont`, `cardSignature`, `notifyEmail` | `text` | — | Card style |
| `hwOrderId` | `text` | — | Handwrytten order ID after sending |
| `contextNote` | `text` | — | Internal notes for the card |
| `createdAt` | `timestamp` | NOT NULL, default now | — |
| `resolvedAt` | `timestamp` | — | Set when approved/rejected |

---

### `card_classifications`
AI-analyzed metadata for Handwrytten card designs (used by the card picker).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `imageUrl` | `text` | PK | Handwrytten image URL |
| `occasions` | `jsonb` | NOT NULL, default `[]` | Occasions the card suits |
| `confirmedOccasions` | `jsonb` | NOT NULL, default `[]` | Human/AI verified occasions |
| `keywords` | `jsonb` | NOT NULL, default `[]` | General keywords |
| `claudeKeywords`, `gptKeywords` | `jsonb` | NOT NULL, default `[]` | Model-specific keyword sets |
| `skip` | `boolean` | NOT NULL, default `false` | Exclude from picker |
| `classifiedAt` | `bigint` | NOT NULL | Unix timestamp of last classification |
| `models` | `jsonb` | NOT NULL, default `[]` | Which models have processed this card |

---

### `custom_holiday_cards`
AI-generated custom card designs uploaded to Handwrytten.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | PK | Auto-increment |
| `handwryttenCardId` | `text` | NOT NULL, UNIQUE | Handwrytten's internal ID |
| `name` | `text` | NOT NULL | Card display name |
| `imageUrl` | `text` | NOT NULL | Image URL in Handwrytten CDN |
| `occasion` | `text` | NOT NULL, default `"Happy Holidays"` | Associated occasion |
| `active` | `boolean` | NOT NULL, default `true` | Whether to use in card selection |
| `generatedAt` | `bigint` | NOT NULL | Unix timestamp |

---

### `ai_card_library`
Internal library of curated card designs for the AI picker.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default random | — |
| `category`, `subcategory`, `title` | `text` | NOT NULL | Taxonomy |
| `imageUrl`, `thumbnailUrl` | `text` | NOT NULL / optional | Design assets |
| `promptUsed` | `text` | NOT NULL | The image generation prompt |
| `style`, `tone`, `primaryColor` | `text` | — | Visual metadata |
| `handwryttenCardId` | `text` | UNIQUE | Linked Handwrytten card |
| `tags` | `jsonb` | NOT NULL, default `[]` | Search tags |
| `seasonal`, `active` | `boolean` | NOT NULL | Display flags |
| `timesShown`, `timesSelected`, `timesRejected` | `integer` | NOT NULL, default `0` | A/B performance data |
| `createdAt` | `timestamp` | NOT NULL, default now | — |

---

### `sample_card_messages`
Pre-generated message examples for the card library.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | PK | — |
| `cardImageUrl`, `category`, `tone`, `businessType`, `recipientType`, `relationshipContext` | `text` | NOT NULL | Lookup dimensions |
| `message` | `text` | NOT NULL | The sample message text |
| `createdAt` | `bigint` | NOT NULL | Unix timestamp |

**Index:** `scm_lookup_idx` on `(cardImageUrl, category, tone, businessType, recipientType, relationshipContext)` — composite lookup index for the card picker.

---

### `card_previews`
Shareable card preview links (token-based).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `token` | `text` | PK | UUID, used in `/preview/:token` URL |
| `imageUrl`, `messageText`, `recipientName`, `eventType`, `cardName` | `text` | NOT NULL | Preview content |
| `expiresAt` | `timestamp` | NOT NULL | TTL for the link |
| `createdAt` | `timestamp` | NOT NULL, default now | — |

---

### `demo_leads`
Captures leads from the `/try` interactive demo.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `text` | PK | — |
| `email`, `recipientName`, `relationship` | `text` | NOT NULL | Core lead data |
| `occasion`, `personality`, `source` | `text` | — | Context |
| `lastDemoEmailSentAt` | `timestamp` | — | For follow-up cadence |
| `demoEmailSendCount` | `integer` | NOT NULL, default `0` | Rate-limit tracking |
| `createdAt`, `updatedAt` | `timestamp` | NOT NULL, default now | — |

---

### `conversations` + `messages`
Stores chat conversation history (likely for a future AI chat feature or internal tool).

**`conversations`:** `id` (serial PK), `title`, `createdAt`

**`messages`:** `id` (serial PK), `conversationId` (FK → `conversations.id` with CASCADE DELETE), `role`, `content`, `createdAt`

These tables are not currently wired to any customer-facing feature.

---

### Relationship Summary

```
fi_users
  └── personal_recipients (userId → fi_users.id, logical)
  └── recipients_v2 (userId → fi_users.id, logical)
        └── recipient_memory (recipientId → recipients_v2.id, enforced UNIQUE)
  └── business_settings (businessId → fi_users.id, UNIQUE)
  └── business_clients (businessId → fi_users.id, logical)
        └── business_card_queue (clientId → business_clients.id, logical)

pending_approvals (standalone, references queue items by string ID)
card_classifications (standalone, keyed by image URL)
custom_holiday_cards (standalone)
ai_card_library (standalone)
sample_card_messages (standalone)
card_previews (standalone, token-based)
demo_leads (standalone)
conversations → messages (CASCADE DELETE)
```

Most foreign key relationships are **logical** (not enforced at the database level by Drizzle constraints). Only `messages.conversationId` and `recipient_memory.recipientId` have enforced constraints.

---

## 4. AI System Documentation

### Overview

The AI layer uses OpenAI GPT-4o for text generation and DALL-E 3 (`gpt-image-1`) for image generation. All AI calls are routed through the Replit AI Integrations proxy using `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`.

---

### Prompt 1: Personal Card Message Generation (V1)

**File:** `artifacts/api-server/src/routes/generate-card.ts`  
**Model:** `gpt-4o`

**System prompt:** Establishes the persona as a professional card writer for F* I Forgot with specific brand voice guidelines. Lists forbidden clichés (e.g., "words cannot express," "thinking of you during this difficult time") and defines output format requirements.

**User prompt construction:**
```
Recipient: {recipientName}, {relationship}
Occasion: {holiday}
Personality: {personalityNotes}
Tone preference: {tonePreference}
Emotional level: {emotionalLevel}
Things to avoid: {thingsToAvoid}
Favorite memories: {favoriteMemories}
Inside jokes: {insideJokes}
Sender name: {senderName}
Event briefing: {eventBriefing[]}  ← this cycle's briefing Q&A
Recipient history: {recipientHistory[]}  ← previous events' briefings
```

**Output:** 3 card variants returned as `{ tone, text }` objects. The best-match tone is selected based on the recipient's `tonePreference`.

---

### Prompt 2: Personal Card Message Generation (V2)

**File:** `artifacts/api-server/src/routes/v2-generate-card.ts`  
**Model:** `gpt-4o`

Extends V1 with archetype-based personalization:

**Archetype Engine:** Maps `(relationship, occasion, objective, tone)` → a writing archetype (e.g., "Roast", "Love", "Appreciation", "Nostalgia"). Different archetypes have different rules injected into the system prompt.

**Relationship-specific rules** are injected based on type:
- **Spouse/Partner:** Lead with vulnerability, reference shared history
- **Parent:** Mix warmth and humor, reference sacrifice
- **Friend:** Match their energy, references to shared chaos acceptable
- **Sibling:** Mix annoyance and loyalty
- **Professional:** Short, warm, not personal

**Memory persistence:** After generation, the `recipient_memory` table is updated with new context from this interaction.

**Output:** Same 3-variant structure as V1, but richer and more contextually grounded.

---

### Prompt 3: Business Card Message Generation

**File:** `artifacts/api-server/src/services/biz-card-message.ts`  
**Model:** `gpt-4o-mini`

**Rules:**
- Maximum 2–4 sentences
- Never mention specific holidays (e.g., "Christmas") — use "Happy Holidays" or "Season's Greetings"
- For anniversaries, the system calculates years elapsed and instructs the AI to reference the milestone specifically
- Professional but warm tone; never overly personal
- Ends with business signature block

---

### Prompt 4: Visual Design Brief (for custom card images)

**File:** `artifacts/api-server/src/services/custom-card-generator.ts`  
**Model:** `gpt-4o`

Used for one-off custom card designs (e.g., home purchase anniversary cards). GPT-4o first writes a *visual design brief* based on the card's context and recipient, which is then fed to the image generator. This two-step chain produces more contextually appropriate imagery than direct prompting.

---

### Prompt 5: Card Image Generation

**File:** `artifacts/api-server/src/services/custom-card-generator.ts`  
**Model:** `gpt-image-1` (DALL-E 3)

Uses either:
- **Static prompts** for seasonal card types (e.g., "Winter Elegance: Minimalist snow-dusted pine branches with a warm amber glow…")
- **Dynamic prompts** from the design brief generated by Prompt 4

Generated images are uploaded to Handwrytten's CDN via `uploadCustomImage` and stored as custom card templates.

---

### Prompt 6: Card Classification

**File:** `artifacts/api-server/src/services/card-classifier.ts`  
**Models:** `gpt-4o` and Claude (via API)

Analyzes Handwrytten card images (by URL) to extract:
- Suitable occasions
- Style keywords
- Color and tone metadata

Results stored in `card_classifications` table. Both Claude and GPT-4o keywords are stored separately to allow comparison and consensus filtering.

---

### Prompt Chaining Summary

```
Personal card request
  → [V2] Archetype selection (rules lookup, no AI call)
  → GPT-4o message generation
  → [Optional] GPT-4o refinement if user requests edits
  → Card stored in pending_approvals

Custom card design request
  → GPT-4o visual design brief
  → gpt-image-1 image generation
  → Handwrytten image upload
  → Handwrytten custom card creation
  → Stored in custom_holiday_cards
```

---

### Recipient Memory Storage

Two layers of memory:

1. **Frontend (`localStorage`):** `Recipient` objects in `fi_forgot_recipients`. Contains all profile data, briefing answers, and preferences. Synced to the backend on load.

2. **Backend (`personal_recipients.data` JSON blob / `recipient_memory` table):**
   - `personal_recipients.data` — full serialized recipient object
   - `recipient_memory.permanentFacts` — things that never change
   - `recipient_memory.relationshipDna` — personality, relationship dynamics
   - `recipient_memory.cardFuel` — recent details, "never mention" list
   - `recipient_memory.cardPreferences` — tone, archetype, emotional openness

---

## 5. Business Logic

### Recipient Identification

Recipients are identified by a client-generated UUID stored in `localStorage` and synced to the database. There is no deduplication at the database level — if a user adds "Mom" twice, two records are created. The UI does not warn about duplicates.

---

### Duplicate Prevention

**Cards:** The `admin-data.ts` service includes a workaround that checks `lastCardSent` against the current template ID to avoid sending the same physical card design twice in a row to the same recipient. This logic lives on the client side.

**Recipients:** No duplicate detection exists at any layer.

---

### Reminder Scheduling Logic

- **Business side:** `business-scheduler.ts` runs a scheduled job that scans all `business_clients` for events within a configurable window, generates messages, creates `business_card_queue` entries, and optionally sends email notifications via Resend.
- **Personal side:** No server-side scheduler. Reminder urgency is computed entirely in the browser based on `daysAway` from the current date. Cards within 14 days get an amber urgency indicator; within 7 days get a red indicator.

---

### Brownie Points Calculation

Brownie Points is the system's name for the overall relationship health score (0–98 displayed, capped from 100).

**Algorithm:**
1. Each recipient is scored individually (0–100)
2. Recipients are assigned a **tier** based on relationship type: Core (weight 3), Important (weight 2), Occasional (weight 1)
3. Overall score = `Σ(recipient_score × tier_weight) / Σ(tier_weights)`
4. Final score is rounded and capped at 98 for display

**Per-recipient scoring — 5 categories:**

| Category | Max | Key signals |
|---|---|---|
| Event Coverage | 25 | Birthday (+10), Anniversary (+8, partner only), ≥2 holidays (+7) |
| Memory Bank | 20 | Favorite memories (+8), inside jokes (+7), personality notes (+5). Subject to **freshness decay** |
| Preferences | 20 | Personality traits (+6), interests (+7), tone preference (+4), emotional level (+3) |
| Communication Style | 15 | Sender name (+5), pet name (+5), years together (+5, partner only) |
| Action Readiness | 20 | Mailing address (+10), preview days (+5), delivery preference (+5) |

**Freshness Decay** (Memory Bank only):
- < 6 months since update: 1.0× multiplier
- 6–12 months: 0.9×
- 1–2 years: 0.8×
- > 2 years: 0.7×

**Score labels (Brownie Points levels):**
- 91–98: Legend Status
- 76–90: Thoughtful Human
- 51–75: Building Momentum
- 26–50: Staying Out of Trouble
- 0–25: Just Surviving

**Score history** is stored in `localStorage` (`fi_forgot_score_history`) as daily snapshots, rolling 60 days. Trend is computed by comparing current score to the 30-day-ago snapshot.

---

### Subscription & Billing Logic

**Plan tiers** (defined in `artifacts/fi-forgot/src/lib/plan.ts`):

| Plan | Price | Recipients | Cards/year | Key perks |
|---|---|---|---|---|
| Basic ("Bare Minimum") | $6/mo | 1 | 6 | Core functionality |
| Standard ("Domestic Peacekeeper") | $15/mo | 5 | 18 | Most features |
| Premium ("Legend Status") | $29/mo | Unlimited | 40 | Emergency mode, concierge reminders |

Plan enforcement is currently **soft** — the UI shows warnings when card limits are approached, but the backend does not enforce hard limits on card generation. Stripe subscription state is stored on `fi_users.plan` and updated via webhook.

---

### Token / Credit System

There is no token or credit system. Access is controlled by the plan tier (recipient count cap and annual card count cap). These caps are enforced on the client side via the `PLANS` config.

---

## 6. API Documentation

All endpoints are prefixed `/api` via the Replit reverse proxy. The Express server handles paths that start with its registered prefix.

### Authentication

- **User identification:** `x-user-id` request header (a UUID stored in `localStorage` after `POST /api/auth/session`)
- **Admin routes:** No authentication middleware — access control is UI-only (the `/admin` page in the frontend)
- **Business approval links:** Token-based, public (`/api/business-approval/:token`)
- **Stripe webhook:** `stripe-signature` header, verified by Stripe SDK

---

### Core

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/healthz` | None | Health check. Returns `{ status: "ok" }` |
| POST | `/stripe/webhook` | Stripe signature | Processes Stripe subscription events |

---

### Session & Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/session` | None | Upserts user by email in `fi_users`, returns `userId` |

---

### Card Generation

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/generate-card` | None | `{ recipientName, holiday, relationship, personality, emotionalLevel, tonePreference, senderName, favoriteMemories, insideJokes, thingsToAvoid, eventBriefing[], recipientHistory[] }` | `{ cards: [{ tone, text }] }` |
| POST | `/api/v2/generate-card` | `x-user-id` | Same as V1 + `objective`, `emotionalOpenness`, `recipientId` | `{ cards: [{ tone, text }] }` |
| POST | `/api/edit-card` | None | `{ currentCardText, instruction }` | `{ text }` |
| POST | `/api/v2/refine-card` | `x-user-id` | `{ currentCardText, instruction, recipientId }` | `{ text }` |
| POST | `/api/business-card-message` | None | `{ clientName, eventType, businessName, tone, ... }` | `{ message }` |

---

### Recipient Management

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v2/recipients` | `x-user-id` | List all recipients for user |
| POST | `/api/v2/recipients` | `x-user-id` | Create recipient |
| PATCH | `/api/v2/recipients/:id` | `x-user-id` | Update recipient profile |
| DELETE | `/api/v2/recipients/:id` | `x-user-id` | Delete recipient |
| PATCH | `/api/v2/recipients/:id/memory` | `x-user-id` | Update AI memory for recipient |

---

### Business

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/business-clients` | None (businessId param) | List clients for a business |
| POST | `/api/business-clients` | None | Create client record |
| POST | `/api/business-cards/generate` | businessId | Trigger card generation for upcoming events |
| GET | `/api/business-cards/queue` | businessId | List pending approval cards |
| GET | `/api/business-approval/:token` | Token | Fetch card details for approval link |
| POST | `/api/business-approval/:token` | Token | Approve or reject a queued card |

---

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/handwrytten/cards` | None | List available Handwrytten card designs |
| GET | `/api/admin/handwrytten/fonts` | None | List available handwriting fonts |
| POST | `/api/admin/handwrytten/orders` | None | Place a physical card order |
| GET | `/api/admin/handwrytten/orders/:orderId/status` | None | Check order shipping status |
| POST | `/api/admin/generate-message` | None | Generate a concierge card message |
| POST | `/api/admin/suggest-card` | None | AI selects best card design for occasion |
| GET | `/api/admin/card-library` | None | List internal AI card library |
| POST | `/api/admin/card-library/generate` | None | Batch-generate new card designs (SSE stream) |
| POST | `/api/admin/card-library/:id/regenerate` | None | Regenerate a single card entry |

---

### Stripe

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/stripe/plans` | None | List active plans with pricing |
| POST | `/api/stripe/checkout` | None | Create Stripe Checkout Session |
| POST | `/api/stripe/portal` | None | Create Stripe Billing Portal session |

---

### Utilities

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/card-preview` | None | Create shareable card preview link |
| GET | `/api/card-preview/:token` | None | Fetch preview data by token |
| GET | `/api/card-image/:id` | None | Serve card image from internal store |
| GET | `/api/card-proxy?url=` | None | CORS proxy for Handwrytten images |
| GET | `/api/personal-cards/pick-card` | `x-user-id` | Select best Handwrytten card for occasion |

---

## 7. Security Review

### Authentication Method

There is **no traditional authentication** in the current implementation. The login flow:
1. User enters email (and name for signup)
2. Data is saved to `localStorage` as `fi_forgot_user`
3. `POST /api/auth/session` is called — this upserts the user by email and returns a `userId`
4. The `userId` is stored in `localStorage` and sent as `x-user-id` on subsequent API calls

**Critical finding:** There are no passwords, no JWTs, no session cookies, and no verification that the `userId` in the `x-user-id` header actually belongs to the caller. Any client that knows a `userId` can access that user's recipients and generate cards on their behalf.

---

### Authorization Model

- **Frontend:** Route guarding via `ProtectedRoute` in `App.tsx` (checks `isLoggedIn` in `localStorage`)
- **Backend:** Most routes have no authorization middleware. The few routes that check `x-user-id` validate only that the header is present, not that it belongs to a valid session
- **Admin routes:** Completely unprotected at the API level — the `/admin` page in the frontend is the only guard
- **Business approval:** Token-based (UUID in URL). Secure by obscurity only — tokens are not time-limited in the backend route logic (though `card_previews` has an `expiresAt` field)

---

### Sensitive Data Handling

- **Mailing addresses:** Stored in `personal_recipients.data` JSON blob in the database and in `localStorage` on the client. Not encrypted at rest.
- **Stripe secrets:** Stored as Replit environment secrets, never exposed to the client
- **OpenAI / Handwrytten / Resend keys:** Replit environment secrets, server-side only
- **User emails:** Stored plaintext in `fi_users.email` and `demo_leads.email`
- **No PII encryption:** No field-level encryption on any sensitive data

---

### Known Vulnerabilities

| Severity | Issue | Location |
|---|---|---|
| **Critical** | No authentication — any email logs in as that user | `auth-context.tsx` |
| **High** | Admin API completely unprotected | `api-server/src/routes/admin.ts` |
| **High** | `x-user-id` header not validated against a session | All `personal-recipients.ts` routes |
| **Medium** | Mailing addresses in `localStorage` (client-side persistence of PII) | `data.ts` |
| **Medium** | Business approval tokens not server-side expiry enforced | `business-approval.ts` |
| **Low** | Stripe webhook registration must precede `express.json()` middleware — documented in code but fragile | `app.ts`, `webhookHandlers.ts` |
| **Low** | Dev mode Stripe bypass left in production build path | `auth-context.tsx`, `subscribe.tsx` |

---

## 8. Current Problems & Technical Debt

### TODOs and Unfinished Work

- **`recipients_v2` table** is partially implemented alongside the older `personal_recipients` blob table. Most production code still uses the blob table. The migration to `recipients_v2` is incomplete.
- **`conversations` and `messages` tables** exist with no customer-facing feature connected to them.
- **Score history** is stored only in `localStorage` — if a user clears their browser data, all historical trend data is lost.
- **No server-side reminder scheduler for personal users** — reminder urgency is computed purely in the frontend on page load.
- **The `sendgrid.ts` file** uses Resend under the hood despite being named for SendGrid — a naming artifact from an earlier integration swap.

### Known Bugs / Workarounds

- **Duplicate card template prevention** is implemented client-side in `admin-data.ts` via a check on `lastCardSent`. This is a workaround for the absence of backend-side order tracking.
- **localStorage version migration blocks** in `auth-context.tsx` — multiple "repair" functions (`repairBusinessId`, version-keyed migration logic) indicate past breaking changes in local data schemas that needed patching for existing users.
- **`DEV_BYPASS` flag in Stripe flow** — payment is skipped in development by checking `import.meta.env.DEV`. This is a correct pattern, but the flag is not a named constant and is scattered across files, making it easy to accidentally ship bypass logic.
- **Hardcoded mapping tables** (`TONE_MAP`, `RELATIONSHIP_MAP`) in `auth-context.tsx` map UI strings to enum values. These require manual maintenance when new options are added.
- **Foreign key constraints** are almost entirely unenforced at the database level — orphaned records (e.g., `personal_recipients` for deleted users) will accumulate silently.

### Technical Debt

- The data layer is split between `localStorage` (primary) and PostgreSQL (sync destination) with no single source of truth. This creates synchronization edge cases, especially on multi-device use.
- The `personal_recipients.data` jsonb blob makes querying impossible without full-table scans and application-side filtering.
- No test suite exists at any layer (unit, integration, or E2E).
- No migration files — `drizzle-kit push` is being used as the schema management strategy. This will break on a production database with live data when a destructive schema change is needed.
- The admin UI and API have no role-based access control. Any user who navigates to `/admin` has full system access.

---

## 9. Future Expansion Considerations

### Scalability Concerns

- **localStorage as primary database** will not scale beyond single-device, single-browser use. Multi-device sync requires a full migration to server-side state with a proper session system.
- **`personal_recipients.data` JSON blob** cannot be queried efficiently. At scale, finding all users with a birthday on a given date requires fetching all rows and parsing JSON in the application layer.
- **No background job infrastructure** — the business scheduler runs inside the Express process. At scale, this needs to be extracted to a queue system (e.g., BullMQ, Temporal).
- **OpenAI API costs** are not tracked or rate-limited per user. A malicious user or a bug in an automation loop could generate unlimited API calls.

### Database Limitations

- No migration strategy beyond `drizzle-kit push` — unsafe for production schema changes
- Unenforced foreign keys will result in data integrity issues as user counts grow
- No indexes on `userId` columns in `personal_recipients` or `business_clients` — full table scans at scale
- The `demo_leads` table has no TTL or archiving strategy

### Performance Bottlenecks

- Card generation requires a synchronous GPT-4o call (typically 3–8 seconds) with no streaming to the user
- The card classification pipeline (for building the AI card picker) is a batch process with no incremental update strategy
- All Handwrytten API calls are synchronous and blocking

### Multi-Tenant Considerations

- Business accounts are isolated by `businessId` (string), not by a proper tenant schema
- No row-level security in PostgreSQL — all data is accessible by the application layer without tenant filtering
- The admin UI has no tenant scoping — it shows all data across all users

---

## 10. File Structure

```
/
├── artifacts/                         # Deployable services
│   ├── api-server/                    # Express 5 backend
│   │   ├── src/
│   │   │   ├── app.ts                 # Express app setup, middleware, route mounting
│   │   │   ├── stripeClient.ts        # Stripe SDK initialization + StripeSync
│   │   │   ├── webhookHandlers.ts     # Stripe webhook event processing
│   │   │   ├── lib/
│   │   │   │   └── openai.ts          # OpenAI client initialization
│   │   │   ├── routes/
│   │   │   │   ├── admin.ts           # Admin endpoints (Handwrytten, card library)
│   │   │   │   ├── business-approval.ts # Token-based business card approval
│   │   │   │   ├── business-cards.ts  # Business card queue management
│   │   │   │   ├── business-clients.ts # Business client CRUD
│   │   │   │   ├── business-settings.ts # Business account settings
│   │   │   │   ├── card-preview.ts    # Shareable card preview links
│   │   │   │   ├── demo-email.ts      # Demo lead email flow
│   │   │   │   ├── generate-card.ts   # V1 card message generation
│   │   │   │   ├── personal-cards.ts  # Personal card picker
│   │   │   │   ├── personal-recipients.ts # User session + recipient sync
│   │   │   │   ├── stripe.ts          # Stripe plans, checkout, portal
│   │   │   │   └── v2-generate-card.ts # V2 archetype-based generation
│   │   │   └── services/
│   │   │       ├── ai-card-picker.ts  # Selects best Handwrytten card for occasion
│   │   │       ├── biz-card-message.ts # Business message generation
│   │   │       ├── business-scheduler.ts # Scheduled event + card queue job
│   │   │       ├── card-classifier.ts # AI classification of card images
│   │   │       ├── custom-card-generator.ts # DALL-E card image generation
│   │   │       ├── handwrytten.ts     # Handwrytten API wrapper
│   │   │       └── sendgrid.ts        # Resend email client (misnamed)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── fi-forgot/                     # React + Vite frontend
│   │   ├── src/
│   │   │   ├── App.tsx                # Root router, ProtectedRoute, workspace switching
│   │   │   ├── main.tsx               # Vite entry point
│   │   │   ├── index.css              # Global font imports, CSS resets
│   │   │   ├── components/
│   │   │   │   └── ui/                # Shadcn-based component library
│   │   │   ├── lib/
│   │   │   │   ├── auth-context.tsx   # Global auth state, login/logout/upgrade
│   │   │   │   ├── data.ts            # Recipient/card CRUD + localStorage persistence
│   │   │   │   ├── admin-data.ts      # Admin queue/fulfillment data layer
│   │   │   │   ├── plan.ts            # Plan tier definitions and perks
│   │   │   │   └── relationship-health.ts # Brownie Points scoring engine
│   │   │   └── pages/
│   │   │       ├── landing.tsx        # Marketing landing page
│   │   │       ├── personal-auth.tsx  # Personal login/signup
│   │   │       ├── onboarding.tsx     # New user onboarding wizard
│   │   │       ├── dashboard.tsx      # Main personal dashboard
│   │   │       ├── recipients.tsx     # Recipient list
│   │   │       ├── recipient-profile.tsx # Individual recipient editor
│   │   │       ├── briefing.tsx       # Event briefing Q&A
│   │   │       ├── card-generator.tsx # Card generation UI
│   │   │       ├── cards-review.tsx   # Approval queue
│   │   │       ├── admin.tsx          # Admin management interface
│   │   │       ├── business.tsx       # Business product landing page
│   │   │       ├── business-dashboard.tsx # Business-tier dashboard
│   │   │       ├── subscribe.tsx      # Plan selection + Stripe checkout
│   │   │       ├── reminder-settings.tsx # Notification preferences
│   │   │       └── card-flow-v2.tsx   # Free trial interactive demo
│   │   ├── public/                    # Static assets (mascot images, brand icons)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── mockup-sandbox/                # Developer UI preview environment (not customer-facing)
│
├── lib/                               # Shared internal packages
│   ├── db/                            # Database schema and Drizzle ORM config
│   │   └── src/
│   │       ├── index.ts               # Drizzle client export
│   │       └── schema/
│   │           ├── users.ts           # fi_users table
│   │           ├── personal-recipients.ts # personal_recipients + recipient_memory
│   │           ├── recipients-v2.ts   # recipients_v2 (partial migration)
│   │           ├── business-clients.ts
│   │           ├── business-settings.ts
│   │           ├── business-card-queue.ts
│   │           ├── pending-approvals.ts
│   │           ├── card-classifications.ts
│   │           ├── custom-holiday-cards.ts
│   │           ├── ai-card-library.ts
│   │           ├── sample-card-messages.ts
│   │           ├── card-previews.ts
│   │           ├── demo-leads.ts
│   │           ├── conversations.ts
│   │           └── messages.ts
│   ├── api-spec/                      # OpenAPI 3.0 specification + Orval codegen config
│   │   └── openapi.yaml               # Source of truth for all API contracts
│   ├── api-zod/                       # Zod schemas generated from OpenAPI spec
│   ├── api-client-react/              # React Query hooks generated from OpenAPI spec
│   ├── integrations-openai-ai-server/ # OpenAI client wrapper (server-side)
│   └── integrations/
│       └── openai_ai_integrations/    # Additional OpenAI integration utilities
│
├── scripts/                           # Utility scripts
│   └── src/
│       └── seed-products.ts           # Seeds Stripe products and prices
│
├── attached_assets/                   # Development reference assets (not deployed)
├── Brand Assets/                      # Brand system documentation and images
├── pnpm-workspace.yaml                # Workspace definitions, catalog pins
├── tsconfig.json                      # Root TypeScript solution config (libs only)
├── tsconfig.base.json                 # Shared strict TypeScript defaults
├── package.json                       # Root devDependencies and task scripts
└── replit.md                          # Project documentation and developer notes
```

---

*End of report. For questions about specific implementation details, refer to the files listed in Section 10 or the source files cited throughout this document.*
