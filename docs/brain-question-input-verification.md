# Brain question input verification

## Scope

This R1/R2 transition corrects active-source and recipient-identity inputs without changing question selection, wording policy, expected-value policy, confidence semantics, Opportunity ordering, or presentation caps.

Production active fresh-update reads now require the authenticated owner ID, exact recipient ID, `fresh_update` trigger, answered or skipped state as appropriate, and `archived_at IS NULL`. Timeline and version-history reads remain unchanged. Concierge relationship insights retain the server-provided `recipientId`; legacy or unknown insights without that identity abstain from automatic questioning. Health selection uses the same exact ID rather than a display name.

The question hook scopes recipient, cards, fresh updates, question, profile, health, draft, skipped, saved, and pending state to the current recipient and render generation. Delayed reads, saves, timers, reloads, draft setters, and skip setters cannot update or invalidate a later selection. A save already started for an accepted original context may complete against that captured recipient, but cannot change a newer view. Existing engine-transformed and explicit manual alternate question payloads remain valid for the current context.

## Host verification

`node --experimental-strip-types scripts/src/brain-qualification/test-question-inputs.mjs` executes the production Express question router with non-empty active and skipped cases, checks generated owner, recipient, and archive SQL predicates and returned rows, executes the production request-identity helper, and builds the mounted-hook fixture in memory with pinned esbuild. It does not launch a browser or claim mounted behavior, PostgreSQL persistence, authentication, or owner workflow completion.

The deterministic fixture replaces only the storage data adapter. It bundles the actual production hook with installed React and react-dom into a closed browser script and records fixture, builder, hook, lockfile, dependency-input, and output hashes. The parent-owned accepted Windows Sandbox Chrome run loads it with `setContent` and `addScriptTag`, aborts all routed network, and controls synthetic fetch promises. Mandatory cases cover delayed success and rejection, failed second load, rapid A-to-B-to-A selection, selection to null, same-name recipients, retained save, reload, draft and skip callbacks, delayed save completion, and current engine-transformed and manual-alternate saves.

## Actual qualification contract

The fresh qualification loader inserts one separately hashed, collision-failing supplemental synthetic `fresh_update` source for the exact owned recipient without changing the base fixture bytes. Production timeline materialization creates its first observation version; the qualification then reads, archives, and restores it through supported APIs and proves active exclusion, immutable historical revisions, exact restoration, unaffected-source preservation, and restart durability. The evidence labels its origin `synthetic_fixture_loader`. API answer creation, provider classification, points, and outcome side effects are not qualified by this lifecycle proof.

The current contained Concierge browser must capture immutable fresh-update, next-question, health, and workspace response bodies. The selected workspace insight, question endpoints, rendered recipient, and selected health row must share an authoritative recipient ID. The read-only validator requires the new session-bound question-input-integrity section, current durable snapshot, production hook and bundle hashes, successful real-React mounted cases, exact recipient transport, archive/restore history, and final teardown. Historical eleventh evidence lacks this section and therefore cannot satisfy this transition.

## Remaining limits

The mounted hook run uses synthetic HTTP and proves lifecycle isolation, not real API persistence or authentication. The separate contained workflow proves actual API and PostgreSQL archive/read/restore behavior and current browser transport, not earned-question correctness. R3 earned-question authority, R4 confidence labeling, R5 unsupported copy, and R6 privacy enforcement remain unresolved separate work. This transition does not claim the whole Brain is complete.

## Executed qualification — 12 September 2026

The R1/R2 candidate based on commit `75df6d03ea68004de82665759a52698ba8f8f849` passed the fresh contained workflow at `2026-09-12T23:01:53.8048470Z`. Independent final review accepted it at `23:04:22Z`; the read-only `verify-sandbox-evidence.mjs` returned exit 0. Governed checkpoint and publication follow this qualification and are recorded separately by Orchestra.

The exact network-disabled Windows Sandbox session was `052be775-79c8-49f2-94a6-6102bbc50786`, request nonce `493ca299-df81-4135-895f-a5aa8c4f45ef`. Separate launch and actual 29-check, zero-database preflight acceptance preceded release. The session was disposed at `23:02:32Z`; independent inventory was empty, PostgreSQL was stopped, and the three qualification loopback ports were released. The Git-only Host Bridge and frozen authority documents retained their recorded hashes. The normal Codex sandbox setting remained in place; whole-file identity of the Codex configuration is not claimed.

The synthetic supplemental source `qa-r1-archive-restore-supplemental` was read from actual app-role PostgreSQL and through the production API. Its active, archived and restored history contained versions 1, 2 and 3 with immutable prior records. Six other recipient timelines and two other source histories for the target recipient remained unchanged. Database/API timestamps retained milliseconds. The restored SQL row, API projection and full timeline matched after a genuine PostgreSQL restart: the cluster identifier remained `7684787644383909588`, while postmaster start advanced from `23:01:09.470002Z` to `23:01:30.213662Z`.

The current browser workflow verified two synthetic owners and 38 immutable response envelopes, with zero denied requests or page errors. Owner A's complete observed insight inventory contained four recipient IDs while its selected question insight remained A1; owner B's inventory and selection contained B1. Exact question, health and insight identity checks passed. All nine mounted production-hook cases passed using real React and the separately declared synthetic data/HTTP/timer boundary. This does not claim actual API answer creation, real authentication or earned-question quality.

Evidence identifiers retained in ignored runtime records:

- Final independent acceptance SHA-256: `64520a0a13c417651c2e9f1eb4c18566c75c29d775ac996480246aab4d899389`.
- Durable snapshot SHA-256: `e2d5026470d1c67b260be50cab64cb9ba8f02cb6dc8a75a514d48025adc86023`.
- PostgreSQL restart receipt SHA-256: `bd9c05a88d34792eca64780ab78b8384580743bfb947009e63d667fb987a46f1`.
- Browser artifact manifest SHA-256: `3ab4fed166b6bcb8fc46f2d2c0aeaee7105f729cb4dd3dd6ead9d8f91c05df6c`.

Earlier attempt `f2fe6996-8412-4d32-aa1c-b0b6310cabca` stopped on an intentionally unadmitted answer-creation POST. The correction used a declared loader seed and retained supported archive/read/restore APIs. Attempt `ceeb3cea-fb73-422b-9c11-118f3db1d939` executed successfully but failed final admission because selected insight identity was mislabeled as the complete observed inventory. Both remain archived with their actual outcomes. The accepted run above uses corrected producer/validator meanings and fresh source/session pins; no historical receipt was edited to obtain acceptance.

R3 earned-question decisions, R4 confidence labeling, R5 source-copy truthfulness and R6 privacy/export/deletion remain separate required program work. Follow-up expiry, committed decay-transition restart persistence, production authentication, deployment and Dave are not established by this qualification. R1/R2 qualification is not whole-Brain completion.
