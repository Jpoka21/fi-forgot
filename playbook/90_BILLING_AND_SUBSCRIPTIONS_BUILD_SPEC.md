# 90_BILLING_AND_SUBSCRIPTIONS_BUILD_[SPEC.md](http://SPEC.md)

# Billing and Subscriptions Build Specification

## 1. Purpose

The Billing and Subscriptions experience defines how a user understands, purchases, manages, pauses, cancels, reactivates, and trusts payment related access inside F.I. Forgot.

This screen family must not feel like a utility billing portal.

It must feel like the business side of a premium Relationship Concierge.

The user is not buying software.

The user is choosing how much help they want staying thoughtful with the people who matter.

Billing must be calm, transparent, elegant, and emotionally safe.

No dark patterns.

No pressure language.

No confusing tiers.

No surprise fees.

No guilt based cancellation.

No interface that makes the user feel trapped.

The billing experience exists to answer four questions clearly:

1. What plan am I on?
2. What does it include?
3. What will I pay, and when?
4. What happens if I change it?

## 2. Product Philosophy

F.I. Forgot is a premium Relationship Concierge that happens to write and mail incredible greeting cards.

Billing must support that positioning.

The subscription model should feel like retaining a thoughtful assistant, not unlocking a gimmick.

The tone should be composed, helpful, and direct.

The user should always understand that the product is helping them protect relationships, avoid forgotten moments, and make meaningful gestures easier.

Billing copy must avoid transactional commodity language wherever possible.

Do not say:

“Buy cards.”

“Unlock AI.”

“Upgrade for more features.”

“Pay now to access.”

Prefer:

“Choose your level of support.”

“Keep every important moment covered.”

“Add more room for the people who matter.”

“Your concierge support continues on…”

Billing is part of trust.

A user who trusts billing is more likely to trust the app with relationships, dates, memories, and personal messages.

## 3. Non Negotiable Preservation Rules

The frontend redesign must preserve all existing backend behavior.

Do not change Stripe integration logic.

Do not change subscription database schema.

Do not change user entitlement rules.

Do not change API contracts.

Do not change payment processor responsibilities.

Do not change authentication requirements.

Do not change Handwrytten fulfillment logic.

Do not change card generation logic.

Do not change trial eligibility logic unless already supported by the backend.

Do not invent billing features that require backend changes unless clearly marked as future only.

Frontend may change:

Visual hierarchy.

Layout.

Copy.

Component composition.

Loading states.

Error presentation.

Empty states.

Confirmation states.

Responsive behavior.

Accessibility behavior.

Analytics instrumentation.

Frontend must not change:

Plan IDs.

Stripe price IDs.

Webhook expectations.

Billing status definitions.

Invoice source of truth.

Payment method source of truth.

Subscription lifecycle state machine.

## 4. Billing Experience Principles

### 4.1 Calm before conversion

The billing experience must never feel aggressive.

Pricing should be clear, but not loud.

Upgrade prompts should feel helpful.

Cancellation flows should feel respectful.

Failed payment states should feel solvable, not shameful.

### 4.2 Transparency before persuasion

Every price must include billing cadence.

Every plan must clearly show what is included.

Any renewal date must be visible.

Any downgrade effect must be explained before confirmation.

Any cancellation effect must be explained before confirmation.

### 4.3 Concierge framing

Plans should be described by level of relationship coverage.

The visual design should reinforce support, coverage, and thoughtfulness.

Do not frame the product as a pile of features.

### 4.4 No punishment language

Never say:

“You will lose everything.”

“You failed to pay.”

“Your account is delinquent.”

“You are no longer eligible.”

Prefer:

“We could not complete the payment.”

“Your subscription needs attention.”

“Your access is paused until billing is updated.”

“Your saved people and memories remain safe.”

### 4.5 Reversibility

Whenever possible, plan changes must feel reversible.

The user should know they can reactivate later.

The user should know their relationship data is preserved unless backend rules say otherwise.

## 5. Information Architecture

Billing and Subscriptions live inside Settings as a primary settings section.

Primary route:

`/settings/billing`

Secondary billing routes may be represented as internal states or child routes depending on the existing frontend architecture.

Recommended route map:

`/pricing`

Public pricing page.

`/settings/billing`

Authenticated billing overview.

`/settings/billing/manage`

Subscription management surface.

`/settings/billing/payment-methods`

Payment method management surface if not fully handled by Stripe portal.

`/settings/billing/history`

Billing history and invoices.

`/checkout`

Checkout entry route.

`/checkout/success`

Post checkout confirmation.

`/checkout/cancelled`

Checkout cancellation return.

If the existing app already uses different routes, preserve those routes and apply this IA to the existing route names.

## 6. Navigation Placement

### 6.1 Public navigation

The public marketing navigation may include a Pricing link.

Placement:

Desktop header, right side navigation group.

Mobile menu, below main product links and above authentication actions.

Label:

“Pricing”

Do not label it:

“Plans”

“Subscribe”

“Upgrade”

### 6.2 Authenticated navigation

Billing appears under Settings.

Settings side navigation label:

“Billing”

Icon:

Credit card outline or receipt outline.

Do not use a dollar sign icon.

Billing should not appear as a main dashboard navigation item unless the user has a payment issue.

### 6.3 Payment issue navigation

When a payment needs attention, show a small dashboard level alert.

Alert placement:

Below dashboard welcome area.

Above upcoming relationship moments.

Alert visual priority:

Noticeable but not alarming.

CTA:

“Update billing”

Do not use:

“Pay now”

“Fix payment”

“Reactivate immediately”

## 7. Billing Surface Hierarchy

The authenticated Billing screen is composed in this order:

1. Page header.
2. Current plan summary card.
3. Billing status notice, only if needed.
4. Subscription details.
5. Payment method summary.
6. Billing history preview.
7. Plan change options.
8. Cancellation and support area.

The user must be able to answer their current status before seeing upgrade options.

Upgrade should not be the first thing shown to a paying user unless the user intentionally enters from an upgrade CTA.

## 8. Global Layout Specifications

### 8.1 Page canvas

Background:

Warm off white app background from the playbook color system.

The billing page must not use stark white full screen backgrounds.

Main content width:

Maximum 1120 px on desktop.

Content gutter:

32 px desktop.

24 px tablet.

16 px mobile.

Top padding:

32 px desktop.

28 px tablet.

20 px mobile.

Bottom padding:

64 px desktop.

56 px tablet.

40 px mobile.

### 8.2 Billing page grid

Desktop layout:

Two column layout.

Left column width:

Approximately 68 percent.

Right column width:

Approximately 32 percent.

Column gap:

24 px.

Left column contains primary billing details.

Right column contains plan support, trust notes, and secondary actions.

Tablet layout:

Single column.

Cards stack vertically.

Gap:

20 px.

Mobile layout:

Single column.

Cards stack vertically.

Gap:

16 px.

### 8.3 Card styling

All billing cards use the standard premium app card style.

Background:

Warm white.

Border:

1 px soft warm neutral border.

Border radius:

24 px for major cards.

18 px for compact cards.

Shadow:

Soft low elevation shadow.

Padding:

28 px desktop.

24 px tablet.

20 px mobile.

Card gap inside:

16 px minimum.

No card should have harsh black borders.

No billing card should use bright red unless representing a true destructive final confirmation.

### 8.4 Typography

Page title:

32 px desktop.

28 px tablet.

24 px mobile.

Weight:

1. 

Line height:

1.15.

Section title:

20 px desktop.

18 px mobile.

Weight:

1. 

Body:

15 or 16 px.

Line height:

1.5.

Metadata:

13 or 14 px.

Line height:

1.4.

Button text:

14 or 15 px.

Weight:

1. 

Price text:

40 px desktop on pricing page.

32 px mobile.

Weight:

1. 

Billing dates:

Use medium emphasis text.

Never bury renewal dates in tiny muted text.

## 9. Authenticated Billing Page Layout

### 9.1 Page header

Location:

Top of `/settings/billing`.

Content:

Title:

“Billing”

Subtitle:

“Manage your plan, payment method, and billing history.”

Header right action:

Only show if useful.

Possible action:

“View pricing”

Do not show Stripe portal CTA in the header if the page already has management actions below.

Desktop:

Title and subtitle aligned left.

Optional action aligned right.

Mobile:

Title, subtitle, and action stack vertically.

Gap:

12 px.

### 9.2 Current plan summary card

This is the most important card.

Placement:

First card in main column.

Height:

Auto.

Minimum desktop height:

180 px.

Content order:

Plan eyebrow.

Plan name.

Plan description.

Included coverage summary.

Renewal or trial status.

