import { spawnSync } from "node:child_process";
// @ts-ignore Node's built-in type stripping uses explicit runtime extensions.
import {noDatabaseEnvironment} from './no-db-environment.ts';
const admitted=["brain-qualification:verify-static","brain-qualification:test","brain-qualification:verify-fixtures","brain-qualification:regression"];
for(const script of admitted){
  const result=spawnSync("pnpm",["run",script],{cwd:new URL("../..",import.meta.url),stdio:"inherit",shell:process.platform==="win32",env:noDatabaseEnvironment()});
  if(result.status!==0)throw new Error(`${script} failed without external execution`);
}
console.log("brain qualification no-DB gate: PASS; real workflow evidence deliberately unresolved");
