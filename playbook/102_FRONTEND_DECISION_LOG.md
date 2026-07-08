# 102_FRONTEND_DECISION_[LOG.md](http://LOG.md)

# Frontend Decision Log

---

# Purpose

This document records every intentional frontend implementation decision made during the rebuild of F.I. Forgot.

The purpose of this log is to preserve engineering intent.

As implementation progresses, developers will inevitably encounter situations where multiple valid technical solutions exist.

When a decision is made that is not already explicitly documented in the Playbook, it should be recorded here.

This prevents future developers from unknowingly reversing important implementation choices.

This document is not a feature specification.

This document is not a requirements document.

It is a historical record of intentional decisions.

---



# Guiding Principle

The Playbook remains the single source of truth.

If a decision conflicts with the Playbook, the Playbook wins.

This log exists only for implementation details that do not alter product behavior.

---



# Decision Entry Format

Every decision should follow the same structure.

---



## Decision ID

Unique sequential identifier.

Example:

```

FDL-001

```

---



## Date

Record the implementation date.

---



## Area

Examples include:

Application Shell

Dashboard

Calendar

Authentication

Billing

AI Concierge

Navigation

Performance

Accessibility

Testing

Infrastructure

Design System

---



## Decision

Describe the implementation decision.

---



## Reason

Explain why this approach was selected.

---



## Alternatives Considered

Briefly describe any meaningful alternatives.

---



## Impact

Identify what is affected.

Examples:

Performance

Accessibility

Maintainability

Developer Experience

User Experience

Testing

---



## Related Playbook Files

Reference applicable specification documents.

---



## Approved By

Record the approving stakeholder.

---



# Decision Status

Each decision should include one of the following statuses.

Draft

Approved

Superseded

Deprecated

Rejected

Only Approved decisions should influence implementation.

---



# Decision Categories

---



## Architecture

Application architecture.

Folder organization.

Routing.

Providers.

State management.

API structure.

---



## Design System

Component implementation.

Token usage.

Responsive behavior.

Animation implementation.

Styling approach.

---



## Performance

Rendering strategy.

Lazy loading.

Caching.

Bundle optimization.

Prefetching.

---



## Accessibility

Keyboard navigation.

Focus behavior.

Screen reader implementation.

Reduced motion.

Color accessibility.

---



## User Experience

Navigation behavior.

Loading experiences.

Error recovery.

Workflow refinements.

Interaction polish.

---



## Testing

Testing strategy.

Automation.

Regression testing.

Performance testing.

Accessibility testing.

---



## Infrastructure

Deployment.

CI/CD.

Build tooling.

Developer workflow.

Environment configuration.

---



# Active Decisions

No implementation decisions have been recorded.

---



# Superseded Decisions

None.

---



# Rejected Decisions

None.

---



# Decision History



## FDL-001

Status

Approved

Date

Implementation Pending

Area

Architecture

Decision

The frontend will remain a presentation layer only.

Business logic will continue to reside entirely within the existing backend.

Reason

Preserves proven backend behavior while allowing unlimited frontend evolution.

Alternatives Considered

Moving business logic into frontend state.

Result

Rejected.

Impact

Improves maintainability.

Reduces duplication.

Preserves existing API contracts.

Related Playbook Files

92

95

99

100

---



## FDL-002

Status

Approved

Date

Implementation Pending

Area

Architecture

Decision

Existing backend APIs will remain unchanged.

Reason

Prevents unnecessary backend risk during the frontend rebuild.

Alternatives Considered

Redesigning API contracts.

Result

Rejected.

Impact

Reduces migration risk.

Maintains production stability.

Related Playbook Files

99

100

---



## FDL-003

Status

Approved

Date

Implementation Pending

Area

Design System

Decision

All reusable components must consume Design Tokens rather than hardcoded visual values.

Reason

Allows future visual evolution without component rewrites.

Impact

Improves consistency.

Improves maintainability.

Related Playbook Files

40 through 70

96

99

---



## FDL-004

Status

Approved

Date

Implementation Pending

Area

User Experience

Decision

The product experience will always prioritize relationships over greeting cards.

Reason

Supports the Relationship Concierge philosophy.

Impact

Influences navigation.

Information hierarchy.

Copy.

Future feature prioritization.

Related Playbook Files

17 through 36

81 through 99

---



## FDL-005

Status

Approved

Date

Implementation Pending

Area

Illustrations

Decision

Doghouse Dave Asset 001 remains the canonical homepage illustration until officially replaced.

Reason

Maintains consistent brand identity.

Impact

Homepage.

Marketing.

Onboarding.

Brand recognition.

Related Playbook Files

70

88

99

---



# Decision Review Process

Every new decision should be reviewed before implementation.

Questions to ask:

Does this change product behavior?

Does this conflict with the Playbook?

Can this be solved without introducing new architecture?

