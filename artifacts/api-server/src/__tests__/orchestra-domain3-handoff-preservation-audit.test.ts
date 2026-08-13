/**
 * ORCH-IMP — STD-015 HOF-G10 Preservation and Audit (R16–R21).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-preservation-audit.test.ts
 */

import {
  addObligationToProgram,
  bindComplianceBoundary,
  bindComplianceBoundariesToProgram,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  declareProductionIntent,
  DEFERRED_OPERATIVE_AUDIT_CLASSES,
  determineExplorationEntry,
  draftProductionProgram,
  GOVERNED_HANDOFF_PRESERVATION_AUDIT_TRACEABILITY,
  governProductionProgram,
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
import { rehydrateGovernedHandoffPreservationAudit } from "../orchestra/persistence/domain3-rehydration.js";
import { validatePersistedGovernedHandoffPreservationAudit } from "../orchestra/persistence/domain3-validation.js";

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

async function buildGovernedDomain1(): Promise<{
  domain1: Domain1Repository;
  program: ProductionProgram;
  obligationId: ProductionProgram["obligations"][number]["id"];
}> {
  const domain1 = createDomain1Repository();
  const intent = declareProductionIntent({
    purpose: "STD-015 HOF-G10 Preservation Audit",
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
    constitutionalPurpose: "HOF-G10 preservation audit scope",
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
        evaluationMethodDescription: "Decision-stage DTF for HOF-G10",
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
    grounds: "Pass for HOF-G10",
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

async function admitEntryAndConsume(ctx: Awaited<ReturnType<typeof grantPassGpra>>) {
  const prep = await prepareExportReady(ctx);
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
    grounds: "Pass successor for HOF-G10",
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

section("HOF-G10 catalogs and STD-015 R16–R21 traceability");

{
  expect("Six deferred operative audit classes", DEFERRED_OPERATIVE_AUDIT_CLASSES.length, 6);
  expect("deferred catalog", [...DEFERRED_OPERATIVE_AUDIT_CLASSES], [
    "authorization",
    "posture_declaration",
    "completion",
    "suspension",
    "recall",
    "withdrawal",
  ]);
  expectTruthy(
    "HOF-G10 traceability includes R16",
    GOVERNED_HANDOFF_PRESERVATION_AUDIT_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R16",
    ),
  );
  expectTruthy(
    "HOF-G10 traceability includes R21",
    GOVERNED_HANDOFF_PRESERVATION_AUDIT_TRACEABILITY.requirementIds.includes(
      "FI-DSN-STD-015-R21",
    ),
  );
  expect(
    "governing standard STD-015",
    GOVERNED_HANDOFF_PRESERVATION_AUDIT_TRACEABILITY.governingStandardId,
    "FI-DSN-STD-015",
  );
}

section("createGovernedHandoffPreservationAuditRecord not on barrel");

{
  const mod = await import("../orchestra/index.js");
  expect(
    "createGovernedHandoffPreservationAuditRecord not on barrel",
    "createGovernedHandoffPreservationAuditRecord" in mod,
    false,
  );
  expect(
    "evaluateHandoffPreservationAuditAuthorityEffectFromFacts on barrel",
    "evaluateHandoffPreservationAuditAuthorityEffectFromFacts" in mod,
    true,
  );
  expect(
    "DEFERRED_OPERATIVE_AUDIT_CLASSES on barrel",
    "DEFERRED_OPERATIVE_AUDIT_CLASSES" in mod,
    true,
  );
}

section("Lawful preservation audit linking G1+G7; markers; NOT authorization; history ≠ restore force");

{
  const ctx = await grantPassGpra();
  const { prep, entry, consumption } = await admitEntryAndConsume(ctx);

  const audit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });

  expectTruthy(
    "audit id prefix",
    audit.preservationAuditId.startsWith("governed-handoff-preservation-audit-"),
  );
  expect("audit entryId", audit.entryId, entry.entryId);
  expect("audit evidenceConsumptionId", audit.evidenceConsumptionId, consumption.consumptionId);
  expect("audit preparationId", audit.preparationId, prep.preparationId);
  expect("audit gpraId", audit.gpraId, ctx.gpra.gpraId);
  expect("audit historicalPreservationOnly", audit.historicalPreservationOnly, true);
  expect("audit doesNotRestoreForce", audit.doesNotRestoreConstitutionalForce, true);
  expect("audit doesNotOverwrite", audit.doesNotOverwriteUpstreamConstitutionalRecords, true);
  expect(
    "audit doesNotCollapsePrep",
    audit.doesNotCollapsePreparationAndOperativeHistory,
    true,
  );
  expect("audit doesNotAuthorizeErasure", audit.doesNotAuthorizeErasureOrRedaction, true);
  expect("audit notHandoffAuthorization", audit.notHandoffAuthorization, true);
  expect("audit notHandoffPosture", audit.notHandoffPostureDeclaration, true);
  expect("audit notHandoffExecution", audit.notHandoffExecution, true);
  expect("audit hpamExtensionFrameworkOnly", audit.hpamExtensionFrameworkOnly, true);
  expect(
    "audit doesNotCreateOperativeHoemActRecords",
    audit.doesNotCreateOperativeHoemActRecords,
    true,
  );
  expect(
    "audit evidencePackageIsNotErasureAuthorization",
    audit.evidencePackageIsNotErasureAuthorization,
    true,
  );
  expect("audit deferred classes length", audit.deferredOperativeAuditClasses.length, 6);
  expect("audit consumer keys", [...audit.consumerCategoryKeys], [...CONSUMER_KEYS]);

  const loaded = await ctx.domain3.loadGovernedHandoffPreservationAudit(
    audit.preservationAuditId,
  );
  expect("loaded audit id", loaded?.preservationAuditId, audit.preservationAuditId);

  const byEntry = await ctx.domain3.listGovernedHandoffPreservationAuditsByEntry(entry.entryId);
  expect("list by entry length", byEntry.length, 1);
  const byGpra = await ctx.domain3.listGovernedHandoffPreservationAuditsByGpra(ctx.gpra.gpraId);
  expect("list by gpra length", byGpra.length, 1);

  const effect = await ctx.domain3.evaluateHandoffPreservationAuditAuthorityEffect(
    audit.preservationAuditId,
  );
  expect("authority effect historical_only", effect, "historical_only");

  const linked = await ctx.domain3.evaluateHandoffPreservationAuditLinkedCurrency(
    audit.preservationAuditId,
  );
  expect("linked authorityEffect", linked.authorityEffect, "historical_only");
  expect("linked doesNotRestore", linked.doesNotRestoreConstitutionalForce, true);
  expect("linked entry current", linked.linkedEntryCurrency, "current");
  expect("linked consumption current", linked.linkedConsumptionCurrency, "current");
}

section("Missing entry / missing consumption / foreign consumption rejected");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitEntryAndConsume(ctx);

  await expectThrowsAsync(
    "record rejects missing entry",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: "governed-handoff-entry-00000000-0000-4000-8000-000000000099" as never,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "record rejects missing consumption",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId:
          "governed-handoff-evidence-consumption-00000000-0000-4000-8000-000000000099" as never,
        preservedBy: ACTOR,
      }),
    "invalid_handoff_preservation_audit",
  );

  const prep2 = await ctx.domain3.prepareGovernedHandoff({
    obligationId: ctx.obligationId,
    handoffConsumerContextId: "handoff-consumer-context-opaque-002",
    consumerCategoryKeys: [...CONSUMER_KEYS],
    preparedBy: ACTOR,
  });
  const entry2 = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep2.preparationId,
    enteredBy: ACTOR,
  });
  const consumption2 = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry2.entryId,
    consumedBy: ACTOR,
  });

  await expectThrowsAsync(
    "record rejects foreign consumption (other entry)",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption2.consumptionId,
        preservedBy: ACTOR,
      }),
    "invalid_handoff_preservation_audit",
  );
}

