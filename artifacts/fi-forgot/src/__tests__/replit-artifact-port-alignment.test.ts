/**
 * Replit development ingress port alignment tests.
 *
 * Run with:
 *   pnpm dlx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/replit-artifact-port-alignment.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FI_FORGOT_ROOT = join(TEST_DIR, "..", "..");
const REPO_ROOT = join(FI_FORGOT_ROOT, "..", "..");

const API_ARTIFACT = readFileSync(
  join(REPO_ROOT, "artifacts/api-server/.replit-artifact/artifact.toml"),
  "utf8",
);
const WEB_ARTIFACT = readFileSync(
  join(FI_FORGOT_ROOT, ".replit-artifact/artifact.toml"),
  "utf8",
);
const ENV_EXAMPLE = readFileSync(join(FI_FORGOT_ROOT, ".env.example"), "utf8");
const VITE_CONFIG = readFileSync(join(FI_FORGOT_ROOT, "vite.config.ts"), "utf8");

const EXPECTED_API_PROXY_TARGET = "http://127.0.0.1:8080";

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

section("api artifact development port");
{
  expectTrue("api localPort is 8080", /localPort\s*=\s*8080/.test(API_ARTIFACT));
  expectTrue(
    "api services env sets PORT to 8080",
    /\[services\.env\][\s\S]*PORT\s*=\s*"8080"/.test(API_ARTIFACT),
  );
  expectTrue("api paths remain /api", API_ARTIFACT.includes('paths = ["/api"]'));
}

section("web artifact proxy target");
{
  expectTrue(
    "web API_PROXY_TARGET points to 8080",
    WEB_ARTIFACT.includes(`API_PROXY_TARGET = "${EXPECTED_API_PROXY_TARGET}"`),
  );
  expectTrue("web PORT remains 25460", WEB_ARTIFACT.includes('PORT = "25460"'));
  expectTrue("web BASE_PATH remains /", WEB_ARTIFACT.includes('BASE_PATH = "/"'));
}

section("environment example alignment");
{
  expectTrue(
    ".env.example documents API_PROXY_TARGET on 8080",
    ENV_EXAMPLE.includes(`API_PROXY_TARGET=${EXPECTED_API_PROXY_TARGET}`),
  );
  expectTrue(".env.example PORT remains 25460", ENV_EXAMPLE.includes("PORT=25460"));
  expectTrue(".env.example BASE_PATH remains /", ENV_EXAMPLE.includes("BASE_PATH=/"));
}

section("vite development proxy contract");
{
  expectTrue(
    "vite reads API_PROXY_TARGET from environment",
    VITE_CONFIG.includes("process.env.API_PROXY_TARGET"),
  );
  expectTrue(
    "vite defines /api proxy route",
    /["']\/api["']\s*:\s*\{/.test(VITE_CONFIG),
  );
  expectTrue(
    "/api path is preserved (no rewrite stripping prefix)",
    !VITE_CONFIG.includes("rewrite:"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
