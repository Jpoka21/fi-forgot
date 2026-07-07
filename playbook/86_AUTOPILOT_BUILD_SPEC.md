# 86_AUTOPILOT_BUILD_[SPEC.md](http://SPEC.md)

---

# Purpose

The Autopilot experience is the operational heart of F.I. Forgot.

It transforms the platform from a collection of reminders into a true Relationship Concierge.

The user should never feel like they are configuring automation.

They should feel like they are instructing a trusted concierge who quietly watches over the people who matter most.

Autopilot is responsible for:

* remembering important dates

* monitoring relationship freshness

* requesting meaningful updates

* generating card drafts

* preparing approvals

* scheduling delivery

* identifying neglected relationships

* surfacing opportunities to strengthen relationships

* reducing user effort without reducing user control

Autopilot should never feel robotic.

Every interaction reinforces that thoughtful relationships remain human, while repetitive work becomes invisible.

---

# Philosophy

Autopilot follows five principles.

## Invisible Until Needed

Autopilot should disappear whenever everything is healthy.

Users should not need to constantly check settings.

The dashboard should quietly communicate:

> Everything is taken care of.

---

## Human Remains In Control

Autopilot never pretends to be the user.

It prepares.

It drafts.

It recommends.

The user always owns the relationship.

---

## Progressive Trust

New users begin with conservative automation.

As trust grows, users may delegate additional responsibilities.

Trust is earned through successful experiences.

Never encourage full automation immediately.

---

## Relationship First

Automation exists to improve relationships.

Every setting should answer:

"What relationship outcome becomes better?"

Never expose technical implementation simply because it exists.

---

## Calm, Not Complicated

Traditional automation interfaces become giant configuration screens.

F.I. Forgot intentionally avoids this.

Users should never feel overwhelmed by switches.

Most users should only interact with a handful of meaningful decisions.

---

# Goals

Autopilot should enable users to:

* confidently know nothing important is being forgotten

* understand what AI is doing

* quickly approve pending work

* customize important relationships

* override automation when necessary

* recover from mistakes safely

* build trust over time

---

# Overall Information Hierarchy

```

Autopilot

├── Status Hero

│

├── Approval Queue

│

├── Upcoming Automated Actions

│

├── Recommendations

│

├── Relationship Overrides

│

├── Global Automation Settings

│

├── Notification Preferences

│

└── Automation History

```

This ordering reflects frequency of use.

Daily users should rarely scroll beyond Recommendations.

Settings are intentionally placed lower.

---

# Desktop Layout Specification

Maximum content width:

1400px

Centered.

Page padding:

48px

Top spacing:

40px

Bottom spacing:

80px

Grid:

12 column

32px gutters

Sections separated by:

48px vertical spacing

---

# Desktop Page Structure

```

------------------------------------------------------------

Page Header

------------------------------------------------------------

Autopilot Status Hero

------------------------------------------------------------

Approval Queue

------------------------------------------------------------

Upcoming Automated Actions

------------------------------------------------------------

Recommendations

------------------------------------------------------------

Relationship Overrides

------------------------------------------------------------

Global Settings

------------------------------------------------------------

Notification Preferences

------------------------------------------------------------

Automation History

------------------------------------------------------------

```

---

# Header Specification

Height:

Auto

Contains:

Left:

Page title

Subtitle

Right:

Primary action

Secondary action

---

### Title

Autopilot

48px

700 weight

Primary text color.

---

### Subtitle

Examples:

"Everything looks good."

"3 cards waiting for approval."

"2 relationships need attention."

18px

Muted color.

Maximum width:

700px

---

### Primary Action

Contained button.

Examples:

Review Drafts

Resume Autopilot

Approve All

Depends on current state.

---

### Secondary Action

Ghost button.

Usually:

Settings

or

Pause Autopilot

---

# Autopilot Status Hero

Largest visual element.

Height:

280px

Rounded:

32px

Soft gradient background.

Contains:

```

Status Summary

Current Health

Automation Metrics

Quick Actions

```

---

# Hero Layout

Desktop:

```

------------------------------------------------------

LEFT (65%)

Status headline

Description

Current summary

Quick actions

------------------------------------------------------

RIGHT (35%)

Circular health visualization

Automation statistics

Confidence indicator

------------------------------------------------------

```

---

# Status Headline

Examples:

Everything is running smoothly.

You're all caught up.

Three approvals are waiting.

One relationship may need attention.

Large typography:

40px

Weight:

700

Maximum:

Two lines.

---

# Supporting Description

Examples:

"We'll prepare birthday cards, ask for fresh updates when needed, and let you know before anything is sent."

16px

Muted color.

Maximum width:

520px

---

# Quick Actions

Horizontal row.

Maximum four buttons.

Examples:

Review Queue

Pause

Settings

See History

Gap:

16px

---

# Right Side Visualization

Circular relationship health ring.

Center:

Autopilot Score

Example:

96%

Label:

Healthy

Animation:

Progress fills on load.

900ms

Ease out.

---

# Statistics Row

Below visualization.

Four metric cards.

Equal width.

Examples:

Relationships Managed

48

Cards Scheduled

12

Pending Reviews

3

Upcoming Events

9

Cards:

120px height

20px radius

Soft elevation.

---

# Approval Queue Section

Placed directly beneath hero.

Only visible when approvals exist.

If queue is empty:

Section collapses completely.

No placeholder.

---

# Approval Queue Header

Title

Pending Approvals

Subtitle

"Review AI prepared cards before they're sent."

Right side:

View All

---

# Queue Layout

Horizontal card list.

Maximum:

Three visible cards.

Desktop.

Each:

360px wide.

Scrollable if necessary.

---

# Approval Card

Contains:

Recipient avatar

Recipient name

Occasion

Scheduled send date

AI confidence

Draft preview

Primary CTA

Secondary CTA

---

Layout

```

Avatar

Recipient Name

Occasion

--------------------------------

Preview text

--------------------------------

Confidence

Delivery

--------------------------------

Approve

Review

```

---

# Recipient Information

Avatar:

56px

Name:

18px

Semibold.

Occasion:

14px

Muted.

---

# Draft Preview

Three lines maximum.

Fade after line three.

Clicking opens review workflow.

---

# Confidence Badge

Examples:

Very High

High

Medium

Needs Review

Displayed using color and icon.

Never use red unless confidence is critically low.

---

# Approval Actions

Primary

Approve

Contained button.

Secondary

Review

Ghost button.

---

# Upcoming Automated Actions

