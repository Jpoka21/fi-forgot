# 81_DASHBOARD_BUILD_[SPEC.md](http://SPEC.md)

# Dashboard Build Specification

---

# Purpose

The Dashboard is the emotional home of F.I. Forgot.

It is not a reporting page.

It is not an administrative console.

It is not a list of reminders.

It is the place where users immediately understand:

"I know who matters."

"I know what's coming."

"I know what needs my attention."

"I am becoming more thoughtful."

Every design decision must reduce anxiety while increasing confidence.

The dashboard should feel calm, intentional, and quietly intelligent.

---

# Philosophy

The dashboard behaves like a world class Relationship Concierge.

A concierge never overwhelms.

A concierge never shows unnecessary information.

A concierge prioritizes.

A concierge guides.

A concierge creates confidence.

The dashboard should answer only four questions:

1. What needs my attention today?

2. Who matters most right now?

3. What should I do next?

4. How am I becoming better at relationships?

Nothing else belongs above the fold.

---

# Information Hierarchy

Priority order is fixed.

1. Welcome Hero

2. Upcoming Cards

3. Relationship Spotlight

4. Concierge Recommendations

5. Quick Actions

6. Recent Activity

Lower priority information must never visually compete with higher priority content.

---

# Desktop Layout Specification

Maximum content width:

1400px

Content width:

Clamp between:

1200px and 1400px

Outer page padding:

48px

Section spacing:

48px

Grid:

12 columns

Column gap:

32px

Layout:

Hero

↓

Upcoming Cards + Relationship Spotlight

↓

Concierge Recommendations

↓

Quick Actions

↓

Recent Activity

All cards align to a shared vertical rhythm.

---

# Tablet Layout Specification

Width:

768px through 1199px

Outer padding:

32px

Grid:

8 columns

Cards stack where necessary.

Upcoming Cards occupies full width.

Relationship Spotlight follows.

Quick Actions become two columns.

---

# Mobile Layout Specification

Width:

320px through 767px

Padding:

20px

Single column layout.

Section order never changes.

Cards use full width.

Large illustrations shrink before typography.

Buttons become full width.

Touch targets:

Minimum 48x48px.

---

# Responsive Behavior

Desktop

Hero uses two column composition.

Illustration right.

Content left.

Tablet

Illustration scales down.

Columns collapse when necessary.

Mobile

Illustration moves beneath hero copy.

Cards become vertical.

No horizontal scrolling.

Nothing overlaps.

No hidden content.

---

# Complete Component Tree

Dashboard

* Dashboard Shell

  * Header

  * Greeting Hero

    * Greeting

    * Context Message

    * Concierge Summary

    * Primary CTA

    * Secondary CTA

    * Hero Illustration

  * Upcoming Cards

    * Section Header

    * Card List

      * Upcoming Card

      * Upcoming Card

      * Upcoming Card

    * View All Button

  * Relationship Spotlight

    * Recipient Avatar

    * Recipient Details

    * Concierge Insight

    * Suggested Action

  * Concierge Recommendations

    * Recommendation Cards

  * Quick Actions

    * Send Card

    * Add Memory

    * Add Recipient

    * Browse Timeline

  * Recent Activity

    * Timeline Items

  * Footer Spacing

---

# Spacing Specifications

Outer padding:

48 desktop

32 tablet

20 mobile

Section spacing:

48px

Card spacing:

24px

Internal card padding:

32px desktop

24px tablet

20px mobile

Button spacing:

16px

Heading to body:

12px

Paragraph spacing:

16px

Icon spacing:

12px

List spacing:

20px

---

# Grid Specifications

Desktop

12 columns

32px gutters

Tablet

8 columns

24px gutters

Mobile

Single column

No nested horizontal scrolling.

Cards align perfectly.

---

# Typography Specifications

Hero Greeting

48px

Weight 700

Hero Message

20px

Weight 400

Section Titles

