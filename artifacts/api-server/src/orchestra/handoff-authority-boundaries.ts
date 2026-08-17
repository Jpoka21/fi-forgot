/**
 * Governed Handoff Authority Prohibitions — FI-DSN-STD-015 HOF-G9 partial (R22–R24).
 *
 * Standing constitutional boundaries only:
 * - R22 Brain non-authority at Handoff
 * - R23 STD-014 non-absorption
 * - R24 HAAM prohibitions, peer-distinct decision classes, HGA acknowledgment
 *
 * Does NOT create operative HGA authorization acts (R25+ / HOF-G2 / §23.1).
 * Does NOT invent additional Handoff authorization classes.
 * Acknowledgment of HGA is framework-only and is not authorization.
 */

import type {
  BrainPermittedHandoffRole,
  BrainProhibitedHandoffAct,
  HaamProhibitedHandoffAuthorizationAssignee,
  HandoffAuthorityBoundaryAssessment,
  HandoffGovernanceAuthorityClassId,
  HandoffPeerDistinctDecisionClass,
  Std014NonabsorbedAuthoritySubject,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G9_REQUIREMENTS = [
  "FI-DSN-STD-015-R22",
  "FI-DSN-STD-015-R23",
  "FI-DSN-STD-015-R24",
  "FI-DSN-STD-015-R141",
] as const satisfies readonly Std015RequirementId[];

export const HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G9_REQUIREMENTS]);

/**
 * R24 — sole Handoff authorization authority class acknowledged (PD-STD-015-001).
 * Framework name only; operative HGA acts are deferred to R25+.
 */
export const HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID =
  "handoff_governance_authority" as const satisfies HandoffGovernanceAuthorityClassId;

export const PEER_DISTINCT_HANDOFF_DECISION_CLASSES = [
  "handoff_eligibility",
  "handoff_authorization",
  "handoff_posture_declaration",
  "handoff_act_completion",
  "handoff_recall",
  "handoff_withdrawal",
  "handoff_suspension",
  "downstream_acceptance",
  "permanent_collection_membership",
  "manufacturing_validation_and_execution",
] as const satisfies readonly HandoffPeerDistinctDecisionClass[];

export const HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES = [
  "magac_approval_authority",
  "ddac_downstream_disposition",
  "dsra_rework_authorization",
  "ivac_invalidation_authority",
  "ssac_supersession_authority",
  "brain_domain3",
  "g11_export_contract",
  "downstream_consumer_domain",
] as const satisfies readonly HaamProhibitedHandoffAuthorizationAssignee[];

export const STD014_NONABSORBED_AUTHORITY_SUBJECTS = [
  "review",
  "review_determination",
  "approval",
  "approval_withholding",
  "gpra_grant",
  "invalidated_posture",
  "superseded_posture",
  "ddac_downstream_disposition",
  "dsra_rework_authorization",
  "g11_handoff_preparation",
] as const satisfies readonly Std014NonabsorbedAuthoritySubject[];

export const BRAIN_PERMITTED_HANDOFF_ROLES = [
  "constitutional_input_consumer",
  "evidence_and_posture_evaluator",
  "advisory_treatment_recommender",
  "routing_participant",
] as const satisfies readonly BrainPermittedHandoffRole[];

export const BRAIN_PROHIBITED_HANDOFF_ACTS = [
  "authorize_handoff",
  "declare_handoff_posture",
  "complete_handoff",
  "recall_handoff",
  "withdraw_handoff",
  "suspend_handoff",
  "reenter_handoff",
  "resume_handoff",
  "terminate_downstream_reliance",
] as const satisfies readonly BrainProhibitedHandoffAct[];

/** Tokens that must never mint Handoff authorization (HAAM / R24). */
const HAAM_FORBIDDEN_AUTHORITY_TOKENS = [
  "magac",
  "approval_authority",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "brain",
  "writing_engine",
  "g11_export",
  "export_contract",
  "downstream_consumer",
  "consumer_domain",
] as const;

/** STD-014 class tokens that must not be relabeled as Handoff authority (R23/R24). */
const STD014_RELABEL_FORBIDDEN_TOKENS = [
  "magac",
  "approval_authority",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "review_determination",
  "gpra",
  "invalidation_authority",
  "supersession_authority",
] as const;

