# 89_AUTHENTICATION_BUILD_[SPEC.md](http://SPEC.md)

# F.I. Forgot Authentication Build Specification

## 1. Purpose

The authentication experience is the front door to F.I. Forgot.

It must feel secure, warm, premium, and effortless.

Authentication is not a technical obstacle. It is the first moment where the user decides whether F.I. Forgot feels trustworthy enough to handle their relationships, memories, important dates, addresses, card drafts, and personal communication.

The authentication system must do four things:

- Help new users enter the product with confidence.
- Help returning users get back to their relationships quickly.
- Explain security without sounding cold or corporate.
- Preserve all existing backend authentication behavior while completely redesigning the frontend experience.

The authentication experience must never feel like a generic SaaS login screen.

It should feel like the private entrance to a premium Relationship Concierge.

## 2. Core Philosophy

F.I. Forgot asks users to trust the product with emotionally important information.

This includes:

- Names of people who matter.
- Birthdays and anniversaries.
- Relationship context.
- Personal memories.
- Tone preferences.
- Delivery addresses.
- Payment information.
- Drafted personal messages.
- Business relationship data.

Because of this, authentication must communicate care before it communicates complexity.

The user should feel:

- This is private.
- This is safe.
- This is thoughtfully designed.
- This is not a spammy reminder app.
- This product understands that relationships are personal.

The login and registration experience must be calm, elegant, and reassuring.

## 3. Product Positioning Inside Authentication

Authentication screens must reinforce the product promise without overexplaining the product.

Approved authentication positioning language:

```text
Your private Relationship Concierge.

```

```text
Keep track of the people who matter, the moments that matter, and the words that make them feel remembered.

```

```text
Thoughtfulness, handled quietly.

```

```text
Cards, memories, dates, and relationship context in one private place.

```

Do not use language such as:

```text
AI card generator

```

```text
Reminder app

```

```text
Never forget again

```

```text
Automate your relationships

```

```text
Generate perfect messages instantly

```

Authentication must avoid sounding like productivity software.

It must sound like a trusted concierge.

## 4. Authentication Strategy

The frontend authentication layer must support the following flows:

- Email and password login.
- Email and password registration.
- Password reset request.
- Password reset confirmation.
- Email verification.
- Magic link login.
- Social authentication entry points.
- Session persistence.
- Remember me behavior.
- Multi device session behavior.
- Future two factor authentication architecture.

The implementation must preserve the existing backend, business logic, database schema, authentication contracts, API behavior, token handling, and session behavior.

The frontend may redesign:

- Layout.
- Copy.
- Form presentation.
- Validation messaging.
- Loading states.
- Error states.
- Success states.
- Navigation between authentication screens.
- Security reassurance.
- Responsive behavior.
- Accessibility behavior.

The frontend must not change:

- Authentication endpoints.
- Token schema.
- Session schema.
- User schema.
- Stripe onboarding logic.
- Existing user creation logic.
- Existing email verification logic.
- Existing reset token logic.
- Existing OAuth provider contracts.
- Existing API response shapes.

## 5. Authentication Information Architecture

Authentication is a contained pre application experience.

It must include the following route level screens:

```text
/auth/login
/auth/register
/auth/forgot-password
/auth/reset-password
/auth/verify-email
/auth/magic-link
/auth/check-email
/auth/session-expired
/auth/error

```

Optional future routes:

```text
/auth/two-factor
/auth/recovery-code
/auth/device-confirmation

```

All authentication routes share the same visual shell.

## 6. Authentication Shell

The authentication shell is the shared wrapper used across every auth screen.

### 6.1 Desktop Shell Layout

Desktop breakpoint begins at 1024px.

The desktop auth shell uses a two column layout.

Overall page:

```text
Width: 100vw
Min height: 100vh
Background: Warm concierge background
Display: grid
Grid columns: 1fr 1fr

```

Left panel:

```text
Purpose: Brand, trust, emotional context
Width: 50vw
Min height: 100vh
Padding top: 48px
Padding right: 64px
Padding bottom: 48px
Padding left: 64px
Display: flex
Flex direction: column
Justify content: space-between
Background: Soft warm gradient

```

Right panel:

```text
Purpose: Authentication form
Width: 50vw
Min height: 100vh
Padding top: 48px
Padding right: 64px
Padding bottom: 48px
Padding left: 64px
Display: flex
Align items: center
Justify content: center
Background: Primary page surface

```

Maximum form width:

```text
Max width: 440px
Width: 100%

```

### 6.2 Tablet Shell Layout

Tablet range:

```text
768px through 1023px

```

Tablet layout:

```text
Width: 100vw
Min height: 100vh
Display: flex
Flex direction: column
Background: Warm concierge background

```

Brand panel:

```text
Padding top: 40px
Padding right: 40px
Padding bottom: 24px
Padding left: 40px

```

Form panel:

```text
Padding top: 24px
Padding right: 40px
Padding bottom: 48px
Padding left: 40px
Display: flex
Justify content: center

```

Form width:

```text
Max width: 480px
Width: 100%

```

### 6.3 Mobile Shell Layout

Mobile range:

```text
0px through 767px

```

Mobile layout:

```text
Width: 100vw
Min height: 100svh
Background: Primary page surface
Display: flex
Flex direction: column

```

Mobile padding:

```text
Padding top: 24px
Padding right: 20px
Padding bottom: 32px
Padding left: 20px

```

Mobile form width:

```text
Width: 100%
Max width: none

```

The left brand panel is collapsed into a compact header on mobile.

## 7. Shared Auth Header

The auth header appears on every authentication screen.

### 7.1 Desktop Header

Location:

```text
Top left of left panel

```

Content:

```text
F.I. Forgot logo
Small tagline

```

Logo treatment:

```text
Height: 36px
Width: auto

```

Tagline:

```text
Text: Relationship Concierge
Font size: 13px
Font weight: 500
Line height: 18px
Color: Muted warm ink
Margin top: 8px

```

### 7.2 Mobile Header

Location:

```text
Top of mobile shell

```

Layout:

```text
Display: flex
Align items: center
Justify content: space-between
Margin bottom: 40px

```

Logo:

```text
Height: 32px

```

Optional helper link:

```text
Shown only when useful
Example: Sign in
Example: Create account

```

## 8. Desktop Brand Panel

The desktop left panel must feel premium and emotionally clear.

It includes:

- Logo area.
- Main positioning statement.
- Supporting copy.
- Trust note.
- Optional Doghouse Dave illustration.
- Footer reassurance.

### 8.1 Brand Panel Content Stack

Content stack:

```text
Display: flex
Flex direction: column
Gap: 28px
Max width: 520px

```

Primary headline:

```text
Your private Relationship Concierge.

```

Headline style:

```text
Font size: 48px
Line height: 54px
Font weight: 650
Letter spacing: -0.03em
Color: Primary ink
Max width: 520px

```

Supporting copy:

```text
Keep track of the people who matter, the moments that matter, and the words that make them feel remembered.

```

Supporting copy style:

```text
Font size: 18px
Line height: 30px
Font weight: 400
Color: Secondary ink
Max width: 480px

```

Trust note card:

```text
Background: rgba warm white surface
Border: 1px solid subtle warm border
Border radius: 20px
Padding: 20px
Display: flex
Gap: 14px
Align items: flex-start
Max width: 460px

```

Trust icon:

```text
Icon: lock or shield
Size: 20px
Color: Concierge green or muted gold

```

Trust note title:

```text
Private by design
Font size: 15px
Line height: 20px
Font weight: 650
Color: Primary ink

```

Trust note body:

```text
Your cards, dates, memories, and relationship notes stay inside your account.
Font size: 14px
Line height: 22px
Font weight: 400
Color: Secondary ink
Margin top: 4px

```

### 8.2 Illustration Placement

Desktop may include a small warm illustration.

Preferred illustration:

```text
Doghouse Dave, subtle and small

```

The illustration must not dominate authentication.

Placement:

```text
Bottom left area of brand panel
Above footer reassurance

```

Size:

```text
Max width: 260px
Height: auto

```

Opacity:

```text
100 percent

```

The illustration must feel like a quiet brand cue, not a mascot takeover.

### 8.3 Brand Panel Footer

Footer appears at bottom of left panel.

Content:

```text
Thoughtfulness, handled quietly.

```

Style:

```text
Font size: 14px
Line height: 20px
Font weight: 500
Color: Muted ink

```

## 9. Auth Form Card

The right panel contains the auth form card.

### 9.1 Card Container

Desktop and tablet:

```text
Width: 100%
Max width: 440px
Background: Surface elevated
Border: 1px solid subtle warm border
Border radius: 28px
Box shadow: Premium soft shadow
Padding top: 36px
Padding right: 36px
Padding bottom: 36px
Padding left: 36px

```

Mobile:

```text
Width: 100%
Background: transparent
Border: none
Box shadow: none
Padding: 0

```

