# 68_FRONTEND_TECHNICAL_[STANDARDS.md](http://STANDARDS.md)

# Frontend Technical Standards

---

# Purpose

This document defines the long term engineering standards for the F.I. Forgot frontend.

It exists to ensure that the codebase remains as thoughtful, maintainable, and scalable as the user experience it delivers.

A premium user experience begins with premium engineering.

Every technical decision should answer one question:

**"Will this make the product easier to evolve without sacrificing quality?"**

---

# Technical Philosophy

Good frontend code is invisible.

Users never see:

Architecture.

File organization.

Component boundaries.

State management.

Naming conventions.

They experience the result.

Engineering quality becomes product quality.

The frontend should be:

Simple.

Predictable.

Maintainable.

Scalable.

Reusable.

Documented.

---

# Engineering Principles

Always prioritize:

Readability over cleverness.

Consistency over personal preference.

Composition over duplication.

Explicitness over magic.

Maintainability over shortcuts.

Long term quality over short term speed.

---

# Preserve Existing Platform

The frontend redesign must never require changes to:

Backend services.

Database schema.

Authentication.

Stripe integration.

Handwrytten integration.

AI orchestration.

API contracts.

Business logic.

The frontend should adapt to the platform.

Not the other way around.

---

# Project Structure

Organize by feature rather than file type.

Example:

```

src/

  app/

  dashboard/

  recipients/

  timeline/

  cards/

  memories/

  business/

  onboarding/

  settings/

  search/

  shared/

  design-system/

  hooks/

  services/

  utils/

  types/

```

Features should remain self contained whenever practical.

---

# Component Organization

Every reusable component should include:

Component

Styles

Tests

Documentation

Stories when applicable

Avoid large folders filled with unrelated files.

---

# Naming Standards

Use descriptive names.

Good:

RecipientProfileCard

RelationshipHealthRing

UpcomingMomentsPanel

BusinessContactRow

CardPreviewModal

Avoid:

Helper

Thing

Data

Widget

NewComponent

FinalVersion

TestCard

---

# File Naming

Prefer consistent casing throughout the project.

Component files should match component names.

Examples:

RecipientProfileCard.tsx

RelationshipTimeline.tsx

DashboardHero.tsx

Avoid inconsistent naming conventions.

---

# Component Design

Components should be:

Focused.

Reusable.

Composable.

Predictable.

Avoid components responsible for multiple unrelated concerns.

---

# Component Responsibilities

Each component should own one responsibility.

Examples:

Button

Input

Card

Timeline

ProgressRing

Modal

Toast

If a component becomes difficult to describe, it probably has too many responsibilities.

---

# Composition

Prefer composition over inheritance.

Build interfaces by combining smaller components.

Avoid monolithic components with hundreds of props.

---

# Props

Props should be:

Minimal.

Clearly named.

Well documented.

Avoid boolean explosion.

Instead of:

isSmall

isCompact

isPrimary

isRounded

isLight

Prefer descriptive variants.

---

# State Management

Separate:

Server state.

UI state.

Form state.

Temporary interaction state.

Avoid duplicating state across multiple locations.

Keep ownership clear.

---

# Side Effects

Side effects should remain predictable.

Examples:

Network requests.

Analytics.

Autosave.

Notifications.

Timers.

Avoid hidden side effects inside visual components.

---

# Business Logic

Business logic belongs outside presentation components.

Components should describe the interface.

Not application rules.

---

# Design Tokens

Every visual value must originate from the design token system.

Never hard code:

Spacing.

Colors.

Typography.

Radius.

Shadows.

Opacity.

Animation timing.

Elevation.

---

# Styling

Follow one styling approach consistently.

Avoid mixing multiple styling systems unnecessarily.

Every style should support:

Dark mode.

Responsive layouts.

Accessibility.

Design tokens.

---

# Layout Standards

All layouts should use the Layout System.

Never invent spacing values.

Never manually recreate grids.

Containers and spacing should remain predictable.

---

# Typography Standards

Typography should always reference approved tokens.

Never manually calculate font sizes.

Never create unofficial text styles.

---

# Color Standards

Never reference raw colors throughout the application.

Use semantic color tokens exclusively.

Examples:

PrimaryText

SurfaceBackground

WarningText

SuccessBorder

ErrorSurface

---

# Motion Standards

Animation must follow:

Motion System.

Animation Specifications.

Microinteraction Guide.

Reduced motion support is mandatory.

---

# Accessibility Standards

Accessibility is part of implementation.

Every component must include:

Semantic HTML.

Keyboard support.

Screen reader support.

Focus management.

Accessible labels.

Proper landmarks.

WCAG AA compliance.

