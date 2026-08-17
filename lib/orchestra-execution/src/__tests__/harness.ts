export let passed = 0;
export let failed = 0;
export const failures: string[] = [];

export function expect(label: string, actual: unknown, expected: unknown): void {
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
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
  }
}

export function expectTrue(label: string, actual: boolean): void {
  expect(label, actual, true);
}

export function expectFalse(label: string, actual: boolean): void {
  expect(label, actual, false);
}

export function section(name: string): void {
  console.log(`\n${name}`);
}

export function reportAndExit(): void {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failures:");
    for (const failure of failures) console.log(` - ${failure}`);
    process.exit(1);
  }
}
