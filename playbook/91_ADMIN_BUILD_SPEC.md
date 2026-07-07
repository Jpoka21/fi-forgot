# 91_ADMIN_BUILD_[SPEC.md](http://SPEC.md)

# Admin Build Specification

---

# Purpose

The Admin application exists to operate, monitor, maintain, and continuously improve the F.I. Forgot platform.

It is **not** an internal developer console.

It is **not** a collection of disconnected CRUD screens.

It is the operational headquarters of a premium Relationship Concierge service.

Every screen should allow administrators to answer questions such as:

* Is every customer receiving an exceptional experience?

* Is Autopilot behaving correctly?

* Are cards being generated successfully?

* Are handwritten orders flowing correctly?

* Is AI producing high quality drafts?

* Are subscriptions healthy?

* Are reminders being delivered?

* Are there users who need assistance?

* Is the platform healthy?

Every page exists to reduce operational friction while making problems immediately obvious.

---

# Philosophy

The admin experience should feel like operating a premium concierge company.

Never cluttered.

Never technical.

Never overwhelming.

Instead, it should feel calm, deliberate, and trustworthy.

Administrators spend many hours inside this interface.

Visual fatigue should be minimized.

Information density should be high without appearing crowded.

Every screen should answer three questions within seconds:

**What needs attention?**

**What changed recently?**

**What should I do next?**

---

# Core Principles

## Surface problems before data

The interface should elevate issues before statistics.

Incorrect AI output matters more than total cards generated.

Failed orders matter more than successful orders.

Support tickets matter more than total users.

---

## Prioritize action

Every dashboard widget should answer:

"What can I do?"

Not merely:

"What happened?"

---

## Progressive disclosure

Show summaries first.

Expand into details only when requested.

Avoid giant data tables as the primary experience.

---

## Consistency

Every management screen follows the same pattern.

Header

Summary

Filters

Primary content

Detail panel

Actions

History

This consistency dramatically reduces cognitive load.

---

## Safety

Administrative actions often have irreversible consequences.

Dangerous operations always require confirmation.

Bulk destructive actions require secondary confirmation.

Critical changes are permanently logged.

---

# Users of the Admin System

## Customer Support

Primary goals:

* Help customers

* Review accounts

* Reset onboarding

* Review cards

* View subscriptions

* Investigate issues

---

## Operations

Primary goals:

* Monitor card generation

* Review queues

* Monitor Handwrytten

* Review deliveries

* Handle failures

---

## AI Team

Primary goals:

* Review AI quality

* Inspect prompts

* Monitor generation health

* Review rejected drafts

* Improve prompts

---

## Product Team

Primary goals:

* Observe adoption

* Review metrics

* Monitor engagement

* Analyze usage

---

## Engineering

Primary goals:

* Monitor APIs

* Review logs

* Investigate failures

* Observe performance

* Feature flags

---

## Executive Team

Primary goals:

* Revenue

* Growth

* Retention

* Concierge quality

* Customer happiness

---

# Overall Information Architecture

```text

Dashboard

Users

    All Users

    New Users

    Active Users

    Inactive Users

Relationships

    People

    Timeline

    Memories

    Health

Cards

    Draft Queue

    Generated

    Scheduled

    Sent

    Failed

Orders

    Handwrytten

    Shipping

    Delivery

Subscriptions

Billing

Coupons

AI

    Prompt Library

    Prompt Versions

    Draft Review

    AI Health

Images

Occasions

Support

Analytics

Monitoring

    Jobs

    Queues

    Errors

    APIs

Settings

Audit Logs

```

Navigation depth should never exceed three levels.

---

# Layout Philosophy

Every admin page follows one universal layout.

This dramatically reduces learning time.

```text

Top Bar

Left Navigation

Page Header

Summary Cards

Toolbar

Primary Content

Detail Drawer

Footer Status

```

Nothing deviates from this pattern.

---

# Desktop Layout

Minimum width:

1440 px

Ideal width:

1600 to 1920 px

Maximum readable content width:

Never constrained.

Administrators benefit from wider layouts.

---

## Page Padding

Left

32 px

Right

32 px

Top

28 px

Bottom

40 px

---

## Grid

12 column grid

24 px gutters

Content aligns across all pages.

---

# Left Navigation

Width

272 px

Fixed

Full height

Scrollable independently.

Navigation background:

Warm white.

Subtle divider on right.

No heavy shadows.

Sections:

* Dashboard

* Users

* Relationships

* Cards

* Orders

* Subscriptions

* Billing

* AI

* Images

* Occasions

* Support

* Analytics

* Monitoring

* Settings

* Audit Logs

Active item:

* Soft brand background

* Bold text

* Small left accent bar

* Rounded corners

Hover:

* Soft elevation

* Background tint

* Pointer cursor

* 100 ms transition

Collapsed mode:

Width: 72 px

Icons only

Tooltips on hover

Smooth width animation

200 ms

---

# Top Navigation Bar

Height

72 px

Sticky

Always visible.

Contains:

* Search

* Environment badge

* Notifications

* Queue health

* Current admin

* Profile menu

Search:

Centered

Maximum width:

480 px

Rounded search field

Instant results

Keyboard shortcut:

`/`

Focuses search immediately.

Environment badge:

* Production

* Staging

* Development

Clearly color coded.

Production uses a subtle red outline.

Notification Center:

Bell icon

Unread badge

Shows:

* Failed jobs

* Support requests

* Failed cards

* Failed orders

* AI alerts

* Stripe alerts

Queue Health Indicator:

Small horizontal pill.

* Green = Healthy

* Yellow = Warning

* Red = Critical

Clicking opens Monitoring.

Profile Menu:

* Avatar

* Name

* Role

* Environment

* Sign Out

---

# Page Header

Consistent across every screen.

Contains:

* Title

* Description

* Breadcrumbs

* Primary actions

* Secondary actions

Example:

```text

Users

Manage customer accounts, subscriptions, and relationship activity.

Home / Users

[Export]

[Create User]

```

Title:

32 px

Semibold

Description:

16 px

Muted gray

Maximum width:

720 px

Primary action:

Filled button

Brand color

Secondary action:

Outlined button

---

# Summary Card Row

Displayed directly below header.

Four to six cards.

Height:

120 px

Gap:

20 px

Cards are equal width.

Example:

* Total Users

* New This Week

* Active Today

* Autopilot Enabled

* Cards Sent

* Support Tickets

Each card contains:

* Label

* Primary value

* Trend indicator

* Mini sparkline

* Optional alert badge

Card padding:

24 px

Border radius:

20 px

Hover lift:

2 px

Clicking a card automatically filters the page.

---

# Toolbar Layout

Appears below summary cards.

Contains:

* Search

* Filters

* Sort

* View selector

* Bulk actions

* Export

Height:

64 px

Layout:

Left:

* Search

* Filters

Center:

* Optional contextual controls

Right:

* Actions

Toolbar remains sticky while scrolling large datasets.

---

# Primary Content Area

The main workspace changes depending on page type.

Supported layouts:

* Large data table

* Kanban queue

* Timeline

* Card grid

* Analytics dashboard

* Split view

* Inspector layout

* Calendar

* Gallery

Every layout shares:

* Consistent spacing

* Consistent typography

* Consistent interactions

---

# Right Detail Drawer

Instead of navigating away from the current page, selecting an item opens a detail drawer.

Width:

520 px

Slides in from the right.

Background behind the drawer receives a subtle blur.

Contains:

* Overview

* History

* Actions

* Activity

* Related records

* Quick edit

Administrators should rarely lose context while working.

---

# Footer Status Bar

Persistent across the application.

Height:

32 px

Displays:

* API latency

* Queue health

* Background job status

* Current environment

* Application version

* Current administrator

* Last refresh time

Uses muted typography and never distracts from primary content.

---

# Responsive Layout Specifications

## Ultra Wide

Above 1800 px

* Summary cards expand.

* Tables display additional columns.

* Detail drawer expands to 600 px.

---

## Standard Desktop

1440 px to 1800 px

Default experience.

---

## Narrow Desktop

1200 px to 1439 px

* Navigation automatically collapses.

* Summary cards wrap into two rows.

* Secondary toolbar actions move into an overflow menu.

---

## Tablet

Supported primarily for viewing.