Purpose:

Increase transparency.

Users should understand what Autopilot plans to do next.

---

# Section Header

Upcoming Actions

Subtitle:

"What your concierge is preparing."

---

# Timeline Layout

Vertical timeline.

Chronological.

Grouped by day.

---

Timeline Example

```

Today

Generate birthday draft

Ask Emily for recent life update

Tomorrow

Schedule anniversary card

Friday

Follow up on recent memory

Monday

Prepare Father's Day draft

```

---

Each Timeline Item Contains

Icon

Time

Action title

Relationship

Automation source

Status

Optional CTA

---

Action Title Examples

Generate birthday draft

Request relationship update

Schedule mailing

Wait for approval

Archive completed draft

Refresh AI profile

---

Automation Source

Small muted pill.

Examples:

Birthday

Follow Up

Memory Refresh

Manual Rule

Holiday

Relationship Health

---

Status

Upcoming

Running

Waiting

Completed

Paused

Skipped

---

Recommendations Section

Purpose:

Suggest thoughtful actions beyond scheduled automation.

Recommendations are proactive.

Never urgent.

---

Layout

Responsive card grid.

Desktop:

Three columns.

---

Recommendation Card

Contains:

Illustration

Title

Reason

Relationship

Estimated impact

Primary action

Dismiss

---

Example Recommendations

"Reach out to Sarah this week."

"You haven't shared a memory with Dad in three months."

"Consider sending a congratulations card."

"This relationship has become stronger recently."

"You may want to add favorite hobbies."

---

Card Height

240px

Radius

24px

Hover elevation

Subtle scale:

1.02

---

Relationship Overrides Section

Purpose:

Allow exceptions without overwhelming settings.

Users modify behavior for individual people.

Not globally.

---

Layout

Table style cards.

Columns:

Recipient

Autopilot

Cards

Updates

Notifications

Actions

---

Row Height

88px

Avatar:

48px

Relationship name

Status pill

Current automation level

Last activity

Manage button

---

Manage Button

Opens side panel.

Never navigates away.

All edits occur in context.

---

Global Settings Section

Positioned after relationship overrides.

Most users visit infrequently.

Layout:

Two column settings cards.

Left:

Automation

Right:

AI Preferences

Further configuration continues in the next section of this specification.

## Global Automation Card

The Global Automation card controls the overall behavior of the Relationship Concierge.

This is intentionally concise.

The user should never need to configure dozens of options.

The system ships with intelligent defaults.

Card Width:

100%

Desktop column width:

Approximately 50%

Padding:

32px

Corner Radius:

24px

Sections separated by:

24px

---

### Card Header

Contains:

Title

Description

Status badge

Example:

**Autopilot**

"Your concierge is actively preparing cards, monitoring relationships, and requesting updates when needed."

Status Badge examples:

* Active

* Paused

* Limited

* Manual Only

Badge color follows the design system.

---

### Master Autopilot Toggle

Largest control in the card.

This is not a simple switch.

It behaves more like a mode selector.

States:

* Fully Active

* Pause Everything

* Manual Only

Presentation:

Segmented control.

```

-----------------------------------------

 Active | Manual | Paused

-----------------------------------------

```

Changing modes always opens a confirmation dialog.

---

### Active Mode

Description:

F.I. Forgot automatically:

* prepares card drafts

* requests relationship updates

* monitors important dates

* keeps approval queue current

* recommends thoughtful actions

No automated cards are ever mailed without following the user's selected approval policy.

---

### Manual Mode

Description:

Automation monitoring continues.

Nothing is automatically generated.

The system waits for user initiation.

Relationship health continues updating.

Timeline continues updating.

Recommendations continue appearing.

---

### Paused Mode

Description:

Autopilot temporarily suspends all scheduled activity.

No reminders.

No AI generation.

No follow ups.

No approval requests.

Calendar data remains intact.

Timeline remains visible.

Pause duration options:

* Until tomorrow

* One week

* Until resumed manually

---

### Approval Policy

Section Title:

Card Approval

Description:

Choose how much review you want before cards are prepared for mailing.

Options:

○ Always Review

Recommended.

○ Review First Draft Only

AI learns confidence.

○ Auto Approve High Confidence

Requires trust score.

Each option includes a short explanation.

---

### Fresh Update Frequency

Section Title:

Relationship Check Ins

Controls how aggressively the concierge requests fresh memories.

Options:

Relaxed

Balanced

Active

Rather than exposing time intervals, explain expected behavior.

Example:

Balanced

"We'll occasionally ask for updates when they would improve future cards."

---

### Holiday Participation

Checklist.

Examples:

☑ Valentine's Day

☑ Mother's Day

☑ Father's Day

☑ Thanksgiving

☑ Christmas

☑ New Year

☑ Just Because Suggestions

Each includes a short explanation.

---

## AI Preferences Card

Second card in the settings section.

Purpose:

Define overall AI personality rather than technical settings.

---

### Header

Title:

Writing Preferences

Subtitle:

"Guide how your concierge prepares messages."

---

### Tone Preference

Segmented chips.

Examples:

Warm

Funny

Elegant

Professional

Heartfelt

Multiple selections allowed.

Selections influence defaults.

Users may still override during card creation.

---

### Creativity Level

Slider.

Labels:

Conservative

Balanced

Creative

Maximum width:

320px

Tooltip explains behavior.

Conservative:

Closer to real events.

Creative:

More expressive language.

---

### Personal Detail Usage

Section explains how aggressively AI should reference known memories.

Options:

Minimal

Balanced

Rich Personalization

Default:

Balanced

---

### Signature Preference

Controls default sign off.

Examples:

Love,

Best,

Thinking of you,

Custom

---

## Notification Preferences

Position:

Below Global Settings.

Purpose:

Allow users to choose when Autopilot should interrupt them.

Notification fatigue must be minimized.

---

# Desktop Layout

Two cards.

```

----------------------------------------

Approval Notifications

System Notifications

----------------------------------------

```

---

## Approval Notifications Card

Header:

Review Alerts

Description:

"When should we notify you?"

Options:

Immediately

Daily Digest

Morning Summary

Evening Summary

Only When Urgent

Radio selection.

---

Additional Toggles

Notify before mailing

Notify after approval

Notify when draft changes

Notify if confidence drops

Notify if delivery issue occurs

---

## System Notifications Card

Options include:

Relationship becoming stale

Missed opportunities

Profile completion

Holiday reminders

Memory prompts

Autopilot paused

