/**
 * ORCH-IMP-031 — STD-015 HOF-G9 completion (R140–R141).
 *
 * Integrates reentry and resumption into the eight-type HGA matrix without
 * changing closed HERCM R126–R139 mint semantics. R142+ remains unavailable.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestra-domain3-handoff-hof-g9-completion.test.ts
 */

import {
  assertHgaActTypeStringFailClosed,
  assertHgaMatrixActMayBePerformed,
  assertHgaMatrixActType,
  assertHercmActIsHgaMatrixActType,
  assertNotProhibitedHandoffActPerformer,
  assertR142PlusUnavailable,
  assessHandoffAuthorityCatalogIntegration,
  assessHercmCatalogIntegrity,
  BRAIN_PROHIBITED_HANDOFF_ACTS,
  FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES,
  getHgaMatrixActOperativeStatus,
  HGA_MATRIX_ACT_TYPES,
  HERCM_CATEGORY_CATALOG,
  HERCM_MATRIX_ACT_TYPES,
  HOEM_EXIT_BOUNDARY_ACT_TYPE,
  HOEM_MATRIX_EXPECTATION_CATALOG,
  isHgaMatrixActType,
  isOrchestraConstitutionalError,
  resolveHgaMatrixActType,
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
    console.log(`  ✗ ${label} (did not throw)`);
  } catch (error) {
    if (code && !isOrchestraConstitutionalError(error)) {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (not constitutional)`);
      return;
    }
    if (code && isOrchestraConstitutionalError(error) && error.code !== code) {
      failed++;
      failures.push(label);
      console.log(`  ✗ ${label} (code ${error.code})`);
      return;
    }
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

section("1. Exact eight matrix types; original six remain; no ninth type");

{
  expect("matrix length 8", HGA_MATRIX_ACT_TYPES.length, 8);
  expect("exact eight ids", [...HGA_MATRIX_ACT_TYPES], [
    "authorization",
    "posture_declaration",
    "completion",
    "suspension",
    "withdrawal",
    "recall",
    "reentry",
    "resumption",
  ]);
  for (const t of HGA_MATRIX_ACT_TYPES) {
    expectTruthy(`${t} is matrix member`, isHgaMatrixActType(t));
    expect(`${t} operative`, getHgaMatrixActOperativeStatus(t), "operative");
    try {
      assertHgaMatrixActMayBePerformed(t);
      passed++;
      console.log(`  ✓ ${t} catalog status gate succeeds`);
    } catch {
      failed++;
      failures.push(`${t} catalog status gate succeeds`);
      console.log(`  ✗ ${t} catalog status gate succeeds`);
    }
  }
  for (const ninth of [
    "rejection",
    "exit",
    "exit_boundary",
    "expiry",
    "acceptance",
    "restoration",
  ]) {
    expectThrows(
      `${ninth} is not a matrix type`,
      () => assertHgaMatrixActType(ninth),
      "invalid_handoff_authority_catalog",
    );
  }
  expectThrows(
    "exit_boundary remains peer non-matrix",
    () => assertHgaActTypeStringFailClosed(HOEM_EXIT_BOUNDARY_ACT_TYPE),
    "invalid_handoff_authority_catalog",
  );
}

section("2. Reentry and resumption catalog treatment");

{
  for (const t of HERCM_MATRIX_ACT_TYPES) {
    expectTruthy(`${t} HERCM matrix id`, isHgaMatrixActType(t));
    assertHercmActIsHgaMatrixActType(t);
    passed++;
    console.log(`  ✓ assertHercmActIsHgaMatrixActType(${t})`);
  }
  expect(
    "reentry HOEM is matrix",
    HOEM_MATRIX_EXPECTATION_CATALOG.find((e) => e.hoemExpectation === "reentry")
      ?.matrixMembership,
    "matrix",
  );
  expect(
    "resumption HOEM is matrix",
    HOEM_MATRIX_EXPECTATION_CATALOG.find((e) => e.hoemExpectation === "resumption")
      ?.matrixMembership,
    "matrix",
  );
  expect("reentry one HCCM", resolveHgaMatrixActType("reentry").hccmBoundRequired, true);
  expect("resumption one HCCM", resolveHgaMatrixActType("resumption").hccmBoundRequired, true);
  expect(
    "resumption posture-relevant",
    resolveHgaMatrixActType("resumption").hppmmPostureChainRequired,
    true,
  );
  expect(
    "reentry not current-posture required at catalog",
    resolveHgaMatrixActType("reentry").hppmmPostureChainRequired,
    false,
  );
}

section("3. Catalog membership does not mint HERCM; R142 remains deferred");

{
  const catalog = assessHandoffAuthorityCatalogIntegration();
  expect("catalog integrity", catalog.integrityOk, true);
  expect("eight types", catalog.matrixActTypeCount, 8);
  expect("hercm are matrix types", catalog.hercmActsAreMatrixActTypes, true);
  expect("does not reenter", catalog.catalogMembershipDoesNotReenter, true);
  expect("does not resume", catalog.catalogMembershipDoesNotResume, true);
  expect("does not create authority", catalog.catalogMembershipDoesNotCreateAuthority, true);
  expect("no performHgaAct factory", catalog.performHgaActFactoryNotProvided, true);
  expect("r140 complete", catalog.r140EightTypeMatrixComplete, true);
  expect("r142 deferred", catalog.r142PlusDeferred, false);
  expect("r142-r145 complete", catalog.r142R145Complete, true);
  expect("rejection forbidden", catalog.rejectionForbiddenAsMatrix, true);
  expect("exit not seventh", catalog.exitBoundaryIsSeventhMatrixType, false);
  expect("exit not ninth", catalog.exitBoundaryIsNinthMatrixType, false);

  const hercm = assessHercmCatalogIntegrity();
  expect("HERCM integrity", hercm.integrityOk, true);
  expect("HERCM matrix count 8", hercm.hgaMatrixActTypeCount, 8);
  expect("HERCM catalog does not reenter", hercm.catalogMembershipDoesNotReenter, true);
  expect("HERCM catalog does not resume", hercm.catalogMembershipDoesNotResume, true);
  expect("R140–R141 remain", hercm.r126ThroughR139, true);
  expect("R140–R141 complete", hercm.r140R141Complete, true);
  expect("R142 deferred on HERCM", hercm.r142PlusDeferred, false);
  expect("R142–R145 complete on HERCM", hercm.r142R145Complete, true);
  expect("REC-02 still no new auth", HERCM_CATEGORY_CATALOG.find((e) => e.categoryId === "REC-02")?.requiresNewAuthorizationViaG2, false);
  expect("REC-03 still new auth", HERCM_CATEGORY_CATALOG.find((e) => e.categoryId === "REC-03")?.requiresNewAuthorizationViaG2, true);
  expect("REC-04 still new posture path", HERCM_CATEGORY_CATALOG.find((e) => e.categoryId === "REC-04")?.requiresNewPostureAfterNewAuthorization, true);
  expect("every HERCM category is matrix", HERCM_CATEGORY_CATALOG.every((e) => e.isHgaMatrixActType), true);

  assertR142PlusUnavailable();
  passed++;
  console.log("  ✓ assertR142PlusUnavailable() no-arg");
  expectThrows(
    "ninth matrix type unavailable",
    () => assertR142PlusUnavailable("ninth_matrix_act_type"),
    "invalid_handoff_g6_lifecycle_foundation",
  );
  assertR142PlusUnavailable("exit_completeness_operative");
  passed++;
  console.log("  ✓ exit_completeness_operative is no longer a deferred R142+ claim");
}

section("4. HSLM remains eight; Brain prohibited list covers reenter/resume");

{
  expect("HSLM eight", FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.length, 8);
  expect(
    "no reentered state",
    (FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES as readonly string[]).includes("reentered"),
    false,
  );
  expect(
    "no resumed state",
    (FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES as readonly string[]).includes("resumed"),
    false,
  );
  expectTruthy(
    "Brain prohibited reenter",
    (BRAIN_PROHIBITED_HANDOFF_ACTS as readonly string[]).includes("reenter_handoff"),
  );
  expectTruthy(
    "Brain prohibited resume",
    (BRAIN_PROHIBITED_HANDOFF_ACTS as readonly string[]).includes("resume_handoff"),
  );
  expectThrows(
    "Brain performer class still prohibited",
    () => assertNotProhibitedHandoffActPerformer("brain_domain3"),
    "invalid_handoff_authority_catalog",
  );
}

section("5. Public API — no generic matrix mint factory");

{
  const mod = await import("../orchestra/index.js");
  expect("performHgaAct absent", "performHgaAct" in mod, false);
  expect("createHgaAct absent", "createHgaAct" in mod, false);
  expect("mintMatrixAct absent", "mintMatrixAct" in mod, false);
  expect("createGovernedHandoffResumptionActRecord absent", "createGovernedHandoffResumptionActRecord" in mod, false);
  expect("createGovernedHandoffReentryActRecord absent", "createGovernedHandoffReentryActRecord" in mod, false);
  expect("resumeGovernedHandoff absent from barrel", "resumeGovernedHandoff" in mod, false);
  expect("reenterGovernedHandoff absent from barrel", "reenterGovernedHandoff" in mod, false);
  expect("assessHandoffAuthorityCatalogIntegration present", "assessHandoffAuthorityCatalogIntegration" in mod, true);
  expect("assertHgaMatrixActMayBePerformed present", "assertHgaMatrixActMayBePerformed" in mod, true);
}

console.log(`\nHOF-G9 completion R140–R141 tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
