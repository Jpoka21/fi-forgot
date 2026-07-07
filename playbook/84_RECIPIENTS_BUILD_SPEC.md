# 84_RECIPIENTS_BUILD_[SPEC.md](http://SPEC.md)

# Your People Build Specification

---

# Purpose

The Your People page is the living heart of F.I. Forgot.

It is not a contact list.

It is not an address book.

It is not a CRM.

It is the user's relationship portfolio.

This page represents every person the Relationship Concierge is actively helping the user care about.

Every interaction on this page should reinforce one core belief:

> Great relationships deserve intentional attention.

The page exists to answer four questions immediately.

1. Who matters most?

2. Who needs attention next?

3. How healthy are my relationships?

4. What should I do right now?

Unlike traditional contact management systems, this page is optimized for emotional awareness instead of data management.

The user should feel that every person displayed is known, understood, and actively supported by the concierge.

The experience should feel calm, premium, organized, and deeply personal.

---

# Philosophy

The Your People page is designed around relationships instead of records.

Every design decision should reinforce that people are more important than information.

A user's spouse is not simply another database row.

A lifelong friend is not just another card in a grid.

Every recipient should feel like someone important.

The interface should quietly communicate:

"I know these people."

"I remember them."

"I help you stay close."

The page should never resemble spreadsheets, CRMs, mailing lists, or email contact managers.

Instead it should feel closer to walking into a beautifully organized personal library where every relationship has its own story.

The design emphasizes:

• warmth

• clarity

• breathing room

• emotional context

• confidence

Everything unnecessary is removed.

Everything meaningful is elevated.

---

# Primary User Goals

When arriving on this page, users are typically trying to accomplish one of the following:

• find someone quickly

• check who needs attention

• send a card

• add someone new

• update relationship information

• review relationship health

• browse upcoming occasions

• remember recent interactions

The interface should make every one of these tasks obvious within seconds.

---

# Information Hierarchy

The page is organized according to relationship importance instead of raw data.

Hierarchy from top to bottom:

1. Page header

2. Search

3. Filter and Sort controls

4. View toggle

5. Bulk selection controls (when active)

6. Relationship groups

7. Recipient cards

8. Floating Add Person action

Nothing else competes with these primary areas.

---

# Desktop Layout Specification

Maximum content width:

1440 pixels

Centered horizontally.

Outer page padding:

48 pixels

Top spacing beneath global navigation:

40 pixels

Bottom spacing:

80 pixels

Overall page rhythm follows the global spacing system defined in previous build specifications.

---

## Desktop Structure

```

----------------------------------------------------

Global Navigation

----------------------------------------------------

Page Header

Search

Filter Bar

Relationship Sections

Relationship Grid

Floating Add Button

```

---

# Page Header

The header occupies the full content width.

Height is determined by content.

Structure:

```

Title

Subtitle

Primary Action

```

Desktop layout:

```

---------------------------------------------------

Your People

Everyone who matters,

organized in one place.

                               + Add Person

---------------------------------------------------

```

Title:

48 px

Bold

Primary heading color.

Subtitle:

18 px

Muted body color.

Maximum width:

640 px

Primary action button aligned to the far right.

---

# Search Section

Positioned directly beneath the page header.

Spacing above:

32 px

Spacing below:

24 px

Desktop width:

100%

Search field width:

560 px maximum

Structure:

```

Search Icon

Input

Clear Button

```

Placeholder:

Search people...

Search begins immediately while typing.

No submit button exists.

---

# Filter Bar

Located directly beneath search.

Single horizontal row.

Height:

48 px

Contains:

Relationship Filter

Health Filter

Upcoming Events Filter

Favorites Toggle

Sort Dropdown

View Toggle

Example:

```

Relationship ▼

Health ▼

Upcoming ▼

★ Favorites

Sort ▼

Grid | List

```

All controls use the shared component specifications defined earlier.

---

# View Toggle

Two options.

Grid

List

Grid is default.

Animated transition.

No page reload.

User preference persists.

---

# Relationship Groups

Relationships are visually grouped.

Default grouping:

Favorites

Needs Attention

Everyone Else

Alternative grouping options:

Relationship Type

Alphabetical

Relationship Health

Upcoming Events

Recently Added

Grouping changes instantly.

Each section includes:

Heading

Optional description

Relationship count

Example:

```

Favorites

12 People

```

---

# Grid Layout

Default desktop presentation.

Four column responsive grid.

Card width:

Minimum 300 px

Maximum flexible.

Gap:

24 px

Cards maintain equal height.

Cards never stretch vertically.

---

Example:

```

□□□□□□□□□□□□□□□□

□□□□□□□□□□□□□□□□

□□□□□□□□□□□□□□□□

```

---

# Relationship Card Size

Width:

Responsive

Height:

Approximately 280 px

Internal padding:

24 px

Corner radius:

24 px

Background:

White

Border:

1 px neutral border

Hover:

Slight elevation

Soft shadow

Border highlight

---

# Card Layout

```

Avatar

Name

Relationship

Health Meter

Next Occasion

Recent Memory

Quick Actions

```

Vertical layout.

Balanced spacing.

---

# Card Header

Contains:

Avatar

Favorite indicator

Overflow menu

Example:

```

🙂                         ★  ⋮

```

Avatar:

56 px

Circular.

Uses illustration if available.

Otherwise initials.

---

# Recipient Name

22 px

Semibold

Single line.

Truncates gracefully.

---

# Relationship Label

Examples:

Wife

Brother

Best Friend

Coworker

Neighbor

Muted typography.

16 px.

---

# Relationship Health

Displayed prominently.

Never hidden.

Includes:

Health score

Color indicator

Mini trend icon

Example:

```

Relationship Health

92%

↗ Improving

```

Health indicator colors follow global health color tokens.

---

# Next Occasion

Displayed beneath health.

Examples:

Birthday

Anniversary

Graduation

Father's Day

Format:

```

Next Occasion

Birthday

14 Days

```

Urgent occasions receive accent highlighting.

---

# Recent Memory Preview

Displays one short sentence.

Maximum:

Two lines.

Example:

```

Started a new job in May.

```

If unavailable:

```

No recent memories yet.

```

Muted styling.

---

# Quick Actions

Bottom row of every card.

Equal width buttons.

Icons only on smaller widths.

Desktop labels:

View Profile

Send Card

Log Memory

Example:

```

[ View ]

[ Card ]

[ Memory ]

```

Buttons use shared button system.

---

# Tablet Layout Specification

Breakpoint:

768 px to 1199 px

Outer padding:

32 px

Grid changes to:

Two columns.

Header stacks naturally.

Search expands to full width.

Filter controls become horizontally scrollable if needed.

Relationship cards retain identical content hierarchy.

Quick actions reduce spacing.

Floating Add button remains fixed.

---

# Tablet Structure