28px

Weight 700

Card Titles

22px

Weight 600

Body

16px

Weight 400

Labels

14px

Medium

Metadata

13px

Regular

Buttons

16px

Semibold

Line height:

150%

Maximum text width:

70 characters.

---

# Color Usage

Background

Warm Ivory

Primary Cards

White

Accent

Relationship Gold

Success

Soft Green

Information

Warm Blue

Warning

Soft Amber

Error

Muted Red

Primary text

Deep Charcoal

Secondary text

Slate Gray

Borders

Light Neutral

No saturated colors.

No pure black.

No harsh contrast.

---

# Dashboard Sections

Sections appear in this order only.

Greeting Hero

Upcoming Cards

Relationship Spotlight

Concierge Recommendations

Quick Actions

Recent Activity

---

# Hero Specification

Purpose:

Immediately create emotional confidence.

Height:

Minimum 420px desktop

Content:

Greeting

Good morning, James.

Dynamic summary.

Example:

"You have two important moments coming up this week."

AI Concierge insight.

Example:

"Emma's birthday is next Tuesday. Your last card made her cry happy tears."

Primary CTA

Continue Preparing

Secondary CTA

View All Relationships

Illustration

Warm relationship themed artwork.

Never decorative for decoration's sake.

Illustration occupies approximately 40 percent of hero width.

CTA buttons align left.

Illustration aligns right.

---

# Upcoming Cards Specification

Maximum shown:

3

Sorted by:

Chronological order.

Each card contains:

Recipient

Relationship

Occasion

Due date

Countdown

Status

Primary action

Cards never exceed three.

Additional cards accessed through:

View All.

Visual urgency increases only within seven days.

No flashing.

No animation.

---

# Relationship Spotlight Specification

Exactly one relationship.

Selection logic:

Highest concierge relevance.

Content:

Recipient photo

Relationship summary

Recent memory

Suggested action

Relationship health insight

Example:

"You haven't shared a new memory with Sarah in 84 days."

Primary CTA:

View Relationship

Secondary CTA:

Log a Memory

---

# Quick Actions Specification

Exactly four actions.

Send a Card

Add Memory

Add Recipient

Browse Timeline

Equal visual weight.

Icons above labels.

Hover elevation.

Keyboard accessible.

---

# Concierge Recommendations Specification

Maximum:

Three recommendations.

Each recommendation contains:

Title

Explanation

Reason

Suggested action

Dismiss option

Examples:

Ask about Jake's new job.

Log your anniversary dinner.

Capture Emma's graduation story.

Recommendations disappear after completion.

---

# Recent Activity Specification

Chronological timeline.

Maximum:

Five entries.

Examples:

Card sent

Memory added

Relationship updated

Recipient added

Card delivered

Each item includes:

Icon

Timestamp

Description

Clickable destination.

---

# Empty States

## Entire Dashboard

Illustration

Friendly explanation

Example:

"Let's start building your relationship concierge."

Primary CTA:

Add Your First Person

Secondary CTA:

Learn How It Works

---

## Upcoming Cards

"No upcoming cards right now."

CTA

Browse Occasions

---

## Relationship Spotlight

"No spotlight available yet."

CTA

Add More Relationships

---

## Recommendations

"No recommendations today."

Positive reinforcement.

Example:

"You're all caught up."

---

## Recent Activity

"No recent activity."

CTA

Start by adding someone important.

---

# Loading States

Use skeleton loading only.

Hero

Skeleton illustration

Skeleton text

Skeleton buttons

Cards

Rectangular placeholders.

Never use spinners for initial page load.

Progressive loading:

Hero

↓

Upcoming Cards

↓

Spotlight

↓

Recommendations

↓

Activity

---

# Error States

Friendly language.

Never expose technical errors.

Example:

"We couldn't load your dashboard right now."

Primary button

Try Again

Secondary button

Contact Support

Maintain layout.

