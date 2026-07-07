# 85_CALENDAR_BUILD_[SPEC.md](http://SPEC.md)

# Calendar Build Specification

---

# Purpose

The Calendar page is the user's relationship timing system.

It is not a generic calendar.

It is not a task list.

It is not a reminder wall.

It is the place where F.I. Forgot shows the user what thoughtful action is needed, when it matters, and for whom.

The Calendar exists to answer five questions immediately:

1. What relationship moments are coming up?

2. Which ones need action?

3. Which people should I not forget?

4. What cards are already handled?

5. What does the Relationship Concierge recommend next?

The Calendar should make the user feel ahead of life, not behind it.

The experience should communicate calm preparedness.

The user should never feel surprised by an important date.

The Relationship Concierge should feel like it is quietly watching the calendar and helping the user show up well.

---

# Philosophy

The Calendar is not organized around dates alone.

It is organized around care.

A birthday is not just a date.

An anniversary is not just an event.

Mother's Day is not just a holiday.

Each event represents a moment where the user has an opportunity to be thoughtful.

The Calendar should always frame upcoming dates through the lens of relationship action.

Every event should answer:

Who is this for?

Why does it matter?

What should I do?

Has F.I. Forgot already handled it?

The page should avoid the feeling of administrative pressure.

It should feel like a premium concierge briefing.

The user should feel:

"I know what is coming."

"I know what needs my attention."

"I trust the system to help me handle it."

---

# Core Experience Principles

The Calendar must follow these principles:

1. Relationship moments are more important than empty dates.

2. Urgency should be clear but never stressful.

3. Completed actions should create confidence.

4. Autopilot should be visible but not intrusive.

5. Every event should connect back to a person.

6. The user should always know the next best action.

7. The interface should feel calm, warm, and premium.

---

# Primary User Goals

Users visit the Calendar to:

• see upcoming birthdays

• see upcoming anniversaries

• review holidays requiring cards

• check what is already scheduled

• start a card for an upcoming event

• confirm Autopilot coverage

• add a custom occasion

• understand which events need attention

• browse by month, week, or agenda

• avoid forgetting important people

The page should support all of these goals without requiring the user to understand backend workflows.

---

# Information Hierarchy

The Calendar page follows this hierarchy:

1. Page header

2. Calendar summary briefing

3. View controls

4. Primary calendar surface

5. Upcoming action panel

6. Event details

7. Quick actions

8. Empty, loading, and error states

The top of the page should summarize what matters.

The main calendar should visualize timing.

The supporting panels should guide action.

---

# Desktop Layout Specification

Maximum content width:

1440 px

Outer page padding:

48 px

Top spacing below global navigation:

40 px

Bottom spacing:

80 px

Primary layout:

Two column desktop layout.

Left column:

Calendar surface.

Right column:

Upcoming action panel.

Desktop structure:

```text

----------------------------------------------------

Global Navigation

----------------------------------------------------

Page Header

Calendar Briefing

View Controls

----------------------------------------------------

Calendar Surface                  Upcoming Panel

Calendar Surface                  Upcoming Panel

Calendar Surface                  Upcoming Panel

----------------------------------------------------

```

Column widths:

Left column:

Flexible, approximately 68 percent.

Right column:

360 px fixed.

Column gap:

32 px

---

# Page Header

The page header sets context and emotional reassurance.

Desktop layout:

```text

Calendar

See what matters before it matters.

                                      + Add Occasion

```

Title:

48 px

Weight:

700

Color:

Primary text

Subtitle:

18 px

Weight:

400

Color:

Secondary text

Primary action:

Add Occasion

Icon:

Plus

Button height:

48 px

Button alignment:

Right aligned on desktop.

---

# Calendar Briefing

The Calendar Briefing appears directly beneath the header.

Purpose:

Give the user an immediate concierge summary.

It should not feel like analytics.

It should feel like a calm personal briefing.

Desktop layout:

```text

----------------------------------------------------

You're covered for 8 upcoming moments.

2 need your attention this week.

6 are already on Autopilot.

[Review Needed] [Autopilot Ready] [Cards Scheduled]

----------------------------------------------------

```

Card style:

Background:

Warm off white

Border:

1 px neutral border

Radius:

24 px

Padding:

24 px

Spacing below:

32 px

---

# Calendar Briefing Content

The briefing contains:

Primary summary sentence

Secondary detail sentence

Status chips

Optional recommendation

Example:

```text

You're covered for the next 30 days.

Alex's birthday needs approval this week.

Sarah and Mom are already handled by Autopilot.

```

The briefing should always prioritize plain language over metrics.

---

# View Controls

View controls appear beneath the briefing.

Desktop layout:

```text

[Month] [Week] [Agenda]                  Today     < July 2026 >

```

Left side:

View toggle

Right side:

Today button

Previous period button

Current period label

Next period button

Spacing:

24 px below controls.

---

# Calendar Views

The Calendar supports three views:

Month

Week

Agenda

Default view:

Agenda for mobile.

Month for desktop.

Persist the user's last selected view.

---

# Month View Desktop Specification

Month view is the default desktop visualization.

It should feel spacious and scannable.

Grid:

7 columns

6 rows maximum

Header row:

Days of week

Cell height:

Minimum 132 px

Gap:

1 px or shared border model

Calendar background:

White

Border:

1 px neutral

Radius:

28 px

Overflow:

Contained.

---

# Month Cell Structure

Each day cell includes:

Day number

Today indicator

Event pills

Overflow indicator

Optional muted state for outside month days

Cell padding:

12 px

Day number size:

14 px

Event spacing:

6 px

---

# Event Pills

Event pills represent relationship moments.

Each pill contains:

Recipient name

Occasion type

Status indicator

Example:

```text

Sarah Birthday

```

Pill height:

28 px

Radius:

999 px

Padding:

8 px horizontal

Font size:

13 px

Maximum visible pills per day:

3 desktop

2 tablet

Mobile month view is simplified.

Overflow:

```text

+4 more

```

Clicking overflow opens day detail panel.

---

# Event Status Visual System

Every event has one visible status.

Statuses:

Needs Attention

Draft Ready

Scheduled

Sent

Autopilot

Missing Info

Overdue

The status determines pill styling.

No status may rely on color alone.

Each status includes:

Color

Text

Icon or dot

Accessible label

---

# Month View Interactions

Click day cell:

Opens day detail panel.

Click event pill:

Opens event detail panel.

Double click empty day:

Opens Add Occasion modal with date prefilled.

Keyboard Enter on focused day:

Opens day detail panel.

Keyboard Enter on focused event:

Opens event detail panel.

---

# Week View Desktop Specification

Week view is for users who want immediate near term focus.

Layout:

7 day columns

Each column represents one day.

Column gap:

16 px

Each day column includes:

Day label

Date

Event cards

Concierge recommendation if available

---

# Week Day Column

Card style:

Background white

Border 1 px neutral

Radius 24 px

Padding 16 px

Minimum height:

520 px desktop

Day header:

```text

Monday

July 6

```

Today receives accent outline.

---

# Week Event Card

Week view uses richer event cards than month view.

Each event card includes:

Recipient avatar

Recipient name

Occasion

Due timing

Status

Primary action

Example:

```text

Sarah

Birthday

In 3 days

Approve Card

```

Card height:

Auto

Minimum:

112 px

Radius:

18 px

Padding:

16 px

---

# Agenda View Desktop Specification

Agenda view is the most relationship focused view.

It is optimized for action.

Events are grouped by time period instead of calendar grid.

Default groups:

Today

This Week

This Month

Next 90 Days

Later

Each group includes:

Heading

Count

Event cards

---

# Agenda Event Card

Agenda event cards are the richest event format.

Structure:

```text

Avatar

Recipient Name

Relationship

Occasion

Date

Status

Concierge Note

Primary Action

Secondary Actions

```

Desktop layout:

Horizontal card.

Height:

132 px minimum

Padding:

20 px

Radius:

24 px

Background:

White

Border:

1 px neutral

Hover:

Soft elevation

---

# Agenda Card Primary Action

The primary action changes by status.

Needs Attention:

Start Card

Draft Ready:

Review Draft

Scheduled:

View Scheduled Card

Sent:

View Card

Missing Info:

Complete Details

Autopilot:

Review Autopilot

Overdue:

Handle Now

Only one primary action appears.

Secondary actions remain available in overflow.

---

# Right Upcoming Panel

The right panel is a persistent concierge sidebar on desktop.

Width:

360 px

Position:

Sticky

Top offset:

96 px

Contains:

This Week

Needs Attention

Autopilot Coverage

Recent Activity

---

# Upcoming Panel Structure

```text

This Week

3 moments coming up

Sarah Birthday          Review

Alex Birthday           Scheduled

Mom Anniversary         Autopilot

Needs Attention

2 items

Complete Mom's address

Approve Sarah's card

```

Panel cards:

Background:

White

Border:

1 px neutral

Radius:

24 px

Padding:

20 px

Spacing:

16 px

---

# Tablet Layout Specification

Breakpoint:

768 px to 1199 px

Outer padding:

32 px

Layout:

Single column.

Right panel moves below calendar surface.

View controls remain horizontal.

Month grid remains available.

Calendar cell height:

112 px

Event pills visible:

2 per day

Overflow appears sooner.

Agenda cards become stacked.

---

# Tablet Structure

```text

Header

Briefing

View Controls

Calendar Surface

Upcoming Panel

```

Spacing:

24 px between major sections.

Add Occasion remains in header but may wrap beneath subtitle.

---

# Mobile Layout Specification

Breakpoint:

Below 768 px

Outer padding:

20 px

Top spacing:

24 px

Bottom spacing:

96 px

Default view:

Agenda

Month view remains available but simplified.

Week view becomes horizontal day carousel.

---

# Mobile Header

```text

Calendar

What is coming up.

[+ Add]

```

Title:

36 px

Subtitle:

16 px

Add button:

Full width or compact depending available width.

---

# Mobile Calendar Briefing

Briefing becomes a compact card.

Padding:

18 px

Radius:

22 px

Copy is shorter.

Example:

```text

2 moments need attention this week.

5 are already handled.

```

Status chips wrap.

---

# Mobile View Controls

Layout:

```text

[Agenda] [Month] [Week]

< July 2026 >   Today

```

Controls stack across two rows.

Touch targets:

Minimum 44 px.

---

# Mobile Agenda View

Primary mobile experience.

Single column.

Event cards stacked.

Groups remain:

Today

This Week

This Month

Later

Cards use compact vertical layout.

---

# Mobile Agenda Card

Structure:

```text

Avatar + Name

Occasion + Date

Status

Primary Action

```

Recent concierge note appears only if important.

Card padding:

18 px

Radius:

22 px

Primary action:

Full width.

---

# Mobile Month View

Month grid is simplified.

Day cells show:

Day number

Status dots

Maximum visible indicators:

3 dots

No text pills inside month cells.

Tapping a day opens bottom sheet with events.

---

# Mobile Week View

Week view becomes a horizontal carousel.

Each day is a full width card.

Swipe changes day.

Day picker appears above.

```text

Mon Tue Wed Thu Fri Sat Sun

```

Selected day displays events below.

---

# Responsive Behavior

Above 1440 px:

Content remains centered.

Desktop two column layout maintained.

Between 1200 px and 1439 px:

Standard desktop layout.

Between 992 px and 1199 px:

Tablet layout begins.

Right panel moves below main calendar.

Between 768 px and 991 px:

Single column tablet.

Month cells compress.

Between 480 px and 767 px:

Mobile agenda default.

Month simplified.

Week carousel enabled.

Below 480 px:

Padding reduces to 16 px.

Typography scales down according to design tokens.

All controls remain accessible.

No horizontal page scrolling is allowed.





---

# Complete Component Tree

```text

CalendarPage

│

├── GlobalNavigation

│

├── PageContainer

│   │

│   ├── PageHeader

│   │   ├── Title

│   │   ├── Subtitle

│   │   └── AddOccasionButton

│   │

│   ├── CalendarBriefing

│   │   ├── Summary

│   │   ├── Recommendation

│   │   ├── StatusChips

│   │   └── ConciergeInsight

│   │

│   ├── CalendarToolbar

│   │   ├── ViewToggle

│   │   ├── TodayButton

│   │   ├── PreviousButton

│   │   ├── DateDisplay

│   │   ├── NextButton

│   │   └── CalendarSearch

│   │

│   ├── CalendarContent

│   │   ├── MonthView

│   │   ├── WeekView

│   │   └── AgendaView

│   │

│   ├── UpcomingSidebar

│   │   ├── ThisWeekCard

│   │   ├── NeedsAttentionCard

│   │   ├── AutopilotCard

│   │   └── RecentActivityCard

│   │

│   ├── EmptyState

│   ├── LoadingState

│   └── ErrorState

│

├── EventDetailDrawer

├── DayDetailDrawer

├── AddOccasionModal

├── EditOccasionModal

├── DeleteOccasionModal

└── ToastNotifications

```

Every component follows the shared design system established throughout the playbook.

No Calendar specific component should introduce unique visual styles unless explicitly defined here.

---

# Header Specification

The Calendar header establishes emotional context before introducing functionality.

It reminds the user that this page is about meaningful moments rather than dates.

---

## Header Layout

Desktop

```text

Calendar

See what matters before it matters.

                              + Add Occasion

```

Tablet

```text

Calendar

See what matters before it matters.

+ Add Occasion

```

Mobile

```text

Calendar

What is coming up.

[+ Add]

```

---

## Title

Typography:

Display Large

48 px desktop

40 px tablet

36 px mobile

Weight:

700

Color:

Primary heading color.

Maximum:

One line.

---

## Subtitle

Typography:

18 px desktop

17 px tablet

16 px mobile

Maximum width:

640 px

Color:

Secondary text color.

Suggested copy:

> See what matters before it matters.

---

## Add Occasion Button

Purpose:

Create a personal event outside of birthdays and anniversaries.

Examples:

Graduation

Wedding

Promotion

Retirement

Vacation

Adoption

Personal reminder

Behavior:

Opens the Add Occasion modal.

No page transition.

---

# Calendar Search

The Calendar includes lightweight search.

Purpose:

Quickly locate a relationship event.

Search is intentionally simpler than the Your People page.

---

## Search Scope

Matches:

Recipient name

Occasion type

Relationship

Holiday

Custom event title

Location (future support)

Search never searches memories.

---

## Search Placement

Desktop:

Right side of toolbar.

Maximum width:

320 px.

Tablet:

Below toolbar.

Mobile:

Inside filter sheet.

---

## Search Behavior

Typing filters immediately.

No submit button.

Maximum debounce:

150 milliseconds.

Escape clears search.

Search always preserves the current calendar view.

---

## Empty Search Results

Headline:

No matching occasions.

Supporting text:

Try another name or clear your search.

Actions:

Clear Search

---

# Calendar Navigation

Navigation should feel immediate.

Moving through months or weeks must never require a page reload.

---

## Previous Button

Moves:

Previous month

Previous week

Previous agenda period

depending on active view.

Animation:

Slide.

Duration:

250 milliseconds.

---

## Next Button

Moves forward using the same logic.

Navigation preserves:

Selected filters

Search

View preference

---

## Today Button

Returns immediately to today's date.

If already viewing today:

Button becomes disabled.

---

## Current Period Label

Examples:

July 2026

Week of July 6

Upcoming Events

Label updates dynamically.

---

# Calendar Controls

The toolbar contains:

View selector

Today

Previous

Next

Current date

Search

Future enhancements may include:

Export

Print

Calendar sync

These are intentionally excluded from the MVP.

---

# Month View

The Month View provides a broad overview of relationship activity.

It emphasizes awareness over detailed interaction.

Users should immediately identify busy periods.

---

## Calendar Grid

Columns:

7

Rows:

5 or 6

Days outside current month:

Visible.

Muted.

Still interactive.

---

## Weekday Headers

Monday through Sunday or locale specific order.

Typography:

14 px

Semibold.

Background:

Subtle neutral surface.

Height:

48 px.

---

## Today Cell

Today is visually emphasized.

Treatment:

Accent border.

Soft background tint.

Small "Today" badge.

The emphasis should be elegant rather than loud.

---

## Event Density

Maximum visible events:

Three desktop.

Two tablet.

Dots only on mobile.

Overflow indicator:

```

+4 more

```

Selecting overflow opens the Day Detail drawer.

---

## Empty Day

Empty days remain clean.

No placeholder content.

Hover state still appears.

Double click creates a custom occasion.

---

# Week View

Week View prioritizes planning.

Every day acts like an agenda column.

Users can understand an entire week without opening individual events.

---

## Day Column

Contains:

Date

Weekday

Events

Recommendations

Empty message if no events.

Example:

```

Wednesday

July 8

No relationship moments today.

```

---

## Event Ordering

Events are sorted by:

Needs Attention

Overdue

Today