### 9.2 Card Header

Every auth form card has:

- Eyebrow, optional.
- Title.
- Description.
- Contextual secondary action.

Title style:

```text
Font size desktop: 32px
Font size mobile: 28px
Line height desktop: 38px
Line height mobile: 34px
Font weight: 650
Letter spacing: -0.025em
Color: Primary ink
Margin bottom: 10px

```

Description style:

```text
Font size: 15px
Line height: 24px
Font weight: 400
Color: Secondary ink
Margin bottom: 28px

```

Secondary action style:

```text
Font size: 14px
Line height: 20px
Color: Secondary ink

```

Secondary action link:

```text
Font weight: 650
Color: Primary action
Text decoration: none

```

Hover:

```text
Text decoration: underline
Underline offset: 3px

```

## 10. Global Auth Form Layout

All auth forms use the same internal spacing.

Form:

```text
Display: flex
Flex direction: column
Gap: 18px

```

Field group:

```text
Display: flex
Flex direction: column
Gap: 8px

```

Primary button group:

```text
Display: flex
Flex direction: column
Gap: 12px
Margin top: 8px

```

Divider group:

```text
Display: flex
Align items: center
Gap: 12px
Margin top: 22px
Margin bottom: 22px

```

Divider line:

```text
Height: 1px
Flex: 1
Background: Subtle warm border

```

Divider text:

```text
Font size: 12px
Line height: 16px
Font weight: 500
Color: Muted ink
Text transform: none

```

Footer helper:

```text
Margin top: 24px
Text align: center
Font size: 14px
Line height: 22px
Color: Secondary ink

```

## 11. Form Field Specifications

### 11.1 Label

Label style:

```text
Font size: 14px
Line height: 20px
Font weight: 600
Color: Primary ink

```

Required indicators are not shown for login fields because all visible login fields are required.

### 11.2 Input

Input style:

```text
Height: 52px
Width: 100%
Border: 1px solid default warm border
Border radius: 14px
Background: Field surface
Padding top: 0
Padding right: 14px
Padding bottom: 0
Padding left: 14px
Font size: 15px
Line height: 20px
Font weight: 400
Color: Primary ink
Outline: none
Transition: border color 160ms ease, box shadow 160ms ease, background 160ms ease

```

Placeholder style:

```text
Color: Muted ink
Opacity: 1

```

Focus state:

```text
Border color: Primary action
Box shadow: 0 0 0 4px primary action focus ring
Background: Surface white

```

Error state:

```text
Border color: Error
Box shadow: 0 0 0 4px error focus ring when focused

```

Disabled state:

```text
Opacity: 0.6
Cursor: not allowed
Background: Disabled surface

```

### 11.3 Password Field

Password fields include a visibility toggle.

Toggle placement:

```text
Position: absolute
Right: 12px
Top: 50%
Transform: translateY(-50%)

```

Input right padding:

```text
Padding right: 52px

```

Toggle button:

```text
Width: 36px
Height: 36px
Border radius: 10px
Display: flex
Align items: center
Justify content: center
Color: Muted ink
Background: transparent
Border: none
Cursor: pointer

```

Hover:

```text
Background: Subtle warm hover surface
Color: Primary ink

```

Accessible label when password is hidden:

```text
Show password

```

Accessible label when password is visible:

```text
Hide password

```

## 12. Primary Auth Button

Primary button style:

```text
Height: 52px
Width: 100%
Border radius: 16px
Border: none
Background: Primary action
Color: White
Font size: 15px
Line height: 20px
Font weight: 650
Cursor: pointer
Display: flex
Align items: center
Justify content: center
Gap: 10px
Transition: transform 120ms ease, box shadow 160ms ease, background 160ms ease

```

Hover:

```text
Transform: translateY(-1px)
Box shadow: Primary action hover shadow

```

Active:

```text
Transform: translateY(0)
Box shadow: none

```

Disabled:

```text
Opacity: 0.55
Cursor: not allowed
Transform: none
Box shadow: none

```

Loading state:

```text
Button text remains visible when possible
Spinner appears left of text
Button disabled

```

Loading examples:

```text
Signing you in
Creating your account
Sending reset link
Checking your link
Verifying email

```

## 13. Secondary Auth Button

Used for social login and magic link options.

Style:

```text
Height: 50px
Width: 100%
Border radius: 16px
Border: 1px solid subtle warm border
Background: Surface elevated
Color: Primary ink
Font size: 15px
Line height: 20px
Font weight: 600
Cursor: pointer
Display: flex
Align items: center
Justify content: center
Gap: 10px
Transition: background 160ms ease, border color 160ms ease, transform 120ms ease

```

Hover:

```text
Background: Warm hover surface
Border color: Strong warm border
Transform: translateY(-1px)

```

Active:

```text
Transform: translateY(0)

```

Disabled:

```text
Opacity: 0.55
Cursor: not allowed
Transform: none

```

## 14. Link Button

Used for:

- Forgot password.
- Back to login.
- Resend email.
- Use password instead.
- Use magic link instead.

Style:

```text
Background: transparent
Border: none
Padding: 0
Font size: 14px
Line height: 20px
Font weight: 650
Color: Primary action
Cursor: pointer
Text decoration: none

```

Hover:

```text
Text decoration: underline
Underline offset: 3px

```

Focus:

```text
Outline: 2px solid primary action focus
Outline offset: 3px
Border radius: 6px

```

## 15. Complete Layout Specifications

### 15.1 Login Page Layout

Route:

```text
/auth/login

```

Desktop structure:

```text
AuthShell
  AuthBrandPanel
  AuthFormPanel
    AuthCard
      AuthCardHeader
      LoginForm
      SocialAuthOptions
      AuthFooter

```

Login card title:

```text
Welcome back.

```

Login card description:

```text
Sign in to return to your people, upcoming moments, and card drafts.

```

Top secondary action:

```text
New to F.I. Forgot? Create an account

```

Fields:

```text
Email address
Password

```

Field order:

```text
Email address
Password
Remember me row
Primary submit button
Magic link option
Social auth divider
Social auth buttons
Footer terms note

```

Remember me row:

```text
Display: flex
Align items: center
Justify content: space-between
Gap: 16px
Margin top: -2px

```

Left side:

```text
Checkbox plus Remember me

```

Right side:

```text
Forgot password?

```

Primary button text:

```text
Sign in

```

Magic link secondary option:

```text
Email me a secure sign in link

```

Footer terms note:

```text
Protected by private, secure account access.

```

Mobile adjustments:

```text
Title moves closer to top
Social auth buttons remain below primary login
Forgot password remains in remember me row unless width is below 360px
Below 360px, remember me and forgot password stack vertically

```

### 15.2 Registration Page Layout

Route:

```text
/auth/register

```

Desktop structure:

```text
AuthShell
  AuthBrandPanel
  AuthFormPanel
    AuthCard
      AuthCardHeader
      RegisterForm
      SocialAuthOptions
      AuthFooter

```

Registration card title:

```text
Start remembering better.

```

Registration card description:

```text
Create your private concierge account for the people and moments that matter most.

```

Top secondary action:

```text
Already have an account? Sign in

```

Fields:

```text
First name
Email address
Password
Confirm password

```

Field order:

```text
First name
Email address
Password
Password strength helper
Confirm password
Terms consent
Primary submit button
Social auth divider
Social auth buttons
Footer privacy note

```

Primary button text:

```text
Create account

```

Terms consent text:

```text
By creating an account, you agree to the Terms and acknowledge the Privacy Policy.

```

Privacy note:

```text
Your relationship notes and card drafts are private to your account.

```

Mobile behavior:

```text
First name and email remain single column
No two column form fields on mobile
Password helper remains visible after password field
Terms consent remains above primary button

```

### 15.3 Forgot Password Page Layout

Route:

```text
/auth/forgot-password

```

Title:

```text
Reset your password.

```

Description:

```text
Enter your email and we’ll send instructions to help you get back into your account.

```

Fields:

```text
Email address

```

Primary button:

```text
Send reset link

```

Secondary link:

```text
Back to sign in

```

Success state routes to:

```text
/auth/check-email

```

Success message context:

```text
If an account exists for that email, reset instructions have been sent.

```

This wording protects account enumeration.

### 15.4 Reset Password Page Layout

Route:

```text
/auth/reset-password

```

Title:

```text
Choose a new password.

```

Description:

```text
Create a new password for your private F.I. Forgot account.

```

Fields:

```text
New password
Confirm new password

```

Primary button:

```text
Update password

```

Success behavior:

```text
Show success confirmation
Then route to login

```

Success copy:

```text
Your password has been updated. You can now sign in.

```

Invalid token copy:

```text
This reset link is no longer valid. Request a new one to continue.

```

### 15.5 Magic Link Page Layout

Route:

```text
/auth/magic-link

```

Title:

```text
Sign in with a secure link.

```

Description:

```text
We’ll email you a private sign in link so you can access your account without typing a password.

```

Fields:

```text
Email address

```

Primary button:

```text
Send secure link

```

Secondary link:

```text
Use password instead

```

Success route:

```text
/auth/check-email

```

Success copy:

```text
If an account exists for that email, a secure sign in link has been sent.

```

### 15.6 Check Email Page Layout

Route:

```text
/auth/check-email

```

Purpose:

```text
Reusable confirmation screen after password reset request, magic link request, and email verification resend.

```

Title:

```text
Check your email.

```

Description:

```text
We sent a secure link to your inbox. Open it to continue.

```

Visual:

```text
Large soft mail icon inside circular warm surface
Icon size: 32px
Circle size: 72px
Margin bottom: 24px

```

Actions:

```text
Open email app, optional only if supported
Back to sign in
Resend email

```

Resend email behavior:

```text
Disabled for 30 seconds after initial send
Countdown text shown inline

```

Countdown copy:

```text
Resend available in 30 seconds

```

### 15.7 Verify Email Page Layout

Route:

```text
/auth/verify-email

```

Title while checking:

```text
Verifying your email.

```

Description while checking:

```text
Give us a moment while we confirm your account.

```

Success title:

```text
Email verified.

```

Success description:

```text
Your account is ready. Let’s continue setting up your Relationship Concierge.

```

Failure title:

```text
Verification link expired.

```

Failure description:

```text
Request a new verification email and we’ll send a fresh link.

```

Primary success button:

```text
Continue

```

Primary failure button:

```text
Send new verification email

```

Secondary failure link:

```text
Back to sign in

```

### 15.8 Session Expired Page Layout

Route:

```text
/auth/session-expired

```

Title:

```text
Your session expired.

```

Description:

```text
For your privacy, please sign in again to continue.

```

Primary button:

```text
Sign in again

```

Secondary copy:

```text
Your drafts and relationship details are safe.

```

This screen should feel protective, not punitive.

### 15.9 Authentication Error Page Layout

Route:

```text
/auth/error

```

Title:

```text
Something went wrong.

```

Description:

```text
We couldn’t complete that sign in request. Please try again.

```

Primary button:

```text
Return to sign in

```

Secondary button:

```text
Create account

```

Use this route only for unrecoverable auth flow errors.

Part 1 complete. Next should continue with password requirements, validation behavior, login behavior, registration behavior, and password reset logic.

## 16. Password Requirements

Password requirements must be clear, calm, and helpful.

They must never feel punitive.

The user should understand what is required before submitting the form.

### 16.1 Minimum Password Rules

Password requirements must follow the existing backend authentication rules.

The frontend must display the following minimum requirements unless the backend contract specifies stricter requirements:

```text
At least 8 characters
At least one letter
At least one number

```

The frontend must not create stricter password rules than the backend unless already supported by backend validation.

Do not require special characters unless the backend already requires them.

Do not require arbitrary complexity that makes the product feel hostile.

### 16.2 Password Helper Placement

Password helper appears directly below the password input on:

```text
/auth/register
/auth/reset-password

```

Spacing:

```text
Margin top: 8px
Margin bottom: 2px

```

Container:

```text
Display: flex
Flex direction: column
Gap: 6px

```

### 16.3 Password Requirement Row

Each password requirement row:

```text
Display: flex
Align items: center
Gap: 8px
Font size: 13px
Line height: 18px
Font weight: 500

```

Incomplete state:

```text
Icon: hollow circle
Icon size: 14px
Text color: Muted ink

```

Complete state:

```text
Icon: check circle
Icon size: 14px
Text color: Success

```

Error state after submit:

```text
Icon: alert circle
Icon size: 14px
Text color: Error

```

### 16.4 Password Strength Meter

A password strength meter may be shown only as a supportive guide.

It must not conflict with backend requirements.

Placement:

```text
Below password requirement rows
Margin top: 8px

```

Structure:

```text
Display: grid
Grid template columns: repeat(4, 1fr)
Gap: 4px
Height: 4px

```

Segment:

```text
Border radius: 999px
Background inactive: Subtle warm border
Background active weak: Error
Background active okay: Warning
Background active good: Success muted
Background active strong: Success

```

Strength label:

```text
Margin top: 6px
Font size: 12px
Line height: 16px
Font weight: 500
Color: Muted ink

```

Approved labels:

```text
Weak
Okay
Good
Strong

```

Do not use shaming language.

Never show:

```text
Bad password
Terrible password
Unsafe password

```

### 16.5 Password Confirmation Matching

Password confirmation validation appears under the confirm password field.

Before user interaction:

```text
No helper text shown

```

When passwords match:

```text
Passwords match

```

Style:

```text
Font size: 13px
Line height: 18px
Font weight: 500
Color: Success
Icon: check circle

```

When passwords do not match:

```text
Passwords do not match

```

Style:

```text
Font size: 13px
Line height: 18px
Font weight: 500
Color: Error
Icon: alert circle

```

Validation should only appear after:

```text
Confirm password field has value

```

or

```text
User attempts to submit

```

## 17. Login Behavior

The login flow must prioritize speed for returning users while preserving trust and clarity.

### 17.1 Login Form Initial State

Initial state:

```text
Email field empty unless remembered by browser or application setting
Password field empty
Remember me unchecked unless previously selected
Submit button enabled only when required fields are non empty
No validation messages visible
No error banner visible

```

Initial focus:

```text
Email field receives focus on desktop
No forced focus on mobile

```

### 17.2 Login Submit Behavior

On submit:

```text
Disable all form fields
Disable primary button
Show loading state on primary button
Preserve entered email
Preserve password input until response returns
Clear prior error messages

```

Loading button text:

```text
Signing you in

```

Spinner:

```text
Size: 16px
Stroke width: 2px
Placement: left of text

```

### 17.3 Successful Login

On successful login:

```text
Store session according to existing backend behavior
Respect Remember me selection
Route user to intended destination if available
Otherwise route to dashboard

```

Default route:

```text
/dashboard

```

If user was redirected from protected page:

```text
Return to original protected route

```

Example:

```text
User opens /recipients/123 while signed out
User signs in
User is returned to /recipients/123

```

### 17.4 Failed Login

Failed login must not reveal whether email or password was incorrect.

Error banner copy:

```text
We couldn’t sign you in with those details. Please check your email and password and try again.

```

Error banner placement:

```text
Above first form field
Margin bottom: 18px

```

Error banner style:

```text
Background: Error soft surface
Border: 1px solid Error soft border
Border radius: 16px
Padding: 14px 16px
Display: flex
Gap: 10px
Align items: flex-start

```

Icon:

```text
Alert circle
Size: 18px
Color: Error
Margin top: 1px

```

Text:

```text
Font size: 14px
Line height: 21px
Font weight: 500
Color: Error ink

```

After failure:

```text
Re enable form
Keep email value
Clear password value
Move focus to password field on desktop
Do not focus automatically on mobile

```

### 17.5 Locked Or Rate Limited Login

If backend returns rate limit or temporary lockout:

Title:

```text
Too many sign in attempts.

```

Body:

```text
For your security, please wait a moment before trying again.

```

Button behavior:

```text
Primary button disabled until backend retry window if provided

```

If retry time is available:

```text
Try again in 60 seconds

```

Do not imply the account is permanently locked unless backend explicitly says so.

### 17.6 Unverified Email Login

If login requires email verification:

Banner title:

```text
Please verify your email.

```

Banner body:

```text
We need to confirm your email before opening your account.

```

Actions:

```text
Resend verification email
Change email

```

Resend button style:

```text
Inline link button

```

After resend:

```text
Show success toast
Disable resend for 30 seconds

```

Toast copy:

```text
Verification email sent.

```

## 18. Registration Behavior

Registration must feel like beginning a trusted relationship, not filling out a generic account form.

### 18.1 Registration Initial State

Initial state:

```text
All fields empty
Password helper visible after password field
Terms consent unchecked
Submit button disabled until required fields are valid enough to attempt
No error messages visible

```

Initial focus:

```text
First name field receives focus on desktop
No forced focus on mobile

```

### 18.2 Required Registration Fields

Required fields:

```text
First name
Email address
Password
Confirm password
Terms consent

```

Optional fields must not be added to registration.

Do not ask for:

```text
Last name
Phone number
Birthday
Recipient names
Payment information
Delivery address
Relationship details

```

Those belong later in onboarding or product flows.

### 18.3 First Name Field

Label:

```text
First name

```

Placeholder:

```text
James

```

Validation:

```text
Required
Minimum 1 visible character
Maximum 80 characters
Trim leading and trailing whitespace

```

Error copy:

```text
Enter your first name.

```

### 18.4 Email Field

Label:

```text
Email address

```

Placeholder:

```text
you@example.com

```

Validation:

```text
Required
Must match valid email format
Trim leading and trailing whitespace
Convert to lowercase before submit only if existing backend behavior supports it

```

