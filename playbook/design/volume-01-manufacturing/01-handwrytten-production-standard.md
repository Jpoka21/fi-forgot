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
| **Fact-to-decision assessment status** | Complete |
| **Standard planning status** | Complete |
| **Manufacturing standard template** | Frozen Governance Standard, Version 1.0 |
| **Manufacturing standard template freeze date** | July 21, 2026 |

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

### 7.5 Fact-to-decision assessment register

**Status:** Fact-to-decision assessment complete.

This register classifies what each verified fact may mean for F.I. Forgot before any permanent manufacturing standard is drafted. Classifications do not approve standards, assign Standard IDs, or create engineering requirements.

| Fact ID | Fact Domain | Decision Classification | Potential Decision Area | Company Judgment Required | Related Vendor Question | Deferred Research Dependency | Rationale | Standard Drafting Status | Notes |
|---------|-------------|----------------------|-------------------------|---------------------------|-------------------------|------------------------------|-----------|--------------------------|-------|
| HW-MFG-001 | Production Infrastructure | Context Only; No Company Action | Vendor scale disclosure | No | — | — | Official fleet-size language is useful background only. Qualification limits the fact to fleet-size disclosure; it does not establish capacity, reliability, utilization, or service levels. | Not Yet Drafted | Do not derive capacity or throughput assumptions from fleet count. |
| HW-MFG-002 | Robotic Handwriting | Context Only; Supports Manufacturing Constraint; Supports Vendor Question; Supports Deferred Research | Per-machine capacity boundary; vendor throughput diligence | Yes | HW-VQ-003 | Vendor Operations Diligence | Per-machine capacity is a theoretical upper bound, not fleet-average or customer-accessible throughput. May inform conservative planning boundaries only after company judgment. | Not Yet Drafted | Do not create service-level or production-capacity promises from this fact. |
| HW-MFG-003 | Robotic Handwriting | Context Only; No Company Action | Intellectual property disclosure | No | — | — | Patent existence is verified vendor disclosure with scope not reproduced. No concrete legal, design, or engineering consequence for F.I. Forgot is established by this fact alone. | Not Yet Drafted | Retain as context if later legal or partner diligence requires it. |
| HW-MFG-004 | Robotic Handwriting | Supports Company Standard; Supports Manufacturing Constraint | Physical ink authenticity; production-method validation | Yes | — | — | Real-pen writing is core to the vendor production method and may later support a deliberate F.I. Forgot authenticity requirement, but only as a company choice beyond vendor disclosure. | Not Yet Drafted | Qualification preserves production-method disclosure only; do not draft the standard in this pass. |
| HW-MFG-005 | Fulfillment | Supports Manufacturing Constraint; Supports Vendor Question | Envelope fulfillment handling | Yes | HW-VQ-014 | Manufacturing Workflow Detail | Envelope handling is confirmed, but the specific addressing method is not disclosed. Design and engineering must not assume handwritten addressing or a particular envelope-production path. | Not Yet Drafted | Use envelope-handling language only; do not treat “crafted envelopes” as proof of handwritten addressing. |
| HW-MFG-006 | Signature Handling | Supports Company Standard; Supports Manufacturing Constraint; Supports Vendor Question | Custom signature governance | Yes | HW-VQ-011 | Handwriting Personalization | Custom signatures involve design-team recreation, fee, turnaround, and robotic execution. This may support later signature policy and workflow boundaries, but company rules remain undecided. | Not Yet Drafted | Qualification requires fee and turnaround to remain visible in any future standard. |
| HW-MFG-007 | Robotic Handwriting | Context Only; No Company Action | Robot monitoring disclosure | No | — | — | Autonomous operation and Slack/Teams alerts describe vendor monitoring capability, not uptime, staffing, or F.I. Forgot service reliability. | Not Yet Drafted | Qualification excludes uptime proof; no company action is justified from this fact alone. |
| HW-MFG-008 | Manufacturing Workflow | Context Only; Supports Manufacturing Constraint | Application-specific production controls | Yes | — | — | Barcode and metadata integration are application-specific and may apply only to certain install paths. F.I. Forgot must not assume its orders use these controls without separate confirmation. | Not Yet Drafted | Qualification requires application-specific wording in any downstream use. |
| HW-MFG-009 | Production Infrastructure | Context Only; Supports Vendor Question; Supports Deferred Research | Facility location disclosure; continuity planning | Yes | HW-VQ-001; HW-VQ-008 | Vendor Risk and Continuity; Vendor Operations Diligence | Tempe address is verified contact/operating-address disclosure only. It does not prove that all customer orders are fulfilled from Arizona or support continuity assumptions. | Not Yet Drafted | Corroboration on pricing and features pages does not change fulfillment-network uncertainty. |
| HW-MFG-011 | Postage and Delivery | Supports Company Standard; Supports Manufacturing Constraint | Delivery confirmation policy; postage-service boundaries | Yes | — | — | Standard first-class mail excludes tracking; delivery confirmation is optional. This may support later F.I. Forgot product and operational decisions, but API field presence proves capability only. | Not Yet Drafted | Qualification preserves service-design and capability-only distinctions. |
| HW-MFG-012 | Product Capability | Supports Company Standard; Supports Manufacturing Constraint; Supports Vendor Question | Add-on matching; optional inserts and gift cards | Yes | HW-VQ-007 | Fulfillment Standards | Gift cards and inserts are supported as optional add-ons, but pick/pack and matching operations are not publicly disclosed. Future standards may govern whether and how F.I. Forgot uses add-ons. | Not Yet Drafted | Product capability does not establish operational matching controls. |
| HW-MFG-013 | Platform Capability | Context Only; Supports Manufacturing Constraint; Supports Deferred Research | API capability boundaries | Yes | — | API and integration engineering (later volume) | API v3.15.0 documents broad platform capability, not universal operational use or production-path utilization. Useful for boundary-setting, not for creating integration requirements in this manufacturing volume. | Not Yet Drafted | Qualification excludes utilization proof; defer detailed integration standards to later work. |
| HW-MFG-014 | Bulk Sending | Supports Company Standard; Supports Manufacturing Constraint | Bulk workflow compatibility | Yes | — | — | Bulk sending by address book or Excel with merge fields is a documented customer workflow that may affect how F.I. Forgot designs high-volume sending, but it does not disclose hidden manufacturing steps. | Not Yet Drafted | Support-documentation fact only; company adoption of bulk workflows remains a separate decision. |
| HW-MFG-015 | Customer Workflow | Supports Manufacturing Constraint; Supports Vendor Question | Queue semantics; customer timing communication | Yes | HW-VQ-012 | Operational Characteristics | Send date defaults and queue-entry semantics are verified, but they do not resolve production or mailing timing. HW-MFG-010 remains on HOLD and no timing promise may be derived here. | Not Yet Drafted | Queue-semantics fact only; do not create delivery or fulfillment SLA language. |
| HW-MFG-016 | Customer Workflow | Supports Company Standard; Supports Manufacturing Constraint | Order modification and cancellation boundaries | Yes | — | — | Orders can be canceled only before writing begins and cannot be edited once placed. This may support later customer-promise, support, and resend discipline, but F.I. Forgot policy is not yet defined. | Not Yet Drafted | Operational boundary fact; company escalation and edit policy remain undecided. |
| HW-MFG-017 | International Fulfillment | Supports Company Standard; Supports Manufacturing Constraint; Supports Deferred Research | International availability | Yes | — | International fulfillment architecture | FAQ-confirmed reach to Canada and 180+ countries does not establish country-level performance, transit reliability, or customs behavior. | Not Yet Drafted | Qualification limits use to FAQ-confirmed reach only. |
| HW-MFG-018 | Vendor Disclosure | Supports Company Standard; Supports Manufacturing Constraint; Supports Vendor Question | Customer promise discipline; vendor liability boundaries | Yes | HW-VQ-009 | Fulfillment and Support Operations | Guarantee promises and exclusions define vendor service boundaries that may inform later F.I. Forgot customer experience, resend, and escalation design, but must not be adopted as F.I. Forgot promises without separate company judgment. | Not Yet Drafted | Qualification preserves service and liability boundaries; timing language inside the guarantee does not override HW-MFG-010 HOLD. |
| HW-MFG-019 | Postage and Delivery | Supports Company Standard; Supports Manufacturing Constraint; Supports Vendor Question | Vendor liability and resend handling | Yes | HW-VQ-009 | Fulfillment and Support Operations | USPS handoff liability exclusion is a verified vendor boundary that may inform later F.I. Forgot support and resend policy, but does not by itself define F.I. Forgot obligations. | Not Yet Drafted | Liability-boundary fact only. |
| HW-MFG-020 | Production Infrastructure | Context Only; Supports Vendor Question; Supports Deferred Research | Deployment capability disclosure; fulfillment-network uncertainty | Yes | HW-VQ-001 | Vendor Operations Diligence | Global 3PL robot integration is a deployment-capability statement only. It does not establish that Handwrytten customer fulfillment is distributed across 3PL sites. | Not Yet Drafted | Qualification excludes customer-order fulfillment proof. |

