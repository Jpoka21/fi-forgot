# 82_RELATIONSHIP_PROFILE_BUILD_[SPEC.md](http://SPEC.md)

# Relationship Profile Build Specification

---

# Purpose

The Relationship Profile is the heart of F.I. Forgot.

Every other screen exists to support this one.

This is not a contact record.

It is not a CRM.

It is not a customer profile.

It is not a social media page.

It is a living representation of a real relationship.

Everything displayed should help the user become more thoughtful, more attentive, and more intentional over time.

The Relationship Profile is where memories become stories, stories become context, and context becomes extraordinary greeting cards.

When a user opens this page they should immediately understand:

"I know this person."

"I remember what matters."

"I know what I should do next."

The page should never feel like work.

It should feel like opening a scrapbook that has been quietly organized by a professional concierge.

---

# Philosophy

A world class Relationship Concierge never stores information simply because it can.

Every piece of information exists for one purpose:

To help strengthen the relationship.

The page should feel:

Calm

Personal

Premium

Warm

Organized

Trustworthy

Human

Information should be surfaced according to usefulness, never according to database structure.

The profile grows over time.

It should feel richer every month without becoming more complicated.

The user should never think about "managing data."

They should feel like they are nurturing a relationship.

---

# Core Design Principles

## Relationships First

The person is always more important than the software.

The profile revolves around the recipient.

Never around application features.

---

## Stories Over Fields

Memories are presented as stories.

Not records.

Not database entries.

Not forms.

---

## Intelligence Without Noise

AI should quietly organize.

Never overwhelm.

Never dominate the interface.

---

## Progressive Discovery

The page should reward long term use.

As more information is collected the page becomes richer rather than busier.

---

## One Source of Truth

Every section references the same relationship.

Duplicate information should never appear in multiple places.

---

# Information Hierarchy

Information is displayed in the following order.

1. Relationship Header

2. Relationship Summary

3. Relationship Health

4. Timeline

5. AI Insights

6. Upcoming Occasions

7. Conversation Starters

8. Follow Up Questions

9. Card History

10. Relationship Milestones

11. Attachments and Photos

Advanced tools never appear before relationship context.

---

# Desktop Layout Specification

Maximum Width

1440px

Content Width

1320px

Outer Padding

48px

Grid

12 Columns

Column Gap

32px

Section Spacing

48px

Internal Card Padding

32px

The layout consists of two primary columns.

Left column contains persistent relationship context.

Right column contains dynamic activity.

Layout

```

--------------------------------------------------------

Relationship Header

--------------------------------------------------------

--------------------------------------------------------

Relationship Summary

--------------------------------------------------------

--------------------------------------------------------

| Sidebar              | Main Content                  |

|                      |                               |

| Health               | Timeline                      |

| Upcoming             |                               |

| Insights             |                               |

| Quick Actions        |                               |

|                      |                               |

--------------------------------------------------------

--------------------------------------------------------

Conversation Starters

--------------------------------------------------------

--------------------------------------------------------

Card History

--------------------------------------------------------

--------------------------------------------------------

Milestones

--------------------------------------------------------

--------------------------------------------------------

Attachments

--------------------------------------------------------

```

---

# Sidebar Specification

Desktop sidebar width

340px

Sticky behavior begins after scrolling beyond the Relationship Summary.

The sidebar remains visible while the Timeline scrolls.

The sidebar contains only high value contextual information.

Sections include:

Relationship Health

Upcoming Occasions

AI Insights

Quick Actions

The sidebar should never exceed the viewport height.

If necessary it becomes independently scrollable.

---

# Main Content Area

Remaining available width.

Minimum width

720px

Primary focus:

Timeline

The timeline receives the largest amount of screen space because memories define relationships.

---

# Tablet Layout Specification

Viewport

768 through 1199 pixels

Grid

8 Columns

Padding

32px

Sidebar becomes inline.

Order

Relationship Header

Relationship Summary

Relationship Health

Upcoming Occasions

Timeline

AI Insights

Conversation Starters

Card History

Milestones

Attachments

Nothing remains sticky.

Cards expand to full available width.

---

# Mobile Layout Specification

Viewport

320 through 767 pixels

Single column layout.

Padding

20px

Section spacing

32px

Every section becomes vertically stacked.

Timeline remains the primary visual focus.

Relationship Summary appears before every other section.

Quick Actions become full width buttons.

Cards occupy the full available width.

No horizontal scrolling.

No floating panels.

---

# Responsive Behavior

Desktop

