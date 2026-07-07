# 88_ONBOARDING_BUILD_[SPEC.md](http://SPEC.md)

---

# Purpose

The onboarding experience is the most important flow in the entire product.

Users are not joining because they need a greeting card today.

They are joining because they want help becoming a better spouse, parent, child, sibling, friend, colleague, client partner, or human being.

The onboarding experience must immediately communicate that F.I. Forgot is fundamentally different from reminder apps, greeting card apps, CRMs, or AI writing assistants.

Every screen should reinforce one idea:

> "You are hiring a Relationship Concierge."

The onboarding flow must establish trust before requesting information.

Users should never feel interrogated.

Instead, onboarding should feel like a premium concierge gradually learning how to help.

The user should finish onboarding believing:

* This understands relationships.

* This saves me time.

* This will help me become more thoughtful.

* My information is safe.

* The more I share over time, the better it becomes.

* I do not need to complete everything today.

---

# Design Principles

The onboarding experience follows six principles.

## Principle 1

Start with confidence.

Never overwhelm users with forms immediately after account creation.

---

## Principle 2

Earn every question.

Every piece of requested information must be preceded by a reason why it improves the concierge.

---

## Principle 3

Progress over perfection.

Users should be able to become successful after entering only one important person.

---

## Principle 4

Show value before asking for effort.

Every major onboarding milestone should reveal a new capability.

---

## Principle 5

Reduce anxiety.

There should never be a feeling that missing information breaks the product.

Instead, the interface continually explains:

"We'll keep learning over time."

---

## Principle 6

Celebrate relationships.

Every screen should focus on people.

Never on software.

Never on settings.

Never on AI.

---

# First Impression Goals

Within the first thirty seconds users should understand:

• This remembers important people.

• This learns over time.

• This writes thoughtful cards.

• This mails them automatically.

• I stay in control.

• This feels premium.

• This feels personal.

• This feels trustworthy.

---

# Emotional Journey

The onboarding experience intentionally changes emotional states.

| Stage | Emotional Goal |

|---------|----------------|

| Landing | Curiosity |

| Account Creation | Confidence |

| Welcome | Relief |

| Concierge Introduction | Trust |

| First Recipient | Hope |

| Profile Questions | Personalization |

| Calendar Import | Convenience |

| First Card | Delight |

| Autopilot | Confidence |

| Completion | Excitement |

---

# Overall Flow

```

Landing

↓

Create Account

↓

Verify Email

↓

Welcome

↓

Meet Your Concierge

↓

Create First Relationship

↓

Learn About Them

↓

Relationship Snapshot

↓

Import Calendar (optional)

↓

Import Contacts (optional)

↓

Create First Card

↓

Enable Autopilot

↓

Subscription

↓

You're Ready

```

Every step may be skipped unless required for security.

---

# Progressive Onboarding Strategy

The product deliberately avoids collecting every possible piece of information upfront.

Instead onboarding is divided into three phases.

## Phase One

Immediate setup.

Goal:

Deliver value in under five minutes.

Collect only:

* account

* first recipient

* event

* first memory

* optional birthday

Everything else remains optional.

---

## Phase Two

Relationship growth.

Triggered naturally during product usage.

Examples:

"Tell me something they recently accomplished."

"What hobby have they started?"

"What should I never mention?"

---

## Phase Three

Long term concierge learning.

Occurs over weeks and months.

Examples include:

Seasonal follow ups.

Relationship checkups.

Memory refresh prompts.

Autopilot improvement suggestions.

This progressive model prevents fatigue while continuously increasing personalization.

---

# Information Hierarchy

Every onboarding screen follows the same hierarchy.

## Level 1

Single primary message.

Large headline.

---

## Level 2

Supporting explanation.

One short paragraph.

---

## Level 3

Illustration.

Warm.

Human.

Relationship focused.

---

## Level 4

Primary action.

Large.

Highly visible.

---

## Level 5

Secondary options.

Smaller.

Less visually dominant.

---

## Level 6

Help.

Privacy.

Support.

Always available but unobtrusive.

---

# Navigation Philosophy

Users should always know:

Where they are.

Why this matters.

How much remains.

Navigation never feels like a survey.

Instead it feels like progress toward hiring their concierge.

---

# Progress Indicator

Progress is displayed across the onboarding flow.

Design:

Thin rounded progress bar.

Height:

6 px

Corner radius:

999 px

Background:

Neutral 200

Filled portion:

Brand Primary

Animated width transition:

350 ms

Below the bar:

Step label.

Example:

"Step 3 of 8"

Estimated remaining time.

Example:

"About 3 minutes left"

Progress is based on required steps only.

Optional sections never increase the required progress count.

---

# Desktop Layout Specification

Breakpoint:

1440 px and above

Maximum content width:

1320 px

Centered horizontally.

Two column layout.

```

+----------------------------------------------------------+

| Illustration | Content |

| | |

| | |

| | |

| | |

+----------------------------------------------------------+

```

---

## Left Column

Width:

46%

Contains:

Hero illustration.

Occasional animation.

Relationship themed artwork.

Inspirational quote.

Soft gradient background.

Illustration remains persistent across related steps.

Transitions use subtle fades.

---

## Right Column

Width:

54%

Contains:

Logo.

Progress indicator.

Headline.

Supporting copy.

Interactive content.

Primary actions.

Secondary actions.

Footer links.

Maximum readable width:

560 px.

Content vertically centered.

Never stretches edge to edge.

---

## Desktop Vertical Layout

Top spacing:

56 px

Logo

↓

24 px

Progress

↓

32 px

Headline

↓

16 px

Description

↓

40 px

Interactive Content

↓

32 px

Primary CTA

↓

16 px

Secondary Actions

↓

32 px

Footer

---

## Background

Entire page background:

Warm off white.

Illustration panel:

Soft gradient.

Content panel:

Solid surface.

Subtle divider shadow between columns.

---

## Illustration Behavior

Each onboarding phase has unique artwork.

Examples:

Welcome.

Family.

Friendship.

Birthday.

Handwritten card.

Celebration.

Calendar.

Mailbox.

The illustration transitions only when entering a new phase.

Not every step.

This reduces visual noise.

---

# Tablet Layout Specification

Breakpoint:

768 px through 1439 px.

Layout changes to stacked format.

Illustration moves above content.

Maximum width:

760 px.

Centered.

```

Illustration

↓

Progress

↓

Headline

↓

Description

↓

Interactive Content

↓

Buttons

```

Illustration height:

260 px.

Interactive elements remain identical to desktop.

Padding:

40 px.

---

## Tablet Scrolling

Entire page scrolls vertically.

Sticky progress bar.

Primary CTA remains visible after form completion.

Illustration collapses slightly during scroll.

---

# Mobile Layout Specification

Breakpoint:

767 px and below.

Single column layout.

Everything becomes vertically stacked.

```

Logo

↓

Progress

↓

Headline

↓

Description

↓

Illustration

↓

Interactive Content

↓

Primary Button

↓

Secondary Button

```

---

## Mobile Safe Areas

Respect:

Top safe area.

Bottom safe area.

CTA never overlaps device navigation.

---

## Mobile Padding

Horizontal:

24 px

Vertical:

24 px

Maximum form width:

100%

---

## Mobile Illustration

Height:

180 px

Always centered.

Simplified composition.

No unnecessary decorative elements.

Optimized for fast loading.

---

## Mobile Buttons

Full width.

Minimum height:

52 px.

Corner radius:

16 px.

Primary button always pinned above keyboard while typing.

---

## Mobile Progress

Compact format.

Displays:

```

Step 2 of 8

██████□□□□

```

Remaining time hidden once below two minutes.

---

# Responsive Behavior

The onboarding system is fluid between breakpoints.

## Desktop to Tablet

Illustration moves above content.

Progress remains fixed.

Maximum text width decreases gradually.

No abrupt layout jumps.

---

## Tablet to Mobile

Margins reduce.

Typography scales.

Illustration simplifies.

Buttons become full width.

Touch targets increase.

Spacing becomes slightly tighter while preserving visual rhythm.

---

## Orientation Changes

Landscape phones:

Illustration reduces height.

Content receives additional width.

Portrait remains preferred.

---

## Dynamic Height

Short screens:

Illustration shrinks.

Spacing compresses.

Buttons remain accessible.

Forms never become clipped.

---

## Very Large Displays

Displays above 1920 px.

Content remains centered.

Maximum width capped.

Illustration scales proportionally.

Excess whitespace becomes surrounding margin rather than stretching content.

---

## Layout Stability

No cumulative layout shift is permitted during onboarding.

Illustration containers reserve their full dimensions before assets load.

Progress indicators reserve width before updates.

Form validation messages expand downward without shifting unrelated controls unexpectedly.

Primary CTA positions remain stable whenever possible.

---

## Adaptive Content Density

The onboarding flow should intelligently reduce visual density on smaller devices without removing information.

Priority order for preservation:

1. Primary headline

2. Supporting explanation

3. Form controls

4. Progress indicator

5. Illustration

6. Secondary educational content

Informational callouts may collapse into expandable sections on mobile while remaining fully expanded on desktop.

---

## Grid Specifications

### Desktop

Grid:

12 columns

Gutter:

32 px

Outer margin:

64 px

Content aligns consistently with the global application grid established in previous build specifications.

### Tablet

Grid:

8 columns

Gutter:

24 px

Outer margin:

40 px

### Mobile

Grid:

4 columns

Gutter:

16 px

Outer margin:

24 px

All onboarding components snap to this grid to ensure consistency with the rest of the application.

# Complete Component Tree

The onboarding experience is composed of reusable components that already exist within the global design system. No onboarding specific component should duplicate existing UI patterns unless the interaction is unique to first time user experiences.

