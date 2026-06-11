---
name: Sprint 2B Onboarding
description: 6-phase first-value onboarding flow; generate card during onboarding; dashboard first-time state
---

## Flow phases
`"who" → "like" → "memory" → "generating" → "draft" → "address" → "done"`

- **who**: name, relationship, first occasion (relationship-specific short list), date
- **like**: personality (optional, max 1), interests (required 1–2), thingsToAvoid (optional)
- **memory**: relationship-specific prompt, nickname (petName), skip option
- **generating**: calls `/api/v2/generate-card`, shows loading
- **draft**: shows cards[0].text (Best Match), "Approve", 1 revision via `/api/v2/refine-card`, "Save to dashboard" escape
- **address**: after approval, skippable
- **done**: "Add Another Person" primary CTA

## Generate-card call (onboarding)
```
POST /api/v2/generate-card
{ firstName, relationship, occasion, tone, objective, emotionalOpenness, details, avoidMentioning, avoidList:[], senderName }
Response: { cards: [{ text },...] }   ← use cards[0].text
```

## Refine-card call
```
POST /api/v2/refine-card
{ cardText, instruction, context: "relationship • occasion • firstName" }
Response: { text?: string }
```

## Card save sequence
1. Call `completeOnboarding(finalData)` → saves recipient to localStorage
2. Immediately call `getRecipients()`, find by name match
3. Build `CardOrder` with that recipient id, call `saveCard(card)`

**Why the two-step:** `completeOnboarding` generates the id via `Date.now().toString()` internally; cannot be pre-computed. Name match is safe since onboarding is single-user, first-time only.

## Recipient type field names
- `r.relationship` (NOT `r.relationshipType`)
- No `emoji` field — use `r.name.charAt(0).toUpperCase()` as avatar initial

## Dashboard first-time state
```ts
const isFirstTimeState = recipients.length === 1 && cards.some(c => c.recipientId === recipients[0]?.id);
```
Shows positive "Good start. You've got [Name] covered." state instead of health warnings.
Condition: wrap normal-state block with `!isFirstTimeState`.
Shows: success strip (sage), recipient+card tile, address nudge if no address, "Add Another Person" dashed CTA.