```

Header

Search

Scrollable Filters

Two Column Grid

Floating Action Button

```

Spacing between cards:

20 px

---

# Mobile Layout Specification

Breakpoint:

Below 768 px

Single column layout.

Everything stacks vertically.

Outer padding:

20 px

Top spacing:

24 px

Bottom spacing:

96 px

Extra bottom space accommodates floating navigation and Add button.

---

# Mobile Header

Structure:

```

Your People

Everyone who matters.

+ Add

```

Title:

36 px

Subtitle:

16 px

Primary action becomes icon plus label.

---

# Mobile Search

Full width.

Height:

52 px

Sticky after scrolling 120 px.

The search field remains available while browsing long lists.

---

# Mobile Filter Experience

Filters collapse into a single button.

```

Filters (3)

```

Tapping opens the full screen filter sheet defined later in this specification.

View toggle moves inside the filter sheet.

Sort also moves inside the sheet.

This preserves valuable horizontal space.

---

# Mobile Relationship Layout

Single card per row.

Cards become wider and shorter.

Approximate height:

220 px

Recent memory compresses to one line.

Quick actions become icon buttons.

Example:

```

🙂 Sarah

Wife

Health 94%

Birthday 14 days

[👤] [✉] [📝]

```

---

# Responsive Behavior

The layout adapts progressively without abrupt changes.

## Above 1440 px

Content remains centered.

Maximum width enforced.

Cards grow slightly.

Whitespace increases.

---

## Between 1200 px and 1439 px

Four column grid.

Standard desktop spacing.

---

## Between 992 px and 1199 px

Three column grid.

Header begins compressing.

Action button remains inline.

---

## Between 768 px and 991 px

Two column grid.

Filter row becomes horizontally scrollable.

Quick actions reduce padding.

---

## Between 480 px and 767 px

Single column.

Search becomes sticky.

Filters move into modal sheet.

Floating Add button enlarges slightly for thumb access.

---

## Below 480 px

Margins reduce to 16 px.

Typography scales according to the responsive typography system.

Buttons maintain minimum touch target sizes.

Cards preserve visual breathing room.

No information becomes inaccessible.

No horizontal scrolling is ever permitted.



# Complete Component Tree

```

YourPeoplePage

│

├── GlobalNavigation

│

├── PageContainer

│   │

│   ├── PageHeader

│   │   ├── Title

│   │   ├── Subtitle

│   │   └── AddPersonButton

│   │

│   ├── SearchSection

│   │   ├── SearchIcon

│   │   ├── SearchInput

│   │   ├── ClearButton

│   │   └── KeyboardShortcutHint

│   │

│   ├── FilterToolbar

│   │   ├── RelationshipFilter

│   │   ├── HealthFilter

│   │   ├── OccasionFilter

│   │   ├── FavoritesToggle

│   │   ├── SortDropdown

│   │   ├── ViewToggle

│   │   └── ActiveFilterChips

│   │

│   ├── BulkActionToolbar

│   │

│   ├── RelationshipGroups

│   │   ├── GroupHeader

│   │   ├── RecipientGrid

│   │   │   ├── RecipientCard

│   │   │   ├── RecipientCard

│   │   │   └── RecipientCard

│   │   │

│   │   └── RecipientList

│   │

│   ├── EmptyState

│   │

│   ├── LoadingSkeletons

│   │

│   ├── ErrorState

│   │

│   └── FloatingAddButton

│

├── AddRecipientModal

├── EditRecipientModal

├── DeleteConfirmationModal

├── FilterDrawer

├── SortMenu

└── ToastNotifications

```

Every component follows the design tokens and interaction rules defined in previous playbook documents.

No component should introduce visual patterns inconsistent with the established design system.

---

# Header Specification

The page header establishes emotional context before functionality.

Users should immediately understand they are looking at the people who matter most.

Unlike traditional contact management systems, the emphasis is not on records or contacts.

The emphasis is on relationships.

---

## Header Layout

Desktop:

```

---------------------------------------------------------

Your People

Everyone who matters, organized in one place.

                               + Add Person

---------------------------------------------------------

```

Tablet:

```

Your People

Everyone who matters.

+ Add Person

```

Mobile:

```

Your People

Everyone who matters.

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

Primary text color

Maximum lines:

One

Never wraps.

---

## Subtitle

Typography:

18 px desktop

17 px tablet

16 px mobile

Weight:

400

Color:

Secondary text

Maximum width:

640 px

Example copy:

> Everyone who matters, organized in one place.

This sentence intentionally reinforces the product philosophy instead of describing features.

---

## Primary Action Button

Label:

Add Person

Icon:

Leading Plus icon

Desktop height:

48 px

Mobile height:

52 px

Minimum width:

160 px desktop

Auto width on mobile

Hover:

Background gently darkens.

Shadow increases slightly.

Press:

Scales to 98%.

Focus:

Uses global accessibility focus ring.

---

# Search Experience

Search is one of the most frequently used interactions on this page.

It should feel instantaneous.

Users should never think about how search works.

They simply type.

Results appear immediately.

---

## Search Scope

Search matches:

Recipient name

Nickname

Relationship label

Email

Tags

Favorite memories

Recent memories

Interests

Personality notes

Inside jokes

Relationship notes

Custom labels

This makes search behave more like searching a relationship than searching a contact.

---

## Search Behavior

Typing begins filtering immediately.

No submit button exists.

No debounce greater than 150 milliseconds.

Results update continuously.

---

## Empty Search

When search is empty:

All recipients display normally.

No filtering occurs.

---

## Active Search

The search field gains subtle accent highlighting.

A clear button appears.

Relationship count updates.

Example:

```

Showing 7 of 62 people

```

---

## No Results

Illustration

Headline

Helpful explanation

Suggested actions

Example:

```

No one matches "Michael."

Try another spelling

or clear your filters.

```

Buttons:

Clear Search

Clear Filters

---

## Search Keyboard Behavior

Click:

Focuses input.

Escape:

Clears current search.

Ctrl + K

or

⌘ + K

Immediately focuses search.

Tab navigation follows natural order.

---

## Search Result Ranking

Exact recipient name

↓

Nickname

↓

Relationship label

↓

Memory content

↓

Interests

↓

Everything else

Exact matches always appear first.

---

# Filters

Filters help users narrow large relationship collections without becoming overwhelming.

Filters are additive.

Users may apply multiple simultaneously.

---

## Available Filters

Relationship Type

Relationship Health

Upcoming Occasion

Favorite Status

Card Needed

Recently Updated

Recently Added

Has Missing Information

Has Memories

Autopilot Enabled

---

## Relationship Filter

Options:

All Relationships

Family

Friends

Partner

Children

Parents

Coworkers

Clients

Neighbors

Teachers

Mentors

Pets

Other

Selecting multiple relationship types is supported.

---

## Health Filter

Options:

Excellent

Healthy

Needs Attention

Critical

Health thresholds use previously defined health scoring.

---

## Upcoming Occasion Filter

Options:

Today

This Week

This Month

Next 90 Days

No Upcoming Occasion

---

## Favorite Filter

Simple toggle.

When enabled:

Only favorite recipients appear.

---

## Card Needed Filter

Shows recipients requiring action soon.

Examples:

Upcoming birthday

Anniversary

Holiday

Reminder

Recommended follow up

---

## Recently Updated

Options:

Past Week

Past Month

Past 90 Days

---

## Missing Information

Shows recipients with incomplete relationship knowledge.

Examples:

Missing birthday

No favorite memories

No personality profile

Few relationship details

This supports ongoing relationship enrichment.

---

# Active Filter Chips

Every active filter appears beneath the toolbar.

Example:

```

