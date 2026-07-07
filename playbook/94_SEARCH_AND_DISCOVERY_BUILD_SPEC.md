# 94_SEARCH_AND_DISCOVERY_BUILD_[SPEC.md](http://SPEC.md)

# Search and Discovery Build Specification

## Purpose

Search and discovery in F.I. Forgot must feel like asking a world class Relationship Concierge where something is, what matters, or what should be done next.

Search is not a utility drawer.

Search is not a database lookup.

Search is not a generic filter bar.

Search is the fastest way for a user to find a person, memory, card, occasion, setting, reminder, recommendation, or next thoughtful action.

The purpose of this specification is to define the complete frontend and UX implementation for search and discovery across the redesigned F.I. Forgot experience.

This document governs all search related surfaces, including universal search, recipient search, memory search, card search, occasion search, notification search, settings search, autocomplete, suggestions, recent searches, saved searches, command palette behavior, filters, sorting, search result layouts, mobile behavior, keyboard shortcuts, loading states, empty states, accessibility, analytics, and performance expectations.

The implementation must preserve all existing backend systems, business logic, database schema, authentication, Stripe integration, Handwrytten integration, AI pipelines, API contracts, and existing functional behavior.

The frontend may introduce new UI structure, display logic, interaction patterns, client side grouping, client side ranking presentation, and concierge style language, but it must not require backend contract changes unless explicitly marked as future ready.

Search must help the user answer questions like:

“What do I need to handle?”

“Where is Mom’s birthday card?”

“What did I write last year?”

“Who have I not checked in with?”

“What memories do I have about Alex?”

“What cards are coming up?”

“Where do I change my plan?”

“What did I save about Dad’s health?”

“Who needs attention?”

Search must make the product feel intelligent, organized, calm, and deeply personal.

## Philosophy

Search in F.I. Forgot must be designed around care, not retrieval.

A normal app helps users find records.

A Relationship Concierge helps users rediscover context.

A normal search bar returns matching rows.

A Relationship Concierge understands that typing “mom surgery” might mean the user is trying to find a memory, check whether it was used in a card, update a relationship profile, or prepare a thoughtful message.

A normal app treats all results equally.

A Relationship Concierge knows that an upcoming birthday card, a spouse’s anniversary, an unresolved draft, or a recent memory from a close relationship may matter more than an old archived card.

Search must feel quiet, premium, emotionally aware, and helpful without feeling invasive.

Search must avoid making the user feel like they are managing a CRM.

The language must never feel technical.

Do not use labels like database, query, index, vector, semantic result, entity match, fuzzy match, or confidence score in user facing UI.

Internally, search may use those concepts.

Externally, search should speak like a calm assistant.

Examples of acceptable search language:

“Here’s what I found.”

“This looks related.”

“Most relevant.”

“Recently viewed.”

“Coming up soon.”

“Needs attention.”

“Used in a card.”

“Saved memory.”

“Relationship detail.”

“Card draft.”

“Setting.”

“Nothing matched that yet.”

“Try searching for a person, memory, occasion, or card.”

Search must prioritize user trust.

When AI assisted search is used, the product must avoid pretending to know more than it does.

When a result is inferred, related, or suggested, it must be visually distinct from exact matches.

Search must never expose hidden backend complexity.

Search must never overwhelm the user with too many categories at once.

Search must make the user feel that everything important is safely remembered and easy to find.

## Global Search Architecture

F.I. Forgot must have a global search system available across authenticated areas of the application.

Global search must serve as the primary discovery layer for:

Recipients

Relationships

Memories

Timeline moments

Upcoming cards

Draft cards

Sent cards

Occasions

Autopilot items

Notifications

Settings

Billing related settings

Account actions

Help oriented destinations

Admin searchable entities where admin permissions apply

Global search must be implemented as a frontend controlled experience that can consume existing API responses and organize results into a premium concierge interface.

The global search experience must consist of four layers:

1. Search entry points
2. Search input and interpretation
3. Search results presentation
4. Search action handling

Each layer must be implemented consistently across desktop, tablet, and mobile.

### Global Search Behavior

When a user opens global search, the interface must not feel empty.

Before typing, search must show useful discovery content.

The default search state must include:

Recent searches if available

Recently viewed recipients if available

Upcoming cards if available

Suggested searches

Common actions

Settings shortcuts

The default state must be useful even for a new user.

For a new user with no history, the default state must show guided suggestions such as:

“Find a person”

“Search memories”

“Find an upcoming card”

“Search settings”

“See important dates”

“Create a quick card”

Search must update results as the user types.

Search must support partial matches.

Search must support case insensitive matching.

Search must support common name variations when available from existing data.

Search must support searching by relationship labels such as mom, dad, spouse, wife, husband, son, daughter, friend, client, colleague, parent, sibling, grandparent, and partner when those labels exist in recipient data.

Search must support occasion terms such as birthday, anniversary, Mother’s Day, Father’s Day, Valentine’s Day, Christmas, Thanksgiving, thank you, sympathy, congratulations, just because, holiday, and missed occasion when those event types exist in the application.

Search must support memory related terms such as memory, note, moment, joke, trip, favorite, avoid, likes, hobby, health, work, family, milestone, and story when those values exist in saved relationship context.

Search must support card related terms such as draft, sent, mailed, approved, pending, handwritten, delivery, message, edit, and autopilot when those records exist.

Search must support setting terms such as billing, plan, subscription, password, email, notifications, reminders, autopilot, address, handwriting, payment, account, and profile.

### Search System Boundaries

Search must not modify data by default.

Opening a result may navigate the user to a page.

Selecting a command may perform a clear action only when the command is explicitly labeled as an action.

Destructive actions must never be executed directly from search without confirmation.

Search may expose shortcuts to actions such as:

Create card

Add recipient

Log memory

Open billing

Open notification settings

Review draft

Resume onboarding

Search must not create, delete, send, approve, cancel, charge, unsubscribe, or archive anything without a dedicated confirmation flow.

Search must respect the user’s permissions.

A standard user must never see admin only results.

An admin user may see admin results only when using authenticated admin areas or when admin global search is enabled for their role.

Search must respect account boundaries.

No user may ever see another user’s recipients, memories, cards, notifications, events, subscription data, or settings.

Search must never expose hidden AI prompts, internal scoring, system notes, API keys, provider IDs, Stripe customer IDs, Handwrytten internal identifiers, or backend diagnostic data.

## Search Principles

### Principle 1: The Person Comes First

When a search term matches a recipient, relationship, card, memory, and occasion, the recipient result must usually appear first.

The product is relationship centered.

The search experience must reinforce that people are the main organizing unit.

Example:

Search term: “Mom”

Result priority:

Mom recipient profile

Mom’s upcoming birthday card

Recent memories about Mom

Past cards sent to Mom

Mom related settings or preferences

### Principle 2: Urgency Matters

Upcoming, unresolved, or time sensitive items must rank higher than older completed items.

A card due in three days must appear above a card sent two years ago.

A draft waiting for approval must appear above an archived memory.

A notification requiring attention must appear above a dismissed notification.

### Principle 3: Exact Matches Beat Smart Guesses

Exact title, name, occasion, and memory matches must appear above inferred or AI suggested results.

AI assisted results must help discovery, not override obvious matches.

### Principle 4: Search Should Reduce Anxiety

Search must never make users feel lost.

No results states must be helpful.

Loading states must be calm.

Result groupings must be clear.

The user should always know what they can do next.

### Principle 5: Search Is Also Navigation

Search must let users move quickly through the app.

A user should be able to open search, type “billing,” press Enter, and land in billing settings.

A user should be able to open search, type “dad,” press Enter, and land on Dad’s relationship profile if that is the top result.

### Principle 6: Search Is Also Memory

Search must help users rediscover saved relationship context.

The product becomes more valuable when users trust that meaningful details can be found later.

Search must make old memories feel accessible without making the interface feel archival or clinical.

### Principle 7: Search Must Be Quietly Intelligent

Search may suggest related results.

Search may understand natural language.

Search may group and prioritize.

But it must never overexplain itself.

The user does not need to see how the result was found unless clarification is needed.

### Principle 8: Search Must Be Fast

Search must feel instant.

Typing should never block the interface.

Skeletons should appear only when needed.

Cached local results should appear before slower remote results when safe and available.

### Principle 9: Search Must Be Accessible

Every search feature must work with keyboard navigation, screen readers, visible focus states, sufficient color contrast, and predictable interaction patterns.

### Principle 10: Search Must Be Consistent

Search behavior must feel consistent across dashboard, recipients, calendar, card creation, settings, notifications, and admin surfaces.

Local search may narrow scope, but visual patterns, empty states, keyboard behavior, and result cards must remain familiar.

## Search Entry Points

Search must be available from multiple entry points depending on screen context, device size, and user role.

### Primary Desktop Entry Point

On authenticated desktop layouts, global search must appear in the top navigation area.

It must be visually present but not dominant.

The search control must look like a premium command field.

Recommended desktop collapsed appearance:

Rounded pill container

Height: 44px

Minimum width: 280px

Maximum width: 420px

Background: warm white or soft cream surface

Border: 1px solid warm neutral border

Left icon: search icon

Placeholder: “Search people, memories, cards…”

Right hint: keyboard shortcut badge

Shortcut badge text:

“⌘K” on macOS

“Ctrl K” on Windows and non macOS systems

The placeholder must not say “Search database” or “Search records.”

The desktop top nav search field must open the full global search overlay when focused or clicked.

It must not perform inline page level filtering unless the user is already inside a local search surface.

### Primary Mobile Entry Point

On mobile, global search must be accessible through a search icon in the top app header or within the main menu.

The mobile search trigger must be easy to tap.

Minimum tap target: 44px by 44px.

When tapped, search must open as a full screen mobile search panel.

The input must autofocus when the panel opens, unless operating system behavior prevents autofocus.

The keyboard must not cover critical controls.

The close control must remain visible.

### Dashboard Entry Point

The dashboard must include a search entry point near the top of the page.

Recommended placement:

Below the main dashboard greeting and above the first major content section, or inside the dashboard header area if the header layout supports it.

Dashboard search placeholder:

“Search your people, memories, or cards…”

Dashboard search must open global search.

The dashboard must not introduce a separate search behavior that differs from global search.

### Recipients Page Entry Point

The recipients page must include a local recipient search field.

Placeholder:

“Search people…”

This local search narrows recipients only.

It may include filters for relationship type, attention status, upcoming occasion, and autopilot status.

A secondary link or icon inside local search may allow “Search everywhere” if the query appears broader than people.

### Relationship Profile Entry Point

Each relationship profile must include scoped search for that person’s memories, cards, timeline items, preferences, and upcoming occasions.

Placeholder:

“Search this relationship…”

This search must not search all recipients by default.

