/**
 * ORCH-IMP — STD-015 HOF-G9 Partial Authority Prohibitions (R22–R24).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-authority-boundaries.test.ts
 */

import * as Orchestra from "../orchestra/index.js";
import {
  acknowledgeHandoffGovernanceAuthorityFramework,
  assertBrainCannotAuthorizeHandoff,
  assertHandoffAuthorityBoundaryClaims,
  assertStd014AuthorityNotAbsorbedAsHandoff,
  BRAIN_PERMITTED_HANDOFF_ROLES,
  BRAIN_PROHIBITED_HANDOFF_ACTS,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  determineExplorationEntry,
  draftProductionProgram,
  evaluateHandoffAuthorityBoundaryFromFacts,
  HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES,
  HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  governProductionProgram,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  PEER_DISTINCT_HANDOFF_DECISION_CLASSES,
  STD014_NONABSORBED_AUTHORITY_SUBJECTS,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok =
    typeof expected === "object" && expected !== null
      ? JSON.stringify(actual) === JSON.stringify(expected)
      : actual === expected;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
  }
}

function expectTruthy(label: string, actual: unknown): void {
  if (actual) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function expectThrows(label: string, fn: () => unknown, code?: string): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label} (expected throw)`);
  } catch (error) {
    if (code && isOrchestraConstitutionalError(error) && error.code === code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (wrong code: ${(error as { code?: string }).code})`);
    }
  }
}

async function expectThrowsAsync(
  label: string,
  fn: () => Promise<unknown>,
  code?: string,
): Promise<void> {
  try {
    await fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label} (expected throw)`);
  } catch (error) {
    if (code && isOrchestraConstitutionalError(error) && error.code === code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else if (!code) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (wrong code: ${(error as { code?: string }).code})`);
    }
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-015";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const SSAC = "supersession_authority_production_obligation_scope" as const;
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";
const CONSUMER_KEYS = ["manufacturing", "fulfillment"] as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G9 Authority Boundaries",
    governingConstraints: ["FI-DSN-STD-001"],
    declaredBy: ACTOR,
  });
  await domain1.persistIntent(intent);
  const brand = bindComplianceBoundary({
    sourceStandardId: "FI-DSN-STD-001",
    scopeDescription: "Brand limits",
    boundBy: ACTOR,
  });
  const mfg = bindComplianceBoundary({
    sourceStandardId: "FI-MFG-PRN-001",
    scopeDescription: "Real-pen production method",
    boundBy: ACTOR,
  });
  let program = draftProductionProgram({
    intent,
    constitutionalPurpose: "HOF-G9 authority boundary scope",
    createdBy: ACTOR,
  });
  program = addObligationToProgram(program, {
    description: "Primary obligation",
    createdBy: ACTOR,
  });
  program = bindComplianceBoundariesToProgram(program, [brand, mfg]);
  program = governProductionProgram(program);
  await domain1.persistProgram(program);
  await domain1.persistExplorationDetermination(
    determineExplorationEntry({
      program,
      posture: "exploration_entry_authorized",
      governingBasis: "Exploration authorized",
      determinedBy: ACTOR,
    }),
  );
  return { domain1, program, obligationId: program.obligations[0]!.id };
}

async function admitReviewOnProgram(
  domain1: Domain1Repository,
  program: ProductionProgram,
  obligationId: ProductionProgram["obligations"][number]["id"],
): Promise<{
  domain2: Domain2Repository;
  domain3: Domain3Repository;
  rva: RealizedVisualArtifact;
  review: ProductionReadinessReview;
}> {
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2, undefined, domain1);
  const exploration = await domain2.beginExplorationPosture({
    programId: program.id,
    obligationId,
    governingBasis: "Exploration",
    operatedBy: ACTOR,
  });
  const exitReady = await domain2.achieveExplorationExitReady({
    recordId: exploration.recordId,
    exitBasis: "Exit",
    achievedBy: ACTOR,
  });
  const commitment = await domain2.recordRealizationCommitment({
    programId: program.id,
    obligationId,
    explorationPostureRecordId: exitReady.recordId,
    governingBasis: "Commitment",
    committedBy: ACTOR,
  });
  const candidate = await domain2.establishRealizedVisualArtifact({
    programId: program.id,
    obligationId,
    realizationCommitmentId: commitment.commitmentId,
    realizationPath: "created",
    establishedBy: ACTOR,
  });
  const rva = await domain2.promoteRvaToExists({
    rvaId: candidate.id,
    basis: "Exists",
    promotedBy: ACTOR,
  });
  await domain2.determineReviewEntryReadiness({ rvaId: rva.id, determinedBy: ACTOR });
  const review = await domain3.admitToProductionReadinessReview({
    rvaId: rva.id,
    admittedBy: ACTOR,
  });
  return { domain2, domain3, rva, review };
}

