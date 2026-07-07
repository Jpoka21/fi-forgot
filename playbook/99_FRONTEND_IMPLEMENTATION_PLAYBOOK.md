# 99_FRONTEND_IMPLEMENTATION_[PLAYBOOK.md](http://PLAYBOOK.md)

# Frontend Implementation Playbook

---

# Purpose

This document serves as the definitive implementation guide for rebuilding the entire F.I. Forgot frontend.

Its purpose is to eliminate engineering interpretation.

Every screen, interaction, animation, transition, layout, component, loading state, responsive behavior, accessibility requirement, visual hierarchy, navigation rule, and integration point has already been defined throughout this playbook.

This document explains exactly how those specifications become production code.

It is the bridge between design specifications and implementation.

A frontend engineer should be able to build the complete interface without making product decisions.

Every implementation decision has already been made.

This document defines:

* implementation architecture

* project organization

* component assembly

* routing strategy

* state management

* API integration boundaries

* frontend data flow

* styling architecture

* animation architecture

* performance requirements

* implementation order

* quality standards

* deployment readiness

This playbook intentionally avoids changing business logic.

The backend already represents the product.

The frontend simply becomes a significantly better expression of it.

---

# Philosophy

The frontend is not the product.

Relationships are the product.

Thoughtfulness is the product.

Trust is the product.

Confidence is the product.

The interface exists only to reduce effort while increasing meaningful human connection.

Every interaction should feel calm.

Every animation should reduce cognitive load.

Every screen should quietly guide.

Nothing should feel technical.

Nothing should feel overwhelming.

Nothing should feel transactional.

The interface should behave like a premium concierge.

Not software.

Every implementation decision should reinforce four emotional goals.

## Calm

The interface never creates anxiety.

It never rushes users.

It never overwhelms users.

It always explains.

It always reassures.

It always feels under control.

---

## Confidence

Users should always know:

where they are,

what is happening,

what happens next,

and whether everything is safe.

There should never be uncertainty.

---

## Thoughtfulness

The application should constantly communicate that it remembers what matters.

People matter.

Relationships matter.

Stories matter.

Cards are simply one expression.

---

## Invisible Intelligence

Artificial intelligence should almost disappear.

The user should experience:

"I can't believe it remembered that."

rather than

"AI generated this."

The concierge feels human.

The technology stays invisible.

---

# Frontend Architecture Overview

The frontend is a presentation layer.

It should contain as little business logic as possible.

Business rules remain on the backend.

Validation remains on the backend.

Scheduling remains on the backend.

Relationship intelligence remains on the backend.

Card generation remains on the backend.

Notification logic remains on the backend.

Automation remains on the backend.

The frontend should primarily perform five responsibilities.

## Responsibility One

Render data.

---

## Responsibility Two

Collect user input.

---

## Responsibility Three

Display backend state.

---

## Responsibility Four

Guide users through workflows.

---

## Responsibility Five

Deliver an exceptional emotional experience.

Everything else belongs elsewhere.

---

# Relationship to the Existing Backend

The backend is already complete.

The frontend must adapt to it.

The backend should not be redesigned simply because the interface changes.

The following systems remain untouched.

## Database

No schema changes.

No table redesign.

No migration changes.

No relationship modifications.

No new persistence architecture.

---

## Authentication

Authentication flows remain identical.

Session management remains identical.

Refresh logic remains identical.

Permissions remain identical.

Authorization remains identical.

---

## AI Pipelines

Prompt pipelines remain unchanged.

Memory generation remains unchanged.

Relationship scoring remains unchanged.

Question generation remains unchanged.

Card generation remains unchanged.

Timeline intelligence remains unchanged.

Autopilot intelligence remains unchanged.

---

## Stripe

Current billing flows remain.

Subscription management remains.

Webhook behavior remains.

Plan enforcement remains.

Payment history remains.

---

## Handwrytten

Current integration remains.

Order creation remains.

Status tracking remains.

Shipping updates remain.

Address validation remains.

Delivery workflow remains.

---

## API Contracts

Endpoints remain identical.

Payloads remain identical.

Authentication remains identical.

Response formats remain identical.

Error formats remain identical.

Status codes remain identical.

The frontend adapts to existing contracts.

Never redesign APIs simply for frontend convenience.

---

## Business Rules

Business rules remain backend responsibilities.

Examples include:

Relationship Health calculations

Brownie Points

Autopilot scheduling

Question cadence

Notification eligibility

Subscription limits

Recipient eligibility

Timeline scoring

Card generation quality

Delivery windows

Holiday calculations

Concierge recommendations

None of these migrate into frontend code.

---

# Frontend Responsibilities

The frontend owns presentation.

Presentation includes:

layout

visual hierarchy

animations

loading

navigation

transitions

responsiveness

component composition

interaction feedback

microinteractions

client side accessibility

temporary UI state

optimistic rendering where appropriate

Nothing more.

---

# High Level Frontend Layers

The rebuilt frontend should be organized into clear architectural layers.

No layer should violate responsibilities.

```

Application Shell

        ↓

Navigation Layer

        ↓

Route Layer

        ↓

Screen Layer

        ↓

Feature Layer

        ↓

Reusable Components

        ↓

Design Tokens

```

Business logic does not live in these layers.

---

# Application Shell

The Application Shell provides:

global layout

routing

navigation

modals

drawers

global providers

theme

toast notifications

dialog portals

keyboard shortcuts

accessibility announcements

loading overlays

Nothing screen specific belongs here.

---

# Navigation Layer

Navigation owns only navigation.

Examples include:

Sidebar

Bottom navigation

Top navigation

Breadcrumbs

Back navigation

Global search

Command palette

Notification drawer

User menu

Workspace switching

Nothing screen specific belongs inside navigation.

---

# Route Layer

Each route should load one screen.

Routes should remain extremely lightweight.

Routes should primarily:

retrieve parameters

mount providers

render the screen

Nothing more.

---

# Screen Layer

A screen coordinates multiple features.

For example:

Dashboard

Recipient Profile

Calendar

AI Concierge

Settings

Billing

Authentication

Onboarding

Admin

Search

Each screen owns orchestration.

Not implementation.

---

# Feature Layer

Features encapsulate user workflows.

Examples:

Upcoming Cards

Relationship Timeline

Memory Feed

Recipient Summary

Quick Actions

Card Draft Review

Autopilot Controls

Profile Completion

Search Results

Suggested Actions

These features combine components into meaningful experiences.

---

# Component Layer

Components should remain reusable.

Examples:

Buttons

Inputs

Cards

Badges

Timeline Rows

Recipient Chips

Progress Rings

Loading Skeletons

Dropdowns

Menus

Dialogs

Accordions

Tooltips

Avatar Groups

Every reusable component belongs here.

---

# Token Layer

The lowest layer is design tokens.

Spacing

Typography

Radius

Shadows

Color

Elevation

Animation

Timing

Breakpoints

Icon sizes

Opacity

Blur

Borders

Tokens should never contain business logic.

---

# Frontend Project Organization

The frontend should prioritize discoverability.

Developers should immediately understand where every file belongs.

The project should be organized by features first.

Shared infrastructure second.

Utilities last.

Avoid dumping unrelated code into generic folders.

Poor organization increases implementation mistakes.

---

Suggested organization:

```text

src/

  app/

  routes/

  screens/

  features/

  components/

  layouts/

  hooks/

  services/

  api/

  providers/

  store/

  styles/

  animations/

  assets/

  icons/

  utils/

  types/

  constants/

  accessibility/

  tests/

```

