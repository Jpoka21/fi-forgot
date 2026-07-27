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
| **Status** | Drafted, Pending Freeze |
| **Version** | 0.3 Requirement Draft |
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

---

## 1. Purpose

This standard is the **normative governing foundation** for F.I. Forgot Volume 05 Domain 1 — Collection Membership and Eligibility under `CLS-ASG`.

It answers the locked governing question:

> How shall permanent governed artwork collections define their entity boundaries, membership authority, membership preconditions, inclusion policy, and exclusion policy without redefining upstream visual permission, contextual selection, personalization, metadata semantics, provenance ownership, manufacturing feasibility boundaries, storage state, runtime decisions, or collection publication?

This standard translates validated Collection Membership and Eligibility architecture (Version 0.2 Architecture Draft) into enduring Decision-stage membership policy. It does not replace frozen Volume 05 Signature Collections Architecture, frozen upstream Volumes 02–04 standards, frozen `FI-DSN-GOV-002`, frozen `FI-DSN-GOV-004`, or deferred `FI-DSN-STD-011`.

---

## 2. Scope

### 2.1 In scope

- Decision-stage permanent collection entity boundaries for governed asset libraries
- Membership authority, membership preconditions, inclusion policy, and exclusion policy
- Membership integrity — invalidation, disqualification, and constitutional duplicate and conflict treatment
- Membership output categories for consumption by `FI-DSN-STD-011`
- Principal-subject placement and deferral relationships
- Three-type eligibility boundary preservation (identity, contextual, permanent membership)
- Brain Interaction membership policy boundary recording per `FI-DSN-TPL-001` Section 7
- Manufacturing Compliance Boundary integration without operational policy restatement

### 2.2 Out of scope

See Section 11.

---

## 3. Definitions

| Term | Definition |
|------|------------|
| **Admission precondition** | A condition that SHALL be satisfied before permanent collection membership may be granted — distinct from a continuing validity condition |
| **Collection Membership decision** | A governed design decision whose principal normative subject is permanent collection entity boundaries, membership authority, membership preconditions, inclusion policy, exclusion policy, or membership integrity under `CLS-ASG` Domain 1 |
| **Collection-scoped membership** | Permanent membership bounded by the collection's declared constitutional mandate — distinct from temporary, publication-bound, runtime-bound, or occasion-bound status |
| **Constrained exclusivity posture** | A declared entity posture under which multi-collection membership is permitted only where the governed collection entity's declared constitutional mandate includes an applicable declared cross-collection rule or declared population constraint that the membership satisfies |
| **Continuing validity condition** | A condition expressly declared under governing membership law whose later failure constitutionally invalidates or disqualifies existing membership — distinct from an admission-only precondition |
| **Conflicting membership** | A constitutional conflict in which an asset holds membership relationships that cannot coexist under declared exclusivity rules or another frozen collection rule governed by this standard |
| **Decision-stage membership policy** | Frozen normative membership rules recorded in Design Standards; not runtime evaluation, instance selection, DAM state, or production scheduling |
| **Disqualification** | The constitutional consequence that membership may not remain valid because a required membership condition has failed — owned by Membership Integrity |
| **Duplicate membership** | A single governed asset holding more than one constitutional membership relationship in the same governed collection |
| **Governed collection entity** | A durable constitutional library container with declared identity, mandate, membership authority, population boundaries, and collection-scoped inclusion and exclusion discipline — distinct from informal tags, folders, or storage partitions |
| **Invalidation** | A declarative constitutional conclusion that an existing membership no longer satisfies governing membership law — not a publication action; owned by Membership Integrity |
| **Membership output** | A frozen permanent membership decision or membership boundary artifact in one of the constitutional output categories defined in Section 6.7 — produced for consumption by `FI-DSN-STD-011` without transferring membership ownership |
| **Membership revocation** | The constitutionally authorized act ending a membership because invalidation, disqualification, or another governed Domain 1 basis applies — owned by Membership Authority as to who may act |
| **Permanent collection membership** | The constitutional status of an already-permitted artwork as a durable member of a governed collection — distinct from identity eligibility, contextual eligibility, and publication state |
| **Permanent collection membership eligibility** | Whether an already-permitted artwork may permanently belong to a governed collection under Domain 1 rules — the principal eligibility type owned by this standard |