Primary action row.

Eyebrow examples:

“Current plan”

“Trial active”

“Subscription paused”

“Billing needs attention”

Plan name examples:

“Essential”

“Concierge”

“Premium Concierge”

Use actual existing plan names from backend when available.

If backend plan name is technical, map to user friendly display labels on the frontend only.

Plan description:

One sentence maximum.

Example:

“Designed to keep your closest relationships covered throughout the year.”

Coverage summary row:

Show concise entitlement chips.

Examples:

“6 cards per year”

“Up to 6 people”

“Handwritten mailing included”

“AI assisted drafts”

Use actual entitlement data if available.

Do not invent entitlements.

Renewal line:

“Renews on August 1, 2026.”

Trial line:

“Trial ends on August 1, 2026.”

Cancelled but active until period end:

“Access continues until August 1, 2026.”

Past due:

“Your subscription needs attention before access can continue.”

Primary action row:

Active paid user:

“Manage plan”

Secondary:

“View invoices”

Free user:

“Choose a plan”

Secondary:

“Compare plans”

Trial user:

“Choose your plan”

Secondary:

“Trial details”

Past due user:

“Update payment”

Secondary:

“View billing details”

Cancelled user:

“Reactivate”

Secondary:

“View plan options”

### 9.3 Plan visual treatment

The current plan card should feel premium, not salesy.

Use a subtle warm gradient accent area at the top or left edge.

Accent height if top:

6 px.

Accent width if side:

6 px.

Do not use neon gradients.

Do not use confetti.

Do not use lock icons for free users.

Use a small concierge style icon:

Card.

Envelope.

Heart.

Calendar.

Receipt.

## 10. Billing Status Notices

Billing status notices appear below the current plan card only when needed.

Notice types:

Trial ending soon.

Payment failed.

Payment method expiring.

Subscription cancelled.

Subscription paused.

Invoice pending.

Plan change scheduled.

### 10.1 Notice layout

Container:

Rounded rectangle.

Border radius:

18 px.

Padding:

16 px.

Icon:

20 px.

Title:

15 px, weight 700.

Body:

14 px.

CTA:

Small button or text button.

Desktop:

Icon left, text center, action right.

Mobile:

Stack action below body.

### 10.2 Payment failed notice

Tone:

Calm and helpful.

Title:

“Your billing needs attention”

Body:

“We could not complete the latest payment. Update your payment method to keep your concierge support active.”

Primary CTA:

“Update payment”

Secondary link:

“View invoice”

Do not say:

“Payment failed.”

“Your card was declined.”

unless the backend gives that as a processor reason and the user explicitly opens details.

### 10.3 Trial ending notice

Title:

“Your trial ends soon”

Body:

“Choose a plan before August 1, 2026 to keep your important moments covered.”

CTA:

“Choose a plan”

### 10.4 Cancelled notice

Title:

“Your plan is scheduled to end”

Body:

“Your concierge support continues until August 1, 2026. You can reactivate anytime before then.”

CTA:

“Reactivate”

## 11. Subscription Details Section

Placement:

Below status notices in the main column.

Card title:

“Subscription details”

Rows:

Plan.

Status.

Billing cadence.

Renewal date.

Included cards.

Included people or recipients.

Next invoice amount.

Subscription started.

Each row:

Label left.

Value right.

Desktop:

Two column key value rows.

Mobile:

Label above value.

Row height:

Minimum 44 px.

Divider:

1 px soft neutral between rows.

Do not use dense table styling.

### 11.1 Status labels

Active:

“Active”

Trialing:

“Trial active”

Past due:

“Needs attention”

Cancelled but active:

“Ends on renewal date”

Paused:

“Paused”

Free:

“Free”

Incomplete checkout:

“Checkout incomplete”

### 11.2 Status badge styling

Badge height:

28 px.

Horizontal padding:

10 px.

Border radius:

999 px.

Text size:

13 px.

Active badge:

Soft green neutral treatment.

Trial badge:

Soft warm gold treatment.

Past due badge:

Soft amber treatment first.

Use red only if access is already stopped.

Cancelled badge:

Soft neutral treatment.

## 12. Payment Method Summary

Placement:

Main column below subscription details, or right column on wider screens if space allows.

Card title:

“Payment method”

Empty title for no method:

“No payment method yet”

Active payment method display:

Brand icon.

Card brand.

Last four digits.

Expiration date.

Billing name if available.

Example:

“Visa ending in 4242”

“Expires 04/28”

Primary CTA:

“Update payment method”

Secondary:

“Add backup method” only if backend supports it.

If backend does not support multiple payment methods, do not show backup method.

### 12.1 Expiring card state

If card expires within backend supported warning window:

Title:

“Payment method expiring soon”

Body:

“Update your card before renewal so your concierge support continues without interruption.”

CTA:

“Update payment”

### 12.2 Missing payment method state

For free user:

Body:

“You will add a payment method when you choose a plan.”

CTA:

“Choose a plan”

For trial user without payment method:

Body depends on existing trial behavior.

If trial requires card:

“You added this payment method for your trial.”

If trial does not require card:

“You will add a payment method when you continue after your trial.”

## 13. Billing History Preview

Placement:

Below payment method.

Card title:

“Billing history”

Desktop header action:

“View all”

Rows:

Invoice date.

Description.

Amount.

Status.

Download action.

Show most recent 3 invoices on overview.

If no invoice history:

Use empty state.

### 13.1 Invoice row layout

Desktop:

Date column 120 px.

Description flexible.

Amount 96 px.

Status 110 px.

Action 80 px.

Mobile:

Rows become stacked invoice cards.

Top line:

Description and amount.

Second line:

Date and status.

Action:

“Download invoice” full width text button or small button.

### 13.2 Invoice statuses

Paid:

“Paid”

Open:

“Open”

Draft:

“Pending”

Void:

“Voided”

Uncollectible:

“Needs attention”

Use Stripe source values mapped to user friendly labels.

## 14. Plan Change Options Layout

Placement:

Below billing details.

Card title:

“Plan options”

Subtitle:

“Adjust your level of concierge support as your relationships change.”

Show only plans available to the current user.

If backend provides plan list:

Render from API.

If backend has static plan configuration:

Render from existing constants.

Never hardcode price IDs inside UI components.

### 14.1 Plan cards

Desktop:

Plans appear in a horizontal grid.

Two plans:

Each 50 percent width with 16 px gap.

Three plans:

Three columns with 16 px gap.

Four or more plans:

Use responsive grid with minimum card width 240 px.

Mobile:

Single column.

Plan card padding:

24 px desktop.

20 px mobile.

Border radius:

22 px.

Current plan:

Use stronger border.

Show badge:

“Current plan”

Recommended plan:

Only show if product rules already define one.

Badge:

“Recommended”

Do not make the recommended badge visually overpower current plan status.

### 14.2 Plan card content order

Badge row.

Plan name.

Short description.

Price.

Billing cadence.

Coverage list.

Primary action.

Secondary detail link.

Price format:

`$9.99`

Cadence:

`per month`

or

`per year`

If annual includes savings and backend supports it:

“Billed yearly”

Do not show savings unless the pricing math is accurate.

Coverage list:

Use check icons.

Maximum visible bullets:

1. 

If more than 5 items:

Show “See everything included.”

### 14.3 Plan actions

Current plan:

Button disabled or neutral.

Label:

“Current plan”

Upgrade available:

Primary button.

Label:

“Upgrade”

Downgrade available:

Secondary button.

Label:

“Switch to this plan”

Free user:

Primary button.

Label:

“Choose plan”

Cancelled user:

Primary button.

Label:

“Reactivate on this plan”

Trial user:

Primary button.

Label:

“Continue with this plan”

## 15. Public Pricing Page Layout

Route:

`/pricing`

Purpose:

Let unauthenticated and authenticated users understand subscription options.

The pricing page must be warm, simple, and confidence building.

It should not feel like SaaS pricing.

### 15.1 Pricing page structure

Order:

1. Hero section.
2. Plan cards.
3. What is included section.
4. How it works section.
5. Trust and billing clarity section.
6. FAQ section.
7. Final CTA.

### 15.2 Pricing hero

Max width:

880 px.

Alignment:

Centered.

Top padding:

88 px desktop.

64 px tablet.

48 px mobile.

Title:

“Choose how much thoughtfulness you want covered.”

Alternative if too long:

“Keep the people who matter covered.”

Subtitle:

“F.I. Forgot helps you remember important moments, create personal card drafts, and send handwritten cards without the last minute scramble.”

Hero CTA:

If logged out:

“Get started”

Secondary:

“See how it works”

If logged in free:

“Choose a plan”