section("After Invalidation: G1/G7/prep/audit still loadable; authority historical_only; new consideration blocked");

{
  const ctx = await grantPassGpra();
  const { prep, entry, consumption } = await admitEntryAndConsume(ctx);
  const audit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
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

  const historicalPrep = await ctx.domain3.loadGovernedHandoffPreparation(prep.preparationId);
  expect("prep still loadable after invalidation", historicalPrep?.preparationId, prep.preparationId);

  const historicalEntry = await ctx.domain3.loadGovernedHandoffEntry(entry.entryId);
  expect("entry still loadable after invalidation", historicalEntry?.entryId, entry.entryId);

  const historicalConsumption = await ctx.domain3.loadGovernedHandoffEvidenceConsumption(
    consumption.consumptionId,
  );
  expect(
    "consumption still loadable after invalidation",
    historicalConsumption?.consumptionId,
    consumption.consumptionId,
  );

  const historicalAudit = await ctx.domain3.loadGovernedHandoffPreservationAudit(
    audit.preservationAuditId,
  );
  expect(
    "preservation audit still loadable after invalidation",
    historicalAudit?.preservationAuditId,
    audit.preservationAuditId,
  );

  const effect = await ctx.domain3.evaluateHandoffPreservationAuditAuthorityEffect(
    audit.preservationAuditId,
  );
  expect("post-invalidation authority still historical_only", effect, "historical_only");

  const linked = await ctx.domain3.evaluateHandoffPreservationAuditLinkedCurrency(
    audit.preservationAuditId,
  );
  expect("post-invalidation linked entry stale", linked.linkedEntryCurrency, "stale");
  expect("post-invalidation linked consumption stale", linked.linkedConsumptionCurrency, "stale");
  expect("post-invalidation linked effect historical_only", linked.authorityEffect, "historical_only");

  const entryCurrency = await ctx.domain3.evaluateHandoffEntryCurrency(entry.entryId);
  expect("G1 currency stale blocks new consideration", entryCurrency, "stale");

  const consumptionAssessment = await ctx.domain3.evaluateGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
  });
  expect("G7 mayConsume false after invalidation", consumptionAssessment.mayConsume, false);

  // R19: may still record another preservation audit after invalidation (history of consideration).
  const postInvalidationAudit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });
  expectTruthy(
    "R19 preservation after invalidation succeeds",
    !!postInvalidationAudit.preservationAuditId,
  );
  expect(
    "post-invalidation audit still historical_only",
    await ctx.domain3.evaluateHandoffPreservationAuditAuthorityEffect(
      postInvalidationAudit.preservationAuditId,
    ),
    "historical_only",
  );
}

