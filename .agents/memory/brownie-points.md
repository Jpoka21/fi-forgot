---
name: Brownie Points Foundation
description: Positive reinforcement engine — award triggers, anti-spam limits, event dispatch pattern, and key conventions.
---

## Award Triggers & Points

| Action | Points | Anti-spam |
|---|---|---|
| `recipient_created` | 15 | once per recipient (all-time) |
| `birthday_added` | 10 | once per recipient (all-time) |
| `anniversary_added` | 10 | once per recipient (all-time) |
| `fresh_update` | 10 | max 3/recipient/day |
| `fresh_update_first` | 25 | once per recipient (all-time) |
| `profile_complete` | 100 | once per recipient (all-time) |
| `card_generate` | 5 | max 5/day (global) |
| `card_send` | 25 | max 3/day (global) |
| `follow_up_answered` | 15 | max 3/day (global) |

## Milestones
`[100, 500, 1000, 2500, 5000, 10000]` — crossing triggers a special toast via the `milestone` field on AwardResult.

## Key Files
- Service: `artifacts/api-server/src/services/brownie-points.ts` — `awardPoints(userId, action, recipientId?)` returns `AwardResult | null`
- Routes: `artifacts/api-server/src/routes/brownie-points.ts` — GET `/api/v2/brownie-points/balance`, POST `/api/v2/brownie-points/award`
- DB table: `brownie_points_ledger` in `lib/db/src/schema/brownie-points.ts`; user balance in `users.browniePointsBalance` + `users.lifetimeBrowniePoints`
- Context: `artifacts/fi-forgot/src/lib/brownie-points-context.tsx` — `BrowniePointsProvider`, `useBrowniePoints()`, `dispatchBrownieAward(result)`
- Toast: `artifacts/fi-forgot/src/components/BrowniePointsToast.tsx` — listens for `fi:brownie-award` window event
- History page: `artifacts/fi-forgot/src/pages/brownie-points.tsx` — route `/brownie-points`

## Frontend Integration Pattern
Award dispatches fire **fire-and-forget** (async, try/catch, non-fatal) so they never block the main user action. Always check `data.browniePoints?.awarded` before calling `dispatchBrownieAward`.

## Window Event
`BROWNIE_AWARD_EVENT = 'fi:brownie-award'` — dispatched by `dispatchBrownieAward(result)` in the context module. The toast component listens to this event globally.

**Why:** Decouples the award toast from page-specific state; any page or component can trigger it without prop drilling.

## Award Call Sites
- `v2-recipients.ts`: POST create, PATCH birthday, POST answer-question (fresh_update / fresh_update_first / profile_complete / follow_up_answered)
- `v2-generate-card.ts`: after card generation
- `card-flow-v2.tsx`: after `advanceFromWho` (recipient create), after `generateCards`, after "SEND THIS CARD" click
