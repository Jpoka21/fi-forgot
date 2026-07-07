# 83_CARD_CREATION_BUILD_[SPEC.md](http://SPEC.md)

# Card Creation Build Specification

---

# Purpose

The Card Creation experience is the defining interaction of F.I. Forgot.

It is where every memory, story, insight, and relationship detail is transformed into a meaningful handwritten card.

This is not a document editor.

It is not an AI chat.

It is not a greeting card designer.

It is a guided collaboration between the user and their Relationship Concierge.

The concierge has already done the difficult work of remembering important details.

The user simply reviews, personalizes if desired, and confidently sends a card that feels deeply personal.

The experience should make users feel:

"I never could have written something this thoughtful on my own."

---

# Philosophy

The software should do almost all of the work.

The human should make only meaningful decisions.

Every screen should reduce effort.

Every interaction should increase confidence.

Users should spend their time improving a heartfelt message, not managing settings.

The experience should feel like reviewing a beautifully prepared draft from someone who knows both the sender and the recipient exceptionally well.

---

# Core Design Principles

## AI Prepares

The AI gathers memories.

The AI understands the occasion.

The AI understands the relationship.

The AI prepares the first draft.

---

## Humans Personalize

The user decides whether to edit.

They never start from a blank page.

---

## One Primary Task

At every moment the interface should answer one question:

"What is the next thing I should do?"

There should never be competing calls to action.

---

## Reduce Decision Fatigue

Defaults should be intelligent.

Card design should already be suggested.

Handwriting should already be selected.

Delivery date should already be calculated.

Envelope should already be chosen.

The user should rarely need to change defaults.

---

## Confidence Before Sending

Before committing, users should clearly understand:

What will be written.

How it will look.

When it will arrive.

Who it will be sent to.

Nothing should be ambiguous.

---

# Information Hierarchy

The screen follows a fixed hierarchy.

1. Recipient Context

2. Occasion

3. Concierge Briefing

4. AI Generated Draft

5. Card Preview

6. Card Design

7. Delivery

8. Final Review

The writing experience always receives the greatest visual emphasis.

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

The layout uses two columns.

Left Column

Recipient context

Occasion

Concierge briefing

Delivery information

Right Column

Draft editor

Card preview

Primary actions

Desktop Layout

```

----------------------------------------------------------

Recipient Header

----------------------------------------------------------

----------------------------------------------------------

| Left Sidebar        | Draft Workspace                |

|                     |                                |

| Occasion            | Draft Editor                   |

|                     |                                |

| Briefing            | Live Card Preview              |

|                     |                                |

| Delivery            |                                |

----------------------------------------------------------

----------------------------------------------------------

Review and Send

----------------------------------------------------------

```

---

# Tablet Layout Specification

Width

768 through 1199 pixels

Grid

8 Columns

Sidebar stacks above editor.

Preview appears beneath editor.

Delivery information collapses into expandable cards.

---

# Mobile Layout Specification

Single column layout.

Padding

20px

Order

Recipient

Occasion

Briefing

Draft

Preview

Design

Delivery

Review

Primary button remains sticky near the bottom during editing.

Touch targets remain at least 48px.

---

# Responsive Behavior

Desktop

Two column editing experience.

Preview always visible.

Tablet

Preview moves below editor.

Sidebar becomes inline.

Mobile

Everything stacks vertically.

Preview appears after editor.

Primary actions become full width.

Nothing requires horizontal scrolling.

---

# Component Tree

Card Creation

* Recipient Header

* Occasion Summary

* Concierge Briefing

* Draft Workspace

  * Draft Toolbar

  * Draft Editor

  * Character Count

  * AI Actions

* Live Card Preview

* Card Design Selector

* Handwriting Preview

* Delivery Summary

* Review Panel

* Primary Actions

---

# Recipient Header Specification

Purpose

Remind the user exactly who they are writing to.

Height

120px

Contains

Recipient avatar

Recipient name

Relationship label

Occasion

Event date

