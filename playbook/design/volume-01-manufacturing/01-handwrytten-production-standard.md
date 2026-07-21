# F.I. Forgot Design Library — Volume 01

# Manufacturing and Production Standard

## Document Control

| Field | Value |
|-------|-------|
| **Document** | `01-handwrytten-production-standard.md` |
| **Volume** | 01 — Manufacturing and Production |
| **Status** | Architecture Draft |
| **Version** | 2.0 Architecture Draft |
| **Date** | July 21, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Upstream governance** | `playbook/design/README.md` |
| **Governing verified facts** | `playbook/research/handwrytten/volume-01-manufacturing-overview/03-verified-facts.md` (Baseline Version 1.0) |
| **Verified facts mapping status** | Complete |
| **Verified facts baseline** | Handwrytten Manufacturing Overview v1.0 |

---

## 1. Purpose

This document is the permanent governing structure for F.I. Forgot Volume 01 manufacturing and production standards.

Its purpose is not to duplicate vendor documentation or restate the Research Library. Its purpose is to define how verified manufacturing facts are translated into F.I. Forgot company decisions, constraints, engineering implications, and validation requirements.

Manufacturing partners may change over time. The customer experience should not. This volume establishes the architectural framework that every future engineering, illustration, layout, template, printing, and production decision must respect once standards are written.

**This document is an architecture draft only.** It defines structure, governance, and placeholders. It does not yet contain populated manufacturing standards, engineering specifications, or product decisions.

---

## 2. Scope

### In scope

This volume will eventually govern:

- Card formats and production structure
- Printing specifications and artwork production requirements
- Safe zones, bleed, and trim
- Handwriting and envelope production constraints
- Platform and API capability boundaries as they affect design and production
- Operational limitations relevant to manufacturing and fulfillment
- Vendor questions, evidence boundaries, and engineering implications

### Out of scope

This volume does not define:

- Brand identity, illustration style, typography, or color philosophy (Volume 02)
- Card template architecture and layout system (Volume 03)
- Artwork selection intelligence (Volume 04)
- Signature collections (Volume 05)
- User experience, product features, or application behavior

Subjects intentionally deferred to later research or design volumes must not be expanded here merely because related evidence exists elsewhere.

---

## 3. Document Relationship

Volume 01 sits in the middle of the F.I. Forgot knowledge architecture:

```
Research Library
        ↓
Verified Facts
        ↓
Design Library (this volume)
        ↓
Engineering Specifications
        ↓
Implementation
```

| Layer | Role relative to this document |
|-------|--------------------------------|
| **Research Library** | Governs how evidence is collected, audited, source-captured, and promoted |
| **Verified Facts** | Supplies the frozen factual baseline that may inform this volume |
| **Design Library** | Contains F.I. Forgot company decisions; this document is Volume 01 of that library |
| **Engineering Specifications** | Will translate adopted standards from this volume into implementable requirements |
| **Implementation** | Will include code, workflows, artwork rules, manufacturing execution, and vendor configuration |

This document begins only after relevant facts have passed evidence audit and source capture. Research narrative does not authorize standards. Verified facts do not automatically become standards.

---

## 4. Governing Sources

All material vendor facts used by this document must originate from the frozen Verified Facts baseline. Authoritative upstream sources:

| Source | Path | Status |
|--------|------|--------|
| **Research Library governance** | `playbook/research/README.md` | Frozen Governance Standard, Version 1.0 |
| **Volume 01 verified facts** | `playbook/research/handwrytten/volume-01-manufacturing-overview/03-verified-facts.md` | Frozen Verified Baseline, Version 1.0 |
| **Volume 01 evidence audit** | `playbook/research/handwrytten/volume-01-manufacturing-overview/02-evidence-audit.md` | Completed audit and source capture record |
| **Volume 01 verified facts change log** | `playbook/research/handwrytten/volume-01-manufacturing-overview/04-change-log.md` | Baseline revision history |
| **Design Library governance** | `playbook/design/README.md` | Governance Review Draft, Version 1.1 Draft |

No vendor capability, timing commitment, operational detail, or manufacturing claim may be introduced in this document unless it is traceable to the frozen verified facts baseline or explicitly labeled as company judgment, pending vendor confirmation, or deferred research.

