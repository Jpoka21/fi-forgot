# 56_ERROR_[STATES.md](http://STATES.md)

# Error States

---

# Purpose

Error states are moments of trust.

When something goes wrong, F.I. Forgot must feel calm, honest, and capable.

An error should never make the user feel abandoned, blamed, confused, or worried that something meaningful was lost.

The purpose of error states is to:

* explain what happened

* protect user confidence

* preserve emotional warmth

* offer a clear recovery path

* avoid technical panic

* maintain the premium Relationship Concierge experience

An error state should always answer:

**"What would a world class Relationship Concierge do when something goes wrong?"**

The answer is simple:

It would take responsibility, explain clearly, and guide the user safely forward.

---

# Error State Philosophy

F.I. Forgot is built around thoughtful relationships.

That means errors must be handled thoughtfully too.

Most software says:

"Something went wrong."

A Relationship Concierge says:

"We couldn't finish that just yet, but your work is safe. Let's try again."

Errors should feel:

* calm

* protective

* clear

* recoverable

* human

* trustworthy

Errors should never feel:

* alarming

* robotic

* careless

* confusing

* cold

* dismissive

* overly technical

The user should leave an error state thinking:

*"Okay, I know what happened and what to do next."*

---

# Relationship Concierge Approach To Errors

A world class Relationship Concierge does four things during an error.

## 1. Acknowledges The Moment

The interface should recognize that the user was trying to do something meaningful.

Example:

"We couldn't save that memory just yet."

Not:

"Request failed."

---

## 2. Protects The User

Whenever possible, reassure the user that their work is safe.

Example:

"Your draft is still here."

"Nothing was sent."

"Your card has not been charged yet."

---

## 3. Explains Simply

Use plain language.

Do not expose raw system details.

Example:

"The connection dropped before we could finish."

Not:

"NetworkError 503 timeout."

---

## 4. Offers A Next Step

Every error should include a clear recovery action.

Examples:

* Try Again

* Save Draft

* Review Details

* Return to Dashboard

* Contact Support

---

# Emotional Goals

Error states should create:

## Calm

The user should not feel alarmed.

---

## Clarity

The user should understand what happened.

---

## Control

The user should know what they can do.

---

## Confidence

The user should trust that important relationship data is protected.

---

## Continuity

The experience should feel interrupted, not broken.

---

# Trust First Communication

Trust is more important than cleverness.

When an error affects:

* payment

* delivery

* card sending

* account access

* relationship information

* AI generated writing

* saved memories

the message must be especially direct.

Always clarify:

* whether anything was saved

* whether anything was sent

* whether anything was charged

* whether the user needs to act

* whether the system will retry automatically

Example:

"We couldn't confirm this card order. You were not charged. Please try again."

---

# Error Severity Levels

Every error should be assigned a severity level.

## Level 1: Gentle Notice

Small interruption.

User can continue normally.

Examples:

* temporary loading issue

* optional field did not save

* notification preference failed

* image preview failed

Tone:

calm and brief

CTA:

Try Again or Dismiss

---

## Level 2: Recoverable Error

Task cannot continue until corrected.

Examples:

* invalid form field

* missing required information

* failed card draft save

* failed contact import

Tone:

helpful and clear

CTA:

Fix Issue or Try Again

---

## Level 3: Serious Error

Important action failed.

Examples:

* card order failed

* payment failed

* AI generation failed

* Handwrytten delivery issue

* authentication failure

Tone:

clear, responsible, reassuring

CTA:

Resolve Now, Try Again, Contact Support

---

## Level 4: Critical Error

User access, payment, delivery, or data integrity may be affected.

Examples:

* duplicate charge concern

* card delivery status conflict

* account lockout

* database sync conflict

* possible data loss

Tone:

direct and protective

CTA:

Contact Support

Must include:

* clear status

* next step

* support path

---

# Recoverable Vs Unrecoverable Errors

## Recoverable Errors

Most errors should be recoverable.

The user should be able to:

* retry

* edit information

* return later

* continue from saved progress

* contact support

Example:

"We couldn't generate this card just yet. Your details are saved, and you can try again."

---

## Unrecoverable Errors

An unrecoverable error should still feel safe.

Example:

"We can't complete this action because the card order has already been sent."

Provide an alternative action:

* View Sent Card

* Create Another Card

* Contact Support

Never leave the user stranded.

---

# Copywriting Principles

## Use Human Language

Say:

"We couldn't save that yet."

Do not say:

"Save operation failed."

---

## Be Specific When Possible

Say:

"We couldn't connect to Handwrytten right now."

Do not say:

"Something went wrong."

---

## Reassure Without Overpromising

Say:

"Your draft is still saved on this page."

Do not say:

"Everything is fine."

---

## Own The Problem

Say:

"We couldn't finish that."

Do not say:

"You failed to submit."

---

## Avoid Blame

Never say:

"You entered invalid information."

