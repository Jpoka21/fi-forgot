---
name: Recipient Intelligence Stack
description: Context assembly service, prompt supplement injection, question engine, and live API endpoints — conventions, security constraints, and decisions to be consistent with.
---

## Key decisions

**profileCompleteness.missing contains label strings** (e.g. "Things to avoid"), NOT fieldKey strings (e.g. "things_to_avoid"). The question bank maps by label. Do not change this without updating both COMPLETENESS_FIELDS in recipient-context.ts and QUESTION_BANK in question-engine.ts.

**recipient_profile has no userId column.** Ownership is enforced by gating profile use on whether the recipients row belongs to the requesting userId. The fix is: `const profile = recipient ? (profileRows[0] ?? null) : null`. Do not remove this gate.

**wasSkipped=false is filtered at DB query level**, not in the pure functions. The question_answers query already filters it out. Don't add a second filter in buildBriefingSummary.

**CONTEXT_VERSION = 1** — bump when RecipientContext shape changes. QUESTION_BANK is in code (not DB) for v1 — intentional.

**thingsToAvoid goes to system prompt avoidList** (hard instruction), NOT to the user prompt supplement. This is a deliberate separation.

**Priority order:** highest (things_to_avoid) → high (interests, memories, jokes) → medium (personality, tone, always_include) → low (dates, delivery, briefing_answers). briefing_answers is low because the existing briefing flow handles it.

**Recipients used by the question engine are the legacy "recipients" table** (recipientsTable, IDs are timestamp strings from localStorage). NOT recipientsV2Table (UUID, different product flow).

**profile_gap answers** use id format `profile_gap_${recipientId}_${fieldKey}` — one row per recipient+field, upserted. triggerType = "profile_gap", eventType = "Profile".

**Frontend userId** is obtained via `getApiHeaders()` from data.ts (module-level _serverUserId set at login). The `user` object from useAuth() does NOT have an `.id` field — do not try user.id.

**Skip is session-local only** in ProfileQuestionCard (useState). No DB row, no localStorage persistence. Intentional for v1.

## Files

- `services/recipient-context.ts` — assembleRecipientContext + pure build functions
- `services/recipient-context-prompt.ts` — buildContextSupplement + extractContextAvoids
- `services/question-engine.ts` — QUESTION_BANK + getNextQuestion + getAllPendingQuestions
- `routes/debug.ts` — dev-only: /api/debug/recipient-context/:id and /api/debug/recipient-next-question/:id
- `routes/v2-recipients.ts` — production: GET/POST /api/v2/recipients/:id/next-question and /answer-question
- `routes/v2-generate-card.ts` — context wired in; body fields are primary fallback
- `fi-forgot/src/components/ProfileQuestionCard.tsx` — self-contained UI card, uses getApiHeaders() from data.ts

## Test files (run with pnpm dlx tsx)

- `__tests__/recipient-context.test.ts` — 66 tests (pure build functions)
- `__tests__/recipient-context-prompt.test.ts` — 46 tests (supplement builder + extractContextAvoids)
- `__tests__/question-engine.test.ts` — 48 tests (getNextQuestion + getAllPendingQuestions)
- `__tests__/recipient-next-question.test.ts` — 20 integration tests (live HTTP, requires server running)

**Why:** The {name} substitution test must use an entry whose reason template actually contains {name} (e.g. "Interests") — things_to_avoid reason is a general statement with no {name} placeholder.
