# F.I. Forgot Design Library

# FI-DSN-GOV-001 — Design Standards Governance

## Document Control

| Field | Value |
|-------|-------|
| **Governance ID** | FI-DSN-GOV-001 |
| **Title** | Design Standards Governance |
| **Document** | `00-design-standards-governance.md` |
| **Sprint** | D1.1 |
| **Status** | Frozen Governance Standard |
| **Version** | 1.0 |
| **Freeze date** | July 22, 2026 |
| **Date** | July 22, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Upstream governance** | `playbook/research/README.md`; `playbook/design/README.md` |
| **Downstream consumers** | Design Library volumes 02 through 05; engineering specifications; implementation |

---

## 1. Purpose

This document is the permanent governing framework for how F.I. Forgot **Design Standards** are created, maintained, frozen, and revised within the Design Library.

Its purpose is to define the governance system that all future Design Standards SHALL follow. It does **not** define visual design rules, artwork requirements, typography, color, layout, illustration style, or aesthetic outcomes. It does **not** define Brain decision logic, message content, or manufacturing operational policy.

Design Standards translate verified evidence and explicit company judgment into durable F.I. Forgot design decisions. This document ensures those standards are authored with the same evidence discipline, traceability, normative clarity, and long-term maintainability established in the Manufacturing Library.

**Status:** Frozen Governance Standard (July 22, 2026). This document governs how Design Standards are created, frozen, and revised. It does not yet contain populated Design Standards for Volumes 02 through 05.

---

## 2. Guiding Principles

The following principles govern how the Design Library is authored, maintained, and applied. They are **governance principles**, not visual design rules. They inform standard lifecycle decisions, freeze discipline, and authority boundaries across all Design Library volumes.

- **Longevity over convenience.** Design Standards SHALL be written for long-term company use. Short-term tooling convenience, draft workflow pressure, or expedient workarounds SHALL NOT justify bypassing evidence discipline, freeze review, or documented revision.
- **Consistency over novelty.** The Design Library SHALL preserve coherent governance and cross-standard alignment across volumes. Novel authoring patterns, ID conventions, or lifecycle shortcuts SHALL NOT be introduced without documented governance revision.
- **Standards before implementation.** Design Standards SHALL be frozen before implementation is treated as authoritative. Implementation behavior, prototypes, and production practice SHALL NOT substitute for absent or unfrozen standards.
- **Brain recommendations constrained by approved Design Standards.** Brain Architecture outputs and recommendations SHALL operate within boundaries established by frozen Design Standards. The Brain SHALL NOT be used to bypass, override, or substitute for approved design governance.
- **Company judgment explicitly identified.** Every company judgment that supports a normative requirement or material governance decision SHALL be disclosed in the Source column, Company judgment section, or equivalent governance record. Company judgment SHALL NOT be disguised as verified evidence.
- **Frozen standards authoritative until formally revised.** A frozen Design Standard remains binding until changed through documented change control and applicable freeze review. Silent edits, informal exceptions, and implied supersession are prohibited.
- **Manufacturing feasibility over aesthetics.** Where a design decision conflicts with an applicable frozen manufacturing constraint, manufacturing feasibility SHALL take precedence unless a documented cross-domain revision explicitly resolves the conflict through approved governance.
- **Customer experience over implementation convenience.** Governance and standard authoring SHALL prioritize the intended customer experience over engineering convenience, tooling simplicity, or internal workflow preference when those interests conflict during standard drafting or revision.

These principles do not create visual requirements, artwork rules, or aesthetic outcomes. They govern how Design Standards are created and maintained.

---

## 3. Scope

### In scope

This document governs:

- The authority hierarchy for Design Standard creation
- Design Library organization relative to other F.I. Forgot knowledge layers
- The Design Standard lifecycle from planning through freeze and revision
- Freeze policy, versioning policy, and change control for Design Standards
- Evidence policy and company judgment policy for Design Standard authoring
- The relationship between Design Standards and Manufacturing Standards
- Standard dependencies, normative language rules, and exception handling
- Brain Architecture boundaries relative to Design Standards
- Future expansion rules for additional Design Library volumes and standard types