```

OnboardingLayout

│

├── BackgroundLayer

│

├── IllustrationPanel

│   ├── Illustration

│   ├── DecorativeShapes

│   ├── QuoteCard (optional)

│   └── AnimationLayer

│

├── ContentPanel

│   ├── Logo

│   ├── ProgressSection

│   │   ├── ProgressBar

│   │   ├── StepCounter

│   │   └── TimeRemaining

│   │

│   ├── ScreenHeader

│   │   ├── Headline

│   │   ├── Description

│   │   └── Optional Badge

│   │

│   ├── ScreenContent

│   │

│   ├── ContextHelp

│   │

│   ├── PrimaryActions

│   │

│   ├── SecondaryActions

│   │

│   └── Footer

│

├── ToastLayer

│

├── ModalLayer

│

└── AccessibilityLayer

```

Each onboarding screen extends this base layout.

No screen should invent a new structure.

---

# Welcome Experience

## Purpose

The Welcome experience transitions users from account creation into the Relationship Concierge.

This is not a dashboard.

It is not a tutorial.

It is the moment the product makes its first emotional promise.

The experience should feel like arriving at a luxury hotel where the concierge already knows why you came.

---

# Objectives

The Welcome screen should accomplish five goals.

First, congratulate the user.

Second, reduce anxiety.

Third, explain the concierge concept.

Fourth, establish trust.

Fifth, guide users directly into creating their first relationship.

Nothing else should compete for attention.

---

# Emotional Tone

Warm.

Optimistic.

Calm.

Encouraging.

Professional.

Never overly playful.

Never sarcastic.

Never sales focused.

---

# Headline

Example:

> Welcome to your Relationship Concierge.

Alternative:

> Let's make remembering people effortless.

The headline should always focus on outcomes.

Never on features.

---

# Supporting Copy

Maximum width:

520 px.

Maximum three lines.

Example:

> I'll quietly help you remember the people who matter, write thoughtful cards, and keep relationships strong without adding work to your day.

---

# Welcome Illustration

Illustration should represent connection.

Examples include:

A family celebrating.

Friends sharing coffee.

A handwritten card arriving in a mailbox.

A parent hugging a child.

A grandparent opening a letter.

Never show computers.

Never show AI.

Never show dashboards.

The focus is always people.

---

# Primary CTA

Text:

"Let's Get Started"

Primary button.

Large.

Filled.

Brand color.

Minimum width:

220 px.

---

# Secondary CTA

Text:

"Learn How It Works"

Opens lightweight modal.

Never leaves onboarding.

Never opens documentation.

---

# Learn How It Works Modal

Maximum width:

640 px.

Contains three illustrated cards.

## Card One

Remember.

"We remember important moments."

---

## Card Two

Write.

"We create thoughtful cards based on your relationship."

---

## Card Three

Deliver.

"We mail handwritten cards automatically when you want."

CTA:

"Continue"

---

# Footer Copy

Small privacy statement.

Example:

"Your information is private and only used to personalize your Relationship Concierge."

Includes Privacy Policy link.

Includes Terms link.

---

# Welcome Animation

Illustration fades in.

Logo slightly rises.

Headline fades.

Progress bar advances.

Primary button appears last.

Entire sequence:

Approximately 700 ms.

Should feel smooth rather than theatrical.

---

# Account Creation Flow

## Philosophy

Registration should feel effortless.

The user is beginning a relationship with the concierge.

Every unnecessary field creates friction.

The account creation flow should collect only information required to create and secure an account.

Nothing more.

---

# Flow Order

Landing

↓

Create Account

↓

Verify Email

↓

Welcome

---

# Registration Options

Users may create accounts using:

Email

Google

Apple

Microsoft

The interface should present all options equally.

No provider should appear preferred.

---

# Layout

Social sign in buttons appear first.

Divider.

"or"

Email form.

Primary CTA.

Login link.

Privacy text.

---

# Social Buttons

Full width.

56 px height.

Rounded corners.

Left aligned provider icon.

Centered text.

Examples:

Continue with Google

Continue with Apple

Continue with Microsoft

---

# Divider

Centered.

Horizontal rules.

Label:

or

Low emphasis typography.

---

# Email Registration Form

Fields:

First Name

Last Name

Email Address

Password

Confirm Password

No additional profile fields.

---

# Field Specifications

Width:

100%

Spacing:

20 px

Labels remain above fields.

Placeholders are supportive only.

Never replace labels.

---

# Password Requirements

Displayed below password field.

Live updating checklist.

Minimum length.

Uppercase letter.

Lowercase letter.

Number.

Special character.

Each requirement animates into a success state individually.

---

# Password Strength Meter

Three states.

Weak.

Good.

Strong.

Meter updates live.

No red warning unless password fails minimum requirements.

---

# Confirm Password

Validation occurs after typing.

Green check appears when matched.

Inline error appears immediately after mismatch.

No modal dialogs.

---

# Consent

Required checkbox.

Text:

"I agree to the Terms and Privacy Policy."

Links open new tabs.

Checkbox required before enabling Continue.

---

# Marketing Consent

Optional.

Unchecked by default.

Example:

"Occasionally send product updates."

Not required.

---

# Primary CTA

Text:

Create My Concierge

Disabled until required fields validate.

---

# Existing Account

Bottom link.

Already have an account?

Sign In

Uses subtle typography.

---

# Authentication Screens

Authentication screens share identical layouts.

Only content changes.

Screens include:

Sign In

Forgot Password

Reset Password

Magic Link Confirmation

Verification Pending

---

# Sign In Screen

Fields:

Email

Password

Remember Me

Forgot Password

Primary button.

Social sign in.

---

# Forgot Password

Single email field.

Supporting explanation.

Primary CTA:

Send Reset Link

Confirmation screen replaces form after submission.

---

# Reset Password

New password.

Confirm password.

Strength indicator.

Success screen after completion.

Automatically signs user in.

---

# Magic Link Flow

If enabled:

Email entered.

Magic link sent.

Waiting screen displayed.

Auto refresh detects successful authentication.

Fallback:

Resend after 30 seconds.

---

# Session Handling

Authentication should preserve onboarding progress.

Users returning later resume exactly where they left off.

No completed onboarding step should ever repeat unless explicitly restarted.

---

# Social Sign In

## Purpose

Social authentication removes unnecessary friction while maintaining user trust.

The experience must feel secure and familiar.

Users should never wonder what information is being shared.

---

# Supported Providers

Google

Apple

Microsoft

Future providers should fit within the existing button layout without requiring redesign.

---

# Permissions Messaging

Immediately after successful social authentication, display a concise explanation.

Example:

> We only use your email address to create your account. Additional permissions will always be requested separately.

This message appears once and is never repeated.

---

# Name Import

If the provider supplies a first and last name, automatically populate the user's profile.

Allow editing later in Settings.

Do not interrupt onboarding to confirm.

---

# Profile Photo

If available from the authentication provider:

Import silently.

Use as avatar.

Allow replacement later.

Never require a profile photo.

---

# Failure Handling

If social authentication fails:

Remain on the same screen.

Display inline message.

Example:

"We couldn't complete sign in. Please try again."

Never expose technical error codes.

Retry remains available immediately.

---

# Duplicate Account Detection

If the email already exists under another authentication provider:

Offer sign in using the existing provider.

Explain the situation clearly.

Never create duplicate accounts automatically.

Example:

> An account already exists using Google. Please continue with Google or reset your password if you originally signed up with email.

No user should accidentally create multiple concierge accounts for the same identity.

# Email Verification

## Purpose

Email verification establishes trust, protects user accounts, and ensures important relationship reminders and delivery notifications can reach the user.

Verification should never feel like an obstacle.

Instead, it should feel like the concierge making sure it knows the correct address before beginning work.

---

# Verification Philosophy

The user has already committed.

The interface should assume success.

Never create anxiety by implying something is wrong.

Instead of:

"Verify your email before continuing."

Use messaging like:

> Before we begin, let's confirm where we'll send important updates about your relationships and cards.

---

# Verification Screen Layout

```

Progress

↓

Headline

↓

Supporting Copy

↓

Illustration

↓

Verified Email Address

↓

Primary CTA

↓

Resend Link

↓

Change Email

```

---

# Headline

Examples:

"One quick confirmation."

or

"Let's verify your email."

Maximum:

Two lines.

---

# Supporting Copy

Example:

> We just sent a verification link to your inbox. Click it, then return here. We'll automatically continue once you're verified.

---

# Email Card

Centered card displaying:

Email icon

Verified email address

Edit button

Example:

```

📧

[james@example.com](mailto:james@example.com)

Change Email

```

---

# Automatic Detection

The verification screen should continuously check verification status.

Polling interval:

Every 5 seconds.

Maximum polling duration:

10 minutes.

After verification:

Automatically advance to the Welcome experience.

No additional button press required.

---

# Primary CTA

Text:

"I've Verified My Email"

Immediately checks verification status.

If verified:

Continue.

If not:

Display friendly reminder.

---

# Resend Email

Initially disabled.

Countdown:

30

29

28

...

After countdown:

Button activates.

Maximum resend attempts:

Five.

After five attempts:

Display support option.

---

# Change Email

Returns user to previous email form.

Retains all onboarding progress.

Requires new verification.

---

# Failed Delivery

If email bounces:

Display inline notification.

Example:

> We couldn't deliver the verification email. Double check the address or try another one.

Offer:

Edit Email

Resend

---

# Expired Verification Link

If link expires:

Return to verification screen.

Automatically generate a new verification email.

Display:

>Your previous link expired. We've already sent a fresh one.

No user action required.

---

# Initial Concierge Introduction

## Purpose

This is the first true interaction with the Relationship Concierge.

It establishes personality.

It explains the product philosophy.

It creates emotional trust before requesting any relationship information.

This screen is one of the most important moments in the entire application.

---

# Philosophy

The concierge is not a chatbot.

It is not an assistant waiting for commands.

It is a thoughtful service working quietly in the background.

The language should feel calm, intelligent, and reassuring.

---

# Layout

```

Illustration

↓

Headline

↓

Concierge Introduction

↓

Three Core Promises

↓

Primary CTA

```

---

# Concierge Illustration

