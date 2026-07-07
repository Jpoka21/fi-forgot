# 73_SCREEN_BY_SCREEN_BUILD_[SPEC.md](http://SPEC.md)

# Screen by Screen Build Specification

> **Purpose:**  

> This document is the implementation blueprint for every screen in the F.I. Forgot application. It defines what every screen contains, which reusable components it uses, how users move through the experience, and the required UI states. No production screen should be built without referencing this document.

---

# Guiding Principles

Every screen should follow the same principles.

Every screen should:

Support one primary goal.

Reduce cognitive load.

Reuse existing components.

Match the design system.

Follow accessibility guidelines.

Support responsive layouts.

Support light and dark themes.

Support loading, empty, success, and error states.

Support keyboard navigation.

Feel like part of the same product.

Consistency is more valuable than originality.

---

# Universal Screen Requirements

Every production screen must include, where applicable:

Page title

Context or description

Primary action

Secondary actions

Navigation

Breadcrumbs when appropriate

Loading state

Empty state

Error state

Confirmation state

Responsive layout

Keyboard accessibility

Screen reader support

Analytics events

Performance optimization

---

# Application Structure

The application is organized into the following areas.

Authentication

Onboarding

Dashboard

Relationships

Cards

Notifications

Search

Settings

Business

Account

Support

Each section contains one or more screens.

---

# Authentication

---

## Login

### Purpose

Allow existing users to securely access their account.

### Components

Authentication layout

Logo

Email field

Password field

Primary button

Forgot password link

Remember me checkbox

Social authentication buttons, if enabled

Error messaging

Loading indicator

### Navigation

Login

↓

Dashboard

or

Onboarding continuation

---

## Sign Up

### Purpose

Create a new account.

### Components

Authentication layout

Name field

Email

Password

Terms agreement

Primary button

Social authentication

Progress indicator

Validation messaging

---

## Forgot Password

### Purpose

Allow password recovery.

### Components

Email field

Primary button

Confirmation state

Success message

---

# Onboarding

---

## Welcome

### Purpose

Introduce the Relationship Concierge philosophy.

### Components

Hero illustration

Headline

Supporting copy

Primary CTA

Secondary CTA

Progress indicator

---

## First Conversation

### Purpose

Begin learning about the user naturally.

### Components

Conversation interface

Message bubbles

Suggested replies

Progress indicator

Typing animation

Continue button

---

## Initial Relationship Setup

### Purpose

Help users add their first important people.

### Components

Recipient cards

Search

Add recipient button

Relationship selector

Progress indicator

---

## Onboarding Completion

### Purpose

Transition users into the product.

### Components

Celebration illustration

Summary

Next steps

Dashboard CTA

---

# Dashboard

---

## Main Dashboard

### Purpose

Provide an overview of the user's relationships.

### Components

Welcome hero

Upcoming cards

Relationship highlights

Brownie Points summary

Relationship Health summary

Recent activity

Suggested actions

Quick card button

Quick add memory button

Search

Navigation

### Primary Actions

Create card

Log memory

View recipient

Review recommendations

---

# Relationships

---

## Your People

### Purpose

Display every relationship.

### Components

Search

Filters

Relationship cards

Sort controls

Add person button

Pagination or infinite scroll

---

## Recipient Profile

### Purpose

Serve as the home for one relationship.

### Components

Recipient header

Relationship summary

Timeline preview

Health summary

Upcoming occasions

Recent memories

Quick actions

Relationship insights

Brownie Points

AI recommendations

---

## Edit Recipient

### Purpose

Update relationship information.

### Components

Form sections

Save controls

Validation

Confirmation

---

## Relationship Timeline

### Purpose

Display the complete history of a relationship.

### Components

Timeline

Event cards

Memory cards

Filters

Search

Add memory

Pagination

---

## Relationship Health

### Purpose

Explain relationship health clearly.

### Components

Health score

Trend visualization

Insights

Recommendations

History

Contributing factors

---

## Brownie Points

### Purpose

Celebrate thoughtful actions.

### Components

Current score

Achievements

Progress

History

Rewards

---

# Card Experience

---

## Card Dashboard

### Purpose

Display upcoming cards.

### Components

Upcoming cards

Drafts

Recently sent

Recommendations