### Out of scope

This document does not define:

- Visual identity, typography, color, layout, illustration, or artwork rules (Volume 02 and downstream volumes)
- Card template architecture, safe zones, or production-ready card structure (Volume 03)
- Artwork selection logic, metadata schemas for selection, or intelligence workflows (Volume 04)
- Signature collection content, release criteria for artwork assets, or collection curation rules (Volume 05)
- Manufacturing principles, manufacturing constraints, or operational policies (Volume 01 Manufacturing and Production Standard)
- Engineering specifications, code, APIs, databases, workflows, or implementation mechanics
- Brain Architecture decision logic, writing engine behavior, or relationship-intelligence rules
- Research collection, evidence audit execution, or verified-facts promotion (Research Library governance)

Subjects intentionally deferred to later research volumes, later design volumes, or engineering specification work SHALL NOT be expanded here merely because related evidence exists elsewhere.

---

## 4. Authority Hierarchy

F.I. Forgot design knowledge SHALL follow a fixed authority hierarchy. No lower layer may override a higher layer. No layer may skip the layer above it.

```
Research Library Governance
        ↓
Verified Facts (frozen research baseline)
        ↓
Design Library Governance (this document)
        ↓
Volume Governance Documents (where applicable)
        ↓
Design Standards (authored, frozen)
        ↓
Engineering Specifications
        ↓
Implementation
```

| Layer | Authority | Role relative to Design Standards |
|-------|-----------|-----------------------------------|
| **Research Library governance** | `playbook/research/README.md` | Governs how evidence becomes verified facts. Research narrative is not authoritative for standards. |
| **Verified Facts** | Frozen `03-verified-facts.md` baselines per research volume | Supplies the only permitted factual support for normative requirements grounded in evidence |
| **Design Library governance** | `playbook/design/README.md` | Defines Design Library architecture, philosophy, and volume roles |
| **Design Standards governance** | This document (`FI-DSN-GOV-001`) | Defines how Design Standards are created, frozen, and revised |
| **Volume governance** | Volume-specific governing documents where authored | May define volume-specific planning registers, templates, and registers; SHALL NOT contradict this document or frozen upstream baselines |
| **Design Standards** | Authored standards in Design Library volumes | Contain F.I. Forgot design decisions within declared scope |
| **Engineering specifications** | Separate documents derived after standard freeze | Translate standards into implementable technical requirements |
| **Implementation** | Code, artwork production, templates, workflows, vendor configuration | Executes specifications; does not authoritatively define standards |

### Supremacy rules

- A **Verified Fact** supports a requirement; it does not replace company judgment where F.I. Forgot must choose adoption, scope, or interpretation.
- A **Design Standard** SHALL NOT restate vendor documentation as an F.I. Forgot obligation without explicit company judgment and normative requirement text.
- **Implementation** behavior, tooling convenience, or existing production practice SHALL NOT be treated as a Design Standard unless promoted through the standard lifecycle defined in this document.
- **Manufacturing Standards** in Volume 01 govern manufacturing and production decisions. They do not automatically govern visual design, artwork selection, or brand presentation unless a Design Standard explicitly incorporates them by reference as informational context only.

---

## 5. Library Organization

The Design Library is organized into five volumes. Each volume has a distinct role. This document governs standard creation across all volumes.

| Volume | Title | Primary standard domain | Governance notes |
|--------|-------|-------------------------|------------------|
| **01** | Manufacturing and Production | Manufacturing principles, constraints, and operational policies | Governed by `playbook/design/volume-01-manufacturing/01-handwrytten-production-standard.md` and the frozen Manufacturing Standard Template v1.0. Volume 01 standard authoring rules remain authoritative for manufacturing standards. |
| **02** | Design Language | Brand personality, emotional goals, and visual identity philosophy | Future Design Standards; no visual rules in this governance document |
| **03** | Card Design System | Templates, layout architecture, metadata, and production structure | Future Design Standards; structural rules only when authored in Volume 03 |
| **04** | Artwork Intelligence | Artwork selection governance, metadata requirements, and intelligence constraints | Future Design Standards; selection governance only — not Brain logic |
| **05** | Signature Collections | Collection standards, artwork governance, and release criteria | Future Design Standards; collection governance only — not artwork content |

