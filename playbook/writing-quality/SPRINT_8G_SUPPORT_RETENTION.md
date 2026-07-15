# Sprint 8G — Supplied Supporting Detail Retention & Meaningful Rewrite Differentiation

Narrow production regression fix after live Sprint 8E/8F QA (John / Friend / Birthday).

## Problem

Transport of `details` was healthy (frontend → API → generate prompt → refine grounding). The failure was contractual:

- Generate treated supplied support as optional enrichment with no retention preference
- No checklist expected a recognizable callback to supplied support
- Refine “preserve” did not mean visibly retain; omitted support stayed omitted on Rewrite
- Rewrite freshness was too soft (near-paraphrase + reused non-authoritative metaphors)

## Contracts

### Shared supporting-detail behavior (generate + refine)

When the user supplies a meaningful supporting detail, the card should normally contain one brief recognizable callback to that detail while keeping the primary reason dominant.

The model may omit or soften the supporting detail only when doing so clearly produces a more appropriate, tactful, or user-compliant card, such as when:

- the user explicitly requests removing or replacing it
- an avoid instruction conflicts with it
- repeating it would materially reduce the quality of the card
- the detail is inappropriate for the occasion

Paraphrasing is encouraged. The factual core should remain recognizable whenever the supporting detail is retained.

Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote.

### Generate (when `details` is nonempty)

- Apply the shared supporting-detail behavior above (normally retain; not unconditional)
- **Primary reason remains dominant**; support is subordinate, normally once when retained
- If support is long → concise recognizable callback, not full reproduction
- Awkward / sensitive support → tactful paraphrase or soften/omit when a listed reason applies; do not silently discard without a listed reason, and do not invent unrelated comedy instead

### Generate (when `details` is blank)

- Support remains optional
- Invent nothing

### Refine / Rewrite / New Version

- Authoritative supporting detail should **normally remain visible** in the revised card under the shared behavior rule
- If the original draft omitted it, **normally weave it in** unless a listed omission reason applies
- Rewrite: different opening, different structural beat order, substantially fresh wording; do not reuse distinctive original metaphors/jokes unless they came from AUTHORITATIVE FACTS
- New Version: clearly different take on the same authoritative facts
- More Personal: use supplied facts more effectively — never invent new ones

## Priority: avoid vs support

**Avoid instructions win** over a conflicting supporting detail. Omit or soften only the conflicting piece; keep primary fidelity and any non-conflicting support core.

## Out of scope

- Brain architecture
- Event Domain architecture
- v1 three-version Card Creation (`/api/generate-card`)
- Sprint 9A.2 generation
- Sprint 9B
