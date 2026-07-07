# 52_ANIMATION_[SPECIFICATIONS.md](http://SPECIFICATIONS.md)

# Animation Specifications

---

# Purpose

This document defines the implementation specifications for every animation used throughout F.I. Forgot.

While the Motion System defines the philosophy of movement, this document defines exactly how movement should behave.

Every animation should reinforce the feeling that the Relationship Concierge is quietly assisting the user.

Animations should never exist for decoration alone.

Every animation should communicate:

• Continuity

• Clarity

• Confidence

• Warmth

• Calmness

If an animation does not improve understanding or reduce cognitive effort, it should not exist.

Every animation decision should answer one question:

> **"Would a world class Relationship Concierge move the interface this way?"**

---

# Animation Philosophy

Animation exists to explain.

Animation exists to reassure.

Animation exists to maintain context.

Animation should never demand attention.

Users should rarely notice animation itself.

Instead, they should simply feel that everything behaves naturally.

The experience should resemble:

A page turning.

A handwritten note appearing.

A drawer opening.

A conversation continuing.

Never a flashy presentation.

---

# Core Animation Principles

## Motion Supports Meaning

Movement always communicates something.

Examples:

A page appears.

A card expands.

A notification leaves.

A draft is saved.

The interface should always explain itself through motion.

---

## Calm Over Excitement

Animation should feel gentle.

Avoid dramatic acceleration.

Avoid aggressive bouncing.

Avoid exaggerated overshoot.

---

## Preserve Spatial Memory

Users should understand where elements came from and where they are going.

Nothing should suddenly appear or disappear.

---

## One Animation at a Time

Avoid multiple competing animations.

The eye should always know what deserves attention.

---

## Motion Should Feel Physical

Movement should resemble real objects.

Soft acceleration.

Gentle deceleration.

Natural stopping.

---

# Performance Goals

Animations should consistently achieve:

60 FPS whenever possible.

Avoid layout thrashing.

Prefer GPU accelerated transforms.

Animate:

Opacity

Transform

Scale

Translate

Avoid animating:

Width

Height

Top

Left

Right

Bottom

Margin

Padding

Whenever possible.

---

# Timing Standards

## Instant

100ms

Used for:

Pressed states

Checkboxes

Small icon changes

---

## Fast

150ms

Used for:

Hover

Focus

Tiny transitions

---

## Standard

200ms

Used for:

Buttons

Cards

Menus

Inputs

---

## Medium

300ms

Used for:

Dialogs

Panels

Navigation

---

## Slow

400ms

Used for:

Page transitions

Major layout changes

---

## Never exceed

600ms

Longer animations feel slow.

---

# Easing Curves

## Standard

Ease Out

Used for most interactions.

---

## Entrance

Ease Out Cubic

Quick beginning.

Gentle finish.

---

## Exit

Ease In

Fast departure.

---

## Emphasis

Ease In Out

Used only for larger transitions.

---

## Never Use

Elastic

Bounce

Rubber band

Spring exaggeration

Cartoon easing

---

# Motion Scale

## Extra Small

4px

Micro interactions.

---

## Small

8px

Buttons.

Inputs.

---

## Medium

16px

Cards.

Menus.

---

## Large

24px

Dialogs.

Panels.

---

## Extra Large

32 to 48px

Page transitions.

---

# Fade Animations

Purpose

Reveal information naturally.

---

## Fade In

Opacity

0 → 100%

Duration

200ms

---

## Fade Out

Opacity

100% → 0%

Duration

150ms

---

Never fade without preserving spatial context.

---

# Slide Animations

Used when content enters from a logical direction.

---

## Vertical Slide

Distance

16px

Duration

250ms

---

## Horizontal Slide

Distance

24px

Duration

250ms

---

Slides should feel subtle.

Never dramatic.

---

# Scale Animations

Used sparingly.

---

## Enter

Scale

98% → 100%

Opacity

0 → 100%

Duration

200ms

---

## Exit

100% → 98%

Opacity

100% → 0%

Duration

150ms

---

Never scale beyond 102%.

---

# Page Transitions

Page transitions should preserve continuity.

---

## Navigation Forward

Old page fades slightly.

New page enters with:

16px vertical movement.

Fade.

300ms.

---

## Navigation Back

Reverse naturally.

Maintain orientation.

---

Avoid dramatic screen wipes.

---

# Modal Animations

Backdrop

Fade in.

150ms.

---

Modal

Scale

98% → 100%

Fade.

200ms.

---

Closing reverses naturally.

---

# Drawer Animations

Side drawers slide naturally.

Distance equals drawer width.

Duration

300ms.

Backdrop fades simultaneously.

---

# Bottom Sheet Animations

Enter

Translate Y

24px → 0

Fade

0 → 100%

250ms.

---

Exit

Reverse.

---

# Tooltip Animations

Fade.

Small upward movement.

8px.

150ms.

---

# Toast Animations

Appear

Slide upward.

16px.

Fade.

200ms.

---

Disappear

Fade.

150ms.

---

Avoid flying notifications.

---

# Dropdown Animations

Fade.

Vertical movement.