Error copy for empty:

```text
Enter your email address.

```

Error copy for invalid format:

```text
Enter a valid email address.

```

### 18.5 Registration Submit Behavior

On submit:

```text
Disable all fields
Disable submit button
Show loading button state
Clear prior errors
Preserve all entered non password values
Preserve password fields until response returns

```

Loading text:

```text
Creating your account

```

### 18.6 Successful Registration

Successful registration behavior depends on existing backend flow.

If backend creates active session immediately:

```text
Route to onboarding start

```

Default route:

```text
/onboarding

```

If backend requires email verification first:

```text
Route to /auth/check-email

```

Check email description:

```text
We sent a verification link to your inbox. Open it to activate your account.

```

If backend returns user plus incomplete onboarding state:

```text
Route to first incomplete onboarding step

```

The frontend must not skip onboarding.

### 18.7 Existing Account Registration Error

If email already exists:

Preferred copy:

```text
An account may already exist for this email. Try signing in instead.

```

Actions:

```text
Sign in
Reset password

```

This should appear as an error banner above the form.

Do not say:

```text
This email definitely has an account.

```

### 18.8 Registration Backend Validation Errors

Backend validation errors must map to field level messages when possible.

If backend returns a field name:

```text
Show message under matching field

```

If backend returns general error:

```text
Show error banner above form

```

Generic fallback copy:

```text
We couldn’t create your account. Please check the details and try again.

```

## 19. Password Reset Behavior

Password reset must be privacy preserving.

It must never reveal whether an email exists.

### 19.1 Forgot Password Initial State

Initial state:

```text
Email field empty
Submit button disabled until email field is non empty
No validation visible

```

### 19.2 Forgot Password Submit

On submit:

```text
Validate email format
Disable field
Show loading button state
Call existing password reset request endpoint

```

Loading text:

```text
Sending reset link

```

### 19.3 Forgot Password Success

Regardless of whether email exists, show the same confirmation if backend allows.

Route:

```text
/auth/check-email

```

Confirmation copy:

```text
If an account exists for that email, reset instructions have been sent.

```

### 19.4 Forgot Password Failure

Only show failure if the request itself fails.

Examples:

```text
Network failure
Rate limit
Invalid request
Service unavailable

```

Generic failure copy:

```text
We couldn’t send the reset link. Please try again.

```

Rate limit copy:

```text
For your security, please wait a moment before requesting another reset link.

```

### 19.5 Reset Password Token Check

When reset password page loads:

```text
Read token from URL using existing route contract
Validate token according to existing backend behavior if endpoint exists
Show checking state while validating

```

Checking title:

```text
Checking your reset link.

```

Checking description:

```text
Give us a moment while we confirm this secure link.

```

If token valid:

```text
Show reset password form

```

If token invalid:

```text
Show expired link state

```

### 19.6 Reset Password Submit

On submit:

```text
Validate password requirements
Validate password confirmation
Disable fields
Show loading button state
Call existing reset password endpoint

```

Loading text:

```text
Updating password

```

### 19.7 Reset Password Success

Success card title:

```text
Password updated.

```

Description:

```text
You can now sign in with your new password.

```

Primary button:

```text
Sign in

```

Route:

```text
/auth/login

```

### 19.8 Reset Password Expired Link

Expired title:

```text
This link expired.

```

Description:

```text
For your security, password reset links only work for a limited time.

```

Primary button:

```text
Request a new link

```

Secondary link:

```text
Back to sign in

```

## 20. Magic Link Behavior

Magic links provide a lower friction sign in path.

They must feel secure, not casual.

### 20.1 Magic Link Entry Points

Magic link can be reached from:

```text
Login screen
Session expired screen
Authentication error screen

```

Primary entry copy:

```text
Email me a secure sign in link

```

### 20.2 Magic Link Initial State

Initial state:

```text
Email field empty unless carried over from login screen
Submit button disabled until email is non empty
No validation visible

```

If user entered email on login screen before selecting magic link:

```text
Carry email into magic link screen

```

### 20.3 Magic Link Submit

On submit:

```text
Validate email format
Disable form
Show loading state
Call existing magic link endpoint

```

Loading text:

```text
Sending secure link

```

### 20.4 Magic Link Success

Success route:

```text
/auth/check-email

```

Success copy:

```text
If an account exists for that email, a secure sign in link has been sent.

```

Do not reveal whether an account exists.

### 20.5 Magic Link Opened

When user opens magic link:

```text
Validate token through existing backend behavior
Show checking state
Create session if token is valid
Route to intended destination or dashboard

```

Checking title:

```text
Signing you in.

```

Checking description:

```text
Give us a moment while we confirm your secure link.

```

### 20.6 Invalid Magic Link

Title:

```text
This sign in link expired.

```

Description:

```text
Request a new secure link and we’ll send a fresh one to your inbox.

```

Primary button:

```text
Send a new link

```

Secondary button:

```text
Use password instead

```

## 21. Social Authentication Behavior

Social authentication must be supported visually without becoming the dominant experience.

### 21.1 Supported Providers

Show only providers supported by the existing backend.

Potential providers:

```text
Google
Apple
Microsoft

```

Do not show a provider unless the backend route and OAuth configuration exist.

### 21.2 Provider Button Order

Default order:

```text
Continue with Google
Continue with Apple
Continue with Microsoft

```

If only one provider is active:

```text
Show one provider button

```

If no providers are active:

```text
Hide social authentication section entirely

```

### 21.3 Social Auth Divider

Divider text:

```text
or

```

Placement:

```text
After primary email password action
Before provider buttons

```

The divider must not appear when no social providers are shown.

### 21.4 Social Auth Button Content

Each provider button:

```text
Provider icon
Provider text

```

Icon size:

```text
20px

```

Button text:

```text
Continue with Google
Continue with Apple
Continue with Microsoft

```

### 21.5 Social Auth Click Behavior

On click:

```text
Disable all provider buttons
Disable email password form
Show loading state on selected provider button
Redirect to existing OAuth provider endpoint

```

Loading text examples:

```text
Connecting to Google
Connecting to Apple
Connecting to Microsoft

```

### 21.6 Social Auth Return Success

On successful OAuth callback:

```text
Create or resume session according to backend behavior
Route to intended destination if available
Otherwise route based on onboarding completion

```

If onboarding incomplete:

```text
/onboarding

```

If onboarding complete:

```text
/dashboard

```

### 21.7 Social Auth Return Failure

Failure title:

```text
We couldn’t complete that sign in.

```

Description:

```text
Please try again or use your email and password.

```

Primary action:

```text
Return to sign in

```

Secondary action:

```text
Create account

```

### 21.8 Social Account Already Linked

If backend reports account already linked:

```text
Show success appropriate state
Continue sign in

```

Do not show a scary error.

### 21.9 Social Account Conflict

If backend reports provider email conflicts with an existing password account:

Banner title:

```text
This email already has an account.

```

Banner body:

```text
Sign in with your password first, then manage connected sign in options from Settings.

```

Actions:

```text
Sign in with password
Reset password

```

## 22. Email Verification Behavior

Email verification protects account ownership while keeping the experience warm.

### 22.1 When Verification Is Required

Verification screen appears when:

```text
New registration requires email confirmation
User signs in before verifying email
User requests verification resend
User opens verification link

```

Frontend must follow existing backend requirement.

Do not force verification if backend does not require it.

### 22.2 Verification Required State

Title:

```text
Verify your email.

```

Description:

```text
We sent a verification link to your inbox. Open it to activate your private concierge account.

```

Primary action:

```text
Resend verification email

```

Secondary action:

```text
Back to sign in

```

### 22.3 Verification Resend Behavior

On resend click:

```text
Disable resend action
Show inline loading spinner
Call existing resend verification endpoint

```

Loading copy:

```text
Sending

```

Success copy:

```text
Verification email sent.

```

Cooldown:

```text
30 seconds

```

Cooldown text:

```text
You can resend in 30 seconds.

```

### 22.4 Verification Link Opened

On route load:

```text
Read verification token from URL
Show verifying state
Call existing verification endpoint

```

Verifying state:

```text
Title: Verifying your email.
Description: Give us a moment while we confirm your account.

```

### 22.5 Verification Success

Title:

```text
Email verified.

```

Description:

```text
Your account is ready. Let’s continue setting up your Relationship Concierge.

```

Primary button:

```text
Continue

```

Route logic:

```text
If authenticated and onboarding incomplete, route to /onboarding
If authenticated and onboarding complete, route to /dashboard
If not authenticated, route to /auth/login with success message

```

Login success message:

```text
Email verified. Sign in to continue.

```

### 22.6 Verification Failure

Title:

```text
Verification link expired.

```

Description:

```text
Request a new verification email and we’ll send a fresh link.

```

Primary button:

```text
Send new verification email

```

Secondary button:

```text
Back to sign in

```

