# 87_SETTINGS_BUILD_[SPEC.md](http://SPEC.md)

---

# Purpose

Settings is where users manage the trust relationship between themselves and F.I. Forgot.

It is not a dumping ground for preferences.

It is not a technical control panel.

It is the place where users can understand, adjust, protect, and personalize how their Relationship Concierge works.

The Settings experience must feel calm, organized, and reassuring.

Users should always feel:

"I know what F.I. Forgot knows."

"I know what it can do."

"I know how to change it."

"I know I am in control."

---

# Philosophy

Settings follows five principles.

## Trust Before Configuration

Every setting exists because it helps the user feel safer, clearer, or better served.

Do not expose internal complexity simply because it exists.

---

## Plain Language Over System Language

Settings should never sound like backend configuration.

Use human language.

Use relationship language.

Use concierge language.

Avoid technical labels unless legally or operationally required.

---

## Rarely Used, Easy When Needed

Most users will not visit Settings often.

When they do, they usually have a specific intent.

The layout must support fast finding, clear grouping, and confident editing.

---

## Safety Through Clarity

Users should understand the consequence of every meaningful change before committing it.

Destructive or trust sensitive actions require confirmation.

Reversible changes should use undo instead of excessive confirmation.

---

## Personal, Not Overwhelming

F.I. Forgot should feel tailored without forcing users through endless preferences.

Use intelligent defaults.

Surface only meaningful choices.

Hide advanced controls until needed.

---

# Goals

Settings should allow users to:

* manage account and profile information

* manage subscription and billing

* control notifications

* manage privacy and data

* configure security

* manage connected services

* guide AI writing preferences

* personalize the experience

* control accessibility and appearance preferences

* find help quickly

* review legal and policy information

* understand consequences before making sensitive changes

---

# Information Hierarchy

```

Settings

├── Search

│

├── Account

│   ├── Profile

│   ├── Email

│   ├── Phone

│   └── Address

│

├── Subscription and Billing

│   ├── Current Plan

│   ├── Usage

│   ├── Payment Method

│   ├── Invoices

│   └── Plan Changes

│

├── Notifications

│   ├── Approval Alerts

│   ├── Relationship Reminders

│   ├── Delivery Updates

│   └── Digest Preferences

│

├── Privacy and Data

│   ├── Relationship Data

│   ├── Memory Data

│   ├── AI Usage

│   ├── Export Data

│   └── Delete Data

│

├── Security

│   ├── Password

│   ├── Sessions

│   ├── Two Factor Authentication

│   └── Account Recovery

│

├── Connected Services

│   ├── Calendar

│   ├── Contacts

│   ├── Handwrytten

│   ├── Stripe

│   └── Email

│

├── AI Preferences

│   ├── Tone

│   ├── Personalization

│   ├── Creativity

│   ├── Topics to Avoid

│   └── Default Signature

│

├── Personalization

│   ├── Relationship Defaults

│   ├── Occasion Defaults

│   ├── Card Preferences

│   └── Concierge Style

│

├── Accessibility

│   ├── Motion

│   ├── Contrast

│   ├── Font Size

│   └── Keyboard Preferences

│

├── Appearance

│   ├── Theme

│   ├── Density

│   └── Display Preferences

│

├── Language and Localization

│   ├── Language

│   ├── Region

│   ├── Date Format

│   └── Time Zone

│

├── Help and Support

│   ├── Contact Support

│   ├── FAQ

│   ├── Troubleshooting

│   └── Status

│

└── Legal

    ├── Terms

    ├── Privacy Policy

    ├── Data Processing

    └── Licenses

```

---

# Desktop Layout Specification

Breakpoint:

1200px and above

Maximum content width:

1400px

Page padding:

48px

Top padding:

40px

Bottom padding:

96px

Grid:

12 columns

Gutter:

32px

---

# Desktop Page Structure

```

------------------------------------------------------------

Settings Header

------------------------------------------------------------

Settings Search

------------------------------------------------------------

Left Navigation       Main Settings Panel

------------------------------------------------------------

```