### Document classes within the Design Library

| Document class | Definition | Example |
|----------------|------------|---------|
| **Library governance** | Governs the Design Library as a whole | `playbook/design/README.md` |
| **Standards governance** | Governs how standards are created | This document |
| **Volume governance** | Governs a single volume's architecture, registers, and templates | Volume 01 manufacturing standard document |
| **Design Standard** | A normative F.I. Forgot design decision with Standard ID, requirements, and freeze record | Authored within a volume after planning approval |
| **Register** | Index of reserved IDs, statuses, and planning disposition | Standard Planning Register, Reserved Standard Index |
| **Template** | Required section structure for a standard disposition | Manufacturing Standard Template v1.0 (Volume 01) |

Volumes 02 through 05 SHALL NOT author Design Standards until:

1. Relevant upstream verified facts baselines required by volume planning are frozen, or explicit evidence-boundary labels are recorded where facts are not yet available
2. A volume governance document or approved planning register assigns Reserved Standard IDs
3. The global Design Standard Template requirements in Section 6.3 are satisfied, and any volume supplemental template schedule is approved through template freeze review without creating an independent competing template

---

## 6. Standard Lifecycle

Every Design Standard SHALL progress through a controlled lifecycle. Skipping lifecycle stages is prohibited unless this document explicitly allows deferral.

### 6.1 Lifecycle stages

| Stage | Status label | Meaning |
|-------|--------------|---------|
| **Candidate identification** | Nonbinding candidate | A potential standard topic identified during volume planning. No Standard ID assigned. |
| **ID reservation** | Reserved, Not Drafted | Standard ID assigned in the Standard Planning Register. Not yet normatively authored. |
| **Drafting** | Drafted, Pending Freeze | Full standard body authored per approved template. Not yet binding for compliance purposes. |
| **Partial draft** | Drafted, Pending Freeze (elements blocked) | Permitted only when planning register explicitly records blocked elements and blocking cause. Non-blocked requirements may be drafted. |
| **Freeze review** | Under individual freeze review | Authored standard evaluated against freeze gate criteria. |
| **Frozen** | Frozen | Standard passed individual freeze review. Binding until revised. |
| **Revision** | Under revision | Frozen standard undergoing documented change control. Prior frozen version remains binding until replacement freeze. |

### 6.2 Standard Planning Register

Before drafting, each volume SHALL maintain a **Standard Planning Register** that records:

| Field | Requirement |
|-------|-------------|
| Candidate area | Nonbinding topic from volume planning |
| Final disposition | Design Principle, Design Standard, Design Constraint, Design Policy, System Architecture Standard, or other approved disposition |
| Proposed standard name | Stable name matching future authorship |
| Reserved Standard ID | Permanent once assigned |
| Supporting Fact IDs | Verified facts that may inform drafting |
| Related vendor questions | HW-VQ identifiers or `None` |
| Company judgment required | Yes or No |
| Blocking dependency | HOLD facts, unresolved vendor questions, missing research, or `None` |
| Drafting readiness | Ready for Drafting, Ready With Qualification, Blocked, Not Applicable, or other approved label |
| Rationale and notes | Planning guidance only; not normative |

Standard planning for a volume MAY be marked complete only after every candidate area in scope receives a final disposition. Completing planning does not freeze any standard.

### 6.3 Design Standard Template (global)

FI-DSN-GOV-001 establishes **one global Design Standard Template** for all `FI-DSN-*` standards in Volumes 02 through 05. The required sections in the table below are the authoritative template baseline.

A volume MAY publish a **supplemental template schedule** that adds disposition-specific requirements or examples, but it SHALL NOT create an independent competing standard template. Any supplemental schedule MUST extend, not replace, the global template; MUST pass template freeze review; and MUST be recorded in the volume governance document.

Until a supplemental schedule is frozen, drafting SHALL use the global template requirements in this section only.

A Design Standard in status **Drafted, Pending Freeze** SHALL include at minimum:

| Section | Required | Notes |
|---------|----------|-------|
| Standard record | Yes | Metadata table with Standard ID, name, disposition, status, supporting facts, vendor questions, qualifications |
| Standard statement | Yes | One concise normative summary |
| Purpose | Yes | Non-normative |
| Scope | Yes | In-scope and explicit exclusions |
| Definitions | If needed | Terms used in requirements only |
| Normative requirements | Yes | Numbered Req IDs with Source column |
| Company judgment | When applicable | Disclosed decisions not established by evidence alone |
| Exceptions | Yes | Defined exceptions or explicit none |
| Out of scope | Yes | Table of excluded subjects with reason |
| Supporting evidence | Yes | Cited verified facts with qualifications preserved |
| Engineering implications | Section required; content may defer | SHALL state whether engineering implications are defined or deferred |
| Validation method | Yes | Implementation-independent compliance check |
| Related standards | Recommended | Informational cross-references only |
| Future revision notes | Yes | Conditions triggering revision |

### 6.4 Dispositions

Design Standard dispositions SHALL use stable type codes in Standard IDs:

| Disposition | ID pattern | Typical use |
|-------------|------------|-------------|
| **Design Principle** | `FI-DSN-PRN-###` | Governing design philosophy translated into a durable decision rule |
| **Design Standard** | `FI-DSN-STD-###` | Permanent design rule not better classified as principle, constraint, or policy |
| **Design Constraint** | `FI-DSN-CON-###` | Boundary limiting what F.I. Forgot may assume, claim, or design |
| **Design Policy** | `FI-DSN-POL-###` | Operational or presentation policy governing design decisions |
| **System Architecture Standard** | `FI-DSN-SYS-###` | Structural rules for systems such as templates, metadata, or collection architecture |

Volume-specific disposition extensions REQUIRE a documented revision to this governance document before use.

### 6.5 Requirement identifiers

Normative requirements SHALL use globally unique requirement identifiers:

```
{Full Standard ID}-R{nn}
```

Example: `FI-DSN-POL-001-R01`

Shortened requirement IDs are not permitted. Requirement identifiers SHALL remain stable across revisions unless a formal standard revision explicitly records renumbering.

### 6.6 Allowed Source values

The Source column in normative requirements SHALL use only these values unless freeze review approves an extension:

| Source value | Use when |
|--------------|----------|
| `{Fact ID}` | Requirement derives directly from a frozen verified fact in the governing research baseline |
| `{Fact ID} qualification` | Requirement preserves a stated qualification on a cited fact |
| `Company judgment` | F.I. Forgot decision not fully determined by verified evidence |
| `{Vendor Question ID} (pending)` | Provisional only when planning status explicitly allows pending vendor confirmation |

HOLD and REJECT facts SHALL NOT appear as Source support for permanent requirements.

---

## 7. Freeze Policy

### 7.1 Governance document freeze

FI-DSN-GOV-001 passed governance freeze review on July 22, 2026.

| Criterion | Result |
|-----------|--------|
| Authority hierarchy complete and non-contradictory with Research Library governance | Pass |
| Lifecycle, disposition, and ID rules defined | Pass |
| Relationship to Volume 01 manufacturing governance explicit | Pass |
| Evidence and company judgment policies align with Research Library and Design Library README | Pass |
| Brain Authority boundaries defined without authoring Brain logic | Pass |
| Change control and exception handling defined | Pass |
| No visual, artwork, typography, color, or layout standard introduced | Pass |
| Document internally consistent and publication quality | Pass |

This governance document is **Frozen Governance Standard**, Version 1.0, effective July 22, 2026.

### 7.2 Individual Design Standard freeze

A Design Standard in status **Drafted, Pending Freeze** MAY be promoted to **Frozen** only after **individual freeze review** confirms all applicable criteria:

| Criterion | Requirement |
|-----------|-------------|
| Identity and planning alignment | Standard ID, name, and disposition match the approved Standard Planning Register |
| Template compliance | All required sections for the disposition are present |
| Normative requirements | Stable Req IDs; SHALL or SHALL NOT language; allowed Source values only; every Source supports its requirement |
| Evidence discipline | Verified facts not expanded beyond evidence; qualifications preserved; company judgment disclosed and not represented as vendor evidence |
| Scope and dependencies | Exceptions and out-of-scope boundaries explicit; HOLD items not converted to requirements; cross-standard references accurate |
| Validation | References Req IDs; remains implementation independent |
| Prohibitions | No implementation specification smuggled into the standard unless explicitly allowed by disposition and freeze review |
| Stability | Standard does not rely on undocumented vendor behavior or unaudited claims |
| Partial draft handling | Blocked elements remain excluded; freeze record states what was and was not reviewed if partial |

Frozen Design Standards SHALL receive:

- Status **Frozen**
- A freeze date
- A concise individual freeze gate record

Revisions to frozen Design Standards REQUIRE documented change control per Section 15.

### 7.3 Partial freeze prohibition

A standard with blocked elements SHALL NOT be promoted to full **Frozen** status until blocked elements are either:

1. Drafted and included in freeze review, or
2. Explicitly excluded from scope through an approved scope revision recorded in the planning register and standard record

Partial drafts MAY remain in status **Drafted, Pending Freeze (elements blocked)** with a blocked completion record listing each blocked category, blocking cause, and resolution required.

---

## 8. Versioning Policy

### 8.1 Document versioning

Every Design Library governance document and every Design Standard SHALL maintain visible status and version metadata in its document control section.

| Version label | Meaning |
|---------------|---------|
| **1.0 Draft** | First governance or standard draft under review |
| **1.0** | First frozen baseline |
| **1.1** | Minor clarifications without material policy change |
| **2.0** | Material policy change, restructuring, or new normative requirements |

Architecture or planning drafts MAY use labels such as `Architecture Draft` or `Governance Review Draft` until first freeze.

### 8.2 Frozen standard versioning

Once frozen, a Design Standard's normative content SHALL change only through a documented revision that records:

- Revision date
- Affected Standard ID and Req IDs
- Reason for change
- Upstream evidence or planning changes that triggered revision
- Whether individual freeze review was repeated

Silent edits to frozen standards are prohibited.

### 8.3 Baseline alignment

When a governing verified facts baseline changes, affected Design Standards SHALL undergo downstream impact review before any normative requirement is revised. Impact review SHALL record whether each affected standard requires no change, clarification only, or material revision.

---

## 9. Evidence Policy

### 9.1 Evidence authority

Design Standards MAY cite only **frozen verified facts** from the Research Library as normative factual support.

Research reports, evidence audits, marketing pages, vendor brochures, implementation behavior, and design drafts are not verified facts and SHALL NOT support normative requirements directly.

### 9.2 Fact usage rules

| Rule | Requirement |
|------|-------------|
| Traceability | Material requirements grounded in evidence SHALL cite a Fact ID in the Source column |
| Qualification preservation | When a fact carries a material qualification, requirements SHALL preserve the qualification boundary or cite `{Fact ID} qualification` |
| HOLD facts | SHALL NOT support permanent requirements |
| REJECT facts | SHALL NOT support any requirement |
| Vendor questions | Unresolved HW-VQ items are nonnormative diligence unless planning explicitly allows provisional `(pending)` sourcing |
| No silent expansion | Requirements SHALL NOT expand verified statements beyond audited scope |
| Absence of evidence | Absence of evidence SHALL NOT be converted into a vendor limitation or customer-facing rule without company judgment explicitly labeled as such |

### 9.3 Supporting evidence section

Each Design Standard SHALL include a Supporting evidence section listing every verified fact cited by normative requirements, with qualifications preserved.

If no verified facts are cited, the section SHALL state that explicitly and SHALL explain why the standard is company-judgment-only.

### 9.4 Evidence boundaries

When knowledge is incomplete, Design Standards and volume governance documents SHALL use explicit boundary labels:

| Label | Meaning |
|-------|---------|
| **Unresolved** | Evidence does not yet support a conclusion |
| **Pending Vendor Confirmation** | Public evidence is insufficient; direct vendor input is required |
| **Deferred to Later Research Volume** | Subject is outside current research scope |
| **Company Decision Independent of Vendor Fact** | F.I. Forgot chose a rule not derived from vendor disclosure |