**Held fact note:** `HW-MFG-010` remains on HOLD. Timing-related standards may not be written from HW-MFG-010 until vendor confirmation resolves the conflict.

---

## 5. Manufacturing Philosophy

F.I. Forgot considers manufacturing to be part of the product.

Printing is not the final step of the customer experience. Printing is the mechanism through which the experience is delivered. Manufacturing exists to faithfully deliver the designed experience—not to define it in isolation.

Every future production decision in this volume should support four goals:

- Preserve the emotional impact of the handwritten message
- Maintain premium presentation
- Ensure manufacturing reliability
- Scale without sacrificing quality

Vendor practices inform these goals. They do not replace F.I. Forgot judgment. This philosophy governs how standards will be written; it is not itself a manufacturing standard.

---

## 6. Manufacturing Principles

This section will contain governing principles that shape how F.I. Forgot interprets verified facts into manufacturing decisions. Principles guide standards; they are not standards.

**Status:** Placeholder — principles not yet authored.

| Principle (placeholder) | Intended role | Status |
|-------------------------|---------------|--------|
| Message First | Ensure the handwritten message remains the emotional centerpiece | `[TO BE AUTHORED]` |
| Artwork Supports Message | Ensure visual and physical presentation supports, not competes with, the message | `[TO BE AUTHORED]` |
| Manufacturability | Ensure design choices respect known production realities | `[TO BE AUTHORED]` |
| Premium Experience | Ensure production decisions reinforce perceived quality | `[TO BE AUTHORED]` |
| Operational Reliability | Ensure standards account for fulfillment and production dependability | `[TO BE AUTHORED]` |
| Human Perception | Ensure physical output preserves the intended recipient experience | `[TO BE AUTHORED]` |

Additional principles may be added during standard authoring. No principle in this section may be treated as a frozen requirement until explicitly promoted through the revision process.

---

## 7. Verified Manufacturing Facts

This section records verified Handwrytten facts from the frozen Volume 01 verified facts baseline. Facts are cited for traceability; they are not restated as F.I. Forgot standards.

**Status:** Verified facts mapping complete.

**Source:** `playbook/research/handwrytten/volume-01-manufacturing-overview/03-verified-facts.md` — Frozen Verified Baseline, Version 1.0.

### 7.1 Governing fact register

