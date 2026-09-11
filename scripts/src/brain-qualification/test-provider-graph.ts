/** Resolve the qualification import closure without executing application code. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname,relative,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../../..');
const localRequire=createRequire(resolve(root,'scripts/package.json'));
const ts=localRequire('typescript') as typeof import('typescript');
const pending=[resolve(root,'artifacts/api-server/src/qualification/router.ts')],seen=new Set<string>(),external=new Set<string>();
function resolveLocal(from:string,specifier:string):string|undefined {
  if(specifier.startsWith('@workspace/db'))return resolve(root,'lib/db/src/index.ts');
  if(!specifier.startsWith('.'))return undefined;
  const base=resolve(dirname(from),specifier);
  const sourceBase=base.replace(/\.js$/,'.ts');
  for(const candidate of [base,sourceBase,`${base}.ts`,`${base}.tsx`,resolve(base,'index.ts'),resolve(base,'index.tsx')])if(existsSync(candidate)&&statSync(candidate).isFile())return candidate;
  throw new Error(`Unresolved qualification import ${specifier} from ${relative(root,from)}`);
}
while(pending.length){
  const file=pending.pop()!;
  if(seen.has(file))continue;
  seen.add(file);
  for(const item of ts.preProcessFile(readFileSync(file,'utf8'),true,true).importedFiles){
    const local=resolveLocal(file,item.fileName);
    if(local)pending.push(local);else external.add(item.fileName);
  }
}
const inputs=[...seen].map(path=>relative(root,path).replaceAll('\\','/'));
for(const path of inputs)assert.ok(!/(lib\/openai|routes\/v2-recipients\.ts|webhook|business-scheduler|services\/follow-up-questions\.ts|seed-products|routes\/(stripe|approval|generate|demo-email))/.test(path),`Unsafe eager graph input: ${path}`);
for(const name of external)assert.ok(!/^(openai|stripe|stripe-replit-sync|@anthropic-ai|@sendgrid|resend|handwrytten|@sentry|posthog)/.test(name),`Unsafe provider import: ${name}`);
assert.ok(inputs.some(path=>path.endsWith('services/versioned-understanding-repository.ts')));
assert.ok(inputs.some(path=>path.endsWith('routes/v2-concierge.ts')));
assert.ok(!inputs.some(path=>path.endsWith('routes/index.ts')));
console.log(`Provider graph PASS: ${inputs.length} source modules resolved offline without execution; production Brain handlers retained`);