section("Superseded predecessor: historical records preserved; no authority restore");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitEntryAndConsume(ctx);
  const predAudit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });

  const successorReady = await prepareSuccessorPassReady(ctx);
  await ctx.domain3.grantGpra({
    reviewId: successorReady.successorReview.reviewId,
    grantedBy: ACTOR,
    st1Supersession: {
      predecessorGpraId: ctx.gpra.gpraId,
      handoffConsumerContextId: HANDOFF_CTX,
      authorityClassId: SSAC,
      supersededBy: ACTOR,
      triggeringGoverningSourceId: "FI-DSN-STD-014",
      constitutionalEvidence: "ST-1 succession for HOF-G10",
    },
  });

  const historical = await ctx.domain3.loadGovernedHandoffPreservationAudit(
    predAudit.preservationAuditId,
  );
  expect("superseded predecessor audit loadable", historical?.preservationAuditId, predAudit.preservationAuditId);
  expect(
    "superseded predecessor authority historical_only",
    await ctx.domain3.evaluateHandoffPreservationAuditAuthorityEffect(predAudit.preservationAuditId),
    "historical_only",
  );

  const entryCurrency = await ctx.domain3.evaluateHandoffEntryCurrency(entry.entryId);
  expect("superseded predecessor entry stale", entryCurrency, "stale");
}

section("Rehydration foreign/wrong lineage fails");

