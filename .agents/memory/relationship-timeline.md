---
name: Relationship Timeline
description: Conventions for the recipient Relationship Timeline feature — data aggregation, refresh, archive pattern
---

## What it is
A chronological section at the bottom of each recipient profile page showing everything we know about the person. Sorted newest-first. Five item types: profile_gap, fresh_update, event_briefing (grouped), card, important_date.

## Archive pattern
- `archivedAt timestamp` column on `question_answers` — nullable, no default
- Archive = set `archivedAt = new Date()` via `PATCH /api/v2/recipients/:id/answers/:answerId/archive`
- `recipient-context.ts` DB query filters `isNull(questionAnswersTable.archivedAt)` (so archived answers are excluded from card generation too)
- `buildFreshUpdates` also filters `r.archivedAt === null` defensively
- Only profile_gap and fresh_update items have canArchive=true; event_briefing groups, cards, important_dates do not

## Briefing grouping
- Event briefing answers are grouped by `${eventType}_${eventYear}` into one timeline item
- Synthetic ID: `briefing_{recipientId}_{eventType}_{eventYear}` — not a real DB row ID
- Date = latest createdAt in group
- canArchive = false (grouped answers are complex to archive individually)

## Cross-component refresh pattern
- ProfileQuestionCard dispatches `window.dispatchEvent(new CustomEvent("recipient-answer-saved"))` after a successful save
- RelationshipTimeline listens for that event and calls fetchTimeline()
- **Why:** Avoids prop drilling a callback through RecipientProfilePage; both components are self-contained
- **How to apply:** Any other component that saves answers and wants the timeline to refresh should dispatch the same "recipient-answer-saved" event

## Endpoints
- `GET /api/v2/recipients/:id/timeline` → `{ items: TimelineItem[] }`
- `PATCH /api/v2/recipients/:id/answers/:answerId/archive` → `{ ok: true }`

## FreshUpdatesPanel removal
FreshUpdatesPanel was superseded by RelationshipTimeline (which shows fresh updates as a type within the full timeline). It has been removed from recipient-profile.tsx. The underlying `/api/v2/recipients/:id/fresh-updates` endpoint still exists and is used by card generation context.