---

# Desktop Columns

Left Navigation:

280px

Sticky position

Top offset:

120px

Maximum height:

calc(100vh minus 140px)

Scrollable internally if needed.

Main Panel:

Remaining width

Maximum width:

880px

---

# Header Specification

Contains:

Page title

Subtitle

Optional status badge

---

## Page Title

Settings

Font size:

44px

Weight:

700

Line height:

1.1

---

## Subtitle

"Manage your account, preferences, privacy, and concierge behavior."

Font size:

17px

Muted text color

Maximum width:

720px

---

# Settings Search

Position:

Below header

Width:

100%

Maximum width:

760px

Height:

56px

Radius:

18px

Icon:

Search

Placeholder:

"Search settings"

Behavior:

Instant results

Debounce:

200ms

---

# Desktop Navigation

The left navigation organizes settings into clear groups.

It should feel like a premium account console, not a software admin panel.

---

## Navigation Groups

Primary group:

Account

Billing

Notifications

Privacy

Security

Connected Services

AI Preferences

Personalization

Accessibility

Appearance

Language

Help

Legal

---

## Navigation Item

Height:

44px

Radius:

14px

Padding:

12px 14px

Typography:

15px

Weight:

500

Active state:

Soft filled background

Semibold label

Left accent indicator

Hover state:

Subtle background

---

# Main Panel Layout

Settings sections render as stacked cards.

Spacing between cards:

24px

Section spacing:

48px

Each top level category begins with:

Section title

Section description

Settings cards

---

# Settings Card Specification

Card background:

Surface color

Border:

1px solid subtle border

Radius:

24px

Padding:

32px

Shadow:

Soft, minimal

---

# Settings Row Specification

Rows are used for simple editable settings.

Row height:

Minimum 72px

Padding:

20px 0

Border bottom:

Subtle divider except final row

Layout:

```

Left

Title

Description

Right

Current value or control

```

---

## Row Title

Font size:

16px

Weight:

600

---

## Row Description

Font size:

14px

Muted color

Maximum width:

520px

---

## Row Control

Aligned right.

Examples:

Button

Toggle

Select

Status badge

Chevron

---

# Tablet Layout Specification

Breakpoint:

768px to 1199px

Page padding:

32px

Top padding:

32px

Bottom padding:

80px

---

# Tablet Structure

```

Settings Header

Settings Search

Horizontal Category Navigation

Main Settings Panel

```

Left navigation becomes horizontal scroll navigation.

No sticky sidebar.

---

# Tablet Navigation

Height:

56px

Overflow:

Horizontal scroll

Snap:

Start

Items rendered as pills.

Active item remains visible when selected.

---

# Tablet Cards

Cards remain full width.

Padding:

28px

Rows maintain two column layout when space allows.

When row content becomes crowded:

Control moves below description.

---

# Mobile Layout Specification

Breakpoint:

767px and below

Page padding:

20px

Top padding:

24px

Bottom padding:

88px

---

# Mobile Structure

```

Settings Header

Settings Search

Category List

Selected Category Content

```

Mobile should not show a dense sidebar.

The default view shows the category list.

Selecting a category opens that category view.

---

# Mobile Header

Title:

34px

Subtitle:

15px

Search:

Full width

Height:

52px

---

# Mobile Category List

Each category appears as a large touch friendly card.

Height:

72px minimum

Radius:

20px

Contains:

Icon

Category title

Short description

Chevron

Optional status badge

---

# Mobile Category View

When a category is selected:

Top bar contains:

Back button

Category title

Optional search within category

Content appears below.

---

# Mobile Settings Rows

Rows become vertical.

```

Title

Description

Current value

Control

```

Minimum touch target:

48px

Toggles align right when possible.

Long controls become full width.

---

# Responsive Behavior

Settings must reorganize intentionally rather than shrink.

Rules:

Desktop uses sidebar plus main panel.

Tablet uses horizontal category navigation.

Mobile uses category cards and category detail screens.

Search remains near the top on all viewports.

Billing and privacy actions remain easy to find.

Dangerous actions remain visually separated.

No horizontal page scrolling is allowed.

All touch targets are at least 48px.

All cards avoid layout shift during loading.

The next section continues with the complete component tree, account settings, profile settings, subscription and billing, and notification settings.

# Complete Component Tree

The Settings experience is built entirely from reusable design system components.

Each component should already exist within the shared component library whenever possible.

No duplicate components should be introduced simply for Settings.

---

```

SettingsPage

├── SettingsHeader

│

├── SettingsSearch

│

├── SettingsNavigation

│   ├── NavigationGroup

│   ├── NavigationItem

│   └── ActiveIndicator

│

├── SettingsContent

│   ├── SectionHeader

│   ├── SettingsCard

│   │   ├── CardHeader

│   │   ├── SettingsRow

│   │   ├── InlineEditor

│   │   ├── Toggle

│   │   ├── Select

│   │   ├── StatusBadge

│   │   └── ActionButton

│   │

│   ├── ConfirmationBanner

│   ├── InlineAlert

│   ├── SuccessMessage

│   └── EmptyState

│

├── SearchResults

│

├── SettingsDrawer

│

├── ConfirmationModal

│

├── Toast

│

└── HelpPanel

```

---

# Account Settings

Purpose:

Allow users to manage the identity associated with their Relationship Concierge account.

This section should feel simple, trustworthy, and familiar.

It should never resemble an enterprise account management page.

---

# Account Information Card

Contains:

Profile Photo

Full Name

Email Address

Phone Number

Mailing Address

Preferred Display Name

Each field displays:

Current Value

Edit Button

Verification Status where applicable

---

## Profile Photo

Purpose:

Personalize the experience.

Used only for account identity.

Never used inside greeting cards.

Layout:

80px circular avatar

Edit button

Remove photo option

---

Editing Flow

Select Image

↓

Crop

↓

Preview

↓

Save

Cancel remains available throughout.

---

## Full Name

Displayed everywhere account identity is required.

Editable inline.

Validation:

Required

Maximum length:

100 characters

Leading and trailing spaces removed automatically.

---

## Email Address

Primary account identifier.

Displays:

Current email

Verification badge

Last verified date

Edit action

Changing email requires verification before becoming active.

---

## Phone Number

Optional.

Used for:

Account recovery

Optional notifications

Two factor authentication

Formatting follows regional preferences.

---

## Mailing Address

Used for:

Billing

Physical card defaults

Shipping calculations

Editing opens a dedicated address editor.

Address validation occurs before saving.

---

# Profile Settings

Purpose:

Allow users to personalize how F.I. Forgot represents them.

This information improves future card drafts.

It is not public.

---

# Personal Preferences Card

Contains:

Preferred Name

Pronouns

Default Signature

Relationship Writing Style

Biography

Only fields that meaningfully improve personalization are included.

---

## Preferred Name

Used inside AI generated drafts.

Example:

James

instead of

James Massaro

---

## Default Signature

Examples:

Love,

Best,

Thinking of you,

With appreciation,

Custom

Preview updates immediately.

---

## Relationship Writing Style

Examples:

Warm

Funny

Professional

Elegant

Heartfelt

Multiple selections allowed.

Used only as guidance.

Users may override during individual card creation.

---

## Personal Biography

Optional.

Maximum:

500 characters.

Purpose:

Help AI better understand the user.

Example:

"I usually write short, sincere messages with a little humor."

Live character count displayed.

---

# Subscription and Billing

Purpose:

Clearly explain the user's plan, billing status, and usage.

The experience should reinforce value rather than simply listing invoices.

---

# Billing Overview Card

Displays:

Current Plan

Renewal Date

Card Usage

Remaining Included Cards

Next Billing Date

Manage Subscription button

---

Layout

