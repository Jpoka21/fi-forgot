# F.I. Forgot Design Library

# FI-DSN-TPL-001 — Design Standard Template

## Document Control

| Field | Value |
|-------|-------|
| **Template identifier** | FI-DSN-TPL-001 |
| **Title** | Design Standard Template |
| **Template** | `01-design-standard-template.md` |
| **Sprint** | D1.2 |
| **Classification** | Design Library Template |
| **Status** | Frozen Governance Template |
| **Version** | 1.0 |
| **Freeze date** | July 22, 2026 |
| **Date** | July 22, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md` |
| **Downstream consumers** | All `FI-DSN-*` Design Standards in Volumes 02 through 05 |

---

## Template authority

**FI-DSN-TPL-001** is the **global Design Standard Template** required by `FI-DSN-GOV-001` Section 6.3.

Design Standards are **implementation independent**. Architecture and implementation documents MAY reference Design Standards, but Design Standards do not prescribe implementation. Engineering specifications, code, workflows, and tooling derive from frozen standards separately and SHALL NOT be authored inside Design Standard requirement text.

| Rule | Requirement |
|------|-------------|
| Single global template | All `FI-DSN-*` standards SHALL follow **FI-DSN-TPL-001** unless a documented governance revision supersedes it |
| Not a Design Standard | This document defines authoring structure only. It is not a `FI-DSN-*` standard and SHALL NOT be cited as normative design policy |
| Volume supplements | Volumes MAY publish supplemental guidance or examples that extend this template. Supplements SHALL NOT create a competing template |
| Section omission | A volume-specific standard MAY mark a template section **Not Applicable** when the disposition and subject matter do not require it. Omission requires explicit `Not Applicable` notation and freeze-review justification |
| Governance supremacy | Where this template and `FI-DSN-GOV-001` differ, `FI-DSN-GOV-001` governs until harmonized through documented revision |

---

## Canonical section order

Every Design Standard drafted from this template SHALL use the section order below.

| Order | Template section | Required by default | May be Not Applicable |
|------:|------------------|-------------------|------------------------|
| 1 | Document Control | Yes | No |
| 2 | Purpose | Yes | No |
| 3 | Scope | Yes | No |
| 4 | Definitions | If needed | Yes |
| 5 | Governing Requirements | Yes | Rarely |
| 6 | Design Requirements | Yes | Rarely |
| 7 | Brain Interaction | When Brain or customer override is in scope | Yes |
| 8 | Manufacturing Considerations | When manufacturing cross-domain effects exist | Yes |
| 9 | Evidence | Yes | No |
| 10 | Company Judgment | When applicable | Yes |
| 11 | Exceptions | Yes | No |
| 12 | Validation | Yes | No |
| 13 | Cross References | Recommended | Yes |
| 14 | Revision History | Yes | No |

### Additional required elements outside section numbering

The following elements are required by `FI-DSN-GOV-001` but are recorded within the sections above rather than as separate numbered sections:

| Element | Location in this template |
|---------|---------------------------|
| **Standard statement** | Document Control — one concise normative summary of the rule F.I. Forgot adopts |
| **Out-of-scope subjects** | Scope — explicit exclusion table |
| **Future revision notes** | Revision History — conditions that would trigger revision |
| **Engineering implications deferral or summary** | Manufacturing Considerations — state whether engineering implications are defined or deferred |

---

## Disposition applicability

| Disposition | ID pattern | Governing Requirements | Design Requirements | Brain Interaction | Manufacturing Considerations |
|-------------|------------|------------------------|---------------------|-------------------|------------------------------|
| **Design Principle** | `FI-DSN-PRN-###` | Required — adoption and permanence | Required — principle rule | Not Applicable unless principle governs Brain boundaries | Required when production feasibility is affected |
| **Design Standard** | `FI-DSN-STD-###` | Required | Required | When customer-facing selection or presentation is governed | Required when production feasibility is affected |
| **Design Constraint** | `FI-DSN-CON-###` | Required — boundary adoption | Required — boundary rules | Not Applicable unless constraint governs Brain boundaries | Usually required |
| **Design Policy** | `FI-DSN-POL-###` | Required — policy adoption | Required — policy rules | Often required for presentation or override policy | Often required |
| **System Architecture Standard** | `FI-DSN-SYS-###` | Required | Required — structural rules only | Not Applicable unless architecture governs Brain boundaries | Usually required |

