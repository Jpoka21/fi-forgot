# F.I. Forgot Design Library

# FI-DSN-GOV-002 — Design Library Metadata Standard

## 1. Document Control

| Field | Value |
|-------|-------|
| **Governance identifier** | FI-DSN-GOV-002 |
| **Title** | Design Library Metadata Standard |
| **Document** | `04-design-library-metadata-standard.md` |
| **Sprint** | D1.5 |
| **Artifact type** | Metadata governance standard |
| **Status** | Frozen Governance Standard |
| **Version** | 1.0 |
| **Date** | July 22, 2026 |
| **Freeze date** | July 22, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md`; `playbook/design/01-design-standard-template.md`; `playbook/design/02-design-classification-strategy.md`; `playbook/design/03-design-identifier-system.md`; `playbook/design/README.md` |
| **Downstream consumers** | Future Design Planning Register; Drafting Queue; Volume Roadmap; Design Standards; future automation |

**Source basis:** Company judgment. This metadata model is an F.I. Forgot governance choice. It is not derived from vendor facts or verified evidence.

---

## 2. Purpose

This document defines the canonical **metadata model** used by every Design Library governance document, planning artifact, Design Standard, register, queue, roadmap, and future automation.

Metadata answers: **What governed facts describe this artifact for planning, validation, and traceability?**

This document defines **metadata semantics only**. It does not define:

- Implementation storage, databases, APIs, serialization, or code
- Repository layout or file naming as authoritative metadata
- Visual design rules or normative design policy

The metadata model SHALL support validation, traceability, identifier alignment, classification alignment, and future planning workflows without prescribing how metadata is stored or rendered.

This document is a **Design Library-wide governance authority** under the `FI-DSN-GOV-###` namespace per `FI-DSN-ID-001`. It is not a Design Standard in the `FI-DSN-{PRN|STD|CON|POL|SYS}` sense and SHALL NOT be cited as normative visual policy.

---

## 3. Scope

### In scope

- Canonical metadata field definitions and semantics
- Required, optional, and derived field rules by artifact class
- Metadata validation rules at the governance semantics level
- Metadata lifecycle and change control
- Relationship to identifier, classification, template, and future planning artifacts
- Prohibited metadata practices

### Out of scope

- Planning Register population
- Drafting Queue or Volume Roadmap creation
- Database schemas, JSON schemas, YAML schemas, or other serialization formats
- APIs, storage engines, UI forms, or automation implementation
- Repository layout, folder naming, or branch naming as metadata fields
- Programming-language object models or implementation field types
- Visual Source value schema freeze
- Redefinition of frozen concepts in `FI-DSN-GOV-001`, `FI-DSN-TPL-001`, `FI-DSN-CLS-001`, or `FI-DSN-ID-001`

---

## 4. Metadata Principles

The following principles govern all Design Library metadata:

1. **One canonical meaning per field.** Each field name SHALL have exactly one semantic meaning across the Design Library.
2. **Stable field names.** Canonical field names SHALL remain stable once used by frozen artifacts unless revised through metadata change control (Section 12).
3. **Implementation independence.** Metadata semantics SHALL NOT depend on storage technology, file format, or codebase structure.
4. **Repository independence.** Metadata SHALL NOT encode repository layout, folder paths, or filenames as canonical fields.
5. **Branch independence.** Metadata SHALL NOT encode branch names, sprint names, or author names as canonical fields.
6. **Technology independence.** Metadata SHALL NOT encode implementation technology, service names, or module names.
7. **Derived fields are supplementary.** Derived fields MAY assist display or validation but SHALL NOT replace canonical fields.
8. **Validation support.** Metadata SHALL be sufficient to support governance-level validation without implementation tests.
9. **Traceability support.** Metadata SHALL support traceability to identifiers, classifications, evidence, dependencies, and revision history.
10. **Governed change.** Metadata model changes REQUIRE documented governance revision.
11. **Frozen reference supremacy.** Where this document and a frozen upstream document differ on a shared concept, the frozen upstream document governs until harmonized through documented revision.
12. **Orthogonal attributes.** Identifier, disposition, subject classification, visual source, status, and version remain distinct attributes per `FI-DSN-ID-001` and `FI-DSN-CLS-001`.

