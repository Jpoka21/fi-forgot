# F.I. Forgot Design Library — Volume 05

# Collection Lifecycle and Consistency Standard

## Document Control

| Field | Value |
|-------|-------|
| **Standard ID** | `FI-DSN-STD-011` |
| **Disposition** | Design Standard |
| **Primary Classification** | `CLS-ASG` — Asset Library Governance |
| **Primary Volume** | 05 — Signature Collections |
| **Architectural domain** | Domain 2 — Collection Lifecycle and Consistency |
| **Document** | `03-collection-lifecycle-and-consistency-standard.md` |
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
| **Peer Volume 05 standards** | `FI-DSN-STD-010` — Collection Membership and Eligibility Standard (Frozen Design Standard, Version 1.0, July 27, 2026) |
| **Manufacturing reference** | Applicable frozen `FI-MFG-*` standards per Volume 01 — Compliance Boundary inputs only |
| **Supporting facts** | None — company judgment standard |
| **Vendor questions** | None |

**Standard statement:** F.I. Forgot maintains **one authoritative Collection Lifecycle and Consistency** standard that governs Decision-stage collection publication policy, longitudinal collection consistency, maintenance discipline, withdrawal, grandfathering, supersession, and retirement for governed asset libraries — while consuming frozen Domain 1 membership decisions from `FI-DSN-STD-010` — without redefining permanent membership eligibility, upstream visual permission, contextual selection, personalization, metadata field semantics, provenance schema ownership, manufacturing execution, storage state, or runtime mechanics.

**Source basis:** Company judgment per `FI-DSN-GOV-003`. Applicable frozen `FI-MFG-*` obligations are consumed as Compliance Boundary inputs only. This standard is not derived from DAM behavior, product implementation, vendor facts, or Brain runtime behavior.

**Architecture draft notice:** This document is an **architecture draft only**. It defines constitutional structure, governing question, authority facets, architectural principles, provisional requirement groups, and validation gates. It does not yet contain normative requirement identifiers or populated `SHALL` / `SHALL NOT` requirement tables.

---

## 1. Purpose

This standard is the **architectural foundation** for F.I. Forgot Volume 05 Domain 2 — Collection Lifecycle and Consistency under `CLS-ASG`.

It answers the locked governing question:

> How shall governed artwork collections be constitutionally published, kept consistent over time, maintained, withdrawn, superseded, grandfathered, retired, or restored through bounded reactivation while consuming frozen membership decisions from `FI-DSN-STD-010` without redefining membership eligibility, upstream visual permission, contextual selection, personalization, manufacturing execution, storage state, or runtime mechanics?

This architecture draft translates frozen Signature Collections Architecture Domain 2 assignment into a complete constitutional structure for later normative requirement drafting. It does not replace frozen Volume 05 architecture, frozen `FI-DSN-STD-010`, frozen upstream Volumes 02–04 standards, frozen `FI-DSN-GOV-002`, or frozen `FI-DSN-GOV-004`.

---

## 2. Scope

### 2.1 In scope (architecture layer)

- Constitutional governing question and principal subject for Domain 2
- Seven validated architectural facets for collection lifecycle and consistency
- Domain 1 membership output consumption model without reinterpretation
- Lifecycle and membership vocabulary boundary model
- Upstream consumption posture without authority absorption
- Principal-subject placement and deferral relationships
- Architectural principles `LIF-P1`–`LIF-P10`
- Constitutional lifecycle vocabulary taxonomy (not a runtime state machine)
- Domain 1 validity lifecycle response model
- Provisional requirement groups `G1`–`G8` for later normative drafting
- Brain Interaction policy boundary posture (Decision stage only)
- Manufacturing Compliance Boundary integration posture
- Architecture validation gate

### 2.2 Out of scope (architecture layer)

- Normative requirement identifiers (`FI-DSN-STD-011-R##`)
- Populated requirement tables with `SHALL` / `SHALL NOT` language
- Permanent collection membership eligibility, inclusion, exclusion, or membership validity
- Implementation procedures, workflows, DAM mechanics, APIs, storage design, or deployment mechanics

See Section 14.

---

## 3. Definitions

| Term | Definition |
|------|------------|
| **Collection Lifecycle decision** | A governed design decision whose principal normative subject is collection publication policy, longitudinal collection consistency, maintenance discipline, withdrawal, grandfathering, supersession, or retirement under `CLS-ASG` Domain 2 |
| **Collection publication policy** | Decision-stage constitutional rules governing when a governed collection may enter and remain in a published availability posture, and when member availability may attach within that collection lifecycle — distinct from manufacturing execution, fulfillment timing, deployment, storefront release, or runtime orchestration |
| **Decision-stage lifecycle policy** | Frozen normative lifecycle rules recorded in Design Standards; not runtime evaluation, DAM state, production scheduling, or customer delivery timing |
| **Longitudinal collection consistency** | Collection-scoped coherence requirements among existing members over time — distinct from Domain 1 admission-time population fit and from Volume 02 global visual identity; obligations apply only where tied to declared collection identity, mandate, range principles, or frozen upstream visual constraints |
| **Mandatory population condition** | A population requirement declared in a governed collection's constitutional mandate that must be satisfied by valid Domain 1 members before collection publication — distinct from optional or aspirational population classes, operational launch targets, or downstream release readiness |
| **Nonpublication** | The constitutional condition of a governed collection or member that has not entered a published availability posture — distinct from withdrawal |
| **Reactivation** | An explicitly authorized constitutional transition restoring active lifecycle treatment after retirement — not a durable lifecycle posture, not a separate facet, and not a restoration of Domain 1 membership validity |