Domain 2 lifecycle terms — **withdrawal**, **grandfathering**, **supersession**, and **retirement** — are defined for boundary reference only. Those subjects are owned by `FI-DSN-STD-011`.

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

#### Normative requirements — Constitutional Inheritance

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R01` | This standard SHALL NOT contradict frozen Volume 05 Signature Collections Architecture P1–P11 or the validated Collection Membership and Eligibility architecture for Domain 1 — including the locked governing question, six-facet model, three-type eligibility boundary, authority-integrity distinction, and Domain 1 → Domain 2 handoff categories expressed in this standard. | Company judgment |
| `FI-DSN-STD-010-R02` | This standard SHALL remain reconcilable with frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`, `FI-DSN-STD-002`, `FI-DSN-STD-003`, `FI-DSN-STD-004`, `FI-DSN-STD-005`, `FI-DSN-STD-006`, `FI-DSN-STD-007`, `FI-DSN-STD-008`, and `FI-DSN-STD-009`. Collection Membership and Eligibility SHALL NOT weaken, replace, or silently override upstream visual permission, surface structure, spatial allocation, exterior presentation, contextual application policy, or identity eligibility. | Company judgment |
| `FI-DSN-STD-010-R03` | Collection Membership and Eligibility SHALL consume applicable frozen `FI-MFG-*` obligations only as Compliance Boundary inputs when evaluating membership preconditions where a collection's declared constitutional mandate materially depends on producibility. This standard SHALL NOT restate manufacturing operational policy. Membership decisions that conflict with applicable Compliance Boundaries SHALL be unsuccessful and SHALL be removed, restricted, or revised per `FI-DSN-GOV-004` §13. | Company judgment |
| `FI-DSN-STD-010-R04` | This standard SHALL govern Decision-stage permanent collection membership policy only. It SHALL NOT author or prescribe as normative requirements: context-bound eligibility, authorized visual alternatives, Preference Surfaces, metadata field schemas, provenance schemas, DAM behavior, asset storage mechanics, APIs, databases, workflow choreography, review queues, approval screens, production scheduling, fulfillment procedures, delivery timing, collection publication, withdrawal, grandfathering, supersession, retirement, longitudinal consistency maintenance, Brain algorithms, ranking, runtime selection logic, or engineering implementation. Collection Membership and Eligibility SHALL NOT treat product telemetry, runtime behavior, DAM state, storage location, workflow status, or recommendation history as sources of Decision-stage membership policy. | Company judgment |

---

## 5. Governing Requirements

### 5.1 Principal-subject placement

A decision belongs to Collection Membership and Eligibility when permanent collection entity boundaries, membership authority, membership preconditions, inclusion policy, exclusion policy, or membership integrity is the **principal normative subject**.

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