---

## 5. Canonical Metadata Fields

The Design Library uses **17 independently populated** canonical metadata fields plus one **conceptual collective term** (Subject Classification). Section 7 through Section 9 assign requirement level by artifact class.

| Field | Canonical name | Population | Primary role |
|-------|----------------|------------|--------------|
| **Identifier** | Identifier | Populated | Permanent artifact identifier per `FI-DSN-ID-001` |
| **Title** | Title | Populated | Human-readable artifact name |
| **Status** | Status | Populated | Lifecycle state; metadata only; not encoded in Identifier |
| **Version** | Version | Populated | Document or artifact version label per `FI-DSN-GOV-001` Section 8 |
| **Disposition** | Disposition | Populated | Standard kind: `PRN`, `STD`, `CON`, `POL`, or `SYS` per `FI-DSN-GOV-001` Section 6.4 |
| **Subject Classification** | Subject Classification | Conceptual only | Collective term for `CLS-*` subject ownership per `FI-DSN-CLS-001`; not independently populated |
| **Primary Classification** | Primary Classification | Populated | One `CLS-*` code for principal subject ownership |
| **Secondary Classifications** | Secondary Classifications | Populated | Zero to two `CLS-*` codes for secondary ownership |
| **Visual Source** | Visual Source | Populated when applicable | Provenance or generation origin; value schema not frozen |
| **Dependencies** | Dependencies | Populated | Upstream standards, facts, vendor questions, and blocking items |
| **Authority** | Authority | Populated | Governing documents and authority references for the artifact |
| **Evidence References** | Evidence References | Populated when applicable | Verified fact IDs and qualification references used by the artifact |
| **Company Judgment** | Company Judgment | Populated when applicable | Company decisions not established by verified evidence alone |
| **Open Questions** | Open Questions | Populated when applicable | Persistent `OQ-{DOMAIN}-###` identifiers and unresolved planning questions |
| **Revision History** | Revision History | Populated | Record of revisions, freeze events, and material changes |
| **Freeze Date** | Freeze Date | Populated when applicable | Date an artifact became frozen, when applicable |
| **Owner** | Owner | Populated | Governance accountability for the artifact |
| **Notes** | Notes | Populated when applicable | Nonnormative planning or editorial notes |

### Field catalog rules

- Canonical field names in this table are normative for metadata semantics.
- **Subject Classification** is a collective conceptual term only. Implementations record **Primary Classification** and **Secondary Classifications**; they do not populate a separate Subject Classification value unless a future governance revision explicitly authorizes one.
- This sprint does not freeze implementation data types, storage formats, or serialization keys.
- Implementations MAY use different display labels only when an explicit mapping to canonical field names is preserved.

---

## 6. Field Definitions

Each definition states metadata semantics only.

### Identifier

Permanent artifact identifier assigned per `FI-DSN-ID-001`. Examples include `FI-DSN-GOV-001`, `FI-DSN-GOV-002`, `FI-DSN-POL-014`, and `OQ-CLS-001`. Identifier is not inferred from Title, Status, or repository location.

### Title

Human-readable name of the artifact. Title MAY change without changing Identifier.

### Status

Lifecycle state of the artifact. Status is recorded in metadata and document control. Status is not encoded in Identifier. Status values for Design Standards follow `FI-DSN-GOV-001` Section 6.1 unless a governance document defines a specialized lifecycle.

### Version

Document or artifact version label, such as `1.0 Draft` or `1.0`. Version labels follow `FI-DSN-GOV-001` Section 8. Version is not a substitute for Identifier.

### Disposition

Standard kind for Layer B Design Standards: `PRN`, `STD`, `CON`, `POL`, or `SYS` per `FI-DSN-GOV-001` Section 6.4. Disposition is distinct from Subject Classification. For Design Standards, disposition is encoded in the Standard Identifier but SHALL also be recorded explicitly in metadata for validation and register use.

**Template mapping:** `FI-DSN-TPL-001` Document Control uses a field labeled **Classification** for disposition applicability. Future records MUST map that template field to **Disposition** per `FI-DSN-ID-001` Section 6.7.

