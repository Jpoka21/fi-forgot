# Sprint 9B.2 attempt 2 — targeted evaluation panel

**Targeted panel only.** Do **not** run the full 20-scenario corpus from this harness.

**Does not write into** `pilot-9B.1-v2/` (frozen PASS) or `pilot-9B.2-v1/` (attempt 1 FAIL evidence).

## Production implementation under evaluation

Pinned in `run-pilot.mjs` as:

`PRODUCTION_IMPLEMENTATION_COMMIT = b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4`

Sprint 9B.2 attempt 2: professional Thank You body / sign-off boundary (hard final-body sentence rule when sign-off is gratitude-bearing).

## Panel IDs (exactly seven)

`G11`, `G13`, `G02`, `G04`, `G07`, `G17`, `G16`

- **G11** — primary target (Coworker Thank You)
- **G13** — gated protect (Teacher Thank You + support)
- **G02** — gate-off control (Mom Thank You)
- **G04**, **G07**, **G17** — protect band
- **G16** — prior 9B.1 send Yes hold (auth Mom Thank You)

## Established tests (required before generation)

```bash
node playbook/writing-quality/pilot-9B.2-v2-panel/run-established-tests.mjs
```

Expected: **315** unit assertions + harness self-checks, all exit 0.

## Generate panel (Replit)

```bash
git fetch origin
git checkout frontend-rebuild
git pull origin frontend-rebuild

git rev-parse HEAD
# expect: at least the harness commit that added pilot-9B.2-v2-panel/

node -e "import('./playbook/writing-quality/pilot-9B.2-v2-panel/run-pilot.mjs').then(m => console.log(m.PRODUCTION_IMPLEMENTATION_COMMIT))"
# expect: b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4

pnpm --filter @workspace/api-server build
# restart API / Replit Run so generate-card is built from b9bc2ac writing tip

node playbook/writing-quality/pilot-9B.2-v2-panel/run-established-tests.mjs
node playbook/writing-quality/pilot-9B.2-v2-panel/run-pilot.mjs --self-check
node playbook/writing-quality/pilot-9B.2-v2-panel/run-pilot.mjs
```

Outputs write only under `playbook/writing-quality/pilot-9B.2-v2-panel/`.

**Do not** run `pilot-9B.2-v1/run-pilot.mjs` (full 20) until the panel passes review.

## Completion gate

`CORPUS.json` is evaluation-eligible only when:

- `status === "complete"`
- `evaluationEligible === true`
- `notForScoring === false`
- exactly **7** scenarios with IDs **G11, G13, G02, G04, G07, G17, G16** in that order
- `attempts === 1` each, exactly one nonempty card each
- `provenance.productionImplementationCommit === b9bc2ac50437d480a519eb5d0a55dc8b3d1861e4`

Blocked / partial outputs set `notForScoring: true` and must not be scored.