It must stay scoped to the active relationship unless the user explicitly chooses global search.

### Card Creation Entry Point

Card creation must expose search where context selection is needed.

Examples:

Search recipient

Search memories to include

Search previous cards

Search occasions

Search card style or tone if such frontend filters exist

The card creation search must always feel assistive.

It must not distract from the primary card creation flow.

### Calendar Entry Point

Calendar screens must include search for occasions, recipients, upcoming cards, and scheduled sends.

Placeholder:

“Search dates, people, or cards…”

Calendar search may be local by default but should include a route to global search.

### Notifications Entry Point

The notifications center must include search for notification titles, recipients, card names, event names, and statuses.

Placeholder:

“Search notifications…”

Notification search is local by default.

### Settings Entry Point

Settings must include a settings specific search field.

Placeholder:

“Search settings…”

Settings search must help users find configuration areas quickly.

Examples:

Billing

Plan

Email

Password

Notifications

Autopilot

Address

Handwriting preferences

Payment method

Account deletion

### Admin Entry Point

Admin search must exist only for admin users.

Admin search must be visually distinct from consumer global search when used in admin pages.

Admin search may include:

Users

Recipients

Cards

Orders

Handwrytten status

Stripe status

AI card assets

Notifications

Logs where currently exposed

Admin search must never appear to non admin users.

### Keyboard Entry Point

Global search must open with:

Command K on macOS

Control K on Windows and Linux

The keyboard shortcut must work from authenticated application screens unless focus is inside a text area, rich text editor, card message editor, or any input where Command K or Control K has a browser or editing expectation.

Escape must close search.

Enter must open the highlighted result.

Arrow Up and Arrow Down must move through results.

Tab must move through interactive controls predictably.

### Empty State Entry Point

Empty states across the product may include search entry points where helpful.

Examples:

No recipients yet:

“Search will become more useful once your people are added.”

No cards yet:

“Once cards are created, you’ll be able to find drafts, sent cards, and upcoming notes here.”

No memories yet:

“Saved memories will be searchable from each relationship profile.”

Empty states must not overpromise search capabilities before data exists.

## Universal Search Architecture

Universal search is the primary search experience across F.I. Forgot.

It must be designed as an overlay command center that combines search, discovery, navigation, and safe shortcuts.

### Universal Search Overlay

On desktop, universal search must open as a centered modal overlay.

The overlay must include:

Dimmed page backdrop

Search panel

Input row

Result content area

Footer hint area

The overlay must not feel like a browser alert or system dialog.

Recommended desktop dimensions:

Width: 720px

Maximum width: calc(100vw minus 48px)

Maximum height: calc(100vh minus 96px)

Border radius: 28px

Background: premium warm surface

Border: 1px solid subtle warm neutral

Box shadow: soft elevated shadow

Overflow: hidden

Backdrop:

Color: translucent warm charcoal or black

Opacity: enough to focus attention without feeling harsh

Backdrop blur may be used if already part of the design system

### Universal Search Mobile Layout

On mobile, universal search must open as a full screen panel.

Dimensions:

Width: 100vw

Height: 100dvh

Border radius: 0

The search input must sit at the top.

The close button must be visible.

Results must scroll vertically.

The footer shortcut area may be hidden on mobile.

Mobile search must respect safe areas.

Top padding must account for device status bar.

Bottom padding must account for home indicator.

### Universal Search Input Row

The input row must include:

Search icon

Input field

Clear button when query is present

Close button

Optional shortcut hint on desktop

Input height:

Desktop: 64px minimum

Mobile: 56px minimum

Input text size:

Desktop: 18px

Mobile: 16px to prevent iOS zoom

Placeholder:

“Search people, memories, cards, settings…”

The input must support:

Plain text

Names

Relationship labels

Occasions

Memory keywords

Card statuses

Settings terms

Natural language phrasing where AI assisted search is available

The input must trim leading and trailing spaces.

Multiple spaces must be treated as a single space for search matching.

Search must begin after the user types at least one non whitespace character.

For one character searches, results may be limited to exact and prefix matches.

For two or more characters, broader matching may begin.

### Universal Search Default State

Before the user types, universal search must show a concierge style discovery panel.

Default state sections must appear in this order when available:

1. Suggested next actions
2. Recently viewed
3. Recent searches
4. Coming up soon
5. Common destinations

If a section has no content, it must be omitted.

The default state must never show more than five sections.

The default state must never feel like a dashboard duplicate.

### Suggested Next Actions

Suggested next actions are action oriented shortcuts.

Examples:

Review upcoming cards

Add a person

Log a memory

Create a quick card

Open Autopilot

Review notifications

Complete relationship details

Suggested actions must be based on existing frontend state where available.

If no personalized actions are available, show general actions.

Each suggested action row must include:

Icon

Action label

Short helper text

Optional badge

Example:

Label: “Log a memory”

Helper: “Save something you may want to use in a future card.”

Action rows must be visibly different from search results.

They are commands, not content records.

### Recently Viewed

Recently viewed must show people, cards, or settings pages the user recently opened during current or prior sessions if the app already tracks this or can safely store it client side.

Recently viewed items must include:

Title

Type label

Optional subtitle

Icon or avatar

Examples:

“Mom”

Type: Person

Subtitle: “Birthday coming up in 12 days”

“Birthday draft for Dad”

Type: Card draft

Subtitle: “Needs review”

If recent viewed tracking does not exist, this section may be implemented client side using local storage.

Local storage must contain only non sensitive display metadata and route references.

Do not store full card messages, private memories, AI outputs, billing details, or notification contents in local storage.

### Recent Searches

Recent searches must show previous query strings.

Recent searches must be user specific.

If backend persistence exists, use it.

If backend persistence does not exist, client side local storage may be used.

Maximum stored recent searches: 10

Maximum displayed recent searches: 5

Each recent search row must include:

Search icon

Query text

Optional remove button

Clicking a recent search must populate the input and rerun the search.

The remove button must remove only that recent query.

There must be an option to clear all recent searches when recent searches exist.

Clear all recent searches must require only one click.

It is not destructive enough to require modal confirmation.

### Coming Up Soon

Coming up soon must show upcoming relationship occasions or cards.

Examples:

“Sarah’s birthday”

“Anniversary card for Emily”

“Mother’s Day cards”

Rows must include:

Occasion or card title

Date or relative timing

Recipient name when applicable

Status badge when applicable

Examples of timing language:

“Today”

“Tomorrow”

“In 5 days”

“July 18”

Avoid vague timing such as “soon” when a date is known.

### Common Destinations

Common destinations must include high value navigation shortcuts.

Examples:

Dashboard

Your People

Upcoming Cards

Calendar

Autopilot

Settings

Billing

Notifications

Common destinations must be limited to avoid clutter.

Maximum displayed common destinations: 6

### Universal Search Results State

After the user types, universal search must show grouped results.

Result groups must appear in a relevance based order.

Default group order:

Top result

People

Cards

Memories

Occasions

Notifications

Settings

Suggested actions

Related results

The group order may change based on query intent.

For example:

Query: “billing”

Settings should appear above people.

Query: “mom birthday”

People, upcoming cards, and occasions should appear above settings.

Query: “change password”

Settings should appear first.

Query: “log memory”

Suggested action should appear first.

### Top Result

When there is a clear best match, universal search must show a top result.

Top result must appear at the top of results.

Top result must include:

Label: “Top result”

Primary title

Type

Subtitle

Primary action

Visual emphasis

The top result must be the item opened when the user presses Enter without changing selection.

A top result must only appear when confidence is high.

High confidence examples:

Exact recipient name match

Exact settings destination match

Exact card title match

Exact occasion match with upcoming date

Exact command match

Do not show a top result when results are ambiguous.

### Result Row Anatomy

Every universal search result row must include:

Leading icon or avatar

Primary title

Type label

Secondary context

Optional status badge

Optional date

Optional right side affordance

Rows must be at least 56px tall on desktop.

Rows must be at least 64px tall on mobile.

Rows must have clear hover state on pointer devices.

Rows must have clear active focus state for keyboard navigation.

Rows must not rely on color alone to communicate status.

### Result Type Labels

Use human friendly type labels.

Allowed labels include:

Person

Memory

Timeline moment

Card draft

Sent card

Upcoming card

Occasion

Notification

Setting

Action

Admin

Avoid technical labels such as:

Recipient entity

Memory object

Timeline row

Card record

Route

Model output

Database item

### Universal Search Result Actions

Clicking a result must perform the most expected safe action.

Person result:

Open relationship profile.

Memory result:

Open relationship profile focused to the memory or timeline item if supported.

Card draft result:

Open draft review or card editor.

Sent card result:

Open sent card detail.

Upcoming card result:

Open upcoming card detail or review screen.

Occasion result:

Open occasion detail, calendar item, or related recipient profile.

Notification result:

Open notification target.

Setting result:

Open settings page and scroll to relevant section if supported.

Action result:

Start the action flow.

Admin result:

Open admin detail page if user has permission.

### Universal Search Footer

On desktop, the footer must show keyboard help.

Footer content:

“↑↓ Navigate”

“Enter Open”

“Esc Close”

Footer must be visually subtle.

Do not show keyboard hints on mobile unless a hardware keyboard is detected.

### Universal Search Close Behavior

Search must close when:

User presses Escape

User clicks close button

User clicks backdrop outside panel on desktop

User selects a result that navigates away

User performs a completed action that naturally exits search

Search must not close when:

User clicks inside panel

User clears query

User removes a recent search

User changes filters

User scrolls results

### Universal Search Query Persistence

When search closes, the query may be cleared by default.

If the user navigates back to search within the same session, the product may preserve the last query only if it feels helpful.

Preferred behavior:

Clear query after navigation.

Preserve query after accidental close only during same route and short time window.

Do not preserve highly sensitive searches longer than necessary.

### Universal Search Error Handling

If universal search fails to load remote results, the interface must still show any safe local results or navigation shortcuts.

Error message:

“Some results could not be loaded.”

Helper text:

“You can still use the shortcuts below.”

Provide a retry button.

Do not expose API errors, stack traces, status codes, or provider messages to users.

### Universal Search Partial Results

When some categories load and others fail, show available results.

Add a subtle inline message near the affected group:

“Couldn’t load card results.”

Provide retry only if useful.

Do not block all results because one category fails.

### Universal Search Data Sources

Universal search may draw from:

Authenticated user profile

Recipients

Relationship profiles

Memories

Timeline items

Cards

Occasions

Calendar events

Notifications

Settings routes

Billing routes

Autopilot configuration

Admin data when permissioned

Client side recent searches

Client side recently viewed

The frontend must not assume unavailable data exists.

When a source is not available, omit the section gracefully.

### Universal Search Minimum Viable Implementation

The first implementation of universal search must support at minimum:

People

Cards

Memories where accessible