8px.

200ms.

---

Menus should feel attached to their trigger.

---

# Accordion Animations

Expand vertically.

Fade internal content.

Duration

250ms.

Never snap open.

---

# Tab Transitions

Content fades.

Very slight horizontal movement.

8px.

200ms.

Tabs themselves should not jump.

---

# Carousel Behavior

Slides move horizontally.

No infinite spinning effects.

Manual interaction should always feel responsive.

Autoplay should be avoided.

---

# Loading Animations

Loading should reassure.

Never entertain.

Use:

Skeletons.

Soft shimmer.

Subtle opacity movement.

Avoid:

Spinners whenever skeletons are possible.

---

# Skeleton Transitions

Skeleton fades.

Content fades in.

150ms overlap.

Avoid sudden replacement.

---

# Progress Animations

Progress should move smoothly.

Never jump.

Small increments should animate.

Completion should pause briefly before disappearing.

---

# Success Animations

Success should feel satisfying.

Not celebratory.

Examples:

Checkmark draw.

Soft fade.

Small scale.

200ms.

---

# Error Animations

Errors should attract attention gently.

Small horizontal movement.

Maximum 4px.

One cycle only.

Avoid aggressive shaking.

---

# Celebration Animations

Used only for meaningful achievements.

Examples:

First completed relationship.

First handwritten card sent.

Major milestone.

Use:

Soft confetti.

Warm particles.

Gentle expansion.

Never gaming style explosions.

Maximum duration

1000ms.

---

# Button Animations

Hover

Background transition.

150ms.

---

Press

Scale

100% → 98%.

100ms.

---

Release

Return naturally.

---

Loading

Spinner replaces icon smoothly.

Button width remains stable.

---

# Card Hover Animations

Desktop only.

Lift

2px.

Shadow increases slightly.

200ms.

---

Cards should invite interaction.

Never float dramatically.

---

# Card Press Animations

Scale

99%.

100ms.

Return immediately.

---

# Input Focus Animations

Border color transitions.

200ms.

Focus ring fades in.

No sudden flashing.

---

# Checkbox Animations

Checkmark draws naturally.

150ms.

No bouncing.

---

# Radio Button Animations

Inner dot expands.

150ms.

Fade simultaneously.

---

# Toggle Animations

Thumb slides smoothly.

Background color transitions simultaneously.

Duration

200ms.

---

# Navigation Animations

Active indicator slides.

Fade between sections.

Preserve orientation.

Navigation should never feel disconnected.

---

# Dashboard Animations

Cards appear sequentially.

Small stagger.

40ms between cards.

Maximum eight visible animations.

---

# Timeline Animations

New memories fade upward.

Existing memories remain stable.

Timeline should never reorder unexpectedly.

---

# Card Creation Animations

Draft generation.

Soft loading state.

Content fades naturally.

Preview updates without flashing.

Autosave remains invisible.

---

# Recipient Profile Animations

Timeline expansion.

Section collapse.

Memory additions.

All transitions should preserve reading position.

---

# Autopilot Animations

Enabling Autopilot should feel reassuring.

Use:

Soft confirmation.

Checkmark.

Brief highlight.

Avoid dramatic effects.

---

# Brownie Points Animations

Small increase animation.

Soft upward movement.

Warm glow.

Maximum

500ms.

Never resemble casino rewards.

---

# Reduced Motion Behavior

Respect operating system preferences.

When Reduce Motion is enabled:

Remove movement whenever possible.

Replace movement with fades.

Disable parallax.

Disable decorative transitions.

Keep important state changes visible.

Accessibility always overrides aesthetics.

---

# Performance Optimization

Animate only visible elements.

Avoid simultaneous large animations.

Lazy load complex animation assets.

Pause animations in inactive tabs.

Avoid expensive blur animations.

Avoid unnecessary repaints.

Use hardware accelerated transforms.

---

# Animation Consistency

The same interaction should always animate the same way.

Buttons should always behave consistently.

Cards should always behave consistently.

Dialogs should always behave consistently.

Consistency builds confidence.

---

# Animation Anti Patterns

Never use:

Bounce animations.

Rubber band effects.

Large zooms.

360 degree rotations.

Flashy transitions.

Continuous pulsing.

Floating backgrounds.

Parallax heavy interfaces.

Confetti for ordinary actions.

Large loading spinners.

Animated gradients.

Attention seeking motion.

Unexpected movement.

Animations that delay interaction.

Movement without purpose.

---

# Review Checklist

Before approving any animation, verify:

□ Does the animation communicate meaning?

□ Does it preserve spatial context?

□ Does it feel calm?

□ Is the duration appropriate?

□ Is the easing natural?

□ Is the animation performant?

□ Is GPU acceleration used where possible?

□ Does the animation improve understanding?

□ Does it avoid unnecessary decoration?

□ Is reduced motion supported?

□ Does it maintain accessibility?

□ Does it feel premium?

□ Does it reinforce trust?

□ Would the user notice the experience rather than the animation?

□ Does it feel worthy of a premium Relationship Concierge?

If the answer to any question is no, the animation should be revised before implementation.