Scheduled

Autopilot

Completed

Users should always see actionable items first.

---

## Concierge Recommendation

Each day may include:

One recommendation.

Example:

"You haven't checked in with Sarah in a while."

Recommendations are informational.

Never blocking.

---

# Agenda View

Agenda View is the most action focused experience.

It resembles a personalized briefing instead of a traditional calendar.

This is the default mobile experience.

---

## Group Structure

Groups:

Today

Tomorrow

This Week

Next Week

This Month

Later

Each group displays:

Heading

Count

Relationship event cards

---

## Empty Group

Groups without events are omitted.

The interface should never show empty headings.

---

## Event Card Priority

Each event card answers:

Who?

What?

When?

Status?

Next action?

This information fits within one glance.

---

# Event Cards

Event cards represent a single relationship moment.

They are consistent across all calendar views.

Only layout changes between Month, Week, and Agenda.

---

## Card Structure

```text

Avatar

Recipient Name

Relationship

Occasion

Date

Status

Concierge Insight

Primary Action

Overflow Menu

```

---

## Recipient Avatar

56 px desktop

52 px tablet

48 px mobile

Fallback:

Initials.

Relationship illustration.

Never empty.

---

## Recipient Name

22 px desktop.

Semibold.

Single line.

Ellipsis when necessary.

---

## Relationship Label

Examples:

Wife

Brother

Friend

Client

Parent

Displayed beneath recipient name.

Muted typography.

---

## Occasion Label

Examples:

Birthday

Anniversary

Graduation

Promotion

Holiday

Custom Occasion

Always appears before status.

---

## Event Date

Examples:

Today

Tomorrow

July 8

In 5 days

Overdue by 2 days

Formatting automatically adapts.

---

## Concierge Insight

One optional sentence.

Examples:

Draft is ready for review.

Address still needed.

Autopilot has everything covered.

You recently added a new memory.

Maximum:

Two lines.

Insights should always encourage action or confidence.

---

## Primary Action

The primary action depends on the current event status.

Examples:

Create Card

Review Draft

Approve Card

View Scheduled Card

Log Memory

Complete Profile

Only one primary action appears.

Secondary actions move into the overflow menu.

---

## Overflow Menu

Available actions:

Open Relationship

Edit Occasion

Reschedule Reminder

Skip This Year

Archive Occasion

Delete Custom Occasion

System holidays cannot be deleted.

Birthdays and anniversaries cannot be deleted.

They may only be edited from the Relationship Profile.

---

# Day Detail Drawer

Selecting a calendar day opens a contextual drawer.

Purpose:

Display every relationship moment occurring on that date.

Desktop:

Right side drawer.

Tablet:

Bottom sheet.

Mobile:

Full height bottom sheet.

---

## Drawer Content

Date

Events

Relationship cards

Quick actions

Add Occasion button

Close button

The drawer should not interrupt the user's browsing context.

Background calendar remains visible.



---

# Event Detail Experience

Selecting an individual relationship event opens the Event Detail panel.

The purpose of the panel is not simply to display event information.

It should answer one question:

**"What should I do for this person?"**

The Event Detail experience should always be action oriented.

It should help the user move naturally into writing, reviewing, or approving a card.

---

# Event Detail Layout

Desktop:

Right side slide over panel.

Width:

520 px

Tablet:

Full width modal.

Mobile:

Full screen bottom sheet.

The user should never lose calendar context.

Closing the panel immediately returns the user to the same calendar position.

---

## Event Detail Structure

```text

Recipient Avatar

Recipient Name

Relationship

Occasion

Event Date

Status

Relationship Health

Concierge Recommendation

Upcoming Card Status

Primary Action

Secondary Actions

Recent Memories

Close

```

---

## Recipient Summary

Displayed at the top of the panel.

Includes:

Avatar

Name

Relationship

Relationship Health

Example:

```text

🙂 Sarah

Wife

Relationship Health

94%

Excellent

```

---

## Occasion Information

Displays:

Occasion name

Full date

Relative timing

Examples:

```

Birthday

July 18, 2026

In 12 days

```

or

```

Anniversary

Today

```

If overdue:

```

Birthday

3 days ago

```

Displayed using warning styling.

---

## Status Section

Displays the current card lifecycle.

Possible values:

Needs Attention

Draft Ready

Awaiting Approval

Scheduled

Handwritten

Delivered

Completed

Autopilot

Each status includes:

Icon

Label

Explanation

Example:

```

Draft Ready

Your Relationship Concierge has already prepared a card.

```

---

## Concierge Recommendation

Every event may contain one recommendation.

Examples:

Start writing today.

Review your draft before tomorrow.

Consider mentioning her recent promotion.

You recently added a memory that would make this card even more personal.

Recommendations are generated from existing backend intelligence.

The frontend simply presents them.

---

## Primary Action Area

Only one primary CTA appears.

Examples:

Create Card

Review Draft

Approve Card

Track Delivery

View Card

The button spans the available width on mobile.

Desktop width:

Auto.

---

## Secondary Actions

Available through secondary buttons or overflow.

Examples:

Open Relationship Profile

Log Memory

Edit Occasion

Skip This Year

Reschedule Reminder

Archive Custom Occasion

---

## Recent Memories

The panel displays up to three recent timeline entries.

Example:

```

Started a new job.

Vacationed in Greece.

Finished nursing school.

```

Each memory links directly to the Relationship Profile timeline.

---

# Custom Occasions

Users may create relationship specific occasions that are not automatically generated.

These occasions should behave identically to birthdays and anniversaries throughout the calendar.

---

## Examples

Graduation

Promotion

Wedding

Retirement

Baby Shower

Housewarming

Adoption Day

Memorial

Personal Tradition

Vacation Send Off