```

Current Plan

Usage Summary

Renewal Information

Primary Action

```

---

## Current Plan

Displays:

Plan Name

Monthly or Annual

Status

Price

Examples:

Premium Concierge

Annual

Active

---

## Usage Summary

Visual progress indicator.

Displays:

Included Cards

Cards Used

Remaining Cards

Extra Card Pricing if applicable.

---

## Payment Method

Displays:

Card Brand

Last Four Digits

Expiration

Billing Address

Edit Button

Removing payment methods requires another valid payment method when subscription remains active.

---

## Billing History

Displays invoices chronologically.

Each row includes:

Invoice Date

Amount

Status

Download PDF

Receipt

Pagination after twenty invoices.

---

## Subscription Actions

Possible actions:

Upgrade Plan

Downgrade Plan

Switch Billing Cycle

Update Payment Method

Cancel Subscription

Dangerous actions are visually separated.

---

# Notification Settings

Purpose:

Allow users to control interruptions without weakening the concierge experience.

The interface emphasizes outcomes rather than notification technology.

---

# Notification Categories

Approval Alerts

Relationship Reminders

Delivery Updates

Weekly Digest

Monthly Summary

Product Updates

System Alerts

---

Each category appears as its own card.

---

## Approval Alerts

Controls:

Draft Ready

Urgent Approval Needed

Mail Deadline

Card Sent

Delivery Confirmation

Each row includes:

Description

Toggle

Optional frequency selector

---

## Relationship Reminders

Controls:

Relationship Becoming Stale

Suggested Memory Updates

Important Milestones

Relationship Health Changes

Encouragement Opportunities

---

## Delivery Updates

Options:

Card Printed

Card Mailed

Card Delivered

Shipping Delay

Address Issue

---

## Digest Preferences

Users choose how frequently non urgent information is delivered.

Options:

Immediately

Daily

Weekly

Monthly

Important Only

Examples beneath each option explain expected behavior.

---

# Notification Channels

Separate card.

Channels:

Email

Push

SMS

In App

Each channel displays:

Availability

Current Status

Toggle

Unavailable channels explain why.

---

## Quiet Hours

Optional.

Purpose:

Reduce interruptions.

Fields:

Start Time

End Time

Time Zone

During quiet hours:

Urgent delivery failures may still be sent if enabled.

---

## Notification Preview

A live preview demonstrates how notifications appear.

Changing settings updates the preview instantly.

This helps users understand the impact of their choices before saving.

---

# Notification Summary

A compact summary card appears at the bottom.

Example:

"You'll receive immediate alerts for approvals, a weekly relationship summary every Sunday morning, and delivery updates by email."

This summary updates live as preferences change.

The next section continues with Privacy and Data, Security, Connected Services, AI Preferences, Personalization, Accessibility, Appearance, Language, Help, and Legal.



# Privacy and Data

Purpose:

Privacy settings should reinforce confidence.

Users should clearly understand:

* what information F.I. Forgot stores

* why it is stored

* how it improves future cards

* how they can control it

Privacy should feel empowering rather than intimidating.

---

# Privacy Overview Card

Displays:

Privacy Summary

Relationship Data Status

AI Personalization Status

Data Export

Data Removal

---

Example Summary

"Your relationship information is used only to help prepare thoughtful greeting cards and improve future drafts."

Link:

Learn More

---

# Relationship Data Card

Purpose:

Explain what relationship information is stored.

Sections:

People

Events

Memories

Interests

Important Dates

Writing Preferences

Each item includes:

Title

Short explanation

Retention status

---

Example

**Memories**

"Stories you share help create more personal greeting cards."

---

# AI Personalization Card

Purpose:

Explain how AI uses information.

Settings include:

Use relationship history

Use previous cards

Use personal memories

Use writing preferences

Improve future drafts using edits

Each setting includes:

Toggle

Description

Impact explanation

---

Example

**Learn From My Edits**

"When enabled, your manual edits help future drafts better match your writing style."

