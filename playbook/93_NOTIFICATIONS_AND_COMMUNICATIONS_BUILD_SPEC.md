# 93_NOTIFICATIONS_AND_COMMUNICATIONS_BUILD_[SPEC.md](http://SPEC.md)

## Purpose

This document defines the complete notification and communication system for F.I. Forgot.

Notifications exist to help users become more thoughtful without becoming distracted.

Every notification should feel like a helpful concierge.

Never like an alarm.

Never like marketing.

Never like spam.

The notification system spans every communication channel including:

* In App Notifications

* Notification Center

* Push Notifications

* Email

* SMS

* Badge Indicators

* Autopilot Communications

* Administrative Messages

* System Messages

This specification preserves all existing backend services, scheduling logic, automation engines, authentication, API contracts, Stripe integration, Handwrytten integration, and AI pipelines.

This document defines only the frontend behavior and user experience.

---

# Philosophy

A great Relationship Concierge communicates intentionally.

It does not interrupt unnecessarily.

It does not overwhelm.

It does not create anxiety.

It appears exactly when it is helpful.

Then quietly disappears.

Notifications should make users feel prepared.

Never guilty.

The objective is not engagement.

The objective is thoughtful action.

---

# Guiding Principles

Every notification should satisfy five questions.

Is it useful?

Is it timely?

Is it actionable?

Is it respectful?

Can it wait?

If the answer to the final question is yes, it should probably wait.

---

# Communication Hierarchy

Not every message deserves equal attention.

Priority determines channel selection, timing, presentation, sound, and persistence.

The hierarchy consists of five levels.

## Level 1

Critical

Examples:

Payment failed

Card cannot be mailed

Delivery issue

Authentication issue

Account security

These notifications may use:

In App

Email

Push

SMS when enabled

---

## Level 2

Important

Examples:

Card awaiting approval

Birthday approaching

Autopilot requires action

Address missing

Subscription renewal

Uses:

In App

Push

Email

---

## Level 3

Helpful

Examples:

Relationship Health improved

Memory added

Question available

Draft ready

Fresh Update available

Uses:

In App

Notification Center

Optional Push

---

## Level 4

Informational

Examples:

New feature

Autopilot completed

Timeline updated

Holiday suggestions

Uses:

Notification Center

Optional Email Digest

---

## Level 5

Passive

Examples:

Analytics updated

Health recalculated

AI improved draft

Administrative background work

Normally invisible.

---

# Communication Architecture

Every communication follows the same lifecycle.

```text

Trigger

↓

Priority Evaluation

↓

Channel Selection

↓

Preference Check

↓

Quiet Hour Check

↓

Deduplication

↓

Scheduling

↓

Delivery

↓

Tracking

↓

Interaction

↓

Analytics

↓

Archive

```

Every communication must be traceable.

---

# Notification Object

Each notification includes:

```text

notification_id

user_id

type

priority

category

channel

title

body

cta

status

read_state

created_at

scheduled_at

sent_at

opened_at

dismissed_at

expires_at

deep_link

metadata

```

---

# Notification Categories

Notifications belong to one primary category.

Relationship

Card

Autopilot

Recipient

Payment

Subscription

Delivery

Question

Reminder

Security

Account

Feature

Marketing

Administrative

System

Each category has unique icons, colors, and behaviors.

---

# Communication Types

Supported communication types include:

Informational

Reminder

Warning

Success

Confirmation

Approval Request

Failure

Achievement

Educational

System Status

Promotional

Transactional

Only transactional communications are mandatory.

---

# Notification Design Principles

Notifications should be:

Small

Calm

Actionable

Clear

Warm

Human

Never use technical language.

Avoid urgency unless genuinely necessary.

Avoid excessive punctuation.

Avoid emoji unless defined by the design system.

---

# Notification Copy Principles

Good notification:

Your anniversary card is ready for review.

Poor notification:

AI generation completed successfully.

Good notification:

One quick question could make Emma's birthday card much more personal.

Poor notification:

Profile Gap Question available.

Users should never feel like they are interacting with AI infrastructure.

---

# Communication Tone

Every notification follows the brand voice.

Warm.

Helpful.

Confident.

Professional.

Optimistic.

Never sarcastic.

Never manipulative.

Never guilt inducing.

Never clickbait.

---

# Notification Priority Matrix

Highest Priority

Security

Payment

Delivery failures

Authentication

High

Upcoming birthdays

Approval requests

Autopilot action

Medium

Questions

Relationship updates

Timeline improvements

Low

Tips

Feature announcements

Product education

Background improvements

Priority influences:

Delivery channel

Timing

Persistence

Badge behavior

Escalation



# In App Notifications

## Purpose

In App Notifications provide timely information while the user is actively using F.I. Forgot.

They should feel like helpful guidance rather than interruptions.

The goal is to support the user's current task, not distract them from it.

In App Notifications should always be secondary to the primary workflow.

---

# Philosophy

If the user is already in the app, there is rarely a reason to interrupt them aggressively.

Most notifications should quietly appear.

The user should discover them naturally.

Only high priority notifications should temporarily interrupt the current experience.

---

# Notification Types

The application supports five presentation styles.

Toast

Banner

Inline

Modal

Persistent Card

Each style has specific usage rules.

---

# Toast Notifications

Purpose

Confirm successful actions.

Examples:

Memory saved.

Recipient updated.

Card scheduled.

Draft regenerated.

Relationship updated.

Characteristics:

Appears briefly.

Bottom right on desktop.

Bottom center on mobile.

Automatically dismisses.

Does not block interaction.

Supports optional Undo where appropriate.

---

# Banner Notifications

Purpose

Communicate information requiring awareness but not immediate interruption.

Examples:

Your subscription renews tomorrow.

Three birthdays are approaching.

A delivery address needs attention.

Characteristics:

Displayed beneath the navigation bar.

Persistent until dismissed or resolved.

May contain one primary action.

May contain one dismiss action.

---

# Inline Notifications

Purpose

Provide contextual guidance within a screen.

Examples:

A recipient profile is missing recent updates.

Relationship Health could improve with one memory.

No greeting card has been selected.

Inline notifications should appear immediately adjacent to the relevant content.

They should never feel disconnected from the task.

---

# Modal Notifications

Purpose

Require an immediate user decision.

Reserved for:

Security events.

Critical payment failures.

Major subscription issues.

Irreversible actions.

Modals should be rare.

The product should avoid training users to dismiss popups.

---

# Persistent Cards

Purpose

Represent important work requiring future attention.

Examples:

Birthday card awaiting approval.

