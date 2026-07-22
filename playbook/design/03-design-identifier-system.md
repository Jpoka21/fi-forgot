# F.I. Forgot Design Library

# FI-DSN-ID-001 — Design Identifier System

## 1. Document Control

| Field | Value |
|-------|-------|
| **System identifier** | FI-DSN-ID-001 |
| **Title** | Design Identifier System |
| **Document** | `03-design-identifier-system.md` |
| **Sprint** | D1.4 |
| **Classification** | Frozen Identifier System |
| **Status** | Frozen Identifier System |
| **Version** | 1.0 |
| **Date** | July 22, 2026 |
| **Freeze date** | July 22, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md`; `playbook/design/01-design-standard-template.md`; `playbook/design/02-design-classification-strategy.md`; `playbook/design/README.md` |
| **Downstream consumers** | Future Design Planning Register; Drafting Queue; Volume Roadmap; Design Standards in Volumes 02 through 05 |

**Source basis:** Company judgment. This identifier architecture is an F.I. Forgot governance choice. It is not derived from vendor facts or verified evidence.

---

## 2. Purpose

This document defines the permanent **identifier architecture** for every governed Design Library artifact.

Identifiers provide durable, implementation-independent references that remain stable throughout the lifetime of the library.

The identifier system SHALL support:

- Governance
- Planning
- Templates
- Standards
- Requirement IDs
- Open questions
- Change tracking
- Cross references
- Validation
- Future Design Research integration

Identifiers answer: **What is the permanent name of this governed artifact?**

Identifiers do **not** answer:

- What subject matter a standard governs (subject classification — `CLS-*` per `FI-DSN-CLS-001`)
- What kind of standard it is (disposition — `PRN`, `STD`, `CON`, `POL`, `SYS` per `FI-DSN-GOV-001`)
- Where a file is stored (repository path)
- Whether an artifact is draft or frozen (lifecycle status)
- How an artifact is implemented (engineering specification)

This document is the **frozen identifier authority** for the F.I. Forgot Design Library. It is not a Design Standard and SHALL NOT be cited as normative visual policy.

**Status:** Frozen Identifier System, Version 1.0, effective July 22, 2026.

---

## 3. Scope

### In scope

- Identifier taxonomy and namespace definitions
- Standard identifier format and disposition families
- Requirement identifier format and inheritance rules
- Open question identifier format and lifecycle
- Revision and reserved identifier rules
- Identifier lifecycle stages
- Cross-reference conventions
- Identifier change control and validation rules
- Future Design Research cross-reference integration (reference only; Research Library governs research identifiers)

### Out of scope

- Planning Register population or ID reservation
- Drafting Queue creation or population
- Volume Roadmap creation
- Assignment of identifiers to future Design Standards, planning artifacts, or governance documents beyond illustrative nonnormative examples
- Visual design rules, classification taxonomy changes, or template section changes
- Manufacturing identifier governance (`FI-MFG-*`) — referenced for boundary only
- Research identifier authoring or namespace establishment — governed by Research Library; referenced for cross-library integration only
- Engineering specifications, APIs, databases, UI behavior, or implementation code

---

## 4. Identifier Principles

The following principles govern all identifier decisions:

1. **Single permanent identifier.** Every governed artifact SHALL have exactly one permanent identifier once assigned.
2. **Repository independence.** Identifiers SHALL NOT change because of repository location, folder name, volume placement, or filename.
3. **Implementation independence.** Identifiers SHALL NOT encode code modules, services, databases, APIs, or UI components.
4. **Status independence.** Identifiers SHALL NOT encode lifecycle status (Draft, Frozen, Reserved, Retired).
5. **Freeze stability.** Identifiers assigned at reservation or freeze SHALL remain stable after freeze unless formal identifier change control authorizes a documented exception.
6. **No reuse of retired identifiers.** Retired identifiers SHALL NOT be reassigned to a different subject.
7. **Reserved identifier traceability.** Reserved identifiers SHALL remain recorded in planning metadata even when drafting is blocked or deferred.
8. **Requirement inheritance.** Requirement IDs SHALL inherit the parent standard identifier.
9. **Identifier-first cross references.** Cross references SHALL use identifiers rather than filenames whenever practical.
10. **Title mutability.** Human-readable titles MAY change without changing identifiers.
11. **Namespace discipline.** New namespace families REQUIRE revision to this system or `FI-DSN-GOV-001` before use.
12. **No silent reassignment.** Identifier reassignment, retirement, or merge SHALL NOT occur without documented change control.

---

## 5. Identifier Taxonomy

The Design Library uses layered identifier types. Each type serves a distinct role and SHALL NOT be conflated.

| Layer | Identifier type | Pattern | Governed by | Role |
|-------|-----------------|---------|-------------|------|
| **A** | Library governance artifact | `FI-DSN-GOV-###` | This document; `FI-DSN-GOV-001` | Design Library-wide governance authorities |
| **A** | Meta-governance document | `FI-DSN-{TPL\|CLS\|ID}-###` | This document; frozen baselines | Template, classification, and identifier system documents |
| **A** | Planning artifact | `FI-DSN-{REG\|QUE\|VOL}-###` | This document | Planning registers, drafting queues, volume roadmaps |
| **B** | Design Standard | `FI-DSN-{PRN\|STD\|CON\|POL\|SYS}-###` | `FI-DSN-GOV-001` §6.4 | Normative design standards |
| **C** | Requirement | `{Full Standard ID}-R{nn}` | `FI-DSN-GOV-001` §6.5; `FI-DSN-TPL-001` | Normative requirements within a standard |
| **D** | Subject classification code | `CLS-*` | `FI-DSN-CLS-001` | Subject-matter taxonomy; not a standard ID |
| **E** | Open planning question | `OQ-{DOMAIN}-###` | This document | Persistent planning questions |
| **F** | Document revision label | `1.0`, `1.1`, `2.0` | `FI-DSN-GOV-001` §8 | Document version metadata; not an artifact ID |

