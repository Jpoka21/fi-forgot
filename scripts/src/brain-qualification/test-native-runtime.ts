import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
// @ts-ignore Native runtime extension.
import {noDatabaseEnvironment} from './no-db-environment.ts';
const probe=`const os=require('node:os');let user;try{user=os.userInfo()}catch(e){user={error:e.code}};console.log(JSON.stringify({geteuid:typeof process.geteuid,uid:process.geteuid?.(),user}));`;
const loader=pathToFileURL(resolve(import.meta.dirname,'native-typescript-loader.mjs')).href;
const baseline=spawnSync(process.execPath,['-e',probe],{env:noDatabaseEnvironment(),encoding:'utf8',shell:false});
const loaded=spawnSync(process.execPath,['--import',loader,'-e',probe],{env:noDatabaseEnvironment(),encoding:'utf8',shell:false});
assert.equal(baseline.status,0);assert.equal(loaded.status,0,loaded.stderr);
assert.deepEqual(JSON.parse(loaded.stdout),JSON.parse(baseline.stdout),'native test loader must preserve OS identity APIs including their errors');
console.log('Native compiler loader preserves actual OS identity API behavior; no credentials or user values emitted');
