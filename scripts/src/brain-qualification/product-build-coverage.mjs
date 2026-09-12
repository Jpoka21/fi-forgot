import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

const SOURCE_EXTENSION = /\.(?:cts|mts|ts|tsx)$/;
const NON_RUNTIME_SOURCE = /(?:^|\/)(?:__tests__|test|tests|fixtures)(?:\/|$)|\.(?:test|spec|stories)\.(?:cts|mts|ts|tsx)$|\.d\.(?:cts|mts|ts)$/;
const LEGACY_PACKAGE = "@workspace/orchestra-execution";
const LEGACY_DIRECTORY = "lib/orchestra-execution";
const INSTALLED_TSC = resolve(dirname(fileURLToPath(import.meta.url)), "../../../node_modules/typescript/bin/tsc");

function slash(value) {
  return value.split(sep).join("/");
}

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules") return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

export function discoverWorkspacePackages(root) {
  const manifests = ["artifacts", "lib", "scripts"].flatMap((directory) =>
    walk(resolve(root, directory)).filter(
      (path) => path.endsWith(`${sep}package.json`) && !path.includes(`${sep}node_modules${sep}`),
    ),
  );
  const packages = new Map();
  for (const manifestPath of manifests) {
    const manifest = json(manifestPath);
    if (!manifest.name) continue;
    packages.set(manifest.name, {
      directory: dirname(manifestPath),
      manifest,
      relativeDirectory: slash(relative(root, dirname(manifestPath))),
    });
  }
  return packages;
}

export function workspaceEdges(packages, packageName) {
  const current = packages.get(packageName);
  if (!current) return [];
  const edges = [];
  for (const section of DEPENDENCY_SECTIONS) {
    for (const dependency of Object.keys(current.manifest[section] ?? {})) {
      if (packages.has(dependency)) edges.push({ dependency, section });
    }
  }
  return edges;
}

export function dependencyClosure(packages, roots) {
  const seen = new Set();
  const pending = [...roots];
  while (pending.length) {
    const packageName = pending.shift();
    if (seen.has(packageName)) continue;
    if (!packages.has(packageName)) throw new Error(`unknown workspace package ${packageName}`);
    seen.add(packageName);
    for (const { dependency } of workspaceEdges(packages, packageName)) pending.push(dependency);
  }
  return seen;
}

export function validateModel({ packages, productRoots, closure, rootReferences, compilerFiles }) {
  const failures = [];
  if (closure.has(LEGACY_PACKAGE)) failures.push(`${LEGACY_PACKAGE} is reachable from a product root`);
  if (rootReferences.has(LEGACY_DIRECTORY)) failures.push(`${LEGACY_DIRECTORY} is an active root TypeScript reference`);

  for (const packageName of productRoots) {
    const current = packages.get(packageName);
    if (!current.manifest.scripts?.build) failures.push(`${packageName} has no product build command`);
    if (!/\btsc\b/.test(current.manifest.scripts?.typecheck ?? "")) {
      failures.push(`${packageName} has no TypeScript typecheck command`);
    }
  }

  for (const packageName of closure) {
    const current = packages.get(packageName);
    if (current.relativeDirectory.startsWith("lib/") && !rootReferences.has(current.relativeDirectory)) {
      failures.push(`${packageName} is reachable but missing from root TypeScript references`);
    }
    const covered = compilerFiles.get(packageName) ?? new Set();
    for (const source of current.runtimeSources ?? []) {
      if (!covered.has(source)) failures.push(`${packageName} shipped source is excluded from TypeScript: ${source}`);
    }
  }
  return failures;
}

function configuredFiles(root, packageRecord) {
  const tsconfig = resolve(packageRecord.directory, "tsconfig.json");
  if (!existsSync(tsconfig)) throw new Error(`${packageRecord.manifest.name} has shipped source but no tsconfig.json`);
  const tsc = INSTALLED_TSC;
  if (!existsSync(tsc)) throw new Error("installed TypeScript compiler is unavailable");
  const result = spawnSync(process.execPath, [tsc, "--listFilesOnly", "-p", tsconfig], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`${packageRecord.manifest.name} TypeScript inventory failed:\n${result.stdout}${result.stderr}`);
  }
  return new Set(
    result.stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((path) => slash(relative(root, resolve(path)))),
  );
}

function sourceOwner(packages, source) {
  if (source.split("/").includes("node_modules")) return undefined;
  // Prefer the nearest package boundary for nested workspace packages.
  return [...packages].filter(([, current]) => source.startsWith(`${current.relativeDirectory}/`))
    .sort((a, b) => b[1].relativeDirectory.length - a[1].relativeDirectory.length)[0]?.[0];
}

export function assessRepository(root) {
  const packages = discoverWorkspacePackages(root);
  const productRoots = [...packages]
    .filter(([, value]) => value.relativeDirectory.startsWith("artifacts/") && value.manifest.scripts?.build)
    .map(([name]) => name)
    .sort();
  if (!productRoots.length) throw new Error("no buildable artifact product roots discovered");

  const closure = dependencyClosure(packages, productRoots);
  const rootConfig = json(resolve(root, "tsconfig.json"));
  const rootReferences = new Set(
    (rootConfig.references ?? []).map(({ path }) => slash(path.replace(/^\.\//, "").replace(/\/$/, ""))),
  );
  const compilerFiles = new Map();
  const resolvedFailures = [];
  // Set iteration visits new entries: both manifest edges and compiler-resolved
  // relative/alias imports extend the closure until no new package is found.
  for (const packageName of closure) {
    const current = packages.get(packageName);
    if (packageName === LEGACY_PACKAGE || current.relativeDirectory === LEGACY_DIRECTORY) {
      resolvedFailures.push(`${packageName} is reachable legacy Orchestra source`);
      continue;
    }
    current.runtimeSources = walk(resolve(current.directory, "src"))
      .filter((path) => SOURCE_EXTENSION.test(path))
      .map((path) => slash(relative(root, path)))
      .filter((path) => !NON_RUNTIME_SOURCE.test(path));
    if (current.runtimeSources.length) {
      const files = configuredFiles(root, current);
      compilerFiles.set(packageName, files);
      for (const source of files) {
        if (source.startsWith(`${LEGACY_DIRECTORY}/`)) {
          resolvedFailures.push(`${packageName} resolves legacy Orchestra source: ${source}`);
        }
        const owner = sourceOwner(packages, source);
        if (owner) {
          for (const dependency of dependencyClosure(packages, [owner])) closure.add(dependency);
        }
      }
    }
  }

  const failures = validateModel({ packages, productRoots, closure, rootReferences, compilerFiles });
  failures.push(...resolvedFailures);
  if (failures.length) throw new Error(`PRODUCT_BUILD_COVERAGE_FAILED\n- ${failures.join("\n- ")}`);
  return {
    productRoots,
    closure: [...closure].sort(),
    rootReferences: [...rootReferences].sort(),
    coveredRuntimeSourceCount: [...closure].reduce(
      (sum, packageName) => sum + (packages.get(packageName).runtimeSources?.length ?? 0),
      0,
    ),
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  try {
    const result = assessRepository(root);
    process.stdout.write(`${JSON.stringify({ status: "PASS", ...result }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