async function completeMandatoryActivity(
  domain3: Domain3Repository,
  review: ProductionReadinessReview,
): Promise<void> {
  for (const dimensionId of listMandatoryReviewDimensionIds()) {
    if (dimensionId === "design_time_feasibility") {
      await domain3.recordDesignTimeFeasibilityEvaluation({
        reviewId: review.reviewId,
        evaluationMethodDescription: "Decision-stage DTF for HOF-G9",
        observations: [
          {
            kind: "compatibility_observation",
            text: "Compatible with FI-MFG-PRN-001",
            relatedSourceStandardId: "FI-MFG-PRN-001",
          },
        ],
        affirmsDecisionStageWithoutManufacturingExecution: true,
        evaluatedBy: ACTOR,
      });
      continue;
    }
    await domain3.recordReviewDimensionActivity({
      reviewId: review.reviewId,
      dimensionId: dimensionId as MandatoryReviewDimensionId,
      sourceKind: "observation",
      sourceRecordId: `obs-${dimensionId}`,
      sourceSnapshot: JSON.stringify({
        dimension: MANDATORY_REVIEW_DIMENSION_LABELS[dimensionId as MandatoryReviewDimensionId],
      }),
      observation: `addressed-${dimensionId}`,
      recordedBy: ACTOR,
    });
  }
}

async function grantPassGpra() {
  const { domain1, program, obligationId } = await buildGovernedDomain1();
  const ctx = await admitReviewOnProgram(domain1, program, obligationId);
  await completeMandatoryActivity(ctx.domain3, ctx.review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: ctx.review.reviewId,
    outcome: "pass",
    grounds: "Pass for HOF-G9",
    determinedBy: ACTOR,
  });
  await ctx.domain3.recordApprovalAct({
    reviewId: determined.review.reviewId,
    authorityClassId: MAGAC,
    approvedBy: ACTOR,
  });
  const gpra = await ctx.domain3.grantGpra({
    reviewId: determined.review.reviewId,
    grantedBy: ACTOR,
  });
  return {
    domain1,
    program,
    obligationId,
    ...ctx,
    review: determined.review,
    determination: determined.determination,
    gpra,
  };
}

async function admitEntryAndConsume(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const prep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  return { prep, entry, consumption };
}

section("HOF-G9 catalogs and STD-015 R22–R24 traceability");
{
  expect("peer distinct classes length", PEER_DISTINCT_HANDOFF_DECISION_CLASSES.length, 10);
  expect("HAAM prohibited assignees length", HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES.length, 8);
  expect("STD-014 nonabsorbed subjects length", STD014_NONABSORBED_AUTHORITY_SUBJECTS.length, 10);
  expect("Brain permitted roles length", BRAIN_PERMITTED_HANDOFF_ROLES.length, 4);
  expect("Brain prohibited acts length", BRAIN_PROHIBITED_HANDOFF_ACTS.length, 7);
  expect(
    "includes handoff_authorization peer class",
    PEER_DISTINCT_HANDOFF_DECISION_CLASSES.includes("handoff_authorization"),
    true,
  );
  expect(
    "traceability includes R22",
    HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R22"),
    true,
  );
  expect(
    "traceability includes R24",
    HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R24"),
    true,
  );
  expect("governing standard STD-015", HANDOFF_AUTHORITY_BOUNDARY_TRACEABILITY.governingStandardId, "FI-DSN-STD-015");
  expect("HGA class id", HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID, "handoff_governance_authority");
}

section("Public API — no operative HGA constructor; evaluate/acknowledge on barrel");
{
  expect(
    "createGovernedHandoffHgaAuthorizationAct not on barrel",
    "createGovernedHandoffHgaAuthorizationAct" in Orchestra,
    false,
  );
  expect(
    "evaluateHandoffAuthorityBoundaryFromFacts on barrel",
    typeof Orchestra.evaluateHandoffAuthorityBoundaryFromFacts === "function",
    true,
  );
  expect(
    "acknowledgeHandoffGovernanceAuthorityFramework on barrel",
    typeof Orchestra.acknowledgeHandoffGovernanceAuthorityFramework === "function",
    true,
  );
  expect(
    "HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID on barrel",
    Orchestra.HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
    "handoff_governance_authority",
  );
}

