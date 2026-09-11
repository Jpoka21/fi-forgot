/** Existing production tests, launched from their required repository root. No live qualification. */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
// @ts-ignore Node's built-in type stripping uses explicit runtime extensions.
import {noDatabaseEnvironment} from './no-db-environment.ts';
// @ts-ignore Explicit runtime extension for Node built-in stripping.
import{runLocalTypeScript}from'./typescript-runner.ts';
const root=resolve(import.meta.dirname,'../../..');
const groups:Record<string,string[]>={
  integration:[
    'artifacts/api-server/src/__tests__/opportunity-feedback-integration.test.ts',
    'artifacts/api-server/src/__tests__/opportunity-follow-through-integration.test.ts',
    'artifacts/api-server/src/__tests__/opportunity-temporal-integration.test.ts',
  ],
  regression:[
    'artifacts/api-server/src/__tests__/concierge-brain-workspace.test.ts',
    'artifacts/api-server/src/__tests__/versioned-understanding-lifecycle.test.ts',
    'artifacts/api-server/src/__tests__/evolving-understanding-lifecycle.test.ts',
    'artifacts/fi-forgot/src/__tests__/concierge-opportunity-conversation.test.ts',
  ],
};
const name=process.argv[2];
if(process.argv.length!==3||!Object.hasOwn(groups,name??''))throw new Error('Expected integration or regression test group');
const env=noDatabaseEnvironment();
env.BRAIN_QUALIFICATION_MODE='false';env.BRAIN_QUALIFICATION_NO_EXTERNAL='true';
for(const file of groups[name]){
  const args:string[]=[];
  if(file.startsWith('artifacts/fi-forgot/'))args.push('--tsconfig',resolve(root,'artifacts/fi-forgot/tsconfig.json'));
  args.push(resolve(root,file));
  const result=runLocalTypeScript(args,{cwd:root,env,stdio:'inherit'});
  if(result.error||result.status!==0)throw new Error(`Offline ${name} failed: ${file}`);
}
console.log(`Existing ${name} group passed; synthetic/in-process evidence only`);