**Boundary note:** This section records verified Handwrytten facts only. It does not establish what F.I. Forgot must adopt, promise, reject, or implement.

### 7.6 Decision area summary

Counts below are calculated from Decision Classification values in Section 7.5. Because one fact may have multiple classifications, totals may exceed 19.

| Decision Classification | Fact Association Count |
|-------------------------|-------------------------:|
| Supports Company Standard | 9 |
| Supports Manufacturing Constraint | 14 |
| Supports Vendor Question | 9 |
| Supports Deferred Research | 5 |
| Context Only | 8 |
| No Company Action | 3 |

### 7.7 Nonbinding candidate standard areas

The following areas are **nonbinding** potential future standard topics derived from the fact-to-decision assessment. They do not assign Standard IDs and do not constitute approved standards.

- Physical Ink Authenticity
- Envelope Fulfillment Handling
- Custom Signature Governance
- Delivery Confirmation Policy
- Add-On Matching
- API Capability Boundaries
- Bulk Workflow Compatibility
- Queue Semantics and Customer Timing Communication
- Order Modification and Cancellation Boundaries
- International Availability
- Customer Promise Discipline
- Vendor Liability and Resend Handling
- Vendor Capability Validation
- Operational Continuity

### 7.8 Standard Planning Register

**Status:** Standard planning complete.

This register reviews each nonbinding candidate area from Section 7.7 and determines its future disposition in the F.I. Forgot manufacturing standard architecture. This is a planning and ID reservation pass only. No final standard statements are authored here.

#### 7.8.1 Planning register