Family

Needs Attention

Birthday

Favorites

```

Each chip includes:

Label

Remove icon

Individual removal

Removing a chip updates instantly.

---

# Sorting

Sorting changes display order only.

No information changes.

Default sorting is intentionally relationship focused.

---

## Default Sort

Recommended

This ordering considers:

Relationship importance

Upcoming occasions

Health score

Recent activity

Favorites

User behavior

The goal is to surface the people most deserving of attention.

---

## Additional Sort Options

Alphabetical

Recently Added

Newest First

Oldest First

Upcoming Occasion

Relationship Health

Most Active

Least Active

Recently Updated

Favorites First

---

## Sort Interaction

Dropdown opens beneath the control.

Maximum height:

320 px

Scrollable if necessary.

Selection closes menu immediately.

Animated checkmark indicates current selection.

---

# Relationship Cards

The relationship card is the primary browsing component of the entire page.

It should feel alive.

Every card communicates that the concierge understands this relationship.

Users should be able to scan dozens of cards quickly while still feeling an emotional connection to each person.

Cards should never resemble CRM records or contact management rows.

They should resemble relationship snapshots.

---

## Card Anatomy

```

Avatar

Favorite Indicator

Overflow Menu

Recipient Name

Relationship

Relationship Health

Upcoming Occasion

Recent Memory

Quick Actions

```

The visual rhythm should emphasize:

Person

↓

Relationship

↓

Health

↓

Action

Data always supports the relationship rather than competing with it.

---

# Relationship Cards (Continued)

The relationship card is the foundational browsing experience for the Your People page.

It should immediately communicate:

• who this person is

• how the relationship is doing

• what deserves attention

• what the user can do next

The user should never need to open a profile simply to understand the current state of a relationship.

Every card should function as a high level relationship summary.

---

## Card Visual Priority

Visual hierarchy from highest emphasis to lowest:

1. Avatar

2. Recipient name

3. Relationship Health

4. Next Occasion

5. Recent Memory

6. Relationship label

7. Quick actions

8. Overflow menu

This order reflects how people naturally think about relationships.

---

## Avatar

Position:

Top left.

Size:

56 px desktop

52 px tablet

48 px mobile

Circular.

If profile illustration exists:

Display illustration.

If no illustration exists:

Display initials.

If initials unavailable:

Display default relationship illustration.

Avatar should never appear empty.

---

## Favorite Indicator

Displayed in the upper right corner.

Filled star indicates favorite.

Outlined star indicates non favorite.

Hover reveals tooltip:

"Favorite"

Clicking the star immediately toggles favorite status.

No confirmation dialog.

Animation:

150 ms scale animation.

Small sparkle animation when favorited.

---

## Overflow Menu

Positioned beside the favorite indicator.

Icon:

Three vertical dots.

Menu options:

View Profile

Send Card

Log Memory

Edit Person

Manage Occasions

Archive

Delete

Dangerous actions appear separated by a divider.

---

## Recipient Name

Maximum:

One line.

Overflow:

Ellipsis.

Font:

22 px

Weight:

600

Color:

Primary text.

---

## Relationship Label

Examples:

Wife

Brother

Grandmother

Coworker

Mentor

Friend

Neighbor

Displayed directly beneath the name.

16 px.

Muted color.

---

## Relationship Health Summary

Always visible.

Structure:

```

Relationship Health

92%

Excellent

```

Includes:

Progress bar

Health color

Optional trend indicator

If health changes recently:

Display trend arrow.

Examples:

↗ Improving

→ Stable

↘ Declining

Trend animations remain subtle.

---

## Upcoming Occasion

Displayed beneath health.

Structure:

```

Next Occasion

Birthday

14 days

```

If today:

```

Birthday Today

```

Uses accent highlight.

If tomorrow:

```

Tomorrow

```

If overdue reminder:

```

Needs Attention

```

Displays warning styling.

---

## Recent Memory

Displays newest meaningful timeline memory.

Maximum:

Two lines desktop

One line mobile

Examples:

Started a new business.

Vacationed in Italy.

Finished nursing school.

Loves gardening this summer.

Memory preview should help users reconnect emotionally.

---

## Quick Actions

Bottom aligned.

Equal spacing.

Desktop:

```

View

Send Card

Log Memory

```

Tablet:

Compact buttons.

Mobile:

Icons with accessibility labels.

Actions never wrap.

---

## Card Hover State

Desktop only.

Hover includes:

Shadow elevation

Border color transition

Slight upward translation

Quick action emphasis

Duration:

200 milliseconds.

---

## Card Selected State

Used during bulk actions.

Visual changes:

Accent border

Background tint

Selection checkmark

Entire card becomes selectable.

---

## Card Loading State

Skeleton includes:

Avatar placeholder

Two text lines

Health placeholder

Occasion placeholder

Action placeholders

Skeleton uses shimmer animation defined in the loading specification.

---

# Grid View

Grid view is the default presentation because it emphasizes people over rows of information.

Users perceive each recipient as an individual rather than a record.

---

## Desktop Grid

Columns:

4

Gap:

24 px

Cards maintain equal heights.

Cards align vertically.

No masonry layouts.

---

## Large Desktop

If viewport exceeds maximum content width:

Grid remains centered.

Whitespace increases.

Cards do not become excessively wide.

---

## Medium Desktop

Three columns.

Gap:

24 px.

Cards resize proportionally.

---

## Tablet Grid

Two columns.

Gap:

20 px.

Cards remain visually balanced.

---

## Mobile Grid

Transforms into a single column list of cards.

Each card spans available width.

Spacing:

16 px.

---

## Grid Animation

Changing filters:

Cards fade and reposition.

Sorting:

Cards animate smoothly to new positions.

Switching groups:

Cards animate independently.

Animation duration:

200 to 250 milliseconds.

No abrupt jumps.

---

# List View

List view supports users managing large relationship collections.

Information density increases while preserving warmth.

---

## Desktop List Layout

Each row contains:

Avatar

Name

Relationship

Health

Next Occasion

Recent Memory

Quick Actions

Overflow Menu

Example:

```