Editing capabilities are intentionally limited.

* Navigation becomes an overlay.

* Detail drawer becomes full screen.

* Complex tables become stacked cards.

---

## Mobile

The Admin application is not intended for full operational use on phones.

Supported capabilities:

* View alerts

* View dashboards

* Approve urgent actions

* View support tickets

Unsupported capabilities:

* Bulk editing

* Large data table management

* Complex administrative workflows



# Admin Authentication

The administrative application exists behind a completely separate authentication boundary from the customer application.

An authenticated customer should never be capable of navigating directly into the Admin interface.

Administrative authentication uses dedicated routes, dedicated authorization middleware, dedicated session validation, and independent access policies.

Example:

```

[app.fiforgot.com](http://app.fiforgot.com)

```

Customer application.

```

[admin.fiforgot.com](http://admin.fiforgot.com)

```

Administrative application.

Authentication should never rely solely on hidden routes.

Administrative endpoints must validate permissions on every request.

---

# Authentication Philosophy

The Admin portal protects customer information, payment data, AI systems, and operational controls.

Convenience is never prioritized above security.

Administrative friction should be low for authorized employees while remaining extremely difficult for unauthorized users.

---

# Login Screen

Simple.

Professional.

No marketing.

Centered authentication card.

Maximum width:

480 px

Contents:

Logo

"F.I. Forgot Admin"

Email field

Password field

Remember this device checkbox

Sign In button

Forgot Password link

Support contact

Environment badge

Footer version number

---

## Password Field

Supports:

Reveal password

Caps Lock warning

Paste

Password managers

Browser autofill

Enter submits form

---

## Login Validation

Inline validation appears immediately.

Examples:

Invalid email

Required password

Incorrect credentials

Locked account

Expired password

MFA required

Session expired

Account disabled

---

## Failed Login Behavior

After five consecutive failed attempts:

Display generic error.

Do not reveal whether account exists.

Temporarily lock authentication.

Log security event.

Notify security monitoring.

---

# Multi Factor Authentication

Required for every administrator.

Cannot be disabled.

Supported methods:

Authenticator application

Hardware security key

Recovery codes

SMS is not recommended except as emergency recovery.

---

## First Time MFA Setup

After first successful login:

Display QR code.

Verify one generated code.

Generate recovery codes.

Require download before continuing.

Cannot skip.

---

## Recovery Codes

Ten single use codes.

Displayed only once.

Administrator acknowledges storage.

Codes may be regenerated.

Old codes immediately expire.

---

# Session Management

Session timeout:

12 hours

Idle timeout:

30 minutes

Five minutes before expiration:

Banner appears.

"Your session expires in 5 minutes."

Buttons:

Stay Signed In

Sign Out

---

## Concurrent Sessions

Allowed.

Every session displayed inside profile.

Information shown:

Device

Browser

Operating System

Approximate Location

IP Address

Created

Last Active

Administrators may revoke any session.

Current session cannot revoke itself accidentally.

---

## Remember Device

Only suppresses repeated MFA.

Does not bypass authentication.

Duration:

30 days

---

# Password Requirements

Minimum:

16 characters

Must include:

Uppercase

Lowercase

Number

Special character

Cannot match previous twelve passwords.

Cannot contain email address.

Cannot contain administrator name.

Checked against compromised password databases before acceptance.

---

# Password Expiration

Passwords expire every 180 days.

Reminder:

30 days

14 days

7 days

1 day

Expired passwords require immediate reset.

---

# Password Reset

Request by email.

Secure single use token.

Expiration:

30 minutes.

Successful reset immediately invalidates all active sessions.

---

# Authorization Model

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to do?

Every API request validates permissions.

Frontend visibility never replaces backend authorization.

---

# Role Based Permissions

The platform uses role based access control.

Permissions are inherited through roles.

Individual overrides should be extremely rare.

---

# Default Roles

Super Administrator

Administrator

Support

Operations

AI Operations

Finance

Read Only

Developer

Custom

---

# Super Administrator

Complete access.

May:

Manage administrators

Delete users

Manage billing

Manage prompts

Manage feature flags

Modify production settings

Export data

Manage roles

View audit logs

Restore deleted records

Dangerous actions require confirmation.

---

# Administrator

Almost complete operational access.

Cannot:

Delete audit logs

Modify Super Administrators

Change security policies

Delete production data

---

# Support

Primary permissions:

View users

Edit user profile

View subscriptions

View cards

View relationships

Reset onboarding

Resend verification emails

Generate support links

Cannot:

Delete users

Modify billing

Modify prompts

Modify production configuration

---

# Operations

Primary permissions:

Orders

Handwrytten

Queues

Shipping

Card processing

Retry jobs

Cancel jobs

View monitoring

Cannot:

Modify users

Modify billing

Modify AI prompts

---

# AI Operations

Primary permissions:

Prompt management

Prompt versions

Draft review

AI health

Generation queues

Testing

Evaluation

Cannot:

Manage billing

Delete customers

Manage subscriptions

---

# Finance

Primary permissions:

Stripe

Refunds

Invoices

Subscriptions

Coupons

Revenue

Exports

Cannot:

Modify prompts

Manage AI

Delete users

---

# Read Only

Complete visibility.

No modifications.

No destructive actions.

Perfect for executives.

---

# Developer

Focused on system health.

Permissions:

Logs

Monitoring

Jobs

Errors

Queues

Feature flags

Configuration

Cannot:

View payment methods

Issue refunds

Delete users

---

# Custom Roles

Organizations may create custom roles.

Permissions assigned individually.

Permission editor uses grouped categories.

Users

Relationships

Cards

Billing

AI

Monitoring

Analytics

Configuration

Audit

Each permission clearly describes capabilities.

---

# Permission Matrix

Permissions are additive.

Examples:

View Users

Create Users

Edit Users

Suspend Users

Delete Users

Export Users

View Billing

Issue Refunds

Manage Coupons

View AI

Manage Prompts

Approve Prompt Versions

View Monitoring

Retry Jobs

Feature Flags

Manage Configuration

Every permission has:

Name

Description

Risk Level

Affected Resources

---

# Security Model

Every administrative action produces an audit event.

Examples:

User viewed

User edited

Refund issued

Prompt changed

Feature enabled

Order canceled

Subscription modified

Administrator invited

Administrator removed

Role changed

Every event includes:

Administrator

Timestamp

Affected object

Action

Previous values

New values

IP address

Device

Session

Correlation ID

---

# Sensitive Operations

Require secondary confirmation.

Examples:

Delete User

Delete Prompt

Issue Refund

Disable Subscription

Cancel Order

Delete Card

Reset AI

Rotate Secrets

Enable Experimental Features

Confirmation dialog includes:

Action

Impact

Affected records

Permanent warning

Confirmation input

Example:

Type:

DELETE

to continue.

---

# Administrative Invitations

Only Super Administrators may invite administrators.

Invitation flow:

Enter email.

Assign role.

Optional expiration.

Send invitation.

Invitation email includes:

Organization

Role

Expiration

Accept button

Invitation expires after seven days.

---

# Administrator Profile

Displays:

Name

Email

Role

Department

Phone

Last Login

Last MFA

Status

Sessions

Audit History

Permissions

Recent Activity

---

# Global Navigation Behavior

The left navigation remains fixed while moving throughout the application.

Expanded groups preserve their state between sessions.

Recently visited pages appear at the top of the navigation for quick return.

Favorites may be pinned by each administrator.

Pinned items always appear directly beneath Dashboard.

Navigation includes badges for sections requiring attention.

Examples:

Support (4)

Orders (2)

Monitoring (1)

Badge colors:

Gray

Informational

Blue

New activity

Yellow

Needs review

Red

Immediate attention

---

# Keyboard Navigation

Navigation is fully keyboard accessible.

Arrow keys move through navigation.

Enter opens section.

Escape closes overlays.

Tab order is logical and predictable.

Focus indicators remain visible at all times.

---

# Global Search

Search is available from every page.

Shortcut:

/

Searches:

Users

Recipients

Cards

Orders

Subscriptions

Prompts

Images

Occasions

Support Tickets

Audit Logs

Results appear within 150 milliseconds when cached.

Grouped by category.

Supports fuzzy matching.

Supports keyboard navigation.

