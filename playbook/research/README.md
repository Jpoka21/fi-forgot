# F.I. Forgot Research Library

| Field | Value |
|-------|-------|
| **Status** | Frozen Governance Standard |
| **Governance version** | 1.0 |
| **Effective date** | July 21, 2026 |
| **Branch** | `frontend-rebuild` |

---

## 1. Purpose

The F.I. Forgot Research Library exists to create traceable, durable, source-backed knowledge that may later inform F.I. Forgot company standards, engineering specifications, and product decisions.

Research volumes collect and evaluate evidence about manufacturing, printing, artwork, envelopes, paper, fulfillment, vendors, postal operations, APIs, logistics, materials, and related subjects. The library preserves what is known, what is uncertain, what is contradicted, and what remains unverified.

Research findings do not automatically become company standards. A claim may appear in a research report, survive initial review, and still fail evidence audit. Only facts that complete the full research lifecycle and are promoted under controlled governance may inform downstream standardization.

---

## 2. Governing Knowledge Architecture

All research in this library follows a fixed lifecycle:

```
Research Report
        ↓
Evidence Audit
        ↓
Verified Facts
        ↓
Change Log
        ↓
Design Library or Company Standards
        ↓
Engineering Specifications
        ↓
Implementation
```

Each layer has a distinct responsibility.

**Research Report** collects and organizes available evidence. It may include broad context, contradictions, open questions, and preliminary implications. It is not a final factual authority.

**Evidence Audit** tests claim quality, source traceability, recency, conflicts, scope, and promotion eligibility. It determines which claims may advance and which must be held, rejected, or qualified.

**Verified Facts** contains only audited and source-captured facts approved for downstream use. It is the permanent factual baseline for a research volume.

**Change Log** preserves the history of changes to the verified baseline, including version numbers, affected files, reasons, and governance context.

**Design Library or Company Standards** defines how F.I. Forgot chooses to operate. These documents translate verified knowledge into policy, design rules, and operational expectations.

**Engineering Specifications** translate company standards into implementable requirements for systems, workflows, artwork, manufacturing execution, vendor configuration, and quality controls.

**Implementation** includes code, workflows, artwork, manufacturing execution, vendor configuration, and operational processes that put standards and specifications into practice.

No layer may skip the layer above it. Implementation must not be justified solely by research narrative. Company standards must not be written from unverified claims.

---

## 3. Required Volume Structure

Every future research volume must use this file structure:

| File | Role |
|------|------|
| `01-research-report.md` | Evidence collection and research narrative |
| `02-evidence-audit.md` | Claim evaluation, source capture, and promotion decisions |
| `03-verified-facts.md` | Frozen verified factual baseline |
| `04-change-log.md` | Revision history for the verified baseline |

Optional supporting directories:

| Directory | Purpose |
|-----------|---------|
| `assets/` | Diagrams, tables, images, and other supporting artifacts |
| `source-captures/` | Archived source captures, screenshots, or capture notes |
| `vendor-responses/` | Documented vendor confirmations and correspondence |
| `supporting-documents/` | Contracts, specifications, samples, and other supporting files |

No Verified Facts document may be populated before the Evidence Audit and exact source capture passes are complete.

---

## 4. Research Report Standard

A Research Report is a broad evidence collection document. It organizes what is known, what is disputed, and what remains open.

Every Research Report must include:

- **Clear scope** defining what is in scope, out of scope, and deferred to later volumes
- **Source hierarchy** applied consistently throughout the report
- **Citations throughout** for material claims
- **Distinction between current and historical evidence**
- **Distinction between fact, marketing claim, independent reporting, inference, and unverified information**
- **Contradictions** among sources or within the subject matter
- **Open questions** that evidence does not yet resolve
- **Research gaps** where evidence is missing or insufficient
- **Implications** without premature product decisions

Research reports may contain claims that later fail audit. The report’s value is disciplined evidence gathering and explicit uncertainty, not premature factual authority.

---

## 5. Evidence Audit Standard

Every material claim in a Research Report must be evaluated in an Evidence Audit.

Each claim must be assessed for:

- Exact wording
- Source identity
- Source type
- Source recency
- Direct support
- Scope
- Conflict
- Qualification
- Promotion eligibility
- Source traceability
- Need for vendor confirmation

### Audit outcomes

| Outcome | Meaning |
|---------|---------|
| **APPROVED** | The claim is sufficiently supported, correctly scoped, and traceable for its intended use |
| **APPROVED WITH LIMITATION** | The claim is supportable only with explicit qualification, narrower wording, or restricted scope |
| **HOLD** | Evidence is incomplete, conflicting, stale, inferential, or otherwise insufficient for promotion |
| **REJECTED** | The claim is unsupported, contradicted, out of scope, or unsuitable for factual promotion |