Autopilot needs review.

Payment method expired.

Recipient missing address.

Persistent cards remain visible until resolved.

---

# Notification Placement

Desktop

Toast

Bottom right.

Banner

Directly below the application header.

Inline

Within page content.

Persistent cards

Dashboard.

Notification Center.

Relevant workflow screens.

Mobile

Toast

Bottom center.

Banner

Top of viewport beneath navigation.

Inline

Inside content flow.

Persistent cards

Dashboard.

Notification Center.

---

# Animation

Notifications should animate smoothly.

Entrance:

Fade.

Slight upward movement.

Approximately 200 milliseconds.

Exit:

Fade.

Downward movement.

Approximately 150 milliseconds.

Critical notifications should never shake or flash.

Animation should reinforce calmness.

---

# Stacking Rules

Maximum visible toast notifications:

Desktop

Three.

Mobile

Two.

Additional notifications enter a queue.

The oldest notification exits first.

---

# Duplicate Prevention

The system should suppress duplicate notifications.

Examples:

Three successful saves in rapid succession should appear as:

Changes saved.

Instead of:

Recipient updated.

Relationship updated.

Memory updated.

Duplicate approval reminders should merge into a single notification whenever possible.

---

# Notification Actions

Notifications may contain:

Primary action.

Secondary action.

Dismiss.

Undo.

Examples:

Review Card

Update Address

Answer Question

View Recipient

Retry Payment

Undo Delete

Every action should deep link directly to the appropriate destination.

---

# Expiration

Toast

Automatically expire.

Banner

Remain until dismissed or resolved.

Inline

Remain while relevant.

Persistent Cards

Remain until action completed.

Expired notifications should remain available in Notification Center when appropriate.

---

# Notification Center

## Purpose

The Notification Center serves as the permanent home for all meaningful user communications.

It allows users to review important updates they may have missed.

It functions as an inbox for concierge activity.

---

# Philosophy

The Notification Center should feel organized.

Never overwhelming.

Never cluttered.

Users should immediately understand:

What happened.

Why it matters.

What requires action.

---

# Entry Point

Accessible from the global header.

Desktop

Bell icon.

Mobile

Notification tab or bell icon.

Unread count displayed as badge.

---

# Layout

Sections include:

Unread

Today

Yesterday

Earlier This Week

Older

Notifications grouped chronologically.

Newest first.

---

# Notification Card Structure

Each notification card contains:

Category icon.

Title.

Short description.

Timestamp.

Priority indicator.

Primary action.

Optional secondary action.

Read indicator.

Dismiss action.

---

# Category Icons

Relationship

Card

Autopilot

Payment

Delivery

Reminder

Security

Question

Subscription

System

Icons remain consistent throughout the application.

---

# Grouping

Related notifications should intelligently group.

Example:

Instead of:

Birthday reminder.

Draft ready.

Recipient updated.

Display:

Sophia's birthday is approaching.

Draft ready for review.

Recipient updated recently.

Grouped conversations reduce clutter.

---

# Filtering

Users may filter by:

Unread.

Cards.

Recipients.

Autopilot.

Payments.

Questions.

Relationship.

System.

All.

Filter state persists during the current session.

---

# Search

Notification Center supports search.

Searchable fields include:

Recipient.

Occasion.

Category.

Title.

Body.

Search should update instantly.

---

# Read State

Notifications have four states.

Unread.

Read.

Archived.

Dismissed.

Unread notifications receive visual emphasis.

Read notifications become more subtle.

---

# Mark As Read

Users may:

Open notification.

Mark individually.

Mark all as read.

Mark selected notifications as read.

State changes should synchronize across devices.

---

# Archive

Users may archive notifications.

Archived notifications remain searchable.

Administrative notifications may bypass archival depending on policy.

---

# Delete

Most notifications should not be permanently deleted.

Dismissing removes them from active view.

System records remain preserved for analytics and audit purposes.

---

# Notification Detail View

Selecting a notification expands additional information.

Examples:

Card preview.

Recipient summary.

Payment explanation.

Delivery timeline.

Relationship context.

Notification details should avoid overwhelming the user.

---

# Badge Count

The Notification Center badge represents unread actionable notifications.

Passive informational messages should not increase the badge count.

Badge updates should synchronize immediately across devices.

---

# Empty State

When there are no notifications:

Illustration.

Headline:

You're all caught up.

Supporting text:

We'll let you know whenever something needs your attention.

Optional CTA:

Go to Your People.

---

# Loading State

Display skeleton cards matching the final layout.

Avoid generic loading spinners.

Loading should preserve layout stability.

---

# Error State

Friendly messaging.

Example:

We couldn't load your notifications.

Primary action:

Try Again.

Secondary action:

Return Home.

Technical errors should never be exposed.

---

# Retention

Representative retention policy:

Unread

Remain until read.

Read

Remain for configurable duration.

Archived

Retained according to system policy.

Critical security notifications may have independent retention requirements.

Retention behavior should remain configurable by administrators.

---

# Synchronization

Notification Center synchronizes in real time across:

Desktop.

Mobile.

Tablet.

Future platforms.

Reading a notification on one device immediately updates every other signed in session.

---

# Performance

The Notification Center should:

Load incrementally.

Support pagination.

Virtualize long histories.

Lazy load older notifications.

Maintain smooth scrolling regardless of history size.

The experience should remain responsive even for users with years of notification history.



# Push Notifications

## Purpose

Push Notifications extend the Relationship Concierge beyond the application.

They are intended to surface only the most valuable and time sensitive events.

Every push notification should answer one question:

"Will the user appreciate receiving this right now?"

If the answer is uncertain, the notification should remain inside the application instead.

---

# Philosophy

Push notifications interrupt someone's day.

That interruption should always feel worthwhile.

The goal is to remind.

Not to pressure.

Not to create fear of missing out.

Not to drive artificial engagement.

Users should look forward to receiving notifications from F.I. Forgot because they consistently provide value.

---

# Eligible Events

Representative push notification events include:

Birthday approaching.

Anniversary approaching.

Card awaiting approval.

Card delivery confirmed.

Payment issue.

Address required.

Autopilot requires review.

Recipient question available.

Security alert.

Account sign in from new device.

Critical service interruption.

Routine analytics, background processing, and marketing updates should never generate push notifications by default.

---

# Push Notification Structure

Every push notification contains:

Application icon.

Title.

Body.

Optional image.

Primary action.

Deep link.

Timestamp.

Category.

Priority.

---

# Character Guidelines

Recommended limits:

Title

Maximum 50 characters.