Disposition extensions REQUIRE revision to `FI-DSN-GOV-001` before use.

---

## Requirement authoring rules

All normative requirements in **Governing Requirements** and **Design Requirements** SHALL follow these rules.

### Requirement identifiers

```
{Full Standard ID}-R{nn}
```

Example: `FI-DSN-POL-001-R01`

- Req IDs SHALL be globally unique and stable across revisions unless a formal revision explicitly records renumbering
- Req IDs SHALL number continuously across Governing Requirements and Design Requirements without resetting at section boundaries
- Shortened IDs are not permitted

### Requirement table format

| Column | Required | Purpose |
|--------|----------|---------|
| **Req ID** | Yes | `{Full Standard ID}-R{nn}` |
| **Requirement** | Yes | Testable, implementation-independent normative statement using SHALL or SHALL NOT |
| **Source** | Yes | Traceability to verified evidence or company judgment |

Use one table per section. Do not maintain a separate prohibitions section unless freeze review approves an exception.

### Allowed Source values

| Source value | Use when |
|--------------|----------|
| `{Fact ID}` | Requirement derives directly from a frozen verified fact in the governing research baseline |
| `{Fact ID} qualification` | Requirement preserves a stated qualification on a cited fact |
| `Company judgment` | F.I. Forgot decision not fully determined by verified evidence |
| `{Vendor Question ID} (pending)` | Provisional only when planning status explicitly allows pending vendor confirmation |

HOLD and REJECT facts SHALL NOT appear as Source support for permanent requirements.

Do **not** add per-requirement columns for evidence type, implementation impact, or design examples. Evidence belongs in **Evidence**. Implementation belongs in engineering specifications derived after freeze.

---

## Section specifications

### 1. Document Control

#### Purpose

Identify the standard, its lifecycle status, and its governance dependencies.

#### What belongs

| Field | Required | Notes |
|-------|----------|-------|
| **Identifier** | Yes | Reserved `FI-DSN-*` Standard ID from the volume Standard Planning Register |
| **Title** | Yes | Matches the reserved planning name |
| **Status** | Yes | e.g., Drafted, Pending Freeze; Drafted, Pending Freeze (elements blocked); Frozen |
| **Version** | Yes | Standard document version while drafted or under revision |
| **Classification** | Yes | Disposition: Design Principle, Design Standard, Design Constraint, Design Policy, or System Architecture Standard |
| **Dependencies** | Yes | Supporting Fact IDs, related vendor questions, governing qualifications, upstream standards, blocking dependencies |
| **Standard statement** | Yes | One concise normative summary of the rule F.I. Forgot adopts |

Supporting metadata such as freeze date, volume, and disposition notes MAY appear when status is Frozen or partially blocked.

#### What must never appear

- Normative requirement tables (belong in Governing Requirements or Design Requirements)
- Visual design rules, artwork direction, typography, color values, layout dimensions, or composition guidance
- Brain algorithms, prompt logic, scoring rules, or implementation specifications
- Vendor documentation restated as if it were an F.I. Forgot obligation without normative requirement text and Source discipline

#### Normative vs informative

Document Control metadata is **informative** except the **Standard statement**, which is **normative** and MUST align with the standard's requirement set.

---

### 2. Purpose

#### Purpose

Explain why the standard exists and what problem it solves.

#### What belongs

- Non-normative explanation of the standard's role within its volume
- The design or governance problem the standard addresses
- How the standard supports customer experience, design discipline, or cross-standard alignment without restating requirements

#### What must never appear

- SHALL or SHALL NOT statements that create new obligations not captured in requirement tables
- Artwork examples, visual direction, or aesthetic prescriptions
- Brain execution logic or implementation design
- Evidence claims not supported by the Evidence section

#### Normative vs informative

Purpose is **informative only**.

---

### 3. Scope