HOLD and REJECTED claims must not enter the Verified Facts document.

---

## 6. Evidence Classification Standard

Every audited claim must receive an evidence classification describing the nature of the supporting material.

| Classification | Meaning |
|----------------|---------|
| **Verified Official Fact** | Supported by a current official source from the subject vendor or authority |
| **Verified Through Multiple Official Sources** | Supported by multiple current official sources that corroborate the same claim |
| **Support Documentation** | Supported by official support, operations, or workflow documentation |
| **Developer Documentation** | Supported by official API, SDK, or technical platform documentation |
| **Independent Reporting** | Supported by reputable third-party reporting when no adequate official source exists |
| **Historical Information** | Supported by older official or independent material not established as current |
| **Official Marketing Claim** | Stated on official marketing, comparison, or promotional materials |
| **Reasonable Inference** | Logically derived from available evidence but not directly stated by a source |
| **Unverified** | No adequate supporting source identified |
| **Contradicted** | Current evidence conflicts with the claim or with other credible sources |
| **Requires Direct Vendor Confirmation** | Public evidence cannot resolve the claim without vendor input |

Classification describes the nature of the evidence. It does not automatically determine audit outcome. A marketing claim may be APPROVED WITH LIMITATION if the fact concerns the existence of the marketing statement itself. An official fact may still be HOLD if scope, recency, or traceability is insufficient.

---

## 7. Source Hierarchy

Source priority depends on the claim being evaluated. In general, use this order:

1. Contractual or guarantee language
2. Current official company documentation
3. Current official technical or product documentation
4. Current official support documentation
5. Current official developer documentation
6. Multiple consistent official sources
7. Independent reputable reporting
8. Historical official sources
9. Official marketing and comparison pages
10. Community discussion
11. Analyst inference
12. Absence of evidence

Higher-priority sources should be used whenever available. Lower-priority sources may inform research but rarely support verified fact promotion without qualification.

Source quality is claim-specific. Developer documentation may prove platform capability but not universal operational use. Support documentation may prove a documented customer workflow but not undisclosed manufacturing detail. Marketing language must not be promoted as measured performance.

---

## 8. Source Capture Requirements

Before a fact may enter a Verified Facts document, exact source capture must be completed in the Evidence Audit.

Each promotion candidate must record:

- Exact source title
- Exact source URL
- Source type
- Publication or updated date, when available
- Access date
- Short supporting excerpt or tightly bounded evidence summary
- Supported paraphrase
- Conflict review
- Qualification
- Confidence
- Promotion readiness

### Prohibited practices

- Domain-only citations
- Search-result snippets as evidence
- AI summaries as evidence
- Invented URLs, titles, dates, or quotations
- Stale sources used as proof of current operations
- Marketing language treated as measured performance
- API capability treated as proof of universal operational use
- Historical information treated as current without explicit labeling

A source must be reviewed directly before it is cited. If an exact source cannot be found, the candidate remains on HOLD.

---

## 9. Verified Facts Standard

Verified Facts documents are the permanent factual baseline for a research volume.

They must:

- Contain only facts marked **READY** or **READY WITH QUALIFICATION** after source capture
- Preserve fact IDs permanently
- Preserve qualifications in full
- Preserve audit mappings
- Preserve exact source URLs
- Remain vendor facts, not F.I. Forgot standards
- Preserve missing IDs when a candidate is held or removed
- Never reuse retired or held IDs
- Identify evidence boundaries explicitly
- Receive a frozen baseline version before downstream standardization

Verified Facts documents must not contain research narrative, audit reasoning, product decisions, or company standards.

---

## 10. Fact ID Governance

Verified facts use structured identifiers.

Example patterns:

- `HW-MFG-001` — vendor manufacturing fact
- `HW-PRN-001` — vendor printing fact
- `HW-API-001` — vendor API or platform fact
- `HW-FUL-001` — vendor fulfillment fact
- `FI-ART-001` — F.I. Forgot artwork subject fact
- `FI-MAT-001` — F.I. Forgot materials subject fact

### Rules

- IDs are permanent
- IDs are never reassigned
- Deleted, rejected, or held IDs remain reserved
- Domains should be stable and meaningful
- Renumbering is prohibited after publication

A gap in numbering is intentional when a fact is held or removed. Gaps preserve audit trail integrity.

---

## 11. Confidence Levels

| Level | Meaning |
|-------|---------|
| **High** | Strong direct support with clear wording and no material conflict among captured sources |
| **Medium-High** | Strong support with a minor scope, corroboration, or traceability limitation |
| **Medium** | Support present but narrowed, partial, application-specific, or dependent on qualification |
| **Low** | Weak, indirect, stale, or materially limited support; rarely suitable for promotion without HOLD |

Confidence may not be raised without stronger evidence and a documented Evidence Audit revision.

---

