# 45_DESIGN_[TOKENS.md](http://TOKENS.md)

# F.I. Forgot Design Tokens

---

# Purpose

This document defines the design tokens used throughout the F.I. Forgot frontend.

Design tokens are the single source of truth for every visual property in the application.

No component should invent its own spacing, colors, typography, shadows, or sizing.

Every visual decision should come from a shared token.

This ensures:

* Consistency

* Scalability

* Accessibility

* Predictability

* Easier maintenance

If a value is used more than once, it should probably become a token.

---

# Design Token Philosophy

Tokens represent design decisions.

They are not implementation details.

Developers should never think:

"I need 14 pixels here."

Instead they should think:

"I need the Small spacing token."

Every token has meaning.

Never use raw values when a semantic token exists.

---

# Token Naming Principles

Tokens should describe purpose.

Not appearance.

Good:

Primary Background

Secondary Text

Large Radius

Page Padding

Card Shadow

Primary Button

Success

Warning

Error

Surface

Divider

Avoid:

Blue 500

Gray 200

Radius 12

Shadow 3

Spacing 17

---

# Color Tokens

## Brand

Primary

Primary Hover

Primary Active

Primary Subtle

Primary Background

---

## Neutral

Background

Surface

Elevated Surface

Secondary Surface

Muted Surface

Border

Divider

---

## Text

Primary Text

Secondary Text

Muted Text

Placeholder Text

Disabled Text

Inverse Text

---

## Semantic

Success

Success Background

Warning

Warning Background

Danger

Danger Background

Information

Information Background

---

## Interaction

Link

Link Hover

Focus Ring

Selection

Disabled Background

Disabled Border

Disabled Text

---

# Color Philosophy

Colors represent meaning.

Never decorate with color.

Every color should communicate something.

Backgrounds should remain calm.

Accent colors should guide attention.

Semantic colors should never be reused for decoration.

---

# Typography Tokens

## Display

Display Large

Display Medium

Display Small

---

## Heading

Heading 1

Heading 2

Heading 3

Heading 4

Heading 5

---

## Body

Body Large

Body

Body Small

Caption

Overline

Label

Button

---

# Typography Rules

Body text should prioritize readability.

Headings should prioritize hierarchy.

Buttons should prioritize clarity.

Never use typography simply because it looks interesting.

Typography should always improve comprehension.

---

# Font Weight Tokens

Thin

Light

Regular

Medium

Semibold

Bold

Extra Bold

Avoid arbitrary font weights.

---

# Line Height Tokens

Compact

Comfortable

Relaxed

Spacious

Long form content should always use relaxed spacing.

---

# Letter Spacing Tokens

Tight

Normal

Wide

Extra Wide

Avoid excessive tracking.

---

# Spacing Scale

Spacing should follow a predictable scale.

Tiny

Extra Small

Small

Medium

Large

Extra Large

2X Large

3X Large

4X Large

5X Large

Page

Section

Hero

Never invent custom spacing values.

---

# Layout Tokens

Page Max Width

Content Width

Reading Width

Wide Layout

Sidebar Width

Header Height

Navigation Height

Footer Height

---

# Grid Tokens

Single Column

Two Column

Three Column

Four Column

Responsive Gap

Column Gap

Section Gap

---

# Border Radius Tokens

Extra Small

Small

Medium

Large

Extra Large

Pill

Circle

Use consistent rounding throughout the application.

---

# Border Tokens

Hairline

Standard

Emphasized

Focus

Dividers should always use border tokens.

---

# Shadow Tokens

None

Small

Medium

Large

Floating

Modal

Shadows communicate elevation.

Never decoration.

---

# Elevation Tokens

Level 0

Level 1

Level 2

Level 3

Level 4

Level 5

Every surface should use an elevation level.

Never stack shadows randomly.

---

# Opacity Tokens

Disabled

Muted

Overlay

Hover

Pressed

Loading

Never hardcode opacity values.

---

# Blur Tokens

Small

Medium

Large

Overlay

Blur should be used sparingly.

---

# Z Index Tokens

Base

Dropdown

Sticky

Navigation

Drawer

Popover

Modal

Toast

Tooltip

Developer tools

Never use arbitrary z index values.

---

# Motion Tokens

Instant

Fast

Normal

Slow

Extra Slow

Motion should always feel natural.

---

# Animation Curves

Ease In

Ease Out

Ease In Out

Gentle Spring

Quick Exit

Every animation should use a predefined easing token.

---

# Icon Tokens

Tiny

Small

Medium