Relationship summary shortcut

Overflow menu

The header remains visible while scrolling on desktop.

---

# Occasion Summary

Displays

Occasion name

Event date

Days remaining

Delivery recommendation

Examples

Birthday

Father's Day

Graduation

Wedding

Anniversary

Promotion

Retirement

Baby Shower

The occasion determines every downstream AI decision.

---

# Concierge Briefing Specification

Purpose

Provide concise context before the user reads the draft.

The briefing explains why the AI wrote what it wrote.

Card Height

Auto

Padding

28px

Contents

Relationship summary

Relevant memories

Important recent updates

Recommended tone

Things to avoid

Suggested themes

Example

Emily recently started teaching second grade and has been talking about how rewarding it has been. She still laughs about your Yellowstone camping trip and appreciates sincere messages more than humorous ones. Avoid mentioning her previous job because she prefers to focus on the future.

The briefing should never exceed approximately 250 words.

If more context exists, provide a "Show More" interaction.

---

# Draft Workspace Specification

The draft workspace is the primary focus of the screen.

Minimum Width

720px

Minimum Height

700px

Contents

Toolbar

Draft editor

Revision history

Character count

AI refinement actions

---

# Draft Toolbar

Actions

Undo

Redo

Copy

Expand

Shorten

More Formal

More Casual

More Emotional

Regenerate

These actions modify the draft while preserving recipient context.

No action should erase user edits without confirmation.

---

# Draft Editor

Typography

18px

Line Height

1.7

Maximum Line Length

72 characters

Padding

32px

Background

White

Border Radius

24px

Users edit directly within the generated draft.

Autosave occurs continuously.

Manual save is never required.

---

# Character Count

Displayed subtly in the lower right corner.

Shows

Characters used

Estimated handwritten pages

Examples

428 Characters

Approximately one handwritten page

Warnings appear only if physical card limits are exceeded.

They should offer helpful guidance rather than errors.

---

# AI Refinement Actions

Each refinement creates a new version without overwriting the current draft.

Available refinements

Make More Personal

Make Shorter

Make Longer

Add Humor

Increase Warmth

Reduce Formality

Focus on Gratitude

Mention Family

Mention Shared Memories

Every refinement explains what it changes before execution.

Example

"Increase Warmth adds more emotional language without changing the overall message."

---

# Version History

Every AI refinement creates a version.

Users may switch between previous versions.

Version list includes

Timestamp

Action used

Preview snippet

Restore button

Version history is never destructive.

Users can always return to the latest draft.

---

# Live Card Preview Specification

The Live Card Preview transforms the draft into its physical handwritten appearance.

This is not a simple text preview.

It should create confidence that the finished card will feel authentic and premium.

The preview updates in real time as the user edits the message.

Desktop

The preview remains visible while the editor scrolls.

Tablet

The preview appears immediately beneath the editor.

Mobile

The preview follows the editor and may be collapsed by default to reduce scrolling.

---

## Card Preview Container

Minimum Width

420px

Aspect Ratio

Matches the selected card dimensions.

Corner Radius

24px

Background

Warm White

Subtle paper texture.

Very light drop shadow.

---

## Preview Components

Selected card artwork

Handwritten message

Signature

Margins

Paper texture

Optional logo if enabled for Business Concierge

No editing controls appear inside the preview.

Editing always occurs in the Draft Workspace.

---

## Live Updating

Every meaningful edit updates the preview.

Update latency should feel instantaneous.

Cursor position in the editor must never be interrupted by preview rendering.

---

## Zoom Controls

Desktop

100 percent

150 percent

Fit Width

Tablet

Fit Width only.

Mobile

Pinch to zoom.

Double tap returns to default zoom.

---

## Overflow Handling

If the handwritten message exceeds the available writing area, the preview immediately displays a warning.

Example

"This message may not fit on one handwritten page."

Options

Shorten Message

Continue Anyway

The user should never discover layout issues after submission.

---

# Handwriting Preview Specification

Purpose