Occasions where accessible

Settings

Recent searches

Suggested actions

Keyboard shortcut opening

Keyboard navigation

Empty state

Loading state

Mobile full screen layout

The design must be built so additional result types can be added without redesigning the experience.

### Universal Search Future Ready Capabilities

The frontend architecture must be ready for future support of:

Voice search

Semantic memory search

AI summarized result clusters

Saved searches

Cross relationship insights

Suggested thoughtful actions

Relationship health discovery

Admin level operational search

These capabilities must not be faked.

Future ready means components, naming, layout, and state structure should not prevent later addition.



## Recipient Search

### Purpose

Recipient Search is the primary discovery experience for the people who matter most.

Unlike Universal Search, which searches the entire application, Recipient Search is optimized for quickly finding, understanding, and taking action on relationships.

The interface should make users feel like they are looking through the people they care about rather than searching a database.

Recipient Search should encourage thoughtful relationship management instead of simply locating records.

---

# Recipient Search Entry Points

Recipient Search is available from:

• Your People page

• Dashboard "View All People"

• Relationship selector during Card Creation

• Calendar recipient selector

• Autopilot recipient selector

• Notification recipient selector

• Relationship comparison tools

• Admin relationship management (admin only)

When launched from Your People, search is scoped to recipients only.

When launched elsewhere, search returns recipients first while remaining aware of the surrounding workflow.

---

# Recipient Search Input

Placeholder:

Search people...

Input height:

48px desktop

48px tablet

52px mobile

Leading icon:

Search

Trailing controls:

Clear button (when text exists)

Voice search placeholder icon (future)

Keyboard focus ring follows global design system.

---

# Supported Search Terms

Recipient Search must support matching by:

First name

Last name

Nickname

Preferred name

Full name

Relationship label

Family role

Business relationship

Company name

Spouse name

Child name

Email address

Phone number

Tags

Custom labels

Notes specifically designated as searchable

Examples:

Mom

Dad

Grandma

Emily

Sarah Johnson

Mike

Dentist

Accountant

Best Friend

Neighbor

College Roommate

John from work

Wedding Party

Fantasy Football

Soccer Coach

---

# Partial Matching

Recipient Search must support:

Beginning matches

Middle matches

End matches

Substring matches

Common spacing differences

Capitalization differences

Examples:

Search:

Chris

Matches:

Christopher

Chris

Christine

Search:

Matt

Matches:

Matthew

Matt

Matteo

Search:

Jen

Matches:

Jennifer

Jenny

Jen

---

# Nickname Recognition

When available from stored relationship data, search should recognize common nickname mappings.

Examples:

Bob

Robert

Rob

Robbie

Bobby

Bill

William

Will

Billy

Liz

Elizabeth

Beth

Katie

Katherine

Kate

Kathy

Jim

James

Jimmy

Jimmy should still return James.

Nickname recognition should never replace exact matches.

---

# Relationship Type Matching

Users frequently remember the relationship before the name.

Searching:

Mom

Should immediately surface recipients marked:

Mother

Mom

Stepmom

Mother in law

Searching:

Brother

Should return:

Brother

Stepbrother

Brother in law

Searching:

Boss

Returns all recipients labeled as boss.

Relationship labels should always be indexed.

---

# Household Search

Users may remember households instead of individuals.

Examples:

Smith Family

Johnson Family

Massaro Family

If household grouping exists, Recipient Search should support matching household names.

---

# Organization Search

Recipients connected to organizations should support searching by:

Employer

Company

School

Church

Sports Team

Volunteer Organization

Examples:

Google

Microsoft

West Islip School District

Little League

Rotary Club

---

# Search by Important Dates

Recipient Search should recognize:

Birthday

Anniversary

Graduation

Wedding

Retirement

Baby Shower

Examples:

Typing:

Birthday

Shows recipients with birthdays.

Typing:

Anniversary

Shows anniversary relationships.

Typing:

Christmas

Shows recipients eligible for Christmas cards.

---

# Search by Attention Status

Recipient Search should support concierge states.

Examples:

Needs Attention

Recently Contacted

Never Sent Card

Upcoming Card

Autopilot Enabled

Autopilot Disabled

Missing Memories

Incomplete Profile

High Priority

Low Relationship Health

These states are visual categories, not backend status codes.

---

# Recipient Result Layout

Each recipient result contains:

Avatar

Name

Relationship label

Relationship Health indicator

Upcoming occasion (if applicable)

Last interaction

Quick action menu

Chevron

Height:

72px desktop

80px mobile

---

# Recipient Cards

Every recipient row includes:

Avatar

Primary Name

Secondary relationship label

One concierge insight

Examples:

Birthday in 12 days

Needs more memories

Last card sent 4 months ago

Autopilot managing birthdays

No upcoming occasions

Relationship Health improving

The concierge insight should never overwhelm the row.

---

# Recipient Badges

Badges include:

Upcoming Birthday

Upcoming Anniversary

Draft Waiting

Needs Review

Autopilot

Recently Updated

Favorite

VIP

Badges use subtle colors.

Never use aggressive warning colors unless immediate attention is required.

---

# Quick Actions

Hovering desktop rows reveals:

Open Profile

Create Card

Log Memory

View Timeline

More Actions

Mobile exposes these through overflow menu.

---

# Empty Recipient Search

When no recipients exist:

Illustration

Headline:

Your people will appear here.

Supporting copy:

Once you add people, you'll be able to find them instantly.

Primary CTA:

Add Your First Person

---

# No Recipient Results

Headline:

No people matched your search.

Supporting text:

Try another name, relationship, or keyword.

Suggestions:

Search by relationship

Search by birthday

Search all memories

Clear Search

---

# Recipient Search Performance

Typing should update visible results within:

100 milliseconds when searching cached recipients.

No visible blocking.

No page refresh.

No loading spinner for local filtering.

---

# Recipient Search Sorting

Default ranking:

Exact Name

Nickname

Relationship Match

Recently Viewed

Upcoming Occasion

Relationship Health Priority

Alphabetical

Users may manually sort by:

First Name

Last Name

Recently Added

Upcoming Birthday

Recently Contacted

Relationship Health

Autopilot Status

Favorites

---

# Memory Search

## Purpose

Memory Search allows users to rediscover meaningful information they've saved about people.

The goal is not document retrieval.

The goal is helping someone remember what matters before reaching out or writing a card.

Memory Search should feel like opening a trusted memory journal.

---

# Search Scope

Memory Search includes:

Saved Memories

Timeline Moments

Conversation Notes

Favorite Memories

Relationship Facts

Life Updates

Preferences

Things To Avoid

Inside Jokes

Favorite Foods

Favorite Activities

Important Family Members

Milestones

Achievements

Current Challenges

Current Excitement

Health Notes

Career Notes

Travel Notes

Personality Notes

Relationship AI summaries where supported.

---

# Memory Search Input

Placeholder:

Search memories...

Autocomplete begins after two characters.

Memory Search should tolerate conversational language.

---

# Memory Matching

Search should match:

Memory title

Memory body

Structured fields

AI generated memory summaries

Tags

Categories

Dates

Recipient

Occasion

Examples:

Beach vacation

Cancer treatment

Promotion

New puppy

College graduation

Disney

Fishing

Camping

Broken arm

Favorite restaurant

Anniversary trip

---

# Context Matching

Searching:

Vacation

Returns:

Trips

Cruises

Beach weekends

Road trips

Family vacations

Searching:

Dog

Returns:

Puppy

Golden Retriever

Pet adoption

Dog names

Searching:

Work

Returns:

Promotion

Retirement

New Job

Business Launch

---

# Memory Result Card

Each result contains:

Memory preview

Recipient

Date

Memory category

Matching highlight

Quick actions

Maximum preview:

Two lines

Ellipsis after overflow.

---

# Highlighting

Matching words receive subtle highlight.

Only matched words highlight.

Entire paragraphs never become highlighted.

---

# Memory Categories

Results display category chips.

Examples:

Memory

Favorite

Milestone

Family

Health

Work

Travel

Personality

Achievement

Preference

Life Update

---

# Memory Quick Actions

Open Memory

Open Recipient

Use In Card

Edit Memory

Copy Text (future)

---

# Related Memories

Below high confidence matches, show:

Related Memories

These are AI assisted suggestions.

Section title:

Related Memories

Subtitle:

You may also find these helpful.

These should remain visually separate from exact matches.

---

# Empty Memory Search

Illustration

Headline:

No memories found.

Supporting copy:

Try another keyword or save more moments about the people who matter most.

CTA:

Log a Memory

---

# Timeline Search

## Purpose

Timeline Search helps users navigate the history of a relationship chronologically.

It is optimized for remembering moments over time.

---

# Timeline Search Scope

Timeline Search indexes:

Logged Memories

Cards Sent

Cards Drafted

Relationship Updates

Milestones

Follow Up Questions

AI Generated Briefings

Autopilot Activity

Upcoming Events

Completed Events

---

# Timeline Search Input

Placeholder:

Search this timeline...

Timeline Search is scoped to the currently viewed relationship unless launched globally.

---

# Timeline Filters

Users can filter by:

Cards

Memories

Life Events

Achievements

Travel

Health

Family

Career

AI Briefings

Autopilot

All Activity

Filters are horizontally scrollable on mobile.

---

# Timeline Search Results

Results appear chronologically.

Each item includes:

Date

Icon

Title

Preview

Matching highlight

Quick action

---

# Timeline Date Navigation

Users may search by:

Year

Month

Specific Date

Examples:

2023

Last Summer

Christmas 2024

June

May 2025

Birthday

Anniversary

Natural language support is expanded later in the AI Assisted Search section.

---

# Timeline Empty State

Headline:

Nothing matched this timeline.

Supporting copy:

Try another keyword or remove filters.

Primary CTA:

View Full Timeline

Secondary CTA:

Clear Filters

---

# Timeline Performance

Filtering should occur instantly for loaded timeline data.

Loading additional pages should happen in the background without interrupting scrolling.

Search state must remain preserved while additional timeline entries load.

## Card Search

### Purpose

Card Search helps users quickly locate every card they have created, drafted, scheduled, sent, or received status updates for.

Unlike Recipient Search, which is centered around people, Card Search is centered around communication.

The user should always be able to answer questions such as:

Where is the birthday card I started?

Did I already send one to Dad?

Which cards are waiting for approval?

What did I write last Christmas?

Which sympathy card used that memory?

Card Search should feel like browsing a thoughtfully organized correspondence archive rather than a list of transactions.

---

# Card Search Scope

Card Search indexes all card related objects available to the user.

This includes:

Draft Cards

Scheduled Cards

Cards Awaiting Review

Cards Awaiting Approval

Cards Being Generated

Cards Being Handwritten

Cards In Production

Cards Shipped

Cards Delivered

Completed Cards