Show a warm scene involving meaningful relationships.

Possible examples:

A handwritten card being placed into a mailbox.

Parents celebrating.

Grandparents opening a card.

Friends laughing together.

A birthday dinner.

The concierge itself should never appear as a robot.

No AI imagery.

No digital assistant visuals.

---

# Headline

Examples:

"Hi, I'm your Relationship Concierge."

or

"I'm here so the important people in your life never feel forgotten."

---

# Introduction Copy

Example:

> I'll quietly learn about the people who matter most to you, remember important moments, help you write thoughtful cards, and make staying connected feel effortless.

Maximum:

Four lines.

---

# Three Core Promises

Displayed as three cards.

---

## Promise One

### Title

I'll Remember

### Description

Birthdays, anniversaries, milestones, and meaningful moments.

---

## Promise Two

### Title

I'll Personalize

### Description

The more I learn, the more thoughtful every card becomes.

---

## Promise Three

### Title

I'll Handle the Details

### Description

From reminders to handwritten delivery, you stay in control while I do the work.

---

# Trust Callout

Small highlighted card.

Example:

🔒

Your information stays private.

It is never shared or sold.

It is only used to personalize your relationships.

---

# Primary CTA

Text:

"Let's Add Someone Important"

This wording intentionally focuses on people rather than setup.

---

# Relationship First Onboarding

## Philosophy

The very first meaningful action inside F.I. Forgot is adding a person.

Not configuring notifications.

Not importing calendars.

Not selecting preferences.

Relationships come first.

Every subsequent feature becomes easier to understand because it revolves around a real person.

---

# Screen Goal

Help users successfully create their very first relationship in less than two minutes.

---

# Headline

"Who would you never want to forget?"

Alternative:

"Let's start with someone who matters."

---

# Supporting Copy

Example:

> We'll use this person to demonstrate how your Relationship Concierge works.

---

# Recipient Creation Card

Single elevated card.

Contains:

Avatar placeholder

Relationship form

Preview summary

---

# Fields

First Name

Last Name

Relationship Type

Nickname (optional)

Birthday (optional)

Anniversary (conditional)

---

# Relationship Type

Presented as visual chips.

Examples:

Spouse

Partner

Child

Parent

Grandparent

Sibling

Friend

Coworker

Client

Mentor

Other

Relationship chips wrap naturally on smaller screens.

---

# Relationship Selection Behavior

Selecting a relationship immediately personalizes later onboarding.

Example:

Spouse

↓

Anniversary question appears.

Child

↓

Favorite activities appear later.

Client

↓

Business onboarding path later becomes available.

This personalization begins immediately.

---

# Avatar Placeholder

Circular.

96 px.

Shows initials.

Optional upload icon.

Upload remains optional.

Users never need to provide a photo during onboarding.

---

# Birthday Input

Date picker.

Optional.

Supporting text:

"If you don't know it right now, you can add it later."

No warning if skipped.

---

# Anniversary Logic

Visible only when applicable.

Displayed after relationship type selection.

Example relationships:

Spouse

Partner

Fiancé

Fiancée

Marriage anniversary is never requested for unrelated relationship types.

---

# Live Summary Card

Updates as user types.

Example:

```

Sarah

Your Sister

Birthday:

March 4

We'll begin learning more about Sarah over time.

```

This reinforces progress without adding complexity.

---

# Primary CTA

Text:

"Continue"

Enabled after:

First Name

Relationship Type

No other fields required.

---

# Empty State Guidance

If the user hesitates for more than 20 seconds:

Display helpful suggestion.

Example:

> Most people start with the person they write to most often.

No modal.

No interruption.

---

# Progressive Disclosure

Advanced fields remain hidden.

Examples:

Address

Gift preferences

Favorite restaurants

Interests

Family members

These belong to future relationship growth, not onboarding.

---

# Autosave

Every completed field saves immediately.

If the browser closes unexpectedly:

Resume exactly where the user left off.

No information should be lost.

---

# Relationship Creation Animation

Upon pressing Continue:

The avatar card gently elevates.

A handwritten style checkmark appears.

Progress advances.

Transition lasts approximately 500 ms.

The animation should communicate:

"Your concierge now knows someone important."

# First Recipient Creation

## Purpose

This stage transforms a simple contact into the beginning of a living relationship profile.

The goal is not to complete an exhaustive profile.

The goal is to give the concierge enough context to immediately demonstrate value.

Users should leave this step thinking:

> "That's all it needed to get started?"

---

# Philosophy

The product intentionally avoids asking dozens of questions.

Instead, it collects one meaningful relationship and a handful of high value details.

Everything else is learned gradually over time.

Every question must feel earned.

---

# Transition From Previous Screen

After pressing **Continue** on the relationship creation screen:

Progress advances.

The recipient card expands.

Additional profile questions fade into view.

This animation should feel like opening a relationship folder rather than navigating to a completely different page.

Duration:

450 ms

---

# Screen Layout

```

Progress

↓

Headline

↓

Recipient Summary Card

↓

Relationship Questions

↓

Why We're Asking

↓

Continue

```

---

# Recipient Summary Card

Displayed at the top.

Contains:

Avatar

Name

Relationship Type

Known Events

Completion Indicator

Example:

```

Sarah

Sister

Birthday: March 4

Profile Started

```

This remains visible while answering questions.

---

# Headline

Examples:

"Let's get to know Sarah."

or

"A few details go a long way."

---

# Supporting Copy

Example:

> Every answer helps your Relationship Concierge write more thoughtful cards. If you don't know something today, you can always add it later.

---

# Question Strategy

Questions appear one at a time.

Never present a long questionnaire.

Users remain focused.

Each answer smoothly transitions into the next.

---

# Question Card Layout

Each question consists of:

Question

Supporting explanation

Input

Skip option

Progress indicator

---

Example:

```

Question

Why this helps

Input

Skip for now

```

---

# Question Types

Supported controls include:

Single line text

Paragraph

Choice chips

Date picker

Yes or No

Tag selector

Emoji selector where appropriate

No dropdowns unless absolutely necessary.

---

# Why This Helps

Every question includes a small explanation.

Example:

Question:

"What does Sarah enjoy doing?"

Explanation:

> Knowing hobbies helps me write cards that feel personal instead of generic.

This explanation appears beneath every onboarding question.

---

# Initial Profile Questions

The first onboarding session should collect only high value information.

Recommended order:

Favorite hobby

Favorite memory together

Anything to avoid mentioning

Preferred tone

Current life update

Every question remains optional.

---

# Question 1

## Favorite Hobby

Headline:

"What does Sarah enjoy?"

Examples displayed beneath field:

Gardening

Cooking

Travel

Dogs

Photography

Music

Reading

Sports

Users may type freely.

Autocomplete suggests common interests.

---

# Question 2

## Favorite Memory

Prompt:

"What's one memory you'll probably never forget?"

Large multiline input.

Example placeholder:

> The family camping trip where everyone laughed until midnight.

Maximum length:

800 characters.

Character counter hidden until:

600 characters.

---

# Question 3

## Topics To Avoid

Prompt:

"Anything I should avoid mentioning?"

Examples:

Recent loss

Sensitive health topic

Old relationship

Politics

Family conflict

Completely optional.

---

# Question 4

## Preferred Card Tone

Visual selection cards.

Options:

Warm

Funny

Heartfelt

Simple

Inspirational

Users may choose multiple.

---

# Question 5

## Recent Update

Prompt:

"What's something happening in Sarah's life right now?"

Examples:

Started college

Bought a house

Had a baby

Training for a marathon

New job

Moved recently

Entirely optional.

---

# Skip Logic

Every question includes:

Skip for now

Skipped questions appear later during progressive profiling.

Nothing is permanently skipped.

---

# Progress Within Questions

Display:

```

2 of 5

```

Small dots below.

Each answered question fills one dot.

Skipped questions count as complete for onboarding purposes.

---

# Saving Behavior

Answers save after every interaction.

No Save button exists.

Users never worry about losing progress.

---

# AI Trust Building

## Purpose

Before asking users to trust AI generated cards, the onboarding flow must explain exactly how personalization works.

Trust is built through transparency rather than marketing.

---

# Philosophy

The application should never claim magical intelligence.

Instead it explains:

The concierge remembers.

The concierge learns.

The concierge writes using information the user provides.

The user always remains in control.

---

# Placement

Immediately after the first relationship questions.

Before first card generation.

---

# Screen Layout

```

Illustration

↓

Headline

↓

Three Explanation Cards

↓

Privacy Card

↓

Continue

```

---

# Headline

"Here's how personalization works."

---

# Supporting Copy

Example:

> Great cards come from knowing people. Every detail you share helps me write something that sounds more like you.

---

# Explanation Card One

## Learn

Title:

"I Learn"

Description:

Every memory, update, and milestone helps future cards become more personal.

Illustration:

Notebook.

---

# Explanation Card Two

## Draft

Title:

"I Draft"

Description:

I create thoughtful card drafts using everything I've learned about your relationship.

Illustration:

Handwritten note.

---

# Explanation Card Three

## You Decide

Title:

"You're Always In Control"

Description:

Edit every word, regenerate drafts, or write your own from scratch.

Illustration:

Person reviewing a card.

---

# Privacy Card

Highlighted card.

Contains shield icon.

Headline:

"Your memories stay yours."

Body:

Information is only used to personalize your Relationship Concierge.

Never sold.

Never shared.

Never used to train public AI models.

---

# Transparency Section

Expandable disclosure.

Title:

"How AI Uses Your Information"

Explains:

Only relationship information is used.

Cards are generated privately.

Nothing is posted publicly.

Data remains associated with the user's account.

Written in plain language.

---

# Primary CTA

Text:

"Show Me My First Card"

This creates anticipation for the next experience.

---

# Profile Questions Philosophy

## Purpose

The onboarding profile questions establish the long term quality of relationship personalization while respecting the user's time.

These questions are intentionally incomplete.

The concierge expects to keep learning for years.