### 22.7 Already Verified State

If backend reports email already verified:

Title:

```text
Email already verified.

```

Description:

```text
You’re all set. Sign in to continue.

```

Primary button:

```text
Sign in

```

### 22.8 Verification Security Messaging

Verification screens may include a small reassurance note:

```text
This helps protect your account and keeps your relationship details private.

```

Style:

```text
Margin top: 20px
Padding: 14px 16px
Border radius: 16px
Background: Soft trust surface
Font size: 13px
Line height: 20px
Color: Secondary ink

## 23. Session Management

Session management must feel invisible when things are working and reassuring when action is required.

The frontend must preserve the existing backend session architecture.

The redesign may adjust:

```text
Session checking UI
Session expired screens
Redirect behavior
Loading states
Security messaging
Toast copy
```

The redesign must not change:

```text
Token format
Token expiration rules
Refresh behavior
Cookie behavior
Storage behavior
Backend session endpoints
Authentication middleware
```

### 23.1 Initial Session Check

When the app loads on a protected route:

```text
Check existing session using current backend behavior
Show authenticated app shell only after session is confirmed
Do not flash protected content before confirmation
Do not show login screen until session is confirmed missing or invalid
```

Initial checking state:

```text
Full page warm loading screen
Centered loading mark
Short reassurance copy
```

Copy:

```text
Opening your private concierge.
```

Layout:

```text
Width: 100vw
Min height: 100svh
Display: flex
Flex direction: column
Align items: center
Justify content: center
Gap: 18px
Background: Primary page surface
Padding: 24px
```

Loading mark:

```text
Size: 36px
Spinner or animated F.I. Forgot mark
Color: Primary action
```

Text:

```text
Font size: 15px
Line height: 22px
Font weight: 500
Color: Secondary ink
Text align: center
```

### 23.2 Valid Session

If session is valid:

```text
Hydrate authenticated user state
Hydrate app permissions from existing backend data
Continue to requested route
```

If user profile is incomplete:

```text
Route according to existing onboarding completion logic
```

### 23.3 Missing Session

If no valid session exists on protected route:

```text
Redirect to /auth/login
Preserve original requested route as redirect destination
```

Do not show an error banner for normal signed out access.

### 23.4 Expired Session

If session expires while user is active:

```text
Stop protected API calls that require authentication
Clear local authenticated user state according to existing behavior
Redirect to /auth/session-expired
Preserve attempted destination when practical
```

Session expired screen copy:

```text
Your session expired.
For your privacy, please sign in again to continue.
```

Reassurance copy:

```text
Your drafts and relationship details are safe.
```

Primary action:

```text
Sign in again
```

### 23.5 Background Session Expiration

If session expires while user is inactive and user returns:

```text
Show session expired screen before exposing app content
Do not briefly render stale private data
```

If the user had an unsaved draft:

```text
Preserve local draft state only if existing application behavior already supports it
Show draft recovery messaging after re authentication
```

Draft recovery toast:

```text
Your draft was kept on this device.
```

### 23.6 Session Refresh

If backend supports refresh:

```text
Attempt refresh silently before interrupting user
Show no UI unless refresh fails
```

If refresh succeeds:

```text
Continue current route
No toast
No banner
```

If refresh fails:

```text
Redirect to /auth/session-expired
```

### 23.7 Logout Behavior

Logout must feel final, clean, and safe.

On logout click:

```text
Call existing logout endpoint
Clear authenticated state according to existing behavior
Redirect to /auth/login
```

Optional confirmation is not required for normal logout.

If user has unsaved work:

```text
Use existing unsaved changes guard
Ask before leaving if supported
```

Logout loading state:

```text
Button disabled
Spinner shown
Text: Signing out
```

Post logout toast on login screen:

```text
You’ve been signed out.
```

## 24. Remember Me Behavior

Remember me must be simple and trustworthy.

The frontend must follow existing backend rules for persistent sessions.

### 24.1 Remember Me Placement

Location:

```text
Login form
Below password field
Above primary sign in button
```

Desktop layout:

```text
Display: flex
Align items: center
Justify content: space-between
Gap: 16px
```

Mobile layout above 360px:

```text
Same as desktop
```

Mobile layout below 360px:

```text
Display: flex
Flex direction: column
Align items: flex-start
Gap: 10px
```

### 24.2 Checkbox Styling

Checkbox:

```text
Width: 18px
Height: 18px
Border radius: 5px
Border: 1px solid Strong warm border
Background: Field surface
```

Checked:

```text
Background: Primary action
Border color: Primary action
Icon: check
Icon color: White
Icon size: 12px
```

Focus:

```text
Outline: 3px solid primary action focus ring
Outline offset: 2px
```

Label:

```text
Remember me
Font size: 14px
Line height: 20px
Font weight: 500
Color: Secondary ink
```

### 24.3 Remember Me Meaning

Remember me means:

```text
Keep me signed in on this device according to existing backend session rules.
```

It must not imply:

```text
Save my password
Skip security forever
Trust all devices
```

Optional helper tooltip:

```text
Keeps you signed in on this device.
```

Tooltip style:

```text
Font size: 12px
Line height: 16px
Background: Primary ink
Color: White
Border radius: 8px
Padding: 6px 8px
Max width: 180px
```

### 24.4 Remember Me Default State

Default:

```text
Unchecked
```

If existing backend or stored preference remembers prior choice:

```text
Restore previous choice
```

Do not pre check for first time users.

### 24.5 Remember Me Submission

On login submit:

```text
Include rememberMe value only if existing login endpoint accepts it
Otherwise preserve existing session behavior
```

If backend does not support explicit remember me:

```text
Keep UI hidden
```

Do not show a nonfunctional checkbox.

## 25. Multi Device Behavior

F.I. Forgot may be used across phones, tablets, laptops, and shared family devices.

Multi device behavior must feel clear and secure.

### 25.1 Simultaneous Sessions

The frontend must support existing backend behavior for multiple active sessions.

If backend allows simultaneous sessions:

```text
Do not warn the user during normal login
Allow access on each authenticated device
```

If backend limits sessions:

```text
Show backend provided messaging
Do not invent device management behavior
```

### 25.2 New Device Messaging

If backend identifies a new device:

```text
Show subtle reassurance after login only if supported
```

Toast copy:

```text
Signed in on this device.
```

If backend sends a security notification email:

```text
Do not duplicate with alarming UI
```

### 25.3 Shared Device Consideration

On login screens, include subtle privacy copy only where appropriate.

Approved copy:

```text
Using a shared device? Leave Remember me unchecked.
```

Placement:

```text
Below Remember me row
Font size: 12px
Line height: 18px
Color: Muted ink
Margin top: 8px
```

Show this only when Remember me is visible.

### 25.4 Device Management Future Placeholder

If Settings later supports device management, the auth frontend must be ready to link to it.

Future route placeholder:

```text
/settings/security/devices
```

Do not expose this link until backend support exists.

## 26. Two Factor Authentication Architecture

Two factor authentication is a future ready architecture section.

The current frontend must not show two factor setup unless backend support exists.

However, components must be designed so two factor can be added without redesigning authentication.

### 26.1 Supported Future Two Factor Methods

Potential methods:

```text
Authenticator app code
Email one time code
SMS one time code
Recovery code
Trusted device
```

Preferred hierarchy:

```text
Authenticator app
Email code
Recovery code
```

SMS should not be the primary recommendation unless it is the only backend supported method.

### 26.2 Two Factor Challenge Route

Future route:

```text
/auth/two-factor
```

Title:

```text
Confirm it’s you.
```

Description:

```text
Enter the security code for your account.
```

Fields:

```text
Six digit code
```

Primary button:

```text
Verify code
```

Secondary actions:

```text
Use a different method
Use a recovery code
Back to sign in
```

### 26.3 Code Input Layout

Code input:

```text
Six individual boxes
Each box width: 48px desktop
Each box height: 56px desktop
Each box width: 42px mobile
Each box height: 52px mobile
Gap: 8px desktop
Gap: 6px mobile
Text align: center
Font size: 22px
Font weight: 650
Border radius: 14px
Border: 1px solid default warm border
Background: Field surface
```

Focus state:

```text
Border color: Primary action
Box shadow: 0 0 0 4px primary action focus ring
```

Error state:

```text
Border color: Error
```

### 26.4 Two Factor Submit Behavior

On six digits entered:

```text
Optionally auto submit only if backend and accessibility behavior support it
Otherwise keep Verify code button
```

Preferred behavior:

```text
Do not auto submit
Enable Verify code button after complete code
```

Loading text:

```text
Verifying
```

### 26.5 Invalid Two Factor Code

Error copy:

```text
That code didn’t work. Check it and try again.
```

After failure:

```text
Clear code fields
Focus first code field on desktop
Do not forced focus on mobile
```

### 26.6 Recovery Code Route

Future route:

```text
/auth/recovery-code
```

Title:

```text
Use a recovery code.
```

Description:

```text
Enter one of your saved recovery codes to access your account.
```

Field:

```text
Recovery code
```

Primary button:

```text
Continue
```

Secondary link:

```text
Use security code instead
```

### 26.7 Trusted Device Future Behavior

If backend supports trusted devices:

Checkbox copy:

```text
Trust this device for 30 days
```

Helper copy:

```text
Only use this on devices you own.
```

Default:

```text
Unchecked
```

Do not combine trusted device with Remember me unless backend explicitly supports both.

## 27. Security Messaging

Security messaging must be reassuring and plainspoken.

It should protect trust without making the product feel scary.

### 27.1 Security Messaging Principles

Security copy must be:

```text
Short
Human
Specific
Non alarming
Non technical unless needed
```

Do not use fear based language.

Avoid:

```text
Suspicious activity detected
Threat
Compromised
Danger
Unauthorized access
```

Unless backend explicitly confirms a security event that requires this wording.

### 27.2 Approved Security Reassurance Copy

Approved copy examples:

```text
Your relationship notes and card drafts are private to your account.
```

```text
For your privacy, please sign in again.
```

```text
This helps protect your account and keeps your relationship details private.
```

```text
Use a device you trust when saving your session.
```

```text
We’ll never ask for your password by email.
```

### 27.3 Security Note Component

Security note component:

```text
Background: Soft trust surface
Border: 1px solid trust border
Border radius: 16px
Padding: 14px 16px
Display: flex
Gap: 10px
Align items: flex-start
```

Icon:

```text
Shield or lock
Size: 18px
Color: Trust green
Margin top: 1px
```

Text:

```text
Font size: 13px
Line height: 20px
Font weight: 500
Color: Secondary ink
```

Placement:

```text
Below primary form actions
Above footer helper
```

### 27.4 Password Email Warning

Password reset and security screens may include:

```text
F.I. Forgot will never ask for your password by email.
```

This must be subtle.

Style:

```text
Font size: 12px
Line height: 18px
Color: Muted ink
Text align: center
Margin top: 18px
```

## 28. Loading States

Loading states must prevent duplicate actions while keeping the user oriented.

### 28.1 Button Loading

All auth submit buttons use button level loading.

Button loading includes:

```text
Spinner
Loading text
Disabled button state
Disabled related form fields
```

Spinner:

```text
Width: 16px
Height: 16px
Border width: 2px
Animation duration: 800ms
```

### 28.2 Full Page Loading

Used for:

```text
Session check
Magic link token validation
Verification token validation
Reset token validation
OAuth callback
```

Layout:

```text
Full screen
Centered content
Warm background
Animated mark
One title
One description
```

Title style:

```text
Font size: 22px
Line height: 30px
Font weight: 650
Color: Primary ink
Text align: center
```

Description style:

```text
Font size: 15px
Line height: 24px
Color: Secondary ink
Text align: center
Max width: 360px
```

### 28.3 Skeletons

Authentication forms do not need skeletons.

Use explicit loading states instead.

Do not show skeleton inputs on login or registration.

### 28.4 Minimum Loading Duration

To avoid flicker:

```text
Minimum visual loading duration: 300ms
```

Do not delay navigation unnecessarily if backend response is already complete and app shell is ready.

### 28.5 Long Loading State

If loading exceeds 4 seconds:

Show helper copy:

```text
Still working. Please keep this page open.
```

Placement:

```text
Below loading description
Margin top: 12px
```

Style:

```text
Font size: 13px
Line height: 20px
Color: Muted ink
```

## 29. Empty States

Authentication has limited empty states.

Empty states are used only when expected data is missing from a route.

### 29.1 Missing Reset Token

If reset password route has no token:

Title:

```text
Reset link missing.
```

Description:

```text
Request a new password reset link to continue.
```

Primary button:

```text
Request reset link
```

Secondary link:

```text
Back to sign in
```

### 29.2 Missing Verification Token

If verify email route has no token:

Title:

```text
Verification link missing.
```

Description:

```text
Request a new verification email to continue.
```

Primary button:

```text
Send verification email
```

Secondary link:

```text
Back to sign in
```

### 29.3 Missing Magic Link Token

If magic link callback route has no token:

Title:

```text
Sign in link missing.
```

Description:

```text
Request a new secure sign in link to continue.
```

Primary button:

```text
Send a new link
```

Secondary link:

```text
Use password instead
```

## 30. Error States

Error states must be specific enough to help but careful enough to protect privacy.

### 30.1 Error Hierarchy

Use this hierarchy:

```text
Field level error
Form banner error
Full page error
Toast error
```

Field level errors are used for:

```text
Missing required values
Invalid email format
Password rules not met
Password confirmation mismatch
Invalid two factor code
```

Form banner errors are used for:

```text
Incorrect login details
Existing account conflict
Rate limit
Backend validation failure
```

Full page errors are used for:

```text
Invalid token
Expired link
OAuth callback failure
Missing route requirement
```

Toast errors are used for:

```text
Resend failure
Temporary network failure
Background refresh failure
```

### 30.2 Field Error Style

Field error:

```text
Display: flex
Align items: flex-start
Gap: 6px
Margin top: 6px
Font size: 13px
Line height: 18px
Font weight: 500
Color: Error
```

Icon:

```text
Alert circle
Size: 14px
Margin top: 2px
```

### 30.3 Form Error Banner Style

Form error banner:

```text
Width: 100%
Background: Error soft surface
Border: 1px solid Error soft border
Border radius: 16px
Padding: 14px 16px
Display: flex
Align items: flex-start
Gap: 10px
Margin bottom: 18px
```

Title optional:

```text
Font size: 14px
Line height: 20px
Font weight: 650
Color: Error ink
```

Body:

```text
Font size: 14px
Line height: 21px
Font weight: 500
Color: Error ink
```

### 30.4 Network Error

Copy:

```text
We couldn’t connect. Check your internet connection and try again.
```

Action:

```text
Try again
```

### 30.5 Service Error

Copy:

```text
Something went wrong on our side. Please try again.
```

Action:

```text
Try again
```

### 30.6 Unknown Error

Copy:

```text
Something went wrong. Please try again.
```

Do not show raw backend errors.

Do not show stack traces.

Do not show endpoint names.

## 31. Validation System

Validation must be immediate enough to help, but not so aggressive that it feels annoying.

### 31.1 Validation Timing

On initial render:

```text
Show no field errors
```

On blur:

```text
Validate field if value exists or field is required and user interacted
```

On submit:

```text
Validate all required fields
Show all relevant errors
Move focus to first invalid field on desktop
Do not forced focus on mobile unless accessible focus management requires it
```

On typing after error:

```text
Update or clear error as soon as field becomes valid
```

### 31.2 Email Validation

Email validation:

```text
Trim whitespace
Require one @ symbol
Require valid domain shape
Reject obvious invalid format
```

Do not over validate valid uncommon emails.

Error copy:

```text
Enter a valid email address.
```

### 31.3 Password Validation

Password validation follows Section 16.

Submit disabled until:

```text
Password has minimum required values
Confirm password matches when present
```

If backend allows submit before complete validation:

```text
Frontend should still prevent clearly invalid attempts
```

### 31.4 Terms Consent Validation

If user submits without accepting terms:

Error copy:

```text
Please agree to the Terms to create your account.
```

Placement:

```text
Below terms checkbox row
```

### 31.5 Validation Accessibility

Every field error must be connected to its input using:

```text
aria-describedby
aria-invalid="true"
```

Error summary is not required unless form has more than four visible inputs.

Registration has four fields plus terms, so on submit with multiple errors:

```text
Show field errors only
Focus first invalid field
```

## 32. Toast Notifications

Toast notifications must be used sparingly in auth.

### 32.1 Toast Placement

Desktop:

```text
Top right
Margin top: 24px
Margin right: 24px
Width: 360px
```

Mobile:

```text
Top center
Margin top: 16px
Margin left: 16px
Margin right: 16px
Width: calc(100% - 32px)
```

### 32.2 Toast Style

Toast:

```text
Background: Surface elevated
Border: 1px solid subtle warm border
Border radius: 16px
Box shadow: Premium soft shadow
Padding: 14px 16px
Display: flex
Gap: 10px
Align items: flex-start
```

Title:

```text
Font size: 14px
Line height: 20px
Font weight: 650
Color: Primary ink
```

Body:

```text
Font size: 13px
Line height: 19px
Font weight: 400
Color: Secondary ink
Margin top: 2px
```

### 32.3 Success Toasts

Examples:

```text
Verification email sent.
Password updated.
You’ve been signed out.
```

### 32.4 Error Toasts

Examples:

```text
We couldn’t send that email. Please try again.
We couldn’t reconnect. Check your internet connection.
```

### 32.5 Toast Duration

Default duration:

```text
4 seconds
```

Error duration:

```text
6 seconds
```

Persistent only if action is required.

## 33. Offline Behavior

Auth screens must handle offline states clearly.

### 33.1 Offline Detection

If browser reports offline:

```text
Disable submit buttons that require network
Show inline offline banner above form
```

Banner copy:

```text
You’re offline. Reconnect to continue.
```

### 33.2 Offline Banner Style

```text
Background: Warning soft surface
Border: 1px solid Warning soft border
Border radius: 16px
Padding: 14px 16px
Display: flex
Gap: 10px
Align items: flex-start
Margin bottom: 18px
```

Icon:

```text
Wifi off
Size: 18px
Color: Warning ink
```

Text:

```text
Font size: 14px
Line height: 21px
Font weight: 500
Color: Warning ink
```

### 33.3 Returning Online

When browser returns online:

```text
Remove offline banner
Re enable submit buttons if form is otherwise valid
Show toast only if user had attempted an action while offline
```

Toast copy:

```text
You’re back online.
```

## 34. Network Recovery

Network recovery must help users retry without losing input.

### 34.1 Failed Submit Recovery

If a submit fails due to network:

```text
Re enable fields
Preserve entered values
Clear password only if backend or security rules require it
Show network error banner
Keep user on same screen
```

### 34.2 Retry Button

Network error banners may include a retry action.

Retry action style:

```text
Inline link button
Font size: 14px
Font weight: 650
Color: Warning or Primary action depending on banner type
```

Retry behavior:

```text
Repeat last attempted request
Disable retry while loading
Preserve form values
```

### 34.3 Token Validation Recovery

If token validation fails due to network:

```text
Show full page recoverable error
Do not mark token as expired
Do not tell user link is invalid
```

Title:

```text
We couldn’t check this link.
```

Description:

```text
Check your connection and try again.
```

Primary button:

```text
Try again
```

Secondary link:

```text
Back to sign in
```

### 34.4 OAuth Recovery

If OAuth callback fails due to temporary network issue:

```text
Show authentication error page
Offer retry only if callback parameters are still present and safe to reuse
```

Primary action:

```text
Try again
```

Secondary action:

```text
Return to sign in
```

### 34.5 No Data Loss Rule

Auth network failures must never erase:

```text
Email address
First name
Remember me selection
Terms consent selection
```

Password values may be cleared after failure if required by security policy.

If cleared, show helper copy:

```text
Please re enter your password to continue.