/**
 * R22 / R24 / R25 boundary — claims that would authorize Handoff, invent HGA acts,
 * collapse peer classes, absorb STD-014, or elevate Brain advisory to HOEM evidence.
 */
const HANDOFF_AUTHORITY_BOUNDARY_FORBIDDEN_KEYS = [
  "handoffAuthorized",
  "executesHandoff",
  "handoffAuthorization",
  "performHandoff",
  "handoffExecuted",
  "handoffPosture",
  "handoffAuthorizationActId",
  "hgaAuthorizationActId",
  "hgaActId",
  "operativeHgaAuthorizationActId",
  "postureDeclarationActId",
  "completionActId",
  "suspensionActId",
  "recallActId",
  "withdrawalActId",
  "brainAuthorizesHandoff",
  "brainHandoffAuthorization",
  "brainAuthorizeHandoff",
  "brainDeclaresHandoffPosture",
  "brainCompletesHandoff",
  "brainRecallsHandoff",
  "brainWithdrawsHandoff",
  "brainSuspendsHandoff",
  "brainReentersHandoff",
  "brainResumesHandoff",
  "advisoryIsOperativeHoemEvidence",
  "elevateAdvisoryToHoem",
  "absorbsStd014Authority",
  "reopensReviewDetermination",
  "substitutesForApproval",
  "substitutesForGpra",
  "relabelStd014AsHandoffAuthority",
  "collapsePeerDecisionClasses",
  "inventAdditionalHandoffAuthorizationClass",
  "r25HgaAuthorizationAct",
  "createsOperativeHgaAuthorizationAct",
] as const;

export function isHandoffPeerDistinctDecisionClass(
  value: unknown,
): value is HandoffPeerDistinctDecisionClass {
  return (
    typeof value === "string" &&
    (PEER_DISTINCT_HANDOFF_DECISION_CLASSES as readonly string[]).includes(value)
  );
}

export function isHaamProhibitedHandoffAuthorizationAssignee(
  value: unknown,
): value is HaamProhibitedHandoffAuthorizationAssignee {
  return (
    typeof value === "string" &&
    (HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES as readonly string[]).includes(value)
  );
}

function tokenLooksForbidden(value: string, tokens: readonly string[]): boolean {
  const lower = value.trim().toLowerCase();
  if (!lower) return false;
  return tokens.some((t) => lower === t || lower.includes(t) || lower.includes(`${t}_`));
}

/**
 * R22–R24 / R25 boundary — reject Brain authorization, HAAM-prohibited assignees,
 * STD-014 relabeling, invented authority classes, and operative HGA act claims.
 *
 * Framework acknowledgment of HGA does NOT permit minting operative HGA acts here.
 */
