# 79_CURSOR_DEVELOPMENT_[GUIDE.md](http://GUIDE.md)

# Cursor Development Guide

> **Purpose:**  

> This document provides implementation rules for AI coding assistants, including Cursor, and for engineers working alongside them. It establishes how code should be generated, reviewed, and integrated into the F.I. Forgot codebase while preserving the product philosophy, design system, and existing backend architecture.

---

# Philosophy

Cursor is a development assistant.

It is not the product designer.

It is not the product manager.

It is not the architect.

It is not the decision maker.

Cursor exists to accelerate implementation while faithfully following this playbook.

Whenever uncertainty exists, the playbook takes precedence.

---

# The Golden Rule

Never invent product decisions.

Implement documented product decisions.

If something is undocumented:

Stop.

Identify the gap.

Document the solution.

Only then continue implementation.

The playbook is the source of truth.

---

# Project Overview

F.I. Forgot is a premium Relationship Concierge.

It is not:

A greeting card application.

A reminder application.

A CRM.

An AI writing tool.

Every implementation should reinforce the concierge experience.

---

# Existing Architecture

The backend is intentionally preserved.

Do not redesign:

Database schema.

Business logic.

Authentication.

Authorization.

API contracts.

Relationship intelligence.

AI pipelines.

Stripe integration.

Handwrytten integration.

Email systems.

Notification systems.

Existing production workflows.

The frontend is where the redesign occurs.

---

# Primary Responsibilities

Cursor should:

Implement components.

Assemble screens.

Improve maintainability.

Reduce duplication.

Follow the design system.

Follow accessibility standards.

Follow responsive rules.

Write clean code.

Preserve existing functionality.

Cursor should not redesign the product.

---

# Development Workflow

Every implementation task should follow the same sequence.

Understand the requirement.

Locate the governing playbook document.

Identify reusable components.

Implement using existing architecture.

Validate accessibility.

Validate responsiveness.

Validate performance.

Run tests.

Document changes.

Never skip steps.

---

# Before Writing Code

Review the relevant playbook documents.

Identify:

Purpose.

Components.

Layout.

Interactions.

Animations.

Accessibility.

Copy.

States.

Analytics.

Performance expectations.

Code should never begin before the implementation is understood.

---

# Component First Development

Never begin with a full screen.

Instead:

Build reusable components.

Validate components.

Document components.

Reuse components.

Only after reusable pieces exist should screens be assembled.

---

# Design System Rules

Never hard code:

Colors.

Spacing.

Typography.

Border radius.

Elevation.

Animation timing.

Breakpoints.

Icon sizes.

Always reference design tokens.

The design system should remain the single visual source of truth.

---

# Component Rules

Every component should:

Be reusable.

Accept meaningful properties.

Support dark mode.

Support responsive layouts.

Support accessibility.

Support keyboard navigation.

Support loading states.

Support error states.

Support disabled states.

Support documentation.

Avoid creating one time components.

---

# Screen Assembly Rules

Every screen should be assembled from approved components.

If a required component does not exist:

Build the component first.

Add documentation.

Then reuse it.

Never duplicate UI patterns.

---

# Accessibility Requirements

Every implementation must support:

Semantic HTML.

Keyboard navigation.

Visible focus.

Screen readers.

Reduced motion.

Touch accessibility.

Logical heading hierarchy.

Accessible forms.

Accessible dialogs.

Accessible navigation.

Accessibility is a release requirement.

Not an enhancement.

---

# Responsive Requirements

Every implementation should support:

Mobile.

Tablet.

Laptop.

Desktop.

Layouts should adapt naturally.

Never hide functionality simply because screen size changes.

Prioritize usability across all supported devices.

---

# Animation Rules

Animation should:

Clarify.

Guide.

Confirm.

Celebrate.

Never distract.

Never delay.

Never exist without purpose.

Respect reduced motion preferences.

---

# Performance Requirements

