# 42_COMPONENT_[LIBRARY.md](http://LIBRARY.md)

## Purpose

This document defines the reusable component library for the redesigned F.I. Forgot frontend.

Components are the building blocks of the premium Relationship Concierge experience.

They should not feel like generic software parts.

They should express the product philosophy through structure, hierarchy, copy, spacing, behavior, and emotional tone.

Every component should answer one question:

**What would a world class Relationship Concierge do here?**

---

## Component Philosophy

A component is not just a visual element.

A component is a repeated product behavior.

It teaches the user how F.I. Forgot works.

It creates consistency.

It reduces cognitive load.

It makes the product feel calm, trustworthy, and intentionally designed.

Components should be reusable without becoming emotionally generic.

When a component has product meaning, name it around that meaning.

Use:

```text
RelationshipCard
ConciergePrompt
UpcomingMomentCard
MemoryTimeline
CardDraftPreview
BusinessRelationshipCard

```

Avoid naming meaningful product components as:

```text
Box
Panel
Tile
Widget
Thing

```

Generic primitives are acceptable only when they truly represent visual structure rather than product meaning.

---

## Component Categories

The component library is organized into the following categories:

1. App Shell Components
2. Navigation Components
3. Layout Components
4. Relationship Components
5. Memory Components
6. Card Creation Components
7. Concierge Components
8. Notification Components
9. Search Components
10. Settings Components
11. Business Concierge Components
12. Form Components
13. Feedback Components
14. Loading Components
15. Empty State Components
16. Trust and Privacy Components
17. Billing Components
18. Admin Components

---

# App Shell Components

## AppShell

### Purpose

Provides the authenticated application frame.

### Used On

All signed in screens.

### Responsibilities

Persistent navigation.

Page structure.

Account access.

Notification access.

Search access.

Responsive shell behavior.

### Behavior

Should feel quiet and supportive.

Should never compete with page content.

Should preserve orientation across the product.

### Avoid

Overly dense chrome.

Unnecessary controls.

Admin dashboard feeling.

---

## PublicShell

### Purpose

Provides the frame for public marketing screens.

### Used On

Landing Page.

Pricing Page.

How It Works Page.

Trust and Privacy Page.

### Responsibilities

Public navigation.

Brand presentation.

Sign in and signup entry points.

Footer.

### Behavior

Should feel premium, warm, and emotionally clear.

### Avoid

Feature heavy navigation.

SaaS template feeling.

---

## AuthShell

### Purpose

Provides a calm frame for authentication screens.

### Used On

Sign Up.

Sign In.

Forgot Password.

Reset Password.

### Responsibilities

Brand presence.

Trust reassurance.

Focused authentication layout.

### Behavior

Should reduce anxiety and friction.

### Avoid

Overexplaining.

Distracting background content.

---

## PageHeader

### Purpose

Introduces a screen with clear context and action.

### Used On

Dashboard.

Your People.

Relationship Profile.

Settings.

Business Dashboard.

Search.

Notifications.

### Responsibilities

Page title.

Short description.

Primary action when appropriate.

Secondary context.

### Behavior

Should orient the user immediately.

### Avoid

Large generic headings with no emotional purpose.

Multiple competing calls to action.

---

## ContextualActionBar

### Purpose

Shows important actions relevant to the current screen or relationship.

### Used On

Relationship Profile.

Card Review.

Business Relationship Profile.

Memory Detail.

### Responsibilities

Primary action.

Secondary actions.

Status indicators.

### Behavior

Should make the next best action obvious.

### Avoid

Too many buttons.

Unclear action hierarchy.

---

# Navigation Components

## PrimaryNavigation

### Purpose

Provides main app navigation.

### Used On

Authenticated app.

### Responsibilities

Dashboard.

Your People.

Create Card.

Concierge.

Search.

Settings.

Business if enabled.

### Behavior

Should be stable, simple, and relationship first.

### Avoid

Feature clutter.

Changing order between screens.

---

## MobileNavigation

### Purpose

Provides mobile friendly navigation.

### Used On

Small screens.

### Responsibilities

Core destinations.

Current location.