```
## 35. Responsive Layouts

Authentication must feel intentionally designed at every screen size.

It must never look like a desktop form squeezed onto mobile.

### 35.1 Breakpoints

Use the shared responsive system.

```text
Mobile: 0px through 767px
Tablet: 768px through 1023px
Desktop: 1024px and above
Large desktop: 1440px and above
```

### 35.2 Mobile Layout

Mobile authentication screens use a single column layout.

```text
Min height: 100svh
Padding top: 24px
Padding right: 20px
Padding bottom: 32px
Padding left: 20px
Background: Primary page surface
```

Mobile form:

```text
Width: 100%
Max width: none
```

Mobile card:

```text
Background: transparent
Border: none
Box shadow: none
Padding: 0
```

Mobile title:

```text
Font size: 28px
Line height: 34px
Letter spacing: -0.025em
```

Mobile description:

```text
Font size: 15px
Line height: 24px
```

### 35.3 Tablet Layout

Tablet authentication screens use a stacked brand and form layout.

```text
Min height: 100vh
Display: flex
Flex direction: column
Background: Warm concierge background
```

Tablet brand area:

```text
Padding top: 40px
Padding right: 40px
Padding bottom: 24px
Padding left: 40px
```

Tablet form area:

```text
Padding top: 24px
Padding right: 40px
Padding bottom: 48px
Padding left: 40px
Display: flex
Justify content: center
```

Tablet auth card:

```text
Max width: 480px
Width: 100%
```

### 35.4 Desktop Layout

Desktop authentication screens use the two panel layout.

```text
Display: grid
Grid template columns: 1fr 1fr
Min height: 100vh
```

Brand panel:

```text
Padding: 48px 64px
```

Form panel:

```text
Padding: 48px 64px
Display: flex
Align items: center
Justify content: center
```

Form card:

```text
Max width: 440px
```

### 35.5 Large Desktop Layout

Large desktop must preserve intimacy.

Do not stretch the form.

```text
Auth card max width: 440px
Brand content max width: 560px
Grid columns: minmax(0, 1fr) minmax(0, 1fr)
```

Page content may be centered inside a maximum shell:

```text
Max width: 1600px
Margin left: auto
Margin right: auto
```

## 36. Component Tree

The authentication frontend must be built from reusable components.

### 36.1 Shared Auth Components

```text
AuthShell
AuthBrandPanel
AuthMobileHeader
AuthFormPanel
AuthCard
AuthCardHeader
AuthForm
AuthField
PasswordField
PasswordRequirementList
PasswordStrengthMeter
RememberMeRow
SocialAuthSection
SecurityNote
AuthErrorBanner
AuthSuccessState
AuthLoadingState
AuthToast
AuthFooterLinks
```

### 36.2 Login Component Tree

```text
LoginPage
  AuthShell
    AuthBrandPanel
    AuthFormPanel
      AuthCard
        AuthCardHeader
        AuthErrorBanner
        LoginForm
          AuthField email
          PasswordField password
          RememberMeRow
          PrimaryButton
          LinkButton magic link
        SocialAuthSection
        SecurityNote
        AuthFooterLinks