Code should prioritize:

Fast rendering.

Small bundles.

Lazy loading.

Code splitting.

Efficient state updates.

Minimal re rendering.

Image optimization.

Smooth animations.

Performance should remain a constant consideration.

---

# State Management

Every screen should intentionally support:

Loading.

Empty.

Partial data.

Success.

Validation.

Error.

Offline when appropriate.

Do not assume data always exists.

---

# Forms

Forms should:

Validate inline.

Provide clear feedback.

Support keyboard navigation.

Support autofill.

Support paste.

Recover gracefully after failure.

Never ask unnecessary questions.

---

# Copy Rules

Never invent marketing language.

Use approved copy.

Follow the Copy Guide.

If copy is missing:

Request clarification.

Do not improvise product messaging.

---

# AI Assisted Features

When implementing AI experiences:

Maintain transparency.

Allow editing.

Allow rejection.

Allow regeneration.

Never force AI output.

Never imply certainty where uncertainty exists.

Users remain in control.

---

# Navigation Rules

Navigation should always communicate:

Current location.

Available destinations.

Logical hierarchy.

Return path.

Avoid navigation patterns that require memorization.

---

# Error Handling

Errors should:

Explain the problem.

Offer recovery.

Remain human.

Avoid technical jargon.

Never expose internal implementation details.

---

# Analytics

Instrument meaningful interactions.

Track:

Screen views.

Primary actions.

Workflow completion.

Search.

Recommendations.

Errors.

Avoid collecting unnecessary personal information.

Analytics should improve the product while respecting privacy.

---

# Existing Code

Before creating new code:

Search for existing implementations.

Reuse utilities.

Reuse components.

Reuse patterns.

Prefer extension over duplication.

Every duplicate implementation increases maintenance cost.

---

# Refactoring Rules

Refactor only when:

Complexity decreases.

Maintainability improves.

Behavior remains unchanged.

Documentation is updated.

Tests remain valid.

Never refactor purely for personal preference.

---

# Pull Request Expectations

Every implementation should include:

Clear summary.

Reason for change.

Screens affected.

Components affected.

Testing completed.

Accessibility review.

Responsive review.

Performance review.

Documentation updates.

Reviewers should understand the change immediately.

---

# Documentation Requirements

Every new component should include:

Purpose.

Properties.

Examples.

Accessibility guidance.

Usage recommendations.

Known limitations.

Documentation is part of implementation.

---

# Code Quality Checklist

Before completing any task verify:

Readable.

Consistent.

Modular.

Reusable.

Documented.

Tested.

Accessible.

Responsive.

Performant.

Maintainable.

Simple.

Purposeful.

---

# Common Mistakes to Avoid

Do not hard code spacing.

Do not hard code colors.

Do not duplicate components.

Do not invent layouts.

Do not bypass accessibility.

Do not ignore responsive behavior.

Do not create inconsistent typography.

Do not over engineer.

Do not introduce unnecessary abstractions.

Do not redesign approved experiences.

---

# Escalation Process

If implementation conflicts with documentation:

Pause development.

Identify the conflict.

Review the governing playbook.

Document the issue.

Resolve the documentation first.

Resume implementation afterward.

Documentation should always lead implementation.

---

# Definition of Success

Cursor has succeeded when:

The implementation matches the playbook.

Design and code remain consistent.

Existing functionality remains intact.

Accessibility is excellent.

Performance remains fast.

Future developers can easily extend the implementation.

The resulting interface feels handcrafted rather than generated.

---

# Final Instruction

Every line of code should reinforce the mission of F.I. Forgot.

If a decision makes the interface more thoughtful, more trustworthy, more accessible, more maintainable, and more relationship focused, it is probably the correct decision.

If it introduces unnecessary complexity, inconsistency, or distraction, it should be reconsidered.

The objective is not simply to generate code.

The objective is to faithfully build the world's premier Relationship Concierge exactly as described throughout this playbook.