Will future developers understand why this decision was made?

If the answer to any of these questions is uncertain, the decision should be discussed before implementation.

---



# Decision Retirement

When a decision is no longer relevant:

Do not delete it.

Mark it as Superseded or Deprecated.

Record:

The replacement decision.

The date.

The reason.

Historical context should always be preserved.

---



# Success Criteria

A successful Decision Log should ensure:

Every significant implementation choice has documented reasoning.

Future developers understand why decisions were made.

No important architectural decisions are lost over time.

The Playbook remains authoritative while implementation history remains transparent.

The frontend can continue evolving confidently without repeating past debates or undoing intentional work.

---



# Phase 1 — Implementation Log

Living record of Phase 1 repository-preparation steps. Earlier steps (Entries 001–005) are summarized in `101_IMPLEMENTATION_PROGRESS_TRACKER.md` Recently Completed.

---



## Entry 006 — Phase 1: Replit/Linux build + typecheck confirmed


| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| **Date**   | 2026-06-29                                     |
| **Phase**  | 1 — Repository Preparation                     |
| **Step**   | Build verification on Replit/Linux (confirmed) |
| **Branch** | `frontend-rebuild`                             |




### Context

Replit workspace initially had stale `recipient-profile.tsx` (22 typecheck errors). TypeScript fix applied locally (`BLACK` → `INK`; archive modal moved into `RecipientProfilePage` scope). After syncing the fixed file to Replit, verification was re-run on Replit/Linux.

### Commands run (Replit/Linux)

```bash
pnpm --filter @workspace/fi-forgot run typecheck
PORT=25460 BASE_PATH=/ pnpm --filter @workspace/fi-forgot run build
```



### Results


| Check                                                                 | Exit code | Result     |
| --------------------------------------------------------------------- | --------- | ---------- |
| `pnpm --filter @workspace/fi-forgot run typecheck`                    | **0**     | **Passed** |
| `PORT=25460 BASE_PATH=/ pnpm --filter @workspace/fi-forgot run build` | **0**     | **Passed** |


**Build Verified:** Yes — typecheck and production build both confirmed on Replit/Linux.

### Backend untouched confirmation

- **No files modified** under `artifacts/api-server/`** in this verification step
- Playbook documentation only



### Tracker impact

- **Build Verified:** Marked complete.
- **Development Ready:** Not marked — environment/lint/dev-server gates remain.



### Next recommended action

Continue Phase 1: **Repository Cleaned** (next unchecked tracker gate).

---



## Entry 007 — Phase 1: Repository Cleaned (legacy quarantine)


| Field      | Value                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| **Date**   | 2026-06-29                                                                     |
| **Phase**  | 1 — Repository Preparation                                                     |
| **Step**   | Repository Cleaned — safest hygiene (quarantine, no permanent legacy deletion) |
| **Branch** | `frontend-rebuild`                                                             |




### Approach

Orphan pages and components moved to `src/_legacy/` (not deleted). Confirmed dead exports removed. Development-only `public/` previews deleted. No route, API, or backend changes.

### Files moved to `src/_legacy/pages/`


| From                           | To                                     |
| ------------------------------ | -------------------------------------- |
| `src/pages/login.tsx`          | `src/_legacy/pages/login.tsx`          |
| `src/pages/signup.tsx`         | `src/_legacy/pages/signup.tsx`         |
| `src/pages/try.tsx`            | `src/_legacy/pages/try.tsx`            |
| `src/pages/recipients.tsx`     | `src/_legacy/pages/recipients.tsx`     |
| `src/pages/brownie-points.tsx` | `src/_legacy/pages/brownie-points.tsx` |




### Files moved to `src/_legacy/components/`


| From                                           | To                                                     |
| ---------------------------------------------- | ------------------------------------------------------ |
| `src/components/ProfileQuestionCard.tsx`       | `src/_legacy/components/ProfileQuestionCard.tsx`       |
| `src/components/RelationshipHealthSection.tsx` | `src/_legacy/components/RelationshipHealthSection.tsx` |
| `src/components/demo-form.tsx`                 | `src/_legacy/components/demo-form.tsx`                 |
| `src/components/brand/DaveBackground.tsx`      | `src/_legacy/components/DaveBackground.tsx`            |




### Dead exports removed (zero references confirmed)


| Export                      | File                             |
| --------------------------- | -------------------------------- |
| `SectionTitle`              | `src/components/personal-ui.tsx` |
| `limitLabel()`              | `src/lib/plan.ts`                |
| `buildHomeHeroSubline()`    | `src/lib/personal-brand.ts`      |
| `personStatusLine()`        | `src/lib/personal-brand.ts`      |
| `daysUntilNextOccurrence()` | `src/lib/data.ts`                |




### Files deleted (dev-only, zero runtime references)


