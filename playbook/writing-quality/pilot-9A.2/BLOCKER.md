# Pilot 9A.2 Corpus

**Status: BLOCKED — no card texts generated.**

- corpusId: pilot-9A.2-20260714
- generatedAt: 2026-07-14T21:17:19.467Z
- succeeded: 0 / 20
- failed IDs: G01, G02, G03, G04, G05, G06, G07, G08, G09, G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20

## Blocker

BLOCKER: OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_API_KEY absent (process/user/machine). No .env/.env.local with key. Localhost :3000/:5000/:8080 OPTIONS to /api/v2/generate-card timed out. Cannot call production generate-card path.

## Required to unblock

1. Set OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY) in the environment.
2. Start api-server with PORT, or set PILOT_BASE_URL to a host exposing POST /api/v2/generate-card.
3. Re-run: node playbook/writing-quality/pilot-9A.2/run-pilot.mjs

## Scenarios (no texts)

### G01 — Mom thank-you — primary + vivid support (8D regression writing face)

_Blocked; no cards._

### G02 — Mom thank-you — primary only, Simple tone

_Blocked; no cards._

### G03 — Friend birthday — sparse guest, Funny

_Blocked; no cards._

### G04 — Wife anniversary — romantic + deep

_Blocked; no cards._

### G05 — Dad Christmas holiday — warm

_Blocked; no cards._

### G06 — Friend sympathy — careful heartfelt

_Blocked; no cards._

### G07 — Son congratulations — graduation-like win

_Blocked; no cards._

### G08 — Husband apology — direct

_Blocked; no cards._

### G09 — Daughter just because — nostalgic

_Blocked; no cards._

### G10 — Grandma thinking of you — simple sparse

_Blocked; no cards._

### G11 — Coworker thank-you — respectful

_Blocked; no cards._

### G12 — Boss congratulations — promotion

_Blocked; no cards._

### G13 — Teacher thank-you — warm

_Blocked; no cards._

### G14 — Friend birthday — Funny with roast pressure

_Blocked; no cards._

### G15 — Auth Dad birthday — rich relationship profile

_Blocked; no cards._

### G16 — Auth Mom thank-you — rich + primary subject stress

_Blocked; no cards._

### G17 — Auth Husband anniversary — romantic rich

_Blocked; no cards._

### G18 — Auth coworker get well — sparse auth

_Blocked; no cards._

### G19 — Auth Daughter graduation — rich encouraging

_Blocked; no cards._

### G20 — Auth Friend apology — simple + rich memory

_Blocked; no cards._