Evidence boundaries SHALL NOT be removed silently during revision.

---

## 10. Company Judgment Policy

### 10.1 When company judgment is required

F.I. Forgot SHALL use company judgment when verified evidence informs a decision but does not fully determine:

- Whether F.I. Forgot adopts a practice
- The scope or applicability of a design rule
- How conservative or expansive a customer-facing or production-facing representation may be
- How to interpret vendor disclosure without adopting it as an F.I. Forgot promise

### 10.2 Disclosure rules

| Rule | Requirement |
|------|-------------|
| Per-requirement sourcing | Use `Company judgment` in the Source column only when that specific requirement is directly supported by company judgment |
| Section disclosure | The Company judgment section SHALL list decisions not established by vendor disclosure alone |
| No disguise | Company judgment SHALL NOT be represented as verified vendor fact |
| No automatic adoption | Vendor capability or vendor aesthetic practice SHALL NOT automatically become an F.I. Forgot Design Standard |

### 10.3 Relationship to design judgment

**Design judgment** (creative or experiential choices) MAY inform drafting but SHALL become binding only when expressed as normative requirements with appropriate Source values, usually `Company judgment`.

Exploratory creative direction, mood boards, and draft artwork are not Design Standards.

---

## 11. Brain Authority

The Brain Architecture governs what F.I. Forgot should express in the message. The Design Library governs how the product experience is visually and physically presented within authored Design Standards.

### 11.1 Separation of authority

| Domain | Governing layer | This document's boundary |
|--------|-----------------|--------------------------|
| Message intent, relationship context, occasion reasoning | Brain Architecture | Out of scope |
| Message wording and voice | Writing engine | Out of scope |
| Visual presentation, design structure, collection governance | Design Library / Design Standards | In scope for standard authoring rules only |
| Production reliability and manufacturing boundaries | Volume 01 Manufacturing Standards | Related but distinct |

### 11.2 Prohibited conflation

Design Standards SHALL NOT:

- Define Brain decision logic, scoring, routing, or selection algorithms
- Require specific message text, tone outputs, or relationship inferences
- Treat Brain outputs as evidence
- Compensate for Brain Architecture gaps by hard-coding message decisions into design rules

Volume 04 (Artwork Intelligence) MAY govern **constraints on artwork selection** as Design Standards. It SHALL NOT author Brain execution logic. Artwork Intelligence standards SHALL specify what design governance requires, not how the Brain computes choices.

### 11.3 Informational references

Design Standards MAY reference Brain Architecture documents as **informational only** unless a separate, explicit cross-library governance decision assigns binding authority, which itself requires documented approval outside implementation.

### 11.4 Brain recommendation and customer override boundaries

The following rules govern the relationship between Brain visual recommendations, customer override authority, and frozen compliance boundaries. They do not define user interface behavior, specific visual choices, or implementation logic.

- The Brain SHALL make the initial visual treatment recommendation only within boundaries established by approved Design Standards.
- The customer MAY override the Brain's visual treatment recommendation when an allowed alternative exists under those same approved Design Standards.
- A customer override SHALL NOT permit violation of frozen Design Standards, frozen Manufacturing Standards, production feasibility, safety requirements, legal requirements, or other applicable mandatory constraints.
- Customer override authority changes the selected treatment only. It does not change governing compliance boundaries.

---

## 12. Relationship to Manufacturing Standards

Volume 01 Manufacturing and Production Standards govern manufacturing principles, manufacturing constraints, and operational policies for production and fulfillment.

### 12.1 Distinct domains

| Domain | Governing documents |
|--------|---------------------|
| Manufacturing and production decisions | Volume 01 manufacturing standards (`FI-MFG-*`) |
| Design language, card system, artwork intelligence, collections | Future `FI-DSN-*` standards in Volumes 02 through 05 |

Manufacturing Standards do not automatically govern visual design. Design Standards do not automatically override manufacturing constraints.

### 12.2 Interaction rules

