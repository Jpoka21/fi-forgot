/**
 * Domain 3 Brain advisory records (BRPAM / BDOM / BRRM) — FI-DSN-STD-014-R73–R82.
 *
 * Raw constructor — prefer Domain3Repository.recordDomain3BrainAdvisory for persistence.
 * NOT exported from orchestra barrel (G8/G9 discipline).
 */

import { randomUUID } from "node:crypto";

import { createGovernanceTraceability } from "./authority.js";
import {
  assertDecisionStage,
  assertOutputClassAllowedForStage,
  isDomain3BrainOutputClass,
  isDomain3DecisionStage,
} from "./brain-domain3-decision-stage.js";
import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { createDomain3GovernedCreationMarker } from "./domain3-entry.js";
import type {
  Domain3BrainAdvisoryId,
  Domain3BrainAdvisoryRecord,
  Domain3BrainAuthorityRouteKind,
  Domain3BrainOutputClass,
  Domain3BrainReevaluationRequestType,
  Domain3BrainSourceAttribution,
  Domain3DecisionStage,
  GpraId,
  GpraValidityPosture,
  ProductionReadinessReviewId,
  ReviewDeterminationId,
  ReviewEvidenceId,
} from "./domain3-types.js";
import type { RealizedVisualArtifactId } from "./domain2-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import type { ProductionObligationId, ProductionProgramId } from "./types.js";

const G10_REQUIREMENTS = [
  "FI-DSN-STD-014-R73",
  "FI-DSN-STD-014-R74",
  "FI-DSN-STD-014-R75",
  "FI-DSN-STD-014-R76",
  "FI-DSN-STD-014-R77",
  "FI-DSN-STD-014-R78",
  "FI-DSN-STD-014-R79",
  "FI-DSN-STD-014-R80",
  "FI-DSN-STD-014-R81",
  "FI-DSN-STD-014-R82",
] as const;

export const GPRA_BRAIN_DECISION_STAGE_TRACEABILITY =
  createDomain3GovernanceTraceability([...G10_REQUIREMENTS]);

export const DOMAIN3_BRAIN_REEVALUATION_REQUEST_TYPES = [
  "new_review",
  "re_review",
  "downstream_correction",
  "rework_authorization_review",
  "invalidation_review",
  "supersession_review",
  "approval_reconsideration",
  "handoff_eligibility_review",
] as const satisfies readonly Domain3BrainReevaluationRequestType[];

export const DOMAIN3_BRAIN_AUTHORITY_ROUTE_KINDS = [
  "reviewer_path",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "magac",
  "handoff_authority_boundary",
] as const satisfies readonly Domain3BrainAuthorityRouteKind[];

/** R80 BRRM — each reevaluation request type routes only to its governing authority kind. */
export const DOMAIN3_REEVALUATION_REQUEST_ROUTE: Readonly<
  Record<Domain3BrainReevaluationRequestType, Domain3BrainAuthorityRouteKind>
> = Object.freeze({
  new_review: "reviewer_path",
  re_review: "reviewer_path",
  downstream_correction: "ddac",
  rework_authorization_review: "dsra",
  invalidation_review: "ivac",
  supersession_review: "ssac",
  approval_reconsideration: "magac",
  handoff_eligibility_review: "handoff_authority_boundary",
});

/** Stages that may emit each reevaluation request type (R77 × R80). */
export const DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES: Readonly<
  Record<Domain3BrainReevaluationRequestType, readonly Domain3DecisionStage[]>
> = {
  new_review: ["pre_review"],
  re_review: ["active_review", "completed_review"],
  downstream_correction: ["downstream_disposition"],
  rework_authorization_review: ["downstream_disposition"],
  invalidation_review: ["retention", "invalidated"],
  supersession_review: ["retention", "superseded"],
  approval_reconsideration: ["approval_consideration"],
  handoff_eligibility_review: ["handoff_preparation"],
};

const ALLOWED_ATTRIBUTIONS: readonly Domain3BrainSourceAttribution[] = [
  "brain_runtime",
  "writing_engine",
];