Family Reunion

Custom Reminder

---

## Add Occasion Modal

Purpose:

Create a new recurring or one time relationship event.

---

### Fields

Occasion Name

Recipient

Date

Repeat

Reminder Timing

Notes

Autopilot Eligible

---

### Occasion Name

Free text.

Maximum:

80 characters.

Autocomplete suggests common occasion types.

---

### Recipient

Searchable relationship selector.

Required.

Only one recipient per occasion.

---

### Date

Uses the shared date picker.

Supports:

Single date.

Recurring annual event.

---

### Repeat Options

None

Yearly

Monthly

Custom

Default:

Yearly.

---

### Reminder Timing

Default:

21 days before.

Additional options:

30 days

14 days

7 days

3 days

1 day

Same day

Custom

---

### Notes

Optional.

Maximum:

500 characters.

Used only for user reference.

Never included automatically in card generation.

---

### Autopilot Eligibility

Toggle.

When enabled:

The Relationship Concierge may prepare cards automatically.

Default:

Enabled.

---

# Edit Occasion Modal

Editing uses the same layout as creation.

Additional options:

Archive Occasion

Delete Custom Occasion

View History

Birthdays and anniversaries remain editable only through the Relationship Profile.

---

# Calendar Filters

The Calendar supports filtering independent of the Your People page.

Filtering focuses on relationship moments rather than recipients.

---

## Available Filters

Occasion Type

Status

Relationship

Autopilot

Needs Attention

This Week

This Month

Overdue

Custom Occasions

Completed

Upcoming

---

## Occasion Type Filter

Options:

Birthdays

Anniversaries

Holidays

Graduations

Custom

Other

Multiple selections supported.

---

## Status Filter

Options:

Needs Attention

Draft Ready

Awaiting Approval

Scheduled

Sent

Delivered

Completed

Autopilot

Overdue

---

## Relationship Filter

Uses the same relationship categories defined in the Your People specification.

Partner

Children

Parents

Friends

Family

Clients

Coworkers

Mentors

Other

---

## Autopilot Filter

Options:

All

Handled by Autopilot

Needs Manual Review

Manual Only

---

## Time Filters

Today

Tomorrow

This Week

Next Week

This Month

Next 90 Days

Past Due

---

## Active Filter Chips

Displayed beneath the toolbar.

Each chip includes:

Label

Remove icon

Removing a chip updates the calendar immediately.

---

# Sorting

Sorting primarily affects Agenda View.

Month and Week remain chronological.

---

## Agenda Sort Options

Soonest First

Needs Attention

Relationship Priority

Alphabetical

Newest Added

Oldest Added

Default:

Needs Attention.

---

# Empty States

Every empty state should feel encouraging.

Never sterile.

Never imply failure.

---

## No Events

Illustration:

Warm seasonal calendar illustration.

Headline:

Nothing coming up.

Supporting Copy:

You're all caught up right now.

Your Relationship Concierge will keep watching for the next meaningful moment.

Primary Action:

View Your People

---

## No Search Results

Headline:

No matching occasions.

Supporting Copy:

Try another name or clear your search.

Buttons:

Clear Search

---

## No Filter Results

Headline:

Nothing matches these filters.

Supporting Copy:

Try broadening your filters to see more relationship moments.

Primary Action:

Clear Filters

---

## Empty Month

If an entire month contains no events:

Display a centered illustration inside the calendar grid.

Message:

Enjoy the quiet month.

No relationship moments are scheduled.

---

## First Time User

Illustration:

Relationship calendar.

Headline:

Your relationship calendar starts here.

Supporting Copy:

Add the people who matter most and we'll automatically build your calendar around birthdays, anniversaries, holidays, and meaningful moments.

Primary Action:

Add Your First Person

Secondary Action:

Import Contacts

---

# Loading States

Loading should reassure users that their relationship schedule is being prepared.

Skeletons mirror final layouts exactly.

No layout shifting is permitted.

---

## Initial Page Load

Display:

Header

Briefing skeleton

Toolbar skeleton

Calendar skeleton

Sidebar skeleton

Skeleton shimmer:

Subtle.

Duration:

1.5 seconds.

---

## Month Skeleton

Display placeholder day cells.

Placeholder event pills.

Placeholder weekday headers.

---

## Week Skeleton

Display placeholder columns.

Placeholder event cards.

Placeholder recommendations.

---

## Agenda Skeleton

Display grouped placeholders.

Card heights match final event cards.

---

## Drawer Loading

When opening an event:

Panel opens immediately.

Content skeleton loads inside.

This prevents perceived lag.

---

## Progressive Rendering

Events should render as they become available.

The user should not wait for every event before interacting with the calendar.



---

# Error States

Errors should always communicate confidence.

The user should feel that their information is safe and that recovery is straightforward.

The Calendar should never expose raw server errors, stack traces, or technical language.

Every error state should offer a clear next step.

---

# Calendar Load Failure

Illustration:

Warm concierge themed illustration.

Headline:

We couldn't load your calendar.

Supporting Copy:

Something interrupted the connection. Your relationship schedule is safe.

Primary Action:

Try Again

Secondary Action:

Return to Dashboard

---

## Event Load Failure

If an individual event cannot be loaded:

Display a lightweight inline message inside the Event Detail panel.

Example:

"We couldn't load this event."

Actions:

Retry

Close

The rest of the calendar remains fully usable.

---

## Sidebar Failure

If the Upcoming Sidebar cannot load:

Hide the sidebar.

Expand the calendar to occupy the available width.

Display a small inline message:

"We couldn't load your upcoming summary."

Retry automatically when connectivity returns.

---

## Calendar Navigation Error

If navigating between months or weeks fails:

Remain on the current period.

Display a toast:

"We couldn't load that time period."

Retry

Dismiss

Navigation controls remain enabled.

---

## Save Failure

If creating or editing an occasion fails:

Retain user input.

Do not close the modal.

Display inline validation or synchronization messaging.

Example:

"We couldn't save your occasion."

Primary:

Retry

Secondary:

Cancel

---

## Delete Failure

If deleting a custom occasion fails:

Restore the deleted item visually.

Toast:

"We couldn't delete this occasion."

Retry

Dismiss

---

## Offline State

When connectivity is lost:

Persistent banner appears at the top of the page.

Example:

"You're offline. Your calendar will automatically update when you're back online."

Browsing remains available for cached data.

Actions requiring network access clearly explain why they are unavailable.

---

## Permission Errors

If the user attempts to access an unavailable relationship event:

Display:

"You don't have permission to view this event."

Provide:

Return to Calendar

No technical explanation should be shown.

---

# Editing Interactions

Editing should feel lightweight.

Users should never feel like they are completing long administrative forms.

Most changes should happen with minimal interruption.

---

## Inline Editing

Supported fields:

Custom occasion title

Reminder timing

Autopilot eligibility

Notes

These fields support lightweight inline editing where appropriate.

---

## Modal Editing

Larger edits use dedicated modals.

Examples:

Changing dates

Changing recurrence

Changing recipient

Editing repeat rules

Changing reminder schedules

---

## Autosave

Whenever practical:

Changes save automatically.

Successful saves display a subtle confirmation.

Example:

"Saved"

Confirmation fades after approximately one second.

---

## Validation

Validation occurs while typing.

Examples:

Date required.

Recipient required.

Occasion title required.

Past dates require confirmation.

Validation messages appear directly beneath the affected field.

---

## Unsaved Changes

Closing an editing experience with unsaved changes displays:

Discard Changes?

Buttons:

Continue Editing

Discard

Users should never lose work accidentally.

---

# Animations

Motion reinforces clarity and flow.

Calendar animations should communicate navigation rather than decoration.

Movement should remain calm and predictable.

---

## Standard Timing

Fast:

150 milliseconds.

Standard:

200 milliseconds.

Large transitions:

250 milliseconds.

Page transitions:

300 milliseconds maximum.

---

## Month Navigation

Moving between months:

Calendar slides horizontally.

Outgoing month fades slightly.

Incoming month slides into place.

Duration:

250 milliseconds.

---

## Week Navigation

Week columns slide horizontally.

Events maintain their visual positions whenever possible.

---

## Agenda Navigation

Groups fade smoothly.

Cards reposition using shared motion principles.

No abrupt re rendering.

---

## Event Drawer

Opening:

Drawer slides into view.

Background dims slightly.

Closing:

Drawer slides away.

Background returns.

Duration:

220 milliseconds.

---

## Event Card Hover

Desktop only.

Hover behavior:

Slight elevation.

Soft shadow increase.

Accent border.

Primary action gains emphasis.

---

## Status Change

When an event changes state:

Status badge transitions smoothly.

Examples:

Needs Attention

↓

Draft Ready

↓

Scheduled

↓

Completed

The transition should reinforce progress.

---

## Calendar Cell Hover

Desktop only.

Day cells receive:

Subtle background tint.

Pointer cursor.

Today's cell maintains higher visual priority.

---

## Calendar Selection

Selected day:

Accent outline.

Soft background fill.

Selection persists until another day is chosen.

---

# Microinteractions

Microinteractions make the Calendar feel polished and responsive.

They should communicate confidence without distracting from relationship moments.

---

## Today Button

Hover:

Background subtly darkens.

Click:

Calendar animates back to the current date.

A brief highlight appears around today's cell.

---

## Navigation Arrows

Hover:

Icons brighten slightly.

Press:

Scale to approximately 98 percent.

Navigation begins immediately.

---

## Event Pills

Hover:

Background elevates slightly.

Status indicator becomes more visible.

Click:

Brief press animation before opening the event detail panel.

---

## Event Cards

Hover:

Shadow increases.

Action button becomes fully opaque.

Card lifts approximately 2 px.

Duration:

180 milliseconds.

---

## Primary Action Buttons

Hover:

Shadow increases.

Background darkens slightly.

Press:

Scales to 98 percent.

Success:

Displays subtle checkmark when appropriate.

---

## Add Occasion

Floating button or header button:

Plus icon rotates slightly during press.

Modal opens with shared motion system.

---

## Toast Notifications

Desktop:

Lower right.

Mobile:

Bottom center.

Examples:

Occasion created.

Reminder updated.

Autopilot enabled.

Occasion archived.

Calendar updated.

Auto dismiss:

4 seconds.

Pause on hover.

---

# Keyboard Behavior

The Calendar must be fully usable without a mouse.

Every interaction should be keyboard accessible.

---

## Focus Order

1. Global navigation

2. Page heading

3. Add Occasion button

4. View selector

5. Today button

6. Previous button

7. Date label

8. Next button

9. Search

10. Calendar surface

11. Sidebar

12. Footer (if present)

Focus order must remain logical regardless of the selected calendar view.

---

## Month View Navigation

Arrow Keys:

Move one day.

Up and Down:

Move one week.

Home:

First day of week.

End:

Last day of week.

Page Up:

Previous month.

Page Down:

Next month.

Enter:

Open selected day.

---

## Week View Navigation

Arrow keys move between days.

Tab moves through event cards.

Enter opens the selected event.

---

## Agenda Navigation

Tab moves through groups.

Arrow keys move between event cards.

Enter opens the event.

---

## Search Shortcuts

Ctrl + K

or

⌘ + K

Focus search.

Escape:

Clear search if text exists.

Otherwise remove focus.

---

## Modal Support