### Taxonomy rules

- Layer A identifiers identify governance documents (`FI-DSN-GOV`), meta-governance documents (`FI-DSN-TPL`, `FI-DSN-CLS`, `FI-DSN-ID`), and planning artifacts (`FI-DSN-REG`, `FI-DSN-QUE`, `FI-DSN-VOL`).
- Layer B identifiers identify Design Standards in Volumes 02 through 05.
- Layer C identifiers identify requirements and SHALL NOT exist without a parent Layer B standard (except where a future governance revision explicitly allows otherwise).
- Layer D codes are classification taxonomy codes, not substitute standard identifiers.
- Layer E identifiers track unresolved planning questions across sprints and documents.
- Layer F labels track document revision history and SHALL NOT be used as cross-reference substitutes for Layers A through E.

---

## 6. Namespace Definitions

### 6.1 Design Library-wide governance namespace (`FI-DSN-GOV`)

`FI-DSN-GOV-###` is the namespace family for **Design Library-wide governance authorities**.

| Identifier | Title | Document | Status |
|------------|-------|----------|--------|
| **FI-DSN-GOV-001** | Design Standards Governance | `00-design-standards-governance.md` | Frozen |

Governance namespace pattern:

```
FI-DSN-GOV-{nnn}
```

Future `FI-DSN-GOV-###` artifacts MAY address subjects such as (nonnormative examples only):

- Evidence and Company Judgment governance
- Brain authority boundaries relative to Design Standards
- Library-wide change control
- Other cross-library Design governance

No identifiers beyond `FI-DSN-GOV-001` are assigned in this sprint.

Subject-specific visual policies remain `FI-DSN-{PRN|STD|CON|POL|SYS}-###` Design Standards with the applicable `CLS-*` subject classification. They do not use the `FI-DSN-GOV` namespace.

### 6.2 Frozen meta-governance document namespaces

The following meta-governance namespaces have frozen baseline identifiers and SHALL NOT be reassigned.

| Namespace | Identifier | Title | Document | Status |
|-----------|------------|-------|----------|--------|
| **TPL** | FI-DSN-TPL-001 | Design Standard Template | `01-design-standard-template.md` | Frozen |
| **CLS** | FI-DSN-CLS-001 | Design Classification Strategy | `02-design-classification-strategy.md` | Frozen |
| **ID** | FI-DSN-ID-001 | Design Identifier System | `03-design-identifier-system.md` | Frozen |

Meta-governance namespace pattern:

```
FI-DSN-{TPL|CLS|ID}-{nnn}
```

- `{nnn}` is a three-digit sequence within the namespace family.
- Meta-governance identifiers are assigned at document freeze and remain permanent.

### 6.3 Planning artifact namespace families

The following namespace families are **permanently established** by this document. Namespace establishment does not create the future artifacts and does not assign the first identifier in any family.

| Namespace family | Pattern | Governs |
|------------------|---------|---------|
| **REG** | `FI-DSN-REG-###` | Design Planning Registers |
| **QUE** | `FI-DSN-QUE-###` | Design Drafting Queues |
| **VOL** | `FI-DSN-VOL-###` | Design Volume Roadmaps or governed volume architecture records |

Planning artifact namespace pattern:

```
FI-DSN-{REG|QUE|VOL}-{nnn}
```