Each folder should have a clearly defined responsibility.

---

# Screen Organization

Each major screen receives its own folder.

Example:

```text

screens/

  Dashboard/

  RelationshipProfile/

  CardCreation/

  Calendar/

  Recipients/

  AIConcierge/

  Settings/

  Billing/

  Authentication/

  Search/

  Admin/

```

Inside each screen:

```text

index

Screen

hooks

components

types

constants

animations

```

Keep screen specific code inside the screen.

Avoid unnecessary cross screen coupling.

---

# Feature Organization

Features should represent meaningful user workflows.

Example:

```text

features/

  UpcomingCards/

  RelationshipHealth/

  Timeline/

  CardDraft/

  ConciergeSuggestions/

  SearchResults/

  NotificationCenter/

  ProfileCompletion/

  RecipientInsights/

  SmartActions/

```

Features may be reused across multiple screens.

---

# Component Organization

Components should be categorized.

```text

components/

  buttons/

  inputs/

  navigation/

  cards/

  feedback/

  overlays/

  typography/

  avatars/

  progress/

  timeline/

  badges/

  forms/

  menus/

  dialogs/

  tables/

  skeletons/

  emptyStates/

  illustrations/

```

Avoid extremely large component directories.

Prefer many focused folders.

---

# Relationship to Design System

The implementation never invents new visual language.

Every visual decision references the Design System.

Typography references typography tokens.

Spacing references spacing tokens.

Radius references radius tokens.

Animation references motion tokens.

Elevation references shadow tokens.

Icons reference icon specifications.

Illustrations reference approved illustration assets.

Colors reference semantic tokens only.

No hardcoded styling values should appear throughout the application except where explicitly documented.

---

# Non Negotiable Implementation Rules

These rules override developer preference.

Violation of these rules creates implementation inconsistency.

## Rule One

Never recreate business logic on the frontend.

---

## Rule Two

Never duplicate backend calculations.

---

## Rule Three

Never hardcode API data.

---

## Rule Four

Never bypass the design token system.

---

## Rule Five

Never introduce screen specific styling into reusable components.

---

## Rule Six

Never place business rules inside components.

---

## Rule Seven

Never directly mutate server data.

Always use documented update flows.

---

## Rule Eight

Never use arbitrary spacing.

Spacing always comes from spacing tokens.

---

## Rule Nine

Never invent new colors.

Only semantic color tokens may be used.

---

## Rule Ten

Never invent new typography sizes.

Typography always references token definitions.

---

## Rule Eleven

Never skip loading states.

Every asynchronous interaction must communicate progress.

---

## Rule Twelve

Never skip empty states.

Every collection view must gracefully handle zero data.

---

## Rule Thirteen

Never allow layout shift after loading.

Skeletons should reserve the exact visual footprint of final content.

---

## Rule Fourteen

Never create inaccessible interactions.

Every interactive element must support keyboard navigation, screen readers, visible focus, and appropriate contrast.

---

## Rule Fifteen

Never block users without explanation.

Errors always explain:

what happened,

why,

and how to recover.

---

## Rule Sixteen

Never expose internal implementation language.

Users never see:

database

pipeline

prompt

endpoint

JSON

token

schema

cron

automation IDs

internal statuses

system terminology

Everything is translated into natural human language.

---

## Rule Seventeen

Never expose AI uncertainty.

The concierge should communicate confidently while remaining truthful.

---

## Rule Eighteen

Never interrupt users unnecessarily.

Use progressive disclosure.

Show only what is needed.

Reveal additional complexity only when appropriate.

---

## Rule Nineteen

Never create multiple competing primary actions.

Every screen has one clear primary action.

Secondary actions remain visually subordinate.

---

## Rule Twenty

Never sacrifice clarity for visual novelty.

Beauty exists to improve comprehension.

Not distract from it.

---

# What Must Never Change

The frontend redesign is intentionally ambitious.

However, several aspects of the product are foundational and must remain unchanged regardless of implementation details.

## The Mission

The mission never changes.

Help people become more thoughtful in the relationships that matter most.

Everything else is secondary.

---

## Relationship First Philosophy

Recipients remain the center of the experience.

Cards remain one expression of those relationships.

The interface must never become card centered.

---

## Concierge Positioning

The product must always feel like a Relationship Concierge.

Never a greeting card marketplace.

Never a productivity tool.

Never an AI assistant.

Never a CRM.

Never a reminder application.

---

## Existing Backend Intelligence

All relationship intelligence remains trusted.

The frontend displays it.

It does not reinterpret it.

It does not replace it.

It does not compete with it.

---

## Existing API Contracts

Existing endpoints remain authoritative.

The frontend evolves independently from backend architecture.

---

## Existing Data Integrity

The frontend must never compromise existing data quality.

Every interaction should preserve:

recipient history,

timeline integrity,

relationship memories,

generated cards,

delivery records,

automation history,

notification history,

subscription data,

and audit history.

---

## Existing AI Quality

The concierge continues using the existing AI pipelines exactly as designed.

The frontend improves the experience of interacting with those pipelines.

It does not modify their intelligence.

---

## Existing Integrations

Stripe remains the billing authority.

Handwrytten remains the fulfillment authority.

Authentication remains the identity authority.

Backend services remain the business authority.

The frontend is the presentation authority.

---

## Long Term Maintainability

Every implementation decision should optimize for future evolution.

New features should compose naturally from the existing architecture.

No implementation shortcut should create long term technical debt.

The frontend should remain modular, predictable, testable, scalable, and understandable for years without requiring architectural rewrites.



# Frontend Technology Stack

The frontend technology stack should prioritize long term maintainability, performance, accessibility, developer productivity, and predictable behavior.

Technology choices should reinforce the architecture defined throughout this playbook.

The objective is not to use the newest technology.

The objective is to create a frontend that remains easy to understand, easy to extend, and easy to maintain for many years.

Every dependency should justify its existence.

Avoid unnecessary libraries.

Avoid overlapping responsibilities.

Avoid introducing abstractions that provide minimal long term value.

---

# Core Technologies

The existing frontend foundation remains.

React remains the rendering engine.

TypeScript remains the implementation language.

Vite remains the build system unless a future migration is justified independently.

The frontend redesign does not require changing these technologies.

---

# TypeScript Standards

TypeScript should be treated as mandatory.

Avoid the use of `any`.

Avoid suppressing compiler errors.

Prefer explicit interfaces.

Prefer discriminated unions for complex UI state.

Prefer readonly data where possible.

Prefer strong typing across:

API responses

component props

feature state

form models

route parameters

theme tokens

configuration objects

animation variants

Avoid duplicate interface definitions.

Shared models should exist in a single location.

---

# React Philosophy

React components should remain small.

Each component should perform one responsibility.

Avoid components that exceed several hundred lines unless they are primarily layout containers.

Favor composition.

Avoid inheritance.

Avoid deeply nested conditional rendering.

Large condition trees should become smaller components.

---

# Functional Components

All components should use functional components.

Avoid class components.

Avoid legacy lifecycle methods.

Prefer hooks.

Custom hooks should encapsulate reusable behavior.

Components should focus on rendering.

Hooks should focus on behavior.

---

# Component Composition

Components should compose naturally.

Example:

```

Dashboard

    Hero

    UpcomingCards

    ConciergeInsights

    SuggestedActions

    RecentActivity

    Footer

```

Rather than one enormous Dashboard component.

---

# State Ownership Philosophy