| Fact ID | Domain | Short Fact Statement | Verification Status | Confidence | Material Qualification | Primary Source | Related Audit ID |
|---------|--------|----------------------|---------------------|------------|------------------------|----------------|------------------|
| HW-MFG-001 | Production Infrastructure | Handwrytten’s current company page displays “200 Robots and Counting!” as its official fleet-size statement. | VERIFIED WITH QUALIFICATION | High | Fleet-size language only; not utilization. | About Handwrytten \| Handwritten Letter Service Online — https://www.handwrytten.com/about/the-company/ | HW-AUD-003 |
| HW-MFG-002 | Robotic Handwriting | Handwrytten’s current company page states the patented Handwrytten robot is capable of autonomously writing nearly 750 notes a day. | VERIFIED WITH QUALIFICATION | High | Per-machine capacity statement, not fleet-average throughput. | About Handwrytten \| Handwritten Letter Service Online — https://www.handwrytten.com/about/the-company/ | HW-AUD-004 |
| HW-MFG-003 | Robotic Handwriting | Handwrytten’s robot page states the company has two U.S. patents, 11,052,693 and 11,260,686, for handwriting robots in production environments. | VERIFIED | High | Patent citation only; scope not reproduced. | Handwriting Robots - Handwrytten — https://www.handwrytten.com/about/robots/ | HW-AUD-005 |
| HW-MFG-004 | Robotic Handwriting | Handwrytten’s company FAQ states that custom-designed handwriting robots hold real pens to write notes in the handwriting style of the customer’s choice. | VERIFIED WITH QUALIFICATION | High | Core production-method disclosure. | About Handwrytten — Company FAQ — https://www.handwrytten.com/about/the-company/#company-faq | HW-AUD-011 |
| HW-MFG-005 | Fulfillment | Handwrytten’s company FAQ states that envelopes are crafted with the same attention to detail as the note, confirming envelope handling as part of fulfillment. | VERIFIED WITH QUALIFICATION | High | Use envelope-handling wording; specific addressing method not disclosed. | About Handwrytten — Company FAQ — https://www.handwrytten.com/about/the-company/#company-faq | HW-AUD-012 |
| HW-MFG-006 | Signature Handling | Handwrytten’s signature guide states that a custom signature is hand-recreated by the design team and written using the same handwriting robots that write the card. | VERIFIED WITH QUALIFICATION | High | One-time fee and turnaround apply. | How to Add a Custom Signature to Your Handwrytten Cards — https://www.handwrytten.com/resources/handwrytten-custom-signatures/ | HW-AUD-017 |
| HW-MFG-007 | Robotic Handwriting | Handwrytten’s robot page states robots can operate autonomously and send automated Slack/Teams notifications for paper jams, job completion, and low-ink alerts. | VERIFIED WITH QUALIFICATION | High | Monitoring capability, not uptime proof. | Handwriting Robots - Handwrytten — https://www.handwrytten.com/about/robots/ | HW-AUD-015 |
| HW-MFG-008 | Manufacturing Workflow | Handwrytten’s robot page states barcode scanning can help ensure the correct cardstock and that client metadata can be integrated for tracking or cardstock assurance in custom install applications. | VERIFIED WITH QUALIFICATION | Medium | Application-specific wording required. | Handwriting Robots - Handwrytten — https://www.handwrytten.com/about/robots/ | HW-AUD-016 |
| HW-MFG-009 | Production Infrastructure | Current official Handwrytten pages list 9280 S. Kyrene Rd., Suite 134, Tempe, AZ 85284 as the contact/operating address. | VERIFIED | High | Corroborated on pricing and features pages. | The Handwrytten Guarantee - Handwrytten — https://www.handwrytten.com/handwrytten-guarantee/ | HW-AUD-022 |
| HW-MFG-011 | Postage and Delivery | Handwrytten’s guarantee states standard first-class mail does not include tracking; delivery confirmation is optional at checkout, and the API exposes a `delivery_confirmation` field. | VERIFIED WITH QUALIFICATION | High | Service-design fact; API field proves capability only. | The Handwrytten Guarantee - Handwrytten — https://www.handwrytten.com/handwrytten-guarantee/ | HW-AUD-042 |
| HW-MFG-012 | Product Capability | Handwrytten’s features page and API support gift cards and inserts as optional order add-ons. | VERIFIED WITH QUALIFICATION | High | Product capability, not pick/pack detail. | Features \| Custom Handwriting Styles & Inserts — https://www.handwrytten.com/features/ | HW-AUD-036 |
| HW-MFG-013 | Platform Capability | Handwrytten API v3.15.0 documents cards, custom cards, address book, fonts, gift cards, inserts, signatures, QR codes, shipping, and order endpoints, including a single-step order endpoint with the cited order fields. | VERIFIED WITH QUALIFICATION | High | Platform capability, not utilization proof. | Introduction \| Handwrytten — https://www.handwrytten.com/api/ | HW-AUD-035 |
| HW-MFG-014 | Bulk Sending | Handwrytten support documentation confirms bulk sending by address-book selection or Microsoft Excel upload, including merge fields and custom data fields. | VERIFIED WITH QUALIFICATION | High | Documented customer workflow only. | Sending Handwritten Cards in Bulk — https://www.handwrytten.com/resources/sending-handwritten-cards-in-bulk/ | HW-AUD-031 |
| HW-MFG-015 | Customer Workflow | Handwrytten’s scheduling guide states that requested send date defaults to two business days from today and that send date is when the card enters the processing queue, not necessarily the mailing date. | VERIFIED | High | Queue-semantics fact. | How to schedule a handwritten card — https://www.handwrytten.com/resources/how-to-schedule-a-handwritten-card/ | HW-AUD-033 |
| HW-MFG-016 | Customer Workflow | Handwrytten’s order-cancellation guide states orders can be canceled only before the writing process begins and cannot be edited once placed. | VERIFIED | High | Operational boundary. | How to Cancel a Handwrytten Order — https://www.handwrytten.com/resources/how-to-cancel-a-handwrytten-order/ | HW-AUD-034 |
| HW-MFG-017 | International Fulfillment | Handwrytten’s company FAQ states international shipments are available to Canada and over 180 countries. | VERIFIED WITH QUALIFICATION | Medium | FAQ-confirmed reach only; API country-list endpoint not captured in public docs. | About Handwrytten — Company FAQ — https://www.handwrytten.com/about/the-company/#company-faq | HW-AUD-036 |
| HW-MFG-018 | Vendor Disclosure | Handwrytten’s guarantee offers a 100% money-back guarantee for 90 days, promises pen-written notes, timely mailing for standard orders, and correct card-to-envelope and insert matching, while excluding sender text errors, incorrect addresses, and postal issues after USPS handoff. | VERIFIED WITH QUALIFICATION | High | Service and liability boundaries. | The Handwrytten Guarantee - Handwrytten — https://www.handwrytten.com/handwrytten-guarantee/ | HW-AUD-021 |
| HW-MFG-019 | Postage and Delivery | Handwrytten’s guarantee states Handwrytten cannot be held liable for lost, stolen, or delayed mail once handed off to USPS. | VERIFIED | High | Liability boundary after USPS handoff. | The Handwrytten Guarantee - Handwrytten — https://www.handwrytten.com/handwrytten-guarantee/ | HW-AUD-043 |
| HW-MFG-020 | Production Infrastructure | Handwrytten’s robot page states Handwrytten robots are integrated in 3PL facilities globally. | VERIFIED WITH QUALIFICATION | Medium | Deployment capability only. | Handwriting Robots - Handwrytten — https://www.handwrytten.com/about/robots/ | HW-AUD-025 |

