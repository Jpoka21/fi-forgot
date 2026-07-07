# 74_COMPONENT_BUILD_[ORDER.md](http://ORDER.md)

# Component Build Order

> **Purpose:**  

> This document defines the recommended implementation order for every reusable UI component in the F.I. Forgot frontend. Components should be built from the smallest foundational elements to the largest application level patterns. Following this order minimizes rework, maximizes consistency, and ensures every screen is assembled from a stable, reusable design system.

---

# Guiding Philosophy

The frontend should never be built screen first.

Screens are the result of reusable components working together.

Every component should:

Have one clear responsibility.

Be reusable.

Be accessible.

Be responsive.

Be theme aware.

Be documented.

Be tested.

Be composable.

A screen should feel assembled from a trusted toolkit, not handcrafted from scratch every time.

---

# Component Dependency Pyramid

Implementation should follow this hierarchy.

```

Application Screens

↓

Templates

↓

Complex Components

↓

Composite Components

↓

Core Components

↓

Foundation

```

Nothing above should be built before the layer beneath it is stable.

---

# Phase One

# Foundation

These items have no visual UI but power the entire design system.

## Design Tokens

Colors

Typography

Spacing

Sizing

Elevation

Border radius

Opacity

Animation durations

Animation curves

Breakpoints

Z index scale

Grid spacing

Shadow definitions

Theme variables

Status colors

Semantic colors

Dark mode tokens

Motion tokens

Interaction timing

Focus styling

Success Criteria

Every visual value in the application references design tokens.

Hard coded values should not exist.

---

## Theme Engine

Light mode

Dark mode

Future themes

System preference detection

High contrast support

Reduced motion support

---

## Typography System

Display styles

Heading hierarchy

Body styles

Caption styles

Labels

Links

Code styles

List styling

Responsive scaling

---

## Icon System

Icon library

Sizes

Weights

Interactive states

Accessibility labels

---

## Illustration System

Illustration sizing

Responsive behavior

Placement rules

Empty state support

Hero artwork support

---

# Phase Two

# Primitive Components

These components become the building blocks of everything else.

---

## Button

Primary

Secondary

Ghost

Text

Destructive

Loading

Disabled

Icon button

Split button

---

## Input

Single line

Validation

Prefix

Suffix

Helper text

Character count

Disabled

Readonly

---

## Text Area

Auto resize

Validation

Character count

Markdown support if required

---

## Checkbox

Standard

Indeterminate

Disabled

Validation

---

## Radio Group

Horizontal

Vertical

Validation

---

## Toggle Switch

Enabled

Disabled

Loading

---

## Select

Single select

Multi select

Searchable

Grouped

Async

---

## Date Picker

Single date

Range

Keyboard support

Localization

---

## Time Picker

12 hour

24 hour

Timezone support

---

## Search Field

Inline

Global

Expandable

Autocomplete

---

## Avatar

User

Recipient

Business

Group

Placeholder

---

## Badge

Status

Category

Priority

Relationship type

Achievement

---

## Chip

Filter

Tag

Selection

Dismissible

---

## Divider

Horizontal

Vertical

Responsive

---

## Spinner

Small

Medium

Large

Inline

Fullscreen

---

## Skeleton

Text

Avatar

Card

Table

Timeline

Profile

Dashboard

---

# Phase Three

# Layout Components

These organize content consistently.

---

## Container

Page widths

Padding

Alignment

---

## Stack

Vertical spacing

---

## Inline

Horizontal spacing

---

## Grid

Responsive columns

Auto layout

Nested support

---

## Section

Headers

Spacing

Dividers

---

## Card

Basic

Interactive

Elevated

Selectable

Loading

---

## Surface

Background variants

Elevation variants

---

## Panel

Settings

Sidebar

Summary

---

## Accordion

Expandable

Nested

Accessible

---

## Tabs

Horizontal

Scrollable

Responsive

---

# Phase Four

# Navigation Components

---

## Sidebar

Desktop

Collapsed

Expanded

---

## Mobile Navigation

Bottom navigation

Drawer

---

## Header

Page title

Actions

Search

Notifications

---

## Breadcrumbs

Responsive

Collapsed

---

## Pagination

Standard

Compact

Infinite scrolling support

---

## Command Palette

Keyboard shortcuts

Quick actions

Search

---

# Phase Five

# Feedback Components

---

## Alert

Success

Warning

Error

Information

---

## Toast

Temporary

Persistent

Undo support

---

## Modal

Confirmation

Form

Fullscreen

Responsive

---

## Drawer

Left

Right

Bottom

---

## Tooltip

Hover

Keyboard

Touch fallback

---

## Popover

Context menus