🙂 Sarah

Wife

94%

Birthday

14 Days

Started a new business.

View

Card

...

```

---

## List Row Height

Desktop:

92 px

Tablet:

88 px

Mobile:

Not available.

Mobile always uses card view.

---

## Row Hover

Entire row highlights.

Quick actions become more visible.

Pointer cursor.

Shadow remains minimal.

---

## Row Selection

Checkbox appears.

Accent background.

Selection persists while bulk toolbar is active.

---

## Column Priority

Desktop:

Avatar

↓

Name

↓

Relationship

↓

Health

↓

Occasion

↓

Memory

↓

Actions

Tablet hides:

Recent memory first.

If necessary:

Relationship label next.

Actions always remain visible.

---

## List Sorting

Column headers remain static.

Sorting continues through the toolbar rather than clicking column headers.

This prevents spreadsheet behavior.

---

# Relationship Health Indicators

Relationship Health is one of the defining concepts of F.I. Forgot.

It deserves consistent visibility throughout the application.

The indicator should communicate emotional status rather than numerical analytics.

Numbers support understanding.

Colors communicate feeling.

---

## Health Levels

Excellent

Healthy

Needs Attention

Critical

These names are shown everywhere.

Internal numeric scores remain secondary.

---

## Excellent

Score:

90 to 100

Color:

Success green.

Descriptor:

Excellent

Supporting message:

You're doing a great job staying connected.

---

## Healthy

Score:

70 to 89

Color:

Soft green.

Descriptor:

Healthy

Supporting message:

Everything looks good.

---

## Needs Attention

Score:

40 to 69

Color:

Warm amber.

Descriptor:

Needs Attention

Supporting message:

A small gesture could make a big difference.

---

## Critical

Score:

0 to 39

Color:

Soft red.

Descriptor:

Critical

Supporting message:

This relationship has gone quiet.

Consider reaching out soon.

---

## Health Progress Bar

Positioned beneath score.

Height:

6 px.

Rounded ends.

Animated width.

Never flashes.

---

## Trend Indicator

Optional.

Shows recent direction.

Possible values:

Improving

Stable

Declining

Displayed with subtle directional icon.

Never uses alarming language.

---

## Health Tooltip

Hovering or tapping the indicator explains:

Current score

Reason for score

Recent improvements

Suggestions for increasing health

Example:

```

Relationship Health

92%

Strong recent communication.

Birthday remembered.

Three memories added recently.

Next recommendation:

Log a recent moment.

```

This reinforces transparency while keeping the experience encouraging rather than judgmental.

---

---

# Quick Actions

Quick Actions allow users to perform the most common relationship tasks without opening the full Relationship Profile.

The guiding principle is simple:

The user should be able to maintain meaningful relationships with as few clicks as possible.

Only actions that are performed frequently belong directly on the relationship card.

Everything else belongs in the overflow menu.

---

## Available Quick Actions

Every recipient card includes three primary actions.

Desktop:

```

[ View Profile ]

[ Send Card ]

[ Log Memory ]

```

Tablet:

Compact text buttons with icons.

Mobile:

Icon only buttons with accessibility labels.

---

## View Profile

Purpose:

Open the full Relationship Profile.

Navigation:

Client side transition.

No full page refresh.

Animation:

Shared page transition.

Duration:

250 milliseconds.

Analytics Event:

`recipient_profile_opened`

---

## Send Card

Purpose:

Begin the card creation flow for the selected recipient.

Behavior:

Immediately opens the Card Creation experience with the recipient preselected.

No additional recipient selection step is shown.

The user enters directly into the occasion selection step.

Analytics Event:

`quick_card_started`

---

## Log Memory

Purpose:

Capture a meaningful relationship moment.

Behavior:

Opens the Quick Memory modal.

Focus automatically enters the memory text field.

Recent photos may also be attached if enabled elsewhere in the application.

Analytics Event:

`memory_modal_opened`

---

## Hover Behavior

Desktop only.

Hovering over the action row:

Increases button opacity.

Subtly raises the button group.

No distracting animation.

---

## Disabled States

Quick Actions should almost never be disabled.

If an action cannot be completed due to connectivity:

Buttons remain visible.

Selecting them displays an inline error message or toast.

---

## Mobile Behavior

Quick actions remain pinned to the bottom of the card.

Buttons are evenly spaced.

Minimum touch target:

44 × 44 px

Icons:

Profile

Envelope

Memory

Text labels are omitted to reduce vertical height.

Accessibility labels remain required.

---

# Bulk Actions

Bulk Actions allow users to perform the same operation across multiple relationships efficiently.

Bulk mode is intentionally hidden until recipients are selected.

The interface should remain emotionally focused rather than feeling like file management software.

---

## Entering Bulk Mode

Users may enter bulk mode by:

Selecting a checkbox in list view.

Long pressing a card on touch devices.

Choosing "Select Multiple" from the overflow menu.

Using Shift + Click on desktop.

Once activated:

The Bulk Action Toolbar replaces the standard filter toolbar.

---

## Bulk Toolbar Layout

Desktop:

```

---------------------------------------------------

12 Selected

Send Card

Favorite

Archive

Delete

Cancel

---------------------------------------------------

```

The selected count is always visible.

---

## Available Bulk Actions

Send Cards

Favorite

Unfavorite

Archive

Restore

Delete

Only valid actions appear.

Example:

Archive is hidden for already archived recipients.

---

## Bulk Send Cards

Starts a guided workflow.

Each recipient receives an individual card.

Recipients are never combined into one card.

The Card Creation flow iterates through each selected recipient.

Progress indicator:

```

Recipient 3 of 8

```

---

## Bulk Favorite

Immediately updates all selected recipients.

Optimistic UI update.

Background synchronization.

Undo available for several seconds.

---

## Bulk Archive

Moves recipients to the archived collection.

Confirmation dialog required.

Message:

"Archive 12 people?"

Explanation:

Archived people remain available and can be restored later.

---

## Bulk Delete

Requires confirmation.

Confirmation dialog includes:

Recipient count.

Explanation.

Irreversible warning.

Primary button:

Delete Permanently

Secondary button:

Cancel

Delete is styled using destructive color tokens.

---

## Exiting Bulk Mode

Users exit bulk mode by:

Cancel button.

Escape key.

Clearing all selections.

Completing the bulk action.

The interface returns to the standard browsing experience.

---

# Favorites

Favorites represent the user's most important relationships.

This is not a shortcut.

It is a statement of emotional priority.

Favorites appear first throughout the application unless explicitly sorted otherwise.

---

## Favorite Behavior

Tapping the star:

Immediately updates the UI.

Animation:

150 millisecond scale.

Small sparkle effect.

Background sync.

Undo available if synchronization fails.

---

## Favorite Section

When at least one favorite exists:

The page begins with:

```