Quick access to primary action.

### Behavior

Should support one handed use.

Should prioritize the most frequent meaningful actions.

### Avoid

Too many tabs.

Nested mobile complexity.

---

## BreadcrumbTrail

### Purpose

Shows location when deeper navigation needs context.

### Used On

Relationship Profile subviews.

Card Detail.

Business Relationship Profile subviews.

Admin screens.

### Responsibilities

Parent screen access.

Current location.

### Behavior

Should be subtle and helpful.

### Avoid

Using breadcrumbs on simple flows where they add clutter.

---

## SearchEntryPoint

### Purpose

Provides quick access to search.

### Used On

AppShell.

Dashboard.

Your People.

Business Relationships.

### Responsibilities

Search trigger.

Optional preview or placeholder.

### Behavior

Should feel like asking the Concierge to find something.

### Avoid

Technical search language.

---

## NotificationBell

### Purpose

Provides access to meaningful notifications.

### Used On

AppShell.

Dashboard.

### Responsibilities

Unread state.

Notification center access.

Urgency indication only when appropriate.

### Behavior

Should earn attention without creating anxiety.

### Avoid

Aggressive badges.

Excessive red alerts.

---

# Layout Components

## ContentContainer

### Purpose

Provides consistent page width and spacing.

### Used On

Most screens.

### Responsibilities

Readable layout.

Responsive spacing.

Visual calm.

### Behavior

Should create premium breathing room.

### Avoid

Edge to edge density unless the screen requires it.

---

## SectionBlock

### Purpose

Groups related content inside a screen.

### Used On

All core app screens.

### Responsibilities

Section title.

Optional description.

Actions.

Contained content.

### Behavior

Should help users understand page structure quickly.

### Avoid

Overusing borders.

Making every section visually heavy.

---

## TwoColumnLayout

### Purpose

Supports richer desktop layouts while preserving clarity.

### Used On

Relationship Profile.

Card Draft Review.

Business Relationship Profile.

Settings.

### Responsibilities

Primary content area.

Secondary context area.

Responsive stacking.

### Behavior

Should create context without clutter.

### Avoid

Cramming unrelated content into sidebars.

---

## SidePanel

### Purpose

Displays supporting context without leaving the current screen.

### Used On

Card Creation.

Relationship Profile.

Search.

Admin.

### Responsibilities

Supplemental details.

Preview.

Related actions.

### Behavior

Should support the main task.

### Avoid

Becoming a junk drawer.

---

## ModalFrame

### Purpose

Supports focused temporary actions.

### Used On

Add Memory.

Confirm Send.

Edit Detail.

Delete Confirmation.

### Responsibilities

Focused content.

Clear primary action.

Safe cancel path.

### Behavior

Should be used sparingly.

### Avoid

Complex multi step workflows inside modals.

---

## DrawerPanel

### Purpose

Provides mobile friendly or contextual slide in content.

### Used On

Mobile navigation.

Filters.

Relationship quick actions.

### Responsibilities

Temporary focused interaction.

Dismissal.

### Behavior

Should feel smooth and intentional.

### Avoid

Replacing core screens with too many drawers.

---

# Relationship Components

## RelationshipCard

### Purpose

Represents one personal relationship in a list or grid.

### Used On

Your People.

Dashboard.

Search Results.

### Content

Name.

Relationship type.

Upcoming moment.

Relationship health cue.

Recent memory cue.

Primary action.

### Behavior

Click opens Relationship Profile.

Should make each person feel meaningful, not like a database record.

### Avoid

Looking like a contact card from a CRM.

---

## RecipientAvatar

### Purpose

Gives a relationship a recognizable visual marker.

### Used On

RelationshipCard.

Relationship Profile.

Card Creation.

Search Results.

### Content

Initials, image, or illustration when available.

### Behavior

Should be warm and simple.

### Avoid

Overly corporate avatar styling.

---

## RelationshipSummary

### Purpose

Summarizes what matters about one relationship.

### Used On

Relationship Profile.

Card Creation.

Concierge Recommendation Detail.

### Content

Relationship role.

Important dates.

Known preferences.