Allow users to preview the selected handwriting style before sending.

The handwriting preview appears directly beneath the live card preview.

---

## Components

Handwriting sample

Font name

Description

Change button

---

## Sample Text

The preview uses a short excerpt from the actual draft.

Users should see their own words rather than placeholder text.

---

## Handwriting Styles

Only handwriting styles supported by the existing backend are displayed.

Each style includes

Preview

Style name

Short description

Example

Elegant

Friendly

Modern

Classic

Business

The recommended style is selected automatically.

---

## Changing Handwriting

Selecting a different handwriting style updates the preview immediately.

No confirmation dialog is required.

---

# Card Design Selector Specification

Purpose

Allow users to choose the physical greeting card.

Most users should never need to change the recommended design.

---

## Placement

Immediately below the handwriting preview.

---

## Layout

Responsive grid.

Desktop

Four columns.

Tablet

Three columns.

Mobile

Two columns.

---

## Card Tile

Aspect ratio matches the real product.

Contains

Thumbnail

Occasion label

Selected indicator

Hover state

---

## Selection Behavior

Only one card may be selected.

Selection updates immediately.

Previously selected card smoothly deselects.

---

## Recommended Badge

The AI recommended design displays

"Recommended"

This badge appears only when appropriate.

---

## Browse More

Opens the full card library.

Supports

Search

Occasion filters

Season filters

Favorites

Recently used

The browsing experience uses the existing backend catalog.

No backend changes are required.

---

# Envelope Specification

Envelope selection is hidden by default when only one option exists.

If multiple supported envelope styles are available, the section expands automatically.

---

## Components

Envelope preview

Color

Return address summary

Recipient address summary

Edit Address button

---

## Address Verification

If address validation reports an issue, display a warning before submission.

Example

"This address may be incomplete."

Primary Action

Review Address

Secondary Action

Continue Anyway

---

# Signature Specification

The signature section determines how the handwritten message ends.

---

## Components

Closing phrase

Sender name

Optional custom signature

Preview

---

## Default Closing

Automatically generated from the selected tone.

Examples

Love,

Thinking of you,

With gratitude,

Best wishes,

Congratulations,

The user may edit the closing independently from the message body.

---

## Sender Name

Defaults to the account owner's preferred name.

Editable.

---

## Business Mode

When Business Concierge is active, optional business signatures become available according to existing business logic.

---

# Delivery Specification

Purpose

Provide complete confidence regarding arrival.

The delivery section appears after the physical card selections.

---

## Components

Recipient

Shipping address

Mail date

Estimated arrival

Shipping method

Tracking status if available

---

## Timeline Visualization

Today

↓

Production

↓

Mailed

↓

Estimated Delivery

The visualization should feel informative rather than technical.

---

## Arrival Messaging

Examples

Estimated to arrive before the birthday.

Expected to arrive three days before the anniversary.

May arrive after the holiday.

Messages should use natural language.

---

## Delivery Recommendation

If timing is ideal

"Everything looks perfect."

If timing is tight

"We recommend sending today."

If timing is impossible

"This card may arrive after the occasion."

Provide options rather than warnings.

Examples

Send Anyway

Upgrade Shipping

Send Digital Reminder Instead

Only supported options appear.

---

# Review Panel Specification

The Review Panel summarizes every important decision before submission.

Purpose

Allow users to verify everything at a glance.

---

## Contents

Recipient

Occasion

Selected card

Handwriting

Delivery date

Estimated arrival

Final message preview

Address summary

---

## Confirmation Checklist

Displayed automatically.

Examples

Recipient confirmed

Address confirmed

Message reviewed

Card selected

Delivery timing confirmed

Each completed item displays a subtle success indicator.

---

## Primary Action

Send Card

Large.

Full width on mobile.

Always visually dominant.

---

## Secondary Actions

Save Draft

Schedule Later

Cancel

These actions remain visually subordinate.

---

# Scheduling Specification

Users may send immediately or schedule for later.

---

## Schedule Picker

Calendar