**Boundary note:** This section records verified Handwrytten facts only. It does not establish what F.I. Forgot must adopt, promise, reject, or implement.

### 7.2 Fact usage rules

- Verified facts provide evidence inputs only.
- Verified facts do not create F.I. Forgot standards automatically.
- Qualifications remain binding in downstream interpretation.
- Developer documentation proves supported capability, not universal operational use.
- Support documentation proves documented workflow, not undisclosed manufacturing detail.
- Vendor disclosure does not establish measured performance unless explicitly supported.
- Held facts may not support permanent standards.
- Only facts marked VERIFIED or VERIFIED WITH QUALIFICATION in the frozen baseline may appear in the governing fact register.
- This section cites facts; it does not duplicate the Research Library.

### 7.3 Held and excluded facts

| Fact ID | Status | Reason | Related Vendor Question | Standardization Effect |
|---------|--------|--------|-------------------------|------------------------|
| HW-MFG-010 | HOLD | Current official production timing statements are not harmonized. | HW-VQ-012 | No production timing, mailing timeline, fulfillment SLA, or customer delivery promise may be derived from HW-MFG-010 until direct vendor confirmation resolves the conflict. |

### 7.4 Fact domain summary

| Domain | Verified Fact Count |
|--------|--------------------:|
| Production Infrastructure | 3 |
| Robotic Handwriting | 4 |
| Fulfillment | 1 |
| Signature Handling | 1 |
| Manufacturing Workflow | 1 |
| Postage and Delivery | 2 |
| Product Capability | 1 |
| Platform Capability | 1 |
| Bulk Sending | 1 |
| Customer Workflow | 2 |
| International Fulfillment | 1 |
| Vendor Disclosure | 1 |
| **Total** | **19** |

### 7.5 Fact-to-standards mapping placeholder

| Fact ID | Potential Standard Area | Standard ID | Mapping Status | Notes |
|---------|-------------------------|-------------|----------------|-------|
| HW-MFG-001 | | | Not Yet Assessed | |
| HW-MFG-002 | | | Not Yet Assessed | |
| HW-MFG-003 | | | Not Yet Assessed | |
| HW-MFG-004 | | | Not Yet Assessed | |
| HW-MFG-005 | | | Not Yet Assessed | |
| HW-MFG-006 | | | Not Yet Assessed | |
| HW-MFG-007 | | | Not Yet Assessed | |
| HW-MFG-008 | | | Not Yet Assessed | |
| HW-MFG-009 | | | Not Yet Assessed | |
| HW-MFG-011 | | | Not Yet Assessed | |
| HW-MFG-012 | | | Not Yet Assessed | |
| HW-MFG-013 | | | Not Yet Assessed | |
| HW-MFG-014 | | | Not Yet Assessed | |
| HW-MFG-015 | | | Not Yet Assessed | |
| HW-MFG-016 | | | Not Yet Assessed | |
| HW-MFG-017 | | | Not Yet Assessed | |
| HW-MFG-018 | | | Not Yet Assessed | |
| HW-MFG-019 | | | Not Yet Assessed | |
| HW-MFG-020 | | | Not Yet Assessed | |