## 12. Vendor Confirmation

Direct vendor confirmation is required when public evidence cannot resolve:

- Internal manufacturing processes
- Quality thresholds
- Capacity
- Staffing
- Continuity and disaster recovery
- Materials and subprocesses
- Vendor subprocesses
- Conflicting service commitments
- Undisclosed workflows

Vendor confirmation must record:

- Date
- Source person
- Role
- Communication channel
- Exact statement
- Scope
- Limitations
- Reviewer
- Related audit and fact IDs

Undocumented verbal statements may not be promoted. Vendor confirmation becomes part of the evidence record and must be traceable in the audit and change log as appropriate.

---

## 13. Change Control

All changes to verified factual baselines are controlled.

### Requirements

- Every change to a Verified Facts document must be preceded by an Evidence Audit revision
- Every change must be recorded in the volume Change Log
- Editorial changes that affect no meaning must still be logged
- Qualifications may not be removed without re-audit
- Source changes must be documented
- Version numbers must be updated
- Held and removed IDs remain reserved
- Downstream standards must be reviewed when a governing fact changes

### Versioning guidance

| Version | Use |
|---------|-----|
| **1.0** | First frozen baseline |
| **1.1** | Minor evidence or wording corrections that do not materially change meaning |
| **2.0** | Material factual changes, scope changes, or baseline restructuring |

---

## 14. Separation of Facts and Standards

Research, facts, standards, and specifications serve different purposes and must not be conflated.

**Vendor Fact:** What an external source or vendor verifiably states or supports.

**F.I. Forgot Standard:** How F.I. Forgot chooses to operate.

**Engineering Specification:** The technical or operational rule that implements the standard.

### Example

| Layer | Statement |
|-------|-----------|
| Vendor Fact | A vendor uses physical pens to produce handwritten-style output. |
| F.I. Forgot Standard | F.I. Forgot cards must preserve visible physical-ink writing. |
| Engineering Specification | Production validation must reject output produced only through simulated handwriting print. |

A vendor fact does not automatically require adoption as a company standard. F.I. Forgot may adopt a stricter, narrower, or different rule based on product requirements, risk tolerance, and operational needs.

---

## 15. Downstream Traceability

Traceability must survive the transition from research to implementation.

- Every major company standard must reference supporting Fact IDs
- Every engineering specification must reference the governing company standard
- Not every sentence requires a citation
- Material decisions, constraints, and requirements must remain traceable

Downstream documents must preserve material qualifications from the verified baseline. Removing a qualification requires re-audit and change control.

---

## 16. Research Boundaries

Research volumes must remain scoped.

- Subjects intentionally deferred to later volumes must not be expanded merely because related evidence is available
- Open questions must remain open until evidence resolves them
- Absence of evidence must not be converted into a limitation claim

Boundary discipline prevents scope creep, premature standardization, and accidental promotion of unrelated claims.

---

## 17. Quality Standard

Every Research Library document must be:

- Publication quality
- Source-backed
- Internally consistent
- Version controlled
- Suitable for future designers, engineers, operators, agencies, auditors, and manufacturing partners
- Understandable without access to the original research conversation
- Explicit about uncertainty
- Conservative in factual promotion
- Free from unsupported recommendations

When evidence is weak, the document must say so. When a claim is marketing, inference, or historical, the document must label it accordingly.

---

## 18. Required Freeze Gate

A research volume is not complete until all freeze requirements are satisfied.

Before a volume is considered complete, confirm:

- [ ] Research report complete
- [ ] Evidence audit complete
- [ ] Exact source capture complete
- [ ] Verified facts populated
- [ ] Held and rejected claims excluded
- [ ] Fact index reconciled
- [ ] Source index reconciled
- [ ] Evidence boundaries documented
- [ ] Change log created
- [ ] Baseline version assigned
- [ ] Status set to **Frozen Verified Baseline**
- [ ] No downstream standard written from unverified claims

---

## 19. Current Reference Implementation

The first completed implementation of this governance model is:

`playbook/research/handwrytten/volume-01-manufacturing-overview/`

Files:

- `01-research-report.md`
- `02-evidence-audit.md`
- `03-verified-facts.md`
- `04-change-log.md`

This volume is the reference architecture for future research volumes. It demonstrates the full lifecycle from research report through frozen verified baseline and change log. Future volumes should follow the same structure, audit discipline, and freeze gate without copying subject-specific conclusions.

---

## 20. Governance Statement

This Research Library process is mandatory for future evidence-based F.I. Forgot standards unless a documented governance revision replaces it.

Research may inform standards.

Research does not become standards automatically.

Verified facts remain subject to controlled revision when evidence changes.

No implementation work, company standard, or engineering specification should treat research narrative or unaudited claims as authoritative. Only frozen verified facts, used with their qualifications intact, may govern downstream standardization.