Two column experience.

Sticky sidebar.

Large photography.

Comfortable spacing.

Tablet

Single scrolling column.

Cards retain desktop proportions where possible.

Sidebar content integrates naturally into the page flow.

Mobile

Every component becomes vertically stacked.

Buttons become full width.

Typography scales proportionally.

Images reduce in size before text.

Timeline cards remain readable without truncation.

Nothing requires pinch to zoom.

No information disappears at smaller breakpoints.

Only layout changes.

---

# Component Tree

Relationship Profile

* Relationship Header

  * Back Navigation

  * Recipient Avatar

  * Recipient Name

  * Relationship Label

  * Favorite Indicator

  * Overflow Menu

* Relationship Summary

  * AI Summary

  * Personal Snapshot

  * Last Interaction

  * Next Occasion

  * Relationship Age

* Sidebar

  * Relationship Health

  * Upcoming Occasions

  * AI Insights

  * Quick Actions

* Timeline

  * Timeline Header

  * Search

  * Filters

  * Timeline List

    * Memory Card

    * Card Sent Event

    * Occasion Event

    * Note Event

    * Milestone Event

* Conversation Starters

* Follow Up Questions

* Card History

* Relationship Milestones

* Attachments

* Footer Spacing

---

# Relationship Header Specification

The header immediately establishes who the relationship is about.

Height

120px

Contents

Recipient Avatar

Recipient Name

Relationship Type

Favorite Status

Overflow Menu

Back Navigation

Avatar

96px

Circular

If no image exists, display initials using the design system avatar component.

Recipient Name

36px

Semibold

Relationship Label

16px

Muted secondary text.

Examples

Friend

Brother

Coworker

Neighbor

Overflow Menu

Contains contextual actions only.

Edit Profile

Archive Relationship

Export Timeline

Delete Relationship

Danger actions are visually separated from standard actions.

The header never includes statistics or unrelated actions.

Its purpose is identification and orientation.

---

# Relationship Summary Specification

The summary provides a concierge level understanding of the relationship.

This section appears immediately beneath the header.

It spans the full content width.

Minimum height

220px

Maximum height

Auto

Contents

AI Generated Summary

Relationship Snapshot

Recent Highlights

Next Important Moment

Last Memory Added

The summary should read like a thoughtful introduction rather than a database record.

Example

"Emily is your younger sister. She loves hiking, laughs at terrible puns, and still talks about the family trip to Yellowstone. Her birthday is in three weeks, and you recently added a memory about her new teaching job."

This summary updates dynamically as new memories are collected.

It should always feel natural, personal, and concise.

---

# Relationship Health Specification

The Relationship Health section provides an at a glance understanding of how well the relationship is being maintained.

This is not a scorecard.

It is not a game.

It is a concierge assessment designed to help users stay connected with the people who matter most.

The tone should always be encouraging.

Never judgmental.

---

## Placement

Desktop

Sticky sidebar.

First component.

Tablet

Immediately below Relationship Summary.

Mobile

Immediately below Relationship Summary.

---

## Card Dimensions

Width

100 percent of container.

Minimum Height

220px

Internal Padding

28px

Corner Radius

24px

---

## Components

Relationship Health Score

Circular visualization

Health Label

Supporting explanation

Positive trends

Areas needing attention

Primary recommendation

View Details button

---

## Health Score

Displayed as:

0 through 100

Color ranges

90 to 100

Soft Green

75 to 89

Relationship Gold

50 to 74

Warm Amber

Below 50

Muted Coral

Colors should remain subtle.

The number is less important than the explanation.

---

## Supporting Explanation

Example

"Your relationship with Sarah is thriving. You've consistently shared memories, celebrated important moments, and stayed engaged throughout the year."

The explanation should always answer:

Why is this the current score?

---

## Positive Indicators

Examples

Recent memories added

Cards sent consistently

Recent conversations

Multiple shared experiences

Relationship milestones documented

---

## Opportunities

Examples

No new memory in 83 days

Upcoming birthday needs preparation

Recent follow up questions unanswered

Long gap since last interaction

These are recommendations.

Never warnings.

---

## Primary Recommendation

Exactly one recommendation.

Examples

Log your recent lunch together.

Capture the vacation story while it is fresh.

Ask about their new job.

Prepare a birthday card.

One clear next step is always better than five options.

---

# Timeline Specification

The Timeline is the centerpiece of the Relationship Profile.

Every relationship becomes more valuable over time because the timeline becomes richer.

The timeline tells the story of the relationship.

