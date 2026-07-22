# F.I. Forgot Design Library

# FI-DSN-CLS-001 — Design Classification Strategy

## 1. Document Control

| Field | Value |
|-------|-------|
| **Strategy identifier** | FI-DSN-CLS-001 |
| **Title** | Design Classification Strategy |
| **Document** | `02-design-classification-strategy.md` |
| **Sprint** | D1.3 |
| **Classification** | Frozen Classification Strategy |
| **Status** | Frozen Classification Strategy |
| **Version** | 1.0 |
| **Date** | July 22, 2026 |
| **Freeze date** | July 22, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md`; `playbook/design/README.md` |
| **Downstream consumers** | Future Design Planning Register; Drafting Queue; Identifier System; Volume Roadmap |

**Source basis:** Company judgment. This taxonomy is an F.I. Forgot governance choice. It is not derived from vendor facts or verified evidence.

---

## 2. Purpose

This document defines the stable **classification system** used to categorize all future F.I. Forgot Design Standards and Design Library planning artifacts before the Planning Register, Drafting Queue, Identifier System, and Volume Roadmap are created.

Classification answers one question: **What subject matter does this standard primarily govern?**

Classification does **not** answer:

- What kind of standard it is (disposition)
- Where visual content originated or how it was produced (visual source)
- Where the file is stored (repository location)
- What evidence supports it (Source mapping)
- How it is implemented (engineering specification)

The classification system SHALL:

- Make every standard easy to locate
- Reduce overlap between categories
- Establish a primary classification rule
- Permit controlled secondary classifications where useful
- Distinguish subject matter from standard disposition and from visual source
- Remain scalable as the Design Library grows
- Support future Planning Register, Drafting Queue, Identifier System, and Volume Roadmap work
- Preserve separation between Design, Manufacturing, Product Intelligence, Research, and Implementation

This document is the **frozen classification authority** for subject-matter classification of future Design Standards and Design Library planning artifacts. It is not a Design Standard and SHALL NOT be cited as normative visual policy.

**Status:** Frozen Classification Strategy, Version 1.0, effective July 22, 2026.

---

## 3. Scope

### In scope

- Classification taxonomy and definitions
- Distinction between classification and visual source
- Primary and secondary classification rules
- Boundary ownership between overlapping domains
- Relationship between classification and disposition, volumes, manufacturing, Brain authority, and research
- Classification assignment and change-control procedure
- Validation checklist for classification decisions

### Out of scope

- Individual Design Standard authoring
- Design Planning Register population
- Standard ID reservation or identifier-system rules
- Visual Source attribute schema freeze or identifier assignment for source values
- Volume Roadmap freeze or volume numbering decisions beyond existing repository architecture
- Visual design rules, artwork direction, typography, color, layout, illustration style, or aesthetic outcomes
- Brain algorithms, prompt logic, recommendation scoring, or product-intelligence implementation
- Manufacturing operational policy (`FI-MFG-*`)
- Research collection, evidence audit, or verified-facts promotion
- Engineering specifications, APIs, databases, UI behavior, or implementation code

---

## 4. Classification Principles

The following principles govern all classification decisions:

1. **Single primary ownership.** Every Design Standard SHALL have exactly one primary classification.
2. **Limited secondary use.** A standard MAY have secondary classifications only when it materially governs more than one domain. Secondary classifications SHALL NOT exceed two. This limit MAY be revised only through formal change control after practical Planning Register evidence demonstrates that the limit is insufficient.
3. **No duplicate ownership.** Secondary classification does not create duplicate standards, duplicate planning entries, or competing primary ownership.
4. **Principal subject rule.** Classification follows the principal governed subject, not every subject mentioned, referenced, or excluded.
5. **Visual source independence.** Visual source describes provenance or generation origin. Visual source SHALL NOT determine primary classification.
6. **Treatment mode independence.** Treatment modes such as typography-only presentation SHALL NOT create separate classifications. They are governed through the applicable subject classification.
7. **Manufacturing reference rule.** Manufacturing constraints cited by a Design Standard do not automatically make **Manufacturing Integration** the primary classification.
8. **Brain reference rule.** Brain interaction or customer override boundaries cited by a Design Standard do not automatically make **Brain Visual Selection** the primary classification.
9. **Evidence independence.** Verified facts and vendor questions inform drafting but do not determine classification.
10. **Repository independence.** File path, folder name, or volume placement does not override formal classification recorded in planning registers.
11. **Implementation independence.** Classification SHALL NOT be based on current code modules, services, databases, or UI components.
12. **Name stability.** Classification names and codes SHALL remain stable once used by frozen standards unless revised through Classification Change Control (Section 16).
13. **No catch-all categories.** Vague classifications such as General, Miscellaneous, Other, Creative, or Visuals are prohibited.
14. **Domain names only.** Classification names describe governance domains. They do not prescribe aesthetic outcomes.

---

## 5. Disposition, Classification, and Visual Source

Disposition, classification, and visual source are orthogonal planning attributes. Each answers a different question and SHALL NOT be conflated.

| Attribute | Question answered | Governed by | Example |
|-----------|-------------------|-------------|---------|
| **Disposition** | What kind of standard is it? | `FI-DSN-GOV-001` Section 6.4 | `POL` — Design Policy |
| **Classification** | What subject matter does it govern? | This document | `Photography` — photography domain rules |
| **Visual Source** | What is the provenance or generation source of the governed visual content? | Future planning metadata (schema not frozen in this sprint) | `Customer Uploaded` — customer-origin imagery |

### Frozen dispositions

| Code | Disposition | ID pattern |
|------|-------------|------------|
| **PRN** | Design Principle | `FI-DSN-PRN-###` |
| **STD** | Design Standard | `FI-DSN-STD-###` |
| **CON** | Design Constraint | `FI-DSN-CON-###` |
| **POL** | Design Policy | `FI-DSN-POL-###` |
| **SYS** | System Architecture Standard | `FI-DSN-SYS-###` |