Recent searches are remembered per administrator.

---

# Admin Dashboard

The Dashboard is the operational command center.

It answers one question immediately:

**"Is the platform healthy?"**

Everything else is secondary.

Administrators should understand platform status within five seconds of opening the dashboard.

---

# Dashboard Layout

Vertical order:

Page Header

Platform Health Banner

Key KPI Cards

Operational Alerts

Activity Feed

Queue Status

Charts

Recent Events

Quick Actions

Footer Status

No scrolling should be required on a standard 1440 pixel display to understand platform health.

---

# Platform Health Banner

Always displayed at the top.

Possible states:

Healthy

Warning

Critical

Healthy:

Green accent.

"All systems operating normally."

Warning:

Yellow accent.

Summarizes outstanding issues.

Critical:

Red accent.

Explains the highest priority issue first.

Provides a direct action button.

---

# Dashboard KPI Cards

First row contains six primary metrics.

Total Users

Active Users Today

Cards Generated Today

Cards Sent Today

Open Support Issues

Monthly Recurring Revenue

Each KPI card includes:

Title

Primary value

Percentage change

Mini sparkline

Comparison period

Click action

Hover tooltip

---

# Dashboard KPI Cards

Each KPI card follows a consistent visual structure.

Card Width:

Responsive

Minimum:

220 px

Height:

120 px

Padding:

24 px

Border Radius:

20 px

Hover Elevation:

2 px

Transition:

150 ms ease

Each card contains:

* Label

* Primary Value

* Trend Indicator

* Comparison Period

* Mini Sparkline

* Optional Status Badge

Trend indicators:

Green

Positive

Gray

Neutral

Red

Negative

Hovering a KPI card displays:

Calculation method

Last updated timestamp

Data source

Clicking a KPI filters the appropriate management screen.

---

# Dashboard Alerts Panel

Displayed directly beneath KPI cards.

Alerts are ordered by severity.

Critical

High

Medium

Low

Each alert contains:

Severity icon

Title

Description

Affected objects

Timestamp

Assigned owner

Primary action

Secondary action

Example:

Critical

Handwrytten API is unavailable.

247 pending orders are waiting to be submitted.

[View Queue]

[Retry]

Dismissal is not allowed for unresolved critical alerts.

Resolved alerts automatically disappear.

---

# Quick Actions Panel

Located beside Alerts on desktop.

Contains the most common administrative actions.

Default actions:

Create User

Issue Refund

Review AI Queue

Retry Failed Jobs

View Support Tickets

Upload Images

Manage Feature Flags

Actions may be customized per administrator.

---

# Recent Activity Feed

Displays live operational activity.

Newest items appear first.

Each activity card contains:

Icon

Title

Description

Administrator

Timestamp

Related object

Status

Example:

Jane Smith updated subscription for James Miller.

2 minutes ago

Opened by clicking the activity.

Infinite scrolling is supported.

Activity auto refreshes every 30 seconds.

---

# Queue Health Widget

Displays every background processing queue.

Examples:

Card Generation

AI Draft Queue

Reminder Queue

Email Queue

Handwrytten Queue

Notification Queue

Webhook Queue

For each queue display:

Pending

Running

Succeeded Today

Failed Today

Oldest Job

Average Processing Time

Queue status uses:

Green

Healthy

Yellow

Delayed

Red

Blocked

Clicking opens Queue Monitoring.

---

# AI Health Widget

Displays overall AI performance.

Metrics include:

Generation Success Rate

Average Draft Time

Average Personalization Score

Retry Rate

Prompt Failures

OpenAI API Latency

Fallback Usage

Prompt Version

Each metric links directly to AI Monitoring.

---

# Revenue Snapshot

Displays business health.

Metrics:

Monthly Recurring Revenue

New Subscribers

Churn

Average Revenue Per User

Refunds

Trials

Conversion Rate

Comparison:

Yesterday

Last Week

Last Month

Last Year

Charts use subtle animations only.

---

# Customer Health Widget

Shows relationship quality across the platform.

Metrics:

Relationships Created

Average Relationship Health

Memories Added

Autopilot Enabled

Cards Scheduled

Cards Sent

Support Tickets

Provides insight into customer engagement.

---

# Support Widget

Displays support workload.

Metrics:

Open Tickets

Waiting on Customer

Waiting on Support

Average First Response

Average Resolution Time

Escalated Cases

Clicking opens Support Management.

---

# Monitoring Widget

Displays operational status.

Shows:

API Availability

Database

Redis

Worker Processes

Stripe

Handwrytten

Email Provider

OpenAI

Green indicates healthy.

Yellow indicates degraded.

Red indicates unavailable.

---

# Dashboard Charts

Charts always prioritize readability.

Supported charts:

Line

Bar

Area

Donut

Stacked Bar

Heat Map

No pie charts except simple proportional summaries.

Animations should complete within 300 ms.

---

# Refresh Behavior

Dashboard refreshes automatically every 60 seconds.

Manual refresh button available.

Last updated timestamp shown beneath page title.

Only changed widgets animate during refresh.

---

# Empty Dashboard States

If a widget contains no information:

Display illustration.

Explain why.

Suggest next action.

Never display blank panels.

---

# User Management

The User Management section serves as the central hub for customer administration.

Primary goals:

Locate users quickly.

Understand account health.

Assist customers.

Review activity.

Resolve issues.

Never overwhelm support representatives.

---

# User List Layout

Primary layout:

Large virtualized table.

Columns:

Avatar

Full Name

Email

Plan

Autopilot

Relationships

Cards Sent

Subscription

Last Active

Created

Status

Actions

Default sort:

Most recently active.

Resizable columns supported.

Columns may be hidden.

Column preferences persist.

---

# User Search

Searches:

Name

Email

User ID

Recipient Name

Phone Number

Order Number

Subscription ID

Supports fuzzy matching.

Instant search begins after two characters.

---

# User Filters

Plan

Status

Autopilot

Subscription

Cards Sent

Relationship Count

Created Date

Last Active

Country

State

Support Status

Multiple filters may be combined.

Filter presets may be saved.

---

# User Status

Possible states:

Active

Inactive

Trial

Canceled

Suspended

Deleted

Pending Verification

Badges use consistent colors throughout the application.

---

# User Detail Drawer

Selecting a user opens the detail drawer.

Never forces navigation away from the list.

Sections:

Overview

Subscription

Relationships

Cards

Timeline

Support

Activity

Billing

Devices

Audit History

---

# User Overview

Displays:

Avatar

Name

Email

Phone

Account ID

Plan

Subscription Status

Autopilot Status

Relationship Count

Card Count

Member Since

Last Active

Current Session

Support Tier

---

# Quick Actions

Support representatives may perform:

Reset Password

Verify Email

Resend Welcome Email

Disable Autopilot

Pause Subscription

Resume Subscription

Issue Credit

Create Support Ticket

Impersonate Session

Suspend Account

Delete Account

Dangerous actions require confirmation.

---

# Impersonation Mode

Available only to authorized administrators.

Purpose:

Diagnose customer issues.

Behavior:

Administrator enters customer session.

Banner appears across top:

"You are viewing this account as Support."

Administrator actions remain logged separately.

Impersonation automatically expires after thirty minutes.

No payment methods are exposed.

Sensitive actions remain restricted.

---

# User Timeline

Displays chronological activity.

Examples:

Account Created

Recipient Added

Memory Logged

Card Generated

Card Edited

Card Ordered

Subscription Changed

Autopilot Enabled

Support Ticket Created

Events support filtering by category.

Timeline scrolls infinitely.

---

# Devices

Displays known login sessions.

Fields:

Browser

Operating System

Device Type

Location

Last Active

Current Session

Support may revoke sessions individually.

---

# Account Flags

Visible near the top of the drawer.

Possible flags:

High Value Customer

VIP

Chargeback

Frequent Refunds

Support Escalation

Internal Account

Beta Tester

Flags are color coded.

Hover displays explanation.

---

# Bulk User Actions

Supporting large scale administration.

Available actions:

Export

Assign Tag

Send Email

Suspend

Resume

Enable Feature

Disable Feature

Add Internal Note

Every bulk action displays:

Affected users

Estimated impact

Confirmation dialog

Progress indicator

Completion summary

Undo is available whenever technically possible.