Monthly concierge report

Each option includes:

Title

Description

Toggle

---

## Automation History

Purpose:

Transparency.

Users should always understand what Autopilot has done.

Never feel like hidden automation exists.

---

Layout

Full width.

Table.

Columns:

Date

Relationship

Action

Result

Source

Status

---

Example Rows

June 4

Generated birthday draft

Emily

Birthday

Completed

---

June 2

Requested recent memory

Dad

Relationship Health

Completed

---

June 1

Skipped Father's Day reminder

Manual Override

Completed

---

Status Colors

Completed

Green

Pending

Blue

Waiting

Amber

Skipped

Gray

Failed

Red

---

Rows Expand

Selecting a row expands details.

Expansion includes:

Reason

AI explanation

Time

Related event

Actions taken

Links

---

## Tablet Layout Specification

Breakpoint:

768px to 1199px

Content Width:

100%

Side Padding:

32px

Vertical spacing:

40px

---

Overall Flow

Hero

Approval Queue

Upcoming Actions

Recommendations

Overrides

Settings

History

Everything becomes vertically stacked.

No side by side settings cards.

---

Hero

Visualization moves beneath headline.

Quick actions wrap.

Statistics become:

Two by two grid.

---

Approval Queue

Cards become:

Full width.

One visible at a time.

Horizontal swipe enabled.

---

Recommendations

Grid changes:

Two columns.

Cards remain equal height.

---

Relationship Overrides

Columns reduced.

Visible columns:

Avatar

Relationship

Status

Manage

Additional details move into expanded rows.

---

Global Settings

Cards stack vertically.

All controls remain unchanged.

---

Notification Cards

Stack vertically.

---

Automation History

Columns collapse.

Visible:

Date

Action

Status

Selecting a row reveals additional details.

---

## Mobile Layout Specification

Breakpoint:

767px and below.

Horizontal padding:

20px

Top padding:

24px

Bottom padding:

80px

Spacing between sections:

32px

---

Overall Order

Header

Hero

Approval Queue

Upcoming Actions

Recommendations

Overrides

Settings

Notifications

History

Everything is a single vertical column.

---

Header

Title

Subtitle

Overflow menu

Primary button becomes floating action button when appropriate.

---

Hero

Height:

Auto.

Visualization moves beneath headline.

Statistics become individual cards stacked vertically.

Quick actions become:

Two button rows.

---

Approval Queue

Single card carousel.

Swipe enabled.

Snap scrolling.

Indicators shown below.

---

Upcoming Timeline

Entire width.

Each action card expands naturally.

Touch targets:

Minimum 48px.

---

Recommendations

Single column.

Cards:

100% width.

Illustrations become slightly smaller.

Dismiss action moves into overflow menu.

---

Relationship Overrides

Each relationship becomes a standalone management card.

Card contains:

Avatar

Name

Status

Automation summary

Manage button

Expand icon

Selecting expands inline controls.

---

Global Settings

Every settings group becomes an accordion.

Collapsed by default.

Only one section expanded at a time.

This prevents excessive scrolling.

---

AI Preferences

Same accordion behavior.

Sliders remain full width.

Large touch targets.

---

Notification Settings

Grouped into expandable sections.

Each toggle occupies full row.

Entire row is tappable.

Switch aligns right.

---

Automation History

Displayed as chronological activity cards.

Each card contains:

Date

Relationship

Action

Status

Expand arrow

Selecting reveals complete history information.

---

## Responsive Behavior

The experience should never simply shrink.

It should intelligently reorganize.

Priority rules:

Approval Queue always remains near the top.

Recommendations never appear above pending approvals.

Global settings are progressively collapsed on smaller devices.

Relationship management always remains easy to access.

Animations become shorter on mobile.

Hover interactions become press interactions.

Swipe gestures replace horizontal scrolling where appropriate.

No horizontal page scrolling is ever permitted.

The page should remain fully usable using one handed operation on modern phones.

The next section defines the complete component hierarchy and every interactive component within the Autopilot experience.



# Complete Component Tree

The Autopilot experience is composed of reusable design system components.

Every component should already exist within the global component library whenever possible.

No Autopilot specific component should duplicate an existing component with only cosmetic differences.

---

```

AutopilotPage

├── PageHeader

│

├── StatusHero

│   ├── StatusHeadline

│   ├── StatusDescription

│   ├── HealthVisualization

│   ├── MetricsGrid

│   ├── QuickActions

│   └── OverallStatusBadge

│

├── ApprovalQueue

│   ├── QueueHeader

│   ├── ApprovalCard

│   │   ├── RecipientAvatar

│   │   ├── OccasionBadge

│   │   ├── DraftPreview

│   │   ├── ConfidenceBadge

│   │   ├── ScheduledDate

│   │   ├── ApproveButton

│   │   └── ReviewButton

│   └── QueuePagination

│

├── UpcomingTimeline

│   ├── TimelineDay

│   ├── TimelineItem

│   ├── TimelineConnector

│   ├── TimelineStatus

│   └── TimelineCTA

│

├── Recommendations

│   ├── RecommendationCard

│   ├── RecommendationIllustration

│   ├── RecommendationReason

│   ├── RecommendationImpact

│   ├── PrimaryAction

│   └── DismissAction

│

├── RelationshipOverrides

│   ├── OverrideTable

│   ├── OverrideRow

│   ├── OverrideDrawer

│   └── OverrideControls

│

├── GlobalSettings

│   ├── AutomationCard

│   ├──WritingPreferencesCard

│   └── NotificationCard

│

├── AutomationHistory

│   ├── HistoryTable

│   ├── HistoryRow

│   └── HistoryDetail

│

└── SharedModals

```

---

# Autopilot Dashboard

The dashboard is the operational overview.

It answers five questions immediately.

1. Is everything okay?

2. Does anything need my attention?

3. What is happening next?

4. Is the AI doing a good job?

5. Can I trust the system?

Every design decision reinforces those five answers.

---

## Dashboard Priority Order

Visual importance should always follow this order.

```

Overall Status

↓

Pending Approvals

↓

Upcoming Actions

↓

Recommendations

↓

Relationship Overrides

↓

Settings

↓

History

```

Users should rarely need to scroll past Recommendations during normal weekly use.

---

# Global Autopilot Controls

Global controls affect the entire concierge experience.

Changing these settings should feel significant.

The interface reinforces this with slightly slower transitions, confirmation dialogs, and explanatory copy.

---

## Master Status Indicator

Displayed in:

Status Hero