Disposition SHALL NOT be inferred from classification or visual source. Classification SHALL NOT be inferred from disposition or visual source.

**Template field note:** In `FI-DSN-TPL-001` Document Control, the field named **Classification** records **disposition type** (Design Principle, Design Standard, Design Constraint, Design Policy, or System Architecture Standard). Subject-matter classification uses `CLS-*` codes from this strategy and SHALL be recorded in future planning metadata alongside disposition. The two attributes SHALL NOT be conflated.

### Visual Source (controlled attribute, schema not frozen)

Visual source is a separate controlled attribute used in future planning metadata. It describes **provenance or generation origin**, not subject-matter ownership.

Customer uploaded and AI generated describe visual source, origin, or provenance rather than durable subject matter. They are not classifications.

The future controlled Visual Source values MAY include, as **nonnormative planning examples only**:

- Customer Uploaded
- Curated F.I. Forgot
- AI Generated
- Typography Only
- Not Applicable

This sprint does not freeze the final Visual Source attribute schema. No identifiers are assigned to these source values.

### Illustrative pairing (nonnormative)

The following examples explain attribute logic only. They do not reserve Standard IDs or assign planning entries.

| Illustrative future standard topic | Disposition | Primary classification | Visual Source (example) | Why |
|------------------------------------|-------------|------------------------|-------------------------|-----|
| Photography usage policy | POL | Photography | Curated F.I. Forgot | Principal subject is photographic asset governance |
| Customer-upload photograph eligibility policy | POL | Photography | Customer Uploaded | Subject is photography; upload is provenance |
| AI-generated illustration boundary policy | POL | Illustration | AI Generated | Subject is illustration; generation method is provenance |
| Typography-only card surface policy | POL | Typography | Typography Only | Subject is typography; typography-only is a treatment mode |
| Card template metadata schema | SYS | Card Architecture | Not Applicable | Principal subject is structural card-system architecture |
| Brain-permitted artwork alternative rule | POL | Brain Visual Selection | Not Applicable | Principal subject is selection-boundary governance |
| Envelope exterior presentation policy | POL | Envelope and Exterior Presentation | Not Applicable | Principal subject is exterior presentation domain |

A subject-specific policy uses `POL` (or another applicable disposition) as its disposition and the applicable subject classification. It does not use `CLS-GOV` unless the principal subject is Design Library meta-governance.

---

## 6. Classification Taxonomy

