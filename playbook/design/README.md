# F.I. Forgot Design Library

## Document Control

| Field | Value |
|-------|-------|
| **Status** | Governance Review Draft |
| **Version** | 1.1 Draft |
| **Date** | July 28, 2026 |
| **Branch** | `frontend-rebuild` |
| **Upstream governance** | `playbook/research/README.md` |
| **Owner** | F.I. Forgot |

---

## 1. Purpose

The F.I. Forgot Design Library defines how F.I. Forgot chooses to design, manufacture, present, and govern the physical and visual product experience.

Just as the Brain Architecture defines how F.I. Forgot thinks, the Design Library defines how F.I. Forgot looks, feels, and is experienced. These documents exist to ensure that every greeting card, envelope, illustration, visual asset, and future design decision contributes to a single, recognizable product experience.

The Design Library contains **company decisions**, not raw vendor documentation. It is intended to become a permanent company reference that future designers, engineers, illustrators, marketers, agencies, manufacturers, and partners can use without rediscovering foundational assumptions.

Verified vendor facts from the Research Library may inform Design Library standards, but they do **not** automatically become standards. F.I. Forgot must deliberately decide what to adopt, what to exceed, what to narrow, and what to reject.

---

## 2. Governing Knowledge Flow

All Design Library work sits downstream of the Research Library lifecycle:

```
Research Report
        ↓
Evidence Audit
        ↓
Verified Facts
        ↓
Design Library and Company Standards
        ↓
Engineering Specifications
        ↓
Implementation
```

**Research Report** collects and organizes available evidence.

**Evidence Audit** tests claim quality, source traceability, recency, conflicts, scope, and promotion eligibility.

**Verified Facts** contain only audited and source-captured facts approved for downstream use.

**Design Library and Company Standards** define how F.I. Forgot chooses to operate, design, manufacture, and present the product.

**Engineering Specifications** translate company standards into implementable technical, manufacturing, and operational requirements.

**Implementation** includes code, workflows, artwork, manufacturing execution, vendor configuration, and operational processes.

The Design Library begins only after relevant facts have passed evidence audit and exact source capture. Design standards must not be written from research narrative, unaudited claims, or marketing language.

---

## 3. Design Philosophy

F.I. Forgot is not in the business of generating greeting cards. F.I. Forgot is in the business of strengthening relationships.

The following beliefs govern all Design Library volumes:

- **The handwritten message is the emotional centerpiece.** Everything else exists to support it.
- **Artwork supports the message.** Artwork must not compete with the message.
- **F.I. Forgot is building a Cover Design System**, not merely generating isolated artwork. Collections, templates, metadata, and production structure must work together as a system.
- **Manufacturing realities must inform design decisions.** Production constraints should shape design before artwork is finalized, not after.
- **Vendor practices and F.I. Forgot standards must remain separate.** What a vendor does is not automatically what F.I. Forgot requires.
- **Emotional quality, visual quality, manufacturability, and operational reliability must be considered together.** A beautiful design that cannot be produced reliably is not a complete design decision.

Technology should disappear behind the experience. Recipients should remember the feeling of receiving the card, not the software that created it.

---

## 4. Design Library Principles

The Design Library is built upon governing principles that refine the original design philosophy into durable rules.

### Emotional Primacy

The handwritten message is always the hero. Layout, artwork, envelope treatment, and production choices must increase the emotional impact of the message rather than distract from it.

### Supportive Artwork

Artwork should prepare the recipient emotionally before they read a single word. The goal is anticipation, not decoration for its own sake.

### System Before Assets

F.I. Forgot standards govern collections, templates, metadata, production structure, and repeatable design logic—not isolated one-off assets. Individual artwork must fit within a coherent system.

### Manufacturing Awareness

Design decisions must respect known production capabilities and constraints. Designers should not discover manufacturing requirements after artwork is complete.

### Traceable Decisions