Archived Cards

Cancelled Cards

Failed Cards

Cards created by Autopilot

Cards created manually

Cards generated with AI assistance

Cards created from Quick Card

Cards created from Timeline actions

Cards created from Recipient Profile

Cards created from Dashboard shortcuts

---

# Card Search Entry Points

Card Search is available from:

Cards page

Dashboard

Universal Search

Recipient Profile

Calendar

Autopilot

Notification links

Admin card management

---

# Card Search Input

Placeholder:

Search cards...

The search field follows the global search design system.

Typing immediately begins filtering.

Search never requires pressing Enter.

---

# Supported Search Terms

Users may search by:

Recipient name

Occasion

Card title

Message content

Saved draft title

Delivery status

Mailing status

Creation date

Send date

Scheduled date

Holiday

Relationship

Card style

AI generated summary

Handwritten status

Examples:

Dad

Birthday

Christmas

Wedding

Sympathy

Funny

Heartfelt

Graduation

Anniversary

Pending

Delivered

Draft

---

# Message Content Search

Card Search supports searching inside card messages.

Example:

Search:

Fishing trip

Returns:

Birthday card mentioning last year's fishing trip.

Search:

College

Returns:

Graduation card referencing college memories.

Search:

Italy

Returns cards mentioning Italy vacations.

Matching terms should be highlighted inside previews.

---

# Card Status Search

Supported statuses:

Draft

Needs Review

Needs Approval

Scheduled

Queued

Generating

Writing

Printing

Shipped

Delivered

Completed

Cancelled

Failed

Searching one of these terms immediately filters to matching cards.

---

# Occasion Search Within Cards

Searching:

Birthday

Returns birthday cards.

Searching:

Christmas

Returns Christmas cards.

Searching:

Mother's Day

Returns Mother's Day cards.

Searching:

Father's Day

Returns Father's Day cards.

Searching:

Just Because

Returns all Just Because cards.

---

# Recipient Search Within Cards

Searching a person's name returns every card associated with that recipient.

Cards should be grouped by:

Upcoming

Drafts

Sent

Older History

---

# Card Result Layout

Each result contains:

Recipient avatar

Recipient name

Occasion

Status badge

Scheduled or sent date

Message preview

Quick actions

Maximum row height:

88px desktop

96px mobile

---

# Card Preview

Preview displays:

First two lines of message

Matching keyword highlights

Ellipsis after overflow

Never display the entire message inside search.

---

# Card Badges

Supported badges:

Draft

Upcoming

Autopilot

Needs Review

Scheduled

Handwritten

Delivered

Failed

Recently Updated

Priority

Badges follow global badge specifications.

---

# Card Quick Actions

Desktop hover actions:

Open Card

Continue Editing

Review Draft

Duplicate

View Recipient

Cancel Schedule (when allowed)

Mobile uses overflow menu.

---

# Card Filters

Filter chips include:

All

Drafts

Upcoming

Sent

Delivered

Cancelled

Autopilot

Manual

This Year

Last Year

Favorites

Unread Notifications

Filters remain sticky while scrolling.

---

# Card Sorting

Supported sort options:

Most Relevant

Recently Updated

Newest

Oldest

Upcoming Send Date

Recipient Name

Occasion

Status

Alphabetical

Default:

Most Relevant

---

# Card Empty State

Illustration

Headline:

No cards matched your search.

Supporting copy:

Try another keyword, recipient, or occasion.

Actions:

Clear Search

View All Cards

Create Card

---

# Card Loading

Local filtering:

Instant

Remote loading:

Skeleton rows

Never show blank white space while loading.

---

# Occasion Search

## Purpose

Occasion Search helps users discover every important event that may require thoughtful action.

Unlike Card Search, Occasion Search focuses on the event itself rather than the communication surrounding it.

Occasion Search should answer:

Whose birthday is next?

What anniversaries are coming up?

Who has Christmas cards scheduled?

Which events still need attention?

---

# Occasion Search Scope

Occasion Search indexes:

Birthdays

Anniversaries

Graduations

Weddings

Baby Showers

New Babies

Retirements

Housewarmings

Promotions

Sympathy Occasions

Thank You Opportunities

Congratulations

Valentine's Day

Mother's Day

Father's Day

Christmas

Thanksgiving

New Year

Just Because

Recurring custom occasions

One time occasions

Future scheduled occasions

Past occasions

---

# Occasion Search Entry Points

Calendar

Dashboard

Universal Search

Recipient Profile

Upcoming Cards

Notifications

Autopilot

---

# Occasion Search Input

Placeholder:

Search occasions...

Supports:

Recipient

Holiday

Event type

Month

Year

Natural language preparation

---

# Occasion Matching

Searching:

Birthday

Returns every birthday.

Searching:

July

Returns July occasions.

Searching:

Christmas

Returns Christmas events.

Searching:

Next Month

Returns next month's events when natural language support is available.

---

# Occasion Result Layout

Each row contains:

Occasion icon

Recipient

Occasion title

Date

Relative countdown

Card status

Chevron

Example:

🎂

Sarah

Birthday

July 28

In 26 Days

Draft Ready

---

# Occasion Status

Each occasion may display:

Card Not Started

Draft Ready

Needs Review

Scheduled

Autopilot

Completed

Missed

Status colors follow global status guidelines.

---

# Occasion Grouping

Default grouping:

Today

Tomorrow

This Week

Next Week

This Month

Later

Past

Groups collapse when empty.

---

# Occasion Filters

Supported filters:

Birthdays

Anniversaries

Holidays

Family

Friends

Business

Autopilot

Needs Attention

Completed

Missed

Custom

---

# Occasion Sorting

Users may sort by:

Date

Recipient

Relationship

Priority

Recently Updated

Alphabetical

Default:

Upcoming Date

---

# Occasion Empty State

Illustration

Headline:

No occasions matched your search.

Supporting copy:

Try another month, holiday, or recipient.

Primary CTA:

View Calendar

Secondary CTA:

Clear Filters

---

# Notification Search

## Purpose

Notification Search helps users quickly locate reminders, alerts, updates, and concierge recommendations without scrolling through a long notification history.

Notification Search should prioritize active items while still allowing users to locate historical notifications.

---

# Notification Search Scope

Notification Search indexes:

Unread notifications

Read notifications

Card reminders

Upcoming occasion reminders

Autopilot updates

Delivery updates

AI recommendations

Relationship reminders

Billing notifications

Account alerts

System announcements

Administrative notifications available to the user

---

# Notification Search Entry Points

Notification Center

Universal Search

Dashboard notification preview

Mobile notification panel

---

# Notification Search Input

Placeholder:

Search notifications...

Typing filters notifications immediately.

---

# Supported Search Terms

Recipient names

Occasion names

Notification titles

Reminder text

Card status

Delivery status

Autopilot

Billing

Subscription

Payment

Account

Security

Examples:

Birthday

Delivered

Mom

Autopilot

Payment

Reminder

---

# Notification Result Layout

Each result contains:

Notification icon

Title

Supporting text preview

Timestamp

Read or unread indicator

Priority badge when applicable

Navigation chevron

Unread notifications use stronger typography until opened.

---

# Notification Categories

Supported categories:

Cards

Occasions

Autopilot

Delivery

Billing

Account

Security

Recommendations

Announcements

Users may filter by category.

---

# Notification Sorting

Default:

Most Recent

Additional options:

Oldest

Unread First

Priority

Recipient

Occasion

---

# Notification Empty State

Headline:

No notifications matched your search.

Supporting copy:

Try another keyword or clear your filters.

Primary CTA:

View All Notifications

Secondary CTA:

Clear Search

---

# Settings Search

## Purpose

Settings Search enables users to immediately locate account preferences without navigating multiple sections.

The experience should feel similar to modern operating system settings search while remaining warm and approachable.

---

# Settings Search Scope

Settings Search indexes:

Profile

Account

Email

Password

Notifications

Autopilot

Billing

Subscription

Payment Methods

Shipping Address

Default Preferences

Privacy

Security

Accessibility

Appearance

Connected Services

Handwriting Preferences

AI Preferences

Help

Support

Legal

---

# Settings Search Entry Points

Settings Home

Universal Search

Command Palette

---

# Settings Search Input

Placeholder:

Search settings...

Results update as the user types.

---

# Supported Search Terms

Users may search using either feature names or everyday language.

Examples:

Password

Email

Dark Mode

Billing

Subscription

Credit Card

Notifications

Reminder

Privacy

Delete Account

Security

Appearance

Accessibility

Language

Address

Shipping

---

# Settings Result Layout

Each result contains:

Settings icon

Section title

Short description

Navigation chevron

Optional "Recently Updated" badge

Example:

🔒

Password

Change your password and account security settings.

>

---

# Settings Ranking

Highest priority:

Exact section name

Common synonyms

Frequently visited settings

Recently changed settings

Remaining settings alphabetically

---

# Settings Empty State

Headline:

No settings matched your search.

Supporting copy:

Try another keyword like password, billing, or notifications.

Primary CTA:

View All Settings

Secondary CTA:

Clear Search



## Command Palette

### Purpose

The Command Palette is the fastest way to navigate, perform common actions, and access concierge features without leaving the keyboard.

Unlike Universal Search, which is optimized for discovery, the Command Palette is optimized for execution.

Power users should be able to accomplish nearly every common task without reaching for the mouse.

The Command Palette should feel similar to premium developer tools and modern productivity applications while remaining approachable for non technical users.

It is not presented as a developer feature.

It is presented as a faster way to get things done.

---

# Philosophy

The Command Palette should reduce friction.

It should never overwhelm users with dozens of commands.

Only actions that are safe, useful, and frequently performed should appear.

The interface should encourage confidence.

Users should always understand what selecting a command will do before they execute it.

Commands should use natural language instead of technical terminology.

Good examples:

Create Birthday Card

Log a Memory

Open Calendar

Review Upcoming Cards

Open Notifications

View Sarah's Profile

Search Settings

Poor examples:

Execute Workflow

Launch Module

Navigate Route

Invoke Assistant

Open Recipient Entity

---

# Opening the Command Palette

Desktop shortcuts:

Command + K (macOS)

Control + K (Windows)

The Command Palette may share the same overlay infrastructure as Universal Search.

When no search text has been entered, the experience begins in Command Mode.

Once the user begins typing, matching commands and search results are blended together according to ranking rules.

---

# Opening From Mobile

Mobile users access the Command Palette through:

Search icon

Quick Actions button

Floating Action Button where applicable

The presentation is full screen.

Commands remain optimized for touch.

---

# Command Categories

Commands are organized into logical groups.

Groups include:

Create

Navigate

Recipients

Cards

Calendar

Memories

Notifications

Settings

Autopilot

Account

Admin (permission based)

Each group appears only when matching commands exist.

---

# Create Commands

