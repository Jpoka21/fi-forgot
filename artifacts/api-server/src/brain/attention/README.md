# Brain Attention Planner

Product-agnostic layer that ranks relationship Brain opportunities across all recipients.

## Entry point

```typescript
planAttentionOrder({ decisions, recipients })
// or
planAttentionOrder({ pool })
```

Returns ranked `GlobalOpportunity[]` (internal — never expose in HTTP responses).

## Pipeline

```text
collectProductBrainDecisions → buildGlobalOpportunityPool → planAttentionOrder
```

Product builders then `slice(cap)` and map to DTOs.

## Responsibilities

| This module | Not this module |
|-------------|-----------------|
| Global attention ordering | Product caps |
| Inclusion via `shouldIncludeOpportunity` | Dashboard / Notifications / Concierge names |
| `attentionScore` + `globalRank` (internal) | DTO mapping |
| Stable `opportunityKey` | Fatigue / exposure history (future) |

## Module boundaries

- **`brain/orchestrator.ts`** — per-relationship `executeBrain` (one recipient)
- **`brain/attention/`** — cross-recipient attention planning (all recipients)
- **`brain/product/build*.ts`** — cap + map to product DTOs

Do not re-export `brain/attention` from `brain/index.ts`.

## Contribution guidelines

1. **Never rank inside product builders.** Use `planAttentionOrder()` — the single production ranking path for Dashboard, Notifications, and Concierge.
2. **Never add product names or caps** to `planAttentionOrder`, `rankGlobalOpportunities`, or `computeAttentionScore`.
3. **Do not expose `GlobalOpportunity`** through routes or public API types.
4. **Do not mutate `ProductBrainDecision`** when ranking — wrap in new `GlobalOpportunity` objects.
5. **Fatigue and allocation** belong in future layers between planner and product mappers (see `playbook/123_BRAIN_ATTENTION_PLANNER.md`).

## Tests

- `brain-attention-architecture.test.ts` — guard against bypassing the planner
- `brain-attention-planner.test.ts` — parity with legacy rankers
- Product builder tests — DTO regression

See **123_BRAIN_ATTENTION_PLANNER.md** for full architecture.