# User Notes

Internal notes provide context for future support interactions.

Notes are never visible to customers.

Each note contains:

Author

Timestamp

Category

Body

Optional attachments

Categories:

General

Billing

Technical

AI

Relationship

Escalation

Fraud

Notes are searchable.

Pinned notes always appear first.

---

# Internal Tags

Administrators may assign internal tags to users.

Examples:

VIP

Needs Follow Up

High Touch

Beta Tester

Enterprise

Refund Risk

Frequent Traveler

Relationship Power User

Tags appear beside the user's name throughout the Admin application.

Tag colors remain consistent across every screen.

---

# Customer Communication History

Every outbound communication is visible.

Includes:

Welcome emails

Reminder emails

Verification emails

Password reset emails

Support responses

Card notifications

Billing emails

Push notifications

SMS messages

Each communication contains:

Channel

Status

Opened

Clicked

Delivered

Failed

Timestamp

Administrator initiated communications include the initiating administrator.

---

# Relationship Administration

The Relationship Administration section provides visibility into every relationship stored within the platform.

Administrators can:

View

Search

Filter

Review health

Investigate issues

Assist customers

Relationships are never edited directly unless required for customer support.

---

# Relationship List

Columns:

Recipient

Owner

Relationship Type

Health Score

Upcoming Occasion

Last Memory

Autopilot

Cards Sent

Created

Status

Actions

Default sorting:

Upcoming Occasion

---

# Relationship Detail Drawer

Contains:

Overview

Timeline

Memories

Events

Cards

AI Profile

Relationship Health

Activity

Audit History

Quick Actions

---

# Relationship Overview

Displays:

Recipient photo

Recipient name

Relationship type

Owner

Birthday

Anniversary

Preferred tone

Relationship Health

Autopilot status

Current follow up schedule

Last interaction

Next scheduled event

---

# Relationship Health

Displays the calculated Relationship Health score.

Includes contributing factors:

Recent memories

Profile completeness

Fresh updates

Card frequency

AI confidence

Upcoming occasions

Health visualization includes:

Numeric score

Trend

Historical graph

Recommendations

Administrators cannot edit the score directly.

---

# Relationship Timeline Administration

Timeline displays every significant event in chronological order.

Supported events:

Relationship created

Memory added

Memory edited

Fresh update completed

AI question answered

Occasion created

Card generated

Card edited

Card ordered

Card delivered

Support action

Timeline filters:

Cards

Memories

Support

AI

Autopilot

Billing

System

Search is available within the timeline.

---

# Memory Administration

Displays all stored memories.

Each memory contains:

Title

Summary

Created date

Author

Source

Confidence

Related card count

Last referenced

Administrators may:

Edit

Archive

Merge duplicates

Restore archived memories

Deleting memories requires elevated permissions.

---

# Recipient Administration

Recipient administration focuses on the people customers care about.

Recipient records remain separate from customer accounts.

---

# Recipient List

Columns:

Photo

Recipient Name

Owner

Relationship

Birthday

Next Occasion

Cards Received

Autopilot

Health

Status

Actions

Supports virtual scrolling.

---

# Recipient Detail Drawer

Sections:

Overview

Occasions

Timeline

Cards

Memories

AI Profile

Delivery Preferences

Audit History

---

# Recipient Overview

Displays:

Photo

Name

Nickname

Relationship

Birthday

Anniversary

Address

Phone

Email

Interests

Favorite memories

Important dates

Preferred writing style

Things to avoid

Profile completion percentage

---

# Recipient Profile Completeness

Displays progress ring.

Calculated from:

Core profile

Personal interests

Relationship details

Recent updates

Memories

Delivery information

AI briefing quality

Hovering displays missing information.

---

# Recipient Occasions

Displays every scheduled occasion.

Birthday

Anniversary

Mother's Day

Father's Day

Christmas

Valentine's Day

Graduation

Custom occasions

Each row displays:

Occasion

Date

Autopilot

Last Card

Next Card

Status

Administrators may manually regenerate schedules when required.

---

# Recipient Delivery Information

Displays:

Primary address

Address verification status

Country

State

Postal code

Handwrytten validation status

Previous deliveries

Delivery success rate

Address changes are fully audited.

---

# Card Administration

Card Administration provides complete visibility into every generated card.

Primary goals:

Review

Search

Approve

Investigate

Monitor

Recover failures

---

# Card List

Columns:

Preview

Recipient

Customer

Occasion

Generation Status

Order Status

AI Version

Created

Scheduled

Sent

Actions

Preview images load lazily.

---

# Card Detail Drawer

Contains:

Preview

Draft

Prompt Summary

Generation History

Edits

Order Status

Timeline

Audit History

Actions

---

# Card Preview

Large rendered image.

Front

Inside left

Inside right

Back

Zoom supported.

High resolution preview available.

---

# Card Draft

Displays:

Original AI draft

Edited version

Final submitted version

Differences are highlighted.

Administrators can compare versions side by side.

---

# Card Status

Possible values:

Draft

Waiting Review

Ready

Scheduled

Ordered

Printing

Shipped

Delivered

Canceled

Failed

Every status includes:

Timestamp

Administrator

Trigger

Reason

---

# Card Actions

Available actions depend on permissions.

Examples:

Regenerate Draft

Regenerate Image

Cancel Order

Duplicate Card

Download PDF

Retry Submission

View Timeline

Open Customer

Open Recipient

Every action is logged.

---

# Card Search

Supports searching by:

Recipient

Customer

Occasion

Card ID

Order ID

Tracking Number

Prompt Version

AI Model

Date Range

Search results update instantly.

---

# Card Filters

Occasion

Status

Autopilot

AI Version

Prompt Version

Delivery Status

Created Date

Scheduled Date

Customer Plan

Multiple filters may be combined.

Saved filter presets are supported.



# AI Draft Review

The AI Draft Review workspace is the primary environment for evaluating AI generated content before and after delivery.

Its purpose is to:

Improve writing quality

Identify failures

Detect prompt regressions

Monitor personalization

Validate tone

Measure AI performance over time

The interface should support reviewing hundreds of drafts efficiently without feeling overwhelming.

---

# AI Draft Review Layout

Layout uses a three panel design.

Left Panel

Draft Queue

Center Panel

Draft Preview

Right Panel

Metadata and Actions

Panels may be resized by dragging dividers.

Panel widths persist between sessions.

---

# Draft Queue

Displays every generated draft awaiting review.

Columns:

Recipient

Customer

Occasion

Generation Time

AI Model

Prompt Version

Confidence Score

Personalization Score

Status

Sort options:

Newest

Oldest

Lowest Confidence

Highest Confidence

Longest Generation Time

Most Edited

---

# Draft Preview

Displays the complete generated message exactly as seen by the customer.

Sections:

Greeting

Opening

Body

Closing

Signature

Formatting matches the customer experience.

All personalization highlights may be toggled on or off.

---

# Personalization Highlighting

When enabled, every personalized element is visually identified.

Examples:

Recent memories

Inside jokes

Names

Interests

Life events

Relationship milestones

Hovering a highlighted section explains where the information originated.

Example:

"Derived from Fresh Update submitted 18 days ago."

---

# Draft Metadata

Displayed in the right panel.

Includes:

Customer

Recipient

Occasion

Relationship Type

Relationship Health

Prompt Version

AI Model

Generation Duration

Token Usage

Confidence Score

Personalization Score

Reading Level

Word Count

Created Timestamp

---

# Draft Confidence Score

Represents the AI pipeline's confidence that the generated message satisfies internal quality requirements.

Displayed as:

Numeric score

Color indicator

Trend

Confidence ranges:

95 to 100

Excellent

85 to 94

Good

70 to 84

Needs Review

Below 70

Requires Attention

Administrators cannot edit the score directly.

---

# Personalization Score

Measures how well the draft incorporates recipient specific information.

Factors include:

Relevant memories

Current life updates

Relationship history

Writing tone

Avoided phrases

Personal references

Visualization includes:

Overall score

Breakdown by category

Historical trend

---

# Draft Comparison

Administrators may compare:

Original Draft

Edited Draft

Final Sent Version

Changes are displayed using side by side comparison.

Added text appears highlighted.

Removed text appears struck through.

Unchanged paragraphs remain collapsed by default.