---

## 8. F.I. Forgot Manufacturing Standards

This section will contain **company decisions** about how F.I. Forgot chooses to manufacture, design for production, and govern the physical product experience.

**Status:** Placeholder — no standards authored.

Standards in this section must be deliberate F.I. Forgot decisions. They may be informed by verified facts but must not be confused with vendor disclosures.

### 8.1 Standard record template

Each future standard must use this structure:

| Field | Description |
|-------|-------------|
| **Standard ID** | Stable identifier (e.g., `FI-MFG-STD-001`) |
| **Standard statement** | The rule F.I. Forgot adopts |
| **Purpose** | Why the standard exists |
| **Supporting Fact IDs** | Verified facts that inform the standard |
| **Company judgment** | Where F.I. Forgot chose beyond or apart from vendor facts |
| **Scope** | What the standard applies to |
| **Exceptions** | Known exceptions or conditional cases |
| **Engineering implications** | What implementation must enforce or validate |
| **Validation method** | How compliance is checked |
| **Related vendor questions** | Open HW-VQ references, if any |
| **Future revision notes** | Known dependencies or planned updates |

### 8.2 Standards register (placeholder)

| Standard ID | Standard Statement | Supporting Fact IDs | Status |
|-------------|-------------------|---------------------|--------|
| `[TO BE AUTHORED]` | `[TO BE AUTHORED]` | `[TO BE POPULATED]` | `[NOT STARTED]` |

---

## 9. Manufacturing Constraints

This section will document constraints that shape design and production. Constraints describe limits; they are not necessarily standards.

**Status:** Placeholder — constraints not yet classified or authored.

### 9.1 Vendor constraints

Constraints derived from verified vendor facts.

| Constraint ID | Constraint Summary | Supporting Fact IDs | Qualification | Status |
|---------------|-------------------|---------------------|---------------|--------|
| `[TO BE POPULATED]` | `[TO BE POPULATED]` | `[TO BE POPULATED]` | `[TO BE POPULATED]` | `[NOT STARTED]` |

### 9.2 Company constraints

Constraints adopted by F.I. Forgot independent of vendor disclosure.

| Constraint ID | Constraint Summary | Company Judgment | Status |
|---------------|-------------------|------------------|--------|
| `[TO BE AUTHORED]` | `[TO BE AUTHORED]` | `[TO BE AUTHORED]` | `[NOT STARTED]` |

### 9.3 Engineering constraints

Constraints that will be enforced through systems, templates, or validation.

| Constraint ID | Constraint Summary | Related Standard ID | Status |
|---------------|-------------------|---------------------|--------|
| `[TO BE AUTHORED]` | `[TO BE AUTHORED]` | `[TO BE POPULATED]` | `[NOT STARTED]` |

### 9.4 Unknown constraints

Subjects not yet verified or confirmed.

| Subject | Label | Resolution Path |
|---------|-------|-----------------|
| `[TO BE IDENTIFIED]` | Unresolved / Pending Vendor Confirmation / Deferred to Later Research Volume | `[TO BE DOCUMENTED]` |

---

## 10. Vendor Questions

Unresolved vendor questions must remain explicit. They must not be treated as resolved by implication.

**Status:** Placeholder — vendor question register not yet populated.

Vendor questions must reference **HW-VQ** identifiers where assigned in the evidence audit.

| Vendor Question ID | Question Summary | Related Fact IDs | Status | Resolution Required |
|--------------------|------------------|------------------|--------|---------------------|
| HW-VQ-012 | Direct Handwrytten confirmation of the controlling production and mailing timeline. | HW-MFG-010 | HOLD | Direct vendor confirmation |

---

## 11. Engineering Implications

Engineering implications are derived from **F.I. Forgot standards**, not directly from vendor facts.

**Status:** Placeholder — engineering implications not yet defined.

| Implication ID | Derived From Standard | Engineering Requirement Summary | Validation Method | Status |
|----------------|----------------------|---------------------------------|-------------------|--------|
| `[TO BE AUTHORED]` | `[TO BE POPULATED]` | `[TO BE AUTHORED]` | `[TO BE AUTHORED]` | `[NOT STARTED]` |