Accessibility should never become optional.

---

# Performance Standards

Components should:

Avoid unnecessary rerenders.

Use lazy loading appropriately.

Support code splitting.

Render efficiently.

Release unused resources.

Performance should remain measurable.

---

# Responsive Standards

Every component should support:

Desktop.

Tablet.

Mobile.

No feature is complete until all breakpoints work.

---

# Forms

Forms should follow the Forms And Input Patterns specification.

Requirements:

Visible labels.

Autosave where appropriate.

Validation.

Accessible errors.

Keyboard navigation.

Mobile optimization.

---

# Search

Search implementation should support:

Immediate feedback.

Fuzzy search.

Accessible suggestions.

Recent searches.

Meaningful filters.

---

# Loading States

Every asynchronous component must define:

Loading.

Empty.

Error.

Offline.

Success.

Never leave undefined states.

---

# Networking

Requests should be:

Efficient.

Cached appropriately.

Cancelable when appropriate.

Retried intelligently.

Avoid duplicate requests.

---

# Error Handling

Errors should:

Be recoverable whenever possible.

Remain user friendly.

Avoid exposing implementation details.

Support retry patterns.

Protect user trust.

---

# Logging

Log:

Unexpected failures.

Performance issues.

Critical application errors.

Never log sensitive relationship information.

---

# Analytics

Measure meaningful user actions.

Examples:

Person added.

Card ordered.

Memory created.

Autopilot enabled.

Relationship updated.

Avoid excessive event tracking.

Measure outcomes rather than clicks.

---

# Security

Never expose:

Private identifiers.

Sensitive relationship information.

Internal architecture.

API secrets.

Hidden implementation details.

Frontend security supports user trust.

---

# Testing Strategy

Testing should include:

Unit testing.

Component testing.

Interaction testing.

Accessibility testing.

Responsive testing.

Visual regression testing.

End to end testing for critical workflows.

---

# Documentation

Every reusable component should document:

Purpose.

Usage.

Props.

Accessibility.

Examples.

Limitations.

Documentation should evolve alongside implementation.

---

# Versioning

Changes to the design system should be:

Documented.

Reviewed.

Approved.

Communicated.

Avoid silent breaking changes.

---

# Code Review Standards

Every review should verify:

Consistency.

Accessibility.

Performance.

Maintainability.

Documentation.

Token usage.

Component reuse.

Responsive behavior.

Playbook compliance.

---

# Technical Debt

Technical debt must be:

Identified.

Documented.

Prioritized.

Scheduled.

Avoid permanent temporary solutions.

---

# Dependency Management

Introduce new dependencies only when they provide meaningful long term value.

Avoid:

Duplicate functionality.

Large libraries for small tasks.

Poorly maintained packages.

Every dependency increases maintenance cost.

---

# Feature Flags

Large features should support feature flags.

Flags should be:

Documented.

Temporary.

Easy to remove.

Avoid permanent branching logic.

---

# Continuous Improvement

The frontend should become:

Cleaner.

Simpler.

More consistent.

More reusable.

With every release.

Complexity should decrease over time.

Not increase.

---

# Definition Of Technical Excellence

Technical excellence means:

Developers understand the code quickly.

Components are reused naturally.

Accessibility is built in.

Performance remains fast.

Design stays consistent.

Features remain easy to extend.

Users never experience technical limitations.

---

# Anti Patterns

Never:

Duplicate components.

Hard code visual values.

Ignore accessibility.

Mix multiple interaction patterns.

Create unnecessary abstractions.

Optimize prematurely.

Leave undocumented workarounds.

Build components that solve only one screen.

Favor cleverness over clarity.

Treat documentation as optional.

---

# Engineering Decision Framework

When multiple technical solutions exist, prioritize:

Maintainability.

Consistency.

Accessibility.

Performance.

Developer experience.

Scalability.

Only then consider implementation convenience.

---

# Technical Review Checklist

Every implementation should answer:

□ Is the architecture easy to understand?

□ Does it reuse existing components?

□ Does it use design tokens?

□ Is accessibility built in?

□ Is performance acceptable?

□ Does it support responsive layouts?

□ Is documentation complete?

□ Are loading, empty, error, and success states implemented?

□ Is the code maintainable?

□ Does it preserve backend compatibility?

□ Will another engineer understand this in six months?

□ Does it support the long term vision of F.I. Forgot?

If every answer is yes, the implementation meets the F.I. Forgot technical standard.

---

# Closing Principle

Great frontend engineering is not measured by how clever the code is.

It is measured by how confidently the product can evolve.

The code should quietly support the mission.

The mission is helping people build stronger relationships.

Everything else is implementation.