Secondary:

“Back to dashboard”

If logged in paid:

“Manage billing”

Secondary:

“Back to dashboard”

### 15.3 Pricing plan grid

Max width:

1120 px.

Grid gap:

20 px desktop.

16 px mobile.

Card min height:

420 px desktop.

Card padding:

28 px.

Current plan card if authenticated:

Show “Current plan” badge.

Recommended card:

Slightly elevated.

Border 2 px using warm accent.

No aggressive scale transform.

### 15.4 Pricing card visual hierarchy

Plan name.

Audience description.

Price.

Cadence.

Primary CTA.

Coverage list.

Fine print.

Example audience descriptions:

“For a few close relationships.”

“For keeping your inner circle covered.”

“For people who want a concierge level safety net.”

Fine print examples:

“Taxes may apply.”

“Renews automatically. Cancel anytime.”

Only include accurate statements supported by billing rules.

### 15.5 What is included section

Layout:

Two column desktop.

Single column mobile.

Left:

Section title and short explanation.

Right:

Feature list cards.

Feature list examples:

Personalized card drafts.

Relationship memory support.

Important date tracking.

Handwritten mailing.

Concierge tone guidance.

Again, only include features supported by existing app functionality.

## 16. Checkout Entry Layout

Checkout should feel like a focused continuation of choosing support.

If Stripe Checkout is used, the app should prepare the user before redirecting.

### 16.1 Pre checkout confirmation screen

Route:

`/checkout`

Card centered.

Max width:

640 px.

Top padding:

80 px desktop.

48 px mobile.

Content:

Title:

“Confirm your plan”

Subtitle:

“Review your selection before continuing to secure checkout.”

Summary card:

Plan name.

Price.

Billing cadence.

Included coverage.

Renewal note.

Primary CTA:

“Continue to checkout”

Secondary:

“Back to plans”

Security note:

“Payments are securely handled through Stripe.”

Do not over explain Stripe.

### 16.2 Redirect loading state

After user clicks continue:

Button enters loading state.

Button label:

“Opening checkout…”

Disable all plan change actions.

Show small text below:

“Do not refresh this page.”

Only show this if redirect takes longer than 600 ms.

### 16.3 Checkout cancelled return

Route:

`/checkout/cancelled`

Title:

“Checkout was not completed”

Body:

“No changes were made to your plan.”

CTA:

“Return to pricing”

Secondary:

“Back to dashboard”

Tone:

Neutral.

Do not imply failure.

### 16.4 Checkout success return

Route:

`/checkout/success`

Title:

“You are all set”

Body:

“Your concierge support is active. We will keep helping you stay ahead of the moments that matter.”

CTA:

“Go to dashboard”

Secondary:

“View billing”

Show plan summary if available.

If Stripe webhook confirmation may lag:

Show:

“Your subscription is being confirmed. This usually updates shortly.”

Do not promise instant access unless backend confirms it.

## 17. Complete Layout Specifications

### 17.1 Desktop billing overview

Viewport:

1440 px wide reference.

Main app shell remains unchanged.

Settings content starts after existing sidebar or app navigation.

Content container:

Max width 1120 px.

Header:

Width 100 percent.

Margin bottom 28 px.

Main grid:

Display grid.

Columns:

`minmax(0, 2fr) minmax(300px, 1fr)`

Gap:

24 px.

Left column stack gap:

20 px.

Right column stack gap:

20 px.

Left column order:

Current plan summary.

Billing status notice.

Subscription details.

Payment method.

Billing history.

Plan options.

Right column order:

Concierge support note.

Billing clarity card.

Need help card.

Cancellation access card.

### 17.2 Tablet billing overview

Viewport:

768 px reference.

Container padding:

24 px.

Grid:

Single column.

Header margin bottom:

24 px.

All cards full width.

Plan cards:

Two column only if each card can remain at least 300 px wide.

Otherwise single column.

### 17.3 Mobile billing overview

Viewport:

390 px reference.

Container padding:

16 px.

Top padding:

20 px.

Page title:

24 px.

Subtitle:

15 px.

Cards:

Border radius 20 px.

Padding 18 px.

Card gap:

16 px.

Primary buttons:

Full width.

Secondary buttons:

Full width when paired with primary action.

Invoice rows:

Stacked cards.

Plan cards:

Single column.

No horizontal scrolling.

No clipped price text.

No sticky upsell bar.

### 17.4 Desktop pricing page

Viewport:

1440 px reference.

Hero max width:

880 px.

Hero vertical spacing:

Top 88 px.

Bottom 48 px.

Plan grid:

Max width 1120 px.

Cards equal height.

Pricing section margin bottom:

72 px.

FAQ max width:

820 px.

Final CTA max width:

760 px.

### 17.5 Mobile pricing page

Viewport:

390 px reference.

Hero top padding:

48 px.

Hero title:

32 px maximum.

Hero subtitle:

16 px.

Plan grid:

Single column.

Plan cards:

Full width.

CTA buttons:

Full width.

FAQ accordions:

Full width.

Final CTA:

No decorative imagery that crowds the screen.

### 17.6 Modal layout rules

Billing modals are used for:

Downgrade confirmation.

Cancellation confirmation.

Reactivation confirmation.

Refund information.

Invoice detail.

Modal width:

520 px default.

Cancellation modal width:

600 px.

Mobile:

Full width bottom sheet style preferred.

Mobile modal margin:

16 px.

Border radius:

24 px desktop.

24 px top corners on mobile bottom sheet.

Modal header:

Title.

One sentence description.

Modal body:

Specific consequences.

Modal footer:

Primary action.

Secondary action.

Destructive action only when final.

Never place destructive action as the only visible button.

### 17.7 Sticky behavior

Do not use sticky pricing CTAs on authenticated billing pages.

Public pricing page may use sticky mobile bottom CTA only if the user has scrolled past the plan grid and no modal is open.

Sticky CTA height:

72 px.

Background:

Warm white with top border.

Button:

Full width.

Label:

“Choose a plan”

Do not show sticky CTA to active paid users.

## 18. Subscription Architecture

The Billing frontend is responsible for accurately representing the user's subscription state at all times.

The frontend must never attempt to infer subscription state from partial information.

The backend remains the source of truth.

Stripe remains the payment processor.

Webhook processed subscription state remains authoritative.

The frontend should simply visualize that state in a calm, understandable way.

---

## 18.1 Subscription State Machine

The UI should support every backend subscription state.

Each state has its own messaging, available actions, badges, alerts, and navigation behavior.

Typical states include:

Free

Trial

Active

Scheduled Change

Past Due

Incomplete

Incomplete Expired

Canceled but Active Until End of Period

Expired

Paused (if supported)

Payment Processing

Unknown

Every state must have a unique visual treatment.

Never allow ambiguous wording.

---

## 18.2 Free User

Badge

Free

Summary

You haven't selected a concierge plan yet.

Primary CTA

Choose a Plan

Secondary CTA

Compare Plans

Visible Sections

Current Plan

Pricing Comparison

Benefits

FAQ

Billing History

Hidden

Payment Method

Invoices

Renewal

Cancellation

---

## 18.3 Trial User

Badge

Trial Active

Summary

Your concierge trial is active.

Renewal Area

Trial Ends

Remaining Days

Plan Selected

Next Charge

Primary CTA

Manage Trial

Secondary CTA

Compare Plans

Display countdown only if fewer than 14 days remain.

Do not display an alarming countdown timer.

---

## 18.4 Active Subscriber

Badge

Active

Summary

Your concierge support is active.

Display

Plan Name

Renewal Date

Amount

Payment Method

Invoices

Usage Summary

Available Actions

Manage Plan

Update Payment

View Billing History

---

## 18.5 Scheduled Plan Change

Badge

Plan Change Scheduled

Summary

Your plan will change on your next renewal.

Display

Current Plan

Future Plan

Effective Date

Price Difference

CTA

Review Change

Cancel Change

The future plan should appear beneath the current plan using a subtle timeline style.

---

## 18.6 Past Due

Badge

Needs Attention

Top Alert

Billing requires attention.

Do not immediately suspend navigation.

Show

Outstanding Invoice

Retry Date if available

Payment Method

Primary CTA

Update Payment Method

Secondary CTA

Retry Payment

If backend automatically retries payments, communicate that clearly.

Example

We'll automatically try again after you update your payment method.

---

## 18.7 Incomplete Checkout

Badge

Checkout Incomplete

Summary

Your subscription wasn't completed.

CTA

Resume Checkout

Secondary

Choose Another Plan

---

## 18.8 Cancelled but Active

Badge

Ending Soon

Summary