Everything else supports it.

---

## Placement

Main content column.

Largest visual section.

---

## Timeline Header

Contains

Section title

Search

Filter button

Sort selector

Add Memory button

---

## Timeline Layout

Vertical chronological feed.

Newest entries appear first by default.

Each entry connects visually through a subtle timeline line.

Spacing between entries

24px

---

## Timeline Entry Types

Memory

Card Sent

Occasion

Milestone

AI Generated Insight

Manual Note

Each type has its own icon.

Each type follows the same card structure.

---

# Memory Card Specification

Memory cards are the primary timeline component.

---

## Card Size

Minimum Height

160px

Maximum Height

Unlimited

Width

100 percent

Padding

28px

Border Radius

20px

---

## Components

Memory title

Memory body

Date

Photos

Tags

Related occasion

Edit button

Overflow menu

---

## Memory Title

20px

Semibold

Maximum

Two lines

---

## Memory Body

16px

Regular

Maximum preview

Five lines

Expand inline for longer memories.

---

## Metadata

Displayed beneath the memory.

Includes

Date

Who added it

Associated occasion

Mood tag if available

---

## Images

Displayed beneath memory text.

Maximum preview

Three thumbnails

Additional photos display

+X

Opening an image launches the media viewer.

---

## Tags

Displayed as pills.

Examples

Vacation

Promotion

Graduation

Family

Funny

Travel

Birthday

Pets

These improve browsing without dominating the design.

---

## Memory Actions

Edit

Delete

Attach photo

Pin

Copy link

Actions remain hidden until hover on desktop.

Always visible inside overflow menu on touch devices.

---

# Timeline Search

Search bar appears above the timeline.

Placeholder

Search memories...

Searches

Titles

Memory body

Tags

Occasion names

AI summaries

Results update instantly.

Search never reloads the page.

---

# Timeline Filters

Filter drawer contains

Memory Type

Occasion

Year

Has Photos

Has Cards

Favorites

Pinned

Multiple filters may be active simultaneously.

Active filters appear as removable chips.

---

# Timeline Sorting

Default

Newest First

Additional options

Oldest First

Recently Edited

Most Important

Pinned First

Sort changes animate smoothly.

---

# AI Insights Specification

AI Insights explain meaningful relationship patterns.

This section is informational.

Never overwhelming.

---

## Placement

Sidebar

Below Upcoming Occasions.

---

## Card Structure

Insight Title

Supporting explanation

Suggested action

Confidence indicator

---

## Example Insights

"You frequently mention family vacations."

"They enjoy handwritten cards more than gifts."

"Travel memories create your strongest messages."

"You haven't mentioned their hobby recently."

"Your most meaningful stories usually involve your children."

These insights help future card generation.

---

## Actions

Learn More

Dismiss

Use This Insight

Dismissed insights can reappear if relevant later.

---

# Upcoming Occasions Specification

Upcoming occasions help users prepare early.

The section focuses on planning.

Not urgency.

---

## Card Layout

Occasion icon

Recipient

Occasion

Date

Countdown

Preparation status

CTA

---

## Countdown Display

More than 30 days

Calendar date only

30 to 8 days

"23 days remaining"

7 days or fewer

Highlighted with warm accent color.

Never flashing.

Never animated.

---

## Preparation Status

Examples

Nothing Started

Draft Ready

Awaiting Review

Scheduled

Card Sent

Delivered

Each status uses a subtle badge.

---

## CTA Labels

Start Planning

Continue Draft

Review Card

Track Delivery

Only one CTA appears.

---

# Quick Actions Specification

Quick Actions provide the fastest path to common tasks.

Desktop

Bottom of sidebar.

Tablet

Inline section.

Mobile

Full width buttons.

---

## Actions

Send Card

Add Memory

Upload Photos

Ask AI

Edit Relationship

Every action includes

Icon

Label

Hover state

Keyboard focus state

Disabled state if unavailable.

---

# Conversation Starters Preview

The sidebar displays a preview of available conversation starters.

Maximum shown

Three

A "View All" action opens the full Conversation Starters section further down the page.

Examples

Ask about the new puppy.

Check how the promotion is going.

Mention the concert you attended together.

These prompts should always feel personal and timely.

---

# Follow Up Questions Preview

The sidebar also surfaces one pending follow up question if available.

Example

"You mentioned Sarah started a new business. Ask how it's going."

Primary action

Answer Now

Secondary action

Remind Me Later

Only one follow up question is surfaced at a time to avoid overwhelming the user.