Tab cycles through controls.

Shift + Tab cycles backward.

Escape closes when appropriate.

Enter activates the primary action.

Focus always returns to the element that launched the modal.

---

# Accessibility Requirements

Accessibility is a first class requirement.

The Calendar must meet WCAG 2.2 AA compliance throughout.

---

## Semantic Structure

Use semantic HTML elements whenever possible.

Examples:

```html

<header>

<main>

<section>

<nav>

<dialog>

<button>

<table>

```

Month View may use a semantic table structure where appropriate for accessibility while maintaining the visual design.

---

## Headings

Single H1:

Calendar

Calendar groups:

H2

Sidebar cards:

H2 or H3 depending on hierarchy.

Event titles are not headings.

---

## Screen Reader Support

Each event announces:

Recipient name.

Relationship.

Occasion.

Date.

Status.

Primary action.

Example:

"Sarah, Wife, Birthday, July eighteenth, Draft Ready, Review Draft."

---

## Calendar Cells

Each day announces:

Date.

Number of events.

Whether today is selected.

Example:

"Tuesday, July 14. Three relationship events. Today."

---

## Color Contrast

All text meets:

4.5 to 1 minimum.

Large headings:

3 to 1 minimum.

Status colors are never the only indicator.

Every status includes:

Color.

Text.

Icon.

---

## Touch Targets

Minimum size:

44 × 44 px.

Applies to:

Navigation arrows.

Event pills.

Buttons.

Calendar cells.

Status chips.

---

## Reduced Motion

When the operating system requests reduced motion:

Slide animations become fades.

Scaling animations are removed.

Stagger animations are disabled.

All functionality remains identical.

---

# Analytics Events

The Calendar provides valuable insight into how users plan and maintain relationships.

Analytics should capture behavior while respecting user privacy.

No relationship content, card text, or personal memories should ever be transmitted.

Only interaction metadata should be recorded.

---

## Page Events

```

calendar_viewed

calendar_loaded

```

Triggered when the Calendar is successfully displayed.

---

## View Events

```

calendar_month_selected

calendar_week_selected

calendar_agenda_selected

```

Metadata:

Previous view.

New view.

---

## Navigation Events

```

calendar_next_period

calendar_previous_period

calendar_today_selected

```

Metadata:

Current period.

Destination period.

---

## Search Events

```

calendar_search_started

calendar_search_completed

calendar_search_cleared

```

Metadata:

Search length.

Visible result count.

---

## Event Interaction Events

```

calendar_event_opened

calendar_event_closed

calendar_day_opened

calendar_day_closed

```

Metadata:

Occasion type.

Relationship type.

Event status.

---

## Occasion Events

```

occasion_created

occasion_updated

occasion_deleted

occasion_archived

```

Metadata:

Occasion type.

Recurring or one time.

Autopilot enabled.

---

## Action Events

```

calendar_primary_action_clicked

calendar_card_started

calendar_draft_reviewed

calendar_autopilot_opened

```

---

## Error Events

```

calendar_load_failed

calendar_save_failed

calendar_navigation_failed

calendar_event_failed

```

Each event contains only technical diagnostic metadata.

No personally identifiable relationship information is transmitted.



---

# API Data Mapping

The Calendar page is a presentation layer built on top of the existing F.I. Forgot backend.

This specification does **not** modify:

• Business logic

• Database schema

• Authentication

• AI pipelines

• Relationship Health calculations

• Stripe

• Handwrytten integration

• Existing API contracts

The frontend reorganizes existing data into a relationship first calendar experience.

---

# Page Initialization

When the Calendar loads, the frontend retrieves the existing calendar and relationship event data.

The frontend is responsible for:

Rendering the selected calendar view.

Grouping events.

Sorting events.

Filtering events.

Managing local selection state.

Animating transitions.

Persisting UI preferences.

No additional backend processing is required beyond existing calendar endpoints.

---

# Calendar Event Mapping

Each calendar event displayed by the UI maps to an existing relationship event.

The UI expects an event model equivalent to:

```text

Event ID

Recipient ID

Recipient Name

Relationship

Occasion Type

Event Date

Relative Date

Status

Relationship Health

Autopilot Status

Draft Status

Card Status

Timeline Preview

Created Date

Updated Date

```

Existing backend fields are mapped into this presentation model.

The frontend never recalculates relationship intelligence.

---

# Relationship Mapping

Each event references an existing recipient.

Displayed fields include:

Recipient name.

Relationship label.

Avatar.

Relationship Health.

Timeline preview.

Favorite status.

All relationship data originates from the existing relationship APIs.

---

# Occasion Mapping

Supported occasion types include:

Birthday

Anniversary

Valentine's Day

Mother's Day

Father's Day

Christmas

Thanksgiving

Graduation

Wedding

Promotion

Retirement

Custom Occasion

Just Because Recommendation

Future occasion types should automatically render using the shared event component.

---

# Status Mapping

Event status is derived from existing workflow state.

Supported statuses include:

Needs Attention

Draft Ready

Awaiting Approval

Scheduled

Handwritten

Delivered

Completed

Autopilot

Overdue

Missing Information

The frontend presents these states consistently across every calendar view.

---

# Card Workflow Mapping

The Calendar never creates new workflow logic.

Primary actions launch existing experiences.

Examples:

Create Card

↓

Card Creation Flow

Review Draft

↓

Draft Review

Approve Card

↓

Approval Flow

Track Delivery

↓

Delivery Status

Open Relationship

↓

Relationship Profile

---

# Timeline Mapping

Recent memories shown inside Event Detail panels use the existing relationship timeline.

Maximum displayed:

Three entries.

Ordering:

Newest first.

Rich formatting is intentionally omitted.

---

# Search Mapping