Your subscription remains active until your current billing period ends.

Display

End Date

Remaining Days

Reactivate Button

Do not remove premium features until the backend removes entitlement.

---

## 18.9 Expired Subscription

Badge

Inactive

Summary

Your previous subscription has ended.

Display

Previous Plan

Ended Date

Reactivate CTA

Compare Plans CTA

Relationship data remains safe.

Never imply user data was deleted.

---

## 18.10 Unknown State

If subscription data cannot be determined:

Show loading placeholder first.

After timeout:

Display

"We're having trouble loading your subscription information."

Buttons

Retry

Contact Support

---

# 19. Pricing Architecture

Pricing should communicate value before cost.

The user should understand what life becomes easier.

Not merely what software features exist.

---

## 19.1 Pricing Hierarchy

Each pricing card contains

Plan Name

Audience

Price

Billing Frequency

Primary Benefits

Included Coverage

CTA

Fine Print

---

## 19.2 Price Presentation

Large Price

44px desktop

34px mobile

Currency

18px

Billing cadence

16px

Examples

$9

per month

$99

per year

Do not place "/month" on the same line as the price.

The price should dominate visually.

---

## 19.3 Benefits

Benefits should be written from the user's perspective.

Instead of

Unlimited AI

Write

Personalized card drafts

Instead of

Recipient database

Write

Keep everyone important organized

Instead of

Reminder engine

Write

Stay ahead of birthdays and milestones

---

## 19.4 Feature Lists

Maximum

6 bullets

Each bullet

Check icon

15px text

Examples

Personalized handwritten cards

Relationship memory assistant

Important date tracking

Smart card recommendations

Secure payment processing

Relationship timeline

---

## 19.5 Current Plan Card

Current plan receives

Accent border

Current badge

Muted CTA

No animation

No hover elevation

---

## 19.6 Upgrade Card

Slightly elevated.

Primary CTA filled.

Subtle warm gradient background.

Hover

2px lift

Shadow increase

Transition

180ms

---

## 19.7 Downgrade Card

Neutral border.

Secondary button.

No warm gradient.

No aggressive visual emphasis.

---

# 20. Upgrade Experience

Upgrading should feel exciting without feeling manipulative.

---

## 20.1 Entry Points

Pricing Page

Dashboard Upsell

Billing Screen

Trial Ending Notice

Feature Gate

Settings

All entry points should converge into the same upgrade flow.

---

## 20.2 Upgrade Flow

Choose Plan

↓

Review Summary

↓

Stripe Checkout

↓

Webhook Confirmation

↓

Success Screen

↓

Dashboard

Never skip the review summary.

---

## 20.3 Review Summary Card

Contains

Selected Plan

Billing Frequency

Today's Charge

Renewal Amount

Next Billing Date

Taxes if applicable

Primary CTA

Continue to Secure Checkout

Secondary

Back

---

## 20.4 Checkout Transition

After clicking Continue

Disable buttons.

Spinner appears inside button.

Fade page opacity to 95%.

Display

Opening secure checkout...

After redirect

Nothing else should animate.

---

## 20.5 Upgrade Success

Large success illustration.

Headline

You're all set.

Body

Your concierge support is now active.

Primary CTA

Return to Dashboard

Secondary

View Billing

Confetti should not be used.

A subtle success animation is preferred.

---

# 21. Downgrade Experience

Downgrading should never feel punitive.

It should simply explain what changes.

---

## 21.1 Downgrade Modal

Width

600px

Sections

Current Plan

Future Plan

Effective Date

What Changes

Buttons

Keep Current Plan

Confirm Downgrade

---

## 21.2 What Changes

Every entitlement that changes should be listed individually.

Example

Cards per year

People limit

Priority support

Additional concierge benefits

Do not say

"You lose..."

Instead

"Beginning August 1..."

---

## 21.3 Scheduled Downgrade

If downgrade occurs on renewal

Display timeline

Today

↓

Current Plan

↓

Renewal Date

↓

New Plan

The timeline should use soft dividers.

---

## 21.4 Downgrade Confirmation

Headline

Your plan change is scheduled.

Body

Your current benefits continue until your renewal date.

CTA

Done

Secondary

Undo Plan Change

# 22. Checkout Experience

The checkout experience should feel like the final confirmation of a concierge relationship, not a generic ecommerce purchase.

The goal of the checkout experience is confidence.

The user should never wonder:

• What am I buying?

• How much am I paying?

• When will I be charged again?

• Can I cancel?

• Is my payment secure?

Those answers should already be visible before checkout begins.

Stripe handles payment collection.

F.I. Forgot owns every screen before and after Stripe Checkout.

---

# 22.1 Pre Checkout Experience

Immediately before redirecting to Stripe Checkout, present a lightweight review screen.

Maximum width:

640 px

Centered horizontally.

Vertical spacing:

80 px desktop

56 px tablet

40 px mobile

The review card contains:

Selected plan

Price

Billing cadence

Next renewal date (if known)

Trial information (if applicable)

Taxes disclaimer (if applicable)

Secure checkout notice

Primary CTA

Continue to Secure Checkout

Secondary CTA

Back

---

# 22.2 Review Card Layout

Top section

Small eyebrow

"Selected Plan"

Plan name

Large typography

Short plan description

Divider

Pricing section

Large price

Billing cadence

Renewal information

Divider

Included benefits

Divider

Security notice

Footer buttons

---

Card padding

Desktop

32 px

Tablet

28 px

Mobile

20 px

Border radius

24 px

---

# 22.3 Secure Checkout Messaging

Below the CTA:

Small lock icon

Copy:

Payments are securely processed through Stripe.

We never store your complete payment information.

This copy should remain subtle.

Do not overemphasize security.

Trust should feel assumed.

---

# 22.4 Redirect Loading

After clicking Continue:

Disable entire screen.

CTA enters loading state.

Spinner appears.

Button label changes to

Opening secure checkout…

After 600 milliseconds:

Fade in supporting text.

"Please wait while we connect to Stripe."

If redirect exceeds three seconds:

Display secondary message.

"This is taking a little longer than expected."

Provide:

Retry

Cancel

Only if backend confirms checkout session creation failed.

---

# 22.5 Returning From Stripe

Possible return states:

Success

Canceled

Expired

Unknown

Every state has a dedicated screen.

Never return directly to Dashboard without confirmation.

---

# 23. Stripe Integration UX

The frontend should never expose Stripe terminology.

Avoid displaying:

Customer ID

Subscription ID

Payment Intent

Invoice Object

Price ID

Webhook

Internal Status

Translate everything into user language.

---

# 23.1 Stripe Checkout Success

Large success icon.

Headline

You're all set.

Supporting copy

Your concierge support is active.

We'll help you stay ahead of every important moment.

Primary CTA

Go to Dashboard

Secondary CTA

View Billing

---

# 23.2 Stripe Checkout Cancel

Headline

Checkout wasn't completed.

Supporting copy

Nothing has changed.

You can continue whenever you're ready.

Primary CTA

Return to Plans

Secondary CTA

Dashboard

---

# 23.3 Stripe Error

Headline

Something interrupted checkout.

Supporting copy

No payment was completed.

Please try again.

Buttons

Retry

Contact Support

---

# 23.4 Pending Confirmation

Sometimes Stripe completes before webhooks update.

Display

Updating your subscription…

Spinner

Auto refresh every few seconds.

Maximum waiting time

30 seconds.

If timeout occurs:

Display

We're still confirming your subscription.

You may safely return to your dashboard.

The subscription will update automatically.

---

# 24. Subscription Management

The subscription management screen should answer every billing question without requiring support.

Sections:

Current Plan

Upcoming Renewal

Payment Method

Invoices

Plan Changes

Cancellation

Support

---

# 24.1 Current Plan Card

Shows

Plan Name

Status

Renewal

Price

Cards Included

Recipient Capacity

Current Billing Frequency

Manage button

---

# 24.2 Upcoming Renewal Card

Title

Upcoming Renewal

Contents

Renewal Date

Renewal Amount

Payment Method

Taxes

Estimated Charge

Primary CTA

Update Payment

Secondary

View Invoice History

---

# 24.3 Plan Change Section

If no change scheduled

Display

No changes scheduled.

If change scheduled

Timeline

Current Plan

↓

Renewal

↓

Future Plan

Allow

Cancel Scheduled Change

---

# 25. Payment Methods

Payment methods should always be easy to understand.

Never expose technical payment processor language.

---

# 25.1 Primary Payment Card

Shows

Brand logo

Card type

Last four digits

Expiration

Billing name

Default badge

---

Card height

96 px

Padding

20 px

Border radius

18 px

---

