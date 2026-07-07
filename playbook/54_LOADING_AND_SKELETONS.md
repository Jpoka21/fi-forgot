# 54_LOADING_AND_[SKELETONS.md](http://SKELETONS.md)

# Loading and Skeletons

---

# Purpose

The F.I. Forgot loading system defines how the product behaves while information is being prepared, fetched, generated, saved, synced, or displayed.

Loading should never make the product feel slow, broken, or technical.

Loading should feel like a thoughtful concierge quietly preparing the next part of the experience.

Every loading decision should answer one question:

> **"Would a world class Relationship Concierge make the user wait this way?"**

---

# Loading Philosophy

Loading is part of the experience.

It is not a technical interruption.

In F.I. Forgot, loading should feel calm, reassuring, and purposeful.

The product should communicate that something meaningful is happening without overwhelming the user with system mechanics.

Avoid making users stare at blank screens.

Avoid making users wonder whether their action worked.

Avoid making users feel trapped.

The interface should always provide context.

---

# Emotional Goals

Loading states should communicate:

Trust

Calm

Care

Progress

Confidence

Continuity

The user should feel:

The concierge is working.

The system is stable.

Their information is safe.

Their action was understood.

---

# Perceived Performance Principles

## Show Structure First

Display the layout before the final content arrives.

Skeletons should preserve the shape of the page.

---

## Prioritize Meaningful Content

Load the most important relationship content first.

Examples:

Recipient name before secondary details.

Upcoming moment before supporting insights.

Card draft before advanced controls.

---

## Avoid Empty Waiting

Never show a blank page while loading.

Use skeletons, partial content, or helpful contextual loading messages.

---

## Preserve Context

If the user is already on a page, avoid replacing the entire screen with a loading state.

Update only the affected area.

---

## Use Gentle Language

When text is needed, describe what is happening in human terms.

Avoid technical language.

---

# Progressive Disclosure

Do not wait for everything to load before showing anything.

Show content progressively:

1. Page structure

2. Primary content

3. Supporting content

4. Secondary controls

5. Enrichment details

This keeps the experience feeling responsive.

---

# Skeleton Philosophy

Skeletons should suggest what is coming.

They should not feel like gray software scaffolding.

Skeletons should feel soft, warm, and integrated into the product's visual language.

Skeletons are preferred over spinners for most content loading.

---

# Skeleton Design Language

## Color

Use warm neutral tones from the color system.

Base:

```

#ECE6DD

```

Highlight:

```

#F7F4EF

```

Never use cold gray skeletons.

---

## Shape

Match the real content.

Text skeletons should look like text lines.

Avatar skeletons should match avatar shape.

Card skeletons should match final card layout.

---

## Radius

Use the same border radius as the component being loaded.

---

## Motion

Use very subtle shimmer or pulse.

Motion should be slow and calm.

Respect reduced motion settings.

---

# Global Loading Behavior

The application should avoid full screen loading after the initial app load.

Whenever possible:

Keep navigation visible.

Keep page structure visible.

Keep completed content visible.

Only load the area that is changing.

---

# Initial App Loading

Use a warm branded loading screen only when absolutely necessary.

It should include:

Simple logo or wordmark.

Warm background.

Short reassuring message if load exceeds normal timing.

Avoid complex animation.

Avoid progress bars unless progress is real.

---

# Page Loading

Page loading should use a skeleton version of the page template.

Examples:

Dashboard skeleton.

Recipient profile skeleton.

Timeline skeleton.

Card creation skeleton.

Settings skeleton.

The user should understand what page is coming before content appears.

---

# Dashboard Loading

Dashboard loading should preserve the dashboard hierarchy.

Skeleton order:

1. Welcome area

2. Primary upcoming moment

3. Suggested thoughtful action

4. Relationship cards

5. Supporting insights

Do not show unrelated loading blocks.

Do not make the dashboard appear more complex than it is.

---

# Recipient Loading

Recipient loading should prioritize identity.

Show:

Avatar skeleton.

Name line skeleton.

Relationship context skeleton.

Primary action skeleton.

Timeline skeleton.

Do not load settings before relationship content.

---

# Timeline Loading

Timeline loading should feel like journal entries preparing.

Use stacked memory card skeletons.

Avoid endless pulsing.

If older entries are loading, show loading only near the bottom of the timeline.

Do not disturb entries already visible.

---

# Card Creation Loading

Card creation loading must feel calm and confident.

The writing area should remain stable.

If generating a draft, show a focused generation state inside the draft area.

Do not block the entire screen unless absolutely required.

---

# AI Generation Loading

AI generation should feel like the concierge is composing thoughtfully.

Use human language.

Examples:

"Preparing a thoughtful first draft."

"Looking at what you have shared."

"Shaping this into something that feels personal."

Avoid:

"Calling AI."

"Processing request."

"Generating output."

"Waiting for model."

Do not imply the user is talking to a machine.

---

# Image Loading

Images should fade in gently.

Use aspect ratio placeholders to prevent layout shift.

Recipient photos should never cause jumping layout.

Card artwork should preserve its final dimensions while loading.

---

# Card Artwork Loading

Card artwork loading should feel premium.

Use warm placeholder blocks.

Preserve card aspect ratio.

Fade artwork in smoothly.

If artwork fails, show a graceful fallback with retry.

Never show broken image icons.

---

# Form Loading

Forms should remain usable when possible.

If a submit action is loading:

Disable duplicate submission.

Keep entered values visible.

Show loading state on the button.