| Rule | Requirement |
|------|-------------|
| Manufacturability | Design Standards SHALL NOT require production outcomes that contradict frozen manufacturing constraints when those constraints apply |
| Manufacturing precedence | Manufacturing feasibility and frozen manufacturing constraints take precedence over aesthetic preference, customer experience presentation choices, or implementation convenience when those interests conflict |
| Informational cross-reference | A Design Standard MAY list a manufacturing standard as informational only |
| No duplication | Design Standards SHALL NOT restate manufacturing operational policy unless a freeze review approves a narrow cross-domain requirement with explicit scope |
| Upstream facts | Manufacturing and design standards may cite the same verified fact with different qualifications and different company judgments in scope |

### 12.3 Volume 01 supremacy for manufacturing

The frozen Manufacturing Standard Template v1.0 and authored `FI-MFG-*` standards remain authoritative for manufacturing standard structure and manufacturing normative content. This document does not supersede Volume 01 manufacturing governance for `FI-MFG-*` standards.

---

## 13. Standard Dependencies

### 13.1 Dependency classes

| Dependency type | Definition | Handling |
|-----------------|------------|----------|
| **Upstream evidence** | Frozen verified facts required before drafting | Block drafting until baseline frozen or boundary recorded |
| **Upstream standard** | Another frozen standard that informs scope | Reference as informational; do not duplicate normative text without justification |
| **Downstream consumer** | Engineering specification or implementation relying on the standard | Identify in Engineering implications; do not specify implementation in the standard |
| **Cross-volume dependency** | Design Volume requires another volume's standard | Record in planning register and Related standards |
| **Vendor diligence** | Unresolved HW-VQ blocking subject matter | Block affected elements; keep diligence nonnormative unless promoted |

### 13.2 Dependency documentation

Each volume governance document or Standard Planning Register SHALL record blocking dependencies explicitly. Silent dependencies are prohibited.

### 13.3 Circular dependency prohibition

Design Standards SHALL NOT create unsupported circular normative dependencies. If two standards must align, freeze review SHALL confirm consistent scope and identify a primary standard for each requirement topic.

---

## 14. Normative Language

### 14.1 Requirement modal verbs

Normative requirements in Design Standards SHALL use **SHALL** for mandatory requirements and **SHALL NOT** for prohibitions.

| Term | Use |
|------|-----|
| **SHALL** | Binding requirement |
| **SHALL NOT** | Binding prohibition |
| **SHOULD** | Not permitted in normative requirements except inside quoted external text |
| **MAY** | Permitted only in non-normative explanatory text, not in requirement tables |
| **MUST** | Not used in Design Standards; use SHALL |

### 14.2 Implementation independence

Normative requirements SHALL be testable at the policy or design-governance level without prescribing code, APIs, databases, file formats, tooling, or UI behavior unless a future freeze review explicitly approves a narrow exception for a System Architecture Standard.

### 14.3 Prohibited smuggling

The following SHALL NOT appear as normative Design Standard requirements unless a disposition and freeze review explicitly allow architectural specification in a System Architecture Standard:

- API endpoints, field names, or payload schemas
- Database tables or columns
- Application workflow steps or routing logic
- Illustration prompts, model parameters, or generation pipelines
- Color values, font files, pixel dimensions, or artwork composition rules (these belong in future visual standards, not in this governance document)

---

## 15. Change Control

### 15.1 Change control scope

Change control applies to:

- This governance document
- Volume governance documents
- All Design Standards
- Standard Planning Registers and reserved ID indexes

### 15.2 Revision sequence

Material changes SHALL follow this sequence where applicable:

1. **Proposed revision** — change scope, rationale, and affected documents recorded before edit
2. **Impact review** — downstream standards, templates, engineering implications, and evidence dependencies assessed
3. **Evidence audit revision** — new or changed claims evaluated in the research volume `02-evidence-audit.md`
4. **Verified facts update** — promoted facts added or revised in `03-verified-facts.md` with change log entry
5. **Planning update** — Standard Planning Register updated if IDs, disposition, or blocking status changes
6. **Design standard revision** — affected standards drafted or revised
7. **Formal approval** — governance or individual freeze review completed before promotion
8. **Freeze review** — governance or individual freeze repeated when normative content changes materially
9. **Change log and revision history** — material Design Library changes recorded; superseded frozen text preserved in revision history

