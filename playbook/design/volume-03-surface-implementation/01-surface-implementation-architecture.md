# F.I. Forgot Design Library — Volume 03

# Surface Implementation Architecture

## Document Control

| Field | Value |
|-------|-------|
| **Document class** | Volume Governance |
| **Document** | `01-surface-implementation-architecture.md` |
| **Volume** | 03 — Surface Implementation |
| **Title** | Surface Implementation Architecture |
| **Sprint working label** | `FI-DSN-V03-001` (D7.4 tracking only — not an authorized `FI-DSN-*` namespace per `FI-DSN-ID-001`) |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | July 24, 2026 |
| **Freeze date** | July 24, 2026 |
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
| **Upstream governance** | `playbook/design/README.md`; `playbook/design/09-design-volume-roadmap.md`; frozen Volume 02 Visual Design Architecture and frozen Volume 02 `FI-DSN-*` standards |
| **Downstream consumers** | Future Volume 03 `FI-DSN-*` standards; Volumes 04 and 05; `FI-DSN-REG-001` volume planning rows |

**Standard statement:** F.I. Forgot maintains **one authoritative Surface Implementation Architecture** for Volume 03 that defines durable purpose domains, authority boundaries, inheritance and decision architecture, standard placement rules, and cross-volume relationships for the surface implementation domain. This document governs how Volume 03 is organized. It does not author normative surface requirements, template dimensions, selection logic, collection operations, manufacturing operational policy, or Brain runtime behavior.

**Volume naming and classification posture:** Three distinct labels apply at different governance layers and MUST NOT be conflated:

| Layer | Label | Scope |
|-------|-------|-------|
| **Frozen volume name** | Card Design System (`FI-DSN-VOL-001`) | Production volume identity and Required category framework — unchanged |
| **Constitutional volume purpose** | Surface Implementation (this document) | Product-independent durable purpose — how design language is structurally instantiated on governed physical product surfaces |
| **Primary Classification (current card-system standards)** | `CLS-CAR` — Card Architecture (`FI-DSN-CLS-001` §7) | Greeting card product structure only — not broadened by constitutional volume purpose |

Volume number, Primary Volume assignment, and frozen roadmap categories remain unchanged. Product-independent constitutional purpose and card-scoped `CLS-CAR` coexist per accepted Option B posture. See `OQ-V03-001` and `OQ-V03-003`.

**Source basis:** Company judgment. This architecture is an F.I. Forgot governance choice. It is not derived from vendor facts, verified evidence, or Brain runtime behavior.

---

## 1. Purpose

This document is the **permanent Volume Governance architecture** for F.I. Forgot Volume 03 — Surface Implementation.

Its purpose is to define:

- The permanent constitutional role of Surface Implementation within the Design Library
- What authorities exist within Volume 03 and what they do not own
- How future surface standards are assigned to architectural domains and classifications
- How Volume 03 inherits upstream design authority and evaluates surface decisions
- How Volume 03 relates to peer volumes and frozen governance artifacts

This document is **not** a template specification, layout standard, safe-area measurement guide, manufacturing standard, artwork selection policy, collection governance document, metadata schema, engineering specification, or Brain implementation document. Those belong to future standards or systems governed by this architecture.

Product families may expand. Manufacturing vendors may change. Rendering technology may be replaced. Brain capabilities may grow. This architecture SHALL remain stable across those changes.

---

## 2. Scope

### 2.1 In scope

- Volume 03 constitutional purpose and library placement
- Two-domain purpose architecture and domain dependency model
- Volume 03 authority ownership and non-ownership
- Constitutional inheritance from frozen Volume 02 architecture and standards
- Stacked decision architecture for future Volume 03 standards
- Principal-subject placement rules for future standards
- Cross-volume boundary architecture with Volumes 01, 02, 04, and 05
- Surface lifecycle architectural ownership across the Design Library
- Structure versus spatial allocation authority definition
- Future architectural domain inventory (no Standard IDs)
- Future expansion posture for product families beyond the current greeting card system
- Volume Supplement authorization within Volume 03 scope per `FI-DSN-VOL-001` Section 20
- Alignment with `FI-DSN-VOL-001` Volume 03 required category framework

### 2.2 Out of scope

- Normative surface requirements (`{Standard ID}-R{nn}` text)
- Template dimensions, coordinate values, bleed measurements, safe-area pixels, or region sizes
- Rendering, editor behavior, runtime layout, CSS, responsive logic, or software module structure
- Artwork selection policy, occasion semantics, personalization policy, and Brain Visual Selection boundaries (Volume 04)
- Collection governance, asset library operations, and release criteria (Volume 05)
- Manufacturing feasibility, fulfillment, and production method policy (`FI-MFG-*`, Volume 01)
- Relational composition philosophy independent of governed surfaces (Volume 02 Layer 4)
- Visual element character, brand identity rules, and global exclusions (Volume 02)
- Message wording, tone generation, and Writing Engine behavior (`FI-DSN-GOV-004` Section 12)
- Brain algorithms, prompts, and runtime selection logic (`FI-DSN-GOV-004`)
- Metadata field semantics (`FI-DSN-GOV-002`)
- Classification code definitions (`FI-DSN-CLS-001`)
- Identifier reservation and register population (`FI-DSN-REG-001`)
- Drafting admission and execution order (`FI-DSN-QUE-001`)

---

## 3. Document Relationship

Volume 03 sits in the F.I. Forgot Design Library stack:

```
Planning Foundation (GOV, REG, QUE, VOL-001, CLS-001, …)
        ↓
Volume 01 — Manufacturing constraints (FI-MFG-*)
        ↓
Volume 02 — Visual Design Architecture
        ↓         frozen Volume 02 FI-DSN-* standards
Volume 03 — Surface Implementation Architecture (this document)
        ↓         future Volume 03 FI-DSN-* standards
Volume 04 — Artwork Intelligence
        ↓
Volume 05 — Signature Collections
        ↓
Engineering / Product Implementation
```

This diagram is **conceptual**. It shows durable authority direction, not a mandatory drafting sequence. Volume 03 planning MAY proceed only when upstream Volume 02 dependencies required for the standard under draft are satisfied per `FI-DSN-VOL-001` Section 16.2 and `FI-DSN-QUE-001`.