Body

Maximum 120 characters.

Content should remain concise while preserving warmth.

---

# Examples

Birthday Reminder

Title

Emma's birthday is coming up

Body

Your personalized card is ready whenever you are.

Action

Review Card

---

Card Ready

Title

Your card is ready

Body

Take one quick look before we mail it.

Action

Review Draft

---

Delivery Confirmation

Title

Your card is on its way

Body

We'll let you know when it arrives.

Action

Track Delivery

---

Payment Issue

Title

We couldn't process your payment

Body

Update your payment method to avoid delivery delays.

Action

Update Payment

---

# Push Timing

Notifications should arrive when users are most likely to respond.

General timing principles:

Avoid overnight delivery.

Avoid very early mornings.

Avoid major holidays unless directly relevant.

Avoid clustering multiple pushes together.

Respect user behavior patterns when available.

---

# Intelligent Scheduling

The system should evaluate:

User time zone.

Previous engagement.

Quiet hours.

Upcoming deadlines.

Urgency.

Recipient importance.

Delivery lead time.

The goal is delivering at the most helpful moment rather than the earliest possible moment.

---

# Notification Bundling

If multiple events occur together, combine them.

Instead of:

Sophia's birthday is coming.

James's birthday is coming.

Dad's birthday is coming.

Display:

You have three important occasions coming up.

Action

View Calendar

Bundling reduces notification fatigue.

---

# Push Frequency Limits

Recommended limits:

Critical

Unlimited when justified.

High Priority

Maximum two per day.

Medium Priority

Maximum one per day.

Low Priority

Prefer Notification Center instead.

Frequency limits remain configurable.

---

# Push Expiration

Notifications should expire when no longer useful.

Examples:

Birthday reminder expires after the birthday passes.

Approval reminder expires once approved.

Payment notification expires after payment succeeds.

Expired notifications should not be delivered.

---

# Rich Push Notifications

Supported where platform capabilities allow.

Examples include:

Card artwork.

Recipient avatar.

Delivery progress.

Celebration imagery.

Rich media should enhance, never replace, clear messaging.

---

# Action Buttons

Representative actions include:

Review Card.

Approve Card.

Answer Question.

Update Address.

Update Payment.

View Recipient.

Open Calendar.

Buttons should deep link directly into the appropriate workflow.

---

# Push Permission Flow

Push permission should never be requested immediately after account creation.

Instead:

Allow users to experience value first.

Then explain why notifications matter.

Example messaging:

Stay ahead of birthdays and anniversaries with thoughtful reminders at the right time.

Primary Action

Enable Notifications

Secondary Action

Maybe Later

---

# Permission States

Unknown.

Granted.

Denied.

Restricted.

Unsupported.

Frontend behavior adapts automatically.

---

# Re Permission Strategy

If permission has been denied:

Avoid repeated prompts.

Instead display subtle educational reminders inside Settings or Notification Preferences.

Respect the user's decision.

---

# Push Analytics

Track:

Delivered.

Opened.

Dismissed.

Expired.

Action selected.

Deep link destination.

Open rate.

Response time.

Delivery failures.

---

# Badge Behavior

## Purpose

Application badges provide passive awareness without interruption.

Badges communicate outstanding actions rather than historical events.

---

# Philosophy

Badges should create clarity.

Not anxiety.

A user should never open the application simply to clear a badge.

Badges should represent meaningful unfinished work.

---

# Badge Eligible Items

Examples include:

Unread actionable notifications.

Cards awaiting approval.

Payment issues.

Delivery exceptions.

Security alerts.

Missing recipient addresses.

Autopilot requiring review.

---

# Badge Exclusions

Do not badge:

Marketing messages.

Relationship Health improvements.

Completed deliveries.

Background AI activity.

Analytics updates.

Educational tips.

Passive reminders.

---

# Badge Prioritization

If multiple badge categories exist simultaneously:

Security overrides everything.

Payment.

Cards requiring approval.

Delivery issues.

Unread actionable notifications.

Only one badge count should appear on the application icon.

---

# Badge Count Rules

Badge count represents:

Outstanding actionable items.

Not total unread notifications.

Example:

Ten informational notifications.

One approval request.

Badge count should display:

1

---

# Badge Synchronization

Badge counts synchronize across:

Desktop.

Mobile.

Tablet.

Web.

Counts update immediately after user interaction.

---

# Badge Clearing

Badges clear when:

Action completed.

Notification resolved.

Item archived.

Issue automatically resolved.

Opening the app alone should not clear badges.

Resolution clears badges.

---

# Read and Unread States

## Philosophy

Read state should accurately reflect user attention.

Opening the Notification Center should not automatically mark every notification as read.

Only intentional interaction should update state.

---

# State Definitions

Unread

User has not opened or acknowledged.

Read

User viewed notification.

Acknowledged

User interacted with notification.

Completed

Underlying task resolved.

Archived

User intentionally removed from active list.

---

# Visual Treatment

Unread

Bold title.

Colored indicator.

Higher contrast.

Read

Normal weight.

Reduced emphasis.

Archived

Muted appearance.

Not shown by default.

---

# Automatic Read Rules

Notifications become read when:

Opened from Notification Center.

Opened from push notification.

Opened from email deep link.

Explicitly marked as read.

Scrolling past a notification should not automatically mark it as read.

---

# Read Synchronization

Read state updates immediately across all active sessions.

Offline devices synchronize upon reconnection.

---

# Read History

The system records:

Read timestamp.

Read source.

Device type.

Interaction path.

This supports analytics and debugging.

---

# Bulk Actions

Users may:

Mark selected as read.

Mark all as read.

Archive selected.

Archive all read notifications.

Bulk actions should require no confirmation except where critical notifications are involved.

---

# Deep Linking Behavior

## Purpose

Every notification should take users directly to the relevant experience.

The destination should minimize friction.

Never force users to search for the item referenced.

---

# Deep Link Destinations

Examples include:

Recipient Profile.

Card Draft.

Calendar.

Autopilot.

Payment Settings.

Subscription Management.

Delivery Tracking.

Relationship Timeline.

Notification Preferences.

Security Settings.

---

# Deep Link Rules

The destination should:

Authenticate if necessary.

Restore appropriate navigation state.

Highlight the relevant content.

Dismiss the originating notification when appropriate.

Support mobile and desktop consistently.

---

# Missing Content

If the referenced item no longer exists:

Display a friendly explanation.

Offer related navigation.

Avoid dead ends.

Example:

That card is no longer available.

Return to Your Cards.

---

# Deferred Deep Links