State should exist in the lowest reasonable location.

Local state belongs inside components.

Feature state belongs inside features.

Global state should remain extremely limited.

Do not elevate state unnecessarily.

---

# Local State

Use local component state for:

input values

accordion expansion

dialog visibility

hover state

temporary selections

dropdown menus

tab selection

loading indicators specific to one component

temporary UI animations

---

# Feature State

Feature state belongs inside feature providers or feature hooks.

Examples:

Card Draft Builder

Relationship Timeline

Search Results

Recipient Editing

Autopilot Configuration

These features should own their own internal state.

---

# Global State

Global state should be reserved only for information used across the application.

Examples include:

authenticated user

subscription information

theme

application settings

notification count

feature flags

application configuration

global loading overlays

Everything else should remain local.

---

# Server State

Server state should never be copied into global state unless absolutely necessary.

Instead:

Fetch

Display

Refresh

Invalidate

Refetch

The backend remains the source of truth.

Avoid stale client copies.

---

# API Layer

Every backend request should flow through a centralized API layer.

Components never construct endpoints directly.

Components never build URLs.

Components never assemble authentication headers.

Components never interpret transport errors.

The API layer owns communication.

---

Example:

```

Component

↓

Feature Hook

↓

API Service

↓

Backend

```

This creates consistent behavior throughout the application.

---

# API Services

Each backend domain should have its own service.

Example:

```

authService

recipientService

relationshipService

timelineService

calendarService

cardService

billingService

searchService

notificationService

adminService

conciergeService

```

Each service owns only its own endpoints.

Avoid giant service files.

---

# Request Standardization

Every request should follow a predictable lifecycle.

Initialize

Send request

Show loading state

Receive response

Normalize data if necessary

Render

Handle errors

Handle retry

Complete

No screen should invent its own request flow.

---

# Response Handling

Backend responses should remain authoritative.

Do not transform business meaning.

Minor presentation formatting is acceptable.

Examples:

Date formatting

Currency formatting

Relative time

Localized strings

Display labels

Do not alter calculations.

---

# Error Handling Strategy

Every request should return predictable frontend states.

Idle

Loading

Success

Empty

Partial

Refreshing

Failure

Unauthorized

Offline

Timeout

These states should be standardized across the application.

---

# Optimistic Updates

Optimistic updates should be used selectively.

Safe examples include:

favorite toggles

bookmarking

read status

expanded sections

draft edits

Unsafe examples include:

subscription changes

payment processing

card orders

recipient deletion

billing updates

AI generation

Those should wait for backend confirmation.

---

# Data Refresh Strategy

Refresh behavior should feel invisible.

Users should rarely need manual refresh.

Automatic refresh should occur after:

successful mutations

navigation returning to a screen

window focus when appropriate

completed AI operations

completed card generation

successful payment

recipient updates

Avoid unnecessary polling.

---

# Caching Philosophy

Cache only what improves user experience.

Do not cache indefinitely.

Relationship information should remain fresh.

Timeline information should remain fresh.

Generated cards should refresh appropriately.

Billing information should prioritize accuracy over caching.

---

# Forms Philosophy

Forms should feel conversational.

Never intimidating.

Large forms should be divided into meaningful sections.

Progress should always be visible.

Validation should occur naturally.

Never overwhelm users with errors.

---

# Form Structure

Each form should include:

title

short explanation

fields

optional helper text

validation

primary action

secondary action

success feedback

error recovery

The structure should remain consistent.

---

# Validation Strategy

Validation should occur at multiple levels.

Immediate validation

Field level validation

Section validation

Submission validation

Backend validation

The user should receive feedback as early as possible.

---

# Field Validation

Inline validation should never interrupt typing.

Prefer validating:

on blur

after meaningful pauses

on submit

Immediate validation should be reserved for:

password strength

email formatting

required fields

character limits

---

# Dirty State Tracking

Every editable form should know:

has changes

saving

saved

failed

conflict

Users should never wonder if changes were preserved.

---

# Autosave Philosophy

Autosave should be used where appropriate.

Suitable areas include:

recipient notes

relationship memories

draft card edits

profile information

settings

Unsuitable areas include:

billing

payments

account deletion

subscription cancellation

---

# Save Feedback

Successful saves should communicate quietly.

Examples:

Saved

Updated

Changes synced

Never interrupt workflow with unnecessary dialogs.

---

# Conflict Resolution

If backend data changes while editing:

Inform the user.

Preserve their work.

Offer:

Reload

Merge

Continue editing

Avoid silent overwrites.

---

# Navigation Philosophy

Navigation should always reinforce orientation.

Users should always know:

where they are

where they came from

where they can go

Navigation should never feel like teleportation.

---

# Route Transitions

Transitions between screens should remain subtle.

Fast.

Predictable.

Never theatrical.

The objective is continuity.

Not entertainment.

---

# Deep Linking

Every meaningful screen should support direct navigation.

Recipient profiles

Cards

Calendar views

Billing

Settings

Search

AI Concierge

Notification details

Admin pages

Users should always be able to bookmark meaningful destinations.

---

# Browser Navigation

Back and forward browser controls must work naturally.

Avoid breaking browser expectations.

Avoid trapping users inside modal workflows.

---

# URL Philosophy

URLs should remain clean.

Human readable.

Stable.

Avoid exposing internal identifiers when unnecessary.

Prefer semantic routes whenever practical.

---

# Layout System Integration

Every layout references the design system.

Spacing comes from spacing tokens.

Typography comes from typography tokens.

Radius comes from radius tokens.

Elevation comes from shadow tokens.

Animation comes from motion tokens.

Breakpoints come from responsive specifications.

Never introduce layout values outside the token system.

---

# Responsive Implementation

Responsive behavior should follow the specifications defined earlier.

No screen should invent custom breakpoints.

Layouts should adapt gracefully.

Not simply shrink.

Components should reflow intelligently.

Content should remain readable at every supported viewport.

---

# Scroll Behavior

Scrolling should feel intentional.

Primary content scrolls.

Navigation remains stable.

Sticky elements should be used sparingly.

Avoid nested scrolling regions whenever possible.

Long pages should maintain clear orientation throughout scrolling.

---

# Focus Management

Focus should always move intentionally.

Dialogs receive focus immediately.

Closing dialogs restores previous focus.

Keyboard users should never lose context.

Screen readers should always understand where focus has moved.

Focus management should be considered part of every feature implementation.

---

# Keyboard Navigation

Every interactive element should support keyboard interaction.

Buttons

Menus

Dialogs

Dropdowns

Forms

Tabs

Accordions

Search

Command Palette

Calendar

Notification Center

Users should never require a mouse.

---

# Accessibility First Development

Accessibility is not a final QA task.

It is an implementation requirement.

Every component should be built accessibly from the beginning.

Accessibility should never become technical debt.

---

# Screen Reader Support

Every control should expose meaningful labels.

Icons alone should never communicate meaning.

Status changes should announce appropriately.

Loading states should announce appropriately.

Errors should announce appropriately.

Success messages should announce appropriately.

Users relying on assistive technology should experience the same confidence as visual users.



# Motion Architecture

Motion exists to communicate.

Motion is never decorative.

Every animation should answer one of four questions:

What changed?

Where did it come from?

Where did it go?

What should the user focus on next?

If an animation does not improve understanding, it should not exist.

---

# Motion Principles

Every animation should feel:

Natural

Calm

Purposeful

Responsive

Elegant

Professional

The interface should never feel playful at the expense of trust.