#### Normative requirements — Principal-subject placement

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R05` | Collection Membership and Eligibility SHALL govern Collection Membership decisions whose principal subject is permanent collection membership eligibility, governed collection entity boundaries, membership authority, membership preconditions, inclusion policy, exclusion policy, or membership integrity under `CLS-ASG` Domain 1. This standard SHALL govern collections as constitutional entities and SHALL NOT evaluate artwork at runtime. | Company judgment |
| `FI-DSN-STD-010-R06` | Collection Membership and Eligibility SHALL defer authority for the following subjects to their authoritative owners when those subjects are principal: visual permission and identity-level eligibility (Volume 02); surface system structure, spatial allocation, and exterior presentation geometry (`FI-DSN-STD-004`, `FI-DSN-STD-005`, `FI-DSN-STD-006`); context-bound eligibility and authorized alternatives (`FI-DSN-STD-007`); occasion and emotional context semantics (`FI-DSN-STD-008`); personalization policy (`FI-DSN-STD-009`); metadata field semantics, schemas, and provenance ownership (`FI-DSN-GOV-002`); collection publication, withdrawal, grandfathering, supersession, retirement, and longitudinal consistency (`FI-DSN-STD-011`); manufacturing operational policy (`FI-MFG-*`); asset storage, DAM behavior, and workflow mechanics (engineering); and Brain runtime behavior, ranking, and selection mechanics (`FI-DSN-GOV-004` runtime layer). | Company judgment |

---

## 6. Design Requirements

### 6.1 Governed collection entity definition

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R07` | Each governed collection SHALL constitute a constitutionally distinct **governed collection entity** with a declared collection identity and a declared constitutional mandate that bounds the collection's population purpose. Membership evaluation, inclusion, and exclusion SHALL attach only to a defined governed collection entity. Informal tags, storage folders, storage partitions, DAM containers, and metadata records SHALL NOT by themselves constitute a governed collection entity. Metadata per `FI-DSN-GOV-002` MAY express entity identity but SHALL NOT constitutionally create the governed collection entity. | Company judgment |
| `FI-DSN-STD-010-R08` | Each governed collection entity SHALL declare its multi-collection and exclusivity posture as a constitutional entity attribute — whether membership is **exclusive**, **nonexclusive**, or **constrained** — before membership decisions are applied. **Exclusive** membership permits at most one governed collection membership relationship subject to the entity's declared constitutional mandate. **Nonexclusive** membership permits multi-collection membership unless another governing collection rule prohibits it. **Constrained** membership permits multi-collection membership only where the entity's declared constitutional mandate includes an applicable declared cross-collection rule or declared population constraint that the membership satisfies. No volume-wide default exclusivity or multi-collection posture is established by this standard. | Company judgment |

### 6.2 Membership authority

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R09` | Collection Membership and Eligibility SHALL govern which constitutional authority may establish, constrain, and revoke permanent membership. Membership Authority answers **who may act** on membership decisions. Constitutional membership authority MAY be delegated only within limits declared by governing membership law; delegated authority SHALL remain bounded and constitutionally revocable. Operational administration, review workflows, approval screens, DAM operator permissions, and runtime orchestration SHALL NOT constitute or silently acquire constitutional membership authority, and delegation SHALL NOT become workflow ownership. | Company judgment |
| `FI-DSN-STD-010-R10` | **Membership revocation** — the constitutionally authorized act ending a membership — SHALL be governed by Membership Authority when invalidation, disqualification, or another governed Domain 1 basis applies. Membership Authority SHALL NOT govern withdrawal, publication treatment, grandfathering, supersession, or retirement. | Company judgment |

### 6.3 Membership preconditions

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R11` | Before an already-permitted artwork may be considered for permanent collection membership, applicable **admission preconditions** SHALL be satisfied. Admission preconditions are conditions required before membership may be granted. Mandatory admission preconditions SHALL include satisfied identity eligibility under frozen Volume 02 visual permission and exclusions. Applicable Volume 03 surface and exterior feasibility constraints SHALL be consumed where the collection's declared constitutional mandate or artwork surface applicability makes them material to membership consideration. Volume 04 contextual policy outputs MAY be consumed only as evidence or boundary input and SHALL NOT function as contextual selection authority. Failure of a mandatory admission precondition SHALL prevent membership grant. Satisfaction of an admission precondition SHALL NOT by itself establish a continuing validity condition unless that condition is separately declared as continuing under governing membership law. | Company judgment |
| `FI-DSN-STD-010-R12` | Metadata completeness required for membership consideration MAY be governed as a membership precondition gate. Metadata field semantics and provenance schema ownership SHALL remain with `FI-DSN-GOV-002`. Provenance SHALL be consumed only as a Compliance Boundary input and SHALL NOT be constitutive of membership identity. Applicable frozen `FI-MFG-*` manufacturing feasibility obligations MAY gate membership only where the governed collection's declared constitutional mandate materially depends on producibility. Membership preconditions SHALL NOT function as general global asset approval, production readiness, manufacturing scheduling, fulfillment eligibility, or contextual selection. | Company judgment |