| Candidate Area | Final Disposition | Proposed Standard Name | Reserved Standard ID | Supporting Fact IDs | Related Vendor Questions | Company Judgment Required | Blocking Dependency | Drafting Readiness | Rationale | Notes |
|----------------|-------------------|------------------------|----------------------|---------------------|--------------------------|---------------------------|---------------------|--------------------|-----------|-------|
| Physical Ink Authenticity | Manufacturing Principle | Real Pen Production Method Principle | FI-MFG-PRN-001 | HW-MFG-004 | — | Yes | — | READY WITH QUALIFICATION | HW-MFG-004 confirms real-pen production method. F.I. Forgot may adopt a governing principle that production uses physical ink via real pens, but must not claim automatic realism, quality superiority, or recipient perception outcomes. | Principle guides standards; it is not an enforceable production specification. |
| Envelope Fulfillment Handling | Manufacturing Constraint | Envelope Fulfillment Handling Boundary | FI-MFG-CON-001 | HW-MFG-005 | HW-VQ-014 | Yes | HW-VQ-014 (envelope addressing method undisclosed) | READY WITH QUALIFICATION | HW-MFG-005 confirms envelope handling as part of fulfillment, not handwritten addressing. Constraint must preserve envelope-handling language only and prohibit assumptions about addressing method or envelope-production path. | Drafted in Section 8.5; pending freeze review. |
| Custom Signature Governance | Operational Policy | Custom Signature Governance Policy | FI-MFG-POL-001 | HW-MFG-006 | HW-VQ-011 | Yes | HW-VQ-011 (personalization and signature workflow detail) | READY WITH QUALIFICATION | HW-MFG-006 confirms capability, fee, turnaround, and robotic execution. Policy must govern authorization, authenticity, ownership, and approval — all company decisions beyond vendor disclosure. | Qualification requires fee and turnaround visibility in any future policy. |
| Delivery Confirmation Policy | Operational Policy | Customer Promise Discipline Policy (consolidated) | — | HW-MFG-011 | — | Yes | — | NOT APPLICABLE | Optional delivery confirmation is one element of customer promise boundaries, not a standalone Volume 01 policy. Consolidated into FI-MFG-POL-003. API field presence proves capability only; universal support must not be assumed. | Absorbed candidate; no separate Standard ID reserved. |
| Add-On Matching | Manufacturing Constraint | Add-On Fulfillment Boundary | FI-MFG-CON-002 | HW-MFG-012; HW-MFG-018 | HW-VQ-007 | Yes | HW-VQ-007 (pick/pack and matching operations undisclosed) | READY WITH QUALIFICATION | HW-MFG-012 and HW-MFG-018 support optional inserts, gift cards, and vendor guarantee matching language. Internal matching controls remain unknown. Constraint governs what F.I. Forgot may claim or assume about add-on fulfillment. | Related to envelope fulfillment but distinct; matching operations are a separate unknown. |
| API Capability Boundaries | Excluded From Volume 01 | Vendor Capability Validation Constraint (consolidated) | — | HW-MFG-013 | — | Yes | Detailed API engineering deferred to later research volume | NOT APPLICABLE | HW-MFG-013 supports documented capability only. Detailed API integration standards belong in a later research volume, not Volume 01. Boundary-setting inputs are absorbed into FI-MFG-CON-003. | Excluded as standalone standard area; inputs retained in vendor capability constraint. |
| Bulk Workflow Compatibility | Manufacturing Constraint | Bulk Workflow Compatibility Boundary | FI-MFG-CON-004 | HW-MFG-014 | — | Yes | — | READY WITH QUALIFICATION | HW-MFG-014 supports documented bulk workflows by address book or Excel with merge fields. Constraint must not become a Volume 01 integration specification or imply hidden manufacturing steps. | Company adoption of bulk workflows remains a separate decision. |
| Queue Semantics and Customer Timing Communication | Operational Policy | Customer Promise Discipline Policy (consolidated) | — | HW-MFG-015 | HW-VQ-012 | Yes | HW-MFG-010 HOLD; HW-VQ-012 | NOT APPLICABLE | HW-MFG-015 confirms queue-entry semantics only. HW-MFG-010 remains on HOLD. No production timeline or delivery promise may be created from queue semantics. Consolidated into FI-MFG-POL-003 with timing elements blocked. | Absorbed candidate; timing portions remain blocked pending vendor confirmation. |
| Order Modification and Cancellation Boundaries | Operational Policy | Order Modification and Cancellation Policy | FI-MFG-POL-002 | HW-MFG-016 | — | Yes | — | READY FOR DRAFTING | HW-MFG-016 establishes a verified operational boundary: cancellation before writing only; no post-placement edits. Sufficient to support an internal customer experience and operational boundary policy. | Drafted in Section 8.4; pending freeze review. |
| International Availability | Operational Policy | Customer Promise Discipline Policy (consolidated) | — | HW-MFG-017 | — | Yes | International fulfillment architecture (deferred research) | NOT APPLICABLE | HW-MFG-017 confirms broad FAQ reach only. Country-level service quality, transit reliability, and customs behavior are not established. Consolidated into FI-MFG-POL-003 as reach-limit discipline, not performance promise. | Absorbed candidate; no separate Standard ID reserved. |
| Customer Promise Discipline | Operational Policy | Customer Promise Discipline Policy | FI-MFG-POL-003 | HW-MFG-011; HW-MFG-015; HW-MFG-017; HW-MFG-018 | HW-VQ-012 | Yes | HW-MFG-010 HOLD (timing and queue promise elements); HW-VQ-012 | READY WITH QUALIFICATION | Overarching policy consolidating delivery confirmation boundaries, queue semantics communication limits, international reach limits, and vendor guarantee-informed promise discipline. Non-timing elements may be drafted; timing and delivery promise language remain blocked while HW-MFG-010 is on HOLD. | Absorbs Delivery Confirmation Policy, Queue Semantics and Customer Timing Communication, and International Availability. Vendor guarantee timing language does not override HW-MFG-010 HOLD. |
| Vendor Liability and Resend Handling | Operational Policy | Vendor Liability and Resend Handling Policy | FI-MFG-POL-004 | HW-MFG-018; HW-MFG-019 | HW-VQ-009 | Yes | — | READY WITH QUALIFICATION | HW-MFG-018 and HW-MFG-019 establish vendor guarantee and USPS handoff liability boundaries. F.I. Forgot resend, recovery, and escalation policy remains a company decision and must not adopt vendor guarantees as F.I. Forgot promises. | Related to Customer Promise Discipline but retained as separate policy for liability and resend obligations. |
| Vendor Capability Validation | Manufacturing Constraint | Vendor Capability Validation Constraint | FI-MFG-CON-003 | HW-MFG-002; HW-MFG-008; HW-MFG-013; HW-MFG-020 | HW-VQ-003 | Yes | API and integration engineering (later research volume) | READY WITH QUALIFICATION | Overarching constraint requiring F.I. Forgot to validate vendor capability before assuming operational use. Absorbs API capability boundary inputs from HW-MFG-013. Application-specific controls (HW-MFG-008) and deployment capability (HW-MFG-020) must not be assumed universal. | Absorbs API Capability Boundaries as boundary input; detailed API standards excluded from Volume 01. |
| Operational Continuity | Vendor Diligence Only | — | — | HW-MFG-009; HW-MFG-020 | HW-VQ-001; HW-VQ-003; HW-VQ-008 | Yes | HW-VQ-001; HW-VQ-003; HW-VQ-008; insufficient continuity evidence | BLOCKED | Current evidence is insufficient for continuity or fulfillment-network standards. Tempe address and 3PL deployment capability do not prove customer-order fulfillment topology or disaster recovery. Remains vendor diligence until HW-VQ responses resolve. | No Standard ID reserved; related inputs partially inform FI-MFG-CON-003 diligence posture. |

#### 7.8.2 Standard ID governance

- Reserved Standard IDs are **permanent** once assigned in this register.
- Reserved Standard IDs may remain **blocked** indefinitely if evidence or vendor confirmation does not support drafting.
- Standard IDs must **not be reassigned** to a different subject, standard name, or disposition.
- A reserved Standard ID does **not** mean the standard is approved, frozen, or binding.
- Final standard wording must pass a **separate drafting and freeze review** before promotion.
- Standards may reference **multiple verified Fact IDs**; fact-to-candidate mapping in this register is planning guidance only.
- **Company judgment** must be disclosed wherever evidence alone does not determine the F.I. Forgot decision.

#### 7.8.3 Consolidation decisions