Favorites

12 People

```

Favorite cards appear before all other relationship groups.

---

## No Favorites

If none exist:

The Favorites section is omitted entirely.

No empty placeholder is shown.

This keeps the page visually clean.

---

## Favorite Limit

No artificial limit exists.

Users may favorite any number of recipients.

---

# Sections and Grouping

Grouping helps users browse relationships naturally rather than relying exclusively on search.

Groups are collapsible.

Collapsed state persists across sessions.

---

## Default Group Order

Favorites

Needs Attention

Everyone Else

This order reflects the concierge's priorities.

---

## Group Header

Each group contains:

Title

Description (optional)

Recipient count

Collapse toggle

Example:

```

Favorites

The people you never want to forget.

12 People

▼

```

---

## Collapsed Groups

Only the header remains visible.

Recipient count remains visible.

Collapse state persists until changed by the user.

---

## Expanded Groups

Cards animate into view.

Animation duration:

200 milliseconds.

Cards stagger slightly.

Maximum stagger:

80 milliseconds.

---

## Alternative Grouping Options

Users may choose:

Relationship Type

Alphabetical

Relationship Health

Upcoming Occasion

Recently Added

Favorites

Only one grouping method may be active at a time.

---

## Relationship Type Groups

Examples:

Partner

Family

Friends

Children

Coworkers

Clients

Mentors

Neighbors

Other

Groups appear only if recipients exist.

---

## Alphabetical Groups

Letters:

A through Z.

Letters without recipients are hidden.

---

## Health Groups

Excellent

Healthy

Needs Attention

Critical

Groups appear in this order regardless of recipient counts.

---

## Upcoming Occasion Groups

Today

This Week

This Month

Later

No Upcoming Occasion

Urgent groups always appear first.

---

## Recently Added

Groups:

Last 7 Days

Last 30 Days

Earlier

Useful immediately after importing contacts.

---

# Empty States

Every empty state should encourage progress rather than emphasize absence.

Illustrations follow the illustration library defined elsewhere in the playbook.

Copy remains optimistic and action oriented.

---

## No Recipients

Illustration:

Warm welcoming illustration featuring people rather than empty folders.

Headline:

Your relationship journey starts here.

Supporting copy:

Add the people who matter most, and your Relationship Concierge will help you stay connected through thoughtful reminders, memories, and personalized cards.

Primary Action:

Add Your First Person

Secondary Action:

Import Contacts

---

## Empty Search

Illustration:

Magnifying glass.

Headline:

No matching people.

Supporting copy:

Try another search or clear your filters.

Buttons:

Clear Search

Clear Filters

---

## Empty Favorites

No dedicated empty page.

Favorites section simply disappears.

---

## Empty Filter Results

Illustration:

Relationship cards fading away.

Headline:

Nothing matches these filters.

Supporting copy:

Try broadening your search.

Primary Action:

Clear Filters

---

## Archived Empty State

Headline:

No archived people.

Supporting copy:

Archived relationships will appear here if you choose to hide them from your active list.

---

## First Time Experience

When the user has never created a recipient:

The page includes an onboarding illustration.

A short explanation of relationship management.

One prominent Add Person button.

No additional controls distract from the primary task.

---

# Loading States

Loading should reinforce confidence that the Relationship Concierge is preparing personalized information.

The page should never flash blank content or shift dramatically after rendering.

All major components use skeleton placeholders that closely match their final layout.

---

# Initial Page Load

When the page first loads:

Display the page header immediately.

Display skeleton versions of:

Search bar

Filter toolbar

Relationship group headers

Relationship cards

Floating Add button

This preserves layout stability and minimizes cumulative layout shift.

---

## Relationship Card Skeleton

Each skeleton mirrors the final card dimensions.

Structure:

```

○ Avatar

██████████████

████████

────────────

██████████

████████████████

▢ ▢ ▢

```

Includes placeholders for:

Avatar

Name

Relationship label

Health indicator

Upcoming occasion

Recent memory

Quick action buttons

Skeletons should not shimmer excessively.

Animation:

Subtle left to right shimmer.

Duration:

1.5 seconds.

Infinite loop until content loads.

---

## Progressive Loading

Recipients should render as soon as their data is available.

Do not wait for the complete collection before displaying content.

Relationship groups may appear independently.

---

## Search Loading

Searching local data should feel instantaneous.

No loading indicator is required.

If server side search is ever introduced:

Show a small spinner inside the search field.

Never block typing.

---

## Filter Loading

Changing filters should not display page skeletons.

Instead:

Current cards fade to 60 percent opacity.

Updated cards animate into position.

Maximum transition:

250 milliseconds.

---

## Grid to List Transition

No loading state.

Layout transitions smoothly.

Cards morph into rows using shared motion principles.

---

## Bulk Action Loading

While a bulk operation is processing:

Display progress within the Bulk Action Toolbar.

Example:

```

Sending Cards...

Recipient 4 of 12

```

Bulk actions should remain cancellable whenever technically possible.

---

## Image Loading

Recipient avatars load independently.

Until loaded:

Display initials or neutral avatar placeholder.

Images fade in.

Duration:

200 milliseconds.

No layout movement occurs.

---

## Slow Network

If loading exceeds two seconds:

Display reassuring helper text.

Example:

"Preparing your relationships..."

After five seconds:

Offer a Retry action if appropriate.

---

# Error States

Errors should be calm, informative, and recoverable.

The application never blames the user.

Technical jargon should never appear in user facing copy.

---

# Page Load Failure

Illustration:

Friendly concierge illustration.

Headline:

We couldn't load your people.

Supporting copy:

Something interrupted the connection. Your information is safe.

Primary Action:

Try Again

Secondary Action:

Return to Dashboard

---

## Search Error

If server search fails:

Retain the current search text.

Display inline message:

"We couldn't complete your search."

Retry automatically once connectivity returns.

---

## Filter Error

If filters fail to load:

Hide unavailable filters.

Continue displaying recipients.

Toast message:

"Some filters are temporarily unavailable."

---

## Avatar Load Failure

Fallback immediately to:

Initials

or

Relationship illustration

Broken image icons should never be displayed.

---

## Save Error

If editing fails:

Changes remain visible temporarily.

Toast:

"We couldn't save your changes."

Actions:

Retry

Dismiss

Optimistic updates should roll back only if synchronization ultimately fails.

---

## Bulk Action Error

If one recipient fails during a bulk action:

Continue processing remaining recipients.

Present a completion summary.

Example:

```

10 completed

2 couldn't be updated

Review

