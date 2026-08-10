# F.I. Forgot Design Library

# FI-DSN-VOL-001 — Design Volume Roadmap

## 1. Document Control

| Field | Value |
|-------|-------|
| **Planning identifier** | FI-DSN-VOL-001 |
| **Title** | Design Volume Roadmap |
| **Document** | `09-design-volume-roadmap.md` |
| **Sprint** | D1.10 |
| **Artifact type** | Design Volume Roadmap |
| **Status** | Frozen Version 1.0 Baseline; Version 1.1 Governed Draft Pending Review |
| **Version** | 1.1 Draft |
| **Date** | July 28, 2026 |
| **Freeze date** | July 23, 2026 (Version 1.0); Version 1.1 governed revision pending independent review |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Epistemic reference** | `FI-DSN-GOV-003` — Evidence vs Company Judgment Governance (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Brain authority reference** | `FI-DSN-GOV-004` — Brain Authority Boundary (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Register reference** | `FI-DSN-REG-001` — Design Planning Register (Frozen Planning Register, Version 1.0, July 22, 2026) |
| **Queue reference** | `FI-DSN-QUE-001` — Design Drafting Queue (Frozen Design Drafting Queue, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Research reference** | `playbook/research/README.md` — Research Library governance |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md`; `playbook/design/01-design-standard-template.md`; `playbook/design/02-design-classification-strategy.md`; `playbook/design/03-design-identifier-system.md`; `playbook/design/04-design-library-metadata-standard.md`; `playbook/design/05-design-planning-register.md`; `playbook/design/06-design-drafting-queue.md`; `playbook/design/07-evidence-vs-company-judgment-governance.md`; `playbook/design/08-brain-authority-boundary.md`; `playbook/design/README.md` |
| **Downstream consumers** | Design Standards in Volumes 02 through 06; `FI-DSN-REG-001` volume planning rows; `FI-DSN-QUE-001` governance-layer ordering; future automation |

**Standard statement:** F.I. Forgot maintains **one authoritative Design Volume Roadmap** that defines durable production volume architecture, sequencing, dependencies, entry and completion conditions, and Primary Volume assignment rules for the Design Library. The Planning Foundation is a prerequisite layer — not Volume 00. Production volumes 01 through 06 organize planning scope and dependency posture; they do not replace the Planning Register, Drafting Queue, classification taxonomy, metadata semantics, epistemic governance, or Brain authority boundaries. Each planned Layer B `FI-DSN-*` standard SHALL have exactly one Primary Volume. Roadmap sequence informs planning; the Drafting Queue authorizes drafting.

**Source basis:** Company judgment. This volume roadmap model is an F.I. Forgot governance choice. It is not derived from vendor facts, verified evidence, or Brain runtime behavior.

---

## 2. Purpose

This document is the **authoritative Design Volume Roadmap** for the Design Library planning layer.

The Design Volume Roadmap answers: **What production volumes exist, what each volume owns in planning scope, in what dependency order volumes should mature, what must be true before a volume may begin or be called structurally complete, and how planned standards are assigned to exactly one Primary Volume without duplicating Register inventory or Queue authorization?**

This document:

- Establishes the **Planning Foundation Inventory** and **Production Volume Inventory** as distinct concepts
- Defines **volume authority**, **ownership**, **roadmap states**, and **governed terminology**
- Governs **Primary Volume** assignment, **cross-volume dependencies**, **entry conditions**, **completion conditions**, and **Required Volume Artifact** sets
- Governs **Volume Supplements**, **future volume expansion**, **Roadmap Validation**, **Roadmap Change Control**, and a **Freeze Gate**
- Harmonizes with `FI-DSN-GOV-001` Section 5 and Section 17, `FI-DSN-REG-001`, `FI-DSN-QUE-001`, `FI-DSN-CLS-001`, `FI-DSN-GOV-003`, and `FI-DSN-GOV-004`

This document does **not**:

- Author Design Requirements, Layer B standard bodies, or `{Standard ID}-R{nn}` normative text
- Replace `FI-DSN-REG-001` as planning inventory or change artifact **Status**
- Replace `FI-DSN-QUE-001` admission, readiness, or **Execution Order**
- Redefine metadata fields, classifications, epistemic taxonomy, or Brain authority boundaries
- Verify facts, promote evidence, or schedule Brain implementation work
- Reclassify `FI-MFG-*` manufacturing standards as `FI-DSN-*`

---

## 3. Scope

### In scope

- Planning Foundation Inventory and Production Volume Inventory
- Definition of a Design Library volume and volume authority model
- Primary Volume, Cross-Volume Dependency, Cross-Volume Influence, and Cross-Volume Applicability
- Volume Status roadmap planning states and coexistence with GOV-001, REG-001, and QUE-001
- Production volumes 01 through 06 architecture, sequencing, entry, and completion
- Manufacturing hybrid peer model for Volume 01
- Classification relationship, including `CLS-BVS` and `OQ-CLS-001`
- Six-type cross-volume dependency taxonomy and blocking posture
- Required Volume Artifact governance and Volume Supplement governance
- Relationships to REG-001, QUE-001, GOV-003, and GOV-004
- Future volume expansion, Roadmap Validation, Roadmap Change Control, and Freeze Gate
- Primary Volume interim recording mechanism pending `OQ-DSN-008`

### Out of scope

- Production `FI-DSN-*` and `FI-MFG-*` standard drafting
- New metadata columns, queue states, identifier families, or `CLS-*` codes
- Research planning, sprint tracking, or runtime implementation
- Brain algorithms, prompts, and message-generation policy
- Epistemic verification and fact promotion

---

## 4. Governed Terminology

Future roadmap consumers MUST use the following terms precisely. Interchangeable use is PROHIBITED.

| Term | Definition | Roadmap-only? |
|------|------------|---------------|
| **Volume** | A durable organizational and dependency container with stable two-digit numbering, declared scope, and roadmap states | No — also used descriptively in GOV-001 and README |
| **Planning Foundation Inventory** | Descriptive index of frozen meta-governance and planning-layer artifacts prerequisite to production volumes | Yes — defined here |
| **Production Volume Inventory** | Normative inventory of production volumes 01–06 (and future append-only volumes) in this document | Yes — defined here |
| **Primary Volume** | Exactly one home production volume per planned Layer B `FI-DSN-*` standard or `FI-MFG-*` manufacturing standard | Planning rule — interim REG **Notes** per Section 14 |
| **Cross-Volume Dependency** | Directed requirement that another volume's artifact, baseline, or roadmap state must exist before an action proceeds; does not transfer ownership | Instance in REG **Dependencies** |
| **Cross-Volume Influence** | Informational or soft ordering relationship; does not block unless recorded as Soft dependency | REG **Notes** or Soft dependency |
| **Cross-Volume Applicability** | A standard is cited or constrained by obligations from another volume; citation does not transfer ownership | REG **Dependencies** / standard body |
| **Volume Entry Condition** | Preconditions for **Entry Ready** roadmap state | VOL-001 |
| **Volume Completion Condition** | Preconditions for **Structurally Complete** or **Mature** | VOL-001 |
| **Required Volume Artifact** | Register-identified artifact that MUST reach **Frozen** (or governed **Retired** with successor) for **Structurally Complete** | VOL-001 declaration |
| **Optional Volume Artifact** | Planned artifact that may remain open without blocking structural completion | VOL-001 declaration |
| **Deferred Artifact** | Explicitly postponed with boundary label and/or open question | REG + VOL-001 |
| **Volume Supplement** | Governed document or section that specializes, clarifies, constrains, or organizes within frozen library minimums | Section 20 |
| **Volume Sequence** | Recommended maturity order among production volumes in this document | Not QUE **Execution Order**; not constitutional dependency order (Section 6.4) |
| **Constitutional dependency order** | Directed authority and artifact-flow posture among volumes (Section 6.4) | Not numeric volume order; not QUE **Execution Order** |
| **Lifecycle order** | Governed artifact-state progression for creative production (Volume 06) and library belonging (Volume 05) | Not numeric volume order; defined in Volume 06 architecture |
| **Volume Status** | Roadmap planning state of a volume container: Defined, Entry Ready, Active, Structurally Complete, Mature, Archived | **Roadmap-only** — not REG **Status** |

---

## 5. Planning Foundation Inventory

### 5.1 Purpose and authority

The **Planning Foundation** is the **prerequisite meta-governance and planning layer** that enables production volume planning. It is **not** Volume 00. It is **not** a production volume.

The Planning Foundation Inventory is a **descriptive index** of frozen artifacts. Each listed artifact retains its own governing authority. This inventory does not merge foundation artifacts into a numbered production volume.

### 5.2 Planning Foundation Inventory

| Identifier | Title | Role in planning layer |
|------------|-------|------------------------|
| `FI-DSN-GOV-001` | Design Standards Governance | Lifecycle, freeze policy, volume organization law |
| `FI-DSN-TPL-001` | Design Standard Template | Layer B standard structure |
| `FI-DSN-CLS-001` | Design Classification Strategy | Primary and Secondary Classification taxonomy |
| `FI-DSN-ID-001` | Design Identifier System | Namespace families including `FI-DSN-VOL-###` |
| `FI-DSN-GOV-002` | Design Library Metadata Standard | Canonical metadata field semantics |
| `FI-DSN-REG-001` | Design Planning Register | Authoritative planning inventory |
| `FI-DSN-QUE-001` | Design Drafting Queue | Operational drafting sequence |
| `FI-DSN-GOV-003` | Evidence vs Company Judgment Governance | Epistemic taxonomy and evidence gates |
| `FI-DSN-GOV-004` | Brain Authority Boundary | Brain authority dimensions and boundaries |
| `playbook/design/README.md` | Design Library README | Descriptive library architecture and philosophy — harmonized with frozen governance; not a frozen governance standard |
| `FI-DSN-VOL-001` | Design Volume Roadmap (this document) | Frozen Design Volume Roadmap |

### 5.3 Maintenance and expansion

| Rule | Requirement |
|------|-------------|
| Foundation complete | All listed artifacts except VOL-001 (this document) SHALL be frozen before VOL-001 freeze promotion |
| New foundation artifact | REQUIRES `FI-DSN-ID-001` namespace authorization and `FI-DSN-GOV-001` Section 15 review |
| Inventory update | REQUIRES governed VOL-001 revision |
| Production volume numbering | Foundation artifacts SHALL NOT be renumbered as Volume 00 |

**Permanent principle:**

> **Planning Foundation answers what planning law exists. Production volumes answer what product-design containers exist.**

### 5.4 Planning Foundation Required Artifact Framework

The Planning Foundation is **not** a production volume. Foundation completeness is recorded as **foundation posture**, not as a **Volume Status** value (Section 6.3).

**Foundation posture:** Frozen prerequisite layer complete as of July 23, 2026.

The following **Required** foundation artifacts MUST be frozen before production volume structural completion may be declared library-wide. Exact future production-standard identifiers are populated through governed REG planning; this category framework is frozen planning law in VOL-001.

| Category | Classification | Required identifier(s) | Completion effect |
|----------|----------------|------------------------|-------------------|
| Design lifecycle governance | **Required** | `FI-DSN-GOV-001` | Foundation prerequisite |
| Design standard structure | **Required** | `FI-DSN-TPL-001` | Foundation prerequisite |
| Classification taxonomy | **Required** | `FI-DSN-CLS-001` | Foundation prerequisite |
| Identifier system | **Required** | `FI-DSN-ID-001` | Foundation prerequisite |
| Metadata semantics | **Required** | `FI-DSN-GOV-002` | Foundation prerequisite |
| Planning inventory | **Required** | `FI-DSN-REG-001` | Foundation prerequisite |
| Drafting queue | **Required** | `FI-DSN-QUE-001` | Foundation prerequisite |
| Epistemic governance | **Required** | `FI-DSN-GOV-003` | Foundation prerequisite |
| Brain authority boundaries | **Required** | `FI-DSN-GOV-004` | Foundation prerequisite |
| Volume architecture | **Required** | `FI-DSN-VOL-001` | Foundation complete when this document is frozen |
| Library descriptive architecture | **Optional** | `playbook/design/README.md` | Descriptive index only — MUST remain harmonized with frozen governance; does not satisfy a Required category by itself |

`playbook/design/README.md` is descriptive. It MUST remain harmonized with frozen governance and this roadmap. It is **not** a frozen governance standard unless separately frozen under `FI-DSN-GOV-001`.

---

## 6. Production Volume Inventory

### 6.1 Purpose and authority

The **Production Volume Inventory** is the normative architecture of production volumes **01 through 06**. This document owns volume numbers, scope boundaries, sequence, entry and completion rules, and Required Volume Artifact declarations.

Future volumes SHALL use append-only numbering (07, 08, …) per Section 25.

### 6.2 Production volume summary

| Volume | Title | Primary artifact family | Volume governance document |
|--------|-------|-------------------------|----------------------------|
| **01** | Manufacturing and Production | `FI-MFG-*` | `playbook/design/volume-01-manufacturing/01-handwrytten-production-standard.md` |
| **02** | Design Language | `FI-DSN-*` (Volumes 02–06) | Authorized when first Volume 02 standard enters drafting per `OQ-DSN-009` |
| **03** | Card Design System | `FI-DSN-*` | Per `OQ-DSN-009` |
| **04** | Artwork Intelligence | `FI-DSN-*` | Per `OQ-DSN-009` |
| **05** | Signature Collections | `FI-DSN-*` | Per `OQ-DSN-009` |
| **06** | Creative Production | `FI-DSN-*` | `playbook/design/volume-06-creative-production/01-creative-production-architecture.md` (Version 1.0 Frozen — architecture freeze complete July 29, 2026; **Structurally Complete** August 10, 2026; not Entry Ready; Layer B complete; Product Sprint 004 not authorized) |

### 6.3 Foundation posture and Volume Status

**Foundation posture (not a Volume Status):** Frozen prerequisite layer complete as of July 23, 2026. All Planning Foundation **Required** artifacts in Section 5.4 are frozen.

**Current production volume roadmap states** (Version 1.1 Draft):

| Volume | Volume Status | Notes |
|--------|---------------|-------|
| **01** | **Structurally Complete** | `01-handwrytten-production-standard.md` Version **2.0 Frozen** (Sprint V01-D57.2, August 10, 2026). Eight embedded `FI-MFG-*` standards Version 1.0 Frozen and Binding. **Structurally Complete** August 10, 2026 (Sprint V01-D59.1). `FI-MFG-POL-003` (Optional) Drafted, Pending Freeze — timing blocked — nonblocking. Operational Continuity **Deferred**. Product Sprint 004 not authorized |
| **02** | **Defined** | Awaiting volume entry conditions |
| **03** | **Defined** | Awaiting predecessors |
| **04** | **Defined** | Awaiting predecessors and governed design systems |
| **05** | **Defined** | Awaiting predecessors |
| **06** | **Structurally Complete** | Volume 06 Creative Production Architecture Version **1.0 Frozen** (`playbook/design/volume-06-creative-production/01-creative-production-architecture.md`). Architecture **frozen** July 29, 2026. **Structurally Complete** August 10, 2026 (Sprint V06-D54.2). Layer B standards `FI-DSN-STD-012` through `FI-DSN-STD-015` Version 1.0 Frozen, Approved, Binding. Initial controlled repository admission **complete**. Full post-H4 combined-system constitutional rereview **complete**. Formal Version 1.0 Freeze Review **complete**. Governed Version 1.0 Freeze commit **complete**. Cross-volume architecture harmonization complete across Volumes 02 and 05 and the Design README. **Not Entry Ready**; Product Sprint 004 not authorized |

At Version 1.0 freeze (July 23, 2026), Volumes 01–05 had the roadmap states shown above for **01** through **05**. Volume 06 is added by governed Version 1.1 revision per Section 25.

### 6.4 Volume numbering, constitutional dependency, and lifecycle order

Three order concepts MUST NOT be conflated:

| Order type | Definition | Example |
|------------|------------|---------|
| **Numeric volume order** | Stable two-digit document numbering in this inventory (01–06 at this revision) | Volume 05 appears before Volume 06 numerically |
| **Constitutional dependency order** | Directed authority and artifact-flow posture — which volumes supply governing law and which consume outputs | Volume 06 consumes Volumes 01–04; Volume 05 consumes Governed Production-Ready Artifacts (GPRAs) from Volume 06 for membership intake |
| **Lifecycle order** | Governed artifact-state progression within and across volumes | Declared production intent → realization → GPRA → Handoff Posture → Volume 05 membership consideration (Volume 06 architecture) |

**Permanent rule:**

> **Numeric volume order is a stable planning identifier. Constitutional dependency order and lifecycle order govern authority and artifact flow. A lower volume number does NOT imply upstream governing authority when this document declares otherwise.**

Volume 05 retains numeric identifier **05** and frozen planning history. Volume 06 is constitutionally **upstream of Volume 05 for GPRA intake** even though Volume 06 is numbered **06**.

---

## 7. Definition of a Volume

A **Design Library volume** is a **durable organizational and dependency container** with:

1. A **stable two-digit number** (01–05 at initial freeze; 06+ for governed additions)
2. A **declared purpose** and normative scope boundary recorded in this document
3. A **primary artifact family** (`FI-MFG-*` for Volume 01; `FI-DSN-*` for Volumes 02–06)
4. **Volume Entry Conditions** and **Volume Completion Conditions**
5. Optional **Volume Supplements** and volume governance documents where authorized

A volume is **not**:

| Prohibited identity | Authoritative concept instead |
|-------------------|------------------------------|
| A classification | `CLS-*` per `FI-DSN-CLS-001` |
| A Drafting Queue lane or state | `FI-DSN-QUE-001` |
| A sprint or workstream | — |
| A metadata schema | `FI-DSN-GOV-002` |
| A production Design Standard | Layer B `FI-DSN-*` / `FI-MFG-*` standards |
| A research plan | Research Library governance |
| Volume 00 / Planning Foundation | Section 5 |

---

## 8. Volume Authority Model

### 8.1 Permanent ownership table

| Authority domain | Volume owns | Volume does NOT own |
|------------------|-------------|---------------------|
| **Scope ownership** | Declared subject boundary; explicit exclusions; peer volume relationships | Standards outside scope; Brain message policy; manufacturing operational policy duplication |
| **Dependency architecture** | Volume-level predecessor/successor posture; default blocking types | Individual dependency resolution; fact verification |
| **Entry rules** | **Entry Ready** conditions | Artifact freeze gates |
| **Completion rules** | **Structurally Complete** and **Mature** conditions | Epistemic or Boundary Validation |
| **Required artifact declarations** | **Required Volume Artifact** sets for structural completion | Identifier reservation without REG |
| **Volume supplements** | Authorization to publish governed supplements within library minimums | Competing templates; epistemic or Brain taxonomy |
| **Applicability specialization** | Narrowing specialization within volume scope | Widening GOV-003/004 minimums |
| **Planning sequence** | **Volume Sequence** recommendation | QUE **Execution Order** |
| **Volume Status** | Roadmap planning states for the container | REG **Status**; queue labels |

### 8.2 Permanent non-ownership table

| Domain | Authoritative owner |
|--------|---------------------|
| Metadata field semantics | `FI-DSN-GOV-002` |
| Identifier allocation | `FI-DSN-ID-001` + `FI-DSN-REG-001` |
| Primary / Secondary Classification | `FI-DSN-CLS-001` |
| Artifact lifecycle and freeze law | `FI-DSN-GOV-001` |
| Epistemic governance | `FI-DSN-GOV-003` |
| Brain authority boundaries | `FI-DSN-GOV-004` |
| Production normative requirements | Frozen `FI-DSN-*` / `FI-MFG-*` standards |
| Drafting authorization | `FI-DSN-QUE-001` |
| Planning inventory truth | `FI-DSN-REG-001` |
| Research verification | Research Library |

**Permanent principle:**

> **Volumes govern library architecture and planning posture. Standards govern product design. Frozen GOV artifacts govern how both are created.**

---

## 9. Volume Ownership Model

### 9.1 Four concepts

| Concept | Definition | Transfers ownership? |
|---------|------------|----------------------|
| **Primary Volume** | Exactly one home volume per planned standard | — (this is ownership) |
| **Cross-Volume Dependency** | Directed requirement on another volume's artifact or roadmap state | **No** |
| **Cross-Volume Influence** | Informational or soft ordering; preferred but not mandatory sequence | **No** |
| **Cross-Volume Applicability** | Obligations from another volume cite or constrain a standard | **No** |

### 9.2 Permanent ownership rules

1. Each planned Layer B `FI-DSN-*` standard SHALL have **exactly one Primary Volume**.
2. Each `FI-MFG-*` standard SHALL have Primary Volume **01**.
3. Dependencies MUST NOT transfer ownership.
4. Applicability MUST NOT transfer ownership.
5. Influence MUST NOT transfer ownership.
6. Primary Classification MUST remain independent of Primary Volume per `FI-DSN-CLS-001` Section 11.
7. Cross-volume classification (`OQ-CLS-001`) affects justification and discovery; it does not assign a second Primary Volume.

### 9.3 Workflow effects

| Dimension | Primary Volume effect | Cross-volume dependency effect |
|-----------|----------------------|-------------------------------|
| **Drafting** | Identifies planning context for REG row and QUE admission | Hard dependencies MAY block QUE admission |
| **Revision** | Impact review begins in primary volume scope | Dependent volumes flagged in REG **Dependencies** |
| **Validation** | Volume completion aggregates required artifacts in primary volume | Does not merge per-artifact validation domains |
| **Completion** | **Structurally Complete** when required set in primary volume is frozen | Unresolved material Hard deps block downstream volume completion |
| **Roadmap reporting** | Progress roll-up by Primary Volume | Dependency overlay separate |

**Author clarity rule:** If determining ownership requires reading dependencies only, **Primary Volume** was not recorded correctly in REG **Notes** per Section 14.

---

## 10. Volume States

### 10.1 Roadmap planning states

| Volume Status | Meaning |
|---------------|---------|
| **Defined** | Volume appears in this document with purpose, scope, sequence, and dependency posture |
| **Entry Ready** | Volume entry conditions satisfied; volume-level planning and reservation MAY proceed |
| **Active** | One or more standards in the volume are reserved, drafting, or in freeze review |
| **Structurally Complete** | All **Required Volume Artifacts** frozen; no material unresolved Hard cross-volume deps; planning dispositions complete per GOV-001 §6.2 |
| **Mature** | Structurally Complete plus optional artifacts addressed or explicitly deferred with governed record |
| **Archived** | Volume withdrawn from active planning; number not reused |

### 10.2 Explicit non-equivalence

Volume Status is **roadmap planning state only**. It is **NOT**:

- Artifact lifecycle state (`FI-DSN-GOV-001` Section 6.1)
- REG **Status** (`FI-DSN-REG-001` Section 6)
- QUE workflow or readiness label (`FI-DSN-QUE-001`)
- Freeze state, approval state, or GOV-002 canonical metadata value

Volume Status SHALL be recorded **only** in this document. It MUST NOT be written into REG **Status** or new metadata fields.

### 10.3 Coexistence model

```
REG row Status (per artifact):     Nonbinding candidate → … → Frozen → Under revision
QUE posture (per admitted row):      Readiness / Execution Order (operational)
VOL Volume Status (per container):   Defined → Entry Ready → Active → Structurally Complete → Mature
```

| Interaction | Rule |
|-------------|------|
| Volume **Entry Ready** with no reserved standards | Permitted |
| Volume **Active** with **Nonbinding candidate** rows out of required set scope | Permitted |
| Volume **Structurally Complete** with Required artifacts not **Frozen** | **Prohibited** |
| QUE-blocked row | Does not automatically revert volume from **Active** |
| Artifact **Frozen** | Necessary but not sufficient for volume **Structurally Complete** |

### 10.4 Reopening **Structurally Complete** volumes

Roadmap state regression is governed and auditable.

| Trigger | Effect |
|---------|--------|
| New **Required Volume Artifact** added after **Structurally Complete** | Volume automatically returns to **Active** unless the new artifact is already **Frozen** or governed **Retired** with valid successor |
| Required → Optional demotion after completion | REQUIRES governed VOL-001 revision; MUST NOT be used merely to preserve completion status |
| Material unresolved **Hard** dependency discovered after completion | Volume MAY reopen to **Active** until dependency resolved or governed waiver recorded per Section 15.4 |
| Evidence, manufacturing, or Brain authority changes | MAY trigger reopening through GOV-003 or GOV-004 impact review when material to volume completion |
| **Archived** volume | MUST NOT return to **Active** without governed VOL-001 revision |
| Reopening record | MUST be recorded in VOL-001 **Revision History** and reconciled with REG and QUE |

---

## 11. Volume Architecture

### 11.1 Volume 01 — Manufacturing and Production

| Field | Value |
|-------|-------|
| **Purpose** | Translate verified manufacturing facts into F.I. Forgot manufacturing principles, standards, constraints, and engineering references |
| **Major scope** | `FI-MFG-*` standards; production feasibility; fulfillment; vendor-question posture; engineering handoff |
| **Out of scope** | Visual identity; card templates; artwork selection logic; Brain algorithms |
| **Primary classifications** | Outside `FI-DSN-*` taxonomy (`FI-DSN-CLS-001` Section 11); bridge via Manufacturing Integration (`CLS-MFI`) only on design-side standards in other volumes |
| **Upstream** | Research Volume 01 verified baseline or governed boundary labels |
| **Downstream** | All design volumes consume applicable `FI-MFG-*` as Compliance Boundary inputs |
| **Completion summary** | Section 18.5 |

### 11.2 Volume 02 — Design Language

| Field | Value |
|-------|-------|
| **Purpose** | Define visual identity foundations: brand personality, emotional goals, typography philosophy, color philosophy, illustration direction |
| **Major scope** | Brand and visual identity `FI-DSN-*` standards |
| **Typical classifications** | `CLS-VPH`, `CLS-BRX`, `CLS-TYP`, `CLS-COL`, composition topics |
| **Upstream** | Planning Foundation frozen; applicable Volume 01 constraints identified |
| **Downstream** | Volumes 03, 04, 05 |
| **Completion summary** | Section 18.5 |

### 11.3 Volume 03 — Card Design System

| Field | Value |
|-------|-------|
| **Purpose** | Define card architecture: templates, layout, safe zones, metadata, production structure |
| **Major scope** | Structural and template `FI-DSN-*` standards |
| **Typical classifications** | `CLS-CDA`, `CLS-CMP`, `CLS-MFI` when integration is principal |
| **Upstream** | Volume 02 **Entry Ready** or documented **Hard** dependency waiver per `FI-DSN-QUE-001` Section 7.5 |
| **Downstream** | Volumes 04, 05; engineering templates |
| **Completion summary** | Section 18.5 |

### 11.4 Volume 04 — Artwork Intelligence

| Field | Value |
|-------|-------|
| **Purpose** | Govern artwork **selection** policy, metadata for selection, and intelligence **constraints** — not Brain execution logic per GOV-001 §11 and GOV-004 |
| **Major scope** | Selection governance; `CLS-BVS` Decision-stage boundaries; occasion and personalization policy where principal |
| **Typical classifications** | `CLS-BVS`, `CLS-OEC`, `CLS-PER`, artwork medium classes |
| **Upstream** | Volumes 02–03 minimum governed alternatives; GOV-004 frozen; Brain Architecture informational only |
| **Downstream** | Volume 06; Volume 05 (GPRA intake downstream per Section 6.4); production workflows |
| **Completion summary** | Section 18.5 |

### 11.5 Volume 05 — Signature Collections

| Field | Value |
|-------|-------|
| **Purpose** | Govern permanent collection systems, artwork governance, and release criteria |
| **Major scope** | Collection and asset-library `FI-DSN-*` standards |
| **Typical classifications** | `CLS-ASG`, medium-specific asset classes |
| **Upstream (Entry Ready)** | Volumes 02–04 **Entry Ready**; collection scope defined |
| **Upstream (Structurally Complete / freeze)** | Volumes 02–04 **Structurally Complete** or equivalent frozen upstream artifacts for standards that depend on final Design Language, Card System, or Artwork Intelligence rules |
| **Upstream (GPRA intake)** | Volume 06 Governed Production-Ready Artifacts for permanent collection membership consideration — constitutional dependency per Section 6.4; Volume 05 does **not** govern Volume 06 realization |
| **Completion summary** | Section 18.5 |
| **Downstream** | Production artwork libraries; partner guidance |

### 11.6 Volume 06 — Creative Production

| Field | Value |
|-------|-------|
| **Purpose** | Govern the transformation of declared creative intent into **Governed Production-Ready Artifacts (GPRAs)** through planning, exploration, realization, review, approval, and handoff |
| **Major scope** | Production Program; Declared Production Intent; Production Obligation; Realized Visual Artifact (RVA); Governed Production-Ready Artifact (GPRA); Review and Approval; Governed Handoff; manufacturing boundary at Design-Time Feasibility |
| **Out of scope** | Visual identity permission (Volume 02); surface architecture (Volume 03); contextual selection authority and Brain Visual Selection Decision policy (Volume 04); permanent collection membership (Volume 05); Manufacturing Validation and Fulfillment Execution (Volume 01 operational layer); Brain runtime behavior; implementation technology |
| **Typical classifications** | `CLS-CPR` — Creative Production Realization (Primary Classification for Layer B standards when realization transformation is the principal subject) |
| **Primary Classification affinity** | `CLS-CPR` — Creative Production Realization |
| **Primary Volume** | VOL-06 |
| **Classification governing authority** | `FI-DSN-CLS-001` Version 1.1 Frozen (July 29, 2026) |
| **Classification expansion authority** | `FI-DSN-CLS-002` Version 1.0 Frozen (July 29, 2026) |
| **Layer B classification planning** | Primary Classification decision **complete** (`OQ-V06-002` closed); identifier reservation **pending**; REG population **pending**; QUE admission **pending**; Layer B drafting **unauthorized**; Product Sprint 004 **unauthorized** |
| **Upstream** | Volumes 01–04 applicable frozen law and Compliance Boundaries; Volume 01 `FI-MFG-*` as Design-Time Feasibility input |
| **Downstream** | Volume 05 (GPRA intake for **approved artwork** / membership consideration); production artwork libraries; engineering specifications |
| **Constitutional posture** | Volume 06 consumes governing law from Volumes 01–04; produces GPRAs for downstream consumers; Volume 05 is downstream for artifact intake despite lower numeric identifier (Section 6.4) |
| **Volume governance document** | `playbook/design/volume-06-creative-production/01-creative-production-architecture.md` (Version 1.0 Frozen) |
| **Completion summary** | Section 18.5 |

### 11.7 Rejected volume concepts

The following are **classifications or topics**, not separate production volumes: Typography-only volume; Occasion-only volume; Brain Visual Selection volume (`CLS-BVS`); Quality/Validation volume (`CLS-VQA`); Foundation/Governance as Volume 00.

---

## 12. Manufacturing Relationship

### 12.1 Hybrid peer model

| Rule | Requirement |
|------|-------------|
| Volume 01 peer status | Volume 01 is a first-class production volume in this roadmap |
| Identifier family | `FI-MFG-*` remains outside `FI-DSN-*`; MUST NOT be reclassified |
| Design volume reference | Volumes 02–06 MUST treat applicable `FI-MFG-*` obligations as Compliance Boundary inputs per GOV-004 §13 |
| Queue separation | Manufacturing drafting queues remain outside `FI-DSN-QUE-001` per QUE-001 |
| Authority | Volume 01 governance document and `FI-MFG-*` corpus own manufacturing policy; this roadmap does not absorb it |
| Research | Manufacturing facts remain Research Library + GOV-003 governed |

### 12.2 Volume 01 planning reference

Volume 01 is governed by `playbook/design/volume-01-manufacturing/01-handwrytten-production-standard.md` and the frozen Manufacturing Standard Template. This roadmap records architecture and dependency posture; it does not duplicate `FI-MFG-*` bodies.

---

## 13. Classification Relationship

| Rule | Requirement |
|------|-------------|
| Independence | **Primary Classification** is independent of **Primary Volume** |
| Multi-classification per volume | One volume MAY contain many classifications |
| Cross-volume classification | One classification MAY span volumes only with formal justification in this document per `OQ-CLS-001` |
| Placement vs classification | Primary Volume placement MUST NOT override Primary Classification |
| Supplements | Volume Supplements MUST NOT create `CLS-*` codes |
| `CLS-BVS` | Classification for Decision-stage selection-boundary policy; primarily Volume 04; not a volume |
| Affinity | `FI-DSN-CLS-001` Section 11 informational affinity is planning guidance only |

### 13.1 Cross-volume classifications requiring justification

When a standard's Primary Classification is principally associated with one volume but Primary Volume is another, the roadmap or REG **Notes** MUST record justification:

| Classification | Typical primary volume | Cross-volume justification trigger |
|----------------|------------------------|-----------------------------------|
| `CLS-GOV` | Foundation inventory rows | N/A — not production volume standards |
| `CLS-VQA` | Cross-cutting | Any Primary Volume — record principal subject |
| `CLS-MFI` | 03 or cross-cutting | When principal subject is integration in non-03 volume |
| `CLS-BVS` | 04 | When Preference Surface is declared in Volume 03 standard |
| `CLS-OEC`, `CLS-PER` | 04 | When principal subject is collection policy in Volume 05 |

---

## 14. Primary Volume Assignment

### 14.1 Assignment rules

| Rule | Requirement |
|------|-------------|
| One primary | Exactly one Primary Volume per planned `FI-DSN-*` or `FI-MFG-*` standard |
| Principal subject | Primary Volume SHALL be assigned according to the standard's **principal normative subject** |
| Non-ownership signals | Dependencies, classifications, consumers, and downstream influence do NOT determine Primary Volume by themselves |
| Majority rule | If two volumes appear equally relevant, the author MUST identify which volume owns the **majority of the standard's normative requirements and governing purpose** |
| Tie persistence | If the tie remains, a governed ownership determination MUST be documented in REG **Notes** (interim Primary Volume convention), REG **Dependencies** where relevant, and VOL-001 **Revision History** or a governed roadmap decision where the choice affects volume scope |
| Dual prohibition | Dual Primary Volume ownership is **PROHIBITED** |
| Split rule | A standard MAY be split into separate standards only when subjects are genuinely separable and each resulting artifact independently satisfies `FI-DSN-GOV-001`, `FI-DSN-TPL-001`, `FI-DSN-CLS-001`, and `FI-DSN-REG-001` rules |
| Authority | This document defines rules; `FI-DSN-REG-001` rows reflect assignments |
| Reservation | Primary Volume SHOULD be recorded when a Standard ID is reserved |
| Reassignment | Primary Volume change REQUIRES impact review, REG reconciliation, QUE review, and governed VOL-001 revision where volume architecture or completion posture changes |

### 14.2 Interim recording mechanism (`OQ-DSN-008`)

Until canonical metadata may be amended, REG rows SHALL use structured **Notes**:

```
Primary Volume: VOL-02
```

Cross-volume links SHALL use REG **Dependencies**, optionally prefixed with dependency type per Section 15:

```
[Hard] FI-DSN-STD-### (VOL-03)
```

QUE-001 MAY filter by this convention; QUE-001 does not define the convention.

### 14.3 `OQ-DSN-008` — Primary Volume metadata

| Question | Status |
|----------|--------|
| Should **Primary Volume** become a canonical REG/GOV-002 field? | Open — architecture |

**Safe default:** Structured **Notes** and **Dependencies** remain authoritative interim mechanism.

**Criteria favoring future GOV-002 amendment:** large register scale; automation requiring reliable column; repeated mis-recording in review.

**Criteria favoring roadmap-only permanence:** stable five-volume model; **Dependencies** sufficient for cross-volume reporting; metadata minimalism per GOV-002.

This document does not create a **Primary Volume** metadata field.

### 14.4 Ownership validation

Roadmap Validation and freeze review MUST confirm:

1. Every in-scope planned standard has exactly one Primary Volume recorded or assignable under Section 14.1
2. No dual Primary Volume ownership exists
3. Assignments follow **principal normative subject**, not dependency or classification alone
4. Cross-volume justification is recorded where Primary Classification and Primary Volume diverge per Section 13.1

---

## 15. Cross-Volume Dependency Model

### 15.1 Taxonomy

Dependency **type** is declared in this document. Dependency **instances** are recorded in REG **Dependencies** per GOV-002. Type MAY be prefixed: `[Hard]`, `[Soft]`, `[Informational]`, `[Evidence]`, `[Manufacturing]`, `[Brain authority]`.

| Type | Definition | Owner |
|------|------------|-------|
| **Hard** | Downstream work is invalid until upstream artifact is frozen or governed **Hard dependency waiver** per `FI-DSN-QUE-001` Section 7.5 | VOL-001 taxonomy; REG instance; QUE-001 §7.5 waiver authority |
| **Soft** | Preferred order; downstream MAY proceed with documented **sequencing exception** (not a Hard dependency waiver) | VOL-001; REG **Notes** |
| **Informational** | Traceability only | REG **Dependencies** |
| **Evidence** | Requires frozen facts or governed boundary label per GOV-003 | GOV-003; REG **Evidence References** |
| **Manufacturing** | Requires applicable `FI-MFG-*` identification or freeze | `FI-MFG-*`; GOV-004 §13 |
| **Brain authority** | Requires frozen Compliance Boundary / Preference Surface per GOV-004 | GOV-004; applicable standards |

### 15.2 Blocking matrix

| Type | Blocks Entry Ready | Blocks Drafting | Blocks Freeze | Blocks Structurally Complete | Blocks Revision |
|------|:------------------:|:---------------:|:-------------:|:----------------------------:|:---------------:|
| **Hard** | Downstream volume | QUE admission / start | If upstream unfrozen and material | Yes, if unresolved | Until impact assessed |
| **Soft** | No | No (QUE MAY warn) | No | No | No |
| **Informational** | No | No | No | No | No |
| **Evidence** | If volume-wide gap | If material to scope | Per GOV-003 | If required artifact affected | Until propagation complete |
| **Manufacturing** | If MFG unidentified for design volume | If feasibility material | If MFG contradiction | If required MFG deps open | Until MFG impact reviewed |
| **Brain authority** | Vol 04 if no upstream alternatives | BVS-heavy drafting | If boundary incomplete | If BVS required artifacts blocked | Until GOV-004 impact assessed |

### 15.3 Silent dependencies

Silent cross-volume dependencies are **PROHIBITED** per `FI-DSN-GOV-001` Section 13.2.

### 15.4 Hard dependency waivers and Soft sequencing exceptions

**Hard dependency waiver** and **Soft sequencing exception** are distinct mechanisms. This document does not create a new queue state or waiver type.

#### Hard dependency waiver

A **Hard** cross-volume dependency MAY be waived only under the existing **dependency waiver** authority in `FI-DSN-QUE-001` Section 7.5.

| Rule | Requirement |
|------|-------------|
| QUE authority | Waiver MAY alter **Execution Order** or permit controlled progression only where QUE-001 Section 7.5 allows |
| Dependency persistence | QUE does NOT erase or resolve the register **Dependency**; the dependency remains recorded |
| Documentation | Waiver MUST be documented in REG **Notes** and REG **Dependencies** with waiver authority, date, and governance basis per QUE-001 Section 7.5 |
| Material unresolved dependency | MUST use an authorized Open Question or boundary posture where required by GOV-003, GOV-004, or manufacturing governance |
| Freeze limit | Waiver does NOT permit artifact **Frozen** if GOV-003, GOV-004, applicable `FI-MFG-*`, or another frozen standard still blocks freeze |
| No new queue state | Waiver uses existing manual override and dependency waiver mechanics only |

#### Soft sequencing exception

| Rule | Requirement |
|------|-------------|
| Mechanism | **Soft** dependencies require a documented **sequencing exception** in REG **Notes** — not a Hard dependency waiver |
| Blocks | Soft exceptions do NOT block **Entry Ready**, drafting admission, freeze, or **Structurally Complete** by default |
| QUE | QUE MAY warn; Soft exceptions do not invoke QUE-001 Section 7.5 unless reclassified as **Hard** |

#### Informational dependencies

**Informational** dependencies require no waiver.

---

## 16. Volume Sequencing

### 16.1 Volume Sequence (recommended maturity order)

```
Planning Foundation (frozen) → FI-DSN-VOL-001 freeze
        ↓
Volume 01 (Manufacturing) — parallel track; constrains design volumes
        ↓
Volume 02 (Design Language)
        ↓
Volume 03 (Card Design System)
        ↓
Volume 04 (Artwork Intelligence / CLS-BVS boundaries)
        ↓
Volume 06 (Creative Production — realization and GPRA approval)
        ↓
Volume 05 (Signature Collections — GPRA intake and permanent membership)
```

**Numeric inventory order** in Section 6.2 lists Volume 05 before Volume 06. **Constitutional dependency order** for governed visual artifact realization places Volume 06 **before** Volume 05 membership intake per Section 6.4. Both orderings are intentional and MUST NOT be conflated.

### 16.2 Rationale

| Ordering decision | Rationale |
|-------------------|-----------|
| Foundation before production | GOV, REG, QUE, CLS, ID, GOV-002/003/004 must freeze before volume architecture freezes |
| Manufacturing parallel | Volume 01 constrains feasibility; need not block all Volume 02 planning when constraints are identified |
| Language before structure | Visual identity foundations precede template architecture |
| Structure before selection | Governed alternatives and Compliance Boundaries precede `CLS-BVS` Preference Surfaces |
| Selection before collections | Collection governance consumes selection and language rules; Volume 05 **Entry Ready** MAY occur when Volumes 02–04 are **Entry Ready**; Signature Collection standards that depend on final upstream rules MUST NOT **Frozen** until required upstream artifacts are **Frozen** |
| Realization before membership intake | Volume 06 **Defined** or **Entry Ready** SHOULD precede Volume 05 standards that depend on GPRA intake posture; Volume 05 consumes GPRAs from Volume 06 per Section 6.4 — numeric identifier 05 does not reverse this dependency |
| Brain sequencing | Brain **visual selection policy** standards MUST NOT draft before Volume 02–03 provide governed treatments to select among (GOV-004) |
| Brain algorithms | Out of roadmap scope entirely |

### 16.3 Relationship to QUE-001

**Volume Sequence** informs QUE-001 governance-layer ordering (QUE-001 §7.2 layer 2). **Volume Sequence** does NOT replace **Execution Order**. Roadmap order never authorizes drafting.

---

## 17. Volume Entry Conditions

**Entry Ready** is roadmap permission for volume-level planning and standard reservation. It does NOT authorize drafting of every standard in the volume.

### 17.1 Common entry categories

| Category | Requirement |
|----------|-------------|
| **Governance** | Planning Foundation frozen; this document defines the volume |
| **Research** | Required verified baselines frozen OR explicit GOV-001/GOV-003 boundary labels for gaps |
| **Manufacturing** | For Volumes 02–06: applicable `FI-MFG-*` constraints identified for volume scope |
| **Predecessor volumes** | Declared upstream volumes **Entry Ready** or **Structurally Complete** as specified per volume |
| **Register** | Volume planning candidates dispositioned per GOV-001 §6.2 where in scope |
| **Queue** | Not required for **Entry Ready** |
| **Open questions** | Material volume-scoped OQs classified nonblocking or resolved |
| **Brain readiness** | GOV-004 frozen; Volume 04 additionally requires identifiable upstream governed alternatives |

### 17.2 Per-volume entry summary

| Volume | Entry Ready requires (minimum) |
|--------|-------------------------------|
| **01** | Research Vol 01 baseline or boundary labels; Volume 01 governance document |
| **02** | Foundation frozen; VOL-001 freeze; applicable MFG constraints identified |
| **03** | Volume 02 **Entry Ready**; MFG constraints identified |
| **04** | Volumes 02–03 **Entry Ready**; governed design alternatives identifiable; GOV-004 frozen |
| **05** | Volumes 02–04 **Entry Ready**; collection scope defined in planning; drafting and freeze of upstream-dependent standards subject to Hard dependencies and Section 15.4 |
| **06** | Volumes 02–04 **Entry Ready**; applicable Volume 01 `FI-MFG-*` constraints identified; Volume 06 architecture document **Frozen** (Version 1.0 Frozen, July 29, 2026); cross-volume harmonization with Volumes 02 and 05 and Design README **complete**; initial controlled repository admission **complete**; full post-H4 combined-system constitutional rereview **complete**; formal Version 1.0 Freeze Review **complete**; governed Version 1.0 Freeze commit **complete**; **not Entry Ready** — volume entry conditions not yet satisfied; **not Structurally Complete**; material volume-scoped open questions nonblocking; Layer B not authorized; Product Sprint 004 not authorized |

---

## 18. Volume Completion Conditions

### 18.1 Structurally Complete

A volume is **Structurally Complete** when:

1. All **Required Volume Artifacts** declared in this document (or governed VOL-001 revision) are REG **Frozen** or governed **Retired** with successor
2. No material unresolved **Hard** cross-volume dependencies remain for the volume
3. Every in-scope planning candidate received final disposition per GOV-001 §6.2
4. Volume-scoped material open questions are resolved or confirmed nonblocking
5. No volume supplement conflicts with GOV-003 or GOV-004 library-wide minimums

### 18.2 Mature

A volume is **Mature** when **Structurally Complete** and optional artifacts are addressed or explicitly **Deferred** with governed record.

### 18.3 Anti-failure rules

| Failure mode | Prevention |
|--------------|------------|
| Impossible completion | **Optional Volume Artifacts** do not block **Structurally Complete** |
| False completion | **Required Volume Artifacts** MUST be frozen; silent demotion PROHIBITED |
| Optional blocking | Deferred optional work MUST be recorded as **Deferred**, not Required |
| Perpetual Active | **Structurally Complete** MAY be declared while optional work continues toward **Mature** |

### 18.4 Required Volume Artifact category framework

Each production volume and the Planning Foundation have a **Required Volume Artifact category framework** declared in this document. The category framework is **frozen planning law** after `FI-DSN-VOL-001` Version 1.0 freeze.

| Rule | Requirement |
|------|-------------|
| Category authority | Required categories are declared in VOL-001 Sections 5.4 and 19.4 |
| Identifier population | Exact Standard IDs and titles are populated through governed REG planning; categories do not reserve identifiers by themselves |
| Change authority | Adding, removing, or reclassifying categories REQUIRES governed VOL-001 revision per Section 19.3 |
| Structurally Complete | A volume MUST NOT be **Structurally Complete** until every **Required** category has a satisfied artifact (REG **Frozen** or governed **Retired** with successor) |
| Register alone | REG edits alone MUST NOT change the Required category framework |

Detailed per-volume category tables appear in Section 19.4. Planning Foundation categories appear in Section 5.4.

### 18.5 Per-volume completion summaries

The following summaries are concise completion posture statements. They are subordinate to Sections 18.1–18.4 and Section 19.

| Volume | **Structurally Complete** when (minimum) |
|--------|------------------------------------------|
| **01 — Manufacturing and Production** | Required manufacturing governance and production boundary categories in Section 19.4 are satisfied; declared manufacturing scope has final planning dispositions per GOV-001 §6.2; downstream-blocking manufacturing constraints for Design volumes are documented |
| **02 — Design Language** | Required Design Language foundation categories in Section 19.4 are **Frozen**; no material unresolved **Hard** dependencies prevent downstream Card Design System work |
| **03 — Card Design System** | Required card architecture, layout, template, safe-area, and manufacturing integration categories in Section 19.4 are **Frozen** |
| **04 — Artwork Intelligence** | Required artwork governance and Brain Visual Selection boundary categories in Section 19.4 are **Frozen**; no algorithmic requirements have entered Design Standards per GOV-004 |
| **05 — Signature Collections** | Required collection governance categories in Section 19.4 are **Frozen**; all material upstream **Hard** dependencies are resolved |
| **06 — Creative Production** | Required provisional architectural areas in Section 19.4 are satisfied through frozen Layer B standards when authorized; Volume 06 architecture **Frozen**; cross-volume harmonization with Volume 05 and Volume 02 complete; no material unresolved **Hard** dependencies |

---

## 19. Required Volume Artifact Governance

### 19.1 Artifact classes

| Class | Definition |
|-------|------------|
| **Required Volume Artifact** | MUST be **Frozen** (or governed **Retired** with successor) for **Structurally Complete** |
| **Optional Volume Artifact** | MAY remain open without blocking **Structurally Complete** |
| **Deferred Artifact** | Postponed with boundary label and/or OQ; excluded from required count |
| **Superseded Artifact** | Replaced; predecessor per GOV-001 revision lifecycle |
| **Removed Artifact** | Withdrawn from roadmap set through governed VOL-001 revision |

### 19.2 Four authorities

| Authority | Who | Scope |
|-----------|-----|-------|
| **Governance authority** | GOV-001 §15 + Section 27 of this document | Whether required-set changes permitted |
| **Review authority** | Formal architecture / freeze review for material VOL-001 revisions | Required sets; entry/completion rules; scope |
| **Change authority** | Documented VOL-001 version increment | Add/remove/reclassify Required vs Optional |
| **Revision authority** | Primary volume owner + REG reconciliation | Per-artifact drafting/freeze within membership |

### 19.3 Change rules

| Action | Requires |
|--------|----------|
| Add **Required** artifact or category | VOL-001 revision + REG reservation + impact review; reopening per Section 10.4 if volume was **Structurally Complete** |
| Reclassify Required → Optional (artifact or category) | VOL-001 revision; reopening per Section 10.4 if already **Structurally Complete**; MUST NOT be used merely to preserve completion status |
| **Defer** artifact | REG **Open Questions** / boundary label; VOL-001 note if affects completion |
| **Supersede** | GOV-001 lifecycle; REG **Dependencies** |
| **Remove** from set | VOL-001 revision; REG **Retired** or disposition update |
| Silent required-set edit | **PROHIBITED** |

**Permanent rule:**

> **Required Volume Artifact sets become frozen planning law after `FI-DSN-VOL-001` Version 1.0 freeze. Silent modification is PROHIBITED.**

### 19.4 Per-volume Required Artifact category frameworks

Exact artifact identifiers and titles are populated through governed REG planning. The **category framework** in this section is frozen in VOL-001. Each category is classified **Required**, **Optional**, or **Deferred** as shown.

#### Volume 01 — Manufacturing and Production

| Category | Classification | Representative identifiers / notes | Completion effect |
|----------|----------------|-----------------------------------|-------------------|
| Manufacturing governance or controlling manufacturing standard | **Required** | `playbook/design/volume-01-manufacturing/01-handwrytten-production-standard.md`; frozen Manufacturing Standard Template | Volume 01 structural prerequisite |
| Core production method requirements | **Required** | e.g. `FI-MFG-PRN-001` (Physical Ink Authenticity) | Required for **Structurally Complete** |
| Vendor capability and continuity governance | **Required** | e.g. `FI-MFG-CON-003` (Vendor Capability Validation Constraint) | Required for **Structurally Complete** |
| Delivery and fulfillment boundaries | **Required** | e.g. `FI-MFG-CON-001` (Envelope Fulfillment Handling Boundary) | Required for **Structurally Complete** |
| Cancellation or modification policy | **Required** where applicable | e.g. `FI-MFG-POL-002` (Order Modification and Cancellation Policy) | Required when in declared scope |
| Manufacturing constraints required by downstream Design volumes | **Required** | Applicable `FI-MFG-CON-*` and `FI-MFG-POL-*` identified for Volumes 02–06 consumption | Documented Compliance Boundary inputs |
| Additional operational policies | **Optional** | e.g. `FI-MFG-POL-003`, `FI-MFG-POL-004` | Do not block **Structurally Complete** |
| Operational continuity standard | **Deferred** | Pending vendor diligence resolution per volume governance document | Excluded until promoted |

This framework does NOT require every future `FI-MFG-*` standard. It requires satisfaction of each **Required** category through at least one frozen artifact or governed successor.

#### Volume 02 — Design Language

| Category | Classification | Completion effect |
|----------|----------------|-------------------|
| Design language principles | **Required** | Required for **Structurally Complete** |
| Color governance | **Required** | Required for **Structurally Complete** |
| Typography governance | **Required** | Required for **Structurally Complete** |
| Illustration or artwork direction | **Required** | Required for **Structurally Complete** |
| Brand expression boundaries | **Required** | Required for **Structurally Complete** |
| Visual exclusions | **Required** | Required for **Structurally Complete** |
| Accessibility or visual quality foundations | **Required** where material to volume scope | Required when category applies |
| Extended brand subsystems | **Optional** | Do not block **Structurally Complete** |
| Niche medium treatments | **Deferred** | Governed boundary label or OQ required |

#### Volume 03 — Card Design System

| Category | Classification | Completion effect |
|----------|----------------|-------------------|
| Card architecture | **Required** | Required for **Structurally Complete** |
| Layout and composition | **Required** | Required for **Structurally Complete** |
| Template governance | **Required** | Required for **Structurally Complete** |
| Safe area and structural constraints | **Required** | Required for **Structurally Complete** |
| Front, inside, back, and envelope relationship rules | **Required** where applicable | Required when category applies |
| Manufacturing integration | **Required** | Required for **Structurally Complete** |
| Required metadata or asset handoff boundaries | **Required** | Handoff rules only — does not redefine GOV-002 field semantics |
| Extended template variants | **Optional** | Do not block **Structurally Complete** |
| Experimental layout systems | **Deferred** | Governed record required |

#### Volume 04 — Artwork Intelligence

| Category | Classification | Completion effect |
|----------|----------------|-------------------|
| Artwork eligibility and selection boundaries | **Required** | Required for **Structurally Complete** |
| Occasion and relationship treatment governance | **Required** | Required for **Structurally Complete** |
| Personalization boundaries | **Required** | Required for **Structurally Complete** |
| Brain Visual Selection standards (`CLS-BVS`) | **Required** | Required for **Structurally Complete** |
| Compliance Boundaries and Preference Surfaces | **Required** | Per GOV-004 — Compliance Boundaries before Preference Surfaces |
| Artwork metadata or selection inputs | **Required** where governed | Required when category applies |
| Brain Interaction boundaries | **Required** | Policy boundaries only — no algorithms per GOV-004 |
| Extended occasion libraries | **Optional** | Do not block **Structurally Complete** |
| Advanced selection heuristics | **Deferred** | Out of Design Standard scope per GOV-004 |

#### Volume 05 — Signature Collections

| Category | Classification | Completion effect |
|----------|----------------|-------------------|
| Collection governance | **Required** | Required for **Structurally Complete** |
| Collection eligibility and release criteria | **Required** | Required for **Structurally Complete** |
| Asset inclusion and exclusion rules | **Required** | Required for **Structurally Complete** |
| Collection consistency requirements | **Required** | Required for **Structurally Complete** |
| Collection maintenance and retirement governance | **Required** | Required for **Structurally Complete** |
| Upstream Design Language dependencies | **Required** | Material **Hard** deps MUST be **Frozen** before **Structurally Complete** |
| Upstream Card Design System dependencies | **Required** | Material **Hard** deps MUST be **Frozen** before **Structurally Complete** |
| Upstream Artwork Intelligence dependencies | **Required** | Material **Hard** deps MUST be **Frozen** before **Structurally Complete** |
| Partner-specific collection variants | **Optional** | Do not block **Structurally Complete** |
| Experimental collection pilots | **Deferred** | Governed record required |

#### Volume 06 — Creative Production

**Planning posture only.** The following are **provisional architectural planning areas** — not frozen Layer B standard titles. Exact artifact identifiers and titles are populated through governed REG planning after Volume 06 architecture freeze and Layer B authorization. Primary Classification assignment is **complete** — `CLS-CPR` per `FI-DSN-CLS-001` Version 1.1 Frozen (`OQ-V06-002` closed). Volume 06 architecture freeze is **complete** (Version 1.0 Frozen, July 29, 2026). Category classification as **Required** below is planning posture for Layer B standards when separately authorized — Layer B authorization remains a distinct governed step. Identifier reservation, REG population, and QUE admission remain **pending**; Layer B drafting and Product Sprint 004 remain **unauthorized**.

| Provisional architectural area | Planning classification | Completion effect |
|-------------------------------|-------------------------|-------------------|
| Intent and Planning Governance | **Required (provisional)** | Required for Volume 06 **Structurally Complete** when promoted to frozen category framework |
| Artifact Realization Governance | **Required (provisional)** | Required for Volume 06 **Structurally Complete** when promoted to frozen category framework |
| Review and Approval Governance | **Required (provisional)** | Required for Volume 06 **Structurally Complete** when promoted to frozen category framework |
| Governed Handoff and Manufacturing Boundary | **Required (provisional)** | Required for Volume 06 **Structurally Complete** when promoted to frozen category framework |
| Volume 06 architecture governance document | **Required (provisional)** | `01-creative-production-architecture.md` MUST reach **Frozen** before Volume 06 **Structurally Complete** |
| Extended realization tooling or vendor policy | **Optional (provisional)** | Do not block **Structurally Complete** when promoted |
| Experimental production pilots | **Deferred (provisional)** | Governed record required when promoted |

This framework does NOT reserve Layer B Standard IDs. It does NOT imply any provisional category is frozen until Volume 06 architecture freeze and governed VOL-001 category promotion.

---

## 20. Volume Supplement Governance

### 20.1 Definition

A **Volume Supplement** is a governed document or normative section that **specializes, clarifies, constrains, or organizes** volume-scoped planning or applicability within frozen library minimums.

### 20.2 Permitted uses

| Use | Example |
|-----|---------|
| Supplemental template schedule | GOV-001 §17.3 |
| Disposition-specific evidence matrix | Additional detail under GOV-003 §15 |
| Volume-scoped Brain boundary examples | Under GOV-004 §21 |
| Scope clarification | Volume boundary prose |
| Planning organization | Non-authoritative indexes |

### 20.3 Prohibited uses

| Prohibited | Owner |
|------------|-------|
| New `CLS-*` | CLS-001 |
| New metadata / REG columns | GOV-002 / REG-001 |
| New Brain authority | GOV-004 |
| New epistemic categories | GOV-003 |
| Competing standard template | TPL-001 |
| Manufacturing policy duplication | `FI-MFG-*` |
| Silent Required Artifact changes | VOL-001 |

### 20.4 Allowed operations

| Operation | Permitted? |
|-----------|------------|
| Specialize (narrow) | Yes |
| Clarify | Yes |
| Constrain (within minimums) | Yes |
| Organize (non-normative aids) | Yes |
| Extend library-wide minimums | **No** |

### 20.5 Proliferation controls

1. Supplements MUST be **enumerated** in this document or the volume governance document.
2. Each supplement MUST declare authority owned and not owned (subset of Section 8).
3. Normative effect MUST NOT widen GOV-003 or GOV-004 minimums.
4. Supplements REQUIRE governed revision like volume governance documents.
5. Production Design Standards remain normative product authority; supplements do not replace `{Standard ID}-R{nn}`.

---

## 21. Relationship to `FI-DSN-REG-001`

| Boundary | Rule |
|----------|------|
| Register role | Authoritative planning inventory per REG-001 |
| Roadmap role | Volume architecture, Primary Volume rules, sequence, entry/completion |
| No duplication | Roadmap MUST NOT duplicate REG column semantics |
| No Status control | Roadmap MUST NOT change REG **Status** |
| Primary Volume | Roadmap owns assignment rules; REG **Notes** records interim per Section 14 |
| Dependencies | REG **Dependencies** records instances per Section 15 |
| Views | Volume-filtered register views permitted; not competing inventories per OQ-DSN-004 resolution |
| Single inventory | REG-001 remains sole authoritative inventory |

---

## 22. Relationship to `FI-DSN-QUE-001`

| Boundary | Rule |
|----------|------|
| Queue role | Operational drafting sequence for admitted register rows |
| Roadmap informs | Governance-layer ordering per QUE-001 §7.2 layer 2 |
| Queue authorizes | Admission and **Execution Order** remain controlling |
| Volume earlier ≠ draft now | Earlier volume MAY have blocked standards |
| Volume completion ≠ queue drain | Independent concepts |
| No new states | This document does not add queue states or readiness labels |
| Manufacturing | `FI-MFG-*` queues remain outside design queue |
| Brain work | Queue does not schedule Brain logic per GOV-001 §11 and GOV-004 |

---

## 23. Relationship to `FI-DSN-GOV-003`

| Boundary | Rule |
|----------|------|
| Verification | Roadmap does not verify evidence |
| Categories | Volumes MAY declare evidence dependency categories in entry conditions |
| Gaps | Material evidence gaps block drafting/freeze per GOV-003; MAY block volume **Entry Ready** if volume-wide |
| Boundary labels | GOV-001 §9.4 and GOV-003 §7.10 remain controlling |
| Vendor-pending | GOV-003 §8; not disguised by volume order |
| Supplements | Volume supplements MAY add disposition detail; MUST NOT weaken GOV-003 gates |
| Volume supplements vs GOV-003 | GOV-003 controls on conflict |

---

## 24. Relationship to `FI-DSN-GOV-004`

| Boundary | Rule |
|----------|------|
| Brain authority | GOV-004 owns Brain authority boundaries |
| Roadmap role | Sequences Brain-heavy work; identifies Volume 04 `CLS-BVS` concentration |
| No algorithms | Brain algorithms PROHIBITED in roadmap |
| Capability expansion | Does not create volume authority |
| Volume 04 entry | Requires upstream governed alternatives in Volumes 02–03 |
| Compliance Boundaries | `FI-MFG-*` included per GOV-004 §13 |
| Supplements | Volume supplements MAY specialize within GOV-004 minimums only |

---

## 25. Future Volume Expansion

Per `FI-DSN-GOV-001` Section 17.1, preserved and detailed here:

| Rule | Policy |
|------|--------|
| New volumes | **07, 08, …** append only (Volume 06 added by Version 1.1 governed revision) |
| Renumbering 01–05 | **PROHIBITED** after VOL-001 Version 1.0 freeze |
| Insertion between | **PROHIBITED** — use append or volume supplement |
| Split / merge | Governed VOL-001 revision + GOV-001 §15 + impact review |
| **Archived** volumes | Number never reused |
| README | MUST update on volume addition per GOV-001 §17.1 |
| Identifier | New volume does not require new `FI-DSN-VOL-###` unless separate roadmap artifact warranted |
| Revision History | REQUIRED on VOL-001 change |

---

## 26. Roadmap Validation

Roadmap Validation is governance-level validation before freeze of this document or downstream volume-planning content. It is not implementation testing.

Before freeze, Roadmap Validation MUST pass:

| Check | Pass criterion |
|-------|----------------|
| Planning Foundation Inventory | Complete and distinct from production volumes; Section 5.4 Required categories satisfied |
| Production Volume Inventory | Volumes 01–06 defined with scope and sequence; Section 6.4 order distinctions present |
| Required Artifact category framework | Each production volume has Section 19.4 framework; each category classified Required, Optional, or Deferred |
| Volume 01 manufacturing reference | Section 19.4 references existing volume governance and applicable frozen `FI-MFG-*` accurately |
| Volume authority | Section 8 tables respected in prose |
| Ownership model | Primary Volume rules; four concepts distinguished; Section 14.1 principal-subject and tie-breaker rules |
| Primary Volume validation | No dual Primary Volume; Section 14.4 checks pass |
| Volume Status | Roadmap-only; no REG **Status** collision; foundation posture separate from Volume Status |
| Manufacturing hybrid | `FI-MFG-*` not reclassified |
| Classification | CLS-001 preserved; `CLS-BVS` not a volume |
| Dependency taxonomy | Six types with blocking matrix; Hard waivers comply with QUE-001 Section 7.5 |
| Volume 05 consistency | Entry, drafting, freeze, and completion rules aligned across Sections 11.5, 16.2, 17.2, 18.5, and 19.4 |
| Volume 06 consistency | Section 11.6 architecture; Section 6.4 dependency order; Section 19.4 provisional framework; not **Structurally Complete** or **Frozen** |
| Structurally Complete reopening | Section 10.4 rules present |
| Per-volume completion summaries | Section 18.5 present for Volumes 01–06 |
| REG boundary | No duplicate fields; interim Notes convention |
| QUE boundary | No new states; inform-only; waiver authority not overstated |
| GOV-003 / GOV-004 | No redefinition |
| Required Artifact governance | Four authorities; silent change prohibited; no normative placeholder language |
| Supplement governance | Proliferation controls present |
| Cross-references | GOV-001, CLS-001, QUE-001 section citations resolve |
| No unauthorized extensions | No new metadata, register columns, queue states, identifier families |

---

## 27. Roadmap Change Control

Changes to `FI-DSN-VOL-001` REQUIRE governed revision under `FI-DSN-GOV-001` Section 15.

The following REQUIRE version increment, impact review, review of affected REG rows and QUE posture, formal review before re-freeze, and **Revision History** entry:

- Production Volume Inventory or stable numbering policy
- Volume authority or ownership model
- Volume Status definitions
- Volume Sequence or entry/completion rules
- Required Volume Artifact sets and category frameworks (Sections 5.4 and 19.4)
- Dependency taxonomy or default blocking posture
- Supplement enumeration or proliferation rules
- Relationships with frozen GOV, REG, QUE, CLS, ID artifacts

No informal amendment through register rows, queue operations, supplements, or planning notes alone.

---

## 28. Freeze Gate

The Freeze Gate summarizes minimum conditions before `FI-DSN-VOL-001` MAY be frozen. This section does not create a new lifecycle stage.

Before freeze promotion, confirm:

- [ ] Architecture approval obtained
- [ ] Roadmap Validation pass per Section 26
- [ ] Planning Foundation Inventory complete per Section 5.4
- [ ] Per-volume Required Volume Artifact **category framework** complete per Sections 5.4 and 19.4
- [ ] Exact artifact identifiers may remain to be populated through REG only where category ownership and change authority are defined
- [ ] No unresolved normative placeholder language remains
- [ ] Production volumes 01–06 architecturally defined
- [ ] Volume authority and ownership models complete
- [ ] Primary Volume principal-subject and tie-breaker rules complete per Section 14.1
- [ ] Dual Primary Volume ownership prohibited and validated per Section 14.4
- [ ] Volume Status roadmap-only posture explicit; foundation posture separate from Volume Status
- [ ] Manufacturing hybrid model preserved
- [ ] Hard dependency waiver authority aligned to QUE-001 Section 7.5 per Section 15.4
- [ ] Volume 05 entry, drafting, freeze, and completion rules harmonized
- [ ] Structurally Complete reopening governance complete per Section 10.4
- [ ] Per-volume completion summaries present per Section 18.5 (Volumes 01–06)
- [ ] Section 6.4 numeric vs constitutional dependency order explicit for Volume 05 / Volume 06
- [ ] REG and QUE relationship boundaries preserved
- [ ] GOV-003 and GOV-004 harmonization complete
- [ ] Dependency taxonomy complete
- [ ] Required Artifact and Supplement governance complete
- [ ] All cross-references to GOV-001, CLS-001, and QUE-001 resolve
- [ ] Metadata compliance per GOV-002 — no new fields
- [ ] Identifier compliance per ID-001 — `FI-DSN-VOL-001`
- [ ] **Revision History** complete
- [ ] Material open questions resolved or confirmed nonblocking per Section 29
- [ ] No unresolved material contradiction with frozen governance

---

## 29. Open Planning Questions

### Roadmap-native questions

| ID | Question | Status | Safe default |
|----|----------|--------|--------------|
| `OQ-DSN-008` | Should **Primary Volume** become a canonical REG/GOV-002 field? | Open — architecture | Structured REG **Notes** `Primary Volume: VOL-0n` per Section 14 |
| `OQ-DSN-009` | Does each production volume require a separate volume governance document before first standard freeze, or is VOL-001 sufficient initially? Volume 06 now has explicit governance architecture (`01-creative-production-architecture.md`); Volume 06 governance-document requirement addressed through `OQ-V06-004`. Broader governance-timing posture for future volumes remains open. | Open — architecture (partially resolved for Volumes 02–06) | VOL-001 sufficient until first standard in volume enters drafting; Volume 06 architecture satisfies volume governance until Layer B authorization per `OQ-V06-004` |
| `OQ-DSN-010` | Who approves Required Volume Artifact set changes after VOL-001 Version 1.0 freeze? | Open — governance detail | Section 19 four-authority model: Required Artifact set and category changes REQUIRE governed VOL-001 revision, formal review where material, and REG reconciliation; silent change PROHIBITED |

### Resolved by post-freeze metadata reconciliation (July 29, 2026)

| ID | Status | Resolution |
|----|--------|------------|
| `OQ-V06-002` | **Closed** | `FI-DSN-CLS-002` Version 1.0 Frozen approved taxonomy expansion. `FI-DSN-CLS-001` Version 1.1 Frozen implemented `CLS-CPR` as the active classification for Creative Production Realization. `CLS-CPR` is Primary Classification affinity for Volume 06 Layer B standards when Creative Production Realization is the principal subject; Primary Volume VOL-06. `CLS-MFI` may be Secondary Classification only when Design-Time Feasibility integration is materially governed and remains subordinate. Volume 06 Layer B classification planning **complete** for Primary Classification decision. Identifier reservation **pending**; REG population **pending**; QUE admission **pending**; Layer B drafting **unauthorized**; Product Sprint 004 **unauthorized**. Classification decision does not reserve identifiers or populate REG or QUE. |

### Inherited nonblocking questions

| ID | Artifact | Status | Relevance |
|----|----------|--------|-----------|
| `OQ-CLS-001` | `FI-DSN-CLS-001` | Open; deferred to this roadmap | Section 13.1 cross-volume classification justification |
| `OQ-DSN-003` | `FI-DSN-GOV-002` | Open; deferred to Visual Source schema | Orthogonal to core volume architecture |

### Related nonblocking questions (other artifacts)

| ID | Artifact | Relevance to VOL-001 |
|----|----------|---------------------|
| `OQ-DSN-004` through `007` | `FI-DSN-GOV-004` | Brain boundary; orthogonal to volume numbering |

---

## 30. Relationship to Identifier System (`FI-DSN-ID-001`)

| Boundary | Rule |
|----------|------|
| Namespace | `FI-DSN-VOL-###` per ID-001 Section 6.3 |
| Assigned identifier | `FI-DSN-VOL-001` |
| Open questions | `OQ-DSN-###` only; no `OQ-VOL` namespace |

### 30.1 Planning identifier authorization (`FI-DSN-VOL-001`)

| Item | Record |
|------|--------|
| Namespace family | `FI-DSN-VOL-###` established by `FI-DSN-ID-001` Section 6.3 |
| Assigned identifier | `FI-DSN-VOL-001` |
| Authorization basis | Sprint D1.10 Design Volume Roadmap creation process |
| Collision verification | Verified at freeze promotion — `FI-DSN-VOL-001` was unused before assignment (July 23, 2026) |
| Scope of resolution | First `FI-DSN-VOL-###` assignment for library-wide volume architecture |

---

## 31. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.1 Draft (inventory) | August 10, 2026 | F.I. Forgot | Informative posture synchronization — Volume 01 declared **Structurally Complete** per Sprint V01-D59.1 (basis freeze Sprint V01-D57.2); Section 6.3 Volume 01 roadmap status advanced to **Structurally Complete**; completion date August 10, 2026; governing document Version 2.0 Frozen; eight frozen `FI-MFG-*` standards; `FI-MFG-POL-003` (Optional) and Operational Continuity (Deferred) nonblocking; not Entry Ready; Product Sprint 004 not authorized; Design Library incomplete; constitutional substance unchanged |
| 1.1 Draft (inventory) | August 10, 2026 | F.I. Forgot | Informative posture synchronization — Volume 06 declared **Structurally Complete** per Sprint V06-D54.2 (basis architecture §26 authorization Sprint V06-D54.1); Section 6.2 and Section 6.3 Volume 06 roadmap status advanced to **Structurally Complete**; completion date August 10, 2026; Layer B complete; not Entry Ready; Product Sprint 004 not authorized; constitutional substance unchanged |
| 1.1 Draft (metadata reconciliation) | July 29, 2026 | F.I. Forgot | Post-freeze metadata reconciliation — `OQ-V06-002` closed; `CLS-CPR` Primary Classification affinity for Volume 06; Section 11.6 and Section 19.4 classification planning posture updated; Section 29 resolution recorded; constitutional substance unchanged; Volume 06 status remains **Defined**; not Entry Ready; not Structurally Complete |
| 1.1 Draft | July 28, 2026 | F.I. Forgot | Harmonization Sprint H4.3 — correction of Volume 06 harmonization-status metadata: Section 6.3 Volume 06 notes; Section 17.2 Entry Ready posture; OQ-DSN-009; Version 1.0 Frozen baseline preserved |
| 1.1 Draft | July 28, 2026 | F.I. Forgot | Harmonization Sprint H1 — append Volume 06 Creative Production to Production Volume Inventory; Section 6.4 numeric vs constitutional dependency vs lifecycle order; Section 11.6 architecture; Volume Sequence and entry/completion updates; Section 19.4 provisional Required category planning posture; Roadmap Validation and Freeze Gate updates; governed revision pending independent review — not re-frozen |
| 1.0 | July 23, 2026 | F.I. Forgot | Frozen — promoted to Frozen Design Volume Roadmap; Formal Freeze Review passed; identifier collision verified; `OQ-CLS-001`, `OQ-DSN-003`, `OQ-DSN-008`, `OQ-DSN-009`, and `OQ-DSN-010` remain deferred |
| 0.2 Draft | July 23, 2026 | F.I. Forgot | Sprint D1.10 refinement — per-volume Required Artifact category frameworks (Sections 5.4, 18.4, 19.4); Primary Volume principal-subject tie-breaker and ownership validation (Section 14); Hard dependency waiver alignment to QUE-001 Section 7.5 (Section 15.4); foundation posture separated from Volume Status; Volume 05 entry/completion harmonization; Structurally Complete reopening rules (Section 10.4); per-volume completion summaries (Section 18.5); expanded Roadmap Validation and Freeze Gate; cross-reference corrections |
| 0.1 Draft | July 23, 2026 | F.I. Forgot | Sprint D1.10 — initial Design Volume Roadmap (`FI-DSN-VOL-001`) draft: Planning Foundation and Production Volume inventories; volume authority and ownership models; roadmap Volume Status; volumes 01–05 architecture; manufacturing hybrid model; classification relationship; Primary Volume interim mechanism; six-type dependency taxonomy; entry and completion conditions; Required Artifact and Supplement governance; REG/QUE/GOV-003/GOV-004 relationships; future expansion; validation and gates |

### Future revision notes

Revisions after freeze require documented change control under Section 27 and `FI-DSN-GOV-001` Section 15. Conditions that would trigger a new governance version and freeze review include: change to stable volume numbering, volume authority model, Required Artifact category frameworks, or REG/QUE boundary rules.

---

**End of Document**