Settings Card

Navigation Badge

Possible values:

Active

Paused

Manual

Limited

Error

Each state includes:

Icon

Color

Short description

Suggested action if applicable

---

## Pause Autopilot

Selecting Pause opens a confirmation modal.

The modal explains:

What will stop.

What continues.

How to resume.

Nothing should feel ambiguous.

---

Example Copy

Pause Autopilot

"While paused, we won't prepare new drafts, request updates, or notify you about upcoming events. Your relationships and existing data remain safe."

Buttons:

Cancel

Pause

---

## Resume Autopilot

Resuming should feel reassuring.

Small success animation.

Status ring briefly animates.

Timeline refreshes.

Upcoming actions repopulate.

Toast:

"Your concierge is back on duty."

---

# Individual Relationship Autopilot Controls

Every relationship can override global settings.

Overrides should be rare.

The interface intentionally discourages unnecessary customization.

---

## Relationship Drawer

Selecting Manage opens a right side drawer.

Desktop Width:

520px

Tablet:

Full height overlay

Mobile:

Bottom sheet

---

Drawer Sections

```

Relationship Summary

↓

Automation Status

↓

Cards

↓

Relationship Updates

↓

Notifications

↓

Advanced Options

```

---

## Relationship Summary

Contains:

Avatar

Relationship name

Relationship type

Relationship health score

Upcoming event

Last interaction

Read only.

---

## Automation Status

Controls:

Enabled

Paused

Manual

Uses segmented control.

Description updates immediately beneath selection.

---

## Card Automation

Allows relationship specific rules.

Examples:

Prepare birthday cards

Prepare anniversary cards

Prepare holiday cards

Prepare encouragement cards

Each rule:

Title

Explanation

Toggle

---

If disabled:

AI will never prepare that type automatically.

The user may still create cards manually.

---

## Relationship Update Automation

Options include:

Request new memories

Request life updates

Refresh interests

Ask about hobbies

Monitor stale relationship

Each option includes a recommendation explaining why it improves future cards.

---

## Notification Overrides

Relationship specific notifications.

Examples:

Always notify immediately

Bundle into digest

Only notify for birthdays

Mute recommendations

Emergency only

---

## Advanced Options

Collapsed by default.

Contains:

Reset relationship automation

Remove all overrides

Return to global defaults

Danger Zone styling.

Requires confirmation.

---

# Approval Queue

The Approval Queue is the most frequently visited area.

It must support very fast processing.

A user with twenty pending drafts should comfortably process them in minutes.

---

## Queue Layout

Cards ordered by urgency.

Priority rules:

Mailing deadline

Holiday importance

Recipient importance

AI confidence

Creation date

---

## Approval Card Components

Each card includes:

Relationship avatar

Recipient name

Occasion

Mail date

AI confidence

Estimated reading time

Draft preview

Actions

---

## Estimated Reading Time

Example:

20 second review

45 second review

2 minute review

This helps users mentally commit.

---

## Card Status

Waiting

Needs Review

Edited

Ready

Approved

Scheduled

Each has:

Color

Icon

Label

---

# Draft Review Workflow

Selecting Review opens the complete review experience.

This is not a modal.

It is a focused workspace.

The rest of the application fades into the background.

---

Workflow Layout

Desktop

```

--------------------------------------

Left

Recipient

Occasion

Relationship Summary

Recent Memories

Timeline

--------------------------------------

Center

Letter Editor

--------------------------------------

Right

AI Insights

Suggestions

Confidence

Card Preview

--------------------------------------

```

---

Tablet

Relationship summary collapses.

Editor expands.

Insights become collapsible.

---

Mobile

Stacked.

Relationship

Editor

Insights

Preview

Actions

---

## Draft Header

Contains:

Recipient

Occasion

Scheduled send date

Delivery estimate

Relationship health

Back button

---

## Letter Editor

Uses the standard editor from Card Creation.

No functionality differences.

All existing backend behavior remains unchanged.

---

## AI Sidebar

Purpose:

Increase confidence.

Never expose model internals.

Instead explain reasoning naturally.

Examples:

"This draft references the vacation you told us about in March."

"We avoided mentioning work because you previously asked us not to."

"We emphasized humor because that's usually how you write to Michael."

---

## Suggested Improvements

AI may recommend:

Mention a recent memory.

Shorten introduction.

More playful ending.

Reference anniversary trip.

These appear as chips.

Applying a suggestion animates into the editor.

Undo remains available.

---

## Card Preview

Live rendering.

Updates immediately while editing.

Includes:

Selected artwork

Handwriting preview

Envelope preview

Delivery estimate

---

## Draft Actions

Primary

Approve Draft

Secondary

Save Changes

Additional actions

Request Rewrite

Change Tone

Change Card Design

Schedule Later

Discard Draft

Overflow actions require confirmation where appropriate.

---

## Bulk Approval

Users may approve multiple drafts simultaneously.

Selection mode is entered explicitly.

Never automatically.

Toolbar appears.

Available actions:

Approve

Mark for Later

Export

Delete

Clear Selection

A running count remains visible at all times.

---

# Approval Workflow States

Draft Generated

↓

Awaiting Review

↓

Editing

↓

Approved

↓

Scheduled

↓

Sent to Handwrytten

↓

Completed

Users should always know exactly where every draft exists within this flow.

The next section covers AI confidence indicators, automation intelligence, recommendations, exceptions, notifications, search, filters, empty states, loading states, and all remaining interaction specifications.

# AI Confidence Indicators

Confidence indicators exist to build trust, not to expose machine learning metrics.

Users should understand how confident the concierge feels about a draft without needing to understand how the score was calculated.

Confidence should never imply certainty.

Instead, it communicates how much personalization the AI believes it successfully achieved.

---

## Confidence Levels

Five levels are used throughout the application.

### Exceptional

95 to 100

Color:

Emerald

Label:

Exceptional

Description:

"We're highly confident this reflects your relationship."

---

### High

85 to 94

Color:

Green

Label:

High

Description:

"This draft closely matches your usual style."

---

### Good

70 to 84

Color:

Blue

Label:

Good

Description:

"This draft should be a solid starting point."

---

### Needs Attention

50 to 69

Color:

Amber

Label:

Needs Attention

Description:

"We're missing some recent context."

---

### Limited

Below 50

Color:

Neutral Gray

Label:

Limited Context

Description:

"We recommend reviewing this carefully."

The system intentionally avoids alarming red confidence indicators.