export function assertHandoffAuthorityBoundaryClaims(
  input: Record<string, unknown>,
): void {
  for (const key of HANDOFF_AUTHORITY_BOUNDARY_FORBIDDEN_KEYS) {
    const value = input[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Handoff authority boundary violated: Brain authorization, operative HGA act, STD-014 absorption, or peer-class collapse claims are prohibited (R22–R24; R25+ deferred)",
        "invalid_handoff_authority_boundary",
        ["FI-DSN-STD-015-R22", "FI-DSN-STD-015-R23", "FI-DSN-STD-015-R24"],
      );
    }
  }

  for (const classField of [
    input.authorityClassId,
    input.handoffAuthorityClassId,
    input.preservationAuthorityClassId,
    input.hgaAuthorityClassId,
  ]) {
    if (typeof classField !== "string" || !classField.trim()) continue;
    const lower = classField.trim().toLowerCase();

    // Even the acknowledged HGA class name must not be minted as operative attribution
    // on consideration/preservation surfaces — operative HGA acts are R25+.
    if (
      lower === HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID ||
      lower === "hga" ||
      lower.includes("handoff_governance_authority")
    ) {
      throw new OrchestraConstitutionalError(
        "HGA is acknowledged as the sole Handoff authorization class (R24) but operative HGA authorization acts are deferred to R25+; do not mint HGA attribution on this surface",
        "invalid_handoff_authority_boundary",
        ["FI-DSN-STD-015-R24"],
      );
    }

    if (tokenLooksForbidden(lower, HAAM_FORBIDDEN_AUTHORITY_TOKENS)) {
      throw new OrchestraConstitutionalError(
        "HAAM / R24: MAGAC, Approval, DDAC, DSRA, IVAC, SSAC, Brain, G11 export, or downstream consumer domains must not be assigned Handoff authorization authority",
        "invalid_handoff_authority_boundary",
        ["FI-DSN-STD-015-R24"],
      );
    }

    if (tokenLooksForbidden(lower, STD014_RELABEL_FORBIDDEN_TOKENS)) {
      throw new OrchestraConstitutionalError(
        "STD-014 authority classes must not be relabeled as Handoff authority (R23/R24)",
        "invalid_handoff_authority_boundary",
        ["FI-DSN-STD-015-R23", "FI-DSN-STD-015-R24"],
      );
    }

    throw new OrchestraConstitutionalError(
      "Do not invent, establish, or name an additional Handoff authorization class; HGA acknowledgment is framework-only until R25 operative acts (R24)",
      "invalid_handoff_authority_boundary",
      ["FI-DSN-STD-015-R24"],
    );
  }

  if (typeof input.sourceAttribution === "string" && input.sourceAttribution.trim()) {
    const attr = input.sourceAttribution.trim().toLowerCase();
    if (
      attr === "brain_runtime" ||
      attr === "writing_engine" ||
      attr.includes("brain") ||
      tokenLooksForbidden(attr, HAAM_FORBIDDEN_AUTHORITY_TOKENS)
    ) {
      // Brain / HAAM tokens as sourceAttribution are rejected when caller opts into
      // G9 boundary assert for minting surfaces. Specific actor fields still own
      // their local codes; this closes the R22 authority-claim path.
      if (
        input.brainAuthorizesHandoff === true ||
        input.brainAuthorizeHandoff === true ||
        input.handoffAuthorized === true ||
        input.authorityClassId != null ||
        input.handoffAuthorityClassId != null
      ) {
        throw new OrchestraConstitutionalError(
          "Brain cannot authorize Handoff or mint Handoff authority (R22)",
          "invalid_handoff_authority_boundary",
          ["FI-DSN-STD-015-R22"],
        );
      }
    }
  }
}

/**
 * R22 — Brain actor / attribution must not authorize Handoff.
 */
export function assertBrainCannotAuthorizeHandoff(input: {
  actor?: unknown;
  sourceAttribution?: unknown;
  brainAuthorizesHandoff?: unknown;
  brainAuthorizeHandoff?: unknown;
  handoffAuthorized?: unknown;
}): void {
  if (
    input.brainAuthorizesHandoff === true ||
    input.brainAuthorizeHandoff === true ||
    input.handoffAuthorized === true
  ) {
    throw new OrchestraConstitutionalError(
      "Brain SHALL NOT authorize Handoff at the Governed Handoff boundary (R22)",
      "invalid_handoff_authority_boundary",
      ["FI-DSN-STD-015-R22"],
    );
  }

  for (const field of [input.actor, input.sourceAttribution]) {
    if (typeof field !== "string" || !field.trim()) continue;
    const lower = field.trim().toLowerCase();
    if (
      lower === "brain_runtime" ||
      lower === "writing_engine" ||
      lower.startsWith("brain") ||
      lower.includes("brain_")
    ) {
      throw new OrchestraConstitutionalError(
        "Brain actor attribution cannot mint Handoff authorization (R22)",
        "invalid_handoff_authority_boundary",
        ["FI-DSN-STD-015-R22"],
      );
    }
  }
}

/**
 * R23 — STD-014 subjects remain exclusive principal; cannot be absorbed as Handoff authority.
 */