The interface should never feel slow because of excessive animation.

The interface should never surprise users.

---

# Animation Categories

Motion should be categorized into predictable groups.

## Navigation Motion

Page transitions

Drawer movement

Sidebar expansion

Bottom navigation transitions

Breadcrumb transitions

---

## Component Motion

Buttons

Cards

Inputs

Dropdowns

Accordions

Tabs

Progress indicators

Badges

---

## Feedback Motion

Success

Error

Loading

Completion

Notifications

Confirmation

---

## Content Motion

Lists

Filtering

Searching

Sorting

Timeline updates

Card generation

Recipient updates

---

# Animation Timing Standards

Animation timing should remain consistent throughout the application.

Very Fast

100 milliseconds

Used for:

Hover

Focus

Icon changes

Micro feedback

---

Fast

150 to 200 milliseconds

Used for:

Buttons

Menus

Dropdowns

Tooltips

---

Medium

250 to 300 milliseconds

Used for:

Dialogs

Cards

Navigation

Drawers

Panels

---

Long

350 to 450 milliseconds

Used only for:

Major onboarding transitions

Large screen transitions

Hero illustrations

Relationship onboarding moments

Long animations should remain uncommon.

---

# Easing Standards

Motion should accelerate and decelerate naturally.

Abrupt starts should be avoided.

Abrupt stops should be avoided.

Entrance animations should accelerate gently.

Exit animations should decelerate naturally.

Linear motion should be reserved for loading indicators and progress animations.

---

# Screen Entry Animation

Each major screen should fade into view while moving slightly upward.

The movement should be subtle.

Users should perceive continuity rather than animation.

The animation should never delay interaction.

Interactive elements should become usable immediately.

---

# Section Reveal

Sections appearing after loading should reveal individually.

Large blocks should not appear simultaneously.

Recommended order:

Hero

Primary content

Secondary content

Supporting actions

Footer

Each reveal should have minimal delay.

---

# Card Motion

Cards should feel physical.

Hover should slightly elevate.

Selection should feel deliberate.

Expansion should preserve spatial continuity.

Cards should never bounce.

Cards should never overshoot.

Cards should never rotate.

---

# Button Motion

Buttons should acknowledge interaction immediately.

Hover

Slight elevation

Slight shadow increase

---

Pressed

Slight compression

Immediate response

---

Loading

Spinner replaces icon.

Button width remains constant.

Label remains centered.

---

Success

Spinner transitions into checkmark.

Confirmation lasts briefly.

Button returns to normal state.

---

# Input Motion

Inputs should communicate readiness.

Focus

Border transitions smoothly.

Label animates naturally.

Helper text appears gently.

Validation should never shake aggressively.

Subtle movement is preferred.

---

# Accordion Motion

Accordion expansion should preserve layout continuity.

Height should animate naturally.

Content should fade while expanding.

Avoid instant appearance.

Avoid excessive duration.

---

# Dialog Motion

Dialogs should appear from the visual center.

Backdrop fades first.

Dialog scales slightly while fading in.

Closing reverses naturally.

Focus should transfer immediately.

---

# Drawer Motion

Drawers should slide from their origin.

Left drawers slide from left.

Right drawers slide from right.

Bottom sheets rise from below.

Movement should feel connected to origin.

---

# Toast Notifications

Toast notifications should slide gently.

Appear quickly.

Remain long enough to read.

Disappear quietly.

Never interrupt interaction.

---

# Progress Indicators

Progress animations should remain continuous.

Never restart unnecessarily.

Never jump backward.

Always communicate forward movement.

---

# Skeleton Loading Motion

Skeletons should shimmer subtly.

Animation should remain slow.

Avoid flashing.

Avoid high contrast movement.

Animation should stop immediately when content loads.

---

# AI Generation Motion

AI generation deserves special treatment.

Users should feel progress.

Not waiting.

The interface should communicate thoughtful work.

Examples include:

Reviewing memories

Understanding recipient

Planning message

Writing draft

Refining wording

Final review

These steps represent presentation only.

They never expose backend implementation.

---

# Search Animation

Search should feel instantaneous.

Input response should be immediate.

Result updates should fade naturally.

Results should never disappear before replacements are ready.

Avoid empty flashes.

---

# Filtering Animation

Filtering should preserve orientation.

Items leaving should fade.

Remaining items should reposition smoothly.

New items should appear naturally.

Avoid full list re rendering when possible.

---

# Sorting Animation

Sorting should communicate movement.

Items should appear to relocate.

Avoid removing then recreating entire lists.

Maintain visual continuity.

---

# Timeline Animation

Timeline additions should appear from the top.

New memories should gently highlight.

Historical items remain stable.

Users should immediately recognize what changed.

---

# Notification Center Animation

Unread notifications should appear slightly emphasized.

Opening a notification should preserve context.

Read status changes should feel immediate.

Notification removal should collapse naturally.

---

# Calendar Animation

Month transitions should slide horizontally.

Day selection should animate subtly.

Event expansion should preserve calendar stability.

Avoid excessive movement within dense calendar views.

---

# Relationship Health Animation

Health indicators should animate only when values change.

Progress should move smoothly.

Avoid dramatic jumps.

Historical comparisons should remain visually understandable.

---

# Concierge Suggestion Animation

Recommendations should appear conversationally.

One section should not overwhelm another.

Priority recommendations appear first.

Secondary recommendations appear afterward.

This reinforces hierarchy.

---

# Error Animation

Errors should attract attention without alarming users.

Avoid shaking entire screens.

Prefer:

Border emphasis

Gentle icon animation

Inline explanation

Accessible announcements

---

# Success Animation

Success should feel rewarding.

Not celebratory.

Examples:

Checkmark

Soft highlight

Subtle confirmation

Brief fade

Avoid confetti.

Avoid fireworks.

Avoid unnecessary celebration.

---

# Empty State Animation

Illustrations may fade into view.

Supporting text appears afterward.

Primary action appears last.

This guides attention naturally.

---

# Responsive Motion

Animations should shorten slightly on smaller devices.

Reduced travel distance should compensate for limited screen space.

Motion should remain smooth regardless of device.

---

# Reduced Motion Support

Users requesting reduced motion should receive an equivalent experience.

Animations should become:

Instant

Minimal

Fade based

Position changes should avoid large movement.

All functionality must remain identical.

Respect operating system accessibility preferences automatically.

---

# Performance Budget for Motion

Animations should never reduce application responsiveness.

Animation should maintain target frame rates.

Avoid triggering unnecessary layout recalculations.

Prefer transform and opacity based animation whenever practical.

Avoid animating expensive layout properties repeatedly.

---

# Motion Consistency Checklist

Every implemented animation should satisfy the following questions before release.

Does it improve understanding?

Does it reinforce hierarchy?

Does it preserve orientation?

Does it respect accessibility?

Does it follow timing standards?

Does it use approved easing?

Does it avoid distracting users?

Does it remain performant on lower powered devices?

Does it support reduced motion?

If any answer is no, the animation should be redesigned or removed.

---

# Styling Architecture

The styling system should be predictable, scalable, and completely aligned with the design system.

Developers should never wonder where styling belongs.

Visual consistency is achieved through structure, not discipline alone.

---

# Styling Principles

The styling architecture should prioritize:

Consistency

Reusability

Predictability

Maintainability

Performance

Accessibility

Theme compatibility

Every style should exist for a reason.

Duplicate styling should be eliminated.

---

# Design Tokens as the Foundation

Every visual value should originate from design tokens.

Including:

Colors

Typography

Spacing

Sizing

Border radius

Elevation

Opacity

Blur

Motion

Breakpoints

Transitions

Focus rings

Z index layers

No arbitrary values should appear within production components.

---

# Semantic Styling

Components should reference semantic tokens rather than raw visual values.

Examples include:

Primary Surface

Secondary Surface

Accent Surface

Success Surface

Warning Surface

Danger Surface

Interactive Border

Muted Text

Primary Text

Secondary Text

This allows visual evolution without changing component implementations.

---

# Component Styling

Each reusable component owns its own styling.

Component styles should not depend on where they are used.

Parent layouts should control placement.

Components should control appearance.

This separation keeps components portable.

---

# Layout Styling

Layouts should only define:

Spacing

Alignment

Distribution

Containers

Responsive behavior

Layouts should never redefine typography or component appearance.

---

# Screen Styling

Screens should compose existing layouts and components.

Screen specific styling should remain minimal.

Large custom styling blocks usually indicate architecture problems.

---

# Utility Classes

Utility classes should remain limited.

They should support implementation efficiency.

They should never replace the design system.

Avoid long chains of utility overrides.

Prefer reusable abstractions over repeated styling patterns.

---

# Theme Support

All styling should support centralized theming.

Even if only one visual theme exists today, implementation should remain theme capable.

Color references should never depend on hardcoded values inside components.

Theme changes should require updating tokens rather than component code.

---

# Icon Styling

Icons should inherit semantic color whenever appropriate.

Avoid manually styling every icon.

Icons should align consistently with surrounding typography.

Interactive icons should share the same hover and focus behavior as buttons.

---

# Illustration Styling

Illustrations should always remain secondary to content.

They should never overpower headlines.

Illustrations should scale responsively.

Cropping should never remove important visual storytelling.

Whitespace around illustrations should remain generous.

---

# Image Handling

Images should load progressively whenever possible.

Aspect ratios should remain stable before loading.

Layout shift should be prevented.

Fallback imagery should exist for missing assets.

Broken images should never appear in production.



# Asset Management

Frontend assets should be treated as product resources rather than miscellaneous files.

Every asset should have a clear ownership model.

Every asset should exist in one location.

Every asset should have a documented purpose.

Avoid duplicate assets.

Avoid multiple versions of the same illustration without explicit naming.

---

# Asset Categories

Assets should be organized into clearly defined categories.

## Brand Assets

Logo

Wordmark

Brand icon

Favicon

Application icons

Email assets

Loading assets

---

## Illustration Assets

Homepage illustrations

Onboarding illustrations

Empty state illustrations

Error illustrations

Celebration illustrations

Relationship illustrations

Recipient illustrations

AI Concierge illustrations

Calendar illustrations

Dashboard illustrations

Admin illustrations

All illustrations should reference the official Illustration Library.

No unofficial illustrations should appear in production.

---

## Photography

Photography should remain limited.

Illustration is the primary visual language.

Photography should only appear where specifically documented.

Examples include:

User uploaded avatars

Recipient profile images

User profile images

Uploaded memories

Scanned handwritten cards

Imported contact images

---

## Icon Assets

Icons should originate from one approved icon library.

Avoid mixing icon styles.

Every icon should:

Share stroke weight

Share corner radius

Share perspective

Share sizing conventions

Icons should always align with typography baselines.

---

## Animation Assets

Animation assets should remain lightweight.

Prefer native frontend animation whenever possible.

Avoid large video assets.

Avoid unnecessary GIF usage.

Prefer vector based animation where appropriate.

---

## Decorative Assets

Decorative assets should remain minimal.

Decorative graphics should never compete with content.

Every decorative asset should support emotional tone rather than visual complexity.

---

# Asset Naming Standards

Assets should follow predictable naming.

Example:

```

hero_dashboard

hero_relationship

empty_calendar

empty_notifications

error_network

illustration_onboarding_01

illustration_doghouse_dave

badge_relationship_health

icon_calendar

```

Avoid:

final.png

newlogo2.svg

copy.png

updated-final-final.svg

Naming should remain permanent.

---

# Illustration Library Integration

Every illustration should reference the master Illustration Library documented previously.

Each illustration should have:

Asset ID

Description

Purpose

Supported screens

Responsive behavior

Dark background compatibility

Localization considerations

Accessibility description

Implementation should never substitute unofficial artwork.

---

# Homepage Hero Asset

Asset 001 remains the canonical homepage hero.

Doghouse Dave inside the doghouse remains the official introductory illustration.

The homepage should always reference this master asset unless an official replacement has been approved.

Derivative versions should inherit:

Character proportions

Color palette

Lighting

Facial expression

Illustration style

Line weight

Texture

Overall emotional tone

---

# Loading Assets

Loading graphics should remain subtle.

Avoid branded loading sequences that delay interaction.

Skeletons remain the preferred loading experience.

Illustrated loading assets should be reserved for longer workflows such as:

AI generation

Large imports

Initial onboarding

---

# Avatar Strategy

Users may upload avatars.

Recipients may upload avatars.

When unavailable:

Use initials.

Never use random placeholder faces.

Generated avatars should not imply real people.

---

# Empty State Illustrations

Every empty state illustration should reinforce optimism.

Examples:

An empty timeline suggests future memories.

An empty calendar suggests opportunities.

An empty notification center suggests peace of mind.

The emotional message should always remain positive.

---

# Error Illustrations

Error illustrations should reduce frustration.

They should never appear humorous during serious workflows.

Billing errors.

Authentication failures.

Network failures.

Card order failures.

These should communicate reassurance.

Not comedy.

---

# Asset Optimization

All assets should be optimized before deployment.

Goals include:

Minimal download size.

High visual quality.

Fast decoding.

Responsive scaling.

Appropriate formats.

Avoid shipping unnecessarily large assets.

---

# Lazy Loading Assets

Large illustrations should load lazily when practical.

Critical above the fold assets should preload.

Secondary illustrations should defer until needed.

Users should never wait for non essential artwork before interacting.

---

# Accessibility for Images

Every meaningful image should include descriptive alternative text.

Decorative assets should be hidden from assistive technologies.

Illustrations that communicate information should have complete descriptions.

Alternative text should describe purpose rather than artistic style.

---

# Internationalization Readiness

The frontend should support future localization without architectural changes.

Even if the initial release remains English only, implementation should assume additional languages will eventually exist.

No screen should hardcode layout assumptions based on English sentence length.

---

# Localization Principles

Every user visible string should originate from localization resources.

Avoid embedding visible text directly inside components.

Labels.

Buttons.

Messages.

Tooltips.

Dialogs.

Errors.

Notifications.

Headings.

Descriptions.

Everything should be localization ready.

---

# Variable Text

Dynamic content should support interpolation.

Examples include:

Recipient names.

Card counts.

Relationship milestones.

Subscription limits.

Billing amounts.

Delivery estimates.

Avoid string concatenation.

Prefer structured message templates.

---

# Date Formatting

Dates should respect user locale.

Backend dates remain authoritative.

Frontend formatting should adapt presentation only.

Examples include:

Long dates.

Short dates.

Relative dates.

Calendar labels.

Timeline timestamps.

---

# Time Formatting

Time display should respect locale preferences.

Support both:

12 hour format.

24 hour format.

Future localization should not require redesigning time components.

---

# Number Formatting

Numbers should support locale specific separators.

Examples include:

Thousands separators.

Decimal separators.

Percentages.

Currency.

Counts.

Progress indicators.

