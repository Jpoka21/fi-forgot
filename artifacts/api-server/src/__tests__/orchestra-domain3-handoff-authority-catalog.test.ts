/**
 * ORCH-IMP — STD-015 HOF-G9 Catalog Integration (R66–R69).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-authority-catalog.test.ts
 */

import {
  assertHgaActTypeStringFailClosed,
  assertHgaMatrixActMayBePerformed,
  assertHgaMatrixActType,
  assertNotProhibitedHandoffActPerformer,
  assertStd015SoleHandoffAuthorityClass,
  assessHandoffAuthorityCatalogIntegration,
  assessHgaActCatalogBindingScope,
  createDomain1Repository,
  createDomain2Repository,
  createDomain3Repository,
  FORBIDDEN_INVENTED_HGA_ACT_SCOPES,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
  FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES,
  FROZEN_HANDOFF_POSTURE_CLASSES,
  getHgaMatrixActOperativeStatus,
  HCCM_CONSUMER_CLASS_CATALOG,
  HGA_MATRIX_ACT_TYPE_CATALOG,
  HGA_MATRIX_ACT_TYPES,
  HOEM_EXIT_BOUNDARY_ACT_TYPE,
  HOEM_FORBIDDEN_MATRIX_EXPECTATIONS,
  HOEM_MATRIX_EXPECTATION_CATALOG,
  HOEM_PEER_NON_MATRIX_EXIT_BOUNDARY_EXPECTATION,
  HPPM_POSTURE_AFFINITY_CATALOG,
  HSLM_EIGHT_STATE_CATALOG,
  isHgaMatrixActType,
  isOrchestraConstitutionalError,
  isProhibitedHandoffActPerformerClass,
  isStd015SoleHandoffAuthorityClass,
  PROHIBITED_HANDOFF_ACT_PERFORMER_CLASSES,
  resolveHgaMatrixActType,
  STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG,
  validateHccmCrossCatalogTuple,
  VOLUME_06_HANDOFF_POSTURE_CLASSES,
  type Domain3Repository,
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

function section(name: string) {
  console.log(`\n${name}`);
}

section("1. Sole HGA class; no other authority class");

{
  expect("sole catalog length 1", STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG.length, 1);
  expect(
    "sole class is handoff_governance_authority",
    STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG[0],
    "handoff_governance_authority",
  );
  expectTruthy(
    "isStd015SoleHandoffAuthorityClass",
    isStd015SoleHandoffAuthorityClass("handoff_governance_authority"),
  );
  expect("rejects magac class", isStd015SoleHandoffAuthorityClass("magac_approval_authority"), false);
  expectThrows(
    "assertStd015Sole rejects invented class",
    () => assertStd015SoleHandoffAuthorityClass("handoff_exit_authority"),
    "invalid_handoff_authority_catalog",
  );
}

section("2. Exact six matrix act types");

{
  expect("matrix length 6", HGA_MATRIX_ACT_TYPES.length, 6);
  expect("catalog length 6", HGA_MATRIX_ACT_TYPE_CATALOG.length, 6);
  expect(
    "exact six ids",
    [...HGA_MATRIX_ACT_TYPES],
    [
      "authorization",
      "posture_declaration",
      "completion",
      "suspension",
      "withdrawal",
      "recall",
    ],
  );
}

section("3. authorization/posture_declaration/completion OPERATIVE");

{
  for (const t of ["authorization", "posture_declaration", "completion"] as const) {
    expect(`${t} operative`, getHgaMatrixActOperativeStatus(t), "operative");
    try {
      assertHgaMatrixActMayBePerformed(t);
      passed++;
      console.log(`  ✓ ${t} assertHgaMatrixActMayBePerformed ok`);
    } catch {
      failed++;
      failures.push(`${t} assertHgaMatrixActMayBePerformed ok`);
      console.log(`  ✗ ${t} assertHgaMatrixActMayBePerformed ok`);
    }
  }
}

section("4. suspension/withdrawal OPERATIVE; recall CATALOGED_DEFERRED");

{
  expect("suspension operative", getHgaMatrixActOperativeStatus("suspension"), "operative");
  expectTruthy("suspension still matrix member", isHgaMatrixActType("suspension"));
  try {
    assertHgaMatrixActMayBePerformed("suspension");
    passed++;
    console.log("  ✓ suspension assertHgaMatrixActMayBePerformed ok");
  } catch {
    failed++;
    failures.push("suspension assertHgaMatrixActMayBePerformed ok");
    console.log("  ✗ suspension assertHgaMatrixActMayBePerformed ok");
  }
  expect("withdrawal operative", getHgaMatrixActOperativeStatus("withdrawal"), "operative");
  expectTruthy("withdrawal still matrix member", isHgaMatrixActType("withdrawal"));
  try {
    assertHgaMatrixActMayBePerformed("withdrawal");
    passed++;
    console.log("  ✓ withdrawal assertHgaMatrixActMayBePerformed ok");
  } catch {
    failed++;
    failures.push("withdrawal assertHgaMatrixActMayBePerformed ok");
    console.log("  ✗ withdrawal assertHgaMatrixActMayBePerformed ok");
  }
  for (const t of ["recall"] as const) {
    expect(`${t} deferred`, getHgaMatrixActOperativeStatus(t), "cataloged_deferred");
    expectTruthy(`${t} still matrix member`, isHgaMatrixActType(t));
    expectThrows(
      `${t} assertHgaMatrixActMayBePerformed throws`,
      () => assertHgaMatrixActMayBePerformed(t),
      "invalid_handoff_authority_catalog",
    );
  }
}

section("5. Unknown / rejection / exit matrix types rejected");

{
  expectThrows(
    "unknown act type",
    () => resolveHgaMatrixActType("invented_act"),
    "invalid_handoff_authority_catalog",
  );
  expectThrows(
    "rejection not matrix",
    () => assertHgaMatrixActType("rejection"),
    "invalid_handoff_authority_catalog",
  );
  expectThrows(
    "exit_boundary not matrix",
    () => assertHgaMatrixActType("exit_boundary"),
    "invalid_handoff_authority_catalog",
  );
  expectThrows(
    "handoff_exit_act forbidden",
    () => assertHgaActTypeStringFailClosed("handoff_exit_act"),
    "invalid_handoff_authority_catalog",
  );
  expectThrows(
    "handoff_lifecycle_rejection_act forbidden",
    () => assertHgaActTypeStringFailClosed("handoff_lifecycle_rejection_act"),
    "invalid_handoff_authority_catalog",
  );
  expectThrows(
    "deferred recall as operative fails",
    () =>
      assertHgaActTypeStringFailClosed("recall", {
        requireOperativePerformance: true,
      }),
    "invalid_handoff_authority_catalog",
  );
  try {
    assertHgaActTypeStringFailClosed("withdrawal", {
      requireOperativePerformance: true,
    });
    passed++;
    console.log("  ✓ operative withdrawal requireOperativePerformance ok");
  } catch {
    failed++;
    failures.push("operative withdrawal requireOperativePerformance ok");
    console.log("  ✗ operative withdrawal requireOperativePerformance ok");
  }
  expectTruthy(
    "forbidden invented scopes include rejection act",
    (FORBIDDEN_INVENTED_HGA_ACT_SCOPES as readonly string[]).includes(
      "handoff_lifecycle_rejection_act",
    ),
  );
}

section("6. Separate HOEM expectations; collapse denied");

{
  expect("six matrix HOEM expectations", HOEM_MATRIX_EXPECTATION_CATALOG.length, 6);
  const ids = HOEM_MATRIX_EXPECTATION_CATALOG.map((e) => e.hoemExpectation);
  expect("distinct HOEM ids", new Set(ids).size, 6);
  for (const entry of HOEM_MATRIX_EXPECTATION_CATALOG) {
    expect(
      `${entry.hoemExpectation} matrix membership`,
      entry.matrixMembership,
      "matrix",
    );
    expect(`${entry.hoemExpectation} not seventh`, entry.isSeventhMatrixType, false);
  }
  expectTruthy(
    "rejection forbidden as matrix",
    (HOEM_FORBIDDEN_MATRIX_EXPECTATIONS as readonly string[]).includes("rejection"),
  );
  const collapse = assessHgaActCatalogBindingScope({
    actType: "authorization",
    bindingId: "binding-1",
    collapsesActTypes: true,
  });
  expect("collapse denied", collapse.mayBindSingleContext, false);
  expectTruthy(
    "collapse reason",
    collapse.denialReasons.includes("act_type_collapse_denied"),
  );
}

section("7. R68 single binding; multi-binding span denied");

{
  const ok = assessHgaActCatalogBindingScope({
    actType: "posture_declaration",
    bindingId: "binding-cc01-1",
    hppmmPostureChainPresent: true,
  });
  expect("single binding ok", ok.mayBindSingleContext, true);
  expect("r68 marker", ok.r68SingleHccmBoundConsumerContext, true);

  const multi = assessHgaActCatalogBindingScope({
    actType: "authorization",
    bindingId: "binding-1",
    spansMultipleBindings: true,
  });
  expect("multi-binding denied", multi.mayBindSingleContext, false);
  expectTruthy(
    "multi reason",
    multi.denialReasons.includes("multi_binding_span_denied"),
  );

  const missingPosture = assessHgaActCatalogBindingScope({
    actType: "posture_declaration",
    bindingId: "binding-1",
    hppmmPostureChainPresent: false,
  });
  expect("posture chain required", missingPosture.mayBindSingleContext, false);
}

section("8. Catalog membership does not authorize/bind/declare/complete/exit");

{
  const assessment = assessHandoffAuthorityCatalogIntegration();
  expect("integrityOk", assessment.integrityOk, true);
  expect("doesNotCreateAuthority", assessment.catalogMembershipDoesNotCreateAuthority, true);
  expect("doesNotAuthorize", assessment.catalogMembershipDoesNotAuthorize, true);
  expect("doesNotBind", assessment.catalogMembershipDoesNotBind, true);
  expect("doesNotDeclare", assessment.catalogMembershipDoesNotDeclare, true);
  expect("doesNotComplete", assessment.catalogMembershipDoesNotComplete, true);
  expect("doesNotExit", assessment.catalogMembershipDoesNotExit, true);
  expect("r66", assessment.r66SoleHgaAndSixTypeMatrix, true);
  expect("r67", assessment.r67DistinctActTypeAttributionAndHoem, true);
  expect("r68", assessment.r68SingleHccmBindingNoMerge, true);
  expect("r69", assessment.r69ProhibitedPerformers, true);
}

section("9. Prohibited performers R69");

{
  const prohibited = [
    "gpra_grant",
    "magac_approval_authority",
    "approval",
    "ddac_downstream_disposition",
    "dsra_rework_authorization",
    "ivac_invalidation_authority",
    "ssac_supersession_authority",
    "brain_domain3",
    "g11_export_contract",
    "downstream_consumer_domain",
  ] as const;
  for (const p of prohibited) {
    expectTruthy(`prohibited ${p}`, isProhibitedHandoffActPerformerClass(p));
    expectThrows(
      `assertNot ${p}`,
      () => assertNotProhibitedHandoffActPerformer(p),
      "invalid_handoff_authority_catalog",
    );
  }
  expect(
    "catalog lists performers",
    PROHIBITED_HANDOFF_ACT_PERFORMER_CLASSES.length >= 10,
    true,
  );
  try {
    assertNotProhibitedHandoffActPerformer("governance-authority-015");
    passed++;
    console.log("  ✓ HGA actor string not prohibited");
  } catch {
    failed++;
    failures.push("HGA actor string not prohibited");
    console.log("  ✗ HGA actor string not prohibited");
  }
}

section("10. HSLM still exactly eight; no exited/accepted");

{
  expect("HSLM catalog 8", HSLM_EIGHT_STATE_CATALOG.length, 8);
  expect("frozen HSLM 8", FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.length, 8);
  const ids = HSLM_EIGHT_STATE_CATALOG.map((e) => e.stateId);
  expect("no exited", ids.includes("exited" as never), false);
  expect("no accepted", ids.includes("accepted" as never), false);
  expect(
    "rejected denotation_only",
    HSLM_EIGHT_STATE_CATALOG.find((e) => e.stateId === "rejected")?.statusKind,
    "denotation_only",
  );
  expect(
    "suspended operative_transition",
    HSLM_EIGHT_STATE_CATALOG.find((e) => e.stateId === "suspended")?.statusKind,
    "operative_transition",
  );
}

section("11. HCCM still CC-01..06");

{
  expect("HCCM catalog 6", HCCM_CONSUMER_CLASS_CATALOG.length, 6);
  const ids = HCCM_CONSUMER_CLASS_CATALOG.map((e) => e.consumerClassId);
  expect("CC-01..06", ids, ["CC-01", "CC-02", "CC-03", "CC-04", "CC-05", "CC-06"]);
  const tuple = validateHccmCrossCatalogTuple({
    consumerClassId: "CC-01",
    hcbmBoundaryKeys: ["catalog", "archival"],
    downstreamConsiderationDomain:
      HCCM_CONSUMER_CLASS_CATALOG[0]!.downstreamConsiderationDomain,
  });
  expect("tuple valid", tuple.valid, true);
  expect("tuple no authority", tuple.catalogMembershipDoesNotCreateAuthority, true);
}

section("12. none affinity not third Volume 06 posture class");

{
  expect("affinity catalog includes none", HPPM_POSTURE_AFFINITY_CATALOG.includes("none"), true);
  expect("Volume 06 posture classes = 2", VOLUME_06_HANDOFF_POSTURE_CLASSES.length, 2);
  expect(
    "Volume 06 excludes none",
    (VOLUME_06_HANDOFF_POSTURE_CLASSES as readonly string[]).includes("none"),
    false,
  );
  expect("frozen posture classes still 3 (incl none affinity)", FROZEN_HANDOFF_POSTURE_CLASSES.length, 3);
  const assessment = assessHandoffAuthorityCatalogIntegration();
  expect(
    "noneAffinityIsNotThirdVolume06PostureClass",
    assessment.noneAffinityIsNotThirdVolume06PostureClass,
    true,
  );
}

section("13. exit_boundary remains non-matrix peer");

{
  expect(
    "peer expectation id",
    HOEM_PEER_NON_MATRIX_EXIT_BOUNDARY_EXPECTATION.hoemExpectation,
    HOEM_EXIT_BOUNDARY_ACT_TYPE,
  );
  expect(
    "peer non-matrix",
    HOEM_PEER_NON_MATRIX_EXIT_BOUNDARY_EXPECTATION.matrixMembership,
    "peer_non_matrix",
  );
  expect(
    "not seventh matrix type",
    HOEM_PEER_NON_MATRIX_EXIT_BOUNDARY_EXPECTATION.isSeventhMatrixType,
    false,
  );
  expect(
    "exit_boundary not in matrix",
    (HGA_MATRIX_ACT_TYPES as readonly string[]).includes("exit_boundary"),
    false,
  );
  try {
    assertHgaActTypeStringFailClosed("exit_boundary", {
      allowPeerNonMatrixExitBoundary: true,
    });
    passed++;
    console.log("  ✓ exit_boundary allowed as peer non-matrix");
  } catch {
    failed++;
    failures.push("exit_boundary allowed as peer non-matrix");
    console.log("  ✗ exit_boundary allowed as peer non-matrix");
  }
  expectThrows(
    "exit_boundary rejected as matrix",
    () => assertHgaActTypeStringFailClosed("exit_boundary"),
    "invalid_handoff_authority_catalog",
  );
  const assessment = assessHandoffAuthorityCatalogIntegration();
  expect("exitBoundaryIsSeventhMatrixType false", assessment.exitBoundaryIsSeventhMatrixType, false);
  expect("peerNonMatrixHoemExpectation", assessment.peerNonMatrixHoemExpectation, "exit_boundary");
}

section("14. rejectHandoffActLayer undefined; handoff_lifecycle_rejection_act absent");

{
  const domain1 = createDomain1Repository();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2, undefined, domain1);
  const repo = domain3 as unknown as Record<string, unknown>;
  expect("rejectHandoffActLayer undefined", typeof repo.rejectHandoffActLayer, "undefined");
  const hga = FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!;
  expect(
    "rejection act absent from scopes",
    hga.authorizedConstitutionalScopes.includes("handoff_lifecycle_rejection_act" as never),
    false,
  );
  expect("exactly five operative scopes", hga.authorizedConstitutionalScopes.length, 5);
  expect(
    "scopes are auth/posture/completion/suspension/withdrawal",
    [...hga.authorizedConstitutionalScopes],
    [
      "handoff_authorization_act",
      "handoff_posture_declaration_act",
      "handoff_completion_act",
      "handoff_suspension_act",
      "handoff_withdrawal_act",
    ],
  );
}