The Design Library uses **18** primary classification domains grouped into six families.

| Family | Classification code | Classification name |
|--------|---------------------|---------------------|
| **Library and governance** | `CLS-GOV` | Governance |
| **Philosophy and brand** | `CLS-VPH` | Visual Philosophy |
| | `CLS-BEX` | Brand Expression |
| **Card system structure** | `CLS-CAR` | Card Architecture |
| | `CLS-CMP` | Composition and Layout |
| **Visual element domains** | `CLS-TYP` | Typography |
| | `CLS-COL` | Color |
| | `CLS-ART` | Artwork |
| | `CLS-ILL` | Illustration |
| | `CLS-PHO` | Photography |
| **Experience and intelligence** | `CLS-OEC` | Occasion and Emotional Context |
| | `CLS-BVS` | Brain Visual Selection |
| | `CLS-PER` | Personalization |
| **Presentation and quality** | `CLS-EEP` | Envelope and Exterior Presentation |
| | `CLS-ACI` | Accessibility and Inclusion |
| | `CLS-MFI` | Manufacturing Integration |
| | `CLS-VQA` | Visual Quality Assurance |
| **Library operations** | `CLS-ASG` | Asset Library Governance |

### Taxonomy rules

- Every classifiable Design Standard SHALL map to exactly one `CLS-*` primary code from this taxonomy.
- New `CLS-*` codes REQUIRE revision to this strategy before use.
- Merging or splitting classifications REQUIRE revision to this strategy and downstream impact review of frozen standards.
- Visual source values SHALL NOT be added to this taxonomy.

---

## 7. Classification Definitions

Each definition states domain ownership only. Definitions do not prescribe visual outcomes.

### CLS-GOV — Governance

**Owns:** Design Library meta-governance and planning artifacts, including:

- Governance standards for the Design Library itself
- Templates
- Classification strategy
- Identifier strategy
- Planning registers
- Drafting queues
- Volume roadmaps
- Change control for the Design Library itself

**Does not own:** Subject-specific visual or product policies. A subject-specific policy uses the applicable disposition (for example, `POL`) and the applicable subject classification. `CLS-GOV` SHALL NOT become a catch-all for policies that belong in visual, experience, or library-operations domains.

### CLS-VPH — Visual Philosophy

**Owns:** Durable F.I. Forgot visual philosophy, emotional design principles, and identity-level design reasoning that is not a specific brand asset rule.

**Does not own:** Executable brand asset rules (Brand Expression), card structure (Card Architecture), or domain-specific typography/color/artwork standards.

### CLS-BEX — Brand Expression

**Owns:** How F.I. Forgot brand identity is expressed in governed design artifacts, including brand-boundary rules for marks, voice-adjacent visual identity elements, and brand-consistent presentation discipline.

**Does not own:** Abstract visual philosophy (Visual Philosophy), generic typography/color systems unless the principal subject is brand-bound expression rather than the element domain itself.

### CLS-CAR — Card Architecture

**Owns:** Structural architecture of the greeting card product: templates, regions, metadata schema, production structure, card surfaces, and system-level card organization.

**Does not own:** Aesthetic composition rules (Composition and Layout), envelope and exterior presentation (Envelope and Exterior Presentation), individual artwork-type domains, or manufacturing operational policy.

### CLS-CMP — Composition and Layout

**Owns:** Spatial organization, region relationships, placement discipline, and layout-boundary rules within governed card or presentation surfaces.

**Does not own:** Template/schema architecture (Card Architecture), element-specific typography/color/artwork rules unless layout is not the principal subject. Typography-only treatment mode rules belong here only when spatial placement is the principal subject.

### CLS-TYP — Typography

**Owns:** Typographic systems, type usage boundaries, and typography-domain governance for governed surfaces, including typography-only treatments when typography is the principal governed subject.

**Does not own:** Handwritten message presentation governed by manufacturing or message-engine domains. Typography-only treatment mode does not create a separate classification.

### CLS-COL — Color

**Owns:** Color system governance, color usage boundaries, and color-domain policy.

**Does not own:** Brand philosophy (Visual Philosophy) unless color is only incidental; brand-bound color identity rules where brand expression is principal (Brand Expression).