Formatting belongs to presentation only.

Underlying values remain unchanged.

---

# Currency Formatting

Billing screens should use localized currency formatting.

Currency symbols.

Decimal precision.

Thousands separators.

Negative values.

Future multi currency support should require minimal frontend modification.

---

# Text Expansion

Some languages require significantly more space than English.

Layouts should tolerate expanded text without breaking.

Buttons should grow naturally.

Cards should expand vertically when necessary.

Avoid truncating important content.

---

# Right to Left Readiness

Implementation should avoid assumptions that only left to right layouts exist.

Spacing systems.

Alignment.

Icons.

Navigation.

Margins.

Padding.

Flex layouts.

These should remain adaptable for future right to left support.

---

# Typography Localization

Typography should support future multilingual fonts.

Avoid implementation choices that restrict Unicode support.

Font fallback chains should remain carefully defined.

---

# Accessible Language

User facing language should remain:

Warm.

Human.

Supportive.

Professional.

Never technical.

Never robotic.

Never accusatory.

Every message should sound like a trusted concierge.

---

# Copy Integration

The frontend should reference the Copy and Content System.

Components should not rewrite messaging independently.

The approved copy system remains authoritative.

Consistency across every screen is mandatory.

---

# Notification Language

Notifications should remain concise.

Action oriented.

Helpful.

Avoid vague language.

Every notification should clearly communicate:

What happened.

Why it matters.

What the user can do next.

---

# Error Language

Errors should never blame the user.

Prefer:

"We couldn't save your changes."

instead of

"You entered invalid data."

Provide recovery whenever possible.

---

# Empty State Language

Empty states should inspire action.

Never imply failure.

Every empty state should answer:

Why is this empty?

What happens next?

What should I do?

---

# AI Language

The concierge should never over explain AI.

Avoid:

"The AI model generated this."

Prefer:

"We drafted a thoughtful message."

Technology should remain invisible.

---

# Performance Architecture

Performance is a feature.

Fast interfaces communicate professionalism.

Users should perceive the application as responsive under every normal workflow.

Performance optimization begins during implementation.

Not after launch.

---

# Performance Goals

Every screen should prioritize:

Fast initial rendering.

Minimal layout shift.

Responsive interactions.

Smooth animation.

Efficient updates.

Predictable loading.

Performance decisions should never compromise usability.

---

# Critical Rendering Path

Only essential resources should load before first interaction.

Critical styles.

Critical layout.

Primary navigation.

Hero content.

Everything else should progressively load afterward.

---

# Route Based Code Splitting

Major screens should load independently.

Examples include:

Dashboard.

Recipient Profile.

Calendar.

Settings.

Billing.

Admin.

Authentication.

AI Concierge.

Users should never download code for screens they have not visited.

---

# Component Level Lazy Loading

Large secondary components should load on demand.

Examples include:

Advanced analytics.

Admin tools.

Large charts.

Rich editors.

Debug utilities.

Illustration collections.

Avoid delaying essential interaction.

---

# Bundle Management

The frontend should minimize unnecessary dependencies.

Every library should justify:

Bundle size.

Maintenance cost.

Long term value.

Avoid overlapping packages with similar functionality.

---

# Render Optimization

Components should re render only when necessary.

Avoid cascading updates across unrelated features.

Expensive calculations should remain outside render paths whenever possible.

Prefer predictable rendering over premature optimization.

---

# Network Efficiency

Avoid duplicate requests.

Avoid unnecessary refetching.

Reuse successful responses when appropriate.

Invalidate intelligently after mutations.

The backend remains the source of truth while the frontend remains efficient.

---

# Image Performance

Images should use responsive sizing.

Progressive loading.

Lazy loading where appropriate.

Stable aspect ratios.

Efficient compression.

Image loading should never create noticeable layout movement.



# Performance Monitoring

Performance should be continuously measurable.

Every major frontend release should be evaluated against objective performance metrics.

Performance regressions should be treated as bugs.

Visual polish should never justify a slower experience.

---

# Performance Budget

Every screen should remain within predefined performance budgets.

Budgets should include:

JavaScript bundle size

CSS bundle size

Largest Contentful Paint

Interaction responsiveness

Time to Interactive

Cumulative Layout Shift

Animation frame stability

Memory usage

Network requests

Performance budgets should be established before implementation begins and monitored throughout development.

---

# Initial Application Load

The first application load should prioritize:

Authentication validation

Application shell

Primary navigation

Dashboard shell

Above the fold content

Secondary content should progressively load afterward.

Users should always feel that the application is ready immediately.

---

# Navigation Performance

Navigation between screens should feel nearly instantaneous.

Whenever possible:

Reuse existing layout

Preserve navigation

Maintain application shell

Replace only screen content

Avoid rebuilding the entire application for every route change.

---

# Background Loading

Background loading should remain invisible.

Whenever appropriate:

Prefetch likely destinations

Preload frequently used assets

Warm API connections

Cache reusable configuration

Users should perceive anticipation rather than waiting.

---

# Prefetch Strategy

Likely future destinations should preload intelligently.

Examples include:

Recipient profile after selecting a recipient

Card editor after choosing "Create Card"

Calendar details after selecting a date

Billing details after opening subscription settings

Search results after typing

Avoid aggressive prefetching that wastes bandwidth.

---

# Infinite Lists

Long collections should use efficient rendering.

Examples include:

Timeline

Notification history

Search history

Admin activity

Relationship activity

Users should never experience degraded scrolling performance.

---

# Scroll Restoration

Returning to a previous screen should restore scroll position whenever appropriate.

Examples:

Search results

Recipient list

Calendar list

Timeline

Notification center

Avoid forcing users back to the top unnecessarily.

---

# Memory Management

Unused resources should be released appropriately.

Examples:

Unused listeners

Timers

Observers

Temporary caches

Animation controllers

Modal resources

Long lived memory leaks should never accumulate during extended sessions.

---

# Network Failure Recovery

Temporary failures should never permanently interrupt workflow.

The interface should support:

Retry

Reconnect

Resume

Recover

Preserve user work whenever possible.

---

# Offline Awareness

The application should recognize loss of connectivity.

Users should receive clear feedback.

Temporary offline states should preserve editable work whenever practical.

Synchronization should occur automatically after reconnection.

---

# Progressive Enhancement

Core workflows should remain usable even if optional enhancements fail.

Examples:

Animations failing should not block interaction.

Illustrations failing should not block navigation.

Analytics failing should not affect functionality.

Monitoring failures should not affect users.

---

# Accessibility Architecture

Accessibility is a foundational architectural requirement.

Every feature should be designed and implemented so every supported user receives an equivalent experience.

Accessibility is not a separate implementation.

Accessibility is implementation.

---

# Accessibility Philosophy

Every user should experience:

Confidence

Clarity

Control

Predictability

Respect

No feature should require perfect vision.

No feature should require perfect hearing.

No feature should require precise motor control.

No feature should require memorization.

---

# Semantic HTML

Semantic HTML should remain the foundation.

Use proper:

Headings

Buttons

Lists

Navigation

Main content

Sections

Articles

Forms

Labels

Tables

Avoid replacing semantic elements with generic containers.

---

# Landmark Structure

Every page should expose meaningful landmarks.

Examples include:

Header

Navigation

Main

Aside

Footer

Search

This allows assistive technologies to navigate efficiently.

---

# Heading Hierarchy

Headings should remain logical.

Every screen begins with one primary heading.

Sections descend naturally.

Avoid skipping heading levels.