If the application is closed:

Opening a notification should launch the application.

Authenticate if required.

Continue directly to the intended destination after authentication.

---

# Analytics

Deep links record:

Notification source.

Destination.

Open timestamp.

Completion status.

Navigation success.

This information supports optimization of future communication strategies.



# Notification Preferences

## Purpose

Notification Preferences give users complete control over how, when, and where F.I. Forgot communicates with them.

The objective is personalization, not maximum notification volume.

Users should feel confident that the application respects their attention.

---

# Philosophy

A thoughtful concierge adapts to the client.

Some users want every reminder.

Others only want critical updates.

Neither preference is more correct.

The system should make these choices simple to understand and easy to change.

---

# Preference Structure

Notification preferences are organized into four sections.

Channels

Categories

Timing

Advanced Controls

This structure minimizes cognitive load while remaining comprehensive.

---

# Default Configuration

New users begin with carefully selected defaults.

Critical notifications

Enabled.

Upcoming important occasions

Enabled.

Card approval reminders

Enabled.

Delivery updates

Enabled.

Relationship suggestions

Enabled.

Product announcements

Disabled.

Marketing communications

Disabled unless explicitly opted in.

Defaults should prioritize usefulness while respecting user attention.

---

# Channel Preferences

Users may independently enable or disable:

In App

Push

Email

SMS

Each channel should clearly explain what types of communication it delivers.

---

# Channel Configuration

Each channel includes:

Status

Description

Last updated

Permission status

Platform availability

Test notification action where appropriate

---

# Category Preferences

Users may manage notifications by category.

Relationship Updates

Card Activity

Upcoming Occasions

Autopilot

Questions

Timeline Activity

Delivery

Payments

Subscriptions

Security

System Status

Marketing

Product Updates

Every category displays a concise explanation.

---

# Category Controls

Each category supports:

Enabled

Disabled

Channel selection

Frequency when applicable

Categories should inherit global channel settings unless explicitly overridden.

---

# Timing Preferences

Users may customize:

Reminder timing

Approval reminder frequency

Birthday lead time

Anniversary lead time

Holiday reminders

Digest schedule

Quiet hours

Weekend behavior

Timing controls should be easy to understand.

Avoid technical scheduling language.

---

# Reminder Lead Times

Representative options:

Same day

Three days

Seven days

Fourteen days

Thirty days

Custom values may be supported in the future.

---

# Smart Timing

Users may enable:

Let F.I. Forgot choose the best time.

When enabled, the AI considers:

Previous engagement

Time zone

Work hours

Historical interaction

Occasion urgency

Quiet hours

Smart Timing should remain optional.

---

# Quiet Hours

## Purpose

Quiet Hours prevent noncritical communications during periods when users prefer not to be interrupted.

---

# Philosophy

Respect is part of the product.

Notifications should adapt to the user's life rather than expecting the user to adapt to the application.

---

# Quiet Hour Configuration

Users may configure:

Start time

End time

Time zone

Weekend schedule

Vacation mode

Critical notification exceptions

---

# Behavior

During Quiet Hours:

Routine reminders wait.

Relationship suggestions wait.

Marketing waits.

Educational messages wait.

Only critical notifications may bypass Quiet Hours when appropriate.

---

# Vacation Mode

Vacation Mode temporarily pauses:

Reminders

Suggestions

Questions

Relationship prompts

Marketing

Users may define:

Start date

End date

Automatic resume

Vacation Mode should never suppress:

Security alerts

Payment failures

Critical delivery issues

---

# Time Zone Handling

Quiet Hours always follow the user's current time zone.

If travel is detected or manually updated, schedules automatically adjust.

---

# Quiet Hour Preview

The settings screen should display:

Notifications will pause daily between 10:00 PM and 7:00 AM.

This helps users understand the active schedule.

---

# Digest Notifications

## Purpose

Digest Notifications consolidate multiple low priority communications into a single experience.

Digests reduce notification fatigue while keeping users informed.

---

# Philosophy

Rather than sending five reminders, send one thoughtful summary.

The digest should feel like a daily briefing from a concierge.

---

# Digest Types

Daily

Weekly

Monthly

Holiday Preview

Upcoming Occasion Summary

Relationship Summary

Autopilot Summary

---

# Daily Digest

Representative content:

Upcoming birthdays

Cards awaiting review

Questions available

Recent deliveries

Relationship improvements

No more than one daily digest should be delivered.

---

# Weekly Digest

Representative content:

Upcoming celebrations

Relationship activity

Autopilot progress

Cards sent

Questions answered

Suggested next actions

---

# Monthly Digest

Representative content:

Relationships strengthened

Cards delivered

Upcoming important dates

Autopilot performance

Product improvements where appropriate

---

# Digest Layout

Each digest contains:

Greeting

Summary

Key actions

Upcoming events

Relationship insights

Primary CTA

Footer

Digests should remain concise.

---

# Digest Timing

Users may choose:

Morning

Afternoon

Evening

Or enable Smart Timing.

---

# Digest Suppression

Skip digest delivery when:

No meaningful activity exists.

User recently completed all actions.

Vacation Mode active.

Digest would duplicate recent notifications.

---

# Real Time Notifications

## Purpose

Real Time Notifications immediately inform users of events requiring prompt awareness.

---

# Eligible Events

Card approved.

Card shipped.

Card delivered.

Payment failed.

Payment succeeded.

Subscription renewed.

Security event.

New device login.

Critical Autopilot issue.

Most relationship suggestions should not be delivered in real time.

---

# Delivery Principles

Real time notifications should be:

Immediate.

Relevant.

Actionable.

Concise.

Reliable.

---

# Real Time Synchronization

Notifications synchronize instantly across:

Notification Center

Application badge

Push notifications

Web sessions

Mobile sessions

Users should never receive duplicate real time alerts for the same event.

---

# Reminder Strategy

## Purpose

Reminder Strategy determines how F.I. Forgot gently helps users avoid forgetting meaningful occasions.

---

# Philosophy

Reminders should create preparedness.

Not guilt.

The user should feel supported rather than pressured.

---

# Reminder Types

Upcoming birthday.

Upcoming anniversary.

Holiday preparation.

Card awaiting approval.

Recipient missing address.

Autopilot review.

Question reminder.

Subscription renewal.

Payment update.

---

# Reminder Schedule

Representative schedule:

Thirty days before

Relationship preparation.

Fourteen days before

Card planning.

Seven days before

Draft reminder.

Three days before

Approval reminder.

Day of

Final reminder when appropriate.

Timing remains configurable by occasion.