---

# Core Principles

Questions should feel conversational.

Every answer improves future experiences.

Nothing feels mandatory.

Users never feel judged for skipping.

---

# Visual Design

Each question occupies its own card.

Generous whitespace.

Friendly illustration when appropriate.

Maximum content width:

640 px.

---

# Question Progress

Top indicator:

```

Building Sarah's Profile

██████░░░░

3 Questions Remaining

```

Remaining count decreases after both answers and skips.

---

# Navigation

Users may:

Continue

Skip

Go Back

Exit onboarding

Autosave ensures no progress is lost.

---

# Exit Behavior

If onboarding is exited before completion:

Resume from the exact unanswered question upon return.

Previously completed questions never reappear unless edited manually.

---

# Encouragement Messages

After each completed answer, display subtle reinforcement.

Examples:

"Perfect."

"That's really helpful."

"Great, future cards just became more personal."

Messages fade automatically after approximately 1.5 seconds.

They should feel encouraging, not gamified.

# Progressive Profiling

## Purpose

Progressive profiling is one of the foundational philosophies of F.I. Forgot.

The concierge should become smarter through an ongoing relationship with the user.

It should never attempt to collect everything on day one.

Instead of asking fifty questions immediately, the concierge asks a few important questions today, then naturally continues learning over months and years.

This creates:

* Less onboarding fatigue

* Better quality answers

* Higher completion rates

* Stronger personalization

* A more human experience

---

# Philosophy

The concierge should behave like a thoughtful person.

When you meet someone for the first time, you do not immediately ask everything about them.

You learn naturally over time.

The onboarding experience should follow the same principle.

---

# Learning Timeline

Relationship information is collected across three phases.

## Phase One

During onboarding.

Collect only foundational information.

Examples:

* Relationship

* Birthday

* One memory

* One hobby

* Preferred tone

* Current life update

Estimated completion:

Under five minutes.

---

## Phase Two

First month.

The concierge periodically asks one additional question.

Never more than one question in a single interaction.

Questions appear:

* After card creation

* On recipient pages

* During dashboard visits

* After successful deliveries

Examples:

"What was the last thing they were excited about?"

"What's something they've been working toward?"

"What always makes them laugh?"

---

## Phase Three

Long term.

Questions become contextual.

Examples:

"I noticed Sarah's birthday is coming up in six weeks."

"Has anything changed since last year?"

"What should I mention this time?"

Questions always have context.

Never random.

---

# Progressive Question Queue

Each relationship maintains its own question queue.

Questions have:

Priority

Category

Frequency

Last asked date

Confidence score

Completion status

The backend scheduling engine determines which question appears next.

The frontend simply displays the next recommended prompt.

---

# Question Categories

Examples include:

Personality

Communication Style

Family

Career

Education

Pets

Travel

Favorite Foods

Favorite Restaurants

Favorite Movies

Sports

Music

Books

Recent Achievements

Recent Challenges

Dreams

Goals

Traditions

Holiday Preferences

Gift Preferences

Shared Memories

Future Plans

Topics To Avoid

Relationship Dynamics

Writing Preferences

Every category already maps to existing AI personalization systems.

No new business logic should be introduced.

---

# Smart Question Ordering

Questions should adapt based on the relationship type.

Examples:

Spouse

Earlier questions include:

Anniversary traditions

Love language

Favorite date nights

Children

Favorite weekend activities

School

Current interests

Recent accomplishments

Parents

Retirement

Travel

Grandchildren

Health considerations

Friends

Shared memories

Trips

Inside jokes

Coworkers

Career

Projects

Professional milestones

Clients

Company updates

Business wins

Industry news

Every onboarding experience should feel tailored.

---

# Intelligent Question Suppression

The concierge should never ask questions whose answers are already known.

Example:

If birthday was imported from a calendar:

Never ask for birthday.

If anniversary was imported:

Never request it again.

If interests already exist:

Avoid repeating those questions.

Duplicate information damages trust.

---

# Adaptive Confidence

Every profile field maintains a confidence level.

Confidence increases through:

Repeated confirmation

Recent updates

Multiple supporting memories

Confidence decreases over time.

For example:

Favorite hobby updated five years ago.

Confidence gradually lowers.

Eventually the concierge asks:

"Is Sarah still into photography?"

This makes the concierge feel alive.

---

# Initial Relationship Health

## Purpose

Relationship Health introduces the product's long term value.

It should never feel judgmental.

It is guidance.

Not a scorecard.

---

# Philosophy

The initial Relationship Health score is intentionally conservative.

The concierge simply does not know enough yet.

Users should understand:

"This isn't grading my relationship."

Instead:

"This will improve as my concierge learns."

---

# First Health Screen

Displayed immediately after initial onboarding questions.

Layout:

```

Illustration

↓

Relationship Summary

↓

Relationship Health Preview

↓

Explanation

↓

Continue

```

---

# Headline

"Your relationship profile has begun."

Alternative:

"We're off to a great start."

---

# Relationship Summary Card

Displays:

Avatar

Name

Relationship

Known Events

Profile Completion

Example:

```

Sarah

Sister

Birthday Saved

3 Memories

2 Interests

Profile Started

```

---

# Initial Health Display

Instead of a large percentage score, onboarding introduces the concept gently.

Display:

```

Relationship Profile

28% Complete

```

Not:

```

Relationship Health

28%

```

Completion feels encouraging.

Health will be introduced later.

---

# Why This Matters

Supporting copy:

> Every conversation, memory, and update helps your concierge understand this relationship better over time.

---

# Visual Indicator

Circular progress visualization.

Warm gradient.

Soft animation.

No red.

No warning colors.

---

# Future Preview

Below the progress indicator:

"As your relationship profile grows, your card drafts become more thoughtful and personal."

---

# Educational Cards

Three compact cards explain future improvements.

### Learn More

The concierge remembers new moments.

### Better Cards

More context creates better writing.

### Stronger Relationships

Thoughtfulness becomes easier.

---

# CTA

Text:

"Let's Create Your First Card"

---

# First Card Creation

## Purpose

The user's first generated card is the emotional payoff of onboarding.

Everything before this point builds anticipation.

This screen must exceed expectations.

Users should immediately understand why they signed up.

---

# Philosophy

Do not overwhelm users with dozens of editing tools.

The goal is delight.

Advanced editing comes later.

The first experience should be:

Simple.

Fast.

Beautiful.

Personal.

---

# Screen Flow

```

Occasion

↓

Recipient

↓

Writing Style

↓

Generate

↓

Preview

↓

Celebrate

```

---

# Occasion Selection

If a birthday exists:

Birthday is preselected.

Otherwise:

Suggested occasions:

Birthday

Thank You

Thinking of You

Congratulations

Just Because

Holiday

Users may change the occasion.

---

# Writing Style

Simple segmented control.

Options:

Heartfelt

Warm

Funny

Short

Inspirational

Default comes from preferred tone if available.

---

# Generation Screen

Once Generate is pressed:

Transition to loading experience.

Display personalized loading messages.

Examples:

"Looking through everything I know about Sarah..."

"Finding the perfect tone..."

"Writing something thoughtful..."

"Almost ready..."

Generation typically completes within a few seconds.

---

# Draft Reveal

The completed draft appears inside a premium paper card.

Animation:

Paper slides upward.

Handwriting slowly appears.

Soft shadow.

No typewriter effect.

The reveal should feel like opening an envelope.

---

# Draft Layout

Top:

Recipient

Occasion

Middle:

Card message

Bottom:

Signature

Edit button

Regenerate button

Continue button

---

# Personalization Highlights

Small indicators explain why parts of the draft were included.

Example:

💡 Mentioned gardening because you said Sarah loves spending weekends outside.

These explanations increase trust.

Users may hide them.

---

# Editing

Editing remains intentionally lightweight during onboarding.

Supported actions:

Edit text

Regenerate

Change tone

Undo

Redo

No advanced formatting.

No template browser.

No image picker.

Those features belong to the full card creation experience.

---

# Regeneration

Selecting Regenerate preserves:

Recipient

Occasion

Relationship information

Tone

Only the message changes.

Display subtle transition.

Maximum three regenerations during onboarding before encouraging users to edit.

---

# Empty Draft Protection

If generation fails:

Retain all inputs.

Display:

"We couldn't generate your card just yet."

Buttons:

Try Again

Edit Details

No information is lost.

---

# Success Moment

When the first card is successfully generated:

Confetti should **not** be used.

Instead:

Soft glow.

Paper settles.

Checkmark animation.

Headline:

"Your first thoughtful card is ready."

The emphasis remains on the relationship rather than celebration of the software.

# First Autopilot Setup

## Purpose

Autopilot is the defining feature of F.I. Forgot.

This onboarding step introduces the concept without overwhelming users with configuration.

The objective is simple:

Help users understand that their concierge can quietly handle future thoughtfulness while they remain in complete control.

Users should leave this screen thinking:

> "This is exactly why I signed up."

---

# Philosophy

Autopilot should never feel like giving up control.

It should feel like delegating routine work to someone you trust.

The messaging should emphasize:

You remain in charge.

Nothing is sent without following your preferences.

Everything can be reviewed, edited, paused, or changed later.

---

# Screen Layout

```

Progress

↓

Headline

↓

Illustration

↓

Autopilot Explanation

↓

Three Benefits

↓

Autopilot Preferences

↓

Primary CTA

```

---

# Headline

Examples:

"Let me handle the remembering."

or

"Your concierge can take it from here."

---

# Supporting Copy

Example:

> Once Autopilot is enabled, I'll quietly watch for important moments, prepare thoughtful cards, and follow the rules you set.

Maximum width:

560 px.

---

# Illustration

Illustration should communicate peace of mind.

Examples:

A calendar quietly turning pages.

A handwritten envelope appearing before a birthday.

A family celebrating while reminders happen in the background.

A mailbox with outgoing cards.

Avoid:

Robots

Artificial intelligence imagery

Automation diagrams

Technical illustrations