| Original Candidate | Final Destination | Reason | Supporting Facts | Effect on Future Drafting |
|--------------------|-------------------|--------|------------------|---------------------------|
| Delivery Confirmation Policy | FI-MFG-POL-003 — Customer Promise Discipline Policy | Optional delivery confirmation is a customer-promise boundary element, not a standalone policy. HW-MFG-011 confirms optionality and capability only. | HW-MFG-011 | Draft delivery-confirmation rules only within the overarching customer promise policy. No separate FI-MFG-POL for delivery confirmation. |
| Queue Semantics and Customer Timing Communication | FI-MFG-POL-003 — Customer Promise Discipline Policy | Queue-entry semantics inform customer communication limits but cannot support timing or delivery promises while HW-MFG-010 remains on HOLD. | HW-MFG-015 | Queue-semantics language may be drafted as communication discipline only. Timing promise sections remain blocked pending HW-VQ-012 resolution. |
| International Availability | FI-MFG-POL-003 — Customer Promise Discipline Policy | FAQ-confirmed reach supports reach-limit discipline only, not country-level service or performance promises. | HW-MFG-017 | International messaging must use reach-limit language. Country-level promises deferred to later research. |
| API Capability Boundaries | FI-MFG-CON-003 — Vendor Capability Validation Constraint (Excluded From Volume 01 as standalone area) | API documentation proves capability, not utilization. Detailed API engineering belongs in a later research volume. | HW-MFG-013 | Volume 01 retains capability-validation constraint only. Integration specifications deferred. |
| Vendor Liability and Resend Handling (partial overlap) | FI-MFG-POL-003 and FI-MFG-POL-004 — retained as related but separate policies | Guarantee and liability facts inform customer promise boundaries (POL-003) and resend obligations (POL-004) but serve different policy purposes. Not fully merged. | HW-MFG-018; HW-MFG-019 | POL-003 governs what F.I. Forgot may promise customers. POL-004 governs resend, recovery, and escalation against vendor liability boundaries. |

**Non-consolidation decisions:**

| Candidate Pair Evaluated | Decision | Reason |
|--------------------------|----------|--------|
| Envelope Fulfillment Handling and Add-On Matching | Retained as separate constraints | Envelope handling concerns addressing-method uncertainty (HW-MFG-005, HW-VQ-014). Add-on matching concerns pick/pack and insert operations (HW-MFG-012, HW-VQ-007). Related fulfillment domain but distinct unknowns. |
| Operational Continuity and Vendor Capability Validation | Retained as separate dispositions | Vendor Capability Validation (FI-MFG-CON-003) governs assumed operational use of documented capabilities. Operational Continuity remains vendor diligence only because fulfillment-network and disaster-recovery evidence is insufficient. CON-003 absorbs diligence posture; continuity does not receive a Standard ID. |
| Customer Promise Discipline and Vendor Liability and Resend Handling | Retained as separate policies | Customer promise discipline governs outward-facing commitment boundaries. Vendor liability and resend handling governs internal recovery policy against verified vendor exclusions. Overlap acknowledged; full merge would blur promise vs. obligation boundaries. |

#### 7.8.4 Drafting queue

##### Ready for Drafting

| Reserved ID | Standard Name | Disposition | Supporting Facts | Blocking Issue | Related Vendor Questions | Next Action |
|-------------|---------------|-------------|------------------|----------------|--------------------------|-------------|
| — | — | — | — | — | — | FI-MFG-POL-002 drafted — see Section 8.4. No standards currently queued for initial drafting. |

##### Ready With Qualification

| Reserved ID | Standard Name | Disposition | Supporting Facts | Blocking Issue | Related Vendor Questions | Next Action |
|-------------|---------------|-------------|------------------|----------------|--------------------------|-------------|
| FI-MFG-PRN-001 | Real Pen Production Method Principle | Manufacturing Principle | HW-MFG-004 | Must not claim realism, quality superiority, or recipient perception | — | Draft principle with production-method qualification preserved. |
| FI-MFG-CON-002 | Add-On Fulfillment Boundary | Manufacturing Constraint | HW-MFG-012; HW-MFG-018 | Pick/pack operations undisclosed | HW-VQ-007 | Draft constraint governing add-on claims and matching assumptions. |
| FI-MFG-CON-003 | Vendor Capability Validation Constraint | Manufacturing Constraint | HW-MFG-002; HW-MFG-008; HW-MFG-013; HW-MFG-020 | API integration detail deferred to later volume | HW-VQ-003 | Draft constraint requiring validation before assuming vendor capability in production. |
| FI-MFG-CON-004 | Bulk Workflow Compatibility Boundary | Manufacturing Constraint | HW-MFG-014 | Must not become integration specification | — | Draft boundary for documented bulk workflow compatibility without hidden manufacturing claims. |
| FI-MFG-POL-001 | Custom Signature Governance Policy | Operational Policy | HW-MFG-006 | Authorization and approval rules undecided | HW-VQ-011 | Draft policy with company judgment on signature authorization, authenticity, and ownership. |
| FI-MFG-POL-003 | Customer Promise Discipline Policy | Operational Policy | HW-MFG-011; HW-MFG-015; HW-MFG-017; HW-MFG-018 | Timing and queue promise elements blocked by HW-MFG-010 HOLD | HW-VQ-012 | Draft non-timing promise boundaries first; defer timing language until HW-VQ-012 resolves. |
| FI-MFG-POL-004 | Vendor Liability and Resend Handling Policy | Operational Policy | HW-MFG-018; HW-MFG-019 | F.I. Forgot resend policy undecided | HW-VQ-009 | Draft resend and recovery policy with vendor liability boundaries disclosed; do not adopt vendor guarantees as F.I. Forgot promises. |

##### Blocked

| Reserved ID | Standard Name | Disposition | Supporting Facts | Blocking Issue | Related Vendor Questions | Next Action |
|-------------|---------------|-------------|------------------|----------------|--------------------------|-------------|
| — | Operational Continuity | Vendor Diligence Only | HW-MFG-009; HW-MFG-020 | Insufficient evidence for continuity or fulfillment-network standards | HW-VQ-001; HW-VQ-003; HW-VQ-008 | Complete vendor diligence; do not draft continuity standard until evidence supports it. |
| FI-MFG-POL-003 (timing elements) | Customer Promise Discipline Policy — timing and queue promise sections | Operational Policy | HW-MFG-015 | HW-MFG-010 HOLD; harmonized production timing unresolved | HW-VQ-012 | Await direct vendor confirmation before drafting any production timeline, mailing timeline, or delivery promise language. |