const PROHIBITED_ATTRIBUTION_TOKENS = [
  "magac",
  "ddac",
  "ivac",
  "ssac",
  "reviewer",
  "approver",
  "human",
  "authority_class",
  "approval_authority",
  "invalidation_authority",
  "supersession_authority",
] as const;

const HANDOFF_EXECUTION_FORBIDDEN_KEYS = [
  "handoffActId",
  "handoffAuthorized",
  "executesHandoff",
  "handoffAuthorization",
  "performHandoff",
  "handoffExecuted",
] as const;

export function createDomain3BrainAdvisoryId(): Domain3BrainAdvisoryId {
  return `domain3-brain-advisory-${randomUUID()}` as Domain3BrainAdvisoryId;
}

export function isDomain3BrainReevaluationRequestType(
  value: unknown,
): value is Domain3BrainReevaluationRequestType {
  return (
    typeof value === "string" &&
    (DOMAIN3_BRAIN_REEVALUATION_REQUEST_TYPES as readonly string[]).includes(value)
  );
}

export function isDomain3BrainAuthorityRouteKind(
  value: unknown,
): value is Domain3BrainAuthorityRouteKind {
  return (
    typeof value === "string" &&
    (DOMAIN3_BRAIN_AUTHORITY_ROUTE_KINDS as readonly string[]).includes(value)
  );
}

/**
 * BDOM R79 — Brain must not claim override of constitutional authority.
 */
export function assertBrainDoesNotOverrideConstitutionalAuthority(input: {
  overridesConstitutionalRecord?: unknown;
  claimsConstitutionalAuthority?: unknown;
  emulatesConstitutionalAct?: unknown;
  constitutionalActKind?: unknown;
}): void {
  if (input.overridesConstitutionalRecord === true) {
    throw new OrchestraConstitutionalError(
      "Brain advisory must not claim overridesConstitutionalRecord",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R74", "FI-DSN-STD-014-R79"],
    );
  }
  if (input.claimsConstitutionalAuthority === true) {
    throw new OrchestraConstitutionalError(
      "Brain advisory must not claim constitutionalAuthority",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R73", "FI-DSN-STD-014-R74", "FI-DSN-STD-014-R79"],
    );
  }
  if (input.emulatesConstitutionalAct === true) {
    throw new OrchestraConstitutionalError(
      "Brain advisory must not emulate constitutional acts",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R74", "FI-DSN-STD-014-R75"],
    );
  }
  if (typeof input.constitutionalActKind === "string" && input.constitutionalActKind.trim()) {
    const kind = input.constitutionalActKind.trim().toLowerCase();
    const forbidden = [
      "determination",
      "review_determination",
      "approval",
      "gpra",
      "invalidation",
      "supersession",
      "handoff",
      "ddac",
      "dsra",
    ];
    if (forbidden.some((token) => kind.includes(token))) {
      throw new OrchestraConstitutionalError(
        `Brain advisory must not claim constitutional act kind: ${input.constitutionalActKind}`,
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R74", "FI-DSN-STD-014-R79"],
      );
    }
  }
}