---

# Benefits Section

Display three horizontally aligned cards on desktop.

Stack vertically on mobile.

---

## Benefit One

### Icon

Calendar

### Title

Never Miss Important Dates

### Description

Birthdays, anniversaries, holidays, milestones, and custom events.

---

## Benefit Two

### Icon

Handwritten Card

### Title

Thoughtful Every Time

### Description

Cards become more personal as your concierge learns about each relationship.

---

## Benefit Three

### Icon

Shield

### Title

You're Always In Control

### Description

Review, edit, pause, or disable Autopilot whenever you want.

---

# Initial Autopilot Preferences

The onboarding experience intentionally exposes only a few high value settings.

Advanced options belong inside the full Settings experience.

---

## Setting One

### Enable Autopilot

Large toggle.

Default:

Enabled.

Supporting copy:

> Your concierge prepares cards automatically based on your preferences.

---

## Setting Two

### Review Before Sending

Segmented control.

Options:

Always Review

Only For New Relationships

Send Automatically

Default:

Always Review

This default reinforces trust.

---

## Setting Three

### Reminder Timing

Visual chips.

Options:

30 Days

21 Days

14 Days

7 Days

Default:

21 Days

---

## Setting Four

### Delivery Preference

Options:

Handwritten Card

Digital Reminder

Ask Me Each Time

Default:

Handwritten Card

If handwritten delivery requires subscription, clearly indicate that full delivery is unlocked after subscription selection later in onboarding.

---

# Educational Callout

Small highlighted panel.

Example:

> Don't worry. You can change every Autopilot setting later.

This reduces hesitation.

---

# Live Preview

Right side on desktop.

Below preferences on mobile.

Shows:

```

Sarah's Birthday

March 4

✓ Reminder

✓ Draft Prepared

✓ Review Requested

✓ Handwritten Card Scheduled

```

Updates immediately as preferences change.

This preview makes Autopilot feel tangible.

---

# Primary CTA

Text:

"Continue"

---

# Secondary Action

Text:

"Configure Later"

Selecting this still enables default safe settings unless the user explicitly disables Autopilot.

---

# Subscription Presentation

## Purpose

Subscription should feel like unlocking the full Relationship Concierge.

It should never interrupt momentum.

It should never feel like a paywall.

Users should already understand the product's value before pricing appears.

---

# Philosophy

By the time subscription is shown, the user has:

Created an account.

Added someone important.

Seen personalization.

Generated a thoughtful card.

Configured Autopilot.

Now pricing becomes the logical next step.

---

# Layout

```

Headline

↓

Value Summary

↓

Pricing Cards

↓

Feature Comparison

↓

FAQ

↓

Primary CTA

↓

Skip Option (if applicable)

```

---

# Headline

Examples:

"Keep your concierge working for you."

or

"Unlock your full Relationship Concierge."

---

# Supporting Copy

Example:

> Everything you've seen today becomes even more valuable as your concierge continues learning over time.

---

# Value Summary

Display concise recap.

Examples:

✓ Remembers important people

✓ Writes thoughtful cards

✓ Learns over time

✓ Helps strengthen relationships

✓ Saves hours every year

---

# Pricing Cards

Use existing subscription plans.

Do not introduce new pricing structures.

The UI should support:

Monthly

Annual

Future promotional plans

Annual plan should be visually emphasized.

---

# Recommended Badge

Annual plan receives:

"Best Value"

Badge.

Warm accent color.

Subtle animation on first appearance.

---

# Feature Comparison

Simple comparison table.

Rows include:

Relationship profiles

Unlimited memories

AI card writing

Autopilot

Calendar integration

Handwritten mailing support

Priority concierge improvements

Table remains readable on mobile using stacked cards.

---

# FAQ

Expandable accordion.

Recommended questions:

Can I cancel anytime?

Can I edit every card?

Who sees my memories?

What happens if I skip a birthday?

Can I pause Autopilot?

Accordion state persists while on the page.

---

# Trust Signals

Below pricing.

Display:

Private and secure

No long term contracts

Cancel anytime

Encrypted information

Excellent customer support

No exaggerated marketing claims.

---

# CTA

Primary:

"Start My Concierge"

Secondary:

"Continue With Free Experience"

Only display the free option if supported by business logic.

---

# Subscription Success

After successful subscription:

Soft success animation.

Headline:

"You're all set."

Supporting copy:

>Your concierge is ready to begin taking care of the people who matter most.

---

# Success Screens

## Purpose

The final onboarding screen marks the transition from setup to daily product usage.

Users should feel accomplished.

Not finished.

The relationship with the concierge has just begun.

---

# Philosophy

Celebrate progress.

Do not imply perfection.

The concierge still has much to learn.

---

# Layout

```

Illustration

↓

Headline

↓

Success Summary

↓

What's Next

↓

Primary CTA

```

---

# Illustration

Warm celebratory scene.

Examples:

Handwritten card arriving.

Family celebration.

Friends reconnecting.

Mailbox with outgoing envelope.

Avoid:

Fireworks

Large confetti

Party graphics

---

# Headline

Examples:

"Your Relationship Concierge is Ready."

or

"You're Ready to Start Building Stronger Relationships."

---

# Success Summary

Dynamic recap.

Example:

```

✓ Account Created

✓ Sarah Added

✓ Birthday Saved

✓ First Card Generated

✓ Autopilot Configured

```

Each completed item animates into view.

---

# What's Next

Explain upcoming experiences.

Example:

> Over the next few weeks, I'll occasionally ask small questions to help make every future card even more personal.

---

# Dashboard Preview

Optional illustration showing:

Upcoming birthdays.

Relationship timeline.

Autopilot status.

This preview helps orient first time users.

---

# Primary CTA

Text:

"Go To My Dashboard"

This completes onboarding.

---

# Celebration Animation

Sequence:

Illustration gently fades.

Checklist fills.

Button appears.

Soft glow around recipient avatar.

Total duration:

Approximately 900 ms.

No excessive celebration.

The emotional focus remains on relationships.

---

# First Login After Onboarding

Users should land directly on the Dashboard.

Display a temporary welcome banner.

Example:

> Welcome back. Your concierge is already keeping an eye on upcoming moments.

Banner automatically dismisses after five seconds.

Never show onboarding again unless the user explicitly restarts it from Settings.

# Empty States

## Philosophy

Empty states should never communicate absence.

They should communicate opportunity.

Every empty state should answer three questions:

* Why is this empty?

* What happens next?

* What is the easiest next action?

The emotional tone should always remain encouraging.

Never use language that implies failure.

Never make users feel behind.

---

# Global Empty State Layout

```

Illustration

↓

Headline

↓

Supporting Copy

↓

Primary CTA

↓

Secondary Help

```

Illustrations should always be relationship focused.

Never use generic boxes, folders, or empty database graphics.

---

# No Recipients

## Headline

"You haven't added anyone yet."

---

## Supporting Copy

>Your concierge becomes more helpful with every important person you add.

---

## Illustration

Person writing names into an address book.

---

## CTA

"Add Your First Person"

---

# No Memories Yet

## Headline

"No memories yet."

---

## Supporting Copy

>The little moments often become the most meaningful parts of future cards.

---

## CTA

"Add a Memory"

---

# No Upcoming Events

## Headline

"Nothing is coming up right now."

---

## Supporting Copy

>That's a great time to strengthen a relationship with a thoughtful card just because.

---

## CTA

"Send a Just Because Card"

---

# Calendar Not Connected

## Headline

"Import your important dates."

---

## Supporting Copy

>Connect your calendar to save time and avoid entering birthdays one at a time.

---

## CTA

"Connect Calendar"

---

# Contacts Not Imported

## Headline

"Know someone worth remembering?"

---

## Supporting Copy

>Import contacts to quickly build your relationship list.

---

## CTA

"Import Contacts"

---

# No Draft Generated

## Headline

"We're ready whenever you are."

---

## Supporting Copy

>Once we know a little about someone, we'll create a thoughtful draft in seconds.

---

## CTA

"Generate Card"

---

# Empty Relationship Timeline

## Headline

"This story is just beginning."

---

## Supporting Copy

>Every memory, card, and milestone will appear here over time.

---

## CTA

"Log Your First Memory"

---

# Loading States

## Philosophy

Loading should reinforce that thoughtful work is happening.

Never display generic loading indicators without context.

Whenever possible, explain what the concierge is doing.

---

# General Rules

Every loading screen should:

Reserve layout space.

Prevent layout shift.

Display progress.

Provide reassurance.

Remain visually calm.

---

# Skeleton Loaders

All cards use skeleton placeholders.

Placeholder dimensions must exactly match final content.

Rounded corners remain identical to loaded state.

Animations use subtle shimmer.

Duration:

1.5 seconds.

Infinite until complete.

---

# Recipient Loading

Display:

Avatar placeholder.

Name placeholder.

Relationship placeholder.

Event placeholder.

Memory placeholder.

Never display a blank screen.

---

# Profile Question Loading

Question container appears immediately.

Input fades after loading.

Prevent jumping content.

---

# AI Generation Loading

This is one of the most important loading experiences.

The interface should explain what the concierge is doing.

Rotate messages approximately every two seconds.

Examples:

"Reviewing everything I know about Sarah."

"Remembering your favorite memories together."

"Finding the right tone."

"Writing naturally."

"Putting the finishing touches on your card."

Messages should never exaggerate or fabricate actions beyond actual system capabilities.

---

# Progress Animation

Circular progress indicator.

Soft pulse.

No percentage displayed unless the backend provides meaningful progress.

Estimated completion:

Typically under ten seconds.

---

# Calendar Import Loading

Display imported calendar icon.

Progress indicator.

Example status messages:

Looking for birthdays.

Finding anniversaries.

Matching existing relationships.

Preparing your calendar.

---

# Contacts Import Loading

Status examples:

Reading contacts.

Removing duplicates.

Preparing suggestions.

Organizing people.

---

# Success Transition

After successful loading:

Fade content in.

Never abruptly replace the screen.

Transition duration:

250 ms.

---

# Error States

## Philosophy

Errors should feel recoverable.

Users should understand:

What happened.

What they can do next.

Whether any information was lost.

The answer to the final question should almost always be:

"No."

---

# Global Error Card

Structure:

Icon

Headline

Explanation

Recovery Action

Support Link

---

# Tone

Never technical.

Never alarming.

Never blame the user.

Use calm language.

---

# Network Error

Headline:

"We couldn't reach your concierge."

Supporting copy:

>Please check your connection and try again.

Primary button:

Try Again

Secondary:

Continue Later

---

# AI Generation Error

Headline:

"We couldn't finish writing that card."

Supporting copy:

>Your information is safe. Let's try again.

Buttons:

Generate Again

Edit Details

---

# Calendar Import Failure

Headline:

"We couldn't connect your calendar."

Supporting copy:

>You can try again now or continue without importing.

Buttons:

Retry

Skip For Now

---

# Contacts Import Failure

Headline:

"We couldn't import your contacts."

Supporting copy:

>You can still add people one at a time.

Buttons:

Retry

Add Someone Manually

---

# Email Verification Error

Headline:

"We couldn't verify your email."

Supporting copy:

>Please check your inbox or request a new verification email.

Buttons:

Resend

Change Email

---

# Validation

## Philosophy

Validation should prevent mistakes without interrupting flow.

Errors should appear immediately after interaction.

Never wait until the user submits an entire page.

---

# Validation Timing

Text fields:

After focus leaves field.

Password:

Live.

Email:

Immediately after formatting.

Date:

Immediately after selection.

Required fields:

Upon attempted continuation.

---

# Required Fields

Only truly essential fields should be required.

During onboarding these include:

First name

Last name

Email

Password

Relationship name

Relationship type

Everything else remains optional.

---

# Error Presentation

Inline.

Below the field.

Red accent.

Clear explanation.

Example:

"Please enter a valid email address."

Never use only color to indicate errors.

Always include text.

---

# Success Validation

Completed fields display:

Green checkmark.

Subtle border.

No animation beyond a gentle fade.

---

# Date Validation

Prevent impossible dates.

Prevent future birthdays.

Prevent anniversaries before birth dates when both are known.

Allow unknown year where business logic supports it.

---

# Duplicate Recipient Validation

If the user attempts to create an identical recipient:

Display suggestion.

Example:

> You already have Sarah listed. Would you like to update her profile instead?

Buttons:

View Existing

Create Anyway

---

# Editing Interactions

## Philosophy

Editing should feel forgiving.

Users should never fear making mistakes.

Everything should be reversible whenever possible.

---

# Editable Fields

All onboarding answers remain editable until completion.

Changes save automatically.

---

# Back Navigation

Selecting Back:

Returns to previous step.

Retains all entered information.

No confirmation required.

---

# Inline Editing

Completed sections display:

Edit

Selecting Edit expands the section without navigating away.

---

# Undo Support

For destructive actions:

Deleting a memory.

Removing a date.

Replacing imported information.

Provide:

Undo

Available for approximately ten seconds.

---

# Keyboard Shortcuts

Desktop only.

Enter:

Continue.

Shift plus Enter:

New paragraph.

Escape:

Close modal.

Tab:

Move forward.

Shift plus Tab:

Move backward.

All shortcuts respect accessibility standards.

# Navigation Behavior

## Philosophy

Navigation during onboarding should feel linear without feeling restrictive.

Users should always understand:

* Where they are

* Why they are there

* What happens next

* How to return if needed

Navigation should encourage completion while respecting user autonomy.

The interface should never trap users.

---

# Navigation Model

The onboarding experience uses a guided flow.

```

Previous

↓

Current Step

↓

Next Step

```

Future steps remain inaccessible until prerequisite information has been completed or intentionally skipped.

Users should never jump ahead to incomplete steps because doing so creates confusion and reduces completion rates.

---

# Primary Navigation

Each screen contains one primary CTA.

Only one button should visually dominate.

Examples:

Continue

Next

Create My Concierge

Generate My Card

Go To Dashboard

The wording should always describe the outcome of the action rather than simply saying "Next."

---

# Secondary Navigation

Secondary actions receive significantly lower visual emphasis.

Examples include:

Back

Skip For Now

Learn More

Configure Later

Import Later

These actions should never compete visually with the primary CTA.

---

# Back Navigation

Back navigation is always available unless returning would compromise security.

Selecting Back:

Returns to the previous onboarding step.

Restores scroll position.

Restores keyboard focus.

Restores every previously entered value.

No confirmation dialog should appear.

---

# Browser Back Button

The browser Back button should function naturally.

Each onboarding step should update browser history.

Behavior:

```

Step 1

↓

Step 2

↓

Step 3

```

Browser Back returns to Step 2.

Never exit onboarding unexpectedly.

---

# Browser Refresh

Refreshing the page should restore:

Current onboarding step.

Entered data.

Scroll position when appropriate.

No completed work should be lost.

---

# Exit Behavior

Users may leave onboarding at any time after account creation.

Possible exit methods:

Closing browser.

Signing out.

Switching devices.

Timeout.

Every exit should preserve progress.

---

# Resume Behavior

Upon next login:

Determine the last completed onboarding step.

Resume there automatically.

Example:

```

Completed:

Welcome

Recipient

Profile Questions

Stopped during Calendar Import

↓

Resume:

Calendar Import

```

Do not replay previously completed educational screens.

---

# Onboarding Completion Flag

Onboarding is considered complete only after:

Success screen is acknowledged.

OR

User intentionally dismisses onboarding after all required steps are completed.

This flag is stored separately from authentication.

---

# Optional Step Navigation

Optional steps always include:

Skip For Now

Skipping advances normally.

Skipped steps appear later inside the application.

Users never receive penalties for skipping optional content.

---

# Conditional Navigation

Certain relationship selections introduce additional steps.

Example:

Spouse

↓

Anniversary

↓

Continue

Friend

↓

Skip Anniversary

↓

Continue

These conditional branches should feel seamless.

---

# Deep Linking Protection

Attempting to navigate directly to later onboarding URLs without completing prerequisite steps should redirect users to the earliest incomplete step.

This prevents inconsistent onboarding state.

---

# Skip Logic

## Philosophy

Skipping is an intentional design feature.

Users should never feel forced to answer questions they are uncomfortable answering.

The concierge simply asks again later when appropriate.

---

# Eligible Skip Sections

Users may skip:

Birthday

Anniversary

Profile questions

Calendar import

Contacts import

Autopilot configuration

Subscription

Marketing preferences

Every skipped item becomes a future opportunity rather than a permanent omission.

---

# Non Skippable Steps

Only security related actions remain mandatory.

Examples:

Account creation.

Authentication.

Required consent.

Email verification when required by system configuration.

---

# Skip Presentation

Skip links appear beneath the primary CTA.

Typography:

Small.

Muted.

Readable.

Never hidden.

Example:

"Skip for now"

---

# Skip Confirmation

Most skips require no confirmation.

Exceptions:

Skipping subscription after viewing pricing.

Skipping calendar import after permissions were granted.

These situations display a lightweight confirmation sheet.

---

# Skip Recording

Every skipped step records:

User ID

Step

Timestamp

Reason if available

Analytics event

This allows future progressive onboarding without asking duplicate questions unnecessarily.

---

# Future Reintroduction

Skipped onboarding items return contextually.

Examples:

Skipped birthday.

↓

Later dashboard prompt:

"Do you happen to know Sarah's birthday now?"

Skipped contacts.

↓

Later banner:

"Import contacts to save time."

Skipped Autopilot.

↓

Settings recommendation.

No skipped item should repeatedly nag the user.

Maximum recommendation frequency is defined by the existing notification cadence.

---

# Animations

## Philosophy

Animation should communicate state changes.

Never decorate.

Every animation must reinforce understanding.

---

# Motion Principles

Animations should feel:

Warm.

Soft.

Intentional.

Premium.

Never flashy.

Never distracting.

---

# Global Timing

Fast:

150 ms

Standard:

250 ms

Complex:

400 ms

Page transitions:

450 to 600 ms

Illustration transitions:

600 ms

---

# Page Transition

Outgoing screen:

Fade to 0%.

Translate upward:

8 px.

Incoming screen:

Fade in.

Translate upward to resting position.

No sliding carousels.

No horizontal swipes.

---

# Progress Bar Animation

Width animates smoothly.

Duration:

350 ms.

Ease:

Ease out.

Progress never jumps instantly.

---

# Button Animations

Hover:

Slight elevation.

Pressed:

Scale to 98%.

Released:

Return smoothly.

Disabled:

Opacity reduction only.

No bounce.

---

# Card Expansion

Question cards.

Relationship cards.

Recipient summaries.

Expand vertically.

Opacity transition.

Maximum duration:

300 ms.

---

# Success Animations

Checkmarks draw themselves.

Soft glow.

Paper settles.

Illustrations subtly brighten.

No fireworks.

No excessive particle effects.

---

# Error Animation

Invalid field:

Gentle horizontal movement.

Maximum:

4 px.

Single cycle only.

Avoid aggressive shaking.

---

# Modal Animation

Fade.

Scale from 98% to 100%.

Background blur increases gradually.

Close animation reverses naturally.

---

# Illustration Animation

Illustrations use subtle ambient motion.

Examples:

Floating envelope.

Gentle page turn.

Soft leaf movement.

Calendar page turning.

Movement should remain almost imperceptible.

Animation loops should exceed twelve seconds to avoid repetition.

---

# Microinteractions

## Philosophy

Microinteractions make the concierge feel attentive.

They should reward progress without becoming playful or distracting.

---

# Form Completion

Completed field:

Small checkmark fades in.

Border color updates.

No sound.

---

# Progress Completion

Completing a section:

Progress bar advances.

Step label updates.

Subtle pulse.

---

# CTA Enablement

When required information becomes valid:

Button transitions smoothly from disabled to enabled.

Avoid abrupt color changes.

---

# Chip Selection

Relationship chips.

Interest chips.

Tone chips.

Selected state:

Soft scale.

Color transition.

Checkmark appears.

---

# Toggle Interaction

Autopilot toggle:

Thumb glides.

Track color transitions.

Associated preview updates immediately.

---

# Calendar Import Success

Successful import displays:

Small inline confirmation.

Example:

"12 important dates imported."

Confirmation fades after several seconds.

---

# Contact Import Success

After import:

Recipient count animates upward.

New relationship suggestions appear with staggered fade.

---

# Card Generation Reveal

Paper rises.

Shadow deepens.

Content fades in line by line.

The reveal should evoke opening a handwritten letter.

---

# Hover Behavior

Desktop only.

Cards elevate slightly.

Clickable rows reveal subtle background tint.

Interactive icons gently brighten.

No exaggerated scaling.

---

# Focus Behavior

Keyboard focus transitions smoothly.

Focus rings remain visible at all times.

Animation duration:

100 ms.

Accessibility always takes precedence over aesthetics.

# Keyboard Behavior

## Philosophy

The onboarding experience must be fully operable without a mouse.

Every screen, dialog, form, and interaction should support complete keyboard navigation.

Keyboard users should experience the same speed and confidence as pointer users.

Accessibility is never treated as an enhancement.

It is a core product requirement.

---

# Global Keyboard Rules

Every interactive element must be reachable using the Tab key.

Focus order must follow the visual layout.

Users should never become trapped inside a component unless intentionally inside a modal dialog.

Focus should always remain visible.

---

# Focus Order

Each onboarding screen should follow a predictable tab sequence.

```

Logo (if interactive)

↓

Skip Link (screen readers)

↓

Primary Heading

↓

Progress Indicator (if interactive)

↓

Form Fields

↓

Inline Help

↓

Primary Button

↓

Secondary Button

↓

Footer Links

```

Hidden components must never receive keyboard focus.

---

# Initial Focus

When a screen loads:

Focus moves to the primary heading for screen readers.

Visual keyboard focus moves to the first editable control.

This allows immediate interaction.

---

# Form Navigation

## Tab

Moves to the next field.

---

## Shift + Tab

Moves to the previous field.

---

## Enter

Behavior depends on context.

Single line inputs:

Complete field.

Move to next logical action.

Buttons:

Activate.

Checkboxes:

Toggle.

Radio buttons:

Select.

---

## Shift + Enter

Creates a new line inside multiline text areas.

Never submits a form.

---

## Escape

Closes:

Dialogs

Bottom sheets

Expanded help panels

Dropdowns

Returns focus to the triggering element.

Escape should never unexpectedly exit onboarding.

---

## Space

Activates:

Checkboxes

Switches

Buttons

Chip selections

Relationship cards

---

## Arrow Keys

Arrow keys navigate:

Radio groups

Segmented controls

Relationship chips

Date pickers

Horizontal option lists

Selection updates immediately.

---

## Home / End

Supported within:

Lists

Chip groups

Autocomplete results

Moves focus to first or last item.

---

# Date Picker Navigation

Keyboard support includes:

Arrow keys.

Month navigation.

Year navigation.

Enter selects.

Escape closes.

Tab exits the component naturally.

No custom keyboard behavior should conflict with browser expectations.

---

# Autocomplete Behavior

Suggestions appear beneath the field.

Arrow keys navigate suggestions.

Enter selects.

Escape dismisses suggestions.

Typing continues naturally after dismissal.

---

# Modal Keyboard Behavior

When a modal opens:

Focus moves to the modal heading.

Tab remains trapped within the modal.

Escape closes.

Upon close:

Focus returns to the triggering control.

---

# Button Behavior

Disabled buttons must not receive focus.

Enabled buttons activate with:

Enter

Space

No separate keyboard implementations should exist.

---

# Error Recovery

If validation fails:

Focus moves automatically to the first invalid field.

Screen readers announce the error.

The user should never have to search for the problem.

---

# Screen Reader Announcements

Screen changes announce:

Current step.

Page heading.

Progress.

Important status updates.

Examples:

"Step four of eight."

"Relationship created successfully."

"Card generated."

Announcements should use polite live regions unless immediate attention is required.

---

# Accessibility Requirements

## Philosophy

Accessibility is a product quality requirement.

The onboarding experience must be usable by people with a wide range of abilities without requiring alternative interfaces.

Compliance with WCAG 2.2 AA is the minimum requirement.

Where practical, the implementation should exceed that standard.

---

# Semantic Structure

Every onboarding screen must contain:

One H1.

Logical heading hierarchy.

Proper landmark regions.

Main content element.

Navigation landmark.

Footer landmark.

No skipped heading levels.

---

# Color Contrast

Minimum contrast ratios:

Body text:

4.5:1

Large text:

3:1

Icons conveying meaning:

3:1

Interactive controls:

Meet or exceed WCAG AA.

Color must never be the only indicator of status.

---

# Focus Indicators

Visible at all times.

Minimum thickness:

2 px.

Clearly distinguishable from component borders.

Consistent throughout onboarding.

Never removed using CSS.

---

# Touch Targets

Minimum size:

44 by 44 px.

Preferred size:

48 by 48 px.

Spacing prevents accidental activation.

---

# Screen Reader Labels

Every interactive control requires:

Accessible name.

Accessible role.

Accessible state.

Examples:

Relationship chips.

Progress bar.

Import buttons.

Autopilot toggle.

Card generation controls.

---

# Live Regions

Use polite announcements for:

Progress updates.

Successful saves.

Autosave.

Import completion.

Card generation completion.

Use assertive announcements only for:

Critical errors.

Authentication failures.

Required interruptions.

---

# Images

Illustrations are decorative.

Marked accordingly.

Images conveying instructional information require descriptive alternative text.

No redundant alt text.

---

# Forms

Every field requires:

Visible label.

Associated programmatic label.

Helpful description where needed.

Validation instructions.

Required state.

Optional state when applicable.

---

# Validation Accessibility

Errors should include:

Icon.

Text explanation.

Programmatic association.

Focus management.

ARIA live announcement.

Users should immediately understand how to correct the issue.

---

# Motion Accessibility

Respect operating system preferences.

If reduced motion is enabled:

Disable decorative animation.

Replace movement with fades.

Progress updates remain instantaneous.

No parallax.

No floating illustrations.

---

# Time Based Interactions

No onboarding step should expire unexpectedly.

Countdowns always include:

Pause where appropriate.

Extension opportunity if required.

Visible indication.

Email verification polling never blocks interaction.

---

# Voice Control Compatibility

All interactive controls require unique spoken labels.

Avoid duplicate button names on the same screen.

Example:

Prefer:

"Continue to Card"

instead of multiple buttons simply named:

"Continue"

---

# Zoom Support

Interface must remain fully functional at:

200 percent.

320 CSS pixels wide.

Without horizontal scrolling except where specifically permitted by WCAG.

---

# Analytics Events

## Philosophy

Analytics exist to improve the onboarding experience.

They should measure friction.

Not individuals.

Personally identifiable relationship content must never be transmitted as analytics metadata.

Only behavioral events are collected.

---

# Event Naming Convention

Use consistent naming:

```

onboarding_started

onboarding_step_completed

recipient_created

calendar_import_started

calendar_import_completed

contacts_import_started

contacts_import_completed

first_card_generated

autopilot_enabled

subscription_viewed

subscription_started

subscription_completed

onboarding_completed

```

Past tense is used for completed events.

Present tense is reserved for active system processes where already defined by existing analytics architecture.

---

# Required Event Properties

Every onboarding event includes:

User ID

Session ID

Step ID

Timestamp

Platform

Device Type

Viewport

Application Version

Experiment Variant if applicable

No relationship names.

No memories.

No card content.

---

# Welcome Events

Track:

Welcome viewed.

Learn More opened.

Learn More completed.

Continue selected.

---

# Recipient Events

Track:

Recipient started.

Relationship selected.

Recipient completed.

Recipient skipped.

Birthday entered.

Birthday skipped.

Anniversary entered.

Anniversary skipped.

---

# Profile Question Events

Track:

Question viewed.

Question answered.

Question skipped.

Question edited.

Average response time.

Completion rate.

---

# Calendar Import Events

Track:

Import initiated.

Permission granted.

Permission denied.

Import completed.

Import failed.

Events imported.

Duplicates detected.

---

# Contact Import Events

Track:

Import initiated.

Contacts imported.

Contacts accepted.

Contacts rejected.

Duplicates merged.

---

# Card Generation Events

Track:

Generation requested.

Generation completed.

Generation failed.

Regenerated.

Edited.

Accepted.

---

# Autopilot Events

Track:

Autopilot viewed.

Enabled.

Disabled.

Reminder timing changed.

Review preference changed.

Delivery preference changed.

---

# Subscription Events

Track:

Pricing viewed.

Plan selected.

Checkout started.

Checkout abandoned.

Checkout completed.

---

# Completion Metrics

Key onboarding metrics include:

Overall completion rate.

Median completion time.

Drop off by step.

Skip frequency.

Average profile completion.

Calendar adoption.

Contact import adoption.

Autopilot adoption.

Subscription conversion.

These metrics should feed the existing analytics infrastructure without introducing duplicate tracking systems.

# API Data Mapping

## Purpose

The onboarding frontend is purely an orchestration layer.

It does **not** contain business logic.

It collects information, validates user input, presents progress, and communicates with the existing backend APIs.

All business rules, AI pipelines, authentication, relationship logic, scheduling, subscription handling, Handwrytten integration, notification systems, and profile intelligence remain in the existing backend.

This Build Specification does not introduce new API contracts.

It maps the onboarding experience to the existing platform architecture.

---

# Frontend Responsibilities

The onboarding frontend is responsible for:

Displaying onboarding steps.

Managing local UI state.

Performing client side validation.

Showing loading and success states.