#### 7.8.5 Planning disposition summary

| Final Disposition | Candidate Area Count |
|-------------------|---------------------:|
| Manufacturing Principle | 1 |
| Manufacturing Constraint | 4 |
| Operational Policy | 7 |
| Vendor Diligence Only | 1 |
| Excluded From Volume 01 | 1 |
| Permanent Standard | 0 |
| Deferred Research | 0 |
| Context Only | 0 |
| **Total candidate areas reviewed** | **14** |

Reserved Standard IDs assigned: **9** (1 principle, 4 constraints, 4 operational policies). No permanent standard IDs assigned in this planning pass.

### 7.9 No-action and context register

Facts classified as **Context Only** and/or **No Company Action** should not be promoted into F.I. Forgot manufacturing standards without new evidence or separate company judgment.

| Fact ID | Classification | Why No Standard Should Be Derived |
|---------|----------------|-----------------------------------|
| HW-MFG-001 | Context Only; No Company Action | Fleet-size marketing disclosure does not establish utilization, reliability, capacity, or service performance. |
| HW-MFG-002 | Context Only (also constraint input) | Per-machine capacity is not actual throughput; it supports diligence and conservative boundary thinking only, not a company SLA. |
| HW-MFG-003 | Context Only; No Company Action | Patent citation has no identified design, engineering, or operating consequence for F.I. Forgot in this volume. |
| HW-MFG-007 | Context Only; No Company Action | Monitoring alerts are vendor operations disclosure, not proof of uptime or F.I. Forgot service reliability. |
| HW-MFG-008 | Context Only (also constraint input) | Application-specific production controls may not apply to F.I. Forgot orders and should not be assumed universal. |
| HW-MFG-009 | Context Only (also vendor-question input) | Address disclosure does not prove centralized fulfillment or continuity design. |
| HW-MFG-013 | Context Only (also constraint input) | API documentation proves capability only; it does not justify integration requirements in this manufacturing volume. |
| HW-MFG-020 | Context Only (also vendor-question input) | 3PL deployment capability does not prove distributed customer fulfillment. |

### 7.10 Decision risks

The main risks of translating verified facts into standards prematurely are:

- **Converting marketing scale into capacity assumptions.** Fleet-size and per-machine capacity facts must not be turned into throughput, utilization, or SLA commitments.
- **Converting API capability into universal operational practice.** Documented endpoints and fields do not prove that F.I. Forgot uses or should use every capability in production.
- **Converting vendor guarantees into F.I. Forgot promises.** Guarantee and liability facts describe vendor boundaries, not F.I. Forgot customer commitments.
- **Converting location disclosure into continuity assumptions.** A verified operating address does not prove fulfillment-network design or disaster recovery.
- **Converting international reach into performance claims.** Country-count disclosure does not establish delivery performance, customs reliability, or market readiness.
- **Converting physical process facts into untested quality claims.** Real-pen production method may inform later authenticity policy, but not measured quality superiority.
- **Ignoring qualifications attached to verified facts.** Qualifications such as capability-only, application-specific, queue-semantics, and deployment-capability-only must remain visible in all downstream interpretation.
- **Deriving timing standards while HW-MFG-010 remains on HOLD.** Queue semantics and guarantee timing language must not be harmonized into F.I. Forgot delivery promises without vendor confirmation.

---

## 8. F.I. Forgot Manufacturing Standards

This section contains **company decisions** about how F.I. Forgot chooses to manufacture, design for production, and govern the physical product experience.

**Status:** Manufacturing Standard Template v1.0 frozen (July 21, 2026). Two standards drafted, pending individual freeze (FI-MFG-POL-002, FI-MFG-CON-001); remaining reserved standards not yet authored.

Standards in this section must be deliberate F.I. Forgot decisions. They may be informed by verified facts but must not be confused with vendor disclosures.

### 8.1 Manufacturing standard drafting template

**Template version:** 1.0  
**Template status:** Frozen Governance Standard  
**Freeze date:** July 21, 2026  
**Reference implementations:**

| Standard ID | Disposition | Location |
|-------------|-------------|----------|
| FI-MFG-POL-002 | Operational Policy | Section 8.4 |
| FI-MFG-CON-001 | Manufacturing Constraint | Section 8.5 |

Template v1.0 has been validated against **one Operational Policy** and **one Manufacturing Constraint**. Manufacturing Principles (PRN) and Permanent Standards (STD) have not yet been drafted against this template.

Each drafted manufacturing standard in this volume SHALL follow the section order and rules below unless a documented exception is approved through Design Library change control.

#### 8.1.0 Template freeze gate

Template v1.0 passed freeze review on July 21, 2026.

| Criterion | Result |
|-----------|--------|
| Canonical section order complete | Pass |
| Required and optional section rules clear | Pass |
| Disposition applicability matrix defined | Pass |
| Req ID convention globally unique (`{Full Standard ID}-R{nn}`) | Pass — harmonized in reference implementations |
| Source values controlled | Pass |
| Normative requirements implementation independent | Pass |
| Evidence qualifications distinct from requirements | Pass |
| Company judgment distinct from vendor evidence | Pass |
| Validation references Req IDs, not document locations | Pass |
| Out of scope and unresolved dependency handling defined | Pass |
| Engineering implications deferral rules defined | Pass |
| Validated without structural exceptions (POL-002, CON-001) | Pass |
| No unresolved structural defect requiring another drafting test | Pass |

Template revisions after freeze require documented Design Library change control. A revision that changes section order, Req ID rules, or Source enumeration requires a new template version and freeze review.

#### 8.1.1 Standard record (required)

Metadata table at the top of each standard.

| Field | Required | Notes |
|-------|----------|-------|
| **Standard ID** | Yes | Reserved ID from the Standard Planning Register |
| **Standard name** | Yes | Matches the reserved planning name |
| **Disposition** | Yes | Manufacturing Principle, Permanent Standard, Manufacturing Constraint, or Operational Policy |
| **Status** | Yes | e.g., Drafted, Pending Freeze; Frozen after freeze gate |
| **Supporting Fact IDs** | Yes | All verified facts cited by normative requirements |
| **Related vendor questions** | Yes | List HW-VQ IDs or `None` |
| **Governing qualification** | If applicable | Summarize binding qualifications from cited facts |

Do not restate the full verified-facts register in this table.

#### 8.1.2 Standard statement (required)

One concise normative summary of the rule F.I. Forgot adopts. This statement MUST also appear in the Volume 01 standards register (Section 8.3).