Material standards, constraints, and requirements must remain traceable to verified facts, explicit company judgment, or documented open questions. Unexplained assumptions are not acceptable in frozen standards.

### Controlled Evolution

The Design Library evolves deliberately. Changes preserve long-term consistency unless a documented revision justifies a material shift.

### Consistency Without Sameness

Every card should feel like it belongs to the same product family across occasion, collection, and recipient, without forcing every card to look identical.

### Premium Restraint

F.I. Forgot values elegance over novelty, timelessness over trends, and restraint over decoration. Premium presentation is non-negotiable; flash is not.

---

## 5. Vendor Facts Versus Company Standards

Design Library documents must distinguish three layers of knowledge:

| Layer | Definition |
|-------|------------|
| **Vendor Fact** | A fact supported by the frozen Research Library |
| **F.I. Forgot Standard** | A deliberate company decision about how F.I. Forgot will operate or design |
| **Engineering Specification** | An implementable technical, manufacturing, or operational requirement |

### Illustrative example

The following example shows how the layers relate. It is **illustrative only** and does not create a new standard by itself.

| Layer | Statement |
|-------|-----------|
| **Vendor Fact** | A manufacturing vendor states that its robots use real pens. |
| **F.I. Forgot Standard** | F.I. Forgot handwritten cards must preserve the visible character of physical ink. |
| **Engineering Specification** | Manufacturing validation must reject card output produced only through simulated handwriting printing. |

A vendor fact does not automatically require adoption as a company standard. F.I. Forgot may adopt a stricter, narrower, or different rule based on product requirements, risk tolerance, and operational needs.

---

## 6. Fact Traceability

Material Design Library standards must reference supporting verified Fact IDs from the frozen Research Library baseline.

Traceability rules:

- Fact IDs support decisions; they do not replace explanation.
- Qualifications attached to verified facts must remain visible when relevant.
- **HOLD** or **REJECT** facts may not support permanent standards.
- Standards based partly on company judgment must say so explicitly.
- Open vendor questions must remain explicit and must not be treated as resolved by implication.

Not every descriptive paragraph requires a Fact ID. Permanent requirements, constraints, and material decisions must be traceable.

---

## 7. Evidence Boundaries

A Design Library document must not claim knowledge beyond the frozen Verified Facts baseline for its subject.

When knowledge is incomplete, use one of these labels:

| Label | Meaning |
|-------|---------|
| **Unresolved** | Evidence does not yet support a conclusion |
| **Pending Vendor Confirmation** | Public evidence is insufficient; direct vendor input is required |
| **Deferred to Later Research Volume** | The subject is intentionally outside the current research scope |
| **Company Decision Independent of Vendor Fact** | F.I. Forgot has chosen a rule that is not derived from a vendor disclosure |

Absence of evidence must not be converted into a vendor limitation. Unknown operational detail remains unknown until verified or confirmed.

---

## 8. Volume Architecture

The Design Library is organized into **six production volumes** (Volume 01 through Volume 06). Each volume has a distinct role in the product design system.

**Authoritative source:** `FI-DSN-VOL-001` (`playbook/design/09-design-volume-roadmap.md`) is the authoritative source for the Production Volume Inventory, roadmap status, and constitutional dependency posture. This section is a **descriptive summary only**.

### Volume 01: Manufacturing and Production

| Field | Value |
|-------|-------|
| **Purpose** | Translate verified manufacturing facts into F.I. Forgot manufacturing principles, standards, constraints, vendor questions, and engineering requirements; govern Manufacturing Validation, Manufacturing Execution, and Fulfillment Execution |
| **Primary outputs** | Production standards, manufacturing constraints, vendor-question registers, engineering requirement references |
| **Upstream dependencies** | Relevant Research Library verified facts; vendor confirmations where required |
| **Downstream consumers** | Card Design System, Creative Production, engineering specifications, vendor configuration |

### Volume 02: Design Language