Avoid collapsing sections.

---

# Animations

Page fade

250ms

Cards

Fade and rise

200ms

Hover

150ms

Recommendation dismissal

200ms

Button press

100ms

No bouncing.

No dramatic motion.

Respect reduced motion preferences.

---

# Microinteractions

Button hover

Subtle elevation

Card hover

Soft shadow increase

Primary CTA

Gentle scale to 102 percent

Recommendation dismissal

Smooth collapse

Timeline hover

Highlight row

Avatar hover

Soft glow

Nothing should feel playful.

Everything should feel refined.

---

# Keyboard Behavior

Logical tab order.

Visible focus rings.

Enter activates buttons.

Space activates buttons.

Escape closes overlays.

Arrow keys navigate menus.

No keyboard traps.

Skip to content link required.

---

# Accessibility Requirements

Minimum contrast:

WCAG AA

Interactive targets:

Minimum 48x48px

Semantic landmarks:

Header

Main

Section

Navigation

Footer

ARIA labels

Every interactive element.

Decorative illustrations hidden from screen readers.

Meaningful illustrations described.

Focus never lost after updates.

Reduced motion fully supported.

Screen reader announcements for dynamic updates.

---

# Analytics Events

Dashboard Viewed

Hero CTA Clicked

Upcoming Card Opened

Upcoming Card Continued

Relationship Spotlight Viewed

Relationship CTA Clicked

Recommendation Viewed

Recommendation Accepted

Recommendation Dismissed

Quick Action Clicked

Recent Activity Opened

Dashboard Refresh

Loading Failure

Retry Clicked

Empty State CTA Clicked

---

# API Data Mapping

## Hero

Current user

Upcoming event summary

AI concierge summary

Relationship highlights

Greeting

---

## Upcoming Cards

Upcoming events endpoint

Recipient

Occasion

Due date

Status

Countdown

Card draft status

---

## Relationship Spotlight

Relationship endpoint

Recipient

Relationship health

Recent memory

Suggested follow up

AI insight

---

## Concierge Recommendations

Recommendation endpoint

Recommendation title

Description

Priority

Suggested action

Dismiss status

---

## Quick Actions

Static navigation routes.

---

## Recent Activity

Timeline endpoint

Recent actions

Timestamps

Navigation destinations

---

# Performance Considerations

Largest Contentful Paint

Under 2.5 seconds

Interaction to Next Paint

Under 200ms

Cumulative Layout Shift

Less than 0.1

Images lazy loaded below the fold.

Hero illustration preloaded.

API requests executed in parallel.

Skeletons displayed immediately.

Avoid unnecessary rerenders.

Virtualize long activity history if expanded.

Memoize expensive components.

---

# Acceptance Criteria

The dashboard immediately communicates today's priorities.

Users understand what requires attention within five seconds.

Upcoming cards are always visible above the fold on desktop.

Relationship Spotlight always contains meaningful insight.

Recommendations are personalized.

Quick Actions remain accessible from every viewport.

Empty states encourage progress.

Loading feels intentional.

No layout shifts occur during loading.

Animations remain subtle.

Keyboard navigation reaches every interactive element.

Accessibility passes automated WCAG AA testing.

Performance budgets are satisfied.

No backend logic changes are required.

All existing APIs remain compatible.

No product decisions are left for implementation.

---

# Definition of Done

The Dashboard is complete when:

Every component matches the design system.

Every spacing rule is implemented consistently.

Every typography rule is implemented consistently.

Every responsive breakpoint behaves exactly as specified.

Desktop, tablet, and mobile layouts are pixel consistent.

All dashboard data is populated from existing APIs.

Loading, empty, and error states are fully implemented.

Accessibility requirements pass automated and manual testing.

Analytics events are firing correctly.

Performance budgets are met.

Cursor required no product interpretation during implementation.

The final experience feels calm, premium, intentional, and unmistakably like a world class Relationship Concierge.