| Rule | Requirement |
|------|-------------|
| Family authority | This document establishes the namespace families only |
| Assignment | Actual identifiers are assigned only through an authorized planning or reservation process |
| No pre-assignment | No first identifier in any `REG`, `QUE`, or `VOL` family is assigned in this sprint |
| Artifact creation | Namespace establishment does not create Planning Registers, Drafting Queues, or Volume Roadmaps |

### 6.4 Frozen disposition families (Design Standards)

Disposition families are established in `FI-DSN-GOV-001` Section 6.4 and SHALL NOT be extended without governance revision.

| Disposition code | Disposition name | Standard ID pattern |
|----------------|------------------|---------------------|
| **PRN** | Design Principle | `FI-DSN-PRN-###` |
| **STD** | Design Standard | `FI-DSN-STD-###` |
| **CON** | Design Constraint | `FI-DSN-CON-###` |
| **POL** | Design Policy | `FI-DSN-POL-###` |
| **SYS** | System Architecture Standard | `FI-DSN-SYS-###` |

`###` is a three-digit sequence **per disposition family**, not global across all dispositions.

### 6.5 Subject classification codes (not standard identifiers)

Subject classification uses `CLS-*` codes defined in `FI-DSN-CLS-001`. These codes:

- Describe subject-matter ownership
- Are recorded in planning metadata alongside standard identifiers
- SHALL NOT replace or substitute for `FI-DSN-{PRN|STD|CON|POL|SYS}-###` identifiers
- SHALL NOT be prefixed with `FI-DSN-` unless a future governance revision explicitly harmonizes them

### 6.6 Related external namespaces (reference only)

The Design Library does **not** establish Research Library identifier namespaces. Future Design Research identifiers MUST be established by the applicable Research Library governance. Once established externally, Design Library documents reference those identifiers without modification. No future Design Research namespace is frozen by `FI-DSN-ID-001`.

The following namespaces are governed outside this system. Design Library documents MAY cross-reference them but SHALL NOT redefine their rules or propose new Research namespaces.

| Namespace | Pattern | Authority | Role relative to Design Library |
|-----------|---------|-----------|----------------------------------|
| **Manufacturing standards** | `FI-MFG-*` | Volume 01 manufacturing governance | Manufacturing and production policy |
| **Verified facts** | `HW-MFG-*` and other `HW-*` patterns established by Research Library | Research Library | Evidence support for standards |
| **Vendor questions** | `HW-VQ-*` | Research Library evidence audits | Nonnormative diligence |

### 6.7 Metadata field harmonization

The following terms are the **preferred metadata vocabulary** for future planning records and Design Standards.

| Field name | Values | Role |
|------------|--------|------|
| **Disposition** | `PRN`, `STD`, `CON`, `POL`, `SYS` | What kind of standard it is |
| **Subject Classification** | Collective term for `CLS-*` ownership | What subject matter the artifact governs |
| **Primary Classification** | One `CLS-*` code | Principal subject ownership per `FI-DSN-CLS-001` |
| **Secondary Classifications** | Zero to two `CLS-*` codes | Optional secondary ownership per `FI-DSN-CLS-001` |
| **Visual Source** | Future controlled values (schema not frozen) | Provenance or generation origin per `FI-DSN-CLS-001` |

### Harmonization rules

| Rule | Requirement |
|------|-------------|
| Disposition values | `PRN`, `STD`, `CON`, `POL`, and `SYS` are disposition values, not subject classifications |
| Subject classification values | `CLS-*` codes are subject classification values, not standard identifiers |
| Planning Register fields | A future Planning Register MUST use unambiguous field names from this table |
| Frozen template field | `FI-DSN-TPL-001` Document Control uses a field labeled **Classification** for disposition applicability |
| Template immutability | Because `FI-DSN-TPL-001` is frozen, this document SHALL NOT modify that field label |
| Required mapping | Future records MUST explicitly map the template **Classification** field to **Disposition**, or otherwise prevent confusion with `CLS-*` subject classification |
| Subject reclassification | Reassignment of `CLS-*` subject classification metadata does not change the governing `FI-DSN-*` document or standard identifier |
| Visual Source | Visual Source remains a separate, unfrozen attribute; no Visual Source value schema is frozen in this document |

---

## 7. Standard Identifier Format

### 7.1 Canonical format

```
FI-DSN-{DISPOSITION}-{nnn}
```

| Component | Rule |
|-----------|------|
| **Prefix** | `FI-DSN` — F.I. Forgot Design namespace |
| **Disposition** | One of `PRN`, `STD`, `CON`, `POL`, `SYS` |
| **Sequence** | Three-digit zero-padded number (`001` through `999`) scoped to the disposition family |

### 7.2 Illustrative examples (nonnormative)