| Field | Value |
|-------|-------|
| **Purpose** | Visual identity permission — visual philosophy, brand expression, asset character, identity eligibility, and identity constraints. Does **not** own visual artifact realization or Governed Production-Ready Artifact (GPRA) approval |
| **Primary outputs** | Brand and visual identity standards, emotional design rules, typographic and color philosophy |
| **Architecture** | `playbook/design/volume-02-visual-design/01-visual-design-architecture.md` — Version **1.1 Draft**, **Under revision**; Version **1.0** Frozen baseline (July 23, 2026) remains binding until re-freeze |
| **Upstream dependencies** | Company principles; relevant verified facts where manufacturing or presentation constraints apply |
| **Downstream consumers** | Card Design System, Artwork Intelligence, Creative Production |

### Volume 03: Card Design System

| Field | Value |
|-------|-------|
| **Purpose** | Surface and spatial law — card structure, envelope structure, templates, layout rules, artwork placement, and governed card and envelope surface structure (distinct from GPRA status) |
| **Primary outputs** | Template standards, layout rules, safe zones, metadata schema, governed surface structure |
| **Architecture** | `playbook/design/volume-03-surface-implementation/01-surface-implementation-architecture.md` — Version **1.0** Frozen |
| **Upstream dependencies** | Volume 01 manufacturing constraints; Volume 02 design language |
| **Downstream consumers** | Artwork Intelligence, Creative Production, engineering templates, manufacturing execution |

### Volume 04: Artwork Intelligence

| Field | Value |
|-------|-------|
| **Purpose** | Contextual eligibility and contextual selection — how the Brain selects among permitted treatments using relationship context, occasion, emotional intent, tone, and personalization policy. Does **not** own visual realization or production-readiness approval |
| **Primary outputs** | Artwork selection rules, metadata requirements, occasion and personalization standards, intelligence constraints |
| **Architecture** | `playbook/design/volume-04-artwork-intelligence/01-artwork-intelligence-architecture.md` — Version **1.0** Frozen |
| **Upstream dependencies** | Brain Architecture; Volume 02 design language; Volume 03 card structure |
| **Downstream consumers** | Creative Production; Volume 05 collection intake (via GPRA consumption); engineering implementation |

### Volume 05: Signature Collections

| Field | Value |
|-------|-------|
| **Purpose** | Permanent collection membership, collection admission, collection structure and identity, collection lifecycle, consistency, and retirement. Consumes GPRAs from Volume 06 at collection intake; GPRA approval is **not** collection membership. Does **not** perform visual realization or repeat Volume 06 GPRA approval |
| **Primary outputs** | Collection membership standards, collection lifecycle standards, collection metadata rules |
| **Architecture** | `playbook/design/volume-05-signature-collections/01-signature-collections-architecture.md` — Version **1.1 Draft**, **Under revision**; Version **1.0** Frozen baseline (July 27, 2026) remains binding until re-freeze |
| **Upstream dependencies** | Volume 02 design language; Volume 03 card system; Volume 04 artwork intelligence; Volume 06 GPRAs at intake |
| **Downstream consumers** | Production artwork libraries, marketing assets, partner design guidance |

### Volume 06: Creative Production

| Field | Value |
|-------|-------|
| **Purpose** | Governed transformation of declared production intent into Governed Production-Ready Artifacts through realization, Review Determination, Approval, and Governed Handoff |
| **Owns** | Declared Production Intent; Production Obligation; Exploration; Realization; Realized Visual Artifact posture; Review Determination; production-readiness Approval; GPRA status; Governed Handoff |
| **Does not own** | Visual identity permission (Volume 02); surface and spatial law (Volume 03); contextual selection (Volume 04); permanent collection membership (Volume 05); Manufacturing Validation, Manufacturing Execution, or Fulfillment Execution (Volume 01); Brain runtime artifact approval |
| **Architecture** | `playbook/design/volume-06-creative-production/01-creative-production-architecture.md` — Version **0.3 Draft**; roadmap status **Defined**; unfrozen; **not Entry Ready**; no Layer B standards yet |
| **Upstream dependencies** | Applicable authority from Volumes 01 through 04 |
| **Downstream consumers** | Volume 05 collection intake; production artwork libraries; engineering specifications |