Do not clear the form until success is confirmed.

---

# Search Loading

Search should feel responsive.

Show results progressively.

Use a small inline loading indicator.

Never block the entire screen for search.

If results are slow, show helpful text.

---

# List Loading

Lists should use item skeletons that match the real list item layout.

For long lists:

Load initial items first.

Load additional items as needed.

Avoid showing too many skeletons at once.

---

# Infinite Scrolling

Infinite scrolling should only be used when it improves browsing.

For timelines, it may be appropriate.

For critical actions, pagination or explicit loading may be better.

When loading more:

Keep existing content stable.

Show a small loading area at the bottom.

Avoid jumping scroll position.

---

# Lazy Loading

Lazy loading should apply to:

Illustrations below the fold.

Images below the fold.

Long timelines.

Secondary dashboard insights.

Non essential supporting content.

Never lazy load primary actions in a way that makes the page feel broken.

---

# Optimistic UI Philosophy

Optimistic UI should be used when success is highly likely.

Examples:

Saving a memory.

Marking a card as reviewed.

Updating a simple preference.

The interface may reflect the change immediately, then quietly reconcile in the background.

If the action fails, explain gently and restore state clearly.

---

# Background Loading

Background loading should not interrupt the user.

Examples:

Refreshing relationship insights.

Checking card status.

Syncing delivery updates.

Updating relationship health.

Use subtle indicators only when useful.

Never interrupt writing for background work.

---

# Refresh Behavior

Manual refresh should give immediate feedback.

Automatic refresh should be quiet.

Do not replace visible content abruptly.

New information should appear gently.

---

# Autosave Indicators

Autosave should be subtle.

Possible states:

Saving.

Saved.

Unable to save.

The indicator should sit near the content being saved.

Never interrupt typing.

Never use modal confirmation for autosave.

---

# Sync Indicators

Sync indicators should be reassuring.

Use plain language.

Examples:

"Updated just now."

"Saving changes."

"Could not update. Try again."

Avoid technical sync terms unless needed.

---

# Empty Loading States

When a section has no content yet and is also loading, avoid showing both an empty state and a skeleton.

Choose one clear state.

If content may appear, show skeleton.

If content is confirmed absent, show empty state.

---

# Spinner Usage

Spinners are allowed only for small inline loading.

Examples:

Button loading.

Small refresh action.

Short background process.

Avoid full page spinners.

Avoid large centered spinners.

Avoid spinner only experiences.

---

# Progress Indicators

Use progress indicators only when progress is real.

Do not fake precision.

For uncertain processes, use calm status messaging instead.

---

# Timeout Behavior

If loading takes longer than expected, update the message.

First stage:

Continue gentle loading.

Second stage:

Explain that it is taking longer than usual.

Third stage:

Offer retry or safe exit.

Never leave users waiting indefinitely.

---

# Offline Loading Behavior

When offline:

Keep available cached content visible.

Explain that new updates may not load.

Allow drafting when possible.

Queue safe actions when possible.

Clearly mark anything not yet synced.

---

# Retry Patterns

Retries should be clear and calm.

Use:

Retry button.

Plain explanation.

No blame.

No technical codes unless needed for support.

Example:

"We could not load this right now. Try again."

---

# Accessibility Requirements

Loading states must be accessible.

Use appropriate ARIA attributes.

Announce important loading changes to screen readers.

Avoid excessive announcements.

Respect reduced motion.

Ensure skeletons do not create confusing reading order.

Do not trap keyboard focus during loading.

---

# Performance Standards

Loading states should minimize layout shift.

Targets:

No major content jumping.

Skeleton dimensions match final content.

Images reserve space before loading.

Buttons maintain width during loading.

Controls do not move unexpectedly.

---

# Loading Copy Principles

Loading copy should be:

Human.

Brief.

Calm.

Specific.

Helpful.

Never overly cute.

Never technical.

Never apologetic unless something has gone wrong.

---

# Recommended Loading Messages

## Card Draft

"Preparing a thoughtful first draft."

---

## Recipient Profile

"Gathering what matters about this relationship."

---

## Timeline

"Loading your shared moments."

---

## Dashboard

"Preparing your relationship briefing."

---

## Card Artwork

"Loading card designs."

---

## Saving

"Saving."

---

## Saved

"Saved."

---

## Longer Wait

"This is taking a little longer than usual."

---

# Loading Anti Patterns

Never use:

Blank white screens.

Full page spinners for normal content.

Cold gray skeletons.

Fast aggressive shimmer.

Technical loading messages.

Fake progress bars.

Loading states that block unrelated work.

Clearing content while refreshing.

Buttons that change width while loading.

Skeletons that do not match final layout.

Multiple competing loading indicators.

Animations that continue forever after content loads.

Broken image icons.

Unexplained delays.

Modal loading for ordinary actions.

---

# Review Checklist

Before approving any loading state, verify:

□ Does the user understand what is happening?

□ Is the layout preserved?

□ Is important content prioritized?

□ Are skeletons warm and consistent?

□ Is motion subtle?

□ Is reduced motion supported?

□ Are blank screens avoided?

□ Are spinners used only where appropriate?

□ Are button loading states stable?

□ Are images reserving space?

□ Is autosave unobtrusive?

□ Are errors handled gracefully if loading fails?

□ Is keyboard focus preserved?

□ Are screen reader users supported?

□ Does the experience feel calm rather than technical?

□ Would this loading state feel appropriate for a premium Relationship Concierge?

If the answer to any question is no, the loading state should be revised before implementation.