export function assertStd014AuthorityNotAbsorbedAsHandoff(input: {
  claimedHandoffAuthoritySubject?: unknown;
  handoffAuthorityClassId?: unknown;
  authorityClassId?: unknown;
}): void {
  for (const field of [
    input.claimedHandoffAuthoritySubject,
    input.handoffAuthorityClassId,
    input.authorityClassId,
  ]) {
    if (typeof field !== "string" || !field.trim()) continue;
    const lower = field.trim().toLowerCase();
    if (
      tokenLooksForbidden(lower, STD014_RELABEL_FORBIDDEN_TOKENS) ||
      (STD014_NONABSORBED_AUTHORITY_SUBJECTS as readonly string[]).includes(lower)
    ) {
      throw new OrchestraConstitutionalError(
        "STD-015 must not absorb or relabel STD-014 Review/Approval/GPRA/DDAC/DSRA/IVAC/SSAC/G11 preparation as Handoff authority (R23)",
        "invalid_handoff_authority_boundary",
        ["FI-DSN-STD-015-R23"],
      );
    }
  }
}

/**
 * Framework acknowledgment of HGA as sole Handoff authorization class (R24).
 * Does NOT create an operative HGA authorization act (R25+ deferred).
 */
export function acknowledgeHandoffGovernanceAuthorityFramework(): Readonly<{
  acknowledgedHandoffGovernanceAuthorityClassId: HandoffGovernanceAuthorityClassId;
  hgaAcknowledgedAsSoleHandoffAuthorizationClass: true;
  doesNotInventAdditionalHandoffAuthorizationClass: true;
  doesNotCreateOperativeHgaAuthorizationActs: true;
  operativeHgaAuthorizationActsDeferredToR25: true;
  notHandoffAuthorization: true;
  haamProhibitionsPreserved: true;
  peerDistinctDecisionClassesPreserved: true;
  traceability: typeof HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY;
}> {
  return Object.freeze({
    acknowledgedHandoffGovernanceAuthorityClassId: HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
    hgaAcknowledgedAsSoleHandoffAuthorizationClass: true as const,
    doesNotInventAdditionalHandoffAuthorizationClass: true as const,
    doesNotCreateOperativeHgaAuthorizationActs: true as const,
    operativeHgaAuthorizationActsDeferredToR25: true as const,
    notHandoffAuthorization: true as const,
    haamProhibitionsPreserved: true as const,
    peerDistinctDecisionClassesPreserved: true as const,
    traceability: HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY,
  });
}

/**
 * Standing R22–R24 authority-boundary assessment (framework only).
 */
export function evaluateHandoffAuthorityBoundaryFromFacts(): HandoffAuthorityBoundaryAssessment {
  return Object.freeze({
    brainMayAuthorizeHandoff: false as const,
    brainMayDeclareHandoffPosture: false as const,
    brainMayCompleteHandoff: false as const,
    brainMayRecallWithdrawOrSuspendHandoff: false as const,
    brainMayReenterOrResumeHandoff: false as const,
    brainMayElevateAdvisoryToOperativeHoemEvidence: false as const,
    brainPermittedRolesOnly: true as const,
    std014AuthorityNotAbsorbed: true as const,
    haamProhibitionsPreserved: true as const,
    peerDistinctDecisionClassesPreserved: true as const,
    hgaAcknowledgedAsSoleHandoffAuthorizationClass: true as const,
    doesNotInventAdditionalHandoffAuthorizationClass: true as const,
    doesNotCreateOperativeHgaAuthorizationActs: true as const,
    operativeHgaAuthorizationActsDeferredToR25: true as const,
    notHandoffAuthorization: true as const,
    notHandoffPostureDeclaration: true as const,
    notHandoffExecution: true as const,
    r22BrainNonauthorityAtHandoff: true as const,
    r23Std014Nonabsorption: true as const,
    r24HaamPeerDistinctHgaAcknowledgment: true as const,
    peerDistinctDecisionClasses: Object.freeze([
      ...PEER_DISTINCT_HANDOFF_DECISION_CLASSES,
    ]),
    haamProhibitedAssignees: Object.freeze([
      ...HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES,
    ]),
    std014NonabsorbedSubjects: Object.freeze([...STD014_NONABSORBED_AUTHORITY_SUBJECTS]),
    brainPermittedRoles: Object.freeze([...BRAIN_PERMITTED_HANDOFF_ROLES]),
    brainProhibitedActs: Object.freeze([...BRAIN_PROHIBITED_HANDOFF_ACTS]),
    acknowledgedHandoffGovernanceAuthorityClassId: HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
    traceability: HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY,
  });
}
