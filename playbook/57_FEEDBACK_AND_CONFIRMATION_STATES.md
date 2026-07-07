# 57_FEEDBACK_AND_CONFIRMATION_[STATES.md](http://STATES.md)

# Feedback And Confirmation States

---

# Purpose

Feedback and confirmation states tell the user that something meaningful happened.

In F.I. Forgot, these moments are not just system responses.

They are emotional acknowledgements.

When a user adds a person, saves a memory, creates a card, enables Autopilot, or sends something thoughtful, the product should recognize that action with warmth and clarity.

The purpose of feedback and confirmation states is to:

* confirm that an action succeeded

* reduce uncertainty

* reinforce progress

* create trust

* celebrate thoughtfulness

* guide the user to the next meaningful step

A confirmation should always answer:

**"What would a world class Relationship Concierge say after helping someone do something thoughtful?"**

It would be clear.

It would be reassuring.

It would be warm.

It would never feel generic.

---

# Feedback Philosophy

Feedback is how the product proves it is paying attention.

Every action deserves the right level of response.

Small actions need quiet acknowledgement.

Meaningful actions deserve emotional reinforcement.

Major actions deserve clear confirmation and next steps.

F.I. Forgot should never make the user wonder:

*"Did that save?"*

*"Was that sent?"*

*"Was I charged?"*

*"What happens now?"*

Every confirmation should remove doubt.

---

# Relationship Concierge Approach To Confirmations

A Relationship Concierge does four things after an action succeeds.

## 1. Confirms Clearly

The user should immediately know the action worked.

Example:

"Memory saved."

---

## 2. Adds Meaning

Whenever appropriate, connect the action back to the relationship.

Example:

"This will help future cards feel more personal."

---

## 3. Guides Forward

Offer the next useful step.

Example:

"Add another memory" or "View this relationship."

---

## 4. Celebrates With Restraint

Thoughtful actions should feel rewarding, not childish.

Celebration should be warm and premium.

Never excessive.

---

# Emotional Goals

Feedback states should create:

## Confidence

The user knows the action worked.

---

## Relief

The user does not need to double check.

---

## Progress

The user feels they are becoming more thoughtful.

---

## Warmth

The product feels human and attentive.

---

## Momentum

The next action feels natural.

---

# Positive Reinforcement Principles

F.I. Forgot should reward thoughtfulness.

Positive reinforcement should feel:

* sincere

* specific

* calm

* relationship centered

* premium

* encouraging

Avoid empty praise.

Do not say:

"Awesome!"

Say:

"That memory is saved for next time."

Do not say:

"Great job!"

Say:

"One more thoughtful detail added."

---

# Success Messaging

Success messages confirm completed actions.

They should be short, clear, and reassuring.

Examples:

* "Saved."

* "Memory added."

* "Card draft created."

* "Autopilot is on."

* "Payment confirmed."

* "Card ordered."

* "Contact imported."

For important actions, add context:

"Your card has been ordered. We'll keep you updated as it moves forward."

---

# Information Messaging

Information messages explain something useful without requiring urgent action.

Examples:

* "This relationship will become more personalized as you add memories."

* "Autopilot will remind you before important dates."

* "You can edit this draft before it is sent."

* "This contact was added without a birthday."

Information messages should feel helpful, not instructional.

---

# Warning Messaging

Warning messages should prevent mistakes.

They are not errors.

Examples:

* "This card is scheduled to send tomorrow."

* "Changing this address may affect delivery timing."

* "Autopilot is off for this relationship."

* "This draft has not been ordered yet."

Warnings should be calm and specific.

They should include a clear action when needed.

---

# Confirmation Hierarchy

Use the smallest confirmation that removes uncertainty.

## Level 1: Micro Feedback

For tiny actions.

Examples:

* favorite toggled

* field autosaved

* preference changed

Pattern:

small inline text or subtle icon state

---

## Level 2: Toast Confirmation

For completed actions that do not require interruption.

Examples:

* memory saved

* contact updated

* draft saved

* setting changed

Pattern:

toast with optional undo

---

## Level 3: Inline Confirmation

For actions tied to a specific section.

Examples:

* address verified

* import complete

* AI draft ready

* payment method updated

Pattern:

confirmation panel inside the relevant area

---

## Level 4: Modal Confirmation

For important actions where the user needs to understand what happens next.

Examples:

* card ordered

* subscription changed

* Autopilot enabled for multiple people

Pattern:

modal with next steps

---

## Level 5: Full Page Confirmation

For milestone moments.

Examples:

* first person added

* first card sent

* onboarding completed

* business account set up

Pattern:

warm success page with clear next action

---

# Toast Notifications

Toasts should be used for quick, non disruptive feedback.