#### 8.1.3 Purpose (required)

Why the standard exists. Non-normative.

#### 8.1.4 Scope (required)

What the standard applies to and, where helpful, what it explicitly does not define (e.g., implementation, product features). In-scope and exclusion bullets are permitted.

#### 8.1.5 Definitions (optional)

Define terms used in normative requirements. Include only when needed for precision. Do not define vendor process sub-stages beyond verified evidence.

#### 8.1.6 Normative requirements (required)

Numbered requirements in a single table. Use one table; do not maintain a separate prohibitions section unless a future freeze review approves an exception.

| Column | Required | Purpose |
|--------|----------|---------|
| **Req ID** | Yes | `{Full Standard ID}-R{nn}` — e.g., `FI-MFG-POL-002-R01`, `FI-MFG-CON-001-R01`. Stable reference for validation and cross-standard citation. Shortened IDs are not permitted. |
| **Requirement** | Yes | Testable, implementation-independent normative statement |
| **Source** | Yes | Traceability to verified evidence or company judgment |

**Allowed Source values:**

| Source value | Use when |
|--------------|----------|
| `HW-MFG-###` | Requirement derives directly from a verified fact |
| `HW-MFG-### qualification` | Requirement preserves a stated qualification on a cited fact |
| `Company judgment` | F.I. Forgot decision not fully determined by verified evidence |
| `HW-VQ-###` (pending) | Requirement is provisional pending vendor confirmation — use only when explicitly allowed by planning status |

Do **not** add per-requirement columns for Evidence Type or Implementation Impact. Evidence type belongs in Supporting evidence (Section 8.1.10). Implementation impact belongs in Volume 01 Engineering Implications (Section 11), derived after standard freeze.

**Requirement Type** is optional in Source notation (e.g., prefix `Prohibition:` in the Requirement text) rather than a separate column, unless freeze review later approves a Type column for high-complexity standards.

#### 8.1.7 Company judgment (required when applicable)

Include this section when the standard involves F.I. Forgot adoption, applicability scope, interpretation boundaries, or other company decisions not established by vendor disclosure alone.

- Company judgment may govern adoption, applicability, interpretation, or an independent F.I. Forgot decision.
- A Company judgment section does not require every normative requirement to use `Company judgment` as its Source.
- Use `Company judgment` in the Source column only when that specific normative requirement is directly supported by company judgment rather than verified evidence.
- Company decisions must never be represented as Handwrytten guarantees.

List company decisions not established by vendor disclosure alone. Do not duplicate requirement text; reference Req IDs where helpful.

If no company judgment applies, state: `None. All normative requirements derive from cited verified facts.`

#### 8.1.8 Exceptions (required)

State defined exceptions or: `No exceptions are defined in this standard.` Document the revision path for future exceptions.

#### 8.1.9 Out of scope (required)

Table of subjects intentionally excluded from the standard, with reason. Use for HOLD facts, deferred standards, unverified topics, and implementation boundaries.

Aligns with Design Library **Unresolved dependencies** — do not leave exclusions implicit.

#### 8.1.10 Supporting evidence (required)

Table of every cited Fact ID, the verified statement used, and qualifications preserved. State when no additional facts are cited beyond those listed.

Do not duplicate Section 7 fact register wording unless needed for a single-standard freeze snapshot.

#### 8.1.11 Engineering implications (required section; content optional)

State whether engineering implications are defined. Operational policies and principles MAY defer engineering implications to Section 11 upon freeze review. This section MUST NOT introduce engineering requirements during initial drafting.

#### 8.1.12 Validation method (required)

How compliance is verified. MUST reference Req IDs, not document section numbers (standards may move or be split in future revisions).

#### 8.1.13 Related standards (optional)

Cross-references to other FI-MFG standards, including supersession, dependency, and HOLD interactions. Use `None` if not applicable.

#### 8.1.14 Future revision notes (required)

Known dependencies, HOLD interactions, and conditions that would trigger revision. Aligns with Design Library change-control expectations.

#### 8.1.15 Section applicability by disposition

| Section | PRN | STD | CON | POL |
|---------|-----|-----|-----|-----|
| Standard record | Required | Required | Required | Required |
| Standard statement | Required | Required | Required | Required |
| Purpose | Required | Required | Required | Required |
| Scope | Required | Required | Required | Required |
| Definitions | Optional | Optional | As needed | As needed |
| Normative requirements | Required | Required | Required | Required |
| Company judgment | If applicable | If applicable | If applicable | If applicable |
| Exceptions | Required | Required | Required | Required |
| Out of scope | Required | Required | Required | Required |
| Supporting evidence | Required | Required | Required | Required |
| Engineering implications | Defer allowed | Usually required at freeze | Defer allowed | Defer allowed |
| Validation method | Required | Required | Required | Required |
| Related standards | Optional | Optional | Optional | Recommended |
| Future revision notes | Required | Required | Required | Required |

**Disposition key:** PRN = Manufacturing Principle; STD = Permanent Standard; CON = Manufacturing Constraint; POL = Operational Policy.

### 8.2 Reserved standard index

| Reserved ID | Name | Disposition | Drafting Readiness | Supporting Fact IDs | Status |
|-------------|------|-------------|--------------------|---------------------|--------|
| FI-MFG-PRN-001 | Real Pen Production Method Principle | Manufacturing Principle | READY WITH QUALIFICATION | HW-MFG-004 | Reserved, Not Drafted |
| FI-MFG-CON-001 | Envelope Fulfillment Handling Boundary | Manufacturing Constraint | READY WITH QUALIFICATION | HW-MFG-005 | Drafted, Pending Freeze |
| FI-MFG-CON-002 | Add-On Fulfillment Boundary | Manufacturing Constraint | READY WITH QUALIFICATION | HW-MFG-012; HW-MFG-018 | Reserved, Not Drafted |
| FI-MFG-CON-003 | Vendor Capability Validation Constraint | Manufacturing Constraint | READY WITH QUALIFICATION | HW-MFG-002; HW-MFG-008; HW-MFG-013; HW-MFG-020 | Reserved, Not Drafted |
| FI-MFG-CON-004 | Bulk Workflow Compatibility Boundary | Manufacturing Constraint | READY WITH QUALIFICATION | HW-MFG-014 | Reserved, Not Drafted |
| FI-MFG-POL-001 | Custom Signature Governance Policy | Operational Policy | READY WITH QUALIFICATION | HW-MFG-006 | Reserved, Not Drafted |
| FI-MFG-POL-002 | Order Modification and Cancellation Policy | Operational Policy | READY FOR DRAFTING | HW-MFG-016 | Drafted, Pending Freeze |
| FI-MFG-POL-003 | Customer Promise Discipline Policy | Operational Policy | READY WITH QUALIFICATION | HW-MFG-011; HW-MFG-015; HW-MFG-017; HW-MFG-018 | Reserved, Not Drafted |
| FI-MFG-POL-004 | Vendor Liability and Resend Handling Policy | Operational Policy | READY WITH QUALIFICATION | HW-MFG-018; HW-MFG-019 | Reserved, Not Drafted |