Rich content

---

## Progress Indicator

Linear

Circular

Step progress

---

## Empty State

Illustration

Message

Action

---

## Error State

Friendly messaging

Recovery action

---

## Success State

Confirmation

Next action

---

# Phase Six

# Form Components

---

## Form Layout

Responsive

Validation

Sections

---

## Address Form

Reusable

Localization ready

---

## Recipient Selector

Search

Suggestions

Favorites

Recent

---

## Relationship Selector

Icons

Categories

Suggestions

---

## Occasion Selector

Visual grid

Search

Filtering

---

## Gift Selector

Future ready

Recommendations

---

## File Upload

Drag and drop

Preview

Validation

---

# Phase Seven

# Data Components

---

## Table

Sorting

Filtering

Selection

Responsive

---

## List

Simple

Grouped

Interactive

---

## Timeline

Events

Memories

Celebrations

---

## Statistic Card

Single metric

Trend

Comparison

---

## Progress Card

Health

Brownie Points

Completion

---

## Chart Wrapper

Line

Bar

Donut

Future visualizations

---

## Activity Feed

Grouped

Infinite scroll

Filtering

---

# Phase Eight

# Relationship Components

These define the identity of F.I. Forgot.

---

## Recipient Card

Summary

Relationship status

Upcoming events

Quick actions

---

## Relationship Health Card

Score

Insights

Recommendations

---

## Brownie Points Card

Score

Achievements

Progress

---

## Memory Card

Story

Date

Tags

Images

---

## Timeline Event Card

Celebration

Conversation

Milestone

Reminder

---

## Upcoming Occasion Card

Countdown

Actions

Priority

---

## AI Recommendation Card

Suggestion

Reason

Actions

Dismiss

---

## Concierge Tip Card

Advice

Learning

Suggested action

---

# Phase Nine

# Card Creation Components

---

## Draft Editor

Rich text

Suggestions

Version history

---

## Tone Selector

Visual options

Descriptions

---

## Card Preview

Front

Inside

Envelope

---

## Handwriting Preview

Font selection

Rendering

---

## Delivery Selector

Date

Shipping

Confirmation

---

## Checkout Summary

Pricing

Address

Review

---

# Phase Ten

# Business Components

---

## Client Card

Professional summary

Next action

---

## Company Card

Overview

Relationships

---

## Business Timeline

Meetings

Celebrations

History

---

## Professional Insight Card

Recommendations

Opportunities

---

## Outreach Recommendation

Suggested follow up

Reasoning

---

# Phase Eleven

# Dashboard Components

---

## Hero Panel

Greeting

Summary

Actions

---

## Upcoming Section

Horizontal list

Priority ordering

---

## Quick Actions

Primary shortcuts

---

## Recent Activity

Feed

Grouping

---

## Relationship Spotlight

Featured person

Insights

---

## Concierge Recommendations

AI suggestions

Actions

---

# Phase Twelve

# Application Templates

Templates should only be built after reusable components exist.

Authentication template

Dashboard template

Settings template

Recipient template

Timeline template

Business template

Search template

Form template

Modal template

Empty template

Error template

---

# Phase Thirteen

# Complete Screens

Only after every previous phase is complete should production screens be assembled.

This dramatically reduces duplicate work and visual inconsistencies.

---

# Component Review Checklist

Before approving any component verify:

Uses design tokens.

Responsive.

Accessible.

Keyboard friendly.

Screen reader friendly.

Supports loading state.

Supports error state.

Supports disabled state.

Supports dark mode.

Supports localization.

Uses semantic HTML.

Animation follows motion system.

Matches visual language.

Reusable.

Documented.

Unit tested.

Integrated into the component library.

---

# Versioning Rules

Never modify a component directly in production without review.

Changes should:

Be documented.

Be tested.

Be backwards compatible whenever possible.

Update all consuming screens.

Avoid breaking existing layouts.

The component library is a shared foundation.

Changes should strengthen it.

---

# Deprecation Policy

When replacing a component:

Document why.

Identify every dependency.

Provide a migration path.

Update documentation.

Remove the legacy component only after all consumers have migrated.

Never maintain duplicate patterns indefinitely.

---

# Definition of Done

A component is complete when:

Its API is stable.

It follows the design system.

Accessibility requirements pass.

Performance targets are met.

Responsive behavior is verified.

Animations are polished.

Documentation is complete.

Examples are provided.

Tests pass.

The component can be reused confidently throughout the application.

---

# Final Principle

Components are the language of the interface.

When every component follows the same philosophy, every screen feels consistent.

When every screen feels consistent, users stop thinking about the interface.

They simply focus on the people who matter most.

That is the purpose of the design system.