Recent context.

Concierge insight.

### Behavior

Should help the user remember the person quickly.

### Avoid

Dumping every available field.

---

## RelationshipHealthSummary

### Purpose

Shows relationship freshness and care opportunities.

### Used On

Dashboard.

Relationship Profile.

Your People.

Business Relationship Profile.

### Content

Health state.

Plain language explanation.

Suggested action.

### Behavior

Should encourage without shaming.

### Avoid

Scoring that feels judgmental.

Gamified pressure.

---

## RelationshipDateList

### Purpose

Shows important dates for a person.

### Used On

Relationship Profile.

Relationship Details.

Upcoming Moments.

### Content

Birthday.

Anniversary.

Custom dates.

Professional milestones.

### Behavior

Should make upcoming moments easy to see and act on.

### Avoid

Calendar clutter.

---

## RelationshipPreferenceList

### Purpose

Shows known preferences and boundaries.

### Used On

Relationship Profile.

Card Creation.

Relationship Details.

### Content

Tone preferences.

Things to include.

Things to avoid.

Interests.

Communication notes.

### Behavior

Should guide personalization respectfully.

### Avoid

Overly intimate display of sensitive details.

---

## AddPersonCard

### Purpose

Invites the user to add another important person.

### Used On

Your People.

Dashboard empty states.

First Conversation Complete.

### Content

Warm invitation.

Simple action.

### Behavior

Should feel low pressure.

### Avoid

Making the user feel behind.

---

# Memory Components

## MemoryTimeline

### Purpose

Displays remembered moments over time.

### Used On

Relationship Profile.

Relationship Timeline.

Business Relationship Timeline.

### Content

Timeline entries.

Dates.

Memory types.

Related cards.

Milestones.

### Behavior

Should feel like a living relationship history.

### Avoid

Looking like an activity log.

---

## MemoryCard

### Purpose

Represents one remembered moment.

### Used On

MemoryTimeline.

Search Results.

Dashboard.

### Content

Memory text.

Date.

Relationship.

Type.

Related action.

### Behavior

Should make even small memories feel valuable.

### Avoid

Making memory entries feel like notes in a database.

---

## AddMemoryButton

### Purpose

Provides a clear entry point for capturing a memory.

### Used On

Relationship Profile.

Memory Timeline.

Dashboard.

Business Relationship Profile.

### Content

Action label.

Optional helper text.

### Behavior

Should invite imperfect capture.

### Avoid

Making memory creation feel formal or high stakes.

---

## MemoryPromptCard

### Purpose

Asks one thoughtful question about a relationship.

### Used On

Dashboard.

Relationship Profile.

Concierge.

Notifications.

### Content

Question.

Reason it matters.

Answer input or action.

Skip option.

### Behavior

Should feel timely and useful.

### Avoid

Interrogation feeling.

Too many prompts at once.

---

## MemoryDetailPanel

### Purpose

Shows one memory with editable context.

### Used On

Memory Detail.

SidePanel.

### Content

Memory text.

Date.

Relationship.

Related occasion.

Edit controls.

### Behavior

Should support refinement without pressure.

### Avoid

Turning memory editing into a complex form.

---

## TimelineEventMarker

### Purpose

Visually marks the type of timeline event.

### Used On

MemoryTimeline.

Business Relationship Timeline.

### Content

Icon or small visual cue.

Event type.

### Behavior

Should help scanning.

### Avoid

Too many colors or symbols.

---

# Card Creation Components

## RecipientSelector

### Purpose

Lets the user choose who the card is for.

### Used On

Create Card Start.

Card Creation.

### Content

People list.

Search.

Upcoming suggestions.

### Behavior

Should prioritize likely recipients.

### Avoid

Generic dropdown experience when relationship context is useful.

---

## OccasionSelector

### Purpose

Lets the user choose the card occasion.

### Used On

Create Card Start.

Create Card Context.

### Content

Upcoming occasions.

Common occasions.

Custom occasion.

### Behavior

Should feel guided and curated.

### Avoid

Overwhelming occasion catalog.

---

## ToneSelector

### Purpose

Lets the user shape the voice of the card.