| Layer | Role relative to this document |
|-------|------------------------------|
| **Planning Foundation** | Supplies frozen meta-governance that enables volume planning |
| **Volume 01** | Supplies applicable manufacturing Compliance Boundaries consumed by Volume 03 |
| **Volume 02** | Supplies visual permission, relational discipline, and visual boundaries consumed by Volume 03 |
| **Volume 03** | Defines surface implementation architecture; hosts future surface standards |
| **Volumes 04–05** | Consume Volume 03 surface structure and spatial boundaries |
| **Engineering / Product** | Implement governed surface rules; do not redefine library architecture |

**Permanent principle:**

> **Volume 02 defines what F.I. Forgot visuals are allowed to be. Volume 03 defines how those visuals are structurally organized on governed product surfaces. Volume 04 defines which permitted visuals apply in a given context.**

---

## 4. Authority

### 4.1 What this document owns

| Authority domain | Scope |
|------------------|-------|
| **Constitutional purpose** | Permanent role of Surface Implementation within the Design Library |
| **Two-domain architecture** | Surface System Structure and Surface Spatial Allocation domains, dependency, and justifications |
| **Standard placement** | Rules for assigning future standards to domains and classifications |
| **Inheritance architecture** | How Volume 03 consumes upstream Volume 02 and manufacturing authority |
| **Decision architecture** | Stacked evaluation procedure, conflict resolution, and downstream delegation model |
| **Volume 03 scope architecture** | Declared in-scope and out-of-scope boundaries for the surface implementation domain |
| **Cross-volume boundary architecture** | How Volume 03 relates to Volumes 01, 02, 04, and 05 at the planning layer |
| **Surface lifecycle architecture** | Which volume owns each lifecycle stage of surface-bound design authority |
| **Structure versus spatial authority** | Independent domain split within Volume 03 |
| **Future expansion posture** | How product-family growth is accommodated without silent classification broadening |
| **Volume Supplement authorization** | Permitted supplements within Volume 03 per `FI-DSN-VOL-001` Section 20 |

### 4.2 What this document does not own

| Domain | Authoritative owner |
|--------|---------------------|
| Metadata field semantics | `FI-DSN-GOV-002` |
| Identifier allocation | `FI-DSN-ID-001` + `FI-DSN-REG-001` |
| Primary / Secondary Classification definitions | `FI-DSN-CLS-001` |
| Artifact lifecycle and freeze law | `FI-DSN-GOV-001` |
| Epistemic governance | `FI-DSN-GOV-003` |
| Brain authority boundaries | `FI-DSN-GOV-004` |
| Production normative requirements | Individual frozen `FI-DSN-*` / `FI-MFG-*` standards |
| Drafting authorization | `FI-DSN-QUE-001` |
| Planning inventory truth | `FI-DSN-REG-001` |
| Volume numbering and Primary Volume rules | `FI-DSN-VOL-001` |
| Research verification | Research Library |
| Visual permission and relational composition | Frozen Volume 02 Visual Design Architecture and frozen Volume 02 standards |

### 4.3 Document class and identifier posture

This document is a **Volume Governance** document per `FI-DSN-GOV-001` Section 5. Its canonical identity is its repository path and Volume 03 assignment.

The sprint working label `FI-DSN-V03-001` is **not** an authorized identifier namespace under frozen `FI-DSN-ID-001`. Future Volume 03 standards SHALL use authorized `FI-DSN-{PRN|STD|CON|POL|SYS}-###` identifiers assigned through `FI-DSN-REG-001`.

**Classification code authority:** Canonical `CLS-*` codes are defined exclusively by `FI-DSN-CLS-001`. Where informational affinity tables in `FI-DSN-VOL-001` or other frozen artifacts use non-canonical codes — for example `CLS-CDA` in `FI-DSN-VOL-001` Section 11.3 — `FI-DSN-CLS-001` governs. Volume 03 architecture references `CLS-CAR` for card system structure.

---

## 5. Architectural Principles

Future Volume 03 consumers and standard authors SHALL treat the following as permanent architectural law.

| ID | Principle | Requirement |
|----|-----------|-------------|
| **P1** | **Structure before placement** | Surface system structure MUST be architecturally established before surface spatial allocation |
| **P2** | **Instantiation separated from permission** | Volume 03 governs how permitted visuals occupy governed surfaces; it MUST NOT redefine what visuals are permitted |
| **P3** | **Structure separated from selection** | Surface architecture MUST NOT embed artwork selection, occasion treatment, personalization policy, or Brain recommendation policy |
| **P4** | **Surfaces separated from libraries** | Surface governance MUST NOT govern collection membership, release, retirement, or asset library operations |
| **P5** | **Manufacturing constrains; Volume 03 integrates** | Applicable `FI-MFG-*` obligations are Compliance Boundary inputs; manufacturing operational policy MUST NOT be restated in Volume 03 |
| **P6** | **Brain bounded by structure** | Volume 03 supplies structural Compliance Boundary inputs for surface systems; Brain runtime behavior and Preference Surface authorization remain outside Volume 03 principal authority unless a future standard's principal subject is otherwise assigned by `FI-DSN-CLS-001` |
| **P7** | **Classification independent of architecture** | `CLS-*` subject classification is assigned per `FI-DSN-CLS-001`; architectural domains organize planning home and do not override classification codes |
| **P8** | **Implementation independence** | Volume 03 MUST remain valid across rendering technology, editor platforms, vendors, media, and product families without structural redesign |
| **P9** | **Product abstraction; classification precision** | Volume 03 constitutional purpose MAY be stated in product-independent terms; Primary Classification MUST preserve frozen `CLS-*` scope without silent broadening |
| **P10** | **Minimal stable domains** | New surface concerns MUST map into Domain 1 or Domain 2 unless governed `FI-DSN-VOL-001` or `FI-DSN-CLS-001` revision authorizes architectural expansion |

Principles P1–P6 govern permanent authority separation. P7–P10 govern classification discipline, durability, and domain stability. None prescribe measurements, coordinates, rendering behavior, or template file formats.

---

## 6. Two-Domain Architecture

Volume 03 is organized into **two architectural domains**. Domains are ordered by design dependency. They are not drafting phases, queue states, or classification codes.

```
Domain 1 — Surface System Structure
        ↓
Domain 2 — Surface Spatial Allocation
```

### 6.1 Domain 1 — Surface System Structure

