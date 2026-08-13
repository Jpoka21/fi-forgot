/**
 * ORCH-IMP-020 — STD-015 HOF-G2 Operative Handoff Authorization (R25–R32).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-authorization.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
  determineExplorationEntry,
  draftProductionProgram,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY,
  governProductionProgram,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
  HCCM_CONSUMER_CLASS_CATALOG,
  isOrchestraConstitutionalError,
  listMandatoryReviewDimensionIds,
  MANDATORY_REVIEW_DIMENSION_LABELS,
  type Domain1Repository,
  type Domain2Repository,
  type Domain3Repository,
  type MandatoryReviewDimensionId,
  type ProductionProgram,
  type ProductionReadinessReview,
  type RealizedVisualArtifact,
} from "../orchestra/index.js";
import { rehydrateGovernedHandoffAuthorization } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffAuthorization } from "../orchestra/persistence/domain3-validation.js";

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

function section(name: string) {
  console.log(`\n${name}`);
}

const ACTOR = "governance-authority-015";
const MAGAC = "approval_authority_production_obligation_scope" as const;
const SSAC = "supersession_authority_production_obligation_scope" as const;
const IVAC = "invalidation_authority_production_obligation_scope" as const;
const HANDOFF_CTX = "handoff-consumer-context-opaque-001";
const CONSUMER_KEYS = ["manufacturing", "fulfillment"] as const;
const HGA = HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID;
const CC_MFG = "CC-03" as const;
const CC_FULFILL = "CC-04" as const;
const CC_CATALOG = "CC-01" as const;

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G2 Handoff Authorization",
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
    constitutionalPurpose: "HOF-G2 authorization scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G2",
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
    grounds: "Pass for HOF-G2",
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

async function prepareExportReady(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  return ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
}

async function admitEntry(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const prep = await prepareExportReady(ctx);
  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  return { prep, entry };
}

async function admitWithConsumption(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const { prep, entry } = await admitEntry(ctx);
  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  return { prep, entry, consumption };
}

async function prepareSuccessorPassReady(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const { successor } = await ctx.domain2.createSuccessorRva({
    priorRvaId: ctx.rva.id,
    realizationPath: "created",
    iterationBasis: "ST-1 succession successor RVA",
    createdBy: ACTOR,
  });
  const successorExists = await ctx.domain2.promoteRvaToExists({
    rvaId: successor.id,
    basis: "Successor exists",
    promotedBy: ACTOR,
  });
  await ctx.domain2.determineReviewEntryReadiness({
    rvaId: successorExists.id,
    determinedBy: ACTOR,
  });
  const review = await ctx.domain3.admitToProductionReadinessReview({
    rvaId: successorExists.id,
    admittedBy: ACTOR,
  });
  await completeMandatoryActivity(ctx.domain3, review);
  const determined = await ctx.domain3.recordReviewDetermination({
    reviewId: review.reviewId,
    outcome: "pass",
    grounds: "Pass successor for HOF-G2",
    determinedBy: ACTOR,
  });
  await ctx.domain3.recordApprovalAct({
    reviewId: determined.review.reviewId,
    authorityClassId: MAGAC,
    approvedBy: ACTOR,
  });
  return {
    successorRva: successorExists,
    successorReview: determined.review,
    successorDetermination: determined.determination,
  };
}

section("HOF-G2 catalogs, HGA source, STD-015 R25–R32 traceability");

{
  expect("sole frozen HGA class count", FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES.length, 1);
  expect(
    "HGA class id",
    FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!.authorityClassId,
    "handoff_governance_authority",
  );
  expect(
    "HGA governing source PD-STD-015-001",
    FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!.governingSourceId,
    "PD-STD-015-001",
  );
  expect("HCCM catalog length", HCCM_CONSUMER_CLASS_CATALOG.length, 6);
  expectTruthy(
    "traceability R25",
    GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R25"),
  );
  expectTruthy(
    "traceability R32",
    GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY.requirementIds.includes("FI-DSN-STD-015-R32"),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
  expectTruthy(
    "G7 still lists authorization as deferred HOEM framework class",
    DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES.includes("authorization"),
  );
}

section("createGovernedHandoffAuthorizationActRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffAuthorizationActRecord not on barrel",
    "createGovernedHandoffAuthorizationActRecord" in mod,
    false,
  );
  expect(
    "assessGovernedHandoffAuthorization on barrel",
    "assessGovernedHandoffAuthorization" in mod,
    true,
  );
  expect("HGA catalog on barrel", "FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES" in mod, true);
  expect("HCCM catalog on barrel", "HCCM_CONSUMER_CLASS_CATALOG" in mod, true);
  expect(
    "declareHandoffPosture not on barrel (R33+)",
    "declareHandoffPosture" in mod,
    false,
  );
  expect(
    "completeGovernedHandoff not on barrel (R33+)",
    "completeGovernedHandoff" in mod,
    false,
  );
}

section("Lawful HGA authorization: act + HOEM authorization only; not posture/execution");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);

  const assessment = await ctx.domain3.evaluateGovernedHandoffAuthorization({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
  });
  expect("assessment mayAuthorize", assessment.mayAuthorize, true);
  expect("assessment not posture", assessment.notHandoffPostureDeclaration, true);
  expect("assessment not execution", assessment.notHandoffExecution, true);
  expect(
    "assessment not completion/suspension/recall/withdrawal",
    assessment.notCompletionSuspensionRecallOrWithdrawal,
    true,
  );
  expect("assessment substitutesRejected", assessment.substitutesRejected, true);
  expect("assessment authorityClassId HGA", assessment.authorityClassId, HGA);

  const act = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });

  expectTruthy(
    "act id prefix",
    act.authorizationActId.startsWith("governed-handoff-authorization-act-"),
  );
  expect("act authority HGA", act.authorityClassId, HGA);
  expect("act governing source", act.authorityGoverningSourceId, "PD-STD-015-001");
  expect("act authorizedBy actor distinct", act.authorizedBy, ACTOR);
  expect("act entryId", act.entryId, entry.entryId);
  expect("act consumptionId", act.evidenceConsumptionId, consumption.consumptionId);
  expect("act gpra", act.gpraId, ctx.gpra.gpraId);
  expect("act consumerClass CC-03", act.consumerClassId, CC_MFG);
  expect("act consumed HCBM keys", [...act.consumedHcbmBoundaryKeys], ["manufacturing"]);
  expect("act not posture", act.notHandoffPostureDeclaration, true);
  expect("act not execution", act.notHandoffExecution, true);
  expect("act not completion", act.notHandoffCompletion, true);
  expect("act not suspension", act.notHandoffSuspension, true);
  expect("act not recall", act.notHandoffRecall, true);
  expect("act not withdrawal", act.notHandoffWithdrawal, true);
  expect("act not downstream acceptance", act.notDownstreamAcceptance, true);
  expect(
    "act does not authorize mfg/fulfillment execution",
    act.doesNotAuthorizeManufacturingOrFulfillment,
    true,
  );
  expect("HOEM actType authorization", act.hoemAuthorizationRecord.actType, "authorization");
  expectTruthy(
    "HOEM peer: doesNotMergePosture",
    act.hoemAuthorizationRecord.doesNotMergePostureDeclarationAttribution,
  );
  expectTruthy(
    "HOEM peer: doesNotMergeCompletion",
    act.hoemAuthorizationRecord.doesNotMergeCompletionAttribution,
  );
  expectTruthy(
    "HOEM peer: doesNotMergeSuspension",
    act.hoemAuthorizationRecord.doesNotMergeSuspensionAttribution,
  );
  expectTruthy(
    "HOEM peer: doesNotMergeRecall",
    act.hoemAuthorizationRecord.doesNotMergeRecallAttribution,
  );
  expectTruthy(
    "HOEM peer: doesNotMergeWithdrawal",
    act.hoemAuthorizationRecord.doesNotMergeWithdrawalAttribution,
  );

  const currency = await ctx.domain3.evaluateHandoffAuthorizationCurrency(act.authorizationActId);
  expect("authorization currency current", currency, "current");

  validatePersistedGovernedHandoffAuthorization(act);
}

section("Additive repeated authorization (immutable history; no overwrite)");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);

  const first = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  const second = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_FULFILL,
    authorityClassId: HGA,
    authorizedBy: `${ACTOR}-peer`,
  });

  expectTruthy("additive acts distinct ids", first.authorizationActId !== second.authorizationActId);
  const listed = await ctx.domain3.listGovernedHandoffAuthorizationActsByEntry(entry.entryId);
  expect("listed additive count", listed.length, 2);
  const stillFirst = await ctx.domain3.loadGovernedHandoffAuthorizationAct(first.authorizationActId);
  expect("first act immutable", stillFirst?.authorizationActId, first.authorizationActId);
  expect("first act consumer unchanged", stillFirst?.consumerClassId, CC_MFG);
}

section("Missing G1 entry / missing G7 evidence consumption");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);
  const fakeEntryId = "governed-handoff-entry-00000000-0000-4000-8000-000000000001" as never;
  const fakeConsumptionId =
    "governed-handoff-evidence-consumption-00000000-0000-4000-8000-000000000002" as never;

  const missingEntry = await ctx.domain3.evaluateGovernedHandoffAuthorization({
    entryId: fakeEntryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
  });
  expect("missing entry mayAuthorize false", missingEntry.mayAuthorize, false);
  expectTruthy(
    "missing entry denial",
    missingEntry.denialReasons.includes("missing_governed_handoff_entry"),
  );

  await expectThrowsAsync(
    "authorize rejects missing entry",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        entryId: fakeEntryId,
        evidenceConsumptionId: consumption.consumptionId,
        consumerClassId: CC_MFG,
        authorityClassId: HGA,
        authorizedBy: ACTOR,
      }),
    "invalid_handoff_authorization",
  );

  const missingConsumption = await ctx.domain3.evaluateGovernedHandoffAuthorization({
    entryId: entry.entryId,
    evidenceConsumptionId: fakeConsumptionId,
    consumerClassId: CC_MFG,
  });
  expect("missing consumption mayAuthorize false", missingConsumption.mayAuthorize, false);
  expectTruthy(
    "missing consumption denial",
    missingConsumption.denialReasons.includes("missing_evidence_consumption"),
  );

  await expectThrowsAsync(
    "authorize rejects missing consumption",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        entryId: entry.entryId,
        evidenceConsumptionId: fakeConsumptionId,
        consumerClassId: CC_MFG,
        authorityClassId: HGA,
        authorizedBy: ACTOR,
      }),
    "invalid_handoff_authorization",
  );
}

section("Invalidated GPRA: authorize rejected; historical act loadable as stale");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);
  const act = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });

  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "Material CB change renders GPRA-bound RVA non-compliant",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });

  const assessment = await ctx.domain3.evaluateGovernedHandoffAuthorization({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
  });
  expect("after invalidate mayAuthorize false", assessment.mayAuthorize, false);
  expectTruthy(
    "invalidate denial includes gpra or stale",
    assessment.denialReasons.some(
      (r) =>
        r === "gpra_invalidated" ||
        r === "stale_governed_handoff_entry" ||
        r === "stale_evidence_consumption" ||
        r === "stale_preparation" ||
        r === "lineage_mismatch_authoritative_gpra",
    ),
  );

  await expectThrowsAsync(
    "authorize rejects after Invalidation",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        consumerClassId: CC_FULFILL,
        authorityClassId: HGA,
        authorizedBy: ACTOR,
      }),
    "invalid_handoff_authorization",
  );

  const historical = await ctx.domain3.loadGovernedHandoffAuthorizationAct(act.authorizationActId);
  expect("historical act loadable", historical?.authorizationActId, act.authorizationActId);
  const currency = await ctx.domain3.evaluateHandoffAuthorizationCurrency(act.authorizationActId);
  expect("historical authorization currency stale", currency, "stale");
}

section("Superseded predecessor blocked; successor current path can authorize");

{
  const ctx = await grantPassGpra();
  const { entry: predecessorEntry, consumption: predConsumption } =
    await admitWithConsumption(ctx);
  const successorReady = await prepareSuccessorPassReady(ctx);
  const successorGpra = await ctx.domain3.grantGpra({
    reviewId: successorReady.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      handoffConsumerContextId: HANDOFF_CTX,
      authorityClassId: SSAC,
      supersededBy: ACTOR,
      triggeringGoverningSourceId: "FI-DSN-STD-014",
      constitutionalEvidence: "ST-1 succession for HOF-G2",
    },
  });

  const predAssessment = await ctx.domain3.evaluateGovernedHandoffAuthorization({
    entryId: predecessorEntry.entryId,
    evidenceConsumptionId: predConsumption.consumptionId,
    consumerClassId: CC_MFG,
  });
  expect("predecessor mayAuthorize false", predAssessment.mayAuthorize, false);

  await expectThrowsAsync(
    "authorize rejects superseded predecessor",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        entryId: predecessorEntry.entryId,
        evidenceConsumptionId: predConsumption.consumptionId,
        consumerClassId: CC_MFG,
        authorityClassId: HGA,
        authorizedBy: ACTOR,
      }),
    "invalid_handoff_authorization",
  );

  const successorPrep = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: HANDOFF_CTX,
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  const successorEntry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: successorPrep.preparationId,
    enteredBy: ACTOR,
  });
  const succConsumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: successorEntry.entryId,
    consumedBy: ACTOR,
  });
  const succAct = await ctx.domain3.authorizeGovernedHandoff({
    entryId: successorEntry.entryId,
    evidenceConsumptionId: succConsumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });
  expect("successor act gpra", succAct.gpraId, successorGpra.gpraId);
}

section("Wrong HCCM consumer class / unbound HCBM keys");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);

  const assessment = await ctx.domain3.evaluateGovernedHandoffAuthorization({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_CATALOG,
  });
  expect("wrong CC mayAuthorize false", assessment.mayAuthorize, false);
  expectTruthy(
    "wrong CC denial",
    assessment.denialReasons.includes("hccm_bound_context_keys_unavailable"),
  );

  await expectThrowsAsync(
    "authorize rejects CC without matching entry HCBM keys",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        consumerClassId: CC_CATALOG,
        authorityClassId: HGA,
        authorizedBy: ACTOR,
      }),
    "invalid_handoff_authorization",
  );

  await expectThrowsAsync(
    "authorize rejects invented consumer class",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        consumerClassId: "CC-99" as never,
        authorityClassId: HGA,
        authorizedBy: ACTOR,
      }),
    "invalid_handoff_authorization",
  );
}

section("Brain / MAGAC / DDAC / DSRA / IVAC / SSAC / fabricated HGA cannot authorize");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);
  const base = {
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorizedBy: ACTOR,
  } as const;

  await expectThrowsAsync(
    "Brain sourceAttribution rejected",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: HGA,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "Brain authorizedBy rejected",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: HGA,
        authorizedBy: "brain_runtime",
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "MAGAC cannot authorize",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: MAGAC,
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "IVAC cannot authorize",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: IVAC,
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "SSAC cannot authorize",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: SSAC,
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "DDAC cannot authorize",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: "downstream_disposition_authority_production_obligation_scope",
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "DSRA cannot authorize",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: "downstream_disposition_scope_rework_authority",
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "fabricated HGA id rejected",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: "handoff_governance_authority_forged",
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "actor string alone without HGA rejected",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        authorityClassId: ACTOR,
      }),
    "invalid_handoff_authorization",
  );
}

section("Authorization must not create posture or execute Handoff (R26/R30; R33+)");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);
  const base = {
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  } as const;

  await expectThrowsAsync(
    "handoffPosture claim rejected",
    () => ctx.domain3.authorizeGovernedHandoff({ ...base, handoffPosture: "active" }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "completionActId rejected",
    () => ctx.domain3.authorizeGovernedHandoff({ ...base, completionActId: "completion-1" }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "executesHandoff rejected",
    () => ctx.domain3.authorizeGovernedHandoff({ ...base, executesHandoff: true }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "manufacturingExecutionId rejected",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        manufacturingExecutionId: "mfg-exec-1",
      }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "implicitAuthorization rejected",
    () => ctx.domain3.authorizeGovernedHandoff({ ...base, implicitAuthorization: true }),
    "invalid_handoff_authorization",
  );
  await expectThrowsAsync(
    "configurationDrivenAuthorization rejected",
    () =>
      ctx.domain3.authorizeGovernedHandoff({
        ...base,
        configurationDrivenAuthorization: true,
      }),
    "invalid_handoff_authorization",
  );
}

section("Rehydration: foreign lineage / forged HGA / posture claim rejected");

{
  const ctx = await grantPassGpra();
  const { prep, entry, consumption } = await admitWithConsumption(ctx);
  const act = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });

  const foreignGpra = {
    ...ctx.gpra,
    gpraId: "gpra-00000000-0000-4000-8000-000000000099" as typeof ctx.gpra.gpraId,
  };
  expectThrows(
    "rehydrate rejects foreign GPRA",
    () =>
      rehydrateGovernedHandoffAuthorization(act, {
        entry,
        consumption,
        preparation: prep,
        gpra: foreignGpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_authorization",
  );

  const wrongReview = {
    ...ctx.review,
    reviewId:
      "production-readiness-review-00000000-0000-4000-8000-000000000088" as typeof ctx.review.reviewId,
  };
  expectThrows(
    "rehydrate rejects wrong Review",
    () =>
      rehydrateGovernedHandoffAuthorization(act, {
        entry,
        consumption,
        preparation: prep,
        gpra: ctx.gpra,
        review: wrongReview,
        determination: ctx.determination,
      }),
    "invalid_handoff_authorization",
  );

  const forgedHga = {
    ...act,
    authorityClassId: "approval_authority_production_obligation_scope" as never,
  };
  expectThrows(
    "rehydrate rejects MAGAC substituted for HGA",
    () =>
      rehydrateGovernedHandoffAuthorization(forgedHga, {
        entry,
        consumption,
        preparation: prep,
        gpra: ctx.gpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_authorization",
  );

  const postureClaim = {
    ...act,
    notHandoffPostureDeclaration: false as true,
  };
  expectThrows(
    "rehydrate rejects posture claim collapse",
    () =>
      rehydrateGovernedHandoffAuthorization(postureClaim, {
        entry,
        consumption,
        preparation: prep,
        gpra: ctx.gpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_authorization",
  );

  const ok = rehydrateGovernedHandoffAuthorization(act, {
    entry,
    consumption,
    preparation: prep,
    gpra: ctx.gpra,
    review: ctx.review,
    determination: ctx.determination,
  });
  expect("lawful rehydrate preserves id", ok.authorizationActId, act.authorizationActId);
}

section("R33 boundary: no posture/completion/suspension/recall/withdrawal APIs");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitWithConsumption(ctx);
  const act = await ctx.domain3.authorizeGovernedHandoff({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    consumerClassId: CC_MFG,
    authorityClassId: HGA,
    authorizedBy: ACTOR,
  });

  const repo = ctx.domain3 as unknown as Record<string, unknown>;
  expect("no declareHandoffPosture on repository", "declareHandoffPosture" in repo, false);
  expect("no completeGovernedHandoff on repository", "completeGovernedHandoff" in repo, false);
  expect("no suspendGovernedHandoff on repository", "suspendGovernedHandoff" in repo, false);
  expect("no recallGovernedHandoff on repository", "recallGovernedHandoff" in repo, false);
  expect("no withdrawGovernedHandoff on repository", "withdrawGovernedHandoff" in repo, false);
  expect(
    "authorization remains non-execution",
    act.notHandoffExecution && act.notHandoffPostureDeclaration,
    true,
  );
}

console.log(`\nHOF-G2 authorization tests: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