### Used On

Create Card Context.

Card Draft Review.

Personalization Settings.

### Content

Tone options.

Plain language descriptions.

### Behavior

Should help users choose without needing writing expertise.

### Avoid

Abstract writing jargon.

---

## CardContextPanel

### Purpose

Shows relationship context while creating a card.

### Used On

Card Creation.

Card Draft Review.

### Content

Recipient summary.

Memories.

Preferences.

Things to avoid.

Upcoming occasion.

### Behavior

Should help the user feel confident in the draft.

### Avoid

Crowding the writing area.

---

## CardDraftPreview

### Purpose

Displays the generated card message.

### Used On

Card Draft Review.

Card Detail.

Relationship Card History.

### Content

Draft text.

Tone.

Occasion.

Edit state.

### Behavior

Should make review and approval easy.

### Avoid

Making generated text feel final before user approval.

---

## CardEditor

### Purpose

Allows the user to edit the card message.

### Used On

Card Draft Review.

### Content

Editable message.

Formatting if supported.

Save state.

### Behavior

Should feel simple and forgiving.

### Avoid

Turning into a full document editor.

---

## DraftRegenerationControls

### Purpose

Allows careful changes to an AI draft.

### Used On

Card Draft Review.

### Content

Make warmer.

Make shorter.

Make more personal.

Try again.

Add detail.

### Behavior

Should offer refinement without making the user prompt AI manually.

### Avoid

Generic prompt box as the main interface.

---

## CardDesignGrid

### Purpose

Displays curated card design options.

### Used On

Card Design Selection.

### Content

Card thumbnails.

Occasion fit.

Selected state.

### Behavior

Should feel curated and premium.

### Avoid

Huge unfiltered catalog grids.

---

## CardDesignPreview

### Purpose

Shows one card design in more detail.

### Used On

Card Design Selection.

Card Preview.

Card Detail.

### Content

Card artwork.

Design metadata if needed.

Selected state.

### Behavior

Should build confidence.

### Avoid

Distracting from the message.

---

## DeliveryDetailsCard

### Purpose

Shows recipient and delivery details before sending.

### Used On

Card Preview.

Send Confirmation.

Card Detail.

### Content

Recipient address.

Sender.

Delivery timing.

Status.

### Behavior

Should be explicit and reassuring.

### Avoid

Hidden delivery assumptions.

---

## SendConfirmationPanel

### Purpose

Confirms final sending or scheduling action.

### Used On

Send Confirmation.

### Content

Recipient.

Occasion.

Message summary.

Design.

Cost or plan usage.

Final action.

### Behavior

Should prevent accidental sends without creating anxiety.

### Avoid

Vague confirmation language.

---

## CardStatusBadge

### Purpose

Shows card state.

### Used On

Dashboard.

Relationship Card History.

Card Detail.

Notifications.

### States

Draft.

Needs review.

Approved.

Scheduled.

Sent.

Delivered if available.

Issue.

### Behavior

Should be clear and calm.

### Avoid

Technical API or fulfillment language.

---

# Concierge Components

## ConciergeGreeting

### Purpose

Sets the tone on Concierge led screens.

### Used On

Dashboard.

Concierge Home.

First Conversation.

Business Dashboard.

### Content

Warm greeting.

Relevant context.

Suggested focus.

### Behavior

Should feel personal without being overly familiar.

### Avoid

Generic chatbot greeting.

---

## ConciergePrompt

### Purpose

Asks the user for useful relationship context.

### Used On

Dashboard.

Relationship Profile.

Concierge.

First Conversation.

### Content

Question.

Why it matters.

Answer action.

Skip or later option.

### Behavior

Should feel thoughtful and optional.

### Avoid

Pressure.

Too many questions.

---

## ConciergeSuggestion

### Purpose

Recommends a meaningful action.

### Used On

Dashboard.

Concierge Home.

Relationship Profile.

Business Dashboard.

### Content

Suggested action.

Reason.

Related person.

CTA.

### Behavior

Should feel useful and timely.

### Avoid

Salesy nudges.

Fake urgency.

---

## ConciergeInsightCard