```

### 36.3 Registration Component Tree

```text
RegisterPage
  AuthShell
    AuthBrandPanel
    AuthFormPanel
      AuthCard
        AuthCardHeader
        AuthErrorBanner
        RegisterForm
          AuthField first name
          AuthField email
          PasswordField password
          PasswordRequirementList
          PasswordStrengthMeter
          PasswordField confirm password
          TermsConsent
          PrimaryButton
        SocialAuthSection
        SecurityNote
        AuthFooterLinks
```

### 36.4 Password Reset Component Tree

```text
ForgotPasswordPage
  AuthShell
    AuthBrandPanel
    AuthFormPanel
      AuthCard
        AuthCardHeader
        AuthErrorBanner
        ForgotPasswordForm
          AuthField email
          PrimaryButton
          LinkButton back to sign in
        SecurityNote
```

```text
ResetPasswordPage
  AuthShell
    AuthBrandPanel
    AuthFormPanel
      AuthCard
        TokenStateController
          AuthLoadingState
          ExpiredLinkState
          ResetPasswordForm
            PasswordField new password
            PasswordRequirementList
            PasswordStrengthMeter
            PasswordField confirm password
            PrimaryButton
```

### 36.5 Verification Component Tree

```text
VerifyEmailPage
  AuthShell
    AuthBrandPanel
    AuthFormPanel
      AuthCard
        TokenStateController
          AuthLoadingState
          VerificationSuccessState
          VerificationFailureState
          AlreadyVerifiedState
```

### 36.6 Magic Link Component Tree

```text
MagicLinkPage
  AuthShell
    AuthBrandPanel
    AuthFormPanel
      AuthCard
        AuthCardHeader
        AuthErrorBanner
        MagicLinkForm
          AuthField email
          PrimaryButton
          LinkButton use password instead
        SecurityNote