---

# Export Data

Purpose:

Allow users to download their information.

Primary Action:

Export My Data

Description:

"We'll prepare a downloadable archive containing your account and relationship information."

Export status appears after request.

Possible states:

Preparing

Ready

Expired

Downloaded

---

# Delete Data

Separated into two sections.

## Delete Relationship Data

Allows removal of relationship information while keeping the account.

Confirmation required.

---

## Delete Account

Placed inside a clearly labeled Danger Zone.

Includes:

Explanation

Consequences

Confirmation modal

Requires password confirmation.

---

# Security

Purpose:

Help users feel protected without overwhelming them.

---

# Security Overview Card

Displays:

Password

Two Factor Authentication

Trusted Devices

Recent Sign In Activity

Recovery Information

---

# Password Card

Contains:

Last Changed

Change Password button

Password strength guidance

Passwords are never displayed.

---

Changing Password

Current Password

↓

New Password

↓

Confirm Password

↓

Save

Requirements appear live.

---

# Two Factor Authentication

Status:

Enabled

Disabled

Setup Required

Card includes:

Current status

Explanation

Primary action

Recovery code information

---

# Trusted Devices

Displays recent trusted devices.

Each row contains:

Device Name

Browser

Location

Last Active

Remove button

Removing a device signs it out immediately.

---

# Sign In History

Displays recent account activity.

Columns:

Date

Location

Device

Result

Suspicious activity is highlighted.

---

# Connected Services

Purpose:

Provide visibility into third party integrations.

Connections should feel optional and transparent.

---

# Connected Services Overview

Services include:

Calendar

Contacts

Handwrytten

Billing

Email

Each appears as its own connection card.

---

# Connection Card

Displays:

Service Icon

Connection Status

Description

Connected Account

Primary Action

---

Possible States

Connected

Disconnected

Needs Attention

Permission Required

Syncing

---

## Calendar Connection

Displays:

Connected Provider

Last Sync

Calendar Count

Reconnect button

Disconnect button

---

## Contacts Connection

Displays:

Contacts Imported

Last Sync

Automatic Sync status

Manual Sync button

---

## Handwrytten

Displays:

Connection Status

API Status

Delivery Status

Reconnect if necessary

Most users will rarely need this section.

---

## Billing Provider

Read only.

Displays current billing provider status.

No direct configuration beyond subscription management.

---

# AI Preferences

Purpose:

Allow users to guide the concierge rather than configuring AI.

Language remains relationship focused.

---

# Writing Style Card

Options:

Warm

Professional

Elegant

Funny

Playful

Heartfelt

Balanced

Users may choose multiple preferred styles.

---

# Creativity Card

Slider:

Conservative

Balanced

Creative

Descriptions update live.

---

Conservative

Closer to factual events.

---

Balanced

Natural blend of facts and warmth.

---

Creative

More expressive language while remaining truthful.

---

# Personalization Card

Controls:

Reference memories

Mention family

Reference hobbies

Use inside jokes

Reference accomplishments

Each option explains how it affects future drafts.

---

# Sensitive Topics Card

Purpose:

Allow users to guide AI away from topics they prefer not to mention.

Examples:

Health

Politics

Religion

Finances

Work

Family

Pets

Custom topics

These become guidance, not hard coded restrictions unless required.

---

# Personalization

Purpose:

Customize how the Relationship Concierge behaves.

---

# Concierge Style

Options:

Quiet Assistant

Balanced Concierge

Proactive Concierge

Each includes:

Illustration

Description

Behavior summary

---

## Quiet Assistant

Minimal reminders.

Only important events.

---

## Balanced Concierge

Recommended.

Occasional thoughtful suggestions.

---

## Proactive Concierge

More recommendations.

More opportunities.

More relationship coaching.

---

# Relationship Defaults

Default card behavior.

Default approval policy.

Default reminder style.

Default relationship update frequency.

These become defaults for newly created relationships.