| Field | Value |
|-------|-------|
| **Purpose** | Govern the existence, topology, organization, and structural obligations of governed product surface systems |
| **Governing question** | What governed surfaces exist, how are they organized as a system, and what structural topology and handoff obligations does the system impose? |
| **Typical classifications** | `CLS-CAR` when structural or system architecture of the greeting card product is principal |
| **Owns** | Surface system topology; template and system structure; structural regions as system architecture — existence, identity, and organizational relationships of regions within the surface system; production-structure relationships; structural card-template metadata schema where schema architecture is principal; asset and structural handoff boundary obligations |
| **Does not own** | Spatial allocation within regions; safe-area rules; spatial-boundary rules; bleed integration; positional relationships among regions; envelope and exterior presentation policy where `CLS-EEP` is principal; element character; relational composition philosophy; contextual selection; manufacturing operational policy; engineering implementation |

### 6.2 Domain 2 — Surface Spatial Allocation

| Field | Value |
|-------|-------|
| **Purpose** | Govern how governed visual content is spatially allocated within an established surface structure |
| **Governing question** | Within a governed surface structure, how may visual content occupy regions, relate spatially, and respect surface-bound placement discipline? |
| **Typical classifications** | `CLS-CMP` when surface-bound spatial placement within governed card or presentation surfaces is principal |
| **Owns** | Region relationships within structure; placement discipline; **safe-area rules**; spatial-boundary rules as design authority; bleed integration at the design-standard level; surface-bound layout-boundary rules; positional allocation among established structural regions |
| **Does not own** | Surface system topology; existence or identity of structural regions as system architecture; relational composition philosophy independent of a specific surface; element character; selection policy; collection operations; manufacturing operational policy; engineering coordinate systems or runtime layout |

**Architectural definition:**

> **Surface System Structure governs what governed surfaces exist and how they are organized. Surface Spatial Allocation governs how permitted visual content occupies those surfaces once structure is established.**

Domain 1 is a **defining Volume 03 authority**. It MUST NOT be absorbed into Volume 02 composition, Volume 04 selection, or engineering template implementation.

### 6.3 Classifications outside the two-domain model

`CLS-EEP` and `CLS-MFI` are frozen classifications that MAY host Volume 03 standards when their principal subjects are envelope and exterior presentation or design-side manufacturing integration, respectively. They are **classification placements**, not additional constitutional domains within this architecture.

### 6.4 Structural versus spatial constraint boundary

System-level structural architecture and spatial implementation discipline are constitutionally distinct:

| Constraint type | Domain | Governs | Does not govern |
|-----------------|--------|---------|-----------------|
| **System-level structural** | Domain 1 | That a governed surface, structural region, or template variant **exists** within the surface system; how surfaces relate as system topology; production-structure relationships; structural handoff obligations | How content occupies regions; minimum clearances; safe areas; bleed; positional relationships among regions |
| **Spatial implementation** | Domain 2 | How permitted content **occupies** established structural regions; region positional relationships; safe-area rules; spatial-boundary rules; bleed integration; placement discipline within structure | Whether a surface or region exists; surface system topology; structural handoff schema architecture |

**Safe areas are exclusively a Domain 2 concern.** A safe area governs spatial implementation within an established structure — minimum clearance, protected zones, and production-feasibility spatial boundaries. Safe areas MUST NOT be classified under Domain 1 regardless of whether manufacturing constraints inform the rule.

The `FI-DSN-VOL-001` Section 19.4 category **Safe area and structural constraints** names both concerns in one Required category. Within this architecture, **structural** facets of that category belong to Domain 1 only when system topology or production-structure relationships are principal; **safe-area** facets belong exclusively to Domain 2.

---

## 7. Domain Dependency Model

### 7.1 Positive design dependency

| Order | Domain | Depends on |
|-------|--------|------------|
| 1 | Surface System Structure | Volume 02 visual permission, relational discipline, and Layer 5 boundaries; applicable `FI-MFG-*` Compliance Boundaries |
| 2 | Surface Spatial Allocation | Domain 1; full Volume 02 inheritance chain |

Surface structure defines the governed framework within which spatial allocation operates. Spatial rules presuppose an established surface system.

### 7.2 Authority precedence within Volume 03

When conflict occurs within Volume 03 evaluation:

1. **Upstream Layer 5 and frozen Volume 02 boundaries** override surface structure preference and spatial allocation preference.
2. **Domain 1 structural obligations** constrain Domain 2 spatial decisions. Spatial allocation MUST NOT contradict established surface system structure.
3. **Manufacturing Compliance Boundary inputs** constrain both domains. A structurally or spatially permitted treatment that violates applicable `FI-MFG-*` obligations is unsuccessful.

### 7.3 Rejected orderings

| Proposed ordering | Rejection rationale |
|-------------------|---------------------|
| Spatial allocation before structure | Placement requires a governed surface system to be meaningful |
| Structure merged into Volume 02 composition | Volume 02 P8 assigns surface layout to Volume 03; structure is surface-bound, not domain-agnostic |
| Safe areas as independent domain | Safe areas are spatial-boundary rules within Domain 2; no separate constitutional question |
| Manufacturing Integration as independent domain | Integration cited by surface standards retains surface primary classification unless `CLS-MFI` is principal per `FI-DSN-CLS-001` Section 10 |
| Metadata handoff as independent domain | Handoff obligations are structural-system concerns within Domain 1; `FI-DSN-GOV-002` owns metadata schema semantics |

---

## 8. Domain Justifications

Each domain MUST remain independently justified. Domains SHALL NOT be merged for convenience alone.

| Domain | Problem solved | Why it cannot merge |
|--------|----------------|---------------------|
| **1 — Surface System Structure** | Eliminates authority vacuum between Volume 02 permission and surface-bound placement | Cannot merge into Volume 02 — surface topology requires product-surface knowledge Volume 02 explicitly excludes. Cannot merge into Domain 2 — structure exists before placement |
| **2 — Surface Spatial Allocation** | Bridges relational composition philosophy and physical surface instantiation | Cannot merge into Volume 02 Layer 4 — relational discipline is surface-independent per frozen Volume 02 §12. Cannot merge into Domain 1 — removal test from `FI-DSN-CLS-001` Section 10 separates structure from placement |

### 8.1 Required category facets

`FI-DSN-VOL-001` Section 19.4 Required categories for Volume 03 are satisfied as **facets** within these two domains and applicable `CLS-*` placements — not as separate constitutional authorities:

| VOL-001 required category | Architectural home |
|---------------------------|-------------------|
| Card architecture | Domain 1 |
| Template governance | Domain 1 |
| Layout and composition | Domain 2 |
| Safe area and structural constraints | Domain 2 for safe-area and spatial-boundary facets; Domain 1 only when system topology or production-structure relationships are the principal subject — see Section 6.4 |
| Front, inside, back, and envelope relationship rules | Domain 1 when structural relationships are principal; `CLS-EEP` when exterior presentation is principal |
| Manufacturing integration | Compliance Boundary inheritance in Domain 1 or Domain 2 standards; `CLS-MFI` only when integration is principal |
| Required metadata or asset handoff boundaries | Domain 1 — handoff obligations only; does not redefine `FI-DSN-GOV-002` field semantics |