### 8.3 Standards register

| Standard ID | Standard Statement | Supporting Fact IDs | Status |
|-------------|-------------------|---------------------|--------|
| FI-MFG-POL-002 | Placed Handwrytten manufacturing orders SHALL NOT be represented as editable; cancellation SHALL be treated as available only before the writing process begins. | HW-MFG-016 | Drafted, Pending Freeze |
| FI-MFG-CON-001 | F.I. Forgot SHALL treat envelope handling as confirmed Handwrytten fulfillment scope and SHALL NOT assume handwritten envelope addressing or an undisclosed envelope-production path. | HW-MFG-005 | Drafted, Pending Freeze |

### 8.4 FI-MFG-POL-002 — Order Modification and Cancellation Policy

#### Standard record

| Field | Value |
|-------|-------|
| **Standard ID** | FI-MFG-POL-002 |
| **Standard name** | Order Modification and Cancellation Policy |
| **Disposition** | Operational Policy |
| **Status** | Drafted, Pending Freeze |
| **Supporting Fact IDs** | HW-MFG-016 |
| **Related vendor questions** | None |
| **Governing qualification** | HW-MFG-016 is an operational boundary (Support Documentation). |

#### Standard statement

Placed Handwrytten manufacturing orders SHALL NOT be represented as editable; cancellation SHALL be treated as available only before the writing process begins.

#### Purpose

Define F.I. Forgot's permanent operational policy for order modification and cancellation on Handwrytten-fulfilled manufacturing orders.

This policy establishes what F.I. Forgot may represent and how F.I. Forgot SHALL treat order edit and cancellation availability after order placement.

#### Scope

This standard applies to:

- All F.I. Forgot manufacturing orders submitted for Handwrytten fulfillment under Volume 01.
- All customer-facing, partner-facing, and internal policy statements that describe order modification or cancellation availability for those orders.

This standard does not define product features, user-interface behavior, or system implementation.

#### Definitions

| Term | Definition |
|------|------------|
| **Placed order** | A manufacturing order that has been submitted for Handwrytten fulfillment. |
| **Writing process** | The Handwrytten production stage after which order cancellation is no longer available, as identified in HW-MFG-016. F.I. Forgot does not define sub-stages of this process in this standard. |

#### Normative requirements

| Req ID | Requirement | Source |
|--------|-------------|--------|
| FI-MFG-POL-002-R01 | F.I. Forgot SHALL treat a Handwrytten manufacturing order as a **placed order** once the order has been submitted for fulfillment. | Company judgment |
| FI-MFG-POL-002-R02 | F.I. Forgot SHALL NOT represent, offer, or imply that a placed order may be edited. | HW-MFG-016 |
| FI-MFG-POL-002-R03 | F.I. Forgot SHALL NOT represent, offer, or imply that order cancellation remains available after the writing process has begun for that order. | HW-MFG-016 |
| FI-MFG-POL-002-R04 | F.I. Forgot SHALL treat order cancellation as permitted only before the writing process begins for the order. | HW-MFG-016 |
| FI-MFG-POL-002-R05 | F.I. Forgot SHALL align all in-scope statements describing order modification or cancellation availability with FI-MFG-POL-002-R02 through FI-MFG-POL-002-R04. | Company judgment |
| FI-MFG-POL-002-R06 | F.I. Forgot SHALL NOT represent cancellation or edit availability beyond the boundary established in HW-MFG-016 unless this standard is revised following an updated verified-facts baseline. | Company judgment |
| FI-MFG-POL-002-R07 | F.I. Forgot SHALL NOT infer undocumented Handwrytten workflow states, edit paths, or cancellation mechanisms. | HW-MFG-016 qualification |

#### Company judgment

The following decisions are F.I. Forgot company judgments. They are not established by vendor disclosure alone:

- F.I. Forgot adopts the HW-MFG-016 operational boundary as a permanent F.I. Forgot policy for in-scope orders.
- F.I. Forgot requires customer-facing and internal policy alignment with that boundary (FI-MFG-POL-002-R05).
- F.I. Forgot does not define edit exceptions, escalation paths, or error-correction workflows in this standard.

#### Exceptions

No exceptions are defined in this standard.

Any future exception requires a documented standard revision supported by verified evidence or explicit company judgment recorded in the revision.

#### Out of scope

The following subjects are explicitly out of scope for FI-MFG-POL-002:

| Subject | Reason |
|---------|--------|
| Resend, refund, or error-correction policy | Reserved for FI-MFG-POL-004 |
| Escalation procedures after placement | Not established by HW-MFG-016; company decision deferred |
| Production timing, mailing timing, or delivery promises | HW-MFG-010 remains on HOLD |
| Partial or field-level order changes | Not verified in the frozen facts baseline |
| API behavior, order payloads, or system workflows | Implementation; not defined in this operational policy |
| Vendor internal production stages beyond the writing-process boundary named in HW-MFG-016 | Not verified |

#### Supporting evidence

| Fact ID | Verified statement used by this standard | Qualification preserved |
|---------|------------------------------------------|-------------------------|
| HW-MFG-016 | Handwrytten’s order-cancellation guide states orders can be canceled only before the writing process begins and cannot be edited once placed. | Operational boundary (Support Documentation). |

No additional verified facts are cited by this standard.

#### Engineering implications

Not defined in this operational policy.

Engineering specifications, if required, SHALL be derived separately from this standard upon freeze review. This standard does not authorize engineering requirements.

#### Validation method

Compliance with FI-MFG-POL-002 SHALL be verified by review of in-scope customer-facing, partner-facing, and internal policy materials against FI-MFG-POL-002-R01 through FI-MFG-POL-002-R07.

A material statement violates this standard if it contradicts any normative requirement in this standard.

#### Related standards