### CLS-ART — Artwork

**Owns:** Cross-medium artwork governance that applies regardless of production method or visual source, including artwork eligibility, artwork-boundary rules, and artwork-domain policy not better classified under Illustration or Photography.

**Does not own:** Medium-specific domains when the medium is the principal subject; provenance or generation source (visual source attribute).

### CLS-ILL — Illustration

**Owns:** Illustration-specific governance, including illustration asset boundaries and illustration-domain policy.

**Does not own:** Generic artwork rules better classified as Artwork when medium is intentionally unspecified; visual source provenance (for example, AI Generated remains a visual source value, not a classification).

### CLS-PHO — Photography

**Owns:** Photography-specific governance, including photographic asset boundaries and photography-domain policy.

**Does not own:** Visual source provenance (for example, Customer Uploaded remains a visual source value, not a classification); personalization workflow policy where upload is only one mechanism (Personalization).

### CLS-OEC — Occasion and Emotional Context

**Owns:** Occasion semantics, emotional-context boundaries, and governed rules for how occasion or emotional intent may be represented in design decisions.

**Does not own:** Brain recommendation mechanics (Brain Visual Selection), artwork medium domains.

### CLS-BVS — Brain Visual Selection

**Owns:** Governance of Brain-permitted visual treatments, allowed alternatives, override boundaries, and selection-constraint policy for visual recommendations.

**Does not own:** Brain execution logic, occasion semantics (Occasion and Emotional Context), individual artwork medium domains. Typography-only treatment boundaries belong here only when Brain selection policy is the principal subject.

### CLS-PER — Personalization

**Owns:** Personalization policy governing customer-specific or relationship-specific visual treatment boundaries.

**Does not own:** Visual source provenance for customer uploads (recorded as visual source, not classification); Brain selection constraints when selection policy is principal (Brain Visual Selection).

### CLS-EEP — Envelope and Exterior Presentation

**Owns:** Envelope, exterior, and outward-facing presentation boundaries for the physical product experience outside card structure and card-surface domains owned by Card Architecture.

**Does not own:** Card structure and card surfaces (Card Architecture), manufacturing fulfillment policy (`FI-MFG-*`).

### CLS-ACI — Accessibility and Inclusion

**Owns:** Accessibility and inclusion boundaries for governed visual and presentation decisions.

**Does not own:** Domain-specific typography/color/layout rules unless accessibility is incidental rather than principal.

### CLS-MFI — Manufacturing Integration

**Owns:** Design-side standards whose principal subject is integrating design decisions with manufacturing feasibility, production handoff, or cross-domain manufacturability governance.

**Does not own:** Visual-domain standards that merely cite manufacturing constraints; manufacturing operational policy itself (`FI-MFG-*`).

### CLS-VQA — Visual Quality Assurance

**Owns:** Cross-standard visual quality assurance policy, inspection categories, and library-level quality governance beyond the Validation section inside an individual standard.

**Does not own:** Per-standard validation method text required by `FI-DSN-TPL-001` Section 12.

### CLS-ASG — Asset Library Governance

**Owns:** Governance of asset libraries, collections, release structure, retention, and library operations for governed design assets.

**Does not own:** Rules governing a single asset medium (Illustration, Photography, etc.) when the medium is principal.

---

## 8. Primary Classification Rule

When assigning primary classification, apply the following decision order:

1. Identify the **principal governed subject** — the main design domain whose rules the standard exists to establish.
2. Exclude incidental references to other domains, including manufacturing citations, Brain-boundary citations, evidence sources, visual source, and cross references.
3. Select the **narrowest** classification that fully owns the principal subject.
4. If two domains appear equal, prefer the domain that would remain governed if the other were removed.
5. Record visual source separately when relevant. Do not use visual source to select primary classification.
6. If ownership is still ambiguous, record the candidate in **Open Planning Questions** (Section 19) and do not assign a Standard ID until resolved.
7. Record the primary `CLS-*` code in future planning registers. Repository path alone SHALL NOT determine the code.

A standard SHALL have exactly one primary `CLS-*` code.

---

## 9. Secondary Classification Rule

Secondary classification is optional and constrained.

A secondary `CLS-*` code MAY be assigned only when **all** of the following are true:

1. The standard materially governs a second domain, not merely mentions or excludes it.
2. The second domain would require a separate planning candidate if split from the standard.
3. Splitting the standard would create artificial duplication or loss of coherence.
4. The secondary code is recorded with a one-sentence justification in planning metadata.
5. The count of secondary codes does not exceed two.

The maximum of two secondary classifications remains in effect. This limit MAY be revised only through formal change control after practical Planning Register evidence demonstrates that the limit is insufficient.

Secondary classification SHALL NOT:

- Create a second primary owner
- Justify duplicate standards in the Planning Register
- Override the primary classification for queue ordering, identifier grouping, or volume reading sequence
- Substitute for visual source metadata

---

## 10. Cross Classification and Boundary Rules

The following boundary decisions resolve common overlap areas. They define ownership only, not visual rules.

| Overlap area | Primary owner | Rule |
|--------------|---------------|------|
| **Card Architecture vs Composition and Layout** | Card Architecture for structure, schema, templates, card surfaces, and system regions; Composition and Layout for spatial placement and region relationships within governed surfaces | If removing layout rules leaves a structural/system standard, classify as Card Architecture. If removing structure leaves only placement discipline, classify as Composition and Layout. |
| **Card Architecture vs Envelope and Exterior Presentation** | Card Architecture for card structure and card surfaces; Envelope and Exterior Presentation for envelope and exterior presentation | Envelope and exterior presentation does not absorb card structure. Card Architecture does not absorb outward-facing envelope policy. |
| **Artwork vs Illustration vs Photography** | Illustration or Photography when medium is the principal subject; Artwork when the standard governs artwork generically across media or before medium is determined | Medium-specific standards SHALL NOT use Artwork as a convenience primary. |
| **Visual subject vs Visual Source** | Classification by visual subject or medium; Visual Source recorded separately for provenance or generation origin | A customer-uploaded photograph remains Photography by classification and Customer Uploaded by visual source. An AI-generated illustration remains Illustration by classification and AI Generated by visual source. |
| **Typography vs typography-only treatment mode** | Typography when typography is the principal governed subject; Composition and Layout, Brain Visual Selection, or Brand Expression when those domains are principal | Typography Only is a treatment mode and a possible visual source value, not a classification. Typography-only treatments MAY be governed through Typography, Composition and Layout, Brain Visual Selection, Brand Expression, or other applicable standards according to the principal governed subject. |
| **Brand Expression vs Visual Philosophy** | Visual Philosophy for identity-level principles and reasoning; Brand Expression for governed brand-asset and brand-boundary rules | Philosophy explains why; brand expression governs what F.I. Forgot brand presentation may do. |
| **Brain Visual Selection vs Occasion and Emotional Context** | Brain Visual Selection for recommendation and override-boundary policy; Occasion and Emotional Context for occasion/emotion semantics | Selection mechanics do not absorb occasion semantics, and occasion semantics do not absorb Brain-boundary policy. |
| **Personalization vs customer-upload visual source** | Personalization when customer-specific treatment policy is principal; visual source recorded separately when upload is the provenance mechanism | Upload mechanism alone does not change classification when personalization policy is the principal subject. |
| **Manufacturing Integration vs visual domains citing manufacturing** | Manufacturing Integration only when integration/feasibility/handoff is the principal subject; otherwise retain the visual domain primary | A Color or Card Architecture standard citing `FI-MFG-*` constraints keeps its visual primary. |
| **Visual Quality Assurance vs per-standard Validation** | Visual Quality Assurance for library-level QA policy; individual standard Validation sections remain template-required per-standard compliance checks | Do not classify every standard as Visual Quality Assurance because it has a Validation section. |
| **Asset Library Governance (`CLS-ASG`) vs individual asset types** | Asset Library Governance for library/collection operations; Illustration/Photography/Artwork/etc. when a single medium or asset class is principal | Library operations do not absorb medium-specific ownership. |
| **Handwritten message presentation** | No dedicated `CLS-*` classification at this stage | Handwritten message presentation remains governed by manufacturing or message-engine domains outside this taxonomy until future planning justifies otherwise. |

---

## 11. Relationship to Design Volumes