This document does not add categories to `FI-DSN-VOL-001`.

---

## 9. Constitutional Inheritance

### 9.1 Inherited governing authorities

| Source | What Volume 03 inherits | How inheritance functions |
|--------|---------------------------|---------------------------|
| **Frozen Volume 02 Visual Design Architecture** | P1–P11; five-layer model; Volume 02/03 decision rules; asset and surface lifecycle boundaries; `CLS-CMP` split law | Constitutional law — Volume 03 MUST remain reconcilable and MUST NOT contradict |
| **`FI-DSN-PRN-001` — Visual Philosophy** | Emotional and aesthetic posture commitments | Reconcilability gate |
| **`FI-DSN-STD-001` — Brand Expression** | Identity-bound presentation discipline | Reconcilability gate |
| **`FI-DSN-STD-002` — Typography** | Typographic element character and usage boundaries | Reconcilability gate — Volume 03 allocates typographic elements on surfaces; does not redefine type character |
| **`FI-DSN-STD-003` — Composition** | Relational hierarchy, balance, and prominence discipline | Reconcilability gate — Volume 03 implements relational principles within surface bounds; does not restate relational philosophy |
| **Volume 02 Layer 5** | Exclusions, accessibility foundations, visual quality foundations | **Precedence override** — Layer 5 wins over surface structure and spatial preference |
| **Applicable `FI-MFG-*` standards** | Manufacturing production constraints relevant to surface scope | Compliance Boundary inputs — cited, not restated |
| **`FI-DSN-GOV-001` through `FI-DSN-GOV-004`** | Artifact lifecycle, metadata semantics, epistemic discipline, Brain boundary model | Meta-governance — Volume 03 standards and supplements follow frozen library law |
| **`FI-DSN-CLS-001`** | Classification taxonomy and boundary rules | Primary Classification assigned per frozen law |
| **`FI-DSN-VOL-001`** | Required category framework, principal-subject law, volume completion rules | Volume 03 standards satisfy Required categories as domain facets |

### 9.2 Inheritance mechanisms

**Compliance Boundary consumption.** Applicable upstream obligations form part of the surface Compliance Boundary. Volume 03 standards MAY narrow alternatives within that boundary. They MUST NOT expand beyond it.

**Reconcilability evaluation.** Before a surface decision succeeds, it MUST pass upstream reconcilability with frozen Volume 02 standards in dependency order: Visual Philosophy → Brand Expression → Typography → Composition (relational).

**Volume 02 Message Primacy (P11).** Frozen Volume 02 Visual Design Architecture P11 — Message Primacy — is inherited constitutional law. Volume 03 does **not** restate P11 as a Volume 03 principle. Message primacy is evaluated through Gate 1 inherited Volume 02 architectural law and through Gate 3 reconcilability with frozen `FI-DSN-STD-003` Composition, which operationalizes relational prominence discipline including message-vs-visual relationships at principle level.

**Non-redefinition.** Volume 03 MUST NOT weaken, replace, or silently override upstream authority. Surface standards translate upstream permission into surface-bound structure and allocation.

### 9.3 What Volume 03 does not inherit

Volume 03 does not inherit authority to define classification codes, metadata schema semantics, Brain runtime behavior, manufacturing operational policy, contextual selection policy, or collection library operations. Those remain with their frozen authoritative owners.

---

## 10. Decision Architecture

### 10.1 Stacked evaluation procedure

Future Volume 03 standards SHALL evaluate surface decisions through a **stacked gate procedure**. Gates are sequential. Failure at any gate renders the decision unsuccessful regardless of outcomes at later gates.

| Gate | Order | Evaluation discipline |
|------|-------|----------------------|
| **1 — Constitutional** | First | Compliance with Volume 03 P1–P10; compliance with frozen Volume 02 Visual Design Architecture P1–P11; no contradiction with inherited Volume 02 architectural law or Volume 03 purpose architecture |
| **2 — Layer 5 / upstream boundary** | Second | Compliance with Volume 02 Layer 5 exclusions, accessibility foundations, and visual quality foundations where implicated |
| **3 — Upstream reconcilability** | Third | Apply frozen `FI-DSN-PRN-001`, then `FI-DSN-STD-001`, then `FI-DSN-STD-002`, then `FI-DSN-STD-003` (relational); upstream standards MUST NOT be redefined |
| **4 — Manufacturing Compliance Boundary** | Fourth | Applicable `FI-MFG-*` obligations satisfied; manufacturing policy MUST NOT be restated |
| **5 — Domain appropriateness** | Fifth | Decision belongs to the correct Volume 03 domain and correct `CLS-*` classification |
| **6 — Volume 03 scope** | Sixth | Decision does not govern element character, relational composition philosophy, selection policy, collection operations, Brain behavior, manufacturing operational policy, or implementation |

A treatment that passes domain appropriateness but fails upstream reconcilability is unsuccessful. A treatment that passes upstream reconcilability but violates Volume 03 scope is unsuccessful.

### 10.2 Conflict resolution

| Conflict type | Resolution |
|---------------|------------|
| Surface preference vs Layer 5 prohibition | Layer 5 wins |
| Spatial allocation vs relational composition philosophy | Volume 02 relational principles constrain; Volume 03 implements within surface bounds; irreconcilable conflict resolves to upstream Volume 02 authority |
| Domain 1 vs Domain 2 | Apply `FI-DSN-CLS-001` Section 10 removal test; principal normative subject per `FI-DSN-VOL-001` Section 14.1 governs |
| Volume 03 vs Volume 04 | Principal subject determines ownership — which asset applies in context is Volume 04; how assets occupy surface regions is Volume 03 |
| Design alternative vs manufacturing requirement | Manufacturing requirement remains in Compliance Boundary; conflicting design alternative MUST be removed, restricted, or revised per `FI-DSN-GOV-004` Section 13 |
| Runtime or customer request vs Compliance Boundary | Compliance Boundary wins; boundary change requires governed standard revision |

### 10.3 Inheritance precedence summary