The following examples explain format only. They do not reserve Standard IDs.

| Illustrative identifier | Disposition | Meaning |
|-------------------------|-------------|---------|
| `FI-DSN-PRN-001` | Design Principle | First reserved principle in the PRN family |
| `FI-DSN-POL-014` | Design Policy | Fourteenth reserved policy in the POL family |
| `FI-DSN-SYS-003` | System Architecture Standard | Third reserved system standard in the SYS family |

### 7.3 Assignment rules

| Rule | Requirement |
|------|-------------|
| Reservation authority | Standard IDs SHALL be reserved only through the future Design Planning Register |
| Permanence | Once reserved, a Standard ID is permanent for its assigned subject |
| Disposition immutability | A reserved Standard ID SHALL NOT change disposition family |
| Sequence gaps | Gaps in numbering are permitted and SHALL NOT be backfilled by renumbering |
| Absorbed candidates | Candidates absorbed into another standard SHALL NOT receive a new ID unless formally reserved; record absorption in planning metadata |

### 7.4 Distinction from other attributes

| Attribute | Example | Relationship to Standard ID |
|-----------|---------|---------------------------|
| Standard ID | `FI-DSN-POL-001` | Permanent artifact identifier |
| Disposition | `POL` | Encoded in Standard ID |
| Subject classification | `CLS-PHO` | Separate planning metadata per `FI-DSN-CLS-001` |
| Document title | Photography Usage Policy | MAY change without changing Standard ID |
| Repository path | `playbook/design/volume-05-...` | Informational only |

---

## 8. Requirement Identifier Format

### 8.1 Canonical format

Requirement identifiers are defined in `FI-DSN-GOV-001` Section 6.5 and `FI-DSN-TPL-001`.

```
{Full Standard ID}-R{nn}
```

| Component | Rule |
|-----------|------|
| **Parent** | Full Layer B Standard ID (for example, `FI-DSN-POL-001`) |
| **Separator** | Hyphen before `R` |
| **Requirement sequence** | Two-digit zero-padded number (`01` through `99`) |

### 8.2 Illustrative examples (nonnormative)

| Illustrative Req ID | Parent standard (illustrative) |
|---------------------|--------------------------------|
| `FI-DSN-STD-001-R01` | First requirement of illustrative standard `FI-DSN-STD-001` |
| `FI-DSN-POL-001-R01` | First requirement of illustrative standard `FI-DSN-POL-001` |
| `FI-DSN-POL-001-R12` | Twelfth requirement of the same illustrative standard |

### 8.3 Inheritance and numbering rules

| Rule | Requirement |
|------|-------------|
| Parent inheritance | Every Req ID SHALL include the full parent Standard ID |
| Suffix scope | `R01`, `R02`, and similar suffixes are unique **only within their parent standard** |
| Global uniqueness | The **complete** Req ID is globally unique because it inherits the full parent Standard ID (for example, `FI-DSN-STD-001-R01`) |
| Continuous numbering within parent | Req IDs SHALL number continuously across Governing Requirements and Design Requirements **within the parent standard** without resetting at section boundaries |
| Not library-wide sequence | Requirement numbering is **not** one continuous `R{nn}` sequence across the entire Design Library |
| No shortened IDs | Shortened forms such as `R01` or `POL-001-R01` are prohibited in normative text |
| Stability | Req IDs SHALL remain stable across revisions unless a formal standard revision explicitly records renumbering |
| Orphan prohibition | Req IDs SHALL NOT exist without a parent Standard ID |

The frozen requirement format `{Full Standard ID}-R{nn}` defined in `FI-DSN-GOV-001` and `FI-DSN-TPL-001` is unchanged.

### 8.4 Retirement

When a requirement is removed in a formal revision:

- The Req ID SHALL be recorded as retired in revision history
- The Req ID SHALL NOT be reassigned to a different requirement
- Surviving requirements SHALL NOT be renumbered solely because another requirement was retired or removed
- Validation SHALL confirm no active requirement reuses a retired Req ID within the same standard

---

## 9. Open Question Identifier Format

### 9.1 Canonical format

```
OQ-{DOMAIN}-{nnn}
```

| Component | Rule |
|-----------|------|
| **Prefix** | `OQ` — Open Question |
| **Domain** | Three-letter domain code identifying the owning planning area |
| **Sequence** | Three-digit zero-padded number scoped to the domain |

### 9.2 Domain code registry

| Domain code | Status | Scope |
|-------------|--------|-------|
| **DSN** | Default | Design Library-wide open planning questions |
| **CLS** | Established specialized domain | Classification strategy planning; `OQ-CLS-001` is frozen in `FI-DSN-CLS-001` and SHALL NOT be renumbered |
| **VOL** | Proposed example | Volume Roadmap planning; register only if the owning artifact requires a specialized domain |
| **REG** | Proposed example | Planning Register planning; register only if the owning artifact requires a specialized domain |