### 6.4 Inclusion policy

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R13` | Collection Membership and Eligibility SHALL govern the positive constitutional basis on which an already-permitted artwork may receive **permanent collection membership** in a governed collection. **Collection-scoped membership** SHALL be bounded by the collection's declared constitutional mandate. Collection-scoped membership SHALL NOT be temporary membership, publication state, runtime eligibility, occasion-specific eligibility, recipient-specific eligibility, provisional storage status, or workflow status. | Company judgment |
| `FI-DSN-STD-010-R14` | Multi-collection membership SHALL be governed as a constitutional population relationship subject to each governed collection entity's declared exclusivity posture. Valid multi-collection membership SHALL NOT be treated as duplicate membership. DAM cardinality, storage behavior, or metadata record count SHALL NOT determine constitutional membership. | Company judgment |

### 6.5 Exclusion policy

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R15` | Collection Membership and Eligibility SHALL govern collection-specific exclusion authority independently from inclusion criteria. Upstream prohibitions from Volume 02 and other Compliance Boundaries SHALL be consumed and distinguished from collection-specific exclusions governed by this standard. An otherwise permitted artwork MAY be excluded from a specific governed collection when admission-time **population fit** against the collection's declared identity, purpose, mandate, or bounded population rule is not satisfied. Population-fit exclusion SHALL be tied to a declared collection mandate and SHALL NOT be based solely on unbounded curator preference. | Company judgment |
| `FI-DSN-STD-010-R16` | Admission-time population-fit exclusion SHALL NOT redefine global visual identity, visual permission, or character rules owned by Volume 02. Exclusion policy governed by this standard SHALL NOT govern longitudinal consistency among existing members, ongoing cross-asset harmonization, maintenance of visual coherence over time, publication consistency, or collection refresh decisions — those subjects remain authoritative in `FI-DSN-STD-011` when principal. | Company judgment |

### 6.6 Membership integrity

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R17` | Membership Integrity SHALL govern **when** an existing permanent collection membership is constitutionally invalid or subject to disqualification. **Invalidation** SHALL establish the declarative constitutional conclusion that an existing membership no longer satisfies governing membership law. **Disqualification** SHALL establish the constitutional consequence that membership may not remain valid because a required continuing validity condition has failed. Membership Integrity answers validity conditions; Membership Authority answers who may revoke. Invalidation and disqualification SHALL NOT be withdrawal, publication treatment, grandfathering, supersession, or retirement. | Company judgment |
| `FI-DSN-STD-010-R18` | When a declared **continuing validity condition** is lost, existing membership SHALL be subject to invalidation or disqualification under Membership Integrity. Only conditions expressly declared as continuing under governing membership law MAY later invalidate or disqualify membership. Loss of upstream identity eligibility SHALL constitute a continuing validity condition when identity eligibility was a mandatory admission precondition. **Duplicate membership** within one governed collection — a single governed asset holding more than one constitutional membership relationship in the same collection — SHALL be constitutionally prohibited. **Conflicting membership** across collections whose declared exclusivity rules cannot both be satisfied SHALL be governed as a validity consequence under Membership Integrity; Membership Authority SHALL govern who may revoke affected memberships. Equivalent assets with separate identifiers SHALL be treated as metadata or downstream equivalence concerns unless a future constitutional equivalence rule is authorized. | Company judgment |

### 6.7 Domain 1 → Domain 2 handoff

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R19` | Collection Membership and Eligibility SHALL produce **membership outputs** in the following constitutional categories for consumption by `FI-DSN-STD-011` without transferring membership ownership: collection entity reference; membership decision posture; membership grant or denial; exclusion basis or exclusion class; invalidation posture; disqualification posture; revocation posture; multi-collection or exclusivity posture; and governing authority reference. Membership decision posture SHALL state the overall constitutional membership decision state; grant or denial SHALL state admission outcome only; invalidation posture and disqualification posture SHALL state integrity conclusions separately; and governing authority reference SHALL identify the Domain 1 constitutional authority basis applicable to the output. These categories are constitutional outputs only and SHALL NOT prescribe schemas, field names, APIs, event messages, document formats, runtime payloads, or workflow handoffs. | Company judgment |
| `FI-DSN-STD-010-R20` | `FI-DSN-STD-011` MAY consume frozen Domain 1 membership outputs to determine collection publication, withdrawal, grandfathering, supersession, retirement, and longitudinal consistency treatment. Domain 2 SHALL NOT reinterpret permanent collection membership eligibility, inclusion rules, or exclusion rules established by this standard. | Company judgment |