```
Governance / frozen standards
        ↓
Volume 02 Layer 5 visual boundaries
        ↓
Frozen Volume 02 standards (philosophy → brand → elements → composition)
        ↓
Manufacturing Compliance Boundary inputs (FI-MFG-*)
        ↓
Domain 1 — Surface System Structure
        ↓
Domain 2 — Surface Spatial Allocation
        ↓
Volume 04 selection / Preference Surfaces (downstream)
        ↓
Engineering implementation (non-governing)
```

### 10.4 Reconciliation procedure

When a proposed surface treatment fails stacked evaluation:

1. **Classify the failure** — identify which gate failed and which upstream authority imposes the constraint.
2. **Record downstream impact** — identify affected Volume 03, Volume 04, or engineering artifacts.
3. **Do not amend upstream silently** — if reconciliation requires changing a frozen upstream standard, governed revision is required.
4. **Apply principal-subject reclassification** — if failure indicates wrong domain or volume, reassign per Section 15 before redrafting.
5. **Document Compliance Boundary inheritance** — record which upstream obligations enclose the surface decision.

### 10.5 Downstream delegation

Volume 03 defines design-side constitutional authority. It delegates to:

| Downstream | What it receives |
|------------|------------------|
| **Volume 04** | Governed surface systems and spatial boundaries within which selection operates |
| **Volume 05** | Structural and spatial rules governing how collection assets may occupy surfaces once selected |
| **Engineering** | Governed design requirements to implement — not direct implementation prescriptions |
| **Brain Runtime** | Structural Compliance Boundary inputs — not Preference Surface authorization |

Volume 03 states what surface structure and allocation **must remain true**. Engineering determines **how** that truth is realized in software and production systems.

---

## 11. Authority Boundaries

### 11.1 Peer volume boundaries

| Peer | Volume 03 relationship | Prohibited leakage |
|------|--------------------------|-------------------|
| **Volume 01 — Manufacturing** | Consumes applicable `FI-MFG-*` as Compliance Boundary inputs per `FI-DSN-GOV-004` Section 13 | Restating manufacturing operational policy in surface architecture or standards |
| **Volume 02 — Design Language** | Upstream authority consumed through inheritance and reconcilability | Redefining element character, brand identity, relational composition philosophy, or global exclusions |
| **Volume 04 — Artwork Intelligence** | Downstream consumer of Volume 03 surface structure and spatial boundaries | Selection logic, occasion semantics, personalization policy, or Preference Surface authorization in Volume 03 |
| **Volume 05 — Signature Collections** | Downstream consumer of surface rules for asset placement | Collection membership, release, retirement, or library operations in Volume 03 |

#### Worked ownership example — structure versus selection

| Scenario | Principal subject | Owner |
|----------|-------------------|-------|
| Governed template defines front, inside, and back as structural surfaces | Surface system topology | Volume 03 — Domain 1 |
| Safe area preserves handwriting legibility within inside panel structure | Surface-bound spatial boundary | Volume 03 — Domain 2 |
| Brain may recommend among three permitted hero image treatments for a birthday occasion | Contextual selection and override boundary | Volume 04 — `CLS-BVS` |
| Illustration is excluded from premium collection regardless of surface | Collection governance | Volume 05 — `CLS-ASG` |
| Message should dominate inside panel visually as relational discipline | Relational prominence philosophy | Volume 02 — Layer 4 |

### 11.2 Cross-system boundaries

| System | Volume 03 relationship | Prohibited leakage |
|--------|--------------------------|-------------------|
| **Brain Architecture** | Message intent authority; outside Volume 03 | Message wording, tone generation, or Writing Engine behavior |
| **Brain Runtime** | Operates within Compliance Boundaries Volume 03 helps define structurally | Algorithms, prompts, scoring, routing |
| **Engineering** | Downstream implementation of governed surface authority | Constitutional design law, classification codes, or governance metadata |
| **Research Library** | May inform drafting per `FI-DSN-GOV-003` | Verified facts do not automatically become surface requirements |

### 11.3 Volume 02 versus Volume 03 — decision rule

| Test | Owner |
|------|-------|
| Remains true when the product surface, template, and coordinates are removed | Volume 02 — typically Layer 4 or Layer 5 |
| Requires a specific governed surface or template to be meaningful | Volume 03 |
| Governs what surfaces exist and how the surface system is organized | Volume 03 — Domain 1 |
| Governs how content is allocated within an established surface structure | Volume 03 — Domain 2 |
| Governs permitted relationships among visual elements independent of any specific surface | Volume 02 — Layer 4 |

#### Illustrative boundary examples (non-normative)

| Scenario | Principal subject | Owner |
|----------|-------------------|-------|
| Message should dominate inside panel visually | Relational prominence philosophy | Volume 02 — Layer 4 |
| Governed template defines a hero image slot as a structural region | Structural region existence within the surface system | Volume 03 — Domain 1 |
| Hero image slot sits above message region in a governed template | Positional allocation among established structural regions | Volume 03 — Domain 2 |
| Premium inside template uses full-bleed art as a structural variant | Template structural variant | Volume 03 — Domain 1 |
| Minimum clear space around handwriting for production feasibility | Safe-area spatial boundary citing manufacturing | Volume 03 — Domain 2 |
| Whitespace should feel generous and calm | Composition principle | Volume 02 — Layer 4 |
| User-uploaded photos must not overpower message | Composition and exclusion principles | Volume 02 — Layers 4 and 5 |

### 11.4 Volume 03 versus Volume 04 — decision rule

| Test | Owner |
|------|-------|
| Governs which permitted visual treatment applies in a given context | Volume 04 |
| Governs structural slots or regions that selection may populate | Volume 03 — Domain 1 |
| Governs spatial boundaries limiting where selected content may be placed | Volume 03 — Domain 2 |
| Governs Brain-permitted alternatives or customer override boundaries | Volume 04 — `CLS-BVS` |

Preference Surfaces authored in Volume 04 MUST remain enclosed within Compliance Boundaries that include Volume 03 structural and spatial limits per `FI-DSN-GOV-004` Section 7.

### 11.5 Volume 03 versus Engineering — decision rule

| Test | Owner |
|------|-------|
| States permanent design authority for surface structure or allocation | Volume 03 |
| Specifies rendering technology, editor UX, coordinate systems, file formats, or runtime algorithms | Engineering |
| Translates governed design requirements into buildable specifications | Engineering — downstream of Volume 03 standards |

---

## 12. Volume Relationships

### 12.1 Upstream — Volume 01

Volume 03 SHALL identify applicable `FI-MFG-*` manufacturing constraints for surface scope and treat them as Compliance Boundary inputs. Volume 03 MUST NOT duplicate `FI-MFG-*` normative bodies.