Existing relationships remain unchanged.

---

# Card Preferences

Controls:

Default handwriting style

Default card category

Default shipping speed

Default signature

Preview updates live.

---

# Accessibility

Purpose:

Allow users to tailor the interface for comfort.

---

# Motion

Options:

Full Motion

Reduced Motion

Minimal Motion

Preview demonstrates changes immediately.

---

# Font Size

Slider:

Small

Medium

Large

Extra Large

Changes preview instantly without requiring save.

---

# Contrast

Options:

Standard

High Contrast

Extra Contrast

---

# Keyboard

Controls:

Enhanced focus indicators

Always show shortcuts

Sticky keyboard navigation

These settings improve accessibility without affecting other users.

---

# Appearance

Purpose:

Allow visual customization while preserving brand identity.

---

# Theme

Options:

Light

Dark

System

Live preview shown.

---

# Density

Comfortable

Balanced

Compact

Updates preview card immediately.

---

# Accent Style

Limited personalization.

Users may choose from approved brand accent palettes.

Brand consistency remains intact.

---

# Language and Localization

Purpose:

Respect regional expectations.

---

Controls:

Language

Region

Time Zone

Date Format

Time Format

First Day of Week

Changes preview immediately.

---

# Help and Support

Purpose:

Provide assistance without making users search external documentation.

---

Cards include:

Contact Support

Frequently Asked Questions

Troubleshooting

Report a Problem

System Status

Each action opens within the product whenever possible.

---

# Legal

Purpose:

Transparency.

Never hide legal information.

---

Cards include:

Terms of Service

Privacy Policy

Cookie Policy

Data Processing Information

Open Source Licenses

Each opens in a dedicated reading experience rather than downloading documents when possible.

The next section covers search behavior, empty states, loading states, error states, editing interactions, dialogs, animations, microinteractions, keyboard behavior, accessibility, analytics, API mapping, performance, acceptance criteria, and definition of done.



# Search

Search is available globally throughout the Settings experience.

Users should never need to remember which category contains a particular setting.

Search should behave like Spotlight rather than traditional filtering.

Results appear instantly as the user types.

---

# Search Scope

Settings search indexes:

* Category names

* Setting names

* Setting descriptions

* Help articles

* Billing actions

* Security actions

* Notification options

* Privacy options

* AI preference labels

Search does **not** index:

* Personal relationship data

* Recipient names

* Card content

* Billing history

* Sensitive account information

---

# Search Behavior

Debounce:

200ms

Minimum characters:

1

Maximum visible results:

12

Results grouped by category.

Example:

```

Results

Account

    Email Address

Notifications

    Weekly Digest

Security

    Two Factor Authentication

Privacy

    Export My Data

AI Preferences

    Creativity

```

---

# Selecting a Result

Selecting a result:

1. Navigates to the appropriate category.

2. Automatically scrolls to the matching setting.

3. Expands any collapsed card.

4. Briefly highlights the setting.

5. Places keyboard focus on the setting.

---

# Recent Searches

Recent searches exist only during the current session.

Maximum:

5

Automatically cleared when the browser session ends.

---

# No Results

Illustration:

Small concierge searching a filing cabinet.

Headline:

"We couldn't find that setting."

Body:

"Try another word or browse the categories."

Primary Action:

Browse Settings

---

# Empty States

Empty states should reassure users rather than implying something is missing.

---

## No Connected Services

Headline:

"No connected services."

Body:

"You can connect calendars or contacts at any time to make your concierge even more helpful."

Primary Action:

Connect Service

---

## No Billing History

Headline:

"No invoices yet."

Body:

"Your billing history will appear here after your first payment."

---

## No Trusted Devices

Headline:

"No trusted devices."

Body:

"Devices you choose to trust will appear here."

---

## No Recent Sign In Activity

Headline:

"No recent activity."

Body:

"Recent sign in history will appear here for your security."

---

## No Export Requests

Headline:

"No data exports."

Body:

"You haven't requested an export yet."