### Subject Classification

Collective metadata term for `CLS-*` subject ownership per `FI-DSN-CLS-001`. Subject Classification is not a substitute for Identifier, does not replace Disposition, and is not independently populated. Recorded subject ownership is expressed only through **Primary Classification** and **Secondary Classifications**.

### Primary Classification

Exactly one `CLS-*` code identifying principal subject ownership per `FI-DSN-CLS-001` Section 8.

### Secondary Classifications

Zero, one, or two `CLS-*` codes identifying secondary subject ownership per `FI-DSN-CLS-001` Section 9.

### Visual Source

Provenance or generation origin of governed visual content per `FI-DSN-CLS-001` Section 5. Visual Source is distinct from Identifier, Disposition, and Subject Classification. The Visual Source controlled value schema is not frozen by this document. This document does not define `Customer Uploaded`, `Curated F.I. Forgot`, `AI Generated`, `Typography Only`, or other values as normative metadata values. Required-field triggers for Visual Source remain deferred to a future authorized artifact.

### Dependencies

Upstream artifacts, verified facts, vendor questions, standards, and blocking items required to interpret or advance the artifact. Dependencies SHALL use identifiers where available.

### Authority

Governing documents that establish rules for the artifact, such as `FI-DSN-GOV-001`, volume governance, or frozen upstream baselines. Authority references are informational for governance traceability unless a normative requirement states otherwise.

### Evidence References

Verified fact IDs and qualification references cited by the artifact per `FI-DSN-GOV-001` Section 9. Evidence References do not determine Subject Classification per `FI-DSN-CLS-001`. When the field applies, Evidence References MUST NOT be silently blank. Allowed governance-level states are:

- One or more valid evidence identifiers
- `None Required`
- `Open`, accompanied by a persistent `OQ-{DOMAIN}-###` identifier when unresolved evidence materially affects the artifact

This document does not define disposition-specific evidence applicability.

### Company Judgment

Recorded company decisions not established by verified evidence alone per `FI-DSN-GOV-001` Section 10. Company Judgment is disclosure metadata, not evidence.

### Open Questions

Persistent planning questions identified by `OQ-{DOMAIN}-###` per `FI-DSN-ID-001` Section 9 when cross-document persistence is required.

### Revision History

Chronological record of revisions, freeze events, blocked elements, and material metadata changes.

### Freeze Date

Calendar date on which an artifact status became frozen. Freeze Date applies when Status is a frozen state.

### Owner

Governance accountability for maintenance, revision, freeze coordination, and metadata stewardship. Owner identifies governance accountability, not implementation ownership. Owner changes do not alter the artifact Identifier or Version by themselves. Prefer durable role or authority names over individual names where practical. This document does not define organizational staffing.

At freeze, Owner MAY remain recorded or MAY be marked `Not Applicable` only when accountability is transferred to a durable governing authority. A personnel change SHALL NOT require revising a frozen artifact solely to replace a person's name when ownership is recorded by durable role or authority.

### Notes

Nonnormative planning commentary. Notes SHALL NOT create obligations, identifiers, or classifications.

---

## 7. Required Fields

Required fields MUST be present for the artifact class at the stated lifecycle point. Absence of a required field is a metadata validation failure.

### 7.1 Governance and metadata documents

Applies to `FI-DSN-GOV`, `FI-DSN-TPL`, `FI-DSN-CLS`, `FI-DSN-ID`, and other `FI-DSN-GOV-###` library-wide governance authorities, including this document (`FI-DSN-GOV-002`).

| Field | Required when |
|-------|----------------|
| Identifier | Always |
| Title | Always |
| Status | Always |
| Version | Always |
| Authority | Always |
| Owner | Always |
| Revision History | Always |
| Freeze Date | When Status is frozen |
| Notes | Optional |

Disposition, Subject Classification, Primary Classification, Secondary Classifications, and Visual Source are not required for this artifact class.

### 7.2 Planning artifact governance documents

Applies to future `FI-DSN-REG`, `FI-DSN-QUE`, and `FI-DSN-VOL` governance documents when created.