# 25.2 Available Actions

Update Card

Replace Card

Remove Card

Only show Remove if another payment method exists or backend allows removal.

---

# 25.3 Empty Payment Method

Illustration

Small outlined card icon.

Headline

No payment method.

Body

Add a payment method before starting your subscription.

CTA

Add Payment Method

---

# 25.4 Updating Payment Method

Clicking Update opens Stripe's secure update flow.

Do not collect card information inside custom frontend forms unless existing backend already does.

---

# 25.5 Successful Update

Toast

Payment method updated.

Card animates with gentle fade.

Expiration updates immediately.

---

# 26. Billing History

The billing history page provides a complete financial record.

---

Page Header

Billing History

Subtitle

Every invoice associated with your subscription.

---

# 26.1 Desktop Table

Columns

Invoice Date

Description

Amount

Status

Download

Spacing

Generous

Minimum row height

64 px

---

# 26.2 Mobile Cards

Each invoice becomes its own card.

Contents

Date

Description

Amount

Status badge

Download button

---

# 26.3 Invoice Status Badges

Paid

Soft green

Pending

Soft amber

Failed

Soft red

Refunded

Soft blue

Void

Gray

---

# 26.4 Invoice Download

Download icon

Hover state

Subtle underline

Click

Downloads PDF immediately.

If unavailable

Show

Invoice unavailable.

---

# 27. Invoice Details

Selecting an invoice opens a detail modal.

Width

640 px

Contents

Invoice Number

Invoice Date

Plan

Billing Period

Amount

Taxes

Payment Method

Status

Download CTA

Close button

---

# 27.1 Invoice Line Items

Each line item

Description

Quantity

Amount

If quantity equals one,

omit the quantity column.

Keep layout simple.

---

# 27.2 Failed Invoice

Banner

Payment Required

Copy

We couldn't complete this payment.

CTA

Update Payment Method

Retry Payment

---

# 28. Failed Payments

Failed payment experiences should reassure the user.

Never imply wrongdoing.

---

# 28.1 Failed Payment Banner

Warm amber background.

Icon

Alert circle

Headline

Your payment needs attention.

Supporting copy

We couldn't complete your latest payment.

Updating your payment method usually resolves this quickly.

CTA

Update Payment

Secondary

View Details

---

# 28.2 Retry Behavior

If backend retries automatically

Display

We'll automatically try again after your payment method is updated.

Do not ask the user to manually retry unless supported.

---

# 28.3 Grace Period

If backend provides a grace period

Display

Your concierge support continues until...

Show date prominently.

---

# 28.4 Access Restricted

If entitlement is removed

Banner

Subscription Paused

Copy

Update your billing information to restore concierge support.

Primary CTA

Update Payment

Secondary

Choose Another Plan

Do not hide relationship data.

Do not remove memories.

Do not remove recipients.

Only restrict premium functionality according to backend entitlement.

---

# 28.5 Permanent Failure

Headline

Your subscription has ended.

Body

Your relationship information is still here whenever you're ready to return.

CTA

Reactivate Subscription

Secondary

View Plans

# 29. Trial Experience

The trial experience should build confidence, not urgency.

A trial exists to allow the user to experience the value of having a Relationship Concierge before committing to a paid subscription.

Every screen should reinforce progress, trust, and clarity.

The user should never feel tricked into becoming a paying customer.

The application should clearly communicate:

• When the trial started.

• When the trial ends.

• What is included.

• What happens afterward.

• Whether a payment method is required.

• What plan will continue after the trial.

The messaging should remain factual and calm.

Never use countdown timers that create unnecessary pressure.

---

# 29.1 Trial Status Card

The current plan card becomes a Trial card while the user is in a trial.

Contents

Eyebrow

Trial Active

Headline

Your concierge trial is active.

Body

Experience everything included in your trial before deciding which level of concierge support is right for you.

Metadata

Trial Started

Trial Ends

Selected Plan

Next Charge

Status Badge

Trial Active

Primary CTA

Manage Trial

Secondary CTA

Compare Plans

---

# 29.2 Trial Timeline

A simple vertical timeline appears below the status card.

Step 1

Trial Started

Completed checkmark.

Step 2

Today

Highlighted indicator.

Step 3

Trial Ends

Upcoming milestone.

Step 4

Subscription Begins

Future milestone.

Each milestone contains:

Date

Short description

No animations beyond subtle fade in.

---

# 29.3 Trial Ending Soon

If fewer than fourteen days remain, display a notification card.

Background

Warm amber.

Headline

Your trial ends soon.

Body

Choose the plan that best fits the people you want to keep covered.

Primary CTA

Choose Plan

Secondary CTA

Learn More

If the backend automatically converts the user to the selected plan, clearly state:

"Your selected plan begins automatically on..."

---

# 29.4 Final Trial Day

On the final day of the trial:

Replace the notice with a higher emphasis version.

Headline

Your trial ends today.

Body

Your concierge support continues automatically if your selected plan is active.

If additional action is required by the backend, explain exactly what action is required.

Avoid alarming language.

---

# 29.5 Trial Expired

If the trial ends without an active subscription:

Headline

Your trial has ended.

Body

Your relationship information is still here.

Choose a plan whenever you're ready to continue.

Primary CTA

Choose Plan

Secondary CTA

Return to Dashboard

---

# 30. Renewal Experience

Renewal should feel routine.

Users should never be surprised by an upcoming renewal.

The application should communicate upcoming renewals well before they occur.

---

# 30.1 Renewal Summary

Displayed on the Billing Overview.

Contents

Renewal Date

Renewal Amount

Payment Method

Billing Frequency

Next Invoice Estimate

---

# 30.2 Upcoming Renewal Notice

Only display during the backend supported notification window.

Headline

Your subscription renews soon.

Body

Your current payment method will be charged on August 1.

CTA

Update Payment Method

Secondary

View Billing History

---

# 30.3 Successful Renewal

Success toast

Subscription renewed.

No modal required.

Billing history updates automatically.

Renewal date updates immediately.

---

# 30.4 Renewal Failure

If renewal fails:

Display the Failed Payment banner.

Retain all grace period messaging provided by backend.

Never immediately remove access unless entitlement changes.

---

# 31. Cancellation Philosophy

Cancellation is a trust building moment.

The user should leave believing they are welcome back.

Never attempt to shame the user.

Never require contacting support.

Never intentionally hide cancellation.

Never repeatedly interrupt cancellation with aggressive upgrade prompts.

The objective is clarity.

---

# 31.1 Cancellation Entry Points

Billing Overview

Subscription Details

Manage Subscription

Cancellation Notice

Support Recommendations

All entry points lead to the same confirmation flow.

---

# 31.2 Cancellation Layout

Desktop modal

600 px wide.

Mobile

Bottom sheet.

Sections

Why you're leaving

Current Plan

Access Ends

What Happens Next

Confirmation Buttons

---

# 31.3 Access Ends Section

Display

Current Plan

Expiration Date

Remaining Days

Billing Stops

Relationship Data Status

Examples

Your subscription remains active until August 1.

Billing stops immediately after that date.

Your relationship information remains safely stored.

---

# 31.4 Optional Feedback

Feedback is optional.

Never required.

Question

Would you mind telling us why?

Choices

Too expensive

Not using enough

Missing features

Temporary break

Other

Skip button always visible.

---

# 31.5 Final Confirmation

Headline

Cancel Subscription?

Body

Your concierge support continues until August 1.

After that, your subscription will end unless you reactivate.

Primary Button

Confirm Cancellation

Secondary

Keep Subscription

Destructive styling should be restrained.

---

# 31.6 Cancellation Complete

Success illustration

Simple envelope closing.

Headline

We're grateful you trusted us.

Body

Your subscription has been canceled.

Your relationship information remains available if you decide to return.

Primary CTA

Return to Dashboard

Secondary CTA

Reactivate Anytime

---

# 32. Reactivation Experience

Returning users should feel welcomed back.

Never imply they made a mistake by canceling.

---

# 32.1 Reactivation Screen

Title

Welcome Back

Body

Everything you previously saved is ready for you.

Choose how you'd like your concierge support to continue.

Show

Previous Plan

Current Available Plans

Primary CTA

Reactivate

Secondary CTA

Compare Plans

---

# 32.2 Reactivation Confirmation

Summary Card

Plan

Price

Renewal

Payment Method

CTA

Continue to Secure Checkout

---

# 32.3 Reactivation Success

Headline

Welcome back.

Body

Your concierge support is active again.

CTA

Go to Dashboard

Relationship timeline, recipients, memories, and preferences should appear immediately after entitlement refresh.

---

# 33. Refund Messaging