function assertSourceAttribution(
  attribution: unknown,
): asserts attribution is Domain3BrainSourceAttribution {
  if (
    typeof attribution !== "string" ||
    !(ALLOWED_ATTRIBUTIONS as readonly string[]).includes(attribution)
  ) {
    throw new OrchestraConstitutionalError(
      "Brain advisory sourceAttribution MUST be brain_runtime or writing_engine",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  const lower = attribution.toLowerCase();
  for (const token of PROHIBITED_ATTRIBUTION_TOKENS) {
    if (lower.includes(token)) {
      throw new OrchestraConstitutionalError(
        "Brain advisory must not attribute to human reviewer, approver, or authority class",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R78"],
      );
    }
  }
}

function assertReevaluationRequestPairing(input: {
  decisionStage: Domain3DecisionStage;
  outputClass: Domain3BrainOutputClass;
  reevaluationRequestType: Domain3BrainReevaluationRequestType | null;
  routesToAuthorityKind: Domain3BrainAuthorityRouteKind | null;
}): void {
  if (input.outputClass === "nonbinding_reevaluation_request") {
    if (!input.reevaluationRequestType) {
      throw new OrchestraConstitutionalError(
        "nonbinding_reevaluation_request requires reevaluationRequestType",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (!isDomain3BrainReevaluationRequestType(input.reevaluationRequestType)) {
      throw new OrchestraConstitutionalError(
        `Unknown Brain reevaluation request type: ${String(input.reevaluationRequestType)}`,
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (!input.routesToAuthorityKind) {
      throw new OrchestraConstitutionalError(
        "nonbinding_reevaluation_request requires routesToAuthorityKind",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (!isDomain3BrainAuthorityRouteKind(input.routesToAuthorityKind)) {
      throw new OrchestraConstitutionalError(
        `Unknown Brain authority route kind: ${String(input.routesToAuthorityKind)}`,
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    const expectedRoute = DOMAIN3_REEVALUATION_REQUEST_ROUTE[input.reevaluationRequestType];
    if (input.routesToAuthorityKind !== expectedRoute) {
      throw new OrchestraConstitutionalError(
        `Reevaluation request "${input.reevaluationRequestType}" must route to "${expectedRoute}"`,
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R76", "FI-DSN-STD-014-R80"],
      );
    }
    const allowedStages =
      DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES[input.reevaluationRequestType];
    if (!(allowedStages as readonly string[]).includes(input.decisionStage)) {
      throw new OrchestraConstitutionalError(
        `Reevaluation request "${input.reevaluationRequestType}" is not permitted at stage "${input.decisionStage}"`,
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R80"],
      );
    }
  } else {
    if (input.reevaluationRequestType != null) {
      throw new OrchestraConstitutionalError(
        "reevaluationRequestType is only valid for nonbinding_reevaluation_request",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (input.routesToAuthorityKind != null) {
      throw new OrchestraConstitutionalError(
        "routesToAuthorityKind is only valid for nonbinding_reevaluation_request",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
  }
}

export interface CreateDomain3BrainAdvisoryInput {
  readonly sourceAttribution: Domain3BrainSourceAttribution;
  readonly brainRuntimeVersion: string;
  readonly decisionStage: Domain3DecisionStage;
  readonly outputClass: Domain3BrainOutputClass;
  readonly programId: ProductionProgramId;
  readonly obligationId: ProductionObligationId;
  readonly rvaId: RealizedVisualArtifactId;
  readonly reviewId?: ProductionReadinessReviewId | null;
  readonly evidenceIds?: readonly ReviewEvidenceId[];
  readonly determinationId?: ReviewDeterminationId | null;
  readonly gpraId?: GpraId | null;
  readonly postureState?: GpraValidityPosture | null;
  readonly advisoryContent: string;
  readonly reevaluationRequestType?: Domain3BrainReevaluationRequestType | null;
  readonly routesToAuthorityKind?: Domain3BrainAuthorityRouteKind | null;
  readonly eventTime?: string;
  readonly createdBy?: string;
  /** Rejected when true — BDOM. */
  readonly overridesConstitutionalRecord?: boolean;
  readonly claimsConstitutionalAuthority?: boolean;
  readonly emulatesConstitutionalAct?: boolean;
  readonly constitutionalActKind?: string;
  /** R82 — any handoff execution claim fields must be absent / false. */
  readonly handoffActId?: unknown;
  readonly handoffAuthorized?: unknown;
  readonly executesHandoff?: unknown;
  readonly handoffAuthorization?: unknown;
  readonly performHandoff?: unknown;
  readonly handoffExecuted?: unknown;
}

/**
 * Construct a nonbinding Domain 3 Brain advisory record (R78 BRPAM).
 * Does not persist; does not create Determination / Approval / GPRA.
 */
export function createDomain3BrainAdvisoryRecord(
  input: CreateDomain3BrainAdvisoryInput,
): Domain3BrainAdvisoryRecord {
  assertBrainDoesNotOverrideConstitutionalAuthority(input);
  assertSourceAttribution(input.sourceAttribution);

  if (!isDomain3DecisionStage(input.decisionStage)) {
    throw new OrchestraConstitutionalError(
      `Unknown Domain 3 Decision-stage: ${String(input.decisionStage)}`,
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77"],
    );
  }
  if (!isDomain3BrainOutputClass(input.outputClass)) {
    throw new OrchestraConstitutionalError(
      `Unknown Domain 3 Brain output class: ${String(input.outputClass)}`,
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R75"],
    );
  }
  assertDecisionStage(input.decisionStage);
  assertOutputClassAllowedForStage(input.decisionStage, input.outputClass);

  const version = input.brainRuntimeVersion?.trim() ?? "";
  if (!version) {
    throw new OrchestraConstitutionalError(
      "Brain advisory requires non-empty brainRuntimeVersion",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  const content = input.advisoryContent?.trim() ?? "";
  if (!content) {
    throw new OrchestraConstitutionalError(
      "Brain advisory requires non-empty advisoryContent",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  if (!input.programId || !input.obligationId || !input.rvaId) {
    throw new OrchestraConstitutionalError(
      "Brain advisory requires programId, obligationId, and rvaId",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  const reviewId = input.reviewId ?? null;
  if (input.decisionStage !== "pre_review" && !reviewId) {
    throw new OrchestraConstitutionalError(
      "Brain advisory requires reviewId except at optional pre_review entry context",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R78"],
    );
  }

  for (const key of HANDOFF_EXECUTION_FORBIDDEN_KEYS) {
    const value = (input as CreateDomain3BrainAdvisoryInput & Record<string, unknown>)[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Brain advisory at Domain 3 must not include G11 Handoff execution fields (R82)",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R82"],
      );
    }
  }

  const reevaluationRequestType = input.reevaluationRequestType ?? null;
  const routesToAuthorityKind = input.routesToAuthorityKind ?? null;
  assertReevaluationRequestPairing({
    decisionStage: input.decisionStage,
    outputClass: input.outputClass,
    reevaluationRequestType,
    routesToAuthorityKind,
  });

  const postureState = input.postureState ?? null;
  if (
    postureState !== null &&
    postureState !== "retention" &&
    postureState !== "invalidated" &&
    postureState !== "superseded"
  ) {
    throw new OrchestraConstitutionalError(
      "Brain advisory postureState must be retention, invalidated, superseded, or null",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  const now = input.eventTime ?? new Date().toISOString();
  const createdBy = (input.createdBy ?? input.sourceAttribution).trim() || input.sourceAttribution;

  return Object.freeze({
    advisoryId: createDomain3BrainAdvisoryId(),
    sourceAttribution: input.sourceAttribution,
    eventTime: now,
    brainRuntimeVersion: version,
    decisionStage: input.decisionStage,
    outputClass: input.outputClass,
    programId: input.programId,
    obligationId: input.obligationId,
    rvaId: input.rvaId,
    reviewId,
    evidenceIds: Object.freeze([...(input.evidenceIds ?? [])]),
    determinationId: input.determinationId ?? null,
    gpraId: input.gpraId ?? null,
    postureState,
    advisoryContent: content,
    reevaluationRequestType,
    routesToAuthorityKind,
    doesNotAuthorize: true as const,
    nonbinding: true as const,
    notConstitutionalAuthority: true as const,
    distinguishableFromConstitutionalActs: true as const,
    doesNotCompelConstitutionalAction: true as const,
    audit: Object.freeze({
      createdAt: now,
      createdBy,
      traceability: createGovernanceTraceability(["FI-DSN-STD-012-R40"]),
    }),
    traceability: GPRA_BRAIN_DECISION_STAGE_TRACEABILITY,
    governedCreationMarker: createDomain3GovernedCreationMarker(),
  });
}