Examples:

Create Card

Quick Card

Add Person

Log Memory

Create Occasion

Create Custom Reminder

Commands should include concise descriptions.

Example:

Create Card

Start a new handwritten greeting card.

---

# Navigation Commands

Examples:

Go to Dashboard

Open Calendar

View Your People

Open Notifications

Open Settings

Open Billing

Open Relationship Health

Open Timeline

Open Search

Navigation commands perform immediate navigation without additional confirmation.

---

# Recipient Commands

Examples:

Open Sarah Johnson

Open Dad

Create Card for Emily

Log Memory for Alex

View Mike's Timeline

Recipient commands are generated dynamically from existing relationships.

Frequently accessed recipients receive higher ranking.

---

# Card Commands

Examples:

Continue Draft

Review Draft

Duplicate Card

Open Last Birthday Card

Open Upcoming Cards

Resume Scheduled Card

When multiple matching drafts exist, the user selects from a list.

---

# Calendar Commands

Examples:

View This Month

Jump to Next Birthday

Open Upcoming Anniversaries

View Missed Occasions

Add Custom Occasion

---

# Memory Commands

Examples:

Log Memory

Search Memories

Open Favorite Memories

Recent Memories

Commands may navigate directly into scoped relationship memory views.

---

# Notification Commands

Examples:

View Notifications

Mark All Read

Review Card Alerts

Review Delivery Updates

Clear Completed Notifications

Commands that modify notification state require confirmation when affecting multiple items.

---

# Settings Commands

Examples:

Open Billing

Change Password

Notification Preferences

Manage Subscription

Shipping Address

Privacy Settings

Accessibility

Appearance

---

# Autopilot Commands

Examples:

Open Autopilot

Review Suggested Cards

Pause Autopilot

Resume Autopilot

Autopilot Settings

Review AI Suggestions

Commands affecting automation require confirmation.

---

# Account Commands

Examples:

My Profile

Billing History

Payment Methods

Subscription

Help Center

Contact Support

Sign Out

Sign Out requires confirmation only if unsaved work exists.

---

# Admin Commands

Visible only to authorized administrators.

Examples:

Search Users

Review Failed Orders

Open Card Library

Review AI Queue

Notification Dashboard

Order Status

Analytics Dashboard

Admin commands never appear for standard users.

---

# Command Layout

Each command row includes:

Leading icon

Command title

Short description

Optional keyboard shortcut

Chevron when navigation occurs

Rows are 56px minimum height.

Hovered rows receive subtle surface elevation.

Keyboard selection uses the global focus indicator.

---

# Command Ranking

Commands rank according to:

Exact command match

Frequently used commands

Recently used commands

Context relevance

Current page relevance

Permission availability

Commands unavailable in the current context should not appear.

---

# Recently Used Commands

The Command Palette remembers recently executed commands.

Maximum stored:

10

Displayed:

5

Examples:

Create Card

Open Calendar

Log Memory

Open Billing

Recent commands appear before suggested commands.

---

# Suggested Commands

Suggested commands are generated using current application context.

Examples:

Recipient has birthday tomorrow:

Create Birthday Card

Draft waiting:

Review Draft

Missing memories:

Log Memory

Relationship Health declining:

Review Relationship

Suggestions should feel timely without becoming distracting.

---

# Command Confirmation

Navigation commands execute immediately.

Actions affecting user data require confirmation when appropriate.

Examples requiring confirmation:

Delete Draft

Cancel Scheduled Card

Pause Autopilot

Delete Recipient

Confirmation dialogs follow the global modal specification.

---

# Search Indexing

## Purpose

Search indexing defines which information is eligible to appear within search results.

The indexing layer must provide fast, relevant, predictable results without exposing private implementation details.

Frontend components should remain independent of indexing implementation.

---

# Indexed Content

Universal Search indexes:

Recipients

Relationships

Cards

Memories

Timeline Events

Occasions

Notifications

Settings

Commands

Help Articles

Admin Resources when authorized

Future indexed sources should plug into the same architecture.

---

# Recipient Index Fields

Recipient index includes:

Name

Nickname

Relationship

Tags

Company

Household

Relationship Status

Upcoming Occasion

Custom Labels

Favorite Status

Recent Activity

---

# Memory Index Fields

Memory index includes:

Title

Body

Summary

Tags

Categories

Recipient

Occasion

Structured Metadata

Creation Date

Last Updated

---

# Card Index Fields

Card index includes:

Recipient

Occasion

Message

Status

Scheduled Date

Sent Date

Draft Title

AI Summary

---

# Occasion Index Fields

Occasion index includes:

Occasion Name

Recipient

Date

Category

Recurring Status

Card Status

Priority

---

# Notification Index Fields

Notification index includes:

Title

Body

Recipient

Category

Status

Date

Priority

---

# Settings Index Fields

Settings index includes:

Section Name

Description

Keywords

Common Synonyms

Help Text

---

# Command Index Fields

Commands index:

Title

Description

Keywords

Category

Permission Level

Shortcut

Current Availability

---

# Search Ranking

## Purpose

Search ranking determines the display order of results returned from indexed content.

Ranking should consistently surface the most useful result rather than the oldest or most recently created item.

---

# Ranking Priority

Results are ranked using multiple signals.

Highest priority:

Exact Match

Current Context

Urgency

Relationship Relevance

Recent Activity

Historical Usage

Alphabetical Tie Breaker

---

# Exact Match

Exact matches always appear before partial matches.

Searching:

Sarah

Returns:

Sarah

before

Sarah Johnson

before

Sarah's Birthday Card

---

# Context Awareness

Searching inside a relationship profile prioritizes results belonging to that relationship.

Searching inside Calendar prioritizes occasions.

Searching inside Cards prioritizes cards.

Global Search blends all categories.

---

# Urgency

Upcoming tasks receive elevated ranking.

Examples:

Birthday tomorrow

Draft awaiting review

Card scheduled today

Missed reminder

Urgent items should outrank older completed content.

---

# Relationship Relevance

Higher relationship importance may influence ordering.

Examples:

Spouse

Children

Parents

High priority recipients

Users may override this through manual sorting.

---

# Historical Usage

Frequently opened recipients and cards receive slight ranking preference.

Historical usage should never outweigh exact matches.

---

# Search Weighting

Weighting combines multiple ranking signals into a final relevance score.

Signals may include:

Exact keyword match

Phrase match

Prefix match

Partial match

Recent interaction

Upcoming occasion proximity

Relationship priority

Current page context

Frequently accessed content

Recent searches

Manual favorites

Weighting values are implementation details.

They should never be exposed in the user interface.

Users should simply experience results that feel intelligent and predictable.

Weighting must remain consistent across desktop and mobile.

Any future adjustments to weighting should preserve existing user expectations rather than dramatically changing search behavior.

## AI Assisted Search

### Purpose

AI Assisted Search extends traditional keyword search by helping users find information even when they cannot remember the exact words that were originally saved.

The objective is not to replace standard search.

The objective is to reduce the cognitive burden of remembering details.

Users should be able to search using thoughts, intentions, descriptions, or incomplete memories instead of exact phrases.

Examples:

"I think we went camping."

"What was her favorite restaurant?"

"When did Dad retire?"

"The vacation where Alex caught his first fish."

"That story about college."

AI Assisted Search should make the application feel like it genuinely remembers the user's relationships.

---

# Philosophy

AI Assisted Search should always support the user without creating uncertainty.

Users should understand when results are direct matches versus suggested matches.

Exact matches should always appear before AI assisted matches.

AI should increase recall, never reduce trust.

When AI cannot confidently infer intent, it should gracefully fall back to standard search behavior.

The system must never invent memories or fabricate relationship information.

---

# Activation

AI Assisted Search activates automatically when:

No exact results exist.

Few exact results exist.

Natural language is detected.

Conversational phrasing is detected.

Question based phrasing is detected.

Long descriptive searches are entered.

Examples:

What did I write to Mom last year?

Who likes fishing?

What memories mention Italy?

Where did Sarah travel?

---

# Search Flow

The preferred search flow is:

Exact Match

↓

Partial Match

↓

Semantic Match

↓

Related Suggestions

↓

Suggested Actions

Users should always see exact matches first.

---

# AI Assisted Result Section

AI generated matches appear beneath traditional results.

Section title:

Related Results

Supporting text:

These may also help.

This wording avoids overstating certainty.

---

# Confidence Levels

Confidence levels are internal implementation details.

Users should never see percentages or confidence scores.

Instead, results should be grouped visually.

Groups include:

Best Matches

Related Results

Suggested Searches

This maintains user confidence while avoiding unnecessary technical language.

---

# Semantic Understanding

AI Assisted Search should understand concepts rather than requiring exact wording.

Examples:

Search:

Promotion

Matches:

Got promoted

Started new role

Career milestone

New manager

Leadership position

Search:

Vacation

Matches:

Cruise

Beach trip

Disney

Italy

Camping

Weekend getaway

Search:

Dog

Matches:

Golden Retriever

Puppy

Pet adoption

Bella

Search:

Family

Matches:

Parents

Children

Grandparents

Sibling reunion

Family dinner

---

# Memory Understanding

AI Assisted Search should recognize descriptive memories.

Example:

Search:

The story about the broken arm

Possible matches:

Hospital visit

Emergency room

Cast removal

Baseball injury

Search:

The camping trip

Matches:

Adirondacks

Lake George

Tent weekend

National park

Search:

First Christmas together

Matches:

Holiday memories

Engagement year

Christmas card draft

Holiday photos

---

# Relationship Understanding

Queries may describe relationships instead of names.

Examples:

My oldest son

My boss

Neighbor

My daughter's teacher

Best friend

Wedding officiant

Where structured relationship information exists, AI should resolve these descriptions into recipient matches.

---

# Intent Recognition

AI Assisted Search attempts to understand user intent.

Examples:

"I need to send Mom a card."

Intent:

Open recipient

Suggest card

Show upcoming occasion

Search:

"I forgot what she likes."

Intent:

Search preferences

Favorite things

Memories

Personality notes

Search:

"What did I write last year?"

Intent:

Locate previous cards

---

# AI Suggestions

When appropriate, AI may suggest additional searches.

Examples:

Try searching birthdays.

View related memories.

Open Sarah's timeline.

Review previous anniversary cards.

Suggestions appear below search results.

Maximum displayed:

Three

---

# AI Search Safety

AI Assisted Search must never:

Invent memories.

Create fake relationships.

Generate nonexistent cards.

Infer facts unsupported by stored information.

Reveal hidden prompts.

Expose internal reasoning.

If information cannot be found, the system should say so clearly.

---

# Natural Language Search

## Purpose

Natural Language Search allows users to search using everyday language instead of keywords.

Users should feel comfortable asking questions naturally.

---

# Examples

Supported examples include:

Who has birthdays this month?

Show me cards waiting for review.

What did I send Dad for Christmas?

Who have I not contacted recently?

Show memories about camping.

Find anniversary cards.

Open billing settings.

Show my unread notifications.

Search should not require special syntax.

---

# Conversational Queries

Natural language should recognize:

Questions

Requests

Statements

Incomplete thoughts

Examples:

Mom birthday

Dad fishing

Need sympathy card

Where are my drafts?

Open notifications

Recent memories

---

# Time Recognition

Natural language should recognize common time expressions.

Examples:

Today

Tomorrow

This Week

Next Week

Next Month

Last Month

Last Year

This Summer

Last Christmas

This Birthday Season

Exact date parsing remains consistent with existing backend capabilities.

---

# Relationship Recognition

Search should understand references such as:

My wife

My husband

My daughter

My son

My parents

Grandma

My coworker

My client

When those relationships exist within recipient data.

---

# Action Recognition

Natural language should recognize user intent to perform actions.

Examples:

Create a birthday card.

Log a memory.

Add a new person.

Open settings.

Pause Autopilot.

Resume Autopilot.

Open calendar.

Action suggestions appear before standard navigation results.

Actions requiring confirmation continue to use existing confirmation flows.

---

# Question Recognition

Question based phrasing should be supported.

Examples:

Who has birthdays soon?

When is Sarah's anniversary?

Did I already send a card?

What memories mention Disney?

Where is my draft?

Search results should answer the user's question through relevant navigation rather than conversational responses.

---

# Ambiguous Queries

If a query could reasonably match multiple categories, results should be grouped.

Example:

Christmas

Groups:

Upcoming Occasions

Cards

Recipients

Memories

Suggestions

The interface should avoid forcing users into one interpretation.

---

# Recent Searches

## Purpose

Recent Searches reduce repetitive typing while helping users return to frequently accessed information.

Recent Searches are personal.

They should never be shared across users.

---

# Storage

Recent Searches may be stored:

Client side

Server side

Or both

The implementation should preserve privacy while improving convenience.

---

# Maximum History

Maximum stored:

20 searches

Default displayed:

8 searches

Older searches are automatically removed as newer searches are added.

---

# Display

Each recent search row includes:

Search icon

Query text

Optional timestamp

Remove button

Selecting a recent search immediately executes it.

---

# Ordering

Recent Searches display in reverse chronological order.

Most recent first.

---

# Removing Searches

Users may:

Remove one search.

Clear all searches.

Neither action requires confirmation.

---

# Expiration

Recent searches should automatically expire after a reasonable period of inactivity if stored locally.

Search history should never persist indefinitely on shared devices without explicit account based persistence.

---

# Saved Searches

## Purpose

Saved Searches allow users to preserve commonly used searches for one tap access.

Unlike Recent Searches, Saved Searches remain until intentionally removed.

---

# Examples

Upcoming Birthdays

Needs Attention

Draft Cards

Autopilot Reviews

Christmas Planning

Clients

Family

Incomplete Profiles

Delivered This Month

---

# Creating Saved Searches

Users may save a search using:

Save Search

Bookmark icon

Overflow menu

The saved name may default to the search query.

Users may rename saved searches.

---

# Saved Search Display

Saved Searches appear:

Search home

Search sidebar on desktop

Optional mobile section

Maximum pinned items:

Ten

---

# Managing Saved Searches

Users may:

Rename

Pin

Unpin

Delete

Reorder

Changes synchronize across authenticated sessions where supported.

---

# Search Suggestions

## Purpose

Search Suggestions reduce typing while encouraging discovery.

Suggestions should feel useful rather than promotional.

---

# Suggestion Sources

Suggestions may come from:

Recipient names

Occasions

Cards

Commands

Settings

Recent Searches

Saved Searches

Frequently accessed content

Upcoming events

---

# Suggestion Ranking

Suggestions prioritize:

Current query

Exact prefix

Recently accessed

Frequently selected

Upcoming relevance

Alphabetical tie breaker

---

# Suggestion Layout

Each suggestion row contains:

Icon

Suggested text

Category label

Optional shortcut indicator

Rows remain visually lighter than completed search results.

---

# Suggestion Limits

Maximum visible suggestions:

Desktop:

Eight

Mobile:

Six

Additional suggestions require scrolling.

---

# Empty Suggestions

When no suggestions exist:

Do not display an empty container.

Instead, transition directly to standard search behavior.

---

# Autocomplete

## Purpose

Autocomplete accelerates search by completing likely recipient names, commands, settings, and common search phrases.

Autocomplete should reduce typing without feeling intrusive.

---

# Behavior

Autocomplete begins after:

Two typed characters.

Suggested completion appears inline when confidence is high.

Users accept completion using:

Tab

Right Arrow

Touch selection

Typing continues to override the suggestion naturally.

---

# Autocomplete Sources

Recipient names

Relationship labels

Occasions

Commands

Settings

Recent Searches

Saved Searches

Frequently used searches

---

# Autocomplete Priorities

Priority order:

Exact continuation

Frequently selected

Recently selected

Upcoming relevance

Alphabetical

---

# Accessibility

Screen readers must announce autocomplete suggestions without interrupting active typing.

Users relying on assistive technology must be able to ignore suggestions easily.

---

# Privacy

Autocomplete should never expose hidden data belonging to another user.

Sensitive information should never appear unless the user already has permission to view it.

Autocomplete must respect all existing authorization rules.



## Search Filters

### Purpose

Search Filters allow users to quickly narrow large result sets without requiring additional searches.

Filters should feel lightweight and approachable.

Users should never feel like they are building database queries.

The interface should encourage discovery while remaining easy to understand.

Filters should be available only when they meaningfully improve results.

---

# Filter Design Principles

Filters should be:

Immediately understandable

Visually lightweight

Easy to clear

Persistent during the current search session

Accessible using keyboard and touch

Consistent across every search surface

Filters should never overwhelm the interface with dozens of options.

Progressive disclosure should be used for advanced capabilities.

---

# Filter Presentation

Primary filters appear as horizontal chips directly beneath the search field.

Example:

All

People

Cards

Memories

Timeline

Occasions

Notifications

Settings

Additional filters appear only after a category has been selected.

---

# Filter Chip Design

Chip height:

36px

Border radius:

Full pill

States:

Default

Hover

Focused

Selected

Disabled

Selected chips use the application's primary accent color.

Multiple chips may be selected where appropriate.

---

# Global Search Filters

Global Search supports:

All

People

Cards

Memories

Timeline

Occasions

Notifications

Settings

Commands

Only categories containing results remain enabled.

Empty categories appear disabled or are hidden.

---

# Recipient Filters

Recipient Search supports:

Family

Friends

Business

Favorites

VIP

Needs Attention

Upcoming Occasion

Autopilot

Recently Added

Recently Contacted

Incomplete Profile

Relationship Health

Users may combine multiple filters.

---

# Memory Filters

Memory Search supports:

Favorites

Milestones

Travel

Health

Family

Work

Personality

Preferences

Achievements

Life Updates

Inside Jokes

Things To Avoid

Recent

Older

---

# Timeline Filters

Timeline Search supports:

All Activity

Cards

Memories

Milestones

Autopilot

AI Briefings

Relationship Updates

Travel

Health

Career

Family

Users may select multiple categories simultaneously.

---

# Card Filters

Card Search supports:

Draft

Scheduled

Awaiting Review

Generating

Writing

Delivered

Completed

Cancelled

Autopilot

Manual

Holiday

Birthday

Anniversary

This Year

Last Year

---

# Occasion Filters

Occasion Search supports:

Birthdays

Anniversaries

Holidays

Business

Family

Friends

Recurring

One Time

Upcoming

Completed

Missed

Needs Attention

---

# Notification Filters

Notification Search supports:

Unread

Read

Cards

Occasions

Autopilot

Billing

Security

Announcements

Recommendations

Priority

---

# Settings Filters

Settings Search generally does not require extensive filtering.

Optional filters include:

Account

Billing

Privacy

Security

Accessibility

Notifications

Appearance

Connected Services

---

# Active Filters

Active filters appear above results.

Example:

People

Birthdays

Upcoming

Each active filter includes a remove button.

A single action clears all active filters.

---

# Filter Persistence

Filters remain active while:

Editing the search query

Scrolling results

Changing sort order

Navigating within the current search session

Filters reset when the search session ends unless intentionally saved.

---

# Advanced Filtering

## Purpose

Advanced Filtering allows users to build more precise searches without complicating the default experience.

Advanced Filtering remains hidden until explicitly opened.

Most users should never need it.

---

# Opening Advanced Filters

Desktop:

Filter button

Mobile:

Filter icon opening a bottom sheet

Opening advanced filters never replaces current results.

---

# Advanced Filter Sections

Sections include:

Date

Recipient

Relationship

Category

Status

Occasion

Autopilot

AI

Priority

Tags

Each section collapses independently.

---

# Date Filters

Supported options:

Today

Tomorrow

This Week

Next Week

This Month

Next Month

This Year

Custom Date Range

Date picker follows the global date component specification.

---

# Recipient Filters

Advanced recipient filtering supports:

Specific Person

Relationship Type

Household

Favorite

VIP

Relationship Health Range

Autopilot Enabled

Autopilot Disabled

---

# Memory Filters

Advanced memory filtering includes:

Category

Created Date

Updated Date

Favorite

Contains AI Summary

Contains Attachment

Contains Timeline Event

---

# Card Filters

Advanced card filters include:

Status

Occasion

Recipient

Delivery Status

Created Date

Scheduled Date

Sent Date

Autopilot

Manual

Draft Owner where applicable

---

# Occasion Filters

Advanced occasion filtering supports:

Holiday

Recurring

Custom

Family

Business

Upcoming

Past

Needs Card

Completed

---

# Notification Filters

Advanced notification filtering includes:

Read Status

Category

Priority

Date

Recipient

Requires Action

Completed

Dismissed

---

# Tag Filters

Where supported, users may filter using tags.

Multiple tags may be selected.

Matching behavior:

AND within selected tag groups where appropriate.

Implementation details remain backend dependent.

---

# Filter Summary

Above results display a concise summary.

Example:

Showing birthday cards for family members scheduled this month.

Summaries should always use natural language.

---

# Reset Filters

A Reset Filters action returns search to its default state.

Reset affects:

Advanced filters

Basic filters

Sorting

Not the active search query.

---

# Sorting

## Purpose

Sorting allows users to control result ordering when relevance is not the desired view.

Relevance remains the default.

Sorting should never override search matching.

---

# Default Sorting

Every search surface defaults to:

Most Relevant

This combines search ranking and weighting rules.

---

# Available Sort Options

Depending on content type, supported options include:

Most Relevant

Newest

Oldest

Alphabetical

Recently Updated

Recently Viewed

