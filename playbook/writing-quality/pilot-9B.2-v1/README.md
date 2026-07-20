# Sprint 9B.2 evaluation — FAIL (historical evidence)

**Determination: FAIL**  
**Implementation rejected.** Do **not** treat commit `0d47a18163c52a5c9f8773c86ccc3414c24b2e47` as accepted production writing behavior.

This directory preserves a completed controlled evaluation of a temporary professional Thank You anti-gratitude-stack tip. Sprint 9B.2 remains open as a problem statement; this first implementation is closed as rejected.

## Evaluated production tip (rejected)

`productionImplementationCommit = 0d47a18163c52a5c9f8773c86ccc3414c24b2e47`

Harness commit at generation: `f4493899a8016df98b7a8277c3972a18528f9124`

## Evaluation contract (honored)

- Frozen golden scenarios from `GOLDEN_SCENARIO_SET_V1.json` (G01–G20)
- One request per scenario
- First returned card only
- Zero retries / no regeneration
- No Rewrite / New Version / cherry-picking
- Guest vs `authenticated_body` fidelity preserved
- Framework V1 scorecard unchanged
- Outputs only under this directory (never overwrote `pilot-9B.1-v2/`)

## Result summary

| Metric | 9B.2 | 9B.1 V2 baseline |
|--------|------|------------------|
| Soft mean | 4.42 | 4.43 |
| Would Send | 19/20 (95%) | 19/20 (95%) |
| Hard Fails | 0 | 0 |
| G11 Would Send | **No** (target miss) | No |
| G11 `P-UNIFORM-SENTENCES` | **Still present** | Present |

Acceptance gate failed: G11 did not flip to Would Send Yes / did not lose `P-UNIFORM-SENTENCES`; soft protect dips on G07/G17.

## Artifacts

| File | Role |
|------|------|
| `CORPUS.json` / `CORPUS.md` | Frozen live generation (complete, evaluationEligible) |
| `SCORES_9B2.csv` | Per-scenario Framework V1 scores |
| `SCORING_AGGREGATES_9B2.json` | Aggregates + acceptance flags |
| `PILOT_FINDINGS_9B2.md` | Full findings |
| `V2_9B2_COMPARISON.md` | Direct comparison to accepted 9B.1 V2 |

## Production baseline after rejection

Production writing was restored to the accepted Sprint 9B.1 baseline via `git revert` of `0d47a18…`. Do not reintroduce this tip without a new implementation and a fresh harness run.

Harness runners (`run-pilot.mjs`, `run-established-tests.mjs`) remain for historical reproduction / self-check only. After the production tip was reverted, use `playbook/writing-quality/pilot-9B.1-v2/run-established-tests.mjs` (expected **290** unit assertions) for the restored Sprint 9B.1 production baseline. The 9B.2 runner’s **316** expectation reflected the temporary tip’s extra unit asserts and is historical. Do not treat a new local generation against current `HEAD` as a re-score of this rejected tip unless `HEAD` again implements that exact SHA.