Position:

bottom right on desktop

bottom on mobile

Duration:

4 to 6 seconds

Structure:

```

Icon

Message

Optional action

```

Examples:

"Memory saved."

"Draft saved."

"Settings updated."

"Contact added."

Toasts should never carry critical information that disappears permanently.

---

# Inline Confirmations

Inline confirmations should appear close to the action.

Examples:

Address section:

"Address verified."

Memory section:

"Saved to the timeline."

Payment section:

"Payment method updated."

Inline confirmations are best for keeping users oriented.

---

# Modal Confirmations

Modal confirmations should be used sparingly.

Use only when:

* the action is important

* the next step matters

* the user needs reassurance

* there may be financial or delivery implications

Example:

Headline:

Card ordered.

Supporting copy:

Your card is now being prepared. We'll keep you updated as it moves through delivery.

Primary CTA:

View Card Status

Secondary CTA:

Back to Dashboard

---

# Full Page Confirmations

Full page confirmations are reserved for meaningful milestones.

They should feel celebratory but calm.

Examples:

* first relationship created

* first card ordered

* onboarding completed

* business concierge activated

Structure:

```

Illustration

Headline

Supporting copy

Primary CTA

Secondary CTA

```

---

# Autosave Feedback

Autosave should be subtle and constant.

States:

* Saving

* Saved

* Could not save

* Last saved time

Examples:

"Saving..."

"Saved."

"Saved just now."

"We couldn't save this yet."

Autosave should never interrupt the user unless there is a problem.

---

# Draft Saved Confirmations

Headline:

Draft saved.

Supporting copy:

You can come back and finish this card anytime.

Primary CTA:

Continue Editing

Secondary CTA:

View Drafts

Toast version:

"Draft saved."

---

# Card Created Confirmation

Headline:

Your card draft is ready.

Supporting copy:

We created a thoughtful first draft using what we know about this relationship. You can edit anything before sending.

Primary CTA:

Review Card

Secondary CTA:

Add Another Detail

---

# Card Ordered Confirmation

Headline:

Your card is ordered.

Supporting copy:

We'll prepare it for handwriting and delivery. You can track its progress from your sent cards.

Primary CTA:

View Card Status

Secondary CTA:

Back to Dashboard

Must clarify:

* order was placed

* next step

* where to track it

---

# Card Sent Confirmation

Headline:

Your card is on its way.

Supporting copy:

A thoughtful moment is now headed to someone who matters.

Primary CTA:

View Sent Card

Secondary CTA:

Send Another Card

This is a high emotion milestone.

Use a warm illustration and restrained celebration.

---

# Memory Added Confirmation

Toast:

"Memory saved."

Inline:

"This memory will help future cards feel more personal."

Full milestone version:

Headline:

A thoughtful detail saved.

Supporting copy:

Small moments like this are what make future cards feel unforgettable.

Primary CTA:

Add Another Memory

Secondary CTA:

View Timeline

---

# Recipient Created Confirmation

Headline:

Your first person is added.

Supporting copy:

Now we can help you remember the moments that matter most for this relationship.

Primary CTA:

Add an Important Date

Secondary CTA:

View Relationship

For later recipients:

Toast:

"Person added."

---

# Relationship Health Updates

Relationship Health feedback should be encouraging, not judgmental.

Examples:

"Relationship Health updated."

"You're building more context for this relationship."

"This relationship is becoming easier to personalize."

Avoid:

"Score improved."

"Score decreased."

"Poor relationship health."

---

# Brownie Points Celebrations

Brownie Points should feel playful but still premium.

Examples:

"Brownie Points earned."

"Thoughtfulness added."

"Another meaningful step."

Celebrations should be small.

Use:

* subtle sparkle

* warm toast

* gentle count increase

* short animation

Avoid:

* casino effects

* loud sounds

* confetti overload

* childish badges

---

# Autopilot Confirmations

Headline:

Autopilot is on.

Supporting copy:

We'll watch for important moments and help you stay thoughtful without needing to remember everything yourself.

Primary CTA:

View Upcoming Moments

Secondary CTA:

Adjust Settings

Toast:

"Autopilot turned on."

When disabled:

"Autopilot is off for this relationship."

---

# Contact Import Confirmations

Full success:

Headline:

Contacts imported.

Supporting copy:

We added your contacts and highlighted the ones that may need important dates or relationship details.

Primary CTA:

Review Contacts

Secondary CTA:

Back to Your People

Partial success:

Headline:

Some contacts were imported.

Supporting copy:

We added 24 contacts. 4 need a little more information before they are complete.

Primary CTA:

Review 4 Contacts

Secondary CTA:

Done

---

