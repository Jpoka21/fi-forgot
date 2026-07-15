# Product follow-up — Birthday date collection (not Sprint 8E)

**Status:** Documented only. **Not implemented** in Sprint 8E.

## Intent

Guests may write a birthday card without knowing the recipient’s birth date. That is intentional for the writing path.

## Follow-up product behavior (separate task)

1. **Before / during writing:** birthday date remains **optional**.
2. **After generation:** if the date is missing, show a clear **missing-date** state (prompt to add it when ready).
3. **Before scheduling, mailing, or yearly reminders:** require the birthday date.

Do not block GENERATE on date for guests. Do not implement this state machine in Sprint 8E / 9A.2 baseline work.
