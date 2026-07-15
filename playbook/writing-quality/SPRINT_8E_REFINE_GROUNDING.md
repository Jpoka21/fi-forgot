# Sprint 8E — Refine / Rewrite factual grounding

**Status:** Production correction on `frontend-rebuild`  
**Scope:** `POST /api/v2/refine-card` only

## Generate vs Refine

**Generate** (`POST /api/v2/generate-card`) and **Refine** (`POST /api/v2/refine-card`) are **separate prompt paths**.

Sprint 8D grounding contracts (primary subject, supporting detail, anti-fabrication, sign-off) apply to **generation**.

Sprint 8E extends equivalent **factual grounding protections to Refine / Rewrite** so style adjustments cannot invent personal history that was never supplied.

## What Refine receives

Structured `groundingContext` (or `facts`) when available:

- recipient, relationship, occasion
- primaryOccasionContext, supporting details
- tone, emotional intensity, avoid selections
- signOff
- original card text + adjustment instruction

## Product rule

Rewrite may change wording, rhythm, structure, humor, and intensity.  
It may **not** invent memories, people, places, events, quotes, hobbies, activities, possessions, or shared history.
