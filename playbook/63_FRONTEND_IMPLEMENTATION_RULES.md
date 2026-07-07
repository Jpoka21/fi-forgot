# 63_FRONTEND_IMPLEMENTATION_[RULES.md](http://RULES.md)

# Frontend Implementation Rules

---

# Purpose

This document defines the non negotiable implementation standards for the F.I. Forgot frontend.

It translates the design system, philosophy, and user experience principles into engineering rules.

The goal is consistency.

Every screen should feel like it was built by the same team, during the same sprint, with the same vision.

Developers should never have to guess how something should behave.

If a situation is not explicitly covered elsewhere in the playbook, the principles in this document should guide implementation.

Every implementation decision should answer one question:

**"Does this preserve the experience of a world class Relationship Concierge?"**

---

# Core Engineering Philosophy

Frontend engineering is experience engineering.

The goal is not simply to render components.

The goal is to create an interface that feels:

* calm

* trustworthy

* premium

* responsive

* effortless

* emotionally intelligent

Performance, accessibility, consistency, and maintainability are product features.

---

# Single Source Of Truth

The playbook is the authoritative source for all frontend behavior.

Do not invent new:

* layouts

* spacing values

* colors

* typography

* animations

* components

* interaction patterns

* copy styles

If a new pattern is required, update the playbook before implementing it.

---

# Preserve Existing Platform

The frontend redesign must preserve:

* backend

* API contracts

* database schema

* authentication

* Stripe integration

* Handwrytten integration

* AI pipelines

* business logic

* notification systems

* existing permissions

The frontend may change completely.

The underlying platform should remain stable.

---

# Component First Architecture

Everything should be built as reusable components.

Avoid one off implementations.

A component should solve a problem once.

Every future screen should reuse it.

---

# Component Hierarchy

Preferred hierarchy:

```

Primitive

↓

Shared Component

↓

Feature Component

↓

Screen

↓

Application

```

Business logic should remain outside visual components whenever practical.

---

# Design Tokens Only

Never hard code:

spacing

colors

font sizes

border radius

animation timing

shadows

opacity

z index

Every visual value should come from the Design Token system.

---

# Responsive First

Every component must work across:

Desktop

Tablet

Mobile

No desktop only implementations.

No mobile only hacks.

Responsiveness is required from the first implementation.

---

# Accessibility First

Accessibility is not a later task.

It is part of implementation.

Every component must include:

semantic HTML

keyboard support

visible focus

screen reader support

logical navigation

touch friendly controls

proper labeling

WCAG AA compliance

Accessibility should be considered complete before code review.

---

# Performance First

Performance is part of quality.

Optimize:

rendering

images

animations

network requests

bundle size

component rerenders

Perceived performance matters as much as measured performance.

---

# State Management

Separate:

UI state

Application state

Server state

Temporary interaction state

Avoid duplicating data.

Keep state ownership obvious.

---

# Component Responsibilities

Each component should have one responsibility.

Examples:

Button

Input

Card

Modal

Timeline

Relationship Health

Avoid components that manage unrelated concerns.

---

# Naming Conventions

Use descriptive names.

Examples:

RelationshipCard

UpcomingMomentsPanel

RecipientTimeline

MemoryComposer

BusinessContactCard

Avoid:

Component1

Helper

UtilsCard

FinalButton

---

# Folder Organization

Group by feature first.

Example:

```

dashboard

recipient

cards

timeline

business

settings

shared

design system

hooks

utils

```

Related components should live together.

---

# File Organization

One primary component per file.

Keep files focused.

Avoid extremely large component files.

Extract reusable logic when appropriate.

---

# Props

Component APIs should be:

predictable

minimal

well named

Avoid excessive boolean props.

Prefer descriptive configuration.

---

# Styling Rules

Use the approved design system.

Never create:

inline magic values

random spacing

one off colors

inconsistent shadows

Every style should trace back to the design system.

---

# Layout Rules

Use the Layout System.

Never manually recreate spacing patterns.

Use approved containers.

Use approved grids.

Respect responsive breakpoints.

---

# Typography Rules

Typography must follow:

Typography scale

Weight system

Spacing system

Line height system

Never guess font sizes.

---

# Color Rules

Only semantic tokens.

Never reference raw colors directly.

Example:

Primary Background

Primary Text

Success Surface

Warning Text

Not:

Hex values throughout the application.

---

# Motion Rules

Motion must follow:

Motion System

Animation Specifications

Microinteractions

Reduced motion support

Never invent animation timing.

---

# Form Rules

All forms must follow:

Forms And Input Patterns

Requirements:

Autosave where appropriate

Visible labels

Inline validation

Helpful helper text

Keyboard support

Accessible errors

---

# Search Rules

Search must follow:

Search And Filter Patterns

Requirements:

Immediate feedback

Fuzzy search

Accessible suggestions

Recent searches

Responsive behavior

---

# Empty States

Every screen capable of being empty must implement:

Loading

Empty

Error

Offline

Success

No exceptions.

---

# Feedback States

Every meaningful action must produce feedback.

Examples:

Saved

Deleted

Updated

Ordered

Sent

Imported

Enabled

Feedback should match the Feedback And Confirmation States document.

---

# Error Handling

Every user action must have:

Success path

Loading path

Failure path

Retry path when appropriate

Never leave actions without feedback.

---

# Navigation Rules

Navigation must always communicate:

Current location

Available destinations

Back path

Primary action

Users should never feel lost.

---

# Loading Rules

Prefer:

Skeletons

Optimistic updates

Progress indicators

Avoid:

Blank pages

Infinite spinners

Blocking interfaces

Loading should preserve layout stability.

---

# Images

Images should:

load progressively

respect aspect ratios

support responsive sizes

include alternative text

use placeholders

Avoid layout shifting.

---

# Lists

Long lists should support:

virtualization when appropriate

incremental loading

stable scrolling

persistent selection

Never re render unnecessarily.

---

# Tables

Business tables should:

remain responsive

support sorting

support filtering

support keyboard navigation

maintain readability

Avoid dense enterprise interfaces.

---

# Modals

Use modals only when interruption is appropriate.

Every modal must include:

clear title

purpose

dismiss action

keyboard support

focus trap

escape support

Avoid modal stacking.

---

# Notifications

Notifications should:

respect user preferences

avoid duplicates

group related events

remain actionable

Never overwhelm users.

---

# Offline Behavior

Offline experiences should:

preserve drafts

preserve navigation

explain limitations

retry automatically when appropriate

Users should never fear losing work.

---

# Personalization

Dynamic content should:

remain predictable

respect privacy

remain editable

avoid assumptions

Explain recommendations whenever appropriate.

---

# Security Considerations

Never expose:

internal identifiers

technical stack

API details

sensitive user information

private relationship data

Frontend implementation should protect user trust.

---

# Analytics

Track meaningful interactions.

Examples:

Person added

Memory added

Card drafted

Card ordered

Autopilot enabled

Business contact created

Do not track unnecessary personal behavior.

---

# Feature Flags

Large features should support feature flags.

Feature flags must:

be removable

be documented

avoid permanent complexity

---

# Logging

Log:

unexpected failures

recoverable issues

performance concerns

Avoid logging sensitive relationship information.

---

# Testing Requirements

Every component should include:

unit testing where appropriate

interaction testing

responsive testing

accessibility testing

Visual regression testing is strongly encouraged.

---

# Browser Support

Support all modern browsers approved by the engineering team.

Progressive enhancement should be preferred over graceful degradation.

---

# Technical Debt

Temporary solutions require:

documentation

owner

planned removal

Avoid permanent workarounds.

---

# Code Review Standards

Every pull request should verify:

Design consistency

Accessibility

Performance

Responsive behavior

Component reuse

Token usage

Naming consistency

Playbook compliance

---

# Documentation

Every reusable component should document:

Purpose

Props

Examples

Accessibility

Usage guidelines

Known limitations

Documentation should evolve with the component.

---

# Definition Of Done

A feature is complete only when:

Implementation is finished.

Design matches the playbook.

Accessibility passes.

Responsive behavior is verified.

Performance is acceptable.

Loading states exist.

Empty states exist.

Error states exist.

Confirmation states exist.

Animations are correct.

Documentation is updated.

Code review is approved.

---

# Anti Patterns

Never:

Hard code visual values

Duplicate components

Bypass design tokens

Skip accessibility

Ignore responsive behavior

Invent new interaction patterns

Expose technical language

Create inconsistent navigation

Leave unfinished loading states

Ship placeholder content

Implement visual shortcuts that conflict with the playbook

Optimize developer convenience over user experience

---

# Engineering Principles

Whenever implementation choices are unclear, prioritize:

Consistency over novelty.

Clarity over cleverness.

Relationships over features.

Accessibility over aesthetics.

Performance over visual excess.

Trust over automation.

Long term maintainability over short term speed.

Premium craftsmanship over rapid delivery.

---

# Final Implementation Checklist

Every implementation should answer:

□ Does this match the playbook?

□ Is it reusable?

□ Is it responsive?

□ Is it accessible?

□ Is it performant?

□ Is it maintainable?

□ Does it preserve existing backend functionality?

□ Does it provide every required UI state?

□ Does it sound like a Relationship Concierge?

□ Does it strengthen trust?

□ Would another developer immediately understand this implementation?

□ Would this still feel consistent after five years of product evolution?

If every answer is yes, the implementation meets the F.I. Forgot standard.