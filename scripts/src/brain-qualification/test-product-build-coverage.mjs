import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { assessRepository, dependencyClosure, validateModel, workspaceEdges } from "./product-build-coverage.mjs";

function record(relativeDirectory, manifest = {}, runtimeSources = []) {
  return { relativeDirectory, manifest: { scripts: {}, ...manifest }, runtimeSources };
}

const packages = new Map([
  ["@workspace/app", record("artifacts/app", {
    scripts: { build: "vite build", typecheck: "tsc -p tsconfig.json --noEmit" },
    devDependencies: { "@workspace/dev-lib": "workspace:*" },
  }, ["artifacts/app/src/main.ts"])],
  ["@workspace/dev-lib", record("lib/dev-lib", {
    optionalDependencies: { "@workspace/optional-lib": "workspace:*" },
  }, ["lib/dev-lib/src/index.ts"])],
  ["@workspace/optional-lib", record("lib/optional-lib", {}, ["lib/optional-lib/src/index.ts"])],
  ["@workspace/orchestra-execution", record("lib/orchestra-execution")],
]);

assert.deepEqual(workspaceEdges(packages, "@workspace/app"), [
  { dependency: "@workspace/dev-lib", section: "devDependencies" },
]);
const closure = dependencyClosure(packages, ["@workspace/app"]);
assert.deepEqual([...closure], ["@workspace/app", "@workspace/dev-lib", "@workspace/optional-lib"]);

const covered = new Map([
  ["@workspace/app", new Set(["artifacts/app/src/main.ts"])],
  ["@workspace/dev-lib", new Set(["lib/dev-lib/src/index.ts"])],
  ["@workspace/optional-lib", new Set(["lib/optional-lib/src/index.ts"])],
]);
const references = new Set(["lib/dev-lib", "lib/optional-lib"]);
assert.deepEqual(validateModel({ packages, productRoots: ["@workspace/app"], closure, rootReferences: references, compilerFiles: covered }), []);

assert.match(
  validateModel({ packages, productRoots: ["@workspace/app"], closure, rootReferences: new Set(), compilerFiles: covered }).join("\n"),
  /missing from root TypeScript references/,
);

const missingSource = new Map(covered);
missingSource.set("@workspace/app", new Set());
assert.match(
  validateModel({ packages, productRoots: ["@workspace/app"], closure, rootReferences: references, compilerFiles: missingSource }).join("\n"),
  /shipped source is excluded from TypeScript/,
);

const legacyClosure = new Set([...closure, "@workspace/orchestra-execution"]);
assert.match(
  validateModel({ packages, productRoots: ["@workspace/app"], closure: legacyClosure, rootReferences: references, compilerFiles: covered }).join("\n"),
  /is reachable from a product root/,
);

assert.match(
  validateModel({ packages, productRoots: ["@workspace/app"], closure, rootReferences: new Set([...references, "lib/orchestra-execution"]), compilerFiles: covered }).join("\n"),
  /active root TypeScript reference/,
);

// Exercise the installed compiler and real files: no manifest edge advertises
// the alias import, and a relative import in that library reaches legacy code.
const scratchParent = resolve(tmpdir());
const scratch = mkdtempSync(join(scratchParent, "fi-product-coverage-"));
function write(path, value) {
  const destination = join(scratch, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, typeof value === "string" ? value : JSON.stringify(value));
}
try {
  write("artifacts/app/package.json", { name: "@workspace/app", scripts: { build: "vite build", typecheck: "tsc -p tsconfig.json --noEmit" } });
  write("lib/hidden/package.json", { name: "@workspace/hidden" });
  write("lib/orchestra-execution/package.json", { name: "@workspace/orchestra-execution" });
  const compilerOptions = { target: "es2022", module: "esnext", moduleResolution: "bundler", types: [], noEmit: true };
  write("artifacts/app/tsconfig.json", { compilerOptions: { ...compilerOptions, paths: { "@hidden": ["../../lib/hidden/src/index.ts"] } }, include: ["src"] });
  write("lib/hidden/tsconfig.json", { compilerOptions, include: ["src"] });
  write("artifacts/app/src/main.ts", 'export { value } from "@hidden";\n');
  write("lib/hidden/src/index.ts", "export const value = 1;\n");
  write("lib/orchestra-execution/src/index.ts", "export const legacy = 1;\n");
  write("tsconfig.json", { files: [], references: [] });
  assert.throws(() => assessRepository(scratch), /@workspace\/hidden is reachable but missing from root TypeScript references/);

  write("tsconfig.json", { files: [], references: [{ path: "./lib/hidden" }] });
  assert.deepEqual(assessRepository(scratch).closure, ["@workspace/app", "@workspace/hidden"]);

  write("lib/hidden/src/excluded.ts", "export const uncovered = 2;\n");
  write("lib/hidden/tsconfig.json", { compilerOptions, files: ["src/index.ts"] });
  assert.throws(() => assessRepository(scratch), /shipped source is excluded from TypeScript: lib\/hidden\/src\/excluded.ts/);
  write("lib/hidden/tsconfig.json", { compilerOptions, include: ["src"] });

  write("lib/hidden/src/index.ts", 'export const value = 1;\nexport { legacy } from "../../orchestra-execution/src/index";\n');
  assert.throws(() => assessRepository(scratch), /resolves legacy Orchestra source/);
} finally {
  const checked = resolve(scratch);
  if (!checked.startsWith(`${scratchParent}${sep}fi-product-coverage-`)) throw new Error("unexpected scratch cleanup path");
  rmSync(checked, { recursive: true, force: true });
}

process.stdout.write("product build coverage model and compiler-backed negative cases: PASS\n");