Displaying API errors.

Autosaving progress.

Restoring interrupted sessions.

Managing navigation.

Tracking analytics.

Rendering API responses.

The frontend must never calculate relationship health, AI prompts, reminder schedules, or personalization logic.

---

# Backend Responsibilities

The existing backend remains responsible for:

Authentication.

Authorization.

Session management.

Relationship creation.

Recipient updates.

Memory storage.

Calendar parsing.

Contact import.

AI personalization.

Card generation.

Autopilot configuration.

Notification scheduling.

Subscription validation.

Email verification.

Analytics ingestion.

Profile scoring.

Relationship Health calculation.

Every backend response should be treated as the source of truth.

---

# State Management

The onboarding experience maintains three layers of state.

## Local Component State

Used for:

Current input.

Focused field.

Temporary validation.

Expanded cards.

Open modals.

Animation state.

Destroyed when leaving the screen.

---

## Onboarding Session State

Persists across onboarding screens.

Stores:

Current step.

Completed steps.

Skipped steps.

Unsaved edits.

Temporary import selections.

Should survive:

Browser refresh.

Navigation.

Temporary disconnects.

---

## Persistent Backend State

Immediately synchronized after successful saves.

Examples:

Recipient profile.

Autopilot preferences.

Imported events.

Generated cards.

Profile answers.

Authentication.

This state is always authoritative.

---

# Autosave Strategy

Autosave is mandatory throughout onboarding.

Users should never press Save.

---

## Autosave Triggers

Field loses focus.

Date selected.

Chip selected.

Toggle changed.

Import completed.

Question skipped.

Card generated.

Preference changed.

---

## Autosave Debounce

Text fields:

Approximately 750 ms after typing stops.

Long text:

Approximately 1000 ms.

Immediate save:

Relationship selection.

Birthday selection.

Toggle changes.

Imports.

---

## Autosave Feedback

Small inline confirmation.

Example:

"Saved"

Appears beside the section title.

Fades after approximately two seconds.

Never interrupt typing.

---

# Data Synchronization

Every successful save immediately updates:

Frontend cache.

Session state.

Backend record.

Dashboard preview.

Relationship summary.

Health preview if applicable.

Synchronization should appear instantaneous.

---

# Conflict Resolution

If the same onboarding session is open on multiple devices:

Newest successful backend update wins.

If conflicting edits occur:

Display friendly notification.

Example:

> This information was updated from another device. We've refreshed your profile.

Users should never lose confirmed backend data silently.

---

# Authentication Mapping

Onboarding must integrate directly with the existing authentication system.

Supported flows:

Email and password.

Google.

Apple.

Microsoft.

Session restoration.

Password reset.

Email verification.

No onboarding specific authentication implementation should exist.

---

# Recipient Mapping

Recipient creation maps directly into the existing recipient model.

Supported onboarding fields:

Name.

Relationship.

Birthday.

Anniversary.

Nickname.

Profile answers.

Optional avatar.

The onboarding flow should not create duplicate recipient structures.

---

# Profile Question Mapping

Each onboarding question maps directly to the existing profile question framework.

No onboarding specific question storage exists.

Questions should use the same identifiers, scheduling logic, and AI consumption already implemented within the platform.

---

# Calendar Import Mapping

Calendar onboarding connects to the existing calendar integration.

Supported outcomes:

Imported birthdays.

Imported anniversaries.

Duplicate detection.

Relationship matching.

Skipped events.

Calendar permissions.

The onboarding interface only visualizes progress.

Calendar intelligence remains backend driven.

---

# Contacts Import Mapping

Contacts onboarding connects directly to the existing contacts import pipeline.

Supported actions:

Permission request.

Contact retrieval.

Duplicate detection.

Suggested relationships.

Recipient creation.

The frontend must not perform duplicate matching independently.

---

# Card Generation Mapping

The onboarding card generation experience uses the same generation pipeline as the primary Card Creation experience.

Inputs include:

Recipient.

Occasion.

Relationship profile.

Memories.

Preferred tone.

Existing personalization data.

Outputs remain identical to the production card generation engine.

No simplified onboarding AI model should exist.

---

# Autopilot Mapping

Autopilot onboarding modifies the existing Autopilot configuration.

Supported onboarding controls:

Enabled state.

Reminder timing.

Review preference.

Delivery preference.

All advanced settings remain unchanged until the user visits Settings.

---

# Subscription Mapping

Subscription onboarding integrates directly with the existing Stripe implementation.

Supported flows:

Plan selection.

Checkout.

Success.

Cancellation.

Existing subscription restoration.

No onboarding specific billing implementation should be introduced.

---

# Performance Considerations

## Philosophy

The onboarding experience should feel instantaneous.

Perceived performance is more important than raw benchmark numbers.

The interface should remain responsive even during network activity.

Every optimization should reinforce trust and quality.

---

# Performance Targets

Initial page render:

Less than 2 seconds on a typical broadband connection.

Largest Contentful Paint:

Less than 2.5 seconds.

Time to Interactive:

Less than 3 seconds.

Interaction response:

Less than 100 milliseconds.

Screen transitions:

Less than 300 milliseconds after data becomes available.

---

# Bundle Strategy

Only load onboarding assets required for the current step.

Lazy load:

Later onboarding screens.

Illustration assets.

Calendar integration.

Contacts integration.

Subscription checkout.

Dashboard preview.

The user should never download the entire onboarding experience upfront.

---

# Image Optimization

All illustrations should:

Use modern image formats.

Provide responsive image sizes.

Support high DPI displays.

Reserve layout dimensions before loading.

Decorative illustrations below the fold should be lazy loaded.

---

# Font Loading

Use the global typography strategy.

Prevent layout shift during font loading.

Fallback fonts should closely match final metrics.

---

# API Requests

Requests should execute asynchronously.

UI should remain interactive whenever possible.

Multiple independent requests should run concurrently rather than sequentially.

Examples:

Analytics.

Autosave.

Progress updates.

Illustration preloading.

---

# Prefetching

While the user is completing the current step, begin preloading:

Next illustration.

Next screen.

Next component bundle.

Next API metadata if required.

Navigation should appear immediate.

---

# Optimistic UI

Safe operations may update immediately.

Examples:

Question completion.

Progress indicator.

Toggle selection.

Autosave indicator.

Operations affecting external systems should wait for backend confirmation.

Examples:

Subscription.

Calendar import.

Contact import.

Email verification.

---

# Offline Behavior

If connectivity is temporarily lost:

Continue accepting input locally.

Queue autosave operations.

Display:

"Working offline. We'll save everything once you're connected."

Automatically synchronize when the connection returns.

---

# Memory Usage

Illustrations from completed onboarding phases should be released when no longer needed.

Avoid retaining unnecessary image assets.

Long onboarding sessions should not progressively consume excessive memory.

---

# Accessibility Performance

Reduced motion mode should eliminate unnecessary animation calculations.

Skeleton loaders should avoid excessive repainting.

Animations should remain GPU accelerated where practical.

---

# Acceptance Criteria

## Functional Acceptance

The onboarding experience is considered complete only if:

Users can create an account using every supported authentication method.

Users can resume onboarding after interruption.

Users can complete onboarding entirely with a keyboard.

Users can skip every optional step.

Users can return and edit previously entered information.

Autosave works throughout onboarding.

Calendar import functions correctly.

Contacts import functions correctly.

Email verification functions correctly.

First recipient creation functions correctly.

First card generation functions correctly.

Autopilot configuration functions correctly.

Subscription integrates with the existing billing flow.

Dashboard loads immediately after onboarding completion.

---

## User Experience Acceptance

The experience should feel:

Warm.

Calm.

Premium.

Relationship focused.

Helpful.

Trustworthy.

Users should never describe onboarding as:

Complicated.

Overwhelming.

Confusing.

Technical.

Sales driven.

---

## Visual Acceptance

Every screen follows the design system.

Spacing is consistent.

Typography matches platform specifications.

Animations remain subtle.

Illustrations reinforce emotional storytelling.

No placeholder artwork remains.

No unfinished states remain.

---

## Accessibility Acceptance

WCAG 2.2 AA requirements satisfied.

Keyboard navigation complete.

Screen reader compatibility verified.

Color contrast validated.

Focus indicators visible.

Reduced motion supported.

Touch targets compliant.

---

## Performance Acceptance

All performance budgets defined in this specification are met.

No cumulative layout shift.

No blocking API calls during interaction.

No unnecessary bundle loading.

No visible UI freezes during onboarding.

---

## Analytics Acceptance

Every required onboarding event is tracked exactly once.

No duplicate analytics events.

No personally identifiable relationship information transmitted.

Drop off reporting available for every onboarding step.

---

# Definition of Done

The onboarding experience is considered production ready only when all of the following are true:

* Every onboarding screen has been implemented exactly as specified.

* All layouts match desktop, tablet, and mobile specifications.

* Responsive behavior matches every breakpoint defined in this document.

* All animations, transitions, and microinteractions are complete.

* Every empty, loading, success, validation, and error state has been implemented.

* All accessibility requirements have been verified.

* Keyboard navigation is complete across every interaction.

* Screen reader behavior has been tested.

* Autosave functions throughout the experience.

* Session restoration works after refresh, logout, browser closure, and device changes where supported.

* Calendar and contacts imports integrate with the existing backend without modification.

* Authentication and email verification use the existing production systems.

* Card generation uses the existing AI pipeline without introducing onboarding specific logic.

* Autopilot setup writes directly to the existing preference model.

* Subscription integrates with the existing Stripe implementation.

* Analytics events match the tracking specification.

* Performance budgets are satisfied.

* No duplicate business logic exists in the frontend.

* No placeholder content, placeholder illustrations, lorem ipsum, temporary copy, debug UI, or development components remain.

* The onboarding experience feels like a world class Relationship Concierge welcoming a new client, not a software application collecting data.

---

**End of 88_ONBOARDING_BUILD_[SPEC.md](http://SPEC.md)**