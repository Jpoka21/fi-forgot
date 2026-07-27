# F.I. Forgot Design Library — Volume 05

# Signature Collections Architecture

## Document Control

| Field | Value |
|-------|-------|
| **Document class** | Volume Governance |
| **Document** | `01-signature-collections-architecture.md` |
| **Volume** | 05 — Signature Collections |
| **Title** | Signature Collections Architecture |
| **Sprint working label** | `FI-DSN-V05-001` (D16.0 tracking only — not an authorized `FI-DSN-*` namespace per `FI-DSN-ID-001`) |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | July 27, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Volume roadmap** | `FI-DSN-VOL-001` — Design Volume Roadmap (Frozen Design Volume Roadmap, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Register reference** | `FI-DSN-REG-001` — Design Planning Register (Frozen Planning Register, Version 1.0, July 22, 2026) |
| **Queue reference** | `FI-DSN-QUE-001` — Design Drafting Queue (Frozen Design Drafting Queue, Version 1.0, July 23, 2026) |
| **Epistemic reference** | `FI-DSN-GOV-003` — Evidence vs Company Judgment Governance (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Brain authority reference** | `FI-DSN-GOV-004` — Brain Authority Boundary (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Upstream governance** | `playbook/design/README.md`; `playbook/design/09-design-volume-roadmap.md`; frozen Volume 02 Visual Design Architecture and frozen Volume 02 `FI-DSN-*` standards; frozen Volume 03 Surface Implementation Architecture and frozen Volume 03 `FI-DSN-*` standards; frozen Volume 04 Artwork Intelligence Architecture and frozen Volume 04 `FI-DSN-*` standards |
| **Downstream consumers** | Future Volume 05 `FI-DSN-*` standards; production artwork libraries; partner design guidance; engineering specifications |

**Standard statement:** F.I. Forgot maintains **one authoritative Signature Collections Architecture** for Volume 05 that defines durable constitutional purpose, two-domain authority architecture, inheritance and decision placement rules, and cross-volume relationships for governed asset library operations. This document governs how Volume 05 is organized. It does not author normative collection requirements, membership rule prose, release workflow steps, metadata schemas, manufacturing operational policy, engineering behavior, or Brain runtime logic.

**Volume naming and constitutional purpose posture:** Two distinct labels apply at different governance layers and MUST NOT be conflated:

| Layer | Label | Scope |
|-------|-------|-------|
| **Frozen volume name** | Signature Collections (`FI-DSN-VOL-001`) | Production volume identity and Required category framework — unchanged |
| **Constitutional volume purpose** | Governed Asset Library Operations (this document) | Product-independent durable purpose — how permanent governed artwork collections exist as constitutional entities, receive membership definition, undergo lifecycle governance, and retire under upstream design law |

Frozen roadmap language that references collection systems, artwork governance, and release criteria is harmonized here as **library operations policy**, not asset authoring, contextual selection, surface layout, or production catalog implementation.

**Source basis:** Company judgment. This architecture is an F.I. Forgot governance choice. It is not derived from vendor facts, verified evidence, or production system behavior.

---

## 1. Purpose

This document is the **Volume Governance architecture** for F.I. Forgot Volume 05 — Signature Collections.

Its purpose is to define:

- The permanent constitutional role of governed asset library operations within the Design Library
- The governing question Volume 05 answers after Volumes 02, 03, and 04 are complete
- What authorities exist within Volume 05's two constitutional domains and what they do not own
- How future Volume 05 standards are assigned to domains and classifications
- How Volume 05 inherits upstream visual permission, surface implementation, and contextual application authority
- How Volume 05 relates to peer volumes and frozen governance artifacts
- The **collection scope** required for Volume 05 **Entry Ready** posture per `FI-DSN-VOL-001` Section 17.2

This document is **not** an asset style guide, occasion taxonomy, personalization workflow, selection algorithm description, template specification, metadata schema, manufacturing standard, digital asset management specification, marketing asset pipeline, product UI guide, or Brain implementation document. Those belong to future standards or systems governed by this architecture.

Product contexts may expand. Collection technologies may change. Partner programs may grow. This architecture SHALL remain stable across those changes.

---

## 2. Constitutional Question

Volume 05 exists to answer one governing question:

> **Given permitted visual treatments (Volume 02), governed surface implementation (Volume 03), and contextual application policy (Volume 04), how shall permanent governed artwork collections exist as constitutional entities — with membership defined, lifecycle governed, and retirement bounded — without redefining upstream visual permission, structural authority, contextual selection policy, personalization policy, authorized alternatives, or manufacturing operational policy?**

This question is **library-operational**. It governs **collections as constitutional entities** — permanent library containers, membership preconditions, inclusion and exclusion, collection publication policy, cross-asset consistency, maintenance discipline, and retirement — enclosed within upstream Compliance Boundaries.

Volume 05 does **not** answer:

- Whether a visual treatment is permitted in principle (Volume 02)
- Where a treatment may occupy a governed surface (Volume 03)
- Which permitted treatment applies in a given contextual circumstance (Volume 04)
- Whether a permitted artwork may appear in an authorized alternative set for a specific selection context (`CLS-BVS` / `FI-DSN-STD-007`)
- What message wording is expressed (Brain Architecture / product)
- How the Brain ranks or computes recommendations (runtime implementation)
- How production systems store, render, or ship assets (engineering implementation)

### 2.1 Constitutional eligibility boundaries

The term **eligibility** has three distinct constitutional meanings in the Design Library. Future Volume 05 standards and consumers SHALL use this matrix. Volume 05 MUST NOT collapse these meanings.

| Eligibility type | Constitutional owner | Governing question | Volume 05 role |
|------------------|------------------------|--------------------|----------------|
| **Identity eligibility** | Volume 02 | May this visual treatment exist? | **Consume** — upstream Compliance Boundary; MUST NOT redefine |
| **Contextual eligibility** | Volume 04 — `CLS-BVS` / `FI-DSN-STD-007` | May this permitted artwork be selected for this specific situation? | **Consume** — upstream Compliance Boundary; MUST NOT redefine |
| **Permanent collection membership eligibility** | Volume 05 — Domain 1 — `CLS-ASG` | May this approved artwork permanently belong to this governed collection? | **Own** when principal |

**Permanent rule:**

> **Identity eligibility governs existence. Contextual eligibility governs instance selection. Permanent collection membership eligibility governs library belonging. These are peer-separated authorities; none substitutes for another.**

#### Worked eligibility example

| Scenario | Eligibility type | Owner |
|----------|------------------|-------|
| A neon gradient violates global brand exclusion rules | Identity eligibility | Volume 02 |
| A sympathy illustration may appear on a contextual Preference Surface for a bereavement send | Contextual eligibility | `FI-DSN-STD-007` |
| A sympathy illustration may permanently belong to the Signature Sympathy Collection | Permanent collection membership eligibility | Volume 05 — Domain 1 |

---

## 3. Collection Scope (Planning Posture)

`FI-DSN-VOL-001` Section 17.2 requires **collection scope defined in planning** for Volume 05 **Entry Ready**. This section records that scope at the architecture layer.

### 3.1 In scope for Volume 05

| Scope element | Definition |
|---------------|------------|
| **Signature Collections** | Permanent, curated artwork libraries that establish F.I. Forgot's recognizable governed visual identity across product surfaces |
| **Governed collection entities** | Durable library containers with defined membership, release posture, consistency obligations, and retirement rules |
| **Collection membership authority** | Permanent collection membership preconditions and collection-scoped inclusion/exclusion rules |
| **Collection lifecycle authority** | Collection publication policy, maintenance discipline, consistency requirements, and retirement governance |
| **Collection metadata handoff** | Boundary obligations for what collection records must expose to downstream systems — without redefining `FI-DSN-GOV-002` field semantics |
| **Upstream reconcilability** | Collection rules MUST consume and MUST NOT weaken frozen Volume 02–04 authority |

### 3.2 Out of scope for Volume 05

| Excluded subject | Authoritative owner |
|------------------|---------------------|
| Visual character, identity violations, global exclusions | Volume 02 |
| Surface topology, spatial allocation, exterior presentation | Volume 03 |
| Occasion semantics, personalization policy, authorized selection | Volume 04 |
| Individual asset authoring pipelines and creative production workflows | Engineering / creative operations |
| Digital asset management implementation, CDN topology, file formats | Engineering |
| Marketing campaign asset operations unrelated to governed Signature Collections | Product / marketing operations |
| Brain runtime recommendation pools and selection orchestration | Implementation per `FI-DSN-GOV-004` |
| Manufacturing operational policy | Volume 01 — `FI-MFG-*` |
| Partner-specific collection variants | **Optional** per `FI-DSN-VOL-001` Section 19.4 — not in initial constitutional scope |
| Experimental collection pilots | **Deferred** per `FI-DSN-VOL-001` Section 19.4 |

### 3.3 Entry Ready posture

With this scope definition, Volume 05 satisfies the **collection scope defined in planning** precondition for **Entry Ready** per `FI-DSN-VOL-001` Section 17.2, subject to upstream volume **Entry Ready** posture. This document does not update `FI-DSN-VOL-001` Section 6.3 Volume Status; governed roadmap reconciliation remains a separate sprint.

---

## 4. Scope

### 4.1 In scope

- Volume 05 constitutional purpose and library placement
- Two-domain purpose architecture and domain dependency model
- Volume 05 authority ownership and non-ownership
- Constitutional inheritance from frozen Volumes 02, 03, and 04 and applicable manufacturing constraints
- Principal-subject placement rules for future Volume 05 standards
- Cross-volume boundary architecture with Volumes 01–04
- Collection lifecycle architectural ownership across the Design Library
- Future architectural domain inventory (candidate standard titles only; **no Standard IDs assigned in this sprint**)
- Alignment with `FI-DSN-VOL-001` Volume 05 required category framework
- Category challenge record and consolidation posture

### 4.2 Out of scope

- Normative collection requirements (`{Standard ID}-R{nn}` text)
- Membership tables, release calendars, retirement schedules, or workflow step lists as normative data
- Asset file formats, storage paths, DAM APIs, or production catalog schemas
- Rendering, template coordinates, safe-area pixels, or engineering module structure
- Occasion taxonomies, personalization workflows, or selection algorithms
- Product UI flows, editor choreography, or orchestration logic
- Metadata field semantics (`FI-DSN-GOV-002`)
- Classification code definitions (`FI-DSN-CLS-001`)
- Identifier reservation mechanics (`FI-DSN-ID-001`) beyond inventory reference posture
- Drafting admission and execution order (`FI-DSN-QUE-001`) beyond sequencing posture
- Register row creation (`FI-DSN-REG-001`) — deferred to reservation sprint

---

## 5. Authority

### 5.1 What this document owns

| Authority domain | Scope |
|------------------|-------|
| **Constitutional purpose** | Permanent role of governed asset library operations within the Design Library |
| **Two-domain architecture** | Collection Membership & Eligibility and Collection Lifecycle & Consistency domains with dependency and boundary rules |
| **Collection scope** | Planning-level scope definition for Entry Ready posture |
| **Standard placement** | Rules for assigning future standards to domains and `CLS-*` classifications |
| **Inheritance architecture** | How Volume 05 consumes upstream Volumes 02–04 and manufacturing Compliance Boundaries |
| **Decision placement architecture** | How collection decisions defer to upstream volumes and downstream consumers |
| **Volume 05 scope architecture** | Declared in-scope and out-of-scope boundaries for library operations |
| **Cross-volume boundary architecture** | How Volume 05 relates to Volumes 01–04 at the planning layer |
| **Collection lifecycle architecture** | Which volume owns each lifecycle stage of governed asset libraries |
| **Cross-cutting authority definition** | How collection governance, metadata handoff, and manufacturing Compliance Boundaries are embedded in future standards |
| **Future expansion posture** | How library policy growth is accommodated without silent authority leakage |
| **Volume Supplement authorization** | Permitted supplements within Volume 05 per `FI-DSN-VOL-001` Section 20 |

### 5.2 What this document does not own

| Domain | Authoritative owner |
|--------|---------------------|
| Metadata field semantics | `FI-DSN-GOV-002` |
| Identifier allocation | `FI-DSN-ID-001` + `FI-DSN-REG-001` |
| Primary / Secondary Classification definitions | `FI-DSN-CLS-001` |
| Artifact lifecycle and freeze law | `FI-DSN-GOV-001` |
| Epistemic governance | `FI-DSN-GOV-003` |
| Brain authority model and override taxonomy | `FI-DSN-GOV-004` |
| Production normative requirements | Individual frozen `FI-DSN-*` / `FI-MFG-*` standards |
| Drafting authorization | `FI-DSN-QUE-001` |
| Planning inventory truth | `FI-DSN-REG-001` |
| Volume numbering and Primary Volume rules | `FI-DSN-VOL-001` |
| Visual permission, surface implementation, contextual application | Frozen Volume 02, 03, and 04 architectures and standards |

### 5.3 Document class and identifier posture

This document is a **Volume Governance** document per `FI-DSN-GOV-001` Section 5. Its canonical identity is its repository path and Volume 05 assignment.

The sprint working label `FI-DSN-V05-001` is **not** an authorized identifier namespace under frozen `FI-DSN-ID-001`. Future Volume 05 Layer B standards SHALL use authorized `FI-DSN-{PRN|STD|CON|POL|SYS}-###` identifiers assigned through `FI-DSN-REG-001` in a governed reservation sprint.

---

## 6. Governing Lifecycle Position

Governed asset authority is organized by **lifecycle stage**, not by production technology alone.

| Lifecycle stage | Architectural owner | Governs |
|-----------------|---------------------|---------|
| **Visual permission** | Volume 02 | What visual treatments may exist |
| **Surface system structure** | Volume 03 — Domain 1 | What governed surfaces exist and how they are organized |
| **Surface spatial allocation** | Volume 03 — Domain 2 | How permitted content occupies governed surfaces |
| **Exterior presentation boundaries** | Volume 03 — `CLS-EEP` | Outward-facing presentation boundaries |
| **Contextual application** | Volume 04 | Which permitted treatment applies in a given context |
| **Library operations** | Volume 05 | Permanent collection membership, collection publication policy, consistency, maintenance, and retirement |
| **Implementation** | Engineering / Product | How governed policy is stored, rendered, recommended, selected, and produced |

**Permanent rule:**

> **Volume 02 governs what assets may be. Volume 03 governs where assets sit. Volume 04 governs which assets apply when. Volume 05 governs how asset libraries run.**

Volume 05 sits immediately after Volume 04 in durable authority flow:

```
Planning Foundation (GOV, REG, QUE, VOL-001, CLS-001, …)
        ↓
Volume 01 — Manufacturing constraints (FI-MFG-*)
        ↓
Volume 02 — Visual Design Architecture
        ↓         frozen Volume 02 FI-DSN-* standards
Volume 03 — Surface Implementation Architecture
        ↓         frozen Volume 03 FI-DSN-* standards
Volume 04 — Artwork Intelligence Architecture
        ↓         frozen Volume 04 FI-DSN-* standards
Volume 05 — Signature Collections Architecture (this document)
        ↓         future Volume 05 FI-DSN-* standards
Production artwork libraries / Engineering Specifications / Implementation
```

This diagram is **conceptual**. It shows durable authority direction, not a mandatory drafting sequence.

---

## 7. Relationship to Other Volumes

### 7.1 Upstream — Volume 01

Volume 05 SHALL identify applicable `FI-MFG-*` manufacturing constraints for collection scope and treat them as Compliance Boundary inputs. Volume 05 MUST NOT duplicate `FI-MFG-*` normative bodies.

Collection publication policy and retirement rules MUST remain reconcilable with manufacturing feasibility constraints without restating manufacturing operational policy. Collection **publication policy** governs when a governed collection may be constitutionally published as an available library — not manufacturing execution, production scheduling, operational workflow, customer fulfillment, or delivery timing.

### 7.2 Upstream — Volume 02

Volume 05 consumes frozen Volume 02 visual permission, element boundaries, brand boundaries, relational composition principles, and exclusions when governing collection membership and cross-asset consistency. Volume 05 MUST remain reconcilable with frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`, `FI-DSN-STD-002`, and `FI-DSN-STD-003`.

Volume 02 assigns **library operations** to Volume 05 per frozen Visual Design Architecture Section 9.1 and Section 10.4. Collection-scoped inclusion and exclusion MUST NOT weaken Volume 02 identity or global exclusion boundaries.

### 7.3 Upstream — Volume 03

Volume 05 consumes frozen Volume 03 surface structure, spatial boundaries, and exterior presentation boundaries when governing how collection assets may occupy governed product surfaces once selected. Volume 05 MUST remain reconcilable with frozen `FI-DSN-STD-004`, `FI-DSN-STD-005`, and `FI-DSN-STD-006`.

Volume 05 governs **which assets belong in a library** and **how libraries operate**; Volume 03 governs **where assets sit** on surfaces. Collection standards MUST NOT author template topology, safe areas, or spatial allocation rules.

### 7.4 Upstream — Volume 04

Volume 05 consumes frozen Volume 04 contextual application policy when governing **permanent collection membership preconditions** and collection-scoped consistency evaluation. Volume 05 MUST remain reconcilable with frozen `FI-DSN-STD-007`, `FI-DSN-STD-008`, and `FI-DSN-STD-009`.

Volume 04 governs **which permitted treatment applies when** and **contextual eligibility for instance selection**; Volume 05 governs **which assets permanently belong in a governed collection** and **how that collection is operated over time**. Collection membership MUST NOT redefine occasion semantics (`CLS-OEC`), personalization policy (`CLS-PER`), authorized alternatives, or context-bound eligibility (`CLS-BVS` / `FI-DSN-STD-007`).

### 7.5 Downstream — Production and Engineering

Production artwork libraries, partner design guidance, and engineering specifications consume frozen Volume 05 policy as Compliance Boundary inputs. They MUST NOT redefine collection governance authority.

Engineering implementations MAY operationalize collection membership, release workflows, and retirement mechanics within Volume 05 bounds. They MUST NOT silently widen collection authority beyond frozen standards.

### 7.6 Alignment with `FI-DSN-VOL-001`

`FI-DSN-VOL-001` Section 19.4 Required categories for Volume 05 are mapped to constitutional domains in **Section 9**. Cross-cutting subjects (collection governance foundations, metadata handoff boundaries, manufacturing Compliance Boundaries) are embedded in future standard bodies per **Section 10**, not separate constitutional domains.

---

## 8. Authority Boundaries

### 8.1 Volume 05 versus Volume 02

| Concern | Volume 02 | Volume 05 |
|---------|-----------|-----------|
| Visual character | What a treatment **may be** | — |
| Identity-level eligibility | Whether a treatment **violates** identity or exclusion rules globally | — |
| Collection-scoped inclusion/exclusion | — | Whether a permitted asset **permanently belongs** in a specific governed collection |
| Global visual exclusions | Owns prohibitions across all visuals | Consumes; MUST NOT weaken |
| Asset medium character | Owns element-system boundaries | Consumes for collection-scoped consistency evaluation; MUST NOT become global style governance |

#### Worked ownership example — global exclusion versus collection membership

| Scenario | Principal subject | Owner |
|----------|-------------------|-------|
| Neon gradients are prohibited across all F.I. Forgot visuals | Global visual exclusion | Volume 02 |
| A specific illustration is excluded from the Holiday Signature Collection | Collection membership exclusion | Volume 05 — Domain 1 |
| The illustration violates brand identity regardless of collection | Identity-level eligibility | Volume 02 |
| Collection assets must feel visually coherent within the Signature Sympathy Collection but not redefine global illustration character | Collection-scoped consistency | Volume 05 — Domain 2 |

### 8.2 Volume 05 versus Volume 03

| Concern | Volume 03 | Volume 05 |
|---------|-----------|-----------|
| Surface system structure | Owns topology and region existence | Consumes as Compliance Boundary |
| Surface spatial allocation | Owns placement within structure | Consumes as Compliance Boundary |
| Collection asset placement feasibility | Structural and spatial limits | Evaluates membership impact against consumed boundaries |
| Template governance | Owns | — |

### 8.3 Volume 05 versus Volume 04

| Concern | Volume 04 | Volume 05 |
|---------|-----------|-----------|
| Contextual application | Which permitted treatment applies in context | — |
| Occasion / personalization / selection policy | Owns when principal | Consumes as Compliance Boundary |
| Permanent library membership | — | Owns (`CLS-ASG`) |
| Context-bound eligibility for a single instance | Owns | — |
| Collection-level consistency across assets | — | Owns — Domain 2 |

### 8.4 Volume 05 versus Brain Architecture and Product

| Concern | Brain Architecture / Product | Volume 05 |
|---------|------------------------------|-----------|
| Message intent and wording | Owns | — |
| Runtime recommendation and ranking | Owns | — |
| Collection membership, release, retirement | — | Owns (`CLS-ASG`) |
| Production catalog UX and DAM workflows | Owns implementation | — |

### 8.5 Prohibited absorptions

Volume 05 MUST NOT absorb authority owned by upstream volumes, including:

- Visual permission, global exclusions, identity eligibility, or element character (Volume 02)
- Surface structure, spatial allocation, or exterior presentation geometry (Volume 03)
- Occasion semantics, personalization policy, contextual eligibility, authorized alternatives, or authorized selection (Volume 04)
- Metadata field semantics or Visual Source provenance ownership (`FI-DSN-GOV-002`)
- Brain runtime behavior, algorithms, or orchestration (Implementation)
- Manufacturing operational policy (`FI-MFG-*`)

Volume 05 MUST NOT recreate rejected Volume 04 constructs such as decision pipelines, selection orchestration standards, or cross-domain coordination standards without demonstrated constitutional gap and governed `FI-DSN-VOL-001` / volume architecture revision.

---

## 9. Constitutional Domains

Volume 05 is organized into **two constitutional domains**. Each domain answers an independent governing sub-question. Each domain maps to one future Layer B standard with `CLS-ASG` as the primary classification.

**Domain numbering versus drafting sequence:** Constitutional domain numbers (1–2) express **organizational and principal-subject structure**. Domain order does **not** prescribe implementation order or runtime evaluation order. Drafting sequence is governed separately in **Section 12**.

### 9.1 Domain 1 — Collection Membership and Eligibility

| Field | Value |
|-------|-------|
| **Governing sub-question** | Which assets may permanently belong to a governed collection, under what membership preconditions, and under what collection-scoped inclusion and exclusion rules? |
| **Primary Classification** | `CLS-ASG` — Asset Library Governance |
| **Candidate standard** | Collection Membership and Eligibility Standard |
| **Reserved Standard ID** | Not assigned — reservation deferred to governed sprint |
| **Owns (principal only)** | Permanent collection membership; membership preconditions; collection-scoped inclusion; collection-scoped exclusion; governed collection entity boundaries for population decisions |
| **Does not own** | Visual permission; identity eligibility; contextual eligibility; contextual selection; personalization policy; authorized alternatives; metadata field semantics; Visual Source provenance ownership; manufacturing feasibility policy; runtime decisions; release publication policy; retirement policy; cross-asset consistency over time; surface layout; asset authoring |

Domain 1 governs **permanent collection membership** only. It answers whether an approved artwork may **permanently belong** to a governed collection — not whether that artwork may be selected for a specific send, not whether it is visually permitted in principle, and not how production systems store or deliver it.

**Satisfies `FI-DSN-VOL-001` Section 19.4 categories:**

- Collection governance (membership decision authority and collection entity boundaries)
- Collection eligibility and release criteria (**permanent membership eligibility** facets only)
- Asset inclusion and exclusion rules

### 9.2 Domain 2 — Collection Lifecycle and Consistency

| Field | Value |
|-------|-------|
| **Governing sub-question** | How are governed collections published, maintained, kept consistent across member assets, and retired? |
| **Primary Classification** | `CLS-ASG` — Asset Library Governance |
| **Candidate standard** | Collection Lifecycle and Consistency Standard |
| **Reserved Standard ID** | Not assigned — reservation deferred to governed sprint |
| **Owns (principal only)** | Collection publication policy; cross-asset consistency within governed collections; maintenance discipline; retirement and deprecation governance |
| **Does not own** | Permanent collection membership preconditions; inclusion/exclusion rules; visual permission; contextual selection; personalization; metadata ownership; provenance ownership; manufacturing execution; production scheduling; operational workflow; customer fulfillment; delivery timing; asset authoring |

Domain 2 governs **collection publication and lifecycle policy** only. **Collection publication policy** means constitutional rules for when a governed collection may become available as a published library — not manufacturing execution, production scheduling, operational workflow, customer fulfillment, or delivery timing.

**Satisfies `FI-DSN-VOL-001` Section 19.4 categories:**

- Collection eligibility and release criteria (**publication policy** facets only)
- Collection consistency requirements
- Collection maintenance and retirement governance

### 9.3 Domain dependency model

```
Domain 1 — Collection Membership and Eligibility (CLS-ASG)
        ↓ produces frozen permanent membership decisions
Domain 2 — Collection Lifecycle and Consistency (CLS-ASG)
        ↓ enclosed within
Upstream Compliance Boundaries (Volumes 02, 03, 04, FI-MFG-*)
```

Domain 2 MUST NOT be authored as if membership and eligibility rules were implicit. Domain 1 MUST NOT absorb publication policy, maintenance, retirement, or longitudinal consistency obligations.

### 9.3.1 Domain 1 → Domain 2 consumption boundary

**Permanent constitutional rule:**

> **Domain 2 collection publication policy consumes frozen permanent membership decisions produced by Domain 1. Publication criteria MUST NOT redefine permanent collection membership eligibility, inclusion rules, or exclusion rules.**

Domain 2 MAY reference Domain 1 membership outputs as Compliance Boundary inputs when evaluating publication readiness. Domain 2 MUST NOT re-litigate whether an asset may permanently belong to a collection when membership is the principal subject.

### 9.4 Consolidation posture

The two-domain model is the **minimum constitutional architecture** validated through governed domain elimination, merge, and relocation review per `FI-DSN-CLS-001` and the category challenge in **Section 11**.

| Rejected consolidation | Rationale |
|------------------------|-----------|
| **Single mega-standard** (all five VOL-001 categories) | Membership (structural population) and lifecycle (temporal operations) answer independent governing questions; mega-standard rejected per Volume 04 precedent |
| **Three-domain split** (governance / membership / lifecycle) | Pure governance domain would lack normative body independent of membership and lifecycle; governance embedded as cross-cutting per Section 10 |
| **Four-domain split** (release / maintenance / retirement / consistency as separate standards) | Release, maintenance, retirement, and consistency share one temporal governing question; over-segmentation prohibited |
| **Medium-specific volume standards** (illustration collection / photography collection volumes) | Medium character remains Volume 02 principal subject; Volume 05 owns library operations regardless of medium |
| **Selection pipeline standard** | Rejected at Volume 04; not revived in Volume 05 |

No additional Layer B standards are authorized by this architecture beyond the two candidate standards in Section 12. Partner-specific collection variants remain **Optional** per `FI-DSN-VOL-001` Section 19.4. Experimental collection pilots remain **Deferred**.

---

## 10. Cross-Cutting Authority

The following authorities are **cross-cutting**. They MUST appear in future Volume 05 standard bodies where applicable. They do **not** constitute separate constitutional domains or separate Layer B standards.

| Cross-cutting subject | Authoritative model | Volume 05 expression |
|----------------------|---------------------|----------------------|
| **Collection governance foundations** | This architecture P1–P11 | Decision authority, collection entity identity, and library boundary discipline embedded in Domain 1 and Domain 2 requirements |
| **Compliance Boundaries** | `FI-DSN-GOV-004` + upstream volumes | Future standards consume upstream boundaries; MUST NOT widen them |
| **Metadata handoff boundaries** | `FI-DSN-GOV-002` + Volume 03 precedent | Govern what collection records must expose; MUST NOT redefine field semantics |
| **Manufacturing constraints** | `FI-MFG-*` | Compliance Boundary citations only |
| **Brain Interaction** | `FI-DSN-TPL-001` + `FI-DSN-GOV-004` | Policy boundaries only — collection standards MUST NOT author runtime behavior |
| **Visual Source provenance** | `FI-DSN-GOV-002` + `OQ-DSN-003` | Record and consume; MUST NOT redefine provenance semantics |
| **Upstream Hard dependencies** | `FI-DSN-VOL-001` Section 19.4 | Material upstream deps MUST be Frozen before Volume 05 **Structurally Complete** |

---

## 11. Category Challenge Record

This section documents the constitutional evaluation required by Sprint D16.0.

### 11.1 `FI-DSN-VOL-001` Section 19.4 mandated categories

| Required category | Architectural disposition | Candidate standard |
|-------------------|--------------------------|-------------------|
| Collection governance | **Cross-cutting** + Domain 1 membership authority | Domain 1 (embedded) |
| Collection eligibility and release criteria | **Split** — permanent membership eligibility in Domain 1; publication policy in Domain 2 | Domains 1 and 2 |
| Asset inclusion and exclusion rules | **Domain 1** principal subject | Domain 1 |
| Collection consistency requirements | **Domain 2** principal subject | Domain 2 |
| Collection maintenance and retirement governance | **Domain 2** principal subject | Domain 2 |
| Upstream V02 / V03 / V04 dependencies | **Architecture + all standards** — consumption only | Cross-cutting |
| Partner-specific collection variants | **Optional** — not in initial inventory | — |
| Experimental collection pilots | **Deferred** | — |

### 11.2 Categories that naturally become separate standards

| Candidate standard | Principal subject | Why separate |
|--------------------|-------------------|--------------|
| Collection Membership and Eligibility Standard | Population rules — who and what may belong | Answers structural membership question independent of time |
| Collection Lifecycle and Consistency Standard | Temporal operations — release, sustain, retire | Answers operational lifecycle question independent of membership mechanics |

### 11.3 Categories that remain architecture only

| Category facet | Remains in architecture because |
|----------------|--------------------------------|
| Collection scope definition | Entry Ready planning obligation — not a Layer B principal subject |
| Upstream dependency posture | Owned by `FI-DSN-VOL-001` and cross-volume inheritance rules |
| Domain model and consolidation law | Volume Governance authority per Section 5.1 |
| Optional / deferred categories | Governed by frozen roadmap — no normative body until promoted |

### 11.4 Merge challenge summary

| Proposed merge | Challenge result |
|----------------|------------------|
| Membership + Lifecycle → one standard | **Rejected** — independent governing questions; temporal vs structural separation |
| Governance → standalone third standard | **Rejected** — would duplicate membership authority without independent principal subject |
| Release → separate from maintenance/retirement | **Rejected** — single lifecycle governing question |
| Inclusion/exclusion → Volume 02 | **Rejected** — collection-scoped rules are library operations, not global permission |
| Eligibility → Volume 04 | **Rejected** — context-bound instance eligibility (`CLS-BVS`) differs from permanent library membership eligibility |

---

## 12. Proposed Standard Inventory

The following inventory records **candidate** Volume 05 Layer B standards. **No Standard IDs are assigned in this sprint.** Reservation occurs in a subsequent governed sprint per `FI-DSN-REG-001`.

| Candidate title | Domain | Primary Classification | Drafting sequence | Register Status |
|-----------------|--------|------------------------|-------------------|-----------------|
| Signature Collections Architecture (this document) | Volume Governance | — | **First** — architecture before Layer B drafting | Frozen (Version 1.0) |
| Collection Membership and Eligibility Standard | Domain 1 | `CLS-ASG` | **Second** — after architecture freeze review | Not reserved |
| Collection Lifecycle and Consistency Standard | Domain 2 | `CLS-ASG` | **Third** | Not reserved |

**Drafting order rationale:** Domain 1 is sequenced before Domain 2 because lifecycle operations presuppose governed membership and eligibility rules. Domain numbering and drafting sequence align for Volume 05 (contrast Volume 04, where drafting sequence intentionally diverged from domain numbering).

### 12.1 Collection Membership and Eligibility Standard — constitutional purpose

| Field | Value |
|-------|-------|
| **Working title** | Collection Membership and Eligibility Standard |
| **Constitutional purpose** | Define governed collection entity boundaries, membership decision authority, permanent collection membership preconditions, and collection-scoped inclusion and exclusion rules |
| **Principal subject** | Permanent collection membership of governed asset libraries |
| **Why it cannot merge with Lifecycle standard** | Membership answers **what may belong** independent of **when collections release or retire**; merging would combine structural and temporal governing questions rejected in Section 9.4 |

### 12.2 Collection Lifecycle and Consistency Standard — constitutional purpose

| Field | Value |
|-------|-------|
| **Working title** | Collection Lifecycle and Consistency Standard |
| **Constitutional purpose** | Define collection publication policy, cross-asset consistency requirements, maintenance discipline, and retirement governance for governed collections |
| **Principal subject** | Temporal publication and coherence of governed asset libraries |
| **Why it cannot merge with Membership standard** | Lifecycle answers **how libraries run over time**; membership rules cannot subsume release, maintenance, retirement, or longitudinal consistency without authority leakage |

---

## 13. Dependency Model

### 13.1 Consumption without ownership transfer

| Upstream source | What Volume 05 consumes | What Volume 05 MUST NOT do |
|-----------------|--------------------------|----------------------------|
| **Volume 02** — `FI-DSN-PRN-001`, `FI-DSN-STD-001`–`003` | Visual permission, brand boundaries, element character, composition discipline, global exclusions | Redefine identity eligibility, element systems, or exclusions |
| **Volume 03** — `FI-DSN-STD-004`–`006` | Surface structure, spatial limits, exterior presentation boundaries for placement feasibility | Author template topology, safe areas, or spatial allocation |
| **Volume 04** — `FI-DSN-STD-007`–`009` | Contextual application, occasion semantics, personalization policy, authorized selection boundaries | Redefine `CLS-OEC`, `CLS-PER`, or `CLS-BVS` policy |
| **Manufacturing** — applicable `FI-MFG-*` | Feasibility and fulfillment Compliance Boundaries | Restate manufacturing operational policy |
| **Metadata** — `FI-DSN-GOV-002` | Field semantics and handoff obligations for collection records | Create metadata fields, schemas, or dictionaries |

### 13.2 Reconcilability gates (future standard drafting)

Future Volume 05 standards SHALL apply upstream reconcilability in dependency order:

1. Applicable `FI-MFG-*` Compliance Boundaries
2. Frozen `FI-DSN-PRN-001`, then `FI-DSN-STD-001`, `FI-DSN-STD-002`, `FI-DSN-STD-003`
3. Frozen `FI-DSN-STD-004`, `FI-DSN-STD-005`, `FI-DSN-STD-006`
4. Frozen `FI-DSN-STD-007`, `FI-DSN-STD-008`, `FI-DSN-STD-009`
5. `FI-DSN-GOV-002` metadata semantics where handoff is principal
6. Domain-appropriate Volume 05 principal subject validation

### 13.3 Downstream dependency

| Downstream consumer | Depends on Volume 05 for |
|--------------------|--------------------------|
| Production artwork libraries | Membership rules, release posture, retirement boundaries |
| Partner design guidance | Collection consistency and inclusion discipline |
| Engineering specifications | Implementable collection policy translated from frozen standards |
| Product implementation | Operational workflows bounded by collection policy — not authoritative |

---

## 14. Deferral Matrix

When the principal subject of a decision is listed below, authority belongs to the identified owner. Volume 05 standards MUST defer when the listed subject is principal.

| Principal subject | Authoritative owner |
|-------------------|---------------------|
| Visual permission, element character, brand identity, global exclusions | Volume 02 |
| Identity eligibility | Volume 02 |
| Contextual eligibility, authorized alternatives, occasion semantics, personalization policy | Volume 04 — `FI-DSN-STD-007`–`009` |
| Surface system structure, spatial allocation, exterior presentation | Volume 03 — `FI-DSN-STD-004`–`006` |
| Permanent collection membership, membership preconditions, inclusion, exclusion | Domain 1 — `CLS-ASG` |
| Collection publication policy, consistency, maintenance, retirement | Domain 2 — `CLS-ASG` |
| Metadata field semantics, schemas, dictionaries; Visual Source provenance ownership | `FI-DSN-GOV-002` |
| Manufacturing operational policy | `FI-MFG-*` |
| Message content, copywriting, communication strategy | Brain Architecture / product |
| Brain runtime behavior, algorithms, ranking, prompts | Implementation — not Design Standards |
| DAM implementation, storage, APIs, rendering | Engineering — not Volume 05 |
| Partner-specific collection variants | Optional — not initial constitutional scope |
| Experimental collection pilots | Deferred per `FI-DSN-VOL-001` Section 19.4 |

---

## 15. Architectural Principles

Future Volume 05 consumers and standard authors SHALL treat the following as permanent architectural law.

| ID | Principle | Requirement |
|----|-----------|-------------|
| **P1** | **Permission precedes membership** | Collection membership MUST consume frozen Volume 02 permission and exclusions; Volume 05 MUST NOT redefine them |
| **P2** | **Structure precedes library placement** | Collection placement assumptions MUST consume frozen Volume 03 structure and spatial boundaries; Volume 05 MUST NOT author surface layout |
| **P3** | **Context precedes library operation** | Permanent collection membership preconditions MAY consume frozen Volume 04 contextual policy outputs where material; Volume 05 MUST NOT redefine occasion semantics, personalization policy, authorized alternatives, or contextual eligibility |
| **P4** | **Membership separated from lifecycle** | Population rules and temporal library operations MUST remain in separate constitutional domains |
| **P5** | **Libraries separated from selection** | Volume 05 governs permanent library operations; MUST NOT author Decision-stage selection policy, authorized alternatives, or orchestration |
| **P6** | **Consistency is collection-scoped** | Cross-asset coherence requirements apply within governed collections; MUST NOT become global visual rules owned by Volume 02 |
| **P7** | **Manufacturing constrains; Volume 05 integrates** | Applicable `FI-MFG-*` obligations are Compliance Boundary inputs; manufacturing operational policy MUST NOT be restated |
| **P8** | **Metadata referenced, not redefined** | Collection records MUST use `FI-DSN-GOV-002` semantics; handoff boundaries only; provenance ownership remains with `FI-DSN-GOV-002` |
| **P9** | **Classification independent of architecture** | `CLS-*` assignment per `FI-DSN-CLS-001`; domains organize planning without overriding classification |
| **P10** | **Implementation independence** | Volume 05 MUST remain valid across DAM change, partner program change, rendering technology, and vendor change without constitutional redesign |
| **P11** | **Collections as constitutional entities** | Volume 05 governs governed collections as durable constitutional entities — membership, publication, consistency, maintenance, and retirement — rather than evaluating individual artwork at selection time or authoring runtime library mechanics |

---

## 16. Future Architectural Domains

The following domains are implied by this architecture for planning orientation. **No Standard IDs are assigned.** **No register population occurs in this document.**

### Domain 1 — Collection Membership and Eligibility

- Governed collection entity boundaries for population decisions
- Permanent collection membership
- Membership preconditions (permanent collection membership eligibility only)
- Collection-scoped inclusion rules
- Collection-scoped exclusion rules

Domain 1 does **not** govern visual permission, contextual selection, personalization, metadata ownership, provenance ownership, manufacturing feasibility, or runtime decisions.

### Domain 2 — Collection Lifecycle and Consistency

- Collection publication policy (not manufacturing execution or fulfillment timing)
- Cross-asset consistency requirements within a collection
- Maintenance discipline for governed collections
- Retirement and deprecation governance

Domain 2 consumes frozen Domain 1 membership decisions per Section 9.3.1. Domain 2 does **not** redefine permanent collection membership eligibility.

### Domains explicitly outside Volume 05 principal authority

| Domain | Home |
|--------|------|
| Visual element character and global exclusions | Volume 02 |
| Surface structure and spatial allocation | Volume 03 |
| Contextual application and authorized selection | Volume 04 |
| Asset authoring and creative production | Engineering / creative operations |
| Production catalog and DAM implementation | Engineering |
| Brain runtime and recommendation mechanics | Implementation per `FI-DSN-GOV-004` |
| Manufacturing operational policy | Volume 01 — `FI-MFG-*` |

---

## 17. Future Extension Rules

### 17.1 Domain stability

1. New library-operation concerns MUST map into Domain 1 or Domain 2 unless governed `FI-DSN-VOL-001` or `FI-DSN-CLS-001` revision authorizes expansion.
2. Domain merges or eliminations REQUIRE governed revision of this document and impact review per `FI-DSN-GOV-001` Section 15.
3. This architecture MUST remain valid across product-family expansion, partner program growth, new media, and new collection technologies without structural redesign.

### 17.2 Authority constraints

1. Volume 05 MUST NOT create metadata fields, queue states, identifier families, or `CLS-*` codes.
2. Volume 05 MUST NOT verify facts or define epistemic categories beyond citing Compliance Boundaries.
3. Volume 05 MUST NOT define Brain algorithms or runtime behavior.
4. Volume 05 supplements MUST NOT widen `FI-DSN-GOV-003` or `FI-DSN-GOV-004` library-wide minimums per `FI-DSN-VOL-001` Section 20.
5. Volume 05 MUST NOT recreate upstream volume authority under collection labels.

### 17.3 Implementation constraints

This document MUST NOT specify asset file paths, DAM schemas, release calendar tables, API contracts, database schemas, workflow automation, or production catalog UI behavior.

### 17.4 Volume 05 structural completeness posture

Volume 05 **Structurally Complete** posture under `FI-DSN-VOL-001` Section 18.5 requires frozen satisfaction of Required categories in Section 19.4, including resolution of material upstream **Hard** dependencies from Volumes 02–04. This architecture document does not declare Volume 05 completion.

---

## 18. Open Questions

| ID | Question | Status | Safe default |
|----|----------|--------|--------------|
| `OQ-V05-001` | Should the permanent document title emphasize "Signature Collections Architecture" or a constitutional title such as "Governed Asset Library Operations Architecture"? | Open — naming | Frozen volume number and Primary Volume unchanged; roadmap title retained; constitutional purpose stated in this document |
| `OQ-V05-002` | Should Domain 1 membership preconditions and Domain 2 publication policy share explicit handoff requirements in both standards, or only in Domain 2? | Partially resolved — architecture | Domain 1 owns permanent membership eligibility; Domain 2 owns publication policy; Section 9.3.1 permanent rule governs consumption; cross-reference required in both standards at freeze review |
| `OQ-V05-003` | How should REG **Notes** document constitutional purpose alongside frozen volume name "Signature Collections"? | Open — metadata | Record both per Volume 04 `OQ-V04-003` precedent |
| `OQ-V05-004` | Does initial Signature Collections scope include co-branded or partner-exclusive libraries, or only first-party permanent libraries? | Open — scope | First-party permanent libraries only; partner variants remain Optional per `FI-DSN-VOL-001` Section 19.4 |
| `OQ-DSN-003` | Visual Source controlled metadata schema | Open — inherited | Volume 05 proceeds; collection standards defer schema specifics |
| `OQ-DSN-008` | Primary Volume canonical metadata field | Open — inherited | REG **Notes** `Primary Volume: VOL-05` per `FI-DSN-VOL-001` Section 14.2 |
| `OQ-DSN-009` | Separate volume governance document requirement | Partially resolved for Volume 05 | Satisfied by this document when frozen |
| `OQ-CLS-001` | Cross-volume classification justification | Open — inherited | `FI-DSN-VOL-001` Section 13.1; `CLS-ASG` primary for both domains |

---

## 19. Version Metadata

### 19.1 Architecture validation (pre-freeze checklist)

Before freeze of this document, Architecture Validation MUST confirm:

| Check | Pass criterion |
|-------|----------------|
| Document class | Volume Governance per `FI-DSN-GOV-001` Section 5 |
| Two-domain model | Domains 1–2 defined with governing questions and boundaries |
| P1–P11 | All principles present and non-implementational |
| Constitutional question | Section 2 states governing question precisely |
| Eligibility boundary matrix | Section 2.1 distinguishes identity, contextual, and permanent membership eligibility |
| Domain 1 → Domain 2 handoff | Section 9.3.1 permanent consumption rule present |
| Collection publication boundary | Publication policy distinguished from manufacturing execution and fulfillment |
| Collection scope | Section 3 satisfies Entry Ready planning requirement |
| Volume 02/03/04 boundaries | Sections 7–8 matrices present |
| Brain / product / engineering boundary | Runtime and implementation excluded |
| VOL-001 alignment | Sections 9 and 11 map Required categories |
| CLS-001 harmonization | `CLS-ASG` assigned without redefinition |
| Consolidation posture | Section 9.4 documents rejected mergers |
| No implementation rules | No DAM schemas, APIs, workflows, or data tables |
| No unauthorized extensions | No new metadata, identifiers, classifications, or queue states |
| Standard inventory | Two candidate standards; no speculative third standard |
| STD-010 posture | No selection pipeline or orchestration standard authorized |

### 19.2 Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 | July 27, 2026 | F.I. Forgot | Frozen — promoted to Frozen Volume Governance; Formal Freeze Review Outcome A (Ready for Version 1.0 Freeze); architecture unchanged from Version 0.2 Architecture Draft (refined) |
| 0.2 Architecture Draft (refined) | July 27, 2026 | F.I. Forgot | Sprint D16.1A — constitutional boundary refinement: governing question disambiguated from BVS authorization; Section 2.1 three-type eligibility matrix; Domain 1 ownership strengthened; Section 9.3.1 Domain 1 → Domain 2 consumption rule; collection publication policy distinguished from manufacturing execution and fulfillment; P11 Collections as constitutional entities; P3/P5/P8 refinements |
| 0.1 Architecture Draft | July 27, 2026 | F.I. Forgot | Sprint D16.0 — initial Signature Collections Architecture Volume Governance draft: constitutional question; collection scope for Entry Ready; two-domain model (Collection Membership and Eligibility; Collection Lifecycle and Consistency); lifecycle position; cross-volume boundaries; category challenge record; proposed standard inventory (two candidates, no Standard IDs assigned); architectural principles P1–P10; consolidation posture |

### Future revision notes

Revisions after freeze require documented change control under `FI-DSN-GOV-001` Section 15. Conditions that would trigger architectural revision include: change to the two-domain model, domain merge or split, material change to collection scope, or material change to cross-volume boundary posture.

---

**End of Document**