**Numeric order and constitutional dependency:** Numeric volume order remains Volume 01 through Volume 06. Numeric order does not alone establish constitutional dependency order. For the relevant artwork lifecycle, Volume 04 contextual selection → Volume 06 realization and GPRA approval → Volume 05 collection intake and membership consideration. Volume 06 is numbered **06** but is constitutionally **upstream of Volume 05** for GPRA intake.

**Structurally Complete versus GPRA:** **Structurally Complete** describes a volume container's roadmap maturity. **Governed Production-Ready Artifact (GPRA)** describes an individual visual artifact approved under Volume 06. They are not comparable statuses.

Detailed volume content is defined in each volume's own documents. This README defines architecture only.

---

## 9. Volume 01: Manufacturing and Production

Volume 01 translates verified manufacturing facts into F.I. Forgot manufacturing principles, standards, constraints, vendor questions, and engineering requirements.

Current upstream baseline:

- **Document:** `playbook/research/handwrytten/volume-01-manufacturing-overview/03-verified-facts.md`
- **Baseline version:** 1.0
- **Status:** Frozen Verified Baseline

**HW-MFG-010** remains on **HOLD** because official production timing statements are not harmonized. Timing standards may not be written from HW-MFG-010 or from unaudited timing claims until vendor confirmation resolves the conflict.

Volume 01 must separate vendor facts from F.I. Forgot standards and must preserve material qualifications from the verified baseline. It must not restate the Research Library or duplicate vendor documentation.

---

## 10. Relationship to the Brain Architecture

The Brain Architecture, writing engine, Design Library, and manufacturing standards form a layered product system.

| Layer | Responsibility |
|-------|----------------|
| **Brain Architecture** | Determines what should be expressed |
| **Writing engine** | Determines how the message should be written |
| **Design Library** | Determines how the message should be visually and physically presented |
| **Manufacturing standards** | Determine whether the designed experience can be produced reliably |

No layer should compensate for failures in another layer. A strong message cannot excuse poor presentation. Beautiful presentation cannot excuse unreliable manufacturing. Reliable manufacturing cannot excuse weak emotional design.

Brain runtime may inform or recommend within governed bounds per `FI-DSN-GOV-004` (`playbook/design/08-brain-authority-boundary.md`), but does **not** grant GPRA status or collection membership.

Together these layers create the complete F.I. Forgot experience.

---

## 11. Standard Authoring Requirements

Every governing standard should include, where applicable:

| Element | Requirement |
|---------|-------------|
| **Standard ID** | A stable identifier for permanent requirements |
| **Standard statement** | The rule F.I. Forgot adopts |
| **Purpose** | Why the standard exists |
| **Supporting Fact IDs** | Verified facts that inform the standard |
| **Company judgment** | Where F.I. Forgot chose beyond or apart from vendor facts |
| **Scope** | What the standard applies to |
| **Exceptions** | Known exceptions or conditional cases |
| **Unresolved dependencies** | Open questions, HOLD facts, or pending vendor confirmation |
| **Engineering implications** | What implementation must enforce or validate |
| **Validation method** | How compliance is checked |
| **Change history** | Documented revisions for frozen standards |

Not every descriptive paragraph requires a Standard ID. Permanent requirements and constraints should be traceable.

---

## 12. Design Decision Classification

Design and manufacturing decisions may be classified using one or more of the following labels:

| Classification | Meaning |
|----------------|---------|
| **Verified Fact Based** | Directly informed by a frozen verified fact |
| **Company Principle** | Derived from Design Library philosophy or principles |
| **Company Policy** | A deliberate operating or design policy adopted by F.I. Forgot |
| **Design Judgment** | A creative or experiential choice not fully determined by facts |
| **Manufacturing Constraint** | A production limitation that shapes design or standards |
| **Engineering Requirement** | A rule that must be implemented or validated in systems or operations |
| **Pending Vendor Confirmation** | Cannot be finalized without vendor input |
| **Deferred Research** | Intentionally deferred to a later research volume |

