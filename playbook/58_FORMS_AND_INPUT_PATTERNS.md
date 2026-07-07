# 58_FORMS_AND_INPUT_[PATTERNS.md](http://PATTERNS.md)

# Forms And Input Patterns

---

# Purpose

Forms are conversations.

They are not data collection tools.

Every input in F.I. Forgot should feel like a thoughtful question from a Relationship Concierge, not an administrative task.

The goal of every form is to help the user share meaningful information with as little effort as possible.

A great form should feel effortless.

A great conversation should feel natural.

Those are the same thing.

Every form should answer one question:

**"What would a world class Relationship Concierge ask, and how would they ask it?"**

---

# Form Philosophy

Traditional software asks users to complete forms.

F.I. Forgot invites users to tell stories.

Instead of collecting fields, we build relationships.

Every question must earn its place.

Every answer should improve future experiences.

If a question does not improve:

* personalization

* relationship understanding

* card quality

* reminders

* user confidence

it should not exist.

---

# Relationship Concierge Approach To Asking Questions

A Relationship Concierge asks naturally.

Questions should feel:

* conversational

* respectful

* optional when possible

* emotionally intelligent

* easy to answer

Avoid interrogation.

Never overwhelm users with long forms.

Instead, collect meaningful information over time.

---

# Emotional Goals

Every form should create:

## Confidence

The user always knows what is being asked.

---

## Simplicity

One clear task at a time.

---

## Progress

Every answer should feel worthwhile.

---

## Comfort

The user should never feel judged.

---

## Trust

Users should understand why information is requested.

---

# Progressive Disclosure

Do not ask everything at once.

Reveal questions only when they become relevant.

Examples:

Adding a person:

Step 1

Name

Relationship

Birthday if known

Step 2

Optional details

Interests

Favorite memories

Things to avoid

Step 3

Collect additional details naturally over time.

The interface should feel curious, never demanding.

---

# Ask One Meaningful Question At A Time

Large forms should be divided into logical steps.

Each step should focus on a single topic.

Good example:

Tell us about this person.

↓

What's their birthday?

↓

Anything they absolutely love?

↓

What's a favorite memory?

Avoid presenting unrelated questions together.

---

# Form Layout Standards

Forms should feel spacious.

Maximum width:

640px

Field spacing:

24px

Section spacing:

48px

Long forms should be divided using section headings.

Labels should always remain visible.

Avoid placeholder only designs.

---

# Grid System

Desktop

Single column preferred.

Two columns only for closely related fields.

Examples:

City and State

Start Date and End Date

First Name and Last Name

Mobile

Always single column.

---

# Labels

Every input requires a persistent label.

Labels should:

* be concise

* explain the information requested

* remain visible while typing

Good:

Birthday

Favorite Memory

Relationship

Mailing Address

Avoid:

Field 1

Information

Details

---

# Helper Text

Helper text explains why something matters.

Examples:

Birthday

"We'll remind you before it arrives."

Favorite Memory

"This helps us write more personal cards."

Things To Avoid

"We'll avoid mentioning these in future cards."

Helper text should always answer:

"Why are you asking me this?"

---

# Placeholders

Placeholders provide examples.

They should never replace labels.

Examples:

Favorite memory

"The camping trip when it rained all weekend."

Inside joke

"The famous burnt lasagna."

Avoid:

Enter text...

Type here...

---

# Required Vs Optional Fields

Only require information that is absolutely necessary.

Required:

Name

Relationship

Mailing address before ordering

Payment information

Optional:

Interests

Inside jokes

Favorite memories

Hobbies

Favorite foods

The user should never feel blocked from making progress unnecessarily.

---

# Text Fields

Use text fields for short answers.

Examples:

Name

Nickname

Occupation

Company

City

Characteristics:

Single line

Comfortable height

Rounded corners

Visible focus state

Clear validation

---

# Text Areas

Use text areas for stories.

Examples:

Favorite memory

Personality notes

Things to avoid

Recent life updates

Characteristics:

Auto expanding

Comfortable line spacing

No unnecessary scrollbars

Minimum height:

120px

---

# Select Menus

Use select menus when options are limited.

Examples:

Relationship

Occasion

Tone

Gender preference

Select menus should:

support keyboard navigation

include search when lists become large

avoid overwhelming option counts

---

# Searchable Selects

Use searchable selects when more than ten options exist.

Examples:

Countries

States

Business contacts

Large relationship lists

Search should begin filtering immediately.

---

# Radio Buttons

Use radio buttons when exactly one choice is allowed.

Examples:

Relationship type

Card tone

Delivery preference

Keep option count between two and six.

---

# Checkboxes

Use checkboxes for multiple selections.

Examples:

Interests

Holidays

Notification preferences

Preferred occasions

Selections should update immediately.

---

# Toggle Switches

Use toggles for settings that activate immediately.

Examples:

Autopilot

Email reminders

SMS reminders

Business mode

A toggle should never require an additional Save button.

---

# Date Pickers

Date pickers should prioritize speed.

Support:

keyboard entry

calendar selection

touch interaction

Display:

Month Day Year