### 12.2 Upstream — Volume 02

Volume 03 consumes frozen Volume 02 element systems, composition principles, and visual boundaries when governing surface system structure and surface spatial allocation. Volume 03 MUST remain reconcilable with frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`, `FI-DSN-STD-002`, and `FI-DSN-STD-003`.

### 12.3 Downstream — Volume 04

Volume 04 consumes Volume 03 surface structure and spatial boundaries when governing artwork selection, occasion treatment, personalization, and Brain Visual Selection policy.

### 12.4 Downstream — Volume 05

Volume 05 consumes Volume 03 surface rules when governing how collection assets may occupy governed product surfaces.

### 12.5 Alignment with `FI-DSN-VOL-001`

#### Volume 03 required categories

`FI-DSN-VOL-001` Section 19.4 Required categories for Volume 03 are mapped to architectural domains in **Section 8.1**, with structural versus spatial constraint boundaries defined in **Section 6.4**. This document does not add categories to `FI-DSN-VOL-001`.

#### Volume 02 Composition Principles versus Volume 03 surface layout

Frozen Volume 02 Visual Design Architecture Section 10.5 assigns relational composition to Volume 02 and surface layout to Volume 03. This architecture preserves that split:

| Subject | Primary Volume | Architectural home |
|---------|----------------|-------------------|
| Relational composition — hierarchy, balance, prominence, density, cropping philosophy, message-vs-visual discipline independent of any specific surface | **02** | Layer 4 — Composition Principles |
| Surface layout — template regions, coordinates, safe areas, bleed integration, surface-bound spatial organization | **03** | Domain 2 — Surface Spatial Allocation |
| Surface system structure — topology, template system organization, production-structure relationships | **03** | Domain 1 — Surface System Structure |

Volume 03 standards **consume** Volume 02 Composition Principles. Volume 03 MUST NOT author domain-agnostic relational composition rules. Volume 03 **Structurally Complete** posture remains governed by `FI-DSN-VOL-001` Section 19.4 and Section 18.5; this document does not declare Volume 03 completion.

---

## 13. Surface Lifecycle Ownership

Surface-bound design authority is governed by **lifecycle stage**, not by product implementation technology alone.

| Lifecycle stage | Architectural owner | Governs |
|-----------------|---------------------|---------|
| **Visual permission** | Volume 02 | What visual treatments may exist |
| **Surface system structure** | Volume 03 — Domain 1 | What governed surfaces exist and how they are organized |
| **Surface spatial allocation** | Volume 03 — Domain 2 | How permitted content occupies governed surfaces |
| **Contextual selection** | Volume 04 | Which permitted treatment applies in a given context |
| **Library operations** | Volume 05 | Collection membership, release, retirement, and consistency |
| **Implementation** | Engineering | How governed surface authority is rendered, edited, and produced |

**Permanent rule:**

> **Volume 02 governs what assets may be. Volume 03 governs where assets sit. Volume 04 governs which assets apply when. Volume 05 governs how asset libraries run.**

Future product families, template technologies, and rendering platforms map into this lifecycle without architectural revision.

### 13.1 Harmonization with `CLS-CAR` — Card Architecture

`FI-DSN-CLS-001` defines `CLS-CAR` as owning structural architecture of the greeting card product at the classification level. This architecture **consumes** that definition without redefining or broadening it:

| Authority type | Principal subject | Architectural owner |
|----------------|-------------------|---------------------|
| **Greeting card system structure** | Templates, regions as system topology, structural metadata schema, production structure, card surfaces, system-level card organization | Volume 03 — Domain 1 under `CLS-CAR` |
| **Product-independent surface purpose** | Constitutional volume framing for governed physical surface instantiation | This Volume Governance document — not a substitute for `CLS-CAR` scope |

When structural card-system architecture is principal, Primary Classification is `CLS-CAR` per `FI-DSN-CLS-001` Section 7. Volume 03 constitutional purpose MAY be stated in product-independent terms without silently expanding `CLS-CAR` beyond the greeting card product.

---

## 14. Structure versus Spatial Authority

### 14.1 Why structure is independent

Surface organization is a **system** property. It defines what governed surfaces exist and how they relate before any placement decision is made.

| Authority | Why it cannot fully own surface system structure |
|-----------|--------------------------------------------------|
| Volume 02 Layer 4 — Composition | Owns relational discipline independent of any specific surface |
| Volume 02 Layer 3 — Elements | Own element character, not product surface topology |
| Domain 2 — Spatial Allocation | Owns placement within structure, not system topology |
| Volume 04 — Selection | Owns which permitted treatment applies, not surface system architecture |
| Engineering | Owns implementation, not library-wide surface constitutional law |

### 14.2 Structure versus spatial allocation

| Subject | Primary domain | Typical classification |
|---------|----------------|------------------------|
| **Surface System Structure** | Domain 1 | `CLS-CAR` when structural |
| **Surface Spatial Allocation** | Domain 2 | `CLS-CMP` when surface-bound |

#### Illustrative domain split — hero image slot (non-normative)

Frozen Volume 02 Visual Design Architecture assigns a hero image slot above a message region to Volume 03 as template structure. Within this architecture, that example decomposes by principal subject:

| Principal subject | Domain | Rationale |
|-------------------|--------|-----------|
| A hero image **slot exists** as a named structural region within the governed template | Domain 1 | System architecture — region existence and identity |
| The hero image slot **sits above** the message region | Domain 2 | Spatial allocation — positional relationship among established regions |

Structural existence precedes positional allocation. Both subjects belong to Volume 03 but MUST NOT be combined in one standard without governed split per `FI-DSN-VOL-001` Section 14.1.

### 14.3 Harmonization with `CLS-CAR` and `CLS-CMP`

This architecture preserves the two-domain split and harmonizes with frozen `FI-DSN-CLS-001` Section 7 and Section 10 as follows:

| Principal subject | Primary Volume | Domain / classification |
|-------------------|----------------|-------------------------|
| Structural architecture of the greeting card product — templates, regions as system topology, structural metadata schema, production structure, card surfaces, system organization | **03** | Domain 1 — `CLS-CAR` |
| Spatial organization, region relationships, and placement discipline within governed card or presentation surfaces | **03** | Domain 2 — `CLS-CMP` surface-bound |
| Relational discipline among visual elements without binding to a specific template or surface | **02** | Layer 4 — `CLS-CMP` relational |

A single future standard MUST NOT combine Domain 1 and Domain 2 subjects without governed split per `FI-DSN-VOL-001` Section 14.1. This document does not redefine `CLS-CAR` or `CLS-CMP`; it assigns architectural placement for standards classified under existing codes.

### 14.4 Harmonization with `CLS-EEP` and `CLS-MFI`

| Classification | When principal | Volume 03 relationship |
|----------------|----------------|------------------------|
| `CLS-EEP` | Envelope, exterior, or outward-facing presentation boundaries outside card structure and card-surface domains owned by Card Architecture | MAY host a Volume 03 standard; not part of Domain 1 or Domain 2 |
| `CLS-MFI` | Design-side integration with manufacturing feasibility, production handoff, or manufacturability governance | MAY host a Volume 03 standard when integration is principal; otherwise surface standards citing `FI-MFG-*` retain `CLS-CAR` or `CLS-CMP` as primary |

---

## 15. Standard Placement Guidance

### 15.1 Placement procedure

1. State the principal governed subject in one sentence per `FI-DSN-CLS-001` Section 16.
2. Apply the `FI-DSN-CLS-001` Section 10 removal test for `CLS-CAR` versus `CLS-CMP` boundary.
3. Assign **Primary Classification** per `FI-DSN-CLS-001` — narrowest classification that fully owns the principal subject.
4. Map the subject to **Domain 1 or Domain 2** when Volume 03 owns the principal subject.
5. Assign **Primary Volume 03** only when Volume 03 owns the principal subject.
6. Record cross-volume dependencies in `FI-DSN-REG-001` **Dependencies**; dependencies do not transfer ownership.
7. Record **Primary Volume** in REG **Notes** per `FI-DSN-VOL-001` Section 14.2 until `OQ-DSN-008` resolves.

### 15.2 Principal-subject placement tests

#### `CLS-CAR` — Card Architecture

| Step | Question | If yes → |
|------|----------|----------|
| 1 | Is structural or system surface architecture of the greeting card product the principal subject? | Candidate `CLS-CAR` / Domain 1 |
| 2 | Would removing spatial placement rules leave a structural or system standard? | Confirms `CLS-CAR` over `CLS-CMP` |
| 3 | Is envelope or exterior presentation the principal subject? | `CLS-EEP` |
| 4 | Is manufacturing integration the principal subject? | `CLS-MFI` |
| 5 | Is relational composition without surface binding the principal subject? | Volume 02 Layer 4 |

#### `CLS-CMP` — Composition and Layout (surface-bound)

| Step | Question | If yes → |
|------|----------|----------|
| 1 | Is spatial placement within a governed surface the principal subject? | Candidate `CLS-CMP` surface-bound / Domain 2 |
| 2 | Would removing structural or system rules leave only placement discipline? | Confirms `CLS-CMP` over `CLS-CAR` |
| 3 | Is relational discipline independent of any specific surface? | Volume 02 Layer 4 — `CLS-CMP` relational |
| 4 | Is surface system topology the principal subject? | `CLS-CAR` / Domain 1 |

When steps conflict, **principal normative subject** per `FI-DSN-VOL-001` Section 14.1 governs.

### 15.3 Prohibited placements

| Prohibited action | Rationale |
|-------------------|-----------|
| Placing relational composition philosophy in Volume 03 | Volume 02 Layer 4 owns domain-agnostic relational discipline |
| Placing selection logic in Volume 03 | Volume 04 owns contextual selection |
| Placing collection operations in Volume 03 | Volume 05 owns library governance |
| Creating local `CLS-*` codes via this architecture | `FI-DSN-CLS-001` owns classification taxonomy |
| Silently broadening `CLS-CAR` to non-card product families | P9; governed classification revision required |
| Prescribing engineering implementation in Volume 03 standards | P8; engineering is downstream |
| Using visual source as primary classification | `FI-DSN-CLS-001` Section 4 |

### 15.4 Disposition guidance

Future Volume 03 standards SHALL use authorized Layer B dispositions per `FI-DSN-GOV-001` Section 6.4 and `FI-DSN-TPL-001`. This Volume Governance document is not a Layer B Design Standard and does not reserve `FI-DSN-{PRN|STD|CON|POL|SYS}-###` identifiers for architectural prose.

