# 59_SEARCH_AND_FILTER_[PATTERNS.md](http://PATTERNS.md)

# Search And Filter Patterns

---

# Purpose

Search is not about finding data.

It is about finding people.

Every search experience in F.I. Forgot should help users quickly reconnect with the relationships, memories, cards, and moments that matter most.

Filters should reduce effort.

Search should reduce thinking.

Together they should make the product feel like it already knows where the user wants to go.

Every search experience should answer one question:

**"What would a world class Relationship Concierge help someone find?"**

---

# Search Philosophy

Most applications search records.

F.I. Forgot searches relationships.

The user should never feel like they are searching a database.

They should feel like they are recalling someone important.

Search should be:

* fast

* forgiving

* predictive

* contextual

* human

* emotionally aware

Search is an assistant, not a command line.

---

# Relationship Concierge Approach

A Relationship Concierge remembers people before details.

Search should prioritize:

* people

* relationships

* occasions

* memories

* cards

* conversations

* meaningful moments

Results should always feel useful, even when the exact search term is imperfect.

---

# Emotional Goals

Search should create:

## Confidence

Users trust they will find what they need.

---

## Speed

Results appear almost instantly.

---

## Familiarity

People feel recognizable.

---

## Calm

Finding something should never feel like work.

---

## Discovery

Users should occasionally rediscover forgotten moments.

---

# Search Principles

Search should:

* begin immediately

* tolerate mistakes

* prioritize relevance

* highlight meaningful information

* require minimal typing

* remember recent activity

Never require exact spelling.

Never punish imperfect searches.

---

# Universal Search

A global search should exist throughout the application.

It should search:

* People

* Memories

* Upcoming Events

* Card Drafts

* Sent Cards

* Business Contacts

* Companies

* Notes

* Timeline Entries

Results should be grouped by category.

Example:

```

People

John Smith

Emily Johnson

----------

Upcoming Events

John Birthday

----------

Memories

Camping Trip

----------

Cards

Birthday Draft

----------

Business Contacts

Sarah at ABC Realty

```

---

# Search Placement

Desktop

Persistent in the top navigation.

Mobile

Accessible from the bottom navigation and dedicated search screen.

Search should never feel hidden.

---

# Search Behavior

Search begins after the first character.

Results update continuously.

No search button required.

Pressing Enter should open the highest confidence result.

Search should debounce input to reduce unnecessary requests.

---

# Search Ranking

Results should prioritize:

1. Exact name matches

2. Recently viewed people

3. Upcoming events

4. Frequently accessed relationships

5. Partial matches

6. Memories

7. Card drafts

8. Business contacts

9. Older content

Relationships should always rank above generic content.

---

# Fuzzy Search

Search should tolerate:

misspellings

nicknames

partial words

reversed names

Examples

Search:

Jon

Results:

John

Jonathan

Johnny

Search:

Mike

Results:

Michael

Mikey

Search:

Chris

Results:

Christopher

Christine

Christian

---

# Synonym Recognition

Recognize common relationship terms.

Examples:

Mom

Mother

Mama

Dad

Father

Pop

Grandma

Grandmother

Wife

Spouse

Husband

Partner

Business terms:

Client

Customer

Borrower

Investor

Lender

Agent

---

# Recent Searches

Remember recent searches.

Maximum:

10 items

Recent searches should disappear automatically over time.

Provide:

Clear Recent Searches

---

# Suggested Searches

When no text exists:

Display:

Recent People

Upcoming Birthdays

Recent Memories

Draft Cards

Frequently Viewed Relationships

Suggestions should feel personalized.

---

# Empty Search

No active query should not feel empty.

Instead show:

Recently Viewed

Suggested Relationships

Upcoming Events

Recent Cards

Recent Memories

---

# No Results

Headline

We couldn't find a match.

Supporting Copy

Try another name, relationship, or keyword.

Primary Action

Clear Search

Secondary Action

Browse Your People

Never simply display:

No Results

---

# Highlighting Results

Matched text should be highlighted.

Only highlight matching characters.

Avoid overwhelming color usage.

---

# Search Result Layout

Each result should include:

Primary title

Supporting information

Context

Optional avatar

Optional relationship badge

Example:

```

John Smith

Brother

Birthday in 5 days

```

---

# Search Categories

Search should support:

People

Events

Cards

Memories

Timeline

Business

Settings

Help

Each category should have a recognizable icon.

---

# Search Shortcuts

Desktop shortcut

Ctrl K

Mac

Command K

Opening search should immediately focus the input.

---

# Keyboard Navigation

Support:

Arrow keys

Enter

Escape

Tab

Shift Tab

Search should be fully usable without a mouse.

---

# Mobile Search

Search input remains pinned at the top.

Keyboard should never cover results.

Recent searches remain visible until typing begins.

Filters should appear as horizontal chips.

---

# Voice Search

Future capability.

Voice search should understand:

people

relationships

occasions

companies

Example:

"Show me Mom."

"Birthday cards."

"People with birthdays this month."

---

# Search Filters