Preferred send date

Arrival estimate

Production estimate

The calendar automatically highlights recommended dates.

---

## Smart Scheduling

The concierge recommends the optimal mailing date.

Recommendation text

"Recommended for arrival two days before the birthday."

Users may override recommendations.

---

## Scheduled Cards

Scheduled cards clearly indicate

Scheduled send date

Estimated delivery

Status

Users may edit or cancel until production begins.

---

# Draft Saving Behavior

Every meaningful change autosaves.

Autosave delay

Approximately one second after editing stops.

Users never manually save.

Saving state examples

Saving...

Saved

Retrying...

If offline

Changes stored locally until connection returns.

No edits should ever be lost.

---

# Validation Rules

Validation should prevent mistakes without interrupting creativity.

Required

Recipient

Occasion

Message

Delivery address

Card selection

Warnings

Long message

Late arrival

Incomplete address

No handwriting selected if required

Warnings explain

Why

Impact

How to fix

The interface should never present cryptic validation messages.

---

# Empty States

The Card Creation experience should never present a blank or confusing interface.

Every empty state should guide the user toward the next meaningful action.

---

# No Recipient Selected

## Purpose

Prevent users from attempting to write a card before selecting who it is for.

## Illustration

Warm relationship themed illustration.

## Primary Message

"Choose someone important."

## Supporting Text

"We'll use everything we've learned about your relationship to prepare a thoughtful first draft."

## Primary CTA

Select Recipient

## Secondary CTA

Add New Person

---

# No Occasion Selected

## Purpose

Occasion determines the AI briefing and draft.

## Message

"What are you celebrating?"

## Occasion Grid

Birthday

Anniversary

Graduation

Wedding

New Baby

Thank You

Thinking of You

Sympathy

Congratulations

Retirement

Holiday

Just Because

The most frequently used occasions appear first.

---

# No AI Draft Yet

Before generation, the draft area should explain what will happen.

## Illustration

Subtle concierge illustration.

## Message

"Your Relationship Concierge is preparing a personalized handwritten message."

## Supporting Text

"We're reviewing your memories, previous cards, important moments, and relationship details."

No loading spinner is shown until generation actually begins.

---

# No Address Available

If a physical address has not yet been collected:

Message

"We need a mailing address before we can send a handwritten card."

Primary Action

Add Address

Secondary Action

Save Draft

The user should never lose progress.

---

# No Card Design Selected

This state rarely appears because a recommended design is preselected.

If it does occur:

Message

"Choose the card that best fits this occasion."

The recommended design is visually highlighted.

---

# Loading States

Loading should communicate progress without creating anxiety.

Skeletons are preferred over spinners.

---

# Initial Page Load

Skeleton Components

Recipient Header

Occasion Summary

Concierge Briefing

Draft Editor

Card Preview

Delivery Summary

All skeletons preserve final layout dimensions.

No layout shifting should occur.

---

# AI Draft Generation

Unlike the initial page load, AI generation deserves a richer experience.

Progress Card

Headline

"Your Relationship Concierge is writing..."

Supporting Steps

Understanding your relationship...

Reviewing important memories...

Choosing the right tone...

Preparing your handwritten draft...

Generating the final message...

Each step fades smoothly into the next.

Do not display percentages.

Do not display token counts.

Do not expose AI implementation details.

Estimated completion time should not be shown unless supported by the backend.

---

# Preview Rendering

While the handwritten preview is rendering:

Display a paper skeleton with animated handwriting lines.

The transition to the finished preview should fade smoothly.

---

# Card Library Loading

Display placeholder card thumbnails.

Maintain the final grid layout.

Images fade in individually as they load.

---

# Delivery Estimate Loading

Display skeleton rows for

Shipping method

Mail date

Estimated arrival

Address summary

---

# Error States

Errors should always preserve user work.

The user should never lose edits because of a failure.

---

# AI Generation Failed

Headline

"We couldn't finish writing your card."

Supporting Text

"Your relationship information is safe. Let's try again."