Filters

Search

---

## Card Creation

### Purpose

Guide users through creating a thoughtful card.

### Components

Recipient selector

Occasion selector

Writing assistant

Card preview

Card design selector

Handwriting options

Delivery options

Checkout

Progress indicator

---

## AI Draft Review

### Purpose

Review generated content.

### Components

Draft editor

Suggestions

Regenerate

Improve

Tone controls

Version history

Character count

---

## Card Preview

### Purpose

Preview the final product.

### Components

Card image

Inside message

Envelope preview

Delivery estimate

Edit actions

---

## Order Confirmation

### Purpose

Confirm purchase.

### Components

Success illustration

Order summary

Tracking information

Recipient summary

Next steps

---

# Search

---

## Global Search

### Purpose

Search relationships and cards.

### Components

Search field

Recent searches

Results

Filters

Categories

Keyboard shortcuts

---

# Notifications

---

## Notification Center

### Purpose

Display all relationship activity.

### Components

Notification groups

Filters

Read status

Bulk actions

Search

---

# Settings

---

## Settings Home

### Purpose

Provide access to all preferences.

### Components

Settings navigation

Categories

Search

---

## Profile Settings

### Components

Personal information

Photo

Password

Email

Preferences

---

## Autopilot Settings

### Components

Automation controls

Reminder frequency

AI preferences

Notification settings

Relationship defaults

---

## Privacy Settings

### Components

Permissions

AI controls

Export

Delete account

Data management

---

## Billing

### Components

Subscription summary

Payment methods

Invoices

Plan management

Usage

---

# Business Experience

---

## Business Dashboard

### Purpose

Overview of professional relationships.

### Components

Business metrics

Upcoming outreach

Client highlights

Recommendations

Quick actions

---

## Business Relationships

### Components

Client list

Search

Filters

Relationship summaries

Health indicators

---

## Business Profile

### Components

Company information

Relationship timeline

Communication history

Celebrations

Recommendations

---

# Support

---

## Help Center

### Components

Search

Popular articles

Categories

Contact support

---

## Contact Support

### Components

Message form

Attachments

Priority

Confirmation

---

# Account

---

## Account Overview

### Components

Membership

Usage

Achievements

Subscription

Preferences

---

## Data Export

### Components

Export options

Status

History

Download

---

# Required Screen States

Every production screen should define the following states.

Loading

Empty

Partial data

Offline

Success

Validation error

System error

Permission denied

Responsive layouts

Keyboard focus

Screen reader behavior

---

# Navigation Rules

Every screen should answer three questions immediately.

Where am I?

What can I do?

What should I do next?

Navigation should never require guesswork.

---

# Screen Transition Rules

Transitions should communicate movement.

Examples include:

Dashboard

↓

Recipient

↓

Timeline

↓

Card creation

↓

Confirmation

Users should always understand how they arrived somewhere and how to return.

---

# Component Reuse Rules

Before creating a new component ask:

Does this already exist?

Can an existing component be extended?

Would another screen benefit from the same pattern?

If yes, update the shared component instead.

Never duplicate functionality.

---

# Analytics Requirements

Every screen should define meaningful analytics.

Examples include:

Screen viewed

Primary action clicked

Form completed

Card created

Memory added

Search performed

Recommendation accepted

Notification opened

Settings changed

Analytics should measure user success, not just engagement.

---

# Accessibility Requirements

Every screen must support:

Keyboard navigation

Visible focus

Screen readers

Color contrast

Reduced motion

Touch targets

Semantic HTML

Accessible forms

Accessible tables

Responsive zoom

No screen is complete until accessibility requirements are met.

---

# Definition of Complete

A screen is considered complete only when:

Visual design matches the design system.

Uses approved components.

Responsive across supported devices.

Accessibility requirements pass.

Performance targets are met.

Animations are polished.

Copy follows the Copy Guide.

Loading states exist.

Empty states exist.

Error states exist.

Success states exist.

Analytics are implemented.

QA has approved the experience.

If any item is missing, the screen is not complete.

---

# Final Principle

Every screen should feel like it belongs to the same thoughtful concierge.

Users should never experience isolated pages.

They should experience one continuous relationship journey.

Every screen exists to strengthen relationships.

Everything else is secondary.