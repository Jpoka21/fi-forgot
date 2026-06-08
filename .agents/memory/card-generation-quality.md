---
name: Card Generation Quality (Phase 8)
description: What changed in the card generation pipeline to make cards feel personal and human — banned phrases, relationship voice rules, quality scorer, follow-up memory surfacing.
---

## Core philosophy
FiForgot is a relationship memory system, not an AI card writer. Every card should feel "I would have written this if I had more time" — not "AI wrote this for me."

## Files touched
- `artifacts/api-server/src/routes/v2-generate-card.ts` — system prompt, user prompt, quality scorer
- `artifacts/api-server/src/services/recipient-context.ts` — new `followUpAnswers` field, `buildFollowUpAnswers()`
- `artifacts/api-server/src/services/recipient-context-prompt.ts` — priority-first ordering, memory weaving instructions

## Banned phrase list
Stored as `BANNED_PHRASES_SYSTEM` constant (array) in `v2-generate-card.ts`. ~40 phrases. Also injected into the refine-card prompt. Keep in sync with `QUALITY_SCORER_BANNED_PHRASES`.

## Relationship voice rules (`buildRelRules`)
Distinct rules per relationship type: spouse/partner, mom, dad, son, daughter, brother, sister, grandparent, friend (best friend variant), professional. Each set of rules tells the AI *what makes this relationship unique* and what traps to avoid.

## Quality scorer (`scoreCardQuality`)
Pure TypeScript, no API call, 0–100:
| Dimension | Max |
|---|---|
| AI phrase detection (banned phrase scan) | 15 |
| Opening quality (generic opening check) | 20 |
| Closing quality (generic closing check) | 15 |
| Specificity (context item hits in card) | 25 |
| Memory usage (multiple sources woven in) | 25 |

- Score is returned with each card as `_qualityScore` in the API response
- `lastQualityScore` saved to `recipientMemoryTable.cardPreferences` for tracking
- **Internal only — never shown to users**

## Context priority order (in system prompt + context supplement)
1. Event Briefing Answers (most specific to this card)
2. Fresh Updates — last 90 days
3. Follow-Up Conversation Answers
4. Fresh Updates — 90–180 days
5. Permanent profile (character, interests, memories)
6. Card history (avoid repetition)

## Follow-Up Answers in context
`triggerType === "follow_up"` answers are now extracted separately from briefing/profile-gap answers.
- New field on `RecipientContext`: `followUpAnswers: FollowUpAnswer[]`
- New function: `buildFollowUpAnswers(rows)` in `recipient-context.ts`
- Surfaced in context supplement as `[Follow-up conversation answers — things we circled back on]`
- Previously these were silently bundled with briefing Q&A and effectively lost

## Memory weaving instruction
The context supplement header now includes: "Do not mention one memory at a time. Weave multiple sources together naturally into the card."

**Why:** The single biggest quality gap was cards that read as a list of facts ("You enjoy pickleball. Congrats on the kitchen.") rather than natural writing that weaves those facts into a human observation.