---

# Loading States

Loading should preserve layout stability.

No content should jump after loading.

Skeleton placeholders match final dimensions.

---

## Header Loading

Skeleton:

Title

Subtitle

Search bar

---

## Navigation Loading

Navigation pills or sidebar items render as skeleton rows.

---

## Settings Cards

Each card loads independently.

Skeleton includes:

Card title

Description

Three to five placeholder rows

Controls represented by skeleton switches or buttons.

---

## Billing Loading

Usage bar

Payment card

Invoice rows

All rendered as skeletons.

---

## Connected Services Loading

Connection cards load independently.

Status badge placeholder

Buttons

Description

---

## Progressive Rendering

Priority:

Header

↓

Navigation

↓

Visible category

↓

Remaining categories

Hidden categories should not block interaction.

---

# Error States

Errors should always explain:

* What happened

* Whether user action is required

* How recovery will occur

Never expose implementation details.

---

# Inline Error

Used for individual setting failures.

Example:

"We couldn't save this preference."

Actions:

Retry

Dismiss

---

# Card Error

Entire settings card unavailable.

Example:

"We couldn't load your billing information."

Primary Action:

Try Again

Secondary:

Contact Support

---

# Connection Error

Connected service lost authorization.

Status:

Needs Attention

Explanation:

"This connection needs to be reauthorized."

Primary Action:

Reconnect

---

# Export Error

Headline:

"Export couldn't be completed."

Body:

"Please try again in a few minutes."

Retry button available.

---

# Subscription Error

Headline:

"We couldn't update your subscription."

Current plan remains unchanged.

No partial state is shown.

---

# Editing Interactions

Editing should feel immediate.

Simple settings save automatically.

Complex settings use explicit save actions.

---

## Inline Editing

Examples:

Notification toggles

Theme

Motion

Language

Behavior:

Change

↓

Optimistic update

↓

Save

↓

Success checkmark

---

## Form Editing

Examples:

Profile

Address

Password

Billing

Changes remain local until Save is selected.

---

## Dirty State

Unsaved changes display:

Small banner

"Unsaved changes"

Buttons:

Discard

Save

---

## Save Success

Inline confirmation:

Green checkmark

"Saved"

Visible for two seconds.

---

## Undo

Available for reversible actions.

Toast:

"Notification preference updated."

Undo

Duration:

Eight seconds.

---

# Confirmation Dialogs

Confirmation should be reserved for meaningful or destructive actions.

---

## Requires Confirmation

Delete account

Delete exported file

Disconnect service

Cancel subscription

Reset AI preferences

Reset accessibility preferences

Remove trusted device

Sign out all sessions

---

## Does Not Require Confirmation

Theme changes

Notification changes

Language

Appearance

Search

Navigation

Opening cards

---

# Modal Specification

Maximum width:

560px

Corner radius:

24px

Background blur:

Enabled

Entrance:

Fade and slight scale

Exit:

Fade

---

## Delete Account Modal

Title:

Delete Your Account?

Body:

"This permanently removes your account and relationship data."

Confirmation requires:

Password

Typed confirmation phrase

Buttons:

Cancel

Delete Account

---

## Cancel Subscription Modal

Title:

Cancel Subscription?

Body:

Explains:

Plan expiration

Future access

Data retention

Buttons:

Keep Subscription

Cancel Plan

---

# Animations

Animation reinforces confidence.

Never decoration.

---

## Card Expansion

Duration:

220ms

Ease:

Ease Out

---

## Toggle

Thumb slides.

Background transitions.

Success pulse.

---

## Navigation

Active indicator glides smoothly.

Duration:

180ms

---

## Search Results

Fade and slide upward.

Duration:

150ms

---

## Save Success

Small checkmark appears.

Fades naturally.

---

## Theme Transition

Theme changes crossfade.

Avoid flashing.

Duration:

250ms

---

# Microinteractions

Every successful interaction receives subtle acknowledgement.

---