```

Users may retry failed recipients only.

---

## Offline Mode

If connectivity is lost:

Persistent banner appears.

Example:

"You're offline. Changes will sync when your connection returns."

Browsing previously loaded recipients remains available.

Actions that require network access display clear messaging.

---

## Permission Error

If the user lacks access to a recipient:

Display:

"You don't have permission to view this person."

Offer navigation back to the previous screen.

---

# Editing Interactions

Editing a relationship should feel lightweight and conversational.

Users should never feel they are completing a long form.

Small edits happen inline whenever practical.

Larger edits open focused dialogs.

---

# Inline Editing

The following fields support inline editing:

Nickname

Relationship label

Favorite status

Tags

Notes

Preferred name

Each editable field displays an edit affordance on hover.

---

## Edit Trigger

Desktop:

Hover then click.

Mobile:

Tap the field.

Keyboard:

Enter while focused.

---

## Save Behavior

Changes save automatically.

No explicit Save button.

Successful saves display a subtle confirmation.

Example:

"Saved"

Confirmation fades after one second.

---

## Validation

Validation occurs while typing.

Errors appear directly beneath the field.

Examples:

Birthday must be valid.

Relationship label required.

Name cannot be empty.

Users are never forced through multiple validation dialogs.

---

## Unsaved Changes

For larger editing experiences:

Closing the modal with unsaved changes displays:

Discard Changes?

Options:

Continue Editing

Discard

---

## Archive Interaction

Archive is intentionally soft.

Dialog:

Archive Sarah?

Supporting copy:

Archived people remain available and can be restored later.

Primary:

Archive

Secondary:

Cancel

---

## Delete Interaction

Deleting is intentionally difficult.

Confirmation includes:

Recipient name.

Warning.

Irreversible explanation.

Primary:

Delete Permanently

Requires explicit confirmation.

---

# Modals

All modals follow the shared modal specification established elsewhere in the playbook.

Maximum width:

640 pixels.

Rounded corners.

Soft elevation.

Background dimming:

Approximately 40 percent.

Focus remains trapped within the modal.

Escape closes when appropriate.

---

# Add Person Modal

Purpose:

Quickly create a new relationship.

Fields:

Name

Relationship

Birthday (optional)

Email (optional)

Phone (optional)

Favorite toggle

Primary button:

Create Person

Secondary:

Cancel

After creation:

Navigate directly to the Relationship Profile onboarding experience.

---

# Edit Person Modal

Purpose:

Modify recipient information.

Sections:

Basic Information

Relationship

Important Dates

Communication Preferences

Tags

Danger Zone

Autosaves where appropriate.

---

# Quick Memory Modal

Purpose:

Capture meaningful moments immediately.

Fields:

Memory

Date

Optional photo

Optional tags

Primary button:

Save Memory

After saving:

Modal closes.

Relationship timeline updates instantly.

Health score recalculates asynchronously.

---

# Delete Confirmation Modal

Headline:

Delete Sarah?

Supporting copy:

Deleting permanently removes this relationship, memories, and future recommendations.

Primary:

Delete Permanently

Secondary:

Cancel

Danger styling follows global destructive patterns.

---

# Animations

Motion should reinforce relationships, not entertain.

Animations are calm, intentional, and purposeful.

No movement should distract from content.

---

## Standard Durations

Fast:

150 milliseconds.

Standard:

200 milliseconds.

Large transitions:

250 milliseconds.

Page transitions:

300 milliseconds maximum.

---

## Relationship Card Entrance

Cards fade upward.

Opacity:

0 to 100 percent.

Translate:

8 pixels.

Stagger:

20 milliseconds.

Maximum stagger:

80 milliseconds.

---

## Hover Animation

Elevation increases.

Border color transitions.

Shadow softens.

Translate upward:

2 pixels.

Duration:

180 milliseconds.

---

## Favorite Animation

Star scales to 120 percent.

Returns to normal size.

Small sparkle appears.

Duration:

150 milliseconds.

---

## Group Expand

Cards reveal using:

Fade

Slide

Small stagger

Collapse reverses the animation.

---

## Modal Animation

Background fades.

Modal scales from 98 percent to 100 percent.

Duration:

180 milliseconds.

No bounce effects.

---

## Success Feedback

Saving:

Small checkmark.

Brief fade.

Toast appears when appropriate.

Animations should communicate confidence rather than celebration.

---

# Microinteractions

Microinteractions create the feeling that the Relationship Concierge is quietly assisting the user.

They should feel natural, reassuring, and refined.

The user should rarely notice them consciously, but they should contribute significantly to the perception of quality.

Every animation, hover state, focus indicator, and confirmation should communicate responsiveness without distraction.

---

# Button Microinteractions

All interactive buttons follow the shared motion system defined earlier in the playbook.

## Hover

Desktop only.

Behavior:

Background color subtly transitions.

Shadow increases slightly.

Button lifts approximately 2 px.

Duration:

180 milliseconds.

---

## Press

Behavior:

Button scales to approximately 98%.

Shadow compresses.

Duration:

100 milliseconds.

---

## Success

When an action completes successfully:

A subtle checkmark briefly appears inside the button when appropriate.

The button then returns to its normal appearance.

Example:

```

✔ Saved