---

# AI Feedback

Reviewers may leave structured feedback.

Categories:

Excellent

Too Generic

Too Formal

Too Casual

Incorrect Facts

Weak Personalization

Grammar

Tone

Hallucination

Duplicate Content

Custom

Feedback contributes to future prompt evaluation dashboards.

---

# AI Review Status

Each draft may be marked as:

Approved

Needs Improvement

Rejected

Escalated

Reviewed

Status history remains permanently stored.

---

# AI Prompt Management

Prompt management controls the instructions used throughout the AI pipeline.

Prompt editing should be deliberate and highly controlled.

Production prompts are never edited directly.

---

# Prompt Library

Displays every prompt currently used within the platform.

Examples:

Birthday

Anniversary

Christmas

Mother's Day

Father's Day

Sympathy

Graduation

Wedding

Just Because

Recipient Briefing

Relationship Summary

Fresh Update Questions

Profile Questions

Card Quality Evaluation

---

# Prompt List

Columns:

Prompt Name

Category

Version

Status

Created

Author

Production

Last Modified

Actions

---

# Prompt Detail

Displays:

Prompt Name

Purpose

Current Version

Status

Description

Dependencies

Linked Workflows

Variables

Prompt Text

Evaluation History

---

# Prompt Editor

Editing uses a dedicated workspace.

Features:

Syntax highlighting

Variable highlighting

Token estimate

Character count

Preview

Validation

Prompt variables appear as protected placeholders.

Examples:

{{recipient_name}}

{{relationship_type}}

{{favorite_memory}}

Variables cannot be accidentally deleted.

---

# Prompt Versioning

Every change creates a new immutable version.

Stored information:

Version Number

Author

Timestamp

Summary

Reason

Evaluation Results

Rollback is supported.

Previous versions are never modified.

---

# Prompt Testing

Before deployment, prompts may be tested against historical data.

Administrators select:

Prompt

Customer

Recipient

Occasion

Expected outcome

The system generates preview drafts without affecting production.

Testing results include:

Generation time

Confidence

Personalization

Prompt tokens

Completion tokens

Estimated cost

---

# Prompt Approval Workflow

Draft

Review

Approved

Production

Only authorized roles may publish prompts.

Publishing requires confirmation.

Previous production version remains available for rollback.

---

# Prompt Rollback

Rollback restores a previous production version.

Confirmation dialog displays:

Current version

Target version

Deployment timestamp

Affected workflows

Rollback reason

Rollback completes without interrupting queued jobs.

---

# Occasion Management

Occasion management defines every supported celebration within the platform.

Occasions are organized into:

Global occasions

Regional occasions

Custom occasions

System occasions

---

# Occasion List

Columns:

Occasion

Category

Autopilot

Active

Reminder Schedule

Card Category

Created

Actions

---

# Occasion Detail

Displays:

Name

Description

Default Reminder Rules

AI Prompt

Image Categories

Autopilot Eligibility

Supported Countries

Supported Relationships

Supported Plans

---

# Reminder Schedule

Displays:

First Reminder

Second Reminder

Final Reminder

Card Generation Window

Order Deadline

Delivery Buffer

Schedules may be simulated before publishing.

---

# Occasion Availability

Occasions may be limited by:

Country

Region

Language

Subscription Tier

Business Account

Experimental Feature Flag

Restrictions are clearly displayed.

---

# Image Library Management

The image library stores every approved card design available to customers.

The interface emphasizes visual browsing over tabular data.

---

# Gallery Layout

Responsive masonry grid.

Card ratio remains consistent.

Lazy loading enabled.

Infinite scrolling supported.

Each image displays:

Thumbnail

Occasion

Category

Orientation

Status

Usage Count

Hover Actions

---

# Image Detail Drawer

Displays:

Large Preview

Image ID

Occasion

Style

Tags

Artist

Generation Source

Resolution

Upload Date

Usage Analytics

Related Images

---

# Image Metadata

Supported metadata includes:

Occasion

Relationship

Season

Mood

Color Palette

Illustration Style

Audience

Gender Lean

Interests

Keywords

AI Generated

Handwrytten Catalog

Custom Artwork

Administrators may edit metadata without replacing the underlying asset.



# Image Upload Workflow

Administrators may upload one or multiple images simultaneously.

Supported formats:

PNG

JPG

JPEG

WEBP

Maximum file size is configurable through system settings.

During upload the interface displays:

Thumbnail

Filename

Upload Progress

Validation Status

Metadata Completion Status

Uploads continue in the background if the administrator navigates away.

---

# Image Validation

Every uploaded image is automatically validated.

Validation checks include:

Resolution

Aspect Ratio

Orientation

Color Profile

Transparency

Duplicate Detection

File Corruption

Metadata Completeness

Images that fail validation cannot be published.

Validation errors clearly explain the issue and recommended resolution.

---

# Image Publishing Workflow

Image lifecycle:

Uploaded

Processing

Needs Metadata

Ready for Review

Approved

Published

Archived

Inactive

Only published images are visible to customers.

Archived images remain available for historical reference.

---

# Image Usage Analytics

Each image displays usage metrics.

Examples:

Times Viewed

Times Selected

Cards Printed

Customer Favorites

Occasion Usage

Average Rating

Generation Success

Last Used

Historical charts support:

Daily

Weekly

Monthly

Yearly

---

# Duplicate Detection

The system automatically identifies visually similar images.

Possible duplicates display:

Similarity Score

Existing Asset

Creation Date

Usage Count

Administrator Recommendation

Administrators may:

Keep Both

Merge Metadata

Archive Duplicate

Replace Existing

---

# Handwrytten Order Management

The Handwrytten workspace monitors every physical card order.

Primary objectives:

Track production

Monitor shipping

Recover failures

Assist customers

Maintain fulfillment quality

---

# Order List

Columns:

Order Number

Customer

Recipient

Occasion

Submission Status

Printing Status

Shipping Status

Carrier

Tracking Number

Estimated Delivery

Created

Actions

Virtual scrolling supports large datasets.

---

# Order Status

Available statuses:

Draft

Queued

Submitted

Accepted

Printing

Printed

Shipped

Delivered

Canceled

Returned

Failed

Each status displays:

Timestamp

Source

Duration

Responsible System

---

# Order Detail Drawer

Sections:

Overview

Card Preview

Recipient

Shipping

Tracking

Timeline

Handwrytten Response

Retry History

Audit History

Actions

---

# Shipping Information

Displays:

Recipient Name

Street Address

City

State

Postal Code

Country

Address Validation

Delivery Instructions

Carrier

Tracking Number

Estimated Delivery

Actual Delivery

Address validation issues are highlighted immediately.

---

# Tracking Timeline

Displays every shipping event chronologically.

Examples:

Order Submitted

Accepted

Printing Started

Printing Complete

Package Shipped

Out for Delivery

Delivered

Exception

Returned

Each event includes:

Timestamp

Provider

Description

---

# Order Actions

Available actions:

Retry Submission

Refresh Status

Cancel Order

Download Shipping Label

View Tracking

Open Customer

Open Recipient

Issue Refund

Create Support Ticket

Actions unavailable due to order state appear disabled with explanatory tooltips.

---

# Failed Orders

Failed orders automatically appear in a dedicated queue.

Failure categories:

API Failure

Validation Error

Address Error

Payment Failure

Timeout

Provider Error

Unknown

Every failure displays:

Cause

Retry Count

Suggested Resolution

Assigned Administrator

---

# Automatic Retry Rules

Certain failures retry automatically.

Examples:

Temporary API timeout

Network interruption

Webhook delay

Permanent failures require administrator review.

Automatic retries are fully logged.

---

# Stripe and Billing Administration

Billing administration provides visibility into all subscription and payment activity.

Administrators can:

Review

Search

Refund

Adjust

Investigate

Never edit raw Stripe data directly.

All changes occur through approved workflows.

---

# Subscription List

Columns:

Customer

Plan

Status

Renewal Date

Monthly Value

Lifetime Value

Payment Method

Trials

Created

Actions

---

# Subscription Status

Possible values:

Trial

Active

Paused

Past Due

Canceled

Expired

Incomplete

Payment Failed

Status colors remain consistent throughout the application.

---

# Billing Detail Drawer

Displays:

Subscription