### 15.3 Revision rules

- Held Fact IDs SHALL NOT be treated as resolved without documented vendor confirmation and Research Library promotion
- Fact qualifications SHALL NOT be removed silently
- Standards SHALL NOT be broadened without re-audit and documented revision
- Reserved Standard IDs SHALL NOT be reassigned to a different subject
- Engineering implications SHALL be reviewed when governing facts or standards change

### 15.4 Status metadata

Every revision SHALL update document control status, version, and revision history.

---

## 16. Exception Handling

### 16.1 Standard exceptions

A Design Standard MAY define explicit exceptions in its Exceptions section. Undefined exceptions do not exist.

Any future exception to a frozen Design Standard REQUIRE:

1. Documented standard revision
2. Recorded rationale
3. Scope limit for the exception
4. Individual freeze review when the exception changes normative requirements

### 16.2 Emergency deviation

Operational emergency deviation from a frozen Design Standard is not authorized by this governance document. Emergency handling REQUIRE a separate company policy outside this document.

### 16.3 Governance exceptions

Exceptions to this governance document REQUIRE governance freeze review and a version increment of this document. Ad hoc bypass of lifecycle, evidence, or freeze rules is prohibited.

---

## 17. Future Expansion

### 17.1 Additional volumes

New Design Library volumes REQUIRE:

- Entry in `playbook/design/README.md` volume architecture
- Documented scope and upstream/downstream dependencies
- Approval through Design Library governance review before standard planning begins

### 17.2 Additional dispositions or ID codes

New disposition types or Standard ID patterns REQUIRE revision to this governance document before assignment in a Standard Planning Register.

### 17.3 Volume supplemental template schedules

Volumes 02 through 05 MAY freeze **supplemental template schedules** that extend but do not contradict the global Design Standard Template in Section 6.3.

Supplemental schedules SHALL:

- Add disposition-specific requirements or examples only
- Not replace, bypass, or compete with the global template
- Pass template freeze review before use for individual standard freeze
- Be recorded in the volume governance document

No volume MAY author an independent competing standard template without a documented revision to FI-DSN-GOV-001.

### 17.4 Engineering and validation frameworks

Population of library-wide Engineering Implications registers and Validation Requirements frameworks is deferred. Volume governance documents MAY hold placeholders until a separate authorized workstream defines them.

---

## 18. References

| Reference | Path | Role |
|-----------|------|------|
| Research Library governance | `playbook/research/README.md` | Upstream evidence governance |
| Design Library architecture | `playbook/design/README.md` | Library philosophy, volume architecture, general traceability |
| Volume 01 Manufacturing and Production Standard | `playbook/design/volume-01-manufacturing/01-handwrytten-production-standard.md` | Manufacturing standard governance and `FI-MFG-*` standards |
| Handwrytten Manufacturing Overview verified facts | `playbook/research/handwrytten/volume-01-manufacturing-overview/03-verified-facts.md` | Example frozen verified baseline |
| Handwrytten Manufacturing Overview evidence audit | `playbook/research/handwrytten/volume-01-manufacturing-overview/02-evidence-audit.md` | Example evidence audit and vendor questions |
| Handwrytten Manufacturing Overview change log | `playbook/research/handwrytten/volume-01-manufacturing-overview/04-change-log.md` | Example verified baseline revision history |

Future research volumes for design-related subjects SHALL be referenced here when frozen baselines exist.

---

## 19. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 Draft | July 22, 2026 | F.I. Forgot | Sprint D1.1 — initial Design Standards governance document created for review |
| 1.0 Draft | July 22, 2026 | F.I. Forgot | Formal freeze review — assigned FI-DSN-GOV-001; clarified global Design Standard Template, manufacturing precedence, and change-control sequence |
| 1.0 | July 22, 2026 | F.I. Forgot | Frozen — added Brain recommendation and customer override boundaries (Section 11.4); promoted to Frozen Governance Standard |

---

**End of Document**
