# Product build coverage contract

## Disposition

`lib/orchestra-execution` is retained standalone legacy controller tooling. It is not a shipped F.I. Forgot application dependency: no buildable artifact declares it in dependencies, devDependencies, peerDependencies or optionalDependencies, and no reachable shipped source imports it. The repository launcher delegates exclusively to the authoritative shared controller at `C:/Users/James.Massaro/Projects/orchestra-2`. The legacy package remains in the workspace and keeps its own typecheck and test commands, but its historical source is not part of Brain/application build qualification.

The stale root `tsconfig.json` project reference was the only edge pulling the legacy package into the product typecheck and has been removed. Historical tooling can still be checked explicitly with `pnpm --filter @workspace/orchestra-execution run typecheck` and `pnpm --filter @workspace/orchestra-execution run test`. Its known historical type failures are not corrected or claimed accepted by this product build change.

## Product graph

Every buildable package under `artifacts/*` remains covered, including the API server, F.I. Forgot frontend and developer mockup artifact. No artifact is excluded from the existing verification contract.

The product closure follows workspace-package edges declared in all four dependency sections:

- `dependencies`
- `devDependencies`
- `peerDependencies`
- `optionalDependencies`

The closure also follows actual compiler-resolved file ownership, including relative imports and TypeScript aliases absent from package manifests. Each newly reached workspace package contributes its manifest dependencies and compiler inventory until the closure stops growing. This covers the database, API validation, events and React API-client libraries. External packages remain compiler/bundler inputs but are not workspace project-reference nodes.

## Executable regression

`scripts/src/brain-qualification/product-build-coverage.mjs` fails closed unless:

1. every discovered product root has a build command and a TypeScript typecheck command;
2. every reachable workspace library appears in root TypeScript project references;
3. the installed TypeScript compiler reports every non-test TypeScript source under each reachable package's `src` directory as included by its package configuration;
4. no product dependency edge, root project reference or reachable source import points to the legacy embedded Orchestra package; and
5. dependency discovery includes development and optional workspace edges, preventing those less-obvious build inputs from escaping coverage.

`test-product-build-coverage.mjs` supplies negative cases for missing project references, excluded shipped source, reachable legacy dependencies and a stale legacy root reference. It also proves transitive discovery through development and optional dependencies. Temporary filesystem cases exercise the installed compiler: an undeclared alias import requires library coverage, exclusion of a real source fails, and a relative import through that library into legacy code is rejected by resolved path.

This contract establishes build/static coverage only. It does not prove PostgreSQL persistence, browser behavior, authentication, deployment or the owner workflow.