### Purpose

Surfaces a relationship insight.

### Used On

Relationship Profile.

Business Relationship Profile.

Concierge.

### Content

Insight.

Supporting context.

Suggested action.

### Behavior

Should build trust through transparency.

### Avoid

Creepy or overconfident claims.

---

## RecommendationReason

### Purpose

Explains why a recommendation exists.

### Used On

Concierge Recommendation Detail.

Notifications.

Relationship Profile.

### Content

Short reasoning.

Related memory or date.

Confidence when relevant.

### Behavior

Should make AI feel accountable.

### Avoid

Exposing raw model logic or technical jargon.

---

## ConciergeConversationThread

### Purpose

Supports focused conversation with the Concierge.

### Used On

Concierge Conversation.

Card Creation assistance.

### Content

Messages.

Suggested actions.

Relationship references.

### Behavior

Should remain focused on relationship care.

### Avoid

Becoming a general chatbot.

---

## SuggestedActionList

### Purpose

Groups recommended next steps.

### Used On

Dashboard.

Concierge Home.

Relationship Profile.

Business Dashboard.

### Content

Action cards.

Priority.

Related person.

### Behavior

Should make the next best action obvious.

### Avoid

Long task lists.

---

# Notification Components

## NotificationCard

### Purpose

Represents one meaningful notification.

### Used On

Notifications Center.

Dashboard.

### Content

Message.

Related person.

Timing.

Action.

Read state.

### Behavior

Should feel curated and useful.

### Avoid

System alert tone for normal relationship prompts.

---

## NotificationGroup

### Purpose

Groups related notifications.

### Used On

Notifications Center.

### Content

Category title.

Notification cards.

### Behavior

Should improve scanning.

### Avoid

Overcategorizing.

---

## SnoozeControl

### Purpose

Allows users to delay a notification or prompt.

### Used On

Notification Detail.

Concierge Prompt.

Upcoming Moment Card.

### Content

Timing options.

Custom option if supported.

### Behavior

Should respect user timing.

### Avoid

Making snooze feel like failure.

---

## UpcomingMomentCard

### Purpose

Shows an upcoming date or care opportunity.

### Used On

Dashboard.

Upcoming Moments.

Relationship Profile.

Business Dashboard.

### Content

Person.

Occasion.

Date.

Recommended action.

Timing cue.

### Behavior

Should make action feel easy and timely.

### Avoid

Alarmist reminder language.

---

# Search Components

## GlobalSearchInput

### Purpose

Lets users search across relationship memory.

### Used On

Search.

AppShell.

### Content

Input.

Placeholder.

Clear action.

### Behavior

Should feel like asking the Concierge.

### Avoid

Database query feeling.

---

## SearchResultGroup

### Purpose

Groups results by meaning.

### Used On

Search Results.

### Content

Group title.

Result items.

Count if useful.

### Behavior

Should make the best path obvious.

### Avoid

Flat unstructured lists.

---

## PersonSearchResult

### Purpose

Shows a person result.

### Used On

Search Results.

Global Search.

### Content

Name.

Relationship.

Upcoming date.

Recent memory cue.

### Behavior

Should open Relationship Profile.

### Avoid

Showing only name and email.

---

## MemorySearchResult

### Purpose

Shows a memory result.

### Used On

Search Results.

### Content

Memory snippet.

Related person.

Date.

### Behavior

Should open memory or timeline context.

### Avoid

Showing raw truncated text with no relationship context.

---

## CardSearchResult

### Purpose

Shows a card result.

### Used On

Search Results.

### Content

Recipient.

Occasion.

Status.

Date.

Snippet.

### Behavior

Should open Card Detail.

### Avoid

Technical status labels.

---

# Settings Components

## SettingsSectionCard

### Purpose

Represents a settings category.

### Used On

Settings Home.

### Content

Title.

Description.

Status if useful.

Action.

### Behavior

Should make settings feel approachable.

### Avoid

Dense control panel layout.

---

## PreferenceToggle

### Purpose

Controls a simple user preference.

### Used On

Notification Settings.

Privacy Settings.

Personalization Settings.