---

## 7. Company Judgment

This standard is based on company judgment per `FI-DSN-GOV-003`. Requirement Source values in normative tables remain `Company judgment` per `FI-DSN-TPL-001`; epistemic basis varies by requirement as follows.

**Directly inherited frozen authority** — Requirements such as `FI-DSN-STD-010-R01` and `FI-DSN-STD-010-R02` preserve frozen Volume 05 architecture and upstream reconcilability obligations without introducing discretionary policy.

**Derived constitutional necessities** — Most requirements (`FI-DSN-STD-010-R04` through `FI-DSN-STD-010-R07`, `FI-DSN-STD-010-R09` through `FI-DSN-STD-010-R11`, `FI-DSN-STD-010-R13` through `FI-DSN-STD-010-R21`) translate validated Domain 1 architecture into testable obligations logically required to make the frozen facet model complete.

**Explicit company judgment** — A limited number of policy choices among constitutionally permissible alternatives are recorded expressly, including entity-declared exclusivity posture labels and definitions in `FI-DSN-STD-010-R08`, admission-time population-fit exclusion in `FI-DSN-STD-010-R15`, and duplicate membership prohibition in `FI-DSN-STD-010-R18`.

F.I. Forgot has chosen to govern Collection Membership and Eligibility because frozen Volume 05 architecture assigns permanent collection membership to Domain 1 under `CLS-ASG`, and because membership authority must be frozen independently of lifecycle operations, contextual selection, visual permission, metadata schema ownership, and Brain runtime mechanics.

Frozen upstream Volumes 02–04 standards, frozen `FI-DSN-GOV-002`, frozen `FI-DSN-GOV-004`, and applicable frozen `FI-MFG-*` obligations informed drafting as constraint and handoff context only. `FI-DSN-STD-011` remains the deferred lifecycle owner.

---

## 8. Brain Interaction

Collection Membership and Eligibility defines Decision-stage membership policy and membership outputs. Brain Runtime and operational systems may operationalize membership within frozen bounds.

Brain Runtime and operational systems SHALL NOT redefine permanent membership eligibility as normative policy, treat instance selection or contextual fit as membership preconditions, substitute DAM state or workflow status for constitutional membership decisions, or authorize publication or lifecycle transitions owned by Domain 2.