section("R22 Brain cannot authorize Handoff / declare posture / complete / recall");
{
  expectThrows(
    "brainAuthorizesHandoff rejected",
    () => assertBrainCannotAuthorizeHandoff({ brainAuthorizesHandoff: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brainAuthorizeHandoff rejected",
    () => assertHandoffAuthorityBoundaryClaims({ brainAuthorizeHandoff: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brainDeclaresHandoffPosture rejected",
    () => assertHandoffAuthorityBoundaryClaims({ brainDeclaresHandoffPosture: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brainCompletesHandoff rejected",
    () => assertHandoffAuthorityBoundaryClaims({ brainCompletesHandoff: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brainRecallsHandoff rejected",
    () => assertHandoffAuthorityBoundaryClaims({ brainRecallsHandoff: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brainWithdrawsHandoff rejected",
    () => assertHandoffAuthorityBoundaryClaims({ brainWithdrawsHandoff: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brainSuspendsHandoff rejected",
    () => assertHandoffAuthorityBoundaryClaims({ brainSuspendsHandoff: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "advisory elevated to HOEM rejected",
    () => assertHandoffAuthorityBoundaryClaims({ advisoryIsOperativeHoemEvidence: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "brain_runtime actor cannot mint authority",
    () => assertBrainCannotAuthorizeHandoff({ actor: "brain_runtime" }),
    "invalid_handoff_authority_boundary",
  );
}

section("R23 STD-014 nonabsorption / cannot relabel as Handoff authority");
{
  expectThrows(
    "MAGAC relabeled as handoff authority rejected",
    () =>
      assertStd014AuthorityNotAbsorbedAsHandoff({
        handoffAuthorityClassId: MAGAC,
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "IVAC relabeled as handoff authority rejected",
    () =>
      assertStd014AuthorityNotAbsorbedAsHandoff({
        handoffAuthorityClassId: IVAC,
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "SSAC relabeled as handoff authority rejected",
    () =>
      assertStd014AuthorityNotAbsorbedAsHandoff({
        authorityClassId: SSAC,
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "GPRA claimed as handoff authority subject rejected",
    () =>
      assertStd014AuthorityNotAbsorbedAsHandoff({
        claimedHandoffAuthoritySubject: "gpra_grant",
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "absorbsStd014Authority claim rejected",
    () => assertHandoffAuthorityBoundaryClaims({ absorbsStd014Authority: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "reopensReviewDetermination rejected",
    () => assertHandoffAuthorityBoundaryClaims({ reopensReviewDetermination: true }),
    "invalid_handoff_authority_boundary",
  );
}

section("R24 HAAM peer distinction + HGA acknowledgment framework only");
{
  const ack = acknowledgeHandoffGovernanceAuthorityFramework();
  expect("HGA acknowledged sole class", ack.hgaAcknowledgedAsSoleHandoffAuthorizationClass, true);
  expect("HGA class id acknowledged", ack.acknowledgedHandoffGovernanceAuthorityClassId, HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID);
  expect("does not invent additional class", ack.doesNotInventAdditionalHandoffAuthorizationClass, true);
  expect("does not create operative HGA acts", ack.doesNotCreateOperativeHgaAuthorizationActs, true);
  expect("operative HGA deferred to R25", ack.operativeHgaAuthorizationActsDeferredToR25, true);
  expect("acknowledgment is not authorization", ack.notHandoffAuthorization, true);
  expect("HAAM preserved on acknowledgment", ack.haamProhibitionsPreserved, true);
  expect("peer classes preserved on acknowledgment", ack.peerDistinctDecisionClassesPreserved, true);

  const assessment = evaluateHandoffAuthorityBoundaryFromFacts();
  expect("assessment brainMayAuthorize false", assessment.brainMayAuthorizeHandoff, false);
  expect("assessment std014 not absorbed", assessment.std014AuthorityNotAbsorbed, true);
  expect("assessment HAAM preserved", assessment.haamProhibitionsPreserved, true);
  expect("assessment peer distinct", assessment.peerDistinctDecisionClassesPreserved, true);
  expect("assessment HGA acknowledged", assessment.hgaAcknowledgedAsSoleHandoffAuthorizationClass, true);
  expect("assessment no operative HGA", assessment.doesNotCreateOperativeHgaAuthorizationActs, true);
  expect("assessment R25 deferred", assessment.operativeHgaAuthorizationActsDeferredToR25, true);
  expect("assessment peer class count", assessment.peerDistinctDecisionClasses.length, 10);
  expect("assessment not authorization", assessment.notHandoffAuthorization, true);
  expect("assessment not posture", assessment.notHandoffPostureDeclaration, true);
  expect("assessment not execution", assessment.notHandoffExecution, true);

  expectThrows(
    "MAGAC as handoffAuthorityClassId rejected (HAAM)",
    () => assertHandoffAuthorityBoundaryClaims({ handoffAuthorityClassId: MAGAC }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "DDAC as handoffAuthorityClassId rejected",
    () => assertHandoffAuthorityBoundaryClaims({ handoffAuthorityClassId: "ddac_downstream_disposition" }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "DSRA as handoffAuthorityClassId rejected",
    () => assertHandoffAuthorityBoundaryClaims({ handoffAuthorityClassId: "dsra_rework_authorization" }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "Brain as handoffAuthorityClassId rejected",
    () => assertHandoffAuthorityBoundaryClaims({ handoffAuthorityClassId: "brain_domain3" }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "HGA class id minting on surface rejected (operative deferred)",
    () =>
      assertHandoffAuthorityBoundaryClaims({
        handoffAuthorityClassId: HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "fabricated authority ID rejected",
    () =>
      assertHandoffAuthorityBoundaryClaims({
        handoffAuthorityClassId: "fabricated_handoff_authority_class_xyz",
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "actor workflow string as authority class rejected",
    () =>
      assertHandoffAuthorityBoundaryClaims({
        authorityClassId: "workflow_adapter_authority",
      }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "collapsePeerDecisionClasses rejected",
    () => assertHandoffAuthorityBoundaryClaims({ collapsePeerDecisionClasses: true }),
    "invalid_handoff_authority_boundary",
  );
}

section("R25 boundary — no operative HGA / HOEM authorization acts");
{
  expectThrows(
    "hgaAuthorizationActId rejected",
    () => assertHandoffAuthorityBoundaryClaims({ hgaAuthorizationActId: "hga-act-1" }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "createsOperativeHgaAuthorizationAct rejected",
    () => assertHandoffAuthorityBoundaryClaims({ createsOperativeHgaAuthorizationAct: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "r25HgaAuthorizationAct rejected",
    () => assertHandoffAuthorityBoundaryClaims({ r25HgaAuthorizationAct: true }),
    "invalid_handoff_authority_boundary",
  );
  expectThrows(
    "handoffAuthorizationActId rejected",
    () => assertHandoffAuthorityBoundaryClaims({ handoffAuthorizationActId: "act-1" }),
    "invalid_handoff_authority_boundary",
  );
}

section("Repository evaluateHandoffAuthorityBoundary + closed-path smoke (G1/G7/G10)");
{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitEntryAndConsume(ctx);

  const boundary = await ctx.domain3.evaluateHandoffAuthorityBoundary();
  expect("repo boundary HGA acknowledged", boundary.hgaAcknowledgedAsSoleHandoffAuthorizationClass, true);
  expect("repo boundary no operative HGA", boundary.doesNotCreateOperativeHgaAuthorizationActs, true);
  expect("repo boundary brain cannot authorize", boundary.brainMayAuthorizeHandoff, false);

  await expectThrowsAsync(
    "G1 admit rejects Brain sourceAttribution",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: entry.preparationId,
        enteredBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_entry",
  );
  await expectThrowsAsync(
    "G1 admit rejects MAGAC as handoffAuthorityClassId",
    () =>
      ctx.domain3.admitGovernedHandoffEntry({
        preparationId: entry.preparationId,
        enteredBy: ACTOR,
        handoffAuthorityClassId: MAGAC,
      }),
    "invalid_handoff_entry",
  );
  await expectThrowsAsync(
    "G7 record rejects Brain consumedBy",
    () =>
      ctx.domain3.recordGovernedHandoffEvidenceConsumption({
        entryId: entry.entryId,
        consumedBy: "brain_runtime",
      }),
    "invalid_handoff_evidence_consumption",
  );
  await expectThrowsAsync(
    "G10 record rejects Brain authorize claim",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        brainAuthorizeHandoff: true,
      }),
    "invalid_handoff_preservation_audit",
  );
  await expectThrowsAsync(
    "G10 record rejects HGA act minting",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        handoffAuthorizationActId: "forged-hga-act",
      }),
    "invalid_handoff_preservation_audit",
  );

  const audit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });
  expectTruthy("G10 lawful preservation still works", audit.preservationAuditId);
  expect(
    "G10 still historical only",
    await ctx.domain3.evaluateHandoffPreservationAuditAuthorityEffect(audit.preservationAuditId),
    "historical_only",
  );
  expect("G1 entry still not authorization", entry.notHandoffAuthorization, true);
  expect("G7 consumption still HOEM framework only", consumption.hoemFrameworkOnly, true);
}

console.log(`\n============================================================`);
console.log(`HOF-G9 Authority Boundaries: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