Business Settings.

### Content

Label.

Description.

State.

### Behavior

Should explain impact clearly.

### Avoid

Ambiguous toggles.

---

## PreferenceSelect

### Purpose

Controls a preference with multiple choices.

### Used On

Tone preferences.

Notification timing.

Delivery settings.

### Content

Options.

Descriptions.

Selected state.

### Behavior

Should make differences easy to understand.

### Avoid

Internal enum labels.

---

## DangerZone

### Purpose

Separates sensitive or irreversible settings.

### Used On

Account Settings.

Privacy Settings.

Subscription Settings.

### Content

Warning.

Explanation.

Action.

Confirmation.

### Behavior

Should be calm, serious, and clear.

### Avoid

Scary visual overkill.

---

# Business Concierge Components

## BusinessRelationshipCard

### Purpose

Represents one professional relationship.

### Used On

Business Relationships.

Business Dashboard.

Search Results.

### Content

Name.

Company.

Role.

Relationship type.

Upcoming milestone.

Suggested action.

### Behavior

Should feel relationship based, not sales based.

### Avoid

Pipeline stage styling.

Lead score language.

---

## ProfessionalContextSummary

### Purpose

Summarizes key professional relationship context.

### Used On

Business Relationship Profile.

Business Concierge.

Card Creation.

### Content

Company.

Role.

Relationship type.

Known preferences.

Recent professional memory.

Boundaries.

### Behavior

Should support thoughtful professionalism.

### Avoid

Overpersonalization.

---

## BusinessMilestoneCard

### Purpose

Shows a professional milestone or opportunity.

### Used On

Business Dashboard.

Business Relationship Profile.

Notifications.

### Content

Milestone.

Person.

Date.

Suggested action.

### Behavior

Should feel respectful and timely.

### Avoid

Transactional follow up language.

---

## ProfessionalMemoryCard

### Purpose

Represents a remembered professional moment.

### Used On

Business Relationship Timeline.

Search Results.

### Content

Meeting.

Project.

Referral.

Achievement.

Milestone.

Note.

### Behavior

Should reinforce continuity.

### Avoid

CRM activity log tone.

---

## RelationshipTypeBadge

### Purpose

Identifies professional relationship type.

### Used On

BusinessRelationshipCard.

Business Relationship Profile.

Search Results.

### Types

Client.

Referral Partner.

Investor.

Lender.

Attorney.

Realtor.

Vendor.

Contractor.

Employee.

Other.

### Behavior

Should support scanning without defining value.

### Avoid

Ranking people by business value.

---

## ProfessionalBoundaryNotice

### Purpose

Reminds the user when personalization should remain restrained.

### Used On

Business Relationship Profile.

Card Creation.

Business Settings.

### Content

Boundary guidance.

Known preferences.

Things to avoid.

### Behavior

Should protect trust.

### Avoid

Lecturing the user.

---

# Form Components

## TextInput

### Purpose

Captures short text.

### Used On

Forms throughout the product.

### Behavior

Should include clear labels, helper text when needed, and accessible errors.

### Avoid

Placeholder only labels.

---

## TextArea

### Purpose

Captures longer personal or professional context.

### Used On

Add Memory.

First Conversation.

Card Context.

Concierge Prompt.

### Behavior

Should invite imperfect writing.

### Avoid

Making users feel they need polished prose.

---

## DateInput

### Purpose

Captures meaningful dates.

### Used On

Add Person.

Relationship Details.

Business Relationship Details.

Card Creation.

### Behavior

Should support partial knowledge where appropriate.

### Avoid

Forcing exact dates when users may not know them.

---

## RelationshipSelector

### Purpose

Selects a person or professional relationship.

### Used On

Card Creation.

Add Memory.

Search.

### Behavior

Should include context, not just names.

### Avoid

Plain dropdowns for large relationship lists.

---

## FormHelperText

### Purpose

Explains why information is being requested.

### Used On

All meaningful forms.

### Behavior

Should build trust and reduce uncertainty.

### Avoid

Generic helper text that adds no value.

---

## InlineValidationMessage

### Purpose