#### Normative requirements — Brain Interaction

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-010-R21` | Brain Runtime and operational system use of artwork, collection, or contextual signals affecting governed collection membership SHALL remain reconcilable with frozen membership policy and membership outputs established by this standard. Brain Runtime and operational systems SHALL NOT redefine permanent collection membership eligibility, inclusion policy, or exclusion policy as Decision-stage policy. Brain Runtime and operational systems SHALL NOT treat runtime inference, telemetry, recommendation history, DAM state, storage location, workflow status, or instance-selection outcomes as sources of Decision-stage membership policy. Brain Runtime and operational systems SHALL NOT authorize publication, withdrawal, grandfathering, supersession, or retirement governed by `FI-DSN-STD-011`. | Company judgment |

---

## 9. Manufacturing Considerations

Applicable frozen `FI-MFG-*` standards are consumed as Compliance Boundary inputs per `FI-DSN-STD-010-R03` and `FI-DSN-STD-010-R12` only where a collection's declared mandate materially depends on producibility. Membership preconditions SHALL exclude treatments prohibited by applicable manufacturing Compliance Boundaries. Manufacturing integration policy remains `CLS-MFI` when integration is principal.

Engineering implications are **deferred** — see Section 13.

---

## 10. Exceptions

No exceptions are defined.

Future governed exceptions REQUIRE individual freeze review justification and SHALL NOT weaken constitutional separation from selection, personalization, lifecycle policy, metadata ownership, or upstream Volume 02–04 authority.

---

## 11. Out of Scope

| Subject | Reason excluded | Authoritative home |
|---------|-----------------|-------------------|
| Context-bound eligibility and authorized alternatives | Selection subject | `FI-DSN-STD-007` — `CLS-BVS` |
| Preference Surfaces and override classes | Selection / GOV-004 subject | `FI-DSN-STD-007`; `FI-DSN-GOV-004` |
| Occasion and emotional context semantics | Semantic subject | `FI-DSN-STD-008` — `CLS-OEC` |
| Personalization treatment policy | Policy subject | `FI-DSN-STD-009` — `CLS-PER` |
| Metadata field semantics, schemas, dictionaries; provenance ownership | Metadata subject | `FI-DSN-GOV-002` |
| Visual permission and identity-level eligibility | Permission subject | Volume 02 |
| Surface structure, spatial allocation, exterior presentation | Structure/spatial subject | `FI-DSN-STD-004`–`006` |
| Collection publication, withdrawal, maintenance, retirement, longitudinal consistency | Lifecycle subject | `FI-DSN-STD-011` — Domain 2 |
| Manufacturing operational policy | Manufacturing subject | `FI-MFG-*` |
| Asset storage, DAM behavior, file naming, databases | Implementation | Engineering |
| APIs, workflow engines, review queues, approval screens | Product / engineering | Engineering / product |
| Brain algorithms, ranking, runtime selection mechanics | Runtime subject | `FI-DSN-GOV-004` / Brain Runtime |
| Grandfathering, supersession | Temporal lifecycle subject | `FI-DSN-STD-011` |

---

## 12. Supporting Evidence

No verified facts are cited as primary support. This standard establishes F.I. Forgot Collection Membership and Eligibility governance by company judgment per `FI-DSN-GOV-003`.

Applicable frozen `FI-MFG-*` standards are referenced only as Compliance Boundary inputs. No new manufacturing research is introduced.

---

## 13. Engineering Implications

**Deferred.**

This standard governs Decision-stage membership policy at design authority. Engineering specifications and Product Implementation SHALL translate governed membership policy downstream — not this governing standard directly.

Engineering SHALL NOT be prescribed APIs, databases, DAM workflows, storage partitions, or approval orchestration in this standard.

---

## 14. Validation Method

Compliance with this standard SHALL be verified implementation-independently:

| Check | Pass criterion |
|-------|----------------|
| Requirement IDs | Continuous `FI-DSN-STD-010-R01` through `FI-DSN-STD-010-R21` with no orphans or duplicates |
| Constitutional inheritance | No contradiction with Volume 05 P1–P11 or validated Domain 1 architecture; upstream PRN-001 and STD-001 through STD-009 reconciled; `FI-MFG-*` cited not restated |
| Governing question | Decision-stage permanent collection membership only; publication and lifecycle deferred |
| Three-type eligibility | Identity and contextual eligibility consumed; permanent membership owned; none substitutes for another |
| Authority / Integrity | Who versus when distinction present (`R09`–`R10` vs `R17`–`R18`); invalidation and revocation distinguished from withdrawal |
| Entity definition | Declared identity, mandate, and exclusivity posture required (`R07`–`R08`); storage/metadata do not create entity |
| Preconditions | Admission preconditions distinguished from continuing validity conditions (`R11`, `R18`); upstream consumption without absorption (`R12`); no global asset approval |
| Inclusion / Exclusion | Positive and independent exclusion authority (`R13`–`R16`); admission-time population fit only |
| Integrity | Duplicate prohibited; conflict governed; lifecycle terms excluded (`R17`–`R18`) |
| Domain 2 handoff | Output categories defined; no reinterpretation (`R19`–`R20`) |
| GOV-004 preservation | Brain boundary requirement present (`R21`); runtime policy amendment prohibited |
| Manufacturing | Compliance Boundary consumption; mandate-dependent gating only |
| Implementation independence | No schemas, workflows, DAM procedures, or runtime selection logic |

---

## 15. Related Standards

| Standard | Relationship |
|----------|--------------|
| `playbook/design/volume-05-signature-collections/01-signature-collections-architecture.md` | Frozen Volume Governance — Domain 1 constitutional authority |
| `playbook/design/volume-02-visual-design/01-visual-design-architecture.md` | Frozen Volume 02 — visual permission inputs |
| `playbook/design/volume-03-surface-implementation/01-surface-implementation-architecture.md` | Frozen Volume 03 — structure and spatial inputs |
| `playbook/design/volume-04-artwork-intelligence/01-artwork-intelligence-architecture.md` | Frozen Volume 04 — contextual policy inputs |
| `FI-DSN-PRN-001` through `FI-DSN-STD-009` | Frozen upstream standards — Compliance Boundary and policy inputs |
| `FI-DSN-STD-011` | Deferred peer consumer — lifecycle and publication owner |
| `FI-DSN-GOV-004` | Brain authority model; Decision versus runtime distinction |
| `FI-DSN-GOV-002` | Metadata handoff — field semantics owner |
| `FI-DSN-VOL-001` | Primary Volume and Required category framework |
| `FI-DSN-CLS-001` | `CLS-ASG` classification authority |
| Applicable `FI-MFG-*` | Compliance Boundary inputs |

---

## 16. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.3 Requirement Draft (refined) | July 27, 2026 | F.I. Forgot | Sprint D16.5B — targeted requirement refinement per adversarial validation: constrained exclusivity definition (`R08`); delegation boundaries (`R09`); admission versus continuing validity conditions (`R11`, `R18`); constitutional Integrity wording (`R17`); handoff category clarification (`R19`); evidence classification prose (Section 7) |
| 0.3 Requirement Draft | July 27, 2026 | F.I. Forgot | Sprint D16.5 — first normative requirement draft: `FI-DSN-STD-010-R01` through `FI-DSN-STD-010-R21`; constitutional inheritance; principal-subject placement; governed collection entity definition; membership authority; membership preconditions; inclusion policy; exclusion policy; membership integrity; Domain 1 → Domain 2 handoff; Brain Interaction boundary |
| 0.2 Architecture Draft (refined) | July 27, 2026 | F.I. Forgot | Sprint D16.4B — constitutional boundary refinement per adversarial validation |
| 0.1 Architecture Draft | July 27, 2026 | F.I. Forgot | Sprint D16.4 — initial Collection Membership and Eligibility Standard architecture |

### Future revision notes

Revision to this standard after freeze requires governed change control per `FI-DSN-GOV-001` Section 15. Material change to principal-subject ownership, facet model, or Domain 2 handoff requires architectural revision before normative amendment.

---

**End of Document**