---

# Intelligent Reminder Suppression

Suppress reminders when:

Card already approved.

Recipient archived.

Occasion cancelled.

Reminder recently dismissed.

Vacation Mode active.

Action already completed.

---

# Escalation

Example:

Initial reminder

Friendly.

Second reminder

Slightly more direct.

Final reminder

Clear explanation of consequence.

Tone should never become aggressive.

---

# AI Assisted Reminder Selection

The AI may adjust reminders based on:

Relationship importance.

Historical user behavior.

Approval habits.

Shipping deadlines.

Seasonality.

Smart Timing.

The objective is fewer, better reminders.

---

# Snooze

Users may snooze reminders.

Representative options:

Tomorrow.

Three days.

Next week.

Custom date.

Snoozed reminders retain their original priority.

---

# Reminder History

Every reminder records:

Created.

Delivered.

Opened.

Dismissed.

Snoozed.

Completed.

Expired.

History supports analytics and future optimization.



# AI Generated Notification Copy

## Purpose

Many notifications within F.I. Forgot are dynamically generated using relationship context, recipient context, occasion context, and user activity.

The AI Generated Notification Copy system ensures these communications remain warm, useful, and concise while preserving a consistent brand voice.

Unlike greeting cards, notifications should never attempt to be deeply emotional.

Their purpose is to encourage action.

---

# Philosophy

A notification should never compete with the greeting card.

The card is where emotion lives.

Notifications should simply guide the user toward thoughtful action.

Examples:

Good

Emma's birthday is next week. Your draft is ready whenever you'd like to review it.

Poor

Don't let Emma think you forgot her birthday again.

The system must never use guilt, shame, fear, or manipulation.

---

# Copy Principles

Every notification should be:

Helpful

Clear

Actionable

Warm

Respectful

Short

Human

Optimistic

---

# Writing Rules

Prefer:

Natural language.

Simple sentences.

Positive framing.

Direct calls to action.

Avoid:

Marketing language.

Technical terminology.

Clickbait.

Artificial urgency.

Excessive punctuation.

Emoji unless defined by the design system.

---

# Personalization

Notifications may reference:

Recipient name.

Occasion.

Relationship type.

Card status.

Timeline activity.

Recent memory.

Autopilot state.

Examples:

Sophia's birthday is almost here.

Dad's Father's Day card is ready.

You recently added a great memory about your trip together. Want to include it?

Personalization should remain subtle.

---

# Dynamic Variables

Representative variables include:

```text

recipient_name

occasion_name

relationship_type

days_until_event

card_status

delivery_status

relationship_health

autopilot_state

question_count

memory_count

```

Variables should degrade gracefully if unavailable.

---

# Length Guidelines

Push

One sentence.

Email subject

Short and descriptive.

In App

One to two sentences.

Notification Center

Two to three sentences maximum.

---

# Tone Variations

Different categories require different emotional tone.

Birthday Reminder

Encouraging.

Payment Issue

Professional.

Delivery Confirmation

Reassuring.

Security Alert

Clear.

Relationship Suggestion

Curious.

Autopilot Update

Confident.

---

# Localization

Notification copy should support localization.

Variables should remain independent of translated content.

Pluralization rules must support all supported languages.

---

# Actionable Notifications

## Purpose

Every actionable notification should lead directly to the next meaningful task.

Users should never have to search for what the notification references.

---

# Action Types

Representative actions include:

Review Card.

Approve Card.

Answer Question.

Add Memory.

Update Address.

Update Payment.

View Recipient.

Track Delivery.

Renew Subscription.

Review Timeline.

---

# Action Design

Each notification should have:

One primary action.

Optional secondary action.

Dismiss.

Avoid presenting too many choices.

---

# Context Preservation

When users follow an action:

Application state should restore automatically.

Relevant recipient should already be selected.

Relevant draft should already be open.

Relevant timeline position should already be visible.

---

# Completion Detection

After the action completes:

Notification resolves automatically.

Badge updates.

Notification Center refreshes.

Analytics record completion.

---

# Deferred Completion

If the user exits before completing:

The notification remains active.

Progress is preserved where appropriate.

---

# Communication Templates

## Purpose

Templates provide a consistent foundation for all outbound communication.

Templates separate:

Content.

Branding.

Layout.

Variables.

Localization.

Accessibility.

---

# Template Categories

Notification.

Push.

Email.

SMS.

System banner.

Modal.

Marketing.

Transactional.

Administrative.

---

# Template Structure

Each template contains:

Header.

Title.

Body.

Primary CTA.

Secondary CTA.

Footer.

Metadata.

Tracking identifiers.

Templates should remain modular.

---

# Shared Components

Reusable components include:

Application logo.

Brand colors.

Typography.

Button styles.

Footer.

Legal text.

Social links where applicable.

Preference links.

---

# Variable System

Templates support placeholder variables.

Example:

```text

{{recipient_name}}

{{occasion}}

{{card_status}}

{{delivery_date}}

{{tracking_link}}

{{user_name}}

```

Missing variables should fail gracefully.

---

# Email Template System

## Purpose

Emails represent the most detailed communication channel within F.I. Forgot.

They should reinforce trust and professionalism.

Every email should feel like it came from a premium concierge service.

---

# Design Principles

Responsive.

Accessible.

Minimal.

Elegant.

Readable.

Consistent.

Warm.

---

# Email Layout

Standard structure:

Header.

Headline.

Supporting copy.

Primary CTA.

Optional secondary content.

Footer.

Legal information.

Preference management.

---

# Header

Contains:

Logo.

Brand identity.

Optional category indicator.

Avoid excessive navigation.

---

# Body

Readable width.

Large typography.

Comfortable spacing.

Single primary objective.

Minimal distractions.

---

# Footer

Includes:

Support link.

Notification preferences.

Privacy policy.

Terms.

Company address where required.

Unsubscribe when applicable.

---

# Email Themes

System.

Relationship.

Card.

Autopilot.

Subscription.

Payment.

Delivery.

Marketing.

Each uses consistent branding.

---

# Responsive Behavior

Desktop

Centered content.

Maximum readable width.

Mobile

Single column.

Large tap targets.

Readable typography.

No horizontal scrolling.

---

# Dark Mode

Email templates should support:

Dark mode friendly colors.

Transparent logos where appropriate.

Accessible contrast.

Readable buttons.

---

# Images

Images should be optional.

Emails must remain fully understandable with image loading disabled.

---

# Accessibility

Emails should include:

Semantic structure.

Descriptive link text.

Accessible button labels.