Calendar search uses the existing relationship event dataset.

Searchable fields:

Recipient name.

Relationship.

Occasion.

Holiday.

Custom occasion title.

The search experience is intentionally lightweight.

---

# Filter Mapping

Filters operate on the client whenever possible.

Mapped properties include:

Relationship.

Occasion.

Status.

Autopilot.

Time range.

Completion state.

Existing backend filters may be used when available without changing user experience.

---

# Autopilot Mapping

Autopilot indicators display existing automation state.

Examples:

Card already scheduled.

Draft ready.

Waiting for approval.

Fully automated.

The Calendar does not independently determine Autopilot coverage.

---

# Custom Occasion Mapping

Custom occasions use the existing recurring event infrastructure.

Creating a custom occasion:

Creates the event.

Associates it with the recipient.

Schedules reminders.

Makes it available across Calendar, Dashboard, and Relationship Profile.

---

# Error Handling

API failures follow the shared application error strategy.

Frontend responsibilities include:

Maintaining context.

Displaying recovery messaging.

Retrying safely.

Preventing duplicate submissions.

Technical errors remain hidden from users.

---

# Performance Considerations

The Calendar must remain responsive even for users managing hundreds or thousands of relationships.

Performance targets should be met across all supported devices.

---

# Initial Load

Target:

First meaningful content within 1.5 seconds on broadband.

Skeletons appear within:

150 milliseconds.

Navigation controls become interactive immediately after hydration.

---

# Month Rendering

Only visible month cells should render.

Hidden months remain unmounted.

Navigating between months should reuse components whenever possible.

---

# Week Rendering

Week columns render independently.

Only visible event cards mount.

Offscreen content remains virtualized where appropriate.

---

# Agenda Rendering

Large agenda lists should use virtualization after approximately 100 visible events.

Scrolling should remain smooth regardless of dataset size.

---

# Drawer Performance

Opening Event Detail or Day Detail drawers should occur immediately.

Content may load progressively inside the open drawer.

Opening animations should never wait for network requests.

---

# Image Loading

Recipient avatars:

Lazy load.

Use responsive image sizes.

Cache aggressively.

Fade in after loading.

Fallback immediately to initials when necessary.

---

# Search Performance

Filtering local event collections should complete within approximately 100 milliseconds.

Typing should never feel delayed.

Search should remain responsive even while rapidly entering text.

---

# Calendar Navigation Performance

Moving between:

Months

Weeks

Agenda periods

should complete within approximately 250 milliseconds.

Animations should remain smooth on mid range mobile devices.

---

# Memory Usage

Avoid unnecessary duplication of event objects.

Derived collections should be memoized.

Filtering and sorting should reuse cached datasets whenever possible.

---

# Analytics Performance

Analytics collection must never delay rendering.

Events are queued asynchronously.

Duplicate event submissions should be prevented.

---

# Acceptance Criteria

The Calendar experience is considered complete only when every requirement below has been satisfied.

---

## Layout

✓ Desktop layout matches specification.

✓ Tablet layout matches specification.

✓ Mobile layout matches specification.

✓ Responsive breakpoints function correctly.

✓ No horizontal scrolling occurs.

---

## Calendar Views

✓ Month View functions correctly.

✓ Week View functions correctly.

✓ Agenda View functions correctly.

✓ View preference persists across sessions.

---

## Navigation

✓ Previous and Next controls function correctly.

✓ Today button functions correctly.

✓ Current period updates accurately.

✓ Animations remain smooth.

---

## Event Display

✓ Event cards display all required information.

✓ Status indicators are correct.

✓ Overflow handling functions correctly.

✓ Day Detail drawer displays all events.

---

## Event Detail

✓ Event Detail panel opens correctly.

✓ Primary actions launch existing workflows.

✓ Recent memories display correctly.

✓ Relationship Health displays correctly.

---

## Custom Occasions

✓ New occasions can be created.

✓ Existing occasions can be edited.

✓ Recurring options function correctly.

✓ Reminder settings persist.

---

## Search

✓ Search updates immediately.

✓ Empty search state functions.

✓ Search keyboard shortcuts function.

---

## Filters

✓ Multiple filters work together.

✓ Active chips display correctly.

✓ Clearing filters restores all events.

---

## Loading

✓ Skeleton layouts match final layouts.

✓ Progressive rendering functions.

✓ No cumulative layout shift occurs.

---

## Error Handling

✓ Retry flows function correctly.

✓ Offline messaging displays correctly.

✓ User context is preserved after failures.

---

## Accessibility

✓ WCAG 2.2 AA requirements are met.

✓ Keyboard navigation is complete.

✓ Screen readers correctly announce events.

✓ Reduced motion preferences are respected.

---

## Performance

✓ Initial rendering meets performance targets.

✓ Large datasets remain responsive.

✓ Virtualization functions correctly.

✓ Calendar navigation remains smooth.

---

## Analytics

✓ Required analytics events fire once.

✓ Metadata is accurate.

✓ No sensitive relationship information is transmitted.

---

# Definition of Done

The Calendar experience is considered production ready only when every design, engineering, accessibility, analytics, and quality requirement has been implemented and verified.

The finished Calendar should never feel like a traditional scheduling application.

Users should not think they are managing dates.

They should feel they are caring for people.

Every event should communicate who matters.

Every recommendation should explain what deserves attention.

Every action should naturally guide users toward strengthening a relationship.

A first time user should immediately understand what meaningful moments are approaching.

A returning user should immediately know what action to take next.

The Calendar should feel like a trusted Relationship Concierge quietly looking ahead, making sure the user never misses an opportunity to show someone they care.

When this specification has been implemented in full, the Calendar should require no additional UX or product decisions during development and should be ready for production implementation with confidence.

