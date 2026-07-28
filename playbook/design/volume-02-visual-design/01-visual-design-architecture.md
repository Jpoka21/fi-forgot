# F.I. Forgot Design Library — Volume 02

# Visual Design Architecture

## Document Control

| Field | Value |
|-------|-------|
| **Document class** | Volume Governance |
| **Document** | `01-visual-design-architecture.md` |
| **Volume** | 02 — Design Language |
| **Title** | Visual Design Architecture |
| **Sprint working label** | `FI-DSN-VIS-001` (D2.1 tracking only — not an authorized `FI-DSN-*` namespace per `FI-DSN-ID-001`) |
| **Status** | Under revision |
| **Version** | 1.1 Draft |
| **Date** | July 28, 2026 |
| **Freeze date** | July 23, 2026 (Version 1.0 frozen baseline) |
| **Prior frozen baseline** | Version 1.0 — Frozen July 23, 2026 (remains binding until Version 1.1 freeze per `FI-DSN-GOV-001` Section 15) |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Volume roadmap** | `FI-DSN-VOL-001` — Design Volume Roadmap (Frozen Design Volume Roadmap, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Register reference** | `FI-DSN-REG-001` — Design Planning Register (Frozen Planning Register, Version 1.0, July 22, 2026) |
| **Queue reference** | `FI-DSN-QUE-001` — Design Drafting Queue (Frozen Design Drafting Queue, Version 1.0, July 23, 2026) |
| **Epistemic reference** | `FI-DSN-GOV-003` — Evidence vs Company Judgment Governance (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Brain authority reference** | `FI-DSN-GOV-004` — Brain Authority Boundary (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Upstream governance** | `playbook/design/README.md`; `playbook/design/09-design-volume-roadmap.md` |
| **Downstream consumers** | Future Volume 02 `FI-DSN-*` standards; Volumes 03 through 05; `FI-DSN-REG-001` volume planning rows |

**Standard statement:** F.I. Forgot maintains **one authoritative Visual Design Architecture** for Volume 02 that defines durable architectural layers, authority boundaries, standard placement rules, and cross-volume relationships for the visual design domain. This document governs how Volume 02 is organized. It does not author normative visual requirements, product templates, artwork selection logic, collection operations, or Brain runtime behavior.

**Source basis:** Company judgment. This architecture is an F.I. Forgot governance choice. It is not derived from vendor facts, verified evidence, or Brain runtime behavior.

---

## 1. Purpose

This document is the **permanent Volume Governance architecture** for F.I. Forgot Volume 02 — Design Language.

Its purpose is to define:

- How the visual design domain is architecturally organized
- What authorities exist within Volume 02 and what they do not own
- How future visual standards are assigned to architectural layers and domains
- How Volume 02 relates to peer volumes and frozen governance artifacts

This document is **not** a style guide, branding manual, typography specification, color specification, illustration guide, photography guide, layout specification, template standard, manufacturing standard, or Brain implementation document. Those belong to future standards governed by this architecture.

Branding may evolve. Manufacturing vendors may change. Brain capabilities may expand. Artwork styles may multiply. This architecture SHALL remain stable across those changes.

---

## 2. Scope

### 2.1 In scope

- Volume 02 architectural layers and dependency model
- Volume 02 authority ownership and non-ownership
- Principal-subject placement rules for future standards
- Cross-volume boundary architecture with Volumes 01, 03, 04, and 05
- Asset lifecycle architectural ownership across the Design Library
- Visual Composition Principles as an independent architectural authority
- Future architectural domain inventory (no Standard IDs)
- Volume Supplement authorization within Volume 02 scope per `FI-DSN-VOL-001` Section 20
- Alignment with `FI-DSN-VOL-001` Volume 02 required category framework

### 2.2 Out of scope

- Normative visual requirements (`{Standard ID}-R{nn}` text)
- Fonts, colors, spacing values, artwork styles, logo specifications, or template dimensions
- Card template architecture, safe zones, bleed, and surface layout implementation (Volume 03)
- Artwork selection policy, occasion semantics, personalization policy, and Brain Visual Selection boundaries (Volume 04)
- Collection governance, asset library operations, and release criteria (Volume 05)
- Manufacturing feasibility, fulfillment, and production method policy (`FI-MFG-*`, Volume 01)
- Message wording, tone generation, and Writing Engine behavior (`FI-DSN-GOV-004` Section 12)
- Brain algorithms, prompts, and runtime selection logic (`FI-DSN-GOV-004`)
- Metadata field semantics (`FI-DSN-GOV-002`)
- Classification code definitions (`FI-DSN-CLS-001`)
- Identifier reservation and register population (`FI-DSN-REG-001`)
- Drafting admission and execution order (`FI-DSN-QUE-001`)

---

## 3. Document Relationship

Volume 02 sits in the F.I. Forgot Design Library stack:

```
Planning Foundation (GOV, REG, QUE, VOL-001, …)
        ↓
Volume 01 — Manufacturing constraints (FI-MFG-*)
        ↓
Volume 02 — Visual Design Architecture (this document)
        ↓         future Volume 02 FI-DSN-* standards
Volume 03 — Card Design System
        ↓
Volume 04 — Artwork Intelligence
        ↓
Volume 05 — Signature Collections
```

This diagram is **conceptual**. It shows durable authority direction, not a mandatory drafting sequence. Volume 02 planning MAY proceed in parallel with Volume 01 manufacturing constraint identification per `FI-DSN-VOL-001` Section 16.2.

| Layer | Role relative to this document |
|-------|------------------------------|
| **Planning Foundation** | Supplies frozen meta-governance that enables volume planning |
| **Volume 01** | Supplies applicable manufacturing Compliance Boundaries consumed by Volume 02 |
| **Volume 02** | Defines visual identity architecture; hosts future visual standards |
| **Volumes 03–05** | Consume Volume 02 element systems, composition principles, and visual boundaries |
| **Engineering / Product** | Implement governed visual rules; do not redefine library architecture |

**Permanent principle:**

> **Volume 02 defines what F.I. Forgot visuals are allowed to be. Volumes 03–05 define how those visuals occupy products, get chosen, and get organized.**

---

## 4. Authority

### 4.1 What this document owns

| Authority domain | Scope |
|------------------|-------|
| **Architectural organization** | Five-layer model, layer dependency, sub-domain structure |
| **Standard placement** | Rules for assigning future standards to layers and domains |
| **Volume 02 scope architecture** | Declared in-scope and out-of-scope boundaries for the visual domain |
| **Cross-volume boundary architecture** | How Volume 02 relates to Volumes 01, 03, 04, and 05 at the planning layer |
| **Asset lifecycle architecture** | Which volume owns each lifecycle stage of reusable visual assets |
| **Composition authority definition** | Independent Composition Principles authority within Volume 02 |
| **Volume Supplement authorization** | Permitted supplements within Volume 02 per `FI-DSN-VOL-001` Section 20 |

### 4.2 What this document does not own

| Domain | Authoritative owner |
|--------|---------------------|
| Metadata field semantics | `FI-DSN-GOV-002` |
| Identifier allocation | `FI-DSN-ID-001` + `FI-DSN-REG-001` |
| Primary / Secondary Classification definitions | `FI-DSN-CLS-001` |
| Artifact lifecycle and freeze law | `FI-DSN-GOV-001` |
| Epistemic governance | `FI-DSN-GOV-003` |
| Brain authority boundaries | `FI-DSN-GOV-004` |
| Production normative requirements | Individual frozen `FI-DSN-*` / `FI-MFG-*` standards |
| Drafting authorization | `FI-DSN-QUE-001` |
| Planning inventory truth | `FI-DSN-REG-001` |
| Volume numbering and Primary Volume rules | `FI-DSN-VOL-001` |
| Research verification | Research Library |

### 4.3 Document class and identifier posture

This document is a **Volume Governance** document per `FI-DSN-GOV-001` Section 5. Its canonical identity is its repository path and Volume 02 assignment.

The sprint working label `FI-DSN-VIS-001` is **not** an authorized identifier namespace under frozen `FI-DSN-ID-001`. Future Layer B visual standards SHALL use authorized `FI-DSN-{PRN|STD|CON|POL|SYS}-###` identifiers assigned through `FI-DSN-REG-001`.

**Classification code authority:** Canonical `CLS-*` codes are defined exclusively by `FI-DSN-CLS-001`. Where informational affinity tables in `FI-DSN-VOL-001` or other frozen artifacts use non-canonical codes, `FI-DSN-CLS-001` governs.

---

## 5. Architectural Principles

Future Volume 02 consumers and standard authors SHALL treat the following as permanent architectural law.

| ID | Principle | Requirement |
|----|-----------|-------------|
| **P1** | **Identity separated from structure** | Visual identity architecture MUST NOT require card-template or product-surface knowledge |
| **P2** | **Rules separated from selection** | Visual boundary rules MUST NOT embed artwork selection logic |
| **P3** | **Character separated from library operations** | Asset acceptability architecture MUST NOT govern collection release or maintenance |
| **P4** | **Manufacturing constrains; Volume 02 does not produce** | Applicable `FI-MFG-*` obligations are Compliance Boundary inputs; manufacturing policy MUST NOT be restated here |
| **P5** | **Brain bounded by Volume 02** | Volume 02 supplies visual Compliance Boundary inputs; Brain authority remains under `FI-DSN-GOV-004` |
| **P6** | **Classification independent of architecture** | `CLS-*` subject classification is assigned per `FI-DSN-CLS-001`; architectural layers organize planning home |
| **P7** | **Element durability** | Element systems MUST remain valid across product surfaces, vendors, and media |
| **P8** | **Composition abstraction split** | Composition principles govern relational visual discipline; surface layout belongs to Volume 03 |
| **P9** | **Exclusions are first-class** | Visual prohibitions are architectural, not optional addenda |
| **P10** | **Minimal stable layers** | New visual domains MUST map into existing layers unless governed `FI-DSN-VOL-001` revision authorizes expansion |
| **P11** | **Message primacy** | Visual design exists to **amplify emotional communication**, not compete with it. Governed visuals SHALL support the handwritten message as the emotional centerpiece of the product experience |

Principle P11 is architectural. It does not prescribe layout measurements, region sizes, or implementation behavior. P11 does **not** mandate message region size, font size, layout measurements, or template geometry.

---

## 6. Five-Layer Architecture

Volume 02 is organized into **five architectural layers**. Layers are ordered by design dependency. They are not drafting phases, queue states, or classification codes.

```
Layer 1 — Visual Intent
        ↓
Layer 2 — Brand Expression
        ↓
Layer 3 — Visual Element Systems
        ↓
Layer 4 — Composition Principles
        ↓
Layer 5 — Visual Boundaries and Foundations
```

### 6.1 Layer 1 — Visual Intent

| Field | Value |
|-------|-------|
| **Purpose** | Why F.I. Forgot pursues particular emotional and aesthetic postures |
| **Typical classifications** | `CLS-VPH` |
| **Owns** | Durable visual philosophy and identity-level design reasoning |
| **Does not own** | Executable brand asset rules, element specifications, product structure |

### 6.2 Layer 2 — Brand Expression

| Field | Value |
|-------|-------|
| **Purpose** | How F.I. Forgot brand identity is expressed and bounded in governed artifacts |
| **Typical classifications** | `CLS-BEX` |
| **Owns** | Brand-bound presentation discipline, identity-boundary rules, premium brand presentation philosophy |
| **Does not own** | Abstract visual philosophy (Layer 1), generic element systems unless brand expression is principal |

### 6.3 Layer 3 — Visual Element Systems

| Field | Value |
|-------|-------|
| **Purpose** | Reusable visual building blocks and their governance |
| **Typical classifications** | `CLS-TYP`, `CLS-COL`, `CLS-ILL`, `CLS-PHO`, `CLS-ART` |
| **Owns** | What each element type may be; medium-specific visual character; cross-medium artwork character where medium is not separately principal |
| **Does not own** | Where elements are placed on a surface (Volume 03), how elements are selected in context (Volume 04), how asset libraries operate (Volume 05) |

### 6.4 Layer 4 — Composition Principles

| Field | Value |
|-------|-------|
| **Purpose** | Permitted relationships among visual elements — hierarchy, balance, prominence, density, spatial discipline |
| **Typical classifications** | `CLS-CMP` when composition **principles** are principal |
| **Owns** | Domain-agnostic visual hierarchy; balance and whitespace philosophy; message-vs-visual prominence; cropping and scaling philosophy; user-supplied imagery treatment at principle level; premium presentation composition philosophy |
| **Does not own** | Template regions, safe areas, coordinates, bleed, or manufacturing integration (Volumes 01 and 03) |

**Architectural definition:**

> **Composition Principles govern the permitted relationships among visual elements independent of any specific product surface or template.**

Layer 4 is a **defining Volume 02 authority**. It MUST NOT be absorbed into typography, artwork, template, product, or Brain architecture.

### 6.5 Layer 5 — Visual Boundaries and Foundations

| Field | Value |
|-------|-------|
| **Purpose** | Cross-cutting constraints that are not element definitions |
| **Typical classifications** | `CLS-VQA`, `CLS-ACI` (when visual accessibility is principal) |
| **Owns** | Visual exclusions; accessibility foundations; library-level visual quality foundations |
| **Does not own** | Per-standard Validation sections inside individual standards (those remain per `FI-DSN-TPL-001`) |

Layer 5 contains three **sub-domains**. Sub-domains are organizational. They are not additional architectural layers.

| Sub-domain | Purpose |
|------------|---------|
| **Exclusions** | Prohibited treatments, anti-patterns, identity-breaking visuals |
| **Accessibility Foundations** | Minimum inclusion boundaries for visual presentation |
| **Visual Quality Foundations** | Cross-standard visual quality assurance posture at library level |

---

## 7. Layer Dependency Model

### 7.1 Positive design dependency

| Order | Layer | Depends on |
|-------|-------|------------|
| 1 | Visual Intent | — |
| 2 | Brand Expression | Visual Intent |
| 3 | Visual Element Systems | Brand Expression |
| 4 | Composition Principles | Visual Element Systems |
| 5 | Visual Boundaries and Foundations | Elements and composition patterns (for constraint definition) |

Brand expression implements intended emotional posture. Element systems operate within brand boundaries. Composition arranges distinguishable element types. Boundary rules often reference composed presentations.

### 7.2 Authority precedence

When conflict occurs, **Layer 5 constraints override** upstream layers. A prohibited treatment remains prohibited regardless of brand preference or compositional intent.

Boundaries are **last in the positive design dependency chain** because many exclusions and accessibility rules reference elements and composition that must first be architecturally defined.

### 7.3 Rejected orderings

| Proposed ordering | Rejection rationale |
|-------------------|---------------------|
| Boundaries before Elements | Exclusions are often element-specific; undefined elements produce vague prohibitions |
| Composition before Elements | Hierarchy requires distinguishable element types |
| Brand and Intent merged | Philosophy and identity-bound rules evolve independently (`CLS-VPH` vs `CLS-BEX`) |

---

## 8. Layer Justifications

Each layer MUST remain independently justified. Layers SHALL NOT be merged for convenience alone.

| Layer | Problem solved | Why it cannot merge |
|-------|----------------|---------------------|
| **1 — Visual Intent** | Prevents brand-asset standards from secretly defining company-wide emotional philosophy | Merging into Brand Expression collapses philosophy and identity rules |
| **2 — Brand Expression** | Separates identity-bound presentation from generic element governance | Cannot absorb Elements (different subject domains) or Intent (different abstraction level) |
| **3 — Visual Element Systems** | Enables independent evolution of typography, color, illustration, photography, and artwork character | A single "visual rules" layer would force artificial unity across mediums |
| **4 — Composition Principles** | Eliminates authority vacuum between element standards and card layout standards | Typography, artwork, and templates each own partial aspects but not relational discipline |
| **5 — Visual Boundaries and Foundations** | Centralizes prohibitions, inclusion minimums, and library-level quality posture | Not element definitions (Layer 3); three sub-domains share constraint posture without distinct dependency order |

---

## 9. Authority Boundaries

### 9.1 Peer volume boundaries

| Peer | Volume 02 relationship | Prohibited leakage |
|------|------------------------|-------------------|
| **Volume 01 — Manufacturing** | Consumes applicable `FI-MFG-*` as Compliance Boundary inputs per `FI-DSN-GOV-004` Section 13 | Restating manufacturing operational policy in visual architecture |
| **Volume 03 — Card Design System** | Downstream consumer of Layers 3–4 and Layer 5 boundaries | Template regions, safe zones, or layout implementation in Volume 02 |
| **Volume 04 — Artwork Intelligence** | Downstream consumer of visual boundaries; owns selection and BVS policy | Selection logic, occasion semantics, or Preference Surfaces in Volume 02 |
| **Volume 05 — Signature Collections** | Downstream consumer of asset character rules; owns library operations | Collection release, retirement, or membership governance in Volume 02 |

#### Worked ownership example — global exclusion versus collection membership

| Scenario | Principal subject | Owner |
|----------|-------------------|-------|
| Neon gradients are prohibited across all F.I. Forgot visuals | Global visual exclusion | Volume 02 — Layer 5 Exclusions |
| A specific illustration is excluded from the Holiday Signature Collection | Collection membership exclusion | Volume 05 — library operations |
| The illustration violates brand identity regardless of collection | Identity-level eligibility | Volume 02 — Layers 3 and 5 |

Global prohibitions and identity violations remain Volume 02 authorities. Collection-scoped inclusion and exclusion remain Volume 05 authorities. Volume 05 membership rules MUST NOT weaken Volume 02 identity or exclusion boundaries.

### 9.2 Cross-system boundaries

| System | Boundary |
|--------|----------|
| **Writing Engine** | Owns message wording. Volume 02 does not govern message text generation per `FI-DSN-GOV-004` Section 12 |
| **Brain Architecture** | Owns message intent expression. Volume 02 does not define expression policy |
| **Brain Runtime** | Governed by `FI-DSN-GOV-004`. Volume 02 supplies Compliance Boundary inputs only |
| **Product / UI** | Owns editor behavior and implementation. Volume 02 does not specify UI flows |
| **Research Library** | Owns fact verification. Volume 02 does not verify evidence |
| **Metadata** | `FI-DSN-GOV-002` owns field semantics. Visual Source provenance is recorded separately per `FI-DSN-CLS-001` and `OQ-DSN-003` |

### 9.3 Volume 02 versus Volume 03 — decision rule

| If the rule… | Owner |
|--------------|-------|
| Remains true when the product surface changes (card, invitation, digital) | Volume 02 — typically Layer 4 or Layer 5 |
| References regions, templates, safe zones, coordinates, or bleed | Volume 03 |

#### Architectural examples (non-normative illustrations)

| Scenario | Principal subject | Owner |
|----------|-------------------|-------|
| Message should dominate inside panel visually | Composition philosophy | Volume 02 — Layer 4 |
| Inside panel allocates vertical space between message and art regions | Surface layout | Volume 03 |
| Artwork must not crowd handwriting legibility | Composition principle | Volume 02 — Layer 4 |
| Hero image slot sits above message region in a template | Template structure | Volume 03 |
| Minimum clear space around handwriting for production | Safe area / manufacturing integration | Volume 03 (with Volume 01 constraints) |
| Premium cards may use higher visual density as brand posture | Premium presentation philosophy | Volume 02 — Layer 2 |
| Premium compositions may use denser element relationships | Premium relational presentation | Volume 02 — Layer 4 |
| Premium inside template uses full-bleed art variant | Template variant | Volume 03 |
| Whitespace should feel generous and calm | Composition principle | Volume 02 — Layer 4 |
| Inside margin is defined in standard template | Layout implementation | Volume 03 |
| User-uploaded photos must not overpower message | Composition and exclusion principles | Volume 02 — Layers 4 and 5 |
| Upload crop UI defaults to portrait center | Product behavior | Product (outside Design Library architecture) |

### 9.4 Volume 02 versus Volume 04 — decision rule

| Concern | Volume 02 | Volume 04 |
|---------|-----------|-----------|
| Visual character | What a treatment **may be** (identity, element boundaries) | — |
| Visual eligibility (identity) | Whether a treatment **violates** identity or exclusion rules | — |
| Contextual eligibility | — | Whether a treatment **fits** occasion or relationship context |
| Contextual selection | — | Which **permitted** alternative applies (`CLS-BVS`, `CLS-OEC`) |
| Brain decision-making | Supplies Compliance Boundary inputs | Owns Preference Surfaces and BVS policy per `FI-DSN-GOV-004` |
| Personalization | Prominence and treatment principles | Personalization policy where principal (`CLS-PER`) |
| Artwork style | Style **boundaries** (on-brand / excluded) | Style **selection** among permitted styles |

#### Worked ownership example — customer-uploaded photo

1. **Volume 02 Layer 5:** Prohibited content classes (exclusion).
2. **Volume 02 Layer 4:** Uploaded imagery must not overpower message prominence (composition principle).
3. **Volume 02 Layer 3:** Photography character rules for acceptable tone and fidelity (element system).
4. **Volume 04:** Whether upload is offered for occasion/relationship; personalization boundaries.
5. **Volume 03:** Upload slot placement and crop safe area in template.
6. **`FI-DSN-GOV-004`:** Brain must not recommend out-of-boundary treatments.

---

## 10. Volume Relationships

### 10.1 Upstream — Volume 01

Volume 02 SHALL identify applicable `FI-MFG-*` manufacturing constraints for visual scope and treat them as Compliance Boundary inputs. Volume 02 MUST NOT duplicate `FI-MFG-*` normative bodies.

### 10.2 Downstream — Volume 03

Volume 03 consumes Volume 02 element systems, composition principles, and visual boundaries when implementing card architecture, templates, and surface layout.

### 10.3 Downstream — Volume 04

Volume 04 consumes Volume 02 visual boundaries when governing artwork selection, occasion treatment, personalization, and Brain Visual Selection policy.

### 10.4 Downstream — Volume 05

Volume 05 consumes Volume 02 asset character rules when governing collection membership, consistency, and release criteria.

### 10.5 Alignment with `FI-DSN-VOL-001`

#### Volume 02 required categories

| VOL-001 Volume 02 required category (`FI-DSN-VOL-001` Section 19.4) | Architectural layer |
|-----------------------------------------------------------------------|---------------------|
| Design language principles | Layer 1; Layer 4 when relational composition principles are the principal subject |
| Color governance | Layer 3 |
| Typography governance | Layer 3 |
| Illustration or artwork direction | Layer 3 |
| Brand expression boundaries | Layer 2 |
| Visual exclusions | Layer 5 — Exclusions |
| Accessibility or visual quality foundations | Layer 5 — Accessibility Foundations / Visual Quality Foundations |

Layer 4 — Composition Principles is the architectural home for **domain-agnostic relational discipline** within Volume 02. Future standards whose principal subject is relational composition map to Layer 4 and satisfy composition aspects of the **Design language principles** Required category. This document does not add categories to `FI-DSN-VOL-001`.

#### Volume 02 Composition Principles versus Volume 03 Layout and composition

`FI-DSN-VOL-001` Section 19.4 assigns **Layout and composition** as a **Required** category in Volume 03, not Volume 02. This architecture harmonizes with that split:

| Subject | Primary Volume | Architectural home |
|---------|----------------|-------------------|
| Relational composition — hierarchy, balance, prominence, density, cropping philosophy, message-vs-visual discipline independent of any specific surface | **02** | Layer 4 — Composition Principles |
| Surface layout — template regions, coordinates, safe areas, bleed integration, surface-bound spatial organization | **03** | Card Design System layout and template standards |

Volume 03 layout standards **consume** Volume 02 Composition Principles. Volume 02 MUST NOT author surface-bound layout rules. Volume 03 **Structurally Complete** posture for **Layout and composition** remains governed by `FI-DSN-VOL-001` Section 19.4 and Section 18.5; this document does not declare Volume 03 completion.

Volume 02 **Structurally Complete** posture remains governed by `FI-DSN-VOL-001` Section 19.4. This architecture document does not declare volume completion.

---

## 11. Asset Lifecycle Ownership

Reusable visual assets are governed by **lifecycle stage**, not by asset type alone.

For permanent collection membership intake, constitutional dependency order places Volume 06 **before** Volume 05 library belonging per `FI-DSN-VOL-001` Section 6.4: Volume 04 contextual application and selection → Volume 06 visual artifact realization and Governed Production-Ready Artifact approval → Volume 05 library operations (Volume 05 consumes Governed Production-Ready Artifacts at collection intake per harmonized Volume 05 architecture Section 2.1).

| Lifecycle stage | Architectural owner | Governs |
|-----------------|---------------------|---------|
| **Asset character** | Volume 02 — Layer 3 | What photography, illustration, icons, decorative elements, and backgrounds may look like |
| **Asset eligibility (identity)** | Volume 02 — Layers 3 and 5 | Whether a treatment violates identity, element, or exclusion rules |
| **Contextual eligibility** | Volume 04 | Whether a permitted treatment fits occasion, relationship, or selection context |
| **Surface placement** | Volume 03 | How assets occupy card and envelope surfaces |
| **Contextual selection** | Volume 04 | Which eligible asset applies in a given context |
| **Visual artifact realization and GPRA approval** | Volume 06 — Creative Production | Declared production intent through Realization, Review Determination, Approval, Governed Production-Ready Artifact status, and Governed Handoff |
| **Library operations** | Volume 05 | Collection membership, release, retirement, and consistency |

**Permanent rule:**

> **Volume 02 governs what assets may be. Volume 03 governs where assets sit. Volume 04 governs which assets apply when. Volume 06 governs how permitted visual artifacts become Governed Production-Ready. Volume 05 governs how asset libraries run.**

Licensed artwork, third-party assets, internally created artwork, AI-generated imagery, and future asset types map into this lifecycle without architectural revision to the **asset-type mapping** posture. Mapping an asset type into the lifecycle does not bypass the Volume 06 realization stage or substitute identity permission for production-readiness approval. Visual source provenance is recorded as planning metadata per `FI-DSN-CLS-001`; provenance does not determine Primary Volume.

### 11.1 Harmonization with `CLS-ART` — Artwork eligibility

`FI-DSN-CLS-001` defines `CLS-ART` as owning artwork eligibility and artwork-boundary rules at the classification level. This architecture **consumes** that definition without redefining it:

| Eligibility type | Principal subject | Architectural owner |
|------------------|-------------------|---------------------|
| **Identity-level eligibility** | Whether a treatment violates identity, element, or exclusion rules regardless of occasion or collection | Volume 02 — Layers 3 and 5 |
| **Contextual eligibility** | Whether a permitted treatment fits occasion, relationship, or selection context | Volume 04 |

When artwork **character** is principal, Primary Classification is typically `CLS-ILL`, `CLS-PHO`, or `CLS-ART` per `FI-DSN-CLS-001` Section 10. When **identity-level eligibility** is principal, Volume 02 remains authoritative. When **contextual eligibility** or selection is principal, Volume 04 remains authoritative per the principal-subject rule in `FI-DSN-VOL-001` Section 14.1.

---

## 12. Composition Authority

### 12.1 Why composition is independent

Visual order is a **relational** property. It emerges from relationships among elements, not from any single element domain.

| Authority | Why it cannot fully own composition |
|-----------|-------------------------------------|
| Typography | Owns type behavior, not art-vs-text prominence |
| Color / Illustration / Photography | Own medium character, not cross-element hierarchy |
| Card templates (Volume 03) | Own surface structure, not domain-agnostic balance philosophy |
| Product / UI | Own implementation, not library-wide visual discipline |
| Brain Architecture | Owns message intent, not visual presentation policy |
| Brain Visual Selection (Volume 04) | Owns which permitted treatment is selected, not which relationships are permitted |

### 12.2 Composition versus layout

| Concept | Volume | Abstraction |
|---------|--------|-------------|
| **Composition Principles** | 02 — Layer 4 | Domain-agnostic relational discipline |
| **Surface layout** | 03 | Template regions, coordinates, safe areas |
| **Manufacturing integration** | 01 / 03 | Production feasibility and structural constraints |

When `CLS-CMP` is principal and the subject is **relational discipline**, Primary Volume is **02**. When `CLS-CMP` is principal and the subject is **surface structure**, Primary Volume is **03** per `FI-DSN-VOL-001` Section 14.1.

### 12.3 Harmonization with `CLS-CMP` — Composition and Layout

`FI-DSN-CLS-001` defines `CLS-CMP` — Composition and Layout — as owning spatial organization, region relationships, placement discipline, and layout-boundary rules within governed card or presentation surfaces. `FI-DSN-CLS-001` Section 11 lists **dual informational affinity**: Composition and Layout may appear in both Volume 02 Design Language and Volume 03 Card Design System. Affinity is planning guidance only; **principal normative subject** determines Primary Volume per `FI-DSN-VOL-001` Section 14.1.

This architecture preserves Layer 4 and harmonizes with the frozen `CLS-CMP` definition as follows:

| `CLS-CMP` principal subject | Primary Volume | Layer / domain |
|----------------------------|----------------|----------------|
| Relational discipline among visual elements — hierarchy, balance, prominence, density, cropping philosophy — **without** binding to a specific template or surface | **02** | Layer 4 — Composition Principles |
| Surface-bound layout — template regions, coordinates, safe areas, region allocation, bleed integration | **03** | Card Design System — Layout and composition category |

A single future standard MUST NOT combine both subjects without governed split per `FI-DSN-VOL-001` Section 14.1 split rule. This document does not redefine `CLS-CMP`; it assigns architectural placement for standards classified under the existing code.

---

## 13. Standard Placement Guidance

### 13.1 Placement rules

1. Identify the standard's **principal normative subject** per `FI-DSN-VOL-001` Section 14.1.
2. Map the subject to the **lowest applicable architectural layer** in this document.
3. Assign **Primary Classification** per `FI-DSN-CLS-001` independently of layer mapping.
4. Assign **Primary Volume 02** only when Volume 02 owns the principal subject.
5. For premium presentation topics: **premium posture or philosophy** → Layer 2; **premium relational presentation among elements** → Layer 4.
6. Record cross-volume dependencies in `FI-DSN-REG-001` **Dependencies**; dependencies do not transfer ownership.
7. Record **Primary Volume** in REG **Notes** per `FI-DSN-VOL-001` Section 14.2 until `OQ-DSN-008` resolves.

### 13.2 Prohibited placements

| Prohibited action | Rationale |
|-------------------|-----------|
| Placing template layout rules in Volume 02 | Volume 03 owns surface implementation |
| Placing selection logic in Volume 02 | Volume 04 owns contextual selection |
| Placing collection operations in Volume 02 | Volume 05 owns library governance |
| Creating local `CLS-*` codes via this architecture | `FI-DSN-CLS-001` owns classification taxonomy |
| Using visual source as primary classification | `FI-DSN-CLS-001` Section 4 |

### 13.3 Disposition guidance

Future Volume 02 standards SHALL use authorized Layer B dispositions per `FI-DSN-GOV-001` Section 6.4 and `FI-DSN-TPL-001`. This Volume Governance document is not a Layer B Design Standard and does not reserve `FI-DSN-{PRN|STD|CON|POL|SYS}-###` identifiers for architectural prose.

---

## 14. Future Architectural Domains

The following domains are implied by this architecture. **No Standard IDs are assigned.** **No register population occurs in this document.** Drafting order is governed by `FI-DSN-QUE-001`.

### Layer 1 — Visual Intent

- Emotional design principles
- Visual philosophy and identity reasoning

### Layer 2 — Brand Expression

- Brand expression boundaries
- Identity presentation discipline
- Premium brand presentation philosophy

### Layer 3 — Visual Element Systems

- Typography system governance
- Color system governance
- Illustration direction and boundaries
- Photography direction and boundaries
- Cross-medium artwork character governance
- Icon and decorative element governance
- Background and texture governance

### Layer 4 — Composition Principles

- Visual hierarchy principles
- Whitespace and balance discipline
- Message-vs-visual prominence rules
- Cropping and scaling philosophy
- User-supplied imagery treatment principles
- Premium presentation composition philosophy
- Multi-surface visual rhythm (non-template)

### Layer 5 — Visual Boundaries and Foundations

- Visual exclusion and prohibited treatments
- Accessibility and inclusion visual foundations
- Visual quality assurance foundations (library-level)

### Domains explicitly outside Volume 02

| Domain | Home |
|--------|------|
| Card architecture, templates, safe zones | Volume 03 |
| Surface layout and artwork placement implementation | Volume 03 |
| Envelope/exterior structural presentation | Volume 03 when `CLS-EEP` is principal |
| Artwork selection, occasion semantics, personalization policy | Volume 04 |
| Brain Visual Selection and Preference Surfaces | Volume 04 |
| Collection governance, release, retirement | Volume 05 |
| Manufacturing integration when feasibility is principal | Volume 01 / 03 (`CLS-MFI`) |

---

## 15. Architectural Constraints

### 15.1 Stability constraints

1. New visual domains MUST map into existing five layers unless governed `FI-DSN-VOL-001` revision authorizes architectural expansion.
2. Layer merges or eliminations REQUIRE governed revision of this document and impact review per `FI-DSN-GOV-001` Section 15.
3. This architecture MUST remain valid across branding refresh, vendor change, Brain expansion, new media, and new product families without structural redesign.

### 15.2 Authority constraints

1. Volume 02 MUST NOT create metadata fields, queue states, identifier families, or `CLS-*` codes.
2. Volume 02 MUST NOT verify facts or define epistemic categories.
3. Volume 02 MUST NOT define Brain algorithms or runtime behavior.
4. Volume 02 supplements MUST NOT widen `FI-DSN-GOV-003` or `FI-DSN-GOV-004` library-wide minimums per `FI-DSN-VOL-001` Section 20.

### 15.3 Implementation constraints

This document MUST NOT specify fonts, colors, spacing values, artwork styles, illustration rules, photography rules, logo specifications, template dimensions, bleed, safe areas, manufacturing measurements, Brain algorithms, or runtime behavior.

---

## 16. Open Planning Questions

| ID | Question | Status | Safe default |
|----|----------|--------|--------------|
| `OQ-VIS-002` | Should the permanent document title emphasize "Visual Design Architecture" or harmonize literally with frozen volume name "Design Language"? | Open — naming | Volume number and Primary Volume unchanged; descriptive title may specialize |
| `OQ-VIS-005` | Should premium presentation be a named architectural sub-domain under Layers 2 and 4 or remain distributed? | Open — organizational | Distributed until drafting reveals consolidation need |
| `OQ-VIS-008` | How much localization-specific visual rules belong in Volume 02 versus downstream volumes? | Open — scope | Identity-level rules in Volume 02; market-specific campaign visuals downstream |
| `OQ-DSN-003` | Visual Source controlled metadata schema | Open — inherited | Volume 02 architecture proceeds; provenance-referencing standards defer |
| `OQ-DSN-008` | Primary Volume canonical metadata field | Open — inherited | REG **Notes** convention per `FI-DSN-VOL-001` Section 14.2 |
| `OQ-DSN-009` | Separate volume governance document timing | Partially resolved for Volume 02 — open for Volumes 03–05 per frozen `FI-DSN-VOL-001` | Volume 02 governance requirement is satisfied by this document; the broader `OQ-DSN-009` remains open for other production volumes until resolved by authorized `FI-DSN-VOL-001` revision |
| `OQ-CLS-001` | Cross-volume classification justification | Open — inherited | `FI-DSN-VOL-001` Section 13.1 table |

---

## 17. Architecture Validation

Before freeze of this document, Architecture Validation MUST confirm:

| Check | Pass criterion |
|-------|----------------|
| Document class | Volume Governance per `FI-DSN-GOV-001` Section 5 |
| Five-layer model | Layers 1–5 defined with purposes and boundaries |
| P11 Message primacy | Principle present and non-implementational |
| Composition authority | Layer 4 independent; cross-authority denial documented |
| Volume 03 boundary | Decision rule and examples present |
| Volume 04 boundary | Character vs selection matrix present |
| Asset lifecycle | Lifecycle ownership table complete |
| VOL-001 alignment | Required category mapping and composition split in Section 10.5 |
| CLS-001 harmonization | `CLS-BEX`, `CLS-ACI`, `CLS-CMP`, and `CLS-ART` consumed per Sections 11.1 and 12.3 |
| No implementation rules | No fonts, colors, dimensions, algorithms, or runtime policy |
| No unauthorized extensions | No new metadata, identifiers, classifications, or queue states |
| Authority non-leakage | Section 4.2 and Section 9 boundaries respected |
| GOV-003 / GOV-004 | No redefinition; boundaries preserved |

---

## 18. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.1 Draft | July 28, 2026 | F.I. Forgot | Harmonization Sprint H3 — Section 11 lifecycle extension: Volume 06 visual artifact realization and GPRA approval stage inserted; constitutional dependency V04→V06→V05; permanent rule harmonized; post-table asset-type clarification; Version 1.0 Frozen baseline preserved in revision history |
| 1.0 | July 23, 2026 | F.I. Forgot | Frozen — promoted to Frozen Volume Governance; Formal Freeze Review Outcome A (Freeze Eligible); FR-VIS-MIN-001 (`FI-DSN-VOL-001` identifier consistency in P10); architecture unchanged from Version 0.2 Draft; freeze date July 23, 2026 |
| 0.2 Draft | July 23, 2026 | F.I. Forgot | Sprint D2.1 refinement — Architecture Review findings AR-VIS-001 through AR-VIS-010: CLS-001 code corrections (`CLS-BEX`, `CLS-ACI`); VOL-001 Layer 4 and Vol 03 Layout and composition harmonization; `CLS-CMP` and `CLS-ART` harmonization; `OQ-DSN-009` partial resolution posture; premium placement tie-breaker; Vol 02/05 exclusion example; conceptual dependency diagram note; P11 negative examples |
| 0.1 Draft | July 23, 2026 | F.I. Forgot | Sprint D2.1 — initial Visual Design Architecture Volume Governance draft: five-layer model; P11 Message Primacy; Composition Principles authority; asset lifecycle ownership; Volume 02/03/04 boundary architecture; standard placement guidance; future domain inventory; validation gate |

### Future revision notes

Revision to a frozen Volume Governance baseline SHOULD occur only after architecture review, refinement as needed, and formal freeze review. Conditions that would trigger revision include: change to layer model, composition authority split, asset lifecycle ownership, or cross-volume boundary rules.

---

**End of Document**