| Field | Required when |
|-------|----------------|
| Identifier | Always |
| Title | Always |
| Status | Always |
| Version | Always |
| Authority | Always |
| Owner | Always |
| Dependencies | When the artifact depends on upstream governance or planning decisions |
| Revision History | Always |
| Freeze Date | When Status is frozen |
| Open Questions | When unresolved cross-document questions exist |

### 7.3 Design Standard artifacts

Applies to `FI-DSN-{PRN|STD|CON|POL|SYS}-###` standards in Volumes 02 through 05.

| Field | Required when |
|-------|----------------|
| Identifier | Always once reserved |
| Title | Always once reserved |
| Status | Always |
| Version | Always while drafted or frozen |
| Disposition | Always once reserved |
| Primary Classification | Always before Standard ID reservation per `FI-DSN-CLS-001` and `FI-DSN-ID-001` |
| Dependencies | Always at planning register entry; update when blocking dependencies change |
| Authority | Always |
| Evidence References | When the field applies; MUST use an allowed governance-level state and MUST NOT be silently blank |
| Company Judgment | When applicable per `FI-DSN-GOV-001` Section 10 |
| Revision History | Always |
| Freeze Date | When Status is Frozen |
| Owner | Always |

| Field | Conditionally required |
|-------|------------------------|
| Secondary Classifications | When secondary ownership is assigned per `FI-DSN-CLS-001` |
| Visual Source | When provenance or generation origin is material to the governed subject |
| Open Questions | When unresolved planning questions affect the standard |

### 7.4 Planning register entries

Applies to future Planning Register rows referencing reserved or drafted standards.

| Field | Required when |
|-------|----------------|
| Identifier | Always for reserved standards |
| Title | Always |
| Status | Always |
| Disposition | Always |
| Primary Classification | Always |
| Dependencies | Always, using `None` only when explicitly true |
| Owner | Always for active Planning Register entries and governed drafts |

---

## 8. Optional Fields

Optional fields MAY be recorded when they add traceability or planning value. Their absence does not invalidate an artifact unless a required-field rule applies.

| Field | Typical optional use |
|-------|----------------------|
| Secondary Classifications | When no secondary ownership exists |
| Visual Source | When provenance is not material and no future required-field trigger applies |
| Company Judgment | When all obligations derive from cited verified facts |
| Open Questions | When no persistent planning question exists |
| Notes | Editorial or planning commentary |
| Freeze Date | For nonfrozen drafts |

Evidence References are not optional when the field applies. When applicable, they MUST record one of the allowed governance-level states defined in Section 6.

Optional fields SHALL use canonical names when present. Implementations SHALL NOT invent parallel optional fields with conflicting semantics.

---

## 9. Derived Fields

Derived fields MAY be computed from canonical fields for display, reporting, or validation assistance. Derived fields SHALL NOT replace canonical fields and SHALL NOT be treated as authoritative when they conflict with canonical metadata.

| Derived field (nonnormative label) | Typical derivation | Rule |
|------------------------------------|--------------------|------|
| Disposition family code | Parsed from Standard Identifier for Layer B standards | Convenience only; Disposition remains a required canonical field |
| Namespace family | Parsed from `FI-DSN-*` identifier prefix segment | Informational only; not a substitute for Identifier |
| Frozen state indicator | Derived from Status equals a frozen state label | Informational only; Freeze Date remains canonical when frozen |
| Subject classification summary | Concatenation of Primary and Secondary Classifications | Display only; canonical `CLS-*` fields remain authoritative |
| Dependency count | Count of listed Dependencies | Reporting only |

Derived fields:

- SHALL NOT be stored as the sole record of disposition, classification, identifier, or status
- SHALL NOT encode repository paths, branch names, or implementation modules
- MAY be omitted entirely from implementations that do not need them

---

## 10. Metadata Validation Rules

Metadata validation confirms semantic completeness and consistency. It is not implementation testing.

Before an artifact is marked ready for freeze review, confirm:

- [ ] All required fields for the artifact class are present
- [ ] Identifier matches the applicable format in `FI-DSN-ID-001`
- [ ] Identifier is not inferred from Title, Status, Version, or repository location
- [ ] Disposition is recorded separately from Subject Classification
- [ ] Template **Classification** field content, when present in a Design Standard record, is mapped to **Disposition**
- [ ] Primary Classification is exactly one valid `CLS-*` code from `FI-DSN-CLS-001`
- [ ] Secondary Classifications are zero, one, or two valid `CLS-*` codes with justification when present
- [ ] Visual Source, when present, is recorded separately and does not replace classification
- [ ] Status is recorded in metadata and is not encoded in Identifier
- [ ] Freeze Date is present when Status is frozen
- [ ] Dependencies use identifiers where available and list blocking items explicitly
- [ ] Evidence References, when the field applies, use an allowed governance-level state and are not silently blank
- [ ] Evidence References that list fact identifiers cite only permitted fact IDs per `FI-DSN-GOV-001`
- [ ] Owner is recorded for active Planning Register entries and governed drafts and reflects governance accountability
- [ ] Company Judgment is present when company decisions are material and not represented only as vendor fact
- [ ] Open Questions use `OQ-{DOMAIN}-###` format when persistent questions are recorded
- [ ] Revision History reflects current Status and Version
- [ ] Derived fields, if used, do not contradict canonical fields
- [ ] No prohibited metadata practices in Section 18 are present

---

## 11. Metadata Lifecycle

Metadata lifecycle aligns with artifact lifecycle per `FI-DSN-GOV-001` and `FI-DSN-ID-001`. Lifecycle values are metadata; they are not encoded into Identifier.

| Lifecycle event | Metadata effect |
|-----------------|-----------------|
| **Draft created** | Identifier assigned or deferred per artifact class; Status set to draft label; Version set |
| **Reserved** | Identifier, Title, Disposition, and Primary Classification recorded for standards |
| **Drafted** | Dependencies, Evidence References, and Company Judgment populated as applicable |
| **Freeze review** | Required fields validated; Freeze Date prepared |
| **Frozen** | Status set to frozen label; Freeze Date recorded; Revision History updated |
| **Under revision** | Version incremented per governance rules; prior frozen metadata preserved in Revision History |
| **Retired** | Status set to Retired; Identifier preserved; retirement recorded in Revision History and Dependencies as applicable |

Metadata updates SHALL occur with artifact lifecycle transitions. Silent metadata changes outside documented revision are prohibited for frozen artifacts.

---

## 12. Metadata Change Control

Changes to this metadata model REQUIRE documented revision under `FI-DSN-GOV-001` Section 15.

| Change type | Required action |
|-------------|-----------------|
| New canonical field | Revise this document; impact review; update validation rules and downstream planning artifacts |
| Rename of canonical field | Revise this document; map old field to new field; review frozen artifacts |
| Required-field rule change | Revise Section 7; review affected artifact classes |
| Derived field rule change | Revise Section 9; confirm no canonical replacement |
| Visual Source schema freeze | Separate future artifact; not governed by this section until proposed |

Frozen metadata on frozen artifacts SHALL NOT be silently rewritten. Title changes, classification reassignment, and dependency updates REQUIRE documented revision appropriate to the artifact class.

Reassignment of `CLS-*` subject classification metadata does not change the governing `FI-DSN-*` Identifier per `FI-DSN-ID-001` Section 6.7.

Owner changes do not change Identifier or Version by themselves. Revising a frozen artifact solely to replace a person's name is not required when ownership is recorded by durable role or authority.

---

## 13. Relationship to Identifier System

| Rule | Requirement |
|------|-------------|
| Identifier authority | `FI-DSN-ID-001` governs identifier formats and namespace families |
| Metadata role | This document governs what metadata fields mean and which are required |
| Field harmonization | Preferred field names in `FI-DSN-ID-001` Section 6.7 are canonical here |
| No identifier reassignment | Metadata changes do not change Identifier |
| Requirement IDs | Requirement metadata uses `{Full Standard ID}-R{nn}` per `FI-DSN-ID-001`; not redefined here |

---

## 14. Relationship to Classification Strategy

