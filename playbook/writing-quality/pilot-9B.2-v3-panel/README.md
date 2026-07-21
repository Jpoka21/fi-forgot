# Sprint 9B.2 attempt 3 — targeted evaluation panel

**Targeted panel only.** Do **not** run the full 20-scenario corpus from this harness.

**Does not write into** `pilot-9B.1-v2/` (frozen PASS), `pilot-9B.2-v1/` (attempt 1 FAIL), or `pilot-9B.2-v2-panel/` (attempt 2 scored evidence).

## Production implementation under evaluation

Pinned in `run-pilot.mjs` as:

`PRODUCTION_IMPLEMENTATION_COMMIT = 38e1d74fd3a2825703b78d9638877bf8743fd395`

Sprint 9B.2 attempt 3: professional Thank You gratitude-stack deterministic post-process (no prompt change).

## Panel IDs (exactly seven)

`G11`, `G13`, `G02`, `G04`, `G07`, `G17`, `G16`

## Established tests (required before generation)

```bash
node playbook/writing-quality/pilot-9B.2-v3-panel/run-established-tests.mjs
```

Expected: **370** unit assertions + harness self-checks, all exit 0.

## Generate panel (Replit)

```bash
node artifacts/api-server/build.mjs
# restart API with Replit secrets (DATABASE_URL, OPENAI_API_KEY)

node playbook/writing-quality/pilot-9B.2-v3-panel/run-established-tests.mjs
node playbook/writing-quality/pilot-9B.2-v3-panel/run-pilot.mjs --self-check
node playbook/writing-quality/pilot-9B.2-v3-panel/run-pilot.mjs
```

Outputs write only under `playbook/writing-quality/pilot-9B.2-v3-panel/`.

## Completion gate

`CORPUS.json` is evaluation-eligible only when:

- `status === "complete"`
- `evaluationEligible === true`
- `notForScoring === false`
- exactly **7** scenarios with IDs **G11, G13, G02, G04, G07, G17, G16** in that order
- `attempts === 1` each, exactly one nonempty card each
- `provenance.productionImplementationCommit === 38e1d74fd3a2825703b78d9638877bf8743fd395`
