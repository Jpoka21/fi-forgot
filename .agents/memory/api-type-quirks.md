---
name: API & Type Quirks
description: Critical field name differences that cause TS errors if guessed wrong
---

## PersonalSettings (lib/data.ts)
- Field is `automationMode: "autopilot" | "approve"` — NOT `automationLevel`, NOT `"full"/"manual"`

## QueueItem (lib/admin-data.ts)
- Event type is `eventType` — NOT `holiday`
- No `deliveryPreference` field — use `eventDate` instead
- `customerApproveCard(id)` takes ONE arg — no message text

## MessageDraft (lib/admin-data.ts)
- Message text is `approvedMessage` or `generatedMessage` — NOT `.text`

## Admin data errors to ignore (pre-existing, not our code)
- `AdminLeads.tsx` TS2353 `focusRingColor` — pre-existing, ignore

## CardOrder (lib/data.ts)
- Status values include "Ready for approval", "Approved", "Needs profile"
- `holiday` field is the event name (Birthday, Mother's Day, etc.)
- `recipientId` + `holiday` together identify a unique in-flight card

**Why:** These mismatches caused TS errors during the Phase 2 dashboard rewrite.