section("15. No recall mint APIs; suspend/withdraw governed paths present");

{
  const domain1 = createDomain1Repository();
  const domain2 = createDomain2Repository(domain1);
  const domain3 = createDomain3Repository(domain2, undefined, domain1) as Domain3Repository;
  const repo = domain3 as unknown as Record<string, unknown>;
  expect("no suspendHandoff", typeof repo.suspendHandoff, "undefined");
  expect("suspendGovernedHandoff present", typeof repo.suspendGovernedHandoff, "function");
  expect("no recallHandoff", typeof repo.recallHandoff, "undefined");
  expect("no withdrawHandoff", typeof repo.withdrawHandoff, "undefined");
  expect("withdrawGovernedHandoff present", typeof repo.withdrawGovernedHandoff, "function");
  expectTruthy(
    "assessHandoffAuthorityCatalogIntegration on repo",
    typeof domain3.assessHandoffAuthorityCatalogIntegration === "function",
  );
  const fromRepo = await domain3.assessHandoffAuthorityCatalogIntegration();
  expect("repo assessment integrity", fromRepo.integrityOk, true);
}

section("16. Barrel exports catalog helpers not mint factories");

{
  const mod = await import("../orchestra/index.js");
  expect("assessHandoffAuthorityCatalogIntegration exported", "assessHandoffAuthorityCatalogIntegration" in mod, true);
  expect("resolveHgaMatrixActType exported", "resolveHgaMatrixActType" in mod, true);
  expect("assertHgaMatrixActMayBePerformed exported", "assertHgaMatrixActMayBePerformed" in mod, true);
  expect("assessHgaActCatalogBindingScope exported", "assessHgaActCatalogBindingScope" in mod, true);
  expect("isProhibitedHandoffActPerformerClass exported", "isProhibitedHandoffActPerformerClass" in mod, true);
  expect("HGA_MATRIX_ACT_TYPE_CATALOG exported", "HGA_MATRIX_ACT_TYPE_CATALOG" in mod, true);
  expect("performHgaAct not exported", "performHgaAct" in mod, false);
  expect("suspendHandoff not exported", "suspendHandoff" in mod, false);
  expect("withdrawHandoff not exported", "withdrawHandoff" in mod, false);
  expect("recallHandoff not exported", "recallHandoff" in mod, false);
  expect("rejectHandoffActLayer not exported", "rejectHandoffActLayer" in mod, false);
  expect(
    "createGovernedHandoffAuthorizationActRecord not on barrel",
    "createGovernedHandoffAuthorizationActRecord" in mod,
    false,
  );
}

