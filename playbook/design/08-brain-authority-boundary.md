# F.I. Forgot Design Library

# FI-DSN-GOV-004 — Brain Authority Boundary

## 1. Document Control

| Field | Value |
|-------|-------|
| **Governance identifier** | FI-DSN-GOV-004 |
| **Title** | Brain Authority Boundary |
| **Document** | `08-brain-authority-boundary.md` |
| **Sprint** | D1.9 |
| **Artifact type** | Brain authority governance standard |
| **Status** | Frozen Governance Standard |
| **Version** | 1.0 |
| **Date** | July 23, 2026 |
| **Freeze date** | July 23, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Governing authority** | `FI-DSN-GOV-001` — Design Standards Governance (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Epistemic reference** | `FI-DSN-GOV-003` — Evidence vs Company Judgment Governance (Frozen Governance Standard, Version 1.0, July 23, 2026) |
| **Metadata reference** | `FI-DSN-GOV-002` — Design Library Metadata Standard (Frozen Governance Standard, Version 1.0, July 22, 2026) |
| **Identifier reference** | `FI-DSN-ID-001` — Design Identifier System (Frozen Identifier System, Version 1.0, July 22, 2026) |
| **Register reference** | `FI-DSN-REG-001` — Design Planning Register (Frozen Planning Register, Version 1.0, July 22, 2026) |
| **Queue reference** | `FI-DSN-QUE-001` — Design Drafting Queue (Frozen Design Drafting Queue, Version 1.0, July 23, 2026) |
| **Classification reference** | `FI-DSN-CLS-001` — Design Classification Strategy (Frozen Classification Strategy, Version 1.0, July 22, 2026) |
| **Template reference** | `FI-DSN-TPL-001` — Design Standard Template (Frozen Governance Template, Version 1.0, July 22, 2026) |
| **Research reference** | `playbook/research/README.md` — Research Library governance |
| **Upstream governance** | `playbook/design/00-design-standards-governance.md`; `playbook/design/01-design-standard-template.md`; `playbook/design/02-design-classification-strategy.md`; `playbook/design/03-design-identifier-system.md`; `playbook/design/04-design-library-metadata-standard.md`; `playbook/design/05-design-planning-register.md`; `playbook/design/06-design-drafting-queue.md`; `playbook/design/07-evidence-vs-company-judgment-governance.md`; `playbook/design/README.md` |
| **Downstream consumers** | Design Standards in Volumes 02 through 05; Brain Visual Selection (`CLS-BVS`) standards; future Volume Roadmap; future automation |

**Standard statement:** F.I. Forgot maintains **one authoritative Brain authority boundary** for the Design Library that distinguishes governance authority, factual authority, policy authority, runtime authority, and execution authority as complementary dimensions — not hierarchical layers. The Research Library answers what is true. Company Judgment answers, given what is true, what policy F.I. Forgot adopts. Frozen Design Standards freeze **Compliance Boundaries** and authorized **Preference Surfaces**. Brain Runtime recommends and ranks within Preference Surfaces; it does not legislate. Product Implementation enforces compliance; it does not govern. Recommendations SHALL NOT become Design Requirements. Company Judgment SHALL NOT alter factual truth.

**Source basis:** Company judgment. This Brain authority boundary model is an F.I. Forgot governance choice. It is not derived from vendor facts, verified evidence, or Brain runtime behavior.

---

## 2. Purpose

This document is the **authoritative Brain authority governance standard** for the Design Library.

Brain Authority Boundary answers: **What may the Brain decide at runtime, what must frozen Design Standards decide as policy, what does the Research Library establish as verified factual truth, what does Product Implementation enforce, and how do these authorities interact without runtime behavior silently redefining frozen governance?**

This document:

- Defines the **orthogonal authority model** and governed terminology for Brain, runtime, and Design Library interaction
- Operationalizes the Brain authority policies in `FI-DSN-GOV-001` Section 11
- Governs **Compliance Boundaries**, **Preference Surfaces**, recommendation versus requirement distinction, customer override classes, authority escalation, and capability expansion
- Establishes **drafting and freeze gates**, **Boundary Validation**, and a **Freeze Gate** for Brain-boundary-governing work
- Defines the boundary between **authority categories** (this document) and **epistemic categories** (`FI-DSN-GOV-003`)

This document does **not**:

- Author Brain algorithms, prompts, scoring models, routing logic, or message-generation rules
- Redefine epistemic taxonomy or canonical metadata fields (`FI-DSN-GOV-003`, `FI-DSN-GOV-002`)
- Verify facts, promote evidence, or schedule Brain work through register or queue operations
- Author normative visual, manufacturing, or volume-specific design policy bodies
- Define implementation schemas, APIs, databases, automation, UI, or repository tooling

---

## 3. Scope

### In scope

- Orthogonal authority dimensions: governance, factual, policy, runtime, and execution
- Governed terminology: Brain, Brain Architecture, Brain Runtime, Writing Engine, Runtime, Product Implementation, Design Library, Design Standard
- Decision taxonomy: Brain-exclusive, never-delegated, standard-required, evidence-informed, and company-judgment-permitted domains
- Compliance Boundary and Preference Surface model and enclosure invariant
- Recommendation, Selection, Decision, and Enforcement authority chain
- Runtime behavior governance and adaptive-runtime versus adaptive-policy distinction
- Customer Override taxonomy (Classes I–IV) operationalizing `FI-DSN-GOV-001` Section 11.4
- Research Library and epistemic boundary cross-reference to `FI-DSN-GOV-003`
- Writing Engine boundary and Manufacturing boundary
- Authority Escalation and jurisdictional conflict governance
- Capability Expansion five-classification governance
- Drafting gates, freeze gates, Boundary Validation, Boundary Change Control, and Freeze Gate
- Disposition- and volume-specific boundary applicability
- Harmonization with `FI-DSN-GOV-001` Section 11
- Relationship boundaries to all frozen Design Library governance artifacts

### Out of scope

- Prompt engineering, LLM implementation, agent orchestration, and runtime algorithms
- Brain Architecture document authoring (cross-library; informational unless explicitly bound elsewhere)
- Writing engine policy drafting beyond boundary acknowledgment
- Volume Roadmap creation
- Layer B Design Standard body drafting for Volumes 02 through 05
- Epistemic taxonomy redefinition (`FI-DSN-GOV-003`)
- Metadata field redefinition or new Planning Register columns or Drafting Queue states
- Implementation mechanics, scripts, schemas, or automation

---

## 4. Authority Model

### 4.1 Orthogonal authority dimensions

Brain Authority Boundary governs five **complementary authority dimensions**. These dimensions operate concurrently. They are not sequential governance layers. Company Judgment is not subordinate to Research Library factual authority.

| Dimension | Question answered | Primary owner |
|-----------|-------------------|---------------|
| **Governance authority** | What rules bind all other dimensions? | Frozen GOV, STD, and MFG corpus |
| **Factual authority** | What is true? | Research Library |
| **Policy authority** | Given what is true, what policy does F.I. Forgot adopt? | Company Judgment recorded in frozen standards and governance |
| **Runtime authority** | What is proposed or selected at runtime within bounds? | Brain Runtime, Writing Engine, customer where permitted |
| **Execution authority** | What does the system actually enforce? | Product Implementation |

### 4.2 Complementarity rules

| Rule | Requirement |
|------|-------------|
| Facts inform policy | Verified facts MAY inform policy but do not replace explicit Company Judgment where adoption is a choice |
| Policy does not falsify facts | Company Judgment SHALL NOT alter factual truth, promote facts, or masquerade as verified evidence per `FI-DSN-GOV-003` |
| Governance constrains all | Frozen governance is the compliance ceiling for factual, policy, runtime, and execution dimensions |
| Runtime does not govern | Brain Runtime and Writing Engine consume governed inputs; they do not amend governance or standards |
| Execution does not legislate | Product Implementation enforces frozen policy; it MUST NOT widen Preference Surfaces or narrow Compliance Boundaries without governed revision |

### 4.3 Dimension ownership summary

| Dimension | Owns | Does NOT own |
|-----------|------|--------------|
| Governance authority | Lifecycle, freeze, boundary rules, normative obligations | Factual verification, runtime proposals, implementation code |
| Factual authority | Verification, promotion, retirement of facts | Policy adoption, Brain boundaries, customer override permission |
| Policy authority | Adoption, scope, conservatism, override posture where permitted | Factual truth, Brain algorithms, silent boundary change |
| Runtime authority | Recommendations, rankings, default selections, message wording | Compliance Boundaries, verified facts, normative requirements |
| Execution authority | Validation, enforcement, telemetry | Policy creation, governance amendment, fact promotion |

### 4.4 Conceptual authority diagram

```
Governance Authority (frozen GOV / STD / MFG)
        │ constrains all dimensions
        ├──────────┬──────────┬──────────┬──────────┐
        ▼          ▼          ▼          ▼
 Factual      Policy      Runtime     Execution
 Authority    Authority   Authority   Authority
 (Research    (Company    (Brain /    (Product
  Library)     Judgment)   Runtime)    Implementation)
 "What is      "What       "What is    "What is
  true?"        policy?"   proposed?"  enforced?"
        │          ▲
        └──── informs ─────┘
              (does not replace)

Runtime proposes or selects within bounds. Execution enforces.
Neither owns policy. Neither is subordinate to the other in
authority ownership; execution validates runtime output.
```

---

## 5. Boundary Principles

The following principles govern Brain authority across the Design Library:

1. **Governance binds all dimensions.** Frozen governance is the compliance ceiling. No runtime, Brain, customer, or implementation action amends it without governed revision.
2. **Facts and policy are complementary.** The Research Library answers what is true. Company Judgment answers what policy F.I. Forgot adopts given truth. Neither dimension replaces the other.
3. **Standards express policy; Brain proposes within bounds.** Design Standards freeze Compliance Boundaries and authorized Preference Surfaces. Brain Runtime recommends; it does not legislate.
4. **Preference Surfaces are enclosed.** Every Preference Surface MUST remain completely enclosed within its governing Compliance Boundary per Section 7.
5. **Recommendations are not requirements.** The Recommendation → Selection → Decision → Enforcement chain in Section 8 preserves advisory versus binding posture at each stage.
6. **Implementation enforces; it does not govern.** Product Implementation validates and executes. It MUST NOT silently widen Preference Surfaces or narrow Compliance Boundaries.
7. **Override changes selection, not law.** Customer Override per Section 10 alters chosen treatment only within governed classes; it does not change Compliance Boundaries.
8. **Brain outputs are operational unless epistemically governed.** Recommendations, rankings, and selections are runtime artifacts per Section 11. They enter `FI-DSN-GOV-003` categories only when used as inference, assumption, or research input — never as verified evidence.
9. **Adaptive runtime, frozen policy.** Runtime MAY adapt recommendations, selections, and implementation behavior within bounds. Policy and governance adapt only through governed amendment per Section 9.
10. **Capability expansion is governed admission.** New Brain decision domains require governance classification before they acquire runtime authority per Section 16.
11. **Escalation follows authority ownership.** Authority Escalation in Section 14 determines jurisdictional resolution — separate from epistemic conflict governance in Section 15.2 and `FI-DSN-GOV-003` Section 9.
12. **Library-wide minimums.** This document owns cross-library Brain boundary minimums. Volume supplements and `CLS-BVS` standards MAY specialize without weakening gates per Section 21.

---

## 6. Governed Terminology and Decision Taxonomy

### 6.1 Governed terminology

Future Design Standards and governance documents MUST use the following terms precisely. Interchangeable use is PROHIBITED.

#### Brain

| Attribute | Definition |
|-----------|------------|
| **Definition** | Collective name for F.I. Forgot's message-and-context intelligence layer on the expression side, excluding Design Library presentation policy |
| **Authority owned** | Message-side reasoning domain (conceptual umbrella) |
| **Authority not owned** | Visual Compliance Boundaries, manufacturing policy, fact verification, normative Design Requirements |
| **Governing constraints** | `FI-DSN-GOV-001` Section 11; this document; Brain Architecture (informational unless cross-library binding per `OQ-DSN-004`) |

#### Brain Architecture

| Attribute | Definition |
|-----------|------------|
| **Definition** | Cross-library documentation layer defining message intent, relationship context, and occasion reasoning principles |
| **Authority owned** | Expression-side architectural intent and reasoning boundaries external to the Design Library freeze |
| **Authority not owned** | Design presentation rules, Brain algorithms in product code, Design Standard obligations |
| **Governing constraints** | Informational to Design Library per `FI-DSN-GOV-001` Section 11.3 unless explicit cross-library binding; this document defines Design-side limits |

#### Brain Runtime

| Attribute | Definition |
|-----------|------------|
| **Definition** | Live product subsystem that produces recommendations, rankings, and selection proposals within governed Preference Surfaces |
| **Authority owned** | Runtime proposals: recommendations, rankings, contextual weighting, non-normative personalization signals |
| **Authority not owned** | Compliance Boundaries, verified facts, frozen requirements, customer override permission rules |
| **Governing constraints** | This document; frozen Design Standards **Brain Interaction** per `FI-DSN-TPL-001` Section 7; `FI-DSN-GOV-001` Section 11.4 |

#### Writing Engine

| Attribute | Definition |
|-----------|------------|
| **Definition** | Live product subsystem that produces message wording and voice outputs |
| **Authority owned** | Message text generation within expression authority |
| **Authority not owned** | Visual treatment selection, design compliance, governance interpretation |
| **Governing constraints** | Brain Architecture (informational); Section 12 of this document; not Design Library presentation authority |

#### Runtime

| Attribute | Definition |
|-----------|------------|
| **Definition** | Umbrella for live, non-frozen product behavior including Brain Runtime, Writing Engine, and selection orchestration |
| **Authority owned** | Time-varying proposals and selections within bounds |
| **Authority not owned** | Policy creation, standard amendment, fact promotion |
| **Governing constraints** | This document runtime dimension; Product Implementation MUST enforce frozen standards |

#### Product Implementation

| Attribute | Definition |
|-----------|------------|
| **Definition** | Engineering code, services, validation, and operational systems that enforce frozen policy |
| **Authority owned** | Execution, validation, telemetry, deterministic compliance checks |
| **Authority not owned** | Legislation of policy, governance amendment, epistemic promotion |
| **Governing constraints** | Frozen `FI-DSN-*`, `FI-MFG-*`, and GOV corpus; this document enforcement rules |

#### Design Library

| Attribute | Definition |
|-----------|------------|
| **Definition** | Frozen governance and standards corpus governing visual and physical presentation |
| **Authority owned** | Normative presentation policy via `FI-DSN-*` standards and GOV artifacts |
| **Authority not owned** | Brain algorithms, message wording, fact verification |
| **Governing constraints** | `FI-DSN-GOV-001`; `FI-DSN-GOV-003`; this document |

#### Design Standard

| Attribute | Definition |
|-----------|------------|
| **Definition** | Frozen Layer B artifact (`FI-DSN-{PRN\|STD\|CON\|POL\|SYS}-###`) expressing normative presentation policy |
| **Authority owned** | Compliance Boundaries and authorized Preference Surfaces for its scope |
| **Authority not owned** | Brain execution logic, runtime behavior specification, message generation rules |
| **Governing constraints** | `FI-DSN-TPL-001`; `FI-DSN-GOV-001`; `FI-DSN-GOV-003`; this document |

### 6.2 Decision taxonomy

| Classification | Domain | Authority owner | Frozen? |
|----------------|--------|-----------------|---------|
| **Brain-exclusive** | Message intent reasoning, relationship/occasion reasoning for expression, message wording (Writing Engine), ranking within Preference Surface, non-normative personalization signals | Brain Runtime / Writing Engine / Brain Architecture (informational) | No — runtime-varying |
| **Never delegated to Brain** | Compliance Boundaries, manufacturing feasibility, legal/safety, governance interpretation, fact promotion, standard freeze posture, mandatory visual exclusions | Governance / standards / Research Library | Yes where normative |
| **Standard-required** | Allowed visual treatments, override-eligible alternatives, collection constraints, Brain Interaction boundaries, customer-visible presentation promises | Frozen Design Standards | Yes |
| **Evidence-informed** | Factual claims grounding normative requirements about vendor capability, production limits, or external constraints | Research Library facts cited in standards | Facts frozen; applicability in standards |
| **Company-judgment-permitted** | Policy adoption where evidence informs but does not determine scope, conservatism, or customer-facing posture | Company Judgment disclosed per `FI-DSN-GOV-003` | Yes when normative |

---

## 7. Compliance Boundary and Preference Surface

### 7.1 Compliance Boundary

A **Compliance Boundary** is the frozen set of normative limits — SHALL, SHALL NOT, mandatory exclusions, and applicable manufacturing, legal, and safety constraints — within which all runtime behavior MUST remain.

Compliance Boundaries are expressed as Design Standard requirements (`{Standard ID}-R{nn}`), applicable `FI-MFG-*` obligations, and governing GOV rules. They are **Decision**-stage artifacts per Section 8.

### 7.2 Preference Surface

A **Preference Surface** is the governed set of **permitted alternatives** authorized within a Compliance Boundary. A Preference Surface defines what MAY be recommended, ranked, personalized, or selected — not what is mandatory.

Preference Surfaces are recorded in Design Standard **Brain Interaction** sections per `FI-DSN-TPL-001` Section 7 and related normative text. They are **Decision**-stage artifacts. Runtime MAY temporarily narrow or reorder within the surface for a specific user, context, occasion, or selection event; runtime MUST NOT widen it.

### 7.3 Enclosure invariant

> **Every Preference Surface MUST remain completely enclosed within its governing Compliance Boundary.**

This invariant is permanent and fundamental.

| Operation | Permitted on Preference Surface | Prohibited |
|-----------|--------------------------------|------------|
| **Narrowing** | MAY expose a subset of authorized alternatives | MUST NOT expose alternatives outside Compliance Boundary |
| **Ranking** | MAY order alternatives by contextual fit | MUST NOT rank excluded alternatives as permitted |
| **Personalization** | MAY weight alternatives using non-normative signals | MUST NOT use personalization to bypass exclusions |
| **Adaptation** | MAY vary presentation of the surface over time or context | MUST NOT adapt the Compliance Boundary itself |
| **Widening** | PROHIBITED without governed standard revision | MUST NOT add alternatives not authorized by frozen standards |
| **Bypassing exclusions** | PROHIBITED | MUST NOT treat mandatory exclusions as selectable |
| **Silent standard modification** | PROHIBITED | MUST NOT treat runtime behavior as amending frozen standards |

### 7.4 Recording model

| Concept | Primary record location |
|---------|-------------------------|
| Compliance Boundary | Governing Requirements and Design Requirements; applicable `FI-MFG-*`; Brain Interaction prohibitions |
| Preference Surface | Brain Interaction allowed-alternative enumeration; normative references to permitted treatments |
| Violation | Product Implementation enforcement failure; Authority Escalation per Section 14 |

### 7.5 Runtime narrowing permanence

Runtime MAY temporarily narrow a Preference Surface for a specific user, context, occasion, or selection event by exposing or prioritizing a subset of authorized alternatives. Runtime narrowing is an **operational action only**.

| Rule | Requirement |
|------|-------------|
| Operational action only | Runtime narrowing MUST NOT amend the frozen Preference Surface |
| No permanent removal | Runtime narrowing MUST NOT permanently remove an authorized alternative from frozen Decision-stage authorization |
| No new policy | Runtime narrowing MUST NOT create policy, prohibition, or Company Judgment |
| Permanent narrowing | Permanent narrowing of authorized alternatives is a **Decision**-stage policy change |
| Governed revision required | Permanent narrowing REQUIRES governed Design Standard revision, review, and re-freeze where applicable |
| Repetition does not create policy | Repeated runtime narrowing, telemetry patterns, model behavior, or product defaults MUST NOT become policy through repetition |

---

## 8. Recommendation, Selection, Decision, and Enforcement

### 8.1 Four-stage authority chain

| Stage | Actor | Authority | Binding posture | Frozen? | Governance implication |
|-------|-------|-----------|-----------------|---------|------------------------|
| **1. Recommendation** | Brain Runtime; Writing Engine for message variants | Runtime authority | **Advisory** | No | MUST NOT become `{Standard ID}-R{nn}` or Source support |
| **2. Selection** | Brain Runtime (default); Customer (Governed Override); operator only where standards permit | Runtime or customer within bounds | **Binding for instance only** | Rules frozen; instance varies | Selects one permitted alternative; does not change Compliance Boundary |
| **3. Decision** | Frozen Design Standards; Company Judgment disclosure; Research Library for facts only | Policy and governance authority | **Binding for policy/compliance** | Yes | Freezes Compliance Boundary and Preference Surface |
| **4. Enforcement** | Product Implementation | Execution authority | **Binding for system behavior** | Rules derived from frozen standards | MUST block or redirect out-of-bound selection |

### 8.2 Stage definitions

**Recommendation** — A non-normative proposed treatment produced by Brain Runtime or Writing Engine. Recommendations rank, suggest, and inform. They are operational runtime artifacts per Section 11.

**Selection** — The act of choosing one treatment from the Preference Surface. Selection binds the **instance** rendered or fulfilled. It does not bind or amend governance.

**Decision** — Policy-level determination frozen in Design Standards or governance: permitted alternatives, prohibitions, and override classes. Decisions express Company Judgment and/or evidence-backed policy as normative requirements.

**Enforcement** — Product Implementation validating that selection and runtime behavior remain within Compliance Boundaries and authorized Preference Surfaces.

### 8.3 Permanent chain rules

| Rule | Requirement |
|------|-------------|
| Brain recommends | Brain Runtime and Writing Engine produce Recommendations only |
| Selection chooses an instance | Selection chooses among authorized alternatives; it does not create policy |
| Standards decide policy | Design Standards and governance freeze Decision-stage boundaries |
| Implementation enforces compliance | Product Implementation enforces; it does not legislate |
| Recommendations are not requirements | Recommendations MUST NOT be cited as Design Requirements, `{Fact ID}`, or normative Source support |
| Runtime narrowing is not policy | Runtime narrowing per Section 7.5 is operational only; it does not amend Decision-stage authorization or create permanent prohibitions |

### 8.4 Implications for Brain Visual Selection standards

Standards with **Primary Classification** `CLS-BVS` govern **Decision**-stage boundaries only. They MUST NOT define recommendation algorithms, ranking formulas, or selection mechanics. They MUST NOT describe Brain Runtime behavior as normative requirement text.

---

## 9. Runtime Behavior Governance

### 9.1 Runtime within bounds

Runtime behavior MAY vary by context, customer, and session when remaining within frozen Compliance Boundaries and authorized Preference Surfaces.

Runtime behavior MUST:

- treat Brain Recommendations as advisory unless and until Selection occurs within bounds,
- enforce Compliance Boundaries through Product Implementation,
- escalate out-of-bound conditions per Section 14.

Runtime behavior MUST NOT:

- widen Preference Surfaces,
- remove mandatory exclusions,
- amend frozen standards,
- promote Brain outputs to verified evidence,
- treat runtime narrowing per Section 7.5 as permanent policy amendment.

### 9.2 Adaptive runtime versus adaptive policy

| Category | May vary at runtime? | Amendment path |
|----------|---------------------|----------------|
| **Adaptive implementation** | Yes — within bounds | Engineering change; MUST NOT widen bounds |
| **Adaptive recommendation** | Yes — ranking and weighting | None for governance if within frozen Preference Surface |
| **Adaptive selection** | Yes — default selection path | None if within Preference Surface |
| **Adaptive policy** | **No** | Governed standard or governance revision |
| **Adaptive governance** | **No** | `FI-DSN-GOV-001` Section 15 and Section 20 of this document |

### 9.3 Permanent rule

> **Runtime may adapt. Governance may not. Policy changes require governed revision.**

Learning systems, model updates, and contextual engines MUST be treated as adaptive implementation or recommendation — not adaptive policy.

Runtime narrowing per Section 7.5 does not amend frozen Preference Surface authorization. Model updates, telemetry, feedback loops, and repeated runtime behavior MUST NOT silently amend policy or permanently narrow authorized alternatives without governed revision.

---

## 10. Customer Override Governance

This section operationalizes `FI-DSN-GOV-001` Section 11.4.

### 10.1 Override taxonomy

| Class | Name | Definition | Permitted? | Effect |
|-------|------|------------|------------|--------|
| **I** | **Permitted Alternative Override** | Customer selects a different treatment explicitly authorized on the Preference Surface | Yes | Changes **selection** only; remains within Compliance Boundary |
| **II** | **Unavailable Alternative Request** | Customer requests a treatment outside the Preference Surface but potentially inside the Compliance Boundary | Conditional | MUST NOT be honored unless a frozen standard explicitly authorizes on-demand Preference Surface expansion; otherwise redirect to Class I alternatives per `OQ-DSN-006` |
| **III** | **Policy Exception Override** | Customer requests treatment requiring pre-frozen Company Judgment exception authorization | Conditional | Requires frozen CJ disclosure and explicit standard authorization; PROHIBITED as ad hoc runtime policy |
| **IV** | **Prohibited Override** | Customer requests treatment violating Compliance Boundary, manufacturing, legal, or safety | **No** | MUST be blocked by enforcement; no runtime governance amendment |

### 10.2 Distinctions

| Change type | What changes | What does NOT change |
|-------------|--------------|----------------------|
| **Selection change** | Chosen instance (Classes I–III where permitted) | Compliance Boundary |
| **Boundary change** | Compliance Boundary or Preference Surface authorization | PROHIBITED at runtime; requires governed standard revision |
| **Policy change** | Normative obligations | PROHIBITED at runtime; requires governed revision |
| **Compliance violation** | Nothing valid | Class IV; enforcement MUST block |

### 10.3 GOV-001 Section 11.4 mapping

| GOV-001 rule | This document |
|--------------|---------------|
| Brain recommends within approved standards | Recommendation within Preference Surface |
| Customer MAY override when allowed alternative exists | Class I |
| Override SHALL NOT violate frozen standards, MFG, feasibility, safety, legal | Class IV |
| Override changes selected treatment only | All classes: selection only, never boundary |

---

## 11. Research Library and Epistemic Boundary

### 11.1 Factual authority

The Research Library owns factual verification per `FI-DSN-GOV-003` and `playbook/research/README.md`. Brain Runtime, Writing Engine, and Product Implementation do not verify, promote, or retire facts.

### 11.2 Brain outputs and epistemic categories

Brain Authority Boundary governs **authority categories**. `FI-DSN-GOV-003` governs **epistemic categories**. They intersect; they do not merge.

| Brain output | GOV-004 classification | GOV-003 classification | May support frozen requirement? |
|--------------|------------------------|------------------------|--------------------------------|
| Recommendation | Operational runtime artifact | Not an epistemic category | No |
| Ranking / ordering | Operational runtime artifact | Not an epistemic category | No |
| Selection (instance) | Operational runtime artifact | Not an epistemic category | No |
| Preference scoring | Operational runtime artifact | Not an epistemic category | No |
| Personalization signal | Operational runtime artifact | Not an epistemic category | No |
| Brain log / telemetry | Research input at most | Research input until promoted | No |
| Brain-derived drafting hypothesis | Drafting inference | **Inference** per GOV-003 §5.6 | No — until promoted, CJ, or excluded |
| Planning assumption about Brain behavior | Planning assumption | **Assumption** per GOV-003 §5.3 | No — resolve before freeze |

### 11.3 Intersection rules

1. Operational Brain outputs MUST NOT become epistemic categories merely because Brain produced them.
2. `FI-DSN-GOV-003` gates apply when Brain-related material supports normative standard text.
3. `FI-DSN-GOV-004` gates apply when Brain-related behavior must be bounded.
4. Neither system promotes facts. Research Library promotion only.
5. Design Standard **Source** columns MUST NOT use "Brain recommendation" as a Source value per `FI-DSN-TPL-001` and `FI-DSN-GOV-003`.

---

## 12. Writing Engine Boundary

| Boundary | Rule |
|----------|------|
| Authority | Writing Engine owns message wording and voice within expression authority |
| Design Library | Does not govern message text generation |
| Brain Architecture | Informational reference for expression intent unless `OQ-DSN-005` resolves otherwise |
| Crossing point | Writing Engine outputs are Recommendations at the expression layer; they do not define visual Compliance Boundaries |
| Prohibition | Design Standards MUST NOT require specific message text, tone outputs, or relationship inferences per `FI-DSN-GOV-001` Section 11.2 |

---

## 13. Manufacturing Boundary

| Boundary | Rule |
|----------|------|
| Authority | `FI-MFG-*` manufacturing standards govern production feasibility, fulfillment, and operational production constraints |
| Compliance Boundary | Applicable manufacturing obligations form part of the Compliance Boundary for Brain and customer selection |
| Override | Customer Override Class IV includes manufacturing constraint violations |
| Informational reference | Manufacturing standards are binding constraints, not Brain logic |
| GOV-004 scope | This document does not redefine manufacturing requirements |

### 13.1 Brain recommendation and selection constraints

Brain Runtime MUST NOT recommend a treatment outside the governing Compliance Boundary, including applicable `FI-MFG-*` manufacturing and production obligations.

| Rule | Requirement |
|------|-------------|
| Infeasible treatments | A treatment that is visually preferred but manufacturing-infeasible is not eligible for recommendation or selection |
| Customer preference | Customer preference MUST NOT make an infeasible treatment eligible |
| Enforcement | Product Implementation MUST block or redirect infeasible recommendations and selections |
| Manufacturing facts | Manufacturing facts remain governed through the Research Library and `FI-DSN-GOV-003` |
| Capability change | If manufacturing capability changes, Research Library and GOV-003 propagation rules apply before Design policy changes |

---

## 14. Authority Escalation

Authority Escalation governs **jurisdictional disagreement** among authority dimensions and authority ownership.

Epistemic Conflict Governance — conflicts among evidence, inference, assumption, and Company Judgment — is governed by Section 15.2 of this document and `FI-DSN-GOV-003` Section 9. Capability Expansion Governance (Section 16) does not govern epistemic conflict resolution.

### 14.1 Escalation precedence

When authorities disagree, resolution ownership follows this order:

| Priority | Authority | Owns resolution when |
|----------|-----------|---------------------|
| 1 | Governance / frozen standards | Any conflict with runtime, Brain, customer, or implementation — Compliance Boundary wins |
| 2 | Research Library | Factual truth disputes |
| 3 | Company Judgment (frozen disclosure) | Policy adoption under uncertainty — disclosed; MUST NOT falsify facts |
| 4 | Brain Runtime / Writing Engine | Recommendation disputes within Preference Surface only |
| 5 | Customer (Governed Override) | Selection among permitted alternatives only |
| 6 | Product Implementation | Never owns policy resolution — escalates upward |

### 14.2 Situation matrix

| Situation | Resolution owner | Permitted override | Prohibited override | Freeze revisit? |
|-----------|------------------|--------------------|---------------------|-----------------|
| Brain recommendation vs Design Standard | Design Standard | Standard over Brain | Brain over standard | Only if standard requires governed revision |
| Customer request vs Design Standard | Design Standard unless Class I | Class I over default selection | Customer over Compliance Boundary | If new override class needed |
| Implementation vs Design Standard | Design Standard | Standard over implementation | Implementation over standard | Yes — if implementation correct but standard incomplete |
| Research change after deployment | Research Library → GOV-003 propagation | Updated facts inform revision | Facts silently rewrite frozen standards | Yes — when material per GOV-003 §10 |
| Company Judgment vs Brain recommendation | Frozen CJ / standard | Policy MAY differ with disclosure | CJ falsifying facts or removing boundaries without revision | Yes — if normative scope changes |
| Brain recommendation vs Brain recommendation | Brain Runtime within Preference Surface | Contextual ranking only | Either creating new alternatives | No |
| Selection outside Preference Surface | Enforcement blocks → standard/governance | None at runtime | Silent acceptance | Yes — if surface incomplete |

### 14.3 Non-override rules

| Source | May NEVER override |
|--------|-------------------|
| Brain Runtime | Compliance Boundary; verified fact record; frozen governance |
| Customer | Compliance Boundary; Class IV prohibitions; manufacturing/legal/safety |
| Product Implementation | Any frozen policy; widening bounds to "fix" violations |
| Company Judgment | Factual truth; freeze without governed revision |
| Research Library | Design policy; Brain boundaries; customer override permissions |

---

## 15. Conflict Governance

### 15.1 Jurisdictional conflicts

Section 14 governs jurisdictional conflicts among authority dimensions. This section governs remaining boundary conflicts not epistemic in nature.

| Conflict type | Resolution path |
|---------------|-----------------|
| Preference Surface ambiguity in standard | Governed clarification or revision; freeze blocked until resolved |
| Overlapping Compliance Boundaries across standards | Harmonize through scope restriction, decomposition, or governed revision |
| Brain Interaction section contradicts normative requirements | Normative requirements control; Brain Interaction MUST be reconciled before freeze |
| Volume supplement weakens library-wide gate | GOV-004 controls per Section 21 |
| Brain Architecture guidance vs frozen Design policy | Frozen Design governance and Design Standards control within Design Library presentation scope; Brain Architecture remains informational unless a separate governed cross-library authority makes it binding per `OQ-DSN-004`; MUST NOT be silently resolved by runtime implementation; material cross-library conflict MAY require open question, governance review, or future meta-governance decision |
| Manufacturing constraints vs Design alternatives | Manufacturing requirement remains part of Compliance Boundary per Section 13; conflicting Design alternative MUST be removed, restricted, or revised; Brain Runtime and Customer Override MUST NOT select it; Product Implementation MUST block or redirect per Section 14; if the Design Standard itself authorizes the conflicting alternative, governed standard revision is REQUIRED |

### 15.2 Epistemic conflicts

Epistemic conflicts among evidence, assumptions, and Company Judgment remain governed by `FI-DSN-GOV-003` Section 9. This document does not redefine epistemic taxonomy or escalation to the Research Library for fact-fact conflicts.

### 15.3 Prohibited conflation

Design Standards and governance documents MUST NOT compensate for Brain Architecture gaps by hard-coding message decisions into design rules per `FI-DSN-GOV-001` Section 11.2. Brain Runtime MUST NOT bypass design governance.

---

## 16. Capability Expansion Governance

### 16.1 Permanent rule

> **Capability deployment alone MUST NOT create new Brain authority.**

New Brain capabilities are governed admissions to existing authority dimensions — not autonomous runtime expansions.

### 16.2 Mandatory classifications before binding runtime effect

Every proposed new Brain capability MUST receive all five classifications before it may operate with binding runtime authority:

| # | Classification | Question | Governing artifact |
|---|----------------|----------|-------------------|
| 1 | **Boundary classification** | What Compliance Boundary encloses it? What Preference Surface applies? | Applicable `FI-DSN-*` standards and this document |
| 2 | **Authority classification** | Is it recommendation, selection, decision, or enforcement scope? | Section 8 |
| 3 | **Applicable Design Standards** | Which frozen or draft standards must exist or be revised? | REG/QUE and STD corpus |
| 4 | **Epistemic treatment** | Operational artifact only, or GOV-003 inference/assumption/input? | `FI-DSN-GOV-003` |
| 5 | **Governance review** | Does GOV-004, a standard, or both require amendment? | `FI-DSN-GOV-001` Section 15 |

### 16.3 Prohibited expansion paths

The following MUST NOT create new Brain authority without governed classification and applicable revision:

- Feature deployment implying new Preference Surface
- Prompt or model change implying Compliance Boundary change
- Model upgrade implying policy change
- Telemetry-derived behavior implying standard amendment
- Experimentation implying governance change without freeze posture
- Repeated runtime narrowing, telemetry patterns, or model behavior implying permanent Preference Surface amendment per Section 7.5

---

## 17. Drafting and Freeze Gates

### 17.1 Drafting gates

Drafting of Brain-boundary-governing content MAY continue when:

| Condition | Requirement |
|-----------|-------------|
| Nonblocking boundary question | Issue does not affect normative Compliance Boundary or Preference Surface in current scope |
| Informational Brain Architecture reference | Reference remains informational per `FI-DSN-GOV-001` Section 11.3 unless `OQ-DSN-004` resolves binding |
| Partial Preference Surface | Blocked elements recorded; normative boundary text complete for in-scope alternatives |

Drafting MUST stop or remain blocked when:

- Normative text assigns factual authority to Brain outputs
- Brain algorithm, prompt, or scoring requirements appear in standard text
- Preference Surface is not enclosed in Compliance Boundary
- Customer Override class is undefined for governed alternatives
- Brain Interaction contradicts normative requirements
- Source column would cite Brain recommendation as requirement support

### 17.2 Freeze gates

Before freeze promotion of boundary-governing content, confirm:

- [ ] Compliance Boundary and Preference Surface defined and enclosure invariant satisfied
- [ ] Recommendation → Selection → Decision → Enforcement chain respected in Brain Interaction and requirements
- [ ] Customer Override classes I–IV addressed where customer selection is in scope
- [ ] Brain Interaction section complete per `FI-DSN-TPL-001` Section 7 where applicable
- [ ] No Brain algorithm, prompt, or implementation specification in normative text
- [ ] GOV-003 Source and epistemic rules satisfied
- [ ] Authority Escalation posture recorded where cross-standard conflicts exist
- [ ] Boundary Validation pass per Section 18

---

## 18. Boundary Validation

Boundary Validation is governance-level boundary validation. It is not implementation testing and does not replace metadata validation under `FI-DSN-GOV-002` Section 10 or Epistemic Validation under `FI-DSN-GOV-003` Section 12.

Before freeze of governed content subject to this document, Boundary Validation MUST pass.

| Check | Pass criterion |
|-------|----------------|
| Terminology | Governed terms used per Section 6.1 without interchange |
| Authority dimensions | Factual, policy, runtime, and execution dimensions not conflated |
| Enclosure invariant | Every Preference Surface enclosed in Compliance Boundary |
| Runtime narrowing permanence | Runtime narrowing per Section 7.5 is operational only; no permanent alternative removal without governed revision |
| Recommendation chain | Recommendations advisory; standards decide; implementation enforces |
| No recommendation as requirement | No `{Standard ID}-R{nn}` supported only by Brain output |
| Customer Override | Classes I–IV correctly applied per Section 10 |
| GOV-003 separation | Operational outputs not treated as epistemic categories without classification |
| GOV-001 §11 | Brain authority rules operationalized without contradiction |
| Capability posture | New Brain scope has five classifications if applicable |
| Manufacturing boundary | Applicable `FI-MFG-*` requirements included in Compliance Boundary; Preference Surfaces exclude infeasible or prohibited manufacturing treatments; Brain recommendations and customer overrides cannot bypass manufacturing requirements; Product Implementation enforces applicable manufacturing constraints per Section 13 |
| Writing Engine boundary | Writing Engine authority remains message-side only per Section 12; outputs do not define visual presentation policy; Design Standards do not hard-code message decisions to compensate for Brain or Writing Engine gaps; Brain Architecture and Writing Engine references remain informational unless explicitly governed elsewhere |
| Adaptive runtime vs adaptive policy | Adaptive implementation, recommendation, and selection remain within frozen bounds per Section 9.2; adaptive policy and adaptive governance are prohibited; model updates, telemetry, feedback loops, and repeated behavior do not silently amend policy |
| No unauthorized extensions | No new metadata field, register column, queue state, or identifier family |

Boundary Validation supplements freeze checklists in Sections 17.2 and 20; it does not replace them.

---

## 19. Boundary Change Control

Changes to `FI-DSN-GOV-004` REQUIRE governed revision under `FI-DSN-GOV-001` Section 15. This section governs boundary change control for this document only.

The following changes REQUIRE governed revision, version increment where applicable, impact review, review of affected downstream artifacts, formal review before re-freeze, and a **Revision History** entry:

- Orthogonal authority model or terminology definitions
- Compliance Boundary or Preference Surface rules
- Recommendation, Selection, Decision, or Enforcement chain
- Customer Override taxonomy
- Authority Escalation precedence or situation matrix
- Capability Expansion classifications
- Runtime adaptation rules
- Drafting gates, Boundary Validation, or Freeze Gate rules
- Authority boundaries with `FI-DSN-GOV-001`, `FI-DSN-GOV-003`, or other frozen artifacts

Required process:

1. Version increment where governed by `FI-DSN-GOV-001`
2. Impact review of affected Design Standards, `CLS-BVS` standards, register posture, and queue readiness
3. Review of affected downstream artifacts
4. Formal review before re-freeze
5. **Revision History** entry documenting the change
6. No informal amendment through examples, planning records, volume supplements, implementation behavior, or Brain deployment

---

## 20. Freeze Gate

The Freeze Gate summarizes minimum conditions before `FI-DSN-GOV-004` or downstream boundary-governing content MAY be frozen. This section does not create a new lifecycle stage.

Before freeze promotion, as applicable, confirm:

- [ ] Architecture approval obtained
- [ ] Boundary Validation pass per Section 18
- [ ] Orthogonal authority model and terminology complete
- [ ] Enclosure invariant satisfied
- [ ] Recommendation chain complete
- [ ] Customer Override taxonomy operationalized
- [ ] Authority Escalation matrix present
- [ ] Capability Expansion rules present
- [ ] GOV-003 separation preserved
- [ ] GOV-001 Section 11 harmonization complete
- [ ] Metadata compliance per `FI-DSN-GOV-002`
- [ ] Identifier compliance per `FI-DSN-ID-001`
- [ ] **Revision History** complete
- [ ] No unresolved material contradiction with frozen governance
- [ ] Every material GOV-004-related open question resolved, or explicitly confirmed nonblocking with authorized identifier, safe governing default, and owner or resolution path per Section 31
- [ ] No retained open question leaves authority, compliance, override permission, or freeze posture undefined
- [ ] Inherited open questions accurately classified and confirmed nonblocking for this artifact
- [ ] Manufacturing compatibility validated per Section 13 and Boundary Validation

This standard is **Frozen Governance Standard**, Version 1.0, effective July 23, 2026.

---

## 21. Disposition and Volume Applicability

| Layer | Authority |
|-------|-----------|
| `FI-DSN-GOV-004` | Design Library-wide Brain authority minimums and minimum freeze gates |
| `FI-DSN-GOV-002` | Canonical metadata applicability semantics |
| `FI-DSN-GOV-003` | Epistemic minimums for standard Source and evidence posture |
| Volume supplements and `CLS-BVS` standards | MAY define additional disposition-specific boundary detail where authorized |
| Production Design Standards | Apply governing rules; MUST NOT invent competing Brain authority governance |

Volume supplements and `CLS-BVS` standards MUST NOT:

- weaken GOV-004 minimum gates,
- redefine Compliance Boundary or Preference Surface invariants,
- authorize runtime widening of Preference Surfaces,
- treat Brain recommendations as requirements,
- redefine canonical metadata or epistemic taxonomy.

Where a volume supplement is silent, `FI-DSN-GOV-004` applies directly.

Where a volume supplement conflicts with `FI-DSN-GOV-004`, `FI-DSN-GOV-004` controls unless `FI-DSN-GOV-004` is formally revised.

---

## 22. Harmonization with `FI-DSN-GOV-001`

| Layer | Authority |
|-------|-----------|
| `FI-DSN-GOV-001` | Design Standard lifecycle, top-level governance, freeze policy, and high-level Brain authority policy (Section 11) |
| `FI-DSN-GOV-004` | Detailed Brain authority model, boundary rules, override taxonomy, escalation, capability expansion, and boundary gates |

### 22.1 Operational relationship

`FI-DSN-GOV-004` **operationalizes** `FI-DSN-GOV-001` Section 11. It does not replace lifecycle authority, freeze policy, or normative language rules in `FI-DSN-GOV-001`.

Where overlap exists:

1. `FI-DSN-GOV-001` remains the lifecycle and top-level governance authority.
2. `FI-DSN-GOV-004` supplies detailed Brain boundary rules consumable by Design Standards, Brain Interaction sections, and Product Implementation enforcement expectations.
3. Any conflict between the documents MUST be resolved through governed revision under `FI-DSN-GOV-001` Section 15, not informal interpretation.

### 22.2 Non-contradiction rules

- Brain separation of authority in `FI-DSN-GOV-001` Section 11.1 remains binding.
- Prohibited conflation in `FI-DSN-GOV-001` Section 11.2 remains binding.
- Informational Brain Architecture references in `FI-DSN-GOV-001` Section 11.3 remain binding unless `OQ-DSN-004` resolves cross-library binding.
- Customer override rules in `FI-DSN-GOV-001` Section 11.4 remain binding and are expanded by Section 10 of this document.
- Brain recommendations constrained by approved Design Standards per `FI-DSN-GOV-001` principle remains binding.

---

## 23. Relationship to `FI-DSN-GOV-003`

| Boundary | Rule |
|----------|------|
| GOV-003 role | Epistemic taxonomy, evidence posture, Source governance, epistemic validation |
| GOV-004 role | Authority dimensions, Brain boundaries, runtime versus policy distinction |
| Separation | Operational Brain outputs are not epistemic categories unless classified under GOV-003 for drafting or research use |
| Intersection | Standards imposing Brain boundaries still require GOV-003 Source and evidence rules |
| No merger | GOV-004 MUST NOT redefine epistemic taxonomy or metadata fields |
| Conflict escalation | Epistemic conflicts escalate per Section 15.2 and GOV-003 Section 9; jurisdictional conflicts escalate per Section 14 |

---

## 24. Relationship to Metadata Standard (`FI-DSN-GOV-002`)

| Boundary | Rule |
|----------|------|
| Metadata authority | `FI-DSN-GOV-002` governs canonical field names, semantics, and applicability rules |
| This document | Governs boundary interpretation for Brain-related planning and standard content without redefining fields |
| No new fields | This document SHALL NOT add canonical metadata columns or fields |
| Recording | Compliance Boundaries and Preference Surfaces are recorded in standard bodies and Brain Interaction sections; **Notes** and **Dependencies** MAY support planning visibility |
| Validation split | Metadata validation per GOV-002 Section 10; boundary validation per Section 18; epistemic validation per GOV-003 Section 12 |

---

## 25. Relationship to Planning Register (`FI-DSN-REG-001`)

| Boundary | Rule |
|----------|------|
| Register role | Authoritative planning inventory; records metadata pointers per frozen schema |
| Brain logic | Register does not author Brain logic or product intelligence policy |
| Boundary evaluation | Brain boundary sufficiency is evaluated during drafting, Boundary Validation, review, and freeze gates — not at register reservation |
| No new columns | This document does not add register columns |

---

## 26. Relationship to Drafting Queue (`FI-DSN-QUE-001`)

| Boundary | Rule |
|----------|------|
| Queue role | Operational drafting sequence for Design Standards and governance artifacts |
| Brain work | Queue does not schedule Brain logic, prompts, or message-engine work per `FI-DSN-QUE-001` and `FI-DSN-GOV-001` Section 11 |
| Readiness | Queue MAY reflect readiness consequences of boundary-dependent drafting; it does not verify Brain behavior or define epistemic truth |
| No new states | This document does not add queue states or readiness labels |

---

## 27. Relationship to Template and Design Standards (`FI-DSN-TPL-001`)

| Boundary | Rule |
|----------|------|
| Template | `FI-DSN-TPL-001` **Brain Interaction** Section 7 remains authoritative for per-standard structure |
| GOV-004 role | Defines library-wide rules for what belongs in Brain Interaction versus prohibited Brain logic |
| Requirements | Compliance Boundaries expressed as `{Standard ID}-R{nn}` per template requirement tables |
| Source column | MUST follow GOV-003 and TPL-001; MUST NOT cite Brain recommendation as Source |
| Local rules | Production standards apply this document; MUST NOT invent competing Brain authority governance |

---

## 28. Relationship to Classification Strategy (`FI-DSN-CLS-001`)

| Boundary | Rule |
|----------|------|
| `CLS-BVS` | Brain Visual Selection owns design-side selection-boundary policy classification |
| GOV-004 role | Owns authority model; `CLS-BVS` standards implement Decision-stage boundaries |
| No algorithm ownership | Classification does not define Brain algorithms per CLS Section 13 |
| Principal subject | Brain boundary policy standards use `CLS-BVS` when selection-boundary governance is principal |

---

## 29. Relationship to Identifier System (`FI-DSN-ID-001`)

| Boundary | Rule |
|----------|------|
| Identifier authority | `FI-DSN-ID-001` governs `FI-DSN-GOV-###` and `OQ-DSN-###` |
| Governance identifier | This document is `FI-DSN-GOV-004` per `FI-DSN-ID-001` Section 6.1 pattern |
| Open questions | `OQ-DSN-###` only; no new OQ namespace |

### 29.1 Governance identifier authorization (`FI-DSN-GOV-004`)

| Item | Record |
|------|--------|
| Namespace family | `FI-DSN-GOV-###` established by `FI-DSN-ID-001` Section 6.1 |
| Assigned identifier | `FI-DSN-GOV-004` |
| Authorization basis | Explicit Sprint D1.9 creation process for Brain Authority Boundary |
| Collision verification | Repository verification SHALL confirm `FI-DSN-GOV-004` was unused before assignment at freeze promotion |
| Scope of resolution | Assignment of `FI-DSN-GOV-004` resolves the deferred Brain authority governance identifier |

---

## 30. Relationship to Design Library README

| Boundary | Rule |
|----------|------|
| Layered model | README Section 10 layered product system (Brain → writing → Design → manufacturing) is the conceptual foundation this document formalizes |
| No replacement | README remains descriptive; this document is normative for Brain authority boundaries |
| Consistency | Brain determines expression; Design Library determines presentation; manufacturing determines producibility — preserved |

---

## 31. Open Planning Questions

### Governance-native questions (nonblocking)

| ID | Question | Status | Safe default | Notes |
|----|----------|--------|--------------|-------|
| `OQ-DSN-004` | Should cross-library binding to Brain Architecture documents require a separate meta-governance decision beyond informational reference per `FI-DSN-GOV-001` Section 11.3? | Open — architecture; **nonblocking** | Cross-library Brain Architecture references remain informational unless a future governed meta-governance decision makes them binding | Default normative in Sections 6.1, 15.1, and 22.2 |
| `OQ-DSN-005` | Does the Writing Engine boundary belong fully inside GOV-004 acknowledgment or a future separate governance artifact? | Open — architecture; **nonblocking** | GOV-004 acknowledges Writing Engine as message-side boundary only; GOV-004 does not author writing policy | Default normative in Section 12 |
| `OQ-DSN-006` | May any standard authorize on-demand Preference Surface expansion for Customer Override Class II, or must Class II always redirect to Class I alternatives? | Open — drafting detail; **nonblocking** | Class II requests default to denial or redirection to Class I alternatives unless a frozen Design Standard explicitly authorizes another treatment | Safe default normative in Section 10.1 |
| `OQ-DSN-007` | May `{Standard ID}-R{nn}` normatively reference default Brain selection behavior, or must requirements reference only allowed alternatives? | Open — drafting detail; **nonblocking** | Design Requirements describe permitted alternatives and Compliance Boundaries, not Brain ranking algorithms or default-selection mechanics | Default normative in Sections 8.4 and 27 |

### Inherited nonblocking questions

| ID | Artifact | Status | Relevance |
|----|----------|--------|-----------|
| `OQ-CLS-001` | `FI-DSN-CLS-001` | Open; deferred to Volume Roadmap | Classification justification; may affect `CLS-BVS` standard sequencing |
| `OQ-DSN-003` | `FI-DSN-GOV-002` | Open; deferred to Visual Source schema artifact | Visual Source triggers; orthogonal to core Brain authority rules |

---

## 32. Revision History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 Draft | July 23, 2026 | F.I. Forgot | Sprint D1.9 — initial Brain Authority Boundary (`FI-DSN-GOV-004`) draft: orthogonal authority model, governed terminology, Compliance Boundary and Preference Surface, Recommendation/Selection/Decision/Enforcement chain, Customer Override taxonomy, Authority Escalation, Capability Expansion, GOV-001 §11 and GOV-003 harmonization, boundary validation and gates |
| 0.2 Draft | July 23, 2026 | F.I. Forgot | Sprint D1.9 refinement — Architecture Review corrections: Authority Escalation epistemic conflict cross-reference (§14 → §15.2, GOV-003 §9); expanded Boundary Validation (manufacturing, Writing Engine, adaptive policy); runtime narrowing permanence (§7.5); Purpose factual-authority wording; Freeze Gate open-question disposition; explicit manufacturing recommendation prohibition (§13.1); Conflict Governance completeness (Brain Architecture vs Design policy, manufacturing vs Design alternatives); authority diagram clarity (§4.4) |
| 1.0 | July 23, 2026 | F.I. Forgot | Frozen — promoted to Frozen Governance Standard; Formal Freeze Review passed; manufacturing compatibility validated per Section 13 and Boundary Validation; `OQ-DSN-004` through `OQ-DSN-007`, `OQ-CLS-001`, and `OQ-DSN-003` remain deferred |

### Future revision notes

Revisions after freeze require documented change control under Section 19 and `FI-DSN-GOV-001` Section 15. Conditions that would trigger a new governance version and freeze review include: change to authority dimensions, enclosure invariant, override taxonomy, escalation precedence, or GOV-003 separation rules.

---

**End of Document**
