---
name: Grounded Writing Framework
description: Sprint 7 anti-fabrication changes to v2-generate-card.ts — what was changed, why, and the hasContext pattern
---

## The problem
When recipient context was sparse (name + relationship + occasion only), the model invented trips, shared activities, personality traits, and relationship history to satisfy quality requirements that assumed context always existed.

## Root causes identified (all in v2-generate-card.ts)
1. **SPECIFICITY rule** — demanded 2 specific references even when context was empty
2. **MEMORY WEAVING rule** — demanded multiple memories even when none existed
3. **OPENING LINES rule** — "open with a memory" with no conditional
4. **STORYTELLING rule** — pickleball example taught embellishment beyond provided facts
5. **Option descriptions** — "Opens with and uses the most personally relevant memories from context" + "same memories, same details" cascaded fabrication across all 3 variants when no context existed
6. **Relationship rules** — "favor stories and callbacks", "shared history", "running jokes", "small habits" all pressured invention when nothing was provided

## Key fix: `hasContext` flag in `buildUserPrompt`
```typescript
const hasContext = !!(bodyContext || contextSupplement);
```
- When `hasContext` is false: option descriptions switch to "warm, honest, no invented specifics" mode
- When `hasContext` is true: original context-rich option descriptions apply
This was the decisive fix — without it, the model kept inventing despite system-level rules.

## Changes made to `buildSystemPrompt`
- SPECIFICITY rule: conditional on context presence; explicit example of correct low-context card
- MEMORY WEAVING rule: IF multiple / IF one / IF none conditional
- OPENING LINES rule: added no-context fallback (relationship/occasion reflection, not invented memory)
- STORYTELLING rule: reframed example; explicit "do not add invented origin stories"
- Added rule 7: ANTI-FABRICATION — permanent, no exceptions, explicit list of banned inventions
- No-context specificity rule also explicitly bans vague personality attributions ("your warmth", "your steady presence")

## Changes made to relationship rules in `buildRelRules`
All rules updated with "only when present in context" / "do not invent" caveats:
- Friend: "favor stories and callbacks WHEN THEY EXIST in context"
- Spouse: "if context provides shared life details, use them; if not, write without inventing"
- Mother: "ONLY when they are present in the provided context"
- Father: "but only use memories and moments that are present in context"
- Son/Daughter: "drawn from the provided context, not invented"
- Brother: "only reference shared history when it exists in context; do not invent simply because the relationship implies one might exist"
- Sister: "only when present in context. Do not invent shared moments"
- Grandparent: "when context provides it — do not invent specifics when context is absent"

## Verified behavior (live tests)
- **Low context (Scenario A)**: Produces 3–4 sentence honest cards about the relationship and occasion. No invented events, no invented traits.
- **One memory (Scenario B)**: Marathon is the anchor. Category B inference (commitment from 6-month training) allowed. Nothing added.
- **Rich context (Scenario C)**: Full weaving of kitchen renovation, promotion, dog Miso — excellent.

## What to watch for in future prompt changes
- Never add "memories", "stories", "callbacks", or "specifics" as requirements without checking if context is present
- The `hasContext` flag must be propagated to any new option variant descriptions
- The fabrication scorer (planned, not yet implemented) should detect high-specificity words against empty context