Appropriate heading hierarchy.

Readable contrast.

Keyboard friendly interactions where supported.

---

# Transactional Emails

## Purpose

Transactional emails communicate required account activity.

They are mandatory communications.

Users cannot unsubscribe from them while maintaining an active account.

---

# Transactional Categories

Account verification.

Password reset.

Card approval.

Card shipped.

Card delivered.

Payment receipt.

Payment failure.

Subscription confirmation.

Subscription renewal.

Address issue.

Security event.

System outage.

---

# Delivery Expectations

Transactional emails should be:

Reliable.

Immediate.

Clearly branded.

Action focused.

Consistent.

---

# Subject Line Principles

Examples:

Your birthday card is ready

Your payment was successful

Action needed before we mail your card

Your card has been delivered

Subjects should be descriptive rather than promotional.

---

# Transactional CTA

Every email should have one clear action.

Examples:

Review Card.

Update Payment.

Track Delivery.

Reset Password.

Verify Email.

Multiple competing calls to action should be avoided.

---

# Email Analytics

Track:

Delivered.

Opened.

Clicked.

Bounced.

Spam complaint.

Unsubscribed where applicable.

Device type.

Email client.

Time to open.

Time to click.

Analytics should support continuous improvement without compromising user privacy.



# Marketing Emails

## Purpose

Marketing emails introduce new features, educational content, seasonal ideas, and product improvements.

Unlike transactional emails, marketing emails are always optional.

The product should earn permission to communicate.

Never assume it.

---

# Philosophy

Marketing should feel like thoughtful advice from a concierge.

Not like advertising.

Every email should provide genuine value even if the recipient never clicks a button.

The goal is long term trust.

Not short term engagement.

---

# Eligible Marketing Topics

New product features.

Seasonal card ideas.

Holiday planning.

Relationship tips.

Thoughtful communication advice.

Product announcements.

Educational content.

Major improvements.

Community stories when applicable.

---

# Ineligible Topics

Artificial urgency.

Daily promotions.

Repeated discount campaigns.

Clickbait.

Fear based messaging.

Manipulative countdowns.

Notifications designed only to increase usage.

---

# Frequency

Recommended defaults:

No more than one marketing email per week.

Important product announcements may override this recommendation.

Users should always retain complete control through Notification Preferences.

---

# Subject Line Guidelines

Good examples:

A few thoughtful ideas for Father's Day

A new way to make every birthday card more personal

See what's new in F.I. Forgot

Avoid:

Last chance

Act now

Don't miss out

Urgent

Open immediately

---

# Content Structure

Header.

Introduction.

Educational content.

Primary feature.

Optional secondary feature.

Call to action.

Footer.

Preference management.

---

# Seasonal Campaigns

Marketing emails may support:

Valentine's Day.

Mother's Day.

Father's Day.

Graduation season.

Wedding season.

Thanksgiving.

Christmas.

New Year.

Campaigns should begin early enough for users to take action without creating unnecessary urgency.

---

# Subscription Emails

## Purpose

Subscription emails communicate account and billing information.

They help users understand the status of their subscription without requiring them to visit the application.

---

# Categories

Trial started.

Trial ending.

Subscription activated.

Subscription renewed.

Subscription upgraded.

Subscription downgraded.

Subscription cancelled.

Subscription expired.

Payment reminder.

Invoice available.

---

# Tone

Professional.

Clear.

Reassuring.

Never sales focused.

---

# Trial Communication

Representative sequence:

Welcome.

Midpoint reminder.

Upcoming trial expiration.

Trial ended.

Messages should explain what happens next without pressure.

---

# Renewal Communication

Users should receive confirmation when:

Subscription renews successfully.

Renewal fails.

Payment method requires updating.

Future renewal dates should always be clearly displayed.

---

# Cancellation Confirmation

Cancellation emails should include:

Effective date.

Current access period.

What happens next.

Reactivation option.

Support information.

Cancellation should never trigger aggressive win back messaging.

---

# Payment Emails

## Purpose

Payment emails provide clear records of financial activity.

They reinforce trust through transparency.

---

# Payment Categories

Receipt.

Invoice.

Refund.

Failed payment.

Payment method updated.

Renewal payment.

Charge confirmation.

---

# Required Information

Payment emails should clearly display:

Transaction date.

Amount.

Currency.

Description.

Reference number where appropriate.

Support contact.

No unnecessary technical details should be included.

---

# Failed Payment

The message should explain:

What happened.

Whether the card was charged.

What action is required.

Whether any services are affected.

Primary CTA:

Update Payment Method.

---

# Refund Confirmation

Include:

Amount refunded.

Expected processing time.

Original payment method.

Support information.

---

# Autopilot Emails

## Purpose

Autopilot emails keep users informed about automated relationship management.

They should reinforce confidence without overwhelming the user.

---

# Categories

Autopilot enabled.

Upcoming draft ready.

Approval required.

Card scheduled.

Card mailed.

Autopilot paused.

Autopilot error.

Autopilot recommendation.

---

# Approval Request

Representative structure:

Headline.

Recipient.

Occasion.

Shipping deadline.

Primary CTA.

The email should make reviewing the draft effortless.

---

# Scheduled Confirmation

Examples:

Your anniversary card has been scheduled.

We'll take care of the rest.

Include:

Recipient.

Occasion.

Estimated mailing date.

Expected arrival window.

---

# Autopilot Pause

Explain:

Why Autopilot paused.

Required action.

How to resume.

Avoid technical language.

---

# Card Status Notifications

## Purpose

Card Status Notifications provide visibility into every major stage of the greeting card lifecycle.

Users should always know where their card stands.

---

# Supported Statuses

Draft Started.

Draft Ready.

Awaiting Approval.

Approved.

Scheduled.

Preparing for Mailing.

Sent to Handwrytten.

In Production.

Mailed.

Delivered.

Delivery Exception.

Cancelled.

---

# Status Timeline

Each status should display:

Current stage.

Completed stages.

Estimated next step.

Expected timing.

The experience should feel reassuring rather than logistical.

---

# Status Messaging

Examples:

Your draft is ready.

Your handwritten card is being prepared.

Your card has been mailed.

Your card was delivered.

Messages should remain concise.

---

# Delivery Notifications

## Purpose

Delivery notifications confirm the progress of physical greeting cards.

These communications should provide confidence without unnecessary detail.

---

# Delivery Stages

Preparing.

Handwrytten processing.

Mailed.

Out for delivery when available.

Delivered.

Delivery exception.

Returned.

---

# Delivery Details

Where available, include:

Recipient.

Occasion.

Estimated delivery.

Tracking link if supported.

Support information.

---

# Delivery Confirmation

Celebrate completion.

Example:

Your birthday card has arrived.

Hopefully it helped make someone's day a little brighter.

The tone should remain warm and understated.

---

# Delivery Exceptions

Examples:

Address issue.

Carrier delay.

Returned mail.

Unable to deliver.

The message should clearly explain the next recommended action.

---

# Failure Notifications

## Purpose

Failure notifications explain when something prevents the normal experience.

The objective is clarity.

Not blame.

---

# Philosophy

Every failure message should answer:

What happened?

What does it mean?

What should I do next?

---

# Failure Categories

Payment.

Address.

Generation.

Delivery.

Authentication.

Subscription.

Security.

Network.

System.

---

# User Facing Language

Good:

We couldn't prepare your card right now.

Please try again in a few minutes.

Poor:

Prompt orchestration failed.

---

# Recovery Guidance

Every failure should include:

Clear explanation.

Recommended action.

Support option when appropriate.

Estimated recovery if known.

---

# Retry Messaging

If automatic recovery is already occurring:

Display:

We're working on it.

No action is needed right now.

Avoid asking users to retry unnecessarily.

---

# Persistent Failures

If recovery is not possible:

Provide:

Explanation.

Primary action.

Alternative path.

Support link.

Never leave the user without a next step.

---

# Failure Severity

Informational.

Warning.

Action Required.

Critical.

Severity determines:

Presentation.

Persistence.

Notification channel.

Escalation.

---

# Communication State Machine

Every communication progresses through defined lifecycle states.

```text

Created

↓

Queued

↓

Scheduled

↓

Sent

↓

Delivered

↓

Opened

↓

Clicked

↓

Completed

or

Expired

or

Failed

or

Cancelled

```

Each transition should be timestamped and auditable.

---

# Communication Expiration

Communications should automatically expire when they are no longer useful.

Examples:

Birthday reminders after the birthday.

Resolved payment failures.

Completed approval requests.

Old delivery updates.

Expired communications remain available in historical analytics when appropriate.

---

# Communication Consistency

Regardless of channel, users should experience:

Consistent wording.

Consistent branding.

Consistent visual hierarchy.

Consistent calls to action.

Consistent recipient naming.

Consistent terminology.

The same event should never be described differently across Push, Email, SMS, and In App messaging without a deliberate reason.



# SMS Notifications

## Purpose

SMS is reserved for the highest value, most time sensitive communications.

Because text messages are highly personal and intrusive, they should be used sparingly.

Every SMS should provide immediate value.

---

# Philosophy

SMS is a privilege.

Not a marketing channel.

Users should never feel that F.I. Forgot is texting them unnecessarily.

If the communication can wait for email or an in app notification, it probably should.

---

# Eligible SMS Categories

Representative categories include:

Critical payment failure.

Card approval required before mailing deadline.

Delivery exception requiring immediate action.

Security verification.

Account recovery.

Optional birthday reminder when explicitly enabled.

All other communication should default to Push, Email, or In App notifications.

---

# Opt In

SMS must always require explicit user consent.

Consent should clearly explain:

What types of messages will be sent.

How frequently messages may be received.

How to stop receiving messages.

The application should never automatically enable SMS notifications.

---

# SMS Structure

Every SMS contains:

Short message.

Optional personalization.

Single clear action.

Short link when appropriate.

Example:

Emma's birthday card needs your approval before tomorrow's mailing deadline. Review it here: [example.link](http://example.link)

---

# Character Guidelines

Messages should remain concise.

Avoid multiple links.

Avoid unnecessary branding.

Avoid promotional language.

The user already knows who sent the message.

---

# Quiet Hours

SMS should respect Quiet Hours unless the communication is classified as critical.

Examples that may bypass Quiet Hours:

Security verification.

Fraud prevention.

Account protection.

Routine reminders should never bypass Quiet Hours.

---

# SMS Analytics

Track:

Sent.

Delivered.

Failed.

Clicked.

Opt out.

Carrier errors.

Average response time.

Delivery latency.

---

# SMS Failure Handling

If SMS delivery fails:

Attempt alternative communication channels where appropriate.

Record failure.

Do not repeatedly retry indefinitely.

Escalate only when the communication is genuinely critical.

---

# Communication Analytics

## Purpose

Communication Analytics measures how effectively notifications help users take meaningful action.

The objective is improving communication quality rather than increasing notification volume.

---

# Core Metrics

Track:

Notifications created.

Notifications delivered.

Notifications opened.

Notifications dismissed.

Actions completed.

Actions ignored.

Expiration rate.

Snooze rate.

Average response time.

Completion rate.

---

# Channel Analytics

Measure independently for:

In App.

Push.

Email.

SMS.

Notification Center.

Each channel should have its own dashboard.

---

# Category Analytics

Representative categories include:

Relationship.

Cards.

Autopilot.

Payments.

Delivery.

Questions.

Security.

Subscriptions.

Marketing.

System.

Administrators should understand which categories are most valuable.

---

# Engagement Metrics

Track:

Open rate.

Click through rate.

Task completion.

Time to completion.

Dismissal rate.

Reminder effectiveness.

Deep link completion.

Repeat interaction.

Metrics should focus on usefulness rather than engagement alone.

---

# Notification Fatigue

The system should monitor:

Notifications per user.

Dismissal trends.

Ignored reminders.

Repeated snoozes.

Unsubscribes.

Opt out rates.

High fatigue should trigger internal optimization rather than increased messaging.

---

# Reminder Effectiveness

Measure:

Cards approved after reminder.

Questions answered after reminder.

Payments updated after reminder.

Addresses completed after reminder.

Relationship updates after reminder.

The goal is meaningful action.

---

# Deliverability Monitoring

## Purpose

Deliverability Monitoring ensures communications actually reach users.

Sending a message is not the same as delivering it.

---

# Delivery Monitoring

Track:

Attempted.

Accepted.

Delivered.

Deferred.

Rejected.

Failed.

Opened where applicable.

Clicked where applicable.

---

# Delivery Dashboards

Provide visibility into:

Overall delivery rate.

Channel specific delivery.

Regional trends where applicable.

Provider performance.

Historical comparisons.

---

# Alerting

Administrators should be notified when:

Delivery rates decline.

Bounce rates increase.

Provider latency rises.

Push delivery failures spike.

SMS carrier failures increase.

Email reputation declines.

---

# Provider Monitoring

Monitor:

Availability.

Latency.

Error rate.

Retry rate.

Fallback usage.

The frontend should never expose provider specific terminology.

---

# Bounce Handling

## Purpose

Bounce handling protects communication quality and sender reputation.

---

# Bounce Categories

Temporary.

Permanent.

Mailbox full.

Invalid address.

Blocked.

Spam rejection.

Unknown.

Each category requires different recovery behavior.

---

# Temporary Bounce

Retry according to configured policy.

Avoid duplicate messages.

Notify administrators only if repeated failures occur.

---

# Permanent Bounce

Stop future email delivery.

Notify the user inside the application.

Encourage updating the email address.

Do not repeatedly attempt delivery.

---

# User Messaging

Example:

We're having trouble delivering emails to your address.

Please review your email settings.

Avoid exposing SMTP or provider specific terminology.

---

# Bounce Analytics

Track:

Bounce rate.

Bounce reason.

Recovery success.

Updated addresses.

Permanent suppression count.

Historical trends.

---

# Unsubscribe Behavior

## Purpose

Users should have complete control over optional communications.

Unsubscribing should always be simple, transparent, and immediate.

---

# Categories

Marketing.

Product announcements.

Educational content.

Seasonal ideas.

Relationship tips.

Transactional communications remain enabled while an account is active.

---

# Preference Center

Users should never encounter a single binary unsubscribe option when more granular controls are appropriate.

Instead, present:

Marketing.

Product updates.

Educational emails.

Relationship inspiration.

Users may also unsubscribe from all optional communications.

---

# Confirmation

After unsubscribing:

Display confirmation.

Explain which communications will continue.

Provide a link back to Notification Preferences.

No guilt inducing copy should appear.

---

# Resubscribe

Users may easily re enable optional communications at any time through Settings.

---

# User Controls

## Purpose

Users should always feel that they control communication.

Never the other way around.

---

# Available Controls

Enable or disable channels.

Manage categories.

Adjust reminder timing.

Configure Quiet Hours.

Enable Smart Timing.

Manage digests.

Pause reminders.

Vacation Mode.

Notification sounds.

Badge visibility.

Email preferences.

SMS preferences.

Marketing preferences.

Security notification preferences where permitted.

---

# Global Pause

Users may temporarily pause:

Relationship reminders.

Questions.

Suggestions.

Marketing.

Educational content.

Representative options:

One day.

One week.

Until a selected date.

Resume automatically.

---

# Accessibility

## Purpose

Every communication experience must be accessible regardless of ability or device.

---

# Notification Accessibility

Support:

Keyboard navigation.

Screen readers.

High contrast mode.

Reduced motion.

Large text.

Accessible touch targets.

Logical focus order.

---

# Push Accessibility

Notifications should:

Expose accessible labels.

Support operating system accessibility settings.

Avoid relying solely on color.

Use descriptive action labels.

---

# Email Accessibility

Every email should include:

Semantic headings.

Accessible buttons.

Sufficient contrast.

Descriptive links.

Responsive layout.

Readable font sizes.

Image alternative text.

---

# Motion Preferences

Users with reduced motion preferences should receive:

Minimal notification animation.

No unnecessary movement.

Immediate state transitions where appropriate.

---

# Performance Requirements

## Purpose

The communication system should feel instantaneous without creating unnecessary network or rendering overhead.

---

# Performance Goals

Notifications should appear immediately after server confirmation.

Badge updates should synchronize rapidly.

Notification Center should remain responsive regardless of history size.

Push handling should not delay application launch.

Email preference changes should synchronize immediately.

---

# Rendering

Notification lists should:

Virtualize long histories.

Lazy load older items.

Avoid layout shifts.

Use skeleton loading.

Maintain smooth scrolling.

---

# Synchronization

State should synchronize efficiently across:

Desktop.

Mobile.

Tablet.

Multiple browser tabs.

Synchronization should minimize unnecessary polling by using event driven updates where available.

---

# Acceptance Criteria

## Communication System

The communication platform is considered complete when:

Every supported notification channel behaves consistently.

Users can control communication preferences without confusion.

Notifications respect Quiet Hours, Smart Timing, Vacation Mode, and category preferences.

Deep links always open the correct destination.

Notification Center accurately reflects communication history.

Duplicate notifications are prevented.

Reminder suppression functions correctly.

Analytics accurately measure communication effectiveness.

Deliverability issues are surfaced appropriately.

Optional communications respect unsubscribe preferences.

Accessibility requirements are satisfied across every supported channel.

---

## Push Notifications

Acceptance criteria include:

Permission requests occur at appropriate moments.

Notifications bundle intelligently.

Badge counts reflect actionable work.

Deep links restore context correctly.

Quiet Hours are respected.

---

## Email

Acceptance criteria include:

Responsive rendering.

Accessible layouts.

Consistent branding.

Correct transactional behavior.

Accurate personalization.

Reliable preference management.

---

## SMS

Acceptance criteria include:

Explicit opt in.

Reliable delivery.

Appropriate usage.

Respect for Quiet Hours.

Graceful failure handling.

---

## Notification Preferences

Acceptance criteria include:

Granular controls.

Immediate synchronization.

Predictable behavior.

Clear explanations.

Simple recovery after accidental changes.

---

## Analytics

Acceptance criteria include:

Accurate tracking.

Reliable dashboards.

Historical reporting.

Communication trend analysis.

Meaningful engagement metrics.

---

## Performance

Acceptance criteria include:

Fast rendering.

Responsive interactions.

Scalable notification history.

Minimal perceived latency.

Efficient synchronization.

---

## Security

Acceptance criteria include:

Protected user preferences.

Authenticated notification access.

Secure deep links.

Privacy preserving analytics.

Appropriate audit logging.

---

# Definition of Done

The Notifications and Communications system is considered complete when all communication channels operate as a single, cohesive concierge experience.

Every notification, regardless of channel, follows the communication philosophy established throughout the F.I. Forgot playbook.

Users remain in complete control of how, when, and where they receive communications.

The frontend integrates with the existing backend notification infrastructure without requiring changes to business logic, scheduling, authentication, AI pipelines, Stripe integration, Handwrytten integration, database schema, or API contracts.

Every notification supports clear prioritization, intelligent timing, deep linking, accessibility, analytics, auditability, and graceful failure handling.

Marketing, transactional, reminder, Autopilot, payment, delivery, and relationship communications all share a consistent visual language, tone, and interaction model.

The Notification Center provides a reliable historical record of meaningful communication while remaining performant at scale.

No additional frontend, UX, engineering, architectural, or implementation decisions are required before development begins.