Several classifications may apply to one decision. Authors should use the most specific applicable labels.

---

## 13. Change Control

All Design Library documents must maintain visible status and version metadata.

Change control requirements:

- Every Design Library document must have status and version.
- Frozen standards may only change through a documented revision.
- Changes to governing verified facts require downstream impact review in affected Design Library volumes.
- Material changes must include a change log.
- Held Fact IDs may not be treated as resolved.
- Fact qualifications may not be removed silently.

### Version guidance

| Version | Use |
|---------|-----|
| **1.0** | First frozen standard or volume baseline |
| **1.1** | Minor clarifications without material policy change |
| **2.0** | Material standard changes or restructuring |

---

## 14. Freeze Gate

A Design Library volume may be frozen only after all of the following are confirmed:

- [ ] Upstream verified facts are frozen
- [ ] Fact IDs are referenced where material
- [ ] Vendor facts and company standards are separated
- [ ] Evidence boundaries are documented
- [ ] Open vendor questions are listed
- [ ] Engineering implications are identified
- [ ] Validation methods are defined where applicable
- [ ] The document is internally consistent
- [ ] No HOLD or REJECT claim is presented as verified
- [ ] Change control exists

---

## 15. Current Status

This table is a **descriptive snapshot** only. Each artifact's Document Control and governing source remain authoritative.

| Item | Current working posture | Binding baseline / notes |
|------|-------------------------|--------------------------|
| Research Library governance | Frozen | Version **1.0** |
| Handwrytten Manufacturing Overview verified facts | Frozen | Version **1.0** |
| `FI-DSN-VOL-001` Design Volume Roadmap | Version **1.1 Draft** | Version **1.0** Frozen baseline (July 23, 2026) remains binding until re-freeze |
| Volume 02 Visual Design Architecture | Version **1.1 Draft**, **Under revision** | Version **1.0** Frozen baseline remains binding |
| Volume 03 Surface Implementation Architecture | Version **1.0** Frozen | — |
| Volume 04 Artwork Intelligence Architecture | Version **1.0** Frozen | — |
| Volume 05 Signature Collections Architecture | Version **1.1 Draft**, **Under revision** | Version **1.0** Frozen baseline (July 27, 2026) remains binding |
| Volume 06 Creative Production Architecture | Version **0.3 Draft**; roadmap **Defined**; unfrozen; **not Entry Ready** | No Layer B standards established |
| Volume 01 Manufacturing and Production Standard | In development | — |
| Design Planning Register (`FI-DSN-REG-001`) | Frozen | See `playbook/design/05-design-planning-register.md` for detailed Layer B status (Volumes 02–05) |

The Design Library itself is **not** frozen. This document is a **Governance Review Draft**.

---

## 16. Long-Term Vision

The goal of the Design Library is not simply to standardize artwork. Its purpose is to create a durable product design system that becomes inseparable from the F.I. Forgot brand.

The library should function as company intellectual property suitable for designers, engineers, illustrators, agencies, manufacturers, and future partners. It should read as a coherent system, not a collection of notes.

The long-term measure of success is simple: a recipient should be able to recognize a F.I. Forgot card by its craftsmanship, visual language, and emotional tone before noticing the logo. When that happens, the Design Library has fulfilled its purpose.

---

## 17. Governance Statement

The Design Library governs F.I. Forgot design and manufacturing decisions.

The Research Library governs factual evidence.

The two libraries must remain connected through explicit traceability but must **never** be merged conceptually. Research informs decisions. F.I. Forgot owns the standards.

No implementation work, engineering specification, or production rule should treat research narrative or unaudited claims as authoritative. Only frozen verified facts—with qualifications intact—may govern downstream standardization.

---

**End of Document**