Upcoming Date

Recently Contacted

Priority

Relationship Health

Favorites

Status

---

# Sort Menu

Sorting appears as a dropdown on desktop.

On mobile, sorting opens a bottom sheet.

The currently selected sort option remains visible.

---

# Recipient Sorting

Available options:

Most Relevant

Alphabetical

Recently Added

Recently Viewed

Relationship Health

Upcoming Birthday

Recently Contacted

Favorites

---

# Memory Sorting

Available options:

Most Relevant

Newest

Oldest

Recently Updated

Favorites

Recipient

Category

---

# Timeline Sorting

Timeline defaults to chronological order.

Optional sorting:

Newest First

Oldest First

---

# Card Sorting

Available options:

Most Relevant

Upcoming Send Date

Newest

Oldest

Recipient

Occasion

Status

Recently Updated

---

# Occasion Sorting

Available options:

Upcoming Date

Most Relevant

Alphabetical

Recipient

Relationship

Priority

---

# Notification Sorting

Available options:

Most Recent

Oldest

Unread First

Priority

Recipient

Category

---

# Settings Sorting

Settings generally remain grouped logically rather than sorted.

Search relevance determines display order.

---

# Sort Persistence

Selected sort order remains active while:

Changing filters

Editing search text

Scrolling

Navigating within the same search session

Sort order resets when leaving search unless intentionally saved in user preferences.

---

# Search Results Layout

## Purpose

Search results should present information clearly while minimizing cognitive load.

Users should understand:

What each result represents.

Why it appeared.

What they can do next.

The layout should remain visually consistent across all search experiences.

---

# Result Grouping

Universal Search groups results by type.

Supported groups:

Top Result

People

Cards

Memories

Timeline

Occasions

Notifications

Settings

Commands

Related Results

Empty groups are omitted.

---

# Group Headers

Each group includes:

Title

Result count

Optional View All action

Example:

People

12 Results

View All

---

# Result Cards

Each result card follows a consistent structure.

Leading visual

Primary title

Secondary description

Context information

Optional badges

Optional quick actions

Chevron

Spacing remains consistent across all categories.

---

# Visual Hierarchy

Primary title:

Highest emphasis

Supporting information:

Medium emphasis

Metadata:

Lowest emphasis

Badges:

Compact and subtle

Users should immediately identify the primary subject.

---

# Highlighting

Matched search terms receive subtle highlighting.

Highlight color must meet accessibility contrast requirements.

Highlighting should never reduce readability.

---

# Quick Actions

Where appropriate, hovering or focusing a result reveals contextual actions.

Examples:

Open

Edit

Create Card

Log Memory

Continue Draft

View Timeline

Quick actions should never hide the primary navigation action.

---

# Infinite Scrolling

Search results may use infinite scrolling where datasets are large.

Additional content loads automatically near the bottom.

Loading additional results must preserve:

Search query

Filters

Sort order

Keyboard position when possible

---

# Pagination

If pagination is used instead of infinite scrolling, navigation controls must remain accessible and keyboard friendly.

Page transitions should preserve search state.

---

# Responsive Behavior

Desktop:

Multiple grouped sections visible simultaneously.

Tablet:

Reduced spacing with identical hierarchy.

Mobile:

Single vertical stream with collapsible groups where appropriate.

No functionality should be removed on mobile.

Only presentation changes.



## Empty States

### Purpose

Search empty states should reduce frustration and help users recover quickly.

An empty search should never feel like a dead end.

Instead of simply reporting that nothing was found, the interface should explain what happened and provide logical next steps.

Every empty state should encourage confidence that the information is still organized and accessible.

---

# Empty State Principles

Every empty state should:

Explain the situation clearly.

Avoid blaming the user.

Offer useful next actions.

Remain visually lightweight.

Use friendly, concierge style language.

Never expose technical search details.

Avoid phrases such as:

No database records found.

Zero results.

Search failed.

Query returned nothing.

Instead use conversational language.

---

# Default Empty Search

When the user opens Search before typing anything, this is not considered an error state.

Instead, display:

Suggested Searches

Recently Viewed

Recent Searches

Upcoming Occasions

Suggested Actions

This default state encourages discovery rather than waiting for user input.

---

# No Matching Results

Headline:

Nothing matched your search.

Supporting copy:

Try another keyword, search a person's name, or browse one of the suggestions below.

Suggested actions:

Clear Search

Search All Categories

View Your People

Browse Calendar

Open Cards

---

# Category Specific Empty States

People

Headline:

No people matched your search.

Supporting copy:

Try another name, relationship, or nickname.

CTA:

View All People

---

Cards

Headline:

No cards matched your search.

Supporting copy:

Try another occasion, recipient, or status.

CTA:

View All Cards

---

Memories

Headline:

No memories matched your search.

Supporting copy:

Try another keyword or save more moments for this relationship.

CTA:

Log a Memory

---

Timeline

Headline:

Nothing matched this timeline.

Supporting copy:

Try another date or remove filters.

CTA:

View Entire Timeline

---

Occasions

Headline:

No occasions matched your search.

Supporting copy:

Try another holiday, month, or recipient.

CTA:

Open Calendar

---

Notifications

Headline:

No notifications matched your search.

Supporting copy:

Try another keyword or clear your filters.

CTA:

View Notifications

---

Settings

Headline:

No settings matched your search.

Supporting copy:

Try searching for password, billing, notifications, or account.

CTA:

Open Settings Home

---

# Empty Filter Results

Sometimes the search query is correct but filters eliminate every result.

Example:

Birthday

+

Completed

+

This Week

No matches.

Display:

No results match your current filters.

Supporting copy:

Try removing one or more filters.

Actions:

Reset Filters

Clear Search

---

# First Time User Empty States

Users with very little data require educational empty states.

Examples:

No People Yet

Add the people who matter most, then you'll be able to find them instantly.

No Memories Yet

The memories you save today become tomorrow's perfect greeting cards.

No Cards Yet

Once you create your first card, you'll always be able to find it here.

---

# Illustration Guidelines

Empty states should include premium illustrations.

Illustrations should feel:

Warm

Optimistic

Minimal

Relationship focused

Avoid generic magnifying glass artwork whenever possible.

---

# Recovery Suggestions

When appropriate, suggestions may include:

Check spelling.

Search a nickname.

Search a relationship.

Browse upcoming occasions.

Clear filters.

Search everything.

Suggestions should remain concise.

Maximum displayed:

Four

---

## No Results Behavior

### Purpose

No Results behavior defines how the interface responds after search execution completes without relevant matches.

The goal is graceful recovery rather than interruption.

---

# Preserve User Input

The original search text always remains visible.

Never clear the user's search automatically.

Users should be free to edit rather than starting over.

---

# Preserve Filters

Selected filters remain active.

Users can clearly see why results may be limited.

---

# Offer Broader Search

When searching within a specific section, offer expansion.

Example:

Searching within Memories:

Search Everywhere

Searching within Cards:

Search All Categories

---

# AI Assisted Recovery

When AI Assisted Search is enabled, additional suggestions may appear.

Examples:

Did you mean:

Camping

instead of

Camp

Related searches:

Vacation

National Park

Fishing

Outdoor Trip

Suggestions should remain clearly labeled as recommendations.

---

# Similar Names

If an exact recipient cannot be found, nearby matches appear.

Example:

No results for:

Sara

Suggestions:

Sarah

Sierra

Sandra

Suggestions never replace exact matching logic.

---

# Typo Tolerance

Common typing mistakes should still return useful results.

Examples:

Birthdy

Birthday

Anniversry

Anniversary

Notifcation

Notification

Settings

Setings

Search should recover gracefully whenever confidence is high.

---

# Loading States

## Purpose

Loading states reassure users that search is actively processing.

The interface should feel immediate, even when backend responses require additional time.

---

# Loading Philosophy

Never show blank pages.

Never freeze the interface.

Always provide visual continuity.

Users should understand that results are arriving.

---

# Local Search

For cached searches:

Results update instantly.

No spinner.

No skeleton.

Only result transitions.

---

# Remote Search

When remote data is required:

Display skeleton rows.

Avoid blocking interaction.

Users may continue typing while loading.

New requests automatically replace older ones.

---

# Skeleton Layout

Skeletons mirror the final result layout.

Each skeleton row includes:

Avatar placeholder

Title placeholder

Subtitle placeholder

Badge placeholder

Chevron placeholder

Height matches final cards.

---

# Progressive Loading

When multiple result groups load independently:

Completed groups appear immediately.

Remaining groups continue loading.

Example:

People loaded.

Cards loading.

Memories loading.

Settings loaded.

Users should never wait for every section to complete before seeing results.

---

# Loading Indicator

A subtle loading indicator may appear inside the search field.

Avoid large centered spinners.

Loading should feel lightweight.

---

# Slow Network

After approximately two seconds:

Display:

Still searching...

Supporting copy:

This is taking a little longer than expected.

Do not interrupt typing.

---

# Loading Failure

If one category fails:

Display available categories.

Inline message:

Cards couldn't be loaded right now.

Retry button appears beside the affected group.

Entire search should not fail because one section encountered an error.

---

# Keyboard Shortcuts

## Purpose

Keyboard shortcuts allow experienced users to navigate the application rapidly while maintaining accessibility.

Shortcuts supplement the interface.

They never replace visible navigation.

---

# Global Shortcuts

Open Search

Command + K

Control + K

Close Search

Escape

Open Selected Result

Enter

Navigate Results

Arrow Up

Arrow Down

Move Between Sections

Tab

Reverse Navigation

Shift + Tab

Dismiss Dialog

Escape

---

# Search Field Shortcuts

Clear Search

Escape when search field is focused and empty.

Select Autocomplete

Tab

Move Cursor

Standard operating system behavior.

---

# Result Navigation

Arrow keys move through visible results.

Selection wraps only when explicitly configured.

The currently selected row receives a visible focus state.

---

# Quick Action Shortcuts

When quick actions are available, keyboard users may activate them using standard Tab navigation.

Hidden shortcuts should be avoided.

Discoverability remains important.

---

# Accessibility

Every shortcut must have an accessible alternative using pointer or touch interactions.

No essential functionality may depend solely on keyboard input.

---

# Mobile Search Behavior

## Purpose

Search on mobile should provide the same capabilities as desktop while respecting smaller screens and touch interactions.

No search functionality should be removed simply because the device is mobile.

---

# Search Presentation

Search opens as a full screen experience.

The search field remains fixed at the top.

Results scroll beneath.

The close button always remains visible.

---

# Mobile Search Field

Minimum height:

56px

Touch target:

44px minimum

Placeholder follows desktop wording.

Voice search icon reserved for future implementation.

---

# Mobile Filters

Primary filters appear as horizontally scrollable chips.

Advanced filters open in a bottom sheet.

