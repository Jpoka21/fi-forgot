# F.I. Forgot Design Library

# FI-DSN-GOV-003 — Evidence vs Company Judgment Governance

## 1. Document Control

| Field | Value |
|-------|-------|
| **Governance identifier** | FI-DSN-GOV-003 |
| **Title** | Evidence vs Company Judgment Governance |
| **Document** | `07-evidence-vs-company-judgment-governance.md` |
| **Sprint** | D1.8 |
| **Artifact type** | Epistemic governance standard |
| **Status** | Frozen Governance Standard |
| **Version** | 1.0 |
| **Date** | July 23, 2026 |
| **Freeze date** | July 23, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Register reference** | `FI-DSN-REG-001` — Design Planning Register (Frozen Planning Register, Version 1.0, July 22, 2026) |
| **Queue reference** | `FI-DSN-QUE-001` — Design Drafting Queue (Frozen Design Drafting Queue, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Research reference** | `playbook/research/README.md` — Research Library governance |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md`; `playbook/design/01-design-standard-template.md`; `playbook/design/02-design-classification-strategy.md`; `playbook/design/03-design-identifier-system.md`; `playbook/design/04-design-library-metadata-standard.md`; `playbook/design/05-design-planning-register.md`; `playbook/design/06-design-drafting-queue.md`; `playbook/design/README.md` |
| **Downstream consumers** | Design Standards in Volumes 02 through 05; future Volume Roadmap; future automation |

**Standard statement:** F.I. Forgot maintains **one authoritative epistemic governance layer** for the Design Library that distinguishes verified evidence, company judgment, assumptions, research gaps, vendor and community research inputs, inference, and open questions. The Design Library consumes frozen verified facts from the Research Library; it does not re-audit, re-verify, or promote facts. Company judgment SHALL NOT be represented as verified evidence. Assumptions SHALL NOT silently support frozen normative requirements. A Research Library fact identifier is a stable reference to a governed factual claim lineage; each frozen Design Standard relies on the **Cited Evidence Baseline** available at the time of that revision, which MUST remain historically recoverable even when the current Research Library state of the same identifier later differs.

**Source basis:** Company judgment. This epistemic governance model is an F.I. Forgot governance choice. It is not derived from vendor facts or verified evidence.

---

## 2. Purpose

This document is the **authoritative epistemic governance standard** for the Design Library.

Evidence vs Company Judgment Governance answers: **How does the Design Library distinguish, record, evaluate, gate, propagate, and use verified evidence, company judgment, assumptions, research inputs, inference, and unresolved posture when authoring and maintaining governed artifacts?**

This document:

- Defines the **epistemic taxonomy** and governing rules for all eight epistemic categories used across the Design Library
- Operationalizes the high-level evidence and company judgment policies in `FI-DSN-GOV-001` Sections 9 and 10
- Governs **evidence posture, sufficiency, permanence, conflict resolution, and change propagation** without redefining canonical metadata fields in `FI-DSN-GOV-002`
- Establishes **drafting and freeze gates**, **Epistemic Validation**, and a **Freeze Gate** for evidence-dependent work
- Governs **requirement source posture** for Layer B Design Standards per `FI-DSN-TPL-001`

This document does **not**:

- Execute Research Library audits, promote facts, or assign Research Library fact identifiers
- Redefine canonical metadata field names or semantics (`FI-DSN-GOV-002`)
- Serve as the planning inventory or adjudicate epistemic sufficiency at register reservation (`FI-DSN-REG-001`)
- Verify facts or promote evidence through queue operations (`FI-DSN-QUE-001`)
- Author normative visual, Brain, or manufacturing design policy
- Define implementation schemas, APIs, databases, automation, or repository tooling

---

## 3. Scope

### In scope

- Epistemic principles, including **Evidence Permanence** and **Cited Evidence Baseline**
- Epistemic taxonomy: verified evidence, company judgment, assumptions, research gaps, vendor supplied information, community sourced information, inference, and open questions
- Canonical evidence boundary labels per `FI-DSN-GOV-001` Section 9.4
- Vendor question (`HW-VQ-*`) and provisional `(pending)` sourcing governance
- Research Library boundary and fact consumption rules
- Evidence posture, sufficiency, qualification preservation, and applicability
- Requirement source governance for normative requirements
- Conflict governance among evidence, company judgment, and assumptions, including Research Library escalation
- Evidence change propagation and downstream impact review
- Drafting gates, freeze gates, Epistemic Validation, Epistemic Change Control, and Freeze Gate
- Disposition-specific evidence applicability authority hierarchy
- Harmonization with `FI-DSN-GOV-001` Sections 9 and 10
- Relationship boundaries to Metadata Standard, Planning Register, Drafting Queue, Design Standards, Identifier System, and Classification Strategy

### Out of scope

- Research Library audit execution, fact promotion, replacement, or retirement procedures
- Metadata field redefinition or new canonical metadata fields
- New Planning Register columns or Drafting Queue states
- Brain Authority Boundary governance
- Volume Roadmap creation
- Layer B Design Standard body drafting for Volumes 02 through 05
- Implementation mechanics, scripts, schemas, or automation

---

## 4. Epistemic Principles

The following principles govern epistemic posture across the Design Library:

1. **Research Library factual authority.** Only the Research Library governs factual verification, fact identifier assignment, audit status, promotion, replacement, and retirement. The Design Library consumes frozen verified facts; it does not re-audit or promote facts.
2. **Evidence is not judgment.** Verified evidence and company judgment are distinct epistemic categories. Company judgment SHALL NOT be represented as verified evidence.
3. **Judgment is not evidence.** Company judgment MAY inform policy but does not acquire factual authority without Research Library promotion.
4. **Assumptions are provisional.** Assumptions are not verified evidence and are not automatically company judgment. Assumptions SHALL NOT silently support frozen normative requirements.
5. **Open questions are unresolved posture.** Open questions record what remains unresolved. They are not answers, evidence, or company judgment.
6. **Facts are not requirements.** Verified facts support requirements; they are not themselves normative Design Standard obligations.
7. **Qualification preservation.** Material qualifications on cited verified facts SHALL be preserved in requirement Source, Evidence sections, and downstream interpretation.
8. **No silent expansion.** Requirements SHALL NOT expand verified statements beyond audited scope. Absence of evidence SHALL NOT be converted into vendor limitations or customer-facing rules without explicit company judgment.
9. **Metadata reference, not substitution.** Epistemic evaluation uses canonical metadata fields defined in `FI-DSN-GOV-002`; this document governs rules for those fields, not their names or semantics.
10. **Register records; governance evaluates at gates.** `FI-DSN-REG-001` records evidence pointers, dependencies, boundary posture, and planning state. Epistemic sufficiency is evaluated during drafting, validation, review, and freeze gates under this document — not at register reservation.
11. **Governance evaluates; Research Library verifies; queue reflects.** Governance evaluates epistemic posture. The Research Library verifies factual claims. The Drafting Queue reflects readiness. `FI-DSN-QUE-001` MAY reflect readiness from register metadata but SHALL NOT verify facts or decide sufficiency.
12. **Governed change.** Epistemic rules change only through documented revision of this document under `FI-DSN-GOV-001` Section 15 and Section 13 of this document.

### 4.1 Evidence Permanence

**Evidence Permanence** is a first-class governing principle of the Design Library.

Evidence Permanence distinguishes four separate concepts that MUST NOT be conflated:

| Concept | Definition |
|---------|------------|
| **Stable fact identifier** | A Research Library fact identifier that names a governed factual claim lineage. A fact identifier SHALL NOT be reused for a different claim. |
| **Cited Evidence Baseline** | The fact baseline — wording, qualification, scope, and audit posture — that a Design Library artifact relied upon at the time of a specific revision or freeze. |
| **Current Research Library status** | The present state of a fact identifier in the Research Library, which MAY differ from any prior Cited Evidence Baseline. |
| **Historically recoverable meaning** | The governed record of what a frozen revision actually cited and why, recoverable through Research Library history, **Revision History**, Evidence sections, and other authoritative historical records. |

#### 4.1.1 Permanence rules

| Permanence rule | Requirement |
|-----------------|-------------|
| Identifier lineage | A Research Library fact identifier identifies the governed factual claim lineage cited by the Design Library |
| Cited baseline at freeze | A frozen Design Standard relies on the Cited Evidence Baseline available at the time of that standard revision |
| Current state may differ | The current Research Library state of a fact MAY later differ from the Cited Evidence Baseline of an earlier frozen revision |
| No assumed equivalence | A current lookup of a fact identifier MUST NOT be assumed to reproduce the exact Cited Evidence Baseline relied upon by an earlier frozen revision |
| Historical recoverability | Historical citation MUST remain recoverable through governed Research Library history, **Revision History**, evidence records, or other authoritative historical record |
| No silent rewrite | Same-identifier evolution does not authorize silent rewriting of the historical evidence record of an older frozen Design Standard |
| Material change review | A change in qualification, scope, wording, applicability, or audit posture under the same fact identifier SHALL trigger downstream impact review when material, per Section 10 |
| Status change preservation | HOLD, REJECT, retirement, replacement, or other material Research Library status changes MUST NOT erase the historical fact that an earlier Design Standard cited that fact identifier |
| No automatic rewrite | Frozen Design Standards are not automatically rewritten when the Research Library evolves |
| Governed change only | Any affected Design Standard change MUST occur through governed clarification, revision, review, and re-freeze where required |

#### 4.1.2 Evidence change types

| Change type | Meaning | Identifier behavior | Design Library response |
|-------------|---------|---------------------|-------------------------|
| **Evidence evolution** | Revised wording, qualification, scope, or audit posture of an existing frozen fact | Same fact identifier unless Research Library formally replaces the identifier | Impact review; update citations or revise requirements as needed; preserve Cited Evidence Baseline and historical record |
| **Evidence supersession** | A newer verified fact or baseline replaces an older understanding | Prior identifier preserved in history; new identifier cited going forward | Supersession recorded; affected artifacts reviewed; frozen standards retain prior Cited Evidence Baseline until revised |
| **Evidence qualification** | Material limitation, scope boundary, capability limitation, or contextual restriction added | Same fact identifier | Qualifications preserved; silent broadening PROHIBITED; clarify or revise requirements if scope changes |
| **Evidence inapplicability** | Fact remains historically valid but no longer relevant to artifact or requirement scope | Identifier remains valid in Research Library | Citation MAY be removed with documented rationale; **Revision History** records prior citation and Cited Evidence Baseline |
| **Evidence replacement** | Research Library formally retires or replaces a fact with a newer fact identifier | New identifier assigned; retired identifier preserved | Impact review; migrate citations through governed revision; no silent substitution |

---

## 5. Epistemic Taxonomy

### 5.1 Verified evidence

**Verified evidence** means **frozen Research Library fact identifiers only** — promoted verified facts from approved `03-verified-facts.md` baselines per `playbook/research/README.md` and `FI-DSN-GOV-001` Section 9.

| Rule | Requirement |
|------|-------------|
| Acceptable references | Fact IDs cited in **Evidence References**, requirement Source (`{Fact ID}`), Dependencies, and Evidence sections |
| Not evidence | Research reports, evidence audits, vendor pages, support emails, community posts, `HW-VQ-*` items, implementation behavior, and design drafts |
| HOLD facts | SHALL NOT support permanent normative requirements |
| REJECT facts | SHALL NOT support any normative requirement |
| Qualification preservation | Material qualifications SHALL be preserved in Source and Evidence sections per `FI-DSN-GOV-001` Section 9.2 |
| Applicability | Evidence MUST be applicable to the requirement or artifact scope; inapplicable facts SHALL NOT be cited as support |
| Sufficiency | Sufficiency rules in Section 7 apply before freeze |
| Conflict handling | Section 9 governs conflicts among facts and with company judgment |
| Revision impact | Section 10 governs downstream impact when facts evolve |
| Historical citation | Frozen revisions preserve cited identifiers and Cited Evidence Baseline in **Revision History** and Evidence sections |

### 5.2 Company judgment

**Company judgment** means a **deliberate F.I. Forgot decision** that is not fully determined by verified evidence alone, per `FI-DSN-GOV-001` Section 10.

| Rule | Requirement |
|------|-------------|
| When permitted | When evidence informs but does not fully determine adoption, scope, conservatism, interpretation, or policy; or when no verified fact applies and F.I. Forgot must still govern |
| Explicit identification | Recorded in **Company Judgment** metadata where applicable; requirement Source `Company judgment` per `FI-DSN-TPL-001`; Company Judgment section in standards |
| Rationale | Material company judgments SHALL be disclosed with enough specificity to audit the decision boundary |
| Conflicts with evidence | Section 9 applies; judgment MAY narrow or exceed vendor capability but SHALL NOT falsify the evidence record |
| Becomes normative | Only through normative requirement text with appropriate Source and Company Judgment disclosure |
| Review and revision | Revised through governed standard revision; prior disclosures remain in **Revision History** |
| No masquerading | Company judgment SHALL NOT be represented as `{Fact ID}` or listed in Evidence sections as verified fact |

### 5.3 Assumptions

**Assumptions** are provisional beliefs used during planning or drafting that are **neither verified evidence nor recorded company judgment**.

| Rule | Requirement |
|------|-------------|
| Not evidence | Assumptions SHALL NOT be cited as `{Fact ID}` or recorded as verified evidence |
| Not automatic judgment | Labeling text as an assumption does not make it binding company judgment |
| No silent freeze support | Assumptions SHALL NOT silently support frozen normative requirements |
| Resolution before freeze | Assumptions affecting normative claims MUST be resolved, promoted to governed company judgment, supported by promoted evidence, or excluded from freeze scope before freeze |
| Visibility | Assumptions affecting drafting or evaluation MUST remain visible in Notes, drafting commentary, blocked-element records, or explicit assumption labels until resolved |
| No new metadata field | Assumptions SHALL NOT receive a new canonical metadata field; use existing **Notes**, **Dependencies**, blocked-element notation, and freeze gates |

### 5.4 Vendor supplied information

**Vendor supplied information** is material from a vendor or supplier that has **not** been promoted to a frozen Research Library fact identifier.

| Rule | Requirement |
|------|-------------|
| Research input only | Vendor webpages, emails, support answers, sales statements, API responses, and informal disclosures are Research Library inputs until promoted |
| Not Design evidence | The Design Library SHALL NOT treat vendor supplied information as verified evidence without Research Library promotion |
| Promotion path | Vendor disclosure → Research Library intake and verification → fact promotion or qualification → Design Library impact review → governed revision where required |
| Vendor updates | New vendor disclosure SHALL NOT automatically update frozen Design Standards |

### 5.5 Community sourced information

**Community sourced information** includes forums, reviews, social posts, and unofficial implementation reports.

| Rule | Requirement |
|------|-------------|
| Research input only | Community material MAY inform research questions or risk discovery |
| Not evidence | Community sourced information SHALL NOT independently become verified evidence |
| No freeze support | Community sourced information SHALL NOT directly support frozen normative requirements |

### 5.6 Inference

**Inference** is a conclusion derived from one or more facts, research inputs, or analytical steps that has **not** been promoted to a Research Library fact identifier.

| Rule | Requirement |
|------|-------------|
| Explicit labeling | Inference used in drafting MUST be explicitly labeled as inference in drafting commentary or Notes until promoted or converted |
| Not a fact | Inference SHALL NOT be presented as `{Fact ID}` or verified evidence |
| Before freeze support | Inference MAY inform analysis during drafting; it MUST be promoted to verified evidence, converted to governed company judgment, or excluded before it supports a frozen normative requirement |

### 5.7 Research gaps

**Research gaps** are subjects not yet covered by an approved verified-facts baseline or not yet resolved through Research Library governance.

| Rule | Requirement |
|------|-------------|
| Explicit recording | Recorded through **Dependencies**, canonical boundary labels per `FI-DSN-GOV-001` Section 9.4 and Section 7.10, and **Open Questions** where material |
| No silent fill | Research gaps SHALL NOT be filled with unstated assumptions or disguised company judgment |
| Drafting posture | Artifacts MAY be company-judgment-only or explicitly scoped to exclude the gap subject when evidence is absent |
| No independent freeze support | Research gaps SHALL NOT independently support frozen normative requirements |

#### 5.7.1 Research gap versus open question

A **research gap** is missing or insufficient knowledge. An **open question** is the governed record of an unresolved issue requiring an answer, decision, or evidence outcome.

| Situation | Required treatment |
|-----------|-------------------|
| Material research gap affecting normative scope, requirement validity, freeze readiness, or material risk | Record using the appropriate **Evidence References** posture, the applicable canonical boundary label per Section 7.10, and a persistent `OQ-DSN-###` |
| Nonblocking research gap | MAY be recorded through **Dependencies**, **Notes**, a canonical boundary label, or future research planning without creating an open question, provided it does not affect current normative scope or freeze readiness |
| Additional research could be useful but is not material to current normative scope | An open question MUST NOT be created merely for convenience |
| Material unresolved issue | A research gap MUST NOT be hidden by omitting an open question when the unresolved issue is material |

### 5.8 Open questions

**Open questions** are persistent unresolved epistemic or planning issues identified by `OQ-{DOMAIN}-###` per `FI-DSN-ID-001`.

| Rule | Requirement |
|------|-------------|
| Default domain | Design Library-wide open questions SHALL use `OQ-DSN-###` unless a specialized domain is established in `FI-DSN-ID-001` |
| Unresolved posture | Open questions record unresolved posture; they are not answers, evidence, or company judgment |
| Material evidence | When unresolved evidence materially affects an artifact, **Evidence References** SHALL be `Open` accompanied by a persistent `OQ-{DOMAIN}-###` per `FI-DSN-GOV-002` |
| Blocking | Open questions SHALL block drafting or freeze when materially relevant to normative claims in scope |
| Closure | Closed only by governed answer, decision, evidence outcome, or explicit scope exclusion recorded in **Revision History** |

---

## 6. Research Library Boundary

### 6.1 Authority ownership

| Domain | Owner |
|--------|-------|
| Factual verification | Research Library governance (`playbook/research/README.md`) |
| Fact identifier assignment and retirement | Research Library governance |
| Audit status (including HOLD and REJECT) | Research Library governance |
| Fact promotion to frozen verified facts baseline | Research Library governance |
| Factual contradiction resolution | Research Library governance when Design Library cannot resolve through scope, qualification, or non-overlap |
| Consumption of frozen facts in Design Library | This document and `FI-DSN-GOV-001` Section 9 |
| Whether F.I. Forgot adopts a practice informed by a fact | Company judgment |

### 6.2 Knowledge flow

```
Research Report
        ↓
Evidence Audit
        ↓
Verified Facts (frozen baseline)
        ↓
Design Library epistemic governance (this document)
        ↓
Planning metadata, drafting, Design Standards
        ↓
Engineering Specifications
        ↓
Implementation
```

### 6.3 Prohibited Design Library actions

The Design Library SHALL NOT:

- Re-audit Research Library claims
- Re-verify vendor disclosures outside Research Library process
- Independently promote vendor or community material to verified evidence
- Assign or reuse Research Library fact identifiers
- Override Research Library HOLD or REJECT status by citing facts as supporting requirements
- Independently declare one conflicting verified fact true and another false

---

## 7. Evidence Posture and Sufficiency

This section governs epistemic evaluation **without redefining** canonical metadata fields in `FI-DSN-GOV-002`.

### 7.1 Evidence applicability

An evidence reference is applicable when the cited fact addresses the same subject, scope, and decision boundary as the requirement or planning entry. Inapplicable facts SHALL NOT be cited as support.

Evidence applicability is distinct from evidence existence and from evidence completeness.

### 7.2 Evidence completeness

Evidence is complete for a requirement when every material factual claim in the requirement is supported by at least one applicable verified fact, governed company judgment, or an explicitly scoped combination. Partial factual support REQUIRE qualification boundaries or decomposition into separate requirements.

### 7.3 Qualification preservation

When a cited fact carries a material qualification, the requirement and Evidence section SHALL preserve the qualification boundary or cite `{Fact ID} qualification` per `FI-DSN-GOV-001` Section 9.2.

### 7.4 Contradictory evidence

When verified facts conflict, drafting SHALL NOT proceed to freeze without harmonization, scope restriction, explicit boundary labeling, Research Library escalation where required per Section 9.2, or governed company judgment that records the conflict and chosen posture. Silent preference for one fact without documentation is PROHIBITED.

### 7.5 Missing evidence

When evidence is missing for a material claim:

| Posture | Allowed use |
|---------|-------------|
| `None Required` in **Evidence References** | Only when no verified facts are required for the artifact or requirement scope |
| `Open` + `OQ-DSN-###` | When unresolved evidence materially affects the artifact |
| Company judgment only | When the normative claim is explicitly company-judgment-supported and evidence absence is disclosed |
| Canonical boundary label | When the applicable label from Section 7.10 records the unresolved posture |
| Blocked drafting | When normative claims in scope cannot be supported without unresolved evidence |

### 7.6 Partial evidence support

A requirement MAY be supported by verified evidence for part of its scope and company judgment for the remainder. The Source column and Evidence section SHALL make the division explicit.

### 7.7 Company-judgment-primary requirements

Requirements supported primarily by company judgment SHALL use Source `Company judgment` and SHALL disclose rationale in the Company Judgment section. They SHALL NOT cite fact IDs as primary support unless facts materially bound the judgment.

### 7.8 Materially unresolved evidence

Drafting and freeze MUST stop or remain blocked for normative claims in scope when evidence is materially unresolved and neither `Open` + OQ nor an approved canonical boundary label nor explicit company-judgment-only scope is recorded.

### 7.9 Metadata posture mapping

| `FI-DSN-GOV-002` **Evidence References** state | Epistemic meaning |
|------------------------------------------------|-------------------|
| One or more valid fact identifiers | Verified evidence cited |
| `None Required` | No verified facts required for scope |
| `Open` + linked `OQ-{DOMAIN}-###` | Material unresolved evidence |

This document does not add states to **Evidence References**.

### 7.10 Canonical evidence boundary labels

The following boundary labels are defined in `FI-DSN-GOV-001` Section 9.4. This document operationalizes their drafting and freeze effect. No replacement labels or functional synonyms are authorized.

| Label | Meaning | Drafting effect | Freeze effect |
|-------|---------|-----------------|---------------|
| **Unresolved** | A material issue remains unresolved | Drafting MAY continue only for explicitly out-of-scope or blocked elements; affected normative claims in unresolved scope MUST NOT be drafted as final | Material unresolved issues MUST block freeze of the affected normative requirement or artifact |
| **Pending Vendor Confirmation** | The matter depends on unresolved vendor confirmation | MAY support research planning or explicitly provisional drafting only where frozen governance permits; normative text MUST NOT state unresolved vendor matters as verified fact | MUST NOT independently support a frozen normative requirement |
| **Deferred to Later Research Volume** | The issue is intentionally outside current research scope | Current work MAY proceed when normative scope explicitly excludes the deferred subject or uses company-judgment-only posture with disclosure | MUST block freeze when the deferred issue materially affects present normative scope; freeze MAY proceed when scope exclusion or company-judgment disclosure is explicit and sufficient |
| **Company Decision Independent of Vendor Fact** | F.I. Forgot has deliberately made a policy decision that does not depend on resolving the vendor fact | Policy MUST be classified and disclosed as Company Judgment; label MUST NOT imply the missing vendor fact has been verified | Freeze MAY proceed when the requirement is supported by governed Company Judgment with appropriate disclosure; label MUST NOT substitute for verified evidence |

Boundary labels SHALL be recorded in artifact bodies, **Notes**, **Dependencies**, blocked-element records, or other existing governed fields. They do not create new metadata columns, register values, or queue states.

### 7.11 Vendor questions and provisional sourcing

This section operationalizes `FI-DSN-GOV-001` Section 9.2 vendor-question and `(pending)` sourcing rules.

| Rule | Requirement |
|------|-------------|
| `HW-VQ-*` status | `HW-VQ-*` items are vendor diligence questions, not verified facts |
| No direct freeze support | An unresolved `HW-VQ-*` item MUST NOT directly support a frozen normative requirement |
| Permitted uses | An `HW-VQ-*` item MAY support planning, research tracking, **Dependencies**, or open question posture |
| `(pending)` sourcing | Provisional `{Vendor Question ID} (pending)` sourcing MAY be used only where governing planning and drafting architecture explicitly permits it per `FI-DSN-GOV-001` Section 9.2 |
| Not verified evidence | `(pending)` MUST NOT be interpreted as verified evidence |
| Material vendor-pending coordination | Material vendor-pending issues MUST be coordinated using **Pending Vendor Confirmation**, the existing `Open` evidence posture where applicable, an authorized `OQ-DSN-###` when the unresolved issue materially affects normative scope, and drafting or freeze gates in Section 11 |
| Queue boundary | The Drafting Queue MAY reflect readiness consequences but SHALL NOT verify vendor information or define epistemic truth |
| Promotion path | Vendor confirmation MUST enter the Research Library intake and promotion path before becoming verified evidence |

---

## 8. Requirement Source Governance

Every normative requirement in a Layer B Design Standard SHALL identify its governing source posture in the Source column per `FI-DSN-TPL-001`.

### 8.1 Permitted source postures

| Posture | Source column | Supporting sections |
|---------|---------------|---------------------|
| Verified evidence | `{Fact ID}` | Evidence section listing fact with qualifications |
| Company judgment | `Company judgment` | Company Judgment section |
| Governed combination | `{Fact ID}` and/or `Company judgment` with explicit division in requirement text or Evidence section | Both sections as applicable |

### 8.2 Prohibited freeze support

A frozen normative requirement MUST NOT be supported only by:

- An unresolved assumption
- An unverified vendor claim
- An unresolved `HW-VQ-*` vendor diligence question
- Provisional `{Vendor Question ID} (pending)` sourcing
- Community sourced information
- Unlabeled inference
- A research gap
- An open question
- Unpromoted research narrative, including research report or audit narrative without fact promotion

### 8.3 Qualification in requirements

All material evidence qualifications affecting a requirement SHALL appear in the requirement boundary, Source qualification reference, or Evidence section. Silent qualification dropping is PROHIBITED.

---

## 9. Conflict Governance

### 9.1 Verified evidence conflicts with company judgment

F.I. Forgot MAY adopt policy that differs from what evidence alone would suggest. Such policy MUST remain visibly classified as company judgment. The evidence record MUST remain accurate. Company judgment SHALL NOT override factual truth by relabeling evidence.

### 9.2 Verified facts conflict with each other

The Design Library MAY identify, document, and scope a conflict between frozen verified facts.

The Design Library MUST NOT independently resolve factual contradiction by choosing which fact is true.

When contradiction cannot be resolved through applicability, qualification, scope, timing, or non-overlap analysis, authority returns to the Research Library. The Research Library MUST determine whether the facts require clarification, qualification, re-audit, supersession, replacement, retirement, or another governed factual disposition.

Until the Research Library provides a sufficient disposition, the Design Library MUST:

- restrict the affected normative scope,
- use an authorized unresolved boundary label per Section 7.10,
- maintain an open question where material, or
- block drafting or freeze.

Company judgment MUST NOT be used to declare one conflicting verified fact factually true and the other false. A company policy MAY still be selected under uncertainty, but the factual conflict and Company Judgment posture MUST remain explicit.

When Design Library harmonization is sufficient, resolution MAY proceed through scope restriction, qualification preservation, boundary labels, decomposition of requirements, or governed revision. Freeze is PROHIBITED while material contradiction remains unaddressed in normative scope.

### 9.3 Vendor update conflicts with frozen Research Library fact

Vendor disclosure SHALL enter the Research Library promotion path. Frozen Design Standards continue to cite facts and their Cited Evidence Baseline as frozen until governed impact review and revision. Vendor updates SHALL NOT silently supersede frozen citations.

### 9.4 New evidence undermines an existing requirement

Trigger Section 10 impact review. Dispositions: no change, clarification only, or material revision with applicable freeze review.

### 9.5 Assumption conflicts with verified evidence

The assumption MUST be resolved before freeze. Resolution paths: revise draft, promote to governed company judgment with conflict disclosed, exclude scope, or await Research Library resolution.

### 9.6 Frozen standard relies on qualified, superseded, or inapplicable evidence

Impact review REQUIRED. Frozen text remains binding until governed revision. **Revision History** SHALL record evidence change type per Section 4.1.2 and resulting disposition.

---

## 10. Evidence Change Propagation

When Research Library verified facts evolve, supersede, qualify, become inapplicable, or are replaced, the following propagation rules apply.

### 10.1 Identification

Identify affected:

- Register rows citing the fact in **Evidence References** or **Dependencies**
- Admitted queue entries whose readiness depends on the fact
- Draft and frozen Design Standards citing the fact in Source or Evidence sections
- Governance documents citing the fact

### 10.2 Impact assessment

Impact assessment SHALL record:

- Fact identifier(s) affected
- Change type per Section 4.1.2
- Prior and current Cited Evidence Baseline where material
- Artifacts and Req IDs affected
- Whether normative scope, qualification boundary, or disclosure changes

### 10.3 Dispositions

| Disposition | When used |
|-------------|-----------|
| **No change** | Fact change does not alter normative boundary of citing artifact |
| **Clarification only** | Wording or disclosure improves without changing obligation |
| **Revision** | Normative content, Source, or Evidence section requires update |

### 10.4 Required records

Evidence-driven changes SHALL record:

- **Revision History** entry with date, summary, and fact identifiers
- Prior and updated citations and Cited Evidence Baseline where citations change
- Disposition selected
- Freeze review repeated when material normative content changes on a frozen artifact

### 10.5 Frozen artifact integrity

Frozen Design Standards SHALL NOT be silently edited. Prior frozen versions remain binding until replacement freeze. Historical evidence citations and Cited Evidence Baseline at each revision SHALL remain recoverable from **Revision History** and version record.

### 10.6 Register and queue

Register **Evidence References** and **Dependencies** SHALL be updated through register change control when planning posture changes. Queue readiness SHALL be re-evaluated per `FI-DSN-QUE-001` when admitted work is evidence-sensitive.

---

## 11. Drafting and Freeze Gates

### 11.1 Drafting gates

Drafting MAY continue when:

| Condition | Requirement |
|-----------|-------------|
| Nonblocking open question | Issue does not affect normative claims in current draft scope; OQ recorded if persistent |
| `Open` evidence with qualification | Blocked elements and partial scope explicitly recorded; normative claims in blocked scope not drafted as final |
| Research gap | Scope excludes gap subject, canonical boundary label recorded, or standard is company-judgment-only with disclosure |
| Vendor pending | **Pending Vendor Confirmation** or other applicable canonical boundary label used; no false certainty in normative text; unresolved `HW-VQ-*` not cited as verified fact |

Drafting MUST stop or remain in blocked partial-draft posture when:

- Normative text cites HOLD, REJECT, or nonexistent fact IDs
- Material factual claims lack evidence, Company Judgment disclosure, `Open` + OQ, or an authorized canonical boundary label
- Unresolved assumption supports normative text in freeze path
- Material fact conflict is unaddressed or requires Research Library escalation per Section 9.2
- Unresolved `HW-VQ-*` item is treated as verified evidence

### 11.2 Freeze gates

Before freeze promotion, confirm:

- [ ] Every normative requirement has valid Source posture per Section 8
- [ ] Evidence section complete per `FI-DSN-GOV-001` Section 9.3
- [ ] Company Judgment section complete when applicable per `FI-DSN-GOV-001` Section 10
- [ ] **Evidence References** in register metadata use allowed states per `FI-DSN-GOV-002`
- [ ] Material open questions recorded; blocking OQs resolved or scope excluded
- [ ] No unresolved assumptions support frozen requirements
- [ ] Qualifications preserved on all cited facts
- [ ] No vendor or community material cited as verified evidence
- [ ] No unresolved `HW-VQ-*` item or `(pending)` sourcing treated as verified evidence
- [ ] Canonical boundary labels used correctly per Section 7.10
- [ ] Epistemic Validation pass recorded per Section 12

---

## 12. Epistemic Validation

Epistemic Validation is governance-level epistemic validation. It is not implementation testing and does not replace metadata validation under `FI-DSN-GOV-002` Section 10.

Before freeze of a governed artifact subject to this document, Epistemic Validation MUST pass. A failure in any applicable check is a validation failure.

| Check | Pass criterion |
|-------|----------------|
| Authorized source posture | Every normative requirement has an authorized source posture per Section 8 |
| Verified evidence references | Verified evidence references use frozen Research Library fact identifiers only |
| Qualification preservation | Material qualifications on cited facts are preserved |
| Company Judgment disclosure | Company Judgment is explicitly disclosed where required |
| Assumption resolution | Assumptions do not silently support frozen requirements |
| Vendor and community boundary | Vendor and community information have not been treated as verified evidence without Research Library promotion |
| Inference resolution | Inference is labeled and resolved before freeze where material |
| Research gap disposition | Material research gaps are properly represented per Section 5.7.1 |
| Open question identifiers | Open questions use authorized `OQ-{DOMAIN}-###` identifiers |
| Boundary label compliance | Canonical boundary labels from Section 7.10 are used correctly |
| Evidence Permanence | Evidence Permanence obligations per Section 4.1 are satisfied |
| Fact conflict escalation | Material fact conflicts have been escalated to the Research Library or harmonized per Section 9.2 |
| Gate compliance | Drafting and freeze gates in Section 11 have been passed |
| No unauthorized extensions | No unauthorized metadata field, register column, queue state, or identifier family has been introduced |

Epistemic Validation supplements the detailed freeze checklist in Section 11.2; it does not replace it.

---

## 13. Epistemic Change Control

Changes to `FI-DSN-GOV-003` REQUIRE governed revision under `FI-DSN-GOV-001` Section 15. This section governs epistemic change control for this document only. It does not create a competing lifecycle.

The following changes REQUIRE governed revision, version increment where applicable, impact review, review of affected downstream artifacts, formal review before re-freeze, and a **Revision History** entry:

- Epistemic taxonomy
- Evidence source eligibility
- Evidence sufficiency rules
- Company Judgment rules
- Assumption treatment
- Boundary label interpretation
- Evidence Permanence or Cited Evidence Baseline rules
- Conflict escalation rules
- Drafting gates
- Freeze gates
- Epistemic Validation rules
- Change propagation rules
- Authority boundaries with `FI-DSN-GOV-001`, `FI-DSN-GOV-002`, `FI-DSN-REG-001`, `FI-DSN-QUE-001`, or the Research Library

Required process:

1. Version increment where governed by `FI-DSN-GOV-001`
2. Impact review of affected Design Standards, register posture, queue readiness implications, and downstream governance consumers
3. Review of affected downstream artifacts
4. Formal review before re-freeze
5. **Revision History** entry documenting the change
6. No informal amendment through examples, planning records, volume supplements, or implementation behavior

---

## 14. Freeze Gate

The Freeze Gate summarizes the minimum conditions required before `FI-DSN-GOV-003` or a downstream artifact governed by it MAY be frozen. This section does not create a new lifecycle stage.

Before freeze promotion, as applicable, confirm:

- [ ] Architecture approval obtained for the artifact or governing revision
- [ ] Epistemic Validation pass per Section 12
- [ ] Authorized evidence posture per Sections 7 and 8
- [ ] Qualification preservation on all cited facts
- [ ] Company Judgment disclosure where required
- [ ] Assumption resolution complete
- [ ] Material research gap disposition per Section 5.7.1
- [ ] Open question disposition complete or scope excluded
- [ ] Canonical boundary label compliance per Section 7.10
- [ ] Verified fact conflict escalation completed where required per Section 9.2
- [ ] Evidence Permanence and Cited Evidence Baseline compliance per Section 4.1
- [ ] Downstream impact review completed where evidence changed per Section 10
- [ ] Metadata compliance per `FI-DSN-GOV-002`
- [ ] Identifier compliance per `FI-DSN-ID-001`
- [ ] **Revision History** complete
- [ ] No unresolved material contradiction with frozen governance

The detailed freeze checklist in Section 11.2 and metadata validation under `FI-DSN-GOV-002` Section 10 remain authoritative for their respective domains.

This standard is **Frozen Governance Standard**, Version 1.0, effective July 23, 2026.

---

## 15. Disposition-Specific Evidence Applicability

This section resolves authority for disposition-specific evidence expectations.

| Layer | Authority |
|-------|-----------|
| `FI-DSN-GOV-003` | Design Library-wide epistemic minimums and minimum freeze gates |
| `FI-DSN-GOV-002` | Canonical metadata applicability semantics |
| Volume supplements | MAY define additional disposition-specific evidence expectations where authorized |
| Production Design Standards | Apply governing rules; MUST NOT invent competing epistemic governance |

Volume supplements MUST NOT:

- weaken GOV-003 minimum gates,
- redefine verified evidence,
- redefine Company Judgment,
- redefine canonical metadata fields,
- authorize assumptions or unverified information to support frozen requirements, or
- create new epistemic source categories without governed amendment.

Where a volume supplement is silent, `FI-DSN-GOV-003` applies directly.

Where a volume supplement conflicts with `FI-DSN-GOV-003`, `FI-DSN-GOV-003` controls unless `FI-DSN-GOV-003` is formally revised.

---

## 16. Harmonization with `FI-DSN-GOV-001`

| Layer | Authority |
|-------|-----------|
| `FI-DSN-GOV-001` | Design Standard lifecycle, top-level governance, freeze policy, and high-level evidence and company judgment policy (Sections 9 and 10) |
| `FI-DSN-GOV-003` | Detailed epistemic taxonomy, sufficiency rules, permanence principles, conflict governance, propagation rules, drafting/freeze gates, validation, and change control |

### 16.1 Operational relationship

`FI-DSN-GOV-003` **operationalizes** `FI-DSN-GOV-001` Sections 9 and 10. It does not replace lifecycle authority, freeze policy, or normative language rules in `FI-DSN-GOV-001`.

Where overlap exists:

1. `FI-DSN-GOV-001` remains the lifecycle and top-level governance authority.
2. `FI-DSN-GOV-003` supplies detailed epistemic rules consumable by planning metadata, drafting, queue readiness evaluation, and Design Standard authoring.
3. Any conflict between the documents MUST be resolved through governed revision under `FI-DSN-GOV-001` Section 15, not informal interpretation.

### 16.2 Non-contradiction rules

- HOLD and REJECT fact rules in `FI-DSN-GOV-001` Section 9.2 remain binding.
- Vendor question and `(pending)` sourcing rules in `FI-DSN-GOV-001` Section 9.2 remain binding.
- Canonical boundary labels in `FI-DSN-GOV-001` Section 9.4 remain binding.
- Company judgment disclosure rules in `FI-DSN-GOV-001` Section 10 remain binding.
- Baseline alignment in `FI-DSN-GOV-001` Section 8.3 remains the triggering authority for impact review; this document defines epistemic disposition detail.

---

## 17. Relationship to Metadata Standard (`FI-DSN-GOV-002`)

| Boundary | Rule |
|----------|------|
| Metadata authority | `FI-DSN-GOV-002` governs canonical field names, semantics, and applicability rules |
| This document | Governs epistemic rules for **Evidence References**, **Company Judgment**, **Open Questions**, and **Dependencies** without redefining fields |
| No new fields | This document SHALL NOT add canonical metadata columns or fields |
| Allowed states | **Evidence References** allowed states remain exactly as defined in `FI-DSN-GOV-002` Section 6 |
| Validation split | Metadata validation checks field presence and format per `FI-DSN-GOV-002` Section 10; this document governs epistemic sufficiency evaluated at drafting, validation, review, and freeze gates |

---

## 18. Relationship to Planning Register (`FI-DSN-REG-001`)

| Boundary | Rule |
|----------|------|
| Register role | Authoritative planning inventory recording evidence references, dependencies, boundary posture, and planning state per the frozen register schema |
| Factual verification | The Planning Register does not perform factual verification |
| Sufficiency adjudication | The Planning Register does not independently adjudicate epistemic sufficiency |
| Sufficiency evaluation | Epistemic sufficiency is evaluated during drafting, Epistemic Validation, review, and freeze gates under this document |
| Metadata validation | Metadata validation remains governed by `FI-DSN-GOV-002` |
| Recording outcomes | The Register MAY record the result or planning consequence of a governed evaluation where authorized by `FI-DSN-REG-001` and `FI-DSN-GOV-002` |
| Evidence References column | Records current pointer state; does not verify facts |
| Company Judgment column | Records disclosure presence; does not author judgment |
| Open Questions column | Records persistent OQ identifiers; does not resolve questions |

---

## 19. Relationship to Drafting Queue (`FI-DSN-QUE-001`)

| Boundary | Rule |
|----------|------|
| Queue role | Operational drafting sequence and readiness reflection |
| Readiness label | MAY reflect register **Evidence References** state; SHALL NOT verify facts |
| No promotion | Queue operations SHALL NOT promote facts or alter Research Library baselines |
| Gates | Evidence sufficiency gates in Section 11 inform readiness; queue state remains operational per `FI-DSN-QUE-001` |
| Vendor pending | Queue MAY reflect vendor-pending readiness consequences; it does not verify vendor information or define epistemic truth |

---

## 20. Relationship to Design Standards and Template

| Boundary | Rule |
|----------|------|
| Design Standards | Convert governed evidence and company judgment into normative requirements |
| Template | `FI-DSN-TPL-001` Evidence and Company Judgment sections and Source column values remain authoritative for standard structure |
| Facts vs requirements | Facts support requirements; requirements are `{Standard ID}-R{nn}` obligations |
| Transparency | Frozen standards SHALL retain Source, Evidence, Company Judgment, open question, and **Revision History** treatment required by template and metadata governance |
| No local epistemic rules | Production Design Standards apply this document; they MUST NOT invent competing epistemic governance |

---

## 21. Relationship to Identifier System and Classification

| Boundary | Rule |
|----------|------|
| Identifier authority | `FI-DSN-ID-001` governs `FI-DSN-GOV-###`, `OQ-{DOMAIN}-###`, and fact ID reference formats |
| Governance identifier | This document is `FI-DSN-GOV-003` per `FI-DSN-ID-001` Section 6.1 |
| Open questions | Default `OQ-DSN-###`; no `OQ-EVG` domain |
| Classification | `FI-DSN-CLS-001` evidence independence for **Primary Classification** preserved; evidence does not determine `CLS-*` assignment |

### 21.1 Governance identifier authorization (`FI-DSN-GOV-003`)

| Item | Record |
|------|--------|
| Namespace family | `FI-DSN-GOV-###` established by `FI-DSN-ID-001` Section 6.1 |
| Assigned identifier | `FI-DSN-GOV-003` |
| Authorization basis | Explicit Sprint D1.8 creation process for Evidence vs Company Judgment Governance |
| Collision verification | Repository verification SHALL confirm `FI-DSN-GOV-003` was unused before assignment at freeze promotion |
| Scope of resolution | Assignment of `FI-DSN-GOV-003` resolves the deferred evidence governance identifier for this artifact only |

---

## 22. Open Planning Questions

### Inherited nonblocking questions

| ID | Artifact | Status | Relevance |
|----|----------|--------|-----------|
| `OQ-CLS-001` | `FI-DSN-CLS-001` | Open; deferred to Volume Roadmap | Classification justification; does not alter epistemic taxonomy |
| `OQ-DSN-003` | `FI-DSN-GOV-002` | Open; deferred to Visual Source schema artifact | Visual Source required-field triggers; orthogonal to core evidence rules |

### Resolved in Version 0.2

| Question | Resolution |
|----------|------------|
| Disposition-specific evidence applicability matrices | Resolved by Section 15 — GOV-003 owns library-wide minimums; volume supplements may add disposition detail without weakening gates |
| Vendor-pending queue readiness coordination | Resolved by Sections 7.11 and 19 — vendor-pending posture governed here; queue reflects readiness only |

---

## 23. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 Draft | July 23, 2026 | F.I. Forgot | Sprint D1.8 — initial Evidence vs Company Judgment Governance (`FI-DSN-GOV-003`) draft: epistemic taxonomy, Evidence Permanence, sufficiency and conflict governance, GOV-001 harmonization, propagation rules, drafting and freeze gates |
| 0.2 Draft (refined) | July 23, 2026 | F.I. Forgot | Sprint D1.8 refinement — Cited Evidence Baseline and Evidence Permanence model; canonical boundary labels; vendor question and `(pending)` sourcing governance; Research Library fact-conflict escalation; disposition applicability authority; Epistemic Validation; Epistemic Change Control; Freeze Gate; register boundary clarification; research gap versus open question decision rule; architecture review corrections AR-D18-001 through AR-D18-013 |
| 1.0 | July 23, 2026 | F.I. Forgot | Frozen — promoted to Frozen Governance Standard; Formal Freeze Review passed; §8.2 explicit prohibition of `HW-VQ-*` and `(pending)` sourcing (FR-FRZ-001); `OQ-CLS-001` and `OQ-DSN-003` remain deferred |

### Historical note (nonnormative)

During Sprint D1.8 architecture design, the identifier `FI-DSN-EVG-001` was proposed and rejected. No `EVG` namespace is authorized. The assigned identifier is `FI-DSN-GOV-003`.

### Future revision notes

Revisions after freeze require documented change control under Section 13 and `FI-DSN-GOV-001` Section 15. Conditions that would trigger a new governance version and freeze review include: change to epistemic taxonomy, Evidence Permanence rules, conflict resolution order, propagation dispositions, or authority boundaries.

---

**End of Document**