Classification and volume are related but not identical.

| Concept | Role |
|---------|------|
| **Classification** | Subject ownership for planning, queueing, and discovery |
| **Volume** | Library organization and reading sequence in the Design Library |

Rules:

- One volume MAY contain more than one classification.
- One classification MAY span more than one volume only when formally justified in future volume planning and recorded in the Volume Roadmap.
- Volume placement SHALL NOT override primary classification.
- Cross-volume classification ownership is deferred to the future Volume Roadmap.
- Existing repository architecture identifies five volumes (01 Manufacturing and Production; 02 Design Language; 03 Card Design System; 04 Artwork Intelligence; 05 Signature Collections) in `playbook/design/README.md`. This strategy does not freeze a Design Volume Roadmap.

### Informational volume affinity (nonnormative)

| Volume | Typical primary classifications often found there |
|--------|---------------------------------------------------|
| **02 Design Language** | Visual Philosophy, Brand Expression, Typography, Color, Composition and Layout |
| **03 Card Design System** | Card Architecture, Composition and Layout |
| **04 Artwork Intelligence** | Brain Visual Selection, Occasion and Emotional Context, Personalization |
| **05 Signature Collections** | Asset Library Governance, Artwork, Illustration, Photography |
| **Cross-volume** | Governance, Accessibility and Inclusion, Manufacturing Integration, Visual Quality Assurance, Envelope and Exterior Presentation |

Affinity is planning guidance only. Primary classification remains authoritative. Final cross-volume placement is deferred to the Volume Roadmap.

Volume 01 governs `FI-MFG-*` manufacturing standards and is outside the `FI-DSN-*` classification taxonomy except where future cross-library planning explicitly requires a bridge record.

---

## 12. Relationship to Manufacturing

| Rule | Requirement |
|------|-------------|
| Manufacturing authority | `FI-MFG-*` standards in Volume 01 remain authoritative for manufacturing and production policy |
| Classification boundary | Manufacturing Integration (`CLS-MFI`) governs design-side integration only |
| Citation rule | Visual-domain standards may cite manufacturing constraints without reclassifying to Manufacturing Integration |
| No duplication | Classification does not restate manufacturing operational policy |
| Feasibility precedence | Manufacturing feasibility remains governed by frozen manufacturing standards and `FI-DSN-GOV-001`; classification does not alter that precedence |
| Handwritten message | Handwritten message presentation does not require a `CLS-*` classification at this stage |

---

## 13. Relationship to Brain and Product Intelligence

| Rule | Requirement |
|------|-------------|
| Brain authority | Brain Architecture governs message intent; Brain Visual Selection (`CLS-BVS`) governs design-side visual recommendation and override boundaries only |
| No algorithm ownership | Classification does not define Brain algorithms, scoring, prompts, or routing |
| Customer override | Override-boundary policy belongs to Brain Visual Selection or the relevant visual domain, following the principal-subject rule |
| Product intelligence separation | Occasion and Emotional Context (`CLS-OEC`) owns semantics; Brain Visual Selection owns selection-boundary governance |
| Implementation separation | Product intelligence implementation remains outside this classification system |

---

## 14. Relationship to Research and Evidence

| Rule | Requirement |
|------|-------------|
| Company judgment | The classification taxonomy is a company governance choice |
| Evidence independence | Verified facts may inform future standards but do not determine `CLS-*` assignment |
| Vendor facts | Vendor capabilities or disclosures do not create classifications |
| HOLD and REJECT | Held or rejected facts do not justify new classifications or reclassification |
| Research separation | Research volumes govern evidence; this strategy governs design subject ownership |

When a future standard is drafted, evidence belongs in the standard's Evidence section per `FI-DSN-TPL-001`. Classification belongs in planning metadata per this strategy.

---

## 15. Classification Assignment Procedure

Use this procedure when evaluating a candidate Design Standard during future planning:

1. **Describe the candidate** — state the principal governed subject in one sentence.
2. **Assign disposition** — select `PRN`, `STD`, `CON`, `POL`, or `SYS` per `FI-DSN-GOV-001`.
3. **Identify candidate primary classifications** — list no more than three `CLS-*` candidates.
4. **Apply the primary classification rule** — Section 8.
5. **Record visual source separately** — when provenance or generation origin is relevant, assign a future visual source value in planning metadata. Do not use visual source to select classification.
6. **Test boundary rules** — Section 10 for each overlap risk.
7. **Evaluate secondary need** — Section 9; assign zero, one, or two secondary codes only if justified.
8. **Record in planning metadata** — disposition, primary code, secondary code(s), visual source (when applicable), justification, and unresolved questions.
9. **Validate** — complete Section 18 checklist before Planning Register entry is marked ready for ID reservation.

Classification assignment occurs **before** Standard ID reservation in the future Identifier System and Planning Register workstreams.

---

## 16. Classification Change Control

Changes to this strategy REQUIRE documented revision under `FI-DSN-GOV-001` Section 15.

| Change type | Required action |
|-------------|-----------------|
| New `CLS-*` code | Demonstrate subject ownership need; revise this strategy; downstream impact review; update future Planning Register rules |
| Rename of classification | Revise this strategy; map old code to new code; preserve historical classification records; review frozen standards using old code |
| Merge or split of classifications | Revise this strategy; preserve historical classification records; review all planning entries and frozen standards affected |
| Reclassification of frozen standard | Documented revision only; silent reassignment prohibited; historical assignment preserved in revision history |
| Boundary rule change | Revise Section 10; review ambiguous existing assignments |
| Secondary classification limit change | Revise Section 9; governance freeze review of this strategy; require Planning Register evidence of insufficiency |
| Visual Source schema freeze | Separate future planning artifact; not governed by this section until schema is proposed |

Silent edits to frozen classification codes or names are prohibited.

---

## 17. Prohibited Classification Practices

The following practices are prohibited:

- Using vague classifications such as General, Miscellaneous, Other, Creative, or Visuals
- Using visual source, provenance, or generation origin as a primary or secondary classification
- Creating classifications for treatment modes such as typography-only presentation
- Assigning primary classification based on repository folder, sprint name, or implementation module
- Assigning primary classification based on verified fact ID, vendor name, or evidence source
- Creating a new `CLS-*` code ad hoc in a Planning Register without revising this strategy
- Using secondary classification to avoid splitting standards that should be separate planning candidates
- Using `CLS-GOV` for subject-specific policies that belong in visual, experience, or library-operations domains
- Using Manufacturing Integration because a standard mentions production, paper, or fulfillment
- Using Brain Visual Selection because a standard mentions the Brain in an exclusion or cross reference
- Using Visual Quality Assurance because a standard contains a Validation section
- Using Artwork as a catch-all for any image-related standard when a narrower medium classification applies
- Treating classification as disposition, disposition as classification, or either as visual source
- Defining colors, fonts, layouts, styles, prompts, algorithms, APIs, or UI behavior inside classification names or definitions

---

## 18. Validation Checklist

Before a candidate Design Standard receives a Planning Register entry with assigned classification, confirm:

- [ ] Principal governed subject is stated in one sentence
- [ ] Exactly one primary `CLS-*` code is assigned
- [ ] Primary `CLS-*` code exists in the frozen taxonomy (Section 6)
- [ ] Secondary codes are zero, one, or two, each with justification
- [ ] Disposition (`PRN`, `STD`, `CON`, `POL`, `SYS`) is assigned separately from classification
- [ ] Visual source, when relevant, is recorded separately and is not used as classification
- [ ] Section 10 boundary rules were evaluated for known overlap risks
- [ ] Classification does not depend on repository path, implementation structure, evidence source, or visual source
- [ ] No prohibited catch-all classification is used
- [ ] `CLS-GOV` is not used for subject-specific policies
- [ ] No visual, aesthetic, algorithmic, or implementation rule is embedded in the classification metadata
- [ ] Manufacturing, Brain, and research boundaries in Sections 12–14 remain respected
- [ ] Unresolved ambiguity is recorded in Open Planning Questions rather than forced into a weak classification

---

## 19. Open Planning Questions

The following question remains open for future Volume Roadmap planning. It is explicitly deferred, nonblocking, and does not affect the authority of the frozen taxonomy.