section("17. HOF-G6-U1 foundation established; withdrawal operative; recall minting still deferred");

{
  const assessment = assessHandoffAuthorityCatalogIntegration();
  expect("hofG6U1SharedFoundationEstablished", assessment.hofG6U1SharedFoundationEstablished, true);
  expect(
    "hofG6ActSpecificMechanicsDeferredToU3U4",
    assessment.hofG6ActSpecificMechanicsDeferredToU3U4,
    false,
  );
  expect("hofG6RecallMechanicsDeferredToU4", assessment.hofG6RecallMechanicsDeferredToU4, true);
  expect("withdrawRecallApisNotProvided", assessment.withdrawRecallApisNotProvided, false);
  expect(
    "withdrawGovernedHandoffMayBeProvided",
    assessment.withdrawGovernedHandoffMayBeProvided,
    true,
  );
  expect("recallApisNotProvided", assessment.recallApisNotProvided, true);
  expect(
    "suspendGovernedHandoffMayBeProvided",
    assessment.suspendGovernedHandoffMayBeProvided,
    true,
  );
  expect("performHgaActFactoryNotProvided", assessment.performHgaActFactoryNotProvided, true);
  expect("suspension operative", getHgaMatrixActOperativeStatus("suspension"), "operative");
  expect("withdrawal operative", getHgaMatrixActOperativeStatus("withdrawal"), "operative");
  expect("recall still cataloged_deferred", getHgaMatrixActOperativeStatus("recall"), "cataloged_deferred");
  expectTruthy(
    "recall U1 foundation flag",
    resolveHgaMatrixActType("recall").sharedFoundationEstablishedHofG6U1,
  );
  const mod = await import("../orchestra/index.js");
  expect("no suspendHandoffAct", "suspendHandoffAct" in mod, false);
  expect("no withdrawHandoffAct", "withdrawHandoffAct" in mod, false);
  expect("no recallHandoffAct", "recallHandoffAct" in mod, false);
  expect("no expireHandoff", "expireHandoff" in mod, false);
  expect("assessHofG6U1 exported", "assessHofG6U1SharedLifecycleFoundation" in mod, true);
  expect("performHgaAct not exported", "performHgaAct" in mod, false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
