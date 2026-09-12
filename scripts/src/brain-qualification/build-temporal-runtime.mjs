import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const defaultRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
/** Regenerate the bounded qualification bundle; importing this builder does nothing. */
export async function buildTemporalRuntime(repositoryRoot=defaultRoot,outputPath=resolve(repositoryRoot,'scripts/src/brain-qualification/temporal-runtime.mjs'),check=false){
 const require=createRequire(resolve(repositoryRoot,'artifacts/api-server/package.json')),{build}=require('esbuild');
 const result=await build({absWorkingDir:repositoryRoot,stdin:{contents:"export {evaluateOpportunityTemporal} from './artifacts/api-server/src/brain/temporal/index.ts'; import {createPgOpportunityTemporalHistoryRepository as factory} from './artifacts/api-server/src/brain/temporal/index.ts'; export function createPgOpportunityTemporalHistoryRepository(database){if(typeof database!=='function')throw Error('FAIL_CLOSED: explicit qualification database injection required');return factory(database);}",resolveDir:repositoryRoot,sourcefile:'qualification-temporal-entry.mjs'},bundle:true,platform:'node',format:'esm',packages:'external',target:'node24',tsconfigRaw:{},write:false,metafile:true,logLevel:'silent'});
 const sources=Object.keys(result.metafile.inputs).filter(p=>!p.endsWith('qualification-temporal-entry.mjs')).sort();
 const expected=['artifacts/api-server/src/brain/temporal/evaluateOpportunityTemporal.ts','artifacts/api-server/src/brain/temporal/index.ts','artifacts/api-server/src/brain/temporal/opportunityTemporalRepository.ts'];
 if(JSON.stringify(sources)!==JSON.stringify(expected))throw Error('FAIL_CLOSED: temporal bundle source scope changed');
 const sourceHashes=Object.fromEntries(sources.map(p=>[p,createHash('sha256').update(readFileSync(resolve(repositoryRoot,p))).digest('hex')]));
 const externalImports=[...new Set(Object.values(result.metafile.outputs).flatMap(o=>o.imports.map(i=>i.path)))].sort();
 if(JSON.stringify(externalImports)!==JSON.stringify(['@workspace/db','@workspace/db/schema','drizzle-orm','node:crypto']))throw Error('FAIL_CLOSED: temporal bundle external dependency scope changed');
 const content='// GENERATED qualification-only bundle. Regenerate with node scripts/src/brain-qualification/build-temporal-runtime.mjs\n// Production source SHA256: '+JSON.stringify(sourceHashes)+'\n'+result.outputFiles[0].text;
 if(check){if(readFileSync(outputPath,'utf8')!==content)throw Error('FAIL_CLOSED: temporal bundle regeneration mismatch');}else writeFileSync(outputPath,content);
 return {outputPath,sourceHashes,externalImports,sha256:createHash('sha256').update(content).digest('hex')};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const flags=process.argv.slice(2);if(flags.length>1||flags.some(x=>x!=='--check'))throw Error('Expected optional --check');console.log(JSON.stringify(await buildTemporalRuntime(defaultRoot,undefined,flags.includes('--check'))));}