Invoices

Payment Methods

Charges

Refunds

Credits

Coupons

Billing History

Audit History

---

# Invoice History

Each invoice displays:

Invoice Number

Amount

Tax

Discount

Status

Payment Date

Download PDF

Stripe Reference

Administrators may download invoice copies.

---

# Refund Workflow

Refund dialog displays:

Original Charge

Refund Amount

Reason

Notes

Customer Notification

Confirmation

Refund reasons:

Duplicate

Customer Request

Service Issue

Billing Error

Fraud

Other

Refunds require confirmation.

Large refunds may require elevated permissions.

---

# Coupon Management

Administrators may:

Create

Activate

Deactivate

Expire

Archive

Coupons support:

Percentage

Fixed Amount

Free Trial

One Time

Recurring

Limited Quantity

Expiration Date

Usage Limits

---

# Billing Alerts

Alerts appear for:

Failed Payments

Chargebacks

Refund Spikes

Expired Cards

Subscription Churn

Duplicate Charges

Alerts link directly to affected customers.

---

# Customer Support Tools

Support tools consolidate customer assistance into one workspace.

Primary capabilities:

Search

Account Review

Timeline Review

Communication

Refunds

Card Recovery

Subscription Assistance

Escalation

---

# Support Dashboard

Displays:

Open Tickets

Waiting on Customer

Waiting on Support

Escalated Cases

Average Response Time

Average Resolution Time

CSAT

Newest tickets appear first.

---

# Support Ticket List

Columns:

Ticket ID

Customer

Priority

Category

Assigned To

Created

Updated

Status

Actions

---

# Ticket Priorities

Critical

High

Medium

Low

Priority influences dashboard ordering and notification behavior.

---

# Ticket Detail

Sections:

Conversation

Customer Profile

Relationship Context

Recent Cards

Billing

Timeline

Internal Notes

Attachments

Activity History

Support agents should never need to leave the ticket to understand customer context.

---

# Internal Collaboration

Support agents may mention administrators.

Mentions generate notifications.

Internal conversations remain hidden from customers.

Conversation history is permanently retained.

---

# Canned Responses

Frequently used responses may be inserted.

Examples:

Welcome

Password Reset

Address Correction

Billing Explanation

Delivery Delay

Refund Approved

Refund Denied

Administrators may personalize canned responses before sending.



# Search Philosophy

Search is one of the most frequently used capabilities within the Admin application.

Administrators should never need to remember where information is located.

Instead, they should think about **what** they are looking for.

Search should locate it immediately.

Global Search remains accessible from every screen.

---

# Global Search Experience

Keyboard Shortcut:

/

Clicking the search field or pressing the shortcut immediately focuses the search overlay.

Search opens as a centered modal.

Maximum Width:

900 px

Maximum Height:

720 px

Background behind the modal receives a subtle blur.

---

# Search Categories

Results are grouped automatically.

Supported categories:

Users

Recipients

Relationships

Cards

Orders

Subscriptions

Invoices

Support Tickets

AI Drafts

Prompts

Images

Occasions

Audit Logs

Configuration

Feature Flags

Recent Searches

Each category displays its own icon.

---

# Search Result Layout

Each result displays:

Primary Title

Secondary Description

Category Badge

Status

Relevant Metadata

Last Updated

Quick Actions

Matching terms are highlighted.

Keyboard navigation is fully supported.

---

# Search Ranking

Results prioritize:

Exact matches

Frequently accessed records

Recently viewed records

Active objects

Partial matches

Archived records

The ranking algorithm continuously favors administrator productivity.

---

# Saved Searches

Administrators may save frequently used searches.

Examples:

Failed Orders Today

Canceled Subscriptions

Low Confidence Drafts

VIP Customers

Pending Refunds

Saved searches appear beneath the search field.

---

# Recent Searches

Recent searches are stored per administrator.

Maximum:

20

Selecting a recent search immediately restores filters and results.

---

# Search Performance

Results begin appearing within 150 milliseconds whenever possible.

Large datasets use incremental loading.

Typing never blocks the interface.

---

# Filters

Every major management page supports advanced filtering.

Filters always appear within the toolbar.

Expanded filters slide down beneath the toolbar.

Filter panels remain visually consistent throughout the application.

---

# Standard Filter Components

Dropdown

Checkbox Group

Radio Group

Date Range

Search Input

Multi Select

Status Pills

Tag Selector

Range Slider

---

# Filter Behavior

Changing a filter updates results immediately.

No Apply button is required.

Active filters appear as removable pills above the results.

Each pill displays:

Filter Name

Selected Value

Remove Icon

---

# Filter Presets

Administrators may save custom filter combinations.

Examples:

Today's Failed Orders

Enterprise Customers

Low AI Confidence

Refund Requests

Production Errors

Presets include:

Name

Description

Owner

Visibility

Private presets remain visible only to the creator.

Shared presets may be used across the organization.

---

# Sorting

Sorting remains available across every table.

Supported options:

Ascending

Descending

Multiple column sorting

Natural sorting

Date sorting

Numeric sorting

Alphabetical sorting

Current sorting always remains visible.

---

# Bulk Actions

Bulk actions appear whenever one or more records are selected.

Toolbar changes automatically.

Displays:

Selected Count

Available Actions

Clear Selection

Selection persists while scrolling.

---

# Supported Bulk Actions

Export

Assign Tags

Archive

Activate

Deactivate

Retry

Approve

Reject

Assign Administrator

Merge

Delete

Available actions depend on selected object type.

---

# Bulk Action Workflow

Confirmation dialog displays:

Number of affected records

Summary of action

Estimated completion time

Potential impact

Confirmation button

Progress indicator appears after confirmation.

Large operations continue in the background.

---

# Progress Notifications

Background operations display progress within the notification center.

Information includes:

Current Step

Items Completed

Remaining Items

Estimated Completion

Completion Summary

Administrators may continue working while operations execute.

---

# Empty States

Every empty state should explain why no information is available and guide the administrator toward a productive next step.

Blank screens are never acceptable.

---

# Empty State Structure

Illustration

Headline

Supporting Text

Primary Action

Secondary Action

Optional Documentation Link

---

# Empty Users

Headline:

No users match your filters.

Primary Action:

Clear Filters

Secondary Action:

Create User

---

# Empty Cards

Headline:

No cards were found.

Primary Action:

Reset Filters

Secondary Action:

Generate Test Card

---

# Empty Orders

Headline:

No orders are currently waiting.

Supporting text:

Everything has been processed successfully.

---

# Empty AI Queue

Headline:

No drafts require review.

Supporting text:

The AI generation pipeline is healthy.

---

# Empty Support

Headline:

No open support tickets.

Supporting text:

Customer support inbox is clear.

---

# Loading States

Loading should communicate progress without distracting administrators.

Skeleton screens are preferred over spinners whenever layout is known.

---

# Skeleton Components

Summary Cards

Tables

Charts

Drawers

Images

Forms

Timeline

Graphs

Skeletons closely resemble final layouts.

---

# Progressive Loading

Critical information loads first.

Order:

Navigation

Header

Summary Cards

Primary Content

Secondary Panels

Charts

Historical Data

Lazy loaded sections display independent loading states.

---

# Refresh Indicators

Refreshing existing data never blocks interaction.

Small inline spinner appears beside:

Last Updated

Refreshing…

Only modified components animate.

---

# Error States

Errors should be specific, actionable, and reassuring.

Administrators should always understand:

What happened

Why it happened

What can be done next

---

# Error Categories

Validation

Permission

Network

Server

Third Party

Configuration

Unknown

Each category has consistent visual treatment.

---

# Inline Errors

Displayed beside the affected field.

Include:

Error icon

Explanation

Suggested correction

Validation occurs in real time whenever possible.

---

# Page Errors

If an entire page cannot load:

Display illustration

Error summary

Technical details

Retry button

Return button

Support link

Technical identifiers remain collapsible.

---

# Queue Errors

Failed jobs display:

Failure reason

Retry count

Stack trace reference

Affected object

Suggested action

Administrators may retry directly from the error.

---

# Confirmation Dialogs

Confirmation dialogs prevent accidental destructive actions.

Dialog Width:

520 px

Sections:

Title

Description

Impact

Optional Warning

Confirmation Controls

Primary Action