```

## 37. Animations

Animation must be subtle, warm, and functional.

No authentication animation should feel flashy.

### 37.1 Page Entrance

Auth card entrance:

```text
Opacity: 0 to 1
Transform: translateY(8px) to translateY(0)
Duration: 220ms
Easing: ease out
```

Brand panel entrance:

```text
Opacity: 0 to 1
Duration: 260ms
Delay: 60ms
Easing: ease out
```

### 37.2 Error Animation

When a form error appears:

```text
Opacity: 0 to 1
Transform: translateY(-4px) to translateY(0)
Duration: 160ms
Easing: ease out
```

Do not shake fields.

Do not use aggressive red flashing.

### 37.3 Success Animation

Success icon animation:

```text
Scale: 0.92 to 1
Opacity: 0 to 1
Duration: 180ms
Easing: ease out
```

### 37.4 Loading Animation

Spinner:

```text
Rotation duration: 800ms
Linear infinite
```

Respect reduced motion:

```text
Use static loading mark when prefers reduced motion is enabled
```

## 38. Microinteractions

Microinteractions should make the auth experience feel polished and responsive.

### 38.1 Input Focus

On focus:

```text
Border color transitions to primary action
Focus ring fades in
Background becomes slightly brighter
```

Duration:

```text
160ms
```

### 38.2 Button Hover

On hover:

```text
Move up 1px
Show soft shadow
```

Do not use hover movement on touch devices.

### 38.3 Password Visibility Toggle

On click:

```text
Icon changes between eye and eye off
Password input type toggles
Focus remains in password field
```

### 38.4 Checkbox

On check:

```text
Check icon fades in
Background changes to primary action
```

Duration:

```text
120ms
```

### 38.5 Resend Countdown

Countdown updates once per second.

Text example:

```text
Resend available in 29 seconds
```

When countdown ends:

```text
Button becomes active
Text changes to Resend email
```

## 39. Keyboard Behavior

Authentication must be fully usable by keyboard.

### 39.1 Tab Order

Tab order must follow visual order.

Login tab order:

```text
Email
Password
Show password
Remember me
Forgot password
Sign in
Magic link
Social auth buttons
Create account
```

Registration tab order:

```text
First name
Email
Password
Show password
Confirm password
Show password
Terms checkbox
Terms link
Privacy link
Create account
Social auth buttons
Sign in
```

### 39.2 Enter Key

Pressing Enter inside a valid form:

```text
Submits the form
```

Pressing Enter inside an invalid form:

```text
Shows validation errors
Focus moves to first invalid field on desktop
```

### 39.3 Escape Key

Escape key behavior:

```text
Closes open tooltip
Closes open toast only if toast is focused
Does not clear form values
Does not navigate away
```

### 39.4 Password Code Inputs

For future two factor code inputs:

```text
One digit per field
Backspace on empty field moves to previous field
Paste six digit code fills all fields
Arrow left and right move between fields
```

## 40. Accessibility

Authentication must meet WCAG AA expectations.

### 40.1 Semantic Structure

Each auth page must include:

```text
One h1
Semantic form element
Labels connected to inputs
Buttons for actions
Links for navigation
```

### 40.2 Focus Visibility

Every interactive element must have visible focus.

Focus ring:

```text
2px or 3px visible outline
Color: Primary action focus
Offset: 2px to 4px
```

### 40.3 Error Accessibility

Error messages must be announced.

Use:

```text
aria-invalid
aria-describedby
role="alert" for form level errors
aria-live="polite" for async success messages
```

### 40.4 Color Contrast

All text must meet contrast requirements.

Minimum:

```text
Normal text: 4.5 to 1
Large text: 3 to 1
Interactive controls: 3 to 1
```

### 40.5 Reduced Motion

If user prefers reduced motion:

```text
Remove page entrance transforms
Keep opacity transitions under 100ms
Use static loading indicator where possible
```

### 40.6 Mobile Accessibility

Mobile tap targets:

```text
Minimum 44px by 44px
```

Inputs:

```text
Minimum height 52px
```

Avoid tiny inline links near checkboxes.

## 41. Analytics

Authentication analytics must help improve the experience without collecting sensitive content.

### 41.1 Events

Track the following events if analytics infrastructure already exists:

```text
auth_login_viewed
auth_login_submitted
auth_login_success
auth_login_failed
auth_register_viewed
auth_register_submitted
auth_register_success
auth_register_failed
auth_password_reset_requested
auth_password_reset_completed
auth_magic_link_requested
auth_magic_link_completed
auth_email_verification_completed
auth_session_expired
auth_logout_completed
```

### 41.2 Event Properties

Allowed properties:

```text
method
provider
error_type
screen
redirect_destination_type
onboarding_required
```

Do not track:

```text
Password
Reset token
Verification token
Magic link token
Full email address
Relationship names
Recipient names
Card content
Personal memories
```

### 41.3 Error Type Mapping

Allowed error types:

```text
validation_error
invalid_credentials
rate_limited
network_error
expired_token
oauth_error
unknown_error
```

## 42. API Mapping

The frontend must map to existing backend APIs.

Endpoint names below are conceptual and must be replaced with the actual existing routes.

### 42.1 Login

```text
Action: Submit email password login
Method: Existing backend method
Payload: email, password, rememberMe if supported
Success: session user object or token response
Failure: validation error, invalid credentials, rate limit
```

### 42.2 Registration

```text
Action: Create account
Payload: firstName, email, password, acceptedTerms if supported
Success: session or verification required response
Failure: validation error, account conflict, rate limit
```

### 42.3 Logout

```text
Action: End session
Payload: none unless backend requires token
Success: clear authenticated state
Failure: clear local state only if existing behavior permits
```

### 42.4 Password Reset Request

```text
Action: Request password reset
Payload: email
Success: check email state
Failure: network or rate limit
```

### 42.5 Password Reset Confirm

```text
Action: Set new password
Payload: token, password
Success: password updated
Failure: expired token, invalid token, validation error
```

### 42.6 Magic Link Request

```text
Action: Request magic link
Payload: email
Success: check email state
Failure: network or rate limit
```

### 42.7 Magic Link Confirm

```text
Action: Confirm magic link token
Payload: token
Success: session created
Failure: expired token, invalid token
```

### 42.8 Email Verification

```text
Action: Verify email token
Payload: token
Success: verified state
Failure: expired token, invalid token
```

### 42.9 Resend Verification

```text
Action: Resend verification email
Payload: email or authenticated user context depending on existing backend
Success: verification email sent
Failure: rate limit, network error
```

### 42.10 Session Check

```text
Action: Fetch current session
Payload: existing auth credentials
Success: authenticated user
Failure: unauthenticated or expired session
```

## 43. Performance

Authentication screens must load quickly.

### 43.1 Initial Load

Targets:

```text
Auth shell interactive under 2 seconds on average connection
Form visible before non critical illustration
No blocking animation assets
```

### 43.2 Asset Loading

Brand illustration:

```text
Lazy load on desktop
Hidden or deferred on mobile
Use optimized image format
Reserve layout space to avoid shift
```

Logo:

```text
Load immediately
Use vector when available
```

### 43.3 Bundle Size

Authentication routes should avoid loading the full authenticated app bundle before login.

Use route level code splitting where supported.

### 43.4 Layout Shift

Cumulative layout shift target:

```text
Near zero
```

Reserve space for:

```text
Error banners
Password helper
Loading states
Brand illustration
```

### 43.5 Form Responsiveness

Typing must remain instant.

Validation must not block input.

Password strength calculations must be lightweight and local.

## 44. Acceptance Criteria

Authentication is accepted only when all criteria are met.

### 44.1 Visual Acceptance

```text
All auth screens use the shared AuthShell.
Desktop uses two panel layout.
Tablet uses stacked layout.
Mobile uses single column layout.
Forms match spacing, typography, radius, and shadow specifications.
No generic browser default form styling remains.
```

### 44.2 Functional Acceptance

```text
Users can register.
Users can log in.
Users can log out.
Users can request password reset.
Users can complete password reset.
Users can request magic link if backend supports it.
Users can complete magic link login if backend supports it.
Users can verify email if backend requires it.
Session expiration routes users safely.
Protected content never flashes before session confirmation.
```

### 44.3 Validation Acceptance

```text
Required fields validate correctly.
Email format validates correctly.
Password requirements display correctly.
Confirm password matching works.
Backend errors map to field or banner errors.
Unknown errors use safe fallback copy.
```

### 44.4 Security Acceptance

```text
Login errors do not reveal whether email exists.
Password reset request does not reveal whether email exists.
Magic link request does not reveal whether email exists.
Tokens are never displayed in UI.
Tokens are never sent to analytics.
Passwords are never logged.
Remember me is hidden if unsupported.
Social providers are hidden if unsupported.
```

### 44.5 Accessibility Acceptance

```text
All inputs have labels.
All errors are announced.
All actions are keyboard accessible.
Focus states are visible.
Mobile tap targets meet size requirements.
Color contrast meets WCAG AA.
Reduced motion is respected.
```

### 44.6 Responsive Acceptance

```text
No horizontal scrolling at 320px width.
Forms remain usable at 320px width.
Desktop card never stretches beyond max width.
Brand panel hides or collapses appropriately on mobile.
Remember me row stacks below 360px.
```

### 44.7 Performance Acceptance

```text
Auth screens load without unnecessary authenticated app code.
Illustrations do not block form rendering.
No major layout shift occurs when errors appear.
Loading states appear immediately after submit.
Duplicate submits are prevented.
```

## 45. Definition Of Done

89_AUTHENTICATION_BUILD_SPEC.md is complete when:

```text
Every authentication route has a defined purpose, layout, copy system, loading state, success state, error state, and responsive behavior.
```

```text
The frontend team can build login, registration, password reset, magic link, email verification, session expired, and auth error screens without making UX decisions.
```

```text
The implementation preserves all existing backend authentication behavior and API contracts.
```

```text
The authentication experience feels like the private entrance to a premium Relationship Concierge.
```

```text
The experience is secure without feeling cold.
```

```text
The experience is warm without feeling unserious.
```

```text
The experience is simple without feeling generic.
```

```text
No authentication screen refers to F.I. Forgot as a reminder app, greeting card app, or AI writing tool.
```

```text
All copy, layout, validation, accessibility, analytics, and performance requirements in this document are implemented and reviewed.
```

At completion, authentication should feel quiet, private, premium, and effortless.

It should make the user think:

```text
This is a safe place for the people who matter.
```


```