Visual styling should never dictate heading structure.

---

# Focus Visibility

Every interactive element should display a visible focus indicator.

Focus should remain:

Consistent

Accessible

High contrast

Never remove focus outlines without providing an improved alternative.

---

# Keyboard Architecture

Complete application functionality should remain accessible by keyboard.

Including:

Navigation

Dialogs

Dropdowns

Autocomplete

Calendar

Timeline

Notifications

Search

AI Concierge

Recipient management

Billing

Admin

No feature should require pointer interaction.

---

# Focus Order

Focus should move logically.

Left to right.

Top to bottom.

Contextually through dialogs.

Unexpected jumps should never occur.

Focus order should match visual hierarchy.

---

# Focus Trapping

Dialogs and overlays should trap focus appropriately.

Closing restores focus to the triggering element.

Nested dialogs should remain extremely rare.

---

# Live Regions

Dynamic updates should announce appropriately.

Examples include:

Card generated

Recipient saved

Payment succeeded

Notification received

Relationship updated

Search completed

Loading finished

Announcements should remain concise.

---

# Form Accessibility

Every field requires:

Visible label

Accessible label

Helper text when necessary

Error association

Required indication

Validation messaging

Placeholder text should never replace labels.

---

# Error Accessibility

Errors should be announced.

Error summaries should guide users efficiently.

Keyboard focus should move to important validation issues after submission.

---

# Color Independence

Information should never rely solely on color.

Examples:

Errors require icons or text.

Success requires icons or text.

Relationship Health requires labels.

Calendar status requires multiple indicators.

Charts require patterns or labels where necessary.

---

# Contrast Standards

Text should maintain approved contrast ratios.

Interactive controls should remain visible in every state.

Focus indicators should exceed minimum accessibility requirements.

Disabled controls should remain understandable without appearing broken.

---

# Target Size

Interactive controls should maintain comfortable touch targets.

Examples:

Buttons

Checkboxes

Radio buttons

Calendar dates

Menu items

Icons

Users should never struggle to activate controls.

---

# Motion Accessibility

Reduced motion preferences should be respected automatically.

Large movement should become subtle.

Critical transitions should remain understandable without animation.

Users should never lose context.

---

# Screen Reader Testing

Every major workflow should be verified using screen reader testing.

Examples include:

Create recipient

Generate card

Edit recipient

Configure Autopilot

Complete onboarding

Upgrade subscription

Search

Review notifications

Accessibility verification belongs within the implementation process.

---

# Component Implementation Standards

Every reusable component should satisfy identical engineering standards.

Components represent the building blocks of the application.

Consistency is mandatory.

---

# Component Responsibilities

Each component should own only one responsibility.

Examples:

Button submits actions.

Input collects information.

Card presents grouped content.

Badge communicates status.

Dialog collects focused interaction.

Avoid components performing unrelated responsibilities.

---

# Component Interface Design

Component APIs should remain intuitive.

Favor explicit props.

Avoid boolean explosion.

Prefer readable interfaces over highly abstract configuration objects.

Component usage should remain self explanatory.

---

# Default Behavior

Components should provide sensible defaults.

Developers should configure only what changes.

Avoid requiring repetitive configuration.

---

# Component Variants

Variants should remain finite.

Examples:

Primary

Secondary

Tertiary

Danger

Success

Ghost

Link

Avoid creating endless visual variants.

If new variants become common, revisit the design system rather than extending components indefinitely.

---

# Component Composition

Small components should combine into larger experiences.

Example:

Avatar

+

Status Badge

+

Relationship Health

+

Quick Actions

=

Recipient Summary Card

Composition should remain predictable.

---

# Component Isolation

Reusable components should never directly call backend services.

Components receive data.

Components emit events.

Higher layers coordinate behavior.

---

# Event Handling

Components should expose clear event callbacks.

Examples:

onClick

onSave

onCancel

onSearch

onRetry

Avoid hidden side effects.

---

# Component Documentation

Every reusable component should include documentation describing:

Purpose

Variants

Props

States

Accessibility behavior

Responsive behavior

Usage examples

Known limitations

Implementation notes

Documentation should evolve alongside components.

---

# Component Testing

Reusable components should support testing in isolation.

Tests should verify:

Rendering

Interaction

Keyboard support

Accessibility

Visual states

Loading

Errors

Edge cases

Behavior should remain deterministic.

---

# Visual Regression Testing

Shared components should participate in visual regression testing.

Unexpected appearance changes should be detected before release.

Minor visual inconsistencies should not accumulate over time.

---

# Component Versioning

Existing components should evolve rather than duplicate.

Avoid:

ButtonNew

ButtonV2

CardFinal

CardLatest

Replace implementations carefully while preserving clean architecture.

---

# Reusability Checklist

Before creating a new component, developers should ask:

Can an existing component solve this?

Can an existing variant be extended?

Is this behavior unique?

Will another screen need this?

If reuse is likely, build a reusable component first.

If reuse is unlikely, keep implementation local.

---

# Frontend Quality Standards

Every implemented screen should satisfy the same quality expectations.

No exceptions.

Consistency creates trust.

---

# Definition of Complete

A screen is not complete because it renders.

A screen is complete only when it satisfies:

Visual accuracy

Responsive behavior

Accessibility

Loading states

Empty states

Error states

Keyboard support

Animation

Performance

API integration

Quality assurance

Only then is implementation considered complete.



# Frontend Code Quality Standards

The frontend codebase should remain understandable by any experienced engineer joining the project.

Code should optimize for clarity over cleverness.

The easiest code to maintain is the code that requires the least explanation.

Implementation should prioritize readability, consistency, and explicit intent.

---

# Readability Principles

Code should answer three questions immediately.

What does this component do?

Where does its data come from?

What happens when the user interacts with it?

If those answers are not obvious within a few moments of reading the file, the implementation should be simplified.

---

# Naming Standards

Names should communicate intent.

Prefer descriptive names over abbreviated names.

Examples:

RecipientCard

RelationshipHealthPanel

UpcomingCardList

SuggestedActionTile

TimelineMemory

SearchResultsSection

Avoid vague names such as:

Data

Thing

Helper

Manager

Utils

Item

Component1

NewComponent

---

# File Naming

Files should follow consistent naming conventions.

Examples:

```

RecipientCard.tsx

RelationshipTimeline.tsx

UpcomingCards.tsx

DashboardHero.tsx

NotificationDrawer.tsx

RelationshipHealthRing.tsx

```

Styles, tests, and supporting files should share the same base name whenever practical.

---

# Folder Naming

Folders should describe business concepts rather than implementation details.

Examples:

```

RelationshipProfile

Calendar

Notifications

AIConcierge

Recipients

Dashboard

```

Avoid folders named:

```

Misc

General

Helpers

Random

Stuff

Other

```

---

# Function Size

Functions should remain focused.

Large functions typically indicate multiple responsibilities.

When functions become difficult to scan, divide them into smaller units with meaningful names.

---

# Component Size

Large components should become compositions of smaller components.

Examples:

DashboardScreen

↓

DashboardHero

UpcomingCards

QuickActions

ConciergeSuggestions

RelationshipSummary

ActivityFeed

Footer

This organization improves readability and testability.

---

# Hook Standards

Custom hooks should encapsulate reusable behavior.

Examples:

useRecipientSearch

useRelationshipTimeline

useCardGeneration

useNotificationCenter

useAutosave

Avoid hooks that attempt to solve unrelated problems simultaneously.

---

# Utility Functions