| Rule | Requirement |
|------|-------------|
| Classification authority | `FI-DSN-CLS-001` governs `CLS-*` taxonomy and assignment rules |
| Metadata role | This document requires Primary and Secondary Classification fields without redefining taxonomy |
| Visual Source | Recorded as separate metadata field; value schema not frozen here; normative values not defined in this document |
| Evidence independence | Evidence References do not determine Primary Classification |
| Template distinction | Disposition and Subject Classification remain distinct in all metadata records |

---

## 15. Relationship to Future Planning Register

The future Planning Register is the authoritative reservation ledger for Design Standard identifiers per `FI-DSN-ID-001`.

| Rule | Requirement |
|------|-------------|
| Metadata population | Planning Register rows SHALL use canonical field names from this document |
| Required register fields | Identifier, Title, Status, Disposition, Primary Classification, Dependencies, and Owner at minimum |
| Template mapping | Register SHALL map template **Classification** to **Disposition** |
| This document | Defines metadata semantics; does not create or populate the register |
| Validation | Register entries SHALL pass Section 10 validation before reservation is marked complete |

Planning Register creation is deferred to a future sprint.

---

## 16. Relationship to Drafting Queue

The future Drafting Queue orders authoring work against reserved identifiers per `FI-DSN-ID-001`.

| Rule | Requirement |
|------|-------------|
| Queue metadata | Queue entries SHALL reference canonical Identifier and Status |
| No substitute fields | Queue metadata SHALL NOT replace Planning Register canonical fields |
| Drafting additions | Evidence References, Company Judgment, and Open Questions MAY be refined during drafting |
| This document | Defines required metadata semantics; does not create the queue |

Drafting Queue creation is deferred to a future sprint.

---

## 17. Relationship to Future Automation

Future automation MAY read or generate Design Library metadata only when canonical field semantics in this document are preserved.

| Rule | Requirement |
|------|-------------|
| Semantic fidelity | Automation SHALL preserve canonical field meanings |
| No schema freeze | This document does not authorize a machine schema by itself |
| Identifier first | Automation SHALL treat Identifier as the primary key for governed artifacts |
| No silent mutation | Automation SHALL NOT silently change frozen metadata or retired identifiers |
| Validation before promotion | Automation SHOULD run Section 10 validation before freeze-review promotion |
| Implementation independence | Automation implementation remains outside this document |

---

## 18. Prohibited Metadata Practices

The following practices are prohibited:

- Using repository path, filename, or folder name as canonical Identifier or Title substitute
- Encoding branch names, sprint names, or implementation technology in canonical metadata fields
- Treating derived fields as authoritative over canonical fields
- Storing disposition only in the template **Classification** field without mapping to **Disposition** in planning metadata
- Placing `CLS-*` codes in Disposition fields
- Using Subject Classification as a substitute for Identifier
- Using Status or Version as a substitute for Identifier
- Inferring Primary Classification from Evidence References or repository location
- Silently leaving Evidence References blank when the field applies
- Freezing or inventing Visual Source values in this document
- Omitting Revision History on governed artifacts
- Silent rewrite of frozen metadata
- Creating ad hoc metadata fields with conflicting semantics without revising this document
- Defining database schemas, JSON schemas, APIs, or serialization formats as part of this metadata standard

---

## 19. Open Planning Questions

The following question remains open for future Visual Source schema planning. It is explicitly deferred, nonblocking, and does not affect the authority of the frozen metadata model.

### Resolved during Sprint D1.5 refinement

| ID | Question | Resolution |
|----|----------|------------|
| OQ-DSN-001 | Should metadata governance use a `FI-DSN-MET-###` namespace or the existing `FI-DSN-GOV-###` library-wide governance namespace? | Resolved: this document is `FI-DSN-GOV-002` under `FI-DSN-GOV-###` per `FI-DSN-ID-001`; no `FI-DSN-MET-###` family is established |
| OQ-DSN-002 | When must Planning Register entries and governed drafts record Owner? | Resolved: Owner is required for active Planning Register entries and governed drafts; Owner records governance accountability, not implementation ownership |

### Remaining nonblocking questions

