# F.I. Forgot Design Library — Volume 06

# Artifact Realization Governance Standard

## Document Control

| Field | Value |
|-------|-------|
| **Standard ID** | `FI-DSN-STD-013` |
| **Disposition** | Design Standard (`STD`) |
| **Primary Classification** | `CLS-CPR` — Creative Production Realization |
| **Secondary Classification** | None |
| **Primary Volume** | 06 — Creative Production |
| **Architectural domain** | Domain 2 — Artifact Realization Authority |
| **Document** | `03-artifact-realization-governance-standard.md` |
| **Status** | Partial Requirement Draft |
| **Version** | 0.2 Draft |
| **Date** | July 29, 2026 |
| **Freeze date** | — |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Approval status** | Not approved |
| **Binding status** | Not binding |
| **Register posture** | `Architecture Draft` (`FI-DSN-REG-001`) — partial normative body drafted |
| **Queue posture** | EO 19 — **In progress** (`FI-DSN-QUE-001`) |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Parent architecture** | `playbook/design/volume-06-creative-production/01-creative-production-architecture.md` — Creative Production Architecture (Frozen Volume Governance, Version 1.0, July 29, 2026) |
| **Volume roadmap** | `FI-DSN-VOL-001` — Design Volume Roadmap (Frozen Design Volume Roadmap, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Version 1.1 Frozen, July 29, 2026) |
| **Classification expansion reference** | `FI-DSN-CLS-002` — Classification Expansion Decision (Version 1.0 Frozen) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Register reference** | `FI-DSN-REG-001` — Design Planning Register (Frozen Planning Register, Version 1.0, July 22, 2026) |
| **Queue reference** | `FI-DSN-QUE-001` — Design Drafting Queue (Frozen Design Drafting Queue, Version 1.0, July 23, 2026) |
| **Epistemic reference** | `FI-DSN-GOV-003` — Evidence vs Company Judgment Governance (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Brain authority reference** | `FI-DSN-GOV-004` — Brain Authority Boundary (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Upstream Volume 06 standard** | `FI-DSN-STD-012` — Production Intent and Program Governance Standard (Frozen Design Standard, Version 1.0, July 29, 2026) |
| **Upstream philosophy** | `FI-DSN-PRN-001` — Visual Philosophy Standard (Frozen Design Principle, Version 1.0, July 24, 2026) |
| **Upstream Volume 02 standards** | `FI-DSN-STD-001` — Brand Expression Standard; `FI-DSN-STD-002` — Typography Standard; `FI-DSN-STD-003` — Composition Standard (Frozen, Version 1.0) |
| **Upstream Volume 03 standards** | `FI-DSN-STD-004` — Card Architecture Standard; `FI-DSN-STD-005` — Surface Spatial Allocation Standard; `FI-DSN-STD-006` — Envelope and Exterior Presentation Standard (Frozen, Version 1.0) |
| **Upstream Volume 04 standards** | `FI-DSN-STD-007` — Brain Visual Selection Standard; `FI-DSN-STD-008` — Occasion and Emotional Context Standard; `FI-DSN-STD-009` — Personalization Policy Standard (Frozen, Version 1.0) |
| **Manufacturing reference** | Applicable frozen `FI-MFG-*` standards per Volume 01 — Compliance Boundary inputs only |
| **Downstream Volume 06 standards (deferred)** | `FI-DSN-STD-014` — Production Readiness Review and Approval Standard (`Reserved, Not Drafted`); `FI-DSN-STD-015` — Governed Handoff Standard (`Reserved, Not Drafted`) |
| **Supporting facts** | None — company judgment standard |
| **Vendor questions** | None |

**Standard statement:** F.I. Forgot maintains **one authoritative Artifact Realization Governance** standard that governs how Exploration Posture is operated and how visual artifacts are brought into governed existence as Realized Visual Artifacts under governed Production Obligations and applicable upstream Compliance Boundaries after Exploration-Entry Authorization — including RVA existence, iteration and version discipline, method-neutral realization paths, and provenance handoff obligations sufficient for downstream Review — without granting Governed Production-Ready status, Review Determinations, Governed Handoff, collection membership, or manufacturing authority.

**Source basis:** Company judgment per `FI-DSN-GOV-003`. Applicable frozen `FI-MFG-*` obligations are consumed as Compliance Boundary inputs only. This standard is not derived from product implementation, vendor facts, Brain runtime behavior, or engineering workflow design.

---

## 1. Purpose

This standard is the **normative and constitutional foundation** for F.I. Forgot Volume 06 Domain 2 — Artifact Realization Authority under `CLS-CPR`. Normative requirements **`FI-DSN-STD-013-R01` through `FI-DSN-STD-013-R16`** are drafted for planning groups **G1**, **G8**, and **G2** only. Groups **G3** through **G10** and **Brain Interaction** remain undrafted. This document does not claim full requirement completeness, approval, freeze, binding authority, or readiness for independent full constitutional review.

It answers the **locked governing question**:

> How shall F.I. Forgot govern Exploration Posture and artifact Realization under governed Production Obligations and applicable upstream Compliance Boundaries after Exploration-Entry Authorization, including Realized Visual Artifact existence, iteration and version discipline, method-neutral realization paths, and provenance handoff obligations sufficient for downstream Review, without granting Governed Production-Ready status, Review Determinations, Governed Handoff, collection membership, or manufacturing authority?

**Governing-question lock:** This question is locked for subsequent STD-013 drafting unless a separately authorized amendment sprint changes it.

Version 0.2 is a **Partial Requirement Draft**: normative requirements **R01** through **R16** govern planning groups **G1**, **G8**, and **G2** only. Groups **G3** through **G10** and **Brain Interaction** remain undrafted; the full normative body is incomplete. Full-body independent requirement review and freeze remain unauthorized. Constitutional architecture from Sprint V06-D2.0 and V06-D2.1 remains authoritative for undrafted scope. This standard does not replace frozen Volume 06 Creative Production Architecture, frozen `FI-DSN-STD-012`, frozen upstream Volumes 01–04 standards, frozen `FI-DSN-GOV-004`, or deferred `FI-DSN-STD-014` and `FI-DSN-STD-015`.

---

## 2. Scope

### 2.1 Principal subject

This standard governs **Artifact Realization** — the constitutional decision structure for:

- **Exploration Posture operation** — governed exploration after valid Exploration-Entry Authorization
- **Realization commitment** — when and how Realization may commence for a defined obligation scope
- **Realized Visual Artifact (RVA) existence** — constitutional criteria for governed artifact existence
- **RVA state, identity, and version discipline** — attribution, lineage, and distinguishability from GPRA
- **Iteration and rework** — successor versions within obligation bounds
- **Method-neutral realization paths** — created, generated, commissioned, and licensed or acquired intake
- **Realization provenance handoff** — obligations reconcilable with `FI-DSN-GOV-002` without schema invention

### 2.2 In scope

- Exploration Posture boundaries, operation, and exit toward Realization
- Realization entry conditions after governed exploration posture
- RVA existence, identity, versioning, supersession, and invalidation at the realization layer
- Iteration and rework posture within Production Obligation scope
- Method-neutral equivalence of realization paths including licensed or acquired intake (Volume 06 P8, §11.1)
- Consumption of Current Program, Production Obligations, and Exploration-Entry Authorization from `FI-DSN-STD-012`
- Provenance handoff posture toward `FI-DSN-GOV-002` without owning metadata schemas
- Review-entry readiness outputs for `FI-DSN-STD-014`
- Principal-subject placement and deferral within Volume 06 Domain 2
- Brain interaction boundaries within realization scope per `FI-DSN-GOV-004`
- Auditability of material Domain 2 decisions

### 2.3 Out of scope

See Section 10.

---

## 3. Definitions

Terms needed by **R01** through **R16** support the partial normative body drafted for **G1**, **G8**, and **G2**. Additional Domain 2 terms associated with **G3** through **G10** and **Brain Interaction** remain subject to later requirement drafting. This section does not claim full normative definition completion.

| Term | Definition |
|------|------------|
| **Authorized Exploration Posture** | A governed Domain 2 exploration state operating under valid Exploration-Entry Authorization for a defined obligation scope — distinct from Exploration-Entry Authorization itself |
| **Exploration Posture** | A non-final evaluation state for proposed directions before or during Realization commitment — distinct from GPRA, collection membership, or manufacturing authorization |
| **Licensed or Acquired Intake** | Externally sourced visual material entering Realization as an RVA candidate under the same constitutional path as created material — not a separate lifecycle (Volume 06 §11.1) |
| **Realization Commitment** | The governed Domain 2 decision that Realization may proceed for a defined Production Obligation scope after applicable exploration posture requirements are satisfied |
| **Realized Visual Artifact (RVA)** | A visual artifact that exists as the output of Realization but has not received Governed Production-Ready Approval — post-realization, pre-approval constitutional state |
| **Realization Traceability Package** | The governed constitutional record sufficient for downstream Review to evaluate an RVA without granting Review authority |
| **Review-Entry Readiness** | The governed posture that an RVA and its traceability package are sufficient for `FI-DSN-STD-014` to commence Review without Domain 2 granting Review outcomes |
| **RVA Candidate** | A proposed or emerging visual artifact under evaluation for governed RVA existence within an obligation scope |
| **RVA Invalidated** | An RVA that no longer satisfies governing law or bound Compliance Boundaries for forward realization authority |
| **RVA Superseded** | An RVA replaced for forward governance by a successor RVA version or governed succession rule within the same obligation scope |
| **RVA Version Lineage** | The governed traceable sequence of RVA versions attributable to one Production Obligation |
| **Shared-Source Linkage** | An explicit governed record that one realization outcome intentionally satisfies more than one bounded Production Obligation — permitted only under governed rules (Volume 06 §5.12; `OQ-STD-013-004`) |

Inherited terms from `FI-DSN-STD-012` and Volume 06 architecture — including **Current Program**, **Production Obligation**, **Exploration-Entry Authorization**, **Compliance Boundary**, and **Exploration-Entry Determination** — retain their authoritative meanings and are consumed, not redefined, by this standard.

---

## 4. Constitutional Inheritance

This section documents inherited constitutional authority. It does not reinterpret frozen Volume 06 architecture, `FI-DSN-GOV-004`, frozen `FI-DSN-STD-012`, or upstream standards beyond acknowledgment.

### 4.1 Permanent constitutional distinctions

The following distinctions are **permanent** and govern interpretation of this standard:

| Distinction | Rule |
|-------------|------|
| Exploration-Entry Authorization is not Exploration Posture operation | `FI-DSN-STD-012` authorizes entry; this standard governs operation |
| Exploration Posture is not GPRA | Volume 06 P2 — exploration is not approval |
| RVA existence is not GPRA | A realized artifact is not Governed Production-Ready |
| RVA is not a Review Determination | Realization output is not a Review outcome |
| RVA is not collection membership | Membership is Volume 05 / `FI-DSN-STD-010` authority |
| RVA is not Manufacturing Validation | Manufacturability evaluation is Domain 3 / Volume 01 boundary |
| Licensed intake is not a separate lifecycle | Externally sourced material enters at Realization (§11.1) |
| Method-neutral governance is not method prescription | P8 without prescribing tools, prompts, or pipelines |
| Provenance obligation is not metadata schema ownership | P9 / `FI-DSN-GOV-002` boundary |
| Brain-informed input is not Brain approval | P7 / `FI-DSN-GOV-004` boundary |
| Identity permission is not artifact existence | Volume 02 permission is not RVA existence |
| Waiver Authority is not exploration-posture waiver effect | Domain 1 waiver posture is governed by `FI-DSN-STD-012`; Domain 2 records consumption only |

### 4.2 Inherited authority

| Inherited source | What this standard inherits |
|------------------|----------------------------|
| **Volume 06 Creative Production Architecture** | Domain 2 assignment; P1–P11; Stage Governance Matrix; exploration and realization stages; method independence; shared-artifact posture |
| **`FI-DSN-STD-012`** | Hard predecessor — Current Program, Production Obligations, Exploration-Entry Authorization, bound Compliance Boundaries, Waivers, Exceptions, and Unresolved Constraints |
| **`FI-DSN-GOV-004`** | Decision-stage versus runtime distinction; Compliance Boundary model; prohibition on runtime policy amendment |
| **Volume 02 Visual Design Architecture and frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`–`003`** | Visual permission and identity eligibility as Compliance Boundary inputs |
| **`FI-DSN-STD-004`–`006`** | Structural, spatial, and exterior presentation limits as Compliance Boundary inputs |
| **`FI-DSN-STD-007`–`009`** | Contextual selection, occasion semantics, and personalization policy as Compliance Boundary inputs when applicable |
| **Applicable frozen `FI-MFG-*`** | Design-time producibility limits as Compliance Boundary inputs |
| **`FI-DSN-GOV-002`** | Provenance consumption boundary — handoff obligations only; not schema ownership |

### 4.3 Non-ownership under inheritance

This standard does **not** inherit authority to redefine Declared Production Intent, Production Program structure, Production Obligation establishment, exploration-entry authorization, governed waiver posture (`FI-DSN-STD-012`), production-readiness Review or Approval (`FI-DSN-STD-014`), Governed Handoff (`FI-DSN-STD-015`), collection membership (`FI-DSN-STD-010`, `FI-DSN-STD-011`), contextual selection (`FI-DSN-STD-007`), metadata field semantics (`FI-DSN-GOV-002`), Brain runtime behavior, or manufacturing operational policy.

#### Normative requirements — Constitutional Inheritance (G1)

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-013-R01` | This standard SHALL NOT contradict frozen Volume 06 Creative Production Architecture P1–P11 or the validated Artifact Realization Governance architecture for Domain 2 — including the locked governing question, principal-subject placement model, constitutional distinctions, and authority boundaries expressed in this standard. | Company judgment |
| `FI-DSN-STD-013-R02` | This standard SHALL remain reconcilable with frozen `FI-DSN-PRN-001`, `FI-DSN-STD-001`, `FI-DSN-STD-002`, `FI-DSN-STD-003`, `FI-DSN-STD-004`, `FI-DSN-STD-005`, `FI-DSN-STD-006`, `FI-DSN-STD-007`, `FI-DSN-STD-008`, `FI-DSN-STD-009`, and `FI-DSN-STD-012`. Artifact Realization Governance SHALL NOT weaken, replace, or silently override upstream visual permission, surface structure, spatial allocation, exterior presentation, contextual selection policy, personalization policy, identity eligibility, or governed Domain 1 outputs. | Company judgment |
| `FI-DSN-STD-013-R03` | Artifact Realization Governance SHALL consume applicable frozen `FI-MFG-*` obligations only as Compliance Boundary inputs during realization governance. This standard SHALL NOT restate manufacturing operational policy, Manufacturing Validation, or Fulfillment Execution. | Company judgment |
| `FI-DSN-STD-013-R04` | This standard SHALL govern Decision-stage Domain 2 realization policy only. It SHALL NOT author or prescribe as normative requirements: metadata field schemas, DAM workflows, APIs, databases, queue jobs, prompt templates, ranking models, image-generation configuration, product UI behavior, Brain algorithms, or engineering implementation architectures. | Company judgment |
| `FI-DSN-STD-013-R05` | Artifact Realization Governance SHALL govern Decision-stage Domain 2 decisions whose principal subject is Exploration Posture operation, Realization commitment, RVA existence, RVA state and version discipline, iteration and rework within realization, method-neutral realization paths, or realization provenance handoff under `CLS-CPR`. This standard SHALL preserve the permanent constitutional distinctions expressed in Section 4.1. | Company judgment |
| `FI-DSN-STD-013-R06` | Artifact Realization Governance SHALL defer authority for the following subjects to their authoritative owners when those subjects are principal: Declared Production Intent, Production Program structure, Production Obligation establishment, Compliance Boundary binding, exploration-entry authorization, and governed waiver posture (`FI-DSN-STD-012`); production-readiness Review, Approval, GPRA status, rejection, rework authorization at Review, and revocation (`FI-DSN-STD-014`); Governed Handoff (`FI-DSN-STD-015`); contextual selection and authorized alternatives (`FI-DSN-STD-007`); occasion and emotional context semantics (`FI-DSN-STD-008`); personalization policy (`FI-DSN-STD-009`); collection admission and permanent membership (`FI-DSN-STD-010`, `FI-DSN-STD-011`); visual permission and identity eligibility (Volume 02); surface structure, spatial allocation, and exterior presentation (`FI-DSN-STD-004`–`006`); metadata field semantics and provenance schema ownership (`FI-DSN-GOV-002`); Brain approval and GPRA grant (`FI-DSN-GOV-004`; Volume 06 Domain 3); manufacturing operational policy (`FI-MFG-*`); and engineering implementation. | Company judgment |

---

## 5. Governing Requirements

### 5.1 Principal-subject placement

A decision belongs to Artifact Realization Governance when Exploration Posture operation, Realization commitment, RVA existence, RVA state and version discipline, iteration and rework within realization, method-neutral realization paths, or realization provenance handoff is the **principal normative subject**.

| Step | Question | If yes → |
|------|----------|----------|
| 1 | Is Exploration Posture operation, Realization commitment, RVA state, iteration within realization, method-neutral realization path, or realization provenance handoff principal? | Candidate `CLS-CPR` / Domain 2 |
| 2 | Is Declared Production Intent, Program structure, Obligation establishment, Compliance Boundary binding, exploration-entry authorization, or waiver posture principal? | Defer to `FI-DSN-STD-012` |
| 3 | Is production-readiness Review, Approval, GPRA, rejection, or revocation principal? | Defer to `FI-DSN-STD-014` |
| 4 | Is Governed Handoff or library intake principal? | Defer to `FI-DSN-STD-015` |
| 5 | Is contextual selection or authorized alternatives principal? | Defer to `FI-DSN-STD-007` |
| 6 | Is permanent collection membership or collection lifecycle principal? | Defer to `FI-DSN-STD-010`, `FI-DSN-STD-011` |
| 7 | Is visual permission or identity eligibility principal? | Volume 02 |
| 8 | Is surface structure, spatial allocation, or exterior geometry principal? | Volume 03 |
| 9 | Is metadata schema or field semantics principal? | `FI-DSN-GOV-002` |
| 10 | Is manufacturing execution or fulfillment principal? | Volume 01 / `FI-MFG-*` / engineering |

When steps conflict, **principal normative subject** per `FI-DSN-VOL-001` Section 14.1 governs.

---

## 6. Design Requirements

### 6.1 Domain 1 consumption (G8)

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-013-R07` | Domain 2 activity governed by this standard MAY proceed for a defined obligation scope only when a valid **Current Program** posture exists, applicable **Production Obligations** are known for that scope, and governed **Exploration-Entry Authorization** exists for that scope per `FI-DSN-STD-012-R40`. | Company judgment |
| `FI-DSN-STD-013-R08` | Artifact Realization Governance SHALL consume governed Domain 1 outputs — including Current Program posture, Production Obligations, bound Compliance Boundaries, Exploration-Entry Authorization, Waivers, Exceptions, and Unresolved Constraints — without silently reinterpreting, erasing, or elevating Domain 1 decisions per `FI-DSN-STD-012-R41`. **Program Superseded** and **Program Invalidated** programs SHALL NOT support new Domain 2 activity for affected forward governance. | Company judgment |
| `FI-DSN-STD-013-R09` | Applicable Domain 1 **Waivers** and **Unresolved Constraints** affecting realization eligibility SHALL be consumed from governed Domain 1 records and explicitly reflected in Domain 2 posture. This standard SHALL NOT create, approve, redefine, or substitute for Domain 1 **Waiver Authority**, Production Obligation establishment, or Exploration-Entry Determination. | Company judgment |
| `FI-DSN-STD-013-R10` | Domain 2 activity governed by this standard SHALL remain traceable to the governing Domain 1 authorization basis for the affected obligation scope and SHALL be reconsidered when that governing basis materially changes under applicable `FI-DSN-STD-012` requirements. | Company judgment |

### 6.2 Exploration Posture operation (G2)

| Req ID | Requirement | Source |
|--------|-------------|--------|
| `FI-DSN-STD-013-R11` | **Exploration Posture** operation MAY begin for a defined obligation scope only after valid **Exploration-Entry Authorization** exists for that scope. Exploration Posture SHALL remain a non-final evaluation state and SHALL NOT grant GPRA status, collection membership, Manufacturing Validation, Manufacturing Execution, publication, Fulfillment, Review Determination, or Governed Handoff authority. | Company judgment |
| `FI-DSN-STD-013-R12` | Exploration Posture operation SHALL be recorded in governed documentary evidence sufficient to reconstruct scope, governing basis, and exploration posture for affected Production Obligations. | Company judgment |
| `FI-DSN-STD-013-R13` | **Exploration Active** posture SHALL represent governed performance of Exploration Posture operation under valid Exploration-Entry Authorization for a defined scope. | Company judgment |
| `FI-DSN-STD-013-R14` | **Exploration-posture waiver effect** MAY permit Exploration Posture operation to be bypassed for an authorized scope only when applicable Domain 1 waiver posture governed by `FI-DSN-STD-012` supports bypass of exploration requirements for that scope. Exploration-posture waiver effect SHALL consume valid upstream waiver posture, SHALL NOT create or substitute for Domain 1 **Waiver Authority**, and SHALL NOT self-authorize bypass without such upstream posture. **Exploration Waived** is a distinct authorized path to **Exploration Exit Ready** and SHALL NOT imply a reverse transition to **Exploration Active** without a new governed Domain 2 determination. | Company judgment |
| `FI-DSN-STD-013-R15` | **Exploration Exit Ready** posture SHALL exist for a defined Production Obligation scope only when documentary evidence establishes that applicable Domain 1 Waivers and Unresolved Constraints have been consumed consistent with `FI-DSN-STD-013-R08` and `FI-DSN-STD-013-R09` without reinterpretation by this standard, and either sufficient exploration direction exists for that scope to support downstream Realization eligibility on the **Exploration Active** path, or valid exploration-posture waiver effect under `FI-DSN-STD-013-R14` applies for that scope on the **Exploration Waived** path. Exploration Exit Ready is not Realization Commitment, RVA existence, GPRA status, Review Determination, Governed Handoff, collection membership, or manufacturing authority. | Company judgment |
| `FI-DSN-STD-013-R16` | **Exploration Active** posture alone SHALL NOT authorize Realization Commitment, RVA existence, or GPRA status. Exploration Posture SHALL NOT silently promote to RVA or GPRA. Material changes to Domain 1 governing basis for the scope SHALL trigger reconsideration of governed Exploration Posture records under applicable `FI-DSN-STD-012` and `FI-DSN-STD-013-R10` requirements. | Company judgment |

**Undrafted groups:** G3 (Realization entry), G4 (RVA existence), G5 (RVA state and versioning), G6 (iteration and rework), G7 (method neutrality), G9 (provenance handoff), G10 (supersession, invalidation, Review handoff), and Brain Interaction remain unauthorized in this partial draft.

---

## 7. Positive Authority

When principal subject placement routes to Domain 2, this standard is the positive constitutional authority for:

| Subject | Architectural posture |
|---------|----------------------|
| Exploration Posture operation | Boundaries, duration posture, exit, and distinction from GPRA |
| Realization entry | Commitment conditions after exploration posture |
| RVA existence | Constitutional criteria for governed artifact existence |
| RVA state and identity discipline | Versioning, attribution, continuity |
| Iteration and rework | Successor versions within obligation scope |
| RVA supersession and invalidation | Realization-layer lifecycle termination |
| Method neutrality | Equivalence of created, generated, commissioned, and licensed paths |
| Obligation and Current Program consumption | Domain 1 outputs consumed without reinterpretation |
| Provenance handoff posture | Toward GOV-002 without schema invention |
| Downstream Review entry readiness | RVA outputs for STD-014 without granting Review |
| Brain interaction within realization | Informing inputs within GOV-004 bounds |
| Auditability | Material Domain 2 decisions reconstructable |

---

## 8. Authority Exclusions

This standard does **not** own:

| Subject | Authoritative owner |
|---------|---------------------|
| Declared Production Intent, Production Program, Production Obligation establishment | `FI-DSN-STD-012` |
| Exploration-Entry Authorization and Exploration-Entry Determination | `FI-DSN-STD-012` |
| Waiver, Exception, and Unresolved Constraint governance at Domain 1 | `FI-DSN-STD-012` |
| Production-readiness Review, Review Determination, GPRA grant | `FI-DSN-STD-014` |
| Rejection, rework authorization at Review layer, revocation | `FI-DSN-STD-014` |
| Design-Time Feasibility as a Review dimension | `FI-DSN-STD-014` |
| Governed Handoff and Handoff Posture | `FI-DSN-STD-015` |
| Permanent collection membership and collection lifecycle | `FI-DSN-STD-010`, `FI-DSN-STD-011` |
| Contextual selection and authorized alternatives | `FI-DSN-STD-007` |
| Visual permission and identity eligibility | Volume 02 |
| Surface structure and spatial allocation | Volume 03 |
| Metadata field semantics and provenance schema | `FI-DSN-GOV-002` |
| Manufacturing operational policy, validation mechanics, fulfillment | Volume 01 / `FI-MFG-*` |
| Brain GPRA grant and approval authority | `FI-DSN-GOV-004` / Domain 3 |
| Product implementation architecture | Engineering specifications |

---

## 9. Upstream Dependencies

### 7.1 Hard predecessor

| Dependency | Posture | Consumption |
|------------|---------|-------------|
| **`FI-DSN-STD-012`** | Version 1.0 Frozen | Hard predecessor — Current Program, Production Obligations, Exploration-Entry Authorization, bound Compliance Boundaries, and governed Domain 1 outputs per `FI-DSN-STD-012-R40` |

Realization governance may not bypass valid Exploration-Entry Authorization for the applicable defined scope.

### 7.2 Compliance Boundary inheritance

| Source | Role |
|--------|------|
| `FI-DSN-PRN-001`, `FI-DSN-STD-001`–`003` | Visual permission and identity eligibility |
| `FI-DSN-STD-004`–`006` | Structural, spatial, and exterior presentation limits |
| `FI-DSN-STD-007`–`009` | Contextual selection, occasion, and personalization constraints |
| Applicable frozen `FI-MFG-*` | Design-time producibility limits — Compliance Boundary only |
| `FI-DSN-GOV-002` | Provenance consumption boundary |
| `FI-DSN-GOV-004` | Decision-stage and Brain authority boundary |

This standard binds and consumes upstream limits. It does not restate or rewrite upstream law.

### 7.3 Principal-subject placement test

| Step | Question | If yes → |
|------|----------|----------|
| 1 | Is Exploration Posture operation, Realization commitment, RVA state, iteration within realization, method-neutral realization path, or realization provenance handoff principal? | Candidate `CLS-CPR` / Domain 2 |
| 2 | Is Declared Production Intent, Program structure, Obligation establishment, Compliance Boundary binding, exploration-entry authorization, or waiver posture principal? | Defer to `FI-DSN-STD-012` |
| 3 | Is production-readiness Review, Approval, GPRA, rejection, or revocation principal? | Defer to `FI-DSN-STD-014` |
| 4 | Is Governed Handoff or library intake principal? | Defer to `FI-DSN-STD-015` |
| 5 | Is contextual selection or authorized alternatives principal? | Defer to `FI-DSN-STD-007` |
| 6 | Is permanent collection membership or collection lifecycle principal? | Defer to `FI-DSN-STD-010`, `FI-DSN-STD-011` |
| 7 | Is visual permission or identity eligibility principal? | Volume 02 |
| 8 | Is surface structure, spatial allocation, or exterior geometry principal? | Volume 03 |
| 9 | Is metadata schema or field semantics principal? | `FI-DSN-GOV-002` |
| 10 | Is manufacturing execution or fulfillment principal? | Volume 01 / `FI-MFG-*` / engineering |

When steps conflict, **principal normative subject** per `FI-DSN-VOL-001` Section 14.1 governs.

---

## 10. Out of Scope

| Subject | Reason excluded | Authoritative home |
|---------|-----------------|-------------------|
| Production Intent, Program, Obligation declaration | Domain 1 subject | `FI-DSN-STD-012` |
| Exploration-Entry Authorization | Domain 1 subject | `FI-DSN-STD-012` |
| Review dimensions and Review Determination | Domain 3 subject | `FI-DSN-STD-014` |
| GPRA grant, rejection, revocation | Domain 3 subject | `FI-DSN-STD-014` |
| Governed Handoff | Domain 3 subject | `FI-DSN-STD-015` |
| Collection membership | Volume 05 subject | `FI-DSN-STD-010`, `011` |
| Manufacturing Validation and execution | Operational subject | Volume 01; `FI-MFG-*` |
| Metadata schemas, field definitions | Schema subject | `FI-DSN-GOV-002` |
| Brain algorithms, prompts, ranking, generation jobs | Runtime subject | Brain Architecture; `FI-DSN-GOV-004` |
| APIs, databases, DAM workflows, studio screens | Implementation subject | Engineering |

---

## 11. Lifecycle and State Model

This section refines the Volume 06 Stage Governance Matrix for Domain 2. Labels describe **constitutional postures and transitions** only. They are not implementation enums, database fields, or workflow statuses.

### 11.1 Exploration posture

| Posture | Meaning |
|---------|---------|
| **Exploration Not Authorized** | No valid Exploration-Entry Authorization exists for the obligation scope — Domain 2 operation blocked |
| **Exploration Authorized** | Valid Exploration-Entry Authorization exists; Exploration Posture may be operated |
| **Exploration Active** | Authorized Exploration Posture is in governed operation for a defined scope — per `FI-DSN-STD-013-R13` |
| **Exploration Waived** | Domain 2 effect permitting Exploration Posture operation to be bypassed for the authorized scope before Realization commitment — per `FI-DSN-STD-013-R14` |
| **Exploration Exit Ready** | Sufficient direction exists to realize, or exploration-posture waiver effect applies — per `FI-DSN-STD-013-R15` |

**Exploration-posture waiver boundary:** Governed by `FI-DSN-STD-013-R14`. Exploration-posture waiver effect consumes applicable Domain 1 waiver posture under `FI-DSN-STD-012` and does not create Domain 1 **Waiver Authority**.

### 11.2 Realization and RVA posture

| Posture | Meaning |
|---------|---------|
| **Realization Committed** | Governed Realization Commitment recorded for a defined obligation scope |
| **RVA Candidate** | Proposed visual artifact under evaluation for governed RVA existence |
| **RVA Exists** | Visual artifact satisfies constitutional RVA existence criteria and is attributable to a Production Obligation |
| **RVA Iteration** | Successor version or rework within the same obligation scope |
| **RVA Superseded** | Prior RVA version replaced for forward governance within obligation scope |
| **RVA Invalidated** | RVA no longer satisfies governing law or bound Compliance Boundaries for forward authority |

### 11.3 Downstream transition

| Posture | Meaning |
|---------|---------|
| **Review-Entry Ready** | RVA and Realization Traceability Package are sufficient for `FI-DSN-STD-014` to commence Review — Domain 2 does not grant Review outcomes |

### 11.4 Permissible conceptual relationships

```
Exploration Not Authorized
        ↓ (valid Exploration-Entry Authorization from STD-012)
Exploration Authorized → Exploration Active → Exploration Exit Ready
Exploration Authorized → Exploration Waived → Exploration Exit Ready
        ↓ (Exploration Exit Ready)
Realization Committed → RVA Candidate → RVA Exists
        ↓
RVA Iteration → RVA Superseded / RVA Invalidated
        ↓ (Review-Entry Ready — not Review Pass)
FI-DSN-STD-014 Review (deferred authority)
```

**Exploration path clarification:**

- **Exploration Active** represents performance of governed Exploration Posture operation under valid Exploration-Entry Authorization.
- **Exploration Waived** represents a governed Domain 2 effect permitting Exploration Posture operation to be bypassed for the authorized scope — distinct from Exploration-Entry Authorization (`FI-DSN-STD-012`) and distinct from Domain 1 Waiver Authority (`FI-DSN-STD-012`).
- A reverse transition from **Exploration Waived** to **Exploration Active**, or from **Exploration Active** to **Exploration Waived**, is **not** implied by this architecture.
- Detailed transition conditions for Realization Commitment remain for G3 normative drafting. Exploration-posture waiver eligibility and Exit Ready are governed by `FI-DSN-STD-013-R14` and `FI-DSN-STD-013-R15`.

Domain 2 postures do not grant GPRA, collection membership, manufacturing authority, or Handoff authority.

### 11.5 Shared-artifact posture

Volume 06 architecture §5.12 permits one realization outcome to satisfy more than one Production Obligation only through **explicit Shared-Source Linkage** under governed rules. Default posture: one RVA or GPRA satisfying more than one obligation is not permitted. Resolution of governed linkage conditions is owned by `OQ-STD-013-004` and will be addressed in normative drafting without inventing implementation structures.

---

## 12. Requirement Planning Architecture

Planning groups for normative requirement drafting. **G1**, **G8**, and **G2** are drafted (`FI-DSN-STD-013-R01`–`R16`). **G3** through **G10** and **Brain Interaction** remain undrafted.

| Group | Principal subject | Draft status |
|-------|------------------|--------------|
| **G1** | Constitutional inheritance, Domain 2 placement, `FI-DSN-STD-012` consumption gate, Volume 06 P1–P11 alignment | **Drafted** — `R01`–`R06` |
| **G8** | Program and obligation consumption — Current Program rule; no Domain 1 reinterpretation | **Drafted** — `R07`–`R10` |
| **G2** | Exploration Posture operation — boundaries, exit, waiver interaction, distinction from GPRA | **Drafted** — `R11`–`R16` |
| **G3** | Realization entry — commitment conditions after exploration posture | Undrafted |
| **G4** | RVA existence — constitutional criteria for governed artifact existence | Undrafted |
| **G5** | RVA state, identity, versioning, and Production Obligation attribution | Undrafted |
| **G6** | Iteration, rework, and successor RVA versions within obligation scope | Undrafted |
| **G7** | Method neutrality — created, generated, commissioned, licensed or acquired equivalence | Undrafted |
| **G9** | Provenance handoff and Domain 2 auditability — GOV-002 consumption without schema invention | Undrafted |
| **G10** | RVA supersession, invalidation, Shared-Source Linkage, and downstream Review handoff to STD-014 | Undrafted |
| **Brain Interaction** | Brain boundary within realization scope per GOV-004 | Undrafted |

---

## 13. Brain Interaction

Brain Architecture and the Writing Engine may inform realization inputs — including exploration directions and realization candidates — within frozen bounds established by this standard, `FI-DSN-STD-012`, and upstream law.

Brain Runtime and the Writing Engine do not:

- Grant Exploration-Entry Authorization
- Operate Exploration Posture as binding constitutional authority without governed Domain 2 records
- Create or substitute for governed RVA existence
- Grant GPRA status, Review Determinations, or Governed Handoff authority
- Waive Compliance Boundaries or Production Obligation preconditions
- Grant collection membership or manufacturing authority
- Silently promote an RVA to GPRA or equivalent downstream authority

Brain-derived inputs remain advisory or informative within reconcilable constitutional bounds per `FI-DSN-GOV-004`.

---

## 14. Manufacturing Considerations

Applicable frozen `FI-MFG-*` standards are consumed as Compliance Boundary inputs only. This standard does not restate manufacturing operational policy, Manufacturing Validation, or Fulfillment Execution.

Design-Time Feasibility evaluation as a Review dimension is deferred to `FI-DSN-STD-014`. Engineering implications are **deferred** to product specifications derived after freeze.

---

## 15. Method Neutrality

Volume 06 P8 requires constitutional validity across manual illustration, commissioned art, licensed intake, procedural generation, and future realization methods without constitutional redesign.

| Path | Constitutional posture |
|------|------------------------|
| **Created** | Human or governed creative production yielding an RVA candidate |
| **Generated** | Procedural or computational production yielding an RVA candidate — method not prescribed |
| **Commissioned** | Externally produced work received into Realization governance |
| **Licensed or acquired** | Externally sourced material entering at Realization as an RVA candidate — same Review and Approval path as created material (§11.1) |

Method-neutral governance describes constitutional equivalence of paths. It does not prescribe tools, prompts, workflows, models, APIs, storage systems, vendors, or engineering architectures.

---

## 16. Constitutional Inputs and Outputs

### 14.1 Inputs (conceptual)

| Input | Source |
|-------|--------|
| Current Program posture | `FI-DSN-STD-012` |
| Production Obligations | `FI-DSN-STD-012` |
| Exploration-Entry Authorization | `FI-DSN-STD-012` |
| Bound Compliance Boundaries | `FI-DSN-STD-012` + upstream Volumes 01–04 |
| Waivers and Unresolved Constraints affecting realization eligibility | `FI-DSN-STD-012` |
| Visual permission and identity limits | Volume 02 |
| Structural and spatial law | Volume 03 |
| Contextual and personalization law | Volume 04 |
| Manufacturing Compliance Boundaries | `FI-MFG-*` |
| Provenance law | `FI-DSN-GOV-002` |
| Brain authority limits | `FI-DSN-GOV-004` |

### 14.2 Outputs (conceptual)

| Output | Consumer |
|--------|----------|
| Governed Exploration Posture record | Domain 2 audit; STD-014 context |
| RVA candidate | Domain 2 evaluation |
| Production Obligation attribution | Traceability |
| RVA version lineage | Domain 2 audit; STD-014 |
| RVA state posture | STD-014 Review entry |
| Realization Traceability Package | **FI-DSN-STD-014** |
| Provenance handoff posture | GOV-002 consumers |
| Method-neutral realization record | Audit; engineering translation |
| Review-Entry Readiness posture | STD-014 — without granting Review |

These are constitutional concepts, not database records, schemas, or implementation artifacts.

---

## 17. Open Questions

| ID | Question | Status | Disposition |
|----|----------|--------|-------------|
| `OQ-STD-013-001` | When may Exploration Posture be formally waived versus required before Realization commitment? | **Resolved** | Resolved in partial draft — `FI-DSN-STD-013-R14`; waiver effect permitted only when applicable Domain 1 waiver posture supports bypass; Active exploration required otherwise |
| `OQ-STD-013-002` | What constitutes sufficient Exploration Posture exit to authorize Realization for a defined obligation scope? | **Partially resolved** | Exit Ready criteria in `FI-DSN-STD-013-R15`; Realization Commitment authorization deferred to G3 undrafted requirements |
| `OQ-STD-013-003` | How shall RVA versioning relate to Production Obligation scope when upstream Compliance Boundaries materially change? | **Open** | Owned by STD-013 — deferred to G5/G6 normative draft |
| `OQ-STD-013-004` | Under what governed conditions may one realization outcome satisfy multiple Production Obligations through explicit linkage? | **Open** | Owned by STD-013 — architecture §11.5 frames default; resolution deferred to G10 |
| `OQ-STD-013-005` | What minimum provenance handoff obligations must exist at Realization without inventing GOV-002 schemas? | **Open** | Owned by STD-013 — intersects inherited `OQ-DSN-003` |
| `OQ-DSN-003` | Inherited metadata / provenance open question | **Inherited — not owned** | STD-013 may govern handoff obligations only; must not resolve schema ownership |
| `OQ-V06-006` | Conditional Review Determination retention | **Not owned** | STD-014 domain |
| `OQ-V06-007` | Handoff Posture split vs unified | **Not owned** | STD-015 domain |

`OQ-V06-002` is closed at the constitutional layer and is not reopened.

---

## 18. Partial Requirement Draft Readiness Assessment

| Criterion | Result |
|-----------|--------|
| Locked governing question embedded | Pass |
| G1 constitutional inheritance drafted | Pass — `R01`–`R06` |
| G8 Domain 1 consumption drafted | Pass — `R07`–`R10` |
| G2 Exploration Posture operation drafted | Pass — `R11`–`R16` |
| G3 through G10 and Brain Interaction | Undrafted — as authorized |
| Continuous requirement identifiers | Pass — `R01`–`R16` |
| Authority boundaries preserved | Pass |
| Implementation independence preserved | Pass |

**Readiness determination:** **Partial Requirement Draft — Pending Independent Partial Requirement Review (G1, G8, G2)**

This document is a **Partial Requirement Draft only**. Groups G3 through G10 and Brain Interaction remain undrafted. This draft does not claim full requirement completeness, approval, freeze, binding authority, readiness for independent full constitutional review, or Product Sprint 004 readiness.

**Next validation gate:** Independent Partial Requirement Review of G1, G8, and G2 (`FI-DSN-STD-013-R01`–`R16`).

---

## 19. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.2 Partial Requirement Draft | July 29, 2026 | F.I. Forgot | Sprint V06-D2.5 — first normative requirements `FI-DSN-STD-013-R01`–`R16` for G1, G8, and G2 only; G3 through G10 and Brain Interaction undrafted; `OQ-STD-013-001` resolved; `OQ-STD-013-002` partially resolved; EO 19 remains **In progress**; not approved; not frozen; not binding; no full requirement review; no downstream drafting; no Product Sprint 004 authorization |
| 0.1 Architecture Draft | July 29, 2026 | F.I. Forgot | Sprint V06-D2.2 — initial architecture draft; locked governing question embedded; Domain 2 constitutional purpose, principal subject, ownership test, positive scope, exclusions, inputs and outputs, lifecycle model, method neutrality, Brain interaction, planning groups G1–G10, owned open questions `OQ-STD-013-001`–`005`; REG synchronized to Architecture Draft; EO 19 remains **In progress**; not approved; not frozen; not binding; no normative requirements; no downstream drafting; no Product Sprint 004 authorization |

---

**End of Document**