Vendor facts may inform standards. Engineering specifications implement standards. This section bridges the two once standards exist.

---

## 12. Validation Requirements

This section will define how compliance with manufacturing standards is verified.

**Status:** Placeholder — validation framework not yet defined.

Future validation may include:

- Design-time checks (templates, safe zones, artwork rules)
- Pre-production checks (order payload, format compatibility)
- Production acceptance criteria
- Exception handling and escalation paths

| Validation ID | Applies To | Method | Pass Criteria | Status |
|---------------|------------|--------|---------------|--------|
| `[TO BE AUTHORED]` | `[TO BE POPULATED]` | `[TO BE AUTHORED]` | `[TO BE AUTHORED]` | `[NOT STARTED]` |

---

## 13. Evidence Boundaries

This document cannot claim knowledge beyond the frozen Verified Facts baseline for Volume 01.

The following subjects remain outside the current verified baseline and must not be stated here as established fact:

- Harmonized production timing
- Exact print process
- Pen and ink specifications
- QA thresholds and defect rates
- Actual production throughput
- Arizona versus distributed fulfillment structure
- Continuity and disaster recovery
- Returned mail handling
- Current handwriting style count
- Internal staffing model
- Postcard availability
- Recipient realism claims
- Comparative superiority claims

When a subject is unknown, label it using one of these terms:

- **Unresolved**
- **Pending Vendor Confirmation**
- **Deferred to Later Research Volume**
- **Company Decision Independent of Vendor Fact**

Absence of evidence must not be converted into a vendor limitation.

---

## 14. Future Research Dependencies

Subjects that will require additional research volumes or vendor diligence before standards can be finalized.

**Status:** Placeholder — dependency register not yet populated.

| Subject | Why It Matters | Likely Research Volume | Status |
|---------|----------------|------------------------|--------|
| `[TO BE IDENTIFIED]` | `[TO BE DOCUMENTED]` | `[TO BE ASSIGNED]` | `[NOT STARTED]` |

---

## 15. Revision Process

This document evolves through controlled revision. Material changes follow this sequence:

1. **Evidence Audit revision** — new or changed claims are evaluated in `02-evidence-audit.md`
2. **Verified Facts update** — promoted facts are added or revised in `03-verified-facts.md` with change log entry
3. **Design revision** — this document is updated to reflect new facts, standards, or boundaries
4. **Change log** — all material Design Library changes are recorded

Revision rules:

- Held Fact IDs may not be treated as resolved without documented vendor confirmation
- Fact qualifications may not be removed silently
- Standards may not be broadened without re-audit and documented revision
- Engineering implications must be reviewed when governing facts or standards change

### Version guidance

| Version | Use |
|---------|-----|
| **1.0** | First frozen manufacturing standard |
| **1.1** | Minor clarifications without material policy change |
| **2.0** | Material standard changes or restructuring |

Current version **2.0 Architecture Draft** denotes structural redesign only, not a frozen standard.

---

## 16. Future Freeze Gate

This document may be promoted to **Frozen Manufacturing Standard** only after all of the following are confirmed:

- [ ] Upstream verified facts baseline is frozen and current
- [ ] Verified manufacturing facts register is populated with Fact IDs and qualifications
- [ ] Vendor facts and F.I. Forgot standards are separated throughout
- [ ] Material standards reference supporting Fact IDs
- [ ] Evidence boundaries are documented and current
- [ ] Open vendor questions are listed with HW-VQ references
- [ ] Engineering implications are identified for material standards
- [ ] Validation methods are defined where applicable
- [ ] No HOLD or REJECT claim is presented as verified
- [ ] Change control and revision process are in place
- [ ] Document is internally consistent and publication quality
- [ ] Downstream impact on engineering specifications has been considered

Until the freeze gate is satisfied, this document remains an architecture or development draft.

---

## 17. Appendices

**Status:** Placeholder — appendices not yet defined.

Future appendices may include:

- Standard ID index
- Fact ID cross-reference index
- Vendor question log
- Glossary of manufacturing terms
- Revision history

| Appendix | Title | Status |
|----------|-------|--------|
| A | `[TO BE DEFINED]` | `[NOT STARTED]` |
| B | `[TO BE DEFINED]` | `[NOT STARTED]` |

---

**End of Document**