Low confidence is usually caused by insufficient information, not an AI failure.

---

# Confidence Explanation Panel

Selecting the confidence badge expands an explanation panel.

The panel answers:

Why is confidence at this level?

What helped?

What could improve future drafts?

---

Example

Confidence: High

Why?

✓ Recent memories available

✓ Personality profile complete

✓ Preferred tone established

✓ Previous cards available

Improve further:

• Add a recent life update

• Share another favorite memory

• Confirm current interests

No numerical weights are shown.

No probability values are exposed.

---

# Confidence Behavior

Confidence updates live while editing.

Examples:

Adding a meaningful memory may increase confidence.

Deleting personal details may lower confidence.

Changing tone has little effect.

Every confidence change animates smoothly.

Duration:

300ms

The badge should never flash or jump.

---

# Automation Timeline

The Automation Timeline provides complete transparency into everything the concierge plans to do.

Users should never wonder:

"What happens next?"

---

## Timeline Philosophy

Every automated action is visible before it happens.

Nothing feels hidden.

Nothing feels surprising.

Every future action can be inspected.

Many can be modified.

Some can be skipped.

---

## Timeline Structure

Grouped chronologically.

Example:

```

Today

Tomorrow

This Week

Next Week

Later

```

Each section automatically collapses once it contains more than ten actions.

---

## Timeline Item Layout

Each item contains:

Status icon

Action title

Relationship

Reason

Scheduled time

Estimated duration

Action menu

---

Example

Birthday Draft

Emily

Tomorrow at 9:00 AM

Preparing birthday message

Estimated time:

15 seconds

---

Another Example

Memory Check In

Dad

Friday

Relationship has been quiet for 90 days

Estimated time:

30 seconds

---

## Timeline Statuses

Scheduled

Preparing

Waiting

Awaiting Approval

Paused

Skipped

Completed

Cancelled

Every status uses consistent icons across the application.

---

## Timeline Item Actions

Available actions depend on status.

Possible actions include:

Run Now

Pause

Skip

Reschedule

Edit Rule

View Details

Never overwhelm the user.

Maximum of three visible actions.

Remaining actions appear in overflow.

---

# Recommendations

Recommendations are opportunities.

They are never warnings.

They should feel like thoughtful advice from a trusted assistant.

---

## Recommendation Categories

Relationship

Memory

Card

Profile

Holiday

Celebration

Opportunity

Health

Each category has its own illustration.

---

## Relationship Recommendation

Example

"You haven't spoken much about James lately."

Reason:

Recent updates are becoming outdated.

Primary Action:

Share an Update

Secondary:

Dismiss

---

## Celebration Recommendation

Example

"Emily recently received a promotion."

Suggested Action:

Send a Congratulations card.

---

## Memory Recommendation

Example

"You mentioned a great vacation last summer. Adding one more recent memory will make future birthday cards even stronger."

---

## Profile Recommendation

Example

"We still don't know Michael's favorite hobbies."

Primary Action:

Answer Question

---

## Recommendation Behavior

Recommendations disappear when:

Completed

Dismissed

No longer relevant

Recommendations may reappear if the underlying condition returns.

Dismissing does not permanently suppress future recommendations.

---

# Exceptions and Manual Intervention

Automation should gracefully defer to humans whenever uncertainty exists.

Whenever confidence decreases or unusual situations occur, the concierge asks for help rather than making assumptions.

---

## Examples

Recipient recently lost a family member.

Relationship inactive for several years.

Birthday date recently changed.

Conflicting anniversary information.

User manually edited previous drafts heavily.

Delivery timing no longer possible.

These situations trigger manual review.

---

## Manual Intervention Banner

Displayed above affected drafts.

Contains:

Icon

Explanation

Suggested action

Primary button

---

Example

"We noticed conflicting birthday information for Sarah."

Primary Action:

Review Birthday

---

Another Example

"This draft references a memory that may no longer be current."

Primary Action:

Review Draft

---

## Escalation Rules

Automation becomes more conservative when:

Relationship health declines.

Recent memories disappear.

Confidence drops repeatedly.

User rejects multiple drafts.

Significant profile changes occur.

The system explains why.

Nothing changes silently.

---

# Notification Behaviors

Notifications exist to reduce anxiety.

Not to increase interruptions.

Every notification must earn the user's attention.

---

## Notification Priority Levels

Critical

High

Normal

Passive

---

### Critical

Examples:

Mailing deadline today.

Delivery problem.

Approval required immediately.

Delivered immediately.

---

### High

Examples:

Birthday approaching.

Approval queue growing.

Autopilot paused unexpectedly.

Delivered according to notification preferences.

---

### Normal

Examples:

Fresh recommendation.

Profile suggestion.

Memory reminder.

Included in digests when appropriate.

---

### Passive

Examples:

Automation completed.

Confidence improved.

Relationship health increased.

Usually appears only inside the application.

---

## Notification Content

Every notification answers:

What happened?

Why does it matter?

What should I do?

Never use vague messaging.

---

Good Example

"Emily's birthday card is ready for review. Mailing is scheduled in three days."

Poor Example

"Draft completed."

---

# Search

Search is available within:

Relationship Overrides

Approval Queue

Automation History

Recommendations

---

## Search Behavior

Instant results.

No submit button.

Debounce:

250ms

Searches:

Relationship name

Occasion

Status

Action

Recommendation text

Timeline entries

---

## Empty Search

Placeholder:

"Search relationships, actions, or drafts"

---

## Search Results

Matching text highlighted.

Recent searches remembered during session only.

No permanent history.

---

# Filters

Filters are contextual.

Never display irrelevant filters.

---

## Approval Queue Filters

Status

Occasion

Confidence

Scheduled Date

Relationship

Recently Edited

---

## Timeline Filters

Upcoming

Completed

Skipped

Paused

Relationship

Automation Type

---

## History Filters

Date Range

Relationship

Action Type

Status

Source

---

## Recommendation Filters

Category

Relationship

Priority

Dismissed

---

## Filter Chips

Active filters appear beneath search.

Example

Birthday

Needs Review

Emily

Each chip includes:

Label

Remove button

Clear All appears when more than one filter is active.

---

# Empty States

Every empty state should feel successful rather than unfinished.

---

## Empty Approval Queue

Illustration:

Relaxed concierge desk.

Headline:

You're all caught up.

Body:

"There aren't any drafts waiting for approval right now."

Primary Action:

View Upcoming Actions

---

## Empty Timeline

Headline:

Nothing is scheduled.