Selected filters remain visible after closing the sheet.

---

# Mobile Results

Results display as full width cards.

Touch targets remain generous.

Quick actions appear within overflow menus.

Swipe gestures should never replace primary navigation.

---

# Mobile Keyboard

When the software keyboard opens:

Search field remains visible.

Results resize appropriately.

Important controls should never become inaccessible beneath the keyboard.

---

# Mobile Performance

Typing should remain responsive even during remote loading.

Scrolling should remain smooth while additional results load.

Animations should be subtle to preserve perceived performance.

---

# Mobile Gestures

Supported gestures:

Tap

Scroll

Pull to dismiss where platform appropriate

Swipe back using operating system conventions

Custom gestures should be minimized.

---

# State Preservation

If users temporarily leave Search and return during the same session:

Restore:

Search query

Filters

Scroll position when practical

Selected sort order

This behavior should make interruption feel seamless without preserving stale data indefinitely.



## Voice Search Readiness

### Purpose

Although voice search is not part of the initial release, the frontend architecture must be designed so it can be added without redesigning the search experience.

Voice should become another way to interact with the Relationship Concierge, not a separate feature.

The user should feel like they are speaking naturally to someone who knows the important people in their life.

Examples:

"Show me Dad's birthday."

"What did I write to Sarah last Christmas?"

"Find my anniversary cards."

"Open Mom's profile."

"Who needs a card this week?"

Voice should use the same search pipeline, ranking rules, AI assisted search, and result presentation as typed queries.

The only difference is the method of input.

---

# Future Voice Entry Points

Reserved voice entry points include:

Global Search

Universal Search

Command Palette

Dashboard

Recipient Profile

Mobile Search

The initial release should reserve visual space for future microphone controls where appropriate without displaying inactive buttons.

No disabled microphone buttons should appear in production.

---

# Voice Input Flow

Future voice interaction should follow this sequence:

User activates microphone

↓

Listening indicator appears

↓

Speech converted to text

↓

Text populates search field

↓

Standard search executes

↓

Results display normally

The search field should always contain the recognized text so users can edit it manually.

---

# Listening State

Future listening state should include:

Animated microphone

Subtle waveform

Listening label

Cancel button

Listening should never block access to the rest of the interface.

---

# Recognition Feedback

While speech is being recognized:

Display partial transcription when supported.

Users should see words appear naturally as they speak.

This improves confidence and allows immediate correction.

---

# Error Recovery

Potential future errors include:

Microphone unavailable

Permission denied

Speech not understood

Network unavailable

Recognition timed out

Each error should explain the issue in friendly language and provide an alternative.

Example:

We couldn't understand that.

Try speaking again or type your search instead.

---

# Accessibility

Voice interaction must always remain optional.

Every voice feature must have a keyboard and touch equivalent.

---

## Search Analytics

### Purpose

Search Analytics help improve discoverability, identify gaps, and understand how users navigate the product.

Analytics should improve the product without compromising user privacy.

Individual search history should never be exposed to employees or administrators unless explicitly permitted through existing privacy policies.

---

# Analytics Philosophy

Analytics exist to answer questions such as:

What are people trying to find?

Which searches fail most often?

Which suggestions are selected?

Which commands are used most frequently?

Which filters create confusion?

Analytics should never become user surveillance.

---

# Events

Recommended frontend events include:

Search Opened

Search Closed

Query Started

Query Changed

Search Submitted

Suggestion Selected

Autocomplete Accepted

Result Selected

Filter Applied

Filter Removed

Sort Changed

Command Executed

Search Cleared

Search Cancelled

No Results Displayed

Retry Triggered

Events should reuse the application's existing analytics infrastructure.

---

# Metrics

Useful aggregate metrics include:

Average search length

Average time to first result

Average time to selection

Result click through rate

No result percentage

Suggestion acceptance rate

Autocomplete acceptance rate

Most searched recipients

Most searched occasions

Most searched settings

Most searched commands

Filter usage

Sort usage

Recent search usage

Saved search usage

These metrics should be aggregated and anonymized where appropriate.

---

# Search Funnel

Analytics should make it possible to understand:

Search Opened

↓

Query Entered

↓

Results Displayed

↓

Result Selected

↓

Destination Opened

↓

Task Completed

Understanding drop off points will help improve future search behavior.

---

# Failed Searches

Searches producing no useful results should be tracked in aggregate.

Examples:

Repeated spelling mistakes

Common missing synonyms

Popular unsupported phrases

Frequently abandoned searches

This information should guide future indexing and AI improvements.

---

# Privacy

Analytics must never expose:

Card contents

Private memories

Sensitive relationship notes

Billing information

Authentication data

AI prompts

Personally identifiable search content beyond what is already permitted by the application's privacy model.

Sensitive text should not be logged unnecessarily.

---

## Search Performance

### Purpose

Search should feel immediate.

Performance is a user experience feature.

Users should trust that finding information takes almost no effort.

---

# Performance Targets

Preferred frontend targets:

Local filtering:

Less than 100 milliseconds.

Cached search:

Less than 150 milliseconds.

Visible remote response:

Target under 500 milliseconds.

Perceived responsiveness is more important than exact implementation.

---

# Progressive Results

Search should display available content as soon as possible.

Never wait for every category before rendering.

Example:

People available

↓

Show People

↓

Continue loading Cards

↓

Continue loading Memories

↓

Continue loading Settings

---

# Debouncing

Search requests should be intelligently debounced.

The debounce interval should remain short enough that typing feels immediate.

Rapid typing should not flood backend services with unnecessary requests.

---

# Request Cancellation

If users continue typing before results arrive:

Cancel outdated requests.

Only the newest query should update the interface.

Older responses should be safely discarded.

---

# Client Side Caching

Frequently accessed search data may be cached when appropriate.

Examples:

Recipients

Settings

Commands

Recent searches

Cached data should refresh automatically when underlying information changes.

---

# Lazy Loading

Large datasets should load progressively.

Search interfaces should remain interactive while additional results arrive.

---

# Rendering

Only visible search rows should be rendered when datasets become very large.

Virtualization may be used where appropriate without changing visual behavior.

---

# Animation Performance

Search animations should remain lightweight.

Transitions should never reduce typing responsiveness.

Animations should be interruptible by continued user interaction.

---

# Offline Behavior

When offline:

Previously cached search results remain available where possible.

Unavailable sections clearly indicate they require a connection.

Users should never mistake offline limitations for missing data.

---

## Accessibility

### Purpose

Every search experience must meet or exceed the accessibility standards defined throughout the playbook.

Search should be usable by everyone regardless of input method or ability.

Accessibility is a core product requirement, not an enhancement.

---

# Keyboard Accessibility

Every search interaction must support:

Tab

Shift + Tab

Arrow Keys

Enter

Escape

Visible keyboard focus

Keyboard users must be able to complete every search task without using a mouse.

---

# Screen Readers

Search components must expose meaningful labels.

Examples:

Search field

Search results

Result count

Selected result

Filter

Sort menu

Command

Suggestions

Screen readers should announce meaningful updates without becoming excessively verbose.

---

# Live Regions

Dynamic result updates should use appropriate live regions.

Announcements should include:

Number of results

Selected result changes

Loading completion

No results

Announcements should avoid repeating unchanged information.

---

# Focus Management

Opening Search moves focus into the search field.

Closing Search returns focus to the triggering control.

Opening filters moves focus into the filter panel.

Closing filters restores previous focus.

Users should never lose their position.

---

# Color Contrast

Search text, badges, highlights, placeholders, and focus indicators must satisfy accessibility contrast requirements defined in the global design system.

Color alone must never communicate meaning.

---

# Touch Accessibility

Touch targets:

Minimum 44px.

Interactive spacing should prevent accidental activation.

Scrollable filter chips should remain easy to use on small screens.

---

# Reduced Motion

Users requesting reduced motion should experience:

Minimal transitions

No unnecessary animations

Immediate state changes

Search functionality remains identical.

---

# Zoom Support

Search layouts must remain fully usable at:

200 percent browser zoom

Mobile accessibility scaling

Large system fonts

Content should reflow naturally without horizontal scrolling whenever practical.

---

## Security

### Purpose

Search must respect every authorization rule enforced throughout the application.

Users should never discover information through search that they could not access through normal navigation.

Search is not an exception to the application's security model.

---

# Authorization

Search results must always respect:

Authentication

Account ownership

Role permissions

Administrative permissions

Subscription access where applicable

Search should never bypass existing backend authorization.

---

# Sensitive Information

Search must never expose:

Passwords

Authentication tokens

API keys

Stripe identifiers

Handwrytten internal identifiers

Internal AI prompts

Private system logs

Administrative metadata

Infrastructure details

Sensitive information should remain completely excluded from indexing.

---

# Input Handling

Search input must be safely sanitized before processing.

Unexpected characters should never cause interface failures.

Malformed input should fail gracefully.

---

# Rate Limiting

Frontend behavior should support existing backend rate limiting mechanisms.

Repeated rapid searches should not create unnecessary server load.

---

# Session Expiration

If a session expires while Search is open:

Display the standard authentication flow.

Unsaved search text may be preserved until successful reauthentication where appropriate.

---

# Audit Support

Administrative search actions should integrate with existing audit logging infrastructure where applicable.

Standard user searches should not generate unnecessary audit records.

---

## Acceptance Criteria

The Search and Discovery experience is considered complete when:

Users can discover people, cards, memories, occasions, notifications, settings, and commands from a consistent search experience.

Universal Search behaves consistently across desktop, tablet, and mobile.

Search supports keyboard, mouse, touch, and assistive technologies.

Exact matches consistently appear before AI assisted suggestions.

Natural language queries produce useful, predictable results.

Filters and sorting behave consistently across all search surfaces.

Search state is preserved appropriately during active sessions.

Loading states, empty states, and error states follow the global design language.

Search performance meets established responsiveness goals.

Security and authorization rules are enforced for every searchable resource.

The architecture supports future additions such as voice search, expanded AI understanding, and additional searchable content types without requiring major frontend redesign.

---

# Definition of Done

This specification is complete when:

All search entry points are implemented.

Universal Search is fully functional.

Recipient, Memory, Timeline, Card, Occasion, Notification, and Settings search experiences are complete.

Command Palette is implemented.

AI Assisted Search integrates with existing AI capabilities without changing backend contracts.

Natural Language Search is supported where existing AI services allow.

Autocomplete, suggestions, recent searches, and saved searches function consistently.

Filtering and sorting follow this specification.

Search results layouts match the design system.

Empty states, loading states, and recovery flows are fully implemented.

Keyboard shortcuts work consistently.

Mobile behavior matches desktop functionality.

Accessibility requirements are verified.

Security requirements are verified.

Performance targets are achieved.

All behaviors are documented, tested, and approved before implementation is considered complete.