```

Duration:

800 milliseconds.

---

# Search Field Microinteractions

## Focus

Border changes to accent color.

Soft focus ring appears.

Search icon subtly changes opacity.

Cursor begins blinking immediately.

---

## Typing

Clear button fades into view after the first character.

Search results update continuously.

No loading flash should occur for locally available data.

---

## Clearing Search

When the clear icon is pressed:

Text fades away.

Relationship list smoothly expands back to its full state.

Search field retains focus.

---

# Filter Microinteractions

Selecting a filter:

Filter chip appears with a small scale animation.

Duration:

150 milliseconds.

Removing a filter:

Chip fades and shrinks.

Remaining chips slide into place.

---

## Filter Drawer

Mobile only.

Opening:

Slides upward from the bottom.

Background dims.

Closing:

Slides downward.

Background returns.

Duration:

250 milliseconds.

---

# Relationship Card Microinteractions

## Hover

Card lifts.

Shadow deepens.

Border color becomes slightly more pronounced.

Quick actions increase from 80 percent opacity to 100 percent.

---

## Focus

Keyboard focus highlights the entire card.

Focus ring follows accessibility guidelines.

---

## Favorite Toggle

Selecting favorite:

Star fills.

Scales briefly.

Small sparkle animation.

Deselecting:

Star smoothly returns to outline.

No abrupt state changes.

---

## Health Score Update

When the relationship health changes after an interaction:

Progress bar animates smoothly.

Percentage counts upward or downward.

Trend indicator updates after the animation completes.

---

## Recent Memory Update

After logging a memory:

New memory fades into the card.

Health score refreshes shortly afterward.

No page reload occurs.

---

# Group Expansion

Expanding a section:

Chevron rotates.

Cards appear with a slight stagger.

Collapsing:

Cards fade away.

Height collapses smoothly.

Duration:

200 milliseconds.

---

# Toast Notifications

Toast messages appear in the lower right on desktop.

Bottom center on mobile.

Maximum width:

420 px.

Auto dismiss:

4 seconds.

Pause dismissal on hover.

Examples:

Person added successfully.

Relationship updated.

Memory saved.

Card scheduled.

Favorites updated.

Archived successfully.

Each toast includes an icon matching the message type.

---

# Keyboard Behavior

The entire page must be fully navigable without a mouse.

Keyboard navigation follows logical reading order.

No interaction requires pointer input.

---

# Focus Order

1. Global navigation

2. Page heading

3. Add Person button

4. Search field

5. Filter controls

6. View toggle

7. Bulk toolbar (when visible)

8. Group headers

9. Recipient cards

10. Floating Add button

11. Footer navigation (if present)

Focus order must remain predictable regardless of grouping method.

---

# Recipient Card Navigation

Each card behaves as a focusable container.

Arrow keys move between adjacent cards in grid view.

Tab navigates through interactive controls.

Enter:

Opens the Relationship Profile.

Space:

Selects the card in bulk mode.

---

# Search Shortcuts

Ctrl + K

or

⌘ + K

Focuses search immediately.

Escape:

Clears search if text exists.

If empty:

Removes focus from the search field.

---

# Bulk Selection Shortcuts

Shift + Click

Selects ranges in list view.

Ctrl + A

When bulk mode is active:

Selects all visible recipients.

Escape:

Clears selection.

Exits bulk mode.

---

# Modal Keyboard Support

Tab:

Cycles through controls.

Shift + Tab:

Cycles backward.

Escape:

Closes modal unless destructive confirmation is pending.

Enter:

Activates the primary action.

---

# Accessibility Requirements

Accessibility is a core product requirement, not a post development enhancement.

Every user should be able to maintain meaningful relationships regardless of ability.

The page must conform to WCAG 2.2 AA standards or better.

---

# Semantic Structure

Use semantic HTML whenever possible.

Examples:

```

<header>

<main>

<section>

<nav>

<button>

<form>

<dialog>

```

Avoid unnecessary generic containers where semantic elements exist.

---

# Headings

The page contains a single H1:

Your People

Relationship group titles use H2.

Card names are not headings.

---

# Color Contrast

All text:

Minimum contrast ratio of 4.5 to 1.

Large headings:

Minimum ratio of 3 to 1.

Health colors must never be the only indicator of status.

Every health state includes:

Color

Text label

Progress indicator

Optional icon

---

# Screen Reader Support

Recipient cards announce:

Recipient name.

Relationship.

Health status.

Next occasion.

Favorite status.

Available actions.

Example:

"Sarah, Wife, Relationship Health Excellent, Birthday in fourteen days, Favorite."

---

# Interactive Elements

Every button requires:

Visible label

or

Accessible label.

Icon only buttons must include descriptive ARIA labels.

Examples:

View Profile

Send Card

Log Memory

Favorite

More Actions

---

# Focus Indicators

Every interactive element displays a visible focus ring.

Focus rings follow the shared design system.

Focus must never rely solely on browser defaults.

---

# Touch Targets

Minimum size:

44 by 44 pixels.

Spacing prevents accidental activation.

---

# Motion Accessibility

Users requesting reduced motion receive:

No staggered animations.

No scaling effects.

Reduced transitions.

Opacity changes only.

All functionality remains identical.

---

# Analytics Events

Every significant interaction should produce analytics events consistent with the application's event taxonomy.

Events should never include sensitive relationship content.

Only metadata is transmitted.

---

## Page Events

```

your_people_viewed

```

Triggered when the page loads successfully.

---

## Search Events

```

recipient_search_started

recipient_search_completed

recipient_search_cleared

```

Metadata:

Search length.

Result count.

---

## Filter Events

```

recipient_filter_applied

recipient_filter_removed

recipient_filter_cleared

```

Metadata:

Filter type.

Filter value.

Visible recipient count.

---

## Sorting Events

```

recipient_sort_changed

```

Metadata:

Previous sort.

New sort.

---

## View Events

```

recipient_grid_view_selected

recipient_list_view_selected

```

---

## Relationship Events

```

recipient_profile_opened

recipient_favorited

recipient_unfavorited

recipient_archived

recipient_restored

recipient_deleted

```

---

## Quick Action Events

```

quick_card_started

quick_memory_started

quick_profile_opened

```

---

## Bulk Events

```

bulk_mode_entered

bulk_cards_started

bulk_archive_completed

bulk_delete_completed

```

---

## Error Events

```

recipient_load_failed

recipient_save_failed

recipient_search_failed

recipient_bulk_failed

```

Each error event includes only technical metadata needed for diagnostics.

---

# API Data Mapping

The Your People page is a presentation layer built on top of the existing backend.

This build specification does **not** modify business logic, database schema, authentication, AI pipelines, Stripe integration, Handwrytten integration, or API contracts.

All existing endpoints remain unchanged.

The frontend maps existing API responses into the new relationship focused interface.

---

# Page Initialization

When the page loads, the frontend requests the existing recipient collection.

The frontend is responsible for:

Loading state

Grouping

Sorting

Filtering

Searching

View preferences

Selection state

Animation state

No backend modifications are required.

---

# Recipient Object Mapping

The UI expects a recipient model containing data equivalent to:

```

Recipient

ID

Full Name

Preferred Name

Relationship

Birthday

Anniversary

Favorite Status

Relationship Health

Upcoming Events

Timeline Preview

Profile Photo

Autopilot Status

Tags

Archived Status

Created Date

Updated Date

