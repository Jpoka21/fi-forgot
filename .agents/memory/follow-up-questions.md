---
name: Follow-Up Questions
description: Auto-generated questions that revisit previous fresh updates after a delay, making FiForgot feel like it remembers conversations.
---

## Concept
When a user saves a Fresh Update, the system classifies it and schedules a follow-up question to surface after 60–120 days. This makes the app feel like it remembers what was shared.

## DB Table
`follow_up_questions` — `lib/db/src/schema/follow-up-questions.ts`
Fields: `id, userId, recipientId, sourceAnswerId, category, triggerDate, question, originalAnswer, status, createdAt, answeredAt`

## Categories & Delays
| Category | Delay |
|---|---|
| NEW_HOBBY | 60 days |
| ACCOMPLISHMENT | 90 days |
| CAREER | 90 days |
| CHALLENGE | 60 days |
| FAMILY | 120 days |
| HOME_LIFE | 120 days |
| GENERAL | 90 days |

Expiry: 180 days after triggerDate with no answer → status = `expired`.

## Question Engine Priority (after profile is complete)
1. Due follow-up questions (`status=pending`, `triggerDate <= now`)
2. Fresh update questions (rotating bank)

## AI Classification
`classifyAndGenerate(answerText, recipientName)` in follow-up-questions.ts calls `gpt-4o-mini` with `response_format: json_object` to return `{ category, question }`. Falls back to `{ GENERAL, "Any updates since the last time you mentioned this?" }` if AI unavailable.

## Answer Flow
When a follow-up is answered:
1. Stored as a `fresh_update` in `question_answers` (becomes relationship memory)
2. `followUpQuestionsTable` record marked `status=answered, answeredAt=now`
3. +15 Brownie Points awarded (`follow_up_answered`)
4. A new follow-up is NOT scheduled from follow-up answers (only from organic fresh updates)

## Request/Response Shape
`POST /answer-question` body gains optional `followUpId` field when `triggerType === "follow_up"`.

## UI Treatment
`ProfileQuestionCard.tsx` handles `mode === "follow_up"` with:
- Light blue header strip (`BLUE_BG = #EEF3FD`, `BLUE = #2E6BE2`)
- "Follow Up Question" label + "You mentioned this previously. Any updates?" subtext
- "Previously: {originalAnswer}" context box with left blue border
- Blue save button

## Timeline
Follow-up records appear in `GET /v2/recipients/:id/timeline` as `type: "follow_up"` items with answered/pending/expired source labels.

**Why source-answer scheduling (not re-reading the answer later):** The question and original answer text are stored at schedule time so the UI always has full context without a join, and question quality doesn't degrade if the source answer is later archived.
