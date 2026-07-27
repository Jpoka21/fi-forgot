# F.I. Forgot Design Library — Volume 05

# Collection Membership and Eligibility Standard

## Document Control

| Field | Value |
|-------|-------|
| **Standard ID** | `FI-DSN-STD-010` |
| **Disposition** | Design Standard |
| **Primary Classification** | `CLS-ASG` — Asset Library Governance |
| **Primary Volume** | 05 — Signature Collections |
| **Architectural domain** | Domain 1 — Collection Membership and Eligibility |
| **Document** | `02-collection-membership-and-eligibility-standard.md` |
| **Status** | Drafted, Pending Architecture Validation |
| **Version** | 0.2 Architecture Draft |
| **Date** | July 27, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Volume governance** | `playbook/design/volume-05-signature-collections/01-signature-collections-architecture.md` — Signature Collections Architecture (Frozen Volume Governance, Version 1.0, July 27, 2026) |
| **Volume roadmap** | `FI-DSN-VOL-001` — Design Volume Roadmap (Frozen Design Volume Roadmap, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Epistemic reference** | `FI-DSN-GOV-003` — Evidence vs Company Judgment Governance (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Brain authority reference** | `FI-DSN-GOV-004` — Brain Authority Boundary (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Upstream visual design architecture** | `playbook/design/volume-02-visual-design/01-visual-design-architecture.md` — Visual Design Architecture (Frozen Volume Governance, Version 1.0, July 23, 2026) |
| **Upstream surface implementation architecture** | `playbook/design/volume-03-surface-implementation/01-surface-implementation-architecture.md` — Surface Implementation Architecture (Frozen Volume Governance, Version 1.0, July 24, 2026) |
| **Upstream artwork intelligence architecture** | `playbook/design/volume-04-artwork-intelligence/01-artwork-intelligence-architecture.md` — Artwork Intelligence Architecture (Frozen Volume Governance, Version 1.0, July 24, 2026) |
| **Upstream philosophy** | `FI-DSN-PRN-001` — Visual Philosophy Standard (Frozen Design Principle, Version 1.0, July 24, 2026) |
| **Upstream brand expression** | `FI-DSN-STD-001` — Brand Expression Standard (Frozen Design Standard, Version 1.0, July 24, 2026) |
| **Upstream typography** | `FI-DSN-STD-002` — Typography Standard (Frozen Design Standard, Version 1.0, July 24, 2026) |
| **Upstream composition** | `FI-DSN-STD-003` — Composition Standard (Frozen Design Standard, Version 1.0, July 24, 2026) |
| **Upstream card architecture** | `FI-DSN-STD-004` — Card Architecture Standard (Frozen Design Standard, Version 1.0, July 24, 2026) |
| **Upstream surface spatial allocation** | `FI-DSN-STD-005` — Surface Spatial Allocation Standard (Frozen Design Standard, Version 1.0, July 24, 2026) |
| **Upstream envelope and exterior presentation** | `FI-DSN-STD-006` — Envelope and Exterior Presentation Standard (Frozen Design Standard, Version 1.0, July 24, 2026) |
| **Upstream Volume 04 standards** | `FI-DSN-STD-007` — Brain Visual Selection Standard (Frozen Design Standard, Version 1.0, July 24, 2026); `FI-DSN-STD-008` — Occasion and Emotional Context Standard (Frozen Design Standard, Version 1.0, July 27, 2026); `FI-DSN-STD-009` — Personalization Policy Standard (Frozen Design Standard, Version 1.0, July 27, 2026) |
| **Peer Volume 05 standards** | `FI-DSN-STD-011` — Collection Lifecycle and Consistency Standard (`Reserved, Not Drafted`) |
| **Manufacturing reference** | Applicable frozen `FI-MFG-*` standards per Volume 01 — Compliance Boundary inputs only |
| **Supporting facts** | None — company judgment standard |
| **Vendor questions** | None |

**Standard statement:** F.I. Forgot maintains **one authoritative Collection Membership and Eligibility** standard that governs Decision-stage permanent collection entity boundaries, membership authority, membership preconditions, inclusion policy, and exclusion policy for governed asset libraries — without governing visual permission, contextual selection, personalization, metadata field semantics, provenance schema ownership, manufacturing execution, storage state, runtime decisions, collection publication, maintenance, or retirement.

**Source basis:** Company judgment per `FI-DSN-GOV-003`. Applicable frozen `FI-MFG-*` obligations are consumed as Compliance Boundary inputs only. This standard is not derived from DAM behavior, product implementation, vendor facts, or Brain runtime behavior.

**Architecture draft notice:** This document is an **architecture draft only**. It defines constitutional structure, governing question, authority facets, architectural principles, provisional requirement groups, and validation gates. It does not yet contain normative requirement identifiers or populated `SHALL` / `SHALL NOT` requirement tables.

---

## 1. Purpose

This standard is the **architectural foundation** for F.I. Forgot Volume 05 Domain 1 — Collection Membership and Eligibility under `CLS-ASG`.

It answers the locked governing question:

> How shall permanent governed artwork collections define their entity boundaries, membership authority, membership preconditions, inclusion policy, and exclusion policy without redefining upstream visual permission, contextual selection, personalization, metadata semantics, provenance ownership, manufacturing feasibility boundaries, storage state, runtime decisions, or collection publication?

This architecture draft translates frozen Signature Collections Architecture Domain 1 assignment into a complete constitutional structure for later normative requirement drafting. It does not replace frozen Volume 05 architecture, frozen upstream Volumes 02–04 standards, frozen `FI-DSN-GOV-002`, frozen `FI-DSN-GOV-004`, or deferred `FI-DSN-STD-011`.

---

## 2. Scope

### 2.1 In scope (architecture layer)

- Constitutional governing question and principal subject for Domain 1
- Six validated architectural facets for permanent collection membership
- Constitutional membership vocabulary (invalidation, disqualification, revocation, and Domain 2 lifecycle terms)
- Three-type eligibility boundary model (identity, contextual, permanent membership)
- Domain 1 → Domain 2 handoff categories (constitutional outputs only)
- Upstream consumption posture without authority absorption
- Principal-subject placement and deferral relationships
- Architectural principles `MEM-P1`–`MEM-P10`
- Provisional requirement groups `G1`–`G8` for later normative drafting
- Brain Interaction policy boundary posture (Decision stage only)
- Manufacturing Compliance Boundary integration posture
- Architecture validation gate

### 2.2 Out of scope (architecture layer)

- Normative requirement identifiers (`FI-DSN-STD-010-R##`)
- Populated requirement tables with `SHALL` / `SHALL NOT` language
- Collection publication, maintenance, retirement, or longitudinal consistency policy
- Implementation procedures, workflows, DAM mechanics, APIs, or storage design

See Section 12.

---

## 3. Definitions

| Term | Definition |
|------|------------|
| **Collection Membership decision** | A governed design decision whose principal normative subject is permanent collection entity boundaries, membership authority, membership preconditions, inclusion policy, exclusion policy, or membership integrity under `CLS-ASG` Domain 1 |
| **Collection-scoped membership** | Permanent membership bounded by the collection's declared constitutional mandate — distinct from temporary, publication-bound, runtime-bound, or occasion-bound status |
| **Decision-stage membership policy** | Frozen normative membership rules recorded in Design Standards; not runtime evaluation, instance selection, DAM state, or production scheduling |
| **Governed collection entity** | A durable constitutional library container with declared identity, mandate, membership authority, population boundaries, and collection-scoped inclusion and exclusion discipline — distinct from informal tags, folders, or storage partitions |
| **Membership output** | A frozen permanent membership decision or membership boundary artifact in one of the constitutional output categories defined in Section 10 — produced for consumption by `FI-DSN-STD-011` without transferring membership ownership |
| **Permanent collection membership** | The constitutional status of an already-permitted artwork as a durable member of a governed collection — distinct from identity eligibility, contextual eligibility, and publication state |
| **Permanent collection membership eligibility** | Whether an already-permitted artwork may permanently belong to a governed collection under Domain 1 rules — the principal eligibility type owned by this standard |

---

## 4. Constitutional Inheritance

This section documents inherited constitutional authority. It does not reinterpret frozen Volume 05 architecture or upstream standards beyond acknowledgment.

### 4.1 Inherited authority

| Inherited source | What this standard inherits |
|------------------|----------------------------|
| **Volume 05 Signature Collections Architecture** | Domain 1 assignment; P1–P11; three-type eligibility matrix (Section 2.1); Domain 1 → Domain 2 consumption rule (Section 9.3.1); deferral matrix |
| **`FI-DSN-GOV-004`** | Decision-stage versus runtime distinction; Compliance Boundary consumption; prohibition on runtime policy amendment |
| **Volume 02 Visual Design Architecture and frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`–`003`** | Visual permission, identity eligibility, and global exclusions as upstream Compliance Boundary inputs |
| **`FI-DSN-STD-004`–`006`** | Surface structure, spatial limits, and exterior presentation boundaries as upstream feasibility constraints |
| **Frozen `FI-DSN-STD-007`–`009`** | Contextual application policy boundaries — occasion semantics, personalization policy, authorized selection, and context-bound eligibility as upstream inputs only |
| **Applicable frozen `FI-MFG-*`** | Manufacturing feasibility Compliance Boundary inputs |
| **`FI-DSN-GOV-002`** | Metadata handoff rules and field semantics — consumption at boundaries only |
| **`FI-DSN-STD-011` (deferred)** | Frozen peer consumer of membership outputs for publication, consistency, maintenance, and retirement when principal in Domain 2 |

### 4.2 Non-ownership under inheritance

This standard does **not** inherit authority to redefine visual permission (Volume 02), surface architecture (Volume 03), contextual eligibility or authorized selection (`FI-DSN-STD-007`), occasion semantics (`FI-DSN-STD-008`), personalization policy (`FI-DSN-STD-009`), metadata field semantics or provenance ownership (`FI-DSN-GOV-002`), collection publication or lifecycle policy (`FI-DSN-STD-011`), Brain runtime behavior, manufacturing operational policy, or engineering storage and DAM implementation.

---

## 5. Governing Question and Principal Subject

### 5.1 Locked governing question

> **How shall permanent governed artwork collections define their entity boundaries, membership authority, membership preconditions, inclusion policy, and exclusion policy without redefining upstream visual permission, contextual selection, personalization, metadata semantics, provenance ownership, manufacturing feasibility boundaries, storage state, runtime decisions, or collection publication?**

### 5.2 Principal subject

**Permanent collection membership of governed asset libraries.**

The standard governs collections as **constitutional entities**. It answers whether an already-permitted artwork may **permanently belong** to a governed collection — not whether that artwork should be selected for a specific recipient, occasion, emotional context, or personalization state, and not how production systems store, publish, or deliver assets.

### 5.3 Principal-subject placement

| Step | Question | If yes → |
|------|----------|----------|
| 1 | Is permanent collection entity boundary, membership authority, membership precondition, inclusion, exclusion, or membership integrity the principal subject? | Candidate `CLS-ASG` / Domain 1 |
| 2 | Is collection publication, cross-asset consistency over time, maintenance discipline, or retirement the principal subject? | Defer to `FI-DSN-STD-011` — Domain 2 |
| 3 | Is whether a permitted artwork may be selected for a specific situation the principal subject? | Defer to `FI-DSN-STD-007` — `CLS-BVS` |
| 4 | Is occasion or emotional context meaning the principal subject? | Defer to `FI-DSN-STD-008` — `CLS-OEC` |
| 5 | Is personalization treatment policy the principal subject? | Defer to `FI-DSN-STD-009` — `CLS-PER` |
| 6 | Is visual identity, permission, or global exclusion the principal subject? | Volume 02 |
| 7 | Is surface structure, spatial allocation, or exterior geometry the principal subject? | Volume 03 — `FI-DSN-STD-004`–`006` |
| 8 | Is metadata field definition, schema, or provenance semantics the principal subject? | `FI-DSN-GOV-002` |
| 9 | Is manufacturing execution, production scheduling, or fulfillment timing the principal subject? | `FI-MFG-*` / engineering |
| 10 | Is asset storage, DAM behavior, API design, or workflow mechanics the principal subject? | Engineering — not Volume 05 |

When steps conflict, **principal normative subject** per `FI-DSN-VOL-001` Section 14.1 governs.

---

## 6. Three-Type Eligibility Boundary Model

Volume 05 architecture Section 2.1 defines three peer-separated eligibility types. This standard preserves that model without collapse.

| Eligibility type | Constitutional owner | Governing question | This standard's role |
|------------------|------------------------|--------------------|----------------------|
| **Identity eligibility** | Volume 02 | May this visual treatment exist? | **Consume** — upstream Compliance Boundary; do not redefine |
| **Contextual eligibility** | Volume 04 — `CLS-BVS` / `FI-DSN-STD-007` | May this permitted artwork be selected for this specific situation? | **Consume** — upstream Compliance Boundary; do not own |
| **Permanent collection membership eligibility** | Volume 05 — Domain 1 — `CLS-ASG` / this standard | May this already permitted artwork permanently belong to this governed collection? | **Own** when principal |

**Permanent rule (inherited from Volume 05 Section 2.1):**

> Identity eligibility governs existence. Contextual eligibility governs instance selection. Permanent collection membership eligibility governs library belonging. These are peer-separated authorities; none substitutes for another.

#### Worked boundary example

| Scenario | Eligibility type | Owner |
|----------|------------------|-------|
| A neon gradient violates global brand exclusion rules | Identity eligibility | Volume 02 |
| A sympathy illustration may appear on a contextual Preference Surface for a bereavement send | Contextual eligibility | `FI-DSN-STD-007` |
| A sympathy illustration may permanently belong to the Signature Sympathy Collection | Permanent collection membership eligibility | This standard — Domain 1 |

---

## 7. Constitutional Membership Vocabulary

The following terms are permanent architecture-level vocabulary. They distinguish Domain 1 membership validity from Domain 2 lifecycle treatment.

| Term | Owner | Meaning |
|------|-------|---------|
| **Invalidation** | `FI-DSN-STD-010` — Membership Integrity | A declarative constitutional conclusion that an existing membership no longer satisfies governing membership law. Invalidation is not a publication action. |
| **Disqualification** | `FI-DSN-STD-010` — Membership Integrity | The constitutional consequence that membership may not continue as valid because a required membership condition has failed. Authority to act remains governed by Membership Authority. |
| **Membership revocation** | `FI-DSN-STD-010` — Membership Authority | The constitutionally authorized act that ends a membership because invalidation, disqualification, or another governed Domain 1 basis applies. Procedures for performing revocation are not defined in this architecture. |
| **Withdrawal** | `FI-DSN-STD-011` — Domain 2 | A lifecycle or publication action affecting whether an asset remains available within a published collection state. Withdrawal does not redefine whether the underlying membership was constitutionally valid. |
| **Grandfathering** | `FI-DSN-STD-011` — Domain 2 | A temporal lifecycle policy governing continued treatment after standards or conditions change. |
| **Supersession** | `FI-DSN-STD-011` — Domain 2 | Lifecycle replacement or succession of assets or collection members over time. |
| **Retirement** | `FI-DSN-STD-011` — Domain 2 | End-of-lifecycle treatment for a member or collection. |

**Domain boundary rule:**

> Domain 1 determines membership validity. Domain 2 determines publication and lifecycle treatment after that determination. Domain 2 consumes frozen Domain 1 outputs without reinterpreting membership eligibility.

---

## 8. Architectural Facets

Six constitutional facets are required. Each passed the **removal test**: removing any facet would leave a distinct constitutional question unanswered.

**Permanent who versus when distinction:**

| Facet | Governs |
|-------|---------|
| **Membership Authority** | **Who** may establish, constrain, invalidate, disqualify, or revoke membership |
| **Membership Integrity** | **When** an existing membership is constitutionally invalid or subject to disqualification |

### 8.1 Facet 1 — Collection Entity Definition

| Field | Value |
|-------|-------|
| **Constitutional question** | What makes one governed collection constitutionally distinct from another, and what bounded identity and mandate must exist before membership can be evaluated? |
| **Owned subjects** | Governed collection entity identity; constitutional distinctness between collections; declared collection mandate and bounded population scope; multi-collection and exclusivity posture as entity-declared constitutional attributes |
| **Excluded subjects** | Metadata field definitions; DAM folder structure; storage partitions; file naming; database keys; informal tagging systems |
| **Removal test** | **Pass** — membership must attach to a defined governed entity with bounded identity and mandate before inclusion or exclusion can be evaluated |

**Architecture decisions:**

- Membership attaches to a **defined governed collection entity** with bounded identity and mandate — entity distinctness is a constitutional prerequisite, not a metadata record alone.
- `FI-DSN-GOV-002` may **express** entity identity in metadata; metadata does not **constitutionally create** the governed collection entity.
- Multi-collection permissibility and exclusivity are **entity-declared constitutional attributes** — each governed collection must declare whether membership is exclusive, nonexclusive, or constrained. No volume-wide default posture is implied.
- Informal tags, folders, storage partitions, and DAM containers are **negative examples only** — they do not constitute governed collection entities.

### 8.2 Facet 2 — Membership Authority

| Field | Value |
|-------|-------|
| **Constitutional question** | Who or what constitutional authority may establish, constrain, invalidate, disqualify, or revoke permanent membership — and how is that authority bounded from operational administration and runtime approval? |
| **Owned subjects** | Membership decision authority; authority delegation and constraint model; constitutional versus operational boundary; membership revocation authority |
| **Excluded subjects** | Review queue mechanics; approval screens; workflow engines; runtime orchestration; DAM operator permissions; withdrawal, publication, and retirement acts |
| **Removal test** | **Pass** — without this facet, membership decisions would have no governed authority model |

**Architecture decisions:**

- Membership Authority answers **who may act** — not **when** membership is invalid (Membership Integrity) and not **how** publication or lifecycle treatment proceeds (Domain 2).
- **Membership revocation** is an authorized constitutional act under this facet when invalidation, disqualification, or another governed Domain 1 basis applies.
- Authority is **constitutional governance**, not operational workflow — bounded without defining approval procedures.

### 8.3 Facet 3 — Membership Preconditions

| Field | Value |
|-------|-------|
| **Constitutional question** | What must already be true before artwork may be considered for permanent collection membership — and which upstream permissions must be consumed without absorption? |
| **Owned subjects** | Permanent membership precondition rules; upstream permission consumption order; feasibility boundary consumption from Volume 03; metadata completeness as a precondition gate without schema ownership |
| **Excluded subjects** | Identity eligibility redefinition; contextual selection; production readiness; publication readiness; runtime evaluation; general global asset approval |
| **Removal test** | **Pass** — without this facet, membership could not be bounded by upstream law |

**Architecture decisions:**

- Contextual policy may inform membership preconditions only as **upstream policy evidence** — never as contextual selection authority.
- Manufacturing feasibility may operate as a membership precondition **only where the collection's declared constitutional mandate materially depends on producibility**. Applicable `FI-MFG-*` obligations are consumed as Compliance Boundaries only. Manufacturing feasibility must not become general global asset approval, production readiness, scheduling, operational quality control, fulfillment eligibility, or customer delivery readiness.
- Metadata completeness may be a **membership precondition** while metadata field semantics remain owned by `FI-DSN-GOV-002`.
- Provenance is a **Compliance Boundary input only** — not constitutive of membership identity (per Volume 05 P8 and `FI-DSN-GOV-002`).

### 8.4 Facet 4 — Inclusion Policy

| Field | Value |
|-------|-------|
| **Constitutional question** | On what constitutional basis may an asset become a permanent member of a governed collection — and what forms of collection-scoped membership are recognized? |
| **Owned subjects** | Inclusion basis; permanent membership grant posture; collection-scoped membership bounded by declared mandate; multi-collection membership as constitutional population relationship |
| **Excluded subjects** | Runtime admission; publication activation; catalog ingestion procedures; duplicate file detection mechanics; temporary, publication-bound, runtime-bound, or occasion-bound membership |
| **Removal test** | **Pass** — without this facet, positive membership rules would be undefined |

**Architecture decisions:**

- Inclusion governs the **positive basis** for permanent membership at the Decision stage.
- **Collection-scoped membership** means membership bounded by the collection's declared constitutional mandate — not temporary membership, publication state, runtime eligibility, occasion-specific eligibility, recipient-specific eligibility, provisional storage, or workflow status.
- Multi-collection membership is a **constitutional population relationship** governed here and by entity-declared exclusivity posture — not DAM cardinality or storage behavior.
- Valid multi-collection membership is **not** duplicate membership.

### 8.5 Facet 5 — Exclusion Policy

| Field | Value |
|-------|-------|
| **Constitutional question** | What conditions constitutionally prevent permanent membership — and how are upstream prohibitions distinguished from collection-specific exclusions? |
| **Owned subjects** | Collection-scoped exclusion rules; upstream prohibition consumption; admission-time population-fit exclusions tied to declared collection identity, purpose, mandate, or bounded population rule |
| **Excluded subjects** | Global visual exclusions (Volume 02); contextual ineligibility (`FI-DSN-STD-007`); publication withdrawal (Domain 2); longitudinal consistency; ongoing cross-asset harmonization; maintenance of visual coherence over time; publication consistency; collection refresh decisions |
| **Removal test** | **Pass** — without this facet, collection-specific prohibitions could not be governed independently |

**Architecture decisions:**

- Exclusion governs **independent collection-specific barriers** — not merely the inverse of inclusion criteria.
- **Admission-time population fit** may be expressed as exclusion where a declared collection mandate is violated — even when the asset is otherwise visually permitted under Volume 02.
- Population-fit exclusion must be tied to a **declared collection identity, purpose, mandate, or bounded population rule** — not informal curator preference.
- Collection-scoped population fit does **not** redefine global visual identity or character owned by Volume 02.
- **Longitudinal coherence** among existing members, ongoing harmonization, and consistency over time belong to **`FI-DSN-STD-011`** — Domain 2.

### 8.6 Facet 6 — Membership Integrity

| Field | Value |
|-------|-------|
| **Constitutional question** | When is an existing membership constitutionally invalid or subject to disqualification — without absorbing lifecycle, maintenance, or retirement authority? |
| **Owned subjects** | Invalidation when upstream eligibility is lost; disqualification when required membership conditions fail; constitutional treatment of duplicate membership within one collection; constitutional treatment of conflicting membership across exclusivity rules |
| **Excluded subjects** | Who may act (Membership Authority); withdrawal; grandfathering; superseded-asset lifecycle; withdrawn-asset publication; maintenance cadence; retirement governance |
| **Removal test** | **Pass** — without this facet, membership validity over time would be ungoverned at the constitutional layer |

**Architecture decisions — Domain 1 versus Domain 2 versus downstream:**

| Subject | Disposition | Owner |
|---------|-------------|-------|
| Invalidation when upstream eligibility is lost | Domain 1 — membership integrity | This standard |
| Disqualification when membership conditions fail | Domain 1 — membership integrity | This standard |
| Duplicate membership within one collection | Domain 1 — constitutionally prohibited | This standard |
| Conflicting membership across declared exclusivity rules | Domain 1 — validity consequence; Authority resolves | This standard |
| Membership revocation (authorized act) | Domain 1 — membership authority | This standard — Facet 2 |
| Withdrawal from published collection state | Domain 2 | `FI-DSN-STD-011` |
| Grandfathering when upstream law changes | Domain 2 — lifecycle policy | `FI-DSN-STD-011` |
| Superseded assets, withdrawn assets, publication of changes | Domain 2 — lifecycle / consistency | `FI-DSN-STD-011` |
| Maintenance cadence and retirement | Domain 2 — lifecycle | `FI-DSN-STD-011` |
| Equivalent assets with separate identifiers | Downstream unless constitutional equivalence rule is later authorized | Engineering / metadata |
| DAM tracking, audit logs, implementation reconciliation | Downstream | Engineering |

#### Duplicate and conflicting membership — constitutional meanings

| Case | Constitutional meaning | Owner |
|------|------------------------|-------|
| **Duplicate membership within one collection** | A single governed asset represented as more than one membership relationship in the same collection | **Prohibited** — Domain 1 Membership Integrity |
| **Equivalent assets with different identifiers** | Metadata or downstream equivalence concern — not duplicate membership unless a future constitutional equivalence rule is authorized | **Downstream** — unless frozen authority later establishes equivalence |
| **Multi-collection membership** | A constitutional population relationship when entity posture permits | **Domain 1** — Inclusion Policy and entity exclusivity posture; not a duplicate |
| **Conflicting membership** | An asset admitted to two collections whose declared exclusivity rules cannot both be satisfied | **Domain 1** — Integrity governs validity consequence; Authority governs who may revoke |

Operational conflict resolution procedures are not defined in this architecture.

---

## 9. Upstream Dependency Model

### 9.1 Volume 02 — Visual permission

| Consumes | Does not absorb |
|----------|-----------------|
| Visual permission; visual exclusions; identity-level character constraints | Visual identity permission; typography permission; composition permission; global exclusion redefinition |

### 9.2 Volume 03 — Surface implementation

| Consumes | Does not absorb |
|----------|-----------------|
| Surface compatibility; spatial and exterior constraints where membership feasibility is materially affected | Surface structure; spatial allocation; envelope presentation authority |

### 9.3 Volume 04 — Artwork intelligence

| Consumes | Does not absorb |
|----------|-----------------|
| Contextual policy as evidence or boundary input where material to membership preconditions | Context-bound eligibility; authorized alternatives; occasion meaning; personalization policy; runtime visual selection |

### 9.4 `FI-DSN-GOV-002` — Metadata

| Consumes | Does not absorb |
|----------|-----------------|
| Metadata obligations; field semantics at handoff boundaries; completeness preconditions | Metadata field definitions; schemas; dictionaries; provenance schema ownership |

### 9.5 `FI-DSN-GOV-004` — Brain authority

| Consumes | Does not absorb |
|----------|-----------------|
| Brain Authority Boundaries; Compliance Boundaries; Decision versus runtime distinction | Runtime reasoning; orchestration; selection mechanics |

### 9.6 `FI-MFG-*` — Manufacturing

| Consumes | Does not absorb |
|----------|-----------------|
| Applicable manufacturing feasibility Compliance Boundaries — only where collection mandate materially depends on producibility | Manufacturing procedures; production scheduling; readiness decisions; operational quality control; fulfillment eligibility |

---

## 10. Domain 1 → Domain 2 Handoff Categories

`OQ-STD-010-002` is resolved at the constitutional category level. The following are **membership output categories** that `FI-DSN-STD-011` may consume as frozen Domain 1 decisions. They are not schemas, field names, APIs, event messages, document formats, runtime payloads, or workflow handoffs.

| Category | Constitutional content | Domain 1 owner facet |
|----------|------------------------|----------------------|
| **Collection entity reference** | Which governed collection entity the output concerns | Collection Entity Definition |
| **Membership decision posture** | Whether a membership decision is granted, denied, invalidated, disqualified, or subject to conflict | Inclusion Policy; Membership Integrity |
| **Membership grant or denial** | The permanent membership eligibility outcome for a governed asset | Inclusion Policy; Exclusion Policy |
| **Exclusion basis or exclusion class** | The constitutional reason a collection-specific barrier applies — including admission-time population-fit exclusion | Exclusion Policy |
| **Invalidation posture** | Declarative conclusion that existing membership no longer satisfies governing membership law | Membership Integrity |
| **Disqualification posture** | Constitutional consequence that membership may not remain valid | Membership Integrity |
| **Revocation posture** | Whether membership revocation is constitutionally authorized and on what Domain 1 basis | Membership Authority |
| **Multi-collection or exclusivity posture** | The entity-declared population relationship constraints applicable to the decision | Collection Entity Definition; Inclusion Policy |
| **Governing authority reference** | Which constitutional authority basis applies when required for Domain 2 consumption without reinterpretation | Membership Authority |

Domain 2 consumes these categories **without reinterpreting** permanent membership eligibility, inclusion rules, or exclusion rules per Volume 05 Section 9.3.1.

---

## 11. Relationship to `FI-DSN-STD-011`

**Permanent constitutional rule (inherited from Volume 05 Section 9.3.1):**

> Domain 2 collection publication policy consumes frozen permanent membership decisions produced by Domain 1. Publication criteria do not redefine permanent collection membership eligibility, inclusion rules, or exclusion rules.

| Domain 1 — this standard | Domain 2 — `FI-DSN-STD-011` |
|--------------------------|----------------------------|
| Owns permanent membership decisions and validity | Consumes frozen membership outputs per Section 10 |
| Determines invalidation and disqualification | Determines withdrawal, grandfathering, supersession, and retirement treatment |
| Governs admission-time population-fit exclusion | Governs longitudinal consistency among existing members |
| Does not govern publication or retirement | Does not redefine membership eligibility |

Cross-reference requirements in both standards are expected at freeze review per `OQ-V05-002`.

---

## 12. Architectural Principles

Future normative requirements shall embody these principles. They record architectural law at the standard layer; they are not yet assigned requirement identifiers.

| ID | Principle | Architectural commitment |
|----|-----------|-------------------------|
| **MEM-P1** | **Permission precedes membership** | Permanent membership consumes frozen Volume 02 permission and exclusions; this standard does not redefine identity eligibility |
| **MEM-P2** | **Structure precedes library placement** | Membership preconditions consume frozen Volume 03 feasibility boundaries; this standard does not author surface layout |
| **MEM-P3** | **Context precedes library operation** | Membership preconditions may consume frozen Volume 04 policy outputs as evidence; this standard does not own contextual eligibility or selection |
| **MEM-P4** | **Membership separated from lifecycle** | Population rules and validity remain in Domain 1; publication, maintenance, and retirement remain in Domain 2 |
| **MEM-P5** | **Libraries separated from selection** | This standard governs permanent belonging; it does not author authorized alternatives or runtime selection |
| **MEM-P6** | **Coherence is collection-scoped and admission-bounded in Domain 1** | Admission-time population-fit exclusions apply within declared collection mandate; longitudinal coherence belongs to Domain 2; global visual rules remain Volume 02 |
| **MEM-P7** | **Manufacturing constrains; membership integrates** | Applicable `FI-MFG-*` obligations are Compliance Boundary inputs only — gated by material producibility dependence of collection mandate |
| **MEM-P8** | **Metadata referenced, not redefined** | Collection records use `FI-DSN-GOV-002` semantics at handoff boundaries; provenance ownership stays with `FI-DSN-GOV-002` |
| **MEM-P9** | **Entities before operations** | Governed collection entities require declared identity and mandate before population rules apply |
| **MEM-P10** | **Implementation independence** | Membership policy remains valid across DAM, partner program, rendering, and vendor change without constitutional redesign |

---

## 13. Provisional Requirement Groups

The following groups define the anticipated normative structure for a later requirements sprint. **No requirement identifiers are assigned in this architecture draft.**

| Group | Anticipated subject | Facet source |
|-------|---------------------|--------------|
| **G1** | Constitutional inheritance and upstream reconcilability | Section 4 |
| **G2** | Principal-subject placement and deferral | Section 5.3 |
| **G3** | Governed collection entity definition and entity-declared exclusivity posture | Facet 1 |
| **G4** | Membership authority and revocation authority | Facet 2 |
| **G5** | Membership preconditions and upstream consumption | Facet 3 |
| **G6** | Inclusion policy and collection-scoped membership | Facet 4 |
| **G7** | Exclusion policy and admission-time population fit | Facet 5 |
| **G8** | Membership integrity, membership output categories, and Domain 2 handoff | Facet 6; Section 10 |

---

## 14. Mandatory Ownership Exclusions

`FI-DSN-STD-010` does **not** own the following subjects. Where relevant, this standard defines only Compliance Boundary or consumption posture.

| Excluded subject | Authoritative home |
|------------------|-------------------|
| Visual identity permission; typography permission; composition permission | Volume 02 |
| Surface structure; spatial allocation; envelope presentation | Volume 03 — `FI-DSN-STD-004`–`006` |
| Occasion meaning; emotional context interpretation | `FI-DSN-STD-008` |
| Contextual alternative authorization; runtime visual selection; context-bound eligibility | `FI-DSN-STD-007` |
| Personalization policy; preference surfaces | `FI-DSN-STD-009`; `FI-DSN-GOV-004` |
| Metadata field definitions; metadata schemas; provenance schema ownership | `FI-DSN-GOV-002` |
| Asset storage; DAM behavior; file naming mechanics; database design | Engineering |
| APIs; workflow engines; review queues; approval screens | Engineering / product |
| Manufacturing execution; production scheduling; fulfillment; delivery timing | `FI-MFG-*` / engineering |
| Collection publication; withdrawal; maintenance; retirement; longitudinal consistency | `FI-DSN-STD-011` — Domain 2 |
| Brain runtime behavior and orchestration | `FI-DSN-GOV-004` / implementation |

---

## 15. Architecture Tests

### 15.1 Removal test

All six facets in Section 8 passed. No facet merely restates another authority.

### 15.2 Ownership test

Each facet owns a principal constitutional subject. Consumer-only subjects appear only in upstream dependency and exclusion tables. Major subjects are classified in Sections 7, 8, 10, and 14.

### 15.3 Implementation independence test

This architecture draft contains no schemas, fields, databases, files, folders, APIs, payloads, approval steps, workflow procedures, runtime logic, or production instructions.

### 15.4 Split test

Domain 1 membership and Domain 2 lifecycle answer **independent governing questions**. One standard remains sufficient for the complete Domain 1 subject. No conflict with frozen Volume 05 two-standard inventory was found.

### 15.5 Completeness test

The six-facet model can support a complete normative requirement set without reopening authority-integrity boundaries, coherence exclusion scope, multi-collection posture, handoff categories, or duplicate/conflict treatment.

### 15.6 Normative readiness test

| Subject | Ready for requirements? |
|---------|-------------------------|
| Authority versus integrity | **Yes** — who/when distinction and vocabulary table defined |
| Invalidation versus withdrawal | **Yes** — Section 7 |
| Coherence exclusion | **Yes** — admission-time population fit only; Domain 2 owns longitudinal consistency |
| Multi-collection posture | **Yes** — entity-declared; no unsupported volume-wide default |
| Exclusivity posture | **Yes** — entity-declared constitutional attribute |
| Scoped membership | **Yes** — mandate-bounded only |
| Duplicates and conflicts | **Yes** — Section 8.6 |
| Domain 1 → Domain 2 handoff | **Yes** — Section 10 categories |

---

## 16. Brain Interaction (policy boundary posture)

Collection Membership and Eligibility defines Decision-stage membership policy and membership outputs. Brain Runtime and product systems may operationalize membership within frozen bounds.

Brain Runtime and operational systems do **not**:

- redefine permanent membership eligibility as normative policy at runtime
- treat instance selection, contextual fit, or recommendation history as sources of membership eligibility
- substitute DAM state, storage location, or workflow status for constitutional membership decisions
- authorize publication, withdrawal, or lifecycle transitions owned by Domain 2

Normative Brain Interaction requirements are deferred to the requirements sprint under provisional group **G8**.

---

## 17. Manufacturing Considerations (posture only)

Applicable frozen `FI-MFG-*` standards are consumed as Compliance Boundary inputs at membership preconditions only where the collection's declared mandate materially depends on producibility. Manufacturing feasibility must not become general global asset approval, production readiness, scheduling, or operational policy.

Engineering implications are **deferred** to the requirements sprint.

---

## 18. Company Judgment

This standard is based on company judgment.

F.I. Forgot has chosen to govern Collection Membership and Eligibility because frozen Volume 05 architecture assigns permanent collection membership to Domain 1 under `CLS-ASG`, and because membership authority must be frozen independently of lifecycle operations, contextual selection, visual permission, metadata schema ownership, and Brain runtime mechanics.

**Company judgment — entity-declared exclusivity posture:** Each governed collection must declare whether membership is exclusive, nonexclusive, or constrained. No volume-wide default multi-collection or exclusivity posture is established at the architecture layer.

Frozen upstream Volumes 02–04 standards, frozen `FI-DSN-GOV-002`, frozen `FI-DSN-GOV-004`, and applicable frozen `FI-MFG-*` obligations informed this architecture as constraint and handoff context only. `FI-DSN-STD-011` remains the deferred lifecycle owner.

---

## 19. Open Questions

| ID | Status | Resolution |
|----|--------|------------|
| `OQ-STD-010-001` | **Resolved** | Multi-collection permissibility and exclusivity are entity-declared constitutional attributes. Each governed collection must declare its posture. No volume-wide default. Company judgment recorded in Section 18. |
| `OQ-STD-010-002` | **Resolved** | Constitutional handoff categories defined in Section 10. No artifact or schema shape prescribed. |
| `OQ-STD-010-003` | **Resolved** | Inclusion governs positive membership basis. Exclusion governs independent collection-specific barriers. Admission-time population fit may be expressed as exclusion where declared mandate is violated. Longitudinal coherence belongs to Domain 2. Both facets retained. |

No open question blocks normative requirement drafting.

---

## 20. Architecture Validation Gate

This architecture draft advances to normative requirement drafting when adversarial validation confirms:

| Gate | Pass criterion |
|------|----------------|
| Governing question | Limited to permanent collection membership; publication explicitly excluded |
| Eligibility model | Three-type distinction preserved; no Volume 04 selection authority absorbed |
| Facet completeness | Six facets retained; authority/integrity distinction defined |
| Vocabulary | Invalidation, disqualification, revocation, withdrawal, grandfathering, supersession, retirement distinguished |
| Upstream boundaries | Volume 02 permission, Volume 04 contextual eligibility, metadata, provenance, and manufacturing consumed not absorbed |
| Domain 2 boundary | Publication, maintenance, retirement, grandfathering, and longitudinal consistency deferred to `FI-DSN-STD-011` |
| Handoff categories | Section 10 defined without schemas |
| Implementation independence | No DAM, storage, API, workflow, or runtime mechanics introduced |
| Standard sufficiency | One standard remains sufficient for Domain 1 |
| Open questions | All resolved; none block requirement drafting |

---

## 21. Related Standards

| Standard | Relationship |
|----------|--------------|
| `playbook/design/volume-05-signature-collections/01-signature-collections-architecture.md` | Frozen Volume Governance — Domain 1 constitutional authority |
| `playbook/design/volume-02-visual-design/01-visual-design-architecture.md` | Frozen Volume 02 — visual permission inputs |
| `playbook/design/volume-03-surface-implementation/01-surface-implementation-architecture.md` | Frozen Volume 03 — structure and spatial inputs |
| `playbook/design/volume-04-artwork-intelligence/01-artwork-intelligence-architecture.md` | Frozen Volume 04 — contextual policy inputs |
| `FI-DSN-PRN-001` through `FI-DSN-STD-009` | Frozen upstream standards — Compliance Boundary and policy inputs |
| `FI-DSN-STD-011` | Deferred peer consumer — lifecycle and publication owner |
| `FI-DSN-GOV-002` | Metadata handoff — field semantics owner |
| `FI-DSN-GOV-004` | Brain authority model; Decision versus runtime distinction |
| `FI-DSN-VOL-001` | Primary Volume and Required category framework |
| `FI-DSN-CLS-001` | `CLS-ASG` classification authority |
| Applicable `FI-MFG-*` | Compliance Boundary inputs |

---

## 22. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.2 Architecture Draft (refined) | July 27, 2026 | F.I. Forgot | Sprint D16.4B — constitutional boundary refinement: authority/integrity who-when distinction; membership vocabulary table (invalidation, disqualification, revocation, withdrawal, grandfathering, supersession, retirement); admission-time population-fit exclusion bounded against Domain 2 longitudinal consistency; entity-declared multi-collection/exclusivity posture; collection-scoped membership definition; Domain 1→2 handoff categories; duplicate/conflict disambiguation; manufacturing feasibility guardrail; governing question publication exclusion; OQ-STD-010-001 through OQ-STD-010-003 resolved |
| 0.1 Architecture Draft | July 27, 2026 | F.I. Forgot | Sprint D16.4 — initial Collection Membership and Eligibility Standard architecture: locked governing question; principal subject; six constitutional facets; three-type eligibility model; upstream dependency model; Domain 1 → Domain 2 handoff; MEM-P1–MEM-P10; provisional requirement groups G1–G8; architecture validation gate; no normative requirements assigned |

### Future revision notes

Revision to this standard after freeze requires governed change control per `FI-DSN-GOV-001` Section 15. Material change to principal-subject ownership, facet model, or Domain 2 handoff requires architectural revision before normative amendment.

---

**End of Document**