Domain 1 membership terms — **membership grant**, **invalidation**, **disqualification**, and **membership revocation** — are defined for boundary reference only. Those subjects are owned by `FI-DSN-STD-010`.

---

## 4. Constitutional Inheritance

This section documents inherited constitutional authority. It does not reinterpret frozen Volume 05 architecture, frozen `FI-DSN-STD-010`, or upstream standards beyond acknowledgment.

### 4.1 Inherited authority

| Inherited source | What this standard inherits |
|------------------|----------------------------|
| **Volume 05 Signature Collections Architecture** | Domain 2 assignment; P1–P11; Domain 1 → Domain 2 consumption rule (Section 9.3.1); deferral matrix; rejection of four-domain lifecycle split |
| **`FI-DSN-STD-010` (frozen)** | Frozen membership outputs in nine constitutional categories; permanent membership eligibility boundary; membership validity conclusions |
| **`FI-DSN-GOV-004`** | Decision-stage versus runtime distinction; Compliance Boundary consumption; prohibition on runtime policy amendment |
| **Volume 02 Visual Design Architecture and frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`–`003`** | Visual identity, character, and global exclusions as upstream constraints for longitudinal consistency evaluation |
| **`FI-DSN-STD-004`–`006`** | Surface structure, spatial limits, and exterior presentation boundaries as upstream feasibility constraints where lifecycle treatment is materially affected |
| **Frozen `FI-DSN-STD-007`–`009`** | Contextual application policy boundaries as upstream inputs where continued publication or lifecycle treatment is materially affected |
| **Applicable frozen `FI-MFG-*`** | Manufacturing feasibility Compliance Boundary inputs where continued publication or lifecycle treatment materially depends on producibility |
| **`FI-DSN-GOV-002`** | Metadata handoff rules and field semantics — consumption at boundaries only |

### 4.2 Non-ownership under inheritance

This standard does **not** inherit authority to redefine permanent collection membership eligibility, membership inclusion or exclusion, membership invalidation or disqualification, membership revocation authority, visual permission (Volume 02), contextual eligibility or authorized selection (`FI-DSN-STD-007`), occasion semantics (`FI-DSN-STD-008`), personalization policy (`FI-DSN-STD-009`), metadata field semantics or provenance ownership (`FI-DSN-GOV-002`), Brain runtime behavior, manufacturing operational policy, or engineering storage and DAM implementation.

---

## 5. Governing Question and Principal Subject

### 5.1 Locked governing question

> How shall governed artwork collections be constitutionally published, kept consistent over time, maintained, withdrawn, superseded, grandfathered, retired, or restored through bounded reactivation while consuming frozen membership decisions from `FI-DSN-STD-010` without redefining membership eligibility, upstream visual permission, contextual selection, personalization, manufacturing execution, storage state, or runtime mechanics?

### 5.2 Principal subject

**Collection Lifecycle and Consistency** governs the **temporal publication and coherence** of governed artwork collections after Domain 1 membership decisions exist.

Principal subjects include:

- Collection publication policy and publication eligibility at the collection level
- Lifecycle state policy expressed as constitutional postures
- Longitudinal collection consistency among existing members
- Maintenance discipline preserving lifecycle validity and consistency
- Withdrawal, grandfathering, supersession, and retirement policy
- Treatment of Domain 1 invalidation, disqualification, and revocation outputs in lifecycle decisions
- Collection-level continuity and change discipline

This standard does **not** govern whether an artwork may permanently belong to a collection when membership is the principal subject.

### 5.3 Principal-subject placement

| Step | Question | If yes → |
|------|----------|----------|
| 1 | Is collection publication, longitudinal consistency, maintenance, withdrawal, grandfathering, supersession, or retirement the principal subject? | Candidate `CLS-ASG` / Domain 2 |
| 2 | Is permanent collection membership eligibility, inclusion, exclusion, or membership validity the principal subject? | Defer to `FI-DSN-STD-010` — Domain 1 |
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

## 6. Domain 1 Consumption Rule

Frozen Volume 05 Section 9.3.1 governs permanently:

> **Domain 2 collection publication and lifecycle policy consumes frozen permanent membership decisions produced by Domain 1. Publication criteria MUST NOT redefine permanent collection membership eligibility, inclusion rules, or exclusion rules.**

`FI-DSN-STD-011` consumes frozen Domain 1 membership outputs only. It does not re-litigate membership grants, denials, invalidation, disqualification, or revocation bases owned by `FI-DSN-STD-010`.

---

## 7. Constitutional Lifecycle Vocabulary

### 7.1 Domain 1 membership terms (boundary reference only)

| Term | Owner | Constitutional meaning |
|------|-------|------------------------|
| **Membership grant** | `FI-DSN-STD-010` — Domain 1 | A Domain 1 conclusion that an asset may permanently belong to a governed collection |
| **Invalidation** | `FI-DSN-STD-010` — Domain 1 | A conclusion that existing membership no longer satisfies governing membership law |
| **Disqualification** | `FI-DSN-STD-010` — Domain 1 | A conclusion that membership may not remain valid because a continuing validity condition failed |
| **Membership revocation** | `FI-DSN-STD-010` — Domain 1 | The constitutionally authorized act ending membership when a governed Domain 1 basis applies |

### 7.2 Domain 2 lifecycle terms

| Term | Owner | Taxonomy | Constitutional meaning |
|------|-------|----------|------------------------|
| **Publication** | `FI-DSN-STD-011` — Domain 2 | Availability posture | The constitutional availability posture under which a governed collection or member is constitutionally available for governed library use — not deployment, storefront release, manufacturing readiness, fulfillment timing, or runtime orchestration |
| **Nonpublication** | `FI-DSN-STD-011` — Domain 2 | Availability posture | A governed collection or member that has not entered published availability — distinct from withdrawal |
| **Withdrawal** | `FI-DSN-STD-011` — Domain 2 | Availability posture | Exit from an existing published posture; removes constitutional availability without necessarily changing underlying membership validity; may be temporary or indefinite |
| **Grandfathering** | `FI-DSN-STD-011` — Domain 2 | Lifecycle treatment | Bounded lifecycle treatment allowing prior publication or availability posture to continue after governing conditions change — only where membership remains valid, upstream law permits, and lifecycle law explicitly authorizes continuation; not an availability state |
| **Supersession** | `FI-DSN-STD-011` — Domain 2 | Successor relationship | A declared successor relationship in which a successor does not automatically receive Domain 1 membership; not an availability state |
| **Retirement** | `FI-DSN-STD-011` — Domain 2 | Lifecycle conclusion | The presumptively final end of active lifecycle treatment for a member or collection — not storage deletion, archive mechanics, or membership revocation |
| **Maintenance** | `FI-DSN-STD-011` — Domain 2 | Policy obligation | Constitutional policy preserving lifecycle validity and declared longitudinal consistency after publication — not operational schedules, review queues, or replacement procedures |
| **Reactivation** | `FI-DSN-STD-011` — Domain 2 | Authorized transition | An explicitly authorized constitutional transition restoring active lifecycle treatment after retirement — not a durable posture, not a separate facet, and not a restoration of Domain 1 membership validity |

**Temporary unavailability** is a bounded form of **withdrawal**, not a separate constitutional facet.

**Suspension** is not a separate constitutional owner. Temporary unavailability is expressed as a bounded **withdrawal** posture.

### 7.3 Domain 1 validity lifecycle response

Domain 2 must respond to frozen Domain 1 validity outputs without reinterpreting them. Grandfathering must not preserve publication after invalidation, disqualification, or revocation.

| Domain 1 output | Domain 2 constitutional response | Grandfathering permitted? |
|-----------------|----------------------------------|-------------------------|
| **Invalidation posture** | An invalidated member must not remain published. If previously published, **withdrawal** is required. If never published, **continued nonpublication** is required. Domain 2 responds to the frozen invalidation posture without reinterpreting it. | **No** |
| **Disqualification posture** | A disqualified member must not remain published. If previously published, **withdrawal** is required. Domain 2 does not determine whether disqualification exists. | **No** |
| **Revocation posture** | A revoked membership cannot support continued publication. If previously published, **withdrawal** is required. If never published, publication remains prohibited. Revocation authority remains owned by `FI-DSN-STD-010`. | **No** |

These responses are constitutional policy only. They do not prescribe workflow timing, operational sequence, or technical unpublishing procedures.

### 7.4 Lifecycle vocabulary taxonomy

Lifecycle vocabulary is **not** a flat set of peer states and does **not** create a runtime state machine, database values, or status fields.

| Taxonomy class | Terms |
|----------------|-------|
| **Availability postures** | unpublished (nonpublication); published; withdrawn |
| **Lifecycle treatment** | grandfathered |
| **Successor relationship** | superseded |
| **Lifecycle conclusion** | retired |
| **Authorized transition** | reactivated |

Grandfathering is a **treatment**, not an availability state. Supersession is a **relationship**, not an availability state. Reactivation is an **authorized transition**, not a durable state.

---

## 8. Architectural Facets

Seven constitutional facets are required. Each passed the **removal test**: removing any facet would leave a distinct constitutional question unanswered.

| Facet | Governs |
|-------|---------|
| **Collection Publication Policy** | When a governed collection may enter and remain in a published availability posture, and when member availability may attach within that lifecycle |
| **Collection Consistency** | What collection-scoped coherence must be preserved among existing members over time |
| **Collection Maintenance** | What lifecycle obligations preserve a governed collection after publication |
| **Withdrawal Policy** | When availability may be removed without redefining membership validity |
| **Grandfathering Policy** | When prior lifecycle treatment may continue after governing conditions change |
| **Supersession Policy** | How successor relationships are declared without automatic membership inheritance |
| **Retirement Policy** | When active lifecycle treatment ends for a member or collection |

### 8.1 Facet 1 — Collection Publication Policy

| Field | Content |
|-------|---------|
| **Constitutional question** | Under what constitutional conditions may a governed collection enter and remain in a published availability posture, and when may member availability attach within that lifecycle? |
| **Owned subjects** | Collection-level publication eligibility as the principal constitutional subject; subordinate member availability postures within collection lifecycle law; mandatory population condition satisfaction; mandate-declared publication consistency prerequisites; publication readiness distinct from manufacturing readiness; publication posture distinct from membership grant; phased or staged publication only where the collection mandate explicitly authorizes it |
| **Excluded subjects** | Exit from published availability (Withdrawal Policy); permanent membership grant; deployment mechanics; storefront release; production scheduling; fulfillment timing; runtime orchestration; DAM publication workflows; operational launch targets; downstream release readiness |
| **Removal test** | **Pass** — without this facet, constitutional availability of governed collections would be undefined |

**Architecture decisions:**

- **Collection publication is the principal constitutional subject.** Member availability is subordinate within the collection lifecycle.
- Publication governs **entry into and continued eligibility for** published availability. **Exit** from published availability belongs to Withdrawal Policy.
- Publication is **distinct from membership**. A valid member may remain unpublished; publication governs availability posture only. Publication may occur only after Domain 1 membership grant for the satisfying members.
- Publication is a **constitutional availability posture**, not deployment, storefront release, fulfillment timing, or runtime availability mechanics.
- Publication readiness is **distinct from manufacturing readiness**. Manufacturing Compliance Boundaries may inform publication policy but do not own it.

**Mandatory population condition model** (`OQ-STD-011-001` resolved):

A governed collection may enter a published posture only when:

1. All **declared mandatory population conditions** in the collection constitutional mandate are satisfied by valid Domain 1 members.
2. Any **mandate-declared publication consistency prerequisites** are satisfied.
3. **Optional or aspirational** population classes do not block publication when mandatory conditions are met.
4. **Every conceivable or planned asset** is not required. **Numeric completeness** is not required unless constitutionally declared in the collection mandate.
5. **Operational launch targets** and **downstream release readiness** do not determine constitutional publication.
6. **Phased or staged publication** may occur only where the collection mandate **explicitly authorizes** it.
7. When the mandate is **silent** on staging, all declared mandatory population conditions must be satisfied before publication.

No counts, percentages, schedules, production milestones, or operational launch gates are prescribed.

### 8.2 Facet 2 — Collection Consistency

| Field | Content |
|-------|---------|
| **Constitutional question** | What collection-scoped coherence must be preserved among existing members over time? |
| **Owned subjects** | Longitudinal balance, thematic range, repetition discipline, medium character coherence, visual harmony, and declared diversity or range principles — only where tied to declared collection identity, declared collection mandate, declared collection range principles, or frozen upstream visual constraints |
| **Excluded subjects** | Global visual permission, typography, composition, or visual character (Volume 02); admission-time population fit (`FI-DSN-STD-010`); unbounded curator preference; curation workflows; runtime harmonization workflows |
| **Removal test** | **Pass** — without this facet, longitudinal coherence among collection members would be ungoverned at the constitutional layer |

**Architecture decisions:**

- **Volume 02** owns global visual permission, typography, composition, and visual character.
- **`FI-DSN-STD-010`** owns admission-time population fit.
- **`FI-DSN-STD-011`** owns longitudinal coherence among existing members over time.
- Longitudinal consistency obligations apply only where tied to **declared collection identity, mandate, range principles, or frozen upstream visual constraints** — not unbounded curator preference.
- Consistency applies to **governed collections with existing members**, whether published or unpublished, when consistency is the principal subject.

### 8.3 Facet 3 — Collection Maintenance

| Field | Content |
|-------|---------|
| **Constitutional question** | What affirmative lifecycle obligations preserve a governed collection after publication? |
| **Owned subjects** | Preserving lifecycle validity after publication; preserving declared longitudinal consistency; responding constitutionally to Domain 1 validity outputs; initiating the appropriate lifecycle policy response where continuing publication conditions fail; addressing declared lifecycle obligations when metadata or manufacturing boundaries materially change |
| **Excluded subjects** | Publication eligibility rules; withdrawal rules; retirement rules; supersession rules; grandfathering rules; consistency definitions; review intervals; operational cadence; replacement procedures; refresh workflows; production tasks; metadata schema ownership; manufacturing scheduling; DAM operator workflows |
| **Removal test** | **Pass** — without this facet, the affirmative post-publication sustainment duty and mandatory response to Domain 1 validity postures would lack a constitutional home |

**Architecture decisions:**

- Maintenance governs the **obligation to preserve and respond**, not the operational method.
- Maintenance does **not** duplicate publication eligibility, withdrawal, retirement, supersession, grandfathering, or consistency definitions.
- Maintenance **triggers** appropriate facet responses (Withdrawal, Supersession, Retirement) when continuing publication conditions fail — it does not redefine those facets.

**Merge test (Consistency + Maintenance):** **Not merged.** Consistency defines **what coherence must hold**; Maintenance defines **what affirmative obligations preserve lifecycle validity and coherence over time**. Distinct constitutional questions.

### 8.4 Facet 4 — Withdrawal Policy

| Field | Content |
|-------|---------|
| **Constitutional question** | Under what constitutional conditions may an asset or collection be removed from published availability without redefining membership validity? |
| **Owned subjects** | Member-level and collection-level withdrawal; temporary or indefinite unavailability postures; mandatory nonpublication or withdrawal response to Domain 1 invalidation, disqualification, and revocation postures per Section 7.3; republication of withdrawn valid members where lifecycle law permits |
| **Excluded subjects** | Membership revocation authority (Domain 1); technical unpublishing; fulfillment mechanics; storage deletion |
| **Removal test** | **Pass** — without this facet, availability removal could not be governed independently from membership validity |

**Architecture decisions:**

- **Withdrawal** removes an asset or collection from published availability. It does not necessarily change underlying membership validity.
- A **valid member may be withdrawn** while remaining a member. Withdrawal may be **temporary or indefinite**.
- **Nonpublication** is distinct from withdrawal: nonpublication means never having entered published availability; withdrawal means exit from an existing published posture.
- **Temporary unavailability** is a bounded form of withdrawal, not a separate constitutional facet.
- Withdrawal is **distinct from membership revocation**, **retirement**, and **nonpublication**.
- A withdrawn but valid member **may later be republished** where membership remains valid and lifecycle law permits — distinct from **reactivation** after retirement.
- Invalidated, disqualified, or revoked members must not remain published per Section 7.3.

**Merge test (Publication + Withdrawal):** **Not merged.** Publication governs entry and remain-in eligibility; Withdrawal governs exit from availability.

### 8.5 Facet 5 — Grandfathering Policy

| Field | Content |
|-------|---------|
| **Constitutional question** | Under what constitutional conditions may prior lifecycle treatment continue after governing standards or conditions change? |
| **Owned subjects** | Bounded lifecycle treatment after governing conditions change; explicit authorization requirements; valid Domain 1 membership requirement; prohibition on overriding invalid membership or upstream visual prohibition; application to members and collections |
| **Excluded subjects** | Invalid membership preservation; override of Volume 02 global prohibition; informal exception without explicit authorization; operational transition playbooks; transition deadlines |
| **Removal test** | **Pass** — without this facet, lawful treatment after upstream or policy change would be undefined |

**Architecture decisions:**

- Grandfathering is a **bounded lifecycle treatment**, not an availability state or informal exception mechanism.
- Grandfathering **requires explicit authorization** and **valid Domain 1 membership**.
- Grandfathering **may not** preserve publication after Domain 1 invalidation, disqualification, or revocation.
- Grandfathering **may not** override upstream visual prohibition.
- Grandfathering is **temporary or transitional by default**; indefinite grandfathering is permitted only where lifecycle law **expressly authorizes** it.

**Merge test (Grandfathering + Maintenance):** **Not merged.** Maintenance is ongoing preservation duty; Grandfathering is bounded exception after change.

### 8.6 Facet 6 — Supersession Policy

| Field | Content |
|-------|---------|
| **Constitutional question** | How may a governed member or collection be constitutionally replaced by a successor without erasing historical lifecycle relationships? |
| **Owned subjects** | Declared successor relationships for members and collections; prohibition on automatic membership inheritance; constitutional lineage preservation without provenance schema ownership |
| **Excluded subjects** | Automatic Domain 1 membership transfer; automatic withdrawal or retirement of predecessor; automatic publication of successor; provenance schema ownership; metadata field definitions; operational migration or replacement procedures |
| **Removal test** | **Pass** — without this facet, successor relationships would collapse into withdrawal or retirement without governed continuity |

**Architecture decisions:**

- Supersession creates a **declared successor relationship** — not an availability state.
- Supersession is **distinct from withdrawal and retirement**.
- Supersession does **not** automatically withdraw or retire the predecessor, publish the successor, or confer Domain 1 membership.
- Successor assets **require independent Domain 1 membership decisions** before lifecycle treatment attaches.
- **Collection-level supersession** and **member-level supersession** are distinct constitutional subjects within one facet.

**Merge test (Supersession + Retirement):** **Not merged.** Supersession declares successor lineage; Retirement ends active treatment.

### 8.7 Facet 7 — Retirement Policy

| Field | Content |
|-------|---------|
| **Constitutional question** | Under what conditions does a governed member or collection reach the presumptively final end of active lifecycle treatment? |
| **Owned subjects** | Presumptively final end of active lifecycle governance; distinction between retirement and historical membership record; distinction between retirement and withdrawal; bounded reactivation as authorized transition per Section 7.2; application to valid members and collections for lifecycle policy reasons |
| **Excluded subjects** | Storage archives; file retention; deletion mechanics; data destruction; membership revocation; Domain 1 membership validity restoration |
| **Removal test** | **Pass** — without this facet, final lifecycle closure would be undefined |

**Architecture decisions:**

- **Retirement** is the **presumptively final end of active lifecycle treatment** for a governed member or collection.
- Retirement is **more than withdrawal**. It ends active lifecycle treatment; withdrawal removes availability only.
- Retirement does **not** erase historical membership relationships, destroy constitutional entity history, define archive storage or deletion, or revoke Domain 1 membership.
- A retired member **may** remain historically part of a collection for constitutional record purposes without active publication.
- A retired collection **continues to exist** constitutionally for historical record purposes.
- **Reactivation** (`OQ-STD-011-002` resolved) is an **explicitly authorized constitutional transition** restoring active lifecycle treatment after retirement. It is not a durable posture, not a separate facet, does not restore or alter Domain 1 membership validity, requires valid membership where member publication is involved, and differs from republishing a merely withdrawn valid member.

**Merge test (Withdrawal + Retirement):** **Not merged.** Withdrawal governs availability removal; Retirement governs end of active lifecycle treatment.

### 8.8 Lifecycle vocabulary model (taxonomy only)

See Section 7.4 for the constitutional vocabulary taxonomy. Lifecycle terms are **not** a flat set of peer states and do **not** create a runtime state machine, database values, or workflow statuses.

**Merge test (Lifecycle State Model + all facets):** **Not merged as independent facet.** Vocabulary expresses facet outcomes across availability postures, lifecycle treatments, successor relationships, lifecycle conclusions, and authorized transitions.

---

## 9. Upstream Dependency Model

### 9.1 `FI-DSN-STD-010` — Collection Membership and Eligibility

| Consumes | Does not absorb |
|----------|-----------------|
| Frozen membership decisions; membership validity posture; exclusion basis; revocation posture; exclusivity posture; governing authority basis; all nine output categories in Section 10 | Permanent membership eligibility; inclusion or exclusion rules; invalidation or disqualification ownership; membership revocation authority |

### 9.2 Volume 02 — Visual permission

| Consumes | Does not absorb |
|----------|-----------------|
| Visual identity and character constraints for longitudinal consistency evaluation | Global visual permission; typography; composition; element character rules |

### 9.3 Volume 03 — Surface implementation

| Consumes | Does not absorb |
|----------|-----------------|
| Surface and spatial constraints where lifecycle treatment is materially affected | Surface architecture; spatial allocation ownership |

### 9.4 Volume 04 — Artwork intelligence

| Consumes | Does not absorb |
|----------|-----------------|
| Contextual policy where continued publication or lifecycle treatment is materially affected | Contextual eligibility; authorized selection; personalization policy |

### 9.5 `FI-DSN-GOV-002` — Metadata

| Consumes | Does not absorb |
|----------|-----------------|
| Metadata field semantics and completeness obligations at lifecycle boundaries | Metadata schemas; provenance ownership |

Metadata incompleteness affects Domain 1 validity only where frozen `FI-DSN-STD-010` made it a continuing validity condition. It may affect publication or Maintenance where lifecycle-boundary completeness is declared. It does not automatically require withdrawal and does not transfer metadata semantics or schema ownership.

### 9.6 `FI-DSN-GOV-004` — Brain authority

| Consumes | Does not absorb |
|----------|-----------------|
| Brain Authority Boundaries and Compliance Boundaries | Runtime orchestration; selection mechanics |

### 9.7 `FI-MFG-*` — Manufacturing

| Consumes | Does not absorb |
|----------|-----------------|
| Manufacturing feasibility boundaries where continued publication or lifecycle treatment materially depends on producibility | Production readiness; manufacturing execution; scheduling; fulfillment |

Loss of producibility does not change membership validity through `FI-DSN-STD-011`. It may affect publication or lifecycle treatment only where the collection mandate materially depends on producibility. It may require lifecycle review and may justify withdrawal or grandfathering only where membership remains valid and governing lifecycle policy permits. Manufacturing execution authority is not transferred.

---

## 10. Domain 1 Membership Output Consumption

`FI-DSN-STD-011` consumes the nine constitutional output categories defined by frozen `FI-DSN-STD-010` without reinterpretation:

| Category | Domain 2 consumption use | Reinterpretation prohibited |
|----------|--------------------------|----------------------------|
| **Collection entity reference** | Identify which governed collection lifecycle treatment applies to | Entity creation or mandate definition |
| **Membership decision posture** | Inform lifecycle response to overall membership state | Membership grant or denial authority |
| **Membership grant or denial** | Determine whether lifecycle treatment may attach to a member | Admission eligibility re-evaluation |
| **Exclusion basis or exclusion class** | Distinguish upstream or Domain 1 exclusion from lifecycle withdrawal | Collection exclusion policy ownership |
| **Invalidation posture** | Trigger mandatory nonpublication or withdrawal per Section 7.3 | Invalidation conclusion ownership |
| **Disqualification posture** | Trigger mandatory nonpublication or withdrawal per Section 7.3 | Disqualification conclusion ownership |
| **Revocation posture** | Require nonpublication or withdrawal per Section 7.3; coordinate post-revocation lifecycle treatment | Revocation authority ownership |
| **Multi-collection or exclusivity posture** | Inform collection-level publication and consistency treatment | Exclusivity rule definition |
| **Governing authority reference** | Identify applicable Domain 1 authority basis without re-deriving membership law | Authority model ownership |

These categories are constitutional inputs only. They do not prescribe schemas, field names, APIs, event messages, document formats, runtime payloads, or workflow handoffs.

---

## 11. Relationship to `FI-DSN-STD-010`

| `FI-DSN-STD-010` (frozen) | `FI-DSN-STD-011` (this standard) |
|---------------------------|----------------------------------|
| Owns permanent membership eligibility, inclusion, exclusion, and validity | Consumes frozen membership outputs per Section 10 |
| Produces membership outputs in nine constitutional categories | Determines publication, consistency, maintenance, withdrawal, grandfathering, supersession, and retirement |
| Governs admission-time population fit | Governs longitudinal consistency among existing members |

Cross-reference requirements in both standards are expected at freeze review per `OQ-V05-002`.

---

## 12. Architectural Principles

| ID | Principle | Statement |
|----|-----------|-----------|
| **LIF-P1** | **Membership precedes lifecycle** | Lifecycle policy consumes frozen Domain 1 membership decisions; this standard does not redefine permanent membership eligibility |
| **LIF-P2** | **Publication is not membership** | Publication governs constitutional availability posture; membership grant remains Domain 1 |
| **LIF-P3** | **Publication is not manufacturing readiness** | Publication policy is distinct from production scheduling, fulfillment, and manufacturing execution |
| **LIF-P4** | **Longitudinal consistency is collection-scoped** | Consistency governs existing members over time within declared collection mandate; global visual rules remain Volume 02 |
| **LIF-P5** | **Admission fit is not longitudinal consistency** | Domain 1 population fit governs admission only; longitudinal coherence belongs to Domain 2 |
| **LIF-P6** | **Withdrawal is not revocation** | Availability removal is lifecycle posture; membership revocation remains Domain 1 |
| **LIF-P7** | **Grandfathering cannot override invalid membership** | Bounded continuation after change is permitted only where membership remains valid and upstream law permits |
| **LIF-P8** | **Supersession does not confer membership** | Successor assets require independent Domain 1 membership decisions |
| **LIF-P9** | **Metadata referenced, not redefined** | Lifecycle policy consumes `FI-DSN-GOV-002` semantics; provenance ownership stays with `FI-DSN-GOV-002` |
| **LIF-P10** | **Implementation independence** | Lifecycle policy remains valid across DAM, partner program, rendering, and vendor change without constitutional redesign |

---

## 13. Provisional Requirement Groups

| Group | Anticipated subject | Facet source |
|-------|---------------------|--------------|
| **G1** | Constitutional inheritance and Domain 1 consumption rule | Section 4; Section 6 |
| **G2** | Principal-subject placement and deferral | Section 5 |
| **G3** | Collection publication policy | Facet 1 |
| **G4** | Collection consistency | Facet 2 |
| **G5** | Collection maintenance | Facet 3 |
| **G6** | Withdrawal, grandfathering, and supersession policy | Facets 4–6 |
| **G7** | Retirement and bounded reactivation | Facet 7 |
| **G8** | Brain Interaction and manufacturing Compliance Boundary posture | Sections 16–17 |

---

## 14. Mandatory Ownership Exclusions

`FI-DSN-STD-011` does **not** own:

| Subject | Authoritative home |
|---------|-------------------|
| Permanent membership eligibility; collection entity creation; inclusion; exclusion; invalidation; disqualification; revocation authority | `FI-DSN-STD-010` — Domain 1 |
| Global visual permission; typography; composition permission | Volume 02 |
| Surface structure; spatial allocation; exterior geometry | Volume 03 — `FI-DSN-STD-004`–`006` |
| Contextual selection; occasion meaning; personalization | Volume 04 — `FI-DSN-STD-007`–`009` |
| Metadata field semantics; provenance schemas | `FI-DSN-GOV-002` |
| DAM behavior; storage; file systems; databases; APIs | Engineering |
| Runtime state engines; workflow procedures; approval queues | Engineering / `FI-DSN-GOV-004` runtime layer |
| Production scheduling; manufacturing execution; fulfillment; delivery timing | `FI-MFG-*` / engineering |
| Customer communication; archival storage; deletion mechanics | Engineering / product |

---

## 15. Architecture Tests

### 15.1 Removal test

All seven facets in Section 8 passed. No facet merely restates another authority.

### 15.2 Merge test summary

| Pair tested | Result |
|-------------|--------|
| Publication + Withdrawal | **Not merged** — distinct availability entry and exit |
| Consistency + Maintenance | **Not merged** — coherence definition vs preservation duty |
| Withdrawal + Retirement | **Not merged** — availability vs active treatment end |
| Grandfathering + Maintenance | **Not merged** — bounded exception vs ongoing duty |
| Supersession + Retirement | **Not merged** — successor lineage vs closure |
| Lifecycle State Model + all facets | **Not merged** — postures are vocabulary, not independent facet |

### 15.3 Split test

No facet contains more than one independent constitutional question requiring split. One standard remains sufficient per frozen Volume 05 Section 9.4.

### 15.4 Ownership test

Each facet owns a principal constitutional subject. Consumer-only subjects appear only in upstream dependency and exclusion tables.

### 15.5 Implementation independence test

No procedures, review schedules, operational cadence, workflow steps, deployment mechanics, database states, status fields, event triggers, APIs, automation, runtime orchestration, manufacturing procedures, or customer timing are prescribed.

### 15.6 Completeness test

The seven-facet model can support a complete normative requirement set without reopening membership-versus-lifecycle boundary, publication completeness, collection-versus-member publication hierarchy, consistency scope, maintenance scope, invalidation lifecycle response, withdrawal meaning, grandfathering bounds, supersession effects, retirement finality, reactivation authority, posture relationships, or Domain 1 handoff.

### 15.7 Normative readiness test

| Subject | Architecture coverage |
|---------|----------------------|
| Domain 1 consumption without reinterpretation | **Yes** — Sections 6, 7.3, 10, 11 |
| Publication completeness (mandatory population conditions) | **Yes** — Facet 1; Section 3 |
| Collection principal / member subordinate publication | **Yes** — Facet 1 |
| Publication vs manufacturing readiness | **Yes** — Facet 1; LIF-P3 |
| Longitudinal consistency vs Volume 02 and Domain 1 | **Yes** — Facet 2; LIF-P4–P5 |
| Maintenance independence and narrow scope | **Yes** — Facet 3 |
| Invalidation, disqualification, revocation response | **Yes** — Section 7.3; Facet 4 |
| Withdrawal vs nonpublication vs revocation | **Yes** — Section 7.2–7.3; Facet 4; LIF-P6 |
| Grandfathering bounds | **Yes** — Facet 5; LIF-P7 |
| Supersession without membership inheritance | **Yes** — Facet 6; LIF-P8 |
| Retirement presumptive finality and reactivation | **Yes** — Facet 7; Section 7.2 |
| Lifecycle vocabulary taxonomy | **Yes** — Section 7.4 |
| One standard sufficient | **Yes** — Section 15.3 |

---

## 16. Brain Interaction (policy boundary posture)

Collection Lifecycle and Consistency defines Decision-stage lifecycle policy. Brain Runtime and operational systems may operationalize lifecycle treatment within frozen bounds.

Brain Runtime and operational systems must not redefine publication, consistency, maintenance, withdrawal, grandfathering, supersession, or retirement as normative policy; treat runtime signals or DAM state as sources of Decision-stage lifecycle law; or reinterpret frozen Domain 1 membership outputs.

Normative Brain Interaction requirements are deferred to later normative drafting per `FI-DSN-TPL-001` Section 7.

---

## 17. Manufacturing and Metadata Considerations (posture only)

### 17.1 Manufacturing

Applicable frozen `FI-MFG-*` standards are consumed as Compliance Boundary inputs only where continued publication or lifecycle treatment materially depends on producibility. Manufacturing integration policy remains `CLS-MFI` when integration is principal.

Loss of producibility does not change membership validity through `FI-DSN-STD-011`. It may affect publication or lifecycle treatment only where the collection mandate materially depends on producibility; may require lifecycle review; and may justify withdrawal or grandfathering only where membership remains valid and governing lifecycle policy permits. Manufacturing execution authority is not transferred.

### 17.2 Metadata

`FI-DSN-GOV-002` metadata field semantics and completeness obligations are consumed at lifecycle boundaries only. Metadata incompleteness affects Domain 1 validity only where frozen `FI-DSN-STD-010` made it a continuing validity condition. It may affect publication or Maintenance where lifecycle-boundary completeness is declared. It does not automatically require withdrawal and does not transfer metadata semantics or schema ownership.

Normative manufacturing integration and metadata boundary requirements are deferred to later normative drafting.

---

## 18. Company Judgment

This architecture is based on company judgment.

F.I. Forgot has chosen to govern Collection Lifecycle and Consistency as a single Domain 2 standard because frozen Volume 05 architecture assigns publication, consistency, maintenance, and retirement to one temporal governing question and rejects four-domain lifecycle split.

Entity-level and member-level lifecycle postures, bounded grandfathering authorization, and successor-without-membership inheritance are company judgment recorded in Sections 8 and 12.

---

## 19. Open Questions

| ID | Status | Issue | Blocks requirement drafting? |
|----|--------|-------|------------------------------|
| `OQ-STD-011-001` | **Resolved** | Whether a governed collection may enter a published availability posture when its declared population mandate is only partially satisfied by valid members | **No** — resolved by mandatory population condition model in Facet 1 (Section 8.1) |
| `OQ-STD-011-002` | **Resolved** | Whether bounded reactivation after retirement requires a distinct constitutional authorization model or is subsidiary to retirement policy requirements | **No** — resolved: reactivation is an authorized transition under Retirement Policy (Facet 7; Section 7.2) |

No open questions remain that block normative requirement drafting.

---

## 20. Architecture Validation Gate

| Gate | Pass criterion |
|------|----------------|
| Governing question | Lifecycle and consistency only; membership deferred to Domain 1 |
| Facet completeness | Seven facets retained; merge and split tests passed |
| Domain 1 consumption | Section 10 categories consumed without reinterpretation |
| Vocabulary boundary | Section 7 distinguishes membership from lifecycle terms; taxonomy in Section 7.4 |
| Publication completeness | Mandatory population condition model defined in Facet 1 |
| Invalidity response | Section 7.3 defines nonpublication and withdrawal consequences |
| Implementation independence | No schemas, workflows, state machines, or runtime logic |
| One standard sufficient | No conflict with frozen Volume 05 two-standard inventory |

**Architecture validation posture:** Architecture refined per Sprint D17.0B; ready for normative requirement drafting (Sprint D17.1).

---

## 21. Related Standards

| Standard | Relationship |
|----------|--------------|
| `playbook/design/volume-05-signature-collections/01-signature-collections-architecture.md` | Frozen Volume Governance — Domain 2 constitutional authority |
| `playbook/design/volume-05-signature-collections/02-collection-membership-and-eligibility-standard.md` | Frozen Domain 1 peer — membership output producer |
| `playbook/design/volume-02-visual-design/01-visual-design-architecture.md` | Frozen Volume 02 — visual identity inputs |
| `playbook/design/volume-03-surface-implementation/01-surface-implementation-architecture.md` | Frozen Volume 03 — structure and spatial inputs |
| `playbook/design/volume-04-artwork-intelligence/01-artwork-intelligence-architecture.md` | Frozen Volume 04 — contextual policy inputs |
| `FI-DSN-PRN-001` through `FI-DSN-STD-009` | Frozen upstream standards — Compliance Boundary inputs |
| `FI-DSN-GOV-004` | Brain authority model; Decision versus runtime distinction |
| `FI-DSN-GOV-002` | Metadata handoff — field semantics owner |
| `FI-DSN-VOL-001` | Primary Volume and Required category framework |
| `FI-DSN-CLS-001` | `CLS-ASG` classification authority |
| Applicable `FI-MFG-*` | Compliance Boundary inputs |

---

## 22. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 Architecture Draft | July 27, 2026 | F.I. Forgot | Sprint D17.0 — initial Collection Lifecycle and Consistency Standard architecture: locked governing question; principal subject; seven constitutional facets; lifecycle vocabulary boundary; Domain 1 membership output consumption model; LIF-P1–LIF-P10; provisional requirement groups G1–G8; architecture validation gate; no normative requirements assigned |
| 0.2 Architecture Draft | July 27, 2026 | F.I. Forgot | Sprint D17.0B — targeted architecture refinement per D17.0A validation: mandatory population condition publication model (`OQ-STD-011-001` resolved); collection-principal publication hierarchy; Domain 1 validity lifecycle response model (Section 7.3); nonpublication versus withdrawal distinction; presumptively final retirement and reactivation as authorized transition (`OQ-STD-011-002` resolved); lifecycle vocabulary taxonomy (Section 7.4); narrowed Maintenance scope; refined Consistency mandate-tie rule; manufacturing and metadata boundary triggers; seven facets preserved |

### Future revision notes

Revision to this standard after freeze requires governed change control per `FI-DSN-GOV-001` Section 15. Material change to principal-subject ownership, facet model, or Domain 1 consumption boundary requires architectural revision before normative amendment.

---

**End of Document**