Body:

"Once Autopilot has work planned, you'll see it here."

---

## Empty Recommendations

Headline:

No recommendations today.

Body:

"Everything looks healthy. We'll let you know if something deserves your attention."

---

## Empty Overrides

Headline:

Using global settings.

Body:

"Every relationship is currently following your default Autopilot preferences."

---

## Empty History

Headline:

No activity yet.

Body:

"Your concierge hasn't completed any automated actions yet."

---

# Loading States

Loading should reinforce that meaningful work is taking place.

Never use spinning indicators alone.

---

## Hero Loading

Skeleton placeholders:

Headline

Description

Metrics

Status ring

Quick actions

---

## Approval Queue Loading

Three skeleton approval cards.

Preview lines shimmer.

Buttons appear disabled.

---

## Timeline Loading

Skeleton timeline items.

Animated connectors.

---

## Recommendations Loading

Card placeholders matching final dimensions.

---

## History Loading

Skeleton rows.

Consistent row height.

No layout shifting.

---

## Progressive Loading

Sections load independently.

The hero appears first.

Approval queue second.

Remaining sections continue progressively.

Users should never wait for the entire page before interacting.

The remaining sections define error states, editing interactions, modals, animations, accessibility, analytics, API mapping, performance requirements, acceptance criteria, and definition of done.

# Error States

Errors should always communicate three things:

1. What happened.

2. What the user can do.

3. What F.I. Forgot is doing to help.

Errors should never feel technical.

Users should never see stack traces, API terminology, HTTP codes, or implementation details.

The tone remains calm, reassuring, and solution oriented.

---

# Error Severity Levels

The Autopilot experience uses four severity levels.

## Informational

Something changed.

No action required.

Example:

"Your approval queue has already been updated."

---

## Recoverable

The system could not complete an action.

The user can retry.

Example:

"We couldn't generate this draft right now."

Primary Action:

Try Again

---

## Requires Attention

The user needs to make a decision.

Example:

"A birthday is missing for this relationship."

Primary Action:

Complete Profile

---

## Critical

Automation cannot safely continue.

Example:

"Your mailing address needs to be verified before cards can be sent."

Primary Action:

Review Address

---

# Hero Error State

If Autopilot cannot determine overall status, the hero becomes an informational banner instead of displaying inaccurate information.

The health visualization is replaced with a neutral illustration.

Headline:

"We're temporarily unable to update Autopilot."

Body:

"Your existing cards and relationships are safe. We'll continue trying automatically."

Primary Action:

Refresh

Secondary Action:

View Status

---

# Approval Queue Errors

## Draft Generation Failed

Approval card remains in the queue.

Status changes to:

Needs Attention

Expanded explanation:

"We weren't able to finish preparing this draft."

Actions:

Retry

Open Relationship

Dismiss

---

## Mailing Deadline Conflict

Example:

"There may not be enough time for standard delivery."

Suggested actions:

Upgrade Shipping

Schedule Digital Reminder

Choose Different Date

---

## Delivery Service Unavailable

Status becomes:

Waiting

Explanation:

"We'll automatically try again shortly."

The user should not need to manually retry.

---

# Timeline Errors

Timeline entries never disappear because of an error.

Instead they receive an error badge.

Example:

```

Generate Birthday Draft

Waiting

Temporary Issue

Retry scheduled in 15 minutes.

```

This maintains transparency.

---

# Recommendation Errors

Recommendations rarely fail.

If supporting data cannot be loaded:

Headline:

"Recommendations aren't available yet."

Body:

"We're still analyzing your relationships."

Retry occurs automatically.

---

# Relationship Override Errors

If saving settings fails:

The drawer remains open.

Nothing closes.

User changes remain visible.

Inline banner:

"We couldn't save your changes."

Buttons:

Retry

Discard

No settings silently revert.

---

# Notification Errors

If notification preferences cannot be updated:

Show inline error beneath affected section.

Never lose user selections.

Retry automatically when possible.

---

# Offline Behavior

Autopilot supports graceful offline handling.

If connection is lost:

Approval editing continues.

Relationship settings remain editable.

Timeline becomes read only.

History becomes read only.

Pending changes are queued locally.

Banner:

"You're offline. Changes will sync automatically."

---

# Editing Interactions

Editing should always feel lightweight.

Nothing should feel like filling out enterprise software.

The majority of edits should require one or two interactions.

---

# General Editing Rules

Every editable control provides immediate feedback.

Every save is optimistic whenever safe.

Animations reinforce successful completion.

Unsaved work is protected.

Undo is preferred over confirmation dialogs whenever possible.

---

# Inline Editing

Used whenever editing affects only one property.

Examples:

Notification preference

Automation toggle

Reminder frequency

Relationship override

Interaction:

Click

↓

Control changes

↓

Loading indicator

↓

Success state

No Save button required.

---

# Drawer Editing

Used for:

Relationship Overrides

Advanced Automation

Approval Details

Timeline Details

Drawers preserve context.

The user never loses their place.

---

# Full Screen Editing

Reserved for:

Draft Review

Complex card editing

Letter personalization

No other Autopilot workflow should require full page navigation.

---

# Optimistic Updates

Whenever appropriate:

UI updates immediately.

Backend saves afterward.

If save fails:

Animation reverses smoothly.

Toast appears.

Original value restores.

---

# Undo Behavior

Preferred duration:

Eight seconds.

Toast example:

"Birthday reminders turned off."

Undo

If Undo is selected:

State restores instantly.

No confirmation dialog.

---

# Unsaved Changes

Only long form editing tracks unsaved state.

Examples:

Draft Review

Large notes

Advanced overrides

Closing prompts:

"You have unsaved changes."

Buttons:

Stay

Discard

Save

---

# Confirmation Philosophy

Confirm destructive actions.

Never confirm reversible actions.

---

Requires Confirmation

Delete override

Pause Autopilot

Discard draft

Reset relationship automation

Remove automation history

---

Does Not Require Confirmation

Toggle notifications

Expand sections

Search

Filters

Changing tabs

Viewing history

---

# Modals

Modals interrupt attention.

Use sparingly.

Maximum width:

560px

Radius:

24px

Background blur:

Soft

Animation:

Fade and scale

220ms

---

# Standard Modal Layout

```

Title

Description

--------------------------------

Body

--------------------------------

Secondary Button

Primary Button

```

---

# Pause Autopilot Modal

Title:

Pause Autopilot?

Body:

"Your concierge will stop preparing drafts, requesting updates, and monitoring upcoming events until Autopilot resumes."