Explains form issues clearly.

### Used On

All forms.

### Behavior

Should be specific and calm.

### Avoid

Blaming the user.

---

# Feedback Components

## SuccessMessage

### Purpose

Confirms that an action worked.

### Used On

Memory saved.

Card approved.

Settings updated.

Person added.

### Behavior

Should reinforce meaningful progress.

### Avoid

Cold system messages.

---

## ErrorMessage

### Purpose

Explains that something went wrong.

### Used On

All recoverable error states.

### Behavior

Should say what happened and what to do next.

### Avoid

Raw technical errors.

---

## WarningMessage

### Purpose

Communicates caution before important actions.

### Used On

Send Confirmation.

Delete actions.

Subscription changes.

Privacy actions.

### Behavior

Should be clear without creating panic.

### Avoid

Overuse.

---

## Toast

### Purpose

Displays lightweight temporary feedback.

### Used On

Save confirmations.

Small updates.

Dismissals.

### Behavior

Should be brief and nonintrusive.

### Avoid

Important information that disappears too quickly.

---

## ConfirmationDialog

### Purpose

Confirms sensitive or irreversible actions.

### Used On

Delete memory.

Cancel subscription.

Send card.

Delete person.

### Behavior

Should clearly state consequences.

### Avoid

Generic “Are you sure?” language.

---

# Loading Components

## LoadingState

### Purpose

Shows that the product is gathering information.

### Used On

All async screens.

### Behavior

Should use warm, human language.

### Example Copy

```text
Gathering your relationships

```

```text
Preparing your Concierge briefing

```

```text
Getting the card ready

```

### Avoid

```text
Loading data

```

```text
Fetching records

```

---

## SkeletonCard

### Purpose

Shows expected content shape during loading.

### Used On

Dashboard.

Your People.

Relationship Profile.

Card lists.

### Behavior

Should reduce layout shift.

### Avoid

Overly flashy shimmer effects.

---

## InlineSpinner

### Purpose

Shows short action progress.

### Used On

Buttons.

Small async actions.

### Behavior

Should appear only when helpful.

### Avoid

Using spinners for long waits without explanation.

---

## ProgressIndicator

### Purpose

Shows progress through a guided flow.

### Used On

First Conversation.

Card Creation.

Checkout.

### Behavior

Should reassure without making the flow feel long.

### Avoid

Overly mechanical stepper design.

---

# Empty State Components

## EmptyState

### Purpose

Explains when a screen has no content yet.

### Used On

Most list screens.

### Content

Warm heading.

Helpful explanation.

Primary action.

Optional illustration.

### Behavior

Should invite progress.

### Avoid

Dead end language.

---

## EmptyPeopleState

### Purpose

Invites the user to add their first person.

### Used On

Your People.

Dashboard.

### Behavior

Should make the first relationship feel meaningful.

### Avoid

“ No contacts found ” language.

---

## EmptyTimelineState

### Purpose

Invites the user to add the first memory.

### Used On

Relationship Timeline.

Business Relationship Timeline.

### Behavior

Should emphasize that a small memory is enough.

### Avoid

“ No entries ” language.

---

## EmptySearchState

### Purpose

Helps the user recover from no search results.

### Used On

Search Results.

### Behavior

Should suggest broader searches or adding information.

### Avoid

Blunt “ No results found ” without help.

---

## EmptyNotificationsState

### Purpose

Reassures the user when there are no notifications.

### Used On

Notifications Center.

### Behavior

Should communicate calm, not absence of value.

### Avoid

Making the product feel empty.

---

# Trust and Privacy Components

## PrivacyReassurance

### Purpose

Provides brief trust context near sensitive prompts.

### Used On

First Conversation.

Add Person.

Add Memory.

Privacy Settings.

Business Relationship Profile.

### Content

Short reassurance.

Optional link to details.

### Behavior

Should reduce hesitation.

### Avoid

Long legal explanations inline.

---

## AITransparencyNote

### Purpose

Explains AI involvement when useful.

### Used On

Card Draft Review.

Concierge Recommendation Detail.

Privacy Settings.

### Content

What AI helped with.

