import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
// @ts-ignore Native runtime extension.
import {noDatabaseEnvironment} from './no-db-environment.ts';
const root=resolve(import.meta.dirname,'../../..');
const result=spawnSync(process.execPath,[resolve(import.meta.dirname,'runner.ts')],{cwd:root,env:noDatabaseEnvironment(),encoding:'utf8',shell:false,timeout:15000});
assert.equal(result.status,0,result.stderr);
const actual=JSON.parse(result.stdout);
assert.equal(actual.mode,'plan-only');
const documented=JSON.parse(readFileSync(resolve(root,'docs/brain-qualification-preparation/executable-plan.json'),'utf8'));
assert.deepEqual(actual,documented,'complete plan output drift: target, SQL hashes, command order/argv/env, authorization requirements or limitations');
const readme=readFileSync(resolve(root,'docs/brain-qualification-preparation/README.md'),'utf8');
const block=readme.split('<!-- executable-plan:start -->')[1]?.split('<!-- executable-plan:end -->')[0]?.trim();
assert.equal(block,'```json\n'+JSON.stringify(actual,null,2)+'\n```','README executable example differs from complete live plan-mode output');
console.log('Complete executable plan and README parity PASS: every command, argument, environment field, gate and recorded limitation; no execution');