#### Purpose

Define what the standard applies to and what it explicitly does not govern.

#### What belongs

- In-scope subjects, materials, workflows, communications, or decisions
- Out-of-scope table with subject and reason
- Explicit exclusions for implementation, engineering, Brain logic, manufacturing policy duplication, HOLD facts, and deferred volumes
- Partial-draft blocked elements when applicable

#### What must never appear

- Hidden scope expansion through examples or illustrations
- Typography, color, layout, artwork, photography, or occasion-specific visual rules unless the standard's approved subject explicitly requires structural governance language without aesthetic values
- Manufacturing operational policy restated from `FI-MFG-*` standards without narrow cross-domain justification

#### Normative vs informative

Scope boundaries are **informative** unless a specific boundary is also expressed as a normative requirement in Governing Requirements or Design Requirements.

The out-of-scope table is **informative** but mandatory for freeze review.

---

### 4. Definitions

#### Purpose

Define terms used in normative requirements when precision requires it.

#### What belongs

- Terms referenced in requirement text
- Boundaries needed to interpret requirements consistently
- Qualification-aware definitions grounded in verified evidence where applicable

#### What must never appear

- Definitions of terms not used in normative requirements
- Vendor process sub-stages beyond verified evidence
- Visual style definitions, color names, font names, or artwork categories
- Brain algorithm terms or implementation objects

#### Normative vs informative

Definitions are **informative** unless a definition itself is elevated to a normative requirement, which is discouraged. Prefer normative statements in requirement tables instead.

Mark **Not Applicable** when no term requires definition.

---

### 5. Governing Requirements

#### Purpose

State the permanent adoption, authority, alignment, and governance rules that establish the standard as an F.I. Forgot design decision.

#### What belongs

Normative requirements that typically govern:

- Adoption of the standard as a permanent design rule within its volume
- Applicability to F.I. Forgot decisions, communications, or artifacts within scope
- Alignment with other requirements in the same standard
- Prohibitions on misrepresenting vendor facts, unresolved evidence, or draft policy as binding
- Cross-requirement consistency obligations

#### What must never appear

- Substantive visual design rules better placed in Design Requirements, unless the disposition requires no separate design rule section
- Implementation specifications, APIs, databases, file formats, UI behavior, or workflow steps
- Brain algorithms, prompt logic, or selection scoring
- Manufacturing operational policy copied from `FI-MFG-*` standards

#### Normative vs informative

All entries in the requirement table are **normative**.

---

### 6. Design Requirements

#### Purpose

State the substantive design rules, constraints, or policies that govern the standard's design subject.

#### What belongs

Normative requirements that govern the standard's design domain, such as:

- Presentation boundaries
- Structural rules for templates, metadata, or collections when disposition is `FI-DSN-SYS-*`
- Constraint boundaries limiting claims, assumptions, or design representations
- Policy rules governing customer-facing or internal design decisions

#### What must never appear

- Typography selections, color values, font files, pixel dimensions, layout grids, composition recipes, illustration styles, photography direction, or occasion-specific artwork rules unless a future approved standard explicitly requires non-aesthetic structural identifiers only
- Brain decision logic, routing, scoring, or prompt content
- API endpoints, code behavior, database schemas, or tooling configuration
- Universal entitlements, timing promises, or manufacturing operational policy outside the standard's approved scope

#### Normative vs informative

All entries in the requirement table are **normative**.

For dispositions where governing and design rules are inseparable, requirements MAY be authored entirely in one section only if freeze review confirms no material loss of clarity. The other section SHALL be marked **Not Applicable** with justification.

---

### 7. Brain Interaction

#### Purpose

Record how the standard interacts with Brain recommendations and customer override authority without authoring Brain logic.

#### What belongs

- Normative boundaries when the standard governs Brain-permitted or customer-selectable treatments
- References to `FI-DSN-GOV-001` Section 11.4 where the standard does not add special rules
- Explicit statement when the standard does not govern Brain interaction
- Informational explanation of how approved alternatives relate to the standard's requirements

Applicable normative patterns include:

- Brain recommendations SHALL remain within boundaries established by the standard
- Customer override SHALL be limited to allowed alternatives under the standard
- Customer override SHALL NOT violate frozen Design Standards, frozen Manufacturing Standards, production feasibility, safety, legal, or other mandatory constraints

#### What must never appear

- Brain algorithms, scoring models, routing logic, prompt templates, or training guidance
- Message wording, tone generation, or relationship-inference rules
- User interface behavior, control placement, or interaction flow specifications
- Treatment of Brain outputs as verified evidence

#### Normative vs informative

Explanatory prose is **informative**. Boundary rules are **normative** and MUST appear in the requirement table when they create obligations.

Mark **Not Applicable** when the standard does not govern Brain interaction or customer override.

---

### 8. Manufacturing Considerations

#### Purpose

Record how the standard relates to manufacturing feasibility and frozen manufacturing standards without restating manufacturing policy.

#### What belongs

- Informational cross-references to relevant `FI-MFG-*` standards
- Normative requirements when the standard must prohibit design outcomes that contradict applicable frozen manufacturing constraints
- Statement of whether engineering implications are defined or deferred per `FI-DSN-GOV-001`
- Manufacturability boundaries that affect design governance

#### What must never appear

- Restatement of manufacturing operational policy unless freeze review approves a narrow cross-domain requirement with explicit scope
- Production timing promises, SLA language, or fulfillment workflow specifications
- Engineering specifications, API behavior, or implementation requirements
- Aesthetic prescriptions disguised as manufacturability notes

#### Normative vs informative

Cross-references and manufacturability explanations are **informative** unless expressed as normative requirements.

Engineering implications deferral statement is **informative** but mandatory for freeze review.

Mark **Not Applicable** only when the standard has no manufacturing cross-domain effect and freeze review confirms no engineering implications record is needed. In most cases, this section SHALL state deferral explicitly rather than omitting the section.

---

### 9. Evidence

#### Purpose

List verified facts cited by normative requirements and preserve qualifications.

#### What belongs

- Table of every Fact ID cited in Governing Requirements or Design Requirements
- Verified statement used by the standard
- Qualification preserved for each cited fact
- Explicit statement when no verified facts are cited and the standard is company-judgment-only

#### What must never appear

- Research narrative, unaudited claims, or marketing language as evidence
- HOLD or REJECT facts presented as support
- Brain outputs, implementation behavior, or draft design examples as evidence
- Vendor documentation copied in full without audit traceability to frozen verified facts

#### Normative vs informative

Evidence content is **informative** and supports traceability. It does not create obligations by itself.

---

### 10. Company Judgment

#### Purpose

Disclose F.I. Forgot decisions not established by verified evidence alone.

#### What belongs

- Company decisions governing adoption, scope, interpretation, or independent F.I. Forgot policy
- References to Req IDs supported by `Company judgment` in the Source column
- Explicit statement when no company judgment applies

#### What must never appear

- Company judgment disguised as vendor fact
- Visual style preferences presented as evidence
- Implementation rationale presented as design policy
- Duplicated requirement text without added interpretive value

#### Normative vs informative

Company Judgment is **informative** disclosure. Binding obligations MUST appear in requirement tables with appropriate Source values.

Mark **Not Applicable** only when every normative requirement derives from cited verified facts and freeze review confirms no company judgment disclosure is needed. Prefer explicit `None` statement over silent omission.

---

### 11. Exceptions

#### Purpose

Define known exceptions or record that none exist.

#### What belongs

- Defined exceptions with scope limits, or explicit `No exceptions are defined in this standard.`
- Revision path for future exceptions
- Conditions under which an exception requires formal standard revision

#### What must never appear

- Implied exceptions not documented here
- Emergency bypass authority not established by `FI-DSN-GOV-001`
- Visual, implementation, or Brain-logic exceptions smuggled through examples

#### Normative vs informative

Defined exceptions are **normative** when they modify obligation boundaries. The revision path statement is **informative**.

---

### 12. Validation

#### Purpose

Define how compliance with the standard is verified at the standards level without prescribing implementation tests or implementation behavior.

#### What belongs