---

## 16. Future Architectural Domains

The following domains are implied by this architecture. **No Standard IDs are assigned.** **No register population occurs in this document.** Drafting order is governed by `FI-DSN-QUE-001`.

### Domain 1 — Surface System Structure

- Governed surface system topology
- Template and system organization
- Structural region architecture
- Production-structure relationships
- Structural handoff and asset boundary obligations
- Inter-surface structural relationships where structural topology is principal

### Domain 2 — Surface Spatial Allocation

- Region relationships within governed structure
- Placement discipline and layout-boundary rules
- Safe-area and spatial-boundary governance
- Bleed integration at design-standard level
- Surface-bound spatial organization

### Domains explicitly outside Volume 03 principal authority

| Domain | Home |
|--------|------|
| Relational composition philosophy | Volume 02 — Layer 4 |
| Visual element character | Volume 02 — Layer 3 |
| Brand identity-bound presentation | Volume 02 — Layer 2 |
| Global visual exclusions | Volume 02 — Layer 5 |
| Artwork selection, occasion semantics, personalization policy | Volume 04 |
| Brain Visual Selection and Preference Surfaces | Volume 04 |
| Collection governance, release, retirement | Volume 05 |
| Manufacturing operational policy | Volume 01 — `FI-MFG-*` |
| Envelope and exterior presentation when principal | Volume 03 or cross-volume per `CLS-EEP` and `FI-DSN-VOL-001` Section 13.1 |
| Manufacturing integration when principal | Volume 03 or cross-volume per `CLS-MFI` |
| Rendering, editor behavior, coordinates, runtime layout | Engineering |

---

## 17. Future Expansion Posture

### 17.1 Product-family growth

The Volume 03 constitutional purpose — governed structural instantiation of design language on physical product surfaces — is **product-independent** at the volume governance level.

Frozen `CLS-CAR` is **greeting-card-specific** at the classification level. These postures coexist without contradiction:

| Layer | Scope |
|-------|-------|
| **Volume governance** | Product-independent Surface Implementation purpose |
| **Current card-system standards** | Greeting card structure under `CLS-CAR` |
| **Future non-card products** | Require governed classification extension before non-card surface structure standards claim `CLS-CAR` or another primary classification |

### 17.2 Rules for future expansion