Options:

Tomorrow

One Week

Until I Resume

Buttons:

Cancel

Pause

---

# Delete Override Modal

Title:

Remove Relationship Override?

Body:

"This relationship will return to your global Autopilot settings."

Buttons:

Cancel

Remove Override

---

# Reset Automation Modal

Title:

Reset All Automation Settings?

Body:

"This restores the recommended defaults for every relationship."

Buttons:

Cancel

Reset

---

# Draft Discard Modal

Title:

Discard Draft?

Body:

"Any edits you've made will be permanently removed."

Buttons:

Keep Editing

Discard Draft

---

# Success Toasts

Position:

Bottom right desktop.

Bottom center mobile.

Maximum width:

360px

Duration:

Four seconds.

Examples:

"Draft approved."

"Automation resumed."

"Relationship updated."

"Notification preference saved."

Each toast includes:

Success icon

Message

Undo when appropriate

---

# Animations

Motion should communicate confidence.

Never entertainment.

Animation should reinforce state changes.

---

# Timing

Micro:

120ms

Small:

180ms

Standard:

240ms

Large:

320ms

Hero:

700ms

Status ring:

900ms

---

# Hero Entrance

Sequence:

Status headline

↓

Description

↓

Visualization

↓

Metrics

↓

Buttons

Each fades upward.

Delay between elements:

60ms

---

# Approval Cards

Hover:

Elevation increases.

Scale:

1.02

Shadow softens.

Leaving hover reverses naturally.

---

# Approve Animation

Selecting Approve:

Checkmark appears.

Card compresses slightly.

Success glow.

Card fades from queue.

Remaining cards slide upward.

Duration:

350ms

---

# Timeline Animation

Items appear sequentially.

Connector line draws downward.

Status icon fades.

Text appears last.

---

# Recommendation Cards

Hover:

Illustration lifts slightly.

Button fades in.

Dismiss animation:

Card slides sideways.

Remaining cards reorganize.

---

# Drawer Animation

Desktop:

Slide from right.

Tablet:

Slide upward slightly.

Mobile:

Bottom sheet expansion.

Duration:

260ms.

---

# Progress Ring Animation

On page load:

Ring fills from zero.

Percentage counts upward.

Animation occurs only once per visit.

---

# Microinteractions

Every successful interaction should feel acknowledged.

Never exaggerated.

---

## Toggle

Switch slides.

Background color transitions.

Small confirmation pulse.

---

## Search

Results fade naturally.

Matching text highlights.

No flashing.

---

## Filter Chips

Adding chip:

Scale in.

Removing:

Shrink and fade.

Remaining chips reposition smoothly.

---

## Confidence Badge

Changing confidence:

Color morphs.

Icon transitions.

Label crossfades.

No abrupt replacement.

---

## Buttons

Primary:

Subtle press animation.

Secondary:

Opacity shift.

Danger:

Slight darkening.

Disabled:

No movement.

---

## Timeline Status

Status changes animate with:

Icon transition.

Label fade.

Background color interpolation.

---

## Recommendation Completion

After action:

Checkmark briefly appears.

Card fades.

Replacement recommendation slides into position when available.

---

## Empty States

Illustration fades first.

Headline follows.

Supporting text.

Primary action appears last.

No empty state should feel abrupt.

---

# Reduced Motion

If the operating system requests reduced motion:

Disable:

Scale effects

Large transitions

Sequential entrances

Replace with:

Opacity changes

Instant positioning

Short fades

The experience remains fully understandable without animation.

The next section defines keyboard behavior, accessibility requirements, analytics instrumentation, API data mapping, performance considerations, acceptance criteria, and the final definition of done.

# Keyboard Behavior

The entire Autopilot experience must be fully operable without a mouse.

Every interactive element is keyboard accessible.

No functionality is exclusive to pointer devices.

Keyboard navigation should feel intentional and predictable.

---

# General Navigation

Tab order always follows the visual hierarchy.

```

Page Header

↓

Status Hero

↓

Approval Queue

↓

Upcoming Timeline

↓

Recommendations

↓

Relationship Overrides

↓

Global Settings

↓

Notification Settings

↓

Automation History

```

Focus should never jump unexpectedly.

---

# Focus Indicators

Every interactive element displays a highly visible focus state.

Focus ring:

Uses the global accessibility color.

Minimum contrast ratio:

3:1 against adjacent colors.

Focus should never rely solely on shadows.

---

# Hero Actions

Keyboard shortcuts:

Tab

Move between actions.

Enter

Activate.

Space

Activate buttons and toggles.

Escape

Closes open menus.

---

# Approval Queue Navigation

Each approval card is treated as a focus group.

Tab enters the card.

Arrow keys move between actions within the card.

Enter opens the selected action.

Example

```

Approval Card

↓

Approve

↓

Review

↓

Overflow Menu

```

Selecting Escape returns focus to the card container.

---

# Draft Review Keyboard Behavior

The Draft Review workspace behaves like a document editor.

Standard editing shortcuts remain available.

Examples:

Ctrl + A

Select all.

Ctrl + Z

Undo.

Ctrl + Shift + Z

Redo.

Ctrl + C

Copy.

Ctrl + V

Paste.

Ctrl + B

Bold when supported by editor.

No custom shortcuts should override expected editing behavior.

---

# Timeline Navigation

Arrow Up

Previous action.

Arrow Down

Next action.

Enter

Expand details.

Escape

Collapse details.

---

# Search

Typing immediately places characters into the focused search field.

Escape clears search when field is empty.

Enter selects the highlighted result.

Arrow keys navigate suggestions.

---

# Filter Chips

Left and Right

Move between chips.

Delete

Removes focused chip.

Enter

Activates chip.

---

# Relationship Override Drawer

Tab cycles through controls.

Escape closes the drawer only if there are no unsaved changes.

If unsaved changes exist:

Confirmation dialog appears.

Focus remains trapped inside the dialog.

---

# Modal Behavior

All modals trap keyboard focus.

Tab cycles within the modal.

Escape closes the modal unless confirmation is required.

Closing returns focus to the initiating control.

---

# Accessibility Requirements

Accessibility is a core product requirement.

It is not a later enhancement.

Every user should be able to confidently manage their relationships regardless of ability.

---

# WCAG Target

Minimum compliance target:

WCAG 2.2 AA

AAA should be achieved whenever practical.

---

# Color

No information is communicated using color alone.

Examples:

Confidence badges also include labels.