Large

Extra Large

Icons should always align to the spacing system.

---

# Avatar Tokens

Tiny

Small

Medium

Large

Extra Large

Hero

Avatars should remain consistent across the application.

---

# Illustration Tokens

Thumbnail

Inline

Section

Hero

Full Width

Illustrations should never exceed their intended scale.

---

# Button Tokens

Small

Medium

Large

Hero

Each includes:

Height

Padding

Radius

Typography

Icon Size

State Colors

---

# Input Tokens

Small

Medium

Large

Text Area

Search

Every input shares the same visual language.

---

# Card Tokens

Compact Card

Standard Card

Feature Card

Relationship Card

Dashboard Card

Hero Card

Each includes:

Padding

Radius

Shadow

Border

Spacing

---

# Modal Tokens

Small

Medium

Large

Fullscreen

Sheet

Modal spacing should remain consistent.

---

# Navigation Tokens

Sidebar Width

Top Navigation Height

Bottom Navigation Height

Navigation Item Height

Navigation Padding

Navigation Icon Size

---

# List Tokens

Item Height

Compact Item

Comfortable Item

Divider

Section Gap

---

# Timeline Tokens

Timeline Node

Timeline Line

Timeline Gap

Memory Card

Date Label

Relationship Timeline should use dedicated spacing tokens.

---

# Dashboard Tokens

Hero Height

Section Gap

Card Gap

Upcoming Grid

Quick Action Size

Everything should align with the dashboard rhythm.

---

# Breakpoints

Extra Small

Small

Medium

Large

Extra Large

Ultra Wide

Every component should respond using shared breakpoints.

---

# Responsive Tokens

Mobile Padding

Tablet Padding

Desktop Padding

Large Desktop Padding

Responsive Gap

Responsive Radius

---

# Accessibility Tokens

Minimum Touch Target

Minimum Contrast

Focus Ring Width

Focus Ring Offset

Keyboard Navigation Outline

Never override accessibility tokens.

---

# Focus Tokens

Default Focus

Keyboard Focus

Error Focus

Success Focus

Focus should always be visible.

---

# Notification Tokens

Success Banner

Warning Banner

Error Banner

Information Banner

Toast

Each notification type should share consistent spacing and typography.

---

# Empty State Tokens

Illustration Size

Title

Body

Action

Spacing

Every empty state should feel consistent.

---

# Skeleton Loading Tokens

Text Line

Card

Avatar

Image

Button

Loading placeholders should match final layouts.

---

# Chart Tokens

Charts are rarely used.

When necessary, use shared tokens for:

Axis

Labels

Grid

Series

Legend

Avoid decorative visualizations.

---

# Semantic Token Usage

Developers should use semantic tokens.

Example:

Primary Button Background

Instead of:

Blue

Example:

Error Text

Instead of:

Red

Semantic names make redesigns significantly easier.

---

# Component Token Rules

Every component must consume tokens.

Never define local spacing unless absolutely necessary.

Never hardcode colors.

Never hardcode shadows.

Never hardcode typography.

Never hardcode border radius.

---

# Theme Support

Tokens should support:

Light Theme

Dark Theme

Future Brand Themes

Changing themes should require changing tokens.

Not components.

---

# Implementation Philosophy

Components should know:

What they are.

Not how they look.

Appearance comes from tokens.

Behavior comes from components.

---

# Example Token Usage

Instead of:

Padding: 18

Use:

Card Padding Large

---

Instead of:

Border Radius: 12

Use:

Radius Medium

---

Instead of:

Color: #123456

Use:

Primary Background

---

Instead of:

Font Size: 16

Use:

Body

---

Instead of:

Shadow: custom

Use:

Shadow Medium

---

# Do Not Hardcode

Never hardcode:

Colors

Spacing

Typography

Radius

Shadows

Opacity

Animation

Breakpoints

Focus styles

Button sizes

Input heights

Navigation dimensions

If it appears more than once, it belongs in a token.

---

# Design Token Checklist

Before shipping any component:

Does every color come from a token?

Does every spacing value come from a token?

Does typography come from tokens?

Does border radius come from tokens?

Does shadow come from tokens?

Does animation come from tokens?

Does sizing come from tokens?

Would changing a token automatically update this component?

If not, redesign the implementation.

---

# Final Principle

Design tokens are the foundation of visual consistency.

Every screen, every component, every interaction, and every future redesign should begin with the same shared language.

A consistent design system creates a product that feels calm, premium, trustworthy, and unmistakably like F.I. Forgot.