| ID | Question | Notes |
|----|----------|-------|
| OQ-DSN-003 | When should Visual Source become a required field for specific `CLS-*` domains? | Deferred until a future authorized Visual Source schema artifact defines required-field triggers |

---

## Metadata Standard Freeze Gate

FI-DSN-GOV-002 passed metadata standard freeze review on July 22, 2026.

| Criterion | Result |
|-----------|--------|
| Identity complete — `FI-DSN-GOV-002`, title, status, version, and freeze date consistent | Pass |
| Structural completeness — all required sections present; internal references valid | Pass |
| Governance alignment with `FI-DSN-GOV-001` — implementation independence, evidence and company judgment distinct, governed change, frozen metadata authoritative | Pass |
| Template alignment with `FI-DSN-TPL-001` — template **Classification** mapped to **Disposition**; `CLS-*` codes prohibited in disposition fields; no competing template | Pass |
| Classification alignment with `FI-DSN-CLS-001` — Subject Classification collective; Primary Classification one `CLS-*` when required; Secondary Classifications zero to two; Visual Source unfrozen and separate | Pass |
| Identifier System alignment with `FI-DSN-ID-001` — `FI-DSN-GOV-002` unique; no `FI-DSN-MET` namespace; `OQ-DSN` default domain; `OQ-CLS-001` preserved | Pass |
| Canonical field model — exactly 17 independently populated fields; Subject Classification conceptual only | Pass |
| Required and optional field rules — internally consistent; Owner required for active Planning Register entries and governed drafts | Pass |
| Evidence References — three governance-level states; silent blank prohibited when applicable; `FI-DSN-GOV-001` evidence authority preserved | Pass |
| Company Judgment — distinct from evidence; disclosure metadata only | Pass |
| Owner rules — governance accountability; durable role or authority preferred; Owner changes do not alter Identifier or Version | Pass |
| Visual Source boundary — conditional, separate, unfrozen; no normative values defined | Pass |
| Derived fields — non-authoritative; do not replace canonical fields | Pass |
| Dependencies and Authority — distinct semantics; identifier-preferred references | Pass |
| Metadata lifecycle and change control — traceable across lifecycle transitions; no silent frozen metadata rewrite | Pass |
| Validation rules — governance-level checks defined; implementation tests excluded | Pass |
| Planning Register relationship — conformance required; register not created; no `FI-DSN-REG-###` identifier assigned | Pass |
| Drafting Queue relationship — canonical metadata referenced; queue not created; no `FI-DSN-QUE-###` identifier assigned | Pass |
| Future automation boundary — consume and validate only; no machine schema authorized | Pass |
| Prohibited metadata practices — branch, path, technology encoding; derived field misuse; silent evidence blank prohibited | Pass |
| Open planning questions — `OQ-DSN-001` and `OQ-DSN-002` resolved; `OQ-DSN-003` deferred and nonblocking | Pass |
| Prohibited content absent — no database, JSON, API, serialization, Visual Source value freeze, or downstream artifacts | Pass |
| No frozen governing documents modified | Pass |
| Document internally consistent and publication quality | Pass |

This standard is **Frozen Governance Standard**, Version 1.0, effective July 22, 2026.

Revisions after freeze require documented change control under Section 12 and `FI-DSN-GOV-001` Section 15. A revision that changes canonical field names, field meanings, required-field rules, or validation rules requires a new metadata standard version and freeze review.

---

## 20. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 Draft | July 22, 2026 | F.I. Forgot | Sprint D1.5 — initial Design Library Metadata Standard (`FI-DSN-GOV-002`) created for review |
| 1.0 Draft (refined) | July 22, 2026 | F.I. Forgot | Sprint D1.5 refinement — governance identifier corrected to `FI-DSN-GOV-002`; canonical field count clarified; Owner and Evidence References rules harmonized; open questions moved to `OQ-DSN-###` |
| 1.0 Draft (freeze review) | July 22, 2026 | F.I. Forgot | Sprint D1.5 formal freeze review — READY TO FREEZE |
| 1.0 | July 22, 2026 | F.I. Forgot | Frozen — promoted to Frozen Governance Standard; `OQ-DSN-003` deferred to future Visual Source schema artifact |

---

**End of Document**