### Domain rules

| Rule | Requirement |
|------|-------------|
| Default domain | `OQ-DSN-###` is the default Design Library-wide open question namespace |
| Frozen reference | `OQ-CLS-001` remains valid and permanent |
| Specialized domains | Domain codes beyond `DSN` and `CLS` MAY be registered only through controlled change to this document or an authorized planning artifact |
| No ad hoc domains | Unlimited ad hoc domain codes are prohibited |
| Permanent identifiers | Open question identifiers remain permanent after resolution or retirement and SHALL NOT be reused |

New domain codes REQUIRE revision to this document or registration through an authorized planning artifact before use.

### 9.3 Lifecycle

| Stage | Meaning |
|-------|---------|
| **Opened** | Question recorded with `OQ-{DOMAIN}-###` identifier |
| **Active** | Question remains unresolved and nonblocking or blocking per planning metadata |
| **Deferred** | Resolution explicitly deferred to a named future sprint or artifact |
| **Resolved** | Answer recorded; identifier preserved in resolved-questions history |
| **Retired** | Question voided; identifier preserved and never reused |

Open question identifiers:

- SHALL be assigned when a planning question is expected to persist across documents or sprints
- SHALL NOT be reused after resolution or retirement
- MAY be cited in cross references preferentially over prose descriptions
- Do not encode status; record status in planning metadata

### 9.4 Reference examples (nonnormative)

| Identifier | Status | Note |
|------------|--------|------|
| `OQ-CLS-001` | Active; frozen in `FI-DSN-CLS-001` | Cross-volume classification justification; deferred to Volume Roadmap |
| `OQ-DSN-001` | Format example only | Illustrates default domain format; not assigned in this sprint |

No additional open question identifiers are assigned in this sprint.

---

## 10. Revision Identifier Rules

Document revision labels are metadata, not artifact identifiers.

| Label | Meaning | Applies to |
|-------|---------|------------|
| **1.0 Draft** | First draft under review | Governance, planning, and standard drafts |
| **1.0** | First frozen baseline | Frozen artifacts |
| **1.1** | Minor clarifications without material policy change | Frozen artifacts |
| **2.0** | Material policy change or restructuring | Frozen artifacts |

### Rules

- Revision labels SHALL NOT be used as cross-reference substitutes for `FI-DSN-*`, `CLS-*`, or `OQ-*` identifiers.
- A revision that renumbers Req IDs SHALL record affected `{Full Standard ID}-R{nn}` values in Revision History.
- A revision that retires a Standard ID SHALL record retirement in planning metadata and revision history.
- Governance artifact revisions (Layers A and this document) follow `FI-DSN-GOV-001` Section 15 change control.

---

## 11. Reserved Identifier Rules

### 11.1 Reservation

| Rule | Requirement |
|------|-------------|
| Authority | Standard ID reservation SHALL occur only through the future Design Planning Register |
| Preconditions | Classification assignment per `FI-DSN-CLS-001` SHALL precede Standard ID reservation |
| Record | Reservation SHALL record disposition, proposed title, primary `CLS-*` code, blocking dependencies, lifecycle status, and ownership when applicable |
| Permanence | Reserved IDs are permanent for their assigned subject |
| No implied advancement | Reservation does not imply draft approval, freeze approval, or normative authorship |

### 11.2 Reserved but undrafted

A reserved Standard ID MAY exist in status **Reserved, Not Drafted** per `FI-DSN-GOV-001` Section 6.1. The identifier remains traceable in planning metadata even when drafting is blocked. Abandoned or deferred reservations SHALL remain recorded and SHALL NOT be silently reused for a different subject.

### 11.3 Absorbed and consolidated candidates

When planning consolidates multiple candidates into one standard:

- The surviving standard retains its reserved ID
- Absorbed candidates SHALL NOT receive duplicate IDs
- Planning metadata SHALL record absorption with `—` or explicit consolidation note
- Absorbed subject matter SHALL NOT silently disappear from planning records

### 11.4 Retirement

| Rule | Requirement |
|------|-------------|
| Trigger | Retirement requires formal planning decision and documented change control |
| Reuse prohibition | Retired `FI-DSN-*` Standard IDs SHALL NOT be reassigned |
| Traceability | Retirement SHALL record reason, date, and superseding identifier if applicable |
| Req ID cascade | Retirement of a standard retires all child Req IDs; they SHALL NOT be reassigned |

---

## 12. Identifier Lifecycle