## Buttons

Hover:

Slight elevation.

Press:

Compress slightly.

---

## Switches

Background morphs.

Thumb slides.

Tiny success pulse.

---

## Cards

Hover:

Shadow increases.

No scaling.

---

## Search

Matching text highlights.

Results update fluidly.

---

## Navigation

Active section smoothly transitions.

Previous section fades.

---

## Connected Services

Successful reconnection displays:

Checkmark

Status animation

Updated timestamp

---

# Keyboard Behavior

Entire Settings experience must be fully keyboard accessible.

---

## Navigation

Tab follows visual hierarchy.

Arrow keys navigate category navigation.

Enter activates.

Escape closes dialogs.

---

## Forms

Standard keyboard behavior maintained.

No custom shortcuts override browser expectations.

---

## Search

Typing searches immediately.

Arrow keys navigate results.

Enter opens selected result.

Escape clears search.

---

## Modals

Focus trap enabled.

Focus returns to originating control after closing.

---

# Accessibility Requirements

Target:

WCAG 2.2 AA

---

## Labels

Every control has:

Visible label

Accessible label

Associated description

---

## Color

Never rely on color alone.

Icons and text accompany every status.

---

## Contrast

Normal text:

4.5:1 minimum.

Large text:

3:1 minimum.

---

## Touch Targets

Minimum:

48 × 48 pixels.

---

## Motion

Reduced Motion preference disables:

Large transitions

Scaling

Animated previews

Simple fades remain.

---

# Analytics Events

Track meaningful interactions only.

Never record sensitive user data.

---

## General Events

```

settings_opened

settings_search

settings_category_viewed

settings_saved

```

---

## Account Events

```

profile_updated

email_changed

phone_updated

address_updated

```

---

## Billing Events

```

subscription_upgraded

subscription_downgraded

payment_method_updated

invoice_downloaded

```

---

## Security Events

```

password_changed

two_factor_enabled

two_factor_disabled

trusted_device_removed

```

---

## Privacy Events

```

data_export_requested

relationship_data_deleted

account_deletion_started

```

---

## AI Events

```

ai_preference_updated

writing_style_changed

creativity_changed

```

---

# API Data Mapping

This specification preserves all existing backend contracts.

The frontend introduces presentation models only.

No business logic migrates into the client.

---

## Account

Maps existing account endpoints.

---

## Billing

Maps existing Stripe integration.

No billing calculations occur in the frontend.

---

## Notifications

Maps existing notification preference endpoints.

---

## Security

Maps existing authentication and session endpoints.

---

## Connected Services

Maps existing integration APIs.

Connection health is presentation only.

---

## AI Preferences

Maps existing preference storage.

Frontend is responsible only for rendering and validation.

---

# Performance Considerations

Target perceived load:

Under 1.5 seconds.

---

## Progressive Loading

Header

↓

Navigation

↓

Visible category

↓

Remaining categories

---

## Lazy Loading

Help content

Legal documents

Invoice history

Large export history

Connected service details

Only loaded when opened.

---

## Optimistic Updates

Used for:

Theme

Notifications

Appearance

Accessibility

Language

Undo supported whenever appropriate.

---

# Acceptance Criteria

The Settings experience is complete when:

Users can find any setting in seconds.

Search reliably locates settings.

Account, billing, privacy, and security feel trustworthy.

AI preferences are understandable.

Personalization remains approachable.

Accessibility requirements are fully satisfied.

Responsive layouts function correctly on desktop, tablet, and mobile.

No existing backend behavior changes.

---

# Definition of Done

The Settings experience is complete when it no longer feels like a software configuration page.

Instead, it feels like the control center for a premium Relationship Concierge.

Users understand what information F.I. Forgot knows, why it knows it, how it protects that information, and how to personalize the concierge without feeling overwhelmed.

Every setting is discoverable, understandable, and confidently editable.

The experience reinforces trust, clarity, and control while remaining calm, elegant, and unmistakably premium.