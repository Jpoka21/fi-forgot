import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
// @ts-ignore Explicit runtime extension for native Node execution.
import {noDatabaseEnvironment} from './no-db-environment.ts';

/** Run the original tests with installed TypeScript and native Node; no identity shims. */
export function runLocalTypeScript(args:string[],options:{cwd?:string;env?:NodeJS.ProcessEnv;stdio?:'inherit'|'pipe'}={}) {
  const entryArgs=[...args];
  if(entryArgs[0]==='--tsconfig') {
    const expected=resolve(import.meta.dirname,'../../../artifacts/fi-forgot/tsconfig.json');
    if(resolve(options.cwd??process.cwd(),entryArgs[1]??'')!==expected)throw new Error('Unsupported test TypeScript configuration');
    entryArgs.splice(0,2);
  }
  if(entryArgs.length!==1||entryArgs[0].startsWith('-'))throw new Error('Expected exactly one test entry');
  const loader=pathToFileURL(resolve(import.meta.dirname,'native-typescript-loader.mjs')).href;
  return spawnSync(process.execPath,['--import',loader,resolve(options.cwd??process.cwd(),entryArgs[0])],{
    cwd:options.cwd,env:{...noDatabaseEnvironment(options.env),NODE_OPTIONS:`--import=${loader}`},
    stdio:options.stdio??'inherit',shell:false,encoding:options.stdio==='pipe'?'utf8':undefined,timeout:120000,
  });
}