{
  const ctx = await grantPassGpra();
  const { prep, entry, consumption } = await admitEntryAndConsume(ctx);
  const audit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });
  validatePersistedGovernedHandoffPreservationAudit(audit);

  const foreignGpra = {
    ...ctx.gpra,
    gpraId: "gpra-00000000-0000-4000-8000-000000000099" as typeof ctx.gpra.gpraId,
  };
  expectThrows(
    "rehydrate rejects foreign GPRA",
    () =>
      rehydrateGovernedHandoffPreservationAudit(audit, {
        entry,
        consumption,
        preparation: prep,
        gpra: foreignGpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_preservation_audit",
  );

  const wrongReview = {
    ...ctx.review,
    reviewId:
      "production-readiness-review-00000000-0000-4000-8000-000000000088" as typeof ctx.review.reviewId,
  };
  expectThrows(
    "rehydrate rejects wrong Review",
    () =>
      rehydrateGovernedHandoffPreservationAudit(audit, {
        entry,
        consumption,
        preparation: prep,
        gpra: ctx.gpra,
        review: wrongReview,
        determination: ctx.determination,
      }),
    "invalid_handoff_preservation_audit",
  );

  const other = await grantPassGpra();
  const otherPath = await admitEntryAndConsume(other);
  expectThrows(
    "rehydrate rejects foreign consumption",
    () =>
      rehydrateGovernedHandoffPreservationAudit(audit, {
        entry,
        consumption: otherPath.consumption,
        preparation: prep,
        gpra: ctx.gpra,
        review: ctx.review,
        determination: ctx.determination,
      }),
    "invalid_handoff_preservation_audit",
  );
}

section("Brain cannot mint; HOEM act fields rejected; R22 boundary");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitEntryAndConsume(ctx);

  await expectThrowsAsync(
    "Brain sourceAttribution rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        sourceAttribution: "brain_runtime",
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "writing_engine preservedBy rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: "writing_engine",
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "MAGAC as preservationAuthorityClassId rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        preservationAuthorityClassId: MAGAC,
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "IVAC as preservationAuthorityClassId rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        preservationAuthorityClassId: IVAC,
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "HOEM authorization act field rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        handoffAuthorizationActId: "hoem-auth-act-1",
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "HOEM act instances rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        hoemActInstances: [{ kind: "authorization" }],
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "eraseUpstreamHistory rejected (R21)",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        eraseUpstreamHistory: true,
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "restoreConstitutionalForce rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        restoreConstitutionalForce: true,
      }),
    "invalid_handoff_preservation_audit",
  );

  await expectThrowsAsync(
    "R22 brainAuthorizeHandoff rejected",
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
    "invented handoffAuthorityClassId rejected",
    () =>
      ctx.domain3.recordGovernedHandoffPreservationAudit({
        entryId: entry.entryId,
        evidenceConsumptionId: consumption.consumptionId,
        preservedBy: ACTOR,
        handoffAuthorityClassId: "handoff_authority_minted",
      }),
    "invalid_handoff_preservation_audit",
  );
}

section("G1/G7 smoke; G8/G9/G11 smoke");

{
  const ctx = await grantPassGpra();
  const prep = await prepareExportReady(ctx);
  expectTruthy("G11 prep export_ready", prep.eligibilityLayerCondition === "export_ready");

  const entry = await ctx.domain3.admitGovernedHandoffEntry({
    preparationId: prep.preparationId,
    enteredBy: ACTOR,
  });
  expect("G1 entry currency current", await ctx.domain3.evaluateHandoffEntryCurrency(entry.entryId), "current");

  const consumption = await ctx.domain3.recordGovernedHandoffEvidenceConsumption({
    entryId: entry.entryId,
    consumedBy: ACTOR,
  });
  expect(
    "G7 consumption currency current",
    await ctx.domain3.evaluateHandoffEvidenceConsumptionCurrency(consumption.consumptionId),
    "current",
  );

  const audit = await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });
  expectTruthy("G10 audit recorded", !!audit.preservationAuditId);

  // G8 invalidation smoke
  await ctx.domain3.invalidateGpra({
    gpraId: ctx.gpra.gpraId,
    itFamily: "material_compliance_boundary_change",
    triggeringGoverningSourceId: "FI-DSN-STD-001",
    constitutionalEvidence: "G8 smoke invalidation for HOF-G10 suite",
    authorityClassId: IVAC,
    invalidatedBy: ACTOR,
    materialNonComplianceEstablished: true,
  });
  expectTruthy(
    "G8 invalidation leaves audit loadable",
    !!(await ctx.domain3.loadGovernedHandoffPreservationAudit(audit.preservationAuditId)),
  );
}

section("G9 supersession smoke");

{
  const ctx = await grantPassGpra();
  const { entry, consumption } = await admitEntryAndConsume(ctx);
  await ctx.domain3.recordGovernedHandoffPreservationAudit({
    entryId: entry.entryId,
    evidenceConsumptionId: consumption.consumptionId,
    preservedBy: ACTOR,
  });
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
      constitutionalEvidence: "G9 smoke succession for HOF-G10",
    },
  });
  expectTruthy("G9 successor GPRA granted", !!successorGpra.gpraId);
  expect(
    "G9 predecessor entry stale",
    await ctx.domain3.evaluateHandoffEntryCurrency(entry.entryId),
    "stale",
  );
}

console.log(`\n${"=".repeat(60)}`);
console.log(`HOF-G10 Preservation Audit: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