Identifier lifecycle aligns with `FI-DSN-GOV-001` Section 6.1 standard lifecycle. Status is recorded in planning metadata and document control; it is **not** encoded in the identifier.

| Stage | Status label | Identifier state |
|-------|--------------|------------------|
| **Candidate** | Nonbinding candidate | No Standard ID assigned |
| **Reserved** | Reserved, Not Drafted | `FI-DSN-*` ID assigned; permanent |
| **Drafting** | Drafted, Pending Freeze | Standard ID active; Req IDs assigned during drafting |
| **Partial draft** | Drafted, Pending Freeze (elements blocked) | Standard ID active; blocked elements recorded |
| **Freeze review** | Under individual freeze review | Standard ID and Req IDs stable |
| **Frozen** | Frozen | Standard ID and Req IDs authoritative |
| **Revision** | Under revision | Prior ID and Req IDs remain binding until replacement freeze |
| **Retired** | Retired | ID preserved; not reused |

### Governance and planning artifact lifecycle (Layers A and E)

| Artifact type | Typical lifecycle |
|---------------|-------------------|
| Library governance (`FI-DSN-GOV`) | Draft → Freeze review → Frozen → Under revision |
| Meta-governance documents (`FI-DSN-TPL`, `FI-DSN-CLS`, `FI-DSN-ID`) | Draft → Freeze review → Frozen → Under revision |
| Planning artifacts (`FI-DSN-REG`, `FI-DSN-QUE`, `FI-DSN-VOL`) | Draft → Freeze review → Frozen → Under revision |
| Open questions (`OQ-*`) | Opened → Active or Deferred → Resolved or Retired |

---

## 13. Cross Reference Rules

### 13.1 Preferred reference style

Cross references SHALL prefer identifiers in this order:

1. **Standard ID** — `FI-DSN-POL-001`
2. **Requirement ID** — `FI-DSN-POL-001-R03`
3. **Governance artifact ID** — `FI-DSN-CLS-001`
4. **Open question ID** — `OQ-CLS-001`
5. **Classification code** — `CLS-PHO` (when citing subject ownership, not a standard)
6. **Research reference** — `HW-MFG-005`, `HW-VQ-012` (informational evidence only)
7. **Repository path** — informational locator only; not authoritative

### 13.2 Reference rules

| Rule | Requirement |
|------|-------------|
| Identifier authority | Identifiers are authoritative for governed artifacts |
| Path subordination | File paths are implementation artifacts and MAY change without changing identifiers |
| External identifier preservation | Cross-library references SHALL preserve external identifiers without alteration |
| Informational manufacturing refs | `FI-MFG-*` references are informational unless a normative cross-domain requirement exists |
| No path-only validation | Compliance validation SHALL reference Req IDs, not document paths |
| Related standards | Cross References sections SHALL list identifiers, not only filenames |

### 13.3 Illustrative cross-reference (nonnormative)

Preferred:

> See `FI-DSN-CLS-001` Section 8 and `OQ-CLS-001`.

Discouraged as sole reference:

> See `playbook/design/02-design-classification-strategy.md`.

---

## 14. Identifier Change Control

Changes to identifier rules REQUIRE documented revision under `FI-DSN-GOV-001` Section 15 and revision to this document when namespace or format rules change.

| Change type | Required action |
|-------------|-----------------|
| New namespace family | Revise this document; governance review; update Planning Register rules |
| New disposition family | Revise `FI-DSN-GOV-001` first; then harmonize this document |
| New `OQ-{DOMAIN}` code | Revise this document; record in planning metadata |
| Standard ID retirement | Document in Planning Register; preserve identifier in retirement log |
| Req ID renumbering | Formal standard revision only; record all affected Req IDs; consider existing references before correction |
| Identifier correction | Impact analysis required; superseded and retired identifiers remain historically visible |
| Silent reassignment | Prohibited |

Frozen identifiers in Layers A (`FI-DSN-GOV-001`, `FI-DSN-TPL-001`, `FI-DSN-CLS-001`, `FI-DSN-ID-001`) SHALL NOT be modified by this system. This document references them only.

---

## 15. Validation Rules

Before a Design Standard identifier set is marked ready for freeze, confirm:

- [ ] Standard ID matches `FI-DSN-{PRN|STD|CON|POL|SYS}-{nnn}` format
- [ ] Standard ID is recorded in the Planning Register with matching disposition and title
- [ ] Primary `CLS-*` classification is assigned per `FI-DSN-CLS-001`
- [ ] Every Req ID matches `{Full Standard ID}-R{nn}`, inherits the parent Standard ID, and is globally unique as a complete identifier
- [ ] Req ID suffixes (`R{nn}`) are unique within the parent standard and continuously numbered within that standard
- [ ] No shortened Req IDs appear in normative text
- [ ] Cross references use identifiers preferentially over paths
- [ ] No identifier encodes status, implementation, branch, or repository location
- [ ] Retired identifiers are not reused
- [ ] Open questions use `OQ-{DOMAIN}-{nnn}` format when persistence is required