What the user controls.

### Behavior

Should build trust.

### Avoid

Overexplaining technical model behavior.

---

## DataControlCard

### Purpose

Shows user control over relationship data.

### Used On

Privacy Settings.

Account Settings.

### Content

Export.

Delete.

Review.

Manage preferences.

### Behavior

Should feel empowering.

### Avoid

Dark patterns.

---

# Billing Components

## PlanCard

### Purpose

Represents a subscription or pricing option.

### Used On

Pricing.

Subscription Settings.

Checkout.

### Content

Plan name.

Price.

What is included.

Primary action.

### Behavior

Should be clear and trustworthy.

### Avoid

Manipulative pricing design.

---

## UsageSummary

### Purpose

Shows card or plan usage.

### Used On

Subscription Settings.

Checkout.

Dashboard if needed.

### Content

Cards available.

Cards used.

Renewal timing.

### Behavior

Should be easy to understand.

### Avoid

Confusing credit language.

---

## BillingStatusCard

### Purpose

Shows current billing state.

### Used On

Subscription Settings.

Payment Issue.

### Content

Current plan.

Payment status.

Next billing date.

Action if needed.

### Behavior

Should be calm and explicit.

### Avoid

Alarmist payment language unless urgent.

---

# Admin Components

## AdminTable

### Purpose

Displays operational data for internal use.

### Used On

Admin screens.

### Behavior

May be denser than customer screens, but still clear.

### Avoid

Letting admin patterns leak into customer experience.

---

## AdminStatusBadge

### Purpose

Shows operational status.

### Used On

Admin card library.

Admin support.

### Behavior

Can use more technical labels when internal users require them.

### Avoid

Using internal status labels on customer screens.

---

## AssetPreviewCard

### Purpose

Shows card or illustration assets for review.

### Used On

Admin Card Library.

### Content

Preview.

Metadata.

Status.

Actions.

### Behavior

Should support efficient review.

### Avoid

Overcomplicating asset display.

---

# Component Naming Rules

Component names should be clear, stable, and product meaningful.

Use product specific names when the component expresses product meaning.

Use generic names only for true primitives.

Good names:

```text
RelationshipCard
MemoryTimeline
ConciergePrompt
CardDraftPreview
UpcomingMomentCard
BusinessRelationshipCard
PrivacyReassurance

```

Acceptable primitive names:

```text
Button
TextInput
ModalFrame
SectionBlock
Toast

```

Weak names:

```text
InfoBox
DataPanel
ItemCard
ThingList
GenericModal

```

---

# Component Quality Rules

Every component should satisfy the following:

1. It has a clear purpose.
2. It supports one primary user intent.
3. It uses human language.
4. It has accessible structure.
5. It handles loading, empty, and error states when relevant.
6. It adapts to mobile and desktop.
7. It avoids unnecessary visual noise.
8. It supports the premium Relationship Concierge feeling.
9. It does not expose backend complexity.
10. It can be reused without losing meaning.

---

# Component Behavior Rules

Components should:

Guide rather than demand.

Clarify rather than decorate.

Support thoughtful action.

Reduce repeated decision making.

Respect privacy.

Preserve user control.

Make important status visible.

Stay calm under error conditions.

Feel warm without becoming cute.

Feel premium without becoming cold.

---

# Component Anti Patterns

Avoid components that:

Look like generic SaaS widgets.

Create dashboard clutter.

Overemphasize metrics.

Turn relationships into records.

Make memories feel like data entries.

Make AI feel like the product.

Use sales or CRM language.

Hide important status.

Create false urgency.

Rely on color alone.

Require users to understand system architecture.

---

# Guiding Principles

The component library exists to make F.I. Forgot feel cohesive.

Every screen should feel assembled from thoughtful, familiar building blocks.

Every component should support the product’s promise:

Helping people become more thoughtful in the relationships that matter most.

Components should make the product easier to use.

Warmer to experience.

Safer to trust.

More consistent to build.

And harder to accidentally turn into a CRM, reminder app, greeting card catalog, or AI writing tool.

Every component should answer:

**What would a world class Relationship Concierge do here?**