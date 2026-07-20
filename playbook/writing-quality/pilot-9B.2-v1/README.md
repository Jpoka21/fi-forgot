# Sprint 9B.2 evaluation harness

Evaluation-only. Does **not** change production prompts.

**Does not write into** `playbook/writing-quality/pilot-9B.1-v2/` (frozen Framework V2 / Sprint 9B.1 PASS results).

## Production implementation under evaluation

Pinned in `run-pilot.mjs` as:

`PRODUCTION_IMPLEMENTATION_COMMIT = 0d47a18163c52a5c9f8773c86ccc3414c24b2e47`

That SHA is the Sprint 9B.2 temporary evaluation tip (professional Thank You anti-gratitude-stack). Later harness-only commits may advance `HEAD`; corpus metadata still records **0d47a18…** as the writing implementation under evaluation.

## Established tests (required before generation)

```bash
node playbook/writing-quality/pilot-9B.2-v1/run-established-tests.mjs
```

Expected: **316** unit assertions + existing harness self-checks + this Sprint 9B.2 harness self-check, all exit 0.

## Generate corpus (Replit)

```bash
git fetch origin
git checkout frontend-rebuild
git pull origin frontend-rebuild

git rev-parse HEAD
# expect: at least the harness commit that added pilot-9B.2-v1/ (API writing tip remains 0d47a18…)

node -e "import('./playbook/writing-quality/pilot-9B.2-v1/run-pilot.mjs').then(m => console.log(m.PRODUCTION_IMPLEMENTATION_COMMIT))"
# expect: 0d47a18163c52a5c9f8773c86ccc3414c24b2e47

pnpm --filter @workspace/api-server build
# restart API / Replit Run so generate-card is built from 0d47a18 writing tip

# optional:
# export PILOT_BASE_URL=http://127.0.0.1:PORT

node playbook/writing-quality/pilot-9B.2-v1/run-pilot.mjs --self-check
node playbook/writing-quality/pilot-9B.2-v1/run-pilot.mjs
```

Outputs write only under `playbook/writing-quality/pilot-9B.2-v1/`.

## Completion gate

`CORPUS.json` is evaluation-eligible only when:

- `status === "complete"`
- `evaluationEligible === true`
- `notForScoring === false`
- all 20 scenarios have `attempts === 1` and exactly one nonempty card
- IDs G01–G20 in order
- `provenance.productionImplementationCommit === 0d47a18163c52a5c9f8773c86ccc3414c24b2e47`

Blocked / partial outputs set `notForScoring: true` and must not be scored.