Governance artifact validation confirms identifier consistency in Document Control and Revision History.

---

## 16. Relationship to Planning Register

The future **Design Planning Register** is the authoritative reservation ledger for Layer B Standard IDs. Register governance documents use the `FI-DSN-REG-###` namespace family established in Section 6.3.

| Rule | Requirement |
|------|-------------|
| Reservation authority | The Planning Register SHALL assign and record all `FI-DSN-{PRN|STD|CON|POL|SYS}-###` reservations |
| Prerequisite | Classification assignment per `FI-DSN-CLS-001` SHALL precede reservation |
| Metadata fields | Register SHALL use harmonized field names per Section 6.7: Disposition, Primary Classification, Secondary Classifications, Visual Source (when applicable), Standard ID, title, dependencies, and lifecycle status |
| Template mapping | Register SHALL map the frozen template **Classification** field to **Disposition** |
| This document | Defines identifier format and namespace families; does not populate the register or assign `FI-DSN-REG-###` identifiers |
| Traceability | Reserved and retired IDs SHALL remain visible in register history |

Planning Register creation and `FI-DSN-REG-###` identifier assignment are deferred to a future sprint.

---

## 17. Relationship to Drafting Queue

The future **Drafting Queue** orders authoring work against reserved identifiers. Queue governance documents use the `FI-DSN-QUE-###` namespace family established in Section 6.3.

| Rule | Requirement |
|------|-------------|
| Queue key | Drafting Queue entries SHALL reference reserved Standard IDs |
| No new IDs | The Drafting Queue SHALL NOT assign Standard IDs; reservation remains a Planning Register function |
| Req ID timing | Req IDs are assigned during drafting, not at reservation |
| Blocked drafts | Blocked elements SHALL NOT block identifier traceability |
| This document | Does not create the Drafting Queue or assign `FI-DSN-QUE-###` identifiers |

Drafting Queue creation and `FI-DSN-QUE-###` identifier assignment are deferred to a future sprint.

---

## 18. Relationship to Future Research

Design Library integration with the Research Library SHALL preserve namespace separation.

| Rule | Requirement |
|------|-------------|
| Research authority | Research Library governance establishes all research identifier namespaces |
| No Design Library research namespaces | The Design Library does not establish, propose, reserve, or freeze Research Library identifier namespaces |
| External reference | Once Research Library identifiers exist, Design Library documents reference them without modification |
| Manufacturing and vendor references | `FI-MFG-*`, `HW-MFG-*`, `HW-VQ-*`, and other established `HW-*` patterns remain reference-only and governed elsewhere |
| Design decisions | `FI-DSN-*` identifiers govern F.I. Forgot design decisions; research facts do not automatically assign Standard IDs |
| Fact support | Research facts MAY support standards in Evidence sections; they do not replace company judgment |
| HOLD and REJECT | HOLD and REJECT facts SHALL NOT justify permanent Standard ID reservation |

Volume Roadmap governance documents use the `FI-DSN-VOL-###` namespace family established in Section 6.3. Volume Roadmap creation and `FI-DSN-VOL-###` identifier assignment are deferred to a future sprint.

---

## 19. Prohibited Identifier Practices

The following practices are prohibited:

- Reusing retired `FI-DSN-*` Standard IDs or retired `OQ-*` identifiers
- Renumbering frozen standards to close sequence gaps
- Encoding implementation details, APIs, modules, or tooling in identifiers
- Encoding branch names, sprint names, or author names in identifiers
- Encoding filenames or repository paths in identifiers
- Encoding volume order in Standard IDs unless a future governance revision explicitly governs volume-prefixed patterns
- Silent identifier reassignment or subject substitution under an existing ID
- Using `CLS-*` codes as substitute Standard IDs
- Using document revision labels (`1.0`, `1.1`) as cross-reference substitutes for artifact identifiers
- Assigning Standard IDs ad hoc outside the Planning Register
- Assigning the same identifier to multiple artifacts
- Creating ad hoc namespace families outside documented change control
- Establishing, proposing, or freezing Research Library identifier namespaces from the Design Library
- Placing `CLS-*` subject classification values in disposition fields
- Creating Req IDs without a parent Standard ID
- Shortening Req IDs in normative requirement text

---

## Open Planning Questions

The following questions remain open and are explicitly deferred and nonblocking. They do not affect the authority of the frozen identifier architecture.