Primary Action

Generate Again

Secondary Action

Edit Existing Draft

If a previous draft exists, it remains available.

---

# Preview Failed

Message

"We couldn't generate the handwriting preview."

Primary Action

Retry Preview

Editing remains available.

---

# Autosave Failed

A subtle banner appears above the editor.

Message

"We couldn't save your latest changes."

Actions

Retry

Dismiss

Edits remain in memory until saving succeeds.

---

# Network Offline

Persistent banner

"You're offline."

Supporting Text

"Continue editing. We'll save everything when your connection returns."

No modal should interrupt editing.

---

# Delivery Validation Failed

Example

"This address may prevent successful delivery."

Actions

Review Address

Send Anyway

Only when backend rules allow.

---

# Card Submission Failed

Headline

"Your card wasn't sent."

Supporting Text

"No worries. Everything has been saved."

Primary Action

Try Again

Secondary Action

Save Draft

---

# Editing Interactions

Editing should feel effortless.

The interface should never fight the user.

---

## Cursor Behavior

Typing should never cause the preview to lose synchronization.

Cursor position is always preserved.

Undo and redo behave exactly as expected.

---

## Text Selection

Selected text enables contextual AI actions.

Examples

Rewrite Selection

Shorten Selection

Make More Personal

Improve Flow

These appear in a lightweight floating toolbar.

---

## Inline Suggestions

Optional AI suggestions appear subtly beneath paragraphs.

Examples

"Consider mentioning the camping trip."

"Reference their recent promotion."

Suggestions never modify text automatically.

The user explicitly accepts each suggestion.

---

## Paragraph Editing

Pressing Enter creates a new paragraph.

Paragraph spacing follows the design system.

No rich text formatting is supported.

The experience intentionally resembles writing a heartfelt letter.

---

# Modals

Only important decisions should require modal dialogs.

---

## Regenerate Draft Modal

Purpose

Warn that a completely new draft will be created.

Message

"This creates a new version. Your current draft will remain available."

Actions

Generate New Version

Cancel

---

## Discard Changes Modal

Message

"You have unsaved local changes."

Actions

Continue Editing

Discard Changes

---

## Delete Draft Modal

Message

"Delete this draft permanently?"

Actions

Delete

Cancel

Deletion removes only the draft.

Relationship memories remain untouched.

---

## Address Editor Modal

Contains

Recipient Name

Street

Apartment

City

State

Postal Code

Country

Validation occurs inline.

---

## Card Library Modal

Full screen on mobile.

Large dialog on desktop.

Supports

Search

Filters

Favorites

Preview

Selection

---

# Navigation Behavior

Leaving the page while edits exist should never surprise the user.

If autosave has completed, navigation proceeds normally.

If changes remain unsaved locally, confirmation is required.

---

# Browser Refresh

If a refresh occurs during editing:

Restore the most recent autosaved version.

If local edits exist, offer recovery.

Example

"We found an unsaved version from a few moments ago."

Primary Action

Restore Draft

Secondary Action

Discard

---

# Multi Device Continuity

If the same draft is opened on another device:

Display a synchronization notice.

Example

"This draft was recently updated on another device."

Offer

Use Latest Version

Review Differences

No edits should silently overwrite another version.

---

# Animations

Animations should communicate progress, reinforce confidence, and make transitions feel natural.

Motion should always feel premium.

Nothing should feel playful or distracting.

All animations respect the user's reduced motion preferences.

---

## Page Entrance

Duration

250ms

Animation

Fade in with subtle upward movement.

Distance

12px

All major sections animate in sequence.

Order

Recipient Header

Occasion Summary

Concierge Briefing

Draft Editor

Card Preview

Delivery Summary

Review Panel

---

## AI Draft Appearance

After generation completes, the draft fades into the editor.

Duration

300ms

The draft should never appear one sentence at a time.

The complete message appears together.

---

## Card Preview Updates

Editing the draft causes the preview to update with a soft crossfade.

Duration