Utilities should remain pure whenever possible.

Utilities should not modify global state.

Utilities should not perform rendering.

Utilities should avoid hidden side effects.

Predictable utilities improve reliability.

---

# Constants

Magic numbers should not appear throughout implementation.

Examples include:

Spacing values

Animation timing

Character limits

Retry counts

Polling intervals

These values should originate from centralized constants or design tokens.

---

# Comments

Code should be understandable without excessive comments.

Comments should explain why.

Code should explain how.

Avoid comments that simply restate implementation.

Useful comments include:

Business constraints

Accessibility considerations

Performance rationale

Integration caveats

Temporary implementation notes

---

# Dead Code

Unused code should not remain in the repository.

Remove:

Unused components

Unused hooks

Unused styles

Unused imports

Unused constants

Unused feature flags

Keeping unused code increases maintenance complexity.

---

# Console Output

Debug logging should not appear in production.

Temporary debugging statements should be removed before release.

Operational logging should remain intentional and appropriately categorized.

---

# Dependency Management

Dependencies should remain minimal.

Before adding a package, determine:

Can existing code solve this?

Does another dependency already provide this capability?

Will long term maintenance justify the additional complexity?

Every dependency increases future maintenance obligations.

---

# Configuration Management

Configuration values should remain centralized.

Examples:

Environment settings

API endpoints

Feature flags

Application constants

Timeouts

Limits

Configuration should never be duplicated throughout the application.

---

# Feature Flags

Feature flags should support controlled rollout of future functionality.

Flags should remain temporary.

Completed rollouts should remove obsolete flags.

Avoid permanent accumulation of inactive feature toggles.

---

# Environment Separation

Development

Testing

Staging

Production

Each environment should maintain independent configuration.

Environment specific behavior should never require source code modification.

---

# Build Stability

Every production build should complete without:

Warnings

Type errors

Lint errors

Broken imports

Unused exports

Incomplete implementations

Production builds should represent release quality at all times.

---

# Linting Standards

Linting rules should remain strict.

Lint violations should be corrected rather than ignored.

Avoid disabling lint rules unless absolutely necessary and documented.

Consistency improves long term maintainability.

---

# Formatting Standards

Formatting should remain automatic.

Engineers should not debate formatting.

Formatting tools should enforce consistency.

Whitespace should improve readability.

Long expressions should remain easy to scan.

---

# Type Safety

Strong typing should exist throughout the application.

Component props

API models

Route parameters

Form models

Feature state

Theme definitions

Utility functions

Avoid unnecessary type assertions.

Prefer compile time safety over runtime discovery.

---

# Error Boundaries

Critical sections of the application should use error boundaries appropriately.

Unexpected rendering failures should degrade gracefully.

Users should receive helpful recovery guidance.

Application wide failures should remain extremely rare.

---

# Recovery Experience

When recoverable failures occur, users should receive options such as:

Retry

Return to dashboard

Refresh page

Contact support

Continue editing

Recovery should always preserve as much user work as possible.

---

# Logging Philosophy

Operational events may be logged for diagnostics.

Sensitive user information should never appear in logs.

Logs should remain structured.

Logs should support investigation without exposing private relationship data.

---

# Privacy by Default

Frontend implementation should expose only the information required for the current task.

Avoid displaying unnecessary personal information.

Avoid unnecessarily retaining sensitive information in memory after workflows complete.

Relationship trust depends upon thoughtful privacy.

---

# Security Implementation Standards

Security responsibilities primarily belong to the backend.

The frontend should reinforce those protections through responsible implementation.

---

# Secure Communication

Every backend request should use secure authenticated communication.

Authentication credentials should never appear in URLs.

Sensitive information should never be exposed through client side routing.

---

# Client Side Validation

Client side validation improves usability.

Backend validation remains authoritative.

Never rely exclusively on frontend validation for security.

---

# Sensitive Data Handling

Avoid persisting sensitive information unnecessarily.

Examples include:

Payment information

Authentication tokens

Private notes

Recipient memories

Temporary secrets

Only store information required to provide the intended experience.

---

# Authentication Awareness

Authentication state should remain centralized.

Protected routes should verify authentication before rendering protected content.

Expired sessions should redirect gracefully without data loss whenever possible.

---

# Authorization Awareness

Frontend authorization improves usability.

Backend authorization enforces security.

Users should never assume access merely because interface elements are visible.

---

# Secure Defaults

Sensitive actions should require deliberate user intent.

Examples include:

Delete recipient

Delete account

Cancel subscription

Place card order

Remove relationship history

Bulk administrative actions

Confirmation experiences should match documented interaction standards.

---

# Clipboard Usage

Copying sensitive information should remain intentional.

Clipboard operations should provide confirmation.

Sensitive data should never copy automatically.

---

# File Upload Standards

Uploads should validate:

Supported formats

Maximum size

Upload progress

Failure recovery

Cancellation

Successful completion

Uploads should remain resilient during unstable network conditions.

---

# Download Standards

Downloads should clearly communicate:

Preparing

Downloading

Completed

Failed

Users should never wonder whether an export is still processing.

---

# Browser Compatibility

The frontend should support all officially supported browsers documented for the product.

Behavior should remain consistent.

Minor visual differences are acceptable.

Functional differences are not.

---

# Progressive Degradation

Optional browser capabilities should enhance the experience.

Core workflows should never depend upon nonstandard browser features.

Users with supported browsers should always retain access to essential functionality.

---

# Release Readiness Verification

Every completed feature should satisfy implementation verification before release.

Verification should occur prior to merging into the primary production branch.

---

# Feature Completion Checklist

Every feature should verify:

Visual implementation matches specifications.

Responsive layouts behave correctly.

Accessibility requirements are satisfied.

Loading states exist.

Empty states exist.

Error handling exists.

Animations match motion standards.

Backend integration is complete.

Performance remains acceptable.

Copy matches approved content.

Quality assurance passes.

Only after satisfying every requirement should implementation be considered complete.

---

# Screen Completion Checklist

Every screen should verify:

Correct spacing.

Correct typography.

Correct color usage.

Correct navigation.

Correct focus management.

Correct responsive behavior.

Correct accessibility.

Correct transitions.

Correct component usage.

Correct API integration.

No placeholder content.

No temporary assets.

No debug controls.

Every production screen should appear completely intentional.

---

# Integration Verification

Every backend integration should verify:

Successful requests.

Validation failures.

Unauthorized responses.

Timeout behavior.

Network interruption.

Retry behavior.

Loading transitions.

Empty responses.

Unexpected server errors.

Frontend resilience is part of implementation quality.

---

# Final Frontend Acceptance Criteria

The frontend implementation should not be considered complete until every requirement in this playbook has been satisfied.

Specifically:

The frontend faithfully expresses the Relationship Concierge philosophy.

Every implemented screen matches the documented design specifications.

Every component references the Design System.

Every interaction follows the documented motion system.

Every workflow preserves existing backend behavior.

Every API contract remains unchanged.

Every integration with Authentication, Stripe, Handwrytten, AI pipelines, notifications, and business logic functions exactly as before.

Every loading, empty, success, and error state has been implemented.

Accessibility requirements have been satisfied throughout the application.

Performance objectives have been achieved.

Responsive behavior matches documented specifications.

No undocumented frontend behavior exists.

No implementation decisions have been left to interpretation.

The frontend should now function as a premium, polished, production ready presentation layer built upon the existing backend, expressing the complete vision of F.I. Forgot as a world class Relationship Concierge.