| Question | Notes |
|----------|-------|
| Will specialized `OQ-VOL` or `OQ-REG` domain codes be required when Volume Roadmap or Planning Register artifacts are created? | `VOL` and `REG` remain proposed examples until owning artifacts determine need; intentionally unresolved at freeze |
| What is the authorized reservation process for the first `FI-DSN-REG-###`, `FI-DSN-QUE-###`, and `FI-DSN-VOL-###` identifiers? | Deferred to respective planning sprints; intentionally unresolved at freeze |

Resolved by Sprint D1.4 identifier refinement:

- Research namespace boundary — Design Library does not establish Research namespaces
- Planning artifact families `REG`, `QUE`, `VOL` — formally established without ID assignment
- `FI-DSN-GOV` family scope — library-wide governance authorities
- Metadata field harmonization — Disposition vs subject classification terminology
- Requirement suffix scope — parent-local suffix; complete ID globally unique
- Open question default domain — `OQ-DSN-###`; `OQ-CLS-001` preserved

---

## Identifier System Freeze Gate

FI-DSN-ID-001 passed identifier system freeze review on July 22, 2026.

| Criterion | Result |
|-----------|--------|
| Identity complete — FI-DSN-ID-001, title, status, version, and freeze date consistent | Pass |
| Structural completeness — all required sections present; internal references valid | Pass |
| Governance alignment with `FI-DSN-GOV-001` — permanent identifiers, stability, traceability, no status or implementation encoding, change control | Pass |
| Template alignment with `FI-DSN-TPL-001` — `{Full Standard ID}-R{nn}` unchanged; parent-local suffixes; complete IDs globally unique; Classification mapped to Disposition | Pass |
| Classification alignment with `FI-DSN-CLS-001` — disposition distinct from subject classification; Visual Source unfrozen; `OQ-CLS-001` preserved | Pass |
| Namespace integrity — exactly 12 permanent `FI-DSN-*` families; unique families; no REG, QUE, or VOL artifact IDs assigned | Pass |
| Existing identifier integrity — `FI-DSN-GOV-001`, `FI-DSN-TPL-001`, `FI-DSN-CLS-001`, `FI-DSN-ID-001` unchanged | Pass |
| Standard identifier rules — `FI-DSN-{DISPOSITION}-{nnn}`; per-disposition sequencing; illustrative examples nonnormative | Pass |
| Requirement identifier rules — parent inheritance; parent-local suffixes; no renumbering of survivors on retirement | Pass |
| Open question rules — `OQ-DSN` default; `OQ-CLS` established; `OQ-CLS-001` valid; `OQ-VOL` and `OQ-REG` proposed only | Pass |
| Research namespace boundary — no `HW-DSN`; Research Library governs research identifiers | Pass |
| Metadata terminology — Disposition, Subject Classification, Primary/Secondary Classifications, Visual Source explicit | Pass |
| Reserved identifier rules — authorized reservation; traceability; no silent reuse | Pass |
| Identifier lifecycle — governance, planning, standards, requirements, open questions, reserved, and retired handling defined | Pass |
| Cross reference rules — identifiers authoritative; paths informational; external identifiers preserved | Pass |
| Change control — frozen identifiers protected; namespace additions require formal approval | Pass |
| Prohibited practices — reuse, encoding, silent reassignment, ad hoc namespaces prohibited | Pass |
| Open planning questions — two deferred nonblocking items recorded | Pass |
| Prohibited content absent — no future artifacts, IDs, visual rules, algorithms, APIs, or implementation | Pass |
| Document internally consistent and publication quality | Pass |

This system is **Frozen Identifier System**, Version 1.0, effective July 22, 2026.

Revisions after freeze require documented change control under Section 14 and `FI-DSN-GOV-001` Section 15. A revision that changes namespace families, identifier formats, or metadata terminology requires a new system version and freeze review.

---

## 20. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 Draft | July 22, 2026 | F.I. Forgot | Sprint D1.4 — initial Design Identifier System (FI-DSN-ID-001) created for review |
| 1.0 Draft (refined) | July 22, 2026 | F.I. Forgot | Sprint D1.4 identifier architecture refinement — research boundary; REG/QUE/VOL families; GOV scope; metadata harmonization; requirement suffix scope; open question domain registry |
| 1.0 Draft (freeze review) | July 22, 2026 | F.I. Forgot | Sprint D1.4 formal freeze review — requirement retirement numbering; reservation traceability; lifecycle and prohibited-practice clarifications |
| 1.0 | July 22, 2026 | F.I. Forgot | Frozen — promoted to Frozen Identifier System; open questions deferred to future planning sprints |

---

**End of Document**