150ms

The preview should never flash or reload.

---

## Card Selection

Selecting a card design gently scales the selected card.

Scale

102 percent

Duration

120ms

Previously selected cards smoothly return to their default state.

---

## Handwriting Changes

Switching handwriting styles crossfades between previews.

Duration

200ms

---

## Buttons

Hover

Soft elevation

Duration

120ms

Press

Scale to 98 percent

Duration

80ms

Release

Return smoothly to normal size.

---

## Success Animation

After sending a card successfully:

A subtle success checkmark appears.

The page transitions into the confirmation experience.

No confetti.

No celebration effects.

The emotional reward comes from the message itself.

---

# Microinteractions

Every interaction should reinforce quality.

---

## Recipient Header

Hovering over the avatar subtly brightens the image.

Clicking the avatar opens the Relationship Profile.

---

## Briefing Card

Expandable sections smoothly reveal additional information.

Chevron rotates naturally.

---

## AI Suggestion Chips

Hover

Background becomes slightly warmer.

Selection

Soft highlight.

No dramatic movement.

---

## Draft Toolbar

Icons subtly brighten on hover.

Disabled actions remain visible but muted.

Tooltips appear after a short delay.

---

## Character Count

Approaching physical limits gradually changes the text color.

No sudden warning.

The change should feel informative.

---

## Card Tiles

Hover

Soft shadow increase.

Selection

Animated border.

Recommended badge remains fixed.

---

## Delivery Timeline

Completed milestones display a subtle checkmark animation.

Future milestones remain muted.

---

## Review Checklist

Each completed item displays a brief confirmation animation.

Duration

150ms

---

# Keyboard Behavior

The entire Card Creation experience must be fully usable without a mouse.

---

## Tab Order

Recipient Header

Occasion

Briefing

Draft Toolbar

Draft Editor

AI Actions

Card Preview Controls

Card Design

Delivery

Review

Primary Actions

Logical tab order is mandatory.

---

## Editor Shortcuts

Ctrl or Command + Z

Undo

Ctrl or Command + Shift + Z

Redo

Ctrl or Command + C

Copy

Ctrl or Command + A

Select All

Ctrl or Command + F

Search within draft when supported.

---

## Toolbar Shortcuts

AI refinement actions should expose keyboard shortcuts where appropriate.

Example

Alt + Shift + M

Make More Personal

Shortcuts must be discoverable through tooltips.

---

## Escape Key

Closes

Dialogs

Menus

Search overlays

Never exits the editor unexpectedly.

---

## Enter Key

Activates focused buttons.

Creates new paragraphs while editing.

Never submits the card unintentionally.

---

## Focus States

Every interactive element displays a visible focus indicator.

Focus rings follow the Design System specification.

Focus is never hidden.

---

# Accessibility Requirements

Accessibility is a first class feature.

Not a post implementation task.

---

## WCAG Compliance

Minimum

WCAG 2.2 AA

---

## Contrast

All text meets or exceeds required contrast ratios.

Status badges remain distinguishable without relying solely on color.

---

## Screen Readers

Every interactive element includes descriptive labels.

Examples

Generate Draft

Open Card Library

Preview Handwriting

Send Card

Relationship context should be announced before the editor.

---

## Live Regions

The following updates should be announced automatically.

Draft generation completed.

Autosave completed.

Card successfully sent.

Validation errors.

Delivery estimate updated.

---

## Editor Accessibility

The editor behaves like a standard multiline text field.

Spellcheck remains available.

Cursor position is announced correctly.

Selections are preserved.

---

## Images

Decorative artwork is ignored by screen readers.

Card artwork includes descriptive alternative text.

Recipient photos include meaningful labels.

---

## Reduced Motion

Every animation has a reduced motion equivalent.

Crossfades become instant.

Movement becomes opacity changes only.

---

## Touch Targets

Minimum

48 by 48 pixels

Applies to

Buttons

Icons

Menus

Card tiles

Toolbar actions

---

## Zoom Support