1. This architecture remains valid across product families without structural redesign.
2. `CLS-CAR` remains authoritative for greeting card system structure until governed `FI-DSN-CLS-001` revision states otherwise.
3. Non-card surface structure standards require governed broadening of `CLS-CAR` or introduction of a new `CLS-*` code before claiming primary ownership.
4. This architecture MUST NOT silently broaden frozen classification scope. REG **Notes** MUST record classification scope explicitly.
5. Technology change does not require architectural revision. Implementation independence is permanent law under P8.

---

## 18. Architectural Constraints

### 18.1 Stability constraints

1. New surface concerns MUST map into Domain 1 or Domain 2 unless governed `FI-DSN-VOL-001` or `FI-DSN-CLS-001` revision authorizes expansion.
2. Domain merges or eliminations REQUIRE governed revision of this document and impact review per `FI-DSN-GOV-001` Section 15.
3. This architecture MUST remain valid across product-family expansion, vendor change, Brain expansion, new media, and new rendering technology without structural redesign.

### 18.2 Authority constraints

1. Volume 03 MUST NOT create metadata fields, queue states, identifier families, or `CLS-*` codes.
2. Volume 03 MUST NOT verify facts or define epistemic categories.
3. Volume 03 MUST NOT define Brain algorithms or runtime behavior.
4. Volume 03 supplements MUST NOT widen `FI-DSN-GOV-003` or `FI-DSN-GOV-004` library-wide minimums per `FI-DSN-VOL-001` Section 20.
5. Volume 03 MUST NOT silently broaden `CLS-CAR` beyond the greeting card product.

### 18.3 Implementation constraints

This document MUST NOT specify template dimensions, coordinate values, bleed measurements, safe-area pixels, rendering engines, editor UX, CSS, responsive breakpoints, database schemas, API contracts, Brain algorithms, or runtime behavior.

---

## 19. Open Planning Questions

| ID | Question | Status | Safe default |
|----|----------|--------|--------------|
| `OQ-V03-001` | Should the permanent document title emphasize "Surface Implementation Architecture" or harmonize literally with frozen volume name "Card Design System"? | Open — naming | Volume number and Primary Volume unchanged; constitutional title may specialize |
| `OQ-V03-002` | When should the first `CLS-EEP` standard enter Volume 03 drafting relative to Domain 1 and Domain 2 standards? | Open — sequencing | Domain 1 structural standard first; EEP when exterior presentation is principal and upstream structure exists |
| `OQ-V03-003` | How should REG **Notes** document product-independent volume purpose alongside card-scoped `CLS-CAR` assignments? | Open — metadata | Record both volume constitutional purpose and frozen classification scope explicitly |
| `OQ-DSN-003` | Visual Source controlled metadata schema | Open — inherited | Volume 03 architecture proceeds; provenance-referencing standards defer |
| `OQ-DSN-008` | Primary Volume canonical metadata field | Open — inherited | REG **Notes** convention per `FI-DSN-VOL-001` Section 14.2 |
| `OQ-DSN-009` | Separate volume governance document timing | Partially resolved for Volume 03 — open for Volumes 04–05 | Volume 03 governance requirement is satisfied by this document when frozen |
| `OQ-CLS-001` | Cross-volume classification justification | Open — inherited | `FI-DSN-VOL-001` Section 13.1 table |

---

## 20. Architecture Validation

Before freeze of this document, Architecture Validation MUST confirm:

| Check | Pass criterion |
|-------|----------------|
| Document class | Volume Governance per `FI-DSN-GOV-001` Section 5 |
| Two-domain model | Domain 1 and Domain 2 defined with purposes, governing questions, and boundaries |
| P1–P10 | All principles present and non-implementational |
| Structure authority | Domain 1 independent; cross-authority denial documented |
| Volume 02 boundary | Decision rule and illustrative examples present |
| Volume 04 boundary | Structure versus selection matrix present |
| Surface lifecycle | Lifecycle ownership table complete |
| VOL-001 alignment | Required category mapping in Section 8.1; composition split in Section 12.5 |
| CLS-001 harmonization | `CLS-CAR`, `CLS-CMP`, `CLS-EEP`, and `CLS-MFI` consumed per Sections 13.1 and 14.3–14.4 without redefinition |
| Inheritance model | Upstream reconcilability chain documented; Gate 1 synchronized with Section 9.1 inherited Volume 02 architectural law |
| Gate 1 constitutional sync | Gate 1 evaluates Volume 03 P1–P10 and inherited frozen Volume 02 Visual Design Architecture P1–P11 per Section 10.1; no contradiction with Section 9.1 |
| Decision architecture | Stacked gate procedure and conflict resolution present |
| Future expansion | P9 and Section 17 preserve frozen `CLS-CAR` scope |
| No implementation rules | No dimensions, coordinates, algorithms, or runtime policy |
| No unauthorized extensions | No new metadata, identifiers, classifications, or queue states |
| Authority non-leakage | Sections 4.2 and 11 boundaries respected |
| GOV-003 / GOV-004 | No redefinition; Compliance Boundary model preserved |

---

## 21. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 | July 24, 2026 | F.I. Forgot | Frozen — promoted to Frozen Volume Governance; Formal Freeze Review Outcome A (Ready for Freeze Promotion); architecture unchanged from Version 0.2 Draft |
| 0.2 Draft | July 24, 2026 | F.I. Forgot | Sprint D7.6 refinement — RF-01 Gate 1 aligned with inherited Volume 02 P1–P11; RF-02 Section 6.4 structural versus spatial constraint boundary; RR-01 hero slot domain split; RR-02 Section 12.5 cross-reference deduplication; RR-03 P11 Message Primacy inheritance note; RR-04 Document Control naming and `CLS-CAR` posture table; RR-05 Gate 1 validation checkpoint |
| 0.1 Draft | July 24, 2026 | F.I. Forgot | Sprint D7.4 — initial Surface Implementation Architecture Volume Governance draft: two-domain model; P1–P10; constitutional inheritance; stacked decision architecture; Volume 02/03/04/05 boundary architecture; `CLS-CAR` / `CLS-CMP` harmonization; surface lifecycle ownership; future expansion posture; standard placement guidance; future domain inventory; validation gate |

### Future revision notes

Revision to a frozen Volume Governance baseline SHOULD occur only after architecture review, refinement as needed, and formal freeze review. Conditions that would trigger revision include: change to the two-domain model, structure versus spatial authority split, surface lifecycle ownership, cross-volume boundary rules, or future expansion posture relative to frozen `FI-DSN-CLS-001`.