| File                                   |
| -------------------------------------- |
| `public/card-gallery.html`             |
| `public/humor-v2/index.html`           |
| `public/humor-v2/with-text.html`       |
| `public/humor-v2/` (directory removed) |




### Commands run

```bash
pnpm --filter @workspace/fi-forgot run typecheck
```



### Results


| Check                                                                 | Environment     | Exit code | Result                               |
| --------------------------------------------------------------------- | --------------- | --------- | ------------------------------------ |
| `pnpm --filter @workspace/fi-forgot run typecheck`                    | Local (Windows) | **0**     | **Passed**                           |
| `pnpm --filter @workspace/fi-forgot run typecheck`                    | Replit/Linux    | —         | Agent SSH blocked; re-run after sync |
| `PORT=25460 BASE_PATH=/ pnpm --filter @workspace/fi-forgot run build` | Replit/Linux    | —         | Agent SSH blocked; re-run after sync |




### Backend untouched confirmation

- **No files modified** under `artifacts/api-server/`**
- No route, redirect, or API client changes



### Tracker impact

- **Repository Cleaned:** Marked complete (local typecheck passed; hygiene-only changes).
- **Environment Configured:** Not marked — next gate.
- **Development Ready:** Not marked.



### Next recommended action

Sync to Replit and re-run typecheck + build. Continue Phase 1: **Environment Configured**.

---



## Entry 008 — Phase 1: Environment Configured


| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| **Date**   | 2026-06-29                                            |
| **Phase**  | 1 — Repository Preparation                            |
| **Step**   | Development environment tooling (smallest safe setup) |
| **Branch** | `frontend-rebuild`                                    |




### Implemented


| Item         | Path / detail                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Env template | `artifacts/fi-forgot/.env.example` — `PORT=25460`, `BASE_PATH=/`                                                               |
| Dev docs     | `artifacts/fi-forgot/README.md` — Replit workflow, Windows limits, build commands                                              |
| ESLint       | `artifacts/fi-forgot/eslint.config.js` — flat config; TypeScript; React Hooks; jsx-a11y (warn-level); ignores `src/_legacy/**` |
| Prettier     | `artifacts/fi-forgot/.prettierrc`, `.prettierignore`                                                                           |
| Scripts      | `lint`, `lint:fix`, `format`, `format:check` in `package.json`                                                                 |




### ESLint baseline policy

Conservative Phase 1 baseline: jsx-a11y and most stylistic rules at **warn**; `react-hooks/rules-of-hooks` at **warn** until hook violations are fixed in a dedicated pass. **0 errors** required for gate; 403 warnings reported on first run.

### Commands run

```bash
pnpm --filter @workspace/fi-forgot run lint
pnpm --filter @workspace/fi-forgot run typecheck
```



### Results


| Check                                                                 | Environment  | Exit code | Result                                                    |
| --------------------------------------------------------------------- | ------------ | --------- | --------------------------------------------------------- |
| `pnpm --filter @workspace/fi-forgot run lint`                         | Local        | **0**     | **Passed** — 0 errors, 403 warnings                       |
| `pnpm --filter @workspace/fi-forgot run typecheck`                    | Local        | **0**     | **Passed**                                                |
| `pnpm --filter @workspace/fi-forgot run typecheck`                    | Replit/Linux | —         | Agent SSH blocked; re-run after sync                      |
| `PORT=25460 BASE_PATH=/ pnpm --filter @workspace/fi-forgot run build` | Replit/Linux | —         | Agent SSH blocked; config-only changes — build unaffected |




### Backend untouched confirmation

- **No files modified** under `artifacts/api-server/`**
- No route, API client, or application logic changes



### Tracker impact

- **Environment Configured:** Marked complete.
- **Development Ready:** Not marked — next gate.



### Next recommended action

Sync to Replit; run `lint`, `typecheck`, and `build`. Complete **Development Ready** gate (dev server + lint/format CI readiness).



---

## Entry 009 — Relationship Intelligence: DecisionContext Integration

| Field | Value |

|-------|-------|

| Date | 2026-07-08 |

| Phase | Relationship Intelligence Engine |

| Step | DecisionContext wired into Decision Engine |

| Branch | frontend-rebuild |

| Commit | a95a90e |

### Decision

DecisionContext is now the canonical input to the Decision Engine.

### Rationale

The Brain should make decisions from an abstracted relationship state rather than consuming RelationshipContext or raw Brain Signals directly.

### Implemented

| Item | Result |

|------|--------|

| decide() input | Updated to accept DecisionContext |

| Decision behavior | Unchanged |

| Outcome | Still wait |

| Confidence | Still 0 |

| BrainResponse | Unchanged |

| Production behavior | Unchanged |

### Verification

TypeScript compile passed.

```bash

npx tsc -p artifacts/api-server/tsconfig.json --noEmit

---