Refunds should be explained clearly.

Do not promise refunds unless supported by backend policy.

---

# 33.1 Refund Information Card

Title

Refunds

Body

Refund eligibility follows our billing policy.

If you believe you were charged incorrectly, please contact support.

CTA

Contact Support

---

# 33.2 Refund Status

Possible labels

Requested

Processing

Completed

Declined

Each state receives its own badge.

---

# 33.3 Completed Refund

Headline

Refund Processed

Body

Your refund has been completed.

Depending on your financial institution, it may take several business days to appear.

---

# 34. Gift Subscriptions

Only implement if supported by the backend.

Otherwise reserve the architecture without exposing UI.

---

# 34.1 Gift Landing Page

Headline

Give thoughtful relationships as a gift.

Description

Help someone stay connected with the people who matter most.

Gift Card

Recipient

Plan

Gift Duration

Message

CTA

Continue

---

# 34.2 Gift Checkout

Summary

Recipient

Gift Plan

Gift Duration

Price

Delivery Date

CTA

Continue to Secure Checkout

---

# 34.3 Gift Confirmation

Headline

Your gift is ready.

Body

We'll deliver it on the scheduled date.

CTA

Return to Dashboard

---

# 35. Empty States

Every billing screen should gracefully handle empty data.

Never display blank containers.

---

## 35.1 No Billing History

Illustration

Receipt outline.

Headline

No billing history yet.

Body

Invoices will appear here once your subscription begins.

CTA

Choose a Plan

---

## 35.2 No Payment Method

Illustration

Credit card outline.

Headline

No payment method.

Body

You'll add one during secure checkout.

CTA

Choose Plan

---

## 35.3 No Subscription

Illustration

Calendar with heart.

Headline

You're ready to get started.

Body

Choose the concierge plan that's right for you.

CTA

View Plans

---

## 35.4 No Scheduled Changes

Headline

No upcoming plan changes.

Body

Your subscription will continue as usual.

No CTA required.

# 36. Loading States

Loading states should reassure the user that the application is working.

The interface should remain stable while data loads.

Avoid large layout shifts.

Never replace the entire page with a spinner unless absolutely necessary.

Skeleton placeholders are preferred throughout the Billing experience.

Animations should be subtle and consistent with the Motion System defined elsewhere in the playbook.

---

# 36.1 Initial Page Load

When the Billing page first loads:

Display:

Page title immediately.

Subtitle immediately.

Skeleton cards for all content below.

Skeleton order:

Current Plan Card

Billing Status Card (if applicable)

Subscription Details

Payment Method

Billing History

Plan Options

Support Card

Each skeleton should closely match the final layout.

---

# 36.2 Skeleton Specifications

Card Height

Current Plan

220 px

Subscription Details

280 px

Payment Method

120 px

Billing History

220 px

Plan Options

Variable

Border Radius

Match production cards.

Animation

Soft shimmer.

Duration

1.6 seconds.

Loop infinitely until replaced.

Opacity range

96 percent to 100 percent.

Never pulse aggressively.

---

# 36.3 Checkout Loading

After checkout begins:

Disable every interactive element.

Button changes to loading state.

Spinner size

18 px.

Text

Opening secure checkout…

Background remains unchanged.

Avoid replacing the page with a fullscreen loader.

---

# 36.4 Billing History Loading

Show placeholder invoice rows.

Desktop

Five placeholder rows.

Mobile

Three invoice cards.

Invoice amounts should remain hidden until loaded.

---

# 36.5 Payment Method Loading

Display

Placeholder card icon

Placeholder card number

Placeholder expiration

No fake card brands.

---

# 36.6 Plan Comparison Loading

Plan cards load simultaneously.

Never reveal cards one at a time.

The page should transition from skeletons to finished content using a fade.

Duration

200 ms.

---

# 37. Error States

Errors should be actionable.

Users should always know:

What happened.

Whether their information is safe.

What they should do next.

---

# 37.1 Generic Billing Error

Illustration

Receipt with warning icon.

Headline

We're having trouble loading your billing information.

Body

Please try again.

If the problem continues, contact support.

Buttons

Retry

Contact Support

---

# 37.2 Network Failure

Headline

Connection lost.

Body

We couldn't reach the billing service.

Retry automatically when connection returns.

Retry button remains available.

---

# 37.3 Checkout Session Failure

Headline

Unable to start checkout.

Body

No payment has been processed.

Please try again.

Primary CTA

Retry Checkout

Secondary

Back to Plans

---

# 37.4 Subscription Retrieval Failure

Display skeletons for five seconds.

If still unavailable:

Replace with inline error card.

Avoid empty screens.

---

# 37.5 Invoice Download Failure

Toast

Invoice couldn't be downloaded.

Button

Try Again

---

# 37.6 Payment Update Failure

Headline

We couldn't update your payment method.

Body

No changes were made.

CTA

Try Again

---

# 37.7 Unknown Error

Headline

Something unexpected happened.

Body

Your billing information is safe.

Please try again.

Buttons

Retry

Contact Support

---

# 38. Validation

Billing validation should occur before initiating Stripe Checkout whenever possible.

Backend validation remains authoritative.

Frontend validation exists only to reduce unnecessary round trips.

---

# 38.1 Plan Validation

Prevent checkout if:

No plan selected.

Selected plan unavailable.

Plan archived.

Plan no longer purchasable.

Display inline message rather than modal.

---

# 38.2 Billing Address Validation

Only display fields required by the backend.

Validate:

Required fields

Postal code

Country

State when applicable

Display errors inline.

---

# 38.3 Payment Method Validation

Stripe performs payment validation.

Frontend should never duplicate card validation logic.

---

# 38.4 Coupon Validation

Only display coupon UI if supported.

States

Valid

Invalid

Expired

Already Used

Each receives a distinct inline message.

Do not use modal dialogs.

---

# 39. Responsive Specifications

The Billing experience should remain fully functional from 320 px mobile through ultra wide desktop displays.

No horizontal scrolling.

No clipped content.

No overlapping buttons.

---

# 39.1 Desktop

Reference width

1440 px.

Maximum content width

1120 px.

Two column layout.

---

# 39.2 Large Desktop

Reference width

1920 px.

Center content.

Do not stretch cards.

Maintain readable line lengths.

---

# 39.3 Tablet

Reference width

768 px.

Collapse to one column.

Cards become full width.

Spacing decreases slightly.

---

# 39.4 Mobile

Reference width

390 px.

All buttons become full width when stacked.

Invoice table becomes cards.

Plan comparison becomes vertical.

No floating sidebars.

---

# 39.5 Small Mobile

Reference width

320 px.

Reduce horizontal padding to 16 px.

Price typography scales proportionally.

Never truncate plan names.

---

# 40. Component Tree

/settings/billing

BillingPage

PageHeader

CurrentPlanCard

StatusNotice

SubscriptionDetailsCard

PaymentMethodCard

BillingHistoryCard

PlanComparisonSection

SupportCard

CancellationCard

InvoiceModal

DowngradeModal

CancelModal

ReactivateModal

ToastProvider

---

Pricing

PricingPage

Hero

PricingGrid

PricingCard

FAQSection

TrustSection

FooterCTA

---

Checkout

CheckoutReviewPage

CheckoutSummary

SecureNotice

PrimaryButton

---

History

BillingHistoryPage

InvoiceTable

InvoiceCard

InvoiceDetailModal

---

# 41. Component Specifications

---

## BillingPage

Owns:

Page level data loading.

Subscription retrieval.

Responsive layout.

Error boundary.

---

## CurrentPlanCard

Props

Plan

Status

Renewal

Actions

Displays

Status badge

Renewal

Coverage summary

CTA buttons

---

## PaymentMethodCard

Displays

Brand

Last Four

Expiration

Update Button

---

## BillingHistoryCard

Displays

Recent invoices

Download buttons

View all action

---

## PricingCard

Displays

Plan

Audience

Price

Features

CTA

Badges

Current

Recommended

Popular

Only show badges supported by product rules.

---

## InvoiceModal

Displays

Invoice metadata

Line items

Download action

Close action

---

## CancellationModal

Displays

Expiration

Feedback

Confirmation

Buttons

Keep Plan

Cancel Subscription

---

# 42. Animations

Billing animations should feel premium.

Not playful.

Not distracting.

Animation duration

150 to 250 ms.

Use ease out timing.

---

## Page Load

Fade

8 px upward motion.

---

## Card Hover

Translate Y

Minus 2 px.

Shadow increases slightly.

---

## Success Toast

Fade

Scale

98 percent to 100 percent.

---

## Modal

Fade backdrop.

Scale