Secondary Action

---

# Confirmation Levels

Informational

Standard

High Risk

Critical

Critical confirmations require typed confirmation.

Example:

Type:

DELETE

before continuing.

---

# Success Feedback

Successful operations provide immediate confirmation.

Examples:

Subscription Updated

Refund Issued

Prompt Published

Order Retried

Image Uploaded

Notifications automatically disappear after five seconds.

Administrators may dismiss them immediately.

---

# Responsive Layouts

The Admin application is optimized for desktop first workflows.

Responsive behavior prioritizes preserving productivity rather than reproducing every desktop feature.

---

# Large Desktop

Above 1800 px

Three panel layouts remain visible.

Additional table columns appear automatically.

Charts expand horizontally.

---

# Standard Desktop

1440 px to 1800 px

Primary experience.

No functionality is hidden.

---

# Narrow Desktop

1200 px to 1439 px

Navigation collapses.

Secondary actions move into overflow menus.

Tables reduce lower priority columns.

---

# Tablet

Read focused experience.

Editing remains available for simple workflows.

Large administrative operations become unavailable.

---

# Mobile

Supports only:

Viewing alerts

Reviewing dashboards

Approving urgent requests

Viewing support tickets

No complex administration workflows are supported.



# Component Tree

The Admin application is constructed from reusable components.

Every screen should be assembled from standardized building blocks rather than custom implementations.

This ensures consistency, maintainability, and predictable behavior.

---

# Global Layout Components

App Shell

Top Navigation

Left Navigation

Footer Status Bar

Notification Center

Search Overlay

Command Palette

Confirmation Dialog

Toast Provider

Modal Provider

Detail Drawer

---

# Navigation Components

Navigation Section

Navigation Item

Navigation Group

Navigation Badge

Navigation Divider

Navigation Tooltip

Pinned Item

Favorite Item

Breadcrumb

---

# Dashboard Components

Platform Health Banner

KPI Card

Trend Indicator

Sparkline

Queue Health Card

AI Health Card

Revenue Card

Support Card

Activity Feed

Quick Actions Panel

Alert Card

Chart Card

Status Summary

---

# User Components

User Table

User Row

User Avatar

Status Badge

Subscription Badge

Relationship Count

Quick Actions Menu

User Detail Drawer

User Timeline

Internal Notes

Internal Tags

Session List

Device Card

Communication History

---

# Relationship Components

Relationship Card

Relationship Timeline

Relationship Health Gauge

Memory Card

Fresh Update Card

Occasion Card

Recipient Summary

Health Trend Graph

---

# Card Components

Card Preview

Draft Viewer

Version Comparison

Card Status Timeline

Delivery Timeline

Order Summary

Generation Metadata

Personalization Score

Confidence Meter

---

# AI Components

Prompt Editor

Prompt Viewer

Variable Badge

Prompt Version Timeline

Draft Queue

Review Toolbar

Evaluation Summary

Confidence Chart

Prompt Test Results

---

# Order Components

Order Table

Tracking Timeline

Shipping Summary

Delivery Status Badge

Retry Panel

Provider Response

Address Validation Card

---

# Billing Components

Subscription Card

Invoice Table

Refund Dialog

Coupon Card

Payment Method Card

Revenue Graph

Billing Timeline

---

# Support Components

Support Queue

Conversation Thread

Internal Note

Attachment Viewer

Escalation Banner

Canned Response Picker

Mention Component

Customer Context Panel

---

# Monitoring Components

Queue Monitor

Job Timeline

Worker Status

API Status Card

Service Health Card

Background Process List

Incident Banner

Error Summary

---

# Analytics Components

Metric Card

Trend Graph

Bar Chart

Area Chart

Heat Map

Distribution Graph

Conversion Funnel

Retention Chart

Usage Timeline

---

# Common Components

Primary Button

Secondary Button

Danger Button

Icon Button

Dropdown

Multi Select

Checkbox

Radio Group

Toggle Switch

Date Picker

Search Input

Text Area

Tooltip

Popover

Accordion

Tabs

Badge

Tag

Progress Bar

Loading Skeleton

Empty State

Error State

Success Banner

Info Banner

Divider

Avatar

Chip

Table

Pagination

Infinite Scroll

Virtual List

---

# Component Design Rules

Every component supports:

Light theme

Dark theme readiness

Keyboard accessibility

Screen readers

Loading state

Disabled state

Empty state

Error state

Focus state

Hover state

Touch support where applicable

---

# Component State Consistency

Buttons always use the same state progression.

Default

Hover

Pressed

Focused

Disabled

Loading

Success

Error

Transitions remain consistent across the application.

---

# Animation Philosophy

Animation should communicate system behavior.

Animation should never exist purely for decoration.

Every motion should answer one of four questions:

What changed?

Where did it go?

What requires attention?

What completed successfully?

---

# Motion Timing

Fast:

100 milliseconds

Standard:

150 milliseconds

Medium:

200 milliseconds

Complex:

300 milliseconds

Maximum:

400 milliseconds

Animations longer than 400 milliseconds are avoided.

---

# Standard Animations

Fade

Slide

Scale

Expand

Collapse

Crossfade

Number Count

Progress Fill

No bounce animations are used.

---

# Navigation Animation

Navigation expansion:

200 milliseconds

Ease in and out.

Collapsed icons fade into labels.

Pinned items remain stationary.

---

# Drawer Animation

Detail drawers slide from the right.

Duration:

200 milliseconds.

Background blur fades simultaneously.

Closing reverses the animation.

---

# Modal Animation

Fade and scale.

Duration:

150 milliseconds.

Focus immediately transfers into the modal.

Escape reverses the animation.

---

# Table Animations

Rows never animate during scrolling.

New rows fade into position.

Deleted rows collapse vertically.

Updated rows briefly highlight before returning to normal.

---

# Notification Animation

Toast notifications slide upward.

Fade after five seconds.

Dismiss immediately when closed manually.

Maximum visible:

Three

Additional notifications stack within the notification center.

---

# Loading Animations

Skeleton shimmer:

Very subtle.

Cycle:

1.5 seconds.

Progress indicators remain smooth without abrupt jumps.

---

# Chart Animation

Charts animate only on first render.

Subsequent updates animate changed values only.

Duration:

300 milliseconds.

---

# Microinteractions

Microinteractions reinforce confidence and responsiveness.

Every interaction should acknowledge user intent.

---

# Button Microinteractions

Hover:

Subtle elevation.

Pressed:

Brief scale reduction.

Loading:

Spinner replaces icon.

Success:

Checkmark briefly appears.

---

# Input Microinteractions

Focused fields receive:

Border highlight

Soft shadow

Caret animation

Completed validation displays immediate confirmation.

---

# Toggle Behavior

Toggles animate smoothly.

State changes complete within 150 milliseconds.

Labels update immediately.

---

# Badge Updates

Changing statuses animate with a brief crossfade.

No flashing or blinking indicators are used.

---

# Queue Updates

Live queue counts animate numerically.

Only changed values update.

No page reload occurs.

---

# Activity Feed Updates

New events fade into the top of the feed.

Unread events receive a temporary highlight.

Highlight fades naturally after viewing.

---

# Keyboard Behavior

Every administrative workflow is fully operable using only a keyboard.

No functionality requires a mouse.

---

# Keyboard Shortcuts

/

Open Global Search

Escape

Close overlays

Enter

Confirm focused action

Tab

Next focusable element

Shift + Tab

Previous focusable element

Arrow Keys

Navigate lists

Space

Toggle selection

Ctrl + A

Select all visible records

Delete

Delete selected objects when permitted

Ctrl + F

Focus page search

Ctrl + Shift + F

Open advanced filters

Ctrl + S

Save form

?

Open keyboard shortcut reference

---

# Focus Management

Visible focus indicators remain enabled throughout the application.

Focus is never hidden.

Dialogs trap focus until dismissed.

Closing dialogs restores focus to the originating control.

---

# Accessibility

The Admin application meets WCAG 2.2 AA compliance wherever practical.

Accessibility is considered a functional requirement rather than an enhancement.

---

# Color Accessibility

All text meets minimum contrast requirements.

Status colors are never the only indicator of meaning.

Icons and labels reinforce every status.

---

# Screen Reader Support

Every interactive element includes:

Accessible label

Role

State

Description where appropriate

Dynamic updates announce important changes.

---

# Table Accessibility

Headers associate correctly with cells.

Sorting is announced.

Selected rows are announced.

Bulk actions expose accessible descriptions.

---

# Form Accessibility

Required fields are identified programmatically.

Validation errors are announced immediately.

Instructions remain available throughout completion.

---

# Reduced Motion

Administrators may enable reduced motion.

When enabled:

Animations become fades.

Large transitions are removed.

Auto scrolling is disabled.

Parallax effects are not used anywhere within the application.



# Analytics

Every administrative action and every significant customer interaction should generate analytics events.

Analytics are used to improve customer experience, identify operational bottlenecks, measure AI quality, and monitor overall platform health.

Analytics collection should never negatively impact application performance.

Events should be transmitted asynchronously.

---

# Analytics Philosophy

Analytics exist to answer questions, not simply collect data.

Every event should have a clear business purpose.

If an event is never used, it should not exist.

Analytics should support:

Customer behavior

Operational efficiency

AI quality

Revenue

Support effectiveness

Platform reliability

Feature adoption

Retention

---

# Administrative Analytics

Administrative events include:

Administrator Login

Administrator Logout

Search Performed

User Viewed

User Updated

Relationship Viewed

Card Reviewed

Prompt Published

Refund Issued

Feature Flag Changed

Configuration Updated

Order Retried

Bulk Action Executed

Every event contains:

Timestamp

Administrator ID

Role

Environment

Session ID

Affected Object

Result

Duration

---

# Customer Analytics

Customer events remain visible inside analytics dashboards.

Examples:

Account Created

Relationship Added

Memory Added

Fresh Update Submitted

Card Generated

Card Edited

Card Ordered

Card Delivered

Reminder Completed

Autopilot Enabled

Subscription Started

Subscription Canceled

---

# AI Analytics

The platform continuously measures AI quality.

Metrics include:

Average Confidence

Average Personalization

Average Generation Time

Prompt Success Rate

Prompt Failure Rate

Retry Rate

Average Token Usage

Average Cost Per Draft

Fallback Usage

Human Edit Percentage

Prompt Comparison Performance

---

# Operational Analytics

Operational metrics include:

Queue Throughput

Average Processing Time

Failed Jobs

Recovered Jobs

Average Delivery Time

API Availability

Webhook Success Rate

Worker Utilization

Background Queue Depth

---

# Business Analytics

Business dashboards include:

Monthly Recurring Revenue

Annual Recurring Revenue

Trials

Conversions

Retention

Churn

Lifetime Value

Average Revenue Per User

Refund Rate

Coupon Usage

Revenue by Plan

Revenue by Country

---

# Support Analytics

Support metrics include:

Open Tickets

Average First Response

Average Resolution Time

Reopened Tickets

Escalation Rate

Customer Satisfaction

Ticket Categories

Agent Workload

---

# API Mapping

Every administrative screen maps directly to existing backend endpoints.

The Admin interface never introduces business logic.

It remains a presentation layer.

Business rules continue to reside exclusively within the backend.

---

# API Design Principles

Every request should be:

Authenticated

Authorized

Validated

Audited

Versioned

Rate Limited where appropriate

Responses should remain consistent throughout the application.

---

# Standard API Response

Every response contains:

Success

Data

Metadata

Pagination

Request ID

Timestamp

Errors when applicable

---

# Pagination

Large datasets use cursor based pagination whenever possible.

Traditional page numbers are avoided for continuously changing datasets.

Pagination metadata includes:

Cursor

Next Cursor

Previous Cursor

Total Count when available

Page Size

---

# Optimistic Updates

Only low risk actions use optimistic updates.

Examples:

Internal Notes

Tags

Favorites

Pinned Navigation

Critical operations always wait for server confirmation.

---

# Background Operations

Long running actions execute asynchronously.

Examples:

Large Exports

Bulk Updates

Prompt Testing

Image Processing

Queue Recovery

Import Operations

Background jobs expose:

Progress

Estimated Time

Completion Status

Failure Details

---

# Performance

The Admin application should remain responsive regardless of dataset size.

Large organizations may contain millions of records.

Performance should scale accordingly.

---

# Performance Goals

Initial Page Load:

Under 2 seconds

Navigation:

Under 150 milliseconds

Search Results:

Under 150 milliseconds

Drawer Opening:

Under 200 milliseconds

Filter Updates:

Under 250 milliseconds

Table Scrolling:

60 frames per second

---

# Virtualization

Large datasets use virtualization.

Examples:

Users

Cards

Orders

Audit Logs

Activities

Support Tickets

Only visible rows are rendered.

---

# Lazy Loading

The following content loads only when required:

Charts

Images

Attachments

Timeline Details

Historical Data

Audit History

Expanded Panels

---

# Caching

Frequently accessed information is cached.

Examples:

Current Administrator

Navigation

Permissions

Feature Flags

Configuration

Occasions

Image Metadata

Reference Data

Caches invalidate automatically when underlying data changes.

---

# Network Optimization

Requests are batched whenever practical.

Duplicate requests are eliminated.

Prefetching is used for likely navigation paths.

Polling is minimized.

Real time updates use subscriptions when available.

---

# Error Recovery

Transient failures retry automatically.

Network interruptions display recovery banners.

Unsaved work is preserved whenever possible.

Retry actions remain available throughout the interface.

---

# Security Considerations

Security is fundamental to every administrative workflow.

Every screen assumes customer trust must be protected.

---

# Authorization Validation

Every API request validates:

Authentication

Permissions

Ownership where applicable

Environment restrictions

Backend validation is mandatory even when frontend controls hide actions.

---

# Data Protection

Sensitive information is minimized.

Payment methods are masked.

Passwords are never stored or displayed.

Secrets never appear in logs.

Personally identifiable information follows existing platform policies.

---

# Environment Protection

Production

Staging

Development

Environments remain visually distinct.

Production actions require additional confirmation for high risk operations.

---

# Audit Protection

Audit records are immutable.

No administrator may modify historical audit events.

Only retention policies may archive records.

Archived logs remain searchable.

---

# Export Security

Large exports require confirmation.

Sensitive exports generate audit events.

Export files automatically expire after a configurable period.

Download links are temporary.

---

# Session Security

Sessions expire automatically after inactivity.

Revoked sessions terminate immediately.

Administrative logins from new devices generate notifications.

Suspicious activity creates security alerts.

---

# Feature Flag Protection

Experimental features remain disabled by default.

Feature flag changes require confirmation.

Every change is audited.

Production feature changes display impact summaries before activation.

---

# Acceptance Criteria

The Admin application is considered complete only when every requirement below has been satisfied.

Every management screen follows the standard application layout.

Every interactive element supports keyboard navigation.

Every screen is responsive according to the specification.

Every table supports searching, filtering, sorting, and bulk actions where appropriate.

Every destructive action requires confirmation.

Every administrative action generates an audit event.

Every loading state uses skeletons where practical.

Every empty state provides meaningful guidance.

Every error state explains the problem and available recovery actions.

Every drawer preserves navigation context.

Every component follows the shared design system.

Every permission is enforced by the backend.

Every analytics event is generated correctly.

Every API integration matches existing backend contracts.

Performance targets are consistently achieved.

Accessibility requirements satisfy WCAG 2.2 AA.

Security requirements are fully implemented.

No screen requires frontend developers to invent workflows, layouts, or interactions beyond this specification.

---

# Definition of Done

The Admin Build Specification is considered fully implemented when:

The Admin application functions as the operational headquarters for F.I. Forgot.

Customer Support can efficiently assist users without leaving the platform.

Operations can monitor queues, orders, deliveries, and fulfillment in real time.

AI Operations can review drafts, evaluate quality, test prompts, and safely publish prompt updates.

Finance can manage subscriptions, invoices, refunds, and billing activity.

Engineering can monitor infrastructure, queues, APIs, feature flags, and application health.

Executives can understand business performance through comprehensive dashboards and analytics.

Every action is secure, auditable, performant, and accessible.

The interface consistently reflects the philosophy of a premium Relationship Concierge platform.

No frontend implementation decisions remain undefined.

This document serves as the complete implementation specification for the F.I. Forgot Administrative Application.