// @ts-ignore Explicit extension for native Node execution.
import {runLocalTypeScript} from './typescript-runner.ts';
const result=runLocalTypeScript(process.argv.slice(2),{cwd:process.cwd(),env:process.env});
if(result.error)throw result.error;
process.exitCode=result.status??1;