# AI Generation Confirmations

AI confirmations should not mention AI as the hero.

The relationship is the hero.

Instead of:

"AI generated your card."

Say:

"Your card draft is ready."

Supporting copy:

"We used what you shared to create a thoughtful starting point. You can edit anything before sending."

Primary CTA:

Review Draft

Secondary CTA:

Regenerate Draft

---

# Payment Confirmations

Payment confirmations must be explicit.

Headline:

Payment confirmed.

Supporting copy:

Your payment was successful and your card order is moving forward.

Primary CTA:

View Order

Secondary CTA:

Back to Dashboard

Subscription version:

Headline:

Your plan is updated.

Supporting copy:

Your new subscription is active now.

Primary CTA:

View Plan

Secondary CTA:

Back to Settings

---

# Subscription Confirmations

Plan upgrade:

Headline:

You're all set.

Supporting copy:

Your plan has been updated, and your new benefits are available now.

Primary CTA:

View Plan

Secondary CTA:

Continue

Plan cancellation:

Headline:

Your subscription is canceled.

Supporting copy:

Your plan will remain active until the end of your current billing period.

Primary CTA:

View Billing

Secondary CTA:

Back to Settings

Never make cancellation confirmations feel punitive.

---

# Undo Patterns

Undo should be available for reversible actions.

Examples:

* memory deleted

* recipient archived

* notification dismissed

* draft discarded

* tag removed

Toast pattern:

"Memory deleted."

Action:

Undo

Undo duration:

6 to 8 seconds

Do not use undo for irreversible actions like card orders, payment submission, or sent cards.

---

# Progressive Celebrations

Celebrations should evolve based on user maturity.

## First Time

More guidance and warmth.

Example:

"Your first memory is saved. This is how better cards begin."

---

## Growing User

Shorter and more efficient.

Example:

"Memory saved."

---

## Power User

Minimal feedback.

Example:

"Saved."

The product should become quieter as user confidence grows.

---

# Micro Celebration Rules

Use micro celebrations for meaningful relationship building moments.

Appropriate moments:

* first person added

* first memory saved

* first card sent

* Autopilot enabled

* Relationship Health improves

* important date added

* business contact added

* thoughtful streak completed

Avoid celebrations for:

* login

* basic navigation

* failed actions

* form correction

* billing changes unless positive and clear

* deleting information

Celebration should never slow down the user.

---

# Animation Guidelines

Animation should feel like a warm acknowledgement.

Use:

* gentle fade

* soft scale

* subtle sparkle

* smooth count up

* calm checkmark reveal

Avoid:

* loud confetti

* bouncing modals

* shaking success messages

* fast flashing

* excessive loops

All animations must respect reduced motion preferences.

---

# Accessibility Requirements

Feedback and confirmation states must meet WCAG AA.

Requirements:

* success messages must be announced to screen readers when important

* toast messages must remain long enough to read

* undo actions must be keyboard accessible

* color must not be the only success indicator

* focus must be managed after modal confirmations

* animations must respect reduced motion

* confirmation text must be visible and readable

* full page confirmations must use semantic headings

---

# Copywriting Guidelines

Confirmation copy should be:

* clear

* warm

* specific

* concise

* useful

Use verbs that confirm completion.

Examples:

* Saved

* Added

* Created

* Ordered

* Sent

* Updated

* Imported

* Enabled

Avoid vague praise.

Do not use:

* Awesome

* Great job

* Nice

* Cool

* Boom

* Donezo

* Success, without context

Preferred patterns:

"Memory saved."

"Your card is ordered."

"Autopilot is on."

"Your people were imported."

"Your draft is ready."

---

# Anti Patterns

Never leave users wondering whether something worked.

Never use success messages that disappear before the user can read them.

Never celebrate sensitive actions too loudly.

Never use childish rewards.

Never say "AI did it" when the relationship should be the focus.

Never confirm payment without clarity.

Never confirm card sending without status clarity.

Never use generic messages like:

"Success"

"Completed"

"Action finished"

"Operation successful"

Never overuse modals.

Never interrupt momentum without a good reason.

---

# Review Checklist

Every feedback or confirmation state should answer:

□ Does the user know the action worked?

□ Does the message feel calm and human?

□ Does it sound like a Relationship Concierge?

□ Does it connect to thoughtfulness when appropriate?

□ Is the next step clear?

□ Is the feedback proportional to the action?

□ Does it avoid childish celebration?

□ Does it avoid vague system language?

□ Does it clarify payment, order, or delivery status when relevant?

□ Is undo available when appropriate?

□ Does it meet accessibility requirements?

□ Does the experience still feel premium?

If every answer is yes, the feedback state meets the F.I. Forgot standard.