Every Design Standard validation method SHALL confirm compliance against:

- **Requirement IDs** — each normative requirement in Governing Requirements and Design Requirements, cited by `{Full Standard ID}-R{nn}`
- **Dependencies** — Document Control dependencies, blocking dependencies, and upstream standard relationships recorded for the standard
- **Evidence references** — every Fact ID cited in requirement Source columns appears in Evidence with qualifications preserved
- **Company Judgment disclosures** — every `Company judgment` Source and every material company decision disclosed in Company Judgment is explicit and not represented as verified evidence
- **Cross references** — related standards listed in Cross References are accurate, informational unless otherwise required, and do not create unsupported normative duplication

Validation MAY also state:

- What policy materials, records, or governed artifacts are reviewed
- That partial-draft blocked elements are excluded from validation scope when applicable

#### What must never appear

- Automated test code, API checks, database queries, UI test steps, or other implementation test specifications
- Validation by document location instead of Req ID
- Artwork inspection criteria involving color, typography, or composition values unless a future approved standard explicitly requires non-aesthetic structural checks only
- Implementation architecture, deployment behavior, or tooling configuration presented as standards validation

#### Normative vs informative

Validation method prose is **informative**. Compliance obligations remain in requirement tables. Standards validation confirms governance completeness and Req ID conformance; it does not define engineering test plans.

---

### 13. Cross References

#### Purpose

Identify related standards and governance documents without creating unsupported dependencies.

#### What belongs

- Informational references to related `FI-DSN-*` standards
- Informational references to `FI-MFG-*` standards when manufacturing context applies
- References to `FI-DSN-GOV-001`, volume governance documents, or research baselines when helpful
- Relationship description: informational only, supersedes, or related domain

#### What must never appear

- Unsupported normative dependencies
- Duplicated requirement text from other standards
- Brain Architecture binding authority unless a separate approved cross-library governance decision exists

#### Normative vs informative

Cross References are **informative only** unless a normative alignment requirement already appears in Governing Requirements or Design Requirements.

Mark **Not Applicable** when no related standards exist and freeze review agrees the absence is intentional.

---

### 14. Revision History

#### Purpose

Preserve revision lineage and record conditions that would trigger future revision.

#### What belongs

- Version, date, author, and summary for each revision
- Future revision notes: upstream evidence changes, vendor diligence resolution, blocked element completion, cross-standard changes, or governance revisions that would require update

#### What must never appear

- Silent rewrite of prior frozen text without a new revision entry
- Removal of superseded history
- Informal change rationale that omits affected Req IDs or upstream trigger

#### Normative vs informative

Revision History is **informative** audit metadata. It does not create design obligations.

---

## Template freeze gate

FI-DSN-TPL-001 passed template freeze review on July 22, 2026.

| Criterion | Result |
|-----------|--------|
| Canonical section order complete and aligned with `FI-DSN-GOV-001` Section 6.3 | Pass |
| Required, optional, and Not Applicable rules defined | Pass |
| Disposition applicability matrix defined | Pass |
| Req ID convention globally unique (`{Full Standard ID}-R{nn}`) | Pass |
| Source values controlled | Pass |
| Normative requirements implementation independent | Pass |
| Evidence, company judgment, Brain interaction, and manufacturing boundaries distinct | Pass |
| Validation confirms Req IDs, dependencies, evidence references, company judgment disclosures, and cross references without prescribing implementation tests | Pass |
| No visual, artwork, typography, color, layout, or Brain algorithm content introduced | Pass |
| Document internally consistent and publication quality | Pass |

This template is **Frozen Governance Template**, Version 1.0, effective July 22, 2026.

Template revisions after freeze require documented change control under `FI-DSN-GOV-001` Section 15. A revision that changes section order, Req ID rules, or Source enumeration requires a new template version and freeze review.

---

## Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0 Draft | July 22, 2026 | F.I. Forgot | Sprint D1.2 — initial global Design Standard Template (FI-DSN-TPL-001) created for review |
| 1.0 | July 22, 2026 | F.I. Forgot | Frozen — promoted to Frozen Governance Template |

---

**End of Document**