Statuses include icons.

Errors include explanatory text.

Notifications include descriptive titles.

---

# Contrast

Minimum ratios:

Normal text:

4.5:1

Large text:

3:1

Interactive controls:

3:1

Charts and visualization elements follow the design system accessibility rules defined previously.

---

# Screen Readers

Every major section is announced with landmarks.

Examples:

Main

Navigation

Region

Complementary

Search

Dialog

---

# Hero Announcement

Screen reader example:

"Autopilot status. Healthy. Three drafts awaiting approval. Four upcoming automated actions."

The summary should be concise.

---

# Approval Cards

Each approval card announces:

Recipient

Occasion

Scheduled mailing date

Confidence

Status

Available actions

Example:

"Emily birthday card. Scheduled for July 12. High confidence. Awaiting review."

---

# Confidence Indicators

Screen readers never announce only:

High

Instead:

"High confidence. Recent memories and relationship profile were used to personalize this draft."

---

# Timeline

Each timeline item announces:

Action

Relationship

Scheduled time

Current status

---

# Recommendations

Recommendation cards announce:

Category

Recommendation

Relationship

Primary action

Dismiss action

---

# Forms

Every toggle includes:

Visible label

Accessible label

Associated description

Error message when applicable

Instructions are never hidden behind placeholder text alone.

---

# Motion Accessibility

Reduced motion preference is respected globally.

Animations become fades.

Progress ring instantly completes.

Card movement is removed.

No functionality depends on animation.

---

# Touch Accessibility

Minimum touch target:

48 by 48 pixels.

Spacing between controls prevents accidental taps.

Swipe interactions always have visible alternatives.

---

# Analytics Events

Every important Autopilot interaction should generate analytics events.

The goal is understanding user trust, not maximizing engagement.

No event should contain personal relationship content.

Only metadata.

---

# Status Events

```

autopilot_opened

autopilot_resumed

autopilot_paused

autopilot_mode_changed

autopilot_settings_saved

```

Properties:

Mode

Source

Platform

Timestamp

---

# Approval Queue Events

```

approval_queue_opened

draft_review_opened

draft_approved

draft_rejected

draft_saved

draft_rewritten

bulk_approval_started

bulk_approval_completed

```

Properties include:

Confidence level

Occasion

Relationship type

Approval duration

Manual edits made

---

# Timeline Events

```

timeline_opened

timeline_item_expanded

timeline_action_skipped

timeline_action_rescheduled

timeline_action_run_now

```

---

# Recommendation Events

```

recommendation_viewed

recommendation_dismissed

recommendation_completed

recommendation_expanded

```

Properties:

Recommendation category

Relationship type

Age of recommendation

---

# Search Events

```

autopilot_search

autopilot_filter_applied

autopilot_filter_removed

```

Never log search text containing relationship names.

Instead log:

Search category

Number of results

---

# Override Events

```

relationship_override_created

relationship_override_removed

relationship_override_updated

```

---

# API Data Mapping

This specification preserves every existing backend contract.

No database schema changes are required.

The frontend consumes existing services through presentation specific view models.

---

# Status Hero Mapping

Consumes:

Overall Autopilot status

Relationship health summary

Pending approval count

Upcoming event count

Automation statistics

No business logic moves into the frontend.

---

# Approval Queue Mapping

Existing draft endpoints provide:

Draft ID

Relationship ID

Recipient information

Occasion

Confidence

Draft body

Mailing status

Scheduled date

Frontend responsibilities:

Sorting

Grouping

Filtering

Presentation

Selection state

---

# Timeline Mapping

Consumes existing scheduled automation records.

Each item maps to:

Action

Trigger

Relationship

Execution time

Current status

Optional explanation

The frontend groups entries by date.

---

# Recommendation Mapping

Recommendations originate from existing AI recommendation services.

Frontend responsibilities:

Categorization

Illustration assignment

Priority ordering

Dismiss state

Animations

---

# Relationship Overrides

Maps existing relationship settings.

Frontend stores only temporary editing state.

Saving immediately writes through existing APIs.

---

# Notification Settings

Maps directly onto existing notification preference endpoints.

No frontend persistence outside temporary form state.

---

# Automation History

History consumes existing automation logs.

Frontend responsibilities include:

Pagination

Grouping

Expansion

Filtering

Search

Presentation

---

# Performance Considerations

Autopilot should feel operational immediately.

Even with hundreds of relationships.

---

# Initial Load

Target:

Under 1.5 seconds perceived load.

Hero renders first.

Approval Queue second.

Remaining sections progressively hydrate.

---

# Lazy Loading

Automation History loads on demand.

Recommendation illustrations lazy load.

Large relationship drawers load only when opened.

Timeline details load when expanded.

---

# Virtualization

Required when:

History exceeds 100 records.

Timeline exceeds 200 actions.

Relationship Overrides exceed 150 rows.

---

# Caching

Relationship settings cached for current session.

Recommendations cached until refresh.

Approval queue refreshed automatically after approval.

Timeline refreshes after significant automation events.

---

# Optimistic Rendering

Used for:

Toggle changes

Notification preferences

Approvals

Relationship overrides

Undo supported wherever practical.

---

# Acceptance Criteria

The Autopilot implementation is considered complete only when all of the following are true.

## Experience

Users understand the overall health of their concierge within five seconds.

Pending approvals are always immediately discoverable.

Upcoming automation is transparent.

Recommendations feel helpful rather than intrusive.

Relationship overrides are simple to manage.

Settings remain approachable.

---

## Interaction

Every action provides immediate feedback.

Animations reinforce state.

Undo exists where appropriate.

Search and filters behave consistently.

Keyboard navigation is complete.

Accessibility requirements are fully met.

---

## Technical

No existing backend functionality is modified.

No API contracts change.

Existing AI pipelines remain intact.

Existing Stripe, authentication, Handwrytten, and notification systems continue functioning unchanged.

Responsive layouts perform correctly on desktop, tablet, and mobile.

Performance targets are achieved.

---

# Definition of Done

The Autopilot experience is complete when:

The interface communicates confidence rather than complexity.

Users trust that their important relationships are being cared for.

Every automated action is understandable.

Nothing important happens without appropriate visibility.

Users can confidently review, approve, modify, or override any automated decision.

The experience feels calm, premium, thoughtful, and unmistakably human.

Autopilot no longer resembles an automation dashboard.

It feels like working with a world class Relationship Concierge that quietly handles the details while keeping the user fully informed and confidently in control.



