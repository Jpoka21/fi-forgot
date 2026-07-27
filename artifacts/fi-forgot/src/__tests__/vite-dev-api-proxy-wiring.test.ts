/**
 * Vite development API proxy wiring tests.
 *
 * Run with:
 *   pnpm dlx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/vite-dev-api-proxy-wiring.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const VITE_CONFIG_PATH = join(TEST_DIR, "..", "..", "vite.config.ts");
const viteConfig = readFileSync(VITE_CONFIG_PATH, "utf8");

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expectTrue(label: string, condition: boolean): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

section("required environment validation");
{
  expectTrue(
    "PORT validation remains",
    viteConfig.includes('process.env.PORT') &&
      viteConfig.includes(
        "PORT environment variable is required but was not provided.",
      ),
  );
  expectTrue(
    "BASE_PATH validation remains",
    viteConfig.includes('process.env.BASE_PATH') &&
      viteConfig.includes(
        "BASE_PATH environment variable is required but was not provided.",
      ),
  );
}

section("development api proxy");
{
  expectTrue(
    "reads API_PROXY_TARGET from environment",
    viteConfig.includes("process.env.API_PROXY_TARGET"),
  );
  expectTrue(
    "defines /api proxy route",
    /["']\/api["']\s*:\s*\{/.test(viteConfig),
  );
  expectTrue(
    "proxy target uses API_PROXY_TARGET",
    viteConfig.includes("target: apiProxyTarget"),
  );
  expectTrue(
    "proxy is attached to dev server only",
    viteConfig.includes("...(devApiProxy ? { proxy: devApiProxy } : {})"),
  );
  expectTrue(
    "/api path is preserved (no rewrite stripping prefix)",
    !viteConfig.includes("rewrite:"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
