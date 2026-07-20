# Writing Evaluation Framework V2 harness

Evaluation-only. Does **not** change production prompts.

## Production implementation under evaluation

Pinned in `run-pilot.mjs` as:

`PRODUCTION_IMPLEMENTATION_COMMIT = 2aab24385168438b12500e33d23443d662d75a63`

Later harness-only commits on `frontend-rebuild` may advance `HEAD`. Corpus metadata still records **2aab243…** as the writing implementation being evaluated.

## Established tests (required before generation)

```bash
node playbook/writing-quality/pilot-9B.1-v2/run-established-tests.mjs
```

Expected: **290** unit assertions passed + harness self-checks exit 0.

## Generate corpus (Replit)

```bash
git fetch origin
git checkout frontend-rebuild
git pull origin frontend-rebuild

# Confirm production pin still matches evaluated writing tip:
node -e "import('./playbook/writing-quality/pilot-9B.1-v2/run-pilot.mjs').then(m => console.log(m.PRODUCTION_IMPLEMENTATION_COMMIT))"
# expect: 2aab24385168438b12500e33d23443d662d75a63

# Confirm api-server writing contract at that commit is what the running server built from
# (pull + rebuild from frontend-rebuild; do not swap prompts).

pnpm --filter @workspace/api-server build
# restart API / Replit Run

# optional:
# export PILOT_BASE_URL=http://127.0.0.1:PORT

node playbook/writing-quality/pilot-9B.1-v2/run-pilot.mjs --self-check
node playbook/writing-quality/pilot-9B.1-v2/run-pilot.mjs
```

## Completion gate

`CORPUS.json` is evaluation-eligible only when:

- `status === "complete"`
- `evaluationEligible === true`
- `notForScoring === false`
- all 20 scenarios have `attempts === 1` and exactly one nonempty card
- `provenance.productionImplementationCommit === 2aab243…`

Blocked / partial outputs set `notForScoring: true` and must not be scored.

## Outputs (local / Replit only — do not commit until reviewed)

- `CORPUS.json` / `CORPUS.md`
- `BLOCKER.md` when blocked/partial
- later: `SCORES_V2.csv`, `SCORING_AGGREGATES.json`, `PILOT_FINDINGS_V2.md`, `V1_V2_COMPARISON.md`

Never writes into `playbook/writing-quality/pilot-9A.2/`.