| ID | Question | Notes |
|----|----------|-------|
| OQ-CLS-001 | Will any primary classifications currently treated as cross-volume require formal cross-volume justification in the Volume Roadmap? | Deferred to Design Volume Roadmap sprint; intentionally unresolved at freeze |

Resolved by Sprint D1.3 taxonomy refinement (no longer open):

- `CLS-GOV` scope — meta-governance and Design Library planning artifacts only; not a catch-all for subject-specific policies
- `CLS-EEP` versus `CLS-CAR` — envelope/exterior presentation versus card structure and card surfaces
- `CLS-ILL` plus Asset Library Governance secondary ambiguity — `CLS-ASG` owns library operations; medium remains primary when illustration rules are principal
- Handwritten message presentation — no new `CLS-*` classification at this stage
- Customer Uploaded Imagery and AI Generated Imagery — removed as classifications; recorded as visual source
- Typography Only Treatments — removed as classification; typography-only is a treatment mode

---

## Classification Strategy Freeze Gate

FI-DSN-CLS-001 passed classification strategy freeze review on July 22, 2026.

| Criterion | Result |
|-----------|--------|
| Identity complete — FI-DSN-CLS-001, title, status, version, and freeze date consistent | Pass |
| Structural completeness — all required sections present; internal references valid | Pass |
| Governance alignment with `FI-DSN-GOV-001` — company judgment, implementation independence, manufacturing and Brain separation, evidence independence, change control | Pass |
| Template alignment with `FI-DSN-TPL-001` — disposition distinct from subject classification; no competing template; standards-level validation only | Pass |
| Taxonomy integrity — exactly 18 active `CLS-*` classifications; unique codes and names | Pass |
| Removed classifications absent from active taxonomy — no active `CLS-CUI`, `CLS-AIG`, `CLS-TOT`, or `CLS-ALG` | Pass |
| `CLS-ASG` used consistently for Asset Library Governance | Pass |
| Disposition boundary — PRN, STD, CON, POL, SYS distinct from subject classification | Pass |
| Visual Source boundary — provenance attribute distinct from classification and disposition; schema not frozen | Pass |
| Primary classification rule — exactly one primary per standard; principal-subject rule enforced | Pass |
| Secondary classification rule — maximum two; material justification required; formal change control for limit revision | Pass |
| Boundary integrity — ownership definitions only; no aesthetic rules | Pass |
| Domain separation — Design, Manufacturing, Product Intelligence, Research, and Implementation preserved | Pass |
| Volume relationship — classification and volume not identical; Volume Roadmap not frozen | Pass |
| `CLS-GOV` limited to Design Library meta-governance and planning; not a catch-all for subject-specific policies | Pass |
| Prohibited content absent — no visual rules, algorithms, APIs, UI behavior, or unsupported vendor facts | Pass |
| Classification change control — code stability, impact analysis, historical record preservation defined | Pass |
| Validation checklist sufficient for future classification assignment | Pass |
| Open planning question OQ-CLS-001 recorded as deferred and nonblocking | Pass |
| Document internally consistent and publication quality | Pass |

This strategy is **Frozen Classification Strategy**, Version 1.0, effective July 22, 2026.

Revisions after freeze require documented change control under Section 16 and `FI-DSN-GOV-001` Section 15. A revision that changes taxonomy codes, boundary rules, or primary or secondary classification policy requires a new strategy version and freeze review.

---

## 20. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 Draft | July 22, 2026 | F.I. Forgot | Sprint D1.3 — initial Design Classification Strategy (FI-DSN-CLS-001) created for review |
| 1.0 Draft (refined) | July 22, 2026 | F.I. Forgot | Sprint D1.3 taxonomy refinement — reduced to 18 classifications; removed visual-source and treatment-mode classifications; renamed `CLS-ALG` to `CLS-ASG`; introduced Visual Source as separate controlled attribute; clarified `CLS-GOV` scope |
| 1.0 Draft (freeze review) | July 22, 2026 | F.I. Forgot | Sprint D1.3 formal freeze review — template field harmonization note; validation checklist and change-control clarifications |
| 1.0 | July 22, 2026 | F.I. Forgot | Frozen — promoted to Frozen Classification Strategy; OQ-CLS-001 deferred to Design Volume Roadmap sprint |

---

**End of Document**