Avoid forcing users through multiple dropdowns.

---

# Birthday And Anniversary Inputs

These deserve specialized inputs.

Support:

unknown year

month and day only

estimated dates

Examples:

Birthday

April 15

Anniversary

October 3, 2017

Allow users to skip unknown information gracefully.

---

# Address Inputs

Address forms should support:

autocomplete

validation

apartment fields

international formats

Display errors inline.

Never require unnecessary address components.

---

# Phone Inputs

Automatically format numbers while typing.

Support international numbers.

Show country selection only when needed.

---

# Email Inputs

Validate gently.

Do not reject uncommon but valid addresses.

Example helper:

"We'll only use this when needed."

---

# Relationship Selectors

Relationship selection is central to F.I. Forgot.

Examples:

Friend

Parent

Sibling

Child

Coworker

Client

Neighbor

Mentor

Teacher

Coach

Other

Relationship choices should influence future personalization.

---

# AI Assisted Inputs

AI should reduce typing.

Examples:

Memory suggestions

Relationship summaries

Draft generation

Address completion

Interest recommendations

AI suggestions should always be editable.

Never lock generated content.

The user remains in control.

---

# Autosave Behavior

Forms should autosave whenever possible.

States:

Saving...

Saved.

Could not save.

Last saved two minutes ago.

Autosave should occur after a short pause in typing.

Users should rarely need to click Save.

---

# Validation Timing

Validation should feel helpful.

Validate:

after interaction

after submission

during typing only when confidence is high

Avoid showing red errors immediately.

Celebrate successful completion quietly.

---

# Error Handling

Errors should appear:

next to the field

in plain language

with recovery guidance

Example:

Please add a mailing address before ordering your card.

Never:

Invalid input.

---

# Success States

Completed fields should receive subtle confirmation.

Examples:

green check icon

Saved.

Verified.

Success should never dominate the interface.

---

# Loading States

Loading should communicate progress.

Examples:

Checking address...

Generating draft...

Saving...

Loading contact...

Use skeleton loaders whenever content is expected shortly.

---

# Keyboard Navigation

Every form must support:

Tab

Shift Tab

Enter where appropriate

Escape for dialogs

Arrow navigation

Visible focus indicators are required.

---

# Mobile Form Behavior

Mobile forms should:

avoid horizontal scrolling

keep buttons within thumb reach

respect virtual keyboard spacing

prevent layout jumping

auto scroll to focused fields

support native input types

Examples:

email keyboard

numeric keyboard

date picker

telephone keypad

---

# Multi Step Forms

Large conversations should become multi step experiences.

Each step should contain:

one clear topic

progress indicator

Back button

Continue button

Optional Skip button when appropriate

Users should never lose previous answers.

---

# Smart Defaults

Reduce unnecessary work.

Examples:

Today's date when appropriate

Country from location

Previously used address

Common relationship types

Remember user preferences across sessions.

---

# Inline Suggestions

Offer suggestions without forcing them.

Examples:

Memory prompts

"Remember a vacation together?"

Interest prompts

"Do they have a favorite hobby?"

AI suggestions should feel like ideas, not requirements.

---

# Character Limits

Use limits only when necessary.

If limits exist:

show remaining characters

avoid silent truncation

provide generous limits

For storytelling fields:

prefer soft guidance over strict limits.

---

# Voice And Copy Guidelines

Questions should sound conversational.

Good:

What's one thing they always laugh about?

What's a favorite memory together?

Anything you'd rather we never mention?

Avoid:

Describe recipient.

Provide personality attributes.

Enter additional metadata.

Buttons should use action verbs.

Examples:

Continue

Save Memory

Add Person

Create Card

Enable Autopilot

---

# Accessibility Requirements

All forms must meet WCAG AA.

Requirements:

* every input has a visible label

* helper text is associated with fields

* errors are announced to screen readers

* keyboard navigation is complete

* focus order is logical

* required fields are identified programmatically

* instructions do not rely only on color

* touch targets meet minimum size requirements

* reduced motion preferences are respected

* autocomplete attributes are used where appropriate

---

# Anti Patterns

Never use:

placeholder only labels

long unbroken forms

hidden required fields

multiple save buttons

tiny touch targets

generic validation messages

mandatory information without explanation

unnecessary dropdowns

double negatives

overly technical wording

Never disable the primary button without explaining why.

Never ask for information that provides no value.

Never interrupt typing with aggressive validation.

Never make users repeat information you already know.

Never use AI generated text that cannot be edited.

---

# Review Checklist

Every form should answer:

□ Does this feel like a conversation instead of paperwork?

□ Does every question improve the relationship experience?

□ Is the layout simple and spacious?

□ Are labels always visible?

□ Is helper text useful?

□ Are required fields kept to a minimum?

□ Does autosave work whenever possible?

□ Are validation messages clear and human?

□ Can the form be completed entirely with a keyboard?

□ Does it work beautifully on mobile?

□ Are AI suggestions optional and editable?

□ Does the experience feel worthy of a premium Relationship Concierge?

If every answer is yes, the form meets the F.I. Forgot standard.