96 percent to 100 percent.

---

## Skeleton Transition

Cross fade

200 ms.

---

## Accordion

Height animation

Opacity animation

Maximum duration

180 ms.

---

## Button Loading

Spinner fades in.

Text cross fades.

Button width remains fixed.

Avoid layout movement.

# 43. Microinteractions

Microinteractions throughout the Billing experience should reinforce confidence.

Nothing should feel playful, distracting, or sales driven.

The user should always feel that the application is stable, trustworthy, and carefully crafted.

Animations should rarely exceed 200 milliseconds.

No microinteraction should delay user input.

No animation should interfere with accessibility settings.

If the user has enabled reduced motion, all nonessential animations should be replaced with simple opacity transitions.

---

# 43.1 Page Entry

When entering the Billing page:

The page shell is already visible.

The page title fades into view.

The subtitle fades 40 milliseconds later.

Skeleton cards appear simultaneously.

Loaded cards fade into place as data becomes available.

Individual cards should never "pop" onto the screen independently.

---

# 43.2 Current Plan Card

Hover

Shadow elevation increases slightly.

Card translates upward by 2 pixels.

Transition

180 milliseconds.

Cursor

Pointer only if the card contains clickable actions.

No hover animation on touch devices.

---

# 43.3 Status Badge

Status badges never animate continuously.

If status changes:

Badge crossfades.

Old badge fades out.

New badge fades in.

Duration

150 milliseconds.

Do not pulse.

Do not bounce.

Do not glow.

---

# 43.4 Primary Buttons

Hover

Background darkens slightly according to the design system.

Shadow increases subtly.

Transition

150 milliseconds.

Mouse Down

Scale to 98%.

Mouse Up

Return smoothly to 100%.

Disabled

Opacity reduced.

Cursor changes to not allowed.

No hover animation.

---

# 43.5 Secondary Buttons

Hover

Background tint appears.

Border darkens slightly.

Text color increases in contrast.

Duration

150 milliseconds.

---

# 43.6 Invoice Rows

Desktop

Hover highlights the entire row.

Download icon fades from 60% opacity to 100%.

Row background changes using the neutral hover color.

Mobile

Entire card elevates slightly.

Download button receives hover state independently.

---

# 43.7 Pricing Cards

Hover

Border accent becomes more prominent.

Shadow increases.

Card translates upward by 3 pixels.

Recommended plan

Slightly stronger shadow.

Current plan

No translation.

Only shadow adjustment.

---

# 43.8 Plan Selection

Selecting a plan:

Border animates.

Selection indicator fades in.

CTA updates.

Price remains stationary.

Never animate pricing values.

---

# 43.9 Loading Button

Spinner fades in.

Label crossfades.

Button width remains constant.

No horizontal movement.

---

# 43.10 Success Toast

Appears

Bottom right desktop.

Bottom center mobile.

Animation

Fade

Translate upward 8 pixels.

Dismiss automatically after four seconds.

Pause dismissal while hovered.

---

# 43.11 Error Toast

Same positioning as success.

No shake animation.

Icon changes to warning.

Remain visible until dismissed or timeout.

---

# 43.12 Accordion Expansion

FAQ items.

Invoice details.

Refund policy.

Expansion uses:

Height animation.

Opacity animation.

Maximum duration

180 milliseconds.

Chevron rotates 180 degrees.

---

# 43.13 Modal Presentation

Backdrop fades from 0% to 100%.

Dialog scales from 98% to 100%.

Duration

180 milliseconds.

Closing reverses the sequence.

---

# 43.14 Skeleton Replacement

Skeleton opacity fades to zero.

Loaded content fades to full opacity.

No abrupt replacement.

Duration

200 milliseconds.

---

# 44. Keyboard Behavior

Every Billing interaction must be fully operable without a mouse.

Keyboard behavior must be identical across desktop browsers.

Focus visibility must remain consistent with the global accessibility guidelines.

---

# 44.1 Initial Focus

Entering the page via navigation:

Focus lands on the page heading.

Screen readers announce:

Billing

Manage your subscription, payment methods, and invoices.

---

# 44.2 Tab Order

Desktop order

Page heading

Primary page actions

Current plan actions

Status notice actions

Subscription details

Payment method actions

Billing history

Invoice downloads

Plan comparison

Support links

Footer actions

Never trap focus inside cards.

---

# 44.3 Pricing Cards

Each pricing card behaves as a single selectable group.

Tab

Moves between cards.

Arrow keys

Optional if implemented as radio style selection.

Enter

Selects plan.

Space

Also selects plan.

---

# 44.4 Buttons

Enter activates.

Space activates.

Disabled buttons are skipped.

Loading buttons cannot receive focus.

---

# 44.5 Modals

Opening a modal:

Focus moves to modal title.

Focus remains trapped inside the modal.

Escape closes unless:

Checkout is processing.

Cancellation confirmation is executing.

Closing returns focus to the triggering element.

---

# 44.6 Invoice Table

Desktop

Tab navigates to download links.

Arrow keys should continue normal browser scrolling.

Mobile

Download buttons remain independently focusable.

---

# 44.7 Accordions

Tab reaches each accordion header.

Enter expands.

Space expands.

Arrow keys optional.

Escape does not collapse.

---

# 44.8 Toast Notifications

Toasts should never steal focus.

Screen readers announce them politely.

---

# 45. Accessibility

Billing is a high trust area.

Accessibility is essential.

Every user must be able to confidently understand:

Current subscription.

Upcoming charges.

Payment status.

Available actions.

The interface must satisfy WCAG AA requirements at minimum.

---

# 45.1 Color Contrast

Normal text

Minimum 4.5 to 1.

Large text

Minimum 3 to 1.

Status badges

Must meet contrast independently.

Icons alone may never communicate status.

---

# 45.2 Semantic Structure

Every page contains:

Single H1.

Logical H2 hierarchy.

Lists use proper HTML lists.

Tables use semantic table markup.

Buttons remain buttons.

Links remain links.

Avoid clickable divs.

---

# 45.3 Screen Reader Labels

Current plan button

Manage your current subscription.

Update payment button

Update your payment method.

Invoice download

Download invoice dated July 1, 2026.

Cancel subscription

Cancel your subscription.

Avoid generic labels like:

Click here.

More.

Open.

---

# 45.4 Status Announcements

Subscription changes

Announced using polite live regions.

Examples

Subscription updated.

Payment method updated.

Invoice downloaded.

Plan change scheduled.

---

# 45.5 Form Labels

Every field requires:

Visible label.

Associated label element.

Helpful error message.

Required fields indicate required status.

Placeholder text never replaces labels.

---

# 45.6 Focus Indicators

Every focusable element has:

Visible outline.

Minimum thickness

2 pixels.

Consistent accent color.

Offset

2 pixels.

Never remove browser focus without replacing it.

---

# 45.7 Reduced Motion

Respect prefers reduced motion.

Replace:

Scale

Slide

Large fades

With:

Simple opacity transitions.

---

# 45.8 Responsive Zoom

Billing pages must remain usable at:

200 percent browser zoom.

No clipped buttons.

No hidden content.

No horizontal scrolling.

---

# 45.9 Error Identification

Errors must include:

Icon.

Headline.

Body.

Suggested action.

Errors must not rely on color alone.

---

# 46. Analytics

Billing analytics should measure user understanding and successful completion.

Analytics must never collect payment information.

Stripe remains responsible for payment data.

---

# 46.1 Page Views

Track

Billing Overview Viewed

Pricing Viewed

Checkout Review Viewed

Billing History Viewed

Invoice Viewed

Payment Method Viewed

---

# 46.2 Upgrade Funnel

Track

Upgrade CTA Clicked

Plan Selected

Checkout Started

Checkout Completed

Checkout Canceled

Checkout Failed

Webhook Confirmed

---

# 46.3 Downgrade Funnel

Track

Downgrade Started

Downgrade Reviewed

Downgrade Confirmed

Downgrade Reversed

---

# 46.4 Cancellation Funnel

Track

Cancellation Started

Feedback Selected

Cancellation Confirmed

Cancellation Reversed

Reactivated Later

Do not log freeform cancellation feedback unless privacy policy explicitly allows it.

---

# 46.5 Payment Events

Track

Payment Method Updated

Payment Retry Started

Payment Retry Succeeded

Invoice Downloaded

Renewal Successful

Renewal Failed

---

# 46.6 Error Analytics

Track

Billing Load Failure

Checkout Session Failure

Stripe Redirect Failure

Invoice Download Failure

Network Failure

Unknown Billing Error

Each event should include:

Screen

User subscription state

Device type

Application version

Never include card information.

Never include billing addresses.