Filters should reduce result sets without overwhelming users.

Filters should always be optional.

---

# Filter Philosophy

Good filters help users.

Too many filters create work.

Only expose filters that provide meaningful value.

---

# Filter Layout

Desktop

Horizontal filter bar.

Mobile

Scrollable filter chips.

Advanced filters inside bottom sheet.

---

# Common Filters

Relationship

Occasion

Birthday Month

Card Status

Business

Personal

Autopilot

Relationship Health

Brownie Points

Tags

Last Updated

---

# Relationship Filters

Examples:

Family

Friends

Coworkers

Clients

Neighbors

Mentors

Teachers

Pets

Other

---

# Occasion Filters

Birthday

Anniversary

Thank You

Congratulations

Sympathy

Holiday

Wedding

Graduation

Just Because

Business

---

# Card Status Filters

Draft

Scheduled

Ordered

Sent

Delivered

Archived

---

# Timeline Filters

Memories

Cards

Updates

Questions

Achievements

Relationship Notes

---

# Business Filters

Clients

Investors

Borrowers

Agents

Attorneys

Vendors

Partners

Inactive Contacts

---

# Relationship Health Filters

Needs Attention

Growing

Strong

Excellent

Health should never be shown as failure.

Avoid negative labels.

---

# Brownie Points Filters

Highest Points

Recently Earned

Needs Opportunities

Milestones

---

# Date Filters

Today

This Week

This Month

Next 30 Days

This Year

Custom Range

---

# Sort Options

Default

Most Relevant

Additional options:

Recently Updated

Alphabetical

Upcoming

Most Active

Recently Added

Health

Newest Memories

Oldest Memories

Default should always prioritize relevance.

---

# Multi Select Filters

Allow multiple selections.

Example:

Birthday

Anniversary

Holiday

All selected together.

Clearly indicate active filters.

---

# Active Filter Display

Every active filter should appear as a removable chip.

Example:

Family

Birthday

This Month

Each chip includes:

Remove icon

---

# Clear Filters

Always provide:

Clear All

Users should never remove filters one by one unnecessarily.

---

# Saved Views

Future capability.

Allow users to save filter combinations.

Examples:

Upcoming Birthdays

Important Clients

Needs Attention

Holiday Cards

---

# Smart Recommendations

Search should suggest likely destinations.

Examples:

Typing:

Mom

Suggestions:

Birthday

Recent Memory

Draft Card

Timeline

Upcoming Event

The system should anticipate intent.

---

# Contextual Search

Search should adapt to where the user is.

Example:

Inside Recipient screen

Prioritize:

Timeline

Memories

Cards

Inside Business

Prioritize:

Clients

Companies

Transactions

---

# Progressive Disclosure

Most users need only simple search.

Advanced filters should remain hidden until requested.

Do not overwhelm new users.

---

# Loading States

While searching:

Display skeleton results.

Avoid flashing empty layouts.

Maintain layout stability.

---

# Offline Search

When offline:

Search previously cached content.

Clearly indicate:

Results may not include recent updates.

---

# Accessibility Requirements

Search must satisfy WCAG AA.

Requirements:

* visible search label

* keyboard accessible suggestions

* screen reader announcement of result count

* logical focus order

* autocomplete announced correctly

* sufficient color contrast

* touch friendly filter chips

* search icon with accessible label

* clear button accessible by keyboard

* no reliance on color alone

---

# Motion Guidelines

Search interactions should feel smooth.

Use:

gentle fade

soft expansion

subtle highlight

quick transitions

Avoid:

jumping layouts

large animations

result flashing

aggressive movement

Search should always feel immediate.

---

# Performance Expectations

Search should appear instant.

Goals:

Input latency

Less than 50 milliseconds

Result updates

Less than 150 milliseconds

Animation duration

150 to 250 milliseconds

Filtering should occur without visible page reloads.

---

# Copy Guidelines

Search placeholders should feel conversational.

Examples:

Search your people

Find a memory

Search cards

Search relationships

Avoid:

Search...

Enter keywords

Type to search database

Buttons:

Clear

Browse Everyone

View All

Apply Filters

Reset Filters

---

# Anti Patterns

Never require exact spelling.

Never hide search behind multiple menus.

Never clear search unexpectedly.

Never lose filters during navigation.

Never force users into advanced search.

Never show blank result pages.

Never prioritize technical data over people.

Never make users search for information already visible.

Never overload the interface with dozens of filters.

Never sort alphabetically by default if relevance is better.

---

# Review Checklist

Every search experience should answer:

□ Does search prioritize people over records?

□ Are results fast?

□ Does fuzzy matching work?

□ Are recent searches remembered?

□ Are suggested searches helpful?

□ Are filters simple and meaningful?

□ Are active filters clearly visible?

□ Can search be completed entirely with a keyboard?

□ Does mobile search feel effortless?

□ Are empty and no result states reassuring?

□ Does the experience meet accessibility requirements?

□ Does the search feel worthy of a premium Relationship Concierge?

If every answer is yes, the search experience meets the F.I. Forgot standard.