| Standard ID | Relationship |
|-------------|--------------|
| FI-MFG-POL-004 | Vendor Liability and Resend Handling Policy — governs resend and recovery; not superseded by this standard |
| FI-MFG-POL-003 | Customer Promise Discipline Policy — governs broader customer commitments; timing elements remain blocked by HW-MFG-010 HOLD |

#### Future revision notes

- If Handwrytten order-modification or cancellation boundaries change in the verified facts baseline, this standard requires revision before F.I. Forgot policy may change.
- Escalation or exception handling may be added only through a documented revision supported by verified evidence or explicit company judgment.
- HW-MFG-010 HOLD remains in effect; this standard does not create timing or delivery commitments.

### 8.5 FI-MFG-CON-001 — Envelope Fulfillment Handling Boundary

#### Standard record

| Field | Value |
|-------|-------|
| **Standard ID** | FI-MFG-CON-001 |
| **Standard name** | Envelope Fulfillment Handling Boundary |
| **Disposition** | Manufacturing Constraint |
| **Status** | Drafted, Pending Freeze |
| **Supporting Fact IDs** | HW-MFG-005 |
| **Related vendor questions** | HW-VQ-014 |
| **Governing qualification** | Use envelope-handling wording; specific addressing method not disclosed. |

#### Standard statement

F.I. Forgot SHALL treat envelope handling as confirmed Handwrytten fulfillment scope and SHALL NOT assume handwritten envelope addressing or an undisclosed envelope-production path.

#### Purpose

Define the manufacturing constraint that bounds how F.I. Forgot may treat Handwrytten envelope fulfillment in Volume 01 design, product, operational, and planning decisions.

This constraint prevents undisclosed addressing or production-path assumptions from entering the F.I. Forgot manufacturing baseline.

#### Scope

This standard applies to:

- All F.I. Forgot Volume 01 design, product, operational, and planning decisions that depend on Handwrytten envelope fulfillment characteristics.
- All internal materials that bound, classify, or depend on envelope fulfillment assumptions for Handwrytten manufacturing.

This standard does not define customer messaging, workflow instructions, engineering specifications, API behavior, user-interface behavior, or vendor diligence procedures.

#### Definitions

| Term | Definition |
|------|------------|
| **Envelope handling** | Handwrytten fulfillment treatment of envelopes as confirmed by HW-MFG-005. This standard does not expand envelope handling beyond verified disclosure. |
| **Envelope-production path** | The method by which Handwrytten produces or addresses envelopes. The specific path is not disclosed in the verified facts baseline. |

#### Normative requirements

| Req ID | Requirement | Source |
|--------|-------------|--------|
| FI-MFG-CON-001-R01 | F.I. Forgot SHALL treat envelope handling as a confirmed component of Handwrytten fulfillment within Volume 01. | HW-MFG-005 |
| FI-MFG-CON-001-R02 | F.I. Forgot SHALL use envelope-handling language when bounding envelope fulfillment scope in in-scope decisions. | HW-MFG-005 qualification |
| FI-MFG-CON-001-R03 | F.I. Forgot SHALL NOT assume handwritten envelope addressing in any in-scope design, product, operational, or planning decision. | HW-MFG-005 qualification |
| FI-MFG-CON-001-R04 | F.I. Forgot SHALL NOT depend on, specify, or require a particular undisclosed envelope-production path in any in-scope decision. | HW-MFG-005 qualification |
| FI-MFG-CON-001-R05 | F.I. Forgot SHALL NOT treat vendor envelope-crafting disclosure as evidence of handwritten addressing or of a disclosed envelope-production method. | HW-MFG-005 qualification |

#### Company judgment

The following decisions are F.I. Forgot company judgments. They are not established by vendor disclosure alone:

- F.I. Forgot adopts the HW-MFG-005 verified boundary as a permanent manufacturing constraint for Volume 01 envelope fulfillment decisions.
- F.I. Forgot applies this constraint to design, product, operational, and planning decisions — not only to engineering artifacts.

No normative requirement in this standard uses `Company judgment` as its Source value. Adoption and applicability scope are disclosed here; requirements derive from HW-MFG-005 and its qualification.

#### Exceptions

No exceptions are defined in this standard.

Any future exception requires a documented standard revision supported by verified evidence or explicit company judgment recorded in the revision.

#### Out of scope

The following subjects are explicitly out of scope for FI-MFG-CON-001:

| Subject | Reason |
|---------|--------|
| Envelope addressing method | Not disclosed; HW-VQ-014 unresolved |
| Add-on, insert, or gift-card matching | Reserved for FI-MFG-CON-002 |
| Customer promise or outward-facing messaging | Operational policy domain; not a manufacturing constraint subject |
| Envelope quality, presentation, or premium claims beyond verified envelope-handling disclosure | Not verified beyond HW-MFG-005 |
| Production timing, mailing timing, or delivery promises | HW-MFG-010 remains on HOLD |
| API behavior, order payloads, or system workflows | Implementation; not defined in this constraint |
| Vendor diligence procedures for HW-VQ-014 | Vendor diligence; not defined in this constraint |

#### Supporting evidence

| Fact ID | Verified statement used by this standard | Qualification preserved |
|---------|------------------------------------------|-------------------------|
| HW-MFG-005 | Handwrytten’s company FAQ states that envelopes are crafted with the same attention to detail as the note, confirming envelope handling as part of fulfillment. | Use envelope-handling wording; specific addressing method not disclosed. |

No additional verified facts are cited by this standard.

#### Engineering implications

Not defined in this manufacturing constraint.

Engineering specifications, if required, SHALL be derived separately from this standard upon freeze review. This standard does not authorize engineering requirements.

#### Validation method

Compliance with FI-MFG-CON-001 SHALL be verified by review of in-scope design, product, operational, and planning materials against FI-MFG-CON-001-R01 through FI-MFG-CON-001-R05.

A material assumption, boundary statement, or dependency violates this standard if it contradicts any normative requirement in this standard.

#### Related standards

| Standard ID | Relationship |
|-------------|--------------|
| FI-MFG-CON-002 | Add-On Fulfillment Boundary — related fulfillment domain; distinct unknowns; not superseded by this standard |

#### Future revision notes

- If HW-VQ-014 resolves the envelope addressing method, this standard requires revision before F.I. Forgot may treat addressing method as verified.
- If the verified facts baseline changes HW-MFG-005 or its qualification, this standard requires revision before F.I. Forgot constraint boundaries may change.
- HW-MFG-010 HOLD remains in effect; this standard does not create timing or delivery commitments.

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