```

These fields are mapped from existing backend models.

No additional persistence requirements are introduced.

---

# Relationship Health Mapping

The displayed health indicator uses the existing Relationship Health calculation.

The frontend consumes:

Current score

Health label

Trend (if available)

Last updated timestamp

The frontend does not calculate relationship health independently.

---

# Upcoming Occasion Mapping

The Upcoming Occasion section displays the nearest qualifying event returned by the existing event pipeline.

Possible event types include:

Birthday

Anniversary

Valentine's Day

Mother's Day

Father's Day

Christmas

Thanksgiving

Graduation

Wedding

Custom Occasion

Just Because Recommendation

If multiple events qualify:

The nearest actionable event is displayed.

---

# Timeline Preview Mapping

The Recent Memory section displays the newest qualifying timeline item.

Priority order:

Recent Memory

AI Follow Up

Relationship Milestone

Manual Note

System Generated Insight

Maximum preview:

Two lines.

Rich formatting is intentionally omitted.

---

# Search Mapping

Search operates against the recipient collection already available to the client.

Matching fields include:

Recipient name

Preferred name

Relationship

Tags

Timeline preview

Interests

Notes

Nickname

Favorite memories

Personality information

If future server side search is introduced:

The user experience should remain identical.

---

# Filter Mapping

Each filter maps directly to existing recipient metadata.

Examples:

Relationship

Favorite

Archived

Upcoming events

Health

Autopilot

Missing information

The frontend combines filters locally whenever possible.

---

# Favorite Mapping

Favorite status maps directly to the existing boolean favorite property.

Updating favorites uses the existing update endpoint.

Optimistic updates are encouraged.

---

# Archive Mapping

Archive actions use the existing archive functionality.

Archived recipients should not appear in the default collection.

The Archived view retrieves the existing archived dataset.

No duplicate storage exists.

---

# Bulk Action Mapping

Bulk actions execute existing endpoints sequentially or through existing batch endpoints where available.

Supported operations:

Favorite

Archive

Restore

Delete

Card Creation

The frontend displays progress independently of backend implementation.

---

# Card Creation Mapping

Selecting Send Card launches the existing Card Creation flow.

The selected recipient ID is passed into the existing experience.

No additional recipient selection is shown.

All downstream AI generation, quality validation, Handwrytten integration, and checkout remain unchanged.

---

# Memory Mapping

Log Memory opens the existing memory creation workflow.

Upon successful save:

Timeline updates.

Relationship Health refreshes.

Relationship card refreshes.

The page does not reload.

---

# Error Handling

All API failures follow the application's standardized error handling patterns.

Frontend responsibilities include:

Displaying recovery messaging.

Maintaining user context.

Retrying when appropriate.

Preventing duplicate submissions.

No backend specific error messages are exposed directly to users.

---

# Performance Considerations

The Your People page may eventually contain hundreds or even thousands of relationships.

Performance must remain consistently smooth regardless of collection size.

The experience should feel instantaneous for the vast majority of interactions.

---

# Initial Load Performance

Target first meaningful content:

Under 1.5 seconds on broadband.

Skeletons appear within:

150 milliseconds.

Search field becomes interactive immediately after hydration.

---

# Rendering Strategy

Relationship cards should render incrementally.

The user should begin interacting before every recipient has finished rendering.

Avoid rendering delays caused by waiting for complete datasets.

---

# Virtualization

Collections exceeding approximately 100 visible recipients should use list or grid virtualization.

Only visible cards and a small overscan buffer should be mounted.

This behavior should be invisible to users.

---

# Image Optimization

Recipient avatars should:

Lazy load.

Use responsive image sizes.

Cache aggressively.

Fade in after loading.

Failed images immediately fall back to initials.

---

# Search Performance

Local searches should complete in under 100 milliseconds for typical collections.

Input should never block while searching.

Searching should remain responsive while typing rapidly.

---

# Filter Performance

Applying filters should complete in under 150 milliseconds for typical collections.

Cards should animate into their new positions without noticeable lag.

---

# Sorting Performance

Changing sort order should:

Reuse existing rendered cards.

Animate movement.

Avoid unnecessary component destruction and recreation.

---

# Memory Usage

Avoid duplicating recipient objects unnecessarily.

Derived state should be memoized.

Large collections should avoid repeated deep cloning.

---

# Network Optimization

Only required recipient fields should be requested for this page.

Relationship Profile specific information should continue loading when the user opens an individual profile.

Do not preload unnecessary profile detail for every recipient.

---

# Accessibility Performance

Focus movement should remain instantaneous regardless of collection size.

Screen reader announcements should not be delayed by virtualization.

Virtualization must preserve accessibility semantics.

---

# Analytics Performance

Analytics events should never block UI rendering.

Events should be queued asynchronously.

Duplicate events should be prevented where appropriate.

---

# Acceptance Criteria

The Your People page is considered complete only when every requirement below has been satisfied.

---

## Layout

✓ Desktop layout matches the specification.

✓ Tablet layout matches the specification.

✓ Mobile layout matches the specification.

✓ Responsive breakpoints behave correctly.

✓ No horizontal scrolling occurs.

---

## Search

✓ Search updates results immediately.

✓ Search supports keyboard shortcuts.

✓ Search clears correctly.

✓ No result state displays correctly.

✓ Search performance meets targets.

---

## Filters

✓ Multiple filters work together.

✓ Filter chips update correctly.

✓ Clearing filters restores the complete collection.

✓ Mobile filter drawer functions correctly.

---

## Grid and List Views

✓ Grid view matches specifications.

✓ List view matches specifications.

✓ View preference persists across sessions.

✓ Switching views preserves scroll position whenever practical.

---

## Relationship Cards

✓ Cards display all required information.

✓ Cards resize correctly.

✓ Hover states function.

✓ Mobile actions remain accessible.

✓ Health indicators update correctly.

---

## Quick Actions

✓ View Profile opens correctly.

✓ Send Card launches the existing card workflow.

✓ Log Memory opens correctly.

✓ Overflow menu contains all specified actions.

---

## Bulk Actions

✓ Multiple selection functions correctly.

✓ Bulk toolbar appears appropriately.

✓ Bulk actions complete successfully.

✓ Partial failures are handled gracefully.

---

## Favorites

✓ Favorite status updates immediately.

✓ Favorite grouping behaves correctly.

✓ Favorite animation matches specifications.

---

## Empty States

✓ Every defined empty state is implemented.

✓ Illustrations match the illustration system.

✓ Primary actions function correctly.

---

## Loading States

✓ Skeleton layouts match final layouts.

✓ No cumulative layout shift occurs.

✓ Progressive rendering functions correctly.

---

## Error States

✓ Recovery messaging appears correctly.

✓ Retry actions function.

✓ Offline messaging behaves correctly.

✓ Broken avatars never appear.

---

## Accessibility

✓ WCAG 2.2 AA requirements are met.

✓ Keyboard navigation is complete.

✓ Screen readers announce relationship information correctly.

✓ Reduced motion preferences are respected.

---

## Performance

✓ Initial rendering meets performance targets.

✓ Virtualization functions for large collections.

✓ Filtering remains responsive.

✓ Searching remains responsive.

✓ Images load efficiently.

---

## Analytics

✓ Required analytics events fire exactly once.

✓ Metadata is accurate.

✓ No sensitive relationship content is transmitted.

---

# Definition of Done

The **Your People** experience is considered production ready only when all design, engineering, accessibility, analytics, and quality requirements have been completed and verified.

The page should feel unmistakably different from a traditional contacts application.

Instead of managing records, users should feel they are caring for relationships.

The interface should consistently reinforce the core mission of F.I. Forgot:

Helping people become more thoughtful in the relationships that matter most.

A first time user should immediately understand who deserves attention.

A returning user should immediately understand what action to take next.

Every interaction should reduce friction.

Every visual element should reinforce warmth and trust.

Every animation should feel intentional.

Every piece of information should support stronger relationships.

When this specification has been implemented in full, the Your People page should require no additional UX or product decisions during development and should be ready for production implementation with confidence.

