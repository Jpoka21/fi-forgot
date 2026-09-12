import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url)),
  repository = resolve(here, "../../../.."),
  sourceRoot = resolve(repository, "artifacts/fi-forgot/src"),
  fixture = resolve(here, "question-input-hook-fixture.tsx"),
  hook = resolve(
    sourceRoot,
    "app/question-intelligence/hooks/useRecipientConciergeQuestion.ts",
  );
const require = createRequire(
    resolve(repository, "artifacts/api-server/package.json"),
  ),
  { build } = require("esbuild"),
  hash = (value) => createHash("sha256").update(value).digest("hex");
const react = resolve(
    repository,
    "node_modules/.pnpm/react@19.1.0/node_modules/react",
  ),
  reactDom = resolve(
    repository,
    "node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom",
  );
const scheduler = resolve(
  repository,
  "node_modules/.pnpm/scheduler@0.26.0/node_modules/scheduler",
);
const dataAdapter = `const d=()=>globalThis.__questionInputData;export const getRecipient=(...a)=>d().getRecipient(...a),getCards=(...a)=>d().getCards(...a),getApiHeaders=(...a)=>d().getApiHeaders(...a),getServerUserId=(...a)=>d().getServerUserId(...a);`;
const filePath = (base) => {
  for (const candidate of [
    base,
    base + ".js",
    base + ".ts",
    base + ".tsx",
    resolve(base, "index.js"),
    resolve(base, "index.ts"),
    resolve(base, "index.tsx"),
  ])
    if (existsSync(candidate)) return candidate;
  throw new Error(`unresolved fixture source ${base}`);
};
const sourcePath = (value) => filePath(resolve(sourceRoot, value));
const result = await build({
  absWorkingDir: repository,
  stdin: {
    contents: readFileSync(fixture, "utf8"),
    resolveDir: here,
    sourcefile: "question-input-hook-fixture.tsx",
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "chrome120",
  jsx: "automatic",
  metafile: true,
  sourcemap: false,
  logLevel: "silent",
  plugins: [
    {
      name: "question-input-fixture",
      setup(build) {
      build.onResolve({ filter: /^react$/ }, () => ({
        path: resolve(react, "index.js"),
      }));
      build.onResolve({ filter: /^react-dom$/ }, () => ({
        path: resolve(reactDom, "index.js"),
      }));
        build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
          path: resolve(react, "jsx-runtime.js"),
        }));
        build.onResolve({ filter: /^react-dom\/client$/ }, () => ({
          path: resolve(reactDom, "client.js"),
        }));
        build.onResolve({ filter: /^scheduler$/ }, () => ({
          path: resolve(scheduler, "index.js"),
        }));
        build.onResolve({ filter: /^@\/lib\/data$/ }, () => ({
          path: "data-adapter",
          namespace: "fixture",
        }));
        build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents: dataAdapter,
          loader: "js",
        }));
        build.onResolve({ filter: /^@\// }, (args) => ({
          path: sourcePath(args.path.slice(2)),
        }));
        build.onResolve({ filter: /^\./ }, (args) => ({
          path: filePath(resolve(args.resolveDir, args.path)),
        }));
      },
    },
  ],
});
assert.equal(result.outputFiles.length, 1);
const bytes = result.outputFiles[0].contents,
  inputs = Object.keys(result.metafile.inputs).sort();
assert.ok(
  inputs.some((path) => path.endsWith("useRecipientConciergeQuestion.ts")),
);
assert.ok(inputs.some((path) => path.includes("react-dom")));
assert.ok(inputs.some((path) => path.includes("react/")));
assert.deepEqual(Object.values(result.metafile.outputs).flatMap(output => output.imports), []);
const inputFile = path => {
  if (path === "question-input-hook-fixture.tsx") return fixture;
  for (const candidate of [resolve(repository,path),resolve(repository,"scripts",path)]) if(existsSync(candidate)) return candidate;
  throw new Error(`unresolved metafile input ${path}`);
};
const inputHash = path => path.startsWith("fixture:") ? hash(dataAdapter) : hash(readFileSync(inputFile(path)));
const manifest = {
  kind: "QUESTION-INPUT-HOOK-FIXTURE",
  fixtureHash: hash(readFileSync(fixture)),
  builderHash: hash(readFileSync(fileURLToPath(import.meta.url))),
  hookHash: hash(readFileSync(hook)),
  lockHash: hash(readFileSync(resolve(repository, "pnpm-lock.yaml"))),
  bundleHash: hash(bytes),
  bundleBytes: bytes.length,
  inputs: inputs.map((path) => ({
    path: path.startsWith("fixture:") ? path : inputFile(path).replace(repository+"\\","").replaceAll("\\", "/"),
    hash: inputHash(path),
  })),
};
const outputDirectory=resolve(repository,"artifacts/fi-forgot/dist/qualification"),bundlePath=resolve(outputDirectory,"question-input-hook.js"),manifestPath=resolve(outputDirectory,"question-input-hook.manifest.json"),manifestBytes=Buffer.from(JSON.stringify(manifest)+"\n");
if(process.argv.includes("--write")){mkdirSync(outputDirectory,{recursive:true});writeFileSync(bundlePath,bytes);writeFileSync(manifestPath,manifestBytes);}
if(process.argv.includes("--check")){assert.equal(hash(readFileSync(bundlePath)),manifest.bundleHash);assert.deepEqual(readFileSync(manifestPath),manifestBytes);}
if (process.argv.includes("--json"))
  process.stdout.write(JSON.stringify(manifest));
else
  console.log(
    `Question input mounted-hook fixture build PASS ${manifest.bundleHash} ${manifest.bundleBytes} bytes ${manifest.inputs.length} inputs`,
  );
export { bytes, manifest };