Never include Stripe identifiers in analytics payloads.

---

# 47. API Mapping

The frontend should remain a thin presentation layer.

Business logic belongs to the backend.

Stripe remains the payment authority.

No frontend component should derive entitlement independently.

# 47. API Mapping

The Billing frontend is responsible only for presenting subscription information and initiating billing related actions.

The backend remains the source of truth for:

Subscription status

Plan entitlements

Pricing

Renewal dates

Invoice history

Payment methods

Trial eligibility

Cancellation status

Scheduled plan changes

Refund status

The frontend must never cache subscription state in a way that could conflict with backend truth.

Whenever billing related data changes, the frontend should invalidate the appropriate queries and request fresh data.

---

## 47.1 Billing Overview

Purpose

Retrieve the user's current billing state.

Data expected

Current plan

Subscription status

Renewal date

Billing cadence

Current amount

Trial status

Current payment method summary

Upcoming invoice summary

Latest invoices

Available actions

Loading behavior

Skeleton cards.

Error behavior

Inline error card with retry.

---

## 47.2 Pricing

Purpose

Retrieve available plans.

Data expected

Display name

Description

Price

Billing cadence

Display order

Plan availability

Current plan indicator

Recommended indicator if supported

The frontend should render plans dynamically whenever possible.

No hard coded prices.

No hard coded Stripe identifiers.

---

## 47.3 Checkout Session

Purpose

Create a secure Stripe Checkout session.

Request

Selected plan

Optional coupon

Optional promotion

Response

Checkout URL or session information.

Frontend behavior

Disable CTA.

Display loading state.

Redirect immediately.

If creation fails

Remain on page.

Display inline error.

---

## 47.4 Subscription Refresh

Purpose

Refresh current subscription after:

Checkout

Cancellation

Reactivation

Payment update

Webhook completion

Behavior

Invalidate billing cache.

Reload billing overview.

Refresh entitlement dependent screens.

---

## 47.5 Payment Method

Purpose

Retrieve summary information.

Display only

Brand

Last four digits

Expiration

Billing name if available

Never display

Full card number

Security code

Stripe identifiers

---

## 47.6 Billing History

Purpose

Retrieve invoices.

Fields

Invoice date

Amount

Status

Description

Download URL

Billing period

Pagination

Supported if backend provides it.

Infinite scrolling is not recommended.

Use explicit pagination or "Load More."

---

## 47.7 Invoice Download

Purpose

Download PDF invoice.

Frontend

Show progress indicator if download exceeds one second.

Failure

Toast notification.

Retry available.

---

## 47.8 Plan Change

Purpose

Schedule upgrade or downgrade.

Frontend

Confirmation modal.

Success toast.

Subscription refresh.

If backend schedules changes for renewal

Display timeline immediately.

---

## 47.9 Cancellation

Purpose

Cancel subscription.

Frontend

Confirmation modal.

Optional feedback.

Success confirmation.

Refresh billing.

Refresh entitlement.

---

## 47.10 Reactivation

Purpose

Reactivate subscription.

Frontend

Review plan.

Launch checkout if required.

Refresh billing after completion.

---

## 47.11 Trial

Purpose

Retrieve

Trial start

Trial end

Selected continuation plan

Next billing amount

Display countdown messaging only within supported notification window.

---

## 47.12 Refund Status

Only if supported.

Retrieve

Refund state

Requested date

Completed date

Amount

Reason if available

Do not expose internal processor notes.

---

# 48. Performance

Billing is a high trust experience.

Performance directly affects user confidence.

The interface should feel immediate and stable.

---

## 48.1 Initial Render

Target

Less than 1 second perceived load on a typical broadband connection using cached application assets.

Page chrome should render immediately.

Skeletons should appear within the first frame.

---

## 48.2 Content Stability

Avoid cumulative layout shift.

Reserve space for:

Plan cards

Invoice tables

Payment methods

Status notices

Do not allow content to jump after loading.

---

## 48.3 Network Efficiency

Billing overview should be retrieved using a single consolidated request whenever supported.

Avoid sequential waterfalls.

Requests that can execute in parallel should do so.

---

## 48.4 Query Caching

Subscription data should remain fresh.

Invalidate cached billing data after:

Successful checkout

Payment update

Cancellation

Reactivation

Scheduled plan change

Successful renewal

Failed renewal recovery

Do not require manual refresh.

---

## 48.5 Images

Billing pages should contain minimal imagery.

Illustrations should use optimized SVG assets whenever possible.

Avoid large bitmap downloads.

---

## 48.6 Icons

Use the shared application icon library.

Icons should be vector based.

No duplicate icon sets.

---

## 48.7 Animations

Animations must never block interaction.

Target

60 FPS.

Respect reduced motion preferences.

Avoid expensive shadow animations on low powered devices.

---

## 48.8 Memory

Destroy unused modal instances after closing.

Remove temporary checkout state after completion.

Avoid retaining unnecessary invoice data in memory.

---

## 48.9 Offline Handling

If the network connection drops:

Preserve the visible UI.

Display inline connectivity notice.

Allow retry when connection returns.

Do not clear loaded subscription information unless it is known to be stale.

---

# 49. Acceptance Criteria

The Billing implementation is considered complete only when every requirement below is satisfied.

---

## Subscription Overview

The current plan is always displayed accurately.

Subscription status matches backend state.

Renewal information is visible.

Trial information is visible when applicable.

Status badges are correct.

No contradictory messaging exists.

---

## Pricing

Available plans match backend configuration.

Current plan is identified.

Recommended plan appears only when appropriate.

Pricing is responsive.

Plan comparison is readable on every supported viewport.

---

## Checkout

Checkout always begins through the approved Stripe flow.

Loading states appear immediately.

Redirect failures are handled gracefully.

Successful checkout returns to the application with appropriate confirmation.

Webhook synchronization is handled correctly.

---

## Payment Methods

Current payment method is displayed correctly.

Update flow functions correctly.

Missing payment methods display proper empty states.

Expired payment methods generate the appropriate notice.

---

## Billing History

Invoices display correctly.

Downloads function correctly.

Invoice details match backend data.

Responsive layouts remain usable.

---

## Trials

Trial messaging is accurate.

Trial end dates are correct.

Continuation behavior matches backend configuration.

No misleading countdowns appear.

---

## Renewals

Renewal dates are correct.

Renewal amounts are correct.

Renewal success updates automatically.

Renewal failures display recovery messaging.

---

## Plan Changes

Upgrade flow functions correctly.

Downgrade flow schedules correctly.

Scheduled changes display immediately.

Users can reverse scheduled changes when supported.

---

## Cancellation

Cancellation is accessible.

Cancellation messaging is respectful.

Confirmation accurately explains what happens.

Relationship data messaging is accurate.

Reactivation remains available when supported.

---

## Accessibility

Every interactive element is keyboard accessible.

Screen readers announce important state changes.

Contrast ratios satisfy WCAG AA.

Focus indicators are always visible.

Reduced motion is respected.

No interaction requires a mouse.

---

## Responsiveness

All Billing pages function correctly from 320 pixel mobile through large desktop displays.

No horizontal scrolling.

No clipped buttons.

No overlapping cards.

No inaccessible dialogs.

---

## Performance

Skeletons appear immediately.

Layout shift is negligible.

Billing updates refresh automatically after backend changes.

Animations remain smooth.

---

## Analytics

All required billing events are tracked.

No payment information is collected.

No sensitive billing information appears in analytics payloads.

---

## Error Recovery

Every error presents a clear recovery path.

Retry actions function correctly.

Users are never left on a dead end screen.

---

# 50. Definition of Done

The Billing and Subscriptions experience is complete when:

The interface fully represents every supported backend subscription state.

All Stripe related workflows are visually polished and function without frontend ambiguity.

Every Billing screen matches the visual language established throughout the F.I. Forgot redesign.

Every layout has been implemented for desktop, tablet, and mobile.

Every component adheres to the shared design system.

Every loading state has a matching error state and empty state.

Every user action provides immediate visual feedback.

Every confirmation screen clearly communicates the result of the user's action.

Every animation follows the motion specifications.

Every interaction is keyboard accessible.

Every screen satisfies WCAG AA accessibility standards.

Every API integration preserves the existing backend contracts without modification.

All acceptance criteria have been verified.

No placeholder copy remains.

No unresolved UX decisions remain.

No frontend implementation decisions are left to individual developers.

This document should be sufficiently comprehensive that a frontend engineer can implement the entire Billing and Subscriptions experience with minimal clarification while preserving all existing backend behavior, Stripe integration, authentication, entitlement logic, API contracts, and product philosophy.