The interface remains fully usable at

200 percent browser zoom.

No clipped controls.

No hidden functionality.

---

# Analytics Events

The following events are tracked.

Card Creation Opened

Recipient Selected

Occasion Selected

Briefing Expanded

Draft Generated

Draft Regenerated

Draft Edited

AI Refinement Used

Version Restored

Card Design Changed

Handwriting Changed

Preview Opened

Preview Zoom Changed

Delivery Date Changed

Address Edited

Review Opened

Draft Saved

Draft Recovery Used

Card Scheduled

Card Sent

Submission Failed

Generation Failed

Validation Warning Displayed

Card Creation Abandoned

Each event includes

Timestamp

Relationship ID

Occasion Type

Session ID

Anonymous performance metrics where appropriate.

No card content is stored in analytics events.

---

# API Data Mapping

This specification preserves all existing backend contracts.

No API changes are required.

---

## Recipient Header

Existing relationship endpoint.

Fields

Recipient

Relationship

Avatar

Relationship Type

Favorite Status

---

## Occasion Summary

Upcoming occasion endpoint.

Fields

Occasion

Event Date

Countdown

Preparation Status

---

## Concierge Briefing

Existing AI briefing pipeline.

Fields

Relationship Summary

Relevant Memories

Recent Updates

Tone

Things To Avoid

Suggested Themes

---

## Draft Workspace

Existing draft generation endpoint.

Fields

Draft

Version History

Generation Status

Character Count

---

## Card Preview

Existing preview rendering service.

Fields

Card Artwork

Handwriting

Message

Signature

---

## Card Library

Existing card catalog.

Fields

Card ID

Artwork

Occasion

Tags

Availability

Recommendation

---

## Delivery

Existing delivery pipeline.

Fields

Recipient Address

Production Date

Mail Date

Estimated Arrival

Shipping Status

---

## Review Panel

Aggregates existing data already loaded by the page.

No additional endpoint required.

---

# Performance Considerations

Performance directly affects trust.

The writing experience should always feel immediate.

---

## Largest Contentful Paint

Target

Less than 2.5 seconds.

---

## Interaction to Next Paint

Target

Less than 200 milliseconds.

---

## Cumulative Layout Shift

Target

Less than 0.1.

---

## Draft Generation

Generation occurs asynchronously.

The editor layout never changes while waiting.

---

## Autosave

Debounced.

Only changed content is transmitted.

Repeated saves should not create unnecessary network traffic.

---

## Card Preview

Preview rendering is incremental.

Only modified content re renders.

Card artwork is cached.

---

## Images

Card artwork uses responsive image sizes.

Thumbnails lazy load.

Selected artwork preloads the larger preview.

---

## Memory Usage

Previous draft versions load on demand.

Large version histories should never block editing.

---

# Acceptance Criteria

The Card Creation experience is considered complete when:

Users never begin with a blank page.

Recipient context is immediately visible.

The AI briefing clearly explains the generated message.

Draft editing feels responsive.

The live preview accurately reflects the final handwritten card.

Recommended card artwork is automatically selected.

Recommended handwriting is automatically selected.

Delivery timing is clearly explained.

Autosave functions reliably.

Users can safely recover previous versions.

Loading, empty, and error states are fully implemented.

Accessibility requirements pass manual and automated testing.

Performance budgets are achieved.

No backend logic has changed.

No API contracts have changed.

Cursor required no product interpretation during implementation.

---

# Definition of Done

The Card Creation experience is complete when:

Every layout matches the Design System.

Every responsive breakpoint behaves exactly as specified.

Every interaction follows this document.

Every animation follows the Motion System.

Every empty, loading, validation, and error state has been implemented.

Every accessibility requirement has been verified.

Analytics events fire correctly.

The physical handwritten preview matches production output.

Existing backend services operate without modification.

A user can confidently review, personalize, and send a deeply thoughtful handwritten card in a calm, intuitive, premium experience that feels like working alongside a world class Relationship Concierge rather than using software.