Say:

"Please check this detail."

---

## Keep It Short

Most error messages should be one to three sentences.

---

# Layout Standards

Error states should follow one of three layouts.

---

## Inline Error

Used near fields or small UI elements.

Structure:

```

Field label

Input

Error message

```

Example:

"Please enter a valid email address."

---

## Panel Error

Used inside cards, modules, and sections.

Structure:

```

Icon

Headline

Supporting copy

Primary action

Optional secondary action

```

---

## Full Page Error

Used for major interruptions.

Structure:

```

Illustration or icon

Headline

Supporting copy

Primary CTA

Secondary CTA

Support link

```

Maximum width:

520px

Content should feel centered, calm, and uncluttered.

---

# Iconography

Error icons should feel helpful, not alarming.

Use:

* soft warning icon

* gentle alert symbol

* small shield

* broken connection symbol

* clock for timeout

* lock for permission issue

Avoid:

* harsh stop signs

* skulls

* sirens

* aggressive exclamation icons

* red flashing symbols

Icons should be simple, rounded, and consistent with the F.I. Forgot iconography guide.

---

# Color Usage

Error colors should be used carefully.

Use warm error tones only when action is required.

Do not flood the screen with red.

Recommended usage:

* inline field border

* small icon

* short message

* CTA only when needed

Large backgrounds should remain calm and warm.

Error states should still feel premium.

---

# Primary And Secondary Actions

Every error must have a useful next step.

## Primary Actions

Examples:

* Try Again

* Fix Details

* Save Draft

* Review Card

* Update Payment

* Return to Dashboard

* Contact Support

## Secondary Actions

Examples:

* Cancel

* Go Back

* View Details

* Learn More

* Continue Later

Primary action should always represent the safest recovery path.

---

# Inline Validation Errors

Inline validation should appear only after the user interacts with a field or submits the form.

Avoid showing errors before the user has a chance to type.

Examples:

Name:

"Please add a name."

Email:

"Please enter a valid email address."

Birthday:

"Please choose a valid date."

Relationship:

"Please choose how you know this person."

Delivery address:

"Please add a complete mailing address."

Tone:

"Choose the tone that feels closest."

---

# Form Errors

Form errors should appear at both:

* field level

* form level when needed

Top of form message:

"A few details need your attention before we can continue."

Field message:

"Please add the recipient's city."

Primary CTA remains active only when it can help.

Avoid disabling buttons without explanation.

---

# Authentication Errors

Authentication errors should protect privacy.

Do not reveal whether an email exists unless required.

Login failure:

"We couldn't sign you in with those details. Please check them and try again."

Password reset:

"If an account exists for this email, we'll send reset instructions."

Account locked:

"For your security, this account needs a quick check before continuing."

Primary CTA:

Try Again

Secondary CTA:

Reset Password

---

# Login Failures

Headline:

We couldn't sign you in.

Supporting copy:

Please check your email and password, then try again.

Primary CTA:

Try Again

Secondary CTA:

Reset Password

Never say:

"User not found."

"Wrong password."

---

# Session Expiration

Headline:

Your session expired.

Supporting copy:

For your security, please sign in again. Anything saved before this moment is still safe.

Primary CTA:

Sign In Again

Secondary CTA:

Return Home

---

# Network Failures

Headline:

The connection dropped.

Supporting copy:

We couldn't finish that request. Please check your connection and try again.

Primary CTA:

Try Again

Secondary CTA:

Continue Offline, when available

---

# Offline Recovery

Headline:

You're offline right now.

Supporting copy:

You can keep reviewing anything already loaded. We'll sync new changes once your connection returns.

Primary CTA:

Try Again

Secondary CTA:

Continue Offline

Offline recovery must clearly indicate whether edits are saved locally, queued, or unavailable.

---

# AI Generation Failures

AI errors must preserve trust in the concierge.

Never expose model names, prompts, tokens, or raw AI failures.

Headline:

We couldn't create that card just yet.

Supporting copy:

Your details are saved. Please try again, or add one more memory to help us create a better draft.

Primary CTA:

Try Again

Secondary CTA:

Add a Memory

Alternative CTA:

Write It Yourself

---

# Card Creation Failures

Headline:

We couldn't finish this card.

Supporting copy:

Your draft is safe, and nothing has been sent. Please try again when you're ready.

Primary CTA:

Try Again

Secondary CTA:

Save Draft

Critical detail:

Always clarify whether the card was sent.

---

# Payment Failures

Headline:

We couldn't complete the payment.

Supporting copy:

Your card was not sent, and you were not charged. Please update your payment details and try again.

Primary CTA:

Update Payment

Secondary CTA:

Try Another Card

Payment errors must never be vague.

Always clarify charge status when known.

---

# Subscription Errors

Headline:

We couldn't update your subscription.

Supporting copy:

Your current plan is unchanged. Please try again or contact support if this keeps happening.

Primary CTA:

Try Again

Secondary CTA:

Contact Support

---

# Handwrytten Delivery Issues

Headline:

We couldn't confirm delivery details.

Supporting copy:

Your card has not moved forward yet. Please review the recipient's address or try again.

Primary CTA:

Review Address

Secondary CTA:

Contact Support

If an order was already sent to Handwrytten:

Headline:

We're checking on this card.

Supporting copy:

The card was submitted, but we need to confirm the latest delivery status.

Primary CTA:

View Card Status

Secondary CTA:

Contact Support

---

# Contact Import Failures

Headline:

We couldn't import those contacts.

Supporting copy:

Please check the file or connection and try again. Any contacts already added are safe.

Primary CTA:

Try Import Again

Secondary CTA:

Add Manually

---

# Sync Conflicts

Headline:

This was updated somewhere else.

Supporting copy:

We found a newer version of this information. Please review before saving.

Primary CTA:

Review Changes

Secondary CTA:

Keep My Version

Sync conflicts should always protect the newest known data.

---

# Server Errors

Headline:

We couldn't load this right now.

Supporting copy:

This is on our side. Please try again in a moment.

Primary CTA:

Try Again

Secondary CTA:

Return to Dashboard

Avoid exposing server codes unless support needs them.

If shown, use small text:

Reference code: 500

---

# Permission Errors

Headline:

You don't have access to this page.

Supporting copy:

This page may belong to another account or require different permissions.

Primary CTA:

Return to Dashboard

Secondary CTA:

Contact Support

Never expose private account details.

---

# File Upload Errors

Headline:

We couldn't upload that file.

Supporting copy:

Please check the file type and size, then try again.

Primary CTA:

Try Again

Secondary CTA:

Choose Another File

Specific examples:

"Please upload a CSV file."

"Please choose a file under 10 MB."

---

# Timeout Handling

Headline:

This is taking longer than expected.

Supporting copy:

You can keep waiting, try again, or come back later. Your progress is safe.

Primary CTA:

Try Again

Secondary CTA:

Return Later

For AI generation:

"We're still working on this card. You can keep waiting or save it as a draft."

---

# Retry Patterns

Retry buttons should be used when the same action is likely to succeed soon.

Use retry for:

* network issues

* temporary server issues

* AI generation failures

* sync delays

* import retries

* delivery confirmation

Do not use retry for:

* invalid form fields

* expired payment method

* permission errors

* missing required data

---

# Partial Success States

Sometimes part of an action succeeds.

Example:

Some contacts imported.

Headline:

Some contacts were imported.

Supporting copy:

We added 18 contacts. 3 need a little more information before they can be saved.

Primary CTA:

Review 3 Contacts

Secondary CTA:

Done

Partial success should always be specific.

---

# Error Prevention

The best error state is the one the user never sees.

Prevent errors through:

* clear labels

* helpful examples

* inline hints

* address validation

* autosave

* confirmation before irreversible actions

* progress indicators

* disabled actions with explanation

* smart defaults

* draft preservation

Example:

Instead of disabling a button silently, show:

"Add a mailing address before sending."

---

# Accessibility Requirements

All error states must meet WCAG AA.

Requirements:

* errors must be announced to screen readers

* inline errors must be connected to fields

* color must not be the only indicator

* focus should move to the first error after submission

* full page errors need semantic headings

* buttons must be keyboard accessible

* retry actions must have clear labels

* animations must respect reduced motion preferences

* reference codes must be readable text, not images

---

# Motion Guidelines

Motion should reduce anxiety.

Use:

* subtle fade in

* gentle shake only for field validation

* soft highlight on corrected fields

* calm transition to recovery state

Avoid:

* aggressive shaking

* flashing red

* bouncing warnings

* looping alert animations

* anything that feels punitive

Motion duration should be short and respectful.

---

# Anti Patterns

Never use:

"Oops!"

"Uh oh!"

"Something went wrong" by itself

"Error"

"Fatal error"

"Invalid request"

"Request failed"

"Unhandled exception"

"Null"

"Undefined"

"Bad input"

"User error"

"Payment failed" without explaining charge status

"Card failed" without explaining whether it was sent

Never blame the user.

Never expose technical logs.

Never make support the only option unless absolutely necessary.

Never hide what happened.

Never make the user guess whether their work was saved.

---

# Review Checklist

Every error state should answer:

□ Does this feel calm?

□ Does it sound like a Relationship Concierge?

□ Does it explain what happened in plain language?

□ Does it tell the user whether their work is safe?

□ Does it provide a clear recovery action?

□ Does it avoid blame?

□ Does it avoid unnecessary technical language?

□ Does it protect privacy?

□ Does it clarify payment, delivery, or send status when relevant?

□ Does it meet accessibility requirements?

□ Does it preserve trust?

□ Would this error still feel premium during a stressful moment?

If every answer is yes, the error state meets the F.I. Forgot standard.